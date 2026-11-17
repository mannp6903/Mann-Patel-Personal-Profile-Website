// Design screenshots and numbers for the design upgrade (DESIGN_UPGRADE_PLAN.md, Phase 0, 17 Nov 2026).
//
// Usage:
//   node scripts/design-shots.mjs [baseUrl] [options]        a running site (default http://127.0.0.1:4321)
//   node scripts/design-shots.mjs --serve dist/client [...]   a built folder, served on a free local port
//
// For the page visitors get (consent prompt included, as Lighthouse CI measures it), build for production first:
//   npm run build:cloudflare && node scripts/design-shots.mjs --serve dist/client --metrics --label before
// The preview build (`npm run build`) has no GA4 ID, so it shows no consent prompt.
//
// Options:
//   --label <name>         output folder under --out (default "current"), e.g. before / after / phase-1
//   --out <dir>            output root (default qa-output/design, gitignored)
//   --pages <a,b>          paths (default: the five in the plan)
//   --sizes <list>         "all" (the R1 matrix, default), "report" (375x812, 768x1024, 1440x900) or WxH,WxH
//   --metrics              also measure LCP, CLS, decoded bytes, DOM size and running animations (see below)
//   --metric-sizes <list>  sizes for --metrics (default "report")
//   --idle <ms>            how long a page sits untouched before animations are counted (default 15000)
//   --no-shots             numbers only
//   --no-consent           store a "No thanks" first, so the consent prompt stays closed
//   --reduced-motion       emulate prefers-reduced-motion: reduce
//   --scale <n>            device scale factor for the screenshots (default 1)
//   --compare <a>,<b>      no capture: compare two earlier runs (labels a and b under --out). Writes compare-<W>.jpg
//                          (first screens side by side, a on the left) and compare.md (numbers, a → b) to
//                          <out>/compare-<a>-<b>/. Added in Phase 1 for each phase's before/after report.
//
// Screenshots: for every size and page the script loads the page, records its headings and length, scrolls through
// it once (so scroll reveals and lazy images fire), returns to the top, waits for motion to settle, then saves
// <page>-<W>x<H>-first.png (the first screen) and <page>-<W>x<H>-full.png (the whole page). It also writes
// index.html (every capture) and, for each of 375, 768 and 1440 in the run, sheet-<W>.jpg (all pages' first screens).
//
// Numbers (--metrics), each page in a fresh browser context with no input:
//   - LCP time and element, CLS (largest session window) and DOM elements, read 3 s after load, before any scroll.
//   - Decoded bytes by type (HTML with its inline CSS, CSS files, JS, fonts, images, other): at load, and again
//     after scrolling through the page (lazy images included).
//   - Animations still running `idle` ms after the page started loading: all, on the document timeline (scroll-driven
//     ones excluded, as in gate M2) and infinite ones, with the biggest groups by name and element.
// Headings (always): the computed size, weight and tracking of every visible H1 and H2 at every size, plus page length
// in screens, horizontal overflow and scroll reveals left hidden after the scroll; on Home also the hero's height and
// where the Selected Work heading starts.
//
// Results: results.json (everything) and summary.md (tables) in the output folder. Lab numbers on this machine, not
// field data: compare runs made on the same machine.
import { chromium } from '@playwright/test';
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/* ── Options ────────────────────────────────────────────── */
const MATRIX = ['320x568', '360x740', '375x812', '390x844', '768x1024', '1024x768', '1280x800', '1440x900', '1920x1080', '844x390'];
const REPORT = ['375x812', '768x1024', '1440x900'];
const PAGES = ['/', '/services/', '/work/nest-and-rest-cleaning/', '/about/', '/contact/'];

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const valued = new Set(['--label', '--out', '--pages', '--sizes', '--metric-sizes', '--idle', '--serve', '--scale', '--compare']);
const positional = argv.filter((a, i) => !a.startsWith('--') && !valued.has(argv[i - 1]));

