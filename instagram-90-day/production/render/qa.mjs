#!/usr/bin/env node
// QA on the actual exports: probe and fully decode each file, measure loudness, and build
// contact sheets (Reel frames from the MP4 itself, carousel slides, grid-crop previews).
//   node render/qa.mjs --days 1-3      or      --ids D01-P1,D02-P1
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadPosts } from './posts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROD = path.resolve(HERE, '..');
const CAMPAIGN = path.resolve(PROD, '..');
const SHEETS = path.join(CAMPAIGN, 'review/contact-sheets');
const REPORTS = path.join(PROD, 'reports');
const TMP = path.join(PROD, '.cache/qa');
fs.mkdirSync(TMP, { recursive: true });
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => (a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : null)).filter(Boolean));
const run = (cmd, argv) => execFileSync(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }).toString();
const runErr = (cmd, argv) => { const r = spawnSync(cmd, argv, { maxBuffer: 1 << 26 }); return (r.stdout || '').toString() + (r.stderr || '').toString(); };
const dayDir = (p) => path.join(CAMPAIGN, 'content', `day-${String(p.day).padStart(2, '0')}`, p.id);

function probe(file) {
  const j = JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file]));
  const v = j.streams.find((s) => s.codec_type === 'video');
  const a = j.streams.find((s) => s.codec_type === 'audio');
  const [n, d] = (v?.r_frame_rate || '0/1').split('/').map(Number);
  return { width: v?.width, height: v?.height, fps: d ? +(n / d).toFixed(3) : 0, vcodec: v?.codec_name, pix: v?.pix_fmt, profile: v?.profile, acodec: a?.codec_name, rate: a ? +a.sample_rate : 0, channels: a?.channels || 0, duration: +(+j.format.duration).toFixed(3), sizeMB: +(+j.format.size / 1048576).toFixed(2), bitrateK: Math.round(+j.format.bit_rate / 1000) };
}
function loudness(file) {
  const out = runErr('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const I = /I:\s+(-?[\d.]+) LUFS/.exec(out.split('Summary:').pop());
  const P = /Peak:\s+(-?[\d.]+) dBFS/.exec(out.split('Summary:').pop());
  return { lufs: I ? +I[1] : null, truePeak: P ? +P[1] : null };
}
function decodeOk(file) { const e = runErr('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-']).trim(); return e ? e.split('\n').slice(0, 3).join(' | ') : 'ok'; }

function gridCrop(src, out) {
  // Profile grid shows a 3:4 crop of the centre; render it at grid-tile size (~ 130 pt wide on a phone)
  const { w, h } = JSON.parse(run('identify', ['-format', '{"w":%w,"h":%h}', src]));
  const ch = Math.round(w * 4 / 3);
  const y = Math.round((h - Math.min(h, ch)) / 2);
  const cw = h < ch ? Math.round(h * 3 / 4) : w;
  const x = Math.round((w - cw) / 2);
  run('convert', [src, '-crop', `${cw}x${Math.min(h, ch)}+${x}+${y}`, '+repage', '-resize', '360x480', out]);
}

