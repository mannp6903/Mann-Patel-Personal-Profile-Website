# 08 · Studio-style redesign (1 Nov 2026)

Mann asked for a personal site "similar to" Dennis Snellenberg's freelance portfolio. The reference was used for **interaction patterns and layout ideas only**. Its text, images, colours and exact composition were not copied. Everything shown is Mann's: his name, his photo, his real projects and his ink / paper / stamp-orange palette. (The reference site couldn't be opened from the build environment. The patterns below are well-known features of it.)

| Pattern (reference) | Mann's version | File |
| --- | --- | --- |
| Full-screen portrait hero with a giant sliding name | Local background removal of Mann's own photo (rembg, run offline; the photo never left the machine) on warm stone `#8E8A82`; "Mann Patel —" slides and reverses with scroll direction; parallax on the portrait; **Pause button** (WCAG 2.2.2); still under reduced motion | `src/components/home/Hero.astro`, `src/assets/mann-patel-portrait-cutout.png` |
| Location pill with spinning globe | "Based in Toronto, Canada" | same |
| Short statement + round button | Intro statement, magnetic round "About me" | `src/components/home/Intro.astro` |
| Work rows with cursor-following preview | Nest & Rest and Samp rows; preview slides to the hovered project's real capture with a "View" disc (mouse only; touch/keyboard get plain links) | `src/components/home/WorkList.astro` |
| Image strips moving opposite ways on scroll | Real captures and close-ups only | `src/components/home/Rails.astro` |
| Non-sticky header + floating round menu button + side panel | Native `<dialog>` panel (focus contained, Esc closes, focus returns); a "Menu" button on phones; inline links without JS | `src/components/Header.astro` |
| "Let's work together" footer | Cut-out avatar, magnetic orange "Get in touch", email pill + Copy, live Toronto time, pages, socials, Nest & Rest | `src/components/Footer.astro` |
| Magnetic buttons | `[data-magnetic]`, mouse only, off with reduced motion | `src/scripts/magnetic.ts`, `src/styles/global.css` |
| Page transitions | CSS cross-document view transitions (supporting browsers; none with reduced motion) | `src/styles/global.css` |

Moved: the follow-up workflow demo now lives on Services (`/services/#follow-up`), made valid ARIA (panels are `div`s). Removed from Home: hero ticket, services strip, process, founder stamp and the closing band (all covered elsewhere or by the footer).

## Verification (local Node build)

- `astro check` 0 errors · unit 30/30 · Playwright + axe **39/39** (menu panel, floating button, reduced-motion hero added; footer-signature test removed)
- No horizontal overflow at 360, 390, 768, 1024, 1440 px on 8 pages
- Lighthouse 12.8.2 mobile, simulated: `/` 96 / 100 / 100, LCP 2.5 s, CLS 0 · `/services/` 97 / 100 / 100 · `/contact/` 98 / 100 / 100 (SEO 63–66 only because preview builds are `noindex`)
