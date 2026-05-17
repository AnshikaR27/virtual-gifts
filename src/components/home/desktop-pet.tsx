'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

function MochiSprite({
  isKissing,
  isBlinking,
}: {
  isKissing: boolean;
  isBlinking: boolean;
}) {
  return (
    <svg
      viewBox="0 0 18 20"
      className="desktop-pet-sprite"
      shapeRendering="crispEdges"
      fill="none"
    >
      {/* Wing buds */}
      <rect x="3" y="0" width="2" height="1" fill="#FFF0F8" />
      <rect x="4" y="1" width="1" height="1" fill="#FFE0EF" />
      <rect x="13" y="0" width="2" height="1" fill="#FFF0F8" />
      <rect x="13" y="1" width="1" height="1" fill="#FFE0EF" />

      {/* Body outline */}
      <rect x="5" y="2" width="8" height="1" fill="#CC6699" />
      <rect x="4" y="3" width="1" height="1" fill="#CC6699" />
      <rect x="13" y="3" width="1" height="1" fill="#CC6699" />
      <rect x="3" y="4" width="1" height="10" fill="#CC6699" />
      <rect x="14" y="4" width="1" height="10" fill="#CC6699" />
      <rect x="4" y="14" width="1" height="1" fill="#CC6699" />
      <rect x="13" y="14" width="1" height="1" fill="#CC6699" />
      <rect x="5" y="15" width="8" height="1" fill="#CC6699" />

      {/* Body fill */}
      <rect x="5" y="3" width="8" height="1" fill="#FFD6EC" />
      <rect x="4" y="4" width="10" height="10" fill="#FFD6EC" />
      <rect x="5" y="14" width="8" height="1" fill="#FFD6EC" />

      {/* Highlight pixel (shine) */}
      <rect x="5" y="4" width="2" height="1" fill="#FFF0F8" />
      <rect x="5" y="5" width="1" height="1" fill="#FFF0F8" />

      {/* Eyes */}
      {isBlinking ? (
        <>
          <rect x="6" y="8" width="2" height="1" fill="#1A0A2E" />
          <rect x="10" y="8" width="2" height="1" fill="#1A0A2E" />
        </>
      ) : (
        <>
          <rect x="6" y="7" width="2" height="2" fill="#1A0A2E" />
          <rect x="10" y="7" width="2" height="2" fill="#1A0A2E" />
          {/* Eye shine */}
          <rect x="6" y="7" width="1" height="1" fill="#4A2A5E" />
          <rect x="10" y="7" width="1" height="1" fill="#4A2A5E" />
        </>
      )}

      {/* Rosy cheeks */}
      <rect x="5" y="10" width="2" height="1" fill="#FF8FAB" />
      <rect x="11" y="10" width="2" height="1" fill="#FF8FAB" />

      {/* Mouth — smile or pucker */}
      {isKissing ? (
        <>
          <rect x="8" y="11" width="2" height="2" fill="#CC6699" />
          <rect x="9" y="11" width="1" height="1" fill="#FFD6EC" />
        </>
      ) : (
        <>
          <rect x="7" y="12" width="1" height="1" fill="#CC6699" />
          <rect x="8" y="13" width="2" height="1" fill="#CC6699" />
          <rect x="10" y="12" width="1" height="1" fill="#CC6699" />
        </>
      )}

      {/* Arms */}
      <rect x="2" y="10" width="1" height="2" fill="#FFD6EC" />
      <rect x="2" y="10" width="1" height="1" fill="#CC6699" />
      <rect x="15" y="10" width="1" height="2" fill="#FFD6EC" />
      <rect x="15" y="10" width="1" height="1" fill="#CC6699" />

      {/* Feet */}
      <rect x="6" y="16" width="2" height="1" fill="#FFB8D4" />
      <rect x="10" y="16" width="2" height="1" fill="#FFB8D4" />
    </svg>
  );
}

