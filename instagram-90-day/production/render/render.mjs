#!/usr/bin/env node
// Render campaign posts from source/posts/*.mjs.
//   node render/render.mjs --days 1-3            render days 1 to 3
//   node render/render.mjs --ids D01-P1,D02-P3   render specific posts
//   options: --jobs 2 (parallel Reels), --records-only, --no-video, --debug (safe-zone overlay)
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import QRCode from 'qrcode';
import { writeRecords, srt } from './records.mjs';
import { loadPosts } from './posts.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROD = path.resolve(HERE, '..');
const CAMPAIGN = path.resolve(PROD, '..');
const AUDIO = path.join(PROD, 'source/audio');
const REPORTS = path.join(PROD, 'reports');
const TMP = path.join(PROD, '.cache');
fs.mkdirSync(REPORTS, { recursive: true });
fs.mkdirSync(TMP, { recursive: true });

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => (a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : null)).filter(Boolean));
const JOBS = +(args.jobs || 2);

// ── helpers ──
const dayDir = (p) => path.join(CAMPAIGN, 'content', `day-${String(p.day).padStart(2, '0')}`, p.id);
const rel = (f) => path.relative(CAMPAIGN, f);
function wordmarkFor(dir) {
  let svg = fs.readFileSync(path.join(PROD, 'source/brand/mann-patel-wordmark-lime.svg'), 'utf8');
  svg = svg.replace('<svg ', '<svg style="height:100%;width:auto;display:block" ');
  if (['paper', 'daylight', 'print'].includes(dir)) svg = svg.replace('fill="#fff"', 'fill="#0b0b0c"').replace('fill="#d4f84a"', 'fill="#5d7100"');
  if (dir === 'signal') svg = svg.replace('fill="#fff"', 'fill="#0b0b0c"').replace('fill="#d4f84a"', 'fill="#0b0b0c"');
  return svg;
}
async function prep(spec) {
  // QR codes and asset paths, recursively
  if (Array.isArray(spec)) return Promise.all(spec.map(prep));
  if (!spec || typeof spec !== 'object') return spec;
  const out = {};
  for (const [k, v] of Object.entries(spec)) out[k] = await prep(v);
  if (typeof out.qr === 'string') out.qrSvg = await QRCode.toString(out.qr, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#0b0b0c', light: '#ffffff' } });
  for (const key of ['src', 'imgSrc', 'photoSrc']) if (typeof out[key] === 'string' && out[key].startsWith('asset:')) out[key] = '../source/' + out[key].slice(6);
  return out;
}
function run(cmd, argv, opts = {}) { return execFileSync(cmd, argv, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26, ...opts }).toString(); }
function toJpg(png, jpg) { run('convert', [png, '-colorspace', 'sRGB', '-strip', '-sampling-factor', '4:4:4', '-quality', '93', jpg]); fs.rmSync(png); }

function ensureAudio() {
  if (fs.existsSync(path.join(AUDIO, 'bed-signal.wav'))) return;
  console.log('Generating audio (one-off, ~40 s)…');
  run('python3', [path.join(HERE, 'audio/synth.py'), AUDIO]);
}

// Mix the music bed with the sound-effect cues → 48 kHz stereo WAV at -16 LUFS
function mixAudio(post, rep, out) {
  const D = rep.duration;
  const bed = path.join(AUDIO, (post.music || 'bed-signal') + '.wav');
  const inputs = ['-i', bed];
  const cues = rep.cues.filter((c) => fs.existsSync(path.join(AUDIO, 'sfx-' + c.name + '.wav')) && c.at < D - 0.05);
  // collapse duplicate cues at the same instant
  const seen = new Set(); const use = [];
  for (const c of cues) { const key = c.name + '@' + c.at.toFixed(2); if (!seen.has(key)) { seen.add(key); use.push(c); } }
  use.slice(0, 60).forEach((c) => inputs.push('-i', path.join(AUDIO, 'sfx-' + c.name + '.wav')));
  const bedGain = post.bedGain ?? 0.42;
  let f = `[0:a]atrim=0:${D.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.25,afade=t=out:st=${Math.max(0, D - 1.4).toFixed(3)}:d=1.4,volume=${bedGain}[bed];`;
  const labels = ['[bed]'];
  use.slice(0, 60).forEach((c, i) => { const ms = Math.round(c.at * 1000); f += `[${i + 1}:a]adelay=${ms}|${ms},volume=${(c.gain ?? 1) * (post.sfxGain ?? 0.9)}[s${i}];`; labels.push(`[s${i}]`); });
  f += `${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first,atrim=0:${D.toFixed(3)},loudnorm=I=-16:TP=-2.2:LRA=11,aresample=48000[out]`;
  run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', f, '-map', '[out]', '-ac', '2', '-ar', '48000', out]);
}

async function renderStill(page, spec, opts, outJpg) {
  const fmt = opts.fmt || 'slide';
  await page.setViewportSize({ width: 1080, height: fmt === 'reel' ? 1920 : 1350 });
  const res = await page.evaluate(async ([s, o]) => window.stage.still(s, o), [spec, opts]);
  const png = outJpg.replace(/\.jpg$/, '.png');
  await page.screenshot({ path: png, type: 'png', clip: { x: 0, y: 0, width: 1080, height: fmt === 'reel' ? 1920 : 1350 } });
  toJpg(png, outJpg);
  return res.issues;
}

