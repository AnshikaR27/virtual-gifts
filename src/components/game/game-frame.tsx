import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * <GameFrame> — the Win95 mini-game shell every game-style gift plugs into:
 *   HUD (top chrome bar) · stage (middle play area) · controls (bottom bar)
 * with a CRT scanline overlay. Sized like a phone screen. Presentational.
 */

const SCANLINE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  background:
    'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 3px)',
  pointerEvents: 'none',
  zIndex: 100,
  borderRadius: 12,
};

interface GameFrameProps {
  hud?: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  stageClassName?: string;
  stageStyle?: CSSProperties;
}

export function GameFrame({
  hud,
  controls,
  children,
  stageClassName,
  stageStyle,
}: GameFrameProps) {
  return (
    <div
      className="relative flex w-full flex-col overflow-hidden"
      style={{
        maxWidth: 360,
        height: 'min(640px, 86dvh)',
        background: '#1a0a2e',
        borderRadius: 12,
        boxShadow: '0 12px 32px rgba(26, 10, 46, 0.35)',
      }}
    >
      {hud != null ? (
        <div
          className="flex items-center justify-between font-pixel"
          style={{
            background: 'var(--win-chrome)',
            borderBottom: '2px solid var(--win-chrome-dark)',
            padding: '4px 10px',
            fontSize: 13,
            color: 'var(--ink, #1a0a2e)',
            letterSpacing: '1px',
          }}
        >
          {hud}
        </div>
      ) : null}

      <div
        className={cn(
          'relative flex flex-1 flex-col items-center justify-center overflow-hidden',
          stageClassName,
        )}
        style={{
          background:
            'linear-gradient(180deg, #4a3478 0%, #2a1648 70%, #1a0a2e 100%)',
          padding: '18px 14px',
          ...stageStyle,
        }}
      >
        {children}
      </div>

      {controls != null ? (
        <div
          className="font-pixel"
          style={{
            background: 'var(--win-chrome)',
            borderTop: '2px solid var(--win-chrome-light)',
            padding: '6px 10px',
            fontSize: 13,
            color: 'var(--ink, #1a0a2e)',
            textAlign: 'center',
            letterSpacing: '1.5px',
          }}
        >
          {controls}
        </div>
      ) : null}

      <div style={SCANLINE} aria-hidden />
    </div>
  );
}
