# Upgrade report, Phase 1 (22 Nov 2026, before the 25 Nov launch)

Source: *mannpatel.me: Upgrade Report* (audit of 22 Nov 2026, against commit `809134f`). Its standard: would a
small-business owner in the GTA trust this person enough to book a call? This change does the Phase 1 roadmap items
that are code. The items only Mann can do are listed at the end, and in [`OWNER-INPUTS.md`](OWNER-INPUTS.md).

## What changed

| # | Report ref | Change | Where |
|---|---|---|---|
| 1 | R7.1 | "Book a 15-minute call" is wired everywhere it belongs: hero (as the second action), footer close, phone action bar, `/contact/` (first in the aside), `/contact/received/` ("Want to talk sooner?"), `/pricing/` and the area pages. One component, a plain link that opens a new tab, tracked as `booking_click`. **Nothing shows until `bookingUrl` is set.** | `src/components/ui/BookingButton.astro`, `src/data/site.ts` |
| 2 | R7.2 | One set of action labels in `cta` (`src/data/site.ts`): **Get a free website check** (primary, lime), **Book a 15-minute call** (secondary, ghost), **Free check** (header). Retired: "Start a project", "Request the free check", "Get a free website and Google check", "Full pricing and what's included" (now "See every package") and the header's "Contact" button (Contact is a link in the phone menu). The project brief is "Send a short brief". The check form's submit button still says "Request the free check": it submits, it doesn't navigate. | Header, Footer, Hero, FreeCheck, PricingTeaser, QuickMenu, Finder, pricing, 404, services, work, about, guides |
| 3 | R12.3 | Samp Hair & Spa leads the work (`order: 1`); Nest & Rest is tagged "My own business". The work intro names Samp first, and the "01 / 02" counters are gone. | `src/content/work/*.md`, `src/content.config.ts`, `SelectedWork.astro` |
| 4 | R8.3 (part) | The services phone's website screen no longer shows an empty grey "photo" box; the page's sections ("Services and prices", "Hours and directions", "Reviews") sit under the Book button as rows. See "Not done" for the Samp capture. | `src/scripts/service-phone.ts`, `src/styles/service-phone.css` |
| 5 | R8.1, R8.2 | Cut: the price odometer (`scripts/odometer.ts`, `styles/odometer.css` deleted), the rotating "FREE CHECK · NO OBLIGATION" ring, the magnetic pull and the cursor spotlight (`scripts/fx/pointer.ts` deleted). | PricingTeaser, FreeCheck, `scripts/fx/index.ts`, `global.css` |
| 6 | R6.1 | The greeting's `<picture>` is hidden with the photo from 64em, so the greeting starts on the H1's edge (it was 12px in). | `Hero.astro` |
| 7 | R6.2 | No caption under the graph. The pause control is a 44px icon button at its bottom right, named by a visually hidden label the script keeps current ("Pause animation" / "Play animation"). | `AgentGraph.astro` |
| 8 | R6.3 | Hero copy, Option A: "Hi, I'm Mann. Web designer in Scarborough." / **Websites and Google listings for Toronto small businesses.** / "I build fast websites and set up your Google profile, so people nearby find you, call you and book. Fixed prices, in writing." / "Websites $1,950. Google setup $650. CAD, plus tax." No middle-dot strings. The title tag keeps "Local SEO". | `Hero.astro`, `scripts/seo-check.mjs` |
| 9 | R1.1, R1.2 | Home's "at a glance" summary is deleted (it repeated the hero and the prices). Home shows three questions, and its FAQ structured data matches. The definition sentence still opens `public/llms.txt`. | `index.astro`, `Summary.astro` deleted |
| 10 | R4.2 (Home) | The numbered eyebrows on Home are gone. `.eyebrow` is now the body face at `--fs-sm`, sentence case, untracked, `--text-2`, with no Λ before it (site-wide, one rule). The lime band's label reads "Free, no obligation" in the same style. | `global.css`, Home sections |
| 11 | R7.3 | Phone action bar under 48em: "Free check" (lime) and "Book a call" (ghost), or "Call" (tap to call) while `bookingUrl` is unset. It slides up after the first section scrolls away and hides while the footer or the consent prompt is on screen. 64px plus the safe area; 48px buttons; 320ms in, 200ms out; reduced motion just shows it. Not on `/contact/`, `/contact/received/` or `/free-check/`, where the form is the action. Hidden without JavaScript. | `src/components/ActionBar.astro`, `BaseLayout.astro` |
| 12 | R13.1 | The quick menu's search field shows a 2px ring in the focus colour while focused. | `QuickMenu.astro` |

