# HoneyHearts Design System — As Built

> This document is an audit of the existing codebase, not a recommendation. It captures what exists today across two distinct design languages that coexist in a single Next.js app.

---

## 1. Voice & Soul

HoneyHearts runs on a deliberate tension: **the shell is ironic, the interior is sincere**. The brand wraps itself in Y2K Windows 98 nostalgia — dialog boxes, `.exe` filenames, pixel fonts, scanlines — as a playful coat of armor. It signals "this is fun, not cringe" to the sender, lowering the vulnerability barrier. But the moment a gift is opened, the aesthetic pivots completely into warm, handmade, craft-table intimacy: paper textures, handwritten fonts, polaroids clipped to twine, soft pink shadows. The Y2K shell is the joke that gets you in the door; the handmade interior is the sincerity that makes someone screenshot it for their story.

The platform never lets these two languages bleed into each other carelessly. Y2K chrome frames the homepage, catalog, and system-level UI. The warm handmade language lives exclusively inside opened gifts and the emotional moments surrounding them. The boundary is architectural — enforced by route structure and layout components.

---

## 2. Language A — The Shell (Y2K / Windows 98)

### 2.1 Where it lives

Every component in the root layout (`src/app/layout.tsx`) and the homepage (`src/app/page.tsx`):

- `Taskbar` — sticky top bar mimicking the Windows 98 taskbar
- `HeroSection` — "ROMANCE.exe" window with cycling headlines
- `PolaroidWall` — wrapped in a `win98-window` with "MEMORIES.exe" titlebar
- `PinBoard` — pastel pink surface but still uses Y2K title styling
- `HowItWorks` — "README.txt" window with step sub-windows
- `Testimonials` — review cards styled as Notepad windows
- `CommunityCTA` — "SYSTEM" dialog with "Would you like to find love?"
- `Footer` — "About HoneyHearts.exe" window
- `WelcomePopup` — randomized warning/error dialogs
- `Y2KContextMenu` — custom right-click menu
- `ShutdownButton` — "It is now safe to close this app"
- `GiftLoading` — file-copy progress dialog
- `ToastProvider` — win98 window toast notifications
- `RetroSounds` — click oscillator + window-open.wav on `.win98-window` intersection

### 2.2 Window Chrome Pattern

Defined as CSS component classes in `globals.css`:

```css
/* src/app/globals.css lines 139-265 */

.win98-window {
  background: var(--win-chrome); /* #c0c0c0 */
  border: 2px solid;
  border-color: var(--win-chrome-light) var(--win-chrome-darkest)
    var(--win-chrome-darkest) var(--win-chrome-light);
  box-shadow: 1px 1px 0 0 #000;
  padding: 3px;
}

.win98-titlebar {
  background: linear-gradient(
    90deg,
    var(--win-title-start),
    var(--win-title-end)
  );
  /* #ff69b4 → #ba55d3 */
  color: var(--win-title-text); /* #ffffff */
  padding: 3px 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  font-family: var(--font-vt323), monospace;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.win98-body {
  background: #ffffff;
  border: 2px solid;
  border-color: var(--win-chrome-dark) var(--win-chrome-light)
    var(--win-chrome-light) var(--win-chrome-dark);
  padding: 12px;
}
```

Title bars always contain:

- An emoji + `.exe` / `.txt` / `.bat` filename (e.g., `💕 ROMANCE.exe`, `📖 README.txt`)
- `TitlebarButtons` component on the right (minimize, maximize, close — all non-functional, decorative)

**TitlebarButtons** (`src/components/win98-chrome.tsx`):

```tsx
export function TitlebarButtons() {
  return (
    <div className="flex gap-[2px]">
      <button className="win98-titlebar-btn" aria-label="Minimize">
        <span className="mt-[2px] block h-[2px] w-[6px] bg-black" />
      </button>
      <button className="win98-titlebar-btn" aria-label="Maximize">
        <span className="block h-[7px] w-[7px] border border-black" />
      </button>
      <button className="win98-titlebar-btn" aria-label="Close">
        <span className="text-[10px] font-bold leading-none text-ink">✕</span>
      </button>
    </div>
  );
}
```

Button chrome:

```css
.win98-titlebar-btn {
  width: 16px;
  height: 14px;
  background: var(--win-chrome);
  border: 2px solid;
  border-color: var(--win-chrome-light) var(--win-chrome-darkest)
    var(--win-chrome-darkest) var(--win-chrome-light);
  font-size: 10px;
  cursor: default;
}

.win98-titlebar-btn:active {
  border-color: var(--win-chrome-darkest) var(--win-chrome-light)
    var(--win-chrome-light) var(--win-chrome-darkest);
}
```

### 2.3 Buttons

Two button variants:

```css
.win98-btn {
  background: var(--win-chrome);
  border: 2px solid;
  border-color: var(--win-chrome-light) var(--win-chrome-darkest)
    var(--win-chrome-darkest) var(--win-chrome-light);
  padding: 4px 16px;
  font-family: var(--font-vt323), monospace;
  font-size: 18px;
  cursor: pointer;
  user-select: none;
}

.win98-btn-pink {
  background: linear-gradient(180deg, #ff69b4, #ff1493);
  color: white;
  border: 2px solid;
  border-color: #ff8dc7 #cc1177 #cc1177 #ff8dc7;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
  /* Same font/size as win98-btn */
}
```

Both flip their border colors on `:active` and shift padding by 1px for a physical press effect.

### 2.4 Desktop Icons

Used in the hero section for `.exe`/`.bat`/`.gif` shortcuts:

```css
.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 4px;
}

.desktop-icon:hover .desktop-icon-label {
  background: #1a0a6e; /* classic Windows selection blue */
  color: white;
}

.desktop-icon-emoji {
  font-size: 36px;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.15));
}

.desktop-icon-label {
  font-family: var(--font-vt323), monospace;
  font-size: 13px;
  color: #1a0a2e;
  max-width: 80px;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}
```

Filename treatments from the hero:

```ts
const desktopIcons = [
  { emoji: '🫙', label: 'LOVE_JAR.exe' },
  { emoji: '🐶', label: 'SORRY.bat' },
  { emoji: '🌼', label: 'DANDELION.gif' },
  { emoji: '🎵', label: 'SPOTIFY_WRAPPED.zip' },
  { emoji: '📜', label: 'TERMS.pdf' },
  { emoji: '📅', label: '365_JAR.app' },
];
```

Pattern: **UPPERCASE_SNAKE_CASE** with real file extensions.

### 2.5 CRT / Scanline Effect

Applied globally via `layout.tsx` as a fixed overlay:

```tsx
<div className="scanline-overlay" aria-hidden />
```

```css
.scanline-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
}
```

This is always present — 2px transparent, 2px at 3% black opacity, repeating. Very subtle, but visible on light backgrounds.

### 2.6 Custom Cursor

Desktop-only (768px+), defined inline in `globals.css`:

```css
@media (min-width: 768px) {
  body {
    cursor:
      url('data:image/svg+xml,...') 4 0,
      auto;
  }
}
```

The SVG is a white arrow with black stroke — a pixel-style pointer cursor.

### 2.7 Y2K Color Palette

From `:root` CSS custom properties (`globals.css` lines 7-19):

| Token                  | Hex       | Usage                                    |
| ---------------------- | --------- | ---------------------------------------- |
| `--win-bg`             | `#c8a2e8` | Page background (lavender purple)        |
| `--win-chrome`         | `#c0c0c0` | Window chrome, taskbar, buttons          |
| `--win-chrome-light`   | `#dfdfdf` | Raised edge (top/left borders)           |
| `--win-chrome-dark`    | `#808080` | Inner sunken edge                        |
| `--win-chrome-darkest` | `#404040` | Outer sunken edge (bottom/right borders) |
| `--win-title-start`    | `#ff69b4` | Title bar gradient start (hot pink)      |
| `--win-title-end`      | `#ba55d3` | Title bar gradient end (medium orchid)   |
| `--win-title-text`     | `#ffffff` | Title bar text                           |
| `--win-hot-pink`       | `#ff69b4` | Accent hot pink                          |
| `--win-magenta`        | `#ff1493` | Deep pink / magenta accent               |
| `--win-neon`           | `#ff6ec7` | Neon pink (unused in current code)       |
| `--win-body-bg`        | `#c8a2e8` | Body background (= `--win-bg`)           |

