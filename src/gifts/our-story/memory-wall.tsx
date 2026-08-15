'use client';

/**
 * <MemoryWall> — OUR_STORY's wall.
 *
 * ── IT IS THE HOMEPAGE WALL, HUNG BY HAND. ─────────────────────────────────
 * Every rule that decides how this LOOKS is the real shared thing, not a copy:
 *
 *   · Window chrome  — .win98-window / .win98-titlebar + <TitlebarButtons/>
 *   · The board      — .polaroid-wall-bg
 *   · String + clips — .garland-svg with THREAD_D, and <Clothespin/>
 *   · Polaroids      — .garland-slot / .garland-polaroid / .polaroid-flipper /
 *                      .polaroid-front / .polaroid-back / .polaroid-photo /
 *                      .polaroid-caption
 *   · Sway            — .garland-polaroid's animation
 *   · Drop-in         — useGarlandReveal
 *
 * The CSS lives in app/globals.css. THIS FILE ADDS NO CSS RULES — no <style>
 * block, no os-* class. The geometry below is all inline.
 *
 * ── THE ARRIVAL, AND WHY IT CANNOT BREAK THE GIFT ──────────────────────────
 * The wall assembles itself when it mounts: window, then cords, then the
 * photographs one at a time. It is decoration, and it is built so it can be
 * removed at any instant without consequence — every keyframe ends on the
 * resting value, so THE MARKUP BELOW IS THE FINISHED WALL and the arrival is a
 * detour that always returns to it. Nothing here is conditional on it; the only
 * traces are a class on the root and two CSS variables. See
 * ./wall-assembly.tsx, which owns all of it.
 *
 * ── HOW A PHOTO ACTUALLY HANGS ─────────────────────────────────────────────
 * cord → clip → photo has to read as ONE connected object, and it hangs in one
 * direction only: DOWN. Three rules hold that together.
 *
 *   1. THE CLIP SITS ON THE CORD, NEVER ABOVE IT. Its offset is derived from
 *      `threadYPx()` — the y of the actual drawn Bézier — minus the CSS
 *      constants below, then clamped at 0 so it can never ride up off the
 *      cord no matter what the arithmetic produces.
 *   2. THE PHOTO IS TUCKED INTO THE CLIP. CLIP_TUCK px of the polaroid's top
 *      edge sits BEHIND the clip's jaws. There is never a gap.
 *   3. STAGGER ONLY EVER GOES DOWN, and lives BETWEEN clip and photo. A photo
 *      hangs lower because the clip gripped nearer its corner, so the tuck
 *      shrinks (16px → 6px) but never reaches zero. The drop is `hash01 × N`,
 *      which is non-negative by construction — it must stay that way.
 *
 * Z-ORDER: the cord SVG is z-index 1, .garland-polaroids is 2, and
 * .garland-clothespin is 3 INSIDE the slot — a static flex item, but z-index
 * applies to flex items, so the clip paints over the polaroid beside it. The
 * polaroid's `perspective` makes its own stacking context at auto, which cannot
 * rise above the clip. `transform-origin: top center` (globals.css) makes the
 * photo swing from exactly where it is pinned.
 *
 * ── THE REST OF THE ARRANGEMENT ────────────────────────────────────────────
 * The look is photographs and bare cord, and NOTHING ELSE. Felt ornaments,
 * crochet clusters, scattered bows and finally the tie-off bows at each end of
 * each string were all tried and all removed: every one of them competed with
 * the pictures. There is now no decoration on the strings at all. Keep them
 * clean.
 *
 * WHAT DOES **NOT** VARY IS PHOTO SIZE. .garland-slot ships `flex: 0 1 105px`,
 * so left alone it SHRINKS photos on a busier row. The slot is overridden to a
 * fixed width here (PHOTO_WIDTH) to stop that.
 */

