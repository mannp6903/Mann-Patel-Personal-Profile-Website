import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { securityHeaders, contentSecurityPolicy, inlineScriptHashes, withSecurityHeaders, buildHeadersFile, HEADERS_MARKER } from '../../src/lib/security-headers';

// SEO audit Phase 4, security headers (Mann's choice, 14 Nov 2026). One source: src/lib/security-headers.ts.
describe('security headers', () => {
  it('HSTS for six months, without preload or subdomains (a first step that is easy to undo)', () => {
    expect(securityHeaders['Strict-Transport-Security']).toBe('max-age=15552000');
  });

  it('keeps the headers the site already sent, and adds COOP', () => {
    expect(securityHeaders).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Cross-Origin-Opener-Policy': 'same-origin',
    });
    expect(securityHeaders['Permissions-Policy']).toMatch(/camera=\(\), microphone=\(\), geolocation=\(\)/);
  });

  it('the CSP allows inline scripts only by hash, never unsafe-inline or eval, and locks down the rest', () => {
    const csp = contentSecurityPolicy(["'sha256-abc='", "'sha256-def='"]);
    const dir = (name: string) => csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) ?? '';
    expect(dir('default-src')).toBe("default-src 'self'");
    expect(dir('script-src')).toContain("'self' 'sha256-abc=' 'sha256-def='");
    expect(dir('script-src')).not.toMatch(/unsafe-inline|unsafe-eval/);
    // Turnstile and GA4 run only when switched on; they need their hosts.
    expect(dir('script-src')).toContain('https://challenges.cloudflare.com');
    expect(dir('script-src')).toContain('googletagmanager.com');
    expect(dir('frame-src')).toContain('https://challenges.cloudflare.com');
    expect(dir('img-src')).toContain('data:');
    for (const d of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'"]) expect(csp).toContain(d);
    // Ignored (with a console warning) in a report-only policy; HSTS covers it.
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('hashes every executable inline script, and skips scripts with a src and JSON-LD data blocks', () => {
    const html = `
      <script>console.log(1)</script>
      <script type="module">import "./a.js";</script>
      <script type="module" src="/_astro/x.js"></script>
      <script type="application/ld+json">{"@type":"Thing"}</script>
      <script>console.log(1)</script>`;
    const hashes = inlineScriptHashes([html]);
    expect(hashes).toHaveLength(2);
    // sha256 of "console.log(1)", base64.
    expect(hashes).toContain("'sha256-CihokcEcBW4atb/CW/XWsvWwbTjqwQlE9nj9ii5ww5M='");
  });

  it('public/_headers holds a marker where the build writes the headers (no second, hand-kept copy)', () => {
    const file = readFileSync('public/_headers', 'utf8');
    expect(file).toContain(HEADERS_MARKER);
    for (const name of Object.keys(securityHeaders)) expect(file, name).not.toMatch(new RegExp(`^\\s+${name}:`, 'm'));
  });

  it('the build replaces the marker with every header and a report-only CSP hashed for the pages; no marker, no build', () => {
    const file = `/*\n  ${HEADERS_MARKER}\n\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n`;
    const out = buildHeadersFile(file, ['<script>console.log(1)</script>']);
    expect(out).not.toContain(HEADERS_MARKER);
    for (const [k, v] of Object.entries(securityHeaders)) expect(out).toContain(`  ${k}: ${v}\n`);
    expect(out).toMatch(/^  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self' 'sha256-CihokcEcBW4atb\/CW\/XWsvWwbTjqwQlE9nj9ii5ww5M=' /m);
    expect(out).toContain('/fonts/*\n  Cache-Control: public, max-age=31536000, immutable');
    expect(() => buildHeadersFile('/*\n', [])).toThrow(/no .* line/);
  });

  it('adds the headers to responses the Worker builds itself (404 page, /api/), without overriding ones already set', async () => {
    const res = withSecurityHeaders(new Response('x', { status: 404, headers: { 'X-Frame-Options': 'SAMEORIGIN' } }));
    expect(res.status).toBe(404);
    expect(await res.text()).toBe('x');
    expect(res.headers.get('Strict-Transport-Security')).toBe('max-age=15552000');
    expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(res.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
  });
});
