'use client';

import type { Heart, JarPhase } from '../hooks/use-jar-state';

interface JarIllustratedProps {
  recipientName: string;
  hearts: Heart[];
  energy: number;
  phase: JarPhase;
  onShake: () => void;
}

export function JarIllustrated({
  recipientName,
  hearts,
  energy,
  phase,
  onShake,
}: JarIllustratedProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      onClick={onShake}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onShake();
      }}
      aria-label={`Love jar for ${recipientName} — tap to shake`}
    >
      <div className="flex h-[340px] w-[280px] items-center justify-center rounded-md border border-dashed border-[#C9A47C]/30">
        <p className="font-handwritten text-[18px] text-[#A08060]">
          jar illustration coming soon
        </p>
      </div>
    </div>
  );
}
