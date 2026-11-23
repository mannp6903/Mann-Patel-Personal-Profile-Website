import portraitImage from '../assets/mann-patel-portrait.png';

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
   * The one-sentence definition answer engines can quote (answer extractability, 19 Nov 2026). Third person and
   * self-contained, so it still reads right when lifted out of the page. (Home's "at a glance" summary that showed it was
   * removed on 22 Nov 2026, upgrade report R1.1.) It matches
   * the summary that opens public/llms.txt and the Person and business descriptions in the structured data
   * (src/lib/seo.ts): change them together.
   */
  definition:
    'Mann Patel is an independent web designer in Scarborough, Toronto, who builds websites, sets up local SEO and Google Business Profiles, and connects enquiry follow-up and online booking for small businesses in Toronto and the GTA.',
  /**
   * One identical line naming Mann and the business (23 Nov 2026 audit, ENT-1). AI answers mixed him up with other Mann
   * Patels, so the same words and the same link go everywhere: the Person and business structured data
   * (src/lib/seo.ts), the opening of public/llms.txt and About. Use it, word for word, as the LinkedIn headline (website
   * field: https://mannpatel.me), the first line of the Google Business Profile description, and the Instagram, YouTube
   * and GitHub bios.
   */
  entity: 'Mann Patel, independent web designer in Scarborough (mannpatel.me)',
  /**
   * Public location. 14 Nov 2026 (SEO audit): "Based in Scarborough, working across Toronto and the GTA".
   * A district only: never a street address (service-area business).
   */
  location: 'Scarborough',
  serviceArea: 'Toronto and the GTA',
  /**
   * Real portrait only. Since 23 Nov 2026 this is the square portrait Mann supplied (dark background, green
   * glow), used in the home hero and on About, and as public/brand/mann-patel-portrait.jpg for structured data.
   */
  portrait: {
    src: portraitImage,
    alt: 'Mann Patel smiling, in a dark green sweatshirt, against a dark background with a soft green glow.',
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
     * How quickly Mann replies to a message, as the end of "I reply by email …" (23 Nov 2026 audit, CONV-2), e.g.
     * 'within 1 business day'. Shown on /contact/, on /contact/received/ and in the footer (src/lib/reply.ts).
     * null = not shown anywhere.
     * TODO(Mann): the audit's copy deck suggests "within 1 business day" (audit/mannpatel-me-copy-and-keywords-2026-11-23.md
     * §2.5). Not set here: it's a promise only you can make. Pick a time you can keep every week.
     */
    replyTime: null as null | string,
    /**
     * When the free check's list of fixes arrives, as the end of "I’ll email your list of fixes …" (CONV-2), e.g.
     * 'within 2 business days'. Shown under the free-check button, on /contact/received/, under the home hero's button
     * and in the check's confirmation message (src/lib/reply.ts). null = not shown.
     * TODO(Mann): the audit suggests "within 2 business days" (§2.1 and backlog CONV-2). Set it once you know how many
     * checks you can do a week.
     */
    checkTime: null as null | string,
  },
};

/**
 * Mann's YouTube channel (competitor gap work, 16 Nov 2026): a button in the footer and on About, in the Person and
 * business structured data (sameAs) and in About's "Find me elsewhere" list, all from this one value.
 * Set 22 Nov 2026: @mannpatel.frames (supplied by Mann, for the 25 Nov 2026 launch). null hides it everywhere.
 */
const youtubeUrl: string | null = 'https://www.youtube.com/@mannpatel.frames';

/**
 * A free 15-minute call (competitor gap work, 16 Nov 2026; upgrade report R7.1, 22 Nov 2026): a "Book a 15-minute
 * call" button (src/components/ui/BookingButton.astro) beside the main action in the hero and the footer close, in the
 * phone action bar, and on /contact/, /contact/received/, /pricing/ and the area pages, opening in a new tab. A plain
 * link: no embed, script or extra dependency.
 * TODO(Mann): your Google Calendar appointment schedule or Cal.com link ("15-minute intro call", 15 minutes, a
 * 15-minute buffer, at least 24 hours' notice). null = no booking button anywhere (the phone bar offers "Call" instead).
 */
export const bookingUrl: string | null = null;

/**
 * Social profiles. `url: null` = not supplied yet: shown as a greyed placeholder in
 * previews and hidden in production. Only real URLs go into structured data (sameAs).
 */
export const social: { id: 'github' | 'instagram' | 'facebook' | 'linkedin' | 'youtube'; label: string; url: string | null }[] = [
  // LinkedIn supplied by Mann, 9 Nov 2026 (tracking parameters removed).
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/mannp6903/' },
  // Instagram: mannpatel.frames, Mann's account (confirmed by Mann, 22 Nov 2026, for the 25 Nov 2026 launch). It shows
  // as a button and joins the Person structured data (sameAs).
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/mannpatel.frames/' },
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
  /**
   * The star rating and review count Google Maps shows for the profile (23 Nov 2026 audit, PROOF-1 and HERO-1). With
   * both set, the home hero's proof line reads "★ 5.0 from 3 Google reviews", linked to the profile; while either is
   * null it names the project in progress instead. Never estimated: copy both from the profile, and update them when
   * they change.
   * TODO(Mann): fill these in once real clients have left Google reviews (the audit's target: 3 by 31 Dec 2026).
   */
  rating: null as number | null,
  reviewCount: null as number | null,
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

/**
 * One set of action labels, word for word everywhere (upgrade report R7.2, 22 Nov 2026). The primary action is the free
 * check (lime); the secondary is the 15-minute call (ghost, only once bookingUrl is set); the header uses the primary's
 * short form. "Start a project", "Request the free check" and a "Contact" button are retired (Contact stays a link).
 */
export const cta = {
  check: 'Get a free website check',
  checkShort: 'Free check',
  checkHref: '/contact/?package=check-up#check',
  booking: 'Book a 15-minute call',
  brief: 'Send a short brief',
  briefHref: '/contact/#brief',
} as const;

/** The header's button (short label) and the phone menu's (full label). */
export const primaryCta = { href: cta.checkHref, label: cta.check, short: cta.checkShort } as const;
