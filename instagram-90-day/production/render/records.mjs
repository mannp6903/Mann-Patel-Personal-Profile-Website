// Writes the production record for one post from its data and its render report:
// brief.md, script-and-shot-list.md, caption.txt, alt-text.txt, publishing-notes.md and captions.srt.
import fs from 'node:fs';
import path from 'node:path';
import { services, SITE } from '../source/catalog.mjs';

const plain = (s) => String(s ?? '').replace(/==|\*|\[\[|\]\]/g, '').replace(/(^|\s)_(.+?)_(?=\s|$|[.,;:!?])/g, '$1$2').replace(/_/g, '');
const words = (s) => plain(s).split(/\s+/).filter(Boolean).length;
const DIRS = {
  night: 'near-black #0B0B0C, off-white type, one lime #D4F84A accent',
  paper: 'off-white paper #F2F1EC, ink type, lime used as a highlighter',
  daylight: 'soft daylight gradient, ink type, lime marks',
  blueprint: 'dark slate grid, mono annotations, lime highlights',
  signal: 'full-bleed lime #D4F84A with ink type',
  print: 'kraft-cream paper with grain, tactile print pieces, crop and bleed marks',
  dusk: 'dusk street palette, warm window light, lime accents',
};
export const fmtLabel = (f) => ({ reel: 'Reel', carousel: 'Carousel', still: 'Single image' }[f] || f);

// ── visible text of a scene/slide spec ──
export function textOf(s) {
  const out = [];
  const push = (v) => { if (v == null) return; if (Array.isArray(v)) v.forEach(push); else if (typeof v === 'string') out.push(plain(v)); };
  push(s.eyebrow); push(s.lines); push(s.num); if (s.count != null) push(`${s.prefix || ''}${s.count}${s.suffix || ''}`); push(s.sub); push(s.text); push(s.who);
  (s.items || []).forEach((i) => { push(i.t); push(i.s); });
  (s.steps || []).forEach((i) => { push(i.t); push(i.d); });
  (s.cards || []).forEach((i) => { push(i.k); push(i.t); push(i.d); });
  (s.events || []).forEach((i) => push(`${i.time} ${plain(i.text)}`));
  (s.msgs || []).forEach((m) => push((m.who ? m.who + ': ' : '') + plain(m.text)));
  (s.options || []).forEach((o, i) => push(`${o.k || String.fromCharCode(65 + i)}: ${plain(o.t)}`));
  (s.entries || []).forEach((e) => push(`${plain(e.t)}${e.res ? ' (' + e.res + ')' : ''}`));
  (s.nodes || []).forEach((n) => push(`${n.label ? plain(n.label) + ': ' : ''}${plain(n.text)}`));
  (s.columns || []).forEach((c) => { push(c.label); push(c.title); push(c.rows); });
  if (s.cols) push(s.cols.join(' | '));
  (s.rows || []).forEach((r) => { if (Array.isArray(r)) push(r.map((c) => (c && c.chip) || plain(c ?? '')).join(' | ')); else if (r && r.t && !r.ghost) push(r.t); });
  (s.panes || []).forEach((p) => { push(p.label); push(p.text); push(p.note); (p.items || []).forEach((i) => push(i.t)); });
  (s.callouts || []).forEach((c) => push(c.text));
  (s.notes || []).forEach((c) => push(c.text));
  if (s.a) push(`${s.aLabel || 'You might hear'}: ${plain(s.a)}`);
  if (s.b) push(`${s.bLabel || 'What actually happens'}: ${plain(s.b)}`);
  push(s.headline); push(s.body); push(s.qrLabel);
  push(s.cta); if (s.next) push(`${s.next.label || 'Next'}: ${plain(s.next.text)}`);
  push(s.foot); push(s.note);
  return out.filter(Boolean);
}

