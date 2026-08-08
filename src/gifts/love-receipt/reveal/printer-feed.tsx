'use client';

/**
 * <PrinterFeed> — the receiver's reveal beat: the receipt feeds out of the slot
 * of a small thermal printer and comes to rest. That is the whole beat; there is
 * deliberately nothing after it (no sheen, no shimmer, no highlight sweep).
 *
 * How the illusion works (no images, pure CSS):
 *
 *   .printerFoot    the chassis BELOW the slot — the lower lip. z BELOW the
 *                   paper, so the sheet drapes in FRONT of it exactly as it
 *                   does in the reference. Absolutely positioned, so it does
 *                   not participate in flow and cannot push the paper down.
 *   .printerHead    the chassis AT and ABOVE the slot. z ABOVE the paper, so it
 *                   covers everything above the slot line. FIXED — it never
 *                   moves or animates.
 *     .slot         the dark mouth, pinned to the head's BOTTOM edge. Its
 *                   bottom edge IS the line the paper emerges from.
 *   .paperWindow    overflow:hidden. Its top edge is pulled up INTO the slot by
 *                   SLOT_OVERLAP, so the sheet is clipped inside the mouth and
 *                   the head paints over that overlap. z between foot and head.
 *     .lr-feed      transform translateY(-paper height) -> translateY(0). The
 *                   sheet physically DESCENDS out of the slot; it is not
 *                   uncovered in place.
 *       .shadow     drop-shadow, cast from the post-mask alpha
 *         .torn     CSS zigzag mask on the bottom edge (the tear-off)
 *           ReceiptPaper   <- rendered whole and untouched, carrying its own
 *                             LEADER_PX of blank paper above the masthead
 *   .slotShade      a short downward gradient sitting ON the emerging paper at
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
 *     metal genuinely covers the sheet above the slot line — the paper visibly
 *     disappears INTO the mouth rather than being merely clipped there.
 *   • foot (HEAD_H -> CHASSIS_H) paints BELOW the paper, so the sheet emerges
 *     at the slot and hangs in front of the lower lip. The lip still reads as
 *     part of the chassis because the paper (300px) is narrower than the
 *     printer (336px), so the metal shows on both sides — as in the reference.
 * The two halves share ONE background gradient, offset by HEAD_H on the foot,
 * so the metal is continuous across the split and the seam is invisible.
 *
 * WHY TRANSLATE AND NOT A CLIP-PATH WIPE
 * --------------------------------------
 * A clip wipe uncovers the receipt in place: every pixel is already at its
 * final position and the paper never moves, which does not read as printing.
 *
 * An earlier revision of this file argued against translate on the grounds that
 * it "runs backwards" — the tear-off edge clears the slot first and the
 * masthead lands last. That is not a defect, it is what a thermal printer does:
 * the first line printed is the first line out of the mouth, so it ends up
 * FURTHEST from the slot while the most recently printed line sits AT the slot.
 * The reference this scene is built from behaves exactly that way — the barcode
 * and the sign-off emerge first and descend, and the masthead is the last thing
 * to clear the slot.
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
 * the printer on the very first frame the browser paints.
 *
 * The feed DURATION is derived from an ESTIMATED paper height at a fixed
 * px/sec — a thermal head feeds at a constant rate, so a 9-item slip must take
 * longer than a 4-item one. It is estimated from the line count rather than
 * measured from the DOM because the value has to be identical on the server and
 * the client (a measured value could not exist during SSR), and because
 * measuring meant waiting on document.fonts.ready before the reveal could even
 * begin. See EST_CHROME_PX / EST_LINE_PX / LEADER_PX — retune those, not the CSS.
 *
 * ReceiptPaper's own `printedCount` / `animate` props are deliberately unused
 * here — those mount rows one at a time and reflow the paper on every step,
 * which would change the sheet's height mid-travel and break the constant feed
 * rate. The receipt is rendered complete, and `transform` on the sheet is the
 * ONLY animated property in the whole beat — compositor-only, so nothing here
 * triggers layout or paint per frame.
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
 * LINEAR on purpose. A thermal head steps the platen at a fixed rate — it does
 * not ease in or coast to a stop — so any easing here immediately reads as an
 * animation rather than a machine.
 */
