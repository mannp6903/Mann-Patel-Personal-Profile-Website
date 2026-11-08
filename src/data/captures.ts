/**
 * Real screenshots of real projects (no mock-ups), with alt text and dated captions.
 * Keyed by the `scene` field of each work entry (src/content/work/*.md).
 */
import type { ImageMetadata } from 'astro';
import nrDesktop from '../assets/work/nest-and-rest/live-2026-10-31-desktop.png';
import nrMobile from '../assets/work/nest-and-rest/live-2026-10-31-mobile.png';
import nrEarlier from '../assets/work/nest-and-rest/archive-2026-10-19-desktop.png';
import nrPrice from '../assets/work/nest-and-rest/detail-price-estimate.png';
import nrPostal from '../assets/work/nest-and-rest/detail-postal-check.png';
import sampDesktop from '../assets/work/samp-hair-spa/preview-2026-10-31-desktop.png';
import sampMobile from '../assets/work/samp-hair-spa/preview-2026-10-31-mobile.png';
import sampType from '../assets/work/samp-hair-spa/detail-type.png';
import sampActions from '../assets/work/samp-hair-spa/detail-actions-mobile.png';

export interface Shot {
  src: ImageMetadata;
  alt: string;
  caption: string;
}
export interface Detail {
  src: ImageMetadata;
  alt: string;
  title: string;
  note: string;
}
export interface CaptureSet {
  url: string;
  /** Accent used behind the captures (taken from the project's own palette). */
  tint: string;
  desktop: Shot;
  mobile: Shot;
  earlier?: Shot;
  details: Detail[];
}

export const captures: Record<'nest-and-rest' | 'samp', CaptureSet> = {
  'nest-and-rest': {
    url: 'https://nestnrestcleaning.com/',
    tint: '#9cc7d8',
    desktop: {
      src: nrDesktop,
      alt: 'Nest & Rest Cleaning home page on desktop: “We clean. You rest.” with a postal-code check, a “Request a clean” button and a “Your price, in seconds” estimator.',
      caption: 'Live site on desktop, 1440 px, captured 31 Oct 2026.',
    },
    mobile: {
      src: nrMobile,
      alt: 'Nest & Rest Cleaning home page on a phone: an Airbnb turnovers banner, the headline, illustrated Toronto skyline and Scarborough Bluffs, and a fixed “Request a clean” bar.',
      caption: 'Live site on a phone, 360 px, same day.',
    },
    earlier: {
      src: nrEarlier,
      alt: 'Earlier Nest & Rest home page from 19 October 2026 with a navy headline and a price estimator card.',
      caption:
        'Earlier version, 19 Oct 2026 (Internet Archive). Two weeks later the site had Airbnb turnovers, a room-by-room checklist, gift cards and neighbourhood pages.',
    },
    details: [
      {
        src: nrPrice,
        alt: 'Nest & Rest price card: Regular Cleaning for a 1-bedroom, 1-bathroom condo shows $116 for the first visit and a regular price of $145, with service, home type, bedroom and bathroom controls and a Choose a preferred day button.',
        title: 'Price first',
        note: 'The home page opens with an instant estimate built from the service, home type, bedrooms and bathrooms. The regular price and the booking terms are visible before any form.',
      },
      {
        src: nrPostal,
        alt: 'Nest & Rest postal-code check: “Do I come to you? Check your postal code” with a Check button, followed by Request a clean and How it works.',
        title: 'Do I come to you?',
        note: 'A postal-code check answers the service-area question in one step, right above the main action.',
      },
    ],
  },
  samp: {
    url: 'https://samp-hair-spa.lovable.app/',
    tint: '#c9a0b4',
    desktop: {
      src: sampDesktop,
      alt: 'Samp Hair & Spa preview on desktop: the headline “Where beauty meets calm.” in an elegant serif, with Book an appointment and phone buttons beside salon photography.',
      caption:
        'Work-in-progress preview on desktop, captured 31 Oct 2026. The preview’s photography is stock, labelled “Illustrative photography” on the site.',
    },
    mobile: {
      src: sampMobile,
      alt: 'Samp Hair & Spa preview on a phone: the salon logo, the headline “Where beauty meets calm.” and a short description of services.',
      caption: 'Same preview on a phone, 360 px.',
    },
    details: [
      {
        src: sampType,
        alt: 'Samp Hair & Spa headline “Where beauty meets calm.” in an elegant serif, with “beauty” in plum italic, under the line Hair · Skin · Spa — Scarborough.',
        title: 'A calm, premium look',
        note: 'Deep plum, blush and an elegant serif set the tone of a salon visit before anyone reads a price.',
      },
      {
        src: sampActions,
        alt: 'Samp Hair & Spa on a phone: a Book an appointment button, a call button, 4.4 stars from about 300 reviews, and an “Open now · until 6:00 PM” badge.',
        title: 'Book, call or check the hours',
        note: 'On a phone, the appointment request and a one-tap call sit together, with the public rating and a live “Open now” badge worked out in Toronto time.',
      },
    ],
  },
};
