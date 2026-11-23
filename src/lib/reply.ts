/**
 * Reply-time lines (23 Nov 2026 audit, CONV-2): the one place the sentences are made, so the contact page, the free-check
 * form, the confirmation page, the footer and the home hero say the same thing. Each is null until Mann sets the matching
 * value in src/data/site.ts (profile.contact.replyTime / checkTime), and then nothing is shown.
 */
import { profile } from '../data/site';

const phrase = (v: string | null) => (v && v.trim() ? v.trim().replace(/[.\s]+$/, '') : null);

/** "I reply by email within 1 business day." */
export function replyLine(replyTime: string | null = profile.contact.replyTime): string | null {
  const p = phrase(replyTime);
  return p ? `I reply by email ${p}.` : null;
}

/** "I’ll email your list of fixes within 2 business days." */
export function checkLine(checkTime: string | null = profile.contact.checkTime): string | null {
  const p = phrase(checkTime);
  return p ? `I’ll email your list of fixes ${p}.` : null;
}

/** The hero's microcopy: "One-minute form. Your list of fixes by email within 2 business days." */
export function heroCheckLine(checkTime: string | null = profile.contact.checkTime): string {
  const p = phrase(checkTime);
  return `One-minute form. Your list of fixes by email${p ? ` ${p}` : ''}.`;
}
