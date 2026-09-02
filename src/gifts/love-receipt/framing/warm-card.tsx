'use client';

/**
 * PREVIEW-ONLY — VARIANT C's frame beat: the order confirmation, rendered warm.
 *
 * Same premise and copy as the order-reveal.tsx prototype's beat 1, restyled
 * onto the blush field. Explicitly NOT Win98: no titlebar, no bevels, no window
 * buttons, no dialog. A soft card on a soft field — that restyle IS the change.
 *
 * Warm bookends, cold receipt in the middle. This is a deliberate, isolated
 * inversion of the §5 boundary (Language A wrapped in a Language B frame), and
 * the two never share a surface: everything here is rounded, warm-brown-inked
 * and soft-shadowed, and the receipt arrives untouched — thermal, mono,
 * straight-edged. The mono / Archivo voice stays sealed inside it.
 *
 * The buyer is "someone" here. The name pays off later as PURCHASED BY, in the
 * receipt's payment block.
 *
 * No prompt, no consent gesture, no toggle: one button, one seam out —
 * onAdvance(), the same contract NotifCard uses.
 */

import type { CSSProperties } from 'react';
import { MochiPlaceholder } from './mochi-placeholder';
import {
  CTA_LABEL,
  ORDER_FINE,
  ORDER_ITEM,
  ORDER_LEAD,
  ORDER_NUMBER,
  ORDER_STATUS,
} from './framing-copy';

// §3.2 tokens. Ink is warm brown per §10 — never pure black on paper.
const INK = '#3D2817'; // Warm Brown Ink
const INK_SOFT = '#A08060'; // Muted Brown
const CARD = '#FFFCF6'; // Warm Paper
const DETAIL = '#FFF0F5'; // Lavender Blush
const MINT = '#C9F0DC'; // Sage Mint
const LEAF = '#7DA178'; // Dark Leaf — the paid-in-full green
const HAIRLINE = 'rgba(61, 40, 23, 0.10)';

const HAND = 'var(--font-caveat), cursive';
const UI = 'var(--font-outfit), system-ui, sans-serif';

export interface WarmCardProps {
  /** The seam out of the frame beat. Identical contract to NotifCard. */
  onAdvance: () => void;
}

const META_ROWS: { key: string; value: string; positive?: boolean }[] = [
  { key: 'ORDER', value: ORDER_NUMBER },
  { key: 'ITEM', value: ORDER_ITEM },
  { key: 'STATUS', value: ORDER_STATUS, positive: true },
];

export function WarmCard({ onAdvance }: WarmCardProps) {
  return (
    <div style={styles.wrap}>
      <style>{WARM_CSS}</style>

      {/* Soft adornment only — Mochi is present, not asking anything. Peeks
          over the card's top edge so it reads as a character resting on it
          rather than an avatar slot. */}
      <div style={styles.mochi}>
        <MochiPlaceholder pose="idle" size={120} />
      </div>

      <section style={styles.card} aria-label="Order confirmation">
        <p style={styles.lead}>{ORDER_LEAD}</p>

        <dl style={styles.detail}>
          {META_ROWS.map((row) => (
            <div key={row.key} style={styles.row}>
              <dt style={styles.rowKey}>{row.key}</dt>
              <dd
                style={{
                  ...styles.rowValue,
                  ...(row.positive ? styles.rowValuePositive : null),
                }}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p style={styles.fine}>{ORDER_FINE}</p>

        <button
          type="button"
          className="lr-warm-btn"
          style={styles.pill}
          onClick={onAdvance}
        >
          {CTA_LABEL}
        </button>
      </section>
    </div>
  );
}

const WARM_CSS = `
.lr-warm-btn { transition: transform 140ms ease; }
.lr-warm-btn:active { transform: scale(0.98); }
.lr-warm-btn:focus-visible { outline: 2px solid ${INK}; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .lr-warm-btn { transition: none; }
  .lr-warm-btn:active { transform: none; }
}
`;

const styles: Record<string, CSSProperties> = {
  wrap: {
    // same 300px column the receipt and the notif card occupy
    width: 300,
    maxWidth: '86vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  mochi: {
    // overlaps the card's top padding; card padding-top leaves room for it
    marginBottom: -38,
    zIndex: 1,
  },
  card: {
    width: '100%',
    background: CARD,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 22,
    padding: '52px 20px 22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    // Language B: soft warm shadow (§10), the receipt's own quiet register
    boxShadow: '0 12px 28px rgba(61, 40, 23, 0.14)',
  },
  lead: {
    fontFamily: HAND,
    fontSize: 30,
    lineHeight: 1.22,
    color: INK,
    margin: '0 0 18px',
    maxWidth: '17ch',
  },
  detail: {
    width: '100%',
    background: DETAIL,
    borderRadius: 14,
    padding: '13px 15px',
    margin: '0 0 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
  },
  row: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowKey: {
    fontFamily: UI,
    fontWeight: 600,
    fontSize: 10.5,
    letterSpacing: '0.1em',
    color: INK_SOFT,
  },
  rowValue: {
    fontFamily: UI,
    fontWeight: 500,
    fontSize: 13.5,
    color: INK,
    margin: 0,
    textAlign: 'right',
  },
  rowValuePositive: {
    fontWeight: 600,
    color: LEAF,
  },
  fine: {
    fontFamily: HAND,
    fontSize: 19,
    lineHeight: 1.3,
    color: INK_SOFT,
    margin: '0 0 18px',
    maxWidth: '24ch',
  },
  pill: {
    fontFamily: UI,
    fontWeight: 600,
    fontSize: 15,
    letterSpacing: '0.01em',
    color: INK,
    background: MINT,
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 999,
    padding: '12px 32px',
    minHeight: 44,
    cursor: 'var(--cursor-hand)',
    boxShadow: '0 6px 14px rgba(61, 40, 23, 0.14)',
  },
};
