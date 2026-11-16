import type { APIRoute } from 'astro';
import { indexing, siteUrl } from '../lib/mode';

/**
 * Previews: block everything. Production (SITE_INDEXING=true + PUBLIC_SITE_URL): allow every crawler except on /api/,
 * with the AI search and answer bots named in their own group (Website Playbook, 16 Nov 2026), so a later rule for
 * `*` can't shut them out by accident. The sitemap is /sitemap.xml, the copy of sitemap-index.xml the build writes
 * (astro.config.mjs → sitemap-xml-alias).
 */
const AI_SEARCH_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];

export const GET: APIRoute = () => {
  const body =
    indexing && siteUrl
      ? [
          'User-agent: *',
          'Allow: /',
          'Disallow: /api/',
          '',
          ...AI_SEARCH_BOTS.map((bot) => `User-agent: ${bot}`),
          'Allow: /',
          'Disallow: /api/',
          '',
          `Sitemap: ${siteUrl}/sitemap.xml`,
          '',
        ].join('\n')
      : `# Preview build: not for search engines.\nUser-agent: *\nDisallow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
