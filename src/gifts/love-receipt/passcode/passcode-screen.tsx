'use client';

/**
 * <PasscodeScreen> — the Y2K passcode keypad.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  STANDALONE AND UNWIRED, ON PURPOSE.                                      │
 * │  Nothing here talks to the receipt, the gift route, Supabase, or any      │
 * │  auth. It takes a code in and hands it to `onComplete`. There is NO       │
 * │  validation and no notion of a right or wrong code — deliberately, so the │
 * │  screen can be judged on looks before any of that is decided.             │
 * │  Preview it at /love-receipt/passcode-preview.                            │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * ON THE LAYOUT: this component was authored from a written description, not
 * ported from an existing screen — no passcode UI existed in this repo when it
 * was written.
 *
 * VISUAL LANGUAGE: Language A (Y2K / Windows 98) — --win-bg field, the app's
 * real .win98-window / .win98-titlebar / .win98-body classes, VT323 everywhere,
 * the titlebar pink gradient as the only accent, and hard pixel shadows
 * (Npx Npx 0 0) with zero blur.
 *
 * NOTE THIS SCREEN *DOES* GET WINDOW CHROME, unlike the receipt reveal.
 * That is not an inconsistency. The receipt is an OBJECT the recipient is being
 * handed, so a window frame around it would put an application between them and
 * the gift. The passcode is a SYSTEM step — it is the app asking for something —
 * and system steps are exactly what Language A frames in windows. Same reason
 * the homepage puts WARNING and SYSTEM dialogs in windows but the polaroids sit
 * loose on the pinboard.
 *
 * THE ONE SOFT THING, AND WHY IT IS ALLOWED: `glow`, the pink wash behind the
 * pad, is a blurred radial gradient. It is specified ("glow-behind-keypad") and
 * it is LIGHT rather than a shadow — every actual shadow here is a zero-blur
 * pixel offset. Don't let it creep into the keys.
 *
 * The page-wide .scanline-overlay (app/layout.tsx, z-index 9999) already lays a
 * CRT grid over all of this, including the window. That is the whole CRT
 * treatment — do NOT add a second scanline layer here, it doubles the banding
 * and reads as moiré rather than a screen.
 *
 * ── SIZING IS MOBILE-FIRST, AND THAT IS LOAD-BEARING ───────────────────────
 * Every dimension that decides whether this fits a phone is a clamp(), not a
 * fixed px: the gutter, the window width, key height, gaps, the dots and every
 * type size. Read them as `clamp(phone, fluid, desktop)` — the FIRST value is
 * the small-screen floor and the LAST is the ceiling this stops growing at.
 * The rules that keep it honest:
 *   1. The window is `min(330px, 100%)` INSIDE a padded root, so the gutter —
 *      not the window — owns the margin and nothing can ever touch a screen
 *      edge. Widen the window by widening `windowW`, never by cutting `padX`.
 *   2. Key height floors at 44px, the minimum tap target. Nothing may shrink
 *      it below that: the clamp floor is 44 AND `minHeight: 44` backs it up.
 *   3. The root is sized in `svh` (the SMALL viewport — what is visible while
 *      a mobile browser still shows its URL bar), so the window is centred in
 *      the space actually on screen rather than in an optimistic 100vh.
 * There is no debug/diagnostic text in this component. The preview route's
 * "entered: …" readout lives in the preview shell, below this screen, and is
 * gated behind its debug flag — do not reintroduce it here as an overlay.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { playClick } from '@/components/retro-sounds';

// ── TUNING BLOCK 1: the screen ─────────────────────────────────────────────
export const PASSCODE = {
  /** How many digits the code is. The dot row follows this automatically. */
  length: 4,

  /** Window caption. Keep the .exe — it is the joke. */
  title: '🔒 ENTER_CODE.exe',

  /**
   * The page gutter — the guaranteed clear band between the window and every
   * screen edge. Safe-area insets are added on top of this, so notches and
   * home indicators cost the window nothing. This is what stops the layout
   * running off the sides on a phone; it is the floor, so raise `windowW`
   * rather than lowering this.
   */
  padX: 'clamp(18px, 6vw, 40px)',
  padY: 'clamp(20px, 5vh, 40px)',
  /**
   * Window width. `100%` here means "the padded root minus the gutter", so on
   * a 390px phone this resolves to 330px with ~30px clear on each side, and on
   * a 320px phone it shrinks to fit instead of overflowing.
   */
  windowW: 'min(330px, 100%)',

  /** Ink. The app's body colour. */
  ink: '#1a0a2e',
  /** THE accent — the app's exact titlebar gradient. */
  pink: 'linear-gradient(180deg, var(--win-title-start), var(--win-title-end))',

  /**
   * The key sheen: light top → darker bottom, so the key reads as a shiny
   * moulded cap rather than a flat grey rectangle. This is the difference
   * between "Win98 button" and "office form control", and it is worth keeping
   * even though everything else in this gift is matte.
   */
  keyTop: '#f6f6f6',
  keyMid: '#dedede',
  keyBottom: '#bcbcbc',
  /** Pressed: the same ramp inverted, so the cap looks pushed in. */
  keyTopPressed: '#b4b4b4',
  keyBottomPressed: '#e8e8e8',

  bevelLight: 'var(--win-chrome-light)',
  bevelDark: 'var(--win-chrome-darkest)',

  /** Squircle rounding on the keys. Scales with the key so it never bloats. */
  keyRadius: 'clamp(12px, 4vw, 16px)',
  /**
   * Key height. THE FLOOR IS 44 AND IT IS NOT NEGOTIABLE — that is the minimum
   * tap target. The 13vw middle term is what makes the pad shrink on a narrow
   * phone; 54px is where it stops growing.
   */
  keyHeight: 'clamp(44px, 13vw, 54px)',
  /** Gap between keys. Tightens with the pad so the keys stay big instead. */
  keyGap: 'clamp(7px, 2.4vw, 10px)',
  keyFont: 'clamp(22px, 7vw, 28px)',
  bevel: 3,
  /** Hard pixel shadow, and its pressed state. Zero blur, both. */
  shadow: '3px 3px 0 0 rgba(0, 0, 0, 0.3)',
  shadowPressed: '1px 1px 0 0 rgba(0, 0, 0, 0.3)',

  /** The pink wash behind the pad. Past ~0.5 it stops reading as a glow. */
  glow: 'rgba(255, 105, 180, 0.30)',
  /**
   * Kept under the pad's own width on every phone — the glow is absolutely
   * positioned and nothing clips it, so an oversized one would push the page
   * sideways. 74vw is the widest value that still fits inside the window.
   */
  glowSize: 'min(290px, 74vw)',

  /** How long a completed code stays on screen before the row clears. */
  holdMs: 900,

  /** Caret blink period. Steps, not a fade — a CRT caret snaps. */
  caretMs: 1060,
} as const;

