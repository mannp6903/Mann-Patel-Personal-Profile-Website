# 07 · Audit round 2 (1 Nov 2026): baseline, changes, verification

Input: *Mann Patel website audit and Claude Code master prompt* (owner-supplied, reviewed 31 Oct 2026, provisional score **70/100**).
Work done in the repository (branch `ccr-67f44a70-a4hp7n`) and a local preview. Nothing was published to mannpatel.me.

## 1 · Access and evidence limits (read first)

| Source | Status |
| --- | --- |
| Live site `https://mannpatel.me` | **Not reachable from this workspace** (network policy: DNS lookup and HTTPS blocked). The deployed code is the repository's main branch (`523d543`), which this work started from, so the source was inspected instead. Observations about the live rendering come from the audit. |
| `/api/enquiry/` on production | Not reachable here. Behaviour analysed from source and reproduced locally (see §2). |
| Dribbble shots, Brittany Chiang, Dennis Snellenberg, Adham Dannaway | Not reachable here (same network policy). The audit's own inspection of them is used; no new claims are made about them. |
| Mobbin | No Mobbin tool is available in this session. Not used. |
| Lighthouse | Run locally (12.8.2, mobile preset, simulated throttling) against the Node preview build. |
| Field data (CrUX, Search Console) | None available. Not claimed. |

## 2 · P0: the contact-page warning

**Observation (audit):** `/contact/` showed "This form isn't connected to an inbox yet…"; a direct request to `/api/enquiry/` from the audit client returned **403**.

**Diagnosis (from source):**

- The page asks `GET /api/enquiry/` for status. The old script showed the *same* warning for two different situations:
  1. the server answered `connected: false` (email delivery not configured), and
  2. the status request itself failed (network error, non-200, or a static preview).
- The Worker's `GET` handler always returns `200` JSON. A `403` therefore did not come from the site's code. The most likely source is Cloudflare's security layer in front of the Worker (bot protection / AI-crawler blocking, applied to automated clients). **Hypothesis, not verified**: check *Cloudflare → Security → Events* filtered to path `/api/enquiry/`.
- At the time of the audit the Worker's form secrets had not been added (the owner was still setting up the Worker), so for ordinary visitors the server would answer `connected: false` (`ENQUIRY_DELIVERY=resend` with no `RESEND_API_KEY` / addresses). **Most likely cause of the visible warning: email delivery not yet configured.** This is an owner action (§9), not a code defect.

**Fix (code):**

| Change | File |
| --- | --- |
| `GET /api/enquiry/` now returns a fixed `reason` code (`ready` / `not_configured`); never a setting name or secret | `src/pages/api/enquiry.ts` |
| The warning appears **only** when the server definitely says it isn't configured. A failed status check (offline, blocked, static preview) no longer claims the form is disconnected; the send attempt reports its own result | `src/components/ContactForm.astro` |
| The warning itself now gives the email address | same |
| An **always-visible email alternative** with a Copy button sits beside *Send my brief*; every failure message also names it | same |
| Tests: failed status check doesn't show the warning; failure messages include the email; not-configured server still warns honestly | `tests/e2e/site.spec.ts` |

**Not done (needs the owner):** a real sample enquiry through Resend to the owner's inbox. Success is only claimed after that is observed (§9).

## 3 · Reference matrix

| Reference (accessed by the audit, 31 Oct 2026) | Evidence | Adapted here | Not copied |
| --- | --- | --- | --- |
| Roberts Sandro (Odama), Dribbble | Process-section image | Compact numbered "what happens next" steps on Contact | Grid styling, imagery |
| Lane concept (Trexa Lab), Dribbble | Composite image | Real portrait beside a clear offer and two actions | Its marketing numbers and logos |
| Project Section (Muha Omar Faruk), Dribbble | Image | One substantial visual per project with an explicit case-study link; work moved to second section | Overlapping-card interaction |
| Brittany Chiang | Live text | Specific role statement in the hero | Layout |
| Dennis Snellenberg | Live text | Selected work leading toward contact | Motion (not evaluated) |
| Adham Dannaway | Live text | Several capabilities under one personal identity (three outcomes) | Split-identity composition |

## 4 · Direction and tokens

Three directions considered:

