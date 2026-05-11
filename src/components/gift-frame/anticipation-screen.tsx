'use client';

import { motion } from 'framer-motion';

interface AnticipationScreenProps {
  recipientName: string;
  visible: boolean;
}

export function AnticipationScreen({
  recipientName,
  visible,
}: AnticipationScreenProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="anticipation-glow absolute h-64 w-64 rounded-full" />

      <motion.h1
        className="relative z-10 font-display text-[28px] font-bold leading-9 text-on-surface sm:text-4xl sm:leading-[44px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {recipientName}
      </motion.h1>

      <motion.p
        className="relative z-10 mt-4 font-handwritten text-xl text-on-surface-variant"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        Someone made something special for you...
      </motion.p>
    </motion.div>
  );
}
