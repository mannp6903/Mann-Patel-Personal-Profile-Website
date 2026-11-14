/**
 * Presenter mode (14 Nov 2026), for showing the site on a projector or a shared screen.
 *
 * Turn it on with ?present=1 (it stays on for the browser tab, across pages) and off with ?present=0.
 * The inline script in BaseLayout sets html[data-present] before the first paint; this file adds the
 * keyboard: → / PageDown jump to the next section and ← / PageUp to the previous one, so a slide
 * clicker works. Larger type and no cursor effects come from CSS and fx/pointer.ts.
 */
const root = document.documentElement;

function sections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('main > section, main > header, main > div > section, footer'));
}

function jump(dir: 1 | -1) {
  const headerH = document.querySelector<HTMLElement>('.hdr')?.offsetHeight ?? 0;
  const tops = sections().map((s) => s.getBoundingClientRect().top + scrollY - headerH);
  const y = scrollY;
  const target = dir === 1 ? tops.find((t) => t > y + 8) : [...tops].reverse().find((t) => t < y - 8);
  if (target === undefined) return;
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  scrollTo({ top: Math.max(0, target), behavior: smooth ? 'smooth' : 'auto' });
}

if (root.hasAttribute('data-present')) {
  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector('dialog[open]')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      jump(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      jump(-1);
    }
  });
}
