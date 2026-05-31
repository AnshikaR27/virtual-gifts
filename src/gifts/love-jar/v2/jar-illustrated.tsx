'use client';

import { JarHearts } from './jar-hearts';

/**
 * JarIllustrated — the hero of the scene (design-system §4.3 / §9).
 *
 * A hand-illustrated SVG mason jar (glass body, screw band + cork lid, a tied
 * twine bow, a torn-paper label) with the folded paper hearts piled inside.
 * Replaces the old raster `love-jar.png` — pure SVG so it paints on the first
 * frame with no preload and scales crisply.
 *
 * The jar wobbles gently at idle and shakes when `shaking` is true (lj2-jar-*
 * keyframes, which respect prefers-reduced-motion). It is tappable as the
 * desktop affordance for releasing a note (mobile uses devicemotion).
 */

interface JarIllustratedProps {
  recipientName: string;
  hearts: number;
  shaking: boolean;
  onTap?: () => void;
}

export function JarIllustrated({
  recipientName,
  hearts,
  shaking,
  onTap,
}: JarIllustratedProps) {
  const label = `♥ for ${recipientName}`;

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="tap the jar to take out a little note"
      className="block bg-transparent p-0"
      style={{
        border: 'none',
        cursor: onTap ? 'pointer' : 'default',
        transformOrigin: 'bottom center',
        animation: shaking
          ? 'lj2-jar-shake 600ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both'
          : 'lj2-jar-wobble 4s ease-in-out infinite',
        filter: 'drop-shadow(0 12px 16px rgba(139, 115, 85, 0.25))',
      }}
    >
      <svg
        viewBox="0 0 200 280"
        width="100%"
        height="100%"
        fill="none"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* ── Glass body ── */}
        {/* back fill (soft glass tint) */}
        <path
          d="M44,92 Q40,96 40,104 L40,238 Q40,258 60,258 L140,258 Q160,258 160,238 L160,104 Q160,96 156,92 Z"
          fill="rgba(205, 228, 226, 0.55)"
          stroke="rgba(120, 150, 150, 0.45)"
          strokeWidth="2.5"
        />

        {/* hearts inside (clipped to the glass) */}
        <clipPath id="lj2-jar-clip">
          <path d="M44,92 Q40,96 40,104 L40,238 Q40,258 60,258 L140,258 Q160,258 160,238 L160,104 Q160,96 156,92 Z" />
        </clipPath>
        <g clipPath="url(#lj2-jar-clip)">
          <JarHearts count={hearts} intensity={shaking ? 1 : 0} />
        </g>

        {/* glass specular highlight */}
        <path
          d="M54,108 Q50,112 50,120 L50,228"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse
          cx="62"
          cy="130"
          rx="6"
          ry="22"
          fill="rgba(255,255,255,0.25)"
        />

        {/* ── Neck + screw band ── */}
        <rect
          x="52"
          y="74"
          width="96"
          height="26"
          rx="6"
          fill="#e7dccb"
          stroke="rgba(160,128,96,0.5)"
          strokeWidth="2"
        />
        {/* screw-thread hatches */}
        {[60, 74, 88, 102, 116, 130].map((x) => (
          <line
            key={x}
            x1={x}
            y1="80"
            x2={x}
            y2="94"
            stroke="rgba(160,128,96,0.3)"
            strokeWidth="1.4"
          />
        ))}

        {/* ── Cork lid ── */}
        <ellipse cx="100" cy="72" rx="52" ry="12" fill="#c79a63" />
        <path
          d="M48,72 L48,62 Q48,54 60,54 L140,54 Q152,54 152,62 L152,72 Q152,84 100,84 Q48,84 48,72 Z"
          fill="#d8ab73"
          stroke="rgba(120,90,55,0.5)"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="60" rx="52" ry="11" fill="#e3bd8a" />
        {/* cork speckle */}
        {[
          [82, 60],
          [96, 58],
          [110, 62],
          [120, 59],
          [90, 63],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.1" fill="rgba(120,90,55,0.35)" />
        ))}

        {/* ── Twine bow round the neck ── */}
        <path
          d="M52,98 Q100,108 148,98"
          stroke="#C19A6B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M100,101 Q88,94 82,101 Q88,106 100,101 Z" fill="#C19A6B" />
        <path d="M100,101 Q112,94 118,101 Q112,106 100,101 Z" fill="#C19A6B" />
        <circle cx="100" cy="101" r="2.4" fill="#a9824f" />

        {/* ── Torn-paper label ── */}
        <g transform="rotate(-3 100 150)">
          <rect
            x="64"
            y="150"
            width="72"
            height="34"
            rx="2"
            fill="#fffcf6"
            stroke="rgba(160,128,96,0.2)"
            strokeWidth="1"
          />
          <text
            x="100"
            y="172"
            textAnchor="middle"
            fontFamily="var(--font-caveat), cursive"
            fontSize="17"
            fill="#3D2817"
          >
            {label}
          </text>
          {/* faint highlight on the label */}
          <ellipse
            cx="76"
            cy="158"
            rx="8"
            ry="3"
            fill="rgba(255,255,255,0.4)"
          />
        </g>
      </svg>
    </button>
  );
}
