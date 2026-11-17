# Design upgrade plan: every category to 9.5+

**For:** Claude Code (or any developer) working in this repository.
**Read with:** [`DESIGN_AUDIT.md`](DESIGN_AUDIT.md) (the findings and the why) and [`DESIGN.md`](DESIGN.md) (the design system).
**Baseline (16 Nov 2026):** 65/100. Hero 6, Structure 7, Typography 5, Color/brand 6, Layout 6, Imagery 7, Motion 6, UX 7, Responsiveness 6, Performance 8, Accessibility 8.

This plan turns "9.5+" into **pass/fail gates**. A category scores 9.5 when every one of its gates passes. Most gates are automated tests, so the score is earned, can be checked, and can't quietly slip back.

---

## 0. The maths, honestly

- Overall = (sum of the 11 scores ÷ 110) × 100.
- **9.5 in every category gives 95/100, not 98.**
- **98/100 needs an average of 9.8**: about nine categories at a full 10 and two at 9.5.
- Code alone can earn 9.5 in most categories (**Tier A**). A 10 also needs proof that only real use can give (**Tier B**): field speed data, a test with real users, a manual screen-reader check, real reviews and more real projects. Mann has to supply those. Code can't fake them, and the site's rules forbid trying.

| Category | Now | Tier A: code only (gates in §5) | Tier B: + owner proof (§3) | Blocks a 10 without the owner |
| --- | :-: | :-: | :-: | --- |
| Hero | 6 | 9.5 | 10 | Five-second test with real owners |
| Structure | 7 | 9.0 (9.5 with one real testimonial) | 10 | Real reviews (`src/data/reviews.ts` is empty) |
| Typography | 5 | 9.5 | 10 | Nothing: a final manual review only |
| Color / brand | 6 | 9.5 | 10 | Nothing |
| Layout | 6 | 9.5 | 10 | Nothing |
| Imagery | 7 | 9.0 (9.5 with one more real project and one more photo) | 10 | Real projects and professional photos |
| Motion | 6 | 9.5 | 10 | Nothing |
| UX | 7 | 9.5 | 10 | Task test with real owners |
| Responsiveness | 6 | 9.5 | 10 | Real-device check (iPhone Safari, Android Chrome) |
| Performance | 8 | 9.5 | 10 | 28 days of field data (Core Web Vitals) |
| Accessibility | 8 | 9.5 | 10 | Manual VoiceOver and NVDA pass |
| **Overall** | **65** | **≈ 94–95** | **98–100** | |

---

## 1. Rules for every change (non-negotiable)

