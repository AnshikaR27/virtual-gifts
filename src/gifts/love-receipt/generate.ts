'use server';

import {
  buildFallbackReceipt,
  PERSONAL_QUESTIONS,
  DEFAULT_PRICE,
  type GeneratedReceipt,
  type GenerateInput,
  type SuggestionSeed,
} from './lines';

/**
 * Phase 2 — optional AI generation. Builds a full receipt (same shape as the
 * scaffolding) from the sender's type + answers.
 *
 * Provider-agnostic. By default it tries Google Gemini first (free tier), then
 * OpenAI — trying each provider whose key is present in order and falling
 * through to the next on any failure, then to {@link buildFallbackReceipt} so
 * the gift never breaks. Set AI_PROVIDER="openai" to prefer GPT first. Keys are
 * read server-side only and never reach the client. The prompt
 * ({@link buildPrompt}) is shared by both.
 */

const TIMEOUT_MS = 12_000;

// OpenAI — great at playful, voice-driven copy. Override model via OPENAI_MODEL.
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Gemini (default — free tier).
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type Provider = 'openai' | 'gemini';

/**
 * Providers to attempt, in order. Defaults to Gemini first (free tier), OpenAI
 * second; AI_PROVIDER="openai" flips OpenAI to the front. Only providers whose
 * key is present are included.
 */
