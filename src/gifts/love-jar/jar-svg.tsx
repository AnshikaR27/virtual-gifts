'use client';

import { motion } from 'framer-motion';
import { DEFAULT_PALETTE, type JarPalette } from './love-jar.config';

interface JarSvgProps {
  recipientName: string;
  heartCount: number;
  isShaking: boolean;
  lowMemory: boolean;
  palette?: JarPalette;
}

export function JarSvg({
  recipientName,
  isShaking,
  palette = DEFAULT_PALETTE,
}: JarSvgProps) {
  const truncName =
    recipientName.length > 8 ? recipientName.slice(0, 8) + '…' : recipientName;

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[240px]"
      animate={
        isShaking
          ? {
              rotate: [0, -8, 8, -5, 3, 0],
              scaleX: [1, 1.03, 0.97, 1.02, 0.99, 1],
              scaleY: [1, 0.97, 1.03, 0.98, 1.01, 1],
            }
          : { scale: [1, 1.005, 1], rotate: 0 }
      }
      transition={
        isShaking
          ? { duration: 0.8, ease: 'easeOut' }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      }
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="0 0 120 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-label={`A painted love jar for ${recipientName}`}
      >
        <defs>
          {/* Subtle chalk-paint noise texture */}
          <filter id="chalkNoise" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              seed="7"
              result="noise"
            />
            <feComposite
              in="SourceGraphic"
              in2="noise"
              operator="in"
              result="textured"
            />
            <feBlend in="SourceGraphic" in2="textured" mode="overlay" />
          </filter>

          {/* Stencil edge roughness for the heart */}
          <filter id="stencilEdge" x="-3%" y="-3%" width="106%" height="106%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.08"
              numOctaves="2"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <pattern
            id="kraftPaperDots"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
          >
            <circle cx="1.5" cy="1.5" r="0.3" fill="rgba(0,0,0,0.06)" />
            <circle cx="4" cy="3.5" r="0.2" fill="rgba(0,0,0,0.04)" />
            <circle cx="2" cy="5" r="0.15" fill="rgba(0,0,0,0.03)" />
          </pattern>
        </defs>

        {/* ── Floor shadow ── */}
        <ellipse cx="60" cy="152" rx="42" ry="6" fill="rgba(0,0,0,0.1)" />

        {/* ── Back twine arc (behind jar neck) ── */}
        <path
          d="M36,34 Q60,38 84,34"
          stroke="#7A6545"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── JAR BODY — solid matte painted ── */}
        <path
          d="M30,40 C27,44 25,54 25,70 C25,100 26,120 28,130 C30,136 38,140 60,140 C82,140 90,136 92,130 C94,120 95,100 95,70 C95,54 93,44 90,40 Z"
          fill={palette.body}
        />

        {/* Chalk paint texture overlay — very subtle grain */}
        <path
          d="M30,40 C27,44 25,54 25,70 C25,100 26,120 28,130 C30,136 38,140 60,140 C82,140 90,136 92,130 C94,120 95,100 95,70 C95,54 93,44 90,40 Z"
          fill="white"
          opacity="0.04"
          filter="url(#chalkNoise)"
        />

        {/* Left-edge highlight — subtle, same color family */}
        <path
          d="M28,44 C26,56 25,72 26,100 C26,116 27,126 28,132"
          stroke={palette.highlightLight}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Bottom-curve shadow — slightly darker body */}
        <path
          d="M34,136 C44,140 76,140 86,136"
          stroke={palette.shadowDark}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* ── PAINTED HEART SILHOUETTE on front ── */}
        <motion.g
          animate={
            isShaking
              ? { scale: [1, 1.05, 1], opacity: [1, 1, 1] }
              : { opacity: [1, 0.92, 1] }
          }
          transition={
            isShaking
              ? { duration: 0.3, ease: 'easeOut' }
              : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ transformOrigin: '60px 82px' }}
        >
          <path
            d="M60,105 C48,95 33,86 33,72 C33,65 38,59 44,59 C49,59 54,62 60,69 C66,62 71,59 76,59 C82,59 87,65 87,72 C87,86 72,95 60,105 Z"
            fill={palette.heart}
            filter="url(#stencilEdge)"
          />
        </motion.g>

        {/* ── JAR NECK ── */}
        <rect
          x="38"
          y="30"
          width="44"
          height="11"
          rx="1.5"
          fill={palette.body}
        />
        {/* Neck highlight */}
        <rect
          x="39"
          y="30"
          width="2.5"
          height="11"
          rx="1"
          fill={palette.highlightLight}
          opacity="0.25"
        />

        {/* ── RIM / LID RING — metallic gold-ish ── */}
        <rect
          x="35"
          y="26"
          width="50"
          height="6"
          rx="1"
          fill={palette.rimDark}
        />
        {/* Rim top highlight */}
        <rect
          x="35"
          y="26"
          width="50"
          height="2.5"
          rx="1"
          fill={palette.highlightLight}
          opacity="0.3"
        />
        {/* Rim thread lines */}
        <line
          x1="36"
          y1="28.5"
          x2="84"
          y2="28.5"
          stroke={palette.shadowDark}
          strokeWidth="0.4"
          opacity="0.4"
        />
        <line
          x1="36"
          y1="30"
          x2="84"
          y2="30"
          stroke={palette.shadowDark}
          strokeWidth="0.3"
          opacity="0.3"
        />

        {/* ── Front twine arc + bow ── */}
        <path
          d="M36,34 Q60,31 84,34"
          stroke="#B8956A"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Twine highlight */}
        <path
          d="M36,33.5 Q60,30.5 84,33.5"
          stroke="#CBAB7D"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Bow */}
        <g transform="translate(57,32)">
          <path
            d="M3,0 C0.5,-4.5 -4,-4.5 -1.5,0 C-4,4.5 0.5,4.5 3,0"
            fill="#B8956A"
          />
          <path
            d="M3,0 C5.5,-4.5 10,-4.5 7.5,0 C10,4.5 5.5,4.5 3,0"
            fill="#A0845C"
          />
          <ellipse cx="3" cy="0" rx="1.3" ry="1.3" fill="#6B5333" />
          <path
            d="M1.5,1.5 C0.5,5 -0.5,8 -1,11"
            stroke="#A0845C"
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M4.5,1.5 C5.5,5 6.5,8 7,11"
            stroke="#8B7355"
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* ── Kraft tag ── */}
        <g>
          <path
            d="M82,34 C85,37 88,40 90,44"
            stroke="#A0845C"
            strokeWidth="0.6"
            fill="none"
          />
          <g transform="translate(83,42) rotate(-10)">
            <rect x="0" y="0" width="30" height="17" rx="1.5" fill="#D9B89A" />
            <rect
              x="0"
              y="0"
              width="30"
              height="17"
              rx="1.5"
              fill="url(#kraftPaperDots)"
              opacity="0.5"
            />
            <circle
              cx="4.5"
              cy="4"
              r="1.8"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.5"
            />
            <circle cx="4.5" cy="4" r="0.7" fill="rgba(255,240,230,0.5)" />
            <path
              d="M4.5,2.2 C3,-0.5 -1,-4 -3,-6"
              stroke="#A0845C"
              strokeWidth="0.5"
              fill="none"
            />
            <text
              x="16"
              y="12.5"
              textAnchor="middle"
              fontSize="4"
              fontFamily="var(--font-caveat), cursive"
              fill="#3D2817"
            >
              for {truncName} &#9825;
            </text>
          </g>
        </g>
      </svg>
    </motion.div>
  );
}
