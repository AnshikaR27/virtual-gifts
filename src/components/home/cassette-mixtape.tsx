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

export function CassetteMixtape() {
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const userInteracted = useRef(false);
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
    (next: number, direction: 'ff' | 'rew' = 'ff') => {
      if (transitioning) return;
      playClick();
      userInteracted.current = true;
      setTransitioning(true);
      setBouncing(true);
      setPlaying(true);

      setTimeout(() => {
        setTrack(
          ((next % heroGifts.length) + heroGifts.length) % heroGifts.length,
        );
        setTransitioning(false);
      }, 400);

      setTimeout(() => setBouncing(false), 500);
    },
    [transitioning],
  );

  useEffect(() => {
    if (userInteracted.current || !isVisible) return;
    const id = setInterval(() => {
      setTransitioning(true);
      setBouncing(true);
      setTimeout(() => {
        setTrack((t) => (t + 1) % heroGifts.length);
        setTransitioning(false);
      }, 400);
      setTimeout(() => setBouncing(false), 500);
    }, 4000);
    return () => clearInterval(id);
  }, [isVisible]);

  const handleStop = useCallback(() => {
    playClick();
    userInteracted.current = true;
    setPlaying(false);
  }, []);

  const handlePlay = useCallback(() => {
    playClick();
    userInteracted.current = true;
    setPlaying(true);
  }, []);

  const gift = heroGifts[track];

  const handleLabelClick = useCallback(
    (e: React.MouseEvent) => {
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
        <div className="mx-auto" style={{ maxWidth: 360 }}>
          {/* Cassette body */}
          <div className={`cassette-body ${bouncing ? 'cassette-bounce' : ''}`}>
            {/* Screw dots */}
            <div className="cassette-screw cassette-screw-tl" />
            <div className="cassette-screw cassette-screw-tr" />
            <div className="cassette-screw cassette-screw-bl" />
            <div className="cassette-screw cassette-screw-br" />

            {/* Sticker */}
            <span className="cassette-sticker font-pixel">
              ★ SIDE A: GREATEST HITS ★
            </span>

            {/* Subtle scratch mark */}
            <div className="cassette-scratch" aria-hidden />

            {/* TYPE I NORMAL badge */}
            <span className="cassette-type-badge font-pixel">
              TYPE I NORMAL
            </span>

            {/* Label area */}
            <div
              className="cassette-label"
              onClick={handleLabelClick}
              role="button"
              tabIndex={0}
              aria-label={`Open ${gift.name}`}
            >
              <div className="cassette-label-brand font-pixel">
                HoneyHearts Mix &apos;99
              </div>

              <div className="cassette-label-fields">
                <div className="cassette-label-row">
                  <span className="cassette-label-key font-pixel">SIDE A</span>
                  <span className="cassette-label-divider" />
                </div>

                <div className="cassette-label-title-row">
                  <span className="cassette-label-key font-pixel">TITLE:</span>
                  <span
                    className={`cassette-label-value font-handwritten ${transitioning ? 'cassette-label-exit' : 'cassette-label-enter'}`}
                  >
                    {heroEmojis[gift.slug] || gift.emoji} {gift.name}
                  </span>
                </div>

                <div
                  className={`cassette-label-desc ${transitioning ? 'cassette-label-exit' : 'cassette-label-enter'}`}
                >
                  <span className="cassette-label-desc-text font-body">
                    &ldquo;{heroGiftDescriptions[gift.slug]}&rdquo;
                  </span>
                </div>

                <div className="cassette-label-bottom">
                  <span className="cassette-label-key font-pixel">
                    TRACK {track + 1}/{heroGifts.length}
                  </span>
                  <span className="cassette-label-doodle">
                    {heroEmojis[gift.slug] || gift.emoji}
                  </span>
                </div>
              </div>

              <span className="cassette-tap-hint font-pixel">
                tap to open gift
              </span>
            </div>

            {/* Hub area */}
            <div className="cassette-hub-area">
              <div className="cassette-hub-window cassette-hub-window-left">
                <div
                  className={`cassette-reel ${playing ? 'cassette-reel-spin' : ''}`}
                >
                  <div className="cassette-reel-spoke" />
                  <div className="cassette-reel-spoke cassette-reel-spoke-2" />
                  <div className="cassette-reel-spoke cassette-reel-spoke-3" />
                  <div className="cassette-reel-center" />
                </div>
              </div>

              <div className="cassette-tape-bridge">
                <div className="cassette-tape-line" />
              </div>

              <div className="cassette-hub-window cassette-hub-window-right">
                <div
                  className={`cassette-reel ${playing ? 'cassette-reel-spin' : ''}`}
                >
                  <div className="cassette-reel-spoke" />
                  <div className="cassette-reel-spoke cassette-reel-spoke-2" />
                  <div className="cassette-reel-spoke cassette-reel-spoke-3" />
                  <div className="cassette-reel-center" />
                </div>
              </div>

              <span className="cassette-side-emboss font-pixel">SIDE A</span>
            </div>

            {/* Dolby badge */}
            <div className="cassette-dolby">
              <span className="cassette-dolby-text font-pixel">DOLBY B NR</span>
            </div>

            {/* Bottom stamp */}
            <div className="cassette-stamp font-pixel">MADE IN INDIA</div>

            {/* BIAS NORMAL */}
            <span className="cassette-bias font-pixel">BIAS NORMAL</span>
          </div>

          {/* Tape deck controls */}
          <div className="tape-deck">
            <div className="tape-deck-buttons">
              <button
                className="tape-deck-btn"
                onClick={() => changeTrack(track - 1, 'rew')}
                aria-label="Rewind"
              >
                <span className="tape-deck-btn-icon font-pixel">◀◀</span>
                <span className="tape-deck-btn-label font-pixel">REW</span>
              </button>
              <button
                className="tape-deck-btn"
                onClick={playing ? handleStop : handlePlay}
                aria-label={playing ? 'Stop' : 'Play'}
              >
                <span className="tape-deck-btn-icon font-pixel">
                  {playing ? '■' : '▶'}
                </span>
                <span className="tape-deck-btn-label font-pixel">
                  {playing ? 'STOP' : 'PLAY'}
                </span>
              </button>
              <button
                className="tape-deck-btn"
                onClick={() => changeTrack(track + 1, 'ff')}
                aria-label="Fast forward"
              >
                <span className="tape-deck-btn-icon font-pixel">▶▶</span>
                <span className="tape-deck-btn-label font-pixel">FF</span>
              </button>
            </div>

            <div className="tape-deck-lcd font-pixel">
              TRK 0{track + 1}/0{heroGifts.length}
            </div>
          </div>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
