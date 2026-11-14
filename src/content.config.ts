import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { isoDay } from './lib/iso-day';

/**
 * Work entries. `status` is shown on every card and page:
 * - launched: real and live (or was live; see `statusConfirm`)
 * - prototype / in-progress: real but unfinished
 */
const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    /** Page title for search results: says what the work is (the H1 stays the project's name). */
    seoTitle: z.string(),
    order: z.number(),
    status: z.enum(['launched', 'prototype', 'in-progress']),
    statusConfirm: z.string().optional(),
    kind: z.string(),
    year: z.string(),
    summary: z.string(),
    role: z.string(),
    roleConfirm: z.string().optional(),
    serviceIds: z.array(z.string()),
    highlights: z.array(z.string()),
    /** Key of the project's capture set, see src/components/mocks/Scene.astro */
    scene: z.enum(['nest-and-rest', 'samp']),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    description: z.string(),
    /** Summary shown on cards and at the top of the case study (round 7). */
    relationship: z.enum(['Own business', 'Client website']),
    /** Website status, kept separate from whether the business itself is trading. */
    websiteStatus: z.string(),
    businessStatus: z.string().optional(),
    /** When the status and the tests below were last checked (YYYY-MM-DD). */
    checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    roleShort: z.string(),
    problem: z.string(),
    /** Behaviour tested on the real site, with how and the result. Only what was actually run. */
    verification: z
      .array(z.object({ behaviour: z.string(), how: z.string(), result: z.string() }))
      .default([]),
    limitations: z.array(z.string()).default([]),
    outcomes: z.string(),
    /**
     * One line each under the project on /work/ (SEO audit Phase 2, 14 Nov 2026). Taken only from the case
     * study itself: no invented results. Optional so a new project can't show a placeholder.
     */
    industry: z.string().optional(),
    location: z.string().optional(),
    result: z.string().optional(),
    nextStep: z.string(),
  }),
});

/**
 * Guides (SEO audit Phase 3, 14 Nov 2026; docs/seo/PLAN.md B4): /guides/ and /guides/<file name>/.
 * `draft: true` keeps a guide out of production builds, the sitemap and every link; previews and `astro dev`
 * show it with a "Draft" note. Mann publishes one every two weeks: set `draft: false` and `published`.
 * An outline (`outline: true`) can't be published until it is written in full.
 */
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z
    .object({
      /** The H1 and the Article headline. */
      title: z.string(),
      /** Page title for search results (" | Mann Patel" is added, so 47 characters at most). */
      seoTitle: z.string().max(47),
      description: z.string().max(155),
      draft: z.boolean(),
      /** Headings and notes only, not written in full yet. */
      outline: z.boolean().default(false),
      /** YYYY-MM-DD (quoted or not). Required to publish. */
      published: isoDay.optional(),
      /** YYYY-MM-DD, when the guide was last changed after publishing. */
      updated: isoDay.optional(),
      /** The service page the guide leads to (linked from the guide, and it links back). */
      service: z.enum(['/services/web-design/', '/services/local-visibility/', '/services/enquiry-follow-up/']),
      /** Other guides (file names without .md) to link under "Read next", shown only once they are published. */
      related: z.array(z.string()).default([]),
    })
    .refine((g) => g.draft || (!g.outline && g.published), {
      message: 'A published guide (draft: false) needs a published date and must not be an outline.',
    }),
});

export const collections = { work, guides };
