import { profile, sameAs, businessSameAs } from '../data/site';
import { groups, addOns, servicesInGroup } from '../data/services';
import { servicePages, serviceHref } from '../data/service-pages';
import { packages } from '../data/packages';
import { contact } from './contact';
import { absoluteUrl } from './mode';

/**
 * Structured data. Two entities with stable ids that every other node points to:
 * - the business (`/#business`, ProfessionalService "Mann Patel"): phone, email, a city-level address,
 *   the areas served, the published price range and the Google Business Profile. It sells the services.
 * - Mann himself (`/#person`): a Toronto web designer, the business's founder.
 * Plus a WebSite on the home page and Service nodes on the service pages.
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

const areasServed = [
  { '@type': 'Place', name: 'Scarborough, Toronto, ON' },
  { '@type': 'Place', name: 'North York, Toronto, ON' },
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
    address: { '@type': 'PostalAddress', addressLocality: 'Scarborough', addressRegion: 'ON', addressCountry: 'CA' },
    areaServed: areasServed,
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

/** The three services the business leads with, each pointing at its own page (home page). */
function serviceCatalog() {
  const url = absoluteUrl('/');
  return {
    '@type': 'OfferCatalog',
    name: 'Services',
    itemListElement: [
      ...servicePages.map((p) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: p.h1,
          areaServed: 'Toronto',
          ...(url ? { url: `${url}services/${p.slug}/` } : {}),
        },
      })),
      // Part of the local visibility set-up, named on its own because people search for it.
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI search visibility check (GEO and AEO)',
          serviceType: 'Generative engine optimization',
          areaServed: 'Toronto',
          ...(url ? { url: `${url}services/local-visibility/#ai-search` } : {}),
        },
      },
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
