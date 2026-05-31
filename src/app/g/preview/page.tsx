import { notFound } from 'next/navigation';
import { GiftFrame } from '@/components/gift-frame/gift-frame';
import { getGiftDefinition } from '@/gifts/registry';
import type { GiftData } from '@/components/gift-frame/gift-frame';

/**
 * DEV-ONLY preview of the tiffin-note receiver with mock data, so the scene can
 * be eyeballed without Supabase. A static `preview` segment takes precedence
 * over the sibling dynamic `[shortId]` route, so the real /g/<id> path is
 * untouched. Returns 404 in production.
 *
 *   http://localhost:3000/g/preview
 */

// Always render at request time so the NODE_ENV guard is honored.
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
  if (process.env.NODE_ENV === 'production') {
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