import { useCallback, useState } from 'react';
import type { CSSProperties } from 'react';
import { Clothespin } from '@/components/ui/clothespin';
import { TitlebarButtons } from '@/components/win98-chrome';
import { playClick } from '@/components/retro-sounds';
import {
  gradients,
  THREAD_D,
  useIsDesktop,
  useGarlandReveal,
} from '@/components/home/polaroid-wall-shared';
import {
  AssemblyStyles,
  assemblyRootProps,
  cordDelayMs,
  photoDelayMs,
  photoStepFor,
  useSkipAssembly,
} from './wall-assembly';
import type { Memory } from './memories';

// ── THE WINDOW TITLE ───────────────────────────────────────────────────────
/**
 * The two names in the titlebar. PLACEHOLDER — the sender flow does not exist
 * yet, so these are hardcoded; when it does, pass `names` into <MemoryWall>
 * and delete nothing else.
 *
 * UPPERCASE because it is a filename in a 1998 titlebar. Long names are handled
 * by the titlebar rather than by truncating here — see `styles.title`.
 */
export const WALL_NAMES = { name1: 'ANSHIKA', name2: 'BHUMIN' } as const;

export interface WallNames {
  name1: string;
  name2: string;
}

/** Keeps the camera and the .exe; only the middle is data. */
const buildTitle = (n: WallNames) => `📷 ${n.name1} & ${n.name2}.exe`;

// ── THE ROW BUDGET ─────────────────────────────────────────────────────────
/**
 * WHAT SITS BETWEEN THE WINDOW'S INNER EDGE AND THE FIRST PHOTOGRAPH, on a
 * 360px phone. This has been squeezed twice and is now essentially at its
 * floor:
 *
 *     window chrome      3px × 2   border + .win98-window padding
 *     .win98-body        1px × 2   border only; padding is killed by !p-0
 *     BOARD_PAD_X        2px × 2   .polaroid-wall-bg, overridden below
 *     ROW_END_PAD        8px × 2   breathing room at each end of a string
 *     ───────────────────────────
 *     first photo starts 10px in from the window's inner edge (was 18px)
 *     leaves            314px      for three 86px photos and their spacing
 *
 * There is nothing meaningful left to reclaim here. More room for the pictures
 * now has to come from PHOTO_WIDTH, the row length, or styles.frame outside
 * the window — not from these.
 */

/**
 * Fixed polaroid width. Every photo on the wall is this wide, on every row.
 *
 * HEIGHT is what pins this number, not width: a card is `width − 16 + 47` tall,
 * so at 98 it stood 129px high and one string's captions ran into the string
 * below. 86 brings the card to 117px, which ROW_GAP clears.
 */
const PHOTO_WIDTH = { phone: 86, desktop: 134 } as const;

/**
 * Horizontal padding inside .polaroid-wall-bg — the board the strings hang on.
 *
 * The shared class ships 8px on a phone and 20px on desktop, which is right for
 * the homepage: its wall is one section of a scrolling page and wants to sit in
 * from the window's bevel. Here the window IS the gift and the wall is all of
 * it, so that inset is dead space. Cut to a hairline — enough that the board's
 * inset bevel still reads, and no more. Overridden inline rather than in
 * globals.css, because the homepage still wants the original.
 */
const BOARD_PAD_X = { phone: 2, desktop: 8 } as const;

/**
 * Horizontal padding at each end of a string.
 *
 * It was originally clearance for the tie-off bows. Those are gone, and the
 * value stayed: it is BAKED INTO PHOTO_SPACING's solved line below, so dropping
 * it to zero does not just widen the row, it puts the phone's spacing curve out
 * by 8px at every viewport. Keep it, or re-solve that too.
 */
const ROW_END_PAD = { phone: 8, desktop: 14 } as const;

