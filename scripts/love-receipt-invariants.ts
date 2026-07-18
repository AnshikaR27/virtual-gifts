/**
 * Dev assert — the Love Receipt draw invariants. NOT a server action; run locally
 * to prove the receipt's tonal whiplash can never go missing.
 *
 * Run (PowerShell or bash):
 *   npx tsx scripts/love-receipt-invariants.ts
 *
 * Exits non-zero (throwing) on the first violated invariant, so it doubles as a
 * pre-commit / CI gate even though the repo has no test runner.
 *
 * Invariants checked (mirrors the task acceptance list):
 *  1. Over 1000 sampleBalanced draws (state threaded like the real builder):
 *     every draw has ≥1 funny AND ≥1 tender, no duplicate normalized prices,
 *     no collision pair co-occurs, no id repeats within a draw.
 *  2. shownIds prevents repeats across consecutive draws until a reset (or until
 *     the pool can't satisfy an anchor side freshly — the documented relax).
 *  3. getStartingLines() returns EXACTLY the 4 DEFAULT_STARTING_IDS, in order.
 *  4. getDefaultTotal() is DEFAULT_TOTAL_ID (the deterministic first paint).
 *  5. pickTotal() never returns a price (normalized) already on a drawn line.
 */

import {
  DEFAULT_STARTING_IDS,
  getDefaultTotal,
  getStartingLines,
  pickTotal,
  sampleBalanced,
  STARTING_LINE_COUNT,
  type ReceiptLine,
} from '../src/gifts/love-receipt/lines';
import {
  COLLISION_PAIRS,
  DEFAULT_TOTAL_ID,
  LOVE_RECEIPT_POOL,
  type Side,
} from '../src/gifts/love-receipt/love-receipt-pool';

const SIDE_BY_ID = new Map<string, Side>(
  LOVE_RECEIPT_POOL.map((l) => [l.id, l.side]),
);

// id → set of ids it must never share a draw with (symmetric).
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

const norm = (p: string) => p.trim().toLowerCase();

// Mirror of the engine's funny-anchor tone rotation (lines.ts FUNNY_TONES). The
// funny anchor draws from ONE funny tone per draw and relaxes freshness within
// that tone, so a repeat is "by design" precisely when the cursor's funny tone
// has no fresh line left — even if other funny tones still do.
const FUNNY_TONES = ['giggle', 'petty', 'delulu'] as const;

