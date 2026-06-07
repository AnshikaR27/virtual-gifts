/**
 * Love Receipt — content model + the single curated pool (NO AI required).
 *
 * The gift is now a SINGLE flat-pool receipt: one fixed "DELULU MART" frame plus
 * a balanced tone-shuffle over {@link LOVE_RECEIPT_POOL}. No user-facing
 * categories. English only for now — a Hinglish pool can sit beside the English
 * one later as a pure data drop (see {@link ReceiptLanguage}). // REVISIT
 *
 * The optional AI phase ({@link generateReceipt}) only varies the line items; it
 * returns the same {text, price} shape and falls back to the pool, so the gift
 * always works offline.
 */

import {
  LOVE_RECEIPT_POOL,
  COLLISION_PAIRS,
  DEFAULT_STARTING_IDS,
  type PoolLine,
  type Tone,
} from './love-receipt-pool';

// Re-exported so consumers have a single import surface (`./lines`).
export { DEFAULT_STARTING_IDS } from './love-receipt-pool';

/**
 * Only 'en' carries data today. Kept as a union (not a literal) so a Hinglish
 * pool can be added later as a data drop rather than a type refactor. // REVISIT
 */
export type ReceiptLanguage = 'en' | 'hinglish';

/** A starter line (template-free) — what the AI returns and what the pool maps to. */
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
  /** meta block under the header — "Cashier: …", "Bill #…", "GSTIN: …". */
  cashier: string;
  billNumber: string;
  gstin: string;
  lines: ReceiptLine[];
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  total: string;
  /** how the bill was "paid" — shown under TOTAL DUE. */
  paidVia: string;
  /** italic mock-legal disclaimer near the bottom. */
  finePrint: string;
  /** second italic line — the cheeky "return policy". */
  returnPolicy: string;
  /** caption under the faux barcode. */
  scanLine: string;
  footer: string;
  /** null = no stamp. */
  memeStamp: string | null;
}

/** Default price applied when a line's price is left blank. */
export const DEFAULT_PRICE = 'priceless';

/** The barcode at the foot of every receipt always spells this. */
export const BARCODE_TEXT = 'ILOVEYOU';

export const NEW_LINE_MAX = 60;
export const PRICE_MAX = 24;

// ── the single locked frame ─────────────────────────────────────────────
// Everything except the line items. Fixed defaults, but every field stays
// editable in the builder (on-paper or via the fine-print panel).

export interface ReceiptScaffold {
  storeName: string;
  subtitle: string;
  receiptLabel: string;
  cashier: string;
  billNumber: string;
  gstin: string;
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  total: string;
  paidVia: string;
  finePrint: string;
  returnPolicy: string;
  scanLine: string;
  footer: string;
  stamp: string;
}

const FRAME: ReceiptScaffold = {
  storeName: 'DELULU MART',
  subtitle: 'est. the day i met u',
  receiptLabel: 'Receipt',
  cashier: 'my last 2 braincells',
  billNumber: '4EVER-001',
  gstin: 'NOCHILL69420',
  subtotal: { label: 'SUBTOTAL', price: 'too much' },
  tax: { label: 'delusion tax (200%)', price: 'generous' },
  discount: { label: '"you’re cute" discount', price: '-100%' },
  total: 'my whole ❤',
  paidVia: 'emotional damage',
  finePrint: 'all sales final. no refunds on feelings.',
  returnPolicy: "return policy: you can't — you're stuck with me <3",
  scanLine: 'scan = how down bad i am',
  footer: 'come again (tonight?)',
  stamp: 'CERTIFIED DELULU',
};

/** A fresh copy of the locked frame (summary rows cloned so callers can't
 *  mutate the shared default). */
export function buildScaffold(): ReceiptScaffold {
  return {
    ...FRAME,
    subtotal: { ...FRAME.subtotal },
    discount: { ...FRAME.discount },
    tax: { ...FRAME.tax },
  };
}

