'use client';

/**
 * PREVIEW-ONLY shell around <InstallingUsFlow>.
 *
 * It exists to run the flow WITHOUT a gift row: no <GiftFrame>, so no
 * useGiftContext, so no database. The real receiver will be the one that
 * reports back to the frame; this just renders the experience.
 *
 * There is no dev readout and no dev bar here. The installer is a visual thing
 * being judged on how big and how clear the photographs are, and a fixed
 * toolbar over a phone-height screen covers the progress bar — which is exactly
 * the part that has to be legible. The one control there is (`?skip=1`) is a
 * URL, not an overlay.
 */

import { InstallingUsFlow } from '@/gifts/installing-us/installing-us-flow';
import type { GateMode } from '@/gifts/shared/gift-gate';

export function InstallPreviewClient({
  startUnlocked = false,
  gate,
}: {
  startUnlocked?: boolean;
  gate?: GateMode;
}) {
  return <InstallingUsFlow startUnlocked={startUnlocked} gate={gate} />;
}
