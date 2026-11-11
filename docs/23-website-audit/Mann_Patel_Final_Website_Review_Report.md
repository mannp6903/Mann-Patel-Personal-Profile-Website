# Mann Patel: final website review report

Site reviewed: https://mannpatel.me/ (production). Evidence gathered 10 Nov 2026, 20:34 EST to 11 Nov 2026, 14:15 EST (America/Toronto). Canadian English throughout.

Companion files in this folder: `Mann_Patel_Prioritized_Improvements.csv` (issue register), `Mann_Patel_Approved_Copy_Deck.md` (final wording), `Mann_Patel_Final_Claude_Code_Implementation_Prompt.md` (handoff).

Evidence labels used below: **Observed** (seen directly), **Measured** (a named test), **Inference**, **Hypothesis**, **Not verified**.

---

## 1. Executive judgment

The site is usable now and is better built than most of the local competition it was compared with. It loads fast in the lab, has no automated accessibility violations, every page and journey I tested works, and its copy is unusually honest about limits. Nothing found qualifies as a critical failure (no P0).

It does not yet give a skeptical owner enough reason to pay. The three weaknesses that matter commercially are:

1. **Proof.** There is no third-party proof of any kind: no review, no testimonial, no finished client site. The two projects are Mann's own unopened business and a client preview that the site itself says has 31 open contrast issues. Five of six comparison sites show reviews or testimonials.
2. **Price.** Every price line reads "Quoted after your free check". That makes paid work look gated behind a free audit, contradicts the FAQ and the contact form (neither requires the check), and leaves a buyer with no number at all, while four of six comparison sites publish starting prices.
3. **Promises that outrun the package.** "Never miss an enquiry" and "Every call, form and message gets a quick, honest reply" sit beside a package limited to one workflow and one booking integration.

Items 2 and 3 are wording and are fixed in the implementation that follows this audit. Item 1 cannot be fixed in code; it needs one finished, launched client site and one real testimonial.

**Overall assessed score: 70 / 100** (coverage 100 of 100 weight; five categories provisional, see section 3). This is an editorial judgment from the criteria below, not a Google score or a measured commercial result.

---

## 2. Evidence date, scope, coverage and limitations

### Evidence log

