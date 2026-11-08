# Mann Patel: personal site

Personal profile and digital-services site for Mann Patel (production domain: **mannpatel.me**), founder of Nest & Rest Cleaning, who helps Toronto small businesses **look professional, get found, and follow up**.

Built with **Astro 7** (static pages + one server endpoint for the project-brief form), vanilla TypeScript islands, and self-hosted OFL fonts. No CMS, no client framework, no tracking unless configured.

**Design: "Signal", as a compact editorial portfolio (round 7, 8 Nov 2026).** Dark, with one lime accent and Mann's portrait drawn as a live signal. Real work comes straight after a compact hero (both projects, honestly labelled), then three service summaries, the free check, how I work and questions. Enquiries: a 3-step project brief and a 1-minute free check, with honest sending states and an email/copy fallback while direct delivery is off. Case studies lead with a summary and show dated, real test evidence. The system is in [`DESIGN.md`](DESIGN.md); round 7 (audit response, verification, remaining blocker, deploy and rollback) is in [`docs/14-round-7-editorial.md`](docs/14-round-7-editorial.md).

> **Status: content confirmed (31 Oct 2026).** All "To confirm" items are answered. Production deploys still run the pre-launch check, and the form's inbox address (`ENQUIRY_TO_EMAIL`) and phone number (`PUBLIC_CONTACT_PHONE`) are added in Cloudflare. See [`docs/OWNER-INPUTS.md`](docs/OWNER-INPUTS.md).

## Quick start

```bash
npm install                 # Node ≥ 22.12
cp .env.example .env        # defaults: preview mode, enquiries saved to .data/enquiries.jsonl
npm run dev                 # http://localhost:4321
```

Build and run the production server locally:

