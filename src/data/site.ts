/**
 * Profile and site settings.
 *
 * `null` means "not supplied yet". Components hide anything that is null in
 * production and show a visible "To confirm" note in preview builds.
 * Never put placeholder emails or phone numbers here.
 */

export interface Business {
  name: string;
  url: string;
  role: string;
  area: string;
  description: string;
}

export const profile = {
  name: 'Mann Patel',
  /** Short wordmark used in the header. */
  wordmark: 'Mann Patel',
  headline: 'I help small businesses look professional, get found, and follow up.',
  descriptor: 'Websites, Google visibility and follow-up systems for small businesses in Toronto',
  intro:
    'I’m Mann Patel, founder of Nest & Rest Cleaning. I also help other owners set up the website, online presence, content and simple systems that keep new enquiries from slipping through.',
  /** Public location styling — confirm (Toronto? Scarborough? GTA?). */
  location: 'Toronto',
  locationConfirmed: false,
  serviceArea: 'Toronto and the GTA',
  /** Real portrait only. Path under src/assets, or null. */
  portrait: null as null | { src: string; alt: string },
  contact: {
    /** Verified business email for the public site, e.g. hello@yourdomain.ca */
    email: null as null | string,
    /** E.164 format, only if Mann wants a public number. */
    phone: null as null | string,
    /** WhatsApp click-to-chat number in E.164, only if supplied. */
    whatsapp: null as null | string,
  },
  /** Verified profile URLs only (used for links and structured data sameAs). */
  sameAs: [] as string[],
};

export const businesses: Business[] = [
  {
    name: 'Nest & Rest Cleaning',
    url: 'https://nestnrestcleaning.com/',
    role: 'Founder & Owner',
    area: 'Scarborough and North York, Toronto',
    description:
      'Home cleaning with transparent prices, online booking requests and a written standard for every visit. I clean every home myself while the business grows.',
  },
];

export const nav = [
  { href: '/services/', label: 'Services' },
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
] as const;

export const primaryCta = { href: '/contact/', label: 'Start a project' } as const;
