/**
 * OUR_STORY — the memory data.
 *
 * THIS FILE IS THE EASY-TO-EDIT BIT. Change MEMORIES and the wall changes;
 * nothing else needs touching.
 *
 * PLACEHOLDER DATA, NOT WIRED. The sender flow, the schema and the DB know
 * nothing about this gift yet. `normalizeMemories()` is the seam: when real
 * data does arrive it will come through there, so the wall itself never has to
 * learn where memories come from.
 */

export interface Memory {
  /** Stable key. Used for React keys and flip state — must be unique. */
  id: string;
  /**
   * Photo URL for the polaroid front.
   *
   * OMIT IT and the polaroid falls back to the gradient the homepage wall uses
   * for its cards (see `gradients` in components/home/polaroid-wall-shared).
   * The gradient also shows THROUGH while a photo is still loading, which is
   * why `tint` stays useful even on a memory that has one.
   */
  photo?: string;
  /**
   * The small handwritten line under the photo — a date, a place, a two-word
   * label.
   *
   * TEN CHARACTERS, MAXIMUM. This is measured, not a style preference: on a
   * 360px phone the caption strip is about 66px wide, which is ~11 characters
   * of 15px Caveat. An eleventh character wraps to a second line, and because
   * the caption sits in the polaroid's bottom border that second line makes
   * the whole card visibly longer — the difference between a polaroid and a
   * bookmark. "before I knew you" was exactly this bug.
   */
  caption: string;
  /**
   * The memory revealed on the back, in the sender's voice.
   *
   * KEEP IT UNDER ~70 CHARACTERS, and treat that as a hard limit rather than a
   * suggestion. The back is exactly the size of the front, and on a phone the
   * homepage wall hangs THREE polaroids per string — about 105px wide each.
   * There is very little room in there. Anything longer clips, because
   * .polaroid-back is `overflow: hidden`.
   *
   * If the memories need to be longer than a sentence, the fix is a layout
   * decision (fewer per string, or a different reveal), not a smaller font.
   */
  memory: string;
  /**
   * Which gradient the placeholder front uses — an index into the shared
   * `gradients` palette. Ignored entirely once `photo` is set.
   */
  tint?: number;
}

/**
 * Real photos, served from /public/memories/.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  THESE ARE PERSONAL PHOTOGRAPHS OF IDENTIFIABLE PEOPLE, AND /public IS     │
 * │  A PUBLIC DIRECTORY. Anything in there is committed to git and served      │
 * │  unauthenticated at <site>/memories/<file> on every deploy — no gift       │
 * │  link, no passcode, no auth in front of it. They are here so the wall can  │
 * │  be judged with real content; they should be swapped for stock or moved    │
 * │  out before this branch is pushed. Real sender uploads will live in        │
 * │  private storage behind the gift, not in /public.                          │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * Filenames are slugs on purpose. The originals had spaces and camera hashes
 * ("WhatsApp Image 2025-07-22 at 03.16.49_3d9da712.jpg"), which have to be
 * percent-encoded in a src and break the moment someone edits them by hand.
 */
const photo = (file: string) => `/memories/${file}`;

/**
 * The wall. EIGHT memories, one per photo supplied — three per string on a
 * phone, so this lays out 3 + 3 + 2. Nine would give three even rows; if you
 * add a ninth photo, drop it in and the last row balances itself.
 *
 * Each caption and memory is written to the photograph it sits on, so they do
 * not survive swapping the images out — rewrite both together.
 */
export const MEMORIES: Memory[] = [
  {
    id: 'cafe-selfie',
    photo: photo('cafe-selfie.jpg'),
    caption: 'the café',
    memory: 'You leaned in for the photo. I forgot what I was saying.',
    tint: 0,
  },
  {
    id: 'lanterns-hug',
    photo: photo('lanterns-hug.jpg'),
    caption: 'the lights',
    memory: 'You hugged me like that in front of everyone. Show-off.',
    tint: 1,
  },
  {
    id: 'waterfall',
    photo: photo('waterfall.jpg'),
    caption: 'waterfall',
    memory: 'You yelled over the water. I still could not hear you.',
    tint: 9,
  },
  {
    id: 'brick-wall-night',
    photo: photo('brick-wall-night.jpg'),
    caption: 'that night',
    memory: 'You picked the spot. It was, annoyingly, perfect.',
    tint: 6,
  },
  {
    id: 'canoe-lake',
    photo: photo('canoe-lake.jpg'),
    caption: 'the lake',
    memory: 'You turned around for one photo and nearly tipped us.',
    tint: 2,
  },
  {
    id: 'turban-kurta',
    photo: photo('turban-kurta.jpg'),
    caption: 'the fit',
    memory: 'The turban was your idea. You were completely right.',
    tint: 4,
  },
  {
    id: 'chandelier-selfie',
    photo: photo('chandelier-selfie.jpg'),
    caption: '1am selfie',
    memory: 'You sent me this at 1am with no explanation. Kept it.',
    tint: 7,
  },
  {
    id: 'childhood-kurta',
    photo: photo('childhood-kurta.jpg'),
    caption: 'little you',
    memory: 'You were already like this. Nothing has changed at all.',
    tint: 10,
  },
];

/**
 * The seam between stored data and the wall.
 *
 * Right now it heals a partial array and falls back to MEMORIES; later it will
 * be where a real `contentJsonb` payload is coerced. Everything downstream can
 * assume a clean, non-empty list.
 */
export function normalizeMemories(raw: unknown): Memory[] {
  if (!Array.isArray(raw) || raw.length === 0) return MEMORIES;

  const cleaned = raw
    .filter((m): m is Record<string, unknown> => !!m && typeof m === 'object')
    .map((m, i) => ({
      id: typeof m.id === 'string' && m.id ? m.id : `memory-${i}`,
      photo: typeof m.photo === 'string' && m.photo ? m.photo : undefined,
      caption: typeof m.caption === 'string' ? m.caption : '',
      memory: typeof m.memory === 'string' ? m.memory : '',
      tint: typeof m.tint === 'number' ? m.tint : i,
    }))
    // A card with no memory on the back is a card with no reason to flip.
    .filter((m) => m.memory.length > 0);

  return cleaned.length > 0 ? cleaned : MEMORIES;
}
