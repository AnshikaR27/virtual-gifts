import type { CSSProperties } from 'react';

/**
 * <TiffinSprite> — three-tier stainless tiffin, pixel art. "closed" (latched,
 * for boot / level start) and "open" (lid lifted, sparkles, for the reveal).
 */

interface TiffinSpriteProps {
  variant?: 'closed' | 'open';
  width?: number;
  className?: string;
  style?: CSSProperties;
}

const STEEL = '#c4c4c4';
const STEEL_DK = '#888';
const HANDLE = '#7a5a2a';
const BASE = '#2a2540';
const SHINE = '#fff';

export function TiffinSprite({
  variant = 'closed',
  width = 88,
  className,
  style,
}: TiffinSpriteProps) {
  const open = variant === 'open';
  return (
    <svg
      viewBox="0 0 100 130"
      width={width}
      height={(width * 130) / 100}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      {/* carry handle */}
      <rect x="35" y="0" width="30" height="6" fill={HANDLE} />
      <rect x="35" y="6" width="6" height="10" fill={HANDLE} />
      <rect x="59" y="6" width="6" height="10" fill={HANDLE} />

      {open ? (
        <>
          {/* lifted lid, set ajar up-left */}
          <rect x="6" y="6" width="64" height="6" fill={STEEL_DK} />
          <rect x="6" y="12" width="64" height="4" fill={STEEL} />
          {/* sparkles */}
          <rect x="80" y="10" width="3" height="1" fill="#ff6ec7" />
          <rect x="86" y="16" width="3" height="1" fill="#ffe66d" />
          <rect x="82" y="22" width="3" height="1" fill="#ff6ec7" />
          {/* open top tier (white interior) */}
          <rect x="15" y="20" width="70" height="6" fill={STEEL_DK} />
          <rect x="15" y="26" width="70" height="22" fill="#fffef9" />
        </>
      ) : (
        <>
          {/* top tier */}
          <rect x="15" y="18" width="70" height="6" fill={STEEL_DK} />
          <rect x="15" y="24" width="70" height="22" fill={STEEL} />
          <rect x="22" y="28" width="3" height="14" fill={SHINE} />
        </>
      )}

      {/* middle tier */}
      <rect x="15" y="48" width="70" height="6" fill={STEEL_DK} />
      <rect x="15" y="54" width="70" height="22" fill={STEEL} />
      <rect x="22" y="58" width="3" height="14" fill={SHINE} />

      {/* bottom tier (taller) */}
      <rect x="15" y="78" width="70" height="6" fill={STEEL_DK} />
      <rect x="15" y="84" width="70" height="28" fill={STEEL} />
      <rect x="22" y="88" width="3" height="18" fill={SHINE} />

      {/* base */}
      <rect x="11" y="114" width="78" height="6" fill={BASE} />

      {/* side latch */}
      <rect x="9" y="44" width="6" height="70" fill={STEEL_DK} />
      <rect x="9" y="44" width="6" height="3" fill={SHINE} />
    </svg>
  );
}
