import { describe, it, expect } from 'vitest';
import { packages, checkUp, normalizePackageId, packageById, priceLabel, pricesPublished, legacyPackageIds, upgradeNote, type Package } from '../../src/data/packages';
import { readFileSync } from 'node:fs';
import { PACKAGE_OPTIONS, SERVICE_IDS } from '../../src/lib/enquiry/options';
import { validateEnquiry } from '../../src/lib/enquiry/validate';

const all = [...packages, checkUp];

describe('packages: one source of truth (round 10)', () => {
  it('the form’s starting-point options match the packages, in order, with the same names', () => {
    expect(PACKAGE_OPTIONS.map((o) => [o.id, o.label])).toEqual(all.map((p) => [p.id, p.name]));
  });

  it('every package lists a boundary, inclusions, exclusions, inputs, timeline and real services', () => {
    for (const p of all) {
      expect(p.boundary.length).toBeGreaterThan(20);
      expect(p.includes.length).toBeGreaterThanOrEqual(4);
      expect(p.notIncluded.length).toBeGreaterThanOrEqual(1);
      expect(p.youProvide.length).toBeGreaterThanOrEqual(1);
      expect(p.timeline.length).toBeGreaterThan(10);
      for (const id of p.serviceIds) expect(SERVICE_IDS).toContain(id);
    }
  });

  it('published prices (14 Nov 2026) match the First Client Quickstart, in CAD before tax', () => {
    const text = Object.fromEntries(packages.map((p) => [p.id, priceLabel(p).text]));
    expect(text).toEqual({
      'website-fix': '$450–$850',
      'website-launch': '$1,950',
      'website-enquiry': '$3,350',
      'local-visibility': '$650',
      care: '$149 a month',
    });
    expect(pricesPublished).toBe(true);
  });

  it('makes no promises it cannot keep: no guarantees offered, no discounts, no popularity badges', () => {
    const text = JSON.stringify(all.map(({ includes, boundary, forWho }) => ({ includes, boundary, forWho })));
    expect(text).not.toMatch(/guarantee|% off|discount|limited time|most popular|best seller/i);
  });

  it('old links still work: legacy ids map to a current offer, in links and on the server', () => {
    for (const [old, now] of Object.entries(legacyPackageIds)) {
      expect(normalizePackageId(old)).toBe(now);
      expect(packageById(old)?.id).toBe(now);
    }
    expect(normalizePackageId('gold')).toBe('');
    const r = validateEnquiry({ name: 'Ada', email: 'ada@example.ca', packageId: 'launch', message: 'We need a website with our hours.' });
    expect(r.ok && r.value.packageId).toBe('website-enquiry');
  });

  it('prices: unapproved prices read “Written quote after a short brief”; approved ones are formatted in CAD', () => {
    const unpriced: Package = { ...packages[0], price: { amount: null, unit: 'one-time' } };
    expect(priceLabel(unpriced)).toEqual({ text: 'Written quote after a short brief', approved: false });
    expect(priceLabel({ ...packages[0], price: { amount: 2500, unit: 'one-time' } }).text).toBe('$2,500');
    expect(priceLabel({ ...packages[0], price: { amount: 450, max: 850, unit: 'one-time' } }).text).toBe('$450–$850');
    expect(priceLabel({ ...packages[3], price: { amount: 150, unit: 'month' } }).text).toBe('$150 a month');
    expect(priceLabel(checkUp).text).toBe('Free');
    // The pricing page is published only once at least one paid package has an approved price.
    expect(pricesPublished).toBe(packages.some((p) => p.price.amount !== null));
  });

  // SEO report follow-up (19 Nov 2026): one plain line on what the step up from Website Launch buys, worked out from
  // the two prices so it can never disagree with them.
  it('Website + Enquiry System says what its extra over Website Launch buys, from the two prices', () => {
    const enquiry = packageById('website-enquiry')!;
    const launch = packageById('website-launch')!;
    const extra = enquiry.price.amount! - launch.price.amount!;
    expect(extra).toBe(1400);
    expect(upgradeNote(enquiry)).toBe('The extra $1,400 over Website Launch buys one booking integration plus one workflow.');
    expect(readFileSync('public/llms.txt', 'utf8')).toContain(upgradeNote(enquiry)!);
    // No note for packages built on nothing, or once either price is unpublished.
    for (const p of packages.filter((x) => x.id !== 'website-enquiry')) expect(upgradeNote(p)).toBeNull();
    expect(upgradeNote({ ...enquiry, price: { amount: null, unit: 'one-time' } })).toBeNull();
  });
});
