/**
 * Packages: the single source of truth for what Mann sells (round 10, 8 Nov 2026).
 *
 * Four bounded offers plus the free check, chosen by Mann from the competitor brief
 * (docs/17-round-10-offers.md). Every card, the comparison table, the pricing page, the focused
 * service pages, the finder and the contact form's "starting point" read from this file.
 *
 * Prices: `price.amount` stays `null` until Mann has costed and approved a figure. This repository
 * is public, so unapproved or proposed prices are never written here. While a price is null the
 * site says "Written quote after a short brief" and /pricing/ is not linked or indexed.
 */

export type PackageId = 'website-launch' | 'website-enquiry' | 'local-visibility' | 'care' | 'check-up';

export interface Price {
  /** CAD, before tax. `null` = not approved yet (shown as "Written quote after a short brief"). */
  amount: number | null;
  unit: 'one-time' | 'month';
}

export interface Package {
  id: PackageId;
  name: string;
  /** The one-line boundary that keeps the scope clear. */
  boundary: string;
  forWho: string;
  includes: string[];
  notIncluded: string[];
  youProvide: string[];
  /** What the timeline depends on. No fixed turnaround is promised until Mann confirms one. */
  timeline: string;
  /** Costs billed to the client by other providers, never marked up here. */
  thirdParty: string[];
  /** Service ids (src/data/services.ts) this offer covers; used to pre-fill the brief. */
  serviceIds: string[];
  /** The focused service page that explains this offer. */
  page: string;
  price: Price;
  /** Offered at no charge (Mann's decision, 1 Nov 2026). */
  free?: boolean;
}

export const packages: Package[] = [
  {
    id: 'website-launch',
    name: 'Website Launch',
    boundary: 'Up to five pages, one enquiry path, your own text and photos, two rounds of revisions.',
    forWho: 'Service businesses that need a clear, fast website, or a rebuild of one that is dated or hard to use on a phone.',
    includes: [
      'Up to five pages, for example Home, Services, About, Contact and one service or area page',
      'One enquiry path: a quote or contact form that confirms to the customer and reaches your inbox, tested end to end',
      'Click-to-call and one clear next step on every page',
      'Built for phones first: fast to load, readable, with accessible headings, labels and contrast',
      'Search basics: page titles and descriptions, a sitemap, and Search Console and Analytics in your name',
      'Two rounds of revisions',
      'Handover: every login in your name, a short editing guide and the test results',
    ],
    notIncluded: [
      'Writing all your copy from scratch (I edit what you supply for clarity)',
      'Photography and logo design (I can recommend people)',
      'Online stores',
      'Booking integrations and follow-up workflows (see Website + Enquiry System)',
      'Guaranteed rankings or traffic',
    ],
    youProvide: ['Your services, area and the details you want shown', 'Photos of your real work', 'Domain and account access in your name'],
    timeline: 'Mostly depends on how quickly your text, photos and feedback arrive. You get a dated plan with the written scope.',
    thirdParty: ['Domain name (yearly, from your registrar)', 'Hosting, if your chosen host charges for it', 'Email at your domain, if you want it'],
    serviceIds: ['websites', 'seo'],
    page: '/services/web-design/',
    price: { amount: null, unit: 'one-time' },
  },
  {
    id: 'website-enquiry',
    name: 'Website + Enquiry System',
    boundary: 'Everything in Website Launch, plus one booking integration and one defined follow-up workflow.',
    forWho: 'Owners who miss calls or messages while they work, and want enquiries and bookings handled in one place.',
    includes: [
      'Everything in Website Launch',
      'One booking integration: your booking or quote tool connected to the site, with reminders before appointments',
      'One follow-up workflow, agreed in writing first: for example, each website enquiry lands in one list with an instant reply and a reminder before anyone waits too long, or missed-call text-back',
      'Every step tested with sample data, including what happens when a step fails',
      'Consent records for follow-up messages, in line with Canada’s anti-spam law',
      'Handover: a diagram of the workflow, the test results, and how to pause or change it',
    ],
    notIncluded: [
      'A second booking tool or workflow (quoted separately)',
      'Outbound AI calls or robocalls',
      'A custom CRM, client portal or chatbot',
      'Guaranteed bookings or response times from your team',
    ],
    youProvide: [
      'Everything Website Launch needs',
      'Your booking tool, or a choice from my recommendation',
      'Your usual answers to common questions',
    ],
    timeline: 'As for Website Launch, plus time to set up and test the workflow with your real accounts.',
    thirdParty: [
      'Everything in Website Launch',
      'Your booking tool’s subscription, if it charges',
      'Phone number and text-message usage, if the workflow sends texts',
    ],
    serviceIds: ['websites', 'seo', 'booking', 'enquiry-workflows', 'missed-calls'],
    page: '/services/enquiry-follow-up/',
    price: { amount: null, unit: 'one-time' },
  },
  {
    id: 'local-visibility',
    name: 'Local Visibility Setup',
    boundary: 'One eligible Google Business Profile, a short named list of other listings, a review routine and a before-and-after snapshot.',
    forWho: 'Service businesses that are hard to find on Google or Maps, or have few recent reviews.',
    includes: [
      'An eligibility check first: Google profiles are for businesses that meet customers in person, at your address or theirs',
      'Google Business Profile set up or cleaned up: category, services, hours, service area, photos and your contact or booking link',
      'Apple Maps, Bing and Facebook details made consistent; the exact list is named in your scope',
      'A review routine: your review link, a QR review card, a request message and reply templates',
      'A check of what ChatGPT, Gemini and Perplexity say about you',
      'A snapshot before any change, and the same checks repeated after, so you can see what changed',
    ],
    notIncluded: [
      'Guaranteed rankings, calls or reviews',
      'Buying reviews, or rewards for leaving them (Google does not allow either)',
      'Paid ads',
      'Ongoing monthly management (available separately)',
    ],
    youProvide: ['Owner or manager access to your Google profile', 'Photos of your real work', 'Your service area and hours'],
    timeline: 'Google’s verification can take days or longer and is outside my control; everything else follows your access and photos.',
    thirdParty: ['Printing the review cards, if you want printed ones'],
    serviceIds: ['business-profile', 'reviews', 'listings'],
    page: '/services/local-visibility/',
    price: { amount: null, unit: 'one-time' },
  },
  {
    id: 'care',
    name: 'Website Care',
    boundary: 'A monthly check of your enquiry path and up to 30 minutes of small edits; other providers bill you directly.',
    forWho: 'Owners who want their website and enquiry form kept working without having to think about it.',
    includes: [
      'Every month: a test enquiry through your form, and your booking link checked, end to end',
      'Up to 30 minutes of small edits: text, photos, hours and prices',
      'Updates where your site needs them; if something breaks, I tell you what happened and fix it, or quote the fix first',
      'A short monthly note: what was checked, what changed, and anything that needs your decision',
      'Stop any month: you keep the site, the change log and every login, and my access is removed',
    ],
    notIncluded: ['New pages or larger changes (quoted before any work starts)', 'Other providers’ bills'],
    youProvide: ['Edit requests by email', 'Access kept in your name'],
    timeline: 'Monthly, from the month you start. Stop any month.',
    thirdParty: ['Domain, hosting and tool subscriptions stay billed to you'],
    serviceIds: ['maintenance'],
    page: '/services/web-design/',
    price: { amount: null, unit: 'month' },
  },
];

