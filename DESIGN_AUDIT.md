# Design audit: mannpatel.me

**Date:** 16 Nov 2026 · **Scope:** Home page (every section), plus a quick consistency look at `/work/nest-and-rest-cleaning/`, `/about/` and the mobile menu · **Type:** report only. No site file was changed.

> Every code snippet in this report is an **illustrative example**. None of it has been written into the site.

---

## Method and evidence

| Source | What was used |
| --- | --- |
| Codebase (commit `e6e7544`) | `src/styles/tokens.css`, `src/styles/global.css`, `src/components/home/*.astro` (Hero, AgentGraph, SelectedWork, ServiceSummary, PricingTeaser, FreeCheck, HowIWork), `Header.astro`, `Footer.astro`, `Analytics.astro`, `ui/Wordmark.astro`, `ui/Button.astro`, `layouts/BaseLayout.astro`, `scripts/motion.ts`, `scripts/fx/*`, `astro.config.mjs`, `DESIGN.md`, `lighthouserc.json` |
| Live site | `https://mannpatel.me/` rendered in headless Chromium (Playwright) at **375×812, 768×1024 and 1440×900**: first-screen and full-page screenshots, one pass before scrolling and one after scrolling through the page |
| Lab measurements (same runs) | LCP, CLS, bytes by type, DOM size, running animations, focus order, `elementFromPoint` overlap test, computed font sizes and tracking for every H1/H2, contrast ratios calculated from the token hex values |

**Limits.** Metrics are lab numbers from an unthrottled cloud connection, not field data. Real mid-range phones on 4G will be slower **[unverified]**. Only Chromium was tested, not Safari or Firefox **[unverified]**. Hover, magnetic and cursor effects were judged from the code, not watched on screen. No screen reader was run.

---

## Scorecard

