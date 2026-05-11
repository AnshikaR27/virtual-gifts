'use client';

import { useEffect } from 'react';
import { useGiftContext } from './gift-frame';

interface PlaceholderGiftProps {
  recipientName: string;
}

export function PlaceholderGift({ recipientName }: PlaceholderGiftProps) {
  const { onClimax } = useGiftContext();

  useEffect(() => {
    const timer = setTimeout(onClimax, 3000);
    return () => clearTimeout(timer);
  }, [onClimax]);

  return (
    <div className="mx-auto max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-lg">
      <p className="font-display text-3xl font-bold text-on-surface">
        Hello, {recipientName}! 🎁
      </p>
      <p className="mt-3 font-body text-sm text-on-surface-variant">
        Your gift will appear here
      </p>
    </div>
  );
}
