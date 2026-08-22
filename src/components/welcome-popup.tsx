'use client';

/**
 * The Y2K system dialog that greets a visitor once per session.
 *
 * THE COPY IS ROUTE-AWARE AND THAT IS THE POINT. A shopper and a gift
 * recipient are two different people having two different days, so they get
 * two different message pools (see `@/lib/route-roles`):
 *
 *   browse   → POPUP_MESSAGES          — shopper voice, jokes about your own
 *                                        love life, nudges toward sending.
 *   receiver → RECEIVER_POPUP_MESSAGES — "someone sent you something" voice.
 *                                        Never mentions the product, never
 *                                        sells; it announces an arrival.
 *   sender   → nothing at all. They are mid-build; do not interrupt.
 *
 * Both pools are plain arrays at the top of this file — edit them freely, the
 * component reads whatever is in them. The dialog CHROME is shared and should
 * stay shared: same gold titlebar, same bevels, same button in the same
 * corner, whoever is reading it. Only the words change.
 *
 * ONE BUTTON, ALWAYS, BOTTOM RIGHT. The dialog used to offer two captions that
 * both meant yes. That bit is gone: every dialog now has exactly one small
 * button, sized to its text and pinned to the bottom-right corner — where a
 * Win98 dialog has always put the thing you press to make it go away.
 */

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { playClick } from '@/components/retro-sounds';
import { getRouteRole, type RouteRole } from '@/lib/route-roles';

export interface PopupMessage {
  /** Caption text. Carries the emoji; keep it SHOUTY, it is a system dialog. */
  title: string;
  /** The body line. One or two sentences — this is a dialog, not a paragraph. */
  text: string;
  /**
   * The single button's caption. Optional; a line without one falls back to
   * DEFAULT_BUTTON for its role (`open it` for a recipient).
   *
   * It is a reply to THIS line, in the recipient's voice — the reader agreeing
   * to open, in the tone the line put them in.
   *
   * PLAIN EVERYDAY ENGLISH. No emoji, no stage directions, and no slang or
   * in-jokes: the recipient could be anyone the sender knows, of any age, and
   * a caption they have to decode is a caption that stops the moment dead.
   * Warm and simple beats clever. Keep it SHORT — the button is small and sits
   * in the corner, so anything past a few words stops fitting.
   *
   * The button dismisses and opens the gift; there is nothing else it can do.
   */
  button?: string;
}

// ── COPY POOL 1: the marketing site. Someone deciding whether to SEND. ──────
export const POPUP_MESSAGES: PopupMessage[] = [
  {
    title: '⚠️ WARNING',
    text: 'Your love life is running low on memory. Please delete some bad decisions.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Heart rate increasing... Are you sure you want to continue?',
  },
  {
    title: '⚠️ ERROR',
    text: 'Cannot find chill.exe. Would you like to catch feelings instead?',
  },
  {
    title: '📂 ALERT',
    text: 'ROMANCE.exe has stopped working. Reason: too many butterflies.',
  },
  {
    title: '⚠️ WARNING',
    text: 'You have 3 unread love letters. Would you like to panic?',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Feelings.zip is corrupted. Please see a therapist.',
  },
  {
    title: '📂 NOTICE',
    text: 'Your crush is typing... Just kidding. But what if?',
  },
  {
    title: '⚠️ ERROR',
    text: 'Attempt to forget them failed. Error code: STILL_IN_LOVE.',
  },
  {
    title: '⚠️ WARNING',
    text: 'Low storage. Too many screenshots of their texts.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Installing butterflies... This may take forever.',
  },
  {
    title: '📂 ALERT',
    text: 'Someone is thinking about you right now. Probably.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Cannot delete feelings. File is in use by your heart.',
  },
  { title: '⚠️ WARNING', text: 'Overthinking.exe is using 99% of your brain.' },
  {
    title: '⚠️ SYSTEM',
    text: 'Would you like to send love? This action cannot be undone.',
  },
  {
    title: '📂 NOTICE',
    text: 'New update available: Relationship 2.0. Tap to install.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Connection to reality lost. Reason: daydreaming about them.',
  },
  {
    title: '⚠️ WARNING',
    text: 'Your heart has been successfully hacked. By love.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Scanning for red flags... 0 found. Proceed with feelings.',
  },
  {
    title: '📂 ALERT',
    text: 'Backup complete. All memories with them safely stored.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Task failed: Moving on. Would you like to try again? [No] [Also No]',
  },
  {
    title: '⚠️ WARNING',
    text: 'Battery low. Recharge by hugging someone you love.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'This website contains extreme levels of cuteness. Proceed?',
  },
  {
    title: '📂 NOTICE',
    text: "Reminder: You are someone's favorite notification.",
  },
  {
    title: '⚠️ ERROR',
    text: 'Playing it cool failed. Reverting to being a simp.',
  },
  {
    title: '⚠️ WARNING',
    text: 'Your ex viewed your story. Do NOT reply. Repeat: do NOT.',
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Compressing feelings... Error: feelings too big to compress.',
  },
  {
    title: '📂 ALERT',
    text: 'Love.zip downloaded successfully. Warning: cannot be unzipped.',
  },
  {
    title: '⚠️ ERROR',
    text: 'Sleep.exe interrupted by thoughts of them. Again.',
  },
  {
    title: '⚠️ WARNING',
    text: "You've been staring at their photo for 4 minutes. We noticed.",
  },
  {
    title: '⚠️ SYSTEM',
    text: 'Matching you with... just kidding. Go text them yourself.',
  },
];

