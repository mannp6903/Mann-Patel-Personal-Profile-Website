# mannpatel.me: search, AI visibility and enquiry audit

**Prepared for:** Mann Patel · **Observed:** Monday 23 November 2026, about 3:55 to 4:50 PM Toronto time · **Scope:** read-only. No production change, no pull request, no form submitted.

Appendices (CSV, open in any spreadsheet): A1 URL inventory · A2 Google query panel · A3 AI visibility tests · A4 competitor matrix · A5 keyword-to-page map · D backlog.

Evidence labels used throughout: **Measured** (a tool returned it), **Observed** (reproducible by repeating the step), **Inference** (reasoned from evidence), **Hypothesis** (untested), **Owner claim** (stated on Mann's site or repo, not independently verified).

---

## A. One-page decision brief

**Why you are hard to find on Google.** Google is crawling and indexing the site: at least 11 of the 30 sitemap URLs appear for branded searches (Observed). It is not a technical block. The break is competitive: in 10 unbranded Toronto/Scarborough searches (Google placed the browser in Parkwoods, North York), mannpatel.me appeared 0 times in the first page of organic results and 0 times in the map pack, and your Business Profile was not in the first 22 local-finder results for "web designer scarborough" (Observed). Every business in those map results shows 10 to 952 Google reviews; your profile shows none (Observed). Ahrefs rates the domain DR 0 (Measured). The site has been live about four weeks. **Certainty: high** that proof and authority, not indexing, are the limit today. The Search Console "Couldn't fetch" status is real in the report but did not stop discovery (see B2).

**Why you are hard to find in AI answers.** Two separate causes. (1) **Bing has no pages of mannpatel.me** ("There are no results for "mannpatel.me"", Observed), and ChatGPT's logged-out search could not identify you. (2) **Name collision:** Google AI Mode answered "Who is Mann Patel, the web designer in Scarborough?" by describing other Mann Patels (a MxnnCreates founder, students, an Apple engineer), and Bing ranks mannpatel.tech, another Mann Patel selling "AI · Automation · Website Development", first for your name plus "web design Scarborough" (Observed). Result: **0 of 5 unbranded AI answers named you; 0 of 2 branded answers described you correctly.** Certainty: high for this dated sample; it is not a universal ranking.

**Biggest obstacle to an enquiry.** No outside proof. There are no reviews, no testimonial, no finished client project with a result (Samp Hair & Spa is in progress; Nest & Rest is your own business opening summer 2027), and no page says when you reply. The free check itself is well explained (four steps, what's excluded, a 4-field form).

**Three strengths to keep.**

1. **Published fixed prices** ($1,950 website, $650 Google setup, $149/month care, all CAD plus tax). Of the five closest competitors, only We Are Digital Marketing publishes a full list; BridgeWeb and WebZylo publish none; Adrian Martinez gives only "from $3,000".
2. **Honest, owner-led positioning** ("the person you talk to is the person who does the work"), with every project labelled live or in progress.
3. **A technically clean site:** 200s everywhere, self-canonicals, one-hop redirects, real 404s, complete structured data, robots.txt that welcomes AI search bots, 182 ms time to first byte in a single check.

**First three changes.**

1. **Get into Bing** (Webmaster Tools, import from Search Console): 30 minutes, unblocks ChatGPT and Copilot (IDX-1).
2. **Start genuine Google reviews and add a reply-time promise** under the free-check button (PROOF-1, CONV-2).
3. **Make your name unambiguous** across LinkedIn, the Business Profile and social bios with one identical line and link (ENT-1).

**Unresolved:** which queries already bring impressions, and which 3 URLs are "Crawled – currently not indexed". Settle it with the Search Console exports listed in IDX-3.

### Your three decisions, answered

**1. Where can a prospect find you today, and where does the path break?**

| Route | Today | Earliest break |
| --- | --- | --- |
| Google, branded ("mannpatel.me", "mann patel web designer") | Found: home #1, About #2, Scarborough #4, North York #8 | None for the site; namesakes share the page |
| Google organic, unbranded (9 service/price/industry queries) | 0 of 9 | Appearance: no authority or reviews against established pages |
| Google map pack / local finder | 0 of 7 packs; not in first 22 local results | Appearance: 0 reviews vs 10–952 for every listed rival |
| Google AI Mode (4 unbranded, 1 branded) | Not named; branded answer describes other people | Entity: no corroboration linking the name to the business |
| ChatGPT logged-out search (1 unbranded, 1 branded) | Not named; "couldn't confidently identify" | Discovery: Bing has no pages of the site |
| Perplexity | Untested (asked to sign up) | n/a |
| Click → enquiry | Free-check path clear and short; delivery not end-to-end verified this session | Unknown until CONV-1 is run |

**2. Your five competitors in one line each** (detail in C3):

- **Adrian Martinez (hireadrian.com):** an owner hires him for 129 reviews and 25 years of history. You win when the owner wants a sub-$2,000 site at a written price.
- **BridgeWeb:** an owner hires them for a 20-year agency with 154 reviews and ecommerce or app range. You win on published prices and working directly with the builder.
- **WebZylo:** an owner hires them for a polished agency with ads in the results. You win on clarity: their hero ("Digital architecture built for market leaders") doesn't speak to a contractor.
- **We Are Digital Marketing:** an owner hires them for the lowest price ($149 to $400 plus HST) and because AI answers recommend them. You win when the owner needs Google profile, booking and testing, not a one-page site.
- **Taylor Nguyen:** an owner hires her for an independent designer with testimonials. You undercut her by about half ($1,950 vs $3,800) and are local to Scarborough.

**3. Keep, fix, rewrite, build, measure.** The 16 tickets are in section D and in D-backlog.csv. The first 48 hours cover Bing, Search Console, the form delivery test, a reply time and enquiry logging.

**First task tomorrow:** see section F.

---

## B. Coverage and evidence ledger

### B1. Tools and access

| Tool | Status | What it returned |
| --- | --- | --- |
| Claude built-in browser on Mann's computer (Chromium, signed out; Google located the browser by IP in Parkwoods, North York) | **Used** | Live site fetches, rendered phone view (375×812), 12 Google searches + local finder, Google Maps profile, Bing, 5 Google AI Mode runs, 2 ChatGPT runs, 5 competitor sites |
| Cloud container curl | Failed | The network policy blocks mannpatel.me (403 at proxy). Fell back to the browser. |
| Repository mannp6903/Mann-Patel-Personal-Profile-Website (commit 2aa07bd, 23 Nov) | **Used** | Routes, sitemap/robots config, Worker redirects, data files |
| Google Search Console | Not available | Not connected (Supermetrics shows GSC/GA4/GBP "not authenticated"); the browser profile isn't signed in to Google. I didn't sign in. Used your 4 screenshots (taken 23 Nov, about 3:56 PM). |
| GA4 (G-WM5G62C3HX) | Not available | Same. GA loads only after consent, so it will undercount (repo). |
| Google Business Profile insights | Not available | Public Maps view only |
| Ahrefs API | Partial | Free plan: Domain Rating 0 for mannpatel.me. GSC, Brand Radar, keywords and backlinks are blocked ("Insufficient plan"). |
| Semrush | Failed | "No API units left" |
| PageSpeed Insights API | Failed | Daily quota exceeded on the shared key. No field (CrUX) data. |
| Perplexity | Failed | Requires sign-up |
| Firecrawl / Windsor.ai | Not present in this session | In-browser crawler used instead |

**Date ranges:** no Search Console period could be analysed (no access). All live observations are from 23 Nov 2026.

### B2. Sitemap and indexing diagnosis (checked first)

Evidence chain for the site as a whole:

| Step | Status | Evidence |
| --- | --- | --- |
| Discovery | **Works** | robots.txt (200, text/plain) allows `/` and declares `Sitemap: https://mannpatel.me/sitemap.xml`. 30 URLs reachable by internal links from Home. |
| Sitemap fetch (browser) | **Works** | /sitemap.xml and /sitemap-index.xml: 200, `application/xml`, a valid `<sitemapindex>` pointing to /sitemap-0.xml. /sitemap-0.xml: 200, `application/xml`, 30 `<url>` with `<lastmod>`. No X-Robots-Tag, `cache-control: max-age=0`. |
| Sitemap fetch (Googlebot) | **Unknown** | I couldn't send a Googlebot request. Search Console shows "Couldn't fetch" for both, last read 14 Nov (index) and never (child). |
| Crawl / render | **Works** | All 30 pages return 200, server-rendered HTML (static Astro), self-canonical, `index, follow`. |
| Index | **Partly works** | 11 URLs seen in Google results (A1). Search Console: 1 "Page with redirect", 3 "Crawled – currently not indexed", 0 "Alternate page with proper canonical tag". |
| Appearance (unbranded) | **Breaks** | 0 of 10 queries (A2). |

**Leading diagnosis (Inference):** the "Couldn't fetch" rows are stale or still pending. 14 Nov was the day of 30 commits, including the Worker that now handles www/http redirects (commit d28c64a) and new headers, so a fetch that day could have failed. Search Console then keeps the error until it re-reads. The sitemap-0.xml row, submitted separately on 15 Nov, is redundant because the index already lists it.

**Contrary evidence:** if Cloudflare bot rules (Bot Fight Mode, WAF or "Block AI bots") challenge Googlebot on XML, the live test will fail. Indexed HTML pages argue against a blanket block, but a path-specific rule is possible.

**Test that settles it:** Search Console → URL Inspection → `https://mannpatel.me/sitemap.xml` → Test live URL (ticket IDX-2). Google's own Sitemaps report help explains the statuses: <https://support.google.com/webmasters/answer/7451001>.

**"Page with redirect" (1):** expected. www, http and no-slash variants each 301 in one hop to the canonical (observed: `http://www.mannpatel.me/services` → `https://mannpatel.me/services/`). Don't "validate fix".
**"Crawled – currently not indexed" (3):** the URLs are not visible in the screenshots. Candidates (Inference only): /vision/ (423 words), /work/ (234 words), or a recently changed guide. Export the list (IDX-3).
**`site:` operator:** returned "did not match any documents" twice while branded searches showed 9 site URLs. Treat `site:` as unreliable, not as an index count.

### B3. Coverage counts

| Disposition | Count |
| --- | --- |
| Canonical, indexable HTML pages (all in sitemap) | 30 |
| Noindex by design (/free-check/, /contact/received/, /404/) | 3 |
| Endpoint excluded (/api/enquiry/, robots-disallowed) | 1 |
| Redirect variants checked (www, http, no-slash) | 3 patterns |
| Non-HTML resources checked (robots.txt, llms.txt, 2 sitemaps, IndexNow key) | 5 |
| **Individual page reviews completed** | **33** (A1) |

Crawl rule: same-origin links from rendered HTML, plus sitemap and repo routes, depth unlimited, stopped when no new URLs appeared (33). Excluded: query-string variants (canonical strips parameters, verified on /guides/?utm_source=x), image and font files, and off-site links (27 external hosts listed in the crawl). No PDFs or feeds exist. Draft area pages in the repo (Markham, Pickering, East York, Ajax) aren't built in production. Search Console and GA4 landing pages could not be reconciled (no access).

**Component coverage:** rendered at 375×812: Home first viewport, Contact (form fields and states read from the DOM). Desktop: Home, Contact, Google/Maps/Bing pages. The other 29 pages were reviewed from fetched HTML (headings, copy, links, CTAs, images, schema), not visually rendered. **Not tested:** keyboard-only navigation, 200% zoom, reduced motion, intermediate widths, slow network, the mobile menu overlay, form error and success states (no submission). These are open items in F.

**Global components** (one ID each, on every page unless noted): G-HEADER (wordmark + Work, Services, Pricing, Guides, About + "Free check" → /contact/?package=check-up#check), G-FOOTER (contact block, 2 nav lists, socials, Nest & Rest link, legal, back-to-top), G-CONSENT (analytics consent prompt), G-FREECHECK section (on Home, /services/, industry pages, guides), G-CRUMBS (breadcrumbs, not on Home). Exception: the footer "Free website and Google check" link goes to /services/#check, one tap further than the header's direct link to the form (minor, OFFER-2).

### B4. Performance (lab, single sample)

PSI and CrUX were unavailable (quota), and there is no field data for a site this new. In-browser timing on Mann's computer, desktop, warm connection: TTFB 182 ms, HTML 37 KB transferred (175 KB uncompressed, CSS inlined), 12 requests, load event 282 ms, CLS 0.000. Paint metrics weren't captured because the pane was hidden. **Owner claim** (repo docs/31): Lighthouse CI median LCP on Home 1.70 to 1.75 s after the hero fix. Performance is not a priority problem; no performance ticket is raised.

---

## C. Pages, competitors, AI tests, offers and journeys

### C1. Page reports

Each of the 33 URLs has its own row in **A1-url-inventory.csv**: purpose, exact title (with length), H1, meta description (with length), word count, observed index status, recommendation and finding IDs. Summary of what A1 shows:

- **No missing or duplicate titles, H1s or descriptions.** Each page has one H1. Titles run 25 to 63 characters. All descriptions are unique.
- **Structured data is complete and accurate.** WebSite, ProfessionalService, Person, FAQPage on Home; Service + FAQPage on service pages; BlogPosting on guides; ProfilePage on About. The case studies have only BreadcrumbList (optional CreativeWork, low value). There is correctly no Review/AggregateRating for your own business. Don't add FAQ markup expecting rich results: Google limits FAQ rich results to authoritative government and health sites (<https://developers.google.com/search/docs/appearance/structured-data/faqpage>).
- **Thin pages:** /work/ (234 words), /vision/ (423), /terms/ (433).
- **Template overlap** (shared 5-word phrases, measured in the browser): Scarborough vs North York 59%; /services/web-design/ vs /services/website-redesign/ 49%; cost guide vs redesign-cost guide 39%; cleaning vs salon pages 36%.

Page-level verdicts: **Keep** 17 · **Improve** 12 · **Merge or noindex if no unique facts** 1 (/web-design-north-york/) · **Keep noindex** 3.

### C2. Homepage hero (phone, 375×812, before scrolling)

Transcribed:

- Title tag: "Web Design & Local SEO in Scarborough, Toronto | Mann Patel" (Google shows "Mann Patel: Web Design & Local SEO in Scarborough, Toronto")
- Eyebrow: "Hi, I'm Mann. Web designer in Scarborough."
- H1: "Websites and Google listings for Toronto small businesses."
- Subhead: "I build fast websites and set up your Google profile, so people nearby find you, call you and book. Fixed prices, in writing."
- Primary CTA: "Get a free website check" → /contact/?package=check-up#check
- Secondary: "See prices"
- Price line: "Websites $1,950. Google setup $650. CAD, plus tax."
- Below the fold: square portrait in a dark panel.

| Question | Answered on the first screen? |
| --- | --- |
| Who is Mann? | Yes: name and "Web designer in Scarborough" |
| Who is it for? | Yes: "Toronto small businesses" |
| What can I hire him to do? | Yes: websites and Google listings, with prices |
| Why trust him? | **Missing.** No review, client name or result above the fold ("Fixed prices, in writing" is a promise, not proof). |
| What happens if I tap? | **Missing.** Nothing says it's a 1-minute form or when the list arrives. |

**Hero A (recommended). Hypothesis:** adding a time expectation and visible proof raises taps without changing the offer.

- Title: `Web Designer in Scarborough, Websites from $1,950 | Mann Patel`
- Meta description: `Independent web designer in Scarborough. Websites from $1,950 CAD and Google Business Profile setup for $650, at written fixed prices. Ask for a free website and Google check.`
- H1: `Websites and Google listings for Scarborough and Toronto small businesses.`
- Supporting: `I'm Mann, an independent web designer in Scarborough. I build fast websites and set up your Google profile so nearby customers find you and call. You deal with me from first message to handover.`
- Primary CTA: `Get my free website check` · microcopy under it: `One-minute form. Your list of fixes by email within [2 business days: confirm].`
- Secondary CTA: `See prices`
- Proof slot, directly under the CTAs: once real reviews exist, `★ [rating] from [n] Google reviews`, linked to the profile. Until then: `Now building: Samp Hair & Spa, Scarborough`.
- Phone order: eyebrow → H1 → supporting copy → primary CTA + microcopy → secondary → proof → price line → portrait.

**Hero B (challenger). Hypothesis:** leading with the owner's problem fits searchers who don't yet think "I need a web designer".

- Title: `Free Website & Google Check for Toronto Small Businesses | Mann Patel`
- Meta description: `Is your business easy to find and call from a phone? Send your website or business name and get a short written list of fixes from a Scarborough web designer. Free.`
- H1: `Can customers find you and call you from their phone?`
- Supporting: `Send me your website or business name. I'll look you up on Google, Maps and ChatGPT the way a customer would, and email a short list of fixes, most important first. Free, no obligation.`
- Primary CTA: `Check my business, free` · Secondary: `Or see website prices from $1,950`
- Proof slot: the same as Hero A.

**Art direction:** keep the portrait (it's the brand's only human proof), but crop it at the shoulders with a work sample in the frame: a phone showing the Nest & Rest page, held or set beside you. That's one photo that says "this person builds this". Keep the dark panel and lime accent. Don't add stock imagery.

### C3. Competitor matchups

Selection: providers ranked by appearances across the 10 unbranded queries in A2, then by service overlap, then by position. Directories and marketplaces were excluded: Bark (4), Yelp, Behance, Twine, Semrush Agencies. Truzz (2 pack appearances in Scarborough) was excluded because its own website could not be confirmed (search shows bbb.org and an unrelated truzzinfotech.com). Tectera (1) is noted as a nearer Scarborough comparable. Google's map results are labelled separately from organic. Correlation only: these observations don't reveal why Google ranks anyone.

For each matchup below: **winner by dimension**, then the verdict. Mann's comparable URL is in brackets.

**1. Adrian Martinez, hireadrian.com (independent, owner-led, North York)** [mannpatel.me /]
Seen: map pack in 5 of 10 queries; 5.0 from 129 reviews; "25+ years in business" (GBP); H1 "Toronto Web Designer Building Websites That Bring In Leads"; "Websites from $3,000"; a 5-step instant quote form and an embedded booking calendar on Home.

| Dimension | Winner | Why |
| --- | --- | --- |
| Discoverability | Adrian | 5 packs vs 0 |
| Hero clarity | Tie | Both name role, city and outcome |
| Public prices | **Mann** | Full list vs "from $3,000" |
| Reviews / credibility | Adrian | 129 vs 0 |
| Case studies | Adrian (inferred from scale) | Two in-progress projects vs a long history |
| Contact path | Adrian | Book a call inline; Mann has no booking link yet (`bookingUrl` null) |
| Local signal | Tie | Both GTA, both owner-led |

Hire Adrian for proven volume and ads/SEO add-ons; hire Mann for a written $1,950 scope and a lower entry price. **Decisive scenario:** a Scarborough cleaner with a $2,000 budget can't afford Adrian's floor. **How Mann can outperform:** answer a free-check request within one business day, with a recorded screen walkthrough. **Preserve:** the published price list.

**2. BridgeWeb, bridgeweb.ca (agency since 2006)** [/services/web-design/]
Seen: 4.9 from 154 reviews; "115 projects delivered" (owner claim); no prices; ranks with a blog post for "cleaning company website design toronto".
Winners: discoverability BridgeWeb · prices **Mann** · reviews BridgeWeb · industry content tie (both have cleaning pages; BridgeWeb's ranks) · direct access to the builder **Mann**.
Hire BridgeWeb for ecommerce, apps or a larger team. Hire Mann for a small service business that wants the builder on the phone. **How to outperform:** a cleaning-specific page that shows a real price, the Nest & Rest screens inline, and a checklist BridgeWeb's blog lacks. **Preserve:** "every account set up in your name".

**3. WebZylo, webzylo.ca (agency, paid search)**
Seen: map pack in 4 queries (5.0 from 12 and 5.0 from 4 on two profiles) plus Google Ads; H1 "Digital architecture built for market leaders."; no prices.
Winners: discoverability WebZylo (paid and pack) · hero clarity for a trades owner **Mann** · prices **Mann** · reviews WebZylo (12 vs 0).
Hire WebZylo if you want an agency that also runs ads; hire Mann if you want plain language and a fixed price. **How to outperform:** put the price in the titles that answer engines quote (PRICE-1). **Preserve:** plain-English copy.

**4. We Are Digital Marketing, wearedigitalmarketing.ca (small agency, price-led)**
Seen: organic in 3 queries; named in 3 of 4 Google AI Mode answers; websites "from $149 + HST", full website "$400 + HST", area pages "$300 + $50/mo"; hosting and domain $90 a year; English and Spanish.
Winners: AI visibility WADM · price **WADM** (lower) · scope transparency tie · Google profile, booking and testing depth **Mann** · reviews WADM ("5.0 on Google", count not shown).
Hire WADM for the cheapest acceptable site; hire Mann when the site must bring calls (profile, booking, tested enquiry path). **Decisive scenario:** a contractor asking ChatGPT or AI Mode for "web designer Scarborough prices" gets WADM because its titles carry the price. **How to outperform:** titles with "from $1,950" and a short comparison: "What $400 gets you vs what $1,950 gets you". **Preserve:** fixed scope with the excluded items written down.

**5. Taylor Nguyen, taylornguyen.ca (independent)**
Seen: organic #2 for "small business web designer toronto"; packages $3,800, $5,000 and $9,000; testimonials section; pain-point copy; "Book a free consultation".
Winners: discoverability Taylor (1 query) · price **Mann** · testimonials Taylor · locality **Mann** (Scarborough-based).
**How to outperform:** a Scarborough-first page with dated local work. **Preserve:** the owner-to-owner first-person voice.

Full grid: A4-competitor-matrix.csv.

### C4. AI answer-engine sample (A3-ai-visibility-tests.csv)

| Intent | Runs | Mann named | mannpatel.me cited | Correct description |
| --- | --- | --- | --- | --- |
| Unbranded | 5 (4 Google AI Mode, 1 ChatGPT) | 0/5 | 0/5 | n/a |
| Branded | 2 (1 each) | 1/2 named, but as other people | 0/2 | 0/2 |
| Perplexity | 1 | Untested (sign-up wall) | | |

Variability: the same Google AI Mode prompt run twice returned different providers (T1: The Ant Firm, WADM, Tectera; T2: WADM, SimplifAI). WADM appeared in both runs.

**Crawler eligibility (Observed in robots.txt):** all crawlers are allowed except on /api/, and OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot and Perplexity-User are named explicitly. Search access and training access are separate controls: OpenAI documents OAI-SearchBot (search) and GPTBot (training) separately (<https://developers.openai.com/api/docs/bots>, which your guide already cites), and Google-Extended controls Gemini training, not Search. Nothing in robots.txt blocks search use. **Documented constraint:** a page Bing hasn't indexed can't be found through Bing-backed search. **Plausible improvements:** entity consistency (ENT-1), third-party mentions, reviews. **Not promised:** llms.txt, FAQ schema or AEO copy produce citations. Your llms.txt is accurate and harmless, but no tested engine used it.

### C5. Offers and prices (exactly as displayed, 23 Nov, CAD plus applicable tax)

| Offer | Price | Fee type | Includes | Limits | Turnaround | Next step |
| --- | --- | --- | --- | --- | --- | --- |
| Free website and Google check | $0 | n/a | 4 checks (Google/Maps/Apple/AI lookup, review comparison with top 3 nearby, test enquiry and an after-hours call with permission), written list of fixes | Fixes not included | "I reply by email to arrange it" (no time stated) | 4-field form |
| Website Fix | $450–$850 | One-time | One defined problem fixed and tested | One problem | "Usually days, not weeks" | Brief |
| Website | $1,950 | One-time, 50% at kickoff, 50% after launch checks | Up to 5 pages, one enquiry path, client's text and photos, 2 revision rounds | Domain, hosting and tools billed by providers | "Depends on how quickly your text… arrive" | Brief |
| Website + Booking | $3,350 | One-time | Website + one booking integration + one follow-up workflow | One workflow | As Website, plus setup | Brief |
| Google Listing Setup | $650 | One-time | One eligible GBP, short named listing set, review routine, before/after snapshot | Verification time outside control | Varies | Brief |
| Website Care | $149/month | Recurring, cancel any month | Monthly test enquiry, booking-link check, ≤30 min edits, a note | 30 min | Monthly | Brief |
| Brand & Content Sprint | **Unpublished** | ? | One campaign from one service story | ? | ? | "Ask about the sprint" (/services/ only) |

Ownership is stated ("every account set up in your name"). Hosting is billed by providers.

**Like-for-like published competitor offers:** WADM full website $400 + HST plus $90/yr hosting; Taylor Nguyen $3,800 / $5,000 / $9,000; Adrian from $3,000; Bark shows "C$450–C$2,000, avg C$800" (a directory claim). BridgeWeb and WebZylo don't publish prices.

**Recommendation (proposal, to validate):** keep **fixed** prices for Website, Google Listing Setup and Care. They are your clearest advantage and sit in the middle of the published market. Keep the **range** for Website Fix. Either publish a fixed price for the Brand & Content Sprint or label it "quoted after a brief". **Don't cut the $1,950**: competing with $400 sites loses on margin, and your scope (tested enquiry path, Google profile) is different. **What you must validate:** your real hours per Website build (to check that $1,950 covers them at your target hourly rate) and your reply capacity for free checks per week.

**Publishable copy (pricing intro), ready to use:** "Every price here is fixed and in Canadian dollars, plus tax. If something isn't in a package, I quote it in writing before I start. Domain, hosting and booking tools are billed to you directly, in your name."

### C6. Buyer journeys (desktop and phone; stopped before sending)

1. **Referred owner checking credibility.** Google "mann patel web designer" → mannpatel.me #1 (Observed) → Home → About → Work. *Objections left open:* "Has he finished a site for someone like me?" and "Does anyone vouch for him?". AI check: if the owner asks ChatGPT or AI Mode, they get another person (AI-T5, T7). *Last verified step:* the brief form renders. *Smallest change:* one genuine review plus a consistent entity line (PROOF-1, ENT-1).
2. **Scarborough tradesperson wanting a redesign.** Searches "web designer scarborough" → Mann is absent (organic, pack and AI Overview). *Dead end:* never reaches the site. Plausible landing via /guides/website-redesign-cost-toronto/ (not observed ranking). *Smallest change:* the Scarborough page with unique local facts and a price in the title, plus reviews (AREA-1, PRICE-1).
3. **Toronto service business comparing SEO/AI help.** "local seo small business scarborough" → absent. If they land on /services/ai-search-optimization/ they read a clear method, but a prospect who tests Mann in ChatGPT finds nothing. *Smallest change:* fix Mann's own AI result first (IDX-1, ENT-1), then show it (AI-3).

**Free-check flow (verified up to the button):** Header "Free check" → /contact/?package=check-up#check → form: name*, email*, website, business name ("one of the two is enough"), optional note, honeypot → "Request the free check". Text under it: "You get: 4 checks and a short written list of fixes, most important first. Free, no obligation." The endpoint reports `connected: true`. **Not verified:** delivery, confirmation page wording after a real send, and reply time. A contact-link click is not a delivered enquiry: measure delivered submissions server-side (MEAS-1).

**Proof modules, ready to review:**

- *Under the CTA:* "One-minute form. You'll get a short list of fixes by email within [2 business days]. No call unless you ask for one."
- *Work card for Samp (until launch):* "Client website, in progress. I wrote the brief from the salon's verified details, wrote the copy, checked every fact and tested the request path. Built with Lovable; launch and results will be dated here."
- *Permissioned walkthrough (asset to obtain):* a 2-minute screen recording of a free check on your own Nest & Rest listing, showing exactly what an owner receives.

---

## D. Prioritised backlog

Full tickets (evidence, implementation, file paths, owner, pass/fail test): **D-backlog.csv**. Hours are solo estimates.

| Window | ID | Severity | Ticket | Hours |
| --- | --- | --- | --- | --- |
| First 48 hours | IDX-1 | High | Bing Webmaster Tools: import from Search Console, submit sitemap, ping IndexNow | 0.5 |
| | CONV-1 | High | Prove form delivery end to end (`npm run check:enquiry -- --send`) | 0.5 |
| | CONV-2 | High | Decide and show a reply time (form, confirmation page) | 1 |
| | MEAS-1 | High | Server-side enquiry log + one-sheet lead log | 2 |
| | IDX-2 | Medium | Search Console: live-test sitemap, remove sitemap-0 row, resubmit | 0.5 |
| | IDX-3 | Medium | Export Search Console performance and indexing lists | 0.5 |
| First 2 weeks | PROOF-1 | High | Genuine Google reviews; set `gbp.reviewUrl`; reviews.ts | 4 |
| | ENT-1 | High | One identical entity line and link on LinkedIn, GBP, socials, About | 3 |
| | HERO-1 | Medium | Hero A (microcopy + proof slot) | 2 |
| | PRICE-1 | Medium | Prices in area/industry titles; reorder Home cards | 1 |
| Days 15–30 | AREA-1 | Medium | De-duplicate Scarborough/North York; North York keep-or-noindex | 4 |
| | KW-1 | Low | One redesign target page | 1.5 |
| | OFFER-2 | Low | Align offer names; price or label the Sprint | 1.5 |
| | CONV-3 | Medium | Shorter brief form | 2 |
| Days 31–90 | PROOF-2 | Medium | Samp case study after launch, with owner words by permission | 2 |
| | AI-3 | Low | Publish Mann's own dated AI results once they pass | 1 |

**Copy you can use now:** the hero microcopy, the pricing intro and the proof modules in C2 and C6, and the titles in PRICE-1.
**Claims or prices to validate first:** reply time, any review count, the Samp launch date and owner quote, the Sprint price, the hours behind $1,950.

---

## E. Measurement plan

**Qualified lead (definition for this site):** a delivered free-check or brief from the owner or manager of a service business in Toronto or the GTA, describing a need one of the five offers covers, with a working email or phone. Not spam, not a vendor pitch, not a job seeker. Budget isn't required for a free check, but is "$1,000+" or "not sure" for a brief.

| Metric | Source | Baseline (23 Nov) | Window | Cadence |
| --- | --- | --- | --- | --- |
| Pages indexed | GSC Page indexing | Unknown count; 11 URLs seen; 3 crawled-not-indexed (screenshot) | Weekly snapshot | Weekly for 6 weeks, then monthly |
| Bing pages indexed | Bing Webmaster | 0 (Observed) | n/a | Weekly until >25 |
| Non-brand clicks (Canada) | GSC, query filter excluding "mann", "patel", "mannpatel" | Unknown (export needed) | Last 28 days vs previous 28 | Monthly |
| Local visibility | Manual: the 10 A2 queries + local finder, same IP location (Parkwoods, North York), signed out | 0/10 organic, 0/7 packs, not in top 22 local | Same queries | Monthly |
| AI mentions/citations | Manual: A3 prompts, fresh sessions, each run twice | 0/5 unbranded; 0/2 branded correct | Same prompts | Monthly |
| Contact starts | GA4 event on the CTA click (consent-gated, undercounts) | Unknown | 28 days | Monthly |
| Delivered enquiries | Server log (MEAS-1), one row per successful POST, by form type | 0 logged (no log exists) | Calendar month | Weekly |
| Qualified leads | Lead sheet: qualified Y/N, outcome | 0 logged | Calendar month | Weekly |

**Avoiding double counting:** count a lead once, at delivered submission. A free check that later becomes a brief stays one lead, with the outcome updated. Calls and WhatsApp go in the same sheet by hand, marked by channel. A tap on "Call" is not a lead.

**Low traffic:** at under about 100 non-brand clicks a month, CTR and position swing on single searches. Judge changes by direction over 2 to 3 months and by delivered enquiries, not percentages. The free-check experiment in your repo (ten delivered checks, then decide) is the right scale.

**Retests for the top fixes:** IDX-1: bing.com "mannpatel.me" returns results (7 Dec). IDX-2: Sitemaps shows Success/30 (30 Nov). ENT-1 and AI: rerun AI-T5/T7 (7 Jan). PROOF-1: review count on the Maps profile (31 Dec). CONV-1: test emails received (24 Nov). AREA-1: rerun "web designer scarborough" and the 5-gram overlap (late Dec).

---

## F. Reconciliation

- **Pages:** 33 discovered and reviewed individually (30 canonical indexable, 3 noindex), plus 1 endpoint, 3 redirect patterns and 5 non-HTML files. 0 blocked. 0 left in the queue.
- **Component coverage:** phone, Home first viewport and Contact form rendered. Desktop: Home and Contact. The other 29 pages were reviewed from HTML only. Not tested: keyboard, zoom, reduced motion, mobile menu overlay, form error and success states, intermediate widths, slow network.
- **Competitors compared:** 5 (Adrian Martinez, BridgeWeb, WebZylo, We Are Digital Marketing, Taylor Nguyen). Homepages only, desktop; mobile and speed of rivals not measured.
- **Search panel:** 10 unbranded + 2 branded Google queries + 1 local finder, desktop, Google location from IP: Parkwoods, North York (corrected 23 Nov, 4:40 PM; the first results page showed a "Scarborough" area chip, the page footer shows the IP location). Mobile Google SERPs not captured.
- **Engines and prompts:** Google AI Mode 5 runs (3 unique unbranded prompts, 1 repeated; 1 branded); ChatGPT 2 (1 unbranded, 1 branded); Perplexity untested. Gemini app, Copilot and Google AI Overviews for the exact prompts weren't tested separately (AI Overviews appeared on 3 of the ordinary searches).
- **Still unverified:** Search Console performance and the 3 not-indexed URLs; Googlebot's view of the sitemap; form delivery; reply time; Samp launch date; the "115 projects" and other competitor claims; field Core Web Vitals; your GBP insights and category settings beyond the public view (category "Website designer", service-area, open until 11 PM, 3 photos, 0 reviews). The open-until-11-PM hours may deserve a check against when you really answer.

### The first task for tomorrow

**Where:** bing.com/webmasters (signed in with the Microsoft account you'll keep).
**Do:** choose **Import from Google Search Console**, select `https://mannpatel.me/`, and confirm the sitemap `https://mannpatel.me/sitemap.xml`. Then, in the same sitting, open Search Console → URL Inspection → `https://mannpatel.me/sitemap.xml` → **Test live URL**, and if it passes, remove the separate `sitemap-0.xml` row and resubmit `sitemap.xml`.
**You'll know it worked when** Bing's Sitemaps page shows "Success" with 30 URLs (usually within 48 hours), a bing.com search for `"mannpatel.me"` stops saying "There are no results" (within about two weeks), and Search Console's sitemap row reads "Success" with 30 discovered pages.
