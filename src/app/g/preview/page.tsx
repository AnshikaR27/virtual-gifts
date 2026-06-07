import { notFound } from 'next/navigation';
import { GiftFrame } from '@/components/gift-frame/gift-frame';
import { getGiftDefinition } from '@/gifts/registry';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import {
  buildScaffold,
  formatReceiptDate,
  type ReceiptPayload,
} from '@/gifts/love-receipt/lines';

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
  const frame = buildScaffold();
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
    billNumber: frame.billNumber,
    gstin: frame.gstin,
    lines: [
      { id: 'a', text: 'your hoodie (im NOT returning)', price: 'kept' },
      { id: 'b', text: '47× futures i planned w u', price: 'EMI' },
      { id: 'c', text: '100 arguments i won in the shower', price: 'champ' },
      { id: 'd', text: 'you asked "khaana khaya?"', price: '∞' },
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

export default function GiftPreviewPage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  // Hide only on the production deployment. On Vercel, VERCEL_ENV is
  // 'production' | 'preview' | 'development'; it's undefined locally. So this
  // stays available on localhost and branch previews, and 404s only in prod.
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }

  const slug = searchParams.slug ?? 'tiffin-note';
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
