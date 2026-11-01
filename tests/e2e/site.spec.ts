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
  test('menu panel opens, closes with Escape and returns focus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    const toggle = page.locator('[data-menu-toggle]');
    const panel = page.locator('[data-menu-panel]');
    await expect(page.locator('#site-nav')).toBeHidden();
    await toggle.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await panel.getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL(/\/services\/$/);
  });

  test('the header stays on screen while scrolling, and nothing floats over the footer', async ({ page }) => {
    await page.goto('/services/');
    await expect(page.locator('[data-menu-fab]')).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const header = page.locator('[data-header]');
    await expect(header).toHaveClass(/is-scrolled/);
    expect((await header.boundingBox())!.y).toBe(0);
    // Every footer control below the header is the top-most element at its own centre: nothing
    // floats over it. (Controls that have simply scrolled up under the sticky header don't count.)
    const covered = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('footer a, footer button')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const headerBottom = document.querySelector('[data-header]')!.getBoundingClientRect().bottom;
          if (r.width < 2 || r.top < headerBottom || r.top > innerHeight) return false;
          const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return !(hit && (el === hit || el.contains(hit)));
        })
        .map((el) => el.textContent?.trim()),
    );
    expect(covered).toEqual([]);
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
    await page.goto('/services/#follow-up');
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
    await page.goto('/services/');
    await expect(page.locator('.panel')).toHaveCount(4);
    for (const id of ['enquiry', 'ack', 'notify', 'follow']) await expect(page.locator(`#panel-${id}`)).toBeVisible();
    await expect(page.locator('#site-nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    await ctx.close();
  });

  test('reduced motion: the hero ticket is complete and still, and content is visible immediately', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.classList.contains('js-motion'))).toBe(false);
    const ticket = page.locator('[data-ticket]');
    await expect(ticket).not.toHaveClass(/is-live/);
    await expect(ticket.locator('.ht-steps li')).toHaveCount(4);
    for (const li of await ticket.locator('.ht-steps li').all()) expect(await li.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('[data-ticket-replay]')).toBeHidden();
    const opacity = await page.locator('[data-reveal]').first().evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
    await ctx.close();
  });

  test('the sample enquiry stamps itself through four steps and can be replayed', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto('/');
    const ticket = page.locator('[data-ticket]');
    await expect(ticket).toHaveClass(/is-complete/, { timeout: 6000 });
    await expect(ticket.locator('li.is-done')).toHaveCount(4);
    await page.getByRole('button', { name: 'Replay the sample enquiry' }).click();
    await expect(ticket).not.toHaveClass(/is-complete/);
    await expect(ticket).toHaveClass(/is-complete/, { timeout: 6000 });
    await ctx.close();
  });
});

