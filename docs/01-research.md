# 01 · Research notes

**Access date for every source below: 31 October 2026.**
**Purpose:** a curated study of sites that do one thing well that is relevant to Mann's audience — busy small-business owners in Toronto/GTA. It is not a ranking of "the best websites".

## How the references were inspected

| Method | What it gives | Limits |
| --- | --- | --- |
| Firecrawl headless render, screenshot at **1440×900** (desktop, first viewport) | What a visitor sees on arrival | One viewport only; no scroll, hover or animation |
| Firecrawl mobile render, screenshot at **360×800** | Phone first viewport | Same as above |
| Firecrawl "query" extraction | An LLM summary of page text/structure | Text-only. It can miss client-rendered content (it returned nothing for brittanychiang.com and lynnandtonic.com, so those notes rely on the screenshots) |

**No interactions were tested on third-party sites** (no clicking, scrolling, hovering or form submission). Statements about motion are marked *inferred* when they come from a static frame. Direct requests from this container to most external hosts are blocked by the egress policy, so all third-party inspection went through Firecrawl. Captures are kept in the private scratchpad, not in this public repository.

## The references

| # | Site | URL | Why it was chosen | Captures |
| --- | --- | --- | --- | --- |
| 1 | Dennis Snellenberg | https://dennissnellenberg.com/ | Personal identity + selected work + contact (given in brief) | Desktop, mobile |
| 2 | Brittany Chiang | https://brittanychiang.com/ | Scannable biography and experience (brief) | Desktop, mobile |
| 3 | Bruno Simon | https://bruno-simon.com/ | Capability shown through interaction (brief) | Desktop (rendered black — see notes) |
| 4 | Adham Dannaway | https://www.adhamdannaway.com/ | Two capabilities under one identity (brief) | Desktop |
| 5 | Josh W. Comeau | https://www.joshwcomeau.com/ | Expertise through teaching (brief) | Desktop |
| 6 | Solo Web Design | https://www.solowebsites.ca/ | Toronto solo freelancer selling to small businesses | Desktop, mobile |
| 7 | BridgeWeb | https://www.bridgeweb.ca/ | Toronto small studio; strong ownership/FAQ copy | Desktop |
| 8 | Designjoy | https://www.designjoy.co/ | Solo operator with a very clear productised offer | Desktop, mobile |
| 9 | Justin Jackson | https://justinjackson.ca/ | Founder personal site linking his business from line one | Desktop |
| 10 | Lynn Fisher | https://lynnandtonic.com/ | Award-recognised personal site with a distinctive typographic identity | Desktop |

Discovery: refs 6–7 came from a web search for Toronto small-business web designers; ref 10 is a long-running award-gallery favourite. Each was then inspected directly.

### Observations

1. **Dennis Snellenberg** — Full-bleed portrait on grey, a giant name set as a band across the lower half (cropped as "…ellenberg — Den…", *inferred* to be a scrolling marquee), role line "Freelance Designer & Developer", a "Located in the Netherlands" pill, three-item nav (Work, About, Contact). Work is a list with role and year. On mobile the nav becomes "Menu" and the portrait/name stack holds up well.
2. **Brittany Chiang** — Two columns: a sticky left column (name, title, one-line value statement, in-page nav About / Experience / Projects with an active marker, social icons) and a scrolling right column. Experience entries use identical fields: date range · title · company ↗ · description · tech tags. Mobile collapses to one column and drops the in-page nav.
3. **Bruno Simon** — A WebGL driving world. The headless capture rendered a **black canvas**; the only extractable text was "Interact", "Unstuck" and a map graphic. *Lesson:* when the experience is the content, anything that cannot run WebGL (bots, low-power devices, some assistive tech) gets nothing.
4. **Adham Dannaway** — A split portrait: "designer" (painted half) vs "<coder>" (photo half), each with one plain sentence. Nav: about, learn, portfolio, blog, contact. "Some of my latest work" cards below.
5. **Josh W. Comeau** — A playful 3D mascot and rainbow arcs, then "Articles and tutorials", "Browse by category" chips and a numbered "Popular content" list. The header has search, a sound toggle (opt-in), theme toggle and RSS. Personality comes from illustration and friendly copy, but the content is the product.
6. **Solo Web Design** (Toronto) — Hero "Websites That Work Harder Than You Do" + "GET A FREE ESTIMATE". "How it works": Quick call → I build or improve your site → You get more leads. Testimonials as first name + initial + business. Portfolio labelled by industry (plumber, dentist, yoga studio…). The form asks first/last name, email, phone, URL, project, how you heard. **Mobile issues observed at 360 px:** the horizontal nav overflows off-screen, and a stock portrait fills the first viewport so the headline is not visible on arrival.
7. **BridgeWeb** (Toronto) — Very strong trust copy: "you own everything when the invoice is paid: the site, the design, the code, the domain and the hosting account", "fixed price in writing before any work starts", realistic timelines by project type, and an FAQ on cost, ownership and what happens after launch. **But** the desktop first viewport is crowded: a cookie dialog, a floating call-request form, a chat widget and an animated headline all compete.
8. **Designjoy** — "Design subscriptions for everyone / Pause or cancel anytime". A three-step process (Subscribe → Request → Receive), one pricing card with a plain "what's included" list, "Book a 15-min intro call", a long FAQ, and transparency that it is "run entirely by Brett". **Mobile issue observed:** at 360 px the word "subscriptions" in the hero is clipped at the right edge.
9. **Justin Jackson** — "Hi, I'm Justin Jackson. I co-founded Transistor.fm…" — the business is linked inline in the first sentence. Halftone portrait, monospace, brutalist texture. The newsletter promise is specific ("Sent on Saturday mornings. Read it while you drink your coffee").
10. **Lynn Fisher** — Version-numbered annual redesign ("v.XIX"), a centred serif wordmark, a table-of-contents nav with dotted leaders and roman numerals. The identity is almost entirely typographic and instantly memorable.

