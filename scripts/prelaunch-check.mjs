// Pre-launch gate. Run after a production build:
//   npm run build:cloudflare      (builds for mannpatel.me and runs this check)
// Errors block the deploy; warnings are printed for a human decision.
// On Cloudflare, the form's runtime settings live in wrangler.jsonc "vars" and in Worker
// secrets set in the dashboard. A build can't read secrets, so those checks are warnings.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const env = process.env;
const cloudflare = env.DEPLOY_TARGET === 'cloudflare';
let runtime = env;
if (cloudflare) {
  try {
    const jsonc = await readFile('wrangler.jsonc', 'utf8');
    const vars = JSON.parse(jsonc.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')).vars ?? {};
    runtime = { ...vars, ...env };
  } catch {
    /* no wrangler.jsonc: fall back to the build environment */
  }
}
const secretLevel = cloudflare ? 'warning' : 'error';
const where = cloudflare ? ' (set it in Cloudflare → Worker → Settings → Variables and Secrets; a build cannot see it)' : '';
const errors = [];
const warnings = [];
const ok = [];
const check = (cond, okMsg, failMsg, level = 'error') => {
  if (cond) ok.push(okMsg);
  else (level === 'error' ? errors : warnings).push(failMsg);
};

// ── Environment ─────────────────────────────────────────────
const site = (env.PUBLIC_SITE_URL || '').replace(/\/$/, '');
check(env.SITE_MODE === 'production', 'SITE_MODE=production', 'SITE_MODE must be "production" for a launch build');
check(/^https:\/\/[^/]+$/.test(site) && !/example\.(com|ca|org)|localhost/.test(site), `PUBLIC_SITE_URL=${site}`, 'PUBLIC_SITE_URL must be the real https origin (no trailing slash)');
check(env.SITE_INDEXING === 'true', 'SITE_INDEXING=true (search engines allowed)', 'SITE_INDEXING is not "true": the site will be live but hidden from search engines', 'warning');

const delivery = runtime.ENQUIRY_DELIVERY;
check(['cloudflare', 'resend', 'webhook'].includes(delivery), `ENQUIRY_DELIVERY=${delivery}`, 'ENQUIRY_DELIVERY must be "cloudflare", "resend" or "webhook" in production (the form would otherwise say it is not connected)');
if (delivery === 'cloudflare') {
  let binding = false;
  try {
    binding = /"send_email"\s*:\s*\[\s*\{\s*"name"\s*:\s*"ENQUIRY_EMAIL"/.test(await readFile('wrangler.jsonc', 'utf8'));
  } catch {
    /* checked below */
  }
  check(binding, 'send_email binding ENQUIRY_EMAIL in wrangler.jsonc', 'wrangler.jsonc needs "send_email": [{ "name": "ENQUIRY_EMAIL" }]');
  check(/@mannpatel\.me>?$/.test(runtime.ENQUIRY_FROM_EMAIL || ''), 'ENQUIRY_FROM_EMAIL is on mannpatel.me', 'ENQUIRY_FROM_EMAIL must be an address on mannpatel.me (Cloudflare Email Routing domain)');
  check(/@/.test(runtime.ENQUIRY_TO_EMAIL || ''), 'ENQUIRY_TO_EMAIL set', `ENQUIRY_TO_EMAIL is missing: add your verified Email Routing destination address${where}`, secretLevel);
}
if (delivery === 'resend') {
  check(Boolean(runtime.RESEND_API_KEY), 'RESEND_API_KEY set', `RESEND_API_KEY is missing${where}`, secretLevel);
  check(/@/.test(runtime.ENQUIRY_TO_EMAIL || ''), 'ENQUIRY_TO_EMAIL set', `ENQUIRY_TO_EMAIL is missing${where}`, secretLevel);
  check(/@/.test(runtime.ENQUIRY_FROM_EMAIL || ''), 'ENQUIRY_FROM_EMAIL set', `ENQUIRY_FROM_EMAIL is missing (must be on a domain verified in Resend)${where}`, secretLevel);
}
if (delivery === 'webhook' || runtime.ENQUIRY_WEBHOOK_URL) {
  check(/^https:\/\//.test(runtime.ENQUIRY_WEBHOOK_URL || ''), 'ENQUIRY_WEBHOOK_URL is https', `ENQUIRY_WEBHOOK_URL must be an https URL${where}`, secretLevel);
  check((runtime.ENQUIRY_WEBHOOK_SECRET || '').length >= 24, 'ENQUIRY_WEBHOOK_SECRET set', 'ENQUIRY_WEBHOOK_SECRET should be a long random string', 'warning');
}
check(
  (runtime.FORM_TOKEN_SECRET || '').length >= 32,
  'FORM_TOKEN_SECRET set',
  'FORM_TOKEN_SECRET not set: each build uses its own random secret instead (fine; set one to keep tokens valid across deploys)',
  'warning',
);
if (env.PUBLIC_TURNSTILE_SITE_KEY || env.TURNSTILE_SECRET_KEY) {
  check(Boolean(env.PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY), 'Turnstile keys paired', 'Set both PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY, or neither');
}

// ── Built output ────────────────────────────────────────────
const outDir = ['dist/client', 'dist'].find(Boolean);
async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
let root = 'dist/client';
try {
  await stat(root);
} catch {
  root = 'dist';
}
const files = await htmlFiles(root).catch(() => []);
check(files.length > 0, `${files.length} HTML pages built`, `No built pages found in ${outDir}. Run the build first.`);

const exists = async (p) => stat(p).then(() => true, () => false);
// Pages that may stay "noindex" on purpose: /pricing/ until a price is approved (src/data/packages.ts).
// Allowed only while the page is left out of the sitemap and no other page links to it.
const sitemapXml = await readFile(join(root, 'sitemap-0.xml'), 'utf8').catch(() => '');
const unpublished = new Set(['/pricing/'].filter((path) => !sitemapXml.includes(`${site}${path}<`)));
const linkedUnpublished = new Set();
const brokenLinks = new Set();
const brokenAssets = new Set();
for (const f of files) {
  const html = await readFile(f, 'utf8');
  const rel = '/' + relative(root, f).replace(/index\.html$/, '').replace(/\.html$/, '');
  if (/data-confirm|data-preview-note|Private preview\./.test(html)) errors.push(`${rel}: contains a preview marker or "To confirm" note`);
  // "(416) 555-0148" is the deliberate fictional caller in the home page's labelled example phone screen.
  if (/@example\.|\(000\)|555-01|lorem ipsum/i.test(html.replace(/example@|yourbusiness\.ca|\(416\) 555-0148/g, ''))) {
    warnings.push(`${rel}: contains placeholder-looking contact text; check it`);
  }
  if (!rel.startsWith('/404') && !rel.startsWith('/contact/received')) {
    if (!html.includes(`<link rel="canonical" href="${site}${rel}"`)) errors.push(`${rel}: canonical URL missing or not ${site}${rel}`);
    if (env.SITE_INDEXING === 'true' && !html.includes('content="index, follow"') && !unpublished.has(rel))
      errors.push(`${rel}: robots meta is not "index, follow"`);
  }
  for (const path of unpublished) if (rel !== path && html.includes(`href="${path}"`)) linkedUnpublished.add(`${rel} → ${path}`);
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = m[1];
    if (href.startsWith('/api/') || href.startsWith('/_astro/')) continue;
    const target = href.endsWith('/') ? join(root, href, 'index.html') : join(root, href);
    if (!(await exists(target))) brokenLinks.add(`${rel} → ${href}`);
  }
  // Assets: images, scripts, preloads and CSS url()s (fonts) must exist in the build.
  const assetRefs = [
    ...html.matchAll(/\s(?:src|href)="(\/[^"#?]*\.(?:woff2|png|jpe?g|webp|avif|svg|js|css|ico|xml|txt))"/g),
    ...html.matchAll(/url\(['"]?(\/[^'")?#]+)['"]?\)/g),
    ...[...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((part) => [null, part.trim().split(/\s+/)[0]])),
  ];
  for (const m of assetRefs) {
    const src = m[1];
    if (!src || !src.startsWith('/')) continue;
    if (!(await exists(join(root, src)))) brokenAssets.add(`${rel} → ${src}`);
  }
}
check(
  linkedUnpublished.size === 0,
  unpublished.size ? `Unpublished pages (${[...unpublished].join(', ')}) are noindex and not linked` : 'No unpublished pages',
  `Unpublished page is linked: ${[...linkedUnpublished].join(', ')}`,
);
check(brokenLinks.size === 0, 'All internal links resolve', `Broken internal links:\n    ${[...brokenLinks].join('\n    ')}`);
check(brokenAssets.size === 0, 'All images, fonts and scripts referenced by the pages exist', `Missing assets:\n    ${[...brokenAssets].join('\n    ')}`);

const robots = await readFile(join(root, 'robots.txt'), 'utf8').catch(() => '');
if (env.SITE_INDEXING === 'true') {
  check(robots.includes('Allow: /') && robots.includes(`Sitemap: ${site}/sitemap.xml`), 'robots.txt allows crawling and lists the sitemap', 'robots.txt is not in production form');
  check(await exists(join(root, 'sitemap-index.xml')), 'sitemap-index.xml generated', 'sitemap-index.xml missing');
  check(await exists(join(root, 'sitemap.xml')), 'sitemap.xml generated', 'sitemap.xml missing');
}

// ── Search basics on every page (growth report, 10 Nov 2026) ──
// One H1, its own title and description, and on sitemap pages a canonical link to itself.
const seen = { title: new Map(), description: new Map() };
const searchProblems = [];
for (const f of files) {
  const html = await readFile(f, 'utf8');
  const rel = '/' + relative(root, f).split('\\').join('/').replace(/index\.html$/, '').replace(/\.html$/, '');
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) searchProblems.push(`${rel}: ${h1} H1 headings (exactly one is needed)`);
  for (const [key, re] of [
    ['title', /<title>([^<]*)<\/title>/],
    ['description', /<meta name="description" content="([^"]*)"/],
  ]) {
    const value = html.match(re)?.[1]?.trim();
    if (!value) searchProblems.push(`${rel}: no ${key}`);
    else if (seen[key].has(value)) searchProblems.push(`${rel}: same ${key} as ${seen[key].get(value)}`);
    else seen[key].set(value, rel);
  }
  if (site && sitemapXml.includes(`${site}${rel}<`) && !html.includes(`<link rel="canonical" href="${site}${rel}"`))
    searchProblems.push(`${rel}: canonical link is not ${site}${rel}`);
}
check(searchProblems.length === 0, 'Every page has one H1, its own title and description; sitemap pages are self-canonical', `Search basics:\n    ${searchProblems.join('\n    ')}`);

// Addresses without the final slash redirect permanently (written by scripts/build-cloudflare.mjs).
if (cloudflare) {
  const redirects = await readFile(join(root, '_redirects'), 'utf8').catch(() => '');
  const lines = new Set(redirects.split('\n').map((l) => l.trim()).filter(Boolean));
  const paths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(site, '')).filter((path) => path !== '/');
  const missing = paths.filter((path) => !lines.has(`${path.replace(/\/$/, '')} ${path} 301`));
  check(paths.length > 0 && missing.length === 0, `_redirects: ${paths.length} sitemap pages redirect permanently to their trailing-slash address`, `_redirects is missing a 301 for: ${missing.join(', ') || 'every page (file not written?)'}`);
  check(![...lines].some((l) => l.startsWith('/api')), '_redirects leaves /api/ alone', '_redirects must not redirect /api/ (the form posts there)');
  // Security headers (SEO audit Phase 4): written into _headers by the build (src/lib/security-headers.ts).
  const headers = await readFile(join(root, '_headers'), 'utf8').catch(() => '');
  const sec = ['Strict-Transport-Security', 'Cross-Origin-Opener-Policy', 'X-Content-Type-Options', 'Content-Security-Policy'].filter(
    (h) => !new RegExp(`^\\s+${h}(-Report-Only)?:`, 'm').test(headers),
  );
  check(sec.length === 0 && !headers.includes('# Security headers: written here'), '_headers carries the security headers (HSTS, COOP, CSP)', `_headers is missing: ${sec.join(', ') || 'the build step (marker still there)'}`);
}

// ── Report ──────────────────────────────────────────────────
for (const m of ok) console.log(`  ✓ ${m}`);
for (const m of warnings) console.log(`  ! ${m}`);
for (const m of errors) console.log(`  ✗ ${m}`);
console.log(`\nPre-launch check: ${errors.length} error(s), ${warnings.length} warning(s).`);
if (errors.length) {
  console.log('Not ready for production. See docs/05-launch-and-integrations.md and docs/OWNER-INPUTS.md.');
  process.exit(1);
}
