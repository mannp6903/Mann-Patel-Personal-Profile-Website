/**
 * Decode (`[data-scramble]` only): when a marked label scrolls into view its letters cycle through
 * signal glyphs and lock in from left to right. `data-scramble="hover"` also replays on hover.
 * Screen readers get the real text the whole time (a visually hidden copy; the animated letters
 * are aria-hidden), and the plain text is restored when it finishes. Used sparingly on purpose.
 */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#+=*';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scramble(el: HTMLElement) {
  if (el.dataset.scrambling || reduced()) return;
  // Only plain-text labels: anything with child elements keeps its markup untouched.
  if (el.children.length) return;
  const text = el.textContent ?? '';
  if (!text.trim() || text.length > 60) return;
  el.dataset.scrambling = '1';
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = text;
  const vis = document.createElement('span');
  vis.setAttribute('aria-hidden', 'true');
  vis.textContent = text;
  el.replaceChildren(sr, vis);

  const chars = [...text];
  const n = chars.length;
  const lockAt = chars.map((_, i) => 120 + (i / n) * 520 + Math.random() * 120);
  const end = Math.max(...lockAt) + 40;
  const start = performance.now();
  let lastSwap = 0;
  const frame = (now: number) => {
    // Someone else changed the label meanwhile: leave their text alone.
    if (!vis.isConnected) {
      delete el.dataset.scrambling;
      return;
    }
    const t = now - start;
    if (t - lastSwap > 45) {
      lastSwap = t;
      let out = '';
      for (let i = 0; i < n; i++) {
        const ch = chars[i];
        out += t >= lockAt[i] || /[\s·.,:\-–—]/.test(ch) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      vis.textContent = out;
    }
    if (t < end) requestAnimationFrame(frame);
    else {
      el.textContent = text;
      delete el.dataset.scrambling;
    }
  };
  requestAnimationFrame(frame);
}

export function initDecode() {
  if (reduced()) return;
  const els = [...document.querySelectorAll<HTMLElement>('[data-scramble]')].filter((el) => !el.children.length);
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        scramble(e.target as HTMLElement);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  els.forEach((el) => io.observe(el));
  document.querySelectorAll<HTMLElement>('[data-scramble="hover"]').forEach((el) => {
    const host = el.closest<HTMLElement>('a, button') ?? el;
    host.addEventListener('pointerenter', () => scramble(el));
  });
}
