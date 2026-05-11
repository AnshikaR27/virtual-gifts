'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';

function RevealLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="gift-pulse h-16 w-16 rounded-full bg-primary-fixed" />
    </div>
  );
}

interface GiftRevealProps {
  visible: boolean;
  onAnimationComplete: () => void;
  children: React.ReactNode;
}

export function GiftReveal({
  visible,
  onAnimationComplete,
  children,
}: GiftRevealProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="flex h-full w-full items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onAnimationComplete={onAnimationComplete}
    >
      <Suspense fallback={<RevealLoader />}>{children}</Suspense>
    </motion.div>
  );
}
