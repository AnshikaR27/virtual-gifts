'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GiftLoading } from '@/components/gift-loading';

interface Channel {
  slug: string;
  emoji: string;
  name: string;
  desc: string;
  tint: string;
}

const channels: Channel[] = [
  {
    slug: 'love-jar',
    emoji: '\u{1FAD9}',
    name: 'Love Jar',
    desc: 'Shake to pull random love notes',
    tint: 'rgba(255, 182, 193, 0.12)',
  },
  {
    slug: 'wishing-dandelion',
    emoji: '\u{1F32C}️',
    name: 'Wishing Dandelion',
    desc: 'Blow to scatter seeds of wishes',
    tint: 'rgba(200, 180, 255, 0.12)',
  },
  {
    slug: 'the-proposal',
    emoji: '\u{1F48D}',
    name: 'The Proposal',
    desc: "The 'No' button runs away",
    tint: 'rgba(180, 240, 200, 0.12)',
  },
  {
    slug: 'spotify-wrapped',
    emoji: '\u{1F4CA}',
    name: 'Spotify Wrapped',
    desc: 'Your relationship, Wrapped-style',
    tint: 'rgba(255, 215, 100, 0.12)',
  },
  {
    slug: 'sorry-puppy',
    emoji: '\u{1F97A}',
    name: 'Sorry Puppy',
    desc: 'Your taps clear the rain away',
    tint: 'rgba(255, 160, 140, 0.12)',
  },
];

const AUTO_ROTATE_MS = 4000;

function playClick() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}

function playStatic() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.12);
  } catch {}
}

function TuningColumn() {
  return (
    <div className="crt-tuning-column" aria-hidden>
      <span className="crt-tuning-label">МВ</span>
      <span className="crt-tuning-num">6</span>
      <span
        className="crt-tuning-num crt-tuning-misprint"
        style={{ transform: 'translateX(1.5px)' }}
      >
        21
      </span>
      <span className="crt-tuning-num">5</span>
      <span
        className="crt-tuning-num crt-tuning-misprint"
        style={{ transform: 'translateX(-1px)' }}
      >
        12
      </span>
      <span className="crt-tuning-num">49</span>
      <span className="crt-tuning-label">ДМВ</span>
    </div>
  );
}

function Antenna() {
  return (
    <div className="crt-antenna" aria-hidden>
      <svg viewBox="0 0 60 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left rod: -28° from vertical, 55px tall */}
        <line
          x1="30"
          y1="58"
          x2="14.2"
          y2="5"
          stroke="#3a2a3f"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="14.2" cy="5" r="2.5" fill="#3a2a3f" />
        {/* Right rod: +32° from vertical, 48px tall */}
        <line
          x1="30"
          y1="58"
          x2="49"
          y2="12"
          stroke="#3a2a3f"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="49" cy="12" r="2.5" fill="#3a2a3f" />
      </svg>
    </div>
  );
}

function FanFavoritesSticker() {
  return (
    <div className="crt-sticker" aria-hidden>
      {/* Top-left corner tape piece */}
      <svg
        className="crt-tape crt-tape--tl"
        viewBox="0 0 22 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.5 1 L2 0.3 L5 1.2 L10 0.5 L18 0.8 L20 0.5 L21.5 1.5 L21 16 L20 17 L18 17.5 L8 16.8 L3 17.3 L1 17.5 L0 16 L0.5 1 Z"
          fill="#E8C77A"
          opacity="0.7"
        />
      </svg>
      {/* Top-right corner tape piece */}
      <svg
        className="crt-tape crt-tape--tr"
        viewBox="0 0 22 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1.2 L3 0.5 L8 1 L14 0.4 L19 0.8 L21 0.5 L21.5 1.5 L22 16.5 L21 17.2 L18 17.5 L10 17 L4 17.5 L1.5 17 L0 16 L0.5 1.2 Z"
          fill="#E8C77A"
          opacity="0.7"
        />
      </svg>
      {/* Yellow paper plate */}
      <div className="crt-sticker-plate">
        <span className="crt-sticker-text font-handwritten">
          top 5{' '}
          <svg
            className="crt-doodle-heart"
            viewBox="0 0 24 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 19C11 17.5 4.5 13 3.2 9C2 5.5 4 3.2 6.8 3C8.5 2.9 10.2 4 11.8 6C13 4.2 14.8 3.2 16.8 3.3C19.2 3.5 21.5 5.8 20.8 9.5C20 13.5 13 17 12.5 19Z"
              fill="#FFE0F0"
              opacity="0.5"
            />
            <path
              d="M12 19.5C10.5 17.8 3.5 13.2 2.2 8.8C1 4.8 3.5 2.2 6.5 2C8.4 1.9 10.5 3.5 12 6.2C13.2 3.8 15.2 2.3 17.2 2.5C20 2.8 22.2 5.5 21.5 9.2C20.5 14 13 18 12 19.5Z"
              stroke="#FF1493"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'url(#doodle-wobble)' }}
            />
            <line
              x1="20"
              y1="4.5"
              x2="22"
              y2="3"
              stroke="#FF1493"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="21.5"
              y1="5.5"
              x2="23"
              y2="5"
              stroke="#FF1493"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <defs>
              <filter
                id="doodle-wobble"
                x="-5%"
                y="-5%"
                width="110%"
                height="110%"
              >
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.04"
                  numOctaves="4"
                  seed="3"
                  result="warp"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="warp"
                  scale="1.5"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>
        </span>
      </div>
    </div>
  );
}

