import { profile, businesses, sameAs } from '../data/site';
import { groups, addOns, servicesInGroup } from '../data/services';
import { absoluteUrl } from './mode';

/**
 * Person structured data. Only verified facts and verified profile links (sameAs).
 * No ratings, address or awards.
 */
export function personJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@type': 'Person',
    name: profile.name,
    description: profile.descriptor,
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
    knowsAbout: ['Websites', 'Search engine optimisation', 'Google Search Console', 'Google Analytics 4', 'Business email', 'Social media content'],
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
 * The services Mann offers, as a ProfessionalService with an offer catalogue (one list per area).
 * Service names only, no address (he works across the GTA, not from premises).
 */
export function servicesJsonLd() {
  const url = absoluteUrl('/');
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `${profile.name}: websites, Google visibility and enquiry follow-up`,
    description: profile.descriptor,
    ...(url ? { url, image: new URL('/og/default.png', url).toString() } : {}),
    ...(profile.contact.email ? { email: profile.contact.email } : {}),
    areaServed: [
      { '@type': 'City', name: 'Toronto' },
      { '@type': 'AdministrativeArea', name: 'Greater Toronto Area' },
    ],
    founder: { '@type': 'Person', name: profile.name },
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services',
      itemListElement: [...groups, addOns].map((g) => ({
        '@type': 'OfferCatalog',
        name: g.title,
        itemListElement: servicesInGroup(g.id).map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.name, ...(url ? { url: `${url}services/#${s.id}` } : {}) },
        })),
      })),
    },
  };
}
