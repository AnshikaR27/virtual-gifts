'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function GiftLoading({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const duration = 1500;
    const interval = 30;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setProgress(Math.min(100, Math.round((step / steps) * 100)));
      if (step >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 100);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="win98-window" style={{ width: 340, maxWidth: '90vw' }}>
        <div className="win98-titlebar text-[14px]">
          <span>Opening gift...</span>
          <div className="flex gap-[2px]">
            <span className="win98-titlebar-btn" aria-hidden>
              <span className="text-[10px] font-bold leading-none text-black">
                ✕
              </span>
            </span>
          </div>
        </div>
        <div className="win98-body">
          <p className="mb-3 font-pixel text-[14px] text-black">
            Copying Love to your heart...
          </p>

          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-[24px]">📁</span>
            <span className="gift-loading-paper text-[16px]">📄</span>
            <span className="text-[24px]">📁</span>
          </div>

          <div
            className="h-[20px] border-2"
            style={{
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
            }}
          >
            <div
              className="h-full transition-[width] duration-100"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #FF69B4, #BA55D3)',
              }}
            />
          </div>
          <p className="mt-1 font-pixel text-[12px] text-black/60">
            {progress}% complete
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
