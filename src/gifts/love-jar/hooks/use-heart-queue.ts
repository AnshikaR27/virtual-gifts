'use client';

import { useMemo } from 'react';
import type { Heart } from './use-jar-state';

export function useHeartQueue(unreadHearts: Heart[]) {
  const remaining = useMemo(() => unreadHearts.length, [unreadHearts]);
  return { remaining };
}
