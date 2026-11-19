# SEO report follow-up (19 Nov 2026)

What changed after the 18 Nov 2026 SEO report, why, and what was skipped. The work followed the master prompt
(`mannpatel-master-prompt.md`). Its Decisions block (D1 to D13) was still all `<<FILL>>`, so every task that needed a
decision was skipped, as the prompt says. Nothing here adds a review, a result, a statistic or a price that isn't
already in `src/data/packages.ts`.

## Done

### The step from Website Launch to Website + Enquiry System (task 2, the part that needs no decision)

- The Website + Enquiry System card now says: "The extra $1,400 over Website Launch buys one booking integration plus
  one workflow." It shows wherever the card appears (Pricing, Services and the enquiry page), and in `public/llms.txt`.
- The number is worked out from the two prices (`upgradeNote()` in `src/data/packages.ts`, from a new `builtOn` field),
  so it can't drift if a price changes. It disappears if either price is unpublished.
- Why: buyers comparing the two packages could see the gap but not what it pays for.

### Proof that the automation works (task 3, without D6 to D9)

- **Missed-call calculator** on `/services/enquiry-follow-up/` (`src/components/MissedCallCalculator.astro`,
  arithmetic in `src/lib/missed-calls.ts`). Four boxes: calls a week, share missed, average job (CAD) and share of
  missed callers who would have booked. It shows the value at stake each month, a plain-words detail line and the
  formula with the visitor's own numbers:
  `calls a week × % missed × 52 weeks ÷ 12 months × % would have booked × average job`.
  - No default values and no averages: every box starts empty and the result uses only what the visitor types.
    It says it is an estimate, "not what any set-up will win back".
  - Plain text boxes with a numeric keyboard, so "$180", "30%" and "1,200" are understood. Each label and hint is tied
    to its box; an error ("Enter a number from 0 to 100.") appears under a box that isn't a number in range. The result
    is in a polite live region, updated a quarter-second after typing stops; the formula sits outside it, so it isn't
    read out at every key.
  - One column on phones (checked at 320px), two from 40em with the boxes lined up.
  - Without JavaScript, the boxes stay hidden and a short paragraph explains the same sum, to do by hand.
  - The result is white, like every price: no new lime.
- **"Try it" box** (`src/components/DemoLine.astro`), above the sample walkthrough. It reads a new build variable,
  `PUBLIC_DEMO_PHONE`, and renders only when that holds a valid number. It is labelled as a demo line for the fictional
  Example Cleaning Co. Documented in `.env.example` and `README.md`. **Off**: D8 is not set.
- **Demo videos** (`src/data/videos.ts`: title, description, URL, optional player URL, thumbnail, duration, upload
  date, transcript). A "Watch it work" section on the enquiry page lists each video with its length, a link to watch
  it and its transcript in full, plus `VideoObject` structured data (`videoJsonLd()` in `src/lib/seo.ts`). **Off**: the
  list is empty because D9 is "none yet". A thumbnail is required because Google won't show a video in results without
  one.

### Local content (task 4)

- **The after-hours study, as an unpublished outline:**
  `src/content/guides/how-scarborough-businesses-answer-after-hours.md` (`draft: true`, `outline: true`). Sections: the
  question, the method, the results (two tables with empty cells), what it means for owners, and how to fix it.
  - Method: 30 Scarborough and North York salons, spas and cleaners from public listings, one call after hours, left
    to ring out. No message and no quote request. It logs a text (and how many minutes it took), a voicemail or
    nothing, and whether the Google profile has a booking link. Totals only, no business names.
  - It is built in previews only. Production, the sitemap and every link leave it out until it's published.
- **"What I found in <area>"** on the area pages: an optional `localFindings` field (`points` and `how`) in
  `src/data/areas.ts`. The block shows only when it's filled. It is left empty everywhere.
- **Breadcrumbs on About and Contact**, using the existing `Crumbs` component, with a `BreadcrumbList` from
  `breadcrumbJsonLd()`. Home → About and Home → Contact. The design gates passed (below).

### Housekeeping

- The HTML comments in the files this work touched (the service page template, the area page template, About and
  Contact) are now `{/* */}` template notes, so they no longer ship in the built pages (rule 5).

## Skipped, and why

