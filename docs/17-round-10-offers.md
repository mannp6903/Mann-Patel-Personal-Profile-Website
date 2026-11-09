# Round 10: credibility and buying clarity (9 November 2026)

Source: the competitive audit "Mann Patel vs Adrian Martinez" and its implementation brief (both 8 Nov 2026,
supplied by Mann). The competitor's design, text, testimonials and results were not copied; only the
buying lessons were used (public prices, proof, convenient routes).

## Decisions made by Mann (9 Nov 2026)

| Question | Decision |
| --- | --- |
| Which packages to sell | **Switch to the brief's four bounded offers**: Website Launch, Website + Enquiry System, Local Visibility Setup, Website Care, plus the free check. |
| Publish prices now? | **No: hide until costed.** Prices stay out of this public repository and the live site. Every price line reads “Quoted after your free check”; `/pricing/` is built but unlinked, out of the sitemap and `noindex`. |

The brief's proposed figures are not written anywhere in this repository, on purpose.

## What changed, and why

| Change | Purpose | Files |
| --- | --- | --- |
| **One source for packages**: boundary, inclusions, exclusions, client inputs, timeline dependency, third-party costs, service ids, focused page and price (null until approved). Old package links (`launch`, `found`, `answered`, `website`) map to the closest new offer in the form, the finder and the server. | Prices and inclusions agree everywhere (cards, comparison table, pricing page, service pages, contact prefill, structured data). No “Most complete” badge, discounts or scarcity. | `src/data/packages.ts`, `src/lib/enquiry/options.ts`, `validate.ts`, `src/lib/guide.ts`, `components/packages/*` |
| **Finder** re-mapped: a working website is checked first, not rebuilt; no site plus lost enquiries → Website + Enquiry System; being found → Local Visibility Setup. | Honest recommendations within the new offers. | `src/lib/guide.ts` |
| **Three focused service pages**: `/services/web-design/`, `/services/local-visibility/`, `/services/enquiry-follow-up/`. Each: who it is for and not for, what happens, honest evidence, the package, limits, other providers' costs, handover, buying questions, sources; Service + FAQ + breadcrumb structured data without prices. `/services/` and its anchors are unchanged and link to them. | Distinct answers for distinct buyers (no near-identical city pages). | `src/data/service-pages.ts`, `src/pages/services/[slug].astro` |
| **`/pricing/`**: package cards, the comparison, what moves the price, other providers' costs, buying questions. Published automatically (links, sitemap, indexing) once any price is set. | A reviewable pricing implementation without publishing hypothetical rates. | `src/pages/pricing.astro`, `astro.config.mjs`, `scripts/prelaunch-check.mjs` |
| **Clear default portrait**: the hero photo starts tuned in; the dial is optional; no auto-sweep, no coordinates on the photo; WebGL only while detuned; 5:4 on phones. | Visitors recognise the owner immediately; nothing depends on dragging (audit §4). | `src/scripts/tune.ts`, `components/home/TuneIn.astro` |
| **Positioning copy**: “Websites, local search and enquiry follow-up for Toronto service businesses”, naming North York and Scarborough. | The audit's recommended audience (a hypothesis, not a claim of specialist results). | `Hero.astro`, `pages/index.astro`, `pages/about.astro` |
| **About leads with professional facts** (what, for whom, how work is checked, replies, ownership); the personal story follows unchanged. | Buyer questions first, personality kept (audit §9). | `src/pages/about.astro` |
| **Labelled walkthrough with fictional data** (home, after the work, and on the enquiry follow-up page): five steps from enquiry to booking, keyboard-operable, steps once when seen, still with reduced motion, readable without JavaScript. | Show a working feature without simulating a real customer (audit §4, §11). | `src/components/EnquiryDemo.astro`, `components/home/Walkthrough.astro` |
| **Package preview** on the home service summaries. | Audit homepage order. | `components/home/ServiceSummary.astro` |
| **Accepted vs received**: success screens say “Accepted… on its way… the email service took it for delivery” instead of “Sent”. | Distinguish acceptance from inbox receipt (brief, Phase 1). | `ContactForm.astro`, `CheckForm.astro`, `contact/received.astro` |
| **Critical-path check script**: readiness only, or with `--send --reply-to <you>` one free check and one brief marked “[Delivery test]”. | A controlled delivery check for the owner's own inbox. | `scripts/check-enquiry.mjs`, `npm run check:enquiry` |

## Verified (local, 9 Nov 2026)

| Check | Result |
| --- | --- |
| Unit tests (Vitest) | 61 passed, including packages ↔ form options, legacy ids, price labels, finder mapping |
| Browser tests (Playwright + axe, WCAG 2.2 A/AA rules) | 108 passed, 1 skipped (as before). New: clear default portrait and optional dial; drag tuning; the walkthrough (keyboard, labelled, after the work); old package links; price lines identical across cards, table and pricing page; service pages (breadcrumb, quote link, “Not a fit”, honest statuses, sample label, Google sources); pricing not linked while unpriced; structured data without prices |
| Layouts | No sideways scrolling at 360, 390, 768 and 1440 px (existing tests, now including the new pages) |
| Reduced motion | Headline and tuner finished state at once; walkthrough does not step by itself |
| Lighthouse mobile (local production-like build) | Home 100 (three runs; one earlier run 98 from blocking-time variance), Services 100, the three service pages 100, About 100, all 100 for accessibility, best practices and SEO. `/pricing/` SEO 66 because it is deliberately `noindex` until prices exist |
| Lighthouse desktop | Home and enquiry follow-up 100 / 100 / 100 / 100 |
| Cloudflare production build + pre-launch check | 0 errors; warnings only for `ENQUIRY_TO_EMAIL` (owner action) and the optional `FORM_TOKEN_SECRET` |
| Live readiness (read-only GET) | `connected: false`, `reason: not_configured` |
| Delivery-check script | Against a local file-delivery server: both forms accepted and recorded; refuses to send without `--reply-to`; prints a clear error when the site can't be reached |
| Cloudflare Web Analytics claim on Privacy | Confirmed: the live site loads the Cloudflare beacon in a browser; GA4 is not configured |

## Not verified or not done (and why)

| Item | Status |
| --- | --- |
| Inbox delivery | **Owner action.** Needs Email Routing, a verified destination and the `ENQUIRY_TO_EMAIL` secret (docs/05 §1), then `npm run check:enquiry -- https://mannpatel.me --send --reply-to <you>` and both emails seen in the inbox. |
| Prices | **Owner decision.** Cost each package, then set `price.amount` in `src/data/packages.ts`. |
| Scheduling (Phase 5) | Not built: no scheduling service or real availability was authorised. No mock calendar is shown. |
| Estimate selector (Phase 5) | Waits for approved prices. |
| Professional profile links | Only GitHub (verified, connected account) is linked. Add others in `src/data/site.ts` once confirmed as yours. |
| Client feedback | None published; none exists with permission yet. |
| Search Console coverage | Not checked: no authorised Search Console access in this session. |
| North York / Scarborough pages | Not created: they need distinct local evidence first (audit §9). |
| Samp findings | Separate client project; its case study keeps the open contrast and ARIA findings. |
