'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * HeartNote — an opened folded note (design-system §6.2 recipe).
 *
 * Cream paper, Caveat ink, torn top edge, corner doodle, warm-magenta shadow.
 * Unfolds with the §6.2 spring (rotateX flip) over a dimmed scene — no hard
 * modal backdrop, so the craft table stays visible behind it. The message
 * types on, then a soft "tuck it back ♡" hint appears.
 */

const CORNER_DOODLES = ['♡', '💌', '✨', '🤍', '🌸'];

interface HeartNoteProps {
  message: string;
  visible: boolean;
  noteIndex: number;
  onReturn: () => void;
}

export function HeartNote({
  message,
  visible,
  noteIndex,
  onReturn,
}: HeartNoteProps) {
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const rotation = -2 + (noteIndex % 5) - 1; // -3°..+2°
  const doodle = CORNER_DOODLES[noteIndex % CORNER_DOODLES.length];

  useEffect(() => {
    if (!visible) {
      setTyped('');
      setDone(false);
      return;
    }
    let i = 0;
    setTyped('');
    setDone(false);
    intervalRef.current = setInterval(() => {
      i++;
      setTyped(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(intervalRef.current);
        setDone(true);
      }
    }, 35);
    return () => clearInterval(intervalRef.current);
  }, [visible, message]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 z-40 flex items-center justify-center px-6">
          {/* soft dim — scene stays visible behind (no blur) */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(120, 0, 55, 0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={done ? onReturn : undefined}
          />

          <motion.div
            className="love-jar-note-paper relative w-[80vw] max-w-[360px] rounded-md px-6 py-7"
            style={{
              background: '#FFFCF6',
              boxShadow: '0 12px 28px rgba(120,0,55,0.25)',
              transformPerspective: 900,
            }}
            initial={{ scale: 0.25, opacity: 0, rotateX: -120, y: 80 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotateX: 0,
              rotate: rotation,
              y: 0,
            }}
            exit={{ scale: 0.4, opacity: 0, y: 60 }}
            transition={{
              type: 'spring',
              stiffness: 180,
              damping: 12,
              mass: 0.8,
            }}
          >
            <div className="love-jar-torn-edge-top" />
            <span
              className="absolute right-3 top-3 select-none opacity-40"
              style={{ fontSize: 16 }}
              aria-hidden
            >
              {doodle}
            </span>

            <p className="min-h-[3em] text-center font-handwritten text-[22px] leading-[1.35] text-[#3D2817]">
              {typed}
              {!done && (
                <span
                  className="ml-[1px] inline-block w-[2px] align-middle"
                  style={{
                    height: '1.05em',
                    background: '#3D2817',
                    animation: 'blink-cursor 1s step-end infinite',
                  }}
                />
              )}
            </p>

            {done && (
              <button
                onClick={onReturn}
                className="mt-5 block w-full text-center lowercase"
                style={{
                  fontFamily: 'Tahoma, sans-serif',
                  fontSize: 10,
                  color: 'rgba(160,128,96,0.6)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  animation: 'card-actions-in 300ms ease-out forwards',
                }}
              >
                tap to tuck it back ♡
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
