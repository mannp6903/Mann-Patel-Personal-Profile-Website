# Round 8: "Tune in" (8 November 2026)

**Brief (from Mann):** make the hero and the photo unique and interesting, so that people who see it
wonder "who is this guy?" and go deeper into the site.

## The idea

The hero photo is a radio station. Mann's real photo arrives as a lost signal: lime-on-black static,
scanlines, colour split and tearing, with "No signal" over it. You can make out a person, but not who.
The visitor tunes an FM dial (or drags sideways across the photo) toward **104.3**. The picture clears
as they get close and snaps on at the station. Then:

1. the photo turns to full colour, and the frequency and signal bars go lime;
2. the three headline words (Found. Answered. Booked.) flash lime in turn;
3. a radar ping crosses the hero's dot field from the photo;
4. three true lines type over the photo: "Mann Patel, Toronto." / "Builds websites that get found." /
   "Built Nest & Rest from scratch.";
5. "Who is this guy? →" leads to About.

Nobody has to play: if the visitor doesn't touch it, it tunes itself in about 6.5 seconds after it
comes into view. "MANN FM" and 104.3 are a made-up dial, not a claim about a real station.

## Why this (research)

| Finding | Source | How it is used |
| --- | --- | --- |
| Curiosity peaks when people have *some* information and see a gap they can close (Loewenstein's information-gap theory, 1994). Too little and they don't care; too much and there's nothing left to find out. | [Information gap theory summary](https://concepts.dsebastien.net/concept/information-gap-theory/); [PBS NOVA, "How to stimulate curiosity"](https://www.pbs.org/wgbh/nova/article/how-to-stimulate-curiosity/) | The detuned photo shows a person but not who. The station is marked ("Mann" flag), so the gap is easy to close. |
| Closing the gap yourself is the reward. Partial reveals that the visitor controls hold attention longer than a finished image. | Same | The dial clears the picture gradually ("Getting closer…", "Almost there…") and the lock is the payoff (flash, ping, lines). |
| Recent award-winning portfolios lead with one strong, playful interaction around the person rather than many effects. | [Awwwards: G. Colombel Portfolio 2026](https://www.awwwards.com/sites/g-colombel-portfolio-2026) (Site of the Day, 28 Oct 2026) and other October 2026 Sites of the Day | One interaction, tied to the person and the "signal" identity the site already has (lime, dot field, coordinates). |
| Glitch and static looks are common in WebGL, but usually as decoration. We found no portfolio that makes the visitor tune a radio to find the person. | [Free Frontend: JavaScript glitch effects](https://freefrontend.com/javascript-glitch-effects/) | The static carries meaning (no signal) and has a goal (tune in), instead of being decoration. |
| A slider needs a name, a value people understand and keyboard support. | [WAI-ARIA Authoring Practices: Slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) | Native `<input type="range">` named "Tune in", `aria-valuetext` such as "104.3 FM, signal locked", arrows, Page Up/Down, Home/End, and a polite live status. |

## Rules it keeps (from the 8 Nov 2026 audit and earlier rounds)

- **Real photo only**, never generated. The three lines are true (see the Nest & Rest case study and
  the hero copy). No invented metrics or claims.
- **Native scrolling**, no forced scenes. Dragging the photo uses `touch-action: pan-y`, so vertical
  swipes still scroll on phones.
- **Content never waits:** the photo is a normal `<img>` with alt text, eager and high priority. The
  dial is in the HTML from the first paint (no layout shift). Without JavaScript you get the clear
  photo and its lines.
- **Motion is limited:** the animation runs only while something changes, stops a few seconds after,
  pauses off screen and in background tabs. With reduced motion it starts locked and nothing moves.
  The WebGL version skips CPU-only GPUs (same check as the dot field); the CSS version looks the same.
- **Measured:** on phones the tuner sits right after the buttons. When it was placed higher, the photo
  became the largest element on the first screen and Lighthouse mobile Performance fell from 100 to 98
  (simulated LCP 0.8 s → 2.3 s). After the buttons, the headline stays the LCP element and the score is
  100. The tuner starts its show only once it scrolls into view, so nobody misses the lock.

## Results (8 Nov 2026, local production build)

| Check | Result |
| --- | --- |
| Lighthouse mobile, Home | Performance 100, Accessibility 100, Best Practices 100, SEO 100 (LCP 0.8 s, CLS 0) |
| Lighthouse desktop, Home | 100 / 100 / 100 / 100 (LCP 0.5 s) |
| Playwright + axe | 91 passed, 1 skipped (as before) |
| New tests | keyboard tuning locks at 104.3 and says so; detuning says "Signal lost"; dragging the photo tunes; left alone it locks itself; reduced motion starts locked; no JavaScript shows the clear photo without the dial; phones start the show only when it is seen |

## Analytics

`tune_in` with `method: drag | keyboard | auto` when the signal locks (only after consent, like every
other event). It shows whether people play with the hero or wait for it. See `docs/05`.

## Files

`src/components/home/TuneIn.astro` (markup, CSS fallback, dial), `src/scripts/tune.ts` (engine,
shader), `src/components/home/Hero.astro` (placement, headline flash, analytics),
`src/scripts/fx/field.ts` (`signal:ping` listener), `tests/e2e/site.spec.ts`.
