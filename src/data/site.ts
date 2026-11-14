import portraitImage from '../assets/mann-patel-portrait.jpg';
import heroImage from '../assets/mann-patel-hero.jpg';

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
  /**
   * Does `url` load the real site today? While false, this site never links out to it: mentions go
   * to `caseStudy`, the "Visit" button is hidden and the status reads `pausedStatus`
   * (src/lib/work.ts). Check the address in a browser, then set true and run `npm run images`.
   */
  siteLive: boolean;
  /** When `siteLive` was last checked (YYYY-MM-DD). */
  siteChecked: string;
  /** The case study on this site. */
  caseStudy: string;
  /** Website status shown on cards and the case study while the address is unreachable. */
  pausedStatus: string;
  /** One plain sentence on the case study while the address is unreachable. */
  pausedNote: string;
  role: string;
  area: string;
  description: string;
}

export const profile = {
  name: 'Mann Patel',
  /** Short wordmark used in the header. */
  wordmark: 'Mann Patel',
  headline: 'Web design, local SEO and automation for Toronto businesses.',
  descriptor: 'Local SEO, Google Business Profile, AI search visibility (GEO and AEO), web design and enquiry automation for businesses in Toronto and the GTA',
  intro:
    'I’m Mann Patel, a Toronto web designer and AI automation builder. I help local businesses get found on Google, reply to enquiries faster, and turn website visits into booking requests.',
  /** Public location: based in Toronto, serves the GTA (confirmed by Mann, 31 Oct 2026). */
  location: 'Toronto',
  serviceArea: 'Toronto and the GTA',
  /** Real portrait only (supplied by Mann, 31 Oct 2026). */
  portrait: {
    src: portraitImage,
    alt: 'Mann Patel smiling, in a dark green sweatshirt, on a tree-lined street at dusk.',
  } as null | { src: ImageMetadata; alt: string },
  /** Closer crop of the same photo for the round core of the home hero graph (supplied by Mann, 14 Nov 2026). */
  heroPortrait: {
    src: heroImage,
    alt: 'Mann Patel smiling, in a dark green sweatshirt, on a tree-lined street at dusk.',
  } as null | { src: ImageMetadata; alt: string },
  contact: {
    /** Public business email (Cloudflare Email Routing forwards it to Mann's inbox). */
    email: 'info@mannpatel.me' as null | string,
    /**
     * Mann's business number for Call / WhatsApp / Text (supplied by Mann, 9 Nov 2026), stored encoded
     * (reversed digits, base64) so it isn't plain text in this public repository; pages show it masked
     * and the buttons decode it in the browser. The build variable PUBLIC_CONTACT_PHONE overrides it.
     * Set to null to hide the phone buttons. See src/lib/contact.ts.
     */
    phoneKey: 'MzA5Njg3OTc0NjE=' as null | string,
  },
};

/**
 * Social profiles. `url: null` = not supplied yet: shown as a greyed placeholder in
 * previews and hidden in production. Only real URLs go into structured data (sameAs).
 */
export const social: { id: 'github' | 'instagram' | 'facebook' | 'linkedin'; label: string; url: string | null }[] = [
  // LinkedIn supplied by Mann, 9 Nov 2026 (tracking parameters removed).
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/mannp6903/' },
  // Instagram: Mann will send the link; the button appears as soon as `url` is set.
  { id: 'instagram', label: 'Instagram', url: null },
  { id: 'github', label: 'GitHub', url: 'https://github.com/mannp6903' },
  { id: 'facebook', label: 'Facebook', url: null },
];
export const sameAs = social.flatMap((s) => (s.url ? [s.url] : []));

export const businesses: Business[] = [
  {
    name: 'Nest & Rest Cleaning',
    url: 'https://nestnrestcleaning.com/',
    // 10 Nov 2026: the growth audit reported a "site not found" page here earlier in the day;
    // rechecked at 10:36 the same morning and the site loads, so the link stays on. If the address
    // ever stops loading, set this to false: every mention then points at the case study instead.
    siteLive: true,
    siteChecked: '2026-11-10',
    caseStudy: '/work/nest-and-rest-cleaning/',
    pausedStatus: 'Launched Oct 2026 · live link paused',
    pausedNote:
      'The public address didn’t load when it was checked on 10 Nov 2026, so the link to it is paused. The screens and tests on this page come from the live site on the dates shown.',
    // 14 Nov 2026: not "Founder" until the business is registered (Mann's call).
    role: 'Getting it ready to open',
    area: 'Scarborough and North York, Toronto',
    description:
      'Home cleaning in Scarborough and North York with prices shown up front, a room-by-room checklist of what’s included, and the owner at the door. The site says “Opening soon” until bookings open in summer 2027, and I’ll clean every home myself while the business grows.',
  },
];

/** Main menu (14 Nov 2026): the order a new client reads in: proof, what I do, what it costs, who I am. */
export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/services/', label: 'Services' },
  { href: '/pricing/', label: 'Pricing' },
  { href: '/about/', label: 'About' },
  // 14 Nov 2026: what Mann is building, and an open door to professionals who want to build with him.
  { href: '/vision/', label: 'Vision' },
] as const;

export const primaryCta = { href: '/contact/', label: 'Contact' } as const;
