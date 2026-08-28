'use client';

/**
 * <Installer> — Installing_Us.exe, a Win98 setup wizard whose payload is the
 * relationship and whose files are the couple's photographs.
 *
 * ── THE PHOTOGRAPH IS THE SUBJECT, THE INSTALLER IS THE FRAME ──────────────
 * Every layout decision here answers to one rule: ON EVERY SCREEN, THE LARGEST
 * THING IS A PHOTO. The chrome, the patter and the bar exist to give the
 * pictures a reason to arrive one at a time and a straight face to arrive
 * against. If a change makes the photograph smaller so that more installer can
 * fit, it is the wrong change.
 *
 * That is also why this component REFUSES TO RENDER with an empty PHOTOS array
 * rather than degrading politely. An installer that installs nothing is not a
 * lesser version of this gift, it is a bug wearing its costume — better to fail
 * loudly in development than to ship a recipient an empty progress bar.
 *
 * ── THE THREE SCREENS ──────────────────────────────────────────────────────
 *   welcome     one heading, one line, [Next >]
 *   installing  photographs extract one at a time while the bar fills
 *   complete    the machine drops the act and the sender speaks
 *
 * ── HOW THE INSTALL RUNS ───────────────────────────────────────────────────
 * ONE clock, and everything is derived from it. `elapsed` accumulates in a
 * single interval; which photograph is showing, which status line, how full the
 * bar is and whether a dialog is due are all functions of that number. No
 * second timer to drift, and nothing to resynchronise after a pause.
 *
 * THE PAUSE IS THE ABSENCE OF THE CLOCK. While a dialog is open the interval is
 * simply not scheduled — see the effect's dependency on `dialog`. Nothing has
 * to be frozen or restored, because time stops existing for the sequence until
 * the recipient presses the button. That is also what makes the dialogs feel
 * like a real installer instead of a toast sliding past.
 *
 * ── SSR ────────────────────────────────────────────────────────────────────
 * Nothing random is read during render and no clock is consulted, so the server
 * and the first client paint agree exactly: the welcome screen, frame zero.
 * Everything that could differ between them — reduced-motion, the timers, the
 * image preload — happens in effects afterwards.
 *
 * ── REDUCED MOTION ─────────────────────────────────────────────────────────
 * The sequence is SHORTENED, NEVER SKIPPED. Someone who asked for less motion
 * still came here to see the photographs, so every one of them still gets its
 * turn — just a faster one, with the cross-fade off. Dropping the photos to
 * "respect" the preference would be removing the gift to protect them from an
 * animation.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { TitlebarButtons } from '@/components/win98-chrome';
import { Y2KProgressBar } from '@/components/ui/y2k-progress-bar';
import {
  COMPLETE,
  DIALOGS,
  INSTALLER_TITLE,
  PHOTOS,
  STATUS_LINES,
  TIMING,
  WELCOME,
  type InstallDialog,
  type InstallPhoto,
} from './install-script';

/**
 * How often the clock ticks. Fine enough that the bar creeps rather than
 * lurches, coarse enough that it is nowhere near a frame budget.
 */
const TICK_MS = 50;

/**
 * How far into a photograph's turn the ✓ appears. Late enough to read as "that
 * one finished", early enough to be seen before the next photo replaces it.
 */
const TICK_MARK_AT = 0.7;

type Phase = 'welcome' | 'installing' | 'complete';

export interface InstallerProps {
  /** The payload. Defaults to the placeholders in ./install-script.ts. */
  photos?: InstallPhoto[];
  /** Fired once, when the recipient presses Finish. */
  onFinish?: () => void;
  /** Fired when the install sequence reaches 100%. */
  onInstalled?: () => void;
}

