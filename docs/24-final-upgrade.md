# Round 11: final upgrade (14 Nov 2026)

Sources: Mann's request in the project thread, the **First Client Quickstart** (13 Nov 2026) and the
**Client Growth Master Prompt** (13 Nov 2026 audit evidence).

## What changed

| Area | Before | After |
| --- | --- | --- |
| Hero visual | Lime "signal" ribbon sculpture (WebGL field + canvas) | **Agent graph**: an SVG neural network. Inputs Google, Maps, AI answers; outputs Enquiry, Reply, Booking; Mann's real photo as the core node. CSS pulses, pause button, off-screen pause, still under reduced motion. No canvas, no WebGL. |
| Personal photo | Only in the "Tune in" radio widget lower on Home | Face and name are the first thing in the hero; the large photo is the centre of the hero graph; the founder section shows the plain portrait with a caption. The radio widget is removed. |
| H1 | Web design, local SEO and automation for Toronto businesses. | Web design, local SEO and AI automation for Toronto businesses. Title and description updated to match and name the $1,950 price. |
| Prices | Every package "Written quote after a short brief"; /pricing/ hidden | Published in CAD, plus applicable tax (Quickstart table): **Website Fix $450–$850**, **Website Launch $1,950**, **Website + Enquiry System $3,350**, **Local Visibility Setup $650**, **Website Care $149 a month**. Same figures on the hero, Home price list, Services cards and table, Pricing page, FAQs and service pages (one source: `src/data/packages.ts`). |
| New offer | Repairs "quoted on their own" | **Website Fix**: one defined repair with an agreed acceptance test. Selectable on the brief form. |
| Pricing page | Four cards | Five cards, a worked **salon example** (pages, inputs, sign-off checks, $975 + $975 payment), payment, ownership and scope answers. Linked from the menu, footer and quick menu; indexed and in the sitemap. |
| Menu | Services, Work, About, "Start a project" | **Work, Services, Pricing, About, Contact** (phone menu adds Home). Pricing hides itself if prices are ever set back to `null`. |
| Home order | Hero, Work, Walkthrough demo, Services, Free check, About (radio), FAQ | Hero, Work, Services, **Prices**, Free check, About (photo), FAQ (five questions, price first). The walkthrough demo still lives on the enquiry follow-up page. |
| Proof near the buttons | None in the hero | Two dated projects under the hero: Samp Hair & Spa (client preview, Oct 2026) and Nest & Rest Cleaning (own business, launched Oct 2026). |
| FAQ | "Every project gets a written quote" | Plain answers on price, what $1,950 includes, payments, and ownership/handover. |

## Testing hooks added (Quickstart "measure enquiries")

- **GA4 DebugView mode.** Open any page with `?ga_debug=1`; for the rest of that tab every event is sent
  with `debug_mode: true` (and logged to the console), so a controlled test submission of each form
  shows exactly one `generate_lead` in GA4 DebugView. `?ga_debug=0` turns it off. Nothing changes for
  normal visitors, and nothing is sent without a measurement ID and consent.
- **`mp:lead` DOM event.** Each successful form fires `document` event `mp:lead` with the form id, so a
  browser test can count leads without GA4.
- **`npm run check:redirects`** (`scripts/check-redirects.mjs`). Traces http://, www., http://www. and
  slashless versions of Home, Web design, Pricing and Contact with `?utm_` parameters, and fails unless
  each is a single permanent hop to `https://mannpatel.me/...` with path and parameters kept, and the
  page is self-canonical.

## Still to do in Cloudflare (cannot be done from the repository)

Static pages are served before the Worker runs, so host redirects are dashboard settings
(`docs/21-growth-seo-launch.md`, "Redirects"):

1. SSL/TLS → Edge Certificates → **Always Use HTTPS**: on.
2. Rules → Redirect Rules → "Redirect from WWW to root": `www.mannpatel.me/*` → `https://mannpatel.me/${1}`,
   **301**, preserve query string.
3. Run `npm run check:redirects` from a computer with internet access. Then inspect Home, the three service
   pages and /pricing/ in Search Console.

Then follow the Quickstart's form test: send one test through each form with `?ga_debug=1`, confirm both
emails arrive, and confirm one `generate_lead` per form in DebugView.

## Verification (14 Nov 2026, local)

- `npm test`: 73 unit tests pass (including the published prices).
- `npm run test:e2e`: 124 browser tests pass (axe WCAG 2.2 A/AA on every page, 320–1440 px layout with no
  sideways scroll, 200% text, no-JS, reduced motion, forms, menu, prices agreeing everywhere).
- `npm run build:cloudflare`: pre-launch check 0 errors (2 expected warnings about Cloudflare secrets).
- Lighthouse 13.6, mobile, simulated throttling, production build served locally:
  Home 100 / 100 / 100 / 100 (LCP 1.5 s, CLS 0); Pricing 99 / 100 / 100 / 100 (LCP 2.0 s).
  Lab data only; no field data was collected.
