'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import {
  allGifts,
  occasions,
  type GiftItem,
  type OccasionKey,
} from './gift-catalog';

const INITIAL_VISIBLE = 9;

function MiniCard({ gift }: { gift: GiftItem }) {
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
      <div className="win98-window">
        <div className="win98-titlebar text-[13px]">
          <span className="truncate">{gift.name}</span>
        </div>
        <div className="win98-body" style={{ padding: '10px' }}>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 text-[32px] leading-none">
              {gift.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-body text-[13px] leading-snug text-black/70">
                {gift.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
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
                <a
                  href={`/gift/${gift.slug}`}
                  onClick={handleClick}
                  className="win98-btn-pink text-[12px]"
                  style={{ padding: '2px 10px', minHeight: 'auto' }}
                >
                  Create
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && <GiftLoading onComplete={handleComplete} />}
    </>
  );
}

const giftIndex = new Map(allGifts.map((g) => [g.slug, g]));

export function GiftBrowser() {
  const [activeFilter, setActiveFilter] = useState<OccasionKey>('all');
  const [expanded, setExpanded] = useState(false);

  const filteredGifts = useMemo(() => {
    if (activeFilter === 'all') return allGifts;
    const occasion = occasions.find((o) => o.key === activeFilter);
    if (!occasion) return allGifts;
    return occasion.slugs
      .map((slug) => giftIndex.get(slug))
      .filter((g): g is GiftItem => g !== undefined);
  }, [activeFilter]);

  const visibleGifts = expanded
    ? filteredGifts
    : filteredGifts.slice(0, INITIAL_VISIBLE);
  const hasMore = filteredGifts.length > INITIAL_VISIBLE;

  const handleFilterClick = useCallback((key: OccasionKey) => {
    playClick();
    setActiveFilter(key);
    setExpanded(false);
  }, []);

  return (
    <section id="browse" className="px-4 py-5 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="win98-window">
          <div className="win98-titlebar text-[14px]">
            <span>📂 Browse by occasion</span>
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
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-[6px]">
              {occasions.map((o) => (
                <button
                  key={o.key}
                  onClick={() => handleFilterClick(o.key)}
                  className="font-pixel text-[13px]"
                  style={{
                    background: 'var(--win-chrome)',
                    border: '2px solid',
                    borderColor:
                      activeFilter === o.key
                        ? 'var(--win-chrome-darkest) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-darkest)'
                        : 'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
                    padding:
                      activeFilter === o.key ? '3px 7px 1px 9px' : '2px 8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o.label}
                </button>
              ))}
              <button
                onClick={() => handleFilterClick('all')}
                className="font-pixel text-[13px]"
                style={{
                  background: 'var(--win-chrome)',
                  border: '2px solid',
                  borderColor:
                    activeFilter === 'all'
                      ? 'var(--win-chrome-darkest) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-darkest)'
                      : 'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
                  padding:
                    activeFilter === 'all' ? '3px 7px 1px 9px' : '2px 8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                ✨ All
              </button>
            </div>

            {/* Count */}
            <p className="mt-3 font-pixel text-[13px] text-black/60">
              Showing {visibleGifts.length}
              {!expanded && hasMore ? ` of ${filteredGifts.length}` : ''} gifts
            </p>

            {/* Gift grid */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {visibleGifts.map((gift) => (
                <MiniCard key={gift.slug} gift={gift} />
              ))}
            </div>

            {/* Show all button */}
            {hasMore && !expanded && (
              <div className="mt-4 flex justify-center">
                <button
                  className="win98-btn text-[14px]"
                  onClick={() => {
                    playClick();
                    setExpanded(true);
                  }}
                >
                  Show all ({filteredGifts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
