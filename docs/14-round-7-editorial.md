# 14 · Round 7: compact editorial portfolio, dependable enquiries (8 Nov 2026)

**Brief:** the 8 November 2026 audit (editorial rating 74/100, not Lighthouse) and its master prompt:
make enquiry delivery dependable, put real work straight after a compact hero, keep the identity,
tighten the experience, and verify everything honestly. Not deployed: this branch is for review.

## 1. Baseline and refreshed findings

Checked against the live site (mannpatel.me) and the repository before any change.

| Audit finding | Refreshed evidence (8 Nov 2026) | Result after this round |
| --- | --- | --- |
| A01 `/api/enquiry/` says `connected: false`, `reason: not_configured` | Still true on the live site. Round 6 (deployed earlier the same day) did not change delivery. The production build's own check names the cause: **`ENQUIRY_TO_EMAIL` is not set** in Cloudflare | Code is complete and honest; the remaining step needs Cloudflare access (section 5) |
| A02 privacy page describes server email delivery only | Still true | Privacy now describes both paths: direct sending, and the email-app fallback that is active while delivery is off |
| A03 selected work ≈ y=4,936 at 1440×1000 | Measured locally: **4,936** | **932** (first project card 1,091) |
| A04 one project visible in a sideways rail on phones | Still true | Both projects stacked in normal reading order at 360 and 390 px |
| A03 mobile ≈ 2,894 at 390×844 | Measured locally: **2,866** | **908**; Start a project ends at y=683 (first screen) |
| A05 no explicit service descriptor | Still true | H1: “Found. Answered. Booked. Websites, local search and enquiry follow-up for small businesses in Toronto and the GTA.” |
| A06 three tall service scenes before the work | Still true | Three short summaries, after the work, each linking to its detail |
| Desktop document height | 10,205 px | 6,648 px |

## 2. What changed

### Enquiries (A01, A02, A08)

The backend already had what the audit asked for: server validation, honeypot + signed time check
(+ optional Turnstile), per-IP rate limits, idempotent submits (a retry with the same submission id,
or the same content, returns the first result instead of sending again), a readiness check that only
says “connected” when the transport is really configured, and an honest “not connected” refusal.
It was kept, not replaced. What changed:

| Change | Files |
| --- | --- |
| **Free check, short path.** Name, reply email, website **or** business name (owners without a site can ask), optional note. Same endpoint and protections. `?package=check-up` and `#check` open it; the full brief is one tap away. Works without JavaScript | `components/CheckForm.astro`, `pages/contact/index.astro`, `lib/enquiry/validate.ts` |
| Server rule: for the check, the message is optional and a website or business name is required; the full brief still requires a real message | `lib/enquiry/validate.ts` |
| Duplicate key includes what to check, so two different check requests from one email are both delivered, while a retry of the same one is not | `lib/enquiry/handler.ts` |
| Owner email subject marks free checks (“Free check request: …”) | `lib/enquiry/delivery.ts` |
| **Timeout** (20 s) on sending, with a message that says a retry won’t duplicate; shared by both forms | `lib/enquiry/client.ts` |
| **Copy my brief / request** button whenever the website can’t send (fallback mode, network failure, timeout, server error) | both forms |
| **Honest success wording:** “Your brief was sent. The website accepted it and passed it on for delivery to my inbox.” It no longer says “arrived”, because the server can only confirm Cloudflare accepted it | both forms, `pages/contact/received.astro` |
| **Analytics:** opening the email app is now `email_app_launch`, no longer counted as `generate_lead`; `generate_lead` fires only after the server accepts. New `cta_click` and project `select_content` events. Never any form contents | forms, `scripts/reach.ts`, `docs/05` |
| Privacy: what each form collects, and both delivery paths, in factual terms | `pages/privacy.astro` |

### Homepage (A03–A06, A11)

New order: compact hero → **selected work** → three service summaries → free check → how I work
(founder note, five steps, commitments) → questions → closing call to action and footer.

- **Hero:** outcome headline kept; service descriptor added to the H1; one short paragraph; two
  actions with different jobs (Start a project; See selected work). The free check moved to its own
  block. The A/B/C strip was removed. Title size 88–120 px on desktop, ≈ 54 px on phones.
