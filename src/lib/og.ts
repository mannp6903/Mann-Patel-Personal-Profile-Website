/**
 * Per-page sharing images (Nov 2026 audit fixes). Every page gets its own 1200 × 630 Open Graph image, made at build
 * time from its title by scripts/og-images.mjs (astro.config.mjs → `og-images`), instead of one /og/default.png for
 * all. The case studies keep their own cards (public/og/work-*.png, from their real captures: `npm run images`).
 *
 * Pure functions only: BaseLayout uses them for the meta tags, the build step uses them to draw the same image.
 */

/** Where a page's image lives: /og/p/<path>.png, e.g. /services/web-design/ → /og/p/services--web-design.png. */
export function ogImagePath(pathname: string): string {
  const slug =
    pathname
      .replace(/\.html$/, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9/-]/gi, '')
      .replace(/\//g, '--') || 'home';
  return `/og/p/${slug}.png`;
}

/**
 * The words on the card: the page's own part of its title, without the site name the wordmark already shows.
 * "How Much Does a Website Cost in Toronto? | Mann Patel" → "How Much Does a Website Cost in Toronto?"
 * "Contact Mann Patel | Web Design & Local SEO in Toronto" → "Contact Mann Patel"
 * "Web Design & Local SEO in Scarborough, Toronto | Mann Patel" (the home page) → "Web Design & Local SEO in Scarborough, Toronto"
 * "Mann Patel — Web Design & Local SEO, Scarborough & Toronto" → "Web Design & Local SEO, Scarborough & Toronto"
 */
export function ogCardTitle(pageTitle: string): string {
  const parts = pageTitle.split(/\s+\|\s+/).map((s) => s.trim()).filter(Boolean);
  const own = parts.find((s) => !/^Mann Patel\b/.test(s)) ?? parts[0] ?? '';
  const t = own.replace(/^Mann Patel\s*[—–:-]\s*/, '').trim();
  return t || pageTitle.trim();
}

/** A short label above the title, from the page's section (never claims anything). */
export function ogSection(pathname: string): string {
  const p = pathname.replace(/\.html$/, '/');
  if (p === '/') return ''; // the home title already says it
  if (/^\/guides\/[^/]+\/$/.test(p)) return 'Guide';
  if (p === '/guides/') return 'Guides';
  if (/^\/services\/[^/]+\/$/.test(p)) return 'Service';
  if (p === '/services/') return 'Services';
  if (/^\/web-design-[^/]+\/$/.test(p)) return 'Service area';
  if (/^\/websites-for-[^/]+\/$/.test(p)) return 'By trade';
  if (p.startsWith('/work/')) return 'Work';
  const first = p.split('/')[1] ?? '';
  return { pricing: 'Pricing', about: 'About', vision: 'Vision', contact: 'Contact', 'free-check': 'Free check' }[first] ?? '';
}

/** The image's alt text (og:image:alt): what the card shows. */
export function ogAlt(pageTitle: string): string {
  return `${ogCardTitle(pageTitle)}. Mann Patel, web design and local SEO in Toronto, mannpatel.me.`;
}
