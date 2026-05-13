'use client';

import { useState, useEffect } from 'react';

export function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShow(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 md:hidden ${
        show
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-8 opacity-0'
      }`}
    >
      <a
        href="#quick-sweet"
        className="win98-btn-pink inline-flex items-center gap-1.5 text-[16px]"
        style={{
          boxShadow: '3px 3px 0 0 rgba(0,0,0,0.3)',
        }}
      >
        💕 Create a gift
      </a>
    </div>
  );
}
