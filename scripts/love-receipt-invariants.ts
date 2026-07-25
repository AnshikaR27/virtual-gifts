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
 *     every draw has ≥1 funny AND ≥1 tender AND ≥1 flavor tone, no duplicate
 *     normalized prices,
 *     no collision pair co-occurs, no id repeats within a draw.
 *  2. shownIds prevents repeats across consecutive draws until a reset (or until
 *     the pool can't satisfy an anchor side freshly — the documented relax).
 *  3. getStartingLines() returns EXACTLY the 4 DEFAULT_STARTING_IDS, in order.
 *  4. getDefaultTotal() is DEFAULT_TOTAL_ID (the deterministic first paint).
 *  5. pickTotal() never returns a price (normalized) already on a drawn line.
 *  6. Every SUBTOTAL / TOTAL DUE pooled value carries a MoneyRegister tag — an
 *     untagged one silently opts out of 7.
 *  7. pickChrome() never draws SUBTOTAL and TOTAL DUE from the same register,
 *     both on a free draw and with a LOCKED total constraining the subtotal.
 */

import {
  pickChrome,
  SUBTOTAL_VALUE_POOL,
  TOTAL_DUE_POOL,
  type MoneyRegister,
} from '../src/gifts/love-receipt/chrome';
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
  type Tone,
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

// The flavor guarantee is asserted on TONE, not side: the guarantee is that a
// 'real-life'/'almost-moment' LINE surfaces, and tone is the source of truth for
// that. Checking tone keeps the gate correct even if a flavor line is ever
// tagged with a non-flavor tone (as lr-162 once was, before it was corrected).
const TONE_BY_ID = new Map<string, Tone>(
  LOVE_RECEIPT_POOL.map((l) => [l.id, l.tone]),
);
const FLAVOR_TONES: readonly Tone[] = ['real-life', 'almost-moment'];
const hasFlavorTone = (lines: ReceiptLine[]) =>
  lines.some((l) => FLAVOR_TONES.includes(TONE_BY_ID.get(l.id)!));

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
  const hasFlavor = hasFlavorTone(lines);

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
    hasFlavor &&
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
        hasFlavor,
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
    ? `${DRAWS} draws: each has ≥1 funny + ≥1 tender + ≥1 flavor, distinct prices, distinct ids, no collision`
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

// ── 6) every money-row value carries a register tag ──────────────────────
// The tag IS the invariant: pickChrome looks a decided value up in its pool to
// find the register, so an untagged entry resolves to undefined and silently
// imposes/receives no constraint — it would opt out of 7 without failing it.
const untagged = [
  ...SUBTOTAL_VALUE_POOL.map((o) => ['SUBTOTAL', o] as const),
  ...TOTAL_DUE_POOL.map((o) => ['TOTAL DUE', o] as const),
].filter(([, o]) => !o.register);
check(
  untagged.length === 0,
  untagged.length === 0
    ? `every SUBTOTAL (${SUBTOTAL_VALUE_POOL.length}) + TOTAL DUE ` +
        `(${TOTAL_DUE_POOL.length}) value carries a register tag`
    : `untagged money value(s): ` +
        untagged.map(([row, o]) => `${row} "${o.text}"`).join(', '),
);

// ── 7) SUBTOTAL and TOTAL DUE never share a register ─────────────────────
// The two money rows print a few lines apart, so drawing both from the same
// joke register reads as a repeat ("GDP-level" over "₹∞", "priceless" twice).
const CHROME_DRAWS = 20_000;

const regOf = (
  pool: readonly { text: string; register?: MoneyRegister }[],
  value: string,
): MoneyRegister | undefined => pool.find((o) => o.text === value)?.register;

let chromeBad: string | null = null;
const subSeen = new Set<string>();
const totSeen = new Set<string>();

for (let i = 0; i < CHROME_DRAWS; i++) {
  const c = pickChrome();
  subSeen.add(c.subtotal.price);
  totSeen.add(c.total);
  if (chromeBad !== null) continue;

  const rs = regOf(SUBTOTAL_VALUE_POOL, c.subtotal.price);
  const rt = regOf(TOTAL_DUE_POOL, c.total);
  // A DRAWN value (never user-typed here) must always resolve. An unresolvable
  // one — e.g. a pooled value carrying a [recipient] token, which reaches the
  // row already filled — would skip the comparison and hide a violation.
  if (!rs || !rt) {
    chromeBad =
      `draw ${i}: value did not resolve to a register ` +
      `(subtotal "${c.subtotal.price}" → ${rs ?? 'none'}, ` +
      `total "${c.total}" → ${rt ?? 'none'})`;
  } else if (rs === rt) {
    chromeBad =
      `draw ${i}: subtotal "${c.subtotal.price}" and total "${c.total}" ` +
      `share register "${rs}"`;
  }
}

// Coverage guard — a pass means nothing if the sweep never exercised the pools.
const covered =
  subSeen.size === SUBTOTAL_VALUE_POOL.length &&
  totSeen.size === TOTAL_DUE_POOL.length;
check(
  chromeBad === null && covered,
  chromeBad ??
    (covered
      ? `pickChrome over ${CHROME_DRAWS} draws never shared a register ` +
        `(saw all ${subSeen.size} subtotal + ${totSeen.size} total values)`
      : `coverage gap: saw ${subSeen.size}/${SUBTOTAL_VALUE_POOL.length} ` +
        `subtotal, ${totSeen.size}/${TOTAL_DUE_POOL.length} total values`),
);

// The reverse direction: when TOTAL is locked the subtotal is the row that must
// dodge, so the guarantee can't depend on which row happens to be drawn second.
const LOCKED_DRAWS = 300;
let lockedBad: string | null = null;
let lockedChecked = 0;

for (const tot of TOTAL_DUE_POOL) {
  for (let i = 0; i < LOCKED_DRAWS && lockedBad === null; i++) {
    const prev = { ...pickChrome(), total: tot.text };
    const c = pickChrome({ prev, lock: { total: true } });
    if (c.total !== tot.text) {
      lockedBad = `lock ignored: total "${tot.text}" became "${c.total}"`;
      break;
    }
    lockedChecked++;
    const rs = regOf(SUBTOTAL_VALUE_POOL, c.subtotal.price);
    if (rs && rs === tot.register) {
      lockedBad =
        `locked total "${tot.text}" (${tot.register}) drew subtotal ` +
        `"${c.subtotal.price}" from the same register`;
    }
  }
}
check(
  lockedBad === null,
  lockedBad ??
    `a LOCKED total constrains the subtotal redraw ` +
      `(${lockedChecked} draws across ${TOTAL_DUE_POOL.length} locked totals)`,
);

// ── verdict ─────────────────────────────────────────────────────────────
if (failures) {
  console.error(`\n✗ ${failures} invariant(s) failed`);
  process.exit(1);
}
console.log('\n✓ all love-receipt invariants hold');
