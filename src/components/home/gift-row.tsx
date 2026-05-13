import { GiftCard } from './gift-card';
import type { GiftRowData } from './gift-catalog';

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

export function GiftRow({ id, title, emoji, priceBadge, gifts }: GiftRowData) {
  return (
    <section id={id} className="px-4 py-5 md:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="win98-window">
          <div className="win98-titlebar text-[14px]">
            <span>
              📁 {title} — [{priceBadge}]
            </span>
            <TitlebarButtons />
          </div>
          <div
            className="border-2 bg-white p-3"
            style={{
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
            }}
          >
            <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
              {gifts.map((gift) => (
                <GiftCard key={gift.slug} {...gift} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
