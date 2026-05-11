-- Migration 2: Core tables

CREATE TABLE public.users (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  name        text,
  phone       text,
  locale      text        NOT NULL DEFAULT 'en',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.gifts (
  id              uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id        text               NOT NULL,
  creator_id      uuid               NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug            text               NOT NULL,
  sender_name     text,
  recipient_name  text               NOT NULL,
  content_jsonb   jsonb              NOT NULL DEFAULT '{}',
  status          public.gift_status NOT NULL DEFAULT 'draft',
  paid            boolean            NOT NULL DEFAULT false,
  expires_at      timestamptz,
  created_at      timestamptz        NOT NULL DEFAULT now(),
  updated_at      timestamptz        NOT NULL DEFAULT now()
);

CREATE TABLE public.gift_views (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id          uuid        NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  viewed_at        timestamptz NOT NULL DEFAULT now(),
  device_info      jsonb,
  view_duration_ms integer
);

CREATE TABLE public.interactions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id    uuid        NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  type       text        NOT NULL,
  value      jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reactions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id           uuid        NOT NULL REFERENCES public.gifts(id) ON DELETE CASCADE,
  image_url         text,
  video_url         text,
  recipient_consent boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id              uuid                       PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid                       NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan            text                       NOT NULL,
  status          public.subscription_status NOT NULL DEFAULT 'active',
  razorpay_sub_id text,
  started_at      timestamptz                NOT NULL DEFAULT now(),
  expires_at      timestamptz                NOT NULL
);

CREATE TABLE public.prompt_inspirations (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_slug          text        NOT NULL,
  prompt_id          text        NOT NULL,
  anonymous_response text        NOT NULL,
  public_consent     boolean     NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now()
);

-- updated_at triggers
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_gifts_updated_at
  BEFORE UPDATE ON public.gifts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Sync auth.users → public.users on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
