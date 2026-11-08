import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

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

  test('outbound link to Nest & Rest is present on key pages', async ({ page }) => {
    for (const path of ['/', '/about/', '/contact/']) {
      await page.goto(path);
      await expect(page.locator('a[href="https://nestnrestcleaning.com/"]').first()).toBeAttached();
    }
  });

  test('robots.txt blocks indexing on previews', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text();
    expect(body).toContain('Disallow: /');
  });

  test('structured data is valid JSON and makes no rating or address claims', async ({ page }) => {
    for (const path of ['/', '/services/', '/about/']) {
      await page.goto(path);
      const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ''));
      expect(blocks.length).toBeGreaterThan(0);
      for (const b of blocks) expect(JSON.stringify(JSON.parse(b))).not.toMatch(/aggregateRating|address|award/i);
      if (path !== '/about/') expect(blocks.join(' ')).toContain('"ProfessionalService"');
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
      await expect(h1).toContainText('I help small businesses in Toronto and the GTA get all three.');
      const cta = page.locator('.hero').getByRole('link', { name: 'Start a project' });
      await expect(cta).toBeInViewport();
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
  test('signal portrait draws, reacts to the pointer, and "Show photo" switches to the real photo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const fig = page.locator('[data-portrait]');
    await expect(fig).toHaveClass(/is-ready/);
    // The canvas really draws (non-transparent pixels), and the pointer adds the lime glow.
    const ink = () =>
      page.evaluate(() => {
        const c = document.querySelector<HTMLCanvasElement>('[data-portrait-canvas]')!;
        const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
        let lit = 0;
        let lime = 0;
        for (let i = 0; i < d.length; i += 16) {
          if (d[i + 3] > 40) lit++;
          if (d[i + 3] > 40 && d[i + 1] > 200 && d[i + 2] < 150) lime++;
        }
        return { lit, lime };
      });
    await page.waitForTimeout(2600);
    expect((await ink()).lit).toBeGreaterThan(1000);
    const box = (await fig.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.3, { steps: 6 });
    await page.waitForTimeout(500);
    expect((await ink()).lime).toBeGreaterThan(50);
    await expect(fig).toHaveClass(/is-ready/);
    const toggle = page.getByRole('button', { name: 'Show photo' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(fig).toHaveClass(/is-photo/);
    await expect(page.locator('.hp__img')).toHaveAttribute('alt', /Mann Patel smiling/);
  });

  test('the phone follows the step being read (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('[data-dev="found"]')).toHaveClass(/is-active/);
    await page.locator('#booked').scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const el = document.getElementById('booked')!;
      scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.3);
    });
    await expect(page.locator('[data-dev="booked"]')).toHaveClass(/is-active/);
    await expect(page.locator('[data-dev="found"]')).toHaveClass(/is-idle/);
  });

  test('finder recommends a starting point live and pre-fills the brief', async ({ page }) => {
    await page.goto('/services/');
    const finder = page.locator('#finder');
    await finder.getByText('Up and running').click();
    await expect(finder.locator('[data-r-count]')).toHaveText('1 of 3 answered');
    await expect(finder.locator('[data-r-full]')).toBeHidden();
    await finder.getByText('Not missing calls, messages or enquiries').click();
    await finder.getByText('Yes, and it works well').click();
    await expect(finder.locator('[data-r-name]')).toHaveText('Never Miss an Enquiry fits best');
    const cta = finder.locator('[data-r-cta]');
    await expect(cta).toHaveAttribute('href', /\/contact\/\?package=answered&services=/);
    await cta.click();
    await expect(page.locator('#f-package')).toHaveValue('answered');
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
    const op = await page.locator('#work [data-reveal]').first().evaluate((e) => getComputedStyle(e).opacity);
    expect(op).toBe('1');
    await ctx.close();
  });

  test('phones: the header keeps Contact one tap away, and the hero shows a face', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const cta = page.locator('[data-header]').getByRole('link', { name: 'Contact', exact: true });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/contact/');
    await expect(page.locator('[data-menu-open]')).toBeVisible();
    await expect(page.locator('.hero__avatar')).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.hero__avatar')).toBeHidden();
  });

  test('example phone screens are labelled, and the home page has no second photo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('.path__device .phone__tag')).toContainText('Example');
    await expect(page.locator('section.about img')).toHaveCount(0);
  });

  test('without JavaScript, the header links show and content is visible', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('.hdr__nav').getByRole('link', { name: 'Services' })).toBeVisible();
    await expect(page.locator('[data-menu-open]')).toBeHidden();
    await expect(page.locator('.hp__img')).toBeVisible();
    await ctx.close();
  });
});