## Reference matrix

| Ref | Positioning | Typography | Layout | Colour | Storytelling | Service clarity | Proof | Navigation | Motion | Mobile | Enquiry flow |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Snellenberg | Role + location | Huge grotesk name | Full-bleed portrait | Neutral grey + white | Implied, minimal | Low (role only) | Named projects + year | 3 links | Marquee (*inferred*) | Good | Contact page |
| Chiang | Title + one line | Clean sans, small caps labels | Sticky 2-column | Dark navy + teal tags | Short first-person bio | n/a (employee) | Employers, projects | In-page, active state | Subtle (*not observed*) | Good, simplified | Email/socials |
| Bruno Simon | Creative technologist | n/a in capture | 3D world | n/a | The world *is* the story | n/a | The build itself | In-world | Heavy WebGL | Not verified | Not visible |
| Dannaway | Designer + coder | Bold sans | Split hero | Black/white + paint | Visual metaphor | Two clear sentences | Work cards | 5 links + socials | None observed | Not captured | Contact page |
| Comeau | Teacher | Friendly sans | Content list + sidebar | Sky blue + magenta | Mascot, warm voice | Courses separate | The tutorials | Categories, search | Playful (*inferred*) | Not captured | Newsletter |
| Solo Web Design | Local, lead-focused | Serif-ish heading, caps buttons | Template sections | Navy + yellow | Owner-to-owner | Medium (in prose) | Testimonials, industry list | Horizontal links | None observed | **Nav overflow, headline hidden** | Free estimate form |
| BridgeWeb | Local studio since 2006 | Mixed | Dense, many blocks | Many colours | Weak | High but overwhelming | Logos, reviews, FAQ | Mega menus | Animated headline | Not captured | Call, chat, WhatsApp, form |
| Designjoy | Productised solo service | Large grotesk + italic accent | Big type, cards | Pale lilac + gradient cards | Founder transparency | **Very high** | Logos, quotes | 3 actions | Gradient cards | **Hero clipped** | Book call / subscribe |
| Justin Jackson | Founder + writer | Monospace | Single column | Black/white + blue links | First-person founder | n/a | His company | 5 links | None observed | Not captured | Newsletter |
| Lynn Fisher | Designer for the web | Editorial serif | Centred contents | Warm paper + ink | Annual reinvention | n/a | Archive | Table of contents | Not observed | Not captured | Not on home |

## Principles to adapt (and their tradeoffs)

| From | Principle Mann's site adapts | Why it fits busy owners | Tradeoff |
| --- | --- | --- | --- |
| Solo Web Design, Designjoy | **Say who you help and the outcome in the first viewport, in plain words.** | Owners decide in seconds whether you're "for them". | Less room for an artistic hero; distinctiveness has to come from typography and layout, not a mystery. |
| Justin Jackson | **Name the founder link in the first lines** ("founder of Nest & Rest Cleaning"). | A real operating business is Mann's most credible proof. | Cleaning visitors may land here; needs an obvious "Looking for cleaning?" exit. |
| Designjoy, Solo Web Design | **Explain the process as 3–4 named steps**, adding *what the owner provides* at each step. | Removes fear of the unknown and of hidden work. | Steps must stay true to real practice; no promised turnaround until Mann confirms one. |
| BridgeWeb | **State ownership and scope in writing**: "Your domain, accounts and files are in your name." | Owners have been burned by agencies holding sites hostage. | Commits Mann to a handover routine (documented in the services doc). |
| Chiang | **Use consistent fields for every work entry** (status · type · what was delivered). | Fast scanning; honest status labels. | Fewer chances for expressive layouts per project. |
| Bruno Simon (counter-example) | **Demonstrate capability through interaction, never gate content behind it.** | A workflow demo shows "follow-up" better than any paragraph. | Each demo needs a static fallback, which takes extra work. |
| Comeau | **Teach in small doses** — plain explanations of SPF/DKIM, GA4, Search Console inside the service pages. | Builds trust without shipping an empty blog. | No SEO benefit of a content library until Mann commits to writing. |
| Lynn Fisher, Snellenberg | **Own a typographic identity** (a strong display face and a personal mark) instead of stock photos. | Memorable without a portrait; nothing fake. | Typography-led pages need careful spacing to avoid feeling empty. |
| Solo Web Design, Designjoy (failures) | **Nothing may overflow at 360 px** — fluid type with a hard floor, collapsing nav. | Most owners will first see the site on a phone. | Display sizes must be tuned for the narrowest phone, not the desktop. |
| BridgeWeb (counter-example) | **One primary action per page; no chat widgets, pop-ups or auto-playing banners.** | Calm, credible, fast. | Fewer contact entry points; the form and contact block must be excellent. |

