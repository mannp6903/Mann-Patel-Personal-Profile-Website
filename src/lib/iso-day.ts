import { z } from 'astro/zod';

/**
 * A calendar day as "YYYY-MM-DD" (guide dates, SEO audit Phase 3). YAML reads an unquoted 2026-11-14 as a date
 * (midnight UTC), so both a date and a quoted string are accepted and stored as the same string.
 */
export const isoDay = z
  .union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)])
  .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10)));
