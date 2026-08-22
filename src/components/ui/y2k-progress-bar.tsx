/**
 * <Y2KProgressBar> — the pink→purple filling bar, in one place.
 *
 * EXTRACTED FROM components/gift-loading.tsx, which is where this markup and
 * these colours have always lived. It is lifted out rather than copied because
 * a second gift now needs the same bar INLINE, inside its own window, instead
 * of in the portal dialog <GiftLoading> renders — and two hand-maintained
 * copies of a gradient drift apart within a week.
 *
 * <GiftLoading> renders this with no props but `value`, so its dialog is
 * byte-identical to what it drew before.
 *
 * IT IS A FAKE BAR wherever it is used. The value is a timer, not a
 * measurement of anything — it exists so a transition has a beat instead of a
 * flicker. Do not wire it to real progress without rethinking the copy above it.
 */

export interface Y2KProgressBarProps {
  /** 0–100. Clamped, so a caller's arithmetic cannot overfill the trough. */
  value: number;
  /** Bar height in px. The dialog's 20 is the original. */
  height?: number;
  /**
   * Whether width changes ease. Off for a bar stepping in big jumps, and off
   * under reduced motion, where a smoothly creeping bar is the whole problem.
   */
  animated?: boolean;
  /** Announced to screen readers as the thing being filled. */
  label?: string;
}

export function Y2KProgressBar({
  value,
  height = 20,
  animated = true,
  label = 'Progress',
}: Y2KProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className="border-2"
      style={{
        height,
        // The Win98 sunken trough: dark on top-left, light on bottom-right —
        // the inverse of a raised button, which is what makes it read as a
        // hole rather than a tile.
        borderColor:
          'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
      }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={
          animated ? 'h-full transition-[width] duration-100' : 'h-full'
        }
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #FF69B4, #BA55D3)',
        }}
      />
    </div>
  );
}