async function renderReel(page, post, opts, outMp4) {
  await page.setViewportSize({ width: 1080, height: 1920 });
  const rep = await page.evaluate(async ([p, o]) => window.stage.reel(p, o), [post, opts]);
  if (args['no-video']) return rep;
  const wav = path.join(TMP, post.id + '.wav');
  mixAudio(post, rep, wav);
  const fps = 30;
  const frames = Math.round(rep.duration * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
    '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-profile:v', 'high', '-level:v', '4.1', '-g', '60', '-r', String(fps),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', outMp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.stage.seek(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
  fs.rmSync(wav, { force: true });
  return rep;
}

async function renderPost(browser, post) {
  const t0 = Date.now();
  const dir = dayDir(post);
  const exp = path.join(dir, 'export');
  fs.mkdirSync(exp, { recursive: true });
  for (const f of fs.readdirSync(exp)) fs.rmSync(path.join(exp, f));
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error(post.id, 'page error:', e.message));
  await page.goto(pathToFileURL(path.join(HERE, 'stage.html')).href);
  if (args.debug) await page.evaluate(() => window.stage.debug(true));
  const p = await prep(post);
  const meta = p.meta === false ? null : p.meta || { left: `${p.series}${p.episode ? ' · ' + p.episode : ''}`, right: 'mannpatel.me' };
  const issues = [];
  const files = [];
  let rep = { files };
  if (p.format === 'reel') {
    const opts = { dir: p.art?.dir, meta, wordmark: wordmarkFor(p.art?.dir) };
    // per-scene wordmark colour follows the scene's own direction
    p.scenes = p.scenes.map((s) => ({ ...s }));
    const mp4 = path.join(exp, `${p.id}.mp4`);
    const r = await renderReel(page, p, opts, mp4);
    rep = { ...rep, ...r };
    issues.push(...r.issues);
    if (!args['no-video']) files.push(mp4);
    // cover
    const coverSpec = { ...p.cover, dir: p.cover.dir || p.art?.dir };
    const cover = path.join(exp, `${p.id}-cover.jpg`);
    issues.push(...(await renderStill(page, coverSpec, { fmt: 'reel', dir: coverSpec.dir, meta, wordmark: wordmarkFor(coverSpec.dir), label: 'cover' }, cover)).map((s) => 'cover: ' + s));
    files.push(cover);
    const s = srt(r.captions, r.cues, r.duration);
    const srtFile = path.join(exp, `${p.id}.srt`);
    fs.writeFileSync(srtFile, s);
    files.push(srtFile);
  } else {
    const n = p.slides.length;
    for (let i = 0; i < n; i++) {
      const s = { ...p.slides[i] };
      if (p.format === 'carousel' && s.page !== false && i > 0 && !s.page && s.layout !== 'end') s.page = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
      const dirS = s.dir || p.art?.dir;
      const out = path.join(exp, n > 1 ? `${p.id}-${String(i + 1).padStart(2, '0')}.jpg` : `${p.id}.jpg`);
      const iss = await renderStill(page, s, { fmt: 'slide', dir: dirS, meta: s.meta === false ? null : meta, wordmark: wordmarkFor(dirS), label: `slide ${i + 1}` }, out);
      issues.push(...iss);
      files.push(out);
    }
  }
  await page.close();
  rep.files = files.map(rel);
  writeRecords(p, { ...rep, files }, dir);
  const report = { id: p.id, format: p.format, duration: rep.duration, scenes: rep.scenes, cues: rep.cues?.length, files: rep.files, issues, renderedAt: new Date().toISOString(), seconds: Math.round((Date.now() - t0) / 1000) };
  fs.writeFileSync(path.join(REPORTS, p.id + '.render.json'), JSON.stringify(report, null, 1));
  console.log(`${p.id} ${p.format} ${report.seconds}s ${issues.length ? '⚠ ' + issues.length + ' issue(s)' : 'ok'}`);
  for (const i of issues) console.log('   ·', i);
  return report;
}

async function main() {
  const all = await loadPosts();
  let sel = all;
  if (args.days) { const [a, b] = String(args.days).split('-').map(Number); sel = all.filter((p) => p.day >= a && p.day <= (b || a)); }
  if (args.ids) { const ids = String(args.ids).split(','); sel = all.filter((p) => ids.includes(p.id)); }
  if (args.only) sel = sel.filter((p) => (args.only === 'reels' ? p.format === 'reel' : p.format !== 'reel'));
  if (!sel.length) { console.error('No posts selected'); process.exit(1); }
  if (args['records-only']) { for (const p of sel) writeRecords(await prep(p), { files: [] }, dayDir(p)); return; }
  ensureAudio();
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
  const queue = sel.slice();
  const results = [];
  const worker = async () => { while (queue.length) { const p = queue.shift(); try { results.push(await renderPost(browser, p)); } catch (e) { console.error(p.id, 'FAILED', e.stack || e); results.push({ id: p.id, error: String(e) }); } } };
  await Promise.all(Array.from({ length: Math.min(JOBS, sel.length) }, worker));
  await browser.close();
  const bad = results.filter((r) => r.error || (r.issues && r.issues.length));
  console.log(`\nRendered ${results.length} post(s); ${bad.length} with issues or errors.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
