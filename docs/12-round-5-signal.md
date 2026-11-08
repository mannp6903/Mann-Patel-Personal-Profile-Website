# 12 · Round 5: "Signal", a ground-up rebuild (8 Nov 2026)

**Request (Mann):** use every relevant skill and connector to rebuild the site from scratch; research
top personal websites worldwide; don't repeat earlier output; make the hero, buttons, form, functions,
typography, fonts, motion graphics and animation world-class.

**What stayed** (it works and is tested): the enquiry backend (validation, spam layers, Cloudflare Email
delivery, honest "not connected" state), the private phone handling, all verified copy (services,
packages, FAQ, case studies, Mann's story), the content files and the unit tests.
**What was rebuilt:** every page, layout, component, style, font, motion script, the share image, the
favicon and the browser test suite.

## 1. Research

| Tool | Used for | Result |
| --- | --- | --- |
| Firecrawl search + scrape (screenshots) | Awwwards portfolio winners (Sites of the Day, Oct–Nov 2026) and well-known personal sites | 6 sites captured and studied (table in `DESIGN.md`) |
| Exa search | Curated "best personal websites" articles | Unavailable: account out of credits |
| Mobbin section search | Hero/contact section patterns | Unavailable: needs a paid Mobbin plan |
| Adobe Fonts recommendations | Typeface candidates for confident, modern headlines | Suggested Acumin Pro, Hanken Grotesk and Special Gothic. Acumin needs a paid Adobe Fonts kit (an extra service), so the choice went to free, self-hosted OFL fonts with the same job |
| `website-design:web-design-system` + `landing-page` skills | Process: decide a system first, write DESIGN.md, plan sections, honest copy, check on phone/tablet/desktop and keyboard | `DESIGN.md` and this rebuild |

**Patterns taken (never copied):** one confident typographic statement (Rauno Freiberg), a calm dark
stage with bright emphasis (Brittany Chiang), personality through small delights (Josh Comeau), lists
instead of cards and ruthless restraint (Emil Kowalski), a cinematic canvas as the signature
(G. Colombel, Site of the Day). Nothing from the earlier "Front Desk" or "studio" rounds was reused:
no tickets, stamps, marquee, tilt card, magnetic buttons, sliding name or word-darkening intro.

## 2. Direction: "Signal"

Mann's work makes small businesses **visible** and **responsive**, so the site behaves that way: a dark
stage where things light up when you come close. Full system in [`DESIGN.md`](../DESIGN.md).

- **Colour:** near-black `#0B0B0C`, warm off-white `#F2F1EC`, one accent: signal lime `#D4F84A`.
  Every text colour passes WCAG AA (body 17.4:1, muted 9.3:1, labels 5.8:1).
- **Type:** Mona Sans (variable weight *and* width, the engine of the kinetic type), Instrument Serif
  Italic for one accent word per heading, Geist Mono for labels and the live clock. All SIL OFL,
  self-hosted, 143 KB in total.
- **Icons:** one inline SVG set (`src/components/ui/Icon.astro`). No emoji.

## 3. What's on the site now

| Area | What it does | Files |
| --- | --- | --- |
| **Hero** | "Found. Answered. *Booked.*" + the plain promise in the same H1. The words **stretch into place** (variable-font width 75% → 116%), so the heading is never hidden. Mann's cut-out portrait is drawn as a **halftone of about 7,200 dots** (4,700 on phones) that gather on load and **scatter and glow lime around the pointer or a finger**; "Show photo" switches to the real photo. Live status, A/B/C index strip | `home/Hero.astro`, `scripts/halftone.ts` |
| **Buttons** | Lime pill with an ink arrow disc; the **label rolls** to an identical copy on hover and the arrow turns; ghost buttons **fill from the bottom**; press scales to 0.97. Labels wrap on tiny phones | `ui/Button.astro`, `global.css` |
| **What I do** | Three areas as one customer path. On desktop a **phone stays in view and switches screens** (found on Maps → missed call texted back → booked) as you read; on phones each step shows its own screen. Screens are HTML, labelled "Example · fictional business" | `home/Path.astro`, `home/PhoneScreen.astro` |
| **Work** | Real projects as **stacking cards** (each sticks, the next slides over, the covered one recedes) | `home/WorkStack.astro`, `work/*` |
| **Free check** | Full-bleed lime band; a circular badge **turns as you scroll** (never on its own) | `home/FreeCheck.astro` |
| **Finder** | Three questions with **live recommendation**, progress bar, reasons and a pre-filled brief link. Works as a plain form without JavaScript | `Finder.astro`, `lib/guide.ts` |
| **Process** | Five steps on a line that **draws itself** with scroll; You / Me rows line up across steps | `Process.astro` |
| **Form** | A **3-step brief** (About you → What you need → Your message) with progress bar, Back/Continue, chips for budget and timing, errors that clear as you type, error summary per step, animated success tick. One ordinary form without JavaScript | `ContactForm.astro` |
| **Quick menu** | **⌘K / Ctrl K** (or the search button): jump to any page, copy the email, start a project, call/WhatsApp/text. Full keyboard support, honest empty state | `QuickMenu.astro` |
| **Header** | Wordmark whose letters widen in sequence on hover, live Toronto clock, rolling nav labels, solid blurred bar after scroll. Collapses to "Menu" by its own width, so enlarged text never overflows | `Header.astro` |
| **Phone menu** | Full-screen sheet with big links that widen on focus/hover, staggered entrance, contact buttons | `Header.astro` |
| **Footer** | Closing call to action, link columns, copy-email button with toast, and the **kinetic name**: letters widen, thicken and turn lime near the pointer | `Footer.astro`, `scripts/motion.ts` |
| **Services** | Sticky "On this page" bar that **follows your scroll**, every service as an expandable row (what you get / what I need / not included / handover / glossary / "Ask about this"), packages, free check, finder, process, FAQ. Links like `/services/#booking` open that service | `pages/services.astro` |
| **Work, case studies** | Big rows with real captures; case studies with sticky facts, "Look closer" close-ups, dated captures and a "Next project" link | `pages/work/*` |
| **About** | Mann's story **verbatim**, told as place-by-place chapters (Palana → Saint John → Thunder Bay → North York → today → Nest & Rest), house rules, business | `pages/about.astro` |
| **Legal** | Large titles and an "On this page" list that tracks your position | `Legal.astro` |
| **404** | "404" drawn in halftone dots that react to the pointer. "This page wasn't found. Which is a little ironic, given what I do." | `pages/404.astro` |
| **Share image + favicon** | New OG image (halftone portrait + headline) and an "M." favicon | `scripts/make-images.mjs`, `public/` |

Motion rules: everything is off under reduced motion (the halftone draws once, still); content is visible
without JavaScript; nothing loops forever; smooth scrolling only for in-page links.

## 4. Verification (8 Nov 2026)

| Check | Result |
| --- | --- |
| `astro check` | 0 errors, 0 warnings, 0 hints |
| Unit tests (Vitest) | **39/39** |
| Browser tests (Playwright + axe, WCAG 2.2 A/AA rules), rewritten for the new UI | **52 passed, 1 skipped** (the phone-button test needs `PUBLIC_CONTACT_PHONE`; it passes when built with a dummy 555 number) |
| Covered by the suite | 10 pages + 404 pass axe with no console errors; no sideways scroll at 320/360/390/768/1024/1440 px and at 200% text; H1 and "Start a project" visible without scrolling at 390, 768 and 1440 px; phone menu (focus returns); ⌘K menu; skip link; halftone + photo toggle; scroll-driven phone; finder with and without JS; reduced motion; service deep links; package pre-fill; legal links and section list; copy-to-clipboard; every form path (steps, errors, success + de-duplication, network failure, not connected, no-JS post, honeypot, too fast) |
| Lighthouse 12.8.2, mobile, simulated throttling | Performance **93** (home), 94 (services), 96 (about), 96 (contact); Accessibility **100**; Best practices **100**. SEO shows 63–66 only because preview builds are `noindex`; the production build is indexable with canonicals |
| `npm run build:cloudflare` + pre-launch check | **0 errors**, 2 expected warnings (`ENQUIRY_TO_EMAIL` and the optional `FORM_TOKEN_SECRET` live in Cloudflare, not in the build) |
| JavaScript | 26 KB minified for the whole site, before compression; each page loads only its part (no framework) |

Captures: `docs/captures/r5-*.jpg`.

## 5. Notes and owner actions

- Nothing about the deploy changed: same Cloudflare Worker, same variables and secrets.
- Instagram, Facebook and LinkedIn links are still missing (`src/data/site.ts` → `social`). Profiles
  without a URL are simply not shown.
- The example phone screens use a fictional salon ("Rosewood Hair Studio") and a reserved 555 number,
  and say so on screen. The pre-launch check knows about that number.
- Everything else in [`OWNER-INPUTS.md`](OWNER-INPUTS.md) still applies.

## 6. Follow-up after the site review (8 Nov 2026)

Mann asked for every fix that can be made in code, a more unique treatment of his photo instead of
the dots, and no second photo lower on the home page.

| Change | What it does | Files |
| --- | --- | --- |
| **Signal-line portrait** (replaces the halftone dots) | Mann's face is drawn by about 120 horizontal scan lines that oscillate like a radio signal: brighter areas get taller, faster waves and thicker lines (engraving-style tone, sharpened so eyes, nose and smile read). On load each line is traced left to right behind a lime write head; under the pointer or a finger the waves swell, flow and glow lime. Background lines fade in a soft oval. "Show photo" still switches to the real photo; reduced motion draws it once, still | `src/scripts/signal-portrait.ts`, `home/Hero.astro` |
| Same engine on the 404 page and the share image | "404" as signal lines; new OG image | `pages/404.astro`, `scripts/make-images.mjs` |
| **Email fallback for the brief** | While the form can't reach the inbox, the notice says so and the last button becomes **Email this brief**: it opens the visitor's email app with every answer filled in (name, business, services, budget, timing, message). A "not connected" reply from the server switches to the same fallback. Nothing typed is lost | `ContactForm.astro` |
| Honest contact description | Mentions phone, WhatsApp and text only when `PUBLIC_CONTACT_PHONE` is set | `pages/contact/index.astro` |
| **Shorter home page** | The finder and the process timeline now live only on Services (the free-check band links to the finder). About 20% shorter on phones | `pages/index.astro`, `home/FreeCheck.astro` |
| **No second photo on Home** | The About section on Home is text only; the street photo stays on the About page | `home/AboutTeaser.astro` |
| **Phone header** | A compact **Contact** button beside the menu on phones, so the main action is always one tap away; on very narrow screens the menu button shows only its lines | `Header.astro` |
| **A face on the first phone screen** | A small round photo beside "Mann Patel · Toronto, Canada" and the status (phones only) | `home/Hero.astro`, `src/assets/mann-patel-face.jpg` |
| **Example screens labelled** | "Example · Fictional" in the status bar of every example phone screen | `home/Path.astro` |
| Calmer motion | The status pulse runs four times and the typing dots five times, then stop | `global.css`, `home/PhoneScreen.astro` |
| Search data | A `ProfessionalService` with the full service catalogue (names only, no address) on Home and Services | `src/lib/seo.ts` |

**Checks:** `astro check` 0/0/0; unit tests 39/39; Playwright + axe **55 passed, 1 skipped** (new tests:
signal portrait draws and glows under the pointer, phone header button and avatar, example labels,
no photo in the home About section, email fallback both from the status check and from a server
"not connected" reply, service structured data).

**Still needs Mann:** the Cloudflare Email Routing steps and `ENQUIRY_TO_EMAIL` secret (then the form
sends directly), `PUBLIC_CONTACT_PHONE` for the call/WhatsApp/text buttons, social profile links,
a real client quote, and a decision on public starting prices.

## 7. Short pages on phones (8 Nov 2026)

Mann's feedback as a client: the site looked too long on a phone. The layout on phones (under 48em)
was restructured; tablets and laptops keep the layout they had.

| Page (390 × 844 screens) | Before | After |
| --- | --- | --- |
| Home | 15.7 | 8.6 |
| Services | 18.7 | 10.5 |
| Nest & Rest case study | 9.9 | 5.5 |
| Samp Hair & Spa case study | 8.6 | 5.4 |
| About | 9.2 | 5.6 |
| Work | 4.4 | 3.6 |
| Contact | 3.5 | 2.9 |

| Change | Files |
| --- | --- |
| **Swipe rails** with snap points and dots for groups of cards: work, house rules, packages, the five steps, About chapters and rules, case-study decisions and captures | `global.css` (`.rail`), `motion.ts` (dots, tab stop), components and pages listed |
| **"What I do" as three tabs** on phones and tablets (ARIA tabs with arrow keys); laptops keep the scrolling phone | `home/Path.astro` |
| **Questions fold** after five on phones ("Show all 11 questions"); Home shows four, closed | `Faq.astro` |
| **Case studies fold** on phones: the opening, then "Read the full case study" (focus moving into the text also opens it) | `pages/work/[id].astro` |
| Services: no giant A/B/C letters on phones, one line per service until opened (its summary moves inside) | `pages/services.astro` |
| Compact footer: contact first, pages and links as one wrapped line each, services left to the menu | `Footer.astro` |
| Tighter section padding on phones (`--section` starts at 3.5rem), smaller example phone, About photo 4:3 | `tokens.css`, `home/Path.astro`, `pages/about.astro` |
| Hero: the "Or reach me directly" row is hidden on phones (the header's Contact button and the footer carry it) | `home/Hero.astro` |
| **Faster on slow phones:** the portrait's intro now reveals one finished drawing line by line instead of redrawing ~27,000 points every frame (Total Blocking Time on Home, simulated mobile: about 440 ms → 50–220 ms). The serif word "Booked." (the LCP element) has its font preloaded | `scripts/signal-portrait.ts`, `layouts/BaseLayout.astro` |

**Checks:** `astro check` 0/0/0; unit tests 39/39; Playwright + axe **70 passed, 1 skipped**. New
tests: page-length budgets for seven pages, axe at phone width on four pages, every scrolling rail
reachable by keyboard, the tabs with arrow keys, rail dots, the question fold and the case-study fold.
Lighthouse (local, mobile, simulated): Accessibility 100 and Best Practices 100 on every page tested;
SEO shows 63–66 locally only because preview builds are `noindex` on purpose.
