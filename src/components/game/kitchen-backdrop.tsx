import type { CSSProperties } from 'react';

/**
 * <KitchenBackdrop> — a dense, lived-in pixel kitchen drawn behind foreground
 * sprites so game stages never read as an empty starfield. Tiled wall, a window
 * with curtains, a masala-dabba shelf, a hanging chai cup, and a wall calendar,
 * over a wooden counter. Reusable by any "home" game scene.
 *
 * Renders full-bleed (absolute inset-0, z-0). Put foreground at z >= 1.
 */

const WALL = '#f3d9b5';
const GROUT = '#e3bd8e';
const WOOD = '#a9743f';
const WOOD_HI = '#c08d54';
const STEEL = '#c4c4c4';
const STEEL_DK = '#8a8a8a';
const STEEL_LID = '#9a9a9a';

const FILL: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
  pointerEvents: 'none',
};

export function KitchenBackdrop({ style }: { style?: CSSProperties }) {
  // Tile grout lines.
  const vLines = [20, 40, 60, 80, 100];
  const hLines = [16, 32, 48, 64, 80, 96, 112, 128];

  return (
    <svg
      viewBox="0 0 120 160"
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="crispEdges"
      style={{ ...FILL, ...style }}
      aria-hidden
    >
      {/* wall */}
      <rect x="0" y="0" width="120" height="148" fill={WALL} />
      {vLines.map((x) => (
        <rect key={`v${x}`} x={x} y="0" width="1" height="148" fill={GROUT} />
      ))}
      {hLines.map((y) => (
        <rect key={`h${y}`} x="0" y={y} width="120" height="1" fill={GROUT} />
      ))}

      {/* window with curtains (top-left) */}
      <rect x="9" y="12" width="46" height="44" fill="#7a5230" />
      <rect x="12" y="15" width="40" height="38" fill="#bfe3ff" />
      <rect x="12" y="15" width="40" height="10" fill="#d6efff" />
      {/* clouds */}
      <rect x="18" y="20" width="8" height="2" fill="#ffffff" />
      <rect x="38" y="30" width="9" height="2" fill="#ffffff" />
      {/* window cross bars */}
      <rect x="31" y="15" width="2" height="38" fill="#7a5230" />
      <rect x="12" y="33" width="40" height="2" fill="#7a5230" />
      {/* curtain rod + curtains */}
      <rect x="6" y="10" width="52" height="2" fill="#5a3a1a" />
      <rect x="9" y="12" width="8" height="40" fill="#ff9ec0" />
      <rect x="9" y="12" width="3" height="40" fill="#ffb9d4" />
      <rect x="47" y="12" width="8" height="40" fill="#ff9ec0" />
      <rect x="52" y="12" width="3" height="40" fill="#ffb9d4" />

      {/* shelf (right) with masala dabbas */}
      <rect x="64" y="46" width="48" height="4" fill={WOOD} />
      <rect x="64" y="46" width="48" height="1" fill={WOOD_HI} />
      <rect x="66" y="49" width="2" height="3" fill="#7a5230" />
      <rect x="108" y="49" width="2" height="3" fill="#7a5230" />
      {[68, 84, 100].map((x) => (
        <g key={`dabba${x}`}>
          <rect x={x} y="34" width="12" height="12" fill={STEEL} />
          <rect x={x} y="34" width="3" height="12" fill="#dcdcdc" />
          <rect x={x - 1} y="31" width="14" height="4" fill={STEEL_LID} />
          <rect x={x + 4} y="29" width="4" height="2" fill={STEEL_DK} />
        </g>
      ))}

      {/* wall calendar */}
      <rect x="64" y="64" width="26" height="24" fill="#fffef9" />
      <rect x="64" y="64" width="26" height="6" fill="#ff1493" />
      <rect x="75" y="61" width="4" height="3" fill="#9a9a9a" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <rect
            key={`cal${r}-${c}`}
            x={67 + c * 6}
            y={73 + r * 5}
            width="3"
            height="3"
            fill="#d8c4ec"
          />
        )),
      )}

      {/* hanging chai cup (center) */}
      <rect x="40" y="62" width="1" height="8" fill="#5a3a1a" />
      <rect x="35" y="70" width="12" height="8" fill="#ffffff" />
      <rect x="35" y="70" width="12" height="2" fill="#e7d8c8" />
      <rect x="47" y="72" width="3" height="4" fill="#ffffff" />
      <rect x="48" y="73" width="1" height="2" fill="#c8a2e8" />

      {/* wooden counter */}
      <rect x="0" y="148" width="120" height="12" fill={WOOD} />
      <rect x="0" y="148" width="120" height="2" fill={WOOD_HI} />
      <rect x="0" y="154" width="120" height="1" fill="#8a5a2a" />

      {/* soft warm vignette so foreground sprites pop */}
      <rect
        x="0"
        y="0"
        width="120"
        height="160"
        fill="#1a0a2e"
        opacity="0.06"
      />
    </svg>
  );
}
