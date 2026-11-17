// Design upgrade gates checked in the browser (DESIGN_UPGRADE_PLAN.md §5). Each phase adds the gates it turns green.
// Phase 1 (17 Nov 2026): T3, T4, T5 (typography), C1 (lime budget), L2 (section padding).
// Phase 2 (17 Nov 2026): H1–H7 (hero), R3 (hero height), U2 (header button), U3, A2, A3 (consent prompt and focus).
// Phase 3 (17 Nov 2026): S1–S4 (structure), L1, L3 (layout), U1, U4 (navigation and buttons).
// Phase 4 (17 Nov 2026): M2, M3, M5, M6, M7 (motion); M1 and M4 are unit tests (tests/unit/design-tokens.test.ts).
import { expect, test, type Page } from '@playwright/test';
import { readdirSync } from 'node:fs';

/** The pages the design upgrade is judged on (scripts/design-shots.mjs captures the same five). */
const PAGES = ['/', '/services/', '/work/nest-and-rest-cleaning/', '/about/', '/contact/'];
const SIZES = [
  [375, 812],
  [768, 1024],
  [1440, 900],
] as const;

type Check = 'weights' | 'tracking' | 'size';

/**
 * Runs one check over every rendered element that holds its own text (a non-empty text node of its own). Leaves out
 * elements that aren't drawn (display: none, closed menus) and screen-reader-only text. Returns the findings.
 */
async function overText(page: Page, check: Check): Promise<string[]> {
  return page.evaluate((check) => {
    const describe = (el: Element) => {
      const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
      const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim().slice(0, 32);
      return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls.map((c) => `.${c}`).join('')} "${text}"`;
    };
    const out: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())) continue;
      if (el.closest('script, style, noscript, template') || !el.getClientRects().length) continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden') continue;
      const fs = parseFloat(cs.fontSize);
      if (check === 'weights') out.push((/mono|monospace/i.test(cs.fontFamily) ? 'mono ' : 'sans ') + cs.fontWeight);
      if (check === 'tracking') {
        const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
        if (fs && ls / fs < -0.0355) out.push(`${describe(el)} ${(ls / fs).toFixed(3)}em`);
      }
      // Decoration inside aria-hidden (the agent graph's labels, mockup address bars) is left out, as gate T5 says.
      if (check === 'size' && !el.closest('[aria-hidden="true"]') && fs < 12.99) out.push(`${describe(el)} ${cs.fontSize}`);
    }
    return out;
  }, check);
}

test.describe('design gates: typography (Phase 1)', () => {
  test('T3: Home uses at most four weights: 400, 500 and 600, and 500 for mono', async ({ page }) => {
    for (const [width, height] of [SIZES[0], SIZES[2]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const used = [...new Set(await overText(page, 'weights'))].sort();
      expect(used.length, `${width}px: ${used.join(', ')}`).toBeLessThanOrEqual(4);
      for (const combo of used) expect(['mono 500', 'sans 400', 'sans 500', 'sans 600'], `${width}px`).toContain(combo);
    }
  });

  for (const [width, height] of SIZES) {
    test(`T4 and T5 at ${width}px: tracking never tighter than -0.035em, no visible text under 13px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (const path of PAGES) {
        await page.goto(path);
        expect(await overText(page, 'tracking'), `T4 ${path}`).toEqual([]);
        expect(await overText(page, 'size'), `T5 ${path}`).toEqual([]);
      }
    });
  }
});

