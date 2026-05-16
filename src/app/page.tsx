import type { Metadata } from 'next';
import { BRAND_NAME } from '@/lib/constants';
import { HeroSection } from '@/components/home/hero-section';
import { CrtShowcase } from '@/components/home/crt-showcase';
import { PolaroidWall } from '@/components/home/polaroid-wall';
import { HowItWorks } from '@/components/home/how-it-works';
import { CommunityCTA } from '@/components/home/community-cta';
import { Testimonials } from '@/components/home/testimonials';
import { StickyCTA } from '@/components/home/sticky-cta';
import { LoveStats } from '@/components/home/love-stats';
import { ShutdownButton } from '@/components/y2k-shutdown';

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Craft Unforgettable Interactive Surprises`,
  description:
    '87 interactive digital gifts that make someone feel like the most loved person on earth. Pick, personalize, send via WhatsApp. Free gifts available.',
  openGraph: {
    title: `${BRAND_NAME} — Craft Unforgettable Interactive Surprises`,
    description:
      '87 interactive digital gifts that make someone feel like the most loved person on earth. Pick, personalize, send via WhatsApp.',
    type: 'website',
    locale: 'en_IN',
    siteName: BRAND_NAME,
  },
};

export default function Home() {
  return (
    <div className="pb-20 md:pb-0">
      <HeroSection />
      <CrtShowcase />
      <div className="wall-transition">
        <p className="wall-transition-title font-handwritten">
          want more? wander the wall &#8595;
        </p>
        <p className="wall-transition-sub font-body">
          82 more ways to make their phone screen blur
        </p>
        <svg className="wall-transition-trail" viewBox="0 0 60 20" aria-hidden>
          <path
            d="M5 10 Q15 2 25 10 Q35 18 45 10 Q55 2 58 10"
            fill="none"
            stroke="#8B6F4E"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
      <PolaroidWall />
      <HowItWorks />
      <Testimonials />
      <CommunityCTA />
      <LoveStats />
      <StickyCTA />
      <ShutdownButton />
    </div>
  );
}
