/**
 * Real screenshots of real projects (no mock-ups), with alt text and dated captions.
 * Keyed by the `scene` field of each work entry (src/content/work/*.md).
 */
import type { ImageMetadata } from 'astro';
import nrDesktop from '../assets/work/nest-and-rest/live-2026-11-08-desktop.png';
import nrMobile from '../assets/work/nest-and-rest/live-2026-11-08-mobile.png';
import nrEarlier from '../assets/work/nest-and-rest/live-2026-10-31-desktop.png';
import nrPrice from '../assets/work/nest-and-rest/detail-2026-11-08-price.png';
import nrSoon from '../assets/work/nest-and-rest/detail-2026-11-08-opening-soon.png';
import nrPostal from '../assets/work/nest-and-rest/detail-2026-11-08-postal-check.png';
import nrOwner from '../assets/work/nest-and-rest/detail-2026-11-08-owner.png';
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
      alt: 'Nest & Rest Cleaning home page on desktop: an “Opening soon” notice above “We clean. You rest.” over a photo of the Toronto skyline and CN Tower at dawn, with a See prices button and a “Your price, in seconds” box showing $116 for a first regular clean.',
      caption: 'Live site on desktop, 1440 px, captured 8 Nov 2026, in “Opening soon” mode.',
    },
    mobile: {
      src: nrMobile,
      alt: 'Nest & Rest Cleaning home page on a phone: an “Opening soon: no bookings yet” bar, the Opening soon notice, “We clean. You rest.” over the Toronto skyline, a See prices button and an Opening soon bar at the bottom.',
      caption: 'Live site on a phone, 360 px, same day.',
    },
    earlier: {
      src: nrEarlier,
      alt: 'Earlier Nest & Rest home page from 31 October 2026: a light hero with “We clean. You rest.”, a postal-code check, an illustrated Toronto skyline and a price estimator card.',
      caption:
        'Earlier version, 31 Oct 2026. A week later: a redesigned, answer-first site with a photo hero, a colour per service, and “Opening soon” mode until bookings open.',
    },
    details: [
      {
        src: nrPrice,
        alt: 'Nest & Rest price box: “Your price, in seconds”, Regular Cleaning for a 1-bedroom, 1-bathroom condo at $116 for the first visit, regular price $145, about 2 hours on site, 20% off for the first 50 households.',
        title: 'Price first',
        note: 'The first screen gives a real price with no contact details asked: service, home type, bedrooms and bathrooms, the regular price and the time on site.',
      },
      {
        src: nrSoon,
        alt: 'Nest & Rest “Opening soon” notice: “I’m still getting Nest & Rest ready, so I’m not taking bookings yet. Have a look around: prices and services are all here.”',
        title: 'Honest about timing',
        note: 'Until launch the site says plainly that it isn’t taking bookings. One setting pauses every form; prices, services and guides stay up so people can see what to expect.',
      },
      {
        src: nrPostal,
        alt: 'Nest & Rest postal-code check: “Do I come to you? Check your postal code” with a Check button.',
        title: 'Do I come to you?',
        note: 'A postal-code check answers the service-area question in one step, for Scarborough and North York only.',
      },
      {
        src: nrOwner,
        alt: 'Nest & Rest owner line with Mann’s photo: “Every clean is done by Mann Patel, the owner. The person at your door runs the business.”',
        title: 'The owner is the brand',
        note: 'With no reviews yet, the proof is the person: Mann’s photo and a promise that he cleans every home himself.',
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