test.describe('design gates: colour (Phase 1)', () => {
  for (const [width, height] of SIZES) {
    test(`C1 at ${width}px: each screen of Home has at most one lime mark`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const screens = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / innerHeight));
      const report: string[] = [];
      for (let i = 0; i < screens; i++) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), i * height);
        await page.waitForTimeout(60);
        const marks = await page.evaluate(() => {
          const LIME = new Set(['rgb(212, 248, 74)', 'rgb(228, 255, 115)']);
          // Not counted (plan C1 and the 17 Nov 2026 decision): the sticky header (gate U2 rules its button), the wordmark
          // and Λ glyphs, the agent graph, the free-check band, a headline's lime full stop, and live markers.
          const EXEMPT = '.hdr, .wm, .ag, .fc, .status__dot, .sw__state--live, h1 .stop, h2 .stop';
          const inView = (r: DOMRect) => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width * r.height > 4;
          const ownText = (el: Element) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
          const hits: Element[] = [];
          const labels: string[] = [];
          for (const el of document.querySelectorAll('body *')) {
            if (el.closest(EXEMPT) || !el.getClientRects().length) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') continue;
            const r = el.getBoundingClientRect();
            if (!inView(r)) continue;
            const before = getComputedStyle(el, '::before');
            const after = getComputedStyle(el, '::after');
            const pseudoLime =
              (!el.matches('.eyebrow') && before.content !== 'none' && LIME.has(before.backgroundColor)) ||
              (after.content !== 'none' && LIME.has(after.backgroundColor) && parseFloat(after.opacity) > 0);
            const lime = LIME.has(cs.backgroundColor) || (LIME.has(cs.color) && (ownText(el) || el.tagName.toLowerCase() === 'svg')) || pseudoLime;
            if (!lime) continue;
            if (hits.some((h) => h.contains(el))) continue;
            hits.push(el);
            const cls = (el.getAttribute('class') || '').trim().split(/\s+/)[0];
            labels.push(`${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''} "${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28)}"`);
          }
          return labels;
        });
        if (marks.length > 1) report.push(`screen ${i + 1}: ${marks.join(' + ')}`);
      }
      expect(report).toEqual([]);
    });
  }
});

test.describe('design gates: layout (Phase 1)', () => {
  test('L2: section padding comes only from --section or --section-tight', async ({ page }) => {
    for (const [width, height] of [SIZES[0], SIZES[2]]) {
      await page.setViewportSize({ width, height });
      for (const path of PAGES) {
        await page.goto(path);
        const offenders = await page.evaluate(() => {
          const probe = document.createElement('div');
          probe.style.cssText = 'position:absolute;visibility:hidden;padding-top:var(--section);padding-bottom:var(--section-tight)';
          document.body.append(probe);
          const p = getComputedStyle(probe);
          const allowed = [0, parseFloat(p.paddingTop), parseFloat(p.paddingBottom)];
          probe.remove();
          const out: string[] = [];
          // Page-level sections: every <section> not inside another section, and anything with the .section class.
          for (const s of document.querySelectorAll('section, .section')) {
            if (s.parentElement?.closest('section, .section')) continue;
            if (!s.getClientRects().length) continue;
            const cs = getComputedStyle(s);
            for (const [side, v] of [['top', cs.paddingTop], ['bottom', cs.paddingBottom]] as const)
              if (!allowed.some((a) => Math.abs(a - parseFloat(v)) <= 0.5))
                out.push(`${s.tagName.toLowerCase()}${s.id ? `#${s.id}` : ''}.${(s.getAttribute('class') || '').split(' ')[0]} ${side} ${v}`);
          }
          return out;
        });
        expect(offenders, `${path} at ${width}px`).toEqual([]);
      }
    }
  });
});

// ── Phase 2 (17 Nov 2026): the hero, the header button and the consent prompt ─────────────────────────────────────
/** The device matrix from the plan (§5): phones, tablet, laptops, a large desktop and a phone held sideways. */
const MATRIX = [
  [320, 568],
  [360, 740],
  [375, 812],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
  [844, 390],
] as const;
/** The preview built with a stand-in GA4 ID, so the consent prompt is on the page (scripts/build-consent.mjs). */
const CONSENT = 'http://127.0.0.1:4323';
const LIME = 'rgb(212, 248, 74)';

/** Opens the consent prompt the way a visitor does (it appears on the first scroll), then returns to the top. */
async function openConsent(page: Page) {
  await page.mouse.wheel(0, 40);
  await expect(page.locator('[data-consent]')).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(100);
}

/** Every public page, from the build (the same list the sitemap and link checks use). */
function builtPages(): string[] {
  const out: string[] = [];
  const walk = (dir: string, url: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && !['og', '_astro', 'fonts', 'brand'].includes(e.name)) walk(`${dir}/${e.name}`, `${url}${e.name}/`);
      else if (e.name === 'index.html') out.push(url);
    }
  };
  walk('dist/client', '/');
  return out.sort();
}

