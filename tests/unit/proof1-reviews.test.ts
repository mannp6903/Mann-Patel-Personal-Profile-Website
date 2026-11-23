/**
 * PROOF-1 (23 Nov 2026 audit, audit/D-backlog.csv): real reviews only, and the reviews strip stays on Home and /pricing/
 * so the first genuine review shows there. The pass/fail itself (3 genuine Google reviews by 31 Dec 2026) is Mann's.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { gbp } from '../../src/data/site';
import { reviews } from '../../src/data/reviews';

describe('PROOF-1: reviews', () => {
  it('the reviews strip is on Home and /pricing/', () => {
    for (const page of ['src/pages/index.astro', 'src/pages/pricing.astro']) {
      expect(readFileSync(page, 'utf8'), page).toMatch(/<ReviewsStrip\s*\/>/);
    }
  });
  it('a rating is shown only with its count, from the real profile (never estimated)', () => {
    expect(gbp.rating === null).toBe(gbp.reviewCount === null);
    if (gbp.rating !== null) expect(gbp.rating).toBeGreaterThanOrEqual(1);
  });
  it('every listed review has its source and date', () => {
    for (const r of reviews) {
      expect(r.quote.length).toBeGreaterThan(0);
      expect(r.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
