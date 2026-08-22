'use client';

/**
 * <CaptchaGate> — the second front door a gift can use, beside <PasscodeGate>.
 *
 * ONE FULL-PAGE SURFACE, walked through seven states. There is not a single
 * window, dialog or popup anywhere in this gate; everything happens on the page
 * itself, edge to edge.
 *
 *   buffering   a soft "loading… 🩷" beat
 *   glitch      it fails — the page comes apart in pastel, with cute motifs
 *               drifting through it. [ try again ]  [ details ]
 *   twist       it did not break, it is LOCKED TO A REAL HUMAN.
 *               ☐ I'm not a robot
 *   verifying   the box ticks with a little heart-pop, a heart loader bounces
 *   challenge   nine zoomed-in crops — find the ones that are you
 *   passed      green ✓ with a heart burst: you're not a robot, you're their
 *               person
 *   open        the gift
 *
 * ── THE QUESTION THE CHECKBOX ACTUALLY ANSWERS ─────────────────────────────
 * This is the thing that was wrong for several passes and is worth stating
 * plainly, because it is easy to break again by editing one line of copy.
 *
 * A tickbox that says "I'm not a robot" answers exactly one question: ARE YOU A
 * HUMAN. It cannot answer "are you the right person" — no checkbox can, and
 * asking that next to it makes the whole widget read as nonsense.
 *
 * So the two checks are split, and each one is asked by the control that can
 * actually answer it:
 *
 *   the setup + checkbox   →  are you a real human?      (I'm not a robot…)
 *   the photo grid         →  are you the RIGHT human?   (find us in the crops)
 *
 * THE LABEL CARRIES BOTH: "I'm not a robot — I'm the one". The first half is
 * the hook that earns an image challenge at all; the second half is what the
 * gift is about. They sit in one line rather than in two competing sentences,
 * which is what stops them contradicting each other.
 *
 * And only at the very end, once the grid has actually settled the second
 * question, does the punchline land: "not a robot. definitely their favorite
 * human." It is a payoff, not a question, and it works because nothing before
 * it claimed to have proved the second half already.
 *
 * ── IT FOLLOWS THE REAL RHYTHM ON PURPOSE ──────────────────────────────────
 * tick → spinner → grid → green tick is the exact sequence everyone has been
 * trained on by a thousand real CAPTCHAs, and the whole joke depends on that
 * muscle memory. Nothing is inserted into it — an earlier version put an "is
 * that you?" confirm inside the spinner beat, which was both redundant with the
 * grid and contradictory with the checkbox. The sequence is now untouched.
 *
 * THE GREEN TICK IS NOT DECORATION. It is the jolt of "I passed" that the
 * muscle memory is waiting for, and the gift arrives on the back of it.
 *
 * ── WHIMSICAL, EVEN WHEN IT IS BROKEN ──────────────────────────────────────
 * Soft lavender and pink throughout, including the failure. The glitch SHIMMERS
 * rather than flickers: the split oscillates gently instead of snapping, cute
 * pixel motifs drift through it, and the whole thing sparkles. It still reads
 * as broken — things tear and jolt — but as OUR kind of broken. Nobody should
 * ever wonder whether they have landed on the wrong site.
 *
 * ── NOBODY IS LEFT BELIEVING IT IS BROKEN ──────────────────────────────────
 * The lie is short and it is ALWAYS resolved by the machine, never left for the
 * recipient to work out. [try again] always advances — there is no path where
 * it fails twice — and the glitch auto-settles anyway, so someone who just
 * stares still gets there.
 *
 * ── THE GREETING POPUP IS SILENCED FOR THIS DOOR ───────────────────────────
 * app/layout.tsx fires a cheerful masala dialog on every receiver route about a
 * second and a half in — directly on top of the glitch. The gate calls
 * suppressWelcomePopup() while it is mounted; PASSCODE-GATED GIFTS ARE
 * UNAFFECTED and still get theirs.
 *
 * ── THE RECOGNITION MECHANIC ───────────────────────────────────────────────
 * Every tile is a random close-up — a zoom level and a point to zoom into — so
 * the answer is not "which square has a person in it" but "wait… that is us".
 * THE FILLERS ARE OTHER PEOPLE for exactly this reason: against landscapes the
 * puzzle solves itself from across the room.
 *
 * IT IS RANDOM BUT NOT RE-RANDOMISED. The zoom and the focal point come from a
 * hash of the image and its position, so they are fixed for a given tile
 * forever: identical on the server and the client, and unchanged when React
 * re-renders on every tap. A Math.random() here would reshuffle the crops under
 * the recipient's thumb mid-puzzle and make the game unplayable.
 *
 * ── THE REWARD ─────────────────────────────────────────────────────────────
 * Tapping one of theirs correctly is answered immediately: the crop pulls back
 * and the WHOLE photograph fades in underneath it, held for REVEAL_MS before
 * the tick lands. It is why the cropped and the full image are two stacked
 * elements rather than one element changing `object-fit` — you cannot
 * transition `object-fit`, and cross-fading two layers is the only way the
 * pull-back reads as smooth.
 *
 * Wrong taps cost nothing but a line of text. There is no fail state in the
 * game either: no lockout, no score, no way to be sent backwards.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { suppressWelcomePopup } from '@/components/welcome-popup';
import { playGlitch } from '@/components/retro-sounds';

// ── THE COPY. EDIT HERE. ───────────────────────────────────────────────────
/**
 * THE BUFFER. Imitating the couple of seconds before a page appears, sweetly.
 */
export const BUFFERING = {
  label: 'loading…',
  /** Swapped in near the end, the way a slow page starts apologising. */
  slow: 'still loading…',
  heart: '🩷',
} as const;

/**
 * THE GLITCH — plain English, on the page, no box.
 *
 * Every line is something a normal person has actually seen on a screen. No
 * error codes, no hex, no "exception". The moment this sounds technical it
 * stops being a thing that happened to them and becomes decoration.
 *
 * `face` and `heart` are the tone shift: a shy pixel face and a cracked heart
 * where a warning triangle would be.
 */
export const GLITCH = {
  face: '✕ ᴗ ✕',
  heart: '💔',
  headline: 'something went wrong…',
  body: "this page isn't loading right.",
  tryAgain: 'try again',
  details: 'details',
  detailsLines: [
    "we couldn't confirm you're a real person.",
    'this gift only opens for one specific human.',
  ],
  /** Texture for the tear bars. Never meant to be read as language. */
  noise: '♡ ✦ ░ ▒ ♡ ✧ ▒ ░ ✦ ♡',
} as const;

/** Pixel-ish motifs drifting through the broken screen. */
export const GLITCH_MOTIFS = ['💔', '✕_✕', '★', '♡', '✦', '☁', '♡'] as const;

/** The little hearts that pop out of the checkbox and the green tick. */
export const BURST = ['♡', '✦', '♡', '✧', '♡', '✦'] as const;

export interface GateTwist {
  /** The reveal. Say it did not break — it refused. */
  headline: string;
  /**
   * THE SETUP FOR THE CHECKBOX, and it must ask about being a HUMAN. See the
   * note at the top of this file: the tickbox cannot answer "are you the right
   * person", so this must never ask that. The grid asks that, afterwards.
   */
  body: string;
}

/**
 * THE TWIST. One is drawn at random per load.
 *
 * They should all visibly CHANGE THEIR MIND — the recipient has just been told
 * something is broken, and this is the copy discovering that it is not. There
 * is no button here on purpose: the checkbox underneath is the action, exactly
 * as it is on a real widget.
 */
export const GATE_TWISTS: GateTwist[] = [
  {
    headline: "it's not broken.",
    body: "it just doesn't open for everyone — only for one very specific human. their favorite one, actually.",
  },
];

/** Everything the captcha itself says. */
export const CAPTCHA_GATE_COPY = {
  /**
   * THE HOOK AND THE MEANING, IN ONE LABEL. "I'm not a robot" is what earns the
   * image challenge — a tickbox can only ever claim humanity, and without that
   * claim a grid of photographs makes no sense. "I'm the one" is what the gift
   * is actually about. Keeping both in the same line is what lets the two live
   * together without contradicting each other.
   */
  checkbox: "I'm not a robot — I'm the one",
  tickHint: 'tick the box to prove it',
  verifying: 'verifying…',

  /**
   * The line above the prompt. The taunt does the work the old sub-line did, so
   * there is no sub-line: an empty `hint` renders nothing at all rather than an
   * empty row. The prompt itself now comes from GRID_PROMPTS.
   */
  taunt: "a stranger couldn't do this.",
  hint: '',
  verify: 'verify',

  /** The little print nobody reads on a real widget. Ours has a heart. */
  badge: 'reCAPTCHA',
  badgeSub: 'Privacy · Terms',

  /**
   * THE PUNCHLINE, and the only place the two checks are allowed to meet. It
   * lands as a statement because everything before it asked only what it could
   * actually answer.
   */
  passedLabel: 'verified',
  passedHead: '✓ not a robot.',
  passedBody: "definitely their favorite human. it's you 🩷",
} as const;

/**
 * NOBODY EVER FAILS. Cycled in order rather than picked at random, so someone
 * tapping around sees variety instead of the same line twice.
 */
export const CAPTCHA_GATE_NUDGES = {
  filler: [
    "that's not us — try again.",
    'nope. strangers.',
    'not us. keep looking.',
    'lovely people. not ours.',
  ],
  empty: ['select at least one.', 'we are in there somewhere.'],
  incomplete: ['there are more of us in there.', "you've missed one."],
} as const;

/**
 * THE STRANGERS — and they are NEAR-MISSES, on purpose.
 *
 * This set has been chosen twice over. First it stopped being landscapes and
 * coffee cups, which made the puzzle solvable without looking: any square with
 * a human in it was the answer. Then it stopped being ANY seven faces, which
 * had the same flaw one level up — a grid of assorted strangers means the
 * couple is the only warm casual snapshot among stock portraits, and the eye
 * finds them by texture before it has looked at a single face.
 *
 * SO THESE ARE PICKED TO BE CONFUSABLE. Young adults, dark hair, colour rather
 * than black-and-white, warm indoor-ish light, casual framing, no suits, no
 * hats, no props, nobody visibly older or younger than the couple. The question
 * has to be "which of these is actually them", not "which of these is a
 * photograph rather than a headshot". Recognition is the mechanic, and a
 * challenge that can be won without recognising anyone is not one.
 *
 * WHAT WOULD BREAK IT AGAIN: anything with a strong tell. One black-and-white
 * frame, one studio backdrop, one obviously different age bracket, and that
 * square is eliminated across the room. Match the couple's look when you swap
 * these — that IS the difficulty setting.
 *
 * PLACEHOLDER SOURCE. i.pravatar.cc serves stable royalty-free portraits by
 * numeric id — seeded, so the same nine squares come back every load and the
 * grid never reshuffles on hydration. SWAP FOR A LICENSED SET before this ships
 * to anyone real; a placeholder avatar service is not a content licence, and
 * this file now depends on WHICH faces come back, not merely that some do.
 *
 * TASTE RULE, UNCHANGED: nothing that could read as a comment on the recipient.
 * Similar is the goal; a caricature of either of them is not.
 */
/*
 * ── THE FILLER: SOFT THINGS, AND ONE PERSON ────────────────────────────────
 *
 * FOURTH POSITION, AND THE HISTORY MATTERS BECAUSE THREE OF THEM WERE TRIED
 * AND FELT WRONG IN FRONT OF REAL EYES:
 *
 *   1. NINE CROPPED STRANGERS at 3-4x, cast blind. A lineup. Creepy.
 *   2. MOSTLY CARTOONS. Fixed the creepiness by deleting the faces, and broke
 *      the grid in half: drawings sitting among photographs read as two
 *      different screens spliced together.
 *   3. NINE SOFT FACES. Consistent and warm, every face smiling — and STILL
 *      creepy, which is the finding that produced this version. Nine strangers
 *      looking out of a love letter is unsettling because of the NUMBER of
 *      them, not because of their expressions. Softening each face did not fix
 *      a problem that lives in the count.
 *
 *   4. FOUR SOFT PHOTOGRAPHS AND ONE PERSON. A single well-cast lookalike
 *      carried the whole recognition test while the other four squares stayed
 *      pretty and harmless. It was the best VERSION OF THE PUZZLE this file
 *      reached.
 *
 *   5. NO STRANGERS AT ALL — here. Five soft photographs, four of theirs.
 *
 * WHY (5) REPLACED (4), AND IT IS NOT BECAUSE (4) WAS BADLY MADE. The trap was
 * cast by eye, smiling, warmly lit, aimed to keep its mouth in frame, and
 * cropped exactly like the couple's own squares. It still read as an unsettling
 * stranger sitting in the middle of a love letter. Five rounds of casting and
 * cropping did not move that, which is the finding: on a gift, ONE unknown face
 * among your own is not a difficulty setting, it is an intrusion. The feeling
 * is the product here and it outranks the puzzle.
 *
 * ── WHAT THIS COSTS, STATED PLAINLY SO IT IS NEVER LOST BY ACCIDENT ────────
 *
 * THE "ONLY YOU" TEST IS GONE. Every face in the grid is now one of theirs, so
 * "tap the squares with people in them" is a complete solution. A stranger who
 * has never met this couple passes on the first try. The grid asks "which of
 * these are photographs of people" instead of "which of these people are
 * yours", and only the second question needed recognition.
 *
 * WHAT IT DOES NOT COST IS ANY ACTUAL SECURITY, because there was never any.
 * tapTile REJECTS a wrong tap rather than recording it — the tile shakes, a
 * nudge appears, and the recipient tries again with no penalty and no limit. A
 * stranger could always brute-force the four correct squares in a few taps;
 * the trap made that take longer and feel wrong, it never made it fail. So this
 * change alters what the gate ASKS, not what it ENFORCES.
 *
 * IF THE CHALLENGE IS EVER WANTED BACK it needs BOTH halves, and putting only
 * one back is worse than neither: LOOKALIKE_TRAP spread into the head of the
 * array below, AND tapTile changed so a wrong tap is recorded and verify can
 * reject the set. A trap that forgives you is theatre.
 *
 * CASTING THE SOFT FIVE: pretty, warm, calm, and unmistakably not a person.
 * Real photographs, so they sit in the same medium as the couple's own squares.
 * Avoid anything with a figure in it however small — a silhouette on a beach
 * puts a stranger back in the grid by the back door, which is the entire thing
 * this version exists to prevent.
 *
 * PLACEHOLDER SOURCES. picsum.photos and i.pravatar.cc both serve stable
 * royalty-free images by numeric id - seeded, so the same squares come back
 * every load and the grid never reshuffles on hydration. SWAP BOTH FOR A
 * LICENSED SET before this ships to anyone real; a placeholder service is not
 * a content licence, and this file depends on WHICH images come back, not
 * merely that some do.
 *
 * ORDER MATTERS. buildGateGrid fills the grid with take(fillers, n, 0), which
 * WALKS from index 0 rather than sampling - so the first five are what get
 * dealt at the shipping shape (nine squares, four of them theirs). The trap is
 * FIRST so it is guaranteed to be dealt; move it and a grid can come out with
 * no question in it at all. Everything past index 4 is reserve, for gifts that
 * supply fewer photographs of their own.
 */

/**
 * How far the soft squares pull back out of the standard crop.
 *
 * IT BREAKS THE "EVERY SQUARE THE SAME KIND OF CROP" RULE ON PURPOSE, and the
 * rule is worth restating before breaking it: a square framed unlike its
 * neighbours is a tell, and a tell is worth more to a guesser than any amount
 * of blur. That protects squares which are CANDIDATES. These are not - a tile
 * of flowers is out of the running the moment it is seen, at any zoom - so the
 * only thing the crop decides here is whether the photograph is pretty, and a
 * pretty photograph cropped to a fifth of itself is an abstract smear.
 *
 * The trap does NOT carry this. It is a candidate, so it stays on the same
 * crop as the couple's own squares.
 *
 * Stays above 1/ZOOM_MIN: 0.62 x 1.85 = 1.15, and the crop layer uses
 * object-fit cover, which fills the tile at 1. Anything multiplying out below
 * 1 would leave a gap at the edge of the square.
 */
const SOFT_TIGHTEN = 0.62;

/*
 * FOR A PHOTOGRAPH THAT IS ALREADY A CLOSE-UP.
 *
 * SOFT_TIGHTEN assumes a normal snapshot with room around the subject. A photo
 * shot nose-to-the-lens has no such room, so the same multiplier crops it to an
 * abstract patch of fur - the tile stops reading as "a kitten" and starts
 * reading as a texture, which is the one thing a filler must not do (it has to
 * be dismissable at a glance).
 *
 * This is the same idea as the trap's own tighten: match the APPARENT framing
 * of the other squares, not their zoom number.
 *
 * 0.56 AND NOT A POINT LOWER, AND THE FLOOR IS ARITHMETIC RATHER THAN TASTE.
 * SOFT_TIGHTEN's note states the invariant: a tighten must keep zoom x tighten
 * ABOVE 1, because the crop layer fills the tile with object-fit cover at
 * exactly 1 and anything below that leaves bare card showing at the edges of
 * the square. The floor is 1 / ZOOM_MIN = 1 / 1.85 = 0.541.
 *
 * This was first set to 0.42, which multiplies out to 0.78 - and the kitten
 * tile duly rendered as a letterboxed photograph floating on cream instead of
 * a filled square. 0.56 x 1.85 = 1.036, which clears the floor with just enough
 * margin to be safe at the shallowest roll.
 */
const FILLER_TIGHTEN_CLOSE = 0.56;

/*
 * -- WHERE THE PLACEHOLDER ANIMALS COME FROM -------------------------------
 *
 * TWO SERVICES, AND THE SPLIT IS NOT ARBITRARY. picsum is a fixed catalogue of
 * Unsplash photographs addressed by number, so an id is stable forever - but it
 * has essentially no domestic cats in it (three sweeps of ~100 ids each turned
 * up a leopard, a tiger and a lion, and no kittens). cataas is a catalogue of
 * nothing but cats, also addressed by a stable id. So: dogs from one, cats from
 * the other.
 *
 * A THIRD SERVICE WAS TRIED AND REJECTED, and the reason matters more than the
 * service does. loremflickr resolves a TAG rather than an id - /puppy, /kitten
 * - which looks ideal until you see what comes back: of twelve fetched,
 * "kitten" returned a tiger cub and a woman singing into a microphone, and
 * "puppy" returned a man holding a dog. A FILLER WITH A PERSON IN IT BREAKS THE
 * CHALLENGE, not just the mood - the whole puzzle is "find the humans who are
 * us", and a stranger's face that is not the trap makes the grid unanswerable.
 * Every id below has been looked at.
 */
const picsum = (id: number) => `https://picsum.photos/id/${id}/600/600`;
const cataas = (id: string) =>
  `https://cataas.com/cat/${id}?width=600&height=600`;

/*
 * -- REAL FILES, WHEN THERE ARE REAL FILES ---------------------------------
 *
 * Drop images in public/gate-fillers/ and address them through here. Same
 * shape as our-story's own `photo()` helper (gifts/our-story/memories.ts),
 * which is how every real photograph in this app is already referenced:
 *
 *   public/gate-fillers/puppy-porch.jpg   ->   filler('puppy-porch.jpg')
 *
 * public/gate-fillers/ is NOT gitignored, so anything put there commits and
 * deploys. That is worth stating because it is not true of every folder under
 * public/ - /public/fonts/ and most of /public/stickers/doodles/ are ignored,
 * and a file that renders locally but 404s on Vercel is the failure that rule
 * exists to prevent. See public/gate-fillers/README.md.
 */
const filler = (file: string) => `/gate-fillers/${file}`;

/*
 * -- THE FILLER DECK. THIS IS THE BLOCK TO EDIT. ---------------------------
 *
 * The wrong squares: the ones the recipient must NOT tap. Five real files now
 * live in public/gate-fillers/ and are dealt first; the remote placeholders
 * below them are a tail, kept only so the grid can always fill nine squares
 * (see the note on DEFAULT_FILLERS for when that matters).
 *
 * WHAT A REPLACEMENT HAS TO BE, because two of these are correctness rules
 * rather than taste:
 *   1. NOBODY IN IT. Not a face, not a hand holding the animal. The puzzle is
 *      "find the humans who are us", so a stranger who is not the deliberate
 *      trap makes the grid literally unanswerable.
 *   2. STABLE. The same URL must return the same picture every time - each
 *      tile paints its photograph TWICE (the zoomed crop, and the full frame
 *      that replaces it on a correct tap), so a randomising URL would put two
 *      different animals in one square.
 *   3. CLOSE AND SOFT. A distant animal reads as scenery; a close one reads as
 *      "aww", which is the whole job.
 *
 * Swapping one is one line, and the two forms sit side by side happily:
 *
 *   dogFlower: filler('dog-flower-ear.jpg'),  // a real file
 *   pugInBlush: picsum(1062),                 // a remote placeholder
 *
 * Nothing downstream cares which it is. DEFAULT_FILLERS reads these BY NAME,
 * so the alt text, the focus point and the deal order stay put when a URL
 * changes.
 */
const OURS = {
  kitten: filler('kitten-stickers.jpg'), // white kitten, nose to the lens
  dogFlower: filler('dog-flower-ear.jpg'), // golden retriever, flower on one ear
  penguin: filler('penguin-tulips.jpg'), // chick holding a bunch of tulips
  bunny: filler('bunny-flower-crown.jpg'), // lop rabbit wearing a pink bloom
  capybara: filler('capybara-rose.jpg'), // capybara standing up with one rose
};

/*
 * THE TAIL. Not dealt into a normal grid - see DEFAULT_FILLERS - and kept only
 * so a gift that supplies one or two photographs of its own can still fill all
 * nine squares. Delete these once there are eight files in public/gate-fillers/.
 */
const SPARES = {
  blackLab: picsum(237), // black lab pup on a wooden floor, head down
  pugInBlush: picsum(1062), // pug swaddled in a blush blanket, half asleep
  tuxedoKitten: cataas('AbOAHgaV6eqUQZfL'), // tuxedo kitten on a blanket
};

/**
 * THE TRAP. DEFINED, EXPORTED, AND NOT DEALT.
 *
 * A face close enough to the couple's own look to be mistaken for one of them:
 * glasses, a beard, mid-twenties, an easy closed-mouth smile.
 *
 * IT HAS BEEN IN AND OUT OF THE DECK TWICE NOW, AND BOTH DIRECTIONS WERE
 * DECIDED ON THE SAME GROUND, WHICH IS WHY THE WHOLE ARGUMENT IS KEPT HERE.
 *
 *   OUT, the first time: a stranger's face in the middle of a love letter read
 *        as unsettling, however warmly it was cast or however gently it was
 *        cropped.
 *   IN:  it is the only square that makes this a RECOGNITION test. Without it,
 *        "select all squares where we're happy" is answerable by anyone who can
 *        tell a person from a rabbit.
 *   OUT, and this is where it rests: NO HUMAN FILLERS. Every wrong square is an
 *        animal, and the one human face that is not the couple is gone.
 *
 * SO THE PUZZLE IS NOW EASY ON PURPOSE, AND THAT IS THE TRADE. Anyone can solve
 * this grid. What it still does is ask the recipient to look at four
 * photographs of themselves and pick them out of a page of soft animals, and on
 * a gift that beat the harder version - the difficulty was never what the
 * screen was for. The gate's real check is the checkbox step; this is the part
 * that is supposed to be lovely.
 *
 * PUTTING IT BACK IS STILL ONE LINE: spread LOOKALIKE_TRAP into the HEAD of
 * DEFAULT_FILLERS - the head specifically, since take() walks from index 0 and
 * only position 0 guarantees it is dealt into every grid.
 *
 * If it does go back, RECAST IT for the couple in question. A trap that
 * resembles nobody is just a stranger, which is the worst of both versions.
 */
export const LOOKALIKE_TRAP: GatePhoto = {
  src: 'https://i.pravatar.cc/500?img=59',
  alt: 'Someone smiling',
  // The aim point sits low, at 47 rather than the 40 the old strangers used:
  // at this zoom an anchor on the eyes crops the mouth clean off, and a face
  // reduced to a pair of eyes reads as a stare however warm the photograph was.
  focus: { x: 50, y: 47 },
  /*
   * A LITTLE LOOSER THAN THE COUPLE'S OWN CROP, WHICH IS THE OPPOSITE OF WHAT
   * THE RULE SAYS AND IS STILL RIGHT.
   *
   * The rule is that the trap is a CANDIDATE and must be framed exactly like
   * the squares it is competing with, or the framing gives it away before the
   * face does. That rule assumes the SOURCES are comparable. They are not: the
   * couple's photographs are half-body snapshots, and pravatar serves a tightly
   * cropped headshot to begin with. Applying the same zoom to both does not
   * produce the same picture - it produces four snapshots and one pair of eyes
   * filling a square, which is exactly the "unsettling stranger" this trap was
   * pulled from the deck for the first time round.
   *
   * 0.78 pulls back to head-and-shoulders, so it MATCHES THE COUPLE'S APPARENT
   * FRAMING rather than their zoom number. That is the thing the rule was
   * always about. If the trap is ever recast from a photograph shot like the
   * couple's, delete this line.
   */
  tighten: 0.78,
};

/*
 * -- THE DECK, IN DEAL ORDER -----------------------------------------------
 *
 * WHAT THIS USED TO BE, IN ORDER, BECAUSE EACH STEP FIXED THE LAST ONE:
 *   food + scenery     a plate of cookies, coffee on knitted wool, a mug on a
 *                      bed, plus a sky and some hills. Warm, nobody in them,
 *                      and the weakest squares on the screen.
 *   animals + scenery  the food went and three soft animals came in. Better,
 *                      and still half a landscape grid.
 *   stock baby animals stock puppies and kittens, all of it placeholder.
 *   THESE ONES         real files, chosen by hand. See public/gate-fillers/.
 *
 * EVERY WRONG SQUARE IS AN ANIMAL. There is no human face on this grid that is
 * not the couple's own - the lookalike trap is defined but no longer dealt, and
 * LOOKALIKE_TRAP carries the full argument for why it went.
 *
 * A FILLER IS NOT NEUTRAL FURNITURE, IT IS WHAT THE COUPLE IS BEING PICKED OUT
 * FROM. Nine squares are read in about a second, and whatever the wrong ones
 * are is what the screen is ABOUT for that second. Scenery makes it a travel
 * grid with two people somewhere in it. A kitten, a retriever with a flower on
 * its ear, a penguin holding tulips, a rabbit in a flower crown and a capybara
 * with a rose make it a grid of things nobody can look at without softening -
 * and the couple are then the squares that beat all of that, which is a much
 * better thing for the screen to be saying.
 *
 * THE ORDER IS THE DEAL ORDER, AND ONLY THE FIRST FIVE ENTRIES ARE NORMALLY
 * SEEN. take() walks from index 0, and a grid with the usual four photographs
 * of the couple needs five fillers - which is exactly the five real files in
 * public/gate-fillers/. Everything after that is reserve, reached only when the
 * gift supplies fewer than four photos of its own: a one-photo gift needs eight
 * fillers, which is why the deck is eight entries deep. It has to be - take()
 * clamps to the pool length, so a short deck renders a SHORT GRID rather than
 * an error.
 */
