/**
 * Delivery adapters. Success is reported only when a provider ACCEPTS the lead
 * (file written, Resend returned an id, webhook returned 2xx). Provider acceptance
 * is not proof of inbox delivery; docs/05 explains how to monitor that.
 */
import type { Enquiry } from './validate';
import { labelFor, SERVICE_OPTIONS, PACKAGE_OPTIONS, BUDGET_OPTIONS, TIMEFRAME_OPTIONS } from './options';
import { signHex } from './spam';
import { ownerEmailHtml } from './email-html';

export type DeliveryMode = 'file' | 'resend' | 'cloudflare' | 'webhook' | 'none';

export interface DeliveryConfig {
  mode: DeliveryMode;
  production: boolean;
  toEmail?: string;
  fromEmail?: string;
  acknowledge?: boolean;
  resendKey?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  dataDir?: string;
  /** Cloudflare: true when the Worker has its send_email binding. */
  cloudflareEmail?: boolean;
}

export interface Lead extends Enquiry {
  id: string;
  receivedAt: string;
  source: 'website';
  /** True when the time token was missing (e.g. JavaScript disabled). */
  lowTrust: boolean;
}

export interface DeliveryDeps {
  fetch: typeof fetch;
  appendFile?: (path: string, data: string) => Promise<void>;
  sleep?: (ms: number) => Promise<void>;
  /** Cloudflare Email (send_email binding). Resolves when Cloudflare accepts the message. */
  sendEmail?: (msg: { to: string; subject: string; text: string; html?: string; replyTo?: string; messageId: string }) => Promise<void>;
}

export interface DeliveryResult {
  accepted: boolean;
  channels: string[];
  acknowledgement: 'sent' | 'not-configured' | 'failed';
  failures: string[];
}

/** Is there a working path to record leads in this configuration? */
export function deliveryReady(cfg: DeliveryConfig): { ready: boolean; reason?: string } {
  switch (cfg.mode) {
    case 'file':
      return cfg.production ? { ready: false, reason: 'file storage is for local testing only' } : { ready: true };
    case 'resend':
      if (!cfg.resendKey || !cfg.toEmail || !cfg.fromEmail) return { ready: false, reason: 'RESEND_API_KEY, ENQUIRY_TO_EMAIL and ENQUIRY_FROM_EMAIL are required' };
      return { ready: true };
    case 'cloudflare':
      if (!cfg.cloudflareEmail || !cfg.toEmail || !cfg.fromEmail)
        return { ready: false, reason: 'the send_email binding, ENQUIRY_TO_EMAIL and ENQUIRY_FROM_EMAIL are required' };
      return { ready: true };
    case 'webhook':
      if (!cfg.webhookUrl) return { ready: false, reason: 'ENQUIRY_WEBHOOK_URL is required' };
      return { ready: true };
    default:
      return { ready: false, reason: 'no delivery method configured' };
  }
}

/** Owner email subject: free checks are marked so they can be filtered in the inbox. */
export function ownerSubject(lead: Lead): string {
  const kind = lead.packageId === 'check-up' ? 'Free check request' : 'New enquiry';
  const who = lead.business || (lead.website ? lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : '');
  return `${kind}: ${lead.name}${who ? ` (${who})` : ''}`;
}

export function ownerEmailText(lead: Lead): string {
  const services = lead.services.map((s) => labelFor(SERVICE_OPTIONS, s)).join(', ') || '—';
  const lines = [
    `New enquiry ${lead.id}`,
    `Received: ${lead.receivedAt}`,
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Business: ${lead.business || '—'}`,
    `Website: ${lead.website || '—'}`,
    `Phone: ${lead.phone || '—'}`,
    `Services: ${services}`,
    `Starting point: ${lead.packageId ? labelFor(PACKAGE_OPTIONS, lead.packageId) : '—'}`,
    `Budget: ${lead.budget ? labelFor(BUDGET_OPTIONS, lead.budget) : '—'}`,
    `Timeframe: ${lead.timeframe ? labelFor(TIMEFRAME_OPTIONS, lead.timeframe) : '—'}`,
    '',
    'Message:',
    lead.message || '— (none: a free check needs only the website or business name)',
    '',
    lead.lowTrust ? 'Note: sent without the browser time check (JavaScript off or blocked). Check it looks genuine.' : '',
    'Reply to this email to answer the sender directly.',
  ];
  return lines.join('\n');
}

export function acknowledgementText(lead: Lead): string {
  return [
    `Hi ${lead.name.split(' ')[0]},`,
    '',
    `Thanks for your message${lead.business ? ` about ${lead.business}` : ''}. This is an automatic note to confirm it arrived.`,
    '',
    'I read every enquiry myself and will reply by email, usually with a few questions or a suggested next step.',
    'This is a request for a conversation, not a booked appointment.',
    '',
    'If you need to add anything, just reply to this email.',
    '',
    'Mann Patel',
  ].join('\n');
}

/** The site the banner image and fonts are served from, taken from the sender's domain. */
const assetBase = (cfg: DeliveryConfig) => {
  const domain = (cfg.fromEmail ?? '').replace(/>.*$/, '').split('@').pop()?.trim();
  return domain && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain) ? `https://${domain}` : undefined;
};

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function withRetry(fn: () => Promise<Response>, sleep: (ms: number) => Promise<void>): Promise<Response> {
  let last: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fn();
      if (res.status >= 500 || res.status === 429) {
        last = new Error(`HTTP ${res.status}`);
      } else {
        return res;
      }
    } catch (err) {
      last = err;
    }
    if (attempt === 0) await sleep(400);
  }
  throw last instanceof Error ? last : new Error('request failed');
}

