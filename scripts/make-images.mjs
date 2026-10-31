// Generates favicon PNGs and the default Open Graph image (1200×630) from code.
// Run: node scripts/make-images.mjs   (re-run after changing the brand or headline)
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
await mkdir(`${root}public/og`, { recursive: true });

const svg = await readFile(`${root}public/favicon.svg`);
await sharp(svg, { density: 384 }).resize(32, 32).png().toFile(`${root}public/favicon-32.png`);
await sharp(svg, { density: 768 }).resize(180, 180).flatten({ background: '#f4f1ea' }).png().toFile(`${root}public/apple-touch-icon.png`);

const font = (f) => `file://${root}public/fonts/${f}`;
const html = `<!doctype html><html><head><style>
@font-face{font-family:B;src:url(${font('bricolage-grotesque-latin-wght.woff2')}) format('woff2');font-weight:200 800}
@font-face{font-family:A;src:url(${font('atkinson-hyperlegible-next-latin-wght.woff2')}) format('woff2');font-weight:200 800}
@font-face{font-family:M;src:url(${font('atkinson-hyperlegible-mono-latin-wght.woff2')}) format('woff2');font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f4f1ea;color:#15171a;font-family:A;position:relative;overflow:hidden}
.wrap{position:absolute;inset:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
.label{font-family:M;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:22px;color:#4b5058}
h1{font-family:B;font-weight:780;font-size:82px;line-height:1.02;letter-spacing:-.035em;max-width:820px}
h1 span{background:linear-gradient(#d9481c,#d9481c) no-repeat 0 92%/100% 9px}
.foot{display:flex;justify-content:space-between;align-items:flex-end}
.wm{font-family:B;font-weight:780;font-size:40px;letter-spacing:-.03em}.wm b{color:#d9481c}
.sub{font-size:24px;color:#4b5058;max-width:560px;text-align:right}
.stamp{position:absolute;right:88px;top:70px;width:170px;height:170px;border:9px double #d9481c;border-radius:26px;display:grid;place-items:center;transform:rotate(-6deg);font-family:B;font-weight:800;font-size:76px;letter-spacing:-.04em;color:#d9481c}
</style></head><body><div class="stamp">MP</div><div class="wrap">
<p class="label">Toronto · small-business digital foundations</p>
<h1>Look <span>professional</span>. Get <span>found</span>. Follow&nbsp;<span>up</span>.</h1>
<div class="foot"><p class="wm">Mann Patel<b>.</b></p><p class="sub">Websites, Google visibility, business email and enquiry follow-up</p></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${root}public/og/default.png` });
await browser.close();
console.log('wrote favicon-32.png, apple-touch-icon.png, og/default.png');
