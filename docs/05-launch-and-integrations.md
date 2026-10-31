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

1. Create a Resend account in Mann's name. Add and verify the sending domain (DNS records shown by Resend; follow its current docs). Until a domain is verified, Resend only allows test sends.
2. In Netlify → Site configuration → Environment variables, set:
   `ENQUIRY_DELIVERY=resend`, `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL` (Mann's inbox), `ENQUIRY_FROM_EMAIL` (e.g. `Mann Patel <hello@yourdomain>`), `ENQUIRY_ACKNOWLEDGE=true` (optional), `FORM_TOKEN_SECRET` (`openssl rand -hex 32`).
3. **Live test with sample data:** set `ENQUIRY_TO_EMAIL` to your own inbox, deploy a branch deploy, submit the form with the name "Test Owner", and confirm: (a) success screen shows a reference id; (b) the owner email arrives, Reply-To is the visitor's address (this also confirms the API's `reply_to` field); (c) the acknowledgement arrives if enabled. Resend's dashboard shows each email's status.
4. Optional durable record: create a Google Sheet + Apps Script web app that appends rows, set `ENQUIRY_WEBHOOK_URL` and `ENQUIRY_WEBHOOK_SECRET`; verify the `X-Signature` HMAC in the script. With both set, an enquiry is accepted if *either* channel accepts it.

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

1. Add a **Domain property** for the final domain and verify it with the DNS TXT record (covers http/https and all subdomains). Keep the record in place permanently.
2. Submit `https://<domain>/sitemap-index.xml`.
3. After a few days, check Pages (indexing) and Performance. Don't claim verification is done until Search Console shows "Ownership verified".

### Google Business Profile

Mann's digital-services work probably **doesn't qualify** for a Business Profile. Google's guidelines require in-person contact with customers during stated hours (a storefront, or travelling to customers), and they exclude virtual offices. Remote digital services usually don't meet that. Do **not** reuse Nest & Rest's profile or identity for this work. Nest & Rest itself (a service-area business) *is* a good candidate for its own profile, with the home address hidden.

## 4 · Hosting and deployment

**Recommended host: Netlify** (free plan allows functions and custom domains; Vercel's free Hobby plan is restricted to non-commercial use, which this site is not). `@astrojs/netlify` is already configured via `DEPLOY_TARGET=netlify` in `netlify.toml`. Cloudflare is a reasonable alternative (switch adapter).

1. **Owner action:** Netlify → Add new site → Import from GitHub → this repository. Build settings come from `netlify.toml`.
2. Branch deploys and deploy previews are always `noindex` and show the preview banner.
3. Production deploys run `npm run build && npm run prelaunch`. They **fail on purpose** until every "To confirm" item is resolved and the delivery and secret variables are set. That's the guard against unverified claims or a dead form going live.
4. **Domain (Owner action):** buy the domain in Mann's name (not via a reseller account he doesn't control), add it in Netlify → Domain management, follow Netlify's DNS instructions, then set `PUBLIC_SITE_URL=https://<domain>` and `SITE_INDEXING=true`, and redeploy.

**Rollback:** Netlify → Deploys → choose the last good deploy → "Publish deploy" (instant). In git, `git revert <commit>` and push. Environment-variable changes need a redeploy to take effect.

## 5 · Recurring costs (estimates; verify current pricing)

| Item | Cost | Needed? |
| --- | --- | --- |
| Domain (.ca or .com) | roughly CAD 15–30 / year, set by the registrar | Yes, for launch |
| Netlify Free | $0 (300 credits/month; sites pause if exceeded) | Yes. Upgrade (Personal $9/mo) only if traffic needs it |
| Resend Free | $0 for 3,000 emails/month, 100/day; Pro $20/mo | Yes, for email delivery |
| Business email (e.g. Google Workspace) | per user per month, set by Google | Recommended for a professional address |
| Cloudflare Turnstile | free tier | Optional |
| GA4 / Search Console | free | Optional / recommended |

## 6 · Local development

See `README.md`. Quick version: `npm install`, `cp .env.example .env`, `npm run dev`. Enquiries go to `.data/enquiries.jsonl` in file mode.
