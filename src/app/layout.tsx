import type { Metadata, Viewport } from 'next';
import {
  Fraunces,
  Outfit,
  Caveat,
  VT323,
  Archivo_Black,
  JetBrains_Mono,
  Space_Mono,
} from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Taskbar } from '@/components/layout/taskbar';
import { Footer } from '@/components/layout/footer';
import { HideOnGiftRoute } from '@/components/layout/hide-on-gift-route';
import { RetroSounds } from '@/components/retro-sounds';
import { AppViewportLock } from '@/components/app-viewport-lock';
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

// Heavy black grotesque for the Love Receipt store header (Receiptify look).
// JetBrains Mono backs `font-mono` app-wide.
const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  variable: '--font-archivo-black',
  weight: '400',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '700'],
  display: 'swap',
});

// Monospace for the Love Receipt body — the Receiptify thermal-print look.
const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-space-mono',
  weight: ['400', '700'],
  display: 'swap',
});

// App-like, not web-like: lock scaling so the pages don't pinch/double-tap zoom.
// This covers Android/Chrome; iOS Safari ignores maximumScale/userScalable for
// accessibility, so <AppViewportLock> additionally cancels its gesture* events.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // pin the scale at exactly 1 — min AND max — so neither pinch-in (zoom in) nor
  // pinch-out (zoom out) can rescale the page.
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      className={`${fraunces.variable} ${outfit.variable} ${caveat.variable} ${vt323.variable} ${archivoBlack.variable} ${jetbrainsMono.variable} ${spaceMono.variable}`}
    >
      <body className="safe-area-pad font-body antialiased">
        <div className="scanline-overlay" aria-hidden />
        <NextIntlClientProvider messages={messages}>
          <AppViewportLock />
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
