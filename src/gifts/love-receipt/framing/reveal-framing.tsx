'use client';

/**
 * PREVIEW-ONLY — the reveal-framing state machine.
 *
 * frame → print → settled → replay
 *
 * This is the ONLY file that knows a variant exists. Both variants hand the same
 * <PrintStage> the same props, so everything after the tap is one code path with
 * nothing to keep in sync.
 *
 * Self-contained on purpose: it shares no state with the tear scene
 * (reveal-scene.tsx) or the order-confirmation prototype (order-reveal.tsx), so
 * framings can be compared against the tear separately.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { NotifCard } from './notif-card';
import { WarmCard } from './warm-card';
import { MochiPlaceholder } from './mochi-placeholder';
import { PrintStage, type PrintResolution } from './print-stage';
import { FIELD_THEMES } from './framing-theme';
import type { ReceiptPayload } from '../lines';

export type FramingVariant = 'print' | 'notif' | 'warm';
export type Phase = 'frame' | 'print' | 'settled' | 'replay';

export interface RevealFramingProps {
  variant: FramingVariant;
  payload: ReceiptPayload;
  senderName: string;
  /** ?skip=1 — bypass the frame beat and land straight on the print. */
  skipFrame?: boolean;
  /** Bump to replay. Changing this drives the machine through `replay`. */
  replayToken?: number;
  onPrintResolved?: (info: PrintResolution) => void;
  onPhaseChange?: (phase: Phase) => void;
}

export function RevealFraming({
  variant,
  payload,
  senderName,
  skipFrame = false,
  replayToken = 0,
  onPrintResolved,
  onPhaseChange,
}: RevealFramingProps) {
  // Variant A has no frame beat — the print IS the beat. B and C each open on
  // their own frame component; both exit through the same onAdvance seam.
  const initialPhase: Phase =
    variant !== 'print' && !skipFrame ? 'frame' : 'print';

  const theme = FIELD_THEMES[variant];

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  // `replay` is a real state, not a synonym for remount: it exists so the clip
  // never animates backwards. Entering it remounts PrintStage by key, which
  // snaps the clip to its closed position with transitions off, and only then
  // re-enters the initial phase.
  useEffect(() => {
    if (phase !== 'replay') return;
    setRunId((n) => n + 1);
    setPhase(initialPhase);
  }, [phase, initialPhase]);

  // Skip the mount run so a remount for some other reason (variant/length
  // change) doesn't read a stale token as "replay me".
  const seenReplayToken = useRef(false);
  useEffect(() => {
    if (!seenReplayToken.current) {
      seenReplayToken.current = true;
      return;
    }
    setPhase('replay');
  }, [replayToken]);

  const handleSettled = useCallback(() => {
    setPhase((p) => (p === 'print' ? 'settled' : p));
  }, []);

  return (
    <div style={{ ...styles.field, background: theme.field }}>
      {/* ── the divergence: exactly one branch ───────────────────────────── */}
      {phase === 'frame' ? (
        variant === 'warm' ? (
          <WarmCard onAdvance={() => setPhase('print')} />
        ) : (
          <NotifCard onAdvance={() => setPhase('print')} />
        )
      ) : null}

      {phase === 'print' || phase === 'settled' ? (
        <PrintStage
          key={runId}
          payload={payload}
          senderName={senderName}
          theme={theme}
          // beat 3: the character comes back for the reply. Only variant C
          // supplies it; PrintStage just renders the slot.
          ctaAdornment={
            variant === 'warm' ? (
              <MochiPlaceholder pose="idle" size={44} />
            ) : null
          }
          onSettled={handleSettled}
          onPrintResolved={onPrintResolved}
        />
      ) : null}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  field: {
    minHeight: '100vh',
    // The field belongs to the variant (see framing-theme.ts): near-black for
    // the cold framings, blush for the warm one. No chrome of any kind — the
    // frame's job is "something arrived for you", not "you are on a website".
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px 14px 132px',
  },
};
