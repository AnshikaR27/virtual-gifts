'use client';

import { useEffect, useRef, useCallback } from 'react';

const WINDOW_OPEN_SRC = '/sounds/window-open.wav';

const CLICKABLE_SELECTOR =
  'a, button, [role="button"], .win98-btn, .win98-btn-pink, .desktop-icon, .win98-titlebar-btn';

const SCROLL_THRESHOLD = 10;

export function playClick() {
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

/**
 * THE CRASH. A short, harsh error burst for the moment a screen "breaks":
 * two detuned square waves sliding downward (the sour interval is what a
 * system error sounds like) under three stutters of bandpassed white noise.
 *
 * SYNTHESISED RATHER THAN LOADED. There is no glitch file in /public/sounds
 * and components/game/sfx.ts is still a no-op until those ship, so this is
 * built the same way playClick() is — from oscillators, so it works today.
 *
 * Kept to ~0.36s on purpose: it is a jolt, not a siren.
 */
export function playGlitch() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    // If the page has had a gesture this is already running; if it has not,
    // the browser's autoplay policy keeps it suspended and the burst is
    // silently skipped. Nothing here is load-bearing, so that is fine.
    void ctx.resume?.().catch?.(() => {});

    const now = ctx.currentTime;
    const DUR = 0.36;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0.3, now);
    out.connect(ctx.destination);

    // ── THE BUZZ ────────────────────────────────────────────────────────
    [92, 61].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq * (i === 0 ? 1.06 : 1), now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + DUR);
      // Ramps target a tiny non-zero value: exponentialRamp cannot reach 0.
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.5, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + DUR);
      osc.connect(g);
      g.connect(out);
      osc.start(now);
      osc.stop(now + DUR);
    });

    // ── THE STATIC CRACKLE ──────────────────────────────────────────────
    const frames = Math.floor(ctx.sampleRate * DUR);
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2600, now);
    bp.Q.value = 0.7;

    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    // Three gated bursts, so it reads as a signal breaking up rather than
    // one flat hiss.
    [0, 0.09, 0.19].forEach((t) => {
      ng.gain.setValueAtTime(0.42, now + t);
      ng.gain.exponentialRampToValueAtTime(0.02, now + t + 0.06);
    });
    ng.gain.exponentialRampToValueAtTime(0.0001, now + DUR);

    noise.connect(bp);
    bp.connect(ng);
    ng.connect(out);
    noise.start(now);
    noise.stop(now + DUR);

    // Release the context once it has finished sounding.
    window.setTimeout(
      () => {
        void ctx.close().catch(() => {});
      },
      (DUR + 0.12) * 1000,
    );
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
