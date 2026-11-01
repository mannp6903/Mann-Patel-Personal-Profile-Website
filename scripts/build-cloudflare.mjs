// Production build for Cloudflare Workers (mannpatel.me).
// Usage: npm run build:cloudflare        (then: npx wrangler deploy)
//
// Sets the production build settings so Cloudflare needs no build variables, then runs
// the normal Astro build and the pre-launch check. Any value already set in the
// environment wins, e.g. SITE_INDEXING=false to launch without search engines.
import { spawnSync } from 'node:child_process';

const defaults = {
  DEPLOY_TARGET: 'cloudflare',
  SITE_MODE: 'production',
  PUBLIC_SITE_URL: 'https://mannpatel.me',
  SITE_INDEXING: 'true',
};
const env = { ...process.env };
for (const [key, value] of Object.entries(defaults)) env[key] ??= value;

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

console.log(`Building for Cloudflare: ${env.PUBLIC_SITE_URL} (SITE_MODE=${env.SITE_MODE}, SITE_INDEXING=${env.SITE_INDEXING})`);
run('npx', ['astro', 'build']);
run('node', ['scripts/prelaunch-check.mjs']);
