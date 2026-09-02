'use client';

import { useEffect, useRef } from 'react';

/**
 * <CursorTrail> — a soft sprinkle of hearts behind the pointer.
 *
 * Mounted once in the root layout, so it is on every route, sender and
 * recipient alike. It draws nothing on its own: the host <div> ships empty
 * from the server and the pool below is built imperatively after mount, which
 * keeps hydration honest and means a device that should not have a trail never
 * pays for one.
 *
 * ── WHY IT CANNOT RUN AWAY ────────────────────────────────────────────────
 * A naive trail listens to pointermove and appends a node per event. A gaming
 * mouse fires that a thousand times a second, and each node is a style recalc,
 * a layout, a paint and then garbage. Three things stop that here:
 *
 *   1. THE POOL IS FIXED AND ALLOCATED ONCE. MAX_PARTICLES nodes are created
 *      at mount and reused round-robin forever. Nothing is ever appended or
 *      removed while the mouse is moving, so there is no allocation, no
 *      removal, and the node count is a constant no matter how long or how
 *      fast anyone waves the mouse about.
 *
 *   2. THE EVENT DOES NOT DRAW. pointermove only writes two numbers into a
 *      ref. Every DOM write happens in a single requestAnimationFrame loop, so
 *      the work is capped at once per frame however often the event fires.
 *
 *   3. SPAWNING IS THROTTLED BY DISTANCE *AND* TIME - see the two constants.
 *
 * ── THE NUMBERS AGREE WITH EACH OTHER ─────────────────────────────────────
 * SPAWN_DISTANCE governs density and MIN_SPAWN_MS governs rate, and together
 * they bound how many can ever be alive at once:
 *
 *   max spawn rate   = 1000 / MIN_SPAWN_MS   = ~22 per second
 *   average lifetime = ~650ms                = 0.65s
 *   steady state     = 22 x 0.65             = ~14 alive
 *
 * which is why MAX_PARTICLES is 18: it clears the real ceiling with headroom
 * rather than being a number picked because it sounded small. If the pool ever
 * does wrap early, the oldest particle is simply re-animated - it cuts short,
 * it does not leak.
 *
 * Distance-throttling rather than time alone is what makes it read as a TRAIL:
 * spawning every N pixels ties the sprinkle to how far the pointer travelled,
 * so a slow drift leaves a few and a quick sweep leaves a line. Time-only
 * throttling puts a puddle under a stationary jiggling mouse.
 *
 * ── IT FOLLOWS THE ARROW, NOT THE HAND ────────────────────────────────────
 * Decoration has to yield to the task, and the pointer says which one it is
 * doing. An arrow is a pointer at rest in the page; a hand is a pointer with a
 * job in front of it. So the sprinkle stands down over anything CLICKABLE -
 * anywhere the hand cursor is showing - and comes back the moment the pointer
 * is over ordinary ground again. Hearts drift across a background, a
 * photograph or a paragraph, and never across a button, a link, a checkbox or
 * one of the captcha grid's nine squares.
 *
 * IT IS A PER-ELEMENT RULE, AND IT REPLACED A PER-SCREEN ONE. The captcha gate
 * used to hold the trail off for the whole of its photo-grid phase. Same
 * instinct, far blunter instrument: that screen is mostly not grid, and the
 * old rule took the sprinkle off the empty lilac around the card as well as
 * off the squares. Asking the ELEMENT instead of the screen aims at the thing
 * the screen rule was only approximating - and no screen has to remember to
 * ask. See "WHAT IT COSTS TO ASK" in the tick for how the question gets
 * answered without being paid for on every frame.
 */

/** Nodes in the pool. See the arithmetic above - this is a ceiling, not a target. */
const MAX_PARTICLES = 18;
/** Pointer travel between spawns, in px. Density: bigger = sparser. */
const SPAWN_DISTANCE = 26;
/** Floor between spawns, in ms. Rate: stops a fast flick emptying the pool at once. */
const MIN_SPAWN_MS = 45;
/** Stop the rAF loop after this long with no movement, so an idle tab costs nothing. */
const IDLE_MS = 500;

/**
 * Hearts only, filled and hollow. Both weights are in the pick so the trail
 * reads as a mix of solid and outline rather than one uniform stamp.
 */
const GLYPHS = ['♥', '♡'] as const;
/**
 * Warm pink -> peach -> soft gold. Glyph and color are picked independently,
 * so every heart shape lands on every tone and the sprinkle stays mixed.
 */
const COLORS = [
  '#ff6ec7', // warm pink
  '#ff9ec7', // soft pink
  '#ffb38a', // peach
  '#ffc9a3', // pale peach
  '#ffd97a', // soft gold
  '#f5c26b', // deeper gold
] as const;

