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
    q: 'How much does it cost?',
    a: 'Every project gets a written quote after a short brief, so you only pay for what your business needs. The website and Google check is free, and you don’t need it to get a quote. Third-party costs such as your domain, email subscription, hosting or booking tools are billed to you directly by the provider, at their prices.',
  },
  {
    q: 'What is the free website and Google check?',
    a: 'I look your business up the way a customer would (Google, Maps, Apple Maps and AI assistants), compare your reviews with nearby competitors, and, with your permission, send a test enquiry and call after hours. You get a short written list of fixes, most important first. It’s free, with no obligation; if you want the fixes done, I quote them separately.',
  },
  {
    q: 'Do I own the website and accounts?',
    a: 'Yes. Your domain, email, Google accounts, analytics and files are created in your name. I work as an invited user and hand everything over at the end, with a list of every login.',
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
