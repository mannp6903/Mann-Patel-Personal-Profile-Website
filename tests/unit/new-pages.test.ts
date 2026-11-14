import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { industryPages } from '../../src/data/industry-pages';
import { areas, areaIsDraft } from '../../src/data/areas';
import { packages } from '../../src/data/packages';

// SEO audit Phase 3 (docs/seo/PLAN.md): industry pages, the Scarborough page and the guides.
const SUFFIX = ' | Mann Patel';
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
/** Every word of the keyword appears in the text (word order may differ: "website design in Toronto"). */
const targets = (text: string, keyword: string) => words(keyword).every((w) => words(text).includes(w));
const NO_PROMISES = /guaranteed? (rankings?|results|leads|traffic|placement|bookings)|#1 on google|first page of google|top three/i;

describe('industry pages', () => {
  it('cleaning companies and salons/spas, at their flat URLs', () => {
    expect(industryPages.map((p) => p.slug)).toEqual(['websites-for-cleaning-companies', 'websites-for-salons-and-spas']);
  });

  it('the display lines join back to the H1; titles and descriptions fit a search result', () => {
    for (const p of industryPages) {
      expect(p.lines.join(' ')).toBe(p.h1);
      expect((p.title + SUFFIX).length, p.slug).toBeLessThanOrEqual(60);
      expect(p.description.length, p.slug).toBeLessThanOrEqual(155);
    }
  });

  it('each targets its search in the title and the H1', () => {
    const keyword = { 'websites-for-cleaning-companies': 'cleaning company website design toronto', 'websites-for-salons-and-spas': 'salon website design toronto' };
    for (const p of industryPages) {
      expect(targets(p.title, keyword[p.slug]), p.title).toBe(true);
      expect(targets(p.h1, keyword[p.slug]), p.h1).toBe(true);
    }
  });

  it('leads with its own case study, then the package that fits', () => {
    const cleaning = industryPages[0];
    const salons = industryPages[1];
    expect(cleaning.caseStudy).toBe('nest-and-rest-cleaning');
    expect(cleaning.packages).toEqual(['website-launch', 'local-visibility']);
    expect(salons.caseStudy).toBe('samp-hair-spa');
    // Online booking first; Website Launch is the lighter option.
    expect(salons.packages).toEqual(['website-enquiry', 'website-launch']);
    for (const p of industryPages) readFileSync(`src/content/work/${p.caseStudy}.md`, 'utf8');
  });

  it('frames Nest & Rest as Mann’s own business and Samp as a client website in progress', () => {
    const cleaning = JSON.stringify(industryPages[0]);
    expect(cleaning).toMatch(/my own (home-)?cleaning business/i);
    expect(cleaning).not.toMatch(/\b(client|customer)s? (results|reviews) (show|prove)/i);
    expect(JSON.stringify(industryPages[1])).toMatch(/in progress/i);
  });

  it('quotes only published prices, and never promises what Google or a customer decides', () => {
    const text = JSON.stringify(industryPages);
    expect(text).not.toMatch(NO_PROMISES);
    const published = new Set(packages.flatMap((p) => [p.price.amount, p.price.max]).filter((n) => typeof n === 'number'));
    for (const m of text.matchAll(/\$([\d,]+)/g)) expect(published.has(Number(m[1].replace(/,/g, ''))), m[0]).toBe(true);
  });
});

