/**
 * Love Receipt — doodle layer (data + resolvers).
 *
 * PURE DATA + lookups. No React, no RNG. Doodles attach to receipt content only
 * ON or AROUND it — never beside or after a line. Three placement systems, each
 * deterministic so the sender preview and the recipient print render identically:
 *
 *   (A) NUMBER-WRAP — a hollow doodle frames the QTY digits of MOST item rows.
 *       Which rows are skipped and which doodle each gets derive from the row
 *       index ({@link numberWrapDoodle}), so it's stable across reloads.
 *   (B) WORD-CIRCLE / INSIDE-A-SHAPE — a hollow doodle frames a word marked
 *       inline with `*asterisks*` (see ./markers). The doodle is chosen by the
 *       phrase content ({@link wordDoodle}), so circles and hearts vary by word.
 *   (C) BARREN SCATTER — solid motifs + light accents float in reliably-empty
 *       structural dead-zones (header margins, around the barcode, footer
 *       corners). Always-on and content-blind ({@link resolveScatter}).
 *
 * Plus the surviving line-mark anchor: UNDERLINE, an author-bound mark under a
 * row (LINE_BINDINGS / TONE_BINDINGS → {@link resolveLineDoodle}).
 *
 * Removed in this revision: the gutter-left / gutter-right anchors (a motif in a
 * row's side margin) and punctuate-after (a mark trailing the line). Doodles no
 * longer sit beside or after content.
 */

import { LOVE_RECEIPT_POOL, type Tone } from './love-receipt-pool';

/** Base on-paper doodle size at scale 1, in px (mirrors the old STICKER_BASE_PX). */
export const DOODLE_BASE_PX = 56;

// ── TASTE LISTS — the editable heart of the auto-doodle rule engine ──────────
// These drive rule-based decoration (see resolveReceiptDoodles). Add words here
// as the pool grows; matching is whole-word, case-insensitive. Order matters only
// where noted. Hand-authored LINE_BINDINGS always override the rules.

/** circle-word targets for GIGGLE lines: concrete, funny nouns worth circling. */
export const FUNNY_NOUNS: readonly string[] = [
  'dimples',
  'pookie',
  'curtains',
  'nonsense',
  'dupatta',
  'hoodie',
  'launched',
  'busted',
  'overtime',
  'haircut',
  'loan',
  'jealous',
  'feelings',
  'projection',
  'overthinking',
  'nonchalant',
];

/** underline targets for TENDER lines: emotional keywords worth underlining. */
export const TENDER_KEYWORDS: readonly string[] = [
  'you',
  'forever',
  'home',
  'ordinary',
  'miss',
  'first',
  'plan',
  'sleep',
  'calm',
  'favourite',
  'always',
  'stay',
  'safe',
  'mine',
];

/** single-word price tags strong enough to circle in the PRICE lane instead of a
 *  word in the item text (see rule C). Lowercased for matching. */
export const STRONG_PRICES: readonly string[] = [
  'kept',
  'mine',
  'emi',
  'busted',
  'launched',
  'petty',
  'champ',
  'generous',
  'viral',
  'tragic',
];

// ── doodle registry — the 23 real files in /public/stickers/doodles/ ─────────
export interface Doodle {
  id: string;
  src: string;
}

const DOODLE_DIR = '/stickers/doodles';

