/**
 * Gentle, one-time reveal for elements marked [data-reveal].
 * Content is visible by default; it is only hidden when JS runs and motion is allowed
 * (html.js-motion, set in <head>). A failsafe in <head> removes js-motion if this never runs.
 */
declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

window.__revealReady = true;
const root = document.documentElement;

if (root.classList.contains('js-motion') && 'IntersectionObserver' in window) {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const delay = Number(el.dataset.revealDelay || 0);
        if (delay) el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-revealed');
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
} else {
  root.classList.remove('js-motion');
}

export {};
