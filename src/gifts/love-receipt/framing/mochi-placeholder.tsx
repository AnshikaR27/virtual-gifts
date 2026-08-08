/**
 * PREVIEW-ONLY — stand-in for the soft Mochi character.
 *
 * ── ASSET SWAP-IN POINT ────────────────────────────────────────────────────
 * This is scaffolding, not art. When the real two-pose soft-Mochi asset lands
 * it replaces the <svg> below and NOTHING else changes: same box, same two
 * poses, same `data-mochi-pose` contract, same call sites (120px in the warm
 * card's ask beat, 44px beside the reply CTA).
 * ───────────────────────────────────────────────────────────────────────────
 *
 * Deliberately NOT the pixel/Win98 Mochi — that is a Language A asset and must
 * never stand on the warm field.
 *
 * The dashed stroke is what makes this read as a placeholder rather than a
 * render glitch, and it survives at 44px. At small sizes the label shortens to
 * "MOCHI" so it stays legible instead of clipping.
 */

import type { CSSProperties } from 'react';

/** `idle` = just present. `asking`/`sad` remain in the contract for whenever a
 *  prompting beat comes back; nothing renders them today. */
export type MochiPose = 'idle' | 'asking' | 'sad';

const CREAM = '#f5f0eb'; // §3.2 Warm Cream
const MUTED_BROWN = '#A08060'; // §3.2 Muted Brown
const UI = 'var(--font-outfit), system-ui, sans-serif';

export interface MochiPlaceholderProps {
  pose: MochiPose;
  /** 120 in the ask beat, 44 beside the reply CTA. */
  size?: number;
}

export function MochiPlaceholder({ pose, size = 120 }: MochiPlaceholderProps) {
  const large = size >= 96;
  const label = large ? `MOCHI: ${pose}` : 'MOCHI';

  const wrap: CSSProperties = {
    position: 'relative',
    width: size,
    height: size,
    flex: '0 0 auto',
  };

  return (
    <div data-mochi-pose={pose} style={wrap} aria-hidden>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        style={{ display: 'block' }}
      >
        {/* plain rounded blob — placeholder geometry only */}
        <rect
          x="5"
          y="5"
          width="110"
          height="110"
          rx="38"
          fill={CREAM}
          stroke={MUTED_BROWN}
          strokeWidth={large ? 2 : 3}
          strokeDasharray={large ? '7 6' : '9 7'}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: UI,
          fontWeight: 600,
          fontSize: large ? 11 : 8,
          letterSpacing: large ? '0.06em' : '0.03em',
          color: MUTED_BROWN,
          textAlign: 'center',
          padding: '0 6px',
        }}
      >
        {label}
      </span>
    </div>
  );
}
