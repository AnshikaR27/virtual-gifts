'use client';

import { BRAND_NAME } from '@/lib/constants';

interface WatermarkProps {
  paid: boolean;
}

export function Watermark({ paid }: WatermarkProps) {
  if (paid) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none">
      <span className="font-handwritten text-sm text-primary opacity-30">
        Made with {BRAND_NAME} 💕
      </span>
    </div>
  );
}
