'use client';

/**
 * PREVIEW-ONLY shell around <OurStoryFlow>.
 *
 * It exists to run the flow WITHOUT a gift row: no <GiftFrame>, so no
 * useGiftContext, so no database. The real receiver (gifts/our-story/receiver.tsx)
 * is the one that reports back to the frame; this just renders the experience.
 *
 * There is no dev readout and no dev bar here. The wall is a visual thing being
 * judged on looks, and a fixed toolbar over a phone-height screen covers the
 * bottom row of polaroids — which is exactly the part hardest to reach and most
 * worth checking. The one control there is (`?skip=1`) is a URL, not an overlay.
 */

import { OurStoryFlow } from '@/gifts/our-story/our-story-flow';
import type { GateMode } from '@/gifts/shared/gift-gate';

export function OurStoryPreviewClient({
  startUnlocked = false,
  gate,
}: {
  startUnlocked?: boolean;
  gate?: GateMode;
}) {
  return <OurStoryFlow startUnlocked={startUnlocked} gate={gate} />;
}
