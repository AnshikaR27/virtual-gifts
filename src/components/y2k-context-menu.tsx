'use client';

import { useState, useEffect } from 'react';
import { playClick } from '@/components/retro-sounds';
import { showToast } from '@/components/y2k-toast';

const MENU_ITEMS = [
  {
    label: '💕 Send love',
    action: () =>
      document
        .getElementById('quick-sweet')
        ?.scrollIntoView({ behavior: 'smooth' }),
  },
  {
    label: '📋 Copy feelings',
    action: () => showToast('Feelings copied to clipboard 💕'),
  },
  {
    label: '🗑️ Delete ex',
    action: () => showToast('Error: Cannot delete. Still in recycle bin.'),
  },
  {
    label: '🔄 Refresh heart',
    action: () => window.location.reload(),
  },
  {
    label: '📂 Open emotions folder',
    action: () =>
      document
        .getElementById('make-them-melt')
        ?.scrollIntoView({ behavior: 'smooth' }),
  },
];

export function Y2KContextMenu() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleContext = (e: MouseEvent) => {
      if (window.innerWidth <= 768) return;
      e.preventDefault();
      playClick();

      const menuW = 230;
      const menuH = MENU_ITEMS.length * 32 + 12;
      const x = Math.min(e.clientX, window.innerWidth - menuW - 8);
      const y = Math.min(e.clientY, window.innerHeight - menuH - 8);
      setPos({ x, y });
    };

    const handleClick = () => setPos(null);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPos(null);
    };

    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  if (!pos) return null;

  return (
    <div className="fixed z-[10002]" style={{ left: pos.x, top: pos.y }}>
      <div
        style={{
          background: 'white',
          border: '2px solid',
          borderColor:
            'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
          boxShadow: '2px 2px 0 0 rgba(0,0,0,0.3)',
          padding: '2px 0',
          minWidth: 220,
        }}
      >
        {MENU_ITEMS.map((item, i) => (
          <button
            key={i}
            className="flex w-full items-center px-6 py-[5px] text-left font-pixel text-[14px] text-black hover:bg-[#0000AA] hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              playClick();
              setPos(null);
              item.action();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
