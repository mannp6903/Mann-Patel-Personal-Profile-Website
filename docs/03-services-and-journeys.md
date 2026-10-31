# 03 · Services, packages, boundaries, sitemap and journeys

**Source of truth for service copy:** `src/data/services.ts`. Every service there has customer problem, deliverables, inputs needed, exclusions, handover and next step, plus plain-language definitions of technical terms. The shared five-step process (brief → written scope → build → test and launch → handover) is in the same file. This document explains the structure and the decisions.

## Service structure

| Group | Verb on the site | Services (ids) | Brief items covered |
| --- | --- | --- | --- |
| **A · Websites and online visibility** | Get found | `websites`, `seo`, `search-console`, `analytics`, `business-profile` | Sites, landing pages, mobile UX, service copy, enquiry forms, booking integrations; technical/on-page SEO, structure, metadata, content recommendations, performance; Search Console verification, sitemap, reporting; GA4 setup, events, reporting plan; GBP eligibility, setup/improvement, accurate info |
| **B · Business email and automation** | Follow up | `business-email`, `enquiry-workflows`, `integrations`, `maintenance` | Domain email, Google Workspace support, SPF/DKIM/DMARC plan; acknowledgements, owner notifications, lead organisation, follow-up and appointment-request workflows; connecting forms, email, calendars, simple CRM/spreadsheet; maintenance, handover, monitoring, owner responsibilities |
| **C · Content, branding and marketing materials** | Look professional | `social-strategy`, `social-materials`, `identity`, `print-digital` | Content strategy, ideas, scripts, hooks, captions, posting plans; Instagram/Facebook/WhatsApp Business materials and Reel concepts; logo/identity support; business cards, flyers, gift-card artwork, coordinated templates with print and digital specs |

### What needs a demonstration or validation before it is sold hard

Mann wants to offer these services; the brief says not to assume they are proven specialties. Evidence today:

| Area | Evidence now | What would make it credible |
| --- | --- | --- |
| Websites | Nest & Rest site (role and tools **to confirm**); this site | Confirm the Nest & Rest build role; one real client site with permission |
| Enquiry workflows | Workflow demo on this site (fictional data); this site's own enquiry pipeline | Run the real pipeline for Nest & Rest and document it |
| SEO / Search Console / GA4 | This site is built to the checklist; setup is documented | Complete Search Console + GA4 for this site and Nest & Rest, and keep notes |
| Business Profile | Eligibility rules researched | Set up Nest & Rest's profile properly (owner action) |
| Professional email | — | Set up Mann's own domain email with SPF/DKIM/DMARC and record the checks |
| Content, branding, print | Concept samples on this site | Nest & Rest social templates; permissioned client pieces |

## Packages (internal drafts)

Public names, contents and exclusions are in `src/data/packages.ts`. The public site shows **"Request a quote"** and no prices.

| Package | For | One-time work | Optional ongoing |
| --- | --- | --- | --- |
| **Business Launch** | New businesses | Site ≤ 5 pages or 1 landing page, form + acknowledgement + notification, domain + email setup support, Search Console, GA4 lead event, GBP eligibility + setup support, profile kit | Monthly check (forms, renewals), small edits |
| **Website & Visibility** | Established, weak site | Review, key-page improvements or rebuild, on-page SEO and speed (measured), GSC/GA4 clean-up, GBP corrections, form test and fix | Quarterly SEO/content check |
| **Content & Follow-up** | Working site, inconsistent replies and posts | Follow-up workflow + lead list + reminder, one-month content plan, templates, captions, Reel scripts, WhatsApp materials | Monthly content plan; workflow monitoring |
| **Check-up** (entry offer) | Unsure owners | Written review of site, Google info and a test enquiry; prioritised fix list | — |

**Common terms (to put in every written scope):**

- **Revisions:** two rounds of changes per deliverable; more are quoted.
- **Third-party fees:** domain, email subscription, hosting, paid tools, printing and ads are billed by the provider to the client, in the client's name.
- **Ownership:** the client owns domain, accounts, content and final files on payment. Mann may show the work in his portfolio **only with written permission**.
- **Setup vs ongoing:** setup is one-time. Content, SEO monitoring, hosting, email subscriptions and automation maintenance are separate recurring items, so the client can stop any of them.

