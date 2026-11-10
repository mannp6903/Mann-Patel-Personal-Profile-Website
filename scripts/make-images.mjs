// Generates favicon PNGs and the default Open Graph image (1200×630) from code, in the
// MΛNN PΛTEL brand (Nov 2026): the outlined wordmark, lime Λ's, over "Found. Answered. Booked."
// Run: npm run images   (when the portrait, favicon or headline changes)
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
await mkdir(`${root}public/og`, { recursive: true });

const favicon = await readFile(`${root}public/favicon.svg`);
await sharp(favicon, { density: 384 }).resize(32, 32).png().toFile(`${root}public/favicon-32.png`);
await sharp(favicon, { density: 768 }).resize(180, 180).png().toFile(`${root}public/apple-touch-icon.png`);

const wordmark = (await readFile(`${root}public/brand/mann-patel-wordmark-lime.svg`, 'utf8'))
  .replace(/<title>.*?<\/title>/, '')
  .replace('<svg ', '<svg class="wm" aria-hidden="true" ');
const font = (f) => `file://${root}public/fonts/${f}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mono;src:url(${font('geist-mono-latin-wght.woff2')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#000;color:#ededed;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:46px}
.wm{width:760px;height:auto;display:block}
.tag{font-family:Mono;font-weight:400;font-size:15px;letter-spacing:.34em;text-transform:uppercase;color:#8f8f8f;padding-left:.34em}
.url{position:absolute;left:0;right:0;bottom:56px;text-align:center;font-family:Mono;font-size:15px;letter-spacing:.12em;color:#8f8f8f}
</style></head><body>
${wordmark}
<p class="tag">Found. Answered. Booked.</p>
<p class="url">mannpatel.me · Toronto</p>
<script>document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });</script>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// Load from a real file so file:// fonts are allowed (about:blank blocks them).
const tmp = `${root}.og-template.tmp.html`;
await writeFile(tmp, html);
await page.goto(`file://${tmp}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForSelector('body[data-ready="1"]');
await page.screenshot({ path: `${root}public/og/default.png` });
await browser.close();
await rm(tmp);
console.log('wrote favicon-32.png, apple-touch-icon.png, og/default.png');