export function Installer({
  photos = PHOTOS,
  onFinish,
  onInstalled,
}: InstallerProps) {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [elapsed, setElapsed] = useState(0);
  const [dialog, setDialog] = useState<InstallDialog | null>(null);
  const [reduced, setReduced] = useState(false);
  const [finished, setFinished] = useState(false);
  /** Dialogs already shown, by `afterPhoto`. A ref: this must not re-render. */
  const shownDialogs = useRef<Set<number>>(new Set());

  const photoMs = reduced ? TIMING.reducedPhotoMs : TIMING.photoMs;
  const statusMs = reduced ? TIMING.reducedStatusMs : TIMING.statusMs;
  const totalMs = photos.length * photoMs;

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /**
   * Warm every photograph while the welcome screen is being read. Without this
   * the first hero image pops in blank — the whole sequence is 1.5s a picture,
   * which is not long enough to fetch one politely.
   */
  useEffect(() => {
    photos.forEach((p) => {
      const img = new window.Image();
      img.src = p.src;
    });
  }, [photos]);

  /**
   * THE CLOCK. Not scheduled at all while a dialog is open, which is the whole
   * pause mechanism — see the note at the top of this file.
   */
  useEffect(() => {
    if (phase !== 'installing' || dialog) return;
    const id = setInterval(() => setElapsed((e) => e + TICK_MS), TICK_MS);
    return () => clearInterval(id);
  }, [phase, dialog]);

  /** Everything the clock decides: dialogs first, then the end. */
  useEffect(() => {
    if (phase !== 'installing' || dialog) return;

    const finishedPhotos = Math.floor(elapsed / photoMs);
    const due = DIALOGS.find(
      (d) =>
        d.afterPhoto === finishedPhotos - 1 &&
        !shownDialogs.current.has(d.afterPhoto) &&
        // Never interrupt to announce something after the last photograph;
        // that beat belongs to the completion screen.
        d.afterPhoto < photos.length - 1,
    );

    if (due) {
      shownDialogs.current.add(due.afterPhoto);
      setDialog(due);
      return;
    }

    if (elapsed >= totalMs) {
      setPhase('complete');
      onInstalled?.();
    }
  }, [elapsed, phase, dialog, photoMs, totalMs, photos.length, onInstalled]);

  const startInstall = useCallback(() => {
    setElapsed(0);
    shownDialogs.current.clear();
    setPhase('installing');
  }, []);

  const handleFinish = useCallback(() => {
    setFinished(true);
    onFinish?.();
  }, [onFinish]);

  /**
   * THE GUARD. See the top of this file: no photographs, no gift. Rendering a
   * working-looking installer over an empty payload would hide the fault all
   * the way to a recipient.
   */
  if (photos.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        'Installing_Us.exe rendered with no photos. The photographs ARE the payload — see PHOTOS in install-script.ts.',
      );
    }
    return null;
  }

  const photoIdx = Math.min(photos.length - 1, Math.floor(elapsed / photoMs));
  const current = photos[photoIdx];
  const withinPhoto = (elapsed % photoMs) / photoMs;
  const extracted = withinPhoto >= TICK_MARK_AT;
  const statusLine =
    STATUS_LINES[Math.floor(elapsed / statusMs) % STATUS_LINES.length];
  const progress = Math.min(100, (elapsed / totalMs) * 100);

  return (
    <div style={styles.field}>
      <style dangerouslySetInnerHTML={{ __html: INSTALLER_CSS }} />

      <div style={styles.frame}>
        <div className="win98-window">
          <div className="win98-titlebar">
            <span style={styles.title}>💾 {INSTALLER_TITLE}</span>
            <span style={styles.titlebarButtons}>
              <TitlebarButtons />
            </span>
          </div>

          <div className="win98-body iu-body">
            {phase === 'welcome' ? (
              <WelcomeScreen onNext={startInstall} />
            ) : null}

            {phase === 'installing' ? (
              <InstallScreen
                photo={current}
                photoKey={photoIdx}
                extracted={extracted}
                statusLine={statusLine}
                progress={progress}
                animated={!reduced}
              />
            ) : null}

            {phase === 'complete' ? (
              <CompleteScreen
                photos={photos}
                finished={finished}
                onFinish={handleFinish}
              />
            ) : null}
          </div>
        </div>
      </div>

      {dialog ? (
        <FakeDialog dialog={dialog} onDismiss={() => setDialog(null)} />
      ) : null}
    </div>
  );
}

// ── SCREEN 1 ───────────────────────────────────────────────────────────────
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={styles.screen}>
      <p className="font-pixel text-[20px] leading-tight text-ink">
        {WELCOME.heading}
      </p>
      <p className="font-pixel text-[15px] leading-snug text-ink/70">
        {WELCOME.body}
      </p>
      <div style={styles.actions}>
        <button type="button" className="win98-btn-pink" onClick={onNext}>
          {WELCOME.cta}
        </button>
      </div>
    </div>
  );
}

// ── SCREEN 2 ───────────────────────────────────────────────────────────────
/**
 * The hero. `photoKey` remounts the <img> so the entrance animation replays for
 * each photograph — a key change is the only reliable way to restart a CSS
 * animation without touching the element by hand.
 */
