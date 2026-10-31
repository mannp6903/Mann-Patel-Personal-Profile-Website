# 06 · QA report

**Date:** 31 October 2026 · **Build:** Astro 7.4.4, Node 22.23, preview mode (`SITE_MODE=preview`, `noindex`) · **Tested URL:** local production server `http://127.0.0.1:4321` (`node ./dist/server/entry.mjs`) · **Browser:** Playwright 1.63 Chromium (headless).

Automated results, the internal design score and real business outcomes are **three different things**. Nothing below measures leads, rankings or conversion.

## 1 · Automated checks (all on the final build)

| Check | Result |
| --- | --- |
| `astro check` (TypeScript + Astro) | 0 errors, 0 warnings, 0 hints (58 files) |
| Unit tests (Vitest 5) | **30 / 30 passed**: validation, content consistency (no prices or guarantees in promises), guide logic for every answer combination, time tokens, every handler path, Resend/webhook adapters with mocked APIs |
| E2E tests (Playwright + axe-core 4.14) | **35 / 35 passed** (list below) |
| Horizontal overflow, full-page captures | None on 10 pages at 360, 390, 768, 1024 and 1440 px (`qa-output/final/`, not committed) |
| Production gate | Preview build: **fails** as intended (24 errors). Simulated resolved content + production env: **passes** (0 errors, no preview markers) |

E2E coverage: every page renders one H1 with no console errors and **0 axe violations (WCAG 2.0/2.1/2.2 A and AA rules)**; real 404 status; all internal links resolve; Nest & Rest link present; robots blocks previews; JSON-LD valid with no rating, address or award claims; no sideways scroll at 320/360/390/768/1024/1440 px; reflow with text at 200%; mobile menu (open, Escape, focus return); skip link; guide recommendation, focus and brief pre-fill; guide refuses to guess when answers are missing; workflow demo ARIA tabs by keyboard; no-JS demo shows all steps; reduced motion disables stamps and reveals; form error summary and focus; **success shown only after server acceptance**, lead recorded, duplicate detection; network failure keeps answers; "not connected" server shows an honest message and keeps answers; **no-JS form post** reaches the confirmation page; honeypot and too-fast submissions rejected.

## 2 · Lighthouse (lab data)

Lighthouse **13.6.0**, mobile form factor, simulated throttling (Lighthouse defaults), local server, run 2026-10-31T21:23 UTC. Lab data only: a new site has no field (CrUX) data, so the Core Web Vitals targets (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75) can't be confirmed for real visitors yet. Lab TBT stands in for INP.

| Page | Perf | A11y | Best pr. | SEO* | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | 66 | 1.4 s | 0.013 | 0 ms |
| `/services/` | 99 | 100 | 100 | 63 | 2.0 s | 0 | 0 ms |
| `/work/` | 99 | 100 | 100 | 66 | 2.0 s | 0.001 | 0 ms |
| `/work/nest-and-rest-cleaning/` | 99 | 100 | 100 | 66 | 2.1 s | 0 | 0 ms |
| `/about/` | 100 | 100 | 100 | 63 | 0.9 s | 0 | 0 ms |
| `/contact/` | 100 | 100 | 100 | 63 | 1.1 s | 0 | 0 ms |

\* The only SEO failure is "Page is blocked from indexing", which is correct for a preview. A build with `PUBLIC_SITE_URL` + `SITE_INDEXING=true` scored **SEO 100 and Accessibility 100** on `/` and `/services/`, with canonical URLs, an allowing `robots.txt` and a 9-URL sitemap.

Weights: fonts 93 KB total (3 self-hosted woff2), case-study captures 10–46 KB WebP, no third-party scripts by default.

## 3 · Accessibility, beyond the tools

Done: semantic landmarks, one H1 per page, skip link, visible 3 px focus rings, keyboard paths tested (menu, guide radios, tabs, form, error summary), `aria-live` for the guide result and character counter, labelled controls with hints and errors linked by `aria-describedby`, `aria-invalid`, an error summary for multiple errors, ≥ 44 px targets for primary controls, reduced motion, no hover-only content, contrast measured (body 15.9:1, secondary 7.2:1; orange accent limited to large text and graphics).

