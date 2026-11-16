# Stack: one default tool per job

The tool to reach for first, for each job on mannpatel.me (Website Playbook, 16 Nov 2026). Change a default here, in
the same pull request, before adding a second tool for the same job. Hosting and wiring are in
[infrastructure.md](infrastructure.md).

| Job | Default | Where |
| --- | --- | --- |
| Site framework | Astro 7: static pages, one server route | `astro.config.mjs`, `src/pages/` |
| Styling | Plain CSS with design tokens (no CSS framework) | `src/styles/tokens.css`, `src/styles/global.css`, component `<style>` |
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
