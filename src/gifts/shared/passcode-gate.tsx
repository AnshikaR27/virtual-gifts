'use client';

/**
 * <PasscodeGate> — the three beats every gated gift passes through:
 *
 *   ENTER_CODE.exe  →  the Y2K progress bar  →  the gift
 *
 * SHARED ON PURPOSE. Any gift that wants a passcode wraps its reveal in this
 * and gets the identical sequence — same keypad, same loading dialog, same
 * timing. A second gift must never grow its own copy of this transition; the
 * whole reason it is a component is so the beat between "code accepted" and
 * "here is your gift" feels the same everywhere.
 *
 * WHAT IT REUSES, rather than rebuilds:
 *   · <PasscodeScreen>  gifts/love-receipt/passcode/passcode-screen.tsx
 *   · <GiftLoading>     components/gift-loading.tsx — the same Win98 progress
 *                       dialog the homepage shows while a route loads.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  THE PASSCODE DOES NOT VALIDATE ANYTHING.                                 │
 * │  <PasscodeScreen> has no notion of a correct code — it collects digits    │
 * │  and hands them over. ANY four digits open the gift. This is a curtain,   │
 * │  not a lock, and it must not be described as protecting anything until    │
 * │  real codes are wired. When they are, this component is where the check   │
 * │  goes: reject in handleCode() and never advance the phase.                │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * WHY THE KEYPAD STAYS MOUNTED UNDER THE LOADER: <GiftLoading> portals a
 * dialog over a translucent scrim, so it needs something behind it. Keeping the
 * screen the recipient was just looking at is what makes the loader read as a
 * dialog opening ON something, the way a Win98 dialog does — unmounting it
 * first would flash an empty page through the scrim.
 */

import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { GiftLoading } from '@/components/gift-loading';
import { PasscodeScreen } from '@/gifts/love-receipt/passcode/passcode-screen';

/**
 * What the loading dialog says while the gift is "opening". One is drawn at
 * random per unlock.
 *
 * VOICE: cheeky and warm, the same masala register as the receiver popups —
 * but this is the MACHINE talking, in VT323, so it can be a little more
 * deadpan-system than the popups are. Lowercase, no emoji, and it should end
 * in an ellipsis: it is a progress message, not a sentence.
 *
 * Add freely; the pool is read at unlock time and nothing depends on its
 * length or order.
 */
export const UNLOCK_MESSAGES: string[] = [
  'unwrapping your gift...',
  'warming up the memories...',
  "loading someone's feelings...",
  'almost there... get ready',
  'decrypting how much they love you...',
];

/** Titlebar caption on the loading dialog. Keep the .exe — it is the joke. */
export const UNLOCK_TITLE = '🎁 OPENING.exe';

/**
 * How long the bar takes. Long enough to register as a beat, short enough that
 * nobody waiting on a gift starts wondering if it broke. Skipped entirely
 * under prefers-reduced-motion — see <GiftLoading>.
 */
export const UNLOCK_DURATION_MS = 1800;

/** locked → unlocking → open. There is no way back; opening is one-way. */
type Phase = 'locked' | 'unlocking' | 'open';

export interface PasscodeGateProps {
  /** The gift. Rendered only once the gate is open. */
  children: ReactNode;
  /** Prompt above the dots. Each gift speaks in its own voice here. */
  prompt?: string;
  /** The sender's hint. PLACEHOLDER — real hints are not wired. */
  hint?: string;
  /** Skip straight to the gift. For preview routes, never for a recipient. */
  startOpen?: boolean;
  /** Fired when the code is accepted, i.e. when the loader starts. */
  onUnlock?: () => void;
  /** Fired when the loader finishes and the gift is actually on screen. */
  onOpen?: () => void;
}

export function PasscodeGate({
  children,
  prompt,
  hint,
  startOpen = false,
  onUnlock,
  onOpen,
}: PasscodeGateProps) {
  const [phase, setPhase] = useState<Phase>(startOpen ? 'open' : 'locked');
  /**
   * Chosen on unlock rather than at mount: picking during render would put a
   * Math.random() result into the server HTML that the client then disagrees
   * with. By the time this is read, we are unambiguously on the client.
   */
  const [message, setMessage] = useState(UNLOCK_MESSAGES[0]);

  const handleCode = useCallback(() => {
    // Where a real code check will go. Today every code is the right code.
    setMessage(
      UNLOCK_MESSAGES[Math.floor(Math.random() * UNLOCK_MESSAGES.length)],
    );
    setPhase('unlocking');
    onUnlock?.();
  }, [onUnlock]);

  const handleLoaded = useCallback(() => {
    setPhase('open');
    onOpen?.();
  }, [onOpen]);

  if (phase === 'open') return <>{children}</>;

  return (
    <>
      <PasscodeScreen prompt={prompt} hint={hint} onComplete={handleCode} />
      {phase === 'unlocking' ? (
        <GiftLoading
          title={UNLOCK_TITLE}
          message={message}
          durationMs={UNLOCK_DURATION_MS}
          onComplete={handleLoaded}
        />
      ) : null}
    </>
  );
}
