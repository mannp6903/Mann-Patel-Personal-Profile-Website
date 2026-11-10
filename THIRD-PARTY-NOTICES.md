# Third-party notices

What this website uses that was made by others, and on what terms. Checked 8 November 2026.

## Shipped to visitors

| What | Version / source | Licence | Notes |
| --- | --- | --- | --- |
| Astro (framework) and its runtime | `astro` 7.4.4 | MIT | Builds the pages; a small amount of its runtime runs on the server endpoint |
| `@astrojs/cloudflare` | 14.4.3 | MIT | Production adapter (Cloudflare Workers) |
| `@astrojs/node` | 11.1.9 | MIT | Local preview and tests only |
| `@astrojs/sitemap` | 3.7.4 | MIT | Generates the sitemap |
| Geist (variable) | `geist` npm package 1.9.2 (font version 1.900), cut by `scripts/subset-fonts.py` | SIL OFL 1.1 | A Modified Version (subset). Notice and licence: `public/fonts/LICENSES.txt` |
| Geist Mono | Fontsource latin subset, cut further | SIL OFL 1.1 | `public/fonts/LICENSES.txt` |
| Geist (outlines in the MΛNN PΛTEL wordmark and monogram: `public/brand/`, `src/components/ui/Wordmark.astro`, `public/favicon.svg`) | Vercel, vercel/geist-font | SIL OFL 1.1 | `public/fonts/LICENSES.txt` |

Everything else on the site (layouts, components, styles, the signal-line portrait, the WebGL dot
field, the forms and their scripts) is original code in this repository.

## Not used

No UI component or animation library code was copied into the site. The options reviewed in the
8 November 2026 audit were **not** used: shadcn/ui, Radix Primitives, Motion, Motion-Primitives,
Magic UI, AstroWind, Brittany Chiang’s v4, Nim and React Bits (MIT plus Commons Clause, excluded by
default). Animmaster Lib is a paid library and was not used. Reference websites (emilkowal.ski,
rauno.me, brittanychiang.com and the Awwwards examples in `DESIGN.md`) were studied for structure
and principles only; none of their code, text or assets were copied.

## Used only to build and test (not shipped)

Playwright and `@axe-core/playwright` (Apache-2.0 and MPL-2.0), Vitest (MIT), TypeScript (Apache-2.0),
`@astrojs/check` (MIT), Wrangler (MIT OR Apache-2.0), Lighthouse (Apache-2.0, installed on demand),
sharp (Apache-2.0), fontTools (MIT, Python, for `scripts/subset-fonts.py`).

## Content

The portrait is Mann Patel’s own photo. Project captures are screenshots of nestnrestcleaning.com
(Mann’s own business) and of the Samp Hair & Spa preview (shown with the salon’s permission; its
stock photography is labelled “Illustrative photography” on that site).