| Item | Detail |
| --- | --- |
| Audit time zone | America/Toronto (EST, UTC−5) |
| Sitting 1 | 10 Nov 2026, 20:34 to 20:50 EST: status codes, headers, page text, screenshots |
| Sitting 2 | 11 Nov 2026, 13:30 to 14:15 EST: accessibility, interaction, forms, Lighthouse, external research |
| Environment | Production, https://mannpatel.me. No preview was used for findings about the live site |
| Repository | `mannp6903/Mann-Patel-Personal-Profile-Website`, commit `fd1a563` (PR #23 merge) |
| Production commit | **Measured:** a production build of `fd1a563` (`npm run build:cloudflare`) is byte-identical to the live `/about/` HTML apart from one script Cloudflare injects at the edge; four other pages differ by the same 1,114 bytes. Production is `fd1a563` |
| Stack | Astro 7.4, TypeScript, Cloudflare Workers (`mann-patel-website`), Cloudflare Email binding `ENQUIRY_EMAIL` |
| Browser | Playwright Chromium, headless, device emulation at DPR 1. **Not** Safari, not a physical phone |
| Tools | curl, Playwright, axe-core (`@axe-core/playwright`), Lighthouse 13.6.0, the repository's own Vitest and Playwright suites, Firecrawl (third-party page fetch and web search for external sites and official documentation) |

### What could not be checked

| Not verified | Why | Consequence |
| --- | --- | --- |
| Search Console (indexing report, queries, sitemap processing) | No account access | Indexing and real search performance are unverified. Public `site:` results are a limited observation only |
| Analytics and enquiry outcomes | No account access; GA4 is not configured on the site | No traffic, conversion or lead data exists in this report |
| Real-user Core Web Vitals (CrUX) | PageSpeed Insights API returned 429 (shared quota exhausted) | All performance figures are lab figures |
| Inbox delivery of the live forms | Sending a live submission would notify the owner; not authorized | Only "the endpoint reports connected" is established (section 10) |
| HTTP to HTTPS redirect | The sandbox proxy carries HTTPS only | Unverified; no HSTS header was observed |
| AI assistant answers (ChatGPT, Gemini, Perplexity, Copilot) | No access to those products | Observed AI visibility is unverified |
| Safari, iOS, Android hardware, screen readers | Not available | Emulation only; manual assistive-technology testing is open |
| LinkedIn and GitHub profile content | Blocked by the sandbox network policy | Link targets were observed in the HTML, not opened |

### Page inventory

All 12 sitemap URLs return 200, are self-canonical, `index, follow`, `lang="en-CA"`, with one H1 each (**Observed**, 10 Nov 2026).

| URL | Purpose and intended visitor | Title | H1 | Primary action | Status |
| --- | --- | --- | --- | --- | --- |
| `/` | First impression; owners arriving from referral or brand search | Mann Patel \| Web Design, Local SEO & Automation in Toronto | Web design, local SEO and automation for Toronto businesses. | Free check | Reviewed in depth |
| `/about/` | Referral visitors checking the person | About Mann Patel \| Website Designer in Toronto | I'm Mann Patel. I build websites and enquiry follow-up for Toronto service businesses. | Contact chips | Reviewed in depth |
| `/services/` | Comparison of services and packages | Website, Local SEO & Booking Services \| Mann Patel | Website, local SEO and enquiry services | Request a quote | Reviewed |
| `/services/web-design/` | Search landing: small-business web design | Toronto Small Business Web Design \| Mann Patel | Web design for Toronto small businesses | Request a quote | Reviewed as landing page |
| `/services/local-visibility/` | Search landing: local SEO and Business Profile | Local SEO & Google Business Profile Setup in Toronto \| Mann Patel | Local SEO and Google Business Profile setup in Toronto | Request a quote | Reviewed as landing page |
| `/services/enquiry-follow-up/` | Search landing: enquiry automation and booking | Enquiry Automation & Online Booking in Toronto \| Mann Patel | Enquiry follow-up and online booking for Toronto businesses | Request a quote | Reviewed as landing page |
| `/work/` | Proof index | Toronto Small Business Website Projects \| Mann Patel | Website projects for Toronto service businesses | Read the case study | Reviewed |
| `/work/nest-and-rest-cleaning/` | Case study (own business) | Nest & Rest Cleaning Website Case Study \| Mann Patel | Nest & Rest Cleaning | Visit site | Reviewed |
| `/work/samp-hair-spa/` | Case study (client, in progress) | Samp Hair & Spa Website Preview \| Mann Patel | Samp Hair & Spa | See preview | Reviewed |
| `/contact/` | Project brief, free check, direct contact | Contact \| Mann Patel | Tell me about your business. | Send brief | Reviewed; forms exercised without submitting |
| `/privacy/` | Legal | Privacy Policy \| Mann Patel | Privacy Policy | n/a | Reviewed for disclosures |
| `/terms/` | Legal | Terms of Use \| Mann Patel | Terms of Use | n/a | Skimmed |
| `/pricing/` | Unpublished pricing page | Pricing: … \| Mann Patel | What it costs, and what it covers. | Request the free check | 200, `noindex, nofollow`, not linked, not in sitemap. **Intentional** (prices not approved) |
| `/contact/received/` | Confirmation | n/a | Thanks, your brief is on its way. | See my work | 200, `noindex`. Correct |
| unknown path | Real 404 | Page not found \| Mann Patel | This page wasn't found. | Home | Real 404 status, `noindex`. Correct |

Other routes: `/robots.txt` (allows all, disallows `/api/`, lists the sitemap), `/sitemap.xml` and `/sitemap-index.xml` (12 URLs), `/api/enquiry/` (readiness JSON). Paths without a trailing slash answer 301 to the slashed address.

---

## 3. Weighted scorecard

Anchors: 0 unusable or absent; 3 major problems; 5 usable with material gaps; 7 strong with clear improvements; 9 thoroughly verified, minor issues; 10 all criteria evidenced.

| Category | Weight | Score /10 | Weighted | Confidence | Status |
| --- | ---: | ---: | ---: | --- | --- |
| Positioning, audience and offer clarity | 10 | 7 | 7.0 | High | Assessed |
| Copy, section purpose and content architecture | 8 | 7 | 5.6 | High | Assessed |
| Visual design, hierarchy and brand fit | 8 | 8 | 6.4 | Medium (emulation, one reviewer) | Assessed |
| Mobile UX and navigation | 8 | 8 | 6.4 | Medium (emulation only) | Assessed |
| Trust, founder presentation and project proof | 12 | 5 | 6.0 | High | Assessed |
| Functionality and conversion journeys | 12 | 8 | 9.6 | Medium | **Provisional:** inbox delivery unverified |
| Technical SEO | 12 | 8 | 9.6 | Medium | **Provisional:** no Search Console |
| Content SEO, local relevance and internal linking | 8 | 6 | 4.8 | Medium | Assessed |
| AEO/GEO and answer usefulness | 6 | 7 | 4.2 | Medium | Readiness only; visibility unverified |
| Performance | 5 | 8 | 4.0 | Medium | **Provisional:** lab only, no field data |
| Accessibility | 5 | 8 | 4.0 | Medium | **Provisional:** automated plus keyboard; no screen reader |
| Measurement and acquisition readiness | 6 | 4 | 2.4 | Medium | **Provisional:** accounts not inspected |
| **Total** | **100** | | **70.0** | | Coverage 100 / 100 |

Formula: 100 × Σ(weight × score ÷ 10) ÷ Σ(assessed weights) = 100 × 70.0 ÷ 100 = **70.0**.

### Criteria, evidence and open checks

| Category | Criteria used | Evidence and rationale | Unresolved |
| --- | --- | --- | --- |
| Positioning | Who, what, where, deliverable and next step clear within one screen; identity consistent; offer hierarchy clear | H1, lead, service-area line and CTA all sit above the fold at 320 to 1440 px. Marked down for: "website designer" label beside a three-service headline with the emphasis on "and automation"; three names for the free check; price lines that gate paid work behind it | None |
| Copy | Plain language, accuracy, consistency, no repetition, complete states | Plain, specific, honest exclusions throughout. Marked down for five absolute follow-up promises, one sentence fragment, one page-count contradiction, long pages | None |
| Visual | Hierarchy, legibility, coherence, fit to audience | Distinctive, consistent dark and lime system; strong type; real screenshots. Emphasis lands on the vaguest word; decorative sculpture is the largest element on phones | Subjective; no user test |
| Mobile | No overflow, reachable navigation, target sizes, short and landscape screens | No horizontal overflow on 12 pages × 7 viewports; drawer is a modal dialog with 44 px+ targets, Escape, outside tap, focus return. Marked down for page length (home 10,588 px, services 12,369 px at 390 px) and About portrait below the first screen | Real devices |
| Trust | Real person, verifiable claims, third-party proof, honest status | Real portrait, dated test evidence, honest labels (credit). No review, testimonial or finished client project (major gap) | Owner evidence |
| Functionality | Journeys complete, forms validate, honest states, delivery proven | All six journeys work; validation, error summary, preselection and fallback verified; local suite passes form paths | Server acceptance and inbox receipt on production |
| Technical SEO | Status codes, canonicals, robots, sitemap, titles, structured data, redirects | All correct. Minor: `www` returns 200 instead of redirecting, long descriptions, no HSTS | Search Console |
| Content SEO | Intent mapped to pages, supporting content, local evidence, internal links | Three focused service pages with internal links and breadcrumbs. No supporting guides, no Business Profile, thin local proof | Query data |
| AEO/GEO | Crawlable answers, entity consistency, crawler access, sources | Answers are in the HTML, entity data is consistent, no crawler is blocked, sources are cited on the local SEO page | Any observed AI answer |
| Performance | Lab LCP, CLS, TBT; asset weight; idle CPU | Lab medians: performance 91 to 99, CLS 0, LCP 0.9 to 1.5 s. Home TBT 378 ms and an oversized decorative LCP image | Field data |
| Accessibility | axe, keyboard, focus, dialogs, reduced motion, no-JS, reflow | 0 axe violations on 28 scans; keyboard, focus, dialogs, reduced motion and no-JS all pass | Screen readers, manual contrast review of axe "incomplete" items |
| Measurement | Search Console, analytics, conversion events, lead log, acquisition assets | Cloudflare Web Analytics page views only; GA4 off; no evidence of Search Console; no Business Profile or reviews | Account inspection |

Serious verified weaknesses stay visible regardless of the average: **no third-party proof** and **no price signal**.

---

## 4. Page ratings (editorial)

| Page | Rating /10 | Rationale |
| --- | ---: | --- |
| Home | 7.5 | Clear offer and action on the first screen, real work second. Loses marks for the price lines, the absolute promises, the free-check fragment and its length on phones |
| About | 6.5 | Useful "at a glance" block and honest house rules. On phones the first screen has no face; the story is long, contains one ambiguous move ("moved back to Thunder Bay") and never connects to relevant capability |
| Services (overview and three service pages) | 7.5 | The three service pages are the best pages on the site: fit, not-a-fit, steps, evidence, limits, third-party costs, handover. The overview is dense and names the same things three ways |
| Work and case studies | 6.0 | Honest and dated, with real test tables. But one project is the owner's own unopened business and the other is unfinished |
| Contact | 8.5 | Two clear paths, good validation, honest wording, direct channels, privacy note. Lacks a reply-time expectation |

---

## 5. First-impression journeys (heuristic, no real users took part)

| Visitor | Understands in the first seconds | Hesitates at | Proof needed | Next action |
| --- | --- | --- | --- | --- |
| Busy service-business owner on a phone | Websites, local SEO and automation, in Toronto, from one person; a free check is offered | "Automation" in lime is the loudest word and the least concrete; a large abstract shape follows the buttons; no price anywhere | One finished site like theirs; a price range | Taps the free check, or scrolls to the work |
| Skeptical owner comparing with a local agency | A careful solo provider with unusually clear limits | No reviews, no client logos, no finished client project; "Quoted after your free check" reads as "no price until you sit through an audit"; overnight job and personal history on About may raise capacity doubts | Third-party review, launched client site, reply time, price | Leaves to compare, or emails a direct question |
| Referral visitor checking the person | A real person with a real photo and a consistent story | On a phone the About page opens with a wall of text before the face; the story's Thunder Bay step is confusing | The face early, one line on relevant capability, LinkedIn | Contact chips or WhatsApp |

---

## 6. Positioning, offer and commercial fit

**What is clear (Observed).** Who is served (owner-run service businesses), what is done (websites, local visibility, enquiry follow-up), where (Toronto and the GTA, focus on Scarborough and North York), how to start (brief or free check), and what is kept (accounts in the client's name).

**Identity fit.** The eyebrow says "Independent website designer"; the headline lists three services and paints "and automation" lime. Both projects on the site are websites. The emphasis therefore lands on the service with the least evidence and the most exclusions (custom CRM, client portal and chatbot are all excluded on the enquiry page). The approved headline is kept; the emphasis moves to "Web design," (MP-008).

**Services order.** The home lists Local SEO, Enquiry follow-up, Web design (A, B, C, following a customer's path). The services overview lists Web design first. Proof and the "website designer" label both support leading with web design. Kept as is for now, because the A/B/C order explains the logic; noted for the experiment in MP-022.

**Boundaries.** Revision limits (two rounds), handover, ownership, third-party costs, timeline dependencies and exclusions are stated on every package. This is the strongest part of the offer and should be kept unchanged.

**Pricing presentation.** "Quoted after your free check" appears on every price line (**Observed**: home × 3, services × 9, each service page, the unpublished pricing page). The FAQ says "a written quote after a short brief" and the brief form does not require the check. The label is inaccurate and adds friction. It becomes "Written quote after a short brief" (MP-001).

**Published prices.** Not on the site, by the owner's decision (prices not yet costed). Comparable published starting prices observed on 11 Nov 2026: CAD $890 (5 to 7 pages), $999+, $3,000 (up to 5 pages, one year of hosting); one US reference at USD $3,800 or $175 a month. **Proposal, not a recommendation of a figure:** publish a "from" price for Website Launch and Website Care once Mann has costed them (hours × rate + expenses + margin). Setting `price.amount` in `src/data/packages.ts` updates every card, table and the pricing page. Mann must confirm the figures and tax treatment (MP-005).

**Free check.** A sound door-opener for a provider with no reviews, and a source of before-and-after proof. It is currently unbounded (no area, no cap) and labour-heavy (four checks including an after-hours call). It stays, with a bounded description; whether it should remain the hero's primary button is an experiment with a decision rule (MP-023).

### Possible new services

| Idea | Status today | Judgment |
| --- | --- | --- |
| AI-search support (AEO/GEO) | Already inside Local Visibility Setup as a dated check | Keep bounded. Do not sell as a product: Google's own guide says to "ignore tactics like 'chunking' content, creating unnecessary AI text files (like llms.txt), or pursuing inauthentic mentions" |
| Chatbots | Explicitly excluded | Keep excluded. Validate on Nest & Rest first (its assistant is built but off) |
| Custom CRM or automation platforms | Excluded; spreadsheet or the client's existing tool is in scope | Keep. "Automation" in the headline is accurate for replies, reminders and text-back; the copy must not imply more |
| Branding and logos | Excluded, with referral | Keep excluded |
| Social media management | Excluded (posting and replies); a bounded content sprint exists as an add-on | Keep as add-on only. Promoting it would dilute the positioning |
| Blogs, scripts and hooks | Inside the sprint or quoted separately | Keep as add-on |
| A guide for owners | A draft exists in `docs/drafts/` | Worth testing as content for the site itself (MP-026), not as a service |

Recommended hierarchy: **1. Websites (lead, with proof). 2. Local visibility. 3. Enquiry follow-up and booking. Then care. Print and social stay add-ons.**

---

## 7. Section-by-section review

Decision labels: Keep / Refine / Move / Merge / Remove / Add / Test first.

### Home (`/`)

| Section | Job | What works | What is off, and the consequence | Decision and exact change |
| --- | --- | --- | --- | --- |
| Header | Navigation, one action | Three links, one button, 44 px menu button; phone shows "Contact" | Nothing material | **Keep** |
| Hero headline and lead | Say what, for whom | Names the services and the place; lead states an outcome in plain words | Lime emphasis on "and automation" | **Refine:** move the lime line to "Web design," (MP-008). Headline words unchanged |
| Hero actions and location line | First useful action | Both buttons and the approved service-area line fit above the fold at 320 px | Two primary actions compete across the page (hero: free check; header: Start a project) | **Test first** (MP-023). No change now |
| Status label "Taking new projects" | Availability | True to a solo provider | Hidden on phones; depends on real capacity | **Keep.** Owner to switch off when full |
| Signal sculpture | Brand moment | Original, pauses off screen, stops under reduced motion, still fallback | On phones it takes about 330 px between the buttons and anything useful; its caption says "Move to rotate", which means nothing on touch; it is the LCP element and its poster is served at 960 × 810 for a 378 × 319 box | **Refine** (MP-009): smaller on phones, hide the hint on touch, responsive poster with a priority hint |
| Found / Answered / Booked strip | Explain the three services in plain words | Good plain-language bridge from the headline | "so each one gets a reply" is an absolute | **Refine** wording (MP-002) |
| Selected work | Proof | Real screenshots, honest status chips, problem and role stated, dated | Starts at y = 1,238 at 1440 × 1000 against the project's own 1,150 target (a failing test on production code) | **Refine** spacing (MP-010) |
| Enquiry demonstration | Show what follow-up means | Clearly labelled "Demonstration · fictional data"; keyboard operable | None | **Keep** |
| Services summary | Route to the three service pages | One sentence each, package named, link to detail | "Quoted after your free check" × 3; "Every call, form and message gets a quick, honest reply"; "kept working every month" implies care is included | **Refine** (MP-001, MP-002, MP-007) |
| Free check | Low-commitment offer | Four concrete steps, "not included" stated | Lead sentence is a fragment that repeats the heading; the offer has three names across the site | **Refine** (MP-006) |
| Founder teaser and portrait dial | Show the person | Photo starts clear; dial is optional; works without JavaScript | Two links to About within one screen ("More about me", "Who is this guy?"). Preference only | **Keep** |
| How a project runs; what you can count on | Reduce risk | Five steps, four promises, all specific | Repeats the services page process | **Keep** (short form here, full form on services) |
| FAQ (four questions) | Answer price, ownership, rankings | Honest answers | Price answer names the check by its old name | **Refine** wording (MP-006) |
| Closing CTA and footer | Final action, contact | Two buttons, four direct channels, masked phone | None | **Keep** |

### About (`/about/`)

| Section | What works | What is off | Decision |
| --- | --- | --- | --- |
| Header (H1, lead, links, chips, portrait) | Clear statement; real portrait with caption | On phones the portrait sits about 930 px down, after the lead, two links and six chips; lead says "answers every enquiry" | **Move** the portrait above the links on phones (MP-011); **Refine** lead (MP-002) |
| At a glance | The most useful block on the page: deliverables, audience, checks, replies, ownership | Audience names cleaning, maintenance and trades; the only client project is a salon | **Refine** (MP-017) |
| Four house rules | Specific and credible | None | **Keep** |
| Where I'm going | States an aim honestly | None | **Keep** |
| My story (six steps) | Honest, human, memorable | "Next I moved back to Thunder Bay" has no earlier mention of Thunder Bay; no line connects the story to relevant capability; some details are very personal | **Refine** the one ambiguous sentence (MP-012). Everything else is the owner's choice; see section 9 |
| Nest & Rest block | Clear ownership statement | None | **Keep** |

### Service pages (as landing pages)

All three follow the same strong pattern: fit, not a fit, steps, evidence, package, limits, third-party costs, handover, questions, sources. A search visitor can understand the service, the boundary and the next step without visiting another page (**Observed**).

| Page | Issue | Decision |
| --- | --- | --- |
| All three | Price line "…: Quoted after your free check" under the buttons | **Refine** (MP-001) |
| Web design | Fit list omits salons, the one client sector shown | **Refine** (MP-017) |
| Enquiry follow-up | "the workflow makes sure none are missed or forgotten" | **Refine** (MP-002) |
| Enquiry follow-up | The only package is "Website + Enquiry System", which includes a new website; an owner with a working site must read the FAQ to learn the workflow can be quoted alone | **Keep** for now; the FAQ answers it. Noted under MP-022 |
| Local visibility | Cites Google for ranking factors and eligibility; AI check is bounded and dated | **Keep** |

### Services overview (`/services/`)

Twelve thousand pixels on a phone, with three overlapping schemes: three services, four packages, and an A/B/C catalogue of thirteen services whose section titles differ from the service names. **Refine** the titles and fix the contradictions now (MP-002, MP-007); treat a larger restructure as an experiment (MP-022).

### Work and case studies

Honest and well evidenced. **Keep** the structure. The proof gap is not a page problem; it is an owner task (MP-003, MP-015).

### Contact

**Keep.** One addition needs an owner fact: a reply-time expectation (MP-024).

### Hero alternatives considered

| Option | Headline | Judgment |
| --- | --- | --- |
| A (selected) | "Web design, local SEO and automation for Toronto businesses." with the lime line on "Web design," | Keeps the approved wording; emphasis matches the proof and the "website designer" label |
| B | Same, lime on "and automation" (current) | Emphasis on the least evidenced service |
| C | "Websites that help Toronto customers find you, trust you and get in touch." | More outcome-led, but drops the service names that the approved headline and the page title carry |

Selected: **A**. Line breaks unchanged: "Web design," / "local SEO" / "and automation" / "for Toronto businesses."

---

## 8. Copy and claims analysis

| Phrase (location) | Finding | Verdict |
| --- | --- | --- |
| "Never miss an enquiry" (services group title; contact form option) | A promise no workflow can keep; the package covers one workflow | **Overstated.** Replace |
| "Every call, form and message gets a quick, honest reply" (home, services) | Depends on which channels are set up; the package covers one | **Overstated.** Make conditional |
| "follow-up so each one gets a reply" (hero step 2) | Same | **Overstated.** Replace |
| "follow-up that answers every enquiry" (About lead); "answer every enquiry" (About, "Why I do this") | Same | **Overstated.** Replace |
| "the workflow makes sure none are missed or forgotten" (enquiry page, Limits) | Stated in a section about limits | **Overstated.** Replace |
| "tested end to end" (packages, hero, About) | Evidenced on this site's own form paths by the test suite and on Nest & Rest by dated checks; conditional on the client permitting a test enquiry | **Evidenced and conditional.** Keep, with "before launch" |
| "I read and answer every enquiry myself" (About, contact) | A statement about Mann's own practice | **Owner's commitment.** Keep; owner to confirm a reply time |
| Booking claims ("A booking request is not a booking") | Carefully hedged | **Evidenced.** Keep |
| "Quoted after your free check" (all price lines) | Contradicts FAQ and form | **Inaccurate.** Replace |
| "build a new one of five to seven pages" (services overview) vs "Up to five pages" (package) | Direct contradiction | **Fix** |
| "kept working every month" (services group C) | Implies care is part of the website package | **Ambiguous.** Fix |
| "Owners who are not sure what to fix first. Free, with no obligation to buy anything." (free-check lead) | Sentence fragment repeating the heading | **Fix** |
| "Found & Answered check" vs "free website and Google check" vs "Free check" | Three names for one offer; the hero button and its destination do not match | **Unify** as "free website and Google check" |
| "Signal study · Move to rotate" | Decorative label; meaningless on touch | **Hide the hint on touch** |
| Voice | First person singular throughout; no agency "we"; Canadian spellings | **Keep** |

Final wording for every item is in the copy deck.

---

## 9. Founder photo, About page and trust

**Portrait (Observed from the source file and the live pages).** `src/assets/mann-patel-portrait.jpg`, 1060 × 1060. Face centred, fully visible, eyes open, natural smile; plain dark green sweatshirt; blurred street at dusk. Lighting is dim and cool, and the phone "portrait mode" edge is visible around the hair. It communicates an approachable, real person. It is not a studio headshot and does not need to be for this audience.

| Aspect | Home | About |
| --- | --- | --- |
| Crop and ratio | Inside the radio card, roughly 4:5, face clear of the overlay text | 4:5 on desktop (512 × 640), wide crop on phones |
| Loading | Lazy (below the fold) | Eager |
| Alt text | Accurate description | Same |
| Caption | "On air: Mann Patel, Toronto." | "Mann Patel · Toronto · 2026" |
| Placement | Beside the introduction | Desktop: beside the H1. Phone: after the lead, links and chips |

**Radio dial.** It starts clear, the dial is optional, it works by keyboard, and without JavaScript the plain photo shows. The clear portrait does not depend on discovering the control. **Decision: keep.** It is unusual, cheap, and the one playful moment that makes the site memorable.

**Presentation changes using the existing photo:** move the About portrait above the links on phones (MP-011). No crop change is needed.

**Optional new photograph (owner asset, MP-025):** daylight, plain background or a work setting, same framing. This is polish, not a blocker.

**About narrative.** Identity, deliverables, audience, checks and ownership are all established in "At a glance". The story is honest and should stay. Three points:

1. **Ambiguity (fix now).** "Next I moved back to Thunder Bay" follows Saint John and has no earlier mention of Thunder Bay. Suggested: "Next I moved to Thunder Bay, Ontario, with no job lined up." This removes the unexplained "back" without asserting anything new. **Owner question:** had you lived in Thunder Bay before Saint John?
2. **Owner's choice (not changed).** "I failed C++ three times", the depression, and "I lost the job after missing shifts while I was unwell" are published by Mann's decision. A skeptical owner hiring someone to keep enquiries working may read "missing shifts" as a reliability signal. An optional shorter wording is in the copy deck; it is not applied.
3. **Missing bridge (owner evidence).** Nothing in the story explains why Mann can do this work beyond having built one site. If there is relevant training or experience he is willing to publish (IT support work, coursework, certificates), one sentence would connect the story to the offer. Nothing has been invented.

### Claim and evidence matrix

| Claim | Evidence on the site | Status |
| --- | --- | --- |
| Built nestnrestcleaning.com from scratch | Live site (200 on 11 Nov 2026), dated screenshots and tests | **Supported.** Own business, not a client success; the site says so |
| Client website for Samp Hair & Spa | Lovable preview (200 on 11 Nov 2026); labelled "In progress" | **Supported as in progress.** Not a launch. 31 contrast issues and one ARIA issue stated as open |
| Enquiry paths tested end to end | Test tables on both case studies; this site's own suite | **Supported** for what was run; Samp's final step was not submitted, as stated |
| Accessibility checks | axe results published, including failures | **Supported**, and correctly described as automated |
| Results or outcomes | "None are claimed" | **Honest** |
| Experience with Business Profile, reviews, booking tools, text-back | No project shows these | **Unevidenced capability.** Offered, not yet demonstrated |
| "Taking new projects" | n/a | Owner to keep current |

**Proof that can actually be supplied:** a launched Samp site on its own domain with a re-run test table; a written testimonial with permission; a before-and-after local visibility snapshot from one real business (the free check produces exactly this); a redacted handover document; a redacted test log from a real enquiry workflow.

---

## 10. Functionality and conversion journeys

| Journey | Result (Observed, production, 11 Nov 2026) |
| --- | --- |
| Search visitor → service page → brief | "Request a quote" opens `/contact/?package=…#brief`; step 2 shows "Suggested starting point: Website + Enquiry System. Pre-filled from the link you followed." |
| Home → free check → form | `/contact/?package=check-up#check` opens the free-check panel with its tab marked current |
| Referral → About → work → contact | Links present and working; About links to services, work and contact |
| Phone → drawer → destination | Modal dialog; Home, Services, Work, About, Start a project, email, Privacy, Terms; current page marked; Escape and outside tap close it; focus returns to the menu button |
| Case study → offer → enquiry | Each case study links to its service pages and ends with the closing CTA |
| Returning visitor → email, call, WhatsApp, text | `mailto:`, `tel:`, `wa.me` and `sms:` links present; number shown masked with "Show number"; copy-email control present |

**Forms (exercised without sending).** Empty free check: four inline errors, `aria-invalid`, focus to the first field; a website or a business name is enough. Brief step 1 empty: focused error summary; bad email: inline error. Step 2: need, optional budget and timeframe. Step 3: message with a live character count, honeypot, privacy note. A project brief does **not** require the free check. The only non-GET request seen was Cloudflare's own challenge beacon on page load.

**Delivery evidence levels**

| Level | Evidence |
| --- | --- |
| (a) Endpoint reports connected | **Observed:** `GET /api/enquiry/` → `{"connected":true,…,"reason":"ready"}` |
| (b) Production server accepts a submission | **Not verified** (no live submission authorized). Locally, with the file adapter, the suite's accept, fail and fallback paths pass |
| (c) Inbox receives the message with the right Reply-To | **Not verified** |
| (d) Acknowledgement to the visitor | Not sent by design (`ENQUIRY_ACKNOWLEDGE=false`); the page says the brief was accepted and that replies come by email |

This is missing evidence, not a failure. The owner can close it in two minutes with the repository's own script (MP-004).

**Baseline tests on unchanged production code (Measured, 11 Nov 2026):** Vitest 72 of 72; Playwright 118 passed, **1 failed** ("selected work starts by y=1150 at 1440x1000", received 1,238). See MP-010.

**Passive security and privacy.** HTTPS; `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY` present; no secrets in the HTML; phone number stored encoded in the repository and masked on the page; the privacy policy names Cloudflare (hosting, email, Web Analytics) and Google (inbox). No HSTS header and no Content-Security-Policy (MP-019).

---

## 11. Technical SEO

| Check | Result |
| --- | --- |
| Status codes | 12 sitemap URLs 200; unknown path 404; no-slash paths 301 |
| Canonicals | Self-canonical on every indexable page; 404 page canonical `/404/`, `noindex` |
| `www` host | **Observed:** `https://www.mannpatel.me/` returns 200 with the apex canonical, not a redirect. Consolidated by canonical; a 301 is cleaner (MP-018) |
| robots.txt | Allows all agents, disallows `/api/`, lists `/sitemap.xml` |
| Sitemap | 12 URLs, matches the indexable set; no `lastmod` (optional) |
| Titles and H1 | Unique and descriptive. "Contact \| Mann Patel" is weak (MP-016) |
| Descriptions | About is 263 characters and two case studies run long; an editorial matter, not a ranking rule (MP-016) |
| Rendered vs source | Essential text is in the initial HTML; nothing depends on the canvas. A third-party scraper excerpt showed the H1 words joined ("design,local SEOand"); the raw HTML and the rendered page both contain the spaces. **Scraper artifact, not a defect** |
| Structured data | Valid JSON on every page: `WebSite` and `Person` (home), `ProfilePage` (About), `Service`, `BreadcrumbList`, `OfferCatalog`, `FAQPage`. No ratings, address or awards. Agrees with visible content |
| FAQ markup | Google's FAQ documentation URL now redirects to its changelog entry "Removing documentation for the FAQ rich result feature", after "Deprecating the FAQ rich result feature" earlier in 2026. The markup is valid and harmless but earns no Google rich result (MP-020) |
| Social cards | `og:` tags complete, 1200 × 630 images, per-case-study cards |
| Deployment | Production is the Cloudflare Worker build of `fd1a563`. A `CNAME` file remains from the earlier GitHub Pages setup; it does not affect production |
| Public search observation | A third-party search index returned all 12 URLs for `site:mannpatel.me`; several titles were the pre-10-Nov versions (index lag). This is not Google's indexing report |

---

## 12. Content SEO, local relevance and reach

| Intent | Page | Fit |
| --- | --- | --- |
| Small-business web design or redesign, Toronto | `/services/web-design/` | Good |
| Local SEO, Business Profile help | `/services/local-visibility/` | Good; correctly limited to eligible businesses |
| Enquiry automation, missed-call text-back, online booking | `/services/enquiry-follow-up/` | Good |
| Website care | Section on the web design page | Adequate; no page needed yet |
| Free website check | Section on home and services; contact tab | Adequate |
| "Who is Mann Patel" | `/about/`, home | Good |

No cannibalization was seen: each service page has its own title, H1 and vocabulary.

**Organic vs Maps.** The site can compete for organic results over time. Maps visibility needs a Google Business Profile. Google's guidelines allow a profile where the business "travels to customers where they are"; a service-area business must hide its address and use its real name. **Owner must confirm** he meets clients in person before creating one (MP-014). Nothing was created in this audit.

**Location pages.** Not recommended. With one in-progress client in Scarborough there is no distinct local proof to put on a Scarborough or North York page, and name-substituted pages are what Google's spam policies call doorway pages. Revisit when there are two or more finished projects in one district.

**Content opportunities (qualitative; no keyword tool was available, so no volumes are given)**

| Opportunity | Intent and audience | Evidence | URL | Unique angle and proof | Effort |
| --- | --- | --- | --- | --- | --- |
| Toronto small-business website checklist | Owners asking what a small site needs | A draft already exists in `docs/drafts/`; the question is the free check's premise | `/guides/small-business-website-checklist/` (proposed) | The same checks used on the case studies, with the dated results as examples | Medium; owner review |
| "Am I eligible for a Google Business Profile?" for home-based and mobile businesses | Cleaners, trades, mobile services | The site already answers it in an FAQ and cites Google | Section or guide linked from local visibility | Plain-language walk-through citing the guideline | Small |
| Samp Hair & Spa launch write-up | Proof for salon and personal-care owners | Needs the launch | Existing case study | Before and after, with the test table re-run | Small after launch |

---

## 13. AEO, GEO and answer usefulness

Terms, once: **AEO** (answer engine optimization) and **GEO** (generative engine optimization) both mean making it easy for AI answers to find accurate public facts about a business.

**Technical and content readiness: good (Observed).**

- Who, what, where and how to contact are stated in plain sentences in the HTML and repeated consistently in `Person`, `WebSite` and `Service` data, with `sameAs` links to LinkedIn and GitHub.
- No crawler is blocked. robots.txt has one rule set for all agents. Single requests using the user-agent strings of Googlebot, bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot and ClaudeBot all returned 200 (from a non-official IP, so this shows only that no user-agent rule blocks them).
- Buyer questions are answered on the page (price, ownership, rankings, eligibility, booking requests, AI tools), and the local SEO page links its sources.

**Current official guidance.**

- Google, "AI features and your website" (updated 10 Dec 2025): "While specific optimization isn't required for AI Overviews and AI Mode, all existing SEO fundamentals continue to be worthwhile"; to be a supporting link "a page must be indexed and eligible to be shown in Google Search with a snippet… There are no additional technical requirements."
- Google, "Optimizing your website for generative AI features on Google Search" (announced 15 May 2026): "you can ignore tactics like 'chunking' content, creating unnecessary AI text files (like llms.txt), or pursuing inauthentic mentions." It also says Business Profiles "can help your products and services to be visible in both AI responses and other Google Search results", and points to a "Generative AI performance report" in Search Console.
- OpenAI: OAI-SearchBot controls inclusion in ChatGPT search; GPTBot is for training; ChatGPT-User is a user-triggered fetch.

**Decisions.** No `llms.txt`. No change to robots.txt (allowing all agents is the right default for a business that wants to be found; a training opt-out via `GPTBot` or `Google-Extended` is an owner choice with no effect on search visibility). Keep the visible FAQs for readers; do not present FAQ schema as a search feature.

**Observed AI visibility: not verified.** No assistant was available to query. A small repeatable test set for the owner is in section 16.

**Measured referral traffic: not verified.** No analytics access. Whether the Search Console property shows the Generative AI performance report must be checked in the account.

---

## 14. Performance and accessibility

### Performance (lab only)

Lighthouse 13.6.0, mobile form factor, simulated throttling, headless Chrome 153, run from a cloud data centre against production, 11 Nov 2026 about 13:35 EST. Three runs per page; medians.

| Page | Performance | LCP | FCP | CLS | TBT | Transfer | Requests |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 91 (89, 91, 91) | 1.53 s | 0.94 s | 0 | 378 ms | 257 KB | 21 |
| `/services/` | 93 | 0.97 s | 0.97 s | 0 | 311 ms | 110 KB | 15 |
| `/services/web-design/` | 96 | 0.92 s | 0.92 s | 0 | 232 ms | 94 KB | 13 |
| `/about/` | 99 | 0.94 s | 0.94 s | 0 | 123 ms | 128 KB | 14 |
| `/contact/` | 97 | 0.99 s | 0.99 s | 0 | 183 ms | 108 KB | 19 |
| `/work/nest-and-rest-cleaning/` | 99 | 1.23 s | 0.99 s | 0 | 133 ms | 197 KB | 19 |

Accessibility 100 and SEO 100 on all six. Best Practices 77 on all six, for two reasons that are not repository defects: a console error because this sandbox blocks Cloudflare's analytics beacon, and a deprecation warning from a script Cloudflare injects (`/cdn-cgi/challenge-platform/…/jsd/main.js`, about 425 ms of scripting in the lab; MP-021).

Findings: the home page's LCP element on phones is the decorative sculpture poster, 51 KB at 960 × 810 for a 378 × 319 box, with no priority hint (MP-009). Fonts are self-hosted and preloaded; CSS is inline; nothing is render-blocking.

Animation cost (**Measured**): about 115 animation frames per 2 s with the hero in view, **zero** when it is off screen, and **zero** frames and zero running animations under reduced motion.

**Field data: not verified.** TBT is a lab stand-in and does not equal INP. A high lab score does not prove real-user Core Web Vitals pass, and a site this new is unlikely to have enough Chrome traffic for a field report (inference).

### Accessibility

Target: WCAG 2.2 AA. An automated scan cannot establish conformance.

| Check | Result (production, 11 Nov 2026) |
| --- | --- |
| axe-core, WCAG 2.0 to 2.2 A and AA plus best-practice rules | 14 URLs × 2 widths (390, 1440): **0 violations**. One or two "incomplete" items per page need manual review (likely text over gradients) |
| Keyboard | Skip link first; 2 px lime focus outline on every stop; logical order |
| Dialogs | Quick menu (Ctrl+K) and phone drawer are native modal dialogs; focus moves in, Escape closes, focus returns |
| Target size | Menu button 44 × 44; drawer links 71 px tall. WCAG 2.2 requires 24 × 24 CSS px at AA (2.5.8); 44 px is the stricter AAA and platform guideline |
| Reduced motion | Honoured |
| No JavaScript | H1, content, navigation and both forms are present and usable |
| Reflow | No horizontal scroll at 320 px; the suite's 200% text test passes locally |
| Not tested | Screen readers, voice control, real zoom on a device |

---

## 15. Competitors and references

Selected from two searches run on 11 Nov 2026 with a Toronto location context: "freelance web designer Toronto small business websites local SEO" and "Scarborough web design small business website designer". Positions are single observations. Page facts were read from each page on that date.

| Site | Type | Headline | Published price | Proof | Action |
| --- | --- | --- | --- | --- | --- |
| hireadrian.com | Owner-led, North York | "Toronto Web Design & Digital Marketing That Brings In Leads" | $3,000 (up to 5 pages, 1 year hosting), $4,500, custom | "120+ reviews, 5.0 on Google", client logos, a case study with percentages, founder photo | Quote planner, "Book a free call" |
| solowebsites.ca | Solo | "Websites That Work Harder Than You Do" | None | 3 testimonials, about 20 portfolio links | "Get a free estimate" |
| thewebsitearchitect.com | Solo | "Small Business Website Design Toronto" | $999+, $1,999+, $2,999+ (+$100 a page) | 8 client logos, 9 case studies | "Start My Website" |
| forgeweb.ca/areas/scarborough | Founder-led studio, Etobicoke | "Web design in Scarborough that actually works" | $890 (5 to 7 pages), $2,500, $4,500 | 3 live client sites | "Get my free audit", 15-minute call |
| gilmedia.com (Scarborough page) | Agency | "Scarborough Website Design Agency" | None | 137 reviews, 8 projects | Contact, quote |
| oakharborwebdesigns.com | US reference (USD) | "Small Business Web Designer" | $0 down, $175 a month, or $3,800 | Founder photo, 3 testimonials, speed scores | "Get Started" |

| Worth adapting | Customer benefit | Fit for Mann now |
| --- | --- | --- |
| A starting price beside each package (4 of 6) | A buyer can self-qualify | Yes, once costed (MP-005) |
| A reply-time promise ("price within one business day", hireadrian) | Reduces the fear of being ignored | Only with a time Mann can keep (MP-024) |
| "Work directly with a designer, not a sales team" (hireadrian) | Turns solo into an advantage | Already implied; could be said outright once there is proof |
| Third-party reviews (5 of 6) | The proof a skeptic wants | Not yet available; the route is MP-003 |
| A short call option (2 of 6) | Lower-effort first step for phone-first owners | Later; phone, WhatsApp and text already exist |

**Not worth copying:** neighbourhood name lists (forgeweb), unverifiable outcome claims ("first Google lead within 7 days"), and broad AI service menus (gilmedia). Mann's honest limits are a real difference from all six; keep them.

No design gallery, template or new platform is recommended. The existing system is stronger than five of the six sites compared.

---

## 16. Measurement and acquisition readiness

**Observed.** Cloudflare Web Analytics (cookieless page views) loads on every page. GA4 is not configured, so no consent prompt shows and no conversion event is recorded. The code already defines privacy-safe events (CTA clicks, contact method clicks, form outcomes) and keeps form contents out of analytics. Cloudflare request counts are not human visitors.

**Not verified.** Search Console property and sitemap submission; any enquiry log.

**Minimum measurement plan (MP-013).**

1. Search Console domain property, sitemap submitted, checked monthly.
2. Either set `PUBLIC_GA4_ID` (events are already built) or stay cookieless and count enquiries by hand. For a site at this stage, a hand count is enough.
3. A one-sheet enquiry log: date, source (referral, search, door-to-door, WhatsApp), type (brief or free check), qualified (yes or no), outcome (quote sent, won, lost). No names or contact details in analytics.

**The site is not the constraint on reach.** With no Business Profile, no reviews and a domain a few weeks old, exposure has to come from people, not from the page.

### 30 / 60 / 90 days

| Window | Owner actions | Implementation | Proof | Checkpoint |
| --- | --- | --- | --- | --- |
| 0 to 30 | Send one live test brief and one test check to yourself and confirm the inbox and Reply-To (MP-004). Verify Search Console. Finish Samp: fix the 31 contrast issues, launch on its domain. Offer the free check in person to 10 Scarborough and North York businesses | This audit's code changes | Samp launched; re-run its tests | Enquiry log started; delivery confirmed |
| 31 to 60 | Ask the Samp owner for a written testimonial and permission to quote it. Cost and approve "from" prices. Decide on a Business Profile (eligibility first) | Update the Samp case study; publish prices; publish the checklist guide | One testimonial; one before-and-after snapshot from a real free check | Count: checks requested, checks delivered, quotes sent |
| 61 to 90 | Second paid or reduced-rate project in Scarborough or North York. Ask each client for a Google review once a profile exists | Second case study | Two finished projects | Decide the hero button by the rule in MP-023; review Search Console queries |

AI visibility test set for the owner (record date, tool, whether web access was on, the answer and its links): "Who is Mann Patel, the web designer in Toronto?"; "mannpatel.me services"; "small business web designer in Scarborough"; "who sets up Google Business Profiles for cleaners in North York?"; "how much does a small business website cost in Toronto?". One appearance or absence is a snapshot, not a score.

No paid tools or ads are recommended at this stage.

---

## 17. Prioritized plan

Full detail, evidence, acceptance checks and ownership for each item are in the CSV.

**P1, substantial**

- MP-001 Price lines gate paid work behind the free check (code)
- MP-002 Enquiry promises exceed the package (content)
- MP-003 No third-party proof (owner)
- MP-004 Inbox delivery of the live forms unverified (owner)
- MP-005 No published price signal (owner decision)

**P2, useful**

- MP-006 Free-check section: fragment, three names, unbounded (content)
- MP-007 Services contradictions (content)
- MP-008 Hero emphasis (design)
- MP-009 Phone hero sculpture: size, caption, LCP image (code)
- MP-010 Work starts below the project's own desktop target; one failing test (code)
- MP-011 About portrait below the first screen on phones (code)
- MP-012 About story ambiguity (content, owner question)
- MP-013 Measurement gaps (owner)
- MP-014 Google Business Profile decision (owner)
- MP-015 Finish and launch Samp Hair & Spa (owner)

**P3, polish and experiments**

- MP-016 Metadata; MP-017 audience wording and service-area line; MP-018 `www` redirect; MP-019 HSTS; MP-020 FAQ markup (keep); MP-021 Cloudflare script (owner option); MP-022 services overview experiment; MP-023 hero button experiment; MP-024 reply time (owner fact); MP-025 new portrait (optional); MP-026 checklist guide (owner approval)

### Keep

Approved headline and service-area line; dark and lime identity; work straight after the hero; honest status labels; the fictional-data label; the phone drawer; the two-path contact form with honest sending states; the portrait dial starting clear; package boundaries, exclusions and third-party costs; the "not a fit" lines; `noindex` on the unpublished pricing page; visible FAQs; privacy disclosures; first-person voice.

### Remove or reduce

"Quoted after your free check"; "Never miss an enquiry" and the other absolutes; "Found & Answered" as the customer-facing name; "· Move to rotate" on touch screens; the free-check fragment; "five to seven pages"; the sculpture's height on phones.

### Owner evidence needed

| Question | Why |
| --- | --- |
| Did a test brief and a test check reach your inbox with the right Reply-To? | Closes delivery levels (b) and (c) |
| Had you lived in Thunder Bay before Saint John? | Resolves the About ambiguity |
| What reply time can you keep (for example, two business days)? | Lets the contact page state one |
| What are your costed "from" prices, and how is tax handled? | Publishes prices |
| Do you meet clients in person? | Business Profile eligibility |
| Is there relevant training or experience you are willing to publish? | Bridges the story to the offer |
| Will the Samp owner give a written testimonial and permission? | First third-party proof |
| Is "Taking new projects" still true? | Keeps the status honest |

No two recommendations conflict. The only open alternative, the hero's primary button, is an experiment with a decision rule (MP-023).

---

## 18. Readiness decision

**Usable now.** The site can be shown to prospects today. It is accurate, fast, accessible by every automated and keyboard check run, and every journey works.

**Fix first (done in the implementation that follows).** The price label, the absolute promises, the free-check wording and naming, the services contradictions, the hero emphasis, the phone sculpture, the desktop spacing and the About portrait order.

**Owner must do.** Confirm inbox delivery; launch Samp and get a testimonial; set prices; verify Search Console.

**Still open.** Inbox delivery on production; real-user performance; Search Console indexing; any AI assistant answer; Safari, real devices and screen readers. These are unperformed checks, not known defects. The site is not fully validated until the first two are done.

No post-improvement score is claimed here. The revised site must be inspected first.

---

## 19. Sources

Official documentation (read 11 Nov 2026)

- Google, AI features and your website: https://developers.google.com/search/docs/appearance/ai-features
- Google, Optimizing your website for generative AI features on Google Search: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google Search Central blog, 15 May 2026: https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing
- Google Search documentation updates (FAQ rich result entries): https://developers.google.com/search/updates
- Google, Guidelines for representing your business on Google: https://support.google.com/business/answer/3038177
- OpenAI, Overview of OpenAI crawlers: https://developers.openai.com/api/docs/bots
- W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
- web.dev, Core Web Vitals: https://web.dev/articles/vitals

Comparison sites (read 11 Nov 2026)

- https://hireadrian.com/
- https://www.solowebsites.ca/
- https://thewebsitearchitect.com/small-business-website-design-toronto/
- https://forgeweb.ca/areas/scarborough
- https://www.gilmedia.com/scarborough-web-design-company/
- https://www.oakharborwebdesigns.com/

Project sites (status checked 11 Nov 2026)

- https://nestnrestcleaning.com/ (200, "Opening soon")
- https://samp-hair-spa.lovable.app/ (200, preview)
