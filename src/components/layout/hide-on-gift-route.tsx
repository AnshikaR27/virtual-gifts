'use client';

import { usePathname } from 'next/navigation';

const GIFT_ROUTE_PREFIXES = ['/g/', '/dev/love-jar'];

export function HideOnGiftRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (GIFT_ROUTE_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return <>{children}</>;
}
