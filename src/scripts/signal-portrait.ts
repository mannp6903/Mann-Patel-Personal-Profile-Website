/**
 * Signal portrait: draws an image (Mann's cut-out portrait, or the 404 lettering) as a field of
 * horizontal scan lines that oscillate like a radio signal. Where the image is brighter, the
 * wave is taller and denser, so the face appears out of the waveform.
 *
 * - On load each line is traced left to right behind a lime "write head", top lines first.
 * - Under the pointer (or a finger) the waves swell, flow and glow lime; they settle when it leaves.
 * - "Show photo" crossfades to the real photo. The <img> stays in the page as the fallback
 *   (no JavaScript, no canvas, or before the image has loaded).
 * - Reduced motion: drawn once, still, with no pointer effect.
 * The animation loop runs only while something moves, and pauses when the figure is off screen.
 */

interface Line {
  y: number; // baseline (CSS px)
  amp: Float32Array; // wave height per sample
  phase: Float32Array; // accumulated phase per sample
  mask: Uint8Array; // 1 where the image is opaque (the figure)
  tone: Uint8Array; // 0, 1 or 2: line thickness from the brightness (engraving-style tone)
  fade: Uint8Array; // background line strength: 0, 1, 2, or 3 = not drawn (soft oval vignette)
}

const INK = 'rgb(242 241 236)'; // --text
const FAINT = ['rgb(242 241 236 / 0.035)', 'rgb(242 241 236 / 0.07)', 'rgb(242 241 236 / 0.12)'];
const SIGNAL = '212 248 74'; // --signal
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function mountSignalPortrait(fig: HTMLElement) {
  const img = fig.querySelector<HTMLImageElement>('[data-portrait-img]');
  const canvas = fig.querySelector<HTMLCanvasElement>('[data-portrait-canvas]');
  const toggle = fig.querySelector<HTMLButtonElement>('[data-portrait-toggle]');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!img || !canvas || !ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lines: Line[] = [];
  let w = 0;
  let h = 0;
  let dx = 1.25;
  let gap = 6;
  let raf = 0;
  let introStart = 0;
  let introDone = reduced;
  let onScreen = true;
  // Pointer lens: target position, eased position and strength.
  let px = 0;
  let py = 0;
  let lx = 0;
  let ly = 0;
  let want = 0; // 1 while the pointer is over the figure
  let lens = 0; // eased 0..1
  let flow = 0; // phase offset that makes the waves travel under the lens

  // Long loops hand control back to the browser every few milliseconds, so building the portrait
  // never blocks a tap or a scroll (no long tasks on slow phones).
  let sliceStart = 0;
  const maybeYield = async () => {
    if (performance.now() - sliceStart < 8) return;
    await new Promise<void>((r) => setTimeout(r, 0));
    sliceStart = performance.now();
  };

  const build = async () => {
    sliceStart = performance.now();
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    w = rect.width;
    h = rect.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    gap = Math.max(4, h / 124);
    dx = w < 480 ? 1.5 : 1.25;
    const cols = Math.ceil(w / dx);
    const rows = Math.floor(h / gap);
    // One sample per point along each line; the down-scale averages the band around it.
    const off = document.createElement('canvas');
    off.width = cols;
    off.height = rows;
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return false;
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = w / (rows * gap);
    let dw = cols;
    let dh = rows;
    if (ir > cr) dh = rows * (cr / ir);
    else dw = cols * (ir / cr);
    octx.drawImage(img, (cols - dw) / 2, rows - dh, dw, dh); // contain, anchored to the bottom
    let data: Uint8ClampedArray;
    try {
      data = octx.getImageData(0, 0, cols, rows).data;
    } catch {
      return false; // tainted canvas: keep the photo
    }

    let lo = 1;
    let hi = 0;
    const lum = new Float32Array(cols * rows);
    const alpha = new Float32Array(cols * rows);
    for (let k = 0; k < cols * rows; k++) {
      const o = k * 4;
      alpha[k] = data[o + 3] / 255;
      const L = (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
      lum[k] = L;
      if (alpha[k] > 0.35) {
        if (L < lo) lo = L;
        if (L > hi) hi = L;
      }
    }
    // Sharpen (unsharp mask on the sample grid) so eyes, nose and mouth keep their edges.
    const sharp = new Float32Array(lum.length);
    for (let j = 0; j < rows; j++) {
      if (j % 8 === 0) await maybeYield();
      for (let i = 0; i < cols; i++) {
        let sum = 0;
        let cnt = 0;
        for (let v = -1; v <= 1; v++) {
          const jj = j + v;
          if (jj < 0 || jj >= rows) continue;
          for (let u = -2; u <= 2; u++) {
            const ii = i + u;
            if (ii < 0 || ii >= cols) continue;
            sum += lum[jj * cols + ii];
            cnt++;
          }
        }
        const k = j * cols + i;
        sharp[k] = Math.min(1, Math.max(0, lum[k] + 1.1 * (lum[k] - sum / cnt)));
      }
    }
    lum.set(sharp);
    const span = Math.max(0.0001, hi - lo);
    const flat = hi - lo < 0.05; // e.g. white lettering: every part of the figure at full strength

    const top = h - rows * gap;
    const next: Line[] = [];
    for (let j = 0; j < rows; j++) {
      if (j % 16 === 0) await maybeYield();
      const amp = new Float32Array(cols);
      const phase = new Float32Array(cols);
      const mask = new Uint8Array(cols);
      const tone = new Uint8Array(cols);
      const fade = new Uint8Array(cols);
      const ly = top + (j + 0.5) * gap;
      let ph = j * 0.9;
      for (let i = 0; i < cols; i++) {
        const k = j * cols + i;
        const a = Math.min(1, alpha[k] * 1.4);
        // A strong curve keeps the dark sweater and hair calm so the face stands out.
        const L = a < 0.05 ? 0 : flat ? 1 : Math.pow(Math.max(0, (lum[k] - lo) / span), 1.7);
        // Brighter → taller and faster wave (frequency modulation), so it reads as more "ink".
        ph += (0.42 + 0.95 * L) * dx;
        phase[i] = ph;
        amp[i] = gap * 0.62 * L * a;
        mask[i] = a > 0.35 ? 1 : 0;
        tone[i] = L < 0.22 ? 0 : L < 0.55 ? 1 : 2;
        // Elliptical vignette for the faint background lines: strong near the figure, gone at the edges.
        const ex = (i * dx - w / 2) / (w * 0.52);
        const ey = (ly - h * 0.58) / (h * 0.62);
        const e = ex * ex + ey * ey;
        fade[i] = e < 0.42 ? 2 : e < 0.7 ? 1 : e < 1 ? 0 : 3;
      }
      next.push({ y: ly, amp, phase, mask, tone, fade });
    }
    lines = next;
    return true;
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    const R = Math.max(70, w * 0.2);

    // Ease the lens toward the pointer and its strength toward on/off.
    lx += (px - lx) * 0.22;
    ly += (py - ly) * 0.22;
    lens += (want - lens) * 0.12;
    if (lens > 0.002) flow += 0.09 * lens;
    const active = lens > 0.002;

    const faint = [new Path2D(), new Path2D(), new Path2D()];
    const ink = [new Path2D(), new Path2D(), new Path2D()];
    const n = lines.length;

    for (let j = 0; j < n; j++) {
      const ln = lines[j];
      const last = ln.amp.length;
      let inFigure = false;
      let lastTone = -1;
      let lastFade = 3;
      let prevX = 0;
      let prevY = 0;
      for (let i = 0; i < last; i++) {
        const x = i * dx;
        let a = ln.amp[i];
        let ph = ln.phase[i];
        if (active) {
          const ddx = x - lx;
          const ddy = ln.y - ly;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < R * R) {
            const s = 1 - Math.sqrt(d2) / R;
            const e = s * s * lens;
            a = a * (1 + 1.3 * e) + gap * 0.18 * e; // swell, and stir even the flat parts
            ph += flow * e * 1.6;
          }
        }
        const y = ln.y + Math.sin(ph) * a;
        const f = ln.fade[i];
        if (f < 3) {
          const fp = faint[f];
          if (lastFade === 3 || i === 0) fp.moveTo(x, y);
          else {
            if (f !== lastFade) fp.moveTo(prevX, prevY);
            fp.lineTo(x, y);
          }
        }
        lastFade = f;
        if (ln.mask[i]) {
          const t = ln.tone[i];
          const path = ink[t];
          if (!inFigure) path.moveTo(x, y);
          else {
            if (t !== lastTone) path.moveTo(prevX, prevY);
            path.lineTo(x, y);
          }
          lastTone = t;
          inFigure = true;
        } else {
          inFigure = false;
          lastTone = -1;
        }
        prevX = x;
        prevY = y;
      }
    }

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 1;
    faint.forEach((path, f) => {
      ctx.strokeStyle = FAINT[f];
      ctx.stroke(path);
    });
    const k = w < 480 ? 0.8 : 1;
    ctx.strokeStyle = INK;
    [0.65, 1.15, 1.75].forEach((lw, t) => {
      ctx.lineWidth = lw * k;
      ctx.stroke(ink[t]);
    });

    // Lime glow on the lines around the pointer (tints only what is already drawn).
    if (active) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 1.05);
      g.addColorStop(0, `rgb(${SIGNAL} / ${0.95 * lens})`);
      g.addColorStop(0.6, `rgb(${SIGNAL} / ${0.45 * lens})`);
      g.addColorStop(1, `rgb(${SIGNAL} / 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(lx - R * 1.1, ly - R * 1.1, R * 2.2, R * 2.2);
      ctx.restore();
    }

    const settling = Math.abs(want - lens) > 0.002 || (want > 0 && (Math.abs(px - lx) > 0.3 || Math.abs(py - ly) > 0.3));
    return settling || want > 0;
  };

  // The intro traces each line from the left with a lime write head. It reveals a snapshot of the
  // finished drawing row by row, so each frame is one clipped copy, not a full redraw: cheap on
  // slow phones and nothing blocks the page while it plays.
  let snap: HTMLCanvasElement | null = null;
  /** The resting drawing (no lens), painted into its own canvas a band of rows at a time. */
  const snapshot = async () => {
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const sx = off.getContext('2d');
    if (!sx) return;
    sx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    sx.lineJoin = 'round';
    sx.lineCap = 'round';
    const k = w < 480 ? 0.8 : 1;
    const widths = [0.65, 1.15, 1.75];
    for (let j0 = 0; j0 < lines.length; j0 += 14) {
      await maybeYield();
      const faint = [new Path2D(), new Path2D(), new Path2D()];
      const ink = [new Path2D(), new Path2D(), new Path2D()];
      for (let j = j0; j < Math.min(lines.length, j0 + 14); j++) {
        const ln = lines[j];
        let inFigure = false;
        let lastTone = -1;
        let lastFade = 3;
        let prevX = 0;
        let prevY = 0;
        for (let i = 0; i < ln.amp.length; i++) {
          const x = i * dx;
          const y = ln.y + Math.sin(ln.phase[i]) * ln.amp[i];
          const f = ln.fade[i];
          if (f < 3) {
            const fp = faint[f];
            if (lastFade === 3 || i === 0) fp.moveTo(x, y);
            else {
              if (f !== lastFade) fp.moveTo(prevX, prevY);
              fp.lineTo(x, y);
            }
          }
          lastFade = f;
          if (ln.mask[i]) {
            const t = ln.tone[i];
            if (!inFigure) ink[t].moveTo(x, y);
            else {
              if (t !== lastTone) ink[t].moveTo(prevX, prevY);
              ink[t].lineTo(x, y);
            }
            lastTone = t;
            inFigure = true;
          } else {
            inFigure = false;
            lastTone = -1;
          }
          prevX = x;
          prevY = y;
        }
      }
      sx.lineWidth = 1;
      faint.forEach((path, f) => {
        sx.strokeStyle = FAINT[f];
        sx.stroke(path);
      });
      sx.strokeStyle = INK;
      widths.forEach((lw, t) => {
        sx.lineWidth = lw * k;
        sx.stroke(ink[t]);
      });
    }
    snap = off;
  };
  const reveal = (now: number) => {
    const elapsed = now - introStart;
    const clip = new Path2D();
    const heads: [number, number][] = [];
    let left = false;
    const n = lines.length;
    for (let j = 0; j < n; j++) {
      const t = Math.min(1, Math.max(0, (elapsed - j * 9) / 1300));
      if (t < 1) left = true;
      if (t <= 0) continue;
      const x = easeOut(t) * w;
      const y = lines[j].y;
      const top = j === 0 ? 0 : y - gap / 2;
      const bottom = j === n - 1 ? h : y + gap / 2;
      clip.rect(0, top, x, bottom - top);
      if (t < 1) heads.push([x, y]);
    }
    ctx.clearRect(0, 0, w, h);
    if (snap) {
      ctx.save();
      ctx.clip(clip);
      ctx.drawImage(snap, 0, 0, w, h);
      ctx.restore();
    }
    ctx.fillStyle = `rgb(${SIGNAL})`;
    for (const [x, y] of heads) {
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    return left;
  };

  const loop = (now: number) => {
    raf = 0;
    let more: boolean;
    if (!introDone) {
      more = reveal(now);
      if (!more) {
        introDone = true;
        more = want > 0;
      }
    } else more = draw();
    if (more && onScreen) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf && onScreen) raf = requestAnimationFrame(loop);
  };

  // A portrait that starts hidden (phones: the art opens on request) has no size yet; it starts
  // when it first gets one (see the ResizeObserver below).
  let starting = false;
  let started = false;
  const start = async () => {
    if (starting || started) return;
    starting = true;
    const ok = await build();
    starting = false;
    if (!ok) return;
    started = true;
    if (reduced) {
      fig.classList.add('is-ready');
      draw();
      return;
    }
    await snapshot();
    fig.classList.add('is-ready');
    introStart = performance.now() + 60;
    reveal(introStart);
    kick();
  };

  // Pointer (mouse, pen, touch drag).
  if (!reduced) {
    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (lens < 0.01) {
        lx = px;
        ly = py;
      }
    };
    const enter = (e: PointerEvent) => {
      local(e);
      want = 1;
      kick();
    };
    fig.addEventListener('pointermove', enter);
    fig.addEventListener('pointerdown', enter);
    const leave = () => {
      want = 0;
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

  // Rebuild when the size really changes (keeps the intro finished).
  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!started) {
        if (img.complete && img.naturalWidth) void start();
        return;
      }
      if (!lines.length) return;
      const r = canvas.getBoundingClientRect();
      if (Math.abs(r.width - w) < 1 && Math.abs(r.height - h) < 1) return;
      introDone = true;
      build().then((ok) => ok && draw());
    }, 150);
  }).observe(canvas);

  // Signal ⇄ photo.
  toggle?.addEventListener('click', () => {
    const photo = !fig.classList.contains('is-photo');
    fig.classList.toggle('is-photo', photo);
    toggle.setAttribute('aria-pressed', String(photo));
  });

  // Start once the photo is in and the page has painted, so the portrait never delays the first view.
  const go = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => void start(), { timeout: 600 });
    else setTimeout(() => void start(), 50);
  };
  if (img.complete && img.naturalWidth) go();
  else img.addEventListener('load', go, { once: true });
}
