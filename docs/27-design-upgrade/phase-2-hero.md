# Design upgrade, Phase 2: the hero (17 Nov 2026)

"Signal path" ([`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 2, [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md) →
Hero redesign). Measured as in [Phase 0](phase-0-baseline.md); before = Phase 1 (live on mannpatel.me since 17 Nov
2026, PR #52).

## What changed

- **Hero text, five parts**: greeting row (a 40px photo under 64em, so Mann's face is on the first phone screen;
  "Taking new projects" as text, no lime dot), H1 at `--fs-hero` with a lime full stop, subline at `--fs-lead`, one lime
  button with "See prices →" as a text link, and the price line in mono `--text-3`. The copy is unchanged.
- **Moved out** (approved decisions): service chips (D1; the services section below links all three), recent-work
  cards (D2; Selected Work follows directly), the Vision link (D3; now in the footer's Pages column, and out of the main
  menu and phone menu: five links), the "Or reach me directly" icons (D4; footer and /contact/).
- **Layout**: two columns from 48em (graph about 44%), full height from 64em. On 320px phones and phones held sideways
  the button row moves up to follow the H1. On laptops up to about 900px tall the five parts sit a little closer.
- **Background**: a static 3.5% grain layer; the graph's glow breathes once (scale only) when the first pulse reaches
  Booking.
- **Header button (D5)**: on Home it is an outline until the hero button scrolls away, then lime; the same box either
  way.
- **Consent prompt**: after the skip link in the page. One row along the bottom on every screen (Mann's choice: the
  plan's bottom-left card covered the hero button on 1024×768 and 1280×800). Phones show the first and last sentences
  (Mann's choice) in at most 72px. "Allow" is a white pill, so the page's lime button stays the only lime one. Shows after
  the first scroll or 4 s; while open, the page reserves its height (scroll padding and bottom padding).
- **Graph**: the phone layout is 30 units shorter (hero within 1.35 screens at 375×812, photo unchanged), the desktop
  core a little larger (r 126) for the narrower column, and the core's entrance starts at 92% instead of 86% (the
  audit's value).
- **Selected Work** (D9): no hairline above its head, so its heading starts at y=997 at 1440×900 (target 1,000).
- **Testing the prompt**: `scripts/build-consent.mjs` builds the preview a second time with a stand-in GA4 ID into
  `dist-consent/`, which Playwright serves on port 4323 (it rebuilds itself when older than `dist/`).

## Decisions made in this phase (Mann, 17 Nov 2026)

1. D9's desktop target is measured at 1440×900 (with the full-height hero, no heading can start by 1,000px at 1440×1000).
2. The 13.5 → 11 phone-screen budget for Home moves to Phase 3, with gate S4 (Home is 12.14 screens at 390×844 now).
3. On phones the consent prompt drops its middle sentence ("It shows me which pages are useful.").
4. The consent prompt is a one-row bar on every screen instead of a bottom-left card.

## Tests changed, each naming its decision

`tests/e2e/site.spec.ts`: hero chips → none, services linked below (D1); recent-work cards → none, Selected Work next
(D2); phone menu 7 → 6 links, Vision in the footer, menu-fit list and the Vision-page link check (D3); direct-contact
and no-JavaScript tests use the footer's buttons, and the click-placement test uses the footer's WhatsApp link plus
the hero button for the "hero" placement (D4); "selected work starts by" 1150 at 1440×1000 → 1000 at 1440×900, and
1900 → 1500 at 390×844 (D9). Nothing was skipped or loosened.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| H1 | pass | `design-gates.spec.ts` › H1: Home 1.30× at 320–375, 1.46× at 768, 1.52–1.6× from 1024; on every built page the H1 ≥ every H2 |
| H2 | pass | › H2 and H3 (five children, in order) |
| H3 | pass | › H2 and H3 (only the free-check button is lime) |
| H4 | pass | › H4 at all ten sizes (prices and photo from 375×812 up) |
| H5 | pass | › H5 (one line from 390px; D6 declined) |
| H6 | pass | › H6 (LCP is the H1, CLS < 0.01, entrance done by 1.7 s) |
| H7 | pass | › H7 at all ten sizes, prompt open and closed |
| H8 | needs owner | Five-second test with five owners (plan §7) |
| R3 | pass | › R3: 1.34 screens at 375×812, 0.70 at 768×1024 |
| U2 | pass | › U2 (D5) |
| U3 | pass | › U3 and A2 (after the skip link, 56–68px on phones, H7) |
| A2 | pass | same test, with and without the prompt |
| A3 | pass | › A3 (Tab through Home at 390 and 1440 with the prompt open) |

## Quality gates

`npm test` 151/151 · `npm run build` ✓ · `npx playwright test --trace off` 203/203 · `npm run build:cloudflare` ✓ (0
errors, the same 2 warnings) · Lighthouse CI assertions ✓.

## Numbers, Phase 1 → Phase 2

**Lighthouse** (mobile, medians of 3): every page 1.00 performance, 1.00 accessibility and SEO. Home LCP 797 → 794ms,
CLS 0, TBT 34 → 67ms (varies between runs on this machine). `/contact/` LCP 792 → 791ms.

| | 375 | 768 | 1440 |
| --- | --- | --- | --- |
| Home H1 px | 32 → 41.6 | 42.3 → 61.6 | 60 → 96 |
| H1 ÷ largest H2 | 1.0 → 1.3 | 1.0 → 1.46 | 1.0 → 1.6 |
| Hero height (screens) | 1.69 → 1.34 | 1.50 → 0.70 | 0.97 → 0.92 |
| Selected Work heading y | 1,516 → 1,222 | 1,687 → 857 | 1,053 → 997 |
| Home length (screens) | 13.01 → 12.65 | 10.90 → 10.09 | 9.81 → 9.75 |
| Home DOM elements | 1,204 → 1,137 | 1,204 → 1,137 | 1,204 → 1,137 |
| Home decoded KB | 292 → 290 | 318 → 315 | 329 → 325 |
| Home CLS (lab) | 0 → 0 | 0 → 0.004 | 0.0006 → 0.0005 |
| Running after 15 s | 37 → 37 | 37 → 37 | 37 → 37 |

The consent prompt's text is no longer the LCP element on any page (it was on `/contact/` and `/about/` at 768).
Infinite animations (37) are Phase 4 (D8, gate M2).

## Notes for Phase 3

- Home is 12.14 screens at 390×844; the 11-screen budget (D9, gate S4) needs about 0.9 screens from the sections below.
- U1 is already met: five main links plus the button, and the phone menu fits at 320×568.
