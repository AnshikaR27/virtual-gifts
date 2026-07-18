'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { generateShortId } from '@/lib/short-id';
import { FREE_GIFT_EXPIRY_DAYS } from '@/lib/constants';
import type { InsertDto, Json } from '@/lib/supabase/types';
import type { ReceiptPayload } from './lines';

/**
 * Persists a Love Receipt gift and returns its short id.
 *
 * The whole receipt lives in `gifts.content_jsonb` (no schema change), mirroring
 * the tiffin-note pattern. Phase 0 gifts are anonymous (creator_id NULL — see
 * 00005_nullable_creator.sql). The caller redirects to the wa.me share link.
 */
export async function createLoveReceipt(
  payload: ReceiptPayload,
): Promise<{ shortId: string }> {
  const recipientName = payload.recipientName.trim();
  if (!recipientName) {
    throw new Error('Recipient name is required');
  }
  if (!payload.lines.length) {
    throw new Error('Add at least one line to the receipt');
  }

  const shortId = generateShortId();
  const expiresAt = new Date(
    Date.now() + FREE_GIFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const row: InsertDto<'gifts'> = {
    short_id: shortId,
    creator_id: null,
    slug: 'love-receipt',
    sender_name: payload.senderName.trim() || null,
    recipient_name: recipientName,
    content_jsonb: payload as unknown as Json,
    status: 'sent',
    paid: false,
    expires_at: expiresAt,
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('gifts')
    .insert(row)
    .select('short_id')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create gift');
  }

  return { shortId: data.short_id };
}
