'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, type GiftItem } from './gift-catalog';

const INITIAL_STRINGS = 3;

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

const featuredSlugs = new Set([
  'love-jar',
  'wishing-dandelion',
  'the-proposal',
  'spotify-wrapped',
  'sorry-puppy',
]);

const catalogGifts = allGifts.filter((g) => !featuredSlugs.has(g.slug));
const slugIndex = new Map(catalogGifts.map((g) => [g.slug, g]));
const preferredSet = new Set(preferredOrder);
const orderedGifts: GiftItem[] = [
  ...(preferredOrder
    .map((s) => slugIndex.get(s))
    .filter(Boolean) as GiftItem[]),
  ...catalogGifts.filter((g) => !preferredSet.has(g.slug)),
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

const swayAngles = [-4, 2, -3, 5, -1, 3, -5, 1, -2, 4];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDesktop;
}

function getSagOffset(index: number, total: number, maxSag: number) {
  if (total <= 1) return 0;
  const t = (index + 0.5) / total;
  return maxSag * 4 * t * (1 - t);
}

export function PolaroidWall() {
  const [stringCount, setStringCount] = useState(INITIAL_STRINGS);
  const [flippedSlug, setFlippedSlug] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const perString = isDesktop ? 5 : 3;
  const maxSag = isDesktop ? 20 : 14;

  const visibleGifts = orderedGifts.slice(0, stringCount * perString);
  const hasMore = stringCount * perString < orderedGifts.length;

  const strings: GiftItem[][] = [];
  for (let i = 0; i < visibleGifts.length; i += perString) {
    strings.push(visibleGifts.slice(i, i + perString));
  }

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
    setStringCount((prev) => prev + 1);
  }, []);

  return (
    <section id="browse" className="px-4 py-5 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="polaroid-wall-bg">
          {strings.map((stringGifts, stringIdx) => (
            <div
              key={stringIdx}
              className="garland-string-row"
              style={{ animationDelay: `${stringIdx * 0.12}s` }}
            >
              <svg
                className="garland-svg"
                viewBox="0 0 1000 40"
                preserveAspectRatio="none"
              >
                <path
                  d="M-10,4 Q500,36 1010,4"
                  stroke="#A0845C"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              <div className="garland-polaroids">
                {stringGifts.map((gift, i) => {
                  const globalIdx = stringIdx * perString + i;
                  const isFlipped = flippedSlug === gift.slug;
                  const gradient = gradients[globalIdx % gradients.length];
                  const angle = swayAngles[globalIdx % swayAngles.length];
                  const sagPx = getSagOffset(i, stringGifts.length, maxSag);
                  const swayDuration = 4 + (globalIdx % 3);
                  const swayDelay = ((globalIdx * 0.7) % 4).toFixed(1);

                  return (
                    <div
                      key={gift.slug}
                      className="garland-slot"
                      style={{ paddingTop: `${sagPx}px` }}
                    >
                      <div className="garland-clothespin" />
                      <div
                        className={`garland-polaroid${isFlipped ? ' is-unclipped' : ''}`}
                        style={{
                          ['--base-angle' as string]: `${angle}deg`,
                          animationDuration: `${swayDuration}s`,
                          animationDelay: `${swayDelay}s`,
                        }}
                        onClick={() => handleFlip(gift.slug)}
                      >
                        <div
                          className={`polaroid-flipper${isFlipped ? ' is-flipped' : ''}`}
                        >
                          <div className="polaroid-front">
                            <div
                              className="polaroid-photo"
                              style={{ background: gradient }}
                            >
                              <span className="polaroid-emoji">
                                {gift.emoji}
                              </span>
                            </div>
                            <div className="polaroid-caption">
                              <span className="font-handwritten text-[15px] text-[#333]">
                                {gift.name}
                              </span>
                            </div>
                          </div>

                          <div className="polaroid-back">
                            <p className="line-clamp-2 font-body text-[13px] leading-snug text-[#333]">
                              {gift.description}
                            </p>
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
                              ✕ clip back
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button className="garland-show-more" onClick={handleShowMore}>
                <span className="font-handwritten text-[16px] text-[#8B7355]">
                  hang more photos 📸
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {loadingSlug && <GiftLoading onComplete={handleLoadComplete} />}
    </section>
  );
}
