/**
 * Love Receipt — chrome pools (MAX DELULU).
 *
 * Everything on the receipt that ISN'T a line item: the subtitle, cashier,
 * "Billed to", bill #, GSTIN, the summary rows (subtotal value + two
 * adjustments → discount/tax), the TOTAL DUE, "paid via", fine print, return
 * policy, scan caption, and footer.
 *
 * These used to be fixed defaults pulled from buildFrame() in ./lines. Now they
 * SHUFFLE per receipt the same way the item lines do — mirroring the
 * pool.ts / sampleBalanced pattern: one typed pool per slot, a deterministic
 * first-paint default ({@link getDefaultChrome}, the chrome equivalent of
 * getStartingLines), and a random draw ({@link pickChrome}) wired into the
 * builder's regenerate.
 *
 * The voice is deadpan Indian bureaucracy meets unhinged down-bad (FIR / RBI /
 * Aadhaar / tatkal / income-tax-raid energy, said completely straight).
 *
 * LOCKED constants (never pooled, never picked): the store name is ALWAYS
 * "DELULU MART" and the barcode ALWAYS encodes ILOVEYOU — those live in
 * ./lines and sender.tsx and pickChrome never touches them.
 *
 * `[recipient]` / `[sender]` placeholders are substituted at pick time
 * ({@link fillNames}); no raw token ever reaches the DOM. Lines tagged
 * `spicy: true` (the 🌶️ ones) tip toward unhinged-possessive — at most
 * `maxSpicy` (default 1) of them lands on any single receipt.
 */

import type { ReceiptSummaryRow } from './lines';

/**
 * The "joke register" a money-row value belongs to. SUBTOTAL and TOTAL DUE
 * always print together a few rows apart, so drawing both from the same register
 * reads as one gag told twice ("GDP-level" over "₹∞", or a doubled "priceless").
 * {@link pickChrome} guarantees the drawn pair never shares a register — the
 * SUBTOTAL/TOTAL equivalent of the structural DISCOUNT/TAX disjointness.
 *
 * Only {@link SUBTOTAL_VALUE_POOL} and {@link TOTAL_DUE_POOL} tag this; every
 * other pool leaves it undefined and is unaffected.
 */
export type MoneyRegister =
  /** unpayably large — "too much", "unaffordable", "GDP-level", "₹∞" */
  | 'vast'
  /** the whole of something — "everything", "all of me" */
  | 'entirety'
  /** beyond price — "priceless" */
  | 'priceless'
  /** the person IS the payment — "you.", "sold (to you)" */
  | 'you'
  /** organ-donation bit — "2 kidneys" */
  | 'body'
  /** reassurance rather than a sum — "ur worth it" */
  | 'affirmation';

/** One pooled value for a single-value chrome slot. */
export interface ChromeOption {
  text: string;
  /** 🌶️ — unhinged-possessive; capped at `maxSpicy` per receipt. */
  spicy?: boolean;
  /** Money rows only — see {@link MoneyRegister}. */
  register?: MoneyRegister;
}

/** An adjustment line ("label … value") feeding the discount / tax rows. */
export interface AdjustmentOption {
  label: string;
  value: string;
  spicy?: boolean;
}

