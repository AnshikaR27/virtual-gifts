/**
 * THE SCRIPT for Installing_Us.exe — every word, photograph and duration.
 *
 * ── THIS IS THE FILE YOU EDIT ──────────────────────────────────────────────
 * ./installer.tsx contains no copy and no timings of its own. It reads
 * everything from here, so tuning the gift never means touching the machine
 * that runs it.
 *
 * ── PHOTOGRAPHS ARE NOT DECORATION ─────────────────────────────────────────
 * They are the thing being installed. Every step of the sequence is built to
 * put one of them at the largest size the screen allows, with the installer
 * chrome as a frame around it. A build of this gift with an empty PHOTOS array
 * is not a degraded gift, it is a broken one — <Installer> refuses to render
 * rather than show an installer that installs nothing.
 *
 * ── THE PHOTOGRAPHS ────────────────────────────────────────────────────────
 * Real ones, shared with OUR_STORY — both gifts serve the same eight files out
 * of /public/memories/, so there is one folder to swap when the sender flow
 * arrives rather than two that drift.
 *
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  THESE ARE PERSONAL PHOTOGRAPHS OF IDENTIFIABLE PEOPLE, AND /public IS     │
 * │  A PUBLIC DIRECTORY. Anything in there is committed to git and served      │
 * │  unauthenticated at <site>/memories/<file> on every deploy — no gift       │
 * │  link, no passcode, no auth in front of it. Real sender uploads will live  │
 * │  in private storage behind the gift, not here. Same warning as the one in  │
 * │  gifts/our-story/memories.ts, and it applies to this gift for the same     │
 * │  reason.                                                                   │
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * MOST OF THEM ARE PORTRAIT — 600x800, with one 800x450 landscape. That is why
 * the stage in ./installer.tsx is portrait and uses `object-fit: contain`
 * rather than `cover`: a 4:3 landscape frame would crop nearly half the height
 * off a 600x800 photo, which on photographs of two people means cutting their
 * heads off. Add a photo of any shape and it will be shown whole.
 *
 * The FILENAMES are half the joke and are deliberately NOT the real ones:
 * `first_date.jpg` is what an installer would be unpacking if the software were
 * a relationship. Keep them lowercase, underscored and .jpg — they are meant to
 * look like files on a 1998 disk.
 *
 * THE ORDER IS THE STORY. It opens on the café, travels, and closes on the two
 * of them holding onto each other, because the last photograph is the one the
 * completion screen keeps at full size under the sender's message.
 */

/** Both gifts read from the same folder. See the warning above. */
const photo = (file: string) => `/memories/${file}`;

export interface InstallPhoto {
  /** The image itself. Loaded with a plain <img> — see the note in installer.tsx. */
  src: string;
  /** Shown in the "Extracting:" line. Part of the joke; not derived from src. */
  filename: string;
  /** Real alt text. These are photographs of people, not decoration. */
  alt: string;
  /**
   * WHO IS IN IT AND WHERE THEY ARE. Used only by the captcha gate, which
   * crops each square down to a detail and therefore has to know what it is
   * aiming at — see GatePhoto.focus for the coordinate system, which is
   * percentages of the SQUARE the tile shows, not of this photograph.
   *
   * A photograph of the two of them lists both, and the gate turns it into two
   * separate squares: one that is only him, one that is only her. That is what
   * removes the shortcut of hunting for the picture with two people in it.
   *
   * The installer itself ignores this entirely.
   */
  faces?: { who: string; x: number; y: number; tighten?: number }[];
}

/**
 * Five of the eight. Four or five is the right number: fewer and the install is
 * over before it has a rhythm, more and a recipient starts waiting instead of
 * watching. The three left out (brick-wall-night, chandelier-selfie,
 * childhood-kurta) are still on the memory wall.
 */
export const PHOTOS: InstallPhoto[] = [
  {
    src: photo('cafe-selfie.jpg'),
    filename: 'first_date.jpg',
    alt: 'The two of us leaning in together for a selfie at the café',
    // 800x450, so this one is cropped on the SIDES, not top and bottom.
    faces: [
      { who: 'her', x: 71, y: 50 },
      { who: 'him', x: 38, y: 42 },
    ],
  },
  {
    src: photo('waterfall.jpg'),
    filename: 'the_trip.jpg',
    alt: 'Him in sunglasses in front of the waterfall',
    // He sits low in the frame - imgY 73%, which is 81% of the visible band.
    // This is the photograph the old blind crop kept turning into a waterfall.
    faces: [{ who: 'him', x: 42, y: 81 }],
  },
  {
    src: photo('turban-kurta.jpg'),
    filename: 'the_fit.jpg',
    alt: 'Him in the orange turban and kurta, fully committed to the outfit',
    // A full-length photograph: his face is a fraction of the size it is in a
    // selfie, so without this the square shows turban-to-waist and is the only
    // tile in the grid that is not a face. See GatePhoto.tighten.
    faces: [{ who: 'him', x: 43, y: 46, tighten: 2.2 }],
  },
  {
    src: photo('canoe-lake.jpg'),
    filename: 'the_lake.jpg',
    alt: 'Him turning around on the boat, with the lake behind him',
    faces: [{ who: 'him', x: 46, y: 37, tighten: 1.3 }],
  },
  {
    src: photo('lanterns-hug.jpg'),
    filename: 'us_now.jpg',
    alt: 'The two of us hugging under the hanging lanterns',
    // Their faces are close together here, so at this zoom a crop centred
    // between them catches both. Each point leans away from the other to keep
    // the square about one person.
    faces: [
      { who: 'her', x: 66, y: 49 },
      { who: 'him', x: 39, y: 43 },
    ],
  },
];