test.describe('design gates: hero (Phase 2)', () => {
  test('H1: the Home H1 is the largest text (1.4× the largest H2 from 1024px, 1.25× below); on every page the H1 ≥ every H2', async ({ page }) => {
    for (const [width, height] of MATRIX) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const { h1, h2 } = await page.evaluate(() => {
        const px = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
        const shown = [...document.querySelectorAll('main h2')].filter((e) => e.getClientRects().length && e.getBoundingClientRect().width > 1);
        return { h1: px(document.querySelector('h1')!), h2: Math.max(...shown.map(px)) };
      });
      expect(h1 / h2, `${width}x${height}: H1 ${h1}px, largest H2 ${h2}px`).toBeGreaterThanOrEqual(width >= 1024 ? 1.4 : 1.25);
    }
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of builtPages()) {
        await page.goto(path);
        const bad = await page.evaluate(() => {
          const px = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
          const h1 = document.querySelector('h1');
          if (!h1) return [];
          return [...document.querySelectorAll('h2')]
            .filter((e) => e.getClientRects().length && e.getBoundingClientRect().width > 1 && px(e) > px(h1) + 0.01)
            .map((e) => `${(e.textContent || '').trim().slice(0, 40)} ${px(e)}px > H1 ${px(h1)}px`);
        });
        expect(bad, `${path} at ${width}px`).toEqual([]);
      }
    }
  });

  test('H2 and H3: the hero text holds five things, and only the free-check button is lime', async ({ page }) => {
    for (const [width, height] of [MATRIX[2], MATRIX[7]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const kids = await page.locator('.hero__text > *').evaluateAll((els) => els.map((e) => e.className.split(' ')[0]));
      expect(kids).toEqual(['hero__hello', 'hero__title', 'hero__place', 'hero__actions', 'hero__price']);
      const lime = await page.locator('.hero__text, .hero__text *').evaluateAll(
        (els, lime) => els.filter((e) => getComputedStyle(e).backgroundColor === lime).map((e) => (e.hasAttribute('data-hero-cta') ? 'cta' : e.className)),
        LIME,
      );
      expect(lime, `${width}px`).toEqual(['cta']);
    }
  });

  test('H4: the H1 and the button are on the first screen at every size; from 375×812 up, the prices and Mann’s photo too', async ({ page }) => {
    for (const [width, height] of MATRIX) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.locator('h1'), `${width}x${height}`).toBeInViewport({ ratio: 1 });
      await expect(page.locator('[data-hero-cta]'), `${width}x${height}`).toBeInViewport({ ratio: 1 });
      // "From 375×812 up": every size except the two small phones and the phone held sideways.
      if (width < 375 || height < 500) continue;
      await expect(page.locator('.hero__price'), `${width}x${height}`).toBeInViewport({ ratio: 1 });
      const photo = await page.evaluate(() => {
        const visible = (el: Element | null) => {
          if (!el || !el.getClientRects().length || getComputedStyle(el).display === 'none') return 0;
          const r = el.getBoundingClientRect();
          const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
          return r.height ? h / r.height : 0;
        };
        return { avatar: visible(document.querySelector('.hero__avatar')), core: visible(document.querySelector('.ag__core')) };
      });
      expect(photo.avatar === 1 || photo.core >= 0.5, `${width}x${height}: avatar ${photo.avatar}, graph core ${photo.core}`).toBe(true);
    }
  });

  test('H5: the button label sits on one line from 390px (D6 declined: the label is unchanged)', async ({ page }) => {
    for (const [width, height] of MATRIX.filter(([w]) => w >= 390)) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const lines = await page.locator('[data-hero-cta] .btn__label > span').evaluate((el) => {
        const cs = getComputedStyle(el);
        return Math.round(el.getBoundingClientRect().height / (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.15));
      });
      expect(lines, `${width}x${height}`).toBe(1);
    }
  });

  test('H6: the H1 is the LCP element, nothing shifts, and the hero entrance has finished by 1.7 s', async ({ browser }) => {
    for (const [width, height] of [MATRIX[2], MATRIX[7]]) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      await ctx.addInitScript(() => {
        const m = ((window as unknown as { __h6: { lcp: Element | null; cls: number } }).__h6 = { lcp: null, cls: 0 });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (m.lcp = (e as PerformanceEntry & { element: Element }).element))).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => l.getEntries().forEach((e) => (m.cls += (e as PerformanceEntry & { value: number }).value))).observe({ type: 'layout-shift', buffered: true });
      });
      const page = await ctx.newPage();
      await page.goto('/');
      await page.waitForFunction(() => performance.now() >= 1700);
      const running = await page.evaluate(
        () => document.getAnimations().filter((a) => a.playState === 'running' && (a.effect as KeyframeEffect)?.target?.closest?.('.hero__text')).length,
      );
      expect(running, `${width}px: hero entrance still running at 1.7 s`).toBe(0);
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => {
        const m = (window as unknown as { __h6: { lcp: Element | null; cls: number } }).__h6;
        return { inH1: Boolean(m.lcp && m.lcp.closest('h1')), cls: m.cls };
      });
      expect(r.inH1, `${width}px: LCP element`).toBe(true);
      expect(r.cls, `${width}px: CLS`).toBeLessThan(0.01);
      await ctx.close();
    }
  });

  test('H7: the consent prompt never covers the hero buttons or the pause button, open or closed', async ({ page }) => {
    for (const [width, height] of MATRIX) {
      await page.setViewportSize({ width, height });
      for (const open of [false, true]) {
        await page.goto(`${CONSENT}/`);
        await page.evaluate(() => localStorage.removeItem('mp-analytics'));
        await page.goto(`${CONSENT}/`);
        // The steady state: after the hero's entrance (finished by 1.7 s, gate H6).
        await page.waitForFunction(() => performance.now() >= 1800);
        if (open) await openConsent(page);
        for (const target of ['[data-hero-cta]', '.hero__price-link', '[data-ag-toggle]']) {
          const hit = await page.locator(target).evaluate((el) => {
            const inView = () => {
              const r = el.getBoundingClientRect();
              return r.top + r.height / 2 >= 0 && r.top + r.height / 2 <= innerHeight;
            };
            // Off the first screen: brought into view the way focus or a scroll does (the nearest edge).
            if (!inView()) el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            const r = el.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return top && (top === el || el.contains(top)) ? 'ok' : `covered by ${top?.className || top?.tagName}`;
          });
          expect(hit, `${target} at ${width}x${height}, prompt ${open ? 'open' : 'closed'}`).toBe('ok');
        }
      }
    }
  });

  test('R3: the hero is at most 1.35 screens tall at 375×812 and 1.1 at 768×1024', async ({ page }) => {
    for (const [width, height, max] of [
      [375, 812, 1.35],
      [768, 1024, 1.1],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const screens = await page.evaluate(() => document.getElementById('hero')!.getBoundingClientRect().height / innerHeight);
      expect(screens, `${width}x${height}`).toBeLessThanOrEqual(max);
    }
  });
});

