# DESIGN.md · "Signal" (round 5, Nov 2026), compact editorial portfolio (round 7)

> **Design upgrade, Phase 9 (18 Nov 2026): the re-audit, and its fixes.** Scored gate by gate against the plan, the site
> was at **92 / 100** (101 of 110; the audit's score was 65). Mann approved every fix, so it is now **94** (103.5).
> - **Still short of 9.5:** structure and imagery, which wait on Mann: S5 (a real testimonial) and G5 (a third
>   project, one more photo). Every other category is at 9.5.
> - **The header wordmark has a small-size cut** (C4): Geist Medium with +20% tracking (`scripts/wordmark_cut.py`), at
>   13px tall on phones and 16px from 64em; it was Regular at 11–14px. The footer and brand files keep the regular
>   cut. Clear space and minimum sizes are now written down (C5): Colour → The wordmark.
> - **Body text keeps the measure** (T6): notes under section headings, service checklists and sample intros stop at
>   68ch; the free-check list is at the body line height (1.6).
> - **No empty columns** (L1): from 64em every two-column head is sticky, as on Home.
> - **One head spacing** (L4): eyebrow → heading `--head-gap-1`, heading → intro `--head-gap-2`, in every section and
>   page head. Stacked eyebrows are block-level, and split headings keep their line masks' margins inside.
> - **Also fixed:** stand-alone links fade their underline on keyboard focus as on hover (M8), and the Colour table
>   below matches `tokens.css` (C6).
> - **Tests:** T6, C4, L1 (as a check) and L4 in `design-gates.spec.ts`; M8 and C6 in `design-tokens.test.ts`.
> - **Record:** [`docs/27-design-upgrade/phase-9-reaudit.md`](docs/27-design-upgrade/phase-9-reaudit.md).
>
> **Fixes after launch (18 Nov 2026, Mann's report).**
> - **The logo stays whole.** The header showed only "MΛ" once the hero scrolled away (the Phase 4 condense), which read
>   as the logo disappearing. The full MANN PATEL now stays at every scroll position.
> - **The scrolled header is solid.** Its layer was 82% with a backdrop blur, but the header's view-transition-name
>   stops a blur inside it from seeing the page, so text scrolling under the bar showed through behind the logo. It is
>   now `--bg`, fully opaque (and "no glass" is the rule anyway).
> - **Stand-alone links underline each line.** `.link--tap` (Phase 6) drew the underline once across its 44px box, so a
>   link that wrapped (the case studies' "Services shown") had a line through its second line. Its underline is now a
>   text decoration.
> - **Quick menu:** Enter opens the best match by name ("pricing" opened Services, whose keywords include pricing).
> - **The Λ's signal gap:** every Λ (wordmark, eyebrows, favicon, brand files) has a small slanted break in its right
>   leg. Colour → The signal gap.
>
> **Design upgrade, Phase 8 (17 Nov 2026): accessibility.**
> - **Forced colours** (Windows contrast themes): buttons keep a `ButtonText` edge, the focus ring is `Highlight`,
>   display headings open up to 1.15 line height (the mode's line backplates were cutting the line above), and every
>   mark drawn only as a fill or only in lime has a system-colour stand-in: the Menu lines, the chosen contact card, the
>   chosen area and chips, the form's progress bar, the finder's bar, the quick menu's active option and the demo's
>   active step. See Colour → Forced colours.
> - **Checked everywhere:** axe at 375, 768 and 1440 on every page, and with the phone menu, the quick menu, the
>   consent prompt and a question open (A1); WCAG text spacing on every page (A4); forced colours in dark and light
>   (A5). Nothing failed axe; no button label or heading clips with the spacing applied.
> - **Gates:** A1, A4, A5 new; A2, A3, A6, A7 and A9 were already green. A8 (a screen-reader pass) needs Mann.
> - **Record:** [`docs/27-design-upgrade/phase-8-accessibility.md`](docs/27-design-upgrade/phase-8-accessibility.md).
>
> **Design upgrade, Phase 7 (17 Nov 2026): performance.**
> - **One graph in the page:** the agent graph's tall layout is sent in the HTML and the wide one waits in a
>   `<template>`; a small inline script after the figure swaps them before the first paint where the wide one is used
>   (from 64em, and on phones held sideways), and again if the window crosses over. Without JavaScript the tall layout
>   shows at every width.
> - **Closed menus are empty:** the quick menu's items and the phone menu's contents join the page on first open. Both
>   need JavaScript to open anyway. Home went from 1,234 elements to 923 (gate P3: at most 950).
> - **CSS stays inline:** measured against `'auto'` (linked stylesheets), inline paints 0.26 s sooner on a first visit
>   (`docs/stack.md` → CSS delivery).
> - **Budgets:** `lighthouserc.json` now fails CI below 0.95 performance (0.97 on Home), above 1.8 s LCP or 0.02 CLS,
>   and warns below 0.98 or above 100 ms TBT.
> - **Type:** the Archivo trial (D7) was shown side by side with Geist; Geist stays unless Mann adopts Archivo.
> - **Gates:** P1 (Lighthouse), P2 (weight), P3 (elements), P4 (= M2), P6 (CSS delivery documented). P5 (field data)
>   needs Mann.
> - **Record:** [`docs/27-design-upgrade/phase-7-performance.md`](docs/27-design-upgrade/phase-7-performance.md).
>
> **Design upgrade, Phase 6 (17 Nov 2026): responsive hardening.**
> - **Container queries:** the services tiles, the promise tiles and the Selected Work cards are containers, so their
>   inside follows the tile's width, not the screen's. A services tile under 20rem gets the smaller scene; a promise
>   24rem or wider puts its icon beside the text; a work card goes side by side from 58rem of its own width.
> - **Phones held sideways:** the agent graph uses its wide layout, at most about one screen tall. The hero drops from
>   about 3 screens to 2.3, with the button straight under the H1.
> - **Tap targets:** standalone text links (the contact phone and email, the comparison table's "Request a quote", the
>   case studies' service links) are 44px targets (`.link--tap`).
> - **Line breaks:** a project name such as "Hair & Spa" doesn't break inside itself.
> - **Gates:** R1 (no sideways scrolling at any of the ten matrix sizes on any page), R2, R4, R5 (320px and 1280 at
>   200% zoom) and R6's automated check (no short word left alone at the end of an H1 or H2 line), across every built
>   page. R3 has passed since Phase 2.
> - **Record:** [`docs/27-design-upgrade/phase-6-responsive.md`](docs/27-design-upgrade/phase-6-responsive.md).
>
> **Design upgrade, Phase 5 (17 Nov 2026): imagery.**
> - **One frame system** (`components/work/MediaFrame.astro`): browser frames for desktop captures, phone frames for
>   phone captures, plain cards for close-ups. Backdrops come only from tokens; each project's own colour no longer
>   tints its backdrop.
> - **One shadow**, `--shadow-media`, for every mockup (the frames, the portrait core, the free-check receipt).
> - **Formats:** captures and the portrait are AVIF with a WebP fallback, with `srcset` up to twice the shown width
>   wherever the source file is wide enough.
> - **Avatar:** the phone greeting row has its own head-and-shoulders crop.
> - **Line weights:** the graph, the services scenes and the promise icons share four stroke tokens.
> - **Mann's choices:**
>   - Images are lazy below the first screen.
>   - Image size is judged against the displayed size × the screen's density.
>   - Files narrower than twice their shown width are served at full width and listed as needing a higher-resolution
>     capture.
> - **Gates:** G1–G4. G5 needs Mann: more real projects and photos.
> - **Record:** [`docs/27-design-upgrade/phase-5-imagery.md`](docs/27-design-upgrade/phase-5-imagery.md).
>
> **Design upgrade, Phase 4 (17 Nov 2026): the motion system.** One token set (`--ease-out`, `--ease-in-out`, `--ease-in`,
> `--ease-spring`, `--dur-1` to `--dur-5`, `--stagger`, `--dur-loop`, and `--dur-page-out` / `--dur-page-in` for page
> transitions); every duration in the site comes from it, scripts included, and reduced motion sets it to 0. The hero
> enters in about 1.6 s, everything visible from the first frame (Mann's choice): parts rise into place, the graph's
> lines fade in by group. The agent graph's first pulse runs Google → core → Booking at 1.2 s; two routes play three
> cycles, then everything rests by about 13 s (D8). Pointer, focus or a tap wakes it; hovering or tapping an input pill
> lights its routes. Reveals are scroll-driven CSS for section heads and media only; paragraphs, lists and buttons never
> start hidden, and with JavaScript off nothing moves. Page transitions take 220 / 420 ms, opacity and transform only.
> The magnetic pull is on the hero and footer buttons only (6px at most). The header wordmark settles in once per visit
> and sweeps lime on hover or focus (its condense to "MΛ" after the hero was removed on 18 Nov 2026). Lime buttons glow
> on hover or focus, and every hover state has a matching keyboard-focus state. Gates M1–M8. Record:
> [`docs/27-design-upgrade/phase-4-motion.md`](docs/27-design-upgrade/phase-4-motion.md).
>
> **Design upgrade, Phase 3 (17 Nov 2026): sections and flow.** Home runs hero → Selected Work (reviews strip once real
> reviews exist) → services → prices → free check → how I work → questions → closing call to action. The services are a
> **bento** of three tiles (A Found, B Answered, C Booked), each with a small scene in the agent graph's line style that
> plays once on arrival and again on hover or focus (still under reduced motion): a pin drops onto a full stop, typing
> dots turn into read ticks, a date is circled. The four promises are icon tiles, with a testimonial tile reserved for
> when a real review exists. Both bentos are swipe rails on phones (Mann's choice), so Home is 10.9 phone screens (D9,
> gate S4: at most 11). The heads of How I work, Prices and the questions are sticky from 64em; a lime-tipped hairline
> (`.rule-signal`) separates the three dark-to-dark sections; mockup backdrops are tints of the paper and surface colours;
> the About photo starts level with its heading. Every page except Privacy and Terms shows a lime button within its
> first two phone screens (U4, Mann's choice: under each intro). Gates S1–S4, L1, L3, U1, U4. Record:
> [`docs/27-design-upgrade/phase-3-sections.md`](docs/27-design-upgrade/phase-3-sections.md).
>
> **Design upgrade, Phase 2 (17 Nov 2026): the hero, "Signal path".** The hero text holds five things: the greeting
> (with a 40px photo under 64em, so Mann's face is on the first phone screen; "Taking new projects" as text), the H1 at
> `--fs-hero` with a lime full stop, the subline, one lime button with a quiet "See prices →" link, and a mono price
> line. The service chips, recent-work cards, Vision link and "reach me directly" icons left the hero (decisions D1, D2,
> D3, D4; Vision is in the footer's Pages column). Two columns from 48em (graph about 44%), full height from 64em, a
> static grain layer, and the graph's glow breathes once when the first pulse reaches Booking. On Home the header
> button is an outline until the hero button scrolls away (D5). The consent prompt sits after the skip link, appears
> after the first scroll or 4 s, and is one row along the bottom on every screen (≤72px on phones, where it shows the
> first and last sentences; Mann's choices, 17 Nov 2026); while open it reserves its height for focus and the footer.
> Gates H1–H7, R3, U2, U3, A2 and A3 in `tests/e2e/design-gates.spec.ts` (the prompt is checked against a preview built
> with a stand-in GA4 ID, `scripts/build-consent.mjs`). Record: [`docs/27-design-upgrade/phase-2-hero.md`](docs/27-design-upgrade/phase-2-hero.md).
>
> **Design upgrade, Phase 1 (17 Nov 2026): tokens.** One type scale (`--fs-hero` to `--fs-label`, plus `--fs-ui` for
> button and form labels) replaces about 90 one-off sizes, so section titles no longer outgrow page titles. Three
> weights (400, 500, 600; mono always 500), a −0.035em tracking floor, a 13px floor for visible text, section padding
> from `--section` and `--section-tight` only, and two head gaps for every eyebrow → heading → lead. The **lime budget**
> applies everywhere: lime marks the Λ's, one primary button per screen, the graph's live signal, live markers, focus
> rings and the free-check band. Prices are white, chips lost their dots, a heading's only lime is its full stop, and on
> the paper band "Website live" is a lime tag with ink text. Eyebrows carry a small Λ from the wordmark instead of a
> dot. Every hex colour now lives in `tokens.css`. The checks: `tests/unit/design-tokens.test.ts` (T1, C2) and
> `tests/e2e/design-gates.spec.ts` (T3, T4, T5, C1, L2). The Home H1 stays near its old size (`--fs-h2`) until Phase 2
> slims the hero and moves it to `--fs-hero`. Updated below: Colour, Typography, Spacing and layout. Record and
> numbers: [`docs/27-design-upgrade/phase-1-tokens.md`](docs/27-design-upgrade/phase-1-tokens.md).
>
> **Design upgrade, Phase 0 (17 Nov 2026): baseline only, no design change.** The design upgrade in
> [`DESIGN_UPGRADE_PLAN.md`](DESIGN_UPGRADE_PLAN.md) (from [`DESIGN_AUDIT.md`](DESIGN_AUDIT.md), 16 Nov 2026) runs one
> phase at a time, each with pass/fail gates. Phase 0 adds `scripts/design-shots.mjs` (`npm run qa:design`), which
> captures five pages across the ten-size device matrix and measures LCP, CLS, decoded bytes, DOM size, animations
> still running after 15 s and the H1/H2 sizes. Every later phase compares its before and after with it. Nothing on
> the site changed. Baseline numbers: [`docs/27-design-upgrade/phase-0-baseline.md`](docs/27-design-upgrade/phase-0-baseline.md).
> How to use it: **Checking the design** at the end of this file.

> **Round 11 (14 Nov 2026): agent graph hero, published prices, new menu.** This note overrides the
> sections below on the hero, "Tune in" and the signal sculpture, which were removed. The hero opens with
> Mann's face and name, keeps the service-and-place H1 (now "and AI automation"), shows the website price
> by the buttons and two dated projects. Its visual is the **agent graph** (`components/home/AgentGraph.astro`):
> an inline-SVG neural network with Google, Maps and AI answers on one side, Enquiry, Reply and Booking on
> the other, and Mann's real photo as the core node. Lime pulses travel the edges (CSS only, no canvas or
> WebGL), with a pause button, an off-screen pause and a still diagram under reduced motion. Left-to-right
> from 64em, top-to-bottom on phones. Since 14 Nov 2026 the core uses a closer crop of the photo
> (`assets/mann-patel-hero.jpg`, also the About photo), and the photo appears only once on Home: the lower section is now
> **How I work** (five steps and four promises) with no second photo or "Hi, I'm Mann". The menu is Work,
> Services, Pricing, About and Contact; Home gains a price list (`PricingTeaser.astro`).
> Details: [`docs/24-final-upgrade.md`](docs/24-final-upgrade.md).
>
> **Desktop tidy-up (14 Nov 2026).** From 64em the hero fills the first screen (`100svh` minus the
> header), so the light Selected work section never shows as a cut-off strip under it. The Home price
> list is a two-column table: name with its scope underneath, and every price in one fixed,
> right-aligned column. Pricing shows the five offers and the free check as an even 3 × 2 grid
> (2 × 3 on tablets); Services shows its five packages as 3 + 2. The comparison table has equal
> package columns and the price row first.
>
> **Logo update (10 Nov 2026): MΛNN PΛTEL.** The header logo is the outlined MΛNN PΛTEL wordmark
> (`components/ui/Wordmark.astro`, files in `public/brand/`). The favicon (13 Nov 2026) is the stacked
> MΛNN / PΛTEL icon: black tile, off-white letters, lime Λ's, bold Geist outlines sized to survive Google's
> circular crop (`scripts/make-favicon.py`, then `npm run images`).
> To sit with the lighter logo, headlines are now semi-bold at normal width (weights 580–620, `font-stretch`
> 100%, hover widening kept but softer) instead of heavy and expanded. Colours, layout and motion are
> unchanged: the lime accent stays. Details:
> [`docs/19-brand-black-and-white.md`](docs/19-brand-black-and-white.md).
>
> **Tech typography (10 Nov 2026, later the same day).** The whole site now sets in **Geist** (the
> wordmark's own family) with **Geist Mono** for labels. Mona Sans ("Signal Sans") and Instrument Serif
> are gone: the italic accent words became two-tone headlines (`.accent` grey, `.accent--signal` lime).
> The two Λ's in the logo are lime, and the footer name is the wordmark. Details:
> [`docs/20-tech-typography.md`](docs/20-tech-typography.md).

The design system for mannpatel.me. Every page uses these tokens through the CSS variables in
`src/styles/tokens.css`; components never use raw colours or one-off sizes.

**Idea.** Mann's work makes small businesses *visible* and *responsive*. The site behaves the same
way: a dark, quiet stage where things light up when you come close (the signal-line portrait, the
kinetic name, the lime signal colour). Clearly different from the earlier "Front Desk" direction
(paper, ink and stamp orange, tickets and stamps).

**Studied before deciding** (screenshots taken 8 Nov 2026, patterns only, nothing copied):

| Site | What we learned |
| --- | --- |
| rauno.me (Rauno Freiberg) | One confident typographic statement and one bold shape are enough for a hero. |
| brittanychiang.com | Dark, calm and highly legible. Sticky context column; muted text with bright emphasis. |
| joshwcomeau.com | Personality and small delights make a personal site memorable. |
| emilkowal.ski | Ruthless restraint: lists, not cards; generous space; fast. |
| guillaumecolombel.fr (Awwwards Site of the Day, Oct 2026) | Cinematic dark stage, one accent, interactive canvas as the signature. |

## Colour

Dark only (`color-scheme: dark`). Text contrast measured against `--bg`.

| Token | Value | Role | Contrast |
| --- | --- | --- | --- |
| `--bg` | `#0B0B0C` | Page background ("night") | — |
| `--bg-2` | `#111113` | Alternate sections, form fields | — |
| `--surface` | `#18181B` | Raised panels, menus, phone screens | — |
| `--surface-2` | `#212125` | Hover on surfaces | — |
| `--line` | `#2A2A2F` | Hairlines and dividers (decorative only) | — |
| `--control` | `#6F6F78` | Borders of inputs, checkboxes, outline buttons | 3.95:1 (≥ 3:1 for UI) |
| `--text` | `#F2F1EC` | Headings and body text | 17.4:1 |
| `--text-2` | `#B3B2AB` | Secondary text, descriptions | 9.3:1 |
| `--text-3` | `#8D8C86` | Labels, captions, metadata | 5.8:1 |
| `--signal` | `#D4F84A` | The one accent: primary buttons, focus ring, highlights, live states | 16.2:1 |
| `--signal-strong` | `#E4FF73` | The footer wordmark's Λ's as they light near the pointer | — |
| `--on-signal` | `#0B0B0C` | Text and icons on `--signal` | 16.2:1 |
| `--signal-wash` | `rgb(212 248 74 / 0.12)` | Selected chips, soft highlights | — |
| `--focus` | `var(--signal)` | The focus ring; light surfaces set it to `--focus-on-light` | — |
| `--focus-on-light` | `var(--ink)` (`#0B0B0C`) | The focus ring on light surfaces (the paper band, the free-check band), where lime is 1.2:1 | 17.4:1 on `--paper` |
| `--accent-on-light` | `#637B05` | Lime-family text or icons on white, if one is ever needed (not used today) | 4.81:1 on white |
| `--error` | `#FF6B57` | Errors and destructive notices | 7.0:1 |
| `--error-wash` | `rgb(255 107 87 / 0.1)` | Behind error notices and a field in error | — |
| `--warn` | `#F5C451` | "Not connected" and preview notes | 12.1:1 |
| `--warn-wash` | `rgb(245 196 81 / 0.1)` | Behind warning notices | — |
| `--paper` / `--ink` | `#F2F1EC` / `#0B0B0C` | Inverted moments (rare): prose code, toasts | 17.4:1 |
| `--paper-section` | `#F0F0E8` | The light Selected Work band | — |
| `--paper-text` / `-2` / `-3` | `#181A13` / `#43473B` / `#575A50` | Text on the paper band | measured on `--paper-section` |
| `--paper-line` | `#C7C8BA` | Hairlines on the paper band | — |
| `--media-bg-1` / `-2` | `color-mix(in oklab, var(--paper-section) 80%, var(--surface))` / `color-mix(in oklab, var(--paper-section) 68%, var(--surface))` (about `#BFBFBA` / `#A3A3A0`) | Backdrops behind project mockups: two tints of the paper band toward the surface colour (Phase 3; were teal `#BFC9C9` and pink `#D5C4C9`) | — |
| `--frame-*` | screen `#FFFFFF`, bar `#E9E9EC`, dots `#C4C4CA`, address `#5B5B63`, bezel `#1C1C20` | Browser and phone frames around captures | — |
| `--graph-*` | mesh `#3A3E2C`, spokes `#5B6236`, ring `#4A4F37`, nodes `#8D9A4A`, pill line `#3D3F33` | The agent graph's lime-tinted greys | — |

Every hex colour lives in `tokens.css`; components use the tokens (gate C2, `tests/unit/design-tokens.test.ts`).

**Lime budget (design upgrade Phase 1, 17 Nov 2026).** Lime marks only: the Λ's (wordmark and eyebrows), the one
primary button on screen, the agent graph's live signal, live markers (the status dot, "Website live"), focus rings and
the free-check band. Everything else is white or grey: prices (white, tabular figures), chip dots (gone), step numbers,
icons and arrows in lists, rail dots. A heading's only lime is its full stop (`<span class="stop">.</span>`, made by
`accentLine()` in `src/lib/headline.ts` for data-driven headings); whole phrases are never lime. On the paper band lime
is never text: the live tag is a lime fill with ink text (16.2:1) and accents are ink. Checked on Home one screen at a
time at 375, 768 and 1440 (gate C1, `tests/e2e/design-gates.spec.ts`): at most one lime mark per screen, not counting
the sticky header (its button follows gate U2), the wordmark and Λ's, the agent graph, the free-check band, headline
full stops and live markers. Lime is never a background for long text. No gradients on text, no purple, no glass.

**Forced colours (design upgrade Phase 8).** In a Windows contrast theme the browser swaps every colour for the
visitor's system colours and drops background fills. So nothing may rely on a fill or on lime alone: buttons carry a
1px edge (`ButtonText` in that mode), the focus ring is `Highlight`, and a chosen or current state that is only a lime
edge or a wash gets a 2px `Highlight` edge or outline (`@media (forced-colors: active)` in `global.css` and in each
component). A mark drawn as a fill (the Menu lines, progress bars) sets `forced-color-adjust: none` and paints itself in
a system colour (`ButtonText`, `Highlight`, `GrayText`). Display headings open up to 1.15 line height there. The agent
graph's SVG keeps its own colours (the mode leaves SVG paint alone) and reads on both. Gate A5 checks it.

**The Λ as a system glyph.** Eyebrows start with a small Λ cut from the wordmark (`--lambda`, a mask painted
`--eyebrow-mark`: lime on dark, ink on the paper band). The round dot is kept only where it means "live" (`.status__dot`).

**The signal gap (18 Nov 2026, Mann's choice of three).** Every Λ has a small slanted break in its right leg, like a
pulse passing through: the wordmark's two (header, footer, brand SVGs, sharing images), the eyebrow glyph and the
favicon's. It is one geometry, set in proportions of the Λ's own box, in `scripts/lambda_gap.py`: it prints the
wordmark's paths (`Wordmark.astro`, `--lambda`, `public/brand/`), and `scripts/make-favicon.py` uses it for the bold
icon (then `npm run images` for the PNGs and `.ico`). At the eyebrow's size the break is under a pixel, so the glyph
reads as the plain Λ there; it shows from the header wordmark up.

**The wordmark: two cuts, clear space and minimum size (18 Nov 2026, gates C4 and C5).**
- **Two cuts** of MΛNN PΛTEL, both outlines in `components/ui/Wordmark.astro`, both with the signal gap:
  - *regular*: Geist Regular, +26% tracking, for 20px tall and up (the footer, `public/brand/`, sharing images);
  - *small*: Geist Medium, +20% tracking (`scripts/wordmark_cut.py`), for anything smaller, where Regular's thin
    strokes read faint. The header uses it at 13px tall on phones and tablets and 16px from 64em.
- **Clear space:** one Λ cap height (the wordmark's own height) on every side, kept free of other text and controls.
- **Minimum size:** 12px tall for the small cut, 20px for the regular cut. Below 12px, use the favicon's stacked mark.

## Typography

| Family | File | Use |
| --- | --- | --- |
| **Geist** (variable weight 100–900) | `geist-sans-wght.sub.woff2`, 24 KB | Everything: display, headings, body, buttons |
| **Geist Mono** (variable weight) | `geist-mono-wght.sub.woff2`, 15 KB | Labels, metadata, numbers, the live clock |

One family, two cuts, the same one the MΛNN PΛTEL wordmark is drawn from. The served files are
subsets cut to the characters the copy uses (`scripts/subset-fonts.py`; 39 KB in all, down from 95 KB
with Mona Sans and Instrument Serif). New characters in the copy: add them to the script and to
`unicode-range` in `tokens.css`.

**Two-tone headlines.** The second half of a heading steps back instead of changing typeface:
`<span class="accent">` sets it in `--text-3` grey, same face and weight. Its full stop may be lime (see the lime
budget). On the lime free-check band the accent is a dark olive (5.9:1).

Self-hosted, SIL OFL 1.1, `font-display: swap`, metric-adjusted Arial fallback (`Geist Fallback`).

**Type scale (design upgrade Phase 1, 17 Nov 2026).** A component picks one of these tokens and never a raw size (gate
T1, `tests/unit/design-tokens.test.ts`). The one exception is the agent graph's SVG labels, sized in the graph's own
units; the footer wordmark is an outline sized by width. The hierarchy holds at every width: hero ≥ h1 > h2 > h3 > lead.

| Token | Size, 375 → 1440px | Line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| `--fs-hero` | 41.6 → 96px | 0.92 | 600 | `--track-hero` −0.035em | The Home H1 (from Phase 2), the free-check landing page H1 |
| `--fs-h1` | 38.4 → 80px | 0.95 | 600 | `--track-hero` | Page titles, case-study titles |
| `--fs-h2` | 32 → 60px | 1.0 | 600 | `--track-head` −0.025em | Section titles; never above `--fs-h1` |
| `--fs-h3` | 22 → 30px | 1.1–1.15 | 500 (600 for names and prices) | `--track-head` | Item titles, project names, prices |
| `--fs-lead` | 18 → 22px | 1.45 | 400 | −0.01em | Intros, sublines, question titles |
| `--fs-base` | 17 → 18px | 1.6 | 400 | 0 | Body |
| `--fs-ui` | 16px | 1.15–1.35 | 500 | −0.01em | Button and form labels |
| `--fs-sm` | 15px | 1.5 | 400–500 | 0 | Hints, captions, small UI, footer links |
| `--fs-label` | 13px | 1.4 | mono 500 | `--track-label` +0.08em, uppercase | Eyebrows, metadata; the floor for visible text |

**Weights:** `--w-body` 400, `--w-ui` 500, `--w-head` 600, and mono text is always 500. Bold text and table headings
use 600, not the browser's 700 (gate T3: at most four weight and family pairs on Home). **Tracking** never goes
below −0.035em (gate T4). **No visible text under 13px** outside `aria-hidden` decoration (gate T5). Geist has no width
axis, so hover effects that used to widen a word now open its tracking instead (to −0.02em). Body line length 60–72
characters (`--measure`).

## Spacing and layout

4-px base: `--s-1` 0.25rem, `--s-2` 0.5rem, `--s-3` 0.75rem, `--s-4` 1rem, `--s-5` 1.5rem, `--s-6` 2rem,
`--s-7` 3rem, `--s-8` 4rem, `--s-9` 6rem, `--s-10` 8rem. Sections: `--section` 3.5 → 10rem, and
`--section-tight` 2 → 4rem for the hero, the Selected Work band and compact sections (and every section on phones
that used its own smaller padding). Section padding comes only from these two (gate L2,
`tests/e2e/design-gates.spec.ts`). **Section heads** are spaced the same everywhere: eyebrow → heading
`--head-gap-1` (12 → 20px), heading → lead or intro `--head-gap-2` (16 → 28px), whether the head is a grid
(`.section-head`, the Home sections) or a `.stack`, and in page heads (PageHead's pattern: rows `--head-gap-2` apart,
the eyebrow pulled up to `--head-gap-1`). Gate L4 measures it on every page (re-audit, 18 Nov 2026).
**Two-column sections** (a head beside long content): from 64em the head column is sticky
(`top: calc(var(--header-h) + var(--s-6))`), so it stays beside its content instead of leaving an empty column (gate
L1). A head that is a child component (a `Heading`) needs `:global(:first-child)` to be reached from a page's style.
**Containers** (design upgrade Phase 6): a card or tile whose inside changes with its width is a container
(`container: <name> / inline-size`), with one inner wrapper laid out by `@container`. Examples: the services tiles
(`ss-tile`, the smaller scene under 20rem), the promise tiles (`rule`, icon beside the text from 24rem) and the
Selected Work cards (`sw-card`, side by side from 58rem). The screen-level grids that place them still use media
queries. Put something beside a tile's words only if they keep about 20rem (40 characters) at the threshold, as the
promises do: a services scene beside the words was tried at 30rem and left them 15rem, so it was dropped.

**Touch targets**: every link and button outside running text is at least 44 × 44px on touch screens (gate R4). A
standalone text link uses `.link--tap`; a link inside a sentence is exempt (WCAG 2.5.8).

**Display headings** wrap with `text-wrap: balance` and never leave a short word alone on their last line (R6). A long
word that fills its own line is fine; a project name is kept together with non-breaking spaces.

Content width `--container` 90rem with `--gutter` 1 → 3rem; text `--measure` 68ch. 12-column grid on
desktop, one column on phones. Layouts alternate (split, full-bleed, sticky, list) so no two sections
in a row look the same.

**Hero (design upgrade Phase 2, 17 Nov 2026).** Text column, top to bottom: greeting row (photo under 64em), H1
(`--fs-hero`, its full stop lime), subline (`--fs-lead`), button row (the lime free-check button and "See prices →"), price
line (mono, `--text-3`). Graph beside it from 48em, below it on phones (at most 18rem wide there). The label stays on one
line from 390px; on 320px phones and phones held sideways the button row moves up to follow the H1. Selected Work comes
straight after the hero: its heading starts by y=1,000 at 1440×900 and y=1,500 at 390×844 (D9, tested).

**Home order (round 7; hero changed in rounds 8–10 and on 10 Nov 2026).** Hero (the service-led H1
"Web design and local SEO for Toronto service businesses", the free-check button and "See the work",
Mann's clear portrait, then the **process strip**: Found. Answered. Booked., each with what it means) →
**selected work** (both projects) → a labelled **walkthrough with fictional data** (round 10) → three
service summaries with plain names, each naming its package → free check → how I work → questions →
closing call to action. Real work starts by y≈1120 at 1440×1000 and y≈1640 at 390×844 (tested; on
phones the portrait is 5:4 and sits between the buttons and the strip). Why the H1 changed:
[`docs/21-growth-seo-launch.md`](docs/21-growth-seo-launch.md).

**Service pages (round 10).** `/services/` stays the overview (its `#anchors` still work) and links to
three focused pages from one template (`pages/services/[slug].astro`, content in `data/service-pages.ts`):
`/services/web-design/`, `/services/local-visibility/`, `/services/enquiry-follow-up/`. Each answers: who
it's for (and who it isn't), what actually happens, honest evidence (real projects with their status, a
labelled sample, or the fictional walkthrough), the package with its boundary and price line, limits,
costs paid to other providers, handover, buying questions and sources. `/pricing/` uses the same package
cards and table; it stays unlinked and `noindex` until a price is approved (`data/packages.ts`).

**Phones (under 48em) stay short.** A client should get the whole story in a few thumb-flicks:

- **Both projects are always in the normal reading order** (stacked cards, never a sideways rail),
  so neither can be missed. The tuner follows the hero buttons and starts when it scrolls into view.
- **Swipe rails** (`.rail` + `data-rail`) for secondary groups: house rules, packages, the five
  project steps, About chapters, the close-ups and captures on case studies, and (since the design upgrade's Phase 3)
  the services and promises bentos on Home. A rail that is also a `role="list"` list sets its own side padding, since
  the list reset removes it. Snap points, the
  next card peeking, dots underneath. A rail with no links gets a tab stop only while it scrolls.
- **Folds**: long question lists show five questions and a "Show all" button; case-study write-ups
  show their opening and "Read the full case study"; case-study evidence previews its first check.
  Keyboard focus moving into folded text opens it, and without JavaScript everything is shown.
- Smaller section padding, one line per service until it is opened, and a compact footer.
- **The menu sheet fits one screen** at any phone height (tested at 320×568, 375×667 and 390×844):
  the links use `--fs-h2` and their spacing scales with the screen height, and on short phones the contact buttons
  become round icons (each keeps its name) so every link down to Privacy and Terms is visible.
- Budgets (in 390 × 844 screens) are tested in `tests/e2e/site.spec.ts`: Home 10.5, Services 12,
  case studies 7 (they carry the evidence section), About 6.5, Work 4.5, Contact 3.5.

## Shape and depth

Radius: `--r-sm` 8px (chips, small controls), `--r-md` 14px (inputs, panels), `--r-lg` 28px (media,
phone), `--r-pill` 999px (buttons). Depth comes from surface steps and hairlines, not shadows. Two shadow tokens only,
each for one job:

- `--shadow-pop` for floating layers (menu, ⌘K palette, toast, consent bar).
- `--shadow-media` (design upgrade Phase 5) for mockups: the capture frames, the portrait core in the agent graph and the
  free-check receipt. It is the single exception to "depth comes from surfaces". It is one plain shadow with no spread,
  so it works as a `box-shadow` and in `filter: drop-shadow()`.

Besides these, a component may draw only focus rings (`0 0 0 Npx`), the lime button glow (`--signal-glow`) and lime
glows on live marks (gate G3).

## Components

- **Primary button** (`.btn`): lime pill, ink text, ink circle with the arrow. Hover: the label rolls
  up and is replaced by a copy from below; the arrow circle turns. Press: scales to 0.97. Focus:
  2px lime ring offset 3px. Disabled: 45% opacity, no motion.
- **Secondary button** (`.btn--ghost`): 1px `--control` outline, text colour; hover fills from the
  bottom with `--text` and flips the label to ink.
- **Quiet link** (`.link`): text with an underline that draws from the left on hover/focus.
- **Inputs**: 56px tall, `--bg-2`, 1px `--control` border, 14px radius, label above, hint below.
  Focus: lime border + lime ring. Error: `--error` border, message with icon, `aria-invalid`.
- **Choice chips** (checkbox/radio pills): outline pill; checked = lime wash + lime border + tick.
- **Accordion** (`details`): hairline rows, a plus that turns into a minus, smooth height.
- **Navigation**: sticky bar, wordmark + live status left, five links centre-right (Work, Services, Pricing, Guides,
  About; Vision is in the footer since Phase 2, D3), "Contact" right; phones get a full-screen sheet. ⌘K / Ctrl K opens a
  quick menu (pages and actions). On Home the header button is an outline while the hero button is on screen, then
  lime (D5); same size either way.
- **Consent prompt** (`components/Analytics.astro`, production builds only): one row along the bottom edge, text left,
  "Allow" (white pill, so the page's lime button stays the only lime one) and "No thanks" right. After the skip link in
  the page, so the skip link is the first Tab stop. Shows after the first scroll or 4 s; while open, the page reserves
  its height (scroll padding and bottom padding), so nothing focused or at the very end of the page hides under it.
- **Footer**: closing call to action, link columns, and the kinetic MΛNN PΛTEL wordmark (letters lift and turn lime near the cursor).

## Imagery and icons

- The only photo is Mann's real portrait: on Home it is the **Tune in** radio (below); the full street
  photo is also on About. Never generated or stock. The signal-line drawing now lives only on the 404 page.
- **Project images** are real captures of real sites, captioned with dates, in **one frame system**
  (`components/work/MediaFrame.astro`, design upgrade Phase 5):
  - **Kinds:** `browser` (a desktop capture under a browser bar with the site's address), `phone` (a phone capture in a
    bezel) and `plain` (a close-up on a white card with a hairline).
  - **Backdrops:** `ProjectMedia` composes a browser frame and a phone frame on a backdrop. The backdrop is `--pm-bg`:
    the dark surface by default, `--media-bg-1`/`--media-bg-2` (paper tints) in the Selected Work band. No project
    colours.
  - **Shadows:** browser and phone frames carry `--shadow-media`. Colours come from the `--frame-*` tokens.
- **Formats:** captures and the portrait are AVIF with a WebP fallback (`<Picture formats={['avif']}
  fallbackFormat="webp">`).
  - `srcset` reaches twice the shown width wherever the source file is wide enough. Otherwise the full source width is
    served, and gate G2 lists the image as needing a higher-resolution capture.
  - Images are lazy below the first screen. At most one image per page has high priority.
  - Each image's file is no larger than its shown size × the screen's density needs (gate G1).
- **Avatar:** the phone greeting row uses its own head-and-shoulders crop of the portrait, `assets/mann-patel-avatar.jpg`
  (`scripts/make-avatar.mjs`).
- Example screens (phone mock-ups) are built in HTML, labelled "Example", and use fictional names.
- Icons: one inline SVG set, 24px grid, 1.75px stroke, round caps. No emoji.
- **Line weights** (design upgrade Phase 5, task 5.4): the agent graph, the services scenes and the promise icons draw with
  `--graph-stroke-fine` (1: mesh, outlines), `--graph-stroke` (1.5: nodes, spokes, drawings, the promise icons),
  `--graph-stroke-bold` (2: one highlighted mark) and `--graph-stroke-signal` (3: a lit route), with round ends.
  - Lines use the `--graph-*` greys, the objects `--text-2`/`--text`, and lime marks only the signal (the pin's dot, the
    read ticks, lit routes).
  - The scenes and icons are `aria-hidden`; the tile text carries the meaning (gate G4).
- **Mockup backdrops**: `--media-bg-1` and `--media-bg-2`, tints of the paper band toward the surface colour.

## Motion

Design upgrade Phase 4 (17 Nov 2026; `DESIGN_AUDIT.md` → Motion system). One story per screen (the hero's signal path),
nothing loops forever, entrances ease out and exits ease in at about 70% of the entrance. Transform and opacity only,
CSS first, longhand `animation-*` properties wherever `animation-timeline` is used.

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals, the hero |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes, accordions, the graph's orbit |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Exits: the phone menu closing, the old page |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Magnetic return, small pops |
| `--dur-1` / `--dur-2` / `--dur-3` | 120 / 200 / 320 ms | Colour and press / small UI and exits / menus, accordions, toasts |
| `--dur-4` / `--dur-5` | 560 / 800 ms | Element reveals and the label roll / hero headline lines |
| `--stagger` | 60 ms | Lists and lines (`--d` on a load reveal counts steps of it) |
| `--dur-loop` | 4200 ms | One agent-graph cycle |
| `--dur-page-out` / `--dur-page-in` | 220 / 420 ms | Page transitions (gate M4: at most 450) |

All are 0 under `prefers-reduced-motion`. No component writes a raw duration, and scripts read these tokens (gate M1).

- **Hero entrance** (about 1.6 s): wordmark lock-on (first visit) at 0, greeting at 60 ms, the H1's two lines from 120 ms
  (60 ms apart), the graph's core at 320 ms (scale 0.92 → 1, orbit fading in), the subline, buttons and price line from
  380 ms, the graph's lines and pills by about 1.1 s. Everything is painted from the first frame and only rises into
  place (Mann's choice), so the H1 stays the LCP element.
- **Agent graph** (D8): the first pulse runs Google → core → Booking at about 1.2 s and the core's glow breathes once
  when it arrives; route 0 and route 4 (Maps → Reply) then alternate every 2.1 s for three cycles each, with the core
  pinging, the Booking pill glowing, nodes twinkling and the orbit turning a third of a turn, and everything rests by
  about 13 s (the two routes stay lit). Pointer, focus or a tap wakes it for three more cycles; the pause button pauses
  it, or plays it again once it rests. Hovering or tapping an input pill lights that pill's two routes and the pills they
  reach, and dims the rest to 30%. Only the layout on screen animates.
- **Reveals**: section heads (headings split into lines) and media (`data-reveal="media"`, `.reveal-clip`) on a CSS view
  timeline inside `@supports`; first-screen content on load (`data-reveal="load"`, `Heading load`), rising only.
  Paragraphs, lists and buttons are never hidden. Without JavaScript nothing moves (gate M6).
- **Page transitions**: the old page fades and shrinks a little (220 ms, `--ease-in`), the new one rises in (420 ms,
  `--ease-out`); the header holds still.
- **Wordmark**: per-letter groups in the header. Once per visit (`sessionStorage`), the letters settle in from wider
  spacing while the two Λ's rise from the baseline; hover or keyboard focus runs one lime sweep across the letters. The
  whole MANN PATEL stays in the header at every scroll position (18 Nov 2026: the Phase 4 condense to "MΛ" read as the
  logo disappearing, so Mann had it removed).
- **Hover and focus**: lime buttons glow (an opacity-only layer), labels roll and arrows turn; every hover state has a
  matching `:focus-visible` (or `:focus-within` for a label around a control) state (M8). The magnetic pull is on
  `[data-magnetic]` only: the hero and footer buttons, at most 6px.
- **Start-up cost** (gate M7): work that reads the layout (rails, progress lines, the header's watchers, the graph's
  setup) waits for an idle moment, and the header clock works out Toronto time itself instead of building a time-zone
  formatter.

Signature moments: **Tune in** (below), the **headline that acts out its words** (below), kinetic
hero words (weight and tracking settle in, and flash lime when the signal locks), headings revealed line by line, the process line that draws itself on
Services, and the footer name. Everything is off under `prefers-reduced-motion`; content never waits
on JavaScript.

### The three words act out what they say (round 9; in the process strip since 10 Nov 2026)

The words are no longer the H1: they sit in the hero's three-step strip, each above one plain
sentence. `Hero.astro` (markup and CSS) + `scripts/hero-words.ts` (replay). Each word plays a two-second
scene that shows what it means, one after another, once, on arrival:

| Word | Scene | Finished state |
| --- | --- | --- |
| **Found.** | Highlighted like a search match (lime box, ink text), then a map pin drops onto the full stop with a ripple | Lime pin standing on the full stop |
| **Answered.** | A chat bubble with typing dots pops up over the end of the word, then the reply is read | Lime double "read" ticks over the full stop |
| **Booked.** | Circled by hand, like a date on a calendar | Off-white hand-drawn circle |

Hovering a word (mouse) or tapping it (touch) plays its scene again. The words are real text from
the first frame (the headline stays the LCP element); the pin, bubble, ticks and circle are
`aria-hidden` decoration with no text. Reduced motion and no JavaScript show the finished state. The
tuner's lock flash still runs over the top. Why: `docs/16-round-9-headline.md`.

### Tune in (round 8; starts clear since round 10)

**Round 10 change (competitor audit, 8 Nov 2026):** the portrait now starts **clear and tuned in**
(104.3, "On air: Mann Patel, Toronto. Try the dial."), so visitors recognise Mann at once and nothing
depends on dragging. The dial (labelled "Try the dial") is optional: tune away for the lost-signal effect,
tune back for the lock, the headline flash and the ping. There is no automatic sweep or auto-tune any
more, the coordinates were removed from the photo, and WebGL draws only while the signal is detuned. The
original round-8 behaviour is described below for the record.


`components/home/TuneIn.astro` + `scripts/tune.ts`. Mann's real photo is a radio station. It arrives
as a lost signal (lime-on-black static, scanlines, colour split, tearing, a slow roll; "No signal")
and the visitor tunes an FM dial, or drags sideways across the photo, toward **104.3**, where a small
lime "Mann" flag marks the station. The picture clears as the dial gets close and snaps on within
0.3 MHz. On lock: full colour, the three headline words flash lime in turn, a radar ping crosses the
hero's dot field (`signal:ping` event, `field.ts`), and three true lines type over the photo. Then
"Who is this guy?" leads to About. Why this works: `docs/15-round-8-tune-in.md`.

| State | What shows |
| --- | --- |
| Searching (before lock) | Static over a lime silhouette; frequency, signal bars, "On air" dot red; status "No signal. Drag the dial, or the photo, to tune in." |
| Getting closer | Picture clears; status "Getting closer…" then "Almost there…"; bars fill |
| Locked | Clear photo, lime frequency, full bars, transmission lines, status "Signal locked: Mann Patel, Toronto." |
| Lost again | Status "Signal lost. Tune back to 104.3." |
| Left alone | A short sweep when it first comes into view, then it tunes itself in after 6.5 s |
| Reduced motion | Starts locked, no animation; the dial still works |
| No WebGL / CPU-only GPU | Same story in CSS filters over the real image |
| No JavaScript | Just the clear photo, its lines and "Who is this guy?"; no dial or readouts |

The dial is a native range input (keyboard: arrows 0.2 MHz, Page Up/Down 2 MHz, Home/End), named
"Tune in", with `aria-valuetext` ("104.3 FM, signal locked") and a polite live status. The animation
runs only while something changes and pauses off screen. The photo is the image itself (alt text,
eager, high priority); on phones the tuner follows the buttons so the first-screen LCP stays the
headline.

## Effects layer (round 6, pared back in round 7)

`src/scripts/fx/` and `src/components/fx/`. Progressive enhancement only: the page is complete
without it, it never delays the first paint, reduced motion turns it off, and pointer effects run
only for a mouse or trackpad. Round 7 kept one effect per job, after the audit asked for restraint.

| Kept | Where | Behaviour |
| --- | --- | --- |
| **Signal field** (`Field.astro`, `field.ts`) | Home hero, 404 | WebGL dot map with a faint aurora toward the portrait; dots swell near the pointer; a click or tap sends a radar ping, and so does the tuner when it locks (`signal:ping`). Static CSS dots without a GPU or with reduced motion. Time stops a few seconds after the last interaction. |
| **Magnetic buttons** (`pointer.ts`) | `[data-magnetic]`: the hero and footer buttons (design upgrade Phase 4) | Lean toward the pointer by at most 6px and spring back (CSS `translate`). |
| **Spotlight** | `[data-spotlight]`: project cards, work rows, packages, contact panels | A soft light and a lit border follow the pointer. |
| **Decoding** (`text.ts`) | `[data-scramble]` only: the coordinates on the tuner | Glyphs lock in left to right; screen readers get the real text. |
| **Reading line** | Header | 2 px lime scroll progress (CSS scroll timeline). |
| **Page transitions** | Between pages | Old page fades out (220 ms), new one rises in (420 ms), header holds still (Phase 4). |
| **Image reveals** | Case-study close-ups and captures | Frames open as they scroll in (CSS view timeline). |
| **Load-time intros** | First screen of every page | CSS from first paint (`data-reveal="load"`, `Heading load`), never waiting for a script; text and buttons rise only, never hidden (Phase 4). |

**Removed in round 7:** the scroll marquee, the cursor follower, 3D tilt, word-by-word scroll
lighting, decoding on every label, and the dot field behind page titles and the footer.

## Components added in round 7

| Component | States | File |
| --- | --- | --- |
| Selected-work card: relationship, website status (kept apart from business status), problem, role, date checked | default, hover, focus | `components/home/SelectedWork.astro` |
| Service summary (three, linking to Services) | links: hover/focus | `components/home/ServiceSummary.astro` |
| Free-check form: name, email, website **or** business name, optional note | idle, invalid, sending, sent, not connected (email app + copy), failed (copy) | `components/CheckForm.astro` |
| Brief / free-check chooser | `aria-current` on the chosen form | `pages/contact/index.astro` |
| Case study: at a glance, evidence table (stacked on phones with explicit table roles), limitations, outcomes, next step | folded preview on phones | `pages/work/[id].astro` |
| Package comparison table | scrollable labelled region on narrow screens | `pages/services.astro` |

## Checking the design

Since the design upgrade (Phase 0, 17 Nov 2026), every design change is checked the same way:

1. **Screenshots and numbers before and after.** Build each version for production and capture it:
   `npm run build:cloudflare && npm run qa:design -- --serve dist/client --metrics --label before` (then `--label after`
   on the changed branch). The build for production matters: it carries the GA4 ID, so the consent prompt shows as it
   does for a first visit. The script captures `/`, `/services/`, `/work/nest-and-rest-cleaning/`, `/about/` and
   `/contact/` at 320×568, 360×740, 375×812, 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080 and 844×390.
   It writes a first-screen and a full-page capture of each, a contact sheet per report width (375, 768, 1440),
   `summary.md` and `results.json` to `qa-output/design/<label>/`. Lab numbers depend on the machine, so compare runs
   from the same machine. `npm run qa:design -- --compare before,after` then puts the two runs side by side:
   `compare-375.jpg`, `compare-768.jpg`, `compare-1440.jpg` (first screens) and `compare.md` (the numbers, before → after)
   in `qa-output/design/compare-before-after/`.
2. **Performance.** Keep Home under 950 elements (gate P3): something the page doesn't show until a click (a closed
   menu, the graph's other layout) waits in a `<template>` and joins the page when needed. Keep CSS inline unless a new
   measurement says otherwise (`docs/stack.md`).
3. **The gates.** Each phase adds its pass/fail checks to `tests/e2e/design-gates.spec.ts` (in the browser) and
   `tests/unit/design-tokens.test.ts` (in the source), as listed in [`DESIGN_UPGRADE_PLAN.md`](DESIGN_UPGRADE_PLAN.md) §5.
