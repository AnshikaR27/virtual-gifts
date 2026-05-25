'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const SHAKE_THRESHOLD_ACCELERATION = 12;
const ENERGY_PER_SHAKE = 18;
const ENERGY_DECAY_PER_SECOND = 25;
const RELEASE_THRESHOLD = 100;

export function useShakeDetector(onRelease: () => void) {
  const [energy, setEnergy] = useState(0);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [listening, setListening] = useState(false);
  const lastShakeRef = useRef(0);
  const energyRef = useRef(0);
  const rafRef = useRef<number>();
  const onReleaseRef = useRef(onRelease);

  onReleaseRef.current = onRelease;

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;

    const magnitude = Math.sqrt(
      (acc.x ?? 0) ** 2 + (acc.y ?? 0) ** 2 + (acc.z ?? 0) ** 2,
    );

    const now = Date.now();
    if (now - lastShakeRef.current < 100) return;

    if (magnitude > SHAKE_THRESHOLD_ACCELERATION) {
      lastShakeRef.current = now;
      energyRef.current = Math.min(
        RELEASE_THRESHOLD,
        energyRef.current + ENERGY_PER_SHAKE,
      );
      setEnergy(energyRef.current);

      if (navigator.vibrate) navigator.vibrate(20);

      if (energyRef.current >= RELEASE_THRESHOLD) {
        energyRef.current = 0;
        setEnergy(0);
        if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
        onReleaseRef.current();
      }
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
        // Permission denied — fall back to tap
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
    let last = performance.now();
    const decay = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (energyRef.current > 0) {
        energyRef.current = Math.max(
          0,
          energyRef.current - ENERGY_DECAY_PER_SECOND * dt,
        );
        setEnergy(energyRef.current);
      }
      rafRef.current = requestAnimationFrame(decay);
    };
    rafRef.current = requestAnimationFrame(decay);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (listening) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [listening, handleMotion]);

  return { energy, requestPermission, needsPermission };
}
