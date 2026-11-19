# Answer extractability on Home (19 Nov 2026)

A GEO/AEO audit check, "Answer extractability", scored Home 40/100 (fail, high priority). The evidence: an H1 and good
question headings, but **no answer-first opening, no direct definition and no summary block**, and only five sections
that read on their own. Answer engines (Google AI Overviews, ChatGPT, Perplexity) quote passages that answer a question
in their first sentence and still make sense when lifted out of the page. This round changes Home's copy and adds one
section; nothing else on the site changes.

## What changed

| Where | Before | After |
| --- | --- | --- |
| Hero subline (`Hero.astro`) | "Get found on Google and in AI answers, then turn searches into bookings." (a slogan) | "I’m a web designer who gets you found on Google and in AI answers, then booked." (a direct answer) |
| Hero greeting line (`Hero.astro`) | "Web designer in Toronto · local SEO and AI automation · Taking new projects" | "Based in Scarborough · local SEO and AI automation · Taking new projects": the subline now says "web designer", so the greeting gives the place instead |
| Work intro (`SelectedWork.astro`) | "A business I’m building and a client site in progress. See what each project needed…" | Names both projects (Nest & Rest Cleaning, Samp Hair & Spa) and says what each case study shows |
| Services lead (`ServiceSummary.astro`) | One sentence about where customers get stuck | Names the three services and the point each one fixes |
| Prices lead (`PricingTeaser.astro`) | Scope and billing rules only | Opens with the answer: "A website costs $1,950 for up to five pages, or $3,350 with a booking integration and one follow-up workflow." Prices come from `src/data/packages.ts`; the sentence is dropped if either price is unpublished |
| How I work lead (`HowIWork.astro`) | "Every project follows the same five steps, and everything I set up stays in your name." | Adds the span of the steps: "from a short brief to a written handover" |
| New: summary (`Summary.astro`, `#summary`) | — | "05 / Summary · Mann Patel at a glance." The definition sentence (below), then the core answer restated: found on Google and in AI answers, then booked; websites from $1,950 and local search setup $650 (CAD, plus tax); the first step is the free check (linked). It sits between How I work and the questions |

The definition sentence lives in one place, `profile.definition` in `src/data/site.ts`:

> Mann Patel is an independent web designer in Scarborough, Toronto, who builds websites, sets up local SEO and Google
> Business Profiles, and connects enquiry follow-up and online booking for small businesses in Toronto and the GTA.

It is third person with no pronouns, so it reads right when quoted alone. It matches the summary that opens
`public/llms.txt` and the Person and business descriptions in the structured data (`src/lib/seo.ts`), which were not
changed. The title, meta description, H1 and JSON-LD are unchanged.

## Gates that moved

The hero is no taller: both hero paragraphs stay two lines from 375px (R3: 1.345 screens at 375×812, unchanged), and
the work heading still starts at 997px at 1440×900. Two structure gates changed on purpose:

- **S1** (section order): Home now runs hero, work, services, prices, free check, how I work, **summary**, questions.
- **S4 and the phone budget for `/`**: 11.75 screens at 390×844, was 11 (D9). Measured 11.67: the summary is about
  490px on a phone and the longer intros about 130px. The element count is 927 (P3 allows 950).

A new test in `tests/e2e/site.spec.ts` ("Home is easy to quote…") checks the opening, the definition, the summary and
the four intros, so the fix can't slip back unnoticed.

## How to check

1. `npm run build && npx playwright test --trace off`. The S1, S4, phone-budget, hero (R3, H2 to H7) and new
   extractability tests cover this change.
2. `PUBLIC_SITE_URL=https://mannpatel.me SITE_INDEXING=true SITE_MODE=production npx astro build && npm run check:seo`.
3. View the page source of `/` and read `<main>` from the top: the first two paragraphs are the greeting and the
   direct answer, and `#summary` holds the definition sentence and the restated answer.
4. Re-run the GEO/AEO audit on https://mannpatel.me/ after deploy. It should now find an answer-first opening, a direct
   definition and a summary block.