let failures = 0;
function check(cond: boolean, msg: string): void {
  if (!cond) {
    failures++;
    console.error(`  ✗ ${msg}`);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

function sideOf(id: string): Side {
  return SIDE_BY_ID.get(id) ?? 'flavor';
}
function sidesOf(lines: ReceiptLine[]): Side[] {
  return lines.map((l) => sideOf(l.id));
}

// Count fresh (not-yet-shown) pool lines, total + per anchor side, so the test
// can tell the "normal" regime (no slot needs to relax) from the bottom-of-pool
// edge where a repeat is allowed by design.
function freshness(shown: Set<string>, cursor: number) {
  const funnyTone = FUNNY_TONES[cursor % FUNNY_TONES.length];
  let total = 0;
  let tender = 0;
  let funnyOfCursorTone = 0;
  for (const l of LOVE_RECEIPT_POOL) {
    if (shown.has(l.id)) continue;
    total++;
    if (l.side === 'tender') tender++;
    if (l.side === 'funny' && l.tone === funnyTone) funnyOfCursorTone++;
  }
  return { total, tender, funnyOfCursorTone };
}

// ── 1) + 2) 1000 draws, state threaded like the builder ─────────────────
const DRAWS = 1000;
let shown = new Set<string>();
let cursor = 0;
let firstBad: string | null = null;
let firstRepeat: string | null = null;

for (let i = 0; i < DRAWS; i++) {
  const inputShown = shown;
  // Was the pool able to satisfy every slot freshly this draw? If so, NONE of
  // the picked ids may have been in inputShown. If not (reset, or an anchor must
  // relax because its tone/side has no fresh line), repeats are allowed by
  // design — skip the freshness assertion. tender ≥ 2 leaves a fresh tender even
  // if the funny anchor collides with one (max one tender-foe per funny id).
  const f = freshness(inputShown, cursor);
  const freshRegime =
    f.total >= STARTING_LINE_COUNT && f.funnyOfCursorTone >= 1 && f.tender >= 2;

  const draw = sampleBalanced(inputShown, cursor);
  const { lines } = draw;
  const sides = sidesOf(lines);

  const hasFunny = sides.includes('funny');
  const hasTender = sides.includes('tender');

  const prices = lines.map((l) => norm(l.price));
  const distinctPrices = new Set(prices).size === prices.length;

  const idList = lines.map((l) => l.id);
  const ids = new Set(idList);
  const distinctIds = ids.size === idList.length;

  let collides = false;
  for (const id of Array.from(ids)) {
    const foes = COLLISION_MAP.get(id);
    if (foes && Array.from(foes).some((ff) => ids.has(ff))) collides = true;
  }

  const ok =
    lines.length === STARTING_LINE_COUNT &&
    hasFunny &&
    hasTender &&
    distinctPrices &&
    distinctIds &&
    !collides;
  if (!ok && firstBad === null) {
    firstBad = JSON.stringify(
      {
        i,
        ids: idList,
        sides,
        prices,
        hasFunny,
        hasTender,
        distinctPrices,
        distinctIds,
        collides,
      },
      null,
      2,
    );
  }

  // Cross-draw freshness: in the normal regime no id should repeat a shown one.
  if (freshRegime && firstRepeat === null) {
    const repeated = idList.filter((id) => inputShown.has(id));
    if (repeated.length) {
      firstRepeat = `draw ${i} repeated ${repeated.join(', ')} despite a fresh pool`;
    }
  }

  shown = draw.shownIds;
  cursor = draw.toneCursor;
}

check(
  firstBad === null,
  firstBad === null
    ? `${DRAWS} draws: each has ≥1 funny + ≥1 tender, distinct prices, distinct ids, no collision`
    : `draw violated an invariant → ${firstBad}`,
);
check(
  firstRepeat === null,
  firstRepeat === null
    ? `shownIds blocks cross-draw repeats while the pool stays fresh`
    : firstRepeat,
);

// ── 3) starting lines are exactly the defaults, in order ─────────────────
const starting = getStartingLines();
const startIds = starting.map((l) => l.id);
check(
  startIds.length === DEFAULT_STARTING_IDS.length &&
    startIds.every((id, idx) => id === DEFAULT_STARTING_IDS[idx]),
  `getStartingLines() === DEFAULT_STARTING_IDS in order ` +
    `(got [${startIds.join(', ')}])`,
);
check(
  starting.length === STARTING_LINE_COUNT,
  `getStartingLines() returns STARTING_LINE_COUNT (${STARTING_LINE_COUNT})`,
);

// ── 4) deterministic first-paint total ───────────────────────────────────
check(
  getDefaultTotal().id === DEFAULT_TOTAL_ID,
  `getDefaultTotal() is DEFAULT_TOTAL_ID (${DEFAULT_TOTAL_ID})`,
);

// ── 5) pickTotal never echoes a drawn line's price ───────────────────────
let totalBad: string | null = null;
let s2 = new Set<string>();
let c2 = 0;
for (let i = 0; i < DRAWS; i++) {
  const draw = sampleBalanced(s2, c2);
  const total = pickTotal(draw.lines);
  const linePrices = new Set(draw.lines.map((l) => norm(l.price)));
  if (linePrices.has(norm(total.price)) && totalBad === null) {
    totalBad = `total "${total.price}" collides with a line price (draw ${i})`;
  }
  s2 = draw.shownIds;
  c2 = draw.toneCursor;
}
check(
  totalBad === null,
  totalBad ?? `pickTotal over ${DRAWS} draws never echoed a line price`,
);

// ── verdict ─────────────────────────────────────────────────────────────
if (failures) {
  console.error(`\n✗ ${failures} invariant(s) failed`);
  process.exit(1);
}
console.log('\n✓ all love-receipt invariants hold');
