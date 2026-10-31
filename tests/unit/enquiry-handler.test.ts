import { describe, it, expect, vi } from 'vitest';
import { handleEnquiry, type HandlerConfig, type HandlerDeps, type HandlerResponse } from '../../src/lib/enquiry/handler';
import { RateLimiter, Dedupe } from '../../src/lib/enquiry/limits';
import { issueToken, verifyToken, HONEYPOT_FIELD, signHex } from '../../src/lib/enquiry/spam';
import { deliver, ownerEmailText, acknowledgementText, type Lead } from '../../src/lib/enquiry/delivery';

const SECRET = 'test-secret';
const T0 = Date.UTC(2026, 9, 31, 12, 0, 0);

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.ca',
  business: 'Kettle Test Co',
  message: 'I run a small bakery and need a website that shows our hours.',
  services: ['websites'],
};

function setup(overrides: Partial<HandlerConfig> = {}, fetchImpl?: typeof fetch) {
  const files: { path: string; data: string }[] = [];
  const logs: { event: string; meta: Record<string, unknown> }[] = [];
  let now = T0;
  let n = 0;
  const deps: HandlerDeps = {
    fetch: fetchImpl ?? (vi.fn() as unknown as typeof fetch),
    now: () => now,
    limiter: new RateLimiter(),
    dedupe: new Dedupe<HandlerResponse>(),
    log: (event, meta) => logs.push({ event, meta }),
    randomId: () => `enq_test_${++n}`,
    appendFile: async (path, data) => {
      files.push({ path, data });
    },
    sleep: async () => {},
  };
  const cfg: HandlerConfig = { mode: 'file', production: false, tokenSecret: SECRET, dataDir: '.data', ...overrides };
  return { deps, cfg, files, logs, advance: (ms: number) => (now += ms), at: () => now };
}

async function tokenAt(ms: number) {
  return issueToken(SECRET, ms);
}

