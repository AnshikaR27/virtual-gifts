import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { GiftFrame } from '@/components/gift-frame/gift-frame';
import { getGiftDefinition } from '@/gifts/registry';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import {
  buildFrame,
  formatReceiptDate,
  pickTotal,
  sampleBalanced,
  type ReceiptPayload,
} from '@/gifts/love-receipt/lines';
import { LOVE_RECEIPT_POOL } from '@/gifts/love-receipt/love-receipt-pool';
import { ReceiptPaper } from '@/gifts/love-receipt/receipt-paper';
import type { ResolvedDoodle } from '@/gifts/love-receipt/love-receipt-doodles';

/**
 * Preview of a gift receiver with mock data, so a scene can be eyeballed
 * without Supabase. A static `preview` segment takes precedence over the
 * sibling dynamic `[shortId]` route, so the real /g/<id> path is untouched.
 *
 * Choose which gift with `?slug=` (defaults to tiffin-note):
 *   http://localhost:3000/g/preview
 *   http://localhost:3000/g/preview?slug=love-receipt
 *   https://<branch-preview>.vercel.app/g/preview?slug=love-receipt
 *
 * Available on localhost and on Vercel *preview* deploys; 404s only on the
 * production deployment (gated by VERCEL_ENV).
 */

// Always render at request time so the env guard is honored.
export const dynamic = 'force-dynamic';

const TIFFIN_MOCK: GiftData = {
  id: '00000000-0000-0000-0000-000000000000',
  shortId: 'preview',
  slug: 'tiffin-note',
  senderName: 'Bhumin',
  recipientName: 'Anshika',
  contentJsonb: {
    top_dabba: 'Gulab Jamun',
    middle_dabba: 'Mathri',
    note_text: 'khaana time pe khaa lena.\nmiss u 💌',
    sender_name: 'Bhumin',
    recipient_name: 'Anshika',
  },
  paid: false,
};

function loveReceiptMock(): GiftData {
  const frame = buildFrame({ recipientName: 'Anshika', senderName: 'Bhumin' });
  const payload: ReceiptPayload = {
    version: 1,
    language: 'en',
    recipientName: 'Anshika',
    senderName: 'Bhumin',
    relationship: 'girlfriend',
    storeName: frame.storeName,
    subtitle: frame.subtitle,
    receiptLabel: frame.receiptLabel,
    dateLabel: formatReceiptDate(),
    cashier: frame.cashier,
    billedTo: frame.billedTo,
    billNumber: frame.billNumber,
    gstin: frame.gstin,
    // Doodle layer demo: number-wrap auto-frames the QTY digits of most rows
    // (every 4th left plain), so 4+ lines show the rotation + a skip. A `*word*`
    // marker on line 'a' exercises word-circle; barren scatter is always-on
    // around the header/barcode/footer regardless of these lines.
    lines: [
      {
        id: 'a',
        poolId: 'lr-061',
        text: 'your *hoodie* (im NOT returning)',
        price: 'kept',
      },
      {
        id: 'b',
        poolId: 'lr-053',
        text: '47× futures i planned w u',
        price: 'EMI',
      },
      {
        id: 'c',
        poolId: 'lr-081',
        text: 'the audacity to look this good',
        price: 'santoor tax',
      },
      { id: 'd', text: 'you asked "khaana khaya?"', price: '∞' },
      { id: 'e', text: 'every *goodnight* text, on time', price: 'priceless' },
    ],
    subtotal: frame.subtotal,
    discount: frame.discount,
    tax: frame.tax,
    total: frame.total,
    paidVia: frame.paidVia,
    finePrint: frame.finePrint,
    returnPolicy: frame.returnPolicy,
    scanLine: frame.scanLine,
    footer: frame.footer,
    memeStamp: frame.stamp,
  };
  return {
    id: '00000000-0000-0000-0000-000000000001',
    shortId: 'preview',
    slug: 'love-receipt',
    senderName: 'Bhumin',
    recipientName: 'Anshika',
    contentJsonb: payload as unknown as Record<string, unknown>,
    paid: false,
  };
}

const MOCKS: Record<string, () => GiftData> = {
  'tiffin-note': () => TIFFIN_MOCK,
  'love-receipt': loveReceiptMock,
};

// ── doodle gallery — several receipts, different payloads ───────────────────
// The single mock above renders ONE deterministic receipt, so it can never show
// the rare heart. This gallery renders ReceiptPaper directly for a few curated
// real-pool line-sets so the per-receipt doodle behaviour can be eyeballed:
// mostly star/saturn, an occasional SINGLE heart, plus the darkened render.
// Open with /g/preview?slug=love-receipt&view=gallery
const POOL_BY_ID = new Map(LOVE_RECEIPT_POOL.map((l) => [l.id, l]));

/** Build a full ReceiptPayload from real pool ids (text/price pulled from the
 *  pool); pass `marks` to wrap a word with `*asterisks*` for the word-circle. */
