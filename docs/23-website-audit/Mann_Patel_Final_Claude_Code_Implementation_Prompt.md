# Mann Patel: final Claude Code implementation prompt

Self-contained. Written from the 10 to 11 Nov 2026 audit. It carries the selected decisions and exact wording; do not repeat the audit.

---

## BEGIN PROMPT

Implement the accepted audit changes to https://mannpatel.me/ listed below. Work as a careful product engineer. Finish the code changes, run the checks, and report what was done against each MP ID.

### 1. Baseline (confirmed 11 Nov 2026)

- Live site: https://mannpatel.me/
- Repository: `mannp6903/Mann-Patel-Personal-Profile-Website`
- Production commit: `fd1a5637fe30978b43287c8683a09e11f3dc0c25` (PR #23). A production build of this commit is byte-identical to the live HTML apart from a script Cloudflare injects. Re-confirm the current default branch and head before starting; do not assume they are unchanged.
- Stack to keep: Astro 7, TypeScript, vanilla scripts, self-hosted fonts, Cloudflare Workers (`mann-patel-website`, `wrangler.jsonc`), Cloudflare Email binding `ENQUIRY_EMAIL`, `keep_vars: true`. No new dependencies. No framework change.
- Baseline tests on the unchanged commit: Vitest 72 of 72. Playwright 118 pass, **1 fail**: `layout › selected work starts by y=1150 at 1440x1000` (received 1238). That failure is MP-010.

### 2. Outcome and facts to preserve

Outcome: qualified enquiries from Toronto and GTA small-business owners, through clearer and more accurate wording, without removing the site's identity.

Preserve exactly:

- Headline: "Web design, local SEO and automation for Toronto businesses." Line breaks: "Web design," / "local SEO" / "and automation" / "for Toronto businesses."
- Service-area line: "Serving Toronto and the GTA, with a focus on Scarborough and North York."
- Contact details, masked phone behaviour, social links, ownership promises, every package boundary, exclusion and third-party cost.
- Project status: Nest & Rest Cleaning is Mann's own business, website live, business opens summer 2027. Samp Hair & Spa is a client site in progress with a preview online. No results are claimed for either.
- The real portrait. The portrait dial that starts clear.
- `/pricing/` stays `noindex`, unlinked and out of the sitemap while `price.amount` is `null`.
- Routes and query contracts: `/contact/?package=check-up#check`, `/contact/?package=<id>#brief`, `/contact/?service=<id>#brief`, finder pre-fill, legacy package ids.
- Enquiry endpoint, delivery adapters, spam controls and honest sending states. Do not replace the form with a mailto link or a static success screen.
- Canonicals, robots.txt, sitemap, structured data types. Keep the FAQPage markup (it is accurate; it simply earns no Google rich result any more).

Do not add: prices, testimonials, client counts, logos, rankings, a reply-time promise, location pages, `llms.txt`, chatbots, new services, or any biographical fact.

### 3. Design and content direction

Keep the dark and lime identity, work-first order, honest labels, the fictional-data label, the phone drawer and the two-path contact form. Refine wording so no line promises more than a package delivers, give the free check one plain name, and make the phone hero and the About page show useful content sooner.

### 4. Accepted changes

Exact wording for every C-number is in `docs/23-website-audit/Mann_Patel_Approved_Copy_Deck.md`. The text below repeats the essential strings so this prompt stands alone.

| MP ID | Change | Files (inspected) | Acceptance |
| --- | --- | --- | --- |
| MP-001 | Price label `"Quoted after your free check"` → `"Written quote after a short brief"`. Comparison intro → "Each package is quoted in writing after a short brief, so the price matches your scope. The free check is optional and separate." Update the `/pricing/` preview note and comments that quote the old label | `src/data/packages.ts` (`priceLabel`, header comment), `src/components/packages/PackageCompare.astro`, `src/pages/pricing.astro`, `src/data/service-pages.ts` (comment) | No built page contains the old label; home shows "Package: Website Launch · Written quote after a short brief" |
| MP-002 | Replace absolute follow-up promises. Group B title → "Enquiry follow-up and booking". Group B intro → "Missed callers and form enquiries get a quick, honest automatic reply and land in one list you check. Reminders help cut no-shows. You start with one tested workflow." Hero step 02 → "A tested enquiry path, with follow-up reminders so new enquiries aren’t left waiting." Enquiry-list summary → "Enquiries from your form, calls and messages in one list with a status, and a reminder before anyone waits too long." Package bullet "every enquiry lands" → "each website enquiry lands". Limits → "Your team still answers the enquiries; the workflow sends the first reply and reminds you before one is forgotten." About lead and "Why I do this" per C-08 and C-09. Form option B per C-10 and C-10b. `profile.intro` per C-32. Contact fallback description per C-27 | `src/data/services.ts`, `src/components/home/Hero.astro`, `src/data/packages.ts`, `src/data/service-pages.ts`, `src/pages/about.astro`, `src/components/ContactForm.astro`, `src/lib/enquiry/options.ts`, `src/data/site.ts`, `src/pages/contact/index.astro` | Built HTML contains none of "Never miss", "none are missed", "each one gets a reply", "answers every enquiry". "I read and answer every enquiry myself" stays |
| MP-006 | One name: "Free website and Google check". Heading → "Not sure what to fix first? Get a free *website and Google* check." Lead → "Send your website or business name and I’ll email you a short written list of fixes, most important first. For businesses in Toronto and the GTA." FAQ per C-16 and C-17. Footer link, quick menu hint, contact panel heading, form option, finder headline renamed | `src/components/home/FreeCheck.astro`, `src/data/packages.ts` (`checkUp`), `src/data/faqs.ts`, `src/components/Footer.astro`, `src/components/QuickMenu.astro`, `src/pages/contact/index.astro`, `src/lib/enquiry/options.ts`, `src/lib/guide.ts`, `src/pages/pricing.astro` if it names the check | Built HTML contains no "Found & Answered" in visible text; hero button and contact panel heading both say "website and Google check" |
| MP-007 | Websites summary → "Fix a tired site, or build a new one of up to five pages, with clear service information, click-to-call and a book-or-quote button on every page." Group C intro → "A clear, fast site that says what you do and where, with a book-or-quote button on every page. Monthly care is optional." Care summary and first two deliverables per C-19 and C-19b. Form option C hint per C-26 | `src/data/services.ts`, `src/components/ContactForm.astro` | No "five to seven" in built HTML |
| MP-008 | Move the lime emphasis from the third hero line to the first. Headline text unchanged | `src/components/home/Hero.astro` | `.hero__line--signal` is the first line; H1 text identical |
| MP-009 | Phone hero sculpture: cap the stage height on small screens; hide "· Move to rotate" where `(hover: none)`; serve a smaller poster to small screens with `fetchpriority="high"`; keep the pause button, canvas behaviour and reduced-motion fallback | `src/components/home/SignalSculpture.astro`, `src/components/home/Hero.astro` | At 390 × 844 the stage is at most about 240 px tall; the hint is not shown on touch; the poster request at 390 px is the smaller file |
| MP-010 | Tighten desktop hero spacing so `#work-title` starts by y = 1150 at 1440 × 1000. Do not change the target in the test | `src/components/home/Hero.astro` | The existing test passes unchanged; H1 and free-check button stay visible without scrolling at 320, 768 and 1440 |
| MP-011 | About header on small screens: portrait directly after the lead, before the anchor links and contact chips. Desktop unchanged | `src/pages/about.astro` | At 390 × 844 the portrait top is above the contact chips |
| MP-012 | "Next I moved back to Thunder Bay with no job lined up." → "Next I moved to Thunder Bay, Ontario, with no job lined up." No other biographical change | `src/pages/about.astro` | Sentence as written |
| MP-016 | About description, Contact title, two case-study descriptions per C-23, C-24, C-30, C-31 | `src/pages/about.astro`, `src/pages/contact/index.astro`, `src/content/work/*.md` | Descriptions at or under about 160 characters; titles unique |
| MP-017 | Audience wording per C-20 and C-21; FAQ "Where do you work?" per C-29 | `src/pages/about.astro`, `src/data/service-pages.ts`, `src/data/faqs.ts` | Strings present |

### 5. Not in code (owner work, record only)

MP-003 third-party proof; MP-004 live delivery test; MP-005 prices; MP-013 Search Console and enquiry log; MP-014 Business Profile decision; MP-015 Samp launch; MP-018 `www` redirect rule in Cloudflare; MP-019 HSTS in Cloudflare; MP-021 Cloudflare bot script; MP-024 reply time; MP-025 portrait; MP-026 guide. MP-020 is a deliberate keep. MP-022 and MP-023 are experiments with decision rules; make no change now.

### 6. Order of work

1. MP-001, MP-002, MP-006, MP-007, MP-017, MP-012, MP-016 (data and copy).
2. MP-008, MP-010, MP-009 (hero; shared styles, do them together).
3. MP-011 (About layout).
4. Update test assertions that quote changed copy. Never delete a meaningful test or loosen a layout target to get green.
5. Docs: add an entry to the README documentation table and to `docs/OWNER-INPUTS.md` for the owner actions.

### 7. Validation

Run and report actual results:

```bash
npm run check
npm test
npm run build && npx playwright test --trace off
npm run build:cloudflare        # includes the pre-launch check
```

Browser checks on the built site: home, About, services, one service page and contact at 320 × 568, 390 × 844, 844 × 390 and 1440 × 900; reduced motion; keyboard through the hero; an axe scan of the changed pages; `/contact/?package=check-up#check` and `/contact/?package=website-enquiry#brief`; no new console errors. Use the local file adapter for any submission test. Do not send a live submission, place a call or send a message.

Confirm in the production build's HTML: titles, descriptions, one H1 per page, canonicals, `index, follow` on sitemap pages, `noindex` on `/pricing/`.

### 8. Working rules

- Work on a fresh branch from the current production base. Preserve unrelated changes. No force-push over anyone else's work.
- No secrets, private addresses or the full phone number in code or docs.
- Keep production and preview settings distinct; never commit a preview-domain canonical.
- Push, open a pull request, merge or deploy only as the current user has authorized. A merge is not a deployment; verify the public site after any authorized release.

### 9. Completion report

Write `IMPLEMENTATION_REPORT.md` with: branch, commit and any PR or preview URL; a table mapping every MP ID to implemented, deferred, blocked, rejected (with reason) or not applicable; what changed and the customer benefit; checks run with real results and the environment; what remains unverified (inbox delivery, field performance, Search Console); owner decisions outstanding; rollback reference.

Do not claim a new score. The revised site must be inspected first.

## END PROMPT
