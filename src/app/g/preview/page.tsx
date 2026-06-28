import { notFound } from 'next/navigation';
import { GiftFrame } from '@/components/gift-frame/gift-frame';
import { getGiftDefinition } from '@/gifts/registry';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import {
  buildFrame,
  formatReceiptDate,
  type ReceiptPayload,
} from '@/gifts/love-receipt/lines';
import { LOVE_RECEIPT_POOL } from '@/gifts/love-receipt/love-receipt-pool';
import { ReceiptPaper } from '@/gifts/love-receipt/receipt-paper';

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
  senderName: 'Rohan',
  recipientName: 'Anaya',
  contentJsonb: {
    top_dabba: 'Gulab Jamun',
    middle_dabba: 'Mathri',
    note_text: 'khaana time pe khaa lena.\nmiss u 💌',
    sender_name: 'Rohan',
    recipient_name: 'Anaya',
  },
  paid: false,
};

function loveReceiptMock(): GiftData {
  const frame = buildFrame({ recipientName: 'Anaya', senderName: 'Rohan' });
  const payload: ReceiptPayload = {
    version: 1,
    language: 'en',
    recipientName: 'Anaya',
    senderName: 'Rohan',
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
    senderName: 'Rohan',
    recipientName: 'Anaya',
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
  const frame = buildFrame({ recipientName: 'Anaya', senderName: 'Rohan' });
  const lines = poolIds.map((poolId, i) => {
    const src = POOL_BY_ID.get(poolId);
    const text = marks[poolId] ?? src?.text ?? `line ${i + 1}`;
    return { id: `g${i}`, poolId, text, price: src?.price ?? 'priceless' };
  });
  return {
    version: 1,
    language: 'en',
    recipientName: 'Anaya',
    senderName: 'Rohan',
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
];

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
