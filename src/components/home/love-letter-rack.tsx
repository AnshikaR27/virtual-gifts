'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, heroGiftSlugs, heroGiftDescriptions } from './gift-catalog';

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

function playPaperSound() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] =
        (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.15);

    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crack.type = 'square';
    crack.frequency.setValueAtTime(200, now);
    crack.frequency.exponentialRampToValueAtTime(80, now + 0.05);
    crackGain.gain.setValueAtTime(0.08, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    crack.connect(crackGain);
    crackGain.connect(ctx.destination);
    crack.start(now);
    crack.stop(now + 0.06);
  } catch {}
}

function playSealSound() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {}
}

export function LoveLetterRack() {
  const [openEnvelope, setOpenEnvelope] = useState<string | null>(null);
  const [animatingOut, setAnimatingOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const targetSlug = useRef('');
  const router = useRouter();

  const handleTap = useCallback(
    (slug: string) => {
      if (animatingOut) return;

      if (openEnvelope === slug) {
        playSealSound();
        setAnimatingOut(slug);
        setTimeout(() => {
          setOpenEnvelope(null);
          setAnimatingOut(null);
        }, 500);
        return;
      }

      if (openEnvelope) {
        playSealSound();
        setAnimatingOut(openEnvelope);
        setTimeout(() => {
          setOpenEnvelope(null);
          setAnimatingOut(null);
          setTimeout(() => {
            playPaperSound();
            setOpenEnvelope(slug);
          }, 50);
        }, 500);
        return;
      }

      playPaperSound();
      setOpenEnvelope(slug);
    },
    [openEnvelope, animatingOut],
  );

  const handleNavigate = useCallback(
    (slug: string) => {
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
      <div className="px-4 pb-3 pt-10 text-center">
        <p
          className="font-handwritten text-[24px] font-bold md:text-[28px]"
          style={{
            color: '#8B6F4E',
            textShadow: '0 1px 3px rgba(139,111,78,0.2)',
          }}
        >
          &#9733; top 5 letters everyone&apos;s sending &#9733;
        </p>
      </div>

      <section className="letter-rack-section">
        <div className="letter-desk">
          <div className="letter-desk-surface">
            <span className="letter-fan-favs-sticker font-pixel" aria-hidden>
              &#9733; FAN FAVS &#9733;
            </span>
            {envelopes.map((env) => {
              const gift = allGifts.find((g) => g.slug === env.slug)!;
              const isOpen = openEnvelope === env.slug;
              const isClosing = animatingOut === env.slug;

              return (
                <div key={env.slug} className="letter-slot">
                  <button
                    className={`letter-envelope ${isOpen ? 'letter-envelope-open' : ''} ${isClosing ? 'letter-envelope-closing' : ''}`}
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
                    aria-label={`Open ${gift.name} letter`}
                  >
                    <span className="letter-rank-badge font-pixel">
                      {env.rank}
                    </span>
                    <span className="letter-flap" aria-hidden />
                    <span className="letter-body-inner" aria-hidden />

                    <span className="letter-address font-handwritten">
                      To: My Person &#9825;
                    </span>

                    <span className="letter-stamp">&#9829;</span>

                    <span className="letter-wax-seal">
                      <span className="letter-wax-seal-icon">
                        {env.sealIcon}
                      </span>
                    </span>

                    {(isOpen || isClosing) && (
                      <span className="letter-wax-crack" aria-hidden />
                    )}
                  </button>

                  {isOpen && !isClosing && (
                    <div className="letter-card">
                      <div className="letter-card-inner">
                        <span className="letter-card-emoji">
                          {heroEmojis[env.slug] || gift.emoji}
                        </span>
                        <h3 className="letter-card-name font-handwritten">
                          {gift.name}
                        </h3>
                        <p className="letter-card-desc font-display">
                          {heroGiftDescriptions[env.slug] || gift.description}
                        </p>
                        <button
                          className="letter-card-cta font-body"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigate(env.slug);
                          }}
                        >
                          Create This Gift &rarr;
                        </button>
                        <button
                          className="letter-card-close font-handwritten"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTap(env.slug);
                          }}
                        >
                          &#10005; seal it back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