const SCREEN_DESC = {
  site: 'a demo business website', form: 'a demo quote form', thanks: 'a thank-you screen', inbox: 'an email inbox', sms: 'a text message thread',
  call: 'a phone call screen', profile: 'a demo business profile with hours and buttons', search: 'local search results with a map', booking: 'a demo booking calendar',
  list: 'a demo enquiry list with status labels', lock: 'a lock screen with notifications', ai: 'a demo AI assistant answer', camera: 'a phone camera reading a QR code', image: 'a real screenshot',
};
function visualOf(s) {
  const badge = s.badge ? ` Labelled “${plain(s.badge.text || s.badge)}”.` : '';
  switch (s.layout) {
    case 'phone': { const sc = (s.screens || [s.screen]).filter(Boolean); return `A phone showing ${sc.map((x) => SCREEN_DESC[x.type] || x.type).join(', then ')}.${badge}`; }
    case 'split': return `Two side-by-side panels: ${(s.panes || []).map((p) => plain(p.label)).join(' and ')}.${badge}`;
    case 'print': return `A printed ${({ card: 'business card', flyer: 'flyer', door: 'door hanger', gift: 'gift card' })[s.kind || 'card']} on kraft paper${s.qrSvg || s.qr ? ' with a QR code' : ''}${s.guides ? ', with red bleed and blue safe-area guides' : ''}.${badge}`;
    case 'storefront': return 'An illustrated shop front at dusk with a glowing OPEN sign.' + badge;
    case 'portrait': return 'Photo of Mann Patel smiling, in a dark green sweatshirt, on a tree-lined street at dusk.';
    case 'capture': return `A real, dated screenshot${s.url ? ' of ' + s.url : ''}${s.device === 'browser' ? ' in a browser window' : ' on a phone'}.${badge}`;
    case 'map': return 'A schematic street map with a highlighted service area and pins.' + badge;
    case 'flow': return 'A diagram of connected boxes showing where an enquiry goes.' + badge;
    case 'checklist': return 'A checklist with tick boxes.' + badge;
    case 'chat': return 'Chat bubbles.' + badge;
    case 'image': return (s.alt || 'An illustrative photo.') + badge;
    default: return badge.trim();
  }
}
export function altFor(s, i, n, kind) {
  if (s.alt && s.layout !== 'image') return s.alt;
  const head = n > 1 ? `Slide ${i + 1} of ${n}. ` : '';
  const vis = visualOf(s);
  const txt = textOf(s).join(' ').replace(/\s+/g, ' ');
  let alt = `${head}${vis ? vis + ' ' : ''}Text: ${txt}`;
  return alt.trim();
}

// ── SRT from on-screen captions ──
const ts = (t) => { const ms = Math.max(0, Math.round(t * 1000)); const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000), x = ms % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(x).padStart(3, '0')}`; };
function wrap(text, max = 40) {
  const ws = text.split(/\s+/); const lines = []; let cur = '';
  for (const w of ws) { if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  return lines;
}
const SOUND_WORDS = { ring: '[Phone ringing]', ringtone: '[Phone ringtone]', vibrate: '[Phone vibrates]', notify: '[Notification chime]', error: '[Error buzz]', success: '[Success chime]', typing: '[Typing]', door: '[Shop door chime]', shutter: '[Camera shutter]', scan: '[Scanner beep]', street: '[Street sounds]' };
export function srt(captions, cues, duration) {
  const items = [];
  const sorted = captions.slice().sort((a, b) => a.at - b.at);
  // each caption runs until the next one starts, or its own end
  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    const nextAt = sorted.slice(i + 1).find((x) => x.at > c.at + 0.05)?.at ?? duration;
    let end = Math.min(c.until, nextAt);
    if (end - c.at < 0.9) end = Math.min(c.at + 0.9, duration);
    const lines = wrap(c.text);
    // split into chunks of two lines, timed by length
    const chunks = [];
    for (let k = 0; k < lines.length; k += 2) chunks.push(lines.slice(k, k + 2).join('\n'));
    const total = chunks.reduce((a, ch) => a + ch.length, 0) || 1;
    let t = c.at;
    for (const ch of chunks) { const d = (end - c.at) * (ch.length / total); items.push({ at: t, until: t + d, text: ch }); t += d; }
  }
  // sound descriptors where no text is on screen
  const seen = new Set();
  for (const q of cues || []) {
    const word = SOUND_WORDS[q.name]; if (!word) continue;
    const key = word + Math.round(q.at);
    if (seen.has(key)) continue; seen.add(key);
    const busy = items.some((it) => q.at >= it.at - 0.05 && q.at < it.until);
    if (!busy) items.push({ at: q.at, until: Math.min(q.at + 1.2, duration), text: word });
  }
  items.sort((a, b) => a.at - b.at);
  // remove overlaps
  for (let i = 0; i < items.length - 1; i++) if (items[i].until > items[i + 1].at) items[i].until = items[i + 1].at;
  return items.filter((it) => it.until - it.at > 0.2).map((it, i) => `${i + 1}\n${ts(it.at)} --> ${ts(it.until)}\n${it.text}\n`).join('\n');
}

function svcLine(ids) { return (ids || []).map((id) => `${id} (${services[id]?.name || '??'})`).join('; '); }
const relLine = (r) => (r || []).map((x) => (typeof x === 'string' ? x : `${x.id}${x.why ? ' — ' + x.why : ''}`)).join('; ');

export function writeRecords(post, rep, dir) {
  fs.mkdirSync(path.join(dir, 'export'), { recursive: true });
  const hooks = post.hooks || [];
  const chosen = hooks[post.chosen ?? 0] || {};
  const slides = post.format === 'reel' ? [] : post.slides;
  const files = rep.files || [];

  // brief.md
  const brief = `# ${post.id} · ${post.title}

