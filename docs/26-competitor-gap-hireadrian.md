# Closing the SEO gaps vs hireadrian.com (16 Nov 2026)

Source: Mann's competitor audit of 15–16 Nov 2026 (mannpatel.me vs hireadrian.com) and his brief of 16 Nov 2026.
Rules and verification: [`docs/seo/PLAN.md`](seo/PLAN.md) (Decisions, RULES, VERIFY) win over this file if they conflict.

Branch: `competitor-gap-2026-11`, one local commit per phase. No push, deploy or IndexNow ping without asking.

**Status (16 Nov 2026):** Mann asked to start before sending the owner inputs ("I will provide inputs later"). Every
input below is still a placeholder, so each feature that needs one is built but **hidden**, and the four new area pages
are **drafts**. The Phase 0 questions are at the end of this file. Nothing here is invented: missing facts are
`TODO(Mann)` in the source and never reach a published page.

## Owner inputs

| Input | Value | Where it goes | Until supplied |
| --- | --- | --- | --- |
| YouTube channel URL | not provided | `src/data/site.ts` → `youtubeUrl` (footer and About buttons, Person and business `sameAs`, About "Find me elsewhere") | `null`, hidden |
| Booking link (free 15-minute call) | not provided | `src/data/site.ts` → `bookingUrl` ("Book a free 15-minute call" on /contact/, /pricing/, area pages) | `null`, hidden |
| Google review link | not provided | `src/data/site.ts` → `gbp.reviewUrl` (footer "Clients: leave a Google review") | `null`, hidden |
| Facebook Page URL | not provided | `src/data/site.ts` → `social` facebook (buttons, business `sameAs`, About) | `null`, hidden |

## Keyword map (page → primary → secondary)

| Page | Primary | Secondary |
| --- | --- | --- |
| `/` | web design scarborough | local seo toronto small business |
| `/web-design-scarborough/` | web design scarborough | web designer scarborough |
| `/web-design-markham/` (draft) | web design markham | |
| `/web-design-pickering/` (draft) | web design pickering | |
| `/web-design-east-york/` (draft) | web design east york | |
| `/web-design-ajax/` (draft) | web design ajax | |
| `/services/website-redesign/` | website redesign toronto | |
| `/services/landing-page-design/` | landing page design toronto | only if Mann approves (Phase 0, b) |
| `/guides/how-to-get-more-google-reviews/` | how to get more google reviews | |
| `/guides/how-to-optimize-google-business-profile/` | how to optimize google business profile | google business profile toronto |
| `/guides/website-redesign-cost-toronto/` | website redesign cost toronto | |

"web design toronto" and "seo company toronto" stay out of every title and H1 (`seo-check.mjs` warns).

## Plan: one row per item

### Phase 1: fix existing pages (one commit)

| # | File(s) | Change | Keyword |
| --- | --- | --- | --- |
| 1.1 | `src/pages/index.astro`, `src/lib/og.ts`, `scripts/seo-check.mjs` | Home `<title>`: "Web Design & Local SEO in Scarborough, Toronto \| Mann Patel" (keyword first). `ogCardTitle()` already strips the " \| Mann Patel" part, so the card reads "Web Design & Local SEO in Scarborough, Toronto" | web design scarborough |
| 1.2 | `src/components/home/SelectedWork.astro`, `ServiceSummary.astro`, `PricingTeaser.astro`, `HowIWork.astro`, `src/components/Faq.astro` | H2 text: "Website projects in Scarborough", "Web design, local SEO and booking services", "Website prices in Toronto (CAD)", "How a website project works", "Web design questions". Same classes, sizes and two-tone accent; each slogan moves to the section's eyebrow ("01 / Work in the wild"). Ids and anchors unchanged | web design scarborough, local seo toronto small business |
| 1.3 | `src/components/Faq.astro` and every FAQ accordion (`services/[slug].astro`, `web-design-[area].astro`, `pricing.astro`, `services.astro`, `IndustryPage.astro`), `src/styles/global.css` | Each question is an `<h3 class="acc__q">` inside its `<summary>`; `.acc__q` inherits the summary's type, so nothing moves | question searches |
| 1.4 | `public/llms.txt`, `scripts/seo-check.mjs` | Every URL a Markdown link with a short description; new rule: a bare `https://` outside `[text](url)` fails the check | Lighthouse Agentic Browsing |
| 1.5 | `src/data/site.ts`, `src/components/ui/Icon.astro` | `youtubeUrl` (in `social` and `businessProfiles.youtube`), Facebook, `bookingUrl`, `gbp.reviewUrl` slots, all `null` until supplied; a YouTube icon for when the link is set | entity (sameAs) |
| 1.6 | `src/pages/contact/index.astro`, `src/pages/pricing.astro`, `src/pages/web-design-[area].astro` | "Book a free 15-minute call" (Button, new tab, plain link) beside the existing CTA, only while `bookingUrl` is set | |
| 1.7 | `src/pages/pricing.astro`, `src/pages/web-design-[area].astro`, `src/components/Footer.astro` | `ReviewsStrip` on /pricing/ and the area pages too (already on / and service pages; renders nothing while `reviews` is empty). Footer "Clients: leave a Google review" only while `gbp.reviewUrl` is set | |
| 1.8 | `src/pages/about.astro` | "Find me elsewhere": a list of the profiles that are set (Google Business Profile, LinkedIn, GitHub; YouTube and Facebook once set) | entity (name pairing) |
| 1.9 | `docs/seo/OFFSITE-CHECKLIST.md` | Dated items: request indexing (6 URLs), 5 client reviews, complete the Business Profile, 6 listings, credit links, YouTube About link, first 10 referring domains | off-site |

