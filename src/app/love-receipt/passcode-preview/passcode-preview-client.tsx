'use client';

/**
 * PREVIEW-ONLY shell around <PasscodeScreen>.
 *
 * Its whole job is to prove the keypad works without wiring it to anything: it
 * catches the completed code and echoes it back on screen. That readout is a
 * PREVIEW AFFORDANCE and is not part of the screen — it does not ship with it.
 *
 * TWO RULES ABOUT THE READOUT, both learned the hard way on a phone:
 *   1. It is GATED behind `debug`. It is developer text, not product copy, so
 *      it is off unless someone asked for it (see page.tsx for the flag).
 *   2. It is IN NORMAL FLOW, directly after the screen — never a fixed overlay.
 *      As a bottom-pinned overlay it sat on top of the keypad the moment the
 *      viewport got short, which is exactly when you need the keypad most.
 *      Flow layout cannot overlap by construction.
 */

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { PasscodeScreen } from '@/gifts/love-receipt/passcode/passcode-screen';

export function PasscodePreviewClient({
  prompt,
  hint,
  debug = false,
}: {
  prompt?: string;
  hint?: string;
  /** When false, nothing below the screen renders and no code is retained. */
  debug?: boolean;
}) {
  const [last, setLast] = useState<string | null>(null);

  return (
    <>
      <PasscodeScreen
        prompt={prompt}
        hint={hint}
        // Not just hidden — with the flag off the code is never even held in
        // state, so there is nothing to leak into the DOM.
        onComplete={debug ? setLast : undefined}
      />
      {debug && last ? (
        <p className="font-pixel" style={styles.readout}>
          entered: {last} — (preview only, nothing is validated)
        </p>
      ) : null}
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  readout: {
    // Static, below everything the screen draws. The padding (not a margin)
    // carries the safe-area inset so the text clears a home indicator when
    // this is the last thing on the page.
    padding: '14px 18px calc(18px + env(safe-area-inset-bottom, 0px))',
    textAlign: 'center',
    fontSize: 'clamp(15px, 4.6vw, 18px)',
    lineHeight: 1.3,
    letterSpacing: '0.03em',
    color: 'rgba(26, 10, 46, 0.7)',
    textShadow: '1px 1px 0 rgba(255, 255, 255, 0.5)',
    background: 'var(--win-bg)',
    margin: 0,
  },
};
