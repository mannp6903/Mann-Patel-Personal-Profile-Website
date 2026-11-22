# Upgrade report, Phase 2 (22 Nov 2026)

Source: *mannpatel.me: Upgrade Report* (22 Nov 2026), roadmap §14, Phase 2. Phase 1 is in
[`29-upgrade-report-phase-1.md`](29-upgrade-report-phase-1.md). This change does the Phase 2 items that are code. The
items that need Mann (photos, Samp captures and recording, confirmed timelines) are listed at the end.

## What changed

| # | Report ref | Change | Where |
|---|---|---|---|
| 1 | R10.1 | **One name per package, plain words, everywhere** (Mann chose this, 22 Nov 2026): Local Visibility Setup → **Google Listing Setup**; Website Launch → **Website**; Website + Enquiry System → **Website + Booking**. Website Fix, Website Care and every price are unchanged, and so are the package ids and the `/pricing/#pkg-…` anchors, so old links still land. In prose, "Website" reads "the Website package". Covers the data, pricing page, service and industry pages, area FAQs, the seven guides, `public/llms.txt`, the finder, the form's "starting point" list and the structured data offers. | `src/data/packages.ts` and the files that quote it |
| 2 | R5.1, §9 | **Services and Prices are one section on Home**, "What I do, and what it costs." Each tile leads with its package and price and says what the price covers; Website Fix and Website Care sit underneath in aligned rows, with the add-ons and payment terms. The M5 "search to booked" phone is kept. Prices are said once on Home (plus the hero's one-line price). `PricingTeaser.astro` is deleted. | `ServiceSummary.astro` |
| 3 | R3.2, §9 | **"You work with me, start to finish."** after the work: one paragraph, "Book a 15-minute call" (once `bookingUrl` is set) and "More about me". *Revised later on 22 Nov 2026 (Mann: the same photo showed twice on Home):* no photo here; a roster of every job in a project (scope, design and build, Google listing, calls and messages, testing and launch, handover) with "Mann" against each. The hero keeps the one portrait, larger (core r 126 → 140, about 249px across at 1440) and without the lime halo. | `WorkWithMe.astro`, `AgentGraph.astro` |
| 4 | §5 | **Home order:** hero, work, (reviews), you work with me, what I do and what it costs, free check, how a project runs, questions. | `src/pages/index.astro` |
| 5 | §5, §9 | **How a project runs** is a horizontal five-step line from 64em (a vertical line on phones), each step with a short name and one line, then the four promises in one row. No sticky head, no mono labels. No durations: none are confirmed. | `HowIWork.astro`, `src/data/services.ts` (`step`, `short`) |
| 6 | §9 | Home's third question is now **"Do I own the website and the accounts?"** (it restates the "You own every account" promise). | `src/data/faqs.ts` |
| 7 | R4.2, Appendix D | **Eyebrows:** 30 removed where the heading already names the section (pricing, service, area, industry, guide, case-study and about pages, the footer close, the questions, reviews). Kept where they add a fact a slogan heading doesn't ("My story", "The package that fits", "Missed-call calculator"), plus "Explore", "Accepted" and "Error 404". Vision's labels lost their "01 / …" numbers. | many |
| 8 | R4.2, Hallmark 64 and 67 | **Tracked capitals and mono labels:** 39 label rules (table heads, tags, card labels, footer column heads, the quick menu's group titles, "The problem" / "My role") are now the body face, sentence case, untracked. Mono stays for figures: prices, step numbers, clocks, keyboard keys, guide dates, and the free-check page's receipt. | many |
| 9 | Hallmark 63 | **Middle-dot strings** in labels and meta lines are commas or colons ("Sample, fictional business", "Free, no obligation, about a minute", the work `kind` lines). Dots between items of a list stay. | many |
| 10 | R4.1 | **Warm neutrals:** `--bg #0b0b0a`, `--bg-2 #121211`, `--surface #1a1a17`, `--surface-2 #222220`, `--line #2d2d29`, `--control #74746c` (4.2:1 on the page, still above 3:1 for controls). The 18 colour literals are tokens (`--scrim`, `--scrim-soft`, `--signal-a04` … `-a90`, `--ink-a25`, `--ink-a40`, `--dot-grid`, `--dot-field`), at the same values. | `tokens.css`, DESIGN.md → Colour |
| 11 | R2.2 | **No drawn browser bar** on desktop captures: a plain figure with the media radius and shadow. The real address shows as a text link on each Home work tile (samp-hair-spa.lovable.app, nestnrestcleaning.com). | `MediaFrame.astro`, `SelectedWork.astro` |
| 12 | R2.3 | The **phone overlay sits inside its panel** (it ran up to 80px past the bottom and was clipped). | `ProjectMedia.astro` |
| 13 | R13.3 | **Consent bar on phones:** "May I count visits? No ads. Details" at the body size (the full sentence from 40em). | `Analytics.astro` |
| 14 | R13.4 | Project title links on Home are 44px tall targets. | `SelectedWork.astro` |
| 15 | R13.5 | `overflow-x: clip` on `html` as well as `body`. | `global.css` |
| 16 | R2.4 | **Case-study sharing images** are JPEG at quality 80: 69 KB and 52 KB (were 225 KB and 190 KB PNGs), regenerated from the current labels. | `scripts/make-project-cards.mjs`, `public/og/` |

## Measured (local build, 22 Nov 2026)

| Check | After Phase 1 | After Phase 2 |
|---|---|---|
| Home sections | hero, work, services, prices, check, how I work, questions | hero, work, with me, what I do and what it costs, check, how a project runs, questions |
| Home height at 390×844 | 10.8 screens | 10.8 screens |
| Home, visible words at 1440 (whole page, answers closed) | 1,145 | about 1,015 |
| Sections in the "head left, list right" split | 4 | 1 (the questions) |
| Eyebrows over headings (site-wide) | 62 | 32 |

## Checks run (22 Nov 2026, local)

| Check | Result |
|---|---|
| Unit tests (`npm test`) | 177 passed |
| End-to-end, full suite | 245 of 253 passed; the 8 failures were tests still describing the old design (the prices section, PNG sharing cards, the old package names, the questions' eyebrow) plus two real issues in the new block (its portrait served a JPEG fallback without `data-src-w`; gate L3 didn't know a photo-led section). All fixed and re-run with the related Home, image, budget and accessibility gates: 26 and 44 passed |
| Production build and pre-launch check (`npm run build:cloudflare`) | 0 errors; 2 warnings for Cloudflare secrets a local build can't see |
| SEO check (`scripts/seo-check.mjs`, now reading JPEG sizes as well as PNG) | 0 errors; 2 warnings that predate this change (/privacy/ description length, /services/ word count) |

## Not done here, and why

| Phase 2 item | Why |
|---|---|
| 3. Photo shoot P1 to P4 | Mann's photos. |
| 4. Samp phone recording and captures D2, M2, M3 | After the Samp fixes and with access to the live Samp site. |
| 5. Rebuild the Samp case study in the new outline | Waits on the recapture and the owner's words; the section order can follow once they exist. |
| 9. Contact page: reply time, and three FAQs beside the form | `replyTime` is still unset (a promise only Mann can make), and the timeline answer isn't confirmed. Booking-first and the received page's booking link were done in Phase 1. |
| 10. Durations on the process line | None confirmed (`packages.ts` promises no turnaround yet). |
| Phase 3 items (single-colour H2s, unused assets, Care Plus, price review) | Out of scope. |

## What Mann needs to do

1. **Confirm typical durations** for the five steps (brief, scope, build, test, handover) if you want them on the line.
2. **Confirm a reply time** (`profile.contact.replyTime` in `src/data/site.ts`).
3. The Phase 1 list still stands: the booking link, the Samp fixes and recapture, the testimonial request and the review
   link ([`29-upgrade-report-phase-1.md`](29-upgrade-report-phase-1.md#what-only-mann-can-do-phase-1)).