function galleryPayload(
  poolIds: string[],
  marks: Record<string, string> = {},
): ReceiptPayload {
  const frame = buildFrame({ recipientName: 'Anshika', senderName: 'Bhumin' });
  const lines = poolIds.map((poolId, i) => {
    const src = POOL_BY_ID.get(poolId);
    const text = marks[poolId] ?? src?.text ?? `line ${i + 1}`;
    return { id: `g${i}`, poolId, text, price: src?.price ?? 'priceless' };
  });
  return {
    version: 1,
    language: 'en',
    recipientName: 'Anshika',
    senderName: 'Bhumin',
    relationship: 'girlfriend',
    storeName: frame.storeName,
    subtitle: frame.subtitle,
    receiptLabel: frame.receiptLabel,
    dateLabel: formatReceiptDate(),
    cashier: frame.cashier,
    billedTo: frame.billedTo,
    billNumber: frame.billNumber,
    gstin: frame.gstin,
    lines,
    subtotal: frame.subtotal,
    discount: frame.discount,
    tax: frame.tax,
    total: frame.total,
    paidVia: frame.paidVia,
    finePrint: frame.finePrint,
    returnPolicy: frame.returnPolicy,
    scanLine: frame.scanLine,
    footer: frame.footer,
    memeStamp: frame.stamp,
  };
}

// Curated demos for the number-wrap rules (see numberWrapForReceipt). The three
// doodles are saturn, teal star, rose-pink heart; placement is deterministic off
// the poolId hash. These two sets happen to exercise both cases:
//   card0 (lr-001/002/003/005) → [saturn, star, ·, heart]  — ≈1 plain, each once.
//   card1 (lr-035/039/044/045) → [saturn, star, saturn, heart] — all 4 framed, so
//       saturn doubles, kept NON-ADJACENT; star + heart never repeat.
const GALLERY: { label: string; payload: ReceiptPayload }[] = [
  {
    label: '≈1 plain · saturn + star + heart, once each',
    payload: galleryPayload(['lr-001', 'lr-002', 'lr-003', 'lr-005']),
  },
  {
    label: 'all 4 framed · saturn ×2, non-adjacent',
    payload: galleryPayload(['lr-035', 'lr-039', 'lr-044', 'lr-045']),
  },
  {
    // word-circle is DISABLED — this card confirms a marked line renders as clean
    // plain text (asterisks stripped, no hollow circle mounted).
    label: 'marked word → plain text (word-circle off)',
    payload: galleryPayload(['lr-006', 'lr-007', 'lr-008', 'lr-009'], {
      'lr-006': '*' + (POOL_BY_ID.get('lr-006')?.text ?? 'you') + '*',
    }),
  },
  {
    // Word-level underlines (tender pass): lr-018 "you" + lr-032 "forever".
    label: 'word-underline · lr-018 you + lr-032 forever',
    payload: galleryPayload(['lr-018', 'lr-032', 'lr-067', 'lr-085']),
  },
];

// ── LINE_BINDINGS demo — the oval + underline pass on one receipt ────────────
// Renders a draw that includes several of the 10 bound lines so the real
// LINE_BINDINGS (circle-word, circle-price, underline) can be eyeballed together.
// These are the ACTUAL bindings (from love-receipt-doodles.ts), not an override —
// each doodle sizes snugly to its target. Reached with
// /g/preview?slug=love-receipt&view=bindings
//   circle-word (item text): lr-056 dimples · lr-039 win · lr-050 nonsense
//                            · lr-065 curtains · lr-096 pookie
//   circle-price:            lr-005 mine · lr-002 EMI · lr-008 busted · lr-060 launched
//   underline:               lr-035 (whole item text)
const BINDINGS_DEMO_IDS = [
  'lr-056',
  'lr-039',
  'lr-050',
  'lr-096',
  'lr-035',
  'lr-005',
  'lr-002',
  'lr-008',
  'lr-060',
  'lr-065',
];

