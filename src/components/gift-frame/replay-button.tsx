'use client';

import { motion } from 'framer-motion';
import type { ReplayBehavior } from '@/types';

interface ReplayButtonProps {
  visible: boolean;
  replayBehavior: ReplayBehavior;
  onReplay: () => void;
}

export function ReplayButton({
  visible,
  replayBehavior,
  onReplay,
}: ReplayButtonProps) {
  if (!visible || replayBehavior === 'persistent-state') return null;

  return (
    <motion.button
      onClick={onReplay}
      className="mt-4 rounded-lg border border-outline-variant bg-surface-container-low px-5 py-2.5 font-ui text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {replayBehavior === 'replayable' ? 'Replay ✨' : 'Watch again ✨'}
    </motion.button>
  );
}
