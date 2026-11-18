// Design upgrade gates checked in the browser (DESIGN_UPGRADE_PLAN.md §5). Each phase adds the gates it turns green.
// Phase 1 (17 Nov 2026): T3, T4, T5 (typography), C1 (lime budget), L2 (section padding).
// Phase 2 (17 Nov 2026): H1–H7 (hero), R3 (hero height), U2 (header button), U3, A2, A3 (consent prompt and focus).
// Phase 3 (17 Nov 2026): S1–S4 (structure), L1, L3 (layout), U1, U4 (navigation and buttons).
// Phase 4 (17 Nov 2026): M2, M3, M5, M6, M7 (motion); M1 and M4 are unit tests (tests/unit/design-tokens.test.ts).
// Phase 5 (17 Nov 2026): G1, G2 (images); G3 and G4 are unit tests.
// Phase 6 (17 Nov 2026): R1, R2, R4, R5, R6 (headings without one-word last lines); R3 is in Phase 2's tests.
// Phase 7 (17 Nov 2026): P2 (page weight), P3 (elements); P4 is M2's check (the test is titled for both); P1 is the
// Lighthouse assertions in lighthouserc.json.
// Phase 8 (17 Nov 2026): A1 (axe everywhere, overlays open), A4 (text spacing), A5 (forced colours). A2 and A3 are in
// Phase 2's tests, A6 is T4/T5 and R4, A7 is M5 and H7, A9 is lighthouserc.json.
// Phase 9 (18 Nov 2026, the re-audit's fixes): T6 (body measure and line height), C4 (the header wordmark's small cut,
// size and clear space), L1's manual part as a check (no empty column beside long content), L4 (head spacing). M8 and
// C6 are unit tests.
import AxeBuilder from '@axe-core/playwright';
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
  // P4 (Phase 7) is the same check as M2, so the one test covers both.
  test('M2 and P4: 15 s after load, with no input, nothing animates on the page’s own clock (scroll-driven reveals excluded)', async ({ browser }) => {
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

/** Every image on the page once scrolled through (so lazy images have loaded), with what was chosen from its srcset. */
async function imagesOn(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    scrollTo(0, 0);
  });
  // Hidden images (the phone avatar on desktop) and those off to the side in a swipe rail never load lazily, so the
  // wait is bounded; an image that hasn't loaded is still checked for its markup, just not for the file it chose.
  await page.waitForFunction(() => [...document.images].filter((i) => i.getClientRects().length).every((i) => i.complete), null, { timeout: 4000 }).catch(() => {});
  return page.evaluate(() =>
    [...document.images].map((i) => {
      const pic = i.parentElement?.tagName === 'PICTURE' ? i.parentElement : null;
      const avif = pic?.querySelector('source[type="image/avif"]') as HTMLSourceElement | null;
      const path = i.currentSrc ? new URL(i.currentSrc).pathname : '';
      const sets = [avif?.srcset ?? '', i.srcset ?? ''];
      const cands = sets.flatMap((set) =>
        set
          .split(',')
          .map((c) => c.trim().split(/\s+/))
          .filter((c) => c[1]?.endsWith('w'))
          .map(([u, d]) => ({ path: new URL(u, location.href).pathname, w: parseInt(d) })),
      );
      const own = cands.filter((c) => (avif && avif.srcset.includes(c.path) ? avif.srcset.includes(path) : !avif || !avif.srcset.includes(path)));
      return {
        name: (i.alt || i.className || path.split('/').pop() || '').slice(0, 40),
        alt: i.getAttribute('alt'),
        width: i.getAttribute('width'),
        height: i.getAttribute('height'),
        loading: i.getAttribute('loading'),
        decorative: Boolean(i.closest('[aria-hidden="true"]')) || i.getAttribute('role') === 'presentation',
        raster: /\.(webp|avif|png|jpe?g)$/.test(path),
        avif: Boolean(avif),
        fallback: path ? (i.src.match(/\.(\w+)$/)?.[1] ?? '') : '',
        shown: i.offsetWidth,
        drawn: i.getClientRects().length > 0,
        chosen: own.find((c) => c.path === path)?.w ?? null,
        widths: [...new Set(own.map((c) => c.w))].sort((a, b) => a - b),
        source: Number(i.dataset.srcW) || null,
        top: i.getBoundingClientRect().top + scrollY,
      };
    }),
  );
}

