'use client';

import type { CSSProperties } from 'react';

/**
 * <CordBow> — the cord tied off at the end of a photo garland: two loops, a
 * knot, two tails.
 *
 * Drawn in the SAME jute colour as the garland thread (see THREAD_COLOR in the
 * walls), so it reads as the same length of cord knotted at its end rather than
 * as a ribbon somebody stuck on. If the thread colour ever changes, change this
 * with it or the bow will look like a different material.
 *
 * SOFT, NOT PIXEL. This is content, not chrome — no hard pixel edges, no
 * zero-blur shadow, no Y2K palette. Round caps everywhere, because cord has no
 * corners. The two tails are deliberately different lengths and curves: a
 * symmetrical bow reads as a graphic, an uneven one reads as tied.
 */

/** The cord. Matches the garland thread. */
export const CORD_COLOR = '#C19A6B';

export interface CordBowProps {
  /** Rendered width in px. Height follows the 28×20 aspect. */
  width?: number;
  /** Mirror it, so the bows at opposite ends of a string are not clones. */
  flip?: boolean;
  style?: CSSProperties;
}

export function CordBow({ width = 30, flip = false, style }: CordBowProps) {
  return (
    <svg
      style={{
        ...style,
        ...(flip ? { transform: 'scaleX(-1)' } : null),
      }}
      width={width}
      height={(width / 28) * 20}
      viewBox="0 0 28 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        stroke={CORD_COLOR}
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      >
        {/* the two loops */}
        <path d="M14,8 C9,2.4 3,3.4 3,7.2 C3,10.8 9,10.8 14,8 Z" />
        <path d="M14,8 C19,2.4 25,3.4 25,7.2 C25,10.8 19,10.8 14,8 Z" />
        {/* the tails, uneven on purpose */}
        <path d="M13,9.4 C10.6,13 9,15.6 7.4,18.6" />
        <path d="M15,9.4 C17.6,12.6 19.4,15.2 21.4,17.8" />
      </g>
      {/* the knot */}
      <circle cx="14" cy="8.2" r="2.3" fill={CORD_COLOR} />
    </svg>
  );
}
