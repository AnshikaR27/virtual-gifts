'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TitlebarButtons } from '@/components/win98-chrome';
import { Clothespin } from '@/components/ui/clothespin';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { playClick } from '@/components/retro-sounds';
import { ReceiptPaper, getSequenceMeta } from './receipt-paper';
import { buildFrame, formatReceiptDate, type ReceiptPayload } from './lines';

// Pacing for the paper feeding out (ms).
const FIRST_DELAY = 350;
const ROW_DELAY = 300;
const PRE_TOTAL_DELAY = 1150; // comic slow-down right before the TOTAL
// Beat after the last row prints before the receipt counts as done (this used
// to be the stamp slam; the pause still paces the climax, so it stays).
const FINISH_DELAY = 480;

// The window body reads as the same OS as ROMANCE.exe / MEMORIES.exe: a light
// near-white interior with very faint horizontal ruled lines (the HoneyHearts
// lined-paper tone), so the crumpled receipt sits on real paper, not a panel.
const PAPER_STAGE_BG = '#fffdf7';
const PAPER_STAGE_LINES =
  'repeating-linear-gradient(180deg, transparent 0, transparent 27px, rgba(26,10,46,0.05) 27px, rgba(26,10,46,0.05) 28px)';

/** Coerce stored JSON into a renderable payload, healing older/partial rows. */
function normalize(
  raw: Record<string, unknown>,
  gift: GiftData,
): ReceiptPayload {
  const p = raw as Partial<ReceiptPayload>;
  // Defaults come from the single locked frame so old/partial payloads still
  // render the full DELULU MART receipt. Names are threaded from saved metadata
  // (falling back to the gift's recipient/sender) so personalization survives.
  const recipientName = p.recipientName || gift.recipientName || 'you';
  const senderName = p.senderName || gift.senderName || '';
  const frame = buildFrame({ recipientName, senderName });
  return {
    version: 1,
    language: p.language === 'hinglish' ? 'hinglish' : 'en',
    recipientName,
    senderName,
    relationship: p.relationship || '',
    storeName: p.storeName || frame.storeName,
    subtitle: p.subtitle || frame.subtitle,
    receiptLabel: p.receiptLabel || frame.receiptLabel,
    dateLabel: p.dateLabel || formatReceiptDate(),
    cashier: p.cashier || frame.cashier,
    billedTo: p.billedTo || frame.billedTo,
    billNumber: p.billNumber || frame.billNumber,
    gstin: p.gstin || frame.gstin,
    lines: Array.isArray(p.lines) ? p.lines : [],
    subtotal: p.subtotal || { ...frame.subtotal },
    discount: p.discount || { ...frame.discount },
    tax: p.tax || { ...frame.tax },
    total: p.total || frame.total,
    paidVia: p.paidVia || frame.paidVia,
    finePrint: p.finePrint || frame.finePrint,
    returnPolicy: p.returnPolicy || frame.returnPolicy,
    scanLine: p.scanLine || frame.scanLine,
    footer: p.footer || frame.footer,
  };
}

export function LoveReceiptReceiver({ gift }: { gift: GiftData }) {
  const { onClimax, trackInteraction } = useGiftContext();
  const payloadRef = useRef<ReceiptPayload>(normalize(gift.contentJsonb, gift));
  const payload = payloadRef.current;
  const { count, totalIndex } = getSequenceMeta(payload);

  const [printedCount, setPrintedCount] = useState(0);
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
          setDone(true);
          if (!climaxFired.current) {
            climaxFired.current = true;
            onClimax();
            trackInteraction('receipt_printed');
          }
        }, FINISH_DELAY);
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
      {/* Same OS chrome as ROMANCE.exe / MEMORIES.exe: gradient titlebar +
          beveled min/max/close + light lined-paper body. One window only. */}
      <div className="win98-window">
        <div className="win98-titlebar">
          <span>🧾 RECEIPT.exe</span>
          <TitlebarButtons />
        </div>
        <div
          className="win98-body"
          style={{
            background: PAPER_STAGE_BG,
            backgroundImage: PAPER_STAGE_LINES,
            padding: '26px 18px 18px',
          }}
        >
          {/* printing stage — the crumpled receipt sits on the lined paper with
              generous margin, clipped to the top by a wooden clothespin. */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* relative box for the clothespin; line-bound doodles render
                inside <ReceiptPaper> per row (no overlay layer). */}
            <div style={{ position: 'relative', width: 'min(300px, 86vw)' }}>
              {/* clothespin pinching the receipt to the top of the paper —
                  matches the polaroid-wall clothespins. */}
              <Clothespin
                style={{
                  position: 'absolute',
                  top: -20,
                  left: '50%',
                  width: 30,
                  height: 42,
                  marginLeft: -15,
                  zIndex: 6,
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.22))',
                }}
              />
              <ReceiptPaper
                payload={payload}
                printedCount={printedCount}
                animate
                style={{ width: '100%' }}
              />
            </div>
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
        </div>
      </div>
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
