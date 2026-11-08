/**
 * Enquiry handler — framework-independent so it can be unit tested.
 * The Astro endpoint (src/pages/api/enquiry.ts) only adapts the request/response.
 */
import { validateEnquiry, type FieldErrors } from './validate';
import { honeypotTripped, tooManyLinks, verifyToken, verifyTurnstile, sha256Hex } from './spam';
import { RateLimiter, Dedupe } from './limits';
import { deliver, deliveryReady, type DeliveryConfig, type DeliveryDeps, type Lead } from './delivery';

export interface HandlerConfig extends DeliveryConfig {
  tokenSecret?: string;
  turnstileSecret?: string;
}

export interface HandlerDeps extends DeliveryDeps {
  now: () => number;
  limiter: RateLimiter;
  dedupe: Dedupe<HandlerResponse>;
  log: (event: string, meta: Record<string, unknown>) => void;
  randomId: () => string;
}

export type ErrorCode =
  | 'bad_request'
  | 'validation'
  | 'spam'
  | 'too_fast'
  | 'expired'
  | 'rate_limited'
  | 'not_connected'
  | 'delivery_failed';

export type ResponseBody =
  | { ok: true; id: string; duplicate?: boolean; acknowledgement: 'sent' | 'not-configured' | 'failed' }
  | { ok: false; code: ErrorCode; message: string; errors?: FieldErrors; retryAfter?: number };

export interface HandlerResponse {
  status: number;
  body: ResponseBody;
}

const fail = (status: number, code: ErrorCode, message: string, extra: Partial<Extract<ResponseBody, { ok: false }>> = {}): HandlerResponse => ({
  status,
  body: { ok: false, code, message, ...extra },
});

const SUBMISSION_ID = /^[A-Za-z0-9-]{8,64}$/;

export async function handleEnquiry(
  body: Record<string, unknown>,
  ctx: { ip: string },
  cfg: HandlerConfig,
  deps: HandlerDeps,
): Promise<HandlerResponse> {
  const now = deps.now();

  if (honeypotTripped(body)) {
    deps.log('enquiry_rejected', { reason: 'honeypot' });
    return fail(400, 'spam', 'Your message couldn’t be sent. Please try again, or use another way to reach me.');
  }

  const v = validateEnquiry(body);
  if (!v.ok) {
    return fail(400, 'validation', 'Please check the highlighted fields.', { errors: v.errors });
  }
  const enquiry = v.value;

  if (tooManyLinks(enquiry.message)) {
    return fail(400, 'validation', 'Please check the highlighted fields.', {
      errors: { message: 'Please include no more than 3 links. You can send more after I reply.' },
    });
  }

  if (cfg.turnstileSecret) {
    const human = await verifyTurnstile(cfg.turnstileSecret, body['cf-turnstile-response'], ctx.ip, deps.fetch);
    if (!human) return fail(400, 'spam', 'Please complete the “I’m human” check and send again.');
  }

  let lowTrust = false;
  if (cfg.tokenSecret) {
    const t = await verifyToken(cfg.tokenSecret, body.formToken, now);
    if (!t.ok) {
      if (t.reason === 'missing') lowTrust = true;
      else if (t.reason === 'too-fast') return fail(400, 'too_fast', 'That was quick! Please wait a few seconds, then send again.');
      else return fail(400, 'expired', 'This page was open for a long time. Please send again. Your answers are still here.');
    }
  } else {
    lowTrust = typeof body.formToken !== 'string';
  }

  const ipKey = await sha256Hex(`ip:${ctx.ip}`);
  // Same person, same request: a free check has no required message, so what to check is part of the key.
  const contentKey = await sha256Hex(`c:${enquiry.email}:${enquiry.packageId}:${enquiry.website}:${enquiry.business}:${enquiry.message}`);
  const submissionKey = typeof body.submissionId === 'string' && SUBMISSION_ID.test(body.submissionId) ? `s:${body.submissionId}` : null;

  // Duplicate submit (double-click, retry after a slow network, back-button resend).
  const previous = (submissionKey && deps.dedupe.get(submissionKey, now)) || deps.dedupe.get(contentKey, now);
  if (previous) {
    const prior = await previous;
    if (prior.body.ok) return { status: 200, body: { ...prior.body, duplicate: true } };
  }

  const retryAfter = deps.limiter.check(ipKey, now);
  if (retryAfter) {
    deps.log('enquiry_rate_limited', { retryAfter });
    return fail(429, 'rate_limited', 'You’ve sent several messages in a short time. Please try again a little later.', { retryAfter });
  }

  const ready = deliveryReady(cfg);
  if (!ready.ready) {
    deps.log('enquiry_not_connected', { reason: ready.reason });
    return fail(503, 'not_connected', 'The form isn’t connected yet, so your message was not sent. Please try again later.');
  }

  const lead: Lead = { ...enquiry, id: deps.randomId(), receivedAt: new Date(now).toISOString(), source: 'website', lowTrust };

  const work = (async (): Promise<HandlerResponse> => {
    const result = await deliver(lead, cfg, deps);
    // Log metadata only: never names, emails, phone numbers or message text.
    deps.log(result.accepted ? 'enquiry_accepted' : 'enquiry_delivery_failed', {
      id: lead.id,
      channels: result.channels,
      failures: result.failures,
      acknowledgement: result.acknowledgement,
      services: lead.services,
      lowTrust,
    });
    if (!result.accepted) {
      return fail(502, 'delivery_failed', 'Something went wrong on my side and your message was not sent. Please try again in a few minutes.');
    }
    return { status: 200, body: { ok: true, id: lead.id, acknowledgement: result.acknowledgement } };
  })();

  if (submissionKey) deps.dedupe.set(submissionKey, work, now);
  deps.dedupe.set(contentKey, work, now);
  const response = await work;
  if (!response.body.ok) {
    // Allow a genuine retry after a failure.
    if (submissionKey) deps.dedupe.delete(submissionKey);
    deps.dedupe.delete(contentKey);
  }
  return response;
}