function providerOrder(): Provider[] {
  const have: Record<Provider, boolean> = {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  const order: Provider[] =
    explicit === 'openai' ? ['openai', 'gemini'] : ['gemini', 'openai'];
  return order.filter((p) => have[p]);
}

export async function generateReceipt(
  input: GenerateInput,
): Promise<{ receipt: GeneratedReceipt; source: 'ai' | 'fallback' }> {
  const order = providerOrder();
  if (!order.length) {
    // TEMP DIAGNOSTIC — remove once AI generation is confirmed working.
    console.warn('[love-receipt] no AI key present in this runtime');
    return { receipt: buildFallbackReceipt(), source: 'fallback' };
  }

  // Try each provider in order; fall through to the next on any failure, then
  // to the built-in starter set so the builder never breaks.
  for (const provider of order) {
    try {
      const text =
        provider === 'openai'
          ? await callOpenAI(input)
          : await callGemini(input);
      const receipt = coerce(parseJson(text));
      if (!receipt) {
        console.error(
          `[love-receipt] ${provider} unusable shape; raw=${text.slice(0, 300)}`,
        );
        continue;
      }
      console.info(
        `[love-receipt] ${provider} OK — ${receipt.lines.length} lines`,
      );
      return { receipt, source: 'ai' };
    } catch (e) {
      console.error(
        `[love-receipt] ${provider} failed → next: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
  return { receipt: buildFallbackReceipt(), source: 'fallback' };
}

// ── providers (each returns the raw model text; shared parse/coerce after) ──
async function callOpenAI(input: GenerateInput): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: input.spice === 'extra' ? 1.2 : 1.0,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a witty, terminally-online Gen-Z copywriter. Output ONLY valid minified JSON — no markdown, no commentary.',
          },
          { role: 'user', content: buildPrompt(input) },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        `[love-receipt] openai HTTP ${res.status}: ${body.slice(0, 400)}`,
      );
      throw new Error(`openai ${res.status}`);
    }
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? '';
  } finally {
    clearTimeout(timer);
  }
}

async function callGemini(input: GenerateInput): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${GEMINI_ENDPOINT}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(input) }] }],
          generationConfig: {
            temperature: input.spice === 'extra' ? 1.15 : 0.95,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
            // 2.5-flash is a thinking model; disable so tokens go to the answer.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(
        `[love-receipt] gemini HTTP ${res.status}: ${body.slice(0, 400)}`,
      );
      throw new Error(`gemini ${res.status}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } finally {
    clearTimeout(timer);
  }
}

// ── prompt — one voice (Certified Delulu), English only ─────────────────
// The fixed DELULU MART frame is applied in code; the model only writes the
// LINE ITEMS, so the prompt asks for nothing but `lines`. // REVISIT: add a
// Hinglish variant once a Hinglish pool exists.
function buildPrompt(input: GenerateInput): string {
  const name = input.recipientName.trim() || 'them';
  const you = input.senderName.trim() || 'me';
  const rel = input.relationship.trim() || 'partner';

  const answered = PERSONAL_QUESTIONS.map((q) => {
    const v = (input.answers[q.key] || '').trim();
    return v ? `- ${q.label} → ${v}` : null;
  }).filter(Boolean) as string[];

  const personalRule = answered.length
    ? `The sender shared these — build at least 3 line items SPECIFICALLY from them (use the actual detail; specific beats generic):\n${answered.join('\n')}`
    : 'No personal details shared; invent oddly-specific lines (specific beats generic, every time).';

  const spiceRule =
    input.spice === 'extra'
      ? 'CRANK THE CRINGE TO MAXIMUM: more unhinged, delulu, down-bad, terminally-online.'
      : '';

  return [
    `You write a playful "love receipt": a fake store receipt where every line item is a cute/funny reason the sender adores the recipient, each with a joke "price".`,
    ``,
    `CONTEXT`,
    `- Recipient (customer): ${name}`,
    `- Sender: ${you}`,
    `- Relationship: ${rel}`,
    ``,
    `VOICE — "Certified Delulu"`,
    `- Funny-but-secretly-sincere. Lowercase texting style, very-online Gen-Z, warm, a little unhinged and delulu. PG-13.`,
    `- Be SPECIFIC and a little weird — specific beats generic EVERY time. Avoid bland filler like "being my fave person" or "existing, basically".`,
    spiceRule,
    ``,
    `EXAMPLES — copy this VOICE (text | price), but write BRAND-NEW lines (never reuse these):`,
    `- your hoodie (im NOT returning) | kept`,
    `- 47× futures i planned w u | EMI`,
    `- 100 arguments i won in the shower | champ`,
    `- you asked "khaana khaya?" | ∞`,
    `- your "hmm" caused three business days of overthinking | processing`,
    `- you said "drive safe" | ₹143`,
    ``,
    `PERSONALIZATION`,
    `- ${personalRule}`,
    ``,
    `LINE RULES`,
    `- Produce 8-12 SHORT, textable line items (each feels under ~8 words), lowercase.`,
    ``,
    `PRICE RULES — "stamp as value" (strict)`,
    `- The price is a tiny STAMP, not a real total. Use EITHER a short word-stamp (≤2 words) like "copium", "pending", "champ", "lease pending", "kept", "void", "EMI" — OR a ₹ amount that MEANS something:`,
    `  • ₹143 = "i love you" (pager code)   • ₹420 = a fraud / cheeky-crime joke`,
    `  • ₹108 or ₹786 = auspicious / blessed   • ₹101 or ₹501 = shagun (gift money)`,
    `  • "EMI" = a long-term-commitment joke (paying it off forever)`,
    `- Vary them; never repeat the same price in the set. NEVER invent random uppercase tokens like "₹FUJISOKU".`,
    ``,
    `OUTPUT`,
    `Return ONLY valid minified JSON (no markdown, no code fences, no commentary) matching exactly:`,
    `{"lines":[{"text":string,"price":string}]}`,
  ]
    .filter(Boolean)
    .join('\n');
}

// ── parsing + validation ─────────────────────────────────────────────────
function parseJson(text: string): unknown {
  try {
    // Strip ```json / ``` fences and any stray prose around the object.
    let t = text
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();
    const first = t.indexOf('{');
    const last = t.lastIndexOf('}');
    if (first > 0 || last < t.length - 1) {
      if (first !== -1 && last !== -1) t = t.slice(first, last + 1);
    }
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

/**
 * Validate the model's JSON; return null if it's unusable so we fall back. The
 * model only supplies the LINE ITEMS — the rest of the receipt is the locked
 * DELULU MART frame, taken from {@link buildFallbackReceipt}.
 */
function coerce(raw: unknown): GeneratedReceipt | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const rawLines = Array.isArray(o.lines) ? o.lines : [];
  const lines: SuggestionSeed[] = rawLines
    .map((l) => {
      const item = (l ?? {}) as Record<string, unknown>;
      const text = str(item.text);
      if (!text) return null;
      return { text, price: str(item.price, DEFAULT_PRICE) };
    })
    .filter(Boolean)
    .slice(0, 12) as SuggestionSeed[];

  // Need a real set of lines to be worth using; otherwise fall back.
  if (lines.length < 4) return null;

  return { ...buildFallbackReceipt(), lines };
}
