/**
 * Form options shared by the browser and the server.
 * Service ids must match src/data/services.ts (a unit test checks this).
 */

export const SERVICE_OPTIONS = [
  // Plain-language areas shown first on the form; the specific services below are optional detail.
  { id: 'area-found', label: 'Get found and chosen: Google, Maps and reviews', group: 'area', area: 'A' },
  { id: 'area-follow-up', label: 'Enquiry follow-up and booking: replies, reminders and one list', group: 'area', area: 'B' },
  { id: 'area-website', label: 'A website that books work', group: 'area', area: 'C' },
  { id: 'area-content', label: 'Print and social content', group: 'area', area: 'D' },
  { id: 'business-profile', label: 'Google Business Profile', group: 'A' },
  { id: 'reviews', label: 'Reviews and review cards', group: 'A' },
  { id: 'listings', label: 'Apple Maps, Bing and AI check', group: 'A' },
  { id: 'local-plan', label: 'Monthly “Stay found” plan', group: 'A' },
  { id: 'missed-calls', label: 'Missed-call text-back', group: 'B' },
  { id: 'enquiry-workflows', label: 'Enquiry list and follow-up', group: 'B' },
  { id: 'booking', label: 'Online booking and reminders', group: 'B' },
  { id: 'integrations', label: 'Connecting my tools', group: 'B' },
  { id: 'websites', label: 'Website fix-up or new site', group: 'C' },
  { id: 'seo', label: 'Service pages and search basics', group: 'C' },
  { id: 'maintenance', label: 'Monthly care plan', group: 'C' },
  { id: 'print-design', label: 'Flyers, business cards, gift-card artwork', group: 'D' },
  { id: 'social-content', label: 'Posts, Reels, stories, hooks and scripts', group: 'D' },
  { id: 'not-sure', label: 'Not sure yet', group: 'other' },
  { id: 'other', label: 'Something else', group: 'other' },
] as const;

/** Must match src/data/packages.ts (a unit test checks). Old ids are mapped in packages.ts. */
export const PACKAGE_OPTIONS = [
  { id: 'website-fix', label: 'Website Fix' },
  { id: 'website-launch', label: 'Website Launch' },
  { id: 'website-enquiry', label: 'Website + Enquiry System' },
  { id: 'local-visibility', label: 'Local Visibility Setup' },
  { id: 'care', label: 'Website Care' },
  { id: 'check-up', label: 'Free website and Google check' },
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
