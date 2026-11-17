# Design upgrade, Phase 0: baseline (17 Nov 2026)

The numbers every later phase of [`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) is compared with. Nothing on the
site changed in this phase.

## How it was measured

| | |
| --- | --- |
| Site code | Default branch at `616b27c` (#51), plus the plan and audit documents |
| Build | `npm run build:cloudflare` (the production build: GA4 ID set, so the consent prompt shows as for a first visit) |
| Captures and lab numbers | `node scripts/design-shots.mjs --serve dist/client --metrics --label baseline`: Playwright 1.63 Chromium (headless), Node 22, a cloud machine, no throttling, consent prompt open |
| Lighthouse | `lhci collect` + `lhci assert` with `lighthouserc.json` (8 URLs × 3 runs, mobile, simulated throttling), `@lhci/cli` 0.16.1 with Lighthouse 13.6.0. CI uses `treosh/lighthouse-ci-action@v12`, whose Lighthouse version may differ |
| Quality gates | `npm test` 146/146 · `npm run build` ✓ · `npx playwright test --trace off` 185/185 · `npm run build:cloudflare` ✓ (0 errors, 2 expected warnings about secrets the build can't see) · Lighthouse CI assertions ✓ |

The lab LCP below is unthrottled (60–130 ms), so it's only useful for comparing runs on the same machine. The gate
numbers for speed are Lighthouse's (P1).

## Lighthouse CI (medians of 3 runs; performance shows the range)

| Page | Performance | Accessibility | SEO | LCP ms | CLS | TBT ms | Transfer KB |
| --- | --: | --: | --: | --: | --: | --: | --: |
| `/` | 0.98–0.99 | 1.00 | 1.00 | 799 | 0 | **127** | 160 |
| `/services/` | 1.00 | 1.00 | 1.00 | 789 | 0 | 18 | 79 |
| `/services/web-design/` | 0.99–1.00 | 1.00 | 1.00 | 1,504 | 0 | 35 | 80 |
| `/pricing/` | 0.99–1.00 | 1.00 | 1.00 | 1,506 | 0 | 30 | 77 |
| `/contact/` | 1.00 | 1.00 | 1.00 | 789 | 0 | 4 | 91 |
| `/work/nest-and-rest-cleaning/` | 0.99–1.00 | 1.00 | 1.00 | 1,582 | 0 | 47 | 153 |
| `/guides/how-much-does-a-website-cost-in-toronto/` | 1.00 | 1.00 | 1.00 | 780 | 0 | 37 | 73 |
| `/web-design-scarborough/` | 1.00 | 1.00 | 1.00 | 796 | 0 | 25 | 74 |

## Load, weight and motion (lab)

KB are decoded sizes at load, before any scroll (after scrolling the whole page in brackets). HTML includes the inlined
CSS, so CSS files are 0. Animations: still running 15 s after load, with no input, on the document timeline (infinite
ones in brackets).

| Page | Size | LCP ms | LCP element | CLS | DOM elements | Total KB | HTML | JS | Fonts | Images | Animations |
| --- | --- | --: | --- | --: | --: | --: | --: | --: | --: | --: | --: |
| `/` | 375×812 | 96 | `span.hero__line` (H1) | 0 | 1,202 | 290 | 183 | 21 | 38 | 49 | 37 (37) |
| `/` | 768×1024 | 96 | `span.hero__line` (H1) | 0 | 1,202 | 316 | 183 | 21 | 38 | 74 | 37 (37) |
| `/` | 1440×900 | 128 | `span.hero__line` (H1) | 0.0006 | 1,202 | 327 | 183 | 21 | 38 | 86 | 37 (37) |
| `/services/` | 375×812 | 96 | lead paragraph | 0 | 795 | 188 | 125 | 25 | 38 | 0 | 0 |
| `/services/` | 768×1024 | 68 | lead paragraph | 0 | 795 | 188 | 125 | 25 | 38 | 0 | 0 |
| `/services/` | 1440×900 | 72 | lead paragraph | 0 | 795 | 188 | 125 | 25 | 38 | 0 | 0 |
| `/work/nest-and-rest-cleaning/` | 375×812 | 96 | **consent prompt text** | 0 | 774 | 226 (274) | 125 | 21 | 38 | 43 (91) | 0 |
| `/work/nest-and-rest-cleaning/` | 768×1024 | 60 | desktop capture | 0 | 774 | 222 (384) | 125 | 21 | 38 | 39 (201) | 0 |
| `/work/nest-and-rest-cleaning/` | 1440×900 | 84 | desktop capture | 0 | 774 | 250 (415) | 125 | 21 | 38 | 66 (231) | 0 |
| `/about/` | 375×812 | 56 | portrait | 0 | 806 | 184 | 118 | 21 | 38 | 7 | 0 |
| `/about/` | 768×1024 | 100 | **consent prompt text** | 0 | 806 | 197 | 118 | 21 | 38 | 20 | 0 |
| `/about/` | 1440×900 | 68 | portrait | 0 | 806 | 189 | 118 | 21 | 38 | 12 | 0 |
| `/contact/` | 375×812 | 92 | **consent prompt text** | 0 | 898 | 220 | 132 | 49 | 38 | 0 | 0 |
| `/contact/` | 768×1024 | 72 | **consent prompt text** | 0 | 898 | 220 | 132 | 49 | 38 | 0 | 0 |
| `/contact/` | 1440×900 | 84 | **consent prompt text** | 0.0003 | 898 | 220 | 132 | 49 | 38 | 0 | 0 |

**Still running on Home after 15 s** (the same at all three sizes): 24 graph sparks (Web Animations, `rect.ag__spark`),
10 `ag-twinkle`, and one each of `ag-spin` (orbit), `ag-ping` and `ag-glow`. All 37 are infinite. The other four
pages have none.

## H1 and the largest H2 (computed px) at every size

| Page | 320×568 | 360×740 | 375×812 | 390×844 | 768×1024 | 1024×768 | 1280×800 | 1440×900 | 1920×1080 | 844×390 |
| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| `/` | 33.6 / 48 | 33.6 / 48 | 35.3 / 48 | 36.7 / 48 | 72.2 / 65.3 | 49.6 / 87 | 52.5 / 108.8 | 59 / 122.4 | 73.6 / 132 | 73.6 / 71.7 |
| `/services/` | 36 / 35.2 | 36 / 35.4 | 36 / 35.9 | 36 / 36.4 | 44.5 / 50 | 53 / 59.3 | 61.4 / 68.5 | 66.7 / 74.2 | 72 / 80 | 47.1 / 52.8 |
| `/work/nest-and-rest-cleaning/` | 48 / 32 | 48.6 / 32 | 49.6 / 32.2 | 50.6 / 32.6 | 74.8 / 41.6 | 91.1 / 47.8 | 107.5 / 53.9 | 117.8 / 57.8 | 136 / 64 | 79.6 / 43.5 |
| `/about/` | 38.4 / 35.2 | 38.4 / 35.2 | 38.4 / 35.2 | 38.4 / 35.7 | 51.6 / 48.5 | 60.9 / 57.2 | 70.1 / 65.9 | 75.8 / 71.4 | 84 / 76 | 54.4 / 51.1 |
| `/contact/` | 41.6 / 21.6 | 41.7 / 21.6 | 42.3 / 21.6 | 42.8 / 21.6 | 57.2 / 21.6 | 66.9 / 21.6 | 76.6 / 21.6 | 82.7 / 21.6 | 96 / 21.6 | 60.1 / 21.6 |

The largest H2 on Home is `#ss-title` (services) on phones and `#work-title` (Selected Work) from 768px. Tracking: the
Home H1 is −0.06em at weight 650; Home H2s go down to −0.085em. Other H1s are −0.04 to −0.055em at 600.

## Page length (screens: page height ÷ viewport height) and the Home hero

| Page | 320×568 | 360×740 | 375×812 | 390×844 | 768×1024 | 1024×768 | 1280×800 | 1440×900 | 1920×1080 | 844×390 |
| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| `/` | 20.05 | 14.89 | 13.27 | 12.73 | 11.23 | 11.57 | 11.19 | 10.3 | 9.1 | 29.56 |
| `/services/` | 14.62 | 10.64 | 9.37 | 8.9 | 7.2 | 8.12 | 7.87 | 7.08 | 6.19 | 18.96 |
| `/work/nest-and-rest-cleaning/` | 11.22 | 8.46 | 7.71 | 7.36 | 10.48 | 11.9 | 11.69 | 10.67 | 9.17 | 28.07 |
| `/about/` | 14.92 | 10.89 | 9.67 | 9.2 | 10.06 | 12.42 | 11.06 | 9.89 | 8.61 | 26.86 |
| `/contact/` | 5.53 | 4.09 | 3.73 | 3.59 | 2.98 | 2.85 | 2.85 | 2.6 | 2.23 | 7.85 |
| Home hero | 2.33 | 1.82 | 1.70 | 1.67 | 1.65 | 1.26 | 1.03 | 0.93 | 0.94 | 4.19 |
| Selected Work heading y (px) | 1,469 | 1,487 | 1,527 | 1,552 | 1,846 | 1,120 | 987 | 1,008 | 1,191 | 1,789 |

No horizontal overflow at any of the ten sizes on these five pages. After one scroll through each page, no scroll
reveal was left hidden in the page flow (cards in sideways swipe rails reveal when swiped, so they aren't counted).

## Baseline readings against the gates

These readings come from the script and Lighthouse runs above. They aren't the gate tests, which arrive with their
phases. Gates not listed here aren't measured yet.

| Gate | Target | Baseline | Reading |
| --- | --- | --- | --- |
| H1 | Home H1 ≥ 1.4× the largest H2 from 1024px (≥ 1.25× below); on every page the H1 ≥ every H2 | Home 0.48× at 1440 (59 vs 122.4px), 0.74× at 375; `/services/` H1 is smaller than an H2 from 390px up | fail |
| T2 / R2 | The Home H1 never shrinks as the screen widens | 72.2px at 768 → 49.6px at 1024 | fail |
| T4 (headings only) | Tracking ≥ −0.035em | Home H1 −0.06em, Home H2s down to −0.085em | fail |
| R3 | Hero ≤ 1.35 screens at 375×812, ≤ 1.1 at 768×1024 | 1.70 and 1.65 | fail |
| S4 | Home ≤ 11 screens at 390×844; Selected Work heading by 1,500px (390) and 1,000px (1440) | 12.73 screens; 1,552px; 1,008px at 1440×900 | fail |
| H6 (part) | LCP element is the H1; CLS < 0.01 | An H1 line at all three sizes; CLS ≤ 0.0006 | pass so far (entrance timing not measured yet) |
| M2 / P4 | 0 animations running after 15 s | Home 37, all infinite; other pages 0 | fail |
| P1 | Home ≥ 0.97, others ≥ 0.95; LCP ≤ 1.8s; CLS ≤ 0.02; TBT ≤ 100ms | Home 0.98–0.99, LCP 0.80s, CLS 0, **TBT 127ms**; others ≥ 0.99, LCP ≤ 1.58s, TBT ≤ 47ms | fail (Home TBT only) |
| P2 | Home at 375: ≤ 300KB decoded, JS ≤ 60KB, fonts ≤ 70KB | 290KB, 21KB, 38KB | pass by this method (note 2) |
| P3 | Home ≤ 950 DOM elements | 1,202 | fail |
| R1 (five pages) | No horizontal scroll at any matrix size | None | pass for these pages |
| A9 | Lighthouse accessibility 100 | 1.00 on all 8 CI pages | pass |

## Notes for later phases

1. **The consent prompt's text is the LCP element** on `/contact/` (all sizes), `/work/nest-and-rest-cleaning/` at 375
   and `/about/` at 768. Home is unaffected (its LCP is the H1). The compact prompt in Phase 2 (2.6) should hand LCP
   back to each page's own content.
2. **Page weight.** The plan gives Home at 375 as "about 340KB" (live site, from the audit). The production build
   measured here is 290KB decoded at load (316KB at 768, 327KB at 1440). The difference probably comes from what only
   the live site serves (for example scripts Cloudflare adds at the edge) **[unverified]**. Measured this way, Home
   already meets P2's 300KB.
3. **Home TBT is already 127ms**, over P1's 100ms. The graph's 24 scripted sparks and the other loops are the first
   suspects (Phases 4 and 7).
4. **Phone landscape (844×390):** the Home hero is 4.19 screens tall, which is what task 6.3 targets.
5. **To reproduce the "before" side** of any later comparison: check out this commit, run `npm run build:cloudflare`,
   then `node scripts/design-shots.mjs --serve dist/client --metrics --label before`.
