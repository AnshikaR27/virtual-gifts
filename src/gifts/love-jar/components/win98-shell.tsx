'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { playClick } from '@/components/retro-sounds';
import { COZY_ROOM_VIDEO_SRC } from './cozy-room-scene';

/**
 * Win98/Y2K shell for the Love Jar gift.
 *
 * Flow (state machine):
 *   landing (loading bar) -> popup -> (OK) -> loaded
 *
 * We preload the heavy cozy-room background video on mount and hold on the
 * loading bar until it is fully buffered (or a hard cap is hit). Only then does
 * the popup appear — so pressing OK reveals the scene instantly, with no second
 * loading hiccup behind the popup.
 */

type Phase = 'landing' | 'popup' | 'loaded';

// Pixel arrow cursor (task spec) — applied to the desktop only.
const PIXEL_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath d='M0 0 L0 12 L4 8 L7 14 L9 13 L6 8 L11 8 Z' fill='black' stroke='white'/%3E%3C/svg%3E\") 0 0, auto";

// Max time we'll ever sit on the loading bar before giving up and revealing the
// gift anyway — guards against browsers that never fire canplaythrough.
const MAX_WAIT_MS = 6000;

// 2px checkerboard dither layered over a 2-stop gradient → authentic, banded
// Win98 title bar instead of a smooth modern gradient.
function ditheredTitle(c1: string, c2: string): CSSProperties {
  const dither =
    'linear-gradient(45deg, rgba(255,255,255,0.16) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.16) 75%)';
  return {
    backgroundImage: `${dither}, ${dither}, linear-gradient(90deg, ${c1}, ${c2})`,
    backgroundSize: '2px 2px, 2px 2px, 100% 100%',
    backgroundPosition: '0 0, 1px 1px, 0 0',
  };
}

const BEVEL_OUT: CSSProperties = {
  border: '2px solid',
  borderColor:
    'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
};

const BEVEL_IN: CSSProperties = {
  border: '2px solid',
  borderColor:
    'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
};

// One buttery voice — no rotation. Lowercase, soft ellipses, ♡ (never ❤️),
// zero tech vocab. Keep any future copy in this register (soft / gentle / slow).
const POPUP_COPY = {
  title: '💌 a soft thing for you',
  icon: '💌',
  body: [
    'psst...',
    'someone made you something gentle.',
    'take your time opening it ♡',
  ],
} as const;

// WhatsApp-style reaction emojis (left → right). Native system glyphs on
// purpose — the contrast against the Win98 chrome IS the design. Don't swap
// these for pixel-art.
const REACTIONS = ['🥹', '❤️', '✨', '🌸', '🫶', '😭'] as const;

interface Win98ShellProps {
  messageCount: number;
  children: React.ReactNode;
  /** Character (e.g. Mochi) perched on top of the window, ~22% from the left. */
  mochiLeft?: React.ReactNode;
  /** Character perched on top of the window, ~78% from the left. */
  mochiRight?: React.ReactNode;
}

