// Production build for Cloudflare Workers (mannpatel.me).
// Usage: npm run build:cloudflare        (then: npx wrangler deploy)
//
// Sets the production build settings so Cloudflare needs no build variables, then runs
// the normal Astro build and the pre-launch check. Any value already set in the
// environment wins, e.g. SITE_INDEXING=false to launch without search engines.
import { spawnSync } from 'node:child_process';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const defaults = {
  DEPLOY_TARGET: 'cloudflare',
  SITE_MODE: 'production',
  PUBLIC_SITE_URL: 'https://mannpatel.me',
  SITE_INDEXING: 'true',
  // GA4 property "mannpatel.me" (created 15 Nov 2026). The ID is public (it ships in every page); GA loads only
  // after the visitor clicks Allow on the consent prompt (src/components/Analytics.astro).
  PUBLIC_GA4_ID: 'G-WM5G62C3HX',
  // Wrangler (used by the Cloudflare adapter while prerendering) would otherwise read a local .env
  // file as dev vars and override the values above: a build from a computer with the preview .env
  // came out "noindex" with no canonical URLs. Production builds never read .env.
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false',
};
const env = { ...process.env };
for (const [key, value] of Object.entries(defaults)) env[key] ??= value;

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

console.log(`Building for Cloudflare: ${env.PUBLIC_SITE_URL} (SITE_MODE=${env.SITE_MODE}, SITE_INDEXING=${env.SITE_INDEXING})`);
run('npx', ['astro', 'build']);

// IndexNow (Nov 2026 audit fixes): note the dates in the sitemap that is live now, before this build is deployed, so
// `node scripts/indexnow.mjs ping` after `wrangler deploy` sends only the pages that changed. Never fails the build.
if (env.SITE_INDEXING === 'true') run('node', ['scripts/indexnow.mjs', 'snapshot']);

// Permanent redirects for addresses typed without the final slash (/services -> /services/).
// Cloudflare's static-asset handling would answer those with a temporary 307; a `_redirects` file
// in the asset folder answers first, with a 301 (growth report, 10 Nov 2026). One line per built
// page, so unknown addresses still get the real 404 page, and /api/ is never touched.
const client = 'dist/client';
const pages = [];
const walk = async (dir) => {
  for (const entry of await readdir(join(client, dir), { withFileTypes: true })) {
    if (entry.isDirectory()) await walk(join(dir, entry.name));
    else if (entry.name === 'index.html' && dir) pages.push(`/${dir.split('\\').join('/')}`);
  }
};
await walk('');
pages.sort();
await writeFile(join(client, '_redirects'), pages.map((p) => `${p} ${p}/ 301`).join('\n') + '\n');
console.log(`Wrote ${client}/_redirects (${pages.length} permanent slash redirects)`);

run('node', ['scripts/prelaunch-check.mjs']);
