import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * <SpeechBubble> — VT323 mascot speech bubble with a sharp border + pointer
 * tail at the bottom-left (drawn as two stacked triangles).
 */

const BORDER = '#2a2540';

interface SpeechBubbleProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SpeechBubble({
  children,
  className,
  style,
}: SpeechBubbleProps) {
  return (
    <div
      className={cn('relative font-pixel', className)}
      style={{
        background: '#fff',
        border: `2px solid ${BORDER}`,
        padding: '5px 9px',
        fontSize: 12,
        color: BORDER,
        maxWidth: 160,
        letterSpacing: '0.5px',
        ...style,
      }}
    >
      {children}
      {/* tail — outer (border) triangle */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -10,
          left: 14,
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: `10px solid ${BORDER}`,
        }}
      />
      {/* tail — inner (white) triangle */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -6,
          left: 16,
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #fff',
        }}
      />
    </div>
  );
}
