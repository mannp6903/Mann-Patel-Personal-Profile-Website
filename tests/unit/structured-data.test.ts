import { describe, expect, it, vi } from 'vitest';

// The structured data for a production build (absolute URLs on). Nothing here is fetched or sent anywhere.
vi.mock('astro:env/client', () => ({ PUBLIC_SITE_URL: 'https://mannpatel.me', PUBLIC_CONTACT_PHONE: undefined }));
vi.mock('astro:env/server', () => ({ SITE_MODE: 'production', SITE_INDEXING: true }));

const { businessJsonLd, offerPrice, packageOffer } = await import('../../src/lib/seo');
const { packages, packageById } = await import('../../src/data/packages');
const { businessSameAs, gbp, logo } = await import('../../src/data/site');

type Offer = Record<string, unknown> & { name: string; itemOffered: { url: string } };

describe('structured data: prices come from src/data/packages.ts (the data /pricing/ shows)', () => {
  const catalog = (businessJsonLd({ withServices: true }) as { hasOfferCatalog: { itemListElement: Offer[] } }).hasOfferCatalog;
  const byName = Object.fromEntries(catalog.itemListElement.map((o) => [o.name, o]));

  it('every published package is an Offer in the business catalogue, in CAD', () => {
    for (const p of packages.filter((x) => x.price.amount !== null)) {
      expect(byName[p.name], p.name).toBeDefined();
      expect(byName[p.name].priceCurrency, p.name).toBe('CAD');
      expect(byName[p.name].itemOffered.url, p.name).toBe(`https://mannpatel.me${p.page}`);
    }
    // Every Offer in the catalogue carries a currency and a price (or a price range).
    for (const o of catalog.itemListElement) {
      expect(o.priceCurrency, o.name).toBe('CAD');
      expect(o.price !== undefined || (o.priceSpecification as { minPrice?: number })?.minPrice !== undefined, o.name).toBe(true);
    }
  });

  it('fixed prices, the Website Fix range and the Website Care monthly price follow the package data', () => {
    for (const id of ['website-launch', 'website-enquiry', 'local-visibility'] as const) {
      const p = packageById(id)!;
      expect(byName[p.name].price, id).toBe(p.price.amount);
    }
    const fix = packageById('website-fix')!;
    expect(byName[fix.name].price).toBeUndefined();
    expect(byName[fix.name].priceSpecification).toMatchObject({ minPrice: fix.price.amount, maxPrice: fix.price.max, priceCurrency: 'CAD' });
    const care = packageById('care')!;
    expect(byName[care.name].price).toBe(care.price.amount);
    expect(byName[care.name].priceSpecification).toMatchObject({ '@type': 'UnitPriceSpecification', unitCode: 'MON', price: care.price.amount });
  });

  it('service and industry pages use the same pricing (one helper)', () => {
    for (const p of packages) expect(packageOffer(p)).toMatchObject({ name: p.name, ...offerPrice(p) });
  });
});

describe('structured data: the business node', () => {
  const biz = businessJsonLd() as Record<string, any>;

  it('has a logo of at least 112 px, on this site', () => {
    expect(biz.logo).toMatchObject({ '@type': 'ImageObject', url: `https://mannpatel.me${logo.src}` });
    expect(Math.min(logo.width, logo.height)).toBeGreaterThanOrEqual(112);
  });

  it('lists the Google Business Profile (the full Maps URL once supplied) and only real profile URLs', () => {
    expect(biz.sameAs).toEqual(businessSameAs);
    expect(biz.sameAs).toContain(gbp.mapsUrl ?? gbp.url);
    for (const u of biz.sameAs) expect(u).toMatch(/^https:\/\//);
  });

  it('names the Google Maps listing as its map once the full Maps URL is supplied (SEO report, 18 Nov 2026)', () => {
    if (gbp.mapsUrl) expect(biz.hasMap).toBe(gbp.mapsUrl);
    else expect(biz.hasMap).toBeUndefined();
  });
});
