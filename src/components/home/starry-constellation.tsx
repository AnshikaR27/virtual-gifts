'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GiftLoading } from '@/components/gift-loading';
import { allGifts, heroGiftSlugs, heroGiftDescriptions } from './gift-catalog';

const heroGifts = heroGiftSlugs
  .map((slug) => allGifts.find((g) => g.slug === slug)!)
  .filter(Boolean);

const heroEmojis: Record<string, string> = {
  'love-jar': '\u{1FAD9}',
  'wishing-dandelion': '\u{1F32C}️',
  'the-proposal': '\u{1F48D}',
  'spotify-wrapped': '\u{1F4CA}',
  'sorry-puppy': '\u{1F97A}',
};

interface StarPosition {
  x: number;
  y: number;
  size: number;
  delay: number;
}

const starPositions: Record<string, StarPosition> = {
  'love-jar': { x: 18, y: 22, size: 44, delay: 0 },
  'wishing-dandelion': { x: 50, y: 10, size: 44, delay: 0.4 },
  'the-proposal': { x: 44, y: 46, size: 54, delay: 0.8 },
  'spotify-wrapped': { x: 78, y: 28, size: 44, delay: 1.2 },
  'sorry-puppy': { x: 24, y: 72, size: 44, delay: 1.6 },
};

const constellationLines: [string, string][] = [
  ['love-jar', 'wishing-dandelion'],
  ['wishing-dandelion', 'the-proposal'],
  ['wishing-dandelion', 'spotify-wrapped'],
  ['the-proposal', 'sorry-puppy'],
  ['love-jar', 'sorry-puppy'],
];

function playShimmer() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;

    [2400, 3200, 4000].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(
        freq * 1.5,
        now + i * 0.06 + 0.15,
      );
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.4);
    });
  } catch {}
}

function playReverseChime() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;

    [3600, 2800, 2000].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(
        freq * 0.6,
        now + i * 0.05 + 0.2,
      );
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.25);
    });
  } catch {}
}

interface SparkleParticle {
  id: number;
  tx: number;
  ty: number;
}

