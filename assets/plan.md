# Implementation Plan — Interactive Digital Love Gifts Platform

> Phased build plan based on **Product Bible v2.0**. ~88 experiences across 5 tiers, smart-prompt differentiator, single-app architecture, MyHeartCraft-inspired warm UI.

---

## 1. North Star

**One sentence:** A web platform where someone spends 30 seconds to 5 minutes crafting an interactive animated gift, sends a WhatsApp link, and the recipient opens an experience that makes them screenshot it for their story.

**The thesis (from Bible Part 1):**

> _Cute animation × Smart prompt = Personal experience_

Cute gets them in. Prompts get the real stuff out. The combination is what makes someone feel like the most loved person on earth.

**The one rule that overrides everything:** First experience quality. If a font doesn't load, an animation stutters, or a layout breaks — that recipient is gone forever. You get one shot per recipient.

---

## 2. Strategic Positioning vs MyHeartCraft

|                   | **Us**                              | **MyHeartCraft**            |
| ----------------- | ----------------------------------- | --------------------------- |
| Experiences       | 88+ across 5 tiers                  | 5                           |
| Price (paid)      | ₹49 / ₹149 living                   | ₹199 flat                   |
| Free tier         | Yes (Quick Notes + Mini Games)      | None                        |
| Smart prompts     | Guided per gift                     | Generic text boxes          |
| Architecture      | **Single app, routes**              | Subdomains (fragmented SEO) |
| Couple/2-player   | Yes                                 | None                        |
| Living gifts      | 365 Jar, Growing Garden             | None                        |
| Reaction tracking | Engagement-style ("shook 14 times") | Basic open tracking         |

---

## 3. Design System

### 3.1 Color Palette — "Artisanal Elegance" (ACTIVE)

Extracted from MyHeartCraft via Stitch and adapted for HoneyHearts. Visual style: **Modern Minimalist with a Romantic edge** — deep magenta heart-energy against soft lavender and blush surfaces, ivory canvas, generous whitespace, high-contrast typography. Premium without being cold. Same emotional neighborhood as MyHeartCraft but distinctly its own house.

**Brand primary (the "heart" of the system):**

```
Primary:                    #780037   — main CTAs, primary buttons, critical accents
Primary Container:          #9D174D   — softer brand surfaces, secondary CTAs
On Primary:                 #FFFFFF   — text on primary fills
On Primary Container:       #FFAFC2   — text on primary container
Primary Fixed:              #FFD9E0   — soft pink tint of primary
Primary Fixed Dim:          #FFB1C3
On Primary Fixed:           #3F0019
On Primary Fixed Variant:   #8E0542
Inverse Primary:            #FFB1C3
Surface Tint:               #AF275A   — primary's tonal influence on surfaces
```

**Secondary (muted plum, supporting role):**

```
Secondary:                  #765469   — muted plum for secondary text/icons
Secondary Container:        #FDD0EA   — soft pink container
On Secondary:               #FFFFFF
On Secondary Container:     #79576C
Secondary Fixed:            #FFD8ED
Secondary Fixed Dim:        #E5BAD3
On Secondary Fixed:         #2C1325
On Secondary Fixed Variant: #5C3D51
```

**Tertiary (deep aubergine, decorative accents):**

```
Tertiary:                   #423455   — deep aubergine accent
Tertiary Container:         #5A4B6E
On Tertiary:                #FFFFFF
On Tertiary Container:      #D0BDE6
Tertiary Fixed:             #EDDCFF   — soft lavender container surface
Tertiary Fixed Dim:         #D2BFE8
On Tertiary Fixed:          #221534
On Tertiary Fixed Variant:  #4F4062
```

**Surface & background (the canvas):**

```
Surface:                    #F9F9FF   — primary page background (cool ivory)
Surface Bright:             #F9F9FF
Surface Dim:                #D3DAEF
Surface Container Lowest:   #FFFFFF   — pure white for cards
Surface Container Low:      #F1F3FF
Surface Container:          #E9EDFF
Surface Container High:     #E1E8FD
Surface Container Highest:  #DCE2F7
Surface Variant:            #DCE2F7
Background:                 #F9F9FF
Inverse Surface:             #293040
Inverse On Surface:         #EDF0FF
```

**Text & outline:**

```
On Surface (text primary):  #141B2B   — deep ink navy, near-black with cool undertone
On Surface Variant:         #574146   — muted plum-gray for secondary text
On Background:              #141B2B
Outline:                    #8B7076   — borders, dividers
Outline Variant:            #DEBFC4   — soft blush outline
```

**System (error, success):**

```
Error:                      #BA1A1A
On Error:                   #FFFFFF
Error Container:            #FFDAD6
On Error Container:         #93000A
Success:                    (use Material 3 green token when needed — not in primary brand)
```

**Tailwind exposure:** Every token above is declared as a CSS custom property in `src/app/globals.css` and exposed via `tailwind.config.ts` so the codebase writes `bg-surface`, `text-on-surface`, `bg-primary`, `border-outline-variant`, etc.

**How to use this palette correctly:**

1. **Primary `#780037` is for action moments only** — Send buttons, Create now CTAs, the watermark accent. Don't paint large surfaces with it. The deep magenta gets its power from being scarce.
2. **Soft containers (`#FDD0EA`, `#EDDCFF`, `#F1F3FF`) carry the romantic mood** — gift cards, hero backgrounds, soft sections. Most of what the user sees should be in this tonal range.
3. **Surface stays near-white (`#F9F9FF`, `#FFFFFF`)** — the cool ivory canvas makes the soft pinks and lavenders feel premium, not cluttered.
4. **Text on colored fills uses the matching On-\* token** — never plain black or generic gray on a soft pink surface. Use `#79576C` (On Secondary Container) on `#FDD0EA` for accessible, on-brand contrast.

---

<!--
═══════════════════════════════════════════════════════════════════
ALTERNATIVE PALETTES — currently inactive, documented for future reference
═══════════════════════════════════════════════════════════════════

Three palettes total exist for HoneyHearts. Artisanal Elegance (above) is
active and referenced in code. The two below are commented out — do NOT
reference these tokens in components. They exist as documented options
in case the brand direction needs to pivot.

Switching costs grow over time:
 - Today (Phase 0.2 done, no UI yet): trivial — just swap the active block
 - End of Phase 0 (GiftFrame styled): ~2 hours
 - End of Phase 1 (4 hero gifts shipped): ~1 full day + OG image/watermark redo
 - Post-launch: requires a full visual re-review, marketing material update,
   and likely customer perception management. Avoid switching after launch.

═══════════════════════════════════════════════════════════════════
ALTERNATIVE #1 — "Petal Pop" (cutesier sibling of Artisanal Elegance)
═══════════════════════════════════════════════════════════════════

