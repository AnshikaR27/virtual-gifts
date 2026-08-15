'use client';

/**
 * OUR_STORY's receiver — the registry-shaped entry point.
 *
 * Thin on purpose: it reads the stored payload, hands it to <OurStoryFlow>, and
 * reports back to <GiftFrame>. All the actual behaviour lives in the flow and
 * the wall, which know nothing about gifts, routes or the DB — that is what
 * lets the preview route render them without a database row.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  NOT REGISTERED YET, AND THAT IS DELIBERATE.                              │
 * │  gifts/registry.ts requires a SenderComponent, and OUR_STORY has no       │
 * │  sender flow — there is nothing that writes a memory payload, no schema    │
 * │  for one, and no rows in the DB. Registering now would mean inventing a   │
 * │  stub sender and advertising a /g/<id> route that cannot have real data   │
 * │  behind it.                                                               │
 * │                                                                           │
 * │  TO REGISTER once a sender exists, add to gifts/registry.ts:              │
 * │    registerGift({                                                          │
 * │      slug: 'our-story',                                                    │
 * │      tier: 'free',                                                         │
 * │      SenderComponent: OurStorySender,                                      │
 * │      ReceiverComponent: OurStoryReceiver,                                  │
 * │      replayBehavior: 'replayable',                                         │
 * │      contentAlign: 'top',                                                  │
 * │    });                                                                     │
 * │  This component already matches GiftReceiverProps, so nothing here needs   │
 * │  to change when that happens.                                             │
 * └───────────────────────────────────────────────────────────────────────────┘
 */

import { useCallback, useRef } from 'react';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { OurStoryFlow } from './our-story-flow';
import { normalizeMemories } from './memories';

export function OurStoryReceiver({ gift }: { gift: GiftData }) {
  const { onClimax, trackInteraction } = useGiftContext();

  // Resolved once. The memories must not be re-derived (or re-shuffled) by an
  // unrelated re-render while the recipient is part-way through the wall.
  const memoriesRef = useRef(normalizeMemories(gift.contentJsonb?.memories));

  const climaxFired = useRef(false);

  const handleUnlock = useCallback(() => {
    trackInteraction('our_story_unlocked');
  }, [trackInteraction]);

  /**
   * The climax is the FIRST memory read, not the gate being passed. Getting
   * through a keypad is not the moment the gift lands; turning over a
   * photograph and finding something written on the back is.
   */
  const handleFirstFlip = useCallback(() => {
    if (climaxFired.current) return;
    climaxFired.current = true;
    onClimax();
  }, [onClimax]);

  const handleFlip = useCallback(
    (id: string) => {
      trackInteraction('memory_flipped', id);
    },
    [trackInteraction],
  );

  return (
    <OurStoryFlow
      memories={memoriesRef.current}
      onUnlock={handleUnlock}
      onFirstFlip={handleFirstFlip}
      onFlip={handleFlip}
    />
  );
}
