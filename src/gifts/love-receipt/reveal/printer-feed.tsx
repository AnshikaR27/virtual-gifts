'use client';

/**
 * <PrinterFeed> — the receiver's reveal beat: the receipt ratchets out of the
 * slot of a chunky beige 1990s dot-matrix printer and comes to rest. That is the
 * whole beat; there is deliberately nothing after it (no sheen, no shimmer, no
 * highlight sweep).
 *
 * VISUAL LANGUAGE: Language A (Y2K / Windows 98). Beige moulded plastic, win98
 * bevels (light top-left, darkest bottom-right — the same border treatment as
 * .win98-window / .win98-btn), square corners, and HARD pixel shadows only
 * (Npx Npx 0 0, zero blur). There is no window chrome here on purpose: the
 * printer and the paper sit directly on the lavender field.
 *
 * How the illusion works (no images, pure CSS):
 *
 *   .printerFoot    the chassis BELOW the slot — the lower lip. z BELOW the
 *                   paper, so the sheet drapes in FRONT of it. Absolutely
 *                   positioned, so it does not participate in flow and cannot
 *                   push the paper down.
 *   .printerHead    the chassis AT and ABOVE the slot. z ABOVE the paper, so it
 *                   covers everything above the slot line. FIXED — it never
 *                   moves or animates.
 *     .vents        moulded ribs across the shoulder (hard-stop gradient).
 *     .led          square power lamp. No glow — a glow is a blur.
 *     .slot         the dark mouth, pinned to the head's BOTTOM edge, bevelled
 *                   SUNKEN (dark top-left, light bottom-right — the inverse of
 *                   the chassis). Its bottom edge IS the line the paper
 *                   emerges from.
 *   .paperWindow    overflow:hidden. Its top edge is pulled up INTO the slot by
 *                   SLOT_OVERLAP, so the sheet is clipped inside the mouth and
 *                   the head paints over that overlap. z between foot and head.
 *     .lr-feed      transform translateY(-paper height) -> translateY(0), in
 *                   discrete steps() increments. The sheet physically DESCENDS
 *                   out of the slot; it is not uncovered in place.
 *       .lr-jitter  ±1px horizontal dot-matrix vibration, for the duration of
 *                   the feed only.
 *         .shadow   drop-shadow, cast from the post-mask alpha, zero blur
 *           .torn   CSS zigzag mask on the bottom edge (the tear-off)
 *             ReceiptPaper   <- rendered whole and untouched, carrying its own
 *                               LEADER_PX of blank paper above the masthead
 *   .slotShade      a short hard-stepped band sitting ON the emerging paper at
 *                   the slot line, so the sheet reads as coming out of a dark
 *                   mouth rather than starting at a hard clip edge.
 *
 * WHY THE CHASSIS IS SPLIT IN TWO
 * -------------------------------
 * An earlier revision drew the chassis as ONE element above the paper. Because
 * that element is opaque all the way down to its bottom edge, the sheet stayed
 * hidden until it cleared the WHOLE chassis — so the paper appeared to come out
 * from underneath the printer rather than through its slot, which is the one
 * thing this scene has to sell.
 *
 * Splitting at the slot line fixes it without giving up the overlap:
 *   • head (0 -> HEAD_H, includes the slot) paints ABOVE the paper, so the
 *     plastic genuinely covers the sheet above the slot line — the paper visibly
 *     disappears INTO the mouth rather than being merely clipped there.
 *   • foot (HEAD_H -> CHASSIS_H) paints BELOW the paper, so the sheet emerges
 *     at the slot and hangs in front of the lower lip. The lip still reads as
 *     part of the chassis because the paper (300px) is narrower than the
 *     printer (348px), so plastic shows on both sides.
 * Both halves are FLAT beige (CHASSIS), so the two pieces match by construction
 * — the old revision had to scroll one shared gradient by HEAD_H to hide the
 * seam, which the flat Y2K fill makes unnecessary.
 *
 * WHY TRANSLATE AND NOT A CLIP-PATH WIPE
 * --------------------------------------
 * A clip wipe uncovers the receipt in place: every pixel is already at its
 * final position and the paper never moves, which does not read as printing.
 *
 * An earlier revision of this file argued against translate on the grounds that
 * it "runs backwards" — the tear-off edge clears the slot first and the
 * masthead lands last. That is not a defect, it is what a line printer does:
 * the first line printed is the first line out of the mouth, so it ends up
 * FURTHEST from the slot while the most recently printed line sits AT the slot.
 *
 * The travel distance and the duration are BOTH derived from the same
 * server-side estimate of the paper's height (estimatedPaperPx), so a longer
 * slip travels proportionally further over proportionally more time and the
 * feed rate is exactly FEED_PX_PER_SEC on every receipt — see feedDurationMs().
 *
 * Both are fixed lengths in the SSR markup rather than percentages of the live
 * element, because the browser paints this element long before the receipt's
 * markup has finished parsing. See FEED_FROM for the measurements.
 *
 * WHY THE REVEAL IS PURE CSS, NOT A JS-TRIGGERED TRANSITION
 * ---------------------------------------------------------
 * This screen is server-rendered (/g/[shortId] is a dynamic route). The whole
 * beat therefore has to be encoded in the FIRST PAINT of the server HTML,
 * because that paint happens long before React hydrates: the /g bundle is
 * ~180 kB of first-load JS, and on a mid-range phone hydration lands seconds
 * after the recipient is already looking at the page.
 *
 * An earlier version armed the start state from a layout effect, so the
 * server HTML painted the receipt FULLY REVEALED and only snapped to the
 * retracted start state once React took over. Measured on this route: 483 ms of
 * fully-formed receipt on a fast desktop, 4.1 s at 6x CPU throttle. The reveal
 * did technically run — just long after the recipient had read the receipt,
 * which reads as "it doesn't animate".
 *
 * A CSS animation declared in the server markup starts at first paint, needs no
 * JS at all, and `animation-fill-mode: both` guarantees it ENDS on the readable
 * state. That is strictly safer than the old fail-open: if the JS chunk 404s or
 * hydration bails, the receipt still feeds itself out and still ends readable.
 * The start state is in the server HTML, so the paper is already tucked inside
 * the printer on the very first frame the browser paints. THE STEPPED TIMING
 * CHANGES NONE OF THIS — steps() is an ordinary timing function, so the beat is
 * exactly as declarative as it was before.
 *
 * WHY THE ANIMATION IS DECLARED IN LONGHANDS
 * ------------------------------------------
 * `animation-timing-function` is the one property here whose value is built
 * from a custom property — `steps(var(--lr-steps), end)`. In the `animation`
 * SHORTHAND an unparseable timing function invalidates the WHOLE declaration,
 * which would drop animation-name and animation-fill-mode with it and strand
 * the sheet at its retracted start state — an invisible receipt. Declared as
 * longhands, a bad timing function is dropped on its own and the feed still
 * runs (smoothly rather than stepped). Do not "tidy" these back into the
 * shorthand.
 *
 * The feed DURATION is derived from an ESTIMATED paper height at a fixed
 * px/sec — a print head feeds at a constant rate, so a 9-item slip must take
 * longer than a 4-item one. It is estimated from the line count rather than
 * measured from the DOM because the value has to be identical on the server and
 * the client (a measured value could not exist during SSR), and because
 * measuring meant waiting on document.fonts.ready before the reveal could even
 * begin. See EST_CHROME_PX / EST_LINE_PX / LEADER_PX — retune those, not the CSS.
 *
 * ReceiptPaper's own `printedCount` / `animate` props are deliberately unused
 * here — those mount rows one at a time and reflow the paper on every step,
 * which would change the sheet's height mid-travel and break the constant feed
 * rate. The receipt is rendered complete, and `transform` is the ONLY animated
 * property in the whole beat — compositor-only, so nothing here triggers layout
 * or paint per frame.
 *
 * NOTE ON THE STYLE TAG BELOW: FEED_CSS is injected with
 * dangerouslySetInnerHTML, NOT as a text child. Do not "simplify" it back.
 * React's server renderer HTML-escapes `<`, `>`, `&`, `"` and `'` in a text
 * child, but the HTML parser treats <style> content as raw text and does not
 * decode entities — so the server DOM ends up with a literal `&quot;` where the
 * client renderer puts `"`. That is a text-content hydration mismatch (React
 * #425), and because this subtree sits under GiftReveal's Suspense boundary it
 * escalates to #422: React discards the entire server-rendered gift and
 * re-renders it on the client, restarting the reveal mid-feed.
 * dangerouslySetInnerHTML is emitted verbatim on both sides, so the whole class
 * of bug goes away and the CSS comments can say whatever they like.
 */

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { ReceiptPaper } from '../receipt-paper';
import type { ReceiptPayload } from '../lines';
import {
  PrinterFoot,
  PrinterHead,
  SlotShade,
  PAPER_W,
  SLOT_OVERLAP,
  SLOT_SHADE_H,
} from './printer-chassis';

