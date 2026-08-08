'use client';

/**
 * <GiftReveal> — the frame's entrance for the gift subtree.
 *
 * ENTRANCE VARIANTS
 * -----------------
 * `scale` (default, unchanged): a framer-motion spring from scale 0.9 → 1.
 * This is what every gift has always used and what tiffin-note still uses.
 *
 * It is NOT suitable for a gift whose own reveal has a fixed anchor point.
 * The spring scales the ENTIRE subtree about its centre, so anything near the
 * top edge is dragged downward-then-up as the box grows to full size. On the
 * Love Receipt that anchor is the printer bar, and the drift is plainly visible:
 * the printer creeps upward for the ~700 ms the spring is settling, while the
 * paper is already feeding out of its slot. A machine that floats is not a
 * machine, so that gift opts out.
 *
 * `none`: no transform and no opacity change at all. The gift subtree is
 * painted at its final position and size on the very first frame. Used by
 * love-receipt, whose printer feed IS the entrance — see
 * gifts/love-receipt/reveal/printer-feed.tsx.
 *
 * `fade`: opacity 0 → 1, no transform. Driven by a CSS animation rather than
 * framer-motion on purpose: framer-motion would render `opacity: 0` into the
 * server HTML, so a client that never hydrates would show a permanently blank
 * gift. A CSS animation with `both` fill starts at first paint and finishes
 * even if JS never runs. (Same reasoning as the printer feed itself.)
 *
 * Why not just re-origin the spring to `top center`? It pins the subtree's top
 * edge but the printer still GROWS from 52 px to 58 px tall, so the slot — and
 * therefore the paper emerging from it — still slides down ~6 px. Removing the
 * transform is the only thing that gives a genuinely static slot.
 */

import { Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';

/** How the gift subtree arrives. Set per gift in gifts/registry.ts. */
export type GiftEntrance = 'scale' | 'fade' | 'none';

/** Duration of the `fade` entrance, ms. Kept in sync with FADE_CSS below. */
export const ENTRANCE_FADE_MS = 420;

const WRAPPER_CLASS = 'flex h-full w-full items-center justify-center';

function RevealLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="gift-pulse h-16 w-16 rounded-full bg-primary-fixed" />
    </div>
  );
}

interface GiftRevealProps {
  visible: boolean;
  /** Defaults to the historical spring so existing gifts are untouched. */
  entrance?: GiftEntrance;
  onAnimationComplete: () => void;
  children: React.ReactNode;
}

export function GiftReveal({
  visible,
  entrance = 'scale',
  onAnimationComplete,
  children,
}: GiftRevealProps) {
  if (!visible) return null;

  if (entrance === 'scale') {
    return (
      <motion.div
        className={WRAPPER_CLASS}
        // No opacity fade: keeping the window fully opaque means the SSR HTML
        // already paints the full chrome on first frame (the gift uses its own
        // popup reveal), so slow connections never see an empty background.
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onAnimationComplete={onAnimationComplete}
      >
        <Suspense fallback={<RevealLoader />}>{children}</Suspense>
      </motion.div>
    );
  }

  return (
    <StaticReveal entrance={entrance} onAnimationComplete={onAnimationComplete}>
      {children}
    </StaticReveal>
  );
}

/**
 * The transform-free entrances. Split into its own component because the
 * phase-advance effect below is a hook, and <GiftReveal> returns early on
 * `!visible` before it would run.
 */
function StaticReveal({
  entrance,
  onAnimationComplete,
  children,
}: {
  entrance: Exclude<GiftEntrance, 'scale'>;
  onAnimationComplete: () => void;
  children: React.ReactNode;
}) {
  /**
   * There is no JS-driven entrance to wait on, so advance the frame's phase
   * ourselves. Without this the frame would sit in `reveal` forever and never
   * reach `active`, and onClimax() — which requires `active` — would be a
   * no-op, so the gift could never finish.
   *
   * Fired on mount rather than after ENTRANCE_FADE_MS: the phase change is
   * bookkeeping, nothing watches it visually, and reaching `active` early is
   * harmless (the gift still decides when it has climaxed).
   */
  useEffect(() => {
    onAnimationComplete();
  }, [onAnimationComplete]);

  return (
    <div
      className={
        entrance === 'fade'
          ? `${WRAPPER_CLASS} gf-entrance-fade`
          : WRAPPER_CLASS
      }
    >
      {/* Raw-HTML injection, not a text child: React's server renderer escapes
          quotes and angle brackets inside a <style> text child while the client
          does not, which is a hydration mismatch that would take down this
          Suspense boundary. See gifts/love-receipt/reveal/printer-feed.tsx. */}
      {entrance === 'fade' ? (
        <style dangerouslySetInnerHTML={{ __html: FADE_CSS }} />
      ) : null}
      <Suspense fallback={<RevealLoader />}>{children}</Suspense>
    </div>
  );
}

/**
 * Opacity-only entrance. `both` fill-mode pins the end state, so the gift is
 * visible afterwards even if the JS chunk never loads.
 */
const FADE_CSS = `
@keyframes gf-entrance-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.gf-entrance-fade {
  animation: gf-entrance-fade ${ENTRANCE_FADE_MS}ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .gf-entrance-fade { animation-duration: 1ms; }
}
`;
