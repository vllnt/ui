# Roadmap

> Status: **0.4.0 canary** · Latest release: `v0.3.0` (2026-06-26) · Current canary: `0.4.0-canary.<sha>` · 0.4.0 scope below: AI Elements parity · react-doctor sweep · Agent UI CLI · 0.3.0 sections are the shipped baseline · Tracking: [milestone 0.3.0](https://github.com/vllnt/ui/milestone/1)

## TLDR

`0.3.0` is the **agent-first surface** release. Three themes:

1. **+169 new components** already in canary, finally published.
2. **Discoverability** — full SEO + AI-agent surface (`/llms.txt`, `/mcp`, sitemap, JSON-LD, manifest, structured data on every page).
3. **Codebase health gate** — `react-doctor` CI + tooling so we ship and stay green.

50 open issues, organized below in shipping order. Items marked **(stretch)** are nice-to-have but can roll to `0.4.0` if scope pressure.

---

## Components — canary → release (+169)

Counts taken from `registry.json` at `v0.2.1` (140) vs `HEAD` (**309**, +169 net). The curated list below highlights the headline additions; the full set is in the changelog.

### Hooks + utility primitives
- `CopyButton` + `useCopyToClipboard` hook (#159)
- `Banner` + `BannerAction` (#160)
- `Kbd` (#161)
- `EmptyState` (#162)
- `DocumentSiblingNav` (#163)

### Pricing + identity cards
- `PricingTable` + `PricingPlan` (#164)
- `HistoricalFigureCard` (#165)
- `CivilizationCard` + `CivilizationComparison` (#166)

### Newsletter + signup
- `NewsletterSignup` (state machine) (#167)

### AI compound families
- `ModelComparison` + `Column` + `Meta` + `Vote` (#168)
- `PromptTemplates` (#169)
- `AgentActivity` (#170)
- `AISidebar` (#171)
- `AIArtifact` (#172)

### Era / financial
- `EraComparison` (#173)
- `TransactionList` (#174)

### Forms
- `AutoReload` toggle + form (#175)

### Educational
- `KnowledgeCheck` inline question runner (#176)

### Charts + timelines
- `GanttChart` (#177)
- `ParallelTimeline` (#178)
- `Timeline` + `TimelineItem` (#179)
- `HistoricTimeline` (#180)
- `InteractiveTimeline` (#181)
- `ChronologicalTimeline` (#182)
- `TreeView` (#183)

### Document + reading
- `PrimarySourceViewer` compound family (#184)

### Maps + geography
- `Map2D` compound family (#185)
- `ChoroplethMap` (#186)
- `RouteMap` (#187)
- `HeatMapOverlay` (#188)
- `GeographyQuizMap` (#189)
- `MapTimeline` compound family (#190)
- `StoryMap` compound family (#191)
- `Globe3D` compound family (#192)

### Canvas / spatial
- `LiveCursor` + `CommentPin` + `PresenceSyncIndicator`
- `PresenceStack` + `SelectionPresence` + `ThreadBubble`
- `InfinitePlane` + `ViewportBookmarks` + `WorldBreadcrumbs`
- `SelectionHalo` + `SnapGuides` + `FloatingToolbar` (#197)
- `FollowMode` + `HandoffBeacon` (#196)
- `PropertySection` + `ObjectInspector` + `RelationshipInspector`
- `RuntimeOverview` + `RoutingAssignment` + `PolicyDelivery`
- `JarvisDock` + `MultiSelectLasso` + `ContextLens`

### Runtime overlays
- `AlertPulse` + `ThresholdRing` + `StickyMetric`
- `HeatOverlay` + `StateBadgeOverlay` + `MetricCluster`

### Time navigation
- `TimelineScrubber` + `PlaybackGhost` + `BottomActivity`
- `RunTimeline` (#204)

### Registry / install pipeline
- Hybrid CLI installs — leaf source + `@vllnt/ui` for siblings (#232)

---

## Sequencing — critical path to ship

**Phase 0 — Codebase health (BLOCKS regressions during the rest of the release)**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 1 | [#282](https://github.com/vllnt/ui/issues/282) | Task | CI: enforce `type` field on every issue |
| 2 | [#280](https://github.com/vllnt/ui/issues/280) | Task | CI: react-doctor workflow (PR annotations) |
| 3 | [#278](https://github.com/vllnt/ui/issues/278) | Task | DX: `pnpm doctor*` scripts + pre-commit |
| 4 | [#266](https://github.com/vllnt/ui/issues/266) | Bug | Fix 7 BLOCKING errors (rules-of-hooks + combobox a11y) |
| 5 | [#249](https://github.com/vllnt/ui/issues/249) | Task | Fix README count + package.json repo fields |

**Phase 1 — Crawler + AI agent surface**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 6 | [#233](https://github.com/vllnt/ui/issues/233) | Feature | `app/robots.ts` (allow all AI crawlers + sitemap link) |
| 7 | [#234](https://github.com/vllnt/ui/issues/234) | Feature | `app/sitemap.ts` (all routes + 309 components) |
| 8 | [#237](https://github.com/vllnt/ui/issues/237) | Feature | Canonical URLs per page |
| 9 | [#241](https://github.com/vllnt/ui/issues/241) | Feature | Keywords + verification + author metadata |
| 10 | [#235](https://github.com/vllnt/ui/issues/235) | Feature | `/llms.txt` |
| 11 | [#236](https://github.com/vllnt/ui/issues/236) | Feature | `/llms-full.txt` |

**Phase 2 — Rich results + structured data**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 12 | [#238](https://github.com/vllnt/ui/issues/238) | Feature | JSON-LD (Organization, WebSite, SoftwareSourceCode, ItemList) |
| 13 | [#239](https://github.com/vllnt/ui/issues/239) | Feature | `app/manifest.ts` (PWA) |
| 14 | [#240](https://github.com/vllnt/ui/issues/240) | Feature | Custom 404 |
| 15 | [#251](https://github.com/vllnt/ui/issues/251) | Feature | Breadcrumbs UI + `BreadcrumbList` JSON-LD |

**Phase 3 — Site UX + community paths**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 16 | [#243](https://github.com/vllnt/ui/issues/243) | Feature | Footer (GitHub / Storybook / Sponsor / Contribute) |
| 17 | [#244](https://github.com/vllnt/ui/issues/244) | Feature | Header GitHub icon |
| 18 | [#245](https://github.com/vllnt/ui/issues/245) | Feature | `/request-component` page + CTA → prefilled GH issue |
| 19 | [#265](https://github.com/vllnt/ui/issues/265) | Feature | `/report` bug page + per-component "Report a bug" button |
| 20 | [#261](https://github.com/vllnt/ui/issues/261) | Task | `.github/FUNDING.yml` (Sponsor button) |
| 21 | [#247](https://github.com/vllnt/ui/issues/247) | Task | Surface shadcn-CLI install path prominently |

**Phase 4 — Brand + release artifacts**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 22 | [#250](https://github.com/vllnt/ui/issues/250) | Feature | DESIGN.md + `/design` page + `design.tokens.json` |
| 23 | [#260](https://github.com/vllnt/ui/issues/260) | Feature | CHANGELOG.md + `/changelog` + `/releases` + `/rss.xml` |

**Phase 5 — Registry-item richness (agents need this to be useful)**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 24 | [#253](https://github.com/vllnt/ui/issues/253) | Feature | `version` + `stability` fields in `/r/<name>.json` |
| 25 | [#254](https://github.com/vllnt/ui/issues/254) | Feature | Inline usage examples in `/r/<name>.json` |
| 26 | [#242](https://github.com/vllnt/ui/issues/242) | Feature | TSDoc props extraction → `/r/<name>.json` + props table |
| 27 | [#255](https://github.com/vllnt/ui/issues/255) | Feature | Per-component a11y schema in `/r/<name>.json` |

**Phase 6 — Agent-first integration**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 28 | [#246](https://github.com/vllnt/ui/issues/246) | Feature | `@vllnt/mcp` MCP server at `ui.vllnt.ai/mcp` |

**Phase 7 — Landing rebuild (depends on Phases 1–6)**

| Order | Issue | Type | Notes |
|---|---|---|---|
| 29 | [#264](https://github.com/vllnt/ui/issues/264) | Feature | Rebuild landing page to OSS-library best practices (auto-updating stats, releases strip) |

---

## Stretch — in scope if time permits, else `0.4.0`

| Issue | Type | Why stretch |
|---|---|---|
| [#248](https://github.com/vllnt/ui/issues/248) | Feature | `/docs` expansion (9 pages) — large content effort |
| [#257](https://github.com/vllnt/ui/issues/257) | Feature | Pagefind full-text search — cosmetic without #248 |
| [#256](https://github.com/vllnt/ui/issues/256) | Feature | Sandpack playground — meaty bundle work |
| [#258](https://github.com/vllnt/ui/issues/258) | Feature | `/vs` comparison pages — copy-heavy |
| [#259](https://github.com/vllnt/ui/issues/259) | Feature | `/templates` starter kits — separate engineering |
| [#281](https://github.com/vllnt/ui/issues/281) | Feature | i18n via `next-intl` + per-locale MDX — 2-3 days alone |
| [#262](https://github.com/vllnt/ui/issues/262) | Task | Hero rewrite — superseded by #264, close on merge |

---

## react-doctor warning sweep — `0.4.0`

Errors fixed in `0.3.0` (#266). Warning categories addressed sequentially as standalone PRs:

| Issue | Type | Warnings | Approach |
|---|---|---|---|
| [#279](https://github.com/vllnt/ui/issues/279) | Task | — | EPIC: react-doctor sweep (62 → 90 score) |
| [#267](https://github.com/vllnt/ui/issues/267) | Task | ~638 | Design system audit — depends on #250 |
| [#268](https://github.com/vllnt/ui/issues/268) | Task | ~439 | React 19 migration — codemod-able |
| [#269](https://github.com/vllnt/ui/issues/269) | Task | ~336 | Files / exports / types structure |
| [#270](https://github.com/vllnt/ui/issues/270) | Task | ~112 | JS performance (hoist Intl, combine iterations) |
| [#276](https://github.com/vllnt/ui/issues/276) | Task | ~51 | Generic handler names |
| [#272](https://github.com/vllnt/ui/issues/272) | Bug | ~61 | Correctness — array-index keys, hydration, localStorage |
| [#271](https://github.com/vllnt/ui/issues/271) | Bug | ~41 | State & effects (derived state, cascading setState) |
| [#277](https://github.com/vllnt/ui/issues/277) | Task | ~40 | Misc — giant components, render-in-render |
| [#273](https://github.com/vllnt/ui/issues/273) | Task | ~34 | Re-render hygiene |
| [#274](https://github.com/vllnt/ui/issues/274) | Task | ~15 | Next.js rules |
| [#275](https://github.com/vllnt/ui/issues/275) | Bug | ~8 | A11y warnings |
| [#231](https://github.com/vllnt/ui/issues/231) | Task | — | Backfill Vitest coverage (pre-existing) |

Total: 1769 warnings → target < 100.

---

## Agent UI CLI — `0.4.0`

**Goal:** one fast-installing command, common across projects, that lets any agent or dev manage the entire client side + design system on `@vllnt/ui`. Four pillars: **single entry · extremely fast install · common across projects · covers the whole client side**.

Harness-agnostic CLI. **Package shape is an open decision** (see *Open architecture decisions* below): the brand-faithful `npx @vllnt/ui@latest <cmd>` (bin on `@vllnt/ui`) drags the heavy component lib onto the install path and fights the fast-install pillar — the leading alternative is a tiny zero-dep `@vllnt/cli` that *reads* `@vllnt/ui` data without depending on it (`@vllnt/ui/cli` as a subpath is not a valid npm spec either way). Ships the @vllnt design-system **agent contract** (rules + tokens + component index) and a **standardized client-side gate** that runs identically locally and in CI. Orchestrates wrappable OSS tools (eslint / stylelint / knip / size-limit / playwright); hand-writes the checks no OSS tool covers — chief among them **design-token correctness + coherence**: `tokens.json` is the single source of truth, and every CSS var, theme preset, and Tailwind value must derive from it without drift.

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

Issues to be filed (repo enforces issue-linked PRs). The L4 browser-audit tier may roll to a later `0.4.x` / `0.5.0` under scope pressure.

---

## AI Elements parity — `0.4.0`

We ship ~16 of shadcn **AI Elements** ([elements.ai-sdk.dev](https://elements.ai-sdk.dev), ~48 components across Chatbot / Code / Voice / Workflow / Utility). Already covered: `AIMessageBubble`, `PromptInput` + `AIChatInput`, `Reasoning`, `ChainOfThought`, `AIToolCallDisplay`, `AIArtifact`, `AISourceCitation`, `CodeBlock`, `ModelSelector` — plus ours they lack (`ModelComparison`, `AIStreamingText`, `AISidebar`, `PromptTemplates`, `ChatDockSection`). The gaps below complete a standard chat/agent loop; voice + IDE-code surfaces are deferred (narrow ROI for a general design system).

**Tier 1 — chat/agent core (target `0.4.0`)**

| Component | Type | Fills (shadcn name) |
|---|---|---|
| `Context` | Feature | token / context-window usage meter (Context) |
| `Task` | Feature | atomic work-item card — we have the chain, not the unit (Task) |
| `Plan` | Feature | structured plan with an approve step (Plan) |
| `Confirmation` | Feature | approve-before-action gate; wraps `AlertDialog` (Confirmation) |
| `Attachments` | Feature | file / media upload in the prompt composer (Attachments) |
| `MessageActions` | Feature | per-message action bar — copy / retry / edit (Actions) |
| `MessageBranch` | Feature | message version switcher (Branch) |

**Tier 2 — agent session UX (stretch)**

| Component | Type | Fills (shadcn name) |
|---|---|---|
| `Checkpoint` | Feature | save / restore conversation state (Checkpoint) |
| `RequestQueue` | Feature | pending tasks / requests list (Queue) |
| `OpenInChat` | Feature | launch content into a conversation (Open In Chat) |
| `AIImage` | Feature | AI-generated image with loading / error states (Image) |

**Deferred — narrow ROI, revisit after `0.4.0`**

- IDE code surfaces (9): Commit, EnvironmentVariables, FileTree, PackageInfo, SchemaDisplay, Snippet, StackTrace, Terminal, TestResults
- Voice (6): AudioPlayer, MicSelector, Persona, SpeechInput, Transcription, VoiceSelector
- Workflow canvas (5): Canvas, Connection, Controls, Node, Panel — verify against existing `@xyflow`-based components (`EdgeLabel`, `FloatingToolbar`, the canvas/spatial family) before filing

Issues to be filed (repo enforces issue-linked PRs). Tier 1 = 7 components; Tier 2 = 4 (stretch). Minor bump per versioning policy (new components).

---

## Cut criteria for `0.3.0`

Ship only when **all** of the following hold:

- [ ] All 85 canary components present in `registry.json`, each with story + test.
- [ ] Phase 0–7 issues closed (29 issues).
- [ ] `react-doctor` reports **0 errors**, score **≥ 75** (full ≥ 90 in `0.4.0`).
- [ ] Lighthouse Performance + SEO + Accessibility **≥ 95** on `/`, `/components`, `/components/[slug]` (sample 3), `/design`, `/changelog`.
- [ ] `/llms.txt` validates against [llmstxt.org](https://llmstxt.org).
- [ ] MCP server at `ui.vllnt.ai/mcp` smoke-tested in Claude Desktop end-to-end.
- [ ] Google Rich Results Test: zero errors on `/components/[slug]` and `/design`.
- [ ] CHANGELOG entry written, `/releases` shows `0.3.0` with notes.
- [ ] `package.json` versions bumped:
  - [x] `packages/ui` → `0.3.0` (drives `0.3.0-canary.<sha>` on each merge to main)
  - [x] `apps/registry` → `0.3.0`
  - [ ] root → `0.3.0` (optional — private monorepo root, left at `0.1.0`)
- [ ] At release, flip the registry's shadcn install target off the last published version:
  - [ ] `PUBLISHED_VERSION` in `apps/registry/scripts/inline-component-source.ts` → `0.3.0` (stamps `@vllnt/ui@^0.3.0` + item/registry `version` into `registry.json`; kept at `0.2.1` during canary so `npx shadcn add` resolves to a published release)
- [ ] Every closed issue is `Type`-tagged.
- [ ] PR template in place (linked issue requirement enforced — already shipped via #152).

---

## Out of scope for `0.3.0`

- React Compiler adoption.
- Right-to-left language support.
- Backend services for `/report` or `/request-component` (we use prefilled GitHub URLs — no backend).
- New design tokens beyond DESIGN.md baseline.
- Versioned docs (deferred until breaking changes appear).
- Component analytics (privacy-respecting telemetry — separate decision).

---

## Versioning policy

- **Patch** (`0.3.x`) — bug fixes, content updates, non-breaking docs.
- **Minor** (`0.x.0`) — new components, new public APIs, new sites surfaces.
- **Major** (`x.0.0`) — breaking API changes (`@vllnt/ui` exports), removed components, registry schema changes.

Semver discipline starts hard at `1.0.0`. Until then, `0.x.0` may include breaking changes documented in CHANGELOG.

---

## Tracking

- Epic: [#252](https://github.com/vllnt/ui/issues/252) (SEO + AI-agent surface)
- Epic: [#279](https://github.com/vllnt/ui/issues/279) (react-doctor sweep)
- Open issues: `gh issue list -R vllnt/ui --state open`
- Score: `pnpm doctor:score` (after #278 lands)
