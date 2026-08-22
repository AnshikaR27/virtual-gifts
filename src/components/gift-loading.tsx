'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Y2KProgressBar } from '@/components/ui/y2k-progress-bar';

/**
 * <GiftLoading> — the Y2K "please wait" dialog: a Win98 window with a
 * pink→purple progress bar that fills and then calls back.
 *
 * ORIGINALLY a homepage device (pin-board, gift-browser, crt-showcase,
 * love-letter-rack, polaroid-wall all show it while a route loads), now also
 * the beat between a gift's passcode and its reveal — see
 * gifts/shared/passcode-gate.tsx.
 *
 * THE COPY AND DURATION ARE PROPS, and every one of them defaults to exactly
 * what this component hardcoded before, so the five homepage callers get
 * byte-identical behaviour without passing anything.
 *
 * IT IS A FAKE BAR, and that is fine. The progress is a timer, not a
 * measurement of anything — it exists so a fast transition has a beat instead
 * of a flicker. Do not wire it to real progress without rethinking the copy.
 */

export interface GiftLoadingProps {
  /** Fired once the bar is full (or immediately, under reduced motion). */
  onComplete: () => void;
  /** Titlebar caption. */
  title?: string;
  /** The line above the bar. */
  message?: string;
  /** How long the bar takes to fill, ms. */
  durationMs?: number;
}

export function GiftLoading({
  onComplete,
  title = 'Opening gift...',
  message = 'Copying Love to your heart...',
  durationMs = 1500,
}: GiftLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  /**
   * Under prefers-reduced-motion this renders NOTHING and hands straight over.
   * The bar is a decorative delay; to someone who has asked for less motion it
   * is a pointless animated wait between them and where they were going.
   */
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSkipped(true);
      // Deferred, not called during render: onComplete typically flips the
      // parent's phase, and a parent cannot be updated mid-child-render.
      const skip = setTimeout(onComplete, 0);
      return () => clearTimeout(skip);
    }

    const interval = 30;
    const steps = durationMs / interval;
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
  }, [onComplete, durationMs]);

  if (!mounted || skipped) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="win98-window" style={{ width: 340, maxWidth: '90vw' }}>
        <div className="win98-titlebar">
          <span>{title}</span>
          <div className="flex gap-[2px]">
            <span className="win98-titlebar-btn" aria-hidden>
              <span className="text-[10px] font-bold leading-none text-ink">
                ✕
              </span>
            </span>
          </div>
        </div>
        <div className="win98-body">
          <p className="mb-3 font-pixel text-[15px] text-ink">{message}</p>

          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-[24px]">📁</span>
            <span className="gift-loading-paper text-[18px]">📄</span>
            <span className="text-[24px]">📁</span>
          </div>

          <Y2KProgressBar value={progress} label="Opening gift" />
          <p className="mt-1 font-pixel text-[13px] text-ink/60">
            {progress}% complete
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
