import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
    nextStep: z.string(),
  }),
});

export const collections = { work };
