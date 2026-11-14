// Sitemap <lastmod> dates (SEO audit, 14 Nov 2026; docs/seo/PLAN.md A8). Used by astro.config.mjs.
//
// Each URL gets the date of the latest git commit that touched its own source files: the page, the
// dynamic route that renders it, its content or data file, and the shared sources behind every page's
// structured data and contact details (GLOBAL). Files with uncommitted changes count as changed now (local
// builds); with no git history at all, the build date is used. Node built-ins only.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/**
 * Shared sources behind every page: the structured data (business and Person nodes), the profile, contact
 * details and location shown in the footer. A change here changes what every page says or marks up.
 */
const GLOBAL = ['src/lib/seo.ts', 'src/data/site.ts', 'src/lib/contact.ts'];
/** Shared data that changes what a page says, beyond its own .astro file. */
const EXTRA = {
  '/': ['src/components/home', 'src/data/faqs.ts'],
  '/pricing/': ['src/data/packages.ts', 'src/components/packages'],
  '/services/': ['src/data/services.ts', 'src/data/faqs.ts', 'src/data/packages.ts', 'src/components/packages'],
  '/contact/': ['src/components/ContactForm.astro', 'src/components/CheckForm.astro'],
  '/work/': ['src/content/work', 'src/data/captures.ts'],
};
/** Data behind a dynamic route's pages (e.g. /services/web-design/ ← src/data/service-pages.ts). */
const ROUTE_DATA = {
  services: ['src/data/service-pages.ts', 'src/data/packages.ts'],
  work: ['src/data/captures.ts'],
};

/** Source files for a URL path such as "/services/web-design/". Only files that exist. */
export function sourcesFor(pathname) {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const files = [];
  if (!clean) files.push('src/pages/index.astro');
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
  files.push(...(EXTRA[pathname] ?? []), ...GLOBAL);
  return [...new Set(files)].filter((f) => existsSync(f));
}

const git = (args) => {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
};
const hasGit = git(['rev-parse', '--is-inside-work-tree']) === 'true';
const buildTime = new Date();
const cache = new Map();

/** ISO date for a URL path (cached per build). */
export function lastmodFor(pathname) {
  if (cache.has(pathname)) return cache.get(pathname);
  let date = buildTime;
  const files = sourcesFor(pathname);
  if (hasGit && files.length) {
    const dirty = git(['status', '--porcelain', '--', ...files]);
    const committed = git(['log', '-1', '--format=%cI', '--', ...files]);
    if (!dirty && committed) date = new Date(committed);
  }
  const iso = date.toISOString();
  cache.set(pathname, iso);
  return iso;
}