Additional inline colors used in Y2K context:

| Hex                   | Where                                         |
| --------------------- | --------------------------------------------- |
| `#1a0a2e`             | Ink color (text, set as Tailwind `ink` color) |
| `#1a0a6e`             | Desktop icon hover background                 |
| `#DAA520` / `#FFD700` | Welcome popup title bar (gold gradient)       |
| `#0000AA`             | Context menu hover (classic Windows blue)     |
| `#CC1177`             | Pink button active border, pixel hearts       |
| `#FF1493`             | Deep pink buttons, pixel hearts               |
| `#FF69B4`             | Shutdown button text glow                     |

### 2.8 Dialog Box Patterns

**Warning/Error Popups** — `WelcomePopup` (`src/components/welcome-popup.tsx`):

- Appears 1.5s after first visit (once per session)
- Randomly picks from 30 messages with titles like `⚠️ WARNING`, `⚠️ ERROR`, `📂 ALERT`, `📂 NOTICE`
- Uses a gold gradient title bar (`#DAA520 → #FFD700`) instead of the standard pink
- Animated with `popup-appear` (scale 0 → 1.08 → 1, cubic-bezier spring)
- Dismissed with `popup-dismiss` (scale 1 → 0)

**System Messages** use the `.exe` / `.bat` filename vocabulary consistently:

- `ROMANCE.exe`, `chill.exe`, `Feelings.zip`, `Love.zip`, `Sleep.exe`, `Overthinking.exe`
- Error codes: `Error code: STILL_IN_LOVE`
- Messages always use this voice: tech-support language applied to feelings

**Context Menu** (`src/components/y2k-context-menu.tsx`):

- Custom right-click on desktop only
- White background, Win98 beveled border
- Items: `💕 Send love`, `📋 Copy feelings`, `🗑️ Delete ex`, `🔄 Refresh heart`, `📂 Open emotions folder`
- Hover: `bg-[#0000AA]` text-white (classic Windows menu highlight)

**Shutdown** (`src/components/y2k-shutdown.tsx`):

- Mobile only, dark bar at bottom
- `#1a0a2e` background, `#FF69B4` text with pink glow (`text-shadow: 0 0 8px rgba(255,105,180,0.5)`)
- "It is now safe to close this app 💕"

### 2.9 Retro Sounds

`RetroSounds` (`src/components/retro-sounds.tsx`):

- **Click sound**: Synthesized via Web Audio API oscillator — 1800Hz → 400Hz exponential ramp in 60ms, gain 0.3 → 0.001
- **Window open sound**: `/sounds/window-open.wav` at volume 0.2
- Click triggers on: `a, button, [role="button"], .win98-btn, .win98-btn-pink, .desktop-icon, .win98-titlebar-btn`
- Window open triggers via IntersectionObserver when `.win98-window` elements scroll into view

### 2.10 Floating Windows

In `HeroSection`, three decorative windows float with gentle vertical drift:

```css
@keyframes float-gentle {
  0%,
  100% {
    transform: translateY(0px) rotate(var(--float-rotate, 0deg));
  }
  50% {
    transform: translateY(-8px) rotate(var(--float-rotate, 0deg));
  }
}
.animate-float {
  animation: float-gentle 6s ease-in-out infinite;
}
```

Each window has a `--float-rotate` custom property for slight tilt (-2deg, 1.5deg, 2deg) and staggered `animationDelay` (0s, 2s, 4s).

### 2.11 Blinking Cursor

```css
.blink-cursor::after {
  content: '\2588'; /* Full block character █ */
  animation: blink-cursor 1s step-end infinite;
  margin-left: 2px;
  color: var(--win-magenta); /* #ff1493 */
}
```

Used on the hero headline `h1`.

### 2.12 Progress Bars

Win98-style sunken border with pink-to-purple gradient fill:

```tsx
/* Border using chrome tokens */
borderColor: 'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)';

/* Fill gradient */
background: 'linear-gradient(90deg, #FF69B4, #BA55D3)';
```

Used in `HeroSection` floating window and `GiftLoading`.

### 2.13 Taskbar

`src/components/layout/taskbar.tsx`:

- Sticky, z-50
- Height: `h-11` mobile, `h-[34px]` desktop
- Background: `var(--win-chrome)`
- Bottom border: 2px `--win-chrome-light`, box-shadow 2px `--win-chrome-darkest`
- Start button: `💖 HoneyHearts` in `win98-btn` style
- Center: `💕 87 gifts to make them ugly cry` in pixel font (hidden on mobile)
- Right tray: `💝 💌` icons + real clock (VT323 pixel font)
- Clock updates every 30s, displays `h:mm AM/PM`

---

## 3. Language B — The Interior (Warm Handmade Craft)

### 3.1 Where it lives

- **Polaroid Wall** background (`polaroid-wall-bg`) — the warm cream surface behind the garland
- **Gift Frame** (`src/components/gift-frame/`) — anticipation screen, reveal, post-gift CTA
- **Sorry Puppy** gift (`src/gifts/sorry-puppy/`) — message card uses `--font-caveat`
- **Love Jar** gift (`src/gifts/love-jar/`) — heart notes, jar SVG, gingham, sparkles
- **Heart Note** modal — paper texture, torn edges, handwritten font
- **Pin Board** surface — pastel pink board with grain texture

### 3.2 Pastel Color Palette

From the actual code:

| Hex       | Name            | Where Used                               |
| --------- | --------------- | ---------------------------------------- |
| `#f5f0eb` | Warm Cream      | Polaroid wall background                 |
| `#FFF0F5` | Lavender Blush  | Love Jar gingham base                    |
| `#FFFCF6` | Warm Paper      | Heart note paper (`love-jar-note-paper`) |
| `#FFF6F0` | Cream           | Jar palette "Cream + Magenta"            |
| `#efafcc` | Pastel Pink     | Pin board surface                        |
| `#FFD6E5` | Blush           | Pin card color (The Proposal)            |
| `#DCC9F0` | Lavender        | Pin card color (Love Jar)                |
| `#C9F0DC` | Sage Mint       | Pin card color (Wishing Dandelion)       |
| `#FFE5A3` | Butter          | Pin card color (Spotify Wrapped)         |
| `#FFCBA4` | Peach           | Pin card color (Sorry Puppy)             |
| `#FFB6C1` | Light Pink      | Polaroid gradient, puppy blush           |
| `#DCD0FF` | Soft Lilac      | Polaroid gradient                        |
| `#A8F0D0` | Mint            | Polaroid gradient                        |
| `#FFE066` | Sunshine        | Polaroid gradient                        |
| `#FFC0CB` | Pink            | Crochet rose petals                      |
| `#FFB8C4` | Rose            | Alternate rose petals                    |
| `#FFAEC9` | Rose Center     | Rose center fill                         |
| `#F8BBD0` | Blush Pink      | Jar palette                              |
| `#A8C09A` | Sage Green      | Jar palette "Sage + Cream"               |
| `#3D2817` | Warm Brown Ink  | Heart note text                          |
| `#A08060` | Muted Brown     | Heart note hint text                     |
| `#8B7355` | Twine Brown     | Twine color, show-more button            |
| `#C19A6B` | Thread Tan      | Garland thread stroke                    |
| `#D4B896` | Clothespin Wood | Clothespin body                          |
| `#C0A47C` | Clothespin Dark | Clothespin stroke/detail                 |
| `#8B9F80` | Sage Leaf       | Garland vine, leaf fill                  |
| `#7DA178` | Dark Leaf       | Dark leaf variant                        |

