// Generates favicon PNGs and the default Open Graph image (1200×630) from code, in the
// MΛNN PΛTEL brand (Nov 2026): the outlined wordmark, lime Λ's, over "Found. Answered. Booked."
// Run: npm run images   (when the portrait, favicon or headline changes)
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
await mkdir(`${root}public/og`, { recursive: true });

// favicon.svg is the stacked MΛNN / PΛTEL icon (built by scripts/make-favicon.py).
// Google Search wants a square icon whose size is a multiple of 48 px and crops it to a circle;
// /favicon.ico is also the first place crawlers and older browsers look.
const favicon = await readFile(`${root}public/favicon.svg`);
const iconPng = (size) => sharp(favicon, { density: 1024 }).resize(size, size).png().toBuffer();
await writeFile(`${root}public/favicon-192.png`, await iconPng(192));
await writeFile(`${root}public/apple-touch-icon.png`, await iconPng(180));
// A multi-size .ico (16, 32, 48 px) holding PNG images, which every current browser reads.
const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(icoSizes.map(iconPng));
const icoHeader = Buffer.alloc(6 + 16 * icoSizes.length);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // type: icon
icoHeader.writeUInt16LE(icoSizes.length, 4);
let icoOffset = icoHeader.length;
icoSizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  icoHeader.writeUInt8(size, entry); // width
  icoHeader.writeUInt8(size, entry + 1); // height
  icoHeader.writeUInt16LE(1, entry + 4); // colour planes
  icoHeader.writeUInt16LE(32, entry + 6); // bits per pixel
  icoHeader.writeUInt32LE(icoImages[i].length, entry + 8);
  icoHeader.writeUInt32LE(icoOffset, entry + 12);
  icoOffset += icoImages[i].length;
});
await writeFile(`${root}public/favicon.ico`, Buffer.concat([icoHeader, ...icoImages]));

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
console.log('wrote favicon.ico, favicon-192.png, apple-touch-icon.png, og/default.png');
