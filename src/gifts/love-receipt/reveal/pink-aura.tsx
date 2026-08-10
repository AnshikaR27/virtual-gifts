/**
 * <PinkAura> — the field the Love Receipt reveal sits on.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  EVERYTHING TUNABLE IS IN THE THREE BLOCKS BELOW:                         │
 * │    1. AURA      the pink tones + the glow's centre point and reach         │
 * │    2. STARS     opacity + density                                          │
 * │    3. STAR / STAR_FIELD   the sprite (edit like pixel art) + placement     │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * A soft Y2K pink aura with scattered hollow pixel stars. This replaced the blue
 * sky + clouds entirely.
 *
 * WHICH WAY THE AURA RUNS
 * -----------------------
 * BRIGHT IN THE MIDDLE, DEEPENING OUTWARD. The centre is a near-white warm
 * blush and the colour gets richer toward the edges and corners, like a soft
 * light source sitting behind the screen. That centre-out falloff IS the aura
 * look — it is the thing to protect if you retune anything here.
 *
 * This direction is a deliberate, specified choice and it was reversed once
 * during development, so: do not "fix" it back. The trade-off it carries is
 * worth knowing, because it constrains AURA.glow more than it looks. The receipt
 * is a large OPAQUE near-white sheet sitting dead centre, i.e. the palest object
 * on the screen sits on the palest part of the background. The sheet still
 * separates because it carries a hard 3px pixel shadow, a 1px inner edge and a
 * crumple texture — but if you push AURA.glow any closer to pure white, those
 * are the only three things holding the receipt off the background. Keep a
 * little blush in it.
 *
 * WHY THE STARS ARE ONE SPRITE AT MANY SIZES
 * ------------------------------------------
 * The reference uses a single star shape scaled to a few different sizes, not a
 * family of different stars — so this does the same. One sprite to edit, and the
 * field stays visually coherent however many you add.
 *
 * They are HOLLOW (outline only) and drawn as literal square pixels with
 * `shape-rendering: crispEdges`, so no edge is ever anti-aliased into a smooth
 * curve. A filled star or a soft-edged one both read as a modern sticker; the
 * blocky outline is the entire Y2K signal here.
 *
 * Several stars are placed partly OFF-CANVAS (negative `left`, or `left` past
 * 100%) so they crop at the viewport edge exactly as they do in the reference.
 * That is intentional, not a mistake in the coordinates.
 *
 * SSR-DETERMINISM
 * ---------------
 * This subtree is server-rendered under GiftReveal's Suspense boundary, so the
 * markup has to be byte-identical on both sides — a mismatch throws away the
 * whole gift and restarts the printer feed on the client. Every value here is a
 * literal constant: no Math.random, no trigonometry, no Date, no measurement.
 * The star is a hand-authored sprite rather than a rasterised polygon precisely
 * so nothing is computed: Math.sin/cos are not guaranteed bit-identical across
 * JS engines, and a single last-ULP difference could flip a boundary pixel and
 * take the whole gift down with it.
 *
 * There is also deliberately NO <style> element in this file. Injected CSS is a
 * live hydration hazard on this route (React escapes quotes inside a style text
 * child but the HTML parser does not decode them — see reveal/printer-feed.tsx),
 * and the aura needs no keyframes because nothing moves. If you ever add drift
 * or twinkle, inject the CSS with dangerouslySetInnerHTML like that file does,
 * and gate it on prefers-reduced-motion.
 *
 * OPACITY IS LOAD-BEARING
 * -----------------------
 * The receipt must never let the background through: the sheet is a solid
 * #fbfbf9 and paints at z-index 1+, this layer is fixed at z-index 0. Do not
 * give the sheet, the printer chassis or any wrapper a translucent background.
 *
 * The page-wide .scanline-overlay (app/layout.tsx, z-index 9999) already lays a
 * CRT grid over all of this. Do not add a second one here.
 */

import type { CSSProperties } from 'react';

