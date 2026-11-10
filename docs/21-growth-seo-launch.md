# Growth and SEO launch (10 Nov 2026)

Implements the launch scope of the growth report and its master prompt (both supplied by Mann on
10 Nov 2026). The business goal: qualified enquiries from owner-run Toronto service businesses,
especially in North York and Scarborough. The lead offer is **web design and local SEO**, supported
by tested enquiry follow-up and booking.

Nothing here changes prices, DNS, Google accounts or the live Cloudflare settings. The steps only
Mann can do are in "Release checklist" below.

## What changed

| Area | Before | Now |
| --- | --- | --- |
| Home H1 | Found. Answered. Booked. (+ a descriptor) | **Web design and local SEO for Toronto service businesses** |
| Hero actions | Start a project · See selected work | **Get a free website and Google check** → the short check form · **See the work** → `/work/` |
| Found. Answered. Booked. | The H1 | A three-step process strip under the hero; each word keeps its scene and says what it means. "Booked" keeps a request apart from a confirmation |
| Titles, H1s, descriptions | Benefit-led | The report's copy map on Home, Services, the three service pages and Work; titles read `Page \| Mann Patel` |
| Services overview | Detailed areas first | Three named services and the package comparison first; all anchors kept; **Brand & Content Sprint** as the first add-on (`#brand-content`) |
| Web design page | New site or rebuild | Adds a **repair** option (`#repair`) for a site with a usable foundation |
| Local SEO page | "Local visibility" | Names local SEO, Google Business Profile, Maps and reviews; adds website fixes in priority order and an **AI search visibility check** (`#ai-search`) that explains GEO and AEO once and guarantees nothing |
| Enquiry page | One workflow, described | Names the four scoped options (`#options`) and shows a fictional **test log** (`#test-log`) with a failed step handed to the owner |
| Structured data | ProfilePage + ProfessionalService on Home | One `Person` with a stable `@id` (`/#person`), `WebSite` on Home, `ProfilePage` on About, `Service` providers pointing at the Person; the deprecated `ProfessionalService` type is gone |
| Slash redirects | `/services` → temporary 307 | `/services` → permanent **301** (a generated `_redirects` file; see below) |
| Proof links | Hard-coded link to nestnrestcleaning.com | One switch, `siteLive` in `src/data/site.ts`; currently **on** (see "Checked on the day") |
| Case studies | Linked to overview anchors only | Also link to the focused service page they are evidence for |

## Page map and where each button goes

| Page | Title | Main action | Second action |
| --- | --- | --- | --- |
| `/` | Mann Patel \| Web Design & Local SEO in Toronto | Free check → `/contact/?package=check-up#check` | See the work → `/work/` |
| `/services/` | Website, Local SEO & Booking Services \| Mann Patel | Each package: Request a quote → `/contact/?package=<id>#brief` | Free check → `#check` |
| `/services/web-design/` | Toronto Small Business Web Design \| Mann Patel | Request a quote → `?package=website-launch#brief` | Free check; Website Care quote |
| `/services/local-visibility/` | Local SEO & Google Business Profile Setup in Toronto \| Mann Patel | Request a quote → `?package=local-visibility#brief` | Free check |
| `/services/enquiry-follow-up/` | Enquiry Automation & Online Booking in Toronto \| Mann Patel | Request a quote → `?package=website-enquiry#brief` | Free check |
| `/work/` | Toronto Small Business Website Projects \| Mann Patel | Open a case study | — |
| `/work/nest-and-rest-cleaning/` | Nest & Rest Cleaning Website Case Study \| Mann Patel | Visit the site (while `siteLive`) | Web design service |
| `/work/samp-hair-spa/` | Samp Hair & Spa Website Preview \| Mann Patel | — | Web design service |
| `/about/` | About Mann Patel \| Website Designer in Toronto | See the website projects | Free check |
| `/contact/` | Contact \| Mann Patel | Project brief or free check | Email, call, WhatsApp, text |

