/**
 * PREVIEW-ONLY — every user-visible string in the reveal-framing experiment.
 *
 * One file on purpose: CTA_LABEL belongs to the notif card, REPLY_CTA_LABEL and
 * PURCHASED_BY_LABEL belong to the shared print stage. Splitting them across the
 * variant files would mean hunting in two places to tune one voice.
 *
 * Nothing here is wired to the live receiver, the schema, or the DB.
 */

// ── VARIANT B — the delivery-alert beat ────────────────────────────────────
/** Lead line. NEVER names the sender — that is the receipt's payoff. */
export const NOTIF_LEAD = 'someone bought your heart';
/** Sub line, the small print of a delivery alert. */
export const NOTIF_SUB = 'delivered to you · just now';
/** Status chip. Reads as an order state, not as a feeling. */
export const NOTIF_STATUS = 'DELIVERED';
/** The advance affordance. Shared by BOTH framed variants (notif card and warm
 *  order card) — one label to tune. Split into WARM_CTA_LABEL if they should
 *  ever read differently. */
export const CTA_LABEL = 'view receipt';
/** Merchant name on the alert. Matches the store on the slip that follows. */
export const NOTIF_MERCHANT = 'DELULU MART';
/** Order reference, echoing buildFrame()'s billNumber. */
export const NOTIF_ORDER_REF = '#4EVER-001';

// ── VARIANT C — the warm order-confirmation beat ───────────────────────────
// Same premise and copy as the order-reveal.tsx prototype's beat 1, rendered
// soft instead of Win98. The sender stays hidden here — "someone" — because the
// name is the receipt's payoff (PURCHASED BY, in the payment block).
/** Lead line. Never names the buyer. */
export const ORDER_LEAD = 'someone just bought your heart <3';
export const ORDER_NUMBER = '#4EVER-001';
export const ORDER_ITEM = 'your heart ×1';
export const ORDER_STATUS = 'PAID IN FULL';
export const ORDER_FINE = "all sales final. you're theirs now <3";

// ── SHARED — the print stage, all variants ─────────────────────────────────
/** Printed in the payment block, under PAID VIA. */
export const PURCHASED_BY_LABEL = 'Purchased by';
/** The reply CTA after the print settles. */
export const REPLY_CTA_LABEL = 'buy their heart back';
