/**
 * Builds an email (RFC 5322) for Cloudflare's send_email binding: plain text, or
 * multipart/alternative (plain text + HTML) when `html` is given.
 * UTF-8 throughout: the subject is RFC 2047-encoded and each body part is base64.
 */

export interface MimeInput {
  from: string; // "Name <addr@domain>" or "addr@domain"
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  /** Optional designed version; the plain text stays as the fallback part. */
  html?: string;
  messageId: string; // without angle brackets, e.g. "enq_20261101_ab12cd34@mannpatel.me"
  date?: Date;
}

const toBase64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

/** Header-safe value: no line breaks (blocks header injection). */
const clean = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

/** RFC 2047 encoded-word for non-ASCII header text. */
export const encodeHeader = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${toBase64(s)}?=`);

/** The bare address from "Name <addr@domain>". */
export const addressOf = (s: string) => (s.match(/<([^>]+)>/)?.[1] ?? s).trim();

/** "Name <addr>" with the display name encoded when needed. */
const mailbox = (s: string) => {
  const m = clean(s).match(/^(.*)<([^>]+)>$/);
  if (!m) return clean(s);
  const name = m[1].trim().replace(/^"|"$/g, '');
  return name ? `${encodeHeader(name)} <${m[2].trim()}>` : `<${m[2].trim()}>`;
};

const b64Lines = (s: string) => (toBase64(s.replace(/\r?\n/g, '\r\n')).match(/.{1,76}/g) ?? ['']).join('\r\n');

export function buildMime(input: MimeInput): string {
  const body = b64Lines(input.text);
  const headers = [
    `From: ${mailbox(input.from)}`,
    `To: ${mailbox(input.to)}`,
    ...(input.replyTo ? [`Reply-To: ${mailbox(input.replyTo)}`] : []),
    `Subject: ${encodeHeader(clean(input.subject))}`,
    `Message-ID: <${clean(input.messageId)}>`,
    `Date: ${(input.date ?? new Date()).toUTCString().replace('GMT', '+0000')}`,
    'MIME-Version: 1.0',
  ];
  if (!input.html) {
    headers.push('Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64');
    return `${headers.join('\r\n')}\r\n\r\n${body}\r\n`;
  }
  // Base64 bodies never contain "=_", so this boundary can't clash with the content.
  const boundary = `=_alt_${clean(input.messageId).replace(/[^A-Za-z0-9]/g, '')}`;
  headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
  const part = (type: string, content: string) =>
    `--${boundary}\r\nContent-Type: ${type}; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${content}\r\n`;
  return `${headers.join('\r\n')}\r\n\r\n${part('text/plain', body)}${part('text/html', b64Lines(input.html))}--${boundary}--\r\n`;
}