async function qaPost(p) {
  const dir = dayDir(p), exp = path.join(dir, 'export');
  const files = fs.existsSync(exp) ? fs.readdirSync(exp).sort() : [];
  const res = { id: p.id, format: p.format, checkedAt: new Date().toISOString(), files: [], problems: [] };
  const sheetDir = path.join(SHEETS, `day-${String(p.day).padStart(2, '0')}`);
  fs.mkdirSync(sheetDir, { recursive: true });
  if (p.format === 'reel') {
    const mp4 = path.join(exp, `${p.id}.mp4`), cover = path.join(exp, `${p.id}-cover.jpg`), srtF = path.join(exp, `${p.id}.srt`);
    for (const f of [mp4, cover, srtF]) if (!fs.existsSync(f)) res.problems.push('missing ' + path.basename(f));
    if (fs.existsSync(mp4)) {
      const pr = probe(mp4); const ld = loudness(mp4); const dec = decodeOk(mp4);
      Object.assign(res, { probe: pr, loudness: ld, decode: dec });
      if (pr.width !== 1080 || pr.height !== 1920) res.problems.push(`size ${pr.width}x${pr.height}`);
      if (Math.abs(pr.fps - 30) > 0.01) res.problems.push(`fps ${pr.fps}`);
      if (pr.vcodec !== 'h264' || pr.pix !== 'yuv420p') res.problems.push(`video ${pr.vcodec}/${pr.pix}`);
      if (pr.acodec !== 'aac' || pr.rate !== 48000 || pr.channels !== 2) res.problems.push(`audio ${pr.acodec}/${pr.rate}/${pr.channels}`);
      if (dec !== 'ok') res.problems.push('decode: ' + dec);
      if (ld.lufs == null || ld.lufs < -19 || ld.lufs > -13) res.problems.push(`loudness ${ld.lufs} LUFS`);
      if (ld.truePeak != null && ld.truePeak > -0.5) res.problems.push(`true peak ${ld.truePeak}`);
      // frames from the export: first frame, then every ~1.6 s, and the last frame
      const rep = JSON.parse(fs.readFileSync(path.join(REPORTS, p.id + '.render.json'), 'utf8'));
      const times = [0];
      for (const sc of rep.scenes || []) { times.push(+(sc.start + Math.min(1.2, sc.dur * 0.35)).toFixed(2)); times.push(+(sc.start + sc.dur - 0.25).toFixed(2)); }
      const tdir = path.join(TMP, p.id); fs.rmSync(tdir, { recursive: true, force: true }); fs.mkdirSync(tdir, { recursive: true });
      const frames = [];
      times.filter((t, i, a) => a.indexOf(t) === i && t < pr.duration).forEach((t, i) => {
        const f = path.join(tdir, `f${String(i).padStart(2, '0')}.jpg`);
        run('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', mp4, '-frames:v', '1', '-vf', 'scale=270:480', '-y', f]);
        run('convert', [f, '-gravity', 'south', '-fill', 'white', '-undercolor', '#000a', '-pointsize', '18', '-annotate', '+0+4', `${t.toFixed(1)}s`, f]);
        frames.push(f);
      });
      if (fs.existsSync(cover)) { const c = path.join(tdir, 'zz-cover.jpg'); run('convert', [cover, '-resize', '270x480', '-gravity', 'south', '-fill', 'white', '-undercolor', '#000a', '-pointsize', '18', '-annotate', '+0+4', 'COVER', c]); frames.push(c); const g = path.join(tdir, 'zz-grid.jpg'); gridCrop(cover, g); run('convert', [g, '-resize', '270x360', '-gravity', 'south', '-fill', 'white', '-undercolor', '#000a', '-pointsize', '18', '-annotate', '+0+4', 'GRID 3:4', g]); frames.push(g); }
      const sheet = path.join(sheetDir, `${p.id}.jpg`);
      run('montage', [...frames, '-tile', '8x', '-geometry', '+6+6', '-background', '#2a2a2a', sheet]);
      res.sheet = path.relative(CAMPAIGN, sheet);
      res.files = [mp4, cover, srtF].filter((f) => fs.existsSync(f)).map((f) => path.relative(CAMPAIGN, f));
      // SRT sanity
      if (fs.existsSync(srtF)) { const s = fs.readFileSync(srtF, 'utf8'); const n = (s.match(/-->/g) || []).length; res.srtCues = n; if (!n) res.problems.push('empty srt'); }
    }
  } else {
    const jpgs = files.filter((f) => f.endsWith('.jpg')).map((f) => path.join(exp, f));
    const expected = p.slides.length;
    if (jpgs.length !== expected) res.problems.push(`expected ${expected} images, found ${jpgs.length}`);
    jpgs.forEach((f, i) => {
      const { w, h, cs } = JSON.parse(run('identify', ['-format', '{"w":%w,"h":%h,"cs":"%[colorspace]"}', f]));
      if (w !== 1080 || h !== 1350) res.problems.push(`${path.basename(f)} is ${w}x${h}`);
      if (cs !== 'sRGB') res.problems.push(`${path.basename(f)} colourspace ${cs}`);
      if (expected > 1 && !path.basename(f).endsWith(`-${String(i + 1).padStart(2, '0')}.jpg`)) res.problems.push(`order: ${path.basename(f)}`);
    });
    res.files = jpgs.map((f) => path.relative(CAMPAIGN, f));
    const tdir = path.join(TMP, p.id); fs.rmSync(tdir, { recursive: true, force: true }); fs.mkdirSync(tdir, { recursive: true });
    const tiles = jpgs.map((f, i) => { const t = path.join(tdir, `s${i}.jpg`); run('convert', [f, '-resize', '360x450', t]); return t; });
    if (jpgs[0]) { const g = path.join(tdir, 'zz-grid.jpg'); gridCrop(jpgs[0], g); run('convert', [g, '-resize', '270x360', '-gravity', 'south', '-fill', 'white', '-undercolor', '#000a', '-pointsize', '18', '-annotate', '+0+4', 'GRID 3:4', g]); tiles.push(g); }
    const sheet = path.join(sheetDir, `${p.id}.jpg`);
    run('montage', [...tiles, '-tile', '5x', '-geometry', '+6+6', '-background', '#2a2a2a', sheet]);
    res.sheet = path.relative(CAMPAIGN, sheet);
  }
  // records present?
  for (const f of ['brief.md', 'script-and-shot-list.md', 'caption.txt', 'alt-text.txt', 'publishing-notes.md']) if (!fs.existsSync(path.join(dir, f))) res.problems.push('missing ' + f);
  // caption sanity: no template tokens, has a URL or an action
  const cap = fs.existsSync(path.join(dir, 'caption.txt')) ? fs.readFileSync(path.join(dir, 'caption.txt'), 'utf8') : '';
  if (/\{\{|\bTODO\b|\[insert/i.test(cap)) res.problems.push('caption has a placeholder');
  if (cap.length > 2200) res.problems.push(`caption ${cap.length} chars > 2200`);
  const rr = fs.existsSync(path.join(REPORTS, p.id + '.render.json')) ? JSON.parse(fs.readFileSync(path.join(REPORTS, p.id + '.render.json'), 'utf8')) : null;
  if (rr && rr.issues?.length) res.problems.push(...rr.issues.map((i) => 'layout: ' + i));
  fs.writeFileSync(path.join(REPORTS, p.id + '.qa.json'), JSON.stringify(res, null, 1));
  console.log(`${p.id} ${res.problems.length ? '⚠ ' + res.problems.join(' ; ') : 'ok'}${res.probe ? ` · ${res.probe.duration}s ${res.probe.sizeMB}MB ${res.loudness.lufs} LUFS TP ${res.loudness.truePeak}` : ''}`);
  return res;
}

const all = await loadPosts();
let sel = all;
if (args.days) { const [a, b] = String(args.days).split('-').map(Number); sel = all.filter((p) => p.day >= a && p.day <= (b || a)); }
if (args.ids) { const ids = String(args.ids).split(','); sel = all.filter((p) => ids.includes(p.id)); }
for (const p of sel) await qaPost(p);
