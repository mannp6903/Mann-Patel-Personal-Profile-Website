# Design upgrade, Phase 8: accessibility (17 Nov 2026)

[`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 8, [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md) →
Accessibility. Measured as in [Phase 0](phase-0-baseline.md); before = Phase 7 (live on mannpatel.me since 17 Nov 2026,
PR #58).

## Where it started

A survey of every built page (32) before any change:

- **axe (A1):** no violation at rest on any page at 375, 768 or 1440. One finding showed only when axe ran 0.4 s after
  load: the free-check page's sample-chat times, still fading in, read as low contrast. At 1.3 s and 3 s there was
  nothing. A check must look at the page at rest.
- **Text spacing (A4):** with the WCAG styles applied, no button label or heading text clips. The plan's measure
  (`scrollHeight ≤ clientHeight + 1`) failed everywhere even without the styles, because of two deliberate designs
  (see the decision below).
- **Forced colours (A5):** buttons already kept a 1px edge and the focus ring stayed solid, but four things broke:
  - the phone Menu button showed an empty circle (its lines are fills, which the mode paints in the page background);
  - display headings, set below 1.0 line height, had the mode's line backplates cut the foot of the line above ("local
    SEO" on Home);
  - the contact page's two cards looked the same, so which one was chosen was lost;
  - the contact form's progress bar disappeared (the "Step 1 of 3" text still said it).
  - Also only colour-marked, and fixed with them: the brief's chosen area, chosen chips, the finder's progress, the quick
    menu's active option and the enquiry demo's active step.
- **Already green:** A2 and A3 (Phase 2's tests: the skip link is the first Tab stop; nothing focused hides under the
  header or the consent prompt), A6 (T4/T5 and R4), A7 (M5 and H7), A9 (Lighthouse accessibility 1.00).

## What changed

- **Forced colours (8.2):** `@media (forced-colors: active)` rules in `src/styles/global.css` and in each component
  with its own mark:
  - `global.css`: buttons get a `ButtonText` edge, the focus ring `Highlight`, H1/H2 a 1.15 line height, a chosen chip
    a 2px `Highlight` border.
  - `Header.astro`: the Menu lines are drawn in `ButtonText` (`forced-color-adjust: none`).
  - `contact/index.astro`: the chosen card gets a 2px `Highlight` border.
  - `ContactForm.astro`: the progress bar in `GrayText` with the current step in `Highlight`; the chosen area a 2px
    `Highlight` border.
  - `Finder.astro`: the answered bar has an edge and a `Highlight` fill.
  - `QuickMenu.astro`: the active option gets a `Highlight` outline.
  - `EnquiryDemo.astro`: the active step gets a 4px `Highlight` edge.
  - The agent graph needed nothing: the mode leaves SVG paint alone, and it reads on both the dark and the light theme.
- **Nothing else changed on the page.** None of these rules apply outside forced colours.

## Decision made in this phase (Mann, 17 Nov 2026)

**A4 measures the real text.** The plan's formula fails on this site without any text spacing, for two designs that
are meant to overflow:

- every button label carries a copy of itself just below (the hover "roll"), hidden by the label's `overflow: hidden`
  until hover; ghost buttons have a hover fill waiting below in the same way;
- the heading line masks let descenders paint past their edge (`overflow-clip-margin: 0.12em`).

So A4 applies the formula to every clipping box in a button or heading at rest (reduced motion), with the hover copies
and fills set aside and the masks' paint margin allowed. The alternatives (a copy that exists only on hover, or a roll
that runs downward) would have changed the Phase 4 motion for the sake of the measure.

One near-miss checked by eye: the case-study title's line mask is about 1px taller inside than its edge plus margin at
375 and 1440 without the spacing ("Nest & Rest Cleaning", "Samp Hair & Spa"). Compared with and without the mask at 2×,
the "g" is whole: the extra is the font's descent metric, not ink. Nothing to fix.

## Tests changed, each naming its decision

None of the existing tests changed. New in `tests/e2e/design-gates.spec.ts`:

- **A1** (three tests, one per width): axe (WCAG 2.2 A/AA) on every built page at rest. The site.spec.ts axe tests keep
  checking pages with motion on.
- **A1 with overlays open:** the phone menu (375, 768), the quick menu with a search typed, a Home question open and the
  consent prompt, at 375, 768 and 1440.
- **A4:** WCAG text spacing on every page at three widths, measured as decided above.
- **A5:** forced colours, dark and light: every button's edge, the Menu lines, heading line height, the focus ring on
  the first four Tab stops, the chosen contact card and the progress bar. A mark counts as visible only if it differs
  from the page background. Checked against the code without the fixes: it reports all four failures in both themes.

## Gates

GATES

## Quality gates

QUALITY_GATES

## Numbers, Phase 7 → Phase 8

NUMBERS
