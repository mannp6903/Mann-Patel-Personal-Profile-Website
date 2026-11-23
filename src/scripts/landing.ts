/**
 * Where an enquiry came from (23 Nov 2026 audit, MEAS-1). On the first page of a visit, remember that page's path and
 * the host of the site that sent the visitor (e.g. "www.google.com"), in this tab's sessionStorage only. The two forms
 * send them with the enquiry (src/lib/enquiry/client.ts → sendEnquiry), so each delivered enquiry says which page the
 * visit started on. Nothing else is stored, nothing is sent anywhere until the visitor sends a form, and nothing is
 * kept after the tab closes.
 */
const KEY = 'mp-landing';

export interface Landing {
  landingPage: string;
  referrerHost: string;
}

function referrerHost(): string {
  try {
    if (!document.referrer) return '';
    const host = new URL(document.referrer).hostname;
    return host === location.hostname ? '' : host;
  } catch {
    return '';
  }
}

/** Records the landing page once per tab (the first page of the visit wins). */
export function recordLanding(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;
    const landing: Landing = { landingPage: location.pathname, referrerHost: referrerHost() };
    sessionStorage.setItem(KEY, JSON.stringify(landing));
  } catch {
    // Storage blocked (private mode, settings): the enquiry is sent without it.
  }
}

/** The recorded landing page and referrer host, or empty strings when unknown. */
export function readLanding(): Landing {
  try {
    const raw = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Partial<Landing>) : {};
    return {
      landingPage: typeof v.landingPage === 'string' ? v.landingPage : '',
      referrerHost: typeof v.referrerHost === 'string' ? v.referrerHost : '',
    };
  } catch {
    return { landingPage: '', referrerHost: '' };
  }
}
