'use client';

import { usePathname } from 'next/navigation';
import { isChromeFreeRoute } from '@/lib/route-roles';

/**
 * Renders `children` only on the marketing site — used to keep the app's
 * chrome (taskbar, footer, context menu) off focused screens.
 *
 * The route list lives in `@/lib/route-roles` because the popup needs the same
 * answer to pick its copy, and two copies of that list would drift. Add new
 * focused routes there, not here.
 */
export function HideOnGiftRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isChromeFreeRoute(pathname)) return null;
  return <>{children}</>;
}
