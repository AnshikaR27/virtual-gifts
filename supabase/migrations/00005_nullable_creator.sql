-- Migration 5: Allow anonymous gift creators (Phase 0)
--
-- Phase 0 has no auth yet, so the sender flow creates gifts anonymously.
-- The gifts.creator_id FK to public.users still stands, but we drop NOT NULL
-- so anonymous gifts can be inserted with creator_id = NULL (a random UUID
-- has no matching users row and was failing the FK with error 23503).
--
-- REVISIT when auth lands: backfill/associate anonymous gifts with the
-- authenticated creator and consider restoring NOT NULL. See the note in
-- src/gifts/tiffin-note/actions.ts and the gifts RLS policies in
-- 00004_rls_policies.sql (auth.uid() = creator_id), which simply never match
-- a NULL creator — anonymous gifts are reached via the service role only.

ALTER TABLE public.gifts ALTER COLUMN creator_id DROP NOT NULL;
