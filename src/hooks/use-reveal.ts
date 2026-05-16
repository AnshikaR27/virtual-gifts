'use client';

import { useEffect, useRef } from 'react';

interface RevealOptions {
  staggerMs?: number;
  threshold?: number;
  rootMargin?: string;
}

export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const {
    staggerMs = 80,
    threshold = 0.15,
    rootMargin = '0px 0px -40px 0px',
  } = options;
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const items = container.querySelectorAll<HTMLElement>('[data-reveal]');

    if (prefersReducedMotion) {
      items.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    items.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 600ms ease-out, transform 600ms ease-out`;
      el.style.transitionDelay = `${i * staggerMs}ms`;
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((el) => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [staggerMs, threshold, rootMargin]);

  return containerRef;
}
