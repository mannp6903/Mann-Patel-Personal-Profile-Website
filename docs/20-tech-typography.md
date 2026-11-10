# Tech typography and lime Λ's (10 Nov 2026)

After the MΛNN PΛTEL logo went live, Mann asked for three things: lime in the two Λ's, the logo in
place of the name at the bottom of every page, and the site in "tech typography". The logo is drawn
from Geist, so the site now uses Geist too: one family for everything, Geist Mono for labels, and
headlines that step back to grey or lime instead of switching to a serif italic. Colours, layout,
copy and motion are otherwise unchanged; lime `#d4f84a` stays the one accent.

## What changed

| Area | Before | Now | Files |
| --- | --- | --- | --- |
| Logo | Λ's in the text colour | The two Λ's in lime (`--wm-accent`, default `--signal`); one path per letter | `components/ui/Wordmark.astro`, `public/brand/mann-patel-wordmark-lime.svg` |
| Footer name | "Mann Patel" in Signal Sans, letters widen near the pointer, lime dot | The MΛNN PΛTEL wordmark across the container; letters lift and turn lime near the pointer | `components/Footer.astro`, `scripts/motion.ts` |
| Main typeface | Mona Sans (served as "Signal Sans"), 69 KB | Geist, 24 KB | `styles/tokens.css`, `public/fonts/` |
| Accent words | Instrument Serif Italic, 11 KB | Same face and weight: `.accent` grey (`--text-3`), `.accent--signal` lime | `styles/global.css` and every heading that used `.serif` |
| Weights | 580–650 | 600 headings and display, 560 item titles, 540 buttons | `styles/global.css`, components |
| Hover widening | `font-stretch` 108–122% | Tracking opens to −0.02em (Geist has no width axis) | Header, Hero, work pages |
| Hero "Booked." | Serif italic, lime | Geist 600, lime; the hand-drawn circle is wider so it clears the full stop | `components/home/Hero.astro` |
| Free-check title | "Found & Answered" in serif italic | Dark olive on the lime band (5.9:1) | `components/home/FreeCheck.astro` |
| Sharing images | Wordmark in white; case-study titles in Signal Sans 780 | Lime Λ's; titles in Geist 600 | `scripts/make-images.mjs`, `scripts/make-project-cards.mjs`, `public/og/` |

Fonts loaded per page: 39 KB, down from 95 KB. The serif preload (`preloadSerif`) is gone; every page
preloads `geist-sans-wght.sub.woff2`. The fallback while Geist loads is Arial scaled to Geist's widths
(`Geist Fallback`: size-adjust 105.4%, ascent 95.4%, descent 28%).

Footer padding is smaller on phones so the case-study pages stay within seven phone screens (the
wordmark is shorter than the old name but had more space around it).

## Checks

`npm run build`, `astro check` (0 errors), 64 unit tests and 111 end-to-end tests pass, including
axe on every page, no sideways scrolling at 320 px, the phone page-length limits and the font test
(now expects Geist and Geist Mono, and no Signal Sans).

## Rollback

Revert the merge commit of this branch; Mona Sans, Instrument Serif, the text footer name and the
white Λ's return from git history.
