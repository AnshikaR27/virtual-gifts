'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, heroGiftSlugs } from './gift-catalog';

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

export function PhotoBooth() {
  const [track, setTrack] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pulling, setPulling] = useState(false);
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

  const advanceTrack = useCallback(() => {
    if (transitioning) return;
    playClick();
    userInteracted.current = true;
    setTransitioning(true);
    setPulling(true);

    setTimeout(() => {
      setTrack((t) => (t + 1) % heroGifts.length);
      setTransitioning(false);
    }, 400);

    setTimeout(() => setPulling(false), 500);
  }, [transitioning]);

  useEffect(() => {
    if (userInteracted.current || !isVisible) return;
    const id = setInterval(() => {
      setTransitioning(true);
      setPulling(true);
      setTimeout(() => {
        setTrack((t) => (t + 1) % heroGifts.length);
        setTransitioning(false);
      }, 400);
      setTimeout(() => setPulling(false), 500);
    }, 4000);
    return () => clearInterval(id);
  }, [isVisible]);

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
        <div className="booth-wrap mx-auto">
          {/* ─── SCRAPBOOK PHOTOBOOTH PANEL ─── */}
          <div className="booth-panel">
            {/* Gold sign */}
            <div className="booth-sign">
              <span className="booth-sign-deco">★</span>
              <span className="booth-sign-text font-display">PHOTO BOOTH</span>
              <span className="booth-sign-deco">★</span>
            </div>

            {/* Main area: left coin-panel + right curtain */}
            <div className="booth-main">
              {/* Left — kraft paper with coin panel */}
              <div className="booth-left">
                <div className="booth-coin">
                  <div className="booth-coin-displays">
                    <div className="booth-coin-screen font-pixel">
                      {String(track + 1).padStart(2, '0')}
                    </div>
                    <div className="booth-coin-screen font-pixel">
                      {String(heroGifts.length).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="booth-coin-heart">♥</div>
                  <div className="booth-coin-label font-pixel">INSERT 1₹</div>
                </div>
              </div>

              {/* Right — red velvet curtain */}
              <div className="booth-curtain" aria-hidden>
                <div className="booth-curtain-hearts">
                  <span>♥</span>
                  <span>♥</span>
                  <span>♥</span>
                </div>
              </div>
            </div>

            {/* Slot */}
            <div className="booth-slot-row">
              <div className="booth-slot" />
            </div>
          </div>

          {/* ─── PHOTO STRIP ─── */}
          <div className="booth-strip-area">
            <div className={`booth-strip ${pulling ? 'booth-strip-pull' : ''}`}>
              {heroGifts.map((g, i) => (
                <div
                  key={g.slug}
                  className={`booth-photo ${i === track ? 'booth-photo-active' : ''}`}
                  onClick={() => handlePhotoClick(g.slug)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${g.name}`}
                >
                  <div className="booth-photo-frame">
                    <span className="booth-photo-emoji">
                      {heroEmojis[g.slug] || g.emoji}
                    </span>
                  </div>
                  <span className="booth-photo-name font-handwritten">
                    {g.name}
                  </span>
                </div>
              ))}

              <button
                className="booth-pull-tab font-handwritten"
                onClick={advanceTrack}
                aria-label="Next photo"
              >
                PULL HERE ↓
              </button>
            </div>
          </div>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
