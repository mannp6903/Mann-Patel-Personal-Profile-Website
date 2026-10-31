/**
 * Spam protection, in layers. Every rejection tells a real person what to do next.
 * 1. Honeypot field a person never sees.
 * 2. Signed time token: issued when the form is first used; submissions faster than
 *    MIN_SECONDS or older than MAX_AGE are rejected.
 * 3. Simple content check (too many links).
 * 4. Optional Cloudflare Turnstile, when keys are configured.
 */

export const HONEYPOT_FIELD = 'office_fax';
export const MIN_SECONDS = 3;
export const MAX_AGE_SECONDS = 2 * 60 * 60;
const MAX_LINKS = 3;

const enc = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(sig).toString('base64url');
}

export async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(data));
  return Buffer.from(digest).toString('hex');
}

export async function signHex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(sig).toString('hex');
}

export async function issueToken(secret: string, nowMs: number): Promise<string> {
  const t = String(nowMs);
  return `${t}.${await hmac(secret, t)}`;
}

export type TokenCheck = { ok: true } | { ok: false; reason: 'missing' | 'invalid' | 'too-fast' | 'expired' };

export async function verifyToken(secret: string, token: unknown, nowMs: number): Promise<TokenCheck> {
  if (typeof token !== 'string' || !token.includes('.')) return { ok: false, reason: 'missing' };
  const [t, sig] = token.split('.', 2);
  if (!/^\d{10,16}$/.test(t)) return { ok: false, reason: 'invalid' };
  const expected = await hmac(secret, t);
  if (expected.length !== sig.length || !timingSafeEqual(expected, sig)) return { ok: false, reason: 'invalid' };
  const ageS = (nowMs - Number(t)) / 1000;
  if (ageS < MIN_SECONDS) return { ok: false, reason: 'too-fast' };
  if (ageS > MAX_AGE_SECONDS) return { ok: false, reason: 'expired' };
  return { ok: true };
}

function timingSafeEqual(a: string, b: string) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function honeypotTripped(body: Record<string, unknown>): boolean {
  const v = body[HONEYPOT_FIELD];
  return typeof v === 'string' ? v.trim().length > 0 : Boolean(v);
}

export function tooManyLinks(message: string): boolean {
  const links = message.match(/https?:\/\/|www\./gi);
  return (links?.length ?? 0) > MAX_LINKS;
}

export async function verifyTurnstile(
  secret: string,
  response: unknown,
  ip: string,
  fetchImpl: typeof fetch,
): Promise<boolean> {
  if (typeof response !== 'string' || !response) return false;
  try {
    const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
