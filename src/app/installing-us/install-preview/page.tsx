import { notFound } from 'next/navigation';
import { InstallPreviewClient } from './install-preview-client';

/**
 * ISOLATED PREVIEW — INSTALLING_US's receiver flow.
 *
 *   /installing-us/install-preview
 *   …?skip=1          start past the gate, straight on the setup wizard
 *   …?gate=captcha    force the captcha door instead of this gift's GATE
 *   …?gate=passcode   force the passcode door
 *
 * Nothing here touches the schema, the DB, the gift registry or any
 * sender-side code. The installer runs on the placeholder PHOTOS constant.
 *
 * The route lives under /installing-us/, which lib/route-roles.ts lists as a
 * receiver prefix — that is what strips the marketing shell and lets the
 * greeting popup fire, so this previews the real three-beat sequence
 * (popup → passcode → installer) rather than the installer on its own.
 *
 * Available on localhost and on Vercel *preview* deploys; 404s only on the
 * production deployment, matching the memory-wall and love-receipt previews.
 */

// Always render at request time so the env guard is honored.
export const dynamic = 'force-dynamic';

export default function InstallingUsPreviewPage({
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

  return <InstallPreviewClient startUnlocked={skip} gate={gate} />;
}
