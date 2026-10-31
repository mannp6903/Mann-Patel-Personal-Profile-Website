# Mann Patel: personal site

Personal profile and digital-services site for Mann Patel, founder of Nest & Rest Cleaning, who helps Toronto small businesses **look professional, get found, and follow up**.

Built with **Astro 7** (static pages + one server endpoint for the project-brief form), vanilla TypeScript islands, and self-hosted OFL fonts. No CMS, no client framework, no tracking unless configured.

> **Status: private preview.** Draft copy has yellow "To confirm" notes. A production build fails until they're resolved. See [`docs/OWNER-INPUTS.md`](docs/OWNER-INPUTS.md).

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
| `npm run build` | Build to `dist/` (Node adapter by default; Netlify when `DEPLOY_TARGET=netlify`) |
| `npm run preview` | Serve the built site, including the enquiry endpoint |
| `npm run check` | Astro + TypeScript diagnostics |
| `npm test` | Unit tests (Vitest): validation, guide logic, spam, limits, delivery, handler |
| `npm run test:e2e` | Browser tests (Playwright + axe): pages, accessibility, layout 320–1440 px, navigation, interactions, every form path. Run `npm run build` first. |
| `npm run qa:captures` | Full-page screenshots at 360/390/768/1024/1440 + overflow report (server must be running) |
| `npm run qa:lighthouse` | Lighthouse mobile run (`npm i --no-save lighthouse` first) |
| `npm run images` | Regenerate favicons and the Open Graph image |
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

Netlify: import the repo; settings come from `netlify.toml`. Branch and preview deploys are `noindex`. Production deploys run the pre-launch gate and fail until content is confirmed and delivery and secrets are configured. Rollback: Netlify → Deploys → publish a previous deploy.

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
| [`docs/OWNER-INPUTS.md`](docs/OWNER-INPUTS.md) | Questions and owner actions |

## Licences

Fonts: Bricolage Grotesque and Atkinson Hyperlegible Next/Mono, SIL Open Font License 1.1 (`public/fonts/LICENSES.txt`). Nest & Rest captures are archived screenshots of Mann's own website (Internet Archive, 19 Oct 2026).
