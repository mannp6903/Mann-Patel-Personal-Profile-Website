# 09 · Audit round 3 (1 Nov 2026)

Input: owner-supplied audit refresh, **78/100**, reviewed against the live site on 1 Nov 2026.
Work in the repository (branch `ccr-67f44a70-a4hp7n`) and a local preview. Not published until merged.

## Access limits

The live site, the reference sites and Mobbin were **not reachable from this workspace** (network policy). The deployed code is the main branch (`e2eb17c`, which adds only a `CNAME` file), so the source was inspected and the audit's live observations were used. Lighthouse ran locally (12.8.2, mobile, simulated throttling).

## P0: the contact warning, now diagnosed

Since round 2 the page shows the warning **only** when `GET /api/enquiry/` answers `connected: false` with `reason: "not_configured"`. A failed or blocked status check no longer shows it (`src/components/ContactForm.astro`, `refreshToken`). The audit saw the warning after the page loaded, so the production Worker itself reported that email delivery is not configured.

**Cause:** the Worker has `ENQUIRY_DELIVERY=resend` (in `wrangler.jsonc`) but not the secrets `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL` and `ENQUIRY_FROM_EMAIL` (and `FORM_TOKEN_SECRET`). This is an owner action, not a code defect. The warning is correct and stays until delivery works. Nothing was hidden to make the page look finished.

**Acceptance (owner + one test):** add the four secrets, reload `/contact/` (the warning disappears), send one brief named "Test Owner", and confirm it arrives with its service areas. Retry and duplicate protection are already covered by tests (`enquiry form` suite).

## What changed

| Finding (audit) | Change | Files |
| --- | --- | --- |
| No enquiry action in the hero | The service promise is now the **visible H1** ("Websites & simpler systems for small businesses", with "Mann Patel:" for screen readers); **Start a project** and **See my work** sit right under it. On phones, the location becomes a small eyebrow, and the promise and both buttons sit above the portrait | `src/components/home/Hero.astro` |
| Hero alt text described the old street photo | "Mann Patel smiling, in a dark green sweatshirt." | same |
| Work previews needed hover | Touch screens show the project image in each row; every row shows a **Case study →** cue | `src/components/home/WorkList.astro` |
| Long Services catalogue | **Compare at a glance** table: each package against Website / Google visibility / Email & follow-up / Content & branding, derived from the package's own `serviceIds` (the check-up row says it is a review, not a build). Scrolls inside its own box on phones | `src/pages/services.astro` |
| Workflow demo only after the catalogue | Link from the Content & Follow-up package to `#follow-up`; Home "What I do" links to it too | `src/pages/services.astro`, `src/pages/index.astro` |

Preserved: packages-first order, grouped contact choices, "Look closer" annotations, portrait identity markup, the moving-name pause control and the workflow tabs.

## Verification

| Check | Result |
| --- | --- |
| `astro check` | 0 errors |
| Unit / Playwright + axe | 30/30 · **44/44** (new: H1 + "Start a project" inside the first viewport at 360×640, 390×844, 1440×900; touch thumbnails + case-study cue; comparison table + follow-up link) |
| Layout | No page-level horizontal scroll at 360, 390, 768, 1024, 1440 px on 8 pages (the comparison table scrolls inside its own box by design) |
| Lighthouse 12.8.2 mobile, simulated | `/` 96 · 100 · 100, LCP 2.5 s · `/services/` 97 · 100 · 100, LCP 2.1 s · `/contact/` 98 · 100 · 100 · `/work/` 98 · 100 · 100. SEO 63–66 only because local builds are `noindex` |
| `npm run build:cloudflare` | 0 errors, 4 warnings (the four dashboard-only secrets) |
| Live delivery, live rendering, Search Console | Untested here |

## Score (same rubric)

| Area | Before | After | Note |
| --- | --- | --- | --- |
| Positioning and offer | 13 | 14 | Promise is the H1, with an action beside it |
| Visual design | 17 | 18 | Hero balance: promise + actions now hold their own against the portrait |
| Navigation and discovery | 13 | 14 | Package comparison; demo links |
| Work and evidence | 12 | 12 | No new outcomes (none exist yet) |
| Interaction and motion | 9 | 9 | Touch-friendly work rows; pause control unchanged |
| Enquiry reliability | 5 | 5 | **Unchanged until the secrets are set and a test brief arrives** (then ≈13) |
| SEO foundations | 9 | 9 | H1 now matches the visible promise |
| **Total** | **78** | **81** | ≈ 89 once the form is verified; a domain email adds the rest |

## Owner actions (in order)

1. **Turn on the form:** Resend → verify `mannpatel.me` → Cloudflare *Workers & Pages → mann-patel-website → Settings → Variables and Secrets*: add **Secret** `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`, `FORM_TOKEN_SECRET`. Send one test brief.
2. **Domain email:** Cloudflare *Email → Email Routing*: forward `hello@mannpatel.me` to Gmail. After a test message arrives, change `profile.contact.email` in `src/data/site.ts` (one place updates the header menu, footer, form fallback and privacy page).
3. **Search Console:** add the `mannpatel.me` domain property, submit `https://mannpatel.me/sitemap.xml`.
4. `CNAME` in the repo root is only used by GitHub Pages. Keep GitHub Pages **off** for this repo; Cloudflare serves the site.