test.describe('design gates: header and consent (Phase 2)', () => {
  test('U2 (D5): on Home the header button is an outline while the hero button is on screen, lime after, and never moves', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const header = page.locator('[data-hdr-cta]');
    const state = () => header.evaluate((el) => ({ bg: getComputedStyle(el).backgroundColor, box: JSON.stringify(el.getBoundingClientRect()) }));
    const atTop = await state();
    expect(atTop.bg).not.toBe(LIME);
    await page.evaluate(() => window.scrollTo({ top: document.getElementById('work')!.offsetTop, behavior: 'instant' }));
    await expect.poll(async () => (await state()).bg).toBe(LIME);
    const scrolled = await state();
    expect(JSON.parse(scrolled.box).width).toBe(JSON.parse(atTop.box).width);
    expect(JSON.parse(scrolled.box).height).toBe(JSON.parse(atTop.box).height);
    // Other pages: the header button is lime from the start.
    await page.goto('/services/');
    expect((await state()).bg).toBe(LIME);
  });

  test('U3 and A2: the skip link is the first Tab stop, before the consent prompt, which is at most 72px tall on phones', async ({ page }) => {
    for (const [width, height] of MATRIX.slice(0, 4)) {
      await page.setViewportSize({ width, height });
      await page.goto(`${CONSENT}/`);
      await page.evaluate(() => localStorage.removeItem('mp-analytics'));
      await page.goto(`${CONSENT}/`);
      await openConsent(page);
      const box = await page.locator('[data-consent]').boundingBox();
      expect(box!.height, `${width}x${height}`).toBeLessThanOrEqual(72);
      expect(
        await page.evaluate(() => Boolean(document.querySelector('.skip-link')!.compareDocumentPosition(document.querySelector('[data-consent]')!) & Node.DOCUMENT_POSITION_FOLLOWING)),
      ).toBe(true);
      await page.keyboard.press('Tab');
      await expect(page.locator('.skip-link')).toBeFocused();
    }
    // The preview without the prompt: the skip link still comes first (A2).
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.locator('.skip-link')).toBeFocused();
  });

  test('A3: tabbing through Home, no focused element is hidden under the sticky header or the consent prompt', async ({ page }) => {
    test.setTimeout(120_000);
    for (const [width, height] of [MATRIX[3], MATRIX[7]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${CONSENT}/`);
      await page.evaluate(() => localStorage.removeItem('mp-analytics'));
      await page.goto(`${CONSENT}/`);
      await openConsent(page);
      const hidden: string[] = [];
      for (let i = 0; i < 300; i++) {
        await page.keyboard.press('Tab');
        const r = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return { done: true };
          if (el.closest('.hdr, [data-consent], .skip-link')) return { skip: true };
          const b = el.getBoundingClientRect();
          const x = b.left + b.width / 2;
          const y = b.top + b.height / 2;
          const inside = (s: string) => {
            const o = document.querySelector(s);
            if (!o || !o.getClientRects().length || (o as HTMLElement).hidden) return false;
            const c = o.getBoundingClientRect();
            return x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
          };
          const what = `${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').split(' ')[0]} "${(el.textContent || '').trim().slice(0, 30)}"`;
          return { what, under: inside('.hdr') ? 'header' : inside('[data-consent]') ? 'consent prompt' : '' };
        });
        if ('done' in r) break;
        if ('skip' in r) continue;
        if (r.under) hidden.push(`${r.what} under the ${r.under}`);
      }
      expect(hidden, `${width}x${height}`).toEqual([]);
    }
  });
});

