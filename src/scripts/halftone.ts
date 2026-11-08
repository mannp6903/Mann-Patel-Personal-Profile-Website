/**
 * Halftone portrait: draws the cut-out portrait as a field of dots on a <canvas>.
 * - On load the dots gather into the portrait (a scan from top to bottom).
 * - The pointer (or a finger) pushes nearby dots away and lights them up in the signal colour.
 * - "Show photo" crossfades to the real photo. The <img> stays in the page as the fallback
 *   (no JavaScript, no canvas, or before the image has loaded).
 * - Reduced motion: the dots are drawn once, still, and do not react to the pointer.
 * The animation loop runs only while something is moving, and stops when the hero is off screen.
 */

interface Field {
  n: number;
  hx: Float32Array; // home position (CSS px)
  hy: Float32Array;
  x: Float32Array; // current position
  y: Float32Array;
  r: Float32Array; // radius at rest
  t: Float32Array; // current tint toward the signal colour (0..1)
  d: Float32Array; // intro delay (ms)
  sx: Float32Array; // intro start position
  sy: Float32Array;
}

const BASE = [242, 241, 236]; // --text
const SIGNAL = [212, 248, 74]; // --signal
const BUCKETS = 5;
const bucketColor = (k: number) => {
  const m = k / (BUCKETS - 1);
  const c = BASE.map((b, i) => Math.round(b + (SIGNAL[i] - b) * m));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
};
const COLORS = Array.from({ length: BUCKETS }, (_, k) => bucketColor(k));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

