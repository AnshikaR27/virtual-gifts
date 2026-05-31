'use client';

import {
  CrochetRose,
  GarlandLeaf,
  MochiSprite,
} from '@/components/shared/craft-elements';

/**
 * CraftObjects — Layer 4/5 of the scene (composition addendum §C, §D, §F).
 *
 * The "evidence of love-in-progress" arranged asymmetrically around the jar:
 * a folded note leaning in, a torn-paper label tucked behind a CrochetRose
 * (reused straight from the homepage polaroid wall for instant continuity),
 * a couple of escaped paper hearts, trailing twine, hand-drawn doodles, and a
 * stray piece of washi tape on the surface.
 *
 * Everything is absolutely positioned within the scene container. Nothing here
 * is interactive — it's the set dressing the jar sits inside.
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
        opacity="0.4"
        transform={`rotate(${rotate} 6 6)`}
      />
    </svg>
  );
}

/* ── A small folded paper heart that's "escaped" onto the surface ── */
function EscapedHeart({ color, rotate }: { color: string; rotate: number }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <g transform={`rotate(${rotate} 8 8)`}>
        <path
          d="M8,5 C8,1.5 3,1.5 3,5 C3,8 8,12 8,12 C8,12 13,8 13,5 C13,1.5 8,1.5 8,5 Z"
          fill={color}
          stroke="rgba(160,128,96,0.3)"
          strokeWidth="0.6"
        />
        <path d="M8,4 L8,11" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

/* ── Folded note leaning against the jar ── */
function FoldedNote() {
  return (
    <div
      className="absolute"
      style={{
        bottom: '30%',
        left: '20%',
        width: 46,
        height: 56,
        transform: 'rotate(-8deg)',
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
          right: 6,
          top: 9,
          height: 2,
          background: 'rgba(120,90,55,0.3)',
          borderRadius: 2,
        }}
      />
      <div
        className="absolute"
        style={{
          left: 6,
          right: 14,
          top: 15,
          height: 2,
          background: 'rgba(120,90,55,0.22)',
          borderRadius: 2,
        }}
      />
      {/* washi tape corner */}
      <div
        className="absolute"
        style={{
          right: -4,
          top: -3,
          width: 22,
          height: 11,
          background: 'rgba(214,187,228,0.75)',
          transform: 'rotate(38deg)',
        }}
      />
      {/* specular highlight */}
      <div
        className="absolute"
        style={{
          right: 6,
          top: 6,
          width: 10,
          height: 4,
          borderRadius: 999,
          background: 'rgba(255,255,255,0.5)',
        }}
      />
    </div>
  );
}

/* ── The two Mochis, seated on the table, leaning in for a kiss ── */
function MochiPair() {
  return (
    <>
      <div
        className="lj2-mochi left"
        style={{ bottom: '24%', left: '12%', width: 46 }}
        aria-hidden
      >
        <div className="lj2-mochi-bob">
          <div
            style={{
              transform: 'rotate(8deg)',
              transformOrigin: 'bottom center',
            }}
          >
            <MochiSprite side="left" isKissing isBlinking={false} />
          </div>
        </div>
        <span className="lj2-mochi-kiss">♥</span>
      </div>

      <div
        className="lj2-mochi right"
        style={{ bottom: '24%', right: '12%', width: 46 }}
        aria-hidden
      >
        <div className="lj2-mochi-bob" style={{ animationDelay: '0.4s' }}>
          <div
            style={{
              transform: 'rotate(-8deg)',
              transformOrigin: 'bottom center',
            }}
          >
            <MochiSprite side="right" isKissing isBlinking={false} />
          </div>
        </div>
        <span className="lj2-mochi-kiss">♥</span>
      </div>
    </>
  );
}

export function CraftObjects() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Folded note (left of jar) */}
      <FoldedNote />

      {/* CrochetRose + leaves + tucked label (right of jar) */}
      <div
        className="absolute"
        style={{ bottom: '29%', right: '18%', transform: 'rotate(-12deg)' }}
        aria-hidden
      >
        <div style={{ width: 30 }}>
          <CrochetRose />
        </div>
      </div>
      <div
        className="absolute"
        style={{ bottom: '27%', right: '14%', transform: 'rotate(20deg)' }}
        aria-hidden
      >
        <GarlandLeaf />
      </div>
      <div
        className="absolute"
        style={{ bottom: '31%', right: '24%', transform: 'rotate(-30deg)' }}
        aria-hidden
      >
        <GarlandLeaf flip dark />
      </div>

      {/* Escaped hearts on the surface */}
      <div
        className="absolute"
        style={{ bottom: '20%', left: '30%' }}
        aria-hidden
      >
        <EscapedHeart color="#FFC4D6" rotate={15} />
      </div>
      <div
        className="absolute"
        style={{ bottom: '16%', right: '34%' }}
        aria-hidden
      >
        <EscapedHeart color="#E0BBE4" rotate={-22} />
      </div>

      {/* Trailing twine on the surface */}
      <svg
        className="absolute"
        style={{ bottom: '14%', left: '24%', width: 120, height: 30 }}
        viewBox="0 0 120 30"
        fill="none"
        aria-hidden
      >
        <path
          d="M2,14 Q30,2 56,16 T110,12"
          stroke="#C19A6B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="110" cy="12" r="2.4" fill="#a9824f" />
      </svg>

      {/* Stray washi tape on the surface */}
      <div
        className="absolute"
        style={{
          bottom: '25%',
          left: '35%',
          width: 40,
          height: 14,
          background: '#FFD6E5',
          transform: 'rotate(-25deg)',
          opacity: 0.7,
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        }}
        aria-hidden
      />

      {/* Hand-drawn sparkle doodles in the dead space */}
      <div className="absolute" style={{ top: '18%', left: '16%' }} aria-hidden>
        <SparkleDoodle size={14} rotate={-8} />
      </div>
      <div
        className="absolute"
        style={{ top: '26%', right: '28%' }}
        aria-hidden
      >
        <SparkleDoodle size={10} rotate={20} />
      </div>
      <div className="absolute" style={{ top: '40%', left: '10%' }} aria-hidden>
        <SparkleDoodle size={8} rotate={-30} />
      </div>
      <div className="absolute" style={{ top: '14%', left: '46%' }} aria-hidden>
        <SparkleDoodle size={11} rotate={6} />
      </div>

      {/* The Mochis */}
      <MochiPair />
    </div>
  );
}
