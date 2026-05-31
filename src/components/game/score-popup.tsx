'use client';

import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

/**
 * <ScorePopup> — a float-up "+100 ♥" that rises and fades. Position it with
 * `style` (top/left/right). Pair with a React key so each award re-animates.
 */

interface ScorePopupProps {
  children: ReactNode;
  style?: CSSProperties;
  onComplete?: () => void;
}

export function ScorePopup({ children, style, onComplete }: ScorePopupProps) {
  return (
    <motion.span
      className="pointer-events-none absolute font-pixel"
      style={{
        fontSize: 17,
        color: '#ffe66d',
        textShadow: '2px 2px 0 #2a0a4a',
        letterSpacing: '1px',
        zIndex: 5,
        ...style,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0, 1, 1, 0], y: -34 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.span>
  );
}
