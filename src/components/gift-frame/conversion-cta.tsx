'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface ConversionCtaProps {
  visible: boolean;
}

export function ConversionCta({ visible }: ConversionCtaProps) {
  if (!visible) return null;

  return (
    <motion.div
      className="mt-8 flex flex-col items-center gap-4 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="font-display text-xl font-semibold text-on-surface">
        Want to send one back? 💕
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-3 font-ui text-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
      >
        Create your own gift
      </Link>
    </motion.div>
  );
}