test.describe('design gates: imagery (Phase 5)', () => {
  test('G1: every image has width, height and alt text, is lazy below the first screen, and is not oversized for the screen', async ({ browser }) => {
    test.setTimeout(300_000);
    // Decorative images with empty alt text, each with its reason (alt="" is right for them).
    const DECORATIVE = ['hero__avatar', 'nf__img'];
    // Mann's choices (17 Nov 2026): lazy below the first screen (images in it may load at once; at most one has high
    // priority, the existing image test); size judged as Lighthouse's older "properly size images" did, the displayed
    // size × the screen's density (Lighthouse 13's "Improve image delivery" ignores density).
    const screens = [
      { width: 412, height: 823, dpr: 1.75 }, // Lighthouse's phone
      { width: 1440, height: 900, dpr: 1 },
    ];
    const problems: string[] = [];
    // Where each image sits at each screen size: it must be lazy only if it is below the first screen at both.
    const below = new Map<string, { below: boolean[]; lazy: boolean }>();
    for (const { width, height, dpr } of screens) {
      const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: dpr > 1, hasTouch: dpr > 1 });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        const seen = new Map<string, number>();
        for (const img of await imagesOn(page)) {
          const at = `${path} at ${width}px: ${img.name}`;
          if (!img.width || !img.height) problems.push(`${at}: no width/height`);
          if (img.alt === null) problems.push(`${at}: no alt attribute`);
          if (img.alt === '' && !img.decorative && !DECORATIVE.some((c) => img.name.includes(c))) problems.push(`${at}: empty alt on a non-decorative image`);
          const n = (seen.get(img.name) ?? 0) + 1;
          seen.set(img.name, n);
          const key = `${path} ${img.name} #${n}`;
          const entry = below.get(key) ?? { below: [], lazy: img.loading === 'lazy' };
          if (img.drawn) entry.below.push(img.top > height);
          below.set(key, entry);
          if (!img.drawn || !img.raster || !img.chosen || !img.shown) continue;
          // Oversized: the file is over 1.3× what the screen needs and a smaller candidate would still have covered it.
          const need = img.shown * dpr;
          const smaller = img.widths.filter((w) => w < img.chosen! && w >= need);
          if (img.chosen > need * 1.3 && smaller.length) problems.push(`${at}: ${img.chosen}w file for ${Math.round(need)}px (a ${smaller[0]}w file exists)`);
        }
      }
      await ctx.close();
    }
    for (const [key, { below: b, lazy }] of below)
      if (b.length && b.every(Boolean) && !lazy) problems.push(`${key}: below the first screen at 412 and 1440, but not lazy`);
    expect(problems).toEqual([]);
  });

  test('G2: captures and the portrait are AVIF with a WebP fallback, and their srcset reaches 2× the shown width (or the full source)', async ({ browser }) => {
    test.setTimeout(240_000);
    const limited = new Set<string>();
    const problems: string[] = [];
    for (const [width, height] of [
      [390, 844],
      [1440, 900],
    ]) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        for (const img of await imagesOn(page)) {
          if (!img.raster) continue;
          const at = `${path} at ${width}px: ${img.name}`;
          if (!img.avif) problems.push(`${at}: no AVIF source`);
          if (img.fallback !== 'webp') problems.push(`${at}: fallback is ${img.fallback}, not WebP`);
          if (!img.source) problems.push(`${at}: no data-src-w (source width)`);
          if (!img.drawn || !img.shown) continue;
          const max = Math.max(0, ...img.widths);
          if (max >= 2 * img.shown) continue;
          // Mann's choice (17 Nov 2026): a file narrower than 2× its shown width is served at its full width and listed.
          if (img.source && max >= img.source) limited.add(`${img.name} (source ${img.source}px, shown up to ${img.shown}px)`);
          else problems.push(`${at}: srcset stops at ${max}w for ${img.shown}px shown (source ${img.source}px)`);
        }
      }
      await ctx.close();
    }
    if (limited.size) test.info().annotations.push({ type: 'G2: needs a higher-resolution capture (owner)', description: [...limited].join(' · ') });
    expect(problems).toEqual([]);
  });
});

/** Interactive elements a visitor can see (outside decoration, closed menus and screen-reader-only text). */
const INTERACTIVE = 'a[href], button, summary, select, textarea, input:not([type="hidden"]), [role="button"], [tabindex="0"]';

