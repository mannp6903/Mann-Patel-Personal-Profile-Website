/** Used by the Worker entry (src/worker/entry.ts); kept separate so it can be unit tested. */
const CANONICAL_HOST = 'mannpatel.me';
const REDIRECT_HOSTS = new Set(['www.mannpatel.me', 'mannpatel.me']);

/** The canonical URL for a request, or null when it is already canonical (or not our domain). */
export function canonicalUrl(input: string): string | null {
  const url = new URL(input);
  if (!REDIRECT_HOSTS.has(url.hostname)) return null; // previews, workers.dev, local testing
  if (url.hostname === CANONICAL_HOST && url.protocol === 'https:') return null;
  url.protocol = 'https:';
  url.hostname = CANONICAL_HOST;
  url.port = '';
  // Match the site's trailing-slash pages in the same hop (files such as /favicon.ico keep theirs).
  const last = url.pathname.split('/').pop() ?? '';
  if (!url.pathname.endsWith('/') && !last.includes('.')) url.pathname += '/';
  return url.toString();
}
