/**
 * Fills in the Call / WhatsApp / Text links ([data-reach]) from their encoded number and
 * records contact clicks (method only, never contents) when analytics is allowed.
 * Without JavaScript the links point to the contact page.
 */
import { channelHref, decodePhone, type Channel } from '../lib/phone';
import { track } from './analytics';

document.querySelectorAll<HTMLAnchorElement>('a[data-reach][data-k]').forEach((a) => {
  try {
    a.href = channelHref(a.dataset.reach as Channel, decodePhone(a.dataset.k!));
  } catch {
    /* leave the contact-page fallback */
  }
});

document.addEventListener('click', (e) => {
  const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-contact]');
  if (a) track('contact_click', { method: a.dataset.contact ?? 'unknown' });
});

export {};
