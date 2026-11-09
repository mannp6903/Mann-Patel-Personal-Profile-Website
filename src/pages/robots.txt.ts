import type { APIRoute } from 'astro';
import { indexing, siteUrl } from '../lib/mode';

/** Previews: block everything. Production (SITE_INDEXING=true + PUBLIC_SITE_URL): allow, with sitemap. */
export const GET: APIRoute = () => {
  const body =
    indexing && siteUrl
      ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`
      : `# Preview build: not for search engines.\nUser-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
