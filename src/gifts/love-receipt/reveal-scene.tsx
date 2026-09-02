'use client';

/**
 * VIEWER-LANDING PROTOTYPE — the thermal-printer tear scene.
 *
 * ISOLATED: nothing here is wired into the live receiver. It renders the REAL
 * <ReceiptPaper> (same component, same payload shape) inside a Y2K counter
 * scene, so what you tear off is the actual receipt, not a mock of one.
 *
 * The receipt hangs from the printer slot, still attached along a perforation.
 * The viewer drags the handle sideways to rip it free.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { ReceiptPaper } from './receipt-paper';
import type { ReceiptPayload } from './lines';

// ── TUNING KNOBS — retune by feel ──────────────────────────────────────────
/** Release below this fraction of the tear and it springs straight back. */
export const TEAR_SNAP_BACK = 0.55;
/** Release at or past this fraction and the receipt tears off for good. */
export const TEAR_COMMIT = 0.82;
/**
 * Resistance past {@link TEAR_SNAP_BACK}: the drag travels only this fraction
 * as far, so the last stretch of the perforation feels like it fights back.
 * 1 = no resistance. Reaching COMMIT takes ~98% of the slip's width at 0.62.
 */
export const TEAR_RESISTANCE = 0.62;
/** How far one arrow-key press advances the tear (keyboard parity). */
export const TEAR_KEY_STEP = 0.14;

// Timings (ms).
const SPRING_BACK_MS = 420;
const DROP_MS = 620;
const PULSE_DELAY_MS = 520;

// ── PRINTER ASSET + SLOT GEOMETRY — retune to match the artwork ────────────
/**
 * The 3/4-angle printer. If the file is missing the scene falls back to the
 * built-in CSS printer, so the route never renders broken.
 */
export const PRINTER_SRC = '/stickers/scene/printer-lavender.png';
/** Rendered width of the printer, px. */
export const PRINTER_W = 360;
/**
 * The slot seam, as a fraction of the printer image's HEIGHT (0 = top edge).
 * This is where the paper appears AND where the tear line sits — the two are
 * the same seam by design, so retuning this moves both together.
 */
export const SLOT_Y = 0.62;
/** Slot centre and width, as fractions of the image WIDTH. */
export const SLOT_X = 0.5;
export const SLOT_W = 0.84;
/** Forward crest — the slip leans toward the viewer instead of lying flat. */
export const PAPER_CREST_DEG = 9;
export const PAPER_PERSPECTIVE = 620;
/** Slight roll so the slip isn't perfectly square to the printer. */
export const PAPER_ROLL_DEG = -0.8;
/**
 * Whether the emerging paper draws in FRONT of the printer body or behind it.
 * A 3/4 asset normally wants 'front' — real paper drapes over the front face —
 * but flip to 'behind' if the artwork has a raised front lip to tuck under.
 */
export const PAPER_LAYER: 'front' | 'behind' = 'front';

/** ReceiptPaper's own width; the slip is scaled from this to fit the slot. */
const RECEIPT_W = 300;

// ── Y2K palette — app tokens, no unlicensed fonts ──────────────────────────
const LAVENDER = '#c8a2e8';
const LAVENDER_DEEP = '#a072d0';
const HOT_PINK = '#ff69b4';
const MAGENTA = '#ff1493';
const INK_DARK = '#1a0a2e';
const PRINTER_SHELL = '#e8e2f4';
const PRINTER_SHELL_DARK = '#bdb2d6';
const VT = "var(--font-vt323), 'Courier New', monospace";

/** Where the sender's name appears. Flip this one line to try the other. */
export type SenderNamePlacement = 'above-printer' | 'on-receipt';
export const SENDER_NAME_PLACEMENT: SenderNamePlacement = 'above-printer';

/** Torn top edge, as a clip-path polygon with a ragged zigzag along the top. */
const TORN_EDGE_CLIP = (() => {
  const teeth = 34;
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) {
    const x = ((i / teeth) * 100).toFixed(2);
    // alternate the tooth depth a little so the rip is not a perfect sawtooth
    const y = i % 2 === 0 ? 0 : i % 3 === 0 ? 5 : 3.5;
    pts.push(`${x}% ${y}px`);
  }
  pts.push('100% 100%', '0% 100%');
  return `polygon(${pts.join(', ')})`;
})();