function StarOrb({
  slug,
  pos,
  isOpen,
  onTap,
}: {
  slug: string;
  pos: StarPosition;
  isOpen: boolean;
  onTap: () => void;
}) {
  const gift = allGifts.find((g) => g.slug === slug)!;
  const emoji = heroEmojis[slug] || gift.emoji;

  return (
    <button
      className={`starry-star ${isOpen ? 'starry-star-open' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        width: pos.size,
        height: pos.size,
        animationDelay: `${pos.delay}s`,
      }}
      onClick={onTap}
      aria-label={`Open ${gift.name}`}
    >
      <span className="starry-star-glow" />
      <span className="starry-star-label font-handwritten">
        {emoji} {gift.name}
      </span>
    </button>
  );
}

function GiftCard({
  slug,
  pos,
  onClose,
  onNavigate,
}: {
  slug: string;
  pos: StarPosition;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}) {
  const gift = allGifts.find((g) => g.slug === slug)!;
  const emoji = heroEmojis[slug] || gift.emoji;

  return (
    <div
      className="starry-card"
      style={
        {
          '--card-origin-x': `${pos.x}%`,
          '--card-origin-y': `${pos.y}%`,
        } as React.CSSProperties
      }
    >
      <button
        className="starry-card-close font-handwritten"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        &times;
      </button>
      <span className="starry-card-emoji">{emoji}</span>
      <h3 className="starry-card-name font-display">{gift.name}</h3>
      <p className="starry-card-desc font-body">
        {heroGiftDescriptions[slug] || gift.description}
      </p>
      <button
        className="starry-card-cta font-body"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate(slug);
        }}
      >
        Create This Gift &rarr;
      </button>
    </div>
  );
}

function SparkBurst({ x, y }: { x: number; y: number }) {
  const particles = useRef<SparkleParticle[]>(
    Array.from({ length: 10 }, (_, i) => {
      const angle = ((360 / 10) * i + Math.random() * 20) * (Math.PI / 180);
      const dist = 30 + Math.random() * 40;
      return { id: i, tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
    }),
  );

  return (
    <div className="starry-sparkle-burst" aria-hidden>
      {particles.current.map((p) => (
        <span
          key={p.id}
          className="starry-sparkle"
          style={
            {
              left: `${x}%`,
              top: `${y}%`,
              '--spark-tx': `${p.tx}px`,
              '--spark-ty': `${p.ty}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function StarryConstellation() {
  const [openStar, setOpenStar] = useState<string | null>(null);
  const [animating, setAnimating] = useState<string | null>(null);
  const [sparkTarget, setSparkTarget] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const targetSlug = useRef('');
  const router = useRouter();
  const skyRef = useRef<HTMLDivElement>(null);

  const handleStarTap = useCallback(
    (slug: string) => {
      if (animating) return;

      if (openStar && openStar !== slug) {
        playReverseChime();
        setAnimating(openStar);
        setTimeout(() => {
          setOpenStar(null);
          setAnimating(null);
          setTimeout(() => {
            playShimmer();
            const pos = starPositions[slug];
            setSparkTarget({ x: pos.x, y: pos.y });
            setOpenStar(slug);
            setAnimating(slug);
            setTimeout(() => {
              setAnimating(null);
              setSparkTarget(null);
            }, 800);
          }, 50);
        }, 400);
        return;
      }

      if (openStar === slug) {
        playReverseChime();
        setAnimating(slug);
        setTimeout(() => {
          setOpenStar(null);
          setAnimating(null);
        }, 400);
        return;
      }

      playShimmer();
      const pos = starPositions[slug];
      setSparkTarget({ x: pos.x, y: pos.y });
      setOpenStar(slug);
      setAnimating(slug);
      setTimeout(() => {
        setAnimating(null);
        setSparkTarget(null);
      }, 800);
    },
    [openStar, animating],
  );

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

  const bgStars = useRef(
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1.5 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
      delay: Math.random() * 4,
    })),
  );

  return (
    <>
      <div className="px-4 pb-3 pt-10 text-center">
        <p
          className="font-handwritten text-[22px] md:text-[26px]"
          style={{
            color: '#FFD700',
            textShadow:
              '0 0 12px rgba(255,215,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          &#9733; tap a star to make a wish &#9733;
        </p>
      </div>

      <section className="starry-section">
        <div ref={skyRef} className="starry-sky">
          {/* Swirling clouds */}
          <div className="starry-swirl starry-swirl-1" aria-hidden />
          <div className="starry-swirl starry-swirl-2" aria-hidden />
          <div className="starry-swirl starry-swirl-3" aria-hidden />

          {/* Golden moon glows */}
          <div className="starry-moon starry-moon-1" aria-hidden />
          <div className="starry-moon starry-moon-2" aria-hidden />

          {/* Background stars */}
          {bgStars.current.map((s) => (
            <span
              key={s.id}
              className="starry-bg-star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.size,
                height: s.size,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
              }}
              aria-hidden
            />
          ))}

          {/* Constellation lines SVG */}
          <svg
            className="starry-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {constellationLines.map(([from, to]) => {
              const a = starPositions[from];
              const b = starPositions[to];
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="0.3"
                  strokeDasharray="1 1"
                />
              );
            })}
          </svg>

          {/* Cypress tree silhouette */}
          <svg className="starry-cypress" viewBox="0 0 40 120" aria-hidden>
            <path
              d="M20 0 C18 8 10 18 12 28 C8 36 6 44 10 52 C6 60 4 70 8 78 C4 86 6 96 10 104 C12 108 16 112 20 120 C24 112 28 108 30 104 C34 96 36 86 32 78 C36 70 34 60 30 52 C34 44 32 36 28 28 C30 18 22 8 20 0Z"
              fill="#0a0f1a"
              opacity="0.85"
            />
          </svg>

          {/* Village silhouette */}
          <svg
            className="starry-village"
            viewBox="0 0 400 50"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 50 L0 38 L20 38 L20 30 L25 22 L30 30 L30 38 L50 38 L50 32 L60 32 L60 28 L64 20 L68 28 L68 32 L80 32 L80 36 L100 36 L100 28 L110 28 L115 18 L120 28 L120 36 L150 36 L150 30 L155 22 L160 30 L160 36 L180 36 L180 32 L190 32 L195 24 L200 32 L200 36 L220 36 L220 30 L230 30 L235 20 L240 30 L240 36 L270 36 L270 32 L280 32 L280 28 L284 20 L288 28 L288 32 L300 32 L300 38 L320 38 L320 30 L325 22 L330 30 L330 38 L360 38 L360 34 L370 34 L375 26 L380 34 L380 38 L400 38 L400 50 Z"
              fill="#0a0f1a"
            />
            {/* Window glows */}
            <rect
              x="23"
              y="32"
              width="4"
              height="4"
              rx="0.5"
              fill="#FFD700"
              opacity="0.7"
            />
            <rect
              x="63"
              y="30"
              width="3"
              height="3"
              rx="0.5"
              fill="#FFA500"
              opacity="0.6"
            />
            <rect
              x="113"
              y="28"
              width="4"
              height="4"
              rx="0.5"
              fill="#FFD700"
              opacity="0.5"
            />
            <rect
              x="193"
              y="30"
              width="3"
              height="3"
              rx="0.5"
              fill="#FFA500"
              opacity="0.65"
            />
            <rect
              x="283"
              y="30"
              width="3"
              height="3"
              rx="0.5"
              fill="#FFD700"
              opacity="0.6"
            />
            <rect
              x="373"
              y="32"
              width="4"
              height="3"
              rx="0.5"
              fill="#FFA500"
              opacity="0.5"
            />
          </svg>

          {/* Gift stars */}
          {heroGifts.map((gift) => (
            <StarOrb
              key={gift.slug}
              slug={gift.slug}
              pos={starPositions[gift.slug]}
              isOpen={openStar === gift.slug}
              onTap={() => handleStarTap(gift.slug)}
            />
          ))}

          {/* Sparkle burst */}
          {sparkTarget && <SparkBurst x={sparkTarget.x} y={sparkTarget.y} />}

          {/* Gift reveal card */}
          {openStar && (
            <GiftCard
              key={openStar}
              slug={openStar}
              pos={starPositions[openStar]}
              onClose={() => handleStarTap(openStar)}
              onNavigate={handleNavigate}
            />
          )}
        </div>
      </section>

      {/* Mobile dots */}
      <div className="starry-dots">
        {heroGifts.map((gift) => (
          <button
            key={gift.slug}
            className={`starry-dot ${openStar === gift.slug ? 'starry-dot-active' : ''}`}
            onClick={() => handleStarTap(gift.slug)}
            aria-label={gift.name}
          />
        ))}
      </div>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