**Not done (environment limits):** manual screen-reader passes (NVDA, JAWS, VoiceOver, TalkBack) and tests on real phones. Recommend one VoiceOver (iOS) and one TalkBack pass before launch. This report does **not** claim full WCAG 2.2 AA conformance; it records automated checks plus the manual keyboard checks above.

## 4 · Representative captures (committed, compressed)

| File | View |
| --- | --- |
| `docs/captures/home-mobile-390.jpg` | Home, 390 px |
| `docs/captures/home-tablet-768.jpg` | Home, 768 px |
| `docs/captures/home-desktop-1440.jpg` | Home, 1440 px |
| `docs/captures/services-mobile-390.jpg` | Services, 390 px |
| `docs/captures/contact-mobile-390.jpg` | Contact form, 390 px |
| `docs/captures/case-study-desktop-1440.jpg` | Nest & Rest case study, 1440 px |
| `docs/captures/concept-desktop-1440.jpg` | Kettle & Crumb concept, 1440 px |
| `docs/captures/404-mobile-390.jpg` | 404, 390 px |

## 5 · Issues found during QA and fixed

| Found | Fix |
| --- | --- |
| Workflow tab label overflowed at 390 px | Shorter label, wrapping allowed |
| Concept cards 7 px too wide at 360 px (non-wrapping chip) | Chips may wrap; grid items `min-width: 0` |
| Print-spec table stretched the case-study grid at 360–390 px | `minmax(0, 1fr)` tracks; table cells wrap |
| Contact inputs of unequal height on desktop | `.field { align-content: start }` |
| Kettle site mock clipped; Northline phone text across a colour break | Mock layout restructured |
| Decorative "Nothing slipped" stamp: 3.8:1 contrast; overlapped sample text; widened the page during its entry animation | Darker accent (≥ 5.4:1), moved into its own space, hero clips horizontal overflow |
| Header nav overflowed with text at 200% | Header and nav wrap |
| Guide button used `aria-disabled` while still working | Visual-only "waiting" style; the button always works and explains |
| Global smooth scrolling made programmatic scroll unstable | Removed; motion-aware scroll only where needed |

## 6 · Remaining limits

- **Email delivery is not connected.** The Resend and webhook adapters are unit-tested against mocked APIs only. A live test with sample data is an owner action (`docs/05` §1).
- Rate limits and duplicate memory are per server instance (best-effort on serverless hosts).
- Turnstile code path untested against Cloudflare (no keys).
- No real portrait, no client work, no field performance data yet.
- Nest & Rest's live site was offline on 31 Oct 2026; the case study uses archived captures and is gated until it's restored.

## 7 · Internal design review (subjective)

This is a self-assessment against the brief's rubric, **not** a test result or an outcome measure.

| Area | Weight | Score | Evidence | Main remaining weakness |
| --- | --- | --- | --- | --- |
| Positioning, profile, service clarity | 20 | 17 | Plain three-verb H1; every service has problem, deliverables, inputs, exclusions, handover; packages; honest FAQ | Copy isn't yet in Mann's own voice; no client proof |
| Navigation and hierarchy | 15 | 13 | 3 nav items + one CTA; one primary action per page; Services jump links; cleaning exit on every page | Services and Home are long; a returning visitor may want shorter paths |
| Art direction, typography, consistency | 20 | 16 | Distinct "front desk" ticket language, consistent tokens, coded concept artwork, no stock imagery | No real portrait or photography yet; some text-only sections feel plain |
| Useful interaction and motion | 10 | 9 | Guide + workflow demo with full fallbacks; restrained stamps; reduced-motion support | Brand-preview interaction not built |
| Mobile usability and accessibility | 15 | 13 | 0 axe violations, Lighthouse a11y 100, 320–1440 px and 200% text pass, keyboard tests | No manual screen-reader or real-device testing |
| Performance and technical SEO | 10 | 9 | Perf 99–100, CLS ≤ 0.013; SEO 100 on indexing build; sitemap, canonicals, JSON-LD | Lab data only; no domain yet |
| Enquiry reliability and measurement | 10 | 7 | Full pipeline incl. failure paths tested locally; GA4 plan with deduped `generate_lead` | Production delivery not connected or live-tested |
| **Total** | **100** | **84** | | |

**Path to 90+:** a real portrait, the About and founder copy rewritten in Mann's words, the Nest & Rest site restored and its build role confirmed, a live email delivery test, and one permissioned client project.
