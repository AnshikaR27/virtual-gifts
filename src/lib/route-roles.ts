/**
 * WHO IS ON THE OTHER SIDE OF THE SCREEN.
 *
 * Three kinds of person use this app and they must not be shown the same shell:
 *
 *   browse   — someone on the marketing site, deciding whether to send a gift.
 *              They get the full Y2K shell: taskbar, footer, shopper copy.
 *   sender   — someone BUILDING a gift. Focused, no chrome, no interruptions;
 *              they are mid-task and a popup would be noise.
 *   receiver — someone who was SENT a gift and followed a link to open it.
 *              They get no marketing shell at all — they did not come here to
 *              be sold anything, they came because a person sent them a thing.
 *              The Y2K *texture* (lavender field, scanlines, pixel motifs)
 *              stays, because that is the gift's look, not the app's branding.
 *
 * The distinction matters most for COPY. "Would you like to find love?" is
 * addressed to a shopper; showing it to a recipient who was just handed a gift
 * is the app talking about itself at the exact moment it should be getting out
 * of the way. Anything user-facing that varies by audience should branch on
 * `getRouteRole` rather than re-deriving prefixes locally.
 *
 * WHY PREFIXES AND NOT A ROUTE GROUP: the receiver surfaces live in two places
 * (`/g/` for the real thing, `/love-receipt/` for the isolated previews of the
 * same screens) and Next route groups cannot span both. When a new receiver
 * screen is added, add its prefix HERE — that is the single switch that strips
 * the marketing shell and swaps the copy.
 */

export type RouteRole = 'browse' | 'sender' | 'receiver';

/**
 * Routes where the visitor is opening something sent TO them.
 * `/g/` is the live recipient link; `/love-receipt/` holds the isolated
 * previews of those same receiver screens (passcode, reveal, framing).
 */
const RECEIVER_PREFIXES = ['/g/', '/love-receipt/'];

/** Routes where the visitor is building a gift to send. */
const SENDER_PREFIXES = ['/create/'];

export function getRouteRole(pathname: string): RouteRole {
  if (RECEIVER_PREFIXES.some((p) => pathname.startsWith(p))) return 'receiver';
  if (SENDER_PREFIXES.some((p) => pathname.startsWith(p))) return 'sender';
  return 'browse';
}

/**
 * Whether the app's marketing shell (taskbar, footer, context menu) is hidden.
 * Both focused roles lose it; only `browse` keeps it.
 */
export function isChromeFreeRoute(pathname: string): boolean {
  return getRouteRole(pathname) !== 'browse';
}
