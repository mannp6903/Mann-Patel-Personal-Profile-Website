// A folded ribbon, lit and projected in 3D. The same frame generates the static poster.
const width = 640;
const height = 540;
const turns = 88;
const bands = 14;

export const signalViewBox = { width, height };

type Point = { x: number; y: number; z: number };
type Face = { points: [Point, Point, Point, Point]; light: number; depth: number; gleam: number };

export function signalFrame(pitch: number, yaw: number, roll: number, phase: number): Face[] {
  const cx = Math.cos(pitch), sx = Math.sin(pitch);
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cz = Math.cos(roll), sz = Math.sin(roll);
  const vertices: Point[][] = [];

  for (let i = 0; i <= turns; i++) {
    const angle = (i / turns) * Math.PI * 2;
    const wave = Math.cos(angle * 3 + 0.55);
    const radius = 1.08 + 0.22 * wave + 0.05 * Math.cos(angle * 6 + 0.3);
    const fold = angle * 2 + 0.75 * Math.sin(angle * 2 - 0.2 + phase);
    const slice: Point[] = [];

    for (let j = 0; j <= bands; j++) {
      const t = (j / bands) * 2 - 1;
      const cross = t * (0.29 + 0.055 * wave);
      const r = radius + cross * Math.cos(fold);
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle * 2 + 0.2) * 0.28 + cross * Math.sin(fold) + (1 - t * t) * 0.08;
      const z = Math.sin(angle) * r;
      const ax = x * cy + z * sy;
      const az = z * cy - x * sy;
      const ay = y * cx - az * sx;
      slice.push({ x: ax * cz - ay * sz, y: ax * sz + ay * cz, z: y * sx + az * cx });
    }
    vertices.push(slice);
  }

  const projected = vertices.map((slice) => slice.map(({ x, y, z }) => {
    const scale = 178 * (4.8 / (4.8 - z));
    return { x: width / 2 + x * scale, y: height / 2 + y * scale, z };
  }));
  const faces: Face[] = [];

  for (let i = 0; i < turns; i++) {
    for (let j = 0; j < bands; j++) {
      const a = vertices[i][j];
      const b = vertices[i + 1][j];
      const d = vertices[i][j + 1];
      const ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z;
      const vx = d.x - a.x, vy = d.y - a.y, vz = d.z - a.z;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const facing = nz >= 0 ? 1 : -1;
      const inv = facing / (Math.hypot(nx, ny, nz) || 1);
      const diffuse = Math.max(0, (-0.38 * nx - 0.62 * ny + 0.68 * nz) * inv);
      const specular = Math.max(0, (-0.21 * nx - 0.35 * ny + 0.91 * nz) * inv) ** 15;
      const t = (j + 0.5) / bands;
      const satin = 0.055 * Math.cos(t * Math.PI * 10 + i * 0.075);
      const edge = j === 0 || j === bands - 1 ? 0.13 : 0;
      const depth = (a.z + b.z + d.z + vertices[i + 1][j + 1].z) / 4;
      const light = Math.max(0.045, Math.min(1, 0.13 + 0.62 * diffuse + 0.42 * specular + satin + edge + depth * 0.08));
      const points: Face['points'] = [projected[i][j], projected[i + 1][j], projected[i + 1][j + 1], projected[i][j + 1]];
      faces.push({ points, light, depth, gleam: specular });
    }
  }

  return faces.sort((a, b) => a.depth - b.depth);
}

export const signalRestPose = [1.02, -0.36, -0.38, 0] as const;

export function signalColor(light: number, gleam: number): string {
  const vivid = light ** 0.91;
  const silver = gleam * light;
  return `rgb(${Math.round(13 + vivid * 204 + silver * 26)}, ${Math.round(23 + vivid * 224 + silver * 7)}, ${Math.round(15 + vivid * 69 + silver * 88)})`;
}

export function mountSignalSculpture(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-signal-canvas]');
  const stage = root.querySelector<HTMLElement>('[data-signal-stage]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-signal-toggle]');
  if (!canvas || !stage || !toggle) return;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let paused = false;
  let frame = 0;
  let previous = 0;
  let clock = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0;

  function draw(time: number) {
    frame = 0;
    if (!visible || document.hidden || motion.matches || paused) return;

    const elapsed = previous ? time - previous : 16;
    // Keep the simulation at 30 fps even on higher-refresh displays.
    if (previous && elapsed < 30) {
      frame = requestAnimationFrame(draw);
      return;
    }
    previous = time;
    clock += Math.min(elapsed, 50) / 1000;
    const follow = 1 - Math.exp(-elapsed / 135);
    x += (targetX - x) * follow;
    y += (targetY - y) * follow;

    const [pitch, yaw, roll] = signalRestPose;
    const faces = signalFrame(pitch + y * 0.34, yaw + x * 0.58, roll + Math.sin(clock * 0.62) * 0.08, Math.sin(clock * 0.42) * 0.48);
    context!.clearRect(0, 0, width, height);
    for (const face of faces) {
      const [a, b, c, d] = face.points;
      context!.beginPath();
      context!.moveTo(a.x, a.y);
      context!.lineTo(b.x, b.y);
      context!.lineTo(c.x, c.y);
      context!.lineTo(d.x, d.y);
      context!.closePath();
      context!.fillStyle = context!.strokeStyle = signalColor(face.light, face.gleam);
      context!.fill();
      context!.stroke();
    }
    root.dataset.signalFrame = '';
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    const active = visible && !document.hidden && !motion.matches && !paused;
    toggle!.hidden = motion.matches;
    if (motion.matches) delete root.dataset.signalFrame;
    if (active && !frame) {
      previous = 0;
      frame = requestAnimationFrame(draw);
    } else if (!active && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const renderWidth = Math.round(Math.min(width * 1.5, stage!.clientWidth * pixelRatio));
    const renderHeight = Math.round((renderWidth * height) / width);
    if (!renderWidth || (renderWidth === canvas!.width && renderHeight === canvas!.height)) return;
    canvas!.width = renderWidth;
    canvas!.height = renderHeight;
    context!.setTransform(canvas!.width / width, 0, 0, canvas!.height / height, 0, 0);
    delete root.dataset.signalFrame;
    sync();
  }

  function point(event: PointerEvent) {
    const bounds = stage!.getBoundingClientRect();
    targetX = (2 * (event.clientX - bounds.left)) / bounds.width - 1;
    targetY = (2 * (event.clientY - bounds.top)) / bounds.height - 1;
  }

  stage.addEventListener('pointermove', point, { passive: true });
  stage.addEventListener('pointerdown', point, { passive: true });
  stage.addEventListener('pointerleave', () => { targetX = targetY = 0; });
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    sync();
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(stage);
  new ResizeObserver(resize).observe(stage);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  resize();
  sync();
}
