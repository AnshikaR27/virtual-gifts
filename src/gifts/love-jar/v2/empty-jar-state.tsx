'use client';

import { ReactionRibbon } from './reaction-ribbon';

/**
 * EmptyJarState — the soft landing once every note has been read
 * (design-system §9). A gentle line, then the reaction ribbon (Path D #3).
 * The jar itself stays in the scene behind this, now empty.
 */

export function EmptyJarState({
  onReact,
}: {
  onReact?: (emoji: string) => void;
}) {
  return (
    <div
      className="pointer-events-auto absolute inset-x-0 z-30 flex flex-col items-center px-6 text-center"
      style={{ top: '16%' }}
    >
      <p
        className="font-handwritten text-[26px] lowercase leading-tight"
        style={{ color: '#3D2817' }}
      >
        that&apos;s all of them, for now ♡
      </p>
      <p
        className="mt-1 font-handwritten text-[18px] lowercase"
        style={{ color: 'rgba(120,90,55,0.75)' }}
      >
        keep the jar somewhere gentle.
      </p>

      <div className="mt-6">
        <ReactionRibbon onReact={onReact} />
      </div>
    </div>
  );
}
