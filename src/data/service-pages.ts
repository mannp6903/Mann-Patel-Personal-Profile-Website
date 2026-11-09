/**
 * Focused service pages (round 10): /services/web-design/, /services/local-visibility/ and
 * /services/enquiry-follow-up/. One template (src/pages/services/[slug].astro) renders each.
 *
 * Rules: say what is actually delivered, link only to real work with its honest status, label every
 * sample as a sample, and promise nothing Google or a customer decides. Prices come from
 * src/data/packages.ts (shown as "Quoted after your free check" until Mann approves a figure).
 */
import type { GroupId } from './services';
import type { PackageId } from './packages';

export interface Faq {
  q: string;
  a: string;
}

export interface ServicePage {
  slug: 'web-design' | 'local-visibility' | 'enquiry-follow-up';
  /** The matching area on /services/ (its anchor keeps working). */
  group: GroupId;
  /** Short name used in navigation and breadcrumbs. */
  short: string;
  title: string;
  description: string;
  eyebrow: string;
  /** H1 lines; the last one is set in the serif. */
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
  sample?: { title: string; intro: string; rows: { check: string; before: string; after: string }[] };
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
    title: 'Websites for Toronto service businesses',
    description:
      'Clear, fast websites for owner-run service businesses in Toronto: up to five pages, one tested enquiry path, search basics and a written handover. Every account stays in your name.',
    eyebrow: 'Web design',
    lines: ['A clear website,', 'one enquiry path', 'that works.'],
    lead: 'For owner-run service businesses in Toronto, especially North York and Scarborough: pages that answer what people ask before they call, one tested way to reach you, and every account in your name.',
    packages: ['website-launch', 'care'],
    forWho: [
      'You run a cleaning, maintenance, trades or other home-service business, or another business that meets customers in person',
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
    ],
  },
  {
    slug: 'local-visibility',
    group: 'found',
    short: 'Local visibility',
    title: 'Google Business Profile and local visibility in Toronto',
    description:
      'Google Business Profile set-up or clean-up for eligible Toronto service businesses, consistent listings and an honest review routine, with a before-and-after snapshot. No ranking guarantees.',
    eyebrow: 'Local visibility',
    lines: ['Be found on the map,', 'with reviews', 'that are real.'],
    lead: 'For service businesses in Toronto that are hard to find on Google or Maps, or have few recent reviews: one eligible Google profile set up properly, your other listings made consistent, and a simple routine for asking every customer for a review.',
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
        a: 'You keep the profile, the listings and the routine. Ongoing monthly help is available separately if you want it.',
      },
    ],
    sources: [
      { label: 'Google: how local results are ranked', url: 'https://support.google.com/business/answer/7091?hl=en' },
      { label: 'Google: guidelines for representing your business', url: 'https://support.google.com/business/answer/3038177?hl=en' },
    ],
  },
  {
    slug: 'enquiry-follow-up',
    group: 'answered',
    short: 'Enquiry follow-up',
    title: 'Enquiry follow-up and booking for service businesses',
    description:
      'One follow-up workflow for Toronto service businesses: every enquiry answered and listed, with a booking tool connected, tested with sample data and documented so you can pause or change it.',
    eyebrow: 'Enquiry follow-up',
    lines: ['Every enquiry', 'answered, even', 'when you’re on a job.'],
    lead: 'For owners who miss calls or messages while they work: one follow-up workflow, agreed in writing, set up in tools you own, tested with sample data, and written down so you can pause or change it.',
    packages: ['website-enquiry'],
    forWho: [
      'Calls ring out while you are on a job, and some of those people call someone else',
      'Enquiries arrive by form, email, text and social messages, and some get answered late',
      'People can only book by phone, or forget appointments',
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
    work: [],
    demo: true,
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
      'Your team still answers the enquiries; the workflow makes sure none are missed or forgotten.',
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
    ],
  },
];

export const servicePageBySlug = (slug: string) => servicePages.find((p) => p.slug === slug);
export const servicePageForGroup = (group: GroupId) => servicePages.find((p) => p.group === group);
