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

function HeroCard({ gift, span }: { gift: GiftItem; span?: boolean }) {
  const [loading, setLoading] = useState(false);
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
      <div className={span ? 'md:col-span-2' : ''}>
        <div className="win98-window h-full">
          <div className="win98-titlebar text-[14px]">
            <span>💕 {gift.name}</span>
            <div className="flex gap-[2px]">
              <span className="win98-titlebar-btn" aria-hidden>
                <span className="mt-[2px] block h-[2px] w-[6px] bg-black" />
              </span>
              <span className="win98-titlebar-btn" aria-hidden>
                <span className="block h-[7px] w-[7px] border border-black" />
              </span>
              <span className="win98-titlebar-btn" aria-hidden>
                <span className="text-[10px] font-bold leading-none text-black">
                  ✕
                </span>
              </span>
            </div>
          </div>
          <div className="win98-body">
            <div
              className={`flex flex-col items-center gap-3 py-3 ${span ? 'md:flex-row md:gap-6 md:px-4' : ''}`}
            >
              <span className="text-[48px] leading-none md:text-[56px]">
                {gift.emoji}
              </span>
              <div
                className={`flex flex-col items-center gap-2 ${span ? 'md:flex-1 md:items-start' : ''}`}
              >
                <h3 className="font-display text-[20px] font-semibold leading-tight text-[#2D0A4E] md:text-[22px]">
                  {gift.name}
                </h3>
                <p className="text-center font-body text-[14px] leading-relaxed text-black/70 md:text-left">
                  {heroGiftDescriptions[gift.slug]}
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="rounded-sm border px-2 py-[2px] font-body text-[13px] font-medium"
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
                  <a
                    href={`/gift/${gift.slug}`}
                    onClick={handleClick}
                    className="win98-btn-pink text-[14px]"
                  >
                    Create Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && <GiftLoading onComplete={handleComplete} />}
    </>
  );
}

export function HeroGifts() {
  return (
    <section className="px-4 py-5 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {heroGifts.slice(0, 4).map((gift) => (
            <HeroCard key={gift.slug} gift={gift} />
          ))}
        </div>
        {heroGifts[4] && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2">
            <HeroCard gift={heroGifts[4]} span />
          </div>
        )}
      </div>
    </section>
  );
}
