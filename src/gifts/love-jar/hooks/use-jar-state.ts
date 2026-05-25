'use client';

import { useReducer, useMemo } from 'react';
import { heartColors } from '../lib/heart-colors';

export type JarPhase =
  | 'idle'
  | 'shaking'
  | 'rising'
  | 'unfolding'
  | 'showing'
  | 'returning'
  | 'keeping'
  | 'empty';

export type Heart = {
  id: number;
  message: string;
  colorIndex: number;
  positionInJar: { x: number; y: number; rotation: number; scale: number };
};

export type LoveJarState = {
  phase: JarPhase;
  unreadHearts: Heart[];
  currentHeart: Heart | null;
  keptNotes: Heart[];
  totalCount: number;
};

type Action =
  | { type: 'SHAKE' }
  | { type: 'RISE_COMPLETE' }
  | { type: 'UNFOLD_COMPLETE' }
  | { type: 'RETURN' }
  | { type: 'KEEP' }
  | { type: 'RETURN_COMPLETE' }
  | { type: 'KEEP_COMPLETE' }
  | { type: 'RESET'; messages: string[] };

function generateHeartPosition(index: number, total: number) {
  const cols = Math.ceil(Math.sqrt(total));
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: 20 + (col / cols) * 60 + (Math.random() - 0.5) * 10,
    y: 25 + (row / Math.ceil(total / cols)) * 55 + (Math.random() - 0.5) * 8,
    rotation: -30 + Math.random() * 60,
    scale: 0.8 + Math.random() * 0.4,
  };
}

function createHearts(messages: string[]): Heart[] {
  return messages.map((message, i) => ({
    id: i,
    message,
    colorIndex: i % heartColors.length,
    positionInJar: generateHeartPosition(i, messages.length),
  }));
}

function reducer(state: LoveJarState, action: Action): LoveJarState {
  switch (action.type) {
    case 'SHAKE': {
      if (state.phase !== 'idle' || state.unreadHearts.length === 0)
        return state;
      const nextIndex = Math.floor(Math.random() * state.unreadHearts.length);
      return {
        ...state,
        phase: 'shaking',
        currentHeart: state.unreadHearts[nextIndex],
      };
    }
    case 'RISE_COMPLETE':
      return state.phase === 'shaking' ? { ...state, phase: 'rising' } : state;
    case 'UNFOLD_COMPLETE':
      return state.phase === 'rising' ? { ...state, phase: 'showing' } : state;
    case 'RETURN':
      return state.phase === 'showing'
        ? { ...state, phase: 'returning' }
        : state;
    case 'KEEP':
      if (state.phase !== 'showing' || !state.currentHeart) return state;
      return { ...state, phase: 'keeping' };
    case 'RETURN_COMPLETE': {
      const isEmpty = state.unreadHearts.length === 0;
      return {
        ...state,
        phase: isEmpty ? 'empty' : 'idle',
        currentHeart: null,
      };
    }
    case 'KEEP_COMPLETE': {
      if (!state.currentHeart) return state;
      const remaining = state.unreadHearts.filter(
        (h) => h.id !== state.currentHeart!.id,
      );
      const isEmpty = remaining.length === 0;
      return {
        ...state,
        phase: isEmpty ? 'empty' : 'idle',
        unreadHearts: remaining,
        keptNotes: [...state.keptNotes, state.currentHeart],
        currentHeart: null,
      };
    }
    case 'RESET': {
      const hearts = createHearts(action.messages);
      return {
        phase: 'idle',
        unreadHearts: hearts,
        currentHeart: null,
        keptNotes: [],
        totalCount: hearts.length,
      };
    }
    default:
      return state;
  }
}

export function useJarState(messages: string[]) {
  const initialState = useMemo<LoveJarState>(() => {
    const hearts = createHearts(messages);
    return {
      phase: 'idle',
      unreadHearts: hearts,
      currentHeart: null,
      keptNotes: [],
      totalCount: hearts.length,
    };
  }, [messages]);

  const [state, dispatch] = useReducer(reducer, initialState);

  return { state, dispatch };
}
