# Stack: one default tool per job

The tool to reach for first, for each job on mannpatel.me (Website Playbook, 16 Nov 2026). Change a default here, in
the same pull request, before adding a second tool for the same job. Hosting and wiring are in
[infrastructure.md](infrastructure.md).

| Job | Default | Where |
| --- | --- | --- |
| Site framework | Astro 7: static pages, one server route | `astro.config.mjs`, `src/pages/` |
| Styling | Plain CSS with design tokens (no CSS framework), inlined in each page (see CSS delivery below) | `src/styles/tokens.css`, `src/styles/global.css`, component `<style>` |
| Type | Geist and Geist Mono, self-hosted subsets | `public/fonts/`, `scripts/subset-fonts.py` |
| Content (guides, case studies) | Astro content collections (Markdown + schema) | `src/content/`, `src/content.config.ts` |
| Site facts (contact, profiles, booking link) | One config file | `src/data/site.ts` |
| Prices | One data file, used by pages and structured data | `src/data/packages.ts` |
| Images | `astro:assets`, resized at build time | `<Image>` in components |
| Sharing images | Drawn at build time from each page's title | `scripts/og-images.mjs` |
| Hosting and DNS | Cloudflare Workers with static assets, Cloudflare DNS | `wrangler.jsonc`, `src/worker/entry.ts` |
| Form handling | `/api/enquiry/` on the Worker | `src/pages/api/enquiry.ts`, `src/lib/enquiry/` |
| Form delivery | Cloudflare Email (`send_email` binding) | `src/lib/enquiry/delivery.ts` |
| Inbound email | Cloudflare Email Routing (`info@`) | Cloudflare dashboard |
| Spam protection | Honeypot, signed time token, link limit; Cloudflare Turnstile when keys are set | `src/lib/enquiry/spam.ts` |
| Booking | A plain link to a booking page (Cal.com or a Google Calendar appointment schedule) | `bookingUrl` in `src/data/site.ts` (not set yet) |
| Reviews | Google Business Profile reviews, shown with the `Testimonial` component or reviews strip | `src/data/reviews.ts`, `src/components/Testimonial.astro` (no reviews yet) |
| Analytics | GA4, only after consent; Cloudflare Web Analytics (cookieless) | `src/scripts/analytics.ts`, Cloudflare dashboard |
| Structured data | Hand-written JSON-LD from the site data | `src/lib/seo.ts` |
| Sitemap | `@astrojs/sitemap`, with each page's own `<lastmod>` | `astro.config.mjs`, `scripts/sitemap-lastmod.mjs` |
| Telling search engines about changes | IndexNow after each deploy | `scripts/indexnow.mjs` |
| AI search summary | `llms.txt` | `public/llms.txt` |
| Security headers | One module, written into `_headers` at build | `src/lib/security-headers.ts` |
| Unit tests | Vitest | `tests/unit/` |
| Browser tests and accessibility checks | Playwright with axe-core | `tests/e2e/site.spec.ts` |
| Type checks | `astro check` | `npm run check` |
| Pre-launch checks | Node script on the production build | `scripts/prelaunch-check.mjs`, `scripts/seo-check.mjs` |
| Continuous integration | GitHub Actions | `.github/workflows/ci.yml` |
| Link checking | lychee | `.github/workflows/ci.yml` |
| Performance and accessibility budgets | Lighthouse CI | `lighthouserc.json` |

## CSS delivery (design upgrade Phase 7, task 7.1, 17 Nov 2026)

**Every page's CSS is inlined in its HTML** (`build: { inlineStylesheets: 'always' }` in `astro.config.mjs`).

How it was measured: two production builds of the same code (`npm run build:cloudflare`), one with `'always'` and one
with `'auto'` (Astro links a stylesheet when it is larger than 4 KB). Lighthouse 13.6, mobile, simulated throttling,
five runs per page; medians below.

| Page | `'always'` first paint / LCP | `'auto'` first paint / LCP | Transfer, `'always'` / `'auto'` |
| --- | --- | --- | --- |
| `/` | 0.80 s / 0.80 s | 1.07 s / 1.07 s | 145 / 147 KB |
| `/services/` | 0.80 s / 0.80 s | 1.06 s / 1.06 s | 81 / 83 KB |
| `/work/nest-and-rest-cleaning/` | 0.80 s / 0.80 s | 1.06 s / 1.06 s | 138 / 140 KB |

- With `'auto'`, two stylesheets block the first paint (the shared one is 51 KB). Inlined, nothing blocks it, and every
  page paints about 0.26 s sooner on a first visit.
- What `'auto'` would win is repeat visits: the shared stylesheet is cached, so each later page's HTML is about 14 KB
  smaller (compressed). Most visitors come once, from search, so the first visit counts more.
- This repeats the 15 Nov 2026 result (SEO audit Phase 4: `'never'` against `'always'`, first paint 1.5–2.0 s against
  1.1–1.5 s).
- Measure again if the CSS grows a lot. Home's HTML is 202 KB (38 KB compressed), of which 88 KB is CSS.

## Lighthouse budgets (design upgrade Phase 7, task 7.5)

`lighthouserc.json` runs on eight pages in CI (three runs each) and judges each page by its **median** run (Lighthouse
CI's default is the best run, which let two slow runs out of three pass). Gate P1 is the source of each number:

- **Performance:** at least 0.95 on every page, or CI fails; at least 0.98, or CI warns; Home at least 0.97, or CI fails.
- **LCP:** at most 1.8 s (P1). The plan's task 7.5 said 2.0 s; the stricter P1 figure is used, so CI checks the gate.
- **CLS:** at most 0.02.
- **TBT:** at most 100 ms, as a warning (CI machines vary in CPU speed); P1's 100 ms is checked in the local run.
- **Accessibility and SEO:** 1.00.

