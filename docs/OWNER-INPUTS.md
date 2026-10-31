# Owner inputs: what Mann needs to decide or supply

Everything below is tracked in code. Unverified **claims** are wrapped in `<Confirm>` (production builds fail until they're resolved). Missing **optional** items use `<PreviewNote>` (shown in previews only). Run `grep -rn "Confirm note\|confirm:\|Confirm:\|PreviewNote note" src` to list them.

## The short set of questions (highest impact first)

1. **Nest & Rest website is down.** nestnrestcleaning.com returned a GitHub Pages 404 on 31 Oct 2026. Please restore it. It's your business's front door, and this site links to it in several places. *(Blocks: Nest & Rest case study.)*
2. **How was the Nest & Rest site built?** What did you do yourself, which tools did you use (including AI-assisted tools), and did anyone else help? *(Blocks: case-study role line.)*
3. **Concept samples.** Kettle & Crumb and Northline Plumbing were produced by Claude (AI) while building this site. Keep them with that attribution, replace them with your own work, or remove them? *(Blocks: both concept pages.)*
4. **Public contact details.** *Interim answer (31 Oct 2026):* `mannp6903claudeai@gmail.com` is shown on the site. Switch to an address on your own domain (e.g. `hello@` your domain) once email is set up. Phone or WhatsApp: not public. Tell me if you want one.
4b. **Social links.** GitHub is linked (`github.com/mannp6903`, your connected account). **Instagram, Facebook and LinkedIn URLs are still needed.** Until then their buttons show as greyed placeholders in previews and are **hidden in production** (no dead buttons). Add them in `src/data/site.ts` → `social`.
5. **Domain: you chose mannpatel.com, but it's not available to register.** A registry lookup on 31 Oct 2026 shows it **already registered** (since 20 Aug 2020, via Squarespace Domains, renews by 20 Aug 2027, no website). You could only get it by buying it from the current owner. Available on the same day: **mannpatel.ca** (recommended for a Toronto business), mannpatel.co, mannpatel.me, mannpatel.studio, mannpatel.design, mannpatel.digital, iammannpatel.com, hellomannpatel.com, bymannpatel.com, mannpatelstudio.com. `netlify.toml` still says `https://mannpatel.com`; change that one line if you pick another.
6. **Public location wording.** "Toronto", "Scarborough, Toronto" or "the GTA"? Do you take remote clients outside the GTA? *(Blocks: hero eyebrow and an FAQ answer.)*
7. ~~Portrait~~ **Done (31 Oct 2026):** your photo is used in the home hero, About, Contact and the share image.
8. **Your story, in your words.** Edit the drafted founder story and vision on the About page. *(Blocks: About page.)*
9. **AI tools FAQ.** Is the drafted answer about how you use AI tools accurate and something you're comfortable publishing? *(Blocks: one FAQ.)*
10. **Privacy details.** Confirm the host (Netlify) and delivery service (Resend and/or a Google Sheet), and the 12-month retention period. *(Blocks: Privacy page.)*
11. **Pricing.** The public site says "Request a quote". If you want public prices or "starting from" figures, decide them first (see the private worksheet).
12. ~~Brand name~~ **Answered (31 Oct 2026): "Mann Patel".** No studio name.

## Accounts and live actions (only Mann can do these)

| Action | Why | Where it's explained |
| --- | --- | --- |
| Connect the repo to Netlify | Hosting + the enquiry function | `docs/05` §4 |
| Connect **mannpatel.com** to Netlify (DNS at Squarespace Domains) | Real URL, email sender, Search Console | `docs/05` §4 |
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
