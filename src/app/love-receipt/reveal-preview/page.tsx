'use client';

/**
 * ISOLATED PREVIEW — the viewer-landing tear scene.
 *
 * Not wired into the live receiver: this route builds its own FROZEN payload and
 * hands it to <RevealScene>, which renders the real <ReceiptPaper> inside. The
 * live flow (receiver.tsx, the gift schema, the DB) is untouched.
 *
 *   http://localhost:3000/love-receipt/reveal-preview
 *
 * The sender-name placement switch is a dev control so both options can be felt
 * back to back; the shipped default lives in SENDER_NAME_PLACEMENT.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  RevealScene,
  SENDER_NAME_PLACEMENT,
  TEAR_COMMIT,
  TEAR_SNAP_BACK,
  type SenderNamePlacement,
} from '@/gifts/love-receipt/reveal-scene';
import { OrderReveal, type Beat } from '@/gifts/love-receipt/order-reveal';
import {
  buildFrame,
  formatReceiptDate,
  getStartingLines,
  getDefaultTotal,
  type ReceiptPayload,
} from '@/gifts/love-receipt/lines';

const RECIPIENT = 'Anshika';
const SENDER = 'Bhumin';

/** A frozen payload — same shape the sender saves and the receiver reads back. */
function useMockPayload(): ReceiptPayload {
  return useMemo(() => {
    const frame = buildFrame({
      recipientName: RECIPIENT,
      senderName: SENDER,
    });
    return {
      version: 1,
      language: 'en',
      recipientName: RECIPIENT,
      senderName: SENDER,
      relationship: '',
      storeName: frame.storeName,
      subtitle: frame.subtitle,
      receiptLabel: frame.receiptLabel,
      dateLabel: formatReceiptDate(),
      cashier: frame.cashier,
      billedTo: frame.billedTo,
      billNumber: frame.billNumber,
      gstin: frame.gstin,
      lines: getStartingLines().map((l, i) => ({
        id: `mock-${i}`,
        poolId: l.poolId,
        text: l.text,
        price: l.price,
      })),
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
  }, []);
}

/** Which landing framing is on screen. Both are prototypes; compare and pick. */
type Framing = 'order' | 'tear';

export default function RevealPreviewPage() {
  const payload = useMockPayload();
  const [placement, setPlacement] = useState<SenderNamePlacement>(
    SENDER_NAME_PLACEMENT,
  );
  const [runId, setRunId] = useState(0);
  const [framing, setFraming] = useState<Framing>('order');
  const [startBeat, setStartBeat] = useState<Beat>(1);

  // Read ?framing=tear|order and ?beat=2 on mount. Done from window rather than
  // useSearchParams so the route needs no Suspense boundary.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const f = q.get('framing');
    if (f === 'tear' || f === 'order') setFraming(f);
    if (q.get('beat') === '2') setStartBeat(2);
  }, []);

  return (
    <>
      {framing === 'order' ? (
        <OrderReveal
          key={`order-${startBeat}-${runId}`}
          payload={payload}
          senderName={SENDER}
          startBeat={startBeat}
          onReplyClick={() => {
            // Stub — the reply loop is not built yet.
            window.alert('stub: this will open the reply builder');
          }}
        />
      ) : (
        <RevealScene
          key={`${placement}-${runId}`}
          payload={payload}
          senderName={SENDER}
          senderNamePlacement={placement}
          onTearOneBack={() => {
            // Stub — the reply loop is not built yet.
            window.alert('stub: this will open the reply builder');
          }}
        />
      )}

      {/* dev bar — preview only, never part of the scene */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 10px',
          background: 'rgba(26,10,46,.9)',
          color: '#fff',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 11,
        }}
      >
        <span style={{ opacity: 0.65 }}>framing:</span>
        {(['order', 'tear'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              setFraming(opt);
              setRunId((n) => n + 1);
            }}
            style={{
              font: 'inherit',
              padding: '4px 9px',
              borderRadius: 4,
              cursor: 'pointer',
              border: '1px solid #57e08a',
              background: framing === opt ? '#2aa862' : 'transparent',
              color: '#fff',
            }}
          >
            {opt}
          </button>
        ))}
        <span style={{ opacity: 0.4 }}>|</span>

        {framing === 'order' ? (
          <>
            <span style={{ opacity: 0.65 }}>start&nbsp;beat:</span>
            {([1, 2] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setStartBeat(b);
                  setRunId((n) => n + 1);
                }}
                style={{
                  font: 'inherit',
                  padding: '4px 9px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: '1px solid #ff69b4',
                  background: startBeat === b ? '#ff69b4' : 'transparent',
                  color: '#fff',
                }}
              >
                {b === 1 ? '1 · order' : '2 · receipt'}
              </button>
            ))}
          </>
        ) : (
          <>
            <span style={{ opacity: 0.65 }}>
              snap&nbsp;back&nbsp;{TEAR_SNAP_BACK} · tear&nbsp;{TEAR_COMMIT}
            </span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ opacity: 0.65 }}>from&nbsp;name:</span>
            {(['above-printer', 'on-receipt'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setPlacement(opt)}
                style={{
                  font: 'inherit',
                  padding: '4px 9px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: '1px solid #ff69b4',
                  background: placement === opt ? '#ff69b4' : 'transparent',
                  color: '#fff',
                }}
              >
                {opt}
              </button>
            ))}
          </>
        )}
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          style={{
            font: 'inherit',
            padding: '4px 9px',
            borderRadius: 4,
            cursor: 'pointer',
            border: '1px solid #9b8ab5',
            background: 'transparent',
            color: '#fff',
          }}
        >
          replay
        </button>
      </div>
    </>
  );
}