### 3.3 Handwritten Font

**Caveat** — loaded in `layout.tsx`:

```ts
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});
```

Tailwind utility: `font-handwritten` → `['var(--font-caveat)', 'cursive']`

Used in:

- Polaroid wall "show more" button: `font-handwritten text-[18px] text-[#8B7355]`
- Gift frame anticipation: `font-handwritten text-xl text-on-surface-variant`
- Watermark: `font-handwritten text-sm text-primary opacity-30`
- Heart note message: `font-handwritten text-[22px] leading-[1.35] text-[#3D2817]`
- Love Jar instruction: `font-handwritten text-[22px] text-[#780037]`
- Sorry Puppy message: inline `fontFamily: 'var(--font-caveat), cursive'`

Ink color pairings:

- `#3D2817` (warm dark brown) — heart notes
- `#780037` (deep magenta) — Love Jar instruction text
- `#8B7355` (twine brown) — show-more button on polaroid wall

### 3.4 Paper Texture Patterns

**Heart Note Paper** (`globals.css` `.love-jar-note-paper`):

```css
.love-jar-note-paper {
  background: #fffcf6;
  background-image:
    radial-gradient(
      ellipse at 30% 20%,
      rgba(224, 187, 228, 0.06) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 70% 80%,
      rgba(255, 196, 214, 0.05) 0%,
      transparent 50%
    );
  border: 1px solid rgba(160, 128, 96, 0.12);
}
```

**Torn Edge** (top of heart note):

```css
.love-jar-torn-edge-top {
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    transparent 0px,
    transparent 3px,
    rgba(160, 128, 96, 0.08) 3px,
    rgba(160, 128, 96, 0.08) 4px
  );
  mask-image: url('data:image/svg+xml,...wavy path...');
}
```

**Pin Board Grain** (`globals.css` `.pin-board-surface::before`):

```css
.pin-board-surface::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: url('data:image/svg+xml,...feTurbulence fractalNoise...');
  pointer-events: none;
}
```

Uses SVG `feTurbulence` with `baseFrequency="0.9"`, `numOctaves="4"` at `opacity="0.035"`.

**Polaroid Wall Background** (`globals.css` `.polaroid-wall-bg`):

```css
.polaroid-wall-bg {
  background-color: #f5f0eb;
  background-image:
    radial-gradient(
      ellipse at 20% 50%,
      rgba(186, 162, 131, 0.12) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 20%,
      rgba(186, 162, 131, 0.08) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 50% 80%,
      rgba(186, 162, 131, 0.06) 0%,
      transparent 50%
    );
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

Three very subtle warm-brown radial gradients creating depth on a cream base.

### 3.5 Soft Shadow Patterns

**Polaroid Front**:

```css
.polaroid-front {
  box-shadow:
    2px 3px 12px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.06);
}
```

**Polaroid Back**:

```css
.polaroid-back {
  box-shadow: 2px 3px 12px rgba(0, 0, 0, 0.1);
}
```

**Pin Board Card** (uses filter instead):

```css
.pin-board-card {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.14));
}
.pin-board-card:hover {
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.2));
}
```

**Pin Board Surface**:

```css
.pin-board-surface {
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 -1px 0 rgba(255, 255, 255, 0.2);
}
```

**Heart Note Card**:

```css
box-shadow: 0 12px 28px rgba(120, 0, 55, 0.25);
```

Uses a warm magenta-tinted shadow (`rgba(120, 0, 55, 0.25)`) — the only colored shadow in the system.

**Jar SVG**:

```tsx
style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}
```

**Key pattern**: Shadows are always black-alpha or warm-magenta-alpha, never gray or cool-toned. Blur radii range from 3px (subtle) to 28px (dramatic). Spread is never used; softness comes from blur alone.

### 3.6 Warm Gradients

**Polaroid photo backgrounds** — 12 gradient pairs used cyclically:

```ts
const gradients = [
  'linear-gradient(135deg, #FFB6C1, #FF85A2)', // pink
  'linear-gradient(135deg, #DCD0FF, #B8A9E8)', // lilac
  'linear-gradient(135deg, #A8F0D0, #7DDBB5)', // mint
  'linear-gradient(135deg, #FFE066, #F5C842)', // gold
  'linear-gradient(135deg, #FFB4A2, #FF8A75)', // coral
  'linear-gradient(135deg, #FECACA, #FCA5A5)', // rose
  'linear-gradient(135deg, #C4B5FD, #A78BFA)', // violet
  'linear-gradient(135deg, #A7F3D0, #6EE7B7)', // emerald
  'linear-gradient(135deg, #FDE68A, #FCD34D)', // amber
  'linear-gradient(135deg, #FBCFE8, #F9A8D4)', // pink
  'linear-gradient(135deg, #BAE6FD, #7DD3FC)', // sky
  'linear-gradient(135deg, #FED7AA, #FDBA74)', // peach
];
```

All use 135deg angle. Each is a light-to-medium pastel ramp.

### 3.7 Gingham Pattern

Used in the Love Jar gift interior:

```tsx
background: `
  linear-gradient(45deg, rgba(255,182,210,0.25) 25%, transparent 25%),
  linear-gradient(-45deg, rgba(255,182,210,0.25) 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, rgba(255,182,210,0.25) 75%),
  linear-gradient(-45deg, transparent 75%, rgba(255,182,210,0.25) 75%)
`,
backgroundSize: '20px 20px',
backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
backgroundColor: '#FFF0F5',
```

Pink gingham on lavender blush base. 20px repeat.

### 3.8 Sparkle Particles

```css
.love-jar-sparkle-drift {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.9),
    rgba(255, 200, 230, 0.3)
  );
  animation: love-jar-drift linear infinite;
  opacity: 0;
}

@keyframes love-jar-drift {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.5);
  }
  15% {
    opacity: 0.7;
  }
  85% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
    transform: translate(-20px, -40px) scale(0.2);
  }
}
```

### 3.9 Hand-drawn SVG Conventions

**Crochet Rose** (`polaroid-wall.tsx` `CrochetRose()`):

- 5 rotated ellipses (72° apart) forming petals, fills `#FFC0CB` and `#FFB8C4`
- Stroke: `#F0AEBB`, strokeWidth `0.6`
- Center circle: `#FFAEC9`, stroke `#E89AB0`, strokeWidth `0.5`
- Inner spiral detail: `#FF98B5` at 50% opacity

**Garland Leaf** (`GarlandLeaf()`):

- viewBox `0 0 14 8`
- Leaf shape via quadratic beziers
- Two color variants: `#8B9F80` (light) and `#7DA178` (dark)
- Center vein line: strokeWidth `0.4`
- Supports `scaleX(-1)` flip

**Clothespin** (`WallClothespin()` and `Clothespin()`):

- viewBox `0 0 28 40`
- Wooden body: `#D4B896` with `#C0A47C` stroke
- Center dashed line (wood grain): strokeDasharray `1 1.5`
- Highlight strips: `rgba(255,255,255,0.12)`
- Metal spring: `#B8AFA0` with `#A09484` stroke
- Heart at top: `#FF85A2` with `#E06B88` stroke (wall version) or white (pin version)
- Specular highlight: white ellipse at 30-35% opacity

**Puppy SVG** (sorry-puppy):

- All body parts are SVG ellipses/circles/paths
- Fur: `#D4A574`, belly/paws: `#F5E6D3`, ears: `#B8860B`
- Eyes switch between sad (half-lid `#D4A574` overlay) and happy (full circle with white shine)
- Blush: `#FFB6C1` at 40% opacity
- Tail wag animation on happy state

