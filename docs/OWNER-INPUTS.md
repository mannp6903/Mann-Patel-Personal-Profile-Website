# Owner inputs: what Mann needs to decide or supply

Everything below is tracked in code. Unverified **claims** are wrapped in `<Confirm>` (production builds fail until they're resolved). Missing **optional** items use `<PreviewNote>` (shown in previews only). Run `grep -rn "Confirm note\|confirm:\|Confirm:\|PreviewNote note" src` to list them.

## The short set of questions (highest impact first)

1. ~~Nest & Rest website is down~~ **Resolved:** the site was back online later on 31 Oct 2026. The case study now uses fresh captures of the live site. (Still recommended: add the domain as a *verified domain* in GitHub Pages settings.)
2. ~~How was the Nest & Rest site built?~~ **Answered (31 Oct 2026): built from scratch by Mann.** Nest & Rest has no paying clients yet; bookings open in summer 2027, and the site now says so everywhere.
3. ~~Concept samples~~ **Answered (31 Oct 2026): removed.** Kettle & Crumb and Northline Plumbing are gone from the site; the Work page shows only real projects (Nest & Rest, Samp Hair & Spa).
4. ~~Public contact details~~ **Answered (1 Nov 2026):** the public email is **info@mannpatel.me** (one place: `profile.contact.email` in `src/data/site.ts`). **Phone / WhatsApp / Text buttons** are built; they need your number as the Cloudflare **build variable** `PUBLIC_CONTACT_PHONE` (never in this public repo). The site shows it masked as `647-XXX-XXXX`-style; the buttons dial the full number. See `docs/05` §4 step 5. Local previews use the fictional `+1 647-555-0142`.
4b. **Social links.** GitHub is linked (`github.com/mannp6903`, your connected account). **Instagram, Facebook and LinkedIn URLs are still needed.** Until then their buttons show as greyed placeholders in previews and are **hidden in production** (no dead buttons). Add them in `src/data/site.ts` → `social`.
5. ~~Domain~~ **Answered (31 Oct 2026): mannpatel.me** (your domain; replaces the earlier mannpatel.ca plan). Set as the production URL in `scripts/build-cloudflare.mjs` and `wrangler.jsonc`. Owner action: add it to Cloudflare (see `docs/05` §4).
6. ~~Public location wording~~ **Answered (31 Oct 2026): based in Toronto, serving the GTA.** The hero says "Mann Patel · Toronto" and the FAQ says you work with small businesses across the GTA. (Clients outside the GTA aren't mentioned; tell me if you want to add remote work.)
7. ~~Portrait~~ **Done (31 Oct 2026):** your photo is used in the home hero, About, Contact and the share image.
8. ~~Your story~~ **Answered (31 Oct 2026):** the About page now tells Mann's story (Palana → Seneca → Saint John → Thunder Bay → North York → Walmart → Nest & Rest), with the depression and the lost job described plainly. Edit it any time in `src/pages/about.astro`.
9. ~~AI tools FAQ~~ **Answered (31 Oct 2026): accurate**, published as written.
10. ~~Privacy details~~ **Decided (31 Oct 2026, Mann: "do whatever is best"; updated 1 Nov 2026):** Cloudflare hosts the site and delivers each enquiry by email (Cloudflare Email, no Resend), Google (Gmail) hosts the inbox; both are named on the Privacy page, which also covers calls, texts and WhatsApp. Enquiries that don't become projects are deleted from your inbox within 12 months. **Your part:** the Email Routing steps in `docs/05` §1, and once a year delete enquiry emails older than 12 months.
11. **Pricing.** The public site says "Request a quote". If you want public prices or "starting from" figures, decide them first (see the private worksheet).
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
| Packages | `src/data/packages.ts` |
| FAQ | `src/data/faqs.ts` |
| Case studies | `src/content/work/*.md` |
| About story and principles | `src/pages/about.astro` |
| Privacy notice | `src/pages/privacy.astro` |
