/**
 * Form options shared by the browser and the server.
 * Service ids must match src/data/services.ts (a unit test checks this).
 */

export const SERVICE_OPTIONS = [
  { id: 'websites', label: 'Website or landing page', group: 'A' },
  { id: 'seo', label: 'SEO review and fixes', group: 'A' },
  { id: 'search-console', label: 'Google Search Console', group: 'A' },
  { id: 'analytics', label: 'Google Analytics 4', group: 'A' },
  { id: 'business-profile', label: 'Google Business Profile', group: 'A' },
  { id: 'business-email', label: 'Professional email', group: 'B' },
  { id: 'enquiry-workflows', label: 'Enquiry follow-up', group: 'B' },
  { id: 'integrations', label: 'Connecting my tools', group: 'B' },
  { id: 'maintenance', label: 'Ongoing support', group: 'B' },
  { id: 'social-strategy', label: 'Social content plan', group: 'C' },
  { id: 'social-materials', label: 'Social posts and WhatsApp materials', group: 'C' },
  { id: 'identity', label: 'Logo and identity', group: 'C' },
  { id: 'print-digital', label: 'Cards, flyers, gift-card artwork', group: 'C' },
  { id: 'not-sure', label: 'Not sure yet', group: 'other' },
  { id: 'other', label: 'Something else', group: 'other' },
] as const;

export const PACKAGE_OPTIONS = [
  { id: 'launch', label: 'Business Launch' },
  { id: 'visibility', label: 'Website & Visibility' },
  { id: 'content-follow-up', label: 'Content & Follow-up' },
  { id: 'check-up', label: 'Website & enquiry check-up' },
] as const;

export const BUDGET_OPTIONS = [
  { id: 'under-1000', label: 'Under $1,000' },
  { id: '1000-2500', label: '$1,000 – $2,500' },
  { id: '2500-5000', label: '$2,500 – $5,000' },
  { id: 'over-5000', label: 'Over $5,000' },
  { id: 'not-sure', label: 'Not sure yet' },
] as const;

export const TIMEFRAME_OPTIONS = [
  { id: 'asap', label: 'As soon as possible' },
  { id: '1-3-months', label: 'In the next 1–3 months' },
  { id: 'later', label: 'Later than 3 months' },
  { id: 'flexible', label: 'Flexible' },
] as const;

export const SERVICE_IDS: readonly string[] = SERVICE_OPTIONS.map((o) => o.id);
export const PACKAGE_IDS: readonly string[] = PACKAGE_OPTIONS.map((o) => o.id);
export const BUDGET_IDS: readonly string[] = BUDGET_OPTIONS.map((o) => o.id);
export const TIMEFRAME_IDS: readonly string[] = TIMEFRAME_OPTIONS.map((o) => o.id);

export const labelFor = (list: readonly { id: string; label: string }[], id?: string) =>
  list.find((o) => o.id === id)?.label ?? id ?? '';