Line weight pattern: 0.3-0.6px for details, 1-1.5px for outlines, 3-5px for main strokes.

---

## 4. Language C — The Bridge (Transitions)

### 4.1 The Gift Loading Transition

When a user clicks a polaroid in the catalog (Language A), the `GiftLoading` component appears as a Y2K-style modal. This is the exact bridge moment:

```tsx
// src/components/gift-loading.tsx
<div
  className="fixed inset-0 z-[10001]"
  style={{ background: 'rgba(0, 0, 0, 0.4)' }}
>
  <div className="win98-window" style={{ width: 340 }}>
    <div className="win98-titlebar">
      <span>Opening gift...</span>
    </div>
    <div className="win98-body">
      <p className="font-pixel">Copying Love to your heart...</p>
      {/* 📁 → 📄 → 📁 file-copy animation */}
      {/* Win98 progress bar with pink gradient fill */}
    </div>
  </div>
</div>
```

The file-copy animation (`gift-loading-paper`):

```css
@keyframes paper-fly {
  0%,
  100% {
    transform: translateX(-14px) translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateX(14px) translateY(-8px);
    opacity: 1;
  }
}
```

This is pure Language A. After 1.5 seconds at 100%, `onComplete` fires and the router navigates to the gift detail page, which renders entirely in Language B.

### 4.2 The Gift Frame Transition

The `GiftFrame` component (`src/components/gift-frame/gift-frame.tsx`) wraps every recipient-viewed gift. It manages the phase sequence: `anticipation → reveal → active → climax → post-gift`.

**Anticipation Screen** — the first thing a recipient sees:

```tsx
<motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface">
  <motion.h1
    className="font-display text-[28px] font-bold text-on-surface"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.8 }}
  >
    {recipientName}
  </motion.h1>
  <motion.p
    className="font-handwritten text-xl text-on-surface-variant"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.8, duration: 0.8 }}
  >
    Someone made something special for you...
  </motion.p>
</motion.div>
```

This screen uses `bg-surface` (Material Design token from the Artisanal Elegance palette), `font-display` (Fraunces), and `font-handwritten` (Caveat). It belongs entirely to Language B — no Y2K chrome.

After 2000ms, it transitions to:

**Gift Reveal**:

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
>
  {children}
</motion.div>
```

Spring animation: stiffness 200, damping 20. Gift scales from 0.9 to 1.

### 4.3 Hybrid Moments

**Love Jar (rebuilt):** Pure Language B — no `win98-window` wrapper, no titlebar, no status bar. Renders directly inside `GiftFrame` with cream background (`#f5f0eb`), hand-illustrated SVG jar, folded paper hearts, arrival popup, memory shelf, and ambient sparkles/bokeh. The entire recipient experience is Language B from start to finish.

**Polaroid Wall** is wrapped in a `win98-window` with "📷 MEMORIES.exe" titlebar (Language A), but the body uses `!bg-transparent !p-0` to strip the white background, revealing the cream `polaroid-wall-bg` (Language B).

### 4.4 The `g/layout.tsx` Stripping

The recipient gift viewer route (`/g/[shortId]`) uses a bare layout:

```tsx
export default function RecipientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

This renders inside the root layout, so the scanline overlay, taskbar, footer, and all Y2K chrome are still present. The `GiftFrame` component then uses `fixed inset-0` positioning to overlay the entire viewport, effectively hiding the Y2K shell behind a full-screen Language B experience.

---

## 5. Boundary Rules

### Routes by Language

| Route                | Language      | Notes                                                            |
| -------------------- | ------------- | ---------------------------------------------------------------- |
| `/` (homepage)       | **A** (shell) | Hero, polaroid wall, how-it-works, testimonials, CTA, footer     |
| `/pricing`           | **A**         | Pricing page (not audited, minimal content)                      |
| `/privacy`, `/terms` | **A**         | Legal pages                                                      |
| `/dashboard`         | **A**         | Dashboard (not audited)                                          |
| `/gift/[slug]`       | **A→B**       | Preview pages; sorry-puppy uses dark bg, love-jar uses GiftFrame |
| `/create/[slug]`     | **A→B**       | Creator flow (love-jar uses custom pages)                        |
| `/g/[shortId]`       | **B**         | Recipient view — GiftFrame overlays everything                   |

### Components by Language

| Component                         | Language                           |
| --------------------------------- | ---------------------------------- |
| `Taskbar`                         | A                                  |
| `Footer`                          | A                                  |
| `HeroSection`                     | A                                  |
| `HowItWorks`                      | A                                  |
| `Testimonials`                    | A                                  |
| `CommunityCTA`                    | A                                  |
| `StickyCTA`                       | A                                  |
| `ShutdownButton`                  | A                                  |
| `WelcomePopup`                    | A                                  |
| `Y2KContextMenu`                  | A                                  |
| `ToastProvider`                   | A                                  |
| `RetroSounds`                     | A                                  |
| `GiftLoading`                     | A (bridge)                         |
| `DesktopPet`                      | A (pixel art)                      |
| `LoveStats`                       | A                                  |
| `PinBoard`                        | A surface + B interior             |
| `PolaroidWall`                    | A frame + B interior               |
| `GiftFrame`                       | B                                  |
| `AnticipationScreen`              | B                                  |
| `GiftReveal`                      | B                                  |
| `ConversionCta`                   | B                                  |
| `ReplayButton`                    | B                                  |
| `Watermark`                       | B                                  |
| `HeartNote`                       | B                                  |
| `SorryPuppy`                      | B                                  |
| `LoveJar`                         | B (Pure Language B, no Y2K chrome) |
| `Win98Chrome` (`TitlebarButtons`) | A                                  |

### The Handoff Rules

1. **The shell may frame — but doesn't have to.** Some gifts (e.g., Sorry Puppy) render as pure Language B inside `GiftFrame`. Others may wrap in a `win98-window` chrome shell. Love Jar is Pure Language B — no Y2K chrome.
2. **Font is the clearest signal.** VT323 (`font-pixel`) = Language A. Caveat (`font-handwritten`) = Language B. Fraunces (`font-display`) = neutral, used in both.
3. **Background color is the boundary.** `#c8a2e8` (lavender) = Language A territory. Cream/pink/white = Language B territory.
4. **The scanline overlay is always present.** It's in the root layout at z-9999. Even Language B experiences render under it. This is the one Language A element that crosses the boundary.
5. **Recipient views go full-screen Language B.** The `GiftFrame` uses `fixed inset-0` to cover everything, but the root layout's taskbar and footer are technically still in the DOM behind it.

---

## 6. Reusable Patterns for New Gifts

### 6.1 Polaroid Arrangement (Hero Pattern)

The polaroid system exists in two forms: **Pin Board** (static, simple) and **Polaroid Wall** (garland-string, dynamic). The Polaroid Wall is the richer pattern.

#### Structure

Polaroids hang from catenary "strings" (SVG quadratic bezier curves) inside a cream-colored wall surface, all wrapped in a win98-window.

```
win98-window ("📷 MEMORIES.exe")
  └── polaroid-wall-bg (cream #f5f0eb)
       └── garland-string-row (one per row of polaroids)
            ├── garland-svg (thread + vine SVG)
            ├── garland-flora (rose/leaf clusters)
            └── garland-polaroids (flex row of slots)
                 └── garland-slot
                      ├── WallClothespin (SVG)
                      └── garland-polaroid
                           └── polaroid-flipper
                                ├── polaroid-front
                                │    ├── polaroid-photo (gradient bg + emoji)
                                │    └── polaroid-caption
                                └── polaroid-back
                                     ├── description text
                                     ├── "Create This Gift →" button
                                     └── "✕ clip back" dismiss
```

#### Sizing

