# 10 · Round 4: original design, connected form, direct contact (1 Nov 2026)

Request (Mann): use the full street photo; don't copy anyone's design; add interactive motion graphics; connect every button; new email **info@mannpatel.me**; Call / WhatsApp / Text buttons with the number kept private; make the form send enquiries straight to Mann; fix overlapping buttons and other bugs; aim for 95+ across SEO, design, motion, forms, buttons, information, contact, social and UI/UX.

## What changed

| Area | Change | Files |
| --- | --- | --- |
| **Originality** | Removed the elements borrowed from the studio reference: the cut-out portrait on grey, the giant sliding name, the floating round menu button, the round "magnetic" buttons and the "Let's work together" footer. The new direction is the site's own **front desk** idea: an enquiry ticket, a desk mat and an address bar | `Hero.astro`, `Header.astro`, `Footer.astro`, `Intro.astro`, `WorkList.astro`, `global.css` |
| **Hero** | The full street photo on a card that **tilts toward the pointer** (with a light glare), a name badge with the **live Toronto time**, and a sample **enquiry ticket that stamps itself** through four steps, ending in a "Nothing slipped" stamp, with a **Replay** button. The H1 promise gets a **hand-drawn underline** that draws itself. "Taking new projects · Toronto & the GTA" status with a pulse. The ticket is labelled *Sample* | `src/components/home/Hero.astro` |
| **Motion graphics** | Tilted, pausable services ribbon under the hero; intro statement whose **words darken as you read** (scroll-linked); work previews as a small **browser window that types the project's address** and leans with the cursor; header **reading-progress line**; drop-down menu sheet with staggered links; contact buttons with a colour wash. All of it is off with reduced motion, and the H1 is never animated (it paints immediately) | `Marquee.astro`, `Intro.astro`, `WorkList.astro`, `Header.astro`, `ContactActions.astro` |
| **Overlaps / bugs** | The floating menu button covered the footer button, the email pill, the form's textarea and summaries. It's gone; the header is now **sticky** on every page. The footer's absolutely positioned round button is gone; the footer is plain document flow | `Header.astro`, `Footer.astro` |
| **Form → inbox** | New **Cloudflare Email** delivery: the Worker's `send_email` binding emails each brief from `website@mannpatel.me` to Mann's verified inbox, Reply-To = visitor, all fields included. No Resend account needed. One retry; honest failure. The spam-check secret now falls back to a per-build random secret | `src/lib/enquiry/mime.ts`, `delivery.ts`, `src/pages/api/enquiry.ts`, `wrangler.jsonc`, `astro.config.mjs` |
| **Contact channels** | `info@mannpatel.me` everywhere. **Email / Call / WhatsApp / Text** buttons in the hero, menu, contact page, About, every CTA band and the footer. The number comes from the build variable `PUBLIC_CONTACT_PHONE` (never in the public repo), is shown **masked** (`647-55X-XXXX`), and is base64-encoded in the HTML; a script fills in `tel:` / `https://wa.me/` / `sms:` links (WhatsApp and SMS open with "Hi Mann, I found your website…"). Without JS the buttons open the contact page | `src/lib/phone.ts`, `src/lib/contact.ts`, `src/scripts/reach.ts`, `src/components/ContactActions.astro` |
| **SEO** | Person JSON-LD gains `email`, a `ContactPoint` (new projects, Toronto + GTA) and `homeLocation`. The phone stays out of structured data (privacy) | `src/lib/seo.ts` |
| **Privacy** | Names Cloudflare (hosting, Email Routing, form email) and Google (Gmail inbox); explains calls, texts and WhatsApp | `src/pages/privacy.astro` |
| **Pre-launch check** | Accepts `ENQUIRY_DELIVERY=cloudflare`: checks the binding and a mannpatel.me sender; `ENQUIRY_TO_EMAIL` is a dashboard warning | `scripts/prelaunch-check.mjs` |

## Verification