## Synthesis: the direction

An original, typography-led **"front desk"** site. Mann's work is everything a small business shows the public (website, Google listing, social posts) and the back-office routine that answers them (email, acknowledgements, follow-up). The visual language borrows from **work orders, receipts and stamps** — enquiry "tickets" that move through stages — expressed in warm paper, ink and a single stamp-orange accent. Nothing is copied from the references' compositions, text or assets.

## Nest & Rest Cleaning — evidence log

| Item | Finding | Source |
| --- | --- | --- |
| Live site (31 Oct 2026) | `https://nestnrestcleaning.com/` and `www.` both return GitHub Pages **404 "There isn't a GitHub Pages site here."** | Live fetch via Firecrawl, 31 Oct 2026 |
| Archived home page | Full capture dated **19 Oct 2026**: hero "We clean. You rest.", instant price estimator (service, home type, bedrooms, bathrooms), "Choose your time" booking flow, 6 services, "Five things happen at your door" standard, recurring pricing, founding-household offer, Scarborough/North York area pages with postal-code check, FAQ, sticky Call/Text/Book bar on mobile | Wayback Machine `web.archive.org/web/20261019123931/https://nestnrestcleaning.com/` |
| Vision page | "I started Nest & Rest…", "Today, I clean every home myself", signed **"Mann Patel, Founder & Owner"** | Firecrawl cache of `/vision/`, captured 24 Oct 2026 |
| Search index | Service pages (regular, deep, move-in/out, kitchen & bath, residence care, small office), area pages, booking page, guides | Firecrawl web search, 31 Oct 2026 |
| Prices | Changed between captures (e.g. regular clean "from $110" on 19 Oct vs "$175 one time" in a later snippet) | Not used on the personal site |
| Who built the site, and how | **Not established.** Mann owns the GitHub repository (`mannp6903/nestnrestcleaning`, private); page metadata suggests AI-assisted generation. Role wording on the case study is marked *to confirm*. | GitHub repo list; page metadata |

The case study uses the two archived captures (desktop 1440 px and mobile 360 px), labelled with their source and date.

## Official guidance checked (31 Oct 2026)

| Topic | What was confirmed | Source |
| --- | --- | --- |
| Core Web Vitals | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, assessed at the 75th percentile (page last updated 31 Oct 2024) | https://web.dev/articles/vitals |
| Search Console verification | Domain property: DNS record only. URL-prefix: HTML file, HTML tag, GA, GTM, Sites/Blogger. Verification must stay in place. | https://support.google.com/webmasters/answer/9008080 |
| GA4 recommended events | `generate_lead` ("when a user submits a form or a request for information"), `select_content`, lead lifecycle events (`qualify_lead`, `working_lead`, `close_convert_lead`…) | https://support.google.com/analytics/answer/9267735 |
| Google Business Profile | Virtual offices are ineligible; co-working offices need signage, staff and customers during hours; service-area businesses hide their address; names must match the real-world name | https://support.google.com/business/answer/3038177 |
| SEO starter guide | Link given in the brief; applied as: descriptive titles and descriptions, crawlable links, original copy, descriptive alt text, sitemap | https://developers.google.com/search/docs/fundamentals/seo-starter-guide (direct fetch blocked by the egress policy; principles applied from Google's published guide) |
| WCAG 2.2 | AA target; 2.5.8 Target Size (Minimum) is 24×24 CSS px — the site uses ≥44 px for primary controls | https://www.w3.org/WAI/WCAG22/quickref/ |
| Astro 7 | Vite 8, Rust compiler (strict HTML), `compressHTML: 'jsx'` default, `src/fetch.ts` reserved | https://docs.astro.build/en/guides/upgrade-to/v7/ |
| Astro 6 | Node ≥ 22.12, Zod 4, content layer (`src/content.config.ts`, loaders), `render(entry)` | https://docs.astro.build/en/guides/upgrade-to/v6/ |
| Vercel Hobby | "restricted to non-commercial personal use only" — a site that sells services is commercial | https://vercel.com/docs/limits/fair-use-guidelines |
| Netlify | Free plan $0, 300 credits/month, functions and custom domains included; sites pause when credits run out; Personal $9/mo | https://www.netlify.com/pricing/ |
| Resend | Free: 3,000 emails/month, 100/day, 3 domains; Pro $20/mo | https://resend.com/pricing |
| Social bio limits | No official page could be fetched. Third-party guides agree on Instagram 150; others conflict (Facebook intro ~101, WhatsApp About ~139). Bios are written under the most conservative figures; **check in-app before posting**. | Web search, multiple third-party guides |
