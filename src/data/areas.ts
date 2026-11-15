/**
 * Area pages (SEO audit Phase 3, 14 Nov 2026; docs/seo/PLAN.md B2): /web-design-<slug>/, rendered by
 * src/pages/web-design-[area].astro. Scarborough first: Mann is based there and Samp Hair & Spa is there.
 * North York added in the Nov 2026 audit fixes, with every neighbourhood listed, and published 15 Nov 2026.
 *
 * A page is an unpublished draft while `neighbourhoods` is null or empty, or while `localExample` is null (needed but
 * not supplied yet): built in previews (with a "To confirm" note) and in `astro dev`, never in production, the sitemap
 * or a link from another page. scripts/seo-check.mjs and the e2e suite read these from this file, so keep them written
 * as `slug: '…'`, `neighbourhoods: null` / `neighbourhoods: ['…']` and `localExample: null` / `localExample: '…'`.
 */
import type { Faq } from './service-pages';
import { packageById, priceLabel, type PackageId } from './packages';

const price = (id: PackageId) => priceLabel(packageById(id)!).text;

export interface Area {
  /** The address is /web-design-<slug>/. */
  slug: string;
  name: string;
  /** Page title for search results (" | Mann Patel" is added; 47 characters at most). */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  /** The H1 split into display lines; the last one is set in lime. Must join back to `h1`. */
  lines: string[];
  lead: string;
  /**
   * Neighbourhoods served, exactly as Mann lists them. Never invented. null (or empty) = not supplied yet,
   * and the page stays an unpublished draft.
   */
  neighbourhoods: string[] | null;
  /** The line above the neighbourhood list. Default: "Every neighbourhood in <name>, including:". */
  neighbourhoodsLead?: string;
  /**
   * One or two sentences on a real project in this area, exactly as Mann words it (Nov 2026 audit fixes), shown under
   * "Local work" with the projects whose location names the area. Leave it out where those projects say enough (the
   * Scarborough page). null = needed but not supplied: the page stays a draft, and previews show a "To confirm" note.
   */
  localExample?: string | null;
  faqs: Faq[];
}

export const areaIsDraft = (a: Pick<Area, 'neighbourhoods' | 'localExample'>) =>
  !a.neighbourhoods || a.neighbourhoods.length === 0 || a.localExample === null;
export const areaPath = (a: Pick<Area, 'slug'>) => `/web-design-${a.slug}/`;

