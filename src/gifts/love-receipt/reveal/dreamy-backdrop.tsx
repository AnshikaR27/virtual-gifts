'use client';

/**
 * <DreamyBackdrop> — the field the Love Receipt reveal sits on.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  TO SWITCH THE LOOK, CHANGE ONE LINE — the BG_VARIANT constant below.     │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 *   'swirl'  THE DEFAULT. A hand-painted candy swirl: full-strength pink and
 *            cream concentric stripes radiating from the centre of the screen,
 *            deliberately wobbly and imperfect. See THE HAND-DRAWN LOOK below.
 *   'bows'   a soft pastel wash + faint line-drawn bows and 4-point sparkles
 *            drifting slowly in the MARGINS beside the receipt.
 *   'wash'   the soft pastel wash alone. The calmest baseline.
 *
 * WHY A LOUD BACKDROP IS SAFE HERE
 * --------------------------------
 * The swirl is deliberately full strength — not faded, not low-contrast. That
 * is only legible because of a hard structural guarantee, not because the
 * colours happen to be gentle:
 *
 *   the receipt sheet is FULLY OPAQUE and paints ABOVE this layer.
 *
 * <DreamyBackdrop> is `position: fixed; z-index: 0`; the receiver's scene wraps
 * the printer and the receipt in `position: relative; z-index: 1`. The sheet's
 * own background is a solid warm off-white with no alpha. So the swirl is
 * physically incapable of showing through the paper or touching the contrast of
 * the ink on it — it reads exactly like a card lying on a poster, which is the
 * effect we want. The swirl lives in the MARGINS; the paper owns the centre.
 *
 * The one thing that WOULD break this: giving the sheet, the printer chassis or
 * any wrapper a translucent background. Don't. If the receipt ever needs to be
 * see-through, this backdrop has to be dialled back at the same time.
 *
 * THE HAND-DRAWN LOOK
 * -------------------
 * A `repeating-radial-gradient` was the obvious way to build this and is
 * explicitly NOT what this is, because it looks machine-perfect: every ring
 * identical, every edge razor-sharp, one exact bullseye. Three things break
 * that here, and all three matter:
 *
 *   1. PER-RING JITTER. Each ring gets its own radius offset, its own stroke
 *      weight, and its own slightly displaced centre — so the stripes vary in
 *      width and the "bullseye" wanders, the way hand-painted rings do.
 *   2. TURBULENCE DISPLACEMENT. The whole group runs through feTurbulence +
 *      feDisplacementMap, which pushes the ring edges around into gentle
 *      waviness instead of clean geometric circles.
 *   3. A SOFT BLUR. ~1.2 units of feGaussianBlur gives the stripe boundaries a
 *      painterly bleed rather than a vector-crisp line.
 *
 * THE JITTER MUST BE SSR-DETERMINISTIC
 * ------------------------------------
 * This subtree is server-rendered under GiftReveal's Suspense boundary, so the
 * markup has to be byte-identical on both sides — a mismatched attribute here
 * throws the whole gift away and restarts the printer feed on the client.
 *
 * That rules out Math.random (obviously) but ALSO the usual
 * `Math.sin(i * 12.9898) * 43758.5453` hash trick: Math.sin is not guaranteed
 * bit-identical across engines, and this app renders on Node/V8 and hydrates in
 * whatever the recipient's phone runs. A last-ULP difference, multiplied by
 * 43758, is a visibly different number in the markup. `hash()` below is pure
 * 32-bit integer mixing instead, which is exact on every engine, and every
 * emitted number is rounded to a fixed 2dp so the strings cannot drift.
 *
 * MOBILE-FIRST
 * ------------
 * Stripe scale is matched to the reference by measurement, not by eye: scanning
 * the reference for pink/cream alternations gives 17.6 full cycles across the
 * frame width. RING_PERIOD is set so a phone sees the same ~17.6 cycles. A wide
 * viewport would otherwise see roughly double (the square viewBox is `slice`d,
 * so its unit scale tracks the LARGER screen dimension), so one media query
 * scales the swirl up past 760px to hold the same density.
 *
 * WHY THE LAYER IS OVERSIZED (`inset: -12vmax`)
 * ---------------------------------------------
 * <GiftReveal> springs its wrapper from `scale: 0.9 → 1` on mount, and a
 * transformed ancestor becomes the containing block for `position: fixed`, so
 * for ~600ms this layer resolves against that wrapper instead of the viewport.
 * The overscan means it still covers the screen edge-to-edge throughout.
 *
 * The overscan has a consequence worth knowing: percentages inside the root
 * resolve against a box 24vmax WIDER than the viewport, so `left: 4%` would
 * land off-screen. Anything needing true viewport coordinates (the ornaments,
 * which must sit in the real margins) is nested inside `styles.viewportField`,
 * which insets the overscan back off.
 *
 * NOTE ON MOTION: the swirl is deliberately STATIC. Animating it would mean
 * re-running the turbulence filter over a full-screen layer every frame, which
 * is the single most expensive thing on this page, for a pulse nobody asked
 * for. Only the 'bows' ornaments move, and they freeze under reduced motion.
 */

