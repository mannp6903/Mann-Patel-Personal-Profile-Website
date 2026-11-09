# Round 11: phone, WhatsApp and LinkedIn buttons, and a full bug sweep (9 November 2026)

**Brief (from Mann):** add WhatsApp and phone buttons at the bottom of the site and in the phone menu,
link LinkedIn, create Instagram buttons, then check every link and bug so nothing is left.

## What changed

| Change | Where |
| --- | --- |
| **Phone number live.** Supplied by Mann; stored encoded (`profile.contact.phoneKey`, never plain digits in the repo or HTML). Turns on Call, WhatsApp and Text in the footer CTA, the phone menu, the desktop hero, every closing CTA, About and the contact page. | `src/data/site.ts`, `src/lib/contact.ts` |
| **Footer Contact column:** the number (masked, tap to call) and “Message on WhatsApp”, with icons. | `components/Footer.astro` |
| **“Show number”** beside the masked number on the contact page and About, for desktop visitors who can't tap to call. Not in the phone menu, where Call shows the number anyway. | `components/ContactActions.astro`, `scripts/reach.ts`, `lib/phone.ts` |
| **Social buttons** (`SocialLinks.astro`): LinkedIn and GitHub as icon pills in the footer and on About; LinkedIn in the phone menu's contact row (labelled on tall phones, icon-only with the others on short ones). Instagram and Facebook icons are ready and appear as soon as their URL is set. LinkedIn is also in the structured data (`sameAs`). | `components/SocialLinks.astro`, `components/ui/Icon.astro`, `components/Header.astro`, `pages/about.astro` |
| **Bug fixed: duplicate id on /contact/.** The brief's character counter and the free check's message box were both `id="c-message"`, so the free-check label and the brief's screen-reader hint could point at the wrong element. The counter is now `count-message`, and a test checks every page for duplicate ids. | `components/ContactForm.astro`, `tests/e2e/site.spec.ts` |

The phone menu still fits one screen at 320×568, 360×640, 375×667, 390×844 and 430×932 with all five
contact and social buttons (tested).

## The sweep (9 Nov 2026)

| Check | Result |
| --- | --- |
| Crawl of every page reachable from `/` (12 pages): internal links, 283 `#anchor` targets, 73 images, fonts and scripts | All resolve |
| Unpublished and special pages (`/pricing/`, `/contact/received/`, 404) | Load correctly; the 404 page returns status 404 |
| External links | nestnrestcleaning.com and the Samp preview: 200. GitHub profile: exists. Google's local-ranking page: confirmed live by search. LinkedIn and support.google.com can't be reached from this build environment; the LinkedIn URL is Mann's own share link with tracking removed |
| HTML validation (html-validate, standard rules) on all 15 built pages | No errors (the validator was checked against a broken sample) |
| Runtime sweep: 15 pages at 360, 390, 768 and 1440 px, plus reduced motion | No console errors, failed requests, broken images, sideways scrolling or unnamed buttons and links (only the 404 page's own intended 404) |
| Unit tests | 61 passed |
| Browser tests (Playwright + axe, WCAG 2.2 A/AA) | **111 passed, 0 skipped** (the phone-button test runs now that a number exists) |
| Lighthouse mobile, production-like build | 100 on 9 of 12 pages; Home and the two case studies 97–99 from blocking-time variance between runs; accessibility, best practices and SEO 100 everywhere (Contact's best practices is 100 on the real server; the static test server has no form API) |
| Cloudflare production build and pre-launch check | 0 errors; warnings only for `ENQUIRY_TO_EMAIL` (owner action) and the optional `FORM_TOKEN_SECRET` |

## Still with Mann

- **Instagram link**, to switch on its button.
- **WhatsApp** must be set up on the business number.
- **Email delivery:** Email Routing and the `ENQUIRY_TO_EMAIL` secret (docs/05 §1).
- **Prices**, when costed (docs/17).
