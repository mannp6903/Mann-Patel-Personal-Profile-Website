import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

// The Nest & Rest address is switched off in src/data/site.ts while it can't be reached
// (`siteLive`, growth audit of 10 Nov 2026). These tests follow the switch either way.
const NEST_URL = 'https://nestnrestcleaning.com/';
const NEST_LIVE = /siteLive: true/.test(readFileSync('src/data/site.ts', 'utf8'));
const NEST_STATUS = NEST_LIVE ? 'Website live' : 'Launched Oct 2026 · live link paused';

/** The guides (src/content/guides/): two full drafts and three outlines, all drafts until Mann publishes them. */
const GUIDES = [
  'how-much-does-a-website-cost-in-toronto',
  'google-business-profile-without-a-storefront',
  'how-to-get-recommended-by-chatgpt',
  'missed-call-text-back-for-salons-and-cleaners',
  'why-isnt-my-business-on-google-maps',
];

const PAGES = [
  '/',
  '/services/',
  '/work/',
  '/work/nest-and-rest-cleaning/',
  '/work/samp-hair-spa/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/contact/received/',
  '/services/web-design/',
  '/services/local-visibility/',
  '/services/enquiry-follow-up/',
  '/pricing/',
  '/vision/',
  // SEO audit Phase 3 (14 Nov 2026). The Scarborough page and the guides are drafts: built in previews like
  // this one, never in production (scripts/seo-check.mjs checks the production build).
  '/websites-for-cleaning-companies/',
  '/websites-for-salons-and-spas/',
  '/web-design-scarborough/',
  '/guides/',
  ...GUIDES.map((g) => `/guides/${g}/`),
];

async function noHorizontalOverflow(page: Page) {
  const { scrollW, clientW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  expect(scrollW, 'page should not scroll sideways').toBeLessThanOrEqual(clientW);
}

/** Show everything that reveals on scroll, so checks see the final state. */
const revealAll = (page: Page) =>
  page.evaluate(() => document.querySelectorAll('[data-reveal], [data-split]').forEach((el) => el.classList.add('is-in')));

test.describe('pages', () => {
  for (const path of PAGES) {
    test(`${path} renders one h1, has no console errors and passes axe (WCAG 2.2 A/AA rules)`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
      // Every id is unique (a duplicate silently breaks labels and aria-describedby).
      const dupIds = await page.$$eval('[id]', (els) => {
        const ids = els.map((e) => e.id);
        return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      });
      expect(dupIds, `duplicate ids on ${path}`).toEqual([]);
      await revealAll(page);
      await page.waitForTimeout(1300);
      // Cast: @axe-core/playwright 4.14 types target a newer Playwright than the 1.63 pinned to the preinstalled browsers.
      const axe = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const summary = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
      expect(summary, summary.join('\n')).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test('404 page returns a real 404 status and offers a way back', async ({ page }) => {
    const res = await page.goto('/this-does-not-exist/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('This page wasn’t found.');
    await expect(page.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
  });

  test('every internal link resolves', async ({ page, request }) => {
    const seen = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')!));
      for (const h of hrefs) if (h.startsWith('/')) seen.add(h.split('#')[0]);
    }
    for (const href of seen) {
      const r = await request.get(href);
      expect(r.status(), href).toBe(200);
    }
    expect(seen.size).toBeGreaterThan(10);
  });

  test('every in-page anchor on the home page has a target', async ({ page }) => {
    await page.goto('/');
    const missing = await page.$$eval('a[href^="#"]', (as) =>
      as.map((a) => a.getAttribute('href')!.slice(1)).filter((id) => id && !document.getElementById(id)),
    );
    expect(missing).toEqual([]);
  });

  test('Nest & Rest: links out only while its address loads; otherwise every mention goes to the case study', async ({ page }) => {
    for (const path of ['/', '/about/', '/contact/', '/work/', '/work/nest-and-rest-cleaning/', '/services/web-design/', '/this-page-does-not-exist/']) {
      await page.goto(path);
      const out = page.locator(`a[href="${NEST_URL}"]`);
      if (NEST_LIVE && ['/', '/about/', '/contact/'].includes(path)) await expect(out.first()).toBeAttached();
      if (!NEST_LIVE) {
        await expect(out).toHaveCount(0);
        if (path !== '/this-page-does-not-exist/') await expect(page.locator('a[href="/work/nest-and-rest-cleaning/"]').first()).toBeAttached();
      }
    }
    if (!NEST_LIVE) {
      // The case study says why, keeps its dated evidence, and structured data drops the address.
      await page.goto('/work/nest-and-rest-cleaning/');
      await expect(page.locator('.cs-paused')).toContainText('link to it is paused');
      await expect(page.locator('.cs-head')).not.toContainText('Visit Nest & Rest');
      await page.goto('/');
      const ld = (await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ''))).join(' ');
      expect(ld).not.toContain('nestnrestcleaning.com');
      // 14 Nov 2026 (SEO audit): no worksFor at all; the Person is a Toronto web designer.
      expect(ld).not.toContain('worksFor');
    }
  });

  // The copy map from the growth report (10 Nov 2026), updated by the SEO audit (14 Nov 2026,
  // docs/seo/PLAN.md): each page names its service and the place.
  const COPY: [string, string, string, string][] = [
    ['/', 'Mann Patel | Local SEO, Websites & AI Automation in Toronto', 'Websites and local SEO for Toronto small businesses.', 'Websites, local SEO and Google Business Profile setup for Toronto small businesses. Published prices: websites from $1,950 CAD. Free website check.'],
    ['/services/', 'Website, Local SEO & Booking Services | Mann Patel', 'Website, local SEO and enquiry services', 'Compare web design, local SEO, Google Business Profile setup and enquiry automation for Toronto service businesses. See packages and request a quote.'],
    ['/services/web-design/', 'Toronto Small Business Web Design | Mann Patel', 'Web design for Toronto small businesses', 'Get a mobile-friendly website or redesign with clear service pages, a tested enquiry path and a written handover. See projects and ask for a quote.'],
    ['/services/local-visibility/', 'Local SEO & Google Business Profile Toronto | Mann Patel', 'Local SEO and Google Business Profile setup in Toronto', 'Improve your Google presence with eligible profile setup, listing updates and a review workflow. Ask about SEO foundations and an AI search check.'],
    ['/services/enquiry-follow-up/', 'Enquiry Automation & Online Booking in Toronto | Mann Patel', 'Enquiry follow-up and online booking for Toronto businesses', 'Set up missed-call text-back, form follow-up or an online booking path with tools you own. Get one scoped workflow, tested and documented.'],
    ['/work/', 'Toronto Small Business Website Projects | Mann Patel', 'Website projects for Toronto service businesses', 'See the Nest & Rest Cleaning website case study and Samp Hair & Spa preview, with dated work, project status and documented checks.'],
    ['/pricing/', 'Web Design & Local SEO Pricing in Toronto | Mann Patel', 'What it costs, and what it covers.', 'Published prices in CAD: 5-page website $1,950, website + booking $3,350, fixes $450–$850, local SEO setup $650, care $149/month. Toronto and GTA.'],
    ['/vision/', 'Vision | Mann Patel, Web Designer in Toronto', 'Local businesses do the work. Software should run the rest.', 'What Mann Patel is building: local businesses that do the work while software and AI handle the rest. His ventures, what has shipped, and what comes next.'],
    // SEO audit Phase 3 (14 Nov 2026): one page per search we can win (plan C1, C3, C4).
    ['/websites-for-cleaning-companies/', 'Cleaning Company Website Design in Toronto | Mann Patel', 'Cleaning company website design in Toronto', 'Websites for Toronto cleaning companies: prices up front, the areas you serve and a booking request. See the Nest & Rest case study. From $1,950 CAD.'],
    ['/websites-for-salons-and-spas/', 'Salon & Spa Website Design in Toronto | Mann Patel', 'Salon and spa website design in Toronto', 'Salon and spa websites in Toronto: a menu clients can scan, your real hours and online booking. See the Samp Hair & Spa preview. From $1,950 CAD.'],
    ['/web-design-scarborough/', 'Web Design in Scarborough, Ontario | Mann Patel', 'Web design in Scarborough, Ontario', 'Web designer based in Scarborough, Ontario: websites, Google Business Profile setup and online booking for local small businesses, with published prices.'],
  ];
  test('search copy: titles, H1s and descriptions name the service and the place', async ({ page }) => {
    for (const [path, title, h1, description] of COPY) {
      await page.goto(path);
      expect(await page.title(), path).toBe(title);
      expect((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim(), path).toBe(h1);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    }
    // Case-study titles describe the work; the H1 stays the project's name.
    await page.goto('/work/nest-and-rest-cleaning/');
    expect(await page.title()).toBe('Nest & Rest Cleaning Website Case Study | Mann Patel');
    await expect(page.locator('h1')).toHaveText('Nest & Rest Cleaning');
    await page.goto('/work/samp-hair-spa/');
    expect(await page.title()).toBe('Samp Hair & Spa Website Preview | Mann Patel');
    // Every page has its own title and description.
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      titles.add(await page.title());
      descriptions.add((await page.locator('meta[name="description"]').getAttribute('content'))!);
    }
    expect(titles.size).toBe(PAGES.length);
    expect(descriptions.size).toBe(PAGES.length);
  });

  test('structured data: one Person with a stable id, a WebSite on the home page, services that point to him', async ({ page }) => {
    const graph = async (path: string) => {
      await page.goto(path);
      const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => JSON.parse(x.textContent || '{}')));
      return { blocks, text: JSON.stringify(blocks) };
    };
    const home = await graph('/');
    const person = home.blocks.find((b) => b['@type'] === 'Person');
    const site = home.blocks.find((b) => b['@type'] === 'WebSite');
    expect(person['@id']).toMatch(/\/#person$/);
    expect(person.name).toBe('Mann Patel');
    expect(site['@id']).toMatch(/\/#website$/);
    expect(site.name).toBe('Mann Patel');
    expect(site.publisher['@id']).toBe(person['@id']);
    // 14 Nov 2026 (SEO audit): one business entity (ProfessionalService "Mann Patel") with the phone,
    // a city-level address only, the areas served and the Google Business Profile; Mann is its founder.
    const biz = home.blocks.find((b) => b['@type'] === 'ProfessionalService');
    expect(biz['@id']).toMatch(/\/#business$/);
    expect(biz.name).toBe('Mann Patel');
    expect(biz.telephone).toBe('+1-647-978-6903');
    expect(biz.email).toBe('info@mannpatel.me');
    expect(biz.founder['@id']).toBe(person['@id']);
    expect(biz.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Scarborough', addressRegion: 'ON', addressCountry: 'CA' });
    expect(JSON.stringify(biz.areaServed)).toMatch(/Scarborough.*North York.*Toronto/);
    expect(biz.priceRange).toBe('$149–$3,350 CAD');
    expect(biz.sameAs).toContain('https://maps.app.goo.gl/dYccTa9jQJczpeac6');
    expect(home.text).not.toMatch(/worksFor|streetAddress|postalCode|AggregateRating|"Review"/);
    const contactBiz = (await graph('/contact/')).blocks.find((b) => b['@type'] === 'ProfessionalService');
    expect(contactBiz.telephone).toBe('+1-647-978-6903');
    expect(home.text).not.toContain('ProfilePage');
    const about = await graph('/about/');
    const profilePage = about.blocks.find((b) => b['@type'] === 'ProfilePage');
    expect(profilePage.mainEntity['@id']).toBe(person['@id']);
    for (const slug of ['web-design', 'local-visibility', 'enquiry-follow-up']) {
      const svc = (await graph(`/services/${slug}/`)).blocks.find((b) => b['@type'] === 'Service');
      expect(svc.provider['@id']).toBe(biz['@id']);
      expect(JSON.stringify(svc.areaServed)).toContain('Toronto');
    }
  });

  test('analytics stays off until a measurement ID is set: no banner and no requests to Google', async ({ page }) => {
    const google: string[] = [];
    page.on('request', (r) => /google-analytics|googletagmanager/.test(r.url()) && google.push(r.url()));
    for (const path of ['/', '/contact/?package=check-up#check']) {
      await page.goto(path);
      await page.waitForTimeout(400);
      await expect(page.locator('[data-consent]')).toHaveCount(0);
    }
    expect(google).toEqual([]);
    // The hero is a named place, so a click on its free-check button can be told apart from the footer's.
    await page.goto('/');
    await expect(page.locator('section#hero a[href="/contact/?package=check-up#check"]')).toHaveCount(1);
  });

  test('robots.txt blocks indexing on previews', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Disallow: /');
  });

  test('structured data is valid JSON and makes no rating or address claims', async ({ page }) => {
    for (const path of ['/', '/services/', '/about/', '/services/web-design/', '/services/local-visibility/', '/services/enquiry-follow-up/', '/pricing/', '/websites-for-cleaning-companies/', '/websites-for-salons-and-spas/', '/web-design-scarborough/', `/guides/${GUIDES[0]}/`]) {
      await page.goto(path);
      const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ''));
      expect(blocks.length).toBeGreaterThan(0);
      // No rating, review, street address, postal code or award properties (the words may appear in answers,
      // e.g. "home address hidden"). Since 14 Nov 2026 the business has a city-level address only (Mann's decision).
      for (const b of blocks) {
        const json = JSON.stringify(JSON.parse(b));
        expect(json).not.toMatch(/"(aggregateRating|review|streetAddress|postalCode|award)":/i);
        for (const m of json.matchAll(/"address":(\{[^}]*\})/g))
          expect(Object.keys(JSON.parse(m[1])).sort()).toEqual(['@type', 'addressCountry', 'addressLocality', 'addressRegion']);
      }
      if (path === '/' || path === '/services/') expect(blocks.join(' ')).toContain('"OfferCatalog"');
      if (path.startsWith('/services/') && path !== '/services/') expect(blocks.join(' ')).toContain('"Service"');
      // No price in structured data unless the page shows one.
      const shown = await page.locator('[data-price]').allInnerTexts();
      if (shown.every((t) => !/\$\s?\d/.test(t))) expect(blocks.join(' ')).not.toMatch(/"price"/);
    }
  });
});

