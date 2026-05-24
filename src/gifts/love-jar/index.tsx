'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JarSvg } from './jar-svg';
import { HeartNote } from './heart-note';
import { TitlebarButtons } from '@/components/win98-chrome';
import { useGiftContext } from '@/components/gift-frame/gift-frame';
import { DEFAULT_PALETTE, type JarPalette } from './love-jar.config';

interface LoveJarProps {
  recipientName: string;
  messages: string[];
  palette?: JarPalette;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 10 + ((i * 37 + 13) % 80),
    y: 10 + ((i * 53 + 7) % 70),
    delay: (i * 2.1) % 6,
    duration: 4 + ((i * 7) % 3),
  }));
}

export function LoveJar({
  recipientName,
  messages,
  palette = DEFAULT_PALETTE,
}: LoveJarProps) {
  const { onClimax, trackInteraction } = useGiftContext();
  const [isShaking, setIsShaking] = useState(false);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [risingHeart, setRisingHeart] = useState(false);
  const [notesRead, setNotesRead] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasClimaxed = useRef(false);

  const lowMemory = useMemo(() => {
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      return (navigator as { deviceMemory?: number }).deviceMemory! < 4;
    }
    return false;
  }, []);

  const sparkles = useMemo(
    () => generateSparkles(lowMemory ? 2 : 3),
    [lowMemory],
  );
  const heartCount = messages.length;

  const pickRandomNote = useCallback(() => {
    return Math.floor(Math.random() * messages.length);
  }, [messages.length]);

  const handleShake = useCallback(() => {
    if (isShaking || activeNote !== null) return;

    if (!hasInteracted) setHasInteracted(true);
    setIsShaking(true);
    trackInteraction('jar_shake');

    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false);
      setRisingHeart(true);

      setTimeout(() => {
        setRisingHeart(false);
        const noteIdx = pickRandomNote();
        setActiveNote(noteIdx);
        setNotesRead((n) => n + 1);

        if (!hasClimaxed.current) {
          hasClimaxed.current = true;
          onClimax();
        }
      }, 800);
    }, 600);
  }, [
    isShaking,
    activeNote,
    hasInteracted,
    trackInteraction,
    pickRandomNote,
    onClimax,
  ]);

  const handleCloseNote = useCallback(() => {
    setActiveNote(null);
    trackInteraction('note_closed', { notesRead });
  }, [trackInteraction, notesRead]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;
    let lastTime = Date.now();

    const handleMotion = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

      const now = Date.now();
      const dt = now - lastTime;
      if (dt < 100) return;

      const dx = acc.x - lastX;
      const dy = acc.y - lastY;
      const dz = acc.z - lastZ;
      const force = Math.sqrt(dx * dx + dy * dy + dz * dz) / (dt / 1000);

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
      lastTime = now;

      if (force > 800) handleShake();
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [handleShake]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="love-jar-scene relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden p-3 sm:p-6"
      style={{ background: '#c8a2e8' }}
    >
      {/* Win98 LOVE_JAR.exe window */}
      <div className="win98-window w-full max-w-md">
        <div
          className="win98-titlebar"
          style={{
            background: 'linear-gradient(90deg, #780037, #B43F75)',
          }}
        >
          <span className="truncate font-pixel text-sm font-bold text-white">
            💕 LOVE_JAR.exe — for {recipientName}
          </span>
          <TitlebarButtons />
        </div>

        <div
          className="win98-body relative overflow-hidden"
          onClick={handleShake}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') handleShake();
          }}
          aria-label="Tap the jar to reveal a love note"
          style={{ minHeight: '420px', padding: 0 }}
        >
          {/* Pink gingham background */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(45deg, rgba(255,182,210,0.25) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(255,182,210,0.25) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, rgba(255,182,210,0.25) 75%),
                linear-gradient(-45deg, transparent 75%, rgba(255,182,210,0.25) 75%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              backgroundColor: '#FFF0F5',
            }}
          />

          {/* Sparkle particles */}
          {sparkles.map((s) => (
            <div
              key={s.id}
              className="love-jar-sparkle-drift pointer-events-none absolute"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-4 py-6">
            {/* Instruction text */}
            <AnimatePresence>
              {!hasInteracted && (
                <motion.p
                  className="mb-4 font-handwritten text-[22px] text-[#780037]"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  tap the jar ✨
                </motion.p>
              )}
            </AnimatePresence>

            {hasInteracted && <div className="mb-4 h-[33px]" />}

            {/* The Jar */}
            <div className="relative w-full max-w-[220px]">
              <JarSvg
                recipientName={recipientName}
                heartCount={heartCount}
                isShaking={isShaking}
                lowMemory={lowMemory}
                palette={palette}
              />

              {/* Rising heart — appears at the rim and floats upward */}
              <AnimatePresence>
                {risingHeart && (
                  <motion.div
                    className="pointer-events-none absolute left-1/2 z-20"
                    initial={{
                      opacity: 0,
                      y: 0,
                      x: '-50%',
                      scale: 0.6,
                      rotateY: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 1, 0.9],
                      y: -120,
                      x: '-50%',
                      scale: [0.6, 1, 1.8, 2.5],
                      rotateY: 360,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      top: '16%',
                      willChange: 'transform, opacity',
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 10 10"
                      fill={palette.body}
                    >
                      <path d="M5,8.5 C3,6.5 0.5,5 0.5,3 C0.5,1.5 2,0.5 3.5,1.5 C4.2,2 4.7,2.5 5,3 C5.3,2.5 5.8,2 6.5,1.5 C8,0.5 9.5,1.5 9.5,3 C9.5,5 7,6.5 5,8.5 Z" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div
          className="flex items-center justify-between px-3 py-1"
          style={{
            background: 'var(--win-chrome)',
            border: '2px solid',
            borderColor:
              'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
          }}
        >
          <span className="font-pixel text-xs text-black/70">
            ♥ {heartCount} hearts inside
          </span>
          <span className="love-jar-live-pulse font-pixel text-xs text-[#D81B60]">
            ♥ LIVE
          </span>
        </div>
      </div>

      {/* Heart note overlay */}
      <HeartNote
        message={activeNote !== null ? messages[activeNote] : ''}
        visible={activeNote !== null}
        onClose={handleCloseNote}
        noteIndex={activeNote ?? 0}
      />
    </div>
  );
}

export { loveJarMeta } from './love-jar.config';
