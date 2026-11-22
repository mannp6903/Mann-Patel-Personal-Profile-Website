# The hero portrait (22 Nov 2026)

Mann's brief: the hero photo inside the "wired signal" graph looked bad and complicated; build something else with his
profile picture, with a unique animation, and no wires. This replaces `AgentGraph.astro` with
`HeroPortrait.astro`. It follows the earlier change the same day that left one portrait on Home
([`30-upgrade-report-phase-2.md`](30-upgrade-report-phase-2.md), row 3).

## What the research said

| Question | Finding | Source |
|---|---|---|
| Does a face in the hero help a service business? | A real photo of the person helps first-impression trust, most when it is clearly the person you'd deal with and not a stock model. Effects reported in tests are mixed by context, so the photo must be real and plain, not a gimmick. | Riegelsberger and Sasse, UCL (2004), on photos and trust online: discovery-pp.ucl.ac.uk; CXL, founder photo and credibility study: cxl.com/research-study/appeal-to-authority-credibility/; VWO, human photo vs icon test: vwo.com/blog/human-landing-page-increase-conversion-rate; SFU Beedie, faces and trust: beedie.sfu.ca/blog/?p=2069 |
| What do strong personal portfolios do with the photo? | A large cut-out portrait, the person standing in front of a panel or type, with depth from layering rather than diagrams; a few use dither or halftone reveals. | Awwwards portfolio inspiration (for example Carl Gordon, Bastian Gasser, Davor G. Zelic); Codrops, "How to design the ideal hero image for your online portfolio" (tympanus.net/codrops/2022/11/15/…); Tuts+, parallax text behind a subject (webdesign.tutsplus.com); Cloudinary, text behind an image; Framer "Dither reveal" component; Dave DeSandro, Breathing Halftone (breathing-halftone.desandro.com) |
| How to animate without hurting the largest paint? | Never start the hero image invisible: keep it painted from the first frame and animate a layer over it. Transform and opacity are the cheapest properties to animate. | Shopify, "Don't hide the LCP image behind animations" (shopify.dev/docs/storefronts/themes/best-practices/performance/dont-hide-lcp-image-behind-animations); Motion, web animation performance tier list (motion.dev/magazine/web-animation-performance-tier-list) |
| Scroll motion without a script? | CSS scroll-driven animations (`animation-timeline: view()`) run off the main thread in Chrome and are arriving in Safari; where unsupported, nothing happens. | Chrome for Developers, scroll-driven animations (developer.chrome.com/docs/css-ui/scroll-driven-animations); WebKit blog 17101 (webkit.org/blog/17101/) |

## The design

- **One photo, no diagram.** The cut-out (`src/assets/mann-patel-cutout.png`) stands in a plain studio panel: the
  page's surface colour, a 1px `--line` border, `--r-lg` corners, a soft light behind his head and the hero's dot grid.
  His head breaks out above the panel's top edge, so the photo has depth without any lines or labels. No lime: the
  hero's one lime mark stays the button. About 480px across at 1440, up to 22rem on phones (after the buttons, with his
  face on the first screen, so the small greeting avatar is gone).
- **The signature moment: a print that develops.** On load the panel rises, Mann rises into frame from behind its
  bottom edge, and he arrives as a **halftone print** (warm white dots, the site's dot grid made into a picture) that
  fades to reveal the real photo, like a print developing. A nod to his photography. About 1.3 s, once, transform and
  opacity only; then nothing moves on its own (gate M2).
- **Depth on scroll.** As the hero leaves, he comes a little forward (`scale(1.06)` from the panel's bottom edge, on a
  CSS view timeline). A scale, not a slide: sliding him up opened a 28px gap between his cut-off base and the panel's
  edge, caught in review. Browsers without scroll-driven animations show it still.
- **Reduced motion and no JavaScript:** the finished photo, still, with the print hidden.
- **Speed:** the photo is the page's one `fetchpriority="high"` image and is painted from the first frame, under the
  print (gate H6 accepts it as the LCP element). Both images are AVIF with a WebP fallback and a full srcset (gate G2).
  The print is made by `scripts/make-halftone.py` (Pillow) from the cut-out; re-run it if the cut-out changes.

## Removed

`AgentGraph.astro` (its SVG, labels, pulses and pause button), the lime exemption for the graph in gate C1, the unused
`--signal-a15` … `-a90` (except `-a60`), `--graph-ring` and `--graph-pill-line`. `--dur-loop` stays (the live dot's
ping), and the line-art greys and stroke weights stay for the services scenes.

## Checks run (22 Nov 2026, local)

| Check | Result |
|---|---|
| Unit tests (`npx vitest run`) | 177 passed |
| End-to-end, full suite | running |
