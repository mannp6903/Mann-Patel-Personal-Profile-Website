/**
 * Direct contact channels: email, call, WhatsApp and text.
 *
 * The number is stored encoded in src/data/site.ts (`profile.contact.phoneKey`, supplied by Mann on
 * 9 Nov 2026), and the build variable PUBLIC_CONTACT_PHONE overrides it if set. Since 14 Nov 2026 (SEO
 * audit, Mann's decision) pages show it in full as a tap-to-call link and the business structured data
 * lists it, so the name, phone and address match Google Business Profile and directory listings.
 * The Call / WhatsApp / Text buttons still receive their links from src/scripts/reach.ts.
 * Without a number, the phone is not shown.
 */
import { PUBLIC_CONTACT_PHONE } from 'astro:env/client';
import { profile } from '../data/site';
import { decodePhone, encodePhone, formatPhone, normalizePhone } from './phone';

const stored = profile.contact.phoneKey ? normalizePhone(decodePhone(profile.contact.phoneKey)) : null;
const digits = normalizePhone(PUBLIC_CONTACT_PHONE) ?? stored;

export const contact = {
  email: profile.contact.email,
  phone: digits
    ? {
        key: encodePhone(digits),
        /** "647-978-6903": shown on the page. */
        display: formatPhone(digits),
        /** "tel:+16479786903" */
        tel: `tel:+${digits}`,
        /** "+1-647-978-6903": structured data, in the format Google's examples use. */
        schema: digits.length === 11 && digits.startsWith('1') ? `+1-${formatPhone(digits)}` : `+${digits}`,
      }
    : null,
};

export const emailHref = (subject = 'Website enquiry') =>
  contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent(subject)}` : null;
