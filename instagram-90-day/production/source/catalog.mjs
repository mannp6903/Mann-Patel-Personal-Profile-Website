// Verified offer catalogue. Source of truth: the live site mannpatel.me, checked 11 Nov 2026
// (see strategy/site-and-offer-inventory.md). Every post's `services` list uses these ids.

export const SITE = 'https://mannpatel.me';
export const CHECK_URL = 'https://mannpatel.me/contact/?package=check-up#check';
export const CHECK_URL_SHORT = 'mannpatel.me/contact';
export const EMAIL = 'info@mannpatel.me';
export const CHECKED = '2026-11-11';

export const services = {
  // A · Get found and chosen on Google
  'business-profile': { name: 'Google Business Profile setup and clean-up', group: 'Get found', kind: 'service', src: '/services/#found, /services/local-visibility/' },
  reviews: { name: 'Reviews: asking, replying and review cards', group: 'Get found', kind: 'service', src: '/services/#found' },
  listings: { name: 'Apple Maps, Bing and AI assistant check', group: 'Get found', kind: 'service', src: '/services/#found' },
  'local-plan': { name: 'Monthly “Stay found” plan', group: 'Get found', kind: 'service', src: '/services/#found' },
  // B · Enquiry follow-up and booking
  'missed-calls': { name: 'Missed-call text-back and instant replies', group: 'Answer fast', kind: 'service', src: '/services/#answered' },
  'enquiry-workflows': { name: 'One enquiry list and follow-up', group: 'Answer fast', kind: 'service', src: '/services/#answered' },
  booking: { name: 'Online booking, reminders and deposits', group: 'Answer fast', kind: 'service', src: '/services/#answered' },
  integrations: { name: 'Connecting the tools you already pay for', group: 'Answer fast', kind: 'service', src: '/services/#answered' },
  // C · A website that books work
  websites: { name: 'Website fix-up or new site', group: 'Get booked', kind: 'service', src: '/services/#booked, /services/web-design/' },
  seo: { name: 'Service pages, search basics and measurement', group: 'Get booked', kind: 'service', src: '/services/#booked' },
  maintenance: { name: 'Monthly care plan', group: 'Get booked', kind: 'service', src: '/services/#booked' },
  // + Add-ons
  'print-design': { name: 'Flyers, business cards and gift-card artwork', group: 'Add-ons', kind: 'add-on', src: '/services/#extras' },
  'social-content': { name: 'Social media content: posts, Reels and stories', group: 'Add-ons', kind: 'add-on', src: '/services/#extras' },
  'brand-content': { name: 'Brand & Content Sprint', group: 'Add-ons', kind: 'add-on', src: '/services/#brand-content' },
  // Named inclusions with their own page sections
  'ai-check': { name: 'AI search visibility check (in Local Visibility Setup)', group: 'Get found', kind: 'inclusion', src: '/services/local-visibility/#ai-search' },
  repair: { name: 'A repair, not a rebuild (website repair path)', group: 'Get booked', kind: 'inclusion', src: '/services/web-design/#repair' },
  // Packages
  'pkg-launch': { name: 'Website Launch', group: 'Packages', kind: 'package', src: '/services/#packages, /pricing/' },
  'pkg-enquiry': { name: 'Website + Enquiry System', group: 'Packages', kind: 'package', src: '/services/#packages, /pricing/' },
  'pkg-visibility': { name: 'Local Visibility Setup', group: 'Packages', kind: 'package', src: '/services/#packages, /pricing/' },
  'pkg-care': { name: 'Website Care', group: 'Packages', kind: 'package', src: '/services/#packages, /pricing/' },
  // Lead offer
  'free-check': { name: 'Free website and Google check', group: 'Lead offer', kind: 'lead offer', src: '/contact/?package=check-up#check, home #check' },
};

// Exact limits quoted in public copy (all from the live pages on 11 Nov 2026)
export const facts = {
  launch: 'Website Launch: up to five pages, one enquiry path, your own text and photos, two rounds of revisions.',
  enquiry: 'Website + Enquiry System: everything in Website Launch, plus one booking integration and one defined follow-up workflow.',
  visibility: 'Local Visibility Setup: one eligible Google Business Profile, a short named list of other listings, a review routine and a before-and-after snapshot.',
  care: 'Website Care: a monthly check of your enquiry path and up to 30 minutes of small edits; other providers bill you directly.',
  reminders: 'Booking reminders 48 and 24 hours before each appointment.',
  sprint: 'Brand & Content Sprint: a one-page style and messaging sheet, three captioned post designs, two Reel hooks with scripts you can film on a phone, one round of changes, then every file handed over.',
  check: 'Free website and Google check: I look you up the way a customer would (Google, Maps, Apple Maps and AI assistants); compare your reviews with the top three businesses near you; send a test enquiry and, with your permission, call after hours; you receive a short written list of fixes, most important first. The fixes are quoted separately.',
  price: 'Every paid package: “Written quote after a short brief.” No prices are published.',
  area: 'Serving Toronto and the GTA, with a focus on Scarborough and North York.',
};

