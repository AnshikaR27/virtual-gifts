'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

type Phase =
  | 'raining'
  | 'slowing'
  | 'clearing'
  | 'puppy-reacts'
  | 'message-reveals'
  | 'complete';

interface SorryPuppyProps {
  mode: 'preview' | 'actual';
  message?: string;
  onComplete?: () => void;
}

const PLACEHOLDER_MESSAGE =
  "I'm sorry I forgot our anniversary. I should have remembered, and I didn't, and that wasn't okay.";

const TOTAL_TAPS = 6;
const DROP_COUNT = 45;

const RAINBOW_COLORS = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#0096FF',
  '#4B0082',
  '#8B00FF',
];

const PREVIEW_TIMING = {
  raining: 1200,
  slowing: 2000,
  complete: 1500,
} as const;

/* ── Rain drop data ────────────────────────────────────────────── */

interface Drop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
  opacity: number;
  threshold: number;
}

function generateDrops(count: number): Drop[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (((i * 7 + 13) * 17) % 100) + Math.sin(i * 0.7) * 3,
    delay: ((i * 3 + 7) % 15) / 10,
    duration: 0.5 + ((i * 11) % 5) / 10,
    width: 1.5 + ((i * 13) % 10) / 10,
    height: 12 + ((i * 17) % 10),
    opacity: 0.25 + ((i * 19) % 35) / 100,
    threshold: i / count,
  }));
}

/* ── Puppy SVG ─────────────────────────────────────────────────── */

function PuppySvg({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="0 0 120 150" fill="none" aria-hidden="true">
      {/* Tail */}
      <path
        d={happy ? 'M85,105 Q102,85 96,72' : 'M85,108 Q98,115 93,128'}
        stroke="#C49A6C"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        className={happy ? 'sorry-puppy-tail-wag' : ''}
      />

      {/* Back paws */}
      <ellipse cx="45" cy="127" rx="9" ry="5" fill="#C49A6C" />
      <ellipse cx="75" cy="127" rx="9" ry="5" fill="#C49A6C" />

      {/* Body */}
      <ellipse cx="60" cy="108" rx="26" ry="22" fill="#D4A574" />

      {/* Belly */}
      <ellipse cx="60" cy="112" rx="15" ry="13" fill="#F5E6D3" />

      {/* Front paws */}
      <ellipse cx="42" cy="128" rx="10" ry="6" fill="#D4A574" />
      <ellipse cx="78" cy="128" rx="10" ry="6" fill="#D4A574" />
      <ellipse cx="42" cy="129" rx="6" ry="3" fill="#F5E6D3" />
      <ellipse cx="78" cy="129" rx="6" ry="3" fill="#F5E6D3" />

      {/* Left ear */}
      <path
        d="M42,50 Q30,32 26,52 Q24,64 38,58 Z"
        fill="#B8860B"
        style={{
          transform: happy ? 'rotate(-10deg)' : 'rotate(12deg)',
          transformOrigin: '40px 48px',
          transition: 'transform 0.8s ease-out',
        }}
      />

      {/* Right ear */}
      <path
        d="M78,50 Q90,32 94,52 Q96,64 82,58 Z"
        fill="#B8860B"
        style={{
          transform: happy ? 'rotate(10deg)' : 'rotate(-12deg)',
          transformOrigin: '80px 48px',
          transition: 'transform 0.8s ease-out',
        }}
      />

      {/* Head */}
      <circle cx="60" cy="62" r="28" fill="#D4A574" />

      {/* Muzzle */}
      <ellipse cx="60" cy="72" rx="15" ry="11" fill="#F5E6D3" />

      {/* Nose */}
      <ellipse cx="60" cy="66" rx="5" ry="3.5" fill="#2D1B0E" />
      <ellipse cx="58" cy="65" rx="2" ry="1" fill="#4a3728" opacity="0.5" />

      {/* Eyes */}
      {happy ? (
        <>
          <circle cx="48" cy="56" r="4" fill="#2D1B0E" />
          <circle cx="72" cy="56" r="4" fill="#2D1B0E" />
          <circle cx="46" cy="54" r="1.5" fill="white" />
          <circle cx="70" cy="54" r="1.5" fill="white" />
        </>
      ) : (
        <>
          <circle cx="48" cy="58" r="3.5" fill="#2D1B0E" />
          <circle cx="72" cy="58" r="3.5" fill="#2D1B0E" />
          {/* Half-lids */}
          <path
            d="M43,55 Q48,52 53,55"
            stroke="#D4A574"
            strokeWidth="3"
            fill="#D4A574"
          />
          <path
            d="M67,55 Q72,52 77,55"
            stroke="#D4A574"
            strokeWidth="3"
            fill="#D4A574"
          />
        </>
      )}

      {/* Eyebrows */}
      {happy ? (
        <>
          <path
            d="M43,48 Q48,46 53,48"
            stroke="#B8860B"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M67,48 Q72,46 77,48"
            stroke="#B8860B"
            strokeWidth="1.5"
            fill="none"
          />
        </>
      ) : (
        <>
          <path
            d="M43,52 Q48,48 53,50"
            stroke="#B8860B"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M67,50 Q72,48 77,52"
            stroke="#B8860B"
            strokeWidth="1.5"
            fill="none"
          />
        </>
      )}

      {/* Mouth */}
      {happy ? (
        <>
          <ellipse cx="60" cy="80" rx="5" ry="4" fill="#FF9999" />
          <path
            d="M48,76 Q60,86 72,76"
            stroke="#2D1B0E"
            strokeWidth="1.5"
            fill="none"
          />
        </>
      ) : (
        <path
          d="M52,78 Q60,73 68,78"
          stroke="#2D1B0E"
          strokeWidth="1.5"
          fill="none"
        />
      )}

      {/* Blush when happy */}
      {happy && (
        <>
          <ellipse cx="40" cy="64" rx="5" ry="3" fill="#FFB6C1" opacity="0.4" />
          <ellipse cx="80" cy="64" rx="5" ry="3" fill="#FFB6C1" opacity="0.4" />
        </>
      )}
    </svg>
  );
}

