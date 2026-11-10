# Brand update: MΛNN PΛTEL, black and white (10 Nov 2026)

Mann chose a new wordmark-only brand: **MΛNN PΛTEL**, his name in widely spaced capitals with the
two A's drawn without crossbars, in black and white. This round puts it on the site without changing
layout, type, motion or copy.

## What changed

| Area | Before | Now | Files |
| --- | --- | --- | --- |
| Header logo | Live text "Mann Patel" (Signal Sans, letters widen on hover) + lime dot | Outlined MΛNN PΛTEL wordmark, 13–14 px tall, dims slightly on hover; the link keeps its accessible name | `src/components/ui/Wordmark.astro`, `src/components/Header.astro` |
| Accent | Lime `#D4F84A` | White `#FFFFFF` (buttons, focus ring, highlights, the hero scenes, the tuner's static and lock flash, the signal field) | `src/styles/tokens.css`, `Hero.astro`, `TuneIn.astro`, `global.css`, `scripts/fx/field.ts`, `scripts/tune.ts`, `scripts/signal-portrait.ts` |
| Greys | Warm (`#0B0B0C`, `#F2F1EC`…) | Neutral (`#000000`, `#EDEDED`, `#A1A1A1`, `#8F8F8F`…); every text colour still passes WCAG AA (table in `DESIGN.md`) | `src/styles/tokens.css` |
| Favicon | Ink tile, M and lime dot | Black tile with a white Geist M | `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` |
| Sharing images | Lime "Signal" card with the line portrait | Black card: the wordmark, "Found. Answered. Booked." and mannpatel.me; case-study cards recoloured | `scripts/make-images.mjs`, `scripts/make-project-cards.mjs`, `public/og/` |
| Brand files | Fraunces wordmarks (5 files) | `mann-patel-wordmark.svg` (white), `mann-patel-wordmark-dark.svg` (black), `mann-patel-monogram.svg` | `public/brand/` |

Not changed: the owner notification email (`src/lib/enquiry/email-html.ts`) keeps its lime badge,
because only Mann sees it; the footer's kinetic name and the 404 mark are unchanged.

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

Revert the merge commit of this branch; the previous lime "Signal" colours and text wordmark return.
