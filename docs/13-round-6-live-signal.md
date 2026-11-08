# 13 · Round 6: "Live Signal", the motion layer and a 98+ audit (8 Nov 2026)

**Request (Mann):** use Animmaster Lib ("300 PRO-level animated components", WebGL + GSAP) to make
the site the best animated personal website possible, score 98+ on everything, fix every broken link
and bug, and make bold changes.

## 1. About Animmaster Lib

Animmaster Lib (Animmaster Studio, July 2026) is a paid library of 300 web animation components built
on WebGL and GSAP. Its pages could not be opened from the build environment (the share link and the
press articles are outside the allowed network), and its components are licensed, so nothing was
copied. Instead this round builds **original components of the same kind** (WebGL backgrounds,
cursor, magnetic and hover effects, text effects, scroll effects, page transitions), designed for this
site's "Signal" idea and written without GSAP or any other library. The whole effects layer is about
5 KB gzipped.

## 2. What's new

| Component | What you see | Files |
| --- | --- | --- |
| **Signal field (WebGL)** | A living dot map behind the home hero, every page title, the About header, the footer call to action and the 404. Dots breathe with a slow noise "carrier" and a faint lime aurora gathers toward the portrait; around the pointer they swell and turn lime; **a click or tap sends a radar ping** (the "Found" idea). On the 404 page the ping is "looking for" the missing page. | `src/scripts/fx/field.ts`, `src/components/fx/Field.astro` |
| **Cursor follower** | A ring trails the cursor, grows over links and turns into a lime "Open" disc over project rows. The real cursor always stays. | `fx/cursor.ts` |
| **Magnetic buttons** | Every button leans toward the pointer, its arrow disc a little more, and springs back. | `fx/pointer.ts`, `global.css` |
| **Spotlight panels** | Work cards and rows, packages and contact panels: a lime light and a lit border follow the pointer. | `fx/pointer.ts`, `global.css` |
| **3D tilt + glare** | Project captures lean toward the pointer with a moving glare. | `fx/pointer.ts`, `work/ProjectMedia.astro` |
| **Decoding labels** | Every mono label decodes through signal glyphs when it arrives; so do the hero coordinates. | `fx/text.ts` |
| **Scroll-lit statements** | Key statements (home "What I do", home About, About "Where I'm going") light up word by word as you read. | `fx/text.ts` |
| **Scroll marquee** | A band of giant "Found. Answered. *Booked.*" (solid, outline, lime serif) with a services row, moving in opposite directions only while you scroll and leaning with your speed. | `fx/marquee.ts`, `components/fx/Marquee.astro` |
| **Reading line** | A lime line along the header tracks how far you've read (CSS only). | `Header.astro` |
| **Page transitions** | The old page recedes and dims while the new one wipes up; the header holds still. | `global.css`, `Header.astro` |
| **Image reveals** | Case-study close-ups and captures open from a frame and settle as they scroll in (CSS only). | `global.css`, `pages/work/[id].astro` |

Rules kept from round 5: everything is off under reduced motion, content never waits on JavaScript,
nothing moves forever (the field's clock stops a few seconds after the last interaction; the marquee
moves only with scrolling), decorative layers are hidden from assistive tech, and the real text is
always available to screen readers (decoding labels keep a hidden copy).

## 3. Bugs found and fixed

