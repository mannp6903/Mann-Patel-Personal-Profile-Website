/**
 * Enquiry validation — the same rules run in the browser and on the server.
 * Keep messages plain and specific; they are shown next to the field.
 */
import { SERVICE_IDS, PACKAGE_IDS, BUDGET_IDS, TIMEFRAME_IDS } from './options';

export const LIMITS = {
  name: 100,
  email: 254,
  business: 120,
  website: 200,
  phone: 30,
  messageMin: 20,
  message: 3000,
  services: 20,
} as const;

export interface Enquiry {
  name: string;
  email: string;
  business: string;
  website: string;
  phone: string;
  services: string[];
  packageId: string;
  budget: string;
  timeframe: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;
export type ValidationResult = { ok: true; value: Enquiry } | { ok: false; errors: FieldErrors };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\-.\s\d]{7,30}$/;

const str = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? String(v[0] ?? '') : v == null ? '' : String(v));
const clean = (v: unknown) => str(v).replace(/\s+/g, ' ').trim();
const cleanMultiline = (v: unknown) =>
  str(v)
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export function normaliseWebsite(raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProtocol);
    if (!u.hostname.includes('.')) return '';
    return u.toString();
  } catch {
    return '';
  }
}

export function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v) return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/** The free check only needs something to check (a website, or a business name) and a way to reply. */
export const CHECK_PACKAGE = 'check-up';

export function validateEnquiry(raw: Record<string, unknown>): ValidationResult {
  const errors: FieldErrors = {};
  const isCheck = clean(raw.packageId) === CHECK_PACKAGE;

  const name = clean(raw.name);
  if (!name) errors.name = 'Please tell me your name.';
  else if (name.length > LIMITS.name) errors.name = `Please keep your name under ${LIMITS.name} characters.`;

  const email = clean(raw.email).toLowerCase();
  if (!email) errors.email = 'Please add an email address so I can reply.';
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = 'That email address doesn’t look complete. Please check it.';

  const business = clean(raw.business);
  if (business.length > LIMITS.business) errors.business = `Please keep this under ${LIMITS.business} characters.`;

  const websiteRaw = clean(raw.website);
  let website = '';
  if (websiteRaw) {
    website = normaliseWebsite(websiteRaw);
    if (!website || websiteRaw.length > LIMITS.website) errors.website = 'That website address doesn’t look right. Try something like yourbusiness.ca.';
  }

  const phone = clean(raw.phone);
  if (phone && !PHONE.test(phone)) errors.phone = 'Please use digits, spaces, brackets, + or - only.';

  const services = [...new Set(toList(raw.services))];
  if (services.length > LIMITS.services || services.some((s) => !SERVICE_IDS.includes(s))) {
    errors.services = 'Please choose from the listed options.';
  }

  const packageId = clean(raw.packageId);
  if (packageId && !PACKAGE_IDS.includes(packageId)) errors.packageId = 'Unknown starting point.';

  const budget = clean(raw.budget);
  if (budget && !BUDGET_IDS.includes(budget)) errors.budget = 'Please choose from the list.';

  const timeframe = clean(raw.timeframe);
  if (timeframe && !TIMEFRAME_IDS.includes(timeframe)) errors.timeframe = 'Please choose from the list.';

  const message = cleanMultiline(raw.message);
  if (isCheck) {
    // A short note is welcome but optional for the free check.
    if (message.length > LIMITS.message) errors.message = `Please keep this under ${LIMITS.message} characters.`;
    if (!website && !business && !errors.website && !errors.business)
      errors.website = 'Add your website, or your business name if you don’t have a site yet.';
  } else if (!message) errors.message = 'Please tell me a little about your business and what you need.';
  else if (message.length < LIMITS.messageMin) errors.message = `A little more detail helps. At least ${LIMITS.messageMin} characters, please.`;
  else if (message.length > LIMITS.message) errors.message = `Please keep this under ${LIMITS.message} characters.`;

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { name, email, business, website, phone, services, packageId, budget, timeframe, message },
  };
}
