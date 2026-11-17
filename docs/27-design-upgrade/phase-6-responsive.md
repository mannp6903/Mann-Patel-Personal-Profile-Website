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
  - Services tiles (`ss-tile`): a tile under 20rem gets the smaller scene (11rem). This used to follow the screen
    (under 40em), which gave a 302px tile a 176px scene at 600 and a 240px one at 640. Phones and desktops look as
    before; from 640 to about 830 the scene in the small tiles is now 176px instead of 240, and the tiles are a little
    shorter.
  - Promise tiles (`rule`): from 24rem the icon sits beside the text (screens of about 940–1023px, where the tiles are
    widest). The text uses `text-wrap: pretty`, so the narrower column doesn't leave "name." or "down." alone.
  - Selected Work cards (`sw-card`): picture and words side by side from 58rem of the card's own width. This used to be
    64em of screen; at 1024 the result is the same.
  - **Tried and dropped:** a services scene beside the words in a small tile 30rem or wider. At 1280–1920 it left the
    words a 15rem column: headings and links on two lines, "· $3,350" alone, and taller tiles at 1280. The before and
    after captures showed it was worse, so the tiles stack as in Phase 5.
- **Phones held sideways (6.3)**: at 844×390 the button was never trapped (it follows the H1), but the hero was about 3
  screens tall, because the graph used its tall layout at up to 480px wide.
  - The graph now uses its wide, left-to-right layout on landscape phones, at most about one screen tall. Its script
    uses the same media query, so only that layout animates.
  - The hero is now 2.27 screens (was 2.97), and Home at 844×390 is 0.7 screens shorter.
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
| R6 | pass (automated half and screenshot review); real-phone check needs owner | › R6: no short lone word on an H1/H2 line at the ten sizes, on every page, plus my review of the matrix captures. For a 10, the plan asks for a check on a real iPhone (Safari) and a real Android phone (Chrome): Mann |

## Quality gates

| Check | Result |
| --- | --- |
| `npm test` | 158/158 |
| `npm run build` | ✓ |
| `npx playwright test --trace off` | 225/225 (220 before; the five new gates) |
| `npm run build:cloudflare` | ✓ (0 errors, the same 2 warnings) |
| Lighthouse CI assertions | ✓ |

## Numbers, Phase 5 → Phase 6

**How it was measured.** The Phase 5 captures in `qa-output/` had last been taken from a preview build (`npm run
build`). A preview build includes the draft area pages (Markham, Pickering, East York, Ajax) in the footer and doesn't
show the consent prompt. That made every page look 150–180px shorter in Phase 6 at 768 and up, for reasons unrelated
to this phase. So I rebuilt the Phase 5 commit (`f7599a0`) with `npm run build:cloudflare` and captured it again, as
Phase 0 specifies. The numbers below compare two production builds. (The Phase 5 record's page weights came from the
preview build: Home at 375 is 287 KB in production, not 285.)

**Lighthouse** (mobile, medians of 3): every page scores 1.00 for performance, accessibility and SEO, as before.

- **LCP:** Home 799 → 807 ms; the case study 790 → 796 ms; the others 788–797 ms.
- **`/pricing/`:** 795 ms. Phase 5's full run had a 1,404 ms median here, which turned out to be noise.
- **Total blocking time:** 11–54 ms on every page.

**Page weight, page length and elements** (production builds, lab, no throttling):

| | Phase 5 | Phase 6 |
| --- | --- | --- |
| Home, KB at load, 375 / 768 / 1440 | 287 / 334 / 333 | 289 / 336 / 335 |
| Home, elements | 1,224 | 1,234 (the tiles' inner wrappers) |
| Home hero at 844×390, screens | 2.97 | 2.27 |
| Home at 844×390, screens tall | 28.54 | 27.67 |
| "Selected work" heading at 844×390, y | 1,302px | 1,027px |
| Home at 768×1024, screens tall | 10.46 | 10.40 (the smaller scene in narrow services tiles) |
| Home at 1280, 1440, 1920, screens tall | 10.85, 10.07, 8.79 | the same |
| Contact at 375, screens tall | 3.70 | 3.72 (the 44px phone link) |

- **Unchanged:** nothing runs after 15 s on any page; CLS stays 0–0.004 in the lab; the other pages weigh within 1 KB
  of Phase 5.
- **Everything else is the same:** the H1 and H2 sizes at all ten matrix sizes, and the hero height on phones and
  desktops (1.34 at 375×812, 0.70 at 768×1024).

## Notes for later phases

- R6 for a 10 needs Mann: the hero and section headings on a real iPhone (Safari) and Android phone (Chrome).
- The package line in the narrow services tiles (640–1023) wraps before "· $650" or "· $3,350". It did in Phase 5
  too; the price stays with its separator, so I left it.
- The D7 Archivo trial is still to come.
