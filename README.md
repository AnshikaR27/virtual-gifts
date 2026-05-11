# HoneyHearts

A web platform where someone spends 30 seconds to 5 minutes crafting an interactive animated gift, sends a WhatsApp link, and the recipient opens an experience that makes them screenshot it for their story. Smart prompts guide creators to write messages that truly land — no blank text boxes.

**Production URL:** https://honeyhearts.com

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS v3 + shadcn/ui
- **Animation:** Framer Motion (core) + Lottie & GSAP (lazy-loaded per-gift)
- **State:** Zustand
- **Backend:** Supabase (Postgres + Auth + Storage + Realtime)
- **Payments:** Razorpay (UPI, cards, wallets)
- **i18n:** next-intl (English + Hindi)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env vars and fill in your values
cp .env.local.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder Structure

```
src/
├── app/              Next.js App Router pages and layouts
├── components/       React components
│   ├── ui/           shadcn/ui primitives
│   ├── gift-frame/   GiftFrame runtime (Phase 0.3)
│   ├── prompt-input/ Smart Prompt component (Phase 0.4)
│   └── layout/       Header, Footer
├── lib/              Utilities, integrations, constants
│   └── supabase/     Supabase client + types
├── gifts/            Gift implementations + registry
├── prompts/          Smart Prompt definitions per gift
├── types/            App-level TypeScript types
└── i18n/             Internationalization config + messages
```

## Plan

See [assets/plan.md](./assets/plan.md) for the full implementation plan.
