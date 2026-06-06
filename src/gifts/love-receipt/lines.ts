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
  | 'obsessed'
  | 'sorry'
  | 'missing'
  | 'birthday'
  | 'roast'
  | 'anniversary'
  | 'justbecause';

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
  },
  {
    key: 'obsessed',
    emoji: '😩',
    label: 'I’m Obsessed',
    tone: 'down bad and giddy — cannot stop thinking about them, butterflies, happily unwell about how much you like them',
    stamp: 'CERTIFIED OBSESSED',
    subtitle: 'Down Bad Division · Open 24/7 · No. 143',
    total: 'every thought I have + thoda extra',
    fallbackLines: [
      { text: 'thinking about you = my full-time job', price: '₹∞' },
      { text: 'I reread our chats like it’s homework', price: 'priceless' },
      { text: 'one (1) selfie saved my whole week', price: 'anmol' },
      { text: 'down bad and refusing therapy for it', price: 'non-refundable' },
      { text: 'your name pops up = serotonin overdose', price: 'invaluable' },
      { text: 'I’d give up my fav snack for a hug', price: '₹0 (worth it)' },
      { text: 'obsessed is honestly an understatement', price: 'priceless' },
    ],
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
  },
  {
    key: 'justbecause',
    emoji: '✨',
    label: 'Just Because',
    tone: 'soft everyday appreciation — no occasion at all, random reminders that they’re your favourite person',
    stamp: 'JUST BECAUSE',
    subtitle: 'No Occasion Required · Open Always · No. 143',
    total: 'priceless',
    fallbackLines: [
      { text: 'no reason, just obsessed with you', price: '₹∞' },
      { text: 'random reminder: you’re my fav human', price: 'priceless' },
      { text: 'thinking of you for zero occasion', price: 'anmol' },
      { text: 'you make boring tuesdays an event', price: 'non-refundable' },
      { text: 'just because your existence slaps', price: 'invaluable' },
      { text: 'sending love with no context', price: '₹0 (worth it)' },
      { text: 'you, appreciated out loud today', price: 'priceless' },
    ],
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
 * No-AI fallback — a small built-in set for the chosen type, blended with a
 * couple of language-flavoured starters, plus the scaffold's funny summary so
 * the receipt is always complete even when Gemini is unavailable.
 */
export function buildFallbackReceipt(input: GenerateInput): GeneratedReceipt {
  const type = getReceiptType(input.receiptType);
  const scaffold = buildScaffold(
    input.language,
    input.recipientName,
    input.senderName,
  );

  // Blend type lines with a couple language-flavoured starters for variety.
  const flavour = SUGGESTIONS[input.language].slice(0, 2);
  const merged: SuggestionSeed[] = [...type.fallbackLines];
  for (const f of flavour) {
    const text = applyTemplate(f.text, input.recipientName, input.senderName);
    if (!merged.some((m) => m.text === text)) merged.push({ ...f, text });
  }

  return {
    storeName: scaffold.storeName,
    subtitle: type.subtitle,
    lines: merged.slice(0, 9),
    subtotal: { ...scaffold.subtotal },
    discount: { ...scaffold.discount },
    tax: { ...scaffold.tax },
    total: type.total,
    footer: scaffold.footer,
    memeStamp: type.stamp,
  };
}
