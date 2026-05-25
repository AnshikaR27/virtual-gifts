'use client';

interface ShakePromptProps {
  energy: number;
  visible: boolean;
}

export function ShakePrompt({ energy, visible }: ShakePromptProps) {
  if (!visible) return null;

  return (
    <p className="text-center font-handwritten text-[22px] text-[#3D2817]">
      shake me ♡
    </p>
  );
}
