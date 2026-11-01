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
| Resend email adapter (owner notification + optional acknowledgement) | Implemented, unit tested with a mocked API | **Not connected: no API key was available.** Verify with a live test (below) before launch. |
| Webhook adapter (e.g. Google Sheet via Apps Script) | Implemented, unit tested (HMAC signature) | Not connected |
| Logs | Implemented | Event name, lead id, services, channels only. Never names, emails or message text. |

### Connecting email delivery (Owner action, about 30 minutes)

**Decision (31 Oct 2026):** Resend email delivery (`ENQUIRY_DELIVERY=resend`), as named on the Privacy page. Verify `mannpatel.me` as the sending domain.

1. Create a Resend account in Mann's name. Add and verify the sending domain (DNS records shown by Resend; follow its current docs). Until a domain is verified, Resend only allows test sends.
2. In Cloudflare, add the secrets listed in §4 step 4 (`RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL`, `FORM_TOKEN_SECRET`). `ENQUIRY_DELIVERY=resend` is already in `wrangler.jsonc`. Resend can add its DNS records to Cloudflare for you when you verify `mannpatel.me`.
3. **Live test with sample data:** set `ENQUIRY_TO_EMAIL` to your own inbox, deploy, submit the form with the name "Test Owner", and confirm: (a) success screen shows a reference id; (b) the owner email arrives, Reply-To is the visitor's address (this also confirms the API's `reply_to` field); (c) the acknowledgement arrives if enabled. Resend's dashboard shows each email's status.
4. Optional durable record (not used at launch; if you add it, update the Privacy page to name Google as a processor): create a Google Sheet + Apps Script web app that appends rows, set `ENQUIRY_WEBHOOK_URL` and `ENQUIRY_WEBHOOK_SECRET`; verify the `X-Signature` HMAC in the script. With both set, an enquiry is accepted if *either* channel accepts it.

**Monitoring:** each week, compare Resend's log with the inbox; check spam folders after DNS changes; submit one test enquiry a month (maintenance checklist). If a send fails, the visitor sees an error and can retry. Nothing is silently lost.

**Retries:** one automatic retry after 400 ms on network errors, 5xx or 429; Resend's `Idempotency-Key` (`<lead id>-owner`) prevents double emails from that retry.

**CASL note:** the acknowledgement is a direct reply to the visitor's request, not marketing. There is no marketing list. If one is added, it needs a separate, unticked opt-in. This is not legal advice.

## 2 · Analytics (GA4)

**Status:** code implemented, **off** (no `PUBLIC_GA4_ID`). Nothing loads, and there is no banner, until the ID is set.

| Event | When | Parameters | Notes |
| --- | --- | --- | --- |
| `page_view` | automatic | — | Covers case-study views |
| `generate_lead` (recommended) | after the server **accepts** a brief | `form_id: project_brief`, `lead_source: website`, `service_count`, `starting_point` | Fired once per lead id (sessionStorage guard). Never contains names, emails or message text. |
| `select_content` (recommended) | guide recommendation shown | `content_type: service_guide_result`, `content_id: <package>` | |
| `select_content` | first interaction with the workflow demo | `content_type: workflow_demo` | |
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
2. Submit `https://mannpatel.me/sitemap-index.xml`.
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
4. **Add the form's secrets:** *Workers & Pages* → `mann-patel-website` → *Settings* → *Variables and Secrets* → *Add*, choosing type **Secret** for each (secrets survive every deploy; plain-text variables added in the dashboard are replaced by `wrangler.jsonc` on the next deploy):
   - `RESEND_API_KEY`: from Resend (§1)
   - `ENQUIRY_TO_EMAIL`: the inbox that receives enquiries
   - `ENQUIRY_FROM_EMAIL`: e.g. `Mann Patel <hello@mannpatel.me>` (domain verified in Resend)
   - `FORM_TOKEN_SECRET`: a random string of 32+ characters (e.g. from a password manager's generator)

   `ENQUIRY_DELIVERY=resend` is already set in `wrangler.jsonc`. To send visitors an automatic "we got your brief" email, change `ENQUIRY_ACKNOWLEDGE` there to `"true"`.
5. **Test:** open https://mannpatel.me/contact/, send a brief with the name "Test Owner", and check it arrives (and that Reply goes to the visitor's address).
6. *(Recommended)* *Settings* → *Build* → turn off builds for non-production branches, so only your main branch is published.
7. *(Optional)* Redirect `www` to the bare domain: domain → *Rules* → *Redirect Rules* → template "Redirect from WWW to root". Canonical tags already point to `https://mannpatel.me`.
8. *(Optional, free)* Receive mail at `hello@mannpatel.me`: domain → *Email* → *Email Routing* → forward it to your Gmail.

Every later push to the main branch rebuilds and redeploys automatically. Production builds **fail on purpose** if a "To confirm" note reappears or a page breaks (see `scripts/prelaunch-check.mjs`); the secrets can't be seen during a build, so the check lists them as warnings.

**Deploy from your own computer instead (optional):** `npx wrangler login`, then `npm run deploy:cloudflare`.

**Rollback:** *Workers & Pages* → `mann-patel-website` → *Deployments* → pick the last good version → *Rollback* (instant). In git, `git revert <commit>` and push.

## 5 · Recurring costs (estimates; verify current pricing)

| Item | Cost | Needed? |
| --- | --- | --- |
| Domain (mannpatel.me) | yearly renewal, set by your registrar | Yes (already owned) |
| Cloudflare Workers Free | $0 (100,000 form/Worker requests a day; static pages don't count) | Yes |
| Cloudflare Email Routing | free | Optional, to receive mail at `hello@mannpatel.me` |
| Resend Free | $0 for 3,000 emails/month, 100/day; Pro $20/mo | Yes, for email delivery |
| Business email (e.g. Google Workspace) | per user per month, set by Google | Recommended for a professional address |
| Cloudflare Turnstile | free tier | Optional |
| GA4 / Search Console | free | Optional / recommended |

## 6 · Local development

See `README.md`. Quick version: `npm install`, `cp .env.example .env`, `npm run dev`. Enquiries go to `.data/enquiries.jsonl` in file mode.
