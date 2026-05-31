'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SUNKEN, WinLabel } from './win-input';

/**
 * <WinSelect> — bevelled Win98 dropdown. Renders a real (accessible) <select>
 * styled to match the mockup's display box, with a ▼ caret overlay.
 */

export interface WinSelectOption {
  value: string;
  label: ReactNode;
}

interface WinSelectProps {
  label?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | WinSelectOption>;
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

function normalize(option: string | WinSelectOption): WinSelectOption {
  return typeof option === 'string' ? { value: option, label: option } : option;
}

export function WinSelect({
  label,
  value,
  onChange,
  options,
  name,
  id,
  className,
  style,
}: WinSelectProps) {
  return (
    <div className="mb-2.5 w-full">
      {label ? <WinLabel>{label}</WinLabel> : null}
      <div className="relative w-full">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none bg-white font-body text-ink',
            className,
          )}
          style={{
            ...SUNKEN,
            padding: '6px 22px 6px 8px',
            fontSize: 13,
            borderRadius: 0,
            ...style,
          }}
        >
          {options.map((option) => {
            const { value: v, label: l } = normalize(option);
            return (
              <option key={v} value={v}>
                {typeof l === 'string' ? l : v}
              </option>
            );
          })}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-60"
          style={{ fontSize: 10 }}
        >
          ▼
        </span>
      </div>
    </div>
  );
}
