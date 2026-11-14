/**
 * What is public (SEO audit Phase 3, 14 Nov 2026). Drafts (guides with `draft: true`, area pages without
 * neighbourhoods) are built in previews and `astro dev` so Mann can review them, and never in a production
 * build: not built, not in the sitemap, not linked. Every page and link that depends on a draft asks here.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { indexing, isProduction } from './mode';
import { areas, areaIsDraft, areaPath } from '../data/areas';

/** Never in production, and never in a build search engines may index (even if SITE_MODE was left at preview). */
export const showDrafts = !isProduction && !indexing;

/** Guides to build and link: published ones newest first, then drafts (previews only), by title. */
export async function visibleGuides(): Promise<CollectionEntry<'guides'>[]> {
  const all = await getCollection('guides', (g) => showDrafts || !g.data.draft);
  return all.sort(
    (a, b) =>
      Number(a.data.draft) - Number(b.data.draft) ||
      (b.data.published ?? '').localeCompare(a.data.published ?? '') ||
      a.data.title.localeCompare(b.data.title),
  );
}

/** Area pages to build and link. */
export const visibleAreas = () => areas.filter((a) => showDrafts || !areaIsDraft(a));

/** The address of an area page, or null while it isn't public (so nothing links to it). */
export const areaHref = (slug: string) => {
  const a = visibleAreas().find((x) => x.slug === slug);
  return a ? areaPath(a) : null;
};
