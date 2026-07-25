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
  LOVE_RECEIPT_TOTALS,
  COLLISION_PAIRS,
  DEFAULT_STARTING_IDS,
  DEFAULT_TOTAL_ID,
  type PoolLine,
  type ReceiptTotal,
  type Tone,
} from './love-receipt-pool';

// Re-exported so consumers have a single import surface (`./lines`).
export { DEFAULT_STARTING_IDS } from './love-receipt-pool';
export type { ReceiptTotal } from './love-receipt-pool';

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
  /**
   * The source pool line's id (e.g. "lr-001"), carried through so the
   * line-bound doodle layer can resolve a doodle for this line. Absent on
   * custom/user-added lines (and on AI-generated lines) — those get no doodle.
   */
  poolId?: string;
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
  /** meta block under the header — "Cashier: …", "Billed to: …", "Bill #…", "GSTIN: …". */
  cashier: string;
  /** who the receipt is made out to — "Billed to: [recipientName]". */
  billedTo: string;
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
}

/** Default price applied when a line's price is left blank. */
export const DEFAULT_PRICE = 'on the house';

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
  billedTo: string;
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
}

/** Inputs that personalize the otherwise-locked DELULU MART frame. Both names
 *  are optional — graceful fallbacks fill the no-name (sender-preview) state. */
export interface FrameNames {
  recipientName?: string;
  senderName?: string;
}

/**
 * Build the locked DELULU MART frame, with name tokens filled from the gift's
 * metadata. Everything except the two name-bearing fields (est. line +
 * "Billed to") and the cashier is constant; the store name is ALWAYS DELULU MART.
 *
 * Fallbacks keep the no-name state graceful:
 *   • est. line  → "est. the day i met you"     (recipientName missing)
 *   • Billed to  → "my favourite person"        (recipientName missing)
 *   • Cashier    → "my last 2 braincells"        (senderName missing)
 *
 * Summary rows are fresh objects so callers can't mutate a shared default.
 */
