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
    a: 'Every project gets a written quote after a short brief, so you only pay for what your business needs. Third-party costs such as your domain, email subscription, hosting or design tools are billed to you directly by the provider, at their prices.',
  },
  {
    q: 'Do I own the website and accounts?',
    a: 'Yes. Your domain, email, Google accounts, analytics and files are created in your name. I work as an invited user and hand everything over at the end, with a list of every login.',
  },
  {
    q: 'Can you get me to the top of Google?',
    a: 'No one honest can promise that. I can make your pages clear, fast and accurate, set up Search Console and your Business Profile correctly, and show you what to keep doing. Rankings are decided by Google.',
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
    confirm: 'Confirm this describes how you actually work and what you are comfortable stating.',
  },
  {
    q: 'Where do you work?',
    a: 'I work with small businesses in Toronto and the GTA.',
    confirm: 'Confirm the public service area and whether you also take remote clients.',
  },
];
