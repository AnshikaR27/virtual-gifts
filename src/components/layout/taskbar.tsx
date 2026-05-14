'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';

const NAV_ITEMS = [
  { label: '📁 Quick & Sweet', href: '/#quick-sweet' },
  { label: '📁 Make Them Melt', href: '/#make-them-melt' },
  { label: '📁 Wildcard', href: '/#wildcard' },
  { label: '📁 Play Together', href: '/#play-together' },
  { label: '📁 For The Long Run', href: '/#for-the-long-run' },
  'divider' as const,
  { label: '💰 Pricing', href: '/pricing' },
  { label: '📊 Dashboard', href: '/dashboard' },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: Event) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [menuOpen]);

  const handleItemClick = (href: string) => {
    playClick();
    setMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      if (pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(href);
  };

  return (
    <header
      className="sticky top-0 z-50 flex h-11 items-center justify-between px-1 md:h-[34px]"
      style={{
        background: 'var(--win-chrome)',
        borderBottom: '2px solid',
        borderColor: 'var(--win-chrome-light)',
        boxShadow: '0 2px 0 0 var(--win-chrome-darkest)',
      }}
    >
      {/* Start button + menu */}
      <div className="relative">
        <button
          ref={btnRef}
          onClick={() => {
            playClick();
            setMenuOpen((v) => !v);
          }}
          className="win98-btn flex items-center gap-1.5 self-stretch text-[14px] md:self-auto"
          style={
            menuOpen
              ? {
                  padding: '3px 9px 1px 11px',
                  borderColor: '#404040 #dfdfdf #dfdfdf #404040',
                }
              : { padding: '2px 10px' }
          }
        >
          <span className="text-base leading-none">💖</span>
          <span className="font-pixel font-bold tracking-wide text-black">
            HoneyHearts
          </span>
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute left-0 top-full z-[9998] mt-[2px]"
          >
            <div
              className="flex"
              style={{
                background: 'var(--win-chrome)',
                border: '2px solid',
                borderColor:
                  'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
                boxShadow: '2px 2px 0 0 #000',
              }}
            >
              {/* Vertical pink strip */}
              <div
                className="flex items-end justify-center"
                style={{
                  background: 'linear-gradient(180deg, #FF69B4, #BA55D3)',
                  width: 28,
                  paddingBottom: 8,
                }}
              >
                <span
                  className="font-pixel text-[13px] font-bold text-white"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    letterSpacing: 1,
                  }}
                >
                  HoneyHearts 💕
                </span>
              </div>

              {/* Menu items */}
              <div className="flex-1 bg-white py-1">
                {NAV_ITEMS.map((item, i) =>
                  item === 'divider' ? (
                    <div
                      key={i}
                      className="mx-2 my-1"
                      style={{
                        borderTop: '1px solid var(--win-chrome-dark)',
                        borderBottom: '1px solid var(--win-chrome-light)',
                      }}
                    />
                  ) : (
                    <button
                      key={i}
                      className="flex w-full items-center gap-2 px-4 py-[6px] text-left font-pixel text-[14px] text-black hover:bg-[#0000AA] hover:text-white"
                      onClick={() => handleItemClick(item.href)}
                    >
                      {item.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center marquee area */}
      <div className="hidden items-center sm:flex">
        <span className="font-pixel text-[14px] text-black/80">
          💕 87 gifts, starting free
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
