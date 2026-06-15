# Changelog

All notable changes to `@vllnt/ui` and the public registry site are documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Release automation can regenerate this file from Conventional Commits with
`git-cliff`.

## [Unreleased]

> Target version: **`0.3.0`** - shipping as `0.3.0-canary.<sha>` on the npm
> `canary` tag on every merge to main. The stable `latest` release is gated on
> the [ROADMAP.md](./ROADMAP.md) shipping criteria and is not yet published.

### Added

- **Release intelligence surface** - `/changelog`, `/releases`, `/rss.xml`, and
  `/atom.xml` expose one changelog source through HTML, GitHub release cards, and
  feed readers. `/docs/changelog` redirects to `/changelog`.
- **Agent-first surface** - `/robots.txt` allowing 11 AI crawlers,
  `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, JSON-LD on every page, PWA
  manifest, breadcrumbs, custom 404, canonical URLs per route, expanded root
  metadata (keywords, robots tuning, OG/Twitter site-level config).
- **Codebase health gate** - `react-doctor` CI workflow with PR annotations and
  score artifact, `pnpm doctor*` script suite, type-enforcement workflow on every
  issue.
- **Registry-item richness** - every `/r/<name>.json` now carries `version`,
  `stability`, optional `a11y` schema, optional inline `examples`. Top-level
  `/r/registry.json` carries `version` and `generatedAt`.
- **Site UX** - Header GitHub link, `/request-component` and `/report` pages with
  prefilled-GitHub-issue forms, per-component "Report a bug" button.
- **Brand** - `DESIGN.md` at repo root with the canonical brand and design
  guideline (color tokens, typography, motion, anti-patterns).
- **Agent skill** - `skills/vllnt-ui/` teaches AI coding harnesses how to consume
  `@vllnt/ui` and follow the design system. It acts as a table of contents:
  stable rules inline, with the live component set and deep docs fetched from
  `/r/registry.json`, `/llms.txt`, `/llms-full.txt`, and `DESIGN.md`.
- **Hooks + utility primitives** - `CopyButton` with `useCopyToClipboard`,
  `Banner` with `BannerAction`, `Kbd`, `EmptyState`, `DocumentSiblingNav`.
- **Pricing + identity cards** - `PricingTable`, `PricingPlan`,
  `HistoricalFigureCard`, `CivilizationCard`, and `CivilizationComparison`.
- **Newsletter** - `NewsletterSignup` with a state-machine driven submit flow.
- **AI compound families** - `ModelComparison`, `PromptTemplates`,
  `AgentActivity`, `AISidebar`, and `AIArtifact`.
- **Era / financial** - `EraComparison` and `TransactionList`.
- **Forms** - `Form`, `MultiSelect`, `SegmentedControl`, `TagsInput`, and
  `AutoReload`.
- **Educational** - `KnowledgeCheck` inline question runner.
- **Charts + timelines** - `GanttChart`, `ParallelTimeline`, `Timeline`,
  `TimelineItem`, `HistoricTimeline`, `InteractiveTimeline`,
  `ChronologicalTimeline`, and `TreeView`.
- **Document + reading** - `PrimarySourceViewer` compound family.
- **Maps + geography** - `Map2D`, `ChoroplethMap`, `RouteMap`, `HeatMapOverlay`,
  `GeographyQuizMap`, `MapTimeline`, `StoryMap`, and `Globe3D`.
- **Canvas foundation** - `CanvasShell`, `CanvasView`, `InfinitePlane`,
  `ViewportBookmarks`, `WorldBreadcrumbs`, `TopBar`, `LeftRail`, `RightDock`,
  `ZoomHud`, `MiniMapPanel`, and `WorkspaceSwitcher`.
- **Canvas selection + manipulation** - `SelectionHalo`, `SnapGuides`,
  `FloatingToolbar`, `MultiSelectLasso`, `FollowMode`, and `HandoffBeacon`.
- **Canvas spatial objects** - `ObjectCard`, `ObjectHandle`, `AnchorPort`,
  `ConnectorEdge`, `EdgeLabel`, and `GroupHull`.
- **Canvas collaboration primitives** - `LiveCursor`, `CommentPin`,
  `PresenceSyncIndicator`, `PresenceStack`, `SelectionPresence`, and
  `ThreadBubble`.
- **Inspector + dock panels** - `PropertySection`, `ObjectInspector`,
  `RelationshipInspector`, `RuntimeOverviewPanel`, `RoutingAssignmentPanel`, and
  `PolicyDeliveryPanel`.
- **Runtime overlays** - `AlertPulse`, `ThresholdRing`, `StickyMetric`,
  `HeatOverlay`, `StateBadgeOverlay`, `MetricCluster`, `JarvisDock`, and
  `ContextLens`.
- **Time navigation** - `TimelineScrubber`, `PlaybackGhost`,
  `BottomActivityStrip`, and `RunTimeline`.
- Total component count: **225** (up from 140).

### Changed

- Registry installs use a **hybrid CLI strategy** - leaf component source is
  inlined, sibling registry items resolve via `@vllnt/ui` to keep installs
  minimal and dedupe shared primitives.

### Notes

- `ROADMAP.md` tracks the open work gating the `0.3.0` cut.
- `0.3.0` requires the codebase-health gate (`react-doctor` CI + 0 errors), the
  agent-first surface (`/llms.txt`, `/mcp`, sitemap, JSON-LD), and the rebuilt
  landing page before shipping.

## [0.2.1] - 2026-04-21

### Fixed

- **Public API:** `ProgressCard` now re-exported from `@vllnt/ui` - it shipped
  in `0.2.0`'s tarball but was missing from the barrel, so
  `import { ProgressCard } from "@vllnt/ui"` resolved to `undefined`.

### Docs

- Correct casing for the AI family (`AIChatInput`, `AIMessageBubble`,
  `AISourceCitation`, `AIStreamingText`, `AIToolCallDisplay`) and `SocialFAB`
  across README, package README, CHANGELOG, and `llms-full.txt`.

## [0.2.0] - 2026-04-21

### Added

- **AI family** - `AIChatInput`, `AIMessageBubble`, `AISourceCitation`,
  `AIStreamingText`, `AIToolCallDisplay`, `ThinkingBlock`, `ModelSelector`.
- **Financial family** - `CandlestickChart`, `MarketTreemap`, `OrderBook`,
  `TickerTape`, `SparklineGrid`, `WalletCard`, `Watchlist`.
- **Ops / Status family** - `StatusBoard`, `StatusIndicator`, `LiveFeed`,
  `WorldClockBar`, `SeverityBadge`, `RoleBadge`, `ScopeSelector`.
- **Billing & Plans family** - `SubscriptionCard`, `PlanBadge`, `CreditBadge`,
  `UsageBreakdown`.
- **Animation family** - `AnimatedText`, `BorderBeam`, `Marquee`,
  `NumberTicker`, and a standalone spinner library exported via `Spinner`.
- **Educational family** - `Flashcard`, `Stepper`, `Tour`, `Annotation`,
  `CompletionDialog`, `TruncatedText`, `TableOfContentsPanel`.
- **Form additions** - `DatePicker`, `FileUpload`, `NumberInput`,
  `PasswordInput`, `InlineInput`, `Combobox`, `Rating`.
- **Data / metric additions** - `DataTable`, `DataList`, `StatCard`,
  `MetricGauge`, `ActivityHeatmap`, `ActivityLog`.
- **App shell additions** - `CategoryFilter`, `FilterBar`, `CookieConsent`,
  `Slideshow`, `CountdownTimer`, `AvatarGroup`, `FloatingActionButton`,
  `SocialFab`, `KeyboardShortcutsHelp`, `ShareDialog`, `HorizontalScrollRow`,
  `ViewSwitcher`.
- Total component count: **144** (up from 93).
- Full Storybook integration with E2E smoke tests in CI.
- OG image generation for every registry page.
- Signed provenance attestations on every published artifact (sigstore).

### Changed

- Documentation domain moved to `ui.vllnt.ai` / `storybook.vllnt.ai`.
- Default package registry is the public npm registry (no longer GitHub
  Packages).
- README component tables expanded to cover all 144 components organized by
  family.

### Fixed

- Publish workflow now uses `npx --yes npm@latest publish` so OIDC trusted
  publishing survives GitHub runners that ship pre-11.5.1 npm.

## [0.1.11] - 2026-04

### Fixed

- Re-extract tarball path from `pnpm pack` output for publish step.

## [0.1.10]

### Changed

- Switched to `pnpm pack` and `npm publish` flow to support `publishConfig` with
  OIDC auth.

## [0.1.9]

### Fixed

- Use `pnpm publish` and repair release creation step in CI.

## [0.1.8]

### Fixed

- Annotated tags and `--notes-file` for release creation.

## [0.1.7]

### Added

- `HorizontalScrollRow`, `ViewSwitcher`, and `useHorizontalScroll` hook.

### Fixed

- `Comparison`: defensive prop validation to prevent runtime crash on malformed
  input.

## [0.1.6]

### Fixed

- Bundle-free build to preserve per-file `"use client"` directives in published
  chunks.

## [0.1.5]

### Fixed

- Add `"use client"` to all dist JS including `index.js`.

## [0.1.4]

### Fixed

- Exclude `index.js` from `"use client"` banner.

## [0.1.3]

### Fixed

- Add `"use client"` directive to published dist chunks.

## [0.1.2]

### Added

- Initial public publish to the public npm registry.

[0.2.1]: https://github.com/vllnt/ui/releases/tag/v0.2.1
[0.2.0]: https://github.com/vllnt/ui/releases/tag/v0.2.0
[0.1.11]: https://github.com/vllnt/ui/releases/tag/v0.1.11
[0.1.10]: https://github.com/vllnt/ui/releases/tag/v0.1.10
[0.1.9]: https://github.com/vllnt/ui/releases/tag/v0.1.9
[0.1.8]: https://github.com/vllnt/ui/releases/tag/v0.1.8
[0.1.2]: https://github.com/vllnt/ui/releases/tag/v0.1.2
