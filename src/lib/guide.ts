/**
 * "What does your business need?" — pure recommendation logic.
 * Shared by the client script and unit tests. No prices, no promised results.
 */

export type Stage = 'starting' | 'running';
export type Problem = 'found' | 'enquiries' | 'bookings' | 'unsure';
export type Site = 'none' | 'outdated' | 'ok';

export interface GuideAnswers {
  stage: Stage;
  problem: Problem;
  site: Site;
}

export interface Recommendation {
  packageId: 'website-launch' | 'website-enquiry' | 'local-visibility' | 'care' | 'check-up';
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
      { value: 'found', label: 'Being found and chosen on Google' },
      { value: 'enquiries', label: 'Not missing calls, messages or enquiries' },
      { value: 'bookings', label: 'Turning website visitors into bookings' },
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
const isProblem = (v: unknown): v is Problem => v === 'found' || v === 'enquiries' || v === 'bookings' || v === 'unsure';
const isSite = (v: unknown): v is Site => v === 'none' || v === 'outdated' || v === 'ok';

export function parseAnswers(input: Record<string, unknown>): GuideAnswers | null {
  const { stage, problem, site } = input;
  if (!isStage(stage) || !isProblem(problem) || !isSite(site)) return null;
  return { stage, problem, site };
}

export function recommend({ stage, problem, site }: GuideAnswers): Recommendation {
  if (problem === 'unsure') {
    return {
      packageId: 'check-up',
      serviceIds: ['business-profile', 'reviews', 'missed-calls'],
      headline: 'Start with a free Found & Answered check',
      reasons: [
        'I look you up the way a customer would, and see what happens when a test enquiry arrives. It’s free.',
        'You get a written list of fixes, most important first, before committing to anything bigger.',
      ],
    };
  }

  // Being found: the Google profile and reviews come first, whatever the website.
  if (problem === 'found') {
    return {
      packageId: 'local-visibility',
      serviceIds: site === 'ok' ? ['business-profile', 'reviews', 'listings'] : ['business-profile', 'reviews', 'listings', 'websites'],
      headline: 'Local Visibility Setup fits best',
      reasons: [
        'Correct details and recent, real reviews are what people nearby compare before they call.',
        'Your Google profile, Apple Maps, Bing and what AI assistants say about you are checked and made consistent.',
        site === 'ok'
          ? 'Rankings are decided by Google; this work improves what you control.'
          : 'A clear website helps too: Website Launch can follow, or be quoted together.',
      ],
    };
  }

  // A working website already: improve the path on it rather than rebuilding. The free check
  // finds what fails, and fixes to an existing site are quoted separately.
  if (site === 'ok') {
    return {
      packageId: 'check-up',
      serviceIds: problem === 'enquiries' ? ['missed-calls', 'enquiry-workflows'] : ['booking', 'enquiry-workflows'],
      headline: problem === 'enquiries' ? 'Start with a free check of your enquiry path' : 'Start with a free check of your booking path',
      reasons: [
        'Your site works, so there is no need to rebuild it. I test what happens when a customer enquires or tries to book.',
        'You get a written list of fixes; adding a booking link or a follow-up workflow to your current site is quoted separately.',
      ],
    };
  }

  // No website, or a dated one, and the problem is enquiries or bookings.
  const reasons = [
    'A clear site with one enquiry path, plus your booking tool and one follow-up workflow, set up and tested together.',
    problem === 'enquiries'
      ? 'Every enquiry gets an instant reply and lands in one list, with a reminder before anyone waits too long.'
      : 'A book-or-quote button on every page, with reminders before each appointment to help cut no-shows.',
  ];
  if (site === 'outdated') reasons.push('I would also test your current form first, because dated forms often fail quietly.');
  else if (stage === 'starting') reasons.push('Setting the basics up properly once is easier than fixing them later.');
  return {
    packageId: 'website-enquiry',
    serviceIds: problem === 'enquiries' ? ['websites', 'enquiry-workflows', 'missed-calls'] : ['websites', 'booking', 'enquiry-workflows'],
    headline: 'Website + Enquiry System fits best',
    reasons,
  };
}

/** Builds the contact-page link that pre-fills the brief. */
export function briefHref(rec: Recommendation): string {
  const params = new URLSearchParams({ package: rec.packageId, services: rec.serviceIds.join(',') });
  return `/contact/?${params.toString()}#brief`;
}
