import type { Metadata } from 'next';
import { BRAND_NAME } from '@/lib/constants';
import { HeroSection } from '@/components/home/hero-section';
import { StarryConstellation } from '@/components/home/starry-constellation';
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
      <StarryConstellation />
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
