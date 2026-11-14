# 05 · Launch, integrations and operations

Status key: **Implemented** (in code, tested) · **Owner action** (needs Mann's account, domain or decision) · **Optional later**.

## 1 · Enquiry pipeline

```
Browser form ──► GET /api/enquiry/  → { connected, token }      (status + signed time token)
     │
     └─► POST /api/enquiry/ (JSON, or form-encoded without JS)
            1. honeypot ............................ 400 spam
            2. validation (same rules as browser) .. 400 + field errors
            3. ≤ 3 links in message ................ 400
            4. Turnstile (if keys set) ............. 400
            5. time token: < 3 s → 400 too_fast · > 2 h → 400 expired · missing → accepted, flagged lowTrust
            6. duplicate (submission id or same email+message within 24 h) → 200 { duplicate: true }, nothing re-sent
            7. rate limit: 5 / 10 min and 20 / day per IP hash → 429 + Retry-After
            8. delivery configured? no → 503 not_connected (honest message)
            9. deliver → accepted? 200 { id, acknowledgement } : 502 delivery_failed (retry allowed)
```

| Item | Status | Notes |
| --- | --- | --- |
| Client + server validation (shared rules) | Implemented, unit + e2e tested | `src/lib/enquiry/validate.ts` |
| Spam protection: honeypot, signed time token, link limit | Implemented, tested | `src/lib/enquiry/spam.ts` |
| Cloudflare Turnstile | Implemented, **untested against Cloudflare** (no keys) | Set both keys to enable |
| Request limits + duplicate protection | Implemented, tested | In-memory per server instance. On serverless hosts each instance has its own memory, so limits are best-effort. Add Turnstile or host rate-limit rules if spam appears. |
| Loading state, preserved input on failure, accessible errors | Implemented, e2e tested | Error summary for 2+ errors; focus moves to the problem |
| Success only after acceptance | Implemented, e2e tested | Success means *the provider accepted it*, not that it reached an inbox |
| No-JavaScript path | Implemented, e2e tested | Posts the form, redirects to `/contact/received/`; errors render a plain page |
| Local test adapter (`ENQUIRY_DELIVERY=file`) | Implemented, tested | Writes `.data/enquiries.jsonl`; **refused in production** |
| **Cloudflare Email adapter (production, since 1 Nov 2026)**: owner notification through the Worker's `send_email` binding | Implemented; unit tested; **verified end to end in `wrangler dev`** (the brief arrived as a readable email with Reply-To = visitor) | Goes live once Email Routing is on and `ENQUIRY_TO_EMAIL` is set (below) |
| Resend email adapter (owner notification + optional acknowledgement) | Implemented, unit tested with a mocked API | Kept as an alternative; not used |
| Webhook adapter (e.g. Google Sheet via Apps Script) | Implemented, unit tested (HMAC signature) | Not connected |
| Logs | Implemented | Event name, lead id, services, channels only. Never names, emails or message text. |

### Connecting email delivery (Owner action, about 10 minutes)

**Decision (1 Nov 2026):** Cloudflare Email (`ENQUIRY_DELIVERY=cloudflare`, set in `wrangler.jsonc`). No extra account or API key: the Worker sends each brief from `website@mannpatel.me` to your inbox, with Reply-To set to the visitor, so you just press Reply.

1. **Turn on Email Routing** for mannpatel.me: Cloudflare dashboard → `mannpatel.me` → *Email* → *Email Routing* → *Get started*, and let Cloudflare add its DNS records.
2. **Add your inbox as a destination address** (*Email Routing* → *Destination addresses*) and click the link in the verification email Cloudflare sends you. The Worker can only send to verified destination addresses.
3. **Create `info@mannpatel.me`** (*Email Routing* → *Routing rules* → *Create address*: `info` → *Send to an email* → your verified inbox). The site shows `info@mannpatel.me` everywhere.
4. **Tell the Worker where to send briefs:** *Workers & Pages* → `mann-patel-website` → *Settings* → *Variables and Secrets* → *Add* → type **Secret**, name `ENQUIRY_TO_EMAIL`, value = the verified inbox from step 2. (`keep_vars` in `wrangler.jsonc` keeps dashboard values across deploys.)
5. **Live test with sample data:** open https://mannpatel.me/contact/ (the "not connected" notice must be gone), send a brief named "Test Owner", and confirm: (a) the success screen shows a reference id; (b) the email "New enquiry: Test Owner" arrives; (c) pressing Reply addresses the visitor's email.
6. **Critical-path check (round 10), both forms in one go:** from this repository on your computer run
   `npm run check:enquiry -- https://mannpatel.me` (readiness only, sends nothing), then
   `npm run check:enquiry -- https://mannpatel.me --send --reply-to you@yourdomain.ca` (an address you own). It sends one
   free-check request and one project brief, both marked **[Delivery test]**, and prints a reference for each. Then look
   for both emails in the inbox: that, not the script, is the proof of delivery. Repeat after any change to Email
   Routing, the secret or the form, and once a month (Website Care does the same for clients).

**What each state means (shown to visitors and in the script):**

| State | Meaning | What the visitor sees |
| --- | --- | --- |
| Not connected | Readiness says `connected: false` (e.g. `ENQUIRY_TO_EMAIL` missing) | A notice, "Email this brief" (opens their email app) and "Copy my brief"; nothing is claimed as sent |
| Rejected | The website refused it (missing fields, too fast, honeypot, too many links, rate limit) | The reason next to the field or above the form; their answers stay |
| Accepted | The website validated it and Cloudflare's email service accepted it for delivery | "Accepted… Your brief is on its way. The website accepted it and the email service took it for delivery to my inbox." (never "delivered") |
| Received | The email is in the inbox | Only you can confirm this, by seeing it |
| Delivery failed | Cloudflare refused the send (logged as `enquiry_delivery_failed` in *Observability*) | An error with their answers kept, a retry and the email fallback; never a success screen |
| Lost after acceptance | Rare (e.g. a bounce or a spam filter); the website can't see it | Nothing different: only the critical-path check or a missing email reveals it |

Optional durable record: a Google Sheet + Apps Script web app (`ENQUIRY_WEBHOOK_URL`, `ENQUIRY_WEBHOOK_SECRET`). With both set, an enquiry is accepted if *either* channel accepts it. If you add it, name Google Sheets on the Privacy page.

**Monitoring:** check the spam folder after DNS changes; submit one test enquiry a month (maintenance checklist); *Workers & Pages → mann-patel-website → Observability* shows `enquiry_accepted` / `enquiry_delivery_failed` events (ids only, no personal data). If a send fails, the visitor sees an error and can retry or email you. Nothing is silently lost.

**Retries:** one automatic retry after 400 ms if Cloudflare rejects the send.

**No visitor acknowledgement:** Cloudflare Email only sends to *your* verified addresses, so visitors don't get an automatic "we got it" email; the success screen and your reply cover that. (Switch to Resend if you ever want automatic acknowledgements.)

**CASL note:** the acknowledgement is a direct reply to the visitor's request, not marketing. There is no marketing list. If one is added, it needs a separate, unticked opt-in. This is not legal advice.

## 2 · Analytics (GA4)

**Status:** code implemented, **off** (no `PUBLIC_GA4_ID`). Nothing loads, and there is no banner, until the ID is set.

| Event | When | Parameters | Notes |
| --- | --- | --- | --- |
| `page_view` | automatic | — | Covers case-study views |
| `generate_lead` (recommended) | only after the server **accepts** a brief or a free-check request | `form_id: project_brief` or `free_check`, `lead_source: website`, `service_count`, `starting_point` | Fired once per lead id (sessionStorage guard). Never contains names, emails or message text. This is the only lead event. |
| `email_app_launch` (custom) | the visitor presses “Email this brief / request” while direct sending is off | `form_id` | Opening an email app is **not** a lead: nothing has been sent yet (round 7). |
| `cta_click` (custom) | click on a link to the contact page | `cta: start_project` or `free_check`, `location` (header, footer or section id) | A click, not a qualified lead. |
| `select_content` | click on a link to a case study | `content_type: project`, `content_id`, `location` | Case-study page views are also counted by `page_view`. |
| `select_content` (recommended) | guide recommendation shown | `content_type: service_guide_result`, `content_id: <package>` | |
| `select_content` | first step chosen in the labelled walkthrough (home and /services/enquiry-follow-up/, round 10) | `content_type: workflow_demo` | Fictional data only. |
| `tune_in` (custom) | the hero tuner is tuned back onto 104.3 by the visitor | `method: drag` or `keyboard` | Since round 10 the portrait starts clear and never tunes itself, so this counts people who played with the dial. Nothing else is sent. |
| `contact_click` (custom) | click on email/phone/WhatsApp links | `method` | Only once these contact details exist |
| outbound clicks (e.g. Nest & Rest) | Enhanced measurement | — | Turn **off** Enhanced Measurement "form interactions", to avoid double-counting forms |
| booking events | **not used** | — | There is no real booking system |

**Consent:** GA loads only after "Allow" (stored in localStorage), with Google Consent Mode defaults denying all advertising storage. **Verify:** GA4 → Admin → DebugView with the GA Debugger extension; submit a test brief; confirm one `generate_lead`. Then mark `generate_lead` as a key event.

## 3 · SEO

| Item | Status |
| --- | --- |
| Unique titles and descriptions, one H1 per page, descriptive link text, image alt text | Implemented, tested |
| Canonical URLs (from `PUBLIC_SITE_URL`) | Implemented; only rendered once the real URL is set |
| `robots.txt` + `<meta name="robots">` | Previews: `Disallow: /` + `noindex`. Production with `SITE_INDEXING=true`: allow + sitemap. Verified with a test build. |
| Sitemap (`@astrojs/sitemap`) | Generated only for indexing builds; excludes the API, 404 and confirmation page |
| Structured data | `ProfilePage`/`AboutPage` + `Person` (verified facts only, `worksFor` Nest & Rest), `FAQPage` (confirmed answers only), `BreadcrumbList` on case studies. No ratings, address or awards. |
| Open Graph image | `public/og/default.png` (regenerate with `npm run images`) |
| Performance | See `docs/06-qa-report.md` |

### Search Console plan (Owner action)

1. Add a **Domain property** for `mannpatel.me` and verify it with the DNS TXT record (covers http/https and all subdomains). Keep the record in place permanently.
2. Submit `https://mannpatel.me/sitemap.xml`.
3. After a few days, check Pages (indexing) and Performance. Don't claim verification is done until Search Console shows "Ownership verified".

### Google Business Profile

Mann's digital-services work probably **doesn't qualify** for a Business Profile. Google's guidelines require in-person contact with customers during stated hours (a storefront, or travelling to customers), and they exclude virtual offices. Remote digital services usually don't meet that. Do **not** reuse Nest & Rest's profile or identity for this work. Nest & Rest itself (a service-area business) *is* a good candidate for its own profile, with the home address hidden.

## 4 · Hosting and deployment: Cloudflare Workers (decided 1 Nov 2026)

The site runs on **Cloudflare Workers** (free plan): the pages are static files, and only the project-brief form (`/api/enquiry/`) runs as Worker code. Settings live in `wrangler.jsonc`; the production build is `npm run build:cloudflare` (it sets `SITE_MODE=production`, `PUBLIC_SITE_URL=https://mannpatel.me`, `SITE_INDEXING=true`, builds, then runs the pre-launch check). Response headers are in `public/_headers`.

**Owner actions, in this order** (dashboard names as of Nov 2026; Cloudflare renames things now and then):

1. **Put mannpatel.me on Cloudflare.** If you bought it through Cloudflare Registrar, it's already there. Otherwise: Cloudflare dashboard → *Add a domain* → `mannpatel.me` → Free plan → Cloudflare shows two nameservers → at the company you bought the domain from, replace its nameservers with those two. Wait until Cloudflare shows the domain as **Active** (usually minutes, up to 24 hours). Turn on auto-renew at your registrar.
2. **Merge pull request #1** on GitHub, so your main branch has the Cloudflare setup.
3. **Create the Worker from GitHub:** *Workers & Pages* → *Create* → *Import a repository* → connect GitHub → pick `Mann-Patel-Personal-Profile-Website`. Use:
   - Project name: **`mann-patel-website`** (must match `name` in `wrangler.jsonc`)
   - Production branch: your main branch (`ccr-96e3375f-xynmc5`)
   - Build command: **`npm run build:cloudflare`**
   - Deploy command: **`npx wrangler deploy`**
   - No build variables are needed.

   Save and deploy. The first deploy also connects **mannpatel.me** and **www.mannpatel.me** (from `routes` in `wrangler.jsonc`); Cloudflare creates the DNS records and HTTPS certificates. If the deploy says the domain can't be found, step 1 isn't finished yet: wait for **Active** and retry.
4. **Connect the form:** follow §1 *Connecting email delivery* (Email Routing on, verified inbox, `info@` address, Secret `ENQUIRY_TO_EMAIL`). `ENQUIRY_DELIVERY=cloudflare`, the sender `website@mannpatel.me` and the `send_email` binding are already in `wrangler.jsonc`. *(Optional)* Secret `FORM_TOKEN_SECRET` (32+ random characters) keeps spam-check tokens valid across deploys; without it each build makes its own.
5. **Call / WhatsApp / Text buttons:** live since 9 Nov 2026. The number is stored encoded in `src/data/site.ts` (`profile.contact.phoneKey`). Since 14 Nov 2026 (SEO audit, Mann's decision) the site shows it **in full** as a tap-to-call link in the footer and on /contact/, and the business structured data lists it, so it matches Google Business Profile and directory listings; the buttons get their links from a small script. To change the number without a code change, add the **build variable** `PUBLIC_CONTACT_PHONE` (*Settings* → *Build* → *Variables and secrets*), which overrides it. WhatsApp must be set up on that number.
6. **Test:** send a brief named "Test Owner" (see §1 step 5) and tap Call / WhatsApp / Text on a phone.
7. *(Recommended)* *Settings* → *Build* → turn off builds for non-production branches, so only your main branch is published.
8. *(Optional)* Redirect `www` to the bare domain: domain → *Rules* → *Redirect Rules* → template "Redirect from WWW to root". Canonical tags already point to `https://mannpatel.me`.

Every later push to the main branch rebuilds and redeploys automatically. Production builds **fail on purpose** if a "To confirm" note reappears or a page breaks (see `scripts/prelaunch-check.mjs`); the secrets can't be seen during a build, so the check lists them as warnings.

**Deploy from your own computer instead (optional):** `npx wrangler login`, then `npm run deploy:cloudflare`.

**Rollback:** *Workers & Pages* → `mann-patel-website` → *Deployments* → pick the last good version → *Rollback* (instant). In git, `git revert <commit>` and push.

## 5 · Recurring costs (estimates; verify current pricing)

| Item | Cost | Needed? |
| --- | --- | --- |
| Domain (mannpatel.me) | yearly renewal, set by your registrar | Yes (already owned) |
| Cloudflare Workers Free | $0 (100,000 form/Worker requests a day; static pages don't count) | Yes |
| Cloudflare Email Routing + Email Workers | free | Yes: `info@mannpatel.me` and form delivery |
| Resend | not needed (alternative only) | No |
| Business email (e.g. Google Workspace) | per user per month, set by Google | Recommended for a professional address |
| Cloudflare Turnstile | free tier | Optional |
| GA4 / Search Console | free | Optional / recommended |

## 6 · Local development

See `README.md`. Quick version: `npm install`, `cp .env.example .env`, `npm run dev`. Enquiries go to `.data/enquiries.jsonl` in file mode.
