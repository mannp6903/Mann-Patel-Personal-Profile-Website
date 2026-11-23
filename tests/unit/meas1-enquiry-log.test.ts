/**
 * MEAS-1 (23 Nov 2026 audit, audit/D-backlog.csv): each delivered enquiry is logged once, with the form type, the page
 * the visit started on and the referring site. Pass: a test submission appears once in the log with both.
 */
import { describe, it, expect, vi } from 'vitest';
import { handleEnquiry, formType, type HandlerConfig, type HandlerDeps, type HandlerResponse } from '../../src/lib/enquiry/handler';
import { RateLimiter, Dedupe } from '../../src/lib/enquiry/limits';
import { issueToken } from '../../src/lib/enquiry/spam';
import { ownerSubject, ownerEmailText } from '../../src/lib/enquiry/delivery';
import { cleanLandingPage, cleanReferrerHost, validateEnquiry } from '../../src/lib/enquiry/validate';

const SECRET = 'test-secret';
const T0 = Date.UTC(2026, 10, 24, 15, 0, 0);

function setup() {
  const logs: { event: string; meta: Record<string, unknown> }[] = [];
  const files: string[] = [];
  let n = 0;
  const deps: HandlerDeps = {
    fetch: vi.fn() as unknown as typeof fetch,
    now: () => T0,
    limiter: new RateLimiter(),
    dedupe: new Dedupe<HandlerResponse>(),
    log: (event, meta) => logs.push({ event, meta }),
    randomId: () => `enq_test_${++n}`,
    appendFile: async (_p, data) => {
      files.push(data);
    },
    sleep: async () => {},
  };
  const cfg: HandlerConfig = { mode: 'file', production: false, tokenSecret: SECRET, dataDir: '.data' };
  return { deps, cfg, logs, files };
}

describe('MEAS-1: one log line per delivered enquiry, with form type and landing page', () => {
  it('a test free check appears once in the log, as a check, with its landing page and referrer host', async () => {
    const s = setup();
    const body = {
      name: 'Ada',
      email: 'ada@example.ca',
      website: 'adabakery.ca',
      packageId: 'check-up',
      landingPage: '/pricing/',
      referrerHost: 'www.Google.com',
      formToken: await issueToken(SECRET, T0 - 10_000),
    };
    const res = await handleEnquiry(body, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(res.status).toBe(200);
    // A double-click or retry sends the same request again: still one accepted line.
    await handleEnquiry(body, { ip: '1.2.3.4' }, s.cfg, s.deps);
    const accepted = s.logs.filter((l) => l.event === 'enquiry_accepted');
    expect(accepted).toHaveLength(1);
    expect(accepted[0].meta).toMatchObject({ form: 'check', landingPage: '/pricing/', referrerHost: 'www.google.com', receivedAt: new Date(T0).toISOString() });
    // Still no personal data in the log.
    expect(JSON.stringify(s.logs)).not.toContain('ada@example.ca');
    expect(s.files).toHaveLength(1);
    expect(JSON.parse(s.files[0])).toMatchObject({ landingPage: '/pricing/', referrerHost: 'www.google.com' });
  });

  it('a brief is logged as a brief; unknown attribution is null, never an error', async () => {
    const s = setup();
    const res = await handleEnquiry(
      {
        name: 'Grace',
        email: 'grace@example.ca',
        message: 'I need a new website for my cleaning company.',
        landingPage: 'https://evil.example/x?y',
        referrerHost: 'not a host',
        formToken: await issueToken(SECRET, T0 - 10_000),
      },
      { ip: '1.2.3.5' },
      s.cfg,
      s.deps,
    );
    expect(res.status).toBe(200);
    expect(s.logs.find((l) => l.event === 'enquiry_accepted')?.meta).toMatchObject({ form: 'brief', landingPage: null, referrerHost: null });
  });

  it('the email subject and body name the landing page and the referring site', () => {
    const v = validateEnquiry({ name: 'Ada', email: 'ada@example.ca', website: 'adabakery.ca', packageId: 'check-up', landingPage: '/services/web-design/', referrerHost: 'bing.com' });
    expect(v.ok).toBe(true);
    if (!v.ok) return;
    const lead = { ...v.value, id: 'enq_1', receivedAt: new Date(T0).toISOString(), source: 'website' as const, lowTrust: false };
    expect(ownerSubject(lead)).toBe('Free check request: Ada (adabakery.ca) · via /services/web-design/');
    expect(ownerEmailText(lead)).toContain('Form: Free check');
    expect(ownerEmailText(lead)).toContain('Landing page: /services/web-design/');
    expect(ownerEmailText(lead)).toContain('Came from: bing.com');
  });

  it('cleans attribution values strictly', () => {
    expect(cleanLandingPage('/web-design-scarborough/')).toBe('/web-design-scarborough/');
    expect(cleanLandingPage('/x?utm=1')).toBe('');
    expect(cleanLandingPage('//evil.example/')).toBe('');
    expect(cleanLandingPage('pricing')).toBe('');
    expect(cleanReferrerHost('l.instagram.com')).toBe('l.instagram.com');
    expect(cleanReferrerHost('https://google.com/')).toBe('');
    expect(cleanReferrerHost('localhost')).toBe('');
    expect(formType('check-up')).toBe('check');
    expect(formType('website-launch')).toBe('brief');
  });
});
