// love-receipt pool — English, curated + tone-tagged for the balanced shuffle.
//
// PURE DATA. The engine (the balanced draw + total picker) lives in `lines.ts`
// as sampleBalanced/pickTotal — this file only ships the pool, the totals, the
// collision pairs and the first-load ids.
//
// What changed in this merge:
//  - added the finalized conversation batch (lr-143..lr-169, lrt-007..lrt-008).
//  - resolved: "calm after my own storm" got `weather-proofed`; "shortest poem"
//    became a TOTAL ("your name" as the price); papa line got `staged`;
//    first-bite line ships as `first served` (the `priority` variant is retired).
//  - `viral` kept by author's call — it fails the strict price-column test;
//    the rescue line is in a comment beside it if you change your mind.
//  - new collision pairs for semantic twins across old + new lines.
//
// Field map: `text` + `price` render on the receipt line; `tone`/`side` are
// backend-only; `lang` future-proofs the Hinglish pool.
// REVISIT: add a Hinglish pool beside this one (same shape, lang: 'hi').

export type Tone =
  | 'giggle'
  | 'petty'
  | 'delulu'
  | 'real-life'
  | 'almost-moment'
  | 'tender';

/** Whiplash class the balancer uses.
 *  funny  = jokes (giggle / petty / delulu)
 *  tender = genuine gut-punch
 *  flavor = soft/charged in-between (real-life / almost-moment) — fills slots
 *           but never satisfies the funny or tender minimum on its own. */
export type Side = 'funny' | 'tender' | 'flavor';

export interface PoolLine {
  id: string;
  text: string;
  price: string;
  tone: Tone;
  side: Side;
  lang: 'en';
}

/** Heavy gut-punch lines reserved for the TOTAL slot (one per receipt). */
export interface ReceiptTotal {
  id: string;
  text: string;
  price: string;
  lang: 'en';
}

