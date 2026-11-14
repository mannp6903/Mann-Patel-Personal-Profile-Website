# SEO audit implementation plan (approved 14 Nov 2026)

Source of truth: [`docs/seo/audit-2026-11-14.md`](audit-2026-11-14.md) (transcribed from the PDF). Every audit item below
ends up **done in code**, **scheduled in a later phase**, or on the **off-site checklist**
([`docs/seo/OFFSITE-CHECKLIST.md`](OFFSITE-CHECKLIST.md)). Nothing is dropped.

Branch: `seo-audit-2026-11`, one commit per phase, pushed to `origin seo-audit-2026-11` after each phase passes
verification (Mann's approval, 14 Nov 2026). No PR, no deploy. Stop after each phase and wait for Mann.

Status: Phase 1 done · Phase 2 next · Phase 3 · Phase 4 (ask before each item).

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
| B2 | Scarborough page | P3 (draft) | `src/pages/web-design-scarborough.astro`, `src/data/areas.ts` | Samp Hair & Spa (Scarborough client, in progress), Nest & Rest (own business), GBP link, FAQ, "Based in Scarborough". Neighbourhoods `TODO(Mann)` → `draft: true`, not built or in sitemap until supplied | draft preview; absent from prod build |
| B3 | Industry pages: cleaning, salons/spas | P3 | `src/pages/websites-for-cleaning-companies.astro`, `src/pages/websites-for-salons-and-spas.astro`, `src/data/industry-pages.ts` | Lead with the case study (Nest & Rest honestly framed as Mann's own business opening summer 2027; Samp as an in-progress client preview), then the package: cleaning → Website Launch $1,950 (+ Local Visibility Setup $650); salons → Website + Enquiry System $3,350 for online booking, Website Launch as the lighter option | new-page rules |
| B4 | /guides/ section | P3 | `src/content.config.ts` (`guides`), `src/content/guides/*.md`, `src/pages/guides/index.astro`, `src/pages/guides/[slug].astro`, `src/layouts/GuideLayout.astro` | Article schema (author `/#person`, datePublished/dateModified); `draft` flag filtered out of build and sitemap (drafts render in `astro dev` only); /guides/ index built only when ≥1 guide is published. One every two weeks (Mann flips `draft: false`) | no drafts in dist |
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

### PHASE 2: FIX EXISTING PAGES

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

### PHASE 4: LATER (ask before each)

- Grow #ai-search into its own page ("ai search optimization toronto").
- Website Care page ($149/month; "website maintenance toronto small business").
- Speed Index 3.8 s: fix the 63 non-composited entrance animations (transform/opacity only, respect prefers-reduced-motion).
- Move the ~87 KB repeated inline CSS to a cached stylesheet, only if Lighthouse performance holds.
- Security headers (CSP, HSTS, COOP): optional, no ranking effect, host-dependent.