Same cool-toned romantic family as Artisanal Elegance, but the personality
is boutique pâtisserie instead of art gallery. Sweeter, gentler, more
"open me!" energy. Same typography pairing (Playfair Display + Plus Jakarta
Sans + Inter) works identically.

When to consider switching here:
- If user research shows the active palette reads "too serious" for the
  target audience (18–28 year olds in relationships)
- If conversion data suggests CTAs feel intimidating rather than inviting
- If competitor positioning shifts and we need a softer, more approachable
  identity

Primary:                    #B43F75   — bright rose-magenta, cherry-pink
Primary Container:          #D26A9A   — warm cherry pink, softer CTAs
On Primary:                 #FFFFFF
On Primary Container:       #FFE0F0
Inverse Primary:            #FFBDD8

Secondary:                  #8A5570   — muted plum-pink, supporting text
Secondary Container:        #FFE0F0   — sugary petal pink (the signature)
On Secondary Container:     #6F3756
Secondary Fixed:            #FFE8F4
Secondary Fixed Dim:        #FAC7DC

Tertiary:                   #574775   — dusty lavender accent
Tertiary Container:         #F2E5F7   — soft lilac whisper
On Tertiary Container:      #3D2D5C
Tertiary Fixed:             #F4E1F5
On Tertiary Fixed Variant:  #4A3D5C

Surface:                    #FFFCFD   — pink-tinted ivory (warmer than active)
Surface Container Lowest:   #FFFFFF
Surface Container Low:      #FFF5F9
Surface Container:          #FAEAF1
Surface Container High:     #F4D9E5
Surface Container Highest:  #F2D5E0

On Surface (text primary):  #261A24   — soft plum-dark (vs cool navy in active)
On Surface Variant:         #5C3A4E   — warmer muted plum for secondary text
Outline:                    #B58597   — warm dusty mauve
Outline Variant:            #E6CFDA   — soft pink-blush outline

Error:                      #BA1A1A
On Error:                   #FFFFFF
Error Container:            #FFDAD6
On Error Container:         #93000A

Brand archetype: a boutique pâtisserie. Sweet, gentle, inviting.
Trade-off vs Artisanal Elegance: less premium/editorial, more cute/playful.
The wine-magenta confidence is replaced with rose-pink warmth. Reads more
"feminine" and may need conscious balance if you want broader appeal.

═══════════════════════════════════════════════════════════════════
ALTERNATIVE #2 — "Honey & Hearts" (warm-cozy direction)
═══════════════════════════════════════════════════════════════════

A complete departure from the cool-romantic family. Warm honey gold +
dusty blush + ivory cream. The brand name makes literal sense.

When to consider switching here:
- If the cool palette feels "wrong" for Indian D2C romance moments
  (Karva Chauth, wedding season, Diwali — all warm emotional contexts)
- If marketing tests show the warm direction outperforms in ad creative
- If the brand wants to feel less premium-editorial and more
  cafe-bakery-cozy-Bandra

This direction also requires TYPOGRAPHY CHANGES — Playfair Display feels
too editorial for the warm direction. Swap to Fraunces (warmer serif) and
keep Inter for UI. Plus Jakarta Sans can stay or swap to a slightly
warmer sans like Source Sans 3.

Primary (Honey):            #C58940   — warm honey gold, brand-name-aligned
Primary Hover:              #A66E2C
Primary Soft:               #F4DEB6   — pale honey wash
Secondary (Dusty Blush):    #D88882   — romantic dusty rose
Secondary Soft:             #F4D2CC
Accent (Champagne):         #D4B68A   — soft celebration gold
Background (Ivory):         #FBF6EE   — warm cream canvas
Surface:                    #FFFEF9   — slightly warm white
Surface Tint:               #F7EFE3
Border:                     #EAD9C1
Text Primary:               #2C2622   — warm dark brown (not cool navy)
Text Secondary:             #7A6E62
Text Muted:                 #A89B8C
Success:                    #16A34A
Error:                      #DC2626

