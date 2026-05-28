'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

const SHAKE_THRESHOLD = 14;
const COOLDOWN_MS = 600;

export function useShakeDetector(onShake: () => void) {
  const [needsPermission, setNeedsPermission] = useState(false);
  const [listening, setListening] = useState(false);
  const lastShakeRef = useRef(0);
  const onShakeRef = useRef(onShake);

  onShakeRef.current = onShake;

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;

    const magnitude = Math.sqrt(
      (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2,
    );

    const now = Date.now();
    if (
      magnitude > SHAKE_THRESHOLD &&
      now - lastShakeRef.current > COOLDOWN_MS
    ) {
      lastShakeRef.current = now;
      if (navigator.vibrate) navigator.vibrate([40, 20, 60]);
      onShakeRef.current();
    }
  }, []);

  const startListening = useCallback(() => {
    window.addEventListener('devicemotion', handleMotion);
    setListening(true);
  }, [handleMotion]);

  const requestPermission = useCallback(async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result === 'granted') {
          setNeedsPermission(false);
          startListening();
        }
      } catch {
        // Permission denied — button fallback always works
      }
    } else {
      startListening();
    }
  }, [startListening]);

  useEffect(() => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      setNeedsPermission(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (listening) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [listening, handleMotion]);

  return { requestPermission, needsPermission };
}