describe('area pages', () => {
  const scarborough = areas.find((a) => a.slug === 'scarborough')!;

  it('Scarborough targets "web design scarborough" and says Ontario (results are crowded with Scarborough, UK)', () => {
    expect(scarborough).toBeDefined();
    expect(targets(scarborough.title, 'web design scarborough')).toBe(true);
    expect(targets(scarborough.h1, 'web design scarborough')).toBe(true);
    expect(scarborough.lines.join(' ')).toBe(scarborough.h1);
    expect((scarborough.title + SUFFIX).length).toBeLessThanOrEqual(60);
    expect(scarborough.description.length).toBeLessThanOrEqual(155);
    expect(JSON.stringify(scarborough)).toMatch(/web designer [^"]*Scarborough, Ontario/);
  });

  it('stays an unpublished draft until Mann supplies the neighbourhoods (never invented)', () => {
    for (const a of areas) expect(areaIsDraft(a)).toBe(a.neighbourhoods === null || a.neighbourhoods.length === 0);
    expect(areaIsDraft({ ...scarborough, neighbourhoods: null })).toBe(true);
    expect(areaIsDraft({ ...scarborough, neighbourhoods: [] })).toBe(true);
    expect(areaIsDraft({ ...scarborough, neighbourhoods: ['Somewhere'] })).toBe(false);
  });

  it('makes no promises', () => {
    expect(JSON.stringify(areas)).not.toMatch(NO_PROMISES);
  });
});

describe('guides', () => {
  const dir = 'src/content/guides';
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  const guide = (f: string) => {
    const src = readFileSync(`${dir}/${f}`, 'utf8');
    const fm = (src.match(/^---\n([\s\S]*?)\n---/) || [])[1] ?? '';
    const field = (k: string) => (fm.match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1]?.trim().replace(/^['"]|['"]$/g, '');
    return { slug: f.replace(/\.md$/, ''), src, body: src.slice(fm.length + 8), fm, field };
  };
  const all = files.map(guide);
  const bySlug = (slug: string) => all.find((g) => g.slug === slug)!;

  it('five guides: two full drafts and three outlines, all unpublished until Mann flips draft: false', () => {
    expect(all.map((g) => g.slug).sort()).toEqual(
      [
        'google-business-profile-without-a-storefront',
        'how-much-does-a-website-cost-in-toronto',
        'how-to-get-recommended-by-chatgpt',
        'missed-call-text-back-for-salons-and-cleaners',
        'why-isnt-my-business-on-google-maps',
      ].sort(),
    );
    for (const g of all) expect(g.field('draft'), g.slug).toBe('true');
    const outlines = all.filter((g) => g.field('outline') === 'true').map((g) => g.slug).sort();
    expect(outlines).toEqual(['how-to-get-recommended-by-chatgpt', 'missed-call-text-back-for-salons-and-cleaners', 'why-isnt-my-business-on-google-maps']);
  });

  it('the cost and Business Profile guides link to each other, their service page and /pricing/', () => {
    const cost = bySlug('how-much-does-a-website-cost-in-toronto');
    const gbp = bySlug('google-business-profile-without-a-storefront');
    expect(cost.fm).toMatch(/related:[\s\S]*google-business-profile-without-a-storefront/);
    expect(gbp.fm).toMatch(/related:[\s\S]*how-much-does-a-website-cost-in-toronto/);
    expect(cost.field('service')).toBe('/services/web-design/');
    expect(gbp.field('service')).toBe('/services/local-visibility/');
    for (const g of [cost, gbp]) expect(g.body, g.slug).toContain('](/pricing/)');
  });

  it('the outlines lead where the plan says: the $3,350 package and the free check', () => {
    expect(bySlug('missed-call-text-back-for-salons-and-cleaners').field('service')).toBe('/services/enquiry-follow-up/');
    expect(bySlug('missed-call-text-back-for-salons-and-cleaners').body).toContain('$3,350');
    expect(bySlug('why-isnt-my-business-on-google-maps').body).toContain('/contact/?package=check-up#check');
  });

  it('never links to another guide in the text (a draft would 404 in production); related guides do that', () => {
    for (const g of all) expect(g.body, g.slug).not.toMatch(/\]\(\/guides\//);
  });

  it('every dollar figure is a published price, and nothing is promised', () => {
    const published = new Set(packages.flatMap((p) => [p.price.amount, p.price.max]).filter((n) => typeof n === 'number'));
    for (const g of all) {
      for (const m of g.src.matchAll(/\$([\d,]+)/g)) expect(published.has(Number(m[1].replace(/,/g, ''))), `${g.slug}: ${m[0]}`).toBe(true);
      expect(g.src, g.slug).not.toMatch(NO_PROMISES);
    }
  });

  it('titles fit a search result', () => {
    for (const g of all) {
      expect((g.field('seoTitle')! + SUFFIX).length, g.slug).toBeLessThanOrEqual(60);
      expect(g.field('description')!.length, g.slug).toBeLessThanOrEqual(155);
    }
  });
});

describe('guide dates', () => {
  it('accept a date written plainly in the front matter (YAML reads it as a date) or quoted, as YYYY-MM-DD', async () => {
    const { isoDay } = await import('../../src/lib/iso-day');
    expect(isoDay.parse(new Date('2026-11-14'))).toBe('2026-11-14');
    expect(isoDay.parse('2026-11-14')).toBe('2026-11-14');
    expect(() => isoDay.parse('14 Nov 2026')).toThrow();
  });
});
