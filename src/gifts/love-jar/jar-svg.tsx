'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const HEART_PINKS = [
  '#D81B60',
  '#E91E63',
  '#C2185B',
  '#AD1457',
  '#E91E63',
  '#D81B60',
  '#C2185B',
  '#E91E63',
  '#AD1457',
  '#D81B60',
] as const;

interface AccordionHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  opacity: number;
  wobbleDelay: number;
  wobbleDuration: number;
  peeksAbove: boolean;
}

function generateAccordionHearts(count: number): AccordionHeart[] {
  const capped = Math.min(count, 10);
  return Array.from({ length: capped }, (_, i) => {
    const peeks = i >= capped - 2 && capped >= 4;
    const isBack = i < 3;
    return {
      id: i,
      x: 30 + ((i * 29 + 7) % 42),
      y: peeks ? 52 + ((i * 5) % 6) : 70 + ((i * 17 + 5) % 22),
      size: 7 + ((i * 13) % 4),
      rotation: -25 + ((i * 31) % 50),
      color: HEART_PINKS[i % HEART_PINKS.length],
      opacity: isBack ? 0.85 : 1,
      wobbleDelay: (i * 0.4) % 3,
      wobbleDuration: 3 + ((i * 11) % 15) / 10,
      peeksAbove: peeks,
    };
  });
}

function AccordionHeartShape({ size, color }: { size: number; color: string }) {
  const s = size;
  return (
    <g>
      <path
        d={`M${s * 0.5},${s * 0.92} C${s * 0.15},${s * 0.62} ${-s * 0.02},${s * 0.3} ${s * 0.18},${s * 0.13} C${s * 0.32},0 ${s * 0.45},${s * 0.04} ${s * 0.5},${s * 0.28} C${s * 0.55},${s * 0.04} ${s * 0.68},0 ${s * 0.82},${s * 0.13} C${s * 1.02},${s * 0.3} ${s * 0.85},${s * 0.62} ${s * 0.5},${s * 0.92} Z`}
        fill={color}
      />
      <line
        x1={s * 0.28}
        y1={s * 0.22}
        x2={s * 0.72}
        y2={s * 0.22}
        stroke="#880E4F"
        strokeWidth="0.35"
        opacity="0.45"
      />
      <line
        x1={s * 0.22}
        y1={s * 0.42}
        x2={s * 0.78}
        y2={s * 0.42}
        stroke="#880E4F"
        strokeWidth="0.3"
        opacity="0.4"
      />
      <line
        x1={s * 0.25}
        y1={s * 0.62}
        x2={s * 0.75}
        y2={s * 0.62}
        stroke="#880E4F"
        strokeWidth="0.3"
        opacity="0.35"
      />
    </g>
  );
}

interface JarSvgProps {
  recipientName: string;
  heartCount: number;
  isShaking: boolean;
  lowMemory: boolean;
}

