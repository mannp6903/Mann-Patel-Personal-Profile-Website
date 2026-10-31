/**
 * Internal links built in the browser. On the real site they stay as root paths.
 * The static preview export sets <html data-static-root="../"> so links work from
 * any folder depth without a server (see scripts/export-static-preview.mjs).
 */
export function sitePath(path: string): string {
  const root = document.documentElement.dataset.staticRoot;
  if (root === undefined || !path.startsWith('/')) return path;
  const m = path.match(/^([^?#]*)(.*)$/)!;
  let p = m[1];
  if (p.endsWith('/')) p += 'index.html';
  return root + p.slice(1) + m[2];
}
