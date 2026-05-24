'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

const CORNER_DOODLES = [
  // tiny heart outline
  'M8,4 C8,2 6,1 5,2 C4,1 2,2 2,4 C2,6 5,8 5,8 C5,8 8,6 8,4 Z',
  // small star
  'M5,0 L6,3 L9,3 L7,5 L8,8 L5,6 L2,8 L3,5 L1,3 L4,3 Z',
  // flower
  'M5,3 C6,1 8,2 7,4 C9,4 9,6 7,6 C8,8 6,9 5,7 C4,9 2,8 3,6 C1,6 1,4 3,4 C2,2 4,1 5,3 Z',
  // tiny butterfly
  'M5,4 C3,2 1,2 2,4 C1,5 3,6 5,5 M5,4 C7,2 9,2 8,4 C9,5 7,6 5,5 M5,4 L5,7',
  // small leaf
  'M2,8 C2,4 4,1 8,1 C8,5 6,8 2,8 M2,8 C4,6 6,4 8,1',
];

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
  const rotation = useMemo(() => -3 + (noteIndex % 7) - 3, [noteIndex]);
  const doodlePath = useMemo(
    () => CORNER_DOODLES[noteIndex % CORNER_DOODLES.length],
    [noteIndex],
  );
  const doodlePosition = useMemo(
    () => (noteIndex % 2 === 0 ? 'top-right' : 'bottom-left'),
    [noteIndex],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/10"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Note card */}
          <motion.div
            className="love-jar-note relative max-w-[300px] cursor-pointer"
            onClick={onClose}
            initial={{
              scale: 0.3,
              opacity: 0,
              rotateX: 90,
              y: 60,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              rotateX: 0,
              rotate: rotation,
              y: [0, -4, 0],
            }}
            exit={{
              scale: 0.3,
              opacity: 0,
              rotateX: -90,
              y: 60,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              y: { delay: 0.3, duration: 0.4, ease: 'easeOut' },
            }}
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Paper texture layer */}
            <div className="love-jar-note-paper rounded-md px-6 py-7 shadow-xl">
              {/* Torn edge top */}
              <div className="love-jar-torn-edge-top" />

              {/* Corner doodle */}
              <svg
                className={`love-jar-doodle absolute opacity-40 ${
                  doodlePosition === 'top-right'
                    ? 'right-3 top-3'
                    : 'bottom-3 left-3'
                }`}
                width="20"
                height="20"
                viewBox="0 0 10 10"
                fill="none"
                stroke="#D81B60"
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={doodlePath} />
              </svg>

              {/* Message */}
              <p className="text-center font-handwritten text-[26px] leading-relaxed text-[#4A3520]">
                {message}
              </p>

              {/* Close hint */}
              <p className="mt-4 text-center font-handwritten text-sm text-[#A08060]/60">
                tap to put it back ♡
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
