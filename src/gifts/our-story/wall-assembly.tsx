'use client';

/**
 * THE ARRIVAL — how OUR_STORY's wall builds itself once the passcode is done.
 *
 * ── THE SEQUENCE ───────────────────────────────────────────────────────────
 * Three beats, ~3.0s end to end for the placeholder set at TEMPO 1.4:
 *
 *     0ms      the MEMORIES.exe window unfurls downward and fades in
 *     476ms    each cord stretches across its row, left to right, 112ms apart
 *     868ms    the polaroids drop in one at a time, 210ms apart, and settle
 *              — the last one lands at 2982ms, and that is the whole arrival
 *
 * Those are the TEMPO 1.4 figures. Change TEMPO, not them.
 *
 * There was a fourth beat: the tie-off bows popping in as a finishing touch.
 * The bows are gone from the wall, so it went with them.
 *
 * Nothing carries anything and nothing follows a path. Every beat is opacity
 * plus one transform on one element, which is what keeps it smooth: the
 * compositor can run the whole thing without a single layout pass.
 *
 * ── THE RULE THAT KEEPS IT SAFE ────────────────────────────────────────────
 * THE FINISHED WALL IS THE DEFAULT. Every keyframe below ends on the resting
 * value and every rule is scoped under `.mw-build`, so the markup in
 * ./memory-wall.tsx already IS the built wall and this is a detour that always
 * returns to it. Kill the class, kill the CSS, kill this file — the wall is
 * still there, fully hung.
 *
 * ── WHY `.mw-build` IS IN THE SERVER HTML ──────────────────────────────────
 * It would be more obvious to add the class in an effect after mount. That
 * flashes: the server paints a finished wall, then hydration snaps it back to
 * frame-zero and rebuilds it in front of you.
 *
 * So the class ships in the markup and the animation is PURE CSS — it starts on
 * its own, before React has hydrated anything, from the first paint. JavaScript
 * is only ever used to take the assembly AWAY (see useSkipAssembly), never to
 * start it. That also means a slow hydration cannot make the wall arrive late.
 *
 * ── SKIPPING ───────────────────────────────────────────────────────────────
 * Two independent outs, and they work differently on purpose:
 *
 *   · prefers-reduced-motion is handled in CSS, at the bottom of this file. It
 *     has to be, because a JS check runs after first paint — by then the
 *     animation someone asked not to see has already started.
 *   · A weak device is handled in JS (`.mw-instant`), because there is no media
 *     query for two cores. It can only ever cut the sequence short, which on a
 *     phone dropping frames is the better outcome anyway.
 *
 * Both land in the same place: `animation: none` on everything, and because the
 * resting state is the default, that IS the finished wall.
 *
 * ── WHAT THIS DELIBERATELY OVERRIDES ───────────────────────────────────────
 * `.garland-string-row` (globals.css) ships `opacity: 0` with `string-drop-in`
 * paused, waiting for `.is-visible` from useGarlandReveal. That is the
 * HOMEPAGE's arrival — one 0.4s drop for the whole row — and it would fight
 * this one, moving the cord and the photographs as a block while they are
 * trying to arrive separately. Under `.mw-build` the row is simply shown, and
 * the choreography below takes over from there.
 *
 * The override is three classes deep so it beats `.garland-string-row.is-visible`
 * on specificity rather than on source order, which would depend on where this
 * <style> lands relative to globals.css.
 *
 * `.mw-build` is NEVER REMOVED once rendered. Taking it off would restore
 * `animation: string-drop-in ... running` on a row that is already settled, and
 * the whole wall would drop a second time.
 */

import { useEffect, useState } from 'react';

// ── TIMING ─────────────────────────────────────────────────────────────────
/**
 * THE ONE KNOB. Multiplies every number below, so the whole sequence stretches
 * or tightens without any of the beats sliding out of proportion with each
 * other — which is what happens the moment you start hand-editing individual
 * delays.
 *
 *     1.0   2.1s, the original brisk version
 *     1.4   3.0s  ← here
 *     1.8   3.8s, stately
 *
 * Past about 2.0 the cascade stops reading as a flourish and starts reading as
 * a page that has not finished loading. That is the ceiling worth having.
 */
export const TEMPO = 1.4;

/** Applied to every constant in ASSEMBLY. Rounded so the CSS gets whole ms. */
const beat = (ms: number) => Math.round(ms * TEMPO);

/**
 * Every number in the sequence, in ms, AT TEMPO 1 — read together they are the
 * storyboard. The CSS below only knows durations, and the delays are all
 * computed here.
 */
export const ASSEMBLY = {
  /** Beat 1. The window unfurls. Everything else waits behind it. */
  windowMs: beat(400),

  /** Beat 2. Cords, starting just before the window has finished settling. */
  cordsStartMs: beat(340),
  cordMs: beat(280),
  /** Between one row's cord and the next. */
  cordStepMs: beat(80),

  /** Beat 3. The cascade. */
  photosStartMs: beat(620),
  photoMs: beat(460),
  /** Between one photograph and the next — the number that makes it BUILD. */
  photoStepMs: beat(150),
  /**
   * The cascade may not outlast this, however many photographs there are.
   * Twenty memories at a full step apart would take seconds on their own and
   * the arrival would stop being a flourish and start being a wait, so the step
   * compresses instead. See photoStepFor().
   */
  maxCascadeMs: beat(1200),
} as const;

/**
 * How far apart the photographs arrive, given how many there are. Normally
 * `photoStepMs`; compressed for a big set so the whole cascade still fits in
 * `maxCascadeMs`.
 */