/**
 * Horizontal space between neighbouring photos on a string.
 *
 * ── WHY THE PHONE VALUE IS AN EXPRESSION AND NOT A NUMBER ──────────────────
 * It is applied as a LEFT MARGIN, not the container's `gap`, because it has to
 * be able to go NEGATIVE — and CSS `gap` cannot. Three 86px photos are 258px
 * wide, and on the narrowest phones that is nearly the whole row.
 *
 * So the spacing scales with the viewport:
 *
 *     320px →  +8px
 *     340px →  +17px
 *     360px →  +26px
 *     375px+ → +30px (capped — past this the row centres in the extra slack)
 *
 * `45vw − 136px` is the line through those points, floored at −8px so a
 * freakishly narrow screen degrades to a slight overlap rather than clipping.
 * RE-SOLVE IT if PHOTO_WIDTH, ROW_END_PAD or BOARD_PAD_X change.
 */
const PHOTO_SPACING = {
  phone: 'clamp(-8px, 45vw - 136px, 30px)',
  desktop: '44px',
} as const;

/**
 * Vertical breathing room between strings, overriding the homepage's 20px.
 *
 * The homepage can be tight because its cards do not tilt much and its rows are
 * uniform. Here a card leans up to 6° and sways ±3° on top of that, so its
 * bottom corner swings ~7px below its layout box — and because each row is its
 * own stacking context painted in DOM order, a LATER row paints over an earlier
 * one's overhang. That is what was covering the captions.
 */
const ROW_GAP = { phone: 34, desktop: 42 } as const;

// ── HANGING GEOMETRY ───────────────────────────────────────────────────────
/**
 * The three CSS facts that decide where a clip's jaws land. Named rather than
 * folded into one magic number, because the previous single constant was an
 * estimate that turned out to be ~9px wrong and put every clip above the cord.
 */
/** .garland-polaroids `padding-top`. */
const ROW_PAD_TOP = 12;
/** .garland-clothespin `margin-top`. */
const CLIP_MARGIN_TOP = -24;
/**
 * How far down the clip the cord actually passes, in px.
 *
 * <Clothespin> is a 40-unit viewBox rendered 36px tall, so viewBox units scale
 * by 0.9. The jaws are the TOP OF THE WOODEN BODY — `<rect y="13">` in that
 * artwork, just under the heart — so the cord crosses at viewBox ~14, i.e.
 * 12.6px. It is NOT the metal spring at viewBox 22, and definitely not the
 * viewBox 24.4 the old estimate implied: that is near the bottom of the peg,
 * and assuming it there lifted every clip clean off the cord.
 */
const CLIP_JAW_PX = 14 * 0.9;

/**
 * How much of the polaroid's top edge hides behind the clip, and how much of
 * that tuck the stagger is allowed to eat. Minimum tuck is
 * `CLIP_TUCK − HANG_STAGGER` = 6px, which still reads as gripped.
 */
const CLIP_TUCK = 16;
const HANG_STAGGER = 10;

/**
 * The cord's y in px at a fraction `t` along the row.
 *
 * Solved from THREAD_D — `M-10,8 Q500,34 1010,8` — whose quadratic reduces to
 * `y = 8 + 52·t·(1−t)` in viewBox units. The SVG is 24px tall against a
 * 40-unit box, hence ×0.6. Range: 4.8px at the ends, 12.6px in the middle.
 *
 * If THREAD_D ever changes, this must change with it or the clips will drift
 * off the cord again.
 */
const threadYPx = (t: number) => (8 + 52 * t * (1 - t)) * 0.6;

/**
 * Where to offset a slot so its clip's jaws land on the cord at fraction `t`.
 * Clamped at zero: a negative result would hang the clip in the air ABOVE the
 * string, which is the one thing this must never do.
 */
const clipOffsetPx = (t: number) =>
  Math.max(0, threadYPx(t) - (ROW_PAD_TOP + CLIP_MARGIN_TOP + CLIP_JAW_PX));

// ── THE ARRANGEMENT ────────────────────────────────────────────────────────
/**
 * How many photos hang on each string, walked in order and repeated. Mixing
 * threes and twos is what stops the wall reading as a grid.
 */