test.describe('design gates: responsiveness (Phase 6)', () => {
  test('R1: no page scrolls sideways at any of the ten matrix sizes', async ({ browser }) => {
    test.setTimeout(600_000);
    const problems: string[] = [];
    for (const [width, height] of MATRIX) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      for (const path of [...builtPages(), '/this-does-not-exist/']) {
        await page.goto(path);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (over > 0) problems.push(`${path} at ${width}×${height}: ${over}px sideways`);
      }
      await ctx.close();
    }
    expect(problems).toEqual([]);
  });

  test('R2: on every page the H1 never gets smaller as the screen widens (320 to 1920)', async ({ page }) => {
    test.setTimeout(300_000);
    const widths = [320, 360, 375, 390, 414, 480, 600, 768, 900, 1024, 1280, 1440, 1680, 1920];
    const problems: string[] = [];
    for (const path of builtPages()) {
      await page.setViewportSize({ width: widths[0], height: 900 });
      await page.goto(path);
      let last = 0;
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const size = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize));
        if (size < last - 0.01) problems.push(`${path}: ${last}px → ${size}px at ${width}px`);
        last = size;
      }
    }
    expect(problems).toEqual([]);
  });

  test('R4: on touch screens every link and button outside running text is at least 44×44px', async ({ browser }) => {
    test.setTimeout(400_000);
    const problems: string[] = [];
    for (const width of [320, 390, 768]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: true, isMobile: width < 600 });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        const small = await page.evaluate((sel) => {
          const out: string[] = [];
          for (const el of document.querySelectorAll<HTMLElement>(sel)) {
            if (el.closest('[aria-hidden="true"], dialog:not([open]), .visually-hidden, .sr-only, details:not([open]) > :not(summary)')) continue;
            // Drawn at all: not hidden, and not inside a closed accordion (whose content Chrome keeps laid out, unseen).
            if (!el.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true }) || !el.offsetWidth || !el.offsetHeight) continue;
            // Running text: a link inside a sentence (WCAG 2.5.8's inline exception).
            const block = el.closest('p, li, dd, td, figcaption, blockquote, label');
            const own = (el.textContent || '').trim().length;
            if (block && block !== el && (block.textContent || '').trim().length > own + 2 && el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue;
            // Form fields' own boxes (the checkbox inside a big label is checked through the label).
            if (el.matches('input[type="checkbox"], input[type="radio"]') && el.closest('label')) continue;
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            if (w < 43.5 || h < 43.5)
              out.push(`${el.tagName.toLowerCase()}.${(el.getAttribute('class') || '').split(' ')[0]} "${(el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30)}" ${w}×${h}`);
          }
          return out;
        }, INTERACTIVE);
        for (const x of small) problems.push(`${path} at ${width}px: ${x}`);
      }
      await ctx.close();
    }
    expect([...new Set(problems)]).toEqual([]);
  });

  test('R5: at 320px and at 640px (1280 at 200% zoom) nothing scrolls sideways and no two controls overlap', async ({ browser }) => {
    test.setTimeout(400_000);
    const problems: string[] = [];
    for (const { width, height, dpr } of [
      { width: 320, height: 568, dpr: 2 },
      { width: 640, height: 450, dpr: 2 }, // 1280×900 at 200% zoom
    ]) {
      const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        const r = await page.evaluate((sel) => {
          const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
          // A bar fixed or stuck to the screen (the header, a page's "Ask about this" bar) has content scroll under it by
          // design; covering focus is gate A3's job. Everything in normal flow is compared.
          const pinned = (e: Element) => {
            for (let a: Element | null = e; a && a !== document.body; a = a.parentElement)
              if (/fixed|sticky/.test(getComputedStyle(a).position)) return true;
            return false;
          };
          const els = [...document.querySelectorAll<HTMLElement>(sel)].filter(
            (e) =>
              !e.closest('[aria-hidden="true"], dialog:not([open]), .visually-hidden, .sr-only, .skip-link') &&
              // Drawn at all: not inside a closed accordion, whose content Chrome keeps laid out but unseen.
              e.checkVisibility({ contentVisibilityAuto: true, visibilityProperty: true }) &&
              e.offsetWidth > 1 &&
              e.offsetHeight > 1 &&
              getComputedStyle(e).visibility !== 'hidden' &&
              !pinned(e),
          );
          // One box per line: a link that wraps is two boxes, not one rectangle across both lines.
          const boxes = els.flatMap((e) =>
            [...e.getClientRects()].filter((b) => b.width > 1 && b.height > 1).map((b) => ({ e, x1: b.left + scrollX, y1: b.top + scrollY, x2: b.right + scrollX, y2: b.bottom + scrollY })),
          );
          const hits = new Set<string>();
          const name = (e: HTMLElement) => `${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24)}"`;
          for (let i = 0; i < boxes.length; i++)
            for (let j = i + 1; j < boxes.length; j++) {
              const a = boxes[i];
              const b = boxes[j];
              if (a.e === b.e || a.e.contains(b.e) || b.e.contains(a.e)) continue;
              const w = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
              const h = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
              if (w > 2 && h > 2) hits.add(`${name(a.e)} overlaps ${name(b.e)} (${Math.round(w)}×${Math.round(h)})`);
            }
          return { over, hits: [...hits] };
        }, INTERACTIVE);
        if (r.over > 0) problems.push(`${path} at ${width}px: ${r.over}px sideways`);
        for (const h of r.hits) problems.push(`${path} at ${width}px: ${h}`);
      }
      await ctx.close();
    }
    expect(problems).toEqual([]);
  });

  test('R6: display headings (H1, H2) never end on a one-word line, at any matrix size', async ({ browser }) => {
    test.setTimeout(600_000);
    const problems = new Set<string>();
    for (const [width, height] of MATRIX) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        const found = await page.evaluate(() => {
          const out: string[] = [];
          for (const h of document.querySelectorAll<HTMLElement>('main h1, main h2')) {
            if (!h.offsetWidth || h.closest('[aria-hidden="true"], .visually-hidden, .sr-only')) continue;
            // A heading may be written in lines (ui/Heading.astro: each .line-mask is one authored line, e.g. "Asked before" /
            // "buying."); a short authored line is a design choice, not an orphan. An orphan is a word that wrapping pushes
            // onto a line of its own at the end of an authored line.
            const masks = [...h.querySelectorAll<HTMLElement>(':scope .line-mask, :scope .hero__line')];
            const authored = masks.length ? masks : [h];
            for (const block of authored) {
              const words: { text: string; top: number; left: number; right: number }[] = [];
              const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
              for (let n = walker.nextNode(); n; n = walker.nextNode()) {
                const text = n.textContent || '';
                for (const m of text.matchAll(/\S+/g)) {
                  const range = document.createRange();
                  range.setStart(n, m.index!);
                  range.setEnd(n, m.index! + m[0].length);
                  const rect = range.getClientRects()[0];
                  if (rect) words.push({ text: m[0], top: Math.round(rect.top), left: rect.left, right: rect.right });
                }
              }
              const lines: (typeof words)[] = [];
              let top = -1e9;
              for (const w of words) {
                if (Math.abs(w.top - top) > 4) {
                  lines.push([w]);
                  top = w.top;
                } else lines[lines.length - 1].push(w);
              }
              // A full stop in its own span belongs to the word before it.
              const real = lines.map((l) => l.filter((w) => /[A-Za-z0-9]/.test(w.text))).filter((l) => l.length);
              const width = (l: typeof words) => Math.max(...l.map((w) => w.right)) - Math.min(...l.map((w) => w.left));
              const last = real[real.length - 1];
              // An orphan is a short word left alone (under 40% of the widest line). A long word that fills its own line
              // ("businesses." at 320px, where "small businesses." can't fit) is not one.
              if (real.length > 1 && last.length === 1 && width(last) < 0.4 * Math.max(...real.map(width)))
                out.push(`"${h.textContent!.trim().replace(/\s+/g, ' ').slice(0, 60)}" leaves "${last[0].text}" alone`);
            }
          }
          return out;
        });
        for (const f of found) problems.add(`${path} at ${width}×${height}: ${f}`);
      }
      await ctx.close();
    }
    expect([...problems]).toEqual([]);
  });
});