| Element               | Desktop           | Mobile            |
| --------------------- | ----------------- | ----------------- |
| Polaroids per string  | 5                 | 3                 |
| Slot width            | `flex: 0 1 150px` | `flex: 0 1 105px` |
| Photo area            | `aspect-ratio: 1` | `aspect-ratio: 1` |
| Emoji size            | 48px              | 44px              |
| Polaroid padding      | `8px 8px 0`       | `8px 8px 0`       |
| Caption padding       | `8px 4px 14px`    | `8px 4px 14px`    |
| Gap between polaroids | `16px`            | `8px`             |

#### Rotation / Tilt

Sway angles are picked from a fixed array and assigned cyclically:

```ts
const swayAngles = [-4, 2, -3, 5, -1, 3, -5, 1, -2, 4];
// Applied via CSS custom property:
style={{ ['--base-angle']: `${angle}deg` }}
```

Range: **-5° to +5°**. Each polaroid sways ±3° around its base angle:

```css
@keyframes polaroid-sway {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}
```

Duration varies per card: `4 + (globalIdx % 3)` seconds (4-6s). Delay: `(globalIdx * 0.7) % 4` seconds.

#### Catenary Sag

Each polaroid's vertical offset (hanging depth) follows a parabolic sag function:

```ts
function getSagOffset(index: number, total: number, maxSag: number) {
  if (total <= 1) return 0;
  const t = (index + 0.5) / total;
  return maxSag * 4 * t * (1 - t);
}
```

`maxSag`: 20px desktop, 14px mobile. Middle card sags most. Applied as `paddingTop`.

#### Thread SVG

```ts
const THREAD_D = 'M-10,8 Q500,34 1010,8';
```

A single quadratic bezier in a `0 0 1000 40` viewBox, drawn as a `#C19A6B` stroke at width 3.5.

A vine wraps around the thread (3 wraps), split into "behind" and "front" segments using sine wave intersection detection. Vine stroke: `#8B9F80` at width 1.5.

#### Flora Clusters

6 clusters are positioned along the thread at `t = [0.1, 0.25, 0.42, 0.58, 0.75, 0.9]`. Each has:

- One `CrochetRose` (rotated, scaled 0.85-1.0)
- 2-3 `GarlandLeaf` components (offset ±13px dx, ±8px dy)

Position is calculated by evaluating the bezier curve at `t`:

```ts
function getThreadPoint(t: number) {
  const x = (1 - t) * (1 - t) * -10 + 2 * (1 - t) * t * 500 + t * t * 1010;
  const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 34 + t * t * 8;
  return { left: (x / 1000) * 100, top: (y / 40) * 100 };
}
```

#### Clothespin

Positioned at the top of each slot, connecting the polaroid to the string. Negative top margin creates overlap with the thread.

```css
.garland-clothespin {
  width: 24px;
  height: 36px;
  margin-top: -24px;
  margin-bottom: -8px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18));
}
```

Second-child gets extra negative margin (`-34px`) to align with the thread sag.

#### Flip Interaction

Click toggles `flippedSlug` state. When flipped:

```css
.garland-polaroid.is-unclipped {
  animation: none; /* Stop sway */
  translate: 0 -12px; /* Lift up slightly */
  rotate: 0deg; /* Straighten */
}

.polaroid-flipper.is-flipped {
  transform: rotateY(180deg);
}
```

The flip uses CSS `perspective: 800px`, `transform-style: preserve-3d`, and `backface-visibility: hidden` on front/back faces. Transition: `0.4s ease`.

#### Drop-in Animation

Entire string rows animate in on viewport intersection:

```css
@keyframes string-drop-in {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.garland-string-row {
  animation: string-drop-in 0.4s ease-out both;
  animation-play-state: paused;
  opacity: 0;
}
.garland-string-row.is-visible {
  animation-play-state: running;
  opacity: 1;
}
```

Stagger: `animationDelay: ${stringIdx * 0.12}s`.

Uses IntersectionObserver with `threshold: 0.15`, `rootMargin: '0px 0px -40px 0px'`. Respects `prefers-reduced-motion: reduce`.

#### "Show More" Button

```tsx
<button className="garland-show-more">
  <span className="font-handwritten text-[18px] text-[#8B7355]">
    hang more photos 📸
  </span>
</button>
```

```css
.garland-show-more {
  background: none;
  border: 2px dashed #c4a882;
  border-radius: 8px;
  padding: 10px 24px;
}
.garland-show-more:hover {
  background: rgba(160, 132, 92, 0.08);
  border-color: #a0845c;
}
```

#### Pin Board Variant (Simpler)

The Pin Board uses the same polaroid card structure but without the garland/string system:

- Fixed array of 5 cards
- Pastel pink surface (`#efafcc`) with grain overlay
- Cards have `--card-tilt` CSS custom property (range: -3° to +3°)
- Hover: `translateY(-4px) scale(1.04)` with shadow expansion
- Desktop: single row. Mobile: 3+2 stagger layout (nth-child rules)
- Clothespin uses white heart instead of pink (Pin Board variant)

### 6.2 Handwriting + Paper Combo

The canonical implementation is the Heart Note in Love Jar:

```tsx
<div
  className="love-jar-note-paper relative rounded-md px-6 py-7"
  style={{
    background: '#FFFCF6',
    boxShadow: '0 12px 28px rgba(120,0,55,0.25)',
  }}
>
  <div className="love-jar-torn-edge-top" />
  <span
    className="absolute right-3 top-3 opacity-40"
    style={{ fontSize: '16px' }}
  >
    {doodle}
  </span>
  <p className="text-center font-handwritten text-[22px] leading-[1.35] text-[#3D2817]">
    {message}
  </p>
  <p
    className="mt-5 text-center text-[10px] lowercase text-[#A08060]/50"
    style={{ fontFamily: 'Tahoma, sans-serif' }}
  >
    tap to put it back ♡
  </p>
</div>
```

**Recipe:**

- Paper: `#FFFCF6` with subtle lavender + pink radial gradient blushes at 5-6% opacity
- Border: `1px solid rgba(160, 128, 96, 0.12)` — barely-there warm brown
- Font: Caveat at 22px, `leading-[1.35]`, color `#3D2817` (warm dark brown)
- Corner doodle: one of `['♡', '💌', '✨', '🤍', '🌸']` at 40% opacity
- Hint text: Tahoma 10px at 50% opacity, lowercase
- Shadow: `0 12px 28px rgba(120, 0, 55, 0.25)` — warm magenta tint
- Torn edge: wavy SVG mask at top, 4px tall
- Slight rotation: `-2 + (noteIndex % 5) - 1` degrees (range: -3° to +2°)

**Unfold animation** (Framer Motion):

```ts
initial: { scale: 0.25, opacity: 0, rotateX: -120, y: 80 }
animate: { scale: 1, opacity: 1, rotateX: 0, rotate: rotation, y: 0 }
transition: { type: 'spring', stiffness: 180, damping: 12, mass: 0.8 }
```

Backdrop: `rgba(120, 0, 55, 0.15)` — warm magenta tint.

### 6.3 Soft Shadows

Summary of every shadow value in the system:

