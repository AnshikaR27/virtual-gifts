'use client';

import { motion } from 'framer-motion';
import { playClick } from '@/components/retro-sounds';

/**
 * ArrivalPopup — the single soft opening beat (Path D #1, composition §E).
 *
 * Replaces BOTH the old Win98 loading bar and the system dialog. It's a note
 * resting on the craft table, not a modal: the scene shows through a faint dim
 * (no blur), the card sits off-centre and tilted, with asymmetric washi tape
 * and a hand-stamped "open it ♡" button. Tapping it lifts the dim and hands
 * over to the live scene.
 */

interface ArrivalPopupProps {
  recipientName: string;
  senderName?: string;
  onOpen: () => void;
}

export function ArrivalPopup({
  recipientName,
  senderName,
  onOpen,
}: ArrivalPopupProps) {
  const from = senderName?.trim() || 'someone who loves you';

  const handleOpen = () => {
    playClick();
    onOpen();
  };

  return (
    <div className="absolute inset-0 z-50">
      {/* faint dim so the craft table stays visible behind the note */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(245, 240, 235, 0.4)' }}
      />

      {/* off-centre, tilted note */}
      <motion.div
        className="absolute"
        style={{ left: '50%', top: '42%', width: 'min(82vw, 320px)' }}
        initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%', rotate: -3 }}
        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', rotate: -3 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
      >
        <div
          className="love-jar-note-paper relative rounded-md px-6 py-7"
          style={{
            background: '#FFFCF6',
            boxShadow: '0 14px 32px rgba(120,0,55,0.22)',
          }}
        >
          <div className="love-jar-torn-edge-top" />

          {/* washi tape — top-left (blush) + bottom-right (lavender), NOT mirrored */}
          <div
            className="absolute"
            style={{
              left: -10,
              top: 12,
              width: 56,
              height: 18,
              background: 'rgba(255,182,193,0.7)',
              transform: 'rotate(-20deg)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
            aria-hidden
          />
          <div
            className="absolute"
            style={{
              right: -10,
              bottom: 16,
              width: 56,
              height: 18,
              background: 'rgba(214,187,228,0.7)',
              transform: 'rotate(12deg)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
            aria-hidden
          />

          {/* greeting */}
          <p
            className="text-center font-handwritten text-[17px] lowercase leading-snug"
            style={{ color: 'rgba(120,90,55,0.85)' }}
          >
            psst…
          </p>
          <p
            className="mt-1 flex items-center justify-center gap-1 text-center font-handwritten text-[24px] leading-tight"
            style={{ color: '#3D2817' }}
          >
            <span>for {recipientName}</span>
            {/* tiny hand-drawn heart doodle next to the name */}
            <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden>
              <path
                d="M8,5 C8,1.5 3,1.5 3,5 C3,8 8,12 8,12 C8,12 13,8 13,5 C13,1.5 8,1.5 8,5 Z"
                fill="none"
                stroke="#E8609A"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </p>
          <p
            className="mt-3 text-center font-handwritten text-[18px] lowercase leading-snug"
            style={{ color: 'rgba(61,40,23,0.85)' }}
          >
            {from} left you a little jar of love.
            <br />
            take your time with it ♡
          </p>

          {/* hand-stamped "open it" button (wobble outline, not a clean pill) */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleOpen}
              className="relative inline-block"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label="open the jar"
            >
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 200 60"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  d="M 10,30 Q 20,5 100,8 T 190,30 Q 180,55 100,52 T 10,30 Z"
                  fill="#E8A5A0"
                  stroke="#C97F7A"
                  strokeWidth="1.5"
                  style={{
                    filter: 'drop-shadow(0 4px 8px rgba(120,0,55,0.2))',
                  }}
                />
                <path
                  d="M 16,30 Q 26,12 100,14 T 184,30 Q 174,48 100,46 T 16,30 Z"
                  fill="rgba(120,0,55,0.05)"
                />
              </svg>
              <span className="relative inline-block px-8 py-3 font-handwritten text-[22px] lowercase text-white">
                open it ♡
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
