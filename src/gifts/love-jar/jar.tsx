'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const HEART_PINKS = [
  '#D81B60',
  '#E91E63',
  '#C2185B',
  '#AD1457',
  '#E91E63',
] as const;

interface AccordionHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  wobbleDelay: number;
  wobbleDuration: number;
  peeksAbove: boolean;
}

function generateAccordionHearts(count: number): AccordionHeart[] {
  const capped = Math.min(count, 12);
  return Array.from({ length: capped }, (_, i) => {
    const peeks = i >= capped - 2 && capped >= 4;
    return {
      id: i,
      x: 25 + ((i * 31 + 5) % 50),
      y: peeks ? 28 + ((i * 7) % 8) : 62 + ((i * 19 + 3) % 28),
      size: 6 + ((i * 11) % 4),
      rotation: -15 + ((i * 23) % 30),
      color: HEART_PINKS[i % HEART_PINKS.length],
      wobbleDelay: (i * 0.5) % 4,
      wobbleDuration: 3 + ((i * 13) % 20) / 10,
      peeksAbove: peeks,
    };
  });
}

function AccordionHeartSvg({ size, color }: { size: number; color: string }) {
  const s = size;
  const lightPink = '#F06292';
  const darkPink = '#880E4F';

  return (
    <g>
      {/* Main heart shape — slightly imperfect */}
      <path
        d={`M${s * 0.5},${s * 0.9} C${s * 0.15},${s * 0.6} ${-s * 0.02},${s * 0.28} ${s * 0.18},${s * 0.12} C${s * 0.32},0 ${s * 0.44},${s * 0.04} ${s * 0.5},${s * 0.26} C${s * 0.56},${s * 0.04} ${s * 0.68},0 ${s * 0.82},${s * 0.12} C${s * 1.02},${s * 0.28} ${s * 0.85},${s * 0.6} ${s * 0.5},${s * 0.9} Z`}
        fill={color}
      />
      {/* Accordion fold lines — pleat creases */}
      <path
        d={`M${s * 0.3},${s * 0.25} L${s * 0.35},${s * 0.7}`}
        stroke={darkPink}
        strokeWidth="0.4"
        opacity="0.5"
        fill="none"
      />
      <path
        d={`M${s * 0.45},${s * 0.15} L${s * 0.47},${s * 0.75}`}
        stroke={darkPink}
        strokeWidth="0.3"
        opacity="0.4"
        fill="none"
      />
      <path
        d={`M${s * 0.55},${s * 0.15} L${s * 0.53},${s * 0.75}`}
        stroke={darkPink}
        strokeWidth="0.3"
        opacity="0.4"
        fill="none"
      />
      <path
        d={`M${s * 0.7},${s * 0.25} L${s * 0.65},${s * 0.7}`}
        stroke={darkPink}
        strokeWidth="0.4"
        opacity="0.5"
        fill="none"
      />
      {/* Raised pleat highlights */}
      <path
        d={`M${s * 0.37},${s * 0.2} L${s * 0.4},${s * 0.65}`}
        stroke={lightPink}
        strokeWidth="0.5"
        opacity="0.5"
        fill="none"
      />
      <path
        d={`M${s * 0.6},${s * 0.2} L${s * 0.58},${s * 0.65}`}
        stroke={lightPink}
        strokeWidth="0.5"
        opacity="0.5"
        fill="none"
      />
    </g>
  );
}

interface JarProps {
  recipientName: string;
  heartCount: number;
  isShaking: boolean;
  lowMemory: boolean;
}

