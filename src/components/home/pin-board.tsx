'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GiftLoading } from '@/components/gift-loading';

interface PinCard {
  slug: string;
  emoji: string;
  title: string;
  description: string;
  tilt: number;
  color: string;
}

const pins: PinCard[] = [
  {
    slug: 'the-proposal',
    emoji: '\u{1F48D}',
    title: 'The Proposal',
    description: 'The “No” button runs away',
    tilt: -3,
    color: '#FFD6E5',
  },
  {
    slug: 'wishing-dandelion',
    emoji: '\u{1F32C}️',
    title: 'Wishing Dandelion',
    description: 'Blow to scatter seeds of wishes',
    tilt: -1.5,
    color: '#C9F0DC',
  },
  {
    slug: 'spotify-wrapped',
    emoji: '\u{1F4CA}',
    title: 'Spotify Wrapped',
    description: 'Your relationship, Wrapped-style',
    tilt: 3,
    color: '#FFE5A3',
  },
  {
    slug: 'sorry-puppy',
    emoji: '\u{1F97A}',
    title: 'Sorry Puppy',
    description: 'Your taps clear the rain away',
    tilt: -2,
    color: '#FFCBA4',
  },
];

function Clothespin() {
  return (
    <svg
      className="pin-board-clothespin"
      viewBox="0 0 28 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="9" y="13" width="10" height="25" rx="1.5" fill="#D4B896" />
      <rect
        x="9"
        y="13"
        width="10"
        height="25"
        rx="1.5"
        fill="none"
        stroke="#C0A47C"
        strokeWidth="0.5"
      />
      <line
        x1="14"
        y1="14"
        x2="14"
        y2="37"
        stroke="#C0A47C"
        strokeWidth="0.3"
        strokeDasharray="1 1.5"
      />
      <rect
        x="10.5"
        y="15"
        width="0.8"
        height="21"
        rx="0.4"
        fill="rgba(255,255,255,0.12)"
      />
      <rect
        x="16.5"
        y="15"
        width="0.8"
        height="21"
        rx="0.4"
        fill="rgba(255,255,255,0.12)"
      />
      <rect x="7.5" y="22" width="13" height="4" rx="1.2" fill="#B8AFA0" />
      <rect
        x="7.5"
        y="22"
        width="13"
        height="4"
        rx="1.2"
        fill="none"
        stroke="#A09484"
        strokeWidth="0.5"
      />
      <path
        d="M14 17C13.2 16 9 13 8 10.5C7 8 8.5 6 10.5 6.1C11.8 6.15 12.8 7 14 8.5C15 7.2 16.2 6.3 17.5 6.3C19.5 6.4 21 8.2 20.5 10.5C19.8 13 14.8 16 14 17Z"
        fill="white"
      />
      <path
        d="M14 17C13.2 16 9 13 8 10.5C7 8 8.5 6 10.5 6.1C11.8 6.15 12.8 7 14 8.5C15 7.2 16.2 6.3 17.5 6.3C19.5 6.4 21 8.2 20.5 10.5C19.8 13 14.8 16 14 17Z"
        fill="none"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="0.5"
      />
      <ellipse
        cx="11"
        cy="9.5"
        rx="1.8"
        ry="1.2"
        fill="white"
        opacity="0.35"
        transform="rotate(-15 11 9.5)"
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

        <div className="pin-board-surface">
          <div className="pin-board-cards">
            {pins.map((pin) => (
              <div
                key={pin.slug}
                className="pin-board-card"
                style={
                  { '--card-tilt': `${pin.tilt}deg` } as React.CSSProperties
                }
                onClick={() => handleNavigate(pin.slug)}
              >
                <Clothespin />
                <div className="pin-board-polaroid">
                  <div
                    className="pin-board-photo"
                    style={{ background: pin.color }}
                  >
                    <span className="pin-board-card-emoji">{pin.emoji}</span>
                  </div>
                  <div className="pin-board-caption">
                    <span className="pin-board-card-title font-display">
                      {pin.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
