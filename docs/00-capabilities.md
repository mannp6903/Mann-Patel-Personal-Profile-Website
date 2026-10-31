# 00 · Environment and capability inventory

Checked 31 October 2026 in the Claude Code cloud session that built this project.

## Repository

- `mannp6903/Mann-Patel-Personal-Profile-Website` is **public** and was empty (no commits, no CLAUDE.md / AGENTS.md). It became a fresh Astro project.
- Consequence of a public repo: internal pricing assumptions, unconfirmed personal facts and security notes live in the git-ignored `private/` folder and were sent to Mann separately.

## Capability table

| Tool / skill | Status | Planned purpose | Fallback used |
| --- | --- | --- | --- |
| Node 22.23, npm 10.9, pnpm, TypeScript | Available | Build toolchain | — |
| npm registry | Reachable | Install Astro 7.4.4, adapters, fonts, test tools | — |
| Direct HTTP to most websites | **Blocked by egress policy** (curl returns no connection) | — | Firecrawl MCP for fetching and screenshots |
| Firecrawl MCP (scrape, search, screenshots) | Working | Reference screenshots (desktop/mobile), structure extraction, official docs, Wayback captures | — |
| Exa MCP | **Unavailable** (account out of credits, HTTP 402) | Research search | Firecrawl search + WebSearch |
| WebSearch | Working | Quick lookups | — |
| Mobbin MCP | **Unavailable** (requires a paid Mobbin plan) | Interface section references | Real sites inspected via Firecrawl |
| Figma MCP | Connected as "Mann Patel", **View seat** on a Starter team | Push tokens / design library | Tokens kept in code (`src/styles/tokens.css`) and documented; can be imported into Figma later by an editor seat |
| GitHub MCP | Connected as `mannp6903` | Repo access for this project | — |
| Vercel MCP | Connected (Hobby plan) | Not used: Hobby forbids commercial use | Netlify adapter prepared instead |
| Canva / Adobe / HCTI plugins | Failed to connect (proxy tunnel refused) | Artwork | Original artwork drawn as SVG/HTML in code |
| Ideogram / image generation | Listed, not used | — | No generated people or fake photos; artwork is typographic and coded |
| Playwright + Chromium (preinstalled 1.63) | Available locally | Real browser QA at 360–1440 px, interaction tests, captures | — |
| axe-core (`@axe-core/playwright`) | Installed | Automated accessibility checks | Manual keyboard/zoom checks |
| Lighthouse | Installed as a dev tool for the QA run | Lab performance score | — |
| Skills: `website-design:*`, `design:accessibility-review`, `design:ux-copy`, `marketing:seo-audit` | Available | Checklists consulted for review passes | — |
| `frontend-design` skill | **Not installed** in this session | — | Design direction documented in `docs/04-design-system.md` |
| vidIQ | Needs authorisation | Not relevant | — |

## Not done on purpose

- No changes to the Nest & Rest website, repository, DNS, hosting, forms, analytics or accounts.
- No domain purchase, DNS change, Search Console or Business Profile action, email provisioning or production deploy. These are listed as owner actions in `docs/05-launch-and-integrations.md`.
