# Design upgrade, Phase 7: performance (17 Nov 2026)

[`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 7, [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md) →
Performance. Measured as in [Phase 0](phase-0-baseline.md); before = Phase 6 (live on mannpatel.me since 17 Nov 2026,
PR #57).

## Where it started

Phase 6 already met P1 (every page 1.00, LCP about 0.8 s), P2 (Home at 375: 289 KB, 26 KB script, 38 KB fonts) and P4
(M2's check). P3 did not: Home had **1,234 elements** against 950. Of those:

- 230 were the agent graph's two SVG layouts, only one of which is ever shown;
- 175 were the quick menu (closed until ⌘K or the search button);
- 47 were the phone menu (closed until Menu).

## What changed

- **One graph in the page (7.2).** `src/components/home/AgentGraph.astro` sends the tall layout in the HTML and puts
  the wide one in a `<template>`.
  - A small inline script straight after the figure swaps them where the wide layout is used, before the first paint
    (it runs as the page is read, so nothing shifts), and again if the window crosses over (a phone turning, a window
    resized).
  - The figure carries `data-layout="wide"` while the wide layout is in; the CSS positions the photo from that, not from
    the screen width.
  - The animation script follows the swap (an `ag:layout` event) instead of keeping its own copy of the media query,
    and binds each layout's pills the first time that layout is in the page.
  - Without JavaScript the tall layout shows at every width, as the plan accepts. At 1440 the hero is then 1.07
    screens, with the button on the first screen.
- **Closed menus are empty until opened.** The quick menu's 22 items (`src/components/QuickMenu.astro`) and the phone
  menu's contents (`src/components/Header.astro`) wait in `<template>`s and join the page on first open. Both menus
  need JavaScript to open anyway, so no one loses anything.
  - The call, WhatsApp and text links in the quick menu get their numbers when they are added: `src/scripts/reach.ts`
    now exports `fillReach()`.
  - The phone menu handles its clicks (close button, links) on the dialog, so they work for contents added later.
  - The HTML still carries the menus and the second graph (they are inert inside `<template>`s); the page as the
    browser lays it out is smaller.
- **CSS stays inline (7.1, P6).** Measured against `'auto'`; inline paints 0.26 s sooner on a first visit. Written up in
  [`docs/stack.md`](../stack.md) → CSS delivery, with the table.
- **Budgets (7.5).** `lighthouserc.json` now uses an `assertMatrix`: performance at least 0.95 (fails) and 0.98 (warns)
  on every page, at least 0.97 on Home (fails); LCP at most 1.8 s; CLS at most 0.02; TBT at most 100 ms (warns).
  - Each page is judged by its median run. Lighthouse CI's default is the best of the three, which would let a page
    pass with two slow runs; P1 is defined on medians, as every record reports them.
  Checked on Phase 6's saved results: all pass, and raising Home's floor to an impossible 1.01 fails exactly one page,
  Home.
- **Nothing animates at rest (7.4, P4):** unchanged since Phase 4. M2's test is now titled "M2 and P4".
- **Archivo (7.3, D7):** the trial was run (below). 7.3 applies only if Mann adopts it, so no font was added.

## Deviations, each with its reason

1. **The swap happens at the graph's own breakpoint, not 48em.** Task 7.2 says to clone the wide layout "at 48em and
   up", but the graph has switched layouts at 64em (and, since Phase 6, on phones held sideways). Swapping at 48em would
   have shown the wide layout where the design uses the tall one.
2. **The closed menus were deferred too.** The graph alone takes Home to 1,121 elements; P3 needs 950. Deferring the two
   closed dialogs is the change that reaches it without removing anything a visitor sees.
3. **LCP is asserted at 1.8 s, not 2.0 s.** Task 7.5 says 2.0 s; gate P1 says 1.8 s. The stricter figure meets both and
   lets CI check the gate. TBT stays a warning, as 7.5 says (CI machines vary); P1's 100 ms is checked in the local run.
4. **P2 is measured as Phase 0 set it out:** decoded bytes at load, at 1× density. A 2× phone also loads the sharper
   Selected Work captures: Home is **326 KB** at 375 and 2×, over 300. The difference is images only (HTML, CSS, script
   and fonts are the same). Noted for Mann below.

## D7: the Archivo trial

H1 and H2 set in Archivo (variable, Google Fonts, weight 600 as the headings use now) on the current build, against
Geist, nothing else changed. Captures: Home at 375 and 1440, the services H2 at 1440, `/services/` at 1440, and a close
crop of the desktop H1, each as Geist / Archivo at normal width / Archivo condensed (87.5%).

- At normal width Archivo is close to Geist (the differences are in letters such as a, e and S) but runs wider: the
  services H2 at 1440 goes from two lines to three, so the heading widths would need retuning.
- Condensed, it reads as a different voice, but with the site's heading tracking (made for Geist) it is cramped
  ("forToronto"); it would need its own tracking.
- My view: not clearly better, so by D7's own rule Geist stays. Adopting Archivo would also add a font file (about
  90 KB before subsetting, under 30 KB after, per 7.3) and a fifth weight (T3). The choice is Mann's.

## Tests changed, each naming its decision

- `tests/e2e/design-gates.spec.ts`: M2's title is now "M2 and P4" (P4 is the same check, per the plan); the check is
  unchanged.
- New: P2 and P3 in `tests/e2e/design-gates.spec.ts`. P1 is the Lighthouse assertions in `lighthouserc.json`.

Nothing was skipped or loosened.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| P1 | pass | Lighthouse (mobile, simulated), medians of 3 on eight pages: performance 1.00 everywhere (Home ≥ 0.97), LCP 0.79–0.81 s (≤ 1.8 s), CLS 0 (≤ 0.02), TBT 12–51 ms (≤ 100 ms). `lighthouserc.json` assertions pass, judged on the median run |
| P2 | pass | › P2: Home at 375 loads 290 KB decoded (≤ 300), 26 KB script (≤ 60), 38 KB fonts (≤ 70), measured as Phase 0 (1× density). At 2× it is 326 KB: see deviation 4 |
| P3 | pass | › P3: Home has 923 elements in the production build at 375 and at 1440 (≤ 950; was 1,234) |
| P4 | pass | › M2 and P4: 15 s after load nothing animates on any page's own clock |
| P5 | needs owner | Field data (p75 on mobile: LCP ≤ 2.0 s, INP ≤ 150 ms, CLS ≤ 0.05) comes from real visitors: Search Console's Core Web Vitals report or Chrome UX data, once the site has enough traffic. Mann |
| P6 | pass | [`docs/stack.md`](../stack.md) → CSS delivery: measured, with the table, and kept inline |

## Quality gates

| Check | Result |
| --- | --- |
| `npm test` | 158/158 |
| `npm run build` | ✓ |
| `npx playwright test --trace off` | 227/227 (225 before; P2 and P3 are new) |
| `npm run build:cloudflare` | ✓ (0 errors, the same 2 warnings) |
| Lighthouse CI assertions (the new budgets) | ✓ |

## Numbers, Phase 6 → Phase 7

**Lighthouse** (mobile, medians of 3): every page scores 1.00 for performance, accessibility and SEO, as in Phase 6.

- **LCP:** Home 807 → 810 ms; the case study 796 → 795 ms; the others 790–804 ms. Two single runs reached 1.4 s (the
  guide and the Scarborough page); their medians are 790 and 796 ms. Simulated-timing noise, as in Phase 5.
- **Total blocking time:** 12–51 ms on every page (Phase 6: 11–54 ms). Home's moves between about 20 and 50 ms from run
  to run in both phases.

**Elements, weight and motion** (production builds, lab):

| | Phase 6 | Phase 7 |
| --- | --- | --- |
| Home, elements | 1,234 | 923 |
| `/services/`, case study, About, Contact, elements | 815, 821, 829, 910 | 614, 620, 628, 709 |
| Home, KB at load, 375 / 768 / 1440 | 289 / 336 / 335 | 290 / 337 / 336 (the swap script) |
| Home, KB at load at 375 and 2× | – | 326 |
| Script on Home / Contact | 26 / 49 KB | 26 / 50 KB |
| Running 15 s after load | 0 | 0 |

- **Unchanged:** CLS 0–0.004 in the lab; LCP elements; every page height at the ten matrix sizes. (`/contact/` at 390
  measured 17px shorter, because its "Toronto time" line wrapped differently at 4:37 PM than at 11:22 AM.)
- **HTML:** Home's HTML is about the same size (202 KB, 38 KB compressed; +1 KB for the swap script): the second graph
  and the menus are still in it, inert inside `<template>`s. Of the 202 KB, 88 KB is CSS (kept inline, see 7.1).

## Notes for later phases

- P5 needs real-visitor data, which Mann can read in Search Console once there is enough traffic.
- At 2× density Home loads 326 KB at 375 (the sharper Selected Work captures). If Mann wants P2 to hold for 2× phones
  too, the captures' quality or their first-screen loading could be revisited.
- D7: Archivo trial shown; Geist stays unless Mann adopts it (then 7.3: subset under 30 KB, no preload, metric-matched
  fallback).
