# Owner inputs: what Mann needs to decide or supply

Everything below is tracked in code. Unverified **claims** are wrapped in `<Confirm>` (production builds fail until they're resolved). Missing **optional** items use `<PreviewNote>` (shown in previews only). Run `grep -rn "Confirm note\|confirm:\|Confirm:\|PreviewNote note" src` to list them.

## The short set of questions (highest impact first)

1. ~~Nest & Rest website is down~~ **Resolved:** the site was back online later on 31 Oct 2026. The case study now uses fresh captures of the live site. (Still recommended: add the domain as a *verified domain* in GitHub Pages settings.)
2. **How was the Nest & Rest site built?** What did you do yourself, which tools did you use (including AI-assisted tools), and did anyone else help? *(Blocks: case-study role line.)*
3. ~~Concept samples~~ **Answered (31 Oct 2026): removed.** Kettle & Crumb and Northline Plumbing are gone from the site; the Work page shows only real projects (Nest & Rest, Samp Hair & Spa).
4. **Public contact details.** *Interim answer (31 Oct 2026):* `mannp6903claudeai@gmail.com` is shown on the site. Switch to an address on your own domain (e.g. `hello@` your domain) once email is set up. Phone or WhatsApp: not public. Tell me if you want one.
4b. **Social links.** GitHub is linked (`github.com/mannp6903`, your connected account). **Instagram, Facebook and LinkedIn URLs are still needed.** Until then their buttons show as greyed placeholders in previews and are **hidden in production** (no dead buttons). Add them in `src/data/site.ts` → `social`.
5. ~~Domain~~ **Answered (31 Oct 2026): mannpatel.me** (your domain; replaces the earlier mannpatel.ca plan). Set as the production URL in `netlify.toml`. Owner action: connect it to Netlify (see `docs/05` §4).
6. ~~Public location wording~~ **Answered (31 Oct 2026): based in Toronto, serving the GTA.** The hero says "Mann Patel · Toronto" and the FAQ says you work with small businesses across the GTA. (Clients outside the GTA aren't mentioned; tell me if you want to add remote work.)
7. ~~Portrait~~ **Done (31 Oct 2026):** your photo is used in the home hero, About, Contact and the share image.
8. **Your story, in your words.** Edit the drafted founder story and vision on the About page. *(Blocks: About page.)*
9. **AI tools FAQ.** Is the drafted answer about how you use AI tools accurate and something you're comfortable publishing? *(Blocks: one FAQ.)*
10. **Privacy details.** Confirm the host (Netlify) and delivery service (Resend and/or a Google Sheet), and the 12-month retention period. *(Blocks: Privacy page.)*
11. **Pricing.** The public site says "Request a quote". If you want public prices or "starting from" figures, decide them first (see the private worksheet).
12. ~~Brand name~~ **Answered (31 Oct 2026): "Mann Patel".** No studio name.

13. ~~Samp Hair & Spa permission~~ **Answered (31 Oct 2026): yes**, the work-in-progress preview can be shown on the site. The project appears as *In progress* with a link to the Lovable preview. (Keep the salon's agreement in writing on file.)

## Accounts and live actions (only Mann can do these)

| Action | Why | Where it's explained |
| --- | --- | --- |
| Connect the repo to Netlify | Hosting + the enquiry function | `docs/05` §4 |
| Connect **mannpatel.me** to Netlify | Real URL, email sender, Search Console | `docs/05` §4 |
| Resend account + domain verification + env vars | Make the form deliver to your inbox | `docs/05` §1 |
| Live test with sample data | Prove delivery end to end | `docs/05` §1 |
| Search Console Domain property + sitemap | Indexing visibility | `docs/05` §3 |
| GA4 property (optional) | Measurement | `docs/05` §2 |
| Business email (e.g. Google Workspace) + SPF/DKIM/DMARC | Professional address | `docs/05` §5 |

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
