# Design upgrade, Phase 6: responsive hardening (17 Nov 2026)

[`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 6, [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md) →
Responsiveness. Measured as in [Phase 0](phase-0-baseline.md); before = Phase 5.

## What changed

- **Every gate across the device matrix (6.1)**: the new gates run on every built page.
  - R1: all ten matrix sizes, from 320×568 to 1920×1080 plus 844×390.
  - R4: 320, 390 and 768.
  - R5: 320 and 640, which is 1280 at 200% zoom.
  - R6: all ten sizes.
- **Container queries (6.2)**: a tile or card whose inside changes with its own width is now a container, with one inner
  wrapper laid out by `@container`. The screen-level grids that place them keep their media queries.
  - Services tiles (`ss-tile`): a small tile 30rem or wider puts its scene beside the words. At 1440 the B and C tiles
    are now as tall as their text.
  - Promise tiles (`rule`): from 24rem the icon sits beside the text.
  - Selected Work cards (`sw-card`): picture and words side by side from 58rem of the card's own width. This used to be
    64em of screen; at 1024 the result is the same.
- **Phones held sideways (6.3)**: at 844×390 the button was never trapped (it follows the H1), but the hero was about 3
  screens tall, because the graph used its tall layout at up to 480px wide.
  - The graph now uses its wide, left-to-right layout on landscape phones, at most about one screen tall. Its script
    uses the same media query, so only that layout animates.
  - The hero is now 2.22 screens.
- **Reflow (6.4)**: at 320px and at 640px (1280 at 200% zoom), nothing scrolls sideways and no two controls overlap
  (R5), on every page.
- **Tap targets (R4)**: four kinds of standalone text link were under 44px tall. They now use `.link--tap` (inline-flex,
  44px tall, underline kept under the text): the phone link in the contact actions, the email link on /contact/, the
  "Request a quote" links in the package comparison, and the service links on the case studies.
- **Headings (R6)**: H1s and H2s keep `text-wrap: balance`. The one heading that left a short word alone, "Samp Hair &
  Spa" on /work/ at 1024 ("Spa" alone), now keeps "Hair & Spa" together with non-breaking spaces. The wording is
  unchanged.
  - I tried `text-wrap: pretty`; it left more lone words (most headings have a maximum width in characters, so pretty
    can't pull a second word down), so I reverted it.

## How the new gates measure (and why)

- **R4, links inside a sentence are exempt** (WCAG 2.5.8's inline exception), as are a checkbox or radio inside a big
  label. Content inside a closed accordion is skipped (`checkVisibility()`); Chrome keeps it laid out but unseen.
- **R5 compares each control's line boxes**, so a link that wraps onto two lines isn't one rectangle spanning both. Bars
  pinned to the screen (fixed or sticky) are left out: content scrolls under them by design, and gate A3 covers focus.
  Closed accordions are skipped, as in R4.
  - The first version reported 78 "overlaps"; the corrected measure found none real.
- **R6 counts an orphan as a short word left alone** (under 40% of the heading's widest line) at the end of an authored
  line.
  - A heading written in lines (`ui/Heading.astro`'s line masks, the hero's two lines) may end a line on one word by
    design ("Asked before / *buying.*").
  - A long word that fills its own line isn't counted: "businesses." at 320px, where "small businesses." can't fit at
    H1 size.
  - R6 is a manual gate in the plan; this is the automated half, and I also reviewed the matrix screenshots.

## Tests changed

None of the existing tests changed. New in `tests/e2e/design-gates.spec.ts`: R1, R2, R4, R5 and R6. R3 is Phase 2's.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| R1 | pass | › R1: no sideways scroll on any built page (and the 404) at any of the ten matrix sizes |
| R2 | pass | › R2: on every built page the H1's size never drops across 14 widths from 320 to 1920 |
| R3 | pass | Phase 2's › R3 (1.34 screens at 375×812, 0.70 at 768×1024) |
| R4 | pass | › R4: every link and button outside running text is at least 44×44px at 320, 390 and 768, on every page |
| R5 | pass | › R5: at 320px and 640px (1280 at 200% zoom), no sideways scroll and no overlapping controls, on every page |
| R6 | pass (automated half); real-phone check needs owner | › R6: no short lone word on an H1/H2 line at the ten sizes, on every page, plus my review of the matrix captures. A check on a real iPhone (Safari) and Android phone (Chrome) needs Mann, for a 10 |

## Quality gates

QUALITY_GATES

## Numbers, Phase 5 → Phase 6

NUMBERS
