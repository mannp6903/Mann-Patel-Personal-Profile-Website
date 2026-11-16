import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { moreServicePages } from '../../src/data/service-pages';
import { packageById, priceLabel } from '../../src/data/packages';
import { areas, areaIsDraft } from '../../src/data/areas';
import { bookingUrl, businessProfiles, businessSameAs, gbp, social } from '../../src/data/site';

// Competitor gap work (16 Nov 2026; docs/26-competitor-gap-hireadrian.md).
const SUFFIX = ' | Mann Patel';
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const targets = (text: string, keyword: string) => words(keyword).every((w) => words(text).includes(w));

describe('website redesign page', () => {
  const page = moreServicePages.find((p) => p.slug === 'website-redesign')!;

  it('exists, fits a search result and targets "website redesign toronto"', () => {
    expect(page).toBeDefined();
    expect(page.title).toBe('Website Redesign in Toronto');
    expect((page.title + SUFFIX).length).toBeLessThanOrEqual(60);
    expect(page.description.length).toBeLessThanOrEqual(155);
    expect(page.lines.join(' ')).toBe(page.h1);
    expect(targets(page.h1, 'website redesign toronto')).toBe(true);
  });

  it('sells Website Launch and Website Fix at their published prices, and no other number', () => {
    expect(page.packages).toEqual(['website-launch', 'website-fix']);
    const text = JSON.stringify(page);
    for (const id of ['website-launch', 'website-fix']) expect(text).toContain(priceLabel(packageById(id)!).text);
    const own = new Set([1950, 450, 850]);
    for (const m of text.matchAll(/\$([\d,]+)/g)) expect(own.has(Number(m[1].replace(/,/g, ''))), m[0]).toBe(true);
  });

  it('shows no case study: both projects are new builds, not redesigns', () => {
    expect(page.work).toEqual([]);
  });
});

describe('Markham, Pickering, East York and Ajax area pages', () => {
  const NEW = ['markham', 'pickering', 'east-york', 'ajax'];

  it('exist with their own search in the title and the H1, within the length limits', () => {
    for (const slug of NEW) {
      const a = areas.find((x) => x.slug === slug)!;
      expect(a, slug).toBeDefined();
      expect(a.title.length, slug).toBeLessThanOrEqual(47);
      expect(a.description.length, slug).toBeLessThanOrEqual(155);
      expect(a.lines.join(' '), slug).toBe(a.h1);
      const keyword = `web design ${a.name.toLowerCase()}`;
      expect(targets(a.title, keyword), a.title).toBe(true);
      expect(targets(a.h1, keyword), a.h1).toBe(true);
    }
  });

  it('stay drafts until Mann lists the neighbourhoods (never invented)', () => {
    for (const slug of NEW) {
      const a = areas.find((x) => x.slug === slug)!;
      if (!a.neighbourhoods?.length) expect(areaIsDraft(a), slug).toBe(true);
    }
  });
});

describe('owner inputs', () => {
  it('are real links or null, never a placeholder', () => {
    const values = [bookingUrl, gbp.reviewUrl, businessProfiles.youtube, businessProfiles.clutch, ...social.map((s) => s.url)];
    for (const v of values) if (v !== null) expect(v, v).toMatch(/^https:\/\/[^\s[\]]+$/);
    expect(social.find((s) => s.id === 'youtube')!.url).toBe(businessProfiles.youtube);
  });

  it('Clutch: a clutch.co profile in the business structured data once set, and nowhere while it is null', () => {
    if (businessProfiles.clutch === null) expect(businessSameAs.some((u) => /clutch\.co/.test(u))).toBe(false);
    else {
      expect(businessProfiles.clutch).toMatch(/^https:\/\/clutch\.co\/profile\/[^\s/]+\/?$/);
      expect(businessSameAs).toContain(businessProfiles.clutch);
    }
  });
});

describe('three new guides', () => {
  const read = (slug: string) => readFileSync(`src/content/guides/${slug}.md`, 'utf8');
  const GUIDES: [string, string][] = [
    ['how-to-get-more-google-reviews', '/services/local-visibility/'],
    ['how-to-optimize-google-business-profile', '/services/local-visibility/'],
    ['website-redesign-cost-toronto', '/services/website-redesign/'],
  ];

  it('each leads to its service page, in the front matter and in the text', () => {
    for (const [slug, service] of GUIDES) {
      const src = read(slug);
      expect(src, slug).toMatch(new RegExp(`^service: ${service}$`, 'm'));
      expect(src, slug).toContain(`](${service})`);
      expect(src, slug).toContain('](/contact/?package=check-up#check)');
    }
  });

  it('cite outside facts only to Google’s own help pages', () => {
    for (const [slug] of GUIDES)
      for (const m of read(slug).matchAll(/\]\((https?:\/\/[^)\s]+)\)/g))
        expect(m[1], slug).toMatch(/^https:\/\/(support|developers)\.google\.com\//);
  });

  it('answer first: the opening sentence answers the question in the title', () => {
    const first = (slug: string) => read(slug).split(/\n---\n/)[1].trim().split('\n')[0];
    expect(first('how-to-get-more-google-reviews')).toMatch(/^To get more Google reviews, ask every customer/);
    expect(first('how-to-optimize-google-business-profile')).toMatch(/^To optimize your Google Business Profile,/);
    expect(first('website-redesign-cost-toronto')).toMatch(/^A website redesign of up to five pages costs \$1,950 CAD/);
  });
});