| # | Category | Score | Evidence-based justification |
| --- | --- | :-: | --- |
| 1 | Hero / first impression | **6** | Clear in 5 seconds: the H1 says what, where and for whom, prices are visible, and the agent graph with the real portrait is an ownable visual. But the first desktop screen holds about 12 separate elements and four kinds of call to action, and the H1 (59px at 1440) is smaller than four of the section H2s further down. |
| 2 | Landing page structure and flow | **7** | The order makes sense: hero, proof (work), services, prices, free check, process, FAQ, closing CTA. The free check repeats as a steady conversion thread. Against that, recent work is listed twice (hero cards, then Selected Work right below), and there's no social proof because `ReviewsStrip` renders nothing until real reviews exist. |
| 3 | Typography | **5** | Geist and Geist Mono match the wordmark and body text is comfortable (17–18px, 68ch measure). The hierarchy is inverted, though: at 1440 the H1 is 59px while `#work-title` is 122px and `#ss-title` 95px. Tracking as tight as −0.085em makes letters collide ("Scarborough", "booking"). The CSS uses 10 different font-weight values, and components and pages hold 34 one-off `clamp()` font sizes that bypass the type tokens. |
| 4 | Color and brand consistency | **6** | The palette is well documented, its contrast measured, and the lime is distinctive. DESIGN.md says "lime marks *one* thing per view", but the first desktop screen has about 15 lime marks (both Λ's, header CTA, hero CTA, two prices, three chip dots, status dot, rings, pulses, Booking pill, card arrows). On the light Selected Work section the lime becomes olive `#40541e`, which dilutes the brand. |
| 5 | Layout, spacing, hierarchy | **6** | The container, grid and spacing tokens are solid, and layouts alternate as intended. But the hero is crowded while later sections are sparse. "How I work" leaves about 600px of empty left column at 1440, section 02 has a large gap between heading and lead, and section padding is set per component instead of through `--section`. |
| 6 | Graphics and imagery | **7** | The real portrait, real captures in consistent desktop-plus-phone frames, one icon set and generated OG cards all build trust. The weak spots: only two projects, and the services, process and promises sections have no visuals at all. The mockup tints (`#bfc9c9`, `#d5c4c9`) are off-palette. |
| 7 | Motion and animation | **6** | The engineering is excellent: transform and opacity only, WAAPI sparks, CSS scroll timelines, view transitions, full reduced-motion support. The art direction is not. There are eight or more separate motion systems and two parallel token sets plus hard-coded 520/800/820/900/1000/1300ms values. Reveals take 1100ms and page transitions 900ms. 37 animations loop forever on Home, which contradicts the site's own rule (`global.css`: "nothing on the page moves forever"). The hero text entrance is a 14px nudge with no choreography tied to the graph. |
| 8 | UX and navigation | **7** | The mobile sheet is excellent (fits one screen, `dialog` focus handling), and the ⌘K menu, sticky header and reading-progress line all work well. Against that: the nav has 6 items including "Vision", and the header CTA ("Contact") competes with the hero CTA ("Get a free website and Google check"). At 1440 the consent banner covers the graph's pause button (verified with `elementFromPoint`). |
| 9 | Responsiveness (375 / 768 / 1440) | **6** | No horizontal overflow at any width, and the rails and menu work. But the tablet H1 (72px) is larger than the desktop H1 (59px). The hero is 1.7 screens tall on 375 and 1.65 screens on 768. On phones only the top of Mann's face shows at the very bottom of the first screen, and the open consent banner covers it. The primary CTA wraps to two lines at 375. |
| 10 | Performance and polish | **8** | LCP 0.29s at 1440, 0.32s at 768 and 0.89s at 375 (lab), CLS about 0, fonts 39KB subset and preloaded, about 340–378KB total, Lighthouse budgets enforced in CI. Costs: 77KB of CSS is inlined into every HTML page (`inlineStylesheets: 'always'`, HTML 188KB raw / 35KB brotli), the agent graph SVG is in the DOM twice (1,205 nodes, 251 paths), and 37 infinite animations run. |
| 11 | Accessibility | **8** | Strong base: lime 2px `:focus-visible` ring, skip link, reduced motion verified (0 running animations, pause toggle hidden), a WCAG 2.2.2 pause control, `role="img"` wordmark, detailed alt text, and an a11y = 1.0 CI gate. Gaps: the consent banner comes before the skip link in tab order (`body` child 0), 11.5–11.7px text on phones (`.hero__role`, `.sw__labels`), and hero service chips are 30–32px tall (they pass the WCAG 2.5.8 AA 24px minimum but miss the site's own 44px rule). |

**Overall: 65 / 100** (72 of 110 points, scaled to 100).

> **Re-audit after the upgrade (18 Nov 2026): 92 / 100** (101 of 110), scored gate by gate in
> [`docs/27-design-upgrade/phase-9-reaudit.md`](docs/27-design-upgrade/phase-9-reaudit.md); **94** (103.5) after its
> fixes. Structure and imagery wait on owner inputs (a real testimonial; a third project and one more photo).

**Verdict:** A fast, honest, carefully engineered site whose visual voice is drowned out by too many elements, an inverted type scale and lime on everything. It needs **editing, not reinventing**.

---

## Strengths

1. **The agent graph is a real signature.** Inputs (Google, Maps, AI answers) flow through Mann's actual face to outputs (Enquiry, Reply, Booking). It explains the offer, it belongs to this brand and no other, and it's built in CSS/SVG with a pause button and an off-screen pause (`AgentGraph.astro`).
2. **The performance discipline is top tier.** Lab LCP is under 1s at every width and CLS is about 0. Fonts are subset to 39KB and preloaded. Animations are limited to transform and opacity. Lighthouse budgets (perf ≥ 0.9, a11y = 1, LCP ≤ 2.5s, CLS ≤ 0.1) run in CI (`lighthouserc.json`).
3. **Accessibility is built in, not bolted on.** Reduced motion was verified in the browser (0 running animations), there's a global focus ring, the menu uses a native `<dialog>`, tap targets are 44px, the wordmark announces as "Mann Patel", and alt text is descriptive.
4. **The conversion content is honest and clear.** Prices are published in the hero and in a clean table, there's a no-obligation free check, an "everything stays in your name" promise and dated project captures. That builds trust with small-business owners.
5. **The brand system is documented and the rhythm is bold.** Tokens and a contrast table live in `DESIGN.md` and `tokens.css`. The page moves dark → paper → dark → lime band, and the full-width kinetic MΛNN PΛTEL footer is a memorable sign-off.

## Weaknesses

Top five (details and fixes in the table below):

1. **Inverted type hierarchy.** The H1 is not the biggest text on the page at any width: at 1440 it's H1 59px against H2s of 122, 95, 74, 66 and 65px; at 375 it's 35px against 42, 48, 40 and 42px.
2. **The hero is overloaded.** It holds a greeting, status chip, H1, subline, three service chips, two buttons, a price line, four contact icons, two recent-work cards, a Vision link and the graph with its caption.
3. **Lime is everywhere, so it no longer signals anything.** That breaks the doc's own "one lime per view" rule, and the olive substitute weakens the brand.
4. **Tracking is too tight and weights sprawl.** Tracking runs from −0.06 to −0.085em (letters touch at display sizes), there are 10 distinct font-weight values, and 34 component-level `clamp()` sizes bypass the tokens.
5. **The motion system is fragmented and slow.** It mixes two token sets and hard-coded durations. Reveals take 1.1s and page transitions 0.9s, 37 animations loop forever, and scroll reveals keep content hidden until an IntersectionObserver fires: the first full-page capture showed the free-check headline, its checklist and the FAQ as blank space.

### Full findings and fixes

| ID | Problem (evidence) | Recommended fix | Effort | Impact |
| --- | --- | --- | :-: | :-: |
| W1 | **Inverted hierarchy.** `.hero__title` uses `clamp(3.1rem, 4.1vw, 4.6rem)`, which gives 59px at 1440, while `.sw__title` uses `clamp(2.65rem, 8.5vw, 8.25rem)`, which gives 122px. At 768 the H1 is 72px, larger than on desktop. | Adopt the scale in **Typography**: the H1 is always the largest (≥1.4× the largest H2 on desktop). Delete the per-component `clamp()` overrides and use tokens only, as `DESIGN.md` already requires ("components never use … one-off sizes"). | M | High |
| W2 | **Hero overload.** About 12 elements and four CTA types in the first desktop screen (screenshot `home-1440-hero`). | Cut the hero to six things: greeting with avatar, H1, subline, primary CTA, a quiet secondary link and the price microline, plus the graph. Move the service chips to the services section, drop the hero recent-work cards (Selected Work sits directly below), move the "reach me directly" icons to the footer CTA (already there) and move the Vision link to the footer. See **Hero redesign**. | M | High |
| W3 | **Lime dilution.** About 15 lime marks in the first screen. `.sw` maps `--signal` to olive `#40541e` on paper. | Set a **lime budget** of three roles: (1) the Λ's, (2) the one primary CTA in view, (3) the live signal (graph pulses and Booking pill). Show prices in `--text` with tabular numbers, remove the chip dots, and make the header CTA an outline while the hero CTA is on screen. On paper, use lime as a *fill* with ink text (16.2:1) for tags like "Website live" instead of olive text. | S | High |
| W4 | **Over-tight tracking and weight sprawl.** −0.085em on `.sw__title`, −0.075em on `.ss__title` and `.about__title`, −0.06em on the H1. Weights in use: 400, 500, 520, 540, 560, 600, 625, 650, 700, 800. | Never go below **−0.035em** (display) or −0.025em (H2/H3). Keep three weights: **400** body, **500** UI and emphasis, **600** headings. | S | High |
| W5 | **Mobile and tablet hero.** At 375 the hero is 1,383px tall and the portrait's centre sits at about 823px on an 812px screen, so only the top of the face shows (and the consent banner covers it). At 768 it's 1,690px tall with the graph stacked underneath. The primary CTA wraps to two lines at 375. | Add a 40px circular avatar to the "Hi, I'm Mann Patel" row on phones so the face is in the first screen. From 48em, use the two-column hero (graph at about 44% width) instead of waiting for 64em. *Suggestion (copy):* shorten the button to "Get a free check" and put "Website + Google, no obligation" in a microline under it, so it fits on one line at 375 without the `0.82rem` override. | M | High |
| W6 | **Motion fragmentation.** `--t-*` and `--dur-*` token sets live side by side, `tokens.css` itself says the ease decision "waits for a decision", plus 520/800/820/900/1000/1300ms literals. 37 infinite animations on Home. | Use one token set (see **Motion system**). Reveals 560–700ms, page transitions about 400ms. The graph plays three cycles and then idles, waking on pointer or focus, which matches the site's own rule for the status ping. | S | Med |
| W7 | **Content hidden until JavaScript reveals it.** `.js-motion [data-reveal]` starts at `opacity: 0` until the IntersectionObserver fires. Full-page captures, some preview tools and fast anchor jumps can show blank space (seen in the first capture). | Move reveals to CSS `animation-timeline: view()` inside `@supports`, so unsupported browsers simply show the content. Limit reveals to section heads and media, not every list item. | S | Med |
| W8 | **Consent banner.** At 1440 it covers the graph pause toggle (`elementFromPoint` at the toggle's centre returns the banner). At 375 it covers 22% of the first screen. It's first in tab order, before the skip link. | On phones, make it a single-row bottom bar (text plus two compact buttons, about 64px tall). On desktop, anchor it bottom-left (away from the graph caption) or raise it above the caption. Render it after the skip link in the DOM. | S | Med |
| W9 | **Dead zones and uneven rhythm.** About 600px of empty left column in "How I work" at 1440, a large gap in the section 02 head, the About photo starting about 260px below the title. | Make section-head columns `position: sticky; top: calc(var(--header-h) + 2rem)` in two-column sections (How I work, Prices, FAQ). Standardise vertical padding through `--section` and a single `--section-tight`. | M | Med |
| W10 | **Weak wordmark presence in the header.** 14px tall, outlines drawn from Geist *Regular* with +26% tracking, so thin strokes look faint next to 600–650-weight headlines. The hover fades it to 0.72 opacity. | Add a **small-size cut** of the wordmark (Medium/500 outlines, tracking +20%) for uses under 20px, at 16–18px tall in the header. Replace the opacity hover with a lime sweep (see **Motion system → Animated wordmark**). Collapse to "MΛ" on scroll. | S | Med |
| W11 | **No social proof on Home.** `ReviewsStrip` renders nothing until real reviews exist, and there are two projects. | For now, turn the four "What you can count on" promises into a bento of proof tiles with icons. When real reviews arrive, add a testimonial tile to the same bento. Never use placeholder or fake reviews (in line with the site's "real reviews only" rule). | M | Med |
| W12 | **Page weight structure.** 77KB of CSS inlined into every HTML page, so nothing is cached between pages. The graph SVG ships twice (wide and tall, one `display:none`), giving 1,205 DOM nodes. | Try `inlineStylesheets: 'auto'` and measure with the existing Lighthouse CI. Render one SVG and swap its layout at the breakpoint, or lazy-render the hidden variant. | M | Low |
| W13 | **Text too small on phones.** `.hero__role` is 0.72rem (11.5px), `.sw__labels` 0.73rem (11.7px), `.hero__services a` 0.74rem. | Minimum **13px** (`--fs-label: 0.8125rem`) everywhere, mono labels included. | S | Med |
| W14 | **Navigation competition.** Six nav items including "Vision", and a header "Contact" CTA next to a different hero CTA. | Move "Vision" to the footer (navigation change; no copy changes). On Home, the header CTA should point to the same goal as the hero (the free check) or stay an outline until the hero leaves the screen. | S | Med |

### Brand: improving the MΛNN PΛTEL identity (not replacing it)

- **Keep:** Geist capitals, the crossbar-less lime Λ's, the wide tracking, black and off-white.
- **Add a small-size cut** (W10). Thin Regular strokes at 14px are the main reason the brand feels quiet in the header.
- **Make the Λ a system glyph.** Replace the generic lime dots on eyebrows (`.eyebrow::before`) and service chips with a tiny Λ chevron. The rest of the site then speaks the wordmark's language instead of the generic "dot + mono label" pattern. Keep the round dot only where it means "live" (status chip).
- **The lime full stop as a headline device.** "Website projects in Scarborough." already ends in an accent-coloured period. Make that the rule for display headlines: the period is the *one* lime mark in the heading. It's on-brand, quiet and replaces the grey/lime two-tone, which competes with the lime CTAs.
- **Document clear space and minimum size** in `DESIGN.md`: clear space = Λ cap height on every side; minimum 12px tall (small-size cut) and 20px (regular cut).

---

## Hero redesign

### Concept: "Signal path"

The hero tells one story in one movement: **a search comes in, passes through Mann, and comes out as a booking.** The page's own job (get the visitor to the free check) mirrors that path. Everything that isn't part of the story moves down the page.

**Keep:** the agent graph, the real portrait as the core node, the service-and-place H1 (it's SEO-driven, so no copy change), the published price, the free-check CTA.
**Remove from the hero:** the service chips, the "Or reach me directly" icons, the recent-work cards and the Vision link (all of them already appear lower on the page). The status chip moves into the greeting row as plain text. All hero copy stays as it is today; the wireframe shortens lines only to fit the diagram.

### Layout

```
DESKTOP ≥ 64em (and ≥ 48em with a narrower graph)
┌──────────────────────────────────────────────────────────────────────────┐
│ MΛNN PΛTEL                          Work Services Pricing About   [Contact]│ ← CTA outline while hero CTA is in view
├──────────────────────────────────────────────────────────────────────────┤
│ Λ Hi, I'm Mann Patel. · Taking new projects     ┌──────────────────────┐ │
│                                                  │  Google ─╮    ╭─ Enquiry│
│ Websites and local SEO                           │  Maps  ──┼(◉)─┼─ Reply  │
│ for Toronto small businesses.   ← lime "."       │  AI    ─╯    ╰─ [Booking]
│                                                  └──────────────────────┘ │
│ Get found on Google and in AI answers,                                    │
│ then turn searches into bookings.                                         │
│                                                                           │
│ [● Get a free website and Google check  →]   See prices →                 │
│ $650 visibility setup · $1,950 website · CAD      Mann Patel connects…  ⏸│
└──────────────────────────────────────────────────────────────────────────┘

PHONE 375
┌───────────────────────────┐
│ MΛNN PΛTEL            ≡   │
│ (◉) Hi, I'm Mann Patel.   │ ← 40px avatar: face in the first screen
│     Web designer, Toronto │
│ Websites and local SEO    │
│ for Toronto small         │
│ businesses.               │
│ Get found on Google…      │
│ [● Get a free check  →]   │ ← one line (copy suggestion, W5)
│ See prices →              │
│ ───── graph begins ─────  │
└───────────────────────────┘
```

### Headline hierarchy

| Level | Element | Size at 1440 / 375 | Weight | Colour |
| --- | --- | --- | --- | --- |
| 0 | H1 (two lines, the period in lime) | 96 / 42px | 600 | `--text`; line 2 can step back to `--text-2` |
| 1 | Subline (existing copy) | 22 / 18px | 400 | `--text-2` |
| 2 | Primary CTA | 16px label | 500 | ink on lime |
| 3 | Greeting row, price microline | 15 / 13px | 500 / mono 500 | `--text-2`, `--text-3` |

The H1 becomes the largest text on the site again (W1). The greeting row uses the Λ glyph instead of a dot.

### CTA

- **One lime button in view.** "Get a free website and Google check" (or the shorter label suggested in W5) as the lime pill. "See prices" becomes a text link with an arrow, not a second pill.
- **Price microline under the CTA**, in mono, `--text-3`: removes risk at the moment of decision without adding more lime.
- On hover: keep the existing label roll, add a soft lime glow (opacity-only pseudo-element, below) and reduce the magnetic pull to 6px or less.

### Background treatment

Three static layers, no WebGL:

1. **Signal bloom:** a soft lime radial behind the core node (it exists as `.ag__stage::before`). Let it breathe *once* when the first pulse reaches Booking, then stay still.
2. **Graph paper:** keep the 28px dot grid, masked toward the graph (exists).
3. **Grain:** a static 3–4% noise overlay. It removes the flat look of `#0B0B0C` on large displays and makes the darks feel richer.

```css
/* ILLUSTRATIVE ONLY — not applied to the site */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

### Entrance sequence (about 1.6s total, transform and opacity only, text visible from the first paint)

| t (ms) | What moves | How | Duration / easing |
| --- | --- | --- | --- |
| 0 | Header wordmark | Letters settle from wider tracking; Λ's rise from the baseline (see wordmark idea) | 700ms, `--ease-out` |
| 60 | Greeting row | Fade and rise 12px | 560ms, `--ease-out` |
| 120 | H1 line 1 → line 2 | Mask reveal (existing `line-mask`), 70ms stagger; text is in the DOM and painted, so LCP is unaffected | 800ms, `--ease-out` |
| 320 | Graph core photo | Scale 0.92 → 1, ring fades in | 800ms, `--ease-out` |
| 380 | Subline, CTA, price line | Fade and rise 12px, 60ms stagger | 560ms, `--ease-out` |
| 450–1100 | Mesh and pills | Existing cascade, compressed to finish by about 1.1s | — |
| 1200 | **First pulse** | One spark travels Google → core → Booking, the Booking pill glows and the bloom breathes once | 1,400ms, linear travel |
| 2600+ | Idle | Two routes loop for three cycles, then stop. They wake on pointer or focus over the graph. The pause button stays. | — |
| Reduced motion | — | The finished still diagram (as today) | 0 |

```css
/* ILLUSTRATIVE ONLY — not applied to the site */
@media (prefers-reduced-motion: no-preference) {
  .js .hero__hello  { animation: rise 560ms var(--ease-out) 60ms both; }
  .js .hero__title .line-mask > span {
    animation: line-up 800ms var(--ease-out) both;
    animation-delay: calc(120ms + var(--i) * 70ms);
  }
  .js .hero__place,
  .js .hero__actions { animation: rise 560ms var(--ease-out) both; }
  .js .hero__place   { animation-delay: 380ms; }
  .js .hero__actions { animation-delay: 440ms; }
}
@keyframes rise    { from { opacity: 0; translate: 0 12px; } }
@keyframes line-up { from { transform: translateY(105%); } }
```

**Make the graph explorable** (the meaningful micro-interaction): hovering or focusing an input pill such as "Maps" lights only its routes through the core to Booking, and dims the rest to 30%. On touch, a tap does the same. The diagram becomes something visitors use, not just watch.

---

## Typography

### Diagnosis

- The current face is right for the brand: Geist is the wordmark's own family, and it is subset and self-hosted. **Most of the typographic gain comes from scale, tracking and weight discipline, not from a new font.**
- What Geist lacks is a **display voice**. It has no width axis, so (per `DESIGN.md`) the kinetic "widen on hover" effect was lost when Mona Sans was dropped, and at 100px it reads as neutral UI type rather than an identity.

### Recommended pairing

| Role | Font | Source | Settings | Why |
| --- | --- | --- | --- | --- |
| **Display** (H1, H2) | **Archivo** (variable: `wght` 100–900, `wdth` 62–125) | Google Fonts | `font-stretch: 112–118%`, weight 600, tracking −0.03em | The semi-expanded stance relates to the wordmark's wide tracking, so headline and logo read as one system. The width axis restores the hover-widen effect the site lost. Same self-host and subset pipeline (`scripts/subset-fonts.py`). |
| **Body / UI** | **Geist** | Google Fonts (already self-hosted) | 400 / 500 | Unchanged: coherent with the wordmark, excellent at 16–18px. |
| **Labels / numbers** | **Geist Mono** | Google Fonts (already self-hosted) | 500, +0.08em, uppercase | Unchanged. |

- **Alternative display (sharper "studio" voice):** **Clash Grotesk** (Fontshare, variable 200–700) at 500–600 with Geist body. Check the ITF Free Font License terms for self-hosting before use **[unverified]**.
- **Zero-risk path:** keep Geist for display and apply only the scale, tracking and weight rules below. This alone should take Typography from 5 to about 7.
- **Weight budget:** subset the display font to the characters the copy uses, like the current fonts. Target ≤ 30KB **[estimate]**. Preload only the body font; let the display font swap in, since the metric-matched fallback already exists.

### Type scale (fluid, 375 → 1440, hierarchy enforced)

| Token | Size 375 → 1440 | Line height | Tracking | Weight | Use |
| --- | --- | --- | --- | --- | --- |
| `--fs-hero` | 41.6 → 96px | 0.92 | −0.035em | 600 | Home H1 only |
| `--fs-h1` | 38.4 → 80px | 0.95 | −0.03em | 600 | Page titles |
| `--fs-h2` | 32 → 60px | 1.0 | −0.03em | 600 | Section titles (**never above `--fs-h1`**) |
| `--fs-h3` | 22 → 30px | 1.15 | −0.02em | 500 | Item titles, project names |
| `--fs-lead` | 18 → 22px | 1.45 | −0.01em | 400 | Intros, sublines |
| `--fs-base` | 17 → 18px | 1.6 | 0 | 400 | Body |
| `--fs-sm` | 15px | 1.5 | 0 | 400 | Hints, captions |
| `--fs-label` | 13px (floor) | 1.4 | +0.08em | mono 500 | Eyebrows, metadata |

The rule that fixes W1: *a component may choose a token, never a raw size.* Two exceptions are allowed by design: the footer wordmark and the free-check band headline, both documented.

```css
/* ILLUSTRATIVE ONLY — not applied to the site */
@font-face {
  font-family: 'Archivo';
  src: url('/fonts/archivo-wdth-wght.sub.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-stretch: 62% 125%;
  font-display: swap;
}
:root {
  --font-display: 'Archivo', 'Geist', 'Geist Fallback', system-ui, sans-serif;
  --font-sans: 'Geist', 'Geist Fallback', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, Menlo, monospace;

  --fs-hero: clamp(2.6rem, 1.4rem + 5.11vw, 6rem);
  --fs-h1:   clamp(2.4rem, 1.48rem + 3.91vw, 5rem);
  --fs-h2:   clamp(2rem, 1.38rem + 2.63vw, 3.75rem);
  --fs-h3:   clamp(1.375rem, 1.2rem + 0.75vw, 1.875rem);
  --fs-lead: clamp(1.125rem, 1.04rem + 0.38vw, 1.375rem);
  --fs-label: 0.8125rem;
}
h1, h2, .display {
  font-family: var(--font-display);
  font-stretch: 115%;
  font-weight: 600;
  letter-spacing: -0.03em;
  text-wrap: balance;
}
.hero__title { font-size: var(--fs-hero); letter-spacing: -0.035em; line-height: 0.92; }
h2           { font-size: var(--fs-h2); line-height: 1; }

/* The hover-widen effect, restored by the width axis (transition, not animation) */
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .widen { transition: font-stretch 500ms var(--ease-out); }
  .widen:hover { font-stretch: 125%; }
}
```

Note: animating `font-stretch` re-lays out text. Use it only on short, isolated words (a heading link), never on body copy or anything that would shift layout below it.

---

## Motion system

### Principles

1. **One story per screen.** The hero's motion is the signal path; everything else stays quiet.
2. **Motion settles.** Nothing loops forever: three cycles, then idle, then wake on interaction (the site already applies this to the status ping).
3. **Fast in, faster out.** Entrances ease out, exits ease in, and an exit is about 70% of its entrance.
4. **Keep the current engineering rules:** transform and opacity only, CSS first, the full reduced-motion path, and longhand animation properties with `animation-timeline` (the repo's minifier gotcha, documented in `global.css`).

### Tokens (replace both current sets)

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` (keep) | Entrances, reveals, hero |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` (keep) | State changes, accordions, page transitions |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Exits (menu close, toast out) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` (keep) | Magnetic return, small pops |
| `--dur-1` | 120ms | Colour, press |
| `--dur-2` | 200ms | Small UI: chips, icon buttons |
| `--dur-3` | 320ms | Menus, accordions, toasts |
| `--dur-4` | 560ms | Element reveals, label roll (was 520–1100) |
| `--dur-5` | 800ms | Hero headline lines only |
| `--stagger` | 60ms | Lists and lines |
| Page transition | old 220ms `--ease-in`, new 420ms `--ease-out` | Was 700 / 900ms |

### Scroll-reveal pattern

Use CSS scroll-driven animations only for **section heads and media**. They need no JavaScript, and nothing is hidden where they're unsupported.

```css
/* ILLUSTRATIVE ONLY — not applied to the site */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .section-head, .reveal-media {
      animation-name: reveal;
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: view();
      animation-range: entry 5% entry 55%;
    }
  }
}
@keyframes reveal {
  from { opacity: 0; translate: 0 16px; }
}
```

Browsers without support show everything immediately, so the blank-section risk from W7 goes away. Check Firefox support before relying on it for anything other than decoration **[unverified]**.

### Hover and cursor micro-interactions

| Element | Interaction | Spec |
| --- | --- | --- |
| Primary CTA | Label roll (keep), arrow turns −45° (keep), **lime glow fades in** | Glow is a pseudo-element, opacity `--dur-3` |
| Magnetic pull | Keep, but **only** on the hero CTA and footer CTA; max 6px (now `min(10, width × 0.06)` on every `.btn`, `.icon-btn` and the menu buttons) | `--ease-spring` on release |
| Graph pills | Hover or focus lights that pill's routes; the others dim to 30% | `--dur-3`, `--ease-out` |
| Work cards | Image scales 1.00 → 1.02 inside its frame, spotlight (keep), arrow nudges 3px NE | `--dur-4` |
| Price rows | Row background sweeps in (keep); the price itself does **not** animate | — |
| Custom cursor | **None.** It was removed in round 7, which was the right call for a small-business audience. | — |

### Animated wordmark ideas (identity unchanged)

1. **"Lock-on" at first load (once per session).** The seven non-Λ letters start spread out (translateX away from the centre, opacity 0) and settle into place while the two Λ's rise from the baseline (`scaleY` 0 → 1, origin at the bottom), 120ms behind them. 700ms total, `--ease-out`. It reads as a signal locking in. Each page load renders a fresh header, so gate it with a `sessionStorage` flag (the head script already uses `sessionStorage` for presenter mode) to play it once per visit, not on every page.
2. **Scroll condense.** Once the hero leaves the screen, the header wordmark cross-fades to a compact **"MΛ"** lockup (the first two letters of the existing paths in `Wordmark.astro`), freeing room in the bar. It expands again at the top of the page.
3. **Hover sweep.** A one-shot lime sweep runs left to right across the letters (the footer's per-letter lime copies, `.wm__lit`, driven by a timed opacity stagger instead of pointer distance). This replaces the current fade to 0.72 opacity.

```css
/* ILLUSTRATIVE ONLY — not applied to the site; assumes per-letter <g data-k-ch> groups */
@media (prefers-reduced-motion: no-preference) {
  .hdr .wm [data-k-ch] {
    transform-box: fill-box;
    animation: wm-settle 700ms var(--ease-out) both;
    animation-delay: calc(var(--n) * 30ms);
  }
  .hdr .wm [data-k-ch][data-lam] {
    transform-origin: 50% 100%;
    animation: wm-rise 600ms var(--ease-out) 120ms both;
  }
}
@keyframes wm-settle { from { opacity: 0; translate: calc(var(--dx) * 1px) 0; } }
@keyframes wm-rise   { from { transform: scaleY(0); } }
```

### Lime glow and gradient treatment

Rules: no gradients on text (keep the existing `DESIGN.md` rule). Glow only on things that are **live** or **the primary action**.

```css
/* ILLUSTRATIVE ONLY — not applied to the site */
:root {
  --signal-glow: 0 0 0 1px rgb(212 248 74 / 0.45), 0 12px 40px -12px rgb(212 248 74 / 0.55);
}
.btn:not(.btn--ghost)::after {            /* primary CTA glow: opacity only */
  content: '';
  position: absolute;
  inset: 0;
  z-index: -2;
  border-radius: inherit;
  box-shadow: var(--signal-glow);
  opacity: 0;
  transition: opacity var(--dur-3) var(--ease-out);
}
.btn:not(.btn--ghost):hover::after,
.btn:not(.btn--ghost):focus-visible::after { opacity: 1; }

.rule-signal {                             /* section divider: a hairline with a lime tip */
  height: 1px;
  background: linear-gradient(90deg, rgb(212 248 74 / 0.6), var(--line) 18%, var(--line));
}
```

Note: `.btn` has `overflow: hidden` today, so the glow layer must sit on a wrapper or use `outline`/`filter: drop-shadow` on the wrapper.

### Modern upgrades: what fits this brand

| Upgrade | Verdict | Where / why |
| --- | --- | --- |
| **Bento sections** | **Yes** | (1) Services: three tiles A/B/C, each with a small looping-three-times SVG scene from the round-9 "Found / Answered / Booked" work (map-pin drop, typing bubble with read ticks, hand-drawn circle; spec in `DESIGN.md`). (2) "What you can count on": four proof tiles with icons, plus a testimonial tile once real reviews exist. Not for prices: the table is clearer. |
| **Sticky section heads** | **Yes** | Fixes W9's dead zones in How I work, Prices and FAQ. |
| **Explorable hero graph** | **Yes** | The most on-brand interaction available; see the Hero section. |
| **View transitions** | **Keep, shorten** | 900ms to about 420ms. |
| **Magnetic buttons** | **Keep, restrict** | Two CTAs only, max 6px. |
| **Marquee** | **Not now** | Two projects and no reviews: a marquee would be filler. Revisit as a slow, pausable review marquee when there are 6+ real reviews. |
| **Smooth scroll (Lenis)** | **No** | Mostly phone visitors and native scroll-driven CSS are already in use. Hijacking scroll adds main-thread work and could fight the anchor and focus handling in `motion.ts`. |
| **Animated price counters** | **No** | Prices must read instantly; counting up delays comprehension. |
| **Custom cursor / WebGL hero field** | **No** | Both were removed in round 7 for restraint, which was correct; the SVG graph is the signature. |

### Libraries (lightest first)

| Option | Recommendation | Reason |
| --- | --- | --- |
| **Plain CSS** (scroll-driven animations, view transitions, keyframes) | **Default** | Already in use, zero JavaScript, works with the reduced-motion and Lighthouse rules. |
| **Web Animations API** (`element.animate`) | **Use for the hero sequence and graph** | Already used for the sparks. Can pause, cancel and sequence through promises with no dependency. |
| **Motion** (motion.dev, vanilla `animate` / `inView`) | Optional | Only if hand-rolled WAAPI sequencing becomes hard to maintain. It's framework-agnostic and small; check the bundle size against the Lighthouse budget **[unverified exact size]**. |
| **GSAP + ScrollTrigger** | Not needed | Powerful but heavy for this site (tens of KB gzipped **[approx]**). Only justified for a pinned scroll-story section, which this site doesn't need. |
| **Framer Motion** | Not applicable | React-only; the site is Astro with no React islands. |
| **Lenis** | Skip | See smooth scroll above. |
| **Lottie** | Skip | The player is heavy and the scenes are simpler and sharper as inline SVG + CSS, which is the site's current approach. |

---

## Roadmap: top 10 highest-impact changes (ranked)

| Rank | Change | Fixes | Effort | Impact | Expected score movement |
| :-: | --- | --- | :-: | :-: | --- |
| 1 | **Rebuild the type scale and tracking.** The H1 becomes the largest text; tokens only; tracking ≥ −0.035em; three weights; 13px floor. | W1, W4, W13 | M | High | Typography 5 → 7, Hero +1 |
| 2 | **Edit the hero to six elements** (Signal path concept) and move chips, recent-work cards, contact icons and Vision link down the page. | W2, W14 | M | High | Hero 6 → 8 |
| 3 | **Enforce the lime budget:** Λ's, one primary CTA, live signal. Prices in white; lime fill tags on paper instead of olive. | W3 | S | High | Color 6 → 8 |
| 4 | **Fix the mobile and tablet hero:** avatar in the greeting row, two columns from 48em, cap the tablet H1, one-line CTA (copy suggestion). | W5 | M | High | Responsiveness 6 → 8 |
| 5 | **Fix the consent banner:** compact on phones, away from the graph caption on desktop, after the skip link in the DOM. | W8 | S | Med–High | UX +1, a11y +0.5 |
| 6 | **Unify motion tokens,** shorten reveals (560–700ms) and page transitions (about 420ms), make the graph loop finite. | W6 | S | Med | Motion 6 → 7 |
| 7 | **Choreograph the hero entrance** (about 1.6s, first pulse lands on Booking) and **make the graph explorable.** | Hero | M | Med–High | Motion 7 → 8, Hero +0.5 |
| 8 | **Move reveals to CSS `view()` timelines** for section heads and media only, plus **sticky section heads** for the dead zones. | W7, W9 | M | Med | Layout 6 → 7 |
| 9 | **Wordmark upgrades:** small-size cut, load "lock-on", scroll-condense to "MΛ", hover sweep, Λ as the eyebrow glyph. | W10 | M | Med | Brand presence; Color +0.5 |
| 10 | **Services and proof bento** with Found / Answered / Booked micro-scenes, then trial the **Archivo display** face behind a flag and compare. | W11 | L | Med | Graphics 7 → 8, Typography +1 |

**Projected overall after items 1–8:** roughly **78–82 / 100** **[estimate]**. Performance and accessibility stay at 8+ provided every change keeps the existing Lighthouse CI budgets green.
