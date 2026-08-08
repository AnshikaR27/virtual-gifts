'use client';

import { useCallback, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { playClick } from '@/components/retro-sounds';
import { buildFrame, formatReceiptDate, type ReceiptPayload } from './lines';
import { DreamyBackdrop } from './reveal/dreamy-backdrop';
import { PrinterFeed } from './reveal/printer-feed';

/**
 * The recipient's Love Receipt.
 *
 * The reveal is a printer beat: a soft pastel field, a small CSS thermal
 * printer at the top, and the receipt feeding out of its slot and coming to
 * rest. That is the whole beat — nothing follows the landing. See
 * ./reveal/printer-feed.tsx for the mechanics and
 * ./reveal/dreamy-backdrop.tsx for the field (and its editable PALETTE).
 *
 * The receipt itself — <ReceiptPaper>, its payload, and every line on it — is
 * untouched by any of this; the reveal only wraps and reveals it.
 */

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

  const [done, setDone] = useState(false);
  const [replayNonce, setReplayNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const climaxFired = useRef(false);

  // Fired by <PrinterFeed> once the paper has finished feeding out and landed.
  const handleSettled = useCallback(() => {
    setDone(true);
    if (!climaxFired.current) {
      climaxFired.current = true;
      onClimax();
      trackInteraction('receipt_printed');
    }
  }, [onClimax, trackInteraction]);

  const replay = useCallback(() => {
    playClick();
    setDone(false);
    // Bumping the nonce remounts <PrinterFeed>, which restarts its mount-only
    // feed sequence from the top.
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
    <div style={styles.root}>
      <DreamyBackdrop />

      {/* Everything above the backdrop layer. */}
      <div style={styles.scene}>
        <PrinterFeed
          key={replayNonce}
          payload={payload}
          onSettled={handleSettled}
        />

        {/* post-reveal footer: screenshot hint + actions */}
        <motion.div
          initial={false}
          animate={{ opacity: done ? 1 : 0, y: done ? 0 : 10 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          style={{
            ...styles.footer,
            pointerEvents: done ? 'auto' : 'none',
          }}
        >
          <p className="font-body" style={styles.hint}>
            screenshot me 💕
          </p>

          <div style={styles.actionRow}>
            <button
              type="button"
              onClick={share}
              className="lr-action font-body"
              style={styles.sharePill}
            >
              {copied ? 'link copied ✓' : 'share 💌'}
            </button>
            <Link
              href="/create/love-receipt"
              onClick={() => playClick()}
              className="lr-action font-body"
              style={styles.makePill}
            >
              make your own
            </Link>
          </div>

          <button
            type="button"
            onClick={replay}
            className="lr-action font-body"
            style={styles.replayBtn}
          >
            ↻ print again
          </button>
        </motion.div>
      </div>

      {/* Raw-HTML injection, not a text child: React's server renderer escapes
          quotes and angle brackets inside a <style> text child while the client
          does not, which is a hydration mismatch. See reveal/printer-feed.tsx. */}
      <style dangerouslySetInnerHTML={{ __html: RECEIVER_CSS }} />
    </div>
  );
}

const RECEIVER_CSS = `
.lr-action {
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}
.lr-action:active { transform: translateY(1px) scale(0.99); }
.lr-action:focus-visible {
  outline: 2px solid rgba(168, 158, 255, 0.9);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .lr-action { transition: none; }
  .lr-action:active { transform: none; }
}
`;

const styles: Record<string, CSSProperties> = {
  root: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  scene: {
    // Above <DreamyBackdrop> (which sits at z-index 0).
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '26px 0 40px',
  },
  footer: {
    width: 'min(300px, 86vw)',
    marginTop: 18,
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
    letterSpacing: '0.01em',
    color: 'rgba(120, 92, 150, 0.78)',
    marginBottom: 14,
  },
  actionRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 10,
  },
  sharePill: {
    flex: 1,
    minHeight: 46,
    padding: '13px 16px',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.01em',
    color: '#fff',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.6)',
    borderRadius: 999,
    background: `linear-gradient(180deg, #ffa8cd 0%, #f47bb0 100%)`,
    boxShadow: '0 8px 18px rgba(230, 120, 170, 0.32)',
  },
  makePill: {
    flex: 1,
    minHeight: 46,
    padding: '13px 16px',
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: '0.01em',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'rgba(96, 72, 130, 0.95)',
    cursor: 'pointer',
    border: '1px solid rgba(168, 158, 255, 0.45)',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.72)',
    boxShadow: '0 8px 18px rgba(120, 92, 150, 0.14)',
    // Match the flex button's optical baseline.
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayBtn: {
    width: '100%',
    minHeight: 40,
    padding: '10px 16px',
    fontSize: 14,
    letterSpacing: '0.01em',
    color: 'rgba(120, 92, 150, 0.72)',
    cursor: 'pointer',
    border: '1px solid transparent',
    borderRadius: 999,
    background: 'transparent',
  },
};
