// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import { randomBytes } from 'node:crypto';

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
  integrations: INDEXING ? [sitemap({ filter: (page) => !page.includes('/api/') && !page.includes('/contact/received/') })] : [],
  prefetch: false,
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
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
