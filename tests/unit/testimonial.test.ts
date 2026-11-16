import { describe, expect, it } from 'vitest';
import { testimonialData } from '../../src/lib/testimonial';

describe('Testimonial (Website Playbook, 16 Nov 2026): nothing without real data', () => {
  it('shows nothing without both a quote and a name', () => {
    expect(testimonialData(undefined)).toBeNull();
    expect(testimonialData(null)).toBeNull();
    expect(testimonialData({})).toBeNull();
    expect(testimonialData({ quote: 'Great work.' })).toBeNull();
    expect(testimonialData({ name: 'Client Name' })).toBeNull();
    expect(testimonialData({ quote: '   ', name: 'Client Name' })).toBeNull();
    expect(testimonialData({ quote: 'Great work.', name: '', business: 'Shop', suburb: 'Agincourt' })).toBeNull();
  });

  it('keeps the words exactly (trimmed), drops empty extras, and links only a real https address', () => {
    expect(testimonialData({ quote: ' Great work. ', name: ' Client Name ', business: '', suburb: 'Agincourt', reviewUrl: 'not a url' })).toEqual({
      quote: 'Great work.',
      name: 'Client Name',
      business: null,
      suburb: 'Agincourt',
      reviewUrl: null,
    });
    expect(testimonialData({ quote: 'Q', name: 'N', reviewUrl: 'https://g.page/r/abc/review' })?.reviewUrl).toBe('https://g.page/r/abc/review');
    expect(testimonialData({ quote: 'Q', name: 'N', reviewUrl: 'javascript:alert(1)' })?.reviewUrl).toBeNull();
  });
});
