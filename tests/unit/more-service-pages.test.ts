import { describe, expect, it } from 'vitest';
import { servicePages, moreServicePages } from '../../src/data/service-pages';
import { packageById, packages } from '../../src/data/packages';
import { faqs, overviewFaqs } from '../../src/data/faqs';
import { industryPages } from '../../src/data/industry-pages';
import { areas } from '../../src/data/areas';
import { readFileSync } from 'node:fs';

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

  it('each page quotes only its own package’s price', () => {
    for (const p of moreServicePages) {
      const own = new Set(p.packages.flatMap((id) => [packageById(id)!.price.amount, packageById(id)!.price.max]).filter((n) => typeof n === 'number'));
      for (const m of JSON.stringify(p).matchAll(/\$([\d,]+)/g)) expect(own.has(Number(m[1].replace(/,/g, ''))), `${p.slug}: ${m[0]}`).toBe(true);
    }
  });

  it('the AI page never says website fixes are part of Local Visibility Setup (they are quoted separately)', () => {
    const ai = moreServicePages[1];
    const text = [ai.lead, ai.notFor, ...ai.steps.map((s) => s.body), ...ai.limits, ai.costs, ai.handover, ...ai.faqs.map((f) => f.a)].join(' ');
    for (const sentence of text.split(/(?<=[.!?])\s+/))
      if (/Local Visibility Setup|\$650|part of/i.test(sentence) && /website/i.test(sentence)) expect(sentence).toMatch(/quoted/i);
    // Repeat checks after the set-up aren't part of it.
    expect(ai.faqs.find((f) => /how often/i.test(f.q))!.a).toMatch(/yourself/);
  });

  it('asks no question another page already answers (each question in one place)', () => {
    const pricing = [...readFileSync('src/pages/pricing.astro', 'utf8').matchAll(/\bq: '([^']+)'/g)].map((m) => m[1]);
    const elsewhere = [...faqs, ...overviewFaqs, ...servicePages.flatMap((p) => p.faqs), ...industryPages.flatMap((p) => p.faqs), ...areas.flatMap((a) => a.faqs)]
      .map((f) => f.q)
      .concat(pricing);
    const norm = (q: string) => q.toLowerCase().replace(/[^a-z]+/g, ' ').trim();
    const seen = new Set(elsewhere.map(norm));
    for (const p of moreServicePages) for (const f of p.faqs) expect(seen.has(norm(f.q)), `${p.slug}: "${f.q}"`).toBe(false);
    // Nor the home page's GEO/AEO question in other words.
    for (const f of moreServicePages[1].faqs) expect(f.q, f.q).not.toMatch(/what are (geo|aeo)|recommended by chatgpt/i);
    expect(moreServicePages[0].faqs.map((f) => f.q)).not.toContain('Can I stop?');
  });

  it('labels every sample as fictional', () => {
    for (const p of moreServicePages) for (const s of [p.sample, p.testLog].filter(Boolean)) expect(s!.intro, p.slug).toMatch(/fictional/i);
  });
});
