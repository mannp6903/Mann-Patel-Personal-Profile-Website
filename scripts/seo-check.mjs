// SEO check on the built site (docs/seo/PLAN.md → VERIFY). Node built-ins only.
//
// Build first, production-like so the sitemap and absolute URLs exist:
//   PUBLIC_SITE_URL=https://mannpatel.me SITE_INDEXING=true SITE_MODE=production npx astro build
// Then:
//   npm run check:seo            (or: node scripts/seo-check.mjs [dist/client])
//
// Errors exit with code 1; warnings are printed for a human decision.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = process.argv[2] || 'dist/client';
const SITE = 'https://mannpatel.me';

// ── What the pages must say (SEO audit, 14 Nov 2026). Exact, after decoding entities and collapsing spaces.
const EXACT = {
  '/': {
    description:
      'Websites, local SEO and Google Business Profile setup for Toronto small businesses. Published prices: websites from $1,950 CAD. Free website check.',
    h1: 'Websites and local SEO for Toronto small businesses.',
  },
  '/pricing/': {
    title: 'Web Design & Local SEO Pricing in Toronto | Mann Patel',
    description:
      'Published prices in CAD: 5-page website $1,950, website + booking $3,350, fixes $450–$850, local SEO setup $650, care $149/month. Toronto and GTA.',
  },
  '/services/local-visibility/': { title: 'Local SEO & Google Business Profile Toronto | Mann Patel' },
  '/vision/': { title: 'Vision | Mann Patel, Web Designer in Toronto' },
};
/** Pages added by this SEO work: BreadcrumbList and the free-check link are required (Phase 3 adds them). */
const NEW_PAGES = [];
/** Pages that must NOT be built or listed while they are drafts (Phase 3 adds them; guides are detected). */
const DRAFT_PATHS = [];
/** Where the business node must appear in full. */
const BUSINESS_PAGES = ['/', '/contact/'];
const BUSINESS = { name: 'Mann Patel', telephone: '+1-647-978-6903', email: 'info@mannpatel.me' };
const FREE_CHECK = '/contact/?package=check-up#check';
/** Hidden form states that must never be headings or sit in the page before submit. */
const FORM_STATES = ['Please check these fields', 'Your brief is on its way', 'Your check request is on its way'];
/** The no-JavaScript "received" page: its H1 is the page's own title, by design. */
const STATE_EXEMPT = new Set(['/contact/received/']);
const HEAD_TERMS = ['web design toronto', 'seo company toronto'];
const LIMITS = { title: 60, description: 155 };

// ── Helpers
const errors = [];
const warnings = [];
const passes = [];
const err = (check, msg) => errors.push(`${check}: ${msg}`);
const warn = (check, msg) => warnings.push(`${check}: ${msg}`);

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
const text = (html) => decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const tidy = (s) => text(s).replace(/\s+([.,;:!?])/g, '$1');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name === '_astro' ? [] : walk(join(dir, e.name))) : e.name.endsWith('.html') ? [join(dir, e.name)] : [],
  );
}
const toPath = (file) => {
  const rel = relative(DIST, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
};
function nodes(value, out = []) {
  if (Array.isArray(value)) value.forEach((v) => nodes(v, out));
  else if (value && typeof value === 'object') {
    out.push(value);
    Object.values(value).forEach((v) => nodes(v, out));
  }
  return out;
}
const types = (n) => [].concat(n['@type'] ?? []);

// ── Load the build
if (!existsSync(DIST) || !statSync(DIST).isDirectory()) {
  console.error(`No build at ${DIST}. Run a production-like build first (see the top of this file).`);
  process.exit(1);
}
const pages = new Map(); // path → { file, html, title, description, h1s, ld, hrefs }
for (const file of walk(DIST)) {
  const path = toPath(file);
  const html = readFileSync(file, 'utf8');
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ?? '').trim();
  const description = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? '').trim();
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => tidy(m[1]));
  const ld = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      ld.push(JSON.parse(m[1]));
    } catch (e) {
      err('JSON-LD parses', `${path}: ${e.message}`);
    }
  }
  const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((m) => decode(m[1]));
  pages.set(path, { file, html, title, description, h1s, ld, hrefs });
}