/*
 * ── HOW THE HAND IS RECOGNISED ─────────────────────────────────────────────
 *
 * NOT BY LISTING WHAT IS CLICKABLE. A list of selectors here - button, a[href],
 * [role=button], .cg-tile, and on and on - would be a second copy of the safety
 * net in globals.css, kept in step by hand and wrong the first time anyone gave
 * something `cursor: var(--cursor-hand)` without thinking to update it. The
 * question is already answered, in the one place that can answer it correctly:
 * the element's own computed style. So that is what gets asked, and there stays
 * exactly one source of truth for what counts as clickable.
 *
 * THE TEST IS "ENDS WITH", NOT "EQUALS", which is what makes it true on both
 * arms of the cursor gate in globals.css. With the pixel artwork on, the
 * computed value is `url("data:image/svg+xml,...") 9 5, pointer`; where that
 * gate declines - a phone, a narrow window with no fine pointer - the same
 * property resolves to the bare keyword. The fallback keyword is the tail
 * either way, so the tail is the half worth testing.
 *
 * `cursor: grab` IS DELIBERATELY NOT THIS. The receipt's drag surface is a hand
 * to look at, but it is not a click target - it is a thing you are already
 * holding - and it keeps its trail. Only the hand/pointer cursor stands the
 * sprinkle down.
 */
const HAND_CURSOR = 'pointer';

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(xs: readonly T[]) => xs[(Math.random() * xs.length) | 0];

