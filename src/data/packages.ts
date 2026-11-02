/**
 * Draft packages — public wording only. Prices, hour estimates and margins
 * live in the private pricing worksheet (not in this public repository).
 * Publicly every package says "Request a quote" until Mann confirms pricing.
 */

import { freeCheck, freeCheckNote } from './free-check';

export interface Package {
  id: 'launch' | 'found' | 'answered' | 'website' | 'check-up';
  name: string;
  forWho: string;
  includes: string[];
  notIncluded: string[];
  youProvide: string[];
  serviceIds: string[];
  featured?: boolean;
  /** Offered at no charge (Mann's decision, 1 Nov 2026). */
  free?: boolean;
}

export const packages: Package[] = [
  {
    id: 'launch',
    name: 'Business Launch',
    forWho: 'New businesses, or owners starting their online presence from scratch.',
    includes: [
      'A website of up to five pages with a book-or-quote button and an enquiry form that replies instantly',
      'Google Business Profile set up, with photos and your booking link (after an eligibility check)',
      'Missed-call text-back and one list for every enquiry',
      'Domain connected and an email address at your domain (provider billed to you)',
      'Search Console and Analytics counting enquiries',
      'A QR review card and a routine for asking every customer for a review',
    ],
    notIncluded: ['Logo design (I can recommend a designer)', 'Monthly plans, and print or social content (available as add-ons)'],
    youProvide: ['Business details and services', 'Photos of your real work', 'Domain and account access in your name'],
    serviceIds: ['websites', 'business-profile', 'reviews', 'missed-calls', 'enquiry-workflows', 'seo'],
    featured: true,
  },
  {
    id: 'found',
    name: 'Found & Chosen',
    forWho: 'Running businesses that are hard to find on Google, or have few recent reviews.',
    includes: [
      'Google Business Profile cleaned up: category, services, hours, service area, photos, booking link',
      'Apple Maps, Bing, Yelp and Facebook details made consistent',
      'A check of what ChatGPT, Gemini and Perplexity say about you',
      'Review link, QR review cards, request messages and reply templates',
      'Replies drafted for your existing reviews',
      'A before-and-after snapshot, with the optional monthly “Stay found” plan after',
    ],
    notIncluded: ['Guaranteed rankings or call numbers', 'Paid ads'],
    youProvide: ['Manager access to your Google profile', 'Photos of your real work'],
    serviceIds: ['business-profile', 'reviews', 'listings', 'local-plan'],
  },
  {
    id: 'answered',
    name: 'Never Miss an Enquiry',
    forWho: 'Busy owners who miss calls while working, or lose track of messages and quotes.',
    includes: [
      'Missed-call text-back on a registered business number',
      'Instant replies to web forms, and WhatsApp Business greeting and away messages',
      'One list for every enquiry, with a reminder before anyone waits too long',
      'Online booking link with reminders before each appointment',
      'A review request after each finished job',
      'Consent records for follow-ups, in line with Canada’s anti-spam law',
    ],
    notIncluded: ['Outbound AI calls or robocalls', 'Tool, phone and texting fees (billed to you)'],
    youProvide: ['How customers reach you now', 'Your usual answers to common questions'],
    serviceIds: ['missed-calls', 'enquiry-workflows', 'booking', 'integrations'],
  },
  {
    id: 'website',
    name: 'Website That Books',
    forWho: 'Running businesses whose website is dated, slow on a phone, or has no easy way to book.',
    includes: [
      'A written review of your site on a phone and a laptop',
      'A fix-up or rebuild of the key pages, agreed in the scope',
      'A page for each main service and area',
      'A book-or-quote button and click-to-call on every page',
      'Search Console and Analytics counting enquiries and booking clicks',
      'Your enquiry form tested end to end, and fixed if it fails',
    ],
    notIncluded: ['Guaranteed rankings or traffic', 'Online stores'],
    youProvide: ['Website and Google account access', 'Your main services and areas'],
    serviceIds: ['websites', 'seo', 'maintenance'],
  },
];

/** Recommended low-commitment first step, free (see docs/11). */
export const checkUp: Package = {
  id: 'check-up',
  name: 'Free Found & Answered check',
  forWho: `Owners who are not sure what to fix first. Free, with no obligation to buy anything. ${freeCheckNote}`,
  includes: [
    'I look you up the way a customer would: Google, Maps, Apple Maps and AI assistants',
    'I compare your reviews with the top three businesses near you',
    'I send a test enquiry and, with your permission, call after hours to see what a customer experiences',
    'You receive a short written list of fixes, most important first',
  ],
  notIncluded: ['The fixes themselves, which I quote separately if you want them done'],
  youProvide: ['Your business name and website', 'Permission for a test call and a test enquiry'],
  serviceIds: ['business-profile', 'reviews', 'missed-calls'],
  free: true,
};

export const packageById = (id: string) => [...packages, checkUp].find((p) => p.id === id);
