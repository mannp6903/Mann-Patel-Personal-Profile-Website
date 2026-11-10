/**
 * Signal field: a WebGL dot map behind the home hero and the 404 page.
 *
 * Every dot is a point on a "map". A slow, domain-warped noise field (the carrier) makes some
 * dots brighter and draws a soft lime aurora toward the focus point (the portrait side). Around
 * the pointer the dots swell and turn lime; a click or tap sends out a radar ping, a ring that
 * lights the dots it passes: the "Found" idea, made physical.
 *
 * Rules (same as the rest of the site's motion):
 * - Progressive: the host element shows a static CSS dot grid. The canvas fades in over it only
 *   once the GPU has drawn a frame. No WebGL, a software-only GPU, or reduced motion: CSS dots stay.
 * - Never loops forever: time runs during the intro and while someone interacts, then eases to a stop.
 * - Paused off screen and in background tabs. Device pixel ratio capped for battery.
 * - Started lazily (idle time, or when it scrolls near view), so it never delays the page.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform vec3 u_ping[3];
uniform float u_gap;
uniform vec2 u_focus;
uniform float u_intro;
uniform float u_glow;
uniform float u_dpr;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}

void main(){
  vec2 px=gl_FragCoord.xy;
  float asp=u_res.x/u_res.y;
  float t=u_time;
  vec2 cell=floor(px/u_gap);
  vec2 c=(cell+.5)*u_gap;
  float d=length(px-c);

  // Soft aurora under the dots: one cheap octave per pixel.
  vec2 uv=px/u_res;
  vec2 fd=(uv-u_focus)*vec2(asp,1.);
  float focus=1.-smoothstep(0.,1.05,length(fd));
  float rv=1.-smoothstep(u_intro*1.7-.3,u_intro*1.7,length(fd));
  float soft=noise(vec2(uv.x*asp,uv.y)*1.6+vec2(t*.05,-t*.03));
  float ga=smoothstep(.35,1.,soft)*focus*focus*u_glow*.07*rv;
  vec3 lime=vec3(1.,1.,1.); // --signal (white since the Nov 2026 brand)

  // Far from any dot: only the aurora (most pixels stop here).
  if(d>u_gap*.24){gl_FragColor=vec4(lime*ga,ga);return;}

  // The dot: the carrier (domain-warped noise) is sampled at the dot centre.
  vec2 cu=c/u_res;
  vec2 q=vec2(cu.x*asp,cu.y)*1.35;
  vec2 w=vec2(fbm(q+vec2(0.,t*.045)),fbm(q+vec2(5.2,-t*.035)));
  float a=fbm(q+1.8*w+vec2(t*.02,0.));
  vec2 cfd=(cu-u_focus)*vec2(asp,1.);
  float cfocus=1.-smoothstep(0.,1.05,length(cfd));
  float glow=smoothstep(.42,.92,a)*(.25+.75*cfocus)*u_glow;
  float n=noise(cell*.085+vec2(t*.12,-t*.08));

  // Pointer swell.
  float R=150.*u_dpr;
  vec2 md=c-u_mouse;
  float m=u_hover*exp(-dot(md,md)/(2.*R*R));

  // Radar pings: rings that light the dots they pass.
  float ring=0.;
  for(int i=0;i<3;i++){
    vec3 pg=u_ping[i];
    if(pg.z>=0.){
      float age=t-pg.z;
      float rad=age*520.*u_dpr;
      float dd=length(c-pg.xy);
      float x=(dd-rad)/(34.*u_dpr);
      ring+=exp(-x*x)*exp(-age*1.15)*step(0.,age);
    }
  }
  // Intro: dots appear outward from the focus point.
  float crv=1.-smoothstep(u_intro*1.7-.3,u_intro*1.7,length(cfd));

  float s=.15+.35*n*n+glow*.7+m*1.3+ring*1.5;
  float r=u_gap*(.04+.06*clamp(s,0.,1.5));
  float dotA=1.-smoothstep(r-.9*u_dpr,r+.35*u_dpr,d);
  float lit=clamp(m*1.4+ring*1.3+glow*.22,0.,1.);
  vec3 ink=vec3(.6,.6,.6);
  vec3 col=mix(ink,lime,lit);
  float alpha=dotA*clamp(.06+.22*n*n+glow*.32+m*.9+ring*.9,0.,1.)*crv;
  vec3 outc=col*alpha+lime*ga*(1.-alpha);
  float outa=alpha+ga*(1.-alpha);
  gl_FragColor=vec4(outc,outa);
}`;

interface FieldOptions {
  /** Focus point of the aurora and the intro reveal, 0..1 from the left / bottom. */
  fx: number;
  fy: number;
  /** Aurora strength. */
  glow: number;
  /** Dot spacing in CSS px. */
  gap: number;
}