// ── COPY POOL 2: someone who was SENT a gift and just landed on it. ─────────
/**
 * THE VOICE IS MASALA: bold, cheeky, teasing, a little dramatic, extremely
 * over-confident — and underneath all of it, loving. It swaggers at the sender
 * ("someone is down bad for you") and gently roasts the recipient for being so
 * obviously adored. It never actually insults them. The tease is always in
 * their favour: you are loved, deal with it.
 *
 * THE LINE IS SPICY; THE BUTTON IS NOT. The `text` can be as dramatic as it
 * likes, but the `button` under it answers in plain everyday English — that
 * contrast is the joke landing, and it keeps the dialog readable for a
 * recipient who has never seen this site before.
 *
 * PLAIN ENGLISH ONLY. This pool deliberately does NOT reuse the shopper pool's
 * computer-vocabulary formula — no .exe, no .zip, no downloading, buffering,
 * transmissions or file transfers. The recipient could be anyone the sender
 * knows, of any age, and the line has to land instantly without them decoding
 * a nerd joke first. The Win98 dialog does the retro work all by itself; the
 * WORDS should sound like a person with an attitude.
 *
 * THE REST OF THE BRIEF, so additions stay in tune:
 *   · Something is ARRIVING for them, from a person, right now.
 *   · Never mentions HoneyHearts, gifts-as-a-product, pricing or sending.
 *     The recipient did not come shopping and does not care what this site is.
 *   · Tease the situation, never wound the reader — no "your ex", no
 *     bad-decisions bit, nothing that lands as an actual insult. Every jab
 *     resolves into "someone loves you".
 *   · Second person, present tense, tiny. It is a notification, not a preamble.
 *   · The straight-faced system framing ("Warning:", "Proceed?") is half the
 *     joke — the dialog treats being loved as a hazard notice.
 *
 * Kept short deliberately: this fires before someone reads a message a person
 * wrote them, so it should be a doorbell, not a conversation.
 *
 * EVERY LINE OWNS ITS BUTTON. `button` sits next to the `text` it answers
 * because the two are one joke — the line sets up, the caption lands. Editing
 * them together is the point; a lookup table keyed on prose would drift the
 * first time a line was reworded. A line with no `button` falls back to
 * DEFAULT_BUTTON.receiver (`open it`), which is a safe caption under anything.
 *
 * Captions repeat across lines on purpose — `show me`, `aw, open it` and
 * `open it` each answer more than one line. Only one line is ever on screen,
 * so a shared caption costs nothing and reads better than a strained unique.
 *
 * One is drawn at random per landing, so two people opening two different
 * gifts do not get the same greeting. Add lines freely — the pool is read at
 * render time and nothing depends on its length or order.
 */
