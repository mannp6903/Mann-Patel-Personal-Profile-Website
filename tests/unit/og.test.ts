import { describe, expect, it } from 'vitest';
import { ogCardTitle, ogImagePath, ogSection } from '../../src/lib/og';

describe('per-page sharing images (Nov 2026 audit fixes)', () => {
  it('each page has its own image address, under /og/p/', () => {
    expect(ogImagePath('/')).toBe('/og/p/home.png');
    expect(ogImagePath('/services/web-design/')).toBe('/og/p/services--web-design.png');
    expect(ogImagePath('/guides/how-to-get-recommended-by-chatgpt/')).toBe('/og/p/guides--how-to-get-recommended-by-chatgpt.png');
    expect(ogImagePath('/404')).toBe('/og/p/404.png');
  });

  it('the card shows the page’s own part of its title, never just the site name', () => {
    expect(ogCardTitle('How Much Does a Website Cost in Toronto? | Mann Patel')).toBe('How Much Does a Website Cost in Toronto?');
    expect(ogCardTitle('Mann Patel — Web Design & Local SEO, Scarborough & Toronto')).toBe('Web Design & Local SEO, Scarborough & Toronto');
    // The home title since 16 Nov 2026 (keyword first): the card drops the site name the wordmark already shows.
    expect(ogCardTitle('Web Design & Local SEO in Scarborough, Toronto | Mann Patel')).toBe('Web Design & Local SEO in Scarborough, Toronto');
    expect(ogCardTitle('Contact Mann Patel | Web Design & Local SEO in Toronto')).toBe('Contact Mann Patel');
    expect(ogCardTitle('Vision | Mann Patel, Web Designer in Toronto')).toBe('Vision');
    expect(ogCardTitle('Mann Patel')).toBe('Mann Patel');
  });

  it('the small label names the section only', () => {
    expect(ogSection('/guides/how-much-does-a-website-cost-in-toronto/')).toBe('Guide');
    expect(ogSection('/services/web-design/')).toBe('Service');
    expect(ogSection('/web-design-north-york/')).toBe('Service area');
    expect(ogSection('/')).toBe('');
  });
});
