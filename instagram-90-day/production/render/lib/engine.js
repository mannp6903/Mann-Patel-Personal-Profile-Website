/* Deterministic timeline engine. Nothing animates on its own: every frame is set by seek(t),
   so a render is frame-accurate and repeatable. Used by layouts.js and the renderer. */
(function () {
  const E = {};
  window.E = E;

  // ── easing ──
  const ease = {
    linear: (x) => x,
    out: (x) => 1 - Math.pow(1 - x, 4),
    in: (x) => x * x * x,
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    expo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    spring: (x) => 1 - Math.cos(x * Math.PI * 4.5) * Math.exp(-x * 6),
    step: (x) => (x < 1 ? 0 : 1),
  };
  E.ease = ease;

  // ── element helper ──
  E.h = function h(tag, attrs, ...kids) {
    const [name, ...cls] = tag.split('.');
    const el = document.createElement(name || 'div');
    if (cls.length) el.className = cls.join(' ');
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('data-') || k === 'role' || k === 'aria-label') el.setAttribute(k, v);
      else if (k === 'class') el.className += ' ' + v;
      else el.setAttribute(k, v);
    }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
    return el;
  };
  E.svg = function svg(tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
    for (const k of kids.flat()) if (k) el.append(k);
    return el;
  };

  // Inline rich text: *word* → lime/accent, _word_ → dim, ==word== → marker
  E.rich = function rich(str) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return esc(String(str))
      .replace(/==(.+?)==/g, '<span class="mk">$1</span>')
      .replace(/\*(.+?)\*/g, '<span class="acc">$1</span>')
      .replace(/_(.+?)_/g, '<span class="dim">$1</span>')
      .replace(/\[\[(.+?)\]\]/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');
  };
  E.plain = (str) => String(str).replace(/==|\*|_|\[\[|\]\]/g, '').replace(/\n/g, ' ');

  // ── timeline ──
  // A track animates one property of one element between two values.
  // Props: o (opacity), x, y (px), s (scale), r (deg), blur (px), clip ('l r t b' insets in %),
  // w (% width), type (0..1 text reveal), count (number), dash (svg stroke draw 0..1), bg (colour pair), custom fn.
  class Timeline {
    constructor() { this.tracks = []; this.fns = []; this.cues = []; this.cc = []; }
    to(el, prop, from, to, at, dur = 0.6, e = 'out') {
      if (!el) return this;
      this.tracks.push({ el, prop, from, to, at, dur: Math.max(dur, 1e-4), e: typeof e === 'function' ? e : ease[e] || ease.out });
      return this;
    }
    fn(at, dur, f) { this.fns.push({ at, dur, f }); return this; }
    sfx(at, name, gain = 1) { this.cues.push({ at, name, gain }); return this; }
    caption(at, until, text) { this.cc.push({ at, until, text: E.plain(text) }); return this; }
    // presets
    in(el, kind = 'up', at = 0, dur = 0.7, dist = 60) {
      if (!el) return this;
      const k = kind;
      if (k === 'fade') this.to(el, 'o', 0, 1, at, dur, 'linear');
      else if (k === 'up') this.to(el, 'o', 0, 1, at, dur * 0.6, 'linear').to(el, 'y', dist, 0, at, dur);
      else if (k === 'down') this.to(el, 'o', 0, 1, at, dur * 0.6, 'linear').to(el, 'y', -dist, 0, at, dur);
      else if (k === 'left') this.to(el, 'o', 0, 1, at, dur * 0.6, 'linear').to(el, 'x', dist, 0, at, dur);
      else if (k === 'right') this.to(el, 'o', 0, 1, at, dur * 0.6, 'linear').to(el, 'x', -dist, 0, at, dur);
      else if (k === 'pop') this.to(el, 'o', 0, 1, at, dur * 0.4, 'linear').to(el, 's', 0.6, 1, at, dur, 'back');
      else if (k === 'scale') this.to(el, 'o', 0, 1, at, dur * 0.6, 'linear').to(el, 's', 1.12, 1, at, dur, 'expo');
      else if (k === 'blur') this.to(el, 'o', 0, 1, at, dur * 0.7, 'linear').to(el, 'blur', 24, 0, at, dur);
      else if (k === 'wipe') this.to(el, 'clip', [0, 100, 0, 0], [0, 0, 0, 0], at, dur, 'inOut');
      else if (k === 'wipeDown') this.to(el, 'clip', [0, 0, 0, 100], [0, 0, 0, 0], at, dur, 'inOut');
      else if (k === 'rise') this.to(el, 'clip', [0, 0, 100, 0], [0, 0, 0, 0], at, dur, 'expo').to(el, 'y', dist * 0.6, 0, at, dur, 'expo');
      return this;
    }
    out(el, kind = 'fade', at = 0, dur = 0.4) {
      if (!el) return this;
      if (kind === 'fade') this.to(el, 'o', 1, 0, at, dur, 'linear');
      else if (kind === 'up') this.to(el, 'o', 1, 0, at, dur, 'linear').to(el, 'y', 0, -40, at, dur, 'in');
      else if (kind === 'wipe') this.to(el, 'clip', [0, 0, 0, 0], [100, 0, 0, 0], at, dur, 'inOut');
      return this;
    }
    // Words appear one by one (element must have been split with E.words)
    words(el, at, per = 0.08, kind = 'up', dur = 0.55) {
      const ws = el ? el.querySelectorAll('.word') : [];
      ws.forEach((w, i) => this.in(w, kind, at + i * per, dur, 34));
      return at + ws.length * per + dur;
    }
    type(el, at, cps = 22) {
      if (!el) return at;
      const n = (el.dataset.full || el.textContent).length;
      el.dataset.full = el.dataset.full || el.textContent;
      const dur = n / cps;
      this.to(el, 'type', 0, 1, at, dur, 'linear');
      return at + dur;
    }
    apply(t) {
      // group by element+prop; latest started track wins, earlier tracks hold their end value
      const state = new Map();
      const get = (el) => { let s = state.get(el); if (!s) state.set(el, (s = {})); return s; };
      const sorted = this._sorted || (this._sorted = this.tracks.slice().sort((a, b) => a.at - b.at));
      const firstSeen = new Set();
      for (const tr of sorted) {
        const key = tr.prop;
        const s = get(tr.el);
        const id = tr.el;
        const tag = key + '|' + (id.__tid || (id.__tid = Math.random().toString(36).slice(2)));
        if (t < tr.at) {
          if (!firstSeen.has(tag)) { s[key] = tr.from; firstSeen.add(tag); }
          continue;
        }
        firstSeen.add(tag);
        const p = Math.min(1, (t - tr.at) / tr.dur);
        s[key] = lerp(tr.from, tr.to, tr.e(p));
      }
      for (const [el, s] of state) write(el, s);
      for (const f of this.fns) if (t >= f.at) f.f(Math.min(1, (t - f.at) / Math.max(f.dur, 1e-4)), t);
    }
  }
  E.Timeline = Timeline;

  function lerp(a, b, p) {
    if (Array.isArray(a)) return a.map((v, i) => v + (b[i] - v) * p);
    if (typeof a === 'number') return a + (b - a) * p;
    return p < 1 ? a : b;
  }
  function write(el, s) {
    const tf = [];
    if (s.x != null || s.y != null) tf.push(`translate(${(s.x || 0).toFixed(2)}px, ${(s.y || 0).toFixed(2)}px)`);
    if (s.s != null) tf.push(`scale(${s.s.toFixed(4)})`);
    if (s.r != null) tf.push(`rotate(${s.r.toFixed(3)}deg)`);
    if (tf.length) el.style.transform = tf.join(' ');
    if (s.o != null) el.style.opacity = Math.max(0, Math.min(1, s.o)).toFixed(3);
    if (s.blur != null) el.style.filter = s.blur > 0.05 ? `blur(${s.blur.toFixed(2)}px)` : 'none';
    if (s.clip != null) { const [l, r, t, b] = s.clip; el.style.clipPath = `inset(${t.toFixed(2)}% ${r.toFixed(2)}% ${b.toFixed(2)}% ${l.toFixed(2)}%)`; }
    if (s.w != null) el.style.width = s.w.toFixed(2) + '%';
    if (s.hgt != null) el.style.height = s.hgt.toFixed(1) + 'px';
    if (s.type != null) {
      const full = el.dataset.full || '';
      const n = Math.round(full.length * s.type);
      el.textContent = full.slice(0, n);
      if (el.dataset.caret && s.type < 1) el.append(E.h('span.caret'));
    }
    if (s.count != null) el.textContent = (el.dataset.prefix || '') + Math.round(s.count).toLocaleString('en-CA') + (el.dataset.suffix || '');
    if (s.dash != null) { const len = el.getTotalLength ? el.getTotalLength() : 1000; el.style.strokeDasharray = `${len}`; el.style.strokeDashoffset = `${len * (1 - s.dash)}`; }
    if (s.top != null) el.style.top = s.top.toFixed(1) + 'px';
    if (s.left != null) el.style.left = s.left.toFixed(1) + 'px';
  }

  // Split text into word spans (keeps rich spans intact by splitting text nodes only)
  E.words = function words(el) {
    const walk = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          for (const p of parts) {
            if (!p) continue;
            if (/^\s+$/.test(p)) frag.append(document.createTextNode(p));
            else frag.append(E.h('span.word', null, p));
          }
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !child.classList.contains('word')) {
          if (child.classList.contains('mk') || child.classList.contains('acc') || child.classList.contains('dim')) {
            // wrap whole highlighted run as one word-group so the highlight stays continuous
            const wrap = E.h('span.word');
            child.replaceWith(wrap); wrap.append(child);
          } else walk(child);
        }
      }
    };
    walk(el);
    return el;
  };

  // Grain texture (generated once, deterministic)
  E.grainURL = (function () {
    let url = null;
    return () => {
      if (url) return url;
      const c = document.createElement('canvas'); c.width = c.height = 300;
      const g = c.getContext('2d'); const img = g.createImageData(300, 300);
      let seed = 1234567;
      const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
      for (let i = 0; i < img.data.length; i += 4) { const v = rnd() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0); url = `url(${c.toDataURL()})`; return url;
    };
  })();

  // ── reel composition ──
  // scenes: [{ el, tl, dur, tr: 'cut'|'fade'|'wipe'|'push'|'flash'|'zoom'|'slide', trDur }]
  E.Reel = class Reel {
    constructor(root, scenes, opts = {}) {
      this.root = root; this.scenes = scenes; this.fps = opts.fps || 30;
      let t = 0;
      for (const s of scenes) { s.start = t; t += s.dur; }
      this.duration = t;
      for (const s of scenes) { s.el.style.visibility = 'hidden'; root.append(s.el); }
      this.overlay = opts.overlay || null;
      if (this.overlay) root.append(this.overlay.el);
    }
    seek(t) {
      for (let i = 0; i < this.scenes.length; i++) {
        const s = this.scenes[i];
        const next = this.scenes[i + 1];
        const local = t - s.start;
        const trOut = next && next.tr && next.tr !== 'cut' ? next.trDur || 0.4 : 0;
        const visible = local >= 0 && local < s.dur + trOut;
        s.el.style.visibility = visible ? 'visible' : 'hidden';
        if (!visible) continue;
        s.tl.apply(Math.min(local, s.dur + trOut));
        // transitions in
        const trDur = s.trDur || 0.4;
        const p = s.tr && s.tr !== 'cut' && i > 0 ? Math.min(1, local / trDur) : 1;
        const e = ease.inOut(p);
        let tf = '', op = 1, clip = 'none', filt = '';
        if (p < 1) {
          if (s.tr === 'fade') op = e;
          else if (s.tr === 'wipe') clip = `inset(0 ${(100 - e * 100).toFixed(2)}% 0 0)`;
          else if (s.tr === 'wipeUp') clip = `inset(${(100 - e * 100).toFixed(2)}% 0 0 0)`;
          else if (s.tr === 'push') tf = `translateX(${((1 - e) * 1080).toFixed(1)}px)`;
          else if (s.tr === 'pushUp') tf = `translateY(${((1 - e) * 1920).toFixed(1)}px)`;
          else if (s.tr === 'zoom') { tf = `scale(${(1.25 - 0.25 * e).toFixed(4)})`; op = e; }
          else if (s.tr === 'blur') { op = e; filt = `blur(${((1 - e) * 30).toFixed(1)}px)`; }
          else if (s.tr === 'flash') op = 1;
          else if (s.tr === 'iris') clip = `circle(${(e * 120).toFixed(2)}% at 50% 50%)`;
        }
        // previous scene pushed out alongside
        if (next && next.tr && next.tr !== 'cut' && local > s.dur) {
          const q = ease.inOut(Math.min(1, (local - s.dur) / (next.trDur || 0.4)));
          if (next.tr === 'push') tf = `translateX(${(-q * 1080).toFixed(1)}px)`;
          if (next.tr === 'pushUp') tf = `translateY(${(-q * 1920).toFixed(1)}px)`;
          if (next.tr === 'zoom') { tf = `scale(${(1 + 0.15 * q).toFixed(4)})`; }
        }
        s.el.style.transform = tf || 'none';
        s.el.style.opacity = op;
        s.el.style.clipPath = clip;
        s.el.style.filter = filt || 'none';
        s.el.style.zIndex = String(i + 1);
        if (s.tr === 'flash' && local < (s.trDur || 0.25)) {
          s.el.style.filter = `brightness(${(1 + 3 * (1 - local / (s.trDur || 0.25))).toFixed(2)})`;
        }
      }
      if (this.overlay) this.overlay.tl.apply(t);
    }
    // gather absolute sound cues and captions
    cues() {
      const out = [];
      for (const s of this.scenes) for (const c of s.tl.cues) out.push({ at: +(s.start + c.at).toFixed(3), name: c.name, gain: c.gain });
      if (this.overlay) for (const c of this.overlay.tl.cues) out.push({ ...c });
      return out.sort((a, b) => a.at - b.at);
    }
    captions() {
      const out = [];
      for (const s of this.scenes) for (const c of s.tl.cc) out.push({ at: +(s.start + c.at).toFixed(3), until: +(s.start + Math.min(c.until, s.dur)).toFixed(3), text: c.text, scene: s.index });
      return out.sort((a, b) => a.at - b.at);
    }
  };
})();
