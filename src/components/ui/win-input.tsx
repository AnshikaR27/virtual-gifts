'use client';

import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * <WinInput> — bevelled (sunken) Win98 text field with an optional VT323 label.
 */

// Sunken bevel: dark top/left, light right/bottom (inverse of a raised button).
export const SUNKEN: CSSProperties = {
  borderStyle: 'solid',
  borderWidth: 2,
  borderTopColor: 'var(--win-chrome-dark)',
  borderLeftColor: 'var(--win-chrome-dark)',
  borderRightColor: 'var(--win-chrome-light)',
  borderBottomColor: 'var(--win-chrome-light)',
};

export function WinLabel({ children }: { children: ReactNode }) {
  return (
    <label
      className="mb-[3px] block font-pixel uppercase"
      style={{
        fontSize: 13,
        letterSpacing: '0.5px',
        color: 'var(--ink, #1a0a2e)',
      }}
    >
      {children}
    </label>
  );
}

interface WinInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
}

export function WinInput({ label, className, style, ...props }: WinInputProps) {
  return (
    <div className="mb-2.5 w-full">
      {label ? <WinLabel>{label}</WinLabel> : null}
      <input
        className={cn('w-full bg-white font-body text-ink', className)}
        style={{
          ...SUNKEN,
          padding: '6px 8px',
          fontSize: 13,
          borderRadius: 0,
          ...style,
        }}
        {...props}
      />
    </div>
  );
}
