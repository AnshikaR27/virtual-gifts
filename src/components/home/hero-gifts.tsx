'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GiftLoading } from '@/components/gift-loading';
import {
  allGifts,
  heroGiftSlugs,
  heroGiftDescriptions,
  type GiftItem,
} from './gift-catalog';

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

const coverGradients: Record<string, string> = {
  'love-jar': 'linear-gradient(135deg, #FF6B9D 0%, #C44BDB 40%, #7B2FBE 100%)',
  'wishing-dandelion':
    'linear-gradient(135deg, #A8E063 0%, #56AB2F 40%, #2D8B4E 100%)',
  'the-proposal':
    'linear-gradient(135deg, #FFD700 0%, #FF6B6B 40%, #EE4466 100%)',
  'spotify-wrapped':
    'linear-gradient(135deg, #1DB954 0%, #191414 50%, #1ED760 100%)',
  'sorry-puppy':
    'linear-gradient(135deg, #89CFF0 0%, #6A8EAE 40%, #4A6FA5 100%)',
};

function CDCard({ gift }: { gift: GiftItem }) {
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.prefetch(`/gift/${gift.slug}`);
      setLoading(true);
    },
    [router, gift.slug],
  );

  const handleComplete = useCallback(() => {
    router.push(`/gift/${gift.slug}`);
  }, [router, gift.slug]);

  return (
    <>
      <div
        className="flex-shrink-0 snap-center"
        style={{ width: 180 }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        <div
          className="flex h-full flex-col overflow-hidden transition-transform duration-200"
          style={{
            border: '2px solid #999',
            borderStyle: 'outset',
            borderRadius: 3,
            background: '#fff',
            transform: pressed
              ? 'rotate(-2deg) scale(1.03)'
              : 'rotate(0) scale(1)',
            boxShadow: pressed
              ? '4px 6px 16px rgba(0,0,0,0.25)'
              : '2px 3px 8px rgba(0,0,0,0.12)',
          }}
        >
          {/* Cover art area */}
          <div
            className="flex items-center justify-center"
            style={{
              background:
                coverGradients[gift.slug] ||
                'linear-gradient(135deg, #ccc, #999)',
              aspectRatio: '1',
            }}
          >
            <span className="text-[56px] leading-none drop-shadow-lg md:text-[64px]">
              {heroEmojis[gift.slug] || gift.emoji}
            </span>
          </div>

          {/* Chrome metallic strip */}
          <div
            style={{
              height: 6,
              background: 'linear-gradient(180deg, #E8E8E8, #C0C0C0, #E8E8E8)',
            }}
          />

          {/* Info area */}
          <div className="flex flex-1 flex-col gap-1.5 px-3 py-2.5">
            <h3 className="font-display text-[16px] font-semibold leading-tight text-[#2D0A4E] md:text-[18px]">
              {gift.name}
            </h3>
            <p className="line-clamp-1 font-body text-[13px] leading-snug text-black/60">
              {heroGiftDescriptions[gift.slug]}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="rounded-sm border px-1.5 py-[1px] font-body text-[12px] font-medium"
                style={{
                  borderColor: 'rgba(0,0,0,0.1)',
                  background:
                    gift.badge === 'Free'
                      ? 'rgba(34,197,94,0.12)'
                      : 'rgba(168,85,247,0.12)',
                  color: gift.badge === 'Free' ? '#15803d' : '#7c3aed',
                }}
              >
                {gift.badge}
              </span>
            </div>
            <a
              href={`/gift/${gift.slug}`}
              onClick={handleClick}
              className="win98-btn-pink mt-auto text-center text-[12px]"
              style={{ padding: '3px 8px', minHeight: 'auto' }}
            >
              Create Now
            </a>
          </div>
        </div>
      </div>
      {loading && <GiftLoading onComplete={handleComplete} />}
    </>
  );
}

export function HeroGifts() {
  return (
    <>
      {/* Bridging text */}
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

      {/* CD rack scroll row */}
      <section className="px-4 pb-5 md:pb-8">
        <div className="mx-auto max-w-6xl">
          <div
            className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 md:-mx-0 md:px-0"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {heroGifts.map((gift) => (
              <CDCard key={gift.slug} gift={gift} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
