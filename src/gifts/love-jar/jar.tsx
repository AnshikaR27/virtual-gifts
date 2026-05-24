'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

const HEART_COLORS = [
  '#FFC4D6', // blush
  '#FFD3B6', // peach
  '#E0BBE4', // lavender
  '#FFF5BA', // butter
  '#C7E9C0', // mint
  '#FFB5A7', // coral
] as const;

interface HeartData {
  id: number;
  cx: number;
  cy: number;
  size: number;
  rotation: number;
  color: string;
  bobDelay: number;
  bobDuration: number;
}

function generateHearts(count: number): HeartData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: 18 + ((i * 37 + 11) % 64),
    cy: 42 + ((i * 23 + 7) % 38),
    size: 7 + ((i * 13) % 5),
    rotation: -15 + ((i * 17) % 30),
    color: HEART_COLORS[i % HEART_COLORS.length],
    bobDelay: (i * 0.4) % 3,
    bobDuration: 2.2 + ((i * 7) % 18) / 10,
  }));
}

function HeartPath({ size }: { size: number }) {
  const s = size;
  const wobble = ((s * 7) % 3) - 1;
  return (
    <path
      d={`M${s / 2},${s * 0.85} C${s * 0.15 + wobble},${s * 0.55} ${-s * 0.05},${s * 0.25} ${s * 0.15},${s * 0.12} C${s * 0.3},0 ${s * 0.45},${s * 0.05} ${s / 2},${s * 0.28} C${s * 0.55},${s * 0.05} ${s * 0.7},0 ${s * 0.85},${s * 0.12} C${s * 1.05},${s * 0.25} ${s * 0.85 - wobble},${s * 0.55} ${s / 2},${s * 0.85} Z`}
      fill="currentColor"
    />
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
  const hearts = useMemo(() => generateHearts(visibleCount), [visibleCount]);

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[280px]"
      animate={
        isShaking
          ? {
              rotate: [0, -4, 4, -3, 3, -1, 0],
              scaleX: [1, 1.03, 0.97, 1.02, 0.98, 1],
              scaleY: [1, 0.97, 1.03, 0.98, 1.02, 1],
            }
          : { scale: [1, 1.008, 1], rotate: 0 }
      }
      transition={
        isShaking
          ? { duration: 0.6, ease: 'easeOut' }
          : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      }
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full drop-shadow-lg"
        aria-label={`A glass jar for ${recipientName}`}
      >
        {/* Drop shadow ellipse on surface */}
        <ellipse cx="50" cy="136" rx="32" ry="3" fill="rgba(0,0,0,0.08)" />

        {/* Jar body — glass with blue tint */}
        <path
          d="M22,38 C20,40 18,50 18,65 C18,95 20,115 22,120 C24,125 30,128 50,128 C70,128 76,125 78,120 C80,115 82,95 82,65 C82,50 80,40 78,38 Z"
          fill="rgba(200,225,240,0.25)"
          stroke="rgba(150,190,215,0.4)"
          strokeWidth="0.5"
        />

        {/* Inner shadow (right side for depth) */}
        <path
          d="M72,42 C76,52 78,70 77,100 C76,115 74,122 70,125"
          stroke="rgba(100,140,170,0.15)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Glass highlight (left edge) */}
        <path
          d="M26,45 C24,55 23,70 24,95 C24,105 25,112 26,116"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Secondary highlight */}
        <path
          d="M30,48 C29,55 28,65 29,80"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Hearts inside jar */}
        <g opacity="0.88">
          {hearts.map((heart) => (
            <motion.g
              key={heart.id}
              animate={
                isShaking
                  ? {
                      x: [
                        0,
                        ((heart.id % 3) - 1) * 3,
                        ((heart.id % 2) - 0.5) * -2,
                        0,
                      ],
                      y: [0, -2, 1, 0],
                    }
                  : {
                      y: [0, -1.5, 0],
                    }
              }
              transition={
                isShaking
                  ? { duration: 0.5, ease: 'easeOut' }
                  : {
                      duration: heart.bobDuration,
                      delay: heart.bobDelay,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
              style={{ willChange: 'transform' }}
            >
              <g
                transform={`translate(${heart.cx - heart.size / 2},${heart.cy - heart.size / 2}) rotate(${heart.rotation} ${heart.size / 2} ${heart.size / 2})`}
                style={{ color: heart.color }}
              >
                <HeartPath size={heart.size} />
              </g>
            </motion.g>
          ))}
        </g>

        {/* Glass front face overlay (slight dim for depth) */}
        <path
          d="M22,38 C20,40 18,50 18,65 C18,95 20,115 22,120 C24,125 30,128 50,128 C70,128 76,125 78,120 C80,115 82,95 82,65 C82,50 80,40 78,38 Z"
          fill="rgba(200,225,240,0.08)"
        />

        {/* Jar neck */}
        <rect
          x="30"
          y="30"
          width="40"
          height="10"
          rx="1"
          fill="rgba(200,225,240,0.2)"
          stroke="rgba(150,190,215,0.3)"
          strokeWidth="0.5"
        />

        {/* Gingham lid */}
        <rect x="26" y="22" width="48" height="10" rx="3" fill="#E85555" />
        {/* Gingham check pattern */}
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={`check-${i}`}
            x={26 + (i % 12) * 4}
            y={22 + (i < 6 ? 0 : 5)}
            width="4"
            height="5"
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.45)' : 'transparent'}
          />
        ))}
        {/* Lid top curve */}
        <path
          d="M26,24 Q50,18 74,24"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Twine around neck */}
        <path
          d="M28,32 Q50,35 72,32"
          stroke="#A0845C"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M28,33.5 Q50,36.5 72,33.5"
          stroke="#8B7355"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* Twine bow */}
        <g transform="translate(46,33)">
          <path d="M4,0 C2,-3 -1,-3 0,0 C-1,3 2,3 4,0" fill="#A0845C" />
          <path d="M4,0 C6,-3 9,-3 8,0 C9,3 6,3 4,0" fill="#8B7355" />
          <ellipse cx="4" cy="0" rx="0.8" ry="0.8" fill="#6B5333" />
          {/* Trailing twine ends */}
          <path
            d="M3,1 C2,4 1,6 0.5,7"
            stroke="#A0845C"
            strokeWidth="0.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M5,1 C6,4 7,5 7.5,7"
            stroke="#8B7355"
            strokeWidth="0.6"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Kraft paper tag */}
        <g transform="translate(55,35) rotate(8)">
          <rect x="0" y="0" width="22" height="14" rx="1.5" fill="#D4A96A" />
          <rect
            x="0"
            y="0"
            width="22"
            height="14"
            rx="1.5"
            fill="url(#kraftGrain)"
            opacity="0.3"
          />
          {/* Hole for twine */}
          <circle cx="4" cy="3" r="1.2" fill="#8B7355" />
          {/* Tag text */}
          <text
            x="11"
            y="10"
            textAnchor="middle"
            fontSize="3.2"
            fontFamily="var(--font-caveat), cursive"
            fill="#4A3520"
          >
            for{' '}
            {recipientName.length > 8
              ? recipientName.slice(0, 8) + '…'
              : recipientName}{' '}
            ♡
          </text>
        </g>

        {/* Kraft texture pattern def */}
        <defs>
          <pattern
            id="kraftGrain"
            patternUnits="userSpaceOnUse"
            width="4"
            height="4"
          >
            <rect width="4" height="4" fill="none" />
            <circle cx="1" cy="1" r="0.3" fill="rgba(0,0,0,0.1)" />
            <circle cx="3" cy="3" r="0.2" fill="rgba(0,0,0,0.08)" />
            <circle cx="2" cy="0.5" r="0.15" fill="rgba(0,0,0,0.06)" />
          </pattern>
        </defs>
      </svg>
    </motion.div>
  );
}
