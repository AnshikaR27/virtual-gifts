'use client';

import { useState, useEffect } from 'react';

const headlines = [
  'Loading ROMANCE.exe...',
  '87 ways to crash their heart (lovingly)',
  'Installing butterflies... please wait',
  "SYSTEM ALERT: You're in love",
];

const desktopIcons = [
  { emoji: '🫙', label: 'LOVE_JAR.exe', href: '#browse' },
  { emoji: '🐶', label: 'SORRY.bat', href: '#browse' },
  { emoji: '🌼', label: 'DANDELION.gif', href: '#browse' },
  { emoji: '🎵', label: 'SPOTIFY_WRAPPED.zip', href: '#browse' },
  { emoji: '📜', label: 'TERMS.pdf', href: '#browse' },
  { emoji: '📅', label: '365_JAR.app', href: '#browse' },
];

function TitlebarButtons() {
  return (
    <div className="flex gap-[2px]">
      <button className="win98-titlebar-btn" aria-label="Minimize">
        <span className="mt-[2px] block h-[2px] w-[6px] bg-black" />
      </button>
      <button className="win98-titlebar-btn" aria-label="Maximize">
        <span className="block h-[7px] w-[7px] border border-black" />
      </button>
      <button className="win98-titlebar-btn" aria-label="Close">
        <span className="text-[10px] font-bold leading-none text-black">✕</span>
      </button>
    </div>
  );
}

function FloatingWindows() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
      {/* Warning dialog */}
      <div
        className="win98-window animate-float absolute"
        style={
          {
            top: '8%',
            right: '4%',
            width: 260,
            transform: 'rotate(-2deg)',
            '--float-rotate': '-2deg',
          } as React.CSSProperties
        }
      >
        <div className="win98-titlebar">
          <span>⚠️ WARNING</span>
          <TitlebarButtons />
        </div>
        <div className="win98-body">
          <p className="font-pixel text-[13px] leading-snug text-black">
            Your love life is running low on memory. Please delete some bad
            decisions.
          </p>
          <div className="mt-3 flex justify-end">
            <span className="win98-btn text-[12px]">OK</span>
          </div>
        </div>
      </div>

      {/* Progress bar window */}
      <div
        className="win98-window animate-float absolute"
        style={
          {
            bottom: '18%',
            left: '2%',
            width: 240,
            transform: 'rotate(1.5deg)',
            '--float-rotate': '1.5deg',
            animationDelay: '2s',
          } as React.CSSProperties
        }
      >
        <div className="win98-titlebar">
          <span>💕 ROMANCE.exe</span>
          <TitlebarButtons />
        </div>
        <div className="win98-body">
          <p className="mb-2 font-pixel text-[12px] text-black">
            Loading ROMANCE.exe...
          </p>
          <div
            className="h-[18px] border-2"
            style={{
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
            }}
          >
            <div
              className="animate-progress h-full"
              style={{ background: 'linear-gradient(90deg, #FF69B4, #BA55D3)' }}
            />
          </div>
          <p className="mt-1 font-pixel text-[11px] text-black/60">
            78% complete
          </p>
        </div>
      </div>

      {/* System dialog */}
      <div
        className="win98-window animate-float absolute"
        style={
          {
            bottom: '8%',
            right: '6%',
            width: 220,
            transform: 'rotate(2deg)',
            '--float-rotate': '2deg',
            animationDelay: '4s',
          } as React.CSSProperties
        }
      >
        <div className="win98-titlebar">
          <span>💓 SYSTEM</span>
          <TitlebarButtons />
        </div>
        <div className="win98-body text-center">
          <p className="font-pixel text-[13px] text-black">
            Heart rate increasing...
          </p>
          <div className="mt-3 flex justify-center">
            <span className="win98-btn text-[12px]">[OK]</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % headlines.length);
        setFading(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden px-4 py-8 md:min-h-[calc(100dvh-34px)] md:py-20"
    >
      <FloatingWindows />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:gap-12">
        {/* Left side — Desktop icons */}
        <div className="hidden flex-shrink-0 md:block">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {desktopIcons.map((icon) => (
              <a key={icon.label} href={icon.href} className="desktop-icon">
                <span className="desktop-icon-emoji">{icon.emoji}</span>
                <span className="desktop-icon-label">{icon.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Right side — ROMANCE.exe window */}
        <div className="flex-1 md:max-w-[560px]">
          <div className="win98-window">
            <div className="win98-titlebar text-[15px]">
              <span>💕 ROMANCE.exe</span>
              <TitlebarButtons />
            </div>
            <div className="win98-body">
              <div className="min-h-[120px] md:min-h-[140px]">
                <h1
                  className={`blink-cursor font-display text-[24px] font-semibold leading-snug tracking-tight transition-opacity duration-300 md:text-[34px] md:leading-tight ${
                    fading ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ color: '#2D0A4E' }}
                >
                  {headlines[index]}
                </h1>
              </div>

              <p className="mt-4 font-body text-[15px] leading-relaxed text-black/70">
                Pick a gift, add your words, send via WhatsApp. Takes 30
                seconds.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#browse" className="win98-btn-pink text-[18px]">
                  Try Free ♥
                </a>
                <a href="#browse" className="win98-btn text-[16px]">
                  See Gifts
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
