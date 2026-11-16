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
    // Competitor gap work (16 Nov 2026): keyword first.
    title: 'Web Design & Local SEO in Scarborough, Toronto | Mann Patel',
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
  // Nov 2026 audit fixes (the address stays the same).
  '/guides/how-to-get-recommended-by-chatgpt/': {
    title: 'Showing Up in ChatGPT & AI Overviews | Mann Patel',
    h1: 'How local businesses show up in ChatGPT and Google AI Overviews',
  },
};
/**
 * Pages added by this SEO work (Phase 3): each needs a BreadcrumbList, a link to the free check and a sitemap
 * entry. Published guides, the /guides/ index and published area pages are added below, from their sources.
 */
const NEW_PAGES = [
  '/websites-for-cleaning-companies/',
  '/websites-for-salons-and-spas/',
  // Phase 4 (Mann chose these two, 14 Nov 2026).
  '/services/website-care/',
  '/services/ai-search-optimization/',
  // Competitor gap work (16 Nov 2026).
  '/services/website-redesign/',
];
/** Pages that must NOT be built, listed or linked while they are drafts (detected below: guides and area pages). */
const DRAFT_PATHS = [];
/** The search each new page is built for: every word must be in its title and in its H1 (plan C1, C3, C4). */
const KEYWORDS = {
  '/websites-for-cleaning-companies/': 'cleaning company website design toronto',
  '/websites-for-salons-and-spas/': 'salon website design toronto',
  '/web-design-scarborough/': 'web design scarborough',
  // Nov 2026 audit fixes (keyword C17), checked once the page is published.
  '/web-design-north-york/': 'web designer north york',
  '/services/website-care/': 'website maintenance toronto',
  '/services/ai-search-optimization/': 'ai search optimization toronto',
  // Competitor gap work (16 Nov 2026); the four area pages are checked once they are published.
  '/services/website-redesign/': 'website redesign toronto',
  '/web-design-markham/': 'web design markham',
  '/web-design-pickering/': 'web design pickering',
  '/web-design-east-york/': 'web design east york',
  '/web-design-ajax/': 'web design ajax',
};
/** Where the business node must appear in full. */
const BUSINESS_PAGES = ['/', '/contact/'];
const BUSINESS = { name: 'Mann Patel', telephone: '+1-647-978-6903', email: 'info@mannpatel.me' };
const FREE_CHECK = '/contact/?package=check-up#check';
/** Hidden form states that must never be headings or sit in the page before submit. */
const FORM_STATES = ['Please check these fields', 'Your brief is on its way', 'Your check request is on its way'];
/** The no-JavaScript "received" page: its H1 is the page's own title, by design. */
const STATE_EXEMPT = new Set(['/contact/received/']);
const HEAD_TERMS = ['web design toronto', 'seo company toronto'];
/**
 * The services overview stays a short routing page (SEO audit Phase 2): about 600 words (warn above 650, fail
 * above 1,000 or if it has no main content), and
 * no more than 20% of another page's text repeated on it (the audit measured 72% of /pricing/ and 43% of
 * /services/web-design/, as 8-word shingles of the main content).
 */
