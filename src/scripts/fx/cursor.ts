/**
 * Cursor follower (mouse and trackpad only). A ring trails the real cursor, which always stays
 * visible. Over links and buttons it grows; over anything marked `data-cursor="Label"` it becomes
 * a lime disc with that word ("View", "Visit"); over text fields it steps aside.
 * Decorative only (aria-hidden), never intercepts the pointer, off under reduced motion.
 */
const INTERACTIVE = 'a, button, summary, label, [role="tab"], [role="option"], .chip, [data-cursor]';
const TEXTY = 'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]';

export function initCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ring = document.createElement('div');
  ring.className = 'cursor';
  ring.setAttribute('aria-hidden', 'true');
  const tag = document.createElement('div');
  tag.className = 'cursor-tag';
  tag.setAttribute('aria-hidden', 'true');
  const tagText = document.createElement('span');
  tag.append(tagText);
  document.body.append(ring, tag);

  let x = -100;
  let y = -100;
  let rx = -100;
  let ry = -100;
  let tx = -100;
  let ty = -100;
  let raf = 0;
  let shown = false;

  const loop = () => {
    raf = 0;
    rx += (x - rx) * 0.2;
    ry += (y - ry) * 0.2;
    tx += (x - tx) * 0.14;
    ty += (y - ty) * 0.14;
    ring.style.translate = `${rx}px ${ry}px`;
    tag.style.translate = `${tx}px ${ty}px`;
    if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1 || Math.abs(x - tx) > 0.1 || Math.abs(y - ty) > 0.1)
      raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = tx = x;
        ry = ty = y;
        document.documentElement.classList.add('has-cursor');
      }
      kick();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    shown = false;
    document.documentElement.classList.remove('has-cursor');
  });

  const setState = (target: Element | null) => {
    const labelled = target?.closest<HTMLElement>('[data-cursor]');
    const field = target?.closest(TEXTY);
    const inter = target?.closest(INTERACTIVE);
    ring.classList.toggle('is-hidden', Boolean(field) || Boolean(labelled));
    ring.classList.toggle('is-link', !field && !labelled && Boolean(inter));
    if (labelled && !field) {
      tagText.textContent = labelled.dataset.cursor ?? '';
      tag.classList.add('is-on');
    } else tag.classList.remove('is-on');
  };
  document.addEventListener('pointerover', (e) => setState(e.target as Element), { passive: true });
  document.addEventListener('pointerdown', () => ring.classList.add('is-down'), { passive: true });
  document.addEventListener('pointerup', () => ring.classList.remove('is-down'), { passive: true });
  // Dialogs (menu, quick menu) and new pages: reset when focus or the page changes.
  addEventListener('blur', () => document.documentElement.classList.remove('has-cursor'));
}
