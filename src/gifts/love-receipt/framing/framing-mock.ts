/**
 * PREVIEW-ONLY — frozen payloads for the reveal-framing experiment.
 *
 * Built the same way the sender builds one: buildFrame() for the locked DELULU
 * MART chrome, real pool lines for the items, getDefaultTotal() for TOTAL.
 *
 * FROZEN means frozen:
 *   • the draw engine (sampleBalanced) is NEVER called — line ids are fixed, so
 *     the known open bug there cannot move under this experiment
 *   • the date stamp is a fixed Date, not `new Date()`, so two runs side by side
 *     are byte-identical
 *   • `long` is `short` plus five appended lines — item count is the ONLY thing
 *     that differs between them, which is the point of the toggle
 */

import {
  buildFrame,
  formatReceiptDate,
  getDefaultTotal,
  getStartingLines,
  type ReceiptLine,
  type ReceiptPayload,
} from '../lines';
import { LOVE_RECEIPT_POOL } from '../love-receipt-pool';

export const RECIPIENT_NAME = 'Anshika';
export const SENDER_NAME = 'Bhumin';

/** Fixed stamp so the payload never drifts between refreshes. */
const FROZEN_DATE = new Date(2026, 6, 26, 21, 14);

export type MockLength = 'short' | 'long';

/**
 * The five lines appended for the `long` payload, on top of the four from
 * getStartingLines(). Picked to stress the print: lr-045 is a very long line
 * (wraps hard), and the set carries a spread of hand bindings so the doodle
 * layer is exercised at length too.
 */
const LONG_EXTRA_IDS = [
  'lr-035', // end-mark · <3
  'lr-018', // underline · teal ("you")
  'lr-039', // circle-word ("win")
  'lr-045', // end-mark · rays — very long, wraps
  'lr-005', // circle-price ("mine")
];

const POOL_BY_ID = new Map(LOVE_RECEIPT_POOL.map((l) => [l.id, l]));

function poolLine(poolId: string, index: number): ReceiptLine | null {
  const src = POOL_BY_ID.get(poolId);
  if (!src) return null;
  return { id: `mock-${index}`, poolId, text: src.text, price: src.price };
}

function mockLines(length: MockLength): ReceiptLine[] {
  const base = getStartingLines().map((l, i) => ({
    id: `mock-${i}`,
    poolId: l.poolId,
    text: l.text,
    price: l.price,
  }));
  if (length === 'short') return base;
  const extra = LONG_EXTRA_IDS.map((id, i) => poolLine(id, base.length + i));
  return [...base, ...extra.filter((l): l is ReceiptLine => l !== null)];
}

/** A frozen payload — same shape the sender saves and the receiver reads back. */
export function buildFramingMock(length: MockLength): ReceiptPayload {
  const frame = buildFrame({
    recipientName: RECIPIENT_NAME,
    senderName: SENDER_NAME,
  });
  return {
    version: 1,
    language: 'en',
    recipientName: RECIPIENT_NAME,
    senderName: SENDER_NAME,
    relationship: '',
    storeName: frame.storeName,
    subtitle: frame.subtitle,
    receiptLabel: frame.receiptLabel,
    dateLabel: formatReceiptDate(FROZEN_DATE),
    cashier: frame.cashier,
    billedTo: frame.billedTo,
    billNumber: frame.billNumber,
    gstin: frame.gstin,
    lines: mockLines(length),
    subtotal: frame.subtotal,
    discount: frame.discount,
    tax: frame.tax,
    total: getDefaultTotal().price,
    paidVia: frame.paidVia,
    finePrint: frame.finePrint,
    returnPolicy: frame.returnPolicy,
    scanLine: frame.scanLine,
    footer: frame.footer,
  };
}