function InstallScreen({
  photo,
  photoKey,
  extracted,
  statusLine,
  progress,
  animated,
}: {
  photo: InstallPhoto;
  photoKey: number;
  extracted: boolean;
  statusLine: string;
  progress: number;
  animated: boolean;
}) {
  return (
    <div style={styles.screen}>
      {/* THE BIGGEST THING ON THE SCREEN. */}
      <div className="iu-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={photoKey}
          src={photo.src}
          alt={photo.alt}
          className={animated ? 'iu-photo iu-photo-in' : 'iu-photo'}
        />
      </div>

      <p className="font-pixel text-[15px] leading-snug text-ink">
        <span className="text-ink/60">Extracting: </span>
        {photo.filename}
        <span className={extracted ? 'iu-tick is-on' : 'iu-tick'}> ✓</span>
      </p>

      <p
        className="font-pixel text-[15px] leading-snug text-ink/70"
        aria-live="polite"
      >
        {statusLine}
      </p>

      <div>
        <Y2KProgressBar
          value={progress}
          animated={animated}
          label="Installing Us"
        />
        <p className="mt-1 font-pixel text-[13px] text-ink/60">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  );
}

// ── SCREEN 3 ───────────────────────────────────────────────────────────────
/**
 * The photographs do not leave when the install finishes. The last one stays at
 * hero size and the rest sit under it as a strip, so the biggest thing on this
 * screen is still a picture — the sincere line reads as a caption to them
 * rather than the other way round.
 */
function CompleteScreen({
  photos,
  finished,
  onFinish,
}: {
  photos: InstallPhoto[];
  finished: boolean;
  onFinish: () => void;
}) {
  const hero = photos[photos.length - 1];

  return (
    <div style={styles.screen}>
      <p className="font-pixel text-[19px] leading-tight text-ink">
        {COMPLETE.heading}
      </p>

      <div className="iu-stage">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero.src} alt={hero.alt} className="iu-photo" />
      </div>

      {photos.length > 1 ? (
        <div className="iu-strip">
          {photos.map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.src} src={p.src} alt={p.alt} className="iu-thumb" />
          ))}
        </div>
      ) : null}

      {/*
        THE ONE SINCERE THING IN THE GIFT, and the only text here NOT in the
        pixel face. The Y2K styling is chrome; the sender's actual words are
        not a joke and should not be delivered in the joke's font.
      */}
      <p className="font-body text-[15px] leading-relaxed text-ink">
        {COMPLETE.message}
      </p>
      <p className="font-body text-[14px] text-ink/60">{COMPLETE.signoff}</p>

      <div style={styles.actions}>
        {finished ? (
          <p className="font-pixel text-[15px] text-ink/70">
            {COMPLETE.finishedNote}
          </p>
        ) : (
          <button type="button" className="win98-btn-pink" onClick={onFinish}>
            {COMPLETE.cta}
          </button>
        )}
      </div>
    </div>
  );
}

// ── THE INTERRUPTIONS ──────────────────────────────────────────────────────
/**
 * Rendered INSIDE this gift's field rather than portalled to <body>, so it
 * cannot end up in a z-index argument with the global welcome popup. It only
 * ever has to cover the installer.
 */