export const areas: Area[] = [
  {
    slug: 'scarborough',
    name: 'Scarborough',
    title: 'Web Design in Scarborough, Ontario',
    description:
      'Web designer based in Scarborough, Ontario: websites, Google Business Profile setup and online booking for local small businesses, with published prices.',
    eyebrow: 'Based in Scarborough',
    h1: 'Web design in Scarborough, Ontario',
    lines: ['Web design in', 'Scarborough, Ontario'],
    lead: 'I’m Mann Patel, a web designer based in Scarborough, Ontario. I build websites, set up Google Business Profiles and connect online booking for small businesses here and across Toronto and the GTA, with my prices published.',
    // Mann serves every neighbourhood in Scarborough (15 Nov 2026). Names as Toronto uses them, checked against
    // Wikipedia's neighbourhood articles; Centennial (= Port Union) and Scarborough Junction (= Kennedy Park) are
    // left out as second names for the same places. The page says "including", so the list needn't be exhaustive.
    neighbourhoods: [
      'Agincourt',
      'Bendale',
      'Birch Cliff',
      'Bridlewood',
      'Clairlea',
      'Cliffcrest',
      'Cliffside',
      'Dorset Park',
      'Eglinton East',
      'Golden Mile',
      'Guildwood',
      'Highland Creek',
      'Ionview',
      'Kennedy Park',
      'L’Amoreaux',
      'Malvern',
      'Maryvale',
      'Milliken',
      'Morningside',
      'Morningside Heights',
      'Oakridge',
      'Port Union',
      'Rouge',
      'Scarborough City Centre',
      'Scarborough Village',
      'Steeles',
      'Tam O’Shanter–Sullivan',
      'West Hill',
      'West Rouge',
      'Wexford',
      'Woburn',
    ],
    faqs: [
      {
        q: 'Are you in Scarborough, Ontario, or Scarborough in England?',
        a: 'Scarborough, Ontario, in the east end of Toronto. I’m a web designer based here, and I work with small businesses across Toronto and the GTA.',
      },
      {
        q: 'Do you only work with businesses in Scarborough?',
        a: 'No. I’m based in Scarborough and work with small businesses across Toronto and the GTA, with a focus on Scarborough and North York.',
      },
      {
        q: 'Can you help my Scarborough business show up on Google Maps?',
        a: 'I set up or clean up your Google Business Profile, make your other listings match and give you a simple routine for asking every customer for a genuine review. Google decides local rankings, so no one can promise a position; you get a before-and-after snapshot of what changed.',
      },
      {
        q: 'What does a website cost?',
        a: `My prices are published: a website of up to five pages is ${price('website-launch')} CAD plus tax, a website with online booking and one follow-up workflow is ${price('website-enquiry')}, and Google Business Profile setup is ${price('local-visibility')}. Domain, hosting and tool subscriptions are billed to you directly by each provider.`,
      },
    ],
  },
  {
    // Nov 2026 audit fixes: scaffolded with the Scarborough page's structure and its own copy. Every sentence below is
    // already true elsewhere on the site (based in Scarborough; working across Toronto and the GTA with a focus on
    // Scarborough and North York; Nest & Rest Cleaning serves North York; the published prices and the free check).
    // It stays an unpublished draft (not built in production, not in the sitemap, not linked) until both TODOs are done.
    slug: 'north-york',
    name: 'North York',
    title: 'North York Web Designer for Small Businesses',
    description:
      'Web designer for small businesses in North York, Toronto: websites, Google Business Profile setup and online booking, with published prices.',
    eyebrow: 'North York, Toronto',
    h1: 'A web designer for North York small businesses',
    lines: ['A web designer for', 'North York small businesses'],
    lead: 'I’m Mann Patel, a web designer based in Scarborough who works with small businesses in North York and across Toronto and the GTA. I build websites, set up Google Business Profiles and connect online booking, and my prices are published.',
    // Mann serves every neighbourhood in North York (15 Nov 2026: "include all"). Names of the former City of North
    // York's neighbourhoods as Toronto uses them. Wikipedia couldn't be reached from the build session to check them,
    // so Mann reviews this list before the page is published. The page says "including", so it needn't be exhaustive.
    neighbourhoods: [
      'Amesbury',
      'Armour Heights',
      'Bathurst Manor',
      'Bayview Village',
      'Bayview Woods–Steeles',
      'Black Creek',
      'Bridle Path',
      'Clanton Park',
      'Don Mills',
      'Don Valley Village',
      'Downsview',
      'Flemingdon Park',
      'Glen Park',
      'Graydon Hall',
      'Henry Farm',
      'Hillcrest Village',
      'Hoggs Hollow',
      'Humber Summit',
      'Humbermede',
      'Humberlea',
      'Jane and Finch',
      'Lansing',
      'Lawrence Heights',
      'Lawrence Manor',
      'Ledbury Park',
      'Maple Leaf',
      'Newtonbrook',
      'North York Centre',
      'Oriole',
      'Parkway Forest',
      'Parkwoods',
      'Pelmo Park',
      'Rustic',
      'St. Andrew–Windfields',
      'Victoria Village',
      'Westminster–Branson',
      'Willowdale',
      'Wilson Heights',
      'York Mills',
      'York University Heights',
    ],
    // Published 15 Nov 2026 at Mann's request ("make it live"). The local work shown is Nest & Rest Cleaning, which
    // serves North York (its case study says so). TODO(Mann), optional: one or two sentences on a North York project in
    // your words; add them as `localExample: '…'` and they appear under "Local work".
    faqs: [
      {
        q: 'Do you work with businesses in North York?',
        a: 'Yes. North York and Scarborough are the two areas I focus on. I’m based in Scarborough and also work with small businesses across the rest of Toronto and the GTA.',
      },
      {
        q: 'How do you help a North York business get found on Google Maps?',
        a: 'Usually by starting with your Google Business Profile: the right category, services, hours and service area, real photos, and a routine for asking customers for genuine reviews. Your other listings are made to match. Google decides local rankings, so no one can promise a position; you see a before-and-after snapshot of what changed.',
      },
      {
        q: 'How much is a website?',
        a: `The prices are published. Up to five pages costs ${price('website-launch')} CAD plus tax; with online booking and one follow-up workflow, ${price('website-enquiry')}; Google Business Profile and listings set up, ${price('local-visibility')}. Your domain, hosting and tool subscriptions are billed to you by each provider, never marked up.`,
      },
      {
        q: 'Can I start with something smaller?',
        a: 'Yes. The free website and Google check is open to owners in Toronto and the GTA: I look you up the way a customer would and send a short written list of fixes, most important first, with no obligation.',
      },
    ],
  },
];

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug);
