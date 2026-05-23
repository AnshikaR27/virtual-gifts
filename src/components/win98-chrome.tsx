export function TitlebarButtons() {
  return (
    <div className="flex gap-[2px]">
      <button className="win98-titlebar-btn" aria-label="Minimize">
        <span className="mt-[2px] block h-[2px] w-[6px] bg-black" />
      </button>
      <button className="win98-titlebar-btn" aria-label="Maximize">
        <span className="block h-[7px] w-[7px] border border-black" />
      </button>
      <button className="win98-titlebar-btn" aria-label="Close">
        <span className="text-[10px] font-bold leading-none text-ink">✕</span>
      </button>
    </div>
  );
}
