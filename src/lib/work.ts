import { businesses, type Business } from '../data/site';

/**
 * One switch for a business website that can't be reached right now (`siteLive` in
 * src/data/site.ts). While it is false, nothing on this site links out to that address: mentions
 * point at the case study instead, the "Visit" button is hidden and the status says so.
 * Set `siteLive: true` (and re-run `npm run images`) once the address loads again.
 */
const paused = businesses.filter((b) => !b.siteLive);
const pausedFor = (url: string) => paused.find((b) => b.url === url);

/** Where a mention of a business links: its own site, or its case study while that site is unreachable. */
export const businessHref = (b: Business) => (b.siteLive ? b.url : b.caseStudy);

interface ProjectData {
  status: 'launched' | 'in-progress' | 'prototype';
  websiteStatus: string;
  links: { label: string; url: string }[];
}

/** A project's website status and outbound links, with any paused address taken out. */
export function projectSite(d: ProjectData) {
  const business = d.links.map((l) => pausedFor(l.url)).find(Boolean);
  return {
    paused: Boolean(business),
    /** Shown under the summary on the case study while the link is paused. */
    note: business?.pausedNote ?? null,
    websiteStatus: business ? business.pausedStatus : d.websiteStatus,
    links: d.links.filter((l) => !pausedFor(l.url)),
    /** Lime "live" styling only when the site is launched and reachable. */
    live: d.status === 'launched' && !business,
  };
}
