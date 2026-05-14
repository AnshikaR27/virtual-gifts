'use client';

import { useEffect, useRef, useCallback } from 'react';

const WINDOW_OPEN_SRC = '/sounds/window-open.wav';

const CLICKABLE_SELECTOR =
  'a, button, [role="button"], .win98-btn, .win98-btn-pink, .desktop-icon, .win98-titlebar-btn';

const SCROLL_THRESHOLD = 10;

function playClick() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(1800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      400,
      ctx.currentTime + 0.06,
    );
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.06);
  } catch (e) {}
}

function tryPlay(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function RetroSounds() {
  const windowOpenAudio = useRef<HTMLAudioElement | null>(null);
  const unlocked = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastTouchPlayedAt = useRef(0);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (windowOpenAudio.current) return;

    const wo = new Audio(WINDOW_OPEN_SRC);
    wo.volume = 0.2;
    wo.preload = 'auto';
    windowOpenAudio.current = wo;
  }, []);

  const unlock = useCallback(() => {
    if (unlocked.current) return;
    unlocked.current = true;
    if (windowOpenAudio.current) {
      windowOpenAudio.current
        .play()
        .then(() => {
          windowOpenAudio.current!.pause();
          windowOpenAudio.current!.currentTime = 0;
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    initAudio();

    const handleClick = (e: MouseEvent) => {
      unlock();
      if (Date.now() - lastTouchPlayedAt.current < 500) return;
      const target = e.target as HTMLElement;
      if (target.closest(CLICKABLE_SELECTOR)) {
        playClick();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      unlock();
      const start = touchStart.current;
      const touch = e.changedTouches[0];
      if (!start || !touch) {
        touchStart.current = null;
        return;
      }

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      touchStart.current = null;

      if (distance > SCROLL_THRESHOLD) return;

      const target = e.target as HTMLElement;
      if (target.closest(CLICKABLE_SELECTOR)) {
        lastTouchPlayedAt.current = Date.now();
        playClick();
      }
    };

    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchstart', handleTouchStart, true);
    document.addEventListener('touchend', handleTouchEnd, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('touchstart', handleTouchStart, true);
      document.removeEventListener('touchend', handleTouchEnd, true);
    };
  }, [initAudio, unlock]);

  useEffect(() => {
    initAudio();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            windowOpenAudio.current &&
            unlocked.current
          ) {
            tryPlay(windowOpenAudio.current);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    const observeWindows = () => {
      document.querySelectorAll('.win98-window').forEach((el) => {
        observer.observe(el);
      });
    };

    observeWindows();
    const mutObs = new MutationObserver(observeWindows);
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObs.disconnect();
    };
  }, [initAudio]);

  return null;
}
