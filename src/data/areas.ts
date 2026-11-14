/**
 * Area pages (SEO audit Phase 3, 14 Nov 2026; docs/seo/PLAN.md B2): /web-design-<slug>/, rendered by
 * src/pages/web-design-[area].astro. Scarborough first: Mann is based there and Samp Hair & Spa is there.
 * North York only later, once there is real proof there too (audit, keyword C17).
 *
 * A page is an unpublished draft while `neighbourhoods` is null or empty: built in previews (with a
 * "To confirm" note) and in `astro dev`, never in production, the sitemap or a link from another page.
 * scripts/seo-check.mjs reads `slug` and `neighbourhoods` from this file, so keep both written as
 * `slug: '…'` and `neighbourhoods: null` / `neighbourhoods: ['…']`.
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
  faqs: Faq[];
}

export const areaIsDraft = (a: Pick<Area, 'neighbourhoods'>) => !a.neighbourhoods || a.neighbourhoods.length === 0;
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
    // TODO(Mann): list the Scarborough neighbourhoods you serve, as plain names: ['First neighbourhood', 'Second neighbourhood']. The page publishes
    // (production build, sitemap, links from the service pages and footer) as soon as this list is filled in.
    neighbourhoods: null,
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
];

export const areaBySlug = (slug: string) => areas.find((a) => a.slug === slug);
