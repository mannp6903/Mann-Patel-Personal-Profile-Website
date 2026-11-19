// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { pricesPublished } from './src/data/packages.ts';
import { lastmodFor } from './scripts/sitemap-lastmod.mjs';
import { buildHeadersFile } from './src/lib/security-headers.ts';
import { writeOgImages } from './scripts/og-images.mjs';
import { randomBytes } from 'node:crypto';
import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Security headers (SEO audit Phase 4): after every build, write the headers from src/lib/security-headers.ts into
 * the built _headers file, with a Content Security Policy that allows each inline script by its hash. Cloudflare
 * serves the static pages with them; the Node preview server ignores _headers (the e2e suite enforces the CSP).
 */
/** @type {import('astro').AstroIntegration} */
const securityHeaders = {
  name: 'security-headers',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const root = fileURLToPath(dir);
      const files = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));
      const pages = await Promise.all(files.map((f) => readFile(join(root, f), 'utf8')));
      const target = join(root, '_headers');
      await writeFile(target, buildHeadersFile(await readFile(target, 'utf8'), pages));
    },
  },
};

/**
 * Sharing images (Nov 2026 audit fixes): after every build, draw each page's own 1200 × 630 Open Graph card from its
 * title (scripts/og-images.mjs; the address comes from src/lib/og.ts through BaseLayout).
 */
/** @type {import('astro').AstroIntegration} */
const ogImages = {
  name: 'og-images',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const count = await writeOgImages(fileURLToPath(dir));
      logger.info(`${count} sharing images written to og/p/`);
    },
  },
};

/**
 * Domain-dependent values come from the environment (see .env.example).
 * - PUBLIC_SITE_URL: the real production origin, e.g. https://example.ca (no trailing slash)
 * - SITE_INDEXING=true: allow search engines. Only honoured when PUBLIC_SITE_URL is set.
 * - DEPLOY_TARGET=cloudflare: build for Cloudflare Workers (production, see wrangler.jsonc);
 *   otherwise a standalone Node server (local preview and tests).
 */
const SITE_URL = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '') || undefined;
const INDEXING = process.env.SITE_INDEXING === 'true' && Boolean(SITE_URL);
const TARGET = process.env.DEPLOY_TARGET === 'cloudflare' ? 'cloudflare' : 'node';

export default defineConfig({
  site: SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  // Keep HTML-aware whitespace (Astro 7 defaults to JSX rules, which drop spaces between inline elements).
  compressHTML: true,
  output: 'static',
  adapter:
    TARGET === 'cloudflare'
      ? // Images are resized at build time (no Cloudflare Images subscription needed);
        // static pages are prerendered with Node, only /api/enquiry/ runs as a Worker.
        cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' })
      : node({ mode: 'standalone', bodySizeLimit: 64 * 1024 }),
  // No logins or carts, so no session storage (stops the Cloudflare adapter adding a KV namespace).
  session: false,
  // /pricing/ joins the sitemap only once a price is approved (src/data/packages.ts).
  integrations: INDEXING
    ? [
        securityHeaders,
        ogImages,
        sitemap({
          // /free-check/ is a noindex campaign landing page (reached from social links only).
          filter: (page) =>
            !page.includes('/api/') &&
            !page.includes('/contact/received/') &&
            !page.endsWith('/free-check/') &&
            (pricesPublished || !page.endsWith('/pricing/')),
          // <lastmod> per URL: a guide's front-matter date, else the last commit to that page's source files
          // (scripts/sitemap-lastmod.mjs). Left out when no true date can be read (Website Playbook, 16 Nov 2026).
          serialize: (item) => {
            const lastmod = lastmodFor(new URL(item.url).pathname);
            return lastmod ? { ...item, lastmod } : item;
          },
        }),
        // Also serve the index at the conventional /sitemap.xml (what Search Console and most guides expect).
        {
          name: 'sitemap-xml-alias',
          hooks: {
            'astro:build:done': async ({ dir }) => {
              await copyFile(new URL('sitemap-index.xml', dir), new URL('sitemap.xml', dir));
            },
          },
        },
      ]
    : [securityHeaders, ogImages],
  prefetch: false,
  devToolbar: { enabled: false },
  // Inline all CSS: no render-blocking stylesheet requests (the whole site's CSS is small).
  // Measured 15 Nov 2026 (SEO audit Phase 4): moving it to cached files ('never') cut the home page HTML from
  // 171 KB to 102 KB, but on a first visit Lighthouse mobile scored 97–100 instead of 98–100, with first paint
  // 1.5–2.0 s instead of 1.1–1.5 s (the 45 KB shared stylesheet blocks rendering). Kept inline.
  // Measured again 17 Nov 2026 (design upgrade Phase 7, task 7.1) against 'auto': first paint and LCP 0.80 s inline
  // against 1.06 s with two linked stylesheets, on Home, /services/ and the case study. Kept inline: docs/stack.md.
  build: { inlineStylesheets: 'always' },
  image: { responsiveStyles: true },
  vite: {
    // Signs the form's time-check token when FORM_TOKEN_SECRET isn't set: random per build,
    // server-only (used by src/pages/api/enquiry.ts), never committed.
    define: { __FORM_BUILD_SECRET__: JSON.stringify(randomBytes(32).toString('hex')) },
  },
  env: {
    schema: {
      // Build-time, public
      PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      // Phone for the Call / WhatsApp / Text buttons, E.164 (e.g. +16475550142). Set it as a
      // Cloudflare build variable so the number is never stored in this public repository.
      PUBLIC_CONTACT_PHONE: envField.string({ context: 'client', access: 'public', optional: true }),
      // The demo line for the fictional Example Cleaning Co. (SEO report follow-up, 19 Nov 2026): a "Try it" box on
      // /services/enquiry-follow-up/, shown only while this holds a number. Set it once the demo line is live and tested.
      PUBLIC_DEMO_PHONE: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      SITE_MODE: envField.enum({ context: 'server', access: 'public', values: ['preview', 'production'], default: 'preview' }),
      SITE_INDEXING: envField.boolean({ context: 'server', access: 'public', default: false }),
      // Runtime secrets (read when the enquiry endpoint runs, never inlined into the bundle)
      ENQUIRY_DELIVERY: envField.enum({ context: 'server', access: 'secret', values: ['file', 'resend', 'cloudflare', 'webhook', 'none'], optional: true }),
      ENQUIRY_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ENQUIRY_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ENQUIRY_ACKNOWLEDGE: envField.boolean({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      ENQUIRY_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ENQUIRY_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      FORM_TOKEN_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
    validateSecrets: false,
  },
});
