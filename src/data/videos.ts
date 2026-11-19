/**
 * Demo videos (SEO report follow-up, 19 Nov 2026): one short screen recording per workflow, shown on
 * /services/enquiry-follow-up/ under "Watch it work", each with its transcript on the page and VideoObject structured
 * data (src/lib/seo.ts → videoJsonLd). The section and the structured data appear only while this list has entries.
 *
 * Rules: only real recordings of a real set-up, with fictional or test data on screen (no real customer's name,
 * number or message). The transcript is what the video says, word for word. Nothing here is a result or a review.
 *
 * TODO(Mann): once a video is posted (YouTube, your Google profile or LinkedIn), add it here. Example of the shape:
 *   {
 *     title: 'Missed-call text-back, start to finish',
 *     description: 'A call rings out on a test number and the automatic text arrives.',
 *     url: 'https://www.youtube.com/watch?v=…',
 *     embedUrl: 'https://www.youtube.com/embed/…',
 *     thumbnail: 'https://i.ytimg.com/vi/…/hqdefault.jpg',
 *     duration: 'PT1M',
 *     uploadDate: '2026-11-25',
 *     transcript: 'Word for word, what the video says.',
 *   }
 */
export interface Video {
  /** The video's own title. */
  title: string;
  /** One sentence on what it shows. */
  description: string;
  /** Where it can be watched (for example the YouTube watch page). */
  url: string;
  /** The player address, if the host has one (YouTube: https://www.youtube.com/embed/<id>). */
  embedUrl?: string;
  /** A still from the video. Google needs one to show a video in search results. */
  thumbnail: string;
  /** ISO 8601 duration, for example PT1M or PT1M30S. */
  duration: string;
  /** When it was published (YYYY-MM-DD). */
  uploadDate: string;
  /** What the video says, word for word. Shown on the page. */
  transcript: string;
}

export const videos: Video[] = [];

/** "PT1M30S" → "1:30" (shown next to each title); null if it isn't an ISO 8601 duration under a day. */
export function videoLength(duration: string): string | null {
  const m = duration.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m || !(m[1] || m[2] || m[3])) return null;
  const [h, min, s] = [m[1], m[2], m[3]].map((x) => Number(x ?? 0));
  const total = h * 3600 + min * 60 + s;
  const mm = Math.floor((total % 3600) / 60);
  const ss = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}
