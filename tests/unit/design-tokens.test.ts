// Design upgrade gates that read the source (DESIGN_UPGRADE_PLAN.md §5). Added in Phase 1 (17 Nov 2026).
//   T1: every font size is a --fs-* token (or inherit), apart from the allow-listed exceptions.
//   C2: no hex colours in CSS outside src/styles/tokens.css.
// Phase 4 (17 Nov 2026):
//   M1: one motion token set, and no literal durations in component CSS or in the options of script animations.
//   M4: page transitions take at most 450ms.
// Phase 5 (17 Nov 2026):
//   G3: one frame system for captures (MediaFrame.astro), with backdrops and the one media shadow from tokens.
//   G4: the agent graph, the services scenes and the promise icons share the graph's stroke tokens.
// Phase 9 (18 Nov 2026, the re-audit's fixes):
//   M8: every :hover rule has a :focus-visible (or :focus-within / :focus) twin, apart from Phase 4's hover-only list.
//   C6: DESIGN.md → Colour lists every colour token in tokens.css with its value.
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

  it('M1: one motion token set in tokens.css, with the plan’s values, all 0 under reduced motion', () => {
    const tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');
    const want: Record<string, string> = {
      '--ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      '--ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      '--ease-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
      '--ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      '--dur-1': '120ms',
      '--dur-2': '200ms',
      '--dur-3': '320ms',
      '--dur-4': '560ms',
      '--dur-5': '800ms',
      '--stagger': '60ms',
      '--dur-loop': '4200ms',
      '--dur-page-out': '220ms',
      '--dur-page-in': '420ms',
    };
    for (const [name, value] of Object.entries(want)) expect(tokens, name).toContain(`${name}: ${value};`);
    // Every duration token, and only those, is in the set above.
    const durations = [...new Set([...tokens.matchAll(/(--[a-z0-9-]+):\s*\d+m?s;/g)].map((m) => m[1]))].sort();
    expect(durations).toEqual(Object.keys(want).filter((k) => !k.startsWith('--ease')).sort());
    // Reduced motion sets every one of them to 0.
    const reduced = tokens.slice(tokens.indexOf('@media (prefers-reduced-motion: reduce)'));
    for (const name of durations) expect(reduced, name).toMatch(new RegExp(`${name}:\\s*0ms;`));
    // The old sets are gone everywhere.
    const old = /--(?:t-(?:fast|base|slow|reveal)|dur-(?:instant|fast|base|slow|hero)|ease-standard)\b/;
    const files = [...SCANNED_DIRS.flatMap(walk), ...EXTRA_FILES, 'src/styles/tokens.css'];
    expect(files.filter((f) => old.test(readFileSync(join(ROOT, f), 'utf8')))).toEqual([]);
  });

  it('M1: no literal durations in component CSS (animation and transition timing comes from the tokens)', () => {
    const timing = /^(animation|animation-duration|animation-delay|transition|transition-duration|transition-delay)$/;
    // A non-zero time: 0s and 0ms (switching something off) are not durations.
    const literal = /(?<![\w.-])(?!0*\.?0+m?s\b)\d*\.?\d+m?s\b/;
    const offenders = DECLS.filter((d) => timing.test(d.prop) && literal.test(d.value)).map(where);
    expect(offenders).toEqual([]);
  });

  it('M1: no literal durations in script animations (element.animate options read the tokens)', () => {
    const scripts: { file: string; code: string }[] = [];
    const walkTs = (dir: string): string[] =>
      readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
        const path = join(dir, e.name);
        return e.isDirectory() ? walkTs(path) : /\.ts$/.test(e.name) ? [path] : [];
      });
    for (const file of walkTs('src/scripts')) scripts.push({ file, code: readFileSync(join(ROOT, file), 'utf8') });
    for (const file of SCANNED_DIRS.flatMap(walk).filter((f) => f.endsWith('.astro')))
      for (const m of readFileSync(join(ROOT, file), 'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) scripts.push({ file, code: m[1] });
    const offenders: string[] = [];
    for (const { file, code } of scripts) {
      // The options object of every .animate(keyframes, { ... }) call.
      for (const m of code.matchAll(/\.animate\(([\s\S]*?)\)\s*[;),]/g)) {
        const call = m[1];
        for (const opt of call.matchAll(/\b(duration|delay|endDelay)\s*:\s*([^,}\n]+)/g))
          if (/^\s*\d/.test(opt[2])) offenders.push(`${file}: ${opt[1]}: ${opt[2].trim()}`);
      }
      // Durations written into inline styles from scripts.
      for (const m of code.matchAll(/style\.(?:transition|animation)\w*\s*=\s*[`'"][^`'"]*?\d+m?s/g)) offenders.push(`${file}: ${m[0]}`);
    }
    expect(offenders).toEqual([]);
    // Sanity: the agent graph's loop is in scope.
    expect(scripts.some((s) => s.file.endsWith('AgentGraph.astro') && /\.animate\(/.test(s.code))).toBe(true);
  });

  it('M4: page transitions take at most 450ms and read only the page-transition tokens', () => {
    const tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');
    for (const name of ['--dur-page-out', '--dur-page-in']) {
      const ms = Number(tokens.match(new RegExp(`${name}:\\s*(\\d+)ms;`))?.[1]);
      expect(ms, name).toBeGreaterThan(0);
      expect(ms, name).toBeLessThanOrEqual(450);
    }
    const { css } = cssOf('src/styles/global.css');
    const blocks = [...css.matchAll(/::view-transition-[\w-]+\([^)]*\)\s*\{([^}]*)\}/g)];
    expect(blocks.length).toBeGreaterThan(3);
    for (const b of blocks)
      for (const m of b[1].matchAll(/animation-duration\s*:\s*([^;]+);/g))
        expect(m[1].trim(), b[0].split('{')[0].trim()).toMatch(/^(var\(--dur-page-(out|in)\)|0s)$/);
    // No shorthand animation on the root transition, so every duration is one of the above.
    for (const b of blocks.filter((x) => /\(root\)/.test(x[0]))) expect(b[1]).not.toMatch(/(^|[\s;])animation\s*:/);
  });

  it('G3: every shadow is a token (media, pop-up, glow), a focus ring, or a lime glow on a live mark', () => {
    const tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');
    // One plain shadow, no spread, so it works in box-shadow and in drop-shadow() alike.
    expect(tokens).toMatch(/--shadow-media:\s*0 \d+px \d+px rgb\([^)]*\);/);
    const ring = /^(inset )?0 0 0 [\d.]+px [^,]+$/;
    const tokenShadow = /^var\(--(shadow-media|shadow-pop|signal-glow)\)$/;
    const parts = (v: string) => v.split(/,(?![^(]*\))/).map((x) => x.trim());
    const boxOffenders = DECLS.filter((d) => d.prop === 'box-shadow' && d.value !== 'none')
      .filter((d) => !parts(d.value).every((p) => tokenShadow.test(p) || ring.test(p)))
      .map(where);
    expect(boxOffenders).toEqual([]);
    // drop-shadow(): the media shadow, or a glow (no offset) in lime, which marks something live (the graph's signal).
    const dropOffenders = DECLS.filter((d) => d.prop === 'filter' && /drop-shadow/.test(d.value))
      .filter((d) => !/^drop-shadow\(var\(--shadow-media\)\)$/.test(d.value) && !/^drop-shadow\(0 0 [\d.]+px rgb\(212 248 74 \/ [\d.]+\)\)$/.test(d.value))
      .map(where);
    expect(dropOffenders).toEqual([]);
  });

  it('G3: one frame system: captures are drawn only by MediaFrame.astro, on token backdrops', () => {
    const frameFiles = ['src/components/work/MediaFrame.astro', 'src/components/work/ProjectMedia.astro'];
    for (const f of frameFiles) {
      const { css } = cssOf(f);
      // Colours, backdrops and shadows come from tokens only.
      expect(css, f).not.toMatch(/rgb\(|hsl\(|#[0-9a-f]{3,8}\b|color-mix\(/i);
    }
    expect(cssOf('src/components/work/MediaFrame.astro').css).toMatch(/box-shadow:\s*var\(--shadow-media\)/);
    // Any page or component that reads the capture data hands the images to MediaFrame (no <Image>/<Picture> of its own).
    const readers = SCANNED_DIRS.flatMap(walk).filter((f) => /from ['"][./]*data\/captures['"]/.test(readFileSync(join(ROOT, f), 'utf8')));
    expect(readers.length).toBeGreaterThanOrEqual(2);
    for (const f of readers) expect(readFileSync(join(ROOT, f), 'utf8'), f).not.toMatch(/<(Image|Picture)\b/);
  });

  it('G4: the graph, the services scenes and the promise icons draw with the graph’s stroke tokens', () => {
    const tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8');
    for (const name of ['--graph-stroke-fine', '--graph-stroke', '--graph-stroke-bold', '--graph-stroke-signal']) expect(tokens, name).toMatch(new RegExp(`${name}:\\s*[\\d.]+;`));
    const files = ['src/components/home/AgentGraph.astro', 'src/components/home/ServiceSummary.astro', 'src/components/home/HowIWork.astro'];
    const widths = DECLS.filter((d) => files.includes(d.file) && d.prop === 'stroke-width');
    expect(widths.length).toBeGreaterThan(10);
    expect(widths.filter((d) => !/^var\(--graph-stroke(-fine|-bold|-signal)?\)$/.test(d.value)).map(where)).toEqual([]);
    // Round ends, like the graph's lines.
    for (const f of ['src/components/home/ServiceSummary.astro', 'src/components/home/HowIWork.astro'])
      expect(DECLS.some((d) => d.file === f && d.prop === 'stroke-linecap' && d.value === 'round'), f).toBe(true);
  });

  it('M8: every hover state has a keyboard twin (:focus-visible, :focus-within or :focus)', () => {
    // Hover-only by design (Phase 4's review): the pointer spotlight, the vision page's rows (not controls) and form
    // fields, which have their own :focus styles.
    const HOVER_ONLY = ['[data-spotlight]:hover', '.vi-venture:hover', '.input:hover', '.textarea:hover', '.select:hover'];
    const splitTop = (sel: string) => {
      const parts: string[] = [];
      let depth = 0;
      let cur = '';
      for (const ch of sel) {
        if (ch === '(' || ch === '[') depth++;
        if (ch === ')' || ch === ']') depth--;
        if (ch === ',' && depth === 0) {
          parts.push(cur.trim());
          cur = '';
        } else cur += ch;
      }
      parts.push(cur.trim());
      return parts.map((p) => p.replace(/\s+/g, ' '));
    };
    const offenders: string[] = [];
    const files = [...SCANNED_DIRS.flatMap(walk), ...EXTRA_FILES, 'src/styles/tokens.css'];
    let hovers = 0;
    for (const file of files) {
      const { css } = cssOf(file);
      // Greedy and anchored on the brace, so long blank runs (the blanked-out template) stay linear.
      const selectors = [...css.matchAll(/([^{};@]+)\{/g)]
        .map((m) => ({ sel: m[1].trim(), at: m.index! + m[1].length - m[1].trimStart().length }))
        .filter((x) => x.sel);
      const all = new Set(selectors.flatMap((x) => splitTop(x.sel)));
      for (const { sel, at } of selectors)
        for (const part of splitTop(sel)) {
          if (!part.includes(':hover') || HOVER_ONLY.some((h) => part.includes(h))) continue;
          hovers++;
          if (![':focus-visible', ':focus-within', ':focus'].some((f) => all.has(part.replaceAll(':hover', f))))
            offenders.push(`${file}:${css.slice(0, at).split('\n').length}  ${part}`);
        }
    }
    expect(hovers).toBeGreaterThan(50);
    expect(offenders).toEqual([]);
  });

  it('C6: DESIGN.md → Colour lists every colour token in tokens.css, with the same value', () => {
    const tokens = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8');
    const colour = design.slice(design.indexOf('\n## Colour'), design.indexOf('\n## ', design.indexOf('\n## Colour') + 5));
    const rows = colour.split('\n').filter((l) => l.startsWith('| `--'));
    expect(rows.length).toBeGreaterThan(20);
    // Colour tokens: a hex, rgb() or color-mix() value, or another colour token (--focus: var(--signal)).
    const colourValue = /^(#[0-9a-f]{3,8}|rgb\([^)]*\)|color-mix\(.*\)|var\(--(signal|ink|paper|text|bg)[\w-]*\))$/i;
    const missing: string[] = [];
    for (const m of tokens.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
      const [, name, value] = m;
      if (!colourValue.test(value.trim())) continue;
      // The row whose first column names the token itself, else its numbered pair (`--paper-text` / `-2` / `-3`), else
      // its family (`--frame-*`).
      const first = (r: string) => r.split('|')[1];
      const [, base, n] = name.match(/^(--[\w-]+?)-(\d)$/) ?? [];
      const family = `--${name.split('-')[2]}-*`;
      const row =
        rows.find((r) => first(r).includes('`' + name + '`')) ??
        (base ? rows.find((r) => first(r).includes('`' + base) && first(r).includes('`-' + n + '`')) : undefined) ??
        rows.find((r) => first(r).includes('`' + family + '`'));
      // The value appears in that row (hex compared without case; color-mix() and var() as written).
      const v = value.trim();
      if (!row || !row.toLowerCase().includes(v.toLowerCase())) missing.push(`${name}: ${v}`);
    }
    expect(missing).toEqual([]);
  });
});
