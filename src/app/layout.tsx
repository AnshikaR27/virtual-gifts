import type { Metadata } from 'next';
import { Fraunces, Outfit, Caveat, VT323 } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Taskbar } from '@/components/layout/taskbar';
import { Footer } from '@/components/layout/footer';
import { RetroSounds } from '@/components/retro-sounds';
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
      className={`${fraunces.variable} ${outfit.variable} ${caveat.variable} ${vt323.variable}`}
    >
      <body className="font-body antialiased">
        <div className="scanline-overlay" aria-hidden />
        <NextIntlClientProvider messages={messages}>
          <RetroSounds />
          <Taskbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
