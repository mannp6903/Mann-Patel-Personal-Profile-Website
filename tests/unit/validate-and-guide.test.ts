import { describe, it, expect } from 'vitest';
import { validateEnquiry, normaliseWebsite } from '../../src/lib/enquiry/validate';
import { SERVICE_IDS } from '../../src/lib/enquiry/options';
import { services } from '../../src/data/services';
import { packages, checkUp } from '../../src/data/packages';
import { recommend, parseAnswers, briefHref, questions } from '../../src/lib/guide';

const good = {
  name: '  Ada   Lovelace ',
  email: 'ADA@Example.ca',
  message: 'I run a small bakery and need a website that shows our hours.',
  services: ['websites', 'business-profile'],
};

describe('validateEnquiry', () => {
  it('accepts a minimal valid enquiry and normalises whitespace and email case', () => {
    const r = validateEnquiry(good);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBe('Ada Lovelace');
      expect(r.value.email).toBe('ada@example.ca');
      expect(r.value.services).toEqual(['websites', 'business-profile']);
    }
  });

  it('requires name, email and a message of at least 20 characters', () => {
    const r = validateEnquiry({ name: '', email: 'nope', message: 'too short' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(['email', 'message', 'name']);
    }
  });

  it('rejects unknown service, budget and package ids', () => {
    const r = validateEnquiry({ ...good, services: ['hacking'], budget: 'a-million', packageId: 'gold' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['budget', 'packageId', 'services']);
  });

  it('normalises websites and rejects nonsense', () => {
    expect(normaliseWebsite('mybakery.ca')).toBe('https://mybakery.ca/');
    expect(normaliseWebsite('http://x.com/a')).toBe('http://x.com/a');
    expect(normaliseWebsite('localhost')).toBe('');
    const r = validateEnquiry({ ...good, website: 'not a url' });
    expect(r.ok).toBe(false);
  });

  it('accepts a services value sent as a comma list (form posts)', () => {
    const r = validateEnquiry({ ...good, services: 'websites,seo' });
    expect(r.ok && r.value.services).toEqual(['websites', 'seo']);
  });

  it('rejects malformed phone numbers but allows common formats', () => {
    expect(validateEnquiry({ ...good, phone: '(647) 555-0100' }).ok).toBe(true);
    expect(validateEnquiry({ ...good, phone: 'call me maybe' }).ok).toBe(false);
  });
});

describe('content consistency', () => {
  it('every service in the data file is selectable in the form', () => {
    for (const s of services) expect(SERVICE_IDS).toContain(s.id);
  });
  it('every package references real services', () => {
    const ids = services.map((s) => s.id);
    for (const p of [...packages, checkUp]) for (const id of p.serviceIds) expect(ids).toContain(id);
  });
  it('no service copy prices work or promises rankings/leads (exclusions may name them as NOT included)', () => {
    expect(JSON.stringify(services)).not.toMatch(/\$\d/);
    const promises = services
      .flatMap((s) => [s.summary, s.handover, ...s.deliverables])
      .join(' ')
      .toLowerCase();
    expect(promises).not.toMatch(/guarantee|rank (first|#1|top)|more leads|go viral/);
  });
});

describe('guide', () => {
  const allAnswers = () => {
    const [stage, problem, site] = questions.map((q) => q.options.map((o) => o.value));
    const out = [];
    for (const a of stage) for (const b of problem) for (const c of site) out.push({ stage: a, problem: b, site: c });
    return out;
  };

  it('returns a recommendation with real services and reasons for every combination', () => {
    const ids = services.map((s) => s.id);
    for (const ans of allAnswers()) {
      const parsed = parseAnswers(ans);
      expect(parsed).not.toBeNull();
      const rec = recommend(parsed!);
      expect(rec.reasons.length).toBeGreaterThanOrEqual(2);
      for (const id of rec.serviceIds) expect(ids).toContain(id);
      expect(JSON.stringify(rec)).not.toMatch(/\$|guarantee|ROI/i);
    }
  });

  it('sends businesses without a website to Business Launch', () => {
    expect(recommend({ stage: 'running', problem: 'found', site: 'none' }).packageId).toBe('launch');
  });
  it('sends unsure, established owners to the check-up', () => {
    expect(recommend({ stage: 'running', problem: 'unsure', site: 'ok' }).packageId).toBe('check-up');
  });
  it('builds a contact link that pre-fills package and services', () => {
    const href = briefHref(recommend({ stage: 'running', problem: 'enquiries', site: 'ok' }));
    expect(href).toMatch(/^\/contact\/\?package=content-follow-up&services=enquiry-workflows%2Cintegrations%2Cbusiness-email#brief$/);
  });
  it('rejects incomplete or invalid answers', () => {
    expect(parseAnswers({ stage: 'starting', problem: 'found' })).toBeNull();
    expect(parseAnswers({ stage: 'x', problem: 'found', site: 'ok' })).toBeNull();
  });
});