test.describe('design gates: performance (Phase 7)', () => {
  test('P2: Home at 375 loads at most 300 KB decoded, of which at most 60 KB is script and 70 KB fonts', async ({ browser }) => {
    // Measured as Phase 0 set out (docs/27-design-upgrade/phase-0-baseline.md): decoded bytes at load, at 1× density,
    // on the consent build (as on the live site, the prompt is part of a first visit). A 2× phone also loads sharper
    // captures; the Phase 7 record gives that figure too.
    const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`${CONSENT}/`, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const kb = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const out = { total: nav.decodedBodySize, script: 0, font: 0 };
      for (const r of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
        const size = r.decodedBodySize || 0;
        out.total += size;
        const path = new URL(r.name).pathname;
        if (r.initiatorType === 'script' || /\.m?js$/.test(path)) out.script += size;
        else if (/\.(woff2?|ttf|otf)$/.test(path)) out.font += size;
      }
      return { total: out.total / 1024, script: out.script / 1024, font: out.font / 1024 };
    });
    const shown = Object.fromEntries(Object.entries(kb).map(([k, v]) => [k, Math.round(v)]));
    expect(kb.total, JSON.stringify(shown)).toBeLessThanOrEqual(300);
    expect(kb.script, JSON.stringify(shown)).toBeLessThanOrEqual(60);
    expect(kb.font, JSON.stringify(shown)).toBeLessThanOrEqual(70);
    await ctx.close();
  });

  test('P3: Home has at most 950 elements, on a phone and on a laptop (one graph layout, closed menus empty)', async ({ browser }) => {
    for (const [width, height] of [
      [375, 812],
      [1440, 900],
    ]) {
      const ctx = await browser.newContext({ viewport: { width, height } });
      const page = await ctx.newPage();
      await page.goto(`${CONSENT}/`);
      await page.waitForTimeout(1000);
      const count = await page.evaluate(() => document.querySelectorAll('*').length);
      expect(count, `${width}px`).toBeLessThanOrEqual(950);
      await ctx.close();
    }
  });
});

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
async function axeViolations(page: Page): Promise<string[]> {
  // Cast: @axe-core/playwright 4.14 types target a newer Playwright than the 1.63 pinned to the preinstalled browsers.
  const r = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(AXE_TAGS).analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
}

