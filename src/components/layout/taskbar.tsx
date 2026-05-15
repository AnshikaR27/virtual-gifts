'use client';

import { useState, useEffect } from 'react';

function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      );
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return <span className="font-pixel text-[14px] text-black">{time}</span>;
}

export function Taskbar() {
  return (
    <header
      className="sticky z-50 flex h-11 items-center justify-between px-1 md:h-[34px]"
      style={{
        top: 'env(safe-area-inset-top, 0px)',
        background: 'var(--win-chrome)',
        borderBottom: '2px solid',
        borderColor: 'var(--win-chrome-light)',
        boxShadow: '0 2px 0 0 var(--win-chrome-darkest)',
      }}
    >
      {/* Start button (no menu) */}
      <a
        href="/"
        className="win98-btn flex items-center gap-1.5 self-stretch text-[14px] no-underline md:self-auto"
        style={{ padding: '2px 10px' }}
      >
        <span className="text-base leading-none">💖</span>
        <span className="font-pixel font-bold tracking-wide text-black">
          HoneyHearts
        </span>
      </a>

      {/* Center marquee area */}
      <div className="hidden items-center sm:flex">
        <span className="font-pixel text-[14px] text-black/80">
          💕 87 gifts to make them ugly cry
        </span>
      </div>

      {/* Right — tray icons + clock */}
      <div
        className="flex items-center gap-3 self-stretch px-2"
        style={{
          borderLeft: '2px solid var(--win-chrome-dark)',
        }}
      >
        <span className="text-sm leading-none" title="Gifts">
          💝
        </span>
        <span className="text-sm leading-none" title="Messages">
          💌
        </span>
        <Clock />
      </div>
    </header>
  );
}