// ── TUNING BLOCK 2: the decoration ─────────────────────────────────────────
/**
 * Sparse pixel decor scattered on the bare lavender around the window.
 * Low-contrast on purpose: it is texture, not content.
 */
export const DECOR_OPACITY = 0.5;
/**
 * Fraction of DECOR actually rendered, 0 → 1. Ordered most-wanted-first, so
 * lowering this thins the scatter from the back. 0 turns decoration off.
 */
export const DECOR_DENSITY = 1;

const PINK_INK = 'var(--win-hot-pink)';
const WHITE_INK = '#ffffff';
const DARK_INK = 'rgba(26, 10, 46, 0.55)';

// ── sprites — edit like pixel art. 'X' draws, '.' is empty. ────────────────
const HEART = [
  '.XX.XX.',
  'XXXXXXX',
  'XXXXXXX',
  '.XXXXX.',
  '..XXX..',
  '...X...',
];

const SPARKLE = ['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..'];

const TWINKLE = ['.X.', 'XXX', '.X.'];

/** Tiny padlock — shackle over a solid body with a keyhole. */
const PADLOCK = [
  '..XXX..',
  '.X...X.',
  '.X...X.',
  'XXXXXXX',
  'XXXXXXX',
  'XXX.XXX',
  'XXX.XXX',
  'XXXXXXX',
];

