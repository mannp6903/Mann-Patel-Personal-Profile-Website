/**
 * The designed (HTML) version of the owner notification, in the site's "Signal" look: dark stage,
 * one lime accent, an animated signal-line banner (a GIF, the only animation Gmail plays).
 * The plain-text version in delivery.ts is sent alongside it as the fallback.
 *
 * Email clients support CSS unevenly, so the layout uses tables and inline styles. The <style> block
 * only adds extras for clients that read it (web fonts and a pulsing dot in Apple Mail, phone sizes).
 * Every visitor value is escaped.
 */
import type { Lead } from './delivery';
import { labelFor, SERVICE_OPTIONS, PACKAGE_OPTIONS, BUDGET_OPTIONS, TIMEFRAME_OPTIONS } from './options';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Colours from src/styles/tokens.css.
const C = {
  bg: '#0b0b0c',
  card: '#111113',
  surface: '#18181b',
  line: '#2a2a2f',
  control: '#6f6f78',
  text: '#f2f1ec',
  text2: '#b3b2ab',
  text3: '#8d8c86',
  signal: '#d4f84a',
  onSignal: '#0b0b0c',
  warn: '#f5c451',
};
const SANS = "'Signal Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const MONO = "'Geist Mono', ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

/** "Mon, Nov 9, 2026, 3:12 p.m." in Toronto time; falls back to the raw timestamp. */
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
const bareUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

const label = (t: string, color = C.text3) =>
  `<span style="font:500 11px/1.4 ${MONO};letter-spacing:0.12em;text-transform:uppercase;color:${color};">${esc(t)}</span>`;

const link = (href: string, text: string) =>
  `<a href="${esc(href)}" style="color:${C.text};text-decoration:underline;text-decoration-color:${C.control};">${esc(text)}</a>`;

/** A fact tile (Budget, Timeframe…). Inline-block so tiles wrap onto new lines on phones. */
const tile = (name: string, value: string) =>
  `<div class="tile" style="display:inline-block;vertical-align:top;width:168px;margin:0 8px 8px 0;padding:14px 16px;border:1px solid ${C.line};border-radius:14px;background:${C.surface};">${label(
    name,
  )}<div style="margin-top:6px;font:600 16px/1.3 ${SANS};color:${value ? C.text : C.text3};">${value ? esc(value) : 'Not given'}</div></div>`;

const contactRow = (name: string, valueHtml: string) =>
  `<tr><td style="padding:12px 0;border-top:1px solid ${C.line};width:96px;vertical-align:top;">${label(name)}</td><td style="padding:12px 0;border-top:1px solid ${C.line};vertical-align:top;font:15px/1.5 ${SANS};color:${C.text};word-break:break-word;">${valueHtml}</td></tr>`;

const outlineButton = (href: string, text: string) =>
  `<td style="padding:8px 8px 0 0;"><a href="${esc(href)}" style="display:inline-block;padding:12px 18px;border:1px solid ${C.control};border-radius:999px;font:600 14px/1 ${SANS};color:${C.text};text-decoration:none;white-space:nowrap;">${esc(text)}</a></td>`;

export interface OwnerEmailOptions {
  /** Where the banner image is served from, e.g. "https://mannpatel.me". */
  assetBase?: string;
}

