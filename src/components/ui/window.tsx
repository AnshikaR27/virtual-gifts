import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * <Window> — the canonical HoneyHearts Win98 window chrome.
 *
 * Title bar (pink→orchid gradient + _ □ × buttons) over a white body slot.
 * Every gift composes this instead of re-declaring the chrome. Tokens match
 * src/app/globals.css (--win-chrome, --win-title-start/end, --ink).
 *
 * Presentational + server-safe: the _ □ × glyphs are decorative (the gift
 * frame owns lifecycle), so no client directive is needed.
 */

// Raised bevel: light top/left, dark right/bottom.
const RAISED: CSSProperties = {
  borderStyle: 'solid',
  borderWidth: 2,
  borderTopColor: 'var(--win-chrome-light)',
  borderLeftColor: 'var(--win-chrome-light)',
  borderRightColor: 'var(--win-chrome-dark)',
  borderBottomColor: 'var(--win-chrome-dark)',
};

interface WindowProps {
  /** Title-bar label (e.g. "🍱 TIFFIN.exe"). */
  title: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
}

export function Window({
  title,
  children,
  className,
  bodyClassName,
  style,
}: WindowProps) {
  return (
    <div
      className={cn('w-full', className)}
      style={{
        background: 'var(--win-chrome)',
        boxShadow: '1px 1px 0 0 #000',
        ...RAISED,
        ...style,
      }}
    >
      <div
        className="flex items-center justify-between font-pixel"
        style={{
          background:
            'linear-gradient(90deg, var(--win-title-start), var(--win-title-end))',
          color: 'var(--win-title-text)',
          padding: '4px 6px',
          fontSize: 14,
          letterSpacing: '0.5px',
        }}
      >
        <span className="flex items-center gap-1.5">{title}</span>
        <span className="flex gap-[2px]">
          {['_', '□', '×'].map((glyph) => (
            <span
              key={glyph}
              aria-hidden
              className="flex items-center justify-center font-pixel"
              style={{
                width: 16,
                height: 14,
                fontSize: 10,
                lineHeight: 1,
                color: 'var(--ink, #1a0a2e)',
                background: 'var(--win-chrome)',
                borderStyle: 'solid',
                borderWidth: 1,
                borderTopColor: 'var(--win-chrome-light)',
                borderLeftColor: 'var(--win-chrome-light)',
                borderRightColor: 'var(--win-chrome-dark)',
                borderBottomColor: 'var(--win-chrome-dark)',
              }}
            >
              {glyph}
            </span>
          ))}
        </span>
      </div>
      <div
        className={cn('bg-white text-ink', bodyClassName)}
        style={{ padding: '14px 14px 16px' }}
      >
        {children}
      </div>
    </div>
  );
}
