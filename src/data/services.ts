/**
 * Services — the single source of truth for service copy.
 * Edit text here; layout code reads from this file.
 *
 * Rules for this file (see docs/03-services-and-journeys.md):
 * - Describe deliverables, never outcomes we can't control (rankings, leads, reach).
 * - No prices or turnaround promises until Mann confirms them.
 */

export type GroupId = 'visibility' | 'follow-up' | 'content';

export interface Term {
  term: string;
  plain: string;
}

export interface Service {
  id: string;
  group: GroupId;
  name: string;
  /** One sentence, shown on cards. */
  summary: string;
  problem: string;
  deliverables: string[];
  inputs: string[];
  /** Service-specific steps; the shared engagement process lives in `process`. */
  steps?: string[];
  exclusions: string[];
  handover: string;
  nextStep: string;
  terms?: Term[];
}

export interface ServiceGroup {
  id: GroupId;
  letter: 'A' | 'B' | 'C';
  verb: string;
  title: string;
  intro: string;
}

export const groups: ServiceGroup[] = [
  {
    id: 'visibility',
    letter: 'A',
    verb: 'Get found',
    title: 'Websites and online visibility',
    intro:
      'A clear website and accurate Google information, so people searching for what you do can understand your business and contact you.',
  },
  {
    id: 'follow-up',
    letter: 'B',
    verb: 'Follow up',
    title: 'Business email and automation',
    intro:
      'A professional address and a simple routine, so every enquiry is acknowledged and lands somewhere you will actually see it.',
  },
  {
    id: 'content',
    letter: 'C',
    verb: 'Look professional',
    title: 'Content, branding and marketing materials',
    intro:
      'Posts, templates and print pieces that look like they came from the same careful business, because they did.',
  },
];