function BindingsDemo() {
  const payload = galleryPayload(BINDINGS_DEMO_IDS);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — LINE_BINDINGS (oval + underline pass)
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 460,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Real per-line bindings, each sized to its target: circle-word hugs a
        word in the item text (dimples / win / nonsense / pookie / curtains),
        circle-price hugs the price tag (mine / EMI / busted / launched), and
        lr-035 gets an underline under just its text. Number-wraps + barcode
        fans ride along as before.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

// ── END-MARK pass demo — punctuate-after (?! / <3 / rays) on one receipt ─────
// Real end-mark LINE_BINDINGS: ?! (question+exclaim pair), <3 (math-heart), rays
// (mustard). Mixes short + long lines so the mark wraps under the last text line
// on long draws instead of pushing into the price column. Reached with
// /g/preview?slug=love-receipt&view=endmarks
const ENDMARK_DEMO_IDS = [
  'lr-003', // ?!  medium
  'lr-062', // ?!  short-ish
  'lr-069', // ?!  long (mark trails the wrap)
  'lr-151', // <3  long
  'lr-019', // <3  medium
  'lr-049', // <3  long
  'lr-100', // rays medium
  'lr-073', // rays medium
  'lr-045', // rays very long
];

function EndMarkDemo() {
  const payload = galleryPayload(ENDMARK_DEMO_IDS);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — LINE_BINDINGS (end-mark pass)
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 460,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        punctuate-after marks tucked after the item text — ?! (question+exclaim
        pair), &lt;3 (math-heart), and the mustard rays flourish. One per line;
        on long lines the mark rides under the last wrapped line, clear of the
        price column. Number-wraps + barcode fans ride along.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

// ── SHOWCASE — every in-context doodle on ONE receipt ────────────────────────
// A single curated draw whose 10 lines each carry a DISTINCT hand binding, so
// every doodle the engine actually places on a receipt shows up together on one
// slip. Hand bindings are immune to the coverage/adjacency governors (PASS 1 of
// resolveReceiptDoodles), so all 10 render. Riding along automatically:
//   • number-wrap frames on the QTY digits — saturn + teal star + rose-pink heart
//   • the two mirrored lavender dash-fans bracketing the barcode
// (The solid scatter motifs — lock / love-letter / wine-glass / kiss / toffee /
// bouquet / hearts — live in the registry but aren't wired to any placement yet,
// so they only appear in the raw grid at /doodles.) Reached with
// /g/preview?slug=love-receipt&view=showcase
const SHOWCASE_IDS = [
  'lr-056', // circle-word · oval-lavender (dimples)
  'lr-096', // circle-word · peanut-pink (pookie)
  'lr-005', // circle-price · oval-lavender (mine)
  'lr-002', // circle-price · peanut-pink (EMI)
  'lr-018', // underline · teal (you)
  'lr-156', // underline · wavy (more)
  'lr-003', // end-mark · ?! (exclaim-question)
  'lr-035', // end-mark · <3 (math-heart)
  'lr-045', // end-mark · rays (mustard)
  'lr-101', // end-mark · sparkle
];

// ── HEART — every line ends in the math-heart <3 ─────────────────────────────
// A focused slip whose lines are ALL math-heart end-mark bindings, so the <3
// sits at the tail of each sentence — the clearest look at the mark's placement
// and size after the alpha-trim + aspect fix. Short lines first so the heart
// lands right at the sentence end (no long wrap). Reached with
// /g/preview?slug=love-receipt&view=hearts
const HEART_IDS = [
  'lr-035', // "you finish my sentences"            (short — <3 flush at end)
  'lr-019', // "i want all your boring Tuesdays…"   (medium)
  'lr-151', // "you stole my heart, …a crime"       (medium)
  'lr-049', // (tender) long — <3 trails the wrap
];

// ── STANDARD — the real 4-line receipt length, with the math-heart present ──
// The product opens at STARTING_LINE_COUNT (4) lines. This is the default opener
// (DEFAULT_STARTING_IDS) with its last funny line swapped for the math-heart line,
// so you can review the <3 on a normal-length slip rather than a dense demo.
// Reached with /g/preview?slug=love-receipt&view=standard
const STANDARD_IDS = [
  'lr-061', // funny  — processing (default opener)
  'lr-053', // flavor — guard duty (default opener)
  'lr-081', // tender — bookmarked (default opener)
  'lr-035', // end-mark · <3 (math-heart) — "you finish my sentences"
];

function StandardDemo() {
  const payload = galleryPayload(STANDARD_IDS);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — standard 4-line receipt (with math-heart)
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 460,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        The real product length (4 lines). Line 04 carries the{' '}
        <code>&lt;3</code> end-mark so you can see it on a normal receipt rather
        than a dense demo.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

function HeartDemo() {
  const payload = galleryPayload(HEART_IDS);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — math-heart at the end of each line
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 460,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Every item line here carries the <code>&lt;3</code> end-mark
        (doodle-math-heart), so you can see it land at the tail of the sentence
        after the alpha-trim + aspect fix. On the short first line it sits
        flush; on a long line it rides under the last wrapped row, clear of the
        price.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

function ShowcaseDemo() {
  const payload = galleryPayload(SHOWCASE_IDS);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — every doodle on one receipt
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 470,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        One slip with all the doodles the engine places in context: circle-word
        (oval + peanut), circle-price (oval + peanut), teal + wavy underlines,
        and the end-marks — ?! · &lt;3 · rays · sparkle. The QTY digits carry
        the number-wrap frames (saturn / teal star / rose-pink heart) and the
        barcode gets its lavender dash-fans. For the raw grid of every PNG, see{' '}
        <code>/doodles</code>.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

// ── REAL draw — the actual sampleBalanced engine, all bindings mixed ─────────
// No hand-picked ids: a normal shuffled draw (whatever comes up), with every
// authored binding rendering naturally — circle-word / circle-price / underline /
// end-marks (?! / <3 / rays), plus number-wraps + barcode fans. This is the real
// output a sender/recipient sees. Reached with /g/preview?slug=love-receipt&view=real
// (force-dynamic → a fresh shuffle every refresh).
function realDrawPayload(cursor: number): ReceiptPayload {
  const frame = buildFrame({ recipientName: 'Anshika', senderName: 'Bhumin' });
  // Real receipt line count = STARTING_LINE_COUNT (4) — the actual sampleBalanced
  // default the product uses (buildFallbackReceipt / getStartingLines). No inflation.
  const { lines } = sampleBalanced(new Set(), cursor);
  return {
    version: 1,
    language: 'en',
    recipientName: 'Anshika',
    senderName: 'Bhumin',
    relationship: 'girlfriend',
    storeName: frame.storeName,
    subtitle: frame.subtitle,
    receiptLabel: frame.receiptLabel,
    dateLabel: formatReceiptDate(),
    cashier: frame.cashier,
    billedTo: frame.billedTo,
    billNumber: frame.billNumber,
    gstin: frame.gstin,
    lines,
    subtotal: frame.subtotal,
    discount: frame.discount,
    tax: frame.tax,
    total: pickTotal(lines).price,
    paidVia: frame.paidVia,
    finePrint: frame.finePrint,
    returnPolicy: frame.returnPolicy,
    scanLine: frame.scanLine,
    footer: frame.footer,
    memeStamp: frame.stamp,
  };
}

function RealDraws() {
  // three independent shuffled draws at the REAL 4-line count. Marks come from the
  // hand bindings + tone rule engine + global governors (see resolveReceiptDoodles).
  const draws = [0, 1, 2].map((cursor) => realDrawPayload(cursor));
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <h1
        style={{
          fontSize: 16,
          margin: '0 0 4px',
          color: '#1a1a1a',
          textAlign: 'center',
        }}
      >
        Love Receipt — real shuffled draws (sampleBalanced)
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 auto 22px',
          maxWidth: 520,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Three natural draws at the real 4-line count (STARTING_LINE_COUNT) — no
        hand-picked lines. Marks come from the rule engine (tone → mark,
        word/price targets) with hand bindings winning and global governors
        (≤40% coverage, no adjacent doubles, no repeated doodle). Number-wraps +
        barcode fans ride along. Refresh for a new shuffle.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {draws.map((payload, i) => (
          <div
            key={i}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div style={{ fontSize: 11.5, color: '#333', textAlign: 'center' }}>
              draw {i + 1} · {payload.lines.length} lines
            </div>
            <ReceiptPaper payload={payload} />
          </div>
        ))}
      </div>
    </div>
  );
}

function DoodleGallery({ only }: { only?: number }) {
  const items = only != null && GALLERY[only] ? [GALLERY[only]] : GALLERY;
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — doodle gallery
      </h1>
      <p style={{ fontSize: 12, color: '#555', margin: '0 0 22px' }}>
        Number-wrap doodles (saturn, teal star, rose-pink heart) are placed
        deterministically off the poolId hash: ≈1 row left plain, doodles unique
        per receipt (heart/star never repeat), and saturn the only one that may
        appear twice — and only when all four rows are framed, kept
        non-adjacent.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {items.map((g) => (
          <div
            key={g.label}
            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <div style={{ fontSize: 11.5, color: '#333', textAlign: 'center' }}>
              {g.label}
            </div>
            <ReceiptPaper payload={g.payload} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── UNDERLINE demo — teal + wavy underlines on a real 4-line receipt ─────────
// A clean product-length slip (4 lines) featuring the underline art: the teal
// straight stroke (lr-018 "you", lr-032 "forever"), the freshly extracted wavy
// stroke (lr-156 "more"), plus a math-heart end-mark line for contrast. Reached
// with /g/preview?slug=love-receipt&view=underlines
const UNDERLINE_DEMO_IDS = [
  'lr-018', // teal underline · "you"
  'lr-156', // wavy underline · "more"
  'lr-032', // teal underline · "forever"
  'lr-035', // math-heart end-mark · "you finish my sentences"
];

function UnderlineDemo() {
  const payload = galleryPayload(UNDERLINE_DEMO_IDS);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — underline doodles (4-line)
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 460,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Real product length (4 lines): teal straight underline under
        &quot;you&quot; and &quot;forever&quot;, the new wavy stroke under
        &quot;more&quot;, and a math-heart end-mark line for contrast.
        Number-wraps + barcode fans ride along.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

// ── PRICEWRAP demo — one-word-per-line prices + no mid-word item breaks ──────
// Verifies the price-stacking + minWidth:0 removal on one slip:
//   lr-069 — long "haircut" item + two-word price "impossible request" + ?! end-mark
//            (the mid-letter break regression: HAIRC/UT must render whole now)
//   lr-158 — long item + two-word price "approval fee" with a circle-price ring on
//            APPROVAL (line 1) and FEE plain beneath — ring must not shift
//   lr-005 — single-word circle-price (MINE) sanity: unchanged inline render
//   lr-062 — plain two-word price "trap card" (no mark) stacked
// Reached with /g/preview?slug=love-receipt&view=pricewrap
const PRICEWRAP_IDS = ['lr-069', 'lr-158', 'lr-005', 'lr-062'];

function PriceWrapDemo() {
  const payload = galleryPayload(PRICEWRAP_IDS);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — price stacking + whole-word wrap
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 470,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Multi-word prices stack one word per line (right-aligned), so the price
        column narrows and the item text keeps whole words — no more HAIRC/UT.
        Line 02 (approval fee) keeps its circle-price ring on APPROVAL with FEE
        plain beneath.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

// ── CANDIDATES demo — wired-in doodles NOT in the 6-doodle working set ───────
// Renders each candidate on its own receipt line at true size, self-labelled by
// the doodle id (the item text IS the id; the doodle marks a token of it, or
// trails it for end-marks). Uses ReceiptPaper's preview-only lineDoodleOverride
// so nothing is bound and the resolver is untouched. QTY digits still carry the
// separate number-wrap layer. Reached with /g/preview?slug=love-receipt&view=candidates
const CAND_CIRCLE: { id: string; target: string }[] = [
  { id: 'doodle-peanut-pink', target: 'peanut' },
  { id: 'doodle-ring', target: 'ring' },
  { id: 'doodle-star-yellow', target: 'star' },
  { id: 'doodle-half-oval', target: 'oval' },
  { id: 'doodle-red-heart', target: 'heart' },
  { id: 'doodle-saturn-ring', target: 'saturn' },
];
const CAND_UNDERLINE: { id: string; target: string }[] = [
  { id: 'doodle-zigzag-blue', target: 'zigzag' },
  { id: 'doodle-dashes-lavender', target: 'dashes' },
];
const CAND_ENDMARK: string[] = [
  'doodle-pink-heart',
  'doodle-question-mark',
  'doodle-single-exclaim',
  'doodle-multi-exclaim',
  'doodle-sparkle',
];

function candidatesPayload(
  lines: { text: string; price: string }[],
): ReceiptPayload {
  const frame = buildFrame({ recipientName: 'Anshika', senderName: 'Bhumin' });
  return {
    version: 1,
    language: 'en',
    recipientName: 'Anshika',
    senderName: 'Bhumin',
    relationship: 'girlfriend',
    storeName: frame.storeName,
    subtitle: frame.subtitle,
    receiptLabel: frame.receiptLabel,
    dateLabel: formatReceiptDate(),
    cashier: frame.cashier,
    billedTo: frame.billedTo,
    billNumber: frame.billNumber,
    gstin: frame.gstin,
    lines: lines.map((l, i) => ({ id: `c${i}`, text: l.text, price: l.price })),
    subtotal: frame.subtotal,
    discount: frame.discount,
    tax: frame.tax,
    total: frame.total,
    paidVia: frame.paidVia,
    finePrint: frame.finePrint,
    returnPolicy: frame.returnPolicy,
    scanLine: frame.scanLine,
    footer: frame.footer,
    memeStamp: frame.stamp,
  };
}

function CandidateCard({
  heading,
  lines,
  override,
}: {
  heading: string;
  lines: { text: string; price: string }[];
  override: (ResolvedDoodle | null)[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12.5, color: '#333', textAlign: 'center' }}>
        {heading}
      </div>
      <ReceiptPaper
        payload={candidatesPayload(lines)}
        lineDoodleOverride={override}
      />
    </div>
  );
}

function CandidatesDemo() {
  const circleLines = CAND_CIRCLE.map((c) => ({ text: c.id, price: 'circle' }));
  const circleOverride: (ResolvedDoodle | null)[] = CAND_CIRCLE.map((c) => ({
    doodleId: c.id,
    anchor: 'circle-word',
    target: c.target,
    scale: 1,
    rotation: 0,
  }));
  const ulLines = CAND_UNDERLINE.map((c) => ({
    text: c.id,
    price: 'underline',
  }));
  const ulOverride: (ResolvedDoodle | null)[] = CAND_UNDERLINE.map((c) => ({
    doodleId: c.id,
    anchor: 'underline',
    target: c.target,
    scale: 1,
    rotation: 0,
  }));
  const endLines = CAND_ENDMARK.map((id) => ({ text: id, price: 'end' }));
  const endOverride: (ResolvedDoodle | null)[] = CAND_ENDMARK.map((id) => ({
    doodleId: id,
    anchor: 'punctuate-after',
    scale: 1,
    rotation: 0,
  }));
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <h1
        style={{
          fontSize: 16,
          margin: '0 0 4px',
          color: '#1a1a1a',
          textAlign: 'center',
        }}
      >
        Love Receipt — doodle candidates (not yet in the working set)
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 auto 22px',
          maxWidth: 520,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Each item line IS the doodle id, rendered at true receipt size: circle
        candidates ring a token of the id, underline candidates sit under one,
        and end-mark candidates trail the id. Judge legibility small. (QTY
        digits carry the usual number-wrap layer — ignore those.)
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 28,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <CandidateCard
          heading="circle-word / circle-price (6)"
          lines={circleLines}
          override={circleOverride}
        />
        <CandidateCard
          heading="underline (2)"
          lines={ulLines}
          override={ulOverride}
        />
        <CandidateCard
          heading="end-mark (5)"
          lines={endLines}
          override={endOverride}
        />
      </div>
    </div>
  );
}

// ── SECTION passes — one whole tone section per slip for review ──────────────
// Renders every line of a tone section as real receipt lines, so a section's
// hand bindings can be eyeballed together on a phone. Hand bindings always
// render (PASS 1 of resolveReceiptDoodles), so the coverage cap never hides one.
// PETTY (5 lines): reached with /g/preview?slug=love-receipt&view=petty
const PETTY_IDS = ['lr-001', 'lr-045', 'lr-062', 'lr-068', 'lr-072'];
// prettier-ignore
const GIGGLE_IDS = [
  'lr-003', 'lr-008', 'lr-023', 'lr-033', 'lr-035', 'lr-039', 'lr-044',
  'lr-050', 'lr-056', 'lr-057', 'lr-060', 'lr-069', 'lr-071', 'lr-073',
  'lr-074', 'lr-096', 'lr-100', 'lr-101', 'lr-144', 'lr-150', 'lr-151',
  'lr-152', 'lr-153', 'lr-154', 'lr-155', 'lr-156', 'lr-158',
];
// prettier-ignore
const DELULU_IDS = [
  'lr-002', 'lr-058', 'lr-059', 'lr-061', 'lr-063', 'lr-064', 'lr-065',
  'lr-075', 'lr-078', 'lr-080', 'lr-088', 'lr-149', 'lr-168', 'lr-169',
];
// prettier-ignore
const TENDER_IDS = [
  'lr-018', 'lr-019', 'lr-025', 'lr-028', 'lr-032', 'lr-047', 'lr-048',
  'lr-049', 'lr-051', 'lr-067', 'lr-081', 'lr-083', 'lr-157', 'lr-159',
  'lr-160', 'lr-163', 'lr-164', 'lr-165', 'lr-166', 'lr-167',
];
// prettier-ignore
const REALLIFE_IDS = [
  'lr-011', 'lr-013', 'lr-014', 'lr-015', 'lr-027', 'lr-040', 'lr-041',
  'lr-052', 'lr-053', 'lr-054', 'lr-091', 'lr-093', 'lr-143', 'lr-145',
  'lr-146', 'lr-148', 'lr-161',
];
// prettier-ignore
const ALMOST_IDS = [
  'lr-004', 'lr-084', 'lr-085', 'lr-086', 'lr-087', 'lr-099', 'lr-147',
];

function SectionDemo({ title, ids }: { title: string; ids: string[] }) {
  const payload = galleryPayload(ids);
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 80px',
        fontFamily: 'ui-monospace, monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 4px', color: '#1a1a1a' }}>
        Love Receipt — {title}
      </h1>
      <p
        style={{
          fontSize: 12,
          color: '#555',
          margin: '0 0 22px',
          maxWidth: 460,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Every line in this tone section, rendered as real receipt lines with its
        actual hand binding (circle / underline / end-mark). The QTY number-wrap
        layer + barcode fans ride along automatically — ignore those.
      </p>
      <ReceiptPaper payload={payload} />
    </div>
  );
}

// ── HEADER-COMPARE — five DELULU MART header treatments, stacked ────────────
// EXPLORATORY preview only. Same receipt fragment under five different header
// treatments (A–E) so a direction can be picked on the phone. Nothing here is
// wired into the real receipt. This gift is Language A (mono / thermal-receipt /
// Y2K family): treatments C stay pure A; D (handwritten Caveat) is Language B;
// E (feathered band) mildly softens the A boundary. Both flagged inline.
// Reached with /g/preview?slug=love-receipt&view=headercompare
function HeaderCompare() {
  const PAPER = '#fbfbf9';
  const INK = '#1a1a1a';
  const INK_SOFT = 'rgba(26, 26, 26, 0.58)';
  const BAND = '#c3c8ee'; // current periwinkle band
  const HEADER_FONT =
    "var(--font-archivo-black), 'Arial Black', Helvetica, Arial, sans-serif";
  const MONO =
    "var(--font-space-mono), ui-monospace, 'Courier New', Courier, monospace";
  const STORE = 'DELULU MART';
  const SUB = 'est. the day i met anshika';
  const PAD = 18;

  const storeStyle: CSSProperties = {
    fontFamily: HEADER_FONT,
    fontWeight: 900,
    fontSize: 28,
    lineHeight: 1.02,
    letterSpacing: '-0.5px',
    textTransform: 'uppercase',
    color: INK,
  };
  const subStyle: CSSProperties = {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: INK_SOFT,
    marginTop: 6,
  };

  // A representative slice of receipt body so each header reads IN CONTEXT.
  const bodyRows: [string, string, string][] = [
    ['01', 'your hoodie (not returning)', 'kept'],
    ['02', '47× futures i planned w u', 'EMI'],
    ['03', 'the audacity to look this good', 'santoor tax'],
  ];
  const Body = () => (
    <div style={{ fontFamily: MONO, fontSize: 11, color: INK, marginTop: 12 }}>
      <div
        style={{ borderTop: `1px dashed ${INK_SOFT}`, margin: '0 0 8px' }}
        aria-hidden
      />
      {bodyRows.map(([q, item, price]) => (
        <div
          key={q}
          style={{ display: 'flex', gap: 8, lineHeight: 1.9, opacity: 0.92 }}
        >
          <span style={{ color: INK_SOFT }}>{q}</span>
          <span style={{ flex: 1 }}>{item}</span>
          <span>{price}</span>
        </div>
      ))}
      <div
        style={{ borderTop: `1px dashed ${INK_SOFT}`, margin: '8px 0' }}
        aria-hidden
      />
      <div style={{ display: 'flex', fontWeight: 700 }}>
        <span style={{ flex: 1 }}>TOTAL</span>
        <span>priceless</span>
      </div>
    </div>
  );

  const doodle = (src: string, size: number, flip = false) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/stickers/doodles/${src}`}
      alt=""
      style={{
        height: size,
        width: 'auto',
        transform: flip ? 'scaleX(-1)' : undefined,
        opacity: 0.9,
      }}
    />
  );

  // ── the five header treatments ────────────────────────────────────────────
  const headers: {
    key: string;
    title: string;
    note?: string;
    el: JSX.Element;
  }[] = [
    {
      key: 'A',
      title: 'CURRENT — solid periwinkle band',
      el: (
        <div
          style={{
            background: BAND,
            margin: `-${PAD}px -${PAD}px 0`,
            padding: `18px ${PAD}px 14px`,
            textAlign: 'center',
          }}
        >
          <div style={storeStyle}>{STORE}</div>
          <div style={subStyle}>{SUB}</div>
        </div>
      ),
    },
    {
      key: 'B',
      title: 'NO BAND — bare paper + small doodle accents',
      el: (
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              marginBottom: 6,
            }}
          >
            {doodle('doodle-star-teal-bold.png', 13)}
            {doodle('doodle-heart-candy.png', 15)}
            {doodle('doodle-star-coral-bold.png', 13)}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {doodle('doodle-sparkle.png', 18)}
            <div style={storeStyle}>{STORE}</div>
            {doodle('doodle-sparkle.png', 18, true)}
          </div>
          <div style={subStyle}>{SUB}</div>
        </div>
      ),
    },
    {
      key: 'C',
      title: 'PRINTED-RECEIPT — thermal rules, monospace',
      el: (
        <div style={{ textAlign: 'center', paddingTop: 2 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 13,
              color: INK,
              letterSpacing: 2,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {'═'.repeat(48)}
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: INK,
              margin: '8px 0 2px',
            }}
          >
            {STORE}
          </div>
          <div style={{ ...subStyle, marginTop: 2 }}>{`* ${SUB} *`}</div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 13,
              color: INK,
              letterSpacing: 2,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              marginTop: 8,
            }}
          >
            {'═'.repeat(48)}
          </div>
        </div>
      ),
    },
    {
      key: 'D',
      title: 'HANDCRAFTED WORDMARK — handwritten Caveat',
      note: '⚠ LANGUAGE B — Caveat is the B handwritten signal (design-system rule #2). Clashes with this mono / thermal-receipt Language-A gift.',
      el: (
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <div
            style={{
              fontFamily: "var(--font-caveat), 'Segoe Script', cursive",
              fontWeight: 700,
              fontSize: 46,
              lineHeight: 1,
              color: '#6b4a5a',
            }}
          >
            Delulu Mart
          </div>
          <div style={{ ...subStyle, marginTop: 4 }}>{SUB}</div>
        </div>
      ),
    },
    {
      key: 'E',
      title: 'SOFTENED BAND — pale textured wash, feathered edge',
      note: '⚠ MILD DRIFT — the feathered/soft bottom edge is a Language-B softness cue. Keep the wash hard-edged to stay in A.',
      el: (
        <div
          style={{
            margin: `-${PAD}px -${PAD}px 0`,
            padding: `18px ${PAD}px 20px`,
            textAlign: 'center',
            backgroundImage: `linear-gradient(180deg, ${BAND}cc 0%, ${BAND}99 45%, ${BAND}00 100%), repeating-linear-gradient(90deg, #ffffff22 0 2px, #00000000 2px 4px)`,
          }}
        >
          <div style={storeStyle}>{STORE}</div>
          <div style={subStyle}>{SUB}</div>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#e7e2d8',
        padding: '24px 14px 90px',
        fontFamily: MONO,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <h1 style={{ fontSize: 16, margin: '0 0 6px', color: '#1a1a1a' }}>
          Love Receipt — DELULU MART header options
        </h1>
        <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.5 }}>
          Same receipt fragment, five header treatments. This gift is Language A
          (mono / thermal-receipt). ⚠ marks a treatment that drifts to Language
          B. Pick by letter.
        </p>
      </div>

      {headers.map((h) => (
        <div key={h.key} style={{ width: '100%', maxWidth: 340 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 13,
                color: '#fff',
                background: '#1a1a1a',
                borderRadius: 5,
                padding: '2px 9px',
              }}
            >
              {h.key}
            </span>
            <span style={{ fontSize: 12, color: '#333' }}>{h.title}</span>
          </div>
          {h.note ? (
            <p
              style={{
                fontSize: 10.5,
                color: '#8a2b2b',
                margin: '0 0 8px',
                lineHeight: 1.45,
              }}
            >
              {h.note}
            </p>
          ) : null}
          <div
            style={{
              background: PAPER,
              padding: PAD,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 1px 0 #00000010',
              border: '1px solid #00000010',
            }}
          >
            {h.el}
            <Body />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GiftPreviewPage({
  searchParams,
}: {
  searchParams: { slug?: string; view?: string; only?: string };
}) {
  // Hide only on the production deployment. On Vercel, VERCEL_ENV is
  // 'production' | 'preview' | 'development'; it's undefined locally. So this
  // stays available on localhost and branch previews, and 404s only in prod.
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }

  const slug = searchParams.slug ?? 'tiffin-note';

  // Multi-receipt doodle gallery (dev aid): /g/preview?slug=love-receipt&view=gallery
  if (slug === 'love-receipt' && searchParams.view === 'gallery') {
    const only =
      searchParams.only != null ? Number(searchParams.only) : undefined;
    return <DoodleGallery only={Number.isNaN(only) ? undefined : only} />;
  }

  // LINE_BINDINGS demo — the oval + underline pass on one receipt:
  // /g/preview?slug=love-receipt&view=bindings
  if (slug === 'love-receipt' && searchParams.view === 'bindings') {
    return <BindingsDemo />;
  }

  // Underline demo — teal + wavy underlines on a real 4-line receipt:
  // /g/preview?slug=love-receipt&view=underlines
  if (slug === 'love-receipt' && searchParams.view === 'underlines') {
    return <UnderlineDemo />;
  }

  // End-mark pass demo — punctuate-after (?! / <3 / rays):
  // /g/preview?slug=love-receipt&view=endmarks
  if (slug === 'love-receipt' && searchParams.view === 'endmarks') {
    return <EndMarkDemo />;
  }

  // Price-stacking + whole-word wrap demo:
  // /g/preview?slug=love-receipt&view=pricewrap
  if (slug === 'love-receipt' && searchParams.view === 'pricewrap') {
    return <PriceWrapDemo />;
  }

  // Doodle candidates demo — wired-in doodles not yet in the working set:
  // /g/preview?slug=love-receipt&view=candidates
  if (slug === 'love-receipt' && searchParams.view === 'candidates') {
    return <CandidatesDemo />;
  }

  // REAL shuffled draws — the actual engine, all bindings mixed naturally:
  // /g/preview?slug=love-receipt&view=real
  if (slug === 'love-receipt' && searchParams.view === 'real') {
    return <RealDraws />;
  }

  // HEADERCOMPARE (exploratory) — five DELULU MART header treatments:
  // /g/preview?slug=love-receipt&view=headercompare
  if (slug === 'love-receipt' && searchParams.view === 'headercompare') {
    return <HeaderCompare />;
  }

  // SHOWCASE — every in-context doodle on one receipt:
  // /g/preview?slug=love-receipt&view=showcase
  if (slug === 'love-receipt' && searchParams.view === 'showcase') {
    return <ShowcaseDemo />;
  }

  // HEARTS — a receipt where every line ends in the math-heart <3:
  // /g/preview?slug=love-receipt&view=hearts
  if (slug === 'love-receipt' && searchParams.view === 'hearts') {
    return <HeartDemo />;
  }

  // STANDARD — the real 4-line receipt length, with the math-heart present:
  // /g/preview?slug=love-receipt&view=standard
  if (slug === 'love-receipt' && searchParams.view === 'standard') {
    return <StandardDemo />;
  }

  // SECTION passes — one whole tone section per slip:
  // /g/preview?slug=love-receipt&view=petty
  if (slug === 'love-receipt' && searchParams.view === 'petty') {
    return <SectionDemo title="petty section (5 lines)" ids={PETTY_IDS} />;
  }
  if (slug === 'love-receipt' && searchParams.view === 'giggle') {
    return <SectionDemo title="giggle section (27 lines)" ids={GIGGLE_IDS} />;
  }
  if (slug === 'love-receipt' && searchParams.view === 'delulu') {
    return <SectionDemo title="delulu section (14 lines)" ids={DELULU_IDS} />;
  }
  if (slug === 'love-receipt' && searchParams.view === 'tender') {
    return <SectionDemo title="tender section (20 lines)" ids={TENDER_IDS} />;
  }
  if (slug === 'love-receipt' && searchParams.view === 'reallife') {
    return (
      <SectionDemo title="real-life section (17 lines)" ids={REALLIFE_IDS} />
    );
  }
  if (slug === 'love-receipt' && searchParams.view === 'almost') {
    return (
      <SectionDemo title="almost-moment section (7 lines)" ids={ALMOST_IDS} />
    );
  }
  const makeMock = MOCKS[slug];
  const definition = getGiftDefinition(slug);
  if (!makeMock || !definition) {
    notFound();
  }

  const gift = makeMock();
  const Receiver = definition.ReceiverComponent;

  return (
    <GiftFrame
      gift={gift}
      replayBehavior={definition.replayBehavior}
      anticipationMs={0}
      hideDefaultPostGiftCta={definition.ownsPostGiftCta ?? false}
    >
      <Receiver gift={gift} />
    </GiftFrame>
  );
}
