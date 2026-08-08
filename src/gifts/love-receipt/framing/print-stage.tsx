'use client';

/**
 * PREVIEW-ONLY — the print beat. Shared by BOTH framing variants, unchanged.
 *
 * The real <ReceiptPaper> is revealed top-to-bottom by a clip-path inset that
 * retracts from the bottom: paper feeding out of a printer, not a fade-in.
 *
 * Reveal order is structural, not scheduled. The receipt is one normal-flow
 * subtree in document order (masthead → meta → items → summary → TOTAL/PAID VIA/
 * PURCHASED BY → fine print → barcode → footer) under a single clip, so a row is
 * visible only once the clip edge passes it. Nothing can render ahead of the
 * clip, and PURCHASED BY cannot drift away from TOTAL — they share an element.
 *
 * ReceiptPaper's own `printedCount` / `animate` props are deliberately NOT used:
 * those mount rows one at a time and reflow the paper on every step. Here the
 * only animated properties are clip-path and transform.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ReceiptPaper } from '../receipt-paper';
import type { ReceiptPayload } from '../lines';
import { PURCHASED_BY_LABEL, REPLY_CTA_LABEL } from './framing-copy';
import type { FieldTheme } from './framing-theme';

// ── pacing ─────────────────────────────────────────────────────────────────
/**
 * Print SPEED, not print duration. A thermal head feeds paper at a fixed rate,
 * so a 9-item slip must take longer than a 4-item one — the duration is derived
 * from the measured paper height. Tune the feel here; the motion pass retunes.
 */
export const PRINT_PX_PER_SEC = 460;
/** Floor, so a freak-short slip still reads as a print rather than a pop. */
export const MIN_PRINT_MS = 520;
export const PULSE_DELAY_MS = 240;
export const PULSE_MS = 700;
export const CTA_DELAY_MS = 200;
export const CTA_FADE_MS = 400;

export interface PrintResolution {
  heightPx: number;
  durationMs: number;
  pxPerSec: number;
}

export interface PrintStageProps {
  payload: ReceiptPayload;
  senderName: string;
  /** Ink for the reply CTA. The stage never paints a background — the frame
   *  owns the field, so one PrintStage serves a dark or a warm variant. */
  theme: FieldTheme;
  /** Optional slot rendered beside the reply CTA (variant C's small Mochi).
   *  Lives inside the CTA wrapper, so it fades in with the CTA — no extra
   *  timer, and the stage never learns which variant supplied it. */
  ctaAdornment?: ReactNode;
  /** Skip the animation and present the settled receipt (reduced motion). */
  startSettled?: boolean;
  /** Fires once the print completes — drives the parent's `settled` phase. */
  onSettled?: () => void;
  /** Reports the measured height + derived duration to the dev bar. */
  onPrintResolved?: (info: PrintResolution) => void;
}

