'use client';

import { playClick } from '@/components/retro-sounds';
import { showToast } from '@/components/y2k-toast';

export function ShutdownButton() {
  return (
    <div
      className="px-4 py-8 text-center md:hidden"
      style={{ background: '#1a0a2e' }}
    >
      <button
        onClick={() => {
          playClick();
          showToast('Error: Cannot shut down. Too much love in the system.');
        }}
        className="font-pixel text-[18px] tracking-wide"
        style={{
          color: '#FF69B4',
          textShadow: '0 0 8px rgba(255,105,180,0.5)',
        }}
      >
        It is now safe to close this app 💕
      </button>
    </div>
  );
}