export const services: Service[] = [
  // ───────────── A · Websites and online visibility ─────────────
  {
    id: 'websites',
    group: 'visibility',
    name: 'Websites and landing pages',
    summary:
      'A personal or business website, or a focused landing page, that explains what you do and makes it easy to get in touch on a phone.',
    problem:
      'Your current page is out of date, hard to use on a phone, or does not say clearly what you offer, where you work and how to book.',
    deliverables: [
      'Page plan (sitemap) and the copy for each page, written with you',
      'Mobile-first design using your logo and colours (or a simple identity if you need one)',
      'Enquiry form with spam protection, plus booking-tool integration if you already use one',
      'Basic on-page SEO: titles, descriptions, headings, image descriptions, sitemap',
      'Accessibility and speed checks before launch, with the results shared',
      'Domain connection and launch, then a written handover',
    ],
    inputs: [
      'Your services, service area and how customers usually contact you',
      'Logo and photos of your real work (I can suggest what to shoot)',
      'Access to your domain registrar, or I help you buy the domain in your name',
    ],
    exclusions: [
      'Online stores, payments and member logins',
      'Ongoing copywriting or blog posts (available as separate content work)',
      'Hosting and domain fees, which are billed to you by the provider',
    ],
    handover:
      'Login list, a short "how to edit" guide, the form test results and a list of what you still need to do (for example, adding new photos).',
    nextStep: 'Request a quote and tell me how many pages you think you need.',
    terms: [
      {
        term: 'Landing page',
        plain: 'A single page built for one offer or campaign, with one clear action.',
      },
    ],
  },
  {
    id: 'seo',
    group: 'visibility',
    name: 'Technical and on-page SEO',
    summary:
      'A review and fix list for how your site is structured, described and loaded, so search engines and people can understand it.',
    problem:
      'Pages have vague titles, missing descriptions or duplicate content, the site is slow on mobile, or Google shows the wrong information.',
    deliverables: [
      'Written review of page structure, titles, descriptions, headings, internal links and images',
      'Speed check with the lab measurements recorded before and after',
      'Fixes applied where I have access, or a prioritised fix list for your developer',
      'Content recommendations: which questions your pages should answer',
    ],
    inputs: [
      'The website address and an editor login (or developer contact)',
      'Search Console access, if it is set up',
      'Your main services and the areas you serve',
    ],
    exclusions: [
      'Guaranteed rankings, traffic or leads. SEO improves discoverability; Google decides rankings',
      'Link buying, fake reviews or any tactic against Google’s guidelines',
      'Ongoing monthly SEO unless agreed separately',
    ],
    handover:
      'The review document, a list of what changed, and the measurements so you can compare later.',
    nextStep: 'Request a review and include your website address.',
    terms: [
      {
        term: 'SEO',
        plain:
          'Search engine optimisation: making your pages clear and fast so search engines can understand and show them.',
      },
    ],
  },
  {
    id: 'search-console',
    group: 'visibility',
    name: 'Google Search Console setup',
    summary:
      'Prove to Google that you own your site, submit your sitemap, and learn to read the few reports that matter.',
    problem:
      'You do not know whether Google can find your pages, which searches show your site, or whether something is broken.',
    deliverables: [
      'Ownership verification support (DNS record for a Domain property, or a file/tag for a URL-prefix property)',
      'Sitemap submitted and checked',
      'A one-page guide to the Performance, Pages and Experience reports',
      'A first reading of your data, if there is any yet',
    ],
    inputs: [
      'Access to your domain’s DNS settings, or to the website',
      'A Google account in your name that will own the property',
    ],
    exclusions: [
      'Verification cannot be completed without your access; I cannot verify a site you do not control',
      'Search Console reports data; it does not improve rankings by itself',
    ],
    handover: 'You are the verified owner. I keep user access only if you want ongoing help.',
    nextStep: 'Request setup and tell me where your domain is registered.',
    terms: [
      {
        term: 'Sitemap',
        plain: 'A file listing your pages, so Google can find them all.',
      },
    ],
  },
  {
    id: 'analytics',
    group: 'visibility',
    name: 'Google Analytics 4 setup',
    summary:
      'Measure the few actions that matter, such as enquiries and calls, without collecting more personal data than you need.',
    problem:
      'Analytics is missing, or installed but showing numbers nobody understands or uses.',
    deliverables: [
      'GA4 property set up in your account and installed on your site',
      'Meaningful events, for example accepted enquiries (generate_lead) and contact clicks, checked so they are not double-counted',
      'Personal form content kept out of analytics',
      'A simple monthly reporting plan: three or four numbers and where to find them',
    ],
    inputs: [
      'A Google account in your name',
      'Website access, or your developer’s contact',
      'A decision on consent: what your privacy notice says and whether you need a consent banner',
    ],
    exclusions: [
      'Legal advice on privacy law. I explain the options; you decide, ideally with advice',
      'Advertising or remarketing setup',
    ],
    handover:
      'You own the property. You get a list of events, how they were tested, and the reporting plan.',
    nextStep: 'Request setup and tell me which actions you most want to count.',
    terms: [
      {
        term: 'Event',
        plain: 'A recorded action, such as "enquiry sent". Analytics counts events, not people’s details.',
      },
    ],
  },
  {
    id: 'business-profile',
    group: 'visibility',
    name: 'Google Business Profile support',
    summary:
      'Check whether your business qualifies, then set up or improve the profile with accurate hours, services, areas and photos.',
    problem:
      'Your business is missing from Google Maps and local results, or the listing has wrong hours, an old phone number or no photos.',
    deliverables: [
      'Eligibility check against Google’s current guidelines, before anything is created',
      'Setup or clean-up support: name, category, service area or address, hours, services, photos',
      'Verification guidance (Google chooses the method; it may need you on a video call or a postcard)',
      'A short routine for replying to reviews and keeping information current',
    ],
    inputs: [
      'Your real-world business name, exactly as customers see it',
      'Whether customers visit you, or you travel to them',
      'Photos of your real work and premises',
    ],
    exclusions: [
      'Businesses without in-person customer contact (for example, purely online services) and virtual offices are not eligible, and I will not set one up',
      'No keyword-stuffed names, fake addresses or bought reviews',
      'Each business gets its own profile; one business’s identity is never reused for another',
    ],
    handover: 'You are the profile owner. You get the reply routine and a checklist for updates.',
    nextStep: 'Request an eligibility check and tell me how you serve customers.',
  },

  // ───────────── B · Business email and automation ─────────────
  {
    id: 'business-email',
    group: 'follow-up',
    name: 'Professional email setup',
    summary:
      'An address at your own domain, for example hello@yourbusiness.ca, set up on Google Workspace or your chosen provider.',
    problem:
      'You use a personal Gmail for business, or your domain email is set up but messages go to spam.',
    deliverables: [
      'Provider recommendation and setup support (commonly Google Workspace)',
      'Mailbox and alias plan, for example hello@ and your name',
      'SPF, DKIM and DMARC records planned and checked against the provider’s current documentation',
      'Phone and laptop set up, plus a signature',
    ],
    inputs: [
      'Your domain and access to its DNS settings',
      'A payment method for the email provider (billed directly to you)',
    ],
    exclusions: [
      'Inbox placement cannot be guaranteed: correct records help, but each receiving provider decides',
      'Migrating large mailboxes is quoted separately',
    ],
    handover:
      'Admin access stays with you. You get a record of every DNS change and why it was made.',
    nextStep: 'Request setup and tell me your domain and how many people need an address.',
    terms: [
      {
        term: 'SPF, DKIM, DMARC',
        plain:
          'Three DNS records that tell other mail servers your messages really come from you. They reduce spoofing and help delivery.',
      },
    ],
  },
  {
    id: 'enquiry-workflows',
    group: 'follow-up',
    name: 'Enquiry follow-up workflows',
    summary:
      'Every enquiry gets an instant acknowledgement, you get a notification, and nothing waits more than a set time without a reply.',
    problem:
      'Enquiries arrive by form, DM, email and voicemail; some get answered late and some never.',
    deliverables: [
      'Acknowledgement message that tells the customer what happens next (honestly: a request is not a confirmed booking)',
      'Owner notification by email, with the enquiry details in a consistent format',
      'A simple lead list (spreadsheet or basic CRM) with a status for each enquiry',
      'A follow-up reminder when an enquiry has no reply after an agreed time',
      'Appointment-request workflow, if you take bookings',
    ],
    inputs: [
      'How enquiries arrive today and who replies',
      'Your usual reply and the questions you always ask',
      'Access to the form, email and spreadsheet tools you already use',
    ],
    exclusions: [
      'Automated replies never pretend to be a person or promise a time you cannot keep',
      'No marketing emails without a separate, explicit opt-in',
      'Paid tool subscriptions are billed to you',
    ],
    handover:
      'A diagram of the workflow, test results with sample data, and what to check each week.',
    nextStep: 'Request a quote and describe how enquiries reach you now.',
    terms: [
      {
        term: 'CRM',
        plain:
          'Customer relationship management: a list of customers and enquiries with notes and statuses. A spreadsheet is often enough to start.',
      },
    ],
  },
  {
    id: 'integrations',
    group: 'follow-up',
    name: 'Connecting forms, email, calendars and lists',
    summary:
      'Join the tools you already use so details are typed once, when the business actually needs it.',
    problem:
      'You copy the same customer details from a form to an email to a calendar to a spreadsheet.',
    deliverables: [
      'A map of where information goes today and where it should go',
      'Connections between your form, email, calendar and spreadsheet or CRM, using built-in features first',
      'Test runs with sample data, including what happens when a step fails',
    ],
    inputs: ['Logins or admin invites for each tool', 'A list of what you want to stop doing by hand'],
    exclusions: [
      'Custom software or apps',
      'Connecting tools that do not offer a supported way to connect',
    ],
    handover: 'Written notes on each connection, how to pause it, and who to contact if it breaks.',
    nextStep: 'Request a quote and list the tools you use.',
  },
  {
    id: 'maintenance',
    group: 'follow-up',
    name: 'Maintenance, monitoring and handover',
    summary:
      'Optional ongoing care after launch: updates, checks that forms and workflows still work, and a clear record of everything.',
    problem:
      'Things work on launch day, then a form quietly stops sending or a renewal is missed.',
    deliverables: [
      'An agreed monthly check: form test, workflow test, uptime and renewal dates',
      'Small content updates within an agreed allowance',
      'A running change log you can read',
    ],
    inputs: ['User access (not ownership) to the tools being checked'],
    exclusions: [
      'Emergency or after-hours support unless agreed in writing',
      'New features, which are quoted as projects',
    ],
    handover:
      'You can stop at any time and receive the change log, the access list and a removal of my access.',
    nextStep: 'Ask about ongoing support when you request a project quote.',
  },

  // ───────────── C · Content, branding and marketing materials ─────────────
  {
    id: 'social-strategy',
    group: 'content',
    name: 'Social content strategy and planning',
    summary:
      'A realistic posting plan with content ideas, hooks, captions and short-video scripts that fit the time you actually have.',
    problem: 'You know you should post, but you are not sure what to post, or you start strong and stop.',
    deliverables: [
      'Content pillars based on what customers ask you',
      'A monthly plan sized to your time (for example, two posts a week)',
      'Ideas, hooks, captions and Reel scripts ready to film',
      'A simple way to reuse one piece of content across platforms',
    ],
    inputs: ['Twenty minutes of questions customers often ask', 'Photos or clips of your real work'],
    exclusions: [
      'Follower growth, reach or virality cannot be guaranteed',
      'Posting on your behalf and community management, unless agreed separately',
    ],
    handover: 'The plan in a shared document you own, plus caption and script templates.',
    nextStep: 'Request a plan and tell me which platforms your customers use.',
  },
  {
    id: 'social-materials',
    group: 'content',
    name: 'Instagram, Facebook and WhatsApp Business materials',
    summary:
      'Post and carousel designs, Reel concepts, Facebook content and WhatsApp Business promotional pieces in a consistent style.',
    problem: 'Your posts all look different and do not match your shopfront, van or website.',
    deliverables: [
      'Post and carousel designs at each platform’s current sizes',
      'Reel concepts with shot lists',
      'WhatsApp Business profile copy, catalogue images and broadcast-message templates',
      'Editable templates so you can make the next ones yourself',
    ],
    inputs: ['Logo, colours and fonts (or I help create simple ones)', 'Your offers and photos'],
    exclusions: ['Paid advertising management', 'Stock photos presented as your own work'],
    handover: 'Editable files in your account (for example, Canva) plus exported images.',
    nextStep: 'Request a quote and tell me how many pieces you need.',
  },
  {
    id: 'identity',
    group: 'content',
    name: 'Logo and visual identity support',
    summary:
      'A simple, usable identity: logo, colours, type and a one-page guide, or a tidy-up of what you already have.',
    problem: 'Your logo is blurry, comes in five versions, or does not work small on a phone or a stamp.',
    deliverables: [
      'Logo or logo refresh with a small-size version',
      'Colour palette checked for readable contrast',
      'Font pairing with licences that allow business use',
      'A one-page identity guide',
    ],
    inputs: ['Your business name, the customers you serve and examples you like or dislike'],
    exclusions: [
      'Trademark searches or registration (ask a trademark professional)',
      'Copying another business’s identity',
    ],
    handover: 'Logo files (SVG, PNG, PDF) in colour, black and white, and the guide.',
    nextStep: 'Request a quote and share any existing logo files.',
  },
  {
    id: 'print-digital',
    group: 'content',
    name: 'Business cards, flyers, gift-card artwork and templates',
    summary:
      'Print and digital pieces with the right sizes, bleed and file formats, coordinated with your social templates.',
    problem: 'Print shops reject your files, or your flyer looks nothing like your Instagram.',
    deliverables: [
      'Business cards, flyers and gift-card artwork',
      'Print-ready PDFs with bleed and the printer’s specifications, plus web versions',
      'Coordinated social templates in the same style',
    ],
    inputs: ['Your printer’s specifications (or I recommend a common standard)', 'Text, offers and contact details'],
    exclusions: [
      'Gift-card artwork only: issuing, payment, tracking and redemption need a separate system',
      'Printing costs, which are paid to the printer',
    ],
    handover: 'Print-ready and editable files, with a note of sizes and specifications used.',
    nextStep: 'Request a quote and list the pieces you need.',
  },
];

/** The shared engagement process, used on Home and Services. */
export const process = [
  {
    title: 'Send a short brief',
    you: 'Tell me about your business and what is not working. Two minutes, no preparation needed.',
    me: 'I read it and reply with questions, or say honestly if I am not the right fit.',
  },
  {
    title: 'Agree a written scope',
    you: 'Answer a few questions, on a call or by email.',
    me: 'I send a scope with deliverables, what I need from you, exclusions, third-party costs and a quote.',
  },
  {
    title: 'Build and check in',
    you: 'Send content and review drafts. Two rounds of changes are included per deliverable.',
    me: 'I build, show progress and keep a list of decisions.',
  },
  {
    title: 'Test and launch together',
    you: 'Try it yourself. We send a real test enquiry.',
    me: 'I run speed and accessibility checks and fix what we find.',
  },
  {
    title: 'Hand over',
    you: 'Keep your logins and the short guide.',
    me: 'I document access, what changed and what you still need to do. Ongoing support is optional.',
  },
] as const;

export const serviceById = (id: string) => services.find((s) => s.id === id);
export const servicesInGroup = (group: GroupId) => services.filter((s) => s.group === group);
