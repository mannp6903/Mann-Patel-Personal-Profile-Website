import { describe, expect, it } from 'vitest';
import { canonicalUrl } from '../../src/lib/canonical-url';

describe('canonicalUrl (www and http go to https://mannpatel.me in one hop)', () => {
  it('leaves the canonical address alone', () => {
    expect(canonicalUrl('https://mannpatel.me/')).toBeNull();
    expect(canonicalUrl('https://mannpatel.me/pricing')).toBeNull(); // _redirects adds the slash
  });
  it('sends www to the root domain, keeping path and query', () => {
    expect(canonicalUrl('https://www.mannpatel.me/')).toBe('https://mannpatel.me/');
    expect(canonicalUrl('https://www.mannpatel.me/services/web-design/?utm_source=gbp')).toBe('https://mannpatel.me/services/web-design/?utm_source=gbp');
  });
  it('upgrades http, and adds the trailing slash in the same hop', () => {
    expect(canonicalUrl('http://mannpatel.me/pricing?utm_source=x')).toBe('https://mannpatel.me/pricing/?utm_source=x');
    expect(canonicalUrl('http://www.mannpatel.me/contact')).toBe('https://mannpatel.me/contact/');
  });
  it('keeps file names as they are', () => {
    expect(canonicalUrl('http://www.mannpatel.me/favicon.ico')).toBe('https://mannpatel.me/favicon.ico');
  });
  it('ignores other hosts (previews, workers.dev, local testing)', () => {
    expect(canonicalUrl('http://127.0.0.1:8787/')).toBeNull();
    expect(canonicalUrl('https://mann-patel-website.example.workers.dev/')).toBeNull();
  });
});
