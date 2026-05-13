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
        <span className="text-[10px] font-bold leading-none text-black">✕</span>
      </span>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="win98-window">
          <div className="win98-titlebar text-[14px]">
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
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <div key={step.number} className="relative text-center">
                  <span className="pointer-events-none absolute -right-1 -top-2 select-none font-pixel text-[48px] leading-none text-[#C8A2E8]/30 md:text-[72px]">
                    {step.number}
                  </span>
                  <div className="relative">
                    <span className="text-3xl">{step.emoji}</span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-[#2D0A4E]">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-black/60">
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