/** The chrome portion of the payload that pick/getDefault both produce. */
export interface ReceiptChrome {
  subtitle: string;
  cashier: string;
  billedTo: string;
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

/** The SUBTOTAL row label is fixed; only its value shuffles. */
const SUBTOTAL_LABEL = 'SUBTOTAL';

// ── pools (one per editable chrome slot) ────────────────────────────────

export const SUBTITLE_POOL: ChromeOption[] = [
  { text: `a subsidiary of I Can Fix Him Pvt. Ltd.` },
  { text: `raided by the feelings dept. — still operating` },
  { text: `estd. 0.2 seconds after you said "hi"` },
];

export const CASHIER_POOL: ChromeOption[] = [
  { text: `[sender]'s last 2 braincells (1 on medical leave)` },
  { text: `ur pookie [sender]` },
];

export const BILLED_TO_POOL: ChromeOption[] = [
  { text: `[recipient], reachable at: my every thought` },
  { text: `[recipient] (mine only)` },
];

export const BILL_NUMBER_POOL: ChromeOption[] = [
  { text: `4EVER-001` },
  { text: `KISS-143` },
];

export const GSTIN_POOL: ChromeOption[] = [
  { text: `NOCHILL69420` },
  { text: `POOKIE143143` },
  { text: `SIMP4U143143` },
  { text: `UWU420CUTIE0` },
  { text: `MWAH00001430` },
];

/** SUBTOTAL values. `register` keeps this row off TOTAL DUE's joke — see
 *  {@link MoneyRegister}. */
export const SUBTOTAL_VALUE_POOL: ChromeOption[] = [
  { text: `too much`, register: 'vast' },
  { text: `everything`, register: 'entirety' },
  { text: `priceless`, register: 'priceless' },
  { text: `unaffordable`, register: 'vast' },
  { text: `ur worth it`, register: 'affirmation' },
  { text: `GDP-level`, register: 'vast' },
];

/** Discount-row adjustments. Disjoint from {@link TAX_POOL}, so the two summary
 *  rows can never draw the same label (the old shared-pool distinctness rule is
 *  now structural rather than enforced at pick time). */
export const DISCOUNT_POOL: AdjustmentOption[] = [
  { label: `"you're cute" discount`, value: `-100%` },
  { label: `pookie privilege`, value: `-50%` },
  { label: `"that smile" rebate`, value: `applied` },
  { label: `simp loyalty points`, value: `redeemed` },
  { label: `first-look discount`, value: `-143%` },
];

/** Tax-row adjustments. Every label carries the fixed (200%) rate. */
export const TAX_POOL: AdjustmentOption[] = [
  { label: `delusion tax (200%)`, value: `deserved` },
  { label: `simp tax (200%)`, value: `worth it` },
  { label: `yearning tax (200%)`, value: `obviously` },
  { label: `butterflies tax (200%)`, value: `no regrets` },
  { label: `down-bad tax (200%)`, value: `self-assessed` },
];

/** TOTAL DUE values. Drawn AFTER the subtotal and forced into a different
 *  {@link MoneyRegister}, so the two money rows never tell the same joke. */
export const TOTAL_DUE_POOL: ChromeOption[] = [
  { text: `you.`, register: 'you' },
  { text: `my everything`, register: 'entirety' },
  { text: `2 kidneys`, spicy: true, register: 'body' },
  { text: `₹∞`, register: 'vast' },
  { text: `all of me`, register: 'entirety' },
  { text: `priceless`, register: 'priceless' },
  { text: `sold (to you)`, register: 'you' },
];

export const PAID_VIA_POOL: ChromeOption[] = [
  { text: `emotional damage` },
  { text: `one risky text` },
  { text: `UPI: simp@ok` },
  { text: `crying + UPI` },
  { text: `my sanity` },
  { text: `forehead kiss` },
  { text: `overthinking` },
];

export const FINE_PRINT_POOL: ChromeOption[] = [
  { text: `all sales final. the feelings dept. does not entertain refunds.` },
  { text: `by reading this you are now legally my pookie. the courts agree.` },
  { text: `prices revised daily per my personal delulu index.` },
];

export const RETURN_POLICY_POOL: ChromeOption[] = [
  { text: `exchange window closed the second you said "hi".` },
  { text: `try it. i'll cry. <3` },
];

export const SCAN_LINE_POOL: ChromeOption[] = [
  { text: `scan = how down bad i am (results may disturb you)` },
  { text: `scan to file your FIR (i'm the crime)` },
];

export const FOOTER_POOL: ChromeOption[] = [
  { text: `come again (tonight? tomorrow? forever? asking for me)` },
  { text: `delulu mart: now open inside your chest, rent-free` },
  { text: `thank you for shopping your heart out` },
];

// ── placeholder substitution ────────────────────────────────────────────
// Reuses the existing buildFrame() fallback logic: [recipient] → the recipient
// name (fallback "my favourite person"), [sender] → the sender name (fallback
// "my"). The possessive "[sender]'s" is handled first so the no-name case reads
// "my last 2 braincells", never "my's …".

/** Fill name tokens in a pooled string; both names arrive pre-trimmed. */
function fillNames(text: string, recipient: string, sender: string): string {
  return text
    .replace(/\[recipient\]/g, recipient || 'my favourite person')
    .replace(/\[sender\]'s/g, sender ? `${sender}'s` : 'my')
    .replace(/\[sender\]/g, sender || 'my');
}

export interface ChromeNames {
  recipientName?: string;
  senderName?: string;
}

// ── first-paint defaults (the ★ defaults, kept verbatim) ─────────────────
// The chrome equivalent of getStartingLines(): deterministic, no randomness.
// These reproduce the previous buildFrame() defaults exactly, so the very first
// receipt the builder shows is unchanged — only regenerate brings the pools in.

/**
 * The deterministic ★ defaults, with name tokens filled. Used to seed the
 * builder before any regenerate. No randomness, no spicy lines.
 */
export function getDefaultChrome(opts: ChromeNames = {}): ReceiptChrome {
  const recipient = opts.recipientName?.trim() ?? '';
  const sender = opts.senderName?.trim() ?? '';
  const fill = (t: string) => fillNames(t, recipient, sender);
  return {
    subtitle: fill(`estd. 0.2 seconds after you said "hi"`),
    cashier: fill(`[sender]'s last 2 braincells (1 on medical leave)`),
    billedTo: fill(`[recipient] (mine only)`),
    billNumber: `4EVER-001`,
    gstin: `NOCHILL69420`,
    subtotal: { label: SUBTOTAL_LABEL, price: `too much` },
    discount: {
      label: `"you're cute" discount`,
      price: `-100%`,
    },
    tax: { label: `delusion tax (200%)`, price: `deserved` },
    total: `you.`,
    paidVia: `emotional damage`,
    finePrint: `all sales final. the feelings dept. does not entertain refunds.`,
    returnPolicy: `exchange window closed the second you said "hi".`,
    scanLine: `scan = how down bad i am (results may disturb you)`,
    footer: `come again (tonight? tomorrow? forever? asking for me)`,
  };
}

// ── random draw (the chrome equivalent of sampleBalanced) ────────────────

export interface PickChromeOptions extends ChromeNames {
  /** the previous chrome — its per-slot value is avoided so draws feel fresh. */
  prev?: ReceiptChrome | null;
  /** max spicy lines across the whole receipt (default 1). */
  maxSpicy?: number;
  /** injectable RNG for deterministic tests (default Math.random). */
  rng?: () => number;
  /**
   * Slots the user has edited — kept verbatim from `prev` instead of being
   * redrawn, so a regenerate only reshuffles the untouched chrome. Requires
   * `prev`; ignored for any slot when `prev` is absent.
   */
  lock?: Partial<Record<keyof ReceiptChrome, boolean>>;
}

function shuffleArr<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Draw a full set of chrome — one random pick per single-value slot plus two
 * distinct adjustments for the discount/tax rows. At most `maxSpicy` spicy lines
 * land across the whole receipt (a would-be over-budget pick re-rolls from the
 * slot's non-spicy options). Where possible the immediately prior value for each
 * slot is avoided so consecutive regenerates feel fresh. Name tokens are filled,
 * so no raw `[recipient]`/`[sender]` ever reaches the DOM.
 *
 * Never sets the store name or barcode — those stay the locked DELULU MART /
 * ILOVEYOU constants.
 */
export function pickChrome(opts: PickChromeOptions = {}): ReceiptChrome {
  const recipient = opts.recipientName?.trim() ?? '';
  const sender = opts.senderName?.trim() ?? '';
  const maxSpicy = opts.maxSpicy ?? 1;
  const rng = opts.rng ?? Math.random;
  const prev = opts.prev ?? null;
  const lock = opts.lock ?? null;
  const fill = (t: string) => fillNames(t, recipient, sender);

  let spicyUsed = 0;
  const canLock = !!(prev && lock);
  const isLocked = (k: keyof ReceiptChrome): boolean => canLock && !!lock![k];

  // Pick one option from a single-value pool: drop spicy lines once the spicy
  // budget is spent, skip anything `veto`ed, prefer values that differ from
  // `prevValue`. Returns the OPTION (callers that need only the rendered string
  // use pickOne); the money rows need the chosen entry's `register` too.
  // Every narrowing step is applied only when it leaves something to draw from,
  // so an over-constrained slot degrades to a wider pool instead of throwing.
  const pickOption = (
    pool: ChromeOption[],
    prevValue?: string,
    veto?: (o: ChromeOption) => boolean,
  ): ChromeOption => {
    let candidates = spicyUsed < maxSpicy ? pool : pool.filter((o) => !o.spicy);
    if (!candidates.length) candidates = pool; // safety (no non-spicy option)
    if (veto) {
      const allowed = candidates.filter((o) => !veto(o));
      if (allowed.length) candidates = allowed;
    }
    if (prevValue) {
      const fresh = candidates.filter((o) => fill(o.text) !== prevValue);
      if (fresh.length) candidates = fresh;
    }
    const choice = candidates[Math.floor(rng() * candidates.length)];
    if (choice.spicy) spicyUsed++;
    return choice;
  };

  const pickOne = (pool: ChromeOption[], prevValue?: string): string =>
    fill(pickOption(pool, prevValue).text);

  /** The register of an already-decided money value (a LOCKED slot, or one the
   *  user typed by hand). Custom text matches no pool entry → undefined → that
   *  row simply imposes no constraint on the other. */
  const registerOf = (
    pool: ChromeOption[],
    value: string,
  ): MoneyRegister | undefined =>
    pool.find((o) => fill(o.text) === value)?.register;

  // Pick one fresh adjustment row (label … value) from the given pool, avoiding
  // the `avoid` labels and respecting the remaining spicy budget. DISCOUNT_POOL
  // and TAX_POOL are disjoint, so the discount/tax rows can no longer collide —
  // `avoid` now only carries the PRIOR draw's label, for freshness.
  const pickAdjustment = (
    from: AdjustmentOption[],
    avoid: Set<string>,
  ): ReceiptSummaryRow => {
    let pool = from.filter((a) => spicyUsed < maxSpicy || !a.spicy);
    if (!pool.length) pool = from.slice();
    const fresh = pool.filter((a) => !avoid.has(fill(a.label)));
    const source = fresh.length ? fresh : pool;
    const a = shuffleArr(source, rng)[0];
    if (a.spicy) spicyUsed++;
    return { label: fill(a.label), price: fill(a.value) };
  };

  // Spice budget is computed over the EFFECTIVE chrome: first charge it for any
  // LOCKED slot whose retained value is a spicy POOL entry (user-typed custom
  // text never matches a pool entry, so it counts as non-spicy), then spend what
  // remains only on the unlocked slots drawn below.
  if (canLock) {
    const spicyTextsOf = (pool: ChromeOption[]): Set<string> =>
      new Set(pool.filter((o) => o.spicy).map((o) => fill(o.text)));
    const chargeLocked = (
      k: keyof ReceiptChrome,
      pool: ChromeOption[],
      val: string,
    ) => {
      if (isLocked(k) && spicyTextsOf(pool).has(val)) spicyUsed++;
    };
    chargeLocked('subtitle', SUBTITLE_POOL, prev!.subtitle);
    chargeLocked('cashier', CASHIER_POOL, prev!.cashier);
    chargeLocked('billedTo', BILLED_TO_POOL, prev!.billedTo);
    chargeLocked('billNumber', BILL_NUMBER_POOL, prev!.billNumber);
    chargeLocked('gstin', GSTIN_POOL, prev!.gstin);
    chargeLocked('total', TOTAL_DUE_POOL, prev!.total);
    chargeLocked('paidVia', PAID_VIA_POOL, prev!.paidVia);
    chargeLocked('finePrint', FINE_PRINT_POOL, prev!.finePrint);
    chargeLocked('returnPolicy', RETURN_POLICY_POOL, prev!.returnPolicy);
    chargeLocked('scanLine', SCAN_LINE_POOL, prev!.scanLine);
    chargeLocked('footer', FOOTER_POOL, prev!.footer);
    const spicyAdjLabels = new Set(
      [...DISCOUNT_POOL, ...TAX_POOL]
        .filter((a) => a.spicy)
        .map((a) => fill(a.label)),
    );
    if (isLocked('discount') && spicyAdjLabels.has(prev!.discount.label)) {
      spicyUsed++;
    }
    if (isLocked('tax') && spicyAdjLabels.has(prev!.tax.label)) spicyUsed++;
  }

  // Draw the UNLOCKED slots; retain the locked ones verbatim from `prev`. The
  // store name / barcode never appear here — they stay the locked constants.
  const subtitle = isLocked('subtitle')
    ? prev!.subtitle
    : pickOne(SUBTITLE_POOL, prev?.subtitle);
  const cashier = isLocked('cashier')
    ? prev!.cashier
    : pickOne(CASHIER_POOL, prev?.cashier);
  const billedTo = isLocked('billedTo')
    ? prev!.billedTo
    : pickOne(BILLED_TO_POOL, prev?.billedTo);
  const billNumber = isLocked('billNumber')
    ? prev!.billNumber
    : pickOne(BILL_NUMBER_POOL, prev?.billNumber);
  const gstin = isLocked('gstin')
    ? prev!.gstin
    : pickOne(GSTIN_POOL, prev?.gstin);
  // SUBTOTAL is drawn FIRST so its register can constrain TOTAL DUE below. The
  // reverse case matters too: when TOTAL is locked and SUBTOTAL is not, the
  // locked total's register constrains THIS draw, so the guarantee holds in both
  // directions rather than only for the draw that happens to run second.
  const lockedTotalRegister = isLocked('total')
    ? registerOf(TOTAL_DUE_POOL, prev!.total)
    : undefined;
  const subtotal: ReceiptSummaryRow = isLocked('subtotal')
    ? prev!.subtotal
    : {
        label: SUBTOTAL_LABEL,
        price: fill(
          pickOption(
            SUBTOTAL_VALUE_POOL,
            prev?.subtotal.price,
            lockedTotalRegister
              ? (o) => o.register === lockedTotalRegister
              : undefined,
          ).text,
        ),
      };
  // Works for a locked/user-typed subtotal too: registerOf just looks the final
  // value up in the pool, so the constraint holds however the row was decided.
  const subtotalRegister = registerOf(SUBTOTAL_VALUE_POOL, subtotal.price);

  // discount + tax — retain locked rows, draw the rest from their OWN pool. The
  // two pools are disjoint, so the rows are distinct by construction; `avoid`
  // now only carries that row's prior label, so a regenerate feels fresh.
  const avoidPrev = (label?: string): Set<string> =>
    new Set(label ? [label] : []);
  const discount: ReceiptSummaryRow = isLocked('discount')
    ? prev!.discount
    : pickAdjustment(DISCOUNT_POOL, avoidPrev(prev?.discount.label));
  const tax: ReceiptSummaryRow = isLocked('tax')
    ? prev!.tax
    : pickAdjustment(TAX_POOL, avoidPrev(prev?.tax.label));

  // TOTAL DUE — never the same joke register as the SUBTOTAL printed above it.
  const total = isLocked('total')
    ? prev!.total
    : fill(
        pickOption(
          TOTAL_DUE_POOL,
          prev?.total,
          subtotalRegister ? (o) => o.register === subtotalRegister : undefined,
        ).text,
      );
  const paidVia = isLocked('paidVia')
    ? prev!.paidVia
    : pickOne(PAID_VIA_POOL, prev?.paidVia);
  const finePrint = isLocked('finePrint')
    ? prev!.finePrint
    : pickOne(FINE_PRINT_POOL, prev?.finePrint);
  const returnPolicy = isLocked('returnPolicy')
    ? prev!.returnPolicy
    : pickOne(RETURN_POLICY_POOL, prev?.returnPolicy);
  const scanLine = isLocked('scanLine')
    ? prev!.scanLine
    : pickOne(SCAN_LINE_POOL, prev?.scanLine);
  const footer = isLocked('footer')
    ? prev!.footer
    : pickOne(FOOTER_POOL, prev?.footer);

  return {
    subtitle,
    cashier,
    billedTo,
    billNumber,
    gstin,
    subtotal,
    discount,
    tax,
    total,
    paidVia,
    finePrint,
    returnPolicy,
    scanLine,
    footer,
  };
}