/** The doodle palette — only the files that actually exist on disk. */
export const DOODLES: Doodle[] = [
  // text-attaching pen marks — line marks (underline anchor)
  {
    id: 'doodle-underline-teal',
    src: `${DOODLE_DIR}/doodle-underline-teal.png`,
  },
  { id: 'doodle-zigzag-blue', src: `${DOODLE_DIR}/doodle-zigzag-blue.png` },
  // soft periwinkle sine-wave underline (curvy, not the pointed zigzag)
  {
    id: 'doodle-wavy-underline',
    src: `${DOODLE_DIR}/doodle-wavy-underline.png`,
  },
  {
    id: 'doodle-dashes-lavender',
    src: `${DOODLE_DIR}/doodle-dashes-lavender.png`,
  },
  // horizontally-mirrored dash-fan for the right barcode gutter (ImageOps.mirror).
  {
    id: 'doodle-dashes-lavender-right',
    src: `${DOODLE_DIR}/doodle-dashes-lavender-right.png`,
  },
  // hollow frames — wrap a number (number-wrap) or a word (word-circle/inside)
  { id: 'doodle-ring', src: `${DOODLE_DIR}/doodle-ring.png` },
  { id: 'doodle-oval-lavender', src: `${DOODLE_DIR}/doodle-oval-lavender.png` },
  { id: 'doodle-half-oval', src: `${DOODLE_DIR}/doodle-half-oval.png` },
  { id: 'doodle-star-yellow', src: `${DOODLE_DIR}/doodle-star-yellow.png` },
  { id: 'doodle-saturn-ring', src: `${DOODLE_DIR}/doodle-saturn-ring.png` },
  { id: 'doodle-red-heart', src: `${DOODLE_DIR}/doodle-red-heart.png` }, // hollow heart
  { id: 'doodle-peanut-pink', src: `${DOODLE_DIR}/doodle-peanut-pink.png` }, // hollow peanut
  // bold in-asset extractions for the number-wrap frames (older set, kept alongside)
  // non-bold teal star never had its own PNG extracted; alias to the in-use bold art.
  { id: 'doodle-star-teal', src: `${DOODLE_DIR}/doodle-star-teal-bold.png` },
  { id: 'doodle-star-coral', src: `${DOODLE_DIR}/doodle-star-coral.png` },
  { id: 'doodle-heart-candy', src: `${DOODLE_DIR}/doodle-heart-candy.png` },
  // -bold set — current number-wrap frames (star A/B teal vs coral, rare magenta heart).
  // heart-red-bold is extracted and available but not currently wired into the pool.
  {
    id: 'doodle-star-teal-bold',
    src: `${DOODLE_DIR}/doodle-star-teal-bold.png`,
  },
  {
    id: 'doodle-star-coral-bold',
    src: `${DOODLE_DIR}/doodle-star-coral-bold.png`,
  },
  { id: 'doodle-saturn-bold', src: `${DOODLE_DIR}/doodle-saturn-bold.png` },
  {
    id: 'doodle-heart-magenta-bold',
    src: `${DOODLE_DIR}/doodle-heart-magenta-bold.png`,
  },
  {
    id: 'doodle-heart-rose-bold',
    src: `${DOODLE_DIR}/doodle-heart-rose-bold.png`,
  }, // soft dusty-rose hollow heart — current number-wrap rare
  {
    id: 'doodle-heart-skyblue-bold',
    src: `${DOODLE_DIR}/doodle-heart-skyblue-bold.png`,
  }, // sky-blue hollow heart
  {
    id: 'doodle-heart-rosepink-bold',
    src: `${DOODLE_DIR}/doodle-heart-rosepink-bold.png`,
  }, // rose-pink hollow heart — current number-wrap rare
  {
    id: 'doodle-heart-red-bold',
    src: `${DOODLE_DIR}/doodle-heart-red-bold.png`,
  },
  // punctuation marks (unused by the current anchors; kept in the registry)
  { id: 'doodle-question-mark', src: `${DOODLE_DIR}/doodle-question-mark.png` },
  {
    id: 'doodle-single-exclaim',
    src: `${DOODLE_DIR}/doodle-single-exclaim.png`,
  },
  { id: 'doodle-multi-exclaim', src: `${DOODLE_DIR}/doodle-multi-exclaim.png` },
  // hand-painted mustard rays burst — an end-mark (punctuate-after).
  {
    id: 'doodle-rays-mustard',
    src: `${DOODLE_DIR}/doodle-rays-mustard.png`,
  },
  // combined "?!" punch as a single hand-drawn asset (an alternative to the
  // question-mark + single-exclaim pair drawn via `pairWith`). End-mark motif.
  {
    id: 'doodle-exclaim-question',
    src: `${DOODLE_DIR}/doodle-exclaim-question.png`,
  },
  // solid motifs — barren scatter (filled, no empty core to wrap with)
  { id: 'doodle-pink-heart', src: `${DOODLE_DIR}/doodle-pink-heart.png` },
  { id: 'doodle-heart-card', src: `${DOODLE_DIR}/doodle-heart-card.png` },
  { id: 'doodle-math-heart', src: `${DOODLE_DIR}/doodle-math-heart.png` },
  { id: 'doodle-kiss', src: `${DOODLE_DIR}/doodle-kiss.png` },
  { id: 'doodle-lock', src: `${DOODLE_DIR}/doodle-lock.png` },
  { id: 'doodle-love-letter', src: `${DOODLE_DIR}/doodle-love-letter.png` },
  { id: 'doodle-wine-glass', src: `${DOODLE_DIR}/doodle-wine-glass.png` },
  { id: 'doodle-toffee', src: `${DOODLE_DIR}/doodle-toffee.png` },
  // light accents — barren scatter fill
  { id: 'doodle-sparkle', src: `${DOODLE_DIR}/doodle-sparkle.png` },
  // the one file that breaks the doodle-* naming convention on disk
  { id: 'doodle-bouquet', src: `${DOODLE_DIR}/sticker-bouquet.png` },
];

const DOODLE_BY_ID = new Map(DOODLES.map((d) => [d.id, d]));

/** Resolve a doodle's src by id (null if it isn't in the registry). */
export function doodleSrc(doodleId: string): string | null {
  return DOODLE_BY_ID.get(doodleId)?.src ?? null;
}

// ── (A)+(B) hollow frames — number-wrap + word-circle/inside-a-shape ─────────
/**
 * Curated hollow doodles whose empty cores frame a number or a word — outline
 * only, so the digits/word read first. Mixes circles (oval, ring, saturn),
 * geometric frames (star, half-oval) and the hollow heart (word INSIDE a heart).
 */
export const HOLLOW_WRAP_PALETTE: readonly string[] = [
  'doodle-oval-lavender',
  'doodle-ring',
  'doodle-star-yellow',
  'doodle-half-oval',
  'doodle-red-heart',
  'doodle-saturn-ring',
];

// The three number-wrap doodles. SATURN is the only one allowed to appear twice on
// a receipt (and only when a framed slot must repeat); STAR and HEART never repeat.
//   Asset history kept on disk/registry but unreferenced now: the dropped coral
//   star (doodle-star-coral-bold) and the superseded hearts
//   (magenta-bold → rose-bold → sky-blue-bold; current heart is rose-pink-bold).
const SATURN = 'doodle-saturn-bold';
const STAR = 'doodle-star-teal-bold';
const HEART = 'doodle-heart-rosepink-bold';

/** The 6 orderings of [saturn, star, heart]; a receipt picks one by hash so a
 *  3-slot receipt shows all three once in a stable, receipt-specific order. */
const TRIO_ORDERS: readonly (readonly string[])[] = [
  [SATURN, STAR, HEART],
  [SATURN, HEART, STAR],
  [STAR, SATURN, HEART],
  [STAR, HEART, SATURN],
  [HEART, SATURN, STAR],
  [HEART, STAR, SATURN],
];

/** Stable key for a line: its poolId, falling back to row index for custom lines. */
function lineKey(poolId: string | undefined, index: number): string {
  return poolId ?? `idx-${index}`;
}

