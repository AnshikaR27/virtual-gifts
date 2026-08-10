import { notFound } from 'next/navigation';
import { PasscodePreviewClient } from './passcode-preview-client';

/**
 * ISOLATED PREVIEW — the Y2K passcode keypad.
 *
 *   /love-receipt/passcode-preview
 *   …?prompt=…   override the prompt line
 *   …?hint=…     override the hint line (the real hint is NOT wired yet)
 *   …?debug=1    force the "entered: …" readout on
 *   …?debug=0    force it off
 *
 * Nothing here touches the live receiver, the gift route, the schema, the DB or
 * any sender-side code. The screen is visual-only: it collects digits and hands
 * them to a callback that just echoes them back on screen. There is no
 * validation and no notion of a correct code.
 *
 * Available on localhost and on Vercel *preview* deploys; 404s only on the
 * production deployment, matching /g/preview and the sibling framing preview.
 */

// Always render at request time so the env guard is honored.
export const dynamic = 'force-dynamic';

/**
 * The debug readout defaults to ON under `next dev` and OFF everywhere else —
 * so a shared Vercel preview link shows the screen as designed, with no
 * developer text under it, while local work keeps the affordance. `?debug=`
 * overrides either way.
 */
function resolveDebug(raw: string | undefined): boolean {
  if (raw === undefined) return process.env.NODE_ENV === 'development';
  return raw !== '0' && raw !== 'false';
}

export default function PasscodePreviewPage({
  searchParams,
}: {
  searchParams: { prompt?: string; hint?: string; debug?: string };
}) {
  if (process.env.VERCEL_ENV === 'production') {
    notFound();
  }
  return (
    <PasscodePreviewClient
      prompt={searchParams.prompt}
      hint={searchParams.hint}
      debug={resolveDebug(searchParams.debug)}
    />
  );
}
