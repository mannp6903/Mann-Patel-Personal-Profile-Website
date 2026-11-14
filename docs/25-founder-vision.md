# Round 12 (14 Nov 2026): founder profile and Vision page

Why: Mann will show the site to a room of investors. The audit of 14 Nov 2026 found the site technically clean (0 broken links, 0 console errors, 0 axe violations, Lighthouse mobile 94–100) but missing the story an investor asks for. Mann chose "Founder profile + Vision page".

What changed
- **Home hero:** the H1 is the two service lines only. The outcome line moved out of the H1 into a short subline, the lead paragraph that repeated it was dropped, and the role line under "Hi, I'm Mann Patel." no longer repeats the H1 ("Founder and builder · Scarborough, Toronto"). A quiet link under the recent work leads to /vision/. The service pills are cut to the three core services (Local SEO & AI search, Enquiry follow-up & booking, Websites).
- **/vision/** (`src/pages/vision.astro`): the idea, two ventures (digital services and Nest & Rest Cleaning; CHECKMATE removed at Mann's request), dated shipped work, next steps, why Mann, and a let's-talk block. Two `<Confirm>` items (the order and dates of next steps, and the ask to partners and investors) show in previews and **fail the production build until Mann confirms or removes them**.
- **Menu:** Work, Services, Pricing, About, Vision, then Contact. The phone sheet's rows were tightened so six links still fit on a 375×667 screen. Vision is also in the ⌘K menu and the footer.
- **Presenter mode:** add `?present=1` to any address (stays on for the tab, `?present=0` turns it off). The type is 112.5%, the header clock and cursor effects are off, and → / PageDown and ← / PageUp jump section by section, so a slide clicker works.

Not changed on purpose: the small face beside the greeting stays removed (Mann's earlier call), so on phones the photo graph still follows the buttons.
