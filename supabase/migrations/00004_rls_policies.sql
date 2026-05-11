-- Migration 4: Row Level Security
--
-- Model: authenticated users access their own data via RLS.
-- Recipient-facing operations (views, interactions, reactions) go through
-- API routes using the service role, which bypasses RLS.
-- prompt_inspirations: service role only — no client policies.

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_inspirations ENABLE ROW LEVEL SECURITY;

-- users: own row only
CREATE POLICY users_select_own ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY users_update_own ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- gifts: creator CRUD
CREATE POLICY gifts_select_own ON public.gifts
  FOR SELECT TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY gifts_insert_own ON public.gifts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY gifts_update_own ON public.gifts
  FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY gifts_delete_own ON public.gifts
  FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

-- gift_views: creator can read analytics for their gifts
CREATE POLICY gift_views_select_own ON public.gift_views
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gifts
    WHERE gifts.id = gift_views.gift_id
      AND gifts.creator_id = auth.uid()
  ));

-- interactions: creator can read for their gifts
CREATE POLICY interactions_select_own ON public.interactions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gifts
    WHERE gifts.id = interactions.gift_id
      AND gifts.creator_id = auth.uid()
  ));

-- reactions: creator can read for their gifts
CREATE POLICY reactions_select_own ON public.reactions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gifts
    WHERE gifts.id = reactions.gift_id
      AND gifts.creator_id = auth.uid()
  ));

-- subscriptions: own row only
CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
