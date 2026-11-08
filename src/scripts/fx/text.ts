/**
 * Text effects.
 *
 * - Decode (`[data-scramble]`, and every mono `.eyebrow` label): when the label scrolls into view
 *   its letters cycle through signal glyphs and lock in from left to right, like a transmission
 *   being decoded. `data-scramble="hover"` also replays on hover. Screen readers get the real text
 *   the whole time (a visually hidden copy; the animated letters are aria-hidden), and the plain
 *   text is restored when it finishes.
 * - Scrub (`[data-scrub]`): a statement whose words light up one by one as you scroll through it.
 *   Unlit words use --text-3, which still passes WCAG AA, so it is readable at every moment.
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
  const els = [...document.querySelectorAll<HTMLElement>('[data-scramble], .eyebrow')].filter((el) => !el.children.length);
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

/** Wrap each word of the text nodes (links and emphasis keep their markup) in a span. */
function wrapWords(root: HTMLElement) {
  const words: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const parts = (node.textContent ?? '').split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) frag.append(part);
      else {
        const s = document.createElement('span');
        s.className = 'sw';
        s.textContent = part;
        frag.append(s);
        words.push(s);
      }
    }
    node.replaceWith(frag);
  }
  return words;
}

export function initScrub() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-scrub]')];
  if (!els.length || reduced()) return;
  const items = els.map((el) => {
    el.classList.add('is-scrub');
    return { el, words: wrapWords(el), lit: -1 };
  });
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      // 0 when the top reaches 88% of the screen, 1 when the bottom reaches 52%.
      const start = vh * 0.88;
      const p = Math.min(1, Math.max(0, (start - r.top) / (r.height + start - vh * 0.52)));
      const lit = Math.round(p * it.words.length);
      if (lit === it.lit) continue;
      it.words.forEach((w, i) => w.classList.toggle('is-lit', i < lit));
      it.lit = lit;
    }
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  addEventListener('resize', update, { passive: true });
  update();
}
