# Security checklist: mannpatel.me

## In place
- No secrets in the repository or git history; `.env*` ignored; secrets live in Cloudflare (docs/infrastructure.md).
- Headers (src/lib/security-headers.ts): HSTS 1 year + subdomains, nosniff, X-Frame-Options DENY, strict referrer,
  Permissions-Policy, COOP, and a hash-based Content Security Policy.
- `http://` and `www` redirect to `https://mannpatel.me` (src/worker/entry.ts).
- Enquiry form: honeypot, signed time token, optional Turnstile, server validation, link limit, dedupe, rate limit;
  logs hold metadata only.
- No database. Privacy Policy and Terms linked in the footer (drafts: have a lawyer review). Payment notice on /contact/.
- Dependabot weekly (npm + GitHub Actions); `npm audit` clean on 27 Nov 2026.

## Still to do by hand
- Cloudflare: set `PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`; add a WAF rate-limit rule on `/api/enquiry/`.
- Switch the CSP from `Content-Security-Policy-Report-Only` to enforcing once the live site shows no violations.
- Add SPF/DKIM/DMARC per docs/email-dns.md; scan at securityheaders.com and ssllabs.com/ssltest.

## Monthly
- Review and merge Dependabot PRs; run `npm audit`, `npm test`, `npm run build`.
- Check Cloudflare logs for rate-limit hits; read DMARC reports; rotate any key shared outside Cloudflare.