// ── Phase 3 (17 Nov 2026): sections and flow ──────────────────────────────────────────────────────────────────────
test.describe('design gates: structure and layout (Phase 3)', () => {
  test('S1: Home runs hero, work, (reviews), services, prices, free check, how I work, questions; at most three lime-tipped rules', async ({ page }) => {
    await page.goto('/');
    const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
    const expected = ['hero', 'work', 'what-i-do', 'prices', 'check', 'how-i-work', 'faq'];
    // Real reviews only (src/data/reviews.ts): the strip sits right after Selected Work once there are some.
    expect(ids.filter((id) => id !== 'reviews')).toEqual(expected);
    if (ids.includes('reviews')) expect(ids[ids.indexOf('work') + 1]).toBe('reviews');
    expect(await page.locator('.rule-signal').count()).toBeLessThanOrEqual(3);
  });

  test('S2: no project is linked from two different Home sections above the questions', async ({ page }) => {
    await page.goto('/');
    const bySection = await page.evaluate(() => {
      const out: Record<string, string[]> = {};
      for (const s of document.querySelectorAll('main > section[id]')) {
        if (s.id === 'faq') break;
        out[s.id] = [...new Set([...s.querySelectorAll('a[href^="/work/"]')].map((a) => a.getAttribute('href')!).filter((h) => h !== '/work/'))];
      }
      return out;
    });
    const seen = new Map<string, string>();
    for (const [section, hrefs] of Object.entries(bySection))
      for (const href of hrefs) {
        expect(seen.get(href), `${href} is linked from ${seen.get(href)} and ${section}`).toBeUndefined();
        seen.set(href, section);
      }
  });

  for (const [width, height] of [MATRIX[2], MATRIX[4], MATRIX[7]]) {
    test(`S3 at ${width}px: lime buttons on Home lead to the free check or /contact/, one on screen at a time`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const all = await page.locator('main a, main button, footer a, footer button').evaluateAll(
        (els, lime) => els.filter((e) => getComputedStyle(e).backgroundColor === lime).map((e) => e.getAttribute('href')),
        LIME,
      );
      for (const href of all) expect(['/contact/?package=check-up#check', '/contact/']).toContain(href);
      const screens = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / innerHeight));
      const report: string[] = [];
      for (let i = 0; i < screens; i++) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), i * height);
        // The sticky header's button follows gate U2 (D5), as in C1.
        const shown = await page.locator('main a.btn, main button.btn, footer a.btn, footer button.btn').evaluateAll(
          (els, lime) =>
            els
              .filter((e) => {
                const r = e.getBoundingClientRect();
                return getComputedStyle(e).backgroundColor === lime && r.bottom > 0 && r.top < innerHeight && r.width > 0;
              })
              .map((e) => (e.textContent || '').replace(/\s+/g, ' ').trim()),
          LIME,
        );
        if (shown.length > 1) report.push(`screen ${i + 1}: ${shown.join(' + ')}`);
      }
      expect(report).toEqual([]);
    });
  }

  test('S4: Home is at most 11 screens at 390×844 (D9)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollHeight / innerHeight)).toBeLessThanOrEqual(11);
  });

  test('L1: from 1440 the heads of How I work, Prices and the questions stay in view (sticky)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    for (const head of ['#how-i-work .about__head', '#prices .pt__head', '#faq .faq__head'])
      expect(await page.locator(head).evaluate((e) => getComputedStyle(e).position), head).toBe('sticky');
  });

  test('L3: at 1440 every section’s eyebrow and heading start at the container’s content edge', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const off = await page.evaluate(() => {
      const out: string[] = [];
      for (const s of document.querySelectorAll('main > section[id], footer .ftr__cta')) {
        const c = s.querySelector('.container') ?? s;
        const edge = c.getBoundingClientRect().left + parseFloat(getComputedStyle(c).paddingLeft);
        for (const el of [s.querySelector('.eyebrow, .fc__label'), s.querySelector('h1, h2')]) {
          if (!el) continue;
          const left = el.getBoundingClientRect().left;
          if (Math.abs(left - edge) > 1) out.push(`${s.id || s.className.split(' ')[0]} ${el.tagName.toLowerCase()}: ${Math.round(left)} vs ${Math.round(edge)}`);
        }
      }
      return out;
    });
    expect(off).toEqual([]);
  });
});