Hero gradient (warm direction):
linear-gradient(135deg, #FBF6EE 0%, #F7EFE3 50%, #FAEEEA 100%)

Brand archetype: a cafe-bakery in Bandra. Warm, cozy, soft, "honey" makes
literal sense.
Trade-off vs Artisanal Elegance: furthest from MyHeartCraft visually
(zero overlap with their wine-magenta direction). Loses premium feel.
Switching here is the biggest visual change of the three options —
also requires font swap (Playfair → Fraunces) for tonal coherence.

═══════════════════════════════════════════════════════════════════
DECISION CHEAT-SHEET
═══════════════════════════════════════════════════════════════════

If the active palette feels...      → consider switching to...
"too serious / intimidating"        → Petal Pop (cuter sibling)
"too close to MyHeartCraft"         → Petal Pop (distinct in palette,
                                       same vibe family)
"too cool / too distant"            → Honey & Hearts (warm pivot,
                                       requires font swap too)
"perfect, just needs accent tweaks" → stay on Artisanal Elegance,
                                       adjust accent tokens only

Reminder: switching is a one-time choice, not a back-and-forth. Each
swap costs visual review + marketing collateral updates. Decide once,
commit fully.
-->

### 3.2 Typography

Two fonts do the bulk of the work. The serif carries emotion and brand voice. The sans handles everything functional. This 2-font system is intentionally simpler than a 3-font hierarchy — fewer decisions per component, lighter bundle, more cohesive feel.

**Type families:**

- **Fraunces** — serif. Hero headlines, gift titles, recipient names on anticipation screens, editorial moments. Contemporary serif with optical sizing and a romantic, handcrafted character. Pairs surprisingly well with the cool Artisanal Elegance palette — the warmth of Fraunces softens the editorial coolness of the magenta/lavender, creating tension that reads as "thoughtful indie brand" rather than "luxury magazine."
- **Inter** — sans. Body copy, UI labels, buttons, form fields, micro-copy, badges. Does double duty: editorial body AND functional UI. Inter handles this gracefully because its design intent is screen-readability at any size.
- **Caveat** — script. Reserved for Handwriting Mode, signatures, hand-written sticky notes within gifts. Decorative only — never for primary information the user has to read.
- **JetBrains Mono** — monospace. Loading Screen of Love, Terms & Conditions, Crime Board, Love Receipt — wildcard gifts where the format calls for mono. Lazy-loaded per-gift to keep the core bundle small.

**Type scale:**

| Style                                      | Font     | Size            | Weight | Line height | Letter spacing |
| ------------------------------------------ | -------- | --------------- | ------ | ----------- | -------------- |
| Headline XL (hero desktop)                 | Fraunces | 48px            | 600    | 56px        | -0.02em        |
| Headline LG (section, desktop)             | Fraunces | 32px            | 600    | 40px        | -0.01em        |
| Headline LG (section, mobile)              | Fraunces | 28px            | 600    | 36px        | -0.01em        |
| Headline MD (card title)                   | Fraunces | 24px            | 500    | 32px        | normal         |
| Headline SM (recipient name, anticipation) | Fraunces | 36–44px         | 500    | 1.1         | -0.01em        |
| Body LG (intro paragraph)                  | Inter    | 18px            | 400    | 28px        | normal         |
| Body MD (body copy)                        | Inter    | 16px            | 400    | 24px        | normal         |
| Body SM (secondary text)                   | Inter    | 14px            | 400    | 20px        | normal         |
| Label MD (UI labels, buttons)              | Inter    | 14px            | 500    | 20px        | 0.01em         |
| Label SM (micro-copy, badges)              | Inter    | 12px            | 600    | 16px        | 0.02em         |
| Script accent                              | Caveat   | varies per gift | 500    | varies      | normal         |

**Usage rules:**

- Fraunces uses **slightly tighter letter-spacing** at large sizes (-0.01 to -0.02em) to keep the warm serif from feeling sprawling.
- Inter body text stays **airy** (line-height ≥ 1.5×) for comfortable reading rhythm.
- Inter handles both body AND UI — the distinction is in size + weight, not font family.
- Fraunces should never appear in buttons, form labels, or small UI text — it loses character below 18px.
- Caveat is **decorative only**.

**Font loading:** Load Fraunces (weights 500, 600) and Inter (weights 400, 500, 600) via `next/font` in `src/app/layout.tsx` with `display: 'swap'`. Fraunces 600 and Inter 400 are critical-path (hero + body). Caveat and JetBrains Mono are lazy-loaded per-gift to keep the core bundle small.

**Why this pairing over Playfair Display + Plus Jakarta + Inter:** Fraunces is warmer and more emotionally resonant — fits the HoneyHearts brand name. Two-font systems are simpler to maintain across 87 gifts. The slight tension between warm-Fraunces and cool-Artisanal-palette is _interesting design_, not a problem. (For reference: Playfair Display + Plus Jakarta + Inter was the previous direction. Documented in commit history.)

### 3.3 Home Screen UX (per Bible Part 13)

**NOT a bento grid.** A cozy gift shop with horizontal scrolling rows:

```
┌──────────────────────────────────────────────┐
│  [Seasonal banner — only when active 🎃]    │
├──────────────────────────────────────────────┤
│  Hero: "Craft unforgettable interactive..."  │
│  [Try free] [See how it works]               │
├──────────────────────────────────────────────┤
│  ⚡ Quick & Sweet                  →         │
│  [Sorry Puppy] [Miss You] [Good Morning]...  │
├──────────────────────────────────────────────┤
│  💖 Make Them Melt                 →         │
│  [Love Jar] [Dandelion] [Origami]...         │
│  (each card has 3-second animated preview)   │
├──────────────────────────────────────────────┤
│  🤯 Wildcard                       →         │
│  [Spotify Wrapped] [Love Receipt]...         │
├──────────────────────────────────────────────┤
│  💑 Play Together                  →         │
│  [Love Lock] [Catch My Love]...              │
├──────────────────────────────────────────────┤
│  🔄 For The Long Run               →         │
│  [365 Jar] [Growing Garden]...               │
└──────────────────────────────────────────────┘
```

Cards are **animated 3-second previews**, not static images. Show, don't tell.

### 3.4 Recipient Experience Anatomy

Every gift recipient view follows this pattern:

1. **Anticipation Screen (0–2.5s)** — Their name with soft glow. _"Someone made something special for you..."_ Gentle ambient animation. The wait builds excitement.
2. **Reveal (spring entrance)** — Main scene materializes with physics-based motion.
3. **Interaction (the gift itself)** — Tap, shake, blow, hold, draw, swipe — depends on gift.
4. **Climax** — The emotional peak (final message, full bloom, etc.). **This is the Reaction Snap moment** if enabled.
5. **Post-Gift Conversion** — _"Want to send one back?"_ Soft, never pushy. Their emotional openness here is the entire growth loop.

### 3.5 Motion Language

- **Framer Motion** for component-level UI motion
- **Lottie** for designer-built animation sequences (paper unfolding, sunsets, etc.)
- **GSAP** for complex timelines (Northern Lights, Aurora swipes)
- **canvas-confetti** for celebration bursts
- **Web Audio API** for subtle SFX (tape hiss, rain, knock, page flip) — always opt-in, never auto-play with sound

### 3.6 Build Workflow: Skill Layering for UI Craft

UI work is built in layers, with a different Claude skill invoked at each layer. **Never skip layers or stack them in the same prompt** — each layer assumes the previous one is solid.

| Layer        | Skill             | Purpose                                                                                            | Invoke when                                                                    |
| ------------ | ----------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1. Structure | `frontend-design` | Design tokens, typography, color systems, layout architecture, spacing rhythm                      | Building anything new — tokens, components, pages, layouts                     |
| 2. Motion    | `emil-kowalski`   | Micro-interactions, transitions, anticipation→reveal sequences, spring physics, scroll feel        | After structure is approved, when the thing needs to _move_ with intention     |
| 3. Polish    | `impeccable`      | Tactile feedback, every-detail-considered finishing pass, the difference between "works" and "wow" | After motion is in place, on the highest-stakes UI (hero gifts, the home page) |

**The invocation pattern:**

```
Prompt 1 (structure):  "Use frontend-design skill. Read it before generating."
                       → Approve structure
Prompt 2 (motion):     "Use emil-kowalski skill. Read it before generating.
                        Refine [specific component] only — don't touch structure."
                       → Approve motion
Prompt 3 (polish):     "Use impeccable skill. Read it before generating.
                        Polish pass on [specific component] — focus on [details]."
```

**Where each skill enters the phased build:**

- **Phase 0.3** (GiftFrame) — `frontend-design` for tokens + structure. Then a focused second pass with `emil-kowalski` on the anticipation screen and reveal transitions specifically. The first thing every recipient sees deserves motion craft from day one.
- **Phase 0.4** (PromptInput) — `frontend-design` only. Forms don't need polish skills until they're proven structurally.
- **Phase 1.1** (Home page) — `frontend-design` for the cozy shop layout. Then `emil-kowalski` on the card hover states and horizontal-scroll feel.
- **Phase 1.3** (the 4 hero gifts) — `frontend-design` for each gift's structure, then `impeccable` per gift on the highest-emotional-impact moment (the Love Jar shake feel, the Dandelion seed scatter, the Proposal's celebration). The Bible's quote applies here: _"the one thing that will kill this product: quality of the first experience someone sees."_
- **Phase 2** (next 6 crafted + 3 wildcard) — `frontend-design` first pass. `impeccable` selectively, only on the gifts data shows are highest-converting.
- **Phase 3** (long tail) — `frontend-design` only is fine for most. Polish passes happen post-launch based on engagement data, not preemptively.

**Anti-patterns to avoid:**