export function JarSvg({
  recipientName,
  heartCount,
  isShaking,
  lowMemory,
}: JarSvgProps) {
  const visibleCount = lowMemory ? Math.min(heartCount, 6) : heartCount;
  const hearts = useMemo(
    () => generateAccordionHearts(visibleCount),
    [visibleCount],
  );

  const truncName =
    recipientName.length > 8 ? recipientName.slice(0, 8) + '…' : recipientName;

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[280px]"
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
        viewBox="0 0 160 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-label={`A love jar for ${recipientName}`}
      >
        <defs>
          <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(220,235,245,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
          </linearGradient>

          <filter id="brushEdge" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="3"
              seed="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <clipPath id="jarInterior">
            <path d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z" />
          </clipPath>

          <pattern
            id="kraftNoise"
            patternUnits="userSpaceOnUse"
            width="6"
            height="6"
          >
            <rect width="6" height="6" fill="none" />
            <circle cx="1.5" cy="1.5" r="0.3" fill="rgba(0,0,0,0.07)" />
            <circle cx="4" cy="3.5" r="0.2" fill="rgba(0,0,0,0.05)" />
            <circle cx="2" cy="5" r="0.15" fill="rgba(0,0,0,0.04)" />
          </pattern>
        </defs>

        {/* ── LAYER 1: Floor shadow ── */}
        <ellipse cx="80" cy="168" rx="48" ry="5" fill="rgba(120,0,55,0.13)" />

        {/* ── LAYER 2: Back half of twine wrap ── */}
        <path
          d="M42,46 Q80,51 118,46"
          stroke="#8B7355"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── LAYER 3: Jar glass body ── */}
        <path
          d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z"
          fill="url(#jarGlass)"
          stroke="rgba(150,170,180,0.3)"
          strokeWidth="1"
        />

        {/* ── LAYER 4: Inside-jar shading ── */}
        <path
          d="M42,56 C39,60 37,70 37,84 C37,106 38,124 40,132 C43,138 50,142 80,142 C110,142 117,138 120,132 C122,124 123,106 123,84 C123,70 121,60 118,56 Z"
          fill="rgba(200,220,235,0.08)"
        />

        {/* ── LAYER 5: Accordion hearts PILED at bottom 40% ── */}
        <g clipPath="url(#jarInterior)" opacity="0.95">
          {hearts.map((heart) => (
            <motion.g
              key={heart.id}
              animate={
                isShaking
                  ? {
                      x: [
                        0,
                        ((heart.id % 3) - 1) * 3,
                        ((heart.id % 2) - 0.5) * -2.5,
                        0,
                      ],
                      y: [0, -2, 1.5, 0],
                      rotate: [0, heart.rotation + 5, heart.rotation - 3, 0],
                    }
                  : { y: [0, -0.8, 0] }
              }
              transition={
                isShaking
                  ? { duration: 0.6, ease: 'easeOut' }
                  : {
                      duration: heart.wobbleDuration,
                      delay: heart.wobbleDelay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
              style={{ willChange: 'transform' }}
            >
              <g
                transform={`translate(${heart.x},${heart.y}) rotate(${heart.rotation} ${heart.size / 2} ${heart.size / 2})`}
                opacity={heart.opacity}
              >
                <AccordionHeartShape size={heart.size} color={heart.color} />
              </g>
            </motion.g>
          ))}
        </g>

        {/* ── LAYER 6: White gesso base patch on front face ── */}
        <ellipse
          cx="80"
          cy="104"
          rx="26"
          ry="30"
          fill="#FFF8F2"
          opacity="0.92"
          transform="rotate(-2 80 104)"
        />
        <ellipse
          cx="80"
          cy="104"
          rx="24"
          ry="28"
          fill="#FFFCF8"
          opacity="0.7"
          transform="rotate(3 80 104)"
        />
        <ellipse
          cx="81"
          cy="103"
          rx="22"
          ry="27"
          fill="#FFF8F2"
          opacity="0.5"
          transform="rotate(-1 81 103)"
        />

        {/* ── LAYER 7: Painted magenta heart (visual hero) ── */}
        <g filter="url(#brushEdge)">
          {/* Main heart — intentionally asymmetric */}
          <path
            d="M80,130 C64,116 46,106 46,90 C46,81 52,74 60,74 C67,74 73,78 80,86 C87,78 93,74 100,74 C108,74 114,81 114,90 C114,106 96,116 80,130 Z"
            fill="#D81B60"
          />
          {/* Depth overlay */}
          <path
            d="M80,130 C66,118 50,108 48,94 C56,108 70,118 80,127 C90,118 104,108 112,94 C110,108 94,118 80,130 Z"
            fill="#B0184F"
            opacity="0.3"
          />
          {/* Brush strokes inside */}
          <path
            d="M60,78 C55,82 50,88 50,92"
            stroke="#7A0F3A"
            strokeWidth="1.5"
            fill="none"
            opacity="0.25"
            strokeLinecap="round"
          />
          <path
            d="M72,80 L70,110"
            stroke="#7A0F3A"
            strokeWidth="0.8"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M88,80 L90,110"
            stroke="#7A0F3A"
            strokeWidth="0.7"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M100,78 C105,82 110,88 110,92"
            stroke="#7A0F3A"
            strokeWidth="1.2"
            fill="none"
            opacity="0.2"
            strokeLinecap="round"
          />
          {/* Upper-left highlight */}
          <ellipse
            cx="62"
            cy="84"
            rx="6"
            ry="4"
            fill="#FF7BA0"
            opacity="0.3"
            transform="rotate(-20 62 84)"
          />
        </g>

        {/* ── LAYER 8: Glass highlight left edge ── */}
        <path
          d="M35,58 C33,72 33,90 34,110 C34,120 35,128 36,134"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── Jar neck ── */}
        <rect
          x="48"
          y="38"
          width="64"
          height="15"
          rx="2"
          fill="rgba(230,240,245,0.3)"
          stroke="rgba(180,200,215,0.4)"
          strokeWidth="0.5"
        />
        <path
          d="M49,38 L111,38"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
        />

        {/* ── LAYER 9: Front half of twine + bow ── */}
        <path
          d="M42,46 Q80,42 118,46"
          stroke="#B8956A"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M42,47.5 Q80,43.5 118,47.5"
          stroke="#A0845C"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Bow at center */}
        <g transform="translate(76,43)">
          {/* Left loop */}
          <path d="M4,0 C1,-5 -4,-5 -2,0 C-4,5 1,5 4,0" fill="#A0845C" />
          {/* Right loop */}
          <path d="M4,0 C7,-5 12,-5 10,0 C12,5 7,5 4,0" fill="#8B7355" />
          {/* Center knot */}
          <ellipse cx="4" cy="0" rx="1.5" ry="1.5" fill="#6B5333" />
          {/* Hanging tails */}
          <path
            d="M2.5,2 C1,6 0,9 -0.5,12"
            stroke="#A0845C"
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M5.5,2 C7,6 8,9 8.5,12"
            stroke="#8B7355"
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* ── LAYER 10: Kraft tag hanging from twine ── */}
        <g>
          {/* String from twine to tag */}
          <path
            d="M100,46 C104,50 108,52 110,56"
            stroke="#A0845C"
            strokeWidth="0.6"
            fill="none"
          />
          {/* Tag body */}
          <g transform="translate(102,54) rotate(-10)">
            <rect x="0" y="0" width="32" height="18" rx="2" fill="#D9B89A" />
            <rect
              x="0"
              y="0"
              width="32"
              height="18"
              rx="2"
              fill="url(#kraftNoise)"
              opacity="0.4"
            />
            {/* Hole */}
            <circle
              cx="5"
              cy="4.5"
              r="2"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.5"
            />
            <circle cx="5" cy="4.5" r="0.8" fill="#D9B89A" />
            {/* String through hole */}
            <path
              d="M5,2.5 C3,0 -2,-4 -4,-6"
              stroke="#A0845C"
              strokeWidth="0.5"
              fill="none"
            />
            <text
              x="16"
              y="13"
              textAnchor="middle"
              fontSize="4"
              fontFamily="var(--font-caveat), cursive"
              fill="#3D2817"
            >
              for {truncName} &#9825;
            </text>
          </g>
        </g>

        {/* ── LAYER 11: Craft accents ── */}
        {/* Tiny clothespin on twine */}
        <g transform="translate(52,38) rotate(-6)">
          <rect x="0" y="0" width="3.5" height="9" rx="0.5" fill="#D4A96A" />
          <rect
            x="0.8"
            y="3.5"
            width="2"
            height="1.8"
            rx="0.3"
            fill="#A0845C"
          />
          <path
            d="M1.75,1.8 C1.2,1.2 0.6,1.4 1.75,2.5 C2.9,1.4 2.3,1.2 1.75,1.8 Z"
            fill="#D81B60"
            opacity="0.6"
          />
        </g>

        {/* One folded paper heart on the desk beside the jar */}
        <g transform="translate(128,158) rotate(18)">
          <AccordionHeartShape size={10} color="#E91E63" />
        </g>
      </svg>

      {/* Tag gentle sway — separate motion for the tag */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          top: '29%',
          right: '6%',
          width: '1px',
          height: '1px',
        }}
        animate={{ rotate: [-11, -9, -11] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}

export { AccordionHeartShape };
