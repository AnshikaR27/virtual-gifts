import type { ComponentType } from 'react';
import type { ReplayBehavior } from '@/types';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { TiffinNoteSender } from './tiffin-note/sender';
import { TiffinNoteReceiver } from './tiffin-note/receiver';

/**
 * Gift registry — maps a slug to its sender + receiver components so routes can
 * render the right gift without hardcoding. Gift #1 (tiffin-note) is the
 * reference entry; future gifts call registerGift() the same way.
 */

export interface GiftReceiverProps {
  gift: GiftData;
}

export interface GiftDefinition {
  slug: string;
  /** Pricing tier label ("free" for gift #1). */
  tier: string;
  SenderComponent: ComponentType;
  ReceiverComponent: ComponentType<GiftReceiverProps>;
  replayBehavior: ReplayBehavior;
}

const registry = new Map<string, GiftDefinition>();

export function registerGift(def: GiftDefinition): void {
  registry.set(def.slug, def);
}

export function getGiftDefinition(slug: string): GiftDefinition | undefined {
  return registry.get(slug);
}

export function getAllGiftDefinitions(): GiftDefinition[] {
  return Array.from(registry.values());
}

// ── Registered gifts ──────────────────────────────────────────────────
registerGift({
  slug: 'tiffin-note',
  tier: 'free',
  SenderComponent: TiffinNoteSender,
  ReceiverComponent: TiffinNoteReceiver,
  replayBehavior: 'replayable',
});