export interface RevealSceneProps {
  payload: ReceiptPayload;
  senderName?: string;
  senderNamePlacement?: SenderNamePlacement;
  /** Stubbed for now — the reply loop is not built yet. */
  onTearOneBack?: () => void;
}

type Phase = 'attached' | 'tearing' | 'torn';

export function RevealScene({
  payload,
  senderName,
  senderNamePlacement = SENDER_NAME_PLACEMENT,
  onTearOneBack,
}: RevealSceneProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>('attached');
  const [springing, setSpringing] = useState(false);
  const [ctaIn, setCtaIn] = useState(false);
  /** null = still loading, false = missing (use the CSS printer), true = ready */
  const [assetOk, setAssetOk] = useState<boolean | null>(null);
  const [printerH, setPrinterH] = useState(0);

  const railRef = useRef<HTMLDivElement | null>(null);
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; width: number } | null>(null);
  const printerImgRef = useRef<HTMLImageElement | null>(null);

  // A cached image can finish loading BEFORE React attaches onLoad, in which
  // case that handler never fires and the scene would silently keep the CSS
  // fallback geometry. Settle it from `complete` on mount, and re-measure the
  // printer's height on resize so the slot seam stays put at any width.
  useEffect(() => {
    const el = printerImgRef.current;
    if (!el) return;
    const settle = () => {
      if (!el.complete) return;
      if (el.naturalWidth > 0) {
        setAssetOk(true);
        setPrinterH(el.offsetHeight);
      } else {
        setAssetOk(false);
      }
    };
    settle();
    const onResize = () => {
      if (el.complete && el.naturalWidth > 0) setPrinterH(el.offsetHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const reduced = usePrefersReducedMotion();

  const name = (senderName ?? payload.senderName ?? '').trim();
  const showNameAbove = !!name && senderNamePlacement === 'above-printer';

  // 'on-receipt' prints "from <name>" as the receipt's FIRST line. Done on the
  // payload so the real component renders it — no changes to ReceiptPaper.
  const effectivePayload = useMemo<ReceiptPayload>(() => {
    if (!name || senderNamePlacement !== 'on-receipt') return payload;
    return {
      ...payload,
      lines: [
        { id: '__from__', text: `from ${name}`, price: '' },
        ...payload.lines,
      ],
    };
  }, [payload, name, senderNamePlacement]);

  // ── the tear gesture ─────────────────────────────────────────────────────
  const applyResistance = useCallback((raw: number) => {
    const clamped = Math.max(0, Math.min(1, raw));
    if (clamped <= TEAR_SNAP_BACK) return clamped;
    return TEAR_SNAP_BACK + (clamped - TEAR_SNAP_BACK) * TEAR_RESISTANCE;
  }, []);

  const commitTear = useCallback(() => {
    setSpringing(false);
    setProgress(1);
    setPhase('torn');
  }, []);

  const releaseAt = useCallback(
    (p: number) => {
      dragRef.current = null;
      if (p >= TEAR_COMMIT) {
        commitTear();
        return;
      }
      // Anything short of COMMIT springs back — the perforation holds.
      setSpringing(true);
      setProgress(0);
      setPhase('attached');
      window.setTimeout(() => setSpringing(false), SPRING_BACK_MS);
    },
    [commitTear],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (phase === 'torn') return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const width = railRef.current?.getBoundingClientRect().width ?? 300;
      dragRef.current = { startX: e.clientX, width };
      setSpringing(false);
      setPhase('tearing');
    },
    [phase],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const d = dragRef.current;
      if (!d || phase === 'torn') return;
      const raw = (e.clientX - d.startX) / d.width;
      setProgress(applyResistance(raw));
    },
    [applyResistance, phase],
  );

  const onPointerUp = useCallback(() => {
    if (!dragRef.current) return;
    releaseAt(progress);
  }, [progress, releaseAt]);

  // Keyboard parity: arrows nudge the tear, Enter/Space rips it straight off.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (phase === 'torn') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        commitTear();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        setPhase('tearing');
        setProgress((p) => {
          const next = Math.min(1, p + TEAR_KEY_STEP);
          if (next >= TEAR_COMMIT) {
            window.setTimeout(commitTear, 0);
          }
          return next;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        setProgress((p) => Math.max(0, p - TEAR_KEY_STEP));
      }
    },
    [commitTear, phase],
  );

  // ── payoff: pulse the TOTAL row once the slip is free ────────────────────
  // Located by DOM query rather than a prop so ReceiptPaper stays untouched.
  useEffect(() => {
    if (phase !== 'torn') return;
    const root = receiptRef.current;
    if (!root) return;
    const t = window.setTimeout(() => {
      const spans = Array.from(root.querySelectorAll('span'));
      const label = spans.find((s) => s.textContent?.trim() === 'Total');
      // The label's PARENT is the flex row holding "Total" + its value. Its
      // grandparent also wraps the PAID VIA line, which must not pulse.
      const row = label?.parentElement;
      if (row instanceof HTMLElement) row.classList.add('lr-total-pulse');
    }, PULSE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'torn') return;
    const t = window.setTimeout(() => setCtaIn(true), PULSE_DELAY_MS + 380);
    return () => window.clearTimeout(t);
  }, [phase]);

  // ── derived visuals ──────────────────────────────────────────────────────
  const torn = phase === 'torn';
  const ripPct = Math.round(Math.min(1, progress) * 100);
  const past = progress >= TEAR_SNAP_BACK;
  // The slip is scaled to the slot's width, so retuning SLOT_W to match the
  // artwork makes the paper fit the slot without touching anything else.
  const paperScale = assetOk ? (PRINTER_W * SLOT_W) / RECEIPT_W : 1;

  const paperStyle: CSSProperties = {
    transition: springing
      ? `transform ${SPRING_BACK_MS}ms cubic-bezier(.22,1.2,.36,1)`
      : torn && !reduced
        ? `transform ${DROP_MS}ms cubic-bezier(.2,.8,.25,1)`
        : 'none',
    transform: torn
      ? 'translateY(26px) rotate(-1.1deg)'
      : `translateY(${progress * 5}px) rotate(${progress * 1.4}deg)`,
    transformOrigin: 'top center',
    clipPath: torn ? TORN_EDGE_CLIP : undefined,
  };

  return (
    <div style={styles.scene}>
      <style>{SCENE_CSS}</style>

      {/* ── the counter the printer sits on ── */}
      <div style={styles.counter}>
        {/* The tabletop is projected in perspective, which flares its bottom edge
            well past the viewport — clip it, or the page scrolls sideways. */}
        <div style={styles.counterTopClip} aria-hidden>
          <div style={styles.counterTop} />
        </div>

        {/* small props — tasteful, not busy */}
        <div style={styles.plant} aria-hidden>
          <span style={styles.plantLeafA} />
          <span style={styles.plantLeafB} />
          <span style={styles.plantPot} />
        </div>
        <div style={styles.sticker} aria-hidden>
          <span style={{ fontFamily: VT, fontSize: 13, color: INK_DARK }}>
            100%
            <br />
            REAL
          </span>
        </div>

        {showNameAbove ? <p style={styles.fromAbove}>from {name}</p> : null}

        {/* ── the printer ── */}
        {/* The image is probed rather than trusted: if the asset has not been
            dropped in yet, `assetOk` goes false and the CSS printer renders,
            so this route never shows a broken image. */}
        {assetOk !== false ? (
          <div style={styles.printerStage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={printerImgRef}
              src={PRINTER_SRC}
              alt=""
              aria-hidden
              style={styles.printerImg}
              onLoad={(e) => {
                setAssetOk(true);
                setPrinterH(e.currentTarget.offsetHeight);
              }}
              onError={() => setAssetOk(false)}
            />
            <span
              style={{
                ...styles.ledOnAsset,
                background: torn ? '#57e08a' : HOT_PINK,
                boxShadow: `0 0 8px ${torn ? '#57e08a' : HOT_PINK}`,
              }}
              className={torn ? undefined : 'lr-led'}
              aria-hidden
            />
          </div>
        ) : (
          <div style={styles.printer}>
            <div style={styles.printerTop} aria-hidden>
              <span style={styles.printerBrand}>DELULU MART</span>
              <span
                style={{
                  ...styles.led,
                  background: torn ? '#57e08a' : HOT_PINK,
                  boxShadow: `0 0 7px ${torn ? '#57e08a' : HOT_PINK}`,
                }}
                className={torn ? undefined : 'lr-led'}
                aria-hidden
              />
            </div>
            <div style={styles.slot} aria-hidden>
              <span style={styles.slotMouth} />
            </div>
          </div>
        )}

        {/* ── the paper fed through the slot ── */}
        <div
          style={{
            ...styles.paperColumn,
            ...(assetOk
              ? {
                  // pull the column up so its TOP edge lands on the slot seam
                  marginTop: -printerH * (1 - SLOT_Y),
                  width: PRINTER_W * SLOT_W,
                  zIndex: PAPER_LAYER === 'front' ? 4 : 1,
                }
              : null),
          }}
        >
          {/* The stub only makes sense on the CSS printer, whose slot is a flat
              bar. With real artwork the paper vanishes into the slot instead. */}
          {!assetOk ? <div style={styles.stub} aria-hidden /> : null}

          {!torn ? (
            // With artwork the seam IS the slot, so the rail sits at the very
            // top of the column; the CSS printer keeps it below the stub.
            <div style={{ ...styles.railWrap, top: assetOk ? 0 : 24 }}>
              <div ref={railRef} style={styles.rail} aria-hidden>
                {/* the perforation: dashed while intact, opening as you pull */}
                <span style={styles.perfLine} />
                <span
                  style={{
                    ...styles.perfRip,
                    width: `${ripPct}%`,
                    opacity: progress > 0.02 ? 1 : 0,
                  }}
                />
              </div>

              <button
                type="button"
                role="slider"
                aria-label="Slide to tear the receipt off"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={ripPct}
                aria-valuetext={`${ripPct}% torn`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={onKeyDown}
                className="lr-handle"
                style={{
                  ...styles.handle,
                  left: `${ripPct}%`,
                  transition: springing
                    ? `left ${SPRING_BACK_MS}ms cubic-bezier(.22,1.2,.36,1)`
                    : 'none',
                  background: past
                    ? `linear-gradient(180deg, ${MAGENTA}, #cc1177)`
                    : `linear-gradient(180deg, ${HOT_PINK}, ${MAGENTA})`,
                }}
              >
                <span style={styles.handleGrip} aria-hidden />
              </button>
            </div>
          ) : null}

          {/* Clip at the slot seam: the crest tilts the slip's head backwards,
              and this hides whatever rises above the seam so the paper reads as
              disappearing INTO the printer. Released once torn, so the free slip
              (and its wobble) is never cropped. */}
          <div
            style={{
              ...styles.paperClip,
              overflow: torn ? 'visible' : 'hidden',
            }}
          >
            <div
              style={
                assetOk
                  ? {
                      transform:
                        `perspective(${PAPER_PERSPECTIVE}px) ` +
                        `rotateX(${PAPER_CREST_DEG}deg) ` +
                        `rotate(${PAPER_ROLL_DEG}deg) ` +
                        `scale(${paperScale.toFixed(4)})`,
                      transformOrigin: 'top center',
                    }
                  : undefined
              }
            >
              <div
                ref={receiptRef}
                style={paperStyle}
                className={torn && !reduced ? 'lr-wobble' : undefined}
              >
                <ReceiptPaper payload={effectivePayload} />
              </div>
            </div>
          </div>
        </div>

        {!torn ? (
          <p style={styles.hint}>
            {past ? 'keep going —' : 'slide the tab'} to tear it off
          </p>
        ) : null}

        {torn ? (
          <div
            style={{
              ...styles.ctaWrap,
              opacity: ctaIn ? 1 : 0,
              transform: ctaIn ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <button
              type="button"
              className="lr-cta"
              style={styles.cta}
              onClick={onTearOneBack}
            >
              tear one back
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── prefers-reduced-motion ───────────────────────────────────────────────────
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

// ── keyframes + focus states (scoped by class name) ─────────────────────────
const SCENE_CSS = `
.lr-handle:focus-visible {
  outline: 3px solid ${INK_DARK};
  outline-offset: 3px;
}
.lr-cta:focus-visible {
  outline: 3px solid ${INK_DARK};
  outline-offset: 3px;
}
@keyframes lr-led-blink {
  0%, 62% { opacity: 1; }
  63%, 100% { opacity: .28; }
}
.lr-led { animation: lr-led-blink 1.5s steps(1, end) infinite; }
@keyframes lr-wobble-kf {
  0%   { transform: translateY(26px) rotate(-1.1deg); }
  28%  { transform: translateY(26px) rotate(1.5deg); }
  52%  { transform: translateY(26px) rotate(-.9deg); }
  74%  { transform: translateY(26px) rotate(.5deg); }
  100% { transform: translateY(26px) rotate(-1.1deg); }
}
.lr-wobble { animation: lr-wobble-kf 1150ms cubic-bezier(.3,.7,.4,1) 1; }
@keyframes lr-total-pulse-kf {
  0%   { background: transparent; box-shadow: none; }
  22%  { background: rgba(255,105,180,.30); box-shadow: 0 0 0 5px rgba(255,105,180,.30); }
  100% { background: transparent; box-shadow: none; }
}
.lr-total-pulse { animation: lr-total-pulse-kf 1250ms ease-out 2; border-radius: 3px; }
@media (prefers-reduced-motion: reduce) {
  .lr-led, .lr-wobble, .lr-total-pulse { animation: none !important; }
  .lr-handle, .lr-cta { transition: none !important; }
}
`;

// ── styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  scene: {
    minHeight: '100vh',
    // the room behind the counter
    background: `radial-gradient(120% 70% at 50% 0%, #f3e6ff 0%, ${LAVENDER} 58%, ${LAVENDER_DEEP} 100%)`,
    padding: '0 0 90px',
    display: 'flex',
    justifyContent: 'center',
  },
  counter: {
    position: 'relative',
    width: '100%',
    maxWidth: 460,
    padding: '30px 16px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // clips the perspective flare so the page never scrolls sideways
  counterTopClip: {
    position: 'absolute',
    top: 128,
    left: 0,
    right: 0,
    height: 220,
    overflow: 'hidden',
    zIndex: 0,
  },
  // the tabletop: a soft lavender checker with depth toward the horizon
  counterTop: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `repeating-conic-gradient(${LAVENDER_DEEP} 0% 25%, #dcc8f2 0% 50%)`,
    backgroundSize: '38px 38px',
    opacity: 0.55,
    transform: 'perspective(260px) rotateX(52deg)',
    transformOrigin: 'top center',
    borderTop: `2px solid rgba(255,255,255,.5)`,
  },
  // Props sit on the counter BESIDE the hanging slip — at phone width there is
  // no room either side of the printer itself, so they'd just peek out as slivers.
  plant: {
    position: 'absolute',
    top: 286,
    left: 2,
    width: 34,
    height: 46,
    zIndex: 1,
  },
  plantLeafA: {
    position: 'absolute',
    left: 6,
    top: 0,
    width: 12,
    height: 24,
    borderRadius: '60% 10% 60% 10%',
    background: '#79c98d',
    transform: 'rotate(-18deg)',
    display: 'block',
  },
  plantLeafB: {
    position: 'absolute',
    left: 15,
    top: 3,
    width: 12,
    height: 22,
    borderRadius: '10% 60% 10% 60%',
    background: '#5fb377',
    transform: 'rotate(16deg)',
    display: 'block',
  },
  plantPot: {
    position: 'absolute',
    left: 4,
    bottom: 0,
    width: 26,
    height: 20,
    background: `linear-gradient(180deg, ${HOT_PINK}, #d84a92)`,
    borderRadius: '3px 3px 7px 7px',
    display: 'block',
  },
  sticker: {
    position: 'absolute',
    top: 292,
    right: 7, // clears its own 2px drop shadow; at 3 the page scrolled 1px
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#fff8bd',
    border: `2px solid ${INK_DARK}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    lineHeight: 1,
    transform: 'rotate(-12deg)',
    boxShadow: '2px 3px 0 rgba(26,10,46,.35)',
    zIndex: 1,
  },
  fromAbove: {
    position: 'relative',
    zIndex: 2,
    fontFamily: VT,
    fontSize: 22,
    color: INK_DARK,
    letterSpacing: '.04em',
    marginBottom: 8,
    textShadow: '1px 1px 0 rgba(255,255,255,.6)',
  },
  // ── real printer artwork ──
  printerStage: {
    position: 'relative',
    zIndex: 3,
    width: PRINTER_W,
    maxWidth: '100%',
    lineHeight: 0,
    filter: 'drop-shadow(0 14px 22px rgba(26,10,46,.34))',
  },
  printerImg: {
    display: 'block',
    width: '100%',
    height: 'auto',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  // status light, floated over the artwork (tune to the asset's own lamp)
  ledOnAsset: {
    position: 'absolute',
    top: `${SLOT_Y * 100 - 22}%`,
    right: '12%',
    width: 9,
    height: 9,
    borderRadius: '50%',
    display: 'block',
  },
  paperClip: {
    position: 'relative',
    width: '100%',
  },
  // ── CSS fallback printer ──
  printer: {
    position: 'relative',
    zIndex: 2,
    width: 340,
    maxWidth: '100%',
    borderRadius: '14px 14px 8px 8px',
    background: `linear-gradient(180deg, #f6f2ff 0%, ${PRINTER_SHELL} 62%, ${PRINTER_SHELL_DARK} 100%)`,
    border: `2px solid ${INK_DARK}`,
    boxShadow: `0 10px 0 -2px ${PRINTER_SHELL_DARK}, 0 16px 26px rgba(26,10,46,.34)`,
    padding: '10px 12px 14px',
  },
  printerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  printerBrand: {
    fontFamily: VT,
    fontSize: 19,
    letterSpacing: '.12em',
    color: INK_DARK,
  },
  led: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    border: `1.5px solid ${INK_DARK}`,
    display: 'block',
  },
  slot: {
    position: 'relative',
    height: 20,
    borderRadius: 5,
    background: `linear-gradient(180deg, #3a2b52, ${INK_DARK})`,
    border: `2px solid ${INK_DARK}`,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    boxShadow: 'inset 0 4px 7px rgba(0,0,0,.55)',
  },
  slotMouth: {
    width: '86%',
    height: 4,
    borderRadius: 2,
    background: 'rgba(255,255,255,.16)',
    marginBottom: 3,
    display: 'block',
  },
  paperColumn: {
    position: 'relative',
    zIndex: 3,
    width: 300,
    maxWidth: '86vw',
    marginTop: -12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // paper still in the printer — the dark inset at its top sells the slot
  stub: {
    width: '100%',
    height: 24,
    background: `linear-gradient(180deg, #d9d6cd 0%, ${'#fbfbf9'} 68%)`,
    boxShadow:
      'inset 0 7px 9px -7px rgba(0,0,0,.7), 0 1px 0 rgba(26,10,46,.10)',
  },
  // Zero-height overlay pinned to the stub's bottom edge, so stub + receipt stay
  // one continuous strip of paper with the perforation drawn across it.
  railWrap: {
    position: 'absolute',
    top: 24,
    left: 0,
    right: 0,
    height: 0,
    zIndex: 5,
  },
  rail: {
    position: 'relative',
    width: '100%',
    height: 0,
  },
  perfLine: {
    position: 'absolute',
    inset: 0,
    borderTop: `2px dashed ${LAVENDER_DEEP}`,
    display: 'block',
  },
  perfRip: {
    position: 'absolute',
    left: 0,
    top: -1,
    height: 4,
    background: `linear-gradient(90deg, rgba(255,255,255,0), #fff 40%)`,
    display: 'block',
    transition: 'opacity 140ms linear',
  },
  handle: {
    position: 'absolute',
    top: 0,
    width: 46,
    height: 30,
    marginLeft: -23,
    marginTop: -15,
    borderRadius: 7,
    border: `2px solid ${INK_DARK}`,
    boxShadow: `2px 3px 0 rgba(26,10,46,.45)`,
    cursor: 'grab',
    touchAction: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleGrip: {
    width: 18,
    height: 12,
    display: 'block',
    background:
      'repeating-linear-gradient(90deg, rgba(255,255,255,.85) 0 2px, transparent 2px 5px)',
  },
  hint: {
    position: 'relative',
    zIndex: 2,
    marginTop: 16,
    fontFamily: VT,
    fontSize: 19,
    letterSpacing: '.05em',
    color: INK_DARK,
    opacity: 0.85,
  },
  ctaWrap: {
    position: 'relative',
    zIndex: 4,
    marginTop: 30,
    transition: 'opacity 460ms ease, transform 460ms ease',
  },
  cta: {
    fontFamily: VT,
    fontSize: 23,
    letterSpacing: '.06em',
    color: '#fff',
    padding: '9px 26px',
    background: `linear-gradient(180deg, ${HOT_PINK}, ${MAGENTA})`,
    border: `2px solid ${INK_DARK}`,
    borderRadius: 9,
    boxShadow: `3px 4px 0 rgba(26,10,46,.5)`,
    cursor: 'var(--cursor-hand)',
  },
};
