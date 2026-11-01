import type { APIRoute } from 'astro';
import {
  SITE_MODE,
  ENQUIRY_DELIVERY,
  ENQUIRY_TO_EMAIL,
  ENQUIRY_FROM_EMAIL,
  ENQUIRY_ACKNOWLEDGE,
  RESEND_API_KEY,
  ENQUIRY_WEBHOOK_URL,
  ENQUIRY_WEBHOOK_SECRET,
  FORM_TOKEN_SECRET,
  TURNSTILE_SECRET_KEY,
} from 'astro:env/server';
import { handleEnquiry, type HandlerConfig, type HandlerResponse } from '../../lib/enquiry/handler';
import { RateLimiter, Dedupe } from '../../lib/enquiry/limits';
import { deliveryReady } from '../../lib/enquiry/delivery';
import { issueToken } from '../../lib/enquiry/spam';

export const prerender = false;

const MAX_BODY_BYTES = 64 * 1024;
const production = SITE_MODE === 'production';
// Local previews without FORM_TOKEN_SECRET get a per-process secret. Production must set one.
// Created on first use: Cloudflare Workers don't allow random values while a module loads.
let previewSecret: string | undefined;
const tokenSecret = (): string | undefined =>
  FORM_TOKEN_SECRET || (production ? undefined : (previewSecret ??= crypto.randomUUID()));

// Per-instance memory (see limits.ts for the limitation).
const limiter = new RateLimiter();
const dedupe = new Dedupe<HandlerResponse>();

function config(): HandlerConfig {
  return {
    mode: ENQUIRY_DELIVERY ?? (production ? 'none' : 'file'),
    production,
    toEmail: ENQUIRY_TO_EMAIL,
    fromEmail: ENQUIRY_FROM_EMAIL,
    acknowledge: ENQUIRY_ACKNOWLEDGE ?? false,
    resendKey: RESEND_API_KEY,
    webhookUrl: ENQUIRY_WEBHOOK_URL,
    webhookSecret: ENQUIRY_WEBHOOK_SECRET,
    dataDir: '.data',
    tokenSecret: tokenSecret(),
    turnstileSecret: TURNSTILE_SECRET_KEY,
  };
}

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra },
  });

function clientIp(request: Request, clientAddress: () => string): string {
  try {
    return clientAddress();
  } catch {
    return (
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
    );
  }
}

const log = (event: string, meta: Record<string, unknown>) => console.info(JSON.stringify({ event, ...meta }));

/** Form status + time-check token. Called when a visitor first interacts with the form. */
export const GET: APIRoute = async () => {
  const ready = deliveryReady(config());
  const secret = tokenSecret();
  const token = secret ? await issueToken(secret, Date.now()) : null;
  // `reason` is a fixed code only; it never names settings or secrets.
  return json(200, { connected: ready.ready, token, reason: ready.ready ? 'ready' : 'not_configured' });
};

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const type = request.headers.get('content-type') ?? '';
  const wantsHtml = !type.includes('application/json');
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) return json(413, { ok: false, code: 'bad_request', message: 'Your message is too large.' });

  let body: Record<string, unknown>;
  try {
    if (type.includes('application/json')) {
      body = (await request.json()) as Record<string, unknown>;
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
    } else if (type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')) {
      const form = await request.formData();
      body = {};
      for (const [k, v] of form.entries()) {
        if (typeof v !== 'string') continue;
        if (k === 'services') body.services = [...((body.services as string[]) ?? []), v];
        else body[k] = v;
      }
    } else {
      return json(415, { ok: false, code: 'bad_request', message: 'Unsupported content type.' });
    }
  } catch {
    return json(400, { ok: false, code: 'bad_request', message: 'The form data could not be read. Please try again.' });
  }

  const result = await handleEnquiry(body, { ip: clientIp(request, () => context.clientAddress) }, config(), {
    fetch: globalThis.fetch.bind(globalThis),
    now: Date.now,
    limiter,
    dedupe,
    log,
    randomId: () => {
      const d = new Date();
      const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
      return `enq_${ymd}_${crypto.randomUUID().slice(0, 8)}`;
    },
    // Local testing only (ENQUIRY_DELIVERY=file); loaded on demand because Workers have no disk.
    appendFile: async (path, data) => {
      const { appendFile, mkdir } = await import('node:fs/promises');
      const { dirname } = await import('node:path');
      await mkdir(dirname(path), { recursive: true });
      await appendFile(path, data, 'utf8');
    },
  });

  const retry: Record<string, string> = !result.body.ok && result.body.retryAfter ? { 'Retry-After': String(result.body.retryAfter) } : {};

  // No-JavaScript form posts get a page, not JSON.
  if (wantsHtml) {
    if (result.body.ok) return new Response(null, { status: 303, headers: { Location: '/contact/received/', 'Cache-Control': 'no-store' } });
    const errs = result.body.errors ? Object.values(result.body.errors) : [];
    const html = `<!doctype html><html lang="en-CA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Message not sent · Mann Patel</title><style>body{font:18px/1.6 system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#15171a;background:#f4f1ea}a{color:#b03a12;font-weight:700}</style></head><body><h1>Your message wasn’t sent</h1><p>${escapeHtml(result.body.message)}</p>${errs.length ? `<ul>${errs.map((e) => `<li>${escapeHtml(String(e))}</li>`).join('')}</ul>` : ''}<p><a href="javascript:history.back()">Go back to your message</a> (your answers should still be there) or <a href="/contact/">open the form again</a>.</p></body></html>`;
    return new Response(html, { status: result.status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...retry } });
  }
  return json(result.status, result.body, retry);
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
