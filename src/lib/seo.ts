import { profile, businesses, sameAs } from '../data/site';
import { groups, addOns, servicesInGroup } from '../data/services';
import { servicePages } from '../data/service-pages';
import { absoluteUrl } from './mode';

/**
 * Structured data. One Person (Mann) with a stable id that every other node points to, a WebSite
 * on the home page, and Service nodes on the service pages. Only verified facts and verified
 * profile links (sameAs). No ratings, street address or awards.
 *
 * The earlier "ProfessionalService" node is gone: schema.org deprecated that general type, and
 * Mann sells as a person, not from premises (growth report, 10 Nov 2026).
 */
const home = () => absoluteUrl('/') ?? '/';
export const personId = () => `${home()}#person`;
export const websiteId = () => `${home()}#website`;

/** A reference to Mann from another node (Service provider, WebSite publisher, page main entity). */
export const personRef = () => ({ '@type': 'Person', '@id': personId(), name: profile.name });

export function personJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@type': 'Person',
    '@id': personId(),
    name: profile.name,
    jobTitle: 'Web designer, local SEO and AI automation consultant',
    description: profile.descriptor,
    // Tells search engines (and Google's AI Overview) which Mann Patel this is: Nov 2026 searches for
    // "mann patel.me" mixed this site up with a different person's similarly named domain.
    disambiguatingDescription: 'Web designer, local SEO and AI search (GEO/AEO) consultant based in Toronto, Ontario, Canada (mannpatel.me)',
    ...(url ? { url } : {}),
    // The real portrait (square crop, public/brand/), not the social share card.
    ...(profile.portrait && url ? { image: new URL('/brand/mann-patel-portrait.jpg', url).toString() } : {}),
    ...(profile.contact.email ? { email: `mailto:${profile.contact.email}` } : {}),
    // The phone number is deliberately left out of structured data (privacy).
    ...(profile.contact.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'new projects',
            email: profile.contact.email,
            areaServed: ['Toronto', 'Greater Toronto Area'],
            availableLanguage: 'English',
          },
        }
      : {}),
    homeLocation: { '@type': 'Place', name: 'Toronto, Ontario, Canada' },
    ...(sameAs.length ? { sameAs } : {}),
    // The organisation's address is listed only while it loads (see `siteLive` in src/data/site.ts).
    worksFor: businesses.map((b) => ({ '@type': 'Organization', name: b.name, ...(b.siteLive ? { url: b.url } : {}) })),
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

/**
 * Mann with the three services he leads with, each pointing at its own page (home page).
 */
export function personWithServicesJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    ...personJsonLd(),
    hasOfferCatalog: {
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
    },
  };
}

/**
 * Everything on the services overview, as an offer catalogue that belongs to Mann (one list per
 * area). Service names only, no address (he works across the GTA, not from premises).
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
        offeredBy: personRef(),
        areaServed: [
          { '@type': 'City', name: 'Toronto' },
          { '@type': 'AdministrativeArea', name: 'Greater Toronto Area' },
        ],
        itemOffered: { '@type': 'Service', name: s.name, ...(url ? { url: `${url}services/#${s.id}` } : {}) },
      })),
    })),
  };
}
