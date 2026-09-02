'use client';

/**
 * VIEWER-LANDING PROTOTYPE — the ORDER-CONFIRMATION framing.
 *
 * ISOLATED: nothing here touches the live receiver, the schema, or the DB. It is
 * a second framing to compare against the tear scene (see reveal-scene.tsx).
 *
 * Two beats:
 *   1. an e-commerce order confirmation that never names the buyer ("someone")
 *   2. the REAL <ReceiptPaper>, printing down, where the name is finally revealed
 *
 * The withheld name is the whole trick: beat 1 sets up "who?!", beat 2 answers it
 * on the paper itself.
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

// ── PREMISE COPY — tune the cheesiness here ────────────────────────────────
/** Beat 1 lead. Never names the sender: that is beat 2's payoff. */
export const ORDER_LEAD = 'someone just bought your heart <3';
export const ORDER_FINE = "all sales final. you're theirs now <3";
export const ORDER_STATUS = 'PAID IN FULL';
export const CTA_LABEL = 'view your receipt';
export const ORDER_HEADLINE = 'ORDER CONFIRMED';
export const ORDER_NUMBER = '4EVER-001';
export const ORDER_ITEM = 'your heart ×1';
/** Beat 2's payoff line, printed into the receipt's meta block. */
export const PURCHASED_BY_LABEL = 'Purchased by';
export const REPLY_CTA_LABEL = 'buy their heart back';

// ── timings (ms) ───────────────────────────────────────────────────────────
const PRINT_MS = 1500;
const PULSE_AFTER_PRINT_MS = 260;
const CTA_AFTER_PULSE_MS = 420;

// ── Y2K palette — app tokens only, no unlicensed fonts ─────────────────────
const LAVENDER = '#c8a2e8';
const LAVENDER_DEEP = '#a072d0';
const HOT_PINK = '#ff69b4';
const MAGENTA = '#ff1493';
const ORCHID = '#ba55d3';
const INK_DARK = '#1a0a2e';
const CHROME = '#c0c0c0';
const CHROME_LIGHT = '#dfdfdf';
const CHROME_DARK = '#808080';
const MINT = '#3fcf7f';
const MINT_DEEP = '#2aa862';
const VT = "var(--font-vt323), 'Courier New', monospace";
const MASTHEAD =
  "var(--font-archivo-black), 'Arial Black', Helvetica, Arial, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, 'Courier New', monospace";

export type Beat = 1 | 2;

export interface OrderRevealProps {
  payload: ReceiptPayload;
  senderName: string;
  /** Jump straight in on a given beat — the dev bar's ?beat=2 shortcut. */
  startBeat?: Beat;
  /** Stubbed for now — the reply loop is not built yet. */
  onReplyClick?: () => void;
}

