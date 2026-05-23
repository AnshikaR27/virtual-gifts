'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, type GiftItem } from './gift-catalog';
import { TitlebarButtons } from '@/components/win98-chrome';

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

function getStringCurvePoint(t: number) {
  const x = (1 - t) * (1 - t) * -10 + 2 * (1 - t) * t * 500 + t * t * 1010;
  const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 34 + t * t * 8;
  return { left: (x / 1000) * 100, top: (y / 40) * 100 };
}

const roseSeeds = [
  { t: 0.065, rotate: -15, leafConfig: 2 },
  { t: 0.255, rotate: 10, leafConfig: 1 },
  { t: 0.4, rotate: -8, leafConfig: 3 },
  { t: 0.575, rotate: 12, leafConfig: 2 },
  { t: 0.745, rotate: -5, leafConfig: 1 },
  { t: 0.925, rotate: 8, leafConfig: 2 },
];

const vineLeafSeeds = [
  { t: 0.12, rotate: 25, flip: false },
  { t: 0.33, rotate: -20, flip: true },
  { t: 0.5, rotate: 15, flip: false },
  { t: 0.66, rotate: -30, flip: true },
  { t: 0.84, rotate: 20, flip: false },
];

const vinePathBehind =
  'M 62,11.2 Q 153,19 250,17.9 M 398,20.5 Q 488,25 577,20.7 M 750,17.9 Q 837,19.5 934,11.6';
const vinePathFront =
  'M 20,9.4 Q 40,10.4 62,11.2 M 250,17.9 Q 327,15.5 398,20.5 M 577,20.7 Q 654,16.4 750,17.9 M 934,11.6 Q 955,10.5 970,9.8';

function Rosebud({ leafConfig }: { leafConfig: number }) {
  return (
    <svg
      className="garland-rosebud"
      viewBox="0 0 24 24"
      fill="none"
      style={{ overflow: 'visible' }}
    >
      {leafConfig >= 1 && (
        <>
          <path
            d="M19 16C22 14 25 15 24 17.5C22 17 20 16.5 19 16Z"
            fill="#90AC84"
          />
          <line
            x1="19.3"
            y1="16.2"
            x2="23.5"
            y2="16"
            stroke="#7A9470"
            strokeWidth="0.3"
          />
        </>
      )}
      {leafConfig >= 2 && (
        <>
          <path d="M5 16C2 14 -1 15 0 17.5C2 17 4 16.5 5 16Z" fill="#90AC84" />
          <line
            x1="4.7"
            y1="16.2"
            x2="0.5"
            y2="16"
            stroke="#7A9470"
            strokeWidth="0.3"
          />
        </>
      )}
      {leafConfig >= 3 && (
        <>
          <path d="M18 7C21 5 23.5 6 23 8.5C21 8 19 7.5 18 7Z" fill="#8DA880" />
          <line
            x1="18.3"
            y1="7.3"
            x2="22.5"
            y2="7.2"
            stroke="#7A9470"
            strokeWidth="0.3"
          />
        </>
      )}
      <path
        d="M12 3C8 5 5 8 5 13C5 17 8 21 12 22C16 21 19 17 19 13C19 8 16 5 12 3Z"
        fill="#E8B8BC"
      />
      <path
        d="M12 5C15.5 6.5 18 9.5 18 13C18 16 16 19 13.5 20.5C16 18 17.5 15 17 12C16.5 8.5 14 6 12 5Z"
        fill="#DDA8AE"
      />
      <path
        d="M12 5.5C8.5 7 6.5 10 6.5 13.5C6.5 15.5 7.5 18 10 20C8 17.5 7 14.5 8 11.5C9 8.5 10.5 6.5 12 5.5Z"
        fill="#DDAAB0"
      />
      <path
        d="M12 8C14 9.5 15.5 11.5 15 14C14.5 11.5 13.5 9.5 12 8Z"
        fill="#D09CA4"
      />
      <path
        d="M12 8C10 9.5 8.5 11.5 9 14C9.5 11.5 10.5 9.5 12 8Z"
        fill="#C8909A"
      />
      <path
        d="M11.5 9.5C10.5 11.5 10.8 13.5 12 15C11.5 12.5 11.2 10.5 11.5 9.5Z"
        fill="#BE8490"
        opacity="0.8"
      />
      <path
        d="M12.5 9.5C13.5 11.5 13.2 13 12 14.5C12.5 12 13 10.5 12.5 9.5Z"
        fill="#B47C88"
        opacity="0.7"
      />
      <ellipse
        cx="10"
        cy="11"
        rx="2"
        ry="1.5"
        fill="white"
        opacity="0.1"
        transform="rotate(-20 10 11)"
      />
    </svg>
  );
}

