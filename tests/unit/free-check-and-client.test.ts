import { describe, it, expect, vi } from 'vitest';
import { validateEnquiry } from '../../src/lib/enquiry/validate';
import { handleEnquiry, type HandlerConfig, type HandlerDeps, type HandlerResponse } from '../../src/lib/enquiry/handler';
import { RateLimiter, Dedupe } from '../../src/lib/enquiry/limits';
import { issueToken } from '../../src/lib/enquiry/spam';
import { ownerEmailText, ownerSubject, type Lead } from '../../src/lib/enquiry/delivery';
import { sendEnquiry, briefText, briefMailto, failureText } from '../../src/lib/enquiry/client';

const SECRET = 'test-secret';
const T0 = Date.UTC(2026, 10, 8, 12, 0, 0);

describe('free check validation', () => {
  const base = { name: 'Ada', email: 'ada@example.ca', packageId: 'check-up' };

  it('needs only a name, an email and something to check (no message)', () => {
    expect(validateEnquiry({ ...base, website: 'adabakery.ca' }).ok).toBe(true);
  });

  it('accepts a business name instead of a website, for owners without a site', () => {
    const r = validateEnquiry({ ...base, business: 'Ada Bakery' });
    expect(r.ok).toBe(true);
  });

  it('asks for a website or business name when both are missing', () => {
    const r = validateEnquiry(base);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.website).toMatch(/website, or your business name/);
  });

  it('still rejects a malformed website, without hiding that behind the either-or rule', () => {
    const r = validateEnquiry({ ...base, website: 'not a site' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.website).toMatch(/doesn’t look right/);
  });

  it('keeps the project brief strict: a real message is still required there', () => {
    const r = validateEnquiry({ name: 'Ada', email: 'ada@example.ca', website: 'adabakery.ca' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.message).toBeTruthy();
  });
});

function deps(): HandlerDeps {
  let n = 0;
  return {
    fetch: vi.fn() as unknown as typeof fetch,
    now: () => T0 + 10_000,
    limiter: new RateLimiter(),
    dedupe: new Dedupe<HandlerResponse>(),
    log: () => {},
    randomId: () => `enq_test_${++n}`,
    appendFile: async () => {},
    sleep: async () => {},
  };
}
const cfg: HandlerConfig = { mode: 'file', production: false, tokenSecret: SECRET, dataDir: '.data' };

describe('free check handling', () => {
  it('two different check requests from the same email are both delivered (not treated as duplicates)', async () => {
    const d = deps();
    const token = await issueToken(SECRET, T0);
    const a = await handleEnquiry({ name: 'Ada', email: 'ada@example.ca', packageId: 'check-up', website: 'one.ca', formToken: token }, { ip: '1.1.1.1' }, cfg, d);
    const b = await handleEnquiry({ name: 'Ada', email: 'ada@example.ca', packageId: 'check-up', website: 'two.ca', formToken: token }, { ip: '1.1.1.1' }, cfg, d);
    expect(a.body.ok && b.body.ok).toBe(true);
    if (a.body.ok && b.body.ok) {
      expect(b.body.duplicate).toBeUndefined();
      expect(b.body.id).not.toBe(a.body.id);
    }
  });

  it('a retry of the same request returns the original result instead of sending again', async () => {
    const d = deps();
    const token = await issueToken(SECRET, T0);
    const body = { name: 'Ada', email: 'ada@example.ca', packageId: 'check-up', business: 'Ada Bakery', formToken: token, submissionId: 'abcdef12-3456' };
    const first = await handleEnquiry(body, { ip: '1.1.1.1' }, cfg, d);
    const again = await handleEnquiry(body, { ip: '1.1.1.1' }, cfg, d);
    expect(first.body.ok && again.body.ok).toBe(true);
    if (first.body.ok && again.body.ok) {
      expect(again.body.duplicate).toBe(true);
      expect(again.body.id).toBe(first.body.id);
    }
  });

  it('marks free checks in the owner email and copes with no message', () => {
    const lead: Lead = {
      name: 'Ada', email: 'ada@example.ca', business: '', website: 'https://adabakery.ca/', phone: '', services: [],
      packageId: 'check-up', budget: '', timeframe: '', message: '', id: 'enq_1', receivedAt: '2026-11-08T12:00:00Z', source: 'website', lowTrust: false,
    };
    expect(ownerSubject(lead)).toBe('Free check request: Ada (adabakery.ca)');
    expect(ownerEmailText(lead)).toContain('Starting point: Free Found & Answered check');
    expect(ownerSubject({ ...lead, packageId: '', business: 'Ada Bakery' })).toBe('New enquiry: Ada (Ada Bakery)');
  });
});

describe('browser sending states', () => {
  const ok = (body: unknown, status = 200) => vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it('accepted only when the server says ok', async () => {
    const r = await sendEnquiry({}, { fetch: ok({ ok: true, id: 'enq_1', acknowledgement: 'not-configured' }) });
    expect(r.kind).toBe('accepted');
  });

  it('a server refusal keeps its code and message (for example, not connected)', async () => {
    const r = await sendEnquiry({}, { fetch: ok({ ok: false, code: 'not_connected', message: 'not sent' }, 503) });
    expect(r.kind).toBe('rejected');
    if (r.kind === 'rejected') expect(r.body.code).toBe('not_connected');
  });

  it('a 200 without ok:true is not treated as sent', async () => {
    const r = await sendEnquiry({}, { fetch: ok({ connected: false }) });
    expect(r.kind).toBe('rejected');
  });

  it('a dropped connection is a network failure', async () => {
    const r = await sendEnquiry({}, { fetch: vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))) as unknown as typeof fetch });
    expect(r.kind).toBe('network');
  });

  it('a request that never answers times out, and says a retry won’t duplicate', async () => {
    const hang = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_, reject) => init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))),
    ) as unknown as typeof fetch;
    const r = await sendEnquiry({}, { fetch: hang, timeoutMs: 20 });
    expect(r.kind).toBe('timeout');
    if (r.kind === 'timeout') expect(failureText(r)).toMatch(/won’t create a duplicate/);
  });
});

describe('copy and email fallbacks', () => {
  const data = { name: 'Ada', email: 'ada@example.ca', website: 'adabakery.ca', packageId: 'check-up', message: '' };

  it('keeps every answer and leaves out empty ones', () => {
    const text = briefText(data);
    expect(text).toContain('Name: Ada');
    expect(text).toContain('Website: adabakery.ca');
    expect(text).toContain('Starting point: Free Found & Answered check');
    expect(text).not.toContain('Phone:');
  });

  it('builds a mailto with the subject and body encoded', () => {
    const href = briefMailto('info@mannpatel.me', data);
    expect(href.startsWith('mailto:info@mannpatel.me?subject=')).toBe(true);
    expect(decodeURIComponent(href)).toContain('Free check request from Ada');
  });
});
