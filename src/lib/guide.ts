/**
 * "What does your business need?" — pure recommendation logic.
 * Shared by the client script and unit tests. No prices, no promised results.
 */

export type Stage = 'starting' | 'running';
export type Problem = 'look' | 'found' | 'enquiries' | 'content' | 'unsure';
export type Site = 'none' | 'outdated' | 'ok';

export interface GuideAnswers {
  stage: Stage;
  problem: Problem;
  site: Site;
}

export interface Recommendation {
  packageId: 'launch' | 'visibility' | 'content-follow-up' | 'check-up';
  serviceIds: string[];
  headline: string;
  reasons: string[];
}

export const questions = [
  {
    name: 'stage',
    legend: 'Where is your business right now?',
    options: [
      { value: 'starting', label: 'Just starting, or about to launch' },
      { value: 'running', label: 'Up and running' },
    ],
  },
  {
    name: 'problem',
    legend: 'What would help most?',
    options: [
      { value: 'look', label: 'Looking as professional online as we are in person' },
      { value: 'found', label: 'Being easier to find on Google' },
      { value: 'enquiries', label: 'Not missing or delaying enquiries' },
      { value: 'content', label: 'Knowing what to post, and posting consistently' },
      { value: 'unsure', label: 'I’m not sure yet' },
    ],
  },
  {
    name: 'site',
    legend: 'Do you have a website now?',
    options: [
      { value: 'none', label: 'No' },
      { value: 'outdated', label: 'Yes, but it’s dated or hard to update' },
      { value: 'ok', label: 'Yes, and it works well' },
    ],
  },
] as const;

const isStage = (v: unknown): v is Stage => v === 'starting' || v === 'running';
const isProblem = (v: unknown): v is Problem =>
  v === 'look' || v === 'found' || v === 'enquiries' || v === 'content' || v === 'unsure';
const isSite = (v: unknown): v is Site => v === 'none' || v === 'outdated' || v === 'ok';

export function parseAnswers(input: Record<string, unknown>): GuideAnswers | null {
  const { stage, problem, site } = input;
  if (!isStage(stage) || !isProblem(problem) || !isSite(site)) return null;
  return { stage, problem, site };
}

export function recommend({ stage, problem, site }: GuideAnswers): Recommendation {
  // No website yet, or just starting: the foundations come first.
  if (site === 'none' || (stage === 'starting' && problem !== 'unsure')) {
    const reasons = [
      site === 'none'
        ? 'Without a website, customers have nowhere reliable to check your services or contact you.'
        : 'Setting the basics up properly once is easier than fixing them later.',
      'It covers a website, professional email, an enquiry form that replies, and Google setup in one scope.',
    ];
    if (problem === 'content') reasons.push('Content planning can follow once the foundation is live.');
    return {
      packageId: 'launch',
      serviceIds: ['websites', 'business-email', 'enquiry-workflows', 'business-profile'],
      headline: 'Start with Business Launch',
      reasons,
    };
  }

  if (problem === 'unsure') {
    return {
      packageId: 'check-up',
      serviceIds: ['seo', 'enquiry-workflows', 'business-profile'],
      headline: 'Start with a website & enquiry check-up',
      reasons: [
        'A short review of your site, your Google information and a test enquiry shows what to fix first.',
        'You get a written list of fixes, most important first, before committing to a bigger project.',
      ],
    };
  }

  if (problem === 'found') {
    return {
      packageId: 'visibility',
      serviceIds: ['seo', 'search-console', 'business-profile', 'analytics'],
      headline: 'Website & Visibility fits best',
      reasons: [
        'Clear page titles, fast pages and accurate Google information help people find and understand you.',
        'Search Console and Analytics show what is happening, so changes are measured rather than guessed.',
        'Rankings are decided by Google; this work improves what you control.',
      ],
    };
  }

  if (problem === 'look') {
    if (site === 'outdated') {
      return {
        packageId: 'visibility',
        serviceIds: ['websites', 'identity', 'seo'],
        headline: 'Website & Visibility, with identity support',
        reasons: [
          'A dated site is often the first thing a new customer sees.',
          'Refreshing key pages with a tidy identity makes the whole business look consistent.',
        ],
      };
    }
    return {
      packageId: 'content-follow-up',
      serviceIds: ['identity', 'social-materials', 'print-digital'],
      headline: 'Content & Follow-up, focused on materials',
      reasons: [
        'Your website works, so the quickest improvement is consistent posts, templates and print pieces.',
        'Editable templates mean you can keep making them yourself.',
      ],
    };
  }

  if (problem === 'enquiries') {
    const reasons = [
      'An instant acknowledgement and an owner notification mean no enquiry waits unseen.',
      'A simple lead list and reminder make it obvious who still needs a reply.',
    ];
    if (site === 'outdated') reasons.push('I would also test your current form, because dated forms often fail quietly.');
    return {
      packageId: 'content-follow-up',
      serviceIds: ['enquiry-workflows', 'integrations', 'business-email'],
      headline: 'Content & Follow-up, focused on enquiries',
      reasons,
    };
  }

  // problem === 'content'
  return {
    packageId: 'content-follow-up',
    serviceIds: ['social-strategy', 'social-materials'],
    headline: 'Content & Follow-up, focused on content',
    reasons: [
      'A plan sized to the time you actually have is easier to keep up than an ambitious one.',
      'Ideas, captions and Reel scripts are ready before you need them.',
    ],
  };
}

/** Builds the contact-page link that pre-fills the brief. */
export function briefHref(rec: Recommendation): string {
  const params = new URLSearchParams({ package: rec.packageId, services: rec.serviceIds.join(',') });
  return `/contact/?${params.toString()}#brief`;
}
