import type { Metadata, Viewport } from 'next';
import {
  Fraunces,
  Outfit,
  Caveat,
  VT323,
  Oswald,
  JetBrains_Mono,
} from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Taskbar } from '@/components/layout/taskbar';
import { Footer } from '@/components/layout/footer';
import { HideOnGiftRoute } from '@/components/layout/hide-on-gift-route';
import { RetroSounds } from '@/components/retro-sounds';
import { ToastProvider } from '@/components/y2k-toast';
import { Y2KContextMenu } from '@/components/y2k-context-menu';
import { WelcomePopup } from '@/components/welcome-popup';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/constants';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const vt323 = VT323({
  subsets: ['latin'],
  variable: '--font-vt323',
  weight: '400',
  display: 'swap',
});

// Heavy condensed grotesque for the Love Receipt store header (realistic
// thermal-receipt look). JetBrains Mono backs `font-mono` / the receipt body.
const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_TAGLINE,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${outfit.variable} ${caveat.variable} ${vt323.variable} ${oswald.variable} ${jetbrainsMono.variable}`}
    >
      <body className="safe-area-pad font-body antialiased">
        <div className="scanline-overlay" aria-hidden />
        <NextIntlClientProvider messages={messages}>
          <RetroSounds />
          <HideOnGiftRoute>
            <Taskbar />
          </HideOnGiftRoute>
          <main className="main-min-h">{children}</main>
          <HideOnGiftRoute>
            <Footer />
          </HideOnGiftRoute>
          <ToastProvider />
          <HideOnGiftRoute>
            <Y2KContextMenu />
            <WelcomePopup />
          </HideOnGiftRoute>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
