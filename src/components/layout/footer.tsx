import Link from 'next/link';
import { BRAND_NAME } from '@/lib/constants';

function TitlebarButtons() {
  return (
    <div className="flex gap-[2px]">
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="mt-[2px] block h-[2px] w-[6px] bg-black" />
      </span>
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="block h-[7px] w-[7px] border border-black" />
      </span>
      <span className="win98-titlebar-btn" aria-hidden>
        <span className="text-[10px] font-bold leading-none text-black">✕</span>
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="win98-window">
          <div className="win98-titlebar text-[14px]">
            <span>ℹ️ About {BRAND_NAME}.exe</span>
            <TitlebarButtons />
          </div>
          <div
            className="border-2 bg-white px-4 py-6 md:px-6"
            style={{
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
            }}
          >
            <div className="grid gap-6 text-sm md:grid-cols-4 md:gap-8">
              {/* Brand */}
              <div>
                <p className="font-pixel text-[18px] text-[#2D0A4E]">
                  {BRAND_NAME}
                </p>
                <p className="mt-1 font-body text-sm text-black/50">
                  Interactive digital love gifts
                </p>
              </div>

              {/* Gifts */}
              <div>
                <p className="font-pixel text-[14px] text-[#2D0A4E]">
                  📁 Gifts
                </p>
                <div className="mt-2 flex flex-col gap-2.5 font-pixel text-[14px] text-black/70 md:gap-1">
                  <Link href="/#quick-sweet" className="hover:text-[#FF1493]">
                    Quick &amp; Sweet
                  </Link>
                  <Link
                    href="/#make-them-melt"
                    className="hover:text-[#FF1493]"
                  >
                    Make Them Melt
                  </Link>
                  <Link href="/#wildcard" className="hover:text-[#FF1493]">
                    Wildcard
                  </Link>
                  <Link href="/#play-together" className="hover:text-[#FF1493]">
                    Play Together
                  </Link>
                  <Link
                    href="/#for-the-long-run"
                    className="hover:text-[#FF1493]"
                  >
                    For The Long Run
                  </Link>
                </div>
              </div>

              {/* Company */}
              <div>
                <p className="font-pixel text-[14px] text-[#2D0A4E]">
                  📄 Company
                </p>
                <div className="mt-2 flex flex-col gap-2.5 font-pixel text-[14px] text-black/70 md:gap-1">
                  <Link href="/pricing" className="hover:text-[#FF1493]">
                    Pricing
                  </Link>
                  <Link href="/privacy" className="hover:text-[#FF1493]">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-[#FF1493]">
                    Terms of Service
                  </Link>
                </div>
              </div>

              {/* Connect */}
              <div>
                <p className="font-pixel text-[14px] text-[#2D0A4E]">
                  🌐 Connect
                </p>
                <div className="mt-2 flex flex-col gap-2.5 font-pixel text-[14px] text-black/70 md:gap-1">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF1493]"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF1493]"
                  >
                    Twitter
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div
              className="mt-6 border-t-2 pt-4 text-center font-pixel text-[14px] text-black/40"
              style={{ borderColor: 'var(--win-chrome-dark)' }}
            >
              &copy; 2026 {BRAND_NAME}.exe — Made with 💕 — Vadodara, India
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
