# Roadmap — 0.3.0

> Status: **planning** · Previous release: `v0.2.1` · Current canary: `0.3.0-canary.<sha>` (+85 components) · Tracking: [milestone TBD](https://github.com/vllnt/ui/milestones)

## TLDR

`0.3.0` is the **agent-first surface** release. Three themes:

1. **+85 new components** already in canary, finally published.
2. **Discoverability** — full SEO + AI-agent surface (`/llms.txt`, `/mcp`, sitemap, JSON-LD, manifest, structured data on every page).
3. **Codebase health gate** — `react-doctor` CI + tooling so we ship and stay green.

50 open issues, organized below in shipping order. Items marked **(stretch)** are nice-to-have but can roll to `0.4.0` if scope pressure.

---

## Components — canary → release (+85)

Counts taken from `registry.json` at `v0.2.1` (140) vs `HEAD` (225).

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
| 7 | [#234](https://github.com/vllnt/ui/issues/234) | Feature | `app/sitemap.ts` (all routes + 225 components) |
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
