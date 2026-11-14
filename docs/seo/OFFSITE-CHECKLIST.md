# Off-site SEO checklist (only Mann can do these)

From the SEO audit of 14 Nov 2026 ([`audit-2026-11-14.md`](audit-2026-11-14.md)); plan: [`PLAN.md`](PLAN.md).
Search Console and Google Business Profile are **already set up**, so their items are checks, not setup steps.

Use the same details everywhere (name, phone and website must match character for character):

| | |
| --- | --- |
| Name | Mann Patel |
| Phone | +1 647-978-6903 |
| Website | https://mannpatel.me/ |
| Email | info@mannpatel.me |
| Area | Based in Scarborough, working across Toronto and the GTA (no street address anywhere) |
| Google Business Profile | https://maps.app.goo.gl/dYccTa9jQJczpeac6 |

## 1. Google Search Console (check: already verified)

- [ ] Open the `sc-domain:mannpatel.me` property and confirm it shows as verified.
- [ ] Sitemaps: confirm `https://mannpatel.me/sitemap.xml` (the one listed in robots.txt) is submitted and reads "Success", with 14 URLs discovered (more once Phase 3 pages go live).
- [ ] URL Inspection → Request indexing for each of:
  - [ ] https://mannpatel.me/
  - [ ] https://mannpatel.me/services/web-design/
  - [ ] https://mannpatel.me/services/local-visibility/
  - [ ] https://mannpatel.me/services/enquiry-follow-up/
  - [ ] https://mannpatel.me/pricing/
  - [ ] https://mannpatel.me/about/
- [ ] Indexing → Pages: check how many pages are indexed and why any are not (indexation was the audit's only **Fail**). Note the date and count here: ______
- [ ] After each phase is deployed, request indexing again for the pages that changed (and the new pages in Phase 3).

## 2. Bing Webmaster Tools

- [ ] Sign in at bing.com/webmasters and choose **Import from Google Search Console** (one click; brings the site and sitemap).
- [ ] Confirm the sitemap is listed and the site is verified.

## 3. Google Business Profile (check: already live)

- [ ] Business type: **service-area business**, with the **home address hidden**.
- [ ] Primary category: **Website designer**.
- [ ] Service areas: **Scarborough**, **North York** and **Toronto**.
- [ ] Services listed with the published prices: Website Launch $1,950; Website + Enquiry System $3,350; Website Fix $450–$850; Local Visibility Setup $650; Website Care $149/month; Free website and Google check.
- [ ] Photos: your real photo and real screenshots of your work (no stock photos passed off as yours).
- [ ] Website link: https://mannpatel.me/ and phone +1 647-978-6903.
- [ ] Business description pairs your name with "Toronto web designer" (see section 7).
- [ ] The site already lists this profile in its structured data (`gbp` in `src/data/site.ts`). The Scarborough page (Phase 3) links to it. If you ever get a longer Google Maps link for the profile, you can replace the short link in `src/data/site.ts`.

## 4. "Website by Mann Patel" credit links

- [ ] nestnrestcleaning.com: add a footer link "Website by Mann Patel" → https://mannpatel.me/ (that site's own repository; it doesn't link here today).
- [ ] Samp Hair & Spa: at launch, ask the owner for the same footer credit.

## 5. Directories (6–8, identical name, phone and URL)

- [ ] Bing Places for Business (can import from Google Business Profile)
- [ ] Apple Business Connect
- [ ] Yelp
- [ ] Clutch
- [ ] DesignRush
- [ ] GoodFirms
- [ ] Digital Main Street vendor list
- [ ] Keep a list of each listing's URL and login, and update them all if a detail ever changes.

## 6. Review routine (never buy, swap or incentivize reviews)

- [ ] Ask every client for a Google review at handover (send the review link from your Business Profile).
- [ ] Reply to every review, good or bad, within a few days.
- [ ] Add real reviews to the site's reviews data (`src/data/reviews.ts`, added in Phase 2) with the reviewer's permission. The reviews strip stays hidden until then. No review stars in structured data for your own business.
- [ ] Ask Samp Hair & Spa for a short written testimonial with permission to publish it, once the site launches.

## 7. Pair your name with "Toronto web designer" (the name is shared online)

- [ ] Google Business Profile description
- [ ] LinkedIn headline (for example "Mann Patel · Toronto web designer · websites and local SEO")
- [ ] Facebook Page name/intro. **Also send the Facebook Page URL** so it can go into the site's structured data (`src/data/site.ts` → `social`, facebook, marked `TODO(Mann)`).

## 8. Monthly AI answer check (30 minutes a month)

Ask each tool the same three questions in a fresh chat, and log whether you appear:

1. "web designer in Scarborough for a small business"
2. "how much does a website cost in Toronto"
3. "who can set up my Google Business Profile in Toronto"

| Date | Tool | Question | Appeared (Y/N) | Notes |
| --- | --- | --- | --- | --- |
| | ChatGPT | 1 | | |
| | ChatGPT | 2 | | |
| | ChatGPT | 3 | | |
| | Perplexity | 1 | | |
| | Perplexity | 2 | | |
| | Perplexity | 3 | | |
| | Gemini | 1 | | |
| | Gemini | 2 | | |
| | Gemini | 3 | | |

## 9. After each deploy

- [ ] PageSpeed Insights (mobile) on https://mannpatel.me/ and compare with the baseline **98 / 100 / 100 / 100** (performance, accessibility, best practices, SEO). Note anything lower.
- [ ] Rich Results Test on the home page and on every new page (it should find the ProfessionalService/local business, FAQ and breadcrumbs with no errors).
- [ ] Real-user speed data (Core Web Vitals) appears in Search Console once traffic grows; there is nothing to do until then.
- [ ] After a few weeks of Search Console data, replace the audit's estimated keyword table with real queries and positions (Performance → Queries), and note which pages they land on.

## 10. Later

- [ ] North York page: only once there is real proof there (a client or project in North York). Not before.
