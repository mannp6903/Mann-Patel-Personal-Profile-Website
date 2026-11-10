# Logo update: MΛNN PΛTEL (10 Nov 2026)

Mann chose a new wordmark-only logo: **MΛNN PΛTEL**, his name in widely spaced capitals with the
two A's drawn without crossbars, in black and white. This round puts it on the site without changing
layout, motion, copy or colour. Headlines were made lighter so they sit with the logo (below).

A first pass also turned the whole site black and white; Mann asked to bring the colour back, so the
lime "Signal" palette stays exactly as it was. The logo itself is drawn in the text colour.

## What changed

| Area | Before | Now | Files |
| --- | --- | --- | --- |
| Header logo | Live text "Mann Patel" (Signal Sans, letters widen on hover) + lime dot | Outlined MΛNN PΛTEL wordmark, 13–14 px tall, dims slightly on hover; the link keeps its accessible name | `src/components/ui/Wordmark.astro`, `src/components/Header.astro` |
| Favicon | Ink tile, M and lime dot | Black tile with a white Geist M | `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` |
| Default sharing image | Lime "Signal" card with the line portrait | Black card: the wordmark, "Found. Answered. Booked." and mannpatel.me (case-study cards unchanged) | `scripts/make-images.mjs`, `public/og/default.png` |
| Headline type | Mona Sans 720–800, expanded 104–125%, hero words widen to 125% / 900 on hover | Mona Sans 580–620 at normal width (100%); hover widens to 108% / 700. Body text, mono labels and serif accents unchanged | `global.css` (h1–h4, `.display`, `.btn`), `Hero.astro`, and the title styles in 16 components and pages |
| Brand files | Fraunces wordmarks (5 files) | `mann-patel-wordmark.svg` (white), `mann-patel-wordmark-dark.svg` (black), `mann-patel-monogram.svg` | `public/brand/` |

Not changed: body text, labels and serif accents; colours (tokens, effects, WebGL), the case-study sharing cards, the owner notification
email, the footer's kinetic name and the 404 mark.

## The wordmark

Geist Regular capitals (Vercel, SIL OFL 1.1), +26% letter spacing, then optical pair adjustments
(M–Λ and Λ–N −4.5%, P–Λ −3%, Λ–T −6.5%, T–E +1%) and a tighter word space, so the slanted letters
sit as evenly as the straight ones. Shaped with HarfBuzz, outlined with fontTools, optimised with
SVGO. The full kit (vector and PNG logos, favicons, avatar, banners, sharing image, usage rules) was
delivered to Mann separately as `mannpatel-brand-kit.zip`.

## Verification

- `npm run build`, `npx astro check` (0 errors) and `npm test` (64 unit tests) pass.
- `npm run test:e2e`: 111 of 111 pass, including axe accessibility, layout at 320–1440 px and 200% text.
  The first run caught the header scrolling sideways at 320 px; the logo now scales from 11 px tall at
  320 px to 13 px from about 390 px (`clamp()` in `Header.astro`).
- Screenshots checked at 1440×900 and 390×844 (home, services): the logo shows on both, no overlaps.

## Rollback

Revert the merge commit of this branch; the previous text wordmark, favicon and sharing image return.
