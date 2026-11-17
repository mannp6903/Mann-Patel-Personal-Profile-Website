// Design upgrade gates that read the source (DESIGN_UPGRADE_PLAN.md §5). Added in Phase 1 (17 Nov 2026).
//   T1: every font size is a --fs-* token (or inherit), apart from the allow-listed exceptions.
//   C2: no hex colours in CSS outside src/styles/tokens.css.
// "CSS" here is every .css file and every <style> block and style="" attribute in .astro files under src/components,
// src/pages and src/layouts, plus src/styles/global.css. Comments are ignored.
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCANNED_DIRS = ['src/components', 'src/pages', 'src/layouts'];
const EXTRA_FILES = ['src/styles/global.css'];

function walk(dir: string): string[] {
  return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.(astro|css)$/.test(entry.name) ? [path] : [];
  });
}

/** The CSS in a file, with line numbers kept so failures point at the source. */
function cssOf(file: string): { css: string; source: string } {
  const source = readFileSync(join(ROOT, file), 'utf8');
  let css: string;
  if (file.endsWith('.css')) css = source;
  else {
    // Blank out everything that isn't inside a <style> block or a style="" attribute, keeping newlines.
    const keep = new Array<boolean>(source.length).fill(false);
    for (const m of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
      const start = m.index! + m[0].indexOf(m[1]);
      for (let i = start; i < start + m[1].length; i++) keep[i] = true;
    }
    for (const m of source.matchAll(/\sstyle=(["'])([\s\S]*?)\1/g)) {
      const start = m.index! + m[0].indexOf(m[2]);
      for (let i = start; i < start + m[2].length; i++) keep[i] = true;
    }
    css = [...source].map((ch, i) => (keep[i] || ch === '\n' ? ch : ' ')).join('');
  }
  // Drop comments, keeping their newlines.
  css = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  return { css, source };
}

type Decl = { file: string; line: number; prop: string; value: string };

function declarations(): Decl[] {
  const files = [...SCANNED_DIRS.flatMap(walk), ...EXTRA_FILES];
  const out: Decl[] = [];
  for (const file of files) {
    const { css } = cssOf(file);
    for (const m of css.matchAll(/(?<![\w-])([a-z-]+)\s*:\s*([^;{}]+?)\s*(?=;|}|$)/gm)) {
      const line = css.slice(0, m.index).split('\n').length;
      out.push({ file: relative(ROOT, join(ROOT, file)), line, prop: m[1], value: m[2].replace(/\s*!important$/, '').trim() });
    }
  }
  return out;
}

const DECLS = declarations();
const where = (d: Decl) => `${d.file}:${d.line}  ${d.prop}: ${d.value}`;

describe('design tokens (DESIGN_UPGRADE_PLAN.md §5)', () => {
  it('scans the component, page and layout CSS', () => {
    expect(DECLS.filter((d) => d.prop === 'font-size').length).toBeGreaterThan(100);
  });

  it('T1: every font size is a --fs-* token or inherit', () => {
    // Allowed exceptions, each with its reason (plan §4, task 1.2).
    const ALLOWED: { file: string; value: string; why: string }[] = [
      { file: 'src/styles/global.css', value: '112.5%', why: 'presenter mode (?present=1) scales the root size for a projector' },
    ];
    const ok = (d: Decl) =>
      /^var\(--fs-[a-z0-9-]+\)$/.test(d.value) || d.value === 'inherit' || ALLOWED.some((a) => a.file === d.file && a.value === d.value);
    const offenders = DECLS.filter((d) => d.prop === 'font-size' && !ok(d)).map(where);
    expect(offenders).toEqual([]);
    // The `font` shorthand can set a size too: only `inherit` is used.
    expect(DECLS.filter((d) => d.prop === 'font' && d.value !== 'inherit').map(where)).toEqual([]);
    // SVG <text font-size> is allowed only in the agent graph, which sizes its labels in its own viewBox units.
    const svgSizes = [...SCANNED_DIRS.flatMap(walk)].filter((f) => / font-size=\{/.test(readFileSync(join(ROOT, f), 'utf8')));
    expect(svgSizes).toEqual(['src/components/home/AgentGraph.astro']);
  });

  it('T1: the type scale exists in tokens.css with the plan’s values', () => {
    const tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');
    for (const name of ['--fs-hero', '--fs-h1', '--fs-h2', '--fs-h3', '--fs-lead', '--fs-base', '--fs-sm', '--fs-label'])
      expect(tokens, name).toMatch(new RegExp(`${name}:`));
    expect(tokens).toMatch(/--fs-label:\s*0\.8125rem;/);
    expect(tokens).toMatch(/--track-hero:\s*-0\.035em;/);
    expect(tokens).toMatch(/--track-head:\s*-0\.025em;/);
    expect(tokens).toMatch(/--w-body:\s*400;/);
    expect(tokens).toMatch(/--w-ui:\s*500;/);
    expect(tokens).toMatch(/--w-head:\s*600;/);
    expect(tokens).toMatch(/--section-tight:/);
    expect(tokens).toMatch(/--head-gap-1:/);
    expect(tokens).toMatch(/--head-gap-2:/);
  });

  it('C2: no hex colours outside tokens.css', () => {
    const hex = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])|%23[0-9a-f]{6}(?![0-9a-f])/i;
    const offenders = DECLS.filter((d) => hex.test(d.value)).map(where);
    expect(offenders).toEqual([]);
  });

  it('weights: only 400, 500 and 600 (plan task 1.3)', () => {
    const offenders = DECLS.filter((d) => d.prop === 'font-weight')
      .filter((d) => !/^(var\(--w-(body|ui|head)\)|inherit|normal|400|500|600|100 900)$/.test(d.value))
      .map(where);
    expect(offenders).toEqual([]);
  });
});
