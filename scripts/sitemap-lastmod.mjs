// Sitemap <lastmod> dates (SEO audit, 14 Nov 2026; docs/seo/PLAN.md A8; reworked in the Nov 2026 audit fixes).
// Used by astro.config.mjs. Node built-ins only.
//
// Each URL gets the date its own content last changed, never the build time:
// - a guide: the `updated` date in its front matter, else its `published` date (the same date the page shows and
//   gives as BlogPosting dateModified, so the sitemap and the page agree);
// - a case study with an `updated` date in its front matter: that date (Website Playbook, 16 Nov 2026);
// - /guides/: the newest of the published guides' dates and its own route file;
// - every other page: the date of the latest git commit that touched its own source files: the page, the dynamic
//   route that renders it, its content or data file, and the shared data it shows in its main content (EXTRA,
//   ROUTE_DATA). The header, footer and layout are left out on purpose: a menu link or footer line changes every
//   page's HTML but not what the page is about, and dating every URL "today" for it made the dates meaningless.
//
// Found 15 Nov 2026: the live sitemap gave all 25 URLs the same date, the last commit's. Cloudflare builds from a
// shallow clone (one commit), so every file's "last commit" was the newest one. A shallow clone is now deepened
// before the first date is read.
//
// Website Playbook (16 Nov 2026): when no true date can be read, the URL gets no <lastmod> at all, rather than one
// shared date for every page (which tells search engines nothing, and teaches them to ignore the field). That covers
// a shallow clone that can't be deepened and a build with no git. Guides keep their front-matter dates either way.
//
// Files with uncommitted changes count as changed now (local builds).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

/** Shared data that changes what a page says in its main content (and structured data), beyond its own file. */
const EXTRA = {
  // The home page carries the full business node, the Person, the offer catalogue and the prices.
  '/': ['src/components/home', 'src/data/faqs.ts', 'src/lib/seo.ts', 'src/data/site.ts', 'src/data/packages.ts', 'src/data/service-pages.ts'],
  '/about/': ['src/lib/seo.ts', 'src/data/site.ts', 'src/components/Process.astro'],
  '/vision/': ['src/lib/seo.ts', 'src/data/site.ts', 'src/data/packages.ts'],
  '/pricing/': ['src/data/packages.ts', 'src/components/packages'],
  '/services/': ['src/data/services.ts', 'src/data/faqs.ts', 'src/data/packages.ts', 'src/components/packages', 'src/data/service-pages.ts', 'src/data/industry-pages.ts'],
  // The contact page carries the full business node and the phone and email.
  '/contact/': ['src/components/ContactForm.astro', 'src/components/CheckForm.astro', 'src/components/ContactActions.astro', 'src/lib/seo.ts', 'src/data/site.ts', 'src/lib/contact.ts'],
  '/work/': ['src/content/work', 'src/data/captures.ts'],
  // SEO audit Phase 3 (14 Nov 2026): the industry pages.
  '/websites-for-cleaning-companies/': ['src/data/industry-pages.ts', 'src/components/IndustryPage.astro', 'src/lib/seo.ts', 'src/data/packages.ts', 'src/components/packages', 'src/data/service-pages.ts', 'src/data/captures.ts', 'src/lib/work.ts', 'src/content/work/nest-and-rest-cleaning.md'],
  '/websites-for-salons-and-spas/': ['src/data/industry-pages.ts', 'src/components/IndustryPage.astro', 'src/lib/seo.ts', 'src/data/packages.ts', 'src/components/packages', 'src/data/service-pages.ts', 'src/data/captures.ts', 'src/lib/work.ts', 'src/content/work/samp-hair-spa.md'],
};
/** Area pages (/web-design-<slug>/): one template and one data file; each carries the full business node. */
const AREA = ['src/pages/web-design-[area].astro', 'src/data/areas.ts', 'src/data/industry-pages.ts', 'src/data/packages.ts', 'src/data/service-pages.ts', 'src/lib/work.ts', 'src/content/work', 'src/lib/seo.ts', 'src/data/site.ts'];
/** Data behind a dynamic route's pages (e.g. /services/web-design/ ← src/data/service-pages.ts). */
const ROUTE_DATA = {
  // Service pages: their offers are priced through src/lib/seo.ts (offerPrice).
  services: ['src/data/service-pages.ts', 'src/data/packages.ts', 'src/components/packages', 'src/components/home/FreeCheck.astro', 'src/components/ServiceDetails.astro', 'src/lib/seo.ts'],
  work: ['src/data/captures.ts'],
};
const GUIDES = 'src/content/guides';
const WORK = 'src/content/work';

