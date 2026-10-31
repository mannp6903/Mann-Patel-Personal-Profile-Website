/**
 * Draft packages — public wording only. Prices, hour estimates and margins
 * live in the private pricing worksheet (not in this public repository).
 * Publicly every package says "Request a quote" until Mann confirms pricing.
 */

export interface Package {
  id: 'launch' | 'visibility' | 'content-follow-up' | 'check-up';
  name: string;
  forWho: string;
  includes: string[];
  notIncluded: string[];
  youProvide: string[];
  serviceIds: string[];
  featured?: boolean;
}

export const packages: Package[] = [
  {
    id: 'launch',
    name: 'Business Launch',
    forWho: 'New businesses, or owners starting their online presence from scratch.',
    includes: [
      'A website of up to five pages, or one landing page, with an enquiry form',
      'Enquiry acknowledgement to the customer and a notification to you',
      'Domain connected and professional email set up (provider billed to you)',
      'Google Search Console verified with your sitemap submitted',
      'Google Analytics 4 counting accepted enquiries',
      'Google Business Profile eligibility check, then setup support if eligible',
      'Profile kit: bios, profile image and cover sized for your platforms',
    ],
    notIncluded: ['Logo design (available separately)', 'Ongoing content or monthly support'],
    youProvide: ['Business details and services', 'Photos of your real work', 'Domain and account access in your name'],
    serviceIds: ['websites', 'business-email', 'enquiry-workflows', 'search-console', 'analytics', 'business-profile'],
    featured: true,
  },
  {
    id: 'visibility',
    name: 'Website & Visibility',
    forWho: 'Established businesses whose website is dated, slow, unclear, or missing enquiries.',
    includes: [
      'A written review of your website, Google information and enquiry path',
      'Improvements or a rebuild of the key pages, agreed in the scope',
      'On-page SEO and speed fixes, measured before and after',
      'Search Console and Analytics set up or cleaned up',
      'Business Profile review and corrections',
      'Your enquiry form tested end to end, and fixed if it fails',
    ],
    notIncluded: ['Guaranteed rankings or traffic', 'Paid ads'],
    youProvide: ['Website and Google account access', 'Your main services and areas'],
    serviceIds: ['websites', 'seo', 'search-console', 'analytics', 'business-profile'],
  },
  {
    id: 'content-follow-up',
    name: 'Content & Follow-up',
    forWho: 'Businesses with a working website that need consistent posts and reliable replies.',
    includes: [
      'Enquiry follow-up workflow: acknowledgement, notification, lead list and reminder',
      'A one-month content plan sized to your time',
      'Post and carousel templates, captions and Reel scripts',
      'WhatsApp Business profile copy and message templates',
    ],
    notIncluded: ['Posting on your behalf', 'Follower or reach guarantees'],
    youProvide: ['Common customer questions', 'Photos or clips of your work'],
    serviceIds: ['enquiry-workflows', 'integrations', 'social-strategy', 'social-materials'],
  },
];

/** Recommended low-commitment first step (see docs/03). */
export const checkUp: Package = {
  id: 'check-up',
  name: 'Website & enquiry check-up',
  forWho: 'Owners who are not sure what to fix first.',
  includes: [
    'I review your website on a phone and a laptop',
    'I check your Google information and send a test enquiry',
    'You receive a short written list of fixes, most important first',
  ],
  notIncluded: ['The fixes themselves, which can be quoted as a project'],
  youProvide: ['Your website address and business name'],
  serviceIds: ['seo', 'enquiry-workflows', 'business-profile'],
};

export const packageById = (id: string) => [...packages, checkUp].find((p) => p.id === id);
