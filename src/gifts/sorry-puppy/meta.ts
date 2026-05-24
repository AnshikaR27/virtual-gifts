import type { GiftMeta } from '@/types';
import { registerGift } from '@/gifts/registry';

export const sorryPuppyMeta: GiftMeta = {
  slug: 'sorry-puppy',
  name: 'Sorry Puppy',
  tier: 'quick',
  price: 0,
  description: 'A sad puppy in the rain. Your taps clear the sky.',
  replayBehavior: 'replayable',
  free: true,
};

registerGift(sorryPuppyMeta);
