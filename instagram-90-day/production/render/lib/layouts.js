/* Scene layouts. Each layout builds one scene (a Reel shot or a carousel slide) from a plain
   data spec and returns { el, tl }. Slides render at their end state; Reels play the timeline. */
(function () {
  const { h, svg, rich, Timeline } = window.E;
  const L = {};
  window.L = L;

  const isReel = (ctx) => ctx.fmt === 'reel';
  const SAFE = {
    reel: { x0: 80, x1: 960, y0: 270, y1: 1450 },
    slide: { x0: 84, x1: 996, y0: 72, y1: 1286 },
  };
  L.SAFE = SAFE;

  function base(spec, ctx) {
    const dir = spec.dir || ctx.dir || 'night';
    const el = h('div.scene.d-' + dir, { 'data-layout': spec.layout });
    if (spec.bg) Object.assign(el.style, spec.bg);
    const tl = new Timeline();
    return { el, tl, dir };
  }

  function chrome(sc, spec, ctx) {
    const { el, tl } = sc;
    if (spec.grain !== false && ctx.grain !== false) {
      const g = h('div.grain'); g.style.setProperty('--grain-url', E.grainURL());
      el.append(g);
    }
    if (spec.vignette !== false && ctx.vignette !== false) el.append(h('div.vignette'));
    let meta = spec.meta === false ? null : (spec.meta || ctx.meta);
    if (meta && (spec.layout === 'cover' || spec.hideMetaLeft)) meta = { ...meta, left: '' };
    if (meta) {
      const tm = h('div.top-meta', null,
        h('div.label', { html: meta.left ? `<span class="dot"></span>${rich(meta.left)}` : '' }),
        h('div.label', { html: (meta.left || '').length > (isReel(ctx) ? 26 : 34) ? '' : rich(meta.right || '') }));
      el.append(tm);
      if (isReel(ctx) && spec.metaIn !== false) tl.in(tm, 'fade', 0.05, 0.5);
    }
    if (spec.badge) {
      const b = h('div.badge' + (spec.badge.kind ? '.' + spec.badge.kind : ''), null, spec.badge.text || spec.badge);
      const pos = isReel(ctx) ? { position: 'absolute', left: '80px', top: (spec.badgeTop || 340) + 'px' } : { position: 'absolute', left: '84px', top: (spec.badgeTop || 128) + 'px' };
      if (spec.badgePos === 'bottom') { delete pos.top; pos.bottom = isReel(ctx) ? '480px' : '70px'; }
      if (spec.badgePos === 'right') { delete pos.left; pos.right = isReel(ctx) ? '120px' : '84px'; }
      Object.assign(b.style, pos);
      b.setAttribute('data-badge', '1');
      el.append(b);
      if (isReel(ctx)) tl.in(b, 'fade', spec.badgeAt ?? 0.15, 0.4);
    }
    if (spec.page && !isReel(ctx)) {
      const pg = h('div.pageno', { style: { position: 'absolute', right: '84px', bottom: '64px' } }, spec.page);
      el.append(pg);
    }
    if (spec.swipe && !isReel(ctx)) el.append(h('div.swipe', { style: { position: 'absolute', left: '84px', bottom: '64px' } }, spec.swipe === true ? 'Swipe' : spec.swipe, h('i')));
  }

  // Headline block: lines[] with rich markup. Returns element; animates line by line in reels.
  function headline(lines, size, opts = {}) {
    const el = h('div.h', { style: { fontSize: size + 'px', lineHeight: opts.lh || 0.98, letterSpacing: opts.track || '-0.04em', fontWeight: opts.weight || 600, textAlign: opts.align || 'left' } });
    for (const ln of [].concat(lines)) el.append(h('span.line', { html: rich(ln), 'data-check': '1' }));
    return el;
  }
  L.headline = headline;
  function animLines(tl, el, at, kind = 'rise', per = 0.12, dur = 0.8) {
    const ls = el.querySelectorAll('.line');
    ls.forEach((ln, i) => {
      if (kind === 'words') { E.words(ln); tl.words(ln, at + i * per * 3, 0.07, 'up', 0.5); }
      else tl.in(ln, kind, at + i * per, dur, 70);
    });
    return at + ls.length * per + dur;
  }
  function para(text, cls = 'body', style = {}) { return h('div.' + cls, { html: rich(text), style, 'data-check': '1' }); }
  function label(text, style = {}) { return h('div.label', { html: `<span class="dot"></span>${rich(text)}`, style }); }
  function sizeFor(ctx, slide, reel) { return isReel(ctx) ? reel : slide; }

  // ── 1 · hook / title ──
  L.hook = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const S = SAFE[ctx.fmt];
    const size = spec.size || sizeFor(ctx, 118, 132);
    if (spec.bgWord) {
      const bw = h('div', { style: { position: 'absolute', left: '-40px', right: '-40px', top: spec.bgWordTop || '42%', fontSize: (spec.bgWordSize || 520) + 'px', fontWeight: 700, letterSpacing: '-0.06em', color: 'var(--fg)', opacity: 0.05, whiteSpace: 'nowrap', lineHeight: 0.8, textAlign: 'center' } }, spec.bgWord);
      el.append(bw); if (isReel(ctx)) tl.to(bw, 'x', 60, -60, 0, spec.dur || 4, 'linear');
    }
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', gap: '36px' } });
    let lab = null; if (spec.eyebrow) { lab = label(spec.eyebrow); box.append(lab); }
    const hd = headline(spec.lines, size, { align: spec.align });
    box.append(hd);
    let sub = null; if (spec.sub) { sub = para(spec.sub, 'body', { maxWidth: spec.subWidth || '880px' }); box.append(sub); }
    el.append(box);
    const pos = spec.pos || 'center';
    if (pos === 'top') box.style.top = (spec.top ?? (S.y0 + (isReel(ctx) ? 100 : 120))) + 'px';
    else if (pos === 'bottom') box.style.bottom = (ctx.H - S.y1 + (spec.bottomPad || 40)) + 'px';
    else { box.style.top = '50%'; box.style.transform = `translateY(-${spec.anchor ?? 55}%)`; }
    if (spec.align === 'center') box.style.alignItems = 'center', box.style.textAlign = 'center';
    chrome(sc, spec, ctx);
    if (isReel(ctx)) {
      let t = spec.at ?? 0.15;
      if (lab) tl.in(lab, 'fade', t, 0.4);
      const end = animLines(tl, hd, t + 0.1, spec.anim || 'rise', spec.per || 0.14, 0.8);
      tl.caption(t + 0.1, spec.dur || 4, spec.lines.join(' '));
      if (sub) { tl.in(sub, 'up', spec.subAt ?? end - 0.2, 0.7, 40); tl.caption(spec.subAt ?? end - 0.2, spec.dur || 4, spec.sub); }
      if (spec.punch) tl.to(hd, 's', 1.0, 1.04, 0, spec.dur || 4, 'linear');
      if (spec.sfx !== false) tl.sfx(t + 0.1, spec.sfxName || 'whoosh', 0.7);
    }
    return sc;
  };
  L.title = L.hook;

  // ── 2 · statement (full-bleed signal) ──
  L.statement = function (spec, ctx) {
    spec = { dir: 'signal', vignette: false, ...spec };
    const sc = L.hook({ ...spec, size: spec.size || sizeFor(ctx, 128, 150) }, ctx);
    if (isReel(ctx)) sc.tl.sfx(0.05, 'impact', 0.5);
    return sc;
  };

  // ── 3 · phone (screen-led film) ──
  L.phone = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx);
    const S = SAFE[ctx.fmt];
    const scale = spec.scale || (reel ? 1.18 : 0.98);
    const pw = 560 * scale, ph = 1140 * scale;
    let px = spec.px ?? (ctx.W - pw) / 2 + (spec.dx || 0);
    let py = spec.py ?? (reel ? 560 : 330);
    if (spec.side === 'right') px = ctx.W - pw - (reel ? 100 : 60);
    if (spec.side === 'left') px = reel ? 80 : 60;
    const cam = h('div.layer');
    el.append(cam);
    const screens = spec.screens || [spec.screen];
    const ph_ = U.phone({ x: px, y: py, scale, dark: spec.dark, time: spec.time, statusBar: true });
    const parts = [];
    const layers = screens.map((s, i) => {
      const lay = h('div', { style: { position: 'absolute', left: 0, right: 0, top: s.type === 'lock' || s.type === 'call' || s.type === 'camera' || s.full ? '0' : '104px', bottom: 0, background: s.bg || (s.type === 'lock' || s.type === 'call' ? 'transparent' : spec.dark ? '#0f0f11' : '#fff'), overflow: 'hidden', opacity: i === (spec.startScreen || 0) ? 1 : 0 } });
      const p = {};
      const content = U.screens[s.type](s, p);
      const zw = h('div', { style: { zoom: String(s.zoom || U.ZOOM[s.type] || 1.25), height: s.type === 'lock' || s.type === 'call' || s.type === 'camera' ? '100%' : 'auto' } });
      zw.append(content);
      lay.append(zw);
      ph_.scr.append(lay);
      parts.push(p);
      return lay;
    });
    // keep the status bar on top
    const sb = ph_.scr.querySelector('.sbar'); if (sb) { sb.style.position = 'absolute'; sb.style.left = sb.style.right = '0'; sb.style.top = '0'; sb.style.zIndex = '15'; if (screens[0].type === 'lock' || screens[0].type === 'call' || screens[0].type === 'camera') sb.style.color = '#fff'; }
    cam.append(ph_.el);
    // headline
    let hd = null, sub = null;
    if (spec.lines) {
      const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', gap: '22px' } });
      if (spec.eyebrow) box.append(label(spec.eyebrow));
      hd = headline(spec.lines, spec.size || (reel ? 92 : 76), { align: spec.align });
      box.append(hd);
      if (spec.sub) { sub = para(spec.sub, 'body', { fontSize: reel ? '40px' : '32px' }); box.append(sub); }
      if (spec.textPos === 'bottom') box.style.bottom = (ctx.H - S.y1 + 10) + 'px';
      else box.style.top = (spec.textTop ?? (reel ? S.y0 + 90 : S.y0 + 70)) + 'px';
      el.append(box);
    }
    // callouts
    const callouts = (spec.callouts || []).map((c) => {
      const co = h('div.callout', { style: { left: c.x + 'px', top: c.y + 'px', flexDirection: c.side === 'left' ? 'row-reverse' : 'row' } },
        c.ring !== false ? h('div.ring' + (c.bad ? '.bad' : ''), { style: { width: (c.r || 120) + 'px', height: (c.r || 120) + 'px', marginLeft: -(c.r || 120) / 2 + 'px', marginTop: -(c.r || 120) / 2 + 'px' } }) : null,
        c.text ? h('div', { style: { width: (c.gap ?? 40) + 'px', height: '4px', background: c.bad ? 'var(--err)' : 'var(--acc)' } }) : null,
        c.text ? h('div.tag' + (c.bad ? '.bad' : ''), { html: rich(c.text), 'data-check': '1' }) : null);
      el.append(co);
      return co;
    });
    // finger
    const finger = h('div', { style: { position: 'absolute', width: '110px', height: '110px', marginLeft: '-55px', marginTop: '-55px', borderRadius: '50%', background: 'rgb(255 255 255 / 0.55)', boxShadow: '0 0 0 3px rgb(0 0 0 / 0.25)', opacity: 0, zIndex: 50, pointerEvents: 'none' } });
    el.append(finger);
    // honest label as a sticker on the phone's corner (covers only the status bar)
    let sticker = null;
    if (spec.badge && spec.badgePos !== 'top' && spec.badgePos !== 'right') {
      sticker = h('div.badge' + (spec.badge.kind ? '.' + spec.badge.kind : ''), { style: { position: 'absolute', left: (px - 18) + 'px', top: (py + 26 * scale) + 'px', transform: 'rotate(-3deg)', zIndex: 40, boxShadow: '0 10px 24px rgb(0 0 0 / .35)', background: 'var(--bg)' }, 'data-badge': '1' }, spec.badge.text || spec.badge);
      cam.append(sticker);
    }
    chrome(sc, sticker ? { ...spec, badge: null } : spec, ctx);
    if (sticker && reel) tl.in(sticker, 'pop', (spec.phoneAt ?? 0.05) + 0.5, 0.4);

    const frameRect = () => el.getBoundingClientRect();
    const resolve = (a) => {
      const p = parts[a.s ?? 0];
      if (!a.target) return null;
      const [k, i] = a.target.split('.');
      const v = p[k];
      return i != null ? v && v[+i] : v;
    };
    if (!reel) {
      // slide: apply end states of actions
      let cur = spec.startScreen || 0;
      for (const a of spec.actions || []) {
        if (a.do === 'swap') { layers[cur].style.opacity = 0; layers[a.to].style.opacity = 1; cur = a.to; }
        if (a.do === 'chip') { const c = resolve(a); if (c) { c.textContent = a.text; c.className = 'chip ' + a.cls; } }
        if (a.do === 'text') { const c = resolve(a); if (c) c.innerHTML = rich(a.text); }
        if (a.do === 'hide') { const c = resolve(a); if (c) c.style.opacity = 0; }
        if (a.do === 'scroll') layers[a.s ?? cur].firstChild.style.transform = `translateY(${-a.y}px)`;
        if (a.do === 'focus') { const c = resolve(a); if (c) c.classList.add('focus'); }
      }
      for (const lay of parts) for (const inp of lay.inputs || []) inp.textContent = inp.dataset.full || inp.textContent;
      return sc;
    }
    // reel timeline
    const t0 = spec.at ?? 0.1;
    if (hd) { animLines(tl, hd, t0, 'rise', 0.12, 0.7); tl.caption(t0, spec.dur, spec.lines.join(' ')); }
    if (sub) { tl.in(sub, 'up', spec.subAt ?? t0 + 0.5, 0.6, 30); tl.caption(spec.subAt ?? t0 + 0.5, spec.dur, spec.sub); if (spec.subSfx !== false && spec.subAt) tl.sfx(spec.subAt, 'pop', 0.5); }
    if (spec.phoneIn !== false) tl.to(ph_.el, 'y', spec.phoneFrom ?? 140, 0, spec.phoneAt ?? 0.05, 0.9, 'expo').to(ph_.el, 'o', 0, 1, spec.phoneAt ?? 0.05, 0.35, 'linear');
    (spec.callouts || []).forEach((c, i) => {
      const co = callouts[i];
      tl.in(co, c.anim || 'pop', c.at ?? 1, 0.5);
      if (c.text) tl.caption(c.at ?? 1, c.until ?? spec.dur, c.text);
      if (c.sfx !== false) tl.sfx(c.at ?? 1, c.bad ? 'error' : 'pop', 0.6);
      if (c.outAt) tl.out(co, 'fade', c.outAt, 0.3);
    });
    let cur = spec.startScreen || 0;
    for (const a of spec.actions || []) {
      const at = a.at;
      if (a.do === 'type') {
        const inp = resolve(a);
        if (!inp) continue;
        inp.dataset.full = inp.dataset.full || inp.textContent;
        tl.fn(at - 0.01, 0.01, () => inp.classList.add('focus'));
        const end = tl.type(inp, at, a.cps || 20);
        tl.fn(end + 0.2, 0.01, () => inp.classList.remove('focus'));
        tl.sfx(at, 'typing', 0.55);
      } else if (a.do === 'tap') {
        const tgt = resolve(a);
        let pos = null;
        tl.fn(at - 0.35, 0.35, (p) => {
          if (!pos) { const fr = frameRect(); const r = tgt ? tgt.getBoundingClientRect() : { left: a.x, top: a.y, width: 0, height: 0 }; pos = { x: r.left - fr.left + r.width / 2, y: r.top - fr.top + r.height / 2 }; }
          finger.style.left = pos.x + 'px'; finger.style.top = pos.y + 'px';
        });
        tl.to(finger, 'o', 0, 1, at - 0.3, 0.15, 'linear').to(finger, 's', 1.4, 0.8, at - 0.3, 0.3, 'out').to(finger, 'o', 1, 0, at + 0.12, 0.3, 'linear');
        if (tgt) tl.to(tgt, 's', 1, 0.94, at, 0.08, 'out').to(tgt, 's', 0.94, 1, at + 0.08, 0.2, 'out');
        tl.sfx(at, 'tap', 0.9);
      } else if (a.do === 'swap') {
        const from = layers[cur], to = layers[a.to];
        if (a.anim === 'slide') { tl.to(to, 'x', 560, 0, at, 0.45, 'inOut').to(to, 'o', 1, 1, at, 0.01).to(from, 'x', 0, -200, at, 0.45, 'inOut'); }
        else if (a.anim === 'up') { tl.to(to, 'y', 900, 0, at, 0.5, 'expo').to(to, 'o', 1, 1, at, 0.01); }
        else { tl.to(to, 'o', 0, 1, at, a.dur || 0.3, 'linear'); }
        tl.to(from, 'o', 1, 0, at + (a.anim ? 0.45 : 0.3), 0.01, 'linear');
        if (a.sfx !== false) tl.sfx(at, a.sfx || 'swipe', 0.5);
        cur = a.to;
      } else if (a.do === 'show') {
        const tgt = resolve(a); tl.in(tgt, a.anim || 'up', at, a.dur || 0.5, 40);
        if (a.sfx) tl.sfx(at, a.sfx, a.gain || 0.7);
      } else if (a.do === 'hide') {
        tl.out(resolve(a), 'fade', at, 0.3);
      } else if (a.do === 'chip') {
        const c = resolve(a); if (!c) continue;
        tl.fn(at, 0.01, (p) => { c.textContent = a.text; c.className = 'chip ' + a.cls; });
        tl.to(c, 's', 1.25, 1, at, 0.4, 'back');
        if (a.sfx !== false) tl.sfx(at, a.sfx || 'pop', 0.6);
      } else if (a.do === 'text') {
        const c = resolve(a); if (!c) continue; const old = c.innerHTML;
        tl.fn(0, 0.01, (p, t) => { c.innerHTML = t >= at ? rich(a.text) : old; });
      } else if (a.do === 'scroll') {
        const lay = layers[a.s ?? cur].firstChild;
        tl.to(lay, 'y', -(a.from || 0), -a.y, at, a.dur || 1.2, 'inOut');
      } else if (a.do === 'zoom') {
        cam.style.transformOrigin = `${a.ox ?? 540}px ${a.oy ?? 960}px`;
        tl.to(cam, 's', a.from || 1, a.to || 1.6, at, a.dur || 1.2, a.ease || 'inOut');
      } else if (a.do === 'shake') {
        const tgt = resolve(a) || ph_.el;
        tl.fn(at, 0.5, (p) => { tgt.style.translate = `${Math.sin(p * Math.PI * 8) * 14 * (1 - p)}px 0`; });
        tl.sfx(at, 'error', 0.7);
      } else if (a.do === 'sfx') {
        tl.sfx(at, a.name, a.gain || 0.8);
      } else if (a.do === 'caption') {
        tl.caption(at, a.until || spec.dur, a.text);
      } else if (a.do === 'focus') {
        const c = resolve(a); tl.fn(at, 0.01, () => c && c.classList.add('focus'));
      }
    }
    return sc;
  };

  // ── 4 · split (before / after) ──
  L.split = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const top = spec.lines ? (reel ? S.y0 + 70 : S.y0 + 60) : S.y0 + 20;
    let hd = null;
    if (spec.lines) {
      const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: top + 'px', gap: '18px' } });
      if (spec.eyebrow) box.append(label(spec.eyebrow));
      hd = headline(spec.lines, spec.size || (reel ? 84 : 70)); box.append(hd); el.append(box);
    }
    const panes = spec.panes || [];
    const areaTop = spec.lines ? (reel ? 640 : 380) : top + 40;
    const areaH = (reel ? S.y1 + 120 : ctx.H - 40) - areaTop;
    const vertical = false;
    const gap = 28;
    const pw = (S.x1 - S.x0 - gap) / 2;
    const paneEls = panes.map((p, i) => {
      const pane = h('div', { style: { position: 'absolute', left: S.x0 + i * (pw + gap) + 'px', top: areaTop + 'px', width: pw + 'px', height: areaH + 'px' } });
      const lab = h('div.label', { style: { marginBottom: '18px', color: p.good ? 'var(--acc-text)' : p.bad ? 'var(--err)' : 'var(--fg3)' }, html: `<span class="dot" style="background:${p.good ? 'var(--acc)' : p.bad ? 'var(--err)' : 'var(--fg3)'}"></span>${rich(p.label || '')}` });
      pane.append(lab);
      if (p.screen) {
        const scale = pw / 560 * (p.scaleMul || 1);
        const phoneWrap = h('div', { style: { position: 'relative', height: (1140 * scale) + 'px' } });
        const ph = U.phone({ x: 0, y: 0, scale, screen: p.screen, dark: p.dark });
        if (p.screen.type === 'lock' || p.screen.type === 'call') ph.scr.querySelector('.sbar').style.color = '#fff';
        phoneWrap.append(ph.el); pane.append(phoneWrap);
      } else if (p.items) {
        const list = h('div');
        for (const it of p.items) list.append(h('div.check', null, h('div.box' + (it.state === 'x' ? '.x' : it.state === 'on' ? '.on' : '')), h('div', null, h('div.ct', { html: rich(it.t), style: { fontSize: reel ? '40px' : '32px' } }), it.s ? h('div.cs', { html: rich(it.s), style: { fontSize: reel ? '30px' : '26px' } }) : null)));
        pane.append(list);
      } else if (p.text) {
        pane.append(h('div.card', { style: { fontSize: reel ? '42px' : '34px', lineHeight: 1.32, color: 'var(--fg)', fontWeight: 480 }, html: rich(p.text) }));
      }
      if (p.note) pane.append(h('div.small', { style: { marginTop: '18px' }, html: rich(p.note) }));
      el.append(pane);
      return pane;
    });
    chrome(sc, spec, ctx);
    if (reel) {
      if (hd) { animLines(tl, hd, 0.1); tl.caption(0.1, spec.dur, spec.lines.join(' ')); }
      paneEls.forEach((pe, i) => {
        const at = (spec.paneAt || [0.5, 1.6])[i] ?? 0.5 + i;
        tl.in(pe, 'wipe', at, 0.8);
        tl.sfx(at, i ? 'whoosh' : 'swipe', 0.6);
        if (panes[i].label) tl.caption(at, spec.dur, panes[i].label + (panes[i].note ? ': ' + panes[i].note : ''));
      });
    }
    return sc;
  };

  // ── 5 · checklist ──
  L.checklist = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (spec.top ?? (reel ? S.y0 + 80 : S.y0 + 100)) + 'px', gap: '34px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 88 : 72)) : null;
    if (hd) box.append(hd);
    const list = h('div', { style: { marginTop: '10px' } });
    const rows = (spec.items || []).map((it) => {
      const bx = h('div.box' + (it.state === 'x' ? '.x' : it.state === 'off' ? '' : '.on'));
      const row = h('div.check', null, bx, h('div', null, h('div.ct', { html: rich(it.t), 'data-check': '1' }), it.s ? h('div.cs', { html: rich(it.s) }) : null));
      list.append(row); return { row, bx, it };
    });
    box.append(list);
    if (spec.foot) box.append(para(spec.foot, 'small'));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      let t = 0.1;
      if (hd) { t = animLines(tl, hd, 0.1) - 0.3; tl.caption(0.1, spec.dur, spec.lines.join(' ')); }
      const per = spec.per || 0.9;
      rows.forEach(({ row, bx, it }, i) => {
        const at = t + i * per;
        tl.in(row, 'up', at, 0.5, 30);
        if (it.state !== 'off') { tl.to(bx, 's', 0.4, 1, at + 0.25, 0.45, 'back'); tl.sfx(at + 0.25, it.state === 'x' ? 'error' : 'tick', 0.8); }
        tl.caption(at, spec.dur, E.plain(it.t) + (it.s ? '. ' + E.plain(it.s) : ''));
      });
    }
    return sc;
  };

  // ── 6 · steps ──
  L.steps = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (spec.top ?? (reel ? S.y0 + 80 : S.y0 + 100)) + 'px', gap: '30px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 88 : 72)) : null;
    if (hd) box.append(hd);
    const list = h('div');
    const rows = (spec.steps || []).map((s, i) => {
      const row = h('div.step', null, h('div.n', null, s.n || String(i + 1).padStart(2, '0')), h('div', null, h('div.st', { html: rich(s.t), 'data-check': '1' }), s.d ? h('div.sd', { html: rich(s.d) }) : null));
      list.append(row); return row;
    });
    box.append(list);
    if (spec.foot) box.append(para(spec.foot, 'small'));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      let t = hd ? animLines(tl, hd, 0.1) - 0.3 : 0.1;
      if (hd) tl.caption(0.1, spec.dur, spec.lines.join(' '));
      rows.forEach((r, i) => { tl.in(r, 'up', t + i * (spec.per || 1.0), 0.6, 40); tl.sfx(t + i * (spec.per || 1.0), 'tick', 0.6); tl.caption(t + i * (spec.per || 1.0), spec.dur, E.plain(spec.steps[i].t) + (spec.steps[i].d ? '. ' + E.plain(spec.steps[i].d) : '')); });
    }
    return sc;
  };

  // ── 7 · flow (track an enquiry through a system) ──
  L.flow = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    let hd = null;
    if (spec.lines) {
      const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (reel ? S.y0 + 70 : S.y0 + 70) + 'px', gap: '18px' } });
      if (spec.eyebrow) box.append(label(spec.eyebrow));
      hd = headline(spec.lines, spec.size || (reel ? 80 : 68)); box.append(hd); el.append(box);
    }
    const wires = svg('svg', { class: 'wire', width: ctx.W, height: ctx.H, viewBox: `0 0 ${ctx.W} ${ctx.H}` });
    el.append(wires);
    const nodes = {};
    for (const n of spec.nodes || []) {
      const nd = h('div.node' + (n.cls ? '.' + n.cls : ''), { style: { left: n.x + 'px', top: n.y + 'px', width: (n.w || 360) + 'px' }, html: `${n.label ? `<span class="nl">${rich(n.label)}</span>` : ''}${rich(n.text)}`, 'data-check': '1' });
      el.append(nd); nodes[n.id] = { el: nd, n };
    }
    // edges are drawn after layout (need sizes) - compute from spec coordinates
    const centre = (id, side) => {
      const { n, el: ne } = nodes[id];
      const w = n.w || 360, hh = n.h || (reel ? 150 : 130);
      if (side === 'b') return [n.x + w / 2, n.y + hh];
      if (side === 't') return [n.x + w / 2, n.y];
      if (side === 'r') return [n.x + w, n.y + hh / 2];
      if (side === 'l') return [n.x, n.y + hh / 2];
      return [n.x + w / 2, n.y + hh / 2];
    };
    const paths = (spec.edges || []).map((e) => {
      const [a, b, cls, sa, sb] = e;
      const [x1, y1] = centre(a, sa || 'b'), [x2, y2] = centre(b, sb || 't');
      const my = (y1 + y2) / 2;
      const d = sa === 'r' || sa === 'l' ? `M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}` : `M${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
      const p = svg('path', { d, class: cls || '' });
      wires.append(p);
      return p;
    });
    let packet = null;
    if (spec.packet) { packet = h('div.packet' + (spec.packet.bad ? '.bad' : '')); el.append(packet); if (spec.packet.bad) packet.style.background = 'var(--err)'; }
    if (spec.note) { const lowest = Math.max(...(spec.nodes || []).map((n) => n.y + (n.h || (reel ? 150 : 130)))); const nt = para(spec.note, 'small', { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (spec.noteTop ?? lowest + 70) + 'px', fontSize: (reel ? 38 : 30) + 'px' }); el.append(nt); if (reel) { tl.in(nt, 'fade', spec.noteAt || 2, 0.5); tl.caption(spec.noteAt || 2, spec.dur, spec.note); } }
    chrome(sc, spec, ctx);
    if (reel) {
      if (hd) { animLines(tl, hd, 0.1); tl.caption(0.1, spec.dur, spec.lines.join(' ')); }
      (spec.nodes || []).forEach((n, i) => { tl.in(nodes[n.id].el, n.anim || 'pop', n.at ?? 0.4 + i * 0.35, 0.5); if (n.caption) tl.caption(n.at ?? 0.4 + i * 0.35, spec.dur, n.caption); });
      paths.forEach((p, i) => { const at = (spec.edges[i][5] ?? 0.6 + i * 0.4); tl.to(p, 'o', 0, 1, at, 0.2, 'linear'); });
      if (packet && spec.packet.route) {
        // move along the listed node centres
        const pts = spec.packet.route.map((id) => centre(id, 'c'));
        const t0 = spec.packet.at ?? 1, seg = spec.packet.seg || 0.9;
        tl.to(packet, 'o', 0, 1, t0, 0.2, 'linear');
        for (let i = 0; i < pts.length - 1; i++) {
          tl.to(packet, 'left', pts[i][0], pts[i + 1][0], t0 + i * seg, seg * 0.9, 'inOut').to(packet, 'top', pts[i][1], pts[i + 1][1], t0 + i * seg, seg * 0.9, 'inOut');
          tl.sfx(t0 + i * seg, 'tick', 0.5);
        }
        if (spec.packet.stopAt != null) {
          const idx = spec.packet.stopAt;
          tl.sfx(t0 + idx * seg, spec.packet.bad ? 'error' : 'success', 0.8);
        }
      }
      for (const c of spec.changes || []) {
        const nd = nodes[c.id]?.el; if (!nd) continue;
        tl.fn(c.at, 0.01, () => { nd.className = 'node' + (c.cls ? ' ' + c.cls : ''); if (c.text) nd.innerHTML = `${c.label ? `<span class="nl">${rich(c.label)}</span>` : ''}${rich(c.text)}`; });
        tl.to(nd, 's', 1.08, 1, c.at, 0.4, 'back');
        if (c.sfx) tl.sfx(c.at, c.sfx, 0.8);
        if (c.caption) tl.caption(c.at, spec.dur, c.caption);
      }
    } else if (packet && spec.packet.route) {
      const last = spec.packet.route[spec.packet.stopAt ?? spec.packet.route.length - 1];
      const [x, y] = centre(last, 'c'); packet.style.left = x + 'px'; packet.style.top = y + 'px';
      for (const c of spec.changes || []) { const nd = nodes[c.id]?.el; if (nd) { nd.className = 'node' + (c.cls ? ' ' + c.cls : ''); if (c.text) nd.innerHTML = `${c.label ? `<span class="nl">${rich(c.label)}</span>` : ''}${rich(c.text)}`; } }
    }
    return sc;
  };

  // ── 8 · big number / fact ──
  L.bignum = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: '50%', transform: 'translateY(-55%)', gap: '28px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const num = h('div', { style: { fontSize: (spec.numSize || (reel ? 330 : 300)) + 'px', fontWeight: 620, letterSpacing: '-0.06em', lineHeight: 0.85, color: spec.numColor || 'var(--acc-text)', whiteSpace: 'nowrap' }, 'data-check': '1' });
    if (spec.count != null) { num.dataset.prefix = spec.prefix || ''; num.dataset.suffix = spec.suffix || ''; num.textContent = (spec.prefix || '') + spec.count + (spec.suffix || ''); }
    else num.innerHTML = rich(spec.num);
    box.append(num);
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 76 : 64)) : null;
    if (hd) box.append(hd);
    const sub = spec.sub ? para(spec.sub) : null; if (sub) box.append(sub);
    const src = spec.source ? para(spec.source, 'small', { marginTop: '10px' }) : null; if (src) box.append(src);
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      tl.in(num, 'scale', 0.1, 0.9);
      if (spec.count != null) tl.to(num, 'count', spec.countFrom || 0, spec.count, 0.1, spec.countDur || 1.2, 'out');
      tl.sfx(0.1, 'impact', 0.6);
      tl.caption(0.1, spec.dur, E.plain(spec.num || (spec.prefix || '') + spec.count + (spec.suffix || '')) + (spec.lines ? ' ' + spec.lines.join(' ') : ''));
      if (hd) animLines(tl, hd, 0.6);
      if (sub) { tl.in(sub, 'up', 1.1, 0.6); tl.caption(1.1, spec.dur, spec.sub); }
      if (src) tl.in(src, 'fade', 1.4, 0.5);
    }
    return sc;
  };

  // ── 9 · quote ──
  L.quote = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: '50%', transform: 'translateY(-50%)', gap: '10px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow, { marginBottom: '30px' }));
    const q = h('div.quote', { html: `<span class="q">“</span>${rich(spec.text)}<span class="q">”</span>`, 'data-check': '1', style: spec.size ? { fontSize: spec.size + 'px' } : {} });
    box.append(q);
    if (spec.who) box.append(h('div.who', { html: rich(spec.who) }));
    if (spec.sub) box.append(para(spec.sub, 'body', { marginTop: '36px' }));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) { E.words(q); const end = tl.words(q, 0.2, spec.per || 0.06, 'blur', 0.5); tl.caption(0.2, spec.dur, spec.text + (spec.who ? ' — ' + spec.who : '')); const w = box.querySelector('.who'); if (w) tl.in(w, 'fade', end, 0.4); const s = box.querySelector('.body'); if (s) { tl.in(s, 'up', end + 0.3, 0.5); tl.caption(end + 0.3, spec.dur, spec.sub); } }
    return sc;
  };

  // ── 10 · table ──
  L.table = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (spec.top ?? (reel ? S.y0 + 80 : S.y0 + 90)) + 'px', gap: '30px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 80 : 66)) : null; if (hd) box.append(hd);
    const tb = h('table.tbl', { style: spec.fontSize ? { fontSize: spec.fontSize + 'px' } : {} });
    if (spec.cols) tb.append(h('tr', null, spec.cols.map((c) => h('th', { html: rich(c) }))));
    const trs = (spec.rows || []).map((r) => {
      const tr = h('tr', null, r.map((c, j) => {
        if (c && typeof c === 'object' && c.chip) return h('td', null, h('span.chip.' + (c.cls || 'pass'), null, c.chip));
        return h('td' + (j === 0 && spec.firstDim ? '.dim' : ''), { html: rich(c ?? '') });
      }));
      tb.append(tr); return tr;
    });
    box.append(tb);
    if (spec.foot) box.append(para(spec.foot, 'small'));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      let t = hd ? animLines(tl, hd, 0.1) - 0.3 : 0.1;
      if (hd) tl.caption(0.1, spec.dur, spec.lines.join(' '));
      trs.forEach((tr, i) => { tl.in(tr, 'left', t + i * (spec.per || 0.7), 0.5, 40); tl.sfx(t + i * (spec.per || 0.7), 'tick', 0.5); tl.caption(t + i * (spec.per || 0.7), spec.dur, spec.rows[i].map((c) => (c && c.chip) || E.plain(c ?? '')).join(' · ')); });
    }
    return sc;
  };

  // ── 11 · print piece (card, flyer, door hanger, gift card) ──
  L.print = function (spec, ctx) {
    spec = { dir: 'print', ...spec };
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const kinds = {
      card: { w: 700, h: 400, r: 12 },
      flyer: { w: 560, h: 724, r: 4 },
      door: { w: 360, h: 900, r: 18 },
      gift: { w: 680, h: 400, r: 26 },
    };
    const k = kinds[spec.kind || 'card'];
    const scale = spec.scale || (reel ? 1.15 : 1);
    const W = k.w * scale, H = k.h * scale;
    const cx = spec.cx ?? ctx.W / 2, cy = spec.cy ?? (reel ? 1010 : 760);
    const pc = h('div.printpiece', { style: { left: cx - W / 2 + 'px', top: cy - H / 2 + 'px', width: W + 'px', height: H + 'px', borderRadius: k.r + 'px', transform: `rotate(${spec.rot ?? -3}deg)`, background: spec.paper || '#fbf8f1', overflow: 'hidden' } });
    if (spec.kind === 'door') {
      const hole = h('div', { style: { position: 'absolute', left: '50%', top: 50 * scale + 'px', width: 150 * scale + 'px', height: 150 * scale + 'px', marginLeft: -75 * scale + 'px', borderRadius: '50%', background: 'var(--bg)', boxShadow: 'inset 0 4px 10px rgb(0 0 0 / .25)' } });
      pc.append(hole);
    }
    const inner = h('div', { style: { position: 'absolute', inset: (spec.kind === 'door' ? 240 * scale : 36 * scale) + 'px ' + 36 * scale + 'px ' + 36 * scale + 'px', display: 'flex', flexDirection: spec.kind === 'card' || spec.kind === 'gift' ? 'row' : 'column', gap: 26 * scale + 'px', alignItems: spec.kind === 'card' || spec.kind === 'gift' ? 'center' : 'stretch' } });
    const txt = h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 * scale + 'px' } });
    if (spec.brand) txt.append(h('div', { style: { fontWeight: 700, fontSize: 30 * scale + 'px', letterSpacing: '-0.02em' }, html: rich(spec.brand) }));
    if (spec.headline) txt.append(h('div', { style: { fontWeight: 700, fontSize: (spec.hSize || 54) * scale + 'px', letterSpacing: '-0.04em', lineHeight: 0.98, color: '#0b0b0c' }, html: rich(spec.headline) }));
    if (spec.body) txt.append(h('div', { style: { fontSize: 22 * scale + 'px', lineHeight: 1.35, color: '#333' }, html: rich(spec.body) }));
    inner.append(txt);
    let qr = null;
    if (spec.qrSvg) {
      qr = h('div', { style: { width: (spec.qrSize || 190) * scale + 'px', flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale + 'px' } },
        h('div', { style: { width: '100%', aspectRatio: '1', background: '#fff', padding: 8 * scale + 'px' }, html: spec.qrSvg }),
        spec.qrLabel ? h('div', { style: { fontSize: 18 * scale + 'px', fontWeight: 600, textAlign: 'center', lineHeight: 1.25, color: '#222' }, html: rich(spec.qrLabel) }) : null);
      inner.append(qr);
    }
    pc.append(inner);
    if (spec.stripe) pc.append(h('div', { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 22 * scale + 'px', background: spec.stripe } }));
    el.append(pc);
    // guides
    const guides = [];
    if (spec.guides) {
      const off = 18 * scale;
      const bl = h('div.bleed', { style: { left: cx - W / 2 - off + 'px', top: cy - H / 2 - off + 'px', width: W + off * 2 + 'px', height: H + off * 2 + 'px', transform: `rotate(${spec.rot ?? -3}deg)`, borderRadius: k.r + 'px' } });
      const sf = h('div.safe', { style: { left: cx - W / 2 + off + 'px', top: cy - H / 2 + off + 'px', width: W - off * 2 + 'px', height: H - off * 2 + 'px', transform: `rotate(${spec.rot ?? -3}deg)`, borderRadius: k.r + 'px' } });
      el.append(bl, sf); guides.push(bl, sf);
    }
    let hd = null;
    if (spec.lines) {
      const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', gap: '18px' } });
      if (spec.eyebrow) box.append(label(spec.eyebrow));
      hd = headline(spec.lines, spec.size || (reel ? 86 : 70)); box.append(hd);
      if (spec.sub) box.append(para(spec.sub, 'body'));
      if (spec.textPos === 'bottom') box.style.bottom = (ctx.H - S.y1 + 10) + 'px'; else box.style.top = (reel ? S.y0 + 80 : S.y0 + 70) + 'px';
      el.append(box);
    }
    const notes = (spec.notes || []).map((n) => { const d = h('div.callout', { style: { left: n.x + 'px', top: n.y + 'px' } }, h('div.tag' + (n.bad ? '.bad' : ''), { html: rich(n.text), 'data-check': '1' })); el.append(d); return d; });
    chrome(sc, spec, ctx);
    if (reel) {
      tl.to(pc, 'y', 260, 0, 0.05, 1.0, 'expo').to(pc, 'o', 0, 1, 0.05, 0.3, 'linear').to(pc, 'r', (spec.rot ?? -3) - 8, spec.rot ?? -3, 0.05, 1.1, 'expo');
      tl.sfx(0.05, 'paper', 0.8);
      if (spec.drift !== false) tl.to(el.querySelector('.printpiece'), 's', 1, 1.05, 0.8, (spec.dur || 4), 'linear');
      if (hd) { animLines(tl, hd, 0.3); tl.caption(0.3, spec.dur, spec.lines.join(' ') + (spec.sub ? '. ' + spec.sub : '')); }
      guides.forEach((g, i) => tl.in(g, 'fade', (spec.guidesAt || 1.4) + i * 0.3, 0.4));
      notes.forEach((n, i) => { tl.in(n, 'pop', spec.notes[i].at ?? 1.6 + i * 0.6, 0.5); tl.sfx(spec.notes[i].at ?? 1.6 + i * 0.6, 'pop', 0.5); tl.caption(spec.notes[i].at ?? 1.6 + i * 0.6, spec.dur, spec.notes[i].text); });
    }
    return sc;
  };

  // ── 12 · storefront at dusk (illustration) ──
  L.storefront = function (spec, ctx) {
    spec = { dir: 'dusk', ...spec };
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const W = ctx.W, H = ctx.H;
    const gy = reel ? 1580 : 1150; // ground line
    const BH = reel ? 820 : 640; // building height
    const s = svg('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: 'position:absolute;inset:0' });
    // building
    s.append(svg('rect', { x: 120, y: gy - BH, width: W - 240, height: BH, fill: '#1b1d29' }));
    s.append(svg('rect', { x: 120, y: gy - BH, width: W - 240, height: 26, fill: '#262a3b' }));
    // sign band
    const signY = gy - BH + 70;
    s.append(svg('rect', { x: 170, y: signY, width: W - 340, height: 110, rx: 8, fill: '#11131c', stroke: '#2e3348', 'stroke-width': 3 }));
    const signTxt = svg('text', { x: W / 2, y: signY + 72, 'text-anchor': 'middle', 'font-family': 'Geist', 'font-weight': 650, 'font-size': 52, fill: '#f2e6cf', 'letter-spacing': '-1' });
    signTxt.textContent = spec.sign || 'EXAMPLE SALON';
    s.append(signTxt);
    // window glow
    const winY = signY + 160, winH = BH - 300;
    s.append(svg('rect', { x: 170, y: winY, width: 330, height: winH, rx: 6, fill: '#ffcf8a', opacity: 0.85 }));
    s.append(svg('rect', { x: 580, y: winY, width: 330, height: winH, rx: 6, fill: '#ffcf8a', opacity: 0.85 }));
    // door
    const door = svg('rect', { x: 505, y: winY + 40, width: 70, height: winH - 40, fill: '#ffe2b0' });
    s.append(door);
    // interior silhouettes
    for (const [x, hh] of [[230, 160], [330, 210], [650, 190], [790, 140]]) s.append(svg('rect', { x, y: winY + winH - hh, width: 60, height: hh, rx: 24, fill: '#d79a58', opacity: 0.55 }));
    // glow on ground
    const defs = svg('defs');
    const rg = svg('radialGradient', { id: 'glow', cx: '50%', cy: '0%', r: '70%' });
    rg.append(svg('stop', { offset: '0%', 'stop-color': '#ffbf73', 'stop-opacity': '0.55' }), svg('stop', { offset: '100%', 'stop-color': '#ffbf73', 'stop-opacity': '0' }));
    defs.append(rg); s.prepend(defs);
    s.append(svg('rect', { x: 0, y: gy, width: W, height: H - gy, fill: '#0e0f16' }));
    s.append(svg('ellipse', { cx: W / 2, cy: gy, rx: 520, ry: 160, fill: 'url(#glow)' }));
    el.append(s);
    // OPEN sign (neon)
    const open = h('div', { style: { position: 'absolute', left: '210px', top: winY + 40 + 'px', padding: '14px 26px', borderRadius: '14px', border: '5px solid #ff6b57', color: '#ff8a7a', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: '50px', letterSpacing: '0.08em', boxShadow: '0 0 30px rgb(255 107 87 / .8), inset 0 0 20px rgb(255 107 87 / .4)', textShadow: '0 0 18px rgb(255 107 87 / .9)', background: 'rgb(30 10 10 / .35)' } }, spec.openText || 'OPEN');
    el.append(open);
    let hd = null;
    if (spec.lines) {
      const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', gap: '18px' } });
      if (spec.eyebrow) box.append(label(spec.eyebrow));
      hd = headline(spec.lines, spec.size || (reel ? 96 : 80));
      box.append(hd);
      if (spec.textPos === 'top' || !reel) box.style.top = (reel ? S.y0 + 70 : S.y0 + 60) + 'px'; else box.style.bottom = (ctx.H - S.y1 + 10) + 'px';
      el.append(box);
    }
    chrome(sc, { ...spec, badge: spec.badge || { text: 'Illustration', kind: 'illus' }, badgePos: spec.badgePos || 'bottom' }, ctx);
    if (reel) {
      tl.fn(0, spec.dur || 4, (p, t) => { const f = 0.85 + 0.15 * Math.sin(t * 17) * Math.sin(t * 5.3); open.style.opacity = (t > (spec.flickerAt ?? 99) ? f : 1).toFixed(3); });
      tl.to(s, 's', 1.0, 1.06, 0, spec.dur || 4, 'linear');
      tl.sfx(0, 'street', 0.6);
      if (hd) { animLines(tl, hd, spec.textAt ?? 0.6); tl.caption(spec.textAt ?? 0.6, spec.dur, spec.lines.join(' ')); }
    }
    return sc;
  };

  // ── 13 · chat (overheard dialogue, not in a phone) ──
  L.chat = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (spec.top ?? (reel ? S.y0 + 90 : S.y0 + 110)) + 'px', gap: '26px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow, { marginBottom: '10px' }));
    let hd = null; if (spec.lines) { hd = headline(spec.lines, spec.size || (reel ? 80 : 66)); box.append(hd); }
    const msgs = (spec.msgs || []).map((m) => {
      const right = m.side === 'r';
      const b = h('div', { style: { alignSelf: right ? 'flex-end' : 'flex-start', maxWidth: '84%', padding: reel ? '28px 36px' : '24px 30px', borderRadius: '36px', [right ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: '10px', background: right ? 'var(--acc)' : 'var(--surface)', color: right ? 'var(--on-acc)' : 'var(--on-surface)', fontSize: (reel ? 44 : 36) + 'px', lineHeight: 1.28, fontWeight: 480, boxShadow: right ? 'none' : '0 0 0 2px var(--line)' }, html: (m.who ? `<span style="display:block;font-family:var(--mono);font-size:${reel ? 24 : 21}px;letter-spacing:.08em;text-transform:uppercase;opacity:.65;margin-bottom:8px">${rich(m.who)}</span>` : '') + rich(m.text), 'data-check': '1' });
      box.append(b); return b;
    });
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      let t = hd ? animLines(tl, hd, 0.1) - 0.2 : 0.2;
      if (hd) tl.caption(0.1, spec.dur, spec.lines.join(' '));
      msgs.forEach((m, i) => { const at = spec.msgs[i].at ?? t + i * (spec.per || 1.1); tl.in(m, 'pop', at, 0.45); tl.sfx(at, spec.msgs[i].side === 'r' ? 'sent' : 'notify', 0.45); tl.caption(at, spec.dur, (spec.msgs[i].who ? spec.msgs[i].who + ': ' : '') + spec.msgs[i].text); });
    }
    return sc;
  };

  // ── 14 · portrait (Mann, real photo) ──
  L.portrait = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const size = spec.photoSize || (reel ? 760 : 620);
    let ph;
    if (spec.band) {
      const bh = spec.bandH || (reel ? 900 : 700);
      ph = h('div', { style: { position: 'absolute', left: 0, top: 0, width: ctx.W + 'px', height: bh + 'px', overflow: 'hidden' } },
        h('img', { src: spec.src, style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: spec.objPos || '50% 28%' } }),
        h('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgb(11 11 12 / .35) 0%, rgb(11 11 12 / 0) 22%, rgb(11 11 12 / 0) 55%, var(--bg) 100%)' } }));
      el.append(ph);
      ph.dataset.band = bh;
    } else {
      ph = h('div', { style: { position: 'absolute', left: (spec.photoX ?? (ctx.W - size) / 2) + 'px', top: (spec.photoY ?? (reel ? 330 : 120)) + 'px', width: size + 'px', height: size + 'px', borderRadius: spec.round ? '50%' : '36px', overflow: 'hidden', boxShadow: '0 0 0 2px var(--line)' } },
        h('img', { src: spec.src, style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: spec.objPos || '50% 30%' } }));
      el.append(ph);
    }
    const phBottom = spec.band ? +ph.dataset.band - (spec.bandOverlap ?? 120) : parseFloat(ph.style.top) + size;
    let sigline = null;
    if (spec.signal !== false) { sigline = h('div.signal-line', { style: { left: S.x0 + 'px', width: (S.x1 - S.x0) + 'px', top: (phBottom + 40) + 'px' } }); el.append(sigline); }
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (phBottom + 80) + 'px', gap: '22px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = headline(spec.lines, spec.size || (reel ? 84 : 70)); box.append(hd);
    const sub = spec.sub ? para(spec.sub) : null; if (sub) box.append(sub);
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      tl.in(ph, 'blur', 0.05, 1.0).to(ph.firstChild, 's', 1.12, 1.0, 0.05, spec.dur || 5, 'out');
      if (sigline) tl.to(sigline, 'clip', [0, 100, 0, 0], [0, 0, 0, 0], 0.6, 0.9, 'inOut');
      animLines(tl, hd, 0.8); tl.caption(0.8, spec.dur, spec.lines.join(' '));
      if (sub) { tl.in(sub, 'up', 1.6, 0.6); tl.caption(1.6, spec.dur, spec.sub); }
      tl.sfx(0.05, 'riser', 0.4);
    }
    return sc;
  };

  // ── 15 · capture (real, dated screenshot) ──
  L.capture = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const device = spec.device || 'phone';
    let frame, img;
    if (device === 'phone') {
      const scale = spec.scale || (reel ? 1.12 : 0.92);
      const pw = 560 * scale;
      const ph_ = U.phone({ x: spec.px ?? (ctx.W - pw) / 2, y: spec.py ?? (reel ? 600 : 360), scale, statusBar: false });
      img = h('img', { src: spec.src, style: { width: '100%', display: 'block' } });
      const lay = h('div', { style: { position: 'absolute', inset: 0, overflow: 'hidden' } }, img);
      ph_.scr.append(lay);
      frame = ph_.el; el.append(frame);
    } else {
      const w = spec.w || (S.x1 - S.x0);
      frame = h('div', { style: { position: 'absolute', left: (spec.px ?? S.x0) + 'px', top: (spec.py ?? (reel ? 640 : 400)) + 'px', width: w + 'px', height: (spec.hgt || (reel ? 700 : 620)) + 'px', borderRadius: '22px', overflow: 'hidden', background: '#fff', boxShadow: '0 0 0 2px var(--line), 0 40px 80px -30px rgb(0 0 0 / .6)' } },
        h('div', { style: { height: '46px', background: '#e9e9e6', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 18px' } }, ['#ff5f57', '#febc2e', '#28c840'].map((c) => h('i', { style: { width: '14px', height: '14px', borderRadius: '50%', background: c, display: 'block' } })), h('span', { style: { marginLeft: '16px', fontFamily: 'var(--mono)', fontSize: '18px', color: '#666' } }, spec.url || '')));
      img = h('img', { src: spec.src, style: { width: '100%', display: 'block' } });
      const lay = h('div', { style: { position: 'absolute', top: '46px', left: 0, right: 0, bottom: 0, overflow: 'hidden' } }, img);
      frame.append(lay); el.append(frame);
    }
    if (spec.imgY) img.style.transform = `translateY(${-spec.imgY}px)`;
    let hd = null;
    if (spec.lines) {
      const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', gap: '18px', top: (reel ? S.y0 + 80 : S.y0 + 70) + 'px' } });
      if (spec.eyebrow) box.append(label(spec.eyebrow));
      hd = headline(spec.lines, spec.size || (reel ? 82 : 66)); box.append(hd);
      if (spec.sub) box.append(para(spec.sub, 'body', { fontSize: reel ? '40px' : '32px' }));
      el.append(box);
    }
    const callouts = (spec.callouts || []).map((c) => { const co = h('div.callout', { style: { left: c.x + 'px', top: c.y + 'px', flexDirection: c.side === 'left' ? 'row-reverse' : 'row' } }, c.ring !== false ? h('div.ring' + (c.bad ? '.bad' : ''), { style: { width: (c.r || 120) + 'px', height: (c.r || 120) + 'px', marginLeft: -(c.r || 120) / 2 + 'px', marginTop: -(c.r || 120) / 2 + 'px' } }) : null, c.text ? h('div', { style: { width: '36px', height: '4px', background: c.bad ? 'var(--err)' : 'var(--acc)' } }) : null, c.text ? h('div.tag' + (c.bad ? '.bad' : ''), { html: rich(c.text), 'data-check': '1' }) : null); el.append(co); return co; });
    chrome(sc, { ...spec, badge: spec.badge || { text: spec.caption || 'Real capture', kind: 'real' } }, ctx);
    if (reel) {
      tl.to(frame, 'y', 120, 0, 0.05, 0.9, 'expo').to(frame, 'o', 0, 1, 0.05, 0.3, 'linear');
      if (spec.scrollTo) tl.to(img, 'y', -(spec.imgY || 0), -spec.scrollTo, spec.scrollAt || 1.2, spec.scrollDur || 2.2, 'inOut');
      if (hd) { animLines(tl, hd, 0.2); tl.caption(0.2, spec.dur, spec.lines.join(' ')); }
      callouts.forEach((co, i) => { const c = spec.callouts[i]; tl.in(co, 'pop', c.at ?? 1.5 + i * 0.6, 0.5); tl.sfx(c.at ?? 1.5 + i * 0.6, 'pop', 0.5); if (c.text) tl.caption(c.at ?? 1.5 + i * 0.6, spec.dur, c.text); });
    } else if (spec.scrollTo) img.style.transform = `translateY(${-spec.scrollTo}px)`;
    return sc;
  };

  // ── 16 · end card ──
  L.end = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: '50%', transform: 'translateY(-50%)', gap: '40px' } });
    let lab = null; if (spec.eyebrow) { lab = label(spec.eyebrow); box.append(lab); }
    const hd = headline(spec.lines, spec.size || (reel ? 104 : 92));
    box.append(hd);
    const sub = spec.sub ? para(spec.sub) : null; if (sub) box.append(sub);
    let cta = null;
    if (spec.cta) { cta = h('div.btn', { style: { alignSelf: 'flex-start', fontSize: reel ? '40px' : '34px', height: reel ? '110px' : '96px' }, 'data-check': '1' }, spec.cta); box.append(cta); }
    let nxt = null;
    if (spec.next) { nxt = h('div', { style: { borderTop: '2px solid var(--line)', paddingTop: '28px' } }, h('div.label', { html: `<span class="dot"></span>${rich(spec.next.label || 'Next')}` }), h('div', { style: { fontSize: reel ? '44px' : '36px', fontWeight: 560, letterSpacing: '-0.02em', marginTop: '12px', color: 'var(--fg)', lineHeight: 1.2 }, html: rich(spec.next.text), 'data-check': '1' })); box.append(nxt); }
    el.append(box);
    const mark = h('div', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', ...(reel ? { top: '280px' } : { bottom: '70px' }), display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
      h('div', { html: ctx.wordmark || '', style: { height: reel ? '46px' : '40px', display: 'flex' }, class: 'wm' }),
      h('div.label', { style: { color: 'var(--fg)' } }, spec.url || 'mannpatel.me'));
    el.append(mark);
    chrome(sc, { ...spec, meta: spec.meta ?? false }, ctx);
    if (reel) {
      if (lab) tl.in(lab, 'fade', 0.1, 0.4);
      const end = animLines(tl, hd, 0.15, 'rise', 0.12, 0.8);
      tl.caption(0.15, spec.dur, spec.lines.join(' '));
      if (sub) { tl.in(sub, 'up', end - 0.3, 0.6); tl.caption(end - 0.3, spec.dur, spec.sub); }
      if (cta) { tl.in(cta, 'pop', end + 0.1, 0.5); tl.caption(end + 0.1, spec.dur, spec.cta); tl.sfx(end + 0.1, 'success', 0.6); }
      if (nxt) { tl.in(nxt, 'up', end + 0.5, 0.6); tl.caption(end + 0.5, spec.dur, (spec.next.label || 'Next') + ': ' + spec.next.text); }
      tl.in(mark, 'fade', 0.4, 0.6);
    }
    return sc;
  };

  // ── 17 · cover (carousel first slide) ──
  L.cover = function (spec, ctx) {
    const sc = L.hook({ ...spec, pos: spec.pos || 'center', swipe: spec.swipe ?? true, size: spec.size || sizeFor(ctx, 124, 132) }, ctx);
    return sc;
  };

  // ── 18 · myth vs mechanism ──
  L.myth = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: '50%', transform: 'translateY(-50%)', gap: '44px' } });
    const a = h('div', null, h('div.label', { style: { color: 'var(--fg3)', marginBottom: '16px' }, html: rich(spec.aLabel || 'You might hear') }), h('div', { style: { fontSize: (reel ? 70 : 60) + 'px', fontWeight: 560, letterSpacing: '-0.03em', lineHeight: 1.08, color: 'var(--fg3)', textDecoration: spec.strike === false ? 'none' : 'line-through', textDecorationColor: 'var(--err)', textDecorationThickness: '5px' }, html: rich(spec.a), 'data-check': '1' }));
    const b = h('div', null, h('div.label', { style: { color: 'var(--acc-text)', marginBottom: '16px' }, html: `<span class="dot"></span>${rich(spec.bLabel || 'What actually happens')}` }), h('div', { style: { fontSize: (reel ? 70 : 60) + 'px', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.08, color: 'var(--fg)' }, html: rich(spec.b), 'data-check': '1' }));
    box.append(a, h('div.hair'), b);
    if (spec.sub) box.append(para(spec.sub));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) { tl.in(a, 'up', 0.15, 0.6); tl.caption(0.15, spec.bAt ?? 1.8, (spec.aLabel || 'You might hear') + ': ' + spec.a); tl.in(b, 'wipe', spec.bAt ?? 1.8, 0.7); tl.sfx(spec.bAt ?? 1.8, 'whoosh', 0.6); tl.caption(spec.bAt ?? 1.8, spec.dur, (spec.bLabel || 'What actually happens') + ': ' + spec.b); }
    return sc;
  };

  // ── 19 · timeline (times down the side) ──
  L.timeline = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (reel ? S.y0 + 80 : S.y0 + 90) + 'px', gap: '26px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 84 : 68)) : null; if (hd) box.append(hd);
    const list = h('div', { style: { position: 'relative', marginTop: '10px' } });
    const rail = h('div', { style: { position: 'absolute', left: (reel ? 200 : 180) + 'px', top: '20px', bottom: '20px', width: '3px', background: 'var(--line)' } });
    list.append(rail);
    const rows = (spec.events || []).map((ev) => {
      const r = h('div', { style: { display: 'grid', gridTemplateColumns: (reel ? 200 : 180) + 'px 1fr', alignItems: 'start', padding: (reel ? 34 : 24) + 'px 0', position: 'relative' } },
        h('div', { style: { fontFamily: 'var(--mono)', fontSize: (reel ? 34 : 28) + 'px', color: ev.hot ? 'var(--acc-text)' : 'var(--fg3)', paddingTop: '6px' } }, ev.time),
        h('div', { style: { paddingLeft: '44px', position: 'relative' } },
          h('i', { style: { position: 'absolute', left: '-10px', top: '14px', width: '22px', height: '22px', borderRadius: '50%', background: ev.bad ? 'var(--err)' : ev.hot ? 'var(--acc)' : 'var(--fg3)', display: 'block' } }),
          h('div', { style: { fontSize: (reel ? 52 : 40) + 'px', lineHeight: 1.22, color: 'var(--fg)', fontWeight: 500, letterSpacing: '-0.015em' }, html: rich(ev.text), 'data-check': '1' })));
      list.append(r); return r;
    });
    box.append(list);
    if (spec.foot) box.append(para(spec.foot, 'small'));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      let t = hd ? animLines(tl, hd, 0.1) - 0.3 : 0.2;
      if (hd) tl.caption(0.1, spec.dur, spec.lines.join(' '));
      rows.forEach((r, i) => { const at = spec.events[i].at ?? t + i * (spec.per || 1.0); tl.in(r, 'up', at, 0.5, 30); tl.sfx(at, spec.events[i].sfx || (spec.events[i].bad ? 'error' : 'tick'), 0.6); tl.caption(at, spec.dur, spec.events[i].time + ' — ' + spec.events[i].text); });
    }
    return sc;
  };

  // ── 20 · grid of cards ──
  L.grid = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (spec.top ?? (reel ? S.y0 + 80 : S.y0 + 90)) + 'px', gap: '30px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 80 : 66)) : null; if (hd) box.append(hd);
    const cols = spec.cols || (reel ? 1 : 2);
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '22px' } });
    const cards = (spec.cards || []).map((c) => {
      const card = h('div.card', { style: { padding: reel ? '34px 38px' : '30px 32px', display: 'flex', flexDirection: 'column', gap: '12px', ...(c.hot ? { boxShadow: '0 0 0 4px var(--acc)' } : {}) } },
        c.k ? h('div.label', { style: { fontSize: reel ? '26px' : '21px', color: c.hot ? 'var(--acc-text)' : 'var(--fg3)' } }, c.k) : null,
        h('div', { style: { fontSize: (reel ? 46 : 36) + 'px', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--fg)' }, html: rich(c.t), 'data-check': '1' }),
        c.d ? h('div', { style: { fontSize: (reel ? 34 : 27) + 'px', lineHeight: 1.35, color: 'var(--fg2)' }, html: rich(c.d) }) : null);
      grid.append(card); return card;
    });
    box.append(grid);
    if (spec.foot) box.append(para(spec.foot, 'small'));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      let t = hd ? animLines(tl, hd, 0.1) - 0.3 : 0.2;
      if (hd) tl.caption(0.1, spec.dur, spec.lines.join(' '));
      cards.forEach((c, i) => { tl.in(c, 'up', t + i * (spec.per || 0.6), 0.6, 40); tl.sfx(t + i * (spec.per || 0.6), 'pop', 0.4); tl.caption(t + i * (spec.per || 0.6), spec.dur, (spec.cards[i].k ? spec.cards[i].k + ': ' : '') + E.plain(spec.cards[i].t) + (spec.cards[i].d ? '. ' + E.plain(spec.cards[i].d) : '')); });
    }
    return sc;
  };

  // ── 21 · prompt (diagnostic question) ──
  L.prompt = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: '50%', transform: 'translateY(-50%)', gap: '30px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = headline(spec.lines, spec.size || (reel ? 92 : 80)); box.append(hd);
    const opts = (spec.options || []).map((o, i) => {
      const r = h('div.surf', { style: { display: 'flex', gap: '24px', alignItems: 'center', padding: (reel ? 30 : 28) + 'px 30px', borderRadius: '24px', boxShadow: '0 0 0 2px var(--line)' } },
        h('div', { style: { width: (reel ? 72 : 66) + 'px', height: (reel ? 72 : 66) + 'px', flex: 'none', borderRadius: '50%', background: '#d4f84a', color: '#0b0b0c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: (reel ? 36 : 30) + 'px', fontFamily: 'var(--mono)' } }, o.k || String.fromCharCode(65 + i)),
        h('div', { style: { fontSize: (reel ? 44 : 40) + 'px', lineHeight: 1.25, color: 'var(--on-surface)', fontWeight: 520 }, html: rich(o.t), 'data-check': '1' }));
      box.append(r); return r;
    });
    if (spec.foot) box.append(para(spec.foot, 'small', { marginTop: '10px' }));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) { const end = animLines(tl, hd, 0.1); tl.caption(0.1, spec.dur, spec.lines.join(' ')); opts.forEach((o, i) => { tl.in(o, 'left', end - 0.2 + i * 0.4, 0.5); tl.caption(end - 0.2 + i * 0.4, spec.dur, (spec.options[i].k || String.fromCharCode(65 + i)) + ': ' + spec.options[i].t); }); }
    return sc;
  };

  // ── 22 · log (monospace test log) ──
  L.log = function (spec, ctx) {
    const sc = base(spec, { ...ctx, dir: spec.dir || 'blueprint' }); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (reel ? S.y0 + 80 : S.y0 + 90) + 'px', gap: '26px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 80 : 64)) : null; if (hd) box.append(hd);
    const term = h('div', { style: { background: 'rgb(0 0 0 / .35)', borderRadius: '24px', padding: reel ? '34px' : '28px', boxShadow: '0 0 0 2px var(--line)', fontFamily: 'var(--mono)', fontSize: (reel ? 34 : 27) + 'px', lineHeight: 1.45, color: 'var(--fg2)' } });
    const rows = (spec.entries || []).map((e) => {
      const r = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', padding: '12px 0', borderTop: '2px solid var(--line)' } },
        h('div', { html: `<span style="color:var(--fg3)">${rich(e.k || '›')}</span> ${rich(e.t)}`, 'data-check': '1' }),
        e.res ? h('span.chip.' + (e.cls || 'pass'), { style: { alignSelf: 'start' } }, e.res) : h('span'));
      term.append(r); return r;
    });
    box.append(term);
    if (spec.foot) box.append(para(spec.foot, 'small'));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      let t = hd ? animLines(tl, hd, 0.1) - 0.3 : 0.2;
      if (hd) tl.caption(0.1, spec.dur, spec.lines.join(' '));
      tl.in(term, 'fade', t, 0.3);
      rows.forEach((r, i) => { const at = t + 0.2 + i * (spec.per || 0.9); tl.in(r, 'left', at, 0.35, 20); tl.sfx(at, 'typing', 0.25); const e = spec.entries[i]; if (e.res) tl.sfx(at + 0.4, e.cls === 'fail' ? 'error' : 'tick', 0.7); tl.caption(at, spec.dur, E.plain(e.t) + (e.res ? ' — ' + e.res : '')); });
    }
    return sc;
  };

  // ── 23 · counter (waiting clock) ──
  L.counter = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: '50%', transform: 'translateY(-55%)', gap: '24px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const clock = h('div', { style: { fontFamily: 'var(--mono)', fontSize: (reel ? 220 : 190) + 'px', fontWeight: 500, letterSpacing: '-0.04em', color: spec.clockColor || 'var(--acc-text)', lineHeight: 1 }, 'data-check': '1' }, spec.endText || '0:00');
    box.append(clock);
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 76 : 64)) : null; if (hd) box.append(hd);
    const sub = spec.sub ? para(spec.sub) : null; if (sub) box.append(sub);
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) {
      const from = spec.from || 0, to = spec.to || 120; // minutes
      tl.fn(0.2, spec.countDur || 2.4, (p) => { const m = from + (to - from) * E.ease.inOut(p); const hh = Math.floor(m / 60), mm = Math.floor(m % 60); clock.textContent = spec.fmt === 'clock' ? `${((spec.startHour || 9) + hh) % 12 || 12}:${String(mm).padStart(2, '0')} ${spec.ampm || 'AM'}` : `${hh}:${String(mm).padStart(2, '0')}`; });
      tl.sfx(0.2, 'riser', 0.35);
      if (hd) { animLines(tl, hd, 0.4); tl.caption(0.4, spec.dur, (spec.endText || '') + ' ' + spec.lines.join(' ')); }
      if (sub) { tl.in(sub, 'up', (spec.countDur || 2.4) + 0.2, 0.6); tl.caption((spec.countDur || 2.4) + 0.2, spec.dur, spec.sub); }
    }
    return sc;
  };

  // ── 24 · map (schematic service area) ──
  L.map = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const mw = S.x1 - S.x0, mh = spec.mapH || (reel ? 820 : 640);
    const top = spec.mapTop || (reel ? 620 : 420);
    const wrap = h('div.mapill', { style: { left: S.x0 + 'px', top: top + 'px', width: mw + 'px', height: mh + 'px', boxShadow: '0 0 0 2px var(--line)' } });
    const m = U.mapSVG(mw, mh, spec.seed || 5);
    wrap.append(m);
    const areas = (spec.areas || []).map((a) => {
      const d = h('div', { style: { position: 'absolute', left: a.x + '%', top: a.y + '%', width: a.w + '%', height: a.h + '%', borderRadius: '40% 50% 45% 55%', background: 'rgb(212 248 74 / 0.32)', boxShadow: 'inset 0 0 0 4px #9fbf1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: (reel ? 30 : 24) + 'px', fontWeight: 600, color: '#2f3d00', textTransform: 'uppercase', letterSpacing: '.06em' } }, a.name);
      wrap.append(d); return d;
    });
    const pins = (spec.pins || []).map((p) => { const d = h('div.pin' + (p.me ? '.me' : ''), { style: { left: p.x + '%', top: p.y + '%' } }); wrap.append(d); if (p.label) { const lb = h('div', { style: { position: 'absolute', left: `calc(${p.x}% + 30px)`, top: `calc(${p.y}% - 60px)`, background: '#fff', color: '#111', padding: '8px 14px', borderRadius: '12px', fontSize: (reel ? 28 : 22) + 'px', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 6px 16px rgb(0 0 0 / .18)' } }, p.label); wrap.append(lb); } return d; });
    el.append(wrap);
    let hd = null;
    if (spec.lines) { const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (reel ? S.y0 + 80 : S.y0 + 70) + 'px', gap: '18px' } }); if (spec.eyebrow) box.append(label(spec.eyebrow)); hd = headline(spec.lines, spec.size || (reel ? 80 : 64)); box.append(hd); el.append(box); }
    if (spec.note) { const nt = para(spec.note, 'small', { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: top + mh + 26 + 'px' }); el.append(nt); }
    chrome(sc, { ...spec, badge: spec.badge || { text: 'Schematic map, not to scale', kind: 'illus' }, badgePos: spec.badgePos || 'bottom' }, ctx);
    if (reel) {
      if (hd) { animLines(tl, hd, 0.1); tl.caption(0.1, spec.dur, spec.lines.join(' ')); }
      tl.in(wrap, 'scale', 0.2, 1.0);
      areas.forEach((a, i) => { tl.in(a, 'pop', 0.9 + i * 0.4, 0.6); tl.caption(0.9 + i * 0.4, spec.dur, 'Service area: ' + spec.areas[i].name); });
      pins.forEach((p, i) => { tl.in(p, 'down', 1.2 + i * 0.25, 0.4, 60); tl.sfx(1.2 + i * 0.25, 'pop', 0.4); });
    }
    return sc;
  };

  // ── 25 · type wall (typographic poster) ──
  L.typewall = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const wall = h('div', { style: { position: 'absolute', left: (spec.full ? 40 : S.x0) + 'px', right: (spec.full ? 40 : ctx.W - S.x1) + 'px', top: '50%', transform: 'translateY(-52%)', display: 'flex', flexDirection: 'column', gap: (spec.gap ?? 4) + 'px' } });
    const rows = (spec.rows || []).map((r) => {
      const d = h('div', { style: { fontSize: (r.size || spec.rowSize || (reel ? 128 : 112)) + 'px', fontWeight: r.weight || 620, letterSpacing: '-0.045em', lineHeight: 0.92, whiteSpace: 'nowrap', color: r.hot ? 'var(--acc-text)' : r.dim ? 'var(--fg3)' : 'var(--fg)', textAlign: r.align || spec.align || 'left', opacity: r.ghost ? 0.18 : 1 }, html: rich(r.t), 'data-check': r.ghost ? null : '1' });
      wall.append(d); return d;
    });
    el.append(wall);
    let sub = null; if (spec.sub) { sub = para(spec.sub, 'body', { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', bottom: (reel ? ctx.H - S.y1 + 20 : 150) + 'px' }); el.append(sub); }
    chrome(sc, spec, ctx);
    if (reel) {
      rows.forEach((r, i) => { tl.in(r, spec.rowAnim || 'rise', 0.1 + i * (spec.per || 0.12), 0.7, 60); });
      tl.caption(0.1, spec.dur, spec.rows.filter((r) => !r.ghost).map((r) => r.t).join(' '));
      tl.sfx(0.1, 'whoosh', 0.6);
      if (sub) { tl.in(sub, 'up', spec.subAt || 1.4, 0.6); tl.caption(spec.subAt || 1.4, spec.dur, spec.sub); }
    }
    return sc;
  };

  // ── 26 · compare (two columns of rows) ──
  L.compare = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', top: (spec.top ?? (reel ? S.y0 + 80 : S.y0 + 90)) + 'px', gap: '30px' } });
    if (spec.eyebrow) box.append(label(spec.eyebrow));
    const hd = spec.lines ? headline(spec.lines, spec.size || (reel ? 80 : 66)) : null; if (hd) box.append(hd);
    const g = h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px' } });
    const cols = (spec.columns || []).map((c) => {
      const col = h('div.card', { style: { padding: reel ? '34px' : '30px', display: 'flex', flexDirection: 'column', gap: '18px', ...(c.hot ? { boxShadow: '0 0 0 4px var(--acc)' } : {}) } },
        h('div.label', { style: { color: c.hot ? 'var(--acc-text)' : 'var(--fg3)' }, html: rich(c.label) }),
        h('div', { style: { fontSize: (reel ? 50 : 40) + 'px', fontWeight: 620, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--fg)' }, html: rich(c.title), 'data-check': '1' }),
        ...(c.rows || []).map((r) => h('div', { style: { fontSize: (reel ? 34 : 27) + 'px', lineHeight: 1.35, color: 'var(--fg2)', paddingTop: '14px', borderTop: '2px solid var(--line)' }, html: rich(r) })));
      g.append(col); return col;
    });
    box.append(g);
    if (spec.foot) box.append(para(spec.foot, 'small'));
    el.append(box);
    chrome(sc, spec, ctx);
    if (reel) { let t = hd ? animLines(tl, hd, 0.1) - 0.3 : 0.2; if (hd) tl.caption(0.1, spec.dur, spec.lines.join(' ')); cols.forEach((c, i) => { tl.in(c, 'up', t + i * 0.8, 0.6); tl.sfx(t + i * 0.8, 'swipe', 0.5); tl.caption(t + i * 0.8, spec.dur, E.plain(spec.columns[i].label) + ': ' + E.plain(spec.columns[i].title) + '. ' + (spec.columns[i].rows || []).map(E.plain).join('. ')); }); }
    return sc;
  };

  // ── 27 · image (illustrative or real photo, full-bleed with text) ──
  L.image = function (spec, ctx) {
    const sc = base(spec, ctx); const { el, tl } = sc;
    const reel = isReel(ctx); const S = SAFE[ctx.fmt];
    const img = h('img', { src: spec.src, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: spec.objPos || 'center' } });
    el.append(img);
    el.append(h('div', { style: { position: 'absolute', inset: 0, background: spec.shade || 'linear-gradient(180deg, rgb(11 11 12 / .55) 0%, rgb(11 11 12 / .05) 35%, rgb(11 11 12 / .1) 55%, rgb(11 11 12 / .85) 100%)' } }));
    let hd = null;
    if (spec.lines) { const box = h('div.stack', { style: { position: 'absolute', left: S.x0 + 'px', right: (ctx.W - S.x1) + 'px', gap: '18px' } }); if (spec.eyebrow) box.append(label(spec.eyebrow, { color: '#d9d8d2' })); hd = headline(spec.lines, spec.size || (reel ? 104 : 88)); hd.style.color = '#f2f1ec'; box.append(hd); if (spec.sub) box.append(para(spec.sub, 'body', { color: '#e3e2dc' })); if (spec.textPos === 'top') box.style.top = (S.y0 + 90) + 'px'; else box.style.bottom = (ctx.H - S.y1 + 10) + 'px'; el.append(box); }
    chrome(sc, { ...spec, badge: spec.badge || { text: 'Illustrative image', kind: 'illus' } }, ctx);
    if (reel) { tl.to(img, 's', spec.zoomFrom || 1.12, spec.zoomTo || 1.0, 0, spec.dur || 4, 'linear'); if (hd) { animLines(tl, hd, 0.4); tl.caption(0.4, spec.dur, spec.lines.join(' ') + (spec.sub ? '. ' + spec.sub : '')); } }
    return sc;
  };

  // Registry
  L.build = function (spec, ctx) {
    const fn = L[spec.layout];
    if (!fn) throw new Error('Unknown layout ' + spec.layout);
    const sc = fn(spec, ctx);
    sc.dur = spec.dur || 4;
    sc.tr = spec.tr || 'cut';
    sc.trDur = spec.trDur || 0.4;
    return sc;
  };
})();
