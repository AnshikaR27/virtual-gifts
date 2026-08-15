/**
 * One-shot: downscale the OUR_STORY wall's placeholder photos.
 *
 *   node scripts/resize-memory-photos.mjs
 *
 * WHY THIS EXISTS. The polaroids render about 150px wide at most, so even at a
 * 3× device pixel ratio a 450px image is plenty; the photos dropped into
 * /public/memories were straight off a phone at 4–9MB each, ~30MB for the set.
 * That is a slow first paint on mobile for pixels nobody can see.
 *
 * WHAT IT DOES. Fits every image inside MAX_EDGE without enlarging, re-encodes
 * as JPEG, and writes the result beside the original. PNG sources become .jpg —
 * these are photographs, and lossless PNG is the wrong container for them (an
 * 800px photo is ~1MB as PNG and ~90KB as JPEG). The source PNG is deleted only
 * after its JPEG has been written successfully.
 *
 * SAFE TO RE-RUN. An image already at or under MAX_EDGE that would not get
 * smaller is left completely alone, so a second run is a no-op rather than a
 * second generation of JPEG artefacts.
 *
 * NOT PART OF THE BUILD. Nothing imports this; it is run by hand when photos
 * are dropped in. Originals for the current set are in
 * ~/Downloads/memories-originals/.
 */

import { readdir, rename, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.join(process.cwd(), 'public', 'memories');
/** Longest edge, px. Generous: ~3× the largest rendered polaroid. */
const MAX_EDGE = 800;
const QUALITY = 82;

const kb = (n) => `${Math.round(n / 1024)}KB`;

const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f));
if (files.length === 0) {
  console.log('no images in public/memories — nothing to do');
  process.exit(0);
}

let before = 0;
let after = 0;

for (const file of files) {
  const src = path.join(DIR, file);
  const srcSize = (await stat(src)).size;
  before += srcSize;

  const meta = await sharp(src).metadata();
  const dstName = file.replace(/\.(png|jpe?g)$/i, '.jpg');
  const dst = path.join(DIR, dstName);

  // Already done. Checked BEFORE re-encoding, not after: a JPEG that is
  // already small and already within MAX_EDGE would still re-encode a little
  // smaller, so a size comparison alone would quietly stack a second
  // generation of artefacts on every run.
  if (
    dstName === file &&
    srcSize <= 300 * 1024 &&
    (meta.width ?? 0) <= MAX_EDGE &&
    (meta.height ?? 0) <= MAX_EDGE
  ) {
    after += srcSize;
    console.log(
      `  skip   ${file.padEnd(24)} ${String(meta.width).padStart(5)}×${String(meta.height).padEnd(5)} ${kb(srcSize)} (already small)`,
    );
    continue;
  }

  const buf = await sharp(src)
    // withoutEnlargement: a photo already smaller than MAX_EDGE keeps its size
    // rather than being upscaled into a blurry larger file.
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  // Never make a file worse.
  if (buf.length >= srcSize && dstName === file) {
    after += srcSize;
    console.log(
      `  keep   ${file.padEnd(24)} ${String(meta.width).padStart(5)}×${String(meta.height).padEnd(5)} ${kb(srcSize)} (re-encode was larger)`,
    );
    continue;
  }

  // Write to a temp file and move it into place, rather than writing straight
  // to `dst`. When the source is already a .jpg, dst === src, and Windows
  // fails the write with EINVAL because sharp still holds the source open.
  const tmp = `${dst}.tmp`;
  await sharp(buf).toFile(tmp);
  // Only now that the new file exists on disk is it safe to drop the source.
  if (dstName !== file) await unlink(src);
  await rename(tmp, dst);

  const dstSize = (await stat(dst)).size;
  after += dstSize;

  console.log(
    `  resize ${file.padEnd(24)} ${String(meta.width).padStart(5)}×${String(meta.height).padEnd(5)} ${kb(srcSize).padStart(7)} → ${dstName.padEnd(24)} ${kb(dstSize)}`,
  );
}

console.log(
  `\ntotal ${kb(before)} → ${kb(after)}  (${Math.round((1 - after / before) * 100)}% smaller)`,
);