| Bug | Effect | Fix |
| --- | --- | --- |
| A production build from a computer with the local preview `.env` (as the README's quick start creates) came out **noindex with no canonical URLs**: Wrangler, used by the Cloudflare adapter while prerendering, read `.env` and overrode the production values. The pre-launch check blocked the deploy, so nothing reached the live site, but `npm run deploy:cloudflare` from a laptop could not work. | Production SEO broken on local deploys | `scripts/build-cloudflare.mjs` sets `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV=false`. Verified: build with `.env` present → 0 errors, `index, follow`, canonical `https://mannpatel.me/…` |
| First-screen headings, intros and the case-study image were hidden until the scripts loaded and the scroll observer fired | Case studies LCP 3.3 s (mobile), Services 2.9 s, Work 3.0 s | First-screen content animates in CSS from the first paint (`data-reveal="load"`, `Heading load`, `data-reveal="load-media"`); a new test blocks all scripts and checks it is still visible |
| The signal portrait built and drew its whole drawing in one go | Long tasks of 95 ms + 52 ms on Home (TBT 160–240 ms) | Built and painted in small slices that yield to the browser, started at idle time (TBT 20–50 ms) |
| Fonts served whole (143 KB) | Slower first paint everywhere | Subsets cut to the characters the copy uses: **95 KB** (`scripts/subset-fonts.py`). Mona Sans is served as "Signal Sans" (its Reserved Font Name requires renaming a modified version) |
| Case-study hero image had no fetch priority and no size close to phone widths; the overlapping phone capture competed with it | LCP image late | `fetchpriority="high"` on the hero capture, a 720 w size, `fetchpriority="low"` on the phone capture, serif preload skipped where no serif is on the first screen |
| QA capture script marked reveals with a class that doesn't exist (`is-revealed`), so full-page captures could show hidden content; its overflow check flagged cards inside sideways rails | Misleading QA screenshots and reports | Uses `is-in`; ignores elements inside scroll containers |
| The pre-launch check verified page links but not assets | A missing font, image or script would ship unnoticed | Now also checks every `src`, `srcset`, preload and CSS `url()` |

**Links:** every internal link, fragment and asset was crawled on every page (9 pages + 404): no
broken links, no missing `#targets`, no console errors. External links (nestnrestcleaning.com,
samp-hair-spa.lovable.app, github.com/mannp6903) could not be opened from the build environment and
are unchanged.

## 4. Verification (8 Nov 2026)

| Check | Result |
| --- | --- |
| `astro check` | 0 errors, 0 warnings, 0 hints |
| Unit tests (Vitest) | **39/39** |
| Browser tests (Playwright + axe, WCAG 2.2 A/AA) | **81 passed, 1 skipped** (the phone-button test needs `PUBLIC_CONTACT_PHONE`). 11 new tests: WebGL shader compiles and draws (forced software GPU) and falls back to CSS dots without a GPU; reduced motion turns off WebGL, cursor, decoding and the marquee; cursor states and label; magnetic pull and release; decoding keeps the real text for screen readers; marquee moves only while scrolling; scroll-lit words keep text and links; spotlight and tilt; header view-transition name and reading line; first-screen content visible with all scripts blocked; subset fonts load |
| `npm run build:cloudflare` + pre-launch | **0 errors**, 2 expected warnings (`ENQUIRY_TO_EMAIL`, optional `FORM_TOKEN_SECRET` live in Cloudflare) |
| JavaScript | 45 KB minified for the whole site (17 KB gzipped); each page loads only its part; the effects layer is ~5 KB gzipped |

**Lighthouse 13.6** (mobile, simulated slow 4G and 4× CPU; production settings; served with brotli as
Cloudflare does):

| Page | Performance | Accessibility | Best practices | SEO | LCP | TBT |
| --- | --- | --- | --- | --- | --- | --- |
| Home | **100** | 100 | 100 | 100 | 0.8 s | 20 ms |
| Services | **100** | 100 | 100 | 100 | 0.8 s | 30 ms |
| Work | **100** | 100 | 100 | 100 | 0.8 s | 0 ms |
| Nest & Rest case study | **99** | 100 | 100 | 100 | 2.2 s | 30 ms |
| Samp Hair & Spa case study | **99** | 100 | 100 | 100 | 2.3 s | 0 ms |
| About | **100** | 100 | 100 | 100 | 0.8 s | 0 ms |
| Contact | **100** | 100 | 100* | 100 | 0.8 s | 0 ms |
| Privacy, Terms | **100** | 100 | 100 | 100 | 0.8 s | 0 ms |

Desktop: 100 / 100 / 100 / 100 on Home, Services, a case study and About.
\*Contact shows 96 on a static file server (its form status check needs the server endpoint); with
the real server it is 100. Before this round (same machine, preview server): Performance 92–97, LCP up
to 3.3 s, TBT up to 240 ms.

Captures: `docs/captures/r6-*.jpg` (the WebGL field is shown with the software renderer forced on).

## 5. Nest & Rest case study updated to the new version (8 Nov 2026)

Mann asked for the Work section to show the new nestnrestcleaning.com. The live site was captured
again on 8 Nov 2026 (it was redesigned on 4–6 Nov and is in "Opening soon" mode until bookings open).

| What | Change | Files |
| --- | --- | --- |
| Captures | New desktop (1440 px) and phone (360 px, 2×) captures of the live home page; the 31 Oct capture is now the "earlier version"; the unused 19 Oct archive captures and old close-ups were removed | `src/assets/work/nest-and-rest/`, `src/data/captures.ts` |
| Close-ups | Four "Look closer" details from the live site: the price box, the "Opening soon" notice, the postal-code check and the owner line | same |
| Case study text | Kind "opening summer 2027"; summary, highlights, scope and decisions match the site as it is now: booking request, quote forms and "text me this price" are built and switch on at launch; answer-first pages for Google and AI assistants; "Honest about timing" added as a decision; the November redesign in "How it evolved". Nothing is claimed that the live site doesn't show | `src/content/work/nest-and-rest-cleaning.md` |
| Business description | No longer says the site takes booking requests today | `src/data/site.ts` |
| Close-ups on phones | Keep each image's own shape (wide crops were being cut to 4:3), capped at 18rem tall | `src/pages/work/[id].astro` |

Facts were checked against the site's own repository (`mannp6903/nestnrestcleaning`, `main` at 6 Nov 2026)
and the live pages. Checks after the update: unit 39/39, Playwright + axe 81 passed (1 skipped), case
study Lighthouse mobile 99 / 100 / 100 / 100 (LCP 2.0–2.1 s).

## 6. Notes for Mann

- **Seeing the WebGL field:** it runs on any device with a real GPU. Browsers without one (and some
  locked-down office computers) show the static dot grid instead, by design. To preview it on such a
  machine, add `?fx=gl` to the address.
- **Fonts:** if the copy starts using a character outside plain English punctuation (for example an
  accented name), run `python3 scripts/subset-fonts.py` after adding it there; until then that one
  character uses the system fallback font.
- Owner actions in [`OWNER-INPUTS.md`](OWNER-INPUTS.md) are unchanged (Email Routing + `ENQUIRY_TO_EMAIL`,
  `PUBLIC_CONTACT_PHONE`, social links, a real client quote, pricing decision).
