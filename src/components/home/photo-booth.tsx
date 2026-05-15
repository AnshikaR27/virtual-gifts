'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, heroGiftSlugs, heroGiftDescriptions } from './gift-catalog';

const heroGifts = heroGiftSlugs
  .map((slug) => allGifts.find((g) => g.slug === slug)!)
  .filter(Boolean);

const heroEmojis: Record<string, string> = {
  'love-jar': '🫙',
  'wishing-dandelion': '🌬️',
  'the-proposal': '💍',
  'spotify-wrapped': '📊',
  'sorry-puppy': '🥺',
};

const PHOTO_HEIGHT = 94;
const VISIBLE_PHOTOS = 3;

export function PhotoBooth() {
  const [track, setTrack] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [printFlash, setPrintFlash] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const userInteracted = useRef(false);
  const targetSlug = useRef(heroGifts[0].slug);
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

  const changeTrack = useCallback(
    (next: number) => {
      if (transitioning) return;
      playClick();
      userInteracted.current = true;
      setTransitioning(true);
      setPrintFlash(true);

      setTimeout(() => {
        setTrack(
          ((next % heroGifts.length) + heroGifts.length) % heroGifts.length,
        );
        setTransitioning(false);
      }, 400);

      setTimeout(() => setPrintFlash(false), 600);
    },
    [transitioning],
  );

  useEffect(() => {
    if (userInteracted.current || !isVisible) return;
    const id = setInterval(() => {
      setTransitioning(true);
      setPrintFlash(true);
      setTimeout(() => {
        setTrack((t) => (t + 1) % heroGifts.length);
        setTransitioning(false);
      }, 400);
      setTimeout(() => setPrintFlash(false), 600);
    }, 4000);
    return () => clearInterval(id);
  }, [isVisible]);

  const gift = heroGifts[track];

  const handlePhotoClick = useCallback(
    (slug: string) => {
      playClick();
      targetSlug.current = slug;
      router.prefetch(`/gift/${slug}`);
      setLoading(true);
    },
    [router],
  );

  const handleLoadComplete = useCallback(() => {
    router.push(`/gift/${targetSlug.current}`);
  }, [router]);

  const clampedOffset = Math.min(
    track * PHOTO_HEIGHT,
    (heroGifts.length - VISIBLE_PHOTOS) * PHOTO_HEIGHT,
  );

  return (
    <>
      <div className="px-4 pb-4 pt-10 text-center">
        <p
          className="font-handwritten text-[26px] text-white/80 md:text-[30px]"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          ★ this week&apos;s faves ★
        </p>
      </div>

      <section ref={sectionRef} className="px-4 pb-8 md:pb-12">
        <div className="pb-wrapper mx-auto">
          {/* ─── MACHINE ─── */}
          <div className="pb-machine">
            {/* Marquee header */}
            <div className="pb-marquee">
              <span className="pb-marquee-star">★</span>
              <span className="pb-marquee-text font-display">
                HoneyHearts Photo Booth
              </span>
              <span className="pb-marquee-star">♥</span>
            </div>

            {/* Machine body */}
            <div className="pb-body">
              {/* Viewfinder */}
              <div className="pb-viewfinder">
                <span className="pb-rec font-pixel">● REC</span>
                <div
                  className={`pb-preview ${transitioning ? 'pb-preview-exit' : 'pb-preview-enter'}`}
                >
                  <span className="pb-preview-emoji">
                    {heroEmojis[gift.slug] || gift.emoji}
                  </span>
                  <span className="pb-preview-name font-handwritten">
                    {gift.name}
                  </span>
                </div>
              </div>

              <p className="pb-smile font-handwritten">smile! 📸</p>

              {/* Camera row: vents + lens + flash + vents */}
              <div className="pb-camera-row">
                <div className="pb-vents">
                  <div className="pb-vent" />
                  <div className="pb-vent" />
                  <div className="pb-vent" />
                </div>

                <div className="pb-lens">
                  <div className="pb-lens-ring">
                    <div className="pb-lens-glass">
                      <div className="pb-lens-highlight" />
                    </div>
                  </div>
                </div>

                <div
                  className={`pb-flash ${printFlash ? 'pb-flash-fire' : ''}`}
                />

                <div className="pb-vents">
                  <div className="pb-vent" />
                  <div className="pb-vent" />
                  <div className="pb-vent" />
                </div>
              </div>

              {/* Control panel */}
              <div className="pb-controls">
                <div className="pb-ctrl-row">
                  <button
                    className="pb-ctrl-btn"
                    onClick={() => changeTrack(track - 1)}
                    aria-label="Previous photo"
                  >
                    <span className="pb-ctrl-icon font-pixel">▲</span>
                    <span className="pb-ctrl-label font-pixel">PREV</span>
                  </button>

                  <button
                    className={`pb-ctrl-btn pb-ctrl-print ${printFlash ? 'pb-print-lit' : ''}`}
                    aria-label="Print"
                  >
                    <span className="pb-print-dot" />
                    <span className="pb-ctrl-label font-pixel">PRINT</span>
                  </button>

                  <button
                    className="pb-ctrl-btn"
                    onClick={() => changeTrack(track + 1)}
                    aria-label="Next photo"
                  >
                    <span className="pb-ctrl-icon font-pixel">▼</span>
                    <span className="pb-ctrl-label font-pixel">NEXT</span>
                  </button>
                </div>

                <div className="pb-led font-pixel">
                  PHOTO {track + 1} of {heroGifts.length}
                </div>
              </div>

              {/* Chrome accent strips */}
              <div className="pb-chrome pb-chrome-l" />
              <div className="pb-chrome pb-chrome-r" />

              {/* Decorative insert-coin */}
              <div className="pb-coin font-pixel">Insert Coin</div>

              {/* Slot */}
              <div className="pb-slot">
                <div className="pb-slot-inner" />
              </div>
            </div>

            {/* Bottom stamp */}
            <div className="pb-bottom-stamp font-pixel">Made in 1999</div>
          </div>

          {/* ─── STRIP EMERGING FROM SLOT ─── */}
          <div className="pb-strip-area">
            <div className="pb-strip-shadow" />
            <div
              className="pb-strip-clip"
              style={{
                height: VISIBLE_PHOTOS * PHOTO_HEIGHT + 20,
              }}
            >
              <div
                className="pb-strip"
                style={{
                  transform: `translateY(${-clampedOffset}px)`,
                }}
              >
                {heroGifts.map((g, i) => (
                  <div
                    key={g.slug}
                    className={`pb-photo ${i === track ? 'pb-photo-active' : ''}`}
                    onClick={() => handlePhotoClick(g.slug)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${g.name}`}
                  >
                    <div className="pb-photo-frame">
                      <span className="pb-photo-emoji">
                        {heroEmojis[g.slug] || g.emoji}
                      </span>
                    </div>
                    <span className="pb-photo-caption font-handwritten">
                      {g.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pb-strip-fade" />
          </div>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
