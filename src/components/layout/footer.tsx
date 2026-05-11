import Link from 'next/link';
import { BRAND_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-sm text-muted-foreground">
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
        <p>&copy; 2026 {BRAND_NAME}</p>
      </div>
    </footer>
  );
}
