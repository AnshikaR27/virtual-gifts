'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

const CORNER_DOODLES = ['♡', '💌', '✨', '🤍', '🌸'];

interface MessageCardProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function MessageCard({ message, visible, onDismiss }: MessageCardProps) {
  const [typed, setTyped] = useState('');
  const [doneTyping, setDoneTyping] = useState(false);
  const [exiting, setExiting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const doodle = useRef(
    CORNER_DOODLES[Math.floor(Math.random() * CORNER_DOODLES.length)],
  );

  useEffect(() => {
    if (!visible) {
      setTyped('');
      setDoneTyping(false);
      setExiting(false);
      return;
    }

    doodle.current =
      CORNER_DOODLES[Math.floor(Math.random() * CORNER_DOODLES.length)];

    let i = 0;
    setTyped('');
    setDoneTyping(false);
    intervalRef.current = setInterval(() => {
      i++;
      setTyped(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(intervalRef.current);
        setDoneTyping(true);
      }
    }, 35);

    return () => clearInterval(intervalRef.current);
  }, [visible, message]);

  const handleDismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 400);
  }, [onDismiss]);

  if (!visible && !exiting) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(30, 15, 40, 0.3)',
          animation: exiting
            ? 'card-backdrop-out 400ms ease-in forwards'
            : 'card-backdrop-in 400ms ease-out forwards',
        }}
        onClick={doneTyping ? handleDismiss : undefined}
      />

      {/* Card */}
      <div
        className="relative w-[80vw] max-w-[360px]"
        style={{
          background: '#FFFCF6',
          border: '1px solid rgba(160, 128, 96, 0.2)',
          borderRadius: 8,
          padding: '28px 24px 20px',
          boxShadow: '0 8px 24px rgba(120, 0, 55, 0.15)',
          transform: 'rotate(-2deg)',
          animation: exiting
            ? 'card-exit 400ms cubic-bezier(0.4, 0, 1, 1) forwards'
            : 'card-enter 400ms cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
        }}
      >
        {/* Corner doodle */}
        <span
          className="absolute right-3 top-2 select-none"
          style={{ fontSize: 16, opacity: 0.5 }}
        >
          {doodle.current}
        </span>

        {/* Message text */}
        <p
          className="min-h-[3em] font-handwritten text-[19px] leading-[1.5]"
          style={{ color: '#3D2817' }}
        >
          {typed}
          {!doneTyping && (
            <span
              className="inline-block w-[2px] align-middle"
              style={{
                height: '1.1em',
                background: '#3D2817',
                marginLeft: 1,
                animation: 'blink-cursor 1s step-end infinite',
              }}
            />
          )}
        </p>

        {/* Action buttons */}
        {doneTyping && (
          <div
            className="mt-5 flex items-center justify-between gap-3"
            style={{ animation: 'card-actions-in 300ms ease-out forwards' }}
          >
            <button
              className="font-pixel text-[14px] tracking-wide"
              style={{
                color: '#e8609a',
                background: 'none',
                border: '1px solid rgba(232, 96, 154, 0.3)',
                borderRadius: 4,
                padding: '6px 14px',
                cursor: 'pointer',
              }}
              onClick={handleDismiss}
            >
              keep this one &#9829;
            </button>
            <button
              className="font-pixel text-[14px] tracking-wide"
              style={{
                color: 'rgba(90, 60, 35, 0.6)',
                background: 'none',
                border: '1px solid rgba(90, 60, 35, 0.15)',
                borderRadius: 4,
                padding: '6px 14px',
                cursor: 'pointer',
              }}
              onClick={handleDismiss}
            >
              {'next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
