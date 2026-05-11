import type { GiftMeta } from '@/types';

const giftRegistry = new Map<string, GiftMeta>();

export function registerGift(meta: GiftMeta): void {
  giftRegistry.set(meta.slug, meta);
}

export function getGiftMeta(slug: string): GiftMeta | undefined {
  return giftRegistry.get(slug);
}

export function getAllGifts(): GiftMeta[] {
  return Array.from(giftRegistry.values());
}

export function getGiftsByTier(tier: GiftMeta['tier']): GiftMeta[] {
  return getAllGifts().filter((g) => g.tier === tier);
}