1. **Refined warm editorial (current identity)**: keep paper/ink/stamp-orange, Bricolage + Atkinson, Fraunces wordmark; fix scale, order and density. *Phone tradeoff:* lowest risk, already fast.
2. **Work-led personal studio**: large project imagery first, minimal copy. *Tradeoff:* only two projects, one unfinished; would overstate the portfolio.
3. **Business-systems specialist**: lead with the enquiry diagram. *Tradeoff:* hides the website work, which is the main offer.

**Chosen: 1, with the work moved up from 2.** Tokens unchanged (`src/styles/tokens.css`) except a dedicated hero scale: `clamp(2.25rem, 1.4rem + 3.6vw, 4.5rem)` (36 px at 360 px, 72 px at ≥1440 px), `max-width: 17ch`, `text-wrap: balance`. Text accents keep `--accent-text` (#B03A12, 5.4:1 on paper); new numbered badges use white on #B03A12 (≈5.9:1).

## 5 · What changed

| Area | Change | Files |
| --- | --- | --- |
| Home hero | "Websites and simpler systems for small businesses." + supporting line; actions *Start a project* / *See my work*; guide as a text link; eyebrow "Toronto & the GTA"; word-by-word animation removed (text readable at once; only the underline draws, 560 ms) | `src/pages/index.astro`, `src/data/site.ts` |
| Home order | Hero → Selected work (`#work`) → Three outcomes → Guide → Follow-up demo → Process → Founder → CTA | `src/pages/index.astro` |
| Marquee | Visible Pause/Play button (WCAG 2.2.2), pauses off screen, remembered for the visit, hidden with reduced motion | `src/components/Marquee.astro` |
| Contact form | Three plain-language areas + "Not sure yet" first; the 15 specific services moved into an optional disclosure (opens and ticks the matching area when a link or the guide pre-selects services); "what happens next" steps under the heading | `src/components/ContactForm.astro`, `src/lib/enquiry/options.ts`, `src/lib/enquiry/validate.ts`, `src/pages/contact/index.astro` |
| Services | Outcomes → Packages → full catalogue → Process → FAQ; descriptive title "Websites, Google visibility & enquiry follow-up services" | `src/pages/services.astro` |
| Work | Projects first; label key moved below them | `src/pages/work/index.astro` |
| Case studies | "Look closer": numbered close-ups cropped from the real 31 Oct captures, each with the decision it shows | `src/components/mocks/Details.astro`, `src/assets/work/*/detail-*.png`, `src/pages/work/[id].astro` |
| SEO | Person `image` is the real portrait (`/brand/mann-patel-portrait.jpg`), not the share card | `src/lib/seo.ts`, `public/brand/` |
| Privacy | Discloses Cloudflare Web Analytics (cookie-free), seen on the live pages by the audit | `src/pages/privacy.astro` |

### Motion table

| Element | Purpose | Trigger | Behaviour | Timing | Input | Reduced motion | Cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Logo intro | Brand moment | First page of a visit | Letters rise, stop drops, glint | ≈2.2 s total; text never blocks content | n/a | Static | CSS + ~1 KB JS |
| Logo hover | Feedback | Hover / focus | Glint + stop hop | 0.6–1.15 s | Mouse, keyboard | Static | — |
| Hero underline | Emphasis on audience | Load | Underline draws under "small businesses" | 560 ms, 180 ms delay; words visible throughout | n/a | Static | CSS |
| Services strip | Ambient list of services | Load | Slow scroll | 48 s loop | Pause button (touch, keyboard), hover | Not animated, button hidden | CSS + <1 KB JS |
| Section reveals | Orientation | Scroll | 12 px rise + fade | 480 ms | n/a | Visible, no motion; failsafe after 2.5 s | Existing |
| Founder stamp, footer signature | Brand | Scroll | Stamp lands; signature letters rise | ≈0.5–2 s | n/a | Static | Existing |
| Workflow demo, guide | Explain follow-up / choose | Click, arrow keys | Panel change | 160–220 ms | Mouse, touch, keyboard (ARIA tabs) | Instant | Existing |

## 6 · Verification

| Check | Result |
| --- | --- |
| `astro check` | 0 errors, 0 warnings |
| Unit tests (Vitest) | 30/30 passed |
| Browser tests (Playwright + axe, WCAG 2.2 A/AA rules) | **39/39 passed** (2 new: plain-language service choice + pre-selection; failed status check doesn't claim "not connected"; failure messages include the email) |
| Layout | No horizontal overflow at 360, 390, 768, 1024, 1440 px on 8 pages |
| Hero at 360 px | 4 lines, 36 px; both actions visible without scrolling past the intro |
| Lighthouse 12.8.2, mobile, simulated, local Node build | `/` Perf 95–96 · A11y 100 · BP 100 · LCP 2.6 s · CLS 0 · TBT 0 ms. `/contact/` 98/100/100, LCP 2.1 s. `/services/` 98/100/100, LCP 2.1 s. `/work/samp-hair-spa/` 98/100/100, LCP 2.3 s. SEO 63–66 because preview builds are `noindex` (expected) |
| Home LCP | The H1 text (render delay while the display font loads). Inlining CSS cut FCP 2.0 → 1.7 s but not LCP, so it was reverted. Lab result only; field LCP unknown |
| Cloudflare production build | `npm run build:cloudflare`: 0 errors, 4 warnings (the four form secrets, dashboard-only) |
| Live site, live email delivery, Search Console | **Untested here** (no network access / owner accounts) |

## 7 · Score (same rubric)

| Area | Weight | Before (audit) | After (code) | Why |
| --- | --- | --- | --- | --- |
| Positioning and offer | 15 | 13 | 14 | Concise hero + specific supporting line; still no client outcomes |
| Visual design, typography, colour | 20 | 17 | 18 | Hero scale fixed; real close-ups in case studies |
| Navigation and service discovery | 15 | 11 | 13 | Work second on Home; outcomes and packages before the catalogue; the catalogue is still long |
| Work, evidence, storytelling | 15 | 10 | 12 | Annotated details; still two projects, one in progress, no measured results |
| Interaction and motion | 10 | 8 | 9 | Pause control; lighter hero motion; untested on real devices |
| Enquiry conversion and reliability | 15 | 3 | **8** | Honest status, visible email fallback, simpler service choice; **capped until a real delivery is observed** |
| Observable SEO foundations | 10 | 8 | 9 | Descriptive Services title, real portrait in Person data, accurate privacy |
| **Total** | **100** | **70** | **83** | |

**Path to 90+:** add the Resend secrets and observe a real test enquiry (Enquiry → ~13), switch to a verified `@mannpatel.me` address, and add a third real project or measured outcome when one exists.

## 8 · SEO intent map and discovery plan

| Intent (qualitative; no keyword tool used) | Page | Notes |
| --- | --- | --- |
| "Mann Patel" / identity | `/`, `/about/` | ProfilePage + Person (real portrait) |
| Small business websites, Toronto | `/`, `/services/#websites` | A dedicated page only once there is a third project to show |
| Google visibility / Business Profile help | `/services/#seo`, `#business-profile` | Keep eligibility honesty |
| Enquiry follow-up / business email | `/services/#enquiry-workflows`, Home demo | |
| Proof of work | `/work/…` | Link each case study to its services and a pre-filled brief (already) |

**Days 1–30:** Search Console domain property + sitemap; fix anything it reports; publish real social profile links (`src/data/site.ts`). **Days 31–60:** one short write-up of a real decision (e.g. Nest & Rest's price-first home page). **Days 61–90:** review real queries and enquiries; improve the pages people actually use. No rankings or traffic are promised.

Cloudflare Web Analytics can also report Core Web Vitals from real visits: use it for field LCP/INP/CLS instead of lab numbers.

## 9 · Handover: owner actions

1. **Turn on the form:** Resend account → verify `mannpatel.me` → in Cloudflare *Workers & Pages → mann-patel-website → Settings → Variables and Secrets* add **Secret** `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`, `FORM_TOKEN_SECRET`. Then send one test brief from `/contact/` and confirm it arrives. Only then is the form "working".
2. **Check the 403:** *Cloudflare → Security → Events*, filter path `/api/enquiry/`. If real browsers are being challenged, add a WAF skip rule for that path.
3. **Domain email:** *Email → Email Routing* to receive `hello@mannpatel.me` in Gmail. After a test message arrives, replace `profile.contact.email` in `src/data/site.ts` (one place; it updates the footer, contact page, form fallback and privacy page).
4. **Review copy:** the new hero line and supporting sentence are proposals from the audit; edit `src/pages/index.astro` and `profile.intro` in `src/data/site.ts` if they don't sound like you.
5. **Monitor:** Cloudflare Worker *Logs* show `enquiry_*` events; Resend's dashboard shows each email.
