# Gate filler photos

The **wrong** squares in the captcha gate's photo grid — the ones the recipient
must _not_ tap. Drop image files in this folder and point `OURS` (or `SPARES`)
in `src/gifts/shared/captcha-gate.tsx` at them.

```
public/gate-fillers/couple-hug-awning.jpg   →   filler('couple-hug-awning.jpg')
```

This folder is **not** gitignored, so anything here commits and deploys.

## What's in here

| File                      | Role                     |
| ------------------------- | ------------------------ |
| `couple-hug-awning.jpg`   | dealt                    |
| `couple-twirl-sunset.jpg` | dealt                    |
| `couple-carlights.jpg`    | dealt                    |
| `couple-smiley-hands.jpg` | dealt                    |
| `dog-flower-ear.jpg`      | dealt — the fifth filler |
| `kitten-stickers.jpg`     | reserve                  |
| `penguin-tulips.jpg`      | reserve                  |
| `bunny-flower-crown.jpg`  | reserve                  |
| `capybara-rose.jpg`       | reserve                  |

A normal grid is 9 tiles: 4 of the couple's own photos + **5 fillers**, taken
from the top of `DEFAULT_FILLERS`. Reserve is only reached when a gift supplies
fewer than 4 photos of its own. Add a fifth couple photo to `OURS` and the
retriever drops out of the dealt five on its own.

## What a filler has to be

1. **Not identifiable.** People are fine — that's what makes the grid a
   recognition test rather than "tap the humans". A legible, front-facing
   stranger is not fine: backs, silhouettes, motion blur, hidden faces. A
   stranger looking out of somebody's love letter reads as an intrusion, and
   five rounds of trying to cast around that failed.
2. **One file, one picture.** Each tile paints its photo twice — the zoomed
   crop, and the full frame that replaces it on a correct tap. A URL that
   returns something different each time puts two pictures in one square.
3. **Same medium as the couple's own.** Real photographs, warm light, casual
   framing. A filler that's an obviously different _kind_ of image — stock
   portrait, drawing, studio backdrop — gets eliminated by texture before
   anyone looks at a face, and the puzzle is over.

## Filenames

Keep them lowercase, hyphenated, ASCII, with a real extension. Spaces, emoji,
curly apostrophes and missing extensions all work on a local dev server and are
a coin-flip on a deploy — one file arrived here with no extension at all and
would have been served without an image MIME type.

## Size

Square-ish, at least 600×600. The grid crops with `object-fit: cover` then zooms
2–4× into a focal point, so smaller sources turn to mush at the tightest crop.
Portrait shots are fine — they get cropped to square — but the subject needs to
be near the middle, or set `focus: { x, y }` on that entry.

## The trap is separate

`LOOKALIKE_TRAP` is a single lookalike-person tile. It's defined and exported
but **not dealt**. Putting it back is one line into the head of
`DEFAULT_FILLERS`; the note above it explains what that costs.