1. **Stacking skills in one prompt.** "Use frontend-design and emil-kowalski and impeccable" produces muddled output where no skill's voice comes through clearly. Always one skill per prompt.
2. **Polishing before structure is approved.** Refining a button's hover state on a button that's the wrong size is wasted work. Approve the bones before refining the surface.
3. **Polishing the long tail prematurely.** Of 87 gifts, only ~10 will drive 80% of revenue. Polish those 10 hard. Ship the rest at structure-only quality and polish them based on real engagement data.
4. **Forgetting to say "read it before generating."** Without the explicit read instruction, Claude sometimes pattern-matches from training instead of using the actual skill content. Always include the read instruction.

---

## 4. Tech Stack

| Layer              | Choice                                                    | Why                                                               |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------------------------- |
| Framework          | **Next.js 14 (App Router)**                               | SSR for shareable links + dynamic OG images                       |
| Language           | TypeScript                                                | Required for catalog this large                                   |
| Styling            | **Tailwind CSS + shadcn/ui**                              | Matches MHC warmth, fast iteration                                |
| Animation          | **Framer Motion + Lottie + GSAP**                         | All three, each for what it does best                             |
| State              | **Zustand**                                               | No Redux boilerplate                                              |
| Backend            | **Supabase** (Mumbai region)                              | Postgres + Auth + Storage + Realtime + Edge Functions             |
| Auth               | **Supabase Auth + MSG91**                                 | Phone OTP is critical for India; Google fallback                  |
| Payments           | **Razorpay**                                              | UPI, cards, wallets — standard for India                          |
| File Storage       | **Cloudinary**                                            | Image transforms, fast CDN, generous free tier                    |
| Email              | **Resend**                                                | Transactional (confirmations, reminders, scheduled gift delivery) |
| WhatsApp           | **AiSensy** (or WATI)                                     | Send gift links + Living Gift reminders                           |
| Push notifications | **OneSignal**                                             | Web push for Living Gifts                                         |
| Scheduling         | **Supabase pg_cron** + **QStash**                         | Scheduled delivery, daily 365 Jar unlocks                         |
| Content moderation | **AWS Rekognition** (images) + **Perspective API** (text) | Required at scale                                                 |
| Analytics          | **PostHog** (cloud, India region)                         | Funnels + session replay                                          |
| Error tracking     | **Sentry**                                                | Mandatory from day one                                            |
| Hosting            | **Vercel**                                                | Edge runtime for fast gift loads                                  |
| i18n               | **next-intl**                                             | Multilingual from launch (Hindi + English at minimum)             |

**Cost estimate first 6 months:** ~₹20K–30K (domain, Razorpay fees, basic Cloudinary tier, AiSensy startup tier). Marketing budget is separate (covered in marketing-playbook.docx).

---

## 5. Architecture Decisions (locked in)

### 5.1 Single app, NOT subdomains

The Bible (Part 14) is explicit: MHC's subdomain approach fragments SEO and analytics. We use a single Next.js app with routes:

```
yoursite.com/
├── /                          → Home (cozy shop layout)
├── /gift/[slug]               → Gift detail / "Create now"
├── /create/[slug]             → Multi-step creation flow
├── /g/[shortId]               → Recipient view (the experience itself)
├── /dashboard                 → Creator's gifts + reactions + subscription
├── /pricing                   → Free / ₹49 / ₹149 / ₹199 pack / ₹149 sub
├── /reactions                 → Public opt-in UGC gallery
├── /occasions/[slug]          → V-Day, anniversary, karva chauth landing pages
└── /blog                      → SEO content
```

### 5.2 Performance budget (non-negotiable)

- **Initial bundle:** under 200KB JS gzipped
- **Recipient view FCP:** under 1.2s on 4G
- **Time to Interactive:** under 2.5s
- **Frame rate:** 60fps on Snapdragon 665 (₹10,000 Indian Android budget phone)
- **Test device:** Buy a Redmi 9A. Test every gift on it weekly. If it stutters, it ships nothing.

### 5.3 Link expiration policy

- **Free gifts:** 90 days, then archived (subtle nudge to pay)
- **Paid gifts:** Forever
- **Living gifts:** Active for subscription duration + 30-day grace

### 5.4 Replayability per gift type

- **Replayable** (full experience every time): Love Jar, Snow Globe, Bubble Pop, Mini Games
- **One-shot with replay-from-end** (preserves emotional surprise): Reverse Love Letter, Origami Unfold, Things I Never Said, Loading Screen
- **Persistent state** (changes accumulate): 365 Jar, Growing Garden, Our Playlist, Love Lock

---

## 6. The Smart Prompts System (THE differentiator)

Per Bible Part 2, this is what separates us from MHC. **Every gift uses guided prompts, never blank text boxes.**

### 6.1 Prompt schema

Each gift has a `prompts.ts` file:

```ts
export const loveJarPrompts: PromptSet = {
  primary: 'Tell them something small they do that you secretly love.',
  alternatives: [
    'What habit of theirs used to annoy you but now you find adorable?',
    "What's something they don't know you noticed?",
  ],
  microcopy: "The more specific you are, the harder they'll cry 😊",
  inspiration: [
    "I love that you talk to every dog like it's your best friend.",
    'I love that you re-read texts before sending and still send them with typos.',
    // ~10 anonymized real examples
  ],
  minLength: 15,
  maxLength: 180,
};
```

### 6.2 Cross-cutting features

- **Inspiration button** — Tap to see anonymous real examples (with creator opt-in). Unblocks frozen users.
- **Auto-save** — Every keystroke debounced to localStorage; never lose work.
- **Specificity nudge** — If response is under 15 chars or matches generic patterns ("I love you so much"), gently prompt: _"Can you make it more specific? One detail nobody else would notice."_
- **Multilingual prompts** — Ship in English + Hindi at minimum. Tamil, Telugu, Marathi, Bengali by Phase 3.

---

## 7. Information Architecture: The Full Gift Catalog

### 7.1 Tier 1 — Quick Love Notes (FREE, 30 seconds) — 7 gifts

Sorry Puppy, Miss You, Good Morning, Goodnight, Just Because, Cheer Up, Anniversary Counter

### 7.2 Tier 2 — Crafted Experiences (₹49, 3–5 min) — 37 gifts

Love Jar, Star Wish, Bubble Pop, Wishing Dandelion, Origami Unfold, Message in a Bottle, Pillow Fort, Growing Garden (one-shot variant), Snow Globe, Memory Scrapbook, Rainy Window, Tiny Door, Mixtape, Sunset Together, Pet That Loves Them, Kitchen Table Letters, Paper Airplane Notes, Postcard Collection, Autumn Leaves, Paper Boat River, Lightning Bugs at Dusk, Northern Lights, Cloud Messages, Moon Phases, Matryoshka Love, Fortune Cookie, Locket, Wrapped Gift Tower, Warm My Heart, Draw Us, Heartbeat Sync, Blanket of Stars Tuck-In, Bedtime Story, Dream Catcher, Bake Them a Cake, Coffee Art, Candy Hearts

