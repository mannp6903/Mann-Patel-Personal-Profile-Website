import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const PAGES = [
  '/',
  '/services/',
  '/work/',
  '/work/nest-and-rest-cleaning/',
  '/work/samp-hair-spa/',
  '/work/concept-kettle-and-crumb/',
  '/work/concept-northline-plumbing/',
  '/about/',
  '/contact/',
  '/privacy/',
  '/contact/received/',
];

async function noHorizontalOverflow(page: Page) {
  const { scrollW, clientW } = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  expect(scrollW, 'page should not scroll sideways').toBeLessThanOrEqual(clientW);
}

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
      // reveal everything so axe sees final colours
      await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed')));
      await page.waitForTimeout(600);
      // Cast: @axe-core/playwright 4.14 types target a newer Playwright than the 1.63 pinned to the preinstalled browsers.
      const axe = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const summary = axe.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
      expect(summary, summary.join('\n')).toEqual([]);
      expect(errors).toEqual([]);
    });
  }

  test('404 page returns a real 404 status', async ({ page }) => {
    const res = await page.goto('/this-does-not-exist/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveText('This page doesn’t exist.');
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

  test('outbound link to Nest & Rest is present and correct on key pages', async ({ page }) => {
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
    await page.goto('/');
    const blocks = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent || ''));
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) {
      const data = JSON.parse(b);
      expect(JSON.stringify(data)).not.toMatch(/aggregateRating|address|award/i);
    }
  });
});

test.describe('layout', () => {
  for (const width of [320, 360, 390, 768, 1024, 1440]) {
    test(`no sideways scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PAGES) {
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
});

test.describe('navigation', () => {
  test('mobile menu opens, closes with Escape and returns focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    await expect(page.locator('#site-nav')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#site-nav')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.locator('#site-nav a', { hasText: 'Services' }).click();
    await expect(page).toHaveURL(/\/services\/$/);
  });

  test('skip link moves focus to main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });
});

test.describe('interactions', () => {
  test('guide recommends a starting point and pre-fills the brief', async ({ page }) => {
    await page.goto('/#guide');
    await page.getByLabel('Just starting, or about to launch').check();
    await page.getByLabel('Not missing or delaying enquiries').check();
    await page.getByLabel('No', { exact: true }).check();
    await page.getByRole('button', { name: 'Show my starting point' }).click();
    const result = page.locator('[data-guide-result]');
    await expect(result).toBeVisible();
    await expect(result.locator('h3')).toHaveText('Start with Business Launch');
    await expect(result).toBeFocused();
    const cta = result.getByRole('link', { name: /Start a brief with this/ });
    await expect(cta).toHaveAttribute('href', /package=launch/);
    await cta.click();
    await expect(page).toHaveURL(/\/contact\/\?package=launch/);
    await expect(page.locator('#f-package')).toHaveValue('launch');
    await expect(page.locator('input[name="services"][value="websites"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="business-email"]')).toBeChecked();
  });

  test('guide asks for missing answers instead of guessing', async ({ page }) => {
    await page.goto('/#guide');
    await page.getByRole('button', { name: 'Show my starting point' }).click();
    await expect(page.locator('[data-guide-hint]')).toHaveText(/answer all three/i);
    await expect(page.locator('[data-guide-result]')).toBeHidden();
  });

  test('workflow demo works with the keyboard (ARIA tabs)', async ({ page }) => {
    await page.goto('/#follow-up');
    const tabs = page.getByRole('tab');
    await expect(tabs).toHaveCount(4);
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(page.locator('#panel-ack')).toBeVisible();
    await expect(page.locator('#panel-enquiry')).toBeHidden();
    await page.keyboard.press('End');
    await expect(tabs.nth(3)).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('button', { name: /Start again/ }).click();
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  });

  test('without JavaScript, the demo shows all four steps and the nav is visible', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 800 } });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('.panel')).toHaveCount(4);
    for (const id of ['enquiry', 'ack', 'notify', 'follow']) await expect(page.locator(`#panel-${id}`)).toBeVisible();
    await expect(page.locator('#site-nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await ctx.close();
  });

  test('reduced motion: no stamp animation and content visible immediately', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.classList.contains('js-motion'))).toBe(false);
    const anim = await page.locator('.stamp').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(anim).toBe('none');
    const opacity = await page.locator('[data-reveal]').first().evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
    await ctx.close();
  });
});

