/* Phone and screen builders. Every screen is a labelled demonstration interface built for this
   campaign (generic styling, no third-party logos), or a real dated capture passed in as an image. */
(function () {
  const { h, rich } = window.E;
  const U = {};
  window.U = U;

  U.statusBar = (time = '9:41', dark = false) =>
    h('div.sbar', { style: { color: dark ? '#f2f1ec' : '#111' } },
      h('span', null, time),
      h('span.ic', null,
        h('span.sig', null, [8, 13, 18, 24].map((v) => h('b', { style: { height: v + 'px' } }))),
        h('span.bat')));

  // A phone at (x, y) in frame px, scaled. Returns { el, scr, parts }
  U.phone = function phone(opts = {}) {
    const { x = 260, y = 300, scale = 1, dark = false, time = '9:41', rot = 0 } = opts;
    const scr = h('div.scr' + (dark ? '.dark' : ''));
    const el = h('div.phone', { style: { left: x + 'px', top: y + 'px', transform: `scale(${scale}) rotate(${rot}deg)`, transformOrigin: 'top left' } },
      h('div.island'), scr);
    if (opts.statusBar !== false) scr.append(U.statusBar(time, dark));
    const parts = {};
    if (opts.screen) {
      const built = U.screens[opts.screen.type](opts.screen, parts);
      const wrap = document.createElement('div');
      wrap.style.zoom = String(opts.screen.zoom || U.ZOOM[opts.screen.type] || 1.25);
      wrap.append(built);
      scr.append(wrap);
    }
    return { el, scr, parts };
  };

  // Interface type is scaled up so it reads on a real phone (a 1080 px frame shows at ~390 pt)
  U.ZOOM = { site: 1.3, form: 1.3, thanks: 1.35, inbox: 1.3, sms: 1.32, call: 1.0, profile: 1.22, search: 1.22, booking: 1.15, list: 1.28, lock: 1.12, ai: 1.3, camera: 1.0, image: 1.0 };
  const S = (U.screens = {});

  // Mini website
  S.site = (o, p) => {
    const root = h('div');
    root.append(h('div.site-head', null, h('span', null, o.brand || 'Example Cleaning Co.'), h('span.burger')));
    const hero = h('div.site-hero', null, h('h3', { html: rich(o.h1 || 'Welcome to our website') }), o.sub ? h('p', { html: rich(o.sub) }) : null);
    root.append(hero);
    p.hero = hero;
    if (o.img !== false) {
      const img = h('div.site-img', { style: o.imgStyle || {} });
      if (o.imgSrc) img.append(h('img', { src: o.imgSrc, style: { width: '100%', height: '100%', objectFit: 'cover' } }));
      root.append(img); p.img = img;
    }
    const ctas = h('div.site-cta');
    p.ctas = (o.ctas || []).map((c, i) => { const b = h('div.site-btn' + (i ? '.alt' : ''), null, c); ctas.append(b); return b; });
    if (p.ctas.length) root.append(ctas);
    for (let i = 0; i < (o.blocks ?? 4); i++) root.append(h('div.site-blk' + (i % 2 ? '.s' : '')));
    if (o.footer) { const f = h('div', { style: { margin: '26px 34px', fontSize: '23px', color: '#777', lineHeight: 1.45 } , html: rich(o.footer) }); root.append(f); p.footer = f; }
    return root;
  };

  // Form with fields that can be typed
  S.form = (o, p) => {
    const root = h('div.f-wrap');
    if (o.brand) root.append(h('div', { style: { fontSize: '24px', fontWeight: 650, color: '#666' } }, o.brand));
    root.append(h('div.f-title', { html: rich(o.title || 'Get a quote') }));
    p.inputs = [];
    for (const f of o.fields || []) {
      const inp = h('div.f-input' + (f.area ? '.area' : ''), { 'data-full': f.value || '', 'data-caret': '1' }, f.typed === false ? '' : f.value || '');
      if (f.placeholder && !f.value) { inp.style.color = '#999'; inp.textContent = f.placeholder; }
      root.append(h('div.f-field', null, h('label', null, f.label), inp));
      p.inputs.push(inp);
    }
    if (o.note) root.append(h('div', { style: { fontSize: '21px', color: '#777', lineHeight: 1.4 }, html: rich(o.note) }));
    p.submit = h('div.f-submit', null, o.submit || 'Send request');
    root.append(p.submit);
    if (o.state) { p.state = h('div.state.' + (o.state.kind || 'request'), { html: `<b>${rich(o.state.title)}</b>${rich(o.state.body || '')}` }); root.append(p.state); }
    return root;
  };

  S.thanks = (o, p) => {
    const root = h('div', { style: { padding: '50px 40px', textAlign: 'center' } });
    const tick = h('div', { style: { width: '120px', height: '120px', borderRadius: '50%', background: o.color || '#1e8e3e', margin: '0 auto 28px', position: 'relative' } },
      h('div', { style: { position: 'absolute', left: '42px', top: '22px', width: '32px', height: '60px', borderRight: '11px solid #fff', borderBottom: '11px solid #fff', transform: 'rotate(45deg)' } }));
    root.append(tick, h('div', { style: { fontSize: '44px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }, html: rich(o.title || 'Thank you!') }),
      h('div', { style: { fontSize: '28px', color: '#666', marginTop: '22px', lineHeight: 1.4 }, html: rich(o.body || 'We’ll be in touch soon.') }));
    p.tick = tick;
    return root;
  };

  S.inbox = (o, p) => {
    const root = h('div');
    root.append(h('div.app-title', null, o.title || 'Inbox'));
    if (o.sub) root.append(h('div.app-sub', null, o.sub));
    p.rows = (o.rows || []).map((r) => {
      const row = h('div.rowi', null, h('div.avatar', { style: r.color ? { background: r.color, color: '#fff' } : {} }, (r.from || '?')[0]),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('div.t1', null, r.from), h('div.t2', null, r.subj)),
        h('div.t2', null, r.time || ''));
      root.append(row); return row;
    });
    if (o.empty) { p.empty = h('div.empty', null, h('div.big', null, '∅'), o.empty); root.append(p.empty); }
    return root;
  };

  S.sms = (o, p) => {
    const root = h('div', { style: o.wa ? { background: '#efeae2', height: '100%' } : {} });
    root.append(h('div.msg-head', { style: o.wa ? { background: '#f7f5f2' } : {} }, h('div.avatar', { style: o.avatarColor ? { background: o.avatarColor, color: '#fff' } : {} }, (o.contact || '?')[0]), h('div.nm', null, o.contact || 'Unknown')));
    const th = h('div.thread');
    p.msgs = (o.msgs || []).map((m) => {
      if (m.meta) { const mm = h('div.bub-meta', null, m.meta); th.append(mm); return mm; }
      const cls = o.wa ? (m.dir === 'out' ? 'wa-out' : 'wa-in') : m.dir === 'out' ? 'out' : 'in';
      const b = h('div.bub.' + cls, { html: rich(m.text) + (m.auto ? `<span class="auto">${m.auto}</span>` : '') });
      th.append(b); return b;
    });
    root.append(th);
    return root;
  };

  S.call = (o, p) => {
    const root = h('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#2b2f3a,#111216)', color: '#fff', textAlign: 'center', paddingTop: '230px' } });
    root.append(h('div', { style: { fontSize: '56px', fontWeight: 600, letterSpacing: '-0.02em' } }, o.name || 'Business'));
    p.status = h('div', { style: { fontSize: '32px', opacity: 0.75, marginTop: '16px' } }, o.status || 'calling…');
    root.append(p.status);
    if (o.number) root.append(h('div', { style: { fontSize: '26px', opacity: 0.55, marginTop: '10px' } }, o.number));
    const btns = h('div', { style: { position: 'absolute', bottom: '150px', left: 0, right: 0, display: 'flex', justifyContent: 'center' } });
    p.end = h('div', { style: { width: '130px', height: '130px', borderRadius: '50%', background: '#ff3b30' } });
    btns.append(p.end); root.append(btns);
    return root;
  };

  S.profile = (o, p) => {
    const root = h('div.prof');
    p.photo = h('div.ph', { style: o.photoStyle || {} });
    if (o.photoSrc) p.photo.append(h('img', { src: o.photoSrc, style: { width: '100%', height: '100%', objectFit: 'cover' } }));
    root.append(p.photo);
    p.name = h('div.nm', null, o.name || 'Example Cleaning Co.');
    root.append(p.name);
    const stars = '★★★★★'.slice(0, Math.round(o.rating || 0)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(o.rating || 0));
    root.append(h('div.meta', { html: `${o.rating ? `${o.rating.toFixed(1)} <span class="stars">${stars}</span> (${o.reviews ?? 0})<br>` : 'No reviews<br>'}${rich(o.category || 'House cleaning service')}${o.area ? ' · ' + rich(o.area) : ''}` }));
    if (o.hours) { p.hours = h('div.hours', { html: `<span class="${o.hours.state === 'open' ? 'open' : 'closed'}">${o.hours.state === 'open' ? 'Open' : 'Closed'}</span> · ${rich(o.hours.text || '')}` }); root.append(p.hours); }
    const acts = h('div.acts');
    p.acts = (o.acts || ['Call', 'Directions', 'Website', 'Book']).map((a) => { const b = h('div.act', null, h('i'), a); acts.append(b); return b; });
    root.append(acts);
    p.lines = (o.lines || []).map((l) => { const d = h('div.line', { html: `<b>${l.k || '·'}</b><span>${rich(l.v)}</span>` }); root.append(d); return d; });
    return root;
  };

  S.search = (o, p) => {
    const root = h('div');
    p.bar = h('div.srch', null, h('span', { style: { width: '30px', height: '30px', borderRadius: '50%', border: '4px solid #666', flex: 'none' } }), h('span', { 'data-full': o.query || '' }, o.query || ''));
    root.append(p.bar);
    p.query = p.bar.lastChild;
    const map = h('div.map', { style: { height: (o.mapH || 380) + 'px' } });
    map.append(U.mapSVG(560, o.mapH || 380, o.seed || 3));
    p.pins = (o.pins || [[30, 40], [55, 62], [72, 35]]).map(([x, y], i) => { const pin = h('div.pin' + (i === (o.mine ?? -1) ? '.me' : ''), { style: { left: x + '%', top: y + '%' } }); map.append(pin); return pin; });
    root.append(map);
    p.results = (o.results || []).map((r) => { const d = h('div.res', null, h('div.rn', { html: rich(r.name) }), h('div.rm', { html: rich(r.meta || '') })); root.append(d); return d; });
    return root;
  };

  S.booking = (o, p) => {
    const root = h('div');
    root.append(h('div.app-title', { style: { fontSize: '42px' } }, o.title || 'Choose a time'));
    if (o.sub) root.append(h('div.app-sub', null, o.sub));
    const cal = h('div.cal');
    for (const d of ['S', 'M', 'T', 'W', 'T', 'F', 'S']) cal.append(h('div.dw', null, d));
    const start = o.startDow ?? 0;
    if (!o.range) for (let i = 0; i < start; i++) cal.append(h('div'));
    p.days = [];
    const [d0, d1] = o.range || [1, o.days || 28];
    if (o.range) { cal.innerHTML = ''; for (const dd of ['S', 'M', 'T', 'W', 'T', 'F', 'S']) cal.append(h('div.dw', null, dd)); const lead = (start + d0 - 1) % 7; for (let i = 0; i < lead; i++) cal.append(h('div')); }
    for (let d = d0; d <= d1; d++) {
      const dow = (start + d - 1) % 7;
      const off = (o.offDows || [0]).includes(dow) || (o.offDays || []).includes(d);
      const el = h('div.d' + (off ? '.off' : '') + (d === o.sel ? '.sel' : ''), null, String(d));
      cal.append(el); p.days.push(el);
    }
    root.append(cal);
    const slots = h('div.slots');
    p.slots = (o.slots || []).map((s) => { const el = h('div.slot' + (s === o.selSlot ? '.sel' : ''), null, s); slots.append(el); return el; });
    if (p.slots.length) root.append(slots);
    if (o.button) { p.button = h('div.f-submit', { style: { margin: '14px 26px' } }, o.button); root.append(p.button); }
    if (o.state) { p.state = h('div.state.' + (o.state.kind || 'request'), { html: `<b>${rich(o.state.title)}</b>${rich(o.state.body || '')}` }); root.append(p.state); }
    return root;
  };

  S.list = (o, p) => {
    const root = h('div', { style: { height: '100%' } });
    root.append(h('div.app-title', { style: { fontSize: '44px' } }, o.title || 'Enquiries'));
    if (o.sub) root.append(h('div.app-sub', null, o.sub));
    p.rows = []; p.chips = [];
    for (const r of o.rows || []) {
      const chip = h('span.chip.' + (r.chipClass || 'new'), null, r.chip || 'New');
      const row = h('div.rowi', null,
        h('div', { style: { flex: 1, minWidth: 0 } }, h('div.t1', null, r.name), h('div.t2', null, r.sub || '')), chip);
      root.append(row); p.rows.push(row); p.chips.push(chip);
    }
    if (o.alert) { p.alert = h('div.state.' + (o.alert.kind || 'fail'), { html: `<b>${rich(o.alert.title)}</b>${rich(o.alert.body || '')}` }); root.append(p.alert); }
    return root;
  };

  S.lock = (o, p) => {
    const root = h('div.lock');
    root.append(h('div', { style: { height: '104px' } }));
    root.append(h('div.clock', null, o.time || '9:41'), h('div.date', null, o.date || 'Wednesday, November 11'));
    const wrap = h('div', { style: { position: 'absolute', left: 0, right: 0, top: o.notifTop || '470px', display: 'flex', flexDirection: 'column', gap: '16px' } });
    p.notifs = (o.notifs || []).map((n) => {
      const el = h('div.notif', null, h('div.ico', { style: n.icoBg ? { background: n.icoBg, color: n.icoFg || '#fff' } : {} }, n.ico || 'M'),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('div.row', null, h('div.nt', null, n.app || 'Messages'), h('div.tm', null, n.time || 'now')), h('div.nb', { html: rich(n.body || '') })));
      wrap.append(el); return el;
    });
    root.append(wrap);
    return root;
  };

  S.ai = (o, p) => {
    const root = h('div', { style: { background: '#f7f7f5', height: '100%' } });
    root.append(h('div', { style: { padding: '20px 34px', fontSize: '24px', fontWeight: 650, color: '#555' } }, o.app || 'AI assistant (demo)'));
    p.q = h('div.bub.out', { style: { margin: '10px 26px', marginLeft: 'auto', background: '#222', maxWidth: '78%' }, html: rich(o.question || '') });
    root.append(h('div', { style: { display: 'flex', flexDirection: 'column', padding: '0 0' } }, p.q));
    p.a = h('div', { style: { margin: '18px 34px', fontSize: '27px', lineHeight: 1.45, color: '#222' }, 'data-full': E.plain(o.answer || '') }, E.plain(o.answer || ''));
    root.append(p.a);
    if (o.sources) { p.src = h('div', { style: { margin: '0 34px', display: 'flex', gap: '10px', flexWrap: 'wrap' } }, o.sources.map((s) => h('span', { style: { fontSize: '21px', padding: '8px 14px', borderRadius: '20px', background: '#e7e6e1', color: '#444' } }, s))); root.append(p.src); }
    return root;
  };

  S.camera = (o, p) => {
    const root = h('div.cam');
    if (o.bg) root.append(h('div', { style: { position: 'absolute', inset: 0, ...o.bg } }));
    const vf = h('div.vf');
    const card = h('div', { style: { position: 'absolute', left: '90px', top: '250px', width: '380px', height: '520px', background: '#fbf8f1', borderRadius: '10px', transform: 'rotate(-4deg)', boxShadow: '0 30px 50px rgb(0 0 0 / .5)', display: 'flex', alignItems: 'center', justifyContent: 'center' } });
    if (o.qrSvg) card.append(h('div', { style: { width: '280px', height: '280px' }, html: o.qrSvg }));
    root.append(card, vf);
    p.card = card;
    p.corners = [];
    for (const [l, t, r] of [[0, 0, 0], [1, 0, 90], [1, 1, 180], [0, 1, 270]]) {
      const c = h('div.corner', { style: { left: l ? 'auto' : '120px', right: l ? '120px' : 'auto', top: t ? 'auto' : '290px', bottom: t ? '400px' : 'auto', borderRight: 'none', borderBottom: 'none', transform: `rotate(${r}deg)` } });
      root.append(c); p.corners.push(c);
    }
    p.pill = h('div.cam .pill', { class: 'pill' }, o.link || 'example.com');
    root.append(p.pill);
    return root;
  };

  S.image = (o, p) => {
    const root = h('div', { style: { position: 'absolute', inset: o.inset || '0', overflow: 'hidden' } });
    p.img = h('img', { src: o.src, style: { width: '100%', display: 'block', transformOrigin: 'top center' } });
    root.append(p.img);
    return root;
  };

  // Simple schematic street map (procedural, not real geography)
  U.mapSVG = function mapSVG(w, h_, seed = 3) {
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const svg = E.svg('svg', { width: w, height: h_, viewBox: `0 0 ${w} ${h_}` });
    svg.append(E.svg('rect', { width: w, height: h_, fill: '#e8ecef' }));
    // parks and water
    svg.append(E.svg('path', { d: `M${w * 0.62} 0 Q ${w * 0.7} ${h_ * 0.3} ${w * 0.95} ${h_ * 0.35} L ${w} 0 Z`, fill: '#cfe6f2' }));
    svg.append(E.svg('rect', { x: w * 0.08, y: h_ * 0.58, width: w * 0.22, height: h_ * 0.26, rx: 14, fill: '#d5ead3' }));
    for (let i = 0; i < 7; i++) {
      const y = (i + 0.5) * (h_ / 7) + (rnd() - 0.5) * 14;
      svg.append(E.svg('path', { d: `M0 ${y} C ${w * 0.3} ${y + (rnd() - 0.5) * 40}, ${w * 0.7} ${y + (rnd() - 0.5) * 40}, ${w} ${y + (rnd() - 0.5) * 20}`, stroke: '#fff', 'stroke-width': i % 3 === 0 ? 14 : 7, fill: 'none' }));
    }
    for (let i = 0; i < 6; i++) {
      const x = (i + 0.5) * (w / 6) + (rnd() - 0.5) * 20;
      svg.append(E.svg('path', { d: `M${x} 0 L ${x + (rnd() - 0.5) * 60} ${h_}`, stroke: '#fff', 'stroke-width': i % 2 ? 7 : 12, fill: 'none' }));
    }
    return svg;
  };
})();
