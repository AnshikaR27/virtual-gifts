/**
 * Generic pixel icons shared by the game HUD / score screens. Kept in the
 * reusable game layer so PixelHUD and LevelCompleteScreen are self-contained;
 * the tiffin-note sprites folder re-exports these to satisfy its asset list.
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function PixelHeart({
  size = 12,
  color = '#ff1493',
  className,
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 7 7"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      <rect x="1" y="1" width="2" height="1" fill={color} />
      <rect x="4" y="1" width="2" height="1" fill={color} />
      <rect x="0" y="2" width="7" height="2" fill={color} />
      <rect x="1" y="4" width="5" height="1" fill={color} />
      <rect x="2" y="5" width="3" height="1" fill={color} />
      <rect x="3" y="6" width="1" height="1" fill={color} />
    </svg>
  );
}

export function PixelStar({
  size = 30,
  color = '#ffe66d',
  className,
  style,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 11 11"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={style}
      aria-hidden
    >
      <rect x="5" y="0" width="1" height="11" fill={color} />
      <rect x="0" y="5" width="11" height="1" fill={color} />
      <rect x="2" y="2" width="7" height="7" fill={color} />
      <rect x="1" y="3" width="9" height="5" fill={color} />
      <rect x="3" y="1" width="5" height="9" fill={color} />
    </svg>
  );
}
