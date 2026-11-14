/**
 * FAQs. `confirm` marks an answer that states something about how Mann works
 * which he has not confirmed yet. The production build refuses to render it.
 */
export interface Faq {
  q: string;
  a: string;
  confirm?: string;
}

export const faqs: Faq[] = [
  {
    q: 'How much does a website cost?',
    a: 'A new or redesigned website of up to five pages is $1,950. A website with a booking integration and one follow-up workflow is $3,350. One fix on your current site is $450 to $850, local search setup is $650, and care after launch is $149 a month. All prices are in Canadian dollars, plus applicable tax. Domain, hosting and tool subscriptions are billed to you directly by each provider.',
  },
  {
    q: 'What exactly is included for $1,950?',
    a: 'Up to five pages using your text and photos (I edit them for clarity), two rounds of revisions, one tested enquiry path such as a quote form or your booking link, basic search setup and a handover. Writing all your copy from scratch, extra pages and booking integrations are quoted separately, in writing, before any work starts.',
  },
  {
    q: 'How do payments work?',
    a: 'For a website, half is paid at kickoff and half once the site passes the launch checks we agreed in the written scope. Website Care is billed monthly and you can stop any month.',
  },
  {
    q: 'What is the free website and Google check?',
    a: 'I look your business up the way a customer would (Google, Maps, Apple Maps and AI assistants), compare your reviews with nearby competitors, and, with your permission, send a test enquiry and call after hours. You get a short written list of fixes, most important first. It’s free, with no obligation; if you want the fixes done, I quote them separately.',
  },
  {
    q: 'Do I own the website and accounts?',
    a: 'Yes. Your domain, email, Google accounts, analytics and files are created in your name. I work as an invited user and hand everything over at the end: the site, a short editing guide, a list of every login and renewal, and the test results.',
  },
  {
    q: 'Can you get me to the top of Google?',
    a: 'No one honest can promise that. I can make your Google profile complete and accurate, help you earn recent, real reviews, make your pages clear and fast, and show you what to keep doing. Rankings are decided by Google.',
  },
  {
    q: 'Can you get us more reviews?',
    a: 'I set up a simple, honest routine for asking every customer, with a review link and QR cards. I never buy, write or swap reviews, and I don’t offer discounts for them: Google forbids any incentive, and Canada’s Competition Bureau treats fake reviews as misleading advertising.',
  },
  {
    q: 'Do you make flyers, gift cards and social media content?',
    a: 'Yes, as add-ons: flyers, business cards, gift-card artwork, and social content such as posts, Reels, stories, hooks and scripts. They work best alongside your Google profile or website, so every piece points to one booking link. I don’t promise followers or views, and for a brand-new logo I can recommend a designer.',
  },
  {
    q: 'How long does a project take?',
    a: 'It depends on the scope and how quickly content and access arrive. The written scope includes a timeline before any work starts.',
  },
  {
    q: 'What do you need from me?',
    a: 'Your business details, real photos of your work, access to accounts in your name, and short reviews of drafts. Each scope lists exactly what is needed, and when.',
  },
  {
    q: 'What happens after launch?',
    a: 'You get a handover: logins, a short guide, test results and a list of anything you still need to do. Ongoing support is optional, and you can stop at any time.',
  },
  {
    q: 'Do you use AI tools?',
    a: 'Yes, for some drafting, design exploration and coding. I review and test everything myself, and I do not paste your private customer information into AI tools without your agreement.',
  },
  {
    q: 'Where do you work?',
    a: 'I’m based in Toronto and serve Toronto and the GTA, with a focus on Scarborough and North York.',
  },
];
