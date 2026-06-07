'use client';

import type { CSSProperties } from 'react';
import { PixelStar } from './pixel-icons';
import { PixelGameButton } from './pixel-game-button';

/**
 * <LevelCompleteScreen> — victory banner + N stars + a score table + two
 * actions. Reused by every game gift's climax screen.
 */

export interface ScoreRow {
  label: string;
  value: string;
  total?: boolean;
}

interface LevelCompleteScreenProps {
  stars?: number;
  rows: ScoreRow[];
  bannerText?: string;
  /** Primary "send one back" action. */
  sendBackHref?: string;
  sendBackLabel?: string;
  /** Secondary "retry" action. */
  onRetry?: () => void;
  retryLabel?: string;
}

const TABLE: CSSProperties = {
  background: '#1a0a2e',
  border: '2px solid #ff6ec7',
  padding: '10px 12px',
  fontSize: 12,
  color: '#fff',
  width: '90%',
  letterSpacing: '1px',
  marginBottom: 12,
};

export function LevelCompleteScreen({
  stars = 3,
  rows,
  bannerText = '★ LEVEL COMPLETE! ★',
  sendBackHref,
  sendBackLabel = '▶ SEND ONE BACK',
  onRetry,
  retryLabel = 'RETRY LEVEL',
}: LevelCompleteScreenProps) {
  return (
    <div className="relative z-[2] flex w-full flex-col items-center">
      <div
        className="font-pixel"
        style={{
          background: '#ffe66d',
          color: '#2a0a4a',
          fontSize: 20,
          padding: '6px 14px',
          letterSpacing: '2px',
          border: '3px solid #2a0a4a',
          boxShadow: '4px 4px 0 #ff1493',
          textAlign: 'center',
          marginBottom: 14,
        }}
      >
        {bannerText}
      </div>

      <div className="mb-3 flex justify-center gap-1.5">
        {Array.from({ length: stars }).map((_, i) => (
          <PixelStar key={i} size={30} />
        ))}
      </div>

      <div className="font-pixel" style={TABLE}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between"
            style={{
              padding: row.total ? '6px 0 2px' : '2px 0',
              marginTop: row.total ? 4 : undefined,
              borderTop: row.total ? '1px dashed #6e5ba5' : undefined,
              color: row.total ? '#ffe66d' : undefined,
            }}
          >
            <span>{row.label}</span>
            <span
              className="mx-1.5 mb-1 flex-1"
              style={{ borderBottom: '1px dotted #6e5ba5' }}
            />
            <span>{row.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center">
        {sendBackHref ? (
          <PixelGameButton variant="pink" href={sendBackHref}>
            {sendBackLabel}
          </PixelGameButton>
        ) : null}
        {onRetry ? (
          <PixelGameButton variant="grey" onClick={onRetry}>
            {retryLabel}
          </PixelGameButton>
        ) : null}
      </div>
    </div>
  );
}