const ROW_LENGTHS = { phone: [3, 2, 3, 2], desktop: [3, 2, 3, 3] } as const;

/** How far a photo may lean. Past ~8° neighbouring corners collide. */
const TILT_DEG = 6;

/**
 * Deterministic 0–1 from a string. FNV-1a.
 *
 * DETERMINISTIC IS THE WHOLE POINT — Math.random() here would give the server
 * one arrangement and the client another, which React reports as a hydration
 * error and which would visibly reshuffle the wall on load. Keyed on the
 * memory id, so a given photo hangs at the same angle every single time.
 */
function hash01(seed: string, salt: number): number {
  let h = (2166136261 ^ salt) >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h / 4294967295;
}

/** Symmetric jitter: hash 0–1 mapped to −amount…+amount. */
const jitter = (seed: string, salt: number, amount: number) =>
  (hash01(seed, salt) * 2 - 1) * amount;

/**
 * Deal the memories out over strings, following the row-length rotation.
 *
 * The last string is never left holding a single photo — a lone polaroid on
 * its own string reads as something that failed to load rather than as an
 * arrangement, so it borrows one from the row above or merges into it.
 */
function planStrings<T>(items: T[], lengths: readonly number[]): T[][] {
  const rows: T[][] = [];
  let placed = 0;
  let r = 0;

  while (placed < items.length) {
    const take = Math.min(lengths[r % lengths.length], items.length - placed);
    rows.push(items.slice(placed, placed + take));
    placed += take;
    r += 1;
  }

  if (rows.length > 1) {
    const last = rows[rows.length - 1];
    const prev = rows[rows.length - 2];
    if (last.length === 1) {
      if (prev.length > 2) {
        // Hand one down: 3 + 1 becomes 2 + 2.
        last.unshift(prev.pop() as T);
      } else {
        // Or absorb it: 2 + 1 becomes 3.
        prev.push(last[0]);
        rows.pop();
      }
    }
  }

  return rows;
}

export interface MemoryWallProps {
  memories: Memory[];
  /** The two names in the titlebar. Defaults to the placeholder pair. */
  names?: WallNames;
  /** Fired the first time any polaroid is flipped to its memory. */
  onFirstFlip?: () => void;
  /** Fired on every flip TO a memory, with that memory's id. */
  onFlip?: (id: string) => void;
}

