/**
 * Scroll marquee (`[data-marquee]`): rows of giant type that slide sideways only while the page
 * scrolls (in opposite directions per row) and lean with the scroll speed, then settle. Because
 * it moves only with the reader's own scrolling, nothing on the page moves by itself (WCAG 2.2.2).
 * Each row's track holds two identical copies, so the offset wraps without a seam.
 */
export function initMarquee() {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-marquee]')];
  if (!roots.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rows = roots.flatMap((root) =>
    [...root.querySelectorAll<HTMLElement>('[data-mq-row]')].map((row) => ({
      root,
      track: row.querySelector<HTMLElement>('[data-mq-track]')!,
      dir: Number(row.dataset.mqRow) || 1,
      speed: Number(row.dataset.mqSpeed) || 0.6,
      start: Number(row.dataset.mqStart) || 0,
      width: 0,
      offset: -1,
    })),
  );
  const measure = () =>
    rows.forEach((r) => {
      r.width = r.track.scrollWidth / 2;
      // Continue from the offset the CSS starts at (a share of the whole track), so nothing jumps.
      if (r.offset < 0 && r.width) r.offset = (r.start * r.width * 2) % r.width;
    });
  measure();
  new ResizeObserver(measure).observe(document.body);

  let lastY = scrollY;
  let vel = 0;
  let skew = 0;
  let raf = 0;
  const visible = new Set<HTMLElement>();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement);
  });
  roots.forEach((r) => io.observe(r));

  const frame = () => {
    raf = 0;
    const y = scrollY;
    const dy = y - lastY;
    lastY = y;
    vel += (dy - vel) * 0.25;
    skew += (Math.max(-10, Math.min(10, vel * 0.35)) - skew) * 0.18;
    for (const r of rows) {
      if (!visible.has(r.root) || !r.width || r.offset < 0) continue;
      r.offset = (((r.offset + dy * r.speed * r.dir) % r.width) + r.width) % r.width;
      r.track.style.transform = `translate3d(${(-r.offset).toFixed(2)}px,0,0) skewX(${(-skew * r.dir).toFixed(2)}deg)`;
    }
    if (Math.abs(vel) > 0.05 || Math.abs(skew) > 0.05) raf = requestAnimationFrame(frame);
  };
  addEventListener(
    'scroll',
    () => {
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true },
  );
}
