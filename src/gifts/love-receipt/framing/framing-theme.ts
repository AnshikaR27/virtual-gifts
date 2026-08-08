/**
 * PREVIEW-ONLY — the field-color seam.
 *
 * The FRAME owns the field; PrintStage stays backdrop-transparent and only
 * borrows ink for the reply CTA. One PrintStage serves every variant.
 *
 * `print` and `notif` share DARK, whose values are the literal ones those two
 * scenes shipped with — their render is byte-identical to before this file
 * existed. `warm` is the new blush field.
 */

import type { FramingVariant } from './reveal-framing';

export interface FieldTheme {
  /** Full-bleed background behind everything. Owned by RevealFraming. */
  field: string;
  /** Reply-CTA label ink. Owned by PrintStage. */
  ctaInk: string;
  /** Reply-CTA border. */
  ctaBorder: string;
  /** :focus-visible ring on the stage. */
  focusRing: string;
}

/** Cold field — the machine voice. Variants A and B. */
const DARK: FieldTheme = {
  field:
    'radial-gradient(88% 52% at 50% 34%, #17131d 0%, #0d0b11 62%, #0a080d 100%)',
  ctaInk: '#f4f1ea',
  ctaBorder: 'rgba(244, 241, 234, 0.38)',
  focusRing: '#f4f1ea',
};

/**
 * Warm field — variant C. Same gradient geometry as DARK so the two fields are
 * one object with different values, not two different ideas. Every stop is a
 * real design-system token (§3.2): Warm Paper → Lavender Blush → Blush.
 * Ink is warm brown (§10: never pure black or cold gray on paper).
 */
const BLUSH: FieldTheme = {
  field:
    'radial-gradient(88% 52% at 50% 34%, #FFFCF6 0%, #FFF0F5 58%, #FFD6E5 100%)',
  ctaInk: '#3D2817',
  ctaBorder: 'rgba(61, 40, 23, 0.30)',
  focusRing: '#3D2817',
};

export const FIELD_THEMES: Record<FramingVariant, FieldTheme> = {
  print: DARK,
  notif: DARK,
  warm: BLUSH,
};
