/* Browser-side API used by render.mjs: build a slide, a static Reel cover, or a playable Reel,
   and report layout problems (overflow, text outside the safe zone, text too small). */
(function () {
  const root = document.getElementById('root');
  const FMT = { slide: { W: 1080, H: 1350 }, reel: { W: 1080, H: 1920 } };
  // Text must sit inside these boxes (Reels: clear of the top bar, caption stack and action rail)
  const TEXT_SAFE = { slide: { x0: 48, x1: 1032, y0: 40, y1: 1316 }, reel: { x0: 60, x1: 984, y0: 250, y1: 1490 } };
  const MIN_PX = { slide: 24, reel: 28 };

  function makeFrame(fmt, dir) {
    root.innerHTML = '';
    const fr = document.createElement('div');
    fr.className = `frame ${fmt} d-${dir || 'night'}`;
    root.append(fr);
    return fr;
  }

  function ctxFor(fmt, opts = {}) {
    return { fmt, W: FMT[fmt].W, H: FMT[fmt].H, dir: opts.dir, meta: opts.meta, wordmark: opts.wordmark, grain: opts.grain };
  }

  function check(scope, fmt, label) {
    const issues = [];
    const S = TEXT_SAFE[fmt];
    const fr = scope.getBoundingClientRect();
    scope.querySelectorAll('[data-check], .label, .badge, .pageno, .swipe').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
      let p = el, hidden = false; while (p && p !== scope) { if (+getComputedStyle(p).opacity < 0.05) { hidden = true; break; } p = p.parentElement; }
      if (hidden) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const x0 = r.left - fr.left, x1 = r.right - fr.left, y0 = r.top - fr.top, y1 = r.bottom - fr.top;
      const txt = (el.textContent || '').trim().slice(0, 50);
      if (el.scrollWidth > el.clientWidth + 2 && cs.whiteSpace === 'nowrap') issues.push(`${label}: text clipped "${txt}"`);
      if (x0 < S.x0 - 1 || x1 > S.x1 + 1) issues.push(`${label}: outside horizontal safe zone (${Math.round(x0)}–${Math.round(x1)}) "${txt}"`);
      if (y0 < S.y0 - 1 || y1 > S.y1 + 1) issues.push(`${label}: outside vertical safe zone (${Math.round(y0)}–${Math.round(y1)}) "${txt}"`);
      const fs = parseFloat(cs.fontSize);
      if (el.hasAttribute('data-check') && fs < MIN_PX[fmt]) issues.push(`${label}: essential text ${fs}px < ${MIN_PX[fmt]}px "${txt}"`);
    });
    // lines that overflow their headline box
    scope.querySelectorAll('.h .line').forEach((ln) => {
      const box = ln.parentElement.getBoundingClientRect(); const r = ln.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(ln); const tr = range.getBoundingClientRect();
      if (tr.right > box.right + 2) issues.push(`${label}: headline line wider than its box "${ln.textContent.slice(0, 40)}"`);
    });
    return issues;
  }

  window.stage = {
    async ready() { await document.fonts.ready; await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))); },

    // Static frame (carousel slide, still, or a Reel cover at its end state)
    async still(spec, opts) {
      const fmt = opts.fmt || 'slide';
      const fr = makeFrame(fmt, spec.dir || opts.dir);
      const ctx = ctxFor(fmt, opts);
      const sc = L.build({ ...spec, dur: spec.dur || 6 }, ctx);
      fr.append(sc.el);
      await this.ready();
      sc.tl.apply(1e6);
      sc.el.querySelectorAll('.word').forEach((w) => { w.style.opacity = 1; w.style.transform = 'none'; w.style.filter = 'none'; });
      return { issues: check(fr, fmt, opts.label || spec.layout) };
    },

    // Playable Reel
    async reel(post, opts) {
      const fr = makeFrame('reel', post.art?.dir);
      const ctx = ctxFor('reel', opts);
      const scenes = post.scenes.map((s, i) => { const sc = L.build({ ...s }, { ...ctx, dir: s.dir || post.art?.dir }); sc.index = i; return sc; });
      // The first frame must already carry the hook: entrances in the opening scene become a short settle
      if (post.firstFrameReveal !== true) {
        for (const tr of scenes[0].tl.tracks) {
          if (tr.at > 1.2) continue;
          if (tr.prop === 'o' && tr.from === 0) tr.from = 1;
          if ((tr.prop === 'y' || tr.prop === 'x') && typeof tr.from === 'number') tr.from *= 0.25;
          if (tr.prop === 'blur') tr.from = 0;
          if (tr.prop === 'clip') tr.from = [0, 0, 0, 0];
          if (tr.prop === 's' && tr.from < 1) tr.from = 0.96;
        }
      }
      const reel = new E.Reel(fr, scenes);
      await this.ready();
      // layout checks at each scene's end state
      const issues = [];
      scenes.forEach((s, i) => { reel.seek(s.start + s.dur - 0.02); issues.push(...check(s.el, 'reel', `scene ${i + 1}`)); });
      // reading-time check: each caption needs time to be read before it disappears
      for (const c of reel.captions()) {
        const words = c.text.split(/\s+/).filter(Boolean).length;
        const need = 0.5 + words / 3.6;
        const have = c.until - c.at;
        if (have + 0.05 < need) issues.push(`scene ${c.scene + 1}: "${c.text.slice(0, 40)}" on screen ${have.toFixed(1)}s, needs ~${need.toFixed(1)}s`);
      }
      this._reel = reel;
      reel.seek(0);
      return {
        duration: reel.duration,
        cues: reel.cues(),
        captions: reel.captions(),
        scenes: scenes.map((s) => ({ start: s.start, dur: s.dur, tr: s.tr, layout: post.scenes[s.index].layout })),
        issues,
      };
    },
    seek(t) { this._reel.seek(t); },
    debug(on) { document.body.classList.toggle('debug', !!on); },
  };
})();
