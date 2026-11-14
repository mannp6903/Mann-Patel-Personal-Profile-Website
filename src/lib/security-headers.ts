/**
 * Security headers (SEO audit Phase 4, Mann's choice, 14 Nov 2026). One source for:
 * - the static pages: the build writes these into dist/client/_headers, where public/_headers has HEADERS_MARKER
 *   (astro.config.mjs → `security-headers`);
 * - the responses the Worker builds itself, the 404 page and /api/ (src/worker/entry.ts → withSecurityHeaders).
 *
 * HSTS starts at six months, without includeSubDomains or preload, so it is easy to undo. The Content Security
 * Policy ships as Content-Security-Policy-Report-Only first: Cloudflare can inject scripts into the live site (an
 * analytics beacon, email obfuscation) that a local build never shows. Inline scripts are allowed by their exact
 * sha256 hash, computed from the built pages, never by 'unsafe-inline'. Styles need 'unsafe-inline' (the pages use
 * hundreds of style="--d:…" attributes for animation timing). The e2e suite enforces the built policy on every
 * page and expects no violations, so it can be switched to Content-Security-Policy once the live site is quiet.
 */
import { createHash } from 'node:crypto';

export const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Frame-Options': 'DENY',
  // Six months, this host only. Raise it (and consider includeSubDomains) once it has run without problems.
  'Strict-Transport-Security': 'max-age=15552000',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/** The line in public/_headers that the build replaces with the headers. */
export const HEADERS_MARKER = '# Security headers: written here at build time from src/lib/security-headers.ts';
/** Cloudflare's limit for one header value in _headers. */
export const MAX_HEADER_LENGTH = 2000;

/**
 * The policy. Outside hosts are the ones the site can load when they are switched on: Cloudflare Turnstile (spam
 * check on the forms), Google Analytics 4 (only after consent, per Google's CSP guidance) and Cloudflare Web
 * Analytics (if it is turned on in the dashboard).
 */
export function contentSecurityPolicy(scriptHashes: string[]): string {
  return [
    "default-src 'self'",
    ['script-src', "'self'", ...scriptHashes, 'https://challenges.cloudflare.com', 'https://*.googletagmanager.com', 'https://static.cloudflareinsights.com'].join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
    "font-src 'self'",
    "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://cloudflareinsights.com",
    'frame-src https://challenges.cloudflare.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

const EXECUTABLE = /^(|module|text\/javascript|application\/javascript)$/i;

/** 'sha256-…' sources for every executable inline script in the pages (scripts with a src, and JSON-LD, skipped). */
export function inlineScriptHashes(pages: string[]): string[] {
  const hashes = new Set<string>();
  for (const html of pages) {
    for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\ssrc=/.test(` ${attrs}`)) continue;
      const type = (attrs.match(/\btype=["']?([^"'\s>]+)/) || [])[1] ?? '';
      if (!EXECUTABLE.test(type)) continue;
      hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
    }
  }
  return [...hashes].sort();
}

/** The built _headers file: the marker replaced by the headers, with a CSP hashed for these pages. */
export function buildHeadersFile(headersFile: string, pages: string[]): string {
  if (!headersFile.includes(HEADERS_MARKER)) throw new Error(`public/_headers has no "${HEADERS_MARKER}" line`);
  const csp = contentSecurityPolicy(inlineScriptHashes(pages));
  if (csp.length > MAX_HEADER_LENGTH)
    throw new Error(`The Content Security Policy is ${csp.length} characters, over Cloudflare's ${MAX_HEADER_LENGTH}-character limit`);
  const lines = [...Object.entries(securityHeaders).map(([k, v]) => `  ${k}: ${v}`), `  Content-Security-Policy-Report-Only: ${csp}`];
  return headersFile.replace(new RegExp(`^[ \\t]*${HEADERS_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \\t]*$`, 'm'), lines.join('\n'));
}

/** The same headers on a response the Worker builds itself; a header the response already has is kept. */
export function withSecurityHeaders(response: Response): Response {
  const out = new Response(response.body, response);
  for (const [k, v] of Object.entries(securityHeaders)) if (!out.headers.has(k)) out.headers.set(k, v);
  return out;
}
