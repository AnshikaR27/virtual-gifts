import { notFound } from 'next/navigation';
import { OurStoryPreviewClient } from './wall-preview-client';

/**
 * ISOLATED PREVIEW — OUR_STORY's receiver flow.
 *
 *   /our-story/wall-preview
 *   …?skip=1          start past the gate, straight on the wall
 *   …?gate=captcha    force the captcha door instead of this gift's GATE
 *   …?gate=passcode   force the passcode door
 *
 * Nothing here touches the schema, the DB, the gift registry or any
 * sender-side code. The wall runs on the placeholder MEMORIES constant.
 *
 * The route lives under /our-story/, which lib/route-roles.ts lists as a
 * receiver prefix — that is what strips the marketing shell and lets the
 * greeting popup fire, so this previews the real three-beat sequence
 * (popup → passcode → wall) rather than the wall on its own.
 *
 * Available on localhost and on Vercel *preview* deploys; 404s only on the
 * production deployment, matching the love-receipt previews.
 */

// Always render at request time so the env guard is honored.
export const dynamic = 'force-dynamic';

export default function OurStoryWallPreviewPage({
  searchParams,
}: {
  searchParams: { skip?: string; gate?: string };
}) {
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }

  const skip = searchParams.skip === '1' || searchParams.skip === 'true';
  // Preview-only override of the gift's own GATE constant, so both doors can
  // be looked at without editing the gift.
  const gate =
    searchParams.gate === 'captcha' || searchParams.gate === 'passcode'
      ? searchParams.gate
      : undefined;

  return <OurStoryPreviewClient startUnlocked={skip} gate={gate} />;
}
