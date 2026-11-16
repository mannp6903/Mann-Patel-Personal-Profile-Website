/**
 * One client testimonial (Website Playbook, 16 Nov 2026), for src/components/Testimonial.astro. Pure, so the "show
 * nothing without real data" rule can be unit tested.
 *
 * Same rules as src/data/reviews.ts: only a real client's own words, with their permission, copied exactly. Never
 * invented or paraphrased, and no Review/AggregateRating structured data for Mann's own business.
 */
export interface TestimonialInput {
  /** The client's words, exactly as written. */
  quote?: string | null;
  /** The client's full name, as they agreed to show it. */
  name?: string | null;
  /** Their business, if they agreed to show it. */
  business?: string | null;
  /** Their suburb or neighbourhood, e.g. "Agincourt". */
  suburb?: string | null;
  /** A public link to the review (for example their Google review). */
  reviewUrl?: string | null;
}

export interface Testimonial {
  quote: string;
  name: string;
  business: string | null;
  suburb: string | null;
  reviewUrl: string | null;
}

const clean = (v: string | null | undefined) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/** The testimonial to show, or null (show nothing) unless there is both a quote and a name. */
export function testimonialData(input: TestimonialInput | null | undefined): Testimonial | null {
  const quote = clean(input?.quote);
  const name = clean(input?.name);
  if (!quote || !name) return null;
  const url = clean(input?.reviewUrl);
  return {
    quote,
    name,
    business: clean(input?.business),
    suburb: clean(input?.suburb),
    // Only a real web address becomes a link.
    reviewUrl: url && /^https:\/\/[^\s]+$/.test(url) ? url : null,
  };
}
