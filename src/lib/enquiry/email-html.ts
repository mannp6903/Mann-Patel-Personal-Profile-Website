/**
 * The designed (HTML) version of the owner notification. The plain-text version in delivery.ts
 * is sent alongside it as the fallback. Email clients ignore <style> blocks and web fonts unevenly,
 * so this uses tables, inline styles and system fonts only. Every visitor value is escaped.
 */
import type { Lead } from './delivery';
import { labelFor, SERVICE_OPTIONS, PACKAGE_OPTIONS, BUDGET_OPTIONS, TIMEFRAME_OPTIONS } from './options';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const C = {
  page: '#f2f1ec',
  card: '#ffffff',
  ink: '#0b0b0c',
  text: '#2a2a2f',
  muted: '#6f6f78',
  line: '#e4e3dd',
  signal: '#d4f84a',
  warnBg: '#fdf3d9',
  warnLine: '#f5c451',
};
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

/** "Mon 9 Nov 2026, 3:12 pm" in Toronto time; falls back to the raw timestamp. */
export function formatReceived(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const safeUrl = (u: string) => (/^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : '');
const telHref = (p: string) => {
  const digits = p.replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 7 ? `tel:${digits}` : '';
};

const link = (href: string, label: string) =>
  `<a href="${esc(href)}" style="color:${C.ink};text-decoration:underline;">${esc(label)}</a>`;

const button = (href: string, label: string, primary: boolean) =>
  `<td style="padding:0 8px 8px 0;"><a href="${esc(href)}" style="display:inline-block;padding:11px 16px;border-radius:999px;white-space:nowrap;font:600 14px/1 ${SANS};text-decoration:none;${
    primary ? `background:${C.signal};color:${C.ink};` : `background:${C.card};color:${C.ink};border:1px solid ${C.ink};`
  }">${esc(label)}</a></td>`;

const row = (label: string, valueHtml: string) =>
  `<tr><td style="padding:10px 0;border-top:1px solid ${C.line};width:130px;vertical-align:top;font:600 12px/1.4 ${SANS};letter-spacing:0.06em;text-transform:uppercase;color:${C.muted};">${esc(
    label,
  )}</td><td style="padding:10px 0;border-top:1px solid ${C.line};vertical-align:top;font:15px/1.5 ${SANS};color:${C.text};">${valueHtml}</td></tr>`;

const DASH = `<span style="color:${C.muted};">—</span>`;

export function ownerEmailHtml(lead: Lead, subject: string): string {
  const freeCheck = lead.packageId === 'check-up';
  const kind = freeCheck ? 'Free check request' : 'New enquiry';
  const website = safeUrl(lead.website);
  const tel = lead.phone ? telHref(lead.phone) : '';
  const replyHref = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
  const services = lead.services.map((s) => labelFor(SERVICE_OPTIONS, s));

  const buttons = [
    button(replyHref, `Reply to ${lead.name.split(' ')[0]}`, true),
    tel ? button(tel, 'Call', false) : '',
    website ? button(website, 'Open website', false) : '',
  ].join('');

  const servicesHtml = services.length
    ? services
        .map(
          (s) =>
            `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:${C.page};border:1px solid ${C.line};font:13px/1.4 ${SANS};color:${C.ink};">${esc(
              s,
            )}</span>`,
        )
        .join('')
    : DASH;

  const contactRows = [
    row('Email', link(`mailto:${lead.email}`, lead.email)),
    row('Phone', lead.phone ? (tel ? link(tel, lead.phone) : esc(lead.phone)) : DASH),
    row('Business', lead.business ? esc(lead.business) : DASH),
    row('Website', website ? link(website, website.replace(/^https?:\/\//, '').replace(/\/$/, '')) : lead.website ? esc(lead.website) : DASH),
  ].join('');

  const projectRows = [
    row('Services', servicesHtml),
    row('Starting point', lead.packageId ? esc(labelFor(PACKAGE_OPTIONS, lead.packageId)) : DASH),
    row('Budget', lead.budget ? esc(labelFor(BUDGET_OPTIONS, lead.budget)) : DASH),
    row('Timeframe', lead.timeframe ? esc(labelFor(TIMEFRAME_OPTIONS, lead.timeframe)) : DASH),
  ].join('');

  const message = lead.message
    ? esc(lead.message).replace(/\r?\n/g, '<br>')
    : `<span style="color:${C.muted};">No message. A free check only needs the website or business name.</span>`;

  const heading = (t: string) =>
    `<p style="margin:28px 0 4px;font:600 12px/1.4 ${SANS};letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">${esc(t)}</p>`;

  const warning = lead.lowTrust
    ? `<tr><td style="padding:0 32px 8px;"><div style="padding:12px 14px;border-radius:10px;background:${C.warnBg};border:1px solid ${C.warnLine};font:14px/1.5 ${SANS};color:${C.text};"><strong>Check this one looks genuine.</strong> It was sent without the browser time check (JavaScript off or blocked).</div></td></tr>`
    : '';

  const preheader = `${lead.name}${lead.business ? `, ${lead.business}` : ''}: ${lead.message.slice(0, 90) || kind}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.line};">
<tr><td style="background:${C.ink};padding:24px 32px;">
<p style="margin:0 0 10px;"><span style="display:inline-block;padding:5px 10px;border-radius:999px;background:${C.signal};font:700 11px/1 ${SANS};letter-spacing:0.08em;text-transform:uppercase;color:${C.ink};">${esc(kind)}</span></p>
<h1 style="margin:0;font:700 26px/1.2 ${SANS};letter-spacing:-0.02em;color:#f2f1ec;">${esc(lead.name)}</h1>
${lead.business ? `<p style="margin:4px 0 0;font:16px/1.4 ${SANS};color:#b3b2ab;">${esc(lead.business)}</p>` : ''}
</td></tr>
<tr><td style="padding:24px 32px 0;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>${buttons}</tr></table></td></tr>
${warning}
<tr><td style="padding:0 32px;">
${heading('Message')}
<div style="margin-top:8px;padding:16px 18px;border-left:3px solid ${C.signal};background:${C.page};border-radius:0 10px 10px 0;font:16px/1.6 ${SANS};color:${C.ink};">${message}</div>
${heading('Contact')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${contactRows}</table>
${heading('Project')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${projectRows}</table>
</td></tr>
<tr><td style="padding:28px 32px 28px;">
<p style="margin:0;padding-top:16px;border-top:1px solid ${C.line};font:12px/1.6 ${MONO};color:${C.muted};">Ref ${esc(lead.id)} · ${esc(formatReceived(lead.receivedAt))} (Toronto)<br>Press Reply to answer ${esc(lead.email)} directly.</p>
</td></tr>
</table>
<p style="margin:16px 0 0;font:12px/1.5 ${SANS};color:${C.muted};">Sent by the contact form on mannpatel.me</p>
</td></tr></table>
</body></html>`;
}
