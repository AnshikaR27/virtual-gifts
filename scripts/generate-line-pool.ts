/**
 * One-off seeding script — NOT a server action. Run locally from the terminal to
 * generate a big pool of Love Receipt line items for review, then hand-cut duds
 * before committing the survivors into the app's content.
 *
 * It calls Google Gemini once per (category × language) asking for ~55 lines as
 * a JSON array of { item, price }, and writes everything grouped to
 * scripts/output/line-pool.json.
 *
 * Run (PowerShell):
 *   $env:GEMINI_API_KEY="your-key"; npx tsx scripts/generate-line-pool.ts
 * Run (bash):
 *   GEMINI_API_KEY=your-key npx tsx scripts/generate-line-pool.ts
 * If GEMINI_API_KEY isn't in your shell, the script also reads it from .env.local.
 *
 * NOTE: This uses Gemini (free tier) on purpose. To use OpenAI/GPT instead, swap
 * the body of callModel() for an OpenAI chat-completions call and read
 * OPENAI_API_KEY — nothing else changes.
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// ── config ──────────────────────────────────────────────────────────────
const TARGET_PER_BATCH = 55;
const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const DELAY_MS = 4500; // gap between calls to stay under the free-tier RPM
const MAX_RETRIES = 3;
const OUT_PATH = resolve('scripts/output/line-pool.json');

const CATEGORIES: { key: string; tone: string }[] = [
  {
    key: 'certified-delulu',
    tone: 'maximum delusional-but-adorable energy — convinced you two are cosmic soulmates, manifesting the wedding, unhinged in the cutest way',
  },
  {
    key: 'lovingly-roasted',
    tone: 'playful teasing roast — poke fun at their cute flaws and silly habits, but make it obvious you adore them',
  },
  {
    key: 'sorry',
    tone: 'sweetly apologetic — owning a small dumb mistake, grovelling cutely, promising snacks and forehead kisses',
  },
  {
    key: 'missing-you',
    tone: 'soft aching long-distance longing — counting the hours, pillow doing a bad job, desperate for the next hug',
  },
  {
    key: 'birthday',
    tone: 'celebratory hype — gassing them up on their birthday, another year of being unfairly cute, permission to be spoiled',
  },
  {
    key: 'anniversary',
    tone: 'sappy milestone celebration — time spent together, still choosing them, still down bad after all this time',
  },
];

const LANGUAGES: { key: string; rule: string }[] = [
  {
    key: 'english',
    rule: 'Write in casual, very-online Gen-Z English.',
  },
  {
    key: 'hinglish',
    rule: 'Write in HINGLISH: mix Hindi + English WITHIN each single line (never a full-Hindi or full-English line), Romanized in Latin script, casual "tu/tera/tujhe" register, natural Gen-Z texting.',
  },
];

// ── system prompt (price-variety + voice rules baked in) ─────────────────
const SYSTEM = [
  'You write playful "love receipt" line items: a fake store receipt where each',
  'item is a cute/funny reason someone adores their person, paired with a joke',
  '"price". The JOKE is usually the pairing of the item with an unexpected price.',
  '',
  'PRICE VARIETY (this is the most important rule — do NOT make every price a',
  'synonym for "priceless"):',
  '- Vary the TYPE of price joke across the set. Use a healthy mix of:',
  '  • absurd rupee numbers — e.g. "₹4,99,999.00", "₹7 (loyalty rate)", "₹0 (worth it)"',
  '  • subscription & billing gags — e.g. "billed monthly", "auto-renews 💀", "free trial expired", "non-refundable"',
  '  • store/inventory speak — e.g. "out of stock", "limited edition", "BOGO", "no returns", "*conditions apply", "see fine print"',
  '  • "priceless"-style lines ONLY sparingly — MAX 2 in the whole set',
  '- No single price string may repeat more than TWICE in the set.',
  '- Where possible the price should COMMENT on that specific item (the pairing is the joke), not be a generic tag.',
  '',
  'VOICE:',
  "- Gen-Z cutesy/cringe, warm, a little unhinged. Texting register (ur, lil', fave, fr, ngl).",
  '- Keep ONE register per line — never mix formal and texting voice in the same line.',
  '- 8-12 words MAX per item. Short and punchy.',
  '- PG-13. Be specific and a little weird; specific beats generic.',
  '',
  'OUTPUT: Return ONLY a valid JSON array (no markdown, no code fences, no prose) of',
  'objects exactly like: [{"item":"...","price":"..."}, ...]',
].join('\n');

function buildUserPrompt(
  tone: string,
  langRule: string,
  count: number,
): string {
  return [
    `Generate ${count} love-receipt line items.`,
    `Category tone: ${tone}`,
    langRule,
    `Remember the PRICE VARIETY rules: mix absurd rupee numbers, subscription/billing gags,`,
    `and store/inventory speak; at most 2 "priceless"-style prices; no price string more than twice.`,
    `Return ONLY the JSON array of {item, price}.`,
  ].join('\n');
}

// ── key lookup (env first, then .env.local) ──────────────────────────────
function getKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const env = readFileSync(resolve('.env.local'), 'utf8');
    const m = env.match(/^GEMINI_API_KEY=(.*)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch {
    /* no .env.local */
  }
  return '';
}

