'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, heroGiftDescriptions } from './gift-catalog';

interface EnvelopeData {
  slug: string;
  color: string;
  flapColor: string;
  waxColor: string;
  waxColorDark: string;
  sealIcon: string;
  tilt: number;
  rank: number;
}

const envelopes: EnvelopeData[] = [
  {
    slug: 'the-proposal',
    color: '#E0D4F0',
    flapColor: '#D0C4E0',
    waxColor: '#D4AC0D',
    waxColorDark: '#9A7D0A',
    sealIcon: '◇',
    tilt: -1,
    rank: 1,
  },
  {
    slug: 'love-jar',
    color: '#F5EFE0',
    flapColor: '#E8DFD0',
    waxColor: '#C0392B',
    waxColorDark: '#922B21',
    sealIcon: '♥',
    tilt: -3,
    rank: 2,
  },
  {
    slug: 'wishing-dandelion',
    color: '#FFD6E0',
    flapColor: '#F0C4CE',
    waxColor: '#8E44AD',
    waxColorDark: '#6C3483',
    sealIcon: '★',
    tilt: 2,
    rank: 3,
  },
  {
    slug: 'spotify-wrapped',
    color: '#D4E8D4',
    flapColor: '#C2D8C2',
    waxColor: '#27AE60',
    waxColorDark: '#1E8449',
    sealIcon: '♪',
    tilt: 3,
    rank: 4,
  },
  {
    slug: 'sorry-puppy',
    color: '#F5E8C0',
    flapColor: '#E8DAB0',
    waxColor: '#E91E8C',
    waxColorDark: '#B8176E',
    sealIcon: '✿',
    tilt: -2,
    rank: 5,
  },
];

const heroEmojis: Record<string, string> = {
  'love-jar': '\u{1FAD9}',
  'wishing-dandelion': '\u{1F32C}️',
  'the-proposal': '\u{1F48D}',
  'spotify-wrapped': '\u{1F4CA}',
  'sorry-puppy': '\u{1F97A}',
};

function playClickSound() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {}
}

export function LoveLetterRack() {
  const [loading, setLoading] = useState(false);
  const targetSlug = useRef('');
  const router = useRouter();

  const handleTap = useCallback(
    (slug: string) => {
      if (loading) return;
      playClickSound();
      targetSlug.current = slug;
      router.prefetch(`/gift/${slug}`);
      setLoading(true);
    },
    [router, loading],
  );

  const handleLoadComplete = useCallback(() => {
    router.push(`/gift/${targetSlug.current}`);
  }, [router]);

  return (
    <>
      <section className="letter-rack-section">
        <div className="letter-rack-bg">
          <div className="letter-rack-glow" aria-hidden />

          <div className="px-4 pb-4 pt-8 text-center">
            <p
              className="font-handwritten text-[24px] font-bold md:text-[28px]"
              style={{ color: '#4A3728' }}
            >
              &#9733; top 5 letters everyone&apos;s sending &#9733;
            </p>
          </div>

          <div className="letter-scroll">
            <div className="letter-scroll-inner">
              <span className="letter-fan-favs-sticker font-pixel" aria-hidden>
                &#9733; FAN FAVS &#9733;
              </span>
              {envelopes.map((env) => {
                const gift = allGifts.find((g) => g.slug === env.slug)!;
                const emoji = heroEmojis[env.slug] || gift.emoji;
                const desc = heroGiftDescriptions[env.slug] || gift.description;

                return (
                  <button
                    key={env.slug}
                    className="letter-envelope"
                    style={
                      {
                        '--envelope-color': env.color,
                        '--envelope-flap': env.flapColor,
                        '--envelope-tilt': `${env.tilt}deg`,
                        '--wax-color': env.waxColor,
                        '--wax-color-dark': env.waxColorDark,
                      } as React.CSSProperties
                    }
                    onClick={() => handleTap(env.slug)}
                    aria-label={`Create ${gift.name}`}
                  >
                    <span className="letter-rank-badge font-pixel">
                      {env.rank}
                    </span>
                    <span className="letter-flap" aria-hidden />
                    <span className="letter-body-inner" aria-hidden />

                    <span className="letter-wax-seal">
                      <span className="letter-wax-seal-icon">
                        {env.sealIcon}
                      </span>
                    </span>

                    <span className="letter-front-content">
                      <span className="letter-front-emoji">{emoji}</span>
                      <span className="letter-front-text">
                        <span className="letter-front-name font-handwritten">
                          {gift.name}
                        </span>
                        <span className="letter-front-desc font-display">
                          {desc}
                        </span>
                      </span>
                    </span>

                    <span className="letter-address font-handwritten">
                      To: My Person &#9825;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
