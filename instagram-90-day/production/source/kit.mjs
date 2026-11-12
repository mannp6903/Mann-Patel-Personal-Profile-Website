// Authoring helpers shared by every post file: labels, end cards, hashtags and recurring cast.
export const DEMO = { text: 'Demo · fictional business', kind: '' };
export const DEMO_DATA = { text: 'Demonstration · fictional data', kind: '' };
export const ILLUS = { text: 'Illustration', kind: 'illus' };
export const REAL = (when) => ({ text: `Real capture · ${when}`, kind: 'real' });
export const SAMPLE = { text: 'Sample · fictional business', kind: '' };

export const CHECK = 'mannpatel.me/contact';
export const CHECK_FULL = 'https://mannpatel.me/contact/?package=check-up#check';

// Recurring fictional cast (labelled on every asset where they appear)
export const CAST = {
  priya: { name: 'Priya', biz: 'Example Cleaning Co.', area: 'Scarborough', sector: 'home cleaning' },
  marco: { name: 'Marco', biz: 'Example Plumbing', area: 'North York', sector: 'plumbing' },
  aisha: { name: 'Aisha', biz: 'Example Salon', area: 'Scarborough', sector: 'hair salon' },
  dev: { name: 'Dev', biz: 'Example Heating & Cooling', area: 'North York', sector: 'HVAC' },
  sam: { name: 'Sam', role: 'customer' },
  lee: { name: 'Lee', role: 'customer' },
};

export const TAGS = {
  base: '#TorontoSmallBusiness #Scarborough #NorthYork',
  web: '#SmallBusinessWebsite #WebDesignToronto',
  seo: '#LocalSEO #GoogleBusinessProfile',
  leads: '#SmallBusinessTips #CustomerService',
  print: '#PrintDesign #SmallBusinessBranding',
  social: '#ContentPlanning #SmallBusinessMarketing',
};
export const tags = (...k) => [TAGS.base, ...k.map((x) => TAGS[x])].join(' ');

// End card for a Reel scene or a last carousel slide
export function end({ lines, sub, cta, next, dur = 4, dir, eyebrow, url, tr }) {
  return { layout: 'end', lines, sub, cta, next, dur, dir, eyebrow, url, tr, meta: false, grain: true };
}
