'use client';

import { useState, useEffect, useCallback } from 'react';
import { playClick } from '@/components/retro-sounds';

const POPUP_MESSAGES = [
  {
    title: '⚠️ WARNING',
    text: 'Your love life is running low on memory. Please delete some bad decisions.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Heart rate increasing... Are you sure you want to continue?',
  },
  {
    title: '⚠️ ERROR',
    text: 'Cannot find chill.exe. Would you like to catch feelings instead?',
  },
  {
    title: '📂 ALERT',
    text: 'ROMANCE.exe has stopped working. Reason: too many butterflies.',
  },
  {
    title: '⚠️ WARNING',
    text: 'You have 3 unread love letters. Would you like to panic?',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Feelings.zip is corrupted. Please see a therapist.',
  },
  {
    title: '📂 NOTICE',
    text: 'Your crush is typing... Just kidding. But what if?',
  },
  {
    title: '⚠️ ERROR',
    text: 'Attempt to forget them failed. Error code: STILL_IN_LOVE.',
  },
  {
    title: '⚠️ WARNING',
    text: 'Low storage. Too many screenshots of their texts.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Installing butterflies... This may take forever.',
  },
  {
    title: '📂 ALERT',
    text: 'Someone is thinking about you right now. Probably.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Cannot delete feelings. File is in use by your heart.',
  },
  { title: '⚠️ WARNING', text: 'Overthinking.exe is using 99% of your brain.' },
  {
    title: '⚠️ SYSTEM',
    text: 'Would you like to send love? This action cannot be undone.',
  },
  {
    title: '📂 NOTICE',
    text: 'New update available: Relationship 2.0. Tap to install.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Connection to reality lost. Reason: daydreaming about them.',
  },
  {
    title: '⚠️ WARNING',
    text: 'Your heart has been successfully hacked. By love.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Scanning for red flags... 0 found. Proceed with feelings.',
  },
  {
    title: '📂 ALERT',
    text: 'Backup complete. All memories with them safely stored.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Task failed: Moving on. Would you like to try again? [No] [Also No]',
  },
  {
    title: '⚠️ WARNING',
    text: 'Battery low. Recharge by hugging someone you love.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'This website contains extreme levels of cuteness. Proceed?',
  },
  {
    title: '📂 NOTICE',
    text: "Reminder: You are someone's favorite notification.",
  },
  {
    title: '⚠️ ERROR',
    text: 'Playing it cool failed. Reverting to being a simp.',
  },
  {
    title: '⚠️ WARNING',
    text: 'Your ex viewed your story. Do NOT reply. Repeat: do NOT.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Compressing feelings... Error: feelings too big to compress.',
  },
  {
    title: '📂 ALERT',
    text: 'Love.zip downloaded successfully. Warning: cannot be unzipped.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Sleep.exe interrupted by thoughts of them. Again.',
  },
  {
    title: '⚠️ WARNING',
    text: "You've been staring at their photo for 4 minutes. We noticed.",
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Matching you with... just kidding. Go text them yourself.',
  },
];

const STORAGE_KEY = 'honeyhearts_popup_seen';

export function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [message, setMessage] = useState<{
    title: string;
    text: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') return;

    setMessage(
      POPUP_MESSAGES[Math.floor(Math.random() * POPUP_MESSAGES.length)],
    );
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    playClick();
    setDismissing(true);
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setTimeout(() => setVisible(false), 200);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: dismissing ? 'transparent' : 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="mx-4 w-full max-w-[360px]"
        style={{
          animation: dismissing
            ? 'popup-dismiss 0.2s ease-in forwards'
            : 'popup-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <div
          style={{
            background: 'var(--win-chrome)',
            border: '2px solid',
            borderColor:
              'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
            boxShadow: '2px 2px 0 0 #000',
            padding: 3,
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center justify-between"
            style={{
              background: 'linear-gradient(90deg, #DAA520, #FFD700)',
              padding: '3px 4px',
              userSelect: 'none',
            }}
          >
            <span className="font-pixel text-[14px] font-bold tracking-wide text-white">
              {message?.title ?? '⚠️ WARNING'}
            </span>
            <button
              className="win98-titlebar-btn"
              aria-label="Close"
              onClick={dismiss}
            >
              <span className="text-[10px] font-bold leading-none text-black">
                ✕
              </span>
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
              padding: '16px 14px',
            }}
          >
            <p className="font-pixel text-[14px] leading-relaxed text-black">
              {message?.text}
            </p>
            <div className="mt-4 flex justify-end">
              <button className="win98-btn text-[14px]" onClick={dismiss}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
