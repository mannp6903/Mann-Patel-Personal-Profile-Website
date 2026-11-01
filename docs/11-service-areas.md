# 11 · Service areas rebuilt from research (1 Nov 2026)

Mann asked for deep web research on the top three ways he can help small businesses grow, and for the A/B/C service areas to follow it. The full report, with sources and suggested price ranges, is kept **outside this public repository** (like the pricing worksheet); this page records the public decision.

## The three areas

The new areas follow a local customer's path: they **find** a business, **contact** it, then **book**.

| | Area | Promise | Services |
| --- | --- | --- | --- |
| **A** | **Get found and chosen on Google** | Correct details on Google, Apple Maps and Bing, and a steady flow of real reviews with replies | Google Business Profile setup and clean-up · Reviews (asking, replying, QR cards) · Apple Maps, Bing and AI assistant check · Monthly "Stay found" plan |
| **B** | **Never miss an enquiry** | Every call, form and message gets a quick, honest reply and lands in one list; reminders help cut no-shows | Missed-call text-back and instant replies · One enquiry list and follow-up · Online booking, reminders and deposits · Connecting tools |
| **C** | **A website that books work** | A page for each service and a book-or-quote button on every page, kept working monthly | Website fix-up or new site · Service pages, search basics and measurement · Monthly care plan |

Packages: **Business Launch** (all three), **Found & Chosen** (A), **Never Miss an Enquiry** (B), **Website That Books** (C), and the **Found & Answered check** as the low-commitment first step.

## Why (headline evidence; details and caveats in the private report)

- Canadian owners' top growth barrier is **not enough customers** (CFIB, Dec 2025: 54%), with heavy cost pressure and long hours, so offers must bring customers, save time and have fixed prices.
- **92% of Canadian SMEs use digital tools but only 10% are fully integrated** (CFIB, 2025): the gap is joining up and configuring tools, which is area B.
- Local buyers read reviews and expect replies; Google Business Profile and reviews are rated the largest local ranking factors by expert surveys (BrightLocal and Whitespark 2026, US data), which is area A.
- Old but consistent studies show reply speed decides who wins the lead, and a 2024 test found 40% of US home-service firms never answered a web lead within five days; appointment reminders have strong evidence for raising attendance. That is area B.
- A dedicated page per service is rated the top local organic factor; the website is where the booking button and measurement live. That is area C.

## What changed and what was dropped

| Before | Now |
| --- | --- |
| A · Websites and online visibility | Split: Google profile and reviews became **A**; websites and search basics became **C** |
| B · Business email and automation | **B** is now "Never miss an enquiry"; professional email is a line item in website work |
| C · Content, branding and marketing materials | **Dropped as a service area.** Logos and stand-alone social posting are heavily commoditised (AI tools and marketplaces). WhatsApp Business messages moved to B; print shrank to QR review cards in A |
| Search Console and GA4 as separate services | Folded into "Service pages, search basics and measurement" and the monthly reports |

Two new FAQs explain the review rules (no incentives, no gating, no fake reviews) and that logos and social posting are not offered as main services.

## Rules kept

- Deliverables, not promised outcomes: no rankings, call numbers or review counts are guaranteed.
- No prices or turnaround times on the site until Mann confirms them (the report suggests ranges).
- Google's review policies and Canada's anti-spam law (CASL) are built into the service descriptions: no review incentives or gating, consent records for follow-ups, no outbound robocalls.

## Files

`src/data/services.ts`, `src/data/packages.ts`, `src/lib/enquiry/options.ts`, `src/lib/guide.ts`, `src/components/Guide.astro`, `src/components/ContactForm.astro`, `src/pages/services.astro`, `src/data/faqs.ts`, home copy (`Hero.astro`, `Intro.astro`, `Marquee.astro`, `index.astro`), `src/data/site.ts`, About copy, and tests.
