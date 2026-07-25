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

/** One pooled value for a single-value chrome slot. */
export interface ChromeOption {
  text: string;
  /** 🌶️ — unhinged-possessive; capped at `maxSpicy` per receipt. */
  spicy?: boolean;
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
  { text: `ISO 143:2025 certified down bad` },
  { text: `now under new management (you)` },
  { text: `est. the day you replied "haha" instead of leaving me on seen` },
  { text: `branch permanently closed to everyone except [recipient]` },
];

export const CASHIER_POOL: ChromeOption[] = [
  { text: `[sender]'s last 2 braincells (1 on medical leave)` },
  { text: `the delulu running this entire operation` },
  { text: `my impulse control (terminated for cause)` },
  { text: `the 3am version of me (most honest, least employable)` },
  { text: `cupid (currently on a PIP)` },
  { text: `the committee of voices that said "just text them"` },
  { text: `the HR dept. (recused — also down bad)` },
];

export const BILLED_TO_POOL: ChromeOption[] = [
  { text: `[recipient] (suspect #1)`, spicy: true },
  { text: `pookie (alias), DOB: my whole world` },
  { text: `my emotional support felony`, spicy: true },
  { text: `person of interest in 0 ongoing cases (charges dropped, by me)` },
  { text: `the defendant my heart refuses to prosecute` },
  { text: `[recipient], reachable at: my every thought` },
];

export const BILL_NUMBER_POOL: ChromeOption[] = [
  { text: `FIR-143/IPC-LOVE` },
  { text: `TATKAL-4EVER (waitlisted my whole life)` },
  { text: `AADHAAR-OF-MY-HEART` },
  { text: `CASE-2025-DOWNBAD` },
  { text: `CHALLAN-FOR-SPEEDING-INTO-LOVE` },
  { text: `UPI-REF-ILY69420` },
];

export const GSTIN_POOL: ChromeOption[] = [
  { text: `143INLOVE-RAIDED-OK` },
  { text: `27DOWNBAD0FCKS1Z9` },
  { text: `UIDAI-VERIFIED-OBSESSED` },
  { text: `INCOME-TAX-NOTICE-PENDING` },
  { text: `RBI-FLAGGED-TXN-69` },
];

export const SUBTOTAL_VALUE_POOL: ChromeOption[] = [
  { text: `a sum no calculator survived` },
  { text: `error: too much to compute` },
  { text: `the amount the RBI flagged` },
  { text: `more than mukesh ambani can afford` },
];

/** Adjustment lines — pick 2 distinct for the discount + tax rows. */
export const ADJUSTMENTS_POOL: AdjustmentOption[] = [
  { label: `delusion tax (200%)`, value: `levied by the feelings dept.` },
  { label: `"you're cute" discount`, value: `-100%, the manager was fired` },
  { label: `overthinking surcharge`, value: `compounded daily` },
  { label: `jealousy GST (28% + cess)`, value: `self-assessed` },
  { label: `income-tax raid on my heart`, value: `nothing found but you` },
  { label: `tatkal urgency fee (i wanted you NOW)`, value: `paid` },
  { label: `"did the seva for you" rebate`, value: `bhagwan approved` },
  { label: `ex-detection software license`, value: `annual, auto-renews` },
  { label: `3am voice-note data charges`, value: `unlimited pack` },
  {
    label: `mood-swing handling fee (you sulked, i replied late)`,
    value: `itemized`,
  },
];

export const TOTAL_DUE_POOL: ChromeOption[] = [
  { text: `my whole ❤ + 2 kidneys`, spicy: true },
  { text: `everything mukesh ambani can't buy` },
  { text: `you. — seized, not for sale` },
  { text: `the entire GDP of my heart` },
  { text: `₹∞ (RBI, please don't audit)` },
];

export const PAID_VIA_POOL: ChromeOption[] = [
  { text: `emotional damage (EMI, 0% interest)` },
  { text: `one (1) risky text, no refunds` },
  { text: `UPI: simp@okheart` },
  { text: `crying in the club + UPI` },
  { text: `tatkal payment, confirmed instantly` },
];

export const FINE_PRINT_POOL: ChromeOption[] = [
  { text: `all sales final. the feelings dept. does not entertain refunds.` },
  { text: `by reading this you are now legally my pookie. the courts agree.` },
  { text: `this document is admissible in the court of my heart.` },
  { text: `subject to mumma's approval and bhagwan's blessing.` },
  {
    text: `warranty void if you talk to your ex (we're watching)`,
    spicy: true,
  },
  { text: `e.&o.e. — errors, overthinking & ex-stalking excepted.` },
  { text: `prices revised daily per my personal delulu index.` },
];

