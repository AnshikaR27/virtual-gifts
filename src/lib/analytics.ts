export function trackEvent(
  name: string,
  props?: Record<string, unknown>,
): void {
  console.log('[analytics:stub]', name, props);
}

export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  console.log('[analytics:stub] identify', userId, traits);
}