/** The classic mouse pointer. */
const CURSOR = [
  'X......',
  'XX.....',
  'XXX....',
  'XXXX...',
  'XXXXX..',
  'XXXXXX.',
  'XXXXXXX',
  'XXXX...',
  'X..XX..',
];

interface Decor {
  sprite: string[];
  left: string;
  top: string;
  w: number;
  color: string;
  rot: number;
}

const dec = (
  sprite: string[],
  left: string,
  top: string,
  w: number,
  color: string,
  rot = 0,
): Decor => ({ sprite, left, top, w, color, rot });

/**
 * Where the decoration sits.
 *
 * MOBILE-FIRST PLACEMENT — THE CONSTRAINT THAT DECIDES THESE COORDINATES:
 * the window eats the middle of the screen and the gutter beside it is only
 * ~20-30px on a phone, so there is almost no horizontal room. The usable space
 * is therefore mostly ABOVE and BELOW the window, which on a 844px-tall phone
 * is roughly the top 20% and bottom 20% — so the scatter lives in those bands,
 * with only a couple of very small pieces squeezed into the side slivers.
 *
 * These are percentages of the VIEWPORT, not of the window, so they hold as
 * the window scales; only the two sliver pieces are width-sensitive, and they
 * are 10px wide precisely so the narrowest gutter still clears them.
 *
 * Ordered most-wanted-first so DECOR_DENSITY thins from the back.
 */
export const DECOR: Decor[] = [
  // — top band —
  dec(HEART, '12%', '7%', 20, PINK_INK, -14),
  dec(SPARKLE, '78%', '5%', 16, WHITE_INK, 0),
  dec(PADLOCK, '86%', '12%', 17, DARK_INK, 8),
  dec(TWINKLE, '30%', '13%', 10, WHITE_INK, 0),
  dec(HEART, '62%', '11%', 14, PINK_INK, 11),
  // — bottom band —
  dec(CURSOR, '16%', '86%', 18, WHITE_INK, 0),
  dec(SPARKLE, '82%', '88%', 18, WHITE_INK, 0),
  dec(HEART, '44%', '93%', 16, PINK_INK, 9),
  dec(TWINKLE, '68%', '84%', 10, WHITE_INK, 0),
  // — the side slivers, small enough to fit the narrowest gutter —
  dec(TWINKLE, '2%', '44%', 10, WHITE_INK, 0),
  dec(TWINKLE, '95%', '58%', 10, WHITE_INK, 0),
];

/** Keypad grid. `null` is the empty cell; 'del' is backspace. */
const KEYS: (string | null)[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  null,
  '0',
  'del',
];

/**
 * One sprite → one <svg> of square pixels. `crispEdges` is what keeps the blocks
 * hard at any scale: without it the browser anti-aliases every rect edge and the
 * pixel art quietly turns back into a soft shape.
 */
function PixelSprite({
  sprite,
  color,
  opacity,
}: {
  sprite: string[];
  color: string;
  opacity: number;
}) {
  const rows = sprite.length;
  const cols = sprite[0].length;
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (sprite[y][x] === 'X') cells.push({ x, y });
    }
  }
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', width: '100%', height: '100%' }}
      aria-hidden
    >
      <g fill={color} opacity={opacity}>
        {cells.map((c, i) => (
          // 1.02 rather than 1: at fractional scales adjacent rects can leave a
          // hairline gap, which stipples the shape. Smaller than one source
          // pixel, so the silhouette is unchanged.
          <rect key={i} x={c.x} y={c.y} width={1.02} height={1.02} />
        ))}
      </g>
    </svg>
  );
}

