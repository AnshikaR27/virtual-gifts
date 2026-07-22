'use client';

import { useEffect } from 'react';

/**
 * App-like input lock: blocks pinch-to-zoom so HoneyHearts feels like a native
 * app rather than a web page.
 *
 * The viewport meta (maximum-scale=1, user-scalable=no in layout.tsx) already
 * stops zoom on Android/Chrome, and `touch-action: pan-x pan-y` (globals.css)
 * kills double-tap zoom. But iOS Safari deliberately IGNORES the viewport zoom
 * limits for accessibility, so the only reliable way to stop pinch-zoom there is
 * to cancel Safari's non-standard `gesture*` events, which fire on a two-finger
 * pinch. Single-finger scroll and drag (pointer/touchmove) are untouched, so
 * normal scrolling and any drag gestures keep working.
 */
export function AppViewportLock() {
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    // iOS Safari pinch-zoom fires gesturestart → gesturechange → gestureend.
    document.addEventListener('gesturestart', prevent);
    document.addEventListener('gesturechange', prevent);
    document.addEventListener('gestureend', prevent);
    return () => {
      document.removeEventListener('gesturestart', prevent);
      document.removeEventListener('gesturechange', prevent);
      document.removeEventListener('gestureend', prevent);
    };
  }, []);

  return null;
}
