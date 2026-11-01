import { describe, it, expect, vi } from 'vitest';
import { buildMime, addressOf, encodeHeader } from '../../src/lib/enquiry/mime';
import { deliver, deliveryReady, type Lead } from '../../src/lib/enquiry/delivery';
import { normalizePhone, maskPhone, encodePhone, decodePhone, channelHref } from '../../src/lib/phone';

const lead: Lead = {
  id: 'enq_cf_1', receivedAt: '2026-11-01T12:00:00.000Z', source: 'website', lowTrust: false,
  name: 'Zoë Owner', email: 'zoe@example.ca', business: 'Café Test', website: '', phone: '416 555 0100',
  services: ['websites'], packageId: '', budget: '', timeframe: '', message: 'We need a website with our hours.',
};

const decodeBody = (mime: string) => {
  const body = mime.split('\r\n\r\n')[1].replace(/\r\n/g, '');
  return new TextDecoder().decode(Uint8Array.from(atob(body), (c) => c.charCodeAt(0)));
};

describe('buildMime', () => {
  const mime = buildMime({
    from: 'Mann Patel website <website@mannpatel.me>',
    to: 'owner@example.ca',
    replyTo: 'zoe@example.ca',
    subject: 'New enquiry: Zoë Owner (Café Test)',
    text: 'Line one\nLigne deux: é',
    messageId: 'enq_cf_1@mannpatel.me',
    date: new Date(Date.UTC(2026, 10, 1, 12, 0, 0)),
  });

  it('writes CRLF headers with an encoded UTF-8 subject and a Reply-To', () => {
    const [head] = mime.split('\r\n\r\n');
    expect(head).toContain('From: Mann Patel website <website@mannpatel.me>');
    expect(head).toContain('To: owner@example.ca');
    expect(head).toContain('Reply-To: zoe@example.ca');
    expect(head).toContain('Message-ID: <enq_cf_1@mannpatel.me>');
    expect(head).toContain('Date: Sun, 01 Nov 2026 12:00:00 +0000');
    expect(head).toMatch(/Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=/);
    expect(head).not.toMatch(/[^\r]\n/);
  });

  it('round-trips a UTF-8 body as base64', () => {
    expect(decodeBody(mime)).toBe('Line one\r\nLigne deux: é');
  });

  it('blocks header injection through the subject', () => {
    const evil = buildMime({ from: 'a@b.ca', to: 'c@d.ca', subject: 'Hi\r\nBcc: x@y.z', text: 'x', messageId: 'm@b.ca' });
    expect(evil).not.toMatch(/\r\nBcc:/);
  });

  it('helpers: addressOf and encodeHeader', () => {
    expect(addressOf('Mann <website@mannpatel.me>')).toBe('website@mannpatel.me');
    expect(addressOf('plain@mannpatel.me')).toBe('plain@mannpatel.me');
    expect(encodeHeader('Plain ASCII')).toBe('Plain ASCII');
  });
});

describe('Cloudflare Email delivery', () => {
  const cfg = { mode: 'cloudflare' as const, production: true, toEmail: 'owner@example.ca', fromEmail: 'Mann <website@mannpatel.me>', cloudflareEmail: true };

  it('is ready only with the binding and both addresses', () => {
    expect(deliveryReady(cfg).ready).toBe(true);
    expect(deliveryReady({ ...cfg, cloudflareEmail: false }).ready).toBe(false);
    expect(deliveryReady({ ...cfg, toEmail: undefined }).ready).toBe(false);
  });

  it('emails the owner the full brief, with Reply-To set to the visitor', async () => {
    const sendEmail = vi.fn(async () => {});
    const res = await deliver(lead, cfg, { fetch: vi.fn() as unknown as typeof fetch, sendEmail, sleep: async () => {} });
    expect(res).toMatchObject({ accepted: true, channels: ['owner-email'], acknowledgement: 'not-configured' });
    const msg = (sendEmail.mock.calls[0] as unknown[])[0] as { to: string; replyTo: string; subject: string; text: string; messageId: string };
    expect(msg).toMatchObject({ to: 'owner@example.ca', replyTo: 'zoe@example.ca', subject: 'New enquiry: Zoë Owner (Café Test)', messageId: 'enq_cf_1@mannpatel.me' });
    expect(msg.text).toContain('Phone: 416 555 0100');
    expect(msg.text).toContain('We need a website with our hours.');
  });

  it('retries once, then reports failure honestly', async () => {
    let n = 0;
    const flaky = vi.fn(async () => {
      if (++n === 1) throw new Error('temporary');
    });
    expect((await deliver(lead, cfg, { fetch: vi.fn() as unknown as typeof fetch, sendEmail: flaky, sleep: async () => {} })).accepted).toBe(true);
    const down = vi.fn(async () => {
      throw new Error('down');
    });
    const res = await deliver(lead, cfg, { fetch: vi.fn() as unknown as typeof fetch, sendEmail: down, sleep: async () => {} });
    expect(res).toMatchObject({ accepted: false, failures: ['owner-email'] });
    expect(down).toHaveBeenCalledTimes(2);
  });
});

describe('phone helpers', () => {
  it('normalises Canadian numbers and masks them for display', () => {
    expect(normalizePhone('647-555-0142')).toBe('16475550142');
    expect(normalizePhone('+1 (647) 555 0142')).toBe('16475550142');
    expect(normalizePhone('12345')).toBeNull();
    expect(normalizePhone(undefined)).toBeNull();
    expect(maskPhone('16475550142')).toBe('647-55X-XXXX');
  });

  it('encodes the number out of plain sight and builds call, text and WhatsApp links', () => {
    const key = encodePhone('16475550142');
    expect(key).not.toContain('6475550142');
    expect(decodePhone(key)).toBe('16475550142');
    expect(channelHref('call', '16475550142')).toBe('tel:+16475550142');
    expect(channelHref('text', '16475550142')).toMatch(/^sms:\+16475550142\?&body=Hi%20Mann/);
    expect(channelHref('whatsapp', '16475550142')).toMatch(/^https:\/\/wa\.me\/16475550142\?text=Hi%20Mann/);
  });
});