test.describe('enquiry form', () => {
  const fill = async (page: Page, msg = 'I run a two-chair salon in Scarborough and need a site that takes booking requests.') => {
    await page.locator('#f-name').fill('Test Owner');
    await page.locator('#f-email').fill('owner@example.ca');
    await page.locator('#f-business').fill('Example Salon');
    await page.locator('#f-website').fill('examplesalon.ca');
    await page.locator('input[name="services"][value="websites"]').check();
    await page.locator('#f-message').fill(msg);
  };

  test('shows accessible errors for missing required fields', async ({ page }) => {
    await page.goto('/contact/');
    await page.getByRole('button', { name: 'Send my brief' }).click();
    const summary = page.locator('[data-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary.locator('li')).toHaveCount(3);
    await expect(page.locator('#f-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#f-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#e-message')).toContainText('tell me a little');
    // a bad email alone moves focus to that field
    await fill(page);
    await page.locator('#f-email').fill('owner@');
    await page.getByRole('button', { name: 'Send my brief' }).click();
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
    await page.getByRole('button', { name: 'Send my brief' }).click();
    const success = page.locator('[data-success]');
    await expect(success).toBeVisible();
    await expect(success).toBeFocused();
    expect(sawSending).toBe(true);
    const id = (await page.locator('[data-success-id]').textContent())!.trim();
    expect(id).toMatch(/^enq_\d{8}_[0-9a-f]{8}$/);
    const store = await readFile('.data/enquiries.jsonl', 'utf8');
    expect(store).toContain(id);

    // API-level duplicate protection
    const tokenRes = await (await request.get('/api/enquiry/')).json();
    await new Promise((r) => setTimeout(r, 3200));
    const payload = {
      name: 'Dup Test', email: 'dup@example.ca', message: `Duplicate protection check ${Date.now()} for the e2e suite.`,
      submissionId: `dup-${Date.now()}`, formToken: tokenRes.token,
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
    await page.getByRole('button', { name: 'Send my brief' }).click();
    const err = page.locator('[data-form-error]');
    await expect(err).toBeVisible();
    await expect(err).toContainText('wasn’t sent');
    await expect(page.locator('#f-name')).toHaveValue('Test Owner');
    await expect(page.getByRole('button', { name: 'Send my brief' })).toBeEnabled();
    await expect(page.locator('[data-success]')).toBeHidden();
  });

  test('when no delivery is configured, the form says so honestly and keeps the answers', async ({ page }) => {
    await page.goto('http://127.0.0.1:4322/contact/');
    await expect(page.locator('[data-not-connected]')).toBeVisible();
    await fill(page);
    await page.waitForTimeout(3200);
    await page.getByRole('button', { name: 'Send my brief' }).click();
    await expect(page.locator('[data-form-error]')).toContainText('isn’t connected');
    await expect(page.locator('[data-success]')).toBeHidden();
    await expect(page.locator('#f-message')).not.toHaveValue('');
  });

  test('works without JavaScript: posts the form and lands on the confirmation page', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: 'http://127.0.0.1:4321' });
    const page = await ctx.newPage();
    await page.goto('/contact/');
    await page.locator('#f-name').fill('No JS Owner');
    await page.locator('#f-email').fill('nojs@example.ca');
    await page.locator('#f-message').fill(`No-JavaScript path ${Date.now()}: please contact me about a landing page.`);
    await page.getByRole('button', { name: 'Send my brief' }).click();
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
