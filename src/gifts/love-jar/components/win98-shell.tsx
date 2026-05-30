'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { playClick } from '@/components/retro-sounds';
import { COZY_ROOM_VIDEO_SRC } from './cozy-room-scene';

/**
 * Win98/Y2K shell for the Love Jar gift.
 *
 * Flow (state machine):
 *   landing -> popup -> (OK) -> (videoReady ? loaded : waiting) -> loaded
 *
 * The popup is cute thematic content AND a cover for preloading the heavy
 * cozy-room background video. We start preloading immediately on mount so the
 * scene plays instantly the moment it is revealed.
 */

type Phase = 'landing' | 'popup' | 'waiting' | 'loaded';

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

interface PopupCopy {
  title: string;
  icon: string;
  body: string[];
}

const POPUP_VARIANTS: PopupCopy[] = [
  {
    title: '💌 incoming.msg',
    icon: '💌',
    body: [
      'You have (1) unread message from',
      "someone who's been thinking about you.",
      'Open now? ♡',
    ],
  },
  {
    title: '⚠ system_alert.exe',
    icon: '💗',
    body: [
      'WARNING: Unread feelings detected.',
      'This file may cause smiling.',
      'Proceed at your own risk.',
    ],
  },
  {
    title: '♡ love.dll loaded',
    icon: '💝',
    body: [
      'love-jar.exe is ready to open.',
      'This file was made just for you.',
      'Press OK to unwrap. ✨',
    ],
  },
  {
    title: '📡 connection.established',
    icon: '📡',
    body: [
      'Receiving incoming gift...',
      'Sender: ♡♡♡♡♡♡♡♡',
      'Click OK to decrypt.',
    ],
  },
];

interface Win98ShellProps {
  messageCount: number;
  children: React.ReactNode;
}

export function Win98Shell({ messageCount, children }: Win98ShellProps) {
  const [phase, setPhase] = useState<Phase>('landing');
  const [popupClosing, setPopupClosing] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fromLabel, setFromLabel] = useState('someone special');
  const [confirmClose, setConfirmClose] = useState(false);

  const videoReadyRef = useRef(false);
  const popupCopy = useRef(
    POPUP_VARIANTS[Math.floor(Math.random() * POPUP_VARIANTS.length)],
  );

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
      videoReadyRef.current = true;
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

  // ── Trigger the popup shortly after landing ──
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase((p) => (p === 'landing' ? 'popup' : p));
    }, 300);
    return () => clearTimeout(t);
  }, []);

  // ── While waiting on a slow video, reveal once ready (or after a cap) ──
  useEffect(() => {
    if (phase !== 'waiting') return;
    if (videoReady) {
      setPhase('loaded');
      return;
    }
    const cap = setTimeout(() => setPhase('loaded'), MAX_WAIT_MS);
    return () => clearTimeout(cap);
  }, [phase, videoReady]);

  const dismissPopup = useCallback(() => {
    playClick();
    setPopupClosing(true);
    // Win98 dismissals are near-instant.
    setTimeout(() => {
      setPhase(videoReadyRef.current ? 'loaded' : 'waiting');
    }, 100);
  }, []);

  const titleText = `love-jar.exe — from ${fromLabel}`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center sm:p-6"
      style={{
        background: 'linear-gradient(135deg, #C8A8E0 0%, #B89AD8 100%)',
        cursor: PIXEL_CURSOR,
      }}
    >
      {/* ── Persistent Win98 window chrome ── */}
      <div
        className="win98-window flex flex-col"
        style={{
          width: 'min(96vw, 430px)',
          height: 'min(96dvh, 860px)',
          padding: 3,
          boxShadow: '2px 2px 0 0 #000',
        }}
      >
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

        {/* Content area — the gift, or the loading bar while it preloads */}
        <div
          className="relative min-h-0 flex-1 overflow-hidden"
          style={{ ...BEVEL_IN, background: '#1a0f24' }}
        >
          {phase === 'loaded' ? (
            children
          ) : (
            <LoadingScreen progress={progress} indeterminate={progress <= 0} />
          )}
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
          title={popupCopy.current.title}
          closing={popupClosing}
          onClose={dismissPopup}
        >
          <div className="flex items-start gap-3">
            <span
              className="shrink-0 select-none text-[32px] leading-none"
              aria-hidden
            >
              {popupCopy.current.icon}
            </span>
            <div className="font-pixel text-[15px] leading-snug text-ink">
              {popupCopy.current.body.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              className="win98-btn text-[15px]"
              style={{ minWidth: 80 }}
              onClick={dismissPopup}
            >
              OK
            </button>
          </div>
        </ModalDialog>
      )}

      {/* ── Cheeky "are you sure?" close confirm ── */}
      {confirmClose && (
        <ModalDialog
          titleColors={['#FF6BCB', '#A020F0']}
          title="✕ confirm.exe"
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
              <p>Are you sure?</p>
              <p>You can&apos;t unsee love ♡</p>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button
              className="win98-btn text-[15px]"
              style={{ minWidth: 72 }}
              onClick={() => {
                playClick();
                setConfirmClose(false);
              }}
            >
              Yes
            </button>
            <button
              className="win98-btn text-[15px]"
              style={{ minWidth: 72 }}
              onClick={() => {
                playClick();
                setConfirmClose(false);
              }}
            >
              Cancel
            </button>
          </div>
        </ModalDialog>
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
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
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