Contact pre-fill parameters are unchanged (`?package=`, `?service=`, `#brief`, `#check`), and so is
every anchor on `/services/` (`#found`, `#answered`, `#booked`, `#extras`, `#packages`, `#websites`,
`#seo`, `#enquiry-workflows`, `#social-content` and the rest; a test lists them).

## Checked on the day

| Report finding | What I found on 10 Nov 2026 | Result |
| --- | --- | --- |
| nestnrestcleaning.com returned a host 404 | At 10:36 the address loaded a working site | Link kept on. The switch stays, so an outage is one line (`siteLive: false`, then `npm run images`) |
| HTTP and www serve duplicate copies | `https://www.mannpatel.me/` returned a full copy of the home page with its canonical pointing at the apex | Confirmed. Needs two Cloudflare settings (below); the repository can't set them |
| Slashless addresses answer 307 | Cloudflare's static-asset handling redirects with 307 by design | Fixed in the build with `_redirects`; checked in a local Cloudflare runtime (below) |
| GA4 sender inactive | The code is complete and off because the build variable `PUBLIC_GA4_ID` is not set | Unit-tested; needs Mann's measurement ID |

**To confirm, Mann:** the live Nest & Rest page I fetched shows "Book" buttons, a first price of
$110 and no "Opening soon" notice. This site's case study, About page and business description
still say the site is in "Opening soon" mode, shows $116 and opens for bookings in summer 2027
(captures dated 8 Nov 2026). I did not rewrite them: which is current is yours to say.

## Decisions I made

1. **Fold targets moved.** The explained process strip adds height, so "selected work starts by"
   moved from y=1100 to 1150 (desktop) and from 1450 to 1680 (phone). The hero now has a direct
   "See the work" button, and the phone strip is one compact row per step.
2. **Phone length budgets raised** for the added sections: Home 12.5 → 12.75 screens, Services
   13.5 → 14.75, web design 10.75 → 11.5, local SEO 9.5 → 10.75, enquiry 10.5 → 12.5, case studies
   7 → 7.25. The sprint is a closed row and the test log is five rows to limit this.
3. **Host redirects are not in the repository.** Static assets are served before the Worker runs,
   so www and HTTP can only be redirected in the Cloudflare dashboard.
4. **No `/services/brand-content/` page, no guide page, no chatbot mention.** Each waits for the
   evidence the master prompt asks for (below).
5. **Page-head size.** The longer, descriptive H1s use a smaller "compact" page head.

## Not built yet, and what each needs

| Item | Needs |
| --- | --- |
| `/services/brand-content/` | Owner-approved original samples to show: one brief, the hook, the finished post or Reel, and the call to action |
| The guide `/guides/toronto-small-business-website-checklist/` | First-hand examples that match the live sites. A draft is in `docs/drafts/` (not built, not in the sitemap); the Nest & Rest facts above must be settled first |
| FAQ chatbot pilot | Approved questions and answers, a human fallback, a versioned source, monitoring, an off switch, and a passed test log |
| A real local SEO or automation case study | A client's permission and dated evidence |
| Public prices | Mann's approved figures in `src/data/packages.ts` (the report's ranges are internal and are not in this repository) |

## Redirects

**In the build (done).** `npm run build:cloudflare` writes `dist/client/_redirects`: one line per
built page, for example `/services /services/ 301`. Cloudflare applies this file before its own
static-asset handling. The launch check fails the build if a sitemap page has no line, or if any
line touches `/api/`.

Checked in a local Cloudflare runtime (`npx wrangler dev` on the production build):

| Request | Answer |
| --- | --- |
| `/services` | 301 → `/services/` |
| `/contact?package=check-up` | 301 → `/contact/?package=check-up` (query kept) |
| `/services/web-design?x=1&y=2` | 301 → `/services/web-design/?x=1&y=2` |
| `/services/` | 200 |
| `/this-does-not-exist/` | 404 (the real 404 page) |
| `/api/enquiry/` | 200 (untouched) |
| `/_redirects` | 404 (the file itself is not served) |

**In Cloudflare (Mann, about five minutes).** Dashboard → mannpatel.me:

