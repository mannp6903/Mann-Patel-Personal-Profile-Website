# Email DNS records for mannpatel.me (SPF, DKIM, DMARC)

Setup today (docs/infrastructure.md §5): **Cloudflare Email Routing** receives `info@mannpatel.me` and forwards it to
Mann's inbox; the site form sends as `website@mannpatel.me` through Cloudflare Email. DNS is on Cloudflare, so add
these in Cloudflare → mannpatel.me → DNS → Records.

Values marked *check* depend on your dashboard; confirm them there rather than trusting this file.

| Type | Name/Host | Value | TTL |
|---|---|---|---|
| MX | `@` | Added by Email Routing (route1/2/3.mx.cloudflare.net). Don't edit. | Auto |
| TXT (SPF) | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` (*check*: Email Routing adds this itself; keep exactly one SPF record) | Auto |
| TXT (DKIM) | *selector* `._domainkey` | Cloudflare Email Routing/Sending: Email → Email Sending shows the DKIM record to add when the domain is onboarded. If you later move to Google Workspace: Admin console → Apps → Google Workspace → Gmail → Authenticate email (selector usually `google`). | Auto |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@mannpatel.me; adkim=s; aspf=s` | Auto |

Only one SPF record may exist per domain. If you add a provider that sends mail (Google Workspace, Resend), merge its
`include:` into the single record, e.g. `v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all`.

## Tightening DMARC

1. Start at `p=none` and read the daily reports sent to `info@mannpatel.me` for 2-4 weeks. Every legitimate sender
   (Cloudflare forwarding, the website form, any mailbox provider) should pass SPF or DKIM.
2. When reports show only legitimate mail passing, change to `p=quarantine` (optionally `pct=25`, then 100).
3. After another 2-4 weeks with no legitimate mail failing, change to `p=reject`.
4. Back off one step if real mail starts landing in spam. Re-check after adding any new sender.

Test with mail-tester.com or Google Admin Toolbox → Check MX, and send a message to a Gmail address and open
"Show original" to confirm SPF, DKIM and DMARC all say PASS.
