// Project sharing cards (1200×630), one per case study, from the project's real desktop capture
// and its true status labels (src/content/work/*.md). Output: public/og/work-<id>.png
// Run: npm run images   (after a capture or a status changes)
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const font = (f) => `file://${root}public/fonts/${f}`;

// Minimal front-matter reader for the few plain fields used here.
const field = (src, key) => {
  const m = src.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
};
// Business addresses that can't be reached right now (`siteLive: false` in src/data/site.ts).
const siteTs = await readFile(`${root}src/data/site.ts`, 'utf8');
const paused = [...siteTs.matchAll(/url: '([^']+)',[^}]*?siteLive: (true|false),[^}]*?pausedStatus: '([^']+)'/g)]
  .filter((m) => m[2] === 'false')
  .map((m) => ({ url: m[1], status: m[3] }));
// The desktop capture each case study uses (src/data/captures.ts).
const captureFor = async (scene) => {
  const ts = await readFile(`${root}src/data/captures.ts`, 'utf8');
  const prefix = scene === 'nest-and-rest' ? 'nr' : 'samp';
  const m = ts.match(new RegExp(`import ${prefix}Desktop from '\\.\\./assets/(work/[^']+)'`));
  if (!m) throw new Error(`No desktop capture for ${scene}`);
  return `${root}src/${'assets/' + m[1]}`;
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const file of (await readdir(`${root}src/content/work`)).filter((f) => f.endsWith('.md'))) {
  const src = await readFile(`${root}src/content/work/${file}`, 'utf8');
  const id = file.replace(/\.md$/, '');
  const title = field(src, 'title');
  // A business address marked `siteLive: false` in src/data/site.ts: the card says so too.
  const pausedSite = paused.find((b) => src.includes(`url: ${b.url}`));
  const labels = [field(src, 'relationship'), pausedSite ? pausedSite.status : field(src, 'websiteStatus'), field(src, 'businessStatus')].filter(Boolean);
  const live = field(src, 'status') === 'launched' && !pausedSite;
  const shot = (await sharp(await captureFor(field(src, 'scene'))).resize(1040).webp({ quality: 82 }).toBuffer()).toString('base64');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Sans;src:url(${font('geist-sans-wght.sub.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Mono;src:url(${font('geist-mono-wght.sub.woff2')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0b0b0c;color:#f2f1ec;font-family:Sans;position:relative;overflow:hidden}
.copy{position:absolute;left:64px;top:56px;right:64px;display:grid;gap:18px}
.k{font-family:Mono;font-size:17px;letter-spacing:.08em;text-transform:uppercase;color:#8d8c86;display:flex;align-items:center;gap:12px}
.k i{width:10px;height:10px;border-radius:50%;background:#d4f84a}
h1{font-weight:600;font-size:76px;line-height:.95;letter-spacing:-.045em}
.tags{display:flex;gap:10px;flex-wrap:wrap}
.tags span{font-family:Mono;font-size:17px;padding:7px 14px;border:1px solid #2a2a2f;border-radius:999px;color:#b3b2ab;display:flex;align-items:center;gap:9px}
.tags b{width:9px;height:9px;border-radius:50%;background:${live ? '#d4f84a' : '#f5c451'}}
.shot{position:absolute;left:64px;right:64px;top:300px;height:380px;border-radius:18px 18px 0 0;overflow:hidden;border:1px solid #2a2a2f;border-bottom:0;background:#fff}
.shot img{width:100%;display:block}
.url{position:absolute;right:64px;top:62px;font-family:Mono;font-size:17px;color:#8d8c86}
</style></head><body>
<div class="copy"><p class="k"><i></i>Case study · Mann Patel</p><h1>${title.replace(/&/g, '&amp;')}</h1>
<div class="tags">${labels.map((l, i) => `<span>${i === 1 ? '<b></b>' : ''}${l}</span>`).join('')}</div></div>
<p class="url">mannpatel.me/work</p>
<div class="shot"><img src="data:image/webp;base64,${shot}" alt=""></div>
</body></html>`;
  const tmp = `${root}.og-${id}.html`;
  await writeFile(tmp, html);
  await page.goto(`file://${tmp}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${root}public/og/work-${id}.png` });
  await rm(tmp);
  console.log(`wrote og/work-${id}.png`);
}
await browser.close();