// Topics the brief asks the campaign to show or teach (used by the coverage matrix)
export const topics = {
  'mobile-first': 'websites', 'service-area-pages': 'seo', 'cta-actions': 'websites', 'quote-form': 'websites', 'spam-protection': 'websites',
  'fast-loading': 'websites', 'accessibility-check': 'websites', 'phone-booking-links': 'websites', 'domain-email': 'websites', 'launch-tests': 'websites', 'handover': 'websites',
  'titles-descriptions': 'seo', headings: 'seo', 'structured-data': 'seo', sitemap: 'seo', 'search-console': 'seo', 'ga4-events': 'seo', 'speed-measure': 'seo', 'click-vs-booking': 'seo',
  'gbp-eligibility': 'business-profile', 'gbp-setup': 'business-profile', 'gbp-verification': 'business-profile', 'gbp-category-services': 'business-profile', 'holiday-hours': 'business-profile', 'service-area': 'business-profile', 'gbp-photos': 'business-profile', 'gbp-links': 'business-profile', 'visibility-snapshot': 'business-profile',
  'apple-business-connect': 'listings', 'bing-places': 'listings', 'yelp-facebook': 'listings', duplicates: 'listings', 'ai-answers': 'ai-check',
  'review-link': 'reviews', 'qr-review-card': 'reviews', 'review-request-wording': 'reviews', 'staff-routine': 'reviews', 'reply-positive': 'reviews', 'reply-mixed': 'reviews', 'reply-negative': 'reviews',
  'monthly-report': 'local-plan', 'suggested-edits': 'local-plan',
  'text-back': 'missed-calls', 'form-ack': 'missed-calls', 'owner-notification': 'missed-calls', 'whatsapp-business': 'missed-calls', 'human-takeover': 'missed-calls',
  'enquiry-statuses': 'enquiry-workflows', 'reply-reminder': 'enquiry-workflows', 'quote-follow-up': 'enquiry-workflows', 'post-job-review': 'enquiry-workflows', 'casl-consent': 'enquiry-workflows',
  'tool-connections': 'integrations', 'failure-recovery': 'integrations',
  'booking-link': 'booking', 'confirmations-reminders': 'booking', 'deposit-cancellation': 'booking', 'request-vs-confirmed': 'booking',
  'monthly-checks': 'maintenance', 'small-edits': 'maintenance', 'backups-updates': 'maintenance', 'renewal-reminders': 'maintenance', 'change-log': 'maintenance', 'break-found': 'maintenance',
  'print-specs-bleed': 'print-design', 'qr-destinations': 'print-design', 'door-hanger': 'print-design', 'business-card': 'print-design', 'gift-card-artwork': 'print-design', 'flyer': 'print-design', 'editable-digital': 'print-design',
  'content-plan': 'social-content', 'hooks-scripts': 'social-content', 'captions': 'social-content', 'shot-list': 'social-content', 'style-sheet': 'brand-content', 'sprint-extras': 'brand-content',
  ownership: 'pkg-launch', 'scope-choice': 'pkg-launch',
};

export const sourcesUsed = [
  { url: 'https://mannpatel.me/', checked: CHECKED, supports: 'Headline, Found/Answered/Booked process, service areas, free check steps, FAQ (pricing, ownership, rankings, reviews, AI tools, area)' },
  { url: 'https://mannpatel.me/services/', checked: CHECKED, supports: 'All 13 services with deliverables and exclusions; packages comparison; Brand & Content Sprint; add-ons' },
  { url: 'https://mannpatel.me/services/web-design/', checked: CHECKED, supports: 'Website Launch and Website Care, launch checklist, repair-not-rebuild path, FAQs' },
  { url: 'https://mannpatel.me/services/local-visibility/', checked: CHECKED, supports: 'Local Visibility Setup, eligibility, AI search visibility check, sample snapshot, Google sources' },
  { url: 'https://mannpatel.me/services/enquiry-follow-up/', checked: CHECKED, supports: 'Website + Enquiry System, scoped options, sample test log, failure behaviour, request vs booking' },
  { url: 'https://mannpatel.me/pricing/', checked: CHECKED, supports: 'Package boundaries; every price reads “Written quote after a short brief”; page is noindex' },
  { url: 'https://mannpatel.me/work/', checked: CHECKED, supports: 'Two projects and their honest status' },
  { url: 'https://mannpatel.me/work/nest-and-rest-cleaning/', checked: CHECKED, supports: 'Own business; website live; business opens summer 2027; verification table; no results claimed' },
  { url: 'https://mannpatel.me/work/samp-hair-spa/', checked: CHECKED, supports: 'Client website in progress; preview online; stock photos labelled; open accessibility findings; no results claimed' },
  { url: 'https://mannpatel.me/about/', checked: CHECKED, supports: 'Founder story, Nest & Rest, how Mann works' },
  { url: 'https://mannpatel.me/contact/', checked: CHECKED, supports: 'Project brief and free check forms; delivery notice hidden (form connected); info@mannpatel.me; Call/WhatsApp/Text' },
  { url: 'https://nestnrestcleaning.com/', checked: CHECKED, supports: '“Opening soon: not taking bookings yet”; prices from $145; Scarborough and North York; booking is a request Mann confirms' },
  { url: 'https://samp-hair-spa.lovable.app/', checked: CHECKED, supports: 'Preview online; “Illustrative photography.”; request-based booking; 314 Painted Post Dr' },
];
