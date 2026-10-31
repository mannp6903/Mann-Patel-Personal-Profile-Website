import { SITE_MODE, SITE_INDEXING } from 'astro:env/server';
import { PUBLIC_SITE_URL } from 'astro:env/client';

/** "production" turns unresolved "To confirm" items into build errors. */
export const isProduction = SITE_MODE === 'production';
/** Search engines may index only a deliberate production build with a real domain. */
export const indexing = Boolean(SITE_INDEXING && PUBLIC_SITE_URL);
export const siteUrl = PUBLIC_SITE_URL?.replace(/\/$/, '') ?? null;

export function absoluteUrl(path: string): string | null {
  if (!siteUrl) return null;
  return new URL(path, siteUrl + '/').toString();
}
