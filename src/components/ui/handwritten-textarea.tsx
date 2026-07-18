'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { SUNKEN, WinLabel } from './win-input';

/**
 * <HandwrittenTextarea> — lined-paper textarea. Renders the typed text live in
 * Caveat, enforces a char cap, shows an "n / max" counter, and (optionally)
 * cycles a list of placeholder examples to model tone while empty.
 */

const PAPER = '#fffef9';
const PAPER_LINE = 'rgba(26, 10, 46, 0.12)';

const LINED_PAPER: CSSProperties = {
  background: PAPER,
  backgroundImage: `repeating-linear-gradient(transparent 0, transparent 22px, ${PAPER_LINE} 22px, ${PAPER_LINE} 23px)`,
};

interface HandwrittenTextareaProps {
  label?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  /** When set (and the field is empty), these cycle every ~2.6s as the placeholder. */
  placeholders?: string[];
  placeholder?: string;
  name?: string;
  id?: string;
}

export function HandwrittenTextarea({
  label,
  value,
  onChange,
  maxLength = 200,
  placeholders,
  placeholder,
  name,
  id,
}: HandwrittenTextareaProps) {
  const [cycleIndex, setCycleIndex] = useState(0);
  const hasCycle = !!placeholders && placeholders.length > 0;
  const cycleRef = useRef(placeholders);
  cycleRef.current = placeholders;

  useEffect(() => {
    if (!hasCycle) return;
    const id = setInterval(() => {
      setCycleIndex((i) => i + 1);
    }, 2600);
    return () => clearInterval(id);
  }, [hasCycle]);

  const activePlaceholder = hasCycle
    ? placeholders![cycleIndex % placeholders!.length]
    : placeholder;

  return (
    <div className="w-full">
      {label ? <WinLabel>{label}</WinLabel> : null}
      <textarea
        id={id}
        name={name}
        value={value}
        maxLength={maxLength}
        placeholder={activePlaceholder}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        className={cn('w-full resize-none font-handwritten text-ink')}
        style={{
          ...SUNKEN,
          ...LINED_PAPER,
          height: 100,
          padding: '6px 10px',
          fontSize: 18,
          lineHeight: '22px',
          borderRadius: 0,
          marginBottom: 6,
        }}
      />
      <div
        className="text-right font-pixel"
        style={{
          fontSize: 11,
          color: 'rgba(26, 10, 46, 0.6)',
          marginBottom: 10,
        }}
      >
        {value.length} / {maxLength}
      </div>
    </div>
  );
}