/** Source files for a URL path such as "/services/web-design/". Only files that exist. */
export function sourcesFor(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const files = [];
  if (!clean) files.push('src/pages/index.astro');
  else if (/^web-design-[a-z-]+$/.test(clean)) files.push(...AREA);
  else {
    files.push(`src/pages/${clean}.astro`, `src/pages/${clean}/index.astro`, `src/pages/${clean}.md`);
    const parts = clean.split('/');
    if (parts.length > 1) {
      const parent = parts.slice(0, -1).join('/');
      const leaf = parts.at(-1);
      files.push(`src/pages/${parent}/[slug].astro`, `src/pages/${parent}/[id].astro`, `src/content/${parent}/${leaf}.md`);
      files.push(...(ROUTE_DATA[parent] ?? []));
    }
  }
  if (clean === 'guides') files.push('src/pages/guides/[...index].astro');
  files.push(...(EXTRA[pathname] ?? []));
  return [...new Set(files)].filter((f) => existsSync(f));
}

/** A guide's front matter dates: `updated` (else `published`) and whether it is published. */
export function guideDates(slug) {
  const file = `${GUIDES}/${slug}.md`;
  if (!existsSync(file)) return null;
  const fm = (readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] ?? '';
  const day = (key) => (fm.match(new RegExp(`^${key}:\\s*['"]?(\\d{4}-\\d{2}-\\d{2})['"]?\\s*$`, 'm')) || [])[1] ?? null;
  return { published: day('published'), updated: day('updated'), draft: !/^draft:\s*false\s*$/m.test(fm) };
}

/** A case study's front-matter `updated` date (Website Playbook, 16 Nov 2026), or null. */
export function workUpdated(slug) {
  const file = `${WORK}/${slug}.md`;
  if (!existsSync(file)) return null;
  const fm = (readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] ?? '';
  return (fm.match(/^updated:\s*['"]?(\d{4}-\d{2}-\d{2})['"]?\s*$/m) || [])[1] ?? null;
}

const git = (args) => {
  const r = spawnSync('git', args, { encoding: 'utf8', timeout: 120_000 });
  return r.status === 0 ? r.stdout.trim() : null;
};
const hasGit = git(['rev-parse', '--is-inside-work-tree']) === 'true';
const buildTime = new Date();
const cache = new Map();

/**
 * Full history is needed to date each file. Deepen a shallow clone once (CI). true = each file's own last commit can
 * be read; false = no git, or a shallow clone that couldn't be deepened (warned once).
 */
let historyOk = null;
function ensureHistory() {
  if (historyOk !== null) return historyOk;
  historyOk = false;
  if (!hasGit) return historyOk;
  if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
    console.log('[sitemap-lastmod] Shallow clone: fetching the full commit history to date each page…');
    if (git(['fetch', '--unshallow', '--quiet']) === null || git(['rev-parse', '--is-shallow-repository']) === 'true') {
      console.warn(
        '[sitemap-lastmod] WARNING: could not fetch the full git history. Pages without a front-matter date get no <lastmod> (rather than the same date for every page).',
      );
      return historyOk;
    }
  }
  return (historyOk = true);
}

const day = (d) => d.toISOString();

/**
 * A page's date from git, or null when git can't give a true one. Pure, for the tests.
 * - historyOk: the full history is readable (see ensureHistory)
 * - dirty: `git status --porcelain` output for the page's files (non-empty = changed and not committed yet)
 * - committed: the ISO date of the last commit to them
 */
export function gitDate({ historyOk, dirty, committed }, now = buildTime) {
  if (!historyOk) return null;
  if (dirty) return day(now);
  return committed ? day(new Date(committed)) : null;
}

/**
 * Date for a URL path (cached per build): ISO date-time, YYYY-MM-DD from a guide's front matter, or null for no
 * <lastmod> (astro.config.mjs then leaves the field out).
 */
export function lastmodFor(pathname) {
  if (cache.has(pathname)) return cache.get(pathname);
  let value = null;
  const guide = pathname.match(/^\/guides\/([^/]+)\/$/);
  const dates = guide ? guideDates(guide[1]) : null;
  const work = pathname.match(/^\/work\/([^/]+)\/$/);
  const workDate = work ? workUpdated(work[1]) : null;
  if (dates && (dates.updated || dates.published)) value = dates.updated ?? dates.published;
  else if (workDate) value = workDate;
  else {
    const files = sourcesFor(pathname);
    if (files.length && ensureHistory()) {
      value = gitDate({
        historyOk: true,
        dirty: git(['status', '--porcelain', '--', ...files]),
        committed: git(['log', '-1', '--format=%cI', '--', ...files]),
      });
    }
    // /guides/ changes when a guide is published or updated, as well as when its own file does.
    if (pathname === '/guides/' && existsSync(GUIDES)) {
      const newest = readdirSync(GUIDES)
        .filter((f) => f.endsWith('.md'))
        .map((f) => guideDates(f.replace(/\.md$/, '')))
        .filter((g) => g && !g.draft)
        .map((g) => g.updated ?? g.published)
        .filter(Boolean)
        .sort()
        .at(-1);
      if (newest && (!value || newest > value.slice(0, 10))) value = newest;
    }
  }
  cache.set(pathname, value);
  return value;
}