test.describe('layout', () => {
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    test(`no sideways scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [...PAGES, '/this-does-not-exist/']) {
        await page.goto(path);
        await noHorizontalOverflow(page);
      }
    });
  }

  test('text enlarged to 200% still reflows without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const path of ['/', '/services/', '/contact/']) {
      await page.goto(path);
      await page.addStyleTag({ content: 'html{font-size:200% !important}' });
      await noHorizontalOverflow(page);
    }
  });

  for (const [w, h] of [
    [390, 844],
    [768, 1024],
    [1440, 900],
  ]) {
    test(`the service-led H1 and the free-check button are visible without scrolling at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      // The H1 names the service and the place (growth report, 10 Nov 2026); the slogan moved to the process strip.
      const h1 = page.locator('h1');
      expect((await h1.innerText()).replace(/\s+/g, ' ').trim()).toBe('Websites and local SEO for Toronto small businesses.');
      await expect(h1).toBeInViewport();
      const hero = page.locator('.hero');
      // 14 Nov 2026: who you're dealing with comes first (round 3: no small face; the photo is the graph's core).
      await expect(hero.locator('.hero__hi')).toHaveText('Hi, I’m Mann Patel.');
      await expect(hero.locator('.hero__face')).toHaveCount(0);
      const cta = hero.getByRole('link', { name: 'Get a free website and Google check' });
      await expect(cta).toBeInViewport();
      await expect(cta).toHaveAttribute('href', '/contact/?package=check-up#check');
      await expect(hero.getByRole('link', { name: 'See prices' })).toHaveAttribute('href', '/pricing/');
      await expect(hero.locator('.hero__price')).toContainText('$1,950 website');
      // 14 Nov 2026 (founder profile): the hero names only the three core services.
      await expect(hero.locator('.hero__services li')).toHaveCount(3);
      for (const name of ['Local SEO & AI search', 'Enquiry follow-up & booking', 'Websites'])
        await expect(hero.locator('.hero__services')).toContainText(name);
      await expect(hero.locator('.hero__price')).toBeInViewport();
      // Dated examples of real work sit next to the buttons (Quickstart, 13 Nov 2026).
      await expect(hero.locator('.hero__recent a[href="/work/samp-hair-spa/"]')).toContainText('Oct 2026');
      await expect(hero.locator('.hero__recent a[href="/work/nest-and-rest-cleaning/"]')).toContainText('Oct 2026');
      // The two actions sit side by side, in this order.
      const actions = await hero.locator('.hero__actions .btn-row a').evaluateAll((els) => els.map((e) => e.textContent!.replace(/\s+/g, ' ').trim()));
      expect(actions[0]).toContain('Get a free website and Google check');
      expect(actions[1]).toContain('See prices');
    });
  }

  // Acceptance targets from the 8 Nov 2026 audit: real work comes straight after a compact hero.
  // Round 8 added the tuner (dial and caption) to the phone hero, so the phone target moved down
  // by its height; on desktop the tuner sits beside the copy and nothing moved.
  // 10 Nov 2026 (growth report): the hero gained the explained Found / Answered / Booked strip
  // and a "See the work" button, so the targets moved down by the strip's height.
  for (const [w, h, maxHeading, maxCard] of [
    // 14 Nov 2026: the hero carries the photo graph and prices instead; same budgets on desktop,
    // and on phones the large photo graph replaces the sculpture and the process strip.
    [1440, 1000, 1150, 1500],
    // 14 Nov 2026 (round 2): the phone hero now names every service, so it moved down about 100 px.
    [390, 844, 1900, 2050],
  ]) {
    test(`selected work starts by y=${maxHeading} at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const pos = await page.evaluate(() => ({
        heading: document.getElementById('work-title')!.getBoundingClientRect().top + scrollY,
        card: document.querySelector('#work article')!.getBoundingClientRect().top + scrollY,
      }));
      expect(pos.heading).toBeLessThanOrEqual(maxHeading);
      expect(pos.card).toBeLessThanOrEqual(maxCard);
    });
  }
});

test.describe('navigation', () => {
  test('phone menu opens as a dialog, closes with Escape and returns focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const btn = page.locator('[data-menu-open]');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await btn.click();
    const sheet = page.locator('#site-menu');
    await expect(sheet).toBeVisible();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(sheet.getByRole('navigation', { name: 'Menu' }).getByRole('link')).toHaveCount(6);
    await expect(sheet.getByRole('link', { name: 'Pricing', exact: true })).toHaveAttribute('href', '/pricing/');
    await expect(sheet.getByRole('link', { name: 'Vision', exact: true })).toHaveAttribute('href', '/vision/');
    await expect(sheet.locator('a[href="/contact/"]')).toHaveCount(1);
    await expect(sheet.getByRole('link', { name: /Email Mann/ })).toHaveAttribute('href', /^mailto:info@mannpatel\.me\?/);
    await expect(sheet.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(sheet.locator('a[href="/terms/"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
  });

  test('phone menu dismisses from the backdrop and marks the current page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/services/');
    const btn = page.locator('[data-menu-open]');
    await btn.click();
    const sheet = page.locator('#site-menu');
    await expect(sheet.getByRole('link', { name: 'Services', exact: true })).toHaveAttribute('aria-current', 'page');
    await page.waitForTimeout(400);
    await page.mouse.click(2, 400);
    await expect(sheet).toBeHidden();
    await expect(btn).toBeFocused();
  });

  test('the header stays on screen while scrolling', async ({ page }) => {
    await page.goto('/services/');
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(400);
    const box = await page.locator('[data-header]').boundingBox();
    expect(box?.y).toBe(0);
  });

  test('skip link moves focus to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('quick menu: Ctrl+K opens it, typing filters, Enter goes there, Escape closes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const qm = page.getByRole('dialog', { name: 'Quick menu' });
    await expect(qm).toBeVisible();
    const input = qm.getByRole('combobox');
    await expect(input).toBeFocused();
    await input.fill('samp');
    await expect(qm.getByRole('option', { name: /Samp Hair/ })).toBeVisible();
    await expect(qm.getByRole('option', { name: /Privacy/ })).toBeHidden();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/work\/samp-hair-spa\/$/);
    // The header button opens it too; Escape closes it and returns focus.
    const trigger = page.locator('[data-qm-open]');
    await trigger.click();
    await expect(qm).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(qm).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('quick menu shows an honest empty state', async ({ page }) => {
    await page.goto('/about/');
    await page.keyboard.press('Control+k');
    await page.getByRole('combobox').fill('zzzz');
    await expect(page.locator('[data-qm-empty]')).toBeVisible();
  });
});

test.describe('home interactions', () => {
  test('the hero photo is the core of the agent graph: real, sized for the screen, and loaded first', async ({ page }) => {
    for (const [w, h, min] of [[390, 844, 170], [1440, 900, 190]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const photo = page.locator('.hero [data-agent-graph] .ag__photo');
      await expect(photo).toBeVisible();
      await expect(photo).toHaveAttribute('alt', /Mann Patel smiling/);
      await expect(photo).toHaveAttribute('fetchpriority', 'high');
      await page.waitForFunction(() => (document.querySelector('.ag__photo') as HTMLImageElement).naturalWidth > 0);
      const box = (await photo.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(min);
      // Only the layout for this screen is shown: left-to-right on desktop, top-to-bottom on phones.
      await expect(page.locator(w >= 1024 ? '.ag__svg--wide' : '.ag__svg--tall')).toBeVisible();
      await expect(page.locator(w >= 1024 ? '.ag__svg--tall' : '.ag__svg--wide')).toBeHidden();
    }
    // The radio photo and the signal ribbon are gone.
    await expect(page.locator('[data-tune], [data-signal-sculpture]')).toHaveCount(0);
  });

  test('the graph labels name where customers come from and what should happen, and the pause button stops the pulses', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const svg = page.locator('.ag__svg--wide');
    for (const label of ['Google', 'Maps', 'AI answers', 'Enquiry', 'Reply', 'Booking']) await expect(svg).toContainText(label);
    const pulse = page.locator('.ag__svg--wide .ag__pulse').first();
    expect(await pulse.evaluate((e) => getComputedStyle(e).animationName)).toBe('ag-in');
    const toggle = page.locator('[data-ag-toggle]');
    await expect(toggle).toHaveAccessibleName('Pause animation');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-agent-graph]')).toHaveClass(/is-paused/);
    expect(await pulse.evaluate((e) => getComputedStyle(e).animationPlayState)).toBe('paused');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(await pulse.evaluate((e) => getComputedStyle(e).animationPlayState)).toBe('running');
  });


  test('reduced motion: the graph is a still diagram with two lit routes and no pause button', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    expect(await page.locator('.ag__svg--tall .ag__pulse').first().evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
    expect(await page.locator('.ag__orbit').first().evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
    await expect(page.locator('.ag__svg--tall .ag__pulse:visible')).toHaveCount(4);
    await expect(page.locator('[data-ag-toggle]')).toBeHidden();
    await ctx.close();
  });

  test('the three service summaries each link to their focused page and name their package', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('#what-i-do li');
    await expect(items).toHaveCount(3);
    for (const slug of ['local-visibility', 'enquiry-follow-up', 'web-design'])
      await expect(page.locator(`#what-i-do a[href="/services/${slug}/"]`)).toBeVisible();
    for (const name of ['Local Visibility Setup', 'Website + Enquiry System', 'Website Launch'])
      await expect(page.locator('#what-i-do')).toContainText(`Package: ${name}`);
    // Plain service names on the cards, and links that name the service they lead to.
    for (const name of ['Local SEO and Google Business Profile', 'Enquiry follow-up and online booking', 'Web design and redesign'])
      await expect(page.locator('#what-i-do').getByRole('heading', { name })).toBeVisible();
    await expect(page.locator('#what-i-do a[href="/services/web-design/"]')).toContainText('Web design');
    // Case studies link to the service they are evidence for.
    await page.goto('/work/nest-and-rest-cleaning/');
    await expect(page.locator('main a[href="/services/web-design/"]').first()).toContainText('Web design service');
  });

  test('the home page lists every price, each with what it covers, and links to the full pricing page', async ({ page }) => {
    await page.goto('/');
    const prices = page.locator('#prices');
    for (const [name, price] of [['Website Fix', '$450–$850'], ['Website Launch', '$1,950'], ['Website + Enquiry System', '$3,350'], ['Local Visibility Setup', '$650'], ['Website Care', '$149 a month']]) {
      const row = prices.locator('.pt__row').filter({ has: page.locator('.pt__name', { hasText: new RegExp(`^${name.replace(/[+]/g, '\\+')}$`) }) });
      await expect(row.locator('[data-price]')).toHaveText(price);
      await expect(row.locator('.pt__boundary')).not.toBeEmpty();
    }
    await expect(prices).toContainText('plus applicable tax');
    await expect(prices.getByRole('link', { name: 'Full pricing and what’s included' })).toHaveAttribute('href', '/pricing/');
  });

  test('finder recommends a starting point live and pre-fills the brief', async ({ page }) => {
    await page.goto('/services/');
    const finder = page.locator('#finder');
    await finder.getByText('Up and running').click();
    await expect(finder.locator('[data-r-count]')).toHaveText('1 of 3 answered');
    await expect(finder.locator('[data-r-full]')).toBeHidden();
    await finder.getByText('Not missing calls, messages or enquiries').click();
    // A website that works is checked, not rebuilt.
    await finder.getByText('Yes, and it works well').click();
    await expect(finder.locator('[data-r-name]')).toHaveText('Start with a free check of your enquiry path');
    await finder.getByText('No', { exact: true }).click();
    await expect(finder.locator('[data-r-name]')).toHaveText('Website + Enquiry System fits best');
    const cta = finder.locator('[data-r-cta]');
    await expect(cta).toHaveAttribute('href', /\/contact\/\?package=website-enquiry&services=/);
    await cta.click();
    await expect(page.locator('#f-package')).toHaveValue('website-enquiry');
    await expect(page.locator('input[name="services"][value="missed-calls"]')).toBeChecked();
  });

  test('without JavaScript, the finder submits its answers to the brief', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://127.0.0.1:4321' });
    const page = await ctx.newPage();
    await page.goto('/services/');
    const finder = page.locator('#finder');
    await finder.getByText('Just starting, or about to launch').click();
    await finder.getByText('I’m not sure yet').click();
    await finder.getByText('No', { exact: true }).click();
    await finder.getByRole('button', { name: 'See my starting point' }).click();
    await expect(page).toHaveURL(/\/contact\/\?stage=starting&problem=unsure&site=none/);
    await ctx.close();
  });

  test('reduced motion: headings and reveals are visible immediately and the hero does not animate', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    expect(await page.locator('.hero__title').evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
    expect(await page.evaluate(() => document.documentElement.classList.contains('js-motion'))).toBe(false);
    const op = await page.locator('[data-reveal]:not([data-reveal^="load"])').first().evaluate((e) => getComputedStyle(e).opacity);
    expect(op).toBe('1');
    await ctx.close();
  });

  for (const [w, h] of [[320, 568], [375, 667], [390, 844]]) {
    test(`phones: the menu fits on one ${w}x${h} screen, down to Privacy and Terms`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      await page.locator('[data-menu-open]').click();
      const sheet = page.locator('[data-menu]');
      await expect(sheet).toBeVisible();
      await page.waitForTimeout(700);
      const fit = await sheet.evaluate((d) => d.scrollHeight - d.clientHeight);
      expect(fit).toBeLessThanOrEqual(1);
      for (const name of ['Home', 'Work', 'Services', 'Pricing', 'About', 'Vision', 'Contact', 'Privacy', 'Terms'])
        await expect(sheet.getByRole('link', { name, exact: true }).first()).toBeInViewport();
      await expect(sheet.getByRole('link', { name: /Email Mann/ })).toBeInViewport();
    });
  }

  test('phones: the header has only the logo and Menu (no separate Contact button), and the photo graph follows the buttons', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    // 14 Nov 2026 (round 2): Mann asked to remove the top Contact button on phones; Contact stays in the menu.
    await expect(page.locator('[data-header]').getByRole('link', { name: 'Contact', exact: true })).toBeHidden();
    await expect(page.locator('[data-menu-open]')).toBeVisible();
    const gap = await page.evaluate(
      () => document.querySelector('[data-agent-graph]')!.getBoundingClientRect().top - document.querySelector('.hero__text')!.getBoundingClientRect().bottom,
    );
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThan(60);
  });

  test('small phones: the headline and both buttons fit on the first screen', async ({ page }) => {
    // 14 Nov 2026: Mann saw the first screen cut off on his phone; the service list now follows the buttons on phones.
    for (const [w, h] of [[320, 568], [360, 640], [375, 667], [390, 844]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      await expect(page.locator('h1')).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.hero').getByRole('link', { name: 'Get a free website and Google check' })).toBeInViewport({ ratio: 1 });
      await expect(page.locator('.hero').getByRole('link', { name: 'See prices' })).toBeInViewport({ ratio: 1 });
      await noHorizontalOverflow(page);
    }
  });

  test('the hero graph shows the close-crop photo; the lower section no longer repeats the photo and intro', async ({ page }) => {
    // 14 Nov 2026 (Mann's call): his photo and introduction appear once, in the hero.
    for (const [w, h] of [[390, 844], [820, 1180], [1440, 900]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const photo = page.locator('.hero .ag__photo');
      await expect(photo).toBeVisible();
      await expect(photo).toHaveAttribute('alt', /Mann Patel smiling/);
      await expect(photo).toHaveAttribute('src', /mann-patel-hero/);
      await page.waitForFunction(() => (document.querySelector('.hero .ag__photo') as HTMLImageElement).naturalWidth > 0);
      await expect(page.locator('main img[alt*="Mann Patel smiling"]')).toHaveCount(1);
      const section = page.locator('#how-i-work');
      await expect(section.getByRole('heading', { level: 2 })).toHaveText('Clear steps. No surprises.');
      await expect(section.getByText('Hi, I’m Mann')).toHaveCount(0);
      await expect(section.getByRole('link', { name: 'More about me' })).toHaveAttribute('href', '/about/');
    }
  });

  test('without JavaScript, the header links show and content is visible', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('.hdr__nav').getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.locator('[data-menu-open]')).toBeHidden();
    // The graph is drawn without JavaScript; only its pause button needs a script.
    await expect(page.locator('.ag__svg--tall')).toBeVisible();
    await expect(page.locator('.ag__photo')).toBeVisible();
    await expect(page.locator('[data-ag-toggle]')).toBeHidden();
    await ctx.close();
  });
});