export function CursorTrail() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /*
     * TWO GATES, AND THE FIRST IS THE SAME ONE THE CURSOR ITSELF USES.
     *
     * A device with no pointer has nothing to trail, and "reduce" is a request
     * not to animate - a sprinkle that follows the mouse is exactly the
     * decorative motion that setting is asking about. Both are watched rather
     * than read once, so plugging in a mouse, flipping the OS setting or
     * resizing across the width arm takes effect without a reload.
     *
     * POINTER_QUERY IS DELIBERATELY LOOSE, and the tight gate is downstream:
     * onMove drops anything whose pointerType is not 'mouse'. So a wide tablet
     * that clears the width arm builds a pool and then never spawns from it -
     * eighteen idle spans and no work - while a real trackpad on a touchscreen
     * laptop, which the pointer media features describe as a phone, gets the
     * trail it should always have had. The full reasoning is in globals.css,
     * above the cursor's own gate; keep the three copies of this list in step.
     */
    const POINTER_QUERY =
      '(any-pointer: fine), (any-hover: hover), (min-width: 900px)';
    const fine = window.matchMedia(POINTER_QUERY);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    let pool: { outer: HTMLSpanElement; inner: HTMLSpanElement }[] = [];
    let next = 0;
    let raf = 0;
    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    let lastSpawn = 0;
    let lastMove = 0;
    let primed = false;
    /*
     * WHAT THE POINTER IS OVER, WHAT WAS LAST MEASURED, AND WHAT IT MEASURED
     * TO. Three variables rather than one because the answer is cached against
     * the element it was taken from - see the tick.
     */
    let over: Element | null = null;
    let measured: Element | null = null;
    let overHand = false;

    const buildPool = () => {
      if (pool.length) return;
      for (let i = 0; i < MAX_PARTICLES; i += 1) {
        const outer = document.createElement('span');
        outer.className = 'cursor-trail-dot';
        const inner = document.createElement('span');
        inner.className = 'cursor-trail-glyph';
        /*
         * THE TEXT NODE IS CREATED ONCE AND ONLY EVER REWRITTEN.
         *
         * Setting .textContent on spawn would drop the old text node and insert
         * a new one, which is a childList mutation — and anything watching
         * <body> with a subtree MutationObserver (RetroSounds does, to catch
         * newly mounted windows) would then wake up ~22 times a second while
         * the mouse moves. Writing .nodeValue instead is a characterData
         * change: invisible to those observers, and cheaper besides.
         */
        inner.appendChild(document.createTextNode(''));
        outer.appendChild(inner);
        host.appendChild(outer);
        pool.push({ outer, inner });
      }
    };

    const teardownPool = () => {
      pool.forEach((p) => {
        p.inner.getAnimations().forEach((a) => a.cancel());
        p.outer.remove();
      });
      pool = [];
      next = 0;
    };

    const spawn = (now: number) => {
      const slot = pool[next];
      next = (next + 1) % pool.length;

      /*
       * THE OUTER NODE CARRIES POSITION, THE INNER ONE CARRIES THE ANIMATION.
       * Splitting them means the drift keyframes never have to know where on
       * screen the particle is - they are the same three transforms every
       * time, so the compositor can reuse them, and neither node ever needs a
       * left/top write (which would cost layout).
       */
      slot.outer.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      const size = rand(9, 15);
      slot.inner.firstChild!.nodeValue = pick(GLYPHS);
      slot.inner.style.fontSize = `${size.toFixed(1)}px`;
      slot.inner.style.color = pick(COLORS);

      // Drifts up and a little sideways, like something let go of rather than thrown.
      const dx = rand(-13, 13);
      const dy = rand(-27, -9);
      const spin = rand(-38, 38);

      slot.inner.getAnimations().forEach((a) => a.cancel());
      slot.inner.animate(
        [
          {
            transform: 'translate(0px, 0px) scale(0.5) rotate(0deg)',
            opacity: 0,
          },
          {
            transform: `translate(${(dx * 0.3).toFixed(1)}px, ${(dy * 0.25).toFixed(1)}px) scale(1) rotate(${(spin * 0.3).toFixed(1)}deg)`,
            opacity: 0.9,
            offset: 0.22,
          },
          {
            transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(0.62) rotate(${spin.toFixed(1)}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: rand(520, 800),
          easing: 'cubic-bezier(0.22, 0.7, 0.35, 1)',
          fill: 'forwards',
        },
      );

      lastSpawn = now;
      lastX = x;
      lastY = y;
    };

    const tick = (now: number) => {
      // Idle: stop burning frames until the pointer wakes us up again.
      if (now - lastMove > IDLE_MS) {
        raf = 0;
        return;
      }
      /*
       * WHAT IT COSTS TO ASK, because getComputedStyle inside a loop that also
       * WRITES styles is the textbook way to force a style recalc on every
       * frame. Two things keep this one honest:
       *
       *   IT IS CACHED AGAINST THE ELEMENT. The answer cannot change while the
       *   pointer stays inside the same element, so a sweep down a page asks a
       *   handful of times rather than sixty, and a pointer parked on a button
       *   asks exactly once. The reference compare is the whole cache.
       *
       *   IT READS BEFORE IT WRITES, never after. spawn() is the only thing in
       *   this loop that touches style and it runs below this, so the frame is
       *   one read and then one write - which is the batching rule rather than
       *   a violation of it.
       *
       * The pointermove handler deliberately does NOT do this. It writes the
       * element into a variable exactly as it writes the coordinates, and the
       * measuring happens here, once a frame at the very most.
       */
      if (over !== measured) {
        measured = over;
        overHand = over
          ? getComputedStyle(over).cursor.endsWith(HAND_CURSOR)
          : false;
      }

      /*
       * Over something clickable: spend the frame, spawn nothing, and keep the
       * distance test anchored to the pointer. Without that anchoring, the
       * travel accrued while the trail was off would still be banked when it
       * came back on, and the first move after leaving a button would spawn
       * instantly from a stale origin - a clot of hearts sitting on the edge
       * the pointer crossed.
       */
      if (overHand) {
        lastX = x;
        lastY = y;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      if (
        dx * dx + dy * dy >= SPAWN_DISTANCE * SPAWN_DISTANCE &&
        now - lastSpawn >= MIN_SPAWN_MS
      ) {
        spawn(now);
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      // Still no work in the event: this is a reference write, exactly like the
      // two above it. What it costs to READ is paid once, in the tick.
      over = e.target instanceof Element ? e.target : null;
      lastMove = performance.now();
      if (!primed) {
        // First sighting: anchor the distance test here so the very first move
        // does not spawn from a phantom 0,0 origin across the whole screen.
        lastX = x;
        lastY = y;
        primed = true;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener('pointermove', onMove);
    };

    const sync = () => {
      const on = fine.matches && !still.matches;
      stop();
      if (!on) {
        teardownPool();
        return;
      }
      buildPool();
      primed = false;
      // The artwork arm of the cursor gate may have just switched on or off
      // underneath us, so nothing measured before this is worth keeping.
      measured = null;
      window.addEventListener('pointermove', onMove, { passive: true });
    };

    /*
     * HEARTS ALREADY IN FLIGHT ARE LEFT TO FINISH when the pointer crosses on
     * to something clickable. They are mid-fade and gone within 800ms, and
     * cancelling them would pop a handful of glyphs out of existence in a
     * single frame - which draws far more attention to the edge than letting
     * them drift out ever does.
     */

    // A hidden tab should not be animating anything.
    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    sync();
    fine.addEventListener('change', sync);
    still.addEventListener('change', sync);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      teardownPool();
      fine.removeEventListener('change', sync);
      still.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <div ref={hostRef} className="cursor-trail" aria-hidden />;
}
