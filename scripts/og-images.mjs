// Per-page Open Graph images (Nov 2026 audit fixes). Used by astro.config.mjs (`og-images`, after every build).
//
// Every built page whose og:image points at /og/p/… (BaseLayout's default, src/lib/og.ts) gets that image drawn here:
// 1200 × 630, the page title in Geist on the site's dark background, the MΛNN PΛTEL wordmark with its lime Λs, a lime
// dot and the address. Drawn with sharp (already installed with Astro) from the site's own font files, so no browser,
// network or new dependency is needed, on Cloudflare's build machines too.
import sharp from 'sharp';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ogCardTitle, ogSection } from '../src/lib/og.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const W = 1200;
const H = 630;
const PAD = 80;
const C = { bg: '#0b0b0c', text: '#f2f1ec', muted: '#8d8c86', line: '#2a2a2f', signal: '#d4f84a' };
const SANS = join(ROOT, 'public/fonts/geist-sans-wght.woff2');
const MONO = join(ROOT, 'public/fonts/geist-mono-latin-wght.woff2');
const WORDMARK = join(ROOT, 'public/brand/mann-patel-wordmark-lime.svg');
/** Title sizes to try, largest first: the largest that fits in three lines wins. */
const SIZES = [84, 76, 68, 62, 56, 50, 44];
const TITLE_WIDTH = W - PAD * 2;
const TITLE_MAX_HEIGHT = 300;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** Text as a transparent PNG, sized to its ink. `font` is a Pango description, e.g. "Geist Semi-Bold 72". */
async function text(markup, { font, fontfile, width }) {
  const { data, info } = await sharp({ text: { text: markup, font, fontfile, width, rgba: true, wrap: 'word', align: 'left' } })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { input: data, width: info.width, height: info.height };
}

/** Tracking in Pango units (1/1024 pt; 1 pt = 1 px at the default 72 dpi). */
const tracking = (em, size) => Math.round(em * size * 1024);

let wordmark;
async function wordmarkPng(height) {
  wordmark ??= (await readFile(WORDMARK, 'utf8')).replace(/<title>.*?<\/title>/, '').replace('fill="#fff"', `fill="${C.text}"`);
  return sharp(Buffer.from(wordmark), { density: 144 }).resize({ height }).png().toBuffer({ resolveWithObject: true });
}

/** One card as a PNG buffer. */
export async function renderOgCard({ title, section = '' }) {
  // The title: the largest size that keeps it within three lines.
  let t;
  for (const size of SIZES) {
    t = await text(`<span foreground="${C.text}" letter_spacing="${tracking(-0.035, size)}">${esc(title)}</span>`, {
      font: `Geist Semi-Bold ${size}`,
      fontfile: SANS,
      width: TITLE_WIDTH,
    });
    if (t.height <= TITLE_MAX_HEIGHT && t.height <= size * 1.25 * 3) break;
  }
  const mono = (s, size, color) =>
    text(`<span foreground="${color}" letter_spacing="${tracking(0.12, size)}">${esc(s.toUpperCase())}</span>`, {
      font: `Geist Mono Medium ${size}`,
      fontfile: MONO,
      width: TITLE_WIDTH,
    });
  const site = await mono('mannpatel.me', 20, C.muted);
  // No label when it would only repeat the title (e.g. "Pricing" over a pricing title that starts with it).
  const label = section && !title.toLowerCase().startsWith(section.toLowerCase()) ? await mono(section, 20, C.muted) : null;
  const { data: wm, info: wmInfo } = await wordmarkPng(30);

  const titleTop = H - PAD - t.height;
  const labelTop = label ? titleTop - 30 - label.height : titleTop;
  const dot = 12;
  // Background: flat, with a faint lime glow in the top-right corner and a rule under the wordmark row.
  const backdrop = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><radialGradient id="g" cx="1" cy="0" r="0.9"><stop offset="0" stop-color="${C.signal}" stop-opacity="0.13"/><stop offset="1" stop-color="${C.signal}" stop-opacity="0"/></radialGradient></defs>
      <rect width="100%" height="100%" fill="${C.bg}"/>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="${PAD}" y="${PAD + 30 + 34}" width="${W - PAD * 2}" height="1" fill="${C.line}"/>
      ${label ? `<circle cx="${PAD + dot / 2}" cy="${labelTop + label.height / 2}" r="${dot / 2}" fill="${C.signal}"/>` : ''}
    </svg>`,
  );
  return sharp(backdrop)
    .composite([
      { input: wm, left: PAD, top: PAD },
      { input: site.input, left: W - PAD - site.width, top: PAD + Math.round((wmInfo.height - site.height) / 2) },
      ...(label ? [{ input: label.input, left: PAD + dot + 14, top: labelTop }] : []),
      { input: t.input, left: PAD, top: titleTop },
    ])
    // Full colour: a palette PNG bands the glow into visible rings.
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

function walk(dir) {
  return readdir(dir, { withFileTypes: true }).then((entries) =>
    Promise.all(
      entries.map((e) =>
        e.isDirectory() ? (e.name === '_astro' ? [] : walk(join(dir, e.name))) : e.name.endsWith('.html') ? [join(dir, e.name)] : [],
      ),
    ).then((x) => x.flat()),
  );
}

/** After a build: draw every /og/p/ image the built pages ask for. Returns the number written. */
export async function writeOgImages(clientDir) {
  const files = await walk(clientDir);
  const jobs = new Map();
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const image = (html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
    if (!image) continue;
    const imagePath = new URL(decode(image), 'https://x.invalid').pathname;
    if (!imagePath.startsWith('/og/p/')) continue;
    const title = decode((html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] ?? '');
    const rel = relative(clientDir, file).split(sep).join('/');
    const pagePath = rel === 'index.html' ? '/' : rel.endsWith('/index.html') ? `/${rel.slice(0, -'index.html'.length)}` : `/${rel}`;
    jobs.set(imagePath, { title: ogCardTitle(title), section: ogSection(pagePath) });
  }
  let fallback = null;
  await Promise.all(
    [...jobs].map(async ([imagePath, card]) => {
      const out = join(clientDir, imagePath);
      await mkdir(dirname(out), { recursive: true });
      let png;
      try {
        png = await renderOgCard(card);
      } catch (e) {
        // Never fail a deploy over a sharing image: use the shared card and say so in the build log.
        fallback ??= e;
        png = await readFile(join(ROOT, 'public/og/default.png'));
      }
      await writeFile(out, png);
    }),
  );
  if (fallback) console.warn(`[og-images] WARNING: could not draw the cards (${fallback.message}); used public/og/default.png instead.`);
  return jobs.size;
}

// `node scripts/og-images.mjs "A title" [Section] [out.png]`: draw one card to look at.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [title = 'How much does a website cost in Toronto?', section = 'Guide', out = 'og-sample.png'] = process.argv.slice(2);
  await writeFile(out, await renderOgCard({ title, section }));
  console.log(`wrote ${out}`);
}
