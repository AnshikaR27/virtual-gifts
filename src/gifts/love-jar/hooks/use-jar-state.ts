'use client';

import { useState, useCallback, useRef } from 'react';

export type JarPhase =
  | 'idle'
  | 'shaking'
  | 'releasing'
  | 'showing-card'
  | 'empty';

interface JarState {
  phase: JarPhase;
  remaining: number;
  currentMessageIndex: number | null;
  readIndices: Set<number>;
}

export function useJarState(messages: string[]) {
  const [state, setState] = useState<JarState>({
    phase: 'idle',
    remaining: messages.length,
    currentMessageIndex: null,
    readIndices: new Set(),
  });
  const busyRef = useRef(false);

  const getNextUnreadIndex = useCallback((): number | null => {
    const unread: number[] = [];
    for (let i = 0; i < messages.length; i++) {
      if (!state.readIndices.has(i)) unread.push(i);
    }
    if (unread.length === 0) return null;
    return unread[Math.floor(Math.random() * unread.length)];
  }, [messages.length, state.readIndices]);

  const triggerShake = useCallback(() => {
    if (busyRef.current || state.phase === 'empty') return;
    const nextIndex = getNextUnreadIndex();
    if (nextIndex === null) return;

    busyRef.current = true;
    if (navigator.vibrate) navigator.vibrate(50);

    setState((s) => ({
      ...s,
      phase: 'shaking',
      currentMessageIndex: nextIndex,
    }));

    setTimeout(() => {
      setState((s) => ({ ...s, phase: 'releasing' }));
    }, 600);

    setTimeout(() => {
      setState((s) => ({ ...s, phase: 'showing-card' }));
    }, 1800);
  }, [state.phase, getNextUnreadIndex]);

  const dismissCard = useCallback(() => {
    setState((s) => {
      const newRead = new Set(s.readIndices);
      if (s.currentMessageIndex !== null) newRead.add(s.currentMessageIndex);
      const newRemaining = messages.length - newRead.size;
      return {
        phase: newRemaining === 0 ? 'empty' : 'idle',
        remaining: newRemaining,
        currentMessageIndex: null,
        readIndices: newRead,
      };
    });
    busyRef.current = false;
  }, [messages.length]);

  const currentMessage =
    state.currentMessageIndex !== null
      ? messages[state.currentMessageIndex]
      : null;

  return {
    phase: state.phase,
    remaining: state.remaining,
    currentMessage,
    triggerShake,
    dismissCard,
  };
}
