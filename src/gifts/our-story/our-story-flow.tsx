'use client';

/**
 * <OurStoryFlow> — the receiver's whole journey for OUR_STORY.
 *
 *   ENTER_CODE.exe  →  the Y2K progress bar  →  the polaroid wall
 *
 * The first two beats are <PasscodeGate>, shared with every other gated gift
 * (gifts/shared/passcode-gate.tsx) — this file supplies only the words on the
 * keypad and the wall that comes out the other side. If the transition needs
 * tuning, tune it there and every gift moves together.
 *
 * The greeting popup is the beat BEFORE all of this and it is not rendered
 * here: <WelcomePopup> is mounted once in app/layout.tsx and fires itself on
 * any route that `getRouteRole` calls a receiver. That is why this gift's
 * routes have to sit under a prefix listed in lib/route-roles.ts — doing so is
 * what gets the popup AND strips the marketing shell. Rendering a second popup
 * here would show two.
 *
 * THE PASSCODE DOES NOT VALIDATE ANYTHING — any four digits open the wall. See
 * the boxed note in passcode-gate.tsx.
 *
 * WHY THE BEATS LOOK DIFFERENT, ON PURPOSE: the keypad and the loader get full
 * Win98 window chrome because they are the app talking — system steps. The wall
 * gets none, because it is the gift itself, and a window frame would put an
 * application between the recipient and their photographs. Same rule the
 * love-receipt reveal follows.
 */

import { PasscodeGate } from '@/gifts/shared/passcode-gate';
import { MemoryWall } from './memory-wall';
import { MEMORIES, type Memory } from './memories';

/**
 * Copy for the passcode step. Kept here rather than in the shared gate because
 * it is this gift's voice, not the keypad's.
 */
export const GATE_COPY = {
  prompt: 'enter the code',
  hint: 'the day we met (ddmm)',
} as const;

export interface OurStoryFlowProps {
  /** Defaults to the placeholder set in memories.ts. */
  memories?: Memory[];
  /** Start past the gate. Used by the preview route's `?skip=1`. */
  startUnlocked?: boolean;
  /** Fired once, the first time a polaroid is turned over. */
  onFirstFlip?: () => void;
  /** Fired on every flip to a memory, with that memory's id. */
  onFlip?: (id: string) => void;
  /** Fired when the code is accepted — i.e. when the loading bar starts. */
  onUnlock?: () => void;
}

export function OurStoryFlow({
  memories = MEMORIES,
  startUnlocked = false,
  onFirstFlip,
  onFlip,
  onUnlock,
}: OurStoryFlowProps) {
  return (
    <PasscodeGate
      prompt={GATE_COPY.prompt}
      hint={GATE_COPY.hint}
      startOpen={startUnlocked}
      onUnlock={onUnlock}
    >
      <MemoryWall
        memories={memories}
        onFirstFlip={onFirstFlip}
        onFlip={onFlip}
      />
    </PasscodeGate>
  );
}
