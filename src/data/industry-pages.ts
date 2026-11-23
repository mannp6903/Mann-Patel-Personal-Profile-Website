/**
 * Industry pages (SEO audit Phase 3, 14 Nov 2026; docs/seo/PLAN.md B3): /websites-for-cleaning-companies/ and
 * /websites-for-salons-and-spas/. One template renders both (src/components/IndustryPage.astro).
 *
 * Each page leads with its case study, framed honestly (Nest & Rest is Mann's own business, opening summer
 * 2027; Samp Hair & Spa is a client website still in progress), then the package that fits. Every fact about
 * the case studies comes from src/content/work/*.md; prices come from src/data/packages.ts. No invented
 * reviews, clients or results, and no promises Google or a customer decides.
 */
import type { Faq } from './service-pages';
import { packageById, priceLabel, type PackageId } from './packages';

export interface IndustryPage {
  slug: 'websites-for-cleaning-companies' | 'websites-for-salons-and-spas';
  /** Breadcrumb and short link text. */
  short: string;
  /** Link text used on other pages. */
  linkLabel: string;
  /** Page title for search results (" | Mann Patel" is added). */
  title: string;
  description: string;
  h1: string;
  /** The H1 split into display lines; the last one is set in lime. Must join back to `h1`. */
  lines: string[];
  /** The opening: what an owner's customers want to know, in two sentences (copy deck §2.4). */
  lead: string;
  /** "What a … website needs": the heading and its short list. */
  needsTitle: string;
  needs: string[];
  /** The case study the page shows as its example (src/content/work/<id>.md). */
  caseStudy: 'nest-and-rest-cleaning' | 'samp-hair-spa';
  /** The example in one heading and one line (copy deck §2.4). */
  example: { title: string; body: string };
  /** The packages that fit, the first one first; their prices make the "Price" line. */
  packages: PackageId[];
  /** "Price", in one line (copy deck §2.4). */
  priceLine: string;
  /** Three questions. */
  faqs: Faq[];
  /** The service pages this trade needs most (linked from here, and they link back). */
  services: ('web-design' | 'local-visibility' | 'enquiry-follow-up')[];
}

const price = (id: PackageId) => priceLabel(packageById(id)!).text;

/**
 * 23 Nov 2026 (SEO audit copy deck §2.4): the cleaning page in the deck's words, the salon page on the same template
 * from its own earlier wording. The 564-word package block copied from the web design page is gone; inclusions,
 * exclusions and what other providers bill live on /pricing/.
 */
export const industryPages: IndustryPage[] = [
  {
    slug: 'websites-for-cleaning-companies',
    short: 'Cleaning companies',
    linkLabel: 'Websites for cleaning companies',
    // PRICE-1 (23 Nov 2026 audit, copy deck §3.3).
    title: `Cleaning Company Websites in Toronto, from ${price('website-launch')}`,
    description:
      'Websites for Toronto cleaning companies: prices up front, the areas you serve and a booking request. See the Nest & Rest case study. From $1,950 CAD.',
    h1: 'Cleaning company website design in Toronto',
    lines: ['Cleaning company website', 'design in Toronto'],
    lead: 'People booking a cleaner want three answers before they call: what it costs, whether you come to their area, and whether they can trust you. Your website should answer all three on a phone.',
    needsTitle: 'What a cleaning website needs',
    needs: ['A price or a price range', 'The areas you cover', 'What each clean includes', 'Who you are, with a photo', 'A booking or quote request'],
    caseStudy: 'nest-and-rest-cleaning',
    example: {
      title: 'Example: Nest & Rest Cleaning, my own business',
      body: 'Prices, a postal-code check and the owner’s photo on the home page. It’s my own cleaning business, not a client: bookings open in summer 2027.',
    },
    packages: ['website-launch', 'website-enquiry'],
    priceLine: `Website, ${price('website-launch')}; with online booking, ${price('website-enquiry')}.`,
    faqs: [
      {
        q: 'Should a cleaning company show its prices online?',
        a: 'If you can, yes. People choosing a cleaner on their phone want the price, the area and who is coming before they get in touch. Nest & Rest shows a real price on its first screen without asking for contact details. If your prices vary, starting prices or a clear range still help.',
      },
      {
        q: 'I run my cleaning business from home. Can I show up on Google Maps?',
        a: 'Yes, if you clean at your customers’ homes or offices. Your Google Business Profile is set up as a service-area business: your home address is hidden and the areas you serve are shown instead. That is part of Google Listing Setup.',
      },
      {
        q: 'Have you built websites for other cleaning companies?',
        a: 'Not yet. Nest & Rest Cleaning is my own business, and its website is the one I can show you, with dated screens and the tests I ran on the live site. When I build one for a client, it goes on my work page with the same labels.',
      },
    ],
    services: ['web-design', 'local-visibility'],
  },
  {
    slug: 'websites-for-salons-and-spas',
    short: 'Salons and spas',
    linkLabel: 'Websites for salons and spas',
    title: 'Salon Websites with Online Booking in Toronto',
    description:
      'Salon and spa websites in Toronto: a menu clients can scan, your real hours and online booking. See the Samp Hair & Spa preview. From $1,950 CAD.',
    h1: 'Salon and spa website design in Toronto',
    lines: ['Salon and spa website', 'design in Toronto'],
    lead: 'Websites for hair salons, spas and beauty businesses in Toronto and the GTA: a service menu clients can scan on a phone, your real hours, and an appointment request or online booking connected to your booking tool.',
    needsTitle: 'What a salon website needs',
    needs: [
      'A service menu clients can scan on a phone, with starting prices',
      'Your real hours, and whether you’re open now',
      'An appointment request, or online booking connected to your booking tool',
      'Your public rating and what reviewers mention, never made-up quotes',
    ],
    caseStudy: 'samp-hair-spa',
    example: {
      title: 'Example: Samp Hair & Spa, a Scarborough client',
      body: 'A live “open now” badge, a menu in seven groups with starting prices, and a three-step appointment request. The website is in progress: the preview is online for review, and nothing has launched yet.',
    },
    packages: ['website-enquiry', 'website-launch'],
    priceLine: `Website + Booking, ${price('website-enquiry')}; the Website package without online booking, ${price('website-launch')}.`,
    faqs: [
      {
        q: 'Can clients book appointments online from my website?',
        a: 'Yes. Website + Booking connects one booking tool to your website and Google profile, with reminders before each appointment. Until the booking tool confirms an appointment, the site calls it a request, never a booking.',
      },
      {
        q: 'I already use a booking app. Do I have to switch?',
        a: 'Not if it can do the job. I connect the booking tool you already pay for where it can; if it can’t, or you don’t have one yet, I recommend an option and list its cost before you decide. Its subscription stays billed to you by the provider.',
      },
      {
        q: 'What about the calls I miss while I’m with a client?',
        a: 'Missed-call text-back is one of the follow-up workflows in Website + Booking: a caller who rings out gets a text from your business number, marked as automatic, saying what happens next. Phone and text-message usage is billed to you by the provider.',
      },
    ],
    services: ['web-design', 'enquiry-follow-up'],
  },
];

export const industryPageBySlug = (slug: IndustryPage['slug']) => industryPages.find((p) => p.slug === slug);
/** The industry page that leads with a given case study (linked from that case study). */
export const industryPageForWork = (id: string) => industryPages.find((p) => p.caseStudy === id);
