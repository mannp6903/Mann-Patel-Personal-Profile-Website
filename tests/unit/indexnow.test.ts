import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { KEY, changedUrls, sitemapDates } from '../../scripts/indexnow.mjs';

describe('IndexNow (Nov 2026 audit fixes)', () => {
  it('the key file is in public/, named after the key and holding it', () => {
    expect(KEY).toMatch(/^[a-f0-9]{32}$/);
    expect(readFileSync(`public/${KEY}.txt`, 'utf8').trim()).toBe(KEY);
  });

  it('only new pages and pages with a new <lastmod> are sent', async () => {
    const before = await sitemapDates(
      '<urlset><url><loc>https://mannpatel.me/</loc><lastmod>2026-11-14</lastmod></url><url><loc>https://mannpatel.me/terms/</loc><lastmod>2026-11-08</lastmod></url></urlset>',
      async () => '',
    );
    const index = '<sitemapindex><sitemap><loc>https://mannpatel.me/sitemap-0.xml</loc></sitemap></sitemapindex>';
    const after = await sitemapDates(index, async () =>
      [
        '<urlset>',
        '<url><loc>https://mannpatel.me/</loc><lastmod>2026-11-15</lastmod></url>',
        '<url><loc>https://mannpatel.me/terms/</loc><lastmod>2026-11-08</lastmod></url>',
        '<url><loc>https://mannpatel.me/web-design-north-york/</loc><lastmod>2026-11-20</lastmod></url>',
        '</urlset>',
      ].join(''),
    );
    expect(changedUrls(before, after)).toEqual(['https://mannpatel.me/', 'https://mannpatel.me/web-design-north-york/']);
  });
});