export function buildFrame(names: FrameNames = {}): ReceiptScaffold {
  const recipient = names.recipientName?.trim();
  const sender = names.senderName?.trim();
  return {
    storeName: 'DELULU MART',
    subtitle: `est. the day i met ${recipient || 'you'}`,
    billedTo: recipient || 'my favourite person',
    receiptLabel: 'Receipt',
    cashier: sender ? `${sender}'s last 2 braincells` : 'my last 2 braincells',
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
// Draw 4 lines at a time with the receipt's whole appeal — tonal whiplash —
// GUARANTEED: every draw reserves one joke anchor (side 'funny'), one
// gut-punch anchor (side 'tender'), and one flavor anchor (the lived-in tones —
// 'real-life' / 'almost-moment'), then fills the last slot with a tone not yet
// in the draw. Dedupe prices within a draw, respect collision pairs, and track
// shownIds so regenerate stays fresh until the pool's exhausted (then it resets
// rather than dead-ending). Offline-safe: no AI.

export const STARTING_LINE_COUNT = 4;

const TONE_ORDER: Tone[] = [
  'giggle',
  'petty',
  'delulu',
  'real-life',
  'almost-moment',
  'tender',
];

/** The three funny tones — the joke anchor rotates across these via toneCursor. */
const FUNNY_TONES: Tone[] = ['giggle', 'petty', 'delulu'];

/**
 * The two flavor tones — the specific, lived-in lines (temple sandals, "khaana
 * khaya?", the metro wall). The strongest material in the pool, so one is
 * anchored into every draw.
 */
const FLAVOR_TONES: Tone[] = ['real-life', 'almost-moment'];

/**
 * Which flavor tone the anchor takes, indexed by `toneCursor`. Length 3 is
 * deliberate and load-bearing: `toneCursor` advances by STARTING_LINE_COUNT (4)
 * mod TONE_ORDER.length (6), so it only ever visits {0, 4, 2}. Indexing a
 * length-2 array by those would be `% 2` — always 0 — pinning the anchor to
 * 'real-life' forever. Length 3 hits all three residues (as FUNNY_TONES does),
 * and the 2:1 weighting toward 'real-life' matches supply: 17 real-life lines
 * against 7 almost-moment, so the scarcer tone isn't drained first.
 */
const FLAVOR_ROTATION: Tone[] = ['real-life', 'almost-moment', 'real-life'];

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
  // Carry the pool id through as poolId so the doodle layer can bind to it; the
  // tone stays derivable from poolId and is NOT separately persisted.
  return { id: p.id, text: p.text, price: p.price, poolId: p.id };
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
 * Pull a balanced set of {@link STARTING_LINE_COUNT} lines with the whiplash
 * GUARANTEED: ≥1 joke (side 'funny'), ≥1 gut-punch (side 'tender'), AND ≥1 flavor
 * line ({@link FLAVOR_TONES}). Three anchor slots are reserved up front — slot A a
 * funny line, slot B a tender line, slot C a flavor line (A and C rotate WHICH
 * tone via `toneCursor` for variety) — and the last slot takes a tone not already
 * in the draw, so every receipt carries four distinct tones and no tone gets
 * double-dipped by the fill. Because funny/tender/flavor are already claimed by
 * then, that last slot most often lands on the second flavor tone or a second
 * joke tone — a second flavor line is common but never guaranteed.
 *
 * All prices distinct, no collision pair together, fresh (not in `shownIds`)
 * where possible. If too few fresh lines remain, `shownIds` resets so a draw
 * always succeeds; the three anchors additionally relax freshness as a last
 * resort so the funny+tender+flavor minimum can never fail.
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

  // `ignoreShown` only ever flips for the anchor slots, and only when no FRESH
  // line of a required side remains — so the funny+tender guarantee holds even at
  // the bottom of the pool, while the bulk of the draw stays fresh.
  const isEligible = (l: PoolLine, ignoreShown = false) => {
    if (pickedIds.has(l.id)) return false;
    if (!ignoreShown && shown.has(l.id)) return false;
    if (pickedPrices.has(l.price)) return false; // dedupe prices within a draw
    const foes = COLLISION_MAP.get(l.id);
    if (foes && Array.from(foes).some((f) => pickedIds.has(f))) return false;
    return true;
  };

  const take = (candidates: PoolLine[], relaxFreshness = false) => {
    let eligible = candidates.filter((l) => isEligible(l));
    if (!eligible.length && relaxFreshness) {
      eligible = candidates.filter((l) => isEligible(l, true));
    }
    if (!eligible.length) return false;
    const choice = eligible[Math.floor(Math.random() * eligible.length)];
    picks.push(choice);
    pickedIds.add(choice.id);
    pickedPrices.add(choice.price);
    return true;
  };

  // ── anchor slots — make the whiplash unmissable ──
  // Slot A: one joke. Rotate WHICH funny tone via the cursor so consecutive draws
  // vary; fall back to any funny line if that tone is blocked/exhausted.
  const funnyTone = FUNNY_TONES[toneCursor % FUNNY_TONES.length];
  if (
    !take(
      LOVE_RECEIPT_POOL.filter(
        (l) => l.side === 'funny' && l.tone === funnyTone,
      ),
      true,
    )
  ) {
    take(
      LOVE_RECEIPT_POOL.filter((l) => l.side === 'funny'),
      true,
    );
  }
  // Slot B: one genuine gut-punch.
  take(
    LOVE_RECEIPT_POOL.filter((l) => l.side === 'tender'),
    true,
  );
  // Slot C: one flavor line — the specific, lived-in material. Rotate WHICH
  // flavor tone via the cursor; fall back to any flavor line if that tone is
  // blocked/exhausted, so the flavor guarantee holds like the other two.
  const flavorTone = FLAVOR_ROTATION[toneCursor % FLAVOR_ROTATION.length];
  if (
    !take(
      LOVE_RECEIPT_POOL.filter((l) => l.tone === flavorTone),
      true,
    )
  ) {
    take(
      LOVE_RECEIPT_POOL.filter((l) => FLAVOR_TONES.includes(l.tone)),
      true,
    );
  }

  // ── remaining slots — cursor rotation, skipping tones already in the draw ──
  // Skipping used tones is what keeps the fill from re-serving tender or the
  // anchor's funny tone (which is what previously pushed tender to ~30% of all
  // lines). With three tones claimed, the fill lands on a fresh joke tone or the
  // OTHER flavor tone — hence second-flavor-often, never-guaranteed.
  const usedTones = () => new Set(picks.map((p) => p.tone));
  for (let i = 0; picks.length < count && i < TONE_ORDER.length; i++) {
    const used = usedTones();
    const tone = TONE_ORDER[(toneCursor + i) % TONE_ORDER.length];
    if (used.has(tone)) continue;
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

// ── total selection (the receipt's final gut-punch) ─────────────────────
const normPrice = (p: string): string => p.trim().toLowerCase();

/**
 * The deterministic first-paint total ({@link DEFAULT_TOTAL_ID}). Used to seed
 * the builder before any regenerate so the opener is stable.
 */
export function getDefaultTotal(): ReceiptTotal {
  return (
    LOVE_RECEIPT_TOTALS.find((t) => t.id === DEFAULT_TOTAL_ID) ??
    LOVE_RECEIPT_TOTALS[0]
  );
}

/**
 * Pick a random TOTAL whose normalized price doesn't echo any drawn line's price
 * (so the total stamp never duplicates a line stamp). Falls back to the full set
 * only in the impossible case that every total collides, so the slot stays filled.
 */
export function pickTotal(
  drawnLines: ReadonlyArray<{ price: string }>,
  rng: () => number = Math.random,
): ReceiptTotal {
  const used = new Set(drawnLines.map((l) => normPrice(l.price)));
  const eligible = LOVE_RECEIPT_TOTALS.filter(
    (t) => !used.has(normPrice(t.price)),
  );
  const pool = eligible.length ? eligible : LOVE_RECEIPT_TOTALS;
  return pool[Math.floor(rng() * pool.length)];
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
  const frame = buildFrame();
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
    // the total slot is the receipt's gut-punch — pick one that doesn't echo a
    // line's price (its stamp) rather than the constant frame placeholder.
    total: pickTotal(lines).price,
    paidVia: frame.paidVia,
    finePrint: frame.finePrint,
    returnPolicy: frame.returnPolicy,
    scanLine: frame.scanLine,
    footer: frame.footer,
  };
}
