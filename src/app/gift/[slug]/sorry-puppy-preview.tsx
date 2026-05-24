'use client';

import { SorryPuppy } from '@/gifts/sorry-puppy';

export function SorryPuppyPreview() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#1a1a2e] px-4 py-12">
      <h1 className="mb-6 font-display text-2xl font-bold text-white">
        Sorry Puppy
      </h1>
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl shadow-2xl"
        style={{ height: '560px' }}
      >
        <SorryPuppy mode="preview" />
      </div>
      <p className="mt-4 text-sm text-white/50">
        Preview mode — loops automatically
      </p>
    </div>
  );
}