| Task | Needs | Status |
| --- | --- | --- |
| 1. Facebook Page URL in `social` and the business `sameAs` | D1 | Skipped. `url: null` stays |
| 1. Google review link (footer "leave a Google review") | D2 | Skipped. `gbp.reviewUrl: null` stays |
| 1. Reviews in `src/data/reviews.ts` | D13 | Skipped. The list stays empty, so no reviews strip |
| 2. Enquiry Setup package (one-time) | D3 | Skipped |
| 2. Enquiry Care package (monthly) | D4 | Skipped |
| 2. A price for the "Stay found" plan (and removing "quoted separately") | D5 | Skipped |
| 2. Wiring the new packages into Pricing, `PackageCompare`, the form's starting point, the offer catalogue, the FAQs and `llms.txt` | D3, D4 | Skipped (no new packages) |
| 2. Rewriting the missed-call guide's "only part of the $3,350 package" | D3 | Skipped (still true today) |
| 3. Contact page: "my own text-back replies within a minute" | D6 | Skipped. It's a claim, so it waits for "yes" |
| 3. Contact page: "you'll get an automatic confirmation right away" | D7 | Skipped. It's a claim, so it waits for "yes" |
| 3. "Try it" box | D8 | Built, off until `PUBLIC_DEMO_PHONE` is set |
| 3. Demo videos | D9 | Built, off until `src/data/videos.ts` has entries |
| 5. Hero line under the H1 | D10 | Skipped. The current line stays |
| 5. "AI" in the hero role line (keep and explain, or remove) | D11 | Skipped |
| 5. Removing "Print and social content, as add-ons" from Home | D12 | Skipped |
| 5. Trade starter offers on the salon and cleaner pages | D3 | Skipped (only once D3 is set) |

## Tests

- **Unit** (`npm test`): 177 passed. New: `tests/unit/missed-calls.test.ts` (the arithmetic, reading the boxes, the
  error messages, rounding, the formula text, and no claims beyond the visitor's numbers). Added to
  `packages.test.ts` (the $1,400 line comes from the two prices and is in `llms.txt`), `structured-data.test.ts`
  (`VideoObject` fields, video lengths) and `new-pages.test.ts` (area findings; the study is the only outline and
  stays a draft, with an empty results table).
- **Tests changed on purpose**, each with a dated comment: the guide count is nine (was eight), with one outline
  allowed (was none). The e2e guide list includes the study. The enquiry page's phone budget is 15.5 screens (was
  14), because the calculator adds about 1.35 screens at 390px.
- **Browser** (`npx playwright test`): a new block, "enquiry page: calculator, demo line and videos". It checks the
  result and formula from typed numbers, Tab order, the hint and error tied to each box, error messages and how they
  clear, no sideways scroll at 320px, axe on the calculator, the no-JavaScript paragraph, and that the demo line and
  videos render nothing (and no `VideoObject`) until they're supplied. **246 passed** (240 before this work, all
  passing), including every design gate (axe at three widths, text spacing, forced colours, no sideways scroll,
  measure, head spacing, no JavaScript) on the enquiry page, About, Contact and the draft study guide.
- `npm run build`: passes. `npm run build:cloudflare`: passes, with the pre-launch check at 0 errors and the same 2
  warnings as before (`ENQUIRY_TO_EMAIL` and `FORM_TOKEN_SECRET` are set in Cloudflare, not in the build). The
  production build leaves out the draft study, and has no demo line or `VideoObject`.
- `npm run check:seo` on the production build: 0 errors. The 2 warnings were already there (the Privacy description
  is 158 characters; `/services/` has 871 words).
- Some components this work didn't touch (`BaseLayout`, `EnquiryDemo`, `ContactForm`) still ship HTML comments in
  the built pages. They are harmless, and left for a separate tidy-up.
- `npx astro check` reports two type errors in files this work didn't touch (`src/components/home/AgentGraph.astro`
  and `tests/e2e/design-gates.spec.ts`). They were already there.

## What Mann does next

1. Fill in D1 to D13 in the master prompt and run it again. Each skipped task above then goes ahead.
2. **Demo line:** set up missed-call text-back on a separate number for "Example Cleaning Co.", test it from another
   phone, then add `PUBLIC_DEMO_PHONE` as a Cloudflare **build** variable (Workers & Pages → mann-patel-website →
   Settings → Build → Variables and secrets) and redeploy.
3. **Videos:** record and post them, then add each one to `src/data/videos.ts` with its thumbnail and word-for-word
   transcript.
4. **After-hours study:** run the 30 calls, fill in both tables and write the sections. Then set `outline: false`,
   `draft: false` and a `published` date, and add a line or two to `localFindings` for Scarborough (and North York) in
   `src/data/areas.ts`.