| Context               | Value                                                                                                                             | Language |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Win98 window          | `1px 1px 0 0 #000`                                                                                                                | A        |
| Win98 window (mobile) | `1px 1px 0 0 rgba(0,0,0,0.4)`                                                                                                     | A        |
| Testimonial cards     | `2px 2px 0 0 rgba(0,0,0,0.2)`                                                                                                     | A        |
| Sticky CTA            | `3px 3px 0 0 rgba(0,0,0,0.3)`                                                                                                     | A        |
| Welcome popup         | `2px 2px 0 0 #000`                                                                                                                | A        |
| Desktop icon emoji    | `drop-shadow(2px 2px 0 rgba(0,0,0,0.15))`                                                                                         | A        |
| Polaroid front        | `2px 3px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)`                                                                        | B        |
| Polaroid back         | `2px 3px 12px rgba(0,0,0,0.1)`                                                                                                    | B        |
| Pin board surface     | `0 6px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06), inset 0 2px 6px rgba(0,0,0,0.06), inset 0 -1px 0 rgba(255,255,255,0.2)` | B        |
| Pin board card        | `drop-shadow(0 2px 6px rgba(0,0,0,0.14))` → hover: `drop-shadow(0 6px 16px rgba(0,0,0,0.2))`                                      | B        |
| Pin board polaroid    | `1px 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)`                                                                        | B        |
| Polaroid emoji        | `drop-shadow(1px 2px 4px rgba(0,0,0,0.15-0.2))`                                                                                   | B        |
| Heart note            | `0 12px 28px rgba(120,0,55,0.25)`                                                                                                 | B        |
| Jar SVG               | `drop-shadow(0 6px 12px rgba(0,0,0,0.12))`                                                                                        | B        |
| Clothespin            | `drop-shadow(0 1px 2px rgba(0,0,0,0.18))` or `drop-shadow(0 2px 3px rgba(0,0,0,0.2))`                                             | B        |
| Wall inset            | `inset 0 2px 8px rgba(0,0,0,0.06)`                                                                                                | B        |
| Polaroid wall bg      | `inset 0 2px 8px rgba(0,0,0,0.06)`                                                                                                | B        |

**Pattern**: Language A uses hard, 0-blur pixel-offset shadows (0px blur). Language B uses soft, blurred shadows (3-28px blur). This is the single strongest visual differentiator between the two languages.

### 6.4 Background Atmospherics

**Layer order** (polaroid wall):

1. `polaroid-wall-bg` — cream base `#f5f0eb` with 3 warm-brown radial gradients (z-auto, base layer)
2. Garland SVG thread + vine (z-1 via `.garland-svg`)
3. Flora items (z-3 via `.garland-flora`)
4. Clothespins (z-6 via `.pin-board-clothespin` in pin board variant)
5. Polaroids (z-2 via `.garland-polaroids`)

**Layer order** (Love Jar):

1. Gingham pattern (absolute, inset 0)
2. Sparkle drift particles (absolute, pointer-events none)
3. Content area (relative z-10)
4. Rising heart animation (z-20)
5. Heart note overlay (z-40, fixed)

**Layer order** (Sorry Puppy):

1. Clear sky gradient (`#87CEEB → #B3E5FC → #FFF8E1`)
2. Storm overlay gradient (`#37474F → #455A64 → #546E7A`, opacity controlled by `rainIntensity`)
3. Bright ground (`#7CB342`)
4. Wet ground overlay (`#4E6B4F`, opacity fades with rain)
5. Rainbow SVG (when visible)
6. Puppy SVG
7. Rain drops
8. Tap hint
9. Message card (white/85 backdrop-blur)

### 6.5 Cute Micro-Interactions

**Desktop Pet bob**:

```css
@keyframes pet-idle-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
/* 2.5s ease-in-out infinite */
```

**Desktop Pet tap bounce**:

```css
@keyframes pet-tap-bounce {
  0% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-12px) scale(1.15, 0.9);
  } /* squash */
  50% {
    transform: translateY(-8px) scale(0.95, 1.1);
  } /* stretch */
  70% {
    transform: translateY(-3px) scale(1.05, 0.97);
  } /* settle */
  100% {
    transform: translateY(0) scale(1);
  }
}
/* 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) */
```

**Pet drift**: `transition: transform 1.8s cubic-bezier(0.4, 0, 0.2, 1)` — Material Design standard easing.

**Polaroid hover**:

```css
.pin-board-card:hover {
  transform: rotate(var(--card-tilt)) translateY(-4px) scale(1.04);
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.2));
}
/* transition: transform 0.3s ease, filter 0.3s ease */
```

**Jar shake** (Framer Motion):

```ts
animate: {
  rotate: [0, -3, 3, -2, 2, -0.5, 0],
  scaleX: [1, 1.02, 0.98, 1.01, 0.99, 1],
  scaleY: [1, 0.98, 1.02, 0.99, 1.01, 1],
}
transition: { duration: 0.6, ease: 'easeOut' }
```

**Jar idle breathing**:

```ts
animate: { scale: [1, 1.006, 1], rotate: 0 }
transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
```

**Rising heart** (Love Jar, Framer Motion):

```ts
initial: { opacity: 0, y: 0, scale: 0.6, rotateY: 0 }
animate: {
  opacity: [0, 1, 1, 0.9],
  y: -120,
  scale: [0.6, 1, 1.8, 2.5],
  rotateY: 360,
}
transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
```

**Reveal stagger** (`useReveal` hook):

```ts
el.style.opacity = '0';
el.style.transform = 'translateY(20px)';
el.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
el.style.transitionDelay = `${i * staggerMs}ms`; // default 80ms
```

Triggered by IntersectionObserver: `threshold: 0.15`, `rootMargin: '0px 0px -40px 0px'`.

---

## 7. Design Tokens

### 7.1 Full Color Palette

**Language A — Y2K**

| Token                        | Hex       | Usage                           |
| ---------------------------- | --------- | ------------------------------- |
| `--win-bg` / `--win-body-bg` | `#c8a2e8` | Page background                 |
| `--win-chrome`               | `#c0c0c0` | Window chrome, taskbar, buttons |
| `--win-chrome-light`         | `#dfdfdf` | Raised edge                     |
| `--win-chrome-dark`          | `#808080` | Sunken inner edge               |
| `--win-chrome-darkest`       | `#404040` | Sunken outer edge               |
| `--win-title-start`          | `#ff69b4` | Title gradient start            |
| `--win-title-end`            | `#ba55d3` | Title gradient end              |
| `--win-title-text`           | `#ffffff` | Title bar text                  |
| `--win-hot-pink`             | `#ff69b4` | Accent                          |
| `--win-magenta`              | `#ff1493` | Deep accent                     |
| `--win-neon`                 | `#ff6ec7` | Neon accent (defined, unused)   |
| `ink`                        | `#1a0a2e` | Primary text color              |

**Language B — Handmade**

| Hex       | Semantic Name   | Usage                        |
| --------- | --------------- | ---------------------------- |
| `#f5f0eb` | Warm Cream      | Wall background              |
| `#FFFCF6` | Paper White     | Note paper                   |
| `#FFF0F5` | Lavender Blush  | Gingham base                 |
| `#efafcc` | Board Pink      | Pin board surface            |
| `#3D2817` | Ink Brown       | Handwritten text             |
| `#A08060` | Muted Brown     | Hint text                    |
| `#8B7355` | Twine           | String color, secondary text |
| `#C19A6B` | Thread Tan      | Garland thread               |
| `#D4B896` | Clothespin Wood | Pin body                     |
| `#C0A47C` | Pin Accent      | Pin details                  |
| `#8B9F80` | Sage Leaf       | Vine, leaf                   |
| `#7DA178` | Dark Leaf       | Leaf variant                 |
| `#FFC0CB` | Rose Petal      | Crochet rose                 |
| `#FF85A2` | Heart Pink      | Clothespin heart             |
| `#D81B60` | Jar Heart       | Love Jar heart               |

**Both Languages — Material Design (Artisanal Elegance)**

Defined as HSL in `:root` and used for gift frame components:

| Token                  | HSL            | Approx Hex | Usage                 |
| ---------------------- | -------------- | ---------- | --------------------- |
| `--primary`            | `335 100% 23%` | `#760028`  | Primary buttons       |
| `--surface`            | `275 50% 91%`  | `#e9ddf0`  | Gift frame background |
| `--on-surface`         | `270 40% 15%`  | `#1e0f30`  | Text on surface       |
| `--on-surface-variant` | `280 20% 30%`  | `#3d2d4d`  | Secondary text        |