test.describe('design gates: navigation and buttons (Phase 3)', () => {
  test('U1: the main menu has at most five links plus the Contact button', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    expect(await page.locator('.hdr__nav a').count()).toBeLessThanOrEqual(5);
    await expect(page.locator('[data-hdr-cta]')).toHaveAttribute('href', '/contact/');
  });

  test('U4: every public page shows a lime main button within its first two screens at 390×844', async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 390, height: 844 });
    // Mann's choice (17 Nov 2026): the legal pages are exempt; the 404 page is not a destination.
    const EXEMPT = ['/privacy/', '/terms/'];
    for (const path of builtPages().filter((p) => !EXEMPT.includes(p))) {
      await page.goto(path);
      const top = await page.evaluate((lime) => {
        const ys = [...document.querySelectorAll('main a, main button, header a')]
          .filter((e) => getComputedStyle(e).backgroundColor === lime && e.getClientRects().length && !e.closest('dialog'))
          .map((e) => e.getBoundingClientRect().bottom + scrollY);
        return ys.length ? Math.min(...ys) : Infinity;
      }, LIME);
      expect(top, path).toBeLessThanOrEqual(2 * 844);
    }
  });
});

/**
 * Content a visitor reads or sees: every drawn element with its own text, plus images and buttons, outside decoration
 * (aria-hidden), closed menus and screen-reader-only text. Returns those that are hidden (an ancestor or the element at
 * opacity 0) or still have an animation on them.
 */
