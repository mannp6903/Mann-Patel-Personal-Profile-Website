# DESIGN.md · "Signal" (round 5, Nov 2026) + "Live Signal" motion layer (round 6)

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
| `--on-signal` | `#0B0B0C` | Text and icons on `--signal` | 16.2:1 |
| `--signal-wash` | `rgb(212 248 74 / 0.12)` | Selected chips, soft highlights | — |
| `--error` | `#FF6B57` | Errors and destructive notices | 7.0:1 |
| `--warn` | `#F5C451` | "Not connected" and preview notes | 12.1:1 |
| `--paper` / `--ink` | `#F2F1EC` / `#0B0B0C` | Inverted moments (rare): prose code, toasts | 17.4:1 |

Rules: lime is never a background for long text; it marks *one* thing per view (the main button, the
current state, the focus ring). No gradients on text, no purple, no glass.

## Typography

| Family | File | Use |
| --- | --- | --- |
| **Mona Sans** (variable: weight 200–900, width 75–125), served as **"Signal Sans"** | `signal-sans-wdth-wght.woff2`, 69 KB | Everything: display (expanded, heavy) and body (normal width) |
| **Instrument Serif Italic** | `instrument-serif-italic.sub.woff2`, 11 KB | One or two accent words per heading, never body text |
| **Geist Mono** (variable weight) | `geist-mono-wght.sub.woff2`, 15 KB | Labels, metadata, numbers, the live clock |

The served files are subsets cut to the characters the copy uses (`scripts/subset-fonts.py`: 143 KB →
95 KB). Mona Sans is renamed "Signal Sans" in the subset because "Mona" is a Reserved Font Name under
the OFL. New characters in the copy: add them to the script and to `unicode-range` in `tokens.css`.

Self-hosted, SIL OFL 1.1, `font-display: swap`, metric-adjusted fallbacks.

| Token | Size (fluid) | Line height | Weight · width | Use |
| --- | --- | --- | --- | --- |
| `--fs-display` | 3.4 → 10.5rem | 0.86 | 800 · 112–125 | Hero words, footer name |
| `--fs-h1` | 2.6 → 6rem | 0.95 | 720 · 110 | Page titles |
| `--fs-h2` | 2 → 4rem | 1.0 | 680 · 108 | Section titles |
| `--fs-h3` | 1.35 → 1.9rem | 1.15 | 620 · 104 | Item titles |
| `--fs-lead` | 1.2 → 1.5rem | 1.45 | 420 · 100 | Intros |
| `--fs-base` | 1.0625 → 1.125rem | 1.6 | 400 · 100 | Body (17–18 px) |
| `--fs-sm` | 0.9375rem | 1.5 | 400 | Hints, captions |
| `--fs-xs` | 0.8125rem | 1.4 | 500 mono, +0.08em, uppercase | Labels |

Display tracking −0.04em; headings −0.03em; body 0. Body line length 60–72 characters (`--measure`).

## Spacing and layout

4-px base: `--s-1` 0.25rem, `--s-2` 0.5rem, `--s-3` 0.75rem, `--s-4` 1rem, `--s-5` 1.5rem, `--s-6` 2rem,
`--s-7` 3rem, `--s-8` 4rem, `--s-9` 6rem, `--s-10` 8rem. Sections: `--section` 3.5 → 10rem.
Content width `--container` 90rem with `--gutter` 1 → 3rem; text `--measure` 68ch. 12-column grid on
desktop, one column on phones. Layouts alternate (split, full-bleed, sticky, list) so no two sections
in a row look the same.

**Phones (under 48em) stay short.** A client should get the whole story in a few thumb-flicks, so
groups of cards never stack into a long column:

- **Swipe rails** (`.rail` + `data-rail`): a row of cards that scrolls sideways with snap points,
  the next card peeking at the edge and dots underneath (`.rail-dots`, lime for the current card).
  Used for the work cards, house rules, packages, the five project steps, About chapters and rules,
  and the decisions and captures on case studies. A rail with no links inside gets a tab stop only
  while it scrolls, so it can be moved with the arrow keys.
- **Tabs** for the three service areas on Home (ARIA tabs, arrow keys, phones and tablets only).
- **Folds**: long question lists show five questions and a "Show all" button; case-study write-ups
  show their opening and "Read the full case study". Keyboard focus moving into folded text opens it,
  and without JavaScript everything is shown.
- Smaller section padding, one line per service until it is opened, and a compact footer.
- Budgets (in 390 × 844 screens) are tested in `tests/e2e/site.spec.ts`: Home 10, Services 12,
  case studies and About 6.5, Work 4.5, Contact 3.5.

