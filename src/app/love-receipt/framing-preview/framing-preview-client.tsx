'use client';

/**
 * PREVIEW-ONLY shell: dev bar + URL sync.
 *
 * The scene itself (RevealFraming) knows nothing about this file — it takes
 * plain props, so it could be lifted to the real receiver later without the
 * instrumentation coming along.
 *
 * Initial variant/length/skip arrive as props read on the SERVER, so the first
 * paint already carries the right field colour. The dev bar then owns them as
 * client state and mirrors changes into the URL with replaceState, so switching
 * variants never costs a server round-trip.
 */

import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  RevealFraming,
  type FramingVariant,
  type Phase,
} from '@/gifts/love-receipt/framing/reveal-framing';
import type { PrintResolution } from '@/gifts/love-receipt/framing/print-stage';
import {
  buildFramingMock,
  SENDER_NAME,
  type MockLength,
} from '@/gifts/love-receipt/framing/framing-mock';

export interface FramingPreviewClientProps {
  initialVariant: FramingVariant;
  initialLength: MockLength;
  initialSkip: boolean;
}

export function FramingPreviewClient({
  initialVariant,
  initialLength,
  initialSkip,
}: FramingPreviewClientProps) {
  const [variant, setVariant] = useState<FramingVariant>(initialVariant);
  const [length, setLength] = useState<MockLength>(initialLength);
  const [skip, setSkip] = useState(initialSkip);
  const [sceneKey, setSceneKey] = useState(0);
  const [replayToken, setReplayToken] = useState(0);
  const [phase, setPhase] = useState<Phase>('print');
  const [resolved, setResolved] = useState<PrintResolution | null>(null);
  const [barOpen, setBarOpen] = useState(true);

  // Keep the URL shareable without a server round-trip.
  const syncUrl = useCallback(
    (next: { variant: FramingVariant; length: MockLength; skip: boolean }) => {
      const q = new URLSearchParams();
      if (next.variant !== 'print') q.set('frame', next.variant);
      if (next.length !== 'short') q.set('len', next.length);
      if (next.skip) q.set('skip', '1');
      const qs = q.toString();
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${qs ? `?${qs}` : ''}`,
      );
    },
    [],
  );

  const restart = useCallback(
    (
      next: Partial<{
        variant: FramingVariant;
        length: MockLength;
        skip: boolean;
      }>,
    ) => {
      const merged = {
        variant: next.variant ?? variant,
        length: next.length ?? length,
        skip: next.skip ?? skip,
      };
      setVariant(merged.variant);
      setLength(merged.length);
      setSkip(merged.skip);
      setResolved(null);
      setSceneKey((n) => n + 1);
      syncUrl(merged);
    },
    [variant, length, skip, syncUrl],
  );

  const payload = useMemo(() => buildFramingMock(length), [length]);

  return (
    <>
      <RevealFraming
        key={`${variant}-${length}-${skip ? 'skip' : 'full'}-${sceneKey}`}
        variant={variant}
        payload={payload}
        senderName={SENDER_NAME}
        skipFrame={skip}
        replayToken={replayToken}
        onPrintResolved={setResolved}
        onPhaseChange={setPhase}
      />

      {/* dev bar — preview only, never part of the scene */}
      {barOpen ? (
        <div style={styles.bar}>
          <span style={styles.label}>frame</span>
          {(['print', 'notif', 'warm'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => restart({ variant: opt })}
              style={chip(variant === opt, '#57e08a')}
            >
              {opt}
            </button>
          ))}

          <span style={styles.sep}>|</span>
          <span style={styles.label}>len</span>
          {(['short', 'long'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => restart({ length: opt })}
              style={chip(length === opt, '#ff69b4')}
            >
              {opt === 'short' ? 'short · 4' : 'long · 9'}
            </button>
          ))}

          <span style={styles.sep}>|</span>
          <button
            type="button"
            onClick={() => restart({ skip: !skip })}
            style={chip(skip, '#f0c674')}
          >
            skip {skip ? 'on' : 'off'}
          </button>

          <button
            type="button"
            onClick={() => setReplayToken((n) => n + 1)}
            style={chip(false, '#9b8ab5')}
          >
            replay
          </button>

          <span style={styles.sep}>|</span>
          <span style={styles.readout}>
            {resolved
              ? `${resolved.heightPx}px @ ${resolved.pxPerSec}px/s → ${resolved.durationMs}ms`
              : '—'}
          </span>
          <span style={styles.readout}>· {phase}</span>

          <button
            type="button"
            onClick={() => setBarOpen(false)}
            style={chip(false, '#6b6480')}
          >
            hide
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setBarOpen(true)}
          style={styles.reopen}
        >
          dev
        </button>
      )}
    </>
  );
}

function chip(active: boolean, accent: string): CSSProperties {
  return {
    font: 'inherit',
    padding: '4px 9px',
    borderRadius: 4,
    cursor: 'pointer',
    border: `1px solid ${accent}`,
    background: active ? accent : 'transparent',
    color: active ? '#14121a' : '#fff',
  };
}

const styles: Record<string, CSSProperties> = {
  bar: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 10px',
    background: 'rgba(30, 22, 44, 0.94)',
    borderTop: '1px solid rgba(255,255,255,0.14)',
    color: '#fff',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 11,
  },
  label: { opacity: 0.6 },
  sep: { opacity: 0.3 },
  readout: { opacity: 0.72 },
  reopen: {
    position: 'fixed',
    right: 10,
    bottom: 10,
    zIndex: 50,
    padding: '6px 11px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.28)',
    background: 'rgba(30, 22, 44, 0.9)',
    color: '#fff',
    fontFamily: 'ui-monospace, monospace',
    fontSize: 11,
    cursor: 'pointer',
  },
};
