/**
 * Real client reviews and testimonials (SEO audit Phase 2, 14 Nov 2026). Empty until there are real ones:
 * the reviews strip (src/components/ReviewsStrip.astro) renders nothing while this list is empty.
 *
 * Rules (docs/seo/PLAN.md → RULES): only real words from real clients, with their permission to publish,
 * copied exactly. Never invented, paraphrased, bought or swapped. No Review/AggregateRating structured data
 * for Mann's own business. Add a review only with its source and date, so anyone can check it.
 */
export interface Review {
  /** The client's words, exactly as written. */
  quote: string;
  /** Name as the client agreed to show it (for example "Priya S."). */
  name: string;
  /** The client's business, if they agreed to show it. */
  business?: string;
  /** Where the review was given. */
  source: 'Google review' | 'Written testimonial';
  /** When it was given (YYYY-MM-DD). */
  date: string;
  /** A public link to the review, if there is one (for example the Google review). */
  url?: string;
}

export const reviews: Review[] = [];