1. **SSL/TLS → Edge Certificates → Always Use HTTPS: On.** Sends `http://` to `https://` with a 301.
2. **Rules → Redirect Rules → Create rule**, using Cloudflare's "Redirect from WWW to root" example:
   wildcard pattern, request URL `https://www.*`, target URL `https://${1}`, status **301**,
   **Preserve query string** on. Keep `www.mannpatel.me` in `wrangler.jsonc` so the DNS record and
   certificate stay.

Then test from any computer (expected results on the right):

```
curl -sI http://mannpatel.me/                               # 301 → https://mannpatel.me/
curl -sI http://www.mannpatel.me/                           # 301 → https://www.mannpatel.me/ → 301 → https://mannpatel.me/
curl -sI https://www.mannpatel.me/services/web-design/      # 301 → https://mannpatel.me/services/web-design/
curl -sI "https://www.mannpatel.me/contact/?package=check-up"   # 301, query string kept
curl -sI https://mannpatel.me/services                      # 301 → /services/
curl -sI https://mannpatel.me/services/                     # 200
curl -sI https://mannpatel.me/not-a-real-page/              # 404
```

## Analytics (GA4)

The code was already complete (`src/scripts/analytics.ts`, `src/components/Analytics.astro`); the
event plan is in `docs/05-launch-and-integrations.md` §2. It stays off, with no banner and no
request to Google, until the build variable is set:

- **Name:** `PUBLIC_GA4_ID` (for example `G-XXXXXXXXXX`)
- **Where:** Cloudflare → Workers & Pages → mann-patel-website → Settings → Build → Variables and secrets, then redeploy
- **What it sends, after "Allow" only:** `generate_lead` once per accepted form (`form_id`
  `project_brief` or `free_check`); `contact_click`, `cta_click` and `select_content` as separate
  click events. Never anything typed into a form.

New unit tests (`tests/unit/analytics.test.ts`) cover: off without an ID; nothing before a choice
or after "No thanks"; one `generate_lead` per lead id; clicks never counted as leads.

## Checks run

- `npm run build`, `astro check` (0 errors)
- Unit tests: 72 passed (was 64): service-page copy rules and the analytics wrapper are new
- End-to-end tests: 117 passed (was 111): the new hero, the process strip, the copy map, structured
  data, the services overview order and anchors, the sprint, the service-page sections, the proof
  switch in both states, analytics off, plus every earlier test (axe on every page, no sideways
  scrolling at 320–1440 px, keyboard, reduced motion, both forms end to end with local delivery)
- `npm run build:cloudflare`: the launch check passes with 0 errors (15 pages; one H1, unique
  titles and descriptions; self-canonical sitemap pages; redirects cover the sitemap)

Not checked from here: the live site's HTTP responses (this workspace cannot reach mannpatel.me
directly), PageSpeed after the change, Search Console, and real inbox delivery.

## Release checklist (Mann)

1. Review the pull request and the screenshots. Confirm the Nest & Rest facts above.
2. Merge. Cloudflare builds and deploys; the slash redirects go live with it.
3. In Cloudflare: Always Use HTTPS, and the www redirect rule. Run the `curl` list.
4. Send one real test through each form (project brief and free check) and confirm it reaches the inbox.
5. Set `PUBLIC_GA4_ID` when the GA4 property exists; allow analytics in a browser, send a test brief,
   and confirm one `generate_lead` in GA4 DebugView.
6. Search Console: verify the property, submit `https://mannpatel.me/sitemap.xml`, inspect Home and
   the three service pages. Connect Windsor.ai for the 28-day comparison once data exists.
7. Update the LinkedIn, Instagram and WhatsApp profile links after steps 3 and 4 pass.
8. Log impressions and clicks by page, qualified enquiries by source, proposals and hours.

## Rollback

Revert the merge commit of this branch. To undo only the redirects, delete the `_redirects` block
in `scripts/build-cloudflare.mjs` and its check in `scripts/prelaunch-check.mjs`.