export function photoStepFor(count: number): number {
  if (count <= 1) return ASSEMBLY.photoStepMs;
  return Math.min(ASSEMBLY.photoStepMs, ASSEMBLY.maxCascadeMs / (count - 1));
}

/** When row `rowIdx`'s cord starts drawing. */
export function cordDelayMs(rowIdx: number): number {
  return ASSEMBLY.cordsStartMs + rowIdx * ASSEMBLY.cordStepMs;
}

/**
 * When photograph `photoIdx` starts falling. The index is its place across the
 * WHOLE wall, not its place in its row — otherwise every row would start
 * dropping at once and it would read as three cascades rather than one.
 */
export function photoDelayMs(photoIdx: number, step: number): number {
  return ASSEMBLY.photosStartMs + photoIdx * step;
}

/**
 * Total run time — the last photograph's delay plus its fall. Nothing follows
 * it, so this is when the wall is settled.
 */
export function totalAssemblyMs(count: number): number {
  const step = photoStepFor(count);
  return photoDelayMs(Math.max(0, count - 1), step) + ASSEMBLY.photoMs;
}

/**
 * Should the assembly be cut short?
 *
 * Only ever returns true — it can take the sequence away, never start it, since
 * the CSS has already started on its own by the time this runs. False on the
 * server and on the first paint, so the animation is never suppressed by a
 * check that has not happened yet.
 *
 * The device test is deliberately coarse. A phone reporting two cores or 2GB is
 * the kind that drops frames through a compositor-heavy sequence, and on that
 * phone a stuttering arrival is worse than no arrival. prefers-reduced-motion
 * is NOT checked here — it is a media query at the bottom of WALL_ASSEMBLY_CSS,
 * because it has to take effect before the first frame rather than after it.
 */
export function useSkipAssembly(): boolean {
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 8;
    const memory = nav.deviceMemory ?? 8;
    if (cores <= 2 || memory <= 2) setSkip(true);
  }, []);

  return skip;
}

/**
 * The root's class list. The per-element delays are set on the elements
 * themselves; nothing needs to be inherited from here any more.
 */
export function assemblyRootProps(skip: boolean) {
  return { className: `mw-build${skip ? ' mw-instant' : ''}` };
}

/**
 * Injects the choreography. A component rather than a bare string so
 * ./memory-wall.tsx can keep its promise of declaring no CSS of its own — this
 * file owns every rule the arrival needs.
 */
export function AssemblyStyles() {
  return (
    // Raw-HTML injection, not a text child: React's server renderer escapes
    // quotes and angle brackets inside a <style> text child while the client
    // does not, which is a hydration mismatch.
    <style dangerouslySetInnerHTML={{ __html: WALL_ASSEMBLY_CSS }} />
  );
}

export const WALL_ASSEMBLY_CSS = `
/*
 * The homepage's row drop-in, stood down. See the note at the top of this file:
 * three classes deep so it wins on specificity, not on source order.
 */
.mw-build .polaroid-wall-bg .garland-string-row {
  animation: none;
  opacity: 1;
}

/* ── BEAT 1: the window unfurls ─────────────────────────────────────────── */
.mw-build .win98-window {
  transform-origin: top center;
  animation: mw-window ${ASSEMBLY.windowMs}ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

@keyframes mw-window {
  0% {
    opacity: 0;
    transform: scaleY(0.86) translateY(-6px);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

/*
 * ── BEAT 2: the cords stretch ───────────────────────────────────────────
 * scaleX from the left edge, NOT a stroke-dashoffset draw. The dash trick needs
 * the path's measured length and breaks the moment THREAD_D or the row's width
 * changes; a scale is one compositor property and cannot get out of step with
 * the geometry.
 */
.mw-build .garland-svg {
  transform-origin: left center;
  animation: mw-cord ${ASSEMBLY.cordMs}ms cubic-bezier(0.2, 0.8, 0.3, 1) both;
  animation-delay: var(--mw-cord-delay, 0ms);
}

@keyframes mw-cord {
  0% {
    opacity: 0.55;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

/*
 * ── BEAT 3: the cascade ─────────────────────────────────────────────────
 * The clip and its photograph drop together, as one unit, so it reads as the
 * pair arriving and gripping the cord rather than a photo appearing under a peg
 * that was already there.
 *
 * The overshoot in the easing IS the settle — the slot passes its resting
 * position and comes back. Nothing here touches .garland-polaroid, whose
 * transform is the endless sway; that keeps swaying underneath and takes over
 * seamlessly when this finishes.
 */
.mw-build .garland-slot {
  transform-origin: top center;
  animation: mw-drop ${ASSEMBLY.photoMs}ms cubic-bezier(0.22, 1.15, 0.36, 1) both;
  animation-delay: var(--mw-drop-delay, 0ms);
}

@keyframes mw-drop {
  0% {
    opacity: 0;
    transform: translateY(-18px) rotate(-5deg);
  }
  55% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

/*
 * ── THE TWO WAYS OUT ────────────────────────────────────────────────────
 * Identical outcome: no animation anywhere, and since every resting value is
 * the default, that is the finished wall. .mw-instant comes from JS for a weak
 * device; the media query catches prefers-reduced-motion before the first
 * frame, which a JS check cannot do.
 */
.mw-build.mw-instant .win98-window,
.mw-build.mw-instant .garland-svg,
.mw-build.mw-instant .garland-slot {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .mw-build .win98-window,
  .mw-build .garland-svg,
  .mw-build .garland-slot {
    animation: none;
  }
}
`;
