/**
 * "What does your business need?" — pure recommendation logic.
 * Shared by the client script and unit tests. No prices, no promised results.
 */

import { freeCheckShort } from '../data/free-check';

export type Stage = 'starting' | 'running';
export type Problem = 'found' | 'enquiries' | 'bookings' | 'unsure';
export type Site = 'none' | 'outdated' | 'ok';

export interface GuideAnswers {
  stage: Stage;
  problem: Problem;
  site: Site;
}

export interface Recommendation {
  packageId: 'launch' | 'found' | 'answered' | 'website' | 'check-up';
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
  // No website yet, or just starting: the foundations come first.
  if (site === 'none' || (stage === 'starting' && problem !== 'unsure')) {
    return {
      packageId: 'launch',
      serviceIds: ['websites', 'business-profile', 'missed-calls', 'enquiry-workflows'],
      headline: 'Start with Business Launch',
      reasons: [
        site === 'none'
          ? 'Without a website, customers have nowhere reliable to check your services, book or contact you.'
          : 'Setting the basics up properly once is easier than fixing them later.',
        'It covers a website that books work, your Google profile and instant replies to every enquiry in one scope.',
      ],
    };
  }

  if (problem === 'unsure') {
    return {
      packageId: 'check-up',
      serviceIds: ['business-profile', 'reviews', 'missed-calls'],
      headline: 'Start with a free Found & Answered check',
      reasons: [
        `I look you up the way a customer would, and see what happens when a test enquiry arrives. It’s free (${freeCheckShort}).`,
        'You get a written list of fixes, most important first, before committing to anything bigger.',
      ],
    };
  }

  if (problem === 'found') {
    return {
      packageId: 'found',
      serviceIds: site === 'outdated' ? ['business-profile', 'reviews', 'listings', 'seo'] : ['business-profile', 'reviews', 'listings'],
      headline: 'Found & Chosen fits best',
      reasons: [
        'Correct details and recent, real reviews are what people nearby compare before they call.',
        'Your Google profile, Apple Maps, Bing and what AI assistants say about you are checked and made consistent.',
        'Rankings are decided by Google; this work improves what you control.',
      ],
    };
  }

  if (problem === 'enquiries') {
    const reasons = [
      'A missed call gets a polite text straight away, and every enquiry lands in one list with a reminder.',
      'Reminders before appointments help cut no-shows.',
    ];
    if (site === 'outdated') reasons.push('I would also test your current form, because dated forms often fail quietly.');
    return {
      packageId: 'answered',
      serviceIds: ['missed-calls', 'enquiry-workflows', 'booking'],
      headline: 'Never Miss an Enquiry fits best',
      reasons,
    };
  }

  // problem === 'bookings'
  if (site === 'ok') {
    return {
      packageId: 'answered',
      serviceIds: ['booking', 'enquiry-workflows'],
      headline: 'Never Miss an Enquiry, focused on booking',
      reasons: [
        'Your site works, so the quickest win is a booking or quote button customers can use at any hour.',
        'Reminders before each appointment help cut no-shows.',
      ],
    };
  }
  return {
    packageId: 'website',
    serviceIds: ['websites', 'seo', 'booking'],
    headline: 'Website That Books fits best',
    reasons: [
      'A page for each service and a book-or-quote button on every page make it easy for a visitor to say yes.',
      'I would also test your current form, because dated forms often fail quietly.',
    ],
  };
}

/** Builds the contact-page link that pre-fills the brief. */
export function briefHref(rec: Recommendation): string {
  const params = new URLSearchParams({ package: rec.packageId, services: rec.serviceIds.join(',') });
  return `/contact/?${params.toString()}#brief`;
}