// ── TUNING KNOBS ───────────────────────────────────────────────────────────
/**
 * Feed SPEED, not duration. Tuned so a typical Love Receipt (~800px of paper)
 * lands near the 2.3s target; longer slips take proportionally longer.
 */
export const FEED_PX_PER_SEC = 350;
/** Clamp, so a freak-short or freak-long slip still feels like a print. */
export const MIN_FEED_MS = 1800;
export const MAX_FEED_MS = 4000;

/**
 * ── the ratchet ──
 *
 * How far the platen advances per step, in px of paper. The feed is a steps()
 * staircase rather than a continuous slide, because a dot-matrix printer indexes
 * the paper one line at a time — a smooth glide reads as an animation, a
 * staircase reads as a machine.
 *
 * SIZED TO ONE PRINTED LINE. The receipt's mono body is 12px at lineHeight 1.55,
 * so a text line occupies ~18.6px; 19px makes each visible jump land almost
 * exactly one row of text further out, which is the effect being imitated.
 *
 * The step RATE follows from this and FEED_PX_PER_SEC: 350 / 19 ≈ 18 steps per
 * second. That is the tuning tension worth knowing about — the two knobs are not
 * independent. Coarser steps chug harder but start to read as broken once a jump
 * exceeds a line or so of text (~26px+ looks like dropped frames); finer steps
 * are smoother but below ~12px the staircase stops being legible at all and the
 * feed just looks continuous again. 19px is the largest step that still maps to
 * one line of the actual receipt.
 */