import type { CSSProperties } from 'react';

export type BgVariant = 'swirl' | 'bows' | 'wash';

/**
 * ⬅︎ THE ONE LINE TO CHANGE. 'swirl' | 'bows' | 'wash'
 */
export const BG_VARIANT: BgVariant = 'swirl';

/** The single editable palette. Every colour in this file comes from here. */
export const PALETTE = {
  /** ── the candy swirl ── full strength, opaque, no alpha. */
  swirlPink: '#f4a8c8',
  swirlCream: '#fdf3e0',

  /** ── the soft wash, used by 'bows' and 'wash' ── top → bottom. */
  washTop: '#fff8f2', // cream
  washMid: '#ffe9f0', // blush pink
  washBottom: '#f0eafb', // light lavender

  /** Huge blurred glows. Low-alpha — they read as light, not as shape. */
  glowPeach: 'rgba(255, 214, 196, 0.42)',
  glowLilac: 'rgba(206, 190, 246, 0.34)',

  /** Ornaments (bows + sparkles). */
  bowLine: '#f49ab8',
  sparkle: '#f7b7cd',
} as const;

// ── 'swirl' — the hand-painted candy rings ─────────────────────────────────

/** The SVG's own coordinate space. Square, so the rings stay circular. */
const VB = 1000;

/**
 * One full pink+cream cycle, in viewBox units.
 *
 * MEASURED, not guessed. The reference alternates every 42px across a 739px
 * frame — 17.6 complete cycles edge to edge. With the square viewBox `slice`d
 * over an overscanned phone viewport, ~403 units of the box are visible across
 * the screen width, so 403 / 17.6 ≈ 23 units per cycle reproduces the
 * reference's stripe scale on a phone.
 */
const RING_PERIOD = 23;
/** Rings are drawn out to here so the corners stay covered after displacement. */
const MAX_RADIUS = 820;
const RING_COUNT = Math.ceil(MAX_RADIUS / RING_PERIOD);

/**
 * Exact 32-bit integer hash → [0, 1). Deterministic on every JS engine, which
 * is the whole point — see THE JITTER MUST BE SSR-DETERMINISTIC above.
 */
function hash(n: number): number {
  let x = Math.imul(n + 0x9e3779b9, 0x85ebca6b) >>> 0;
  x ^= x >>> 15;
  x = Math.imul(x, 0xc2b2ae35) >>> 0;
  x ^= x >>> 13;
  x = Math.imul(x, 0x27d4eb2f) >>> 0;
  x ^= x >>> 16;
  return x / 4294967296;
}
/** Signed jitter in [-1, 1). */
const jitter = (n: number) => hash(n) * 2 - 1;

type Ring = { cx: string; cy: string; r: string; w: string };

/**
 * The rings, computed once at module load.
 *
 * Every value is rounded to 2dp before it reaches the markup so the server and
 * client strings are identical down to the character.
 *
 * The wandering centre is the detail that sells it: real hand-painted
 * "concentric" rings never share an exact origin, so each ring's centre drifts
 * by up to ~19% of a stripe width. Combined with the radius and weight jitter,
 * no two gaps come out the same size.
 */