| Field | Value |
| --- | --- |
| Day / slot | Day ${String(post.day).padStart(2, '0')}, post ${post.slot} of 3 (${post.slotName || ''}) |
| Format | ${fmtLabel(post.format)}${post.format === 'reel' ? `, ${rep.duration?.toFixed(1)} s` : post.format === 'carousel' ? `, ${slides.length} slides` : ''} |
| Chapter | ${post.chapter} |
| Series and episode | ${post.series}${post.episode ? ' · ' + post.episode : ''} |
| Service IDs | ${svcLine(post.services)} |
| Topics taught | ${(post.topics || []).join(', ')} |
| Audience sector | ${post.sector} |
| Viewer question or scenario | ${post.question} |
| Purpose | ${post.purpose} |
| Single promise | ${post.promise} |
| Intended viewer action | ${post.action} |
| Related posts | ${relLine(post.related)} |
| Next episode pointer | ${post.next ? `${post.next.id}: ${plain(post.next.text)}` : 'None'} |

## Opening

| | Hook | Why it could work |
| --- | --- | --- |
${hooks.map((hk, i) => `| ${i === (post.chosen ?? 0) ? '**Chosen**' : 'Alternative'} | ${plain(hk.line)} | ${hk.why} |`).join('\n')}

**Chosen line:** ${plain(chosen.line || '')}

**Why it wins:** ${post.whyWins || chosen.why || ''}

**First frame / cover:** ${post.firstFrame}

## Scenario

${post.scenario}

## Art and assets

- Art direction: ${post.art?.dir} (${DIRS[post.art?.dir] || ''})${post.art?.extra ? '; ' + post.art.extra : ''}
- Type: Geist (display and body), Geist Mono (labels); SIL OFL 1.1
- Layouts used: ${[...new Set((post.scenes || post.slides || []).map((s) => s.layout))].join(', ')}
- Style references: ${post.art?.refs || 'Campaign house style (strategy/brand-and-series-guide.md)'}
- Props, UI state and sources: ${post.art?.props || 'Original motion graphics and labelled demo interfaces built in production/render/lib'}
${post.format === 'reel' ? `- Music: original bed \`${post.music || 'bed-signal'}\` (procedurally generated; production/render/audio/synth.py); sound effects synthesised in the same script\n` : ''}- Honest labels on the asset: ${(post.labels || []).length ? post.labels.join('; ') : 'None needed (no demo data, captures or illustrations)'}

## Evidence for factual claims

