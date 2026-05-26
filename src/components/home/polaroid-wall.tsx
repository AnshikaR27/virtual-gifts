'use client';

import { useState, useCallback, useEffect, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, type GiftItem } from './gift-catalog';
import { TitlebarButtons } from '@/components/win98-chrome';
import { CrochetRose, GarlandLeaf } from '@/components/shared/craft-elements';

const INITIAL_STRINGS = 3;

const preferredOrder = [
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

function getThreadPoint(t: number) {
  const x = (1 - t) * (1 - t) * -10 + 2 * (1 - t) * t * 500 + t * t * 1010;
  const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 34 + t * t * 8;
  return { left: (x / 1000) * 100, top: (y / 40) * 100 };
}

const THREAD_D = 'M-10,8 Q500,34 1010,8';

const VINE_SEGMENTS = (() => {
  const N = 300;
  const vineAmp = 4;
  const vineWraps = 3;

  const vine: { x: number; y: number; s: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = (1 - t) * (1 - t) * -10 + 2 * (1 - t) * t * 500 + t * t * 1010;
    const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 34 + t * t * 8;
    const s = Math.sin(2 * Math.PI * vineWraps * t);
    vine.push({ x, y: y + vineAmp * s, s });
  }

  const behind: string[] = [];
  const front: string[] = [];
  let seg: string[] = [];
  let isBehind = vine[0].s >= 0;

  for (let i = 0; i <= N; i++) {
    const p = vine[i];
    const nowBehind = p.s >= 0;
    const pt = `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    if (nowBehind !== isBehind && seg.length > 0) {
      seg.push(pt);
      (isBehind ? behind : front).push('M' + seg.join(' L'));
      seg = [pt];
      isBehind = nowBehind;
    } else {
      seg.push(pt);
    }
  }
  if (seg.length > 1) {
    (isBehind ? behind : front).push('M' + seg.join(' L'));
  }

  return { behind, front };
})();

const garlandClusters = [
  {
    t: 0.1,
    rose: { rotate: -8, scale: 1.0 },
    leaves: [
      { dx: -13, dy: -5, rotate: 30, flip: false, dark: false },
      { dx: 11, dy: 5, rotate: -20, flip: true, dark: true },
    ],
  },
  {
    t: 0.25,
    rose: { rotate: 12, scale: 0.9 },
    leaves: [
      { dx: -12, dy: -4, rotate: 25, flip: false, dark: false },
      { dx: 13, dy: 3, rotate: -25, flip: true, dark: true },
      { dx: -7, dy: 8, rotate: 10, flip: false, dark: false },
    ],
  },
  {
    t: 0.42,
    rose: { rotate: -5, scale: 1.0 },
    leaves: [
      { dx: 12, dy: -6, rotate: -18, flip: true, dark: true },
      { dx: -11, dy: 4, rotate: 22, flip: false, dark: false },
    ],
  },
  {
    t: 0.58,
    rose: { rotate: 10, scale: 0.85 },
    leaves: [
      { dx: -13, dy: -3, rotate: 15, flip: false, dark: false },
      { dx: 12, dy: 5, rotate: -22, flip: true, dark: true },
    ],
  },
  {
    t: 0.75,
    rose: { rotate: -10, scale: 0.95 },
    leaves: [
      { dx: 13, dy: -5, rotate: -12, flip: true, dark: true },
      { dx: -12, dy: 3, rotate: 18, flip: false, dark: false },
      { dx: 9, dy: 7, rotate: -8, flip: true, dark: false },
    ],
  },
  {
    t: 0.9,
    rose: { rotate: 6, scale: 0.9 },
    leaves: [
      { dx: -13, dy: -4, rotate: 28, flip: false, dark: true },
      { dx: 11, dy: 4, rotate: -15, flip: true, dark: false },
    ],
  },
];

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
          <div className="win98-body !bg-transparent !p-0">
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
                    {VINE_SEGMENTS.behind.map((d, i) => (
                      <path
                        key={`vb${i}`}
                        d={d}
                        stroke="#8B9F80"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                    <path
                      d={THREAD_D}
                      stroke="#C19A6B"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {VINE_SEGMENTS.front.map((d, i) => (
                      <path
                        key={`vf${i}`}
                        d={d}
                        stroke="#8B9F80"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  </svg>

                  <div className="garland-flora" aria-hidden="true">
                    {garlandClusters.map((cluster, ci) => {
                      const pt = getThreadPoint(cluster.t);
                      return (
                        <Fragment key={ci}>
                          {cluster.leaves.map((leaf, li) => (
                            <div
                              key={`l${li}`}
                              className="garland-flora-item"
                              style={{
                                left: `${pt.left}%`,
                                top: `${pt.top}%`,
                                transform: `translate(calc(-50% + ${leaf.dx}px), calc(-50% + ${leaf.dy}px)) rotate(${leaf.rotate}deg)`,
                              }}
                            >
                              <GarlandLeaf flip={leaf.flip} dark={leaf.dark} />
                            </div>
                          ))}
                          <div
                            className="garland-flora-item"
                            style={{
                              left: `${pt.left}%`,
                              top: `${pt.top}%`,
                              transform: `translate(-50%, -50%) rotate(${cluster.rose.rotate}deg) scale(${cluster.rose.scale})`,
                            }}
                          >
                            <CrochetRose />
                          </div>
                        </Fragment>
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
