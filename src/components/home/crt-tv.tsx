'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, heroGiftSlugs, heroGiftDescriptions } from './gift-catalog';

const heroGifts = heroGiftSlugs
  .map((slug) => allGifts.find((g) => g.slug === slug)!)
  .filter(Boolean);

const channelBgs = [
  'linear-gradient(135deg, #FFB6C1 0%, #FF85A2 100%)',
  'linear-gradient(135deg, #DCD0FF 0%, #B8A9E8 100%)',
  'linear-gradient(135deg, #A8F0D0 0%, #7DDBB5 100%)',
  'linear-gradient(135deg, #FFE066 0%, #F5C842 100%)',
  'linear-gradient(135deg, #FFB4A2 0%, #FF8A75 100%)',
];

const heroEmojis: Record<string, string> = {
  'love-jar': '🫙',
  'wishing-dandelion': '🌬️',
  'the-proposal': '💍',
  'spotify-wrapped': '📊',
  'sorry-puppy': '🥺',
};

export function CrtTv() {
  const [channel, setChannel] = useState(0);
  const [isStatic, setIsStatic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [showChannelOsd, setShowChannelOsd] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartRef = useRef(0);
  const swipedRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setShowChannelOsd(true);
    const t = setTimeout(() => setShowChannelOsd(false), 1500);
    return () => clearTimeout(t);
  }, [channel]);

  const changeChannel = useCallback(
    (next: number) => {
      if (isStatic) return;
      playClick();
      setUserInteracted(true);
      setIsStatic(true);
      setTimeout(() => {
        setChannel(
          ((next % heroGifts.length) + heroGifts.length) % heroGifts.length,
        );
        setIsStatic(false);
      }, 300);
    },
    [isStatic],
  );

  useEffect(() => {
    if (userInteracted || !isVisible) return;
    const id = setInterval(() => {
      setIsStatic(true);
      setTimeout(() => {
        setChannel((c) => (c + 1) % heroGifts.length);
        setIsStatic(false);
      }, 300);
    }, 4000);
    return () => clearInterval(id);
  }, [userInteracted, isVisible]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    swipedRef.current = false;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = e.changedTouches[0].clientX - touchStartRef.current;
      if (Math.abs(diff) > 50) {
        swipedRef.current = true;
        changeChannel(diff > 0 ? channel - 1 : channel + 1);
      }
    },
    [channel, changeChannel],
  );

  const gift = heroGifts[channel];

  const handleWatch = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (swipedRef.current) {
        swipedRef.current = false;
        return;
      }
      e.preventDefault();
      playClick();
      router.prefetch(`/gift/${gift.slug}`);
      setLoading(true);
    },
    [router, gift.slug],
  );

  const handleLoadComplete = useCallback(() => {
    router.push(`/gift/${gift.slug}`);
  }, [router, gift.slug]);

  return (
    <>
      <div className="px-4 pb-8 pt-10 text-center">
        <p
          className="font-display text-[22px] font-semibold leading-snug text-white md:text-[28px]"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          87 ways to make someone ugly cry (with love) 💕
        </p>
        <p className="mt-2 font-body text-[14px] text-white/60">
          Pick an occasion. Pick a gift. Make their phone screen blur.
        </p>
      </div>

      <section ref={sectionRef} className="px-4 pb-8 md:pb-12">
        <div className="mx-auto" style={{ maxWidth: 550 }}>
          <div className="crt-tv-body">
            <span className="crt-sticker font-pixel">MOST LOVED ★</span>
            <div className="crt-tv-bezel">
              <div
                className="crt-tv-screen"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleWatch}
                role="button"
                tabIndex={0}
                aria-label={`Watch ${gift.name}`}
                style={{ background: channelBgs[channel] }}
              >
                <div className="crt-scanlines" />
                <div className="crt-glass" />

                {isStatic && (
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
                        opacity="0.5"
                      />
                    </svg>
                  </div>
                )}

                {showChannelOsd && !isStatic && (
                  <span className="crt-channel-osd font-pixel">
                    CH 0{channel + 1}
                  </span>
                )}

                <div
                  className="crt-channel-content"
                  style={{ opacity: isStatic ? 0 : 1 }}
                >
                  <span className="crt-emoji">
                    {heroEmojis[gift.slug] || gift.emoji}
                  </span>
                  <h3
                    className="font-pixel text-[24px] text-white md:text-[28px]"
                    style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
                  >
                    {gift.name}
                  </h3>
                  <p
                    className="font-pixel text-[14px] text-white/80 md:text-[16px]"
                    style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.2)' }}
                  >
                    {heroGiftDescriptions[gift.slug]}
                  </p>
                </div>

                <span className="crt-tap-hint font-pixel">▶ tap to create</span>
              </div>
            </div>

            <div className="crt-controls-panel">
              <div className="crt-speaker-grille" aria-hidden />

              <div className="crt-controls-strip">
                <div className="crt-channel-buttons">
                  {heroGifts.map((_, i) => (
                    <button
                      key={i}
                      className={`crt-ch-btn font-pixel ${i === channel ? 'crt-ch-btn-active' : ''}`}
                      onClick={() => changeChannel(i)}
                      aria-label={`Channel ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="crt-power-group">
                  <button
                    className="crt-power-btn"
                    aria-label="Power (decorative)"
                  >
                    <span className="crt-power-icon" />
                  </button>
                  <div className="crt-power-led" />
                </div>
              </div>

              <div className="crt-brand-area">
                <span className="crt-brand-label font-pixel">HONEYHEARTS</span>
                <span className="crt-model-label font-pixel">HH-2026</span>
              </div>
            </div>
          </div>

          <div className="crt-stand" />
          <div className="crt-stand-feet">
            <div className="crt-foot" />
            <div className="crt-foot" />
          </div>

          <div className="crt-nav">
            <button
              className="win98-btn text-[14px]"
              onClick={() => changeChannel(channel - 1)}
              aria-label="Previous channel"
            >
              ◀ PREV
            </button>
            <div className="flex gap-2">
              {heroGifts.map((_, i) => (
                <span
                  key={i}
                  className={`crt-dot font-pixel text-[12px] ${i === channel ? 'crt-dot-active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => changeChannel(i)}
                >
                  {i + 1}
                </span>
              ))}
            </div>
            <button
              className="win98-btn text-[14px]"
              onClick={() => changeChannel(channel + 1)}
              aria-label="Next channel"
            >
              NEXT ▶
            </button>
          </div>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
