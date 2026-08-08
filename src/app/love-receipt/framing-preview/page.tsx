import { notFound } from 'next/navigation';
import { FramingPreviewClient } from './framing-preview-client';
import type { FramingVariant } from '@/gifts/love-receipt/framing/reveal-framing';
import type { MockLength } from '@/gifts/love-receipt/framing/framing-mock';

/**
 * ISOLATED PREVIEW — the reveal-framing experiment.
 *
 * Three framings of the SAME receipt, switchable by query param:
 *
 *   /love-receipt/framing-preview              A — print (cold, no beat)
 *   /love-receipt/framing-preview?frame=notif  B — notif (cold status card)
 *   /love-receipt/framing-preview?frame=warm   C — warm (character asks first)
 *   …&skip=1     bypass the frame beat, land on the print
 *   …&len=long   the 9-item payload
 *
 * Nothing here touches the live receiver, the schema, the DB, or any
 * sender-side code. The payload is frozen and never calls the draw engine.
 *
 * The query is read HERE, on the server, so the first paint already has the
 * right field colour — variant C's blush must never flash near-black first.
 *
 * Available on localhost and on Vercel *preview* deploys; 404s only on the
 * production deployment, matching /g/preview. (Its sibling
 * /love-receipt/reveal-preview has no guard yet and should get one.)
 */

// Always render at request time so the env guard is honored.
export const dynamic = 'force-dynamic';

function toVariant(v?: string): FramingVariant {
  return v === 'notif' || v === 'warm' || v === 'print' ? v : 'print';
}

function toLength(l?: string): MockLength {
  return l === 'long' ? 'long' : 'short';
}

export default function FramingPreviewPage({
  searchParams,
}: {
  searchParams: { frame?: string; len?: string; skip?: string };
}) {
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }
  return (
    <FramingPreviewClient
      initialVariant={toVariant(searchParams.frame)}
      initialLength={toLength(searchParams.len)}
      initialSkip={searchParams.skip === '1'}
    />
  );
}
