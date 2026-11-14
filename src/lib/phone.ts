/**
 * Phone helpers with no imports, so the browser script can use them too.
 * See src/lib/contact.ts for how the number is stored and shown (in full since 14 Nov 2026).
 */

/** "+1 (647) 555-0142" → "16475550142"; a 10-digit Canadian/US number gets the leading 1. */
export function normalizePhone(raw: string | undefined | null): string | null {
  const text = (raw ?? '').trim();
  const digits = text.replace(/\D/g, '');
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return digits;
  if (text.startsWith('+') && digits.length >= 8 && digits.length <= 15) return digits;
  return null;
}

/** "16475550142" → "647-55X-XXXX" for North American numbers. */
export function maskPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith('1')) {
    const n = digits.slice(1);
    return `${n.slice(0, 3)}-${n.slice(3, 5)}X-XXXX`;
  }
  return `+${digits.slice(0, 3)}… XXXX`;
}

/** "16475550142" → "647-555-0142" (shown only when a visitor asks for the full number). */
export function formatPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith('1')) return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  return `+${digits}`;
}

/** Reversed digits in base64: keeps the number away from simple scrapers. */
export const encodePhone = (digits: string) => btoa(digits.split('').reverse().join(''));
export const decodePhone = (key: string) => atob(key).split('').reverse().join('');

export const GREETING = 'Hi Mann, I found your website and I’d like to ask about ';

export type Channel = 'call' | 'text' | 'whatsapp';

export function channelHref(channel: Channel, digits: string): string {
  switch (channel) {
    case 'call':
      return `tel:+${digits}`;
    case 'text':
      // "?&body=" is understood by both iOS and Android messaging apps.
      return `sms:+${digits}?&body=${encodeURIComponent(GREETING)}`;
    case 'whatsapp':
      return `https://wa.me/${digits}?text=${encodeURIComponent(GREETING)}`;
  }
}
