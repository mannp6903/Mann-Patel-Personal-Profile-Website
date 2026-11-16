import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { gitDate, guideDates, lastmodFor, sourcesFor, workUpdated } from '../../scripts/sitemap-lastmod.mjs';

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

  it('no true date, no <lastmod>: an unreadable history never stamps every page with one date (Website Playbook)', () => {
    const now = new Date('2026-11-16T12:00:00Z');
    // Shallow clone that couldn't be deepened, or no git: nothing, whatever the last commit says.
    expect(gitDate({ historyOk: false, dirty: '', committed: '2026-11-16T07:15:37-05:00' }, now)).toBeNull();
    // Full history: the page's own last commit.
    expect(gitDate({ historyOk: true, dirty: '', committed: '2026-11-08T10:50:28-05:00' }, now)).toBe('2026-11-08T15:50:28.000Z');
    // Changed and not committed yet (a local build): changed now.
    expect(gitDate({ historyOk: true, dirty: ' M src/pages/privacy.astro', committed: '2026-11-08T10:50:28-05:00' }, now)).toBe(now.toISOString());
    // Never committed: nothing.
    expect(gitDate({ historyOk: true, dirty: '', committed: null }, now)).toBeNull();
  });

  it('a case study with an `updated` date in its front matter uses it (Website Playbook)', () => {
    for (const slug of readdirSync('src/content/work').filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))) {
      const updated = workUpdated(slug);
      if (updated) expect(lastmodFor(`/work/${slug}/`), slug).toBe(updated);
      else expect(updated, slug).toBeNull();
    }
    expect(workUpdated('no-such-project')).toBeNull();
  });

  it('every area page (/web-design-<area>/) is dated from the area template and data', () => {
    for (const slug of ['scarborough', 'north-york']) {
      const files = sourcesFor(`/web-design-${slug}/`);
      expect(files).toContain('src/pages/web-design-[area].astro');
      expect(files).toContain('src/data/areas.ts');
    }
  });
});
