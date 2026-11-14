/**
 * Worker entry (14 Nov 2026). Sends every visit to one address, https://mannpatel.me, before
 * anything else runs: www.mannpatel.me and plain http:// get a single 301 to the same path and
 * query (with the trailing slash the site uses). Other GET and HEAD requests go straight to the
 * static files (so _headers, _redirects, ETags and 304s behave exactly as before); /api/ routes and
 * anything the files don't have (the 404 page) go to Astro's normal handler.
 *
 * This needs `assets.run_worker_first: true` in wrangler.jsonc, because static files are
 * otherwise served before the Worker sees the request. It replaces the dashboard redirect rule.
 */
import astro from '@astrojs/cloudflare/entrypoints/server';
import { canonicalUrl } from '../lib/canonical-url';
import { withSecurityHeaders } from '../lib/security-headers';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}
type Handler = { fetch: (r: Request, e: Env, c: unknown) => Promise<Response> };

export default {
  async fetch(request: Request, env: Env, ctx: unknown) {
    const target = canonicalUrl(request.url);
    if (target) return Response.redirect(target, 301);
    const { pathname } = new URL(request.url);
    if ((request.method === 'GET' || request.method === 'HEAD') && !pathname.startsWith('/api/')) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }
    // The 404 page and /api/ responses don't come from the static files, so they get the security headers here
    // (the static files get them from _headers).
    return withSecurityHeaders(await (astro as unknown as Handler).fetch(request, env, ctx));
  },
};
