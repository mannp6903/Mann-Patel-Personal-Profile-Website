/**
 * FAQs. `confirm` marks an answer that states something about how Mann works
 * which he has not confirmed yet. The production build refuses to render it.
 *
 * SEO audit Phase 2 (14 Nov 2026): the long /services/ page used to list fifteen questions. Each now lives in
 * one place (docs/seo/PLAN.md, "/services/ inventory"): the five here are the home page's questions;
 * `overviewFaqs` is the question on /services/; questions about one service moved to that service page
 * (src/data/service-pages.ts); questions already answered on /pricing/ or a service page were not repeated.
 */
export interface Faq {
  q: string;
  a: string;
  confirm?: string;
}

export const faqs: Faq[] = [
  {
    q: 'What do you actually do for a local business?',
    a: 'I help customers find you, choose you and book you. That covers five kinds of work: local SEO and Google Business Profile setup, AI search visibility (GEO and AEO) so ChatGPT, Gemini and Google AI Overviews can describe you accurately, websites (new builds, redesigns and single fixes), enquiry follow-up and AI automation such as missed-call text-back and online booking, and website care each month. Print and social content are available as add-ons. Most clients start with the free check and one of these, not all of them.',
  },
  {
    q: 'How much does a website cost?',
    a: 'A new or redesigned website of up to five pages is $1,950. A website with a booking integration and one follow-up workflow is $3,350. One fix on your current site is $450 to $850, local search setup is $650, and care after launch is $149 a month. All prices are in Canadian dollars, plus applicable tax. Domain, hosting and tool subscriptions are billed to you directly by each provider.',
  },
  {
    q: 'What are GEO and AEO, and can you get my business into AI answers?',
    a: 'GEO (generative engine optimization) and AEO (answer engine optimization) mean making your business easy for AI tools such as ChatGPT, Gemini, Perplexity and Google AI Overviews to find, understand and cite. In practice: accurate, matching details on Google, Apple Maps and Bing, clear service pages that answer real customer questions, FAQ and business details marked up with structured data, and reviews that describe your work. I record what each assistant says about you on a dated sheet, before and after. No one can guarantee what an AI tool says or that it recommends you, so I show the evidence rather than promise a result.',
  },
  {
    q: 'What exactly is included for $1,950?',
    a: 'Up to five pages using your text and photos (I edit them for clarity), two rounds of revisions, one tested enquiry path such as a quote form or your booking link, basic search setup and a handover. Writing all your copy from scratch, extra pages and booking integrations are quoted separately, in writing, before any work starts.',
  },
  {
    q: 'How do payments work?',
    a: 'For a website, half is paid at kickoff and half once the site passes the launch checks we agreed in the written scope. Website Care is billed monthly and you can stop any month.',
  },
];

/** The question on /services/ (the page itself answers what the services are). */
export const overviewFaqs: Faq[] = [
  {
    q: 'Where do you work?',
    a: 'I’m based in Scarborough and work with small businesses across Toronto and the GTA, with a focus on Scarborough and North York.',
  },
];