const RINGS: Ring[] = Array.from({ length: RING_COUNT }, (_, i) => {
  const base = i * RING_PERIOD + RING_PERIOD * 0.5;
  return {
    // radius wanders by up to ±14% of a period
    r: (base + jitter(i * 4 + 1) * RING_PERIOD * 0.14).toFixed(2),
    // stroke weight varies between ~39% and ~61% of a period (nominal 50%)
    w: (RING_PERIOD * (0.5 + jitter(i * 4 + 2) * 0.11)).toFixed(2),
    // and the "bullseye" itself drifts a little, ring to ring
    cx: (VB / 2 + jitter(i * 4 + 3) * RING_PERIOD * 0.19).toFixed(2),
    cy: (VB / 2 + jitter(i * 4 + 4) * RING_PERIOD * 0.19).toFixed(2),
  };
});

/** How hard the turbulence shoves the ring edges around, in viewBox units. */
const WOBBLE = 24;
/** Painterly bleed on the stripe boundaries. */
const EDGE_BLUR = 1.2;

function CandySwirl() {
  return (
    <svg
      className="lr-swirl"
      viewBox={`0 0 ${VB} ${VB}`}
      // `slice` fills the box in both axes and crops the overflow, so the
      // rings always reach every edge no matter the aspect ratio.
      preserveAspectRatio="xMidYMid slice"
      style={styles.swirlSvg}
      aria-hidden
    >
      <defs>
        <filter
          id="lr-handpaint"
          // Generous region: displacement pulls geometry outside the nominal
          // bounds, and a tight region would clip the wobble into a straight
          // line at the edges — the one thing that would give it away.
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          // Without this the filter runs in linearRGB and the pink washes out.
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            // Low frequency = long lazy waves rather than a fuzzy crackle.
            baseFrequency="0.0055 0.0075"
            // 2 octaves, not 3: the third adds detail no one can see at this
            // displacement scale and costs real time on a mid-range phone.
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={WOBBLE}
            xChannelSelector="R"
            yChannelSelector="G"
            result="wavy"
          />
          <feGaussianBlur in="wavy" stdDeviation={EDGE_BLUR} />
        </filter>
      </defs>

      {/* Unfiltered cream floor. The displaced group can pull away from the
          edges, and this guarantees whatever it exposes is still cream rather
          than a transparent gap. */}
      <rect x="0" y="0" width={VB} height={VB} fill={PALETTE.swirlCream} />

      <g filter="url(#lr-handpaint)">
        {/* A second, filtered floor so the blur has cream to bleed into at the
            very centre instead of fading toward transparency. */}
        <rect
          x={-VB}
          y={-VB}
          width={VB * 3}
          height={VB * 3}
          fill={PALETTE.swirlCream}
        />
        {RINGS.map((ring, i) => (
          <circle
            key={i}
            cx={ring.cx}
            cy={ring.cy}
            r={ring.r}
            fill="none"
            stroke={PALETTE.swirlPink}
            strokeWidth={ring.w}
          />
        ))}
      </g>
    </svg>
  );
}

// ── the soft wash (used by 'bows' and 'wash') ──────────────────────────────
const WASH = `linear-gradient(172deg, ${PALETTE.washTop} 0%, ${PALETTE.washMid} 54%, ${PALETTE.washBottom} 100%)`;

/** Two oversized, heavily blurred washes. Depth without any discernible edge. */
const GLOWS: {
  color: string;
  size: number;
  blur: number;
  top: string;
  left: string;
}[] = [
  { color: PALETTE.glowPeach, size: 82, blur: 120, top: '-18%', left: '-20%' },
  { color: PALETTE.glowLilac, size: 90, blur: 130, top: '52%', left: '54%' },
];

// ── 'bows' ─────────────────────────────────────────────────────────────────
/**
 * Fades the ornament layer down the middle so decorations sit BESIDE the
 * receipt column instead of crowding it. The centre is dimmed to 15% rather
 * than cut to zero: the receipt is opaque so it already hides whatever is
 * behind it, and a hard cut would make ornaments pop in and out at the mask
 * edge as they drift.
 */
const ORNAMENT_MASK =
  'linear-gradient(90deg, #000 0%, #000 13%, rgba(0,0,0,0.15) 27%, rgba(0,0,0,0.15) 73%, #000 87%, #000 100%)';

