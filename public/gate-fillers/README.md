# Gate filler photos

The wrong squares in the captcha gate's photo grid — the ones the recipient must
_not_ tap. Drop image files in this folder and point `PUPPIES` / `KITTENS` in
`src/gifts/shared/captcha-gate.tsx` at them.

```
public/gate-fillers/puppy-porch.jpg   →   filler('puppy-porch.jpg')
```

This folder is **not** gitignored, so anything here commits and deploys.

## What a filler has to be

Two of these are correctness rules, not taste:

1. **Nobody in it.** Not a face, not a hand holding the animal. The puzzle is
   "find the humans who are us" — a stranger who isn't the deliberate trap makes
   the grid unanswerable.
2. **One file, one picture.** Each tile paints its photo twice (the zoomed crop,
   and the full frame that replaces it on a correct tap). A URL that returns a
   different image each time puts two different pictures in one square.
3. **Close and soft.** A distant animal reads as scenery; a close one reads as
   "aww", which is the whole job.

## Size

Square-ish and at least 600×600. The grid crops with `object-fit: cover` and
then zooms 2–4× into a focal point, so anything smaller turns to mush at the
tightest crop. Landscape shots work — they get cropped to square — but the
subject needs to be near the middle.

## The trap is separate

The one lookalike-person tile is `LOOKALIKE_TRAP`, not a filler. It lives in the
same file and is meant to be recast for the couple in question.
