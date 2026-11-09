/**
 * Direct contact channels: email, call, WhatsApp and text.
 *
 * The number is never written in plain text, here or in the HTML: it is stored encoded in
 * src/data/site.ts (`profile.contact.phoneKey`, supplied by Mann on 9 Nov 2026), and the build
 * variable PUBLIC_CONTACT_PHONE overrides it if set. Pages show it masked ("647-97X-XXXX") and the
 * Call / WhatsApp / Text buttons receive their real links from src/scripts/reach.ts.
 * Without a number, the phone buttons are not shown.
 */
import { PUBLIC_CONTACT_PHONE } from 'astro:env/client';
import { profile } from '../data/site';
import { decodePhone, encodePhone, maskPhone, normalizePhone } from './phone';

const stored = profile.contact.phoneKey ? normalizePhone(decodePhone(profile.contact.phoneKey)) : null;
const digits = normalizePhone(PUBLIC_CONTACT_PHONE) ?? stored;

export const contact = {
  email: profile.contact.email,
  phone: digits ? { key: encodePhone(digits), masked: maskPhone(digits) } : null,
};

export const emailHref = (subject = 'Website enquiry') =>
  contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent(subject)}` : null;
