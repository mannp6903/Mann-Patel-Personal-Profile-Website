// Builds a server-less, relative-link copy of the built site for private previews
// (e.g. a Claude artifact or any static file host under a sub-path).
// The enquiry form shows its honest "not connected" notice there (no server).
// Usage: npm run build && node scripts/export-static-preview.mjs [outDir]
import { cp, readdir, readFile, rm, writeFile, stat } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';

const src = 'dist/client';
const out = process.argv[2] || 'preview-static';
await rm(out, { recursive: true, force: true });
await cp(src, out, { recursive: true });
await rm(join(out, 'robots.txt'), { force: true });

async function walk(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else files.push(p);
  }
  return files;
}

// Hosts may reserve names starting with "_": move Astro's bundle folder to assets/.
const { rename } = await import('node:fs/promises');
await rename(join(out, '_astro'), join(out, 'assets'));
for (const f of await walk(out)) {
  if (!/\.(html|css|js)$/.test(f)) continue;
  const text = await readFile(f, 'utf8');
  if (text.includes('_astro/')) await writeFile(f, text.replaceAll('/_astro/', '/assets/').replaceAll('_astro/', 'assets/'));
}

const files = await walk(out);
const exists = async (p) => stat(p).then(() => true, () => false);

function toRelative(url, root) {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  if (url.startsWith('/api/')) return url; // no server in a static preview
  const m = url.match(/^([^?#]*)(.*)$/);
  let path = m[1];
  if (path.endsWith('/')) path += 'index.html';
  return root + path.slice(1) + m[2];
}

let changed = 0;
for (const f of files) {
  if (f.endsWith('.html')) {
    const depth = relative(out, f).split('/').length - 1;
    const root = depth ? '../'.repeat(depth) : './';
    let html = await readFile(f, 'utf8');
    html = html.replace(/\b(href|src|action|poster)="([^"]*)"/g, (_m, attr, url) => `${attr}="${toRelative(url, root)}"`);
    html = html.replace(/\bsrcset="([^"]*)"/g, (_m, set) =>
      `srcset="${set
        .split(',')
        .map((part) => {
          const [u, ...rest] = part.trim().split(/\s+/);
          return [toRelative(u, root), ...rest].join(' ');
        })
        .join(', ')}"`,
    );
    html = html.replace('<html lang="en-CA"', `<html lang="en-CA" data-static-root="${root}"`);
    await writeFile(f, html);
    changed++;
  } else if (f.endsWith('.css')) {
    const depth = relative(out, f).split('/').length - 1;
    const root = depth ? '../'.repeat(depth) : './';
    const css = (await readFile(f, 'utf8')).replace(/url\((['"]?)\/(?!\/)/g, (_m, q) => `url(${q}${root}`);
    await writeFile(f, css);
  }
}

// Sanity check: every relative href/src in HTML must exist.
const missing = [];
for (const f of files.filter((x) => x.endsWith('.html'))) {
  const html = await readFile(f, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="(\.{1,2}\/[^"#?]*)/g)) {
    if (!(await exists(join(dirname(f), m[1])))) missing.push(`${relative(out, f)} → ${m[1]}`);
  }
}
console.log(`Static preview written to ${out}/ (${changed} pages). Missing targets: ${missing.length}`);
if (missing.length) {
  console.log(missing.slice(0, 20).join('\n'));
  process.exitCode = 1;
}

// ── Artifact packaging (node scripts/export-static-preview.mjs <dir> --artifact) ──
// The host wraps the main page in its own document skeleton, so the home page is
// unwrapped (head elements kept, document tags removed) and a full-document copy is
// written to home.html, which every "home" link points to.
if (process.argv.includes('--artifact') && !process.exitCode) {
  const home = await readFile(join(out, 'index.html'), 'utf8');
  await writeFile(join(out, 'home.html'), home.replace(/href="(\.\/)?index\.html"/g, 'href="./home.html"'));
  for (const f of (await walk(out)).filter((x) => x.endsWith('.html') && !x.endsWith('/home.html'))) {
    let html = await readFile(f, 'utf8');
    html = html.replace(/href="((?:\.\.\/)+|\.\/)index\.html"/g, 'href="$1home.html"');
    await writeFile(f, html);
  }
  let main = await readFile(join(out, 'index.html'), 'utf8');
  main = main
    .replace(/<!doctype html>/i, '')
    .replace(/<html[^>]*>/i, '')
    .replace(/<\/html>/i, '')
    .replace(/<\/?head>/gi, '')
    .replace(/<body[^>]*>/i, '')
    .replace(/<\/body>/i, '')
    .replace(/<title>[^<]*<\/title>/i, '')
    .replace(/<meta charset="utf-8"\s*\/?>/i, '')
    .replace(/<meta name="viewport"[^>]*>/i, '')
    .replace(/href="\.\/index\.html"/g, 'href="./home.html"');
  main =
    '<title>Mann Patel Website</title>\n' +
    '<script>document.documentElement.lang="en-CA";document.documentElement.dataset.staticRoot="./";</script>\n' +
    main.trim() + '\n';
  await writeFile(join(out, 'index.html'), main);
  console.log('Artifact packaging done (main page unwrapped, home.html added).');
}