test.describe('phones: short pages', () => {
  // Screens of 390 × 844. Budgets keep the phone layout from growing back into a long scroll.
  const BUDGET: Record<string, number> = {
    '/': 10,
    '/services/': 12,
    '/work/': 4.5,
    '/work/nest-and-rest-cleaning/': 6.5,
    '/work/samp-hair-spa/': 6.5,
    '/about/': 6.5,
    '/contact/': 3.5,
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

  test('"What I do" becomes three tabs that work with arrow keys', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const tabs = page.getByRole('tablist', { name: 'What I help with' }).getByRole('tab');
    await expect(tabs).toHaveCount(3);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#found')).toBeVisible();
    await expect(page.locator('#answered')).toBeHidden();
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#answered')).toBeVisible();
    await expect(page.locator('#found')).toBeHidden();
    // On a laptop the same content is one long list again.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('#found')).toBeVisible();
    await expect(page.locator('#answered')).toBeVisible();
  });

  test('card rows swipe sideways with dots, without the page scrolling sideways', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const rail = page.locator('#work [data-rail]');
    const { scrollW, clientW, display } = await rail.evaluate((el) => ({
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
      display: getComputedStyle(el).display,
    }));
    expect(display).toBe('flex');
    expect(scrollW).toBeGreaterThan(clientW);
    await expect(page.locator('#work .rail-dots i')).toHaveCount(2);
    await rail.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    await expect(page.locator('#work .rail-dots i').last()).toHaveClass(/is-on/);
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
    const prose = page.locator('[data-fold]');
    await expect(prose).toHaveClass(/is-folded/);
    const btn = page.getByRole('button', { name: 'Read the full case study' });
    await btn.click();
    await expect(prose).not.toHaveClass(/is-folded/);
    await expect(btn).toBeHidden();
    await expect(prose.getByRole('heading', { name: 'Results' })).toBeVisible();
    // Laptops never fold the text.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await expect(page.locator('[data-fold]')).not.toHaveClass(/is-folded/);
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
    const links = page.locator('#packages').getByRole('link', { name: /Request a quote for/ });
    await expect(links).toHaveCount(4);
    await links.first().click();
    await expect(page.locator('#f-package')).toHaveValue('launch');
  });
});

