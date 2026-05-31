'use client';

import { useCallback, useState } from 'react';
import { playClick } from '@/components/retro-sounds';

/**
 * ReactionRibbon — the soft "say something back" beat (Path D #3).
 *
 * Appears AFTER the jar is empty, not as an entrance gate. A bare row of
 * WhatsApp-style emoji on the cream surface — no Win98 bevel bar. Tapping one
 * floats it up with the existing "poof" animation (reuses the shared
 * reaction-float / reaction-emoji CSS from globals.css).
 */

const REACTIONS = ['🥹', '❤️', '✨', '🌸', '🫶', '😭'] as const;

export function ReactionRibbon({
  onReact,
}: {
  onReact?: (emoji: string) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [floating, setFloating] = useState<string | null>(null);

  const handle = useCallback(
    (emoji: string) => {
      playClick();
      setPicked(emoji);
      setFloating(emoji);
      onReact?.(emoji);
      setTimeout(() => setFloating(null), 700);
    },
    [onReact],
  );

  return (
    <div className="flex flex-col items-center">
      <p
        className="mb-2 font-handwritten text-[18px] lowercase"
        style={{ color: 'rgba(120,90,55,0.8)' }}
      >
        {picked ? 'sent back to them ♡' : 'send a little something back ♡'}
      </p>

      <div className="reaction-bar" style={{ minHeight: 48 }}>
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="reaction-emoji"
            aria-label={`react ${emoji}`}
            onClick={() => handle(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>

      {floating && (
        <div className="reaction-float-layer" aria-hidden>
          <span className="reaction-float-main">{floating}</span>
          <span
            className="reaction-float-ghost"
            style={{ marginLeft: -28, animationDelay: '40ms' }}
          >
            {floating}
          </span>
          <span
            className="reaction-float-ghost"
            style={{ marginLeft: 30, animationDelay: '90ms' }}
          >
            {floating}
          </span>
        </div>
      )}
    </div>
  );
}