/** The three caption buttons, matching the homepage windows exactly. */
function TitlebarButtons() {
  return (
    <div className="flex gap-[2px]">
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="mt-[2px] block h-[2px] w-[6px] bg-black" />
      </span>
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="block h-[7px] w-[7px] border border-black" />
      </span>
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="text-[10px] font-bold leading-none text-ink">✕</span>
      </span>
    </div>
  );
}

export interface PasscodeScreenProps {
  /** Shown above the dots, inside the window. */
  prompt?: string;
  /**
   * The sender's hint. PLACEHOLDER for now — real data is not wired. Rendered
   * as "🔒 hint: <hint>".
   */
  hint?: string;
  /**
   * Fired once `length` digits are entered. Receives the raw code. The row
   * clears itself afterwards regardless — this component never judges the code.
   */
  onComplete?: (code: string) => void;
}

export function PasscodeScreen({
  prompt = 'enter the code',
  hint = 'the date we met (ddmm)',
  onComplete,
}: PasscodeScreenProps) {
  const [digits, setDigits] = useState<string>('');
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const press = useCallback((k: string) => {
    playClick();
    setDigits((d) => (d.length >= PASSCODE.length ? d : d + k));
  }, []);

  const del = useCallback(() => {
    playClick();
    setDigits((d) => d.slice(0, -1));
  }, []);

  // Completion is a pure hand-off: report the code, hold it on screen so the
  // filled row is actually visible, then reset. No validation, no branching.
  useEffect(() => {
    if (digits.length < PASSCODE.length) return;
    completeRef.current?.(digits);
    const t = window.setTimeout(() => setDigits(''), PASSCODE.holdMs);
    return () => window.clearTimeout(t);
  }, [digits]);

  // Hardware keyboard parity — free accessibility, and it makes the screen
  // usable on desktop without reaching for the mouse.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') press(e.key);
      else if (e.key === 'Backspace') del();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, del]);

  const decor = DECOR.slice(0, Math.round(DECOR.length * DECOR_DENSITY));

  return (
    // The root's size and gutter live in .lr-root rather than inline, because
    // min-height needs the 100vh → 100svh fallback pair and an inline style
    // can only hold one of the two.
    <div className="lr-root">
      {/* Injected as raw HTML, not a text child — React's server renderer
          escapes quotes inside a <style> text child while the client does not,
          which is a hydration mismatch. Same reasoning as the receipt reveal. */}
      <style dangerouslySetInnerHTML={{ __html: PASSCODE_CSS }} />

      <div aria-hidden style={styles.field} />

      {/* ── sparse pixel decoration, behind the window ── */}
      <div aria-hidden style={styles.decorLayer}>
        {decor.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.left,
              top: d.top,
              width: d.w,
              aspectRatio: `${d.sprite[0].length} / ${d.sprite.length}`,
              transform: d.rot ? `rotate(${d.rot}deg)` : undefined,
            }}
          >
            <PixelSprite
              sprite={d.sprite}
              color={d.color}
              opacity={DECOR_OPACITY}
            />
          </div>
        ))}
      </div>

      {/* ── the window ── */}
      <div className="win98-window" style={styles.window}>
        <div className="win98-titlebar">
          <span>{PASSCODE.title}</span>
          <TitlebarButtons />
        </div>

        <div className="win98-body" style={styles.body}>
          <p className="font-pixel" style={styles.prompt}>
            {prompt}
            <span className="lr-caret" aria-hidden>
              _
            </span>
          </p>

          {hint ? (
            <p className="font-pixel" style={styles.hint}>
              🔒 hint: {hint}
            </p>
          ) : null}

          {/* ── the dots ── */}
          <div
            style={styles.dots}
            role="status"
            aria-label={`${digits.length} of ${PASSCODE.length} digits entered`}
          >
            {Array.from({ length: PASSCODE.length }, (_, i) => (
              <span
                key={i}
                aria-hidden
                style={i < digits.length ? styles.dotFilled : styles.dotEmpty}
              />
            ))}
          </div>

          {/* ── the pad ── */}
          <div style={styles.padWrap}>
            <div aria-hidden style={styles.glow} />
            <div className="lr-pad" style={styles.grid}>
              {KEYS.map((k, i) =>
                k === null ? (
                  <span key={i} aria-hidden />
                ) : (
                  <button
                    key={i}
                    type="button"
                    className="lr-key font-pixel"
                    style={styles.key}
                    aria-label={k === 'del' ? 'delete' : k}
                    onClick={() => (k === 'del' ? del() : press(k))}
                  >
                    {k === 'del' ? 'DEL' : k}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The root box, the press feedback and the caret.
 *
 * .lr-root is the whole responsive contract: a small-viewport-tall centring box
 * with a clamped gutter that the safe-area insets are added ON TOP of. The
 * doubled `min-height` is a fallback pair, not a mistake — browsers without
 * `svh` keep `100vh` and browsers with it take the second declaration. `svh`
 * is deliberate over `vh`/`dvh`: it measures the viewport with the mobile URL
 * bar SHOWING, which is the worst case the window has to fit inside, and
 * unlike `dvh` it does not resize as the bar hides and re-shows mid-scroll.
 * Because it is min-height (never height), a viewport too short for the window
 * grows the box and scrolls instead of clipping it.
 *
 * A Win98 control SNAPS between states — there are no transitions here on
 * purpose, because easing a bevel is the fastest way to make this stop looking
 * like 1998. Pressing does three things at once: the sheen inverts (so the cap
 * looks pushed in), the bevel inverts, and the hard shadow shortens 3px -> 1px.
 * Any one alone reads weak; together they land.
 *
 * The caret is `steps(1)`, not a fade — a CRT caret is on or off, never
 * halfway. It stops entirely under reduced motion, since a blink is exactly the
 * kind of repeating motion that setting exists to suppress.
 */
const PASSCODE_CSS = `
.lr-root {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: calc(${PASSCODE.padY} + env(safe-area-inset-top, 0px));
  padding-bottom: calc(${PASSCODE.padY} + env(safe-area-inset-bottom, 0px));
  padding-left: calc(${PASSCODE.padX} + env(safe-area-inset-left, 0px));
  padding-right: calc(${PASSCODE.padX} + env(safe-area-inset-right, 0px));
}

.lr-key {
  transition: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
.lr-key:active {
  background-image: linear-gradient(180deg, ${PASSCODE.keyTopPressed} 0%, ${PASSCODE.keyBottomPressed} 100%);
  border-color: ${PASSCODE.bevelDark} ${PASSCODE.bevelLight} ${PASSCODE.bevelLight} ${PASSCODE.bevelDark};
  box-shadow: ${PASSCODE.shadowPressed};
  transform: translate(2px, 2px);
}
.lr-key:focus-visible {
  outline: 2px dotted ${PASSCODE.bevelDark};
  outline-offset: 3px;
}

@keyframes lr-caret-blink {
  0%, 49%   { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.lr-caret {
  animation: lr-caret-blink ${PASSCODE.caretMs}ms steps(1, end) infinite;
  margin-left: 1px;
}

@media (prefers-reduced-motion: reduce) {
  .lr-key:active { transform: none; }
  .lr-caret { animation: none; opacity: 1; }
}
`;

const styles: Record<string, CSSProperties> = {
  // Flat Language A page colour, edge to edge. Matches the receipt reveal.
  // Fixed, so the gutter on .lr-root never shows as an unpainted border.
  field: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    background: 'var(--win-bg)',
    pointerEvents: 'none',
  },
  decorLayer: {
    position: 'fixed',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    overflow: 'hidden',
  },

  // .win98-window supplies the chrome, bevel and 1px black shadow; this only
  // sets the size and lifts it above the decoration. The 100% term is what
  // makes it shrink on narrow phones instead of running past the gutter.
  window: {
    position: 'relative',
    zIndex: 2,
    width: PASSCODE.windowW,
  },
  // .win98-body supplies the white panel + inset bevel; this only pads it.
  body: {
    padding:
      'clamp(12px, 3.4vw, 16px) clamp(10px, 3vw, 14px) clamp(14px, 4vw, 18px)',
  },

  prompt: {
    // VT323 is a pixel face and reads small at body sizes.
    fontSize: 'clamp(22px, 7vw, 28px)',
    lineHeight: 1.1,
    letterSpacing: '0.04em',
    color: PASSCODE.ink,
    textAlign: 'center',
    margin: 0,
  },
  hint: {
    fontSize: 'clamp(15px, 4.6vw, 18px)',
    lineHeight: 1.3,
    letterSpacing: '0.02em',
    color: 'rgba(26, 10, 46, 0.66)',
    textAlign: 'center',
    margin: '6px 0 0',
  },

  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(10px, 3.4vw, 14px)',
    margin: 'clamp(14px, 4.4vw, 18px) 0 clamp(15px, 5vw, 20px)',
  },
  // Empty: a SUNKEN bevel, so the slot reads as waiting to be filled.
  dotEmpty: {
    width: 'clamp(14px, 4.6vw, 18px)',
    height: 'clamp(14px, 4.6vw, 18px)',
    borderRadius: '50%',
    boxSizing: 'border-box',
    background: 'var(--win-chrome)',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: `${PASSCODE.bevelDark} ${PASSCODE.bevelLight} ${PASSCODE.bevelLight} ${PASSCODE.bevelDark}`,
    display: 'block',
    flex: 'none',
  },
  // Filled: the pink gradient, with its own hard pixel shadow so it sits ON the
  // panel rather than in it — the exact inverse of the empty state.
  dotFilled: {
    width: 'clamp(14px, 4.6vw, 18px)',
    height: 'clamp(14px, 4.6vw, 18px)',
    borderRadius: '50%',
    boxSizing: 'border-box',
    backgroundImage: PASSCODE.pink,
    border: '2px solid rgba(255,255,255,0.75)',
    boxShadow: '2px 2px 0 0 rgba(0, 0, 0, 0.3)',
    display: 'block',
    flex: 'none',
  },

  padWrap: {
    position: 'relative',
    width: '100%',
  },
  // The one blurred thing in the file — light, not shadow. See the header.
  // maxWidth pins it inside the pad: it is absolutely positioned and nothing
  // clips it (the grid's hard key shadows must not be cropped), so the glow
  // has to keep itself in bounds or it widens the page.
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: PASSCODE.glowSize,
    height: PASSCODE.glowSize,
    maxWidth: '100%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: `radial-gradient(circle at 50% 50%, ${PASSCODE.glow} 0%, rgba(255,105,180,0) 68%)`,
    pointerEvents: 'none',
    zIndex: 0,
  },
  grid: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: PASSCODE.keyGap,
  },
  key: {
    height: PASSCODE.keyHeight,
    // Backstop for the clamp floor: whatever anyone does to keyHeight, the tap
    // target stays legal.
    minHeight: 44,
    minWidth: 0,
    boxSizing: 'border-box',
    borderRadius: PASSCODE.keyRadius,
    // The sheen. Light top → darker bottom: a shiny moulded cap, not a flat
    // grey rectangle.
    backgroundImage: `linear-gradient(180deg, ${PASSCODE.keyTop} 0%, ${PASSCODE.keyMid} 52%, ${PASSCODE.keyBottom} 100%)`,
    borderStyle: 'solid',
    borderWidth: PASSCODE.bevel,
    // Raised: light top-left, darkest bottom-right — the .win98-btn treatment.
    borderColor: `${PASSCODE.bevelLight} ${PASSCODE.bevelDark} ${PASSCODE.bevelDark} ${PASSCODE.bevelLight}`,
    boxShadow: PASSCODE.shadow,
    color: PASSCODE.ink,
    fontSize: PASSCODE.keyFont,
    lineHeight: 1,
    letterSpacing: '0.03em',
    cursor: 'var(--cursor-hand)',
    userSelect: 'none',
    padding: 0,
  },
};
