# Changelog

The canonical changelog for the published `@vllnt/ui` package lives at [`packages/ui/CHANGELOG.md`](./packages/ui/CHANGELOG.md). It follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This root file is a **pointer** — it tracks repo-wide events that don't ship in a published package (CI workflows, registry build pipeline, ROADMAP changes, agent-surface routes like `/llms.txt`, `/r/<name>.json` schema additions).

## Where to look

| Looking for… | File / source |
|---|---|
| Published package changes (`@vllnt/ui`) | [`packages/ui/CHANGELOG.md`](./packages/ui/CHANGELOG.md) |
| Roadmap toward the next release | [`ROADMAP.md`](./ROADMAP.md) |
| Per-release notes | [GitHub Releases](https://github.com/vllnt/ui/releases) |
| Live registry index | [`/r/registry.json`](https://ui.vllnt.ai/r/registry.json) (carries `version` + `generatedAt`) |
| Per-component descriptors | [`/r/<name>.json`](https://ui.vllnt.ai/r/registry.json) (each carries `version` + `stability`) |

## [Unreleased] — repo-wide

> Target version: `0.3.0`. Tracks ROADMAP.md, see [#252](https://github.com/vllnt/ui/issues/252).

### Added

- **Agent-first surface** — `/robots.txt` allowing 11 AI crawlers, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, JSON-LD on every page, PWA manifest, breadcrumbs, custom 404, canonical URLs per route, expanded root metadata (keywords, robots tuning, OG/Twitter site-level config).
- **Codebase health gate** — `react-doctor` CI workflow with PR annotations + score artifact, `pnpm doctor*` script suite, type-enforcement workflow on every issue.
- **Registry-item richness** — every `/r/<name>.json` now carries `version`, `stability`, optional `a11y` schema, optional inline `examples`. Top-level `/r/registry.json` carries `version` + `generatedAt`.
- **Site UX** — Header GitHub icon, `/request-component` and `/report` pages with prefilled-GitHub-issue forms, per-component "Report a bug" button.
- **Brand** — `DESIGN.md` at repo root with the canonical brand + design guideline (color tokens, typography, motion, anti-patterns).
- **Agent skill** — `skills/vllnt-ui/` teaches AI coding harnesses how to consume `@vllnt/ui` and follow the design system. Acts as a table of contents: stable rules inline, the live component set + deep docs fetched from `/r/registry.json`, `/llms.txt`, `/llms-full.txt`, and `DESIGN.md`.

### Notes

- Site routes `/changelog`, `/releases`, and `/rss.xml` ship in a follow-up — this PR scopes #260 to the root pointer file.
- Once `0.3.0` is cut, the `Unreleased` heading flips to `0.3.0` and this section moves into [`packages/ui/CHANGELOG.md`](./packages/ui/CHANGELOG.md).