type Ornament = {
  kind: 'bow' | 'sparkle';
  /** Viewport-relative position (inside styles.viewportField). */
  left: string;
  top: string;
  /** Rendered size in px. Small on purpose — see the mobile note up top. */
  size: number;
  rot: number;
  opacity: number;
  /** One full float loop, seconds. */
  dur: number;
  /** Negative, so they do not all bob in unison. */
  delay: number;
};

/**
 * Sparse and margin-biased: every x sits in the outer ~16% of the viewport,
 * which is the gutter left beside a min(300px, 86vw) receipt on a phone.
 */
const ORNAMENTS: Ornament[] = [
  {
    kind: 'bow',
    left: '5%',
    top: '13%',
    size: 30,
    rot: -14,
    opacity: 0.34,
    dur: 44,
    delay: -3,
  },
  {
    kind: 'sparkle',
    left: '12%',
    top: '27%',
    size: 14,
    rot: 0,
    opacity: 0.3,
    dur: 38,
    delay: -19,
  },
  {
    kind: 'sparkle',
    left: '4%',
    top: '46%',
    size: 11,
    rot: 18,
    opacity: 0.26,
    dur: 52,
    delay: -8,
  },
  {
    kind: 'bow',
    left: '8%',
    top: '68%',
    size: 24,
    rot: 11,
    opacity: 0.28,
    dur: 56,
    delay: -31,
  },
  {
    kind: 'sparkle',
    left: '90%',
    top: '9%',
    size: 12,
    rot: -10,
    opacity: 0.28,
    dur: 47,
    delay: -12,
  },
  {
    kind: 'bow',
    left: '87%',
    top: '31%',
    size: 28,
    rot: 16,
    opacity: 0.33,
    dur: 41,
    delay: -25,
  },
  {
    kind: 'sparkle',
    left: '94%',
    top: '55%',
    size: 13,
    rot: 6,
    opacity: 0.25,
    dur: 59,
    delay: -2,
  },
  {
    kind: 'bow',
    left: '89%',
    top: '78%',
    size: 22,
    rot: -9,
    opacity: 0.27,
    dur: 50,
    delay: -37,
  },
];

/** A simple line-drawn bow: two loops, a knot, two tails. Ours, not stock art. */
function Bow({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 24 19"
      fill="none"
      stroke={color}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* left loop */}
      <path d="M11.2 9.2C7.4 3.6 1.9 4.4 2.2 8.4C1.9 12.4 7.4 14 11.2 9.2Z" />
      {/* right loop */}
      <path d="M12.8 9.2C16.6 3.6 22.1 4.4 21.8 8.4C22.1 12.4 16.6 14 12.8 9.2Z" />
      {/* knot */}
      <circle cx="12" cy="9.2" r="1.5" />
      {/* tails */}
      <path d="M11.1 10.5 8.6 17.6" />
      <path d="M12.9 10.5 15.4 17.6" />
    </svg>
  );
}

/** A 4-pointed sparkle with concave sides — the classic coquette twinkle. */
function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <path d="M10 0c.55 6.1 3.9 9.45 10 10-6.1.55-9.45 3.9-10 10-.55-6.1-3.9-9.45-10-10C6.1 9.45 9.45 6.1 10 0Z" />
    </svg>
  );
}

