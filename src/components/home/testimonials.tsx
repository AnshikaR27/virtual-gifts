'use client';

import { useReveal } from '@/hooks/use-reveal';

const quotes = [
  {
    text: 'My boyfriend shook the Love Jar 47 times. FORTY SEVEN.',
    username: 'Priya',
  },
  {
    text: 'She opened the Reverse Love Letter in a meeting. HR got involved.',
    username: 'Anon',
  },
  {
    text: "I sent Sorry Puppy after a fight. We're married now.",
    username: 'Rahul',
  },
  {
    text: 'The Spotify Wrapped one made my entire friend group cry.',
    username: 'Sneha',
  },
  {
    text: 'He blew into his phone for the Dandelion at 3 AM. Dedication.',
    username: 'Aisha',
  },
  {
    text: 'My Terms & Conditions got 200 story reposts. She said yes btw.',
    username: 'Arjun',
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

export function Testimonials() {
  const revealRef = useReveal<HTMLDivElement>({ staggerMs: 80 });

  return (
    <section
      className="px-4"
      style={{ paddingTop: 0, paddingBottom: 'var(--space-md)' }}
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-[24px] font-semibold text-ink md:text-[32px]">
          C:\Reviews\happy_tears
        </h2>
        <div
          ref={revealRef}
          className="scrollbar-hide -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
        >
          {quotes.map((q) => (
            <div
              key={q.username}
              className="w-[270px] flex-shrink-0 snap-start md:w-[310px]"
              data-reveal
              style={{
                background: 'var(--win-chrome)',
                border: '2px solid',
                borderColor:
                  'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
                boxShadow: '2px 2px 0 0 rgba(0,0,0,0.2)',
                padding: 2,
              }}
            >
              <div
                className="flex items-center justify-between px-1.5 py-[2px]"
                style={{
                  background:
                    'linear-gradient(90deg, var(--win-title-start), var(--win-title-end))',
                }}
              >
                <span className="font-pixel text-[15px] text-white">
                  {q.username} — Notepad
                </span>
                <TitlebarButtons />
              </div>
              <div
                className="border-2 bg-white px-4 py-4"
                style={{
                  borderColor:
                    'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
                }}
              >
                <p className="font-body text-[15px] leading-relaxed text-ink">
                  &ldquo;{q.text}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
