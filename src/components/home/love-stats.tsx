'use client';

import { useReveal } from '@/hooks/use-reveal';

function TitlebarButtons() {
  return (
    <div className="flex gap-[2px]">
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="mt-[2px] block h-[2px] w-[6px] bg-black" />
      </span>
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="block h-[7px] w-[7px] border border-black" />
      </span>
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="text-[10px] font-bold leading-none text-ink">✕</span>
      </span>
    </div>
  );
}

const stats = [
  { label: '💕 Gifts created', value: '0 (so far)' },
  { label: '😭 Happy tears caused', value: '∞' },
  { label: '📊 Hearts crashed', value: '(lovingly)' },
  { label: '💾 Storage', value: 'Unlimited love' },
  { label: '⏰ Uptime', value: 'Since you got here' },
];

export function LoveStats() {
  const revealRef = useReveal<HTMLDivElement>({ staggerMs: 80 });

  return (
    <section className="px-4 py-5 md:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="win98-window">
          <div className="win98-titlebar">
            <span>💻 My Computer — Love Stats</span>
            <TitlebarButtons />
          </div>
          <div className="win98-body" ref={revealRef}>
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 font-body text-[15px]"
                data-reveal
                style={{
                  borderBottom:
                    i < stats.length - 1
                      ? '1px solid var(--win-chrome-dark)'
                      : 'none',
                }}
              >
                <span className="text-ink/80">{stat.label}</span>
                <span className="font-bold text-ink">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
