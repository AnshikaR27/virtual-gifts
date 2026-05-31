'use client';

import { JarHearts } from './jar-hearts';

/**
 * JarIllustrated — the hero of the scene (design-system §4.3 / §9).
 *
 * Hand-drawn to sit in the same sketchbook as CrochetRose / GarlandLeaf:
 * thin warm-brown outlines (~1.4px, not heavy SVG strokes), slightly uneven
 * sides from wobbled bezier control points, an overall ~2.5° tilt, a cork lid
 * that sits a touch crooked, and a name tag rotated −4° with one corner
 * lifting out from under a strip of washi tape (not glued flat).
 *
 * The jar wobbles gently at idle and shakes when `shaking` is true (lj2-jar-*
 * keyframes, which respect prefers-reduced-motion). Tappable as the desktop
 * affordance for releasing a note; mobile uses devicemotion.
 */

interface JarIllustratedProps {
  recipientName: string;
  hearts: number;
  shaking: boolean;
  onTap?: () => void;
}

// Uneven sides: the left wall bows a little differently from the right, so the
// silhouette never reads as a mirrored rectangle.
const JAR_BODY =
  'M45,92 C41,96 40,103 40.5,110 C41,150 39,200 41,236 C41.5,252 52,258 62,258 ' +
  'C92,259 118,259 139,257 C152,257 160,250 159.5,236 C161,198 159,150 159,110 ' +
  'C159.5,102 158,96 154,92 Z';

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
        filter: 'drop-shadow(0 12px 16px rgba(139, 115, 85, 0.22))',
      }}
    >
      <svg
        viewBox="0 0 200 280"
        width="100%"
        height="100%"
        fill="none"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* permanent hand-tilt — the wobble/shake animates around this */}
        <g transform="rotate(-2.5 100 175)">
          {/* ── Glass body ── */}
          <path
            d={JAR_BODY}
            fill="rgba(205, 228, 226, 0.5)"
            stroke="rgba(120, 150, 148, 0.5)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />

          {/* hearts inside (clipped to the glass) */}
          <clipPath id="lj2-jar-clip">
            <path d={JAR_BODY} />
          </clipPath>
          <g clipPath="url(#lj2-jar-clip)">
            <JarHearts count={hearts} intensity={shaking ? 1 : 0} />
          </g>

          {/* glass specular streaks */}
          <path
            d="M55,110 C51,116 51,122 51,128 C51,180 51,210 52,226"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse
            cx="63"
            cy="132"
            rx="5.5"
            ry="20"
            fill="rgba(255,255,255,0.22)"
            transform="rotate(-3 63 132)"
          />

          {/* ── Neck + screw band ── */}
          <path
            d="M52,75 C52,72 53,73 56,73 L144,73 C147,73 148,72 148,75 L147,98 C147,100 146,100 143,100 L57,100 C54,100 53,100 53,98 Z"
            fill="#e7dccb"
            stroke="rgba(160,128,96,0.5)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {[61, 75, 89, 103, 117, 131].map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={80 + (i % 2)}
              x2={x + 1}
              y2={93 - (i % 2)}
              stroke="rgba(160,128,96,0.28)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          ))}

          {/* ── Cork lid — sits a touch crooked (own slight rotation) ── */}
          <g transform="rotate(2.5 100 66)">
            <ellipse cx="100" cy="73" rx="53" ry="11.5" fill="#c79a63" />
            <path
              d="M48,73 C47,64 48,55 60,54 C90,52 116,52 141,55 C152,56 153,64 152,73 C151,82 126,85 100,84.5 C70,84 49,82 48,73 Z"
              fill="#d8ab73"
              stroke="rgba(120,90,55,0.5)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <ellipse cx="100" cy="60" rx="52" ry="10.5" fill="#e3bd8a" />
            {[
              [82, 60],
              [96, 58],
              [110, 62],
              [121, 59],
              [90, 63],
              [104, 61],
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="1.1"
                fill="rgba(120,90,55,0.32)"
              />
            ))}
          </g>

          {/* ── Twine bow round the neck ── */}
          <path
            d="M52,99 C76,108 124,108 148,99"
            stroke="#C19A6B"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M100,101 C90,94 83,100 82,102 C88,106 97,103 100,101 Z"
            fill="#C19A6B"
          />
          <path
            d="M100,101 C110,94 117,100 118,102 C112,106 103,103 100,101 Z"
            fill="#C19A6B"
          />
          <circle cx="100" cy="101" r="2.2" fill="#a9824f" />

          {/* ── Name tag — rotated −4°, one corner lifting from under tape ── */}
          <g transform="rotate(-4 100 158)">
            {/* paper */}
            <path
              d="M63,151 C84,149.5 116,149.5 137,151 C138,160 138,176 137,185 C116,186.5 84,186.5 63,185 C62,176 62,160 63,151 Z"
              fill="#fffcf6"
              stroke="rgba(160,128,96,0.25)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            {/* lifted top-left corner (a small flap peeling up) */}
            <path
              d="M63,151 C69,150.6 75,150.4 80,150.3 C74,153 68,154.5 62.5,154.5 C62.4,153.2 62.6,152 63,151 Z"
              fill="#f3ece0"
              stroke="rgba(160,128,96,0.25)"
              strokeWidth="0.6"
              strokeLinejoin="round"
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
            {/* faint highlight */}
            <ellipse
              cx="78"
              cy="159"
              rx="8"
              ry="2.6"
              fill="rgba(255,255,255,0.4)"
            />
            {/* washi tape pinning the top-left corner (over the lifted flap) */}
            <g transform="rotate(-24 72 150)">
              <rect
                x="55"
                y="144"
                width="34"
                height="12"
                fill="rgba(255,182,193,0.72)"
              />
              <rect
                x="55"
                y="144"
                width="34"
                height="3"
                fill="rgba(255,255,255,0.25)"
              />
            </g>
          </g>
        </g>
      </svg>
    </button>
  );
}