```bash
npm run build
npm run preview             # node ./dist/server/entry.mjs → http://localhost:4321
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Build to `dist/` with the Node adapter (local preview and tests) |
| `npm run build:cloudflare` | Production build for Cloudflare Workers (mannpatel.me) + pre-launch check |
| `npm run deploy:cloudflare` | Build and deploy from your computer (`npx wrangler login` first) |
| `npm run preview` | Serve the built site, including the enquiry endpoint |
| `npm run check` | Astro + TypeScript diagnostics |
| `npm test` | Unit tests (Vitest): validation, guide logic, spam, limits, delivery, handler |
| `npm run test:e2e` | Browser tests (Playwright + axe): pages, accessibility, layout 320–1440 px and 200% text, menu, ⌘K menu, signal portrait, finder, reduced motion, no-JS, every form path including the email fallback, and the round-6 effects (WebGL field, cursor, magnetic, decoding, marquee, scroll-lit text, spotlight, tilt, transitions, script-free first screen). Run `npm run build` first. |
| `npm run qa:captures` | Full-page screenshots at 360/390/768/1024/1440 + overflow report (server must be running) |
| `npm run qa:lighthouse` | Lighthouse mobile run (`npm i --no-save lighthouse` first) |
| `npm run images` | Regenerate favicons, the default sharing image and one sharing card per case study (from its real capture and status) |
| `python3 scripts/subset-fonts.py` | Re-cut the web fonts to the characters the copy uses (`pip install fonttools brotli` first) |
| `npm run preview:static` | Export a server-less copy with relative links to `preview-static/` (for private previews; the form shows "not connected") |
| `npm run prelaunch` | Production gate: env, preview markers, canonicals, robots/sitemap, internal links |

## Editing content

All copy lives outside layout code. See the table in [`docs/OWNER-INPUTS.md`](docs/OWNER-INPUTS.md#where-to-edit-content). Two markers keep drafts honest:

- `<Confirm note="…">` marks a **claim** that needs Mann's confirmation. It shows in previews and **fails the production build**.
- `<PreviewNote note="…">` marks a missing **optional** item. It shows in previews only.

## Environment and integrations

Variable names are documented in [`.env.example`](.env.example). Never commit `.env`; this repository is public. Secrets are read at runtime through `astro:env` and are never inlined into the bundle.

- Enquiry delivery: `file` (local), `resend` (email), `webhook` (e.g. Google Sheet), `none` (honest "not connected").
- Analytics: off unless `PUBLIC_GA4_ID` is set; loads only after consent.
- Spam: honeypot + signed time token (`FORM_TOKEN_SECRET`), optional Turnstile.

Setup steps, monitoring, deploy, rollback and recurring costs: [`docs/05-launch-and-integrations.md`](docs/05-launch-and-integrations.md).

## Deploy (summary)

Cloudflare Workers, connected to GitHub: build command `npm run build:cloudflare`, deploy command `npx wrangler deploy`, project name `mann-patel-website`. `wrangler.jsonc` connects mannpatel.me and www.mannpatel.me. The form emails briefs through Cloudflare Email (Email Routing + Secret `ENQUIRY_TO_EMAIL`); the phone number for the Call/WhatsApp/Text buttons is the build variable `PUBLIC_CONTACT_PHONE`. Full steps, secrets and rollback: [`docs/05-launch-and-integrations.md`](docs/05-launch-and-integrations.md) §4.

## Documentation

| Doc | Contents |
| --- | --- |
| [`docs/00-capabilities.md`](docs/00-capabilities.md) | Tools and connectors available during the build |
| [`docs/01-research.md`](docs/01-research.md) | 10 reference sites, matrix, principles, Nest & Rest evidence, guidance checked |
| [`docs/02-positioning-and-profile.md`](docs/02-positioning-and-profile.md) | Positioning, bios, principles, founder story, social bios, signature, portrait/wordmark direction |
| [`docs/03-services-and-journeys.md`](docs/03-services-and-journeys.md) | Service structure, packages, boundaries, sitemap, journeys |
| [`docs/04-design-system.md`](docs/04-design-system.md) | Three directions, tokens, components, motion, interactions |
| [`docs/05-launch-and-integrations.md`](docs/05-launch-and-integrations.md) | Enquiry pipeline, analytics, SEO, Search Console, hosting, costs |
| [`docs/06-qa-report.md`](docs/06-qa-report.md) | Test results, Lighthouse, accessibility, captures, rubric |
| [`docs/07-audit-round-2.md`](docs/07-audit-round-2.md) | Audit round 2 (1 Nov 2026): contact-form diagnosis, changes, verification, before/after score, SEO plan, handover |
| [`docs/08-studio-redesign.md`](docs/08-studio-redesign.md) | Studio-style redesign: hero, menu, work list, footer, motion and checks |
| [`docs/09-audit-round-3.md`](docs/09-audit-round-3.md) | Audit round 3: contact warning diagnosed, hero actions, touch work rows, package comparison |
| [`docs/10-round-4-original-design.md`](docs/10-round-4-original-design.md) | Round 4: original "front desk" design, Cloudflare Email form delivery, info@ + Call/WhatsApp/Text, zero overlaps, scorecard |
| [`docs/11-service-areas.md`](docs/11-service-areas.md) | Service areas rebuilt from research: A Get found and chosen, B Never miss an enquiry, C A website that books work |
| [`DESIGN.md`](DESIGN.md) | Round 5 design system "Signal": colour roles and contrast, type, spacing, components, imagery, motion |
| [`docs/12-round-5-signal.md`](docs/12-round-5-signal.md) | Round 5: research, direction, every new feature, verification (tests, axe, Lighthouse), owner notes |
| [`docs/13-round-6-live-signal.md`](docs/13-round-6-live-signal.md) | Round 6: the "Live Signal" effects layer, bugs fixed (incl. the local Cloudflare build), Lighthouse 99–100 |
| [`docs/14-round-7-editorial.md`](docs/14-round-7-editorial.md) | Round 7: the 8 Nov audit applied (work first, free-check path, honest delivery states, case-study evidence, package comparison), verification, the delivery blocker, deploy and rollback |
| [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md) | What the site uses that others made, and on what terms |
| [`docs/OWNER-INPUTS.md`](docs/OWNER-INPUTS.md) | Questions and owner actions |

## Licences

Fonts: Mona Sans (served as the subset "Signal Sans", renamed as its Reserved Font Name requires), Instrument Serif and Geist Mono, SIL Open Font License 1.1 (`public/fonts/LICENSES.txt`). The earlier wordmark files in `public/brand/` are outlined from Fraunces (SIL OFL 1.1). The portrait is Mann's own photo. Nest & Rest captures are screenshots of Mann's own website, nestnrestcleaning.com (live site, 31 Oct and 8 Nov 2026).