/**
 * The doodle ids for `framedCount` framed slots, honoring the uniqueness rules:
 *   - ≤3 slots → a hash-picked PERMUTATION of [saturn, star, heart], so every shown
 *     doodle is distinct (3 slots → all three once; fewer → a distinct subset);
 *   - ≥4 slots → a repeat is forced, and only SATURN may repeat: lay the saturns
 *     out by saturn-first alternation (saturn, star, saturn, heart …) with star +
 *     heart dropped into the gaps in a hash-picked order. Because a framed non-
 *     saturn slot always sits between two saturn slots, the saturns can never end
 *     up on adjacent rows — even when a plain row falls between framed rows.
 */
function framedDoodles(framedCount: number, h: number): string[] {
  const order = TRIO_ORDERS[h % TRIO_ORDERS.length];
  if (framedCount <= 3) return order.slice(0, framedCount);
  const gaps = (h >>> 3) % 2 === 0 ? [STAR, HEART] : [HEART, STAR];
  let g = 0;
  return Array.from({ length: framedCount }, (_, i) =>
    i % 2 === 0 ? SATURN : (gaps[g++] ?? SATURN),
  );
}

/**
 * Assign a number-wrap doodle to each item line of a receipt — DETERMINISTIC off
 * the stable poolId hashes, so a given receipt always renders identically
 * (sender preview = receiver print) and a line keeps its frame through reloads.
 *
 *   (1) PLAIN — a row whose key-hash % 4 === 3 is left plain (≈1 of every 4), for
 *       breathing room.
 *   (2)(5) The framed rows take DISTINCT doodles from a hash-picked ordering, so a
 *       typical 3-framed receipt shows saturn + star + heart once each, nothing
 *       repeating.
 *   (3)(4) Only when every slot is framed (4 framed → a repeat is forced) does the
 *       saturn appear twice, and then the two saturns are kept NON-ADJACENT. Heart
 *       and star never repeat.
 *
 * Returns an array aligned to `lines`; entry is the doodle id or null (plain).
 */
export function numberWrapForReceipt(
  lines: ReadonlyArray<{ poolId?: string }>,
): (string | null)[] {
  const keys = lines.map((l, i) => lineKey(l.poolId, i));
  const result: (string | null)[] = lines.map(() => null);

  // (1) per-row skip → ≈1 plain row per receipt.
  const framedRows = keys
    .map((k, i) => ({ i, plain: hashString(k) % 4 === 3 }))
    .filter((r) => !r.plain)
    .map((r) => r.i);
  if (framedRows.length === 0) return result;

  // (2)–(5) one doodle per framed row, sequenced from the whole-receipt hash.
  const receiptHash = hashString(keys.join('|'));
  const doodles = framedDoodles(framedRows.length, receiptHash);
  framedRows.forEach((row, slot) => {
    result[row] = doodles[slot];
  });
  return result;
}

/**
 * Per-doodle centering for the hollow frames (shared by number-wrap AND
 * word-circle). The six hollow doodles have very different aspect ratios and
 * their drawn hollow isn't centered in its own PNG, so each needs its own tuning
 * to land its empty core ON the wrapped digits/word. PURELY VISUAL — hand-tweak
 * these four numbers per doodle:
 *
 *   scaleX / scaleY — frame size as a multiple of the wrapped content box
 *     (1 = exactly the digits/word; ~2 = twice that, so the content sits inside
 *     the hollow with breathing room). X and Y are independent so a round shape
 *     can be widened to wrap a 2-digit number or a word.
 *   nudgeX / nudgeY — shift the frame as a % of the content box to correct each
 *     PNG's off-center hollow (+x = right, +y = down).
 */
export interface HollowCalibration {
  scaleX: number;
  scaleY: number;
  nudgeX: number;
  nudgeY: number;
}

const DEFAULT_HOLLOW: HollowCalibration = {
  scaleX: 1.9,
  scaleY: 2.0,
  nudgeX: 0,
  nudgeY: 0,
};

// Circle-word / circle-price scales: a SNUG hug — the hollow grips the word (or
// price tag) with only small padding, sized to the wrapped box (objectFit:fill),
// never a fixed large loop. scaleY runs a touch larger than scaleX so the oval's
// top/bottom arcs clear the ascenders/descenders instead of cutting the letters.
/** Hand-tuned centering per hollow doodle. See {@link HollowCalibration}. */
export const HOLLOW_CALIBRATION: Record<string, HollowCalibration> = {
  // the two current circle-word/price assets — snug (was 1.7/1.8, too big).
  'doodle-oval-lavender': { scaleX: 1.26, scaleY: 1.6, nudgeX: 0, nudgeY: 0 },
  'doodle-peanut-pink': { scaleX: 1.34, scaleY: 1.72, nudgeX: 0, nudgeY: 0 },
  'doodle-ring': { scaleX: 1.7, scaleY: 1.7, nudgeX: 0, nudgeY: 16 },
  'doodle-star-yellow': { scaleX: 1.95, scaleY: 1.95, nudgeX: -3, nudgeY: 18 },
  'doodle-half-oval': { scaleX: 2.2, scaleY: 1.4, nudgeX: 4, nudgeY: 26 },
  'doodle-red-heart': { scaleX: 1.8, scaleY: 1.9, nudgeX: 6, nudgeY: 16 },
  'doodle-saturn-ring': { scaleX: 1.9, scaleY: 1.7, nudgeX: 0, nudgeY: 12 },
};

/** The centering config for a hollow doodle (a safe default if unlisted). */
export function hollowCalibration(doodleId: string): HollowCalibration {
  return HOLLOW_CALIBRATION[doodleId] ?? DEFAULT_HOLLOW;
}

