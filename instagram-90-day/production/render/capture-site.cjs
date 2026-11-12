// Capture real, dated screenshots of mannpatel.me for proof posts.
const { chromium } = require('playwright');
const out = process.argv[2];
const date = new Date().toISOString().slice(0, 10);
const shots = [
  ['home', '/', null],
  ['check', '/', '#check'],
  ['contact-check', '/contact/?package=check-up#check', null],
  ['services', '/services/', null],
  ['enquiry', '/services/enquiry-follow-up/', null],
  ['visibility', '/services/local-visibility/', null],
  ['webdesign', '/services/web-design/', null],
  ['nest-case', '/work/nest-and-rest-cleaning/', null],
  ['samp-case', '/work/samp-hair-spa/', null],
  ['about', '/about/', null],
];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  for (const [name, url, anchor] of shots) {
    const p = await ctx.newPage();
    await p.goto('https://mannpatel.me' + url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    if (anchor) { await p.evaluate((a) => document.querySelector(a)?.scrollIntoView(), anchor); await p.waitForTimeout(500); }
    await p.screenshot({ path: `${out}/mannpatel-${name}-390-${date}.png`, fullPage: !anchor });
    await p.close();
    console.log('captured', name);
  }
  await b.close();
})();
