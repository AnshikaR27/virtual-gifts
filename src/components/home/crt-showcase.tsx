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
      <div className="px-4 pb-3 pt-10 text-center">
        <p
          className="font-handwritten text-[24px] md:text-[24px]"
          style={{
            color: '#8B6F4E',
            textShadow: '0 1px 3px rgba(139,111,78,0.2)',
          }}
        >
          &#9733; now showing &mdash; fan favorites &#9733;
        </p>
      </div>

      <section className="crt-section" ref={sectionRef}>
        <div className="crt-tv">
          {/* Screen area */}
          <div className="crt-screen-bezel">
            <div
              className="crt-screen"
              style={{ '--screen-tint': channel.tint } as React.CSSProperties}
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

              {/* TV static noise overlay */}
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

              {/* Channel indicator */}
              <span className="crt-ch-indicator font-pixel">
                CH {currentCh + 1}/{channels.length}
              </span>

              {/* CRT overlays */}
              <div className="crt-scanlines" aria-hidden />
              <div className="crt-glass-reflection" aria-hidden />
              <div className="crt-vignette" aria-hidden />
            </div>
          </div>

          {/* Control panel */}
          <div className="crt-controls">
            <div className="crt-speaker" aria-hidden />
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
            <span className="crt-brand font-pixel">HoneyVision&trade;</span>
          </div>
        </div>

        {/* Feet */}
        <div className="crt-feet" aria-hidden>
          <span className="crt-foot crt-foot-l" />
          <span className="crt-foot crt-foot-r" />
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
