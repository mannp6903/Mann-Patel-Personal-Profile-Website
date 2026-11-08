// Generates favicon PNGs and the default Open Graph image (1200×630) from code, in the
// "Signal" design (DESIGN.md): the halftone portrait beside "Found. Answered. Booked."
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

const cutout = (await sharp(`${root}src/assets/mann-patel-cutout.png`).resize(520).png().toBuffer()).toString('base64');
const font = (f) => `file://${root}public/fonts/${f}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mona;src:url(${font('mona-sans-latin-wdth-wght.woff2')}) format('woff2');font-weight:200 900;font-stretch:75% 125%}
@font-face{font-family:Serif;font-style:italic;src:url(${font('instrument-serif-latin-400-italic.woff2')}) format('woff2')}
@font-face{font-family:Mono;src:url(${font('geist-mono-latin-wght.woff2')}) format('woff2');font-weight:100 900}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0b0b0c;color:#f2f1ec;position:relative;overflow:hidden;font-family:Mona}
body::before{content:'';position:absolute;right:-120px;top:20px;width:720px;height:720px;background:radial-gradient(closest-side,rgba(212,248,74,.11),transparent 70%)}
.copy{position:absolute;left:72px;top:64px;bottom:60px;width:700px;display:flex;flex-direction:column;justify-content:space-between}
.label{font-family:Mono;font-weight:500;letter-spacing:.08em;text-transform:uppercase;font-size:17px;color:#8d8c86;display:flex;align-items:center;gap:12px}
.label i{width:10px;height:10px;border-radius:50%;background:#d4f84a;display:block}
h1{font-weight:800;font-stretch:118%;font-size:112px;line-height:.86;letter-spacing:-.045em}
h1 em{font-family:Serif;font-weight:400;font-stretch:100%;font-size:1.12em;color:#d4f84a;letter-spacing:-.02em}
.sub{font-size:27px;font-weight:560;line-height:1.3;letter-spacing:-.01em;max-width:560px}
.url{font-family:Mono;font-size:17px;color:#8d8c86;margin-top:14px}
canvas{position:absolute;right:40px;bottom:0;width:470px;height:496px}
</style></head><body>
<div class="copy">
<p class="label"><i></i>Mann Patel · Toronto, Canada</p>
<h1>Found.<br>Answered.<br><em>Booked.</em></h1>
<div><p class="sub">I help small businesses in Toronto and the GTA get all three.</p><p class="url">mannpatel.me</p></div>
</div>
<canvas id="c" width="940" height="992"></canvas>
<img id="src" src="data:image/png;base64,${cutout}" style="display:none">
<script>
// Static version of src/scripts/halftone.ts
const img=document.getElementById('src');
img.decode().then(()=>{
  const c=document.getElementById('c'),x=c.getContext('2d');x.scale(2,2);
  const w=470,h=496,p=w/108,cols=Math.floor(w/p),rows=Math.floor(h/p);
  const o=document.createElement('canvas');o.width=cols;o.height=rows;const ox=o.getContext('2d');
  const ir=img.naturalWidth/img.naturalHeight,cr=cols/rows;let dw=cols,dh=rows;if(ir>cr)dh=cols/ir;else dw=rows*ir;
  ox.drawImage(img,(cols-dw)/2,rows-dh,dw,dh);const d=ox.getImageData(0,0,cols,rows).data;
  const cells=[];let lo=1,hi=0;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=(j*cols+i)*4;if(d[k+3]<90)continue;const L=(.2126*d[k]+.7152*d[k+1]+.0722*d[k+2])/255;cells.push([i,j,L]);lo=Math.min(lo,L);hi=Math.max(hi,L)}
  x.fillStyle='#f2f1ec';const R=p*.6;
  for(const [i,j,L0] of cells){const L=Math.pow((L0-lo)/(hi-lo),1.2);const r=R*(.1+.9*L);x.beginPath();x.arc((i+.5)*p,(j+.5)*p+(h-rows*p),r,0,7);x.fill()}
  document.body.dataset.ready='1';
});
</script>
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