export const FEED_STEP_PX = 19;
/**
 * Clamp on the derived step count. The floor keeps a freak-short slip from
 * ratcheting in a handful of huge lurches; the ceiling keeps a very long one
 * from going effectively smooth.
 */
export const MIN_FEED_STEPS = 14;
export const MAX_FEED_STEPS = 64;

/**
 * Dot-matrix vibration: one ±1px horizontal shudder cycle every this many ms,
 * for the duration of the feed and no longer. Deliberately tiny — at 300px of
 * paper width 1px is a shimmer you feel rather than see, which is the point.
 * The paper is 16px narrower than the slot, so this can never push a paper edge
 * out past the mouth.
 */
export const JITTER_PERIOD_MS = 140;
export const JITTER_PX = 1;

/**
 * Start offset for the sheet.
 *
 * `min()` of two values, and BOTH matter:
 *
 *  • `calc(-1 * var(--lr-travel))` — the server-computed estimate in px. This
 *    is a fixed length baked into the SSR markup, so it cannot change while the
 *    document is still parsing.
 *  • `-101%` — percentage of the sheet's OWN height, as a safety net for a slip
 *    that turns out taller than the estimate. min() picks whichever is further
 *    up, so the paper can never start partly visible below the slot.
 *
 * WHY NOT JUST `-101%`: a percentage resolves against the element's live height,
 * and the browser paints this element long before the receipt's markup has
 * finished parsing. Measured in production at 6x CPU throttle, the sheet grew
 * 336px -> 825px AFTER first paint (DOM node count 29 -> 161, readyState still
 * 'loading'), so the resolved translate lurched -339 -> -411 -> -680 -> -522px.
 * That backwards jump is the feed "hitch": the paper visibly snaps back up into
 * the printer mid-descent. Anchoring to a fixed px length removes it.
 */