### Recommended launch offer for a solo operator

Lead with the **Check-up** as the low-friction first step, and **Business Launch** as the one main package. Reasons: the check-up is small, quick to deliver, builds a portfolio of before/after notes (with permission) and naturally leads to a scoped project. Business Launch reuses one repeatable setup (site template + email + form workflow + Google setup). Keep *Website & Visibility* and *Content & Follow-up* available by quote, but don't promote them heavily until there are permissioned examples.

Prices and hour estimates: see the private worksheet (`private/pricing-worksheet.md`, not committed because this repository is public).

## Boundaries stated on the site

| Boundary | Where it appears |
| --- | --- |
| SEO supports discoverability; rankings, traffic, leads and reach are not guaranteed | SEO service exclusions, FAQ, guide reasons |
| GBP follows current eligibility rules; purely online services and virtual offices are ineligible; no identity reuse | Business Profile service exclusions |
| Email setup includes SPF/DKIM/DMARC checked against provider docs; inbox placement not guaranteed | Professional email service |
| Gift-card artwork ≠ issuance/payment/redemption system | Print service exclusions |
| A consultation request ≠ a confirmed appointment; acknowledgements reflect the real workflow | Enquiry workflow service; this site's own form copy ("this is a request, not a booking") |
| The site is not a CRM, scheduler, logo editor or platform | Architecture: one enquiry endpoint only |

## Sitemap (smallest useful structure)

```
/                Home — who I help, the offer, evidence, service overview, guide, primary action
/services/       All three groups, every service in detail, process, packages, FAQ
/work/           Nest & Rest (self-owned, launched) + two clearly labelled concepts
/work/nest-and-rest-cleaning/
/work/concept-kettle-and-crumb/      (concept)
/work/concept-northline-plumbing/    (concept)
/about/          Story, principles, vision, "My businesses"
/contact/        Project brief form, what happens next, other contact methods (when supplied)
/privacy/        What the form collects, where it goes, retention, analytics status
/404             Real not-found page
```

**Not built, on purpose:** separate pages per service (there isn't enough unique content yet — one Services page with anchors is better); an Insights/blog section (no articles and no update plan yet; add when there are at least three useful posts).

**One primary action per page:**

| Page | Primary action |
| --- | --- |
| Home | Start a project (→ /contact/) |
| Services | Request a quote (→ /contact/ with the service pre-selected) |
| Work | Start a project; case study pages: "Start a similar project" |
| About | Start a project |
| Contact | Send my brief |
| 404 | Go to the home page |

Cleaning visitors: a "Looking for home cleaning?" link to Nest & Rest appears in the header utility area on desktop, in the mobile menu, in the footer and on the Contact page. It never mixes into the digital enquiry form.

## Customer journeys

**1 · New owner needs a professional launch**
Home hero ("look professional, get found, follow up") → guide: *Just starting* → recommendation **Business Launch** with reasons → "Start a brief with this" → Contact with package + services pre-selected → sends brief → sees "Received. Here's what happens next".
*Supporting evidence on the way:* the concept sample for a new bakery-café (labelled concept) shows what a launch kit contains.

**2 · Established owner with a weak website or missed enquiries**
Search or referral → Home → "Follow up" verb or workflow demo (sees enquiry → acknowledgement → notification → follow-up with sample data) → Services › Enquiry follow-up workflows (deliverables, exclusions, process) → "Request a quote" (service pre-selected) → brief.

**3 · Visitor looking for cleaning**
Lands here searching "Mann Patel" or "Nest & Rest" → header link "Looking for home cleaning?" → nestnrestcleaning.com in one click, with no digital-services form involved.

**4 · Potential collaborator wants to understand Mann**
Home → About (story, principles, Nest & Rest) → Work (case study with honest status labels) → Contact, choosing "Something else" in the services list.
