'use client';

import { FoldedHeartShape } from './jar-hearts';

/**
 * MemoryShelf — the notes already read, hung on a little twine garland
 * (mirrors the homepage polaroid-wall string for continuity, §6.1 / §7.1).
 *
 * A #C19A6B twine sags across the bottom of the scene, anchored by two small
 * #8B7355 wooden clothespins; each kept note hangs from it as a folded paper
 * heart. The pile grows as the recipient reads through the jar.
 */

const TWINE_P0 = { x: 8, y: 18 };
const TWINE_P1 = { x: 160, y: 38 };
const TWINE_P2 = { x: 312, y: 18 };

function pointAt(t: number) {
  const x =
    (1 - t) * (1 - t) * TWINE_P0.x +
    2 * (1 - t) * t * TWINE_P1.x +
    t * t * TWINE_P2.x;
  const y =
    (1 - t) * (1 - t) * TWINE_P0.y +
    2 * (1 - t) * t * TWINE_P1.y +
    t * t * TWINE_P2.y;
  return { x, y };
}

const HEART_COLORS = [
  '#FFC4D6',
  '#F4A0B5',
  '#FFD6A5',
  '#E0BBE4',
  '#B5EAD7',
  '#FFB7C5',
];

/* ── Small wooden clothespin (#8B7355 wood), echoing the polaroid wall ── */
function Clothespin({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-4" y="-3" width="8" height="20" rx="1.2" fill="#8B7355" />
      <rect
        x="-4"
        y="-3"
        width="8"
        height="20"
        rx="1.2"
        fill="none"
        stroke="#6F5C42"
        strokeWidth="0.4"
      />
      <line
        x1="0"
        y1="-2"
        x2="0"
        y2="16"
        stroke="#6F5C42"
        strokeWidth="0.3"
        strokeDasharray="1 1.3"
      />
      <rect x="-5" y="4" width="10" height="3" rx="1" fill="#B8AFA0" />
      <rect
        x="-2.6"
        y="-1.5"
        width="0.7"
        height="16"
        rx="0.3"
        fill="rgba(255,255,255,0.14)"
      />
    </g>
  );
}

export function MemoryShelf({ kept }: { kept: number }) {
  if (kept <= 0) return null;
  const shown = Math.min(kept, 7);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex flex-col items-center"
      style={{ bottom: '3%' }}
      aria-hidden
    >
      <svg
        viewBox="0 0 320 60"
        width="min(90vw, 360px)"
        height="auto"
        fill="none"
        style={{ overflow: 'visible' }}
      >
        {/* twine */}
        <path
          d={`M${TWINE_P0.x},${TWINE_P0.y} Q${TWINE_P1.x},${TWINE_P1.y} ${TWINE_P2.x},${TWINE_P2.y}`}
          stroke="#C19A6B"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />

        {/* hung folded-paper hearts */}
        {Array.from({ length: shown }).map((_, i) => {
          const t = (i + 0.5) / shown;
          const p = pointAt(t);
          const rot = -10 + (i * 22) / Math.max(1, shown - 1);
          return (
            <g
              key={i}
              transform={`translate(${p.x} ${p.y + 9}) rotate(${rot}) scale(1.05)`}
            >
              <FoldedHeartShape base={HEART_COLORS[i % HEART_COLORS.length]} />
            </g>
          );
        })}

        {/* two clothespins anchoring the twine */}
        <Clothespin x={pointAt(0.08).x} y={pointAt(0.08).y - 4} />
        <Clothespin x={pointAt(0.92).x} y={pointAt(0.92).y - 4} />
      </svg>

      <span
        className="mt-1 font-handwritten text-[15px] lowercase"
        style={{ color: 'rgba(120,90,55,0.7)' }}
      >
        {kept} kept ♡
      </span>
    </div>
  );
}
