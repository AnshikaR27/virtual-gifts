'use server';

import {
  buildFallbackReceipt,
  getReceiptType,
  PERSONAL_QUESTIONS,
  DEFAULT_PRICE,
  type GeneratedReceipt,
  type GenerateInput,
  type ReceiptSummaryRow,
  type SuggestionSeed,
} from './lines';

/**
 * Phase 2 — optional AI generation. Calls Google Gemini server-side with the
 * sender's type + answers and returns a full receipt in the same shape as the
 * scaffolding. This layer is easy to toggle off: with no GEMINI_API_KEY (or on
 * ANY failure) it silently returns {@link buildFallbackReceipt}, so the gift
 * never breaks.
 *
 * The key is read from process.env.GEMINI_API_KEY and never reaches the client.
 */

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 12_000;

export async function generateReceipt(
  input: GenerateInput,
): Promise<{ receipt: GeneratedReceipt; source: 'ai' | 'fallback' }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // TEMP DIAGNOSTIC — remove once AI generation is confirmed working.
    console.warn('[love-receipt] GEMINI_API_KEY not present in this runtime');
    return { receipt: buildFallbackReceipt(input), source: 'fallback' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input) }] }],
        generationConfig: {
          temperature: input.spice === 'extra' ? 1.15 : 0.95,
          topP: 0.95,
          // 8-12 Hinglish lines + scaffolding can overflow a small budget and
          // truncate the JSON (→ parse fails). Give it ample room.
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
          // gemini-2.5-flash is a "thinking" model — without this it spends the
          // output budget on internal reasoning and returns truncated/empty
          // JSON. Disable thinking so all tokens go to the answer.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (!res.ok) {
      // TEMP DIAGNOSTIC — log status + body (never the key) to runtime logs.
      const body = await res.text().catch(() => '');
      console.error(
        `[love-receipt] gemini HTTP ${res.status}: ${body.slice(0, 400)}`,
      );
      throw new Error(`gemini ${res.status}`);
    }
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = parseJson(text);
    const receipt = coerce(parsed, input);
    if (!receipt) {
      console.error(
        `[love-receipt] gemini unusable shape; raw=${text.slice(0, 300)}`,
      );
      throw new Error('unusable shape');
    }
    console.info(`[love-receipt] gemini OK — ${receipt.lines.length} lines`);
    return { receipt, source: 'ai' };
  } catch (e) {
    // Any failure → silent fallback so the builder never breaks.
    console.error(
      `[love-receipt] gemini failed → fallback: ${e instanceof Error ? e.message : String(e)}`,
    );
    return { receipt: buildFallbackReceipt(input), source: 'fallback' };
  } finally {
    clearTimeout(timer);
  }
}

