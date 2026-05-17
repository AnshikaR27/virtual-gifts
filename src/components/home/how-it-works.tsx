'use client';

import { useReveal } from '@/hooks/use-reveal';

const steps = [
  {
    number: '01',
    emoji: '🎯',
    title: 'Pick a vibe',
    description: 'Choose from 87 interactive experiences',
  },
  {
    number: '02',
    emoji: '✍️',
    title: 'Make it yours',
    description: 'Our prompts pull the real stuff out of you',
  },
  {
    number: '03',
    emoji: '🚀',
    title: 'Send & watch',
    description: 'Share the link on WhatsApp. Wait for tears.',
  },
];

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

export function HowItWorks() {
  const revealRef = useReveal<HTMLDivElement>({ staggerMs: 80 });

  return (
    <section
      id="how-it-works"
      className="px-4"
      style={{ paddingTop: 0, paddingBottom: 'var(--space-md)' }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="win98-window">
          <div className="win98-titlebar">
            <span>📖 README.txt — How It Works</span>
            <TitlebarButtons />
          </div>
          <div
            className="border-2 bg-white p-4 md:p-6"
            style={{
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
            }}
          >
            <div ref={revealRef} className="grid gap-6 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative text-center"
                  data-reveal
                >
                  <span className="pointer-events-none absolute -right-1 -top-2 select-none font-pixel text-[40px] leading-none text-[#C8A2E8]/30 md:text-[72px]">
                    {step.number}
                  </span>
                  <div className="relative">
                    <span className="text-3xl">{step.emoji}</span>
                    <h3 className="mt-3 font-display text-[18px] font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-body text-[15px] leading-relaxed text-ink/60">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
