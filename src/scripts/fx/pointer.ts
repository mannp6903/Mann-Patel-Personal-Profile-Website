/**
 * Pointer-driven surfaces (mouse and trackpad only, off under reduced motion):
 *
 * - Magnetic: buttons and round icon buttons lean toward the pointer, their arrow a little more,
 *   and spring back when it leaves. Uses the CSS `translate` property, so it composes with the
 *   buttons' own hover and press transforms.
 * - Spotlight: `[data-spotlight]` panels get --mx / --my (pointer position inside them), which the
 *   CSS turns into a soft lime light and a lit border that follow the pointer.
 *
 * One delegated listener each; nothing runs while the pointer is still.
 */
const MAGNETIC = '.btn, .icon-btn, .qm-trigger, .menu-btn, [data-magnetic]';

export function initPointer() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Presenter mode: no magnetic pull or spotlight on a projector (src/scripts/present.ts).
  if (document.documentElement.hasAttribute('data-present')) return;

  /* ── Magnetic ─────────────────────────────────────────── */
  let mag: HTMLElement | null = null;
  const release = (el: HTMLElement) => {
    el.classList.remove('is-pulled');
    el.style.removeProperty('translate');
    el.querySelector<HTMLElement>('.btn__icon')?.style.removeProperty('translate');
  };
  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(MAGNETIC) ?? null;
      if (mag && mag !== el) release(mag);
      mag = el;
      if (!el || el.matches('[disabled], [aria-disabled="true"]')) return;
      const r = el.getBoundingClientRect();
      // Measure from the untranslated box so the pull doesn't feed back into itself.
      const cur = el.style.translate.split(' ').map((v) => parseFloat(v) || 0);
      const cx = r.left - (cur[0] ?? 0) + r.width / 2;
      const cy = r.top - (cur[1] ?? 0) + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      const k = Math.min(10, r.width * 0.06);
      el.classList.add('is-pulled');
      el.style.translate = `${(dx * k).toFixed(2)}px ${(dy * k * 0.8).toFixed(2)}px`;
      el.querySelector<HTMLElement>('.btn__icon')?.style.setProperty('translate', `${(dx * 4).toFixed(2)}px ${(dy * 4).toFixed(2)}px`);
    },
    { passive: true },
  );
  document.addEventListener('pointerout', (e) => {
    if (!mag) return;
    const to = e.relatedTarget as Node | null;
    if (!to || !mag.contains(to)) {
      release(mag);
      mag = null;
    }
  });

  /* ── Spotlight ───────────────────────────────────────── */
  let raf = 0;
  let last: PointerEvent | null = null;
  const paint = () => {
    raf = 0;
    const e = last;
    if (!e) return;
    const t = e.target as Element | null;
    const spot = t?.closest<HTMLElement>('[data-spotlight]');
    if (spot) {
      const r = spot.getBoundingClientRect();
      spot.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(1)}px`);
      spot.style.setProperty('--my', `${(e.clientY - r.top).toFixed(1)}px`);
    }
  };
  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      last = e;
      if (!raf) raf = requestAnimationFrame(paint);
    },
    { passive: true },
  );
}