## Measured (local build, 22 Nov 2026)

| Check | Before (report) | After |
|---|---|---|
| Home sections | 8 (with Summary) | 7 |
| Home, visible words at 1440 (whole page, answers closed) | 1,372 | 1,145 (the report's Phase 2 merge of Services and Prices takes it toward 670) |
| Home height at 390×844 | 11.67 screens | 10.8 screens (gate S4 back to 11) |
| Greeting vs H1 left edge at 1440 | 12px off | 0px |
| Labels for the free check and the brief | 5 | 2 ("Get a free website check", "Send a short brief") |
| Motion systems on Home | odometer, ring, magnetic, spotlight + 7 | the 7 kept |

## Tests

- `tests/e2e/site.spec.ts`: hero copy, the action labels, project order, the removed effects (magnetic, spotlight,
  odometer and ring now in "removed effects stay removed"), the phone menu (7 links, Contact as a link), and a new
  "upgrade report Phase 1" block: R6.1 alignment, R6.2 pause button, R7.2 labels, R7.3 action bar, R12.3 order, R13.1
  focus.
- `tests/e2e/design-gates.spec.ts`: S1 (no summary), S4 (11 screens), U1 (the "Free check" button), M7 (removed).
- Tests that depend on `bookingUrl` read it from `src/data/site.ts`, so they pass before and after Mann adds the link.

## Not done here, and why

| Item | Why |
|---|---|
| Putting a real Samp capture inside the services phone (R8.3a) | It waits for the recapture after the Samp fixes (R2.1, R12.1). It also needs a decision: the phone acts out a 5-star listing, a missed-call text-back and an instant "You're booked", and the Samp site has about 4.4 stars and an appointment *request* form. Putting the salon's name on that scene would claim features its site doesn't have. Options: keep "Your business" (the reader's own) as now, or use the Samp screen only for the website step and change the last beat to "Request sent". |
| Phase 2 and 3 items | Out of scope for the launch; see the report's §14. |

## What only Mann can do (Phase 1)

1. **Create the 15-minute call link** (Cal.com or a Google Calendar appointment schedule: "15-minute intro call", 15
   minutes, a 15-minute buffer, at least 24 hours' notice, at most 4 a day; ask for the business name, the website and
   "What isn't working?"). Paste it into `bookingUrl` in `src/data/site.ts`. Every button above appears from that one
   change.
2. **Message the Samp owner today** for two or three sentences you may publish and permission to photograph the salon.
   Draft (from the report, §12):
   > Before I share your new site, could I use 2 or 3 sentences from you about working with me? I'll show you exactly
   > what I publish, and you can change or remove it any time. If it helps: what was the problem before, what was it
   > like working with me, and what has changed since?
3. **Fix the Samp preview's 31 contrast items and 1 ARIA attribute** in the Lovable project, re-run axe-core at 390 and
   1440, then change the row in `src/content/work/samp-hair-spa.md` to "Fixed on [date]: …" (R12.1).
4. **Recapture Samp** (D1 desktop, M1 phone at 1170×2532) after those fixes (R2.1).
5. **Set `reviewUrl`** (`gbp.reviewUrl` in `src/data/site.ts`) from Google Business Profile → "Ask for reviews" (R7.4).
