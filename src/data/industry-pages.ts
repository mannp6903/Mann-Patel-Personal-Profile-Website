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
  /** Page title for search results (" | Mann Patel" is added; 47 characters at most). */
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  /** The H1 split into display lines; the last one is set in lime. Must join back to `h1`. */
  lines: string[];
  lead: string;
  /** The case study the page leads with (src/content/work/<id>.md). */
  caseStudy: 'nest-and-rest-cleaning' | 'samp-hair-spa';
  /** One honest sentence on what the case study is. */
  caseIntro: string;
  /** What the case study's website does, each taken from a decision or test in the case study. */
  shows: { title: string; body: string }[];
  /** The package that fits first. */
  packages: PackageId[];
  packageNote: string;
  faqs: Faq[];
  /** The service pages this trade needs most (linked from here, and they link back). */
  services: ('web-design' | 'local-visibility' | 'enquiry-follow-up')[];
}

const price = (id: PackageId) => priceLabel(packageById(id)!).text;

export const industryPages: IndustryPage[] = [
  {
    slug: 'websites-for-cleaning-companies',
    short: 'Cleaning companies',
    linkLabel: 'Websites for cleaning companies',
    title: 'Cleaning Company Website Design in Toronto',
    description:
      'Websites for Toronto cleaning companies: prices up front, the areas you serve and a booking request. See the Nest & Rest case study. From $1,950 CAD.',
    eyebrow: 'For cleaning companies',
    h1: 'Cleaning company website design in Toronto',
    lines: ['Cleaning company website', 'design in Toronto'],
    lead: 'Websites for home and office cleaning companies in Toronto and the GTA that answer what people ask before they book a cleaner: what it costs, whether you come to their area, and who will be in their home. I built one for my own cleaning business, so this page starts there.',
    caseStudy: 'nest-and-rest-cleaning',
    caseIntro:
      'Nest & Rest Cleaning is my own home-cleaning business in Scarborough and North York, not a client. I designed and built its website from scratch. Bookings open in summer 2027, so there are no customers, reviews or results to show yet: what you can see is the website itself, and the tests I ran on it.',
    shows: [
      {
        title: 'The price, first',
        body: 'The first screen shows a real price for the service, home type, bedrooms and bathrooms, without asking for a name, email or phone.',
      },
      {
        title: 'Areas people can believe',
        body: 'Two districts, with neighbourhood pages and a postal-code check. Codes outside the area are declined politely, with a waitlist offer.',
      },
      {
        title: 'What’s included, room by room',
        body: 'One checklist decides what each service includes, what is a paid extra and what isn’t offered, so the price, the service pages and the booking form never disagree.',
      },
      {
        title: 'The owner at the door',
        body: 'With no reviews yet, the proof is the person coming into your home: a photo, a name and “I clean every home myself.”',
      },
    ],
    packages: ['website-launch', 'local-visibility'],
    packageNote: `Website Launch (${price('website-launch')}) covers up to five pages, one quote or booking-request form tested end to end, and search basics. Add Local Visibility Setup (${price('local-visibility')}) to set up your Google Business Profile as a service-area business, with your home address hidden. An instant price calculator like the one on Nest & Rest is outside the five-page boundary, so it is quoted in writing before any work starts.`,
    faqs: [
      {
        q: 'Should a cleaning company show its prices online?',
        a: 'If you can, yes. People choosing a cleaner on their phone want the price, the area and who is coming before they get in touch. Nest & Rest shows a real price on its first screen without asking for contact details. If your prices vary, starting prices or a clear range still help.',
      },
      {
        q: 'I run my cleaning business from home. Can I show up on Google Maps?',
        a: 'Yes, if you clean at your customers’ homes or offices. Your Google Business Profile is set up as a service-area business: your home address is hidden and the areas you serve are shown instead. That is part of Local Visibility Setup.',
      },
      {
        q: 'Can customers book a cleaning online?',
        a: `Website Launch includes one enquiry path, such as a booking-request form that confirms to the customer and reaches your inbox, tested end to end. Connecting a booking tool with reminders, or missed-call text-back, is Website + Enquiry System (${price('website-enquiry')}).`,
      },
      {
        q: 'Have you built websites for other cleaning companies?',
        a: 'Not yet. Nest & Rest Cleaning is my own business, and its website is the one I can show you, with dated screens and the tests I ran on the live site. When I build one for a client, it goes on my work page with the same honest labels.',
      },
      {
        q: 'How much does a cleaning company website cost?',
        a: `Website Launch is ${price('website-launch')} CAD plus tax, and Local Visibility Setup is ${price('local-visibility')}. Your domain, hosting if your host charges for it, and any booking tool are billed to you directly by each provider.`,
      },
    ],
    services: ['web-design', 'local-visibility'],
  },
  {
    slug: 'websites-for-salons-and-spas',
    short: 'Salons and spas',
    linkLabel: 'Websites for salons and spas',
    title: 'Salon & Spa Website Design in Toronto',
    description:
      'Salon and spa websites in Toronto: a menu clients can scan, your real hours and online booking. See the Samp Hair & Spa preview. From $1,950 CAD.',
    eyebrow: 'For salons and spas',
    h1: 'Salon and spa website design in Toronto',
    lines: ['Salon and spa website', 'design in Toronto'],
    lead: 'Websites for hair salons, spas and beauty businesses in Toronto and the GTA: a service menu clients can scan on a phone, your real hours, and online booking set up with the tool you already use. The example is a Scarborough salon and spa whose website I’m building now.',
    caseStudy: 'samp-hair-spa',
    caseIntro:
      'Samp Hair & Spa is a salon and spa in Scarborough, and a client. Its new website is in progress: the preview is online for review, the accessibility findings from my tests are still open, and nothing has launched, so no results are claimed.',
    shows: [
      {
        title: 'Open now, in Toronto time',
        body: 'A live badge shows whether the salon is open and until when, worked out from its real hours, even for a visitor whose computer is set to another time zone.',
      },
      {
        title: 'A menu you can scan',
        body: 'Services in seven groups with starting prices, and a note that prices are confirmed when booking. Where a price isn’t published, it says “Call for pricing”.',
      },
      {
        title: 'Requests, not fake bookings',
        body: 'A three-step appointment request that never claims an appointment is confirmed, with calling always one tap away.',
      },
      {
        title: 'Reputation, honestly',
        body: 'The salon’s public rating and the themes reviewers mention most, with no made-up quotes or names, and stock photos labelled as illustrative.',
      },
    ],
    packages: ['website-enquiry', 'website-launch'],
    packageNote: `For online booking, Website + Enquiry System (${price('website-enquiry')}) connects your booking tool to the website and your Google profile, with reminders before each appointment, plus one follow-up workflow such as missed-call text-back. Website Launch (${price('website-launch')}) is the lighter option: the menu, hours and one tested request form, without a booking integration.`,
    faqs: [
      {
        q: 'Can clients book appointments online from my website?',
        a: 'Yes. Website + Enquiry System connects one booking tool to your website and Google profile, with reminders before each appointment. Until the booking tool confirms an appointment, the site calls it a request, never a booking.',
      },
      {
        q: 'I already use a booking app. Do I have to switch?',
        a: 'No. Online booking is set up with the tool you already use, or I recommend one if you don’t have one yet. Its subscription stays billed to you by the provider.',
      },
      {
        q: 'What about the calls I miss while I’m with a client?',
        a: 'Missed-call text-back is one of the follow-up workflows in Website + Enquiry System: a caller who rings out gets a text from your business number, marked as automatic, saying what happens next. Phone and text-message usage is billed to you by the provider.',
      },
      {
        q: 'Can my website show our reviews?',
        a: 'Yes, honestly: your public rating and the themes reviewers mention most, as on the Samp Hair & Spa preview. No made-up quotes or names, and never bought, swapped or filtered reviews.',
      },
      {
        q: 'How much does a salon website cost?',
        a: `Website + Enquiry System, with online booking and one follow-up workflow, is ${price('website-enquiry')} CAD plus tax. Website Launch, without the booking integration, is ${price('website-launch')}. Your domain, hosting if it charges, and your booking tool are billed to you directly by each provider.`,
      },
    ],
    services: ['web-design', 'enquiry-follow-up'],
  },
];

export const industryPageBySlug = (slug: IndustryPage['slug']) => industryPages.find((p) => p.slug === slug);
/** The industry page that leads with a given case study (linked from that case study). */
export const industryPageForWork = (id: string) => industryPages.find((p) => p.caseStudy === id);
