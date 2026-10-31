import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Work entries. `status` is shown on every card and page:
 * - launched: real and live (or was live; see `statusConfirm`)
 * - concept: original sample, NOT a client project
 * - prototype / in-progress: real but unfinished
 */
const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    status: z.enum(['launched', 'concept', 'prototype', 'in-progress']),
    statusConfirm: z.string().optional(),
    kind: z.string(),
    year: z.string(),
    summary: z.string(),
    role: z.string(),
    roleConfirm: z.string().optional(),
    serviceIds: z.array(z.string()),
    highlights: z.array(z.string()),
    /** Key of a coded mock-up scene (concepts), see src/components/mocks/Scene.astro */
    scene: z.enum(['nest-and-rest', 'samp', 'kettle', 'northline']),
    links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    disclaimer: z.string().optional(),
    description: z.string(),
  }),
});

export const collections = { work };
