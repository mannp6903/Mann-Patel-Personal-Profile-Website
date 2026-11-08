/**
 * "Tune in": Mann's real photo arrives as a lost signal (static, scanlines, colour split, tearing,
 * a slow roll) and the visitor tunes an FM dial to bring him in. At 104.3 the signal locks: the
 * photo snaps to full colour, a radar ping crosses the hero's dot field, the headline words flash,
 * and a short transmission types out. Based on information-gap curiosity: show enough to guess,
 * not enough to know, then reward the effort.
 *
 * Accessibility and fallbacks
 * - The dial is a real <input type="range"> (keyboard, screen readers, aria-valuetext); dragging
 *   sideways across the photo tunes too. Status changes are announced politely.
 * - Nobody is kept waiting: if the visitor doesn't touch it, it tunes itself after a few seconds.
 * - Reduced motion: starts locked, no animation; the dial still works and the picture degrades
 *   without moving.
 * - No WebGL (or a CPU-only renderer): the same effect in CSS filters over the real <img>.
 * - No JavaScript: the photo is shown clearly and the dial is hidden.
 * The animation runs only while something changes, and pauses off screen or in a background tab.
 */

const LOCK_AT = 104.3;
const MIN = 88.1;
const MAX = 107.9;
const RANGE = 7; // MHz either side of LOCK_AT over which the picture clears
const SNAP = 0.3; // MHz: this close snaps onto the station, like a real tuner's detent
const AUTO_TUNE_AFTER = 6500; // ms without interaction before it tunes itself

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_time;
uniform float u_d;      // detune: 0 = locked, 1 = no signal
uniform float u_flash;  // brief flash on lock
uniform vec2 u_cover;   // object-fit: cover scale for the texture

float hash(float n){return fract(sin(n)*43758.5453);}
float hash2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}

vec3 tex(vec2 uv){
  uv=(uv-.5)*u_cover+.5;
  return texture2D(u_tex,clamp(uv,0.,1.)).rgb;
}

