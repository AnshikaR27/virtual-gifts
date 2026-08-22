'use client';

/**
 * <GiftGate> — the front door, whichever one a gift chose.
 *
 *   the greeting popup  →  THIS  →  the gift
 *
 * There are two doors and every gift picks exactly one:
 *
 *   'passcode'  ENTER_CODE.exe — four digits, then the Y2K bar.
 *               ./passcode-gate.tsx
 *   'captcha'   A one-round recognition game on zoomed-in crops of the gift's
 *               own photographs, then the Y2K bar. ./captcha-gate.tsx
 *
 * ── WHY A DISPATCHER RATHER THAN A PROP ON EACH GATE ───────────────────────
 * Both gates already share a shape — wrap the gift, render it when they are
 * satisfied — so a gift could import whichever one it wanted directly. It goes
 * through here instead so that the CHOICE is a value rather than an import: a
 * gift's flow declares `const GATE: GateMode = 'passcode'` at the top of the
 * file, one word to change, and nothing else about the gift moves. When gate
 * mode eventually comes from the database rather than a constant, this is the
 * only thing that has to learn how to read it.
 *
 * ── THE CAPTCHA NEEDS PHOTOGRAPHS ──────────────────────────────────────────
 * The passcode gate works for any gift. The captcha gate does not: its puzzle
 * IS the gift's photographs, so a gift with none cannot use it. That is why
 * `photos` is required whenever mode is 'captcha' — the union below makes it a
 * type error to ask for the captcha without supplying the answer key, rather
 * than something that fails at runtime in front of a recipient.
 */

import type { ReactNode } from 'react';
import { PasscodeGate } from './passcode-gate';
import { CaptchaGate, type GatePhoto } from './captcha-gate';

/** The per-gift setting. Declared as a constant in each gift's flow file. */
export type GateMode = 'passcode' | 'captcha';

interface GateCommon {
  /** The gift. Rendered only once the gate is satisfied. */
  children: ReactNode;
  /** Skip straight to the gift. For preview routes, never for a recipient. */
  startOpen?: boolean;
  /** Fired when the gate is satisfied, i.e. when the loading bar starts. */
  onUnlock?: () => void;
  /** Fired when the loader finishes and the gift is actually on screen. */
  onOpen?: () => void;
}

interface PasscodeGateOpts extends GateCommon {
  mode: 'passcode';
  /** Prompt above the dots. Each gift speaks in its own voice here. */
  prompt?: string;
  /** The sender's hint. PLACEHOLDER — real hints are not wired. */
  hint?: string;
  photos?: never;
  fillers?: never;
}

interface CaptchaGateOpts extends GateCommon {
  mode: 'captcha';
  /** REQUIRED. The gift's own photographs — they are the puzzle. */
  photos: GatePhoto[];
  /** The strangers. Defaults to the set in ./captcha-gate.tsx. */
  fillers?: GatePhoto[];
  prompt?: never;
  hint?: never;
}

export type GiftGateProps = PasscodeGateOpts | CaptchaGateOpts;

export function GiftGate(props: GiftGateProps) {
  if (props.mode === 'captcha') {
    const { children, photos, fillers, startOpen, onUnlock, onOpen } = props;
    return (
      <CaptchaGate
        photos={photos}
        fillers={fillers}
        startOpen={startOpen}
        onUnlock={onUnlock}
        onOpen={onOpen}
      >
        {children}
      </CaptchaGate>
    );
  }

  const { children, prompt, hint, startOpen, onUnlock, onOpen } = props;
  return (
    <PasscodeGate
      prompt={prompt}
      hint={hint}
      startOpen={startOpen}
      onUnlock={onUnlock}
      onOpen={onOpen}
    >
      {children}
    </PasscodeGate>
  );
}
