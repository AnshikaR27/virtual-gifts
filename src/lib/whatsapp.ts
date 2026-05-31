import { PRODUCTION_URL } from './constants';

/**
 * buildWaUrl — generic WhatsApp share link builder used by every gift.
 *
 * Returns a "https://wa.me/?text=<encoded>" URL (no recipient number — the
 * sender picks the chat in WhatsApp) with the gift link pre-filled:
 *   https://virtual-gifts.vercel.app/g/<shortId>
 *
 * @example
 *   buildWaUrl({ recipientName: 'Anaya', shortId: 'a1B2c3' })
 */
export interface BuildWaUrlOptions {
  recipientName?: string | null;
  shortId: string;
  /** Override the default greeting. The gift link is always appended. */
  message?: string;
  /** Base origin for the gift link. Defaults to the production URL. */
  baseUrl?: string;
}

export function buildWaUrl({
  recipientName,
  shortId,
  message,
  baseUrl = PRODUCTION_URL,
}: BuildWaUrlOptions): string {
  const link = `${baseUrl.replace(/\/$/, '')}/g/${shortId}`;

  const greeting =
    message ??
    `${recipientName ? `${recipientName}, ` : ''}I made you something 💌 open it here:`;

  // Avoid duplicating the link if a custom message already contains it.
  const text = greeting.includes(link) ? greeting : `${greeting}\n${link}`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
