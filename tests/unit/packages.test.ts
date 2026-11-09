import { describe, it, expect } from 'vitest';
import { packages, checkUp, normalizePackageId, packageById, priceLabel, pricesPublished, legacyPackageIds, type Package } from '../../src/data/packages';
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

  it('prices: unapproved prices read “Quoted after your free check”; approved ones are formatted in CAD', () => {
    const unpriced: Package = { ...packages[0], price: { amount: null, unit: 'one-time' } };
    expect(priceLabel(unpriced)).toEqual({ text: 'Quoted after your free check', approved: false });
    expect(priceLabel({ ...packages[0], price: { amount: 2500, unit: 'one-time' } }).text).toBe('From $2,500, one-time');
    expect(priceLabel({ ...packages[3], price: { amount: 150, unit: 'month' } }).text).toBe('From $150 a month');
    expect(priceLabel(checkUp).text).toBe('Free');
    // The pricing page is published only once at least one paid package has an approved price.
    expect(pricesPublished).toBe(packages.some((p) => p.price.amount !== null));
  });
});