### 7.2 Typography Scale

| Tailwind Class          | Font Family         | Usage                              |
| ----------------------- | ------------------- | ---------------------------------- |
| `font-display`          | Fraunces (serif)    | Headlines, card titles, gift names |
| `font-body` / `font-ui` | Outfit (sans-serif) | Body text, descriptions, UI labels |
| `font-handwritten`      | Caveat (cursive)    | Love notes, emotional text, CTAs   |
| `font-pixel`            | VT323 (monospace)   | Y2K chrome, system text, filenames |

Sizes used:

| Size   | Where                                                               |
| ------ | ------------------------------------------------------------------- |
| `10px` | Heart note hint, love jar live indicator                            |
| `11px` | Mobile card titles, card descriptions                               |
| `13px` | Desktop icon labels, polaroid captions, system stats, pixel UI      |
| `15px` | Taskbar text, body text, popup messages, context menu, buttons base |
| `18px` | Buttons, shutdown text, show-more, step titles                      |
| `22px` | Heart note message, love jar instruction                            |
| `24px` | Hero headline mobile, section headings, community CTA mobile        |
| `28px` | Anticipation screen name                                            |
| `32px` | Hero headline desktop, section headings desktop                     |
| `36px` | Desktop icon emoji                                                  |
| `40px` | Section headings desktop (media query)                              |
| `44px` | Polaroid emoji mobile                                               |
| `48px` | Polaroid emoji desktop                                              |

### 7.3 Spacing Scale

Custom CSS properties:

| Token         | Desktop | Mobile  |
| ------------- | ------- | ------- |
| `--space-xs`  | `16px`  | `12px`  |
| `--space-sm`  | `32px`  | `24px`  |
| `--space-md`  | `64px`  | `48px`  |
| `--space-lg`  | `96px`  | `72px`  |
| `--space-xl`  | `144px` | `120px` |
| `--space-2xl` | `192px` | `156px` |

Breakpoint: 767px. Used for section padding/margins.

### 7.4 Border Radius

From `tailwind.config.ts`:

```ts
borderRadius: {
  lg: 'var(--radius)',              // 0px
  md: 'calc(var(--radius) - 2px)', // -2px (effectively 0)
  sm: 'calc(var(--radius) - 4px)', // -4px (effectively 0)
}
```

`--radius: 0px` — the system has **zero border radius by default** (sharp corners for Y2K).

Explicit radii used:

- `rounded-xl` (12px): Sorry Puppy container, message card
- `rounded-lg` (8px): Conversion CTA button, replay button, show-more button
- `rounded-md` (6px): Heart note paper
- `14px`: Pin board surface
- `3px`: Polaroid frame (`.pin-board-polaroid`)
- `2px`: Polaroid photo inner corner
- `0px`: Win98 windows, buttons (square corners)

### 7.5 Z-Index Layers

| Z-Index | Element                                  |
| ------- | ---------------------------------------- |
| 1       | Garland SVG thread                       |
| 2       | Garland polaroids                        |
| 3       | Garland flora                            |
| 6       | Pin board clothespin                     |
| 10      | Content over backgrounds (Love Jar)      |
| 20      | Rising heart animation                   |
| 40      | Heart note overlay, watermark            |
| 50      | Taskbar, anticipation screen, sticky CTA |
| 9999    | Scanline overlay                         |
| 10000   | Welcome popup                            |
| 10001   | Gift loading modal                       |
| 10002   | Context menu                             |
| 10003   | Toast notifications                      |

### 7.6 Breakpoints

Single breakpoint system: **768px** (Tailwind `md`).

```
< 768px  = Mobile (360px baseline)
≥ 768px  = Desktop
```

Mobile adaptations:

- Win98 windows: thinner borders (1px), less padding
- Buttons: min-height 44px, inline-flex centered (touch targets)
- Polaroid wall: 3 per row instead of 5
- Spacing scale shrinks ~25%
- Desktop icons hidden
- Floating windows hidden
- Center marquee text hidden
- Context menu disabled
- Custom cursor disabled

---

## 8. Animation Conventions

### 8.1 Animation Library

**Framer Motion** — used for:

- Gift reveal spring animation
- Anticipation screen fade-in
- Heart note unfold/fold
- Jar shake/breathing
- Rising heart
- Conversion CTA fade-in
- Replay button fade-in
- Love Jar instruction text enter/exit

**CSS Animations** — used for:

- Polaroid sway
- String drop-in
- Float gentle (hero windows)
- Popup appear/dismiss
- Pet idle bob, tap bounce, heart arc
- Rain fall, tail wag, rainbow draw
- Blink cursor, shimmer, progress fill
- Sparkle drift

### 8.2 Standard Easings

| Context           | Easing                                           | Duration                                |
| ----------------- | ------------------------------------------------ | --------------------------------------- |
| Gift reveal       | Spring: `stiffness: 200, damping: 20`            | ~0.5s                                   |
| Heart note unfold | Spring: `stiffness: 180, damping: 12, mass: 0.8` | ~0.6s                                   |
| Anticipation text | `ease`                                           | `delay: 0.3, duration: 0.8`             |
| Polaroid flip     | `ease`                                           | `0.4s`                                  |
| Hover transitions | `ease`                                           | `0.3s`                                  |
| Reveal stagger    | `ease-out`                                       | `600ms` per element, 80ms delay between |
| Popup appear      | `cubic-bezier(0.34, 1.56, 0.64, 1)`              | `0.3s`                                  |
| Pet drift         | `cubic-bezier(0.4, 0, 0.2, 1)`                   | `1.8s`                                  |
| Jar shake         | `easeOut`                                        | `0.6s`                                  |
| Jar breathing     | `easeInOut`                                      | `3s infinite`                           |
| Rising heart      | `[0.4, 0, 0.2, 1]` (custom)                      | `0.7s`                                  |

### 8.3 Spring Configs

| Use               | Stiffness                                | Damping | Mass        |
| ----------------- | ---------------------------------------- | ------- | ----------- |
| Gift reveal       | 200                                      | 20      | default (1) |
| Heart note unfold | 180                                      | 12      | 0.8         |
| Pet tap bounce    | CSS: `cubic-bezier(0.34, 1.56, 0.64, 1)` | —       | —           |
| Popup appear      | CSS: `cubic-bezier(0.34, 1.56, 0.64, 1)` | —       | —           |

### 8.4 Reduced Motion Handling

- `useReveal` hook: checks `prefers-reduced-motion: reduce`, sets all items to `opacity: 1` and `transform: none` immediately
- Desktop pet: `@media (prefers-reduced-motion: reduce)` disables mover transition, bobber animation, and hides hearts
- Love Jar: `@media (prefers-reduced-motion: reduce)` hides sparkle particles, disables live pulse
- Polaroid wall: IntersectionObserver skipped, all rows shown immediately

---

## 9. Component Primitives

### Layout Components

| Component | File                 | Language | Props/Notes                                                |
| --------- | -------------------- | -------- | ---------------------------------------------------------- |
| `Taskbar` | `layout/taskbar.tsx` | A        | No props. Renders Start button, marquee, tray icons, clock |
| `Footer`  | `layout/footer.tsx`  | A        | No props. Win98 window with brand/links/stats              |
| `Header`  | `layout/header.tsx`  | —        | Exists but unused in current routes                        |

### Y2K System Components

