'use client';

import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * <WinButton> — Win98 push button. Three variants:
 *   "grey"     secondary action (chrome bevel)
 *   "pink"     primary CTA (hot-pink→magenta gradient)
 *   "whatsapp" send action (#25d366 green gradient)
 *
 * Reused by every gift's sender flow. Tokens from globals.css.
 */

export type WinButtonVariant = 'grey' | 'pink' | 'whatsapp';

const BASE: CSSProperties = {
  padding: '6px 14px',
  fontSize: 14,
  letterSpacing: '1px',
  borderStyle: 'solid',
  borderWidth: 2,
  borderRadius: 0,
  boxShadow: '1px 1px 0 0 #000',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const VARIANTS: Record<WinButtonVariant, CSSProperties> = {
  grey: {
    background: 'var(--win-chrome)',
    color: 'var(--ink, #1a0a2e)',
    borderTopColor: 'var(--win-chrome-light)',
    borderLeftColor: 'var(--win-chrome-light)',
    borderRightColor: 'var(--win-chrome-dark)',
    borderBottomColor: 'var(--win-chrome-dark)',
  },
  pink: {
    background:
      'linear-gradient(180deg, var(--win-hot-pink), var(--win-magenta))',
    color: '#fff',
    borderTopColor: '#ffb1d6',
    borderLeftColor: '#ffb1d6',
    borderRightColor: '#a01060',
    borderBottomColor: '#a01060',
  },
  whatsapp: {
    background: 'linear-gradient(180deg, #34e379, #25d366)',
    color: '#fff',
    borderTopColor: '#6cf2a4',
    borderLeftColor: '#6cf2a4',
    borderRightColor: '#128a44',
    borderBottomColor: '#128a44',
  },
};

interface WinButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: WinButtonVariant;
  /** pink/whatsapp stretch to fill a btn-row by default; set false to opt out. */
  grow?: boolean;
}

export function WinButton({
  variant = 'grey',
  grow,
  className,
  style,
  type = 'button',
  ...props
}: WinButtonProps) {
  const shouldGrow = grow ?? variant !== 'grey';
  return (
    <button
      type={type}
      className={cn('font-pixel', className)}
      style={{
        ...BASE,
        ...VARIANTS[variant],
        flex: shouldGrow ? 1 : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