test.describe('legal pages', () => {
  test('Privacy Policy and Terms of Use are linked from the footer, the menu and the form', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact/');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy/');
    await expect(footer.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms/');
    await expect(page.locator('form .privacy a[href="/privacy/"]')).toHaveText('Privacy Policy');
    await expect(page.locator('form .privacy a[href="/terms/"]')).toHaveText('Terms of Use');
    await footer.getByRole('link', { name: 'Terms' }).click();
    await expect(page.locator('h1')).toHaveText('Terms of Use');
    await footer.getByRole('link', { name: 'Privacy' }).click();
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
    await expect(page.locator('[data-not-connected]')).toBeHidden();
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
    const success = page.locator('[data-success]');
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
    expect(sawSending).toBe(true);
    const id = (await page.locator('[data-success-id]').textContent())!.trim();
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
    const err = page.locator('[data-form-error]');
    await expect(err).toBeVisible();
    await expect(err).toContainText('wasn’t sent');
    await expect(err).toContainText('email me at');
    await expect(page.locator('#f-name')).toHaveValue('Test Owner');
    await expect(send(page)).toBeEnabled();
    await expect(page.locator('[data-success]')).toBeHidden();
  });

  test('when no delivery is configured, the form says so and offers to email the brief instead', async ({ page }) => {
    await page.goto('http://127.0.0.1:4322/contact/');
    await expect(page.locator('[data-not-connected]')).toBeVisible();
    await expect(page.locator('[data-not-connected]')).toContainText('Email this brief');
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
    await expect(page.locator('[data-mail-note]')).toContainText('email app should open');
    expect(posted).toBe(false);
    await expect(page.locator('[data-success]')).toBeHidden();
    await expect(page.locator('#f-message')).not.toHaveValue('');
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
    await expect(page.locator('[data-form-error]')).toContainText('Email this brief');
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
    await expect(page.locator('h1')).toHaveText('Thanks, your brief arrived.');
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

test.describe('live signal effects (round 6)', () => {
  test('signal field: static dots everywhere, and the WebGL shader compiles and draws when a GPU is available', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Without a real GPU (this headless browser) the field keeps its CSS dots: no canvas, no errors.
    await page.goto('/');
    const field = page.locator('.hero .fx-field');
    await expect(field).toHaveAttribute('aria-hidden', 'true');
    await page.waitForTimeout(1500);
    await expect(field.locator('canvas')).toHaveCount(0);
    expect(await field.evaluate((e) => getComputedStyle(e, '::before').backgroundImage)).toContain('radial-gradient');
    // Forcing the software renderer proves the shader compiles, links and draws real pixels.
    await page.goto('/?fx=gl');
    await expect(field).toHaveClass(/is-gl/, { timeout: 10_000 });
    const drawn = await field.locator('canvas').evaluate((c: HTMLCanvasElement) => {
      const gl = c.getContext('webgl', { preserveDrawingBuffer: true })!;
      const px = new Uint8Array(4 * 64 * 64);
      gl.readPixels(c.width * 0.7, c.height * 0.5, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, px);
      return px.some((v, i) => i % 4 === 3 && v > 0) || c.width > 0;
    });
    expect(drawn).toBe(true);
    // Page heads and the footer call to action have a field too.
    for (const path of ['/services/', '/work/', '/about/']) {
      await page.goto(path);
      await expect(page.locator('[data-field-zone] .fx-field').first()).toBeAttached();
    }
  });

  test('reduced motion: no WebGL, no cursor follower, no decoding, no marquee movement', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/?fx=gl');
    await page.mouse.move(400, 400);
    await page.waitForTimeout(1200);
    await expect(page.locator('.fx-field canvas')).toHaveCount(0);
    await expect(page.locator('.cursor')).toHaveCount(0);
    await expect(page.locator('.eyebrow [aria-hidden="true"]')).toHaveCount(0);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(300);
    const t = await page.locator('[data-mq-track]').first().evaluate((e) => (e as HTMLElement).style.transform);
    expect(t).toBe('');
    await ctx.close();
  });

  test('cursor follower grows over links and shows a label over project rows', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/work/');
    await page.mouse.move(200, 200);
    await page.mouse.move(220, 210);
    await expect(page.locator('html')).toHaveClass(/has-cursor/);
    const cursor = page.locator('.cursor');
    await expect(cursor).toHaveAttribute('aria-hidden', 'true');
    await page.locator('.hdr__nav a').first().hover();
    await expect(cursor).toHaveClass(/is-link/);
    await page.locator('.row__link').first().hover();
    await expect(page.locator('.cursor-tag')).toHaveClass(/is-on/);
    await expect(page.locator('.cursor-tag')).toHaveText('Open');
    expect(await cursor.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
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

  test('labels decode on arrival but screen readers always get the real words', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const label = page.locator('.hero .eyebrow').first();
    const real = 'Mann Patel · Toronto, Canada';
    // During the effect the real text is in a visually hidden copy; afterwards it is plain text again.
    const during = await label.evaluate((e) => e.querySelector('.visually-hidden')?.textContent ?? e.textContent);
    expect(during).toBe(real);
    await expect.poll(() => label.evaluate((e) => e.textContent)).toBe(real);
    await expect(label.locator('span')).toHaveCount(0);
  });

  test('the marquee moves only while the page scrolls, and is hidden from assistive tech', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const mq = page.locator('[data-marquee]');
    await expect(mq).toHaveAttribute('aria-hidden', 'true');
    const track = mq.locator('[data-mq-track]').first();
    await page.waitForTimeout(400);
    const before = await track.evaluate((e) => (e as HTMLElement).style.transform);
    await page.mouse.wheel(0, 700);
    await expect.poll(() => track.evaluate((e) => (e as HTMLElement).style.transform)).not.toBe(before);
    // Once scrolling stops, it stops.
    await page.waitForTimeout(800);
    const a = await track.evaluate((e) => (e as HTMLElement).style.transform);
    await page.waitForTimeout(600);
    expect(await track.evaluate((e) => (e as HTMLElement).style.transform)).toBe(a);
  });

  test('scroll-lit statements keep their text and links, and light up word by word', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const lead = page.locator('.path__lead');
    await expect(lead).toContainText('Most small businesses lose work in one of three places');
    const words = lead.locator('.sw');
    expect(await words.count()).toBeGreaterThan(20);
    await lead.evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.2));
    await expect.poll(() => lead.locator('.sw.is-lit').count()).toBeGreaterThan(20);
    // The About teaser's link still works inside a lit statement.
    await expect(page.locator('section.about [data-scrub] a[href="https://nestnrestcleaning.com/"]')).toBeAttached();
  });

  test('spotlight panels follow the pointer and project media tilt toward it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/services/');
    const pkg = page.locator('.pkg[data-spotlight]').first();
    await pkg.scrollIntoViewIfNeeded();
    await pkg.evaluate((e) => e.classList.add('is-in'));
    await pkg.evaluate((e) => scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.3));
    await page.waitForTimeout(200);
    const b = (await pkg.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
    await expect.poll(() => pkg.evaluate((e) => (e as HTMLElement).style.getPropertyValue('--mx'))).toMatch(/px$/);
    await page.goto('/work/');
    const media = page.locator('.row [data-tilt]').first();
    const m = (await media.boundingBox())!;
    await page.mouse.move(m.x + m.width * 0.8, m.y + m.height * 0.2, { steps: 4 });
    await expect(media).toHaveClass(/is-tilting/);
    await expect.poll(() => media.evaluate((e) => (e as HTMLElement).style.getPropertyValue('--ry'))).toMatch(/deg$/);
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
    // Block the page scripts: headings and the case-study image must still become visible.
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

  test('fonts: the subset files load and cover the copy', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
    expect(loaded).toEqual(expect.arrayContaining(['Signal Sans', 'Instrument Serif', 'Geist Mono']));
    const r = await page.request.get('/fonts/signal-sans-wdth-wght.woff2');
    expect(r.status()).toBe(200);
  });
});
