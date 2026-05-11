export type GiftStatus = 'draft' | 'paid' | 'sent' | 'archived';

export type GiftTier =
  | 'quick'
  | 'crafted'
  | 'wildcard'
  | 'couple'
  | 'living'
  | 'mini-game'
  | 'seasonal'
  | 'personal';

export type Locale = 'en' | 'hi';

export type ReplayBehavior =
  | 'replayable'
  | 'one-shot-with-replay-from-end'
  | 'persistent-state';

export interface GiftMeta {
  slug: string;
  name: string;
  tier: GiftTier;
  price: number;
  description: string;
  replayBehavior: ReplayBehavior;
  free: boolean;
}
