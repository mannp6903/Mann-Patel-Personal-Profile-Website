/**
 * Focused service pages (round 10): /services/web-design/, /services/local-visibility/ and
 * /services/enquiry-follow-up/. One template (src/pages/services/[slug].astro) renders each.
 *
 * Rules: say what is actually delivered, link only to real work with its honest status, label every
 * sample as a sample, and promise nothing Google or a customer decides. Prices come from
 * src/data/packages.ts (shown as "Written quote after a short brief" until Mann approves a figure).
 */
import { serviceById, type GroupId } from './services';
import type { PackageId } from './packages';

export interface Faq {
  q: string;
  a: string;
}

/** One extra, clearly bounded block after the steps: a repair path, the AI search check, the scoped options. */
export interface Aside {
  /** Anchor on the page. */
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  items: string[];
  note?: string;
  cta?: { label: string; href: string };
}

/** A labelled sample table (fictional data): a before-and-after snapshot or a test log. */
export interface Sample {
  id?: string;
  /** Defaults to "Sample · fictional business". */
  badge?: string;
  /** Column headings; defaults to Check / Before / After set-up. */
  cols?: [string, string, string];
  title: string;
  intro: string;
  rows: { check: string; before: string; after: string }[];
}

export interface ServicePage {
  slug: 'web-design' | 'local-visibility' | 'enquiry-follow-up' | 'website-care' | 'ai-search-optimization';
  /** The matching area on /services/ (its anchor keeps working). */
  group: GroupId;
  /** Short name used in navigation and breadcrumbs. */
  short: string;
  /** The plain name of the service, used on cards (home page and the services overview). */
  name: string;
  /** One sentence for those cards. */
  card: string;
  /** Page title for search results (" | Mann Patel" is added). */
  title: string;
  description: string;
  eyebrow: string;
  /** The H1 as one sentence: the service and the place (growth report copy map, 10 Nov 2026). */
  h1: string;
  /** The same H1 split into display lines; the last one is set in lime. Must join back to `h1`. */
  lines: string[];
  lead: string;
  packages: PackageId[];
  forWho: string[];
  notFor: string;
  /** What the work actually involves, in order. */
  steps: { title: string; body: string }[];
  /** Real projects (case-study ids) relevant to this service, if any. */
  work: string[];
  /** A checklist of what is tested, or a labelled sample deliverable. */
  checklist?: { title: string; intro: string; items: string[] };
  sample?: Sample;
  /** A fictional test log: what was tried, what should happen, what did (including a failure). */
  testLog?: Sample;
  asides?: Aside[];
  /** Show the fictional enquiry walkthrough. */
  demo?: boolean;
  limits: string[];
  /** Costs other providers bill, in plain words. */
  costs: string;
  handover: string;
  faqs: Faq[];
  /** Official sources the page relies on (shown as links). */
  sources?: { label: string; url: string }[];
}