function VineLeaf({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      className="garland-vine-leaf"
      viewBox="0 0 16 10"
      fill="none"
      style={{
        overflow: 'visible',
        ...(flip ? { transform: 'scaleX(-1)' } : {}),
      }}
    >
      <path d="M1 5C3 1.5 9 0.5 15 4.5C9 8.5 3 8.5 1 5Z" fill="#90AC84" />
      <path
        d="M2 5C5 4.5 9 4.2 14 4.5"
        stroke="#7A9470"
        strokeWidth="0.35"
        fill="none"
      />
    </svg>
  );
}

function WallClothespin() {
  return (
    <svg
      className="garland-clothespin"
      viewBox="0 0 28 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
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
        fill="#FF85A2"
      />
      <path
        d="M14 17C13.2 16 9 13 8 10.5C7 8 8.5 6 10.5 6.1C11.8 6.15 12.8 7 14 8.5C15 7.2 16.2 6.3 17.5 6.3C19.5 6.4 21 8.2 20.5 10.5C19.8 13 14.8 16 14 17Z"
        fill="none"
        stroke="#E06B88"
        strokeWidth="0.5"
      />
      <ellipse
        cx="11"
        cy="9.5"
        rx="1.8"
        ry="1.2"
        fill="white"
        opacity="0.3"
        transform="rotate(-15 11 9.5)"
      />
    </svg>
  );
}

export function PolaroidWall() {
  const [stringCount, setStringCount] = useState(INITIAL_STRINGS);
  const [flippedSlug, setFlippedSlug] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const wallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      wall.querySelectorAll('.garland-string-row').forEach((el) => {
        (el as HTMLElement).classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wall.querySelectorAll('.garland-string-row').forEach((el) => {
            (el as HTMLElement).classList.add('is-visible');
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(wall);
    return () => observer.disconnect();
  }, [stringCount]);

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
    <section
      id="browse"
      className="px-4"
      style={{ paddingTop: 0, paddingBottom: 'var(--space-md)' }}
    >
      <div className="mx-auto max-w-6xl">
        <div
          className="pin-board-title"
          style={{ marginTop: 'var(--space-sm)' }}
        >
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
        <div className="win98-window">
          <div className="win98-titlebar">
            <span>📷 MEMORIES.exe</span>
            <TitlebarButtons />
          </div>
          <div className="win98-body p-0">
            <div className="polaroid-wall-bg" ref={wallRef}>
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
                      d="M-10,8 Q500,34 1010,8"
                      stroke="#A0845C"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>

                  <svg
                    className="garland-vine-behind"
                    viewBox="0 0 1000 40"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d={vinePathBehind}
                      stroke="#8B9F80"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  <svg
                    className="garland-vine-front"
                    viewBox="0 0 1000 40"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d={vinePathFront}
                      stroke="#8B9F80"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  <div className="garland-roses" aria-hidden="true">
                    {vineLeafSeeds.map((leaf, li) => {
                      const pt = getStringCurvePoint(leaf.t);
                      return (
                        <div
                          key={`leaf-${li}`}
                          className="garland-rose"
                          style={{
                            left: `${pt.left}%`,
                            top: `${pt.top}%`,
                            transform: `translate(-50%, -50%) rotate(${leaf.rotate}deg)`,
                          }}
                        >
                          <VineLeaf flip={leaf.flip} />
                        </div>
                      );
                    })}
                    {roseSeeds.map((rose, ri) => {
                      const pt = getStringCurvePoint(rose.t);
                      return (
                        <div
                          key={`rose-${ri}`}
                          className="garland-rose"
                          style={{
                            left: `${pt.left}%`,
                            top: `${pt.top}%`,
                            transform: `translate(-50%, -50%) rotate(${rose.rotate}deg)`,
                          }}
                        >
                          <Rosebud leafConfig={rose.leafConfig} />
                        </div>
                      );
                    })}
                  </div>

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
                          <WallClothespin />
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
                                  <span className="font-display text-[13px] text-ink">
                                    {gift.name}
                                  </span>
                                </div>
                              </div>

                              <div className="polaroid-back">
                                <p className="line-clamp-2 font-body text-[13px] leading-snug text-ink">
                                  {gift.description}
                                </p>
                                <button
                                  className="win98-btn-pink mt-2 text-[13px]"
                                  onClick={(e) => handleCreate(gift.slug, e)}
                                >
                                  Create This Gift →
                                </button>
                                <span
                                  className="mt-1 cursor-pointer font-pixel text-[13px] text-ink/40"
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
                  <button
                    className="garland-show-more"
                    onClick={handleShowMore}
                  >
                    <span className="font-handwritten text-[18px] text-[#8B7355]">
                      hang more photos 📸
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loadingSlug && <GiftLoading onComplete={handleLoadComplete} />}
    </section>
  );
}
