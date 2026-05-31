'use client';

/**
 * ShakePrompt — the soft nudge above the jar (design-system §9).
 *
 * Tells the recipient how to take a note out and how many are left. Phrased
 * for both worlds (a shake on mobile, a tap on desktop) without any system
 * vocabulary. Fades itself out while a note is open.
 */

interface ShakePromptProps {
  remaining: number;
  total: number;
  visible: boolean;
}

export function ShakePrompt({ remaining, total, visible }: ShakePromptProps) {
  return (
    <div
      className="lj2-prompt-pulse pointer-events-none absolute left-1/2 z-20 flex flex-col items-center text-center"
      style={{
        top: '12%',
        opacity: visible ? undefined : 0,
        transition: 'opacity 300ms ease',
      }}
      aria-hidden
    >
      <p
        className="font-handwritten text-[22px] lowercase"
        style={{ color: '#3D2817' }}
      >
        give it a little shake ♡
      </p>
      <p
        className="mt-0.5 font-handwritten text-[15px] lowercase"
        style={{ color: 'rgba(120,90,55,0.7)' }}
      >
        (or tap the jar)
      </p>
      <p
        className="mt-1 lowercase"
        style={{
          fontFamily: 'Tahoma, sans-serif',
          fontSize: 10,
          letterSpacing: 0.4,
          color: 'rgba(160,128,96,0.6)',
        }}
      >
        {remaining} of {total} little notes left
      </p>
    </div>
  );
}