export const servicePages: ServicePage[] = [
  {
    slug: 'web-design',
    group: 'booked',
    short: 'Web design',
    name: 'Web design and redesign',
    card: 'A new website, or a redesign of a dated one: up to five pages, one tested enquiry path and a written handover.',
    title: 'Toronto Small Business Web Design',
    description:
      'Get a mobile-friendly website or redesign with clear service pages, a tested enquiry path and a written handover. See projects and ask for a quote.',
    eyebrow: 'Web design and redesign',
    h1: 'Web design for Toronto small businesses',
    lines: ['Web design', 'for Toronto small businesses'],
    lead: 'A new website, or a website redesign when yours is dated or hard to use on a phone, for owner-run service businesses in Toronto, especially North York and Scarborough: up to five pages that answer what people ask before they call, one tested enquiry path, and every account in your name.',
    packages: ['website-launch', 'website-fix', 'care'],
    forWho: [
      'You run a cleaning, salon, maintenance, trades or other service business that meets customers in person',
      'You have no website, or one that is dated, slow on a phone or hard to update',
      'You want people to see your services, your area and how to reach you without having to call first',
    ],
    notFor: 'Online stores, member logins, or sites that need dozens of pages or custom software.',
    steps: [
      {
        title: 'A written scope',
        body: 'The pages, the one enquiry path, what you supply and a dated plan, agreed before any work starts.',
      },
      {
        title: 'What each page must answer',
        body: 'Price or how quotes work, the area you cover, what each service includes, and why someone can trust you. Structure first, design second.',
      },
      {
        title: 'Build for phones first',
        body: 'Plain language, fast pages, readable text, click-to-call, and forms with clear labels and error messages.',
      },
      {
        title: 'Test before launch',
        body: 'The enquiry form end to end, the layout at phone and laptop widths, and an automated accessibility scan. You get the results.',
      },
      {
        title: 'Launch and hand over',
        body: 'Every login in your name, a short guide to editing, and a list of anything still on your side.',
      },
    ],
    asides: [
      // SEO audit Phase 2 (14 Nov 2026): "website redesign toronto". Built only on the Website Launch package.
      {
        id: 'redesign',
        eyebrow: 'Website redesign',
        title: 'Website redesign in Toronto',
        body: 'A redesign makes sense when your site is dated, slow or hard to use on a phone, or doesn’t say what you do, where you work and how to book. It is the same Website Launch package as a new site, priced below. You work with me directly: I’m a freelance web designer in Toronto, so the person you brief is the person who builds and tests your site.',
        items: [
          'It starts with the free check of your current site, so you know what fails today',
          'Up to five pages rebuilt for phones first, with click-to-call and one clear next step on every page',
          'The new site goes live on the domain you already own, with page titles, descriptions, a sitemap and Search Console in your name',
          'One enquiry path tested end to end before launch, with the results handed over',
        ],
        note: 'Writing all your copy from scratch, photography and online stores aren’t included. If most of your site works, a repair (below) costs less, and I’ll say so.',
        cta: { label: 'Ask for a redesign quote', href: '/contact/?package=website-launch#brief' },
      },
      {
        id: 'repair',
        eyebrow: 'Already have a website?',
        title: 'A repair, not a rebuild',
        body: 'If your current site has a usable foundation, a repair fixes one agreed page or one enquiry path and leaves the rest alone. It starts with the free check, which shows what fails today.',
        items: [
          'One agreed page or one enquiry path, named in a written scope before any work starts',
          'Checked at phone width, and the enquiry sent end to end with your permission',
          'Quoted on its own; if a rebuild would cost you less in the long run, I say so and you decide',
        ],
        cta: { label: 'Start with the free check', href: '/contact/?package=check-up#check' },
      },
    ],
    work: ['nest-and-rest-cleaning', 'samp-hair-spa'],
    checklist: {
      title: 'Checked before launch',
      intro: 'The same checks recorded on the case studies, run on every site before it goes live.',
      items: [
        'The enquiry form sends, confirms to the customer and reaches your inbox; a failure keeps what they typed and says what to do',
        'Click-to-call works on a phone',
        'No sideways scrolling at 360, 390, 768 and 1440 pixels wide',
        'An automated accessibility scan (axe, WCAG 2.2 A and AA rules), with anything found fixed or listed openly',
        'Page titles, descriptions and a sitemap in place, and Search Console verified in your name',
      ],
    },
    limits: [
      'Google decides rankings and traffic, so I don’t promise either.',
      'You supply the facts and photos; I edit your text for clarity rather than write everything from scratch.',
      'Two rounds of revisions are included; more are quoted before they start.',
    ],
    costs:
      'Your domain name is billed yearly by your registrar. Hosting and email at your domain are billed by those providers if they charge. Each is named in your scope before you decide.',
    handover: 'A login list, a short “how to edit” guide, the form test results and a list of anything you still need to do.',
    faqs: [
      {
        q: 'Can you fix my current site instead of rebuilding it?',
        a: 'Often, yes. Start with the free check: it shows what fails today. Fixes to an existing site are quoted on their own, without a rebuild.',
      },
      {
        q: 'Who owns the website?',
        a: 'You do. The domain, hosting and every account are in your name. If we stop working together, you keep everything and my access is removed.',
      },
      {
        q: 'What do you build with?',
        a: 'Whatever fits the job: a hand-built site, like Nest & Rest, or a website builder you can edit yourself, like the Samp Hair & Spa preview built with Lovable. Your scope says which, and why.',
      },
      {
        q: 'How long does it take?',
        a: 'Mostly it depends on how quickly your text, photos and feedback arrive. Your written scope includes a dated plan.',
      },
      // Moved from the old /services/ page (SEO audit Phase 2, 14 Nov 2026).
      {
        q: 'What do you need from me?',
        a: 'Your business details, real photos of your work, access to accounts in your name, and short reviews of drafts. Each scope lists exactly what is needed, and when.',
      },
    ],
  },
  {
    slug: 'local-visibility',
    group: 'found',
    short: 'Local SEO',
    name: 'Local SEO and Google Business Profile',
    card: 'One eligible Google Business Profile set up and optimized, your listings made consistent, and a routine for genuine reviews.',
    // SEO audit (14 Nov 2026): 56 characters with " | Mann Patel", so it isn't cut off in results.
    title: 'Local SEO & Google Business Profile Toronto',
    description:
      'Improve your Google presence with eligible profile setup, listing updates and a review workflow. Ask about SEO foundations and an AI search check.',
    eyebrow: 'Local SEO and Google Maps',
    h1: 'Local SEO and Google Business Profile setup in Toronto',
    lines: ['Local SEO and Google Business', 'Profile setup in Toronto'],
    lead: 'Local SEO for small businesses in Toronto that are hard to find on Google or Google Maps, or have few recent reviews: Google Business Profile setup for one eligible profile, your other listings made consistent, and a simple routine for asking every customer for a genuine review. No ranking guarantees.',
    packages: ['local-visibility'],
    forWho: [
      'You meet customers in person, at your address or at theirs, during the hours you post',
      'People can’t find you on Google or Maps, or they find old details',
      'You have few recent reviews and no routine for asking',
    ],
    notFor:
      'Online-only businesses, or a virtual office used only to appear in a neighbourhood. Google’s guidelines don’t allow either, so I check eligibility first.',
    steps: [
      {
        title: 'Eligibility first',
        body: 'Google profiles are for businesses that make in-person contact with customers. Service-area businesses, like cleaners and trades, hide their address and show the area they serve.',
      },
      {
        title: 'A snapshot before anything changes',
        body: 'Your profile, listings and reviews as a customer sees them today, so you can compare afterwards.',
      },
      {
        title: 'Set up or clean up the profile',
        body: 'The right category, your services, hours, service area, real photos, and your contact or booking link.',
      },
      {
        title: 'Make the other listings match',
        body: 'Apple Maps, Bing and Facebook show the same name, number, hours and website. The exact list is named in your scope.',
      },
      {
        title: 'A review routine you can keep',
        body: 'Your review link, a QR review card, one request message for every customer after each job, and reply templates.',
      },
      {
        title: 'Website fixes, in priority order',
        body: 'If your website holds the profile back (an old phone number, no page for a service you list), you get the fixes in priority order. Doing them is quoted on its own or as part of a website package.',
      },
    ],
    asides: [
      {
        id: 'ai-search',
        eyebrow: 'Included in the set-up',
        title: 'AI search visibility check (AEO)',
        body: 'People now ask ChatGPT, Gemini and Perplexity to recommend a local business. I ask each one the same short list of questions a customer might ask, and record what it says about you on a dated sheet. This work is called AEO (answer engine optimization), or sometimes GEO (generative engine optimization): making sure AI answers can find accurate, public facts about your business.',
        items: [
          'Questions customers really ask, answered in plain words on your website, with FAQ and service details marked up so machines can read them',
          'The same questions each time, so a later check can be compared with this one',
          'What each assistant said, whether it linked your website, and which facts it used',
          'The fixes are the ordinary local SEO ones: accurate public details, clear pages and consistent listings',
        ],
        note: 'No one can guarantee what an AI assistant says, or that it mentions you. Answers differ between tools and from one day to the next, so this is a dated check, not a ranking.',
        // SEO audit Phase 4 (14 Nov 2026): the check in full, on its own page.
        cta: { label: 'AI search optimization, in full', href: '/services/ai-search-optimization/' },
      },
    ],
    work: [],
    sample: {
      title: 'Sample: a before-and-after snapshot',
      intro:
        'A sample with a fictional business, so you can see the format. Your snapshot uses your real details, and “after” shows what was set up, not results nobody can promise.',
      rows: [
        { check: 'Primary category', before: 'Cleaning service', after: 'House cleaning service' },
        { check: 'Service area', before: 'Not set; home address shown', after: 'North York and Scarborough; address hidden' },
        { check: 'Hours', before: 'Weekdays only, no holiday hours', after: 'Posted hours and holiday hours set' },
        { check: 'Photos', before: 'Logo only', after: 'Twelve photos of real jobs' },
        { check: 'Website link', before: 'An old social page', after: 'The website’s quote page' },
        { check: 'Apple Maps and Bing', before: 'Old phone number', after: 'Same details as Google' },
        { check: 'Reviews', before: 'No routine; last review months ago', after: 'Review link, QR card and request message in use after every job' },
      ],
    },
    limits: [
      'Google decides rankings. It says local results depend mainly on relevance, distance and prominence, and that you can’t pay for a better local ranking.',
      'Verification is done by Google and can take days or longer.',
      'I never buy reviews, offer rewards for them, or ask only happy customers. Google doesn’t allow any of these.',
    ],
    costs: 'Nothing is required. If you want printed review cards, the printer bills you directly.',
    handover:
      'You own the profile. You get the before snapshot, a list of every change, the review routine on one page and a checklist for keeping details current.',
    faqs: [
      {
        q: 'Can you guarantee I’ll show up in the top three?',
        a: 'No, and you should be wary of anyone who does. Google decides local rankings. This work fixes what you control: accurate details, real photos, and steady, genuine reviews with replies.',
      },
      {
        q: 'I work from home. Can I still have a profile?',
        a: 'Yes, if you meet customers at their location. The profile is set up as a service-area business, with your home address hidden.',
      },
      {
        q: 'Do you buy, swap or filter reviews?',
        a: 'Never. Every customer is asked the same way, and every review gets a reply, including the critical ones.',
      },
      {
        q: 'What happens after the set-up?',
        a: 'You keep the profile, the listings and the routine. If you want ongoing help, the monthly “Stay found” plan (under “Service by service” on this page) covers posts, review reminders and a short report; it is quoted separately.',
      },
      // Moved from the old /services/ page (SEO audit Phase 2, 14 Nov 2026).
      {
        q: 'Can you get us more reviews?',
        a: 'I set up a simple, honest routine for asking every customer, with a review link and QR cards. I never buy, write or swap reviews, and I don’t offer discounts for them: Google forbids any incentive, and Canada’s Competition Bureau treats fake reviews as misleading advertising.',
      },
    ],
    sources: [
      { label: 'Google: how local results are ranked', url: 'https://support.google.com/business/answer/7091?hl=en' },
      { label: 'Google: guidelines for representing your business', url: 'https://support.google.com/business/answer/3038177?hl=en' },
      { label: 'Google: AI features and your website', url: 'https://developers.google.com/search/docs/appearance/ai-features' },
    ],
  },
  {
    slug: 'enquiry-follow-up',
    group: 'answered',
    short: 'Enquiry follow-up',
    name: 'Enquiry follow-up and online booking',
    card: 'Missed-call text-back, form follow-up or an online booking path: one workflow in tools you own, tested and documented.',
    title: 'Enquiry Automation & Online Booking in Toronto',
    description:
      'Set up missed-call text-back, form follow-up or an online booking path with tools you own. Get one scoped workflow, tested and documented.',
    eyebrow: 'Enquiry follow-up and booking',
    h1: 'Enquiry follow-up and online booking for Toronto businesses',
    lines: ['Enquiry follow-up and online booking', 'for Toronto businesses'],
    lead: 'For small businesses that miss calls or messages while they work: missed-call text-back, form follow-up, alerts or an online booking path. One workflow, agreed in writing, set up in tools you own, tested with sample data, and written down so you can pause or change it.',
    packages: ['website-enquiry'],
    forWho: [
      'Calls ring out while you are on a job, and some of those people call someone else',
      'Enquiries arrive by form, email, text and social messages, and some get answered late',
      'People can only book by phone, or forget appointments',
      'You run a salon, spa or other appointment business and want online booking set up with the tool you already use',
    ],
    notFor: 'Custom CRMs, client portals or chatbots. A chatbot needs maintained answers, testing and a way to reach a person; reliable replies come first.',
    steps: [
      {
        title: 'Map how enquiries arrive today',
        body: 'Phone, forms, email and messages: who answers, how long it takes, and where things get lost.',
      },
      {
        title: 'Agree one workflow in writing',
        body: 'For example: every web enquiry gets an instant reply and lands in one list, with a reminder before anyone waits too long. Or missed-call text-back on your business number.',
      },
      {
        title: 'Connect your booking tool',
        body: 'Your booking or quote link on the website and Google profile, with reminders before each appointment.',
      },
      {
        title: 'Test with sample data',
        body: 'Every step, including what happens when a step fails, so a silent failure doesn’t go unnoticed.',
      },
      {
        title: 'Hand over and stay in control',
        body: 'A diagram of the workflow, the test results, what to check each week, and how to pause it.',
      },
    ],
    asides: [
      {
        id: 'options',
        eyebrow: 'Scoped options',
        title: 'Start with one workflow',
        body: 'Each option is small enough to test properly. One workflow and one booking integration are included in Website + Enquiry System; a second is quoted separately.',
        items: [
          'Missed-call text-back: a caller who rings out gets a text from your business number, marked as automatic, with what happens next',
          'Form follow-up: every website enquiry gets an instant reply and lands in one list you check',
          'Alerts: you get an alert when an enquiry has waited too long, or when a step fails',
          'Online booking set-up: your booking or quote link on the website and Google profile, with reminders before each appointment',
        ],
        note: 'A booking request is not a booking. The page says “request” until your booking tool, or you, confirm the appointment.',
      },
    ],
    work: [],
    demo: true,
    testLog: {
      id: 'test-log',
      badge: 'Sample · fictional test log',
      cols: ['Test', 'What should happen', 'Result'],
      title: 'Sample: the test log you get at handover',
      intro:
        'A sample with a fictional business, so you can see the format. Your log records the same kinds of tests on your real set-up, with sample data, including what happens when a step fails.',
      rows: [
        { check: 'A quote request is sent from the website form', before: 'The customer sees a confirmation; the enquiry appears in the list as New', after: 'Passed' },
        { check: 'The text provider can’t be reached', before: 'No silent failure: the owner gets an email alert and the enquiry is marked “Needs a call”', after: 'Passed: handed to the owner' },
        { check: 'The booking link is opened but not finished', before: 'The status stays Request, never Booked', after: 'Passed' },
        { check: 'The booking tool confirms an appointment', before: 'The status changes to Booked only after the booking tool confirms', after: 'Passed' },
        { check: 'The owner pauses the workflow', before: 'No automatic messages go out; the form still delivers', after: 'Passed' },
      ],
    },
    checklist: {
      title: 'When something fails',
      intro: 'Every workflow is built to fail in the open, the same way the forms on this site do.',
      items: [
        'If a form can’t deliver, the visitor is told and keeps what they typed, with another way to reach you',
        'An automatic reply says it is automatic and never pretends to be a person or promises a time you can’t keep',
        'A booking request says it is a request until your booking tool confirms it',
        'Follow-ups go only to people who contacted you, with their consent recorded (Canada’s anti-spam law)',
        'A short weekly checklist helps you notice if enquiries stop arriving',
      ],
    },
    limits: [
      'One booking integration and one workflow are included; a second is quoted separately.',
      'Your team still answers the enquiries; the workflow sends the first reply and reminds you before one is forgotten.',
      'Tools that offer no supported way to connect can’t be connected; I say so in the scope.',
    ],
    costs:
      'Your booking tool’s subscription, if it charges, and phone number and text-message usage if the workflow sends texts. These are billed to you by the provider at their rates, and listed in your scope before you decide.',
    handover: 'A diagram of the workflow, the test results with sample data, what to check each week, and how to pause or change it.',
    faqs: [
      {
        q: 'Do I have to change the tools I use?',
        a: 'No. I connect what you already pay for where it can do the job. If it can’t, I recommend an option and list its cost before you decide.',
      },
      {
        q: 'Will customers know a reply is automatic?',
        a: 'Yes. Automatic messages say who they are from and what happens next, and never pretend to be you typing.',
      },
      {
        q: 'Is a booking request the same as a booking?',
        a: 'No. A request form says it is a request. Only your booking tool, or you, confirms an appointment.',
      },
      {
        q: 'Can I start with just the enquiry part on my current website?',
        a: 'Yes. Start with the free check of your enquiry path; adding a workflow to a website that already works is quoted on its own.',
      },
      // Moved from the old /services/ page (SEO audit Phase 2, 14 Nov 2026).
      {
        q: 'Do you use AI tools?',
        a: 'Yes, for some drafting, design exploration and coding. I review and test everything myself, and I do not paste your private customer information into AI tools without your agreement.',
      },
    ],
  },
];

