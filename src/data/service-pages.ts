/**
 * Focused service pages (round 10): /services/web-design/, /services/local-visibility/ and
 * /services/enquiry-follow-up/, plus Website Care, AI search optimization and website redesign. One template
 * (src/pages/services/[slug].astro) renders each.
 *
 * 23 Nov 2026 (SEO audit copy deck §2.2): every page follows the deck's template, in this order: an opening that says
 * what it is, who it's for and the price; who it's for; one "What you get" list (it replaces both the "Clear boundary,
 * written scope" package block and the "What each part includes" details); how it works in five short steps; at most one
 * next step; three questions. What isn't included and what other providers bill live on /pricing/ only, linked from
 * every page. /services/web-design/ uses the deck's wording; the other five are cut down from their own earlier wording
 * (no new claims).
 *
 * Rules: say what is actually delivered, link only to real work with its honest status, and promise nothing Google or
 * a customer decides. Prices come from src/data/packages.ts.
 */
import { serviceById, type GroupId } from './services';
import { packageById, priceLabel, type PackageId } from './packages';

const price = (id: PackageId) => priceLabel(packageById(id)!).text;

export interface Faq {
  q: string;
  a: string;
}

export interface ServicePage {
  slug: 'web-design' | 'local-visibility' | 'enquiry-follow-up' | 'website-care' | 'ai-search-optimization' | 'website-redesign';
  /** The matching area on /services/ (its anchor keeps working). */
  group: GroupId;
  /** Short name used in navigation and breadcrumbs. */
  short: string;
  /** The plain name of the service, used on cards (the services overview). */
  name: string;
  /** One sentence for those cards. */
  card: string;
  /** Page title for search results (" | Mann Patel" is added). */
  title: string;
  description: string;
  /** The H1 as one sentence: the service and the place (growth report copy map, 10 Nov 2026). */
  h1: string;
  /** The same H1 split into display lines; the last one is set in lime. Must join back to `h1`. */
  lines: string[];
  /** The opening (about 40 words): what it is, who it's for, what it costs. */
  lead: string;
  /** The second action, a text link to the brief with this page's package chosen ("Ask about a website"). */
  ask: string;
  /** The packages this page sells; the first one's price heads "What you get". */
  packages: PackageId[];
  /** "Who it's for": two or three lines, the last saying who it isn't for. */
  forWho: string[];
  /** Overrides the "What you get for $…" heading (e.g. the question people search for). */
  getTitle?: string;
  /** "What you get": the one list of what the price covers on this page. */
  get: string[];
  /** "How it works": five short steps. */
  how: string[];
  /** At most one next step after the steps ("Already have a site?"). */
  next?: { title: string; body: string; link?: { label: string; href: string } };
  /** Real projects (case-study ids) relevant to this service, if any: one line under the opening. */
  work: string[];
  /**
   * SEO report follow-up (19 Nov 2026): show the missed-call calculator (src/components/MissedCallCalculator.astro),
   * the demo line's "Try it" box (only while PUBLIC_DEMO_PHONE is set) and the demo videos (only while
   * src/data/videos.ts has entries).
   */
  proof?: boolean;
  /** Three questions (copy deck §2.2). */
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
    // PRICE-1 (23 Nov 2026 audit, copy deck §3.3): the searcher's words and the published price.
    title: `Small Business Web Design in Toronto, from ${price('website-launch')}`,
    description:
      'Get a mobile-friendly website or redesign with clear service pages, a tested enquiry path and a written handover. See projects and ask for a quote.',
    h1: 'Web design for Toronto small businesses',
    lines: ['Web design', 'for Toronto small businesses'],
    // Copy deck §2.2, word for word.
    lead: `A new website, or a rebuild of one that’s dated or hard to use on a phone. Up to five pages that answer what customers ask before they call, one tested enquiry form, and every account in your name. ${price('website-launch')}, fixed.`,
    ask: 'Ask about a website',
    packages: ['website-launch', 'website-fix', 'care'],
    forWho: [
      'Cleaning, salon, trades and other service businesses that meet customers in person',
      'No website yet, or one that’s slow or hard to use on a phone',
      'Not for online stores, member logins or sites with dozens of pages',
    ],
    get: [
      'Up to five pages (for example Home, Services, About, Contact and one area page)',
      'Built for phones first, with click-to-call and one clear next step on every page',
      'One quote or contact form, tested end to end before launch',
      'Page titles, a sitemap, and Search Console and Analytics set up in your name',
      'Two rounds of revisions',
      'A handover: logins, a short editing guide and the test results',
    ],
    how: ['Short brief', 'Written scope and dated plan', 'Build, with progress you can see', 'Speed, accessibility and enquiry tests, then launch', 'Handover'],
    // KW-1 (23 Nov 2026 audit): the redesign section is now this two-line summary; /services/website-redesign/ is the one
    // page for "website redesign toronto", linked with that anchor text.
    next: {
      title: 'Already have a site?',
      body: `If most of it works, a Website Fix (${price('website-fix')}) repairs one page or one form. If it needs rebuilding, see website redesign.`,
      link: { label: 'Website redesign in Toronto', href: '/services/website-redesign/' },
    },
    work: ['samp-hair-spa', 'nest-and-rest-cleaning'],
    faqs: [
      {
        q: 'How long does it take?',
        a: 'Mostly it depends on how quickly your text, photos and feedback arrive. Your written scope includes a dated plan.',
      },
      {
        q: 'Do you write the text?',
        a: 'I edit the text you supply for clarity. Writing all your copy from scratch is quoted separately, in writing, before any work starts.',
      },
      {
        q: 'Can I edit it myself?',
        a: 'Yes. Every website is handed over with every login in your name and a short editing guide. If you’d rather not, Website Care covers small edits each month.',
      },
    ],
  },
  {
    slug: 'local-visibility',
    group: 'found',
    short: 'Local SEO',
    name: 'Local SEO and Google Business Profile',
    card: 'One eligible Google Business Profile set up and optimized, your listings made consistent, and a routine for genuine reviews.',
    title: `Google Business Profile Setup in Toronto, ${price('local-visibility')}`,
    description:
      'Improve your Google presence with eligible profile setup, listing updates and a review workflow. Ask about SEO foundations and an AI search check.',
    h1: 'Local SEO and Google Business Profile setup in Toronto',
    lines: ['Local SEO and Google Business', 'Profile setup in Toronto'],
    lead: `For Toronto businesses that are hard to find on Google or Maps, or have few recent reviews: one eligible Google Business Profile set up or cleaned up, your other listings made consistent, and a routine for genuine reviews. ${price('local-visibility')}, fixed.`,
    ask: 'Ask about Google setup',
    packages: ['local-visibility'],
    forWho: [
      'You meet customers in person, at your address or at theirs',
      'People can’t find you on Google or Maps, or they find old details',
      'Not for online-only businesses or virtual offices: Google’s guidelines don’t allow them, so I check eligibility first',
    ],
    // K5 (23 Nov 2026 audit): the question people ask, as the heading, answered by the price and the list.
    getTitle: 'How much does it cost to set up a Google Business Profile?',
    get: [
      'An eligibility check first, against Google’s guidelines',
      'Your Google Business Profile set up or cleaned up: category, services, hours, service area, photos and your booking link',
      'Apple Maps, Bing and Facebook details made consistent; the exact list is named in your scope',
      'A review routine: your review link, a QR review card, a request message and reply templates',
      'A check of what ChatGPT, Gemini and Perplexity say about you',
      'A snapshot before any change, and the same checks repeated after',
    ],
    how: ['Eligibility check', 'A snapshot before anything changes', 'Profile set up or cleaned up', 'Other listings made to match', 'Review routine handed over'],
    work: [],
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
        q: 'Can you get us more reviews?',
        a: 'I set up a simple routine for asking every customer, with a review link and QR cards. I never buy, write or swap reviews, or offer discounts for them: Google forbids any incentive.',
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
    name: 'Enquiry follow-up and online booking',
    card: 'Missed-call text-back, form follow-up or an online booking path: one workflow in tools you own, tested and documented.',
    title: 'Missed-Call Text-Back & Online Booking in Toronto',
    description:
      'Set up missed-call text-back, form follow-up or an online booking path with tools you own. Get one scoped workflow, tested and documented.',
    h1: 'Enquiry follow-up and online booking for Toronto businesses',
    lines: ['Enquiry follow-up and online booking', 'for Toronto businesses'],
    lead: `For businesses that miss calls or messages while they work: missed-call text-back, form follow-up or online booking. One workflow, agreed in writing, set up in tools you own and tested with sample data. Website + Booking, ${price('website-enquiry')}, fixed.`,
    ask: 'Ask about booking',
    packages: ['website-enquiry'],
    forWho: [
      'Calls ring out while you’re on a job, and some of those people call someone else',
      'Enquiries arrive by form, email, text and social messages, and some get answered late',
      'Not for custom CRMs, client portals or chatbots',
    ],
    get: [
      'Everything in the Website package',
      'One booking integration: your booking or quote tool connected to the site, with reminders before appointments',
      'One follow-up workflow, agreed in writing first: for example missed-call text-back, or an instant reply to every website enquiry',
      'Every step tested with sample data, including what happens when a step fails',
      'Consent records for follow-up messages, in line with Canada’s anti-spam law',
      'A handover: a diagram of the workflow, the test results, and how to pause or change it',
    ],
    how: ['Map how enquiries arrive today', 'Agree one workflow in writing', 'Connect your booking tool', 'Test with sample data', 'Hand over, with how to pause it'],
    next: {
      title: 'Already have a website that works?',
      body: 'Adding one workflow to it is quoted on its own. Start with the free check of your enquiry path.',
    },
    work: [],
    proof: true,
    faqs: [
      {
        q: 'Will customers know a reply is automatic?',
        a: 'Yes. Automatic messages say who they are from and what happens next, and never pretend to be you typing.',
      },
      {
        q: 'Is a booking request the same as a booking?',
        a: 'No. A request form says it is a request. Only your booking tool, or you, confirms an appointment.',
      },
      {
        q: 'Do I have to change the tools I use?',
        a: 'No. I connect what you already pay for where it can do the job. If it can’t, I recommend an option and list its cost before you decide.',
      },
    ],
  },
];

