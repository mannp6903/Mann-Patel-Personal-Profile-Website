// IndexNow (Nov 2026 audit fixes): tell Bing, Yandex, Seznam, Naver and the other IndexNow engines which pages changed,
// right after a deploy, instead of waiting for them to recrawl. Node built-ins only.
//
// The key is public by design: https://mannpatel.me/<KEY>.txt holds it (public/<KEY>.txt), which proves the site
// owns the pings. "Changed" means: new in the sitemap, or a different <lastmod> from the sitemap that was live
// before this deploy (sitemap dates are each page's own, scripts/sitemap-lastmod.mjs).
//
//   node scripts/indexnow.mjs snapshot           Save the live sitemap's dates. scripts/build-cloudflare.mjs runs it
//                                                after building, while the old site is still live.
//   node scripts/indexnow.mjs ping [--dry-run]   After `wrangler deploy`: send the changed URLs (or list them).
//
// It never fails a deploy: problems are printed as warnings and it exits 0.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const KEY = '61a5f4cf359b3e776e7e4b9f1b7b370b';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = (process.env.PUBLIC_SITE_URL || 'https://mannpatel.me').replace(/\/$/, '');
const DIST = join(ROOT, 'dist/client');
/** Outside dist/client, so it is never uploaded with the site. */
const SNAPSHOT = join(ROOT, 'dist/indexnow-previous.json');
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const warn = (msg) => console.warn(`[indexnow] WARNING: ${msg}`);
const log = (msg) => console.log(`[indexnow] ${msg}`);

/** { url: lastmod } from sitemap XML: an index (its sub-sitemaps are read with `read`) or a URL set. */
export async function sitemapDates(indexXml, read) {
  const dates = {};
  const subs = [...indexXml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const xml of subs.length ? await Promise.all(subs.map(read)) : [indexXml]) {
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1];
      if (loc) dates[loc] = (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] ?? '';
    }
  }
  return dates;
}

/** URLs that are new, or whose date moved. */
export const changedUrls = (before, after) => Object.keys(after).filter((url) => before[url] !== after[url]);

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'mannpatel.me deploy (IndexNow)' }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

async function snapshot() {
  try {
    const dates = await sitemapDates(await get(`${SITE}/sitemap-index.xml`), get);
    writeFileSync(SNAPSHOT, JSON.stringify(dates, null, 2));
    log(`saved the live sitemap's dates (${Object.keys(dates).length} URLs) to dist/indexnow-previous.json`);
  } catch (e) {
    warn(`could not read the live sitemap (${e.message}); the next ping will send nothing.`);
  }
}

async function ping(dryRun) {
  if (process.env.SITE_INDEXING === 'false') return log('SITE_INDEXING=false: nothing sent.');
  const indexFile = join(DIST, 'sitemap-index.xml');
  if (!existsSync(indexFile)) return warn('no dist/client/sitemap-index.xml: build first (npm run build:cloudflare).');
  if (!existsSync(SNAPSHOT)) return warn('no snapshot of the previous sitemap (dist/indexnow-previous.json): nothing sent.');
  const local = (url) => readFileSync(join(DIST, new URL(url).pathname), 'utf8');
  const after = await sitemapDates(readFileSync(indexFile, 'utf8'), async (url) => local(url));
  const urls = changedUrls(JSON.parse(readFileSync(SNAPSHOT, 'utf8')), after).filter((u) => u.startsWith(`${SITE}/`));
  if (!urls.length) return log('no page changed since the last deploy: nothing sent.');
  log(`${urls.length} changed URL(s):\n  ${urls.join('\n  ')}`);
  if (dryRun) return log('--dry-run: nothing sent.');

  // The key file must be live first (a deploy can take a few seconds to reach every edge).
  let keyLive = false;
  for (let i = 0; i < 6 && !keyLive; i++) {
    try {
      keyLive = (await get(`${SITE}/${KEY}.txt`)).trim() === KEY;
    } catch {
      /* not yet */
    }
    if (!keyLive) await new Promise((r) => setTimeout(r, 5_000));
  }
  if (!keyLive) return warn(`${SITE}/${KEY}.txt is not serving the key: nothing sent.`);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }),
      signal: AbortSignal.timeout(20_000),
    });
    // 200 OK and 202 Accepted are both success (202: the key is checked later).
    if (res.status === 200 || res.status === 202) log(`sent: IndexNow answered ${res.status}.`);
    else warn(`IndexNow answered ${res.status} ${await res.text().catch(() => '')}`.trim());
  } catch (e) {
    warn(`could not reach IndexNow (${e.message}).`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [command, flag] = process.argv.slice(2);
  if (command === 'snapshot') await snapshot();
  else if (command === 'ping') await ping(flag === '--dry-run');
  else console.log('Usage: node scripts/indexnow.mjs snapshot | ping [--dry-run]');
}
