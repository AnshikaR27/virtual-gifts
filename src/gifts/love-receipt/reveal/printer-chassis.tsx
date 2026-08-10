/**
 * The Love Receipt printer.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  THIS IS THE ORIGINAL PRINTER, RESTORED VERBATIM FROM COMMIT 51fb03f.     │
 * │  Every value below — geometry, gradient, radii, the specular lip, the LED │
 * │  glow, the slot — is byte-for-byte what that commit rendered. It was       │
 * │  restored on purpose after several redesigns; do not "improve" it without │
 * │  being asked.                                                              │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * The only thing that changed in the restore is WHERE the code lives: at 51fb03f
 * this was inline in reveal/printer-feed.tsx, and it now sits in its own module
 * so the hardware and the feed mechanics can be edited separately. The rendered
 * output is identical.
 *
 * TWO DELIBERATE DEPARTURES FROM THE SURROUNDING Y2K PASS, kept because they are
 * part of the original and reverting them is the whole point of this file:
 *   • `printerFoot` casts a BLURRED shadow (0 12px 24px) rather than a hard
 *     pixel one.
 *   • `led` has a 7px GLOW rather than a flat lamp.
 * Everything else in this gift uses zero-blur shadows. If the Y2K rule is ever
 * applied here, it is a visual change to the restored printer, not a cleanup.
 *
 * STRUCTURE — WHY THE CHASSIS IS TWO PIECES
 * -----------------------------------------
 * <PrinterHead> paints ABOVE the paper and <PrinterFoot> BELOW it, split exactly
 * at the slot line. That is what sells the paper emerging THROUGH the slot: the
 * chassis genuinely covers the sheet above the seam, and the sheet hangs in front
 * of the lower lip below it. Drawn as one element, the paper would appear to come
 * out from underneath the whole printer. The two halves share ONE gradient,
 * offset by HEAD_H on the foot, so the metal is continuous across the split and
 * the seam is invisible.
 *
 * Nothing here animates. The printer is a fixed machine — see the 0px-drift note
 * in reveal/printer-feed.tsx.
 */

import type { CSSProperties } from 'react';

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
export const PAPER_W = 'min(300px, 86vw)';
/** The dark mouth. WIDER than the paper — the sheet must fit through it. */
export const SLOT_W = 'min(316px, 90vw)';
/** Printer body. Wider again, so the chassis frames the slot on both sides. */
export const PRINTER_W = 'min(336px, 94vw)';
/** Full chassis height. The gradient is authored against this. */
const CHASSIS_H = 58;
/** The lower lip: chassis below the slot. Renders BEHIND the paper. */
export const FOOT_H = 9;
/** Chassis at and above the slot. Renders IN FRONT of the paper. */
export const HEAD_H = CHASSIS_H - FOOT_H; // 49
/** The dark mouth, pinned to the head's bottom edge (so it spans 36 -> 49). */
export const SLOT_H = 13;
/**
 * How far the paper window's top edge is pulled UP into the slot.
 *
 * This is what makes the paper disappear INTO the mouth: the window clips the
 * sheet at (HEAD_H - SLOT_OVERLAP), which is inside the dark slot, and the head
 * paints over that overlap. Emergence therefore happens at the slot's bottom
 * edge, not at a bare clip line and not at the bottom of the chassis.
 */
export const SLOT_OVERLAP = 5;
/**
 * Depth of the slot's cast shadow on the emerging paper.
 *
 * At 51fb03f this was the literal `height: 10` on slotShade. It is a named
 * constant now only because reveal/printer-feed.tsx seats the receipt's pink
 * accent strip just below the shadow and needs to read the value. Same number.
 */
export const SLOT_SHADE_H = 10;
/** One gradient for both halves, so the metal is continuous across the split. */
const CHASSIS_GRADIENT =
  'linear-gradient(180deg, #ffffff 0%, #f4f0fb 34%, #e3dcf0 72%, #cfc6e2 100%)';

/**
 * The lower lip. Renders BEHIND the paper (z-index 1).
 *
 * Absolute so it contributes no height: the head + window own the flow, and the
 * lip simply sits in the gap the head leaves. Paper (300px) is narrower than the
 * printer (336px), so this stays visible either side of the sheet.
 */
export function PrinterFoot() {
  return <div aria-hidden style={styles.printerFoot} />;
}

/**
 * Chassis head + slot. Renders IN FRONT of the paper (z-index 3), which is what
 * makes the sheet disappear INTO the slot instead of being clipped at a bare
 * edge.
 */
export function PrinterHead() {
  return (
    <div aria-hidden style={styles.printerHead}>
      <div style={styles.printerLip} />
      <span style={styles.led} />
      <div style={styles.slot}>
        <span style={styles.slotMouth} />
      </div>
    </div>
  );
}

/** The mouth's shadow, cast DOWN onto the emerging paper. */
export function SlotShade() {
  return <div aria-hidden style={styles.slotShade} />;
}

const styles: Record<string, CSSProperties> = {
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
    height: SLOT_SHADE_H,
    background:
      'linear-gradient(180deg, rgba(29,23,41,0.30) 0%, rgba(29,23,41,0.10) 45%, rgba(29,23,41,0) 100%)',
    pointerEvents: 'none',
  },
};