export const RECEIVER_POPUP_MESSAGES: PopupMessage[] = [
  {
    title: '📂 NOTICE',
    text: "Someone's obsessed with you. Anyway. Open it.",
    button: 'i like them too',
  },
  {
    title: '⚠️ WARNING',
    text: "Brace yourself. Someone caught feelings and it's your fault.",
    button: 'my fault, huh',
  },
  {
    title: '⚠️ CAUTION',
    text: 'This is going to be embarrassingly sincere. Open?',
    button: 'go on then',
  },
  {
    title: '📂 NOTICE',
    text: "Someone likes you so much it's honestly a little much. See?",
    button: 'show me',
  },
  {
    title: '⚠️ WARNING',
    text: 'Warning: dangerous levels of affection ahead. Proceed?',
    button: 'worth it',
  },
  {
    title: '💌 MESSAGE',
    text: "Sit down. Someone has a confession and it's a lot.",
    button: "i'm ready",
  },
  {
    title: '📂 ALERT',
    text: "Plot twist: someone's completely down bad for you. Evidence inside.",
    button: 'show me',
  },
  {
    title: '📂 NOTICE',
    text: 'Someone risked looking soft for you. Respect it. Open?',
    button: 'open it',
  },
  {
    title: '⚠️ SYSTEM',
    text: "This is your villain-origin story, except you're loved. Open?",
    button: "let's see",
  },
  {
    title: '📬 DELIVERY',
    text: 'Someone made you a whole thing. You must be kind of a big deal.',
    button: 'aw, open it',
  },
  {
    title: '💌 MESSAGE',
    text: 'Act surprised. (Someone worked hard on this.)',
    button: 'open it',
  },
  {
    title: '⚠️ WARNING',
    text: "You did something to someone's heart. Come see the damage.",
    button: 'let me see',
  },
  {
    title: '📂 NOTICE',
    text: "Someone's ignoring their to-do list to think about you. Open?",
    // No caption assigned yet → takes DEFAULT_BUTTON.receiver (`open it`).
    // The only line in this pool without its own; give it one when a good
    // reply to "ignoring their to-do list" turns up.
  },
  {
    title: '📂 ALERT',
    text: "Yeah, it's about you. Get over yourself and open it.",
    button: 'okay, fine',
  },
  {
    title: '⚠️ SYSTEM',
    text: "Someone's whole personality is you right now. Congrats. Open?",
    button: 'aw, open it',
  },
  {
    title: '⚠️ WARNING',
    text: "You're someone's problem now (the good kind). Open?",
    button: "i'm okay with that",
  },
  {
    title: '💌 MESSAGE',
    text: "Someone had a lot of feelings today. They're all in here.",
    button: 'open gently',
  },
  {
    title: '📬 DELIVERY',
    text: 'This is going to feel like a hug. Open it?',
    button: 'hug me then',
  },
  {
    title: '⚠️ CAUTION',
    text: "You're about to feel very loved. Take a breath first.",
    button: "okay, i'm ready",
  },
];

/**
 * The caption for a line that does not name its own. The shopper dialog keeps
 * its deadpan OK; a recipient gets the plainest possible yes.
 */
const DEFAULT_BUTTON: Record<RouteRole, string> = {
  browse: 'OK',
  sender: 'OK', // unused — senders get no dialog
  receiver: 'open it',
};

/**
 * Seen-state is per ROLE, not global: browsing the site first must not swallow
 * the recipient's dialog when they later open a gift link in the same tab.
 * Session-scoped, so it returns on the next visit.
 */
const STORAGE_KEYS: Record<RouteRole, string> = {
  browse: 'honeyhearts_popup_seen',
  receiver: 'honeyhearts_popup_seen_receiver',
  sender: 'honeyhearts_popup_seen_sender', // unused — senders get no dialog
};

/** Long enough that the page has painted and the dialog reads as an arrival. */
const APPEAR_DELAY_MS = 1500;
const DISMISS_MS = 200;

function pickOne<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

/*
 * ── SILENCING THE GREETING ─────────────────────────────────────────────────
 * Some gifts open with a scene of their own that this dialog would land on top
 * of and spoil. The captcha gate is the case that forced this: it opens on a
 * crashed-looking page and a "this gift does not open for everyone" notice, and
 * a cheerful "Act surprised!" popping up over that kills the premise before the
 * recipient has read it.
 *
 * A GATE CALLS suppressWelcomePopup() AND KEEPS THE HANDLE. It is a counter
 * rather than a boolean so nothing has to reason about who turned it off last,
 * and the returned function restores the count — which matters on a client-side
 * navigation from a captcha-gated gift to a passcode-gated one, where the
 * greeting must come back.
 *
 * NOT sessionStorage: writing the seen-flag would silence the dialog for the
 * rest of the session, including on gifts that want it.
 */
let suppressCount = 0;
const suppressListeners = new Set<(n: number) => void>();

