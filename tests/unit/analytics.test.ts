import { beforeEach, describe, expect, it, vi } from 'vitest';

// The measurement ID is a build variable (PUBLIC_GA4_ID). Each test loads the wrapper fresh with
// the ID it needs; "G-TEST" is not a real property and nothing is ever sent anywhere.
const load = async (id: string | undefined) => {
  vi.resetModules();
  vi.doMock('astro:env/client', () => ({ PUBLIC_GA4_ID: id }));
  return import('../../src/scripts/analytics');
};

const store = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
};

let gtag: ReturnType<typeof vi.fn>;
beforeEach(() => {
  gtag = vi.fn();
  vi.stubGlobal('localStorage', store());
  vi.stubGlobal('sessionStorage', store());
  vi.stubGlobal('window', { gtag, dataLayer: [] });
  vi.stubGlobal('document', { createElement: () => ({}), head: { appendChild: () => undefined } });
});

const events = () => gtag.mock.calls.filter((c) => c[0] === 'event');

describe('analytics wrapper (lead tracking, growth report 10 Nov 2026)', () => {
  it('is off without a measurement ID: nothing is sent, even with consent', async () => {
    const a = await load(undefined);
    expect(a.analyticsConfigured()).toBe(false);
    localStorage.setItem('mp-analytics', 'granted');
    a.track('generate_lead', { form_id: 'project_brief' });
    expect(gtag).not.toHaveBeenCalled();
  });

  it('sends nothing before the visitor chooses, or after "No thanks"', async () => {
    const a = await load('G-TEST');
    a.track('generate_lead', { form_id: 'free_check' });
    localStorage.setItem('mp-analytics', 'denied');
    a.track('generate_lead', { form_id: 'free_check' });
    a.trackOnce('lead-1', 'generate_lead', { form_id: 'free_check' });
    expect(events()).toEqual([]);
  });

  it('with consent, a confirmed lead is sent once per lead id, with the right form', async () => {
    const a = await load('G-TEST');
    localStorage.setItem('mp-analytics', 'granted');
    a.trackOnce('lead-1', 'generate_lead', { form_id: 'project_brief', lead_source: 'website' });
    a.trackOnce('lead-1', 'generate_lead', { form_id: 'project_brief', lead_source: 'website' });
    a.trackOnce('lead-2', 'generate_lead', { form_id: 'free_check', lead_source: 'website' });
    expect(events()).toEqual([
      ['event', 'generate_lead', { form_id: 'project_brief', lead_source: 'website' }],
      ['event', 'generate_lead', { form_id: 'free_check', lead_source: 'website' }],
    ]);
  });

  it('clicks are their own events, never leads', async () => {
    const a = await load('G-TEST');
    localStorage.setItem('mp-analytics', 'granted');
    a.track('contact_click', { method: 'whatsapp' });
    a.track('cta_click', { cta: 'free_check', location: 'hero' });
    expect(events().map((c) => c[1])).toEqual(['contact_click', 'cta_click']);
  });
});
