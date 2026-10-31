# 04 · Design directions, tokens, components and motion

## Three directions

### 1 · Editorial Founder

- **Concept:** a founder's notebook. Long-form story first, services second.
- **Reference rationale:** Lynn Fisher's typographic identity, Justin Jackson's founder-first introduction.
- **Palette:** paper `#F6F1E7`, ink `#1D1B18`, terracotta `#A8442A`, sage `#5F6F52`, rule `#D8CFBF`.
- **Fonts:** Fraunces (display serif, OFL) + Source Sans 3 (OFL).
- **Layout:** narrow centred reading column, generous margins, pull quotes.
- **Images:** real portrait large; process photos.
- **Motion:** almost none; page-level fades.
- **Tradeoffs:** warm and trustworthy, but reads like a writer's blog. It undersells the "systems" side, and depends heavily on a portrait that doesn't exist yet.

### 2 · Front Desk *(recommended)*

- **Concept:** every small business has a front desk (what customers see) and a back office (how enquiries get handled). Mann sets up both. The visual language borrows from **work orders, receipts and rubber stamps**: enquiry "tickets" that move through stages.
- **Reference rationale:** Designjoy's offer clarity and Solo Web Design's local, plain-language voice, with a distinctive typographic identity (Snellenberg, Lynn Fisher) and interaction that demonstrates the service (Bruno Simon's lesson, with a fallback).
- **Palette:** paper `#F4F1EA`, card `#FBFAF6`, ink `#15171A`, stamp orange `#D9481C`, ledger green `#1F6B4E`, night `#14161A` (full tokens below).
- **Fonts:** **Bricolage Grotesque** (display, variable weight) + **Atkinson Hyperlegible Next** (body) + **Atkinson Hyperlegible Mono** (ticket labels, from the same superfamily). All SIL OFL 1.1, free for commercial use.
- **Layout:** a 12-column grid with a ledger feel (ruled rows, numbered lines). Compositions vary by section: a stacked display headline plus ticket in the hero, ledger rows for services, large cards for work, a work-order form for contact.
- **Images:** real project captures, coded diagrams and mock-ups. No stock photos and no generated people.
- **Motion:** "stamped": short, decisive. Stamps land, tickets advance one stage at a time.
- **Tradeoffs:** distinctive without a portrait, and it explains the "follow-up" offer visually. It needs careful spacing so typography-led sections don't feel empty, and the orange accent fails text contrast at small sizes, so it is limited to graphics and large type.

### 3 · Personal Creative Studio

- **Concept:** a bold monogram and saturated colour blocks; each service gets its own colour world.
- **Reference rationale:** Adham Dannaway's dual-identity hero; Comeau's playfulness.
- **Palette:** off-white `#FAFAF7`, ink `#0E0E10`, cobalt `#2B3BFF`, lemon `#F2E35B`, coral `#FF6B57`.
- **Fonts:** Space Grotesk + Space Mono (OFL).
- **Layout:** asymmetric blocks, oversized numerals, overlapping cards.
- **Motion:** expressive hover and scroll effects.
- **Tradeoffs:** memorable to designers but less reassuring to a plumber or salon owner choosing someone to handle their email. The heavier motion costs performance and needs more reduced-motion work.

**Decision:** Direction 2, *Front Desk*. It is implemented in this repository.

## Tokens (implemented in `src/styles/tokens.css`)

### Colour roles and contrast (measured with the WCAG 2.x formula)

| Token | Value | Use | Contrast |
| --- | --- | --- | --- |
| `--paper` | `#F4F1EA` | Page background | — |
| `--paper-2` | `#EAE5DA` | Sunken panels, alternate sections | — |
| `--card` | `#FBFAF6` | Cards, tickets, form fields | — |
| `--ink` | `#15171A` | Body text, primary buttons | 15.9 : 1 on paper |
| `--ink-2` | `#4B5058` | Secondary text | 7.2 : 1 on paper |
| `--ink-3` | `#62676F` | Captions, meta | ≥ 4.9 : 1 on paper |
| `--line` | `#D3CCBE` | Decorative rules only | (non-text, decorative) |
| `--control` | `#7A7468` | Form control borders | ≥ 3 : 1 non-text |
| `--accent` | `#D9481C` | Stamps, marks, large display accents (≥ 24 px) | 3.8 : 1 on paper. **Not for small text** |
| `--accent-text` | `#B03A12` | Links and small accent text | 5.4 : 1 on paper |
| `--ok` | `#1F6B4E` | Success states | 5.7 : 1 on paper |
| `--error` | `#B42318` | Error text and borders | 5.8 : 1 on paper |
| `--night` / `--night-ink` | `#14161A` / `#F4F1EA` | Dark sections | 16.1 : 1 |
| `--night-ink-2` | `#B9B4A9` | Secondary text on dark | 8.8 : 1 |
| `--accent-on-night` | `#FF7A4D` | Accent text on dark | 7.0 : 1 |

Focus ring: 3 px solid `--ink` (on light) / `--night-ink` (on dark), 3 px offset, always visible with `:focus-visible`.

### Typography

| Step | Size (360 px → 1440 px) | Use |
| --- | --- | --- |
| `--step--1` | 14 → 15 px | Meta, labels (mono) |
| `--step-0` | 17 → 19 px | Body |
| `--step-1` | 20 → 24 px | Lead paragraphs, card titles |
| `--step-2` | 24 → 32 px | H3 |
| `--step-3` | 30 → 44 px | H2 |
| `--step-4` | 36 → 60 px | Page H1 |
| `--step-5` | 40 → 88 px | Home hero H1 |

All sizes use `clamp()` with a rem floor, so browser zoom and user font size are respected. Body line-height is 1.6 and display line-height 1.02–1.1. Reading measure is capped at 68 ch. Font loading: the Latin subsets are self-hosted (Bricolage 41 KB, Atkinson Next 34 KB, Mono 18 KB, woff2). Display and body are preloaded and use `font-display: swap`, with size-adjusted local fallbacks to limit layout shift.

### Logo

Custom **MP ligature monogram** (stroke geometry, 20-unit strokes, miter joins) + **MANN PATEL** wordmark outlined from Archivo Expanded Bold (wdth 125, wght 760, +0.16em tracking). `src/components/Logo.astro` renders the lockup or the mark from `src/data/logo.json`; letters use `currentColor`, the square uses `--logo-dot`. Regenerate with `scripts/make-logo.py`.

### Motion graphics (added 31 Oct 2026)

| Where | What | Timing | Reduced motion |
| --- | --- | --- | --- |
| Header logo | Monogram strokes draw in (M, then P), square stamps on, wordmark slides in. Once per visit (sessionStorage) | 0.12–1.6 s | Static |
| Logo hover | Square nudges up-right | 220 ms | Instant |
| Home headline | Words rise in sequence, then the three verb underlines draw left to right | 0.06–1.4 s | Static |
| Services marquee | Slow band of service names under the hero; pauses on hover; hidden from screen readers (services are listed right below) | 48 s loop | Not animated |
| Hero ticket, workflow demo, guide, reveals | As before | — | Static |

Only `transform`, `opacity`, `stroke-dashoffset` and `background-size` are animated. Lab CLS stays ≤ 0.013.

### Space, size, shape

- Space: `--space-3xs` 4 px · `2xs` 8 · `xs` 12 · `s` 16 · `m` 24 · `l` 32 · `xl` 48 · `2xl` 64 · `3xl` 96. Section padding is fluid: `clamp(64px, 10vw, 128px)`.
- Containers: `--container` 1240 px, `--container-text` 68 ch; gutter `clamp(16px, 4vw, 40px)`.
- Radii: `--radius-s` 6 px, `--radius-m` 12 px, `--radius-l` 20 px, `--radius-pill` 999 px.
- Borders: 1 px `--line` decorative, 1.5 px `--control` on inputs, 2 px `--ink` on secondary buttons.
- Shadows: `--shadow-ticket` (a paper lift with a crisp 1 px edge); no blurry glows.
- Touch targets: interactive controls ≥ 44 × 44 px.

## Components and states

| Component | States implemented |
| --- | --- |
| Button (primary ink, secondary outline, quiet) | default, hover, focus-visible, active (pressed 1 px), disabled, loading (spinner + "Sending…") |
| Text link | default (underlined), hover (thicker underline), focus-visible, visited (same colour) |
| Header + mobile menu | collapsed/expanded (`aria-expanded`), current page (`aria-current`), Escape to close, focus return |
| Ticket (signature) | static, stamped (stage reached), current stage; reduced-motion version without animation |
| Service ledger row | default, hover, focus-within; the details are always visible (no hover-only content) |
| Work card | status chip: **Launched** / **Concept** / **Prototype** / **In progress** |
| Guide | unanswered, answered, recommendation shown (live region), reset |
| Workflow demo | step 1–4 (tabs), each step's panel; no-JS: all steps as an ordered list |
| Form field | default, focus, filled, invalid (message + `aria-invalid`), disabled while sending |
| Form | idle, sending, success (only after server acceptance), error (input preserved, retry), rate-limited, not-connected |
| FAQ | native `<details>` open/closed |
| Preview flag | "To confirm" notes visible in preview builds; the production build fails if any remain |

## Motion specification

| Where | Purpose | Duration | Easing | Reduced motion |
| --- | --- | --- | --- | --- |
| Button/link hover, press | Feedback | 160 ms | `--ease-out` cubic-bezier(.2,.7,.2,1) | Colour change only |
| Mobile menu open/close | Orientation | 220 ms | `--ease-out` | Instant |
| Hero ticket stamps | Demonstrate "follow-up" as a sequence | 4 stamps × 180 ms, 260 ms apart, after 400 ms | `--ease-stamp` cubic-bezier(.3,1.4,.5,1) (slight overshoot) | All stamps shown, static |
| Section reveal (headings, cards) | Gentle pacing while scrolling | 480 ms, 12 px rise + fade, once only | `--ease-out` | None; content always visible |
| Workflow demo step change | Show cause → effect | 240 ms panel fade/slide | `--ease-out` | Instant swap |
| Guide recommendation | Draw the eye to the result | 300 ms fade + 8 px rise | `--ease-out` | Instant |

Rules: no scroll hijacking, no loaders, no custom cursor, no autoplay audio, nothing that blocks reading. Reveals use one `IntersectionObserver` that disconnects after each element is shown. Content is visible by default and is only hidden for animation when JavaScript has run and motion is allowed (`html.js-motion`), so a JS failure never hides content. Only `transform` and `opacity` are animated.

## Interaction specifications

### 1 · "What does your business need?" guide (implemented)

- **Visitor benefit:** turns 13 services into one suggested starting point, with reasons.
- **Trigger:** answering three radio questions (stage, main need, current website).
- **States:** incomplete (button disabled, with a hint), recommendation (headline, 2–3 reasons, included services, "Start a brief with this"), reset.
- **Keyboard/touch:** native radio groups in `<fieldset>`/`<legend>`; arrow keys move within a group; cards are ≥ 44 px tall; the result is announced via `aria-live="polite"` and receives focus on its heading.
- **Fallback:** without JavaScript the form submits (GET) to the Contact page, and a static "Quick guide" table is always present beneath it.
- **Performance cost:** about 2 KB of JS (pure function plus DOM wiring); no dependencies.
- **Honesty:** no prices, no ROI, no promised results; reasons only.

### 2 · Enquiry workflow demonstration (implemented)

- **Visitor benefit:** shows what "follow up" means in practice: form → acknowledgement → owner notification → follow-up.
- **Trigger:** tabs ("1 Enquiry", "2 Acknowledgement", "3 Notification", "4 Follow-up") and Next/Back buttons.
- **States:** one active step; each panel shows a mock UI with **fictional sample data**, clearly labelled. Nothing is sent.
- **Keyboard/touch:** ARIA tabs pattern (Left/Right/Home/End), large tab targets, Next/Back buttons as an alternative.
- **Fallback:** without JS, all four steps render as an ordered list, which is also the reading order for crawlers.
- **Performance cost:** about 1.5 KB JS; panels are HTML/CSS.

### 3 · Brand preview (designed, not built for launch)

A fictional brand shown across a business card, flyer, social post and website mock-up, with a toggle between "business card / flyer / post / website". The two concept case studies already show the same artwork statically; build the toggle later if visitors engage with the concepts.
