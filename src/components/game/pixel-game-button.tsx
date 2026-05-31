'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * <PixelGameButton> — chunky pixel button with a hard drop shadow. "pink"
 * (primary) and "grey" (secondary) variants. Renders a Next <Link> when `href`
 * is set, otherwise a <button>.
 */

export type PixelGameButtonVariant = 'pink' | 'grey';

const BASE: CSSProperties = {
  fontSize: 13,
  padding: '5px 12px',
  letterSpacing: '1.5px',
  cursor: 'pointer',
  margin: 3,
  display: 'inline-block',
  textDecoration: 'none',
};

const VARIANTS: Record<PixelGameButtonVariant, CSSProperties> = {
  pink: {
    background: '#ff1493',
    color: '#fff',
    border: '2px solid #fff',
    boxShadow: '2px 2px 0 #000',
  },
  grey: {
    background: 'var(--win-chrome)',
    color: '#2a0a4a',
    border: '2px solid #2a0a4a',
    boxShadow: '2px 2px 0 #6e3aa5',
  },
};

interface PixelGameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelGameButtonVariant;
  href?: string;
}

export function PixelGameButton({
  variant = 'pink',
  href,
  className,
  style,
  type = 'button',
  children,
  ...props
}: PixelGameButtonProps) {
  const composed = { ...BASE, ...VARIANTS[variant], ...style };

  if (href) {
    return (
      <Link
        href={href}
        className={cn('font-pixel', className)}
        style={composed}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cn('font-pixel', className)}
      style={composed}
      {...props}
    >
      {children}
    </button>
  );
}
