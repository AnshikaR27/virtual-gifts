'use client';

import { useState, useEffect, useCallback } from 'react';
import { playClick } from '@/components/retro-sounds';

const MESSAGES = [
  '⚠️ WARNING: Your love life is running low on memory. Please delete some bad decisions.',
  '💕 SYSTEM: Heart rate increasing... are you in love?',
  '📂 ROMANCE.exe has stopped working. Reason: too many feelings.',
  '🔮 You have 3 unread love letters. Would you like to panic?',
  '⚠️ ERROR: Cannot find chill.exe. Would you like to catch feelings instead?',
];

const STORAGE_KEY = 'honeyhearts_popup_seen';

export function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;

    setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    playClick();
    setDismissing(true);
    localStorage.setItem(STORAGE_KEY, 'true');
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
              background: 'linear-gradient(90deg, #FF69B4, #BA55D3)',
              padding: '3px 4px',
              userSelect: 'none',
            }}
          >
            <span className="font-pixel text-[14px] font-bold tracking-wide text-white">
              💕 HoneyHearts
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
              {message}
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