test.describe('design gates: accessibility (Phase 8)', () => {
  // A1, every page at three sizes. Reduced motion puts each page straight into its resting state: text that is still
  // fading in reads as low contrast to axe. The site.spec.ts axe tests keep checking the pages with motion on.
  for (const width of [375, 768, 1440]) {
    test(`A1 at ${width}px: axe finds no WCAG 2.2 A/AA violation on any page`, async ({ browser }) => {
      test.setTimeout(300_000);
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const problems: string[] = [];
      for (const path of builtPages()) {
        await page.goto(path);
        await page.waitForTimeout(150);
        for (const v of await axeViolations(page)) problems.push(`${path}: ${v}`);
      }
      expect(problems, problems.join('\n')).toEqual([]);
      await ctx.close();
    });
  }

  test('A1 with overlays open: the phone menu, the quick menu, the consent prompt and a question, at 375, 768 and 1440', async ({ browser }) => {
    test.setTimeout(180_000);
    const problems: string[] = [];
    for (const width of [375, 768, 1440]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      const check = async (what: string) => {
        for (const v of await axeViolations(page)) problems.push(`${width}px, ${what}: ${v}`);
      };
      // The phone menu (below 64em).
      if (width < 1024) {
        await page.goto('/');
        await page.locator('[data-menu-open]').click();
        await expect(page.locator('#site-menu')).toBeVisible();
        await check('phone menu open');
      }
      // The quick menu, with a search typed.
      await page.goto('/services/');
      await page.keyboard.press('Control+k');
      await expect(page.getByRole('dialog', { name: 'Quick menu' })).toBeVisible();
      await page.getByRole('combobox').fill('price');
      await check('quick menu open');
      // A question open in the Home FAQ.
      await page.keyboard.press('Escape');
      await page.goto('/');
      const question = page.locator('#faq details').first();
      await question.locator('summary').click();
      await expect(question).toHaveAttribute('open', '');
      await check('a question open');
      // The consent prompt, as a first visit sees it (the consent build).
      await page.goto(`${CONSENT}/`);
      await openConsent(page);
      await check('consent prompt open');
      await ctx.close();
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('A4: with WCAG text spacing, no button label or heading clips, at 375, 768 and 1440 on every page', async ({ browser }) => {
    test.setTimeout(300_000);
    // WCAG 1.4.12's test styles.
    const spacing =
      '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';
    // Mann's decision (17 Nov 2026): measure the real text. The hover "roll" copies of button labels (and the ghost
    // buttons' hover fill) sit outside their box on purpose, hidden until hover; they are set aside for the measure.
    // A line mask may paint past its edge by its overflow-clip-margin (descenders), which is allowed for.
    const decorative = '.btn__label > span::after, .btn--ghost::before, .btn--ink::before { content: none !important; }';
    const problems = new Set<string>();
    for (const width of [375, 768, 1440]) {
      // At rest: reduced motion, so scroll-driven reveals are not caught half-way.
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        await page.addStyleTag({ content: decorative + spacing });
        await page.waitForTimeout(100);
        const clipped = await page.evaluate(() => {
          const scope = 'a.btn, button, .btn, h1, h2, h3, h4, summary';
          const out: string[] = [];
          for (const el of document.querySelectorAll<HTMLElement>(`${scope}, :is(${scope}) *`)) {
            if (!el.checkVisibility() || el.closest('.visually-hidden, [aria-hidden="true"]')) continue;
            const cs = getComputedStyle(el);
            if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
            const box = el.getBoundingClientRect();
            if (box.width <= 2 || box.height <= 2) continue;
            const margin = cs.overflowX === 'clip' || cs.overflowY === 'clip' ? parseFloat(cs.overflowClipMargin) || 0 : 0;
            if (el.scrollHeight > el.clientHeight + 1 + margin)
              out.push(`${el.tagName.toLowerCase()}.${(el.getAttribute('class') ?? '').split(' ')[0]} "${(el.textContent ?? '').trim().slice(0, 30)}" ${el.scrollHeight}/${el.clientHeight}`);
          }
          return out;
        });
        clipped.forEach((c) => problems.add(`${width}px ${path}: ${c}`));
      }
      await ctx.close();
    }
    expect([...problems], [...problems].join('\n')).toEqual([]);
  });

  test('A5: in forced colours, buttons have a visible edge, the focus ring shows, and chosen or current marks survive', async ({ browser }) => {
    for (const colorScheme of ['dark', 'light'] as const) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, forcedColors: 'active', colorScheme, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto('/');
      // Every button: a solid border at least 1px wide in a colour that differs from its background.
      const edgeless = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.btn, button, .ca__btn')]
          .filter((b) => b.checkVisibility())
          .filter((b) => {
            const cs = getComputedStyle(b);
            return cs.borderTopStyle === 'none' || parseFloat(cs.borderTopWidth) < 1 || cs.borderTopColor === cs.backgroundColor;
          })
          .map((b) => (b.getAttribute('class') ?? b.tagName).split(' ')[0]),
      );
      expect.soft(edgeless, `${colorScheme}: buttons without a visible edge`).toEqual([]);
      // The page's own background in this mode: a mark painted in it is invisible.
      const canvas = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const visible = (c: string) => !/rgba\(0, 0, 0, 0\)|transparent/.test(c) && c !== canvas;
      // The Menu button's lines are drawn (the mode paints fills in the page background unless a component draws them
      // in system colours).
      const lines = await page.locator('.menu-btn__lines i').first().evaluate((i) => getComputedStyle(i).backgroundColor);
      expect.soft(visible(lines), `${colorScheme}: Menu lines ${lines} on ${canvas}`).toBe(true);
      // Display headings are set loosely enough that the mode's line backplates don't cut the line above.
      const tight = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('h1, h2')]
          .filter((h) => h.checkVisibility())
          .filter((h) => parseFloat(getComputedStyle(h).lineHeight) < 1.15 * parseFloat(getComputedStyle(h).fontSize) - 0.5)
          .map((h) => (h.textContent ?? '').trim().slice(0, 30)),
      );
      expect.soft(tight, `${colorScheme}: headings set tighter than 1.15`).toEqual([]);
      // The focus ring: Tab to the first few stops; each shows a solid outline at least 2px wide.
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        const ring = await page.evaluate(() => {
          const cs = getComputedStyle(document.activeElement!);
          return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth), color: cs.outlineColor };
        });
        expect.soft(ring.style, `${colorScheme}: focus ring ${i + 1}`).not.toBe('none');
        expect.soft(ring.width, `${colorScheme}: focus ring ${i + 1} width`).toBeGreaterThanOrEqual(2);
        expect.soft(visible(ring.color), `${colorScheme}: focus ring ${i + 1} colour ${ring.color}`).toBe(true);
      }
      // The contact form: the chosen card has a different edge from the other, and the progress bar is drawn.
      await page.goto('/contact/');
      const cards = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.choose__opt')].map((c) => `${getComputedStyle(c).borderTopWidth} ${getComputedStyle(c).borderTopColor}`),
      );
      expect.soft(new Set(cards).size, `${colorScheme}: chosen card looks the same as the other: ${cards.join(' | ')}`).toBe(2);
      const bar = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('.steps-nav__bar li')].map((li) => getComputedStyle(li).backgroundColor));
      expect.soft(bar.length > 0 && bar.every(visible), `${colorScheme}: progress bar ${bar.join(' ')} on ${canvas}`).toBe(true);
      await ctx.close();
    }
  });
});