const parseSizes = (s) =>
  (s === 'all' ? MATRIX : s === 'report' ? REPORT : s.split(','))
    .map((x) => x.trim().toLowerCase().split('x').map(Number))
    .map(([width, height]) => {
      if (!width || !height) throw new Error(`Bad size "${s}": use WxH, e.g. 375x812`);
      return { width, height };
    });

const label = opt('--label', 'current');
const outDir = join(opt('--out', 'qa-output/design'), label);
const pages = opt('--pages', PAGES.join(',')).split(',').map((p) => p.trim()).filter(Boolean);
const sizes = parseSizes(opt('--sizes', 'all'));
const metricSizes = parseSizes(opt('--metric-sizes', 'report'));
const idleMs = Number(opt('--idle', '15000'));
const scale = Number(opt('--scale', '1'));
const doShots = !flag('--no-shots');
const doMetrics = flag('--metrics');
const noConsent = flag('--no-consent');
const reducedMotion = flag('--reduced-motion') ? 'reduce' : 'no-preference';
const serveDir = opt('--serve', null);

const slug = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-'));
const sizeName = ({ width, height }) => `${width}x${height}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ── A small static server for --serve ──────────────────── */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

async function serve(dir) {
  const root = resolve(dir);
  if (!(await stat(root).catch(() => null))?.isDirectory()) throw new Error(`--serve: no folder at ${root} (build first)`);
  const fileAt = async (p) => ((await stat(p).catch(() => null))?.isFile() ? p : null);
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://local');
      const path = decodeURIComponent(url.pathname);
      // /api/ is the Worker's form endpoint, not a file. A short 404 keeps the 404 page out of the byte counts; the
      // forms then look as they do on the live site (no "not connected" notice).
      if (path.startsWith('/api/')) {
        return res.writeHead(404, { 'content-type': 'application/json' }).end('{"error":"not served by --serve"}');
      }
      let file = normalize(join(root, path));
      if (file !== root && !file.startsWith(root + sep)) return res.writeHead(403).end();
      if ((await stat(file).catch(() => null))?.isDirectory()) {
        // Same as the live site: /about -> /about/ (trailingSlash: 'always').
        if (!path.endsWith('/')) return res.writeHead(301, { location: `${path}/${url.search}` }).end();
        file = join(file, 'index.html');
      }
      const found = await fileAt(file);
      const body = found ?? (await fileAt(join(root, '404.html')));
      res.writeHead(found ? 200 : 404, {
        'content-type': TYPES[extname(body ?? '.txt').toLowerCase()] ?? 'application/octet-stream',
        'cache-control': 'no-cache',
      });
      if (!body || req.method === 'HEAD') return res.end(body ? undefined : 'Not found');
      createReadStream(body).pipe(res);
    } catch {
      res.writeHead(500).end();
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

/* ── In-page helpers (serialised into the page) ─────────── */
// Runs before any page script: records LCP and layout shifts as they happen.
function initMetrics() {
  const describe = (el) => {
    if (!el || !el.tagName) return null;
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    const src = el.currentSrc || el.getAttribute('src') || '';
    const text = src ? src.split('/').pop().split('?')[0] : (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 48);
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls.map((c) => `.${c}`).join('')}${text ? ` "${text}"` : ''}`;
  };
  const m = (window.__designMetrics = { lcp: null, shifts: [] });
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) m.lcp = { t: e.startTime, size: e.size, url: e.url || null, element: describe(e.element) };
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) m.shifts.push({ t: e.startTime, v: e.value });
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
}

function readLoadMetrics() {
  const m = window.__designMetrics || { lcp: null, shifts: [] };
  // CLS as Lighthouse and CrUX define it: the largest session window (gaps under 1 s, at most 5 s long).
  let cls = 0;
  let win = 0;
  let start = -Infinity;
  let prev = -Infinity;
  for (const s of m.shifts) {
    if (s.t - prev > 1000 || s.t - start > 5000) {
      win = 0;
      start = s.t;
    }
    win += s.v;
    prev = s.t;
    cls = Math.max(cls, win);
  }
  return {
    lcpMs: m.lcp ? Math.round(m.lcp.t) : null,
    lcpElement: m.lcp ? m.lcp.element || m.lcp.url : null,
    cls: Math.round(cls * 10000) / 10000,
    domElements: document.getElementsByTagName('*').length,
  };
}