export const DEFAULT_FILLERS: GatePhoto[] = [
  // -- DEALT INTO EVERY GRID -- all five, now that the trap is not taking a
  // place. See LOOKALIKE_TRAP for the whole argument about the empty seat.
  {
    src: OURS.kitten,
    alt: 'A kitten',
    // Already a tight close-up before this crop touches it, so it is pulled
    // back harder than the rest - see FILLER_TIGHTEN_CLOSE.
    //
    // The aim is HIGH, at 34. On a macro shot the usual mid-frame anchor lands
    // on the muzzle and slices the eyes off at the top edge - and a face
    // without eyes stops reading as a face at all, which is the one thing this
    // square has to do in the half second it gets looked at.
    focus: { x: 50, y: 34 },
    tighten: FILLER_TIGHTEN_CLOSE,
  },
  {
    src: OURS.dogFlower,
    alt: 'A dog wearing a flower',
    focus: { x: 50, y: 44 },
    tighten: SOFT_TIGHTEN,
  },
  {
    src: OURS.penguin,
    alt: 'A baby penguin holding flowers',
    // The tallest of the five by a distance (675x1200), so the square crop
    // throws away most of the frame. The aim sits high, on the chick.
    focus: { x: 50, y: 40 },
    tighten: SOFT_TIGHTEN,
  },
  {
    src: OURS.bunny,
    alt: 'A rabbit wearing a flower',
    focus: { x: 50, y: 45 },
    tighten: SOFT_TIGHTEN,
  },

  {
    src: OURS.capybara,
    alt: 'A capybara holding a rose',
    focus: { x: 50, y: 46 },
    tighten: SOFT_TIGHTEN,
  },
  // -- RESERVE -- only reached when the gift supplies fewer than four photos.
  {
    src: SPARES.blackLab,
    alt: 'A puppy',
    focus: { x: 50, y: 44 },
    tighten: SOFT_TIGHTEN,
  },
  {
    src: SPARES.pugInBlush,
    alt: 'A very sleepy dog',
    focus: { x: 50, y: 50 },
    tighten: SOFT_TIGHTEN,
  },
  {
    src: SPARES.tuxedoKitten,
    alt: 'A little cat',
    focus: { x: 50, y: 46 },
    tighten: SOFT_TIGHTEN,
  },
];

export const GRID_PROMPTS: string[] = [
  "select all squares where we're happy",
  "select all squares where we're being cute",
  'select all squares where we look good together',
  "select all squares where we're smiling",
  "select all squares where we're having fun",
];

/** The little things drifting up across every state. */
export const SPARKLES = ['♡', '✦', '✧', '♡', '✦', '♡'] as const;

/** The sleepy face that bobs in the margins. Decorative; never announced. */
export const FLOATY_FACE = '✕_✕';

/**
 * THE DRIFT, AND IT IS ON EVERY SINGLE SCREEN.
 *
 * Pixel hearts, sparkles, stars and little clouds bobbing slowly in the
 * MARGINS — the one piece of decoration that never changes between states, so
 * the buffer, the failure, the checkbox, the grid and the payoff all read as
 * the same dreamy place.
 *
 * THEY ARE DRAWN, NOT TYPED. Everything here except the face is a CSS shape
 * (see cg-shape-*), because an emoji renders as a different picture on every
 * phone and this flow leans on them looking hand-made and pixel-ish.
 *
 * WHERE THEY ARE ALLOWED TO BE IS NOT A MATTER OF TASTE — see .cg-dreamies.
 * The layer is masked down to the two outer columns, so a floaty that drifts
 * inward fades out before it can ever sit under a word or a photograph. Adding
 * more here cannot break that; it can only make the margins busier, which is
 * its own reason to keep this list short.
 */
export const FLOATIES = [
  'heart',
  'sparkle',
  'cloud',
  'star',
  'heart',
  'face',
  'sparkle',
  'heart',
  'cloud',
  'star',
  'heart',
  'sparkle',
] as const;

/** The grid screen's own face: the broken screen's sleepy ✕_✕, finally happy. */
export const GRID_FACE = '♥‿♥';

/**
 * ── THE GRID SCREEN'S OWN MARGINS, AND THEY ARE THE SAME SHAPES ────────────
 *
 * SEVEN, WHERE THE OTHER SCREENS HAVE TWELVE. That is the entire difference in
 * quantity, and it is the whole point of this list: the grid is the only screen
 * in the gate carrying nine photographs, so it is the only one where the
 * margins have to stay out of the way of something. Same shapes, same palette,
 * same slow clocks — fewer of them, further apart.
 *
 * NOTHING NEW IS INVENTED HERE, AND ONE ATTEMPT AT INVENTING SOMETHING IS WHY
 * THAT IS WRITTEN DOWN. A previous pass gave this screen a set of its own
 * OBJECTS — little polaroids drifting up the edges, camera flashes popping in
 * the corners, strips of film bobbing in the gutters. Every one of them was
 * about photographs, which is what this screen is about, and the argument for
 * them was good.
 *
 * THEY READ AS CLUTTER. A polaroid is a detailed object: paper, a lip, a
 * picture inside it. At 14px in a margin it is not a charming little print, it
 * is a busy speck, and three different KINDS of busy speck beside a card that
 * is already holding nine photographs is a screen with two things competing to
 * be looked at. The soft shapes work in these margins precisely because they
 * are nearly nothing — a heart, a cloud, a star, a twinkle, read and forgotten
 * in the same glance.
 *
 * SO THE SIGNATURE IS ♥‿♥ AND NOTHING ELSE. One motif carries this screen's
 * identity, it is a rhyme rather than a new idea — the same pixel type, size
 * and margin as the broken screen's ✕_✕, finally cheerful — and it appears
 * exactly once. A signature that appears seven times is a pattern; one that
 * appears once is a signature.
 */
export const GRID_FLOATIES = [
  'star',
  'cloud',
  'heart',
  'face',
  'sparkle',
  'heart',
  'cloud',
] as const;

/**
 * The rising trails, four instead of six, and on the same path up the edges
 * that every other screen's drift takes. This is the gate's oldest gesture and
 * the grid keeps it — thinned, like everything else here.
 */
export const GRID_SPARKLES = ['✦', '♡', '✧', '♡'] as const;

/**
 * THE CONFETTI, for the one screen that has earned it.
 *
 * Deliberately more of them and deliberately mixed. Everywhere else in this
 * flow the decoration is a thread of two or three drifting hearts, so the only
 * way the payoff can feel like a payoff is for it to be the one moment that is
 * genuinely busy. It lasts under two seconds and never comes back.
 */
export const PASSED_CONFETTI = [
  '♡',
  '🩷',
  '✦',
  '♡',
  '✧',
  '🩷',
  '♡',
  '✦',
  '♡',
  '✧',
  '🩷',
  '♡',
  '✦',
  '♡',
] as const;

// ── TUNING ─────────────────────────────────────────────────────────────────
/** How long the page pretends to load. */
const BUFFER_MS = 1700;
const BUFFER_MS_REDUCED = 700;
/** When "loading…" becomes "still loading…". */
const BUFFER_SLOW_AT = 0.62;

/**
 * How long the glitch holds if nobody touches it. A SAFETY NET, not the design:
 * [try again] is right there and skips it. This exists so a recipient who
 * freezes is never stranded on a broken-looking page.
 */
const GLITCH_HOLD_MS = 2600;
const GLITCH_HOLD_MS_REDUCED = 1200;

/**
 * THE JOLT. How long the page spends coming apart before it hard-cuts to the
 * broken screen.
 *
 * SHORT ON PURPOSE. A crash is over before you have understood it, and that is
 * what makes it read as real rather than as an effect being performed at you.
 * Past about half a second the shudder stops being a shock and starts being a
 * transition, which is the thing it was brought in to replace. Every crash
 * animation is tuned to land inside this window, so changing this number means
 * changing them with it.
 *
 * There is no _REDUCED twin. Reduced motion does not get a shorter jolt, it
 * gets NO jolt: the phase is skipped outright and buffering cuts straight to
 * the broken screen. See the buffer effect.
 */
const CRASH_MS = 420;

/**
 * The spinner beat between the tick and the grid — the same length a real
 * widget takes. Nothing is inserted into it; see the note at the top.
 */
const VERIFYING_MS = 1300;
const VERIFYING_MS_REDUCED = 500;

/** How long the heart-pop and the success burst live before they clean up. */
const BURST_MS = 1000;

/**
 * How long the tile wave takes end to end: the last square's delay (4 x 38ms)
 * plus its own 340ms, rounded up. It exists so the arrival animation can be
 * taken OFF the tiles once it has played - see the note on cg-grid.is-arriving.
 *
 * It outlasts the 420ms slide, and that is fine: the wave is the GRID'S OWN
 * arrival, not part of the swap. The squares ride in with the panel and go on
 * settling for a beat after it has come to rest.
 *
 * NOTHING IN REACT TIMES THE SWAP ITSELF any more. There is no ghost to
 * unmount and no height to settle, so the slide's duration lives in one place
 * — the transform transition on .cg-pane — and nowhere else.
 */
const TILES_IN_MS = 500;

/**
 * HOW HARD THE PUZZLE IS.
 *
 * A MEDIUM CROP, AND THE REASON IT IS NOT TIGHTER IS THE WHOLE POINT.
 *
 * This used to be 3.0-4.0, where a square held a fragment rather than a face:
 * an eye and a cheekbone, a jaw, half a smile. It was a harder puzzle and it
 * was the wrong feeling — nine anonymous slivers of skin packed edge to edge
 * read as clinical and faintly uncanny, which is about as far from the rest of
 * this gate as it is possible to get. A gate that has spent four screens being
 * soft cannot ask its one real question through a surveillance grid.
 *
 * At 1.85-2.35 a square holds a HEAD, or a head and a shoulder: unmistakably a
 * person, recognisable with a beat of effort rather than at a glance. The
 * challenge survives — it is still a crop, still aimed, and still asks which of
 * these people is yours — it simply stops being creepy on the way.
 *
 * THIS RANGE IS ONLY SAFE BECAUSE THE CROP IS AIMED, and it is now safe by a
 * wider margin than the old one was. An earlier pass ran 2.0-2.9 with a
 * randomly placed focus and produced squares of hair and waterfall; the fix was
 * aiming the crop (see GatePhoto.focus), not zooming further in. Pulling back
 * from an aimed anchor only ever ADDS context around a face, so nothing here
 * can wander off a subject that 3.5x was already holding.
 *
 * If you tighten this again, look at nine of them together on a phone before
 * deciding it is fine — one crop in isolation never looks uncanny; a grid of
 * them does.
 */
const ZOOM_MIN = 1.85;
const ZOOM_MAX = 2.35;

/**
 * The fallback window, for photographs that have not told us where their
 * subject is. It stays deliberately narrow even though the medium crop is far
 * more forgiving than 3.5x was: a blind anchor is still a guess, and the point
 * of the window is to keep that guess near the middle of the frame where
 * subjects actually are. A gift that cares should supply focus points.
 */
const FOCUS_X = { min: 34, span: 32 };
const FOCUS_Y = { min: 26, span: 30 };

/**
 * How far an aimed crop is allowed to wander, in percent. Enough that nine
 * squares are not nine identical head-shots; small enough that the subject
 * never leaves the frame.
 */
const FOCUS_JITTER = 5;

/*
 * ── THERE IS NO TILT AND NO NUDGE ANY MORE, AND THIS IS WHY ────────────────
 *
 * Every tile used to be rotated by its own rolled angle and nudged off centre
 * by its own rolled pixels — TILE_TILT and TILE_NUDGE, ±1.8° and ±1.2px by the
 * end, dealt from the same seeded hash as the crop so a photograph landed in
 * the same place on every render. The point was that no two edges lined up,
 * which is what the eye reads as a person having placed the squares rather
 * than a table having laid them out. It worked, and the note that argued for
 * it was right about what it bought.
 *
 * IT WAS BUYING THE WRONG THING. This grid's whole joke is that it looks like
 * the real widget for the second before the prompt is read; the crooked
 * placement is the single strongest signal that it is NOT one. Real tiles are
 * a machine's grid — dead square, dead aligned, divided by a hairline. A hand
 * in the layout is a scrapbook, and a scrapbook cannot be mistaken for
 * reCAPTCHA even for a second.
 *
 * IT WAS ALSO WHAT MADE THE CHANNEL EXPENSIVE. Rotation grows a square's
 * bounding box by w x (cos θ + sin θ - 1), so tilted tiles needed a gutter
 * wide enough to swing in — 7px, and even then the tightest pair only cleared
 * by about a pixel. Straight tiles need exactly the divider and nothing else,
 * which is how the gap got down to 3px without anything touching.
 *
 * THE WARMTH DID NOT LIVE HERE. It lives in the photographs, the prompt, the
 * paper the card is made of and the whole drifting margin around it. Taking
 * the hand out of the LAYOUT is what lets the layout do its one job.
 */

/** How long the full photograph is held before the tick lands. */
const REVEAL_MS = 1000;
const REVEAL_MS_REDUCED = 400;

/** How long the green tick is admired before the gift takes the screen. */
const PASSED_MS = 1900;
const PASSED_MS_REDUCED = 600;

/** How long a nudge stays up. */
const NUDGE_MS = 1800;

/**
 * Nine squares, four of them theirs.
 *
 * Four rather than three because the answer set now mixes solo crops of each
 * of them with crops of the two-person photographs, and three slots cannot
 * hold that mix reliably - a deal could easily land as three of him and never
 * show her at all.
 */
const GRID_SIZE = 9;
const US_COUNT = 4;

export interface GatePhoto {
  src: string;
  alt: string;
  /**
   * WHERE THE SUBJECT IS, so the crop can be aimed at a person instead of
   * gambling. Omit it and the crop falls back to the blind window above.
   *
   * PERCENTAGES OF THE SQUARE, NOT OF THE PHOTOGRAPH. This is what the tile
   * actually shows, which is the photograph after object-fit cover has already
   * thrown away the overflowing edges - a portrait loses the top and bottom, a
   * landscape loses the sides. A face two-thirds of the way down a tall
   * photograph is NOT at 66 here.
   *
   * To convert: for a portrait, the visible band is the middle (width/height)
   * of the image, so a 600x800 shows imgY 12.5% to 87.5% and
   *   boxY = (imgY - 12.5) / 75 * 100
   * with x passing through untouched. For a landscape it is the same sum with
   * the axes swapped.
   *
   * ONE PHOTOGRAPH CAN APPEAR MORE THAN ONCE with different points. That is
   * how a picture of the two of them yields a square that is only him and a
   * square that is only her.
   */
  focus?: { x: number; y: number };
  /**
   * HOW MUCH TIGHTER THIS ONE NEEDS TO BE, as a multiplier on the rolled zoom.
   * Defaults to 1.
   *
   * A fixed zoom does not produce a fixed CROP, because a face fills a selfie
   * and occupies a twentieth of a full-length photograph. Left alone, the
   * wide shots come out as the only squares in the grid that are not a face -
   * which is a tell, and a tell is worth more to a guesser than any amount of
   * blur. This is the dial that makes every square the same KIND of crop.
   *
   * Roughly: how many times smaller is the face here than in a selfie.
   */
  tighten?: number;
}

interface Tile extends GatePhoto {
  isUs: boolean;
  /** Stable crop, derived from the image and the position. Never re-rolled. */
  zoom: number;
  focusX: number;
  focusY: number;
}

// ── DETERMINISTIC DEALING ──────────────────────────────────────────────────
/**
 * FNV-1a WITH A FINAL AVALANCHE → 0–1.
 *
 * THE FINALIZER IS NOT OPTIONAL AND THE REASON IS SUBTLE ENOUGH TO HAVE HIDDEN
 * A BUG IN THIS FILE FOR A LONG TIME.
 *
 * Plain FNV-1a ends on a multiply, so the LAST character it consumes barely
 * moves the result. Two seeds differing only in their final byte — `…-x` and
 * `…-y`, `…-dx` and `…-dy`, `…-1` and `…-2` — come out roughly 16777619 /
 * 2^32 apart, which is 0.0039 on this scale. Every call site here salts by
 * appending a suffix, so every pair of "independent" rolls taken from the same
 * key was in fact very nearly the SAME NUMBER.
 *
 * WHAT THAT ACTUALLY BROKE, all of it invisible until measured:
 *   - the tile nudge: dx and dy agreed to within 0.02px, so every tile was
 *     offset diagonally and never in any other direction. This is the one that
 *     exposed it — nine tiles reported dx exactly equal to dy. (That nudge has
 *     since gone with the tilt; the finalizer it uncovered protects everything
 *     below, which is why the story stays.)
 *   - the aimed crop's jitter: jx and jy likewise, so an aimed crop could only
 *     ever wander up-left or down-right, never across.
 *   - the blind crop's fallback: focusX and focusY were driven by ~the same
 *     roll, so an unaimed photograph could only ever be anchored somewhere on
 *     one diagonal of the focus window.
 *   - shuffle(): consecutive `${seed}-${i}` differ in their last character, so
 *     the Fisher–Yates draws were strongly correlated rather than independent.
 *
 * The murmur3 finalizer below mixes the high and low bits back through each
 * other, so a one-bit change anywhere in the seed changes about half the
 * output bits. Nothing at the call sites had to change.
 *
 * THIS CHANGES EVERY SEEDED VALUE IN THE GATE, deliberately: the deal, the
 * crops and the placement are all different from what this file produced
 * before, and all of them are more varied. It is still perfectly deterministic,
 * so the server and the client agree and a given gift looks the same forever.
 *
 * NOTE FOR THE MEMORY WALL: it carries its own copy of the un-finalized
 * version. Same latent flaw, same fix, not applied here because this file does
 * not own that one.
 */