export function Jar({
  recipientName,
  heartCount,
  isShaking,
  lowMemory,
}: JarProps) {
  const visibleCount = lowMemory ? Math.min(heartCount, 6) : heartCount;
  const hearts = useMemo(
    () => generateAccordionHearts(visibleCount),
    [visibleCount],
  );

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[300px]"
      animate={
        isShaking
          ? {
              rotate: [0, -3, 3, -2, 2, -0.5, 0],
              scaleX: [1, 1.02, 0.98, 1.01, 0.99, 1],
              scaleY: [1, 0.98, 1.02, 0.99, 1.01, 1],
            }
          : { scale: [1, 1.006, 1], rotate: 0 }
      }
      transition={
        isShaking
          ? { duration: 0.6, ease: 'easeOut' }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      }
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="0 0 120 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full"
        style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))' }}
        aria-label={`A hand-painted jar for ${recipientName}`}
      >
        <defs>
          {/* Brush texture filter for the painted heart */}
          <filter
            id="brushTexture"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="4"
              seed="3"
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

          {/* Gesso texture for brush strokes */}
          <filter id="gessoTexture" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              seed="7"
              result="gesso"
            />
            <feComposite in="SourceGraphic" in2="gesso" operator="in" />
          </filter>

          {/* Subtle embossed floral pattern */}
          <pattern
            id="floralEmboss"
            patternUnits="userSpaceOnUse"
            width="16"
            height="16"
          >
            <circle
              cx="8"
              cy="8"
              r="3"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.3"
            />
            <circle cx="8" cy="8" r="1" fill="rgba(255,255,255,0.04)" />
            <path d="M8,5 Q9,7 8,8 Q7,7 8,5" fill="rgba(255,255,255,0.03)" />
            <path d="M5,8 Q7,9 8,8 Q7,7 5,8" fill="rgba(255,255,255,0.03)" />
            <path d="M8,11 Q9,9 8,8 Q7,9 8,11" fill="rgba(255,255,255,0.03)" />
            <path d="M11,8 Q9,9 8,8 Q9,7 11,8" fill="rgba(255,255,255,0.03)" />
          </pattern>

          {/* Kraft paper texture */}
          <pattern
            id="kraftPaper"
            patternUnits="userSpaceOnUse"
            width="4"
            height="4"
          >
            <rect width="4" height="4" fill="none" />
            <circle cx="1" cy="1" r="0.3" fill="rgba(0,0,0,0.08)" />
            <circle cx="3" cy="2.5" r="0.2" fill="rgba(0,0,0,0.06)" />
            <circle cx="0.5" cy="3.5" r="0.15" fill="rgba(0,0,0,0.05)" />
          </pattern>
        </defs>

        {/* Desk surface shadow */}
        <ellipse cx="60" cy="126" rx="40" ry="3.5" fill="rgba(0,0,0,0.08)" />

        {/* === JAR BODY — wide squat shape === */}
        <path
          d="M25,35 C22,38 20,48 20,60 C20,85 21,100 24,108 C27,114 35,118 60,118 C85,118 93,114 96,108 C99,100 100,85 100,60 C100,48 98,38 95,35 Z"
          fill="rgba(230,240,245,0.35)"
          stroke="rgba(180,200,215,0.5)"
          strokeWidth="0.4"
        />

        {/* Embossed floral relief in glass */}
        <path
          d="M25,35 C22,38 20,48 20,60 C20,85 21,100 24,108 C27,114 35,118 60,118 C85,118 93,114 96,108 C99,100 100,85 100,60 C100,48 98,38 95,35 Z"
          fill="url(#floralEmboss)"
        />

        {/* White gesso base coat — visible brush strokes */}
        {/* Left stroke — thicker, imperfect coverage */}
        <path
          d="M28,42 C26,50 25,62 26,80 C27,92 28,100 30,106 C32,110 38,113 48,115"
          stroke="rgba(255,252,248,0.85)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Center fill stroke */}
        <path
          d="M38,38 C37,50 36,65 37,82 C38,95 40,104 44,110 C50,115 58,116 65,116"
          stroke="rgba(255,253,250,0.8)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Right stroke — slightly thinner */}
        <path
          d="M58,36 C60,45 62,58 63,75 C64,90 66,100 70,108 C75,113 82,115 90,112"
          stroke="rgba(255,252,248,0.75)"
          strokeWidth="13"
          fill="none"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Upper fill stroke */}
        <path
          d="M32,40 C45,37 65,36 85,38 C90,39 93,40 95,42"
          stroke="rgba(255,253,250,0.7)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Brush stroke texture overlay — thin lines showing bristle marks */}
        <path
          d="M30,50 L32,100"
          stroke="rgba(220,215,210,0.15)"
          strokeWidth="0.4"
        />
        <path
          d="M35,45 L36,105"
          stroke="rgba(220,215,210,0.12)"
          strokeWidth="0.3"
        />
        <path
          d="M42,42 L43,108"
          stroke="rgba(220,215,210,0.1)"
          strokeWidth="0.3"
        />
        <path
          d="M55,38 L56,110"
          stroke="rgba(220,215,210,0.12)"
          strokeWidth="0.4"
        />
        <path
          d="M68,38 L69,108"
          stroke="rgba(220,215,210,0.1)"
          strokeWidth="0.3"
        />
        <path
          d="M78,40 L79,105"
          stroke="rgba(220,215,210,0.12)"
          strokeWidth="0.3"
        />
        <path
          d="M85,42 L86,100"
          stroke="rgba(220,215,210,0.15)"
          strokeWidth="0.4"
        />

        {/* === HAND-PAINTED HOT-PINK HEART on front === */}
        <g filter="url(#brushTexture)">
          {/* Main heart — imperfect, slightly off-center left */}
          <path
            d="M57,95 C43,82 30,72 30,58 C30,50 35,44 42,44 C48,44 53,48 57,54 C61,48 66,44 72,44 C79,44 84,50 84,58 C84,72 71,82 57,95 Z"
            fill="#D81B60"
          />
          {/* Shadow variation in lower portion */}
          <path
            d="M57,95 C45,84 34,74 32,62 C38,76 50,85 57,92 C64,85 76,76 82,62 C80,74 69,84 57,95 Z"
            fill="#C2185B"
            opacity="0.6"
          />
          {/* Highlight variation — upper left lobe */}
          <path
            d="M42,46 C37,47 33,52 33,57 C33,62 36,66 40,70"
            stroke="#E91E63"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Brushy edge imperfections */}
          <path
            d="M30,58 C29,56 29.5,53 30,51"
            stroke="#D81B60"
            strokeWidth="1.5"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M84,58 C85,55 84.5,52 84,50"
            stroke="#D81B60"
            strokeWidth="1.2"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* Clear glass areas — visible around painted heart, showing inside */}
        {/* Glass rim at top */}
        <path
          d="M25,35 C40,33 80,33 95,35"
          stroke="rgba(200,220,235,0.5)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Glass highlight left */}
        <path
          d="M24,42 C22,55 22,70 23,85 C23,92 24,98 25,102"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Clear glass bottom curve */}
        <path
          d="M30,115 C40,118 80,118 90,115"
          stroke="rgba(200,220,235,0.3)"
          strokeWidth="1"
          fill="none"
        />

        {/* === ACCORDION HEARTS INSIDE (visible through clear portions) === */}
        <g opacity="0.92">
          {hearts.map((heart) => (
            <motion.g
              key={heart.id}
              animate={
                isShaking
                  ? {
                      x: [
                        0,
                        ((heart.id % 3) - 1) * 2.5,
                        ((heart.id % 2) - 0.5) * -2,
                        0,
                      ],
                      y: [0, -1.5, 1, 0],
                    }
                  : { y: [0, -0.8, 0] }
              }
              transition={
                isShaking
                  ? { duration: 0.5, ease: 'easeOut' }
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
              >
                <AccordionHeartSvg size={heart.size} color={heart.color} />
              </g>
            </motion.g>
          ))}
        </g>

        {/* Glass front face — very subtle overlay for depth */}
        <path
          d="M25,35 C22,38 20,48 20,60 C20,85 21,100 24,108 C27,114 35,118 60,118 C85,118 93,114 96,108 C99,100 100,85 100,60 C100,48 98,38 95,35 Z"
          fill="rgba(230,240,250,0.05)"
        />

        {/* === JAR NECK === */}
        <rect
          x="32"
          y="28"
          width="56"
          height="8"
          rx="1"
          fill="rgba(230,240,245,0.3)"
          stroke="rgba(180,200,215,0.4)"
          strokeWidth="0.4"
        />

        {/* Glass rim highlight */}
        <path
          d="M33,28 L87,28"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.8"
        />

        {/* === TWINE around neck === */}
        <path
          d="M30,30 Q60,33 90,30"
          stroke="#8B7355"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M30,31.2 Q60,34.2 90,31.2"
          stroke="#A0845C"
          strokeWidth="0.7"
          fill="none"
          strokeLinecap="round"
        />

        {/* Twine bow — front center */}
        <g transform="translate(56,31)">
          <path
            d="M4,0 C2,-3.5 -2,-3.5 -1,0 C-2,3.5 2,3.5 4,0"
            fill="#A0845C"
          />
          <path d="M4,0 C6,-3.5 10,-3.5 9,0 C10,3.5 6,3.5 4,0" fill="#8B7355" />
          <ellipse cx="4" cy="0" rx="1" ry="1" fill="#6B5333" />
          <path
            d="M2.5,1.5 C1.5,5 0.5,7 0,8.5"
            stroke="#A0845C"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M5.5,1.5 C6.5,5 7.5,7 8,8.5"
            stroke="#8B7355"
            strokeWidth="0.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Tiny wooden clothespin on twine */}
        <g transform="translate(38,26) rotate(-8)">
          <rect x="0" y="0" width="3" height="8" rx="0.5" fill="#D4A96A" />
          <rect
            x="0"
            y="0"
            width="3"
            height="8"
            rx="0.5"
            fill="url(#kraftPaper)"
            opacity="0.5"
          />
          <rect x="0.5" y="3" width="2" height="1.5" rx="0.3" fill="#A0845C" />
          {/* Heart stamp on clothespin */}
          <path
            d="M1.5,1.5 C1,1 0.5,1.2 1.5,2.2 C2.5,1.2 2,1 1.5,1.5 Z"
            fill="#D81B60"
            opacity="0.7"
          />
        </g>

        {/* === KRAFT PAPER TAG === */}
        <g transform="translate(72,32) rotate(12)">
          <rect x="0" y="0" width="26" height="15" rx="1.5" fill="#C9956B" />
          <rect
            x="0"
            y="0"
            width="26"
            height="15"
            rx="1.5"
            fill="url(#kraftPaper)"
            opacity="0.4"
          />
          <circle cx="4" cy="3.5" r="1.5" fill="#8B7355" />
          <text
            x="13"
            y="11"
            textAnchor="middle"
            fontSize="3.5"
            fontFamily="var(--font-caveat), cursive"
            fill="#4A3520"
          >
            for{' '}
            {recipientName.length > 7
              ? recipientName.slice(0, 7) + '…'
              : recipientName}{' '}
            ♡
          </text>
        </g>
      </svg>

      {/* Desk-side accent: one folded heart on the desk */}
      <svg
        viewBox="0 0 20 18"
        width="28"
        height="25"
        className="absolute -right-2 bottom-1 opacity-70"
        style={{ transform: 'rotate(15deg)' }}
      >
        <AccordionHeartSvg size={16} color="#E91E63" />
      </svg>
    </motion.div>
  );
}
