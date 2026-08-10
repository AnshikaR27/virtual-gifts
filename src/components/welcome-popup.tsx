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
 * stay shared: same gold titlebar, same bevels, same OK button, whoever is
 * reading it. Only the words change.
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
   * Button captions, left → right. Optional; omit to take the pool's default
   * from DEFAULT_BUTTONS (OK for shoppers, [Yes] [Obviously] for recipients).
   * EVERY button just dismisses — the joke is that the choice is fake, so
   * `['Yes', 'Absolutely']` is a punchline, not a branch. Do not wire these to
   * different actions without rethinking the copy.
   */
  buttons?: string[];
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
 * One is drawn at random per landing, so two people opening two different
 * gifts do not get the same greeting. Add lines freely — the pool is read at
 * render time and nothing depends on its length or order.
 */
export const RECEIVER_POPUP_MESSAGES: PopupMessage[] = [
  {
    title: '📂 NOTICE',
    text: "Someone's obsessed with you. Anyway. Open it.",
    buttons: ['Open it', 'Yes'],
  },
  {
    title: '⚠️ WARNING',
    text: "Brace yourself. Someone caught feelings and it's your fault.",
    buttons: ['Open', 'Guilty'],
  },
  {
    title: '⚠️ CAUTION',
    text: 'This is going to be embarrassingly sincere. Open?',
    buttons: ['Open', 'Yes'],
  },
  {
    title: '📂 NOTICE',
    text: "Someone likes you so much it's honestly a little much. See?",
    buttons: ['Show me', 'Yes'],
  },
  {
    title: '⚠️ WARNING',
    text: 'Warning: dangerous levels of affection ahead. Proceed?',
    buttons: ['Proceed', 'Accept'],
  },
  {
    title: '💌 MESSAGE',
    text: "Sit down. Someone has a confession and it's a lot.",
    buttons: ['Sitting down', 'Go on'],
  },
  {
    title: '📂 ALERT',
    text: "Plot twist: someone's completely down bad for you. Evidence inside.",
    buttons: ['See evidence', 'Yes'],
  },
  {
    title: '📂 NOTICE',
    text: 'Someone risked looking soft for you. Respect it. Open?',
    buttons: ['Open', 'Respect'],
  },
  {
    title: '⚠️ SYSTEM',
    text: "This is your villain-origin story, except you're loved. Open?",
    buttons: ['Open', 'Accept'],
  },
  {
    title: '📬 DELIVERY',
    text: 'Someone made you a whole thing. You must be kind of a big deal.',
    // no buttons → falls back to [Yes] [Obviously]
  },
  {
    title: '💌 MESSAGE',
    text: 'Act surprised. (Someone worked hard on this.)',
    buttons: ['Acting surprised', 'Yes'],
  },
  {
    title: '⚠️ WARNING',
    text: "You did something to someone's heart. Come see the damage.",
    buttons: ['See the damage', 'Yes'],
  },
  {
    title: '📂 NOTICE',
    text: "Someone's ignoring their to-do list to think about you. Open?",
    buttons: ['Open', 'Yes'],
  },
  {
    title: '📂 ALERT',
    text: "Yeah, it's about you. Get over yourself and open it.",
    buttons: ['Open it', 'Fine'],
  },
  {
    title: '⚠️ SYSTEM',
    text: "Someone's whole personality is you right now. Congrats. Open?",
    buttons: ['Open', 'Deserved'],
  },
  {
    title: '⚠️ WARNING',
    text: "You're someone's problem now (the good kind). Open?",
    buttons: ['Open', 'Accept'],
  },
];

/**
 * Captions for lines that do not name their own. The shopper dialog is a
 * single deadpan OK; the receiver dialog is a fake choice where both answers
 * are yes, which is the house voice for "you are going to open this anyway".
 */
const DEFAULT_BUTTONS: Record<RouteRole, string[]> = {
  browse: ['OK'],
  sender: ['OK'], // unused — senders get no dialog
  receiver: ['Yes', 'Obviously'],
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

export function WelcomePopup() {
  const pathname = usePathname();
  const role = getRouteRole(pathname);

  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [message, setMessage] = useState<PopupMessage | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Mid-build is not a moment to interrupt.
    if (role === 'sender') return;
    if (sessionStorage.getItem(STORAGE_KEYS[role]) === 'true') return;

    const pool = role === 'receiver' ? RECEIVER_POPUP_MESSAGES : POPUP_MESSAGES;
    setMessage(pool[Math.floor(Math.random() * pool.length)]);
    setDismissing(false);
    const timer = setTimeout(() => setVisible(true), APPEAR_DELAY_MS);
    return () => clearTimeout(timer);
    // Re-runs on a client-side role change (browse → receiver), which is how a
    // recipient who wandered in via the homepage still gets the right dialog.
  }, [role]);

  const dismiss = useCallback(() => {
    playClick();
    setDismissing(true);
    sessionStorage.setItem(STORAGE_KEYS[role], 'true');
    setTimeout(() => setVisible(false), DISMISS_MS);
  }, [role]);

  if (role === 'sender' || !visible) return null;

  const buttons = message?.buttons ?? DEFAULT_BUTTONS[role];

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
              padding: '16px 14px',
            }}
          >
            <p className="font-pixel text-[15px] leading-relaxed text-ink">
              {message?.text}
            </p>
            {/* Wraps rather than overflowing: two captions plus the 44px tap
                floor is close to the 360px dialog width on a small phone. */}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {buttons.map((label, i) => (
                <button
                  // Index-keyed: two captions on one line may legitimately
                  // repeat, and a duplicate label must not collapse them.
                  key={`${label}-${i}`}
                  className="win98-btn text-[15px]"
                  onClick={dismiss}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
