'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { playClick } from '@/components/retro-sounds';

const headlines = [
  'Loading ROMANCE.exe...',
  '87 ways to crash their heart (lovingly)',
  'Installing butterflies... please wait',
  "SYSTEM ALERT: You're in love",
];

const desktopIcons = [
  { emoji: '🫙', label: 'LOVE_JAR.exe', href: '#make-them-melt' },
  { emoji: '🐶', label: 'SORRY.bat', href: '#quick-sweet' },
  { emoji: '🌼', label: 'DANDELION.gif', href: '#make-them-melt' },
  { emoji: '🎵', label: 'SPOTIFY_WRAPPED.zip', href: '#wildcard' },
  { emoji: '📜', label: 'TERMS.pdf', href: '#wildcard' },
  { emoji: '📅', label: '365_JAR.app', href: '#for-the-long-run' },
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

const POPUPS = [
  {
    title: '💓 SYSTEM',
    body: 'Heart rate increasing...',
    hasOk: true,
    delay: 800,
    offset: { top: 8, marginLeft: -130 },
  },
  {
    title: '💕 ROMANCE.exe',
    body: 'Loading ROMANCE.exe ████████░░ 78%',
    hasOk: false,
    delay: 1500,
    offset: { top: 20, marginLeft: -120 },
  },
  {
    title: '⚠️ WARNING',
    body: 'Your love life is running low on memory.',
    hasOk: true,
    delay: 2200,
    offset: { top: 32, marginLeft: -138 },
  },
] as const;

const AUTO_DISMISS_DELAY = 6000;

function MobilePopupStack() {
  const [visible, setVisible] = useState<boolean[]>([false, false, false]);
  const [dismissing, setDismissing] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const dismiss = useCallback((index: number) => {
    playClick();
    setDismissing((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setTimeout(() => {
      setVisible((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
      setDismissing((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }, 200);
  }, []);

  useEffect(() => {
    POPUPS.forEach((popup, i) => {
      const t = setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
        playClick();
      }, popup.delay);
      timers.current.push(t);
    });

    const autoTimer = setTimeout(() => {
      [2, 1, 0].forEach((i, order) => {
        const t = setTimeout(() => {
          setDismissing((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          const t2 = setTimeout(() => {
            setVisible((prev) => {
              const next = [...prev];
              next[i] = false;
              return next;
            });
            setDismissing((prev) => {
              const next = [...prev];
              next[i] = false;
              return next;
            });
          }, 200);
          timers.current.push(t2);
        }, order * 300);
        timers.current.push(t);
      });
    }, AUTO_DISMISS_DELAY);
    timers.current.push(autoTimer);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return (
    <div className="relative mt-6 md:hidden" style={{ height: 170 }}>
      {POPUPS.map((popup, i) =>
        visible[i] ? (
          <div
            key={i}
            className={`win98-window absolute w-[260px] ${dismissing[i] ? 'popup-dismiss' : 'popup-appear'}`}
            style={{
              top: popup.offset.top,
              left: '50%',
              marginLeft: popup.offset.marginLeft,
              zIndex: 10 + i,
            }}
          >
            <div
              className="win98-titlebar"
              style={{ fontSize: '12px', padding: '2px 4px' }}
            >
              <span>{popup.title}</span>
              <div className="flex gap-[2px]">
                <button
                  className="win98-titlebar-btn"
                  aria-label="Minimize"
                  style={{ width: 14, height: 12 }}
                >
                  <span className="mt-[2px] block h-[2px] w-[5px] bg-black" />
                </button>
                <button
                  className="win98-titlebar-btn"
                  aria-label="Maximize"
                  style={{ width: 14, height: 12 }}
                >
                  <span className="block h-[6px] w-[6px] border border-black" />
                </button>
                <button
                  className="win98-titlebar-btn"
                  aria-label="Close"
                  style={{ width: 14, height: 12 }}
                  onClick={() => dismiss(i)}
                >
                  <span className="text-[9px] font-bold leading-none text-black">
                    ✕
                  </span>
                </button>
              </div>
            </div>
            <div className="win98-body" style={{ padding: '8px 10px' }}>
              <p className="font-pixel text-[12px] leading-snug text-black/80">
                {popup.body}
              </p>
              {popup.hasOk && (
                <div className="mt-2 flex justify-end">
                  <button
                    className="win98-btn text-[11px]"
                    onClick={() => dismiss(i)}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null,
      )}
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
      className="relative overflow-hidden px-4 py-8 md:min-h-[calc(100vh-34px)] md:py-20"
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
                <a href="#quick-sweet" className="win98-btn-pink text-[18px]">
                  Try Free ♥
                </a>
                <a href="#make-them-melt" className="win98-btn text-[16px]">
                  See Gifts
                </a>
              </div>
            </div>
          </div>

          <MobilePopupStack />
        </div>
      </div>
    </section>
  );
}
