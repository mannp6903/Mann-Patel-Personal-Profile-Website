# Design upgrade, Phase 5: imagery (17 Nov 2026)

[`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 5, [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md) → Imagery.
Measured as in [Phase 0](phase-0-baseline.md); before = Phase 4 (live on mannpatel.me since 17 Nov 2026, PR #55).

## What changed

- **One frame system (5.1)**: `src/components/work/MediaFrame.astro` draws every project capture as one of three kinds.
  - `browser`: a desktop capture under a browser bar with the site's address.
  - `phone`: a phone capture in a bezel.
  - `plain`: a close-up on a white card with a hairline.
  - `ProjectMedia` (Home, /work/, the case-study heroes, the area pages) composes a browser and a phone frame. The
    case-study gallery now has browser and phone frames too, and the close-ups use plain frames.
  - Backdrops: `--pm-bg`, the dark surface by default and `--media-bg-1`/`-2` in the Selected Work band. The project's
    own colour (teal, pink) no longer tints the backdrop. Phase 3 had only swapped the base colour on Home; the tint
    stayed until now. The unused `tint` field is gone from `src/data/captures.ts`.
- **One media shadow**: `--shadow-media` is a plain shadow with no spread, so it works in `box-shadow` and in
  `drop-shadow()`. It is used by the frames, the portrait core in the agent graph (it had its own shadow) and the
  free-check receipt (likewise). `DESIGN.md` → Shape and depth documents it as the single exception to "depth comes from
  surfaces".
- **AVIF with a WebP fallback (5.2)**, at quality 55 for the captures and the avatar, and 60 for the graph's portrait:
  - Captures and the portrait use `<Picture formats={['avif']} fallbackFormat="webp">`, so there's no extra PNG or JPG
    copy. This covers the frames, the graph core, About, the free-check photo and the avatar.
  - Why 55: AVIF and WebP count quality differently. At 74, AVIF captures came out larger than WebP at 74 (800w: 35 KB
    against 30 KB), and Home grew by 26–37 KB at 768 and 1440. At 55 they look the same side by side and are about a
    fifth smaller than WebP.
  - Widths are finer at the small end (320, 400, 560…), so phones don't fetch a file twice as wide as they need.
  - Each image goes up to twice its widest shown size, or the full source when the file is narrower. The About portrait
    gained its full 1,254px size.
  - `sizes` was corrected where it overstated the shown width: the graph portrait on phones, 52vw → 48vw.
  - Every `<img>` records its source width (`data-src-w`) for gate G2.
  - `<picture>` is `display: contents`, so its image lays out exactly as a bare `<img>`.
- **Avatar (5.3)**: `src/assets/mann-patel-avatar.jpg` is a 360px head-and-shoulders square cut from the hero portrait
  by `scripts/make-avatar.mjs`. The phone greeting row uses it at 80/120px, so the face fills the 40px circle.
- **Line weights (5.4)**: four tokens, `--graph-stroke-fine` (1), `--graph-stroke` (1.5), `--graph-stroke-bold` (2) and
  `--graph-stroke-signal` (3), all with round ends.
  - The agent graph, the services scenes and the promise icons use only these.
  - The graph's spokes go from 1.25 to 1.5 (the regular weight). Every other weight is unchanged.
- **Loading**: the phone capture next to a page's main image is now always lazy. It sits below the first screen at 412
  and at 1440.
- **Owner inputs (5.5)**: no new photos, launched Samp captures or third project yet. The frame system takes them as
  they are added.

## Decisions made in this phase (Mann, 17 Nov 2026)

1. **G2, files too small for 2×.** Each is served at its full width and listed by name as needing a higher-resolution
   capture (owner), instead of re-capturing or showing them smaller.
2. **G1, lazy loading.** Images below the first screen at both 390–412 and 1440 are lazy; images in the first screen may
   load at once; at most one image per page has high priority. The hero portrait keeps loading immediately.
3. **G1, image size.** Judged as Lighthouse's older "properly size images" did: the file may be up to the shown size ×
   the screen's density.
   - Lighthouse 13.6's "Improve image delivery" compares files with the CSS size and ignores density. On its 1.75×
     phone it flags any image sharp enough for that screen; it already scored 0.5 on Home and the case study before
     this phase.
   - Its format check passes: there are no format warnings, now that captures are AVIF.

## Tests changed, each naming its decision

None of the existing tests changed. New:

- `tests/e2e/design-gates.spec.ts`: G1 and G2.
- `tests/unit/design-tokens.test.ts`: G3 (two tests) and G4.

Nothing was skipped or loosened.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| G1 | pass | › G1, on every built page at 412×823 (1.75×) and 1440×900, three checks: (1) every `<img>` has width, height and alt text, empty only on the two decorative images (the avatar beside the name, the 404 mark); (2) every image below the first screen at both sizes is lazy; (3) no file is over 1.3× what the screen needs when a smaller file would cover it. Lighthouse: no format findings |
| G2 | pass | › G2, on every built page at 390 and 1440: every capture and portrait has an AVIF source and a WebP image, and its `srcset` reaches 2× the shown width or the full source. Listed as needing a higher-resolution capture: see below |
| G3 | pass | Unit tests: every shadow is `--shadow-media`, `--shadow-pop`, `--signal-glow`, a focus ring or a lime glow on a live mark. MediaFrame and ProjectMedia use only tokens. Every file that reads the capture data hands the images to MediaFrame |
| G4 | pass | Unit test: every `stroke-width` in the graph, the scenes and the promise icons is a `--graph-stroke*` token, and the scenes and icons have round ends |
| G5 | needs owner | At least 3 real projects and 1 more professional photo for 9.5 (4+ projects, 2+ photos for a 10). Today: 2 projects, 1 portrait |

**Needing a higher-resolution capture (owner):** these are served at their full width, which is less than twice their
widest shown size.

- Both desktop captures (1,440px, shown up to about 1,190px on a case study).
- The Nest & Rest close-ups (920–1,218px, shown up to about 660px).
- Samp's two close-ups (660px and 340px).
- Samp's phone capture (360px, shown at 320px).
- The portrait on About (1,254px, shown up to about 715px at 768).

## Quality gates

| Check | Result |
| --- | --- |
| `npm test` | 158/158 |
| `npm run build` | ✓ |
| `npx playwright test --trace off` | 220/220 |
| `npm run build:cloudflare` | ✓ (0 errors, the same 2 warnings) |
| Lighthouse CI assertions | ✓ |

The AVIF quality was lowered from 74 to 55 after this run (see the numbers), a change to file size only. That commit
passed CI (tests, build, browser suite, Cloudflare build), and Home's weight was measured again.

## Numbers, Phase 4 → Phase 5

**Lighthouse** (mobile, medians of 3): every page scores 1.00 for performance, accessibility and SEO, with no
image-format findings.

- **LCP:** Home 806 → 799 ms; the case study 796 → 790 ms; the others 790–805 ms.
- **`/pricing/`:** a median of 1,404 ms in the full run (runs of 794, 1,404 and 1,502 ms, all on the same text
  element with under 150 ms of render delay). Five runs on their own: 795–801 ms. Simulated-timing noise; nothing on
  that page changed.

**Page weight at load** (AVIF at quality 55):

| KB (images in brackets) | 375 | 768 | 1440 |
| --- | --- | --- | --- |
| Home | 309 (49) → 285 (23) | 334 (75) → 332 (70) | 345 (85) → 331 (69) |
| Case study | 235 (42) → 224 (27) | 231 (38) → 234 (36) | 258 (66) → 251 (54) |
| About | 192 (6) → 189 (4) | 205 (20) → 197 (12) | 197 (12) → 192 (7) |

- **Home is under 300 KB on phones again** (285 KB; Phase 7's P2 target is 300).
- **Before the quality fix:** at AVIF quality 74, Home was 372 and 370 KB at 768 and 1440 (see "What changed").
- **Unchanged:** nothing runs after 15 s on any page; CLS stays 0–0.004 in the lab; Home has 1,212 → 1,223 DOM
  elements (the `<picture>` wrappers).

## Notes for later phases

- G5 needs Mann's inputs: a third project, the launched Samp captures, and more photos. Higher-resolution captures
  (2,880px desktop, double-size close-ups) would clear the G2 list.
- The D7 Archivo trial is still to come.