export const FEED_EASE = 'linear';
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
 * the metal the moment the feed lands.
 *
 * SIZED SMALL ON PURPOSE. This is an ordinary receipt top margin, not an empty
 * stretch. Measured off the reference by ink pixels: 6px of blank between the
 * slot and the first printed line at a 121px paper width, which scales to ~15px
 * on this sheet's 300px. This value is tuned so the same pixel measurement here
 * reads ~16px, i.e. the reference gap, not a stretch of empty paper.
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
 */
export const LEADER_PX = 16;

/**
 * Paper-height estimate, in px. The duration AND the travel distance must both
 * be computable during SSR, so the height is derived from the payload rather
 * than measured from the DOM.
 *
 * RE-CALIBRATED after the periwinkle header band was removed: the band carried
 * 20px of top and 12px of bottom padding that the plain masthead does not, and
 * the sheet lost ~45px overall. Measured on the real route at 300px paper, a
 * 5-line receipt is 800.9px tall and this estimate returns 801 — inside 0.1%.
 * If the estimate runs TALL the sheet simply starts further up than it needs to
 * and the feed opens with a beat of empty slot, so re-measure whenever the
 * receipt's chrome changes. LEADER_PX is added on top because the leader is a
 * real part of the travelling sheet.
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
// Everything below is measured from the TOP of the chassis. The slot is the
// anchor: the paper window is positioned from it, not from the chassis bottom.
//
// THE THREE WIDTHS MUST STAY IN THIS ORDER: paper < slot < printer.
// The paper has to look like it plausibly fits through the hole it came out of,
// so the slot is wider than the sheet, and the chassis is wider again so metal
// still frames the mouth on both sides. Each is its own min() rather than a
// percentage of the one above it, because a percentage of a min() flips the
// ordering at the viewport where the caps take over: the three caps (300/316/
// 336) order correctly on desktop, and the three vw terms (86/90/94) keep the
// same order on every phone, so the invariant holds at EVERY width.
/** Paper column width — matches ReceiptPaper's own intrinsic width. */
const PAPER_W = 'min(300px, 86vw)';
/** The dark mouth. WIDER than the paper — the sheet must fit through it. */
const SLOT_W = 'min(316px, 90vw)';
/** Printer body. Wider again, so the chassis frames the slot on both sides. */
const PRINTER_W = 'min(336px, 94vw)';
/** Full chassis height. The gradient is authored against this. */
const CHASSIS_H = 58;
/** The lower lip: chassis below the slot. Renders BEHIND the paper. */
const FOOT_H = 9;
/** Chassis at and above the slot. Renders IN FRONT of the paper. */
const HEAD_H = CHASSIS_H - FOOT_H; // 49
/** The dark mouth, pinned to the head's bottom edge (so it spans 36 -> 49). */
const SLOT_H = 13;
/**
 * How far the paper window's top edge is pulled UP into the slot.
 *
 * This is what makes the paper disappear INTO the mouth: the window clips the
 * sheet at (HEAD_H - SLOT_OVERLAP), which is inside the dark slot, and the head
 * paints over that overlap. Emergence therefore happens at the slot's bottom
 * edge, not at a bare clip line and not at the bottom of the chassis.
 */
const SLOT_OVERLAP = 5;
/** One gradient for both halves, so the metal is continuous across the split. */
const CHASSIS_GRADIENT =
  'linear-gradient(180deg, #ffffff 0%, #f4f0fb 34%, #e3dcf0 72%, #cfc6e2 100%)';
