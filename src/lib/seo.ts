import { profile, businesses, sameAs } from '../data/site';
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
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: businesses.map((b) => ({ '@type': 'Organization', name: b.name, url: b.url })),
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
