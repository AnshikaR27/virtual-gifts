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

const bubbleColors = ['#FFF0F5', '#F3E8FF', '#FFFBEB', '#F0FFF4'] as const;

function ChatBubble({ gift, index }: { gift: GiftItem; index: number }) {
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(false);
  const router = useRouter();
  const isRight = index % 2 === 1;
  const bg = bubbleColors[index % bubbleColors.length];

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
        className={`flex flex-col ${isRight ? 'items-end' : 'items-start'}`}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        <div
          className="relative w-full transition-transform duration-150"
          style={{
            transform: pressed ? 'scale(1.02)' : 'scale(1)',
            outline: pressed ? '2px solid #0078D7' : 'none',
            outlineOffset: 2,
            background: bg,
            borderRadius: isRight ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            padding: '12px 14px',
          }}
        >
          {/* Tail */}
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              [isRight ? 'right' : 'left']: -8,
              width: 0,
              height: 0,
              borderTop: `6px solid transparent`,
              borderBottom: `6px solid transparent`,
              [isRight ? 'borderLeft' : 'borderRight']: `8px solid ${bg}`,
            }}
          />

          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 text-[32px] leading-none">
              {gift.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[15px] font-semibold leading-tight text-[#2D0A4E]">
                {gift.name}
              </h3>
              <p className="mt-0.5 line-clamp-2 font-body text-[13px] leading-snug text-black/55">
                {gift.description}
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
              <a
                href={`/gift/${gift.slug}`}
                onClick={handleClick}
                className="win98-btn-pink text-[11px]"
                style={{ padding: '2px 8px', minHeight: 'auto' }}
              >
                Create
              </a>
            </div>
          </div>
        </div>
        <span
          className={`mt-0.5 font-pixel text-[11px] text-black/35 ${isRight ? 'mr-2' : 'ml-2'}`}
        >
          sent by HoneyHearts 💕
        </span>
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

            <p className="mt-3 font-pixel text-[13px] text-black/60">
              Showing {visibleGifts.length}
              {!expanded && hasMore ? ` of ${filteredGifts.length}` : ''} gifts
            </p>
          </div>
        </div>

        {/* MSN chat bubble cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {visibleGifts.map((gift, i) => (
            <ChatBubble key={gift.slug} gift={gift} index={i} />
          ))}
        </div>

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
    </section>
  );
}
