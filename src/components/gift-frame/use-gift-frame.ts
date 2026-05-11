'use client';

import { useCallback, useRef, useState } from 'react';
import type { ReplayBehavior } from '@/types';

export type GiftPhase =
  | 'anticipation'
  | 'reveal'
  | 'active'
  | 'climax'
  | 'post-gift';

interface UseGiftFrameOptions {
  giftId: string;
  replayBehavior: ReplayBehavior;
  anticipationMs?: number;
  postClimaxDelayMs?: number;
}

export function useGiftFrame({
  giftId,
  replayBehavior,
  anticipationMs = 2000,
  postClimaxDelayMs = 1500,
}: UseGiftFrameOptions) {
  const [phase, setPhase] = useState<GiftPhase>('anticipation');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAnticipation = useCallback(() => {
    setPhase('anticipation');
    clearTimer();
    timerRef.current = setTimeout(() => setPhase('reveal'), anticipationMs);
  }, [anticipationMs, clearTimer]);

  const onRevealComplete = useCallback(() => {
    setPhase('active');
  }, []);

  const onClimax = useCallback(() => {
    if (phase !== 'active') return;
    setPhase('climax');
    clearTimer();
    timerRef.current = setTimeout(
      () => setPhase('post-gift'),
      postClimaxDelayMs,
    );
  }, [phase, postClimaxDelayMs, clearTimer]);

  const onReplay = useCallback(() => {
    if (phase !== 'post-gift') return;
    clearTimer();
    if (replayBehavior === 'replayable') {
      startAnticipation();
    } else if (replayBehavior === 'one-shot-with-replay-from-end') {
      setPhase('active');
    }
  }, [phase, replayBehavior, clearTimer, startAnticipation]);

  const trackInteraction = useCallback(
    (type: string, value?: unknown) => {
      const body = JSON.stringify({ giftId, type, value });
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/interactions',
          new Blob([body], { type: 'application/json' }),
        );
      } else {
        fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    },
    [giftId],
  );

  return {
    phase,
    startAnticipation,
    onRevealComplete,
    onClimax,
    onReplay,
    trackInteraction,
  };
}