export function PrintStage({
  payload,
  senderName,
  theme,
  ctaAdornment,
  startSettled = false,
  onSettled,
  onPrintResolved,
}: PrintStageProps) {
  const paperRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  const reduced = usePrefersReducedMotion();
  const skipMotion = startSettled || reduced;

  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(skipMotion);
  const [printing, setPrinting] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [ctaIn, setCtaIn] = useState(skipMotion);

  const name = senderName.trim();
  // The payoff, threaded through ReceiptPaper's preview-only `paymentExtra` so
  // the component prints it inside its own payment block — no fork of the paper.
  const cardholderLine = name ? `${PURCHASED_BY_LABEL}: ${name}` : null;

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => {
    if (skipMotion) {
      onSettled?.();
      return;
    }

    let cancelled = false;

    const start = () => {
      const el = paperRef.current;
      if (!el || cancelled) return;

      // Measure AFTER fonts settle: next/font runs display:swap, and a swap
      // after measurement would derive the duration from the wrong height.
      const heightPx = Math.round(el.getBoundingClientRect().height);
      const dur = Math.max(
        MIN_PRINT_MS,
        Math.round((heightPx / PRINT_PX_PER_SEC) * 1000),
      );
      setDurationMs(dur);
      onPrintResolved?.({
        heightPx,
        durationMs: dur,
        pxPerSec: PRINT_PX_PER_SEC,
      });
      // eslint-disable-next-line no-console
      console.log(
        `[framing] print — ${payload.lines.length} items · ${heightPx}px @ ${PRINT_PX_PER_SEC}px/s → ${dur}ms`,
      );

      // Two frames: commit the transition, THEN the clip target, so the very
      // first paint can never animate from an unstyled state.
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          setPrinting(true);
          setRevealed(true);

          // print completes → settled
          timers.current.push(
            window.setTimeout(() => {
              setPrinting(false);
              onSettled?.();
            }, dur),
          );
          // …then TOTAL thumps once
          timers.current.push(
            window.setTimeout(() => setPulsing(true), dur + PULSE_DELAY_MS),
          );
          timers.current.push(
            window.setTimeout(
              () => setPulsing(false),
              dur + PULSE_DELAY_MS + PULSE_MS,
            ),
          );
          timers.current.push(
            window.setTimeout(
              () => setCtaIn(true),
              dur + PULSE_DELAY_MS + PULSE_MS + CTA_DELAY_MS,
            ),
          );
        });
      });
    };

    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (fonts?.ready) {
      fonts.ready.then(() => requestAnimationFrame(start));
    } else {
      requestAnimationFrame(start);
    }

    return () => {
      cancelled = true;
      clearTimers();
    };
    // Mount-only: the stage is remounted by key on replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const printStyle: CSSProperties = {
    width: 300,
    maxWidth: '86vw',
    clipPath: revealed ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
    transition:
      skipMotion || durationMs == null
        ? 'none'
        : `clip-path ${durationMs}ms cubic-bezier(.28,.62,.35,1)`,
    // Only hint the compositor while the clip is actually moving — a permanent
    // will-change keeps the layer promoted for nothing.
    willChange: printing ? 'clip-path' : 'auto',
  };

  return (
    <section
      style={
        {
          ...styles.stage,
          // fed to the static stage CSS so the focus ring follows the field
          '--lr-focus': theme.focusRing,
        } as CSSProperties
      }
      aria-label="Your receipt"
    >
      <style>{STAGE_CSS}</style>

      <div
        ref={paperRef}
        data-lr-pulse={pulsing ? 'on' : 'off'}
        style={printStyle}
      >
        <ReceiptPaper payload={payload} paymentExtra={cardholderLine} />
      </div>

      <div
        style={{
          ...styles.ctaWrap,
          opacity: ctaIn ? 1 : 0,
          transform: ctaIn ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: ctaIn ? 'auto' : 'none',
        }}
      >
        {ctaAdornment}
        <button
          type="button"
          className="lr-reply"
          style={{
            ...styles.replyBtn,
            color: theme.ctaInk,
            border: `1px solid ${theme.ctaBorder}`,
          }}
          onClick={() => {
            // TODO: wire the reply loop — opens the builder prefilled for a
            // reply. Intentionally a no-op until that flow exists.
          }}
        >
          {REPLY_CTA_LABEL}
        </button>
      </div>
    </section>
  );
}

function usePrefersReducedMotion(): boolean {
  // Read synchronously on FIRST render: the print effect is mount-only, so a
  // value that only arrives in an effect would land after the print had already
  // started — i.e. reduced-motion users would still get the animation.
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

const STAGE_CSS = `
/* One thump on the payment block, compositor-only (transform), single shot. */
@keyframes lr-total-thump {
  0%   { transform: scale(1); }
  38%  { transform: scale(1.035); }
  100% { transform: scale(1); }
}
[data-lr-pulse='on'] [data-lr-total] {
  animation: lr-total-thump ${PULSE_MS}ms cubic-bezier(.34,1.16,.5,1) 1;
  transform-origin: left center;
  will-change: transform;
}
.lr-reply:focus-visible {
  outline: 2px solid var(--lr-focus, #f4f1ea);
  outline-offset: 4px;
}
.lr-reply:active { transform: translateY(1px); }
@media (prefers-reduced-motion: reduce) {
  [data-lr-pulse='on'] [data-lr-total] { animation: none; }
  .lr-reply:active { transform: none; }
}
`;

const styles: Record<string, CSSProperties> = {
  stage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 26,
  },
  ctaWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: `opacity ${CTA_FADE_MS}ms ease, transform ${CTA_FADE_MS}ms ease`,
  },
  replyBtn: {
    fontFamily: 'var(--font-outfit), system-ui, sans-serif',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.01em',
    background: 'transparent',
    borderRadius: 999,
    padding: '11px 22px',
    cursor: 'pointer',
    minHeight: 44,
  },
};