/** Recommended low-commitment first step, free (see docs/11). */
export const checkUp: Package = {
  id: 'check-up',
  name: 'Free website and Google check',
  boundary: 'A written list of fixes for your current setup, most important first.',
  forWho: 'Owners in Toronto and the GTA who are not sure what to fix first. Free, with no obligation to buy anything.',
  includes: [
    'I look you up the way a customer would: Google, Maps, Apple Maps and AI assistants',
    'I compare your reviews with the top three businesses near you',
    'I send a test enquiry and, with your permission, call after hours to see what a customer experiences',
    'You receive a short written list of fixes, most important first',
  ],
  notIncluded: ['The fixes themselves, which I quote separately if you want them done'],
  youProvide: ['Your business name and website', 'Permission for a test call and a test enquiry'],
  timeline: 'I reply by email to arrange it.',
  thirdParty: [],
  serviceIds: ['business-profile', 'reviews', 'missed-calls'],
  page: '/contact/?package=check-up#check',
  price: { amount: 0, unit: 'one-time' },
  free: true,
};

/** Old package ids from links shared before round 10, mapped to the closest current offer. */
export const legacyPackageIds: Record<string, PackageId> = {
  launch: 'website-enquiry',
  found: 'local-visibility',
  answered: 'website-enquiry',
  website: 'website-launch',
};

/** Accepts a current or old package id; returns the current id, or '' if unknown. */
export function normalizePackageId(id: string | null | undefined): PackageId | '' {
  if (!id) return '';
  if ([...packages, checkUp].some((p) => p.id === id)) return id as PackageId;
  return legacyPackageIds[id] ?? '';
}

export const packageById = (id: string) => {
  const current = normalizePackageId(id);
  return current ? [...packages, checkUp].find((p) => p.id === current) : undefined;
};

/** True once at least one paid package has an approved price: /pricing/ is then linked and indexed. */
export const pricesPublished = packages.some((p) => p.price.amount !== null);

const cad = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

/** The one place price text is made, so every card, table and page says the same thing. */
export function priceLabel(p: Package): { text: string; approved: boolean } {
  if (p.free) return { text: 'Free', approved: true };
  if (p.price.amount === null) return { text: 'Written quote after a short brief', approved: false };
  const amount = cad.format(p.price.amount);
  return { text: p.price.unit === 'month' ? `From ${amount} a month` : `From ${amount}, one-time`, approved: true };
}