test.describe('home and services (round 3)', () => {
  for (const [w, h] of [[360, 640], [390, 844], [1440, 900]] as const) {
    test(`hero promise is the H1 and "Start a project" is visible without scrolling at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('Websites & simpler systems for small businesses');
      const cta = page.locator('.hp-actions a[href="/contact/"]');
      await expect(cta).toBeVisible();
      const box = (await cta.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(h);
      await expect(page.locator('.hp-actions a[href="#work"]')).toBeVisible();
    });
  }

  test('work rows show images and a case-study cue on touch screens', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('.wl-thumb').first()).toBeVisible();
    await expect(page.locator('.wl-row').first()).toContainText('Case study');
    await ctx.close();
  });

  test('services compares packages at a glance and links to the follow-up demo', async ({ page }) => {
    await page.goto('/services/');
    const table = page.locator('table.compare');
    await expect(table.locator('tbody tr')).toHaveCount(4);
    await expect(table.locator('caption')).toContainText('Compare at a glance');
    await page.getByRole('link', { name: /See what follow-up looks like/ }).click();
    await expect(page).toHaveURL(/#follow-up$/);
  });
});

test.describe('hero photo and legal pages', () => {
  for (const [w, h] of [[320, 640], [390, 844], [1024, 768], [1440, 900]] as const) {
    test(`nothing covers the face in the hero photo at ${w}px, and the header is solid`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      const r = await page.evaluate(() => {
        const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        const clip = box('.hp-clip');
        // Hair to chin in the 4:5 crop: x 33-67%, y 11-47% of the photo.
        const face = { l: clip.left + clip.width * 0.33, r: clip.left + clip.width * 0.67, t: clip.top + clip.height * 0.11, b: clip.top + clip.height * 0.47 };
        const hit = (s: string) => {
          const a = box(s);
          return Math.max(0, Math.min(a.right, face.r) - Math.max(a.left, face.l)) * Math.max(0, Math.min(a.bottom, face.b) - Math.max(a.top, face.t));
        };
        return { badge: hit('.hp-badge'), ticket: hit('.hp-ticket'), headerBg: getComputedStyle(document.querySelector('.site-header')!).backgroundColor };
      });
      expect(r.badge).toBe(0);
      expect(r.ticket).toBe(0);
      expect(r.headerBg).toBe('rgb(244, 241, 234)');
    });
  }

  test('Privacy Policy and Terms of Use are linked from the footer, the menu and the form', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact/');
    const legal = page.getByRole('navigation', { name: 'Legal' });
    await expect(legal.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy/');
    await expect(legal.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/terms/');
    await expect(page.locator('form .privacy a[href="/privacy/"]')).toHaveText('Privacy Policy');
    await expect(page.locator('form .privacy a[href="/terms/"]')).toHaveText('Terms of Use');
    await page.locator('[data-menu-toggle]').click();
    await expect(page.locator('[data-menu-panel] a[href="/terms/"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await legal.getByRole('link', { name: 'Terms of Use' }).click();
    await expect(page.locator('h1')).toHaveText('Terms of Use');
    await page.getByRole('link', { name: 'Privacy Policy' }).first().click();
    await expect(page.locator('h1')).toHaveText('Privacy Policy');
  });
});

test.describe('direct contact', () => {
  test('email, call, WhatsApp and text buttons work, and the full number is not in the HTML', async ({ page, request }) => {
    await page.goto('/');
    const hero = page.locator('.hp-reach');
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
    // The contact page shows the number masked.
    await page.goto('/contact/');
    await expect(page.locator('#reach .ca-number')).toContainText(/\d{3}-\d{2}X-XXXX/);
  });

  test('without JavaScript, the phone buttons fall back to the contact page', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    const call = page.locator('.hp-reach a[data-reach="call"]');
    if ((await call.count()) > 0) await expect(call).toHaveAttribute('href', '/contact/#reach');
    await ctx.close();
  });
});

test.describe('logo', () => {
  test('is the name only, with unique glint ids, and plays its intro once per visit', async ({ page }) => {
    await page.goto('/');
    const home = page.getByRole('link', { name: 'Mann Patel, home' }).first();
    await expect(home).toBeVisible();
    // Header: 9 letters (M a n n P a t e l) + the full stop. No monogram.
    await expect(page.locator('.site-header .logo .logo-l')).toHaveCount(9);
    await expect(page.locator('.site-header .logo .logo-stop')).toHaveCount(1);
    const ids = await page.locator('svg[data-logo] linearGradient').evaluateAll((els) => els.map((e) => e.id));
    expect(ids.length).toBeGreaterThanOrEqual(1);
    expect(new Set(ids).size).toBe(ids.length);
    expect(await page.evaluate(() => sessionStorage.getItem('mp-logo-intro'))).toBe('1');
    // Second page of the visit: no intro.
    await page.goto('/work/');
    expect(await page.evaluate(() => document.documentElement.classList.contains('logo-intro'))).toBe(false);
  });

  test('reduced motion: the logo is static and fully visible', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    for (const sel of ['.site-header .logo .logo-l', '.site-header .logo .logo-stop']) {
      const el = page.locator(sel).first();
      expect(await el.evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
      expect(await el.evaluate((e) => getComputedStyle(e).transform)).toBe('none');
      expect(await el.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    }
    await ctx.close();
  });
});

test.describe('enquiry form', () => {
  const fill = async (page: Page, msg = 'I run a two-chair salon in Scarborough and need a site that takes booking requests.') => {
    await page.locator('#f-name').fill('Test Owner');
    await page.locator('#f-email').fill('owner@example.ca');
    await page.locator('#f-business').fill('Example Salon');
    await page.locator('#f-website').fill('examplesalon.ca');
    await page.locator('input[name="services"][value="area-found"]').check();
    await page.locator('#f-message').fill(msg);
  };

  test('service choice starts with plain-language areas; links that pre-select a service open the detail', async ({ page }) => {
    await page.goto('/contact/');
    // Three areas + "Not sure yet" are visible without opening anything.
    for (const v of ['area-found', 'area-follow-up', 'area-professional', 'not-sure']) {
      await expect(page.locator(`input[name="services"][value="${v}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-svc-detail]')).not.toHaveAttribute('open', '');
    // The verified email alternative sits beside the send button.
    await expect(page.locator('[data-alt-email]')).toBeVisible();

    await page.goto('/contact/?services=seo,business-email');
    await expect(page.locator('[data-svc-detail]')).toHaveAttribute('open', '');
    await expect(page.locator('input[name="services"][value="seo"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="area-found"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="area-follow-up"]')).toBeChecked();
    await expect(page.locator('input[name="services"][value="area-professional"]')).not.toBeChecked();
  });

  test('a failed status check does not claim the form is disconnected', async ({ page }) => {
    await page.route('**/api/enquiry/', (route) =>
      route.request().method() === 'GET' ? route.fulfill({ status: 403, body: 'Forbidden' }) : route.continue(),
    );
    await page.goto('/contact/');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-not-connected]')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Send my brief' })).toBeEnabled();
  });

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
    await expect(err).toContainText('email me at');
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
    await expect(page.locator('[data-form-error]')).toContainText('email me at');
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