### 7.3 Tier 3 — Wildcard / Unhinged (₹49) — 17 gifts

Spotify Wrapped, Reverse Love Letter, Loading Screen of Love, Terms & Conditions, Villain Origin Story, Crime Board, Missed Calls, Unsubscribe From Loving You, Google Maps But Romantic, Screenshot Museum, Time Travel Letter, Their Name in Everything, Fight Ender, Parallel Universes, Ctrl+Z Our Fights, Love Receipt, Rate My Partner

### 7.4 Tier 4 — Couple Experiences (₹49, 2-player) — 4 gifts

Love Lock Bridge, Gratitude Ping-Pong, Two Truths One Lie, Our Playlist (Collaborative)

### 7.5 Tier 5 — Living & Recurring Gifts (₹149) — 2 gifts

365 Jar, Growing Garden (Living)

### 7.6 Mini Games (FREE) — 6 gifts

Catch My Love, Love Maze, Jigsaw Heart, Treasure Map, Spin the Wheel, Coupon Book

### 7.7 Seasonal Specials (₹49, time-bound) — 4 gifts

Love Potion (V-Day), Time Capsule (NYE), Lantern Festival (Anniversary), Spooky Love (Halloween)

### 7.8 Deeply Personal Formats (₹49) — 10 gifts

The Little Things, If We Never Met, Your Voice, Things I Never Said, Our Dictionary, A Day In Your Shoes, Before You / After You, Replay, What I'd Say at 3 AM, The Playlist About You

### 7.9 Cross-Cutting Special Features (toggles)

Handwriting Mode, Whisper Mode, Reaction Snap, Secret Ink, Voice Notes, Doodle Attachments

**Total: ~87 distinct gifts + 6 cross-cutting feature toggles.**

---

## 8. Phased Implementation

> **Headline:** Launchable at end of Phase 1 (~week 6). Full catalog by Phase 3 (~week 22). Aligned exactly with Bible Part 15 phasing.

---

## ✨ Phase 0 — Foundation (Weeks 1–2)

**Goal:** Build the rails. Zero gifts yet. The infrastructure that every gift will sit on top of.

### 0.1 Project setup

- [ ] Next.js 14 + TypeScript + Tailwind + shadcn/ui scaffolded
- [ ] ESLint, Prettier, Husky pre-commit hooks
- [ ] Folder structure: `/app`, `/components`, `/lib`, `/gifts/[slug]`, `/prompts`
- [ ] Vercel deploy pipeline live with preview URLs per branch

### 0.2 Backend

- [ ] Supabase project (Mumbai region) with these tables:
  - `users` (id, phone, email, name, locale, created_at)
  - `gifts` (id, short_id, creator_id, slug, recipient_name, content_jsonb, status, expires_at, paid)
  - `gift_views` (id, gift_id, viewed_at, device_info, view_duration_ms)
  - `interactions` (id, gift_id, type, value, created_at) — for engagement tracking
  - `reactions` (id, gift_id, image_url, video_url, recipient_consent, created_at)
  - `subscriptions` (id, user_id, plan, razorpay_sub_id, started_at, expires_at)
  - `prompt_inspirations` (id, gift_slug, prompt_id, anonymous_response, opted_in)
- [ ] Row Level Security policies on all tables
- [ ] Auth: phone OTP via MSG91 + Google OAuth fallback

### 0.3 The shared "GiftFrame" runtime

This is the most important component in the codebase. **Every gift renders inside it.**

> **Skill workflow** (per Section 3.6): Build structure with `frontend-design`. Once approved, do a focused second pass with `emil-kowalski` on the anticipation screen entrance and the anticipation→reveal transition specifically. Don't stack skills in one prompt.

Build `<GiftFrame>` with:

- [ ] Anticipation screen (recipient name + soft glow, 1.5–2.5s)
- [ ] Lazy-loaded gift component (React.lazy with Suspense)
- [ ] Engagement tracking hooks (`trackInteraction(type, value)`)
- [ ] Reaction Snap orchestration (opt-in, capture window, upload)
- [ ] Post-gift conversion CTA ("Want to send one back?")
- [ ] Watermark for free tier (subtle bottom corner, removable at ₹29)
- [ ] Replay button (logic per gift type — see 5.4)

### 0.4 Smart Prompt framework

- [ ] `<PromptInput>` component with: prompt text, alternatives toggle, microcopy, inspiration drawer, character count, specificity nudge, auto-save
- [ ] `prompts/<gift-slug>.ts` schema documented and templated
- [ ] Inspiration system with admin moderation queue

### 0.5 Critical infrastructure

- [ ] Razorpay test integration with ₹49 dummy product
- [ ] Cloudinary image upload pipeline with auto-format + optimization
- [ ] Dynamic OG image generation at `/g/[shortId]/opengraph-image.tsx` (Bible: this is the WhatsApp first impression — the most important card on the platform)
- [ ] Short URL service (nanoid-based, 6-char IDs)
- [ ] PostHog event tracking: signup, gift_create_started, gift_create_abandoned, prompt_filled, gift_paid, gift_sent, gift_opened, gift_completed, share_clicked, return_creator
- [ ] Sentry error tracking live
- [ ] i18n setup with next-intl (English + Hindi locale files)

### 0.6 Operational basics

- [ ] Privacy Policy + ToS published (use a generator, lawyer-review before Phase 2)
- [ ] Razorpay live mode KYC submitted (takes 7–10 days — start now)
- [ ] Domain purchased + GST consideration logged
- [ ] Customer support email + WhatsApp Business number reserved

**Deliverable:** Empty homepage live. Auth works. A test "Hello World" gift can be created, paid for in test mode, and viewed at a unique URL with the Anticipation Screen and Conversion CTA working.

---

## 🚀 Phase 1 — Prove It (Weeks 3–6)

**Goal (per Bible Part 15):** Build 4 absolutely flawless hero gifts + 2–3 free Quick Notes + Mini Games starter. Make people screenshot and post unprompted.

### 1.1 Home page (Week 3)

> **Skill workflow** (per Section 3.6): `frontend-design` for the cozy shop layout structure. Once approved, second pass with `emil-kowalski` on card hover states and horizontal-scroll feel.

- [ ] Hero with rotating headline ("Craft unforgettable interactive surprises")
- [ ] CTA buttons: "Try free" → Quick Notes; "See how it works" → modal
- [ ] **Cozy shop layout** with 5 horizontal-scroll rows (per Bible Part 13)
- [ ] Animated 3-second card previews (autoplay on scroll into view)
- [ ] How It Works section (Pick → Personalize → Send)
- [ ] Testimonials carousel (use 6 polished placeholder quotes labelled "early creator" until real ones arrive)
- [ ] Footer + nav

### 1.2 Universal Creation Flow (Week 3)

