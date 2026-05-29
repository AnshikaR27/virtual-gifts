'use client';

import { useEffect, useState } from 'react';

interface HeartReleaseProps {
  active: boolean;
  onComplete: () => void;
}

export function HeartRelease({ active, onComplete }: HeartReleaseProps) {
  const [stage, setStage] = useState<'hidden' | 'rising' | 'done'>('hidden');

  useEffect(() => {
    if (!active) {
      setStage('hidden');
      return;
    }
    setStage('rising');
    const timer = setTimeout(() => {
      setStage('done');
      onComplete();
    }, 1200);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (stage === 'hidden') return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30" aria-hidden>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '45%',
          transform: 'translateX(-50%)',
          animation:
            stage === 'rising'
              ? 'heart-float-up 1.2s cubic-bezier(0.34, 1.2, 0.64, 1) forwards'
              : 'none',
          opacity: stage === 'done' ? 0 : 1,
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          style={{
            animation:
              stage === 'rising'
                ? 'heart-spin-grow 1.2s cubic-bezier(0.34, 1.2, 0.64, 1) forwards'
                : 'none',
          }}
        >
          <path
            d="M20 36C20 36 4 26 4 14C4 8 8 4 14 4C17 4 19 5.5 20 7.5C21 5.5 23 4 26 4C32 4 36 8 36 14C36 26 20 36 20 36Z"
            fill="#f4a0b5"
            stroke="#e07090"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
