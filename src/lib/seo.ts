import { profile, sameAs, businessSameAs, logo } from '../data/site';
import { groups, addOns, servicesInGroup } from '../data/services';
import { servicePages, moreServicePages, serviceHref } from '../data/service-pages';
import { packages, packageById, type Package } from '../data/packages';
import { areas, areaIsDraft, areaPath } from '../data/areas';
import { contact } from './contact';
import type { Video } from '../data/videos';
import { absoluteUrl } from './mode';

/**
 * Structured data. Two entities with stable ids that every other node points to:
 * - the business (`/#business`, ProfessionalService "Mann Patel"): phone, email, a city-level address,
 *   the areas served, the published price range and the Google Business Profile. It sells the services.
 * - Mann himself (`/#person`): a Toronto web designer, the business's founder.
 * Plus a WebSite on the home page, Service nodes on the service and industry pages, BlogPosting on the guides
 * (src/layouts/GuideLayout.astro), FAQPage only where the questions are visible, and BreadcrumbList wherever a
 * breadcrumb shows (scripts/seo-check.mjs enforces these by page type). Every price comes from
 * src/data/packages.ts through offerPrice(), so the markup and /pricing/ can't drift apart.
 *
 * Only verified facts and verified profile links (sameAs). Never a rating, review, street address,
 * postal code or award (SEO audit rules, 14 Nov 2026).
 *
 * 14 Nov 2026 (SEO audit): the business node is back as ProfessionalService, as the audit and Mann asked.
 * schema.org marks that general type as deprecated, but Google still accepts it as a LocalBusiness
 * subtype. The Person no longer says worksFor Nest & Rest Cleaning (it read as an employer).
 */
const home = () => absoluteUrl('/') ?? '/';
export const personId = () => `${home()}#person`;
export const websiteId = () => `${home()}#website`;
export const businessId = () => `${home()}#business`;

/** A reference to Mann from another node (business founder, WebSite publisher, page main entity). */
export const personRef = () => ({ '@type': 'Person', '@id': personId(), name: profile.name });
/** A reference to the business from another node (Service provider, Offer seller). */
export const businessRef = () => ({ '@type': 'ProfessionalService', '@id': businessId(), name: profile.name });

const cad = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

/** "$149–$3,350 CAD": the lowest and highest published prices in src/data/packages.ts. */
export function priceRange(): string | null {
  const amounts = packages.flatMap((p) => [p.price.amount, p.price.max ?? null]).filter((n): n is number => typeof n === 'number' && n > 0);
  if (!amounts.length) return null;
  return `${cad.format(Math.min(...amounts))}–${cad.format(Math.max(...amounts))} CAD`;
}

/**
 * The price fields of an Offer for a package, from src/data/packages.ts (the data /pricing/ shows), so the
 * structured data can never disagree with the page. Empty while a package has no approved price.
 * - fixed price (Website Launch $1,950): price + priceCurrency
 * - a range (Website Fix $450–$850): priceCurrency + a PriceSpecification with minPrice and maxPrice (no single
 *   `price`, which would claim the low end is the price)
 * - monthly (Website Care $149 a month): price + priceCurrency + a UnitPriceSpecification per month
 */
export function offerPrice(p: Package): Record<string, unknown> {
  const amount = p.price.amount;
  if (amount === null) return {};
  if (p.price.max)
    return {
      priceCurrency: 'CAD',
      priceSpecification: { '@type': 'PriceSpecification', minPrice: amount, maxPrice: p.price.max, priceCurrency: 'CAD' },
    };
  if (p.price.unit === 'month')
    return {
      price: amount,
      priceCurrency: 'CAD',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: amount,
        priceCurrency: 'CAD',
        unitCode: 'MON',
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
      },
    };
  return { price: amount, priceCurrency: 'CAD' };
}

/** An Offer for a package with an approved price (Service and industry pages, the business catalogue). */
export function packageOffer(p: Package): Record<string, unknown> {
  return { '@type': 'Offer', name: p.name, description: p.boundary, ...offerPrice(p) };
}

/**
 * Where the business works: one Place per published area page in src/data/areas.ts (Scarborough, North York), with
 * the address of its page, then Toronto. Nov 2026 audit fixes: read from the area data, so a new area page joins
 * areaServed by itself. Website Playbook (16 Nov 2026): draft areas (Markham, Pickering, East York, Ajax) stay out
 * until their page is published, as they do from the sitemap and every link.
 */
const areasServed = () => [
  ...areas
    .filter((a) => !areaIsDraft(a))
    .map((a) => {
      const url = absoluteUrl(areaPath(a));
      return { '@type': 'Place', name: `${a.name}, Toronto, ON`, ...(url ? { url } : {}) };
    }),
  { '@type': 'City', name: 'Toronto' },
];

/**
 * The business: one ProfessionalService node. Full on the home page and /contact/ (and the Scarborough
 * page later); other pages point at it by id. City-level address only: Mann is a service-area business.
 */
export function businessJsonLd({ withServices = false }: { withServices?: boolean } = {}) {
  const url = absoluteUrl('/');
  const range = priceRange();
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': businessId(),
    name: profile.name,
    description:
      'Toronto web designer: websites, local SEO and Google Business Profile setup for small businesses in Scarborough, North York and across Toronto, with published prices.',
    ...(url ? { url } : {}),
    ...(contact.phone ? { telephone: contact.phone.schema } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(profile.portrait && url ? { image: new URL('/brand/mann-patel-portrait.jpg', url).toString() } : {}),
    // The MΛNN PΛTEL icon, 512 × 512 (Google asks for at least 112 × 112).
    ...(url
      ? {
          logo: {
            '@type': 'ImageObject',
            url: new URL(logo.src, url).toString(),
            contentUrl: new URL(logo.src, url).toString(),
            width: logo.width,
            height: logo.height,
          },
        }
      : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'Scarborough', addressRegion: 'ON', addressCountry: 'CA' },
    areaServed: areasServed(),
    ...(range ? { priceRange: range } : {}),
    founder: personRef(),
    ...(businessSameAs.length ? { sameAs: businessSameAs } : {}),
    ...(withServices ? { hasOfferCatalog: serviceCatalog() } : {}),
  };
}

