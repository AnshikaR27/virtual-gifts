/**
 * Love Receipt — content model + suggestion library (NO AI).
 *
 * Everything the sender needs to fill a receipt lives here as plain data so the
 * gift works with zero AI. The optional Gemini phase returns the same
 * `SuggestionSeed` shape and is layered on top of this library.
 *
 * `[Name]` in any template is the recipient; `[you]` is the sender (cashier).
 * Use {@link applyTemplate} to resolve them.
 */

export type ReceiptLanguage = 'en' | 'hinglish';

/** A starter line in the suggestion library (template strings, pre-substitution). */
export interface SuggestionSeed {
  text: string;
  price: string;
}

/** A finalized line item on the receipt. */
export interface ReceiptLine {
  id: string;
  text: string;
  price: string;
}

/** A label/value summary row (subtotal / discount / tax). */
export interface ReceiptSummaryRow {
  label: string;
  price: string;
}

/** The full serialized receipt — what we store in gifts.content_jsonb. */
export interface ReceiptPayload {
  version: 1;
  language: ReceiptLanguage;
  recipientName: string;
  senderName: string;
  relationship: string;
  storeName: string;
  subtitle: string;
  /** "Receipt" sub-header — kept in payload so it can be localized later. */
  receiptLabel: string;
  dateLabel: string;
  lines: ReceiptLine[];
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  total: string;
  footer: string;
  /** null = no stamp. */
  memeStamp: string | null;
}

/** Default price applied when the sender leaves a line's price blank. */
export const DEFAULT_PRICE = 'priceless';

/** The barcode at the foot of every receipt always spells this. */
export const BARCODE_TEXT = 'ILOVEYOU';

export const NEW_LINE_MAX = 60;
export const PRICE_MAX = 24;

// ── Suggestion library ────────────────────────────────────────────────

export const SUGGESTIONS: Record<ReceiptLanguage, SuggestionSeed[]> = {
  en: [
    { text: 'Stealing the blanket every single night', price: '₹0 (worth it)' },
    { text: '3 a.m. "are you up?" texts', price: 'priceless' },
    { text: 'The way you say my name', price: '₹∞' },
    { text: 'Forehead kisses on demand', price: 'non-refundable' },
    { text: 'Letting me win arguments (knowingly)', price: '₹0' },
    { text: 'Putting up with my playlists', price: 'unpayable' },
    { text: 'Being my emergency contact for everything', price: 'invaluable' },
    { text: 'Your laugh that lives rent free in my head', price: 'priceless' },
    { text: 'That one embarrassing pet name', price: 'mortifying, ₹∞' },
    { text: 'Killing every spider so I stay brave', price: 'invaluable' },
  ],
  hinglish: [
    { text: 'the way you say mera naam, I’m unwell', price: 'priceless' },
    { text: 'teri hassi has me in a chokehold fr', price: '₹∞' },
    { text: 'you live rent free in my dimaag 24/7', price: '₹0 (no eviction)' },
    {
      text: 'neend mein bhi paas kheench lete ho, I’m down bad',
      price: '₹∞',
    },
    { text: 'bada wala piece always mujhe?? marry me', price: 'priceless' },
    {
      text: 'double text bc 4 min mein hi miss kar diya',
      price: 'non-refundable',
    },
    {
      text: 'my whole personality is "[Name]’s gf" now',
      price: '₹0 (worth it)',
    },
    { text: 'green flag in a field of red, tu rare hai', price: 'anmol' },
    {
      text: 'spiders maar dena so I keep my brave-girl arc',
      price: 'invaluable',
    },
    {
      text: '"ghar jaana" = "tere paas jaana" now, pls fix',
      price: '₹∞',
    },
  ],
};

// ── Scaffolding (auto-filled, editable) ───────────────────────────────

/** Total options the sender picks one of (shared across languages). */
export const TOTAL_OPTIONS = [
  'everything I have + thoda extra 🥹',
  'priceless',
  'more than I could ever repay',
] as const;

/** Meme rubber-stamp options (null = none). */
export const MEME_STAMPS = [
  'CERTIFIED DELULU',
  'AS SEEN ON YOUR FYP',
  '100% MAIN CHARACTER',
] as const;

interface ScaffoldDefaults {
  storeName: string;
  subtitle: string;
  receiptLabel: string;
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  footer: string;
}

/**
 * Per-language scaffolding. Templates still contain [Name]/[you]; resolve with
 * {@link buildScaffold} once the names are known.
 */
const SCAFFOLD: Record<ReceiptLanguage, ScaffoldDefaults> = {
  en: {
    storeName: "[Name]'s Heart Mart",
    subtitle: 'Open 24/7 · Aisle of Adoration · No. 143',
    receiptLabel: 'Receipt',
    subtotal: { label: 'Subtotal', price: 'my entire heart' },
    discount: {
      label: 'Loyalty Discount — day one se tu hi tu',
      price: '−100%',
    },
    tax: { label: 'Emotional Damage Tax', price: "₹0 (you're worth it)" },
    footer:
      "Thank you for shopping at [Name]'s Heart Mart 💕 — Cashier: [you] — No refunds, no returns, you're stuck with me 4ever",
  },
  hinglish: {
    storeName: "[Name]'s Heart Mart",
    subtitle: 'Open 24/7 · Pyaar ka aisle · Counter No. 143',
    receiptLabel: 'Receipt',
    subtotal: { label: 'Subtotal', price: 'mera poora dil' },
    discount: {
      label: 'Loyalty Discount — day one se tu hi tu',
      price: '−100%',
    },
    tax: { label: 'Emotional Damage Tax', price: "₹0 (you're worth it)" },
    footer:
      "Thank you for shopping at [Name]'s Heart Mart 💕 — Cashier: [you] — No refunds, no returns, you're stuck with me 4ever",
  },
};

/** Replace [Name] / [you] tokens in a template string. */
export function applyTemplate(
  template: string,
  recipientName: string,
  senderName: string,
): string {
  const name = recipientName.trim() || 'you';
  const you = senderName.trim() || 'me';
  return template.replaceAll('[Name]', name).replaceAll('[you]', you);
}

/** Resolve the scaffolding for a language with the given names filled in. */
export function buildScaffold(
  language: ReceiptLanguage,
  recipientName: string,
  senderName: string,
): ScaffoldDefaults {
  const base = SCAFFOLD[language];
  const fill = (s: string) => applyTemplate(s, recipientName, senderName);
  return {
    storeName: fill(base.storeName),
    subtitle: base.subtitle,
    receiptLabel: base.receiptLabel,
    subtotal: { ...base.subtotal },
    discount: { ...base.discount },
    tax: { ...base.tax },
    footer: fill(base.footer),
  };
}

/** Resolve a suggestion seed into a usable line text (substitutes [Name]). */
export function resolveSeedText(
  seed: SuggestionSeed,
  recipientName: string,
  senderName: string,
): string {
  return applyTemplate(seed.text, recipientName, senderName);
}

/** Human date stamp for the receipt header, e.g. "06/06/2026 18:37". */
export function formatReceiptDate(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
