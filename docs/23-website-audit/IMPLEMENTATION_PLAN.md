# Implementation plan

Written 11 Nov 2026 from the audit in this folder, before any code changed.

## 1. Baseline

- Branch: `claude/new-session-l6zaca`, started at `fd1a563` (PR #23 merge), which is the commit production serves (verified by diffing a production build against the live HTML).
- Production behaviour: all pages 200, forms report `connected: true`, 0 axe violations, Lighthouse mobile lab performance 91 to 99.
- Tests on the unchanged commit: Vitest 72 of 72; Playwright 118 pass, 1 fail (`selected work starts by y=1150 at 1440x1000`, received 1238).

## 2. Direction and what stays

Wording becomes accurate to the packages, the free check gets one plain name, and the phone hero and About page show useful content sooner. The headline, service-area line, identity, work-first order, honest labels, forms, routes, structured data and hosting are unchanged.

## 3. Accepted changes

| MP ID | Evidence or problem | Final decision and exact change | Files | Acceptance check |
| --- | --- | --- | --- | --- |
| MP-001 | Every price line says "Quoted after your free check"; FAQ and form say otherwise | Label → "Written quote after a short brief"; comparison intro reworded so the check is optional | `src/data/packages.ts`, `src/components/packages/PackageCompare.astro`, `src/pages/pricing.astro`, `src/data/service-pages.ts` | Old label absent from built HTML |
| MP-002 | Five absolute follow-up promises beside a one-workflow package | Conditional wording (copy deck C-02 to C-10, C-27, C-32); group B title → "Enquiry follow-up and booking" | `src/data/services.ts`, `Hero.astro`, `src/data/packages.ts`, `src/data/service-pages.ts`, `src/pages/about.astro`, `ContactForm.astro`, `src/lib/enquiry/options.ts`, `src/data/site.ts`, `src/pages/contact/index.astro` | "Never miss", "none are missed", "each one gets a reply", "answers every enquiry" absent |
| MP-006 | Free-check lead is a fragment; the offer has three names | One name, "Free website and Google check"; new concrete lead (C-11, C-13 to C-17, C-25) | `FreeCheck.astro`, `src/data/packages.ts`, `src/data/faqs.ts`, `Footer.astro`, `QuickMenu.astro`, `src/pages/contact/index.astro`, `src/lib/enquiry/options.ts`, `src/lib/guide.ts` | "Found & Answered" absent from visible text |
| MP-007 | "five to seven pages" against "Up to five pages"; care wording exceeds the package | Catalogue wording aligned (C-12, C-18, C-19, C-19b, C-26) | `src/data/services.ts`, `ContactForm.astro` | "five to seven" absent |
| MP-008 | Lime emphasis on "and automation" | Emphasis moves to "Web design,"; text unchanged | `Hero.astro` | First hero line carries the signal class |
| MP-009 | Sculpture is about 330 px tall on phones, its hint is meaningless on touch, and its poster is the oversized LCP image | Cap the stage on phones, hide the hint on `(hover: none)`, responsive poster with a priority hint | `SignalSculpture.astro`, `Hero.astro` | Stage ≤ about 240 px at 390 px; smaller poster requested |
| MP-010 | Failing baseline test: work heading at 1238, target 1150 | Tighten desktop hero spacing; target unchanged | `Hero.astro` | Existing test passes |
| MP-011 | About portrait about 930 px down on phones | Portrait after the lead on small screens | `src/pages/about.astro` | Portrait above the contact chips at 390 px |
| MP-012 | "moved back to Thunder Bay" with no earlier mention | "Next I moved to Thunder Bay, Ontario, with no job lined up." | `src/pages/about.astro` | Sentence as written |
| MP-016 | Long descriptions; bare Contact title | C-23, C-24, C-30, C-31 | `src/pages/about.astro`, `src/pages/contact/index.astro`, `src/content/work/*.md` | Descriptions ≤ about 160 characters |
| MP-017 | Audience lists omit salons; FAQ service area differs from the approved line | C-20, C-21, C-29 | `src/pages/about.astro`, `src/data/service-pages.ts`, `src/data/faqs.ts` | Strings present |

New assumption, labelled: the free check is described as "For businesses in Toronto and the GTA". This follows the approved service area and adds no new claim.

## 4. Not implemented, with reasons

| MP ID | Reason |
| --- | --- |
| MP-003, MP-015 | Proof depends on client work and consent; nothing may be invented |
| MP-004 | A live delivery test notifies the owner; not authorized here |
| MP-005 | Prices are Mann's to cost and approve |
| MP-013, MP-014 | Account actions |
| MP-018, MP-019, MP-021 | Cloudflare dashboard settings; HSTS is hard to undo, so it is the owner's call |
| MP-020 | Deliberate keep |
| MP-022, MP-023 | Experiments with decision rules; no change until there is data |
| MP-024 | Needs a reply time Mann can keep |
| MP-025 | Optional owner asset |
| MP-026 | Needs owner review of the draft guide |

## 5. Unresolved owner items

Delivery test result; Thunder Bay question; reply time; prices and tax; in-person client contact (Business Profile eligibility); publishable relevant experience; Samp testimonial and permission; whether "Taking new projects" is current.

## 6. Order and validation

1. Copy and data: MP-001, MP-002, MP-006, MP-007, MP-012, MP-016, MP-017.
2. Hero: MP-008, MP-010, MP-009.
3. About layout: MP-011.
4. Update test assertions that quote changed copy; no test is deleted and no layout target is loosened.
5. `npm run check`, `npm test`, `npm run build && npx playwright test --trace off`, `npm run build:cloudflare`.
6. Browser checks at 320, 390, 844 × 390 and 1440; reduced motion; keyboard; axe on changed pages; preselection links.
7. `IMPLEMENTATION_REPORT.md`, commit, push to `claude/new-session-l6zaca`. No merge and no deploy without the owner's go-ahead.
