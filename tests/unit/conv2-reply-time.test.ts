/**
 * CONV-2 (23 Nov 2026 audit, audit/D-backlog.csv): the reply-time lines. The browser check (visible under the free-check
 * button and on /contact/received/ at 375px) runs once Mann sets the times in src/data/site.ts.
 */
import { describe, it, expect } from 'vitest';
import { checkLine, heroCheckLine, replyLine } from '../../src/lib/reply';

describe('CONV-2: reply-time lines', () => {
  it('say nothing until Mann sets a time', () => {
    expect(replyLine(null)).toBeNull();
    expect(checkLine(null)).toBeNull();
    expect(checkLine('  ')).toBeNull();
    expect(heroCheckLine(null)).toBe('One-minute form. Your list of fixes by email.');
  });
  it('use the time once set, with one full stop', () => {
    expect(replyLine('within 1 business day')).toBe('I reply by email within 1 business day.');
    expect(checkLine('within 2 business days.')).toBe('I’ll email your list of fixes within 2 business days.');
    expect(heroCheckLine('within 2 business days')).toBe('One-minute form. Your list of fixes by email within 2 business days.');
  });
});
