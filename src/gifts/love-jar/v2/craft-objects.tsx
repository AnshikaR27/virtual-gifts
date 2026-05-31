'use client';

import { CrochetRose, GarlandLeaf } from '@/components/shared/craft-elements';
import { FoldedHeartShape } from './jar-hearts';

/**
 * CraftObjects — the set dressing around the jar (composition addendum §C–§F).
 *
 * Goal: read as *gathered*, like the homepage polaroid wall — overlapping
 * objects, asymmetric weighting (more mass to the right of the jar), the same
 * CrochetRose / GarlandLeaf illustrations for instant continuity. No mascots:
 * per design-system §9 the pixel Mochis are Language A and don't belong in a
 * Language B scene; the jar + name tag carry the hero on their own.
 *
 * DOM order puts this behind the jar (rendered later in the scene), so roses
 * tucked near the centre genuinely peek out from behind the glass.
 */

/* ── 4-point hand-drawn sparkle doodle ── */
function SparkleDoodle({
  size = 12,
  rotate = 0,
}: {
  size?: number;
  rotate?: number;
}) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden>
      <path
        d="M6,1 L7,5 L11,6 L7,7 L6,11 L5,7 L1,6 L5,5 Z"
        fill="#C19A6B"
        opacity="0.42"
        transform={`rotate(${rotate} 6 6)`}
      />
    </svg>
  );
}

/* ── A folded paper heart that's "escaped" onto the surface ── */
function EscapedHeart({
  base,
  rotate,
  size = 20,
}: {
  base: string;
  rotate: number;
  size?: number;
}) {
  return (
    <svg viewBox="-9 -3 18 18" width={size} height={size} aria-hidden>
      <g transform={`rotate(${rotate})`}>
        <FoldedHeartShape base={base} />
      </g>
    </svg>
  );
}