function FakeDialog({
  dialog,
  onDismiss,
}: {
  dialog: InstallDialog;
  onDismiss: () => void;
}) {
  return (
    <div className="iu-scrim" role="dialog" aria-modal="true">
      <div className="win98-window iu-dialog">
        <div className="win98-titlebar">
          <span style={styles.title}>{dialog.title}</span>
        </div>
        <div className="win98-body">
          <p className="mb-4 font-pixel text-[16px] leading-snug text-ink">
            {dialog.body}
          </p>
          <div style={styles.actions}>
            <button
              type="button"
              className="win98-btn"
              onClick={onDismiss}
              autoFocus
            >
              {dialog.button}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  field: {
    // Same lavender ground and page-wide scanline overlay as the memory wall —
    // app/layout.tsx puts the scanlines on for any receiver route.
    position: 'relative',
    minHeight: '100svh',
    width: '100%',
    background: 'var(--win-body-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    /*
     * PHONE-SHAPED ON PURPOSE, even on a desktop. The photographs are the
     * subject, and a 900px-wide installer would either stretch them past their
     * source resolution or strand them in grey. Capping the window keeps the
     * picture the same generous size everywhere.
     */
    width: '100%',
    maxWidth: 440,
    margin: '0 auto',
    padding:
      'clamp(10px, 3vw, 22px) clamp(8px, 2.5vw, 18px) calc(clamp(14px, 4vw, 26px) + env(safe-area-inset-bottom, 0px))',
  },
  title: {
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 'clamp(12px, 3.6vw, 15px)',
  },
  titlebarButtons: {
    flex: '0 0 auto',
    display: 'flex',
    marginLeft: 6,
  },
  screen: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
};

/**
 * The gift's own CSS. Scoped to `.iu-*`; nothing here can reach another gift.
 * Injected as raw HTML rather than a text child because React's server renderer
 * escapes quotes and angle brackets inside a <style> child while the client
 * does not, which is a hydration mismatch.
 */
export const INSTALLER_CSS = `
/*
 * The wizard's inner margin, as a variable because the stage has to cancel it
 * exactly — see .iu-stage.
 */
.iu-body {
  --iu-pad: 14px;
  padding: var(--iu-pad);
}

/*
 * THE STAGE. A sunken Win98 well the photographs are shown in.
 *
 * PORTRAIT, AND object-fit: contain RATHER THAN cover. The real photographs are
 * mostly 600x800 with one 800x450 among them, and a landscape frame cropping to
 * fill would take nearly half the height off the portraits — on pictures of two
 * people that means cutting their heads off. Every photograph is shown WHOLE,
 * whatever shape it is, and the dark ground takes up the slack. 4:5 is chosen
 * so the 600x800 majority very nearly fill it and barely letterbox at all.
 *
 * The max-height in svh is what keeps the window on one screen. Without it a
 * 4:5 stage on a narrow phone makes the wizard taller than the viewport and
 * the progress bar — the thing that has to stay visible — scrolls away.
 *
 * IT BLEEDS THROUGH THE BODY'S PADDING, on purpose. On a 320px phone that
 * padding was costing the photograph 28px of width — about 11% of its area —
 * to put grey either side of the one thing the recipient came to look at. The
 * text below it keeps the padding; the picture goes to the frame.
 *
 * The dark ground matters twice over: it is the letterbox, and it is what the
 * eye sees for the instant between one photograph and the next. Grey chrome
 * flashing there reads as a glitch where near-black reads as a cut.
 */
.iu-stage {
  position: relative;
  width: auto;
  margin-inline: calc(-1 * var(--iu-pad, 0px));
  aspect-ratio: 4 / 5;
  /*
   * On a phone THIS is what actually sets the height — 4:5 off a ~360px window
   * would be 450px tall, more than the viewport can spare once the chrome, the
   * three text lines and the bar are added. Measured on a 320x568 phone the
   * whole wizard comes to ~514px, leaving the progress bar comfortably above
   * the fold. Raise it and check that number again.
   */
  max-height: 60svh;
  overflow: hidden;
  background: #241a2e;
  border: 2px solid;
  border-color: var(--win-chrome-dark) var(--win-chrome-light)
    var(--win-chrome-light) var(--win-chrome-dark);
}

.iu-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Each photograph arrives with a small push. Applied via a key change on the
   <img>, so it replays per photo rather than once per mount. */
.iu-photo-in {
  animation: iu-photo-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
}

@keyframes iu-photo-in {
  0% {
    opacity: 0;
    transform: scale(1.06);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

/* The ✓ holds its space from the start, so the line does not reflow when it
   appears — a filename jumping sideways mid-extract looks like a bug. */
.iu-tick {
  visibility: hidden;
  color: #2e7d32;
}

.iu-tick.is-on {
  visibility: visible;
}

/* The completed-screen strip. Every photograph still on screen, small, under
   the one that stayed big. */
.iu-strip {
  display: flex;
  gap: 4px;
}

.iu-thumb {
  flex: 1 1 0;
  min-width: 0;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
  border: 2px solid;
  border-color: var(--win-chrome-dark) var(--win-chrome-light)
    var(--win-chrome-light) var(--win-chrome-dark);
}

/* The fake modals. Absolute inside the gift's own field — never portalled, so
   it cannot argue with the global popup's z-index. */
.iu-scrim {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.4);
}

.iu-dialog {
  width: 300px;
  max-width: 100%;
  animation: iu-dialog-in 160ms ease-out both;
}

@keyframes iu-dialog-in {
  0% {
    opacity: 0;
    transform: scale(0.94);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

/*
 * Reduced motion: the entrances go, the PHOTOGRAPHS DO NOT. The sequence is
 * shortened in JS (see TIMING.reduced*) and every picture still gets its turn.
 */
@media (prefers-reduced-motion: reduce) {
  .iu-photo-in,
  .iu-dialog {
    animation: none;
  }
}
`;
