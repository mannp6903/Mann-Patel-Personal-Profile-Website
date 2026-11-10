/**
 * Site-wide motion and small functions. Loaded once by BaseLayout.
 *
 * - [data-reveal] / [data-split]: fade-rise and line-by-line heading reveals when scrolled into view.
 *   Content is visible by default; html.js-motion (set in <head> when motion is allowed) opts in.
 * - [data-clock]: live Toronto time.
 * - [data-copy]: copy text to the clipboard, with a toast.
 * - [data-kinetic]: letters ([data-k-ch], HTML or SVG) get --g (0 → 1) by pointer distance; CSS moves them.
 * - [data-progress]: exposes scroll progress through an element as the CSS variable --p (0 → 1).
 */
declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

window.__revealReady = true;
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

/* ── Reveal ─────────────────────────────────────────────── */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]');
if (root.classList.contains('js-motion') && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  root.classList.remove('js-motion');
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* ── Smooth in-page links ───────────────────────────────── */
// Only clicks on in-page links glide; find-in-page, focus moves and scripts jump instantly.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || a.hash.length < 2) return;
  const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
  if (location.hash !== a.hash) {
    history.pushState(null, '', a.hash);
    dispatchEvent(new HashChangeEvent('hashchange'));
  }
  // Move keyboard focus to the target, as a normal in-page link would.
  if (!target.matches('a, button, input, select, textarea, summary, [tabindex]')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
});

/* ── Toronto clock ──────────────────────────────────────── */
const clocks = document.querySelectorAll<HTMLElement>('[data-clock]');
if (clocks.length) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: 'numeric', minute: '2-digit', hour12: true });
  const iso = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const tick = () => {
    const now = new Date();
    const text = fmt.format(now).replace(/\s?([ap])\.?m\.?/i, (_, x: string) => ` ${x.toUpperCase()}M`);
    clocks.forEach((c) => {
      c.textContent = text;
      if (c.tagName === 'TIME') c.setAttribute('datetime', iso.format(now).replace(' ', 'T'));
    });
  };
  tick();
  setInterval(tick, 15_000);
}

/* ── Toast ──────────────────────────────────────────────── */
let toastEl: HTMLElement | null = null;
let toastTimer: number | undefined;
export function toast(message: string) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    document.body.append(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl?.classList.remove('is-on'), 2400);
}

/* ── Copy to clipboard ──────────────────────────────────── */
document.addEventListener('click', async (e) => {
  const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-copy]');
  if (!btn) return;
  const value = btn.dataset.copy ?? '';
  try {
    await navigator.clipboard.writeText(value);
    toast(`Copied ${value}`);
    btn.classList.add('is-copied');
    setTimeout(() => btn.classList.remove('is-copied'), 1600);
  } catch {
    toast(`Copy didn’t work here. The address is ${value}`);
  }
});

/* ── Kinetic letters ────────────────────────────────────── */
document.querySelectorAll<HTMLElement>('[data-kinetic]').forEach((el) => {
  if (reduced.matches || !matchMedia('(hover: hover)').matches) return;
  const letters = [...el.querySelectorAll<HTMLElement | SVGElement>('[data-k-ch]')];
  if (!letters.length) return;
  let centers: number[] = [];
  let raf = 0;
  let px = -9999;
  const measure = () => {
    centers = letters.map((l) => {
      const r = l.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  };
  const paint = () => {
    raf = 0;
    const spread = Math.max(120, el.getBoundingClientRect().width / 6);
    letters.forEach((l, i) => {
      const d = Math.abs(px - centers[i]);
      const g = Math.exp(-(d * d) / (2 * spread * spread)); // 0 → 1
      l.style.setProperty('--g', g.toFixed(3));
    });
  };
  el.addEventListener('pointerenter', measure);
  el.addEventListener('pointermove', (e) => {
    px = e.clientX;
    if (!raf) raf = requestAnimationFrame(paint);
  });
  el.addEventListener('pointerleave', () => {
    px = -9999;
    if (!raf) raf = requestAnimationFrame(paint);
  });
  addEventListener('resize', measure, { passive: true });
});

/* ── Swipe rails: dots under each rail on phones ─────────── */
document.querySelectorAll<HTMLElement>('[data-rail]').forEach((rail) => {
  const items = [...rail.children] as HTMLElement[];
  if (items.length < 2) return;
  const dots = document.createElement('div');
  dots.className = 'rail-dots';
  dots.setAttribute('aria-hidden', 'true');
  items.forEach(() => dots.append(document.createElement('i')));
  rail.after(dots);
  let raf = 0;
  const update = () => {
    raf = 0;
    const left = rail.scrollLeft;
    const first = items[0].offsetLeft;
    let current = 0;
    items.forEach((it, i) => {
      if (Math.abs(it.offsetLeft - first - left) < Math.abs(items[current].offsetLeft - first - left)) current = i;
    });
    // At the far end, the last card is current even if it can't snap to the start.
    if (left + rail.clientWidth >= rail.scrollWidth - 4) current = items.length - 1;
    [...dots.children].forEach((d, i) => d.classList.toggle('is-on', i === current));
  };
  rail.addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(update);
  }, { passive: true });
  update();
  // A rail with nothing focusable inside gets a tab stop only while it actually scrolls, so
  // keyboard users can move it with the arrow keys and desktop keeps no empty tab stops.
  if (!rail.querySelector('a, button, input, select, textarea, summary')) {
    const sync = () => {
      if (rail.scrollWidth > rail.clientWidth + 1) rail.tabIndex = 0;
      else rail.removeAttribute('tabindex');
    };
    new ResizeObserver(sync).observe(rail);
  }
});

/* ── Scroll progress (--p) ──────────────────────────────── */
const progressEls = [...document.querySelectorAll<HTMLElement>('[data-progress]')];
if (progressEls.length) {
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const el of progressEls) {
      const r = el.getBoundingClientRect();
      // 0 when the element's top reaches 75% of the viewport, 1 when its bottom reaches 50%.
      const start = vh * 0.75;
      const total = r.height + start - vh * 0.5;
      const p = Math.min(1, Math.max(0, (start - r.top) / total));
      el.style.setProperty('--p', p.toFixed(4));
    }
  };
  update();
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
}

export {};