async function hiddenContent(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!own && !el.matches('img, picture, video, button, a[href], [role="img"]')) continue;
      if (el.closest('script, style, noscript, template, dialog:not([open]), [aria-hidden="true"], .visually-hidden, .sr-only')) continue;
      if (!el.getClientRects().length || getComputedStyle(el).visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) continue;
      let opacity = 1;
      for (let a: Element | null = el; a; a = a.parentElement) opacity *= Number(getComputedStyle(a).opacity);
      const name = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} "${(el.textContent || '').trim().slice(0, 30)}"`;
      if (opacity === 0) out.push(`${name}: opacity 0`);
      if (el.getAnimations().some((a) => a.playState === 'running')) out.push(`${name}: still animating`);
    }
    return out;
  });
}

/** Animations running on the page's own clock (scroll-driven reveals, which move only with the scroll, are left out). */
const runningOnClock = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running' && a.timeline === document.timeline)
      .map((a) => {
        const effect = a.effect as KeyframeEffect | null;
        const el = effect?.target as Element | null;
        const cls = el && typeof el.className === 'string' ? el.className : (el?.getAttribute?.('class') ?? '');
        return `${(a as CSSAnimation).animationName || 'script'} on ${el?.tagName.toLowerCase()}.${cls.split(' ')[0]}${effect?.pseudoElement ?? ''}`;
      }),
  );

test.describe('design gates: motion (Phase 4)', () => {
  test('M2: 15 s after load, with no input, nothing animates on the page’s own clock (scroll-driven reveals excluded)', async ({ browser }) => {
    test.setTimeout(120_000);
    // All loaded at once, then one 15 s wait: Home at both graph layouts, and the other pages at laptop size.
    const runs = [
      { path: '/', size: [1440, 900] },
      { path: '/', size: [390, 844] },
      ...[...PAGES.slice(1), '/pricing/', '/free-check/', '/contact/received/'].map((path) => ({ path, size: [1440, 900] })),
    ];
    const pages = await Promise.all(
      runs.map(async ({ path, size: [width, height] }) => {
        const ctx = await browser.newContext({ viewport: { width, height } });
        const page = await ctx.newPage();
        await page.goto(path);
        return { path, width, page, ctx };
      }),
    );
    await new Promise((r) => setTimeout(r, 15_500));
    for (const { path, width, page, ctx } of pages) {
      expect(await runningOnClock(page), `${path} at ${width}px`).toEqual([]);
      await ctx.close();
    }
  });

  test('M3: the hero entrance (text, graph and the wordmark’s first-visit lock-on) has finished by 1.7 s', async ({ browser }) => {
    for (const [width, height] of [MATRIX[2], MATRIX[7]]) {
      // A new context is a new visit, so the wordmark's once-per-visit lock-on plays too.
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.classList.contains('wm-intro')), `${width}px: first visit`).toBe(true);
      await page.waitForTimeout(Math.max(0, 1700 - (await page.evaluate(() => performance.now()))));
      const entrance = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running' && a.timeline === document.timeline && 'animationName' in a)
          .map((a) => ({ name: (a as CSSAnimation).animationName, el: (a.effect as KeyframeEffect).target as Element }))
          .filter(({ el }) => el.closest('.hero, .wordmark'))
          .map(({ name, el }) => `${name} on ${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(' ')[0]}`),
      );
      expect(entrance, `${width}px at 1.7 s`).toEqual([]);
      // The second page of the visit doesn't replay it.
      await page.goto('/services/');
      expect(await page.evaluate(() => document.documentElement.classList.contains('wm-intro')), `${width}px: second page`).toBe(false);
      await ctx.close();
    }
  });

  test('M5: with reduced motion nothing animates, all content shows, and the graph is still with its two routes lit', async ({ browser }) => {
    test.setTimeout(90_000);
    for (const [width, height] of [
      [390, 844],
      [1440, 900],
    ]) {
      const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width, height } });
      const page = await ctx.newPage();
      for (const path of PAGES) {
        await page.goto(path);
        await page.waitForTimeout(300);
        // Scrolled through, so scroll-driven effects would show up too.
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 30));
          }
        });
        const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
        expect(running, `${path} at ${width}px: running animations`).toBe(0);
        expect(await hiddenContent(page), `${path} at ${width}px`).toEqual([]);
      }
      await page.goto('/');
      const layout = width >= 1024 ? 'wide' : 'tall';
      const lit = page.locator(`.ag__svg--${layout} .ag__pulse:visible`);
      await expect(lit).toHaveCount(4);
      for (const o of await lit.evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity))) expect(Number(o)).toBeGreaterThan(0.4);
      await expect(page.locator('.ag__spark')).toHaveCount(0);
      await ctx.close();
    }
  });

  test('M6: with JavaScript off, every page shows all its content, with nothing moved or animating', async ({ browser }) => {
    test.setTimeout(180_000);
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    for (const path of builtPages()) {
      await page.goto(path);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2));
      // Nothing in the motion system runs without the script's opt-in (html.js / js-motion), not even on scroll.
      const animations = await page.evaluate(() =>
        document.getAnimations().map((a) => `${(a as CSSAnimation).animationName || (a as CSSTransition).transitionProperty} on ${((a.effect as KeyframeEffect).target as Element)?.tagName}`),
      );
      expect(animations, path).toEqual([]);
      expect(await hiddenContent(page), path).toEqual([]);
    }
    await ctx.close();
  });

  test('M7: at 4× CPU slowdown, no frame our scripts run in is over 50ms on Home, from first paint to 3 s', async ({ browser }) => {
    test.setTimeout(120_000);
    // Mann's choices (17 Nov 2026): counted from the first contentful paint, and only frames in which the site's own
    // scripts run. Frames that are only the browser painting the page (its first render, Phase 7's) are listed in the
    // test's annotations, not failed. Median of three loads, as Lighthouse does.
    type Frame = { start: number; dur: number; scripts: string[] };
    for (const [width, height] of [
      [390, 844],
      [1440, 900],
    ]) {
      const worst: number[] = [];
      const detail: string[] = [];
      const paintOnly: string[] = [];
      for (let run = 0; run < 3; run++) {
        const ctx = await browser.newContext({ viewport: { width, height } });
        await ctx.addInitScript(() => {
          const w = window as unknown as { __m7: { fcp: number; frames: Frame[] } };
          w.__m7 = { fcp: Infinity, frames: [] };
          new PerformanceObserver((l) => l.getEntries().forEach((e) => e.name === 'first-contentful-paint' && (w.__m7.fcp = e.startTime))).observe({ type: 'paint', buffered: true });
          new PerformanceObserver((l) =>
            l.getEntries().forEach((e) => {
              const scripts = ((e as PerformanceEntry & { scripts?: { sourceURL: string; invokerType: string; duration: number }[] }).scripts ?? [])
                .filter((x) => x.sourceURL.startsWith(location.origin) || x.invokerType === 'classic-script' || x.invokerType === 'module-script')
                .map((x) => `${x.invokerType} ${x.sourceURL.replace(/^.*\//, '') || '(inline)'} ${Math.round(x.duration)}ms`);
              w.__m7.frames.push({ start: e.startTime, dur: e.duration, scripts });
            }),
          ).observe({ type: 'long-animation-frame', buffered: true });
        });
        const page = await ctx.newPage();
        const cdp = await ctx.newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await page.goto('/');
        // Waited for outside the page: polling from the test would itself add work to the page's frames.
        await new Promise((r) => setTimeout(r, 3400));
        const { fcp, frames } = await page.evaluate(() => (window as unknown as { __m7: { fcp: number; frames: Frame[] } }).__m7);
        const after = frames.filter((f) => f.start >= fcp && f.start < 3000);
        const ours = after.filter((f) => f.scripts.length);
        worst.push(Math.max(0, ...ours.map((f) => f.dur)));
        detail.push(`run ${run + 1}: ${ours.map((f) => `${Math.round(f.start)}ms +${Math.round(f.dur)} [${f.scripts.join(', ')}]`).join('; ') || 'none'}`);
        for (const f of after.filter((x) => !x.scripts.length)) paintOnly.push(`run ${run + 1}: ${Math.round(f.start)}ms +${Math.round(f.dur)}`);
        await ctx.close();
      }
      if (paintOnly.length) test.info().annotations.push({ type: `M7 ${width}px, browser-only frames (Phase 7)`, description: paintOnly.join(' · ') });
      const median = [...worst].sort((a, b) => a - b)[1];
      expect(median, `${width}px: ${detail.join(' · ')}`).toBeLessThanOrEqual(50);
    }
  });
});
