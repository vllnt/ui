# Roadmap

> **Goal:** the most complete, agent-ready React component registry on the @vllnt design system — every component documented, typed, installable via the shadcn CLI, and discoverable by humans and agents.
> **Now:** `family-pages` code-complete on `feat/family-homepage` (pending merge); `component-sidebar` next. 0.4.0 canary cycle.
> **Last updated:** 2026-07-02
> **Channels:** `@latest` = `0.3.0` · `@canary` = `0.4.0-canary.<sha>` (auto-publishes on every merge to main). Tracking: [milestone 0.3.0](https://github.com/vllnt/ui/milestone/1)

Convention: phases are kebab-case outcome slugs, ordered DONE → ACTIVE → PLANNED. Tasks carry stable `<slug>.<n>` IDs; functional tasks pair with a `Validate`/`E2E` task. History is never deleted. Shipped 0.3.0 detail lives in `CHANGELOG.md` and the 197 closed issues; phases below summarize it.

---

## component-library [DONE 2026-06]

**Goal:** Grow the registry into a comprehensive set spanning forms, data, content, AI, maps, canvas, and timelines.
**Exit criteria:** `registry.json` carries 309 components, each with a story + test; `@vllnt/ui@0.3.0` published to npm.
**Verify:** `npm i @vllnt/ui@latest` resolves 0.3.0; `/components` lists 309; `npx shadcn add @vllnt/<c>` installs a leaf + its siblings.

- [x] component-library.1 Ship +169 components → 309 total (full list in CHANGELOG `[0.3.0]`) — #159–#204
- [x] component-library.2 Hybrid CLI installs: leaf source + `@vllnt/ui` for siblings — #232
- [x] component-library.3 Registry-item richness: `version`, `stability`, `a11y` schema, inline `examples`, TSDoc props per `/r/<name>.json` — #242, #253–#255
- [x] component-library.4 Validate: component-count guard + per-component story/test green

## agent-surface [DONE 2026-06]

**Goal:** Full SEO + AI-agent discoverability for the registry site.
**Exit criteria:** robots, sitemap, canonical URLs, `/llms.txt` + `/llms-full.txt`, JSON-LD on every page, PWA manifest, breadcrumbs, custom 404, MCP server live; Lighthouse SEO ≥ 95.
**Verify:** `/llms.txt` validates (llmstxt.org); Google Rich Results clean on `/components/[slug]` + `/design`; MCP smoke-tested in Claude Desktop.

- [x] agent-surface.1 `robots.ts` (11 AI crawlers) + `sitemap.ts` — #233, #234
- [x] agent-surface.2 Canonical URLs + keywords / verification / author metadata — #237, #241
- [x] agent-surface.3 `/llms.txt` + `/llms-full.txt` — #235, #236
- [x] agent-surface.4 JSON-LD (Organization, WebSite, SoftwareSourceCode, ItemList, BreadcrumbList) + manifest + custom 404 + breadcrumbs — #238, #239, #240, #251
- [x] agent-surface.5 Release-intelligence surface: `/changelog`, `/releases`, `/rss.xml`, `/atom.xml` — #260
- [x] agent-surface.6 `@vllnt/mcp` server at `ui.vllnt.ai/mcp` — #246
- [x] agent-surface.7 Community paths: footer, header GitHub icon, `/request-component`, `/report`, FUNDING, shadcn-CLI install path — #243–#247, #261, #265
- [x] agent-surface.8 Brand: DESIGN.md + `/design` + `design.tokens.json` — #250
- [x] agent-surface.9 Landing rebuild to OSS-library best practices — #264

## codebase-health [DONE 2026-06]

**Goal:** A `react-doctor` CI gate so the library ships and stays green.
**Exit criteria:** react-doctor workflow + PR annotations; 0 BLOCKING errors; warning sweep 1769 → under 100 (epic #279).
**Verify:** `pnpm doctor:errors` exits 0 on main; CI annotates PRs.
**Caveat:** local `.react-doctor.json` score reads **71** (epic target was 90) → carried to Later: `react-doctor-90`.

- [x] codebase-health.1 CI: enforce issue `type` + react-doctor workflow + `pnpm doctor*` scripts + pre-commit — #278, #280, #282
- [x] codebase-health.2 Fix 7 BLOCKING errors (rules-of-hooks + combobox a11y) — #266
- [x] codebase-health.3 Warning sweep across 12 categories (design system, React 19, perf, correctness, a11y, …) — #231, #267–#277
- [x] codebase-health.4 README count + `package.json` repo fields — #249

## release-pipeline [DONE 2026-06]

**Goal:** A canary → stable publish model with hard safeguards.
**Exit criteria:** every merge to main publishes `@canary`; stable via manual `workflow_dispatch`; 0.3.0 published; 0.4.0 canary cycle started.
**Verify:** `npm view @vllnt/ui dist-tags` → `latest: 0.3.0`, `canary: 0.4.0-canary.<sha>`.

- [x] release-pipeline.1 Stable 0.3.0 publish (changelog + counts) — #433
- [x] release-pipeline.2 Advance install target to `@vllnt/ui@0.3.0` (post-publish) — #458
- [x] release-pipeline.3 Start 0.4.0 canary cycle (version bump + roadmap) — #459 (PR #460), verified `0.4.0-canary.cb3c196` on npm

---

## family-pages [ACTIVE — code-complete on `feat/family-homepage`, pending merge]

**Goal:** A per-family landing at `/families/[category]` — the SEO / agent-surface destination for the Family breadcrumb crumb (#461) and the sidebar drill-down.
**Exit criteria:** 12 family landings on one shared `/families/[category]` template (`ai` included), each hero + CTAs + count + SEO sub-groups (`family-groups.ts`) + editorial copy + FAQ + agent surface; sitemap'd; `CollectionPage`/`ItemList` + `FAQPage` JSON-LD; `/components` headings + component-page family crumb link in via `familyPath`.
**Verify:** `/families/form` renders the Form grid + FAQ; `/ai` permanently redirects to `/families/ai`; Google Rich Results clean on a family page. Moves to the DONE cluster on merge to main + canary publish.

- [x] family-pages.1 `/families/[category]` route: hero + description + count + data-driven grid, zero nav maintenance — #463
- [x] family-pages.2 Internal links: `/components` family headings + component-page family crumb → family page via `familyPath` — #463
- [x] family-pages.3 sitemap `familyRoutes()` + `collectionPageLd` (CollectionPage/ItemList) + `faqPageLd` — #463
- [x] family-pages.4 `ai` reconciled: consolidated under `/families/ai` (shared template, grouped), `/ai` → permanent redirect, `familyPath` helper — #463
- [x] family-pages.5 Per-family SEO copy + FAQ (`family-copy.ts`) + branded titles / keywords — #463
- [x] family-pages.6 Validate: e2e `family-homepage.spec.ts` + unit `component-categories.test.ts` (E2E)
- [x] family-pages.7 One shared landing template for every family incl. `ai` (hero + CTAs + agent surface); per-family SEO sub-groups (`family-groups.ts`); `/families` index — #463

## component-sidebar [ACTIVE]

**Goal:** Navigate 309 components via a single-pane **drill-down** — families list ⇄ one family's components — synced to the breadcrumb, so the sidebar never shows more than one family at once.
**Exit criteria:** On `/components/[slug]` the sidebar auto-drills to the component's family (pinned docs-essentials on top, that family's components only, active item marked) with a "← All families" back; breadcrumb reads `Components / Family / Component`; a global filter + ⌘K jump to any component cross-family; last-family + scroll persist; keyboard-only + mobile pass.
**Verify:** a dev opening `/components/button` sees the sidebar drilled into **Form** (Button active) and breadcrumb `Components › Form › Button`; "← All families" returns to the 12-family list; filter "globe" (cross-family) drills to Globe3D; reload keeps Form drilled. Personas: browsing dev (desktop + mobile, keyboard-only); maintainer adding a categorized component (auto-appears in its family).

Single-pane drill-down (chosen over accordion-single-open and a two-pane family rail — it matches the breadcrumb model and only ever shows one family). Grouping derives from the existing `category` enum (12 families: utility 51, data 45, content 43, form 38, learning 30, core 26, navigation 23, data-display 21, overlay 15, ai 9, educational 5, billing 3), so it stays zero-maintenance. UI-layer only — no schema change. Locked UX decisions: pinned top = docs-essentials (Overview, Getting Started, Theming); filter + ⌘K = global cross-family; ROOT = families-only list.

- [ ] component-sidebar.1 Two-level drill-down state (`ROOT` ⇄ `FAMILY`): ROOT = families list (count + chevron), FAMILY = one family's components only (`apps/registry/lib/sidebar-sections.ts` + `@vllnt/ui` Sidebar)
- [ ] component-sidebar.2 Auto-drill from route: `/components/[slug]` opens `FAMILY(category)` with the active item; "← All families" + breadcrumb `Components` pop to ROOT
- [ ] component-sidebar.3 Pin docs-essentials (Overview, Getting Started, Theming) above both levels
- [ ] component-sidebar.4 Breadcrumb sync: `Components / Family / Component`; the Family + Components segments drive the sidebar level
- [ ] component-sidebar.5 Global filter + ⌘K (reuse the existing Command + SearchDialog/pagefind index): a cross-family match drills to its family; virtualize families > 25 items
- [ ] component-sidebar.6 Directional slide transition with `prefers-reduced-motion` instant fallback; persist last-family + scroll (localStorage)
- [ ] component-sidebar.7 Validate component-sidebar.1–6: Playwright E2E (desktop + mobile + keyboard) — auto-drill, back, breadcrumb sync, global filter, ⌘K, persistence (E2E)

## ai-elements-parity [PLANNED]

**Goal:** Close the gap vs shadcn AI Elements (~48 components); ship the chat/agent-core set we lack.
**Exit criteria:** Tier-1 (7) shipped with story + test + registry entry; a demo composes them end-to-end.
**Verify:** a demo page renders Message + Context + Task + Plan + Confirmation + Attachments + MessageActions + MessageBranch in one chat flow.

- [ ] ai-elements-parity.1 `Context` — token / context-window usage meter
- [ ] ai-elements-parity.2 `Task` — atomic work-item card (we have the chain, not the unit)
- [ ] ai-elements-parity.3 `Plan` — structured plan with an approve step
- [ ] ai-elements-parity.4 `Confirmation` — approve-before-action gate (wraps `AlertDialog`)
- [ ] ai-elements-parity.5 `Attachments` — file / media upload in the prompt composer
- [ ] ai-elements-parity.6 `MessageActions` — per-message action bar (copy / retry / edit)
- [ ] ai-elements-parity.7 `MessageBranch` — message version switcher
- [ ] ai-elements-parity.8 Tier-2 stretch: `Checkpoint`, `RequestQueue`, `OpenInChat`, `AIImage`
- [ ] ai-elements-parity.9 Validate ai-elements-parity.1–7: story + test per component + composed chat E2E (E2E)

Deferred families (Later): voice (6), IDE code surfaces (9), workflow canvas (5).

## agent-ui-cli [PLANNED]

**Goal:** One fast-installing command for any agent or dev to manage the whole client side + design system on `@vllnt/ui`. Four pillars: single entry · extremely fast install · common across projects · covers the whole client side.
**Exit criteria (MVP):** `gate` returns an identical pass/fail locally and in CI on a sample consumer; `theme check` fails a deliberately broken-contrast preset and passes the 16 shipped; `tokens check` fails on CSS-var drift and passes when `tokens.json` is the sole source; `init` wires pre-commit + CI to `vllnt-ui gate` with no hand-edits; cold `npx <cli>@latest gate` runs with no component-lib download.
**Verify:** run it like a consumer — a sample repo's pre-commit + PR both call `vllnt-ui gate`; an off-token color fails `check`. Full command spec in the appendix.

- [ ] agent-ui-cli.1 `context` — emit rules + tokens + component index as JSON
- [ ] agent-ui-cli.2 `check` — design-lint on usage (off-token color, missing `use client`, off-scale spacing); `--fix`
- [ ] agent-ui-cli.3 `tokens check` (L0, owned) — token-system correctness + single-source sync + OKLCH gamut
- [ ] agent-ui-cli.4 `theme check` (L0, owned) — WCAG contrast + token parity across 16 presets × light/dark
- [ ] agent-ui-cli.5 reduced-motion lint (L0, owned)
- [ ] agent-ui-cli.6 `gate` — compose L0 + L1 (lint) + L2 (tsc); one verdict; `--staged` / `--scope changed`
- [ ] agent-ui-cli.7 `init` / `sync` — scaffold + version-pin the shared config bundle
- [ ] agent-ui-cli.8 `fix` / no-arg default — bare `vllnt-ui` auto-detects + runs `gate`
- [ ] agent-ui-cli.9 Validate MVP gate (see Exit criteria) on a sample consumer repo (E2E)

---

## Later

Unscheduled — pull into a phase when prioritized.

- **react-doctor-90** — push score 71 → 90 (sweep issues closed but target not fully met; see `codebase-health` caveat).
- **typography-primitives** (#465) — foundation `Text` / `Heading` / `Display` (/`Prose`) with token-driven font-family, heading-weight, and type-scale, all theme-overridable. Feasible (~12–18 files; an existing `typography` component — H1–H4/P/Lead/… — to model or extend), **but needs 3 triage decisions before scheduling**: (1) `--font-display` is a net-new token → conflicts with "no new design tokens beyond DESIGN.md baseline" (Out of scope) — resolve by adding a display family to the DESIGN.md baseline, or drop `--font-display` and map `Display` to `--font-sans`; (2) wire `--font-sans` as the actual default — today the body font is `font-mono` (`packages/ui/src/styles.css`), not sans, so "default stays semibold sans" isn't literally true; (3) reconcile the default heading weight — existing `typography.tsx` h1 uses `font-extrabold` (800) vs DESIGN.md's 600 semibold.
- **ai-elements-voice** (6) — AudioPlayer, MicSelector, Persona, SpeechInput, Transcription, VoiceSelector.
- **ai-elements-ide** (9) — Commit, EnvironmentVariables, FileTree, PackageInfo, SchemaDisplay, Snippet, StackTrace, Terminal, TestResults.
- **ai-elements-canvas** (5) — Canvas, Connection, Controls, Node, Panel (verify against existing `@xyflow`-based components first).
- **agent-ui-cli-v1** — config bundle, `doctor` wrapper, `add`, `ci` reusable workflow, `list`/`info`/`why`/`search`, `vllnt.config`, `upgrade`.
- **agent-ui-cli-v2** — `audit` (knip + size-limit), `audit --browser` (axe / Web Vitals), baseline gating, i18n lint, client security, `new`/scaffold, `theme new`/`edit`, `remove`/`diff`, `watch`/`report`.
- **docs + search** — `/docs` expansion (#248), Pagefind full-text (#257), Sandpack playground (#256), `/vs` pages (#258), `/templates` (#259), i18n via next-intl (#281).

---

## Appendix — agent-ui-cli full spec

Preserved design detail for the `agent-ui-cli` phase. Harness-agnostic CLI that ships the @vllnt design-system **agent contract** (rules + tokens + component index) and a **standardized client-side gate** that runs identically locally and in CI. Orchestrates wrappable OSS tools (eslint / stylelint / knip / size-limit / playwright); hand-writes the checks no OSS tool covers — chief among them **design-token correctness + coherence**: `tokens.json` is the single source of truth, and every CSS var, theme preset, and Tailwind value must derive from it without drift.

| Ship | Item | Type | Scope |
|---|---|---|---|
| MVP | `context` | Feature | Emit rules + tokens + component index as JSON — agent loads before UI work |
| MVP | `check` | Feature | Static design-lint on *usage*: off-token color, missing `use client`, off-scale spacing; `--fix` |
| MVP | `tokens check` (L0, **owned**) | Feature | Token *system* correct + coherent: schema, scale order, ref resolution, `tokens.json` ↔ CSS ↔ Tailwind single-source sync, OKLCH gamut |
| MVP | `theme check` (L0, **owned**) | Feature | Perceptual: WCAG contrast + token-parity across all 16 presets × light/dark — no OSS tool does this |
| MVP | reduced-motion lint (L0, **owned**) | Feature | Enforce `prefers-reduced-motion` in JS/Framer (today: per-component, unlinted) |
| MVP | `gate` | Feature | Compose L0 + L1 (lint) + L2 (tsc); one verdict; `--staged` (pre-commit) / `--scope changed` (CI) |
| MVP | `init` / `sync` | Feature | Scaffold + version-pin the shared client-side config bundle into a consumer repo |
| MVP | `fix` / no-arg default | Feature | Single entry: bare `vllnt-ui` auto-detects + runs `gate`; `fix` runs every autofixer (eslint / stylelint / tokens / prettier-tw) |
| v1 | config bundle | Task | Extend `@vllnt/eslint-config`; add stylelint / knip / size-limit / playwright presets, pinned |
| v1 | `doctor` | Task | react-doctor wrapper — version-pinned + flag-normalized (insulates consumers from CLI drift) |
| v1 | `add` | Task | `shadcn add @vllnt/<c>` passthrough, registry URL pinned |
| v1 | `ci` + reusable workflow | Feature | `dx.yml` (on `workflow_call`); consumers reference `uses: vllnt/ui/...@v1` |
| v1 | `list` / `info` / `why` / `search` | Task | Granular context reads (props, a11y, examples, explain-finding) |
| v1 | `vllnt.config` | Task | Zod-schema config: budgets, enabled checks, theme list, framework, monorepo `--project`, per-repo overrides |
| v1 | `upgrade` | Feature | Bump `@vllnt/ui` + run codemods (e.g. React 19 ref-as-prop) + `sync` |
| v2 | `audit` (L3) | Feature | knip (dead code / exports / deps) + size-limit (per-component bundle budgets) |
| v2 | `audit --browser` (L4) | Feature | agent-browser: axe ×(light+dark), Web Vitals (LCP/INP/CLS), visual screenshots — budgets, ×N median |
| v2 | Baseline gating | Task | `@eslint/css use-baseline` for container queries / View Transitions / `@scope` |
| v2 | i18n lint | Task | Hardcoded-string + RTL / logical-props (aligns with when RTL support lands) |
| v2 | client security | Task | `no-unsanitized` + CSP scaffold + supply-chain scan (osv-scanner / Socket) |
| v2 | telemetry portability | Task | Flag platform-locked telemetry (`@vercel/analytics` 404s off-Vercel) → portable web-vitals beacon |
| v2 | `new` (scaffold) | Feature | Generate a component / page composed from @vllnt/ui — the generative half of "managing the client side" |
| v2 | `theme new` / `theme edit` | Feature | Author a brand preset with live contrast validation (design-system authoring, not just checking) |
| v2 | `remove` / `diff` | Task | Lifecycle: uninstall a component (+ orphaned deps); diff installed copy vs registry |
| v2 | `watch` / `report` | Task | Inner-loop re-check on save; compliance score over time vs baseline |

### Commands in detail

**Context** — read-only, `--json` default; source is local canonical in the monorepo, bundled-in-package + remote registry in a consumer repo.

- `context` — one payload an agent loads before any UI work: BLOCKING design rules + full token set (with resolved CSS-var names) + component index (name, category, stability, import, a11y, props summary).
- `list` / `info <c>` / `search <q>` — registry index / single-component detail (props, a11y, examples, deps) / fuzzy find.
- `why <file:line>` — passthrough to `react-doctor why`; explains a finding.

**Tokens & theme** — the design-token correctness + coherence core (L0, owned — no single OSS tool does this).

- `tokens` — emit resolved design tokens as JSON; `--group color|spacing|type|radius|elevation|motion`. The data feed for agents and the checks below.
- `tokens check` — assert the token *system* is correct and coherent:
  - **schema** — `tokens.json` valid against its `$schema` (DTCG).
  - **scale order** — spacing / type / radius / elevation scales monotonic, no dup or gap.
  - **reference integrity** — alias tokens resolve; no cycles, no dangling refs.
  - **single source of truth** — every CSS var in `themes/default.css` + `themes/presets.css` + the Tailwind preset derives from a token; flags inline redefinitions (e.g. the registry's own `tailwind.config`) and orphan tokens (defined, never emitted).
  - **gamut / format** — OKLCH channels parse and sit in valid range.
  - **naming** — CSS-var name matches the token path.
  - local: human report + `--fix` for mechanical issues (ordering, missing var); CI: `--json`, nonzero exit.
- `theme check` — perceptual coherence: every semantic token has a light + dark value across all 16 presets (parity), and computed **WCAG AA contrast** holds for every fg/bg pair in each of the 32 theme×mode combos; `--preset <name>` to scope.

**Validate (static gate)**

- `check [path]` — design-lint on *usage*: hardcoded color not from a token, missing `use client`, off-scale spacing / arbitrary Tailwind values, barrel-in-browser-bundler; `--fix`. (`tokens check` validates token *definition*; `check` validates token *usage*.)
- `doctor [paths]` — react-doctor wrapper, version-pinned + flag-normalized (`--scope` / `--base` / `--blocking`); ships vllnt `doctor.config` so consumers inherit the same gate.
- `gate` — compose L0 (`tokens check` + `theme check` + reduced-motion) + L1 (`check` + `doctor` + eslint/stylelint bundle) + L2 (`tsc`); one verdict, one exit code. `--staged` (pre-commit), `--scope changed --base origin/main` (PR), `--scope full` (main). The local==CI parity primitive.

**Setup / standardize**

- `init` — scaffold the standard files (components.json @vllnt registry, Tailwind preset, tokens css, `doctor.config`, pre-commit hook, CI caller); idempotent.
- `sync` — re-pin every preset + the config bundle to the installed `@vllnt/ui` version; report + fix drift. Upgrading `@vllnt/ui` propagates the DX baseline to all repos.
- `ci` — emit the reusable-workflow caller (`uses: vllnt/ui/.github/workflows/dx.yml@vN`).
- `add <c…>` — `shadcn add @vllnt/<c>` passthrough, registry URL pinned.

**Audit (heavy — its own CI job, never in the fast gate)**

- `audit` (L3) — knip (dead code / exports / deps) + size-limit (per-component bundle budgets).
- `audit --browser` (L4) — boots app / Storybook; agent-browser drives axe ×(light+dark), Web Vitals (LCP/INP/CLS, ×N-run median vs budgets), console/hydration scan, multi-viewport screenshots + snapshot diff.

**Cross-cutting:** `--json` · `--ci` (auto from `$CI`) · `--scope full|changed|staged|lines` · `--base <ref>` · `--fix` · `--quiet`. Exit codes: `0` ok · `1` violations · `2` usage.

### Open architecture decisions (from gap analysis)

Resolve before building — each gates one of the four pillars:

- **Package shape → fast install.** Bin on `@vllnt/ui` pulls the heavy lib (next/* · @xyflow · syntax-highlighter) onto the CLI install path → slow cold `npx`. **Recommendation:** ship a tiny zero-dep `@vllnt/cli` (single esbuild bundle); brand stays via alias/docs, not the package graph. *(Reverses the earlier bin-on-`@vllnt/ui` pick — flagged for ratification.)*
- **Two-layer split.** Fast universal core (`context` · `gate` · `check` · `tokens` / `theme check` · `init` · `config` · `fix`) vs heavy stack-specific layer (`audit --browser` · `add` · `new` / scaffold · codemods). The single-command / fast / common promise holds **only for the core**; the heavy layer stays lazy + opt-in.
- **Framework support matrix.** `init` / `audit` currently assume Next App Router + Tailwind + Storybook → "common across projects" silently excludes Vite / Remix / Astro / Expo / SPA. **Decide:** declare a supported-framework matrix + adapter seam, or scope to "Next-first" explicitly.
- **Version handshake.** A standalone CLI must verify it matches the installed `@vllnt/ui` token + registry schema before `tokens check` / `add`.
- **Autofix safety.** `fix` / `upgrade` codemods default to dry-run + diff preview (never blind-rewrite bespoke UI); CLI telemetry opt-in only.

**MVP gate** (proven by running like a consumer):

- `gate` returns an **identical pass/fail verdict locally and in CI** on a sample `@vllnt/ui` consumer repo.
- `theme check` **fails** on a deliberately broken contrast in one preset and **passes** clean on the 16 shipped presets.
- `tokens check` **fails** when a CSS var in `themes/*.css` or the registry Tailwind config doesn't trace to a token (drift), and **passes** when `tokens.json` is the sole source.
- `init` produces a repo whose pre-commit hook + CI both call `vllnt-ui gate` with no hand-edits.
- cold `npx <cli>@latest gate` runs on a clean machine with **no component-lib download** (fast-install pillar).

The L4 browser-audit tier may roll to a later `0.4.x` / `0.5.0` under scope pressure.

---

## Versioning policy

- **Patch** (`0.3.x`) — bug fixes, content updates, non-breaking docs.
- **Minor** (`0.x.0`) — new components, new public APIs, new site surfaces.
- **Major** (`x.0.0`) — breaking API changes (`@vllnt/ui` exports), removed components, registry schema changes.

Semver discipline starts hard at `1.0.0`. Until then, `0.x.0` may include breaking changes documented in CHANGELOG.

## Out of scope (this cycle)

- React Compiler adoption.
- Right-to-left language support.
- Backend services for `/report` or `/request-component` (prefilled GitHub URLs — no backend).
- New design tokens beyond DESIGN.md baseline (this is what gates `typography-primitives` #465's `--font-display` — see Later).
- Versioned docs (deferred until breaking changes appear).
- Component analytics (privacy-respecting telemetry — separate decision).

---

## Tracking

- Open issues: `gh issue list -R vllnt/ui --state open` (2 open: #463 `family-pages` — code-complete on `feat/family-homepage`, pending merge; #465 `typography-primitives` — needs triage, see Later. Repo enforces issue-linked PRs).
- react-doctor score: `pnpm doctor:score`.
- Channels: `npm view @vllnt/ui dist-tags`.