/* ── A rose + a couple of leaves, same recipe as the polaroid-wall clusters ── */
function RoseCluster({
  rotate = 0,
  scale = 1,
  leaves,
}: {
  rotate?: number;
  scale?: number;
  leaves: {
    dx: number;
    dy: number;
    rotate: number;
    flip?: boolean;
    dark?: boolean;
  }[];
}) {
  return (
    <div style={{ position: 'relative' }}>
      {leaves.map((leaf, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${leaf.dx}px, ${leaf.dy}px) rotate(${leaf.rotate}deg)`,
          }}
        >
          <GarlandLeaf flip={leaf.flip} dark={leaf.dark} />
        </div>
      ))}
      <div style={{ transform: `rotate(${rotate}deg) scale(${scale})` }}>
        <CrochetRose />
      </div>
    </div>
  );
}

/* ── Folded note leaning on the jar, a corner lifting from under washi tape ── */
function FoldedNote() {
  return (
    <div
      className="absolute"
      style={{
        bottom: '29%',
        left: '19%',
        width: 48,
        height: 58,
        transform: 'rotate(-9deg)',
        filter: 'drop-shadow(0 3px 5px rgba(139,115,85,0.2))',
      }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          background: '#fffaf2',
          border: '1px solid rgba(160,128,96,0.18)',
        }}
      />
      {/* lifted top-right corner flap */}
      <div
        className="absolute"
        style={{
          right: 0,
          top: 0,
          width: 14,
          height: 12,
          background: '#f1e9db',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
        }}
      />
      {/* fold crease */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: 4,
          bottom: 4,
          width: 1,
          background: 'rgba(160,128,96,0.18)',
        }}
      />
      {/* peek of handwriting */}
      <div
        className="absolute"
        style={{
          left: 6,
          right: 8,
          top: 11,
          height: 2,
          background: 'rgba(120,90,55,0.3)',
          borderRadius: 2,
        }}
      />
      <div
        className="absolute"
        style={{
          left: 6,
          right: 16,
          top: 17,
          height: 2,
          background: 'rgba(120,90,55,0.22)',
          borderRadius: 2,
        }}
      />
      <div
        className="absolute"
        style={{
          left: 6,
          right: 12,
          top: 23,
          height: 2,
          background: 'rgba(120,90,55,0.18)',
          borderRadius: 2,
        }}
      />
      {/* washi tape over the top-right corner (holding the lifted flap) */}
      <div
        className="absolute"
        style={{
          right: -6,
          top: -4,
          width: 24,
          height: 12,
          background: 'rgba(214,187,228,0.78)',
          transform: 'rotate(40deg)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        }}
      />
      {/* specular highlight */}
      <div
        className="absolute"
        style={{
          left: 7,
          top: 7,
          width: 10,
          height: 4,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.5)',
        }}
      />
    </div>
  );
}

/* ── A tiny handwritten doodle inked on the surface ── */
function SurfaceDoodle() {
  return (
    <svg viewBox="0 0 40 24" width="40" height="24" aria-hidden>
      {/* little looping heart squiggle, like a margin doodle */}
      <path
        d="M6,14 C2,8 9,5 12,10 C15,5 22,8 18,14 C16,17 12,20 12,20 C12,20 8,17 6,14 Z"
        fill="none"
        stroke="#A08060"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.4"
      />
      <path
        d="M24,17 C28,12 33,15 31,19"
        fill="none"
        stroke="#A08060"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

export function CraftObjects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Washi tape on the surface, near the jar base (jar shadow overlaps it) */}
      <div
        className="absolute"
        style={{
          bottom: '23%',
          left: '45%',
          width: 42,
          height: 14,
          background: '#FFD6E5',
          transform: 'rotate(-22deg)',
          opacity: 0.7,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}
        aria-hidden
      />

      {/* LEFT — folded note leaning on the jar + a pressed leaf beside it */}
      <FoldedNote />
      <div
        className="absolute"
        style={{ bottom: '24%', left: '30%', transform: 'rotate(-40deg)' }}
        aria-hidden
      >
        <GarlandLeaf dark />
      </div>

      {/* RIGHT (heavier side) — rose cluster peeking from behind the jar */}
      <div
        className="absolute"
        style={{ bottom: '33%', right: '24%', transform: 'rotate(-12deg)' }}
        aria-hidden
      >
        <RoseCluster
          rotate={-8}
          leaves={[
            { dx: -15, dy: -4, rotate: 28, dark: false },
            { dx: 12, dy: 4, rotate: -22, flip: true, dark: true },
            { dx: -6, dy: 10, rotate: 8, dark: true },
          ]}
        />
      </div>

      {/* RIGHT — a second smaller rose trailing lower across the table */}
      <div
        className="absolute"
        style={{ bottom: '17%', right: '15%', transform: 'rotate(14deg)' }}
        aria-hidden
      >
        <RoseCluster
          rotate={10}
          scale={0.8}
          leaves={[
            { dx: 13, dy: -3, rotate: -18, flip: true, dark: true },
            { dx: -12, dy: 5, rotate: 20, dark: false },
          ]}
        />
      </div>

      {/* Escaped folded hearts on the surface */}
      <div
        className="absolute"
        style={{ bottom: '20%', left: '33%' }}
        aria-hidden
      >
        <EscapedHeart base="#FFC4D6" rotate={16} />
      </div>
      <div
        className="absolute"
        style={{ bottom: '15%', right: '36%' }}
        aria-hidden
      >
        <EscapedHeart base="#E0BBE4" rotate={-24} size={17} />
      </div>
      <div
        className="absolute"
        style={{ bottom: '30%', right: '33%' }}
        aria-hidden
      >
        <EscapedHeart base="#FFD6A5" rotate={-8} size={15} />
      </div>

      {/* A tiny handwritten doodle on the surface */}
      <div
        className="absolute"
        style={{ bottom: '13%', left: '40%' }}
        aria-hidden
      >
        <SurfaceDoodle />
      </div>

      {/* Hand-drawn sparkle doodles in the dead space */}
      <div className="absolute" style={{ top: '17%', left: '15%' }} aria-hidden>
        <SparkleDoodle size={15} rotate={-8} />
      </div>
      <div
        className="absolute"
        style={{ top: '24%', right: '22%' }}
        aria-hidden
      >
        <SparkleDoodle size={11} rotate={20} />
      </div>
      <div className="absolute" style={{ top: '38%', left: '11%' }} aria-hidden>
        <SparkleDoodle size={9} rotate={-30} />
      </div>
      <div className="absolute" style={{ top: '13%', left: '44%' }} aria-hidden>
        <SparkleDoodle size={12} rotate={6} />
      </div>
    </div>
  );
}
