// Loads and validates every post from source/posts/*.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { services } from '../source/catalog.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, '../source/posts');
const SLOT_NAMES = { 1: 'Cold open', 2: 'Owner’s playbook', 3: 'Proof or conversation' };
// Posting-time test plan (America/Toronto). Weekday vs weekend windows; see calendar/README.
export function slotTime(day, slot) {
  const dow = (day - 1) % 7; // Day 01 = Monday by default
  const weekend = dow >= 5;
  return weekend ? { 1: '10:15', 2: '13:30', 3: '19:45' }[slot] : { 1: '07:45', 2: '12:15', 3: '19:15' }[slot];
}

const REQUIRED = ['id', 'format', 'title', 'series', 'chapter', 'services', 'sector', 'question', 'purpose', 'promise', 'action', 'hooks', 'firstFrame', 'scenario', 'caption', 'coverTitle'];

export async function loadPosts({ strict = false } = {}) {
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.mjs')).sort() : [];
  const all = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(path.join(DIR, f)).href + `?v=${fs.statSync(path.join(DIR, f)).mtimeMs}`);
    for (const p of mod.default || []) all.push({ ...p, sourceFile: 'production/source/posts/' + f });
  }
  const seen = new Set();
  const problems = [];
  for (const p of all) {
    const m = /^D(\d{2})-P([123])$/.exec(p.id);
    if (!m) problems.push(`${p.id}: bad id`);
    p.day = +m[1]; p.slot = +m[2];
    p.slotName = p.slotName || SLOT_NAMES[p.slot];
    p.time = p.time || slotTime(p.day, p.slot);
    if (seen.has(p.id)) problems.push(`${p.id}: duplicate id`);
    seen.add(p.id);
    for (const k of REQUIRED) if (p[k] == null || p[k] === '') problems.push(`${p.id}: missing ${k}`);
    for (const s of p.services || []) if (!services[s]) problems.push(`${p.id}: unknown service ${s}`);
    if (p.format === 'reel' && (!p.scenes || !p.cover)) problems.push(`${p.id}: reel needs scenes and cover`);
    if (p.format !== 'reel' && !p.slides?.length) problems.push(`${p.id}: needs slides`);
    if ((p.hooks || []).length < 2) problems.push(`${p.id}: needs two hooks`);
  }
  if (problems.length) { console.error(problems.join('\n')); if (strict) throw new Error('Post validation failed'); }
  return all.sort((a, b) => a.day - b.day || a.slot - b.slot);
}
