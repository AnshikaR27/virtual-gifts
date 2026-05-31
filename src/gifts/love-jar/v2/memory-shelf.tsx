'use client';

/**
 * MemoryShelf — the little pile of notes already read (design-system §9).
 *
 * Sits ON the wooden surface at the bottom of the scene. Each kept note is a
 * tiny folded-paper tab tilted at its own angle (-12°..+12°), overlapping its
 * neighbours like a real pile. Grows as the recipient reads through the jar.
 */

const TAB_COLORS = ['#FFC4D6', '#FFD6A5', '#E0BBE4', '#B5EAD7', '#FFDAC1'];

export function MemoryShelf({ kept }: { kept: number }) {
  if (kept <= 0) return null;
  // Cap the visible pile so it never overflows; the count carries the rest.
  const shown = Math.min(kept, 8);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 flex items-end justify-center"
      style={{ bottom: '4%' }}
      aria-hidden
    >
      <div className="relative flex items-end" style={{ height: 40 }}>
        {Array.from({ length: shown }).map((_, i) => {
          const rot = -12 + (i * 24) / Math.max(1, shown - 1);
          return (
            <div
              key={i}
              style={{
                width: 26,
                height: 32,
                marginLeft: i === 0 ? 0 : -14,
                transform: `rotate(${rot}deg) translateY(${(i % 2) * -2}px)`,
                background: TAB_COLORS[i % TAB_COLORS.length],
                borderRadius: 3,
                border: '1px solid rgba(160,128,96,0.25)',
                boxShadow: '0 2px 4px rgba(139,115,85,0.18)',
              }}
            >
              {/* fold line */}
              <div
                style={{
                  margin: '4px auto 0',
                  width: 1,
                  height: 22,
                  background: 'rgba(255,255,255,0.5)',
                }}
              />
            </div>
          );
        })}
      </div>

      <span
        className="ml-3 font-handwritten text-[15px] lowercase"
        style={{ color: 'rgba(120,90,55,0.7)' }}
      >
        {kept} kept ♡
      </span>
    </div>
  );
}
