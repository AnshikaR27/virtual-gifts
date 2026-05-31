'use client';

/**
 * AmbientBackground — Layers 1–3 of the craft-table scene
 * (design-system §4.3 + composition addendum §C).
 *
 * Pure presentational, no props. Everything is deterministic (no Math.random
 * at render) so SSR and client markup match. All motion is gated behind
 * `prefers-reduced-motion` via the lj2- CSS classes.
 *
 *   Layer 1 — cream room wall + 3 warm radial blushes (same recipe as the
 *             homepage polaroid wall, for instant visual continuity)
 *   Layer 2 — afternoon window light pouring in from the upper-right
 *   Layer 3 — floating atmosphere: bokeh, drifting sparkles, dust motes
 */

// Warm bokeh dots, biased to the right where the light comes from.
const BOKEH = [
  { left: 78, top: 14, size: 110, dur: 9 },
  { left: 88, top: 32, size: 70, dur: 11 },
  { left: 66, top: 22, size: 54, dur: 8 },
  { left: 82, top: 52, size: 90, dur: 12 },
  { left: 58, top: 10, size: 44, dur: 10 },
  { left: 92, top: 64, size: 60, dur: 13 },
  { left: 70, top: 44, size: 40, dur: 9.5 },
];

// Drifting sparkles (reuses the existing `love-jar-sparkle-drift` CSS).
const SPARKLES = [
  { left: 20, top: 30, dur: 7, delay: 0 },
  { left: 35, top: 18, dur: 9, delay: 1.5 },
  { left: 50, top: 40, dur: 8, delay: 3 },
  { left: 64, top: 26, dur: 10, delay: 0.8 },
  { left: 76, top: 48, dur: 7.5, delay: 2.2 },
  { left: 14, top: 56, dur: 9.5, delay: 4 },
  { left: 44, top: 60, dur: 8.5, delay: 1 },
  { left: 86, top: 22, dur: 7, delay: 2.8 },
  { left: 30, top: 46, dur: 10, delay: 3.6 },
  { left: 58, top: 14, dur: 8, delay: 0.4 },
  { left: 72, top: 62, dur: 9, delay: 5 },
  { left: 24, top: 12, dur: 7.5, delay: 2 },
];

// Tiny dust motes rising in the light.
const DUST = [
  { left: 74, top: 40, dur: 11, delay: 0 },
  { left: 82, top: 55, dur: 13, delay: 2 },
  { left: 68, top: 30, dur: 12, delay: 4 },
  { left: 88, top: 46, dur: 14, delay: 1 },
  { left: 60, top: 50, dur: 12.5, delay: 3 },
];

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1 — cream wall + warm radial blushes */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#f5f0eb',
          backgroundImage: [
            'radial-gradient(ellipse at 20% 50%, rgba(186, 162, 131, 0.12) 0%, transparent 50%)',
            'radial-gradient(ellipse at 80% 20%, rgba(186, 162, 131, 0.08) 0%, transparent 50%)',
            'radial-gradient(ellipse at 50% 80%, rgba(186, 162, 131, 0.06) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Layer 2 — afternoon window light (the most important atmospheric beat) */}
      <div
        className="lj2-window-light absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 80% 15%, rgba(255, 200, 130, 0.35) 0%, transparent 55%)',
        }}
      />

      {/* Layer 3a — warm bokeh */}
      {BOKEH.map((b, i) => (
        <div
          key={`bokeh-${i}`}
          className="lj2-bokeh absolute rounded-full"
          style={
            {
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: b.size,
              height: b.size,
              background:
                'radial-gradient(circle, rgba(255, 184, 119, 0.22), transparent 70%)',
              filter: 'blur(12px)',
              '--lj2-bokeh-dur': `${b.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Layer 3b — drifting sparkles */}
      {SPARKLES.map((s, i) => (
        <span
          key={`sparkle-${i}`}
          className="love-jar-sparkle-drift absolute"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Layer 3c — dust motes */}
      {DUST.map((d, i) => (
        <span
          key={`dust-${i}`}
          className="lj2-dust absolute rounded-full"
          style={
            {
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: 2,
              height: 2,
              background: 'rgba(255, 255, 255, 0.85)',
              '--lj2-dust-dur': `${d.dur}s`,
              animationDelay: `${d.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
