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
      // Bottom 40% of jar interior (jar body y=52..146, bottom 40% = y~108..140)
      x: 38 + ((i * 23 + 5) % 44),
      y: peeks ? 96 + ((i * 5) % 8) : 112 + ((i * 13 + 3) % 24),
      size: 8 + ((i * 11) % 5),
      rotation: -25 + ((i * 31) % 50),
      color: HEART_PINKS[i % HEART_PINKS.length],
      opacity: isBack ? 0.8 : 1,
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
        strokeWidth="0.4"
        opacity="0.5"
      />
      <line
        x1={s * 0.22}
        y1={s * 0.42}
        x2={s * 0.78}
        y2={s * 0.42}
        stroke="#880E4F"
        strokeWidth="0.35"
        opacity="0.45"
      />
      <line
        x1={s * 0.25}
        y1={s * 0.62}
        x2={s * 0.75}
        y2={s * 0.62}
        stroke="#880E4F"
        strokeWidth="0.35"
        opacity="0.4"
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
        viewBox="0 0 160 185"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        aria-label={`A love jar for ${recipientName}`}
      >
        <defs>
          {/* Glass body: radial gradient for cylindrical depth */}
          <radialGradient
            id="jarBodyGrad"
            cx="0.35"
            cy="0.3"
            r="0.65"
            fx="0.3"
            fy="0.25"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="30%" stopColor="rgba(220,238,250,0.35)" />
            <stop offset="60%" stopColor="rgba(200,225,240,0.25)" />
            <stop offset="100%" stopColor="rgba(180,210,230,0.15)" />
          </radialGradient>

          {/* Glass left-side edge glow for curvature */}
          <linearGradient id="jarEdgeLeft" x1="0" y1="0" x2="0.3" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Glass right-side subtle edge */}
          <linearGradient id="jarEdgeRight" x1="1" y1="0" x2="0.7" y2="0">
            <stop offset="0%" stopColor="rgba(200,220,240,0.3)" />
            <stop offset="100%" stopColor="rgba(200,220,240,0)" />
          </linearGradient>

          {/* Interior depth shadow — darker at bottom, fades up */}
          <linearGradient
            id="jarInteriorShadow"
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="1"
          >
            <stop offset="0%" stopColor="rgba(180,200,215,0)" />
            <stop offset="50%" stopColor="rgba(160,185,200,0.06)" />
            <stop offset="100%" stopColor="rgba(120,150,170,0.15)" />
          </linearGradient>

          {/* Specular highlight for upper-left area */}
          <radialGradient id="jarSpecular" cx="0.28" cy="0.18" r="0.35">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Neck glass gradient */}
          <linearGradient id="neckGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(240,248,255,0.5)" />
            <stop offset="100%" stopColor="rgba(220,235,245,0.25)" />
          </linearGradient>

          {/* Brush edge filter for painted heart */}
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
              scale="2.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Gesso brush edge */}
          <filter id="gessoEdge" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.06"
              numOctaves="2"
              seed="12"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <clipPath id="jarInterior">
            <path d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z" />
          </clipPath>

          <clipPath id="jarBody">
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

        {/* ═══ LAYER 1: Floor shadow — stronger for grounding ═══ */}
        <ellipse cx="80" cy="170" rx="52" ry="8" fill="rgba(120,0,55,0.18)" />
        <ellipse cx="80" cy="170" rx="38" ry="5" fill="rgba(120,0,55,0.1)" />

        {/* ═══ LAYER 2: Back half of twine wrap ═══ */}
        <path
          d="M44,46 Q80,51 116,46"
          stroke="#7A6545"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* ═══ LAYER 3: Jar glass body — multi-layer for 3D depth ═══ */}
        {/* Base glass fill with radial gradient */}
        <path
          d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z"
          fill="url(#jarBodyGrad)"
          stroke="rgba(160,185,200,0.5)"
          strokeWidth="1.2"
        />

        {/* Glass edge glow — left side (strongest light catch) */}
        <path
          d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z"
          fill="url(#jarEdgeLeft)"
          clipPath="url(#jarBody)"
        />

        {/* Glass edge — right side (subtle) */}
        <path
          d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z"
          fill="url(#jarEdgeRight)"
          clipPath="url(#jarBody)"
        />

        {/* Specular highlight — upper left hot-spot */}
        <path
          d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z"
          fill="url(#jarSpecular)"
          clipPath="url(#jarBody)"
        />

        {/* ═══ LAYER 4: Inside-jar shading — interior depth ═══ */}
        <path
          d="M42,56 C39,60 37,70 37,84 C37,106 38,124 40,132 C43,138 50,142 80,142 C110,142 117,138 120,132 C122,124 123,106 123,84 C123,70 121,60 118,56 Z"
          fill="url(#jarInteriorShadow)"
        />
        {/* Interior bottom darkening for depth */}
        <ellipse
          cx="80"
          cy="140"
          rx="38"
          ry="12"
          fill="rgba(120,150,170,0.08)"
          clipPath="url(#jarInterior)"
        />

        {/* ═══ LAYER 5: Accordion hearts PILED at bottom 40% ═══ */}
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

        {/* ═══ LAYER 6: White gesso base patch on front face ═══ */}
        <g filter="url(#gessoEdge)">
          <ellipse
            cx="80"
            cy="105"
            rx="28"
            ry="32"
            fill="#FFF8F0"
            opacity="0.95"
            transform="rotate(-2 80 105)"
          />
        </g>
        {/* Extra gesso layers for brushy overlap */}
        <ellipse
          cx="79"
          cy="104"
          rx="25"
          ry="29"
          fill="#FFFCF6"
          opacity="0.6"
          transform="rotate(4 79 104)"
        />
        <ellipse
          cx="81"
          cy="106"
          rx="23"
          ry="27"
          fill="#FFF8F0"
          opacity="0.4"
          transform="rotate(-3 81 106)"
        />

        {/* ═══ LAYER 7: Painted magenta heart (visual hero) ═══ */}
        <g filter="url(#brushEdge)">
          {/* Main heart — intentionally asymmetric left curves differ from right */}
          <path
            d="M80,132 C63,117 44,106 44,89 C44,79 51,72 59,72 C66,72 73,77 80,86 C87,77 94,72 101,72 C109,72 116,79 116,89 C116,106 97,117 80,132 Z"
            fill="#D81B60"
          />
          {/* Darker depth overlay — lower portion */}
          <path
            d="M80,132 C65,119 48,108 46,93 C54,108 69,119 80,128 C91,119 106,108 114,93 C112,108 95,119 80,132 Z"
            fill="#AD1457"
            opacity="0.35"
          />
          {/* Mid-tone for dimension */}
          <path
            d="M59,74 C53,78 48,85 48,91 C48,96 50,100 55,106"
            stroke="#B0184F"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            opacity="0.2"
          />
          {/* Brush stroke lines for hand-painted texture */}
          <path
            d="M58,76 C54,80 49,87 49,91"
            stroke="#7A0F3A"
            strokeWidth="1.8"
            fill="none"
            opacity="0.25"
            strokeLinecap="round"
          />
          <path
            d="M70,78 L68,115"
            stroke="#7A0F3A"
            strokeWidth="1"
            fill="none"
            opacity="0.18"
          />
          <path
            d="M80,76 L80,120"
            stroke="#7A0F3A"
            strokeWidth="0.6"
            fill="none"
            opacity="0.12"
          />
          <path
            d="M90,78 L92,115"
            stroke="#7A0F3A"
            strokeWidth="0.8"
            fill="none"
            opacity="0.15"
          />
          <path
            d="M102,76 C106,80 111,87 111,91"
            stroke="#7A0F3A"
            strokeWidth="1.4"
            fill="none"
            opacity="0.2"
            strokeLinecap="round"
          />
          {/* Upper-left specular highlight on heart */}
          <ellipse
            cx="61"
            cy="82"
            rx="8"
            ry="5"
            fill="#FF7BA0"
            opacity="0.35"
            transform="rotate(-25 61 82)"
          />
          {/* Smaller secondary highlight */}
          <ellipse
            cx="65"
            cy="86"
            rx="4"
            ry="2.5"
            fill="#FF9EB5"
            opacity="0.25"
            transform="rotate(-20 65 86)"
          />
        </g>

        {/* ═══ LAYER 8: Glass highlights — multiple for 3D curvature ═══ */}
        {/* Primary left-edge highlight */}
        <path
          d="M35,56 C33,70 33,90 34,112 C34,122 35,130 36,136"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Secondary inner left highlight */}
        <path
          d="M38,60 C37,72 36,88 37,108 C37,118 38,126 39,132"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Right edge subtle highlight */}
        <path
          d="M125,58 C126,72 127,90 126,112 C126,122 125,130 124,136"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Bottom rim light catch */}
        <path
          d="M42,143 C55,146 105,146 118,143"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        {/* Top body rim light */}
        <path
          d="M40,53 C55,51 105,51 120,53"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Glass body outer stroke for definition */}
        <path
          d="M38,52 C34,56 32,68 32,82 C32,108 33,128 36,136 C39,142 48,146 80,146 C112,146 121,142 124,136 C127,128 128,108 128,82 C128,68 126,56 122,52 Z"
          fill="none"
          stroke="rgba(150,180,200,0.35)"
          strokeWidth="0.8"
        />

        {/* ═══ Jar neck with 3D glass treatment ═══ */}
        <rect
          x="48"
          y="38"
          width="64"
          height="15"
          rx="2"
          fill="url(#neckGlass)"
          stroke="rgba(160,185,200,0.4)"
          strokeWidth="0.6"
        />
        {/* Neck top rim highlight */}
        <path
          d="M50,38 L110,38"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.2"
        />
        {/* Neck bottom edge shadow */}
        <path
          d="M50,53 L110,53"
          stroke="rgba(140,165,180,0.2)"
          strokeWidth="0.6"
        />
        {/* Neck left highlight */}
        <rect
          x="49"
          y="39"
          width="3"
          height="13"
          rx="1"
          fill="rgba(255,255,255,0.3)"
        />

        {/* ═══ LAYER 9: Front half of twine + bow ═══ */}
        <path
          d="M44,46 Q80,42 116,46"
          stroke="#B8956A"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Twine highlight strand */}
        <path
          d="M44,45.5 Q80,41.5 116,45.5"
          stroke="#CBAB7D"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Twine shadow strand */}
        <path
          d="M44,47.5 Q80,43.5 116,47.5"
          stroke="#7A6545"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Bow at center */}
        <g transform="translate(76,43)">
          <path d="M4,0 C1,-6 -5,-6 -2,0 C-5,6 1,6 4,0" fill="#B8956A" />
          <path d="M4,0 C7,-6 13,-6 10,0 C13,6 7,6 4,0" fill="#A0845C" />
          {/* Bow highlight */}
          <path
            d="M1,0 C0,-3 -2,-4 -1,-1"
            stroke="#CBAB7D"
            strokeWidth="0.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M7,0 C8,-3 10,-4 9,-1"
            stroke="#CBAB7D"
            strokeWidth="0.5"
            fill="none"
            opacity="0.5"
          />
          <ellipse cx="4" cy="0" rx="1.8" ry="1.8" fill="#6B5333" />
          <ellipse
            cx="3.5"
            cy="-0.5"
            rx="0.8"
            ry="0.6"
            fill="#8B7355"
            opacity="0.5"
          />
          {/* Hanging tails */}
          <path
            d="M2,2 C0.5,7 -0.5,10 -1,14"
            stroke="#A0845C"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M6,2 C7.5,7 8.5,10 9,14"
            stroke="#8B7355"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* ═══ LAYER 10: Kraft tag hanging from twine ═══ */}
        <g>
          {/* String from twine to tag */}
          <path
            d="M102,46 C106,50 110,54 112,58"
            stroke="#A0845C"
            strokeWidth="0.7"
            fill="none"
          />
          {/* Tag body */}
          <g transform="translate(104,56) rotate(-10)">
            <rect x="0" y="0" width="34" height="20" rx="2" fill="#D9B89A" />
            <rect
              x="0"
              y="0"
              width="34"
              height="20"
              rx="2"
              fill="url(#kraftNoise)"
              opacity="0.5"
            />
            {/* Tag shadow */}
            <rect
              x="1"
              y="1"
              width="34"
              height="20"
              rx="2"
              fill="rgba(0,0,0,0.05)"
            />
            {/* Hole */}
            <circle
              cx="5"
              cy="5"
              r="2.2"
              fill="none"
              stroke="#8B7355"
              strokeWidth="0.6"
            />
            <circle cx="5" cy="5" r="1" fill="rgba(255,240,245,0.5)" />
            {/* String through hole */}
            <path
              d="M5,2.8 C3,-1 -2,-5 -4,-8"
              stroke="#A0845C"
              strokeWidth="0.6"
              fill="none"
            />
            <text
              x="18"
              y="14.5"
              textAnchor="middle"
              fontSize="4.5"
              fontFamily="var(--font-caveat), cursive"
              fill="#3D2817"
            >
              for {truncName} &#9825;
            </text>
          </g>
        </g>

        {/* ═══ LAYER 11: Craft accents ═══ */}
        {/* Tiny clothespin on twine */}
        <g transform="translate(54,36) rotate(-8)">
          <rect x="0" y="0" width="4" height="10" rx="0.6" fill="#D4A96A" />
          <rect
            x="0"
            y="0"
            width="4"
            height="10"
            rx="0.6"
            fill="none"
            stroke="#B89060"
            strokeWidth="0.3"
          />
          <rect x="0.8" y="4" width="2.4" height="2" rx="0.4" fill="#A0845C" />
          <path
            d="M2,2 C1.3,1.2 0.6,1.4 2,3 C3.4,1.4 2.7,1.2 2,2 Z"
            fill="#D81B60"
            opacity="0.65"
          />
        </g>

        {/* One folded paper heart on the desk beside the jar */}
        <g transform="translate(130,160) rotate(18)" opacity="0.75">
          <AccordionHeartShape size={11} color="#E91E63" />
        </g>
      </svg>
    </motion.div>
  );
}

export { AccordionHeartShape };
