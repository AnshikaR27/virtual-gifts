'use client';

import { useCallback, useEffect } from 'react';
import { useJarState } from '../hooks/use-jar-state';
import { useShakeDetector } from '../hooks/use-shake-detector';
import { HeartRelease } from './heart-release';
import { MessageCard } from './message-card';

const FAIRY_DOTS = [
  { x: 13, y: 15, size: 10, delay: 0, duration: 3 },
  { x: 22, y: 12.5, size: 8, delay: 0.7, duration: 2.5 },
  { x: 32, y: 10.5, size: 12, delay: 1.4, duration: 3.5 },
  { x: 42, y: 9, size: 9, delay: 0.3, duration: 2.8 },
  { x: 55, y: 9, size: 11, delay: 1.8, duration: 3.2 },
  { x: 65, y: 10.5, size: 8, delay: 0.5, duration: 4 },
  { x: 76, y: 12.5, size: 10, delay: 1.1, duration: 2.6 },
  { x: 87, y: 15, size: 9, delay: 2.0, duration: 3.4 },
];

interface CozyRoomSceneProps {
  messages: string[];
  onShake: () => void;
}

export function CozyRoomScene({ messages, onShake }: CozyRoomSceneProps) {
  const { phase, remaining, currentMessage, triggerShake, dismissCard } =
    useJarState(messages);

  const handleShake = useCallback(() => {
    triggerShake();
    onShake();
  }, [triggerShake, onShake]);

  const { requestPermission, needsPermission } = useShakeDetector(handleShake);

  useEffect(() => {
    if (!needsPermission) return;
    const handler = () => {
      requestPermission();
      window.removeEventListener('touchstart', handler);
    };
    window.addEventListener('touchstart', handler, { once: true });
    return () => window.removeEventListener('touchstart', handler);
  }, [needsPermission, requestPermission]);

  const isShaking = phase === 'shaking' || phase === 'releasing';
  const jarAnimation = isShaking
    ? 'jar-shake 600ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both'
    : 'jar-idle-wobble 4s ease-in-out infinite';

  const handleHeartComplete = useCallback(() => {
    // Phase transition handled by useJarState timers
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background image — full bleed, pixelated, with subtle breath */}
      <img
        src="/images/love-jar-room.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          imageRendering: 'pixelated',
          animation: 'room-breath 8s ease-in-out infinite',
        }}
        draggable={false}
      />

      {/* Fairy light twinkle dots — over the painted lights */}
      <div className="pointer-events-none absolute inset-0 z-[5]">
        {FAIRY_DOTS.map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255, 240, 180, 0.9) 0%, rgba(255, 220, 140, 0.4) 40%, transparent 70%)',
              mixBlendMode: 'screen',
              animation: `fairy-twinkle ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Soft glow behind the jar */}
      <div
        className="pointer-events-none absolute left-1/2 z-[8] -translate-x-1/2"
        style={{
          bottom: '24%',
          width: '68vw',
          maxWidth: 375,
          aspectRatio: '1',
          background:
            'radial-gradient(circle, rgba(255, 180, 180, 0.3) 0%, transparent 60%)',
          animation: 'jar-glow-pulse 4s ease-in-out infinite',
        }}
      />

      {/* Jar — sitting on the desk, centered on placemat */}
      <img
        src="/images/love-jar.png"
        alt="Love jar full of hearts"
        className="absolute left-1/2 z-10 w-[45vw] max-w-[250px] -translate-x-1/2 select-none sm:w-[28vw] sm:max-w-[300px]"
        style={{
          bottom: '24%',
          imageRendering: 'pixelated',
          WebkitFontSmoothing: 'none',
          transformOrigin: 'bottom center',
          animation: jarAnimation,
        }}
        draggable={false}
      />

      {/* Heart release animation */}
      <HeartRelease
        active={phase === 'releasing'}
        onComplete={handleHeartComplete}
      />

      {/* Message card */}
      <MessageCard
        message={currentMessage ?? ''}
        visible={phase === 'showing-card'}
        onDismiss={dismissCard}
      />

      {/* Bottom UI — counter + button, over the desk foreground */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-4 pt-2">
        {/* Message counter */}
        <p
          className="select-none font-pixel text-[16px] tracking-wide"
          style={{
            color: 'rgba(90, 60, 35, 0.85)',
            textShadow: '0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          {phase === 'empty'
            ? '♡ jar is empty ♡'
            : `♥ ${remaining} messages inside ♥`}
        </p>

        {/* Shake button — soft pink pixel style */}
        <button
          className="select-none font-pixel text-[17px] tracking-wide text-white"
          style={{
            background:
              phase === 'empty' || isShaking || phase === 'showing-card'
                ? 'linear-gradient(180deg, #cca0b0, #b08090)'
                : 'linear-gradient(180deg, #ff8fbf, #e8609a)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 4,
            padding: '10px 28px',
            minHeight: 48,
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            boxShadow:
              '0 2px 8px rgba(200, 60, 120, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
            cursor:
              phase === 'empty' || isShaking || phase === 'showing-card'
                ? 'default'
                : 'pointer',
            opacity: isShaking || phase === 'showing-card' ? 0.5 : 1,
            transition: 'opacity 300ms, background 300ms',
          }}
          onClick={handleShake}
          disabled={phase !== 'idle'}
        >
          {phase === 'empty' ? 'ALL HEARTS FREED ♡' : 'SHAKE THE JAR ♥'}
        </button>

        {/* Mobile hint */}
        {phase === 'idle' && (
          <p
            className="select-none font-pixel text-[12px]"
            style={{
              color: 'rgba(255, 252, 246, 0.75)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            }}
          >
            or shake your phone!
          </p>
        )}
      </div>
    </div>
  );
}
