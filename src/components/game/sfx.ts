'use client';

import { playClick } from '@/components/retro-sounds';

/**
 * Game sound effects. v1 ships WITHOUT audio files: every call site is wired,
 * but playSfx() is a no-op until SFX_ENABLED is flipped and the mp3s land in
 * /public/sounds (v1.1 — no code changes needed then). playClick() (the
 * existing chiptune blip) is always live and used for taps.
 */

// Flip to true in v1.1 once the chiptune files exist.
export const SFX_ENABLED = false;

export type SfxName = 'jingle' | 'bloop' | 'ding' | 'victory';

const SFX_SRC: Record<SfxName, string> = {
  jingle: '/sounds/jingle.mp3',
  bloop: '/sounds/bloop.mp3',
  ding: '/sounds/ding.mp3',
  victory: '/sounds/victory.mp3',
};

export function playSfx(name: SfxName): void {
  if (!SFX_ENABLED) return; // no-op until audio files ship
  try {
    const audio = new Audio(SFX_SRC[name]);
    audio.volume = 0.4;
    void audio.play().catch(() => {});
  } catch {
    // ignore — sound is non-essential
  }
}

export { playClick };