// ── TUNING BLOCK 1: the aura ───────────────────────────────────────────────
export const AURA = {
  /**
   * THE GLOW — the bright centre. A warm near-white blush, not pure white; see
   * the receipt-contrast note in the header before lightening it further.
   */
  glow: '#fff4f9',
  /** First step out of the glow. */
  inner: '#fdd8e7',
  /** Third quarter — the colour is properly pink by here. */
  outer: '#f8aecd',
  /** The rim. Richest pink, and what the corners clamp to. */
  rim: '#ef8ab4',

  /**
   * Where the light source sits. Slightly above centre, so the brightest part of
   * the glow falls behind the top half of the receipt where the masthead is.
   */
  centerX: '50%',
  centerY: '44%',

  /**
   * Ellipse radii — DELIBERATELY SMALLER THAN THE VIEWPORT, and that is what
   * makes the aura read.
   *
   * A radial gradient clamps to its final stop everywhere beyond its radius, so
   * the radius decides where the deep pink takes over. With these values the
   * side edges sit at ~64% of the radius, the top at ~71%, the bottom at ~90%,
   * and the CORNERS at ~95% — so the colour genuinely arrives at AURA.rim in the
   * corners instead of petering out mid-ramp. Sizing this at 110%+ (the obvious
   * first guess) leaves the whole screen inside the ramp and the result looks
   * flat, with no visible falloff at all.
   */
  size: '80% 64%',

  /** Where each colour stop lands along that radius, in %. */
  stops: [0, 38, 70, 100] as const,
} as const;

// ── TUNING BLOCK 2: the stars ──────────────────────────────────────────────
/** Star ink. White, as in the reference. */
export const STAR_COLOR = '#ffffff';
/**
 * Base star opacity. Around 0.8 matches the reference; much above that and they
 * start competing with the receipt for attention, which is the one thing this
 * layer must not do. Individual stars can dim further via their own `fade`.
 *
 * Note white stars need a little more presence now than they did over the old
 * blue sky, because the pale centre of the aura gives them less to contrast
 * against — but the ones that matter sit near the edges, which are the deepest
 * pink, so they hold up.
 */
export const STAR_OPACITY = 0.78;
/**
 * Fraction of STAR_FIELD actually rendered, 0 → 1. The array is ordered
 * most-wanted-first, so lowering this thins the scatter from the back without
 * you having to delete entries. 0 turns the stars off entirely.
 */
export const STAR_DENSITY = 1;

/** The field, assembled once. */
const AURA_GRADIENT =
  `radial-gradient(${AURA.size} at ${AURA.centerX} ${AURA.centerY}, ` +
  `${AURA.glow} ${AURA.stops[0]}%, ` +
  `${AURA.inner} ${AURA.stops[1]}%, ` +
  `${AURA.outer} ${AURA.stops[2]}%, ` +
  `${AURA.rim} ${AURA.stops[3]}%)`;

// ── TUNING BLOCK 3: the sprite + placement ─────────────────────────────────
/**
 * The hollow pixel star. Edit like pixel art — 'X' draws, '.' is empty, and
 * every row must be the same length.
 *
 * Traced as an OUTLINE: a five-point star path one pixel thick. The interior is
 * deliberately empty, which is what makes it read as the reference's star rather
 * than a solid sticker. Widening the stroke to two pixels makes it read chunkier
 * and much heavier — if you try it, drop STAR_OPACITY to compensate.
 */
const STAR = [
  '.......X.......',
  '......X.X......',
  '......X.X......',
  '.....X...X.....',
  '.....X...X.....',
  'XXXXXX...XXXXXX',
  '.X...........X.',
  '..X.........X..',
  '..X.........X..',
  '...X.......X...',
  '...X.......X...',
  '..X....X....X..',
  '..X..X...X..X..',
  '.X.X.......X.X.',
  '.X...........X.',
];

/**
 * Sizes. Mobile-first: the vw term drives phones, the px cap holds desktop.
 *
 * THERE IS A HARD FLOOR HERE, ~46px, AND IT IS NOT AESTHETIC. The star is a
 * 15×15 grid drawn with a ONE-PIXEL outline, so at a rendered width of W each
 * stroke is only W/15 across. Below about 46px that stroke drops under ~3px and
 * the outline stops reading as a continuous line — the star visibly falls apart
 * into scattered white squares. A first pass had 20px "tiny" stars and they
 * looked like pixel debris, not decoration. If you want smaller stars than this,
 * you need a smaller/chunkier SPRITE, not a smaller size.
 *
 * For reference, the supplied wallpaper's smallest star is ~12.5% of the frame
 * width, which is ~49px on a 390px phone — the floor below matches it.
 */