export function DreamyBackdrop() {
  return (
    <div aria-hidden style={styles.root}>
      {/* Injected as raw HTML, NOT as a text child. Do not "simplify" this.
          React's server renderer HTML-escapes ' and " inside a text child, but
          the HTML parser treats <style> content as raw text and does not decode
          entities — so the server DOM gets a literal &#x27; where the client
          puts '. The CSS below quotes the variant names in its comments, so a
          text child here is a guaranteed hydration mismatch (React #425). This
          subtree sits under GiftReveal's Suspense boundary, so that escalates
          to #422: React throws away the server-rendered gift and re-renders on
          the client, restarting the printer feed mid-descent. Verified — it
          really does happen. Same reasoning as reveal/printer-feed.tsx. */}
      <style dangerouslySetInnerHTML={{ __html: BACKDROP_CSS }} />

      {BG_VARIANT === 'swirl' ? (
        /* Opaque edge to edge, so it is the only base layer needed. */
        <CandySwirl />
      ) : (
        <>
          {/* ── the soft wash + airy glows ── */}
          <div style={styles.wash} />
          {GLOWS.map((g, i) => (
            <div
              key={`glow-${i}`}
              style={{
                position: 'absolute',
                top: g.top,
                left: g.left,
                width: `${g.size}vmax`,
                height: `${g.size}vmax`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 50% 50%, ${g.color} 0%, transparent 68%)`,
                filter: `blur(${g.blur}px)`,
              }}
            />
          ))}
        </>
      )}

      {/* ── 'bows': sparse ornaments, in true viewport coordinates ── */}
      {BG_VARIANT === 'bows' ? (
        <div style={styles.viewportField}>
          <div style={styles.ornamentLayer}>
            {ORNAMENTS.map((o, i) => (
              <div
                key={`orn-${i}`}
                className="lr-bg-float"
                style={
                  {
                    position: 'absolute',
                    left: o.left,
                    top: o.top,
                    opacity: o.opacity,
                    // The float animation owns `transform`, so the per-ornament
                    // rotation rides on a custom property the keyframes reuse.
                    ['--lr-orn-rot' as string]: `${o.rot}deg`,
                    animationDuration: `${o.dur}s`,
                    animationDelay: `${o.delay}s`,
                    transform: `translate3d(-50%, -50%, 0) rotate(${o.rot}deg)`,
                  } as CSSProperties
                }
              >
                {o.kind === 'bow' ? (
                  <Bow size={o.size} color={PALETTE.bowLine} />
                ) : (
                  <Sparkle size={o.size} color={PALETTE.sparkle} />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const BACKDROP_CSS = `
/* ── 'swirl' — hold the reference stripe density on wide screens ───────────
   The square viewBox is sliced, so its unit scale follows the LARGER screen
   dimension. On a portrait phone that is the height and the maths works out to
   the reference's ~17.6 cycles across the width; on a landscape desktop the
   width takes over and you would get roughly double. Scaling up past 760px
   restores the intended stripe size. Scale is safe: the layer is already
   overscanned by 12vmax, so growing it can never expose an edge. */
.lr-swirl {
  transform-origin: 50% 50%;
}
@media (min-width: 760px) {
  .lr-swirl { transform: scale(2); }
}

/* ── 'bows' — a slow bob + sway ───────────────────────────────────────────── */
/* The -50% keeps each ornament centred on its own coordinate; the rotation is
   re-applied from the custom property because a transform list replaces, not
   merges, whatever the inline style set. */
@keyframes lr-bg-float {
  0%   { transform: translate3d(-50%, -50%, 0) rotate(var(--lr-orn-rot, 0deg)); }
  50%  { transform: translate3d(calc(-50% + 8px), calc(-50% - 14px), 0) rotate(calc(var(--lr-orn-rot, 0deg) + 5deg)); }
  100% { transform: translate3d(-50%, -50%, 0) rotate(var(--lr-orn-rot, 0deg)); }
}
.lr-bg-float {
  animation: lr-bg-float linear infinite;
  will-change: transform;
}

/* ── reduced motion ───────────────────────────────────────────────────────── */
/* The swirl is static already, so there is nothing to freeze there. Each
   ornament sits on its inline transform once the animation is off. */
@media (prefers-reduced-motion: reduce) {
  .lr-bg-float {
    animation: none;
    will-change: auto;
  }
}
`;

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'fixed',
    // Overscan — see the note at the top of this file.
    inset: '-12vmax',
    zIndex: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    // Keep blends and blurs from bleeding into the page behind this layer.
    isolation: 'isolate',
  },
  swirlSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
  },
  wash: {
    position: 'absolute',
    inset: 0,
    background: WASH,
  },
  // Cancels the root's overscan, restoring true viewport coordinates so the
  // ornament percentages land in the real margins beside the receipt.
  viewportField: {
    position: 'absolute',
    inset: '12vmax',
  },
  ornamentLayer: {
    position: 'absolute',
    inset: 0,
    maskImage: ORNAMENT_MASK,
    WebkitMaskImage: ORNAMENT_MASK,
  },
};
