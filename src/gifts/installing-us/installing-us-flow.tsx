'use client';

/**
 * <InstallingUsFlow> — the receiver's whole journey for INSTALLING_US.
 *
 *   the front door  →  the Y2K progress bar  →  Installing_Us.exe
 *
 * THE SAME ENGINE AS THE MEMORY WALL, deliberately. The door is <GiftGate>
 * (gifts/shared/gift-gate.tsx), shared with every other gated gift; this file
 * supplies only which door, the words on it, and the gift that comes out the
 * other side. See gifts/our-story/our-story-flow.tsx, which is this file with a
 * different payload and a different door.
 *
 * The greeting popup is the beat BEFORE all of this and is not rendered here:
 * <WelcomePopup> is mounted once in app/layout.tsx and fires itself on any
 * route that `getRouteRole` calls a receiver. That is why this gift's routes
 * have to sit under a prefix listed in lib/route-roles.ts.
 *
 * THE GATE DOES NOT VALIDATE ANYTHING — any four digits, or any three correct
 * squares, open the installer. See the boxed note in passcode-gate.tsx.
 *
 * WHY THE BEATS LOOK DIFFERENT, ON PURPOSE: the gate and the loader get full
 * Win98 window chrome because they are the app talking — system steps. This
 * gift keeps its chrome too, which is the one place it departs from the memory
 * wall: there the window would have put an application between the recipient
 * and their photographs, whereas here the window IS the joke.
 */

import { GiftGate, type GateMode } from '@/gifts/shared/gift-gate';
import type { GatePhoto } from '@/gifts/shared/captcha-gate';
import { Installer } from './installer';
import { PHOTOS, type InstallPhoto } from './install-script';

/**
 * ── THIS GIFT'S FRONT DOOR. ONE WORD TO CHANGE. ────────────────────────────
 *
 *   'passcode'  four digits, then the bar
 *   'captcha'   find the two of them among strangers, on zoomed-in crops
 *
 * 'captcha' suits this gift particularly well: the installer opens by pretending
 * to be software, and a fake security check is the same joke told in the
 * doorway. It also primes the photographs — the recipient has already had to
 * LOOK closely at two or three of them before the install starts handing them
 * over one at a time.
 */
export const GATE: GateMode = 'passcode';

/**
 * Copy for the passcode step, when that door is the one in use. Kept here
 * rather than in the shared gate because it is this gift's voice — deadpan
 * system-speak.
 */
export const GATE_COPY = {
  prompt: 'enter setup key',
  hint: 'the day we met (ddmm)',
} as const;

/**
 * THE INSTALLER'S PAYLOAD AS THE CAPTCHA GATE WANTS IT.
 *
 * Not a one-to-one map. The gate crops every square down to a detail, so a
 * photograph of the two of them is worth TWO squares - one aimed at him, one
 * aimed at her - and the recipient meets them one at a time rather than as a
 * couple. That is the whole point: a grid built the naive way can be solved by
 * finding the squares with two people in them, without recognising anybody.
 *
 * THE ORDER IS THE GUARANTEE. The gate takes the first few entries, so this
 * interleaves by subject before returning. Left in photograph order the list
 * runs five of him before it reaches either of her, and a four-square deal
 * would show her in no square at all - which for a gift about recognising one
 * specific person is the one outcome that must not happen.
 *
 * A photograph with no faces listed still yields exactly one entry, uncropped
 * and unaimed, so a sender's own pictures keep working.
 */
export function gatePhotosFrom(photos: InstallPhoto[]): GatePhoto[] {
  const subjects = photos.flatMap((p) =>
    p.faces?.length
      ? p.faces.map((f) => ({
          who: f.who,
          photo: {
            src: p.src,
            alt: p.alt,
            focus: { x: f.x, y: f.y },
            tighten: f.tighten,
          },
        }))
      : [{ who: '', photo: { src: p.src, alt: p.alt } }],
  );

  // Round-robin over whoever is in the set, so the front of the list alternates
  // for as long as it can and only then falls back to whoever is left.
  const queues = new Map<string, GatePhoto[]>();
  subjects.forEach((s) => {
    const q = queues.get(s.who);
    if (q) q.push(s.photo);
    else queues.set(s.who, [s.photo]);
  });

  // Round-robin, but each turn prefers a photograph that has not been used
  // yet. Without that preference the two crops of the same picture land next
  // to each other at the front of the list, and the deal spends two of its
  // four squares on one photograph - which both wastes a square and gives the
  // answer away, since tapping one reveals the whole picture the other is a
  // crop of. Falls back to a used photograph only when nothing else is left.
  const out: GatePhoto[] = [];
  const spent = new Set<string>();
  while (out.length < subjects.length) {
    queues.forEach((q) => {
      if (!q.length) return;
      const i = q.findIndex((c) => !spent.has(c.src));
      const [next] = q.splice(i === -1 ? 0 : i, 1);
      spent.add(next.src);
      out.push(next);
    });
  }
  return out;
}

export interface InstallingUsFlowProps {
  /** Defaults to the placeholder set in install-script.ts. */
  photos?: InstallPhoto[];
  /** Overrides the GATE constant. For preview routes, never for a recipient. */
  gate?: GateMode;
  /** Start past the gate. Used by the preview route's `?skip=1`. */
  startUnlocked?: boolean;
  /** Fired when the gate is satisfied — i.e. when the loading bar starts. */
  onUnlock?: () => void;
  /** Fired when the install sequence reaches 100%. */
  onInstalled?: () => void;
  /** Fired when the recipient presses Finish. */
  onFinish?: () => void;
}

export function InstallingUsFlow({
  photos = PHOTOS,
  gate = GATE,
  startUnlocked = false,
  onUnlock,
  onInstalled,
  onFinish,
}: InstallingUsFlowProps) {
  const installer = (
    <Installer photos={photos} onInstalled={onInstalled} onFinish={onFinish} />
  );

  // Branched rather than spread — see the note in our-story-flow.tsx.
  if (gate === 'captcha') {
    return (
      <GiftGate
        mode="captcha"
        photos={gatePhotosFrom(photos)}
        startOpen={startUnlocked}
        onUnlock={onUnlock}
      >
        {installer}
      </GiftGate>
    );
  }

  return (
    <GiftGate
      mode="passcode"
      prompt={GATE_COPY.prompt}
      hint={GATE_COPY.hint}
      startOpen={startUnlocked}
      onUnlock={onUnlock}
    >
      {installer}
    </GiftGate>
  );
}
