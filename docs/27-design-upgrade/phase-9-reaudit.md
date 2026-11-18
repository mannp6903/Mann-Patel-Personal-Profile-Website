# Design upgrade, Phase 9: the re-audit (18 Nov 2026)

[`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 9, §5 (the gates) and §6 (how a score is given),
against [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md). The method is the audit's: a code read, the screenshot matrix and the
measurements, scored gate by gate. Measured as in [Phase 0](phase-0-baseline.md), on a production build
(`npm run build:cloudflare`) of `cf28f38`, the code live on mannpatel.me since 18 Nov 2026 (PR #60).

The audit itself changed nothing. Mann then approved every fix it listed, the small-size wordmark cut included (18 Nov
2026: "Record + fixes + Medium logo"), and they were made in this phase with a test for each gate. The tables show the
gates as the re-audit found them and after the fixes.

## The score

| # | Category | Audit (16 Nov) | Re-audit | After the fixes | Still failing |
| --- | --- | :-: | :-: | :-: | --- |
| 1 | Hero / first impression | 6 | 9.5 | **9.5** | none (H8 is for a 10) |
| 2 | Landing page structure and flow | 7 | 9.0 | **9.0** | S5 (no real testimonial yet: owner) |
| 3 | Typography | 5 | 9.0 (T6) | **9.5** | none |
| 4 | Colour and brand consistency | 6 | 8.5 (C4, C5, C6) | **9.5** | none |
| 5 | Layout, spacing, hierarchy | 6 | 8.75 (L1, L4) | **9.5** | none |
| 6 | Graphics and imagery | 7 | 9.0 | **9.0** | G5 (2 projects, 1 photo: owner) |
| 7 | Motion and animation | 6 | 9.25 (M8) | **9.5** | none |
| 8 | UX and navigation | 7 | 9.5 | **9.5** | none (U5 is for a 10) |
| 9 | Responsiveness | 6 | 9.5 | **9.5** | none (R6's real-phone check is for a 10) |
| 10 | Performance and polish | 8 | 9.5 | **9.5** | none (P5 is for a 10) |
| 11 | Accessibility | 8 | 9.5 | **9.5** | none (A8 is for a 10) |
| | **Overall** | **65** (72 of 110) | **92** (101 of 110) | **94** (103.5 of 110) | |

**Two categories are not 9.5, and both wait on Mann:** Structure needs S5 (one real testimonial) and Imagery needs G5
(a third real project and one more professional photo). With those, every category is 9.5: 104.5 of 110 = **95**. 98
and above needs the remaining owner gates (H8, U5, P5, A8, R6 on real phones), as §0 of the plan says.

**How the scores below 9.5 were set (§6: "scored down from 9.5, by the share of gates failing and how serious each
is").** One rule for every category, so the numbers can be checked:

- −0.25 for a trivial failure (one rule or one document line);
- −0.5 for a minor one (a few places, a small visual effect) or a missing owner input the page is ready for;
- −1.0 for a serious one (none found).

So, at the re-audit, Colour was 9.5 − 0.5 (C4) − 0.25 (C5) − 0.25 (C6) = 8.5, and Layout 9.5 − 0.5 (L1) − 0.25 (L4) =
8.75.

## Gates by category

› marks a test in `tests/e2e/design-gates.spec.ts`, unit tests are in `tests/unit/design-tokens.test.ts`. Every [auto]
gate ran in the quality runs below; "my review" marks a [manual] gate, with what was looked at. "Fixed" marks a gate the
re-audit failed and the fixes turned green; each new test was checked to fail on the code before the fixes.

### Hero (9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| H1 | pass | › H1 |
| H2 | pass | › H2 and H3: the hero text holds five things |
| H3 | pass | › H2 and H3: only the free-check button is lime |
| H4 | pass | › H4, all ten matrix sizes |
| H5 | pass | › H5 (D6 declined: from 390px) |
| H6 | pass | › H6: the H1 is the LCP element, nothing shifts, the entrance is done by 1.7 s |
| H7 | pass | › H7, consent prompt open and closed |
| H8 | needs owner | Five-second test (§7): 4 of 5 owners. For a 10 |

### Structure (9.0)

| Gate | Result | Evidence |
| --- | --- | --- |
| S1 | pass | › S1 |
| S2 | pass | › S2 |
| S3 | pass | › S3 at 375, 768 and 1440 |
| S4 | pass | › S4 (D9: at most 11 screens at 390×844) |
| S5 | **fail (needs owner)** | No real testimonial is rendered: there is none to show yet (`src/data/reviews.ts` is empty by rule). Needed for 9.5 |

### Typography (9.0 → 9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| T1 | pass | Unit: every font size is a `--fs-*` token or `inherit` |
| T2 | pass | › R2 (the same check): the H1 never shrinks from 320 to 1920 on any page |
| T3 | pass | › T3 |
| T4 | pass | › T4 and T5 at 375, 768, 1440 |
| T5 | pass | › T4 and T5 |
| T6 | **fixed** (was fail) | › T6: every body-size block on every page at 375, 768, 1024, 1280, 1440 and 1920 keeps 72 characters a line or fewer, at a line height of 1.5–1.7 (finding 1) |
| T7 | pass (my review) | Zoomed captures (2×) at 1440 of the 13 longest H1s and the free-check H2, the tightest set at line height 0.92–1.02 (Home, About, Vision, the guides, the service pages). No glyph touches another; the closest pairs ("get" over "(within", "Why" over "Google") keep a clear gap |

### Colour and brand (8.5 → 9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| C1 | pass | › C1 at 375, 768 and 1440 |
| C2 | pass | Unit: no hex colours outside `tokens.css` |
| C3 | pass | › A1 at 375, 768 and 1440 (axe's colour-contrast rule is part of it): 0 violations on every page |
| C4 | **fixed** (was fail) | › C4: at all ten matrix sizes the header wordmark is the small cut (Geist Medium), at least 13px tall below 1024 and 16px from 1024, with one cap height of clear space to every other control, the screen edge and the bar's edges (finding 2) |
| C5 | **fixed** (was fail) | My review: eyebrows carry the Λ and the round dot means "live" only (DESIGN.md → Colour). The two cuts, clear space and minimum sizes are now in DESIGN.md → Colour → The wordmark (finding 3); › C4 checks the header's clear space |
| C6 | **fixed** (was fail) | Unit › C6: every colour token in `tokens.css` is in DESIGN.md → Colour with its value (finding 4) |

### Layout (8.75 → 9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| L1 | **fixed** (the manual part was fail) | › L1: the three Home heads are sticky at 1440. › L1 (manual part, as a check): on every page at 1440, no head leaves its column empty for more than 35% of the screen beside its content (finding 5); the captures confirm it |
| L2 | pass | › L2 |
| L3 | pass | › L3 |
| L4 | **fixed** (the spacing part was fail) | My review: no two adjacent Home sections share a layout (as in Phase 3; unchanged since). › L4: on every page at 375 and 1440, eyebrow → heading is `--head-gap-1` and heading → intro `--head-gap-2`, ±1px (finding 6) |

### Imagery (9.0)

| Gate | Result | Evidence |
| --- | --- | --- |
| G1 | pass | › G1, and Lighthouse's image audits in the CI run |
| G2 | pass | › G2 |
| G3 | pass (my review) | Unit: one shadow set, captures drawn only by `MediaFrame.astro` on token backdrops. The matrix captures show one frame style |
| G4 | pass (my review) | Unit: the scenes and promise icons draw with the graph's stroke tokens; seen in the captures |
| G5 | **fail (needs owner)** | 2 real projects and 1 professional photo (the portrait). 9.5 needs 3 projects and 1 more photo |

### Motion (9.25 → 9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| M1 | pass | Unit: one token set; no literal durations in CSS or script |
| M2 | pass | › M2 and P4 |
| M3 | pass | › M3 |
| M4 | pass | Unit: page transitions ≤ 450 ms |
| M5 | pass | › M5 |
| M6 | pass | › M6 |
| M7 | pass | › M7 |
| M8 | **fixed** (was fail) | Unit › M8: every `:hover` rule has a `:focus-visible`, `:focus-within` or `:focus` twin, apart from Phase 4's hover-only list (finding 7) |

### UX (9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| U1 | pass | › U1; `tests/e2e/site.spec.ts` › the phone menu fits one screen at 320×568 |
| U2 | pass | › U2 (D5) |
| U3 | pass | › U3 and A2; › H7 |
| U4 | pass | › U4 |
| U5 | needs owner | Task test (§7): 5 of 5 owners send the free-check request in under 60 s. For a 10 |

### Responsiveness (9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| R1 | pass | › R1, every page at the ten matrix sizes |
| R2 | pass | › R2 |
| R3 | pass | › R3 |
| R4 | pass | › R4 |
| R5 | pass | › R5 |
| R6 | pass (my review) / needs owner | › R6: no display heading ends on a one-word line at any matrix size. The Phase 9 matrix captures were looked through (5 pages × 10 sizes): nothing out of place. One note: at 320, 1024 and 1920 the Home H1's second line breaks as "for Toronto / small / businesses.", leaving "small" alone in the middle (About's H1 does the same with "service" at 320 and 1024). It is not an orphan by the gate's definition (Phase 6: a short word left alone at the end of a line), and the heading reads as stacked display type. The real-iPhone and Android check is Mann's, for a 10 |

### Performance (9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| P1 | pass | Lighthouse CI, medians of 3 on eight pages: performance 1.00 on every page (Home ≥ 0.97), LCP 786–808 ms (≤ 1.8 s), CLS 0 (≤ 0.02), TBT 8–31 ms (≤ 100 ms) |
| P2 | pass | › P2: Home at 375 loads 291 KB decoded (≤ 300), 26 KB script (≤ 60), 38 KB fonts (≤ 70), measured as Phase 0 set out (1× density). At 2× Home is 326 KB (Phase 7, deviation 4) |
| P3 | pass | › P3: Home has 923 elements at 375 and at 1440 (≤ 950) |
| P4 | pass | › M2 and P4 |
| P5 | needs owner | Field data from real visitors (Search Console → Core Web Vitals). For a 10 |
| P6 | pass | [`docs/stack.md`](../stack.md) → CSS delivery |

### Accessibility (9.5)

| Gate | Result | Evidence |
| --- | --- | --- |
| A1 | pass | › A1 at 375, 768 and 1440 on every page; › A1 with overlays open |
| A2 | pass | › U3 and A2 |
| A3 | pass | › A3 |
| A4 | pass | › A4 (the real text measured, Mann's decision in Phase 8) |
| A5 | pass | › A5, dark and light contrast themes |
| A6 | pass | › T4 and T5; › R4 |
| A7 | pass | › M5; › H7 |
| A8 | needs owner | VoiceOver (iOS Safari) and NVDA pass. For a 10 |
| A9 | pass | Lighthouse accessibility 1.00 on all eight CI pages |

## Findings, and the fix made for each

Found by the audit, then fixed with Mann's approval (18 Nov 2026). No wording changed.

1. **T6: body text runs too wide in a few places, and one list is set tight.** Every paragraph at body size
   (`--fs-base`) and its line height, on all 32 pages at 375, 768, 1024, 1280, 1440 and 1920, measuring each real line
   in `ch` of its own font:
   - **Too wide:** the "Published prices" note on the two area pages (`/web-design-scarborough/`,
     `/web-design-north-york/`) and the package note on the two trade pages (`/websites-for-cleaning-companies/`,
     `/websites-for-salons-and-spas/`) run 76–81ch at 1024 and 109–112ch from 1440. Two checklist lines on
     `/services/website-redesign/` reach 90–92ch at 1280, and one on `/services/web-design/` 73ch at 1024.
   - **Line height:** the free-check band's list (the four steps, on every page that carries the band) is body size at
     1.45, under 1.5.
   - **Everything else passes:** body paragraphs are at 1.6 and at most 68ch (the `--measure`).
   - **Outside the gate but close to it:** a few captions at `--fs-sm` (15px, line height 1.5) run 73–113ch (the
     add-on notes on `/services/`, the sample notes on three service pages, a note on `/pricing/` at 1024).
   - **Fixed (CSS only):**
     - a note under a section heading keeps `--measure` (`:where(.section-head) > p` in `global.css`, below `.lead`'s
       44ch);
     - the service pages' checklist lines and the intros above their samples keep it (`services/[slug].astro`), and so do
       the add-on notes on `/services/` and the note under the package table (`PackageCompare.astro`);
     - the free-check band's list is at 1.6 (`FreeCheck.astro`).
2. **C4: the header wordmark is smaller than the gate and drawn from Regular.**
   - **Today:** 11px tall at 320, 12.2px at 360, 12.75px at 375, 13px from about 382px, and 14px from 1024.
   - **The gate:** at least 13px on phones and 16px from 1024, drawn from Geist *Medium* outlines (the audit's W10:
     "a small-size cut, Medium/500 outlines, tracking +20%, for uses under 20px").
   - **The cut was never scheduled:** no phase of the plan lists it as a task, so it was never built.
   - **It fits:** at 320 the header holds only the logo and Menu, so a 13px wordmark (139px wide in the Medium cut)
     leaves 105px before Menu.
   - **Fixed, with Mann's approval of the mock-up:** a small-size cut, drawn from Geist at weight 500 with +20% tracking
     and the same signal gap.
     - `scripts/wordmark_cut.py` prints its outlines, and `ui/Wordmark.astro` takes `cut="small"`.
     - The header uses it at 13px (below 64em) and 16px (from 64em); at 320 it is 139px wide, about 100px clear of Menu.
     - The footer, the brand files and the sharing images keep the regular cut (20px and up).
3. **C5: clear space and minimum sizes are not documented.** The audit's rule ("clear space = one Λ cap height on every
   side; minimum 12px tall for the small-size cut, 20px for the regular cut") belongs in `DESIGN.md` with C4.
   - **Why it waited:** written before C4 was fixed, it would have contradicted the header, which used the Regular cut
     at 11–14px.
   - **Fixed:** DESIGN.md → Colour → The wordmark: the two cuts, clear space (one Λ cap height on every side) and
     minimum sizes (12px small, 20px regular; below that, the favicon's stacked mark).
4. **C6: `DESIGN.md` → Colour is out of date.**
   - **Mockup backdrops:** they are listed as `#BFC9C9` / `#D5C4C9`, the teal and pink they were before Phase 3. In
     `tokens.css` they are `color-mix()` tints of the paper band toward `--surface` (about `#BFBFBA` and `#A3A3A0`).
   - **Not listed:** `--signal-strong` (`#E4FF73`), `--focus` and `--focus-on-light`, `--accent-on-light` (`#637B05`,
     currently unused), `--error-wash` and `--warn-wash`.
   - **Fixed (documents only):** the table lists every token with its value. A unit test (C6) now fails if a colour
     token is added to `tokens.css` without its row, or a value changes in one place only.
5. **L1 (manual part): empty columns beside long content on inner pages.** At 1440×900, a two-column section whose
   head isn't sticky leaves its head column empty, once the head is passed, for longer than 35% of the screen (315px).
   - **Home passes:** its sticky heads (Prices, How I work, the questions) stay beside their content, as Phase 3
     recorded.
   - **Seven places fail**, by the page height left empty under the head:
     - `/services/`, add-ons ("Print and social content"): 456px (51%);
     - `/web-design-north-york/`, "Neighbourhoods I serve.": 489px (54%);
     - `/about/`, "What I do, and how.": 379px (42%);
     - `/services/local-visibility/`, the AI search check: 374px (42%);
     - `/free-check/`, "Before you send it": 358px (40%);
     - `/services/web-design/`, the redesign section: 345px (38%);
     - `/pricing/`, "What moves it up or down.": 344px (38%).
   - **Fixed (CSS only):** from 64em the head column of every two-column section is sticky, as on Home (the plan's own
     fix for dead zones, W9). It's in all eleven layouts of this kind: `about.astro`, `pricing.astro`, `services.astro`,
     `services/[slug].astro`, `web-design-[area].astro`, `free-check.astro`, `IndustryPage.astro` and
     `ServiceDetails.astro`, plus the three that already had it.
6. **L4 (spacing part): eyebrow → heading → lead spacing is not identical everywhere.** Every eyebrow and its heading
   and lead, on all pages, at 375 and 1440 (`--head-gap-1` is 12 / 16.8px there, `--head-gap-2` 16 / 25px):
   - **Correct:** 67 section heads and 16 page heads use the tokens exactly.
   - **Heads built as a `.stack`:** 45 heads sit 3–3.6px further apart (15 / 20.4px), because the eyebrow there is
     `inline-flex` and takes the line's height. They are the questions, About's sections, most sections of the service,
     area and trade pages, the finder and the process strip.
   - **Fixed gaps:** some page heads use 24px for both gaps (About, the eight guides, the "received" page, the
     free-check page), and the legal pages 16px.
   - **The free-check page's own sections:** 16, 19 and 32px.
   - **The question heads' lead:** 14 / 21px instead of 16 / 25px (Vision's 12px).
   - **Correction:** Phase 3 recorded "Head spacing is `--head-gap-1/2` everywhere". That was checked in the CSS, not
     measured, and it is not true for the heads above.
   - **Fixed (CSS only):**
     - In `global.css`, an eyebrow in a `.stack` is block-level (`display: flex; width: fit-content`).
     - Also in `global.css`, a split heading (`[data-split]`) is `display: flow-root`, so its last line mask's negative
       margin no longer collapses into the next gap.
     - In `global.css`, what follows an eyebrow and its heading in a stack sits `--head-gap-2` below the heading.
     - The page heads (About, the guides, the received page, the free-check page, the legal pages), About's vision
       section and the free-check page's sections now use PageHead's pattern: rows `--head-gap-2` apart, and the eyebrow
       pulled up to `--head-gap-1`.
