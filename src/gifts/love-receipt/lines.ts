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
  /** meta block under the header — "Cashier: …" and "Bill #…". */
  cashier: string;
  billNumber: string;
  lines: ReceiptLine[];
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  total: string;
  /** how the bill was "paid" — shown under TOTAL DUE. */
  paidVia: string;
  /** italic mock-legal disclaimer near the bottom. */
  finePrint: string;
  /** caption under the faux barcode. */
  scanLine: string;
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
  cashier: string;
  billNumber: string;
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  paidVia: string;
  finePrint: string;
  scanLine: string;
  footer: string;
}

/**
 * Per-language scaffolding. Templates still contain [Name]/[you]; resolve with
 * {@link buildScaffold} once the names are known.
 */
const SCAFFOLD: Record<ReceiptLanguage, ScaffoldDefaults> = {
  en: {
    storeName: "[Name]'s Heart Mart",
    subtitle: 'est. the day i met u',
    receiptLabel: 'Receipt',
    cashier: '[you]',
    billNumber: '4EVER-143',
    subtotal: { label: 'Subtotal', price: 'too much' },
    discount: {
      label: 'Loyalty Discount — day one se tu hi tu',
      price: '−100%',
    },
    tax: { label: 'delusion tax (200%)', price: 'generous' },
    paidVia: 'emotional damage',
    finePrint: 'all sales final. no refunds on feelings.',
    scanLine: 'scan = how down bad i am',
    footer: 'come again 💕 (tonight?)',
  },
  hinglish: {
    storeName: "[Name]'s Heart Mart",
    subtitle: 'est. jis din tu mila',
    receiptLabel: 'Receipt',
    cashier: '[you]',
    billNumber: '4EVER-143',
    subtotal: { label: 'Subtotal', price: 'bahut zyada' },
    discount: {
      label: 'Loyalty Discount — day one se tu hi tu',
      price: '−100%',
    },
    tax: { label: 'delulu tax (200%)', price: 'generous' },
    paidVia: 'emotional damage (dil se)',
    finePrint: 'all sales final. feelings pe no refund, sorry.',
    scanLine: 'scan karo = kitna down bad hoon',
    footer: 'phir aana 💕 (aaj raat?)',
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
    cashier: fill(base.cashier),
    billNumber: base.billNumber,
    subtotal: { ...base.subtotal },
    discount: { ...base.discount },
    tax: { ...base.tax },
    paidVia: base.paidVia,
    finePrint: base.finePrint,
    scanLine: base.scanLine,
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

// ── Receipt types (pick-a-type → generate) ─────────────────────────────

export type ReceiptTypeKey =
  | 'delulu'
  | 'sorry'
  | 'missing'
  | 'birthday'
  | 'roast'
  | 'anniversary';

export interface ReceiptType {
  key: ReceiptTypeKey;
  emoji: string;
  label: string;
  /** tone guidance handed to Gemini. */
  tone: string;
  /** default rubber-stamp text for this type. */
  stamp: string;
  /** small line under the store name. */
  subtitle: string;
  /** grand total for the no-AI fallback. */
  total: string;
  /** built-in lines used when Gemini is unavailable. */
  fallbackLines: SuggestionSeed[];
  /**
   * Optional curated content pool, per language, sampled at random for the
   * instant Generate/Regenerate flow. When absent for a language, callers fall
   * back to {@link ReceiptType.fallbackLines}. Only seeded types carry this.
   */
  pool?: Partial<Record<ReceiptLanguage, SuggestionSeed[]>>;
}

export const RECEIPT_TYPES: ReceiptType[] = [
  {
    key: 'delulu',
    emoji: '💌',
    label: 'Certified Delulu',
    tone: 'maximum delusional-but-adorable energy — convinced you two are cosmic soulmates, manifesting the wedding, completely unhinged in the cutest way',
    stamp: 'CERTIFIED DELULU',
    subtitle: 'Manifestation Dept · Aisle of Delusion · No. 143',
    total: 'us, forever (manifested) 🥹',
    fallbackLines: [
      { text: 'manifesting our wedding hashtag rn', price: '₹∞' },
      {
        text: 'we’re soulmates, science can’t change my mind',
        price: 'priceless',
      },
      { text: 'named our 3 future kids already', price: 'non-refundable' },
      { text: 'every love song is literally about us', price: 'anmol' },
      {
        text: 'destiny said you + me, I have receipts',
        price: '₹0 (worth it)',
      },
      { text: 'check my phone 40x hoping it’s you', price: 'invaluable' },
      { text: 'us in my head: a cinematic universe', price: 'priceless' },
    ],
    pool: {
      en: [
        {
          text: 'ur conspiracy theories somehow sound romantic at 2am',
          price: '₹7 member rate',
        },
        {
          text: 'the way you manifest us like unpaid intern energy',
          price: 'auto-renews 💀',
        },
        {
          text: 'calling every coincidence fate like a wattpad protagonist',
          price: '₹4,99,999 💀',
        },
        {
          text: 'ur fake wedding plans after one date fr',
          price: 'non-refundable',
        },
        {
          text: 'the way you stalk my spotify like FBI lite',
          price: 'trial expired',
        },
        {
          text: 'ur delusional confidence during zero-text-response eras',
          price: 'EMI: heartbreak',
        },
        {
          text: "telling ur friends we're endgame after eye contact",
          price: 'sold out fr',
        },
        {
          text: 'the way you romanticize bare minimum replies sm',
          price: '₹0 still buying',
        },
        {
          text: 'making fake scenarios before sleeping every night',
          price: 'billed in tears',
        },
        {
          text: 'ur imaginary future baby names kinda ate though',
          price: 'BOGO combo',
        },
        {
          text: 'thinking the universe ships us harder than twitter',
          price: 'see fine print',
        },
        {
          text: 'ur lil tarot phase predicting our wedding venue',
          price: '₹1 cr +gst',
        },
        {
          text: 'saving my selfies like treasured historical documents',
          price: 'out of stock 🥲',
        },
        {
          text: 'the way you overanalyze every emoji i send',
          price: 'processing fee',
        },
        {
          text: 'ur notes app paragraphs after one good conversation',
          price: 'sub paused 💀',
        },
        {
          text: 'believing every song lyric secretly about us',
          price: '₹88 + clown tax',
        },
        {
          text: 'the way you claim telepathy during dry texting',
          price: '*conditions apply',
        },
        {
          text: 'ur pinterest board titled future apartment together',
          price: 'lease extra',
        },
        {
          text: 'pretending my reposts are secret love confessions',
          price: 'no returns',
        },
        {
          text: 'ur dramatic sighs after seeing my following list',
          price: '₹2 and a dream',
        },
        {
          text: 'ur fake arguments prepared before i even reply',
          price: 'batteries extra',
        },
        {
          text: 'thinking one compliment equals lifelong commitment fr',
          price: '₹9,999 adjusted',
        },
        {
          text: 'ur delulu pep talks before opening my messages',
          price: 'cashback: vibes',
        },
        {
          text: 'calling us enemies-to-lovers after mild disagreement',
          price: 'trial version',
        },
        {
          text: 'the way you screenshot cute chats for archives',
          price: 'archived 4ever',
        },
        {
          text: 'ur obsession with reading into my typing pauses',
          price: '₹404 not found',
        },
        {
          text: 'ur fake vows during traffic jams together somehow',
          price: 'warranty voided',
        },
        {
          text: 'the way you assume my mom already likes you',
          price: '₹56 family pack',
        },
        {
          text: 'manifesting texts instead of actually texting first',
          price: 'network charges',
        },
        {
          text: 'ur confidence saying when we get married someday',
          price: '₹12,121 wedding',
        },
        {
          text: 'ur fake anniversary countdowns lowkey terrifying adorable',
          price: "can't cancel 💀",
        },
        {
          text: 'the way you gaslight urself into staying hopeful',
          price: 'paid in faith',
        },
        {
          text: 'ur lil jealous moments over fictional competition',
          price: 'restocking maybe',
        },
        {
          text: 'the way you rehearse confessions in shower concerts',
          price: 'taxes included 🥲',
        },
        {
          text: 'thinking our eye contact deserved background music instantly',
          price: 'audio extra',
        },
        {
          text: 'the way you defend my red flags publicly',
          price: '₹666 clown tax',
        },
        {
          text: 'ur delulu optimism after getting left on read',
          price: 'lifetime member',
        },
        {
          text: 'ur random future travel itineraries for us both',
          price: 'visa pending',
        },
        {
          text: "thinking we'd survive apocalypse because vibes match",
          price: '₹999 bundle',
        },
        {
          text: 'ur hopeless romantic delusions somehow still working',
          price: '₹∞ embarrassing',
        },
      ],
    },
  },
  {
    key: 'sorry',
    emoji: '🙏',
    label: 'Sorry Receipt',
    tone: 'sweetly apologetic — owning a small dumb mistake, grovelling cutely, promising snacks and forehead kisses',
    stamp: 'OFFICIALLY SORRY',
    subtitle: 'Apology Counter · Returns Accepted · No. 143',
    total: 'one big sorry + all my snacks',
    fallbackLines: [
      { text: 'sorry for being annoying (lovingly)', price: '₹0 (worth it)' },
      { text: 'I owe you a grand apology + snacks', price: 'non-refundable' },
      { text: 'forgive me, I’ll do the dishes forever', price: 'priceless' },
      { text: 'certified menace, but YOUR menace', price: 'anmol' },
      { text: 'best behaviour mode: now activated', price: '₹∞' },
      { text: 'coupon: unlimited forehead kisses', price: 'invaluable' },
      { text: 'me grovelling: now playing', price: 'priceless' },
    ],
    pool: {
      en: [
        {
          text: 'ate the last slice like a tiny villain sorry',
          price: 'owes 1 pizza 🍕',
        },
        {
          text: 'picked a dumb fight then missed you immediately',
          price: 'complaint filed',
        },
        {
          text: 'forgot the thing you literally reminded me about',
          price: 'memory upgrade',
        },
        {
          text: 'was being extra annoying for recreational purposes',
          price: 'goodwill credit',
        },
        {
          text: 'accidentally stole all the blanket real estate again',
          price: 'land returned',
        },
        {
          text: 'sent mixed signals instead of complete sentences fr',
          price: 'patch deployed',
        },
        {
          text: 'made fun of you then missed your face',
          price: 'pays in snacks',
        },
        {
          text: 'took forever to reply while staring at phone',
          price: 'late fee waived',
        },
        {
          text: 'acted dramatic over absolutely nothing my bad',
          price: 'theatre tax 💀',
        },
        {
          text: 'forgot ur coffee order like a fake fan',
          price: '₹4,99,999 sorry',
        },
        {
          text: 'was stubborn longer than necessary and kinda impressive',
          price: 'ego buyback',
        },
        {
          text: 'borrowed ur hoodie and entered witness protection',
          price: 'recovery pending',
        },
        {
          text: 'accidentally turned a discussion into olympic debating',
          price: 'medal returned',
        },
        {
          text: 'hogged all the cuddles without proper licensing',
          price: 'cuddle credits',
        },
        {
          text: 'made a joke during ur serious lil moment',
          price: 'tone update due',
        },
        {
          text: 'forgot to text back then overexplained everything',
          price: 'auto-renews 💀',
        },
        {
          text: 'was a certified menace before breakfast again',
          price: 'breakfast owed',
        },
        {
          text: 'ate ur fries under quality control regulations',
          price: 'snack refund',
        },
        {
          text: 'interrupted ur story with my own plot twist',
          price: 'will listen now',
        },
        {
          text: 'accidentally weaponized sarcasm during peaceful operations',
          price: 'ceasefire signed',
        },
        {
          text: 'was clingy then disappeared like a magician',
          price: 'tracking added',
        },
        {
          text: 'forgot our plan then remembered dramatically later',
          price: 'calendar fixed',
        },
        {
          text: 'sent the wrong emoji with catastrophic consequences',
          price: 'emoji fix fee',
        },
        {
          text: 'was a lil gremlin instead of communicating',
          price: 'sorry credit',
        },
        {
          text: 'kept saying one minute for twenty-seven minutes',
          price: 'time refund 💀',
        },
        {
          text: 'accidentally made ur day harder than necessary',
          price: 'free dish duty',
        },
        {
          text: "missed the hint so aggressively it's embarrassing",
          price: 'awareness DLC',
        },
        {
          text: 'talked over you then realized immediately oops',
          price: 'ears upgraded',
        },
        {
          text: 'forgot something important but remembered ur cute face',
          price: '₹7 loyalty rate',
        },
        {
          text: 'made a mountain from a pebble again',
          price: 'mountain refund',
        },
        {
          text: 'stressed you out with unnecessary detective work',
          price: 'case closed',
        },
        {
          text: 'borrowed ur charger indefinitely my sincerest apologies',
          price: 'EMI: forgiveness',
        },
        {
          text: 'responded with haha when effort was required',
          price: 'effort repaid',
        },
        {
          text: 'was emotionally buffering during a simple conversation',
          price: 'rebooted 💀',
        },
        {
          text: 'made everything about me for a minute',
          price: 'spotlight: urs',
        },
        { text: 'was late because time and i beef', price: 'late fee owed' },
        {
          text: 'accidentally annoyed my favorite human again',
          price: 'BOGO kisses',
        },
        {
          text: 'was a walking plot twist nobody requested',
          price: 'limited edition',
        },
        {
          text: "sorry for being ridiculous you're stuck with me",
          price: 'non-refundable',
        },
        {
          text: 'i owe you one grand apology and snacks',
          price: '₹∞ snack tab',
        },
      ],
    },
  },
  {
    key: 'missing',
    emoji: '🥹',
    label: 'Missing You Invoice',
    tone: 'soft aching long-distance longing — counting the hours, pillow doing a bad job, desperate for the next hug',
    stamp: 'MISS U • PAID IN FULL',
    subtitle: 'Long-Distance Dept · Hugs Pending · No. 143',
    total: 'the next hug, ASAP',
    fallbackLines: [
      { text: 'counting hours till I see you again', price: '₹∞' },
      { text: 'my pillow is doing your job badly', price: 'non-refundable' },
      { text: 'thinking of you in 4k, no skips', price: 'priceless' },
      { text: 'the distance is rude, I want a refund', price: 'anmol' },
      { text: 'saving the good stories just for you', price: 'invaluable' },
      { text: 'I miss your dumb laugh so much', price: '₹0 (worth it)' },
      { text: 'come back, my person quota is empty', price: 'priceless' },
    ],
    pool: {
      en: [
        {
          text: 'ur side of the bed filing abandonment reports again',
          price: 'occupancy fee',
        },
        {
          text: 'the pillow doing a terrible impression of you',
          price: 'quality mismatch',
        },
        {
          text: 'saving lil stories till ur next appearance fr',
          price: 'delivery delayed',
        },
        {
          text: 'my person quota emptying faster than expected',
          price: 'restock asap',
        },
        {
          text: 'ur hugs currently unavailable in my region',
          price: 'out of stock',
        },
        {
          text: 'counting days like a kid before holidays',
          price: 'calendar fee',
        },
        {
          text: 'the way every song suddenly sounds extra about you',
          price: 'streaming fee',
        },
        {
          text: 'ur absence increasing screen time dramatically',
          price: 'billed in yearning',
        },
        {
          text: "checking flight times like they're sports scores",
          price: 'now tracking 📍',
        },
        {
          text: 'the couch missing its favorite second occupant',
          price: 'seat reserved',
        },
        {
          text: 'the way i keep reaching for ur hand',
          price: 'connection lost',
        },
        {
          text: 'ur laugh unavailable due to geographic restrictions',
          price: 'premium only',
        },
        {
          text: 'the distance acting personally rude again',
          price: 'complaint filed',
        },
        {
          text: 'every sunset needing live commentary from you',
          price: 'broadcast down',
        },
        {
          text: 'ur face currently loading at unacceptable speeds',
          price: 'buffering ₹199',
        },
        { text: 'the way i open chats just to smile', price: 'auto-renews 💀' },
        {
          text: 'ur goodnight texts carrying entire economies lately',
          price: '₹4,99,999 💌',
        },
        {
          text: 'missing ur random interruptions during my day',
          price: 'service outage',
        },
        {
          text: 'the way time slows down after goodbye hugs',
          price: 'speed downgrade',
        },
        {
          text: 'ur presence currently trapped in transit',
          price: 'in transit 📦',
        },
        {
          text: 'my jokes waiting for their target audience',
          price: 'backordered',
        },
        {
          text: "the way i keep spotting things you'd love",
          price: 'saved for u',
        },
        {
          text: 'the room feeling suspiciously less cute lately',
          price: 'decor missing',
        },
        {
          text: 'waiting for ur return like limited sneaker drops',
          price: 'preorder open',
        },
        {
          text: 'ur forehead kisses currently under maintenance',
          price: 'under maintenance',
        },
        {
          text: 'the distance refusing same-day delivery options',
          price: 'shipping denied',
        },
        {
          text: 'my favorite notification arriving way too rarely',
          price: 'low frequency',
        },
        {
          text: 'the way weekends feel understaffed without you',
          price: 'vacancy open',
        },
        { text: 'the way i replay old voice notes sm', price: 'rewatch pass' },
        {
          text: 'ur hand-holding services temporarily suspended',
          price: 'EMI: patience',
        },
        {
          text: 'ur hugs stuck somewhere between here and soon',
          price: 'at customs 📦',
        },
        {
          text: 'the universe delaying my favorite delivery again',
          price: 'refund pls',
        },
        {
          text: 'ur seat in the car looking unemployed',
          price: 'position vacant',
        },
        {
          text: 'missing ur voice during boring errands fr',
          price: 'audio extra',
        },
        {
          text: 'ur comeback tour taking forever honestly',
          price: 'ticket delay',
        },
        {
          text: 'my heart refreshing arrival status every hour',
          price: 'live tracking',
        },
        {
          text: 'the way i miss being annoying together',
          price: 'BOGO clinginess',
        },
        {
          text: 'ur return date becoming my favorite holiday',
          price: '₹7 loyalty rate',
        },
        { text: 'the way i keep imagining reunion hugs', price: '₹1 cr +gst' },
        {
          text: 'the wait for you feels illegally long',
          price: '₹∞ express pls',
        },
      ],
    },
  },
  {
    key: 'birthday',
    emoji: '🎂',
    label: 'Birthday Bill',
    tone: 'celebratory hype — gassing them up on their birthday, another year of being unfairly cute, permission to be spoiled',
    stamp: 'HAPPY BIRTHDAY',
    subtitle: 'Birthday Dept · Spoil-You Special · No. 143',
    total: 'a whole year of being spoiled',
    fallbackLines: [
      { text: 'another year of you being unfairly cute', price: '₹∞' },
      { text: 'happy birthday to my fav notification', price: 'priceless' },
      { text: 'cake’s nice but you’re the real treat', price: 'anmol' },
      { text: 'permit: be extra spoiled today', price: 'non-refundable' },
      { text: 'world got luckier the day you spawned', price: 'invaluable' },
      { text: 'making a wish? it’s just more of you', price: '₹0 (worth it)' },
      { text: 'you + birthday = my two fav things', price: 'priceless' },
    ],
    pool: {
      en: [
        {
          text: 'another year of being unfairly cute congratulations fr',
          price: 'discount 100%',
        },
        {
          text: "the day you spawned became everyone's favorite update",
          price: 'release notes',
        },
        {
          text: "ur existence carrying today's party single-handedly",
          price: 'VIP guest 👑',
        },
        {
          text: "cake is cute but you're clearly the main treat",
          price: 'cake tax waived',
        },
        {
          text: 'ur smile aging like premium downloadable content',
          price: 'sub upgraded',
        },
        {
          text: 'the way you make birthdays look suspiciously easy',
          price: 'fees waived',
        },
        {
          text: 'another year hotter somehow explain that immediately',
          price: '₹4,99,999 🔥',
        },
        {
          text: 'ur birthday energy powering entire friend groups today',
          price: 'grid online',
        },
        {
          text: 'the world got luckier when you logged in',
          price: 'access granted',
        },
        {
          text: 'ur laugh deserves candles of its own honestly',
          price: 'candles extra',
        },
        {
          text: "today's forecast mostly sunshine and ur face",
          price: 'weather: sunny',
        },
        {
          text: 'ur birthday outfit already winning every competition',
          price: 'trophy extra',
        },
        {
          text: 'another lap around the sun absolutely crushed',
          price: 'achievement 🏆',
        },
        {
          text: 'the way everyone shows up for you says plenty',
          price: 'attendance free',
        },
        {
          text: 'ur cuteness levels violating several birthday regulations',
          price: 'fine waived',
        },
        {
          text: "today you're legally required to accept compliments",
          price: 'mandatory today',
        },
        {
          text: 'the universe cooked when it made you fr',
          price: "chef's special",
        },
        {
          text: "another year of being everyone's fave notification",
          price: 'fast delivery',
        },
        {
          text: 'ur birthday deserves national holiday consideration honestly',
          price: 'petition fee',
        },
        {
          text: 'the way you glow today feels pay-to-win',
          price: 'premium skin',
        },
        {
          text: 'celebrating ur existence remains my favorite annual event',
          price: 'auto-renews 💀',
        },
        {
          text: 'ur face card still refusing to decline ever',
          price: 'lifetime valid',
        },
        {
          text: 'the way you make getting older look fun',
          price: 'aging refund',
        },
        {
          text: 'another year of stealing hearts without proper permits',
          price: 'permit pending',
        },
        {
          text: "today's spotlight rented exclusively for you",
          price: 'on the house',
        },
        {
          text: 'the way you exist deserves gift wrapping',
          price: 'gift-wrapped free',
        },
        {
          text: 'ur charm inventory somehow restocked again this year',
          price: 'limited edition',
        },
        {
          text: 'another year of being ridiculously easy to celebrate',
          price: 'BOGO compliments',
        },
        {
          text: 'the way you brighten rooms remains undefeated',
          price: 'lights on us',
        },
        {
          text: 'ur birthday cake competing for second place today',
          price: 'runner-up: cake',
        },
        {
          text: "today's mission spoil you rotten respectfully",
          price: 'EMI on gifts',
        },
        {
          text: "ur existence remains everyone's favorite plot twist",
          price: 'expansion pack',
        },
        {
          text: 'ur birthday crown fits suspiciously well',
          price: 'tax exempt 👑',
        },
        {
          text: 'ur laugh still top-charting after all these years',
          price: 'royalties due',
        },
        {
          text: "today's happiness package addressed directly to you",
          price: 'sign here ✍️',
        },
        {
          text: 'ur favorite people gathering like limited collectibles',
          price: "collector's edition",
        },
        {
          text: 'the way you age backwards needs investigation',
          price: '₹1 cr +gst',
        },
        {
          text: 'another year of unforgettable moments with you',
          price: '₹7 loyalty rate',
        },
        {
          text: 'the way you make life sweeter than cake',
          price: 'non-refundable',
        },
        { text: 'happy birthday to my fave human ever', price: '₹∞ party 🎉' },
      ],
    },
  },
  {
    key: 'roast',
    emoji: '🔥',
    label: 'Lovingly Roasted',
    tone: 'playful teasing roast — poke fun at their cute flaws and silly habits, but make it obvious you adore them',
    stamp: 'LOVINGLY ROASTED',
    subtitle: 'Roast Counter · Served With Love · No. 143',
    total: 'still priceless, even with the chaos',
    fallbackLines: [
      {
        text: 'snores like a tiny lawnmower, adorable',
        price: '₹0 (worth it)',
      },
      { text: 'steals fries then claims “I didn’t”', price: 'non-refundable' },
      {
        text: 'terrible taste in memes, great taste in me',
        price: 'priceless',
      },
      { text: 'cannot parallel park to save a life', price: 'anmol' },
      { text: 'argues with the GPS and loses', price: '₹∞' },
      { text: 'still the cutest disaster I know', price: 'invaluable' },
      { text: 'roasting you bc loving you, same thing', price: 'priceless' },
    ],
    pool: {
      en: [
        {
          text: 'ur lil snores sound like buffering raccoons every night',
          price: 'noise complaint',
        },
        {
          text: 'the way you lose arguments to the GPS fr',
          price: 'rerouting ₹299',
        },
        {
          text: 'ur blanket stealing skills deserve professional licensing honestly',
          price: 'premium theft',
        },
        {
          text: 'the way you send terrible memes so confidently',
          price: 'taste extra',
        },
        {
          text: 'ur five-minute naps becoming accidental world tours',
          price: 'extended stay',
        },
        {
          text: 'the way you misplace ur phone while holding it',
          price: 'lost & found',
        },
        {
          text: 'ur dramatic goodbye waves after thirty-second hangouts',
          price: '₹7 clingy rate',
        },
        {
          text: 'the way you read menus like legal documents',
          price: 'processing delay',
        },
        {
          text: 'the way you start stories from chapter fourteen',
          price: 'context extra',
        },
        {
          text: 'ur alarm clock battles lasting three business days',
          price: 'auto-renews 💀',
        },
        {
          text: 'the way you laugh before finishing the joke',
          price: 'spoiler fee',
        },
        {
          text: 'the way you forget why you entered rooms',
          price: 'memory not found',
        },
        {
          text: 'ur obsession with checking locked doors twice',
          price: 'security sub 🔒',
        },
        {
          text: 'the way you aggressively lose at easy games',
          price: 'skill DLC pending',
        },
        {
          text: 'the way you say one episode then six',
          price: 'trial expired',
        },
        {
          text: 'ur parking style keeping geometry professors employed',
          price: 'valet quit',
        },
        {
          text: 'the way you pack seventeen outfits for weekends',
          price: 'baggage fee x2',
        },
        {
          text: 'ur random dance moves during grocery store trips',
          price: 'performance tax',
        },
        { text: 'the way you make tea then forget it', price: 'reheating fee' },
        {
          text: 'the way you apologize to furniture after bumping it',
          price: 'kindness bundle',
        },
        {
          text: 'ur talent for opening tabs and disappearing',
          price: '87 tabs open 💀',
        },
        {
          text: 'the way you narrate pet thoughts so seriously',
          price: 'translation extra',
        },
        {
          text: 'ur lil panic when waiter asks for order',
          price: 'decision DLC 💀',
        },
        {
          text: 'the way you miss calls then call instantly',
          price: 'reverse uno 🃏',
        },
        {
          text: 'ur dramatic blanket burrito transformation every winter',
          price: 'limited edition',
        },
        {
          text: 'ur confidence explaining directions completely wrong',
          price: '₹4,99,999 lost',
        },
        {
          text: 'ur tendency to water plants then overthink it',
          price: 'plant therapy',
        },
        {
          text: 'the way you send voice notes for one sentence',
          price: 'audio extra',
        },
        {
          text: 'the way you check fridge hoping new food spawned',
          price: 'restock fantasy',
        },
        {
          text: 'ur dramatic reactions to mildly spicy chips',
          price: 'fire insurance',
        },
        {
          text: 'the way you wave at dogs before humans',
          price: 'dogs first 🐶',
        },
        {
          text: 'ur chaotic charging habits stressing every cable',
          price: 'warranty voided',
        },
        {
          text: 'ur obsession with collecting emotional support water bottles',
          price: 'BOGO hydration',
        },
        {
          text: 'ur lil side quests before every main task',
          price: 'EMI: productivity',
        },
        {
          text: 'the way you aggressively befriend random animals',
          price: 'adoption pending',
        },
        {
          text: 'the way you guess lyrics with full confidence',
          price: 'accuracy: 0%',
        },
        {
          text: 'ur cute refusal to follow recipe instructions ever',
          price: 'recipe ignored',
        },
        {
          text: 'ur tiny gremlin energy before morning coffee',
          price: '₹1 cr +gst',
        },
        {
          text: 'the way you make every inconvenience a sitcom',
          price: 'no returns',
        },
        {
          text: 'ur lovable chaos somehow improving every single day',
          price: '₹∞ worth it',
        },
      ],
    },
  },
  {
    key: 'anniversary',
    emoji: '💍',
    label: 'Anniversary Receipt',
    tone: 'sappy milestone celebration — time spent together, still choosing them, still down bad after all this time',
    stamp: 'STILL OBSESSED',
    subtitle: 'Anniversary Dept · Renewed Daily · No. 143',
    total: 'more than I could ever repay',
    fallbackLines: [
      { text: 'still picking you, every single day', price: '₹∞' },
      {
        text: 'years in and still down catastrophically bad',
        price: 'priceless',
      },
      { text: 'our inside jokes: a growing franchise', price: 'anmol' },
      { text: 'best decision ever: swiping on you', price: 'non-refundable' },
      { text: 'I’d redo it all, minus zero moments', price: 'invaluable' },
      { text: 'you + me = undefeated record', price: '₹0 (worth it)' },
      { text: 'here’s to many more receipts together', price: 'priceless' },
    ],
    pool: {
      en: [
        {
          text: 'still choosing you daily despite knowing all updates',
          price: 'renewed 1 year',
        },
        {
          text: 'our inside jokes became a whole cinematic universe',
          price: 'franchise secured',
        },
        {
          text: 'best swipe decision in recorded human history fr',
          price: 'founding member',
        },
        {
          text: 'the way you still make me blush somehow',
          price: 'undefeated',
        },
        {
          text: 'another year of being down catastrophically bad',
          price: 'auto-renews 💀',
        },
        {
          text: 'ur face still my favorite daily notification',
          price: 'priority access',
        },
        {
          text: 'the way forever started feeling suspiciously reasonable',
          price: 'warranty ∞',
        },
        {
          text: 'our love surviving every weird phase successfully',
          price: 'stress-tested ✅',
        },
        {
          text: 'still obsessed after all this time embarrassing honestly',
          price: '₹4,99,999 💀',
        },
        {
          text: 'ur laugh remains my longest running favorite series',
          price: 'season pass',
        },
        {
          text: 'the way home somehow became a person',
          price: 'address updated',
        },
        {
          text: 'another year of stealing my fries legally',
          price: 'joint account',
        },
        {
          text: 'ur weirdness matching mine remains elite matchmaking',
          price: 'algorithm broke',
        },
        {
          text: 'still flirting with you like day one',
          price: 'intro offer 4ever',
        },
        {
          text: 'the way we turned ordinary days iconic',
          price: 'premium memories',
        },
        {
          text: 'ur hand still fitting mine suspiciously perfectly',
          price: 'custom sizing',
        },
        { text: 'the way you became my favorite habit', price: 'billed in 🦋' },
        {
          text: 'our arguments somehow ending with snacks still',
          price: 'snack bonus',
        },
        {
          text: 'ur existence remains my favorite long-term investment',
          price: 'returns 📈',
        },
        {
          text: 'the way forever keeps looking good on us',
          price: 'lifetime member',
        },
        {
          text: 'another anniversary of accidentally finding my person',
          price: 'search refunded',
        },
        {
          text: 'our comfort level now legally concerning',
          price: 'space sold off',
        },
        { text: 'the way you know all my settings', price: 'admin access' },
        {
          text: 'another year of choosing us over everything',
          price: '₹7 loyalty rate',
        },
        {
          text: 'ur hugs remain my preferred operating system',
          price: 'support extended',
        },
        {
          text: 'still crushing on you after all receipts',
          price: 'no expiry date',
        },
        {
          text: 'our relationship patch notes keep getting better',
          price: 'free upgrades',
        },
        { text: 'the way you tolerate my nonsense daily', price: 'hazard pay' },
        {
          text: 'another year of sharing one braincell lovingly',
          price: 'shared resource',
        },
        {
          text: 'ur smile still causing unreasonable productivity losses',
          price: 'disruption fee',
        },
        {
          text: 'our love language mostly snacks and memes',
          price: 'BOGO support',
        },
        {
          text: 'ur favorite seat remaining right beside me',
          price: 'reserved 4ever',
        },
        {
          text: 'still finding new reasons to adore you',
          price: 'always restocked',
        },
        {
          text: 'our anniversary proving good decisions do exist',
          price: 'evidence: us',
        },
        {
          text: 'the way we built something worth staying for',
          price: 'non-refundable',
        },
        {
          text: 'still obsessed with ur lil everyday habits',
          price: '₹0 worth it',
        },
        {
          text: 'the way you feel like luck every day',
          price: 'limited edition',
        },
        {
          text: "another anniversary and i'm somehow even softer",
          price: 'EMI: feelings',
        },
        {
          text: 'ur name still my favorite thing to hear',
          price: '₹1 cr +gst',
        },
        {
          text: "stuck with me forever hope that's okay",
          price: 'no cancelling',
        },
      ],
    },
  },
];

const typeIndex = new Map(RECEIPT_TYPES.map((t) => [t.key, t]));
export function getReceiptType(key: ReceiptTypeKey): ReceiptType {
  return typeIndex.get(key) ?? RECEIPT_TYPES[0];
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

// ── generation contract (shared by the Gemini action + fallback) ───────
export interface GeneratedReceipt {
  storeName?: string;
  subtitle: string;
  cashier?: string;
  billNumber?: string;
  lines: SuggestionSeed[];
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  total: string;
  paidVia?: string;
  finePrint?: string;
  scanLine?: string;
  footer: string;
  memeStamp: string | null;
}

export interface GenerateInput {
  recipientName: string;
  senderName: string;
  relationship: string;
  language: ReceiptLanguage;
  receiptType: ReceiptTypeKey;
  answers: Record<string, string>;
  /** "extra" cranks the cringe for the 🌶️ make-it-cringier button. */
  spice?: 'normal' | 'extra';
}

/**
 * Sample `count` DISTINCT lines (each tagged with a stable id) for a type, at
 * random. Reads `type.pool[language]` when present, else the type's
 * language-agnostic `fallbackLines` — so it never breaks for an unseeded type.
 *
 * Pass the previous batch's ids as `excludeIds` to get a fresh set on Regenerate.
 * If too few unseen lines remain to fill `count`, it resets (ignores excludeIds)
 * rather than returning an empty/short set. Ids are assigned here (index-based,
 * the pool is static) so {@link SuggestionSeed} stays a clean {text, price}.
 */
export function sampleFromPool(
  typeKey: ReceiptTypeKey,
  language: ReceiptLanguage,
  count: number,
  excludeIds?: ReadonlySet<string>,
): ReceiptLine[] {
  const type = getReceiptType(typeKey);
  const source = type.pool?.[language] ?? type.fallbackLines;
  const all: ReceiptLine[] = source.map((seed, i) => ({
    id: `${typeKey}-${language}-${i}`,
    text: seed.text,
    price: seed.price,
  }));

  let candidates =
    excludeIds && excludeIds.size > 0
      ? all.filter((c) => !excludeIds.has(c.id))
      : all;
  // Not enough fresh lines left to fill the batch → reset so we never go empty.
  if (candidates.length < count) candidates = all;

  // Fisher–Yates shuffle a copy, then take `count`.
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/**
 * No-AI fallback — a complete receipt for the chosen type. Pooled types (e.g.
 * delulu) draw a fresh random set via {@link sampleFromPool}; unpooled types
 * keep the original deterministic blend. Always paired with the scaffold's funny
 * summary so the receipt is complete even when Gemini is unavailable.
 */
export function buildFallbackReceipt(input: GenerateInput): GeneratedReceipt {
  const type = getReceiptType(input.receiptType);
  const scaffold = buildScaffold(
    input.language,
    input.recipientName,
    input.senderName,
  );

  let lines: SuggestionSeed[];
  if (type.pool?.[input.language]) {
    // Pooled type: random draw for variety. Drop the id — the payload's lines
    // are plain {text, price}; the sender assigns its own ids when applying.
    lines = sampleFromPool(input.receiptType, input.language, 7).map((l) => ({
      text: l.text,
      price: l.price,
    }));
  } else {
    // Unpooled type: original deterministic blend (behavior unchanged).
    const flavour = SUGGESTIONS[input.language].slice(0, 2);
    const merged: SuggestionSeed[] = [...type.fallbackLines];
    for (const f of flavour) {
      const text = applyTemplate(f.text, input.recipientName, input.senderName);
      if (!merged.some((m) => m.text === text)) merged.push({ ...f, text });
    }
    lines = merged.slice(0, 9);
  }

  return {
    storeName: scaffold.storeName,
    subtitle: type.subtitle,
    cashier: scaffold.cashier,
    billNumber: scaffold.billNumber,
    lines,
    subtotal: { ...scaffold.subtotal },
    discount: { ...scaffold.discount },
    tax: { ...scaffold.tax },
    total: type.total,
    paidVia: scaffold.paidVia,
    finePrint: scaffold.finePrint,
    scanLine: scaffold.scanLine,
    footer: scaffold.footer,
    memeStamp: type.stamp,
  };
}
