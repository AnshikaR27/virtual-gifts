import { notFound } from 'next/navigation';
import { GiftFrame } from '@/components/gift-frame/gift-frame';
import { getGiftDefinition } from '@/gifts/registry';
import type { GiftData } from '@/components/gift-frame/gift-frame';

/**
 * Preview of the tiffin-note receiver with mock data, so the scene can be
 * eyeballed without Supabase. A static `preview` segment takes precedence over
 * the sibling dynamic `[shortId]` route, so the real /g/<id> path is untouched.
 *
 * Available on localhost and on Vercel *preview* deploys; 404s only on the
 * production deployment (gated by VERCEL_ENV). So:
 *   http://localhost:3000/g/preview
 *   https://<branch-preview>.vercel.app/g/preview
 */

// Always render at request time so the env guard is honored.
export const dynamic = 'force-dynamic';

const MOCK_GIFT: GiftData = {
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

export default function GiftPreviewPage() {
  // Hide only on the production deployment. On Vercel, VERCEL_ENV is
  // 'production' | 'preview' | 'development'; it's undefined locally. So this
  // stays available on localhost and branch previews, and 404s only in prod.
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }

  const definition = getGiftDefinition(MOCK_GIFT.slug);
  if (!definition) {
    notFound();
  }

  const Receiver = definition.ReceiverComponent;

  return (
    <GiftFrame
      gift={MOCK_GIFT}
      replayBehavior={definition.replayBehavior}
      anticipationMs={0}
      hideDefaultPostGiftCta={definition.ownsPostGiftCta ?? false}
    >
      <Receiver gift={MOCK_GIFT} />
    </GiftFrame>
  );
}
