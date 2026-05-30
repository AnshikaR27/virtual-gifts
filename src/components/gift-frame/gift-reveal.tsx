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
      // No opacity fade: keeping the window fully opaque means the SSR HTML
      // already paints the full chrome on first frame (the gift uses its own
      // popup reveal), so slow connections never see an empty background.
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onAnimationComplete={onAnimationComplete}
    >
      <Suspense fallback={<RevealLoader />}>{children}</Suspense>
    </motion.div>
  );
}
