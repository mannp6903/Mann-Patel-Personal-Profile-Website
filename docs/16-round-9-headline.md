# Round 9: a headline that acts out its words (8 November 2026)

**Brief (from Mann):** make "Found. Answered. Booked." interestingly unique, so people are impressed
just by seeing it and dig further, without cutting anything from the first page or the phone menu.

## The idea

The three words are what Mann does for a small business, in the order a customer meets it. So each
word acts out its own meaning, once, one after another (about four seconds in all):

1. **Found.** The word is highlighted like a match in a search (the lime box everyone knows from
   find-in-page), then a lime **map pin** drops onto its full stop with a small ripple: found on the
   map.
2. **Answered.** A **chat bubble with typing dots** pops up over the end of the word, someone is
   replying, then it turns into **double "read" ticks** over the full stop.
3. **Booked.** The word is **circled by hand**, the way you circle a date on a calendar.

What stays afterwards: the pin, the ticks and the circle. They make the headline read as a tiny
story (search → message → booking) even for someone who arrives after the animation. Hover a word
(or tap it on a phone) to replay its scene.

## Why (research)

| Finding | Source | How it is used |
| --- | --- | --- |
| Motion should carry meaning ("type in motion"), not move for its own sake ("flying type"). Typeface, structure and movement together reinforce what the words say. | [IDMAA Journal: Integrating typography and motion in visual communication](https://idmaa.org/journalarticle-v3n1-integrating-typography-and-motion-in-visual-communication/); [Wikipedia: Kinetic typography](https://Www.wikipedia.org/wiki/Kinetic_type) | Each animation *is* the word's meaning (search match, typing, circling a date). |
| Kinetic type fails when the motion is needed to understand the words; screen-reader-friendly markup and no flashing above 3 per second. | [Digital Silk: kinetic typography (2026)](https://www.digitalsilk.com/web-design/web-trends/kinetic-typography/); [StudioMeyer: kinetic typography](https://studiomeyer.io/en/blog/kinetische-typografie) | The text is complete from the first frame; decorations are `aria-hidden`; the typing dots bounce under 2 per second; each scene plays once. |
| Pictures are remembered better than words alone (picture superiority effect), probably because they get both a verbal and a visual memory (dual coding). | [Wikipedia: Picture superiority effect](https://Www.Wikipedia.org/wiki/Picture_superiority_effect); [Memory & Cognition (Springer), 2018](https://link.springer.com/article/10.3758/s13421-018-0858-9) | Each word gets a small, familiar picture (pin, read ticks, circled date) that stays after the animation. |
| Award sites in 2026 lead with animated type in the hero area. | [Awwwards: animated type in hero area](https://www.awwwards.com/inspiration/animated-type-in-hero-area-ula-kluz); [Mat Voyce portfolio case study](https://www.hontran.dev/blog/mat-voyce-case-study-award-winning-portfolio) | The headline is the first thing that moves, before the tuner beside it. |

## Rules it keeps

- **Nothing removed:** the headline, the sentence, the copy, the buttons, the tuner and the phone
  menu all keep everything they had.
- **Fast:** the words are text from the first paint and stay the LCP element; the scenes are CSS
  (compositor-friendly transforms, clip-path and stroke drawing). The replay script does no work until
  someone hovers or taps.
- **Accessible:** the heading's text is unchanged; reduced motion and no JavaScript show the
  finished state; nothing loops.

## Also fixed: the phone menu was cut on short phones

On phones 568–667px tall the menu ran off the bottom: Privacy and Terms (and, once a phone number is
set, part of the contact row) were below the screen. The sheet now scales its link size and spacing
with the screen height, and on short phones the contact buttons become round icons (each keeps its
accessible name), so everything fits on one screen. Tested at 320×568, 375×667 and 390×844, with
email only (as now) and with all four contact buttons.

## Results (8 Nov 2026, local production build)

| Check | Result |
| --- | --- |
| Lighthouse mobile, Home | Performance 99–100 over three runs, Accessibility 100, Best Practices 100, SEO 100; LCP 0.8 s (the headline) |
| Lighthouse mobile, Services and About | 100 / 100 / 100 / 100 |
| Lighthouse desktop, Home | 100 / 100 / 100 / 100 |
| Playwright + axe | 96 passed, 1 skipped (as before) |
| New tests | the headline's finished state, decoration hidden from screen readers, hover replays; reduced motion shows the finished state; the phone menu fits one screen at three phone sizes |
