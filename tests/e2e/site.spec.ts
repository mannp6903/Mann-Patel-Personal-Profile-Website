import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';

// The Nest & Rest address is switched off in src/data/site.ts while it can't be reached
// (`siteLive`, growth audit of 10 Nov 2026). These tests follow the switch either way.
const NEST_URL = 'https://nestnrestcleaning.com/';
const NEST_LIVE = /siteLive: true/.test(readFileSync('src/data/site.ts', 'utf8'));
const NEST_STATUS = NEST_LIVE ? 'Website live' : 'Launched Oct 2026 · live link paused';

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
      expect(ld).toContain('Nest & Rest Cleaning');
    }
  });

  test('robots.txt blocks indexing on previews', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Disallow: /');
  });

  test('structured data is valid JSON and makes no rating or address claims', async ({ page }) => {
    for (const path of ['/', '/services/', '/about/', '/services/web-design/', '/services/local-visibility/', '/services/enquiry-follow-up/', '/pricing/']) {
      await page.goto(path);
      const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ''));
      expect(blocks.length).toBeGreaterThan(0);
      // No rating, street address or award properties (the words may appear in answers, e.g. "home address hidden").
      for (const b of blocks) expect(JSON.stringify(JSON.parse(b))).not.toMatch(/"(aggregateRating|address|award)":/i);
      if (path === '/' || path === '/services/') expect(blocks.join(' ')).toContain('"ProfessionalService"');
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
    test(`hero promise is the H1 and "Start a project" is visible without scrolling at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const h1 = page.locator('h1');
      await expect(h1).toContainText('Found.');
      await expect(h1).toContainText('Websites, local search and enquiry follow-up for Toronto service businesses.');
      const cta = page.locator('.hero').getByRole('link', { name: 'Start a project' });
      await expect(cta).toBeInViewport();
      await expect(page.locator('.hero').getByRole('link', { name: 'See selected work' })).toHaveAttribute('href', '#work');
    });
  }

  // Acceptance targets from the 8 Nov 2026 audit: real work comes straight after a compact hero.
  // Round 8 added the tuner (dial and caption) to the phone hero, so the phone target moved down
  // by its height; on desktop the tuner sits beside the copy and nothing moved.
  for (const [w, h, maxHeading, maxCard] of [
    [1440, 1000, 1100, 1500],
    [390, 844, 1450, 1560],
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
    await btn.click();
    const sheet = page.locator('#site-menu');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(sheet.locator('a[href="/terms/"]')).toBeVisible();
    await page.keyboard.press('Escape');
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
  test('the portrait starts clear; the radio dial is optional and locks back onto Mann at 104.3', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const tune = page.locator('[data-tune]');
    await expect(tune).toHaveClass(/is-live/);
    // Recognisable at once: tuned in from the start, no static, no flash on load (audit 8 Nov 2026).
    await expect(tune).toHaveClass(/is-locked/);
    await expect(tune.locator('img')).toHaveAttribute('alt', /Mann Patel smiling/);
    const detune = () => page.locator('[data-tune-screen]').evaluate((e) => Number(getComputedStyle(e).getPropertyValue('--d')));
    expect(await detune()).toBe(0);
    await expect(page.locator('.hero')).not.toHaveClass(/is-locked|is-tuning/);
    await expect(page.locator('[data-tune-status]')).toHaveText('On air: Mann Patel, Toronto. Try the dial.');
    const dial = page.getByRole('slider', { name: 'Try the dial' });
    await expect(dial).toHaveAttribute('aria-valuetext', '104.3 FM, signal locked');
    // Keyboard: away to the end of the band, the signal is lost and the page says how to get it back.
    await dial.focus();
    await page.keyboard.press('End');
    await expect(page.locator('[data-tune-freq]')).toHaveText('107.9');
    await expect(tune).not.toHaveClass(/is-locked/);
    await expect(page.locator('[data-tune-status]')).toHaveText('Signal lost. Tune back to 104.3.');
    expect(await detune()).toBeGreaterThan(0.3);
    // Page Down twice and one step up lands within the station's detent.
    await page.keyboard.press('PageDown');
    await page.keyboard.press('PageDown');
    await expect(tune).not.toHaveClass(/is-locked/);
    await page.keyboard.press('ArrowRight');
    await expect(tune).toHaveClass(/is-locked/);
    await expect(page.locator('.hero')).toHaveClass(/is-locked/);
    await expect(dial).toHaveAttribute('aria-valuetext', '104.3 FM, signal locked');
    await expect(page.locator('[data-tune-status]')).toHaveText('Signal locked: Mann Patel, Toronto.');
    await expect.poll(detune).toBe(0);
    await expect.poll(() => tune.locator('.tune__tx').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  });

  test('dragging across the photo tunes it, and nothing detunes on its own', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const freq = page.locator('[data-tune-freq]');
    await page.waitForTimeout(3000);
    await expect(freq).toHaveText('104.3');
    await expect(page.locator('[data-tune]')).toHaveClass(/is-locked/);
    const screen = page.locator('[data-tune-screen]');
    const b = (await screen.boundingBox())!;
    await page.mouse.move(b.x + b.width * 0.6, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width * 0.3, b.y + b.height / 2, { steps: 5 });
    await page.mouse.up();
    // A third of the photo's width is about a third of the FM band (19.8 MHz).
    expect(104.3 - Number(await freq.textContent())).toBeGreaterThan(4);
    await expect(page.locator('[data-tune]')).not.toHaveClass(/is-locked/);
  });

  test('the headline acts out its words, rests in the finished state, and replays on hover', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Found.');
    await expect(h1).toContainText('Answered.');
    await expect(h1).toContainText('Booked.');
    // The pin, bubble, ticks and circle are decoration: hidden from screen readers, no text.
    const deco = h1.locator('[aria-hidden="true"]');
    expect(await deco.count()).toBeGreaterThanOrEqual(5);
    expect((await deco.allTextContents()).join('').trim()).toBe('');
    // Finished: pin on the full stop, read ticks drawn, "Booked." circled.
    await expect.poll(() => page.locator('.hw__pin').evaluate((e) => getComputedStyle(e).opacity), { timeout: 8000 }).toBe('1');
    const offset = (sel: string) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).strokeDashoffset);
    await expect.poll(() => offset('.hw__circle path'), { timeout: 8000 }).toMatch(/^0(px)?$/);
    await expect.poll(() => offset('.hw__ticks path')).toMatch(/^0(px)?$/);
    // Hovering a word plays its scene again.
    await page.waitForTimeout(600);
    await page.locator('.hw--found .hw__w').hover();
    expect(await page.locator('.hw--found .hw__w').evaluate((e) => e.getAnimations({ subtree: true }).some((a) => a.playState === 'running'))).toBe(true);
  });

  test('reduced motion: the headline shows its finished state at once', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    expect(await page.locator('.hw__pin').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    expect(await page.locator('.hw__circle path').evaluate((e) => getComputedStyle(e).strokeDashoffset)).toMatch(/^0(px)?$/);
    expect(await page.locator('.hw__w').first().evaluate((e) => e.getAnimations({ subtree: true }).length)).toBe(0);
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
  });

  test('the home page shows a labelled walkthrough with fictional data, keyboard-operable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const demo = page.locator('#home-demo');
    await expect(demo).toContainText('Demonstration · fictional data');
    const steps = demo.getByRole('button');
    await expect(steps).toHaveCount(5);
    await steps.nth(2).focus();
    await page.keyboard.press('Enter');
    await expect(steps.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(demo.locator('[data-state="2"]')).toBeVisible();
    await expect(demo.locator('[data-state="2"]')).toContainText('Reminder');
    // It comes straight after the real work.
    const order = await page.evaluate(() => [...document.querySelectorAll('main > section')].map((s) => s.id).filter(Boolean));
    expect(order.indexOf('walkthrough')).toBe(order.indexOf('work') + 1);
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

  test('reduced motion: headings and reveals are visible immediately and the hero words do not animate', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    expect(await page.locator('.hw').first().evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
    expect(await page.evaluate(() => document.documentElement.classList.contains('js-motion'))).toBe(false);
    // The tuner starts locked: the clear photo, no static, nothing moving.
    await expect(page.locator('[data-tune]')).toHaveClass(/is-locked/);
    await expect(page.locator('[data-tune-freq]')).toHaveText('104.3');
    expect(await page.locator('.tune__line').first().evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
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
      for (const name of ['Home', 'Services', 'Work', 'About', 'Contact', 'Start a project', 'Privacy', 'Terms'])
        await expect(sheet.getByRole('link', { name, exact: name !== 'Start a project' })).toBeInViewport();
      await expect(sheet.getByRole('link', { name: /Email Mann/ })).toBeInViewport();
    });
  }

  test('phones: Contact stays one tap away, and the clear portrait follows the buttons', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const cta = page.locator('[data-header]').getByRole('link', { name: 'Contact', exact: true });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/contact/');
    await expect(page.locator('[data-menu-open]')).toBeVisible();
    const gap = await page.evaluate(
      () => document.querySelector('[data-tune]')!.getBoundingClientRect().top - document.querySelector('.hero__actions')!.getBoundingClientRect().bottom,
    );
    expect(gap).toBeLessThan(60);
    await page.locator('[data-tune-screen]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-tune]')).toHaveClass(/is-locked/);
    await expect(page.locator('.hero')).not.toHaveClass(/is-tuning/);
  });

  test('the real, whole photo is in the hero at every size, with the way into About', async ({ page }) => {
    for (const [w, h] of [[390, 844], [820, 1180], [1440, 900]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const photo = page.locator('[data-tune] img');
      await expect(photo).toBeVisible();
      await expect(photo).toHaveAttribute('alt', /Mann Patel smiling/);
      await page.waitForFunction(() => (document.querySelector('[data-tune] img') as HTMLImageElement).naturalWidth > 0);
      await expect(page.locator('[data-tune]').getByRole('link', { name: 'Who is this guy?' })).toHaveAttribute('href', '/about/');
    }
    await expect(page.locator('.hero__photo, #hero-art, .hero__avatar')).toHaveCount(0);
    await expect(page.locator('section.about img')).toHaveCount(0);
  });

  test('without JavaScript, the header links show and content is visible', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('.hdr__nav').getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.locator('[data-menu-open]')).toBeHidden();
    // The tuner without JavaScript: just the clear photo and its three lines; no dial.
    await expect(page.locator('[data-tune] img')).toBeVisible();
    expect(await page.locator('[data-tune] img').evaluate((e) => getComputedStyle(e).getPropertyValue('--d').trim())).toBe('0');
    await expect(page.locator('.tune__dial')).toBeHidden();
    await expect(page.locator('.tune__hud')).toBeHidden();
    await expect(page.locator('.tune__line').first()).toBeVisible();
    await ctx.close();
  });
});

test.describe('phones: short pages', () => {
  // Screens of 390 × 844. Budgets keep the phone layout from growing back into a long scroll.
  // Case studies: 7 since round 7 added the at-a-glance summary and the tested-behaviour evidence.
  // Round 10 (competitor audit, which judges sections by usefulness rather than length) added the
  // labelled walkthrough to Home, package boundaries to Services and the professional intro to About.
  const BUDGET: Record<string, number> = {
    '/': 12.5, // the real photo in the phone hero, the labelled walkthrough, and call/WhatsApp in the footer
    '/services/': 13.5,
    '/work/': 4.5,
    '/work/nest-and-rest-cleaning/': 7,
    '/work/samp-hair-spa/': 7,
    '/about/': 7.5,
    '/contact/': 3.5,
    '/services/web-design/': 10.75,
    '/services/local-visibility/': 9.5,
    '/services/enquiry-follow-up/': 10.5,
    '/pricing/': 11.5,
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

  test('the long question list folds after five, and one tap shows the rest', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/services/');
    const items = page.locator('#faq details');
    const total = await items.count();
    expect(total).toBeGreaterThan(6);
    await expect(items.nth(5)).toBeHidden();
    const more = page.getByRole('button', { name: `Show all ${total} questions` });
    await more.click();
    await expect(items.nth(5)).toBeVisible();
    await expect(more).toBeHidden();
    await expect(items.nth(5).locator('summary')).toBeFocused();
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

test.describe('services', () => {
  test('a link to a service opens it', async ({ page }) => {
    await page.goto('/services/#booking');
    await expect(page.locator('details#booking')).toHaveAttribute('open', '');
    await expect(page.locator('#booking').getByRole('link', { name: 'Ask about this' })).toHaveAttribute('href', '/contact/?service=booking#brief');
  });

  test('packages each ask for a quote with the package pre-selected', async ({ page }) => {
    await page.goto('/services/');
    const links = page.locator('#packages .pkg').getByRole('link', { name: /Request a quote for/ });
    await expect(links).toHaveCount(4);
    await links.first().click();
    await expect(page.locator('#f-package')).toHaveValue('website-launch');
  });

  test('old package links from before round 10 still pre-select the closest package', async ({ page }) => {
    for (const [old, now] of [['launch', 'website-enquiry'], ['found', 'local-visibility'], ['answered', 'website-enquiry'], ['website', 'website-launch']]) {
      await page.goto(`/contact/?package=${old}#brief`);
      await expect(page.locator('#f-package')).toHaveValue(now);
    }
  });

  test('the four packages compare side by side, and every price line agrees (cards, table, pricing page)', async ({ page }) => {
    await page.goto('/services/');
    const table = page.getByRole('table', { name: 'Compare the packages' });
    for (const name of ['Website Launch', 'Website + Enquiry System', 'Local Visibility Setup', 'Website Care'])
      await expect(table.getByRole('columnheader', { name })).toBeVisible();
    for (const row of ['Best for', 'Boundary', 'Covers', 'Not included', 'You provide', 'Paid to others', 'Timeline', 'Price', 'Next step'])
      await expect(table.getByRole('rowheader', { name: row })).toBeVisible();
    await expect(table.getByRole('link', { name: /Request a quote for Website Launch/ })).toHaveAttribute('href', '/contact/?package=website-launch#brief');
    const cardPrices = await page.locator('#packages .pkg [data-price]').allInnerTexts();
    const tablePrices = await table.locator('[data-price]').allInnerTexts();
    expect(cardPrices).toHaveLength(4);
    expect(tablePrices).toEqual(cardPrices);
    await page.goto('/pricing/');
    expect(await page.locator('.pkg [data-price]').allInnerTexts()).toEqual(cardPrices);
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

  test('pricing: built for review, but not linked while no price is approved', async ({ page }) => {
    await page.goto('/pricing/');
    const prices = await page.locator('.pkg [data-price]').allInnerTexts();
    const unpriced = prices.every((t) => t === 'Quoted after your free check');
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
  test('email, call, WhatsApp and text buttons work, and the full number is not in the HTML', async ({ page, request }) => {
    await page.goto('/');
    const hero = page.locator('.hero__reach');
    await expect(hero.getByRole('link', { name: /Email Mann/ })).toHaveAttribute('href', /^mailto:info@mannpatel\.me\?subject=/);
    const call = hero.getByRole('link', { name: 'Call Mann' });
    test.skip((await call.count()) === 0, 'Build with PUBLIC_CONTACT_PHONE (e.g. +16475550142) to test the phone buttons.');
    const html = await (await request.get('/')).text();
    const digits = (await call.getAttribute('href'))!.replace(/\D/g, '');
    expect(digits).toMatch(/^1\d{10}$/);
    expect(html).not.toContain(digits.slice(1));
    await expect(call).toHaveAttribute('href', `tel:+${digits}`);
    await expect(hero.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', new RegExp(`^https://wa\\.me/${digits}\\?text=`));
    await expect(hero.getByRole('link', { name: /text message/ })).toHaveAttribute('href', new RegExp(`^sms:\\+${digits}`));
    await page.goto('/contact/');
    await expect(page.locator('#reach .ca__number')).toContainText(/\d{3}-\d{2}X-XXXX/);
  });

  test('call and WhatsApp are in the footer and the phone menu; LinkedIn is a button in the footer, menu and About', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('a[data-reach="call"]').first()).toHaveAttribute('href', /^tel:\+1\d{10}$/);
    await expect(footer.getByRole('link', { name: /Message on WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\/1\d{10}\?text=/);
    await expect(footer.getByRole('link', { name: 'Mann Patel on LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/mannp6903/');
    await page.locator('[data-menu-open]').click();
    const sheet = page.locator('[data-menu]');
    await expect(sheet.getByRole('link', { name: 'Call Mann' })).toHaveAttribute('href', /^tel:\+1\d{10}$/);
    await expect(sheet.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
    await expect(sheet.getByRole('link', { name: 'Mann Patel on LinkedIn' })).toBeInViewport();
    await page.goto('/about/');
    await expect(page.locator('main').getByRole('link', { name: 'Mann Patel on LinkedIn' })).toBeVisible();
    // Only confirmed profiles: no Instagram or Facebook button until a link is set.
    await expect(page.locator('a[data-contact="instagram"], a[data-contact="facebook"]')).toHaveCount(0);
    // Structured data lists the confirmed profiles.
    const ld = (await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ''))).join(' ');
    expect(ld).toContain('https://www.linkedin.com/in/mannp6903/');
  });

  test('"Show number" reveals the full number on request; the page source never has it', async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/contact/');
    const reach = page.locator('#reach');
    await expect(reach.locator('[data-phone-text]')).toHaveText(/^\d{3}-\d{2}X-XXXX$/);
    const full = (await reach.locator('a[data-reach="call"]').first().getAttribute('href'))!.replace(/\D/g, '');
    for (const path of ['/', '/contact/', '/about/', '/services/'])
      expect(await (await request.get(path)).text()).not.toContain(full.slice(1));
    await reach.getByRole('button', { name: 'Show number' }).click();
    await expect(reach.locator('[data-phone-text]')).toHaveText(`${full.slice(1, 4)}-${full.slice(4, 7)}-${full.slice(7)}`);
    await expect(reach.locator('[data-phone-text]')).toBeFocused();
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
    for (const v of ['Get found and chosen', 'Never miss an enquiry', 'A website that books work', 'Print and social content', 'Not sure yet']) {
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
    await next(page).click();
    const summary = page.locator('[data-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
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
  test('signal field: static dots without a GPU, and the WebGL shader compiles and draws when one is available', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const field = page.locator('.hero .fx-field');
    await expect(field).toHaveAttribute('aria-hidden', 'true');
    await page.waitForTimeout(1500);
    await expect(field.locator('canvas')).toHaveCount(0);
    expect(await field.evaluate((e) => getComputedStyle(e, '::before').backgroundImage)).toContain('radial-gradient');
    // Forcing the software renderer proves the shader compiles, links and draws.
    await page.goto('/?fx=gl');
    await expect(field).toHaveClass(/is-gl/, { timeout: 10_000 });
    // Only the hero and the 404 page carry it; inner page titles stay plain.
    for (const path of ['/services/', '/work/', '/about/', '/contact/']) {
      await page.goto(path);
      await expect(page.locator('.fx-field')).toHaveCount(0);
    }
  });

  test('reduced motion: no WebGL and no decoding', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/?fx=gl');
    await page.mouse.move(400, 400);
    await page.waitForTimeout(1200);
    await expect(page.locator('.fx-field canvas')).toHaveCount(0);
    await expect(page.locator('[data-scramble] [aria-hidden="true"]')).toHaveCount(0);
    await ctx.close();
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
    const btn = page.locator('.hero').getByRole('link', { name: 'Start a project' });
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
    expect(await page.locator('.hero .eyebrow').first().evaluate((e) => e.children.length)).toBe(0);
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