function PixelHeart({
  style,
  onEnd,
}: {
  style: React.CSSProperties;
  onEnd: () => void;
}) {
  return (
    <svg
      viewBox="0 0 7 7"
      className="desktop-pet-heart"
      style={style}
      shapeRendering="crispEdges"
      onAnimationEnd={onEnd}
    >
      {/* Outline */}
      <rect x="1" y="0" width="2" height="1" fill="#CC1177" />
      <rect x="4" y="0" width="2" height="1" fill="#CC1177" />
      <rect x="0" y="1" width="1" height="2" fill="#CC1177" />
      <rect x="3" y="1" width="1" height="1" fill="#CC1177" />
      <rect x="6" y="1" width="1" height="2" fill="#CC1177" />
      <rect x="0" y="3" width="1" height="1" fill="#CC1177" />
      <rect x="6" y="3" width="1" height="1" fill="#CC1177" />
      <rect x="1" y="4" width="1" height="1" fill="#CC1177" />
      <rect x="5" y="4" width="1" height="1" fill="#CC1177" />
      <rect x="2" y="5" width="1" height="1" fill="#CC1177" />
      <rect x="4" y="5" width="1" height="1" fill="#CC1177" />
      <rect x="3" y="6" width="1" height="1" fill="#CC1177" />

      {/* Fill */}
      <rect x="1" y="1" width="2" height="1" fill="#FF1493" />
      <rect x="4" y="1" width="2" height="1" fill="#FF1493" />
      <rect x="1" y="2" width="5" height="1" fill="#FF1493" />
      <rect x="1" y="3" width="5" height="1" fill="#FF1493" />
      <rect x="2" y="4" width="3" height="1" fill="#FF1493" />
      <rect x="3" y="5" width="1" height="1" fill="#FF1493" />

      {/* Shine pixel */}
      <rect x="1" y="1" width="1" height="1" fill="#FF69B4" />
    </svg>
  );
}

interface HeartData {
  id: number;
  offsetX: number;
  delay: number;
  duration: number;
  drift: number;
}

export function DesktopPet() {
  const playgroundRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState(0);
  const [isKissing, setIsKissing] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [hearts, setHearts] = useState<HeartData[]>([]);
  const heartIdRef = useRef(0);
  const prevPctRef = useRef({ x: 50, y: 50 });

  const calcPixelPos = useCallback((xPct: number, yPct: number) => {
    const el = playgroundRef.current;
    if (!el) return { x: 0, y: 0 };
    const petW = window.innerWidth < 768 ? 42 : 55;
    const petH = petW;
    const maxX = el.clientWidth - petW;
    const maxY = el.clientHeight - petH;
    return {
      x: Math.round((xPct / 100) * maxX),
      y: Math.round((yPct / 100) * maxY),
    };
  }, []);

  useEffect(() => {
    const initial = calcPixelPos(50, 50);
    setPos(initial);
    setMounted(true);
  }, [calcPixelPos]);

  const drift = useCallback(() => {
    const newXPct = 10 + Math.random() * 80;
    const newYPct = 20 + Math.random() * 50;
    const dx = newXPct - prevPctRef.current.x;
    const lean = Math.max(-3, Math.min(3, dx * 0.1));
    setTilt(lean);
    const px = calcPixelPos(newXPct, newYPct);
    setPos(px);
    prevPctRef.current = { x: newXPct, y: newYPct };
    setTimeout(() => setTilt(0), 3500);
  }, [calcPixelPos]);

  const blowKiss = useCallback(() => {
    setIsKissing(true);
    const count = 2 + Math.floor(Math.random() * 3);
    const newHearts: HeartData[] = [];
    for (let i = 0; i < count; i++) {
      newHearts.push({
        id: ++heartIdRef.current,
        offsetX: -8 + Math.random() * 16,
        delay: i * 130,
        duration: 2000 + Math.random() * 800,
        drift: -12 + Math.random() * 24,
      });
    }
    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => setIsKissing(false), 400);
  }, []);

  const removeHeart = useCallback((id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // Drift timer: 6-10s
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 6000 + Math.random() * 4000;
      return setTimeout(() => {
        drift();
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [drift]);

  // Kiss timer: 12-15s
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 12000 + Math.random() * 3000;
      return setTimeout(() => {
        blowKiss();
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [blowKiss]);

  // Blink timer: 5-7s
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 2000;
      return setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
        timerId = scheduleNext();
      }, delay);
    };
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div
      className="desktop-pet-playground"
      ref={playgroundRef}
      aria-hidden="true"
    >
      <div
        className="desktop-pet-mover"
        style={
          mounted
            ? {
                transform: `translate(${pos.x}px, ${pos.y}px)`,
              }
            : {
                transform: 'translate(-100px, -100px)',
                opacity: 0,
              }
        }
      >
        <div
          className="desktop-pet-tilter"
          style={{ transform: `rotate(${tilt}deg)` }}
        >
          <div className="desktop-pet-bobber">
            <MochiSprite isKissing={isKissing} isBlinking={isBlinking} />
          </div>
        </div>

        {hearts.map((heart) => (
          <PixelHeart
            key={heart.id}
            style={
              {
                '--heart-drift': `${heart.drift}px`,
                '--heart-delay': `${heart.delay}ms`,
                '--heart-duration': `${heart.duration}ms`,
                left: `calc(50% + ${heart.offsetX}px)`,
              } as React.CSSProperties
            }
            onEnd={() => removeHeart(heart.id)}
          />
        ))}
      </div>
    </div>
  );
}
