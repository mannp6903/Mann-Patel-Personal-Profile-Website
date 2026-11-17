// Design upgrade gates checked in the browser (DESIGN_UPGRADE_PLAN.md §5). Each phase adds the gates it turns green.
// Phase 1 (17 Nov 2026): T3, T4, T5 (typography), C1 (lime budget), L2 (section padding).
import { expect, test, type Page } from '@playwright/test';

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
