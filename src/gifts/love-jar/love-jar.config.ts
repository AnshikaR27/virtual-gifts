import type { GiftMeta } from '@/types';
import { registerGift } from '@/gifts/registry';

export const loveJarMeta: GiftMeta = {
  slug: 'love-jar',
  name: 'Love Jar',
  tier: 'crafted',
  price: 499,
  description:
    'A jar full of handwritten love notes. Shake to reveal each one.',
  replayBehavior: 'replayable',
  free: false,
};

registerGift(loveJarMeta);
