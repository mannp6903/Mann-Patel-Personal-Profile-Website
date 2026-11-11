/**
 * Services — the single source of truth for service copy.
 * Edit text here; layout code reads from this file.
 *
 * Rules for this file (see docs/03-services-and-journeys.md):
 * - Describe deliverables, never outcomes we can't control (rankings, leads, reach).
 * - No prices or turnaround promises until Mann confirms them.
 */

export type GroupId = 'found' | 'answered' | 'booked' | 'extras';

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
  letter: 'A' | 'B' | 'C' | '+';
  verb: string;
  title: string;
  intro: string;
}

/**
 * The three areas follow a local customer's path: they find you, they contact you, they book.
 * Chosen from the research in Nov 2026 (summary: docs/11-service-areas.md).
 */
export const groups: ServiceGroup[] = [
  {
    id: 'found',
    letter: 'A',
    verb: 'Get found',
    title: 'Get found and chosen on Google',
    intro:
      'Correct details on Google, Apple Maps and Bing, and a steady flow of real reviews with your replies, so people nearby find you and pick you.',
  },
  {
    id: 'answered',
    letter: 'B',
    verb: 'Answer fast',
    title: 'Enquiry follow-up and booking',
    intro:
      'Missed callers and form enquiries get a quick, honest automatic reply and land in one list you check. Reminders help cut no-shows. You start with one tested workflow.',
  },
  {
    id: 'booked',
    letter: 'C',
    verb: 'Get booked',
    title: 'A website that books work',
    intro:
      'A clear, fast site that says what you do and where, with a book-or-quote button on every page. Monthly care is optional.',
  },
];

/**
 * Add-ons: print and social content. Real skills, offered alongside A/B/C rather than as a
 * headline area (stand-alone design and posting work is heavily price-competitive).
 */
export const addOns: ServiceGroup = {
  id: 'extras',
  letter: '+',
  verb: 'Add-ons',
  title: 'Print and social content',
  intro:
    'Flyers, business cards, gift-card artwork, posts, Reels and stories in one consistent style, each pointing customers to your booking link or review card.',
};

/**
 * Brand & Content Sprint (growth report, 10 Nov 2026): the print and social services as one small,
 * bounded campaign. It lives on the services overview (#brand-content). A page of its own waits for
 * owner-approved sample work to show (docs/21-growth-seo-launch.md).
 */
export const sprint = {
  id: 'brand-content',
  name: 'Brand & Content Sprint',
  summary:
    'One short campaign built from one service story, using the logo, colours and photos you already have, so your posts and print look like one business.',
  includes: [
    'A one-page style and messaging sheet from your approved logo, colours and photos',
    'Three captioned post designs',
    'Two Reel hooks, with scripts you can film on a phone',
    'One round of changes, then every file handed over',
  ],
  separate: [
    'Filming and editing',
    'Posting, and replying to comments or messages',
    'Extra channels',
    'A blog article or FAQ, reviewed by you before it goes out',
    'A new logo or a full brand identity (I can recommend people)',
  ],
  cta: { label: 'Ask about the sprint', href: '/contact/?service=social-content#brief' },
} as const;

