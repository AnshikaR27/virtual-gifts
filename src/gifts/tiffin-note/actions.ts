'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { generateShortId } from '@/lib/short-id';
import { FREE_GIFT_EXPIRY_DAYS } from '@/lib/constants';
import type { InsertDto } from '@/lib/supabase/types';

export interface CreateTiffinNoteInput {
  recipientName: string;
  senderName: string;
  topDabba: string;
  middleDabba: string;
  noteText: string;
}

/**
 * Writes a Tiffin Note gift row to Supabase and returns its short id.
 *
 * Content lives entirely in the existing `gifts.content_jsonb` column — no
 * schema change. The caller (sender flow) awaits this, then redirects to the
 * wa.me link built from the returned shortId. Future gifts follow this shape.
 */
export async function createTiffinNote(
  input: CreateTiffinNoteInput,
): Promise<{ shortId: string }> {
  const recipientName = input.recipientName.trim();
  if (!recipientName) {
    throw new Error('Recipient name is required');
  }

  const shortId = generateShortId();
  const expiresAt = new Date(
    Date.now() + FREE_GIFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const row: InsertDto<'gifts'> = {
    short_id: shortId,
    // Phase 0: no auth yet — gifts are created anonymously (creator_id NULL).
    // The gifts.creator_id FK to users IS enforced by the DB, so a random
    // UUID fails it (error 23503); 00005_nullable_creator.sql drops NOT NULL.
    // REVISIT when auth lands: associate the gift with the authenticated user
    // and consider restoring NOT NULL on gifts.creator_id.
    creator_id: null,
    slug: 'tiffin-note',
    sender_name: input.senderName.trim() || null,
    recipient_name: recipientName,
    content_jsonb: {
      top_dabba: input.topDabba,
      middle_dabba: input.middleDabba,
      note_text: input.noteText.trim(),
      recipient_name: recipientName,
      sender_name: input.senderName.trim(),
    },
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