// ── Sitemap and lastmod
const sitemapUrls = [];
const indexFile = join(DIST, 'sitemap-index.xml');
if (!existsSync(indexFile)) {
  err('sitemap', 'sitemap-index.xml is missing: build with PUBLIC_SITE_URL and SITE_INDEXING=true');
} else {
  const subs = [...readFileSync(indexFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  for (const sub of subs) {
    const file = join(DIST, new URL(sub).pathname);
    if (!existsSync(file)) {
      err('sitemap', `${sub} listed in the index but not built`);
      continue;
    }
    for (const m of readFileSync(file, 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1];
      const lastmod = (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
      sitemapUrls.push(loc);
      if (!lastmod) err('sitemap lastmod', `${loc} has no <lastmod>`);
      else if (Number.isNaN(Date.parse(lastmod))) err('sitemap lastmod', `${loc} has an invalid date "${lastmod}"`);
    }
  }
  if (!sitemapUrls.length) err('sitemap', 'the sitemap lists no URLs');
  else if (!errors.some((e) => e.startsWith('sitemap'))) passes.push(`sitemap: ${sitemapUrls.length} URLs, all with <lastmod>`);
}
const published = sitemapUrls.map((u) => new URL(u).pathname);
for (const path of published) if (!pages.has(path)) err('sitemap', `${path} is in the sitemap but not built`);

// ── Per page
const titles = new Map();
for (const [path, p] of pages) {
  const isPublished = published.includes(path);
  if (p.h1s.length !== 1) err('one H1', `${path} has ${p.h1s.length} H1s`);
  // Every built page, not only the sitemap: the 404 and "received" pages are seen by visitors too.
  if (/\bTODO\b/.test(p.html)) err('no TODO in published pages', `${path} contains "TODO"`);
  if (!p.title) err('title', `${path} has no <title>`);
  titles.set(p.title, [...(titles.get(p.title) ?? []), path]);
  if (isPublished) {
    if (p.title.length > LIMITS.title) warn('title length', `${path} title is ${p.title.length} characters (> ${LIMITS.title}): "${p.title}"`);
    if (!p.description) err('description', `${path} has no meta description`);
    else if (p.description.length > LIMITS.description)
      warn('description length', `${path} description is ${p.description.length} characters (> ${LIMITS.description})`);
    if (!/<html lang="en-CA"/.test(p.html)) err('lang', `${path} is not lang="en-CA"`);
    const canonical = (p.html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
    if (canonical !== `${SITE}${path}`) err('canonical', `${path} canonical is ${canonical ?? 'missing'}`);
    for (const term of HEAD_TERMS) {
      const re = new RegExp(`\\b${term.replace(/ /g, '\\s+')}\\b`, 'i');
      if (re.test(p.title) || p.h1s.some((h) => re.test(h))) warn('head terms', `${path} targets "${term}" in its title or H1`);
    }
    // Capture images (project screenshots) always describe themselves.
    for (const m of p.html.matchAll(/<img\b[^>]*>/g)) {
      const tag = m[0];
      if (!/\salt=""/.test(tag)) continue;
      const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1] ?? '';
      if (/\/_astro\/(live|preview|detail)-/.test(src)) err('screenshot alt', `${path}: empty alt on ${src}`);
      else warn('empty alt', `${path}: empty alt on ${src} (fine only if decorative)`);
    }
  }

  // JSON-LD content rules (every page).
  const all = nodes(p.ld);
  for (const n of all) {
    if (n.worksFor && /nest\s*&\s*rest/i.test(JSON.stringify(n.worksFor))) err('no worksFor Nest & Rest', `${path}: ${types(n).join('/')} worksFor Nest & Rest`);
    if ('streetAddress' in n || 'postalCode' in n) err('no street address', `${path}: ${types(n).join('/')} has a street address or postal code`);
    if (types(n).some((t) => t === 'Review' || t === 'AggregateRating') || 'aggregateRating' in n || 'review' in n)
      err('no review schema', `${path}: Review/AggregateRating markup found`);
  }

  // Footer labels are not headings.
  const footer = (p.html.match(/<footer\b[\s\S]*?<\/footer>/) || [''])[0];
  for (const m of footer.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    if (/class="[^"]*\bftr__h\b/.test(m[0]) || /^(Pages|Services|Contact|Elsewhere)$/.test(text(m[2])))
      err('footer labels', `${path}: footer label "${text(m[2])}" is an <${m[1]}>`);
  }

  // Contact form states: never headings, and not in the page outside <template> before submit.
  if (!STATE_EXEMPT.has(path)) {
    const headings = [...p.html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => text(m[2]).toLowerCase());
    const outsideTemplates = text(p.html.replace(/<template\b[\s\S]*?<\/template>/g, '').replace(/<script\b[\s\S]*?<\/script>/g, '')).toLowerCase();
    for (const state of FORM_STATES) {
      const s = state.toLowerCase();
      if (headings.some((h) => h.includes(s))) err('form states', `${path}: "${state}" is in a heading`);
      if (outsideTemplates.includes(s)) err('form states', `${path}: "${state}" is in the HTML before submit (outside <template>)`);
    }
  }
}
for (const [title, paths] of titles) if (paths.length > 1) err('unique titles', `"${title}" is used by ${paths.join(', ')}`);

// ── Exact copy
for (const [path, want] of Object.entries(EXACT)) {
  const p = pages.get(path);
  if (!p) {
    err('exact copy', `${path} was not built`);
    continue;
  }
  if (want.title && p.title !== want.title) err('exact copy', `${path} title is "${p.title}", expected "${want.title}"`);
  if (want.description && p.description !== want.description)
    err('exact copy', `${path} description is "${p.description}", expected "${want.description}"`);
  if (want.h1 && p.h1s[0] !== want.h1) err('exact copy', `${path} H1 is "${p.h1s[0]}", expected "${want.h1}"`);
}

// ── The business entity
for (const path of BUSINESS_PAGES) {
  const p = pages.get(path);
  const biz = p && nodes(p.ld).find((n) => types(n).includes('ProfessionalService') && n.telephone);
  if (!biz) {
    err('ProfessionalService', `${path}: no ProfessionalService with a telephone`);
    continue;
  }
  for (const [k, v] of Object.entries(BUSINESS)) if (biz[k] !== v) err('ProfessionalService', `${path}: ${k} is "${biz[k]}", expected "${v}"`);
  if (!biz.founder || !/#person$/.test(biz.founder['@id'] ?? '')) err('ProfessionalService', `${path}: founder does not point to the Person @id`);
  if (!biz.areaServed || !/Scarborough/.test(JSON.stringify(biz.areaServed)) || !/North York/.test(JSON.stringify(biz.areaServed)))
    err('ProfessionalService', `${path}: areaServed must include Scarborough and North York`);
  if (!biz.priceRange) err('ProfessionalService', `${path}: no priceRange`);
  if (!Array.isArray(biz.sameAs) || !biz.sameAs.some((u) => /maps\.app\.goo\.gl|google\.com\/maps/.test(u)))
    err('ProfessionalService', `${path}: sameAs has no Google Business Profile link`);
}

// ── Links: no orphans, new-page rules, drafts
const linkedFrom = new Map();
for (const [from, p] of pages) {
  for (const href of p.hrefs) {
    let url;
    try {
      url = new URL(href, `${SITE}${from}`);
    } catch {
      continue;
    }
    if (url.origin !== SITE) continue;
    const to = url.pathname;
    if (to === from) continue;
    linkedFrom.set(to, new Set([...(linkedFrom.get(to) ?? []), from]));
  }
}
for (const path of published) if (path !== '/' && !linkedFrom.get(path)?.size) err('no orphans', `${path} is not linked from any other page`);
for (const path of NEW_PAGES) {
  const p = pages.get(path);
  if (!p) {
    err('new pages', `${path} was not built`);
    continue;
  }
  if (!nodes(p.ld).some((n) => types(n).includes('BreadcrumbList'))) err('new pages', `${path} has no BreadcrumbList`);
  if (!p.hrefs.some((h) => h.replace(SITE, '') === FREE_CHECK)) err('new pages', `${path} has no link to the free check (${FREE_CHECK})`);
  if (!published.includes(path)) err('new pages', `${path} is not in the sitemap`);
}
const guideDir = 'src/content/guides';
const drafts = [...DRAFT_PATHS];
if (existsSync(guideDir)) {
  for (const f of readdirSync(guideDir).filter((n) => n.endsWith('.md'))) {
    const fm = (readFileSync(join(guideDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/) || [])[1] ?? '';
    if (/^draft:\s*true\s*$/m.test(fm)) drafts.push(`/guides/${f.replace(/\.md$/, '')}/`);
  }
}
for (const path of drafts) {
  if (pages.has(path)) err('drafts', `${path} is a draft but was built`);
  if (published.includes(path)) err('drafts', `${path} is a draft but is in the sitemap`);
}

// ── Report
const checks = [
  'one H1',
  'unique titles',
  'exact copy',
  'JSON-LD parses',
  'ProfessionalService',
  'no worksFor Nest & Rest',
  'no street address',
  'no review schema',
  'footer labels',
  'form states',
  'no TODO in published pages',
  'screenshot alt',
  'no orphans',
  'new pages',
  'drafts',
  'lang',
  'canonical',
];
for (const c of checks) if (!errors.some((e) => e.startsWith(`${c}:`))) passes.push(c);
console.log(`SEO check on ${DIST}: ${pages.size} HTML pages, ${published.length} in the sitemap\n`);
for (const p of passes) console.log(`  PASS  ${p}`);
for (const w of warnings) console.log(`  WARN  ${w}`);
for (const e of errors) console.log(`  FAIL  ${e}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