export const services: Service[] = [
  // ───────────── A · Get found and chosen on Google ─────────────
  {
    id: 'business-profile',
    group: 'found',
    name: 'Google Business Profile setup and clean-up',
    summary:
      'Your profile checked against Google’s rules, then completed: the right category, services, hours, service area, photos and a book-or-quote link.',
    problem:
      'You’re missing from Google Maps, or your listing has the wrong hours, an old phone number, a vague category or no photos.',
    deliverables: [
      'Eligibility check against Google’s current guidelines, before anything is created',
      'You stay the owner of the profile; I’m added as a manager',
      'Primary category, services, hours, holiday hours and service area set correctly',
      'Photos of your real work, and your booking or quote link on the profile',
      'Verification guidance (Google chooses the method; it may need you on a video call)',
      'A “before” snapshot of how you appear on Maps today, saved for comparison',
    ],
    inputs: [
      'Your real-world business name, exactly as customers see it',
      'Whether customers visit you, or you travel to them',
      'Photos of your real work and premises',
    ],
    exclusions: [
      'Businesses without in-person customer contact and virtual offices are not eligible, and I will not set one up',
      'No keyword-stuffed names, fake addresses or bought reviews',
      'A promised Maps position, or a reinstatement date if Google suspends a profile',
    ],
    handover: 'You own the profile. You get the before snapshot, a list of every change and a checklist for keeping it current.',
    nextStep: 'Request a check and tell me how you serve customers.',
    terms: [
      {
        term: 'Google Business Profile',
        plain: 'Your free listing on Google Search and Maps: hours, phone, photos, services and reviews.',
      },
    ],
  },
  {
    id: 'reviews',
    group: 'found',
    name: 'Reviews: asking, replying and review cards',
    summary:
      'A simple, honest way to ask every customer for a review, printed QR review cards, and a reply to every review in your voice.',
    problem: 'You have a handful of old reviews, you forget to ask, and some reviews have never had a reply.',
    deliverables: [
      'Your direct review link, a short text and email request, and a QR review card for the counter, the van or the invoice',
      'A routine for asking every customer the same way after the job',
      'Reply templates in your voice for good, mixed and bad reviews',
      'Replies drafted for your existing reviews, ready for you to post or approve',
    ],
    inputs: ['How a job or appointment usually ends today', 'How you like to talk to customers'],
    exclusions: [
      'No paid, fake or swapped reviews, and no discounts or gifts in return for a review (Google forbids any incentive)',
      'No asking only the happy customers (“review gating”), which Google also forbids',
      'Removing genuine negative reviews: only Google removes reviews, and only for policy breaches',
    ],
    handover: 'The review link, card files, reply templates and the routine on one page.',
    nextStep: 'Request a quote and tell me roughly how many reviews you have now.',
  },
  {
    id: 'listings',
    group: 'found',
    name: 'Apple Maps, Bing and AI assistant check',
    summary:
      'Your name, address, phone and hours made consistent on Apple Maps, Bing, Yelp and Facebook, plus a check of what ChatGPT, Gemini and Perplexity say about you.',
    problem:
      'Customers find old hours on Apple Maps, a duplicate listing on Yelp, or an AI assistant that gets your details wrong.',
    deliverables: [
      'Apple Business Connect and Bing Places set up or corrected',
      'Yelp and Facebook details matched to your Google profile',
      'Duplicate or outdated listings found and reported',
      'What ChatGPT, Gemini and Perplexity say about your business, checked and recorded, with the public sources behind them corrected where possible',
    ],
    inputs: ['Your correct details', 'Logins, or a phone nearby to receive verification codes'],
    exclusions: [
      'Paid directory or listing packages',
      'Direct control over AI assistants: they draw on public sources, which I help make accurate',
    ],
    handover: 'A table of every listing, who owns the login, and what changed.',
    nextStep: 'Request a check and tell me where you think your details are wrong.',
  },
  {
    id: 'local-plan',
    group: 'found',
    name: 'Monthly “Stay found” plan',
    summary:
      'Every month: prompt replies to new reviews, two to four profile updates, a watch for unwanted edits, and a one-page report.',
    problem: 'Your profile was set up once and then forgotten, and you never know whether Google is sending you calls.',
    deliverables: [
      'Replies to new reviews in your voice, within a reply time agreed in your scope',
      'Two to four profile updates or photos a month',
      'Checks for wrong hours, edits suggested by strangers and duplicate listings',
      'A one-page monthly report: calls, direction requests, website clicks, new reviews, rating and the AI check',
    ],
    inputs: ['Manager access to your profile', 'A few photos a month (a phone photo is fine)'],
    exclusions: ['Guaranteed rankings or call numbers', 'Paid ads (Google Ads or Local Services Ads)'],
    handover: 'Stop any month. You keep the profile, every report and every reply.',
    nextStep: 'Ask about the monthly plan when you request a setup quote.',
  },

  // ───────────── B · Enquiry follow-up and booking ─────────────
  {
    id: 'missed-calls',
    group: 'answered',
    name: 'Missed-call text-back and instant replies',
    summary:
      'When you can’t pick up, the caller gets a polite text straight away. Web forms and WhatsApp messages get an instant, honest reply too.',
    problem: 'You’re on a job, the phone rings out, and the customer calls the next business on Google.',
    deliverables: [
      'Missed-call text-back on a properly registered business number, tested on Canadian carriers',
      'An instant acknowledgement for your web form, with a notification to you',
      'WhatsApp Business greeting and away messages, quick replies and a catalogue',
      'Messages that say honestly what happens next, and never pretend to be a person',
    ],
    inputs: ['Your business phone set-up and carrier', 'Your usual answers to the questions customers ask most'],
    exclusions: [
      'Outbound AI calls or robocalls',
      'Promotional texts to people who haven’t agreed to receive them',
      'Phone and texting fees, billed to you by the provider',
    ],
    handover: 'Your number stays yours. You get the message wording, the test results and how to switch it off.',
    nextStep: 'Request a quote and tell me how customers usually reach you.',
    terms: [
      {
        term: 'Text-back',
        plain: 'An automatic text to someone whose call you missed, so they know you’ll call back and don’t move on.',
      },
    ],
  },
  {
    id: 'enquiry-workflows',
    group: 'answered',
    name: 'One enquiry list and follow-up',
    summary:
      'Enquiries from your form, calls and messages in one list with a status, and a reminder before anyone waits too long.',
    problem: 'Enquiries arrive by form, DM, email and voicemail; some get answered late and some never.',
    deliverables: [
      'One list (your existing tool, a free CRM or a spreadsheet) with a status for each enquiry',
      'A reminder when an enquiry has no reply after the time you choose',
      'One polite follow-up for quotes that go quiet',
      'A review request after each finished job, which feeds your reviews routine',
      'A record of each contact’s consent, so follow-ups stay within Canada’s anti-spam law',
    ],
    inputs: [
      'How enquiries arrive today and who replies',
      'Your usual reply and the questions you always ask',
      'Access to the tools you already use',
    ],
    exclusions: [
      'Marketing emails or texts without a separate, explicit opt-in',
      'Automated replies never pretend to be a person or promise a time you can’t keep',
      'Paid tool subscriptions are billed to you',
    ],
    handover: 'A diagram of the workflow, test results with sample data, and what to check each week.',
    nextStep: 'Request a quote and describe how enquiries reach you now.',
    terms: [
      {
        term: 'CRM',
        plain:
          'Customer relationship management: a list of customers and enquiries with notes and statuses. A spreadsheet is often enough to start.',
      },
      {
        term: 'CASL',
        plain: 'Canada’s Anti-Spam Legislation: rules on when you may send business emails and texts, and what they must include.',
      },
    ],
  },
  {
    id: 'booking',
    group: 'answered',
    name: 'Online booking, reminders and deposits',
    summary:
      'A booking or quote link on your Google profile and website, reminders before every appointment, and a clear deposit or cancellation policy.',
    problem: 'Customers can only book by phone, people forget appointments, and a no-show costs you a slot you can’t refill.',
    deliverables: [
      'Booking set up in the tool you already use (for example Jobber, Housecall Pro, Square, Fresha, Vagaro or Booksy), or a simple one if you have none',
      'Your booking link on your Google profile, website and Instagram',
      'Reminders 48 and 24 hours before each appointment',
      'A deposit or cancellation policy, written plainly and switched on if you want it',
      'A direct booking link for customers who already know you, so they don’t book through a marketplace that may charge you a new-client fee',
    ],
    inputs: ['Your services, how long each takes and its price', 'Your cancellation rules'],
    exclusions: [
      'Booking software fees, billed to you by the provider',
      'Payments and refunds, which stay with your payment provider',
    ],
    handover: 'Admin access stays with you. You get the settings list and how to change reminder times.',
    nextStep: 'Request a quote and tell me which booking tool you use, if any.',
  },
  {
    id: 'integrations',
    group: 'answered',
    name: 'Connecting the tools you already pay for',
    summary: 'Join your form, phone, calendar, booking tool and list, so customer details are typed once.',
    problem: 'You copy the same customer details from a form to an email to a calendar to a spreadsheet.',
    deliverables: [
      'A map of where information goes today and where it should go',
      'Connections between your tools, using their built-in features first',
      'Test runs with sample data, including what happens when a step fails',
    ],
    inputs: ['Logins or admin invites for each tool', 'A list of what you want to stop doing by hand'],
    exclusions: ['Custom software or apps', 'Connecting tools that don’t offer a supported way to connect'],
    handover: 'Written notes on each connection, how to pause it, and who to contact if it breaks.',
    nextStep: 'Request a quote and list the tools you use.',
  },

  // ───────────── C · A website that books work ─────────────
  {
    id: 'websites',
    group: 'booked',
    name: 'Website fix-up or new site',
    summary:
      'Fix a tired site, or build a new one of up to five pages, with clear service information, click-to-call and a book-or-quote button on every page.',
    problem: 'Your site is hard to use on a phone, doesn’t say clearly what you do and where, or has no easy way to book.',
    deliverables: [
      'Fix-up: service and area pages added, mobile and speed fixes, a book-or-quote button on every page',
      'New site: page plan and copy written with you, mobile-first design using your logo and colours',
      'An enquiry form with spam protection that replies instantly, and your booking tool linked',
      'Domain connected, plus an email address at your domain (for example info@yourbusiness.ca)',
      'Accessibility and speed checks before launch, with the results shared',
    ],
    inputs: [
      'Your services, service area and how customers usually contact you',
      'Your logo and photos of your real work (I can suggest what to shoot)',
      'Access to your domain registrar, or I help you buy the domain in your name',
    ],
    exclusions: [
      'Online stores and member logins',
      'Logo design (I can recommend a designer)',
      'Hosting, domain and email fees, billed to you by the provider',
    ],
    handover:
      'A login list, a short “how to edit” guide, the form test results and a list of what you still need to do.',
    nextStep: 'Request a quote and tell me whether you have a site now.',
    terms: [
      {
        term: 'Service page',
        plain: 'A page for one service (for example, “Deep cleaning in Scarborough”), so customers and Google see exactly what you do.',
      },
    ],
  },
  {
    id: 'seo',
    group: 'booked',
    name: 'Service pages, search basics and measurement',
    summary:
      'Pages that search engines and people understand, plus Search Console and Analytics, so you can see which pages bring enquiries and bookings.',
    problem: 'Pages have vague titles, the site is slow on a phone, and you can’t tell whether the website brings you any work.',
    deliverables: [
      'A page for each main service and area, with clear titles, descriptions and headings',
      'Business details in structured data, and a sitemap',
      'Google Search Console verified in your name, with the sitemap submitted',
      'Google Analytics 4 counting enquiries, calls and booking clicks, with personal details kept out',
      'Speed measured before and after',
    ],
    inputs: [
      'Website access, or your developer’s contact',
      'A Google account in your name',
      'Your main services and the areas you serve',
    ],
    exclusions: [
      'Guaranteed rankings, traffic or leads. Google decides rankings',
      'Link buying, fake reviews or any tactic against Google’s guidelines',
      'Ongoing monthly SEO unless agreed separately',
    ],
    handover: 'You own Search Console and Analytics. You get the list of changes, the measurements and what to look at each month.',
    nextStep: 'Request a review and include your website address.',
    terms: [
      {
        term: 'SEO',
        plain: 'Search engine optimisation: making your pages clear and fast so search engines can understand and show them.',
      },
    ],
  },
  {
    id: 'maintenance',
    group: 'booked',
    name: 'Monthly care plan',
    summary: 'A monthly test of your enquiry form and booking link, up to 30 minutes of small edits, and a note of what changed.',
    problem: 'Things work on launch day, then a form quietly stops sending or a renewal is missed.',
    deliverables: [
      'A monthly test of your enquiry form and booking link, and text-back if you have it',
      'Updates where your site needs them, and renewal-date reminders',
      'Small content edits within an agreed allowance',
      'A running change log you can read',
    ],
    inputs: ['User access (not ownership) to the tools being checked'],
    exclusions: ['Emergency or after-hours support unless agreed in writing', 'New features, which are quoted as projects'],
    handover: 'Stop at any time and you receive the change log and the access list, and my access is removed.',
    nextStep: 'Ask about the care plan when you request a project quote.',
  },

  // ───────────── + · Add-ons: print and social content ─────────────
  {
    id: 'print-design',
    group: 'extras',
    name: 'Flyers, business cards and gift-card artwork',
    summary:
      'Print pieces with the right sizes, bleed and file formats, each with a QR code to your booking link or review card, plus matching digital versions.',
    problem: 'Print shops reject your files, your flyer looks nothing like your Instagram, or your cards send people nowhere.',
    deliverables: [
      'Flyers, door hangers, business cards and gift-card artwork',
      'QR codes that open your booking link, website or review link',
      'Print-ready PDFs with bleed and your printer’s specifications, plus web and social versions',
      'Editable templates so you can update prices and dates yourself',
    ],
    inputs: ['Your printer’s specifications (or I recommend a common standard)', 'Text, offers, prices and contact details'],
    exclusions: [
      'Gift-card artwork only: selling, tracking and redeeming gift cards needs your payment or booking system',
      'Printing costs, which are paid to the printer',
      'A new logo (I can recommend a designer)',
    ],
    handover: 'Print-ready and editable files, with a note of the sizes and specifications used.',
    nextStep: 'Request a quote and list the pieces you need.',
    terms: [
      {
        term: 'Bleed',
        plain: 'Extra artwork past the trim line, so printed pieces have no white edges after cutting.',
      },
    ],
  },
  {
    id: 'social-content',
    group: 'extras',
    name: 'Social media content: posts, Reels and stories',
    summary:
      'A posting plan sized to your time, with posts, carousels, Reel and story ideas, hooks, scripts and captions that point people to your booking link.',
    problem: 'You know you should post, but you are not sure what to post, or you start strong and stop.',
    deliverables: [
      'Content ideas based on what customers ask you, planned for the month',
      'Post and carousel designs at each platform’s current sizes',
      'Reel and story ideas with hooks, short scripts and shot lists',
      'Captions with a clear next step (book, call or leave a review)',
      'Editable templates so you can make the next ones yourself',
    ],
    inputs: ['Twenty minutes of the questions customers often ask', 'Photos or clips of your real work'],
    exclusions: [
      'Follower growth, reach or views cannot be guaranteed',
      'Posting on your behalf and replying to comments, unless agreed separately',
      'Paid ads, and stock photos presented as your own work',
    ],
    handover: 'The plan and editable templates in accounts you own (for example Canva), plus exported files.',
    nextStep: 'Request a quote and tell me which platforms your customers use.',
    terms: [
      {
        term: 'Hook',
        plain: 'The first line or first two seconds of a post or Reel, written to make people stop scrolling.',
      },
    ],
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