export const FEED_FROM = 'min(-101%, calc(-1 * var(--lr-travel, 900px)))';

/**
 * Blank paper above the masthead — the "leader" a real slip has between the
 * mouth and the first printed line. Without it DELULU MART sits jammed against
 * the plastic the moment the feed lands.
 *
 * SIZED SMALL ON PURPOSE. This is an ordinary receipt top margin, not an empty
 * stretch. Measured off the reference by ink pixels: 6px of blank between the
 * slot and the first printed line at a 121px paper width, which scales to ~15px
 * on this sheet's 300px, and the original value of 16 reproduced exactly that.
 * The current 26 still lands ~11px of BARE paper before the masthead (the rest
 * is the strip and the two bands above it), so the reference gap is preserved —
 * see the RAISED note at the bottom of this comment.
 *
 * Note the number you measure depends on what you measure TO. Of LEADER_PX,
 * SLOT_OVERLAP is hidden behind the chassis head, so bare blank paper is
 * LEADER_PX - SLOT_OVERLAP; the masthead's glyph box then starts a few px above
 * its ink because the 26px store name is set at lineHeight 1.02, tighter than
 * the font's natural line box. Slot-edge to first INK is the honest number and
 * the one the reference was measured with.
 *
 * This is the ONLY top margin on the sheet, and it is handed to ReceiptPaper as
 * its `padTop` rather than drawn here. That is load-bearing, not a tidy-up.
 *
 * An earlier revision rendered the leader as its own <div> above <ReceiptPaper>,
 * painted with the same PAPER + GRAIN constants. It matched on colour and grain
 * but NOT on crumple: the creased-paper texture is an `inset: 0` overlay living
 * INSIDE ReceiptPaper's sheet, so it could never reach an element that sat
 * outside it. The result was a smooth white strip between the slot and the
 * masthead while the rest of the receipt was wrinkled — the seam was invisible
 * in colour and glaring in texture.
 *
 * Padding on the sheet's INNER element (the one carrying the paper background)
 * is inside that overlay's box, so the crumple runs edge to edge and the blank
 * leader is wrinkled paper with nothing printed on it. Note this only works on
 * the inner element — padding ReceiptPaper's OUTER box would open a
 * see-through gap instead, because that box is transparent.
 *
 * The leader is part of the sheet either way, so it feeds out with everything
 * else and is counted in the height estimate below (travel and duration stay
 * correct). Retune the gap here and nowhere else.
 *
 * RAISED 16 -> 26 to seat the pink accent strip. At 16 the leader was entirely
 * spoken for: the top 5px hide behind the chassis (SLOT_OVERLAP) and the next
 * 6px sit under the slot's cast shadow (slotShade), which is 11 of the 16 — so a
 * strip anywhere in it was either clipped by the plastic or painted over by the
 * shadow, which is exactly what the first attempt did. 26 leaves the strip a
 * clear band below the shadow and still lands ~11px of blank paper before the
 * masthead, so the top margin continues to read like a receipt rather than a gap.
 *
 * This is SAFE for the height estimate without touching EST_CHROME_PX, because
 * LEADER_PX is its own term in estimatedPaperPx() — the sheet simply gets 10px
 * taller and the travel and duration follow automatically.
 */
export const LEADER_PX = 26;

