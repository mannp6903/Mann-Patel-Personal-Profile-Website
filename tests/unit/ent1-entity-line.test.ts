/**
 * ENT-1 (23 Nov 2026 audit, audit/D-backlog.csv): one identical entity line wherever the site describes Mann. The real
 * pass/fail (an AI answer names mannpatel.me or describes the business correctly) is Mann's retest on 7 Jan 2027.
 */
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';

vi.mock('astro:env/client', () => ({ PUBLIC_SITE_URL: 'https://mannpatel.me', PUBLIC_CONTACT_PHONE: undefined }));
vi.mock('astro:env/server', () => ({ SITE_MODE: 'production', SITE_INDEXING: true }));
const { profile } = await import('../../src/data/site');
const { personJsonLd } = await import('../../src/lib/seo');

describe('ENT-1: the entity line', () => {
  it('is the audit’s exact wording', () => {
    expect(profile.entity).toBe('Mann Patel, independent web designer in Scarborough (mannpatel.me)');
  });
  it('is the Person disambiguating description and opens llms.txt', () => {
    expect(personJsonLd().disambiguatingDescription).toBe(profile.entity);
    expect(readFileSync('public/llms.txt', 'utf8').split('\n')[2]).toContain(profile.entity);
  });
  it('shows on About, with the Google Business Profile first in “Find me elsewhere”', () => {
    const about = readFileSync('src/pages/about.astro', 'utf8');
    expect(about).toContain('{profile.entity}');
    const list = about.slice(about.indexOf('const elsewhere = ['));
    expect(list.indexOf("t: 'Google Business Profile'")).toBeLessThan(list.indexOf("t: 'LinkedIn'"));
  });
});
