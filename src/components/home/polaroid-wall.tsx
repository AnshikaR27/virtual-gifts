'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import {
  allGifts,
  occasions,
  type GiftItem,
  type OccasionKey,
} from './gift-catalog';

const INITIAL_COUNT = 15;
const LOAD_MORE_COUNT = 15;

const preferredOrder = [
  'love-jar',
  'sorry-puppy',
  'spotify-wrapped',
  'wishing-dandelion',
  'love-receipt',
  'miss-you',
  'the-proposal',
  'terms-and-conditions',
  'origami-unfold',
  'reverse-love-letter',
  'snow-globe',
  'good-morning',
  'star-wish',
  'loading-screen-of-love',
  'cheer-up',
];

const slugIndex = new Map(allGifts.map((g) => [g.slug, g]));
const preferredSet = new Set(preferredOrder);
const orderedGifts: GiftItem[] = [
  ...(preferredOrder
    .map((s) => slugIndex.get(s))
    .filter(Boolean) as GiftItem[]),
  ...allGifts.filter((g) => !preferredSet.has(g.slug)),
];

const gradients = [
  'linear-gradient(135deg, #FFB6C1, #FF85A2)',
  'linear-gradient(135deg, #DCD0FF, #B8A9E8)',
  'linear-gradient(135deg, #A8F0D0, #7DDBB5)',
  'linear-gradient(135deg, #FFE066, #F5C842)',
  'linear-gradient(135deg, #FFB4A2, #FF8A75)',
  'linear-gradient(135deg, #FECACA, #FCA5A5)',
  'linear-gradient(135deg, #C4B5FD, #A78BFA)',
  'linear-gradient(135deg, #A7F3D0, #6EE7B7)',
  'linear-gradient(135deg, #FDE68A, #FCD34D)',
  'linear-gradient(135deg, #FBCFE8, #F9A8D4)',
  'linear-gradient(135deg, #BAE6FD, #7DD3FC)',
  'linear-gradient(135deg, #FED7AA, #FDBA74)',
];

const rotations = [-4, 2, -2, 5, -1, 3, -5, 1, -3, 4];

type Decoration =
  | 'thumbtack'
  | 'tape-pink'
  | 'tape-yellow'
  | 'tape-blue'
  | 'tape-mint'
  | 'none';
const decorations: Decoration[] = [
  'thumbtack',
  'tape-pink',
  'none',
  'tape-yellow',
  'thumbtack',
  'tape-blue',
  'none',
  'tape-mint',
  'thumbtack',
  'tape-pink',
];