/** Silence the greeting while the caller is mounted. Call the result to undo. */
export function suppressWelcomePopup(): () => void {
  suppressCount += 1;
  suppressListeners.forEach((notify) => notify(suppressCount));

  let released = false;
  return () => {
    if (released) return;
    released = true;
    suppressCount -= 1;
    suppressListeners.forEach((notify) => notify(suppressCount));
  };
}

export function WelcomePopup() {
  const pathname = usePathname();
  const role = getRouteRole(pathname);

  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [message, setMessage] = useState<PopupMessage | null>(null);
  /** Non-zero while a gift with its own opening is on screen. */
  const [suppressed, setSuppressed] = useState(suppressCount);

  useEffect(() => {
    const notify = (n: number) => setSuppressed(n);
    suppressListeners.add(notify);
    // Read again on mount: a gate deeper in the tree may already have
    // suppressed before this effect ran.
    setSuppressed(suppressCount);
    return () => {
      suppressListeners.delete(notify);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Mid-build is not a moment to interrupt.
    if (role === 'sender') return;
    if (suppressed > 0) return;
    if (sessionStorage.getItem(STORAGE_KEYS[role]) === 'true') return;

    const pool = role === 'receiver' ? RECEIVER_POPUP_MESSAGES : POPUP_MESSAGES;
    setMessage(pickOne(pool));
    setDismissing(false);
    const timer = setTimeout(() => setVisible(true), APPEAR_DELAY_MS);
    return () => clearTimeout(timer);
    // Re-runs on a client-side role change (browse → receiver), which is how a
    // recipient who wandered in via the homepage still gets the right dialog,
    // and on suppression changing, which is how a captcha gate silences it.
  }, [role, suppressed]);

  const dismiss = useCallback(() => {
    playClick();
    setDismissing(true);
    sessionStorage.setItem(STORAGE_KEYS[role], 'true');
    setTimeout(() => setVisible(false), DISMISS_MS);
  }, [role]);

  if (role === 'sender' || suppressed > 0 || !visible) return null;

  const buttonLabel = message?.button ?? DEFAULT_BUTTON[role];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: dismissing ? 'transparent' : 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="mx-4 w-full max-w-[360px]"
        style={{
          animation: dismissing
            ? 'popup-dismiss 0.2s ease-in forwards'
            : 'popup-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <div
          style={{
            background: 'var(--win-chrome)',
            border: '2px solid',
            borderColor:
              'var(--win-chrome-light) var(--win-chrome-darkest) var(--win-chrome-darkest) var(--win-chrome-light)',
            boxShadow: '2px 2px 0 0 #000',
            padding: 3,
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center justify-between"
            style={{
              background: 'linear-gradient(90deg, #DAA520, #FFD700)',
              padding: '3px 4px',
              userSelect: 'none',
            }}
          >
            <span className="font-pixel text-[15px] font-bold tracking-wide text-white">
              {message?.title ?? '⚠️ WARNING'}
            </span>
            {/* Dismisses exactly like the button below it. Lives in the
                titlebar, two rows above the action — they cannot collide. */}
            <button
              className="win98-titlebar-btn"
              aria-label="Close"
              onClick={dismiss}
            >
              <span className="text-[10px] font-bold leading-none text-ink">
                ✕
              </span>
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid',
              borderColor:
                'var(--win-chrome-dark) var(--win-chrome-light) var(--win-chrome-light) var(--win-chrome-dark)',
              // The bottom/right padding IS the button's margin from the
              // dialog edge — it sits in the corner of this box, not against
              // the bevel.
              padding: '16px 14px 14px',
            }}
          >
            <p className="font-pixel text-[15px] leading-relaxed text-ink">
              {message?.text}
            </p>
            {/* Bottom-right, the Win98 convention: the action lives in the
                corner you close a dialog from. `justify-end` on an auto-width
                button is what keeps it compact — the button is only as wide as
                its caption, never stretched to the row. */}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="win98-btn text-[15px]"
                onClick={dismiss}
                style={{
                  // Ordinary Win98 button padding — snug, not a slab.
                  padding: '4px 14px',
                  // Visually compact but still a legal touch target: the 44px
                  // floor is met by height alone, so the button can stay small
                  // and wide-enough-for-its-text without being hard to hit.
                  minHeight: 44,
                  // Captions are short by contract (see PopupMessage.button),
                  // so the button stays on one line and sizes to its text.
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {buttonLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