### Phase 2: new pages (one commit)

| # | File(s) | Change | Keyword |
| --- | --- | --- | --- |
| 2.1 | `src/data/areas.ts`, `src/pages/web-design-[area].astro` | Markham, Pickering, East York, Ajax with `neighbourhoods: null` (drafts: not built in production, not in the sitemap, not linked). The "Local work" section shows only when there is local work or a `localExample`, so a published page never shows an empty list | web design markham / pickering / east york / ajax |
| 2.2 | `src/data/service-pages.ts` (`moreServicePages`), `src/content.config.ts` | `/services/website-redesign/` "Website Redesign in Toronto", priced from Website Launch ($1,950) and Website Fix ($450–$850) through `packages.ts`; no new number | website redesign toronto |
| 2.3 | `src/pages/services.astro`, `src/pages/pricing.astro`, `src/data/service-pages.ts` | Linked from the "Also:" line on /services/, from /pricing/ and from the redesign section on /services/web-design/ | website redesign toronto |
| 2.4 | `src/pages/pricing.astro` | "Which package fits?": redesign → Website Launch, fix → Website Fix (landing page only if approved). FAQ H2 becomes "What’s included in the price?" | affordable web design toronto |
| 2.5 | — | Landing page design page and a larger-site tier: **not built** (not approved; no price is set here) | landing page design toronto |
| 2.6 | `scripts/seo-check.mjs`, `public/llms.txt`, tests | New page in `NEW_PAGES`/`KEYWORDS`, in llms.txt, e2e expectations | |

### Phase 3: guides (one commit)

| # | File | Change | Keyword |
| --- | --- | --- | --- |
| 3.1 | `src/content/guides/how-to-get-more-google-reviews.md` | Answer first; Google's rules cited to Google's help pages only; links /services/local-visibility/ | how to get more google reviews |
| 3.2 | `src/content/guides/how-to-optimize-google-business-profile.md` | Answer first; Toronto examples without invented results; links /services/local-visibility/ | how to optimize google business profile (toronto) |
| 3.3 | `src/content/guides/website-redesign-cost-toronto.md` | Answer first with the real prices from `packages.ts`; links /services/website-redesign/ and /pricing/ | website redesign cost toronto |
| 3.4 | related guides, llms.txt, `scripts/seo-check.mjs` | Each new guide linked from its service page (automatic, by `service`) and from related guides (`related`) | |

## Phase 4: later (ask before each)

- Two more guides: "How long does it take to build a website" and "How to choose a web designer in Toronto".
- Industry pages for trades and home services, clinics and restaurants.
- Area pages for Etobicoke, Mississauga, Vaughan and Richmond Hill.
- Deploying, then sending the IndexNow ping.

## Phase 0 questions for Mann

a. **Neighbourhoods** for Markham, Pickering, East York and Ajax, exactly as you would write them, and optionally one
   local-project line for each. Until then the four pages stay drafts (`neighbourhoods: null`).
b. **Landing page design:** which existing package covers it (for example Website Launch, or Website Fix), or drop the
   page? Until you answer, it is not built.
c. **A larger-site tier** (the competitor sells a "Lead Gen Website" of up to 12 pages): yes with a name, price and page
   limit, or skip? Until you answer, it is skipped. No price is set here.
d. **The four owner inputs** above: YouTube channel, booking link, Google review link, Facebook Page.

## Decisions made while building

Recorded with what each costs if it's wrong; see the verification log below.

- Started Phases 1–3 without the Phase 0 answers, using the brief's defaults (Mann: "start working on it, I will
  provide inputs later"). Cost if wrong: the drafts and hidden slots wait for inputs; nothing invented is published.
