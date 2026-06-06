'use client';

import { usePathname } from 'next/navigation';

// Routes that get a focused, chrome-free screen: the recipient gift view and
// every gift creation/builder flow.
const FOCUSED_ROUTE_PREFIXES = ['/g/', '/create/'];

export function HideOnGiftRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (FOCUSED_ROUTE_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  return <>{children}</>;
}