export function mountHalftone(fig: HTMLElement) {
  const img = fig.querySelector<HTMLImageElement>('[data-ht-img]');
  const canvas = fig.querySelector<HTMLCanvasElement>('[data-ht-canvas]');
  const toggle = fig.querySelector<HTMLButtonElement>('[data-ht-toggle]');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!img || !canvas || !ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let field: Field | null = null;
  let w = 0;
  let h = 0;
  let pitch = 6;
  let raf = 0;
  let introStart = 0;
  let introDone = reduced;
  let px = -1e4;
  let py = -1e4;
  let pointerActive = false;
  let onScreen = true;

  const build = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    pitch = Math.max(3.8, w / 116);
    const cols = Math.floor(w / pitch);
    const rows = Math.floor(h / pitch);
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return false;
    // object-fit: contain, anchored to the bottom (like the <img>).
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cols / rows;
    let dw = cols;
    let dh = rows;
    if (ir > cr) dh = cols / ir;
    else dw = rows * ir;
    octx.drawImage(img, (cols - dw) / 2, rows - dh, dw, dh);
    let data: Uint8ClampedArray;
    try {
      data = octx.getImageData(0, 0, cols, rows).data;
    } catch {
      return false; // tainted canvas: keep the photo
    }

    // Collect visible cells and their luminance.
    const cells: number[] = [];
    let lo = 1;
    let hi = 0;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const o = (j * cols + i) * 4;
        const a = data[o + 3] / 255;
        if (a < 0.35) continue;
        const L = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
        cells.push(i, j, L);
        if (L < lo) lo = L;
        if (L > hi) hi = L;
      }
    }
    const n = cells.length / 3;
    const f: Field = {
      n,
      hx: new Float32Array(n),
      hy: new Float32Array(n),
      x: new Float32Array(n),
      y: new Float32Array(n),
      r: new Float32Array(n),
      t: new Float32Array(n),
      d: new Float32Array(n),
      sx: new Float32Array(n),
      sy: new Float32Array(n),
    };
    const span = Math.max(0.0001, hi - lo);
    const flat = hi - lo < 0.05; // e.g. white lettering: every dot full size
    const maxR = pitch * 0.6;
    for (let k = 0; k < n; k++) {
      const i = cells[k * 3];
      const j = cells[k * 3 + 1];
      const L = flat ? 1 : Math.pow((cells[k * 3 + 2] - lo) / span, 1.2);
      f.hx[k] = (i + 0.5) * pitch + (w - cols * pitch) / 2;
      f.hy[k] = (j + 0.5) * pitch + (h - rows * pitch);
      f.r[k] = maxR * (0.1 + 0.9 * L);
      // Intro: dots fall in from a loose cloud above, top rows first.
      f.sx[k] = f.hx[k] + (Math.random() - 0.5) * w * 0.9;
      f.sy[k] = f.hy[k] - h * (0.25 + Math.random() * 0.6);
      f.d[k] = (j / rows) * 650 + Math.random() * 380;
      f.x[k] = introDone ? f.hx[k] : f.sx[k];
      f.y[k] = introDone ? f.hy[k] : f.sy[k];
    }
    field = f;
    return true;
  };

  const draw = (now: number) => {
    if (!field) return false;
    const f = field;
    ctx.clearRect(0, 0, w, h);
    const paths = Array.from({ length: BUCKETS }, () => new Path2D());
    const R = Math.max(60, w * 0.15);
    const push = R * 0.3;
    let moving = false;
    const intro = !introDone;
    const elapsed = now - introStart;
    let introLeft = false;

    for (let k = 0; k < f.n; k++) {
      let x: number;
      let y: number;
      let scale = 1;
      let tint = 0;
      if (intro) {
        const t = Math.min(1, Math.max(0, (elapsed - f.d[k]) / 1100));
        if (t < 1) introLeft = true;
        const e = easeOut(t);
        x = f.sx[k] + (f.hx[k] - f.sx[k]) * e;
        y = f.sy[k] + (f.hy[k] - f.sy[k]) * e;
        scale = e;
        tint = t > 0 && t < 1 ? 1 - t : 0;
        f.x[k] = x;
        f.y[k] = y;
      } else {
        // Target: home, pushed away from the pointer.
        let tx = f.hx[k];
        let ty = f.hy[k];
        let target = 0;
        if (pointerActive) {
          const dx = f.hx[k] - px;
          const dy = f.hy[k] - py;
          const dist = Math.hypot(dx, dy);
          if (dist < R) {
            const s = 1 - dist / R;
            const amt = s * s * push;
            const inv = dist > 0.001 ? 1 / dist : 0;
            tx += dx * inv * amt;
            ty += dy * inv * amt;
            target = s;
          }
        }
        f.x[k] += (tx - f.x[k]) * 0.16;
        f.y[k] += (ty - f.y[k]) * 0.16;
        f.t[k] += (target - f.t[k]) * 0.12;
        if (Math.abs(tx - f.x[k]) > 0.05 || Math.abs(ty - f.y[k]) > 0.05 || Math.abs(target - f.t[k]) > 0.01) moving = true;
        x = f.x[k];
        y = f.y[k];
        tint = f.t[k];
        scale = 1 + tint * 0.55;
      }
      const r = f.r[k] * scale;
      if (r < 0.15) continue;
      const b = Math.min(BUCKETS - 1, Math.round(tint * (BUCKETS - 1)));
      const p = paths[b];
      p.moveTo(x + r, y);
      p.arc(x, y, r, 0, Math.PI * 2);
    }
    for (let b = 0; b < BUCKETS; b++) {
      ctx.fillStyle = COLORS[b];
      ctx.fill(paths[b]);
    }
    if (intro && !introLeft) introDone = true;
    return intro || moving;
  };

  const loop = (now: number) => {
    raf = 0;
    const more = draw(now);
    if (more && onScreen) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf && onScreen) raf = requestAnimationFrame(loop);
  };

  const start = () => {
    if (!build()) return;
    fig.classList.add('is-ready');
    if (reduced) {
      draw(performance.now());
      return;
    }
    introStart = performance.now() + 150;
    kick();
  };

  // Pointer (mouse, pen, touch drag).
  if (!reduced) {
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    fig.addEventListener('pointermove', (e) => {
      local(e);
      pointerActive = true;
      kick();
    });
    fig.addEventListener('pointerdown', (e) => {
      local(e);
      pointerActive = true;
      kick();
    });
    const leave = () => {
      pointerActive = false;
      kick();
    };
    fig.addEventListener('pointerleave', leave);
    fig.addEventListener('pointerup', (e) => e.pointerType !== 'mouse' && leave());
    fig.addEventListener('pointercancel', leave);
  }

  // Pause off screen.
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) kick();
  }).observe(fig);

  // Rebuild on resize (keeps the intro finished).
  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!field) return;
      const r = canvas.getBoundingClientRect();
      if (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1) return;
      introDone = true;
      if (build()) draw(performance.now());
    }, 150);
  }).observe(canvas);

  // Dots ⇄ photo.
  toggle?.addEventListener('click', () => {
    const photo = !fig.classList.contains('is-photo');
    fig.classList.toggle('is-photo', photo);
    toggle.setAttribute('aria-pressed', String(photo));
  });

  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
}