- FAQ headings: every FAQ accordion on the site, not only `Faq.astro`, so "every FAQ question is an h3" holds.
- Home H2s: the descriptive text takes the display style; the slogan becomes the eyebrow.
- The three new guides are written as published (`draft: false`, 16 Nov 2026) so they can be linked and listed; nothing
  goes live until Mann deploys, and `draft: true` takes any of them back out.
- The guides' `TODO(Mann)` notes live in this file (below), not in the guide files: the repo's unit tests forbid "TODO"
  in a guide's source, so an unfinished note can never reach a page.
- Guides link each other through `related` ("Read next"), never in the text, as the existing tests require (a link to a
  guide that is later unpublished would 404).
- The redesign page shows no case study: Nest & Rest and Samp Hair & Spa are new builds, not redesigns.

## TODO(Mann)

- `src/data/site.ts`: `youtubeUrl`, `bookingUrl`, `gbp.reviewUrl`, the Facebook Page URL (`social`), and `profile.contact.replyTime` (from before).
- `src/data/areas.ts`: neighbourhoods for Markham, Pickering, East York and Ajax (and an optional `localExample` each); an optional North York `localExample` (from before).
- `/services/website-redesign/` and the redesign cost guide: do you set up redirects from old page addresses to the new
  ones during a redesign? If yes, it can be added to both; it isn't promised anywhere until you say so.
- How to get more Google reviews: once you have asked real clients, a sentence or two on what worked for you, in your words.
- How to optimize your Google Business Profile: a short before-and-after from a real profile you set up (yours, or a
  client's with permission), in your words. No result is claimed until then.
- Website redesign cost: a real redesign example once you have finished one.
- Landing page design page and a larger-site tier: your decision (Phase 0 questions b and c).

## Verification log

- **Phase 1 (16 Nov 2026):** production-like build passes; `npm run check:seo` 0 errors, 2 warnings (both from before:
  /privacy/ description 158 characters; /services/ 862 words), 26 sitemap URLs. The new llms.txt rule failed all 23 bare
  URLs in the old file and passes on the new one. `npm run check` 0 errors; `npm test` 129/129; `npm run test:e2e`
  166/166. A simulated build with a sample review, booking link, review link and YouTube URL (reverted, never committed)
  showed the reviews strip on /, /pricing/ and both area pages, the booking button (new tab) on /contact/, /pricing/ and
  the area pages, the footer review link on every page and YouTube on About. Home section headings compared before and
  after at 390 and 1440 px: same type, size and two-tone style; the services heading grows from two lines to four on a
  laptop. e2e expectations updated on purpose: the home title, the "How I work" heading, the /about/ phone length
  budget (8.75 → 9.5 screens, for "Find me elsewhere"), the FAQ selector (`summary > .acc__q`) and the About LinkedIn
  link (now twice).
- **Phase 2 (16 Nov 2026):** production-like build passes; `npm run check:seo` 0 errors, the same 2 warnings (/services/
  now 864 words), 27 sitemap URLs (+ /services/website-redesign/). The four area drafts are not in `dist/client`, the
  sitemap or any link; in previews they show the draft note and the "To confirm" neighbourhoods note. `npm run check`
  0 errors; `npm test` 135/135, `npm run test:e2e` 169/169 (the new unit tests failed against the Phase 1 code first: 5 of 6). e2e expectations
  updated on purpose: the list of extra service pages (unit), the /pricing/ phone length budget (15 → 16 screens, for
  "Which package fits?"). The redesign section on /services/web-design/ now links to the redesign page instead of
  straight to the brief (the page head still has "Request a quote").
- **Phase 3 (16 Nov 2026):** production-like build passes; `npm run check:seo` 0 errors, the same 2 warnings, 30 sitemap
  URLs (+ three guides), no "TODO" in any built page. Each new guide is linked from its service page, /guides/ and
  related guides. `npm run check` 0 errors; `npm test` 138/138; `npm run test:e2e` 172/172 (the new guides join the
  one-H1, console and axe checks). Lighthouse 13.6 mobile on the local production-like build: / 97 on the first (cold)
  run, then 98, 99 and 99; /pricing/ 99; /contact/ 98; /web-design-scarborough/ 100; accessibility, best practices and
  SEO 100 on all four. The pre-branch commit measured the same way: / 97 cold, then 99 and 99, so nothing regressed.
  HTML grows 58–410 bytes gzipped on those pages. Google's help pages couldn't be opened from the build machine, so
  each Google fact in the guides was checked through search results quoting the official page, and only facts found
  there are used. Expectations updated on purpose: the pinned list of guides (five → eight).