export function Win98Shell({
  messageCount,
  children,
  mochiLeft,
  mochiRight,
}: Win98ShellProps) {
  const [phase, setPhase] = useState<Phase>('landing');
  const [popupClosing, setPopupClosing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fromLabel, setFromLabel] = useState('someone special');
  const [confirmClose, setConfirmClose] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  // The emoji currently floating up off the popup (poof animation). Cleared
  // once the animation finishes.
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null);

  // Resolve the ?from= URL param client-side (avoids a Suspense boundary).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search)
      .get('from')
      ?.trim();
    if (param) setFromLabel(param);
  }, []);

  // ── Preload the heavy background video immediately on mount ──
  useEffect(() => {
    // Parallel browser hint via <link rel="preload">.
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = COZY_ROOM_VIDEO_SRC;
    document.head.appendChild(link);

    const v = document.createElement('video');
    v.src = COZY_ROOM_VIDEO_SRC;
    v.preload = 'auto';
    v.muted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');

    const markReady = () => {
      setVideoReady(true);
      setProgress(100);
    };
    const updateProgress = () => {
      try {
        if (v.duration && v.buffered.length) {
          const end = v.buffered.end(v.buffered.length - 1);
          setProgress(Math.min(99, Math.round((end / v.duration) * 100)));
        }
      } catch {
        /* buffered can throw if not ready yet */
      }
    };

    v.addEventListener('canplaythrough', markReady);
    v.addEventListener('progress', updateProgress);
    v.addEventListener('loadeddata', updateProgress);
    v.addEventListener('canplay', updateProgress);
    v.load();

    return () => {
      v.removeEventListener('canplaythrough', markReady);
      v.removeEventListener('progress', updateProgress);
      v.removeEventListener('loadeddata', updateProgress);
      v.removeEventListener('canplay', updateProgress);
      v.removeAttribute('src');
      v.load();
      link.remove();
    };
  }, []);

  // ── Hold on the loading bar until the scene is fully preloaded, then show
  //    the popup. A hard cap guarantees we never trap the user on the bar if a
  //    browser never fires canplaythrough. ──
  useEffect(() => {
    if (phase !== 'landing') return;
    if (videoReady) {
      // Small beat so the bar doesn't flash by on fast / cached loads.
      const t = setTimeout(() => setPhase('popup'), 400);
      return () => clearTimeout(t);
    }
    const cap = setTimeout(() => setPhase('popup'), MAX_WAIT_MS);
    return () => clearTimeout(cap);
  }, [phase, videoReady]);

  // Play the popup-dismiss keyframe, then reveal the (already preloaded) scene.
  const revealScene = useCallback(() => {
    setPopupClosing(true);
    setTimeout(() => setPhase('loaded'), 100);
  }, []);

  // [✕] / plain dismiss — no reaction recorded (selectedReaction stays null).
  const dismissPopup = useCallback(() => {
    playClick();
    revealScene();
  }, [revealScene]);

  // Tap an emoji: record it, float it up off the popup, then dismiss.
  const handleReaction = useCallback(
    (emoji: string) => {
      playClick();
      setSelectedReaction(emoji);
      // TODO: send reaction to sender via backend (reaction notification flow)
      setFloatingReaction(emoji);
      // Popup dismisses ~200ms after the tap; the emoji keeps floating (~600ms)
      // at the desktop layer even after the popup unmounts.
      setTimeout(() => revealScene(), 200);
      setTimeout(() => setFloatingReaction(null), 700);
    },
    [revealScene],
  );

  const titleText = `love-jar.exe — from ${fromLabel}`;

  return (
    <div
      className={`win98-desktop fixed inset-0 z-[60] flex items-center justify-center sm:p-6${
        mochiLeft || mochiRight ? ' has-mochi' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #C8A8E0 0%, #B89AD8 100%)',
        cursor: PIXEL_CURSOR,
      }}
    >
      {/* ── Persistent Win98 window chrome ── */}
      <div
        className="win98-window flex flex-col"
        style={{
          position: 'relative',
          width: 'min(100vw, 480px)',
          height: 'min(86dvh, 760px)',
          padding: 3,
        }}
      >
        {/* Mochis perch above the title bar (~22% / ~78% from the left), bottoms
            overlapping into the title bar. data-blowing-kisses opts each one
            into the CSS kiss loop; the .mochi-kiss heart floats up and fades. */}
        {mochiLeft && (
          <div
            className="mochi-perch left"
            data-blowing-kisses="true"
            aria-hidden
          >
            {mochiLeft}
            <span className="mochi-kiss">♥</span>
          </div>
        )}
        {mochiRight && (
          <div
            className="mochi-perch right"
            data-blowing-kisses="true"
            aria-hidden
          >
            {mochiRight}
            <span className="mochi-kiss">♥</span>
          </div>
        )}
        {/* Title bar (yellow → orange dithered) */}
        <div
          className="flex shrink-0 items-center justify-between"
          style={{ ...ditheredTitle('#F4D03F', '#E67E22'), padding: '3px 4px' }}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="text-[14px] leading-none" aria-hidden>
              💝
            </span>
            <span className="truncate font-pixel text-[15px] font-bold tracking-wide text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.35)]">
              {titleText}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-[3px]">
            <TitleButton label="Minimize" symbol="▽" onClick={playClick} />
            <TitleButton label="Maximize" symbol="☐" onClick={playClick} />
            <TitleButton
              label="Close"
              symbol="✕"
              onClick={() => {
                playClick();
                setConfirmClose(true);
              }}
            />
          </span>
        </div>

        {/* Menu bar — decorative, hidden on mobile */}
        <div
          className="hidden shrink-0 items-center gap-4 border-b border-[var(--win-chrome-dark)] bg-[var(--win-chrome)] px-2 py-[2px] sm:flex"
          style={{ userSelect: 'none' }}
        >
          {['File', 'Edit', 'View', 'Help'].map((m) => (
            <span key={m} className="font-pixel text-[15px] text-ink">
              {m}
            </span>
          ))}
        </div>

        {/* Content area — the gift, or the loading bar while it preloads.
            Soft lilac fill (matches the desktop) so the area never paints jet
            black behind the popup before the cozy-room video arrives. The
            loading screen carries its own dark backdrop during `landing`; once
            we're on the popup the content sits empty and lilac. */}
        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{ ...BEVEL_IN, background: 'var(--win-bg)' }}
        >
          {phase === 'loaded' ? (
            children
          ) : phase === 'landing' ? (
            <LoadingScreen progress={progress} indeterminate={progress <= 0} />
          ) : null}
        </div>

        {/* Status bar */}
        <div
          className="flex shrink-0 items-center justify-between gap-2 bg-[var(--win-chrome)] px-1.5 py-[2px]"
          style={{ userSelect: 'none' }}
        >
          <span
            className="truncate font-pixel text-[13px] text-ink/80"
            style={BEVEL_IN as CSSProperties}
          >
            <span className="px-1">
              {phase === 'loaded' ? 'Ready. ♡' : 'Loading...'}
            </span>
          </span>
          <span className="hidden truncate font-pixel text-[13px] text-ink/70 sm:inline">
            jar: {messageCount} reasons
          </span>
          <span className="shrink-0 font-pixel text-[13px] text-ink/70">
            sent with love
          </span>
        </div>
      </div>

      {/* ── The cute popup ── */}
      {phase === 'popup' && (
        <ModalDialog
          titleColors={['#FF6BCB', '#A020F0']}
          title={POPUP_COPY.title}
          closing={popupClosing}
          onClose={dismissPopup}
        >
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 select-none text-[32px] leading-none"
              aria-hidden
            >
              {POPUP_COPY.icon}
            </span>
            <div className="font-pixel text-[15px] leading-snug text-ink">
              {POPUP_COPY.body.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {/* WhatsApp-style reaction picker — chunky Win98-beveled bar wrapping
              soft circular emoji pills (hard frame, soft inside). */}
          <div
            className="reaction-bar mt-4"
            style={{
              ...BEVEL_OUT,
              background: 'var(--win-chrome)',
              boxShadow:
                'inset 1px 1px 0 rgba(255,255,255,0.55), inset -1px -1px 0 rgba(0,0,0,0.28)',
            }}
          >
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="reaction-emoji"
                aria-label={`react ${emoji}`}
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </ModalDialog>
      )}

      {/* ── Cheeky "are you sure?" close confirm ── */}
      {confirmClose && (
        <ModalDialog
          titleColors={['#FF6BCB', '#A020F0']}
          title="♡ wait..."
          closing={false}
          onClose={() => {
            playClick();
            setConfirmClose(false);
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 select-none text-[32px] leading-none"
              aria-hidden
            >
              💔
            </span>
            <div className="font-pixel text-[15px] leading-snug text-ink">
              <p>you can&apos;t unsee love.</p>
              <p>close anyway?</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {/* "close" = secondary; preserves the existing close behavior
                (just dismisses the confirm — no real navigation today). */}
            <button
              className="win98-btn text-[15px]"
              style={{ minWidth: 72 }}
              onClick={() => {
                playClick();
                setConfirmClose(false);
              }}
            >
              close
            </button>
            {/* "stay" = primary/recommended — we want recipients to stay. */}
            <button
              className="win98-btn-pink text-[15px]"
              style={{ minWidth: 72 }}
              onClick={() => {
                playClick();
                setConfirmClose(false);
              }}
            >
              stay
            </button>
          </div>
        </ModalDialog>
      )}

      {/* Floating reaction "poof" — the tapped emoji scales up and drifts off
          the popup, with a few offset ghost copies for a confetti feel. Lives
          at the desktop layer so it keeps animating after the popup unmounts. */}
      {floatingReaction && (
        <div className="reaction-float-layer" aria-hidden>
          <span className="reaction-float-main">{floatingReaction}</span>
          <span
            className="reaction-float-ghost"
            style={{ marginLeft: -28, animationDelay: '40ms' }}
          >
            {floatingReaction}
          </span>
          <span
            className="reaction-float-ghost"
            style={{ marginLeft: 30, animationDelay: '90ms' }}
          >
            {floatingReaction}
          </span>
          <span
            className="reaction-float-ghost"
            style={{ marginLeft: -6, animationDelay: '140ms' }}
          >
            {floatingReaction}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Title bar button (chunky beveled gray) ──
function TitleButton({
  label,
  symbol,
  onClick,
}: {
  label: string;
  symbol: string;
  onClick: () => void;
}) {
  return (
    <button
      className="win98-titlebar-btn"
      aria-label={label}
      onClick={onClick}
      style={{ width: 18, height: 16 }}
    >
      <span className="text-[10px] font-bold leading-none text-ink">
        {symbol}
      </span>
    </button>
  );
}

// ── Centered modal dialog (shared by popup + confirm) ──
function ModalDialog({
  title,
  titleColors,
  closing,
  onClose,
  children,
}: {
  title: string;
  titleColors: [string, string];
  closing: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      style={{ background: closing ? 'transparent' : 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="w-full max-w-[340px]"
        style={{
          animation: closing
            ? 'popup-dismiss 0.12s linear forwards'
            : 'popup-appear 0.18s linear forwards',
        }}
      >
        <div
          className="win98-window"
          style={{ padding: 3, boxShadow: '2px 2px 0 0 #000' }}
        >
          {/* Title bar (pink → magenta dithered) */}
          <div
            className="flex items-center justify-between"
            style={{
              ...ditheredTitle(titleColors[0], titleColors[1]),
              padding: '3px 4px',
            }}
          >
            <span className="truncate font-pixel text-[15px] font-bold tracking-wide text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.35)]">
              {title}
            </span>
            <button
              className="win98-titlebar-btn"
              aria-label="Close"
              onClick={onClose}
            >
              <span className="text-[10px] font-bold leading-none text-ink">
                ✕
              </span>
            </button>
          </div>
          {/* Body */}
          <div
            style={{
              background: '#ffffff',
              ...BEVEL_IN,
              padding: '16px',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Win98 loading screen with segmented progress bar ──
function LoadingScreen({
  progress,
  indeterminate,
}: {
  progress: number;
  indeterminate: boolean;
}) {
  // Classic Win98 progress = ~20 discrete blue blocks.
  const totalBlocks = 20;
  const filled = Math.round((progress / 100) * totalBlocks);
  const blocks = useMemo(
    () => Array.from({ length: totalBlocks }),
    [totalBlocks],
  );

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: '#1a0f24' }}
    >
      <p className="font-pixel text-[18px] tracking-wide text-white/90">
        Loading love.jar...
      </p>

      {/* Progress trough (inset bevel) */}
      <div
        className="flex w-full max-w-[260px] gap-[2px] bg-[#000000] p-[2px]"
        style={BEVEL_IN as CSSProperties}
      >
        {indeterminate ? (
          <div className="relative h-[16px] w-full overflow-hidden">
            <div
              className="absolute inset-y-0 w-1/3 bg-[#000080]"
              style={{ animation: 'win98-progress-marquee 1s linear infinite' }}
            />
          </div>
        ) : (
          blocks.map((_, i) => (
            <span
              key={i}
              className="h-[16px] flex-1"
              style={{ background: i < filled ? '#000080' : 'transparent' }}
            />
          ))
        )}
      </div>

      <p className="font-pixel text-[14px] text-white/60">
        {indeterminate ? 'connecting...' : `${progress}%`}
      </p>
    </div>
  );
}
