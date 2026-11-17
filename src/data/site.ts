import portraitImage from '../assets/mann-patel-hero.jpg';

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
  /**
   * Public location. 14 Nov 2026 (SEO audit): "Based in Scarborough, working across Toronto and the GTA".
   * A district only: never a street address (service-area business).
   */
  location: 'Scarborough',
  serviceArea: 'Toronto and the GTA',
  /**
   * Real portrait only. Since 14 Nov 2026 this is the closer crop Mann supplied, used in the home hero
   * graph and on About (the wider 31 Oct 2026 crop, assets/mann-patel-portrait.jpg, is no longer used).
   */
  portrait: {
    src: portraitImage,
    alt: 'Mann Patel smiling, in a dark green sweatshirt, on a tree-lined street at dusk.',
  } as null | { src: ImageMetadata; alt: string },
  contact: {
    /** Public business email (Cloudflare Email Routing forwards it to Mann's inbox). */
    email: 'info@mannpatel.me' as null | string,
    /**
     * Mann's business number for Call / WhatsApp / Text (supplied by Mann, 9 Nov 2026), stored encoded
     * (reversed digits, base64). Since 14 Nov 2026 (SEO audit, Mann's decision) pages show it in full as a
     * tap-to-call link and the business structured data lists it, so it matches Google Business Profile
     * and directory listings. The build variable PUBLIC_CONTACT_PHONE overrides it.
     * Set to null to hide the phone. See src/lib/contact.ts.
     */
    phoneKey: 'MzA5Njg3OTc0NjE=' as null | string,
    /**
     * One line on how quickly Mann replies, shown on /contact/ (under "Prefer to talk?") and in the footer's Contact
     * column. Nov 2026 audit fixes. null = not shown.
     * TODO(Mann): your wording, e.g. how soon you reply and on which days. Not written here: it's a promise only you
     * can make.
     */
    replyTime: null as null | string,
  },
};

/**
 * Mann's YouTube channel (competitor gap work, 16 Nov 2026): a button in the footer and on About, in the Person and
 * business structured data (sameAs) and in About's "Find me elsewhere" list, all from this one value.
 * TODO(Mann): your channel URL (for example https://www.youtube.com/@…). Never guessed: null keeps it hidden.
 */
const youtubeUrl: string | null = null;

/**
 * A free 15-minute call (competitor gap work, 16 Nov 2026): a "Book a free 15-minute call" button on /contact/,
 * /pricing/ and the area pages, opening in a new tab. A plain link: no embed, script or extra dependency.
 * TODO(Mann): your Google Calendar appointment schedule or Cal.com link. null = no button anywhere.
 */
export const bookingUrl: string | null = null;

/**
 * Social profiles. `url: null` = not supplied yet: shown as a greyed placeholder in
 * previews and hidden in production. Only real URLs go into structured data (sameAs).
 */
export const social: { id: 'github' | 'instagram' | 'facebook' | 'linkedin' | 'youtube'; label: string; url: string | null }[] = [
  // LinkedIn supplied by Mann, 9 Nov 2026 (tracking parameters removed).
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/mannp6903/' },
  // Instagram: Mann will send the link; the button appears as soon as `url` is set.
  { id: 'instagram', label: 'Instagram', url: null },
  { id: 'github', label: 'GitHub', url: 'https://github.com/mannp6903' },
  // TODO(Mann): Facebook Page URL. It then appears as a button, in About's "Find me elsewhere" list and in the business
  // structured data (sameAs).
  { id: 'facebook', label: 'Facebook', url: null },
  // 16 Nov 2026: from `youtubeUrl` above (hidden while it is null).
  { id: 'youtube', label: 'YouTube', url: youtubeUrl },
];
/** Mann's own profiles (Person sameAs). The Facebook Page belongs to the business, below. */
export const sameAs = social.flatMap((s) => (s.url && s.id !== 'facebook' ? [s.url] : []));

/**
 * Google Business Profile (live, supplied by Mann 14 Nov 2026). Service-area business: the home address
 * is hidden on the profile and never published here.
 * - `url`: the share link, used for the visible "on Google Maps" links.
 * - `mapsUrl`: the full Google Maps address of the profile, for the business structured data (sameAs). A short
 *   maps.app.goo.gl link is a redirect, so search engines match the full one more reliably.
 *   15 Nov 2026: the stable cid form, worked out from the share link and checked to open the "Mann Patel" profile.
 */
export const gbp = {
  url: 'https://maps.app.goo.gl/dYccTa9jQJczpeac6',
  mapsUrl: 'https://www.google.com/maps?cid=5023923139940890210' as string | null,
  /**
   * The review link from the Business Profile ("Ask for reviews" / "Get more reviews" → copy the link), for the
   * footer's "Clients: leave a Google review" (16 Nov 2026).
   * TODO(Mann): paste the link Google gives you. null = the footer link is hidden.
   */
  reviewUrl: null as string | null,
};

/**
 * The business's own profiles, for the business structured data only (they are not shown as buttons here).
 * YouTube comes from `youtubeUrl` above. LinkedIn is the personal profile (no separate business page), added
 * 15 Nov 2026 so the business entity links to the same person.
 * Clutch (16 Nov 2026): the business's Clutch directory profile.
 * TODO(Mann): your Clutch profile URL (https://clutch.co/profile/…). Never guessed: null leaves it out.
 */
export const businessProfiles: { youtube: string | null; linkedin: string | null; clutch: string | null } = {
  youtube: youtubeUrl,
  linkedin: 'https://www.linkedin.com/in/mannp6903/',
  clutch: null,
};

/** The business logo (512 × 512, from public/favicon.svg by `npm run images`), for the business structured data. */
export const logo = { src: '/brand/mann-patel-logo.png', width: 512, height: 512 } as const;

/**
 * The business's own profiles (business sameAs): Google Business Profile, plus the Facebook Page, YouTube, LinkedIn
 * and Clutch once set.
 */
export const businessSameAs = [
  gbp.mapsUrl ?? gbp.url,
  ...social.flatMap((s) => (s.id === 'facebook' && s.url ? [s.url] : [])),
  ...[businessProfiles.youtube, businessProfiles.linkedin, businessProfiles.clutch].filter((u): u is string => Boolean(u)),
];

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

/**
 * Main menu (14 Nov 2026): the order a new client reads in: proof, what I do, what it costs, who I am.
 * Header (desktop and phone menu) and footer read it through visibleNav() (src/lib/published.ts), which leaves out
 * Pricing while no price is published and Guides while no guide is.
 */
export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/services/', label: 'Services' },
  { href: '/pricing/', label: 'Pricing' },
  // Nov 2026 audit fixes: the guides join the menu (they were linked from the footer only).
  { href: '/guides/', label: 'Guides' },
  { href: '/about/', label: 'About' },
] as const;

/**
 * Footer-only pages (design upgrade Phase 2, decision D3, 17 Nov 2026): Vision moved out of the main menu and the phone
 * menu so the menu holds five links; it stays one click away in the footer's Pages column.
 */
export const footerPages = [
  // 14 Nov 2026: what Mann is building, and an open door to professionals who want to build with him.
  { href: '/vision/', label: 'Vision' },
] as const;

export const primaryCta = { href: '/contact/', label: 'Contact' } as const;