export const RETURN_POLICY_POOL: ChromeOption[] = [
  { text: `you can't — you've been Aadhaar-linked to me.` },
  { text: `returns processed in the next lifetime (currently waitlisted).` },
  { text: `exchange window closed the second you said "hi".` },
  { text: `no returns. escalate to mumma if dissatisfied.` },
  { text: `you are now a non-cancellable subscription <3` },
];

export const SCAN_LINE_POOL: ChromeOption[] = [
  { text: `scan = how down bad i am (results may disturb you)` },
  { text: `scan to file your FIR (i'm the crime)` },
  { text: `do NOT scan at the dinner table (mumma will know)` },
  { text: `scan = legally binding simp agreement` },
  { text: `scanned 4,000,000 times (all me)` },
  { text: `caution: scanning reveals classified feelings` },
];

export const FOOTER_POOL: ChromeOption[] = [
  { text: `come again (tonight? tomorrow? forever? asking for me)` },
  { text: `no loyalty card — you're Aadhaar-linked now` },
  { text: `this store has no exit, by design` },
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
    subtitle: fill(`est. the day i met [recipient]`),
    cashier: fill(`[sender]'s last 2 braincells`),
    billedTo: fill(`[recipient]`),
    billNumber: `4EVER-001`,
    gstin: `NOCHILL69420`,
    subtotal: { label: SUBTOTAL_LABEL, price: `too much` },
    discount: { label: `"you’re cute" discount`, price: `-100%` },
    tax: { label: `delusion tax (200%)`, price: `generous` },
    total: `my whole ❤`,
    paidVia: `emotional damage`,
    finePrint: `all sales final. no refunds on feelings.`,
    returnPolicy: `return policy: you can't — you're stuck with me <3`,
    scanLine: `scan = how down bad i am`,
    footer: `come again (tonight?)`,
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
  // budget is spent, prefer values that differ from `prevValue`, and fill names.
  const pickOne = (pool: ChromeOption[], prevValue?: string): string => {
    let candidates = spicyUsed < maxSpicy ? pool : pool.filter((o) => !o.spicy);
    if (!candidates.length) candidates = pool; // safety (no non-spicy option)
    if (prevValue) {
      const fresh = candidates.filter((o) => fill(o.text) !== prevValue);
      if (fresh.length) candidates = fresh;
    }
    const choice = candidates[Math.floor(rng() * candidates.length)];
    if (choice.spicy) spicyUsed++;
    return fill(choice.text);
  };

  // Pick one fresh adjustment row (label … value), avoiding the `avoid` labels
  // and respecting the remaining spicy budget.
  const pickAdjustment = (avoid: Set<string>): ReceiptSummaryRow => {
    let pool = ADJUSTMENTS_POOL.filter((a) => spicyUsed < maxSpicy || !a.spicy);
    if (!pool.length) pool = ADJUSTMENTS_POOL.slice();
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
      ADJUSTMENTS_POOL.filter((a) => a.spicy).map((a) => fill(a.label)),
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
  const subtotal: ReceiptSummaryRow = isLocked('subtotal')
    ? prev!.subtotal
    : {
        label: SUBTOTAL_LABEL,
        price: pickOne(SUBTOTAL_VALUE_POOL, prev?.subtotal.price),
      };

  // discount + tax — retain locked rows; draw the rest distinct from each other
  // and from the prior labels.
  const prevAdjLabels = new Set(
    [prev?.discount.label, prev?.tax.label].filter(Boolean) as string[],
  );
  const avoidWith = (extra: string): Set<string> => {
    const s = new Set(prevAdjLabels);
    s.add(extra);
    return s;
  };
  let discount: ReceiptSummaryRow;
  let tax: ReceiptSummaryRow;
  if (isLocked('discount') && isLocked('tax')) {
    discount = prev!.discount;
    tax = prev!.tax;
  } else if (isLocked('discount')) {
    discount = prev!.discount;
    tax = pickAdjustment(avoidWith(discount.label));
  } else if (isLocked('tax')) {
    tax = prev!.tax;
    discount = pickAdjustment(avoidWith(tax.label));
  } else {
    discount = pickAdjustment(prevAdjLabels);
    tax = pickAdjustment(avoidWith(discount.label));
  }

  const total = isLocked('total')
    ? prev!.total
    : pickOne(TOTAL_DUE_POOL, prev?.total);
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