const PRESETS: Record<string, FieldOptions> = {
  hero: { fx: 0.74, fy: 0.55, glow: 1, gap: 22 },
  lost: { fx: 0.5, fy: 0.5, glow: 0.9, gap: 20 },
};

export function mountField(host: HTMLElement) {
  if (host.dataset.fieldReady) return;
  host.dataset.fieldReady = '1';
  const opts = PRESETS[host.dataset.field ?? 'hero'] ?? PRESETS.hero;
  const forced = /[?&]fx=gl\b/.test(location.search); // debugging on machines without a GPU
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-field__gl';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
    // A software-only GPU would draw this on the CPU: keep the static dots instead.
    failIfMajorPerformanceCaveat: !forced,
  });
  if (!gl) return;
  // Some browsers still hand out a CPU-only renderer: those keep the static CSS dots.
  if (!forced) {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return;
    }
  }

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  let U: Record<string, WebGLUniformLocation | null> = {};
  let ready = false;
  const parallel = gl.getExtension('KHR_parallel_shader_compile');

  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let onScreen = false;
  let visible = !document.hidden;
  // Time runs only while something is happening, then eases to a stop.
  let clock = 0;
  let speed = 1;
  let last = 0;
  let activeUntil = performance.now() + 7000;
  let introStart = -1;
  // Pointer.
  let mx = -9999;
  let my = -9999;
  let lx = -9999;
  let ly = -9999;
  let want = 0;
  let hover = 0;
  const pings: [number, number, number][] = [
    [0, 0, -1],
    [0, 0, -1],
    [0, 0, -1],
  ];
  let pingIdx = 0;

  // The focus point can follow the layout: CSS --fx / --fy (percent from the left / top) win.
  let fx = opts.fx;
  let fy = opts.fy;
  const readFocus = () => {
    const cs = getComputedStyle(host);
    const x = parseFloat(cs.getPropertyValue('--fx'));
    const y = parseFloat(cs.getPropertyValue('--fy'));
    fx = Number.isFinite(x) ? x / 100 : opts.fx;
    fy = Number.isFinite(y) ? 1 - y / 100 : opts.fy;
  };

  const resize = () => {
    readFocus();
    const r = host.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, r.width < 700 ? 1.5 : 1.25);
    w = Math.max(1, Math.round(r.width * dpr));
    h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  };

  const finishLink = () => {
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.remove();
      return false;
    }
    gl.useProgram(prog);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const name of ['u_res', 'u_time', 'u_mouse', 'u_hover', 'u_ping', 'u_gap', 'u_focus', 'u_intro', 'u_glow', 'u_dpr'])
      U[name] = gl.getUniformLocation(prog, name);
    ready = true;
    return true;
  };

  const draw = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    const target = now < activeUntil || want > 0 ? 1 : 0;
    speed += (target - speed) * 0.04;
    clock += dt * speed;
    lx += (mx - lx) * 0.18;
    ly += (my - ly) * 0.18;
    hover += (want - hover) * 0.08;
    if (introStart < 0) introStart = now;
    const intro = Math.min(1, (now - introStart) / 1600);

    gl.uniform2f(U.u_res, w, h);
    gl.uniform1f(U.u_time, clock);
    gl.uniform2f(U.u_mouse, lx * dpr, h - ly * dpr);
    gl.uniform1f(U.u_hover, hover);
    const flat: number[] = [];
    for (const [x, y, t0] of pings) flat.push(x * dpr, h - y * dpr, t0 < 0 || clock - t0 > 4 ? -1 : t0);
    gl.uniform3fv(U.u_ping, flat);
    gl.uniform1f(U.u_gap, opts.gap * dpr);
    gl.uniform2f(U.u_focus, fx, fy);
    gl.uniform1f(U.u_intro, 1 - Math.pow(1 - intro, 3));
    gl.uniform1f(U.u_glow, opts.glow);
    gl.uniform1f(U.u_dpr, dpr);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const pinging = pings.some(([, , t0]) => t0 >= 0 && clock - t0 < 3.2);
    return intro < 1 || speed > 0.002 || Math.abs(want - hover) > 0.002 || pinging;
  };

  const loop = (now: number) => {
    raf = 0;
    if (!ready) {
      if (parallel && !gl.getProgramParameter(prog, parallel.COMPLETION_STATUS_KHR)) {
        raf = requestAnimationFrame(loop);
        return;
      }
      if (!finishLink()) return;
      resize();
    }
    const more = draw(now);
    if (!host.classList.contains('is-gl')) host.classList.add('is-gl');
    if (more && onScreen && visible) raf = requestAnimationFrame(loop);
    else last = 0;
  };
  const kick = () => {
    if (!raf && onScreen && visible) raf = requestAnimationFrame(loop);
  };

  host.prepend(canvas);

  // Pointer: listen on the section that owns the field, so text on top still drives it.
  const zone = host.closest<HTMLElement>('[data-field-zone]') ?? host.parentElement ?? host;
  const local = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
    if (hover < 0.01) {
      lx = mx;
      ly = my;
    }
  };
  zone.addEventListener('pointermove', (e) => {
    local(e);
    want = 1;
    activeUntil = performance.now() + 1800;
    kick();
  });
  zone.addEventListener('pointerleave', () => {
    want = 0;
    kick();
  });
  const ping = (x: number, y: number) => {
    pings[pingIdx] = [x, y, clock];
    pingIdx = (pingIdx + 1) % pings.length;
    activeUntil = performance.now() + 3200;
    kick();
  };
  zone.addEventListener('pointerdown', (e) => {
    local(e);
    ping(mx, my);
  });
  // Other parts of the page can send a ping (the hero tuner does when the signal locks).
  addEventListener('signal:ping', (e) => {
    const d = (e as CustomEvent<{ x: number; y: number }>).detail;
    if (!d) return;
    const r = host.getBoundingClientRect();
    const x = d.x - r.left;
    const y = d.y - r.top;
    if (x < 0 || y < 0 || x > r.width || y > r.height) return;
    ping(x, y);
  });

  // One ping from the focus point when the field first appears.
  readFocus();
  const r0 = host.getBoundingClientRect();
  pings[0] = [r0.width * fx, r0.height * (1 - fy), 0.35];
  pingIdx = 1;

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) kick();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) kick();
  });
  new ResizeObserver(() => {
    if (!ready) return;
    resize();
    kick();
  }).observe(host);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    host.classList.remove('is-gl');
    canvas.remove();
  });
}

/** Start every field on the page after the main content has loaded, closest first. */
export function initFields() {
  const hosts = [...document.querySelectorAll<HTMLElement>('[data-field]')];
  if (!hosts.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        const go = () => mountField(e.target as HTMLElement);
        if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 1200 });
        else setTimeout(go, 200);
      }
    },
    { rootMargin: '300px 0px' },
  );
  hosts.forEach((h) => io.observe(h));
}