export function personJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@type': 'Person',
    '@id': personId(),
    name: profile.name,
    jobTitle: 'Web designer',
    description: 'Toronto web designer: websites, local SEO and Google Business Profile setup for small businesses in Toronto and the GTA.',
    // Tells search engines (and AI answers) which Mann Patel this is: the name is shared by many developers
    // online (SEO audit, 14 Nov 2026), and Nov 2026 searches mixed this site up with a similar domain.
    disambiguatingDescription: 'Toronto web designer based in Scarborough, Ontario, Canada, who runs mannpatel.me',
    ...(url ? { url } : {}),
    // The real portrait (square crop, public/brand/), not the social share card.
    ...(profile.portrait && url ? { image: new URL('/brand/mann-patel-portrait.jpg', url).toString() } : {}),
    ...(profile.contact.email ? { email: `mailto:${profile.contact.email}` } : {}),
    ...(profile.contact.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'new projects',
            email: profile.contact.email,
            ...(contact.phone ? { telephone: contact.phone.schema } : {}),
            areaServed: ['Toronto', 'Greater Toronto Area'],
            availableLanguage: 'English',
          },
        }
      : {}),
    homeLocation: { '@type': 'Place', name: 'Scarborough, Toronto, Ontario, Canada' },
    ...(sameAs.length ? { sameAs } : {}),
    knowsAbout: [
      'Web design',
      'Website redesign',
      'Local SEO',
      'Google Business Profile',
      'Answer engine optimization (AEO)',
      'Generative engine optimization (GEO)',
      'AI search visibility',
      'Google AI Overviews',
      'Structured data (schema.org)',
      'Google Search Console',
      'Google Analytics 4',
      'AI automation for small businesses',
      'Enquiry follow-up',
      'Missed-call text-back',
      'Online booking setup',
      'Website maintenance',
    ],
  };
}

/** The site itself, published by Mann. Home page only (it also sets the site name in search results). */
export function websiteJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId(),
    name: profile.name,
    alternateName: 'mannpatel.me',
    ...(url ? { url } : {}),
    inLanguage: 'en-CA',
    publisher: personRef(),
  };
}

/**
 * A demo video (src/data/videos.ts), on the page that shows it with its transcript (SEO report follow-up,
 * 19 Nov 2026). Google's required fields (name, thumbnail, upload date) plus the length, the transcript and who made
 * it. Never a view count, rating or interaction count.
 */
export function videoJsonLd(v: Video) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: v.description,
    thumbnailUrl: v.thumbnail,
    uploadDate: v.uploadDate,
    duration: v.duration,
    url: v.url,
    ...(v.embedUrl ? { embedUrl: v.embedUrl } : {}),
    transcript: v.transcript,
    inLanguage: 'en-CA',
    author: personRef(),
    publisher: businessRef(),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  if (!absoluteUrl('/')) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/**
 * What the business sells (home page): one Offer per published package, priced from src/data/packages.ts (the
 * same data as /pricing/), each pointing at the service page that explains it. Plus the AI search check, named
 * on its own because people search for it: it is part of Local Visibility Setup, so it carries that price.
 */
function serviceCatalog() {
  const url = absoluteUrl('/');
  const pages = [...servicePages, ...moreServicePages];
  const service = (name: string, page: string, serviceType?: string) => ({
    '@type': 'Service',
    name,
    ...(serviceType ? { serviceType } : {}),
    areaServed: 'Toronto',
    ...(url ? { url: new URL(page, url).toString() } : {}),
  });
  const localVisibility = packageById('local-visibility');
  return {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: [
      ...packages
        .filter((p) => p.price.amount !== null)
        .map((p) => ({
          ...packageOffer(p),
          itemOffered: service(p.name, p.page, pages.find((s) => `/services/${s.slug}/` === p.page)?.short),
        })),
      ...(localVisibility && localVisibility.price.amount !== null
        ? [
            {
              '@type': 'Offer',
              name: 'AI search visibility check (GEO and AEO)',
              description: `Part of ${localVisibility.name}.`,
              ...offerPrice(localVisibility),
              itemOffered: service('AI search visibility check (GEO and AEO)', '/services/ai-search-optimization/', 'Generative engine optimization'),
            },
          ]
        : []),
    ],
  };
}

/**
 * Everything on the services overview, as an offer catalogue sold by the business (one list per area).
 * Service names only, no address (Mann works across the GTA, not from premises).
 */
export function servicesJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: `Services by ${profile.name}`,
    ...(url ? { url: `${url}services/` } : {}),
    itemListElement: [...groups, addOns].map((g) => ({
      '@type': 'OfferCatalog',
      name: g.title,
      itemListElement: servicesInGroup(g.id).map((s) => ({
        '@type': 'Offer',
        offeredBy: businessRef(),
        areaServed: [
          { '@type': 'City', name: 'Toronto' },
          { '@type': 'AdministrativeArea', name: 'Greater Toronto Area' },
        ],
        itemOffered: { '@type': 'Service', name: s.name, ...(url ? { url: new URL(serviceHref(s.id), url).toString() } : {}) },
      })),
    })),
  };
}
