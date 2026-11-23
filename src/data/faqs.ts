/**
 * FAQs. `confirm` marks an answer that states something about how Mann works
 * which he has not confirmed yet. The production build refuses to render it.
 *
 * SEO audit Phase 2 (14 Nov 2026): the long /services/ page used to list fifteen questions. Each now lives in
 * one place (docs/seo/PLAN.md, "/services/ inventory"): these are the home page's questions (since 22 Nov 2026,
 * upgrade report R1.1, Home shows the first three: order matters);
 * `overviewFaqs` is the question on /services/; questions about one service moved to that service page
 * (src/data/service-pages.ts); questions already answered on /pricing/ or a service page were not repeated.
 */
export interface Faq {
  q: string;
  a: string;
  /** A link after the answer, to where the detail lives (23 Nov 2026 audit: one fact, one place). */
  link?: { href: string; label: string };
  confirm?: string;
}

/**
 * Home's three questions (23 Nov 2026 SEO audit, copy deck §2.1). Prices, inclusions, payments and AI search are
 * answered once, on /pricing/ and the service pages; Home links there instead of repeating them.
 */
export const faqs: Faq[] = [
  {
    q: 'Do I own the website and accounts?',
    a: 'Yes. Everything is set up in your name from day one.',
  },
  {
    q: 'What isn’t included?',
    a: 'Domain, hosting and booking-tool fees, billed to you directly by each provider.',
    link: { href: '/pricing/#pr-costs', label: 'Full list' },
  },
  {
    q: 'Who does the work?',
    a: 'I do, from the first message to the handover.',
  },
];

/** The question on /services/ (the page itself answers what the services are). */
export const overviewFaqs: Faq[] = [
  {
    q: 'Where do you work?',
    a: 'I’m based in Scarborough and work with small businesses across Toronto and the GTA, with a focus on Scarborough and North York.',
  },
];