test.describe('design gates: the re-audit (Phase 9)', () => {
  test('T6: body text keeps the measure (at most 72 characters a line) at a line height of 1.5 to 1.7, on every page', async ({ browser }) => {
    test.setTimeout(900_000);
    const problems = new Set<string>();
    for (const [width, height] of [[375, 812], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]] as const) {
      const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        const found = await page.evaluate(() => {
          const sized = document.createElement('div');
          sized.style.cssText = 'position:absolute;font-size:var(--fs-base)';
          document.body.append(sized);
          const base = parseFloat(getComputedStyle(sized).fontSize);
          sized.remove();
          // Group each text run under its nearest block box: that box's lines are the text's lines.
          const blocks = new Map<Element, Text[]>();
          const SKIP = 'template, [aria-hidden="true"], h1, h2, h3, h4, button, label, summary, table, figcaption, .visually-hidden, dialog:not([open])';
          for (const root of document.querySelectorAll('main, footer')) {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            for (let n = walker.nextNode(); n; n = walker.nextNode()) {
              if (!n.textContent!.trim() || !n.parentElement || n.parentElement.closest(SKIP)) continue;
              let block: Element = n.parentElement;
              while (block.parentElement && /^inline/.test(getComputedStyle(block).display)) block = block.parentElement;
              if (!blocks.has(block)) blocks.set(block, []);
              blocks.get(block)!.push(n as Text);
            }
          }
          const out: string[] = [];
          for (const [block, texts] of blocks) {
            const cs = getComputedStyle(block);
            const fs = parseFloat(cs.fontSize);
            if (Math.abs(fs - base) > 0.05 || /mono/i.test(cs.fontFamily) || cs.visibility === 'hidden') continue;
            const lines = new Map<number, [number, number]>();
            for (const t of texts) {
              const range = document.createRange();
              range.selectNodeContents(t);
              for (const r of range.getClientRects()) {
                if (!r.width || r.height > fs * 2.5) continue;
                const key = Math.round((r.top + r.height / 2) / 6);
                const l = lines.get(key) ?? [Infinity, -Infinity];
                lines.set(key, [Math.min(l[0], r.left), Math.max(l[1], r.right)]);
              }
            }
            if (lines.size < 2) continue;
            const probe = document.createElement('span');
            probe.style.cssText = 'position:absolute;display:inline-block;width:72ch;height:0;visibility:hidden';
            block.append(probe);
            const measure = probe.getBoundingClientRect().width;
            probe.remove();
            const longest = Math.max(...[...lines.values()].map(([a, b]) => b - a));
            const lh = parseFloat(cs.lineHeight) / fs;
            const name = `${block.tagName.toLowerCase()}.${(block.getAttribute('class') || '').split(' ')[0]} "${block.textContent!.replace(/\s+/g, ' ').trim().slice(0, 40)}"`;
            if (longest > measure + 0.5) out.push(`${name} runs ${((longest / measure) * 72).toFixed(0)}ch`);
            if (!(lh >= 1.495 && lh <= 1.705)) out.push(`${name} has line height ${lh.toFixed(2)}`);
          }
          return out;
        });
        for (const f of found) problems.add(`${path} at ${width}: ${f}`);
      }
      await ctx.close();
    }
    expect([...problems]).toEqual([]);
  });

  test('C4: the header wordmark is the small (Medium) cut, at least 13px tall on phones and 16px from 1024, with clear space', async ({ browser }) => {
    for (const [width, height] of MATRIX) {
      const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (const path of ['/', '/services/']) {
        await page.goto(path);
        const r = await page.evaluate(() => {
          const svg = document.querySelector<SVGSVGElement>('[data-header] .wordmark__logo')!;
          const w = svg.getBoundingClientRect();
          const h = w.height;
          const hdr = document.querySelector('[data-header]')!.getBoundingClientRect();
          // Clear space (DESIGN.md → Colour → The wordmark): one cap height on every side, free of other text and controls.
          const zone = { left: w.left - h, right: w.right + h, top: w.top - h, bottom: w.bottom + h };
          const crowding = [...document.querySelectorAll('[data-header] a, [data-header] button, [data-header] p, [data-header] input')]
            .filter((e) => !e.contains(svg) && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden')
            .map((e) => ({ e, b: e.getBoundingClientRect() }))
            .filter(({ b }) => b.width > 1 && b.height > 1 && b.right > 0 && b.left < innerWidth)
            .filter(({ b }) => b.left < zone.right && b.right > zone.left && b.top < zone.bottom && b.bottom > zone.top)
            .map(({ e }) => `${e.tagName.toLowerCase()}.${(e.getAttribute('class') || '').split(' ')[0]}`);
          return {
            cut: svg.dataset.cut,
            h,
            edges: { left: w.left, top: w.top - hdr.top, bottom: hdr.bottom - w.bottom },
            crowding,
          };
        });
        const where = `${path} at ${width}×${height}`;
        expect.soft(r.cut, `${where}: cut`).toBe('small');
        expect.soft(r.h, `${where}: height`).toBeGreaterThanOrEqual(width >= 1024 ? 15.99 : 12.99);
        expect.soft(Math.min(r.edges.left, r.edges.top, r.edges.bottom), `${where}: space to the screen edge and the bar's edges`).toBeGreaterThanOrEqual(r.h - 0.5);
        expect.soft(r.crowding, `${where}: inside the clear space`).toEqual([]);
      }
      await ctx.close();
    }
  });

  test('L1 (manual part, as a check): at 1440 no head leaves its column empty for more than 35% of the screen beside its content', async ({ browser }) => {
    test.setTimeout(300_000);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const problems: string[] = [];
    for (const path of builtPages()) {
      await page.goto(path);
      const found = await page.evaluate(() => {
        const out: string[] = [];
        for (const hd of document.querySelectorAll('main h1, main h2')) {
          if (hd.closest('template, [aria-hidden="true"]') || !hd.getClientRects().length) continue;
          // The head's column: the ancestor with a sibling beside it (a two-column row).
          let col: Element = hd;
          let side: Element[] = [];
          while (col.parentElement && col.parentElement.tagName !== 'MAIN') {
            const me = col.getBoundingClientRect();
            side = [...col.parentElement.children].filter((k) => {
              if (k === col || !k.getClientRects().length || getComputedStyle(k).position === 'absolute') return false;
              const r = k.getBoundingClientRect();
              return r.width > 100 && r.top < me.bottom && r.bottom > me.top && (r.left >= me.right - 2 || r.right <= me.left + 2);
            });
            if (side.length) break;
            col = col.parentElement;
          }
          if (!side.length) continue;
          let sticky = false;
          for (let e: Element | null = hd; e && e !== col.parentElement; e = e.parentElement) if (getComputedStyle(e).position === 'sticky') sticky = true;
          if (sticky) continue;
          const top = col.getBoundingClientRect().top;
          let bottom = top;
          for (const c of col.querySelectorAll('*')) if (c.getClientRects().length) bottom = Math.max(bottom, c.getBoundingClientRect().bottom);
          const beside = Math.max(...side.map((k) => k.getBoundingClientRect().height));
          const empty = beside - (bottom - top);
          if (empty > innerHeight * 0.35) out.push(`"${hd.textContent!.replace(/\s+/g, ' ').trim().slice(0, 40)}" leaves ${Math.round(empty)}px empty`);
        }
        return out;
      });
      problems.push(...found.map((f) => `${path}: ${f}`));
    }
    await ctx.close();
    expect(problems).toEqual([]);
  });

  test('L4: eyebrow → heading is --head-gap-1 and heading → intro is --head-gap-2, in every section and page head', async ({ browser }) => {
    test.setTimeout(600_000);
    const problems = new Set<string>();
    for (const [width, height] of [[375, 812], [1440, 900]] as const) {
      const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      for (const path of builtPages()) {
        await page.goto(path);
        const found = await page.evaluate(() => {
          const gap = (v: string) => {
            const d = document.createElement('div');
            d.style.cssText = `position:absolute;height:var(${v})`;
            document.body.append(d);
            const h = d.getBoundingClientRect().height;
            d.remove();
            return h;
          };
          const g1 = gap('--head-gap-1');
          const g2 = gap('--head-gap-2');
          const shown = (e: Element | null) => {
            while (e && !e.getClientRects().length) e = e.nextElementSibling;
            return e;
          };
          const out: string[] = [];
          for (const eyebrow of document.querySelectorAll('main .eyebrow')) {
            if (eyebrow.closest('template, [aria-hidden="true"]') || !eyebrow.getClientRects().length) continue;
            const heading = shown(eyebrow.nextElementSibling);
            if (!heading || !/^H[12]$/.test(heading.tagName)) continue;
            const e = eyebrow.getBoundingClientRect();
            const h = heading.getBoundingClientRect();
            const name = `"${heading.textContent!.replace(/\s+/g, ' ').trim().slice(0, 36)}"`;
            if (Math.abs(h.top - e.bottom - g1) > 1) out.push(`${name}: eyebrow → heading ${(h.top - e.bottom).toFixed(1)}px, not ${g1.toFixed(1)}`);
            const intro = shown(heading.nextElementSibling);
            if (!intro || intro.tagName !== 'P' || intro.classList.contains('eyebrow')) continue;
            const i = intro.getBoundingClientRect();
            if (i.top < h.bottom - 1) continue; // set beside the heading (Home's services head on wide screens)
            if (Math.abs(i.top - h.bottom - g2) > 1) out.push(`${name}: heading → intro ${(i.top - h.bottom).toFixed(1)}px, not ${g2.toFixed(1)}`);
          }
          return out;
        });
        for (const f of found) problems.add(`${path} at ${width}: ${f}`);
      }
      await ctx.close();
    }
    expect([...problems]).toEqual([]);
  });
});