describe('spam token', () => {
  it('accepts a token after 3 seconds and rejects too-fast, tampered and expired tokens', async () => {
    const t = await tokenAt(T0);
    expect(await verifyToken(SECRET, t, T0 + 5_000)).toEqual({ ok: true });
    expect(await verifyToken(SECRET, t, T0 + 1_000)).toEqual({ ok: false, reason: 'too-fast' });
    expect(await verifyToken(SECRET, t.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')), T0 + 5_000)).toEqual({ ok: false, reason: 'invalid' });
    expect(await verifyToken(SECRET, t, T0 + 3 * 60 * 60 * 1000)).toEqual({ ok: false, reason: 'expired' });
    expect(await verifyToken(SECRET, undefined, T0)).toEqual({ ok: false, reason: 'missing' });
  });
});

describe('handleEnquiry', () => {
  it('accepts a valid enquiry, records it, and never logs personal data', async () => {
    const s = setup();
    const res = await handleEnquiry({ ...valid, formToken: await tokenAt(T0 - 10_000) }, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, id: 'enq_test_1', acknowledgement: 'not-configured' });
    expect(s.files).toHaveLength(1);
    expect(JSON.parse(s.files[0].data)).toMatchObject({ email: 'ada@example.ca', lowTrust: false, source: 'website' });
    const logged = JSON.stringify(s.logs);
    expect(logged).not.toContain('ada@example.ca');
    expect(logged).not.toContain('Ada');
    expect(logged).not.toContain('bakery');
  });

  it('returns field errors and does not record anything for invalid input', async () => {
    const s = setup();
    const res = await handleEnquiry({ name: '', email: 'x', message: '' }, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    if (!res.body.ok) {
      expect(res.body.code).toBe('validation');
      expect(res.body.errors).toHaveProperty('email');
    }
    expect(s.files).toHaveLength(0);
  });

  it('rejects the honeypot', async () => {
    const s = setup();
    const res = await handleEnquiry({ ...valid, [HONEYPOT_FIELD]: 'http://spam' }, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(res.status).toBe(400);
    expect(!res.body.ok && res.body.code).toBe('spam');
    expect(s.files).toHaveLength(0);
  });

  it('asks a too-fast sender to wait, and an expired page to resend', async () => {
    const s = setup();
    const fast = await handleEnquiry({ ...valid, formToken: await tokenAt(T0 - 500) }, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(!fast.body.ok && fast.body.code).toBe('too_fast');
    const old = await handleEnquiry({ ...valid, formToken: await tokenAt(T0 - 3 * 3600_000) }, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(!old.body.ok && old.body.code).toBe('expired');
  });

  it('accepts a message without a token (no JavaScript) but flags it as low trust', async () => {
    const s = setup();
    const res = await handleEnquiry(valid, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(res.status).toBe(200);
    expect(JSON.parse(s.files[0].data).lowTrust).toBe(true);
  });

  it('rejects messages with too many links', async () => {
    const s = setup();
    const res = await handleEnquiry(
      { ...valid, message: 'see http://a.com http://b.com http://c.com http://d.com please' },
      { ip: '1.2.3.4' },
      s.cfg,
      s.deps,
    );
    expect(res.status).toBe(400);
    expect(!res.body.ok && res.body.errors?.message).toMatch(/no more than 3 links/);
  });

  it('treats a repeated submission as a duplicate without recording it twice', async () => {
    const s = setup();
    const body = { ...valid, submissionId: '0b6f2c1e-4c1a-4d55-9f6e-6a0e1f9a1234', formToken: await tokenAt(T0 - 10_000) };
    const a = await handleEnquiry(body, { ip: '1.2.3.4' }, s.cfg, s.deps);
    const b = await handleEnquiry(body, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(a.body).toMatchObject({ ok: true, id: 'enq_test_1' });
    expect(b.body).toMatchObject({ ok: true, id: 'enq_test_1', duplicate: true });
    expect(s.files).toHaveLength(1);
    // Same content without the submission id (e.g. no-JS double click) is also caught.
    const c = await handleEnquiry({ ...valid, formToken: await tokenAt(T0 - 10_000) }, { ip: '1.2.3.4' }, s.cfg, s.deps);
    expect(c.body).toMatchObject({ duplicate: true });
    expect(s.files).toHaveLength(1);
  });

  it('rate-limits after 5 accepted messages in 10 minutes from one address', async () => {
    const s = setup();
    for (let i = 0; i < 5; i++) {
      const r = await handleEnquiry({ ...valid, message: `${valid.message} #${i}` }, { ip: '9.9.9.9' }, s.cfg, s.deps);
      expect(r.status).toBe(200);
    }
    const blocked = await handleEnquiry({ ...valid, message: `${valid.message} #6` }, { ip: '9.9.9.9' }, s.cfg, s.deps);
    expect(blocked.status).toBe(429);
    expect(!blocked.body.ok && blocked.body.retryAfter).toBeGreaterThan(0);
    const other = await handleEnquiry({ ...valid, message: `${valid.message} #7` }, { ip: '8.8.8.8' }, s.cfg, s.deps);
    expect(other.status).toBe(200);
  });

  it('reports "not connected" honestly when no delivery is configured, and refuses file storage in production', async () => {
    const none = setup({ mode: 'none' });
    const r1 = await handleEnquiry(valid, { ip: '1.1.1.1' }, none.cfg, none.deps);
    expect(r1.status).toBe(503);
    expect(!r1.body.ok && r1.body.code).toBe('not_connected');
    const prodFile = setup({ mode: 'file', production: true });
    const r2 = await handleEnquiry(valid, { ip: '1.1.1.1' }, prodFile.cfg, prodFile.deps);
    expect(r2.status).toBe(503);
    expect(prodFile.files).toHaveLength(0);
  });

  it('reports failure (and allows a retry) when the provider rejects the message', async () => {
    const fetchFail = vi.fn(async () => new Response('{"message":"bad key"}', { status: 401 }));
    const s = setup({ mode: 'resend', resendKey: 'k', toEmail: 'me@example.ca', fromEmail: 'site@example.ca' }, fetchFail as unknown as typeof fetch);
    const body = { ...valid, submissionId: 'retry-test-0001' };
    const r = await handleEnquiry(body, { ip: '1.1.1.1' }, s.cfg, s.deps);
    expect(r.status).toBe(502);
    expect(!r.body.ok && r.body.code).toBe('delivery_failed');
    // A retry is attempted again rather than returning the cached failure.
    await handleEnquiry(body, { ip: '1.1.1.1' }, s.cfg, s.deps);
    expect(fetchFail).toHaveBeenCalledTimes(2);
  });
});

describe('delivery adapters', () => {
  const lead: Lead = {
    id: 'enq_1', receivedAt: '2026-10-31T12:00:00.000Z', source: 'website', lowTrust: false,
    name: 'Ada Lovelace', email: 'ada@example.ca', business: 'Kettle Test Co', website: '', phone: '',
    services: ['websites'], packageId: 'launch', budget: '', timeframe: '', message: 'Hello there, I need a site.',
  };

  it('Resend: sends owner notification with reply_to, then the acknowledgement; success needs a returned id', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchOk = vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ id: `re_${calls.length}` }), { status: 200 });
    });
    const res = await deliver(
      lead,
      { mode: 'resend', production: true, resendKey: 'key', toEmail: 'me@example.ca', fromEmail: 'Mann <hi@example.ca>', acknowledge: true },
      { fetch: fetchOk as unknown as typeof fetch, sleep: async () => {} },
    );
    expect(res).toMatchObject({ accepted: true, channels: ['owner-email'], acknowledgement: 'sent' });
    expect(calls).toHaveLength(2);
    const owner = JSON.parse(String(calls[0].init.body));
    expect(owner).toMatchObject({ to: ['me@example.ca'], reply_to: 'ada@example.ca', from: 'Mann <hi@example.ca>' });
    expect((calls[0].init.headers as Record<string, string>)['Idempotency-Key']).toBe('enq_1-owner');
    const ack = JSON.parse(String(calls[1].init.body));
    expect(ack.to).toEqual(['ada@example.ca']);
    expect(ack.text).toContain('not a booked appointment');
  });

  it('retries once on a 5xx and succeeds', async () => {
    let n = 0;
    const flaky = vi.fn(async () => (++n === 1 ? new Response('', { status: 503 }) : new Response('{"id":"re_ok"}', { status: 200 })));
    const res = await deliver(lead, { mode: 'resend', production: true, resendKey: 'k', toEmail: 'a@b.ca', fromEmail: 'c@d.ca' }, { fetch: flaky as unknown as typeof fetch, sleep: async () => {} });
    expect(res.accepted).toBe(true);
    expect(flaky).toHaveBeenCalledTimes(2);
  });

  it('acknowledgement failure does not fail an accepted lead', async () => {
    let n = 0;
    const f = vi.fn(async () => (++n === 1 ? new Response('{"id":"re_1"}', { status: 200 }) : new Response('{}', { status: 422 })));
    const res = await deliver(lead, { mode: 'resend', production: true, resendKey: 'k', toEmail: 'a@b.ca', fromEmail: 'c@d.ca', acknowledge: true }, { fetch: f as unknown as typeof fetch, sleep: async () => {} });
    expect(res).toMatchObject({ accepted: true, acknowledgement: 'failed' });
  });

  it('webhook: signs the exact body with HMAC-SHA256', async () => {
    let seen: RequestInit | undefined;
    const f = vi.fn(async (_u: string, init: RequestInit) => {
      seen = init;
      return new Response('ok', { status: 200 });
    });
    const res = await deliver(lead, { mode: 'webhook', production: true, webhookUrl: 'https://hooks.example/x', webhookSecret: 's3cret' }, { fetch: f as unknown as typeof fetch, sleep: async () => {} });
    expect(res.accepted).toBe(true);
    const sig = (seen!.headers as Record<string, string>)['X-Signature'];
    expect(sig).toBe(`sha256=${await signHex('s3cret', String(seen!.body))}`);
  });

  it('email texts are plain and honest', () => {
    expect(ownerEmailText(lead)).toContain('Services: Website or landing page');
    expect(acknowledgementText(lead)).toMatch(/^Hi Ada,/);
  });
});
