'use client';

/**
 * PREVIEW-ONLY — VARIANT B's single beat: a delivery alert.
 *
 * The receiver arrived cold from a WhatsApp link and has never seen our store
 * UI, so this is deliberately NOT our chrome: no title bar, no window borders,
 * no bevels, no system buttons. It mimics the compact order/delivery status card
 * an Indian shopper already recognises, and nothing more.
 *
 * The buyer is "someone" here. The name is the receipt's payoff, not this card's.
 *
 * The card is 300px — exactly the receipt's width — so the slip prints into the
 * footprint the card vacates.
 *
 * Copy lives in framing-copy.ts. The whole card is ONE tap target.
 */

import type { CSSProperties } from 'react';
import {
  CTA_LABEL,
  NOTIF_LEAD,
  NOTIF_MERCHANT,
  NOTIF_ORDER_REF,
  NOTIF_STATUS,
  NOTIF_SUB,
} from './framing-copy';

const MONO = "var(--font-space-mono), ui-monospace, 'Courier New', monospace";
const UI = 'var(--font-outfit), system-ui, sans-serif';

const PAPER = '#f7f5f1';
const INK = '#171419';
const INK_SOFT = 'rgba(23, 20, 25, 0.56)';
const HAIRLINE = 'rgba(23, 20, 25, 0.12)';
const OK_BG = '#e4f2e9';
const OK_INK = '#1c6f47';

export interface NotifCardProps {
  /** Advance to the print. The only thing this beat does. */
  onAdvance: () => void;
}

export function NotifCard({ onAdvance }: NotifCardProps) {
  return (
    <div style={styles.wrap}>
      <style>{CARD_CSS}</style>
      <button
        type="button"
        className="lr-notif"
        style={styles.card}
        onClick={onAdvance}
      >
        <span style={styles.topRow}>
          <span style={styles.merchant}>{NOTIF_MERCHANT}</span>
          <span style={styles.orderRef}>{NOTIF_ORDER_REF}</span>
        </span>

        <span style={styles.rule} aria-hidden />

        <span style={styles.lead}>{NOTIF_LEAD}</span>
        <span style={styles.sub}>{NOTIF_SUB}</span>

        <span style={styles.footRow}>
          <span style={styles.status}>{NOTIF_STATUS}</span>
          <span style={styles.cta}>
            {CTA_LABEL}
            <span aria-hidden style={styles.arrow}>
              →
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}

const CARD_CSS = `
.lr-notif { transition: transform 140ms ease; }
.lr-notif:active { transform: scale(0.988); }
.lr-notif:focus-visible { outline: 2px solid #f4f1ea; outline-offset: 5px; }
@media (prefers-reduced-motion: reduce) {
  .lr-notif { transition: none; }
  .lr-notif:active { transform: none; }
}
`;

const styles: Record<string, CSSProperties> = {
  wrap: {
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    // same 300px column the receipt occupies
    width: 300,
    maxWidth: '86vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    textAlign: 'left',
    background: PAPER,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 14,
    padding: '14px 16px 15px',
    cursor: 'var(--cursor-hand)',
    // soft shadow, matching the slip's own drop-shadow on this dark field
    boxShadow: '0 14px 30px rgba(0, 0, 0, 0.34)',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  merchant: {
    fontFamily: MONO,
    fontWeight: 700,
    fontSize: 11.5,
    letterSpacing: '0.18em',
    color: INK,
  },
  orderRef: {
    fontFamily: MONO,
    fontSize: 10.5,
    letterSpacing: '0.06em',
    color: INK_SOFT,
  },
  rule: {
    display: 'block',
    height: 1,
    background: HAIRLINE,
    margin: '11px 0 12px',
  },
  lead: {
    fontFamily: UI,
    fontWeight: 600,
    fontSize: 16.5,
    lineHeight: 1.3,
    letterSpacing: '-0.005em',
    color: INK,
  },
  sub: {
    fontFamily: UI,
    fontWeight: 400,
    fontSize: 13,
    lineHeight: 1.45,
    color: INK_SOFT,
    marginTop: 4,
  },
  footRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
  },
  status: {
    fontFamily: MONO,
    fontWeight: 700,
    fontSize: 9.5,
    letterSpacing: '0.14em',
    color: OK_INK,
    background: OK_BG,
    borderRadius: 4,
    padding: '4px 7px',
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: UI,
    fontWeight: 500,
    fontSize: 13.5,
    color: INK,
  },
  arrow: {
    fontFamily: MONO,
    fontSize: 13,
    lineHeight: 1,
  },
};
