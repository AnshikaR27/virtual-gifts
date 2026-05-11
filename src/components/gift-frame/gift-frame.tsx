'use client';

import { createContext, useContext, useEffect } from 'react';
import type { ReplayBehavior } from '@/types';
import { useGiftFrame } from './use-gift-frame';
import { AnticipationScreen } from './anticipation-screen';
import { GiftReveal } from './gift-reveal';
import { ConversionCta } from './conversion-cta';
import { Watermark } from './watermark';
import { ReplayButton } from './replay-button';
import { ReactionSnapSlot } from './reaction-snap-slot';

export interface GiftData {
  id: string;
  shortId: string;
  slug: string;
  senderName: string | null;
  recipientName: string;
  contentJsonb: Record<string, unknown>;
  paid: boolean;
}

interface GiftContextValue {
  onClimax: () => void;
  trackInteraction: (type: string, value?: unknown) => void;
}

const GiftContext = createContext<GiftContextValue | null>(null);

export function useGiftContext() {
  const ctx = useContext(GiftContext);
  if (!ctx) throw new Error('useGiftContext must be used inside <GiftFrame>');
  return ctx;
}

interface GiftFrameProps {
  gift: GiftData;
  replayBehavior: ReplayBehavior;
  children: React.ReactNode;
}

export function GiftFrame({ gift, replayBehavior, children }: GiftFrameProps) {
  const {
    phase,
    startAnticipation,
    onRevealComplete,
    onClimax,
    onReplay,
    trackInteraction,
  } = useGiftFrame({
    giftId: gift.id,
    replayBehavior,
  });

  useEffect(() => {
    startAnticipation();
  }, [startAnticipation]);

  useEffect(() => {
    trackInteraction('gift_opened');
  }, [trackInteraction]);

  const showGift = phase !== 'anticipation';
  const isPostGift = phase === 'post-gift';

  return (
    <GiftContext.Provider value={{ onClimax, trackInteraction }}>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4">
        <AnticipationScreen
          recipientName={gift.recipientName}
          visible={phase === 'anticipation'}
        />

        {showGift && (
          <GiftReveal visible={showGift} onAnimationComplete={onRevealComplete}>
            {children}
          </GiftReveal>
        )}

        {phase === 'climax' && <ReactionSnapSlot />}

        {isPostGift && (
          <div className="flex flex-col items-center">
            <ConversionCta visible={isPostGift} />
            <ReplayButton
              visible={isPostGift}
              replayBehavior={replayBehavior}
              onReplay={onReplay}
            />
          </div>
        )}

        <Watermark paid={gift.paid} />
      </div>
    </GiftContext.Provider>
  );
}
