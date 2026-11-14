#!/usr/bin/env node
/**
 * Redirect and canonical check (Quickstart, 13 Nov 2026). Sends nothing, changes nothing.
 *
 *   node scripts/check-redirects.mjs            (checks https://mannpatel.me)
 *   node scripts/check-redirects.mjs https://mannpatel.me
 *
 * For each alternate address (http://, www., http://www., no final slash) it follows redirects one
 * hop at a time and checks that:
 *   - the first answer is a permanent redirect (301 or 308),
 *   - it lands on the preferred https address in ONE hop,
 *   - the path and the campaign parameters (?utm_...) are kept,
 *   - the final page says 200 and declares itself as the canonical address.
 * Host redirects (www and http) are set in the Cloudflare dashboard, not in this repository:
 * docs/21-growth-seo-launch.md, "Redirects".
 */
const base = (process.argv[2] ?? 'https://mannpatel.me').replace(/\/$/, '');
const host = new URL(base).host;
const paths = ['/', '/services/web-design/', '/pricing/', '/contact/'];
const query = '?utm_source=redirect-check&utm_medium=test';

const variants = (path) => [
  `http://${host}${path}`,
  `https://www.${host}${path}`,
  `http://www.${host}${path}`,
  ...(path !== '/' ? [`${base}${path.replace(/\/$/, '')}`] : []),
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`  FAIL ${msg}`);
};

for (const path of paths) {
  const want = `${base}${path}${query}`;
  console.log(`\n${path}`);
  for (const start of variants(path)) {
    const from = `${start}${query}`;
    let url = from;
    const hops = [];
    for (let i = 0; i < 5; i++) {
      let res;
      try {
        res = await fetch(url, { redirect: 'manual' });
      } catch (e) {
        hops.push({ url, status: `error: ${e.cause?.code ?? e.message}` });
        break;
      }
      hops.push({ url, status: res.status });
      const loc = res.headers.get('location');
      if (res.status >= 300 && res.status < 400 && loc) url = new URL(loc, url).href;
      else break;
    }
    const first = hops[0].status;
    const last = hops.at(-1);
    const line = hops.map((h) => `${h.status}`).join(' -> ');
    console.log(`  ${from}\n    ${line} -> ${last.url}`);
    if (typeof first !== 'number') fail('no answer');
    else if (![301, 308].includes(first)) fail(`first answer is ${first}, not a permanent redirect`);
    else if (hops.length > 2) fail(`${hops.length - 1} hops; should be one`);
    if (last.url !== want) fail(`lands on ${last.url}, expected ${want}`);
  }
  try {
    const res = await fetch(`${base}${path}`);
    const html = await res.text();
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
    if (res.status !== 200) fail(`${base}${path} answers ${res.status}`);
    if (canonical !== `${base}${path}`) fail(`canonical is ${canonical ?? 'missing'}`);
    else console.log(`  canonical ok: ${canonical}`);
  } catch (e) {
    fail(`could not load ${base}${path}: ${e.message}`);
  }
}

console.log(failures ? `\n${failures} problem(s) found.` : '\nAll redirects and canonicals look right.');
process.exit(failures ? 1 : 0);
