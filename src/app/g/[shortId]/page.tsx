import { createAdminClient } from '@/lib/supabase/admin';
import { GiftFrame } from '@/components/gift-frame/gift-frame';
import { PlaceholderGift } from '@/components/gift-frame/placeholder-gift';
import type { ReplayBehavior } from '@/types';

export default async function RecipientViewPage({
  params,
}: {
  params: { shortId: string };
}) {
  const supabase = createAdminClient();

  const { data: gift, error } = await supabase
    .from('gifts')
    .select(
      'id, short_id, slug, sender_name, recipient_name, content_jsonb, paid, status',
    )
    .eq('short_id', params.shortId)
    .single();

  if (error || !gift) {
    return (
      <div className="bg-hero-gradient flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-3xl font-bold text-foreground">
          This gift doesn&apos;t exist
        </p>
        <p className="mt-3 font-handwritten text-lg text-muted-foreground">
          It may have expired or the link might be wrong
        </p>
      </div>
    );
  }

  const giftData = {
    id: gift.id,
    shortId: gift.short_id,
    slug: gift.slug,
    senderName: gift.sender_name,
    recipientName: gift.recipient_name,
    contentJsonb: (gift.content_jsonb ?? {}) as Record<string, unknown>,
    paid: gift.paid,
  };

  const replayBehavior: ReplayBehavior = 'replayable';

  return (
    <GiftFrame gift={giftData} replayBehavior={replayBehavior}>
      <PlaceholderGift recipientName={gift.recipient_name} />
    </GiftFrame>
  );
}
