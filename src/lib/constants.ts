export const BRAND_NAME = 'HoneyHearts';
export const BRAND_TAGLINE = 'Craft unforgettable interactive surprises';
export const PRODUCTION_URL = 'https://honeyhearts.com';

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const SHORT_ID_LENGTH = 6;

export const GIFT_TIERS = {
  quick: { price: 0, label: 'Quick Love Notes' },
  crafted: { price: 4900, label: 'Crafted Experiences' },
  wildcard: { price: 4900, label: 'Wildcard' },
  couple: { price: 4900, label: 'Couple Experiences' },
  living: { price: 14900, label: 'Living Gifts' },
  'mini-game': { price: 0, label: 'Mini Games' },
  seasonal: { price: 4900, label: 'Seasonal Specials' },
  personal: { price: 4900, label: 'Deeply Personal' },
} as const;

export const FREE_GIFT_EXPIRY_DAYS = 90;

export const WATERMARK_REMOVAL_PRICE = 2900;