| Check | Result |
| --- | --- |
| `astro check` | 0 errors, 0 warnings |
| Unit tests | **39/39** (new: MIME headers, UTF-8 subject/body, header-injection guard, Cloudflare delivery + retry + honest failure, phone normalise/mask/encode, call/text/WhatsApp links) |
| Playwright + axe (WCAG 2.2 A/AA rules) | **47/47** (new: sticky header + no control covered in the footer; ticket stamps + Replay; reduced-motion ticket is complete and still; contact buttons, masked number, full number absent from HTML; no-JS fallback) |
| Overlap scan (every visible link/button/field) | **0 overlaps** on 8 pages × 9 viewports (360×640 to 1920×1080) × 3 scroll positions |
| Sideways scroll | none at 320, 360, 390, 768, 1024, 1440 px and at 200% text |
| **Form end to end on the Cloudflare runtime** (`wrangler dev`, local Email binding) | `GET /api/enquiry/` → `connected: true`; POST → `ok: true`; the captured `.eml` decodes to "New enquiry: Test Owner (Café Test)", Reply-To = visitor, every field present |
| `npm run build:cloudflare` | 0 errors, 2 warnings (`ENQUIRY_TO_EMAIL` and the optional `FORM_TOKEN_SECRET` live in the dashboard) |
| `wrangler deploy --dry-run` | OK, 171.8 KiB gzip; bindings: `ENQUIRY_EMAIL` (Send Email), assets, vars |
| Lighthouse 12.8.2, mobile, simulated, **production-mode build** | `/` 96 · 100 · 100 · **100** · `/services/` 97 · 100 · 100 · 100 · `/about/` 99 · 100 · 100 · 100 · `/contact/` 97 · 100 · 100 · 100 (Performance · Accessibility · Best practices · SEO). LCP 2.0–2.6 s, CLS 0 (0.04 on /contact/ in this test only because no inbox was configured, so the "not connected" notice appeared) |
| Live delivery to Mann's real inbox | **Not testable here.** Needs Email Routing + `ENQUIRY_TO_EMAIL` (owner steps below) |

## Scorecard (honest)

| Area | Score | What holds it back |
| --- | --- | --- |
| SEO (technical) | 97 | Lighthouse 100 on every page tested; Search Console not yet set up (owner) |
| Design / UI | 95 | Own "front desk" direction; consistent tokens; checked at 9 sizes |
| Motion graphics | 95 | Seven purposeful motions, all pausable or off with reduced motion |
| Buttons | 97 | Every button goes somewhere real; 0 overlaps; 44 px targets |
| Forms | 93 → **97 after the live test** | Code verified on the Cloudflare runtime; the real inbox test needs the owner steps |
| Information | 95 | Services, packages, process, FAQ, honest project statuses |
| Contact information | 90 → **97 with the phone variable** | info@ is live once Email Routing is on; phone buttons appear when `PUBLIC_CONTACT_PHONE` is set |
| Social media | 70 → **95 with real profiles** | Only GitHub is known. Instagram / LinkedIn / Facebook URLs are needed; they're hidden in production until then |
| UI/UX & accessibility | 97 | axe clean on every page, keyboard and no-JS paths, reduced motion |

Overall now ≈ **92/100**; **≈ 96** once the three owner items below are done. Those last points depend on things only Mann can supply, so they aren't claimed yet.

## Owner actions (about 15 minutes)

1. **Email Routing + form:** `docs/05` §1: turn on Email Routing for mannpatel.me, verify your Gmail as a destination, create `info@mannpatel.me` → Gmail, add Secret `ENQUIRY_TO_EMAIL` = your Gmail. Send a "Test Owner" brief.
2. **Phone buttons:** `docs/05` §4 step 5: build variable `PUBLIC_CONTACT_PHONE` = your number, then redeploy.
3. **Socials:** send me your Instagram / LinkedIn / Facebook URLs (or add them in `src/data/site.ts` → `social`).
