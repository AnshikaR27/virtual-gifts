export function captureException(error: unknown): void {
  console.error('[sentry:stub]', error);
}

export function captureMessage(message: string): void {
  console.log('[sentry:stub]', message);
}