/**
 * Number-wrap frame geometry (DISTINCT from the word-circle calibration above).
 *
 * The QTY frame must keep each doodle's NATURAL aspect ratio — a saturn ring
 * stays round, a star stays a star — and center on the digits, NOT inherit the
 * wide-short QTY text box. So the renderer mounts a SQUARE box centered on the
 * digit center and draws the doodle with object-fit: contain (uniform scale, no
 * stretch). These three numbers tune that:
 *
 *   scale   — the square box's side, in em (tracks the digit font size, so the
 *             frame stays correct on any screen). One factor → uniform scaling.
 *   nudgeX / nudgeY — FINE per-doodle shift in em, to correct each PNG's own
 *             off-center hollow so the number lands dead-center (+x right, +y down).
 */
export interface NumberFrameCalibration {
  /** square box side in em (uniform — preserves the doodle's aspect). */
  scale: number;
  /** fine center correction in em (+x right, +y down). */
  nudgeX: number;
  nudgeY: number;
}

const DEFAULT_NUMBER_FRAME: NumberFrameCalibration = {
  scale: 2.7,
  nudgeX: 0,
  nudgeY: 0,
};

// Only the number-wrap palette needs tuning (star / saturn common, heart rare).
// Restrained, EQUAL breathing room: each shape hugs the 2-digit number with the
// same small margin, tucked ON the digits rather than a big loud circle. The
// values differ per doodle because object-fit: contain in a square box renders
// each shape's *enclosing region* differently — saturn is letterboxed (its round
// planet is only ~0.7 of the box), the star's body sits inside its points, and
// the heart nearly fills its box — so matching the visual margin needs different
// box sides. The star is the reference; saturn is bumped so its planet isn't
// tight; the heart is pulled in so its bottom point doesn't drop into the row.
export const NUMBER_FRAME_CALIBRATION: Record<string, NumberFrameCalibration> =
  {
    'doodle-star-teal': { scale: 2.55, nudgeX: 0, nudgeY: 0 },
    'doodle-star-coral': { scale: 2.55, nudgeX: 0, nudgeY: 0 }, // same geometry as teal star
    'doodle-saturn-ring': { scale: 2.95, nudgeX: 0, nudgeY: 0 },
    'doodle-heart-candy': { scale: 2.4, nudgeX: 0, nudgeY: 0 },
    // -bold set (current pool) — inherits the geometry of its non-bold counterpart
    'doodle-star-teal-bold': { scale: 2.55, nudgeX: 0, nudgeY: 0 },
    'doodle-star-coral-bold': { scale: 2.55, nudgeX: 0, nudgeY: 0 },
    'doodle-saturn-bold': { scale: 2.95, nudgeX: 0, nudgeY: 0 },
    'doodle-heart-magenta-bold': { scale: 2.4, nudgeX: 0, nudgeY: 0 }, // unreferenced; kept for the asset
    'doodle-heart-rose-bold': { scale: 2.4, nudgeX: 0, nudgeY: 0 }, // same heart geometry as magenta-bold
    'doodle-heart-skyblue-bold': { scale: 2.4, nudgeX: 0, nudgeY: 0 }, // same heart geometry as the other bold hearts
    'doodle-heart-rosepink-bold': { scale: 2.4, nudgeX: 0, nudgeY: 0 }, // same heart geometry as the other bold hearts
  };

/** The number-frame geometry for a doodle (a safe default if unlisted). */
export function numberFrameCalibration(
  doodleId: string,
): NumberFrameCalibration {
  return NUMBER_FRAME_CALIBRATION[doodleId] ?? DEFAULT_NUMBER_FRAME;
}

/** Small stable string hash (FNV-1a-ish) → non-negative int. */
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The hollow doodle that frames a `*marked*` word — chosen by the phrase content
 * so a given word always gets the same frame (stable across preview/print) yet
 * different words vary between a circle, a star, a heart, etc.
 */
export function wordDoodle(phrase: string): string {
  return HOLLOW_WRAP_PALETTE[hashString(phrase) % HOLLOW_WRAP_PALETTE.length];
}

// ── (D) end-of-line render shape — used by the punctuate-after anchor ─────────
/**
 * A punctuate-after mark resolved to concrete render values. The anchor now lives
 * in LINE_BINDINGS (one mark per line — see {@link DoodleAnchor} 'punctuate-after'
 * and {@link PUNCTUATE_AFTER_DOODLES}); this is just the shape the renderer needs
 * to draw a small motif after the item text. The old standalone END_LINE_BINDINGS
 * table + resolveEndLineDoodle were folded into LINE_BINDINGS / resolveLineDoodle.
 */
export interface ResolvedEndLineDoodle {
  doodleId: string;
  scale: number;
  rotation: number;
}

// ── (C) barren scatter — solid motifs in structural dead-zones ───────────────
/** Structural dead-zones a scatter motif may float in (never the center body). */
export type ScatterZone = 'header' | 'barcode' | 'footer';

/**
 * One always-on scatter placement, positioned against its structural row's box.
 * `pos` pins it to a corner/margin via top/bottom/left/right (in px or %), so it
 * stays in the dead-zone and never reaches the variable center text column.
 */
export interface ScatterPlacement {
  doodleId: string;
  /** corner/edge offsets — any of top/right/bottom/left, px number or % string. */
  pos: {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
  };
  /** on-paper size in px (square box; art is objectFit:contain). */
  size: number;
  rotation?: number;
  /** 0..1, default 0.55 — scatter sits softly behind the ink. */
  opacity?: number;
}

