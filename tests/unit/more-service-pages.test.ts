import { describe, expect, it } from 'vitest';
import { servicePages, moreServicePages } from '../../src/data/service-pages';
import { packageById, packages } from '../../src/data/packages';

// SEO audit Phase 4 (14 Nov 2026, Mann chose these two): Website Care and AI search optimization get pages of
// their own, rendered by the service page template, without joining the three main services.
const SUFFIX = ' | Mann Patel';
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const targets = (text: string, keyword: string) => words(keyword).every((w) => words(text).includes(w));

describe('more service pages (SEO audit Phase 4)', () => {
  it('Website Care and AI search optimization, under /services/; the three main services are unchanged', () => {
    expect(moreServicePages.map((p) => p.slug)).toEqual(['website-care', 'ai-search-optimization']);
    expect(servicePages.map((p) => p.slug)).toEqual(['web-design', 'local-visibility', 'enquiry-follow-up']);
  });

  it('the display lines join back to the H1; titles and descriptions fit a search result', () => {
    for (const p of moreServicePages) {
      expect(p.lines.join(' ')).toBe(p.h1);
      expect((p.title + SUFFIX).length, p.slug).toBeLessThanOrEqual(60);
      expect(p.description.length, p.slug).toBeLessThanOrEqual(155);
    }
  });

  it('each targets its search in the title and the H1 (plan C15, C16)', () => {
    const keyword = { 'website-care': 'website maintenance toronto', 'ai-search-optimization': 'ai search optimization toronto' } as Record<string, string>;
    for (const p of moreServicePages) {
      expect(targets(p.title, keyword[p.slug]), p.title).toBe(true);
      expect(targets(p.h1, keyword[p.slug]), p.h1).toBe(true);
    }
  });

  it('sells existing packages only: Website Care, and Local Visibility Setup for the AI search check (no new price)', () => {
    expect(moreServicePages[0].packages).toEqual(['care']);
    expect(moreServicePages[1].packages).toEqual(['local-visibility']);
    for (const p of moreServicePages) for (const id of p.packages) expect(packageById(id), id).toBeDefined();
    // The care package explains itself on its own page now.
    expect(packageById('care')!.page).toBe('/services/website-care/');
  });

  it('quotes only published prices, and never promises what Google, an AI tool or a customer decides', () => {
    const text = JSON.stringify(moreServicePages);
    expect(text).not.toMatch(/guaranteed? (rankings?|results|leads|traffic|placement|mentions?)|#1 on google|first page of google|will recommend you/i);
    const published = new Set(packages.flatMap((p) => [p.price.amount, p.price.max]).filter((n) => typeof n === 'number'));
    for (const m of text.matchAll(/\$([\d,]+)/g)) expect(published.has(Number(m[1].replace(/,/g, ''))), m[0]).toBe(true);
  });

  it('labels every sample as fictional', () => {
    for (const p of moreServicePages) for (const s of [p.sample, p.testLog].filter(Boolean)) expect(s!.intro, p.slug).toMatch(/fictional/i);
  });
});