void main(){
  float d=u_d;
  float t=u_time;
  vec2 uv=v;
  // Vertical roll when far off the station.
  float roll=smoothstep(.55,1.,d);
  uv.y=fract(uv.y+roll*fract(t*.23)*.6);
  // Horizontal tearing: bands slip sideways, worse the further off you are.
  float band=floor(uv.y*46.);
  float slip=(hash(band+floor(t*14.))-.5)*.16*d*d;
  float tear=step(1.-.18*d,hash(floor(uv.y*7.)+floor(t*5.)))*.09*d;
  float wob=sin(uv.y*90.+t*24.)*.004*d;
  uv.x+=slip+tear+wob;
  // Colour split.
  float off=.016*d+.0015*(1.-d);
  vec3 col=vec3(tex(uv+vec2(off,0.)).r,tex(uv).g,tex(uv-vec2(off,0.)).b);
  // Off-station the picture turns to lime monochrome (the site's signal colour).
  float l=dot(col,vec3(.2126,.7152,.0722));
  vec3 lime=vec3(.831,.973,.29);
  vec3 mono=mix(vec3(.03,.03,.035),lime,smoothstep(.05,.95,l));
  col=mix(col,mono,smoothstep(.15,.85,d));
  // Static.
  float s=hash2(floor(gl_FragCoord.xy*.7)+vec2(t*61.,t*37.));
  col=mix(col,vec3(s*.9),d*.5);
  // Scanlines, stronger off-station.
  col*=mix(.97,.72,d)+mix(.03,.28,d)*sin(gl_FragCoord.y*1.7);
  // Vignette.
  vec2 q=v-.5;
  col*=1.-dot(q,q)*mix(.35,.9,d);
  // Lock flash: a lime bloom that fades.
  col=mix(col,lime,u_flash*.35);
  gl_FragColor=vec4(col,1.);
}`;

export function mountTuner(root: HTMLElement) {
  const screen = root.querySelector<HTMLElement>('[data-tune-screen]');
  const img = root.querySelector<HTMLImageElement>('[data-tune-img]');
  const dial = root.querySelector<HTMLInputElement>('[data-tune-dial]');
  const freqOut = root.querySelector<HTMLElement>('[data-tune-freq]');
  const bars = root.querySelector<HTMLElement>('[data-tune-bars]');
  const status = root.querySelector<HTMLElement>('[data-tune-status]');
  const hero = root.closest<HTMLElement>('.hero');
  if (!screen || !img || !dial || !status) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('is-live');

  let freq = reduced ? LOCK_AT : MIN;
  let locked = false;
  let touched = false;
  let t0 = performance.now();
  let lastChange = performance.now();
  let flash = 0;
  let raf = 0;
  let onScreen = true;
  let visible = !document.hidden;

  const detune = (f: number) => {
    const dist = Math.abs(f - LOCK_AT);
    if (dist <= SNAP) return 0;
    const x = Math.min(1, dist / RANGE);
    return Math.pow(x, 0.7); // clears faster as you get close: you can feel the station
  };
  const fmt = (f: number) => f.toFixed(1);

  /* ── GL (optional) ─────────────────────────────────────── */
  let gl: WebGLRenderingContext | null = null;
  let U: Record<string, WebGLUniformLocation | null> = {};
  const canvas = root.querySelector<HTMLCanvasElement>('[data-tune-gl]');
  const forced = /[?&]fx=gl\b/.test(location.search);
  const startGl = () => {
    if (!canvas || reduced) return;
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, failIfMajorPerformanceCaveat: !forced });
    if (!gl) return;
    if (!forced) {
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const r = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(r)) {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        gl = null;
        return;
      }
    }
    const sh = (type: number, src: string) => {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl = null;
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['u_tex', 'u_res', 'u_time', 'u_d', 'u_flash', 'u_cover']) U[n] = gl.getUniformLocation(prog, n);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    } catch {
      gl = null;
      return;
    }
    gl.uniform1i(U.u_tex, 0);
    resize();
    root.classList.add('is-gl');
  };
  const resize = () => {
    if (!gl || !canvas) return;
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    // object-fit: cover, anchored to the centre.
    const ir = img.naturalWidth / img.naturalHeight || 1;
    const cr = r.width / r.height || 1;
    const cover = ir > cr ? [cr / ir, 1] : [1, ir / cr];
    gl.uniform2f(U.u_cover, cover[0], cover[1]);
    gl.uniform2f(U.u_res, canvas.width, canvas.height);
  };

  /* ── Drawing ───────────────────────────────────────────── */
  const paint = (now: number) => {
    const d = detune(freq);
    // Static freezes a few seconds after the last change: nothing moves forever on its own.
    const moving = !reduced && (now - lastChange < 4000 || flash > 0.01);
    const time = moving ? (now - t0) / 1000 : (lastChange - t0) / 1000;
    if (gl) {
      gl.uniform1f(U.u_time, time);
      gl.uniform1f(U.u_d, d);
      gl.uniform1f(U.u_flash, flash);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    // CSS fallback (and the look before GL starts): the same story in filters.
    screen.style.setProperty('--d', d.toFixed(3));
    root.classList.toggle('is-moving', !gl && moving && d > 0.001);
    flash *= 0.9;
    return moving && d > 0.001 ? true : flash > 0.01;
  };
  const loop = (now: number) => {
    raf = 0;
    if (paint(now) && onScreen && visible) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf && onScreen && visible) raf = requestAnimationFrame(loop);
  };

  /* ── State ─────────────────────────────────────────────── */
  const setFreq = (f: number, how: 'drag' | 'keyboard' | 'auto' | 'init') => {
    freq = Math.min(MAX, Math.max(MIN, f));
    const d = detune(freq);
    // Close enough snaps to the station, like a real tuner.
    if (d === 0) freq = LOCK_AT;
    dial.value = String(Math.round(freq * 10));
    if (freqOut) freqOut.textContent = fmt(freq);
    const strength = Math.round((1 - d) * 100);
    if (bars) bars.style.setProperty('--s', String(Math.round((1 - d) * 5)));
    dial.setAttribute('aria-valuetext', d === 0 ? `${fmt(freq)} FM, signal locked` : `${fmt(freq)} FM, signal ${strength}%`);
    root.style.setProperty('--sig', (1 - d).toFixed(3));
    lastChange = performance.now();
    if (d === 0 && !locked) lock(how);
    else if (d > 0 && locked) unlock();
    else if (!locked && how !== 'init' && how !== 'auto')
      status.textContent = strength > 85 ? 'Almost there…' : strength > 45 ? 'Getting closer…' : 'Searching…';
    kick();
  };

  const lock = (how: string) => {
    locked = true;
    flash = reduced ? 0 : 1;
    root.classList.add('is-locked');
    hero?.classList.remove('is-tuning');
    if (!reduced) {
      hero?.classList.remove('is-locked');
      void hero?.offsetWidth; // restart the headline flash
    }
    hero?.classList.add('is-locked');
    status.textContent = 'Signal locked: Mann Patel, Toronto.';
    if (how !== 'init') {
      // A radar ping across the hero's dot field, from the photo's centre.
      const r = screen.getBoundingClientRect();
      dispatchEvent(new CustomEvent('signal:ping', { detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 } }));
      if (how !== 'auto' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(18);
        } catch {
          /* not allowed: fine */
        }
      }
      dispatchEvent(new CustomEvent('tune:locked', { detail: { how } }));
    }
  };
  const unlock = () => {
    locked = false;
    root.classList.remove('is-locked');
    hero?.classList.remove('is-locked');
    status.textContent = 'Signal lost. Tune back to 104.3.';
  };

  /* ── Input: the dial, the keyboard, and dragging across the photo ── */
  dial.addEventListener('input', () => {
    touched = true;
    setFreq(Number(dial.value) / 10, 'drag');
  });
  dial.addEventListener('keydown', (e) => {
    touched = true;
    // Page Up / Page Down move 2 MHz, so the keyboard isn't 80 presses from the station.
    if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      setFreq(freq + (e.key === 'PageUp' ? 2 : -2), 'keyboard');
    }
  });

  let dragX: number | null = null;
  let dragFreq = freq;
  screen.addEventListener('dragstart', (e) => e.preventDefault());
  screen.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragX = e.clientX;
    dragFreq = freq;
    touched = true;
  });
  addEventListener(
    'pointermove',
    (e) => {
      if (dragX === null) return;
      const w = screen.getBoundingClientRect().width || 1;
      // One full photo width = the whole FM band.
      setFreq(dragFreq + ((e.clientX - dragX) / w) * (MAX - MIN), 'drag');
    },
    { passive: true },
  );
  const endDrag = () => (dragX = null);
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  /* ── Start ─────────────────────────────────────────────── */
  const begin = () => {
    setFreq(freq, 'init');
    kick();
  };
  // The show starts when the tuner is properly in view (on phones it sits below the buttons),
  // so nobody misses the moment it locks.
  let started = false;
  const start = () => {
    if (started || reduced) return;
    started = true;
    if (!touched) status.textContent = 'No signal. Drag the dial, or the photo, to tune in.';
    hero?.classList.add('is-tuning');
    // A short sweep shows it's alive, then it waits for the visitor.
    const sweepStart = performance.now() + 500;
    const sweepTo = 99.7; // close enough to make out a person, not close enough to know who
    const sweep = (now: number) => {
      if (touched) return;
      const k = Math.min(1, Math.max(0, (now - sweepStart) / 1600));
      const e = 1 - Math.pow(1 - k, 3);
      setFreq(MIN + (sweepTo - MIN) * e, 'auto');
      if (k < 1) requestAnimationFrame(sweep);
    };
    requestAnimationFrame(sweep);
    // Nobody is kept waiting: tune in for them.
    setTimeout(() => {
      if (touched || locked) return;
      const from = freq;
      const t1 = performance.now();
      const glide = (now: number) => {
        if (touched) return;
        const k = Math.min(1, (now - t1) / 1400);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        setFreq(from + (LOCK_AT - from) * e, 'auto');
        if (k < 1) requestAnimationFrame(glide);
      };
      requestAnimationFrame(glide);
    }, AUTO_TUNE_AFTER);
  };

  new IntersectionObserver(([en]) => {
    onScreen = en.isIntersecting;
    if (onScreen) kick();
  }).observe(screen);
  const seen = new IntersectionObserver(
    ([en]) => {
      if (!en.isIntersecting) return;
      seen.disconnect();
      start();
    },
    { threshold: 0.55 },
  );
  seen.observe(screen);
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) kick();
  });
  new ResizeObserver(() => {
    resize();
    kick();
  }).observe(screen);

  // The dial works at once (the CSS picture); WebGL takes over once the photo has loaded.
  begin();
  const glWhenReady = () => {
    startGl();
    kick();
  };
  if (img.complete && img.naturalWidth) glWhenReady();
  else img.addEventListener('load', glWhenReady, { once: true });
}
