'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GiftLoading } from '@/components/gift-loading';
import { heroGiftDescriptions } from './gift-catalog';

interface PinCard {
  slug: string;
  emoji: string;
  title: string;
  description: string;
  tilt: number;
}

const pins: PinCard[] = [
  {
    slug: 'the-proposal',
    emoji: '\u{1F48D}',
    title: 'The Proposal',
    description: 'The "No" button runs away',
    tilt: -3,
  },
  {
    slug: 'love-jar',
    emoji: '\u{1FAD9}',
    title: 'Love Jar',
    description: 'Shake to pull random love notes',
    tilt: 2,
  },
  {
    slug: 'wishing-dandelion',
    emoji: '\u{1F32C}️',
    title: 'Wishing Dandelion',
    description: 'Blow to scatter seeds of wishes',
    tilt: -1.5,
  },
  {
    slug: 'spotify-wrapped',
    emoji: '\u{1F4CA}',
    title: 'Spotify Wrapped',
    description: 'Your relationship, Wrapped-style',
    tilt: 3,
  },
  {
    slug: 'sorry-puppy',
    emoji: '\u{1F97A}',
    title: 'Sorry Puppy',
    description: 'Your taps clear the rain away',
    tilt: -2,
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

export function PinBoard() {
  const [loading, setLoading] = useState(false);
  const targetSlug = useRef('');
  const router = useRouter();

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
            <span className="pin-board-sticker font-handwritten" aria-hidden>
              <PushPin color="#C4917B" />
              Top 5 ♥
            </span>

            <div className="pin-board-cards">
              {pins.map((pin, i) => (
                <div
                  key={pin.slug}
                  className="pin-board-card"
                  style={
                    { '--card-tilt': `${pin.tilt}deg` } as React.CSSProperties
                  }
                  onClick={() => handleNavigate(pin.slug)}
                >
                  <PushPin color="#C4917B" />
                  <div className="pin-board-card-body">
                    <span className="pin-board-card-rank font-handwritten">
                      {i + 1}
                    </span>
                    <span className="pin-board-card-emoji">{pin.emoji}</span>
                    <span className="pin-board-card-title font-handwritten">
                      {pin.title}
                    </span>
                    <span className="pin-board-card-desc font-handwritten">
                      {pin.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