/**
 * Paper-height estimate, in px. The duration AND the travel distance must both
 * be computable during SSR, so the height is derived from the payload rather
 * than measured from the DOM.
 *
 * RE-MEASURED twice across the Y2K re-skin, and DELIBERATELY UNCHANGED at 605.
 *
 * Three things that looked like they would move it did not, and the reasons are
 * worth writing down because they are what makes the number safe to keep:
 *
 *   1. `filter` — the soft drop-shadow became a hard one. Not a layout property.
 *   2. an `inset` box-shadow — the 36px blur vignette became a 1px inner edge.
 *      An inset shadow paints inside the border box and adds no height.
 *   3. THE MASTHEAD FACE — Archivo Black became Fraunces. This is the one that
 *      should worry you, and it is inert only because <Header> pins the store
 *      name to an explicit `fontSize: 26` and `lineHeight: 1.02`. A line box
 *      declared that way is 26.52px whatever the face is, so the swap cannot
 *      move the sheet. Drop that explicit lineHeight and this stops being true.
 *
 * Every type ramp, rule margin and block padding was otherwise left alone. The
 * printer chassis grew, but it sits OUTSIDE the sheet and is not part of this
 * estimate; so does the pink accent strip, which is absolutely positioned.
 *
 * Measured on the real /g/preview?slug=love-receipt route at a 390px viewport
 * (300px paper), fonts settled. A 5-line receipt now renders 810.875px, which
 * solves to 810.875 - LEADER_PX(26) - 5*36 = 604.875. At the old LEADER_PX of 16
 * the same route measured 800.875px and solved to the same 604.875 — which is
 * the point: the leader is its own term, so growing it moves the sheet without
 * touching this constant. Pre-re-skin the route measured 800.9px. So 605 is
 * re-confirmed twice, not merely retained.
 *
 * If the estimate runs TALL the sheet simply starts further up than it needs to
 * and the feed opens with a beat of empty slot, so re-measure whenever the
 * receipt's chrome changes: load that route, read `.lr-feed`'s height (it is
 * exactly the sheet — every wrapper between it and ReceiptPaper is a bare div,
 * and the feed transform is a translate, which does not change measured height),
 * then solve EST_CHROME_PX = height - LEADER_PX - lines * EST_LINE_PX.
 * LEADER_PX is added on top because the leader is a real part of the travelling
 * sheet.
 */
export const EST_CHROME_PX = 605;
export const EST_LINE_PX = 36;

/** Deterministic paper height for a payload. Identical on server and client. */
export function estimatedPaperPx(payload: ReceiptPayload): number {
  return LEADER_PX + EST_CHROME_PX + payload.lines.length * EST_LINE_PX;
}

/** Tear-off teeth along the bottom edge. */
const TOOTH_W = 15;
const TOOTH_H = 8;

// ── chassis geometry ───────────────────────────────────────────────────────
// The printer's look AND its geometry now live in ./printer-chassis.tsx, so the
// hardware can be restyled without touching the feed mechanics. Only the three
// values this file positions the paper against are imported (PAPER_W,
// SLOT_OVERLAP, SLOT_SHADE_H) — everything else about the chassis is that
// file's business. The invariant paper < slot < printer is documented there.
/**
 * Where the receipt's pink accent strip sits, measured from the sheet's top
 * edge. Clears the chassis overlap AND the slot shadow, which is the whole
 * reason LEADER_PX had to grow — see the note there.
 */
const PAPER_STRIP_TOP = SLOT_OVERLAP + SLOT_SHADE_H; // 11
const PAPER_STRIP_H = 4;

/**
 * The pink. Same gradient the titlebars run (--win-title-start ->
 * --win-title-end), and the same one the printer's accent stripe uses, so the
 * paper's strip and the hardware's strip are literally the same colour ramp.
 */
const PINK_STRIP = `linear-gradient(90deg, var(--win-title-start), var(--win-title-end))`;

/** Slack inside the feed clip so the settled paper's hard shadow isn't sheared. */
const SHADOW_ROOM = 16;
/** Reduced-motion reveal: a still, motionless opacity fade. */
export const GENTLE_FADE_MS = 700;

/** Feed duration for a payload. Pure + deterministic: SSR and client agree. */
export function feedDurationMs(payload: ReceiptPayload): number {
  const estHeight = estimatedPaperPx(payload);
  return Math.min(
    MAX_FEED_MS,
    Math.max(MIN_FEED_MS, Math.round((estHeight / FEED_PX_PER_SEC) * 1000)),
  );
}