// Barcode-only scatter: two mirrored lavender dashes flank the barcode. The
// header and footer zones are intentionally empty — the number-wrap trio carries
// the decoration. Content-blind and identical on every receipt.
const SCATTER: Record<ScatterZone, ScatterPlacement[]> = {
  header: [],
  barcode: [
    // two dash-fans bracket the barcode, splaying OUTWARD away from it: on the
    // LEFT sits the original (fans out to the left, toward the receipt edge); on
    // the RIGHT sits the mirrored copy (fans out to the right). Tucked right
    // beside the bars via a calc() from center (barcode half-width ≈ 56px),
    // vertically centered on the 46px bar block, clear of the bars and caption.
    {
      doodleId: 'doodle-dashes-lavender',
      pos: { top: 4, left: 'calc(50% - 96px)' },
      size: 39,
      rotation: -78,
      opacity: 0.8,
    },
    {
      doodleId: 'doodle-dashes-lavender-right',
      pos: { top: 4, right: 'calc(50% - 96px)' },
      size: 39,
      rotation: 78,
      opacity: 0.8,
    },
  ],
  footer: [],
};

/** The always-on scatter placements for a structural dead-zone. */
export function resolveScatter(zone: ScatterZone): ScatterPlacement[] {
  return SCATTER[zone];
}

// ── underline anchor — the surviving author-bound line mark ──────────────────
/**
 * Line-bound anchors — ONE mark per line (see LINE_BINDINGS → resolveLineDoodle):
 *   underline       — a hand-drawn mark under ONE target word in the item text,
 *                     sized to that word (not the whole line/column).
 *   circle-word     — a hollow oval/shape wrapping ONE target word in the item text.
 *   circle-price    — a hollow oval/shape wrapping the price tag (a word in the
 *                     price column).
 *   punctuate-after — a small motif tucked in AFTER the item text (no target word):
 *                     the ?! / <3 / !!! of the receipt. Never in the price column.
 * underline / circle-word / circle-price target a word via {@link LineBinding.target};
 * punctuate-after ignores target. (gutter-left / gutter-right were removed.)
 */
export type DoodleAnchor =
  | 'underline'
  | 'circle-word'
  | 'circle-price'
  | 'punctuate-after';

/** Line-mark doodles valid for the underline anchor (reject mismatches). */
const LINE_MARK_DOODLES: ReadonlySet<string> = new Set([
  'doodle-underline-teal',
  'doodle-zigzag-blue',
  'doodle-wavy-underline',
  'doodle-dashes-lavender',
]);

/** Hollow doodles valid for the circle-word / circle-price anchors — an empty
 *  core so the wrapped word/price reads through them (reject solid motifs). */
const CIRCLE_DOODLES: ReadonlySet<string> = new Set([
  'doodle-oval-lavender',
  'doodle-peanut-pink',
  'doodle-ring',
  'doodle-star-yellow',
  'doodle-half-oval',
  'doodle-red-heart',
  'doodle-saturn-ring',
]);

/** Small motifs valid AFTER the item text (punctuate-after) — hearts + the end
 *  marks the upcoming ?! / !!! pass will use. A binding to anything else is ignored. */
const PUNCTUATE_AFTER_DOODLES: ReadonlySet<string> = new Set([
  'doodle-pink-heart',
  'doodle-math-heart',
  'doodle-question-mark',
  'doodle-single-exclaim',
  'doodle-multi-exclaim',
  'doodle-exclaim-question',
  'doodle-rays-mustard',
  'doodle-sparkle',
]);

/** True for a renderable line binding — the doodle must match its anchor's set:
 *  a line-mark under `underline`, a hollow shape under `circle-word`/`circle-price`,
 *  a small motif under `punctuate-after`. */
export function isRenderableLineDoodle(d: ResolvedDoodle): boolean {
  if (d.anchor === 'underline') return LINE_MARK_DOODLES.has(d.doodleId);
  if (d.anchor === 'circle-word' || d.anchor === 'circle-price') {
    return CIRCLE_DOODLES.has(d.doodleId);
  }
  if (d.anchor === 'punctuate-after') {
    return (
      PUNCTUATE_AFTER_DOODLES.has(d.doodleId) &&
      (!d.pairWith || PUNCTUATE_AFTER_DOODLES.has(d.pairWith))
    );
  }
  return false;
}

// ── binding tables (underline only) ──────────────────────────────────────────
/** Per-line "hero" mark — keyed by pool id; overrides any tone binding. */
export interface LineBinding {
  poolId: string;
  doodleId: string;
  anchor: DoodleAnchor;
  /** for circle-word / circle-price: the word to wrap (first case-insensitive
   *  occurrence in the item text / price). Ignored by the underline anchor. */
  target?: string;
  /** punctuate-after only: a SECOND mark drawn tight after `doodleId`, e.g. the
   *  exclaim of a "?!" pair (there's no single combined ?! asset). */
  pairWith?: string;
  /** extra size multiplier on top of the per-doodle calibration (default 1). */
  scale?: number;
  /** rotation in degrees (default 0). */
  rotation?: number;
}

/**
 * Per-tone RULE — how a line of this tone is auto-decorated when no hand binding
 * exists (see TONE_BINDINGS + resolveReceiptDoodles). The mark kinds:
 *   circle-word        — oval/peanut around a matched FUNNY_NOUN (or quoted word)
 *   underline-word     — underline under a matched TENDER_KEYWORD (or quoted word)
 *   end-mark           — a punctuate-after motif (doodleId, optional pairWith)
 *   end-mark-sometimes — end-mark only when hash(poolId) % oneIn === 0, else bare
 *   bare               — never marked by rules
 */
