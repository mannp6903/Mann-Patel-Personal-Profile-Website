// A second preview build with a stand-in GA4 ID, so the consent prompt is on the page (the normal preview build,
// `npm run build`, has no ID and so no prompt). The design-gate tests check the prompt against it on port 4323
// (playwright.config.ts, tests/e2e/design-gates.spec.ts). Design upgrade Phase 2, 17 Nov 2026.
//
// Usage: node scripts/build-consent.mjs [--serve] [--force]
//   Builds into dist-consent/ when that is missing or older than dist/ (the preview build), or with --force.
//   --serve then starts it (PORT and HOST from the environment), as Playwright's web server does.
// The stand-in ID never reaches Google in the tests: analytics loads only after "Allow", which the tests don't click.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';

const OUT = 'dist-consent';
const entry = `${OUT}/server/entry.mjs`;
const mtime = (p) => (existsSync(p) ? statSync(p).mtimeMs : 0);
const stale = !existsSync(entry) || mtime(entry) < mtime('dist/server/entry.mjs');

if (stale || process.argv.includes('--force')) {
  const env = { ...process.env, PUBLIC_GA4_ID: 'G-CONSENTTEST', DEPLOY_TARGET: 'node', SITE_INDEXING: 'false' };
  const r = spawnSync('npx', ['astro', 'build', '--outDir', OUT], { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (process.argv.includes('--serve')) {
  const child = spawn(process.execPath, [entry], { stdio: 'inherit', env: process.env });
  child.on('exit', (code) => process.exit(code ?? 0));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
}