${(post.claims || []).length ? post.claims.map((c) => `- ${c.claim} — source: ${c.source}`).join('\n') : '- No factual claims beyond general practice.'}
`;
  fs.writeFileSync(path.join(dir, 'brief.md'), brief);

  // script-and-shot-list.md
  let script = `# ${post.id} · Script and ${post.format === 'reel' ? 'shot list' : 'panel-by-panel reading script'}\n\n`;
  if (post.format === 'reel') {
    script += `Sound-off first: every line the viewer needs is on screen. No voice-over; the mix is an original music bed with interface sound effects. ${post.voiceNote || ''}\n\n`;
    script += `**Spoken copy:** none (text-led). ${post.vo ? 'Optional founder voice-over for an alternate cut is in extras.' : ''}\n\n`;
    script += `| # | Time | Layout · frame composition | On-screen copy | Action, animation and transition | Sound |\n| --- | --- | --- | --- | --- | --- |\n`;
    (rep.scenes || []).forEach((sc, i) => {
      const spec = post.scenes[i];
      const cues = (rep.cues || []).filter((c) => c.at >= sc.start && c.at < sc.start + sc.dur).map((c) => `${(c.at).toFixed(1)}s ${c.name}`).join(', ');
      const t0 = sc.start.toFixed(1), t1 = (sc.start + sc.dur).toFixed(1);
      script += `| ${i + 1} | ${t0}–${t1} s | ${spec.layout} · ${spec.shot || visualOf(spec) || ''} | ${textOf(spec).join(' / ').replace(/\|/g, '/')} | ${spec.action || ''}${spec.tr && spec.tr !== 'cut' && i ? ` Transition in: ${spec.tr}.` : i ? ' Hard cut in.' : ''} | ${cues || '—'} |\n`;
    });
    script += `\nTotal running time: ${rep.duration?.toFixed(2)} s at 30 fps, 1080 × 1920.\n\n## Cover\n\n${post.coverNote || 'Cover frame rendered from the cover spec: title kept inside the central 3:4 area so it survives the profile grid crop.'}\n`;
  } else {
    script += `| Slide | Layout | Reading script (exact copy) | Visual |\n| --- | --- | --- | --- |\n`;
    slides.forEach((s, i) => { script += `| ${i + 1} | ${s.layout} | ${textOf(s).join(' / ').replace(/\|/g, '/')} | ${s.shot || visualOf(s) || ''} |\n`; });
  }
  script += `\n## Scenario and sequence\n\n${post.sequence || post.scenario}\n\n**Visible payoff:** ${post.payoff || post.promise}\n`;
  fs.writeFileSync(path.join(dir, 'script-and-shot-list.md'), script);

  // caption.txt
  fs.writeFileSync(path.join(dir, 'caption.txt'), post.caption.trim() + '\n');

  // alt-text.txt
  let alt = '';
  if (post.format === 'reel') alt = `Cover image alt text: ${post.coverAlt || altFor(post.cover, 0, 1)}\n\n(Reels carry captions in the file below; Instagram generates its own captions only from speech.)\n`;
  else slides.forEach((s, i) => { alt += `${String(i + 1).padStart(2, '0')}: ${altFor(s, i, slides.length)}\n\n`; });
  fs.writeFileSync(path.join(dir, 'alt-text.txt'), alt);

  // publishing-notes.md
  const pub = `# ${post.id} · Publishing notes

- Format: ${fmtLabel(post.format)}
- Upload order: ${files.filter((f) => !f.endsWith('.srt')).map((f) => path.basename(f)).join(', ')}
- Cover title: ${plain(post.coverTitle || '')}
- Caption: caption.txt (${words(post.caption)} words)
- Single call to action: ${post.action}
- Link mentioned: ${post.link || SITE}
- Pinned comment suggestion: ${post.pinned || 'None'}
- Location tag: ${post.location || 'Toronto, Ontario'}
- Keywords to work into the caption or alt text: ${post.keywords || ''}
- Alt text: alt-text.txt${post.format === 'reel' ? '\n- Subtitles: export/' + post.id + '.srt (on-screen text and sound cues, timed to the final export)' : ''}
- Suggested slot (test plan, America/Toronto): ${post.time || ''}
`;
  fs.writeFileSync(path.join(dir, 'publishing-notes.md'), pub);
}
