// Lab performance/accessibility/SEO run with Lighthouse (mobile preset, simulated throttling).
// Usage: npm i --no-save lighthouse && node scripts/lighthouse.mjs [baseUrl] [paths...]
// CHROME_PATH defaults to the Playwright-installed Chromium.
import { mkdir, writeFile } from 'node:fs/promises';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const base = process.argv[2] || 'http://127.0.0.1:4321';
const paths = process.argv.slice(3).length ? process.argv.slice(3) : ['/'];
const chromePath = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';

await mkdir('qa-output/lighthouse', { recursive: true });
const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
const rows = [];
for (const path of paths) {
  const result = await lighthouse(base + path, {
    port: chrome.port,
    output: 'html',
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  const { lhr, report } = result;
  const name = path === '/' ? 'home' : path.replace(/\//g, '_').replace(/^_|_$/g, '');
  await writeFile(`qa-output/lighthouse/${name}.html`, report);
  const a = lhr.audits;
  rows.push({
    path,
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    LCP: a['largest-contentful-paint'].displayValue,
    CLS: a['cumulative-layout-shift'].displayValue,
    TBT: a['total-blocking-time'].displayValue,
    FCP: a['first-contentful-paint'].displayValue,
    lighthouse: lhr.lighthouseVersion,
    formFactor: lhr.configSettings.formFactor,
    throttling: lhr.configSettings.throttlingMethod,
    fetchTime: lhr.fetchTime,
  });
}
chrome.kill();
await writeFile('qa-output/lighthouse/summary.json', JSON.stringify(rows, null, 2));
console.table(rows.map(({ lighthouse, fetchTime, ...r }) => r));
console.log('Lighthouse', rows[0]?.lighthouse, '·', rows[0]?.formFactor, '·', rows[0]?.throttling, '·', rows[0]?.fetchTime);
