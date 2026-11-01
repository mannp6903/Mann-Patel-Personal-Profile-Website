import portraitImage from '../assets/mann-patel-portrait.jpg';

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
  descriptor: 'Websites, Google visibility and follow-up systems for small businesses in Toronto and the GTA',
  intro:
    'I’m Mann Patel, founder of Nest & Rest Cleaning. I also help other owners set up the website, online presence, content and simple systems that keep new enquiries from slipping through.',
  /** Public location: based in Toronto, serves the GTA (confirmed by Mann, 31 Oct 2026). */
  location: 'Toronto',
  serviceArea: 'Toronto and the GTA',
  /** Real portrait only (supplied by Mann, 31 Oct 2026). */
  portrait: {
    src: portraitImage,
    alt: 'Mann Patel smiling, in a dark green sweatshirt, on a tree-lined street at dusk.',
  } as null | { src: ImageMetadata; alt: string },
  contact: {
    /** Verified business email for the public site, e.g. hello@yourdomain.ca */
    email: 'mannp6903claudeai@gmail.com' as null | string,
    /** E.164 format, only if Mann wants a public number. */
    phone: null as null | string,
    /** WhatsApp click-to-chat number in E.164, only if supplied. */
    whatsapp: null as null | string,
  },
};

/**
 * Social profiles. `url: null` = not supplied yet: shown as a greyed placeholder in
 * previews and hidden in production. Only real URLs go into structured data (sameAs).
 */
export const social: { id: 'github' | 'instagram' | 'facebook' | 'linkedin'; label: string; url: string | null }[] = [
  { id: 'github', label: 'GitHub', url: 'https://github.com/mannp6903' },
  { id: 'instagram', label: 'Instagram', url: null },
  { id: 'facebook', label: 'Facebook', url: null },
  { id: 'linkedin', label: 'LinkedIn', url: null },
];
export const sameAs = social.flatMap((s) => (s.url ? [s.url] : []));

export const businesses: Business[] = [
  {
    name: 'Nest & Rest Cleaning',
    url: 'https://nestnrestcleaning.com/',
    role: 'Founder & Owner',
    area: 'Scarborough and North York, Toronto',
    description:
      'Home cleaning with transparent prices, online booking requests and a written standard for every visit. Bookings open in summer 2027, and I’ll clean every home myself while the business grows.',
  },
];

export const nav = [
  { href: '/services/', label: 'Services' },
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
] as const;

export const primaryCta = { href: '/contact/', label: 'Start a project' } as const;