export function PolaroidWall() {
  const [activeFilter, setActiveFilter] = useState<OccasionKey>('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [flippedSlug, setFlippedSlug] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [animatingFrom, setAnimatingFrom] = useState<number | null>(null);
  const router = useRouter();
  const wallRef = useRef<HTMLDivElement>(null);

  const filteredSlugs = useMemo(() => {
    if (activeFilter === 'all') return null;
    const occ = occasions.find((o) => o.key === activeFilter);
    return occ ? new Set(occ.slugs) : null;
  }, [activeFilter]);

  const visibleGifts = orderedGifts.slice(0, visibleCount);
  const hasMore = visibleCount < orderedGifts.length;

  const handleFilterClick = useCallback((key: OccasionKey) => {
    playClick();
    setActiveFilter(key);
    setFlippedSlug(null);
  }, []);

  const handleFlip = useCallback((slug: string) => {
    playClick();
    setFlippedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const handleCreate = useCallback(
    (slug: string, e: React.MouseEvent) => {
      e.stopPropagation();
      playClick();
      router.prefetch(`/gift/${slug}`);
      setLoadingSlug(slug);
    },
    [router],
  );

  const handleLoadComplete = useCallback(() => {
    if (loadingSlug) router.push(`/gift/${loadingSlug}`);
  }, [router, loadingSlug]);

  const handleShowMore = useCallback(() => {
    playClick();
    const from = visibleCount;
    const next = Math.min(visibleCount + LOAD_MORE_COUNT, orderedGifts.length);
    setAnimatingFrom(from);
    setVisibleCount(next);
    setTimeout(() => setAnimatingFrom(null), (next - from) * 100 + 400);
  }, [visibleCount]);

  const isMatch = useCallback(
    (slug: string) => !filteredSlugs || filteredSlugs.has(slug),
    [filteredSlugs],
  );

  return (
    <section id="browse" className="px-4 py-5 md:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Win98 filter bar */}
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
          </div>
        </div>

        {/* Section title */}
        <h2
          className="mb-4 mt-6 text-center font-display text-[20px] font-semibold text-white md:text-[24px]"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          pull a memory off the wall
        </h2>

        {/* Polaroid Wall */}
        <div className="polaroid-wall-bg" ref={wallRef}>
          <div className="polaroid-grid">
            {visibleGifts.map((gift, i) => {
              const matched = isMatch(gift.slug);
              const isFlipped = flippedSlug === gift.slug;
              const gradient = gradients[i % gradients.length];
              const rotation = rotations[i % rotations.length];
              const decoration = decorations[i % decorations.length];
              const isNew = animatingFrom !== null && i >= animatingFrom;
              const staggerDelay = isNew
                ? `${(i - (animatingFrom ?? 0)) * 0.1}s`
                : undefined;

              return (
                <div
                  key={gift.slug}
                  className={`polaroid-card${isNew ? ' polaroid-animating' : ''}`}
                  style={{
                    transform: `rotate(${rotation}deg) scale(${matched ? 1 : 0.92})`,
                    opacity: matched ? 1 : 0.4,
                    animationDelay: staggerDelay,
                    // pass rotation to the fade-in animation
                    ['--pol-rot' as string]: `${rotation}deg`,
                  }}
                  onClick={() => handleFlip(gift.slug)}
                >
                  {/* Decoration */}
                  {decoration === 'thumbtack' && (
                    <div className="polaroid-thumbtack" />
                  )}
                  {decoration !== 'thumbtack' && decoration !== 'none' && (
                    <div className={`polaroid-tape ${decoration}`} />
                  )}

                  {/* Flipper */}
                  <div
                    className={`polaroid-flipper${isFlipped ? ' is-flipped' : ''}`}
                  >
                    {/* Front */}
                    <div className="polaroid-front">
                      <div
                        className="polaroid-photo"
                        style={{ background: gradient }}
                      >
                        <span className="polaroid-price">{gift.badge}</span>
                        <span className="polaroid-emoji">{gift.emoji}</span>
                      </div>
                      <div className="polaroid-caption">
                        <span className="font-handwritten text-[15px] text-[#333]">
                          {gift.name}
                        </span>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="polaroid-back">
                      <p className="line-clamp-2 font-body text-[13px] leading-snug text-[#333]">
                        {gift.description}
                      </p>
                      <span className="mt-1 font-pixel text-[14px] text-[#666]">
                        {gift.badge}
                      </span>
                      <button
                        className="win98-btn-pink mt-2 text-[13px]"
                        onClick={(e) => handleCreate(gift.slug, e)}
                      >
                        Create This Gift →
                      </button>
                      <span
                        className="mt-1 cursor-pointer font-pixel text-[11px] text-[#999]"
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          setFlippedSlug(null);
                        }}
                      >
                        ✕ flip back
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more — styled as a Polaroid */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <div
                className="polaroid-card cursor-pointer"
                style={{ transform: 'rotate(2deg)', maxWidth: 160 }}
                onClick={handleShowMore}
                role="button"
                tabIndex={0}
              >
                <div className="polaroid-front">
                  <div
                    className="polaroid-photo"
                    style={{
                      background: 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
                    }}
                  >
                    <span style={{ fontSize: 36 }}>📸</span>
                  </div>
                  <div className="polaroid-caption">
                    <span className="font-handwritten text-[14px] text-[#555]">
                      show more memories
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {loadingSlug && <GiftLoading onComplete={handleLoadComplete} />}
    </section>
  );
}