/** Human date stamp for the receipt header, e.g. "08/06/2026 18:37". */
export function formatReceiptDate(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

// ── balanced tone-shuffle over the single pool ──────────────────────────
// Draw 4 lines at a time, one per tone, rotating across all 6 tones so every
// tone cycles over consecutive regenerates. Dedupe prices within a draw, respect
// collision pairs, and track shownIds so regenerate stays fresh until the pool's
// exhausted (then it resets rather than dead-ending). Offline-safe: no AI.

export const STARTING_LINE_COUNT = 4;

const TONE_ORDER: Tone[] = [
  'giggle',
  'petty',
  'delulu',
  'real-life',
  'almost-moment',
  'tender',
];

const POOL_BY_ID = new Map(LOVE_RECEIPT_POOL.map((l) => [l.id, l]));

/** id → set of ids it must never share a draw with (symmetric). */
const COLLISION_MAP = (() => {
  const m = new Map<string, Set<string>>();
  for (const [a, b] of COLLISION_PAIRS) {
    if (!m.has(a)) m.set(a, new Set());
    if (!m.has(b)) m.set(b, new Set());
    m.get(a)!.add(b);
    m.get(b)!.add(a);
  }
  return m;
})();

function toLine(p: PoolLine): ReceiptLine {
  return { id: p.id, text: p.text, price: p.price };
}

/** The hand-picked opening four — loaded before any interaction (no empty state). */
export function getStartingLines(): ReceiptLine[] {
  return DEFAULT_STARTING_IDS.map((id) => POOL_BY_ID.get(id))
    .filter((l): l is PoolLine => !!l)
    .map(toLine);
}

export interface BalancedDraw {
  lines: ReceiptLine[];
  /** updated shown-ids set (caller persists for the next draw). */
  shownIds: Set<string>;
  /** advanced tone cursor (caller persists for the next draw). */
  toneCursor: number;
}

/**
 * Pull a balanced set of {@link STARTING_LINE_COUNT} lines: one per tone across
 * 4 distinct tones (rotating via `toneCursor`), all prices distinct, no collision
 * pair together, none in `shownIds`. If too few fresh lines remain, `shownIds`
 * resets so a draw always succeeds.
 */
export function sampleBalanced(
  shownIdsIn: ReadonlySet<string>,
  toneCursor: number,
  count = STARTING_LINE_COUNT,
): BalancedDraw {
  let shown = new Set(shownIdsIn);
  if (LOVE_RECEIPT_POOL.filter((l) => !shown.has(l.id)).length < count) {
    shown = new Set(); // pool exhausted → reset rather than dead-end
  }

  const pickedIds = new Set<string>();
  const pickedPrices = new Set<string>();
  const picks: PoolLine[] = [];

  const isEligible = (l: PoolLine) => {
    if (shown.has(l.id) || pickedIds.has(l.id)) return false;
    if (pickedPrices.has(l.price)) return false; // dedupe prices within a draw
    const foes = COLLISION_MAP.get(l.id);
    if (foes && Array.from(foes).some((f) => pickedIds.has(f))) return false;
    return true;
  };

  const take = (candidates: PoolLine[]) => {
    const eligible = candidates.filter(isEligible);
    if (!eligible.length) return false;
    const choice = eligible[Math.floor(Math.random() * eligible.length)];
    picks.push(choice);
    pickedIds.add(choice.id);
    pickedPrices.add(choice.price);
    return true;
  };

  for (let i = 0; i < count; i++) {
    const tone = TONE_ORDER[(toneCursor + i) % TONE_ORDER.length];
    // one line of this tone; if its tone is exhausted/blocked, take any eligible
    if (!take(LOVE_RECEIPT_POOL.filter((l) => l.tone === tone))) {
      take(LOVE_RECEIPT_POOL);
    }
  }
  // safety top-up if collisions/dupes left us short
  while (picks.length < count && take(LOVE_RECEIPT_POOL)) {
    /* keep filling */
  }

  picks.forEach((p) => shown.add(p.id));
  return {
    lines: picks.map(toLine),
    shownIds: shown,
    toneCursor: (toneCursor + count) % TONE_ORDER.length,
  };
}

// ── "make it personal" optional questions ──────────────────────────────
export interface PersonalQuestion {
  key: string;
  label: string;
  placeholder: string;
}

export const PERSONAL_QUESTIONS: PersonalQuestion[] = [
  {
    key: 'delulu_belief',
    label: 'the most delulu thing you believe about you two?',
    placeholder: 'we were besties in a past life…',
  },
  {
    key: 'steals',
    label: 'what do they steal from you daily?',
    placeholder: 'fries, hoodies, my sanity…',
  },
  {
    key: 'feral',
    label: 'a tiny thing they do that makes you go feral (cutely)?',
    placeholder: 'the way they say my name…',
  },
  {
    key: 'inside_joke',
    label: 'your dumbest inside joke?',
    placeholder: 'don’t even ask, it’s “potato”…',
  },
  {
    key: 'kicking_feet',
    label:
      'what did they do recently that had you kicking your feet & giggling?',
    placeholder: 'texted goodnight first…',
  },
  {
    key: 'minor_crimes',
    label: 'finish it: “I’d commit minor crimes for ___”',
    placeholder: 'their forehead kisses…',
  },
];

// ── generation contract (shared by the AI action + pool fallback) ───────
export interface GeneratedReceipt {
  storeName?: string;
  subtitle: string;
  cashier?: string;
  billNumber?: string;
  gstin?: string;
  lines: SuggestionSeed[];
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  total: string;
  paidVia?: string;
  finePrint?: string;
  returnPolicy?: string;
  scanLine?: string;
  footer: string;
  memeStamp: string | null;
}

export interface GenerateInput {
  recipientName: string;
  senderName: string;
  relationship: string;
  /** Only 'en' is generated today; kept for a future Hinglish drop. // REVISIT */
  language: ReceiptLanguage;
  answers: Record<string, string>;
  /** "extra" cranks the cringe for the 🌶️ make-it-cringier button. */
  spice?: 'normal' | 'extra';
}

/**
 * No-AI fallback — a complete receipt: the locked frame + a balanced draw of
 * lines from the single pool. Used when AI is unavailable and as the source of
 * the frame fields for {@link coerce}.
 */
export function buildFallbackReceipt(): GeneratedReceipt {
  const frame = buildScaffold();
  const { lines } = sampleBalanced(new Set(), 0);
  return {
    storeName: frame.storeName,
    subtitle: frame.subtitle,
    cashier: frame.cashier,
    billNumber: frame.billNumber,
    gstin: frame.gstin,
    lines: lines.map((l) => ({ text: l.text, price: l.price })),
    subtotal: { ...frame.subtotal },
    discount: { ...frame.discount },
    tax: { ...frame.tax },
    total: frame.total,
    paidVia: frame.paidVia,
    finePrint: frame.finePrint,
    returnPolicy: frame.returnPolicy,
    scanLine: frame.scanLine,
    footer: frame.footer,
    memeStamp: frame.stamp,
  };
}
