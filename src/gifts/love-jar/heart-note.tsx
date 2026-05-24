'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

const CORNER_DOODLES = ['♡', '💌', '✨', '🤍', '🌸'];

interface HeartNoteProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  noteIndex: number;
}

export function HeartNote({
  message,
  visible,
  onClose,
  noteIndex,
}: HeartNoteProps) {
  const rotation = useMemo(() => -2 + (noteIndex % 5) - 1, [noteIndex]);
  const doodle = useMemo(
    () => CORNER_DOODLES[noteIndex % CORNER_DOODLES.length],
    [noteIndex],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ perspective: '800px' }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(120,0,55,0.15)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Paper unfold container */}
          <motion.div
            className="love-jar-note-unfold relative max-w-[300px] cursor-pointer"
            onClick={onClose}
            initial={{
              scale: 0.25,
              opacity: 0,
              rotateX: -120,
              y: 80,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              rotateX: 0,
              rotate: rotation,
              y: 0,
            }}
            exit={{
              scale: 0.25,
              opacity: 0,
              rotateX: -120,
              y: 80,
            }}
            transition={{
              type: 'spring',
              stiffness: 180,
              damping: 12,
              mass: 0.8,
            }}
            style={{
              willChange: 'transform, opacity',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Note card */}
            <div
              className="love-jar-note-paper relative rounded-md px-6 py-7"
              style={{
                background: '#FFFCF6',
                boxShadow: '0 12px 28px rgba(120,0,55,0.25)',
              }}
            >
              {/* Torn edges via SVG mask */}
              <div className="love-jar-torn-edge-top" />

              {/* Corner doodle */}
              <span
                className="absolute right-3 top-3 opacity-40"
                style={{ fontSize: '16px' }}
              >
                {doodle}
              </span>

              {/* Message */}
              <p className="text-center font-handwritten text-[22px] leading-[1.35] text-[#3D2817]">
                {message}
              </p>

              {/* Close hint */}
              <p
                className="mt-5 text-center text-[10px] lowercase text-[#A08060]/50"
                style={{ fontFamily: 'Tahoma, sans-serif' }}
              >
                tap to put it back ♡
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
