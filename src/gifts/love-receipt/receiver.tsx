'use client';

import { useCallback, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import type { GiftData } from '@/components/gift-frame/gift-frame';
import { playClick } from '@/components/retro-sounds';
import { buildFrame, formatReceiptDate, type ReceiptPayload } from './lines';
import { PrinterFeed } from './reveal/printer-feed';
import { PinkAura } from './reveal/pink-aura';

/**
 * The recipient's Love Receipt.
 *
 * The reveal is a printer beat: a soft pink aura field, the printer at the top,
 * and the receipt ratcheting out of its slot and coming to rest. That is the
 * whole beat — nothing follows the landing. See ./reveal/printer-feed.tsx for
 * the mechanics, ./reveal/printer-chassis.tsx for the hardware, and
 * ./reveal/pink-aura.tsx for the backdrop (its tones, star opacity/density and
 * star sprite are the three tuning blocks up top).
 *
 * VISUAL LANGUAGE: Language A (Y2K / Windows 98) throughout, and deliberately
 * WITHOUT window chrome — no .win98-window, no titlebar, no .exe name. The
 * printer and the paper sit directly on the sky, because the gift is the
 * object, not an application showing you an object. Everything else is Language
 * A: --win-chrome for the hardware, the --win-title-start → --win-title-end
 * titlebar gradient for the pink accents, .win98-btn / .win98-btn-pink for the
 * actions, VT323 for system text, and hard pixel shadows (Npx Npx 0 0) with no
 * blur anywhere.
 *
 * The page-wide .scanline-overlay in app/layout.tsx already lays a CRT grid over
 * this scene. Do not add a second one here.
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
      {/* The field: a soft pink aura with hollow 8-bit stars. GiftFrame's own
          root paints `bg-surface`, so the gift's backdrop has to be laid down
          inside the gift rather than inherited from <body>. Fixed and z-0 —
          exactly the layer every previous backdrop occupied (sky, flat lavender,
          candy swirl), so the scene's z-1 stacking below is unchanged.

          Retune it in ./reveal/pink-aura.tsx — the pink tones, the star opacity
          and density, and the star sprite itself are the three tuning blocks at
          the top of that file. */}
      <PinkAura />

      {/* Everything above the field layer. */}
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
          <p className="font-pixel" style={styles.hint}>
            screenshot me 💕
          </p>

          <div style={styles.actionRow}>
            {/* .win98-btn-pink / .win98-btn carry their own Language A bevels,
                VT323 and :active depress — the only thing added here is the hard
                pixel shadow and the flex sizing. */}
            <button
              type="button"
              onClick={share}
              className="win98-btn-pink lr-action"
              style={styles.sharePill}
            >
              {copied ? 'link copied ✓' : 'share 💌'}
            </button>
            <Link
              href="/create/love-receipt"
              onClick={() => playClick()}
              className="win98-btn lr-action"
              style={styles.makePill}
            >
              make your own
            </Link>
          </div>

          <button
            type="button"
            onClick={replay}
            className="win98-btn lr-action"
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

/**
 * The buttons' bevel + depress come from .win98-btn / .win98-btn-pink. What is
 * added here is the hard pixel shadow (and its removal on :active, so the button
 * reads as being pressed INTO the page) and a square Language A focus ring.
 *
 * There are no transitions: a Win98 control snaps between states, and easing a
 * bevel is the single fastest way to make this stop looking like 1998.
 */
const RECEIVER_CSS = `
.lr-action {
  box-shadow: 3px 3px 0 0 rgba(0, 0, 0, 0.3);
  transition: none;
}
.lr-action:active {
  box-shadow: 1px 1px 0 0 rgba(0, 0, 0, 0.3);
}
.lr-action:focus-visible {
  outline: 2px dotted var(--win-chrome-darkest);
  outline-offset: 2px;
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
    // Above <PinkAura> (which sits at z-index 0).
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
    // VT323 is a pixel face and reads small at body sizes; 20px here matches the
    // optical weight the old 14px body text had.
    fontSize: 20,
    lineHeight: 1.1,
    letterSpacing: '0.04em',
    // Dark ink with a white pixel highlight — the classic Win98 emboss, and the
    // only pairing that survives the WHOLE sky. This flipped twice: white was
    // correct against the old saturated-blue field, but the sky is now pastel
    // and fades to near-white (#edf8ff) at the horizon, where white text on a
    // fixed backdrop washes out entirely as the page scrolls. Dark holds contrast
    // at every stop of the gradient, so it cannot regress if the palette is
    // retuned again. Shadow is offset and zero-blur — still a pixel shadow.
    color: '#1a0a2e',
    textShadow: '1px 1px 0 rgba(255, 255, 255, 0.7)',
    marginBottom: 14,
  },
  actionRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 10,
  },
  // Both pills override .win98-btn's nowrap + horizontal padding so they can
  // share the row evenly at phone width; everything else comes from the class.
  sharePill: {
    flex: 1,
    minHeight: 44,
    padding: '6px 10px',
    fontSize: 19,
    whiteSpace: 'normal',
  },
  makePill: {
    flex: 1,
    minHeight: 44,
    padding: '6px 10px',
    fontSize: 19,
    whiteSpace: 'normal',
    textAlign: 'center',
    textDecoration: 'none',
    color: '#1a0a2e',
    // Match the flex button's optical baseline.
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayBtn: {
    width: '100%',
    minHeight: 38,
    padding: '4px 12px',
    fontSize: 18,
    color: '#1a0a2e',
  },
};