7. **M8: one hover rule has no keyboard twin.** `.link.link--tap:hover` (the stand-alone links' underline fade, added
   18 Nov 2026 in the post-launch fixes) has no `:focus-visible` counterpart; every other `:hover` rule on the site
   has one (checked by script). Keyboard focus still shows the focus ring, so nothing is lost, but the gate asks for
   the match.
   - **Fixed:** `.link.link--tap:focus-visible` fades the underline as hover does (`global.css`).

## Since the plan: changes outside its tasks

- **The scroll-condense is gone (18 Nov 2026, Mann's report).** Task 4.8's "MΛ" condense read as the logo
  disappearing, so the header keeps the full wordmark at every scroll position. No gate depends on it.
- **The signal gap (18 Nov 2026, Mann's choice).** Every Λ has a small slanted break in its right leg. C1 and C2 are
  unaffected (the Λ's were already counted as the wordmark).
- **D7:** Geist stays (the Archivo trial in Phase 7 wasn't adopted).

## Quality gates

| Check | Re-audit (`cf28f38`) | After the fixes (`e8634d9`) |
| --- | --- | --- |
| `npm test` | 158/158 | 160/160 (M8 and C6 are new) |
| `npm run build` | ✓ | ✓ |
| `npx playwright test --trace off` | 236/236 (12.0 min) | 240/240 (12.5 min; T6, C4, L1 and L4 are new) |
| `npm run build:cloudflare` | ✓ (0 errors, the same 2 warnings: the enquiry email address and the form-token secret live in Cloudflare, not in the build) | ✓ (the same) |
| Lighthouse CI assertions | ✓ (every assertion, judged on the median run) | ✓ |

**After the fixes**, nothing measured moved outside noise:
- **Lighthouse** (medians of 3): 1.00 for performance, accessibility and SEO on all eight pages, LCP 795–886 ms, CLS 0,
  TBT 12–45 ms. The guide's 886 ms median includes a 1.5 s run (simulated-timing noise; its other runs are 802 and 886).
- **Home:** 923 elements, 291 KB at 375, nothing running after 15 s.
- **Page length:** Home at 390×844 is 10.94 screens (was 10.92: the free-check list's taller lines); the other pages
  moved by less than 0.03 screens.

## Numbers, baseline (Phase 0) → Phase 9

**Lighthouse** (mobile, simulated, medians of 3), Phase 0 → Phase 9:

| Page | Performance | Accessibility | SEO | LCP ms | CLS | TBT ms |
| --- | --: | --: | --: | --: | --: | --: |
| `/` | 0.98–0.99 → 1.00 | 1.00 | 1.00 | 799 → 799 | 0 | **127** → 31 |
| `/services/` | 1.00 | 1.00 | 1.00 | 789 → 798 | 0 | 18 → 18 |
| `/services/web-design/` | 0.99–1.00 → 1.00 | 1.00 | 1.00 | 1,504 → 789 | 0 | 35 → 21 |
| `/pricing/` | 0.99–1.00 → 1.00 | 1.00 | 1.00 | 1,506 → 801 | 0 | 30 → 15 |
| `/contact/` | 1.00 | 1.00 | 1.00 | 789 → 807 | 0 | 4 → 8 |
| `/work/nest-and-rest-cleaning/` | 0.99–1.00 → 1.00 | 1.00 | 1.00 | 1,582 → 808 | 0 | 47 → 27 |
| `/guides/how-much-does-a-website-cost-in-toronto/` | 1.00 | 1.00 | 1.00 | 780 → 786 | 0 | 37 → 13 |
| `/web-design-scarborough/` | 1.00 | 1.00 | 1.00 | 796 → 795 | 0 | 25 → 21 |

Best practices is 1.00 everywhere except `/contact/` at 0.96, as it was before the upgrade.

**Lab** (`scripts/design-shots.mjs`, production build, unthrottled, decoded KB at load, 1× density):

| | Phase 0 | Phase 9 |
| --- | --- | --- |
| Home, elements | 1,202 | 923 |
| `/services/`, case study, About, Contact, elements | 795, 774, 806, 898 | 614, 620, 628, 709 |
| Home, KB at load at 375 / 768 / 1440 | 290 / 316 / 327 | 291 / 338 / 337 |
| Home, script / fonts | 21 / 38 KB | 26 / 38 KB |
| Running 15 s after load, Home | 37 (all infinite) | 0 |
| CLS (lab), all five pages | 0–0.0006 | 0–0.0043 (Home at 768) |
| LCP element | Home: the H1. Elsewhere often the consent prompt's text | Home: the H1. Elsewhere the page's own lead or image |

**Type and length** (Home):

| | Phase 0 | Phase 9 |
| --- | --- | --- |
| H1 ÷ largest H2 at 375 / 768 / 1440 | 0.74 / 1.11 / 0.48 | 1.3 / 1.46 / 1.6 |
| H1 at 768 → 1024 (should never shrink) | 72.2 → 49.6px | 61.6 → 74.7px |
| Screens at 390×844 | 12.73 | 10.92 |
| Hero, screens at 375×812 / 768×1024 | 1.70 / 1.65 | 1.34 / 0.70 |
| Selected Work heading at 390 / 1440 | 1,552 / 1,008px | 1,244 / 997px |

Captures (made by the run, not kept in the repository; `qa-output/` is ignored): `qa-output/design/phase-9/` (ten
sizes, five pages, first screen and full page) and `qa-output/design/compare-baseline-phase-9/` (baseline beside Phase 9
at 375, 768 and 1440).

## Owner items (Tier B), for Mann

- **For 9.5:** S5 (at least one real testimonial) and G5 (a third real project and one more professional photo).
- **For a 10:** H8 (five-second test), U5 (task test), P5 (field data), A8 (VoiceOver and NVDA), R6 (a real iPhone and
  Android phone).
- **Noted earlier:** G2's captures are limited by their sources; P2 at 2× density is 326 KB (the sharper captures);
  D7 kept Geist.
