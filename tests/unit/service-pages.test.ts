import { describe, expect, it } from 'vitest';
import { servicePages } from '../../src/data/service-pages';
import { packageById } from '../../src/data/packages';

describe('focused service pages (growth report copy map, 10 Nov 2026)', () => {
  it('the display lines join back to the H1, so the heading reads as one sentence', () => {
    for (const p of servicePages) expect(p.lines.join(' ')).toBe(p.h1);
  });

  it('each H1 names the service and Toronto, and each title and description is its own', () => {
    for (const p of servicePages) expect(p.h1).toMatch(/Toronto/);
    expect(new Set(servicePages.map((p) => p.title)).size).toBe(servicePages.length);
    expect(new Set(servicePages.map((p) => p.description)).size).toBe(servicePages.length);
    // Descriptions fit a search snippet.
    for (const p of servicePages) expect(p.description.length).toBeLessThanOrEqual(160);
  });

  it('keeps its address, its area on the overview and a real package to quote', () => {
    expect(servicePages.map((p) => p.slug)).toEqual(['web-design', 'local-visibility', 'enquiry-follow-up']);
    for (const p of servicePages) for (const id of p.packages) expect(packageById(id), id).toBeDefined();
  });

  it('never promises what Google or a customer decides', () => {
    const text = JSON.stringify(servicePages);
    expect(text).not.toMatch(/guaranteed? (rankings?|results|leads|traffic|placement)|#1 on google|first page of google/i);
  });
});