export function MemoryWall({
  memories,
  names = WALL_NAMES,
  onFirstFlip,
  onFlip,
}: MemoryWallProps) {
  /**
   * One card open at a time — the homepage's `flippedSlug` rule, keyed by
   * memory id. Flipping a second card closes the first.
   */
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [hasFlipped, setHasFlipped] = useState(false);
  const isDesktop = useIsDesktop();
  /** Without this the rows stay at opacity 0 — see useGarlandReveal. */
  const wallRef = useGarlandReveal(memories.length);

  const handleFlip = useCallback(
    (id: string) => {
      playClick();
      setFlippedId((prev) => {
        const next = prev === id ? null : id;
        if (next) {
          onFlip?.(next);
          if (!hasFlipped) {
            setHasFlipped(true);
            onFirstFlip?.();
          }
        }
        return next;
      });
    },
    [hasFlipped, onFirstFlip, onFlip],
  );

  const key = isDesktop ? 'desktop' : 'phone';
  const photoWidth = PHOTO_WIDTH[key];
  const photoSpacing = PHOTO_SPACING[key];
  const boardPadX = BOARD_PAD_X[key];
  const rowGap = ROW_GAP[key];
  const rowEndPad = ROW_END_PAD[key];

  const strings = planStrings(memories, ROW_LENGTHS[key]);

  /**
   * THE ARRIVAL. Everything it needs is a class on the root, one CSS variable
   * per animated element, and a running count so the cascade is one wave across
   * the whole wall rather than one per row. See ./wall-assembly.tsx — and note
   * that nothing below is conditional on it: this markup IS the finished wall.
   */
  const skipAssembly = useSkipAssembly();
  const assembly = assemblyRootProps(skipAssembly);
  const photoStep = photoStepFor(memories.length);
  let photoIdx = 0;

  return (
    <div style={styles.field}>
      <div className={assembly.className} style={styles.frame}>
        <AssemblyStyles />
        <div className="win98-window">
          <div className="win98-titlebar">
            <span style={styles.title}>{buildTitle(names)}</span>
            {/* Never squeezed by a long title — the title truncates instead. */}
            <span style={styles.titlebarButtons}>
              <TitlebarButtons />
            </span>
          </div>
          {/* The homepage's exact body treatment: the window body steps out
              of the way so .polaroid-wall-bg IS the board. */}
          <div className="win98-body !bg-transparent !p-0">
            {/* Only the SIDE padding is overridden — the vertical padding is
                the shared class's, and it is what gives the first string room
                to hang its clips above the photos. See BOARD_PAD_X. */}
            <div
              className="polaroid-wall-bg"
              ref={wallRef}
              style={{ paddingLeft: boardPadX, paddingRight: boardPadX }}
            >
              {strings.map((rowMemories, stringIdx) => {
                const count = rowMemories.length;

                return (
                  <div
                    key={stringIdx}
                    className="garland-string-row"
                    style={{
                      animationDelay: `${stringIdx * 0.12}s`,
                      // Overrides the homepage's 20px. See ROW_GAP.
                      marginTop: stringIdx === 0 ? 0 : rowGap,
                    }}
                  >
                    <svg
                      className="garland-svg"
                      viewBox="0 0 1000 40"
                      preserveAspectRatio="none"
                      style={
                        {
                          '--mw-cord-delay': `${cordDelayMs(stringIdx)}ms`,
                        } as CSSProperties
                      }
                    >
                      <path
                        d={THREAD_D}
                        stroke="#C19A6B"
                        strokeWidth="3.5"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* The photos. `gap: 0` because the spacing is a per-slot
                        left margin instead — it must be able to go negative. */}
                    <div
                      className="garland-polaroids"
                      style={{
                        gap: 0,
                        paddingLeft: rowEndPad,
                        paddingRight: rowEndPad,
                      }}
                    >
                      {rowMemories.map((m, pos) => {
                        const isFlipped = flippedId === m.id;
                        const gradient =
                          gradients[(m.tint ?? pos) % gradients.length];

                        /**
                         * Put the CLIP on the cord: fraction across the row →
                         * the drawn curve's y there, minus the CSS offsets.
                         * Clamped at 0, so it can never rise above the string.
                         */
                        const t = (pos + 0.5) / count;
                        const clipOffset = clipOffsetPx(t);

                        /**
                         * Then let the PHOTO hang lower, as if the clip gripped
                         * nearer its corner. hash01 is 0–1, so this is always
                         * ≥ 0 — the stagger can only ever move a photo DOWN.
                         * Tuck goes 16px → 6px, never to zero.
                         */
                        const drop = hash01(m.id, 2) * HANG_STAGGER;
                        // Flow maths: the polaroid starts 8px below the clip's
                        // bottom edge, so this margin sets the tuck directly.
                        const polaroidMarginTop = drop - (CLIP_TUCK - 8);

                        /**
                         * Which card sits on top if two ever touch. Hashed, so
                         * any overlap is irregular rather than a tidy
                         * left-to-right cascade — but a FLIPPED card always
                         * wins, or the memory being read could end up
                         * underneath its neighbour.
                         */
                        const stack = isFlipped
                          ? 50
                          : 10 + Math.round(hash01(m.id, 9) * 8);

                        /**
                         * Its place in the ARRIVAL, counted across the whole
                         * wall rather than within the row — see the note on
                         * photoDelayMs. Incrementing during the render is safe
                         * because this map runs once, top to bottom, in the
                         * same order every time.
                         */
                        const dropDelay = photoDelayMs(photoIdx, photoStep);
                        photoIdx += 1;

                        return (
                          <div
                            key={m.id}
                            className="garland-slot"
                            style={
                              {
                                '--mw-drop-delay': `${dropDelay}ms`,
                                // Overrides .garland-slot's `flex: 0 1 105px`.
                                // Fixed, so a busier row cannot shrink its
                                // photos.
                                flex: '0 0 auto',
                                width: photoWidth,
                                maxWidth: photoWidth,
                                marginTop: clipOffset,
                                // The spacing. A margin rather than the row's
                                // `gap`, because on a narrow phone this has to
                                // go negative — see PHOTO_SPACING.
                                marginLeft: pos === 0 ? 0 : photoSpacing,
                                position: 'relative',
                                zIndex: stack,
                              } as CSSProperties
                            }
                          >
                            <Clothespin className="garland-clothespin" />
                            <div
                              className={`garland-polaroid${isFlipped ? ' is-unclipped' : ''}`}
                              style={
                                {
                                  // Overrides .garland-polaroid's −4px, which
                                  // is what sets the tuck depth.
                                  marginTop: polaroidMarginTop,
                                  '--base-angle': `${jitter(m.id, 1, TILT_DEG).toFixed(2)}deg`,
                                  animationDuration: `${(4 + hash01(m.id, 3) * 2.5).toFixed(2)}s`,
                                  animationDelay: `${(hash01(m.id, 4) * 4).toFixed(2)}s`,
                                } as CSSProperties
                              }
                              onClick={() => handleFlip(m.id)}
                            >
                              <div
                                className={`polaroid-flipper${isFlipped ? ' is-flipped' : ''}`}
                              >
                                {/* FRONT — the photograph. The gradient shows
                                      while the image loads, and stands in
                                      without one. */}
                                <div className="polaroid-front">
                                  <div
                                    className="polaroid-photo"
                                    style={{ background: gradient }}
                                  >
                                    {m.photo ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={m.photo}
                                        alt=""
                                        style={styles.photoImg}
                                      />
                                    ) : null}
                                  </div>
                                  <div className="polaroid-caption">
                                    <span className="font-handwritten text-[15px] text-ink">
                                      {m.caption}
                                    </span>
                                  </div>
                                </div>

                                {/* BACK — the sender's memory. */}
                                <div className="polaroid-back">
                                  <p className="font-handwritten text-[15px] leading-snug text-ink">
                                    {m.memory}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  field: {
    // The page's own lavender (--win-body-bg, #c8a2e8) — the same ground the
    // homepage wall sits on. The page-wide .scanline-overlay from
    // app/layout.tsx is already on top.
    minHeight: '100svh',
    width: '100%',
    background: 'var(--win-body-bg)',
  },
  frame: {
    // TIGHT ON PURPOSE. The window is the gift; the lavender around it is just
    // the room it sits in, so the border is a hairline rather than a mat.
    // The horizontal clamp is BAKED INTO THE ROW BUDGET — widening it takes
    // space straight from between the photographs.
    maxWidth: 720,
    margin: '0 auto',
    padding:
      'clamp(10px, 3vw, 22px) clamp(8px, 2.5vw, 18px) calc(clamp(14px, 4vw, 26px) + env(safe-area-inset-bottom, 0px))',
  },
  /**
   * The titlebar caption. Two names can be long, so it degrades in two stages
   * rather than clipping: the font shrinks with the viewport, and past that it
   * ellipsises. `minWidth: 0` is what actually allows a flex child to shrink
   * below its content width — without it the text pushes the buttons off.
   */
  title: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'clamp(12px, 3.6vw, 15px)',
  },
  titlebarButtons: {
    flex: '0 0 auto',
    display: 'flex',
    marginLeft: 6,
  },
  photoImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};
