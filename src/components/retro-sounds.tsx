'use client';

import { useEffect, useRef, useCallback } from 'react';

const CLICK_SRC = '/sounds/click.mp3';
const WINDOW_OPEN_SRC = '/sounds/window-open.wav';

const CLICKABLE_SELECTOR =
  'a, button, [role="button"], .win98-btn, .win98-btn-pink, .desktop-icon, .win98-titlebar-btn';

function tryPlay(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function RetroSounds() {
  const clickPool = useRef<HTMLAudioElement[]>([]);
  const windowOpenAudio = useRef<HTMLAudioElement | null>(null);
  const poolIndex = useRef(0);
  const unlocked = useRef(false);

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (clickPool.current.length > 0) return;

    for (let i = 0; i < 4; i++) {
      const a = new Audio(CLICK_SRC);
      a.volume = 0.3;
      a.preload = 'auto';
      clickPool.current.push(a);
    }

    const wo = new Audio(WINDOW_OPEN_SRC);
    wo.volume = 0.2;
    wo.preload = 'auto';
    windowOpenAudio.current = wo;
  }, []);

  const unlock = useCallback(() => {
    if (unlocked.current) return;
    unlocked.current = true;
    clickPool.current.forEach((a) => {
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
        })
        .catch(() => {});
    });
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
      const target = e.target as HTMLElement;
      if (target.closest(CLICKABLE_SELECTOR)) {
        const audio =
          clickPool.current[poolIndex.current % clickPool.current.length];
        poolIndex.current++;
        tryPlay(audio);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
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
