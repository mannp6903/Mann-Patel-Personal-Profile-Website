---
title: Samp Hair & Spa
seoTitle: Samp Hair & Spa Website Preview
order: 2
status: in-progress
kind: Client website · Scarborough salon & spa
year: '2026'
summary: A new website for a neighbourhood hair salon and spa on Painted Post Drive in Scarborough, currently in progress.
role: I'm building it with Lovable (an AI-assisted website builder), working from a brief I wrote using the salon's verified details.
serviceIds: [websites, seo, enquiry-workflows]
highlights:
  - Built only from verified business facts, with no invented prices or reviews
  - Live “Open now” status worked out in Toronto time
  - Service menu with starting prices and a three-step appointment request
  - Stock photos labelled as illustrative, never passed off as the salon
scene: samp
links:
  - label: See the work-in-progress preview
    url: https://samp-hair-spa.lovable.app/
relationship: Client website
websiteStatus: In progress, preview online
checked: '2026-11-08'
roleShort: Wrote the brief from verified facts; building it with Lovable.
problem: People choosing a salon on their phone need the services, starting prices, opening hours and an easy way to ask for an appointment.
verification:
  - behaviour: “Open now” badge, in Toronto time
    how: Clock fixed at Mon 11:00, Wed 19:30, Thu 19:30 and Sat 18:30 Toronto time, with the visitor’s computer set to India time
    result: Open until 7 PM; closed, opens Thu 10 AM; open until 8 PM; closed, opens Mon 10 AM. All four match the posted hours.
  - behaviour: Appointment request, steps 1 and 2
    how: Continue with no service chosen, then choose a service and open the day list
    result: It asks for a service before moving on; Sundays show as closed and can’t be chosen.
  - behaviour: Layout
    how: Preview home page at 360, 390, 768 and 1440 px
    result: No sideways scrolling.
  - behaviour: Automated accessibility scan
    how: axe-core, WCAG 2.2 A/AA rules, at 390 and 1440 px
    result: 31 low-contrast text items and 1 invalid ARIA attribute found. Open, to fix before launch.
limitations:
  - Work in progress; content and design can still change before launch.
  - Photography is stock, labelled “Illustrative photography” on the site.
  - The appointment form prepares a request; it never confirms a booking. Its final step wasn’t submitted in testing, so nothing was sent to the salon.
  - The accessibility findings above are still open.
outcomes: None yet. The site hasn’t launched.
nextStep: Fix the contrast and ARIA findings, confirm the final content with the salon, then launch and re-test.
description: A work-in-progress website for Samp Hair & Spa in Scarborough, built from verified business facts with a clear service menu, live opening status and an honest appointment-request flow.
---

## The situation

Samp Hair & Spa is a salon and spa on Painted Post Drive in Scarborough, offering hair, threading, waxing, skin care, massage, men's grooming and bridal styling, with around 300 public reviews. The goal is a fast, mobile-first site that makes its services, starting prices and hours easy to find, and makes asking for an appointment simple.

## The brief I wrote

- **Facts first.** Address, phone, hours, services and starting prices come only from the salon's own information. Where a price isn't published, the site says "Call for pricing" rather than guessing.
- **Reputation, honestly.** The salon's public rating (about 4.4 stars from roughly 300 reviews) is shown with the themes reviewers mention most, with no made-up quotes or names.
- **A calm, premium look** with a deep plum, blush and champagne palette and an elegant serif, matching how a salon visit should feel.

## Decisions so far

1. **Open now, in Toronto time.** A live badge shows whether the salon is open and until when, worked out from its real hours.
2. **A menu you can scan.** Services are grouped into seven categories with starting prices, and a note that prices are confirmed when booking.
3. **Requests, not fake bookings.** The three-step form prepares an email to the salon. It never claims an appointment is confirmed, and calling is always one tap away.
4. **Photography labelled.** The preview uses stock photos, marked "Illustrative photography", so nothing implies they show the actual premises.

## Status

**In progress.** The preview is live for review while the site is finished. No results are claimed.
