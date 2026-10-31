// Generates favicon PNGs and the default Open Graph image (1200×630) from code.
// Run: node scripts/make-images.mjs   (after scripts/make-logo.py, or when the photo/headline changes)
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
await mkdir(`${root}public/og`, { recursive: true });

const favicon = await readFile(`${root}public/favicon.svg`);
await sharp(favicon, { density: 384 }).resize(32, 32).png().toFile(`${root}public/favicon-32.png`);
await sharp(favicon, { density: 768 }).resize(180, 180).png().toFile(`${root}public/apple-touch-icon.png`);

const logo = JSON.parse(await readFile(`${root}src/data/logo.json`, 'utf8')).wordmark.display;
const portrait = (await sharp(`${root}src/assets/mann-patel-portrait.jpg`).resize(520, 624, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82 }).toBuffer()).toString('base64');
const font = (f) => `file://${root}public/fonts/${f}`;

const html = `<!doctype html><html><head><style>
@font-face{font-family:B;src:url(${font('bricolage-grotesque-latin-wght.woff2')}) format('woff2');font-weight:200 800}
@font-face{font-family:M;src:url(${font('atkinson-hyperlegible-mono-latin-wght.woff2')}) format('woff2');font-weight:200 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f4f1ea;color:#15171a;position:relative;overflow:hidden}
.copy{position:absolute;left:72px;top:64px;bottom:60px;width:610px;display:flex;flex-direction:column;justify-content:space-between}
.label{font-family:M;font-weight:700;letter-spacing:.07em;text-transform:uppercase;font-size:17px;color:#4b5058;white-space:nowrap}
h1{font-family:B;font-weight:780;font-size:70px;line-height:1.04;letter-spacing:-.035em;white-space:nowrap}
h1 span{background:linear-gradient(#d9481c,#d9481c) no-repeat 0 92%/100% 8px}
.wm{height:54px}.wm svg{height:100%;width:auto}.wm .l{fill:#15171a}.wm .d{fill:#d9481c}
.sub{font-family:M;font-size:15.5px;color:#4b5058;margin-top:12px;white-space:nowrap}
.photo{position:absolute;right:70px;top:52px;width:390px;padding:12px 12px 48px;background:#fbfaf6;border-radius:16px;transform:rotate(2deg);box-shadow:0 2px 0 rgba(21,23,26,.08),0 24px 40px -24px rgba(21,23,26,.45)}
.photo img{width:100%;height:auto;display:block;border-radius:10px}
.photo p{position:absolute;left:18px;bottom:15px;font-family:M;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:16px;color:#4b5058}
</style></head><body>
<div class="copy">
<p class="label">Toronto · small-business digital foundations</p>
<h1>Look <span>professional</span>.<br>Get <span>found</span>.<br>Follow <span>up</span>.</h1>
<div><div class="wm"><svg viewBox="${logo.viewBox}"><path class="l" d="${logo.letters}"/><path class="d" d="${logo.dot}"/></svg></div>
<p class="sub">Websites · Google visibility · business email · follow-up</p></div>
</div>
<figure class="photo"><img src="data:image/jpeg;base64,${portrait}" alt=""><p>Mann Patel</p></figure>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// Load from a real file so file:// fonts are allowed (about:blank blocks them).
const tmp = `${root}.og-template.tmp.html`;
await writeFile(tmp, html);
await page.goto(`file://${tmp}`, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${root}public/og/default.png` });
await browser.close();
await rm(tmp);
console.log('wrote favicon-32.png, apple-touch-icon.png, og/default.png');