function hash01(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

/** `count` items from a pool, walked rather than sampled so none repeat. */
function take<T>(pool: T[], count: number, offset: number): T[] {
  const n = Math.min(count, pool.length);
  return Array.from({ length: n }, (_, i) => pool[(offset + i) % pool.length]);
}

/** Keeps a jittered focus point inside the tile. */
function clampPct(n: number): number {
  return Math.min(100, Math.max(0, n));
}

/** Fisher–Yates driven by the seeded hash, so the deal is stable. */
function shuffle<T>(items: T[], seed: string): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(hash01(`${seed}-${i}`) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build the nine squares. Pure — same photos in, same grid and same crops out,
 * on the server and on every render.
 */
export function buildGateGrid(
  couple: GatePhoto[],
  fillers: GatePhoto[],
  seed: string,
): Tile[] {
  const usCount = Math.min(US_COUNT, couple.length, GRID_SIZE);
  const us = take(couple, usCount, 0).map((p) => ({ ...p, isUs: true }));
  const fill = take(fillers, GRID_SIZE - usCount, 0).map((p) => ({
    ...p,
    isUs: false,
  }));

  return shuffle([...us, ...fill], seed).map((tile, pos) => {
    const key = `${tile.src}-${tile.focus?.x ?? 'x'}-${pos}-${seed}`;
    // Aimed if the photograph said where to look, blind if it did not. The
    // jitter is signed, so it wanders both ways rather than always drifting
    // down and right.
    const jitter = (salt: string) =>
      (hash01(`${key}-${salt}`) * 2 - 1) * FOCUS_JITTER;
    return {
      ...tile,
      zoom:
        (ZOOM_MIN + hash01(`${key}-z`) * (ZOOM_MAX - ZOOM_MIN)) *
        (tile.tighten ?? 1),
      focusX: tile.focus
        ? clampPct(tile.focus.x + jitter('jx'))
        : FOCUS_X.min + hash01(`${key}-x`) * FOCUS_X.span,
      focusY: tile.focus
        ? clampPct(tile.focus.y + jitter('jy'))
        : FOCUS_Y.min + hash01(`${key}-y`) * FOCUS_Y.span,
    };
  });
}

type Phase =
  | 'buffering'
  /**
   * THE BREAK ITSELF, and it is its own phase for one reason: the shock has
   * to happen TO the loading screen. If the broken screen were already
   * mounted underneath the flashes, the recipient would be watching a broken
   * page get decorated. Here the "loading..." heart is still on screen while
   * everything comes apart around it, and only then does it cut.
   */
  | 'crash'
  | 'glitch'
  | 'twist'
  | 'verifying'
  | 'challenge'
  | 'passed'
  | 'open';

export interface CaptchaGateProps {
  /** The gift. Rendered only once the gate is open. */
  children: ReactNode;
  /** THE ANSWER KEY. The gift's own photographs — required; see the guard. */
  photos: GatePhoto[];
  /** The strangers. Defaults to DEFAULT_FILLERS. */
  fillers?: GatePhoto[];
  /** Skip straight to the gift. For preview routes, never for a recipient. */
  startOpen?: boolean;
  /** Fired when the round is verified. */
  onUnlock?: () => void;
  /** Fired when the gift is actually on screen. */
  onOpen?: () => void;
}

export function CaptchaGate({
  children,
  photos,
  fillers = DEFAULT_FILLERS,
  startOpen = false,
  onUnlock,
  onOpen,
}: CaptchaGateProps) {
  const [phase, setPhase] = useState<Phase>(startOpen ? 'open' : 'buffering');
  const [buffer, setBuffer] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  /** Little hearts popping out of the checkbox, just after it is ticked. */
  const [tickBurst, setTickBurst] = useState(false);
  /**
   * Which twist is shown. Chosen in an effect rather than during render: a
   * Math.random() in render would put one message in the server HTML and a
   * different one in the client's, which React reports as a mismatch.
   */
  const [twistIdx, setTwistIdx] = useState(0);
  /** Which challenge prompt this gift drew. Same reason as twistIdx. */
  const [promptIdx, setPromptIdx] = useState(0);
  /**
   * True only while the nine squares are flying in.
   *
   * WHY THIS IS A FLAG AND NOT JUST A RULE ON THE TILE. A wrong tap swaps the
   * tile's animation for the shake, and when the shake class comes off again
   * the browser sees a fresh animation-name and replays whatever is declared -
   * so an arrival animation living on .cg-tile would pop the square back in,
   *400ms after it was tapped, every single time. Hanging it on the grid for
   * one beat and then taking it away leaves the tiles with nothing to replay.
   */
  const [tilesArriving, setTilesArriving] = useState(false);
  /** Tapped correctly — the crop has pulled back to the full photograph. */
  const [selected, setSelected] = useState<Set<number>>(new Set());
  /** Finished the reveal beat — the tick has landed. */
  const [verified, setVerified] = useState<Set<number>>(new Set());
  const [nudge, setNudge] = useState<string | null>(null);
  const [shakeAt, setShakeAt] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const nudgeSeq = useRef(0);
  /** Reveal timers, so a gate that unmounts mid-beat cleans up after itself. */
  const revealTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const revealMs = reduced ? REVEAL_MS_REDUCED : REVEAL_MS;

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setTwistIdx(Math.floor(Math.random() * GATE_TWISTS.length));
    setPromptIdx(Math.floor(Math.random() * GRID_PROMPTS.length));
  }, []);

  /**
   * Silence the greeting dialog for as long as this door is on screen. The
   * cleanup restores it, so navigating from here to a passcode-gated gift gets
   * the popup back. See the note at the top of components/welcome-popup.tsx.
   */
  useEffect(() => suppressWelcomePopup(), []);

  /** THE BUFFER. Eased so it slows near the end, the way a real one does. */
  useEffect(() => {
    if (phase !== 'buffering') return;
    const total = reduced ? BUFFER_MS_REDUCED : BUFFER_MS;
    const tick = 40;
    let elapsed = 0;

    const id = setInterval(() => {
      elapsed += tick;
      const t = Math.min(1, elapsed / total);
      setBuffer(1 - Math.pow(1 - t, 2));
      if (elapsed >= total) {
        clearInterval(id);
        // The sound fires for everyone, reduced motion included: a preference
        // about MOVEMENT is not a preference about audio, and the buzz is the
        // half of the shock that costs those users nothing.
        playGlitch();
        // Reduced motion skips the jolt entirely and cuts to the broken page.
        setPhase(reduced ? 'glitch' : 'crash');
      }
    }, tick);

    return () => clearInterval(id);
  }, [phase, reduced]);

  /**
   * THE HARD CUT. The jolt runs for CRASH_MS and then the broken screen is
   * simply THERE — no fade, no slide, nothing eased.
   *
   * WHAT MAKES IT A CUT RATHER THAN A CROSSFADE IS IN THE STYLESHEET, NOT
   * HERE. .cg-page transitions its background over 620ms, so left alone this
   * swap would ease from the buffering lilac into the glitch orchid and the
   * whole point would be lost. .cg-is-crash therefore sits on the GLITCH
   * colour already, with its transitions off — by the time this timer fires
   * the page is the right colour and only the content changes.
   */
  useEffect(() => {
    if (phase !== 'crash') return;
    const t = setTimeout(() => setPhase('glitch'), CRASH_MS);
    return () => clearTimeout(t);
  }, [phase]);

  /**
   * THE SAFETY NET. The glitch settles itself if nobody touches it — except
   * while [details] is open, because someone reading the small print should not
   * have it yanked away mid-sentence.
   */
  useEffect(() => {
    if (phase !== 'glitch' || detailsOpen) return;
    const t = setTimeout(
      () => setPhase('twist'),
      reduced ? GLITCH_HOLD_MS_REDUCED : GLITCH_HOLD_MS,
    );
    return () => clearTimeout(t);
  }, [phase, detailsOpen, reduced]);

  /** Tick → spinner → grid. Nothing sits in between; see the note up top. */
  useEffect(() => {
    if (phase !== 'verifying') return;
    const t = setTimeout(
      () => {
        // Under reduced motion nothing animates, so the wave is skipped and
        // the grid is simply there. The step swap itself is instant too — see
        // the reduced-motion block at the foot of the stylesheet.
        if (!reduced) setTilesArriving(true);
        setPhase('challenge');
      },
      reduced ? VERIFYING_MS_REDUCED : VERIFYING_MS,
    );
    return () => clearTimeout(t);
  }, [phase, reduced]);

  /** Retire the tile wave once every square has landed. */
  useEffect(() => {
    if (!tilesArriving) return;
    const t = setTimeout(() => setTilesArriving(false), TILES_IN_MS);
    return () => clearTimeout(t);
  }, [tilesArriving]);

  useEffect(() => {
    if (!tickBurst) return;
    const t = setTimeout(() => setTickBurst(false), BURST_MS);
    return () => clearTimeout(t);
  }, [tickBurst]);

  const grid = useMemo(
    () => buildGateGrid(photos, fillers, 'gate'),
    [photos, fillers],
  );

  /**
   * Warm every image during the opening. Those few seconds are the only chance
   * the grid gets: nine images arriving one at a time would look like the
   * puzzle is broken, which after this opening is the last impression the gate
   * can afford to give.
   */
  useEffect(() => {
    grid.forEach((t) => {
      const el = new window.Image();
      el.src = t.src;
    });
  }, [grid]);

  useEffect(() => {
    const timers = revealTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (!nudge) return;
    const t = setTimeout(() => setNudge(null), NUDGE_MS);
    return () => clearTimeout(t);
  }, [nudge]);

  useEffect(() => {
    if (shakeAt === null) return;
    const t = setTimeout(() => setShakeAt(null), 400);
    return () => clearTimeout(t);
  }, [shakeAt]);

  const say = useCallback((pool: readonly string[]) => {
    nudgeSeq.current += 1;
    setNudge(pool[nudgeSeq.current % pool.length]);
  }, []);

  /** ALWAYS ADVANCES. There is no second failure anywhere in this flow. */
  const tryAgain = useCallback(() => setPhase('twist'), []);

  /** Ticking the box IS the action, exactly as it is on the real widget. */
  const tickBox = useCallback(() => {
    setNudge(null);
    setTickBurst(true);
    setPhase('verifying');
  }, []);

  const tapTile = useCallback(
    (pos: number, tile: Tile) => {
      if (!tile.isUs) {
        setShakeAt(pos);
        say(CAPTCHA_GATE_NUDGES.filler);
        return;
      }

      // A correct tap answers whatever the last nudge complained about.
      setNudge(null);

      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(pos)) {
          // Taking it back: drop the tick and cancel the pending reveal.
          next.delete(pos);
          setVerified((v) => {
            const nv = new Set(v);
            nv.delete(pos);
            return nv;
          });
          const t = revealTimers.current.get(pos);
          if (t) {
            clearTimeout(t);
            revealTimers.current.delete(pos);
          }
        } else {
          next.add(pos);
          // THE REWARD: the full photograph is already fading in via CSS. The
          // tick is held back until it has been seen.
          const t = setTimeout(() => {
            revealTimers.current.delete(pos);
            setVerified((v) => new Set(v).add(pos));
          }, revealMs);
          revealTimers.current.set(pos, t);
        }
        return next;
      });
    },
    [say, revealMs],
  );

  const verifyRound = useCallback(() => {
    const needed = grid.filter((t) => t.isUs).length;
    if (selected.size === 0) {
      say(CAPTCHA_GATE_NUDGES.empty);
      return;
    }
    if (selected.size < needed) {
      say(CAPTCHA_GATE_NUDGES.incomplete);
      return;
    }
    setNudge(null);
    setPhase('passed');
    onUnlock?.();
  }, [grid, selected, say, onUnlock]);

  /** The green tick is held, then the gift takes the screen. */
  useEffect(() => {
    if (phase !== 'passed') return;
    const t = setTimeout(
      () => {
        setPhase('open');
        onOpen?.();
      },
      reduced ? PASSED_MS_REDUCED : PASSED_MS,
    );
    return () => clearTimeout(t);
  }, [phase, reduced, onOpen]);

  /**
   * THE GUARD. The photographs ARE the puzzle — with none there is nothing to
   * recognise, and the gate would ask which of nine strangers is you. Better to
   * fail loudly in development than to ship that.
   */
  if (photos.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'CaptchaGate rendered with no photos. Pass the gift its own photographs, or use PasscodeGate instead.',
      );
    }
    return null;
  }

  if (phase === 'open') return <>{children}</>;

  const twist = GATE_TWISTS[twistIdx];
  /**
   * From the twist onward the message stays pinned at the top and only the
   * thing UNDER it changes — see .cg-stage. One container for all four phases
   * is what keeps the message from remounting and re-animating between them.
   */
  const inStage =
    phase === 'twist' ||
    phase === 'verifying' ||
    phase === 'challenge' ||
    phase === 'passed';
  /**
   * WHAT THE CHECKBOX STEP SHOWS WHILE IT IS SLIDING AWAY.
   *
   * The step is still on screen for the whole 420ms of the swap, so it cannot
   * be allowed to render a state that does not exist — 'challenge' would blank
   * both the tick and the label the instant the slide began, and the panel
   * would gut itself on the way out. It leaves in the state it was last in:
   * ticked, verifying, exactly as the recipient left it.
   */
  const boxPhase: Phase = phase === 'challenge' ? 'verifying' : phase;

  return (
    <div className={`cg-page cg-is-${phase}`}>
      <style dangerouslySetInnerHTML={{ __html: CAPTCHA_GATE_CSS }} />

      {/*
        THE GRID PAGE'S OWN GROUND, AND IT IS A SEPARATE LAYER FOR A REASON
        THAT IS ALREADY WRITTEN DOWN TWICE IN THIS FILE.

        .cg-page can only carry a SOLID colour, because it transitions its
        background over 620ms and gradients do not interpolate — the swap into
        the grid would jump in a single frame. .cg-bloom cannot carry it either:
        it transitions opacity only, for exactly the same reason.

        So the gradient rides on its own layer and FADES IN. It is painted below
        both of them (see .cg-gridwash), so the pink breath and the two dreaming
        blobs still cross it and the screen still belongs to the set.
      */}
      <div className="cg-gridwash" aria-hidden />

      {/* The warm wash. Dim while something is wrong, full once it resolves —
          the page blooms rather than cutting. */}
      <div className="cg-bloom" aria-hidden />

      {/* Two enormous soft blobs breathing behind everything. Pure background:
          it never has an edge sharp enough to read as an object, so nothing can
          ever look "covered" by it. */}
      <div className="cg-dream" aria-hidden />

      {/* Soft scanlines the whole way through; turned up during the glitch. */}
      <div className="cg-scan" aria-hidden />

      {/*
        THE MARGINS, AND ONLY THE MARGINS.

        Every drifting thing in this gate lives in here — on all five screens,
        so the thread never breaks — and the container is masked down to the two
        outer columns (see .cg-dreamies). That mask is the guardrail: it is not
        a promise that these are positioned carefully, it is a hard clip, so a
        floaty can never end up over a word, a face or the grid card however it
        drifts.

        TWO SETS, ONE LIT AT A TIME. The full set is four of the five screens;
        the grid gets a thinned one made of the same shapes — see GRID_FLOATIES.
        Both stay mounted and the swap is an opacity cross-fade, because
        unmounting one and mounting the other would change the entire background
        in a single frame at the exact moment the two panes slide past each
        other. It also keeps every motif on its own clock: a set that is
        remounted restarts from frame zero, and seven things starting together
        is the synchronised pulse the per-motif delays exist to prevent.
      */}
      <div
        className={`cg-dreamies${phase === 'challenge' ? ' is-grid' : ''}`}
        aria-hidden
      >
        <span className="cg-set cg-set-soft">
          {SPARKLES.map((s, i) => (
            <span key={`s${i}`} className={`cg-sparkle cg-sparkle-${i + 1}`}>
              {s}
            </span>
          ))}

          {FLOATIES.map((kind, i) => (
            <span
              key={`f${i}`}
              className={`cg-floaty cg-f-${i + 1} cg-shape-${kind}${
                kind === 'face' ? ' font-pixel' : ''
              }`}
            >
              {kind === 'face' ? FLOATY_FACE : null}
            </span>
          ))}
        </span>

        {/* The grid's thinner set. Same shape classes, same drift, fewer of
            them — and the one face is ♥‿♥ rather than ✕_✕. */}
        <span className="cg-set cg-set-grid">
          {GRID_SPARKLES.map((s, i) => (
            <span key={`gs${i}`} className={`cg-sparkle cg-gsp-${i + 1}`}>
              {s}
            </span>
          ))}

          {GRID_FLOATIES.map((kind, i) => (
            <span
              key={`g${i}`}
              className={`cg-floaty cg-g-${i + 1} cg-shape-${kind}${
                kind === 'face' ? ' cg-face-love font-pixel' : ''
              }`}
            >
              {kind === 'face' ? GRID_FACE : null}
            </span>
          ))}
        </span>

        {/* The broken screen gets a few more of them, drifting a little
            sleepier. Same masked margins as everything else. */}
        {phase === 'glitch'
          ? GLITCH_MOTIFS.map((m, i) => (
              <span key={`m${i}`} className={`cg-motif cg-motif-${i + 1}`}>
                {m}
              </span>
            ))
          : null}
      </div>

      {/* THE PAYOFF. A warm bloom of light, then a shower of hearts.
          BOTH SIT BEHIND THE CONTENT — the celebration happens around the line
          that is being celebrated, never on top of it. */}
      {phase === 'passed' ? (
        <>
          <div className="cg-warmglow" aria-hidden />
          <div className="cg-confetti" aria-hidden>
            {PASSED_CONFETTI.map((h, i) => (
              <span key={i} className={`cg-conf cg-conf-${i + 1}`}>
                {h}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {/*
        THE CRASH LAYER. Four things at once for CRASH_MS and then gone: a hard
        white flash, a red/cyan chromatic split, a burst of static, and three
        torn bands sliding out of alignment. It sits above everything (z-index
        20 against .cg-inner at 4) because a crash is not something happening
        BEHIND the page, it is the page failing.

        The shudder is not in here - it is on .cg-page itself, so the whole
        viewport moves rather than one layer inside a still frame.
      */}
      {phase === 'crash' ? (
        <div className="cg-crash" aria-hidden>
          <span className="cg-crash-flash" />
          <span className="cg-crash-rgb cg-crash-rgb-r" />
          <span className="cg-crash-rgb cg-crash-rgb-c" />
          <span className="cg-crash-static" />
          <span className="cg-crash-tear cg-crash-tear-1" />
          <span className="cg-crash-tear cg-crash-tear-2" />
          <span className="cg-crash-tear cg-crash-tear-3" />
        </div>
      ) : null}

      {/* Shimmering tear bars. Only while the page is broken. */}
      {phase === 'glitch' ? (
        <div className="cg-tears" aria-hidden>
          <span className="cg-tear cg-tear-1">{GLITCH.noise}</span>
          <span className="cg-tear cg-tear-2">{GLITCH.noise}</span>
          <span className="cg-tear cg-tear-3">{GLITCH.noise}</span>
        </div>
      ) : null}

      <div className="cg-inner">
        {phase === 'buffering' || phase === 'crash' ? (
          <div className="cg-buffer">
            {/* The halo lives on the wrapper rather than on the heart itself,
                so it can breathe on its own clock while the heart hops on
                hers. One element cannot run two conflicting transforms. */}
            <span className="cg-bounce-wrap" aria-hidden>
              <span className="cg-pxheart cg-bounce" />
            </span>
            <p className="cg-buffer-label font-pixel">
              {buffer >= BUFFER_SLOW_AT ? BUFFERING.slow : BUFFERING.label}
            </p>
            <span className="cg-dots" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          </div>
        ) : null}

        {phase === 'glitch' ? (
          <div className="cg-broke">
            <div className="cg-broke-art" aria-hidden>
              <span className="cg-broke-face font-pixel">{GLITCH.face}</span>

              {/*
                THE CRACKED HEART THAT MENDS. Two halves of one pixel heart,
                drifting apart and then finding each other again on a loop, with
                a sparkle at the seam the moment they meet.

                It is drawn rather than typed because the point is the MOTION of
                mending, and 💔 is a single glyph — one picture, unbreakable and
                unmendable. GLITCH.heart still rides along in the drifting
                motifs, so the emoji has not left the screen.
              */}
              <span className="cg-mend">
                <span className="cg-mend-half cg-mend-l">
                  <i className="cg-pxheart" />
                </span>
                <span className="cg-mend-half cg-mend-r">
                  <i className="cg-pxheart" />
                </span>
                <span className="cg-mend-spark">✦</span>
              </span>
            </div>

            <p className="cg-broke-head font-pixel">{GLITCH.headline}</p>
            <p className="cg-broke-body font-pixel">{GLITCH.body}</p>

            {detailsOpen ? (
              <div className="cg-details font-pixel">
                {GLITCH.detailsLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}

            <div className="cg-btnrow">
              <button
                type="button"
                className="cg-btn"
                onClick={() => setDetailsOpen((v) => !v)}
                aria-expanded={detailsOpen}
              >
                {GLITCH.details}
              </button>
              <button
                type="button"
                className="cg-btn cg-btn-love"
                onClick={tryAgain}
                autoFocus
              >
                {GLITCH.tryAgain}
              </button>
            </div>
          </div>
        ) : null}

        {inStage ? (
          <div className="cg-stage">
            {/*
              TWO STEPS, ONE BOX THAT NEVER CHANGES SIZE.

              THE BUG THIS LAYOUT EXISTS TO KILL. The page centres its content
              (.cg-page is a centred flex box). So when a ~250px checkbox step
              was swapped for a ~570px grid, the centred block's MIDPOINT moved
              and the browser re-centred the whole panel on the page. That
              reposition was the lurch — it was never the fade or the slide, it
              was the layout underneath them moving while they played.

              SO THE CONTAINER IS MADE UNABLE TO CHANGE SIZE. Both steps are
              mounted at all times, stacked in the same CSS grid cell, so
              .cg-steps is permanently as tall as the TALLER of the two — the
              grid — whichever step is on screen. Nothing about swapping steps
              can change that height, so the page never re-centres and there is
              nothing left to jump.

              AND THE SWAP IS A TRANSFORM AND NOTHING ELSE. The two panes are
              stretched to the container's height, so translateY(±100%) is
              exactly one step. No height animates, no measurement is taken,
              nothing reflows — the compositor moves two layers and that is the
              whole transition.

              WHAT THIS REPLACED: a crossfade with a ghost copy of the outgoing
              panel absolutely positioned off the centre line. The ghost only
              ever existed to paper over the resize; with the resize gone, so
              is it.
            */}
            <div className="cg-steps">
              {/*
                STEP ONE — THE SETUP AND THE CHECKBOX.

                It carries its own message: the setup is the reason the
                recipient is being asked for anything, so it travels with the
                box and leaves with it rather than sitting stacked over the
                photographs.

                boxPhase, not phase. On the way out this pane is still on
                screen, and if it re-rendered as "neither verifying nor passed"
                mid-flight the tick and the label would blank out while it
                slid. Freezing it at 'verifying' for the length of the
                challenge is what the old ghost copy was doing by hand.
              */}
              <div
                className={`cg-pane cg-pane-box${
                  phase === 'challenge' ? '' : ' is-showing'
                }`}
                aria-hidden={phase === 'challenge'}
              >
                {/*
                  THE EMPTY ROOM, FURNISHED. The container is grid-height, so
                  this short step floats in the middle of it with a lot of air
                  above and below. Four soft, slow shapes sit out in that air
                  so it reads as room left on purpose rather than a panel that
                  failed to fill its box. They are behind the content and clear
                  of it — see .cg-room.
                */}
                <span className="cg-room" aria-hidden>
                  <i className="cg-room-1">♥</i>
                  <i className="cg-room-2">✦</i>
                  <i className="cg-room-3">♡</i>
                  <i className="cg-room-4">✧</i>
                </span>

                {/*
                  is-intro and is-payoff give the panel a springier entrance on
                  the two screens where a spring is welcome. THE SWAP INTO THE
                  GRID DELIBERATELY GETS NEITHER: the slide is the whole
                  transition, and a bounce riding on top of it is a second
                  event where the point was to have one. The animation also
                  lives on this INNER element rather than on the pane, because
                  the pane's transform belongs to the slide and one element
                  cannot run two conflicting transforms.
                */}
                <div
                  className={`cg-lower${
                    boxPhase === 'twist' || boxPhase === 'verifying'
                      ? ' is-intro'
                      : ''
                  }${boxPhase === 'passed' ? ' is-payoff' : ''}`}
                  key={boxPhase === 'passed' ? 'payoff' : 'intro'}
                >
                  <div
                    className={`cg-msg${
                      boxPhase === 'passed' ? ' is-compact' : ''
                    }`}
                  >
                    {boxPhase === 'passed' ? (
                      <>
                        <p className="cg-msg-head cg-pass-head font-pixel">
                          {CAPTCHA_GATE_COPY.passedHead}
                        </p>
                        <p className="cg-msg-body font-pixel">
                          {CAPTCHA_GATE_COPY.passedBody}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="cg-msg-head font-pixel">
                          {twist.headline}
                        </p>
                        <p className="cg-msg-body font-pixel">{twist.body}</p>
                      </>
                    )}
                  </div>

                  <div className="cg-box">
                    {/* THE WIDGET. One element across three states: empty, a
                      bouncing heart while it "verifies", and the green tick a
                      real one gives you when you pass. */}
                    <div
                      className={`cg-widget${
                        boxPhase === 'passed' ? ' is-passed' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="cg-check"
                        onClick={tickBox}
                        disabled={boxPhase !== 'twist'}
                        aria-label={CAPTCHA_GATE_COPY.checkbox}
                        aria-checked={boxPhase !== 'twist'}
                        role="checkbox"
                      >
                        {boxPhase === 'verifying' ? (
                          <span
                            className={`cg-pxheart cg-mini${
                              reduced ? '' : ' cg-mini-hop'
                            }`}
                            aria-hidden
                          />
                        ) : null}
                        {boxPhase === 'passed' ? (
                          <span className="cg-check-green" aria-hidden>
                            ✓
                          </span>
                        ) : null}

                        {/* The heart-pop, on tick and on success. */}
                        {tickBurst || boxPhase === 'passed' ? (
                          <span className="cg-burst" aria-hidden>
                            {BURST.map((h, i) => (
                              <i key={i} className={`cg-burst-${i + 1}`}>
                                {h}
                              </i>
                            ))}
                          </span>
                        ) : null}
                      </button>

                      <span className="cg-check-label font-pixel">
                        {boxPhase === 'twist'
                          ? CAPTCHA_GATE_COPY.checkbox
                          : null}
                        {boxPhase === 'verifying'
                          ? CAPTCHA_GATE_COPY.verifying
                          : null}
                        {boxPhase === 'passed'
                          ? CAPTCHA_GATE_COPY.passedLabel
                          : null}
                      </span>

                      <span className="cg-badge font-pixel" aria-hidden>
                        <span className="cg-badge-mark">♥</span>
                        <span className="cg-badge-name">
                          {CAPTCHA_GATE_COPY.badge}
                        </span>
                        <span className="cg-badge-sub">
                          {CAPTCHA_GATE_COPY.badgeSub}
                        </span>
                      </span>
                    </div>

                    {boxPhase === 'twist' ? (
                      <p className="cg-hint font-pixel">
                        {CAPTCHA_GATE_COPY.tickHint}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/*
                STEP TWO — THE NINE SQUARES.

                Mounted from the moment the stage opens, waiting one step below
                the bottom edge of the container. THAT IS WHAT MAKES THE HEIGHT
                STABLE: the container is sized by the taller of the two panes,
                and the taller one has to be present to size it. It costs
                nothing — the photographs are already being preloaded during
                the buffer — and it is hidden from assistive tech and taken out
                of the tab order until it is the step being shown.
              */}
              <div
                className={`cg-pane cg-pane-grid${
                  phase === 'challenge' ? ' is-showing' : ''
                }`}
                aria-hidden={phase !== 'challenge'}
              >
                <div className="cg-lower">
                  <div className="cg-challenge">
                    <div className="cg-prompt">
                      {/*
                        NO DOODLE IN THE CORNER ANY MORE. A heart used to sit
                        in the band's margin, slowly beating, on the argument
                        that the header needed warming without touching the
                        type. The type never was the problem: this band is
                        supposed to read as a captcha at a glance, and a
                        pulsing heart in the corner of it is the fastest way to
                        stop it doing that. The two lines below are the header.
                      */}
                      <p className="cg-prompt-taunt font-pixel">
                        {CAPTCHA_GATE_COPY.taunt}
                      </p>
                      <p className="cg-prompt-text font-pixel">
                        {GRID_PROMPTS[promptIdx]}
                      </p>
                      {CAPTCHA_GATE_COPY.hint ? (
                        <p className="cg-prompt-sub font-pixel">
                          {CAPTCHA_GATE_COPY.hint}
                        </p>
                      ) : null}
                    </div>

                    <div className="cg-gridwrap">
                      <div
                        className={`cg-grid${tilesArriving ? ' is-arriving' : ''}`}
                        role="group"
                        aria-label={GRID_PROMPTS[promptIdx]}
                      >
                        {grid.map((tile, pos) => {
                          const isOn = selected.has(pos);
                          const isTicked = verified.has(pos);
                          return (
                            /*
                              THE CELL. It used to carry the tilt and the nudge
                              - a rotation on a wrapper rather than on the
                              button, because .cg-tile already animates
                              transform in four places (arrival, squish, lift,
                              shake) and transform is ONE property, so a
                              rotation declared beside them would survive
                              exactly until the tile was touched and then snap
                              straight. That reasoning was sound; the tilt it
                              protected is gone (see the note where TILE_TILT
                              used to be).

                              THE WRAPPER STAYS FOR THE OTHER REASON, WHICH WAS
                              NEVER ABOUT ROTATION. is-lifted sits here because
                              .cg-tile's own transforms create stacking
                              contexts, so a z-index on the button only sorts it
                              INSIDE this span - a chosen tile in the top row
                              would still slide under the row below. The cells
                              are what the cells stack against.
                            */
                            <span
                              key={pos}
                              className={`cg-cell${isOn ? ' is-lifted' : ''}`}
                            >
                              <button
                                type="button"
                                className={[
                                  'cg-tile',
                                  isOn ? 'is-open' : '',
                                  isTicked ? 'is-verified' : '',
                                  shakeAt === pos ? 'cg-shake' : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                // Diagonal stagger: the delay grows with row PLUS
                                // column, so the nine squares arrive as a wave from
                                // the top-left corner rather than row by row.
                                style={
                                  {
                                    '--d': `${(Math.floor(pos / 3) + (pos % 3)) * 38}ms`,
                                  } as CSSProperties
                                }
                                onClick={() => tapTile(pos, tile)}
                                aria-pressed={isOn}
                                aria-label={tile.alt}
                              >
                                {/*
                                  NO MOUNT. THE PHOTOGRAPH IS THE TILE.

                                  There was a <span className="cg-mount">
                                  around these two images for exactly one pass:
                                  an inset box, 5px on three sides and 11px
                                  along the bottom, clipping them into a
                                  polaroid lip. It existed because the inset had
                                  previously been declared on the images
                                  themselves, where the zoom walked straight out
                                  of it — .cg-crop is scaled 2-4x about a focal
                                  point and a transform does not respect the box
                                  it was laid out in, so the lip appeared on
                                  whichever sides the zoom happened not to reach.
                                  The wrapper fixed that properly.

                                  IT IS GONE BECAUSE THE POLAROID IS GONE. A
                                  real challenge tile is a photograph with a
                                  hairline of white beside it and nothing else -
                                  no border, no lip, no card. The separation
                                  that the mount was providing now comes from
                                  the 3px divider between tiles, which is what
                                  provides it in the real widget.

                                  THE CLIP STILL HAS TO EXIST, and it does:
                                  .cg-tile is overflow: hidden, so the zoomed
                                  crop is cut at the tile's own edge. That was
                                  never the bug — the bug was clipping at the
                                  tile edge while claiming a 5px margin.
                                */}
                                {/* THE CROP — what the puzzle actually shows. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={tile.src}
                                  alt=""
                                  className="cg-crop"
                                  style={
                                    {
                                      transform: `scale(${tile.zoom.toFixed(3)})`,
                                      transformOrigin: `${tile.focusX.toFixed(1)}% ${tile.focusY.toFixed(1)}%`,
                                    } as CSSProperties
                                  }
                                />
                                {/* THE REWARD — the whole photograph, over the crop. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={tile.src}
                                  alt=""
                                  className="cg-full"
                                />

                                {/*
                                THERE IS NO BURST HERE, AND THERE USED TO BE.

                                Six little hearts flew out of a square on every
                                correct tap - on top of a bloom, on top of a
                                bounce, on top of a ring, on top of a photograph
                                unfolding. Five things answering one tap is not
                                five times the delight. It is noise, and what it
                                buried was the only one of the five that was
                                actually a reward: the picture coming up.

                                The burst itself is not gone and is still used,
                                on the checkbox and on the green tick, where it
                                is the ONLY thing happening on the screen. See
                                the note on .cg-tile.is-open for the whole
                                argument about what a correct tap should say.
                              */}
                                <span className="cg-tick" aria-hidden>
                                  ✓
                                </span>
                              </button>
                            </span>
                          );
                        })}
                      </div>

                      {/*
                        THE CARD IS BARE ON PURPOSE, AND THIS IS THE NOTE THAT
                        HAS TO SURVIVE, BECAUSE WHAT WAS HERE WAS NOT BAD WORK.

                        Three layers used to sit on this card: four sparkles
                        pinned to the crossing points of the grid lines, six
                        hearts drifting along the channels, and three still
                        marks tucked into the paper's own corners. Every one of
                        them was carefully kept off the photographs - the 12px
                        gap exists partly so a heart had a channel to drift
                        along - and each one, described on its own, sounded like
                        charm.

                        THIRTEEN OF THEM AT ONCE IS NOT CHARM. This screen is
                        already carrying nine photographs, and nine photographs
                        is the most content anything in this gate holds by an
                        order of magnitude. The buffer holds one line. The break
                        holds a headline and two buttons. The checkbox holds a
                        checkbox. Those three read as calm and confident because
                        each is ONE simple thing with air around it - and the
                        decoration budget that suits a nearly empty screen is
                        exactly the wrong budget for a full one. The grid never
                        needed more personality than those three; it needed the
                        same restraint applied to a screen that was already
                        full.

                        SO THE ONLY THINGS ON THE CREAM ARE THE NINE PICTURES.
                        If any of this is ever wanted back, it should come back
                        as one still mark, not as a layer.

                        AND THE GAP THEY LIVED IN IS GONE TOO. It was 12px when
                        those layers existed, widened partly to give the hearts
                        a channel to drift along; it is 3px now, because the
                        tiles are square and aligned and a divider is all they
                        need. There is no gutter on this card any more — see
                        the full history on .cg-grid.
                      */}
                    </div>

                    {/* Fixed height, so the grid never shifts under a thumb. */}
                    <p className="cg-status font-pixel" aria-live="polite">
                      {nudge ? (
                        <span className="cg-status-nudge">{nudge}</span>
                      ) : (
                        <span>&nbsp;</span>
                      )}
                    </p>

                    <div className="cg-btnrow">
                      <button
                        type="button"
                        className="cg-btn cg-btn-love"
                        onClick={verifyRound}
                      >
                        {CAPTCHA_GATE_COPY.verify}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * ONE SURFACE, SEVEN STATES. Scoped to .cg-*. Injected as raw HTML rather than
 * a text child because React's server renderer escapes quotes and angle
 * brackets inside a style child while the client does not — a hydration
 * mismatch.
 */
export const CAPTCHA_GATE_CSS = `
/*
 * THE PAGE. Everything in this gate lives inside it; there is no window, no
 * dialog and no scrim anywhere. The failure shifts HUE rather than dropping
 * into the dark — enough that something is clearly wrong, never enough to feel
 * like a different website.
 */
.cg-page {
  /*
   * THE PALETTE, AND IT IS SATURATED ON PURPOSE.
   *
   * Anchored to the two colours the rest of the app is already built on — the
   * titlebar gradient, --win-title-start #ff69b4 into --win-title-end #ba55d3,
   * over the #c8a2e8 lavender. Y2K is juicy, not chalky: an earlier pass of
   * this gate washed everything to near-white pastel and the whole gate went
   * soft-focus, with pink headings barely separating from the page behind them.
   *
   * SO THE RULE HERE IS DEPTH, NOT PALENESS. The page carries a rich lavender,
   * every card sits on it in white, and the accents are the full-strength pink
   * and orchid. Cute comes from the SHAPES — round corners, fat soft shadows,
   * bouncing hearts — and never from draining the colour out.
   */
  --cg-pink: #ff69b4;
  --cg-pink-hot: #ff2e9a;
  --cg-pink-deep: #d81b8c;
  --cg-orchid: #ba55d3;
  --cg-orchid-deep: #8e2fb0;
  --cg-lav: #c8a2e8;
  --cg-lav-deep: #a274db;
  --cg-ink: #3b1266;
  --cg-ink-soft: rgba(59, 18, 102, 0.82);
  --cg-cream: #fff6fc;
  --cg-gold: #ffd166;
  --cg-green: #22c55e;

  position: relative;
  min-height: 100svh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom, 0px));
  overflow: hidden;
  background: var(--cg-lav);
  transition: background 620ms ease-out;
}

/*
 * IT BLOOMS. The broken states sit a shade dimmer and cooler; the page
 * brightens as it resolves — dim lilac while something is wrong, warm and
 * bright once it turns out to be a love letter. Solid colours rather than
 * gradients, because only solids interpolate in a transition; the pink comes
 * from .cg-bloom, which fades UP over the top of this.
 */
/*
 * IT STILL BLOOMS, IT JUST BLOOMS FROM SATURATED TO SATURATED. The broken
 * states sit in a deeper, cooler orchid and the page opens up into a brighter
 * lilac as it resolves. None of these is a pastel; the difference the eye reads
 * is LIGHT, not how much colour has been taken out.
 */
.cg-is-buffering { background: #b78ce6; }
/*
 * THE CRASH ALREADY WEARS THE BROKEN COLOUR, and its transitions are off.
 * That is the whole mechanism behind the hard cut: the 620ms background ease
 * declared on .cg-page above would otherwise turn the snap into a fade. By the
 * time the phase flips to 'glitch' there is nothing left to interpolate.
 */
.cg-is-crash {
  background: var(--cg-lav-deep);
  transition: none;
  animation: cg-crash-shake 420ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
.cg-is-crash .cg-bloom,
.cg-is-crash .cg-scan { transition: none; }
.cg-is-crash .cg-scan { opacity: 0.72; }
.cg-is-glitch { background: var(--cg-lav-deep); }
.cg-is-twist,
.cg-is-verifying { background: var(--cg-lav); }
/*
 * THE CHALLENGE IS BACK ON THE SET'S OWN COLOUR, AND THE CORRECTION IS WORTH
 * RECORDING BECAUSE IT LOOKED RIGHT IN ISOLATION AND WRONG IN SEQUENCE.
 *
 * It was pulled to a pale #e4d9f6 to stop a saturated page framing the
 * photographs in the wash they were being lifted out of. Judged as a single
 * screenshot that reasoning holds. Judged as the FOURTH SCREEN OF FIVE it does
 * not: buffering, the crash, the broken page and the checkbox all run deep
 * lavender, and the grid arrived a different weight of colour entirely — the
 * recipient slid from one world into a quieter one and back out again for the
 * payoff, which reads as a different page rather than the next beat.
 *
 * THE PHOTOGRAPHS ARE LIFTED BY THE CARD, NOT BY THE PAGE. That is the whole
 * resolution: .cg-grid stays cream, so the tiles still sit on something calm
 * and still pop off it. Nothing that made the photographs read depended on the
 * background being quiet; it only depended on the thing directly under them
 * being quiet.
 *
 * AND IT LANDS ON THE CHECKBOX SCREEN'S OWN LAVENDER, NOT THE PAYOFF'S.
 * .cg-is-challenge shared #d3a8f0 with .cg-is-passed for a while, which is the
 * warmest, most pink-leaning base in the gate — chosen for the screen that
 * ENDS the sequence and has one line of text on it. Under a full-strength pink
 * bloom it made the grid the hottest page of the five.
 *
 * var(--cg-lav) is the base the checkbox step is already sitting on, so the
 * swap into the grid does not change the page colour at all: the pane slides,
 * the wash eases down, and the ground under both is identical. That is as
 * continuous as this transition can be made, and it is a calmer, dreamier
 * lavender than the one it replaces rather than a paler one.
 */
.cg-is-challenge { background: var(--cg-lav); }
.cg-is-passed { background: #d3a8f0; }

/*
 * ── THE GRID PAGE'S OWN GROUND: DUSK, WHERE EVERY OTHER SCREEN IS LAVENDER ──
 *
 * WHAT WAS HERE BEFORE, AND WHY IT WAS RIGHT AT THE TIME. .cg-is-challenge sat
 * on var(--cg-lav) — the CHECKBOX screen's exact colour — and the long note
 * above it argues, correctly, that this makes the swap into the grid perfectly
 * continuous: the pane slides, the wash eases down, and the ground under both
 * steps never changes. That note also records the failure it was fixing: a pale
 * #e4d9f6 that made the grid read as a quieter page from somewhere else.
 *
 * BOTH OF THOSE WERE ABOUT LIGHTNESS AND NEITHER WAS ABOUT HUE. The pale
 * version failed because it drained out — it was the same lavender with the
 * colour taken away, which always reads as a different, weaker page. Sharing
 * the checkbox's exact colour succeeded for the opposite reason and cost the
 * grid any identity of its own: four of the five screens are the same lavender
 * at different depths, and the one screen with photographs on it was the fourth
 * of them.
 *
 * SO THIS MOVES SIDEWAYS INSTEAD. Same depth, same saturation, different
 * DIRECTION: a periwinkle blue-violet at the top easing into the gate's own
 * lilac at the bottom, with a breath of aqua in one corner and rose in the
 * other. Nothing is lighter, nothing is washed out, and it is unmistakably not
 * the checkbox screen — the eye reads a shift in temperature rather than a drop
 * in strength.
 *
 * AND COOL IS THE RIGHT DIRECTION FOR THIS PARTICULAR SCREEN. The card on it is
 * warm cream holding nine warm photographs; a cool ground is what a warm object
 * is mounted on, in every frame shop there has ever been. The other four
 * screens hold pink type on lavender and want the family colour under them.
 *
 * IT IS STILL THE FAMILY. The bottom half of this gradient IS var(--cg-lav);
 * the pink bloom still crosses the top of it; the two dreaming blobs still
 * breathe through it. It reads as the same gate at a different hour, which is
 * what "its own palette" has to mean on the fourth screen of five.
 *
 * z-index 0 AND FIRST IN THE DOM: it paints under .cg-bloom and .cg-dream, both
 * of which are also at 0, so the warm layers still sit on top of it.
 */
.cg-gridwash {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 620ms ease-out;
  background:
    /*
     * THE GLITTER, AND IT IS SCATTERED BY HAND RATHER THAN TILED.
     *
     * The first attempt was two repeating dot grids at different pitches, on
     * the theory that two lattices would interfere into something irregular.
     * They do not: the eye locks onto the tighter one and reads POLKA DOTS,
     * which is a pattern, not a sparkle. Glitter is irregular in position, size
     * AND brightness, and a repeating-background cannot be irregular in any of
     * the three.
     *
     * So these are individually placed, at percentages so they redistribute
     * with the viewport, in three sizes and three brightnesses. Eighteen of
     * them across a whole page is sparse enough that no two ever line up into
     * something the eye can follow.
     */
    radial-gradient(circle at 7% 12%, rgba(255,255,255,0.95) 0 1.6px, transparent 3px),
    radial-gradient(circle at 23% 5%, rgba(255,246,214,0.75) 0 1.1px, transparent 2.2px),
    radial-gradient(circle at 41% 17%, rgba(255,255,255,0.6) 0 0.9px, transparent 1.8px),
    radial-gradient(circle at 63% 8%, rgba(255,255,255,0.9) 0 1.4px, transparent 2.8px),
    radial-gradient(circle at 88% 15%, rgba(255,246,214,0.85) 0 1.8px, transparent 3.4px),
    radial-gradient(circle at 95% 31%, rgba(255,255,255,0.7) 0 1px, transparent 2px),
    radial-gradient(circle at 4% 34%, rgba(255,255,255,0.8) 0 1.3px, transparent 2.6px),
    radial-gradient(circle at 15% 52%, rgba(255,246,214,0.6) 0 0.9px, transparent 1.8px),
    radial-gradient(circle at 91% 49%, rgba(255,255,255,0.9) 0 1.5px, transparent 3px),
    radial-gradient(circle at 2% 67%, rgba(255,255,255,0.7) 0 1.1px, transparent 2.2px),
    radial-gradient(circle at 97% 71%, rgba(255,246,214,0.8) 0 1.3px, transparent 2.6px),
    radial-gradient(circle at 12% 81%, rgba(255,255,255,0.95) 0 1.7px, transparent 3.2px),
    radial-gradient(circle at 34% 93%, rgba(255,255,255,0.65) 0 1px, transparent 2px),
    radial-gradient(circle at 52% 86%, rgba(255,246,214,0.7) 0 1.2px, transparent 2.4px),
    radial-gradient(circle at 71% 95%, rgba(255,255,255,0.85) 0 1.4px, transparent 2.8px),
    radial-gradient(circle at 86% 88%, rgba(255,255,255,0.6) 0 0.9px, transparent 1.8px),
    radial-gradient(circle at 28% 74%, rgba(255,255,255,0.75) 0 1.2px, transparent 2.4px),
    radial-gradient(circle at 58% 26%, rgba(255,246,214,0.55) 0 0.8px, transparent 1.6px),
    /* THE SPOTLIGHT. Warm, centred behind the card, so the grid looks lit
       rather than pasted on. */
    radial-gradient(74% 50% at 50% 44%, #fdf0ff 0%, #ffd0ec 40%, transparent 76%),
    /*
     * THE GROUND: THE Y2K SKY, AND IT IS THE ONLY SCREEN IN THE GATE THAT RUNS
     * COOL AT THE TOP AND WARM AT THE FLOOR.
     *
     * THAT INVERSION IS THE POINT, AND IT IS WORTH MORE THAN THE HUE IS. Every
     * other screen here is warm at the top and cools as it falls — the pink
     * bloom is anchored at 50% 0%, so buffering, the break, the checkbox and
     * the payoff all share that one picture at different depths. Turning it
     * upside down makes this screen structurally its own before a single
     * colour is compared, which is what none of the earlier attempts managed:
     * a periwinkle wash and a cotton-candy sunset were both just DIFFERENT
     * COLOURS in the same arrangement, and both read as a variation rather
     * than as its own place.
     *
     * IT WAS BABY BLUE AT THE TOP FOR ONE PASS, AND THE BLUE HAD TO GO. The
     * argument for it was the Y2K sky itself — the gradient off every jewel
     * case, folder and messenger window of the era — and as a reference it was
     * the most honest thing here. It still looked wrong, for a reason that has
     * nothing to do with whether the reference is good: THERE IS NO BLUE
     * ANYWHERE ELSE IN THIS GATE. Pink, orchid, lavender and cream is the whole
     * palette, across five screens, and a hue from outside that set does not
     * read as "this screen is its own", it reads as a screen that belongs to a
     * different app.
     *
     * SO THE COOL END CAME BACK INTO THE FAMILY AND THE STRUCTURE STAYED. A
     * soft lilac is still unmistakably the cool end of a gradient that lands on
     * candy pink, and lilac is a colour this gate is already built from. The
     * inversion is doing the work; the blue was never doing it.
     *
     * IT IS ALSO THE RIGHT GROUND FOR THE CARD. The cream card and its nine
     * warm photographs sit in the upper two thirds of the page, which is
     * exactly where this gradient is coolest — a warm object on a cool mount,
     * which is what every frame shop has always done.
     */
    linear-gradient(174deg, #bda8f0 0%, #cba6ee 30%, #e6a4e4 64%, #ffa8d6 100%);
}

.cg-is-challenge .cg-gridwash { opacity: 1; }

/*
 * The hot pink wash. It is what stops the lavender reading flat, and it is
 * carrying real pink now — barely there while the page is broken, full strength
 * once it turns out to be a love letter.
 */
.cg-bloom {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.3;
  transition: opacity 620ms ease-out;
  background:
    radial-gradient(120% 72% at 50% 0%, rgba(255, 105, 180, 0.85), transparent 68%),
    radial-gradient(96% 62% at 16% 100%, rgba(186, 85, 211, 0.75), transparent 70%),
    radial-gradient(80% 55% at 92% 84%, rgba(255, 46, 154, 0.5), transparent 72%);
}

.cg-is-twist .cg-bloom,
.cg-is-verifying .cg-bloom { opacity: 0.8; }
/*
 * THE CHALLENGE BACKS OFF, THE PAYOFF DOES NOT.
 *
 * These two used to share a rule at full strength, and on the challenge that
 * put a hot pink wash under a pink header, a pink grid, pink borders and a pink
 * button - six pinks stacked, which is not six times as romantic, it is a flat
 * blob with nine photographs hidden in it. The bloom is the biggest single
 * surface of the six, so it is the one that yields.
 *
 * The payoff keeps every drop of it. That screen has one line of text on it and
 * nothing to lose to saturation; this one is carrying the only photographs in
 * the gate.
 */
/*
 * THE WASH IS THE BIGGEST SURFACE IN THE GATE, WHICH IS WHY IT IS THE ONE
 * TURNED DOWN HERE.
 *
 * .cg-bloom is three radials of #ff69b4 and #ff2e9a covering the entire page.
 * At 0.85 it did not read as "a lavender page with a warm glow", it read as a
 * hot pink page — it is full-bleed, so it beats every smaller decision made
 * above it, and a header tuned to sit calmly on lavender looked wrong against
 * it because the thing it was supposed to be sitting on had gone magenta.
 *
 * THE OPACITY IS THE RIGHT DIAL AND THE HUE IS NOT. An earlier draft of this
 * change swapped the radials themselves for violet ones. It looked correct in
 * a still and would flash in motion: .cg-bloom transitions OPACITY only, and
 * gradient backgrounds do not interpolate, so the wash would have jumped hue
 * in a single frame at the exact moment the pane slides. Fading the pink back
 * uses the transition that is already there and stays smooth.
 *
 * At 0.3 the pink survives as a warm breath across the top of the page — the
 * thread back to the four screens before it — and the lavender underneath is
 * what the eye actually reads.
 */
/*
 * DOWN AGAIN, FROM 0.3 TO 0.16, AND ONLY BECAUSE THE GROUND CHANGED. The whole
 * argument above still holds — the wash is the biggest surface in the gate, so
 * it is the one that yields on the screen carrying the photographs. It yields a
 * little further now that .cg-gridwash is underneath it: at 0.3 a full-bleed
 * pink over a periwinkle base simply mixed back into the same lavender every
 * other screen wears, which would have thrown away the change. At 0.16 the pink
 * is still legible as a warm breath across the top — the thread to the four
 * screens before it — and the cool ground is what the eye reads.
 */
.cg-is-challenge .cg-bloom { opacity: 0.16; }
.cg-is-passed .cg-bloom { opacity: 1; }

/*
 * THE DREAM. Two huge soft blobs breathing on a very slow clock, which is what
 * gives the background depth instead of one flat fill. Deliberately enormous
 * and edgeless — at this size and blur it can never read as an object sitting
 * on top of anything, which is why it is allowed to cross the whole page when
 * nothing else decorative is.
 */
.cg-dream {
  position: absolute;
  inset: -20%;
  z-index: 0;
  pointer-events: none;
  opacity: 0.55;
  background:
    radial-gradient(closest-side circle at 22% 28%, rgba(255, 105, 180, 0.55), transparent 100%),
    radial-gradient(closest-side circle at 80% 72%, rgba(186, 85, 211, 0.55), transparent 100%);
  filter: blur(28px);
  animation: cg-dream-drift 22s ease-in-out infinite;
}

@keyframes cg-dream-drift {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(2%, -3%, 0) scale(1.08); }
}

.cg-inner {
  position: relative;
  z-index: 4;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── THE CRASH ──────────────────────────────────────────────────────────── */
/*
 * ~0.42s of a page genuinely falling over, and then a hard cut to the soft
 * broken screen. Everything in this section is one-shot: nothing here loops,
 * nothing here survives the phase, and every duration multiplies out to
 * CRASH_MS so the layers all die together rather than trailing off one by one.
 */

/*
 * THE SHUDDER, AND WHY IT SCALES UP WHILE IT SHAKES.
 *
 * .cg-page is the full-bleed surface, so translating it drags its own edges
 * into view and would flash strips of whatever sits behind the gate. The scale
 * is the fix, not a flourish: 1.03 overshoots the viewport by more than the
 * largest offset, so there is always surface under the edge. It decays back to
 * 1 on the same curve as the movement, so the frame settles as the shake
 * settles rather than snapping back at the end.
 */
@keyframes cg-crash-shake {
  0%   { transform: translate(0, 0) scale(1.03) rotate(0deg); }
  8%   { transform: translate(-9px, 5px) scale(1.03) rotate(-0.5deg); }
  16%  { transform: translate(8px, -6px) scale(1.03) rotate(0.45deg); }
  24%  { transform: translate(-7px, -4px) scale(1.03) rotate(0.3deg); }
  33%  { transform: translate(6px, 6px) scale(1.028) rotate(-0.35deg); }
  42%  { transform: translate(-5px, 3px) scale(1.024) rotate(0.2deg); }
  55%  { transform: translate(4px, -3px) scale(1.019) rotate(-0.15deg); }
  70%  { transform: translate(-3px, 2px) scale(1.013) rotate(0.1deg); }
  85%  { transform: translate(2px, -1px) scale(1.007) rotate(0deg); }
  100% { transform: translate(0, 0) scale(1) rotate(0deg); }
}

.cg-crash {
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  overflow: hidden;
}

.cg-crash > span {
  position: absolute;
  display: block;
}

/* THE FLASH. Blown out on the first frame, then stuttering out. */
.cg-crash-flash {
  inset: 0;
  background: #ffffff;
  opacity: 0;
  animation: cg-crash-flash 420ms ease-out both;
}

@keyframes cg-crash-flash {
  0%   { opacity: 0.92; }
  7%   { opacity: 0.1; }
  12%  { opacity: 0.66; }
  20%  { opacity: 0.03; }
  36%  { opacity: 0.28; }
  46%  { opacity: 0; }
  100% { opacity: 0; }
}

/*
 * THE CHROMATIC SPLIT. Two washes pulling apart in opposite directions on a
 * steps() clock, so the colour JUMPS between positions instead of gliding
 * between them - a signal tearing, not a gradient moving. 140ms x 3 = CRASH_MS.
 */
.cg-crash-rgb {
  inset: -6%;
  mix-blend-mode: screen;
  opacity: 0;
}

.cg-crash-rgb-r {
  background: rgba(255, 0, 90, 0.55);
  animation: cg-crash-split-r 140ms steps(2, end) 3 both;
}

.cg-crash-rgb-c {
  background: rgba(0, 230, 255, 0.5);
  animation: cg-crash-split-c 140ms steps(2, end) 3 both;
}

@keyframes cg-crash-split-r {
  0%   { transform: translate3d(-9px, 3px, 0); opacity: 0.5; }
  50%  { transform: translate3d(6px, -4px, 0); opacity: 0.24; }
  100% { transform: translate3d(-3px, 1px, 0); opacity: 0.4; }
}

@keyframes cg-crash-split-c {
  0%   { transform: translate3d(9px, -3px, 0); opacity: 0.45; }
  50%  { transform: translate3d(-6px, 4px, 0); opacity: 0.2; }
  100% { transform: translate3d(3px, -1px, 0); opacity: 0.36; }
}

/*
 * THE STATIC. Two crossed line grids whose background-position is thrown
 * around on a 70ms steps() clock - 70ms x 6 = CRASH_MS. Inset well past the
 * edges so the jumps can never expose a corner.
 */
.cg-crash-static {
  inset: -12%;
  mix-blend-mode: overlay;
  opacity: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.5) 0px,
      rgba(255, 255, 255, 0.5) 1px,
      transparent 1px,
      transparent 2px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.35) 0px,
      rgba(0, 0, 0, 0.35) 1px,
      transparent 1px,
      transparent 3px
    );
  animation: cg-crash-static 70ms steps(3, end) 6 both;
}

@keyframes cg-crash-static {
  0%   { background-position: 0 0, 0 0; opacity: 0.55; }
  33%  { background-position: 13px -9px, -7px 5px; opacity: 0.28; }
  66%  { background-position: -11px 7px, 9px -6px; opacity: 0.6; }
  100% { background-position: 5px 3px, -3px 2px; opacity: 0.22; }
}

/*
 * THE TEARS. Three bands of the picture sliding out of line with the rest.
 * Deliberately different heights and clocks so they never pulse together -
 * three things failing at once, not one thing blinking three times.
 */
.cg-crash-tear {
  left: -10%;
  width: 120%;
  background: rgba(255, 255, 255, 0.85);
  mix-blend-mode: overlay;
  opacity: 0;
}

.cg-crash-tear-1 {
  top: 21%;
  height: 14px;
  animation: cg-crash-tear-a 140ms steps(2, end) 3 both;
}

.cg-crash-tear-2 {
  top: 46%;
  height: 27px;
  animation: cg-crash-tear-b 105ms steps(2, end) 4 both;
}

.cg-crash-tear-3 {
  top: 72%;
  height: 9px;
  animation: cg-crash-tear-a 210ms steps(2, end) 2 both;
}

@keyframes cg-crash-tear-a {
  0%   { transform: translateX(-26px); opacity: 0.6; }
  50%  { transform: translateX(18px); opacity: 0.12; }
  100% { transform: translateX(-6px); opacity: 0.4; }
}

@keyframes cg-crash-tear-b {
  0%   { transform: translateX(22px); opacity: 0.5; }
  50%  { transform: translateX(-30px); opacity: 0.16; }
  100% { transform: translateX(8px); opacity: 0.34; }
}

/*
 * THE CONTENT COMES APART TOO. The loading heart and its label are still on
 * screen through all of this, and leaving them serenely centred while the page
 * tore around them was the tell that none of it was real. The split is done
 * with drop-shadow rather than a duplicated node: it costs no markup and it
 * lands on the artwork and the text together.
 */
.cg-is-crash .cg-inner {
  animation: cg-crash-chroma 140ms steps(2, end) 3 both;
}

@keyframes cg-crash-chroma {
  0% {
    transform: translateX(-4px) skewX(-1.2deg);
    filter:
      drop-shadow(-4px 0 rgba(255, 0, 90, 0.9))
      drop-shadow(4px 0 rgba(0, 230, 255, 0.9));
  }
  50% {
    transform: translateX(5px) skewX(1.4deg);
    filter:
      drop-shadow(5px 0 rgba(255, 0, 90, 0.9))
      drop-shadow(-5px 0 rgba(0, 230, 255, 0.9));
  }
  100% {
    transform: translateX(0) skewX(0deg);
    filter:
      drop-shadow(-2px 0 rgba(255, 0, 90, 0.8))
      drop-shadow(2px 0 rgba(0, 230, 255, 0.8));
  }
}

/*
 * AND THEN IT SETTLES. The last of the chromatic fringing bleeds off and the
 * panel eases down to rest, which is what makes the sequence read as calm ->
 * shock -> cute rather than as shock -> cute with a seam in the middle.
 *
 * IT IS ON .cg-inner, NOT ON .cg-broke, AND THAT IS NOT A STYLE CHOICE.
 * .cg-broke already animates a transform (cg-sway, forever). Two animations
 * naming the same property do not blend - the second silently wins - so a
 * settle declared there would simply delete the sway. On the PARENT the two
 * transforms compose, exactly as the note on cg-face-live warns.
 *
 * AND IT IS NAMED cg-crash-settle, NOT cg-settle. There is already an unused
 * @keyframes cg-settle further down this stylesheet, and @keyframes resolve by
 * LAST DEFINITION WINS regardless of where they are referenced — so the short
 * name here would quietly have played that one's fade-up-from-blur instead of
 * anything written below. It looked close enough to right to survive a glance,
 * which is the reason this note exists.
 */
.cg-is-glitch .cg-inner {
  animation: cg-crash-settle 620ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes cg-crash-settle {
  0% {
    transform: scale(1.035);
    filter:
      drop-shadow(-3px 0 rgba(255, 0, 90, 0.75))
      drop-shadow(3px 0 rgba(0, 230, 255, 0.75))
      saturate(1.5);
  }
  45% {
    transform: scale(1.004);
    filter:
      drop-shadow(-1px 0 rgba(255, 0, 90, 0.28))
      drop-shadow(1px 0 rgba(0, 230, 255, 0.28))
      saturate(1.12);
  }
  100% { transform: scale(1); filter: none; }
}

/* ── SCANLINES ──────────────────────────────────────────────────────────── */
.cg-scan {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  /*
   * 0.22 -> 0.13. The scanline is a CRT reference, and at 0.22 it was reading
   * as the thing it references - a screen, a machine, something technical -
   * on a gift whose whole surface is otherwise soft. Dialled back it stops
   * being a stripe you can count and becomes a texture you only notice if you
   * look for it, which is the job it should have had all along.
   *
   * THE BROKEN SCREENS ARE NOT TOUCHED. .cg-is-crash and .cg-is-glitch push
   * this to 0.72, and they should: on those two beats the scanline is not
   * atmosphere, it is the page visibly failing, and that is the one moment in
   * the flow where "technical" is exactly the right read.
   */
  opacity: 0.13;
  transition: opacity 300ms ease-out;
  background: repeating-linear-gradient(
    to bottom,
    rgba(108, 78, 148, 0.09) 0px,
    rgba(108, 78, 148, 0.09) 1px,
    transparent 1px,
    transparent 3px
  );
}

.cg-is-glitch .cg-scan {
  opacity: 0.6;
  animation: cg-scan-roll 6s linear infinite;
}

@keyframes cg-scan-roll {
  to { background-position: 0 24px; }
}

/* ── THE MARGINS ────────────────────────────────────────────────────────── */
/*
 * EVERY DRIFTING THING IN THIS GATE LIVES IN HERE, ON EVERY SCREEN.
 *
 * THE MASK IS THE GUARDRAIL, AND IT IS THE WHOLE REASON THIS LAYER EXISTS.
 * Whimsy that sits over a word or a face stops being whimsy and becomes a
 * rendering bug, and "I positioned them carefully" is not a guarantee — a
 * 9-second drift, a phone 100px narrower than the one it was checked on, or one
 * more motif added later all quietly break it.
 *
 * So the layer is CLIPPED rather than curated: it is fully painted in the two
 * outer columns and fully transparent across the middle, where the content is.
 * Anything that drifts inward fades out on the way. Nothing inside here can
 * reach the text, whatever it does, and nothing added here later can either.
 *
 * The content column is capped at 460px and centred, so on a phone the clear
 * band is nearly the whole width and the floaties hug the very edges; on a
 * desktop the gutters open up and they are let out into them (see the media
 * query below). It sits at z-index 2, under .cg-inner at 4, so even inside its
 * own band it is behind everything.
 */
.cg-dreamies {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(
    90deg,
    #000 0%,
    #000 4%,
    transparent 15%,
    transparent 85%,
    #000 96%,
    #000 100%
  );
  mask-image: linear-gradient(
    90deg,
    #000 0%,
    #000 4%,
    transparent 15%,
    transparent 85%,
    #000 96%,
    #000 100%
  );
}

/* Room to breathe once there are real gutters to breathe into. */
@media (min-width: 620px) {
  .cg-dreamies {
    -webkit-mask-image: linear-gradient(
      90deg,
      #000 0%,
      #000 14%,
      transparent 27%,
      transparent 73%,
      #000 86%,
      #000 100%
    );
    mask-image: linear-gradient(
      90deg,
      #000 0%,
      #000 14%,
      transparent 27%,
      transparent 73%,
      #000 86%,
      #000 100%
    );
  }
}


/* ── THE TWO SETS, AND THE DISSOLVE BETWEEN THEM ────────────────────────── */
/*
 * Both sets fill the masked layer and stack in the same place, so every motif
 * inside either one is positioned against .cg-dreamies exactly as it was when
 * there was only one set. inset: 0 on a plain span is what keeps that true —
 * without it the wrapper is a zero-height inline box and every percentage
 * inside it resolves against nothing.
 *
 * The fade is on the WRAPPER and the animations never stop; the JSX note
 * explains why that is deliberate rather than wasteful.
 */
.cg-set {
  position: absolute;
  inset: 0;
  display: block;
  transition: opacity 620ms ease-in-out;
}

.cg-set-grid { opacity: 0; }
.cg-dreamies.is-grid .cg-set-soft { opacity: 0; }
.cg-dreamies.is-grid .cg-set-grid { opacity: 1; }

/* ── THE DRIFT: HEARTS RISING UP THE EDGES ──────────────────────────────── */
/*
 * PINK, ON EVERY SCREEN, FOR THE SAME REASON THE PIXEL SHAPES ARE.
 *
 * These went lavender for one pass, to keep pink off the pale grid. It was the
 * wrong lever twice over: it changed all five screens to solve a problem on
 * one, and it drained the colour out of the drifting layer that ties the gate
 * together. .cg-sparkle-2 keeps its own lilac, as it always did — the mix was
 * never meant to be uniform, only to be the same mix throughout.
 */
.cg-sparkle {
  position: absolute;
  bottom: -8%;
  font-size: 16px;
  color: var(--cg-pink);
  opacity: 0;
  text-shadow: 0 1px 6px rgba(216, 27, 140, 0.45);
  animation: cg-drift 11s ease-in-out infinite;
}

.cg-sparkle-1 { left: 2%; animation-delay: 0s; font-size: 14px; }
.cg-sparkle-2 { left: 6%; animation-delay: 3.4s; color: #e9c8ff; }
.cg-sparkle-3 { left: 1%; animation-delay: 6.6s; font-size: 18px; }
.cg-sparkle-4 { left: 93%; animation-delay: 1.8s; color: #e9c8ff; }
.cg-sparkle-5 { left: 97%; animation-delay: 8.2s; font-size: 13px; }
.cg-sparkle-6 { left: 90%; animation-delay: 4.9s; font-size: 15px; }

@media (min-width: 620px) {
  .cg-sparkle-1 { left: 7%; }
  .cg-sparkle-2 { left: 17%; }
  .cg-sparkle-3 { left: 11%; }
  .cg-sparkle-4 { left: 84%; }
  .cg-sparkle-5 { left: 93%; }
  .cg-sparkle-6 { left: 88%; }
}

@keyframes cg-drift {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  12% { opacity: 0.9; }
  70% { opacity: 0.6; }
  100% { transform: translateY(-92svh) rotate(24deg); opacity: 0; }
}

/* ── THE FLOATIES: DRAWN SHAPES, BOBBING IN PLACE ───────────────────────── */
/*
 * Slow, sleepy and unsynchronised. Every one carries its own duration and delay
 * so the margins never pulse in time — a dozen things bobbing on one clock
 * reads as a loading state, and a dozen on twelve clocks reads as a place where
 * nice things are floating about.
 */
.cg-floaty {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: var(--w, 13px);
  opacity: 0;
  animation: cg-floaty-bob var(--dur, 9s) ease-in-out var(--del, 0s) infinite;
}

@keyframes cg-floaty-bob {
  0%, 100% { transform: translate3d(0, 0, 0) rotate(-6deg) scale(0.94); opacity: 0.34; }
  50% { transform: translate3d(0, -18px, 0) rotate(6deg) scale(1.06); opacity: 0.72; }
}

/*
 * THE PIXEL HEART, and it is one clip-path rather than an emoji.
 *
 * 7 columns by 6 rows of chunky square pixels, traced as a single polygon: two
 * bumps on the top row, a full body, then a staircase down to a one-pixel
 * point. An emoji heart would render as a different picture on every phone —
 * flat on one, glossy on another, red where this wants magenta — and this shape
 * is used at five sizes across the gate, so it has to be OURS.
 */
.cg-shape-heart,
.cg-pxheart {
  aspect-ratio: 7 / 6;
  background: linear-gradient(180deg, #ff9ed0 0%, var(--cg-pink-hot) 52%, var(--cg-pink-deep) 100%);
  clip-path: polygon(
    14.286% 0%, 42.857% 0%, 42.857% 16.667%, 57.143% 16.667%, 57.143% 0%,
    85.714% 0%, 85.714% 16.667%, 100% 16.667%, 100% 50%, 85.714% 50%,
    85.714% 66.667%, 71.429% 66.667%, 71.429% 83.333%, 57.143% 83.333%,
    57.143% 100%, 42.857% 100%, 42.857% 83.333%, 28.571% 83.333%,
    28.571% 66.667%, 14.286% 66.667%, 14.286% 50%, 0% 50%, 0% 16.667%,
    14.286% 16.667%
  );
}

/* A fat pixel cloud, 8 by 5, on the same staircase principle. */
.cg-shape-cloud {
  aspect-ratio: 8 / 5;
  background: linear-gradient(180deg, #ffffff 0%, #f0dcff 100%);
  clip-path: polygon(
    25% 0%, 62.5% 0%, 62.5% 20%, 75% 20%, 75% 40%, 87.5% 40%, 87.5% 60%,
    100% 60%, 100% 80%, 87.5% 80%, 87.5% 100%, 12.5% 100%, 12.5% 80%,
    0% 80%, 0% 40%, 12.5% 40%, 12.5% 20%, 25% 20%
  );
}

/*
 * THE MARGINS ARE THE THREAD, SO THEY ARE THE SAME ON EVERY SCREEN.
 *
 * There was briefly a .cg-is-challenge override here that turned these lavender
 * on the grid step alone. It existed to keep pink off a deliberately pale page,
 * and it went when the page stopped being pale — but the reason it was wrong is
 * worth keeping, because it will look like a tidy idea again one day. These
 * shapes drift across ALL FIVE screens without interruption; that unbroken
 * thread is most of what makes the gate feel like one surface rather than five.
 * Recolouring them for one phase cuts the thread at exactly the moment the
 * recipient is deciding whether they are still in the same place.
 *
 * If a screen needs them quieter, change what is UNDER them.
 */

/* A four-point twinkle. */
.cg-shape-sparkle {
  aspect-ratio: 1;
  background: linear-gradient(180deg, #ffffff 0%, #ffc4e6 100%);
  clip-path: polygon(
    50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%
  );
}

/* A little star, the one warm note in a lavender field. */
.cg-shape-star {
  aspect-ratio: 1;
  background: linear-gradient(180deg, #ffe9b0 0%, var(--cg-gold) 100%);
  clip-path: polygon(
    50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%,
    2% 35%, 39% 35%
  );
}

/* The sleepy face. The one floaty that is type rather than a drawn shape. */
.cg-shape-face {
  width: auto;
  font-size: var(--w, 13px);
  line-height: 1;
  color: #f3e0ff;
  letter-spacing: 1px;
  text-shadow: 0 1px 6px rgba(59, 18, 102, 0.4);
}

.cg-f-1 { --x: 2%; --y: 11%; --w: 15px; --dur: 8.5s; --del: 0s; }
.cg-f-2 { --x: 95%; --y: 17%; --w: 12px; --dur: 10s; --del: 1.6s; }
.cg-f-3 { --x: 1%; --y: 31%; --w: 26px; --dur: 12.5s; --del: 3.1s; }
.cg-f-4 { --x: 94%; --y: 39%; --w: 13px; --dur: 9.5s; --del: 0.8s; }
.cg-f-5 { --x: 3%; --y: 53%; --w: 12px; --dur: 11s; --del: 4.2s; }
.cg-f-6 { --x: 95%; --y: 59%; --w: 12px; --dur: 13s; --del: 2.3s; }
.cg-f-7 { --x: 1.5%; --y: 71%; --w: 11px; --dur: 9s; --del: 5.4s; }
.cg-f-8 { --x: 96%; --y: 77%; --w: 14px; --dur: 10.5s; --del: 3.7s; }
.cg-f-9 { --x: 2.5%; --y: 88%; --w: 22px; --dur: 14s; --del: 1.1s; }
.cg-f-10 { --x: 94.5%; --y: 92%; --w: 12px; --dur: 11.5s; --del: 6.1s; }
.cg-f-11 { --x: 0.5%; --y: 45%; --w: 10px; --dur: 12s; --del: 2.8s; }
.cg-f-12 { --x: 97%; --y: 5%; --w: 11px; --dur: 10s; --del: 4.8s; }

/* Out into the gutters, and a little bigger now they have somewhere to be. */
@media (min-width: 620px) {
  .cg-f-1 { --x: 9%; --w: 19px; }
  .cg-f-2 { --x: 88%; --w: 15px; }
  .cg-f-3 { --x: 5%; --w: 34px; }
  .cg-f-4 { --x: 84%; --w: 17px; }
  .cg-f-5 { --x: 13%; --w: 16px; }
  .cg-f-6 { --x: 90%; --w: 15px; }
  .cg-f-7 { --x: 7%; --w: 14px; }
  .cg-f-8 { --x: 86%; --w: 18px; }
  .cg-f-9 { --x: 12%; --w: 30px; }
  .cg-f-10 { --x: 82%; --w: 16px; }
  .cg-f-11 { --x: 3%; --w: 13px; }
  .cg-f-12 { --x: 92%; --w: 14px; }
}

/* ── THE GRID'S THINNED SET ─────────────────────────────────────────────── */
/*
 * Seven floaties and four trails, on the same classes, the same keyframes and
 * the same palette as the twelve and six above. Only the count, the placement
 * and one glyph are different. See GRID_FLOATIES for why nothing new was
 * invented for this screen.
 *
 * WHERE THEY GO IS DECIDED BY THE PHONE, AND IT IS NOT A MATTER OF TASTE. On a
 * 390px screen the card is 358px wide, which leaves SIX PIXELS of clear page
 * down each side of it. So the layout splits in two:
 *
 *   BESIDE THE CARD (y roughly 19%-71%) only the small motifs go — a heart, a
 *   twinkle — pinned to x 0.5% or 96% so they sit in the sliver instead of
 *   half-vanishing behind the card's edge. A motif tucked under the card does
 *   not read as depth, it reads as a mistake.
 *
 *   ABOVE AND BELOW THE CARD there is real room, so the wider shapes live
 *   there: the clouds, the star, and the face, which is type and therefore as
 *   wide as three glyphs whatever --w says.
 *
 * The mask still governs everything: solid to 4%, gone by 15%. Nothing here can
 * reach the card even if a number is later changed carelessly.
 */
.cg-g-1 { --x: 2%; --y: 7%; --w: 15px; --dur: 11s; --del: 0s; }
.cg-g-2 { --x: 92.5%; --y: 11%; --w: 24px; --dur: 15s; --del: 2.4s; }
.cg-g-3 { --x: 0.5%; --y: 38%; --w: 10px; --dur: 12.5s; --del: 5.1s; }
/* The signature, once, below the card where 34px of type costs nothing. */
.cg-g-4 { --x: 1%; --y: 80%; --w: 13px; --dur: 13.5s; --del: 1.2s; }
.cg-g-5 { --x: 96.5%; --y: 47%; --w: 9px; --dur: 10s; --del: 6.8s; }
.cg-g-6 { --x: 95.5%; --y: 76%; --w: 12px; --dur: 14s; --del: 3.6s; }
.cg-g-7 { --x: 3%; --y: 91%; --w: 21px; --dur: 16.5s; --del: 4.9s; }

/* Slower than the six they thin out: four trails crossing a screen this full
   should read as one drifting past now and then, not as a stream. */
.cg-gsp-1 { left: 1%; animation-delay: 0s; animation-duration: 14s; font-size: 13px; }
.cg-gsp-2 { left: 4%; animation-delay: 6.2s; animation-duration: 16s; font-size: 15px; color: #e9c8ff; }
.cg-gsp-3 { left: 95%; animation-delay: 3.1s; animation-duration: 15s; font-size: 12px; }
.cg-gsp-4 { left: 97.5%; animation-delay: 9.4s; animation-duration: 17s; font-size: 14px; color: #e9c8ff; }

/*
 * ♥‿♥. Deliberately the same type, size and treatment as .cg-shape-face — the
 * rhyme with the broken screen's ✕_✕ only works if everything except the
 * expression is identical. Pink rather than lilac, because this is the screen
 * where the gate has stopped pretending to be broken.
 */
.cg-face-love {
  color: #ffd9f2;
  text-shadow: 0 1px 6px rgba(160, 20, 110, 0.4);
}

/* Out into the gutters with everything else once there are gutters. */
@media (min-width: 620px) {
  .cg-g-1 { --x: 8%; --w: 20px; }
  .cg-g-2 { --x: 86%; --w: 32px; }
  .cg-g-3 { --x: 5%; --w: 14px; }
  .cg-g-4 { --x: 9%; --w: 17px; }
  .cg-g-5 { --x: 91%; --w: 13px; }
  .cg-g-6 { --x: 88%; --w: 16px; }
  .cg-g-7 { --x: 11%; --w: 28px; }

  .cg-gsp-1 { left: 6%; }
  .cg-gsp-2 { left: 15%; }
  .cg-gsp-3 { left: 87%; }
  .cg-gsp-4 { left: 93%; }
}

/* ── THE SUCCESS CONFETTI ───────────────────────────────────────────────── */
/*
 * Hearts tumbling down the page, once, when the gate opens.
 *
 * THEY FALL BEHIND THE CONTENT, at z-index 3 — under .cg-inner at 4. An earlier
 * pass put them at 5, over the top, on the argument that the payoff had earned
 * one moment of being the thing you look at. It had not: fourteen hearts
 * crossing "definitely their favorite human" is decoration landing on the one
 * line the entire gate exists to deliver. Behind the text they still shower the
 * whole screen, and the line stays perfectly crisp while they do.
 *
 * The 1900ms flight is not a coincidence: it is PASSED_MS. The last heart
 * leaves the screen at the same moment the gift takes it.
 */
.cg-confetti {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.cg-conf {
  position: absolute;
  top: 0;
  font-size: 19px;
  color: var(--cg-pink);
  text-shadow: 0 2px 8px rgba(216, 27, 140, 0.45);
  opacity: 0;
  animation: cg-conf-fall 1900ms cubic-bezier(0.3, 0.2, 0.5, 1) both;
}

/*
 * THE WARM BLOOM. A soft flare of light opening out from the middle of the
 * screen the instant the tick lands — the glow the payoff arrives on. Behind
 * the content like everything else, so it warms the page around the words
 * rather than washing over them.
 *
 * THE CENTRE IS DELIBERATELY THE DIMMEST PART OF IT. A bloom brightest at its
 * middle puts a near-white disc exactly where the payoff line sits, and white
 * type on it stops carrying — the glow ends up competing with the sentence it
 * is celebrating. Peaking as a RING instead throws the light around the words
 * and leaves the middle dark enough for them to hold their contrast.
 */
.cg-warmglow {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: radial-gradient(
    closest-side circle at 50% 46%,
    rgba(255, 160, 214, 0.35) 0%,
    rgba(255, 105, 180, 0.6) 46%,
    rgba(255, 46, 154, 0.35) 62%,
    transparent 80%
  );
  animation: cg-bloom-burst 1500ms cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

@keyframes cg-bloom-burst {
  0% { opacity: 0; transform: scale(0.5); }
  35% { opacity: 0.9; }
  100% { opacity: 0.4; transform: scale(1.3); }
}

@keyframes cg-conf-fall {
  0% { transform: translateY(-14svh) rotate(0deg) scale(0.55); opacity: 0; }
  14% { opacity: 1; }
  78% { opacity: 1; }
  100% {
    transform: translateY(100svh) rotate(var(--r, 180deg)) scale(1);
    opacity: 0;
  }
}

.cg-conf-1 { left: 6%; --r: 200deg; animation-delay: 0ms; font-size: 16px; }
.cg-conf-2 { left: 14%; --r: -160deg; animation-delay: 170ms; color: #d98cf5; }
.cg-conf-3 { left: 22%; --r: 140deg; animation-delay: 60ms; font-size: 13px; }
.cg-conf-4 { left: 30%; --r: -220deg; animation-delay: 300ms; font-size: 21px; }
.cg-conf-5 { left: 38%; --r: 180deg; animation-delay: 120ms; color: #d98cf5; }
.cg-conf-6 { left: 46%; --r: -130deg; animation-delay: 380ms; font-size: 15px; }
.cg-conf-7 { left: 54%; --r: 240deg; animation-delay: 30ms; }
.cg-conf-8 { left: 62%; --r: -190deg; animation-delay: 250ms; font-size: 13px; }
.cg-conf-9 { left: 70%; --r: 160deg; animation-delay: 90ms; color: #d98cf5; }
.cg-conf-10 { left: 78%; --r: -210deg; animation-delay: 330ms; font-size: 20px; }
.cg-conf-11 { left: 86%; --r: 130deg; animation-delay: 200ms; }
.cg-conf-12 { left: 92%; --r: -170deg; animation-delay: 420ms; font-size: 14px; }
.cg-conf-13 { left: 2%; --r: 220deg; animation-delay: 460ms; color: #d98cf5; }
.cg-conf-14 { left: 50%; --r: -150deg; animation-delay: 520ms; font-size: 17px; }

/* The page warms up for the payoff and settles back. */
.cg-is-passed .cg-bloom {
  animation: cg-glow 1500ms ease-out both;
}

@keyframes cg-glow {
  0% { opacity: 0.7; }
  30% { opacity: 1; }
  100% { opacity: 0.95; }
}

/* ── THE GLITCH MOTIFS ──────────────────────────────────────────────────── */
/*
 * Bigger, slower and sleepier than the sparkles: these bob in place rather than
 * fly past, so the broken screen reads as populated by cute things rather than
 * as a particle effect.
 */
.cg-motif {
  position: absolute;
  font-size: clamp(17px, 4.6vw, 24px);
  color: var(--cg-pink);
  opacity: 0.42;
  text-shadow: 0 1px 8px rgba(216, 27, 140, 0.4);
  animation: cg-bob 7s ease-in-out infinite;
}

/* Edges only, like everything else in the drift layer. */
.cg-motif-1 { top: 13%; left: 1%; animation-delay: 0s; }
.cg-motif-2 { top: 25%; right: 1%; left: auto; color: #ecd0ff; animation-delay: 1.1s; }
.cg-motif-3 { top: 43%; left: 2.5%; animation-delay: 2.3s; }
.cg-motif-4 { top: 61%; right: 2%; left: auto; animation-delay: 0.6s; }
.cg-motif-5 { top: 79%; left: 1%; color: #ecd0ff; animation-delay: 3.1s; }
.cg-motif-6 { top: 6%; right: 3%; left: auto; animation-delay: 1.8s; }
.cg-motif-7 { top: 90%; right: 1.5%; left: auto; animation-delay: 2.7s; }

@media (min-width: 620px) {
  .cg-motif-1 { left: 8%; }
  .cg-motif-3 { left: 12%; }
  .cg-motif-5 { left: 6%; }
  .cg-motif-2 { right: 9%; }
  .cg-motif-4 { right: 13%; }
  .cg-motif-6 { right: 6%; }
  .cg-motif-7 { right: 11%; }
}

@keyframes cg-bob {
  0%, 100% { transform: translateY(0) rotate(-4deg); opacity: 0.32; }
  50% { transform: translateY(-14px) rotate(4deg); opacity: 0.62; }
}

/* ── THE BUFFER ─────────────────────────────────────────────────────────── */
.cg-buffer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 44px 0;
}

/*
 * The halo. A soft pink glow that breathes on a slower clock than the hop, so
 * the two never sync up and the loader never looks like a metronome. It is a
 * pseudo-element on the wrapper because the heart is already spending its own
 * transform on the hop.
 */
.cg-bounce-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cg-bounce-wrap::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 96px;
  height: 96px;
  margin: -48px 0 0 -48px;
  border-radius: 50%;
  z-index: -1;
  background: radial-gradient(
    circle,
    rgba(255, 105, 180, 0.85),
    rgba(255, 46, 154, 0) 68%
  );
  animation: cg-halo 2.6s ease-in-out infinite;
}

@keyframes cg-halo {
  0%, 100% { transform: scale(0.82); opacity: 0.5; }
  50% { transform: scale(1.16); opacity: 0.95; }
}

/*
 * THE GROUND SHADOW, and it is what turns a moving heart into a bouncing one.
 * It squashes wide and faint as the heart rises and snaps small and dark as it
 * lands, on the same 1.1s clock as the hop — the weight of the bounce is read
 * almost entirely from this, not from the heart itself.
 */
.cg-bounce-wrap::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -14px;
  width: 40px;
  height: 9px;
  margin-left: -20px;
  border-radius: 50%;
  z-index: -1;
  background: rgba(142, 47, 176, 0.4);
  filter: blur(1.5px);
  animation: cg-shadow-squish 1.1s cubic-bezier(0.3, 0.9, 0.4, 1) infinite;
}

@keyframes cg-shadow-squish {
  0%, 100% { transform: scale(1, 1); opacity: 0.5; }
  30% { transform: scale(0.72, 0.85); opacity: 0.26; }
  55% { transform: scale(1.14, 1); opacity: 0.58; }
  70% { transform: scale(1, 1); opacity: 0.5; }
}

/* A pixel heart doing a small hop. Reads as "loading" to anyone with a phone. */
.cg-bounce {
  width: 54px;
  display: inline-block;
  filter: drop-shadow(0 3px 0 rgba(142, 47, 176, 0.35));
  animation: cg-hop 1.1s cubic-bezier(0.3, 0.9, 0.4, 1) infinite;
}

@keyframes cg-hop {
  0%, 100% { transform: translateY(0) scale(1, 1); }
  30% { transform: translateY(-16px) scale(0.93, 1.08); }
  55% { transform: translateY(0) scale(1.1, 0.9); }
  70% { transform: translateY(0) scale(1, 1); }
}

.cg-buffer-label {
  font-size: 20px;
  letter-spacing: 0.3px;
  color: #ffffff;
  text-shadow:
    0 2px 0 rgba(142, 47, 176, 0.55),
    0 0 16px rgba(255, 105, 180, 0.6);
  animation: cg-pulse 2.4s ease-in-out infinite;
}

.cg-dots { display: flex; gap: 7px; }

/* Three tiny hearts rather than three dots, hopping in sequence. */
.cg-dots i {
  width: 9px;
  aspect-ratio: 7 / 6;
  background: linear-gradient(180deg, #ffb3da, var(--cg-pink-hot));
  clip-path: polygon(
    14.286% 0%, 42.857% 0%, 42.857% 16.667%, 57.143% 16.667%, 57.143% 0%,
    85.714% 0%, 85.714% 16.667%, 100% 16.667%, 100% 50%, 85.714% 50%,
    85.714% 66.667%, 71.429% 66.667%, 71.429% 83.333%, 57.143% 83.333%,
    57.143% 100%, 42.857% 100%, 42.857% 83.333%, 28.571% 83.333%,
    28.571% 66.667%, 14.286% 66.667%, 14.286% 50%, 0% 50%, 0% 16.667%,
    14.286% 16.667%
  );
  opacity: 0.45;
  animation: cg-dot 1.2s ease-in-out infinite;
}

.cg-dots i:nth-child(2) { animation-delay: 0.16s; }
.cg-dots i:nth-child(3) { animation-delay: 0.32s; }

@keyframes cg-dot {
  0%, 100% { opacity: 0.35; transform: translateY(0) scale(0.9); }
  40% { opacity: 1; transform: translateY(-6px) scale(1.15); }
}

/* ── THE GLITCH, IN PASTEL ──────────────────────────────────────────────── */
.cg-broke {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: cg-sway 5s ease-in-out infinite;
}

/*
 * A SWAY, NOT A JOLT. The old version snapped sideways on a steps() timeline,
 * which read as aggressive. Rocking gently says "something is loose in here"
 * without ever feeling hostile.
 */
@keyframes cg-sway {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-2px, 1px) rotate(-0.3deg); }
  60% { transform: translate(2px, -1px) rotate(0.3deg); }
}

.cg-broke-art {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
}

.cg-broke-face {
  font-size: clamp(30px, 9vw, 42px);
  color: #ffffff;
  letter-spacing: 2px;
  text-shadow:
    2px 0 var(--cg-pink),
    -2px 0 #9b6bff,
    0 3px 12px rgba(59, 18, 102, 0.45);
  animation: cg-face-live 4.4s ease-in-out infinite;
}

/*
 * IT BLINKS, AND THE BLINK IS A SQUASH.
 *
 * The wobble and the blink are ONE keyframe set rather than two animations,
 * because both of them are a transform and two animations naming the same
 * property do not blend — the second silently wins and the face just tilts. So
 * the rock is the baseline of the timeline and the blink is a scaleY dropped to
 * a sliver for three percent of it, twice a cycle, at slightly uneven spacing
 * so it never reads as a metronome.
 */
@keyframes cg-face-live {
  0% { transform: rotate(-3deg) scale(1, 1); }
  24% { transform: rotate(0deg) scale(1.03, 1); }
  26.5% { transform: rotate(0deg) scale(1.03, 0.12); }
  29% { transform: rotate(0deg) scale(1.03, 1); }
  50% { transform: rotate(3deg) scale(1.05, 1); }
  73% { transform: rotate(0.5deg) scale(1, 1); }
  75.5% { transform: rotate(0.5deg) scale(1, 0.1); }
  78% { transform: rotate(0.5deg) scale(1, 1); }
  100% { transform: rotate(-3deg) scale(1, 1); }
}

/* ── THE CRACKED HEART THAT MENDS ───────────────────────────────────────── */
/*
 * Two halves of one pixel heart in a fixed frame. Each half is a window with
 * overflow hidden holding a FULL heart pushed to its own edge, so the two
 * windows together compose one whole shape when they close — which is the
 * entire trick: there is no seam to hide, because at rest it is simply the
 * heart, cut down the middle.
 */
.cg-mend {
  position: relative;
  display: inline-block;
  width: clamp(28px, 7.5vw, 38px);
  aspect-ratio: 7 / 6;
  animation: cg-tilt 3.6s ease-in-out infinite;
}

.cg-mend-half {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  overflow: hidden;
}

.cg-mend-half .cg-pxheart {
  position: absolute;
  top: 0;
  width: 200%;
  height: 100%;
}

.cg-mend-l { left: 0; animation: cg-crack-l 3.8s ease-in-out infinite; }
.cg-mend-r { right: 0; animation: cg-crack-r 3.8s ease-in-out infinite; }
.cg-mend-l .cg-pxheart { left: 0; }
.cg-mend-r .cg-pxheart { right: 0; }

@keyframes cg-crack-l {
  0%, 52% { transform: translateX(-3px) rotate(-7deg); }
  70%, 88% { transform: translateX(0) rotate(0deg); }
  100% { transform: translateX(-3px) rotate(-7deg); }
}

@keyframes cg-crack-r {
  0%, 52% { transform: translateX(3px) rotate(7deg); }
  70%, 88% { transform: translateX(0) rotate(0deg); }
  100% { transform: translateX(3px) rotate(7deg); }
}

/* The little flash at the seam, timed to the moment the two halves meet. */
.cg-mend-spark {
  position: absolute;
  left: 50%;
  top: 42%;
  font-size: 13px;
  color: #fff3fa;
  text-shadow: 0 0 10px var(--cg-pink);
  opacity: 0;
  animation: cg-mend-flash 3.8s ease-in-out infinite;
}

@keyframes cg-mend-flash {
  0%, 62% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
  72% { opacity: 1; transform: translate(-50%, -50%) scale(1.25); }
  86% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
}

@keyframes cg-tilt {
  0%, 100% { transform: rotate(5deg) translateY(0); }
  50% { transform: rotate(-6deg) translateY(-4px); }
}

/*
 * A SHIMMER, NOT A FLICKER. The split breathes in and out on an ease curve
 * instead of snapping between extremes on steps() — same "signal coming apart"
 * idea, rendered as something soft and slightly dreamy.
 */
/*
 * WHITE TYPE WITH A CHROMATIC SPLIT, not lilac type on lilac. The old version
 * set this in a muted purple barely a shade off the page behind it, which is
 * how a "broken" screen ends up looking merely faded. White carries the full
 * contrast and lets the pink and the violet fringes do the glitching.
 */
.cg-broke-head {
  font-size: clamp(26px, 8vw, 38px);
  line-height: 1.05;
  color: #ffffff;
  animation: cg-shimmer 3.4s ease-in-out infinite;
}

@keyframes cg-shimmer {
  0%, 100% {
    text-shadow:
      2px 0 var(--cg-pink),
      -2px 0 #9b6bff,
      0 4px 16px rgba(59, 18, 102, 0.4);
    transform: translateX(0) rotate(-0.7deg);
  }
  35% {
    text-shadow:
      4px 0 var(--cg-pink-hot),
      -4px 1px #8f5bff,
      0 4px 18px rgba(59, 18, 102, 0.45);
    transform: translateX(1px) rotate(0.9deg);
  }
  70% {
    text-shadow:
      -3px 1px var(--cg-pink),
      3px -1px #9b6bff,
      0 4px 16px rgba(59, 18, 102, 0.4);
    transform: translateX(-1px) rotate(-0.5deg);
  }
}

.cg-broke-body {
  font-size: clamp(16px, 4.6vw, 19px);
  line-height: 1.35;
  color: #f6e9ff;
  text-shadow: 0 2px 8px rgba(59, 18, 102, 0.45);
}

/* Pastel tear bars drifting across the page. */
.cg-tears {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.cg-tear {
  position: absolute;
  left: -20%;
  width: 140%;
  font-size: 17px;
  letter-spacing: 8px;
  white-space: nowrap;
  opacity: 0.3;
  color: #ffd0ea;
}

.cg-tear-1 { top: 20%; animation: cg-tear-a 4.2s ease-in-out infinite; }
.cg-tear-2 { top: 52%; color: #e0bcff; animation: cg-tear-b 5.4s ease-in-out infinite; }
.cg-tear-3 { top: 79%; animation: cg-tear-a 4.8s ease-in-out infinite reverse; }

@keyframes cg-tear-a {
  0%, 100% { transform: translateX(0); opacity: 0.22; }
  50% { transform: translateX(-12px); opacity: 0.42; }
}

@keyframes cg-tear-b {
  0%, 100% { transform: translateX(0); opacity: 0.2; }
  50% { transform: translateX(14px); opacity: 0.4; }
}

.cg-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 2px solid var(--cg-pink);
  border-left-width: 5px;
  border-radius: 14px;
  background: var(--cg-cream);
  box-shadow: 0 4px 0 rgba(142, 47, 176, 0.35);
  font-size: clamp(14px, 4vw, 16px);
  line-height: 1.35;
  color: var(--cg-ink);
  animation: cg-pop-soft 340ms cubic-bezier(0.34, 1.5, 0.64, 1) both;
}

@keyframes cg-pop-soft {
  0% { opacity: 0; transform: translateY(-6px) scale(0.94); }
  60% { opacity: 1; transform: translateY(0) scale(1.03); }
  100% { opacity: 1; transform: none; }
}

/* ── THE STAGE: TWO STEPS IN A BOX THAT CANNOT CHANGE SIZE ──────────────── */
/*
 * From the twist onward this is the whole layout: one container, two steps
 * inside it, and the container is the same size on both of them.
 */
.cg-stage {
  display: flex;
  flex-direction: column;
}

/*
 * THE MESSAGE RISES ONCE. It is not re-keyed between twist and verifying, so
 * this animation plays a single time on entering the stage and the message
 * then sits perfectly still while the box below it is ticked. Re-mounting it
 * would make it jump every time the phase changed.
 */
.cg-msg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: cg-rise 520ms cubic-bezier(0.34, 1.25, 0.64, 1) both;
  transition:
    font-size 320ms ease-out,
    opacity 320ms ease-out;
}

@keyframes cg-rise {
  0% { opacity: 0; transform: translateY(26px) scale(0.97); filter: blur(3px); }
  100% { opacity: 1; transform: none; filter: none; }
}

/*
 * THE PAYOFF SCREEN ONLY. The setup message no longer shares a screen with the
 * grid, so there is nothing left to make room for and nothing to compact
 * mid-flight — it simply mounts at this size on the way in.
 *
 * That is deliberate. Compacting used to mean animating a font-size, which
 * reflows every frame and drops the body from three lines to two in ONE frame
 * however long the transition runs. Having the message leave with the checkbox
 * instead of shrinking in place removes that reflow from the swap entirely.
 */
.cg-msg.is-compact .cg-msg-head {
  font-size: clamp(19px, 5.4vw, 24px);
}

.cg-msg.is-compact .cg-msg-body {
  font-size: clamp(14px, 4vw, 16px);
  opacity: 0.8;
}

/*
 * ═══ THE SWAP, AND THE ONE THING THAT WAS ACTUALLY WRONG WITH IT ═══════════
 *
 * THE LURCH WAS NEVER THE ANIMATION. It was the page re-centring underneath
 * it. .cg-page is a centred flex box, so the panel's position on screen is a
 * function of its HEIGHT: swap a ~250px checkbox step for a ~570px grid and
 * the midpoint of the centred block moves, which moves the top of the panel
 * ~160px up the page in a single frame. Fading, growing or crossfading the
 * content does nothing about that, because the thing that jumped is the
 * layout, not the content. Every previous pass animated the content harder.
 *
 * SO THE HEIGHT IS TAKEN OUT OF THE PROBLEM. Both steps are mounted the whole
 * time and stacked in ONE grid cell, so this container is always exactly as
 * tall as the taller of the two — the grid — no matter which step is on
 * screen. Swapping steps cannot change its height, so the page cannot
 * re-centre, so there is nothing left to jump. That alone is the fix.
 *
 * AND IT IS A REAL HEIGHT, NOT A GUESSED ONE. Nothing here is a magic pixel
 * number: the cell is sized by the grid step's own content at whatever width
 * the phone happens to be, so it is right on a 320px screen and right on a
 * 460px column and right after a rotation, and the grid can never be clipped
 * by a height that was measured on somebody else's device.
 *
 * WHAT THIS REPLACED: a crossfade with an absolutely-positioned ghost copy of
 * the outgoing panel, hung off the centre line to survive the resize. With
 * the resize gone there is nothing for a ghost to hide, and no second copy of
 * the widget to keep in sync.
 */
.cg-steps {
  position: relative;
  display: grid;
  /* One cell. Both panes are placed in it, so the row is sized by the taller
     of them and is unaffected by which one is showing. */
  grid-template-areas: 'step';
  grid-template-columns: minmax(0, 1fr);
  /* The clip the slide happens behind. */
  overflow: hidden;
  /*
   * Sideways room for the shadows. overflow:hidden clips at the padding edge,
   * so the padding buys the widget's and the grid's drop shadows somewhere to
   * fall without being sliced off down the sides, while the vertical clip
   * stays tight against the panes — which is the edge the slide needs.
   * The negative margin cancels it, so the column is still 460px wide.
   */
  margin-inline: -20px;
  padding-inline: 20px;
}

/*
 * THE TWO STEPS. Both are stretched grid items, so each one is exactly the
 * container's height — which is what makes translateY(±100%) land precisely
 * one step away with no measurement anywhere.
 *
 * TRANSFORM ONLY. No height, no top, no margin, no auto anything: a transform
 * is not a layout property, so the browser skips straight to compositing it
 * and the swap cannot reflow the page even in principle.
 */
.cg-pane {
  grid-area: step;
  min-width: 0;
  display: flex;
  flex-direction: column;
  /* The short step floats in the middle of the tall box rather than sitting
     at the top of it with a hole underneath. */
  justify-content: center;
  position: relative;
  /* Vertical room for the same shadows, inside the clip. */
  padding-block: 12px;
  /* Parked one step away. The box leaves upwards, the grid waits below. */
  transform: translateY(100%);
  /*
   * A HAIR OF FADE UNDER THE SLIDE. The movement was already smooth; what it
   * lacked was a soft edge at the clip boundary, where a pane used to arrive at
   * full opacity the instant its first pixel cleared the mask. Fading between
   * 0.35 and 1 over the same curve takes that hard line off without ever
   * letting either step become a ghost - at 0.35 the outgoing step is still
   * plainly there, which is what stops the swap reading as a crossfade between
   * two different screens rather than as one panel moving.
   */
  opacity: 0.35;
  /*
   * visibility, and the delay on it, is what keeps the parked step out of the
   * tab order and out of the accessibility tree WITHOUT taking it out of the
   * layout — display:none or unmounting would collapse the cell and bring the
   * resize straight back. The 0s change is delayed until the slide is over so
   * the outgoing step stays visible for the whole of its exit.
   *
   * THE DELAY IS TIED TO THE DURATION. Both numbers below are 520ms and they
   * are the same 520ms: shorten the transform without shortening the delay and
   * the finished pane sits there un-hidden for the difference, catching tabs.
   */
  visibility: hidden;
  transition:
    transform 520ms cubic-bezier(0.62, 0.04, 0.24, 1),
    opacity 520ms ease-out,
    visibility 0s linear 520ms;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* The checkbox step slides UP and out; the grid comes UP from underneath. */
.cg-pane-box {
  transform: translateY(-100%);
}

/*
 * THE CURVE, AND WHY IT CHANGED. The old cubic-bezier(0.32, 0.72, 0.24, 1) put
 * 78% of the travel into the first 200ms - measured, not guessed - so the panel
 * lurched and then crawled the last few pixels. cubic-bezier(0.62, 0.04, 0.24,
 * 1) eases IN as well as out: the step gathers itself, moves, and settles, and
 * the extra 100ms of duration is what gives that shape room to be felt.
 */
.cg-pane.is-showing {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
  transition:
    transform 520ms cubic-bezier(0.62, 0.04, 0.24, 1),
    opacity 380ms ease-out,
    visibility 0s linear 0s;
}

/*
 * THE EMPTY ROOM AROUND THE SHORT STEP.
 *
 * The container is grid-height, so the checkbox has ~150px of air above and
 * below it. Four soft shapes drift out there — well clear of the words, behind
 * them in the stack, and inside the pane so they leave WITH the checkbox — and
 * the space reads as deliberate instead of as a panel that came up short.
 */
.cg-room {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.cg-room i {
  position: absolute;
  font-style: normal;
  color: #ffffff;
  text-shadow: 0 0 14px rgba(255, 105, 180, 0.9);
  animation: cg-room-bob 8s ease-in-out infinite;
}

.cg-room-1 { top: 7%; left: 11%; font-size: 26px; animation-duration: 8.6s; }
.cg-room-2 { top: 14%; right: 14%; font-size: 17px; animation-duration: 7.2s; animation-delay: -2.4s; }
.cg-room-3 { bottom: 8%; right: 17%; font-size: 30px; animation-duration: 9.4s; animation-delay: -4.1s; }
.cg-room-4 { bottom: 16%; left: 16%; font-size: 16px; animation-duration: 7.8s; animation-delay: -1.3s; }

@keyframes cg-room-bob {
  0%, 100% { transform: translateY(0) rotate(-6deg) scale(0.94); opacity: 0.3; }
  50% { transform: translateY(-14px) rotate(6deg) scale(1.06); opacity: 0.6; }
}

/*
 * The panel holds the message as well as the interaction, so it carries the
 * spacing the stage used to provide between the two. It sits above the
 * floating shapes, and it is sized by its content — the pane around it is what
 * is stretched, never this.
 */
.cg-lower {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

/*
 * THE SPRING, WHERE A SPRING IS SAFE. The checkbox panel bounces in on arrival
 * and the payoff pops, because on both of those screens nothing is travelling
 * and an overshoot is pure charm. THE SLIDE INTO THE GRID GETS NEITHER: it is
 * one movement, and a bounce riding on top of it is a second event.
 *
 * These live on .cg-lower rather than on .cg-pane on purpose — the pane's
 * transform is the slide, and an animation on the same element would win
 * outright and take the slide with it.
 */
.cg-lower.is-intro {
  animation: cg-bounce-in 620ms cubic-bezier(0.34, 1.42, 0.64, 1) both;
}

@keyframes cg-bounce-in {
  0% { opacity: 0; transform: translateY(26px) scale(0.94); }
  55% { opacity: 1; }
  100% { opacity: 1; transform: none; }
}

.cg-lower.is-payoff {
  animation: cg-pop-in 560ms cubic-bezier(0.34, 1.6, 0.64, 1) both;
}

@keyframes cg-pop-in {
  0% { opacity: 0; transform: scale(0.86); }
  60% { opacity: 1; transform: scale(1.04); }
  100% { opacity: 1; transform: none; }
}

.cg-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes cg-settle {
  0% { opacity: 0; transform: translateY(10px) scale(0.97); filter: blur(3px); }
  100% { opacity: 1; transform: none; filter: none; }
}

/*
 * WHITE ON THE LAVENDER, WITH A MAGENTA UNDER-SHADOW.
 *
 * This used to be #c2418c type directly on a near-white page, which is a pink
 * on a pink and reads washed out however heavy the font is. On a saturated
 * lavender the strongest, most Y2K thing available is white type with a hard
 * offset shadow in the deep pink and a hot glow behind it — vivid, high
 * contrast, and it lets the background stay rich instead of being drained to
 * make the text readable.
 */
.cg-msg-head {
  font-size: clamp(24px, 7vw, 32px);
  line-height: 1.1;
  color: #ffffff;
  text-shadow:
    0 2px 0 var(--cg-pink-deep),
    0 0 20px rgba(255, 105, 180, 0.75);
  animation: cg-wiggle-in 560ms cubic-bezier(0.34, 1.55, 0.64, 1) both;
}

@keyframes cg-wiggle-in {
  0% { transform: rotate(-4deg) scale(0.88); opacity: 0; }
  55% { transform: rotate(2deg) scale(1.05); opacity: 1; }
  78% { transform: rotate(-1deg) scale(0.99); }
  100% { transform: none; opacity: 1; }
}

/* The punchline gets a slower, prouder entrance than the twist did — and a
   bright green with a glow, so the "passed" reads instantly. */
.cg-pass-head {
  color: #ffffff;
  text-shadow:
    0 2px 0 #157f3c,
    0 0 22px rgba(34, 197, 94, 0.9);
  animation: cg-pop-big 620ms cubic-bezier(0.34, 1.6, 0.64, 1) both;
}

@keyframes cg-pop-big {
  0% { transform: scale(0.7) rotate(-6deg); opacity: 0; }
  60% { transform: scale(1.12) rotate(3deg); opacity: 1; }
  100% { transform: none; opacity: 1; }
}

/*
 * TWO SHADOWS, AND THE TIGHT ONE IS THE IMPORTANT ONE. White body type crosses
 * the brightest part of the payoff bloom, where a soft wide glow alone has
 * nothing to bite on and the line goes milky. The 1px offset underneath gives
 * every letter a hard edge to sit on; the wide one is only atmosphere.
 */
.cg-msg-body {
  font-size: clamp(17px, 4.8vw, 20px);
  line-height: 1.35;
  color: #fffafd;
  text-shadow:
    0 1px 0 rgba(122, 26, 96, 0.75),
    0 2px 14px rgba(59, 18, 102, 0.6);
  transition: font-size 320ms ease-out, opacity 320ms ease-out;
}

.cg-hint {
  font-size: 15px;
  color: #ffe3f5;
  text-shadow: 0 1px 8px rgba(142, 47, 176, 0.6);
  animation: cg-pulse 2.4s ease-in-out infinite;
}

@keyframes cg-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* ── THE WIDGET ─────────────────────────────────────────────────────────── */
/*
 * THE WIDGET, SOFTENED AND BRIGHTENED.
 *
 * White card, fat rounded corners, a hot pink edge and a solid drop under it
 * rather than the grey 90s bevel it used to wear. It still reads instantly as
 * "the captcha box" — the badge and the layout are what carry that, not the
 * chrome — while a white card on a saturated lavender page is the single
 * highest-contrast thing in the whole gate, which is exactly what the one
 * element you are meant to tap should be.
 */
.cg-widget {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px;
  background: #fff;
  border: 2px solid var(--cg-pink);
  border-radius: 18px;
  box-shadow:
    0 5px 0 var(--cg-orchid-deep),
    0 14px 26px rgba(59, 18, 102, 0.28);
  transition: box-shadow 320ms ease-out;
}

/* The moment a real one goes green. */
.cg-widget.is-passed {
  border-color: var(--cg-green);
  box-shadow:
    0 0 0 4px rgba(34, 197, 94, 0.35),
    0 5px 0 #157f3c,
    0 14px 30px rgba(34, 197, 94, 0.35);
}

.cg-check {
  position: relative;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  background: linear-gradient(180deg, #ffffff, #fff0f8);
  border: 2px solid var(--cg-pink);
  border-radius: 11px;
  box-shadow:
    inset 0 -3px 0 rgba(255, 105, 180, 0.28),
    0 2px 0 rgba(142, 47, 176, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition:
    transform 180ms cubic-bezier(0.34, 1.5, 0.64, 1),
    box-shadow 200ms ease-out;
}

/*
 * ── THE BOX STARTS EMPTY, AND THAT IS THE WHOLE AFFORDANCE ────────────────
 *
 * An earlier pass put a faint heart inside the empty box, on the theory that it
 * made the tickbox itself cute. It made it look ALREADY TICKED. Nobody taps a
 * checkbox that appears to be filled in, and the one thing this screen has to
 * communicate is "tap me" — the entire gate stalls here otherwise.
 *
 * EMPTINESS IS THE INSTRUCTION. A real "I'm not a robot" box is a plain empty
 * square and everyone alive has been trained to click one; the whole joke
 * downstream depends on that muscle memory firing. So the resting state is
 * nothing at all — white fill, a clear border, and an inner shadow that reads
 * as a hollow to drop something into. The heart is the REWARD for tapping, not
 * the decoration on the invitation.
 *
 * The pull to make this cuter at rest should be resisted. Anything drawn in
 * here — a ghost heart, a dotted outline, a faint tick — costs the tap.
 */
.cg-check {
  /* A deeper hollow than a flat white square: it looks like it wants filling. */
  box-shadow:
    inset 0 2px 4px rgba(142, 47, 176, 0.18),
    inset 0 -3px 0 rgba(255, 105, 180, 0.22),
    0 2px 0 rgba(142, 47, 176, 0.3);
}

/* Waiting to be tapped: it breathes, which is the second "I am tappable" cue
   after the emptiness itself. */
.cg-check:not(:disabled) {
  animation: cg-check-breathe 2.6s ease-in-out infinite;
}

@keyframes cg-check-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); }
}

/* Hover brightens the edge and lifts the ring — a pointer cue that costs the
   empty state nothing, since it only exists while a cursor is over it. */
.cg-check:not(:disabled):hover {
  border-color: var(--cg-pink-hot);
  box-shadow:
    inset 0 2px 4px rgba(142, 47, 176, 0.18),
    0 0 0 4px rgba(255, 105, 180, 0.28),
    0 2px 0 rgba(142, 47, 176, 0.3);
}

/* And it squishes under the thumb. */
.cg-check:not(:disabled):active {
  animation: cg-squish 220ms cubic-bezier(0.3, 0.8, 0.4, 1) both;
  box-shadow:
    inset 0 3px 6px rgba(142, 47, 176, 0.28),
    0 0 0 rgba(142, 47, 176, 0.3);
}

.cg-check:disabled { cursor: default; }

/* ── THE TICK: A HEART DROPS IN ─────────────────────────────────────────── */
/*
 * THIS is where the heart belongs. It is what the tap produces — the sweet
 * twist on the checked state — so it arrives with a pop rather than simply
 * being present, and the burst of little hearts fires from the same instant.
 *
 * TWO ANIMATIONS ON ONE ELEMENT, SEQUENCED BY DELAY. The pop runs once for
 * 420ms and the idle hop starts at 420ms, so they never overlap and never both
 * own the transform. The pop deliberately has NO fill mode: it ends at the
 * heart's natural size, hands the element back with no transform pinned, and
 * the hop takes it from there. A "forwards" on the pop would freeze the heart
 * and the loader would never move.
 */
.cg-mini {
  width: 15px;
  display: inline-block;
  animation: cg-heart-check 420ms cubic-bezier(0.34, 1.7, 0.64, 1);
}

.cg-mini-hop {
  animation:
    cg-heart-check 420ms cubic-bezier(0.34, 1.7, 0.64, 1),
    cg-hop 0.9s cubic-bezier(0.3, 0.9, 0.4, 1) 420ms infinite;
}

@keyframes cg-heart-check {
  0% { transform: scale(0) rotate(-30deg); opacity: 0; }
  45% { transform: scale(1.45) rotate(8deg); opacity: 1; }
  70% { transform: scale(0.9) rotate(-4deg); }
  100% { transform: none; opacity: 1; }
}

/* GREEN, like the real thing. It is the payoff the muscle memory waits for. */
.cg-check-green {
  font-size: 23px;
  line-height: 1;
  color: var(--cg-green);
  text-shadow: 0 0 12px rgba(34, 197, 94, 0.7);
  animation: cg-stamp 620ms cubic-bezier(0.34, 1.7, 0.64, 1) both;
}

/* Bouncier than a stamp now: it overshoots, settles back past its mark, and
   only then sits down. */
@keyframes cg-stamp {
  0% { transform: scale(0.2) rotate(-18deg); opacity: 0; }
  45% { transform: scale(1.45) rotate(7deg); opacity: 1; }
  65% { transform: scale(0.88) rotate(-4deg); }
  82% { transform: scale(1.12) rotate(2deg); }
  100% { transform: none; opacity: 1; }
}

/* ── THE HEART POP ──────────────────────────────────────────────────────── */
/*
 * Six little hearts flung out of the checkbox, once, on tick and again on
 * success. Each one is a separate element with its own angle so the burst is
 * uneven — a perfectly symmetrical one looks mechanical.
 */
.cg-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cg-burst i {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 13px;
  font-style: normal;
  color: #ff69b4;
  opacity: 0;
  animation: cg-burst-out 900ms cubic-bezier(0.2, 0.8, 0.3, 1) both;
}

.cg-burst-1 { --bx: -26px; --by: -22px; animation-delay: 0ms; }
.cg-burst-2 { --bx: 24px; --by: -26px; animation-delay: 40ms; color: #d98cf5; }
.cg-burst-3 { --bx: -30px; --by: 10px; animation-delay: 90ms; }
.cg-burst-4 { --bx: 30px; --by: 14px; animation-delay: 30ms; color: #d98cf5; }
.cg-burst-5 { --bx: -8px; --by: -34px; animation-delay: 120ms; }
.cg-burst-6 { --bx: 10px; --by: 30px; animation-delay: 70ms; }

@keyframes cg-burst-out {
  0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
  25% { opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--bx)), calc(-50% + var(--by)))
      scale(1.1) rotate(18deg);
    opacity: 0;
  }
}

/*
.cg-check-label {
  flex: 1 1 auto;
  font-size: 17px;
  color: #2b2233;
}

/* Drab on purpose — it is the part of a real widget nobody looks at. */
.cg-badge {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
  color: #a89aa8;
}

.cg-badge-mark { font-size: 17px; color: var(--cg-pink-hot); }
.cg-badge-name { font-size: 11px; letter-spacing: 0.5px; }
.cg-badge-sub { font-size: 9px; }

/* ── BUTTONS ON THE PAGE ────────────────────────────────────────────────── */
.cg-btnrow {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  /* Small, because .cg-status above it is a fixed-height row that is empty most
     of the time and is already most of the space between the card and here. */
  margin-top: 4px;
}

.cg-btn {
  font-family: var(--font-vt323), monospace;
  font-size: 19px;
  padding: 7px 22px;
  min-height: 44px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  background: linear-gradient(180deg, #ffffff, #f6e7ff);
  color: var(--cg-ink);
  border: 2px solid var(--cg-orchid);
  border-radius: 999px;
  box-shadow: 0 4px 0 rgba(142, 47, 176, 0.55);
  transition: box-shadow 160ms ease-out;
}

/*
 * THE SQUISH, AND IT HAS TO BE AN ANIMATION RATHER THAN A TRANSFORM.
 *
 * Both buttons on the broken screen are already running an idle wobble, and an
 * animation beats a plain transform declaration on the same element no matter
 * how specific the selector is — so an :active rule setting transform here
 * would simply do nothing on the two buttons that most want to squish. It has
 * to REPLACE the animation, which is what this does. Swapping the
 * animation itself is what actually lands: while held, the wobble is replaced
 * by the squish, and on release the idle picks straight back up.
 */
.cg-btn:active {
  animation: cg-squish 220ms cubic-bezier(0.3, 0.8, 0.4, 1) both;
  box-shadow: 0 1px 0 rgba(142, 47, 176, 0.55);
}

@keyframes cg-squish {
  0% { transform: translateY(0) scale(1, 1); }
  45% { transform: translateY(3px) scale(0.93, 0.89); }
  100% { transform: translateY(2px) scale(0.96, 0.97); }
}

/*
 * The love button carries the app's own titlebar gradient, --win-title-start
 * into --win-title-end, turned vertical. It is the single most saturated thing
 * on the page, which is the point: it is the way forward.
 */
.cg-btn-love {
  background: linear-gradient(180deg, var(--cg-pink), var(--cg-orchid));
  color: #fff;
  border-color: #ffd0e8;
  box-shadow:
    0 4px 0 var(--cg-orchid-deep),
    0 10px 22px rgba(255, 46, 154, 0.4);
  text-shadow: 1px 1px 0 rgba(90, 12, 70, 0.35);
  animation: cg-wobble-btn 3s ease-in-out infinite;
}

.cg-btn-love:active {
  box-shadow:
    0 1px 0 var(--cg-orchid-deep),
    0 6px 14px rgba(255, 46, 154, 0.35);
}

/*
 * The [details] button sways too, on a longer, lazier clock than [try again].
 * Two buttons wobbling in step would look like the page is vibrating; offset,
 * they look like two things fidgeting.
 */
.cg-broke .cg-btn:not(.cg-btn-love) {
  animation: cg-sway-btn 4.6s ease-in-out infinite;
}

@keyframes cg-sway-btn {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  45% { transform: rotate(-1deg) translateY(-1.5px); }
  75% { transform: rotate(0.8deg) translateY(0); }
}

@keyframes cg-wobble-btn {
  0%, 100% { transform: rotate(0deg) scale(1); }
  40% { transform: rotate(-1.2deg) scale(1.03); }
  70% { transform: rotate(1.2deg) scale(1.02); }
}

.cg-btn:disabled { opacity: 0.6; cursor: default; animation: none; }

/*
 * A SOFT RING INSTEAD OF THE BROWSER'S BLACK ONE. [try again] is autofocused,
 * so the default outline is on screen the whole time the glitch is — a hard
 * black rectangle around the one cute pink pill on the page. This keeps the
 * focus indicator (it has to stay: it is how the gate is operated by keyboard)
 * and simply dresses it in white, which reads clearly against both the lavender
 * page and the pink button.
 */
.cg-btn:focus-visible,
.cg-check:focus-visible,
.cg-tile:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 3px;
}

/*
 * THE TILE'S FOCUS RING TURNS INWARD, for the same reason its selection ring
 * did: the grid is a flush block with a 3px divider and a hard clip at the
 * card's edge, so a ring drawn 3px OUTSIDE the tile would land on the
 * neighbour and be sliced off entirely on the rim. Negative offset puts the
 * same white ring just inside the photograph, where it is legible against
 * anything and cannot be cropped.
 */
.cg-tile:focus-visible {
  outline-offset: -3px;
}

/* ── THE CHALLENGE ──────────────────────────────────────────────────────── */
/*
 * No entrance of its own: .cg-lower slides the whole half in.
 *
 * THE GAP IS ZERO, AND THAT IS THE WHOLE POINT OF THIS COLUMN.
 *
 * A flex gap here would space FOUR children - the band, the card, the nudge row
 * and the button row - but only three of those boundaries are boundaries. The
 * band and the card are not two objects that happen to be stacked; they are the
 * top and the bottom of ONE widget. That is why .cg-prompt is rounded
 * 16px 16px 0 0 and .cg-grid is rounded 0 0 16px 16px, and why the note on
 * .cg-prompt's box-shadow says its bottom "is not an edge - it is the seam
 * where the header meets the grid card" and refuses to draw a rim along it.
 * Any gap at all puts daylight through that seam, and the widget stops being a
 * captcha panel and becomes a caption floating above a picture frame.
 *
 * SO THE SPACING MOVED OFF THE CONTAINER AND ONTO THE CHILDREN THAT NEED IT.
 * .cg-status carries the air below the card and .cg-btnrow carries its own.
 * That is more verbose than one gap, and it is the only way to say "these two
 * are joined and those two are not" inside a single flex column.
 */
.cg-challenge {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/*
 * The band is the single most recognisable part of a real photo challenge, and
 * it is what keeps the straight face while the prompt says something no real
 * one ever would. Pink rather than corporate blue — the machine has already
 * stopped pretending by this point.
 */
.cg-prompt {
  position: relative;
  overflow: hidden;
  padding: 15px 17px;
  /*
   * MUTED LAVENDER INTO SOFT ORCHID — THE THIRD AND FINAL SETTING, AND THE
   * OTHER TWO ARE BOTH RECORDED HERE BECAUSE EACH WAS RIGHT ABOUT SOMETHING.
   *
   *   full titlebar pink   var(--cg-pink) into var(--cg-orchid), the homepage
   *                        titlebar exactly. It rhymed with every other screen
   *                        in the gate and it was the loudest object on the
   *                        one screen carrying nine photographs.
   *   lavender             #a78fda into #c3adee. It stopped dominating and it
   *                        stopped rhyming: too far out of the family, and the
   *                        grid step read as a screen from somewhere else.
   *
   * THE DISAGREEMENT WAS NEVER PINK-OR-LAVENDER, IT WAS INTENSITY. Both earlier
   * settings treated hue as the dial. It is not: what made the band dominate
   * was SATURATION, and what made it belong was staying in the purple family.
   * Those are independent, so both can be had. This gradient runs the same
   * band, the same size, the same position and the same white type through the
   * gate's own purples at a lower intensity — it still reads as kin to the
   * lilac wash behind it and to the widget on the screen before, and it no
   * longer wins against the pictures underneath it.
   *
   * IT IS NOT LIGHTER, IT IS LESS SATURATED, and that distinction is what
   * protects the white type. Both stops sit slightly DARKER than the hot pink
   * they replaced, so contrast against white went up rather than down while the
   * band got quieter. Anything paler than this and the text starts needing the
   * shadow to survive, which is a band doing its own legibility a favour at the
   * cost of the reader.
   *
   * AND IT CARRIES A SOFT PINK AT ITS LEFT END AGAIN, WHICH THE ALL-LAVENDER
   * VERSION DID NOT. That version was tuned against a page that was, at the
   * time, a full-strength pink wash — a lavender band on a magenta page reads
   * as a foreign object rather than as restraint. With the wash down to a warm
   * breath the band can hold the gate's pink again, at the soft end of it, and
   * resolve into the same lavender the page is made of. Left stop pink, right
   * stop lavender: the band is the gradient between the two colours the whole
   * gate is built from, which is what a masthead here should be.
   *
   * AND IT WARMED AGAIN WHEN THE CARD BECAME PAPER. The two-stop version ran a
   * cool rose into lavender, which was right above a cool cream card and wrong
   * above a warm one — the band and the paper disagreed about the temperature
   * of the screen and the join between them showed. The middle stop is what
   * fixes it: the gradient now leaves from a warm blush, passes through the
   * gate's orchid, and lands on the lavender the page is made of, so the band
   * belongs to the card at its left edge and to the page at its right.
   *
   * The shadow stays at the softened 0.3 rather than the original 0.35 — it is
   * what stops the band looking like it is floating above the card instead of
   * capping it.
   */
  /*
   * DEEPER THAN THE PAGE, WHICH IS THE ONLY THING THAT ACTUALLY SEPARATED IT.
   *
   * The previous gradient ended on #b48ad6 and the page behind it is
   * var(--cg-lav) #c8a2e8. Those are the same colour to within a few percent of
   * lightness, so the band's right-hand half had no edge at all — it was not
   * subtle, it was invisible, and the header stopped being an object. Every
   * earlier attempt to fix this screen reached for saturation; the missing
   * dimension was VALUE. This gradient is a rich rose into a deep violet, both
   * roughly half the lightness of the page, so the band reads as a distinct
   * object against it at every point across its width.
   *
   * IT IS DEEPER, NOT HOTTER. #c2559b is a long way from the #ff69b4 that made
   * this screen a pink blob three passes ago — it is the same family taken
   * DOWN in value rather than UP in intensity, which is how a header can
   * dominate its own edges without dominating the photographs.
   *
   * AND THE TYPE FINALLY PASSES. White on these two stops runs 4.1:1 and
   * 4.7:1, where every previous version of this band sat around 2.7:1 and
   * failed WCAG AA even for large text. The band got more legible and more
   * distinct in the same change, because both were the same problem.
   */
  /*
   * -- THE THIRD LANE: DUSTY BLUE --------------------------------------------
   *
   * THE PROBLEM THIS SOLVES IS NOT THAT THE OLD BAND WAS UGLY. It was a rose
   * into a deep violet, tuned over three passes, and every one of those passes
   * was about the same two axes - how saturated, how deep. Both of them are
   * axes WITHIN THE PINK-AND-VIOLET FAMILY, which is the family the page behind
   * it and the button below it are also made of. So the band could only ever be
   * a lighter or darker version of its neighbours, and it spent its whole life
   * trapped between two failures:
   *
   *   quieter  ->  it slid toward the lavender page and stopped being an object
   *   louder   ->  it argued with the verify button over which one is the
   *                action, and the button has to win that argument
   *
   * THE WAY OUT IS A THIRD HUE, NOT A THIRD BRIGHTNESS. Three elements, three
   * lanes:
   *
   *   the page      lilac into cotton-candy pink, low contrast, RECEDES
   *   this band     dusty blue, calm and mid-dark, an OBJECT
   *   verify        hot pink into orchid, the loudest thing here, the ACTION
   *
   * Nothing can now be confused for anything else, and the band stopped needing
   * to be loud in order to be visible - it is visible because it is the only
   * cool thing on a warm screen.
   *
   * WARM CREAM WAS THE OTHER CANDIDATE AND IT IS RULED OUT BY GEOMETRY. The
   * grid card immediately below this band is warm cream (#fff9ef). A cream
   * header touching a cream card does not read as two lanes, it reads as one
   * pale slab with text at the top - and these two are FLUSH, so there is not
   * even a gap to separate them. A header can be any colour except the colour
   * of the thing it is glued to.
   *
   * IT SEPARATES BY VALUE, NOT BY HUE, AND THAT IS THE WHOLE IDEA. EVERY
   * EARLIER VERSION OF THIS BAND TRIED TO SOLVE IT WITH A COLOUR.
   *
   *   rose into violet     the same family as the page and the button, so it
   *                        could only be a lighter or darker version of its
   *                        neighbours: quieter slid into the lavender, louder
   *                        argued with the button over which one is the action.
   *   azure / dusty blue   a third hue, correctly reasoned and wrong in
   *                        practice: at 207-221deg it READ AS GREEN. It is not
   *                        green by measurement. It reads green because this
   *                        band is embedded in a magenta field, magenta's
   *                        complement IS green, and simultaneous contrast drags
   *                        a low-saturation mid-tone toward the complement of
   *                        whatever surrounds it.
   *   true blue            227-238deg, chosen to thread the gap between "cyan
   *                        enough to go green" and "lavender enough to vanish".
   *                        It worked. It was also a very narrow gap to be
   *                        standing in, and it was still a foreign hue.
   *
   * THE ANSWER IS THE GATE'S OWN VIOLET, DARKENED. 273deg is the same family as
   * everything else on this page - it is not a new colour in the product at all
   * - and it sits at 42% lightness against a page in the 70s and 80s. Moving
   * along VALUE rather than HUE is what three rounds of hue-hunting could not
   * do:
   *
   *   IT CANNOT GO GREEN. The green reading was specific to CYAN-LEANING hues
   *   in a magenta field. A violet is magenta's neighbour, not its complement,
   *   so there is no direction for the surround to drag it in.
   *   IT DOES NOT BLEND. 2.81:1 against the page at its lightest stop, where
   *   the rose band managed about 1.6:1 and the lavender proposed later managed
   *   1.65:1.
   *   IT DOES NOT FIGHT THE BUTTON. Desaturated violet against saturated hot
   *   pink: there is no reading in which this is the thing you press.
   *
   * THE 245deg CEILING IN THE EARLIER NOTE ONLY APPLIED AT SIMILAR LIGHTNESS.
   * "Above 245 becomes lavender and dissolves into the page" was true of a
   * mid-tone at the page's own brightness. Dropped 30 points of lightness, the
   * same hue is maximum family resemblance AND enough separation, which is why
   * this sits at 273 rather than running away from it.
   *
   * HOW DARK, THOUGH, IS A JUDGEMENT AND NOT A MEASUREMENT, AND IT WAS MADE BY
   * EYE AFTER THE NUMBERS HAD THEIR SAY. This first shipped at #48285e, 26%
   * lightness - an aubergine, and by the contrast maths the strongest option on
   * every axis at once. It read as HEAVY: the darkest object on a soft screen,
   * more serious than a gift wants to be. A ladder was rendered from 26% up to
   * 94% and this step chosen off it. It reads as a COLOUR rather than as a
   * WEIGHT, which is the difference the numbers cannot see. If it is ever
   * revisited, the useful ends of that ladder are:
   *
   *   #48285e  26%   maximum separation, reads heavy
   *   #6f4691  42%   here
   *   #8055a6  49%   the lightest that still clears AA comfortably
   *   #9366b8  56%   white type fails AA. This is the floor, and it is hard.
   *
   * A LIGHTER, AIRIER LAVENDER WAS PROPOSED AND MEASURED OUT (#8a63cf ->
   * #a274db, "lavender mist with a glass blur"). Both stops fail WCAG AA for
   * white type - 4.41:1 and 3.47:1 - and #a274db is --cg-lav-deep, which IS the
   * page background on the buffering and glitch screens. The glass blur makes
   * it worse rather than better: frosted glass separates an object by
   * distorting texture behind it, and there is no texture behind this band,
   * only a smooth gradient. Blur a smooth gradient and you get the same smooth
   * gradient.
   *
   * AND THE TYPE IS COMFORTABLY CLEAR OF THE LINE. White on these three stops
   * measures 8.70:1, 7.09:1 and 5.89:1, against a 4.5:1 requirement. The rose
   * band it started as ran 4.14 / 4.67 / 4.73 - scraping AA at the left end -
   * so the worst case here is still better than the best case there.
   *
   * The margin holds everywhere else it matters: 2.81:1 from the page at its
   * weakest, 2.23:1 from the verify button, 5.63:1 from the cream card it is
   * glued to. Nothing it touches can be confused with it, which is why it can
   * afford to be the quiet object in the middle of a loud screen.
   */
  background: linear-gradient(96deg, #603a80 0%, #6f4691 48%, #7d51a1 100%);
  border-radius: 16px 16px 0 0;
  /*
   * THE EDGE IS DRAWN INSIDE, NOT AROUND. A spread ring would paint along the
   * bottom too, and the bottom of this band is not an edge — it is the seam
   * where the header meets the grid card, and a line across it would cut the
   * two halves of one object apart. An inset hairline plus a brighter inset top
   * gives the band a lit rim on the three sides that face the page and nothing
   * on the side that does not.
   *
   * The drop shadow deepened and tightened: it is what lifts the band off the
   * page rather than what softens it into one.
   */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.18),
    /*
     * THE DROP SHADOW SHARES THE BAND'S HUE, which is what makes it read as
     * depth rather than as a second colour. Back to a deep violet now that the
     * band is violet again, and held at 0.46 - the extra opacity over the
     * original 0.42 is the "define it against the background" half of the job.
     */
      0 10px 22px rgba(32, 12, 54, 0.46);
  color: #fff;
  /*
   * THE INK MATCHES THE BAND, AND IT HAS BEEN RE-AIMED TWICE FOR THE SAME
   * REASON. A shadow in a different hue from the surface it sits on fringes the
   * letters instead of seating them - it was plum under a rose band, blue under
   * a blue one, and it is plum again now. It is nearly black at this depth,
   * which is what a shadow on an already-dark band should be.
   */
  text-shadow: 0 1px 6px rgba(18, 8, 30, 0.5);
}

/*
 * NO SHEEN AND NO DOODLE ON THE BAND. Both are gone and both were defensible
 * on their own: a white gradient at 14% crossing the header every four
 * seconds, and a heart beating at low opacity in its corner. Neither touched
 * the words.
 *
 * WHAT THEY COST WAS THE GLANCE. This band's whole job is to be recognised as
 * a captcha header in the quarter-second before anything is read, and two
 * things moving in it is enough to stop it being read as chrome at all. The
 * band is a flat printed gradient now, which is what the real one is.
 */

}

/* Both lines sit on the band's own gradient; nothing is layered behind them
   any more, and the z-index is what keeps that true if anything ever is. */
.cg-prompt-taunt,
.cg-prompt-text,
.cg-prompt-sub {
  position: relative;
  z-index: 1;
}

/* The taunt sits above the instruction, small, the way a real challenge puts
   its fine print. */
.cg-prompt-taunt {
  font-size: clamp(13px, 3.6vw, 15px);
  opacity: 0.85;
  margin-bottom: 3px;
}

/*
 * BALANCED, BECAUSE THE LONGER PROMPTS WRAP AND A WIDOW LOOKS LIKE A MISTAKE.
 * "select all squares where we're being cute" breaks after "being" on a 390px
 * phone and leaves "cute" alone on line two, which on a screen this quiet is
 * the first thing the eye finds. text-wrap: balance evens the two lines
 * instead. Where it is unsupported the text simply wraps as before.
 */
.cg-prompt-text {
  font-size: clamp(19px, 5.4vw, 23px);
  line-height: 1.15;
  text-wrap: balance;
}

.cg-prompt-sub {
  font-size: clamp(13px, 3.6vw, 15px);
  opacity: 0.85;
  margin-top: 3px;
}

/* Nine squares, as wide as the page allows. Tiles come out ~113px on a 360px
   phone — comfortably past the 44px touch minimum. */
.cg-gridwrap { position: relative; }

/*
 * ONE BLOCK OF NINE, DIVIDED BY A HAIRLINE. THIS IS THE REAL WIDGET'S GRID.
 *
 * THE WHOLE HISTORY OF THIS NUMBER, BECAUSE IT HAS BEEN WRONG IN BOTH
 * DIRECTIONS AND EACH TIME FOR A REASON WORTH KEEPING.
 *
 *   5px    the first version. Nine crops fused into one continuous surface of
 *          cropped faces, which read as eerie however sweet the colours were.
 *   12px   the fix, and it worked - but a 12px channel with nothing in it is a
 *          photo gallery, not a captcha.
 *   6px    tighter, on the argument that the polaroid MOUNT (5px of paper
 *          inset inside every tile) was doing the separating and the channel
 *          did not have to. True in principle; the tiles were also tilted, and
 *          measured pairs came out 0.2-1px apart - touching.
 *   7px    the same idea with the tilt reduced to fit.
 *   3px    here. THE TILT AND THE MOUNT ARE BOTH GONE, and this is the number
 *          that follows from that.
 *
 * WHY 3px IS NOT A RETURN TO THE 5px MISTAKE. What made the 5px version fuse
 * was nine ROUNDED, TILTED, SHADOWED cards nearly overlapping - the eye had no
 * straight line to read and the shadows filled what channel there was with
 * grey mush. These tiles are square, aligned to the pixel, and cast nothing.
 * A 3px channel between two hard edges is a DIVIDER, and it is unambiguous in
 * a way that 5px of soft overlap never was. It is also what the real widget
 * uses, which is not a coincidence: a machine's grid is legible at 3px
 * precisely because everything in it is straight.
 *
 * AND THE DIVIDER IS THE CARD SHOWING THROUGH. There is no border, no outline
 * and no line element anywhere in here — the cream the card is made of shows
 * between the tiles and that IS the divider, which is why it is warm rather
 * than a grey rule, and why it can never disagree with the surface behind it.
 *
 * PADDING IS ZERO. The block runs edge to edge inside the card, so the header
 * band sits directly on the top row and the bottom row is cut by the card's own
 * radius (overflow: hidden below does that). A margin of paper around the nine
 * would put the grid IN a frame; the real one has no frame, it has a header on
 * top of a block of pictures.
 *
 * TILES GET BIGGER AGAIN. On a 360px phone: (360 - 6 gap) / 3 = 118px a side,
 * up from 108.7px with the old padding and channel, and far past the 44px
 * touch minimum.
 */
.cg-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  /*
   * THE GROUND, AND IT IS DELIBERATELY THE QUIETEST SURFACE ON THE SCREEN.
   *
   * THIS OVERRIDES THE "NEVER WASH IT OUT" NOTE AT THE TOP OF .cg-page, AND THE
   * OVERRIDE IS NARROW. That warning was written after a pass that bleached the
   * WHOLE gate to near-white and lost every heading; it still governs the page,
   * the header band, the buttons and the payoff, all of which stay saturated.
   * It does not govern this one rectangle, because this rectangle is the only
   * one in the gate with nine photographs sitting on it, and a saturated ground
   * under photographs does not read as rich - it reads as a pink blob with
   * pictures lost in it.
   *
   * Cream into the palest lavender: warm enough not to look like unstyled
   * white, quiet enough that the photographs are the brightest thing on it.
   * There is no pink in this gradient at all - the version before it carried a
   * blush at the top, which is most of what kept the card reading as "pink area
   * with pictures in it".
   *
   * AND IT IS WARM, NOT NEUTRAL, WHICH IS THE DIFFERENCE BETWEEN PAPER AND A
   * PANEL. The earlier cream ran into a pale lilac at the bottom, and lilac is
   * a cool colour: the card read as a very light UI surface, which is exactly
   * the "systemy" feeling this screen kept having. It now runs cream into a
   * blush - warm the whole way down, no cool stop anywhere in it - and the same
   * nine photographs on it read as prints on paper instead of cells in a table.
   * Nothing else about the card changed to achieve that.
   *
   * THIS IS THE ONE CALM SURFACE, AND IT IS CALM AGAINST A SATURATED PAGE
   * RATHER THAN A PALE ONE. That contrast is the whole design now: the gate
   * keeps its deep lavender everywhere, and the puzzle sits on it as a bright
   * card, the way a photograph sits in a mount. The shadow went back up to 0.3
   * to say so — a card needs to look like it is ON the page, and against a rich
   * background a weak shadow reads as a hole cut through it instead.
   */
  background: linear-gradient(158deg, #fff9ef 0%, #fef2ef 52%, #fdeef4 100%);
  /*
   * NO PADDING, AND IT USED TO BE 10px. The old note argued that the margin of
   * paper around the block should read as the same interval as the channels
   * inside it, which is sound reasoning about a grid sitting ON a card. This is
   * not that any more: the nine ARE the card's lower half, flush to its edges,
   * with the header band capping them. Any padding here reinstates the frame
   * the real widget does not have.
   */
  padding: 0;
  border-radius: 0 0 16px 16px;
  /*
   * REQUIRED, NOT TIDINESS. With padding gone the bottom two corner tiles run
   * straight into the card's 16px radius; without a clip they would square it
   * off and the card would end in two hard corners under a rounded header.
   */
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(116, 60, 96, 0.28);
}

/*
 * ── NOTHING IN THE GUTTERS, AND NOTHING TUCKED ON THE PAPER ───────────────
 *
 * Three decoration layers used to live on this card and all three are gone:
 * four twinkles pinned to the crossing points of the grid lines, six hearts
 * drifting along the channels between the photographs, and three still marks
 * set into the card's own corners. The JSX that mounted them carries the full
 * argument; the short version is that thirteen small moving things is the right
 * decoration budget for a screen holding one line of text and the wrong one for
 * a screen holding nine photographs.
 *
 * WHAT WENT WITH THEM: .cg-gapsparks, .cg-gs-1..4 and @keyframes cg-twinkle;
 * .cg-gaphearts, .cg-gh-1..6 and @keyframes cg-gapfloat-y / cg-gapfloat-x;
 * .cg-tucked and .cg-tuck-1..3.
 *
 * IF ANY OF IT IS EVER WANTED BACK, the one rule that made it safe is worth
 * having again: a heart parked on a VERTICAL channel may only drift
 * vertically, and one on a HORIZONTAL channel may only drift horizontally.
 * Movement along a channel stays in the gap forever; movement across one puts
 * a heart on somebody's face inside a second.
 *
 * IT CANNOT COME BACK HERE NOW, WHICH IS WORTH SAYING PLAINLY. The channel is
 * 3px wide and the block runs edge to edge, so there is no gutter on this card
 * that anything could live in. The whimsy for this screen is in the margins
 * around the card and that is the only place it fits — see .cg-dreamies.
 */

/*
 * THE CELL. It carried the hand - a per-tile rotation and nudge - and it
 * carries no transform at all now; see the note where TILE_TILT used to be for
 * why the crooked placement went. What is left is the stacking job, which was
 * always the other half of why this wrapper exists.
 *
 * position: relative WITHOUT a z-index on the resting state is deliberate -
 * nine wrappers all claiming a layer would fix their order permanently, and the
 * chosen one has to be able to come to the front. Only .is-lifted claims one.
 */
.cg-cell {
  display: block;
  position: relative;
  min-width: 0;
}

.cg-cell.is-lifted {
  z-index: 2;
}

/*
 * A SQUARE OF PHOTOGRAPH AND NOTHING ELSE.
 *
 * WHAT EVERY TILE USED TO BE, AND IT WAS NOT BAD WORK: an 11px-rounded card
 * with the photograph inset inside a paper mount, a warm hairline ring drawn
 * around it as a spread box-shadow, and two soft drop shadows underneath so it
 * read as a small print lying on a table. Nine of those, each on its own
 * angle, made a scrapbook page, and every part of it was tuned to make a
 * scrapbook page look good.
 *
 * A SCRAPBOOK PAGE IS NOT WHAT THIS SCREEN IS PRETENDING TO BE. The joke only
 * works in the second before the prompt is read, and it works entirely on
 * FORM: a real challenge is a block of hard-edged squares separated by a
 * hairline, on no card, with no shadow, at no angle. Rounded corners are the
 * single loudest tell, because a rounded corner is a decision and a machine
 * did not make one.
 *
 * SO ALL THREE ORNAMENTS GO TOGETHER, AND THEY HAVE TO GO TOGETHER. Removing
 * the mount but keeping the radius leaves nine lozenges; keeping the shadow
 * over a 3px channel fills the divider with grey mush - it was tightened to
 * 9px of blur once already for exactly that reason and 3px cannot carry any of
 * it. What replaces all three is the divider: 3px of the card's own cream
 * between hard edges, which is how the real widget separates its tiles.
 *
 * 2px OF RADIUS, NOT 0. The real thing is dead square; 2px is below the
 * threshold where a corner reads as "rounded" and above the one where a 1px
 * crop artefact shows at the corner of a scaled image. It is a rendering
 * allowance, not a style.
 */
.cg-tile {
  position: relative;
  aspect-ratio: 1;
  /* The clip for the zoomed crop. See the note where the mount used to be. */
  overflow: hidden;
  padding: 0;
  border-radius: 2px;
  width: 100%;
  /*
   * THE BED A PHOTOGRAPH HAS NOT LOADED INTO YET, and that is now its only
   * job - it used to be the paper border showing around an inset print. It
   * stays warm off-white rather than grey because for the fraction of a second
   * it is visible it should look like the card it is sitting in, and it must
   * never be a dark rectangle.
   */
  background: #fffdf8;
  cursor: pointer;
  display: block;
  transition:
    transform 320ms cubic-bezier(0.34, 1.45, 0.64, 1),
    box-shadow 240ms ease-out;
}

/* Squish under the thumb, but only while it is still a puzzle piece — a
   selected tile is holding a photograph and should sit still. */
.cg-tile:not(.is-open):active {
  transform: scale(0.95);
}

/*
 * THE SQUARES ARRIVE AS A WAVE. Each one carries its own --d delay from the
 * markup, set from row PLUS column so the stagger runs diagonally out of the
 * top-left rather than sweeping row by row - a diagonal reads as playful, a
 * row sweep reads as a list loading.
 *
 * IT HANGS OFF THE GRID, NOT THE TILE, and only for the one beat it is needed.
 * A wrong tap replaces the tile's animation with the shake, and when the shake
 * class comes off the browser replays whatever the tile declares - so an
 * arrival animation that lived here permanently would pop the square back in
 * 400ms after every wrong tap. See tilesArriving.
 *
 * FILL MODE IS backwards, NOT both, AND THAT MATTERS TOO. With both, the last
 * keyframe keeps applying and pins transform to none, which would silently
 * beat the scale on .is-open below and kill the lift.
 */
/*
 * AND IT LANDS BEFORE THE BOX DOES. The panel above deliberately refuses a
 * spring because a bounce arriving on a container that is still growing reads
 * as a second jolt — but nine springy squares were doing exactly that, the
 * last of them still overshooting 145ms AFTER the container had settled. The
 * wave is worth keeping; it just has to finish inside the growth rather than
 * trail out the far side of it, and it overshoots a good deal less now that it
 * is landing on something that is itself still moving.
 */
.cg-grid.is-arriving .cg-tile {
  animation: cg-tile-in 340ms cubic-bezier(0.34, 1.32, 0.64, 1) var(--d, 0ms)
    backwards;
}

/*
 * NO ROTATION IN THE WAVE ANY MORE. It used to swing each square in through
 * -5deg / +2deg / -1deg, which was charming while the resting grid was crooked
 * anyway. Against a flush block it is wrong twice: the tiles now run edge to
 * edge, so a rotating square is clipped by the card's overflow on the way in,
 * and the arrival advertises a hand that the settled grid no longer has. The
 * scale pop survives intact — that is the part that reads as "dealt".
 */
@keyframes cg-tile-in {
  0% { opacity: 0; transform: scale(0.72); }
  55% { opacity: 1; transform: scale(1.05); }
  78% { transform: scale(0.99); }
  100% { opacity: 1; transform: none; }
}

/*
 * A right answer lifts out of the grid: a small scale, a pink ring and a soft
 * shadow under it. z-index raises it over its neighbours so the ring is never
 * half-hidden behind the next square.
 */
/*
 * THE BOUNCE ON A RIGHT ANSWER, and it deliberately has NO fill mode. The
 * keyframes end exactly where the resting rule below sits, so once the pop has
 * played the browser hands the tile back to plain CSS at scale(1.04) — a
 * fill mode of "both" here would pin the transform to the last frame and the
 * ring would be attached to a square that could never be lifted again.
 */
/*
 * THE CHOSEN SQUARE — A RING AND A TICK, AND THAT IS THE WHOLE OF IT.
 *
 * WHAT A CORRECT TAP USED TO DO, ALL AT ONCE: bounce the tile with an
 * overshoot and a kick of rotation, throw six hearts out of it, wash a violet
 * bloom across the photograph, grow a glowing ring, pull the crop back to the
 * full picture, and land a tick. Six answers to one tap. Every one of them was
 * built to be sweet and the sum of them was busy — and the one that mattered,
 * the photograph unfolding, was the quietest of the six and got lost among the
 * other five.
 *
 * SO FIVE WENT AND TWO STAYED, AND THE TWO THAT STAYED ARE THE TWO THAT SAY
 * SOMETHING. The ring says THIS ONE IS CHOSEN — it has to be unmistakable at a
 * glance across nine squares, because reading the state of the grid is the
 * actual task. The tick confirms it, after REVEAL_MS, once the picture has
 * been seen. Everything else was decoration on top of a photograph, which is
 * the one surface in this gate that does not need any.
 *
 * VIOLET RATHER THAN PINK, AND THAT SURVIVES THE CALMING DOWN UNCHANGED. The
 * hot pink is spent on the verify button and nowhere else on this screen, so a
 * saturated violet is the only hard contrast in the grid; it reads as chosen
 * because it is the one saturated edge on the card, not because of its hue.
 *
 * THE HALO CAME DOWN WITH EVERYTHING ELSE. It was a 22px violet glow at 0.45
 * around every chosen square, and with four of them chosen the card had four
 * lit patches on it. 12px at 0.3 still separates the tile from the cream and no
 * longer competes with the pictures for the eye.
 */
.cg-tile.is-open {
  /*
   * NO BOUNCE, AND NO SCALE-UP EITHER. The lift used to be scale(1.04) with an
   * overshoot to 1.10 on the way in. A square growing is movement inside a grid
   * of nine, and nine squares that can each jump is the opposite of calm. The
   * ring alone is enough to pick one out; it does not need to also be bigger
   * than its neighbours.
   */
  z-index: 2;
  /*
   * THE RING TURNED INWARD, AND IT HAD TO. It was a 3px SPREAD - drawn outside
   * the box - which was free when there were 7px of paper around every tile.
   * There are 3px now and the card clips at its own edge, so an outer ring
   * would eat the divider whole, collide with its neighbour's ring, and be
   * sliced in half on the six tiles that touch the card's rim.
   *
   * An inset ring is also what the real widget does: the selected tile is
   * marked ON the image, not around it.
   *
   * THE OUTER GLOW WENT WITH IT, and not for taste. .cg-grid is overflow:
   * hidden now (it has to be, for the card's bottom radius), so ANY outer
   * shadow is sliced off on the six tiles that touch the card's rim — the
   * chosen square would be haloed in the middle of the grid and flat at the
   * edge. A mark that changes with position is worse than no mark.
   *
   * The white hairline inside the violet is what keeps the ring from reading as
   * part of a dark photograph: 3px of violet, then 1px of white, then the
   * picture. The ring itself is drawn on ::after — see immediately below.
   */
}

/*
 * AND THE RING IS DRAWN ON A PSEUDO-ELEMENT, NOT AS AN INSET box-shadow ON THE
 * TILE, WHICH COST ONE ROUND TO FIND OUT.
 *
 * An inset shadow paints above the element's own BACKGROUND and below its
 * CONTENT. The tile's content is two absolutely-positioned images filling it
 * corner to corner, so a ring declared on .cg-tile was painted and then
 * immediately covered by the photograph — the selected square showed its tick
 * and nothing else. That is invisible in the resting state, where the outer
 * spread ring it replaced had nothing over it to hide behind.
 *
 * ::after is a child, so it stacks with the images rather than under them, and
 * z-index 4 puts it over both and under the tick at 5.
 */
.cg-tile.is-open::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  border-radius: inherit;
  box-shadow:
    inset 0 0 0 3px #8a63cf,
    inset 0 0 0 4px rgba(255, 255, 255, 0.6);
}

/*
 * TWO STACKED IMAGES, and this is the whole reveal.
 *
 * .cg-crop is the puzzle: object-fit cover so it always fills the square, then
 * scaled up and anchored at a per-tile focal point. Because cover already fills
 * the tile at scale 1, ANY zoom above 1 is guaranteed to cover it — no gaps to
 * reason about whatever shape the photograph is.
 *
 * .cg-full is the answer: the same photograph, contained, so the whole of it is
 * visible. It sits underneath at opacity 0 and fades in as the crop pulls back.
 * Two layers rather than one element changing object-fit, because object-fit
 * cannot be transitioned and the pull-back has to be smooth to read as a reward.
 */
/*
 * THE PHOTOGRAPH FILLS THE TILE. There is no .cg-mount and no inset any more —
 * the polaroid lip went when the tiles went square, and the JSX carries the
 * full story of why it existed and why it does not need to. .cg-tile's own
 * overflow: hidden is the clip for the zoomed crop.
 */
.cg-crop,
.cg-full {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.cg-crop {
  object-fit: cover;
  transition: transform 520ms cubic-bezier(0.2, 0.7, 0.3, 1);
  will-change: transform;
}

.cg-full {
  object-fit: contain;
  /*
   * WHAT SHOWS BESIDE A CONTAINED PHOTOGRAPH, and it is warm now because it is
   * the only part of an opened tile the recipient sees that is not the picture
   * itself. It used to be lilac into var(--cg-lav) - a cool band down each side
   * of the reward, on a card that is otherwise entirely paper.
   */
  background: linear-gradient(180deg, #fff7ec, #ffe9e2);
  opacity: 0;
  transition: opacity 380ms ease-out 140ms;
}

/* Correct tap: the crop pulls back to its natural framing and the whole
   photograph comes up over it. */
.cg-tile.is-open .cg-crop { transform: scale(1) !important; }
.cg-tile.is-open .cg-full { opacity: 1; }

.cg-tick {
  position: absolute;
  /* Above the photograph and the crop under it; nothing else is layered in
     the tile any more - see the note on .cg-tile.is-open. */
  z-index: 5;
  /* Inside the photograph rather than on the paper lip around it. */
  top: 8px;
  left: 8px;
  /*
   * SMALLER, AND THE SAME VIOLET AS THE RING.
   *
   * It was a 23px hot-pink chip with a 0.6 pink glow under it, from a version
   * of this screen that had a bloom and a burst and a bounce to compete with.
   * With those gone it was the loudest object on a calm cream card, and it was
   * also a SECOND accent colour on an element whose ring is violet — two
   * saturated colours saying the same one thing.
   *
   * One accent, stated once: the ring picks the square out and the tick
   * confirms it in the same colour. 20px is still well clear of anything it
   * has to be legible against, and the shadow is now a plain drop rather than
   * a glow, because a glow is a light source and nothing on this card is lit.
   */
  width: 20px;
  height: 20px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  background: #8a63cf;
  border: 1.5px solid #fff;
  box-shadow: 0 2px 6px rgba(76, 40, 122, 0.38);
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 160ms ease-out,
    transform 220ms cubic-bezier(0.34, 1.7, 0.64, 1);
}

/* The tick lands only after the photograph has been seen. */
.cg-tile.is-verified .cg-tick {
  opacity: 1;
  transform: none;
}

.cg-shake { animation: cg-shake 380ms ease-in-out; }

@keyframes cg-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}

/*
 * The air under the card. It lives on this element rather than in a flex gap on
 * .cg-challenge because the band and the card above it have to stay flush - see
 * the note there.
 */
.cg-status {
  margin-top: 15px;
  min-height: 22px;
  font-size: 16px;
  line-height: 22px;
  color: #f4e6ff;
  text-shadow: 0 1px 6px rgba(59, 18, 102, 0.5);
}

.cg-status-nudge {
  color: #fff;
  text-shadow:
    0 1px 0 var(--cg-pink-deep),
    0 0 12px rgba(255, 105, 180, 0.8);
}

/*
 * ── THE MARGINS DRIFT ON THIS SCREEN TOO, AT FULL STRENGTH ────────────────
 *
 * There is no rule here dimming .cg-dreamies on the grid, and there was one.
 * It faded the margin layer to 0.32 for the challenge phase on the argument
 * that a screen already holding nine photographs did not need drift as well.
 *
 * THAT ARGUMENT WAS ABOUT THE WRONG LAYER. What made this screen busy was the
 * decoration ON THE CARD - twinkles in the channels between the photographs,
 * hearts drifting along them, marks tucked into the paper. Those are gone, and
 * they are what had to go, because they sat in the same rectangle the eye was
 * trying to read. The margin layer never did: .cg-dreamies is hard-masked to
 * the outer two columns (see the mask on it) and sits at z-index 2, under
 * .cg-inner at 4, so it is behind the card and clipped away from it. It cannot
 * land on a photograph even in principle.
 *
 * AND IT IS THE ONE THING ALL FIVE SCREENS SHARE. The buffer, the break, the
 * checkbox, the grid and the payoff are otherwise completely different
 * pictures; the same hearts and sparkles bobbing in the same margins at the
 * same strength is what makes them one place rather than five. Turning it down
 * for one screen was the single change that made that screen look like it came
 * from somewhere else — which is the opposite of what dimming it was for.
 *
 * The grid card sits ON this layer exactly as every other screen's content
 * does. Nothing about the drift is special-cased here any more.
 */

/*
 * THE VERIFY BUTTON WOBBLES HERE TOO — SLOWER AND SHALLOWER THAN ANYWHERE ELSE.
 *
 * IT WAS STOPPED DEAD ON THIS SCREEN, and the argument was decent: it is not
 * background, it is a control sitting directly under the photographs, so a
 * wobble makes it a tenth moving thing inside the content column when every
 * other moving thing in this gate is masked out into the margins.
 *
 * WHAT THAT ARGUMENT MISSED IS THAT IT IS THE ONLY CONTROL ON THE SCREEN. The
 * grid step has no other button, no cursor, nothing else that says "you act
 * here". Stopping the one live thing in the column does not calm the screen
 * down, it makes the way forward look disabled — and .cg-btn-love breathing is
 * this gate's own signal for "this is the way out", used on every other step.
 *
 * IT BOBS RATHER THAN WOBBLES, AND THE AMPLITUDE IS MEASURED IN PIXELS OF
 * TRAVEL RATHER THAN IN DEGREES. THAT DISTINCTION COST A ROUND.
 *
 * The first attempt at putting the motion back was "half the amplitude, two
 * thirds the speed" — ±0.6° and scale 1.015 over 5.5s. It animated correctly
 * and it was INVISIBLE, and those are not the same test. Measured on the real
 * button: 0.95px of peak-to-peak travel, spread over five and a half seconds.
 * Nobody perceives one pixel of drift at that speed. The gate's standard
 * wobble is not much better in isolation — ±1.2° over 3s measures 1.9px — and
 * it only reads at all on the broken screen because that page is otherwise
 * completely still.
 *
 * A ROTATION IS THE WRONG GESTURE FOR A SMALL WIDE BUTTON. Rotation displaces
 * a point in proportion to its distance from the centre, so on a 94x44 pill
 * even a degree and a half barely moves anything. A TRANSLATION moves every
 * pixel of the object by the full amount, so 5px of lift is 5px of visible
 * movement — and it works with the button's own 4px hard bottom shadow, which
 * reads as the pill lifting off the page and settling back.
 *
 * IT IS STILL THE QUIET VERSION OF THE GESTURE. The rotation is there, under
 * the bob, at the amplitude the rest of the gate uses; what changed is that
 * the motion is now carried by the axis that can actually be seen. If this
 * ever needs turning down, turn down the TRANSLATE and leave the rest — and
 * check the number in pixels of travel, not in degrees.
 */
.cg-is-challenge .cg-btn-love {
  animation: cg-wobble-verify 2.6s ease-in-out infinite;
}

@keyframes cg-wobble-verify {
  0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
  28% { transform: translateY(-5px) rotate(-1.6deg) scale(1.05); }
  58% { transform: translateY(-1px) rotate(1.6deg) scale(1.03); }
  80% { transform: translateY(-2px) rotate(-0.6deg) scale(1.01); }
}

/*
 * IT HOLDS STILL THE MOMENT IT IS AIMED AT.
 *
 * A 5px bob is charming to watch and it is a moving target to hit, and those
 * are the same fact. This is the only control on the screen, so the moment a
 * pointer arrives or focus lands, the animation pauses and the button is a
 * stationary object for as long as it is being aimed at - it resumes when the
 * pointer leaves. animation-play-state rather than animation: none, so it
 * freezes WHERE IT IS instead of snapping back to the resting frame, which
 * would be a jump under the cursor.
 *
 * HOW THIS TURNED UP is worth recording: an automated click on this button
 * started timing out - "element is not stable" - because a test harness will
 * not click something that is moving between animation frames. A person can
 * hit a target that drifts 5px; the harness was right that it is a worse
 * target than a still one, and the fix serves both.
 */
.cg-is-challenge .cg-btn-love:hover,
.cg-is-challenge .cg-btn-love:focus-visible {
  animation-play-state: paused;
}

/*
 * Reduced motion: every hop, drift, bob, sway, shimmer, wiggle, burst and
 * wobble stops. EVERY BEAT SURVIVES — it still buffers, still breaks, still
 * turns, still ticks green, and a correct tap still swaps the crop for the
 * whole photograph. The LOOK is kept in full; only the movement goes.
 */
@media (prefers-reduced-motion: reduce) {
  .cg-crop,
  .cg-full,
  .cg-tick,
  .cg-scan,
  .cg-page,
  .cg-widget,
  .cg-msg,
  .cg-msg-body,
  .cg-tile {
    transition: none;
  }

  /*
   * THE SWAP BECOMES A CUT. With no transition each pane jumps straight to its
   * parked or shown position and the visibility flips with it, so the grid is
   * simply THERE. The container is the same size either way, so an instant
   * swap still cannot move the page.
   *
   * BOTH SELECTORS, AND THE SECOND ONE IS NOT OPTIONAL. .cg-pane.is-showing
   * carries its own transition at a higher specificity than a bare .cg-pane —
   * a media query adds none — so listing only .cg-pane here would silence the
   * step that is LEAVING and let the one arriving slide in anyway. Half a
   * swap animated is worse than the whole of it.
   */
  .cg-pane,
  .cg-pane.is-showing {
    transition: none;
  }

  /*
   * AND THE FADE HAS TO BE UNDONE, NOT JUST UNANIMATED. .cg-pane rests at
   * opacity 0.35 so the slide has something to fade FROM; with the transition
   * removed that value stops being a starting point and becomes the permanent
   * state, which would leave the checkbox step washed out at a third strength
   * before it ever moves. Instant means instant at full opacity.
   */
  .cg-pane { opacity: 1; }
  .cg-broke,
  .cg-broke-head,
  .cg-broke-face,
  .cg-is-crash,
  .cg-is-crash .cg-inner,
  .cg-is-glitch .cg-inner,
  .cg-tear,
  .cg-motif,
  .cg-shake,
  .cg-bounce,
  .cg-mini,
  .cg-mini-hop,
  .cg-dots i,
  .cg-dream,
  .cg-bounce-wrap::after,
  .cg-bounce-wrap::before,
  .cg-check,
  .cg-check:not(:disabled),
  .cg-check:not(:disabled):active,
  .cg-btn:active,
  .cg-mend,
  .cg-mend-l,
  .cg-mend-r,
  .cg-mend-spark,
  .cg-buffer-label,
  .cg-broke .cg-btn:not(.cg-btn-love),
  .cg-grid.is-arriving .cg-tile,
  .cg-is-passed .cg-bloom,
  .cg-msg,
  .cg-lower,
  .cg-lower.is-intro,
  .cg-lower.is-payoff,
  .cg-msg-head,
  .cg-pass-head,
  .cg-challenge,
  .cg-details,
  .cg-check-green,
  .cg-hint,
  .cg-btn-love,
  /* (0,2,0), so it has to be named here explicitly — a media query adds no
     specificity and the bare .cg-btn-love above would lose to it. */
  .cg-is-challenge .cg-btn-love,
  .cg-is-glitch .cg-scan {
    animation: none;
  }

  /*
   * These would sit frozen mid-screen, so they simply do not appear. The
   * confetti joins them: a fall is nothing but its motion, and fourteen hearts
   * parked over the payoff would bury the very line they are celebrating. So
   * does the whole margin layer — a floaty is a thing that floats, and a dozen
   * of them halted in the gutters is clutter rather than atmosphere.
   *
   * The lift on a correct square stays - it is a state, not a motion. So does
   * the warm bloom on the payoff: it is a colour, and it is the one piece of
   * celebration that survives having its movement taken away.
   */
  .cg-dreamies,
  .cg-room,
  .cg-burst,
  .cg-confetti,
  /*
   * THE JOLT NEVER REACHES THESE USERS ANYWAY - the buffer effect skips the
   * crash phase outright, so this layer is never mounted. It is listed here
   * because that guarantee lives in JavaScript while this file's whole
   * reduced-motion contract lives in CSS, and a flashing white overlay is the
   * one thing in this gate that must not survive a mistake.
   */
  .cg-crash {
    display: none;
  }

  .cg-warmglow {
    animation: none;
    opacity: 0.45;
  }

  /* The mended heart simply sits whole. */
  .cg-mend-l,
  .cg-mend-r { transform: none; }
  .cg-mend-spark { opacity: 0; }
}
`;