test.describe('phones: short pages', () => {
  // Screens of 390 × 844. Budgets keep the phone layout from growing back into a long scroll.
  // Case studies: 7 since round 7 added the at-a-glance summary and the tested-behaviour evidence.
  // Round 10 (competitor audit, which judges sections by usefulness rather than length) added the
  // labelled walkthrough to Home, package boundaries to Services and the professional intro to About.
  const BUDGET: Record<string, number> = {
    // 10 Nov 2026 (growth report): the explained process strip on Home, the three named services
    // at the top of Services, the repair option, the AI search check, the scoped follow-up options
    // with a sample test log, and "Offered as" links on case studies each add part of a screen.
    // 14 Nov 2026: Home swaps the walkthrough for the price list; Pricing gains a fifth offer
    // (Website Fix) and a worked salon example.
    '/': 13.5, // agent graph, every service named in the hero (round 2), real work, prices, and how I work (no second photo since 14 Nov 2026)
    // 14 Nov 2026 (SEO audit Phase 2): /services/ is a short overview now; each service's details moved
    // to its service page as closed "Service by service" accordions (plus the redesign section on web design).
    '/services/': 9,
    '/work/': 4.75, // plus industry, location and result under each project (SEO audit Phase 2)
    // + "For your trade: Websites for cleaning companies / salons and spas" under "Offered as" (SEO audit Phase 3).
    '/work/nest-and-rest-cleaning/': 7.5,
    '/work/samp-hair-spa/': 7.5,
    // 14 Nov 2026 (SEO audit): "Based in Scarborough…" stays visible in the phone footer (+1 line on every page).
    // + the five-step process with your part and mine, moved from the old /services/ (SEO audit Phase 2).
    '/about/': 8.75,
    '/contact/': 3.75,
    '/services/web-design/': 15, // plus the Website Fix package, the redesign section and its services
    '/services/local-visibility/': 12.25,
    '/services/enquiry-follow-up/': 14,
    // 14 Nov 2026 (SEO audit): the intro names Toronto and the GTA, one more line on a phone.
    '/pricing/': 15,
  };
  for (const [path, max] of Object.entries(BUDGET)) {
    test(`${path} stays under ${max} phone screens`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      await revealAll(page);
      const screens = await page.evaluate(() => document.documentElement.scrollHeight / innerHeight);
      expect(screens).toBeLessThanOrEqual(max);
    });
  }

  for (const path of ['/', '/services/', '/about/', '/work/nest-and-rest-cleaning/']) {
    test(`${path} passes axe at phone width, and swipe rows can be reached by keyboard`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      await revealAll(page);
      await page.waitForTimeout(1300);
      const axe = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0])
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const summary = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
      expect(summary, summary.join('\n')).toEqual([]);
      const unreachable = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('[data-rail]')]
          .filter((r) => r.scrollWidth > r.clientWidth + 1)
          .filter((r) => r.tabIndex < 0 && !r.querySelector('a, button, input, select, textarea, summary'))
          .map((r) => r.className),
      );
      expect(unreachable).toEqual([]);
    });
  }

  test('both projects are in the normal reading order on phones (no sideways swipe), with honest labels', async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      const cards = page.locator('#work article');
      await expect(cards).toHaveCount(2);
      const boxes = await cards.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ left: r.left, right: r.right, top: r.top })));
      for (const b of boxes) {
        expect(b.left).toBeGreaterThanOrEqual(0);
        expect(b.right).toBeLessThanOrEqual(width);
      }
      expect(boxes[1].top).toBeGreaterThan(boxes[0].top);
      await expect(page.locator('#work [data-rail]')).toHaveCount(0);
      await expect(cards.first()).toContainText(NEST_STATUS);
      await expect(cards.first()).toContainText('Business opens summer 2027');
      await expect(cards.nth(1)).toContainText('In progress');
      await noHorizontalOverflow(page);
    }
  });

  test('card rows elsewhere still swipe sideways with dots, without the page scrolling sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about/');
    const rail = page.locator('[data-rail]').first();
    const { scrollW, clientW, display } = await rail.evaluate((el) => ({
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
      display: getComputedStyle(el).display,
    }));
    expect(display).toBe('flex');
    expect(scrollW).toBeGreaterThan(clientW);
    const dots = page.locator('.rail-dots').first().locator('i');
    await rail.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    await expect(dots.last()).toHaveClass(/is-on/);
    await noHorizontalOverflow(page);
  });

  // SEO audit Phase 2 (14 Nov 2026): the long question list on /services/ was split up, each question in one
  // place. Every FAQPage in structured data lists exactly the questions the page shows.
  test('FAQ structured data matches the questions each page shows', async ({ page }) => {
    for (const path of ['/', '/services/', '/pricing/', '/services/web-design/', '/services/local-visibility/', '/services/enquiry-follow-up/', '/websites-for-cleaning-companies/', '/websites-for-salons-and-spas/', '/web-design-scarborough/']) {
      await page.goto(path);
      const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => JSON.parse(x.textContent || '{}')));
      const faq = blocks.find((b) => b['@type'] === 'FAQPage');
      expect(faq, path).toBeTruthy();
      const inSchema = faq.mainEntity.map((q: { name: string }) => q.name).sort();
      const shown = (await page.locator('main details.acc:not(.svc) > summary > span:first-child').allInnerTexts()).map((t) => t.trim()).sort();
      expect(shown, path).toEqual(inSchema);
    }
  });

  test('a case study opens with its start, and "Read the full case study" shows the rest', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/work/nest-and-rest-cleaning/');
    const prose = page.locator('#cs-story');
    await expect(prose).toHaveClass(/is-folded/);
    const btn = page.getByRole('button', { name: 'Read the full case study' });
    await btn.click();
    await expect(prose).not.toHaveClass(/is-folded/);
    await expect(btn).toBeHidden();
    await expect(prose.getByRole('heading', { name: 'Results' })).toBeVisible();
    // Laptops never fold the text.
    // The evidence previews its first check, and opens in one tap.
    const tests = page.locator('#cs-tests');
    await expect(tests).toHaveClass(/is-folded/);
    await page.getByRole('button', { name: 'Show all checks and limitations' }).click();
    await expect(tests).not.toHaveClass(/is-folded/);
    await expect(tests.getByRole('heading', { name: 'Limitations' })).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await expect(page.locator('#cs-story')).not.toHaveClass(/is-folded/);
    await expect(page.locator('#cs-tests')).not.toHaveClass(/is-folded/);
  });
});

