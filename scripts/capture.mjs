// Usage: node scripts/capture.mjs [baseUrl] [outDir] [paths...]
// Full-page screenshots at representative widths, plus overflow detection.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:4321';
const out = process.argv[3] || 'qa-output/captures';
const paths = process.argv.slice(4).length ? process.argv.slice(4) : ['/'];
const widths = (process.env.WIDTHS || '360,390,768,1024,1440').split(',').map(Number);
const reduced = process.env.REDUCED_MOTION === '1';

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const problems = [];
for (const w of widths) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: w < 768 ? 800 : 900 },
    deviceScaleFactor: 1,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2600); // let images, the portrait and reveals settle
    // reveal everything for a full-page capture
    await page.evaluate(() => document.querySelectorAll('[data-reveal], [data-split]').forEach((el) => el.classList.add('is-in')));
    await page.waitForTimeout(700); // let reveal transitions finish
    const overflow = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const offenders = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > docW + 1 || r.left < -1)) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed' || el.closest('[aria-hidden="true"], .thumb-stage, .visually-hidden, .skip-link')) continue;
          // Cards inside a sideways-scrolling row (swipe rails, the jump bar) are meant to sit off screen.
          let inScroller = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') {
              inScroller = true;
              break;
            }
          }
          if (inScroller) continue;
          offenders.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} → ${Math.round(r.left)}..${Math.round(r.right)}`);
        }
      }
      return { scrollW: document.documentElement.scrollWidth, docW, offenders: offenders.slice(0, 8) };
    });
    if (overflow.scrollW > overflow.docW || overflow.offenders.length) problems.push({ width: w, path: p, ...overflow });
    const name = `${out}/${(p === '/' ? 'home' : p.replace(/\//g, '_').replace(/^_|_$/g, ''))}-${w}.png`;
    await page.screenshot({ path: name, fullPage: true });
    console.log('saved', name);
  }
  await ctx.close();
}
await browser.close();
if (problems.length) {
  console.log('\nHORIZONTAL OVERFLOW FOUND:');
  for (const p of problems) console.log(JSON.stringify(p));
  process.exitCode = 1;
} else console.log('\nNo horizontal overflow at', widths.join(', '));
