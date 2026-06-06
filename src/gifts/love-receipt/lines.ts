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
          price: '₹7 (delulu member rate)',
        },
        {
          text: 'the way you manifest us like unpaid intern energy',
          price: 'auto-renews monthly 💀',
        },
        {
          text: 'calling every coincidence fate like a wattpad protagonist',
          price: '₹4,99,999 + emotional damage',
        },
        {
          text: 'ur fake wedding plans after one date fr',
          price: 'non-refundable btw',
        },
        {
          text: 'the way you stalk my spotify like FBI lite',
          price: 'free trial expired',
        },
        {
          text: 'ur delusional confidence during zero-text-response eras',
          price: 'EMI available for heartbreak',
        },
        {
          text: "telling ur friends we're endgame after eye contact",
          price: 'sold out fr',
        },
        {
          text: 'the way you romanticize bare minimum replies sm',
          price: '₹0 (still buying)',
        },
        {
          text: 'making fake scenarios before sleeping every night',
          price: 'billed annually in tears',
        },
        {
          text: 'ur imaginary future baby names kinda ate though',
          price: 'BOGO heartbreak combo',
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
          price: 'out of stock emotionally',
        },
        {
          text: 'the way you overanalyze every emoji i send',
          price: 'processing fee applies',
        },
        {
          text: 'ur notes app paragraphs after one good conversation',
          price: 'subscription paused temporarily',
        },
        {
          text: 'believing every song lyric secretly about us',
          price: '₹88 plus clown tax',
        },
        {
          text: 'the way you claim telepathy during dry texting',
          price: 'conditions apply babe',
        },
        {
          text: 'ur pinterest board titled future apartment together',
          price: 'lease not included',
        },
        {
          text: 'pretending my reposts are secret love confessions',
          price: 'no returns accepted',
        },
        {
          text: 'ur dramatic sighs after seeing my following list',
          price: '₹2 and a dream',
        },
        {
          text: 'ur fake arguments prepared before i even reply',
          price: 'battery not included',
        },
        {
          text: 'thinking one compliment equals lifelong commitment fr',
          price: '₹9,999 emotionally adjusted',
        },
        {
          text: 'ur delulu pep talks before opening my messages',
          price: 'cashback in serotonin',
        },
        {
          text: 'calling us enemies-to-lovers after mild disagreement',
          price: 'trial version only',
        },
        {
          text: 'the way you screenshot cute chats for archives',
          price: 'archived permanently',
        },
        {
          text: 'ur obsession with reading into my typing pauses',
          price: '₹404 reality not found',
        },
        {
          text: 'ur fake vows during traffic jams together somehow',
          price: 'warranty voided',
        },
        {
          text: 'the way you assume my mom already likes you',
          price: '₹56 plus family pack',
        },
        {
          text: 'manifesting texts instead of actually texting first',
          price: 'network charges apply',
        },
        {
          text: 'ur confidence saying when we get married someday',
          price: '₹12,121 wedding surcharge',
        },
        {
          text: 'ur fake anniversary countdowns lowkey terrifying adorable',
          price: 'subscription cannot cancel',
        },
        {
          text: 'the way you gaslight urself into staying hopeful',
          price: '₹73 and blind faith',
        },
        {
          text: 'ur lil jealous moments over fictional competition',
          price: 'restocking soon maybe',
        },
        {
          text: 'the way you rehearse confessions in shower concerts',
          price: 'taxes emotionally included',
        },
        {
          text: 'thinking our eye contact deserved background music instantly',
          price: 'audio sold separately',
        },
        {
          text: 'the way you defend my red flags publicly',
          price: '₹666 clown premium',
        },
        {
          text: 'ur delulu optimism after getting left on read',
          price: 'lifetime membership activated',
        },
        {
          text: 'ur random future travel itineraries for us both',
          price: 'visa fees pending',
        },
        {
          text: "thinking we'd survive apocalypse because vibes match",
          price: '₹999 apocalypse bundle',
        },
        {
          text: 'ur hopeless romantic delusions somehow still working',
          price: '₹∞ but make it embarrassing',
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
          price: 'full pizza restitution pending',
        },
        {
          text: 'picked a dumb fight then missed you immediately',
          price: 'complaint acknowledged',
        },
        {
          text: 'forgot the thing you literally reminded me about',
          price: 'memory upgrade fee paid',
        },
        {
          text: 'was being extra annoying for recreational purposes',
          price: 'goodwill credit applied',
        },
        {
          text: 'accidentally stole all the blanket real estate again',
          price: 'territory returned promptly',
        },
        {
          text: 'sent mixed signals instead of complete sentences fr',
          price: 'communication patch deployed',
        },
        {
          text: 'made fun of you then missed your face',
          price: 'reparations: unlimited snacks',
        },
        {
          text: 'took forever to reply while staring at phone',
          price: 'late fee waived',
        },
        {
          text: 'acted dramatic over absolutely nothing my bad',
          price: 'theater tax refunded',
        },
        {
          text: 'forgot ur coffee order like a fake fan',
          price: '₹4,99,999 apology surcharge',
        },
        {
          text: 'was stubborn longer than necessary and kinda impressive',
          price: 'ego buyback program',
        },
        {
          text: 'borrowed ur hoodie and entered witness protection',
          price: 'item recovery in progress',
        },
        {
          text: 'accidentally turned a discussion into olympic debating',
          price: 'gold medal surrendered',
        },
        {
          text: 'hogged all the cuddles without proper licensing',
          price: 'cuddle credits issued',
        },
        {
          text: 'made a joke during ur serious lil moment',
          price: 'tone update available',
        },
        {
          text: 'forgot to text back then overexplained everything',
          price: 'auto-renews 💀',
        },
        {
          text: 'was a certified menace before breakfast again',
          price: 'breakfast compensation included',
        },
        {
          text: 'ate ur fries under quality control regulations',
          price: 'snack refund approved',
        },
        {
          text: 'interrupted ur story with my own plot twist',
          price: 'listener subscription restored',
        },
        {
          text: 'accidentally weaponized sarcasm during peaceful operations',
          price: 'ceasefire agreement signed',
        },
        {
          text: 'was clingy then disappeared like a magician',
          price: 'tracking number provided',
        },
        {
          text: 'forgot our plan then remembered dramatically later',
          price: 'calendar patch installed',
        },
        {
          text: 'sent the wrong emoji with catastrophic consequences',
          price: 'emoji correction fee',
        },
        {
          text: 'was a lil gremlin instead of communicating',
          price: 'customer satisfaction credit',
        },
        {
          text: 'kept saying one minute for twenty-seven minutes',
          price: 'time refund processing',
        },
        {
          text: 'accidentally made ur day harder than necessary',
          price: 'free dish duty included',
        },
        {
          text: "missed the hint so aggressively it's embarrassing",
          price: 'awareness DLC purchased',
        },
        {
          text: 'talked over you then realized immediately oops',
          price: 'priority listening upgrade',
        },
        {
          text: 'forgot something important but remembered ur cute face',
          price: '₹7 loyalty rate',
        },
        {
          text: 'made a mountain from a pebble again',
          price: 'terrain restoration fee',
        },
        {
          text: 'stressed you out with unnecessary detective work',
          price: 'investigation budget revoked',
        },
        {
          text: 'borrowed ur charger indefinitely my sincerest apologies',
          price: 'EMI available on forgiveness',
        },
        {
          text: 'responded with haha when effort was required',
          price: 'effort balance repaid',
        },
        {
          text: 'was emotionally buffering during a simple conversation',
          price: 'system reboot completed',
        },
        {
          text: 'made everything about me for a minute',
          price: 'spotlight returned immediately',
        },
        {
          text: 'was late because time and i beef',
          price: 'arrival compensation pending',
        },
        {
          text: 'accidentally annoyed my favorite human again',
          price: 'BOGO forehead kisses',
        },
        {
          text: 'was a walking plot twist nobody requested',
          price: 'limited edition apology bundle',
        },
        {
          text: "sorry for being ridiculous you're stuck with me",
          price: 'non-refundable attachment fee',
        },
        {
          text: 'i owe you one grand apology and snacks',
          price: '₹∞ snack tab open',
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
          price: 'occupancy fee pending',
        },
        {
          text: 'the pillow doing a terrible impression of you',
          price: 'quality mismatch surcharge',
        },
        {
          text: 'saving lil stories till ur next appearance fr',
          price: 'delivery delayed indefinitely',
        },
        {
          text: 'my person quota emptying faster than expected',
          price: 'restock urgently requested',
        },
        {
          text: 'ur hugs currently unavailable in my region',
          price: 'out of stock till sunday',
        },
        {
          text: 'counting days like a kid before holidays',
          price: 'calendar refresh fee',
        },
        {
          text: 'the way every song suddenly sounds extra about you',
          price: 'streaming charges apply',
        },
        {
          text: 'ur absence increasing screen time dramatically',
          price: 'billed monthly in yearning',
        },
        {
          text: "checking flight times like they're sports scores",
          price: 'tracking subscription active',
        },
        {
          text: 'the couch missing its favorite second occupant',
          price: 'seat reservation fee',
        },
        {
          text: 'the way i keep reaching for ur hand',
          price: 'connection timeout error',
        },
        {
          text: 'ur laugh unavailable due to geographic restrictions',
          price: 'premium access required',
        },
        {
          text: 'the distance acting personally rude again',
          price: 'formal complaint submitted',
        },
        {
          text: 'every sunset needing live commentary from you',
          price: 'broadcast unavailable',
        },
        {
          text: 'ur face currently loading at unacceptable speeds',
          price: 'buffering fee ₹199',
        },
        { text: 'the way i open chats just to smile', price: 'auto-renews 💀' },
        {
          text: 'ur goodnight texts carrying entire economies lately',
          price: '₹4,99,999 emotional value',
        },
        {
          text: 'missing ur random interruptions during my day',
          price: 'service outage ongoing',
        },
        {
          text: 'the way time slows down after goodbye hugs',
          price: 'speed upgrade unavailable',
        },
        {
          text: 'ur presence currently trapped in transit',
          price: 'shipping label created',
        },
        {
          text: 'my jokes waiting for their target audience',
          price: 'audience backordered',
        },
        {
          text: "the way i keep spotting things you'd love",
          price: 'saved for pickup',
        },
        {
          text: 'the room feeling suspiciously less cute lately',
          price: 'decor package missing',
        },
        {
          text: 'waiting for ur return like limited sneaker drops',
          price: 'preorder open now',
        },
        {
          text: 'ur forehead kisses currently under maintenance',
          price: 'technician en route',
        },
        {
          text: 'the distance refusing same-day delivery options',
          price: 'express shipping denied',
        },
        {
          text: 'my favorite notification arriving way too rarely',
          price: 'frequency upgrade needed',
        },
        {
          text: 'the way weekends feel understaffed without you',
          price: 'vacancy charges apply',
        },
        {
          text: 'the way i replay old voice notes sm',
          price: 'rewatch pass purchased',
        },
        {
          text: 'ur hand-holding services temporarily suspended',
          price: 'EMI available on patience',
        },
        {
          text: 'ur hugs stuck somewhere between here and soon',
          price: 'customs clearance pending',
        },
        {
          text: 'the universe delaying my favorite delivery again',
          price: 'refund requested from management',
        },
        {
          text: 'ur seat in the car looking unemployed',
          price: 'position vacant',
        },
        {
          text: 'missing ur voice during boring errands fr',
          price: 'audio pack sold separately',
        },
        {
          text: 'ur comeback tour taking forever honestly',
          price: 'ticket processing delay',
        },
        {
          text: 'my heart refreshing arrival status every hour',
          price: 'live tracking enabled',
        },
        {
          text: 'the way i miss being annoying together',
          price: 'BOGO clinginess special',
        },
        {
          text: 'ur return date becoming my favorite holiday',
          price: '₹7 loyalty rate',
        },
        { text: 'the way i keep imagining reunion hugs', price: '₹1 cr +gst' },
        {
          text: 'the wait for you feels illegally long',
          price: '₹∞ express delivery requested',
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
          price: 'birthday discount 100%',
        },
        {
          text: "the day you spawned became everyone's favorite update",
          price: 'release notes included',
        },
        {
          text: "ur existence carrying today's party single-handedly",
          price: 'VIP guest of honor',
        },
        {
          text: "cake is cute but you're clearly the main treat",
          price: 'cake tax waived',
        },
        {
          text: 'ur smile aging like premium downloadable content',
          price: 'subscription upgraded',
        },
        {
          text: 'the way you make birthdays look suspiciously easy',
          price: 'professional fees waived',
        },
        {
          text: 'another year hotter somehow explain that immediately',
          price: '₹4,99,999 mystery surcharge',
        },
        {
          text: 'ur birthday energy powering entire friend groups today',
          price: 'grid connection active',
        },
        {
          text: 'the world got luckier when you logged in',
          price: 'server access granted',
        },
        {
          text: 'ur laugh deserves candles of its own honestly',
          price: 'candles not included',
        },
        {
          text: "today's forecast mostly sunshine and ur face",
          price: 'weather sponsorship secured',
        },
        {
          text: 'ur birthday outfit already winning every competition',
          price: 'trophy shipped separately',
        },
        {
          text: 'another lap around the sun absolutely crushed',
          price: 'achievement unlocked',
        },
        {
          text: 'the way everyone shows up for you says plenty',
          price: 'attendance fees covered',
        },
        {
          text: 'ur cuteness levels violating several birthday regulations',
          price: 'fine dismissed today',
        },
        {
          text: "today you're legally required to accept compliments",
          price: 'compliance mandatory',
        },
        {
          text: 'the universe cooked when it made you fr',
          price: "chef's special today",
        },
        {
          text: "another year of being everyone's fave notification",
          price: 'priority delivery enabled',
        },
        {
          text: 'ur birthday deserves national holiday consideration honestly',
          price: 'petition filing fee',
        },
        {
          text: 'the way you glow today feels pay-to-win',
          price: 'premium skin equipped',
        },
        {
          text: 'celebrating ur existence remains my favorite annual event',
          price: 'auto-renews 💀',
        },
        {
          text: 'ur face card still refusing to decline ever',
          price: 'lifetime validity granted',
        },
        {
          text: 'the way you make getting older look fun',
          price: 'aging fee refunded',
        },
        {
          text: 'another year of stealing hearts without proper permits',
          price: 'licensing review pending',
        },
        {
          text: "today's spotlight rented exclusively for you",
          price: 'on the house today',
        },
        {
          text: 'the way you exist deserves gift wrapping',
          price: 'gift-wrapped free',
        },
        {
          text: 'ur charm inventory somehow restocked again this year',
          price: 'limited edition drop',
        },
        {
          text: 'another year of being ridiculously easy to celebrate',
          price: 'BOGO compliments special',
        },
        {
          text: 'the way you brighten rooms remains undefeated',
          price: 'electricity bill waived',
        },
        {
          text: 'ur birthday cake competing for second place today',
          price: 'runner-up ribbon awarded',
        },
        {
          text: "today's mission spoil you rotten respectfully",
          price: 'EMI available on gifts',
        },
        {
          text: "ur existence remains everyone's favorite plot twist",
          price: 'story expansion pack',
        },
        {
          text: 'ur birthday crown fits suspiciously well',
          price: 'royalty tax exempt',
        },
        {
          text: 'ur laugh still top-charting after all these years',
          price: 'streaming royalties due',
        },
        {
          text: "today's happiness package addressed directly to you",
          price: 'signature required',
        },
        {
          text: 'ur favorite people gathering like limited collectibles',
          price: "collector's edition release",
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
          price: 'non-refundable joy charge',
        },
        {
          text: 'happy birthday to my fave human ever',
          price: '₹∞ celebration package',
        },
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
          price: 'noise complaint pending',
        },
        {
          text: 'the way you lose arguments to the GPS fr',
          price: 'rerouting fee ₹299',
        },
        {
          text: 'ur blanket stealing skills deserve professional licensing honestly',
          price: 'premium theft surcharge',
        },
        {
          text: 'the way you send terrible memes so confidently',
          price: 'taste not included',
        },
        {
          text: 'ur five-minute naps becoming accidental world tours',
          price: 'extended stay charges',
        },
        {
          text: 'the way you misplace ur phone while holding it',
          price: 'lost and found fee',
        },
        {
          text: 'ur dramatic goodbye waves after thirty-second hangouts',
          price: '₹7 clingy rate',
        },
        {
          text: 'the way you read menus like legal documents',
          price: 'processing delay applies',
        },
        {
          text: 'the way you start stories from chapter fourteen',
          price: 'context sold separately',
        },
        {
          text: 'ur alarm clock battles lasting three business days',
          price: 'auto-renews daily 💀',
        },
        {
          text: 'the way you laugh before finishing the joke',
          price: 'spoiler fee included',
        },
        {
          text: 'the way you forget why you entered rooms',
          price: 'memory pack unavailable',
        },
        {
          text: 'ur obsession with checking locked doors twice',
          price: 'security subscription active',
        },
        {
          text: 'the way you aggressively lose at easy games',
          price: 'skill DLC pending',
        },
        {
          text: 'the way you say one episode then six',
          price: 'free trial expired',
        },
        {
          text: 'ur parking style keeping geometry professors employed',
          price: 'valet refused service',
        },
        {
          text: 'the way you pack seventeen outfits for weekends',
          price: 'baggage fee doubled',
        },
        {
          text: 'ur random dance moves during grocery store trips',
          price: 'public performance tax',
        },
        {
          text: 'the way you make tea then forget it',
          price: 'reheating fee recurring',
        },
        {
          text: 'the way you apologize to furniture after bumping it',
          price: 'kindness bundle included',
        },
        {
          text: 'ur talent for opening tabs and disappearing',
          price: '87 tabs maintenance fee',
        },
        {
          text: 'the way you narrate pet thoughts so seriously',
          price: 'translation pack extra',
        },
        {
          text: 'ur lil panic when waiter asks for order',
          price: 'decision-making DLC unavailable',
        },
        {
          text: 'the way you miss calls then call instantly',
          price: 'reverse uno charges',
        },
        {
          text: 'ur dramatic blanket burrito transformation every winter',
          price: 'limited edition cocoon',
        },
        {
          text: 'ur confidence explaining directions completely wrong',
          price: '₹4,99,999 navigation damages',
        },
        {
          text: 'ur tendency to water plants then overthink it',
          price: 'plant therapist fee',
        },
        {
          text: 'the way you send voice notes for one sentence',
          price: 'audio expansion pack',
        },
        {
          text: 'the way you check fridge hoping new food spawned',
          price: 'restock fantasy charge',
        },
        {
          text: 'ur dramatic reactions to mildly spicy chips',
          price: 'fire insurance pending',
        },
        {
          text: 'the way you wave at dogs before humans',
          price: 'species preference fee',
        },
        {
          text: 'ur chaotic charging habits stressing every cable',
          price: 'warranty voided immediately',
        },
        {
          text: 'ur obsession with collecting emotional support water bottles',
          price: 'BOGO hydration deal',
        },
        {
          text: 'ur lil side quests before every main task',
          price: 'EMI available on productivity',
        },
        {
          text: 'the way you aggressively befriend random animals',
          price: 'adoption forms pending',
        },
        {
          text: 'the way you guess lyrics with full confidence',
          price: 'accuracy not in stock',
        },
        {
          text: 'ur cute refusal to follow recipe instructions ever',
          price: 'chef warranty cancelled',
        },
        {
          text: 'ur tiny gremlin energy before morning coffee',
          price: '₹1 cr +gst',
        },
        {
          text: 'the way you make every inconvenience a sitcom',
          price: 'no returns accepted',
        },
        {
          text: 'ur lovable chaos somehow improving every single day',
          price: '₹∞ but worth it',
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
          price: 'renewed for another year',
        },
        {
          text: 'our inside jokes became a whole cinematic universe',
          price: 'franchise rights secured',
        },
        {
          text: 'best swipe decision in recorded human history fr',
          price: 'founding member rate',
        },
        {
          text: 'the way you still make me blush somehow',
          price: 'subscription undefeated',
        },
        {
          text: 'another year of being down catastrophically bad',
          price: 'auto-renews 💀',
        },
        {
          text: 'ur face still my favorite daily notification',
          price: 'priority access granted',
        },
        {
          text: 'the way forever started feeling suspiciously reasonable',
          price: 'warranty extended indefinitely',
        },
        {
          text: 'our love surviving every weird phase successfully',
          price: 'stress-tested and approved',
        },
        {
          text: 'still obsessed after all this time embarrassing honestly',
          price: '₹4,99,999 loyalty surcharge',
        },
        {
          text: 'ur laugh remains my longest running favorite series',
          price: 'season pass active',
        },
        {
          text: 'the way home somehow became a person',
          price: 'address update completed',
        },
        {
          text: 'another year of stealing my fries legally',
          price: 'joint account benefits',
        },
        {
          text: 'ur weirdness matching mine remains elite matchmaking',
          price: 'algorithm never recovered',
        },
        {
          text: 'still flirting with you like day one',
          price: 'introductory offer never ended',
        },
        {
          text: 'the way we turned ordinary days iconic',
          price: 'premium memories bundle',
        },
        {
          text: 'ur hand still fitting mine suspiciously perfectly',
          price: 'custom sizing included',
        },
        {
          text: 'the way you became my favorite habit',
          price: 'billed monthly in butterflies',
        },
        {
          text: 'our arguments somehow ending with snacks still',
          price: 'conflict resolution bonus',
        },
        {
          text: 'ur existence remains my favorite long-term investment',
          price: 'returns exceeding expectations',
        },
        {
          text: 'the way forever keeps looking good on us',
          price: 'lifetime member status',
        },
        {
          text: 'another anniversary of accidentally finding my person',
          price: 'search fees refunded',
        },
        {
          text: 'our comfort level now legally concerning',
          price: 'personal space sold separately',
        },
        {
          text: 'the way you know all my settings',
          price: 'admin privileges granted',
        },
        {
          text: 'another year of choosing us over everything',
          price: '₹7 loyalty rate',
        },
        {
          text: 'ur hugs remain my preferred operating system',
          price: 'software support extended',
        },
        {
          text: 'still crushing on you after all receipts',
          price: 'no expiration date',
        },
        {
          text: 'our relationship patch notes keep getting better',
          price: 'free upgrades included',
        },
        {
          text: 'the way you tolerate my nonsense daily',
          price: 'hazard pay approved',
        },
        {
          text: 'another year of sharing one braincell lovingly',
          price: 'resource pooling active',
        },
        {
          text: 'ur smile still causing unreasonable productivity losses',
          price: 'workplace disruption fee',
        },
        {
          text: 'our love language mostly snacks and memes',
          price: 'BOGO emotional support',
        },
        {
          text: 'ur favorite seat remaining right beside me',
          price: 'reserved indefinitely',
        },
        {
          text: 'still finding new reasons to adore you',
          price: 'inventory continuously restocked',
        },
        {
          text: 'our anniversary proving good decisions do exist',
          price: 'evidence package included',
        },
        {
          text: 'the way we built something worth staying for',
          price: 'non-refundable commitment fee',
        },
        {
          text: 'still obsessed with ur lil everyday habits',
          price: '₹0 worth it',
        },
        {
          text: 'the way you feel like luck every day',
          price: 'limited edition treasure',
        },
        {
          text: "another anniversary and i'm somehow even softer",
          price: 'EMI available on feelings',
        },
        {
          text: 'ur name still my favorite thing to hear',
          price: '₹1 cr +gst',
        },
        {
          text: "stuck with me forever hope that's okay",
          price: 'no cancellation option',
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
  lines: SuggestionSeed[];
  subtotal: ReceiptSummaryRow;
  discount: ReceiptSummaryRow;
  tax: ReceiptSummaryRow;
  total: string;
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
    lines,
    subtotal: { ...scaffold.subtotal },
    discount: { ...scaffold.discount },
    tax: { ...scaffold.tax },
    total: type.total,
    footer: scaffold.footer,
    memeStamp: type.stamp,
  };
}