// SEO audit Phase 3 (14 Nov 2026, docs/seo/PLAN.md): industry pages, the Scarborough page and the guides.
// Previews build the drafts (Scarborough, guides) so they can be reviewed; production leaves them out, which
// scripts/seo-check.mjs checks on the production build.
test.describe('new pages (SEO audit Phase 3)', () => {
  const ld = (page: Page) =>
    page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => JSON.parse(x.textContent || '{}')));
  /** True if `a` comes before `b` in the page. */
  const before = (page: Page, a: string, b: string) =>
    page.evaluate(([a, b]) => Boolean(document.querySelector(a)!.compareDocumentPosition(document.querySelector(b)!) & Node.DOCUMENT_POSITION_FOLLOWING), [a, b]);
  const lastSectionId = (page: Page) => page.evaluate(() => document.querySelector('main')?.lastElementChild?.id);

  const INDUSTRY: [string, string, string[], [string, string][]][] = [
    ['/websites-for-cleaning-companies/', 'nest-and-rest-cleaning', ['Own business', NEST_STATUS, 'Business opens summer 2027'], [['Website Launch', '$1,950'], ['Local Visibility Setup', '$650']]],
    ['/websites-for-salons-and-spas/', 'samp-hair-spa', ['Client website', 'In progress'], [['Website + Enquiry System', '$3,350'], ['Website Launch', '$1,950']]],
  ];
  for (const [path, study, labels, pkgs] of INDUSTRY) {
    test(`${path} leads with its case study, honestly labelled, then the package that fits`, async ({ page }) => {
      await page.goto(path);
      // The case study is the first section after the page head, with its honest labels and a link to it.
      expect(await page.evaluate(() => document.querySelector('main > header + section')?.hasAttribute('data-case-study'))).toBe(true);
      const caseStudy = page.locator('[data-case-study]');
      await expect(caseStudy.locator(`a[href="/work/${study}/"]`).first()).toBeAttached();
      for (const label of labels) await expect(caseStudy).toContainText(label);
      // Then the packages, the one that fits first, with the published prices.
      expect(await before(page, '[data-case-study]', '[data-packages]')).toBe(true);
      const cards = page.locator('[data-packages] .pkg');
      await expect(cards).toHaveCount(pkgs.length);
      for (const [i, [name, price]] of pkgs.entries()) {
        await expect(cards.nth(i).locator('.pkg__name')).toHaveText(name);
        await expect(cards.nth(i).locator('[data-price]')).toHaveText(price);
      }
      // Every new page ends with the free check.
      expect(await lastSectionId(page)).toBe('check');
      // A Service sold by the business, priced as the page shows it.
      const svc = (await ld(page)).find((b) => b['@type'] === 'Service');
      expect(svc.provider['@id']).toMatch(/#business$/);
      expect(svc.offers.map((o: { name: string }) => o.name)).toEqual(pkgs.map(([name]) => name));
      await noHorizontalOverflow(page);
    });
  }

  test('the new pages are linked in and out', async ({ page }) => {
    const LINKS: [string, string[]][] = [
      ['/services/web-design/', ['/websites-for-cleaning-companies/', '/websites-for-salons-and-spas/']],
      ['/services/enquiry-follow-up/', ['/websites-for-salons-and-spas/']],
      ['/services/', ['/websites-for-cleaning-companies/', '/websites-for-salons-and-spas/']],
      ['/work/', ['/websites-for-cleaning-companies/', '/websites-for-salons-and-spas/']],
      ['/work/nest-and-rest-cleaning/', ['/websites-for-cleaning-companies/']],
      ['/work/samp-hair-spa/', ['/websites-for-salons-and-spas/']],
      ['/websites-for-cleaning-companies/', ['/work/nest-and-rest-cleaning/', '/services/web-design/', '/services/local-visibility/', '/pricing/', '/websites-for-salons-and-spas/']],
      ['/websites-for-salons-and-spas/', ['/work/samp-hair-spa/', '/services/web-design/', '/services/enquiry-follow-up/', '/pricing/', '/websites-for-cleaning-companies/']],
      ['/web-design-scarborough/', ['/work/samp-hair-spa/', '/work/nest-and-rest-cleaning/', '/services/web-design/', '/services/local-visibility/', '/services/enquiry-follow-up/', '/pricing/']],
    ];
    for (const [from, targets] of LINKS) {
      await page.goto(from);
      for (const to of targets) await expect(page.locator(`main a[href="${to}"]`).first(), `${from} → ${to}`).toBeAttached();
    }
  });

  test('Scarborough: real local proof and the Google Business Profile; a marked draft until the neighbourhoods are supplied', async ({ page }) => {
    await page.goto('/web-design-scarborough/');
    await expect(page.locator('[data-draft]')).toBeVisible();
    await expect(page.locator('[data-neighbourhoods] [data-confirm]')).toContainText('neighbourhoods');
    await expect(page.locator('main a[href="https://maps.app.goo.gl/dYccTa9jQJczpeac6"]').first()).toBeAttached();
    await expect(page.locator('main')).toContainText('Samp Hair & Spa');
    await expect(page.locator('main')).toContainText('web designer based in Scarborough, Ontario');
    // The full business node, city-level address only.
    const biz = (await ld(page)).find((b) => b['@type'] === 'ProfessionalService');
    expect(biz.telephone).toBe('+1-647-978-6903');
    expect(biz.address.addressLocality).toBe('Scarborough');
    expect(await lastSectionId(page)).toBe('check');
    // While the page is visible, the "Based in Scarborough" lines point to it (service pages and footer).
    await page.goto('/services/web-design/');
    await expect(page.locator('[data-local] a[href="/web-design-scarborough/"]')).toBeAttached();
    await expect(page.locator('footer a[href="/web-design-scarborough/"]')).toBeAttached();
  });

  test('guides: an index, Article data by Mann, the cost and Business Profile cluster, drafts and outlines marked', async ({ page }) => {
    await page.goto('/guides/');
    for (const g of GUIDES) await expect(page.locator(`main a[href="/guides/${g}/"]`).first()).toBeAttached();
    expect(await lastSectionId(page)).toBe('check');

    await page.goto(`/guides/${GUIDES[0]}/`);
    await expect(page.locator('[data-draft]')).toBeVisible();
    const article = (await ld(page)).find((b) => b['@type'] === 'Article');
    expect(article.author['@id']).toMatch(/#person$/);
    expect(article.headline).toBe((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim());
    for (const to of ['/pricing/', '/services/web-design/', `/guides/${GUIDES[1]}/`, '/contact/?package=check-up#check'])
      await expect(page.locator(`main a[href="${to}"]`).first(), to).toBeAttached();
    expect(await lastSectionId(page)).toBe('check');

    await page.goto(`/guides/${GUIDES[1]}/`);
    for (const to of ['/pricing/', '/services/local-visibility/', `/guides/${GUIDES[0]}/`])
      await expect(page.locator(`main a[href="${to}"]`).first(), to).toBeAttached();

    await page.goto('/guides/why-isnt-my-business-on-google-maps/');
    await expect(page.locator('[data-draft]')).toContainText('Outline');

    // Service pages and /pricing/ point to their guides, and the footer to the index, while any are visible.
    await page.goto('/services/web-design/');
    await expect(page.locator(`main a[href="/guides/${GUIDES[0]}/"]`)).toBeAttached();
    await expect(page.locator('footer a[href="/guides/"]')).toBeAttached();
    await page.goto('/pricing/');
    await expect(page.locator(`main a[href="/guides/${GUIDES[0]}/"]`)).toBeAttached();
  });
});

test.describe('services', () => {
  test('a link to a service opens it', async ({ page }) => {
    await page.goto('/services/#booking');
    await expect(page.locator('details#booking')).toHaveAttribute('open', '');
    await expect(page.locator('#booking').getByRole('link', { name: 'Ask about this' })).toHaveAttribute('href', '/contact/?service=booking#brief');
  });

  test('packages each ask for a quote with the package pre-selected', async ({ page }) => {
    // Package detail lives on /pricing/ only (SEO audit Phase 2, 14 Nov 2026).
    await page.goto('/pricing/');
    const links = page.locator('.pr__grid .pkg').getByRole('link', { name: /Request a quote for/ });
    await expect(links).toHaveCount(5);
    await links.nth(1).click();
    await expect(page.locator('#f-package')).toHaveValue('website-launch');
  });

  test('old package links from before round 10 still pre-select the closest package', async ({ page }) => {
    for (const [old, now] of [['launch', 'website-enquiry'], ['found', 'local-visibility'], ['answered', 'website-enquiry'], ['website', 'website-launch']]) {
      await page.goto(`/contact/?package=${old}#brief`);
      await expect(page.locator('#f-package')).toHaveValue(now);
    }
  });

  test('the five packages compare side by side, and every price line agrees (cards, table, services overview)', async ({ page }) => {
    // Package detail lives on /pricing/ only (SEO audit Phase 2, 14 Nov 2026).
    await page.goto('/pricing/');
    const table = page.getByRole('table', { name: 'Side by side' });
    for (const name of ['Website Fix', 'Website Launch', 'Website + Enquiry System', 'Local Visibility Setup', 'Website Care'])
      await expect(table.getByRole('columnheader', { name, exact: true })).toBeVisible();
    for (const row of ['Best for', 'Boundary', 'Covers', 'Not included', 'You provide', 'Paid to others', 'Timeline', 'Price', 'Next step'])
      await expect(table.getByRole('rowheader', { name: row })).toBeVisible();
    await expect(table.getByRole('link', { name: /Request a quote for Website Launch/ })).toHaveAttribute('href', '/contact/?package=website-launch#brief');
    const cardPrices = await page.locator('.pr__grid .pkg [data-price]').allInnerTexts();
    const tablePrices = await table.locator('[data-price]').allInnerTexts();
    expect(cardPrices).toEqual(['$450–$850', '$1,950', '$3,350', '$650', '$149 a month']);
    expect(tablePrices).toEqual(cardPrices);
    // The services overview names the same prices in one line and sends you to /pricing/ for the detail.
    await page.goto('/services/');
    const line = page.locator('#packages');
    for (const price of cardPrices) await expect(line).toContainText(price);
    await expect(line.getByRole('link', { name: /What each package covers/ })).toHaveAttribute('href', '/pricing/');
    await expect(line.locator('table, .pkg')).toHaveCount(0);
    // No popularity badges, discounts or scarcity.
    expect(await page.locator('main').innerText()).not.toMatch(/most popular|best value|% off|limited time|only \d+ (spots|places)/i);
  });

  test('focused service pages: a distinct answer, honest evidence and a route to enquire', async ({ page }) => {
    const titles = new Set<string>();
    for (const [slug, pkg] of [['web-design', 'website-launch'], ['local-visibility', 'local-visibility'], ['enquiry-follow-up', 'website-enquiry']]) {
      await page.goto(`/services/${slug}/`);
      titles.add(await page.title());
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/services/');
      await expect(page.locator('main').getByRole('link', { name: 'Request a quote' }).first()).toHaveAttribute('href', `/contact/?package=${pkg}#brief`);
      await expect(page.locator('main')).toContainText('Not a fit:');
      await expect(page.locator('main')).toContainText('Paid to other providers');
      expect(await page.locator('main').innerText()).not.toMatch(/guaranteed? (rankings|results|leads)|#1 on google/i);
    }
    expect(titles.size).toBe(3);
    // Web design links only to real work, with its honest status.
    await page.goto('/services/web-design/');
    await expect(page.locator('main')).toContainText('Business opens summer 2027');
    await expect(page.locator('main')).toContainText('In progress, preview online');
    // Local visibility shows a sample, labelled as one, and cites Google's own guidance.
    await page.goto('/services/local-visibility/');
    await expect(page.locator('main')).toContainText('Sample · fictional business');
    await expect(page.locator('a[href="https://support.google.com/business/answer/7091?hl=en"]')).toBeVisible();
    // Enquiry follow-up demonstrates the workflow with fictional data.
    await page.goto('/services/enquiry-follow-up/');
    await expect(page.locator('#demo-walkthrough')).toContainText('Demonstration · fictional data');
    // The overview keeps its anchors and links to each page.
    await page.goto('/services/');
    for (const slug of ['web-design', 'local-visibility', 'enquiry-follow-up'])
      await expect(page.locator(`main a[href="/services/${slug}/"]`).first()).toBeVisible();
  });

  test('services overview: three named paths and the package comparison come first; every old anchor still works', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/');
    const paths = page.locator('#paths');
    for (const [slug, name, pkg] of [
      ['web-design', 'Web design and redesign', 'Website Launch'],
      ['local-visibility', 'Local SEO and Google Business Profile', 'Local Visibility Setup'],
      ['enquiry-follow-up', 'Enquiry follow-up and online booking', 'Website + Enquiry System'],
    ]) {
      const card = paths.locator('li', { has: page.locator(`a[href="/services/${slug}/"]`) });
      await expect(card).toContainText(name);
      await expect(card).toContainText(pkg);
    }
    const top = (id: string) => page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top + scrollY, id);
    expect(await top('paths')).toBeLessThan(await top('packages'));
    // SEO audit Phase 2 (14 Nov 2026): a short overview; the package comparison is on /pricing/ only.
    await expect(page.locator('#packages table')).toHaveCount(0);
    // Links shared before today keep landing somewhere: these sections are still here…
    for (const id of ['paths', 'packages', 'extras', 'print-design', 'social-content', 'brand-content', 'check', 'finder', 'faq'])
      await expect(page.locator(`#${id}`), id).toHaveCount(1);
    // …and the rest forward to the page that now holds them.
    const forwards: [string, string][] = [
      ['booking', '/services/enquiry-follow-up/#booking'],
      ['missed-calls', '/services/enquiry-follow-up/#missed-calls'],
      ['enquiry-workflows', '/services/enquiry-follow-up/#enquiry-workflows'],
      ['business-profile', '/services/local-visibility/#business-profile'],
      ['listings', '/services/local-visibility/#listings'],
      ['local-plan', '/services/local-visibility/#local-plan'],
      ['websites', '/services/web-design/#websites'],
      ['seo', '/services/web-design/#seo'],
      ['maintenance', '/services/web-design/#maintenance'],
      ['found', '/services/local-visibility/#details'],
      ['answered', '/services/enquiry-follow-up/#details'],
      ['booked', '/services/web-design/#details'],
      ['process', '/about/#process'],
      ['reviews', '/services/local-visibility/#reviews'],
      ['integrations', '/services/enquiry-follow-up/#integrations'],
    ];
    for (const [from, to] of forwards) {
      await page.goto(`/services/#${from}`);
      await page.waitForURL((u) => u.pathname + u.hash === to);
      await expect(page.locator(`#${to.split('#')[1]}`), from).toHaveCount(1);
    }
    await page.goto('/services/web-design/#seo');
    await expect(page.locator('details#seo')).toHaveAttribute('open', '');
    // Built-in object names and malformed addresses are ignored (no redirect, no error).
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const hash of ['constructor', '__proto__', 'toString', '%E0%A4%A']) {
      await page.goto(`/services/#${hash}`);
      await page.waitForTimeout(150);
      expect(new URL(page.url()).pathname, hash).toBe('/services/');
    }
    expect(errors).toEqual([]);
    // The add-ons state what they don't include, and the full project process (with your part) is on About.
    await page.goto('/services/');
    await expect(page.locator('#print-design')).toContainText('Printing costs, which are paid to the printer');
    await expect(page.locator('#social-content')).toContainText('Posting on your behalf and replying to comments');
    await page.goto('/about/');
    await expect(page.locator('#process')).toContainText('Two rounds of changes are included per deliverable');
  });

  test('Brand & Content Sprint: a bounded add-on on the overview, with what is quoted separately', async ({ page }) => {
    // One of the add-ons, shown in full on the short overview (SEO audit Phase 2, 14 Nov 2026).
    await page.goto('/services/#brand-content');
    const sprint = page.locator('#brand-content');
    await expect(sprint).toBeVisible();
    await expect(sprint).toContainText('Brand & Content Sprint');
    await expect(sprint).toContainText('Three captioned post designs');
    await expect(sprint).toContainText('Two Reel hooks');
    await expect(sprint).toContainText('Quoted separately');
    await expect(sprint).toContainText('Filming and editing');
    await expect(sprint.getByRole('link', { name: 'Ask about the sprint' })).toHaveAttribute('href', '/contact/?service=social-content#brief');
    // Not a page of its own until there is owner-approved sample work to show.
    expect((await page.request.get('/services/brand-content/')).status()).toBe(404);
  });

  test('service pages name what is sold: a repair option, the AI search check, and scoped follow-up options', async ({ page }) => {
    await page.goto('/services/web-design/');
    const repair = page.locator('#repair');
    await expect(repair).toContainText('repair');
    await expect(repair).toContainText('one agreed page or one enquiry path');
    await expect(repair.getByRole('link', { name: /free check/i })).toHaveAttribute('href', '/contact/?package=check-up#check');
    await expect(page.locator('main')).toContainText('website redesign');
    await expect(page.locator('main')).toContainText('Website Care');
    await expect(page.locator('main')).toContainText('30 minutes');

    await page.goto('/services/local-visibility/');
    const ai = page.locator('#ai-search');
    await expect(ai).toContainText('AI search visibility');
    await expect(ai).toContainText('generative engine optimization');
    await expect(ai).toContainText('answer engine optimization');
    await expect(ai).toContainText('No one can guarantee');
    await expect(page.locator('a[href="https://developers.google.com/search/docs/appearance/ai-features"]')).toBeVisible();
    for (const term of ['Google Business Profile', 'Google Maps', 'genuine review', 'local SEO']) await expect(page.locator('main')).toContainText(term);

    await page.goto('/services/enquiry-follow-up/');
    for (const term of ['Missed-call text-back', 'Form follow-up', 'alert', 'Online booking set-up']) await expect(page.locator('main')).toContainText(term);
    const log = page.locator('#test-log');
    await expect(log).toContainText('Sample · fictional test log');
    await expect(log).toContainText('handed to the owner');
    await expect(log).toContainText('Request');
    await expect(log).toContainText('only after the booking tool confirms');
    // No chatbot is sold until there is a tested pilot to stand behind.
    await expect(page.locator('main')).not.toContainText(/chatbot (pilot|set-?up) available/i);
  });

  test('pricing: built for review, but not linked while no price is approved', async ({ page }) => {
    await page.goto('/pricing/');
    const prices = await page.locator('.pkg [data-price]').allInnerTexts();
    const unpriced = prices.every((t) => t === 'Written quote after a short brief');
    for (const path of ['/', '/services/']) {
      await page.goto(path);
      const linked = await page.locator('a[href="/pricing/"]').count();
      if (unpriced) expect(linked, `${path} should not link to an empty pricing page`).toBe(0);
      else expect(linked).toBeGreaterThan(0);
    }
  });
});

