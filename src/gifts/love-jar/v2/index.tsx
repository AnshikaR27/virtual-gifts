'use client';

import { useCallback } from 'react';
import { GiftFrame, useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import type { ReplayBehavior } from '@/types';
import { CraftTableScene } from './craft-table-scene';

/**
 * LoveJarV2 — the rebuilt Love Jar (scratch). Pure Language B.
 *
 * Unlike the current Love Jar, this enters through the shared soft
 * AnticipationScreen like Sorry Puppy does (no `anticipationMs={0}`, no Win98
 * loading bar) and renders the craft-table scene directly inside GiftFrame —
 * no win98-shell wrapper, no lilac background.
 */

interface InteriorProps {
  messages: string[];
  recipientName: string;
  senderName?: string;
}

function Interior({ messages, recipientName, senderName }: InteriorProps) {
  const { trackInteraction, onClimax } = useGiftContext();
  const handleShake = useCallback(
    () => trackInteraction('shake'),
    [trackInteraction],
  );

  return (
    <CraftTableScene
      messages={messages}
      recipientName={recipientName}
      senderName={senderName}
      onShake={handleShake}
      onClimax={onClimax}
    />
  );
}

interface LoveJarV2Props {
  gift: GiftData;
  replayBehavior: ReplayBehavior;
}

export default function LoveJarV2({ gift, replayBehavior }: LoveJarV2Props) {
  const content = gift.contentJsonb as { messages?: string[] };
  const messages = content.messages ?? [];

  return (
    <GiftFrame gift={gift} replayBehavior={replayBehavior}>
      <Interior
        messages={messages}
        recipientName={gift.recipientName}
        senderName={gift.senderName ?? undefined}
      />
    </GiftFrame>
  );
}
