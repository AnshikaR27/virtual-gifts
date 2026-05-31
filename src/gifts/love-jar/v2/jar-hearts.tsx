'use client';

/**
 * Folded paper hearts (design-system §6.2 paper feeling, §3.9 line weights).
 *
 * Each heart is drawn as two lobed halves split by a centre fold, so it reads
 * as a folded note rather than an emoji: the left half is faintly shaded
 * (paper isn't uniform), a soft white crease runs down the fold, a hairline
 * warm-brown outline matches the CrochetRose / GarlandLeaf stroke weight, and
 * a small specular highlight lifts it off the surface.
 *
 * `FoldedHeartShape` returns a <g>-able set of paths centred on the origin
 * (heart spans roughly x∈[-7,7], y∈[-1,12]) so it can be dropped inside any
 * parent SVG — the jar pile here, and the escaped hearts on the table.
 */

const HEART_OUTLINE =
  'M0,3 C0,-1 -7,-1 -7,4 C-7,8 0,12 0,12 C0,12 7,8 7,4 C7,-1 0,-1 0,3 Z';
const HEART_LEFT = 'M0,3 C0,-1 -7,-1 -7,4 C-7,8 0,12 0,12 Z';
const HEART_RIGHT = 'M0,3 C0,-1 7,-1 7,4 C7,8 0,12 0,12 Z';

export function FoldedHeartShape({ base }: { base: string }) {
  return (
    <>
      {/* two halves — left a touch deeper so the fold catches light */}
      <path d={HEART_RIGHT} fill={base} />
      <path d={HEART_LEFT} fill={base} />
      <path d={HEART_LEFT} fill="rgba(120,90,55,0.1)" />
      {/* centre fold: soft white highlight + faint crease */}
      <path
        d="M0,3.4 L0,11.4"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.5"
        strokeLinecap="round"
      />
      <path
        d="M0,4 L-3.4,2.3"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.3"
        strokeLinecap="round"
      />
      {/* hairline outline — matches CrochetRose / GarlandLeaf weight */}
      <path
        d={HEART_OUTLINE}
        fill="none"
        stroke="rgba(160,128,96,0.4)"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      {/* specular highlight */}
      <ellipse
        cx="-3"
        cy="2.4"
        rx="1.5"
        ry="0.9"
        fill="rgba(255,255,255,0.45)"
        transform="rotate(-15 -3 2.4)"
      />
    </>
  );
}

// Pastel paper stock — each heart picks one; the within-heart shading does the
// rest of the "no two are quite the same" work.
const HEART_COLORS = [
  '#FFC4D6',
  '#F4A0B5',
  '#FFD6A5',
  '#E0BBE4',
  '#B5EAD7',
  '#FFDAC1',
  '#FFB7C5',
];

// Deterministic pile (stable per index so SSR matches). Hearts overlap and sit
// at their own angles; lower rows settle deeper in the jar.
const SLOTS = Array.from({ length: 20 }, (_, i) => {
  const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
  const col = i % 5;
  const row = Math.floor(i / 5);
  const x = 64 + col * 18 + (r(1) - 0.5) * 12;
  const y = 212 - row * 14 - r(2) * 7;
  const rot = (r(3) - 0.5) * 70;
  const scale = 0.8 + r(4) * 0.34;
  return { x, y, rot, scale, color: HEART_COLORS[i % HEART_COLORS.length] };
});

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
      {visible.map((s, i) => {
        const jitter = intensity ? Math.sin(i * 1.7) * 2.6 * intensity : 0;
        return (
          <g
            key={i}
            transform={`translate(${s.x + jitter} ${s.y}) rotate(${s.rot}) scale(${s.scale})`}
          >
            <FoldedHeartShape base={s.color} />
          </g>
        );
      })}
    </g>
  );
}