// ── THE WINDOW ─────────────────────────────────────────────────────────────
/** Titlebar caption. The .exe is the whole premise — keep it. */
export const INSTALLER_TITLE = 'Installing_Us.exe';

// ── SCREEN 1: WELCOME ──────────────────────────────────────────────────────
/**
 * SHORT ON PURPOSE. This screen is a doorway, not a destination — every second
 * spent reading it is a second not spent looking at the photographs. Two lines
 * and a button.
 */
export const WELCOME = {
  heading: 'Welcome to the Us Setup Wizard',
  body: 'This will install Us on your heart. It is recommended that you close nothing and pay attention.',
  cta: 'Next >',
} as const;

// ── SCREEN 2: THE INSTALL ──────────────────────────────────────────────────
/**
 * The machine's patter, cycled in order while the photographs extract.
 *
 * VOICE: this is the COMPUTER talking, so it is deadpan, lowercase-ish and
 * gerund-heavy the way a real installer is — the joke is entirely in the
 * mismatch between that flat register and what it claims to be installing.
 * Nothing here should be sentimental; the sincerity is saved for the last
 * screen, where it lands harder for having been withheld.
 *
 * Add freely. The list is cycled, so its length does not have to relate to the
 * number of photographs.
 */
export const STATUS_LINES: string[] = [
  'Installing butterflies…',
  'Configuring inside jokes…',
  'Downloading 3am conversations…',
  'Unpacking every version of you I love…',
  'Removing bad decisions…',
  'Optimizing forehead kisses…',
  'Indexing the way you say my name…',
  'Compressing four hours into a minute…',
  'Verifying checksum: still you…',
];

/**
 * The fake modals. Each one PAUSES the install until it is dismissed, which is
 * what a real installer does and what makes the button worth pressing.
 *
 * `afterPhoto` is a zero-based index: the dialog opens once that photograph has
 * finished its turn. Keep them sparse — two across five photographs. A dialog
 * between every pair stops being a joke and becomes an obstacle between the
 * recipient and the pictures.
 */
export interface InstallDialog {
  /** Opens after the photograph at this index has had its moment. */
  afterPhoto: number;
  title: string;
  body: string;
  /** The only button. It always just continues; the choice is the punchline. */
  button: string;
}

export const DIALOGS: InstallDialog[] = [
  {
    afterPhoto: 1,
    title: '⚠️ WARNING',
    body: 'Warning: feelings detected. Continue?',
    button: 'Obviously',
  },
  {
    afterPhoto: 3,
    title: '💾 DISK SPACE',
    body: 'Heart storage exceeded. Expand capacity?',
    button: 'Always',
  },
];

// ── SCREEN 3: COMPLETE ─────────────────────────────────────────────────────
/**
 * The only place the machine drops the act.
 *
 * `message` is THE SENDER'S OWN WORDS and is rendered in the clean body face,
 * not the pixel one — the Y2K styling is chrome, and the one sincere thing in
 * the gift should not be delivered in a joke font. PLACEHOLDER until the sender
 * flow exists.
 */
export const COMPLETE = {
  heading: 'Us has been successfully installed ❤️',
  message:
    'I do not really have a clever way to end this. I just wanted you to see all of it at once — the first day, the ordinary evenings, the trip we almost did not take. None of it needed installing. It has been running perfectly this whole time.',
  signoff: '— always, me',
  cta: 'Finish',
  /** Shown once Finish is pressed, so the button is never a dead end. */
  finishedNote: 'You can close this window now. ♥',
} as const;

// ── TIMING ─────────────────────────────────────────────────────────────────
/**
 * How long each beat lasts, in ms.
 *
 * `photoMs` IS THE IMPORTANT ONE: it is how long a photograph is held at full
 * size, and the brief calls for about a second and a half. Below roughly 1000
 * the sequence turns into a slideshow nobody can actually look at.
 *
 * The `reduced*` values are used under prefers-reduced-motion. Note what they
 * do NOT do: they never drop a photograph. Someone who has asked for less
 * motion still came here to see the pictures, so the sequence is shortened,
 * not skipped — every photo still gets its turn, just a faster one.
 */
export const TIMING = {
  /** How long one photograph is held at hero size. */
  photoMs: 1500,
  /** How long one status line stays up. Intentionally not a factor of photoMs,
   *  so the text and the pictures drift out of lockstep and it feels busier. */
  statusMs: 1100,

  reducedPhotoMs: 700,
  reducedStatusMs: 600,
} as const;
