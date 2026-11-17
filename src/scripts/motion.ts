/**
 * Site-wide motion and small functions. Loaded once by BaseLayout.
 *
 * - Reveals are CSS only (design upgrade Phase 4): section heads and media on a scroll timeline, first-screen content
 *   on load. html.js-motion (set in <head> when motion is allowed) opts in; __revealReady tells the head's failsafe
 *   that scripts run, so it leaves js-motion on (scenes such as the services bento need a script to play).
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
/**
 * Work that reads the layout waits for an idle moment, after the browser has laid the page out for its first frames
 * (design upgrade Phase 4, gate M7): read at start-up, it would force that layout inside this script.
 */
const whenIdle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 1));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

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
// Toronto time worked out by hand: Eastern Time is UTC-5, and UTC-4 from the second Sunday of March (2:00) to the first
// Sunday of November (2:00). A time-zone formatter (Intl.DateTimeFormat with timeZone) took 60-90ms to build on a slow
// phone, a long frame on every page (design upgrade Phase 4, gate M7). The clock is decorative (aria-hidden).
const clocks = document.querySelectorAll<HTMLElement>('[data-clock]');
const toronto = (now: Date) => {
  const y = now.getUTCFullYear();
  const sunday = (month: number, nth: number) => {
    const first = new Date(Date.UTC(y, month, 1)).getUTCDay();
    return 1 + ((7 - first) % 7) + (nth - 1) * 7;
  };
  const t = now.getTime();
  const summer = t >= Date.UTC(y, 2, sunday(2, 2), 7) && t < Date.UTC(y, 10, sunday(10, 1), 6);
  return new Date(t + (summer ? -4 : -5) * 3_600_000); // read with the getUTC* methods
};
if (clocks.length) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const tick = () => {
    const d = toronto(new Date());
    const h = d.getUTCHours();
    const text = `${h % 12 || 12}:${pad(d.getUTCMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
    const iso = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(h)}:${pad(d.getUTCMinutes())}`;
    clocks.forEach((c) => {
      c.textContent = text;
      if (c.tagName === 'TIME') c.setAttribute('datetime', iso);
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
  // The first dot starts current before the dots are on the page, so nothing animates while it loads.
  items.forEach((_, i) => {
    const dot = document.createElement('i');
    if (i === 0) dot.className = 'is-on';
    dots.append(dot);
  });
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
  whenIdle(update);
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
// Reduced motion (Website Playbook, 16 Nov 2026): nothing moves with the scroll; each progress line shows complete.
if (progressEls.length && reduced.matches) for (const el of progressEls) el.style.setProperty('--p', '1');
else if (progressEls.length) {
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
  whenIdle(update);
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
}

export {};
