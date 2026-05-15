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

export function CommunityCTA() {
  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-md">
        <div className="win98-window">
          <div className="win98-titlebar text-[14px]">
            <span>⚠️ SYSTEM</span>
            <TitlebarButtons />
          </div>
          <div
            className="border-2 bg-white px-6 py-8 text-center"
            style={{
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
            }}
          >
            <p className="font-pixel text-[20px] leading-snug text-black md:text-[22px]">
              Would you like to find love?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <a href="#browse" className="win98-btn-pink text-[18px]">
                Yes
              </a>
              <a href="#browse" className="win98-btn-pink text-[18px]">
                Absolutely!
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