Reusable `<GiftBuilder>` consuming a config schema per gift:

1. **Pick personalization fields** — recipient name, your name, photos, voice, etc.
2. **Smart Prompts** — guided input with inspiration & nudges
3. **Live Preview** — exact recipient experience, fully interactive (Bible: creators MUST preview)
4. **Pay** (skipped for free tier) — Razorpay UPI/card
5. **Share** — copy link / WhatsApp button / QR / scheduled delivery option

### 1.3 The 4 Hero Gifts (Weeks 3–5)

Per the Bible, these specific 4 must launch first because they cover all 4 archetypes:

> **Skill workflow** (per Section 3.6): For each hero gift, build with `frontend-design` first, then a polish pass with `impeccable` on the highest-emotional-impact moment (the shake feel for Love Jar, the seed scatter for Dandelion, the celebration for Proposal, the rainbow reveal for Sorry Puppy). The Bible: _"the one thing that will kill this product: quality of the first experience someone sees."_ These 4 gifts justify the polish budget.

#### 🫙 Love Jar (romantic archetype) — ₹49

- Mason jar filled with colorful hearts, wobble physics
- Shake (accelerometer) or tap to dispense a random message
- Each message has a micro-animation; fullness meter depletes then refills
- Smart prompts: 3 alternates around small loved habits

#### 🌬️ Wishing Dandelion (poetic archetype) — ₹49

- Single dandelion centered
- Microphone blow detection (or tap fallback) → seeds scatter in slow motion
- Each drifting seed is tappable, opens a wish
- Seeds form heart shape after all opened
- This is **the screenshot bait of Phase 1** — must look stunning

#### 💑 The Proposal (big-moment archetype) — ₹49

- The MyHeartCraft staple, but executed better
- Question with Yes/No buttons; "No" dodges taps with playful physics
- Smart prompt for the question itself + customized celebration scene on Yes
- Confetti, partner photo, custom message at finale

#### 🥺 Sorry Puppy (everyday archetype) — FREE Quick Note

- Sad puppy in rain, raindrops slow with each tap
- Rain stops → rainbow → apology message unfolds
- Smart prompt: "What exactly did you do wrong? Say it like you're admitting it to their face."

### 1.4 Free Tier Quick Notes (Week 5)

Ship these 3 alongside Sorry Puppy:

- **Miss You** — two characters reaching, heart-string with tappable hearts
- **Good Morning** — sunrise + steam-message in coffee
- **Just Because** — wax-sealed envelope with handwriting reveal

All 4 free gifts: subtle "Made with [YourBrand] 💕" watermark. Removable at ₹29.

### 1.5 Mini Games starter (Week 5–6)

Ship 2 of the 6 mini games to feed the free-tier viral loop:

- **Catch My Love** (falling hearts, basket catch)
- **Spin the Wheel** (date night reusable)

### 1.6 Recipient Reaction Capture (Week 6)

- [ ] Reaction Snap with **explicit consent flow** (Bible: legally critical)
- [ ] Front-camera burst at the climax frame
- [ ] Recipient can delete instantly; creator gets notification only with consent
- [ ] Stored in creator dashboard, never public without separate opt-in

### 1.7 Creator Dashboard (minimal)

- [ ] List of created gifts with status badges (sent / opened / completed)
- [ ] Per-gift engagement: "shaken 14 times" / "spent 3:24 in your gift" — **never absence** (Bible: causes anxiety)
- [ ] Consented reaction snaps
- [ ] Resend link button
- [ ] Subscription status (placeholder until Phase 3)

### 1.8 Launch checklist (end of Phase 1)

- [ ] Razorpay live mode active
- [ ] Test full flow on Redmi 9A (Snapdragon 665) — every gift hits 60fps
- [ ] Test gift opening in: iOS Safari, Android Chrome, in-app WhatsApp browser, Instagram in-app browser
- [ ] OG card preview tested on real WhatsApp + iMessage + Instagram DM
- [ ] Privacy Policy + ToS lawyer-reviewed
- [ ] Sentry alerting configured
- [ ] First 10 alpha users (friends/family) have sent real gifts and survived

**Phase 1 success metrics:**

- 100+ gifts sent in week 1 of public launch
- 50%+ recipient open rate
- 1+ paid conversion per 20 free gifts
- Average load time under 1.5s on 4G

---

## 📈 Phase 2 — Expand (Weeks 7–10)

**Goal (per Bible Part 15):** Reach 10–12 core experiences. Add 2–3 Wildcard formats. Begin the viral content engine.

### 2.1 Add 6 Crafted Experiences (Weeks 7–8)

Per Bible Phase 2 priority list:

- [ ] **Star Wish** — tappable night sky, constellation reveal, shooting star bonus
- [ ] **Bubble Pop** — floating bubbles with mic-blow spawn, compliments inside
- [ ] **Origami Unfold** — paper crane unfolds step-by-step, each fold = one detail
- [ ] **Tiny Door** — knock-creak-open, miniature room with tappable hidden messages
- [ ] **Snow Globe** — shake-to-swirl, settling reveals nested memory layers
- [ ] **Pillow Fort** — crawl-into-fort with fairy lights, polaroids, sticky notes

### 2.2 Add 3 Wildcard Formats (Weeks 8–9)

The screenshot-bait tier launches:

- [ ] **Spotify Wrapped But From You** — Wrapped-style slides with relationship stats, swipeable, highly screenshotable
- [ ] **Terms & Conditions of Loving Me** — legal-doc parody with checkbox finale + confetti
- [ ] **Love Receipt** — itemized fake receipt of partner traits

These three are picked specifically because they're the most viral on Instagram Stories.

### 2.3 Voice & Handwriting Modes (Week 9)

Cross-cutting features available across all gifts:

- [ ] **Voice Notes** — record up to 60s per message, plays during reveal
- [ ] **Handwriting Mode** — pressure-sensitive canvas, saved as SVG, imperfection preserved
- [ ] **Whisper Mode** — 10s recording, "hold phone to ear" prompt on recipient side

### 2.4 Sharing infrastructure upgrade (Week 9–10)

- [ ] One-tap "Share to Instagram Story" with handle pre-tagged
- [ ] 1080×1920 auto-generated story export per gift
- [ ] WhatsApp share with rich preview confirmed working across all browsers
- [ ] UTM-tagged share links to track which gifts spread fastest

### 2.5 Public Reactions Gallery (Week 10)

- [ ] `/reactions` page with double-opt-in submissions
- [ ] "Reaction of the week" rotating feature
- [ ] Submission flow: recipient consents → tag @brand on IG → eligible

### 2.6 Inspiration content seeding (Week 10)

- [ ] Curate 10+ anonymous inspiration examples per gift's prompts
- [ ] Admin moderation queue
- [ ] Inspiration drawer live in `<PromptInput>`

### 2.7 Scheduled Delivery (Week 10)