test.describe('legal pages', () => {
  test('Privacy Policy and Terms of Use are linked from the footer, the menu and the form', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact/');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Privacy', exact: true })).toHaveAttribute('href', '/privacy/');
    await expect(footer.getByRole('link', { name: 'Terms', exact: true })).toHaveAttribute('href', '/terms/');
    await expect(page.locator('form .privacy a[href="/privacy/"]')).toHaveText('Privacy Policy');
    await expect(page.locator('form .privacy a[href="/terms/"]')).toHaveText('Terms of Use');
    await footer.getByRole('link', { name: 'Terms', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('Terms of Use');
    await footer.getByRole('link', { name: 'Privacy', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('Privacy Policy');
  });

  test('legal pages list their sections on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/privacy/');
    const toc = page.getByRole('navigation', { name: 'On this page' });
    await expect(toc).toBeVisible();
    await toc.getByRole('link', { name: 'Who is responsible' }).click();
    await expect(page).toHaveURL(/#who-is-responsible$/);
  });
});

test.describe('direct contact', () => {
  test('email, call, WhatsApp and text buttons work', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.hero__reach');
    await expect(hero.getByRole('link', { name: /Email Mann/ })).toHaveAttribute('href', /^mailto:info@mannpatel\.me\?subject=/);
    const call = hero.getByRole('link', { name: 'Call Mann' });
    test.skip((await call.count()) === 0, 'Build with PUBLIC_CONTACT_PHONE (e.g. +16475550142) to test the phone buttons.');
    const digits = (await call.getAttribute('href'))!.replace(/\D/g, '');
    expect(digits).toMatch(/^1\d{10}$/);
    await expect(call).toHaveAttribute('href', `tel:+${digits}`);
    await expect(hero.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', new RegExp(`^https://wa\\.me/${digits}\\?text=`));
    await expect(hero.getByRole('link', { name: /text message/ })).toHaveAttribute('href', new RegExp(`^sms:\\+${digits}`));
    await page.goto('/contact/');
    await expect(page.locator('#reach .ca__number')).toContainText(/\d{3}-\d{3}-\d{4}/);
  });

  test('call, WhatsApp and LinkedIn stay available in the footer; LinkedIn is also on About', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('a[data-reach="call"]').first()).toHaveAttribute('href', /^tel:\+1\d{10}$/);
    await expect(footer.getByRole('link', { name: /Message on WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/1\d{10}\?text=/);
    await expect(footer.getByRole('link', { name: 'Mann Patel on LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/mannp6903/');
    await page.goto('/about/');
    await expect(page.locator('main').getByRole('link', { name: 'Mann Patel on LinkedIn' })).toBeVisible();
    // Only confirmed profiles: no Instagram or Facebook button until a link is set.
    await expect(page.locator('a[data-contact="instagram"], a[data-contact="facebook"]')).toHaveCount(0);
    // Structured data lists the confirmed profiles.
    const ld = (await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ''))).join(' ');
    expect(ld).toContain('https://www.linkedin.com/in/mannp6903/');
  });

  // 14 Nov 2026 (SEO audit, Mann's decision): the full number is shown and listed in the business structured
  // data, so it matches Google Business Profile and directories. It replaces the masked number and "Show number".
  test('the full number is shown as a tap-to-call link in the footer and on /contact/, with "Based in Scarborough"', async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/contact/');
    const reach = page.locator('#reach');
    const number = reach.locator('[data-phone-text]');
    test.skip((await number.count()) === 0, 'No phone number configured.');
    // Whatever number the build has (src/data/site.ts, or PUBLIC_CONTACT_PHONE), shown in full: 647-978-6903.
    const digits = (await number.getAttribute('href'))!.replace(/\D/g, '');
    expect(digits).toMatch(/^1\d{10}$/);
    const shown = `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
    await expect(number).toHaveText(`Call ${shown}`);
    await expect(number).toHaveAttribute('href', `tel:+${digits}`);
    await expect(reach.getByRole('button', { name: 'Show number' })).toHaveCount(0);
    await expect(reach).toContainText('Based in Scarborough, working across Toronto and the GTA.');
    await page.goto('/');
    const footerCall = page.locator('footer .ftr__phone a[data-reach="call"]');
    await expect(footerCall).toContainText(shown);
    await expect(footerCall).toHaveAttribute('href', `tel:+${digits}`);
    await expect(page.locator('footer')).toContainText('Based in Scarborough, working across Toronto and the GTA.');
    expect(await (await request.get('/')).text()).not.toContain('X-XXXX');
  });

  test('footer column labels are styled text, not headings', async ({ page }) => {
    await page.goto('/');
    const labels = page.locator('footer .ftr__h');
    await expect(labels).toHaveText(['Pages', 'Services', 'Contact', 'Elsewhere']);
    expect(await labels.evaluateAll((els) => els.map((e) => e.tagName))).toEqual(['P', 'P', 'P', 'P']);
    await expect(page.locator('footer').getByRole('heading', { name: /^(Pages|Services|Contact|Elsewhere)$/ })).toHaveCount(0);
  });

  test('copy buttons copy the email address and confirm it', async ({ browser }) => {
    const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    await page.goto('/contact/');
    await page.locator('#reach').getByRole('button', { name: 'Copy' }).click();
    await expect(page.locator('.toast')).toHaveText('Copied info@mannpatel.me');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('info@mannpatel.me');
    await ctx.close();
  });

  test('without JavaScript, the phone buttons fall back to the contact page', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    const call = page.locator('.hero__reach a[data-reach="call"]');
    if ((await call.count()) > 0) await expect(call).toHaveAttribute('href', '/contact/#reach');
    await ctx.close();
  });
});

test.describe('enquiry form', () => {
  const send = (page: Page) => page.getByRole('button', { name: 'Send my brief' });
  const next = (page: Page) => page.getByRole('button', { name: 'Continue' });
  const fill = async (page: Page, msg = 'I run a two-chair salon in Scarborough and need a site that takes booking requests.') => {
    await page.locator('#f-name').fill('Test Owner');
    await page.locator('#f-email').fill('owner@example.ca');
    await page.locator('#f-business').fill('Example Salon');
    await page.locator('#f-website').fill('examplesalon.ca');
    await next(page).click();
    await page.locator('label.area', { hasText: 'Get found and chosen' }).click();
    await next(page).click();
    await page.locator('#f-message').fill(msg);
  };

  test('steps: progress, Back and Continue, and the plain-language areas come first', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.locator('[data-step-count]')).toHaveText('Step 1 of 3');
    await expect(send(page)).toBeHidden();
    await page.locator('#f-name').fill('Test Owner');
    await page.locator('#f-email').fill('owner@example.ca');
    await next(page).click();
    await expect(page.locator('[data-step-count]')).toHaveText('Step 2 of 3');
    for (const v of ['Get found and chosen', 'Enquiry follow-up and booking', 'A website that books work', 'Print and social content', 'Not sure yet']) {
      await expect(page.locator('label.area', { hasText: v })).toBeVisible();
    }
    await expect(page.locator('[data-svc-detail]')).not.toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.locator('#f-name')).toHaveValue('Test Owner');
    await expect(page.locator('[data-alt-email]')).toBeVisible();
  });

  test('links that pre-select services tick them and their areas', async ({ page }) => {
    await page.goto('/contact/?services=reviews,missed-calls');
    await expect(page.locator('[data-svc-detail]')).toHaveAttribute('open', '');
    await expect(page.locator('input[name="services"][value="reviews"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="area-found"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="area-follow-up"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="area-website"]')).not.toBeChecked();
  });

  test('a failed status check does not claim the form is disconnected', async ({ page }) => {
    await page.route('**/api/enquiry/', (route) =>
      route.request().method() === 'GET' ? route.fulfill({ status: 403, body: 'Forbidden' }) : route.continue(),
    );
    await page.goto('/contact/');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-brief] [data-not-connected]')).toBeHidden();
    await expect(next(page)).toBeEnabled();
  });

  test('shows accessible errors for missing or wrong fields, step by step', async ({ page }) => {
    await page.goto('/contact/');
    // Form states are not headings and are not in the page before submit (SEO audit, 14 Nov 2026).
    await expect(page.getByText('Please check these fields')).toHaveCount(0);
    await expect(page.getByText(/is on its way/)).toHaveCount(0);
    await next(page).click();
    const summary = page.locator('[data-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Please check these fields');
    await expect(summary.getByRole('heading')).toHaveCount(0);
    await expect(summary.locator('li')).toHaveCount(2);
    await expect(page.locator('#f-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#f-email')).toHaveAttribute('aria-invalid', 'true');
    // Step 3: an empty message alone moves focus to the field.
    await page.locator('#f-name').fill('Test Owner');
    await page.locator('#f-email').fill('owner@example.ca');
    await next(page).click();
    await next(page).click();
    await send(page).click();
    await expect(page.locator('#f-message')).toBeFocused();
    await expect(page.locator('#e-message')).toContainText('tell me a little');
    // A bad email found at the end takes you back to step 1, focused on the field.
    await page.locator('#f-message').fill('I run a two-chair salon in Scarborough and need a booking site.');
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('button', { name: 'Back' }).click();
    await page.locator('#f-email').fill('owner@');
    await page.locator('#f-email').blur();
    await next(page).click();
    await expect(page.locator('#f-email')).toBeFocused();
    await expect(page.locator('#e-email')).toContainText('doesn’t look complete');
  });

  test('success is shown only after the server accepts; the lead is recorded; resubmits are de-duplicated', async ({ page, request }) => {
    await page.goto('/contact/');
    await fill(page, `E2E success test ${Date.now()}: I run a two-chair salon and need help with enquiries.`);
    await page.waitForTimeout(3200); // the time check rejects submissions under 3 s
    let sawSending = false;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('/api/enquiry/')) sawSending = true;
    });
    await send(page).click();
    const success = page.locator('[data-brief] [data-success]');
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
    // Honest wording: accepted and passed on for delivery, not "arrived in the inbox".
    await expect(success).toContainText('Your brief is on its way');
    await expect(success.getByRole('heading')).toHaveCount(0);
    await expect(page.locator('[data-brief] [data-success-live]')).toHaveAttribute('aria-live', 'polite');
    await expect(success).toContainText('the email service took it for delivery');
    await expect(success).toContainText('took it for delivery');
    expect(sawSending).toBe(true);
    const id = (await page.locator('[data-brief] [data-success-id]').textContent())!.trim();
    expect(id).toMatch(/^enq_\d{8}_[0-9a-f]{8}$/);
    const store = await readFile('.data/enquiries.jsonl', 'utf8');
    expect(store).toContain(id);
    expect(store).toContain('area-found');

    // API-level duplicate protection
    const tokenRes = await (await request.get('/api/enquiry/')).json();
    await new Promise((r) => setTimeout(r, 3200));
    const payload = {
      name: 'Dup Test',
      email: 'dup@example.ca',
      message: `Duplicate protection check ${Date.now()} for the e2e suite.`,
      submissionId: `dup-${Date.now()}`,
      formToken: tokenRes.token,
    };
    const a = await (await request.post('/api/enquiry/', { data: payload })).json();
    const b = await (await request.post('/api/enquiry/', { data: payload })).json();
    expect(a.ok).toBe(true);
    expect(b).toMatchObject({ ok: true, id: a.id, duplicate: true });
  });

  test('a network failure keeps the answers and explains what to do', async ({ page }) => {
    await page.goto('/contact/');
    await fill(page);
    await page.route('**/api/enquiry/', (route) => (route.request().method() === 'POST' ? route.abort() : route.continue()));
    await send(page).click();
    const err = page.locator('[data-brief] [data-form-error]');
    await expect(err).toBeVisible();
    await expect(err).toContainText('wasn’t sent');
    await expect(err).toContainText('email me at');
    await expect(page.locator('#f-name')).toHaveValue('Test Owner');
    await expect(send(page)).toBeEnabled();
    await expect(page.locator('[data-brief] [data-success]')).toBeHidden();
  });

  test('when no delivery is configured, the form says so and offers to email the brief instead', async ({ page }) => {
    await page.goto('http://127.0.0.1:4322/contact/');
    await expect(page.locator('[data-brief] [data-not-connected]')).toBeVisible();
    await expect(page.locator('[data-brief] [data-not-connected]')).toContainText('Email this brief');
    await fill(page);
    const mailBtn = page.getByRole('button', { name: 'Email this brief' });
    await expect(mailBtn).toBeVisible();
    let posted = false;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('/api/enquiry/')) posted = true;
    });
    await mailBtn.click();
    const href = await page.locator('[data-brief-form]').getAttribute('data-mailto');
    expect(href).toMatch(/^mailto:info@mannpatel\.me\?subject=Project%20brief%20from%20Test%20Owner%20\(Example%20Salon\)&body=/);
    expect(decodeURIComponent(href!)).toContain('Help with: Get found and chosen: Google, Maps and reviews');
    expect(decodeURIComponent(href!)).toContain('two-chair salon');
    await expect(page.locator('[data-brief] [data-mail-note]')).toContainText('email app should open');
    expect(posted).toBe(false);
    await expect(page.locator('[data-brief] [data-success]')).toBeHidden();
    await expect(page.locator('#f-message')).not.toHaveValue('');
    // A way out that needs no email app: copy the brief.
    await expect(page.locator('[data-brief]').getByRole('button', { name: 'Copy my brief' })).toBeVisible();
  });

  test('if the server says it is not connected, the form switches to the email fallback', async ({ page }) => {
    await page.route('**/api/enquiry/', (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({ status: 403, body: 'Forbidden' })
        : route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, code: 'not_connected', message: 'The form isn’t connected yet.' }) }),
    );
    await page.goto('/contact/');
    await fill(page);
    await send(page).click();
    await expect(page.locator('[data-brief] [data-form-error]')).toContainText('Email this brief');
    await expect(page.getByRole('button', { name: 'Email this brief' })).toBeVisible();
  });

  test('works without JavaScript: one form, posts, and lands on the confirmation page', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://127.0.0.1:4321' });
    const page = await ctx.newPage();
    await page.goto('/contact/');
    await expect(page.locator('[data-steps-nav]')).toBeHidden();
    await expect(page.locator('#f-message')).toBeVisible();
    await page.locator('#f-name').fill('No JS Owner');
    await page.locator('#f-email').fill('nojs@example.ca');
    await page.locator('#f-message').fill(`No-JavaScript path ${Date.now()}: please contact me about a landing page.`);
    await send(page).click();
    await expect(page).toHaveURL(/\/contact\/received\/$/);
    await expect(page.locator('h1')).toHaveText('Thanks, your brief is on its way.');
    const store = await readFile('.data/enquiries.jsonl', 'utf8');
    expect(store).toContain('nojs@example.ca');
    await ctx.close();
  });

  test('server rejects the honeypot and a too-fast submission', async ({ request }) => {
    const tok = (await (await request.get('/api/enquiry/')).json()).token;
    const base = { name: 'Bot', email: 'bot@example.ca', message: 'Buy cheap things now, best prices guaranteed!!' };
    const hp = await request.post('/api/enquiry/', { data: { ...base, office_fax: 'x' } });
    expect(hp.status()).toBe(400);
    const fast = await request.post('/api/enquiry/', { data: { ...base, formToken: tok } });
    expect(fast.status()).toBe(400);
    expect((await fast.json()).code).toBe('too_fast');
  });
});

test.describe('motion (restrained in round 7)', () => {
  test('signal field: static dots without a GPU on the 404 page, and nowhere else', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/no-such-page/');
    const field = page.locator('.fx-field');
    await expect(field).toHaveAttribute('aria-hidden', 'true');
    // 14 Nov 2026: the home hero is the agent graph, drawn in SVG, so it needs no WebGL.
    for (const path of ['/', '/services/', '/work/', '/about/', '/contact/']) {
      await page.goto(path);
      await expect(page.locator('.fx-field')).toHaveCount(0);
      await expect(page.locator('canvas')).toHaveCount(0);
    }
  });

  test('reduced motion: no canvas and no decoding', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/?fx=gl');
    await page.mouse.move(400, 400);
    await page.waitForTimeout(1200);
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect(page.locator('.ag__photo')).toBeVisible();
    await expect(page.locator('[data-ag-toggle]')).toBeHidden();
    await expect(page.locator('[data-scramble] [aria-hidden="true"]')).toHaveCount(0);
    await ctx.close();
  });

  test('the agent graph pause button works from the keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const toggle = page.locator('[data-ag-toggle]');
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Play animation' })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('removed effects stay removed: no marquee, cursor follower, tilt or scroll-lit text', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of ['/', '/work/', '/about/']) {
      await page.goto(path);
      await page.mouse.move(300, 300);
      await page.mouse.move(320, 320);
      await expect(page.locator('[data-marquee], .cursor, .cursor-tag, [data-tilt], [data-scrub]')).toHaveCount(0);
    }
  });

  test('buttons lean toward the pointer and settle back when it leaves', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const btn = page.locator('.hero').getByRole('link', { name: 'Get a free website and Google check' });
    const box = (await btn.boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.8, { steps: 4 });
    await expect.poll(() => btn.evaluate((e) => (e as HTMLElement).style.translate)).not.toBe('');
    await page.mouse.move(10, 600, { steps: 4 });
    await expect.poll(() => btn.evaluate((e) => (e as HTMLElement).style.translate)).toBe('');
  });

  test('the hero labels are plain text, with no decoding effect (round 10: fewer elements around the portrait)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('.hero [data-scramble]')).toHaveCount(0);
    expect(await page.locator('.hero__hi').evaluate((e) => e.children.length)).toBe(0);
  });

  test('project cards light up under the pointer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const card = page.locator('#work article[data-spotlight]').first();
    await card.scrollIntoViewIfNeeded();
    const b = (await card.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
    await expect.poll(() => card.evaluate((e) => (e as HTMLElement).style.getPropertyValue('--mx'))).toMatch(/px$/);
  });

  test('page changes: the header holds still and the reading line tracks the scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/');
    expect(await page.locator('[data-header]').evaluate((e) => getComputedStyle(e).viewTransitionName)).toBe('site-header');
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(300);
    const scale = await page.locator('[data-header]').evaluate((e) => getComputedStyle(e, '::after').transform);
    expect(scale).not.toBe('none');
  });

  test('first-screen content does not wait for scripts (fast LCP)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: true });
    const page = await ctx.newPage();
    await page.route(/\/_astro\/.*\.js$/, (r) => r.abort());
    await page.goto('/work/nest-and-rest-cleaning/');
    await page.waitForTimeout(1600);
    const title = page.locator('h1 .line-mask > span').first();
    expect(await title.evaluate((e) => getComputedStyle(e).transform)).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
    expect(await page.locator('.cs-hero').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    await page.goto('/services/');
    await page.waitForTimeout(1600);
    expect(await page.locator('.ph__lead').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    await ctx.close();
  });

  test('fonts: the subset files load', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
    expect(loaded).toEqual(expect.arrayContaining(['Geist', 'Geist Mono']));
    expect(loaded).not.toContain('Signal Sans');
  });
});

test.describe('case studies (round 7)', () => {
  for (const [path, website, extra] of [
    ['/work/nest-and-rest-cleaning/', NEST_STATUS, 'Business opens summer 2027'],
    ['/work/samp-hair-spa/', 'In progress, preview online', null],
  ] as const) {
    test(`${path} leads with a summary and shows dated, real test evidence`, async ({ page, request }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const glance = page.locator('.glance');
      await expect(glance).toContainText(website);
      if (extra) await expect(glance).toContainText(extra);
      await expect(glance).toContainText('My role');
      await expect(glance).toContainText('The problem');
      const table = page.getByRole('table', { name: /Tested on/ });
      expect(await table.getByRole('row').count()).toBeGreaterThan(3);
      for (const h of ['Limitations', 'Outcomes', 'Next step']) await expect(page.getByRole('heading', { name: h })).toBeVisible();
      // A project-specific sharing card that really exists.
      const og = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(og).toMatch(/\/og\/work-[a-z-]+\.png$/);
      expect((await request.get(new URL(og!, page.url()).pathname)).status()).toBe(200);
    });
  }
});

test.describe('free check (short path)', () => {
  const panel = (page: Page) => page.locator('[data-check]');

  test('?package=check-up opens the short free-check form, and the full brief is one tap away', async ({ page }) => {
    await page.goto('/contact/?package=check-up#check');
    await expect(panel(page)).toBeVisible();
    await expect(page.locator('[data-brief]')).toBeHidden();
    await expect(page.getByRole('link', { name: /Free check/ })).toHaveAttribute('aria-current', 'true');
    // Only what the check needs: no services, budget or timeframe, and the note is optional.
    await expect(panel(page).locator('input[name="services"], [name="budget"], [name="timeframe"]')).toHaveCount(0);
    await expect(panel(page).locator('#c-message')).not.toHaveAttribute('required', '');
    await page.getByRole('link', { name: /Project brief/ }).click();
    await expect(page.locator('[data-brief]')).toBeVisible();
    await expect(panel(page)).toBeHidden();
  });

  test('asks for a website or a business name, and explains the either-or', async ({ page }) => {
    await page.goto('/contact/?package=check-up');
    await panel(page).getByRole('button', { name: 'Request the free check' }).click();
    await expect(page.locator('#c-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#ce-website')).toContainText('or your business name');
    await expect(page.locator('#c-name')).toBeFocused();
  });

  test('an owner with no website can request the check with a business name, and it is recorded once', async ({ page }) => {
    await page.goto('/contact/?package=check-up');
    const stamp = Date.now();
    await page.locator('#c-name').fill('No Site Owner');
    await page.locator('#c-email').fill(`nosite-${stamp}@example.ca`);
    await page.locator('#c-business').fill(`Corner Bakery ${stamp}`);
    await page.waitForTimeout(3200); // the time check rejects submissions under 3 s
    const submit = panel(page).getByRole('button', { name: 'Request the free check' });
    await submit.dblclick();
    const done = panel(page).locator('[data-success]');
    await expect(done).toBeVisible();
    await expect(done).toContainText('Your check request is on its way');
    const id = (await done.locator('[data-success-id]').textContent())!.trim();
    const store = await readFile('.data/enquiries.jsonl', 'utf8');
    const lines = store.split('\n').filter((l) => l.includes(`Corner Bakery ${stamp}`));
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('"packageId":"check-up"');
    expect(lines[0]).toContain(id);
  });

  test('when direct sending is off, the check offers the email app or copying, and sends nothing', async ({ page }) => {
    await page.goto('http://127.0.0.1:4322/contact/?package=check-up');
    await expect(panel(page).locator('[data-not-connected]')).toBeVisible();
    await page.locator('#c-name').fill('Test Owner');
    await page.locator('#c-email').fill('owner@example.ca');
    await page.locator('#c-website').fill('examplesalon.ca');
    let posted = false;
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('/api/enquiry/')) posted = true;
    });
    await panel(page).getByRole('button', { name: 'Email this request' }).click();
    const href = await page.locator('[data-check-form]').getAttribute('data-mailto');
    expect(decodeURIComponent(href!)).toContain('Free check request from Test Owner');
    expect(decodeURIComponent(href!)).toContain('Website: examplesalon.ca');
    await expect(panel(page).getByRole('button', { name: 'Copy my request' })).toBeVisible();
    expect(posted).toBe(false);
  });

  test('a network failure keeps the answers and offers to copy them', async ({ page }) => {
    await page.goto('/contact/?package=check-up');
    await page.locator('#c-name').fill('Test Owner');
    await page.locator('#c-email').fill('owner@example.ca');
    await page.locator('#c-website').fill('examplesalon.ca');
    await page.route('**/api/enquiry/', (route) => (route.request().method() === 'POST' ? route.abort() : route.continue()));
    await panel(page).getByRole('button', { name: 'Request the free check' }).click();
    await expect(panel(page).locator('[data-form-error]')).toContainText('wasn’t sent');
    await expect(panel(page).getByRole('button', { name: 'Copy my request' })).toBeVisible();
    await expect(page.locator('#c-website')).toHaveValue('examplesalon.ca');
  });

  test('the privacy page describes both the direct and the email-app path', async ({ page }) => {
    await page.goto('/privacy/');
    const main = page.locator('main');
    await expect(main).toContainText('When the form can send directly');
    await expect(main).toContainText('opens your own email app');
    await expect(main).toContainText('Free check');
  });
});

// 11 Nov 2026 audit (docs/23-website-audit/): the wording matches what the packages deliver, the
// free check has one name, and phones reach useful content sooner.
test.describe('audit of 11 Nov 2026', () => {
  test('no page promises more than a package delivers, or gates a quote behind the free check', async ({ page }) => {
    const banned = [
      'Quoted after your free check',
      'Never miss an enquiry',
      'none are missed',
      'each one gets a reply',
      'answers every enquiry',
      'Found & Answered',
      'five to seven pages',
    ];
    for (const path of PAGES) {
      await page.goto(path);
      // Every answer and every package detail, open or not.
      const text = await page.evaluate(() => document.body.textContent ?? '');
      for (const phrase of banned) expect(text, `${path} should not say “${phrase}”`).not.toContain(phrase);
    }
  });

  test('the free check has one name from the hero button to the form', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hero').getByRole('link', { name: 'Get a free website and Google check' }).click();
    await expect(page).toHaveURL(/\/contact\/\?package=check-up#check$/);
    await expect(page.locator('#check-title')).toHaveText('Free website and Google check');
    await page.goto('/');
    await expect(page.locator('#check-title')).toContainText('Get a free website and Google check.');
    await expect(page.locator('#check .fc__lead')).toContainText('Send your website or business name');
  });

  test('published prices agree everywhere, and the check stays optional', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#what-i-do')).toContainText('Website Launch · $1,950');
    await expect(page.locator('.hero__price')).toContainText('$650 Google and AI visibility setup');
    await page.goto('/services/');
    await expect(page.locator('#packages')).toContainText('The free check is separate, with no obligation.');
    await page.goto('/pricing/');
    await expect(page.locator('main')).toContainText('$975 at kickoff and $975 once the site passes those checks');
  });

  test('presenter mode: ?present=1 enlarges the type, stays on across pages, and arrow keys move section by section', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/?present=1');
    await expect(page.locator('html')).toHaveAttribute('data-present', '');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe('18px');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
    await page.goto('/vision/');
    await expect(page.locator('html')).toHaveAttribute('data-present', '');
    await page.goto('/?present=0');
    await expect(page.locator('html')).not.toHaveAttribute('data-present', '');
  });

  test('the vision page: founder story for partners, linked from the menu and the hero, with real shipped work', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero a.hero__vision')).toHaveAttribute('href', '/vision/');
    await page.goto('/vision/');
    await expect(page.locator('h1')).toContainText('Local businesses do the work.');
    for (const href of ['/work/nest-and-rest-cleaning/', '/work/samp-hair-spa/', '/services/']) await expect(page.locator(`main a[href="${href}"]`).first()).toBeVisible();
    await expect(page.locator('main')).not.toContainText('CHECKMATE');
  });

  test('the headline keeps its service and place words', async ({ page }) => {
    await page.goto('/');
    const lines = page.locator('#hero-title .hero__line');
    await expect(lines.nth(0)).toHaveText('Websites and local SEO');
    await expect(lines.nth(1)).toHaveText('for Toronto small businesses.');
    // 14 Nov 2026 (founder profile): the outcome line sits under the H1 instead of inside it.
    await expect(page.locator('#hero-title .hero__place')).toHaveCount(0);
    await expect(page.locator('.hero .hero__place')).toHaveText('Get found on Google and in AI answers, then turn searches into bookings.');
  });

  test('phones: the hero photo is sized for the screen, and the pause button is reachable on touch', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto('/');
    const photo = page.locator('.ag__photo');
    expect(await photo.getAttribute('srcset')).toMatch(/240w.*360w.*480w.*640w/);
    await page.waitForFunction(() => (document.querySelector('.ag__photo') as HTMLImageElement).complete);
    const loaded = await photo.evaluate((img: HTMLImageElement) => new URL(img.currentSrc).pathname);
    expect(loaded).not.toMatch(/240w/);
    await expect(page.locator('[data-ag-toggle]')).toBeVisible();
    const box = (await page.locator('[data-ag-toggle]').boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    await context.close();
  });

  test('about on a phone: the portrait comes before the links and contact buttons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/about/');
    // 14 Nov 2026: About uses the same close-crop photo as the hero.
    await expect(page.locator('.ab-photo img')).toHaveAttribute('src', /mann-patel-hero/);
    const pos = await page.evaluate(() => ({
      lead: document.querySelector('.ab-head .lead')!.getBoundingClientRect().bottom + scrollY,
      photo: document.querySelector('.ab-photo')!.getBoundingClientRect().top + scrollY,
      reach: document.querySelector('.ab-reach')!.getBoundingClientRect().top + scrollY,
    }));
    expect(pos.photo).toBeGreaterThanOrEqual(pos.lead);
    expect(pos.photo).toBeLessThan(pos.reach);
    expect(pos.photo).toBeLessThanOrEqual(760);
    await noHorizontalOverflow(page);
    // Desktop keeps the photo beside the introduction.
    await page.setViewportSize({ width: 1440, height: 900 });
    const side = await page.evaluate(() => {
      const t = document.querySelector('.ab-head__text')!.getBoundingClientRect();
      const p = document.querySelector('.ab-photo')!.getBoundingClientRect();
      return p.left >= t.right;
    });
    expect(side).toBe(true);
  });
});

test.describe('desktop layout (14 Nov 2026)', () => {
  test('the hero fills the first screen, so no strip of the light section below shows', async ({ page }) => {
    for (const [w, h] of [[1440, 900], [1680, 1050], [1920, 1080], [1280, 720]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const bottom = await page.evaluate(() => document.querySelector('.hero')!.getBoundingClientRect().bottom);
      expect(bottom).toBeGreaterThanOrEqual(h - 1);
    }
  });

  test('the home price list lines up: names, scopes and prices in the same columns on every row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const cols = await page.$$eval('#prices .pt__row', (rows) =>
      rows.map((r) => ({
        name: Math.round(r.querySelector('.pt__name')!.getBoundingClientRect().left),
        scope: Math.round(r.querySelector('.pt__boundary')!.getBoundingClientRect().left),
        price: Math.round(r.querySelector('.pt__price')!.getBoundingClientRect().right),
      })),
    );
    expect(cols).toHaveLength(5);
    for (const key of ['name', 'scope', 'price'] as const) expect(new Set(cols.map((c) => c[key])).size).toBe(1);
  });

  test('pricing: the offers sit in an even grid and the comparison columns are equal widths', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/pricing/');
    const tiles = await page.$$eval('.pr__grid > li', (els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(tiles).toHaveLength(6); // five offers and the free check
    expect(Math.max(...tiles) - Math.min(...tiles)).toBeLessThanOrEqual(1);
    await expect(page.locator('#pkg-check-up').getByRole('link', { name: 'Request the free check' })).toHaveAttribute('href', '/contact/?package=check-up#check');
    const table = page.getByRole('table', { name: 'Side by side' });
    const widths = await table.locator('thead th').evaluateAll((ths) => ths.map((t) => Math.round(t.getBoundingClientRect().width)));
    expect(widths).toHaveLength(5);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
    // The price is the first row under the package names.
    await expect(table.locator('tbody tr').first().getByRole('rowheader')).toHaveText('Price');
  });
});