/** Slack inside the feed clip so the settled paper's drop-shadow isn't sheared. */
const SHADOW_ROOM = 34;
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
   * per-payload duration lives in the inline style where it belongs.
   */
  const feedStyle: CSSProperties = {
    ['--lr-feed-ms' as string]: `${feedMs}ms`,
    ['--lr-travel' as string]: `${paperPx}px`,
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
      <div aria-hidden style={styles.printerFoot} />

      {/* ── chassis head + slot: IN FRONT of the paper ── */}
      <div aria-hidden style={styles.printerHead}>
        <div style={styles.printerLip} />
        <span style={styles.led} />
        <div style={styles.slot}>
          <span style={styles.slotMouth} />
        </div>
      </div>

      {/* ── the paper window: clips everything above the slot line ── */}
      <div style={windowStyle}>
        {/* The start state and the whole reveal are declared in CSS, so this
            element is already mid-feed in the server HTML's first paint. */}
        <div
          ref={feedRef}
          className={startSettled ? 'lr-feed is-settled' : 'lr-feed'}
          style={feedStyle}
        >
          {/* The shadow lives here, not on ReceiptPaper, so it is cast from
              the post-mask alpha — i.e. it follows the torn teeth. */}
          <div style={styles.shadow}>
            <div style={styles.torn}>
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

      {/* ── the mouth's shadow, cast DOWN onto the emerging paper ── */}
      <div aria-hidden style={styles.slotShade} />
    </div>
  );
}

