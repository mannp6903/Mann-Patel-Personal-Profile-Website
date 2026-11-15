import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { guideDates, lastmodFor, sourcesFor } from '../../scripts/sitemap-lastmod.mjs';

const guides = readdirSync('src/content/guides')
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));

describe('sitemap <lastmod>: each page’s own date, never the build time', () => {
  it('a published guide uses its front matter: `updated`, else `published` (the date the page shows)', () => {
    for (const slug of guides) {
      const d = guideDates(slug);
      if (!d || d.draft) continue;
      expect(lastmodFor(`/guides/${slug}/`), slug).toBe(d.updated ?? d.published);
    }
  });

  it('pages are dated by their own sources, not by the header, footer or layout', () => {
    for (const path of ['/', '/privacy/', '/services/web-design/', '/guides/', '/work/samp-hair-spa/', '/web-design-scarborough/']) {
      const files = sourcesFor(path);
      expect(files.length, path).toBeGreaterThan(0);
      for (const chrome of ['src/layouts/BaseLayout.astro', 'src/components/Header.astro', 'src/components/Footer.astro'])
        expect(files, path).not.toContain(chrome);
    }
    expect(sourcesFor('/privacy/')).toEqual(['src/pages/privacy.astro']);
  });

  it('every area page (/web-design-<area>/) is dated from the area template and data', () => {
    for (const slug of ['scarborough', 'north-york']) {
      const files = sourcesFor(`/web-design-${slug}/`);
      expect(files).toContain('src/pages/web-design-[area].astro');
      expect(files).toContain('src/data/areas.ts');
    }
  });
});