// ── prompt ──────────────────────────────────────────────────────────────
function buildPrompt(input: GenerateInput): string {
  const type = getReceiptType(input.receiptType);
  const name = input.recipientName.trim() || 'them';
  const you = input.senderName.trim() || 'me';
  const rel = input.relationship.trim() || 'partner';
  const isHinglish = input.language === 'hinglish';

  const langRule = isHinglish
    ? 'Write in HINGLISH: mix Hindi + English WITHIN each single line (never a full-Hindi or full-English line), Romanized in Latin script. Natural Gen-Z texting style.'
    : 'Write in casual, very-online Gen-Z English.';

  const hinglishRules = isHinglish
    ? [
        `HINGLISH RULES (strict):`,
        `- Use casual "tu / tera / tujhe" — NEVER formal "aap / tumhari". Keep ONE register, consistently.`,
        `- Blend Hindi + English mid-sentence like the examples; don't write a clean full sentence in either language.`,
        `- Write Hindi the way Indians actually TEXT (casual, natural). If a Hindi phrase sounds clunky or translated, lean more English.`,
      ].join('\n')
    : '';

  // Few-shot examples teach the exact voice. Show the set matching the language.
  const examples = isHinglish
    ? [
        `EXAMPLES — copy this VOICE + register, but write BRAND-NEW lines (never reuse these):`,
        `- the way you say mera naam, I'm literally unwell | priceless`,
        `- you live rent free in my dimaag 24/7 | ₹0 (no eviction)`,
        `- neend mein bhi paas kheench lete ho, I'm down bad | ₹∞`,
        `- double text kar diya bc 4 min mein hi miss kar diya | non-refundable`,
        `- teri hassi has me in a chokehold fr | anmol`,
        `- "ghar jaana" ab matlab "tere paas jaana", pls fix | invaluable`,
      ].join('\n')
    : [
        `EXAMPLES — copy this VOICE, but write BRAND-NEW lines (never reuse these):`,
        `- stealing the blanket every single night | ₹0 (worth it)`,
        `- your laugh that lives rent free in my head | priceless`,
        `- letting me win arguments, knowingly | invaluable`,
        `- 3am "are you up?" texts | non-refundable`,
        `- you're my roman empire, I think about you 24/7 | ₹∞`,
        `- the audacity to be this cute on a Tuesday | unpayable`,
      ].join('\n');

  const answered = PERSONAL_QUESTIONS.map((q) => {
    const v = (input.answers[q.key] || '').trim();
    return v ? `- ${q.label} → ${v}` : null;
  }).filter(Boolean) as string[];

  const personalRule = answered.length
    ? `The sender shared these personal details — build at least 3 line items SPECIFICALLY from them (use the actual detail; make it specific, not generic):\n${answered.join('\n')}`
    : 'No personal details shared; invent sweet, oddly-specific-feeling lines that fit the type (specific beats generic).';

  const spiceRule =
    input.spice === 'extra'
      ? 'CRANK THE CRINGE TO MAXIMUM: more unhinged, delulu, terminally-online energy.'
      : '';

  return [
    `You write playful "love receipts": a fake store receipt where every line item is a cute/funny reason the sender adores the recipient, each with a joke "price".`,
    ``,
    `CONTEXT`,
    `- Recipient (customer): ${name}`,
    `- Sender (cashier): ${you}`,
    `- Relationship: ${rel}`,
    `- Receipt type: "${type.label}" — tone: ${type.tone}`,
    ``,
    `VOICE`,
    `- ${langRule}`,
    `- Gen-Z cutesy + cringe, warm, a little unhinged and delulu. PG-13.`,
    `- Match the receipt TYPE's tone above.`,
    `- Be SPECIFIC and a little weird — specific beats generic EVERY time. Avoid bland filler like "being my fave person" or "existing, basically".`,
    spiceRule,
    hinglishRules,
    ``,
    examples,
    ``,
    `PERSONALIZATION`,
    `- ${personalRule}`,
    ``,
    `LINE RULES`,
    `- Produce 8-12 SHORT, textable line items (each feels under ~8 words).`,
    ``,
    `PRICE RULES (strict)`,
    `- Each "price" MUST be one of: "priceless", "₹0 (worth it)", "₹∞", "non-refundable", "anmol", "invaluable", "unpayable", OR a short readable phrase ≤4 words (e.g. "take my money", "no eviction", "worth the wait").`,
    `- Vary them; never repeat the same price. NEVER invent random uppercase tokens like "₹FUJISOKU" or "₹BAHUTHIGH".`,
    `- subtotal / discount / tax: short, readable, funny labels + readable values. total: a short sweet phrase like "my whole heart" or "everything I have" (NOT a random uppercase string).`,
    `- "footer": thank them for shopping + mention the cashier (${you}).`,
    `- "memeStamp": a SHORT uppercase rubber-stamp phrase (≤3 words), e.g. "CERTIFIED DELULU".`,
    ``,
    `OUTPUT`,
    `Return ONLY valid minified JSON (no markdown, no code fences, no commentary) matching exactly:`,
    `{"storeName":string,"subtitle":string,"lines":[{"text":string,"price":string}],"subtotal":{"label":string,"price":string},"discount":{"label":string,"price":string},"tax":{"label":string,"price":string},"total":string,"footer":string,"memeStamp":string}`,
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

function summary(v: unknown, fb: ReceiptSummaryRow): ReceiptSummaryRow {
  const o = (v ?? {}) as Record<string, unknown>;
  return { label: str(o.label, fb.label), price: str(o.price, fb.price) };
}

/** Validate Gemini's JSON; return null if it's unusable so we fall back. */
function coerce(raw: unknown, input: GenerateInput): GeneratedReceipt | null {
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

  const fb = buildFallbackReceipt(input);
  return {
    storeName: str(o.storeName, fb.storeName ?? ''),
    subtitle: str(o.subtitle, fb.subtitle),
    lines,
    subtotal: summary(o.subtotal, fb.subtotal),
    discount: summary(o.discount, fb.discount),
    tax: summary(o.tax, fb.tax),
    total: str(o.total, fb.total),
    footer: str(o.footer, fb.footer),
    memeStamp: str(o.memeStamp, fb.memeStamp ?? '') || null,
  };
}