export function ownerEmailHtml(lead: Lead, subject: string, opts: OwnerEmailOptions = {}): string {
  const assetBase = (opts.assetBase ?? 'https://mannpatel.me').replace(/\/$/, '');
  const freeCheck = lead.packageId === 'check-up';
  const kind = freeCheck ? 'Free check request' : 'New enquiry';
  const first = lead.name.split(' ')[0] || lead.name;
  const website = safeUrl(lead.website);
  const tel = lead.phone ? telHref(lead.phone) : '';
  const replyHref = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
  const services = lead.services.map((s) => labelFor(SERVICE_OPTIONS, s));
  const sub = lead.business || (website ? bareUrl(website) : '');

  const servicesHtml = services.length
    ? services
        .map(
          (s) =>
            `<span style="display:inline-block;margin:0 6px 8px 0;padding:6px 12px;border:1px solid ${C.line};border-radius:999px;background:${C.surface};font:500 13px/1.3 ${SANS};color:${C.text};">${esc(
              s,
            )}</span>`,
        )
        .join('')
    : `<span style="font:15px/1.5 ${SANS};color:${C.text3};">None picked</span>`;

  const message = lead.message
    ? `<div style="font:400 18px/1.6 ${SANS};color:${C.text};">${esc(lead.message).replace(/\r?\n/g, '<br>')}</div>`
    : `<div style="font:16px/1.6 ${SANS};color:${C.text3};">No message. A free check only needs the website or business name.</div>`;

  const warning = lead.lowTrust
    ? `<tr><td class="px" style="padding:0 36px 24px;"><div style="padding:14px 16px;border:1px solid ${C.warn};border-radius:14px;font:14px/1.5 ${SANS};color:${C.text};"><strong style="color:${C.warn};">Check this one looks genuine.</strong> It was sent without the browser time check (JavaScript off or blocked).</div></td></tr>`
    : '';

  const secondary = [tel ? outlineButton(tel, `Call ${first}`) : '', website ? outlineButton(website, 'Open their website') : ''].join('');

  const preheader = `${lead.name}${lead.business ? `, ${lead.business}` : ''}: ${lead.message.slice(0, 90) || kind}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<title>${esc(subject)}</title>
<style>
@font-face{font-family:'Signal Sans';font-weight:200 900;src:url('${assetBase}/fonts/signal-sans-wdth-wght.woff2') format('woff2');}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url('${assetBase}/fonts/instrument-serif-italic.sub.woff2') format('woff2');}
@font-face{font-family:'Geist Mono';font-weight:100 900;src:url('${assetBase}/fonts/geist-mono-wght.sub.woff2') format('woff2');}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
.dot{animation:pulse 1.6s ease-in-out infinite}
@media (max-width:520px){.px{padding-left:22px!important;padding-right:22px!important}.name{font-size:34px!important}.tile{width:100%!important;box-sizing:border-box;margin-right:0!important}}
</style></head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};"><tr><td align="center" style="padding:20px 10px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.card};border:1px solid ${C.line};border-radius:22px;overflow:hidden;">

<tr><td style="padding:0;line-height:0;"><img src="${assetBase}/email/signal.gif" width="600" height="100" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>

<tr><td class="px" style="padding:4px 36px 0;">
<p style="margin:0 0 14px;"><span class="dot" style="color:${C.signal};font-size:12px;">&#9679;</span>&nbsp; ${label(kind, C.signal)}</p>
<h1 class="name" style="margin:0;font:800 42px/1.02 ${SANS};letter-spacing:-0.035em;color:${C.text};">${esc(lead.name)}</h1>
${sub ? `<p style="margin:6px 0 0;font:italic 400 26px/1.2 ${SERIF};color:${C.text2};">${esc(sub)}</p>` : ''}
</td></tr>

<tr><td class="px" style="padding:28px 36px 28px;">
<a href="${esc(replyHref)}" style="display:block;padding:17px 22px;border-radius:999px;background:${C.signal};font:700 16px/1 ${SANS};color:${C.onSignal};text-decoration:none;text-align:center;">Reply to ${esc(first)} &rarr;</a>
${secondary ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr>${secondary}</tr></table>` : ''}
</td></tr>

${warning}

<tr><td class="px" style="padding:0 36px 28px;">
<div style="padding:24px 24px 22px;border:1px solid ${C.line};border-radius:18px;background:${C.bg};">
<div style="margin:0 0 4px;font:italic 400 54px/0.6 ${SERIF};color:${C.signal};">&ldquo;</div>
${message}
</div>
</td></tr>

<tr><td class="px" style="padding:0 36px 20px;">
${tile('Budget', lead.budget ? labelFor(BUDGET_OPTIONS, lead.budget) : '')}${tile('Timeframe', lead.timeframe ? labelFor(TIMEFRAME_OPTIONS, lead.timeframe) : '')}${tile(
    'Starting point',
    lead.packageId ? labelFor(PACKAGE_OPTIONS, lead.packageId) : '',
  )}
</td></tr>

<tr><td class="px" style="padding:0 36px 24px;">
<p style="margin:0 0 10px;">${label('What they need')}</p>
${servicesHtml}
</td></tr>

<tr><td class="px" style="padding:0 36px 8px;">
<p style="margin:0 0 6px;">${label('Contact')}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${contactRow('Email', link(`mailto:${lead.email}`, lead.email))}
${contactRow('Phone', lead.phone ? (tel ? link(tel, lead.phone) : esc(lead.phone)) : `<span style="color:${C.text3};">Not given</span>`)}
${contactRow('Business', lead.business ? esc(lead.business) : `<span style="color:${C.text3};">Not given</span>`)}
${contactRow('Website', website ? link(website, bareUrl(website)) : lead.website ? esc(lead.website) : `<span style="color:${C.text3};">Not given</span>`)}
</table>
</td></tr>

<tr><td class="px" style="padding:20px 36px 30px;">
<p style="margin:0;padding-top:18px;border-top:1px solid ${C.line};font:12px/1.7 ${MONO};color:${C.text3};">REF ${esc(lead.id)}<br>${esc(formatReceived(lead.receivedAt))} &middot; Toronto</p>
</td></tr>

</table>
<p style="margin:18px 0 0;font:12px/1.5 ${MONO};letter-spacing:0.04em;color:${C.text3};">mannpatel.me &middot; contact form</p>
</td></tr></table>
</body></html>`;
}
