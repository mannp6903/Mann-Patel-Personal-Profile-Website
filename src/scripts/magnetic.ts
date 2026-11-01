/**
 * Magnetic hover: elements marked [data-magnetic] lean toward the pointer, and their
 * [data-magnetic-label] leans a little further. Mouse/trackpad only, never with reduced motion.
 */
const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

if (fine.matches && !reduced.matches) {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const label = el.querySelector<HTMLElement>('[data-magnetic-label]');
    const strength = Number(el.dataset.magnetic || 0.35);
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.classList.add('is-magnet');
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      if (label) label.style.transform = `translate(${x * strength * 0.5}px, ${y * strength * 0.5}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('is-magnet');
      el.style.transform = '';
      if (label) label.style.transform = '';
    });
  });
}

export {};