/**
 * How many discrete platen steps this payload's feed takes. Pure + deterministic
 * for the same reason the duration is: the value is baked into the SSR markup.
 */
export function feedStepCount(payload: ReceiptPayload): number {
  const steps = Math.round(estimatedPaperPx(payload) / FEED_STEP_PX);
  return Math.min(MAX_FEED_STEPS, Math.max(MIN_FEED_STEPS, steps));
}

export interface PrinterFeedProps {
  payload: ReceiptPayload;
  /** Skip the feed and present the settled receipt. */
  startSettled?: boolean;
  /** Fires once the paper has finished feeding out and come to rest. */
  onSettled?: () => void;
}

export function PrinterFeed({
  payload,
  startSettled = false,
  onSettled,
}: PrinterFeedProps) {
  const feedRef = useRef<HTMLDivElement | null>(null);

  // Deterministic, computed during render — so the server markup already
  // carries the exact timings and distances the client would have chosen, and
  // neither can drift while the document is still parsing.
  const feedMs = feedDurationMs(payload);
  const paperPx = estimatedPaperPx(payload);
  const steps = feedStepCount(payload);
  // The shudder runs for the feed and stops with it — a whole number of cycles,
  // so the last one lands back on centre instead of freezing mid-shake.
  const jitterCycles = Math.max(1, Math.round(feedMs / JITTER_PERIOD_MS));

  // onSettled is called from a duration-keyed effect; keep the latest reference
  // so a re-rendered parent can't leave us calling a stale closure.
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;

  /**
   * Tell the parent the beat is over.
   *
   * The reveal is CSS and started at FIRST PAINT, which on a slow client is
   * well before this effect runs. Scheduling `total` ms from here would push
   * the footer minutes late on a slow phone, so we read the animation's own
   * clock and only wait out whatever is actually left.
   */
  useEffect(() => {
    const fire = () => settledRef.current?.();
    if (startSettled) {
      fire();
      return;
    }

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    // The beat ends when the paper lands. Nothing follows it.
    const total = reduced ? GENTLE_FADE_MS : feedMs;

    const anim = feedRef.current?.getAnimations?.()[0];
    const elapsed = Number(anim?.currentTime ?? 0) || 0;
    const remaining = Math.max(0, total - elapsed);

    const t = window.setTimeout(fire, remaining);
    return () => window.clearTimeout(t);
  }, [feedMs, startSettled]);

  /**
   * Timings ride as custom properties so the <style> text stays byte-identical
   * across every render (another hydration-mismatch trap avoided), while the
   * per-payload duration, travel and step count live in the inline style where
   * they belong. All four are plain values — no JS reads them back.
   */
  const feedStyle: CSSProperties = {
    ['--lr-feed-ms' as string]: `${feedMs}ms`,
    ['--lr-travel' as string]: `${paperPx}px`,
    ['--lr-steps' as string]: String(steps),
  };

  const jitterStyle: CSSProperties = {
    ['--lr-jitter-cycles' as string]: String(jitterCycles),
  };

  /**
   * Reserve the window's box up front. Without this the clip container is
   * whatever the half-parsed receipt happens to measure, so the page below it
   * jumps around while the HTML streams in.
   */
  const windowStyle: CSSProperties = {
    ...styles.paperWindow,
    minHeight: paperPx,
  };

  return (
    <div style={styles.stage}>
      {/* Injected as raw HTML on purpose — see the hydration note in the file
          header. A text child here breaks hydration for the whole gift. */}
      <style dangerouslySetInnerHTML={{ __html: FEED_CSS }} />

      {/* ── lower lip: BEHIND the paper, so the sheet hangs in front of it ── */}
      <PrinterFoot />

      {/* ── chassis head + slot: IN FRONT of the paper ── */}
      <PrinterHead />

      {/* ── the paper window: clips everything above the slot line ── */}
      <div style={windowStyle}>
        {/* The start state and the whole reveal are declared in CSS, so this
            element is already mid-feed in the server HTML's first paint. */}
        <div
          ref={feedRef}
          className={startSettled ? 'lr-feed is-settled' : 'lr-feed'}
          style={feedStyle}
        >
          {/* The shudder is its own element: .lr-feed already owns `transform`
              for the descent, and a transform list replaces rather than merges. */}
          <div
            className={startSettled ? undefined : 'lr-jitter'}
            style={jitterStyle}
          >
            {/* The shadow lives here, not on ReceiptPaper, so it is cast from
                the post-mask alpha — i.e. it follows the torn teeth. */}
            <div style={styles.shadow}>
              <div style={styles.torn}>
                {/* The receipt's pink accent: a thin printed strip across the
                    sheet's top edge, in the same titlebar gradient as the
                    printer's brand strip. ABSOLUTE on purpose — it must add no
                    height, or it would silently invalidate EST_CHROME_PX. It
                    rides in the blank leader, so it covers no ink, and because
                    the masthead is the LAST thing out of the slot this strip
                    lands right under the mouth as the feed finishes. */}
                <div aria-hidden style={styles.paperStrip} />
                <ReceiptPaper
                  payload={payload}
                  // The blank leader under the slot IS this padding — inside the
                  // sheet, so the crumple texture covers it. See LEADER_PX.
                  padTop={LEADER_PX}
                  style={{ width: '100%', filter: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── the mouth's shadow, cast DOWN onto the emerging paper ── */}
      <SlotShade />
    </div>
  );
}

/** The whole beat, declared once. */
const FEED_CSS = `
/* ── the feed ───────────────────────────────────────────────────────────────
   The paper physically DESCENDS out of the slot, travelling exactly its own
   length (--lr-travel, computed server-side) so the rate is a constant px/sec,
   in --lr-steps discrete increments so it ratchets like a platen instead of
   gliding.

   Start state is the DECLARED state, so the server HTML paints the paper
   already retracted inside the printer. A "both" fill-mode pins the end state,
   so the receipt is readable afterwards even if JS never runs.

   LONGHANDS, NOT THE SHORTHAND — an unparseable steps(var(...)) must not be
   able to take animation-name down with it. See the file header. */
@keyframes lr-feed-out {
  from { transform: translate3d(0, ${FEED_FROM}, 0); }
  to   { transform: translate3d(0, 0, 0); }
}
.lr-feed {
  transform: translate3d(0, ${FEED_FROM}, 0);
  animation-name: lr-feed-out;
  animation-duration: var(--lr-feed-ms, 2400ms);
  animation-timing-function: steps(var(--lr-steps, 42), end);
  animation-fill-mode: both;
  /* The sheet is the only thing moving; keep it on its own compositor layer so
     a long slip does not repaint the receipt every frame on a phone. */
  will-change: transform;
}
/* startSettled — present the receipt with no reveal whatsoever. */
.lr-feed.is-settled {
  animation-name: none;
  transform: none;
  will-change: auto;
}

/* ── dot-matrix shudder ─────────────────────────────────────────────────────
   A ±1px horizontal twitch, stepped so it snaps between positions rather than
   sliding. Runs for a whole number of cycles over the feed and ends on centre.
   Sub-pixel amplitudes were tried first and are invisible once the compositor
   snaps the layer; 1px is the smallest honest value. */
@keyframes lr-feed-jitter {
  0%   { transform: translate3d(0, 0, 0); }
  25%  { transform: translate3d(-${JITTER_PX}px, 0, 0); }
  50%  { transform: translate3d(0, 0, 0); }
  75%  { transform: translate3d(${JITTER_PX}px, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
.lr-jitter {
  animation-name: lr-feed-jitter;
  animation-duration: ${JITTER_PERIOD_MS}ms;
  animation-timing-function: steps(4, end);
  animation-iteration-count: var(--lr-jitter-cycles, 16);
  animation-fill-mode: both;
}

/* ── reduced-motion reveal ──────────────────────────────────────────────────
   A pure opacity fade: nothing travels, so it carries none of the vestibular
   risk a sheet ratcheting down the screen does. Reduce Motion is common on
   phones (Android battery saver forces it on), so these recipients still get a
   moment of arrival rather than a receipt that was simply always there. The
   shudder is motion by definition and is switched off outright.

   Handling this in CSS rather than matchMedia is deliberate: a JS read returns
   false during SSR and possibly true on the client's first render, which is a
   hydration mismatch on exactly the users least able to tolerate a re-render. */
@keyframes lr-gentle-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .lr-feed {
    /* The finished receipt, sitting where it lands. Nothing travels. */
    transform: none;
    will-change: auto;
    animation-name: lr-gentle-in;
    animation-duration: ${GENTLE_FADE_MS}ms;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }
  .lr-jitter {
    animation-name: none;
  }
}
`;

/**
 * Torn bottom edge. Two mask layers unioned:
 *   1. a solid rectangle covering everything except the last TOOTH_H px
 *   2. a repeating downward triangle tile along the bottom
 * The tile is TOOTH_W × TOOTH_H, and a 90° conic wedge starting at 135°
 * (down-right) reaches exactly the tile's bottom corners, so the teeth are
 * clean regardless of paper width.
 */
const TORN_MASK = `linear-gradient(#000, #000), conic-gradient(from 135deg at 50% 0, #000 0 90deg, rgba(0,0,0,0) 90deg)`;
const TORN_MASK_SIZE = `100% calc(100% - ${TOOTH_H}px), ${TOOTH_W}px ${TOOTH_H}px`;
const TORN_MASK_POS = `top left, bottom left`;
const TORN_MASK_REPEAT = `no-repeat, repeat-x`;

const styles: Record<string, CSSProperties> = {
  // Positioned, because the foot and the slot shade are placed against it.
  stage: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },

  // ── paper window ──
  // The mouth of the printer. A transform does not affect layout, so the window
  // is already full paper height on the first frame even though the paper is
  // retracted out of sight — no reflow, no scroll jump when the sheet descends.
  // `minHeight` is applied at render (see windowStyle) from the same
  // server-side estimate that drives the travel and the duration, so the box is
  // reserved before the receipt's markup has even finished parsing.
  paperWindow: {
    position: 'relative',
    zIndex: 2,
    width: PAPER_W,
    // Pull the window's top edge UP into the slot. The head (zIndex 3) paints
    // over the overlap, so the paper vanishes into the dark mouth and emerges
    // at the slot's bottom edge — NOT at the bottom of the chassis.
    marginTop: -SLOT_OVERLAP,
    overflow: 'hidden',
    // Slack below the paper so the settled sheet's hard shadow isn't sheared
    // off at the window edge. Lives here, not on the sheet, so translateY(-101%)
    // stays exactly the paper's own length.
    paddingBottom: SHADOW_ROOM,
  },

  // The receipt's own pink accent strip. Absolute, so it contributes NO height
  // to the sheet — see the note at its call site. zIndex 2 clears ReceiptPaper's
  // crumple overlay (which is inset:0 inside the sheet) so the pink is not
  // multiplied down to mud.
  paperStrip: {
    position: 'absolute',
    top: PAPER_STRIP_TOP,
    left: 0,
    right: 0,
    height: PAPER_STRIP_H,
    zIndex: 2,
    backgroundImage: PINK_STRIP,
    pointerEvents: 'none',
  },

  // ── hard pixel shadow, cast from the torn (post-mask) silhouette ──
  // drop-shadow with a ZERO blur radius is the filter equivalent of the
  // Npx Npx 0 0 box-shadow the rest of Language A uses, and unlike box-shadow it
  // follows the tear-off teeth instead of the element's rectangle.
  shadow: {
    filter: 'drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.3))',
  },

  // ── torn bottom edge ──
  torn: {
    position: 'relative',
    maskImage: TORN_MASK,
    maskSize: TORN_MASK_SIZE,
    maskPosition: TORN_MASK_POS,
    maskRepeat: TORN_MASK_REPEAT,
    WebkitMaskImage: TORN_MASK,
    WebkitMaskSize: TORN_MASK_SIZE,
    WebkitMaskPosition: TORN_MASK_POS,
    WebkitMaskRepeat: TORN_MASK_REPEAT,
  },
};
