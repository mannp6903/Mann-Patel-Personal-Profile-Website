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
    for (const a of areas) expect(areaIsDraft(a)).toBe(a.neighbourhoods === null || a.neighbourhoods.length === 0 || a.localExample === null);
    expect(areaIsDraft({ ...scarborough, neighbourhoods: null })).toBe(true);
    expect(areaIsDraft({ ...scarborough, neighbourhoods: [] })).toBe(true);
    expect(areaIsDraft({ ...scarborough, neighbourhoods: ['Somewhere'] })).toBe(false);
    // A local example that is needed but not supplied keeps a page a draft too (North York, Nov 2026).
    expect(areaIsDraft({ ...scarborough, neighbourhoods: ['Somewhere'], localExample: null })).toBe(true);
    expect(areaIsDraft({ ...scarborough, neighbourhoods: ['Somewhere'], localExample: 'A real project.' })).toBe(false);
  });

  it('makes no promises', () => {
    expect(JSON.stringify(areas)).not.toMatch(NO_PROMISES);
  });

  it('North York (Nov 2026 audit fixes): its own copy for "web designer north york", a draft until Mann adds the TODOs', () => {
    const ny = areas.find((a) => a.slug === 'north-york')!;
    expect(ny).toBeDefined();
    expect(targets(ny.title, 'web designer north york')).toBe(true);
    expect(targets(ny.h1, 'web designer north york')).toBe(true);
    expect(ny.lines.join(' ')).toBe(ny.h1);
    expect((ny.title + SUFFIX).length).toBeLessThanOrEqual(60);
    expect(ny.description.length).toBeLessThanOrEqual(155);
    // Its own copy: no sentence of its lead or answers repeats the Scarborough page word for word.
    const scarborough = areas.find((a) => a.slug === 'scarborough')!;
    const sentences = (a: typeof ny) => [a.lead, a.description, ...a.faqs.flatMap((f) => [f.q, f.a])].flatMap((t) => t.split(/(?<=[.?!])\s+/));
    const theirs = new Set(sentences(scarborough));
    for (const s of sentences(ny)) expect(theirs.has(s), s).toBe(false);
    // Neighbourhoods and the local example are Mann's to supply: never guessed, so the page is a draft until then.
    if (ny.neighbourhoods === null || ny.localExample === null) expect(areaIsDraft(ny)).toBe(true);
    expect(new Set(ny.neighbourhoods ?? []).size).toBe((ny.neighbourhoods ?? []).length); // no name twice
    // A local example, when given, is Mann's own words; left out, the page shows its real local work only.
    expect(ny.localExample === undefined || ny.localExample === null || ny.localExample.length > 20).toBe(true);
  });

  // SEO report follow-up (19 Nov 2026): "What I found in <area>" comes only from Mann's own checks. Left empty until
  // the after-hours study is run; when filled, each point is a real line and `how` says what was checked and when.
  it('local findings are left out until Mann fills them in, and then say how they were found', () => {
    for (const a of areas) {
      if (!a.localFindings) continue;
      expect(a.localFindings.points.length, a.slug).toBeGreaterThan(0);
      for (const p of a.localFindings.points) expect(p.length, a.slug).toBeGreaterThan(10);
      expect(a.localFindings.how, a.slug).toMatch(/20\d\d/);
    }
    expect(JSON.stringify(areas.map((a) => a.localFindings ?? null))).not.toMatch(NO_PROMISES);
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

  // 19 Nov 2026 (SEO report follow-up): nine, with the after-hours study as an unpublished outline (was eight).
  it('nine guides; an outline is never published, and a published guide has a date', () => {
    expect(all.map((g) => g.slug).sort()).toEqual(
      [
        // + the local after-hours study, an outline until Mann runs the calls (19 Nov 2026).
        'how-scarborough-businesses-answer-after-hours',
        // + three from the competitor gap work (16 Nov 2026).
        'how-to-get-more-google-reviews',
        'how-to-optimize-google-business-profile',
        'website-redesign-cost-toronto',
        'google-business-profile-without-a-storefront',
        'how-much-does-a-website-cost-in-toronto',
        'how-to-get-recommended-by-chatgpt',
        'missed-call-text-back-for-salons-and-cleaners',
        'why-isnt-my-business-on-google-maps',
      ].sort(),
    );
    for (const g of all) {
      expect(['true', 'false'], g.slug).toContain(g.field('draft'));
      if (g.field('outline') === 'true') expect(g.field('draft'), `${g.slug}: an outline can't be published`).toBe('true');
      if (g.field('draft') === 'false') expect(g.field('published'), g.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // All are written in full except the after-hours study (19 Nov 2026), an outline and a draft until Mann has the
    // totals; it was "no outlines" before.
    expect(all.filter((g) => g.field('outline') === 'true').map((g) => g.slug)).toEqual(['how-scarborough-businesses-answer-after-hours']);
    expect(bySlug('how-scarborough-businesses-answer-after-hours').field('draft')).toBe('true');
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

  it('the later guides lead where the plan says: the AI search page, the $3,350 package and the free check', () => {
    expect(bySlug('how-to-get-recommended-by-chatgpt').field('service')).toBe('/services/ai-search-optimization/');
    expect(bySlug('how-to-get-recommended-by-chatgpt').body).toContain('](/services/ai-search-optimization/)');
    expect(bySlug('missed-call-text-back-for-salons-and-cleaners').field('service')).toBe('/services/enquiry-follow-up/');
    expect(bySlug('missed-call-text-back-for-salons-and-cleaners').body).toContain('$3,350');
    expect(bySlug('why-isnt-my-business-on-google-maps').body).toContain('/contact/?package=check-up#check');
  });

  it('the cost guide opens with the fixed price, the published Website Launch price, and a sourced agency range', async () => {
    const { packageById, priceLabel } = await import('../../src/data/packages');
    const first = bySlug('how-much-does-a-website-cost-in-toronto').body.trim().split('\n')[0];
    expect(first.startsWith(`A five-page small business website costs ${priceLabel(packageById('website-launch')!).text} CAD with me, fixed scope; `)).toBe(true);
    expect(first).toContain('Toronto agencies often quote [$3,000–$10,000](https://trttech.ca/?p=11988).');
  });

  // 19 Nov 2026 (SEO report follow-up): the study publishes totals only, and its results table stays empty until the
  // calls are made, so nothing in it can be a guessed figure.
  it('the after-hours study: totals only, no names, no fake quote requests, and an empty results table', () => {
    const study = bySlug('how-scarborough-businesses-answer-after-hours');
    expect(study.field('service')).toBe('/services/enquiry-follow-up/');
    for (const heading of ['The question', 'The method', 'The results', 'What it means for owners', 'How to fix it'])
      expect(study.body, heading).toContain(`## ${heading}`);
    expect(study.body).toMatch(/totals only/i);
    expect(study.body).toMatch(/no quote is asked for/i);
    const rows = study.body.split('\n').filter((l) => /^\| /.test(l) && !/^\| (What|How fast|---)/.test(l));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.split('|').slice(2, -1).every((cell) => cell.trim() === ''), row).toBe(true);
    expect(study.body).not.toMatch(/\d+%/);
  });

  it('a guide’s `updated` date, when set, is on or after its published date', () => {
    for (const g of all) if (g.field('updated')) expect(g.field('updated')! >= g.field('published')!, g.slug).toBe(true);
  });

  it('the Business Profile guide states Google’s opening-date rule correctly (help answer 9174409)', () => {
    const gbp = bySlug('google-business-profile-without-a-storefront').body;
    expect(gbp).toMatch(/90 days/);
    expect(gbp).toContain('support.google.com/business/answer/9174409');
    expect(gbp).not.toMatch(/shortly before you open/);
  });

  it('no guide carries an unfinished note (they render on previews, and a published TODO fails the SEO check)', () => {
    for (const g of all) expect(g.src, g.slug).not.toMatch(/TODO|Outline only/);
  });

  it('never links to another guide in the text (a draft would 404 in production); related guides do that', () => {
    for (const g of all) expect(g.body, g.slug).not.toMatch(/\]\(\/guides\//);
  });

  it('every dollar figure is a published price (or another business’s, linked to its source), and nothing is promised', () => {
    const published = new Set(packages.flatMap((p) => [p.price.amount, p.price.max]).filter((n) => typeof n === 'number'));
    for (const g of all) {
      // Figures quoted from elsewhere must be the text of a link to their source (e.g. the cost guide's agency range).
      const own = g.src.replace(/\[[^\]]*\]\(https:\/\/[^)]+\)/g, '');
      for (const m of own.matchAll(/\$([\d,]+)/g)) expect(published.has(Number(m[1].replace(/,/g, ''))), `${g.slug}: ${m[0]}`).toBe(true);
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
