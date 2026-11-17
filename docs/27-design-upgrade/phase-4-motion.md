# Design upgrade, Phase 4: the motion system (17 Nov 2026)

[`DESIGN_UPGRADE_PLAN.md`](../../DESIGN_UPGRADE_PLAN.md) §4 Phase 4, [`DESIGN_AUDIT.md`](../../DESIGN_AUDIT.md) → Motion
system. Measured as in [Phase 0](phase-0-baseline.md); before = Phase 3 (live on mannpatel.me since 17 Nov 2026, PR #54).

## What changed

- **One token set (4.1, 4.2)** in `tokens.css`:
  - Easings: `--ease-out`, `--ease-in-out`, `--ease-in` (new: `cubic-bezier(0.7, 0, 0.84, 0)`) and `--ease-spring`.
  - Durations: `--dur-1` to `--dur-5` (120 / 200 / 320 / 560 / 800 ms), `--stagger` (60 ms), `--dur-loop` (4200 ms),
    and `--dur-page-out` / `--dur-page-in` (220 / 420 ms, the audit's page-transition row).
  - The old `--t-*`, the playbook `--dur-*` and `--ease-standard` are gone. All the durations are 0 under reduced motion.
  - About 60 hard-coded durations across 30 files now use the tokens. Scripts read them too.
  - Load delays (`--d`) count steps of `--stagger`, not milliseconds.
- **Hero entrance (4.3)**, about 1.6 s with the graph:
  - Mann's choice: everything is visible from the first frame and only rises into place, so the H1 stays the LCP
    element.
  - Timeline: the greeting at 60 ms; the H1's two lines from 120 ms, 60 ms apart; the core at 320 ms; the subline,
    buttons and price line from 380 ms.
  - The graph's lines fade in by group (6 mesh groups, 2 spoke groups, 2 node columns) and finish by about 1.15 s.
- **Agent graph (4.4, D8)**:
  - The loop moves to a script that reads the tokens. The first pulse runs Google → core → Booking at about 1.2 s
    (route 0 now ends at Booking) and the core's glow breathes once when it arrives.
  - Route 4 (Maps → Reply) runs half a cycle behind. Each route travels three times (the first pulse is cycle 1, Mann's
    choice); the core pings, the Booking pill glows, the nodes twinkle and the orbit turns a third of a turn (easing in
    and out), then everything rests by about 13 s. The two routes stay lit at rest.
  - Pointer, focus or a tap wakes it for three more cycles. The pause button pauses it, or plays it again once it
    rests, and it works from the first moment.
  - Hovering or tapping an input pill lights its two routes and the pills they reach, and dims the rest to 30%
    (pointer only; the graph is decorative).
  - Only the layout on screen animates, and its streaks are built one per idle moment.
- **Reveals (4.5)**:
  - Section heads (headings split into lines) and media (`data-reveal="media"`, `.reveal-clip`) reveal on a CSS view
    timeline inside `@supports`, so nothing is hidden where scroll timelines aren't supported.
  - The IntersectionObserver reveal and every `data-reveal` on a paragraph, list item, card or button row are removed
    (about 30).
  - First-screen text and buttons rise only. Without JavaScript nothing moves: the status ping, the confirmation tick,
    the enquiry demo and the reading line now also wait for `html.js`.
- **Page transitions (4.6)**: the old page fades and shrinks slightly (220 ms, `--ease-in`); the new one rises in
  (420 ms, `--ease-out`). Opacity and transform only: the blur and clip-path wipe broke the rule.
- **Magnetic pull (4.7)**: only on `[data-magnetic]` (the hero and footer buttons), at most 6px (was up to 10px on every
  button, icon button and menu button).
- **Wordmark (4.8)**: the header wordmark has per-letter groups.
  - Once per visit (a `sessionStorage` flag set in `<head>`), the letters settle in from wider spacing while the Λ's
    rise from the baseline.
  - After the hero (or a page's first section) it becomes "MΛ": the other letters fade in place, so nothing moves.
  - Hover or keyboard focus runs one lime sweep across the letters, replacing the fade to 0.72.
- **Lime glow (4.9)**: an opacity-only `::after` with `--signal-glow`, on hover and keyboard focus.
  - It sits on the lime button itself, which now draws outside its box (`overflow: visible`); the outline button keeps
    its clip.
  - Same result as the plan's wrapper, with no extra markup.
- **Hover and focus (M8)**: 53 hover rules gained a `:focus-visible` counterpart (or `:focus-within` for a label around a
  control).
- **Start-up cost (M7)**:
  - Code that reads the layout waits for an idle moment: the rails' dots, the progress lines, the header's watchers and
    its first scroll check, and the graph's setup.
  - The header clock works out Toronto time itself (Eastern Time rules, checked against the browser's time-zone data
    across both daylight-saving changeovers). Building a time-zone formatter took 60–90 ms at 4× slowdown.

## Decisions made in this phase (Mann, 17 Nov 2026)

1. D8 timing: the first pulse is the graph's first cycle, so the loop fits inside gate M2's 15 s (three full cycles
   after a separate first pulse would end at about 15.2 s).
2. Hero and page-head entrances: rise only, never hidden (the plan's task 4.5 and "H1 painted from the first frame" win
   over the audit's fade).
3. Gate M7 is counted from the first contentful paint (the browser's first render before it isn't ours to judge here).
4. Gate M7 counts frames in which the site's own scripts run. Frames that are only the browser painting the page are
   listed in the test's annotations and left to Phase 7 (performance). At 1440 they reach 54–107 ms in about half of
   the loads at 4× slowdown; the strict version passed 4 of 7 runs.

## Tests changed, each naming its decision

- `tests/e2e/site.spec.ts` › the graph labels test expects 4 streaks per layout, not 12 (D8).
- › "reduced motion: headings and reveals are visible immediately": it checks a scroll-revealed heading line, since no
  paragraph or list carries `data-reveal` any more (plan task 4.5).
- No test was skipped or loosened.
- New gates:
  - `tests/unit/design-tokens.test.ts`: M1 (three tests) and M4.
  - `tests/e2e/design-gates.spec.ts`: M2, M3, M5, M6 and M7.

## Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| M1 | pass | Unit tests: the token set and values, every duration 0 under reduced motion, no old tokens anywhere, no literal duration in any `animation*` or `transition*` declaration, none in `element.animate()` options |
| M2 | pass | › M2: 15.5 s after load, nothing running on the document timeline on Home (1440 and 390) and seven other pages; the graph rests by about 13.1 s |
| M3 | pass | › M3: at 1.7 s no hero, graph-entrance or wordmark animation is running (first visit, 1440×900 and 390×844); the second page doesn't replay the lock-on |
| M4 | pass | Unit test: page-out 220 ms, page-in 420 ms, and the view-transition rules use only those tokens |
| M5 | pass | › M5: reduced motion at 390 and 1440 on five pages: nothing running after scrolling through, no content hidden, the graph shows its 4 lit route legs and no streaks |
| M6 | pass | › M6: JavaScript off, every built page: no animation at all, no content hidden |
| M7 | pass (Mann's definition) | › M7: median of three loads at 4× slowdown, no frame the site's scripts run in is over 50 ms from first paint to 3 s (5 of 5 runs). Browser-only paint frames: see the decisions above |
| M8 | pass (my review) | Every `:hover` rule on a link, button, summary or control has a `:focus-visible` or `:focus-within` twin (53 added). Left as hover-only: the pointer spotlight, the vision list rows (not controls) and form fields (they have `:focus` styles) |

## Quality gates

| Check | Result |
| --- | --- |
| `npm test` | 155/155 |
| `npm run build` | ✓ |
| `npx playwright test --trace off` | 218/218 |
| `npm run build:cloudflare` | ✓ (0 errors, the same 2 warnings) |
| Lighthouse CI assertions | ✓ |

## Numbers, Phase 3 → Phase 4

**Lighthouse** (mobile, medians of 3): every page scores 1.00 for performance, accessibility and SEO.

- Home: LCP 799 → 806 ms, CLS 0, TBT 56 → 70 ms.
- `/pricing/`: LCP 1,504 → 794 ms. Its package cards no longer wait for a reveal.
- Case study: LCP 1,540 → 796 ms.
- Every other page is within a few ms of 795.

| | 375 | 768 | 1440 |
| --- | --- | --- | --- |
| Running after 15 s (infinite) | 37 (37) → 0 | 37 (37) → 0 | 37 (37) → 0 |
| Home CLS (lab) | 0 → 0 | 0.004 → 0 | 0 → 0.0005 |
| Home DOM elements | 1,192 → 1,212 | 1,192 → 1,212 | 1,192 → 1,212 |
| Home decoded KB | 299 → 310 | 324 → 335 | 335 → 345 |
| Home JS KB | 21 → 26 | 21 → 26 | 21 → 26 |
| Home length (screens) | 11.38 | 10.46 | 10.07 |

- **Other pages:** none had anything running after 15 s before or after.
- **Home's LCP element:** it is now the H1's second line (a `span` inside the H1), which moves on its own in the entrance.
- **Page weight:** Home is 11 KB heavier.
  - About 5 KB of that is script (the graph's loop moved from CSS into a script that reads the tokens).
  - The rest is the header wordmark's per-letter groups.
  - Home is now 10 KB over Phase 7's 300 KB phone target (P2), so Phase 7 has to win that back.
- **Layout:** page lengths and the Selected Work position are unchanged (D9 still met: 10.92 screens at 390×844, heading
  at 997 at 1440×900).

## Notes for later phases

- Phase 7: the browser's own paint after first paint at 1440 (54–107 ms at 4× in about half the loads) and Home's
  first render. A quick `content-visibility: auto` test on the sections below the screen made it worse, so it needs a
  closer look (painted layers, the hero's grain, the 197 KB HTML with 84 KB of inline CSS).
- Phase 7: Home is 310 KB at 375 (P2's target is 300 KB).
- The D7 Archivo trial is still to come.
