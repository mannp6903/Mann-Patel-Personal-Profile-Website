# Design upgrade, Phase 3: sections and flow (17 Nov 2026)

[`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 3, [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md) →
Structure, Layout, Imagery, UX. Measured as in [Phase 0](phase-0-baseline.md); before = Phase 2 (live on mannpatel.me
since 17 Nov 2026, PR #53).

## What changed

- **Home order (3.1)**: hero → Selected Work (the reviews strip goes right after it once real reviews exist) →
  services → prices → free check → how I work → questions → footer call to action. It was already in this order; the
  gate now holds it.
- **Services bento (3.2, `ServiceSummary.astro`)**: three tiles, A Found (two rows tall from 48em), B Answered,
  C Booked. Each tile has a small inline-SVG scene in the agent graph's line style (graph greys, lime only on the
  signal mark):
  - Found: a pin drops onto a full stop on a listing card, with one ripple.
  - Answered: typing dots in a chat bubble turn into read ticks.
  - Booked: a hand-drawn circle goes round a date.

  Each scene plays once (transform and opacity only) when the tile is 60% in view and replays on hover or keyboard
  focus. Under reduced motion, or without JavaScript, it shows the finished state. Each tile keeps its package and
  price line and its service-page link. The wording is unchanged.
- **Promises bento (3.3, `HowIWork.astro`)**: the four "What you can count on" items are tiles with line icons (stroke
  1.5). A testimonial tile renders only when `reviews` has an entry; it has none today, so nothing shows.
- **Phones**: both bentos are swipe rails under 48em (Mann's choice), with the page gutter on the first and last
  tiles. The scenes are capped at 11rem, and a few phone paddings come from `--section-tight`. Home is 10.92 screens at
  390×844 (was 12.14).
- **Sticky heads (3.4)**: from 64em, the heads of How I work, Prices and the questions stay in view at
  `top: calc(var(--header-h) + var(--s-6))`.
- **Selected Work (3.5)**: mockup backdrops come from two new tokens, `--media-bg-1` and `--media-bg-2` (tints of the
  paper band toward the surface colour). The `--fs-h2` title and the lime-filled tags were already in place from
  Phase 1.
- **Nav (3.6)**: five links plus the button. Already true since Phase 2; gate U1 now holds it.
- **About (3.7)**: from 64em the photo starts level with the heading (below the eyebrow). The only lime in the headline
  is the full stop (Phase 1).
- **Dividers (3.8)**: `.rule-signal`, a 1px hairline with a lime tip that fades to `--line`, aligned to the container's
  content edge. Three on Home: above Prices, above the questions (`<Faq rule />`) and above the footer. Those are the
  three dark-to-dark joins; the footer's plain top border was replaced by the third. The old plain rule above the
  services came off, since the paper band already separates them.
- **U4: a lime button under every page intro** (Mann's choice).
  - Services, Work, Guides, every guide, every case study and About: "Get a free website and Google check" (on About
    it is the first item in the contact block, which sits after the photo on phones).
  - Pricing: "Start a project" (`/contact/`).

  Privacy and Terms are left out by design. The labels are existing labels.

## Decisions made in this phase (Mann, 17 Nov 2026)

1. U4: one lime button under each page intro, rather than relying on the header button.
2. On phones the services and promises bentos are swipe rails (the 11-screen budget, D9 and S4, needs the room).

## Tests changed, each naming its decision

`tests/e2e/site.spec.ts` › "phones: short pages": the Home budget goes from 13.5 to 11 screens (D9, applied with gate S4
as agreed in Phase 2). No other existing test changed. Nothing was skipped or loosened.

New in `tests/e2e/design-gates.spec.ts`: S1, S2, S3 (375, 768, 1440), S4, L1, L3, U1, U4.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| S1 | pass | › S1: section ids in the order of 3.1 (reviews after work when present), at most three `.rule-signal` (three) |
| S2 | pass | › S2: no `/work/` page linked from two sections above the questions |
| S3 | pass | › S3 at 375, 768 and 1440: every lime button in the page and footer leads to the free check or `/contact/`; at most one on screen at each scroll step (the header's own button is outside the count) |
| S4 | pass | › S4: 10.92 screens at 390×844 (≤ 11); Selected Work heading at y 1,244 at 390 (≤ 1,500) and 997 at 1440×900 (≤ 1,000) |
| L1 | pass | › L1: the three heads compute to `position: sticky` at 1440. Manual: in the 1440 captures each head stays beside its content, so no tall empty column shows |
| L3 | pass | › L3: every eyebrow and H1/H2 on Home starts at the container's content edge ±1px at 1440 |
| L4 | pass (my review) | No two adjacent Home sections share a layout: graph hero, paper band of cards, bento, price list, lime band, steps with icon tiles, accordion. How I work and the questions both put the head on the left (plan 3.4), but their content differs (steps and a 2×2 tile grid against an accordion). Head spacing is `--head-gap-1/2` everywhere (Phase 1, gate L2) |
| U1 | pass | › U1: five main links and a Contact button; the existing phone-menu test fits it at 320×568 |
| U4 | pass | › U4: on every built page except Privacy and Terms, a lime button ends within 2 × 844px at 390×844 |
| G4 | pass (my review) | The services scenes and promise icons use the graph's strokes and greys (1.5px, `--graph-*`), with lime only on the signal mark (pin dot, read ticks) |

Not in this phase: S5 [owner] (at least one real testimonial; the tile and strip are ready and render once
`src/data/reviews.ts` has an entry).

## Quality gates

| Check | Result |
| --- | --- |
| `npm test` | 151/151 |
| `npm run build` | ✓ |
| `npx playwright test --trace off` | 213/213 |
| `npm run build:cloudflare` | ✓ (0 errors, the same 2 warnings) |
| Lighthouse CI assertions | ✓ |

## Numbers, Phase 2 → Phase 3

**Lighthouse** (mobile, medians of 3): every page scores 1.00 for performance, accessibility and SEO.

- Home: LCP 794 → 799ms, CLS 0, TBT 67 → 56ms.
- `/contact/`: LCP 791 → 797ms.
- `/pricing/` (1,504ms) and the case study (1,540ms) are at their Phase 0 levels (1,506 and 1,582ms), well inside the
  2,500ms budget. On `/pricing/` the LCP is a package card's "for" line, and almost all of its time is render delay
  (1.28s of 1.5s); this was there before Phase 3 and is a note for Phase 4.

| | 375 | 768 | 1440 |
| --- | --- | --- | --- |
| Home length (screens) | 12.65 → 11.38 | 10.09 → 10.46 | 9.75 → 10.07 |
| Home length at 390×844 | 12.14 → 10.92 | | |
| Selected Work heading y | 1,222 | 857 | 997 |
| Home DOM elements | 1,137 → 1,192 | 1,137 → 1,192 | 1,137 → 1,192 |
| Home decoded KB | 290 → 299 | 315 → 324 | 325 → 335 |
| Home CLS (lab) | 0 → 0 | 0.004 → 0.004 | 0.0005 → 0 |
| Running after 15 s | 37 → 37 | 37 → 37 | 37 → 37 |

- The bento scenes' animations are finite and end within about 2 s, so they are not in the 15 s count. The 37
  infinite animations are Phase 4 (D8, gate M2).
- On tablets and desktops Home is about 0.3 to 0.4 screens longer, because the bento tiles are taller than the old
  list. There is no budget at those sizes; the D9 desktop target (Selected Work by 1,000px at 1440×900) holds.

## Notes for Phase 4

- All 37 infinite animations are in the agent graph: 24 sparks, 10 twinkles, the orbit, the ping and the glow. They are
  next: D8 (three graph cycles), M1–M8.
- `/pricing/` LCP: render delay on a package card (see above). Worth checking against the reveal timings in Phase 4.
- The scenes use `getAnimations()` with `play()` and `cancel()`, so a Phase 4 motion utility can take them over.
- Home's decoded size is 299KB at 375. On the P2 target of 300KB, Phase 7 has almost no room left.
