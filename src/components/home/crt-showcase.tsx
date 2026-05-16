'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { GiftLoading } from '@/components/gift-loading';

interface Channel {
  slug: string;
  emoji: string;
  name: string;
  desc: string;
  tint: string;
}

const channels: Channel[] = [
  {
    slug: 'love-jar',
    emoji: '\u{1FAD9}',
    name: 'Love Jar',
    desc: 'Shake to pull random love notes',
    tint: 'rgba(255, 182, 193, 0.12)',
  },
  {
    slug: 'wishing-dandelion',
    emoji: '\u{1F32C}️',
    name: 'Wishing Dandelion',
    desc: 'Blow to scatter seeds of wishes',
    tint: 'rgba(200, 180, 255, 0.12)',
  },
  {
    slug: 'the-proposal',
    emoji: '\u{1F48D}',
    name: 'The Proposal',
    desc: "The 'No' button runs away",
    tint: 'rgba(180, 240, 200, 0.12)',
  },
  {
    slug: 'spotify-wrapped',
    emoji: '\u{1F4CA}',
    name: 'Spotify Wrapped',
    desc: 'Your relationship, Wrapped-style',
    tint: 'rgba(255, 215, 100, 0.12)',
  },
  {
    slug: 'sorry-puppy',
    emoji: '\u{1F97A}',
    name: 'Sorry Puppy',
    desc: 'Your taps clear the rain away',
    tint: 'rgba(255, 160, 140, 0.12)',
  },
];

function playClick() {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch {}
}

export function CrtShowcase() {
  const [currentCh] = useState(0);
  const [loading, setLoading] = useState(false);
  const targetSlug = useRef('');
  const router = useRouter();

  const channel = channels[currentCh];

  const handleScreenTap = useCallback(() => {
    if (loading) return;
    playClick();
    targetSlug.current = channel.slug;
    router.prefetch(`/gift/${channel.slug}`);
    setLoading(true);
  }, [channel, router, loading]);

  const handleLoadComplete = useCallback(() => {
    router.push(`/gift/${targetSlug.current}`);
  }, [router]);

  return (
    <>
      <div className="px-4 pb-3 pt-10 text-center">
        <p
          className="font-handwritten text-[22px] md:text-[26px]"
          style={{
            color: '#8B6F4E',
            textShadow: '0 1px 3px rgba(139,111,78,0.2)',
          }}
        >
          &#9733; now showing &mdash; fan favorites &#9733;
        </p>
      </div>

      <section className="crt-section">
        <div className="crt-tv">
          {/* Screen area */}
          <div className="crt-screen-bezel">
            <div
              className="crt-screen"
              style={{ '--screen-tint': channel.tint } as React.CSSProperties}
              onClick={handleScreenTap}
              role="button"
              tabIndex={0}
              aria-label={`Create ${channel.name} gift`}
            >
              <div className="crt-screen-content">
                <span className="crt-screen-emoji">{channel.emoji}</span>
                <span className="crt-screen-name font-pixel">
                  {channel.name}
                </span>
                <span className="crt-screen-desc font-body">
                  {channel.desc}
                </span>
                <span className="crt-screen-cta font-body">
                  &#9654; tap to create
                </span>
              </div>

              {/* CRT overlays */}
              <div className="crt-scanlines" aria-hidden />
              <div className="crt-glass-reflection" aria-hidden />
              <div className="crt-vignette" aria-hidden />
            </div>
          </div>

          {/* Control panel */}
          <div className="crt-controls">
            <div className="crt-speaker" aria-hidden />
            <div className="crt-dial" aria-hidden>
              <span className="crt-dial-notch" />
            </div>
            <button className="crt-btn" aria-label="Previous channel">
              &#9664;
            </button>
            <button className="crt-btn" aria-label="Next channel">
              &#9654;
            </button>
            <div className="crt-led" aria-hidden />
            <span className="crt-brand font-pixel">HoneyVision&trade;</span>
          </div>
        </div>

        {/* Feet */}
        <div className="crt-feet" aria-hidden>
          <span className="crt-foot crt-foot-l" />
          <span className="crt-foot crt-foot-r" />
        </div>
      </section>

      {loading && <GiftLoading onComplete={handleLoadComplete} />}
    </>
  );
}