async function sendResend(
  cfg: DeliveryConfig,
  deps: DeliveryDeps,
  payload: { to: string; subject: string; text: string; html?: string; replyTo?: string; idempotencyKey: string },
): Promise<boolean> {
  const res = await withRetry(
    () =>
      deps.fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.resendKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': payload.idempotencyKey,
        },
        body: JSON.stringify({
          from: cfg.fromEmail,
          to: [payload.to],
          subject: payload.subject,
          text: payload.text,
          ...(payload.html ? { html: payload.html } : {}),
          ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      }),
    deps.sleep ?? defaultSleep,
  );
  if (!res.ok) return false;
  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return typeof data.id === 'string' && data.id.length > 0;
}

async function sendWebhook(cfg: DeliveryConfig, deps: DeliveryDeps, lead: Lead): Promise<boolean> {
  const body = JSON.stringify({ type: 'enquiry', lead });
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'X-Enquiry-Id': lead.id };
  if (cfg.webhookSecret) headers['X-Signature'] = `sha256=${await signHex(cfg.webhookSecret, body)}`;
  const res = await withRetry(
    () => deps.fetch(cfg.webhookUrl!, { method: 'POST', headers, body, signal: AbortSignal.timeout(10_000) }),
    deps.sleep ?? defaultSleep,
  );
  return res.ok;
}

export async function deliver(lead: Lead, cfg: DeliveryConfig, deps: DeliveryDeps): Promise<DeliveryResult> {
  const result: DeliveryResult = { accepted: false, channels: [], acknowledgement: 'not-configured', failures: [] };

  if (cfg.mode === 'file') {
    if (cfg.production || !deps.appendFile) {
      result.failures.push('file:not-allowed');
      return result;
    }
    try {
      await deps.appendFile(`${cfg.dataDir ?? '.data'}/enquiries.jsonl`, JSON.stringify(lead) + '\n');
      result.accepted = true;
      result.channels.push('file');
    } catch {
      result.failures.push('file');
    }
    return result;
  }

  if (cfg.mode === 'webhook' || ((cfg.mode === 'resend' || cfg.mode === 'cloudflare') && cfg.webhookUrl)) {
    try {
      if (await sendWebhook(cfg, deps, lead)) result.channels.push('webhook');
      else result.failures.push('webhook');
    } catch {
      result.failures.push('webhook');
    }
  }

  if (cfg.mode === 'resend') {
    try {
      const ok = await sendResend(cfg, deps, {
        to: cfg.toEmail!,
        subject: ownerSubject(lead),
        text: ownerEmailText(lead),
        html: ownerEmailHtml(lead, ownerSubject(lead), { assetBase: assetBase(cfg) }),
        replyTo: lead.email,
        idempotencyKey: `${lead.id}-owner`,
      });
      if (ok) result.channels.push('owner-email');
      else result.failures.push('owner-email');
    } catch {
      result.failures.push('owner-email');
    }
  }

  // Cloudflare Email can only send to verified addresses, so there is no visitor acknowledgement.
  if (cfg.mode === 'cloudflare') {
    const send = deps.sendEmail;
    const message = {
      to: cfg.toEmail ?? '',
      subject: ownerSubject(lead),
      text: ownerEmailText(lead),
      html: ownerEmailHtml(lead, ownerSubject(lead), { assetBase: assetBase(cfg) }),
      replyTo: lead.email,
      messageId: `${lead.id}@${(cfg.fromEmail ?? 'website@localhost').replace(/>.*$/, '').split('@').pop()}`,
    };
    let sent = false;
    for (let attempt = 0; send && message.to && !sent && attempt < 2; attempt++) {
      try {
        await send(message);
        sent = true;
      } catch {
        if (attempt === 0) await (deps.sleep ?? defaultSleep)(400);
      }
    }
    if (sent) result.channels.push('owner-email');
    else result.failures.push('owner-email');
  }

  result.accepted = result.channels.length > 0;

  // Acknowledgement only after the lead is safely recorded, and never blocks success.
  if (result.accepted && cfg.mode === 'resend' && cfg.acknowledge) {
    try {
      const ok = await sendResend(cfg, deps, {
        to: lead.email,
        subject: 'Your message arrived — Mann Patel',
        text: acknowledgementText(lead),
        replyTo: cfg.toEmail,
        idempotencyKey: `${lead.id}-ack`,
      });
      result.acknowledgement = ok ? 'sent' : 'failed';
    } catch {
      result.acknowledgement = 'failed';
    }
  }
  return result;
}
