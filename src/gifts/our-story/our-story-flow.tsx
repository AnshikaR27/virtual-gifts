'use client';

/**
 * <OurStoryFlow> — the receiver's whole journey for OUR_STORY.
 *
 *   the front door  →  the Y2K progress bar  →  the polaroid wall
 *
 * The door is <GiftGate> (gifts/shared/gift-gate.tsx), shared with every other
 * gated gift — this file supplies only which door, the words on it, and the
 * wall that comes out the other side. If the transition needs tuning, tune it
 * in the gate and every gift moves together.
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
 * WHY THE BEATS LOOK DIFFERENT, ON PURPOSE: the gate and the loader get full
 * Win98 window chrome because they are the app talking — system steps. The wall
 * gets none, because it is the gift itself, and a window frame would put an
 * application between the recipient and their photographs. Same rule the
 * love-receipt reveal follows.
 */

import { GiftGate, type GateMode } from '@/gifts/shared/gift-gate';
import type { GatePhoto } from '@/gifts/shared/captcha-gate';
import { MemoryWall } from './memory-wall';
import { MEMORIES, type Memory } from './memories';

/**
 * ── THIS GIFT'S FRONT DOOR. ONE WORD TO CHANGE. ────────────────────────────
 *
 *   'passcode'  four digits — the wall's own hint is a date, which suits it
 *   'captcha'   find the two of them among strangers, on zoomed-in crops
 *
 * Set to 'passcode' deliberately. This gift's whole reveal is photographs
 * arriving one at a time on the wall, and the captcha gate spends its charm on
 * the same photographs a few seconds earlier — the door would be showing the
 * recipient the room before opening it. A gift whose payload is NOT photos is
 * the better home for the captcha.
 */
export const GATE: GateMode = 'passcode';

/**
 * Copy for the passcode step. Kept here rather than in the shared gate because
 * it is this gift's voice, not the keypad's.
 */
export const GATE_COPY = {
  prompt: 'enter the code',
  hint: 'the day we met (ddmm)',
} as const;

/**
 * The wall's memories as the captcha gate wants them. Only read when GATE is
 * 'captcha'; memories without a photo are dropped, because a blank square is
 * not a puzzle.
 */
export function gatePhotosFrom(memories: Memory[]): GatePhoto[] {
  return memories
    .filter((m) => !!m.photo)
    .map((m) => ({ src: m.photo as string, alt: m.caption }));
}

export interface OurStoryFlowProps {
  /** Defaults to the placeholder set in memories.ts. */
  memories?: Memory[];
  /** Overrides the GATE constant. For preview routes, never for a recipient. */
  gate?: GateMode;
  /** Start past the gate. Used by the preview route's `?skip=1`. */
  startUnlocked?: boolean;
  /** Fired once, the first time a polaroid is turned over. */
  onFirstFlip?: () => void;
  /** Fired on every flip to a memory, with that memory's id. */
  onFlip?: (id: string) => void;
  /** Fired when the gate is satisfied — i.e. when the loading bar starts. */
  onUnlock?: () => void;
}

export function OurStoryFlow({
  memories = MEMORIES,
  gate = GATE,
  startUnlocked = false,
  onFirstFlip,
  onFlip,
  onUnlock,
}: OurStoryFlowProps) {
  const wall = (
    <MemoryWall memories={memories} onFirstFlip={onFirstFlip} onFlip={onFlip} />
  );

  // Branched rather than spread, because <GiftGate>'s props are a discriminated
  // union: passing `mode` as a variable would defeat the narrowing that makes
  // `photos` required for the captcha and forbidden for the passcode.
  if (gate === 'captcha') {
    return (
      <GiftGate
        mode="captcha"
        photos={gatePhotosFrom(memories)}
        startOpen={startUnlocked}
        onUnlock={onUnlock}
      >
        {wall}
      </GiftGate>
    );
  }

  return (
    <GiftGate
      mode="passcode"
      prompt={GATE_COPY.prompt}
      hint={GATE_COPY.hint}
      startOpen={startUnlocked}
      onUnlock={onUnlock}
    >
      {wall}
    </GiftGate>
  );
}