/**
 * More service pages (SEO audit Phase 4, 14 Nov 2026; Mann chose these two): Website Care and AI search
 * optimization, each a search people make ("website maintenance toronto small business", "ai search optimization
 * toronto"). Same template as the three above, but not one of the three main services: they don't appear in the
 * service lists, the menu or the finder, carry no "Service by service" details, and end with the free check.
 * They sell existing packages only (Website Care; the AI search check is part of Local Visibility Setup).
 */
export const moreServicePages: ServicePage[] = [
  {
    slug: 'website-care',
    group: 'booked',
    short: 'Website care',
    name: 'Website care and maintenance',
    card: 'A monthly test of your enquiry form and booking link, up to 30 minutes of small edits, and a note of what changed.',
    title: 'Small Business Website Maintenance in Toronto',
    description:
      'Website Care, $149 a month: a monthly test enquiry through your form, your booking link checked, up to 30 minutes of edits and a note. Stop any month.',
    eyebrow: 'Website maintenance',
    h1: 'Website maintenance for Toronto small businesses',
    lines: ['Website maintenance', 'for Toronto small businesses'],
    lead: 'For small businesses in Toronto and the GTA that want their website and enquiry form kept working without having to think about it. Every month: a test enquiry through your form, your booking link checked end to end, up to 30 minutes of small edits and a short note. Stop any month.',
    packages: ['care'],
    forWho: [
      'Your website works on launch day, and you want to know it still works next month',
      'A form that quietly stops sending, or a missed renewal, would cost you customers',
      'You’d rather send an email than log in to change your hours, prices or photos',
    ],
    notFor: 'New pages, new features or a redesign: those are quoted as projects before any work starts.',
    steps: [
      {
        title: 'A test enquiry, every month',
        body: 'I send a test through your enquiry form and check it reaches you, with the reply the customer sees. Text-back too, if you have it.',
      },
      {
        title: 'Your booking link, end to end',
        body: 'Opened and followed the way a customer would, to check it still leads somewhere that takes the booking.',
      },
      {
        title: 'Small edits, on request',
        body: 'Up to 30 minutes a month of text, photo, hours and price changes. You email what you need.',
      },
      {
        title: 'Updates and renewals',
        body: 'Updates where your site needs them, and reminders before a renewal date. If something breaks, I tell you what happened and fix it, or quote the fix first.',
      },
      {
        title: 'A short note',
        body: 'What was checked, what changed, and anything that needs your decision, added to a change log you can read.',
      },
    ],
    work: [],
    sample: {
      title: 'Sample: a monthly care note',
      cols: ['Check', 'What was done', 'Result'],
      intro: 'A sample with a fictional business, so you can see the format. Your note covers your real site, dated, every month.',
      rows: [
        { check: 'Test enquiry', before: 'Sent through the quote form', after: 'Reached the inbox; the customer’s confirmation arrived' },
        { check: 'Booking link', before: 'Opened from the website and the Google profile', after: 'Both lead to the booking page' },
        { check: 'Edits', before: 'Holiday hours added, one price changed', after: 'Done, about 15 minutes' },
        { check: 'Updates', before: 'Checked the site for needed updates', after: 'None needed this month' },
        { check: 'Your decision', before: 'The domain renews next month', after: 'Reminder sent; your registrar bills you' },
      ],
    },
    limits: [
      'Up to 30 minutes of small edits a month. New pages or larger changes are quoted before any work starts.',
      'No emergency or after-hours support unless agreed in writing.',
      'I check and fix what I have access to. The access stays in your name: I use a user login, not ownership.',
    ],
    costs: 'Domain, hosting and tool subscriptions stay billed to you directly by each provider.',
    handover:
      'Stop any month: you keep the site, the change log and every login, and my access is removed.',
    faqs: [
      {
        q: 'Do I need Website Care after a new website?',
        a: 'No. Every website I build is handed over with every login in your name and a short editing guide, so you can look after it yourself. Website Care is for owners who would rather not.',
      },
      {
        q: 'What counts as a small edit?',
        a: 'Text, photos, opening hours and prices, up to 30 minutes a month. New pages, new features or a redesign are quoted before any work starts.',
      },
      {
        q: 'What happens if something breaks?',
        a: 'I tell you what happened and fix it, or quote the fix first if it is more than a small repair. The monthly test is there so you hear about a broken form from me, not from a lost customer.',
      },
      {
        q: 'Can I stop?',
        a: 'Any month. You keep the site, the change log and every login, and my access is removed.',
      },
      {
        q: 'How much does website maintenance cost?',
        a: 'Website Care is $149 a month, in Canadian dollars plus tax. Your domain, hosting and any tool subscriptions stay billed to you directly by each provider.',
      },
    ],
  },
  {
    slug: 'ai-search-optimization',
    group: 'found',
    short: 'AI search',
    name: 'AI search optimization (AEO and GEO)',
    card: 'What ChatGPT, Gemini and Perplexity say about your business, checked on a dated sheet, and the public facts they draw on fixed.',
    title: 'AI Search Optimization (AEO & GEO) in Toronto',
    description:
      'See what ChatGPT, Gemini and Perplexity say about your business, then fix the public facts they draw on. Part of Local Visibility Setup, $650 CAD.',
    eyebrow: 'AI search visibility',
    h1: 'AI search optimization for Toronto businesses',
    lines: ['AI search optimization', 'for Toronto businesses'],
    lead: 'People now ask ChatGPT, Gemini and Perplexity to recommend a local business. I check what each one says about yours, record it on a dated sheet, and fix the public facts they draw on: your Google Business Profile, your listings and your website. It is part of Local Visibility Setup, because the fixes are ordinary local SEO done carefully.',
    packages: ['local-visibility'],
    forWho: [
      'People ask an AI assistant for a business like yours, and you don’t know what it says',
      'An assistant has your hours, prices, area or phone number wrong',
      'You want accurate, matching facts about your business everywhere they are published',
    ],
    notFor:
      'Anyone looking for a promised mention or position in AI answers. No one can promise what an AI assistant says, so I show the evidence instead.',
    steps: [
      {
        title: 'The same questions, every time',
        body: 'A short list of questions a customer might ask, put to ChatGPT, Gemini and Perplexity, so a later check can be compared with this one.',
      },
      {
        title: 'A dated record',
        body: 'What each assistant said, whether it linked your website, and which facts it used, on a dated sheet you keep.',
      },
      {
        title: 'Fix the public facts',
        body: 'Your Google Business Profile, Apple Maps, Bing and Facebook made consistent: the same name, number, hours and website.',
      },
      {
        title: 'Website fixes, in priority order',
        body: 'The questions customers really ask, answered in plain words on your website, with your details and FAQs marked up so machines can read them. Doing them is quoted on its own or as part of a website package.',
      },
      {
        title: 'Check again',
        body: 'The same questions asked again later, so you can see what changed, and what didn’t.',
      },
    ],
    work: [],
    sample: {
      title: 'Sample: an AI answers check',
      badge: 'Sample · fictional business',
      cols: ['Question', 'Assistant', 'What it said'],
      intro: 'A sample with a fictional cleaning business, so you can see the format. Your sheet uses your business and the questions your customers ask, dated.',
      rows: [
        { check: 'Who cleans condos in North York and shows prices?', before: 'ChatGPT', after: 'Named two other businesses; the sample business wasn’t mentioned' },
        { check: 'Is the sample business open on Sundays?', before: 'Gemini', after: 'Said yes; its posted hours say closed. A fact to fix at the source' },
        { check: 'House cleaner in Scarborough with good reviews?', before: 'Perplexity', after: 'Mentioned the sample business and linked its website' },
      ],
    },
    limits: [
      'No one can guarantee what an AI assistant says, or that it mentions you. Answers differ between tools and from one day to the next.',
      'Google says its AI features need no special markup: the fixes are accurate public details, clear pages and consistent listings.',
      'The sheet is a record of what each assistant said on the day, not a ranking.',
    ],
    costs: 'Nothing is required beyond what Local Visibility Setup lists. If you want printed review cards, the printer bills you directly.',
    handover:
      'You keep the dated sheet (the questions, each answer, whether it linked your website and which facts it used) and the list of fixes made, so you can repeat the check yourself.',
    faqs: [
      {
        q: 'What are AEO and GEO?',
        a: 'Answer engine optimization and generative engine optimization: making your business easy for AI tools such as ChatGPT, Gemini, Perplexity and Google AI Overviews to find, understand and describe accurately. In practice it is careful local SEO: accurate public details, clear pages and consistent listings.',
      },
      {
        q: 'Can you get my business recommended by ChatGPT?',
        a: 'No one can promise that. What I can do is check what it says now, fix the public facts it draws on, and check again with the same questions, so you can see the difference on a dated sheet.',
      },
      {
        q: 'Is this a separate package?',
        a: 'No. The check is part of Local Visibility Setup ($650), because the fixes are the same local SEO work: your Google Business Profile, your listings and your website.',
      },
      {
        q: 'How often should the check be repeated?',
        a: 'Answers change between tools and from day to day, so one answer means little. Repeating the same questions every month or two, and comparing the dated sheets, shows the trend.',
      },
    ],
    sources: [
      { label: 'Google: AI features and your website', url: 'https://developers.google.com/search/docs/appearance/ai-features' },
      { label: 'Google: how local results are ranked', url: 'https://support.google.com/business/answer/7091?hl=en' },
    ],
  },
];

export const servicePageBySlug = (slug: string) => servicePages.find((p) => p.slug === slug);
export const servicePageForGroup = (group: GroupId) => servicePages.find((p) => p.group === group);

/**
 * Where a single service is described in full (SEO audit Phase 2, 14 Nov 2026): on its area's service page
 * ("Service by service", e.g. /services/enquiry-follow-up/#booking), or on /services/ for the add-ons
 * (#print-design, #social-content, #brand-content). Old /services/#id links forward here (services.astro).
 */
export function serviceHref(id: string): string {
  const s = serviceById(id);
  const page = s ? servicePageForGroup(s.group) : undefined;
  return page ? `/services/${page.slug}/#${id}` : `/services/#${id}`;
}
