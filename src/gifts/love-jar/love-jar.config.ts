import type { GiftMeta } from '@/types';
import { registerGift } from '@/gifts/registry';

export interface JarPalette {
  id: number;
  name: string;
  body: string;
  heart: string;
  rimDark: string;
  highlightLight: string;
  shadowDark: string;
}

export const JAR_PALETTES: JarPalette[] = [
  {
    id: 1,
    name: 'Hot Pink + White',
    body: '#D81B60',
    heart: '#FFF6F0',
    rimDark: '#B0184F',
    highlightLight: '#E84580',
    shadowDark: '#C2185B',
  },
  {
    id: 2,
    name: 'Blush + Magenta',
    body: '#F8BBD0',
    heart: '#B0184F',
    rimDark: '#E8A0B8',
    highlightLight: '#FCD0DF',
    shadowDark: '#ECA8C0',
  },
  {
    id: 3,
    name: 'Deep Magenta + Pink',
    body: '#780037',
    heart: '#F8BBD0',
    rimDark: '#5C002A',
    highlightLight: '#921050',
    shadowDark: '#660030',
  },
  {
    id: 4,
    name: 'Cream + Magenta',
    body: '#FFF6F0',
    heart: '#D81B60',
    rimDark: '#E8DDD5',
    highlightLight: '#FFFFFF',
    shadowDark: '#F0E5DC',
  },
  {
    id: 5,
    name: 'Sage + Cream',
    body: '#A8C09A',
    heart: '#FFF6F0',
    rimDark: '#8BA87C',
    highlightLight: '#BDD0B0',
    shadowDark: '#96B088',
  },
];

export const DEFAULT_PALETTE = JAR_PALETTES[0];

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