## Shape and depth

Radius: `--r-sm` 8px (chips, small controls), `--r-md` 14px (inputs, panels), `--r-lg` 28px (media,
phone), `--r-pill` 999px (buttons). Depth comes from surface steps and hairlines, not shadows. One
shadow only: `--shadow-pop` for floating layers (menu, ⌘K palette, toast).

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
- **Navigation**: sticky bar, wordmark + live status left, links centre-right, "Start a project"
  right; phones get a full-screen sheet. ⌘K / Ctrl K opens a quick menu (pages and actions).
- **Footer**: closing call to action, link columns, and the kinetic name (letters widen near the cursor).

## Imagery and icons

- The only photo is Mann's real portrait: on Home it is drawn as the signal-line portrait (with a
  "Show photo" switch and a small round face photo on phones); the full street photo is on About.
  Never generated or stock.
- Project images are real captures of real sites, shown in plain rounded frames, captioned with
  dates.
- Example screens (phone mock-ups) are built in HTML, labelled "Example", and use fictional names.
- Icons: one inline SVG set, 24px grid, 1.75px stroke, round caps. No emoji.

## Motion

| Token | Value |
| --- | --- |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| `--t-fast` / `--t-base` / `--t-slow` / `--t-reveal` | 160 / 320 / 700 / 1100 ms |

Signature moments: the signal-line portrait (Mann's face drawn by ~120 oscillating scan lines that
trace in on load and swell and glow lime around the pointer), kinetic
hero words (width and weight animate in), headings revealed line by line, the phone that changes
screen as you scroll, project cards that stack, a timeline that draws itself, and the footer name.
Everything is off under `prefers-reduced-motion`; content never waits on JavaScript.

## Live Signal: the effects layer (round 6)

Everything below lives in `src/scripts/fx/` and `src/components/fx/`, is progressive enhancement
(the page is complete without it), never delays the first paint, and is **off under reduced motion**.
Pointer effects run only for a mouse or trackpad (`hover: hover` and `pointer: fine`).

| Component | Where | Behaviour |
| --- | --- | --- |
| **Signal field** (`Field.astro`, `field.ts`) | Home hero, every page head, About, footer call to action, 404 | A WebGL dot map. A slow domain-warped noise "carrier" brightens dots and lays a faint lime aurora toward a focus point (`--fx`/`--fy` in CSS, per breakpoint). Dots swell and turn lime near the pointer; a click or tap sends a **radar ping**. Static CSS dots without WebGL, on CPU-only renderers, or with reduced motion. Time runs during the intro and while someone interacts, then eases to a stop. |
| **Cursor follower** (`cursor.ts`) | Site-wide | A ring trails the real cursor (which stays visible), grows over links, and becomes a lime disc with a word over `[data-cursor="Open"]` (work rows). |
| **Magnetic buttons** (`pointer.ts`) | `.btn`, `.icon-btn`, quick-menu and menu buttons | Lean toward the pointer (arrow disc a little more) and spring back. Uses the `translate` property so it composes with hover/press. |
| **Spotlight panels** | `[data-spotlight]`: work cards and rows, packages, contact panels | A lime light and a lit 1 px border follow the pointer (one masked layer under the content). |
| **3D tilt + glare** | `[data-tilt]`: project media | Up to 7° toward the pointer with a moving glare. |
| **Decoding labels** (`text.ts`) | Every mono `.eyebrow`, `[data-scramble]` | Letters cycle through signal glyphs and lock in left to right on arrival. Screen readers get the real text throughout. |
| **Scroll-lit statements** | `[data-scrub]` | Words light from `--text-3` (AA) to `--text` as you scroll through. |
| **Scroll marquee** (`Marquee.astro`, `marquee.ts`) | Home, after the hero | Giant "Found. Answered. Booked." (solid, outline, lime serif) and a mono services row, moving in opposite directions **only while the page scrolls**, leaning with scroll speed. Hidden from assistive tech. |
| **Reading line** | Header | A 2 px lime line tracks scroll progress (CSS scroll timeline, no JS). |
| **Page transitions** | Between pages | The old page recedes and dims while the new one wipes up; the header holds still (`view-transition-name: site-header`). |
| **Image reveals** | Case-study close-ups and captures | Frames open from an inset and the image settles from 1.16× (CSS view timeline, no JS). |
| **Load-time intros** | First screen of every page | `data-reveal="load"` / `Heading load` / `data-reveal="load-media"` animate in CSS from first paint, so they never wait for a script (fast LCP). |