/**
 * More service pages (SEO audit Phase 4, 14 Nov 2026; Mann chose these two): Website Care and AI search
 * optimization, each a search people make ("website maintenance toronto small business", "ai search optimization
 * toronto"). Same template as the three above, but not one of the three main services: they don't appear in the
 * service lists, the menu or the finder. They sell existing packages only (Website Care; the AI search check is part of
 * Google Listing Setup; the website redesign page, added 16 Nov 2026, is the Website package or Website Fix).
 */
export const moreServicePages: ServicePage[] = [
  {
    slug: 'website-care',
    group: 'booked',
    short: 'Website care',
    name: 'Website care and maintenance',
    card: 'A monthly test of your enquiry form and booking link, up to 30 minutes of small edits, and a note of what changed.',
    title: `Website Maintenance in Toronto, ${price('care')}`,
    description:
      'Website Care, $149 a month: a monthly test enquiry through your form, your booking link checked, up to 30 minutes of edits and a note. Stop any month.',
    h1: 'Website maintenance for Toronto small businesses',
    lines: ['Website maintenance', 'for Toronto small businesses'],
    lead: `For owners who want their website and enquiry form kept working without having to think about it. Every month: a test enquiry, your booking link checked, up to 30 minutes of small edits and a short note. ${price('care')}, stop any month.`,
    ask: 'Ask about Website Care',
    packages: ['care'],
    forWho: [
      'Your website works on launch day, and you want to know it still works next month',
      'You’d rather send an email than log in to change your hours, prices or photos',
      'Not for new pages, new features or a redesign: those are quoted as projects',
    ],
    get: [
      'Every month: a test enquiry through your form, and your booking link checked, end to end',
      'Up to 30 minutes of small edits: text, photos, hours and prices',
      'Updates where your site needs them; if something breaks, I tell you what happened and fix it, or quote the fix first',
      'A short monthly note: what was checked, what changed, and anything that needs your decision',
      'Stop any month: you keep the site, the change log and every login, and my access is removed',
    ],
    how: ['A test enquiry', 'Your booking link checked', 'Small edits on request', 'Updates where needed', 'A short monthly note'],
    work: [],
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
      'See what ChatGPT, Gemini and Perplexity say about your business, then fix the public facts they draw on. Part of Google Listing Setup, $650 CAD.',
    h1: 'AI search optimization for Toronto businesses',
    lines: ['AI search optimization', 'for Toronto businesses'],
    // AI-3 (23 Nov 2026 audit): process, not outcomes, until Mann's own dated AI results pass.
    lead: `People now ask ChatGPT, Gemini and Perplexity to recommend a local business. I check what each one says about yours, record it on a dated sheet, and fix the public facts they draw on. It’s part of Google Listing Setup, ${price('local-visibility')}.`,
    ask: 'Ask about Google setup',
    packages: ['local-visibility'],
    forWho: [
      'People ask an AI assistant for a business like yours, and you don’t know what it says',
      'An assistant has your hours, prices, area or phone number wrong',
      'Not for anyone looking for a promised mention: no one can promise what an AI assistant says, so I show the evidence instead',
    ],
    getTitle: `What you get, as part of Google Listing Setup (${price('local-visibility')})`,
    get: [
      'The same short list of customer questions put to ChatGPT, Gemini and Perplexity',
      'A dated sheet: what each assistant said, whether it linked your website, and which facts it used',
      'Your Google Business Profile, Apple Maps, Bing and Facebook made consistent: the same name, number, hours and website',
      'Website fixes listed in priority order; doing them is quoted separately',
      'The same questions asked again after the changes',
    ],
    how: ['The same questions, every time', 'A dated record', 'Fix the public facts', 'Website fixes, in priority order', 'Check again'],
    work: [],
    faqs: [
      {
        q: 'Is AI search optimization different from local SEO?',
        a: 'Mostly not. AI assistants describe a local business from public facts: its Google Business Profile, its listings, its reviews and its website. Getting those facts right and consistent is local SEO done carefully, plus a dated record of what each assistant says.',
      },
      {
        q: 'Which AI assistants do you check?',
        a: 'ChatGPT, Gemini and Perplexity, with the same questions each time. Google’s AI Overviews draw on Google Search itself, so accurate Google details and clear pages matter there too.',
      },
      {
        q: 'How often should the check be repeated?',
        a: 'Answers change between tools and from day to day, so one answer means little. The set-up includes the check before and after the changes; after that, you can repeat the same questions yourself every month or two with the dated sheet and compare.',
      },
    ],
    sources: [
      { label: 'Google: AI features and your website', url: 'https://developers.google.com/search/docs/appearance/ai-features' },
      { label: 'Google: how local results are ranked', url: 'https://support.google.com/business/answer/7091?hl=en' },
    ],
  },
  {
    // Competitor gap work (16 Nov 2026; "website redesign toronto"). Sells existing packages only: the Website package for a
    // redesign of up to five pages, Website Fix when one problem is the issue. Prices come from src/data/packages.ts.
    // Since the 23 Nov 2026 audit (KW-1) the one page for redesign searches; /services/web-design/ links here.
    // TODO(Mann): if you set up redirects from old page addresses during a redesign, say so in the list here.
    slug: 'website-redesign',
    group: 'booked',
    short: 'Website redesign',
    name: 'Website redesign',
    card: 'A dated or hard-to-use website rebuilt as up to five clear pages, with one tested enquiry path, on the domain you already own.',
    title: 'Website Redesign in Toronto',
    description: `Website redesign for Toronto small businesses: up to five pages rebuilt for phones for ${price('website-launch')} CAD, or one problem fixed for ${price('website-fix')}.`,
    h1: 'Website redesign for Toronto small businesses',
    lines: ['Website redesign', 'for Toronto small businesses'],
    lead: `For small businesses whose website is dated, slow or hard to use on a phone: rebuilt as up to five clear pages with one tested enquiry path, on the domain you already own. ${price('website-launch')}, fixed. If most of your site works, I say so and quote a repair instead.`,
    ask: 'Ask about a redesign',
    packages: ['website-launch', 'website-fix'],
    forWho: [
      'Your website looks dated, or is hard to use on a phone',
      'Customers can’t easily find your services, your area, your prices or how to book',
      'Not for online stores, member logins or sites with dozens of pages',
    ],
    get: [
      'The free check of your current site first, so you know what fails today',
      'Your domain kept, and the words and photos that still work, edited for clarity',
      'Up to five pages rebuilt for phones first, with click-to-call and one clear next step on every page',
      'The new enquiry path tested end to end before the new site replaces the old one',
      'Page titles, descriptions, a sitemap and Search Console in your name, plus every login and a short editing guide',
    ],
    how: ['Free check of your current site', 'Redesign or repair, in writing', 'Keep what still works', 'Test before the switch', 'Launch and hand over'],
    next: {
      title: 'Only one thing broken?',
      body: `If one problem is costing you customers, a Website Fix (${price('website-fix')}) solves it and leaves the rest alone.`,
    },
    work: [],
    faqs: [
      {
        q: 'Do I need a redesign, or just a fix?',
        a: 'Start with the free check: it shows what fails today. If one problem is costing you customers, a fix costs less and I’ll say so. If several pages are hard to use on a phone, or no one can edit the site, I quote a redesign instead, and you decide.',
      },
      {
        q: 'Can I keep my domain and my content?',
        a: 'Yes. The new site goes live on the domain you already own. Text and photos that still work are kept and edited for clarity; writing everything from scratch is quoted separately.',
      },
      {
        q: 'Who owns the redesigned website?',
        a: 'You do. The domain, hosting and every account are in your name, and you get every login at handover. If we stop working together, you keep everything and my access is removed.',
      },
    ],
  },
];

export const servicePageBySlug = (slug: string) => servicePages.find((p) => p.slug === slug);
export const servicePageForGroup = (group: GroupId) => servicePages.find((p) => p.group === group);

/**
 * Where a single service is explained: its area's service page, or /services/ for the add-ons (#print-design,
 * #social-content, #brand-content). Since the 23 Nov 2026 audit the service pages carry one "What you get" list instead
 * of "Service by service" details, so the link goes to the page itself. Old /services/#id links forward here
 * (services.astro).
 */
export function serviceHref(id: string): string {
  const s = serviceById(id);
  const page = s ? servicePageForGroup(s.group) : undefined;
  return page ? `/services/${page.slug}/` : `/services/#${id}`;
}
