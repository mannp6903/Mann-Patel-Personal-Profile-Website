# Infrastructure

How mannpatel.me is hosted, built, deployed and wired up (Website Playbook, 16 Nov 2026). This repository is public:
variable **names** only here, never values that are secret. Step-by-step setup is in
[05-launch-and-integrations.md](05-launch-and-integrations.md) §1 and §4.

## 1 · Hosting

- **Cloudflare Workers with static assets** (free plan). Worker name `mann-patel-website` (`wrangler.jsonc`).
- Every page is prerendered to HTML at build time (`dist/client/`). The only code that runs per request is
  `src/worker/entry.ts`:
  - sends `www.mannpatel.me` and plain `http://` to `https://mannpatel.me` in one 301, keeping the path;
  - serves the static files (with `_headers` and `_redirects`);
  - hands `/api/enquiry/` and any 404 to Astro's handler.
- `assets.run_worker_first: true` lets the Worker see each request before the static files are served.
  `assets.not_found_handling: "404-page"` makes an unknown address return the built 404 page with a real 404 status.
- **Security headers** (HSTS for a year including subdomains, a report-only Content Security Policy, and others) come
  from `src/lib/security-headers.ts`. The build writes them into `dist/client/_headers`. The CSP stays report-only
  until the live site shows no violations.
- **Custom domains:** `mannpatel.me` and `www.mannpatel.me` (`routes` in `wrangler.jsonc`). Cloudflare creates their DNS
  records and certificates on deploy.

## 2 · Build and deploy

| Step | Command | Where it runs |
| --- | --- | --- |
| Production build | `npm run build:cloudflare` | Cloudflare's build (on every push to the default branch) and locally |
| Deploy | `npx wrangler deploy` | Cloudflare's deploy step |
| Tell IndexNow engines what changed | `node scripts/indexnow.mjs ping` (`npm run indexnow`) | Cloudflare's deploy step, after `wrangler deploy` |
| Checks on every pull request | `.github/workflows/ci.yml` | GitHub Actions. It never deploys |

- `scripts/build-cloudflare.mjs` sets the production values: `SITE_MODE=production`,
  `PUBLIC_SITE_URL=https://mannpatel.me`, `SITE_INDEXING=true`, `PUBLIC_GA4_ID` and
  `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false`. It then:
  1. runs `astro build`;
  2. saves the live sitemap's dates for IndexNow;
  3. writes the trailing-slash `_redirects`;
  4. runs the pre-launch check (`scripts/prelaunch-check.mjs`). That check fails the build on a "To confirm" note, a
     broken internal link or a missing asset.
- **Default branch:** `ccr-96e3375f-xynmc5`. Cloudflare builds and deploys from it. Work happens on review branches;
  pull requests are merged by Mann.
- **Node:** `.nvmrc` (22.23.4, the minimum Astro 7.4 needs) for CI. `.node-version` (22) is what Cloudflare's build
  reads.
- **Rollback:** Cloudflare dashboard → Workers & Pages → `mann-patel-website` → Deployments → pick the last good
  version → Rollback. In git: `git revert` the change and merge.

## 3 · Where leads land

| Channel | Path | Ends up |
| --- | --- | --- |
| Project brief and free check forms | `POST /api/enquiry/` → `src/lib/enquiry/handler.ts` → Cloudflare Email (`send_email` binding `ENQUIRY_EMAIL`) | An email to the inbox in `ENQUIRY_TO_EMAIL`, sent from `website@mannpatel.me`, with Reply-To set to the visitor. Nothing is stored in a database. |
| Form not connected (delivery `none`) | The form says so and offers the visitor's own email app | Mann's inbox, from the visitor's email app |
| Email links | `mailto:info@mannpatel.me` | Cloudflare Email Routing forwards `info@` to Mann's inbox |
| Call, WhatsApp, Text | `tel:`, `wa.me` and `sms:` links (`src/lib/phone.ts`, filled in by `src/scripts/reach.ts`) | Mann's phone |
| Booking | `bookingUrl` in `src/data/site.ts` | Not set yet: no booking link is shown |

- **Counting leads:** GA4 `generate_lead` fires only after `/api/enquiry/` accepts a brief, and only once the visitor
  has allowed analytics. It never carries names, emails or message text. Click events and their parameters are listed
  in [05-launch-and-integrations.md](05-launch-and-integrations.md) §2.
- **Spam and abuse:** a honeypot field, a signed time token, a limit on links, and per-IP request limits held in each
  Worker instance's memory. Cloudflare Turnstile is built in and switches on once both keys are set.

## 4 · Environment variables (names only)

**Build-time:** read by `astro build`. Production values are set by `scripts/build-cloudflare.mjs`, or as Cloudflare
build variables.

| Name | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Production origin, no trailing slash |
| `SITE_MODE` | `preview` or `production` (production fails the build on "To confirm" notes) |
| `SITE_INDEXING` | `true` only for the real production build. Previews are noindex |
| `DEPLOY_TARGET` | `cloudflare` or `node` (local preview and tests) |
| `PUBLIC_GA4_ID` | GA4 measurement ID (public; loads only after consent) |
| `PUBLIC_CONTACT_PHONE` | Optional override for the public phone number |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (optional) |
| `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV` | Set to `false` by the production build, so a local `.env` can't leak into it |

**Runtime:** read by the Worker when the form is used.

| Name | Kind | Purpose |
| --- | --- | --- |
| `ENQUIRY_DELIVERY` | var (`wrangler.jsonc`) | `cloudflare` in production |
| `ENQUIRY_FROM_EMAIL` | var (`wrangler.jsonc`) | Sender address on mannpatel.me |
| `ENQUIRY_ACKNOWLEDGE` | var (`wrangler.jsonc`) | Send the visitor a confirmation email (`false`) |
| `ENQUIRY_TO_EMAIL` | **secret** (Cloudflare dashboard) | Where briefs are delivered: a verified Email Routing destination |
| `FORM_TOKEN_SECRET` | secret, optional | Keeps time tokens valid across deploys |
| `TURNSTILE_SECRET_KEY` | secret, optional | Turnstile server key |
| `RESEND_API_KEY`, `ENQUIRY_WEBHOOK_URL`, `ENQUIRY_WEBHOOK_SECRET` | secret, unused | Alternative delivery adapters (Resend, webhook) |

**Bindings:** `ASSETS` (static files) and `ENQUIRY_EMAIL` (Cloudflare Email). `wrangler.jsonc` has
`keep_vars: true`, so variables added in the dashboard survive each deploy. `.env.example` lists the local
development names.

## 5 · DNS and email

- **DNS:** mannpatel.me uses Cloudflare's nameservers. The Worker's custom domains create the records for
  `mannpatel.me` and `www`. The `www` → apex redirect is done by the Worker, not by a dashboard rule.
- **HTTPS everywhere:** HSTS includes subdomains, so any subdomain added later must answer over HTTPS.
- **Email Routing:** on for mannpatel.me. `info@mannpatel.me` forwards to Mann's inbox, and the form's sender is
  `website@mannpatel.me`. Cloudflare adds the MX and SPF records Email Routing needs when it is turned on: don't
  remove them. There is no separate mailbox provider. A business mailbox (for example Google Workspace) would replace
  those records, and form delivery would need re-checking.
- **IndexNow key:** `public/61a5f4cf359b3e776e7e4b9f1b7b370b.txt` (public by design; it proves the site owns the pings).