- [ ] Creator can pick: "Send now" / "Send at midnight on [date]" / "Send at 7 AM tomorrow"
- [ ] QStash schedules the send; recipient gets WhatsApp + email at the chosen moment
- [ ] Edit/cancel scheduled gifts from dashboard

**Phase 2 success metrics:**

- 13 live gifts (4 paid hero + 6 new crafted + 3 wildcard) plus 4 free + 2 mini games = **19 total experiences**
- 5%+ free-to-paid conversion
- 10%+ of recipients post a story (track via UTM)
- ₹50K+ MRR from Crafted/Wildcard tier

---

## 🌍 Phase 3 — Full Catalogue (Weeks 11–22)

**Goal (per Bible Part 15):** Roll out the remaining ~70 experiences. Launch Couple features. Launch Living gifts + subscription. First seasonal drop.

This is the longest phase. Build in **content drop sprints** — every 1–2 weeks, ship 4–6 new gifts. Each drop is a marketing event.

### 3.1 Couple Features (Weeks 11–12)

Requires partner account linking infrastructure:

- [ ] Invite partner via WhatsApp (OTP-verified link)
- [ ] Linked-account model in DB
- [ ] Privacy controls (some gifts shared, some private)

Then ship the 4 couple gifts:

- [ ] **Love Lock Bridge** — shared promises, both submit, locks click together
- [ ] **Gratitude Ping-Pong** — async daily exchange with streak tracking
- [ ] **Two Truths One Lie** — write/guess interface
- [ ] **Our Playlist** — collaborative track list with notes

### 3.2 Living Gifts + Subscription (Weeks 13–14)

Subscription tier infrastructure:

- [ ] Razorpay subscription product at ₹149/mo and ₹1,499/yr (~17% discount)
- [ ] Subscription unlocks: all Living gifts + watermark removal across free tier + scheduled delivery + advanced analytics

Then ship Living gifts:

- [ ] **365 Jar** — bulk-write UI ("write 30 messages with a prompt at a time"), daily push notifications, missed-day stacking
- [ ] **Growing Garden (Living)** — creator can keep adding petals; recipient waters daily; droops if neglected ("I miss you" gentle prompt)

Notification infrastructure:

