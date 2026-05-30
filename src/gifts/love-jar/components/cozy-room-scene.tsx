'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useJarState } from '../hooks/use-jar-state';
import { useShakeDetector } from '../hooks/use-shake-detector';
import { HeartRelease } from './heart-release';
import { MessageCard } from './message-card';

const BG_VIDEO_PLAYBACK_RATE = 0.4;

/** Heavy background loop — preloaded by the Win98 shell before the scene mounts. */
export const COZY_ROOM_VIDEO_SRC = '/videos/cozy-room-loop-clean.mp4';

interface CozyRoomSceneProps {
  messages: string[];
  onShake: () => void;
}

export function CozyRoomScene({ messages, onShake }: CozyRoomSceneProps) {
  const { phase, currentMessage, triggerShake, dismissCard } =
    useJarState(messages);

  const handleShake = useCallback(() => {
    triggerShake();
    onShake();
  }, [triggerShake, onShake]);

  const { requestPermission, needsPermission } = useShakeDetector(handleShake);

  useEffect(() => {
    if (!needsPermission) return;
    const handler = () => {
      requestPermission();
      window.removeEventListener('touchstart', handler);
    };
    window.addEventListener('touchstart', handler, { once: true });
    return () => window.removeEventListener('touchstart', handler);
  }, [needsPermission, requestPermission]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) vid.playbackRate = BG_VIDEO_PLAYBACK_RATE;
  }, []);

  const isShaking = phase === 'shaking' || phase === 'releasing';
  const jarAnimation = isShaking
    ? 'jar-shake 600ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both'
    : 'jar-idle-wobble 4s ease-in-out infinite';

  const handleHeartComplete = useCallback(() => {
    // Phase transition handled by useJarState timers
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      // Lilac fill so the letterbox bars around the contained video blend
      // with the Win98 desktop and read as intentional, not as a gap.
      style={{ backgroundColor: 'var(--win-bg)' }}
    >
      {/* Background — video with static image fallback. object-contain shows
          the full composition (no cropping), letterboxed onto --win-bg. */}
      {videoFailed ? (
        <img
          src="/images/love-jar-room.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <video
          ref={videoRef}
          src={COZY_ROOM_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
          onError={() => setVideoFailed(true)}
        />
      )}

      {/* Vignette overlay — softens edges to hide loop seam */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 80px 30px rgba(0, 0, 0, 0.35)',
        }}
      />

      {/* Soft glow behind the jar */}
      <div
        className="pointer-events-none absolute left-1/2 z-[8] -translate-x-1/2"
        style={{
          bottom: '18%',
          width: '79vw',
          maxWidth: 440,
          aspectRatio: '1',
          background:
            'radial-gradient(circle, rgba(255, 180, 180, 0.3) 0%, transparent 60%)',
          animation: 'jar-glow-pulse 4s ease-in-out infinite',
        }}
      />

      {/* Jar — front of desk, centered on placemat */}
      <img
        src="/images/love-jar.png"
        alt="Love jar full of hearts"
        className="absolute left-1/2 z-10 w-[52vw] max-w-[293px] -translate-x-1/2 select-none sm:w-[32vw] sm:max-w-[350px]"
        style={{
          bottom: '18%',
          transformOrigin: 'bottom center',
          animation: jarAnimation,
          imageRendering: 'pixelated',
        }}
        draggable={false}
      />

      {/* Heart release animation */}
      <HeartRelease
        active={phase === 'releasing'}
        onComplete={handleHeartComplete}
      />

      {/* Message card */}
      <MessageCard
        message={currentMessage ?? ''}
        visible={phase === 'showing-card'}
        onDismiss={dismissCard}
      />

      {/* Content area holds only the scene/video — no overlaid in-content text.
          Mobile interaction is the DeviceMotion shake (see useShakeDetector).
          TODO: desktop has no motion sensor and the visible SHAKE button was
          removed, so the jar is currently uninteractable on desktop. Decide on
          a desktop fallback later (e.g. tap-on-jar onClick affordance). */}
    </div>
  );
}
