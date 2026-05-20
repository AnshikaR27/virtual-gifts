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
            className="border-2 p-3 md:p-5"
            style={{
              background: 'var(--win-chrome)',
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
            }}
          >
            <div ref={revealRef} className="grid gap-3 md:grid-cols-3 md:gap-4">
              {steps.map((step) => (
                <div key={step.number} className="win98-window" data-reveal>
                  <div className="win98-titlebar">
                    <span>
                      {step.emoji} Step_{step.number}.txt
                    </span>
                    <TitlebarButtons />
                  </div>
                  <div className="win98-body text-center">
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
