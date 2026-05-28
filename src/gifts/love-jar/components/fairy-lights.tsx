'use client';

import { useMemo } from 'react';

interface FairyLight {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const COLORS = [
  'rgba(255, 244, 200, 0.9)',
  'rgba(255, 220, 180, 0.85)',
  'rgba(255, 200, 220, 0.8)',
  'rgba(255, 230, 200, 0.85)',
];

interface FairyLightsProps {
  count?: number;
}

export function FairyLights({ count = 18 }: FairyLightsProps) {
  const lights = useMemo<FairyLight[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (i / (count - 1)) * 100,
      y: 6 + Math.sin((i / count) * Math.PI * 2.5) * 4,
      size: 3 + Math.random() * 2,
      delay: i * 0.3 + Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      color: COLORS[i % COLORS.length],
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {/* Wire */}
      <svg
        className="absolute left-0 top-[4%] h-[12%] w-full"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d={`M0,6 ${lights.map((l) => `Q${l.x - 2},${l.y + 2} ${l.x},${l.y}`).join(' ')}`}
          stroke="rgba(80, 60, 40, 0.25)"
          strokeWidth="0.3"
          fill="none"
        />
      </svg>

      {/* Bulbs */}
      {lights.map((light, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${light.x}%`,
            top: `${light.y + 2}%`,
            width: light.size,
            height: light.size,
            background: light.color,
            boxShadow: `0 0 ${light.size * 2}px ${light.size}px ${light.color}`,
            animation: `fairy-twinkle ${light.duration}s ease-in-out ${light.delay}s infinite`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
