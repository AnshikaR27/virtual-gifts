'use client';

/**
 * The polaroid wall's shared look — the parts that decide how a garland string
 * LOOKS and MOVES, as opposed to what is hanging on it.
 *
 * Extracted from components/home/polaroid-wall.tsx so the homepage wall and the
 * OUR_STORY memory wall (gifts/our-story/memory-wall.tsx) are the same wall with
 * different contents, rather than two implementations that drift apart. The
 * homepage imports these; it no longer declares them.
 *
 * The rest of the look is already shared, as global CSS: .polaroid-wall-bg,
 * .garland-string-row, .garland-svg, .garland-polaroids, .garland-slot,
 * .garland-clothespin, .garland-polaroid, .polaroid-flipper, .polaroid-front,
 * .polaroid-back, .polaroid-photo and .polaroid-caption all live in
 * app/globals.css. Neither wall defines styling of its own — change a rule
 * there and both walls change together, which is the point.
 *
 * NOTHING GIFT-CATALOG-SPECIFIC BELONGS HERE. This module must stay importable
 * by a gift without dragging the marketing page's router, catalog or loading
 * screen into the gift's bundle.
 */

import { useEffect, useRef, useState } from 'react';

/** Photo tints, cycled by index. Used when a polaroid has no image of its own. */
export const gradients = [
  'linear-gradient(135deg, #FFB6C1, #FF85A2)',
  'linear-gradient(135deg, #DCD0FF, #B8A9E8)',
  'linear-gradient(135deg, #A8F0D0, #7DDBB5)',
  'linear-gradient(135deg, #FFE066, #F5C842)',
  'linear-gradient(135deg, #FFB4A2, #FF8A75)',
  'linear-gradient(135deg, #FECACA, #FCA5A5)',
  'linear-gradient(135deg, #C4B5FD, #A78BFA)',
  'linear-gradient(135deg, #A7F3D0, #6EE7B7)',
  'linear-gradient(135deg, #FDE68A, #FCD34D)',
  'linear-gradient(135deg, #FBCFE8, #F9A8D4)',
  'linear-gradient(135deg, #BAE6FD, #7DD3FC)',
  'linear-gradient(135deg, #FED7AA, #FDBA74)',
];

/** Resting tilt per polaroid, cycled by index — what makes the row hand-hung. */
export const swayAngles = [-4, 2, -3, 5, -1, 3, -5, 1, -2, 4];

/** The thread's sag curve, drawn into a 1000×40 viewBox stretched to the row. */
export const THREAD_D = 'M-10,8 Q500,34 1010,8';

/** How many polaroids share one string, and how deep that string sags. */
export const PER_STRING = { phone: 3, desktop: 5 } as const;
export const MAX_SAG = { phone: 14, desktop: 20 } as const;

/**
 * How far a polaroid hangs below the thread's pinned ends. Cards in the middle
 * sit lowest, following the thread's own curve, so clips land ON the string.
 */
export function getSagOffset(index: number, total: number, maxSag: number) {
  if (total <= 1) return 0;
  const t = (index + 0.5) / total;
  return maxSag * 4 * t * (1 - t);
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

/**
 * The strings' drop-in.
 *
 * THIS IS NOT OPTIONAL DECORATION — it is load-bearing. `.garland-string-row`
 * ships `opacity: 0` with its animation paused, so a row that never gets
 * `.is-visible` is INVISIBLE. Any wall using these classes must run this hook
 * (or add the class some other way) or it renders an empty board.
 *
 * Returns the ref to put on the element wrapping the rows.
 */
export function useGarlandReveal(dep: unknown) {
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      wall.querySelectorAll('.garland-string-row').forEach((el) => {
        (el as HTMLElement).classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wall.querySelectorAll('.garland-string-row').forEach((el) => {
            (el as HTMLElement).classList.add('is-visible');
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(wall);
    return () => observer.disconnect();
  }, [dep]);

  return wallRef;
}