export function OrderReveal({
  payload,
  senderName,
  startBeat = 1,
  onReplyClick,
}: OrderRevealProps) {
  const [beat, setBeat] = useState<Beat>(startBeat);
  // Always starts un-printed, even when jumping straight to beat 2: the point of
  // the ?beat=2 shortcut is to watch the print-down over and over.
  const [printed, setPrinted] = useState(false);
  const [ctaIn, setCtaIn] = useState(false);
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const name = senderName.trim();

  // The payoff line, threaded through ReceiptPaper's PREVIEW-ONLY `metaExtra`
  // so the component's own meta block renders it (no fork of the receipt).
  const metaExtra = useMemo(
    () => (name ? `${PURCHASED_BY_LABEL}: ${name}` : null),
    [name],
  );

  const goToReceipt = useCallback(() => {
    setBeat(2);
    setPrinted(false);
  }, []);

  const replay = useCallback(() => {
    setCtaIn(false);
    setPrinted(false);
    setBeat(1);
    const root = receiptRef.current;
    root?.querySelector('.lr-total-pulse')?.classList.remove('lr-total-pulse');
  }, []);

  // Drive the print-down, then the TOTAL payoff, then the reply CTA.
  useEffect(() => {
    if (beat !== 2) return;
    const dur = reduced ? 0 : PRINT_MS;
    const t1 = window.setTimeout(() => setPrinted(true), 30);

    const t2 = window.setTimeout(() => {
      const root = receiptRef.current;
      if (root) {
        const label = Array.from(root.querySelectorAll('span')).find(
          (s) => s.textContent?.trim() === 'Total',
        );
        // the label's PARENT is the TOTAL row; its grandparent also wraps PAID VIA
        const row = label?.parentElement;
        if (row instanceof HTMLElement) row.classList.add('lr-total-pulse');
      }
    }, dur + PULSE_AFTER_PRINT_MS);

    const t3 = window.setTimeout(
      () => setCtaIn(true),
      dur + PULSE_AFTER_PRINT_MS + CTA_AFTER_PULSE_MS,
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [beat, reduced]);

  return (
    <div style={styles.scene}>
      <style>{SCENE_CSS}</style>

      {beat === 1 ? (
        <section style={styles.panel} aria-labelledby="order-headline">
          <div style={styles.titlebar}>
            <span style={styles.titlebarText}>HONEYHEARTS CHECKOUT</span>
            <span style={styles.titlebarBtns} aria-hidden>
              <i style={styles.titlebarBtn} />
              <i style={styles.titlebarBtn} />
              <i style={styles.titlebarBtn} />
            </span>
          </div>

          <div style={styles.panelBody}>
            <div style={styles.checkWrap} aria-hidden>
              <svg viewBox="0 0 48 48" style={styles.checkSvg}>
                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  fill={MINT}
                  stroke={INK_DARK}
                  strokeWidth="2.5"
                />
                <path
                  d="M14 25.5 L21 32 L34 17"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 id="order-headline" style={styles.headline}>
              {ORDER_HEADLINE}
            </h1>
            <p style={styles.lead}>{ORDER_LEAD}</p>

            <dl style={styles.card}>
              <div style={styles.cardRow}>
                <dt style={styles.cardKey}>ORDER</dt>
                <dd style={styles.cardVal}>#{ORDER_NUMBER}</dd>
              </div>
              <div style={styles.cardRow}>
                <dt style={styles.cardKey}>ITEM</dt>
                <dd style={styles.cardVal}>{ORDER_ITEM}</dd>
              </div>
              <div style={styles.cardRow}>
                <dt style={styles.cardKey}>STATUS</dt>
                <dd
                  style={{
                    ...styles.cardVal,
                    color: MINT_DEEP,
                    fontWeight: 700,
                  }}
                >
                  {ORDER_STATUS}
                </dd>
              </div>
            </dl>

            <p style={styles.fine}>{ORDER_FINE}</p>

            <button
              type="button"
              className="lr-btn"
              style={styles.cta}
              onClick={goToReceipt}
            >
              {CTA_LABEL}
            </button>
          </div>
        </section>
      ) : (
        <section style={styles.receiptBeat} aria-label="Your receipt">
          <div
            ref={receiptRef}
            style={{
              ...styles.printWrap,
              // print-down: the slip is revealed top-to-bottom by a clip that
              // retracts from the bottom. Deliberately NOT the tear gesture.
              clipPath: printed ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
              transition: reduced
                ? 'none'
                : `clip-path ${PRINT_MS}ms cubic-bezier(.32,.72,.36,1)`,
            }}
          >
            <ReceiptPaper payload={payload} metaExtra={metaExtra} />
          </div>

          <div
            style={{
              ...styles.replyWrap,
              opacity: ctaIn ? 1 : 0,
              transform: ctaIn ? 'translateY(0)' : 'translateY(8px)',
              pointerEvents: ctaIn ? 'auto' : 'none',
            }}
          >
            <button
              type="button"
              className="lr-btn"
              style={styles.cta}
              onClick={onReplyClick}
            >
              {REPLY_CTA_LABEL}
            </button>
            <button
              type="button"
              className="lr-link"
              style={styles.replayBtn}
              onClick={replay}
            >
              replay
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

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

const SCENE_CSS = `
.lr-btn:focus-visible, .lr-link:focus-visible {
  outline: 3px solid ${INK_DARK};
  outline-offset: 3px;
}
.lr-btn:active { transform: translate(1px, 2px); box-shadow: 1px 1px 0 rgba(26,10,46,.5); }
@keyframes lr-total-pulse-kf {
  0%   { background: transparent; box-shadow: none; }
  22%  { background: rgba(255,105,180,.30); box-shadow: 0 0 0 5px rgba(255,105,180,.30); }
  100% { background: transparent; box-shadow: none; }
}
.lr-total-pulse { animation: lr-total-pulse-kf 1250ms ease-out 2; border-radius: 3px; }
@media (prefers-reduced-motion: reduce) {
  .lr-total-pulse { animation: none !important; background: rgba(255,105,180,.28); }
  .lr-btn:active { transform: none; }
}
`;

const styles: Record<string, CSSProperties> = {
  scene: {
    minHeight: '100vh',
    background: `radial-gradient(120% 70% at 50% 0%, #f3e6ff 0%, ${LAVENDER} 58%, ${LAVENDER_DEEP} 100%)`,
    padding: '26px 14px 110px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  // ── beat 1: the Win98-ish confirmation dialog ──
  panel: {
    width: '100%',
    maxWidth: 360,
    background: CHROME,
    border: `2px solid ${INK_DARK}`,
    borderTopColor: CHROME_LIGHT,
    borderLeftColor: CHROME_LIGHT,
    boxShadow: `4px 6px 0 rgba(26,10,46,.45)`,
  },
  titlebar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 5px',
    background: `linear-gradient(90deg, ${HOT_PINK}, ${ORCHID})`,
    borderBottom: `2px solid ${CHROME_DARK}`,
  },
  titlebarText: {
    fontFamily: VT,
    fontSize: 16,
    letterSpacing: '.09em',
    color: '#fff',
  },
  titlebarBtns: { display: 'flex', gap: 3 },
  titlebarBtn: {
    width: 13,
    height: 12,
    display: 'block',
    background: CHROME,
    border: `1px solid ${INK_DARK}`,
    borderTopColor: CHROME_LIGHT,
    borderLeftColor: CHROME_LIGHT,
  },
  panelBody: {
    padding: '20px 18px 22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  checkWrap: { width: 62, height: 62, marginBottom: 12 },
  checkSvg: { width: '100%', height: '100%', display: 'block' },
  headline: {
    fontFamily: MASTHEAD,
    fontSize: 27,
    lineHeight: 1.05,
    letterSpacing: '-0.5px',
    color: INK_DARK,
    margin: '0 0 8px',
  },
  lead: {
    fontFamily: VT,
    fontSize: 21,
    lineHeight: 1.25,
    color: '#3b2456',
    margin: '0 0 18px',
    maxWidth: '26ch',
  },
  card: {
    width: '100%',
    background: '#fbfbf9',
    border: `2px solid ${CHROME_DARK}`,
    borderTopColor: INK_DARK,
    borderLeftColor: INK_DARK,
    padding: '11px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
    marginBottom: 12,
  },
  cardRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardKey: {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: '.1em',
    color: 'rgba(26,26,26,.55)',
  },
  cardVal: {
    fontFamily: MONO,
    fontSize: 12.5,
    color: '#1a1a1a',
    textAlign: 'right',
    margin: 0,
  },
  fine: {
    fontFamily: MONO,
    fontSize: 10.5,
    lineHeight: 1.5,
    color: 'rgba(26,10,46,.62)',
    margin: '0 0 18px',
  },
  cta: {
    fontFamily: VT,
    fontSize: 23,
    letterSpacing: '.05em',
    color: '#fff',
    padding: '9px 24px',
    background: `linear-gradient(180deg, ${HOT_PINK}, ${MAGENTA})`,
    border: `2px solid ${INK_DARK}`,
    borderRadius: 8,
    boxShadow: `3px 4px 0 rgba(26,10,46,.5)`,
    cursor: 'var(--cursor-hand)',
  },

  // ── beat 2: the real receipt, printing down ──
  receiptBeat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  },
  printWrap: {
    width: 300,
    maxWidth: '86vw',
  },
  replyWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    transition: 'opacity 460ms ease, transform 460ms ease',
  },
  replayBtn: {
    fontFamily: VT,
    fontSize: 17,
    letterSpacing: '.06em',
    color: INK_DARK,
    background: 'transparent',
    border: 'none',
    borderBottom: `1px dashed ${INK_DARK}`,
    cursor: 'var(--cursor-hand)',
    padding: '1px 2px',
    opacity: 0.75,
  },
};
