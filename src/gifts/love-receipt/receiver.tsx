'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Window } from '@/components/ui/window';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { playClick } from '@/components/retro-sounds';
import { ReceiptPaper, getSequenceMeta } from './receipt-paper';
import { formatReceiptDate, type ReceiptPayload } from './lines';

// Pacing for the paper feeding out (ms).
const FIRST_DELAY = 350;
const ROW_DELAY = 300;
const PRE_TOTAL_DELAY = 1150; // comic slow-down right before the TOTAL
const STAMP_DELAY = 480;

/** Coerce stored JSON into a renderable payload, healing older/partial rows. */
function normalize(
  raw: Record<string, unknown>,
  gift: GiftData,
): ReceiptPayload {
  const p = raw as Partial<ReceiptPayload>;
  return {
    version: 1,
    language: p.language === 'hinglish' ? 'hinglish' : 'en',
    recipientName: p.recipientName || gift.recipientName || 'you',
    senderName: p.senderName || gift.senderName || '',
    relationship: p.relationship || '',
    storeName: p.storeName || `${gift.recipientName || 'Your'}'s Heart Mart`,
    subtitle: p.subtitle || '',
    receiptLabel: p.receiptLabel || 'Receipt',
    dateLabel: p.dateLabel || formatReceiptDate(),
    lines: Array.isArray(p.lines) ? p.lines : [],
    subtotal: p.subtotal || { label: 'Subtotal', price: 'my entire heart' },
    discount: p.discount || { label: 'Loyalty Discount', price: '−100%' },
    tax: p.tax || { label: 'Emotional Damage Tax', price: '₹0' },
    total: p.total || 'priceless',
    footer: p.footer || '',
    memeStamp: p.memeStamp ?? null,
  };
}

export function LoveReceiptReceiver({ gift }: { gift: GiftData }) {
  const { onClimax, trackInteraction } = useGiftContext();
  const payloadRef = useRef<ReceiptPayload>(normalize(gift.contentJsonb, gift));
  const payload = payloadRef.current;
  const { count, totalIndex } = getSequenceMeta(payload);

  const [printedCount, setPrintedCount] = useState(0);
  const [showStamp, setShowStamp] = useState(false);
  const [done, setDone] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const climaxFired = useRef(false);

  // ── drive the printing ──
  useEffect(() => {
    let shown = 0;
    let timer: ReturnType<typeof setTimeout>;

    const reveal = () => {
      shown += 1;
      setPrintedCount(shown);
      if (shown >= count) {
        timer = setTimeout(() => {
          if (payload.memeStamp) setShowStamp(true);
          setDone(true);
          if (!climaxFired.current) {
            climaxFired.current = true;
            onClimax();
            trackInteraction('receipt_printed');
          }
        }, STAMP_DELAY);
        return;
      }
      const nextIndex = shown; // 0-based index of the row we'll reveal next
      timer = setTimeout(
        reveal,
        nextIndex === totalIndex ? PRE_TOTAL_DELAY : ROW_DELAY,
      );
    };

    timer = setTimeout(reveal, FIRST_DELAY);
    return () => clearTimeout(timer);
    // replayNonce re-runs the whole print
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, totalIndex, replayNonce]);

  const replay = useCallback(() => {
    playClick();
    setShowStamp(false);
    setDone(false);
    setPrintedCount(0);
    setReplayNonce((n) => n + 1);
  }, []);

  const share = useCallback(async () => {
    playClick();
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/g/${gift.shortId}`
        : '';
    const shareText = `Someone made you a Love Receipt 🧾💕`;
    trackInteraction('receipt_shared');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Love Receipt', text: shareText, url });
        return;
      }
    } catch {
      // user dismissed the share sheet — fall through to copy
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — nothing more we can do silently
    }
  }, [gift.shortId, trackInteraction]);

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <Window title={<span className="font-pixel">🧾 RECEIPT.exe</span>}>
        {/* printing stage */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px 10px',
            background:
              'repeating-linear-gradient(45deg, #b8b0c4, #b8b0c4 10px, #b0a8bd 10px, #b0a8bd 20px)',
            border: '2px solid var(--win-chrome-dark)',
            borderRightColor: 'var(--win-chrome-light)',
            borderBottomColor: 'var(--win-chrome-light)',
            minHeight: 220,
          }}
        >
          <ReceiptPaper
            payload={payload}
            printedCount={printedCount}
            animate
            showStamp={showStamp}
          />
        </div>

        {/* post-print footer: screenshot hint + actions */}
        <motion.div
          initial={false}
          animate={{ opacity: done ? 1 : 0, y: done ? 0 : 8 }}
          transition={{ duration: 0.4 }}
          style={{ pointerEvents: done ? 'auto' : 'none', marginTop: 12 }}
        >
          <p
            className="font-pixel"
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--win-magenta)',
              letterSpacing: '0.5px',
              marginBottom: 10,
            }}
          >
            📸 screenshot me 💕
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={share}
              className="font-pixel"
              style={actionBtn(
                'linear-gradient(180deg,#34e379,var(--whatsapp-green,#25d366))',
                ['#6cf2a4', '#128a44'],
              )}
            >
              {copied ? 'LINK COPIED ✓' : 'SHARE 💌'}
            </button>
            <Link
              href="/create/love-receipt"
              onClick={() => playClick()}
              className="font-pixel"
              style={{
                ...actionBtn(
                  'linear-gradient(180deg,var(--win-hot-pink),var(--win-magenta))',
                  ['#ffb1d6', '#a01060'],
                ),
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
              }}
            >
              MAKE YOUR OWN 🧾
            </Link>
          </div>
          <button
            type="button"
            onClick={replay}
            className="font-pixel"
            style={{
              ...actionBtn('var(--win-chrome)', [
                'var(--win-chrome-light)',
                'var(--win-chrome-dark)',
              ]),
              color: 'var(--ink, #1a0a2e)',
              width: '100%',
            }}
          >
            ↻ PRINT AGAIN
          </button>
        </motion.div>
      </Window>
    </div>
  );
}

function actionBtn(
  background: string,
  [light, dark]: [string, string],
): React.CSSProperties {
  return {
    flex: 1,
    textAlign: 'center',
    padding: 11,
    fontSize: 14,
    letterSpacing: '1px',
    cursor: 'pointer',
    color: '#fff',
    background,
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 0,
    borderTopColor: light,
    borderLeftColor: light,
    borderRightColor: dark,
    borderBottomColor: dark,
    boxShadow: '2px 2px 0 rgba(26,10,46,.5)',
  };
}
