export function getOgImageUrl(recipientName: string, giftSlug: string): string {
  console.log('[og:stub]', { recipientName, giftSlug });
  return `/api/og?name=${encodeURIComponent(recipientName)}&gift=${encodeURIComponent(giftSlug)}`;
}