function readBytes() {
  const kinds = { html: 0, css: 0, js: 0, font: 0, image: 0, other: 0 };
  const nav = performance.getEntriesByType('navigation')[0];
  kinds.html += nav ? nav.decodedBodySize : 0;
  let requests = 1;
  for (const r of performance.getEntriesByType('resource')) {
    const path = new URL(r.name, location.href).pathname.toLowerCase();
    const kind = /\.css$/.test(path)
      ? 'css'
      : /\.m?js$/.test(path) || r.initiatorType === 'script'
        ? 'js'
        : /\.(woff2?|ttf|otf)$/.test(path)
          ? 'font'
          : /\.(png|jpe?g|webp|avif|gif|svg|ico)$/.test(path) || r.initiatorType === 'img'
            ? 'image'
            : 'other';
    kinds[kind] += r.decodedBodySize || 0;
    requests += 1;
  }
  const total = Object.values(kinds).reduce((a, b) => a + b, 0);
  return { ...kinds, total, requests };
}

function readAnimations() {
  const describe = (el, pseudo) => {
    if (!el || !el.tagName) return '?';
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0];
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls ? `.${cls}` : ''}${pseudo || ''}`;
  };
  const all = document.getAnimations();
  const running = all.filter((a) => a.playState === 'running');
  // Scroll-driven animations (ScrollTimeline / ViewTimeline) only move while the visitor scrolls: not counted (M2).
  const onDocument = running.filter((a) => a.timeline instanceof DocumentTimeline);
  const infinite = onDocument.filter((a) => a.effect && a.effect.getComputedTiming().iterations === Infinity);
  const groups = {};
  for (const a of onDocument) {
    const name = a.animationName || (a.transitionProperty ? `transition:${a.transitionProperty}` : a.id || 'script');
    const key = `${name} @ ${describe(a.effect && a.effect.target, a.effect && a.effect.pseudoElement)}`;
    groups[key] = (groups[key] || 0) + 1;
  }
  const top = Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([what, count]) => ({ what, count }));
  return { all: all.length, running: running.length, onDocumentTimeline: onDocument.length, infinite: infinite.length, top };
}

function readType() {
  const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const info = (el) => {
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
    return {
      id: el.id || null,
      class: (el.getAttribute('class') || '').trim().split(/\s+/)[0] || null,
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
      px: round(px),
      weight: cs.fontWeight,
      trackingEm: px ? round(ls / px, 3) : 0,
    };
  };
  const h1 = [...document.querySelectorAll('h1')].filter(visible).map(info);
  const h2 = [...document.querySelectorAll('h2')].filter(visible).map(info);
  const maxH2 = h2.reduce((m, h) => (h.px > (m ? m.px : 0) ? h : m), null);
  const root = document.documentElement;
  const hero = document.getElementById('hero');
  const work = document.getElementById('work-title');
  return {
    h1,
    h2,
    h1Px: h1.length ? Math.max(...h1.map((h) => h.px)) : null,
    maxH2Px: maxH2 ? maxH2.px : null,
    maxH2: maxH2 ? maxH2.id || maxH2.class || maxH2.text : null,
    h1OverMaxH2: h1.length && maxH2 ? round(Math.max(...h1.map((h) => h.px)) / maxH2.px, 2) : null,
    screens: round(root.scrollHeight / innerHeight, 2),
    heroScreens: hero ? round(hero.getBoundingClientRect().height / innerHeight, 2) : null,
    workTitleTop: work ? Math.round(work.getBoundingClientRect().top + scrollY) : null,
  };
}

function readAfterScroll() {
  const root = document.documentElement;
  return {
    overflowX: root.scrollWidth > root.clientWidth,
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
    // Scroll reveals still hidden after scrolling the whole page (DESIGN_AUDIT.md W7). Cards in a sideways swipe rail
    // are left out: they reveal when swiped into view.
    revealsPending: [...document.querySelectorAll('.js-motion [data-reveal]:not(.is-in), .js-motion [data-split]:not(.is-in)')].filter((el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if ((ox === 'auto' || ox === 'scroll') && p.scrollWidth > p.clientWidth) return false;
      }
      return true;
    }).length,
  };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.max(200, Math.round(innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await pause(100);
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await pause(300);
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

async function settle(page) {
  // Lazy images that started loading during the scroll, then the fonts, then a pause for transitions to finish.
  await page
    .evaluate(() => {
      const pending = [...document.images]
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((done) => {
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
            }),
        );
      return Promise.race([Promise.all(pending), new Promise((done) => setTimeout(done, 5000))]);
    })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready).catch(() => {});
  await page.waitForTimeout(1500);
}

/* ── Compare two runs (--compare a,b) ───────────────────── */
const compareLabels = opt('--compare', null);
if (compareLabels) {
  await compareRuns(...compareLabels.split(',').map((x) => x.trim()));
  process.exit(0);
}

async function compareRuns(a, b) {
  const { readFile } = await import('node:fs/promises');
  const root = opt('--out', 'qa-output/design');
  const load = async (l) => JSON.parse(await readFile(join(root, l, 'results.json'), 'utf8'));
  const [ra, rb] = [await load(a), await load(b)];
  const dir = join(root, `compare-${a}-${b}`);
  await mkdir(dir, { recursive: true });
  const kb = (n) => (n == null ? '–' : `${Math.round(n / 1024)}`);
  const pair = (x, y) => (String(x) === String(y) ? `${x}` : `${x} → ${y}`);
  const lines = [`# Design numbers: ${a} → ${b}`, '', `${a}: ${ra.createdAt} (${ra.base}) · ${b}: ${rb.createdAt} (${rb.base})`, ''];
  const metricRows = rb.metrics.map((m) => [ra.metrics.find((x) => x.path === m.path && x.size === m.size), m]).filter(([x]) => x);
  if (metricRows.length) {
    lines.push('| Page | Size | LCP ms | LCP element | CLS | DOM elements | KB at load | JS KB | Fonts KB | Running after idle (infinite) |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const [x, y] of metricRows)
      lines.push(
        `| ${y.path} | ${y.size} | ${pair(x.lcpMs, y.lcpMs)} | ${pair(x.lcpElement, y.lcpElement).replace(/\|/g, '/')} | ${pair(x.cls, y.cls)} | ${pair(x.domElements, y.domElements)} | ${pair(kb(x.bytesAtLoad.total), kb(y.bytesAtLoad.total))} | ${pair(kb(x.bytesAtLoad.js), kb(y.bytesAtLoad.js))} | ${pair(kb(x.bytesAtLoad.font), kb(y.bytesAtLoad.font))} | ${pair(`${x.animationsAfterIdle.onDocumentTimeline} (${x.animationsAfterIdle.infinite})`, `${y.animationsAfterIdle.onDocumentTimeline} (${y.animationsAfterIdle.infinite})`)} |`,
      );
    lines.push('');
  }
  const typeRows = rb.type.map((t) => [ra.type.find((x) => x.path === t.path && x.size === t.size), t]).filter(([x]) => x);
  if (typeRows.length) {
    lines.push('| Page | Size | H1 px | Largest H2 px | H1 ÷ H2 | Screens | Hero screens | Work heading y |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const [x, y] of typeRows)
      lines.push(`| ${y.path} | ${y.size} | ${pair(x.h1Px, y.h1Px)} | ${pair(x.maxH2Px, y.maxH2Px)} | ${pair(x.h1OverMaxH2, y.h1OverMaxH2)} | ${pair(x.screens, y.screens)} | ${pair(x.heroScreens ?? '–', y.heroScreens ?? '–')} | ${pair(x.workTitleTop ?? '–', y.workTitleTop ?? '–')} |`);
    lines.push('');
  }
  await writeFile(join(dir, 'compare.md'), lines.join('\n'));
  const browser = await chromium.launch();
  for (const width of [375, 768, 1440]) {
    const shots = rb.shots.filter((s) => s.size.startsWith(`${width}x`)).map((s) => [ra.shots.find((x) => x.path === s.path && x.size === s.size), s]).filter(([x]) => x);
    if (!shots.length) continue;
    const src = (l, f) => pathToFileURL(resolve(root, l, f)).href;
    const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#1a1a1a;color:#ddd;font:600 18px/1.3 system-ui,sans-serif;width:max-content}
.row{display:grid;grid-template-columns:repeat(2,${width}px);gap:24px;margin-bottom:28px}figure{margin:0}
figcaption{margin:0 0 8px}img{display:block;width:${width}px;outline:1px solid #444}h1{font-size:22px;margin:0 0 20px}
</style><h1>First screens at ${width}px · ${a} (left) → ${b} (right)</h1>${shots
      .map(([x, y]) => `<div class="row"><figure><figcaption>${y.path} · ${a}</figcaption><img src="${src(a, x.first)}"></figure><figure><figcaption>${y.path} · ${b}</figcaption><img src="${src(b, y.first)}"></figure></div>`)
      .join('')}`;
    const file = join(dir, `.compare-${width}.html`);
    await writeFile(file, html);
    const page = await (await browser.newContext({ viewport: { width: 400, height: 400 } })).newPage();
    await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'load' });
    await page.screenshot({ path: join(dir, `compare-${width}.jpg`), fullPage: true, type: 'jpeg', quality: 80 });
    await page.context().close();
  }
  await browser.close();
  console.log(`Saved to ${dir}/ (compare.md and compare-*.jpg)`);
}

/* ── Run ────────────────────────────────────────────────── */
const local = serveDir ? await serve(serveDir) : null;
const base = (local?.base ?? positional[0] ?? 'http://127.0.0.1:4321').replace(/\/$/, '');
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const newContext = async (size, extra = {}) => {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: scale, reducedMotion, ...extra });
  if (noConsent) await ctx.addInitScript(() => {
    try {
      localStorage.setItem('mp-analytics', 'denied');
    } catch {}
  });
  return ctx;
};

const results = {
  createdAt: new Date().toISOString(),
  base: serveDir ? `--serve ${serveDir}` : base,
  label,
  options: { reducedMotion, noConsent, scale, idleMs },
  type: [],
  metrics: [],
  shots: [],
};

if (doShots || !doMetrics) {
  for (const size of sizes) {
    const ctx = await newContext(size);
    const page = await ctx.newPage();
    for (const path of pages) {
      const res = await page.goto(base + path, { waitUntil: 'networkidle' });
      if (!res || !res.ok()) console.warn(`! ${path} answered ${res?.status()}`);
      await page.waitForTimeout(400);
      const type = await page.evaluate(readType);
      await scrollThrough(page);
      await settle(page);
      const after = await page.evaluate(readAfterScroll);
      results.type.push({ path, size: sizeName(size), ...type, ...after });
      if (doShots) {
        const name = `${slug(path)}-${sizeName(size)}`;
        await page.screenshot({ path: join(outDir, `${name}-first.png`) });
        await page.screenshot({ path: join(outDir, `${name}-full.png`), fullPage: true });
        results.shots.push({ path, size: sizeName(size), first: `${name}-first.png`, full: `${name}-full.png` });
      }
      console.log(`${sizeName(size).padEnd(9)} ${path}  H1 ${type.h1Px}px, largest H2 ${type.maxH2Px}px, ${type.screens} screens${after.overflowX ? ', OVERFLOW' : ''}`);
    }
    await ctx.close();
  }
}

if (doMetrics) {
  for (const size of metricSizes) {
    // 1. Load numbers: one page at a time, nothing else running.
    const rows = [];
    for (const path of pages) {
      const ctx = await newContext(size);
      await ctx.addInitScript(initMetrics);
      const page = await ctx.newPage();
      await page.goto(base + path, { waitUntil: 'load' });
      await page.waitForTimeout(3000);
      const load = await page.evaluate(readLoadMetrics);
      const bytesAtLoad = await page.evaluate(readBytes);
      await scrollThrough(page);
      await settle(page);
      const bytesAfterScroll = await page.evaluate(readBytes);
      rows.push({ path, size: sizeName(size), ...load, bytesAtLoad, bytesAfterScroll });
      await ctx.close();
    }
    // 2. Animations: every page opened together and left alone, each counted `idle` ms after it started loading.
    const counts = await Promise.all(
      pages.map(async (path) => {
        const ctx = await newContext(size);
        const page = await ctx.newPage();
        const t0 = Date.now();
        await page.goto(base + path, { waitUntil: 'load' });
        await sleep(Math.max(0, t0 + idleMs - Date.now()));
        const animations = await page.evaluate(readAnimations);
        await ctx.close();
        return animations;
      }),
    );
    rows.forEach((row, i) => {
      row.animationsAfterIdle = counts[i];
      results.metrics.push(row);
      const kb = (n) => `${Math.round(n / 1024)}KB`;
      console.log(
        `${row.size.padEnd(9)} ${row.path}  LCP ${row.lcpMs}ms (${row.lcpElement}), CLS ${row.cls}, ${row.domElements} elements, ` +
          `${kb(row.bytesAtLoad.total)} at load / ${kb(row.bytesAfterScroll.total)} scrolled, ` +
          `${row.animationsAfterIdle.onDocumentTimeline} running after ${idleMs / 1000}s (${row.animationsAfterIdle.infinite} infinite)`,
      );
    });
  }
}

await writeFile(join(outDir, 'results.json'), JSON.stringify(results, null, 2));
await writeFile(join(outDir, 'summary.md'), summary(results));

if (doShots && results.shots.length) {
  await writeFile(join(outDir, 'index.html'), gallery(results));
  // A contact sheet of every page's first screen, for each report width in the run.
  for (const width of [375, 768, 1440]) {
    const shots = results.shots.filter((s) => s.size.startsWith(`${width}x`));
    if (!shots.length) continue;
    const cols = width < 500 ? shots.length : width < 1000 ? 3 : 2;
    const sheetPath = join(outDir, `.sheet-${width}.html`);
    await writeFile(sheetPath, sheet(shots, width, cols, label));
    const ctx = await browser.newContext({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(resolve(sheetPath)).href, { waitUntil: 'load' });
    await page.screenshot({ path: join(outDir, `sheet-${width}.jpg`), fullPage: true, type: 'jpeg', quality: 82 });
    await ctx.close();
  }
}

await browser.close();
local?.server.close();
console.log(`\nSaved to ${relative(process.cwd(), outDir) || outDir}/ (summary.md, results.json${doShots ? ', index.html, sheet-*.jpg and the captures' : ''})`);

/* ── Output files ───────────────────────────────────────── */
function summary(r) {
  const kb = (n) => (n == null ? '–' : `${Math.round(n / 1024)}`);
  const lines = [
    `# Design numbers: ${r.label}`,
    '',
    `${r.createdAt} · ${r.base} · reduced motion: ${r.options.reducedMotion} · consent prompt: ${r.options.noConsent ? 'closed' : 'as a first visit'}`,
    '',
  ];
  if (r.metrics.length) {
    lines.push(
      '## Load, weight and motion',
      '',
      `LCP and CLS: lab, read 3 s after load with no input. KB: decoded, at load (after scrolling the whole page in brackets). Animations: still running ${r.options.idleMs / 1000} s after load on the document timeline (infinite ones in brackets).`,
      '',
      '| Page | Size | LCP ms | LCP element | CLS | DOM elements | Total KB | HTML | CSS | JS | Fonts | Images | Animations |',
      '| --- | --- | --: | --- | --: | --: | --: | --: | --: | --: | --: | --: | --: |',
    );
    for (const m of r.metrics) {
      const a = m.bytesAtLoad;
      const s = m.bytesAfterScroll;
      lines.push(
        `| ${m.path} | ${m.size} | ${m.lcpMs ?? '–'} | ${(m.lcpElement ?? '–').replace(/\|/g, '/')} | ${m.cls} | ${m.domElements} | ${kb(a.total)} (${kb(s.total)}) | ${kb(a.html)} | ${kb(a.css)} | ${kb(a.js)} | ${kb(a.font)} | ${kb(a.image)} (${kb(s.image)}) | ${m.animationsAfterIdle.onDocumentTimeline} (${m.animationsAfterIdle.infinite}) |`,
      );
    }
    const home = r.metrics.filter((m) => m.path === '/');
    for (const m of home) {
      if (!m.animationsAfterIdle.top.length) continue;
      lines.push('', `Home at ${m.size}: what is still running after ${r.options.idleMs / 1000} s`, '');
      for (const t of m.animationsAfterIdle.top) lines.push(`- ${t.count} × ${t.what}`);
    }
    lines.push('');
  }
  if (r.type.length) {
    lines.push(
      '## Headings and length',
      '',
      'Computed sizes of the visible H1 and the largest visible H2. Screens: page height ÷ viewport height. Reveals: scroll reveals still hidden after scrolling the whole page.',
      '',
      '| Page | Size | H1 px | H1 tracking em | Largest H2 px | Largest H2 | H1 ÷ H2 | Screens | Hero screens | Work heading y | Overflow | Reveals |',
      '| --- | --- | --: | --: | --: | --- | --: | --: | --: | --: | --- | --: |',
    );
    for (const t of r.type) {
      lines.push(
        `| ${t.path} | ${t.size} | ${t.h1Px ?? '–'} | ${t.h1[0]?.trackingEm ?? '–'} | ${t.maxH2Px ?? '–'} | ${t.maxH2 ?? '–'} | ${t.h1OverMaxH2 ?? '–'} | ${t.screens} | ${t.heroScreens ?? '–'} | ${t.workTitleTop ?? '–'} | ${t.overflowX ? `yes (${t.scrollWidth}px)` : 'no'} | ${t.revealsPending} |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

function gallery(r) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const byPage = Object.groupBy(r.shots, (s) => s.path);
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design captures: ${esc(r.label)}</title>
<style>body{margin:0;padding:24px;background:#111;color:#eee;font:14px/1.4 system-ui,sans-serif}h2{margin:32px 0 12px}
.row{display:flex;gap:16px;overflow-x:auto;align-items:flex-start;padding-bottom:12px}figure{margin:0;flex:none}
figcaption{margin-bottom:6px;color:#aaa}img{display:block;max-height:420px;width:auto;border:1px solid #333}a{color:#d4f84a}</style>
<h1>Design captures: ${esc(r.label)}</h1><p>${esc(r.createdAt)} · ${esc(r.base)} · <a href="summary.md">summary.md</a></p>
${Object.entries(byPage)
  .map(
    ([path, shots]) => `<h2>${esc(path)}</h2><div class="row">${shots
      .map((s) => `<figure><figcaption>${s.size} · <a href="${s.full}">full page</a></figcaption><a href="${s.first}"><img src="${s.first}" alt="${esc(path)} at ${s.size}, first screen" loading="lazy"></a></figure>`)
      .join('')}</div>`,
  )
  .join('\n')}`;
}

function sheet(shots, width, cols, name) {
  return `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#1a1a1a;color:#ddd;font:600 18px/1.3 system-ui,sans-serif;width:max-content}
.grid{display:grid;grid-template-columns:repeat(${cols},${width}px);gap:24px}figure{margin:0}
figcaption{margin:0 0 8px}img{display:block;width:${width}px;outline:1px solid #444}h1{font-size:22px;margin:0 0 20px}
</style><h1>First screens at ${width}px · ${name}</h1><div class="grid">${shots
    .map((s) => `<figure><figcaption>${s.path} · ${s.size}</figcaption><img src="${s.first}"></figure>`)
    .join('')}</div>`;
}
