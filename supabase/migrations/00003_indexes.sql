-- Migration 3: Explicit indexes

-- Unique indexes for lookup columns (enforces uniqueness + provides btree)
CREATE UNIQUE INDEX idx_gifts_short_id
  ON public.gifts USING btree (short_id);

CREATE UNIQUE INDEX idx_subscriptions_razorpay_sub_id
  ON public.subscriptions USING btree (razorpay_sub_id);

-- Composite index for dashboard "recent activity" queries
CREATE INDEX idx_interactions_gift_created
  ON public.interactions USING btree (gift_id, created_at DESC);

-- Gift views by gift for analytics
CREATE INDEX idx_gift_views_gift_id
  ON public.gift_views USING btree (gift_id);

-- Gifts by creator for dashboard listing
CREATE INDEX idx_gifts_creator_id
  ON public.gifts USING btree (creator_id);

-- Subscriptions by user
CREATE INDEX idx_subscriptions_user_id
  ON public.subscriptions USING btree (user_id);

-- Prompt inspirations by gift slug for creation flow
CREATE INDEX idx_prompt_inspirations_gift_slug
  ON public.prompt_inspirations USING btree (gift_slug);