- **Portrait:** wide screens keep the signal-line portrait, and “Show photo” now reveals Mann's real,
  whole photo. Phones and tablets show the real photo under the buttons by default (an earlier
  version hid the large portrait behind a button, which removed it from the first screens; reversed
  at Mann's request). The work heading sits at y≈1,256 at 390×844 (test limit 1,300).
- **Selected work:** two image-led cards with relationship, website status kept separate from
  business status (“Website live” / “Business opens summer 2027”), the customer problem, my role,
  the date checked and the case-study link. Side by side on desktop, stacked on phones.
- **Services:** three summaries replace the sticky phone and its example screens.

### Case studies (A07, A11, A13)

Each case now opens with **At a glance** (relationship, website status, business status, date
checked, my role, the problem) and adds an **Evidence** section: a table of behaviour that was
actually tested, how, and the result; limitations; outcomes; next step. On phones the evidence
previews its first check and opens with one tap.

Tests run on 8 Nov 2026 (Playwright + axe-core):

- **Nest & Rest (live site):** price box ($116 → $140 with a second bedroom; minus disabled at 1);
  postal check (M1B and M2N accepted, L4C declined with a waitlist offer); booking page in “Opening
  soon” mode with no form; no sideways scroll at 360/390/768/1440; **0 axe violations** at 390 and 1440.
- **Samp Hair & Spa (preview):** “Open now” badge correct at four fixed Toronto times with the
  visitor’s computer set to India time; the appointment request asks for a service before continuing
  and marks Sundays closed; no sideways scroll; **axe found 31 low-contrast items and 1 invalid ARIA
  attribute**, listed as open issues. The request’s final step was **not** submitted, so nothing was
  sent to the salon.

Each case study has its own sharing image made from its real capture and true labels
(`public/og/work-*.png`, `scripts/make-project-cards.mjs`).

### Services, About (A09, A12)

- **Compare the packages:** the four current packages (Business Launch, Found & Chosen, Never Miss an
  Enquiry, Website That Books) side by side: best for, covers, not included, you provide, price
  (“Written quote after a short brief”: no prices were invented), next step. The free check stays separate.
- **About:** the short introduction leads, then house rules and where I’m going; the full personal
  story is unchanged, below, with a link from the introduction.

### Motion: restrained

Kept: the hero’s signal-line portrait and WebGL dot field, the 404 radar, heading/section reveals,
the header reading line, page transitions, magnetic buttons, and a soft spotlight on project cards
and packages. **Removed** (round 6 effects the audit asked to avoid): the scroll marquee, the cursor
follower, 3D tilt, word-by-word scroll lighting, decoding on every label, and the dot field behind
every page title and the footer. Nothing moves on its own for more than a few seconds; reduced
motion turns it all off.

## 3. Design, tokens and components

Tokens are unchanged (`src/styles/tokens.css`, `DESIGN.md`): background `#0b0b0c`, surface `#18181b`,
text `#f2f1ec`, supporting text `#b3b2ab`, accent `#d4f84a`. Fonts unchanged: Signal Sans (Mona Sans,
renamed in the subset as its Reserved Font Name requires), Instrument Serif, Geist Mono.

| Component | States | File |
| --- | --- | --- |
| Selected-work card | default, hover (border + spotlight), focus on title and case-study links | `components/home/SelectedWork.astro` |
| Service summary | static; links underline/arrow on hover and focus | `components/home/ServiceSummary.astro` |
| Free-check form | idle, invalid (per field, either-or), sending, sent, not connected (email app + copy), failed (copy) | `components/CheckForm.astro` |
| Form chooser | brief / check (`aria-current`) | `pages/contact/index.astro` |
| At a glance, evidence table | stacked rows on phones (explicit table roles), folded preview on phones | `pages/work/[id].astro` |
| Package comparison | scrollable labelled region on narrow screens | `pages/services.astro` |
| Portrait-art toggle | collapsed / expanded (`aria-expanded`) | `components/home/Hero.astro` |

## 4. Verification

| Check | Result |
| --- | --- |
| `astro check` | 0 errors, 0 warnings, 0 hints |
| Unit tests (Vitest) | **54/54** (15 new: free-check rules, duplicate handling, owner subject, send states incl. timeout, copy/email text) |
| Browser tests (Playwright + axe, WCAG 2.2 A/AA) | **90 passed, 1 skipped** (the phone-button test needs `PUBLIC_CONTACT_PHONE`). New: work-position targets at 1440×1000 and 390×844; both projects without swiping at 360/390; portrait art toggle; free-check path, either-or error, owner without a website, double-click recorded once, fallback without sending, network failure with copy; privacy wording; package comparison with no prices; case-study summary, evidence and sharing image; removed effects stay removed |
| Kept from before | 10 pages + 404 pass axe with no console errors; no sideways scroll at 320–1440 px and 200% text; menu dialog (Escape, focus return); ⌘K menu; skip link; reduced motion; no-JS paths; every brief path; deep links; legal links |
| `npm run build:cloudflare` + pre-launch | **0 errors**; 2 warnings: `ENQUIRY_TO_EMAIL` (the blocker) and the optional `FORM_TOKEN_SECRET` |
| Live sites | Nest & Rest and Samp checks above; mannpatel.me readiness re-read |

**Lighthouse 13.6**, mobile, simulated slow 4G and 4× CPU, production settings, served with brotli as
Cloudflare does (same machine and settings as the round 6 baseline earlier the same day):

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 100 | 100 | 100 | 100 | 0.8 s | 0 |
| Services | 100 | 100 | 100 | 100 | 0.8 s | 0 |
| Work | 100 | 100 | 100 | 100 | 0.8 s | 0 |
| Nest & Rest case | 99 | 100 | 100 | 100 | 2.3 s | 0 |
| Samp case | 99 | 100 | 100 | 100 | 2.2 s | 0 |
| About | 100 | 100 | 100 | 100 | 0.8 s | 0 |
| Contact | 100 | 100 | 96* | 100 | 0.8 s | 0 |
| Privacy, Terms | 100 | 100 | 100 | 100 | 0.8 s | 0 |

Desktop: 100/100/100/100 on Home, Services, a case study and Contact (BP 96*). \*The static test server
has no form endpoint, so the forms’ status check logs a 404; with the real server it is 100.
These are lab results from one machine, not field data. Field Core Web Vitals (LCP ≤ 2.5 s,
INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile) are **not measured** here.

**Not verified:** production inbox delivery (needs the secret below and a real test), screen-reader
use with real assistive technology, 400% zoom beyond the 320 px reflow test, field performance,
search rankings, traffic or enquiry conversion.

## 5. Remaining blocker: switch on direct delivery

The code, binding and settings are in place (`wrangler.jsonc`: `ENQUIRY_DELIVERY=cloudflare`,
`send_email` binding `ENQUIRY_EMAIL`, `ENQUIRY_FROM_EMAIL=website@mannpatel.me`). Only Mann can do
the rest, in Cloudflare (full steps: `docs/05` §1):

1. Email Routing on for mannpatel.me, and the inbox added and **verified** as a destination address.
2. Secret **`ENQUIRY_TO_EMAIL`** = that verified inbox (Workers & Pages → mann-patel-website → Settings → Variables and Secrets).
3. Optional: Secret `FORM_TOKEN_SECRET` (a long random string).
4. Then a **real test**: send one free-check request and one brief with your own details; confirm both
   arrive, that Reply goes to the sender, and that `/api/enquiry/` reports `connected: true`.

Until then the site keeps its honest fallback: it says direct sending is off, and offers the email
app or “Copy my brief”. Never set a value just to hide the warning.

## 6. Deploy and roll back

- **Deploy:** merge this branch into the default branch; Cloudflare builds it with
  `npm run build:cloudflare` and deploys (as for round 6). Then do the real test in section 5.
- **Roll back:** in Cloudflare → Workers & Pages → mann-patel-website → Deployments, promote the
  previous deployment; or revert the merge commit on GitHub and let it rebuild.
- **Not done here:** no deployment, DNS, hosting or account change, and no purchase. The optional Lab
  page (A14) was not built; it can follow once delivery works.

## 7. Third-party code

No component library or animation library was added; no third-party UI code was copied. The
reference libraries in the audit (shadcn/ui, Radix, Motion, Motion-Primitives, Magic UI, AstroWind,
Brittany Chiang v4, Nim, React Bits) were not used, and Animmaster Lib (paid) was not used. See
[`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md).
