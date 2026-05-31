'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useJarState } from '../hooks/use-jar-state';
import { useShakeDetector } from '../hooks/use-shake-detector';
import { HeartRelease } from '../components/heart-release';
import { AmbientBackground } from './ambient-background';
import { CraftObjects } from './craft-objects';
import { JarIllustrated } from './jar-illustrated';
import { ShakePrompt } from './shake-prompt';
import { HeartNote } from './heart-note';
import { MemoryShelf } from './memory-shelf';
import { EmptyJarState } from './empty-jar-state';
import { ArrivalPopup } from './arrival-popup';

/**
 * CraftTableScene — the whole Language B interior (design-system §4.3).
 *
 * Composition (z-order): cream room → wooden surface → ambient atmosphere →
 * craft objects + Mochis → the jar → prompt/heart-release/notes → memory shelf
 * → empty state. The arrival popup is the single soft opening beat (Path D #1)
 * and the jar is tappable as the desktop affordance (fixes the old desktop
 * dead-interaction TODO). No video, no raster hero — everything paints on the
 * first frame, so there is nothing to preload and no black flash.
 */

interface CraftTableSceneProps {
  messages: string[];
  recipientName: string;
  senderName?: string;
  onShake: () => void;
  onClimax: () => void;
}

export function CraftTableScene({
  messages,
  recipientName,
  senderName,
  onShake,
  onClimax,
}: CraftTableSceneProps) {
  const [opened, setOpened] = useState(false);
  const { phase, remaining, currentMessage, triggerShake, dismissCard } =
    useJarState(messages);

  const handleShake = useCallback(() => {
    if (!opened) return;
    triggerShake();
    onShake();
  }, [opened, triggerShake, onShake]);

  const { requestPermission, needsPermission } = useShakeDetector(handleShake);

  // Wire device-motion permission to the first touch (mobile).
  useEffect(() => {
    if (!opened || !needsPermission) return;
    const handler = () => {
      requestPermission();
      window.removeEventListener('touchstart', handler);
    };
    window.addEventListener('touchstart', handler, { once: true });
    return () => window.removeEventListener('touchstart', handler);
  }, [opened, needsPermission, requestPermission]);

  // Fire the gift-frame climax once, when the jar runs out of notes.
  const climaxedRef = useRef(false);
  useEffect(() => {
    if (phase === 'empty' && !climaxedRef.current) {
      climaxedRef.current = true;
      onClimax();
    }
  }, [phase, onClimax]);

  const total = messages.length;
  const noteIndex = total - remaining; // 0-based "nth note taken out"
  const isShaking = phase === 'shaking' || phase === 'releasing';

  return (
    <div
      className="fixed inset-0 z-[55] overflow-hidden"
      style={{ backgroundColor: '#f5f0eb' }}
    >
      {/* Layer 1–3 — room, window light, atmosphere */}
      <AmbientBackground />

      {/* Layer 4 — wooden surface (bottom 35%) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: '35%',
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(212, 184, 150, 0.15) 30%, rgba(193, 154, 107, 0.4) 100%)',
          boxShadow: 'inset 0 8px 12px -8px rgba(139, 115, 85, 0.2)',
        }}
      >
        {/* horizontal wood grain */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='w'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04 0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23w)'/%3E%3C/svg%3E\")",
            opacity: 0.08,
            mixBlendMode: 'multiply',
          }}
        />
      </div>

      {/* Layer 5 — surrounding craft objects + Mochis */}
      <CraftObjects />

      {/* Layer 6 — the jar, sitting on the surface (~50vw mobile, ~30vw desktop) */}
      <div
        className="absolute left-1/2 w-[min(50vw,230px)] -translate-x-1/2 sm:w-[min(30vw,280px)]"
        style={{ bottom: '26%' }}
      >
        <JarIllustrated
          recipientName={recipientName}
          hearts={remaining}
          shaking={isShaking}
          onTap={
            opened && phase === 'idle' && remaining > 0
              ? handleShake
              : undefined
          }
        />
      </div>

      {/* Layer 7 — prompt + rising heart */}
      <ShakePrompt
        remaining={remaining}
        total={total}
        visible={opened && phase === 'idle' && remaining > 0}
      />
      <HeartRelease active={phase === 'releasing'} onComplete={() => {}} />

      {/* Layer 8 — memory shelf */}
      {opened && <MemoryShelf kept={total - remaining} />}

      {/* Layer 9 — the opened note */}
      <HeartNote
        message={currentMessage ?? ''}
        visible={phase === 'showing-card'}
        noteIndex={noteIndex}
        onReturn={dismissCard}
      />

      {/* Empty state + reaction ribbon */}
      {opened && phase === 'empty' && <EmptyJarState />}

      {/* Single soft opening beat */}
      {!opened && (
        <ArrivalPopup
          recipientName={recipientName}
          senderName={senderName}
          onOpen={() => setOpened(true)}
        />
      )}
    </div>
  );
}
