'use client';

import type { CSSProperties } from 'react';

/**
 * Win98Dialog — a reusable Language A modal dialog.
 *
 * Extracted from the Love Jar's win98-shell so the chunky beveled system
 * dialog is available to future Y2K-native gifts without depending on the
 * (soon to be retired) love-jar shell. The companion reaction "poof" float
 * animation already lives as shared CSS in globals.css
 * (.reaction-float-layer / .reaction-float-main / .reaction-float-ghost).
 *
 * Language A by design: VT323 titlebar, hard pixel bevels, 0-blur shadow.
 */

// 2px checkerboard dither over a 2-stop gradient → an authentic banded Win98
// title bar instead of a smooth modern gradient.
export function ditheredTitle(c1: string, c2: string): CSSProperties {
  const dither =
    'linear-gradient(45deg, rgba(255,255,255,0.16) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.16) 75%)';
  return {
    backgroundImage: `${dither}, ${dither}, linear-gradient(90deg, ${c1}, ${c2})`,
    backgroundSize: '2px 2px, 2px 2px, 100% 100%',
    backgroundPosition: '0 0, 1px 1px, 0 0',
  };
}

export const BEVEL_OUT: CSSProperties = {
  border: '2px solid',
  borderColor:
    'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
};

export const BEVEL_IN: CSSProperties = {
  border: '2px solid',
  borderColor:
    'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
};

interface Win98DialogProps {
  title: string;
  /** [start, end] title-bar gradient stops. */
  titleColors: [string, string];
  /** Plays the dismiss keyframe instead of the appear keyframe. */
  closing?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Win98Dialog({
  title,
  titleColors,
  closing = false,
  onClose,
  children,
}: Win98DialogProps) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      style={{ background: closing ? 'transparent' : 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="w-full max-w-[340px]"
        style={{
          animation: closing
            ? 'popup-dismiss 0.12s linear forwards'
            : 'popup-appear 0.18s linear forwards',
        }}
      >
        <div
          className="win98-window"
          style={{ padding: 3, boxShadow: '2px 2px 0 0 #000' }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              ...ditheredTitle(titleColors[0], titleColors[1]),
              padding: '3px 4px',
            }}
          >
            <span className="truncate font-pixel text-[15px] font-bold tracking-wide text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.35)]">
              {title}
            </span>
            <button
              className="win98-titlebar-btn"
              aria-label="Close"
              onClick={onClose}
            >
              <span className="text-[10px] font-bold leading-none text-ink">
                ✕
              </span>
            </button>
          </div>
          <div style={{ background: '#ffffff', ...BEVEL_IN, padding: '16px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
