/**
 * Tiny analytics wrapper.
 * - Does nothing unless PUBLIC_GA4_ID is set AND the visitor has allowed analytics.
 * - Never receives form contents: callers pass ids and counts only.
 * Event plan: docs/05-launch-and-integrations.md
 */
import { PUBLIC_GA4_ID } from 'astro:env/client';

type Params = Record<string, string | number | boolean>;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = 'mp-analytics';

export function analyticsConfigured(): boolean {
  return Boolean(PUBLIC_GA4_ID);
}

export function getConsent(): 'granted' | 'denied' | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* storage blocked: choice applies to this page view only */
  }
  if (value === 'granted') loadGa();
  window.gtag?.('consent', 'update', { analytics_storage: value });
}

let loaded = false;
export function loadGa() {
  if (loaded || !PUBLIC_GA4_ID) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
  window.gtag('js', new Date());
  window.gtag('config', PUBLIC_GA4_ID, { anonymize_ip: true });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(PUBLIC_GA4_ID)}`;
  document.head.appendChild(s);
}

export function track(name: string, params: Params = {}) {
  if (import.meta.env.DEV) console.info('[analytics]', name, params);
  if (!PUBLIC_GA4_ID || getConsent() !== 'granted') return;
  window.gtag?.('event', name, params);
}

/** Fire an event at most once per key in this browser session (prevents duplicate leads). */
export function trackOnce(key: string, name: string, params: Params = {}) {
  try {
    const k = `mp-sent:${key}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, '1');
  } catch {
    /* ignore */
  }
  track(name, params);
}
