# Implementation report

Completed 11 Nov 2026 (America/Toronto). Follows `IMPLEMENTATION_PLAN.md` in this folder.

## 1. Where the work is

| Item | Value |
| --- | --- |
| Branch | `claude/new-session-l6zaca` |
| Base | `fd1a563` (PR #23), the commit production served on 11 Nov 2026 |
| Change commit | `c8d1bc4` |
| Pull request | https://github.com/mannp6903/Mann-Patel-Personal-Profile-Website/pull/24 (open, not merged) |
| Live site | https://mannpatel.me/ is **unchanged**. Nothing has been merged or deployed |
| Preview | None was created from this environment. All browser checks ran on a local build of the branch |

## 2. Status of every issue

| MP ID | Status | Note |
| --- | --- | --- |
| MP-001 | **Implemented** | Price label and comparison intro reworded |
| MP-002 | **Implemented** | Absolute follow-up promises replaced in nine files |
| MP-003 | Deferred (owner) | Needs a launched client site and a real testimonial |
| MP-004 | Deferred (owner) | A live delivery test notifies the owner; not authorized in this task |
| MP-005 | Deferred (owner) | Prices are Mann's to cost and approve |
| MP-006 | **Implemented** | One name for the free check; new lead |
| MP-007 | **Implemented** | Catalogue wording aligned with the packages |
| MP-008 | **Implemented** | Emphasis on "Web design,"; headline text unchanged |
| MP-009 | **Implemented** | Compact phone sculpture, hint hidden on touch, responsive still |
| MP-010 | **Implemented** | The failing baseline test now passes with its target unchanged |
| MP-011 | **Implemented** | Portrait follows the introduction on phones |
| MP-012 | **Implemented** (wording); owner question open | "moved to Thunder Bay, Ontario" |
| MP-013 | Deferred (owner) | Search Console and enquiry log |
| MP-014 | Deferred (owner) | Business Profile eligibility decision |
| MP-015 | Deferred (owner) | Samp launch |
| MP-016 | **Implemented** | About description, Contact title, two case-study descriptions |
| MP-017 | **Implemented** | Audience wording; approved service-area line in the FAQ and About lead |
| MP-018 | Deferred (owner) | Cloudflare redirect rule for `www` |
| MP-019 | Deferred (owner) | HSTS is hard to undo; owner's call in Cloudflare |
| MP-020 | Not applicable | Deliberate keep (FAQ markup) |
| MP-021 | Deferred (owner, optional) | Cloudflare bot script |
| MP-022 | Deferred (experiment) | Group titles aligned now; larger restructure waits for data |
| MP-023 | Deferred (experiment) | Hero buttons unchanged; decision rule recorded |
| MP-024 | Blocked (owner fact) | No reply time is published |
| MP-025 | Not applicable | Optional owner asset |
| MP-026 | Deferred (owner approval) | Draft guide not published |

Nothing in the audit was rejected.

## 3. What changed, and why it helps a customer

| Change | Customer benefit |
| --- | --- |
| "Quoted after your free check" → "Written quote after a short brief" on every price line; the comparison says "The free check is optional and separate." | A buyer ready to pay no longer thinks they must sit through a free audit first |
| "Never miss an enquiry" → "Enquiry follow-up and booking"; five other absolutes reworded | The site promises what one workflow can deliver, so the detail pages no longer undercut the headline claims |
| One name, "free website and Google check", from the hero button to the form heading; new lead that says what to send and what comes back | The button and its destination match, and the offer is concrete |
| "five to seven pages" → "up to five pages"; care wording matches the Website Care package | One page count; no implied extras |
| Lime emphasis on "Web design," | The loudest word is the service the site can actually prove |
| Phone hero: sculpture stage 301 px → 236 px tall at 390 px; "Move to rotate" hidden on touch | Work starts 65 px sooner on a phone; no instruction that cannot be followed |
| Sculpture still: 480 and 640 px versions with `fetchpriority="high"` | A phone downloads 17 to 29 KB instead of 51 KB for the largest element |
| Desktop hero spacing: work heading at y = 1,138 instead of 1,238 (1440 × 1000) | Real work is visible sooner; the contact buttons now fit in a 900 px tall window |
| About on phones: portrait at about 625 px instead of 930 px | A visitor checking who Mann is sees him on the first screen |
| "moved back to Thunder Bay" → "moved to Thunder Bay, Ontario" | The story no longer refers to a place it never introduced |
| Shorter About and case-study descriptions; "Contact Mann Patel \| Web Design & Local SEO in Toronto" | Descriptions show whole in results; the Contact page says what it is |

Final wording: `Mann_Patel_Approved_Copy_Deck.md`. Six strings were shortened during implementation so the services page stayed inside the project's existing phone length budget and the hero strip did not wrap onto an extra line; the copy deck holds the shipped versions.

Files changed: 21 source files, 3 test files, `README.md`, `docs/OWNER-INPUTS.md`, and this folder.

## 4. Checks run

Environment: cloud container, Node 22, Playwright Chromium (headless, device emulation; not Safari, not a physical phone), local build of the branch.

| Check | Result |
| --- | --- |
| `npm run check` | 0 errors, 0 warnings |
| `npm test` | 72 of 72 |
| `npm run build` then `npx playwright test --trace off` | **125 of 125.** Baseline on `fd1a563` was 118 pass, 1 fail. The failing test (`selected work starts by y=1150 at 1440x1000`) passes with its target unchanged. Six tests were added; four copy assertions were updated; none was deleted or loosened |
| `npm run build:cloudflare` | Builds; pre-launch check 0 errors, 2 expected warnings (`ENQUIRY_TO_EMAIL` is a dashboard secret a build cannot see; `FORM_TOKEN_SECRET` unset) |
| Production HTML | Titles, descriptions, one H1 each, self-canonicals and `index, follow` confirmed on 8 pages; `/pricing/` still `noindex, nofollow` |
| Banned-phrase scan of every built page | None of the seven replaced phrases remains |
| Layout | No horizontal overflow on home, About, services, enquiry follow-up and contact at 320 × 568, 390 × 844, 844 × 390 and 1440 × 900 |
| axe-core (WCAG 2.0 to 2.2 A and AA, best practice) | 0 violations on those five pages at 390 and 1440 |
| Console | 0 errors on those pages |
| Reduced motion | 0 running animations; still image shown |
| Keyboard | Skip link, header, then both hero buttons in order |
| Preselection | `/contact/?package=check-up#check` opens the check with the new heading (covered by a new test) |

### Performance, measured under matching conditions

Lighthouse 13.6.0, mobile, simulated throttling, five runs each, medians. Both builds served as static files from the same local server (no compression), so the figures compare the two builds with each other and are not comparable with the production figures in the audit report.

| Page | Build | Performance | LCP | TBT | Transfer |
| --- | --- | ---: | ---: | ---: | ---: |
| `/` | Before (`fd1a563`) | 90 (84 to 93) | 2.93 s | 244 ms | 385 KB |
| `/` | After | 94 (93 to 95) | 2.84 s | 91 ms | 364 KB |
| `/about/` | Before | 100 | 1.10 s | 17 ms | 196 KB |
| `/about/` | After | 99 | 1.95 s | 61 ms | 196 KB |

**A cost to note.** On phones the About page's largest element is now the portrait instead of the heading text, so its lab LCP is later (1.95 s against 1.10 s on this local server). That is the direct price of showing the face first. It remains inside the 2.5 s "good" threshold in the lab. Field data is not available for either build.

## 5. Not verified

- Inbox delivery of the live forms (MP-004). The endpoint reports connected; nothing was submitted to production.
- Real-user Core Web Vitals. Lab figures only.
- Search Console indexing and queries.
- Any AI assistant's answers about the site.
- Safari, real devices and screen readers.
- The branch on Cloudflare. No preview deployment was inspected.

## 6. Owner decisions outstanding

Listed in `docs/OWNER-INPUTS.md` under "From the 11 Nov 2026 audit": delivery test, Samp launch and testimonial, prices, Search Console and enquiry log, four questions (Thunder Bay, reply time, in-person client contact, publishable experience), Cloudflare `www` redirect and HSTS, and the free-check experiment.

## 7. Deployment and rollback

Not deployed. To publish: merge the branch into the production branch; Cloudflare builds with `npm run build:cloudflare` and deploys. Then check the public site, `/api/enquiry/` readiness and one live delivery test.

Rollback reference: production commit before this work is `fd1a563`. Reverting commit `c8d1bc4` restores every source file to that state.

No new score is claimed. The revised site should be inspected once it is live.
