import Link from 'next/link';
import { BRAND_NAME } from '@/lib/constants';

export function Header() {
  return (
    <header className="border-b border-border px-4 py-3">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold text-primary">
          {BRAND_NAME}
        </Link>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