1. **Brand.** Keep the MΛNN PΛTEL wordmark (Geist capitals, crossbar-less lime Λ's), black, off-white and lime. Improve it; never replace it.
2. **Copy.** Keep the existing copy except where §2 says otherwise.
3. **Truth.** No invented reviews, clients, numbers, logos or stock photos (rules in `src/data/reviews.ts` and `DESIGN.md` → Imagery).
4. **Motion.** Animate transform and opacity only. Write `animation-*` longhands whenever `animation-timeline` is used (the minifier gotcha documented in `src/styles/global.css`). Provide a complete reduced-motion path. Nothing loops forever.
5. **Quality gates stay green:** `npm test`, `npm run build`, `npx playwright test --trace off`, `npm run build:cloudflare`, plus Lighthouse CI (`lighthouserc.json`). **Never skip, delete or loosen a test to get green.** Where a test encodes a decision that §2 changes, update that test in the same commit and say which decision it implements.
6. **Docs.** Update `DESIGN.md` (dated note at the top, plus the affected sections) in the same PR as each phase.
7. **One phase per branch and PR.** Put before/after screenshots at 375, 768 and 1440 in the PR description (`scripts/design-shots.mjs`, Phase 0).

---

## 2. Decisions Mann approves by using this plan

`tests/e2e/site.spec.ts` currently locks several of these in. Each one changes on purpose:

| ID | Change | Tests affected (approximate lines) |
| --- | --- | --- |
| D1 | Remove the hero service chips (`.hero__services`); the three services move into the services bento | ~340–343 (expects 3 chips) |
| D2 | Remove the hero recent-work cards (`.hero__recent`); Selected Work sits directly below | ~346–347 |
| D3 | Move "Vision" from the main nav and phone menu to the footer | ~390–394 (sheet expects 7 links), ~603 |
| D4 | Remove the "Or reach me directly" icons from the hero (they stay in the footer CTA and on /contact/) | hero tests |
| D5 | On Home, the header CTA is an outline until the hero CTA scrolls out of view, then turns lime | new test |
| D6 *(optional copy change)* | Hero button "Get a free check" plus a microline "Website + Google, no obligation". Same link, same destination (the MP-023 experiment is unaffected). If declined, keep the label; gate H5 then applies from 390px instead of 360px | ~335, ~628 |
| D7 | Display font: trial **Archivo** (Google Fonts, `wdth` 62–125) for H1/H2 behind a flag; keep Geist if side-by-side screenshots aren't clearly better | — |
| D8 | The agent graph plays three cycles, then rests; it wakes on pointer, focus or tap (was infinite) | new test |
| D9 | Phone budget for `/` drops from 13.5 to **11** screens, and the "selected work starts by" targets tighten (1440: heading ≤ 1,000px; 390: heading ≤ 1,500px) | ~355–378, ~677 |

---

## 3. Owner inputs (Tier B: only Mann can supply these)

1. **Testimonials.** At least 1 real written testimonial for a 9.5 in Structure, and at least 3 for a 10. Start with Samp Hair & Spa (`docs/OWNER-INPUTS.md` MP-003). Add them to `src/data/reviews.ts` exactly as the rules there describe.
2. **Projects.** Launch Samp Hair & Spa on its own domain with fresh captures, plus at least 1 more real project (Imagery 9.5). Aim for 4–6 over time (Imagery 10).
3. **Photos.** 2–3 professional photos in the same dusk-green grade: one working shot (at a laptop, or with a client with their permission) and one wide shot for About.
4. **User tests** (scripts in §7): a five-second test and a task test, each with 5 small-business owners.
5. **Field data.** 28 days of Core Web Vitals from Search Console or Cloudflare Web Analytics.
6. **Screen reader.** One manual pass with VoiceOver (iOS Safari) and NVDA (Windows).

---

## 4. Phases

Each phase lists its tasks (with files) and the gates (§5) it must turn green. Add each gate's test in the phase that makes it pass. New gate tests go in **`tests/e2e/design-gates.spec.ts`** (browser checks) and **`tests/unit/design-tokens.test.ts`** (source-code checks).

### Phase 0: Baseline (S)

- 0.1 Add `scripts/design-shots.mjs`. It uses Playwright against the local preview or a URL, takes the matrix in R1, scrolls through each page once so reveals fire, then saves a first-screen and a full-page capture of `/`, `/services/`, `/work/nest-and-rest-cleaning/`, `/about/` and `/contact/` to `qa-output/design/` (already gitignored).
- 0.2 Record baseline numbers in the PR: LCP, CLS, decoded bytes by type, DOM node count, running animations after 15s, and H1/H2 font sizes at each width.

### Phase 1: Foundations, the tokens (M) → Typography, Color, Layout

- 1.1 `src/styles/tokens.css`: add the type scale from `DESIGN_AUDIT.md` → Typography (`--fs-hero`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-lead`, `--fs-base`, `--fs-sm`, `--fs-label: 0.8125rem`), tracking tokens (`--track-hero: -0.035em`, `--track-head: -0.025em`), and weight tokens (`--w-body: 400`, `--w-ui: 500`, `--w-head: 600`).
- 1.2 Replace every component font size with a token. Find them with `grep -rn "font-size" src/components src/pages src/layouts`. Allowed exceptions: the footer wordmark (sized by width) and SVG `<text>` inside `AgentGraph.astro`.
- 1.3 Weights: 520/540/560 → 500, and 625/650/700/800 → 600.
- 1.4 Tracking floor −0.035em everywhere (`.sw__title`, `.ss__title`, `.about__title`, `.pt__title`, `.hero__title` and the rest).
- 1.5 **Lime budget**:
  - Show prices in `--text` with tabular numbers.
  - Remove the lime dots from chips.
  - In `.sw` (paper section), delete `--signal: #40541e`. Status tags like "Website live" become lime *fill* with ink text, and accents become ink.
  - Lime is allowed only for: the Λ's, one primary CTA per viewport, the graph's live signal, focus rings, and the free-check band.
- 1.6 Spacing: section padding only through `--section` and a new `--section-tight`. Add `--head-gap-1` (eyebrow → heading) and `--head-gap-2` (heading → lead) and use them in every section head.
- 1.7 A 13px floor for all visible text (`.hero__role`, `.sw__labels`, the phone `.hero__services` overrides).
- 1.8 **Λ glyph:** `.eyebrow::before` becomes a small lime Λ (CSS `mask-image` with the Λ path from `Wordmark.astro`). The `.status__dot` stays round, because there it means "live".
- **Gates:** T1, T3, T4, T5, C1, C2, L2.

### Phase 2: The hero rebuild (M) → Hero, Responsiveness, UX

Spec: `DESIGN_AUDIT.md` → **Hero redesign** ("Signal path"). Files: `src/components/home/Hero.astro`, `AgentGraph.astro`, `Header.astro`, `Analytics.astro`, `layouts/BaseLayout.astro`.

- 2.1 Text column, top to bottom: the greeting row ("Hi, I'm Mann Patel." with the role line and status as text; on screens under 64em, a 40px round avatar from `profile.portrait`), the H1 (two lines, its full stop in lime), the subline, the CTA row (lime primary pill plus a "See prices →" text link), and the price line (mono, `--text-3`).
- 2.2 Apply D1, D2, D3 and D4. Put the Vision link in the footer's Pages column.
- 2.3 Use two columns from **48em** (graph about 44% wide) instead of 64em. The H1 always uses `--fs-hero`. Keep `min-height: calc(100svh - var(--header-h))` from 64em.
- 2.4 Background: a static grain layer (3–4% opacity, the SVG noise from the audit), plus the core bloom "breathing" once when the first pulse reaches Booking.
- 2.5 D5: an IntersectionObserver on the hero CTA toggles a class on the header CTA (ghost ↔ lime). The swap must cause no layout shift.
- 2.6 **Consent banner:**
  - Move its markup out of `<head>` so it sits after the skip link in the DOM (the script can stay).
  - Phones: one row, at most 72px tall.
  - Desktop: bottom-left, at most 22rem wide.
  - It must never cover `[data-ag-toggle]` or the hero CTAs.
  - It may appear after the first scroll or after 4 seconds; analytics still loads only after "Allow".
- 2.7 Apply D9 and D6 (if approved), and update the hero tests to match the new structure.
- **Gates:** H1–H7, R3, U2, U3, A2, A3.

### Phase 3: Sections and flow (M/L) → Structure, Layout, Imagery, UX

- 3.1 **Home order:** Hero → Selected work (`ReviewsStrip` right after it, once reviews exist) → Services bento → Prices → Free check → How I work (with the promises bento) → FAQ → footer CTA.
- 3.2 **Services bento** (`ServiceSummary.astro`): three tiles, A Found / B Answered / C Booked.
  - Each tile has a small inline-SVG scene in the graph's line style, taken from the round-9 spec in `DESIGN.md`: a map pin drops onto a full stop; a chat bubble with typing dots turns into read ticks; a hand-drawn circle.
  - Each scene plays once when it scrolls into view and replays on hover or focus. Under reduced motion it shows the finished state.
  - Each tile shows its package and price line and links to its service page.
- 3.3 **Promises bento** (`HowIWork.astro`): the four "What you can count on" items become tiles with icons. Reserve a testimonial tile that renders only when `reviews.length > 0`.
- 3.4 **Sticky section heads** (from 64em) in the two-column sections (How I work, Prices, FAQ): `position: sticky; top: calc(var(--header-h) + var(--s-6))`.
- 3.5 **Selected work:** the title uses `--fs-h2`; mockup backdrops come from two new tokens (`--media-bg-1`, `--media-bg-2`, tints of the paper and surface colours); status tags use the lime fill from 1.5.
- 3.6 **Nav:** at most five links plus the CTA (Work, Services, Pricing, Guides, About).
- 3.7 **About page:** at 64em and up, top-align the photo with the heading. Keep lime on the headline's full stop only, not the two-line lime phrase.
- 3.8 A lime-tipped hairline divider (`.rule-signal`) between dark sections, at most three on Home.
- **Gates:** S1–S4, L1, L3, L4, U1, U4, G4.

### Phase 4: Motion system (M) → Motion

- 4.1 One token set (`DESIGN_AUDIT.md` → Motion system → Tokens): `--ease-out`, `--ease-in-out`, `--ease-in`, `--ease-spring`, `--dur-1` to `--dur-5`, `--stagger`, and `--dur-loop: 4200ms` for the graph. Migrate everything, then delete the old `--t-*` and `--dur-*` sets. Reduced motion sets all of them to 0.
- 4.2 Replace hard-coded `ms` values in components with tokens (`grep -rnE "[0-9]+ms" src/components src/styles/global.css`).
- 4.3 **Hero entrance:** the timeline table in `DESIGN_AUDIT.md` (about 1.6s total; the H1 stays the LCP element and is painted from the first frame).
- 4.4 **Agent graph:**
  - The first pulse travels Google → core → Booking at about 1.2s.
  - Then two routes loop for three cycles and rest. The orbit spin, twinkle, ping and glow rest with them.
  - Pointer enter, focus inside or a tap wakes it for another three cycles.
  - Hovering or tapping an input pill lights its routes and dims the rest to 30%. The graph is decorative (`aria-hidden`) and its caption carries the meaning, so this enhancement can be pointer-only.
- 4.5 **Reveals:** only section heads and media, via `animation-timeline: view()` inside `@supports`. Paragraphs, lists and CTAs never start hidden. Remove `data-reveal` from list items such as `.fc__list li`.
- 4.6 **Page transitions:** the old page 220ms `--ease-in`, the new page 420ms `--ease-out` (now 700/900ms).
- 4.7 **Magnetic pull:** only on `[data-magnetic]` (hero CTA and footer CTA), at most 6px.
- 4.8 **Wordmark:**
  - "Lock-on" once per visit (`sessionStorage` flag): per-letter groups in the header via the existing `kinetic` structure.
  - Scroll-condense to "MΛ" after the hero.
  - A lime hover sweep that replaces the 0.72 opacity fade.
  - Spec in `DESIGN_AUDIT.md` → Animated wordmark.
- 4.9 **Primary CTA glow:** an opacity-only pseudo-element on a wrapper (`.btn` has `overflow: hidden`).
- **Gates:** M1–M8.

### Phase 5: Imagery (M) → Imagery

- 5.1 **One media-frame component** for browser-plus-phone mockups: backdrop tokens from 3.5 and one shadow token, `--shadow-media`, documented in `DESIGN.md` as the single exception to "depth comes from surfaces".
- 5.2 Serve captures and the portrait as **AVIF with a WebP fallback** (`<Picture formats={['avif','webp']}>` from `astro:assets`), with `srcset` covering 2× of the rendered size.
- 5.3 A dedicated avatar crop of the portrait (head and shoulders, 80/120px widths) for the phone greeting row.
- 5.4 The service scenes (3.2) and promise icons share the graph's stroke width, end caps and lime-signal rule.
- 5.5 Owner inputs (§3): new photos, the launched Samp captures, and a third project, all dropped into the same frame system.
- **Gates:** G1–G5.

### Phase 6: Responsive hardening (S/M) → Responsiveness

- 6.1 Run every gate across the full device matrix (R1).
- 6.2 Use container queries for cards and bento tiles, so tile layout follows the tile's width, not the screen's.
- 6.3 Phone landscape (844×390): the hero must not trap the CTA below a full-height graph.
- 6.4 Reflow at 320 CSS px and 200% zoom at 1280.
- **Gates:** R1–R6.

### Phase 7: Performance (M) → Performance

- 7.1 **CSS delivery.** Build with `inlineStylesheets: 'auto'` and with `'always'`, run Lighthouse on `/`, `/services/` and a case study, keep the faster, and write the result in `docs/stack.md`.
- 7.2 **One graph SVG in the first HTML.** Render the tall layout. Put the wide layout in a `<template>` and clone it at 48em and up via `matchMedia`; without JavaScript, desktop shows the tall layout, which is acceptable.
- 7.3 **If D7 is adopted:** subset Archivo to the characters in use, keep it under 30KB, don't preload it, and give it a metric-matched fallback (`size-adjust`) so CLS stays 0.
- 7.4 Nothing animates at rest (M2).
- 7.5 Tighten `lighthouserc.json`:
  - Performance: ≥ 0.95 as an error, ≥ 0.98 as a warning.
  - LCP ≤ 2,000ms.
  - CLS ≤ 0.02.
  - TBT ≤ 100ms (warning).
- **Gates:** P1–P4, P6.

### Phase 8: Accessibility (S/M) → Accessibility

- 8.1 Make the skip link the first Tab stop, with the consent banner after it, and nothing obscured by the sticky header or the banner (A2, A3).
- 8.2 **Forced colours** (`@media (forced-colors: active)`): lime-filled buttons get a `ButtonText` border, the focus ring stays visible, and the graph still reads.
- 8.3 **WCAG 1.4.12 text spacing:** with the WCAG test styles injected, no button label clips. Check `.btn__label`'s `overflow: hidden` in particular.
- 8.4 Extend the axe runs to menu open, quick menu open, consent open and an FAQ item open, at 375, 768 and 1440.
- 8.5 Owner: the manual screen-reader pass (§3.6).
- **Gates:** A1–A9.

### Phase 9: Re-audit

Re-run the `DESIGN_AUDIT.md` method (code read plus the screenshot matrix plus the measurements) and fill in the score table against the gates. Any category with a failing gate is not 9.5; say which gate failed.

---

## 5. The gates (the pass/fail definition of 9.5)

**[auto]** = automated test (`tests/e2e/design-gates.spec.ts` or `tests/unit/design-tokens.test.ts`). **[manual]** = screenshot review recorded in the PR. **[owner]** = Tier B, needs Mann.
"Matrix" = 320×568, 360×740, 375×812, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080 and 844×390.

### Hero
- **H1** [auto] At ≥ 1024px the Home H1's computed font size is ≥ 1.4× the largest H2 on the page; below 1024px it is ≥ 1.25×. On every page, the H1 is ≥ every H2.
- **H2** [auto] `.hero__text` has at most 5 direct children: greeting, H1, subline, CTA row, price line.
- **H3** [auto] Exactly one element in the hero text column has a lime background (the primary CTA).
- **H4** [auto] The H1 and primary CTA are fully in the first viewport at every matrix size. From 375×812 up, the price line and a photo of Mann (avatar, or at least 50% of the graph core) are too.
- **H5** [auto] The primary CTA label sits on one line from 360px (or from 390px if D6 is declined).
- **H6** [auto] The LCP element is the H1, CLS < 0.01, and every hero entrance animation (not the graph loop) has finished by 1,700ms.
- **H7** [auto] At every matrix size, `elementFromPoint` at the centre of `[data-ag-toggle]` and of each hero CTA returns that element or its descendant, whether the consent banner is open or not.
- **H8** [owner] Five-second test: at least 4 of 5 owners can say what Mann does, where, and what to click.

### Structure
- **S1** [auto] Home section ids appear in the order of 3.1.
- **S2** [auto] No project page is linked from two different Home sections above the FAQ.
- **S3** [auto] Every lime-filled CTA on Home points to the free check or /contact/, and at most one lime CTA is visible per viewport.
- **S4** [auto] Home is ≤ 11 screens at 390×844, and Selected Work starts by the D9 targets.
- **S5** [owner] At least 1 real testimonial is rendered (needed for 9.5); at least 3 for a 10.

### Typography
- **T1** [auto] Every `font-size` in `src/components`, `src/pages` and `src/layouts` is a `--fs-*` token, `inherit`, or an allow-listed exception.
- **T2** [auto] The rendered H1 size never decreases as the viewport widens (step from 320 to 1920).
- **T3** [auto] At most 4 distinct computed font weights on Home: 400, 500, 600, plus mono 500 (and display 600 if D7 is adopted).
- **T4** [auto] For every element, `letter-spacing ÷ font-size ≥ −0.035`.
- **T5** [auto] No visible text under 13px outside `aria-hidden` decoration.
- **T6** [auto] Body paragraphs are ≤ 72ch wide with a line height between 1.5 and 1.7.
- **T7** [manual] No glyph collisions in the longest headings at 1440 (zoomed screenshot review).

### Color and brand
- **C1** [auto] Scrolling Home one viewport at a time, each viewport has at most **one** element with a lime background or lime text. The wordmark, the agent graph, focus rings and the free-check band don't count.
- **C2** [auto] No hex colours in component CSS outside `tokens.css`, apart from an allow-list (the graph's stroke tints, which move into tokens).
- **C3** [auto] axe colour contrast passes at all widths (body ≥ 4.5:1, large text ≥ 3:1).
- **C4** [auto] The header wordmark is ≥ 16px tall from 1024px and ≥ 13px on phones, using the small-size cut (outlines drawn from Geist Medium).
- **C5** [manual] Eyebrows use the Λ glyph and the status dot keeps meaning "live". Clear space (one Λ cap height) and minimum sizes are documented in `DESIGN.md`.
- **C6** [manual] `DESIGN.md` → Colour matches the CSS exactly.

### Layout
- **L1** [auto] At 1440, the section heads of How I work, Prices and FAQ compute to `position: sticky`. [manual] No blank column taller than 35% of the viewport beside content.
- **L2** [auto] Section `padding-block` values come only from `--section` or `--section-tight`.
- **L3** [auto] At 1440, every section's eyebrow and heading start at the container's content edge (±1px).
- **L4** [manual] No two adjacent sections share a layout, and eyebrow → heading → lead spacing is identical everywhere (the `--head-gap-*` tokens).

### Imagery
- **G1** [auto] Every `<img>` has width, height and alt text (empty only if decorative), and is lazy-loaded except the LCP image. Lighthouse "properly size images" and "modern image formats" pass.
- **G2** [auto] Captures and the portrait are served as AVIF with a WebP fallback, and `srcset` reaches 2× the rendered width.
- **G3** [manual] There is one frame system, with backdrops and the shadow from tokens.
- **G4** [manual] Services and promises each have a visual in the graph's line style.
- **G5** [owner] At least 3 real projects and at least 1 professional photo beyond the hero portrait for 9.5; 4+ projects and 2+ photos for a 10.

### Motion
- **M1** [unit] A single motion token set, and no literal `ms` or `s` durations in component CSS or JS outside the tokens.
- **M2** [auto] 15 seconds after load, with no input: zero running animations on the document timeline. Scroll-driven animations are excluded.
- **M3** [auto] The hero entrance has finished by 1,700ms (same check as H6).
- **M4** [unit] View-transition durations are ≤ 450ms.
- **M5** [auto] With reduced motion: zero running animations, all content visible, and the graph shows its still, lit routes.
- **M6** [auto] With JavaScript disabled, every element is visible (opacity 1, no transform) on all public pages.
- **M7** [auto] Under 4× CPU throttle, no long animation frame over 50ms in the first 3 seconds of Home (`PerformanceObserver` on `long-animation-frame`).
- **M8** [manual] Every interactive element's hover state has a matching `:focus-visible` state.

### UX
- **U1** [auto] The main nav has at most 5 links plus the CTA, and the phone menu fits one screen at 320×568 (the existing test).
- **U2** [auto] On Home, the header CTA isn't lime while the hero CTA is in view, and is lime after.
- **U3** [auto] The consent banner comes after the skip link in tab order, is ≤ 72px tall on phones, and passes H7.
- **U4** [auto] Every public page shows a primary CTA within its first two screens at 390×844.
- **U5** [owner] Task test: 5 of 5 owners find and send the free-check request in under 60 seconds without help.

### Responsiveness
- **R1** [auto] No horizontal scroll at any matrix size on any public page (extend the existing overflow test).
- **R2** [auto] Same check as T2 (the H1 grows monotonically).
- **R3** [auto] The Home hero is ≤ 1.35 screens tall at 375×812 and ≤ 1.1 screens at 768×1024.
- **R4** [auto] On touch widths, every link and button outside running text has a target of at least 44×44px.
- **R5** [auto] At 320px and at 640px (1280 at 200% zoom): no overflow, and no overlap between interactive elements.
- **R6** [manual] The matrix screenshots are reviewed, with no single-word orphans in display headings. [owner] A check on a real iPhone (Safari) and Android phone (Chrome) for a 10.

### Performance
- **P1** [auto] Lighthouse (mobile, simulated): Home performance ≥ 0.97, other pages ≥ 0.95, LCP ≤ 1.8s, CLS ≤ 0.02, TBT ≤ 100ms.
- **P2** [auto] Home at 375: ≤ 300KB decoded in total (now about 340KB), JS ≤ 60KB, fonts ≤ 70KB including any display font.
- **P3** [auto] Home has ≤ 950 DOM nodes (now 1,205).
- **P4** [auto] Same check as M2 (nothing animates at rest).
- **P5** [owner] Field p75 on mobile: LCP ≤ 2.0s, INP ≤ 150ms, CLS ≤ 0.05 (needed for a 10).
- **P6** [manual] The CSS delivery choice (7.1) is measured and documented.

### Accessibility
- **A1** [auto] axe finds 0 violations at 375, 768 and 1440 on every public page, and with the menu, the quick menu, the consent banner and an FAQ item open.
- **A2** [auto] The first Tab press focuses the skip link.
- **A3** [auto] Tabbing through all of Home, the centre of every focused element is never covered by the sticky header or the consent banner (WCAG 2.4.11).
- **A4** [auto] WCAG 1.4.12 text spacing: with line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em and paragraph spacing 2em injected, no button label or heading clips (`scrollHeight ≤ clientHeight + 1`).
- **A5** [auto] With forced colours emulated, buttons have visible borders and the focus ring is visible.
- **A6** [auto] T5 (13px floor) and R4 (44px targets) pass.
- **A7** [auto] M5 (reduced motion) and H7 (pause control never covered) pass.
- **A8** [owner] A manual pass with VoiceOver (iOS Safari) and NVDA finds no blockers in landmarks, headings, forms, menus or consent (needed for a 10).
- **A9** [auto] Lighthouse accessibility stays at 100 (the existing CI gate).

---

## 6. How a score is given

- **9.5** = every [auto] and [manual] gate in the category passes, plus the [owner] gate where 9.5 depends on it (S5 for Structure, G5 for Imagery).
- **10** = all of the above plus the category's remaining [owner] gate.
- Anything less is scored down from 9.5, by the share of gates failing and how serious each is, and the re-audit names each failing gate.
- Overall = (sum ÷ 110) × 100. All 9.5s give 95. **98+ needs Tier B.**

---

## 7. Owner test scripts (for the [owner] gates)

**Five-second test (H8).** Show the Home first screen on a phone for 5 seconds, then hide it. Ask: "What does this person do? Where? What would you click first?" A pass is all three answered correctly. Target: 4 of 5 people.

**Task test (U5).** Start on a Google results page that links to Home and say: "You want someone to check your business's website and Google listing for free. Go." Don't help. Time it. Target: 5 of 5 people in under 60 seconds.

Record both in `docs/` with the date, the people's trades (no names), and the results.

---

## 8. Prompts to paste into Claude Code (one per phase)

**Phase 0**
> Read DESIGN_UPGRADE_PLAN.md, DESIGN_AUDIT.md and DESIGN.md. Do Phase 0 only: add scripts/design-shots.mjs as specified and record the baseline numbers. Don't change the site.

**Phase 1**
> Read DESIGN_UPGRADE_PLAN.md (§1 rules, §4 Phase 1, §5 gates T1 T3 T4 T5 C1 C2 L2), DESIGN_AUDIT.md (Typography) and DESIGN.md. Implement Phase 1 and add the listed gate tests. Keep all existing tests green (update only those a §2 decision changes, and say which). Update DESIGN.md. Show before/after screenshots at 375, 768 and 1440.

**Phases 2–8**
> Read DESIGN_UPGRADE_PLAN.md (§1 rules, §2 decisions, §4 Phase N, and the gates it lists in §5) plus the matching section of DESIGN_AUDIT.md. Implement Phase N only, add its gate tests, keep every quality gate green, update DESIGN.md, and finish with before/after screenshots and a table of each gate: pass or fail.

**Phase 9**
> Re-run the DESIGN_AUDIT.md method on the live site and score every category against the DESIGN_UPGRADE_PLAN.md gates. List any failing gate and what would fix it.
