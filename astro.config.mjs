// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

/**
 * Domain-dependent values come from the environment (see .env.example).
 * - PUBLIC_SITE_URL: the real production origin, e.g. https://example.ca (no trailing slash)
 * - SITE_INDEXING=true: allow search engines. Only honoured when PUBLIC_SITE_URL is set.
 * - DEPLOY_TARGET=netlify: build for Netlify; otherwise a standalone Node server (local preview).
 */
const SITE_URL = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '') || undefined;
const INDEXING = process.env.SITE_INDEXING === 'true' && Boolean(SITE_URL);
const TARGET = process.env.DEPLOY_TARGET === 'netlify' ? 'netlify' : 'node';

export default defineConfig({
  site: SITE_URL ?? 'http://localhost:4321',
  trailingSlash: 'always',
  // Keep HTML-aware whitespace (Astro 7 defaults to JSX rules, which drop spaces between inline elements).
  compressHTML: true,
  output: 'static',
  adapter: TARGET === 'netlify' ? netlify() : node({ mode: 'standalone', bodySizeLimit: 64 * 1024 }),
  integrations: INDEXING ? [sitemap({ filter: (page) => !page.includes('/api/') && !page.includes('/contact/received/') })] : [],
  prefetch: false,
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'auto' },
  image: { responsiveStyles: true },
  env: {
    schema: {
      // Build-time, public
      PUBLIC_SITE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      SITE_MODE: envField.enum({ context: 'server', access: 'public', values: ['preview', 'production'], default: 'preview' }),
      SITE_INDEXING: envField.boolean({ context: 'server', access: 'public', default: false }),
      // Runtime secrets (read when the enquiry endpoint runs, never inlined into the bundle)
      ENQUIRY_DELIVERY: envField.enum({ context: 'server', access: 'secret', values: ['file', 'resend', 'webhook', 'none'], optional: true }),
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
