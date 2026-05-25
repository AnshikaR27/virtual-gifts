'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ArrivalPopupProps {
  recipientName: string;
  senderName: string;
  messageCount: number;
  onOpen: () => void;
  visible: boolean;
}

export function ArrivalPopup({
  recipientName,
  senderName,
  messageCount,
  onOpen,
  visible,
}: ArrivalPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.3, ease: 'easeOut' },
          }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: 'rgba(245, 240, 235, 0.7)' }}
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            className="relative mx-6 max-w-sm rounded-md px-7 py-9"
            style={{
              background: '#FFFCF6',
              boxShadow: '0 16px 36px rgba(120, 0, 55, 0.22)',
              transform: 'rotate(-1.5deg)',
            }}
          >
            {/* Washi tape: top-left corner */}
            <div
              className="absolute -left-3 -top-3 h-5 w-16"
              style={{
                background: '#FFD6E5',
                transform: 'rotate(-20deg)',
                opacity: 0.9,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            />

            {/* Washi tape: top-right corner */}
            <div
              className="absolute -right-3 -top-3 h-5 w-16"
              style={{
                background: '#DCC9F0',
                transform: 'rotate(18deg)',
                opacity: 0.9,
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            />

            <p className="text-center font-display text-[14px] uppercase tracking-[0.15em] text-[#A08060]">
              a love jar for
            </p>
            <h1 className="mt-2 text-center font-handwritten text-[36px] leading-tight text-[#3D2817]">
              {recipientName}
            </h1>
            <p className="mt-4 text-center font-handwritten text-[20px] leading-[1.35] text-[#3D2817]">
              from <span className="italic">{senderName}</span>
            </p>

            <p className="mt-6 text-center font-body text-[14px] leading-[1.5] text-[#8B7355]">
              inside this jar are {messageCount} little hearts —
              <br />
              each one is something they wanted you to know.
            </p>

            <button
              onClick={onOpen}
              className="mx-auto mt-7 block rounded-full px-7 py-3 font-handwritten text-[20px] text-white transition-transform hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #E8A5A0, #C97F7A)',
                boxShadow: '0 6px 14px rgba(120, 0, 55, 0.25)',
              }}
            >
              open it ♡
            </button>

            <p
              className="mt-3 hidden text-center text-[10px] lowercase text-[#A08060]/60 md:block"
              style={{ fontFamily: 'Tahoma, sans-serif' }}
            >
              best opened on your phone
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