// ── provider call (swap this body for OpenAI if you ever want GPT) ────────
async function callModel(key: string, userPrompt: string): Promise<string> {
  const res = await fetch(`${ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 1.05,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        // 2.5-flash is a thinking model — disable so the whole budget goes to JSON.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── defensive parse → array of {item, price} ─────────────────────────────
interface Line {
  item: string;
  price: string;
}

function parseLines(text: string): Line[] {
  let t = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
  const start = t.indexOf('[');
  const end = t.lastIndexOf(']');
  if (start !== -1 && end !== -1) t = t.slice(start, end + 1);

  let arr: unknown;
  try {
    arr = JSON.parse(t);
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((x) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return {
        item: String(o.item ?? '').trim(),
        price: String(o.price ?? '').trim(),
      };
    })
    .filter((l) => l.item && l.price);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateBatch(
  key: string,
  tone: string,
  langRule: string,
): Promise<Line[]> {
  const prompt = buildUserPrompt(tone, langRule, TARGET_PER_BATCH);
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await callModel(key, prompt);
      const lines = parseLines(text);
      if (lines.length === 0) throw new Error('parsed 0 lines');
      return lines;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const is429 = msg.includes('HTTP 429');
      console.warn(
        `    attempt ${attempt}/${MAX_RETRIES} failed: ${msg}${is429 ? ' (rate limited)' : ''}`,
      );
      if (attempt < MAX_RETRIES) await sleep(is429 ? 20_000 : 3_000);
    }
  }
  return [];
}

// ── main ─────────────────────────────────────────────────────────────────
async function main() {
  const key = getKey();
  if (!key) {
    console.error(
      'No GEMINI_API_KEY found (set it in your shell or .env.local). Aborting.',
    );
    process.exit(1);
  }

  const out: Record<string, Record<string, Line[]>> = {};
  let total = 0;

  for (const cat of CATEGORIES) {
    out[cat.key] = {};
    for (const lang of LANGUAGES) {
      process.stdout.write(`Generating ${cat.key} / ${lang.key} … `);
      const lines = await generateBatch(key, cat.tone, lang.rule);
      out[cat.key][lang.key] = lines;
      total += lines.length;
      const flag =
        lines.length < TARGET_PER_BATCH - 10 ? '  ⚠️ short batch' : '';
      console.log(`${lines.length} lines${flag}`);
      await sleep(DELAY_MS);
    }
  }

  if (!existsSync(dirname(OUT_PATH))) {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
  }
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');

  console.log(`\nDone. ${total} lines total → ${OUT_PATH}`);
  console.log('Review and hand-cut duds before committing into the app.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
