/**
 * Direct contact channels: email, call, WhatsApp and text.
 *
 * The phone number never lives in this (public) repository. It comes from the build
 * variable PUBLIC_CONTACT_PHONE (Cloudflare → Workers & Pages → mann-patel-website →
 * Settings → Build → Variables and secrets). Pages show it masked ("647-55X-XXXX") and the
 * Call / WhatsApp / Text buttons receive their real links from src/scripts/reach.ts, so the
 * full number is not printed in the HTML. Without a number, the phone buttons are not shown.
 */
import { PUBLIC_CONTACT_PHONE } from 'astro:env/client';
import { profile } from '../data/site';
import { encodePhone, maskPhone, normalizePhone } from './phone';

const digits = normalizePhone(PUBLIC_CONTACT_PHONE);

export const contact = {
  email: profile.contact.email,
  phone: digits ? { key: encodePhone(digits), masked: maskPhone(digits) } : null,
};

export const emailHref = (subject = 'Website enquiry') =>
  contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent(subject)}` : null;
