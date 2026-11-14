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

/**
 * Test mode for controlled form tests (Quickstart, 13 Nov 2026): open any page once with
 * `?ga_debug=1` and, for the rest of that browser tab, events are sent with `debug_mode` so they show
 * in GA4 DebugView, and each one is logged to the console. `?ga_debug=0` turns it off.
 */
const DEBUG_KEY = 'mp-ga-debug';
export function debugMode(): boolean {
  try {
    const flag = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('ga_debug');
    if (flag === '1') sessionStorage.setItem(DEBUG_KEY, '1');
    if (flag === '0') sessionStorage.removeItem(DEBUG_KEY);
    return sessionStorage.getItem(DEBUG_KEY) === '1';
  } catch {
    return false;
  }
}

export function track(name: string, params: Params = {}) {
  const debug = debugMode();
  if (import.meta.env.DEV || debug) console.info('[analytics]', name, params);
  // Every successful lead also fires a DOM event, so a browser test can count leads without GA4.
  if (name === 'generate_lead' && typeof document.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
    document.dispatchEvent(new CustomEvent('mp:lead', { detail: { ...params } }));
  }
  if (!PUBLIC_GA4_ID || getConsent() !== 'granted') return;
  window.gtag?.('event', name, debug ? { ...params, debug_mode: true } : params);
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