const W_HUGE = 'clamp(110px, 34vw, 210px)';
const W_BIG = 'clamp(84px, 27vw, 165px)';
const W_MED = 'clamp(62px, 20vw, 120px)';
const W_SMALL = 'clamp(46px, 15vw, 88px)';

export interface Star {
  left: string;
  top: string;
  w: string;
  rot: number;
  /** Multiplies STAR_OPACITY — use it to push a star further back. */
  fade: number;
}

/** Positional shorthand, so one star reads as one line. */
const at = (left: string, top: string, w: string, rot = 0, fade = 1): Star => ({
  left,
  top,
  w,
  rot,
  fade,
});

/**
 * Where the stars sit.
 *
 * MOBILE-FIRST PLACEMENT — THE CONSTRAINT THAT DECIDES EVERY `left` HERE:
 * the receipt column is min(300px, 86vw). On a 390px phone that is 300px of the
 * middle, leaving only ~11.5% of viewport width as margin on EACH side. Anything
 * centred between roughly 12% and 88% is behind opaque paper and will never be
 * seen on a phone. So the field is two vertical columns hugging the edges, and
 * the larger stars start OFF-CANVAS and crop at the viewport edge — which is
 * both how the reference looks and how you fit a 150px star into a 45px margin.
 *
 * Ordered most-wanted-first so STAR_DENSITY thins from the back.
 */
export const STAR_FIELD: Star[] = [
  // — the big edge-cropped ones that carry the look —
  at('-13%', '16%', W_HUGE, -8),
  at('80%', '4%', W_BIG, 12),
  at('-10%', '60%', W_BIG, 6, 0.92),
  at('82%', '42%', W_MED, -14),
  at('81%', '76%', W_MED, 9, 0.92),
  // — smaller punctuation, still above the ~46px legibility floor —
  at('2%', '2%', W_SMALL, 16, 0.85),
  at('0%', '88%', W_SMALL, -11, 0.85),
  at('86%', '24%', W_SMALL, 5, 0.78),
];

/**
 * One sprite → one <svg> of square pixels.
 *
 * The viewBox is the sprite's own grid, so a "pixel" is exactly 1 unit and the
 * whole star scales as a unit with `w`. `crispEdges` is what keeps the blocks
 * hard at any scale: without it the browser anti-aliases every rect edge and the
 * pixel art quietly turns back into a soft shape.
 */
function PixelStar({ opacity }: { opacity: number }) {
  const rows = STAR.length;
  const cols = STAR[0].length;
  const cells: { x: number; y: number }[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (STAR[y][x] === 'X') cells.push({ x, y });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden
    >
      <g fill={STAR_COLOR} opacity={opacity}>
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            // 1.02 rather than 1: at fractional scales adjacent rects can leave
            // a hairline gap between them, which breaks the outline into dashes.
            // The overlap is under one source pixel, so the shape is unchanged.
            width={1.02}
            height={1.02}
          />
        ))}
      </g>
    </svg>
  );
}

export function PinkAura() {
  // Ordered most-wanted-first, so this thins the scatter from the back.
  const stars = STAR_FIELD.slice(
    0,
    Math.round(STAR_FIELD.length * STAR_DENSITY),
  );

  return (
    <div aria-hidden style={styles.root}>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.w,
            aspectRatio: `${STAR[0].length} / ${STAR.length}`,
            transform: s.rot ? `rotate(${s.rot}deg)` : undefined,
          }}
        >
          <PixelStar opacity={STAR_OPACITY * s.fade} />
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    background: AURA_GRADIENT,
    pointerEvents: 'none',
    // Stars are placed past the edges on purpose; clip them to the viewport.
    overflow: 'hidden',
  },
};