export function CrtShowcase() {
  const [currentCh, setCurrentCh] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [loading, setLoading] = useState(false);
  const targetSlug = useRef('');
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const autoRotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisible = useRef(false);

  const channel = channels[currentCh];

  const resetAutoRotate = useCallback(() => {
    if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    if (!isVisible.current) return;
    autoRotateTimer.current = setTimeout(() => {
      if (isVisible.current) {
        setSwitching(true);
        playStatic();
        setTimeout(() => {
          setCurrentCh((prev) => (prev + 1) % channels.length);
          setSwitching(false);
        }, 300);
      }
    }, AUTO_ROTATE_MS);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          resetAutoRotate();
        } else if (autoRotateTimer.current) {
          clearTimeout(autoRotateTimer.current);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (autoRotateTimer.current) clearTimeout(autoRotateTimer.current);
    };
  }, [resetAutoRotate]);

  useEffect(() => {
    resetAutoRotate();
  }, [currentCh, resetAutoRotate]);

  const switchChannel = useCallback(
    (direction: 1 | -1) => {
      if (switching) return;
      playClick();
      setSwitching(true);
      playStatic();
      setTimeout(() => {
        setCurrentCh(
          (prev) => (prev + direction + channels.length) % channels.length,
        );
        setSwitching(false);
      }, 300);
    },
    [switching],
  );

  const touchStart = useRef(0);
  const swiped = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    swiped.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = e.changedTouches[0].clientX - touchStart.current;
      if (Math.abs(diff) > 50) {
        swiped.current = true;
        switchChannel(diff > 0 ? -1 : 1);
      }
    },
    [switchChannel],
  );

  const handleScreenTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (swiped.current) {
        swiped.current = false;
        return;
      }
      if (loading || switching) return;
      e.preventDefault();
      playClick();
      targetSlug.current = channel.slug;
      router.prefetch(`/gift/${channel.slug}`);
      setLoading(true);
    },
    [channel, router, loading, switching],
  );

  const handleLoadComplete = useCallback(() => {
    router.push(`/gift/${targetSlug.current}`);
  }, [router]);

  const dialRotation = (currentCh / (channels.length - 1)) * 270 - 135;

  return (
    <>
      <section className="crt-section" ref={sectionRef}>
        <div className="crt-bridge-title">
          <h2 className="crt-label-top font-display">
            For Your Person{' '}
            <svg
              className="crt-heart-icon"
              width="38"
              height="35"
              viewBox="0 0 38 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="heart-grad"
                  x1="19"
                  y1="0"
                  x2="19"
                  y2="35"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#FF85C8" />
                  <stop offset="100%" stopColor="#E84592" />
                </linearGradient>
              </defs>
              <path
                d="M19 33C17.5 31.5 3 23 1.5 14.5C0 6 5.5 1 11 1.2C14.5 1.3 17.2 3.5 19 6.5C20.5 3.8 23.5 1.8 27 2C32 2.3 36.5 6.5 36 14C35.3 22.5 20.5 31.5 19 33Z"
                fill="url(#heart-grad)"
              />
              <path
                d="M19 33C17.5 31.5 3 23 1.5 14.5C0 6 5.5 1 11 1.2C14.5 1.3 17.2 3.5 19 6.5C20.5 3.8 23.5 1.8 27 2C32 2.3 36.5 6.5 36 14C35.3 22.5 20.5 31.5 19 33Z"
                stroke="#C43A78"
                strokeWidth="0.75"
                fill="none"
                opacity="0.5"
              />
              <ellipse
                cx="10.5"
                cy="9"
                rx="4"
                ry="3.2"
                fill="white"
                opacity="0.35"
                transform="rotate(-15 10.5 9)"
              />
            </svg>
          </h2>
          <svg
            className="crt-title-squiggle"
            viewBox="0 0 80 6"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M2 4c6-4 12 4 18 0s12-4 18 0 12 4 18 0s12-4 18 0"
              stroke="rgba(26,10,46,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="crt-tv-wrap">
          <Antenna />
          <div className="crt-tv">
            <FanFavoritesSticker />

            {/* Main body: screen + tuning column */}
            <div className="crt-body-row">
              <div className="crt-screen-bezel">
                <div
                  className="crt-screen"
                  style={
                    { '--screen-tint': channel.tint } as React.CSSProperties
                  }
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onClick={handleScreenTap}
                  role="button"
                  tabIndex={0}
                  aria-label={`Create ${channel.name} gift`}
                >
                  <div
                    className="crt-screen-content"
                    style={{ opacity: switching ? 0 : 1 }}
                  >
                    <span className="crt-screen-emoji">{channel.emoji}</span>
                    <span className="crt-screen-name font-pixel">
                      {channel.name}
                    </span>
                    <span className="crt-screen-desc font-body">
                      {channel.desc}
                    </span>
                    <span className="crt-screen-cta font-body">
                      &#9654; tap to create
                    </span>
                  </div>

                  {switching && (
                    <div className="crt-static-overlay">
                      <svg viewBox="0 0 200 200" preserveAspectRatio="none">
                        <filter id="crt-noise">
                          <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.65"
                            numOctaves="3"
                            stitchTiles="stitch"
                          >
                            <animate
                              attributeName="seed"
                              from="0"
                              to="100"
                              dur="0.15s"
                              repeatCount="indefinite"
                            />
                          </feTurbulence>
                        </filter>
                        <rect
                          width="100%"
                          height="100%"
                          filter="url(#crt-noise)"
                          opacity="0.6"
                        />
                      </svg>
                    </div>
                  )}

                  <span className="crt-ch-indicator font-pixel">
                    CH {currentCh + 1}/{channels.length}
                  </span>

                  <div className="crt-scanlines" aria-hidden />
                  <div className="crt-glass-reflection" aria-hidden />
                  <div className="crt-vignette" aria-hidden />
                </div>
              </div>

              <TuningColumn />
            </div>

            {/* Control panel */}
            <div className="crt-controls">
              <span className="crt-brand font-pixel">HoneyVision&trade;</span>
              <div
                className="crt-dial"
                aria-hidden
                style={{ transform: `rotate(${dialRotation}deg)` }}
              >
                <span className="crt-dial-notch" />
              </div>
              <button
                className="crt-btn"
                aria-label="Previous channel"
                onClick={() => switchChannel(-1)}
              >
                &#9664;
              </button>
              <button
                className="crt-btn"
                aria-label="Next channel"
                onClick={() => switchChannel(1)}
              >
                &#9654;
              </button>
              <div className="crt-led" aria-hidden />
              <div className="crt-orange-btn" aria-hidden />
            </div>

            {/* Full-width speaker grille */}
            <div className="crt-speaker-grille" aria-hidden />
          </div>

          {/* Feet */}
          <div className="crt-feet" aria-hidden>
            <span className="crt-foot crt-foot-l" />
            <span className="crt-foot crt-foot-r" />
          </div>
        </div>

        <div className="crt-bridge-title crt-bridge-title--bottom">
          <h2 className="crt-label-bottom font-display">
            Find What Feels Like Them{' '}
            <svg
              className="crt-arrow-icon"
              width="44"
              height="22"
              viewBox="0 0 44 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 14C6 8 11 16 16 9C20 14 25 7 30 13C33 10 36 11.5 40 11C41.5 10.8 43 11.2 43.5 11"
                stroke="#1a0a2e"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M32 4C34.5 6.5 37 9 39.5 11"
                stroke="#1a0a2e"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M34.5 18.5C36 16 38.5 13 39.5 11"
                stroke="#1a0a2e"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </h2>
          <svg
            className="crt-title-squiggle"
            viewBox="0 0 80 6"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M2 4c6-4 12 4 18 0s12-4 18 0 12 4 18 0s12-4 18 0"
              stroke="rgba(26,10,46,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="crt-bridge-hint font-body">
            82 more ways to make their phone screen blur
          </p>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
