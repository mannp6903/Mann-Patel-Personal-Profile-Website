# DESIGN.md · "Signal" (round 5, Nov 2026), compact editorial portfolio (round 7)

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

**Home order (round 7; hero changed in rounds 8–10).** Hero (outcome headline + "for Toronto service
businesses", two actions, and Mann's clear portrait) → **selected work** (both projects) → a labelled
**walkthrough with fictional data** (round 10) → three service summaries, each naming its package → free
check → how I work → questions → closing call to action. Real work starts by y≈920 at 1440×1000 and
y≈1400 at 390×844 (tested; on phones the portrait is 5:4 and sits between the buttons and the work).

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
  project steps, About chapters, and the close-ups and captures on case studies. Snap points, the
  next card peeking, dots underneath. A rail with no links gets a tab stop only while it scrolls.
- **Folds**: long question lists show five questions and a "Show all" button; case-study write-ups
  show their opening and "Read the full case study"; case-study evidence previews its first check.
  Keyboard focus moving into folded text opens it, and without JavaScript everything is shown.
- Smaller section padding, one line per service until it is opened, and a compact footer.
- **The menu sheet fits one screen** at any phone height (tested at 320×568, 375×667 and 390×844):
  link size and spacing scale with the screen height, and on short phones the contact buttons
  become round icons (each keeps its name) so every link down to Privacy and Terms is visible.
- Budgets (in 390 × 844 screens) are tested in `tests/e2e/site.spec.ts`: Home 10.5, Services 12,
  case studies 7 (they carry the evidence section), About 6.5, Work 4.5, Contact 3.5.

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

- The only photo is Mann's real portrait: on Home it is the **Tune in** radio (below); the full street
  photo is also on About. Never generated or stock. The signal-line drawing now lives only on the 404 page.
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

Signature moments: **Tune in** (below), the **headline that acts out its words** (below), kinetic
hero words (width and weight animate in, and flash lime when the signal locks), headings revealed line by line, the process line that draws itself on
Services, and the footer name. Everything is off under `prefers-reduced-motion`; content never waits
on JavaScript.

### The headline acts out its words (round 9)

`Hero.astro` (markup and CSS) + `scripts/hero-words.ts` (replay). Each word plays a two-second
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
| **Magnetic buttons** (`pointer.ts`) | `.btn`, `.icon-btn`, menu buttons | Lean toward the pointer and spring back (CSS `translate`). |
| **Spotlight** | `[data-spotlight]`: project cards, work rows, packages, contact panels | A soft light and a lit border follow the pointer. |
| **Decoding** (`text.ts`) | `[data-scramble]` only: the coordinates on the tuner | Glyphs lock in left to right; screen readers get the real text. |
| **Reading line** | Header | 2 px lime scroll progress (CSS scroll timeline). |
| **Page transitions** | Between pages | Old page recedes, new one wipes up, header holds still. |
| **Image reveals** | Case-study close-ups and captures | Frames open as they scroll in (CSS view timeline). |
| **Load-time intros** | First screen of every page | CSS from first paint (`data-reveal="load"`, `Heading load`), never waiting for a script. |

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