/* ── Main component ────────────────────────────────────────────── */

export function SorryPuppy({ mode, message, onComplete }: SorryPuppyProps) {
  const displayMessage = message ?? PLACEHOLDER_MESSAGE;

  const [phase, setPhase] = useState<Phase>('raining');
  const [tapCount, setTapCount] = useState(0);
  const [rainIntensity, setRainIntensity] = useState(1);
  const [showTapHint, setShowTapHint] = useState(false);
  const [revealedChars, setRevealedChars] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  const drops = useMemo(() => generateDrops(DROP_COUNT), []);
  const isHappy =
    phase === 'puppy-reacts' ||
    phase === 'message-reveals' ||
    phase === 'complete';
  const showRainbow = phase === 'clearing' || isHappy;

  /* ── Tap handler (actual mode) ── */
  const handleTap = useCallback(() => {
    if (mode !== 'actual') return;
    if (phase !== 'raining' && phase !== 'slowing') return;

    setShowTapHint(false);
    const next = tapCount + 1;
    setTapCount(next);
    setRainIntensity(Math.max(0, 1 - next / TOTAL_TAPS));

    if (phase === 'raining') setPhase('slowing');
    if (next >= TOTAL_TAPS) setPhase('clearing');
  }, [mode, phase, tapCount]);

  /* ── Tap hint after 2s inactivity ── */
  useEffect(() => {
    if (mode !== 'actual' || phase !== 'raining') return;
    const t = setTimeout(() => setShowTapHint(true), 2000);
    return () => clearTimeout(t);
  }, [mode, phase]);

  /* ── Auto transitions: clearing → puppy-reacts → message-reveals ── */
  useEffect(() => {
    if (phase === 'clearing') {
      const t = setTimeout(() => setPhase('puppy-reacts'), 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'puppy-reacts') {
      const t = setTimeout(() => setPhase('message-reveals'), 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  /* ── Typewriter ── */
  useEffect(() => {
    if (phase !== 'message-reveals') return;
    setRevealedChars(0);
    const speed = mode === 'preview' ? 25 : 40;
    const interval = setInterval(() => {
      setRevealedChars((prev) => {
        if (prev >= displayMessage.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [phase, displayMessage, mode]);

  /* ── Transition to complete after typewriter finishes ── */
  useEffect(() => {
    if (phase === 'message-reveals' && revealedChars >= displayMessage.length) {
      const t = setTimeout(() => setPhase('complete'), 600);
      return () => clearTimeout(t);
    }
  }, [phase, revealedChars, displayMessage.length]);

  /* ── Complete: fire callback, loop in preview ── */
  useEffect(() => {
    if (phase !== 'complete') return;
    onComplete?.();

    if (mode === 'preview') {
      const t = setTimeout(() => {
        setPhase('raining');
        setTapCount(0);
        setRainIntensity(1);
        setRevealedChars(0);
        setShowTapHint(false);
        setLoopKey((k) => k + 1);
      }, PREVIEW_TIMING.complete);
      return () => clearTimeout(t);
    }
  }, [phase, mode, onComplete]);

  /* ── Preview auto-play ── */
  useEffect(() => {
    if (mode !== 'preview') return;

    if (phase === 'raining') {
      const t = setTimeout(() => setPhase('slowing'), PREVIEW_TIMING.raining);
      return () => clearTimeout(t);
    }

    if (phase === 'slowing') {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setRainIntensity(1 - step / TOTAL_TAPS);
        if (step >= TOTAL_TAPS) {
          clearInterval(interval);
          setPhase('clearing');
        }
      }, PREVIEW_TIMING.slowing / TOTAL_TAPS);
      return () => clearInterval(interval);
    }
  }, [mode, phase]);

  /* ── Render ── */
  return (
    <div
      className="sorry-puppy-container"
      style={
        mode === 'preview'
          ? { transform: 'scale(0.8)', transformOrigin: 'center' }
          : undefined
      }
      onClick={handleTap}
      onKeyDown={
        mode === 'actual'
          ? (e) => {
              if (e.key === ' ' || e.key === 'Enter') handleTap();
            }
          : undefined
      }
      role={mode === 'actual' ? 'button' : undefined}
      tabIndex={mode === 'actual' ? 0 : undefined}
      aria-label={mode === 'actual' ? 'Tap to clear the rain' : undefined}
    >
      {/* ── Sky: clear (base) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #FFF8E1 100%)',
        }}
      />

      {/* ── Sky: storm overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #37474F 0%, #455A64 40%, #546E7A 100%)',
          opacity: rainIntensity,
          transition: 'opacity 0.8s ease-out',
        }}
      />

      {/* ── Ground: bright base ── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: '15%', background: '#7CB342' }}
      />

      {/* ── Ground: dark wet overlay ── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: '15%',
          background: '#4E6B4F',
          opacity: Math.min(1, rainIntensity * 1.5),
          transition: 'opacity 1s ease-out',
        }}
      />

      {/* ── Rainbow ── */}
      {showRainbow && (
        <svg
          key={`rainbow-${loopKey}`}
          className="pointer-events-none absolute"
          style={{ top: '5%', left: '10%', width: '80%', height: '35%' }}
          viewBox="0 0 200 100"
          preserveAspectRatio="xMidYMax meet"
        >
          {RAINBOW_COLORS.map((color, i) => {
            const r = 85 - i * 8;
            return (
              <path
                key={i}
                d={`M ${100 - r},100 A ${r},${r} 0 0,1 ${100 + r},100`}
                stroke={color}
                strokeWidth="3.5"
                strokeOpacity="0.8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="300"
                strokeDashoffset="300"
                style={{
                  animation: `sorryPuppyRainbowDraw 1.2s ease-out ${i * 0.12}s forwards`,
                }}
              />
            );
          })}
        </svg>
      )}

      {/* ── Puppy ── */}
      <div
        className="absolute"
        style={{
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '35%',
          maxWidth: '180px',
        }}
      >
        <PuppySvg happy={isHappy} />
      </div>

      {/* ── Rain drops ── */}
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="sorry-puppy-drop"
          style={{
            left: `${drop.x}%`,
            width: `${drop.width}px`,
            height: `${drop.height}px`,
            opacity: drop.threshold < rainIntensity ? drop.opacity : 0,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}

      {/* ── Tap hint ── */}
      {showTapHint && (
        <div className="sorry-puppy-tap-hint">
          <div className="sorry-puppy-tap-ring">
            <span className="text-lg leading-none">👆</span>
          </div>
          <span className="whitespace-nowrap text-xs text-white/70">
            Tap to clear the rain
          </span>
        </div>
      )}

      {/* ── Message ── */}
      {(phase === 'message-reveals' || phase === 'complete') && (
        <div
          className="absolute inset-x-0 flex justify-center px-6"
          style={{ top: '10%' }}
        >
          <div className="max-w-xs rounded-xl bg-white/85 px-5 py-4 shadow-lg backdrop-blur-sm">
            <p
              className="text-center text-xl leading-relaxed text-gray-800"
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              {displayMessage.slice(0, revealedChars)}
              {revealedChars < displayMessage.length && (
                <span className="sorry-puppy-cursor">|</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
