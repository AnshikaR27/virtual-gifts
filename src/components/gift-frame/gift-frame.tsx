'use client';

import { createContext, useContext, useEffect } from 'react';
import type { ReplayBehavior } from '@/types';
import { useGiftFrame } from './use-gift-frame';
import { AnticipationScreen } from './anticipation-screen';
import { GiftReveal, type GiftEntrance } from './gift-reveal';
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
  anticipationMs?: number;
  /**
   * Gifts that render their own post-climax CTA + replay (e.g. the tiffin-note
   * action bar) set this to suppress the frame's default ConversionCta +
   * ReplayButton, avoiding a duplicate. Defaults to false — unchanged behavior.
   */
  hideDefaultPostGiftCta?: boolean;
  /**
   * How the gift subtree arrives. Defaults to the scale spring every gift has
   * always used; gifts whose own reveal has a fixed anchor point (e.g. the Love
   * Receipt's printer) opt out via the registry. See ./gift-reveal.tsx.
   */
  entrance?: GiftEntrance;
  /**
   * Where the gift column sits in the viewport.
   *
   * `center` (default, unchanged) vertically centres it. That is fine for a
   * gift whose height is known up front, but it couples EVERY element's
   * position to the total height of the subtree: when content below grows —
   * a webfont swapping in, a doodle PNG decoding, a receipt getting longer —
   * the centred column grows and its top edge travels UPWARD.
   *
   * `top` anchors the column to the top of the viewport, so anything above
   * stays put no matter how much the content below it reflows. Gifts with a
   * fixed on-screen apparatus (the Love Receipt's printer) need this: measured
   * on that route, late-loading doodles grew the receipt from 430px to 859px
   * and dragged the printer 203px up the screen at 6x CPU throttle.
   */
  contentAlign?: 'center' | 'top';
}

export function GiftFrame({
  gift,
  replayBehavior,
  children,
  anticipationMs,
  hideDefaultPostGiftCta = false,
  entrance,
  contentAlign = 'center',
}: GiftFrameProps) {
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
    anticipationMs,
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
      <div
        className={`relative flex min-h-screen flex-col items-center overflow-hidden bg-surface px-4 ${
          contentAlign === 'top' ? 'justify-start' : 'justify-center'
        }`}
      >
        <AnticipationScreen
          recipientName={gift.recipientName}
          visible={phase === 'anticipation'}
        />

        {showGift && (
          <GiftReveal
            visible={showGift}
            entrance={entrance}
            onAnimationComplete={onRevealComplete}
          >
            {children}
          </GiftReveal>
        )}

        {phase === 'climax' && <ReactionSnapSlot />}

        {isPostGift && !hideDefaultPostGiftCta && (
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