| Component         | File                   | Language   | Props/Notes                                          |
| ----------------- | ---------------------- | ---------- | ---------------------------------------------------- |
| `TitlebarButtons` | `win98-chrome.tsx`     | A          | No props. Renders minimize/maximize/close button set |
| `RetroSounds`     | `retro-sounds.tsx`     | A          | No props. Installs global click/window-open sounds   |
| `WelcomePopup`    | `welcome-popup.tsx`    | A          | No props. Session-once random dialog                 |
| `Y2KContextMenu`  | `y2k-context-menu.tsx` | A          | No props. Custom right-click menu (desktop only)     |
| `ToastProvider`   | `y2k-toast.tsx`        | A          | No props. `showToast(msg)` exported                  |
| `ShutdownButton`  | `y2k-shutdown.tsx`     | A          | No props. Mobile-only faux shutdown                  |
| `GiftLoading`     | `gift-loading.tsx`     | A (bridge) | `onComplete: () => void`. 1.5s progress bar          |

### Homepage Sections

| Component      | File                     | Language | Props/Notes                                    |
| -------------- | ------------------------ | -------- | ---------------------------------------------- |
| `HeroSection`  | `home/hero-section.tsx`  | A        | No props. Cycling headlines + desktop icons    |
| `DesktopPet`   | `home/desktop-pet.tsx`   | A        | No props. Two pixel Mochis that drift and kiss |
| `PolaroidWall` | `home/polaroid-wall.tsx` | A+B      | No props. Garland gift catalog                 |
| `PinBoard`     | `home/pin-board.tsx`     | A+B      | No props. 5-card pinned catalog                |
| `HowItWorks`   | `home/how-it-works.tsx`  | A        | No props. 3-step windows                       |
| `Testimonials` | `home/testimonials.tsx`  | A        | No props. Notepad-style review cards           |
| `CommunityCTA` | `home/community-cta.tsx` | A        | No props. System dialog CTA                    |
| `LoveStats`    | `home/love-stats.tsx`    | A        | No props. "My Computer" stats window           |
| `StickyCTA`    | `home/sticky-cta.tsx`    | A        | No props. Mobile floating CTA button           |

### Gift Frame Components

| Component            | File                                 | Language | Props                                                      |
| -------------------- | ------------------------------------ | -------- | ---------------------------------------------------------- |
| `GiftFrame`          | `gift-frame/gift-frame.tsx`          | B        | `gift: GiftData, replayBehavior: ReplayBehavior, children` |
| `AnticipationScreen` | `gift-frame/anticipation-screen.tsx` | B        | `recipientName: string, visible: boolean`                  |
| `GiftReveal`         | `gift-frame/gift-reveal.tsx`         | B        | `visible: boolean, onAnimationComplete, children`          |
| `ConversionCta`      | `gift-frame/conversion-cta.tsx`      | B        | `visible: boolean`                                         |
| `ReplayButton`       | `gift-frame/replay-button.tsx`       | B        | `visible, replayBehavior, onReplay`                        |
| `Watermark`          | `gift-frame/watermark.tsx`           | B        | `paid: boolean`                                            |
| `ReactionSnapSlot`   | `gift-frame/reaction-snap-slot.tsx`  | B        | No props (stubbed)                                         |
| `PlaceholderGift`    | `gift-frame/placeholder-gift.tsx`    | B        | `recipientName: string`                                    |

### Gift Components

| Component           | File                                               | Language | Props                                                        |
| ------------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `SorryPuppy`        | `gifts/sorry-puppy/sorry-puppy.tsx`                | B        | `mode: 'preview' \| 'actual', message?: string, onComplete?` |
| `LoveJar`           | `gifts/love-jar/index.tsx`                         | B        | `gift, replayBehavior`                                       |
| `ArrivalPopup`      | `gifts/love-jar/components/arrival-popup.tsx`      | B        | `recipientName, senderName, messageCount, onOpen`            |
| `JarIllustrated`    | `gifts/love-jar/components/jar-illustrated.tsx`    | B        | `recipientName, hearts, energy, phase, onShake`              |
| `JarHearts`         | `gifts/love-jar/components/jar-hearts.tsx`         | B        | `hearts, intensity`                                          |
| `JarRibbonTag`      | `gifts/love-jar/components/jar-ribbon-tag.tsx`     | B        | `recipientName`                                              |
| `HeartNote`         | `gifts/love-jar/components/heart-note.tsx`         | B        | `message, visible, noteIndex, onReturn, onKeep`              |
| `MemoryShelf`       | `gifts/love-jar/components/memory-shelf.tsx`       | B        | `notes`                                                      |
| `ShakePrompt`       | `gifts/love-jar/components/shake-prompt.tsx`       | B        | `energy, visible`                                            |
| `AmbientBackground` | `gifts/love-jar/components/ambient-background.tsx` | B        | (no props)                                                   |
| `EmptyJarState`     | `gifts/love-jar/components/empty-jar-state.tsx`    | B        | (no props)                                                   |

### Hooks

| Hook             | File                           | Usage                                                 |
| ---------------- | ------------------------------ | ----------------------------------------------------- |
| `useGiftFrame`   | `gift-frame/use-gift-frame.ts` | Phase state machine for gift lifecycle                |
| `useGiftContext` | `gift-frame/gift-frame.tsx`    | Access `onClimax` and `trackInteraction` inside gifts |
| `useReveal`      | `hooks/use-reveal.ts`          | IntersectionObserver-based stagger reveal             |

---

## 10. Design Rules for New Gifts

Based on existing patterns, these are the non-negotiable conventions enforced by the codebase:

### Container Rule

Every gift that renders in recipient view (`/g/[shortId]`) must be wrapped in `<GiftFrame>`. The frame manages: anticipation → reveal → active → climax → post-gift.

### Language Boundary

Gift interiors are Language B. If the gift wraps itself in win98-window chrome (like Love Jar), the titlebar uses `font-pixel` and the body uses Language B patterns. The status bar (if any) is Language A.

### Font Assignment

- System/chrome text: `font-pixel` (VT323)
- Headlines/titles: `font-display` (Fraunces)
- Body/descriptions: `font-body` (Outfit)
- Emotional/personal text: `font-handwritten` (Caveat) with warm brown ink (`#3D2817` or similar)

### Shadow Rules

- Language A: hard pixel shadows only (`Npx Npx 0 0 color`, 0 blur)
- Language B: soft warm shadows only (3-28px blur, black-alpha or warm-tinted)
- Never mix these within a single component

### Animation Requirements

- All animations must respect `prefers-reduced-motion: reduce`
- Spring configs for gift reveals: stiffness 180-200, damping 12-20
- Hover transitions: 0.3s ease
- Stagger reveals: 80ms per item, 600ms each, ease-out

### Color Rules

- Y2K chrome: use `--win-*` tokens exclusively
- Gift interiors: warm cream/paper/pastel palette
- Ink on paper: warm browns (`#3D2817`, `#A08060`), never pure black or cold gray
- Page background: `#c8a2e8` (never changes)
- Inside gifts: cream, gingham, or custom atmospheric background (never lavender)

### Touch Target Rules

- Mobile buttons: `min-height: 44px`
- Interactive areas: always have `cursor: pointer` and `role="button"` with keyboard handlers
- Tap hints appear after 2s of inactivity

### Polaroid Convention

When displaying items as a catalog or gallery, use the polaroid pattern:

1. White card frame with `padding: 8px 8px 0` (or 7px on pin board, 5px on mobile)
2. Square photo area (`aspect-ratio: 1`) with gradient background
3. Emoji centered in photo
4. Caption below photo with `font-display` text
5. Slight rotation from a fixed angle array
6. Clothespin SVG connecting to a string or board
7. Drop shadow via filter
8. Hover: `translateY(-4px) scale(1.04)` with shadow expansion

### Climax Pattern

Every gift must call `onClimax()` at its emotional peak. This triggers the gift frame's post-gift sequence (reaction snap → conversion CTA → replay button).

### Interaction Tracking

Every meaningful user interaction must call `trackInteraction(type, value?)`. Uses `navigator.sendBeacon` with fallback to `fetch` + `keepalive`.
