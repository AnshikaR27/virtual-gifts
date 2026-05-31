'use client';

/**
 * JarHearts — folded paper hearts piled inside the jar (design-system §9).
 *
 * Rendered as an SVG group so it lives inside the JarIllustrated viewBox and
 * shakes/wobbles with the jar. The pile shrinks as notes are read: `count` is
 * how many hearts remain. `intensity` (0–1) adds a little jitter while the jar
 * is being shaken.
 *
 * Coordinate space: the parent JarIllustrated viewBox is 0 0 200 280. The
 * hearts settle in the jar's lower belly, roughly x∈[55,145], y∈[150,225].
 */

const HEART_COLORS = [
  '#FFC4D6',
  '#F4A0B5',
  '#FFD6A5',
  '#E0BBE4',
  '#B5EAD7',
  '#FFDAC1',
  '#FFB7C5',
];

// Deterministic pile: each slot has a home position, rotation and colour.
// (20 slots — matches the default jar capacity in the test data.)
const SLOTS = Array.from({ length: 20 }, (_, i) => {
  // Pseudo-random but stable per index.
  const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
  const col = i % 5;
  const row = Math.floor(i / 5);
  const x = 64 + col * 18 + (r(1) - 0.5) * 10;
  // Lower rows sit deeper in the jar; fill from the bottom up.
  const y = 210 - row * 15 - r(2) * 6;
  const rot = (r(3) - 0.5) * 60;
  const scale = 0.82 + r(4) * 0.3;
  return { x, y, rot, scale, color: HEART_COLORS[i % HEART_COLORS.length] };
});

function FoldedHeart({
  x,
  y,
  rot,
  scale,
  color,
  jitter,
}: {
  x: number;
  y: number;
  rot: number;
  scale: number;
  color: string;
  jitter: number;
}) {
  return (
    <g
      transform={`translate(${x + jitter} ${y}) rotate(${rot}) scale(${scale})`}
    >
      {/* heart body */}
      <path
        d="M0,4 C0,-1 -7,-1 -7,4 C-7,8 0,12 0,12 C0,12 7,8 7,4 C7,-1 0,-1 0,4 Z"
        fill={color}
        stroke="rgba(160,128,96,0.35)"
        strokeWidth="0.6"
      />
      {/* fold crease — the "folded paper" tell */}
      <path d="M0,2 L0,11" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
      {/* tiny specular highlight */}
      <ellipse
        cx="-2.4"
        cy="3"
        rx="1.4"
        ry="0.9"
        fill="rgba(255,255,255,0.5)"
      />
    </g>
  );
}

export function JarHearts({
  count,
  intensity = 0,
}: {
  count: number;
  intensity?: number;
}) {
  const visible = SLOTS.slice(0, Math.max(0, Math.min(count, SLOTS.length)));
  return (
    <g>
      {visible.map((s, i) => (
        <FoldedHeart
          key={i}
          {...s}
          jitter={intensity ? Math.sin(i * 1.7) * 2.4 * intensity : 0}
        />
      ))}
    </g>
  );
}
