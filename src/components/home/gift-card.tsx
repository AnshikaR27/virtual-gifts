'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { GiftItem } from './gift-catalog';
import { GiftLoading } from '@/components/gift-loading';

export function GiftCard({
  name,
  slug,
  gradient,
  badge,
  dark,
  emoji,
}: GiftItem) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.prefetch(`/gift/${slug}`);
      setLoading(true);
    },
    [router, slug],
  );

  const handleComplete = useCallback(() => {
    router.push(`/gift/${slug}`);
  }, [router, slug]);

  return (
    <>
      <a
        href={`/gift/${slug}`}
        onClick={handleClick}
        className="group relative flex w-[140px] flex-shrink-0 snap-start flex-col items-center px-2 py-3"
        style={{
          borderRadius: 4,
          transition: 'transform 0.15s',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: 'rgba(0, 0, 128, 0.12)',
            border: '1px dotted rgba(0, 0, 128, 0.4)',
          }}
        />

        <div
          className="relative mb-2 flex h-[64px] w-[64px] items-center justify-center transition-transform group-hover:-translate-y-0.5 md:h-[72px] md:w-[72px]"
          style={{
            background: `linear-gradient(135deg, ${gradient[0]}88 0%, ${gradient[1]}88 100%)`,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <span
            className="text-[40px] leading-none md:text-[48px]"
            role="img"
            aria-label={name}
          >
            {emoji}
          </span>
        </div>

        <span
          className={`w-full text-center font-sans text-[14px] font-medium leading-tight ${
            dark ? 'text-gray-700' : 'text-gray-800'
          }`}
        >
          {name}
        </span>

        <span
          className="mt-1.5 rounded-sm border px-1.5 py-[2px] font-sans text-[14px] font-medium"
          style={{
            borderColor: dark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.1)',
            background:
              badge === 'Free'
                ? 'rgba(34,197,94,0.12)'
                : 'rgba(168,85,247,0.12)',
            color: badge === 'Free' ? '#15803d' : '#7c3aed',
          }}
        >
          {badge}
        </span>
      </a>
      {loading && <GiftLoading onComplete={handleComplete} />}
    </>
  );
}
