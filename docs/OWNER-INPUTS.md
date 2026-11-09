# Owner inputs: what Mann needs to decide or supply

Everything below is tracked in code. Unverified **claims** are wrapped in `<Confirm>` (production builds fail until they're resolved). Missing **optional** items use `<PreviewNote>` (shown in previews only). Run `grep -rn "Confirm note\|confirm:\|Confirm:\|PreviewNote note" src` to list them.

## The short set of questions (highest impact first)

0. **Switch on direct enquiry delivery (the main blocker, 8 Nov 2026 audit).** The live form reports
   `connected: false` because the Worker secret **`ENQUIRY_TO_EMAIL`** isn't set. Turn on Email Routing,
   verify your inbox as a destination, add the secret, then send one real free check and one real brief
   to yourself (`docs/14` §5, `docs/05` §1), or run `npm run check:enquiry -- https://mannpatel.me --send --reply-to <you>`
   which sends both, marked “[Delivery test]” (round 10). Until then the forms say so honestly and offer the email app
   or “Copy my brief”.

1. ~~Nest & Rest website is down~~ **Resolved:** the site was back online later on 31 Oct 2026. The case study now uses fresh captures of the live site. (Still recommended: add the domain as a *verified domain* in GitHub Pages settings.)
2. ~~How was the Nest & Rest site built?~~ **Answered (31 Oct 2026): built from scratch by Mann.** Nest & Rest has no paying clients yet; bookings open in summer 2027, and the site now says so everywhere.
3. ~~Concept samples~~ **Answered (31 Oct 2026): removed.** Kettle & Crumb and Northline Plumbing are gone from the site; the Work page shows only real projects (Nest & Rest, Samp Hair & Spa).
4. ~~Public contact details~~ **Answered (1 Nov 2026):** the public email is **info@mannpatel.me** (one place: `profile.contact.email` in `src/data/site.ts`). **Phone / WhatsApp / Text buttons** are built; they need your number as the Cloudflare **build variable** `PUBLIC_CONTACT_PHONE` (never in this public repo). The site shows it masked as `647-XXX-XXXX`-style; the buttons dial the full number. See `docs/05` §4 step 5. Local previews use the fictional `+1 647-555-0142`.
4b. **Social links.** GitHub is linked (`github.com/mannp6903`, your connected account). **Instagram, Facebook and LinkedIn URLs are still needed.** Until then they are simply not shown (no dead buttons). Add them in `src/data/site.ts` → `social` and they appear in the footer and on About.
5. ~~Domain~~ **Answered (31 Oct 2026): mannpatel.me** (your domain; replaces the earlier mannpatel.ca plan). Set as the production URL in `scripts/build-cloudflare.mjs` and `wrangler.jsonc`. Owner action: add it to Cloudflare (see `docs/05` §4).
6. ~~Public location wording~~ **Answered (31 Oct 2026): based in Toronto, serving the GTA.** The hero says "Mann Patel · Toronto" and the FAQ says you work with small businesses across the GTA. (Clients outside the GTA aren't mentioned; tell me if you want to add remote work.)
7. ~~Portrait~~ **Done (31 Oct 2026; updated 8 Nov 2026):** the cut-out is drawn as the signal-line portrait in the home hero, the 404 page style and the share image ("Show photo" switches to the real photo); phones also show a small round face photo beside your name. The full street photo is only on the About page (removed from the home page at your request).
8. ~~Your story~~ **Answered (31 Oct 2026):** the About page now tells Mann's story (Palana → Seneca → Saint John → Thunder Bay → North York → Walmart → Nest & Rest), with the depression and the lost job described plainly. Edit it any time in `src/pages/about.astro`.
9. ~~AI tools FAQ~~ **Answered (31 Oct 2026): accurate**, published as written.
10. ~~Privacy details~~ **Decided (31 Oct 2026, Mann: "do whatever is best"; updated 1 Nov 2026):** Cloudflare hosts the site and delivers each enquiry by email (Cloudflare Email, no Resend), Google (Gmail) hosts the inbox; both are named on the Privacy page, which also covers calls, texts and WhatsApp. Enquiries that don't become projects are deleted from your inbox within 12 months. **Your part:** the Email Routing steps in `docs/05` §1, and once a year delete enquiry emails older than 12 months.
11. **Pricing (round 10: packages decided, prices not yet).** You chose the four bounded packages from the competitor
    brief (Website Launch, Website + Enquiry System, Local Visibility Setup, Website Care) and to keep prices out of this
    public repository until you have costed them. Until then every price line says “Quoted after your free check” and
    `/pricing/` is built but not linked, not in the sitemap and `noindex`. **To publish:** cost each package (hours ×
    your rate + expenses + margin; the audit's cost check is a starting point), then set `price.amount` in
    `src/data/packages.ts`. The cards, the comparison table, the service pages, the structured data, the sitemap and the
    links to `/pricing/` all update from that one change. Confirm tax treatment in your quotes.
12. ~~Brand name~~ **Answered (31 Oct 2026): "Mann Patel".** No studio name.

13. ~~Samp Hair & Spa permission~~ **Answered (31 Oct 2026): yes**, the work-in-progress preview can be shown on the site. The project appears as *In progress* with a link to the Lovable preview. (Keep the salon's agreement in writing on file.)

## Accounts and live actions (only Mann can do these)

| Action | Why | Where it's explained |
| --- | --- | --- |
| Create the Cloudflare Worker from this GitHub repo | Hosting + the enquiry form | `docs/05` §4 |
| Add **mannpatel.me** to Cloudflare (nameservers) | Real URL, email sender, Search Console | `docs/05` §4 |
| Email Routing on + verify your inbox + create `info@mannpatel.me` + Secret `ENQUIRY_TO_EMAIL` | Make the form deliver to your inbox; receive mail at info@ | `docs/05` §1 |
| Build variable `PUBLIC_CONTACT_PHONE` | Turn on the Call / WhatsApp / Text buttons | `docs/05` §4 step 5 |
| Live test with sample data | Prove delivery end to end | `docs/05` §1 |
| Search Console Domain property + sitemap | Indexing visibility | `docs/05` §3 |
| GA4 property (optional) | Measurement | `docs/05` §2 |
| *(Optional)* Business mailbox to send *from* info@ (e.g. Google Workspace, or Gmail "Send mail as") | Reply from info@ instead of Gmail | `docs/05` §5 |

## Where to edit content

| Content | File |
| --- | --- |
| Name, intro, location, contact details, portrait, businesses | `src/data/site.ts` |
| Services (all copy) | `src/data/services.ts` |
| Packages, boundaries, third-party costs and prices (one source) | `src/data/packages.ts` |
| Focused service pages (web design, local visibility, enquiry follow-up) | `src/data/service-pages.ts` |
| Fictional walkthrough (home and enquiry follow-up page) | `src/components/EnquiryDemo.astro` |
| FAQ | `src/data/faqs.ts` |
| Case studies | `src/content/work/*.md` |
| About story and principles | `src/pages/about.astro` |
| Home hero wording | `src/components/home/Hero.astro` |
| Example phone screens (fictional salon) | `src/components/home/PhoneScreen.astro` |
| Project screenshots, alt text and captions | `src/data/captures.ts` |
| Colours, fonts, spacing (design tokens) | `src/styles/tokens.css` (documented in `DESIGN.md`) |
| Privacy Policy | `src/pages/privacy.astro` |
| Terms of Use | `src/pages/terms.astro` |