- [ ] OneSignal web push for daily 365 Jar unlocks
- [ ] Email + WhatsApp fallback if push not granted
- [ ] Smart batching (don't send 7 notifications if recipient missed a week — just one "you have 7 messages waiting")

### 3.3 Wildcard Tier Completion (Weeks 14–16)

Build the remaining 14 wildcard formats. Group by complexity:

**Lower-build** (mostly typography + sequencing):

- Reverse Love Letter, Loading Screen of Love, Villain Origin Story, Unsubscribe From Loving You, Ctrl+Z Our Fights, Rate My Partner

**Mid-build** (custom layouts/UI):

- Crime Board, Missed Calls (with voicemail upload), Screenshot Museum, Time Travel Letter, Their Name in Everything, Fight Ender, Parallel Universes

**Higher-build** (significant custom UI):

- Google Maps But Romantic — needs Mapbox-style stylized map with custom pins

### 3.4 Crafted Tier Completion (Weeks 14–18)

Build the remaining 31 crafted experiences. Organize into themed sprints:

**Sprint A — Nature scenes (Week 14):** Autumn Leaves, Paper Boat River, Lightning Bugs, Northern Lights, Cloud Messages, Moon Phases, Sunset Together
**Sprint B — Cozy domestic (Week 15):** Kitchen Table Letters, Pet That Loves Them, Bake Them a Cake, Coffee Art, Rainy Window, Mixtape
**Sprint C — Object-driven reveals (Week 16):** Matryoshka Love, Locket, Wrapped Gift Tower, Fortune Cookie, Postcard Collection, Message in a Bottle
**Sprint D — Touch / gesture (Week 17):** Heartbeat Sync, Warm My Heart, Draw Us, Paper Airplane Notes, Candy Hearts, Bedtime Story, Dream Catcher, Blanket of Stars Tuck-In

Each gift built from a `<TemplateExperience>` framework + specific React components. Don't from-scratch each one.

### 3.5 Deeply Personal Formats (Week 18)

Ship the gut-punch tier — 10 gifts. Most are simpler builds (typography-driven), so they batch well:

- The Little Things, If We Never Met, Your Voice, Things I Never Said, Our Dictionary, A Day In Your Shoes, Before You / After You, Replay, What I'd Say at 3 AM, The Playlist About You

### 3.6 Mini Games completion (Week 19)

Build remaining 4: Love Maze, Jigsaw Heart, Treasure Map, Coupon Book

### 3.7 First Seasonal Drop — Halloween (Week 19, if timing matches)

- [ ] **Spooky Love** with seasonal banner system
- [ ] Banner appears 7 days before, disappears 3 days after
- [ ] Seasonal collection page

### 3.8 Occasion landing pages for SEO (Weeks 20–21)

Long-form content (1500+ words) per page:

- [ ] `/occasions/valentines` — bundle V-Day-relevant gifts
- [ ] `/occasions/anniversary`
- [ ] `/occasions/karva-chauth`
- [ ] `/occasions/birthday`
- [ ] `/occasions/proposal`
- [ ] `/occasions/sorry`
- [ ] `/occasions/long-distance`

Schema.org markup: `Product`, `Review`, `FAQPage` per page.

### 3.9 Special features completion (Week 22)

Cross-cutting toggles available across all gifts:

- [ ] **Secret Ink** — invisible messages revealed by scratch/breath
- [ ] **Doodle Attachments** — sketch alongside notes

### 3.10 Operational features (Weeks 21–22)

Critical from Bible Part 14:

- [ ] **Context warning toggle** — creator can mark gift "private — find a quiet moment 💕" (recipient sees pre-screen)
- [ ] **Block sender** + **Report gift** on every recipient page
- [ ] **Mute / delete received gifts** for breakup handling
- [ ] **Content moderation pipeline** — Rekognition on photos, Perspective API on text, manual review queue
- [ ] **Multilingual UI rollout** — ship Tamil, Telugu, Marathi, Bengali (interface only; user content stays in their language)

**Phase 3 success metrics:**

- 87+ live experiences
- 500+ active subscribers
- 365 Jar day-30 retention >70%
- Top 3 occasion pages indexed and ranking
- ₹3L+ MRR

---

## 💰 Phase 4 — Monetization Expansion (Weeks 23+, ongoing)

**Goal (per Bible Part 15):** New revenue streams beyond per-gift sales.

### 4.1 Gift Packs

- [ ] 5-gift pack at ₹199 (₹40/gift, 18% saving)
- [ ] 10-gift pack at ₹349
- [ ] Gift pack as a giftable item itself ("send your friend 5 gift credits for their anniversary")

### 4.2 Corporate / Bulk

- [ ] B2B landing page targeting HR teams for V-Day, Diwali, anniversary celebrations
- [ ] Bulk send-to-50 flow with CSV upload
- [ ] White-label option (custom watermark, custom colors)
- [ ] Invoicing + GST documentation

### 4.3 Digital → Physical

- [ ] Print Love Receipts as posters (12x18 inch, ₹399)
- [ ] Print Terms & Conditions as framed documents (₹599)
- [ ] Memory Scrapbook → real photo book printed and shipped (₹999)
- [ ] Partner with Printrove or VistaPrint for fulfillment

### 4.4 Premium Features

- [ ] **Advanced Analytics** dashboard (subscriber-only) — engagement heatmaps, viewing patterns
- [ ] **Multi-recipient gifts** ("send to my parents" / family-friendly variants)
- [ ] **Custom domains** for power users (`yourgift.com/love`)

### 4.5 Adjacent Categories (test, don't commit)

- [ ] Friendship Day BFF gift collection (5–6 experiences adapted from existing)
- [ ] Mother's Day collection
- [ ] Workplace appreciation (sanitized "Rate My Coworker" etc.)

**Phase 4 success metrics:**

- 20%+ of revenue from non-per-gift sources
- 50+ corporate customers
- ₹10L+ MRR

---

## 🎯 Phase 5 — V-Week 2027 Prep (Dec 2026 — Feb 2027)

If launch is May 2026, you have ~9 months to V-Week 2027. This is the single largest revenue moment of the year.

### 5.1 Capacity (Dec)

- [ ] Load test for 50× normal traffic on key endpoints
- [ ] Vercel auto-scale rules confirmed
- [ ] Supabase compute upgraded for the period
- [ ] Cloudinary upload limits raised
- [ ] Customer support staffing plan (likely need 2–3 contractors for the 8 days)

### 5.2 Content stockpile (Dec)

- [ ] 30+ ad creative variants pre-built
- [ ] 14 days of organic IG content scheduled (8 V-Week days + 6 surrounding)
- [ ] Daily theme content for each V-Week day (Rose, Propose, Chocolate, Teddy, Promise, Hug, Kiss, Valentine)

### 5.3 Seasonal launches (Jan)

- [ ] **Love Potion** seasonal goes live Jan 25
- [ ] **Time Capsule** continues from Dec 31 launch
- [ ] V-Day occasion page with all relevant gifts bundled

### 5.4 Influencer commitments (locked by mid-Dec)

- [ ] 8–12 micro-influencers contracted for Feb 7–14 daily content
- [ ] 2–3 mid-tier influencers for the V-Day peak

---

## 9. Privacy, Safety, and Trust (per Bible Part 14)

These cannot be Phase-N afterthoughts. Build into Phase 0–1.

### 9.1 Harassment prevention

- Every recipient page: **Block sender** + **Report gift** buttons (Phase 1)
- Repeated reports → automatic 24-hour creator suspension pending review
- Reported gift content snapshotted for moderation review

### 9.2 Breakup handling

- Recipients can mute or delete any received gift, even Living gifts
- Living gift creator gets soft notification: "Your recipient has paused this gift" (no shame, no detail)
- Annual or recurring gifts have a "pause" state — preserved but not pinging

### 9.3 Reaction Snap consent (legally critical)

- Explicit double-confirm before camera access
- Pre-capture: "Your face will be photographed at the gift's climax. Continue?"
- Post-capture: instant preview, recipient can delete before sender ever sees it
- Default: opt-in only, never forced

### 9.4 Content moderation

- All photo uploads → AWS Rekognition (nudity, violence, minors detection)
- All text inputs → Perspective API (toxicity scoring)
- Voice recordings → manual review queue if flagged by transcription
- Three-strike creator suspension policy

### 9.5 DPDP Act (India data protection)

- Explicit consent capture for camera, microphone, location, contacts
- Data retention policies surfaced clearly: free gifts 90 days, paid forever
- Right-to-deletion endpoint for users
- Mumbai data residency confirmed with Supabase

---

## 10. Anti-Patterns (don't do these)

1. **Don't subdomain-split.** Bible Part 14 is explicit. Single app.
2. **Don't build all 87 gifts before launching.** Ship 4 hero + 4 free + 2 games. The Bible says it; the data proves it.
3. **Don't skip Smart Prompts.** A gift without prompts is a MyHeartCraft clone.
4. **Don't gate sign-up before preview.** Friction kills funnel. Sign-up only at "send" step.
5. **Don't show recipient absence ("hasn't opened yet").** Bible: causes relationship anxiety. Track presence only.
6. **Don't auto-play sound on the recipient page.** They might be in a meeting. The Reverse Love Letter showing on a screen-shared call is a disaster.
7. **Don't skip the Anticipation Screen.** A 3-second blank load kills the magic. The wait should build excitement.
8. **Don't price-test the ₹49.** It's the moat. Volume + LTV is the play.
9. **Don't build a native app yet.** Web-first. WhatsApp links work everywhere. Native comes after Phase 4.
10. **Don't ignore the Redmi 9A.** Test on it weekly. If it stutters, it doesn't ship.
11. **Don't stack UI skills in one prompt.** `frontend-design` + `emil-kowalski` + `impeccable` in a single prompt produces muddled output. One skill per prompt, in layered order: structure → motion → polish. See Section 3.6.
12. **Don't polish the long tail.** Of 87 gifts, ~10 will drive most revenue. Polish those hard with `impeccable`. Ship the rest at structure-only quality. Polish them based on real engagement data, not preemptively.

---

## 11. Decision Log (fill as you build)

| Decision                              | Date         | Why                                           | Outcome  |
| ------------------------------------- | ------------ | --------------------------------------------- | -------- |
| _example: Razorpay over Stripe_       | _2026-05-20_ | _UPI is 60% of payments in India_             | _TBD_    |
| _example: Single app over subdomains_ | _2026-05-20_ | _Bible Part 14 + SEO/analytics consolidation_ | _Locked_ |
|                                       |              |                                               |          |

---

## 12. Open Questions (resolve before Phase 1 starts)

1. **Brand name + domain.** Is this still TBD? Phase 0 needs it for OG images, deploy URLs, and Razorpay KYC.
2. **Founding team / who codes what.** This plan assumes 2–3 engineers. Solo founder = double timelines.
3. **Designer access.** Many gifts need real Lottie animations (Origami Unfold, Snow Globe, Sunset). Plan for either an in-house designer or a contractor with romantic/illustration sensibility.
4. **Music/sound licensing.** Tape hiss, rain, knocks — license-free libraries (Freesound CC0) are fine. But avoid any copyrighted song reference inside Mixtape / Playlist gifts.
5. **Customer support model.** WhatsApp + email at launch. Ticketing system (Crisp, Intercom) by Phase 2.

---

_Cute animation × Smart prompt = Personal experience._

**Build it. Ship 4 perfect ones. Then 87. Let the reactions do the rest.** 💕
