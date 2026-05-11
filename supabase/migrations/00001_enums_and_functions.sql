-- Migration 1: Enums and functions
--
-- Gift status state machine:
--   Free:  draft → sent → archived
--   Paid:  draft → paid → sent (no archive — paid gifts persist)

CREATE TYPE public.gift_status AS ENUM ('draft', 'paid', 'sent', 'archived');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'expired');

-- Portable updated_at trigger (no moddatetime extension needed)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sync new auth.users rows into public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name'
    )
  );
  RETURN NEW;
END;
$$;
