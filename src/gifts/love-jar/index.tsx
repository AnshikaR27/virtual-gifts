'use client';

import { useCallback } from 'react';
import { GiftFrame, useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import type { ReplayBehavior } from '@/types';
import { LoveJarWindow } from './components/love-jar-window';

interface LoveJarInteriorProps {
  messages: string[];
}

function LoveJarInterior({ messages }: LoveJarInteriorProps) {
  const { trackInteraction } = useGiftContext();

  const handleShake = useCallback(() => {
    trackInteraction('shake');
  }, [trackInteraction]);

  return <LoveJarWindow messages={messages} onShake={handleShake} />;
}

interface LoveJarProps {
  gift: GiftData;
  replayBehavior: ReplayBehavior;
}

export default function LoveJar({ gift, replayBehavior }: LoveJarProps) {
  const content = gift.contentJsonb as { messages?: string[] };
  const messages = content.messages ?? [];

  return (
    <GiftFrame gift={gift} replayBehavior={replayBehavior} anticipationMs={0}>
      <LoveJarInterior messages={messages} />
    </GiftFrame>
  );
}