export const LOVE_RECEIPT_POOL: PoolLine[] = [
  // ── funny: giggle / petty / delulu ──────────────────────────────────────
  {
    id: 'lr-001',
    text: `your hoodie (im NOT returning)`,
    price: `kept`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-002',
    text: `47× futures i planned w u`,
    price: `EMI`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-003',
    text: `the audacity to look this good`,
    price: `santoor tax`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-005',
    text: `you "didn't like him" (the guy said hi, once)`,
    price: `mine`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-006',
    text: `you got grumpy 'cause i replied late (i was asleep)`,
    price: `sulk tax`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-008',
    text: `told mumma "just a friend" (my face lied)`,
    price: `busted`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-023',
    text: `you held my hand crossing the road (i'm 24 btw)`,
    price: `VIP`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-033',
    text: `you hold my bag, phone, AND dupatta`,
    price: `cloakroom`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-035',
    text: `you finish my sentences`,
    price: `same brain`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-039',
    text: `you let me "win" the argument`,
    price: `charity`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-044',
    text: `"five more minutes" — it has been an hour`,
    price: `overdue`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-045',
    text: `you sulked 'cause a guy in a reel made me laugh harder than you`,
    price: `petty`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-050',
    text: `you're the reason my camera roll is 90% nonsense`,
    price: `archive`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-056',
    text: `i looked for red flags and found dimples`,
    price: `compromised`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-057',
    text: `i became one of those people who smiles at their phone`,
    price: `tragic`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-058',
    text: `every couple reel became our reel`,
    price: `tagged`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-059',
    text: `you reacted ❤️ and i built a future`,
    price: `under construction`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-060',
    text: `i sent a risky text and threw my phone away`,
    price: `launched`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-061',
    text: `your "hmm" caused three business days of overthinking`,
    price: `processing`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-062',
    text: `i said "do whatever you want"`,
    price: `trap card`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-063',
    text: `this reel reminded me of you`,
    price: `all of them`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-064',
    text: `i saw an old couple and thought "us"`,
    price: `projection`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-065',
    text: `i imagined us arguing about curtains`,
    price: `future planning`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-068',
    text: `you followed a new person and i opened a case file`,
    price: `compliance review`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-069',
    text: `you got a haircut and expected me to stay normal`,
    price: `impossible request`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-070',
    text: `you laughed at someone else's joke first`,
    price: `complaint filed`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-071',
    text: `i started saying things you say`,
    price: `software update`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-072',
    text: `i said i wasn't jealous`,
    price: `false declaration`,
    tone: 'petty',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-073',
    text: `your honour, i fear i have feelings`,
    price: `court record`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-074',
    text: `my friends know too much about you`,
    price: `information leak`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-075',
    text: `i imagined your reaction before telling the story`,
    price: `pre-approved`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-078',
    text: `i reread old messages for no reason`,
    price: `archived`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-080',
    text: `i checked if you'd seen my story`,
    price: `delivery confirmation`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-088',
    text: `did the seva, asked bhagwan to fast-track u home`,
    price: `fate tax included`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-096',
    text: `nonchalant for everyone else, pookie for me`,
    price: `exclusive access`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-100',
    text: `me ranting for 37 minutes straight`,
    price: `overtime approved`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-101',
    text: `my adhd brain telling you 10 stories in 1 story`,
    price: `bundled package`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },

  // ── funny: finalized batch (cheesy cliché-made-literal + delulu qty) ─────
  {
    id: 'lr-144',
    text: `i'd send you my whole heart on UPI, no splitting`,
    price: `full payment`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  // NOTE: `viral` fails the strict price-column test (vibe word, not a charge).
  // Kept by author's call. Rescue if you flip: "you've been living rent-free in
  // my head all week — now invoiced".
  {
    id: 'lr-149',
    text: `you've been trending in my head all week`,
    price: `viral`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-150',
    text: `loving you is a full-time job and HR still hasn't paid me`,
    price: `unpaid`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-151',
    text: `you stole my heart, technically that's a crime`,
    price: `actionable`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-152',
    text: `i don't need maps, you're my entire sense of direction`,
    price: `recalculating`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-153',
    text: `you're so sweet i should get it medically documented`,
    price: `prescribed`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-154',
    text: `my heart said "that's the one," my brain agreed for once`,
    price: `unanimous`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-155',
    text: `are you a loan? you've got my full interest`,
    price: `accruing`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-156',
    text: `the only argument you won't let me win is who loves who more`,
    price: `disputed`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-158',
    text: `you touched mummy's feet and she texted me "ladka achha hai"`,
    price: `approval fee`,
    tone: 'giggle',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-168',
    text: `32× your name written just to test a pen`,
    price: `signature move`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },
  {
    id: 'lr-169',
    text: `9× rehearsals of how i'd introduce you to papa`,
    price: `staged`,
    tone: 'delulu',
    side: 'funny',
    lang: 'en',
  },

  // ── tender: body gut-punches (heaviest ones live in TOTALS) ─────────────
  {
    id: 'lr-018',
    text: `i sleep better since you`,
    price: `8 hrs`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-019',
    text: `i want all your boring Tuesdays, every one`,
    price: `booked`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-025',
    text: `you became the first person i tell good news to`,
    price: `1st call`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-028',
    text: `you remembered what i wore on day one`,
    price: `filed`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-032',
    text: `you make forever sound too short`,
    price: `encore`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-047',
    text: `i want to scroll reels next to you till we're old`,
    price: `long lease`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-048',
    text: `you're my "guess what happened today"`,
    price: `first dibs`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-049',
    text: `you're who i look for the second i walk in`,
    price: `radar`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-051',
    text: `you're the plan even when there's no plan`,
    price: `default`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-067',
    text: `i miss you in the middle of perfectly good days`,
    price: `recurring`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-081',
    text: `you became the person i save things for`,
    price: `bookmarked`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-083',
    text: `you became my favourite part of ordinary days`,
    price: `featured item`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },

  // ── tender: finalized batch ──────────────────────────────────────────────
  {
    id: 'lr-157',
    text: `you saved our first blurry photo through three phone upgrades`,
    price: `migrated`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-159',
    text: `you kept loving the version of me i was embarrassed of`,
    price: `grandfathered`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-160',
    text: `you fell asleep holding my hand and didn't let go even unconscious`,
    price: `locked`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-163',
    text: `you're the calm after my own storm`,
    price: `weather-proofed`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-164',
    text: `"home" autocompletes to you now`,
    price: `remapped`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-165',
    text: `my password hint is just you`,
    price: `recovered`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-166',
    text: `you read my drafts — the texts AND the dreams`,
    price: `subscribed`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },
  {
    id: 'lr-167',
    text: `my emergency contact, my first call, my last text`,
    price: `consolidated`,
    tone: 'tender',
    side: 'tender',
    lang: 'en',
  },

  // ── flavor: real-life (soft) + almost-moment (charged) ──────────────────
  {
    id: 'lr-011',
    text: `you called me by that nickname`,
    price: `1 of 1`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-013',
    text: `you said "drive safe"`,
    price: `₹143`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-014',
    text: `you asked "khaana khaya?"`,
    price: `∞`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-015',
    text: `you stayed on call till i fell asleep`,
    price: `overtime`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-027',
    text: `metro was packed, you became my wall`,
    price: `shield`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-040',
    text: `you waited at my gate till i got inside`,
    price: `watched in`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-041',
    text: `you keep your hand on my knee while driving`,
    price: `anchored`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-052',
    text: `you took 7 bad pics to get me one good one`,
    price: `burst mode`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-053',
    text: `you waited outside the temple holding my sandals`,
    price: `guard duty`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-054',
    text: `you slow your walk so i can keep up`,
    price: `paced`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-091',
    text: `you wore my initial around your neck`,
    price: `claimed`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-093',
    text: `you stopped mid-walk to pick me a flower`,
    price: `detour approved`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-004',
    text: `you leaned in… to grab your phone`,
    price: `void`,
    tone: 'almost-moment',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-084',
    text: `you looked at my lips for a second too long`,
    price: `flagged`,
    tone: 'almost-moment',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-085',
    text: `your "come here" voice`,
    price: `premium feature`,
    tone: 'almost-moment',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-086',
    text: `you pulled me closer during a photo`,
    price: `adjusted manually`,
    tone: 'almost-moment',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-087',
    text: `eye contact lasted longer than recommended`,
    price: `safety violation`,
    tone: 'almost-moment',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-099',
    text: `your hand on my thigh`,
    price: `system failure`,
    tone: 'almost-moment',
    side: 'flavor',
    lang: 'en',
  },

  // ── flavor: finalized batch ──────────────────────────────────────────────
  {
    id: 'lr-143',
    text: `i'm always the first bite off your plate`,
    price: `first served`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-145',
    text: `speed-breakers double as a reason to hold on tighter`,
    price: `reinforced`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-146',
    text: `dropping me home, you take the longest route on purpose`,
    price: `rerouted`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-147',
    text: `your half-asleep voice`,
    price: `uncut`,
    tone: 'almost-moment',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-148',
    text: `you hold my hand and won't let go`,
    price: `fixed deposit`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-161',
    text: `you carried four jhola bags so i could keep holding your hand`,
    price: `outsourced`,
    tone: 'real-life',
    side: 'flavor',
    lang: 'en',
  },
  {
    id: 'lr-162',
    text: `you saved my ugliest selfie as your wallpaper`,
    price: `committed`,
    tone: 'giggle',
    side: 'flavor',
    lang: 'en',
  },
];

/** TOTAL-slot pool. Longer phrasing allowed; lands as the receipt total. */
export const LOVE_RECEIPT_TOTALS: ReceiptTotal[] = [
  {
    id: 'lrt-001',
    text: `you're the first good thing that stayed`,
    price: `lifer`,
    lang: 'en',
  },
  {
    id: 'lrt-002',
    text: `you feel less like a risk and more like a roof`,
    price: `shelter`,
    lang: 'en',
  },
  {
    id: 'lrt-003',
    text: `quietly hoping you're my last first-everything`,
    price: `pre-order`,
    lang: 'en',
  },
  {
    id: 'lrt-004',
    text: `i'd pick you in every version of this life`,
    price: `any life`,
    lang: 'en',
  },
  {
    id: 'lrt-005',
    text: `my bsf, loml, my everything`,
    price: `one-stop shop`,
    lang: 'en',
  },
  { id: 'lrt-006', text: `you.`, price: `non-refundable`, lang: 'en' },
  { id: 'lrt-007', text: `you. again. always.`, price: `reorder`, lang: 'en' },
  {
    id: 'lrt-008',
    text: `the shortest poem i know`,
    price: `your name`,
    lang: 'en',
  },
];

// Lines that must never share a receipt (near-duplicate prices/themes).
// The dup-price guard in sampleBalanced() catches exact price clashes for free;
// list here only the semantic twins it can't see.
export const COLLISION_PAIRS: [string, string][] = [
  ['lr-050', 'lr-078'], // archive / archived
  ['lr-015', 'lr-100'], // overtime / overtime approved
  ['lr-068', 'lr-070'], // both jealous-following
  ['lr-025', 'lr-048'], // both "first to tell you things"
  ['lr-148', 'lr-160'], // fixed deposit / locked — same hand-holding gesture
  ['lr-152', 'lr-164'], // recalculating / remapped — both navigation-brain
  ['lr-147', 'lr-085'], // uncut / premium feature — both "your voice"
  ['lr-161', 'lr-033'], // outsourced / cloakroom — both "carries my stuff"
  ['lr-167', 'lr-025'], // consolidated / 1st call — both "first call"
  ['lr-145', 'lr-146'], // reinforced / rerouted — both scooty (one per receipt)
];

// First-load receipt (before any regenerate). Exactly STARTING_LINE_COUNT (4)
// ids — getStartingLines() returns these verbatim (no shuffle, no slice), so the
// count must match. Guaranteed whiplash: ≥1 funny + ≥1 tender, all distinct
// prices, no collision pair.
export const DEFAULT_STARTING_IDS: string[] = [
  'lr-061', // funny  — processing
  'lr-053', // flavor — guard duty (desi)
  'lr-081', // tender — bookmarked
  'lr-062', // funny  — trap card
];
export const DEFAULT_TOTAL_ID = 'lrt-001'; // lifer

// Pool composition (post-merge):
//   funny   49
//   tender  20
//   flavor  25
//   total   94 line items + 8 totals
