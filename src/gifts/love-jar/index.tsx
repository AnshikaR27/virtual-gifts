'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Jar } from './jar';
import { HeartNote } from './heart-note';
import { useGiftContext } from '@/components/gift-frame/gift-frame';

interface LoveJarProps {
  recipientName: string;
  messages: string[];
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 5 + ((i * 37 + 13) % 90),
    y: 5 + ((i * 53 + 7) % 85),
    size: 2 + ((i * 11) % 3),
    delay: (i * 1.7) % 5,
    duration: 3 + ((i * 7) % 4),
  }));
}

export function LoveJar({ recipientName, messages }: LoveJarProps) {
  const { onClimax, trackInteraction } = useGiftContext();
  const [isShaking, setIsShaking] = useState(false);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [risingHeart, setRisingHeart] = useState(false);
  const [notesRead, setNotesRead] = useState(0);
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
    const available = messages.length;
    return Math.floor(Math.random() * available);
  }, [messages.length]);

  const handleShake = useCallback(() => {
    if (isShaking || activeNote !== null) return;

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
  }, [isShaking, activeNote, trackInteraction, pickRandomNote, onClimax]);

  const handleCloseNote = useCallback(() => {
    setActiveNote(null);
    trackInteraction('note_closed', { notesRead });
  }, [trackInteraction, notesRead]);

  // Accelerometer shake detection
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

      if (force > 800) {
        handleShake();
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [handleShake]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className="love-jar-scene relative flex h-full min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden"
      onClick={handleShake}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') handleShake();
      }}
      aria-label="Tap the jar to reveal a love note"
    >
      {/* Background — warm off-white desk surface with soft lamp lighting */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, #FFFDF8 0%, #FDF9F3 40%, #FAF6F0 70%, #F7F2EB 100%)',
        }}
      />

      {/* Warm desk-lamp glow from upper-left */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-1/2 w-1/2 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 20% 15%, rgba(255,220,160,0.4), transparent 70%)',
        }}
      />

      {/* Faint cutting-mat grid texture in corner */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,80,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,80,0,1) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Magenta paper edge accent — peeking from right */}
      <div
        className="pointer-events-none absolute -right-1 top-1/3 h-24 w-3 rounded-l-sm opacity-40"
        style={{ background: 'linear-gradient(180deg, #D81B60, #C2185B)' }}
      />

      {/* Warm floating dust motes */}
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="love-jar-sparkle absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background:
              'radial-gradient(circle, rgba(255,200,100,0.7), rgba(255,200,100,0))',
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -15, -30],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* The Jar */}
      <div className="relative z-10 w-full max-w-xs px-4">
        <Jar
          recipientName={recipientName}
          heartCount={heartCount}
          isShaking={isShaking}
          lowMemory={lowMemory}
        />

        {/* Rising heart animation */}
        <AnimatePresence>
          {risingHeart && (
            <motion.div
              className="absolute left-1/2 top-1/2 z-20"
              initial={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              animate={{
                opacity: [1, 1, 0.8],
                y: -120,
                x: '-50%',
                scale: [1, 0.7, 0.4],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ willChange: 'transform, opacity' }}
            >
              <svg width="24" height="24" viewBox="0 0 10 10" fill="#D81B60">
                <path d="M5,8.5 C3,6.5 0.5,5 0.5,3 C0.5,1.5 2,0.5 3.5,1.5 C4.2,2 4.7,2.5 5,3 C5.3,2.5 5.8,2 6.5,1.5 C8,0.5 9.5,1.5 9.5,3 C9.5,5 7,6.5 5,8.5 Z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom instruction text */}
      <div className="relative z-10 mt-8 flex flex-col items-center gap-2">
        <motion.p
          className="font-handwritten text-lg text-[#8B6B50]/80"
          animate={{ opacity: activeNote !== null ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {notesRead === 0 ? 'tap the jar ✨' : 'shake for another ✨'}
        </motion.p>
        <p className="font-body text-xs text-[#A08060]/50">
          {heartCount} hearts inside
        </p>
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
