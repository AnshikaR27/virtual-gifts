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
  const scaffold = buildScaffold('hinglish', 'Anaya', 'Rohan');
  const payload: ReceiptPayload = {
    version: 1,
    language: 'hinglish',
    recipientName: 'Anaya',
    senderName: 'Rohan',
    relationship: 'girlfriend',
    storeName: scaffold.storeName,
    subtitle: scaffold.subtitle,
    receiptLabel: scaffold.receiptLabel,
    dateLabel: formatReceiptDate(),
    cashier: scaffold.cashier,
    billNumber: scaffold.billNumber,
    lines: [
      {
        id: 'a',
        text: 'the way you say mera naam, I’m unwell',
        price: 'priceless',
      },
      { id: 'b', text: 'teri hassi has me in a chokehold fr', price: '₹∞' },
      {
        id: 'c',
        text: 'you live rent free in my dimaag 24/7',
        price: '₹0 (no eviction)',
      },
      {
        id: 'd',
        text: 'bada wala piece always mujhe?? marry me',
        price: 'priceless',
      },
      {
        id: 'e',
        text: 'spiders maar dena so I keep my brave-girl arc',
        price: 'invaluable',
      },
    ],
    subtotal: scaffold.subtotal,
    discount: scaffold.discount,
    tax: scaffold.tax,
    total: 'everything I have + thoda extra 🥹',
    paidVia: scaffold.paidVia,
    finePrint: scaffold.finePrint,
    scanLine: scaffold.scanLine,
    footer: scaffold.footer,
    memeStamp: 'CERTIFIED DELULU',
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