const OVERVIEW = { path: '/services/', aimWords: 600, warnWords: 650, maxWords: 1000, maxRepeat: 0.2, sources: ['/pricing/', '/services/web-design/', '/services/local-visibility/', '/services/enquiry-follow-up/'] };
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
const ogImages = new Map();
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

  // Schema by page type (Nov 2026 audit): what each type of page must carry, and FAQPage only for visible FAQs.
  const visible = text(p.html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<template\b[\s\S]*?<\/template>/g, ' '));
  const flat = (s) => decode(String(s)).replace(/\s+/g, ' ').trim();
  for (const faq of all.filter((n) => types(n).includes('FAQPage'))) {
    for (const q of [].concat(faq.mainEntity ?? [])) {
      if (!visible.includes(flat(q.name))) err('schema by page type', `${path}: FAQPage question "${q.name}" is not visible on the page`);
      else if (!visible.includes(flat(q.acceptedAnswer?.text ?? '').slice(0, 80)))
        err('schema by page type', `${path}: the FAQPage answer to "${q.name}" is not visible on the page`);
    }
  }
  if (/<nav\b[^>]*aria-label="Breadcrumb"/.test(p.html) && !all.some((n) => types(n).includes('BreadcrumbList')))
    err('schema by page type', `${path}: shows a breadcrumb but has no BreadcrumbList`);
  if (isPublished && /^\/guides\/[^/]+\/$/.test(path)) {
    const post = all.find((n) => types(n).includes('BlogPosting'));
    if (!post) err('schema by page type', `${path}: a guide without BlogPosting`);
    else {
      if (post.headline !== p.h1s[0]) err('schema by page type', `${path}: BlogPosting headline "${post.headline}" is not the H1 "${p.h1s[0]}"`);
      for (const k of ['datePublished', 'dateModified'])
        if (!/^\d{4}-\d{2}-\d{2}/.test(post[k] ?? '')) err('schema by page type', `${path}: BlogPosting has no ${k}`);
      if (!/#person$/.test(post.author?.['@id'] ?? '')) err('schema by page type', `${path}: BlogPosting author is not the Person @id`);
      // The visible "Updated" date, when shown, is the dateModified.
      const shown = [...p.html.matchAll(/Updated <time datetime="([^"]+)"/g)].map((m) => m[1]);
      if (shown.length && shown[0] !== post.dateModified) err('schema by page type', `${path}: shows Updated ${shown[0]} but dateModified is ${post.dateModified}`);
    }
  }
  if (isPublished && /^\/services\/[^/]+\/$/.test(path)) {
    const svc = all.find((n) => types(n).includes('Service') && n.provider);
    if (!svc) err('schema by page type', `${path}: a service page without a Service (with a provider)`);
    else for (const o of [].concat(svc.offers ?? []))
      if (o.priceCurrency !== 'CAD' || (o.price === undefined && o.priceSpecification?.minPrice === undefined))
        err('schema by page type', `${path}: Offer "${o.name}" has no CAD price`);
  }

  // Sharing image (Nov 2026 audit fixes): every page has its own, in the build, 1200 × 630.
  const og = (p.html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (!og) err('sharing images', `${path}: no og:image`);
  else {
    const ogPath = new URL(decode(og), `${SITE}/`).pathname;
    const file = join(DIST, ogPath);
    if (ogPath === '/og/default.png') err('sharing images', `${path}: still uses the shared /og/default.png`);
    else if (!existsSync(file)) err('sharing images', `${path}: ${ogPath} is not in the build`);
    else {
      const png = readFileSync(file);
      const size = png.subarray(1, 4).toString() === 'PNG' ? [png.readUInt32BE(16), png.readUInt32BE(20)] : null;
      if (!size || size[0] !== 1200 || size[1] !== 630) err('sharing images', `${path}: ${ogPath} is ${size ? size.join(' × ') : 'not a PNG'}, not 1200 × 630`);
    }
    if (isPublished) ogImages.set(ogPath, [...(ogImages.get(ogPath) ?? []), path]);
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
for (const [image, paths] of ogImages) if (paths.length > 1) err('sharing images', `${image} is shared by ${paths.join(', ')}`);

// ── Modern JavaScript only (Nov 2026 audit fixes): Astro builds the client scripts for current browsers (esnext);
// no down-levelling helpers or polyfills may creep in with a dependency.
{
  const astroDir = join(DIST, '_astro');
  const legacy = /core-js|regeneratorRuntime|__awaiter|__generator|_asyncToGenerator|_classCallCheck|__async\(|__publicField|__spreadValues/;
  if (existsSync(astroDir))
    for (const f of readdirSync(astroDir).filter((n) => n.endsWith('.js'))) {
      const m = readFileSync(join(astroDir, f), 'utf8').match(legacy);
      if (m) err('modern JavaScript', `_astro/${f} contains "${m[0]}" (a polyfill or down-levelling helper)`);
    }
}

// ── llms.txt (16 Nov 2026): every address is a Markdown link, [label](https://…), so tools that read the file
// (Lighthouse's agentic browsing audit among them) find links. A bare https:// address on any line fails.
{
  const file = join(DIST, 'llms.txt');
  if (!existsSync(file)) err('llms.txt links', 'llms.txt is not in the build');
  else
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const rest = line.replace(/\[[^\]]*\]\(\s*https?:\/\/[^)\s]+\s*\)/g, '');
        if (/https?:\/\//i.test(rest)) err('llms.txt links', `line ${i + 1} has an address outside Markdown link syntax: ${line.trim()}`);
      });
}

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
// The area pages carry the full node too, once they are published (plan B2; a draft isn't built).
for (const path of [...BUSINESS_PAGES, ...[...pages.keys()].filter((p) => /^\/web-design-[a-z-]+\/$/.test(p))]) {
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
  const logoUrl = typeof biz.logo === 'string' ? biz.logo : biz.logo?.url;
  if (!logoUrl?.startsWith(`${SITE}/`)) err('ProfessionalService', `${path}: no logo on ${SITE}`);
  else if (!existsSync(join(DIST, new URL(logoUrl).pathname))) err('ProfessionalService', `${path}: logo ${logoUrl} is not in the build`);
}
// The business catalogue (home page): every Offer priced in CAD.
{
  const biz = nodes(pages.get('/')?.ld ?? []).find((n) => types(n).includes('ProfessionalService') && n.hasOfferCatalog);
  const offers = [].concat(biz?.hasOfferCatalog?.itemListElement ?? []);
  if (!offers.length) err('ProfessionalService', '/: no hasOfferCatalog with offers');
  for (const o of offers)
    if (o.priceCurrency !== 'CAD' || (o.price === undefined && o.priceSpecification?.minPrice === undefined))
      err('ProfessionalService', `/: catalogue Offer "${o.name}" has no CAD price`);
}

// ── The services overview: short, and not a copy of other pages
const mainWords = (html) =>
  text(
    ((html.match(/<main\b[\s\S]*<\/main>/) || [''])[0])
      .replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<template\b[\s\S]*?<\/template>/g, ''),
  )
    .toLowerCase()
    .replace(/[^a-z0-9$,.\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
const shingles = (words, n = 8) => {
  const set = new Set();
  for (let i = 0; i + n <= words.length; i++) set.add(words.slice(i, i + n).join(' '));
  return set;
};
const overview = pages.get(OVERVIEW.path);
if (!overview) err('services overview', `${OVERVIEW.path} was not built`);
else {
  const words = mainWords(overview.html);
  if (words.length < 100) err('services overview', `${OVERVIEW.path} has ${words.length} words of main content (no <main>?)`);
  else if (words.length > OVERVIEW.maxWords) err('services overview', `${OVERVIEW.path} has ${words.length} words (limit ${OVERVIEW.maxWords})`);
  else if (words.length > OVERVIEW.warnWords) warn('services overview', `${OVERVIEW.path} has ${words.length} words (aim for about ${OVERVIEW.aimWords})`);
  const mine = shingles(words);
  for (const src of OVERVIEW.sources) {
    const other = pages.get(src);
    if (!other) {
      err('services overview', `${src} was not built, so the repeat check can't run`);
      continue;
    }
    const theirs = shingles(mainWords(other.html));
    let shared = 0;
    for (const sh of theirs) if (mine.has(sh)) shared++;
    const share = theirs.size ? shared / theirs.size : 0;
    if (share > OVERVIEW.maxRepeat) err('services overview', `${Math.round(share * 100)}% of ${src} is repeated on ${OVERVIEW.path}`);
  }
  if (!errors.some((e) => e.startsWith('services overview:'))) passes.push(`services overview: no page more than ${OVERVIEW.maxRepeat * 100}% repeated on it`);
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
// Drafts and their published counterparts, read from the sources (the same switches the build uses).
const drafts = [...DRAFT_PATHS];
const newPages = [...NEW_PAGES];
// Guides: `draft: true` in the front matter. The /guides/ index exists only once a guide is published.
const guideDir = 'src/content/guides';
if (existsSync(guideDir)) {
  let live = 0;
  for (const f of readdirSync(guideDir).filter((n) => n.endsWith('.md'))) {
    const fm = (readFileSync(join(guideDir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/) || [])[1] ?? '';
    const path = `/guides/${f.replace(/\.md$/, '')}/`;
    if (/^draft:\s*false\s*$/m.test(fm)) {
      newPages.push(path);
      live++;
    } else drafts.push(path);
  }
  (live ? newPages : drafts).push('/guides/');
}
// Area pages (src/data/areas.ts → /web-design-<slug>/): a draft while `neighbourhoods` is null or empty, or while
// `localExample` is null (the same switches as areaIsDraft()). Each entry is read on its own, from its slug to the next.
const areaFile = 'src/data/areas.ts';
if (existsSync(areaFile)) {
  const entries = readFileSync(areaFile, 'utf8').split(/(?=\bslug:\s*')/).slice(1);
  let found = 0;
  for (const entry of entries) {
    const slug = (entry.match(/^slug:\s*'([a-z-]+)'/) || [])[1];
    const list = (entry.match(/\bneighbourhoods:\s*(null|\[\s*\]|\[)/) || [])[1];
    if (!slug || !list) continue;
    found++;
    const draft = list !== '[' || /\blocalExample:\s*null\b/.test(entry);
    (draft ? drafts : newPages).push(`/web-design-${slug}/`);
  }
  if (!found) err('drafts', `${areaFile}: no area with a slug and neighbourhoods found, so its draft state can't be checked`);
}
for (const path of newPages) {
  const p = pages.get(path);
  if (!p) {
    err('new pages', `${path} was not built`);
    continue;
  }
  if (!nodes(p.ld).some((n) => types(n).includes('BreadcrumbList'))) err('new pages', `${path} has no BreadcrumbList`);
  // Ends with the free check: the last section in <main> is the free-check block (#check). Every page has a
  // free-check link in the footer and the phone menu, so a link alone proves nothing.
  const main = (p.html.match(/<main\b[\s\S]*<\/main>/) || [''])[0];
  const lastSection = [...main.matchAll(/<section\b[^>]*>/g)].pop()?.[0] ?? '';
  if (!/\bid="check"/.test(lastSection) || !main.includes(`href="${FREE_CHECK}"`))
    err('new pages', `${path} doesn't end with the free check (the last section in <main> must be #check, linking ${FREE_CHECK})`);
  if (!published.includes(path)) err('new pages', `${path} is not in the sitemap`);
}
for (const path of drafts) {
  if (pages.has(path)) err('drafts', `${path} is a draft but was built`);
  if (published.includes(path)) err('drafts', `${path} is a draft but is in the sitemap`);
  const from = linkedFrom.get(path);
  if (from?.size) err('drafts', `${path} is a draft but is linked from ${[...from].join(', ')}`);
}
// The search each new page targets.
for (const [path, keyword] of Object.entries(KEYWORDS)) {
  const p = pages.get(path);
  if (!p) continue; // not built: reported above if it should be
  const words = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const has = (s) => words(keyword).every((w) => words(s).includes(w));
  if (!has(p.title)) err('keywords', `${path} title "${p.title}" doesn't contain every word of "${keyword}"`);
  if (!has(p.h1s[0] ?? '')) err('keywords', `${path} H1 "${p.h1s[0]}" doesn't contain every word of "${keyword}"`);
}

// ── Report
const checks = [
  'one H1',
  'unique titles',
  'exact copy',
  'JSON-LD parses',
  'ProfessionalService',
  'schema by page type',
  'sharing images',
  'modern JavaScript',
  'llms.txt links',
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
  'keywords',
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
