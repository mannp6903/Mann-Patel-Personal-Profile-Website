/**
 * Browser side of the enquiry forms (the project brief and the free check), shared so both behave
 * the same way. Framework-free, so it can be unit tested.
 *
 * - `sendEnquiry` posts with a timeout and classifies the outcome. A retry is safe: the form keeps
 *   the same submission id until the server accepts it, and the server answers a repeat with the
 *   original result instead of sending a second email (src/lib/enquiry/handler.ts).
 * - `briefText` / `briefMailto` turn the answers into plain text for the email-app fallback and the
 *   "Copy my brief" button, so nothing typed is lost when the website can't send.
 */
import { SERVICE_OPTIONS, PACKAGE_OPTIONS, BUDGET_OPTIONS, TIMEFRAME_OPTIONS, labelFor } from './options';

export type SendOutcome =
  | { kind: 'accepted'; body: { ok: true; id: string; duplicate?: boolean; acknowledgement?: string } }
  | { kind: 'rejected'; status: number; body: { ok: false; code?: string; message?: string; errors?: Record<string, string>; retryAfter?: number } }
  | { kind: 'timeout' }
  | { kind: 'network' };

export const SEND_TIMEOUT_MS = 20_000;

export async function sendEnquiry(
  data: Record<string, unknown>,
  opts: { timeoutMs?: number; fetch?: typeof fetch } = {},
): Promise<SendOutcome> {
  const f = opts.fetch ?? fetch;
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), opts.timeoutMs ?? SEND_TIMEOUT_MS) : null;
  try {
    const res = await f('/api/enquiry/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: ctrl?.signal,
    });
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    if (res.ok && body?.ok) return { kind: 'accepted', body };
    return { kind: 'rejected', status: res.status, body: body && typeof body === 'object' ? body : { ok: false } };
  } catch (e) {
    return (e as Error)?.name === 'AbortError' ? { kind: 'timeout' } : { kind: 'network' };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** The answers as plain text, labelled the way the form labels them. Empty answers are left out. */
export function briefText(data: Record<string, unknown>): string {
  const v = (k: string) => String(data[k] ?? '').trim();
  const services = ((data.services as string[] | undefined) ?? []).map((id) => labelFor(SERVICE_OPTIONS, id));
  const rows = [
    ['Name', v('name')],
    ['Email', v('email')],
    ['Business', v('business')],
    ['Website', v('website')],
    ['Phone', v('phone')],
    ['Help with', services.join('; ')],
    ['Starting point', v('packageId') && labelFor(PACKAGE_OPTIONS, v('packageId'))],
    ['Budget', v('budget') && labelFor(BUDGET_OPTIONS, v('budget'))],
    ['Timeframe', v('timeframe') && labelFor(TIMEFRAME_OPTIONS, v('timeframe'))],
  ].filter(([, val]) => val);
  const message = v('message');
  return `${rows.map(([k, val]) => `${k}: ${val}`).join('\n')}${message ? `\n\n${message}` : ''}\n`;
}

export function briefSubject(data: Record<string, unknown>): string {
  const name = String(data.name ?? '').trim();
  const business = String(data.business ?? '').trim();
  const kind = data.packageId === 'check-up' ? 'Free check request' : 'Project brief';
  return `${kind} from ${name}${business ? ` (${business})` : ''}`;
}

export function briefMailto(to: string, data: Record<string, unknown>): string {
  return `mailto:${to}?subject=${encodeURIComponent(briefSubject(data))}&body=${encodeURIComponent(briefText(data))}`;
}

/** Plain-language text for each failure, and whether retrying the same send makes sense. */
export function failureText(outcome: Exclude<SendOutcome, { kind: 'accepted' }>, noun = 'brief'): string {
  if (outcome.kind === 'timeout')
    return `Sending your ${noun} took too long, so I can’t tell whether it arrived. Your answers are still here: press send again (it won’t create a duplicate), or copy your ${noun} and email it.`;
  if (outcome.kind === 'network') return `Your ${noun} wasn’t sent: the connection failed. Your answers are still here. Check your connection and try again.`;
  return outcome.body.message ?? `Your ${noun} wasn’t sent. Your answers are still here. Please try again.`;
}