export interface ToneRule {
  mark:
    | 'circle-word'
    | 'underline-word'
    | 'end-mark'
    | 'end-mark-sometimes'
    | 'bare';
  doodleId?: string;
  pairWith?: string;
  oneIn?: number;
}

// The oval + underline pass — one hand-authored mark per line, these 10 lines
// only; every other line stays bare. Each doodle sizes to its target (the word
// box or the item-text column), not a fixed size — see the renderer + the snug
// HOLLOW_CALIBRATION values. Add more lines here to extend the pass.
export const LINE_BINDINGS: LineBinding[] = [
  // circle-word — a hollow oval/peanut hugs ONE word in the item text.
  {
    poolId: 'lr-056',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-word',
    target: 'dimples',
  },
  {
    poolId: 'lr-096',
    doodleId: 'doodle-peanut-pink',
    anchor: 'circle-word',
    target: 'pookie',
  },
  {
    poolId: 'lr-065',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-word',
    target: 'curtains',
  },
  {
    poolId: 'lr-039',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-word',
    target: 'win', // the word inside the quotes: you let me "win" the argument
  },
  {
    poolId: 'lr-050',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-word',
    target: 'nonsense',
  },
  // circle-price — the same hug, but around the price tag in the PRICE column.
  {
    poolId: 'lr-005',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-price',
    target: 'mine',
  },
  {
    poolId: 'lr-002',
    doodleId: 'doodle-peanut-pink',
    anchor: 'circle-price',
    target: 'EMI',
  },
  {
    poolId: 'lr-008',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-price',
    target: 'busted',
  },
  {
    poolId: 'lr-060',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-price',
    target: 'launched',
  },
  // underline — a teal mark under a SINGLE target word (same target-word
  // mechanism as circle-word), sized to that word, not the whole line.

  // ── TENDER pass ──────────────────────────────────────────────────────────
  // word-level underline (same mechanism as lr-035 'correct'), one word each.
  {
    poolId: 'lr-018',
    doodleId: 'doodle-underline-teal',
    anchor: 'underline',
    target: 'you',
  },
  {
    poolId: 'lr-032',
    doodleId: 'doodle-underline-teal',
    anchor: 'underline',
    target: 'forever',
  },
  {
    poolId: 'lr-164',
    doodleId: 'doodle-underline-teal',
    anchor: 'underline',
    target: 'home',
  },
  {
    poolId: 'lr-083',
    doodleId: 'doodle-underline-teal',
    anchor: 'underline',
    target: 'ordinary',
  },
  {
    poolId: 'lr-067',
    doodleId: 'doodle-underline-teal',
    anchor: 'underline',
    target: 'miss',
  },

  // ── END-MARK pass (punctuate-after — a small motif after the item text) ────
  // !? (cheeky / disbelief) — the combined single exclaim-question asset.
  {
    poolId: 'lr-003',
    doodleId: 'doodle-exclaim-question',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-069',
    doodleId: 'doodle-exclaim-question',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-155',
    doodleId: 'doodle-exclaim-question',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-068',
    doodleId: 'doodle-exclaim-question',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-062',
    doodleId: 'doodle-exclaim-question',
    anchor: 'punctuate-after',
  },
  // <3 (tender-love beat) — the math-heart.
  {
    poolId: 'lr-035',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-151',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-152',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-019',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-049',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  // rays (emphasis / ta-da flourish) — the mustard rays burst.
  {
    poolId: 'lr-045',
    doodleId: 'doodle-rays-mustard',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-100',
    doodleId: 'doodle-rays-mustard',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-073',
    doodleId: 'doodle-rays-mustard',
    anchor: 'punctuate-after',
  },

  // ── REVIEW BATCH — hand marks for previously-bare lines ───────────────────
  // circle-word — hollow oval hugs one word in the item text.
  {
    poolId: 'lr-162',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-word',
    target: 'wallpaper',
  },
  // circle-price — hollow oval/peanut hugs the price tag (a "stamped" punchline).
  {
    poolId: 'lr-023',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-price',
    target: 'VIP',
  },
  {
    poolId: 'lr-150',
    doodleId: 'doodle-peanut-pink',
    anchor: 'circle-price',
    target: 'unpaid',
  },
  {
    poolId: 'lr-154',
    doodleId: 'doodle-oval-lavender',
    anchor: 'circle-price',
    target: 'unanimous',
  },
  {
    poolId: 'lr-158',
    doodleId: 'doodle-peanut-pink',
    anchor: 'circle-price',
    target: 'approval', // price is "approval fee" — hug the first word
  },
  // underline — the new soft wavy stroke under one word (curvy, playful).
  {
    poolId: 'lr-156',
    doodleId: 'doodle-wavy-underline',
    anchor: 'underline',
    target: 'more', // ...who loves who "more" — the comparative is the punch
  },
  // end-marks — a small motif after the item text.
  {
    poolId: 'lr-074',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-144',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-153',
    doodleId: 'doodle-math-heart',
    anchor: 'punctuate-after',
  },
  {
    poolId: 'lr-101',
    doodleId: 'doodle-sparkle',
    anchor: 'punctuate-after',
  },
  // lr-044 — the combined "!?" mark (exclaim first): incredulous.
  {
    poolId: 'lr-044',
    doodleId: 'doodle-exclaim-question',
    anchor: 'punctuate-after',
  },
  // lr-048 (tender) — "!?" matching the excited "guess what happened today".
  {
    poolId: 'lr-048',
    doodleId: 'doodle-exclaim-question',
    anchor: 'punctuate-after',
  },

  // NOTE: lr-002 (→ math-heart) and lr-060 (→ rays) from the brief are intentionally
  // NOT bound here — they already carry circle-price ovals (EMI / launched) from the
  // oval pass, and the author chose to KEEP those ovals (one mark per line).
];

/**
 * The tone → auto-mark table (rule A). This is the rule layer that fills lines
 * LINE_BINDINGS doesn't hand-pick. Edit freely; LINE_BINDINGS still wins.
 */
export const TONE_BINDINGS: Record<Tone, ToneRule> = {
  giggle: { mark: 'circle-word' },
  petty: { mark: 'end-mark', doodleId: 'doodle-rays-mustard' },
  delulu: { mark: 'end-mark', doodleId: 'doodle-exclaim-question' },
  tender: { mark: 'underline-word' },
  'real-life': {
    mark: 'end-mark-sometimes',
    doodleId: 'doodle-math-heart',
    oneIn: 4,
  },
  'almost-moment': { mark: 'bare' },
};

// ── resolution (static reads, deterministic — no RNG, so preview == print) ───
const LINE_BINDING_BY_POOL = new Map(LINE_BINDINGS.map((b) => [b.poolId, b]));
/** pool id → tone, the equivalent of POOL_BY_ID.get(poolId).tone. */
const TONE_BY_POOL_ID = new Map(LOVE_RECEIPT_POOL.map((l) => [l.id, l.tone]));

/** A binding resolved to concrete render values (scale/rotation defaulted). */
export interface ResolvedDoodle {
  doodleId: string;
  anchor: DoodleAnchor;
  /** circle-word / circle-price: the word to wrap (undefined for underline). */
  target?: string;
  /** punctuate-after: a second mark drawn tight after doodleId (?! pair). */
  pairWith?: string;
  scale: number;
  rotation: number;
}

function resolve(b: {
  doodleId: string;
  anchor: DoodleAnchor;
  target?: string;
  pairWith?: string;
  scale?: number;
  rotation?: number;
}): ResolvedDoodle {
  return {
    doodleId: b.doodleId,
    anchor: b.anchor,
    target: b.target,
    pairWith: b.pairWith,
    scale: b.scale ?? 1,
    rotation: b.rotation ?? 0,
  };
}

/** The hand-authored mark for a line (LINE_BINDINGS only), or null. The rule layer
 *  lives in {@link resolveReceiptDoodles}; hand bindings always win over it. */
export function resolveLineDoodle(poolId?: string): ResolvedDoodle | null {
  if (!poolId) return null;
  const b = LINE_BINDING_BY_POOL.get(poolId);
  return b ? resolve(b) : null;
}

// ── rule engine (auto-doodle) ────────────────────────────────────────────────
// Deterministic per receipt (no RNG) so the sender preview and recipient print
// render identically. Resolution order per line: (1) LINE_BINDINGS, (2) the tone
// rule below, capped to ~40% of lines (rule-only; hand picks exempt). no-adjacent
// and no-repeat removed — see resolveReceiptDoodles.

/** The two circle shapes alternate across a draw so two circles never repeat. */
const CIRCLE_ALT: readonly string[] = [
  'doodle-oval-lavender',
  'doodle-peanut-pink',
];
const UNDERLINE_DOODLE = 'doodle-underline-teal';

/** Drop-priority for the rule-only coverage cap (higher = kept longer). */
const PRIORITY = {
  hand: 5,
  price: 4,
  circle: 3,
  underline: 2,
  end: 1,
} as const;

const FUNNY_NOUN_SET = new Set(FUNNY_NOUNS);
const TENDER_KEYWORD_SET = new Set(TENDER_KEYWORDS);
const STRONG_PRICE_SET = new Set(STRONG_PRICES);

/** lowercase whole-words of a line (letters + apostrophes). */
function wordsOf(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

/**
 * The word to mark (circle/underline), or null — checked in order (rule B):
 *   1. a single-word DOUBLE-quoted word,
 *   2. the last meaningful word (≥4 letters) inside a trailing (parenthetical),
 *   3. the first word present in `keywords`.
 * Never returns a random word: no match → null (line falls through to bare).
 */
function wordTarget(
  text: string,
  keywords: ReadonlySet<string>,
): string | null {
  const quoted = text.match(/["“”]([A-Za-z]+)["“”]/);
  if (quoted) return quoted[1];
  const paren = text.match(/\(([^)]*)\)\s*$/);
  if (paren) {
    const inside = paren[1].toLowerCase().match(/[a-z']{4,}/g);
    if (inside && inside.length) return inside[inside.length - 1];
  }
  for (const w of wordsOf(text)) if (keywords.has(w)) return w;
  return null;
}

/** The price tag if it's a single word in STRONG_PRICES (rule C), else null. */
function strongPriceTarget(price: string): string | null {
  const p = price.trim();
  if (!p || /\s/.test(p)) return null; // never circle a multi-word price
  return STRONG_PRICE_SET.has(p.toLowerCase()) ? p : null;
}

interface MarkCandidate {
  doodle: ResolvedDoodle;
  priority: number;
  /** 'item' (left column word), 'price' (right column word), or 'end' (after text). */
  side: 'item' | 'price' | 'end';
  /** circle-word/circle-price whose shape is assigned by alternation (rule-only). */
  circleAlt: boolean;
  fromHand: boolean;
}

function anchorSide(anchor: DoodleAnchor): 'item' | 'price' | 'end' {
  if (anchor === 'circle-price') return 'price';
  if (anchor === 'punctuate-after') return 'end';
  return 'item';
}

/** The rule-layer candidate for a line (no hand binding), or null (bare). */
function ruleCandidate(
  poolId: string,
  text: string,
  price: string,
): MarkCandidate | null {
  const tone = TONE_BY_POOL_ID.get(poolId);
  if (!tone) return null;
  const rule = TONE_BINDINGS[tone];
  if (rule.mark === 'bare') return null; // almost-moment: always bare, even w/ price

  // (C) price-circle wins over the tone's word/end mark when the price qualifies.
  const priceWord = strongPriceTarget(price);
  if (priceWord) {
    return {
      doodle: {
        doodleId: '',
        anchor: 'circle-price',
        target: priceWord,
        scale: 1,
        rotation: 0,
      },
      priority: PRIORITY.price,
      side: 'price',
      circleAlt: true,
      fromHand: false,
    };
  }

  switch (rule.mark) {
    case 'circle-word': {
      const t = wordTarget(text, FUNNY_NOUN_SET);
      if (!t) return null;
      return {
        doodle: {
          doodleId: '',
          anchor: 'circle-word',
          target: t,
          scale: 1,
          rotation: 0,
        },
        priority: PRIORITY.circle,
        side: 'item',
        circleAlt: true,
        fromHand: false,
      };
    }
    case 'underline-word': {
      const t = wordTarget(text, TENDER_KEYWORD_SET);
      if (!t) return null;
      return {
        doodle: {
          doodleId: UNDERLINE_DOODLE,
          anchor: 'underline',
          target: t,
          scale: 1,
          rotation: 0,
        },
        priority: PRIORITY.underline,
        side: 'item',
        circleAlt: false,
        fromHand: false,
      };
    }
    case 'end-mark':
    case 'end-mark-sometimes': {
      if (
        rule.mark === 'end-mark-sometimes' &&
        hashString(poolId) % (rule.oneIn ?? 4) !== 0
      ) {
        return null;
      }
      return {
        doodle: {
          doodleId: rule.doodleId ?? 'doodle-math-heart',
          pairWith: rule.pairWith,
          anchor: 'punctuate-after',
          scale: 1,
          rotation: 0,
        },
        priority: PRIORITY.end,
        side: 'end',
        circleAlt: false,
        fromHand: false,
      };
    }
  }
}

/**
 * Resolve EVERY item line's doodle for one receipt, applying the full pipeline:
 *   1. LINE_BINDINGS (hand) — wins, uncapped; 2. tone rule fills unbound lines
 *   under a RULE-ONLY coverage cap (~40% of lines; hand picks exempt and never
 *   consume the budget). The no-adjacent-double and no-repeat-doodle governors are
 *   removed by design — the author controls density through the bindings. The rule
 *   engine also self-limits PER LINE (circle/underline need a target word; real-life
 *   end-mark fires ~1-in-4). One mark per line, circle shapes alternated. Returns an
 *   array aligned to `lines` (null = bare line).
 */
export function resolveReceiptDoodles(
  lines: ReadonlyArray<{ poolId?: string; text: string; price: string }>,
): (ResolvedDoodle | null)[] {
  // (1)+(2) per-line candidate: hand binding, else tone rule (deterministic).
  const cands: (MarkCandidate | null)[] = lines.map((line) => {
    const poolId = line.poolId;
    if (!poolId) return null; // custom/user line → no doodle
    const hand = LINE_BINDING_BY_POOL.get(poolId);
    if (hand) {
      return {
        doodle: resolve(hand),
        priority: PRIORITY.hand,
        side: anchorSide(hand.anchor),
        circleAlt: false, // hand shapes are explicit; never reassigned
        fromHand: true,
      };
    }
    return ruleCandidate(poolId, line.text, line.price);
  });

  // (3) resolution — TWO PASSES so hand bindings resolve first.
  const chosen = new Set<number>();
  let altIdx = 0;

  // PASS 1 — hand bindings ALWAYS render (curated author picks, resolved first).
  cands.forEach((c, i) => {
    if (!c || !c.fromHand) return;
    chosen.add(i);
  });

  // PASS 2 — rule marks fill unbound lines under a RULE-ONLY coverage cap: at most
  // ~40% of the receipt's lines get a fallback mark, taking highest-PRIORITY first
  // and dropping the lowest when the budget runs out. Hand bindings (PASS 1) are
  // EXEMPT — they never count against or consume this budget, so an all-hand
  // receipt shows every pick and only UNBOUND draws are throttled. (no-adjacent /
  // no-repeat stay removed; the priority sort also makes circle-alt deterministic.)
  const ruleCap = Math.floor(lines.length * 0.4); // ≤40% of lines get a fallback mark
  let ruleCount = 0;
  const ruleOrder = cands
    .map((c, i) => ({ c, i }))
    .filter(
      (x): x is { c: MarkCandidate; i: number } => x.c != null && !x.c.fromHand,
    )
    .sort((a, b) => b.c.priority - a.c.priority || a.i - b.i);

  for (const { c, i } of ruleOrder) {
    if (chosen.has(i)) continue; // one mark per line
    if (ruleCount >= ruleCap) break; // rule-only cap reached (hand picks exempt)

    // effective doodle id: alternate circle shapes so two rule circles vary.
    const doodleId = c.circleAlt
      ? CIRCLE_ALT[altIdx % CIRCLE_ALT.length]
      : c.doodle.doodleId;

    if (c.circleAlt) {
      c.doodle.doodleId = doodleId;
      altIdx++;
    }
    chosen.add(i);
    ruleCount++;
  }
  // NOTE: hand bindings always render (PASS 1, uncapped); rule marks are capped to
  // ~40% of lines (PASS 2). Only "one mark per line" + the rule cap remain — the
  // no-adjacent and no-repeat governors stay removed.

  const result: (ResolvedDoodle | null)[] = lines.map(() => null);
  chosen.forEach((i) => {
    result[i] = cands[i]!.doodle;
  });
  return result;
}
