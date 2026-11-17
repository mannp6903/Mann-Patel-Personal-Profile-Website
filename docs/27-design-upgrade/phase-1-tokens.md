# Design upgrade, Phase 1: tokens (17 Nov 2026)

Foundations for Typography, Colour and Layout ([`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 1).
Measured the same way as the [Phase 0 baseline](phase-0-baseline.md): production build, `scripts/design-shots.mjs
--serve dist/client --metrics`, Lighthouse CI with `lighthouserc.json`.

## What changed

- **One type scale** in `src/styles/tokens.css`: `--fs-hero`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-lead`, `--fs-base`,
  `--fs-sm` and `--fs-label` from the audit, plus `--fs-ui` (16px, button and form labels; the audit sets the CTA label at
  16px and no other step is 16px). About 90 one-off sizes across 40 files now use these tokens. Section titles stop
  outgrowing page titles: Home's largest H2 went from 122px to 60px at 1440.
- **Three weights** (400, 500, 600) with mono text always 500. Bold text and table headings use 600.
- **Tracking floor** of −0.035em (`--track-hero`; `--track-head` −0.025em for H2 and H3). The tightest was −0.085em.
- **13px floor** for visible text: hero role line, project labels, quick-menu hints and form tags were 10.4–12.5px.
- **Section padding** only from `--section` or the new `--section-tight` (32 → 64px). **Head gaps**: `--head-gap-1`
  (eyebrow → heading) and `--head-gap-2` (heading → lead) in every section head, grid or stack.
- **Colours**: every hex value is in `tokens.css`: the paper band, mockup backdrops, device frames and graph strokes.
  The select arrow is drawn from two gradients in a token colour instead of an SVG with a baked-in hex.
- **Lime budget**, site-wide: prices white with tabular figures, chip dots removed, step numbers, list icons, price-row
  arrows, rail dots and the "Show all questions" button neutral. The paper band loses its olive: "Website live" is a
  lime tag with ink text, and accents are ink. Lime heading phrases (13 pages and the footer) become grey with a lime full
  stop (`accentLine()` in `src/lib/headline.ts` for data-driven headings).
- **The Λ glyph**: eyebrows start with the wordmark's Λ (a mask, `--lambda`), lime on dark and ink on the paper band.
  The status dot stays round.
- **Hero H1** is one text block: its two lines are split by a `<br>` instead of being two blocks, so the H1 is the
  LCP element (a single line had started to lose to the consent prompt's paragraph).

## Decisions made in this phase

1. **C1 counting** (Mann, 17 Nov 2026): not counted are the sticky header (gate U2 governs its button), the wordmark
   and Λ glyphs, a headline's single lime full stop, live markers (status dot, "Website live"), the agent graph, focus
   rings and the free-check band.
2. **The Home H1 uses `--fs-h2` until Phase 2.** With `--fs-hero` (96px) or `--fs-h1` (80px) in today's hero, which
   still has the chips, contact icons and recent-work cards, Selected Work starts at y=1295 or 1186 at 1440×1000. The
   existing test allows 1150, and that test isn't one a §2 decision changes. At `--fs-h2` the H1 is the same size as
   the largest H2 everywhere (ratio 1.0, previously as low as 0.48). Phase 2 slims the hero (D1, D2, D4) and moves the
   H1 to `--fs-hero` (task 2.3), which gives 1.3–1.6×.
3. `--fs-ui` added to the scale (above).

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| T1 | pass | `tests/unit/design-tokens.test.ts` › T1 (no raw sizes; the agent graph's SVG labels are the one allowed exception) |
| T3 | pass | `tests/e2e/design-gates.spec.ts` › T3 (Home at 375 and 1440: sans 400/500/600, mono 500) |
| T4 | pass | `design-gates.spec.ts` › T4 and T5 at 375, 768, 1440 (five pages) |
| T5 | pass | same tests |
| C1 | pass | `design-gates.spec.ts` › C1 at 375, 768, 1440 (one screen at a time) |
| C2 | pass | `design-tokens.test.ts` › C2 (no hex, and no %23 hex in data URIs) |
| L2 | pass | `design-gates.spec.ts` › L2 (five pages at 375 and 1440) |

Weights are also checked in the source (`design-tokens.test.ts` › weights).

## Quality gates

`npm test` 151/151 (146 + 5 new) · `npm run build` ✓ · `npx playwright test --trace off` 193/193 (185 existing, none
changed, + 8 new) · `npm run build:cloudflare` ✓ (0 errors, the same 2 warnings) · Lighthouse CI assertions ✓.

## Numbers, baseline → Phase 1

**Lighthouse** (mobile, medians of 3): Home performance 0.98–0.99 → 1.00, LCP 799 → 797ms, CLS 0 → 0, TBT 127 → 34ms
(TBT varies between runs on this machine). Every other page 0.99–1.00, accessibility and SEO 1.00 everywhere,
`/contact/` LCP 789 → 792ms.

**Lab** (`compare.md` from `--compare baseline,phase-1`):

| | 375 | 768 | 1440 |
| --- | --- | --- | --- |
| Home LCP element | H1 line → **the H1** | H1 line → **the H1** | H1 line → **the H1** |
| Home LCP ms (unthrottled) | 96 → 120 | 96 → 88 | 128 → 120 |
| Home CLS | 0 → 0 | 0 → 0 | 0.0006 → 0 |
| Home decoded KB at load | 290 → 292 | 316 → 318 | 327 → 329 |
| Home DOM elements | 1,202 → 1,204 | 1,202 → 1,204 | 1,202 → 1,204 |
| Animations running after 15 s | 37 → 37 | 37 → 37 | 37 → 37 |
| Home H1 ÷ largest H2 | 0.74 → 1.0 | 1.11 → 1.0 | 0.48 → 1.0 |
| Home length (screens) | 13.27 → 13.01 | 11.23 → 10.90 | 10.30 → 9.81 |

Page titles now follow one scale: at 1440 the case-study H1 goes from 118 to 80px and About from 76 to 80px, and on
every page the H1 is at least the largest H2. Animations and DOM size are Phases 4 and 7.

## Notes for Phase 2

- The consent prompt's paragraph is still the LCP element on `/contact/` (all sizes) and `/about/` at 768 in the lab.
  The single-row prompt (task 2.6) should end that.
- The Home H1 moves to `--fs-hero` with the slimmer hero (task 2.3); gates H1 and T2 apply from then.
