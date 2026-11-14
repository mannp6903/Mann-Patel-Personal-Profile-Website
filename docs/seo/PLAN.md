# SEO audit implementation plan (approved 14 Nov 2026)

Source of truth: [`docs/seo/audit-2026-11-14.md`](audit-2026-11-14.md) (transcribed from the PDF). Every audit item below
ends up **done in code**, **scheduled in a later phase**, or on the **off-site checklist**
([`docs/seo/OFFSITE-CHECKLIST.md`](OFFSITE-CHECKLIST.md)). Nothing is dropped.

Branch: `seo-audit-2026-11`, one commit per phase, pushed to `origin seo-audit-2026-11` after each phase passes
verification (Mann's approval, 14 Nov 2026). No PR, no deploy. Stop after each phase and wait for Mann. (In practice each
phase was merged by its own pull request at Mann's request; Phase 3 was built on `claude/zen-maxwell-tkspc1`.)

Status: Phase 1 done and live (PR #33, merged 14 Nov 2026) · Phase 2 done (PR #34, merged 14 Nov 2026) · Phase 3 done and merged (14 Nov 2026; the Scarborough page and three outline guides wait on Mann, see below) · Phase 4: Mann chose the Website Care and AI search pages (14 Nov 2026, done on `claude/zen-maxwell-tkspc1`); speed and security headers not chosen.

### Verification log

- **Phase 1 (14 Nov 2026):** `npm run check:seo` 0 errors, 1 warning (/privacy/ description 158 characters; not an
  audit item); a build copy with 10 injected faults failed all of them. `npm run check` 0 errors; `npm test` 78/78;
  `npm run test:e2e` 132/132 (local server, file delivery, no real submissions). Lighthouse 13.6 mobile on the local
  production-like build: / 98/100/100/100 (baseline 98/100/100/100), /pricing/ 99, /contact/ 98,
  /services/local-visibility/ 100, /work/ 100 (accessibility, best practices and SEO 100 on all). Subagent review:
  4 small gaps fixed (checklist phone format, shared sources in lastmod, empty-sitemap and site-wide TODO checks,
  phone e2e test follows PUBLIC_CONTACT_PHONE). Phase 1 landed as three commits: squashing needs a force-push,
  which is blocked here; "Squash and merge" gives one commit.
- **Phase 2 (14 Nov 2026):** `npm run check:seo` 0 errors, 2 warnings (/privacy/ description 158 characters; /services/
  840 words against the ~600 aim, see the open decision above). `npm run check` 0 errors; `npm test` 78/78;
  `npm run test:e2e` 132/132. Lighthouse 13.6 mobile, local production-like build: / 99, /about/ 99, /services/ 100,
  the three service pages 100, /work/ 100 (accessibility, best practices and SEO 100 on all). Subagent review: 7 gaps,
  fixed (add-on limits shown, full process moved to /about/#process, home FAQPage, forward script hardened and moved
  inside the page, malformed-hash handling, stricter overview check); the word count is left for Mann to decide.

- **Phase 3 (14 Nov 2026):** `npm run check:seo` 0 errors, 2 warnings (the two above; /services/ is now 851 words with
  the "By trade" line), 19 sitemap URLs (+ two industry pages, /guides/ and two guides); the Scarborough page and the
  outlines are absent, unlisted and unlinked. Injected faults (draft built, draft linked, missing breadcrumb, free
  check removed, keyword dropped) all fail the check; a simulated publish of the Scarborough page builds and links it.
  `npm run check` 0 errors; `npm test` 94/94; `npm run test:e2e` 146/146; `npm run build:cloudflare` pre-launch 0
  errors. Lighthouse 13.6 mobile, local production-like build: / 99/100/100/100, both industry pages, /services/,
  /services/web-design/ and /work/ 100/100/100/100. Subagent review: nothing critical; fixed the free-check rule (it
  passed on every page because of the footer link), tests that would fail when Mann publishes, the guide's
  eligibility list, the salon booking-tool answer, the /guides/ copy, drafts in an indexable preview build, the Article
  author and missing lastmod sources.

- **Phase 4 review and guides (14 Nov 2026):** subagent review of Phase 4 (merged as PR #36 before it finished, at
  Mann's request): fixed the AI page saying website fixes were part of the $650 (they are quoted separately), FAQs
  repeated from other pages, the monthly price in structured data, repeat checks implied as included, sitemap sources
  and weak tests. Also fixed the live Business Profile guide's opening-date line (Google: a date up to a year ahead,
  shown 90 days before opening). The three outline guides were written in full (still drafts; claims cited to Google,
  OpenAI, Microsoft and the CRTC); a simulated publish of all three passes seo-check (24 URLs). `npm test` 105/105,
  `npm run test:e2e` 152/152, `npm run check` 0 errors.
- **Phase 4 (14 Nov 2026):** `npm run check:seo` 0 errors, 2 warnings (as before; /services/ 862 words), 21 sitemap URLs.
  `npm run check` 0 errors; `npm test` 100/100; `npm run test:e2e` 152/152. Lighthouse 13.6 mobile, local
  production-like build: / and /pricing/ 99/100/100/100; /services/website-care/, /services/ai-search-optimization/
  and /services/local-visibility/ 100/100/100/100.

---

## Repository map (found in Step 0, 14 Nov 2026)

| What | Where |
| --- | --- |
| Scripts | `package.json`: `build`, `check` (astro check), `test` (vitest), `test:e2e` (Playwright, local server), `qa:lighthouse`, `prelaunch`, `build:cloudflare`, `check:seo` (added in Phase 1). No linter. |
| Sitemap | `astro.config.mjs`: `@astrojs/sitemap`, only when `SITE_INDEXING=true` and `PUBLIC_SITE_URL` are set; `sitemap.xml` is a copy of `sitemap-index.xml`. 14 URLs. |
| Head, title template | `src/layouts/BaseLayout.astro`: `${title} \| Mann Patel` unless `fullTitle` is passed. |
| JSON-LD | `src/lib/seo.ts` (business, Person, WebSite, OfferCatalog, BreadcrumbList); inline Service/FAQPage in `src/pages/services/[slug].astro`, FAQPage in `src/pages/pricing.astro` and `src/pages/services.astro`; ProfilePage in `about.astro` / `vision.astro`. |
| Footer | `src/components/Footer.astro` |
| Contact form + handler | `src/pages/contact/index.astro`, `src/components/ContactForm.astro`, `src/components/CheckForm.astro`; `src/pages/api/enquiry.ts` → `src/lib/enquiry/*` |
| Content collections | `src/content.config.ts`: `work` (`src/content/work/*.md`). Guides collection added in Phase 3. |
| Site data | `src/data/site.ts` (profile, contact, social, GBP, businesses), `src/data/packages.ts` (prices, single source), `src/data/service-pages.ts`, `src/data/services.ts`, `src/data/faqs.ts`, `src/data/captures.ts` (screenshots + alt) |
| Shared free-check CTA | `src/components/home/FreeCheck.astro` (home, /services/); link target `/contact/?package=check-up#check` |
| Entrance animations | `src/styles/global.css` (`[data-reveal]`, `[data-split]`, keyframes `rise-in`, `line-up`, `media-in`, `clip-open`), `src/scripts/motion.ts`; also the footer kinetic wordmark (`fill` transitions) and `src/components/home/AgentGraph.astro` |
| Inline CSS | `astro.config.mjs` `build.inlineStylesheets: 'always'` (45–73 KB of `<style>` per page, measured 14 Nov 2026) |
| E2E tests | `tests/e2e/site.spec.ts` pins titles, H1s, descriptions and schema: update them whenever the copy changes. |

## Decisions (Mann, 14 Nov 2026)

- Business name in schema: **"Mann Patel"** (matches the GBP name).
- Phone: the **full number +1-647-978-6903 everywhere** (plain tap-to-call text in the footer and on /contact/, and `telephone` in schema). Reverses the 9 Nov masking decision.
- Schema address: **city level only** (Scarborough, ON, CA). Never a street address or postal code.
- Search Console and Google Business Profile are **already set up**; the off-site checklist has *check* items for them, not setup steps. GBP URL: `https://maps.app.goo.gl/dYccTa9jQJczpeac6` (in `src/data/site.ts` → `gbp`; in business `sameAs` now).
- Facebook Page URL: **TODO(Mann)** (`src/data/site.ts` → `social` facebook `url: null`); it joins `sameAs` once set.
- New URLs are **flat**: `/web-design-scarborough/`, `/websites-for-cleaning-companies/`, `/websites-for-salons-and-spas/`, `/guides/`, `/guides/<slug>/`.
- Scarborough page: built in Phase 3 with the GBP link, but stays an **unpublished draft until Mann supplies the neighbourhoods**.
- Schema type **ProfessionalService** as requested. Note: schema.org marks the general type as deprecated; Google still accepts it as a LocalBusiness subtype. The old e2e assertion that forbade it was updated.
- Lighthouse runs via a temporary `npm i --no-save lighthouse` (never added to package.json).

---

## RULES (every phase)

- Never invent reviews, testimonials, quotes, client results, stats or neighbourhoods. Use `TODO(Mann): …` and make unfilled sections not render or publish. Never buy or swap reviews.
- No Review/AggregateRating schema for my own business. Never publish a street address (service-area business). Phone +1-647-978-6903, email info@mannpatel.me.
- Nest & Rest Cleaning is my own business: keep its case study framing honest.
- Speed and published prices are my edge: don't change prices (CAD $1,950 / $3,350 / $450–$850 / $650 / $149/month), existing URLs, robots.txt, canonical host/trailing slashes, lang="en-CA" or the visual design. Canadian spelling.
- No new dependencies, pushes or deploys without asking. Branch `seo-audit-2026-11`, one commit per phase.
- Follow existing patterns. Every new page: title ≤60 chars, description ≤155, one H1, BreadcrumbList, linked in and out (no orphans), ends with the free check CTA. Use keywords naturally; no stuffing.

## VERIFY (every phase)

Write scripts/seo-check.mjs (Node built-ins only) that scans the build output and checks: one H1 per page; unique titles; titles ≤60 and descriptions ≤155 (warn); the exact copy above (error); JSON-LD parses; ProfessionalService with telephone present; no worksFor "Nest & Rest"; sitemap has lastmod; no heading tags in footer labels or contact form states; no "TODO" in published pages. Run the build, astro check/lint if present, and the script. Iterate until they pass and show me the output. If Lighthouse is available, run it on the preview and compare to 98/100/100/100.
When a phase is done, use a subagent to review the diff against PLAN.md and the audit. Report only gaps affecting correctness or the requirements, not style. Then stop and wait for me.

### How to run it (exact commands)

```bash
# 1. Production-like build (same HTML as Cloudflare; sitemap and absolute URLs on)
PUBLIC_SITE_URL=https://mannpatel.me SITE_INDEXING=true SITE_MODE=production npx astro build
# 2. SEO check on dist/client (errors exit 1, warnings print)
npm run check:seo
# 3. Types and unit tests
npm run check && npm test
# 4. Preview build (noindex) for the e2e suite: local server, ENQUIRY_DELIVERY=file, no real submissions
npx astro build && npm run test:e2e
# 5. Lighthouse on the preview server (temporary install, nothing committed)
npm i --no-save lighthouse chrome-launcher && node scripts/lighthouse.mjs http://127.0.0.1:4321 / /pricing/ /contact/
```

`seo-check.mjs` also checks, beyond the list above: no `streetAddress`/`postalCode` in JSON-LD; no `Review` or
`AggregateRating`; every sitemap URL is linked from at least one other built page (no orphans); pages listed as new
have a BreadcrumbList and a link to the free check; "web design toronto" / "seo company toronto" not in a title or H1
(warn); draft pages absent from `dist/` and the sitemap; the contact form state strings are absent from the initial
HTML outside `<template>`; capture images never have empty alt text.

---

## Plan: one row per audit item

### A. Quick wins

| # | Audit item | Phase | Files | Change | Verify |
| --- | --- | --- | --- | --- | --- |
| A1 | Search Console: verify, submit sitemap, request indexing (/, 3 service pages, /pricing/, /about/) | Checklist | `OFFSITE-CHECKLIST.md` | Check items (already set up): property verified, sitemap from robots.txt submitted, indexing requested for the 6 URLs, Pages report reviewed | Mann ticks |
| A2 | Bing Webmaster Tools | Checklist | same | Import from Search Console | Mann ticks |
| A3 | Finish GBP | Checklist | same | Check items: service-area, home address hidden, primary category "Website designer", areas Scarborough/North York/Toronto, services with prices, photos, link to mannpatel.me | Mann ticks |
| A4 | "Website by Mann Patel" credit link on nestnrestcleaning.com; Samp at launch | Checklist | same | That site is not in this repo | Mann ticks |
| A5 | Business entity in schema | **P1** | `src/lib/seo.ts`, `src/data/site.ts`, `src/lib/contact.ts`, `src/pages/index.astro`, `src/pages/contact/index.astro`, `src/pages/services/[slug].astro`, `src/lib/seo.ts` OfferCatalog | ProfessionalService `/#business`: name, url, telephone, email, city-level address, areaServed Scarborough/North York/Toronto, priceRange from `packages.ts`, founder → `/#person`, sameAs [GBP, Facebook when set]. Full node on / and /contact/; elsewhere referenced by `@id` (Service and Offer providers). Person: no `worksFor`; described as a Toronto web designer | seo-check |
| A6 | Shorten home and /pricing/ descriptions | **P1** | `index.astro`, `pricing.astro` | Exact copy (147, 146) | seo-check exact copy |
| A7 | Toronto in home H1 and on /pricing/ | **P1** | `src/components/home/Hero.astro`, `pricing.astro` | H1 "Websites and local SEO for Toronto small businesses."; /pricing/ title exact; lead mentions Toronto and the GTA | seo-check, screenshots 390/1440 |
| A8 | Sitemap lastmod | **P1** | `astro.config.mjs`, `scripts/lastmod.mjs` | `serialize()` sets lastmod from the latest git commit of each route's source files; build date if git is unavailable | seo-check |

### B. Strategic investments

| # | Audit item | Phase | Files | Change | Verify |
| --- | --- | --- | --- | --- | --- |
| B1 | Slim /services/ (6,641 → ~600 words) | P2 | `services.astro`, `data/services.ts`, `data/faqs.ts`, `data/service-pages.ts`, `lib/seo.ts`, inbound links | **First** list the content unique to /services/ and where it moves (per-service scope → its service page; package compare → /pricing/ only; add-ons + sprint → short block; Finder/Process/FAQ kept or moved). Then cut to an overview routing to the 3 service pages + /pricing/. Old `#anchors` still land (kept sections or a small hash-forward script, e.g. `/services/#booking` → `/services/enquiry-follow-up/#booking`); internal links updated directly. FAQPage = visible FAQs | word count, FAQ schema = visible, e2e anchors |
| B2 | Scarborough page | P3 (draft) | `src/pages/web-design-[area].astro`, `src/data/areas.ts` | Samp Hair & Spa (Scarborough client, in progress), Nest & Rest (own business), GBP link, FAQ, "Based in Scarborough". Neighbourhoods `TODO(Mann)` → `draft: true`, not built or in sitemap until supplied | draft preview; absent from prod build |
| B3 | Industry pages: cleaning, salons/spas | P3 | `src/pages/websites-for-cleaning-companies.astro`, `src/pages/websites-for-salons-and-spas.astro`, `src/data/industry-pages.ts`, `src/components/IndustryPage.astro` | Lead with the case study (Nest & Rest honestly framed as Mann's own business opening summer 2027; Samp as an in-progress client preview), then the package: cleaning → Website Launch $1,950 (+ Local Visibility Setup $650); salons → Website + Enquiry System $3,350 for online booking, Website Launch as the lighter option | new-page rules |
| B4 | /guides/ section | P3 | `src/content.config.ts` (`guides`), `src/content/guides/*.md`, `src/pages/guides/[...index].astro`, `src/pages/guides/[slug].astro`, `src/layouts/GuideLayout.astro`, `src/lib/published.ts` | Article schema (author `/#person`, datePublished/dateModified); `draft` flag filtered out of production builds and the sitemap (drafts render in previews and `astro dev`, marked as drafts); /guides/ index built only when ≥1 guide is published. One every two weeks (Mann flips `draft: false`) | no drafts in dist |
| B5 | Review routine | P2 + checklist | `src/data/reviews.ts` (empty), `src/components/ReviewsStrip.astro`, home + service pages | Renders nothing until real reviews exist; never Review/AggregateRating schema | seo-check |
| B6 | 6–8 directories | Checklist | | Bing Places, Apple Business Connect, Yelp, Clutch, DesignRush, GoodFirms, Digital Main Street vendor list | |
| B7 | Monthly AI answer check | Checklist | | Log table (date, tool, question, appeared Y/N) | |

### C. Keywords

| # | Keyword | Phase | Where / how |
| --- | --- | --- | --- |
| C1 | web design scarborough | P3 | Scarborough page title/H1 |
| C2 | web designer scarborough ontario | P3 | Scarborough page body + FAQ |
| C3 | cleaning company website design toronto | P3 | Cleaning page title/H1 |
| C4 | salon website design toronto | P3 | Salon page title/H1 |
| C5 | how much does a website cost in toronto | P3 | Cost guide → /pricing/ |
| C6 | freelance web designer toronto | P2 | /services/web-design/ + /about/, naturally |
| C7 | google business profile setup toronto | P2 | /services/local-visibility/ body |
| C8 | google business profile without a storefront address | P3 | GBP guide |
| C9 | how to get my business recommended by chatgpt | P3 | Outline guide (+ AI Overviews) |
| C10 | mann patel web designer toronto | P1 + P2 + checklist | Person/business schema (P1), homepage copy (P2), name pairing on GBP/LinkedIn/Facebook (checklist) |
| C11 | why is my business not showing on google maps | P3 | Checklist guide outline → free check |
| C12 | missed call text back for small business | P2 + P3 | /services/enquiry-follow-up/ + guide outline |
| C13 | online booking setup for salons | P2 + P3 | Enquiry page + salon page |
| C14 | website redesign toronto | P2 | New redesign section on /services/web-design/ |
| C15 | ai search optimization toronto | P4 (ask) | Grow #ai-search into its own page |
| C16 | website maintenance toronto small business | P4 (ask) | Website Care page |
| C17 | web designer north york | Checklist (later) | Area page only once there is real proof there |
| C18 | small business web design toronto | P2 | /services/web-design/ |
| C19 | affordable web design toronto | P2 | /pricing/ |
| C20 | local seo for small business toronto | P2 | /services/local-visibility/ |
| C21 | web design toronto | Guard | Not targeted head-on; seo-check warns if in a title or H1 |
| C22 | seo company toronto | Guard | Same |

### D. On-page issues

| # | Issue | Phase | Files | Change |
| --- | --- | --- | --- | --- |
| D1 | /services/ duplication | P2 | = B1 | |
| D2 | No reviews or testimonials | P2 + checklist | = B5 | |
| D3 | No business entity, no phone in schema, worksFor Nest & Rest | **P1** | = A5 | |
| D4 | Service pages mention Scarborough 0–1× | P2 | `service-pages.ts`, `services/[slug].astro` | "Based in Scarborough, working across Toronto and the GTA" + Samp Hair & Spa as Scarborough proof; link to the Scarborough page once published |
| D5 | Home H1 | **P1** | = A7 | |
| D6 | Home meta description 172 | **P1** | = A6 | |
| D7 | /pricing/ meta 213, no Toronto, title 68 | **P1** | `pricing.astro` | Title 54, description 146, Toronto/GTA in the lead |
| D8 | local-visibility (65) and vision (68) titles | **P1** | `service-pages.ts`, `vision.astro` | Exact titles (56, 44) |
| D9 | /work/ thin (166 words) | P2 | `content.config.ts`, `content/work/*.md`, `work/index.astro` | Industry, location and one result line from each case study only (e.g. "No customer results yet: bookings open summer 2027"; "No results yet: the site hasn't launched") |
| D10 | 6 empty-alt phone screenshots | **P1** | `components/work/ProjectMedia.astro`, `data/captures.ts` | Same page at phone width, but "works on a phone" is not in the desktop alt, so each gets a short alt ("… home page on a phone") |
| D11 | /contact/ form states are headings | **P1** | `ContactForm.astro`, `CheckForm.astro` | Non-heading text in `<template>`s, inserted into aria-live regions only after submit; error summary keeps `role="alert"` and focus |
| D12 | Footer labels are H2 | **P1** | `Footer.astro` | `<p class="ftr__h">`, same look |
| — | (Mann's P1 item 7) phone visible + "Based in Scarborough, working across Toronto and the GTA" | **P1** | `site.ts`, `lib/contact.ts`, `Footer.astro`, `contact/index.astro`, `ContactActions.astro` | Full number as a tap-to-call link in footer and /contact/ |

### E. Content gaps

| # | Topic | Phase | Change |
| --- | --- | --- | --- |
| E1 | Web design in Scarborough | P3 | = B2 |
| E2 | Websites for cleaning companies | P3 | = B3 |
| E3 | Salon and spa websites | P3 | = B3 |
| E4 | Reviews and testimonials | P2 + checklist | = B5 |
| E5 | How much does a website cost in Toronto? | P3 | Full draft, only published prices |
| E6 | GBP for home-based businesses | P3 | Full draft, from the local SEO FAQ |
| E7 | Mentioned by ChatGPT and AI Overviews | P3 | Outline draft |
| E8 | Missed-call text-back for salons and cleaners | P3 | Outline draft → $3,350 package |
| E9 | Why isn't my business on Google Maps? | P3 | Outline draft → free check |
| E10 | Website Care page | P4 (ask) | |
| E11 | Guide cluster linking; every new page ends with the free check | P3 | seo-check link checks |

### F. Technical checks that did not pass

| # | Check | Phase | Change |
| --- | --- | --- | --- |
| F1 | Indexation (Fail) | Checklist | Search Console Pages report check |
| F2 | XML sitemap: no lastmod | **P1** | = A8 |
| F3 | Speed Index 3.8 s, 63 non-composited animations | P4 (ask) | transform/opacity only (global.css keyframes, footer wordmark `fill`, AgentGraph, `clip-path`), respect prefers-reduced-motion |
| F4 | Structured data: no ProfessionalService/telephone | **P1** | = A5 |
| F5 | HTML weight: ~87 KB inline CSS | P4 (ask) | Cached stylesheet only if Lighthouse performance holds |
| F6 | Real-user speed data | Checklist | Appears once traffic grows |
| F7 | Security headers CSP/HSTS/COOP (noted under a Pass) | P4 optional (ask) | `public/_headers` / Cloudflare; no ranking effect |

### G. Competitor takeaways

| # | Takeaway | Action |
| --- | --- | --- |
| G1 | Starting price (Igloo wins) | No change: prices fixed by the rules; transparency is the edge |
| G2 | Pages aimed at searches (The Ant Firm) | P3 industry + Scarborough pages |
| G3 | Content depth (you) | Keep: service pages keep their depth; only /services/ is cut |
| G4 | Publishing (The Ant Firm) | P3 /guides/ |
| G5 | Reviews (The Ant Firm) | P2 strip + checklist routine |
| G6 | Links and listings (The Ant Firm) | Checklist: directories + credit links |
| G7 | Mobile performance (you) | Lighthouse every phase; P4 speed work |
| G8 | Structured data (you) | P1 |
| G9 | Local signals (Ant Firm street address) | P1 phone + "Based in Scarborough" + city-level address; P3 Scarborough page; never a street address |
| G10 | SERP features (tie) | P1 schema + checklist Rich Results Test |
| G11 | Shared-name risk (executive summary) | P1 schema description + checklist name pairing |
| G12 | Estimated keyword data (method) | Checklist: replace with Search Console queries after a few weeks |

---

## Phase specs (from Mann's brief, 14 Nov 2026; GBP is live)

### PHASE 1: QUICK WINS + CHECKLIST (done)

1. Schema: one ProfessionalService (@id, name "Mann Patel", url, telephone, email, areaServed Scarborough/North York/Toronto, priceRange from published prices, founder → Person @id, sameAs Facebook Page [TODO(Mann): URL], GBP URL). Person: remove worksFor "Nest & Rest Cleaning" (no replacement); describe him as a Toronto web designer.
2. Exact copy (the rendered `<title>` must match; watch the title template):
   - / meta: "Websites, local SEO and Google Business Profile setup for Toronto small businesses. Published prices: websites from $1,950 CAD. Free website check." (147)
   - / H1: "Websites and local SEO for Toronto small businesses."
   - /pricing/ meta: "Published prices in CAD: 5-page website $1,950, website + booking $3,350, fixes $450–$850, local SEO setup $650, care $149/month. Toronto and GTA." (146)
   - /pricing/ title: "Web Design & Local SEO Pricing in Toronto | Mann Patel" (54). Also mention Toronto/GTA in its body.
   - /services/local-visibility/ title: "Local SEO & Google Business Profile Toronto | Mann Patel" (56)
   - /vision/ title: "Vision | Mann Patel, Web Designer in Toronto" (44)
3. Sitemap lastmod via the Astro sitemap integration.
4. Footer labels (Pages, Services, Contact, Elsewhere): H2 → styled non-heading text, same look.
5. /contact/ form states ("Thanks, . Your brief is on its way.", "Please check these fields"): not headings; render only after submit, in an aria-live region. No real submissions while testing.
6. Six empty-alt mobile screenshots (/, /work/, case studies): keep alt="" only if they duplicate the adjacent desktop shot; otherwise describe them.
7. Footer/contact: phone visible plus "Based in Scarborough, working across Toronto and the GTA".
8. `docs/seo/OFFSITE-CHECKLIST.md` (outside src/ and public/), checkboxes. Search Console and GBP are check items.

### PHASE 2: FIX EXISTING PAGES (done)

#### /services/ inventory: what was on the page and where it went (14 Nov 2026)

Before: 6,653 words; 72% of /pricing/ and 43% of /services/web-design/ repeated on it (8-word shingles of the main
content, matching the audit). After: 840 words (seo-check count); 2% and 0%. `seo-check.mjs` fails if any service
page or /pricing/ is more than 20% repeated on /services/, if the page has no main content or passes 1,000 words, and
warns above 650. **Open decision for Mann:** the page is ~240 words over the ~600 target because the add-ons (print,
social, sprint) have no other page and must state their limits, plus the shared free check (147) and finder (123).
Reaching ~600 means an add-ons page of their own, or moving the finder off /services/.

| Content on the old /services/ | Words | Where it is now |
| --- | --- | --- |
| Five package cards and the side-by-side comparison | 1,914 | /pricing/ only (already there in full). /services/#packages keeps one line of prices and a link to /pricing/. |
| A · Get found: Business Profile, reviews, listings, monthly "Stay found" plan (deliverables, what I need, not included, handover, terms) | 939 | /services/local-visibility/ → "Service by service" (#business-profile, #reviews, #listings, #local-plan), `src/components/ServiceDetails.astro` |
| B · Answer fast: missed calls, enquiry workflows, booking, integrations | 921 | /services/enquiry-follow-up/ → "Service by service" (#missed-calls, #enquiry-workflows, #booking, #integrations) |
| C · Get booked: websites, search basics, maintenance | 732 | /services/web-design/ → "Service by service" (#websites, #seo, #maintenance) |
| + Add-ons: print, social content, Brand & Content Sprint | 642 | Stays on /services/ (#extras, #print-design, #social-content, #brand-content): each add-on's one-line summary and its full "Not included" list, the sprint's full included / quoted-separately lists. Not shown any more (kept in `src/data/services.ts` for a later add-ons page): the print and social "Sounds familiar?", deliverable lists, "What I need", handover and term notes. |
| "On this page" jump bar | 18 | Removed (short page) |
| Free website and Google check | 147 | Stays (#check) |
| Finder (three questions) | 123 | Stays (#finder); its service links now go to each service's new home |
| Process (five steps, what you do and what I do) | 195 | /about/#process (the same `Process.astro`); the home page keeps its short version (#how-i-work, "my" half only); /services/#process forwards to /about/#process |
| FAQ (15 questions) | 850 | Home keeps its five (`faqs` in `src/data/faqs.ts`). /services/ keeps "Where do you work?" (now "based in Scarborough"). Moved: "Can you get us more reviews?" → local visibility; "What do you need from me?" → web design; "Do you use AI tools?" → enquiry follow-up; "Do you make flyers…?" → the add-ons text. Not repeated (already answered on the page named): cost, "$1,950", payments, ownership (/pricing/); top of Google (local visibility); how long (web design); after launch (web design handover, /pricing/ Care); free check (#check, /pricing/); GEO/AEO (home, local visibility #ai-search). |

Old anchors: the sections that stayed keep their ids; every other old `/services/#…` address forwards (inline script
on /services/, on arrival and on hash change; own keys only, malformed addresses ignored) to the page that holds it, e.g. `/services/#booking` →
`/services/enquiry-follow-up/#booking`, which opens that service. Internal links, the Finder, the case studies'
"Services shown" links and the structured-data URLs point at the new homes directly (`serviceHref()` in
`src/data/service-pages.ts`).

#### Other Phase 2 changes

- Home page: FAQPage structured data for its five visible questions (they were marked up only on the old /services/).
- Reviews strip: `src/data/reviews.ts` (empty) → `src/components/ReviewsStrip.astro` on the home page (after the work)
  and every service page (before the package); renders nothing until a real review is added; no review schema.
- Service pages: "Based in Scarborough, working across Toronto and the GTA" plus local proof (Samp Hair & Spa, a
  Scarborough salon, website in progress; Nest & Rest, Mann's own business in Scarborough and North York), under the
  price line in the page head.
- /work/: industry, location and one result line per project (new optional `industry`, `location`, `result` fields
  in `src/content.config.ts`), worded only from each case study.
- /services/web-design/: "Website redesign in Toronto" section (#redesign, built on the Website Launch package),
  "freelance web designer in Toronto"; /about/ lead: "I’m a freelance web designer in Toronto, based in Scarborough…
  owner-run small businesses".
- Keyword fit: local visibility lead ("Local SEO for small businesses in Toronto… Google Business Profile setup");
  enquiry follow-up lead ("For small businesses that miss calls…", missed-call text-back) and a salon/online booking
  line in "A good fit if…"; /pricing/ example ("affordable web design in Toronto"); home hero role line ("Web designer
  in Toronto · local SEO and AI automation", next to "Hi, I’m Mann Patel."). No head-on "web design toronto" or
  "seo company toronto".

#### Brief (Mann, 14 Nov 2026)

- /services/: cut 6,641 words to ~600 that route to each service page and /pricing/; package detail stays on /pricing/ only. Before cutting, list content unique to /services/ and where it moves. Keep FAQPage schema matching the visible FAQs.
- Reviews strip component for home + service pages, fed by an empty data file; renders nothing until real reviews exist.
- Service pages: add "Based in Scarborough, working across Toronto and the GTA" plus local proof (Samp Hair & Spa is in Scarborough).
- /work/: under each project add industry, location and one result line (from the case studies only, else TODO).
- /services/web-design/: add a website redesign section ("website redesign toronto"); work in "freelance web designer toronto" and "small business web design toronto" naturally (also /about/).
- Keyword fit on existing pages: /services/local-visibility/ ("google business profile setup toronto", "local seo for small business toronto"); /services/enquiry-follow-up/ ("missed call text back for small business", "online booking setup for salons"); /pricing/ ("affordable web design toronto"); homepage ("mann patel web designer toronto"). Don't target "web design toronto" or "seo company toronto" head-on.

### PHASE 3: NEW PAGES

- Industry pages: cleaning companies (leads with the Nest & Rest case study) and salons/spas (leads with Samp Hair & Spa, plus online booking), each followed by the package that fits. Targets: "cleaning company website design toronto", "salon website design toronto". URLs `/websites-for-cleaning-companies/`, `/websites-for-salons-and-spas/`.
- Scarborough page (`/web-design-scarborough/`; "web design scarborough", "web designer scarborough ontario"): real local proof, neighbourhoods served [TODO(Mann)], GBP link (`gbp` in `src/data/site.ts`), FAQ. Unpublished draft until Mann supplies neighbourhoods.
- /guides/: index + layout (Article schema, author = Person, dates, draft flag excluded from build and sitemap). Fully draft the cost guide ("how much does a website cost in Toronto", built only on the published prices) and the home-based GBP guide ("google business profile without a storefront address"). They link to each other, to the matching service page and to /pricing/. Outline-only drafts: "how to get my business recommended by ChatGPT" (and AI Overviews); missed-call text-back for salons and cleaners (leads to the $3,350 package); "Why isn't my business on Google Maps?" checklist → free check. Mann publishes one every two weeks.
- Link the new pages in and out: web-design service page, the matching case study, /services/, /work/, footer or "Based in Scarborough" line as appropriate.

#### What was built (14 Nov 2026)

| Page | Status | Leads with / links |
| --- | --- | --- |
| `/websites-for-cleaning-companies/` ("Cleaning Company Website Design in Toronto") | Live with the next deploy | Nest & Rest case study (own business, website live, opens summer 2027, no results claimed) → Website Launch $1,950 + Local Visibility Setup $650 → 5 FAQs → related → free check |
| `/websites-for-salons-and-spas/` ("Salon & Spa Website Design in Toronto") | Live with the next deploy | Samp Hair & Spa (client, in progress, accessibility findings open) → Website + Enquiry System $3,350, Website Launch $1,950 as the lighter option → 5 FAQs → related → free check |
| `/web-design-scarborough/` ("Web Design in Scarborough, Ontario") | **Draft** until Mann lists neighbourhoods in `src/data/areas.ts` | Local work (Samp, Nest & Rest), GBP link, neighbourhoods [TODO(Mann)], services and prices, 4 FAQs ("Scarborough, Ontario, or Scarborough in England?"), full business node, free check |
| `/guides/` + 5 guides | Cost guide and Business Profile guide **published 14 Nov 2026** (Mann: "make everything live"); the other three written in full and published the same day (Mann: "make everything live") | Cost guide and Business Profile guide in full; ChatGPT/AI Overviews, missed-call text-back and Google Maps checklist as outlines (can't be published while `outline: true`) |

Links in and out: the web design service page links both industry pages, enquiry follow-up links the salon page, local
visibility links the cleaning page ("More services"); /services/ and /work/ have a "By trade" line; each case study
links its industry page ("For your trade"). Once public: the "Based in Scarborough" lines (footer, service and
industry pages) link the Scarborough page; service pages and /pricing/ link their guides; the footer links /guides/.
Guide-to-guide links come only from `related` in the front matter and appear only when both guides are public.

Decisions made while building (Phase 3):
- Drafts render in **preview builds and `astro dev`** (not dev only), with a visible "Draft" or "Outline" note, so they
  can be reviewed on a preview; production builds never build, list or link them (`src/lib/published.ts`; checked by
  `seo-check.mjs`). This follows the repo's preview/production convention (`<Confirm>`, `<PreviewNote>`).
- The Scarborough page is a draft while `neighbourhoods` is null or empty: one switch, no separate `draft` flag.
- File names: `src/pages/web-design-[area].astro` and `src/pages/guides/[...index].astro`, because a fixed `.astro`
  page is always built; a dynamic route can leave a draft out.
- Guide dates accept `published: 2026-11-28` with or without quotes (YAML reads the unquoted form as a date).

### PHASE 4: LATER (ask before each)

Mann's choice (14 Nov 2026): the two pages below. Not chosen for now: the animation and inline-CSS speed work (lab
scores are already 99–100 on mobile) and the security headers.

| Page | Package | Notes |
| --- | --- | --- |
| `/services/website-care/` ("Small Business Website Maintenance in Toronto") | Website Care, $149 a month | Monthly cycle, a labelled sample care note, limits from the package and the `maintenance` service, 5 FAQs. The care package's "How it works" links now point here (`page` in `src/data/packages.ts`). |
| `/services/ai-search-optimization/` ("AI Search Optimization (AEO & GEO) in Toronto") | Local Visibility Setup, $650 (no new price: the check is part of it) | Same questions to ChatGPT, Gemini and Perplexity on a dated sheet, then the public facts fixed; website fixes quoted separately, as on the local SEO page. A labelled sample sheet, 4 FAQs, Google sources. The local SEO page's #ai-search section links here. |

Both are `moreServicePages` in `src/data/service-pages.ts`, rendered by the service page template: not in the three-service
lists, the menu or the finder, no "Service by service" details (no repeated content), and they end with the free check.
/services/ links them on an "Also:" line.

- Grow #ai-search into its own page ("ai search optimization toronto").
- Website Care page ($149/month; "website maintenance toronto small business").
- Speed Index 3.8 s: fix the 63 non-composited entrance animations (transform/opacity only, respect prefers-reduced-motion).
- Move the ~87 KB repeated inline CSS to a cached stylesheet, only if Lighthouse performance holds.
- Security headers (CSP, HSTS, COOP): optional, no ranking effect, host-dependent.
