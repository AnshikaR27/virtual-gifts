'use client';

import { useState, useEffect, useCallback } from 'react';

let _showToast: (message: string) => void = () => {};

export function showToast(message: string) {
  _showToast(message);
}

export function ToastProvider() {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  }, []);

  useEffect(() => {
    _showToast = show;
  }, [show]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[10003] -translate-x-1/2">
      <div className="win98-window">
        <div className="win98-titlebar">
          <span>💕 HoneyHearts</span>
        </div>
        <div className="win98-body" style={{ padding: '8px 14px' }}>
          <p className="whitespace-nowrap font-pixel text-[15px] text-ink">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
