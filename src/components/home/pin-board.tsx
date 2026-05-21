'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, heroGiftDescriptions } from './gift-catalog';

interface PinCard {
  slug: string;
  emoji: string;
  label: string;
  tilt: number;
  top: string;
  left: string;
  mobileTop: string;
  mobileLeft: string;
  pinColor: string;
}

const pins: PinCard[] = [
  {
    slug: 'the-proposal',
    emoji: '\u{1F48D}',
    label: 'Proposal',
    tilt: -3,
    top: '12%',
    left: '6%',
    mobileTop: '3%',
    mobileLeft: '4%',
    pinColor: '#C4917B',
  },
  {
    slug: 'love-jar',
    emoji: '\u{1FAD9}',
    label: 'Love Jar',
    tilt: 2,
    top: '8%',
    left: '34%',
    mobileTop: '3%',
    mobileLeft: '52%',
    pinColor: '#C4917B',
  },
  {
    slug: 'wishing-dandelion',
    emoji: '\u{1F32C}️',
    label: 'Dandelion',
    tilt: -1.5,
    top: '38%',
    left: '18%',
    mobileTop: '36%',
    mobileLeft: '4%',
    pinColor: '#C4917B',
  },
  {
    slug: 'spotify-wrapped',
    emoji: '\u{1F4CA}',
    label: 'Wrapped',
    tilt: 3.5,
    top: '10%',
    left: '64%',
    mobileTop: '36%',
    mobileLeft: '52%',
    pinColor: '#C4917B',
  },
  {
    slug: 'sorry-puppy',
    emoji: '\u{1F97A}',
    label: 'Puppy',
    tilt: -2,
    top: '42%',
    left: '55%',
    mobileTop: '68%',
    mobileLeft: '28%',
    pinColor: '#C4917B',
  },
];

function PushPin({ color }: { color: string }) {
  return (
    <svg
      className="pin-board-pushpin"
      viewBox="0 0 20 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="8" r="7" fill={color} />
      <circle
        cx="10"
        cy="8"
        r="7"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="0.8"
      />
      <ellipse cx="8" cy="6" rx="2.5" ry="1.8" fill="white" opacity="0.35" />
      <rect x="9" y="14" width="2" height="8" rx="1" fill="#999" />
      <rect
        x="9"
        y="14"
        width="2"
        height="8"
        rx="1"
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function HeartClipDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="heart-full" clipPathUnits="objectBoundingBox">
          <path d="M0.5,0.12 C0.5,0.04 0.37,0 0.25,0.015 C0.1,0.04 0,0.2 0,0.35 C0,0.55 0.15,0.78 0.5,1.0 C0.85,0.78 1.0,0.55 1.0,0.35 C1.0,0.2 0.9,0.04 0.75,0.015 C0.63,0 0.5,0.04 0.5,0.12 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function PinBoard() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [closingSlug, setClosingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const targetSlug = useRef('');
  const router = useRouter();

  const handleToggle = useCallback((slug: string) => {
    setOpenSlug((prev) => {
      if (prev === slug) {
        setClosingSlug(slug);
        setTimeout(() => setClosingSlug(null), 700);
        return null;
      }
      if (prev) {
        setClosingSlug(prev);
        setTimeout(() => setClosingSlug(null), 700);
      }
      return slug;
    });
  }, []);

  const handleNavigate = useCallback(
    (slug: string, e: React.MouseEvent) => {
      e.stopPropagation();
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
      <section className="pin-board-section">
        <div className="pin-board-title">
          <h2 className="pin-board-heading font-display">
            For Your Person{' '}
            <svg
              className="pin-board-heart-icon"
              width="38"
              height="35"
              viewBox="0 0 38 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="pin-heart-grad"
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
                fill="url(#pin-heart-grad)"
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
        </div>

        <div className="pin-board-frame">
          <div className="pin-board-surface">
            <HeartClipDefs />

            {/* Decorative sticker */}
            <span className="pin-board-sticker font-handwritten" aria-hidden>
              <PushPin color="#C4917B" />
              Top 5 ♥
            </span>

            {pins.map((pin, i) => {
              const gift = allGifts.find((g) => g.slug === pin.slug)!;
              const isOpen = openSlug === pin.slug;
              const isClosing = closingSlug === pin.slug;
              return (
                <div
                  key={pin.slug}
                  className={`pin-board-card-wrapper${isOpen ? ' is-open' : ''}${isClosing ? ' is-closing' : ''}`}
                  style={
                    {
                      '--pin-tilt': `${pin.tilt}deg`,
                      '--pin-top': pin.top,
                      '--pin-left': pin.left,
                      '--pin-top-m': pin.mobileTop,
                      '--pin-left-m': pin.mobileLeft,
                    } as React.CSSProperties
                  }
                  onClick={() => handleToggle(pin.slug)}
                >
                  <PushPin color={pin.pinColor} />
                  <div className="pin-board-card-inner">
                    {/* Base: full heart, description (revealed when lid lifts) */}
                    <div className="heart-base">
                      <span className="heart-base-desc font-handwritten">
                        {heroGiftDescriptions[pin.slug] || gift.description}
                      </span>
                      <button
                        className="heart-base-btn font-handwritten"
                        onClick={(e) => handleNavigate(pin.slug, e)}
                        aria-label={`Open ${gift.name}`}
                      >
                        Open &rarr;
                      </button>
                    </div>

                    {/* Lid: full heart, hinges up from bottom tip like a safety pin */}
                    <div className="heart-lid">
                      <div className="heart-lid-front">
                        <span className="pin-board-rank font-handwritten">
                          {i + 1}
                        </span>
                        <span className="heart-cover-emoji">{pin.emoji}</span>
                        <span className="heart-cover-name font-handwritten">
                          {pin.label}
                        </span>
                      </div>
                      <div className="heart-lid-inner" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pin-board-title pin-board-title--bottom">
          <h2 className="pin-board-heading font-display">
            Find What Feels Like Them{' '}
            <svg
              className="pin-board-arrow-icon"
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
          <p className="pin-board-hint font-body">
            82 more ways to make their phone screen blur
          </p>
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