/** The whole beat, declared once. */
const FEED_CSS = `
/* ── the feed ───────────────────────────────────────────────────────────────
   The paper physically DESCENDS out of the slot, travelling exactly its own
   length (--lr-travel, computed server-side) so the rate is a constant px/sec.

   Start state is the DECLARED state, so the server HTML paints the paper
   already retracted inside the printer. A "both" fill-mode pins the end state,
   so the receipt is readable afterwards even if JS never runs. */
@keyframes lr-feed-out {
  from { transform: translate3d(0, ${FEED_FROM}, 0); }
  to   { transform: translate3d(0, 0, 0); }
}
.lr-feed {
  transform: translate3d(0, ${FEED_FROM}, 0);
  animation: lr-feed-out var(--lr-feed-ms, 2400ms) ${FEED_EASE} both;
  /* The sheet is the only thing moving; keep it on its own compositor layer so
     a long slip does not repaint the receipt every frame on a phone. */
  will-change: transform;
}
/* startSettled — present the receipt with no reveal whatsoever. */
.lr-feed.is-settled {
  animation: none;
  transform: none;
  will-change: auto;
}

/* ── reduced-motion reveal ──────────────────────────────────────────────────
   A pure opacity fade: nothing travels, so it carries none of the vestibular
   risk a sheet sliding down the screen does. Reduce Motion is common on phones
   (Android battery saver forces it on), so these recipients still get a moment
   of arrival rather than a receipt that was simply always there.

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
    animation: lr-gentle-in ${GENTLE_FADE_MS}ms ease-out both;
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

  // ── chassis: lower lip (behind the paper) ──
  // Absolute so it contributes no height: the head + window own the flow, and
  // the lip simply sits in the gap the head leaves. Paper (300px) is narrower
  // than the printer (336px), so this stays visible either side of the sheet.
  printerFoot: {
    position: 'absolute',
    top: HEAD_H,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
    width: PRINTER_W,
    height: FOOT_H,
    boxSizing: 'border-box',
    borderRadius: '0 0 11px 11px',
    // Same gradient as the head, scrolled up by the head's height, so the two
    // halves read as one continuous piece of metal.
    backgroundImage: CHASSIS_GRADIENT,
    backgroundSize: `100% ${CHASSIS_H}px`,
    backgroundPosition: `0 -${HEAD_H}px`,
    backgroundRepeat: 'no-repeat',
    backgroundOrigin: 'border-box',
    borderLeft: '1px solid rgba(255,255,255,0.8)',
    borderRight: '1px solid rgba(255,255,255,0.8)',
    borderBottom: '1px solid rgba(255,255,255,0.8)',
    boxShadow:
      '0 -2px 5px rgba(120,92,150,0.16) inset, 0 12px 24px rgba(120,92,150,0.22)',
    pointerEvents: 'none',
  },

  // ── chassis: head + slot (in front of the paper) ──
  // zIndex 3 puts this above the paper window (2), which is what makes the
  // sheet disappear INTO the slot instead of being clipped at a bare edge.
  printerHead: {
    position: 'relative',
    zIndex: 3,
    width: PRINTER_W,
    height: HEAD_H,
    boxSizing: 'border-box',
    borderRadius: '18px 18px 0 0',
    backgroundImage: CHASSIS_GRADIENT,
    backgroundSize: `100% ${CHASSIS_H}px`,
    backgroundPosition: '0 0',
    backgroundRepeat: 'no-repeat',
    backgroundOrigin: 'border-box',
    borderTop: '1px solid rgba(255,255,255,0.8)',
    borderLeft: '1px solid rgba(255,255,255,0.8)',
    borderRight: '1px solid rgba(255,255,255,0.8)',
    boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset',
    pointerEvents: 'none',
  },
  // Soft specular band across the printer's shoulder — sells the metal.
  printerLip: {
    position: 'absolute',
    top: 6,
    left: '7%',
    right: '7%',
    height: 12,
    borderRadius: 999,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0))',
    pointerEvents: 'none',
  },
  led: {
    position: 'absolute',
    top: 11,
    right: 14,
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'block',
    background: '#ff9ec9',
    boxShadow: '0 0 7px rgba(255,158,201,0.95)',
  },
  // Pinned to the head's BOTTOM edge, so the slot's bottom edge is exactly the
  // line the paper emerges from. Flat-bottomed on purpose: it is an opening in
  // the chassis, and a rounded bottom would read as a floating dark pill.
  slot: {
    position: 'absolute',
    // Centred by explicit width rather than left/right insets, so the slot's
    // width is stated against the same scale as the paper and the ordering
    // paper < slot < printer can be read off the constants directly.
    left: '50%',
    transform: 'translateX(-50%)',
    width: SLOT_W,
    bottom: 0,
    height: SLOT_H,
    borderRadius: '7px 7px 2px 2px',
    background: 'linear-gradient(180deg, #3b3350 0%, #1d1729 100%)',
    boxShadow:
      'inset 0 4px 7px rgba(0,0,0,0.62), 0 -1px 0 rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  slotMouth: {
    width: '92%',
    height: 3,
    borderRadius: 2,
    background: 'rgba(255,255,255,0.14)',
    marginBottom: 2,
    display: 'block',
  },

  // ── the mouth's cast shadow, ON the paper ──
  // Sits at the emergence line and darkens the top of the sheet, so the paper
  // reads as coming out of a dark opening. Above everything (zIndex 4) because
  // it has to fall on the paper, which is itself above the lip.
  slotShade: {
    position: 'absolute',
    top: HEAD_H,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 4,
    width: PAPER_W,
    height: 10,
    background:
      'linear-gradient(180deg, rgba(29,23,41,0.30) 0%, rgba(29,23,41,0.10) 45%, rgba(29,23,41,0) 100%)',
    pointerEvents: 'none',
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
    // Slack below the paper so the settled sheet's drop-shadow isn't sheared
    // off at the window edge. Lives here, not on the sheet, so translateY(-101%)
    // stays exactly the paper's own length.
    paddingBottom: SHADOW_ROOM,
  },

  // ── drop-shadow, cast from the torn (post-mask) silhouette ──
  shadow: {
    filter: 'drop-shadow(0 14px 26px rgba(120, 92, 150, 0.20))',
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
