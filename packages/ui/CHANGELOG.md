# Changelog

All notable changes to `@vllnt/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

> Target version: **`0.3.0`** — canary only; not yet published. See [ROADMAP.md](../../ROADMAP.md) for shipping criteria.

### Added

- **Release intelligence surface** — `/changelog`, `/releases`, `/rss.xml`, and `/atom.xml` expose one changelog source through HTML, GitHub release cards, and feed readers. `/docs/changelog` redirects to `/changelog`.
- **Hooks + utility primitives** — `CopyButton` (+ `useCopyToClipboard` hook), `Banner` + `BannerAction`, `Kbd`, `EmptyState`, `DocumentSiblingNav`.
- **Pricing + identity cards** — `PricingTable` + `PricingPlan`, `HistoricalFigureCard`, `CivilizationCard` (+ `CivilizationComparison`).
- **Newsletter** — `NewsletterSignup` (state-machine driven submit flow).
- **AI compound families** — `ModelComparison` (+ `Column`, `Meta`, `Vote`), `PromptTemplates`, `AgentActivity`, `AISidebar`, `AIArtifact`.
- **Era / financial** — `EraComparison`, `TransactionList`.
- **Forms** — `Form`, `MultiSelect`, `SegmentedControl`, `TagsInput`, `AutoReload`.
- **Educational** — `KnowledgeCheck` (inline question runner).
- **Charts + timelines** — `GanttChart`, `ParallelTimeline`, `Timeline` + `TimelineItem`, `HistoricTimeline`, `InteractiveTimeline`, `ChronologicalTimeline`, `TreeView`.
- **Document + reading** — `PrimarySourceViewer` compound family.
- **Maps + geography** — `Map2D`, `ChoroplethMap`, `RouteMap`, `HeatMapOverlay`, `GeographyQuizMap`, `MapTimeline`, `StoryMap`, `Globe3D`.
- **Canvas foundation** — `CanvasShell`, `CanvasView`, `InfinitePlane`, `ViewportBookmarks`, `WorldBreadcrumbs`, `TopBar`, `LeftRail`, `RightDock`, `ZoomHud`, `MiniMapPanel`, `WorkspaceSwitcher`.
- **Canvas selection + manipulation** — `SelectionHalo`, `SnapGuides`, `FloatingToolbar`, `MultiSelectLasso`, `FollowMode`, `HandoffBeacon`.
- **Canvas spatial objects** — `ObjectCard`, `ObjectHandle`, `AnchorPort`, `ConnectorEdge`, `EdgeLabel`, `GroupHull`.
- **Canvas collaboration primitives** — `LiveCursor`, `CommentPin`, `PresenceSyncIndicator`, `PresenceStack`, `SelectionPresence`, `ThreadBubble`.
- **Inspector + dock panels** — `PropertySection`, `ObjectInspector`, `RelationshipInspector`, `RuntimeOverviewPanel`, `RoutingAssignmentPanel`, `PolicyDeliveryPanel`.
- **Runtime overlays** — `AlertPulse`, `ThresholdRing`, `StickyMetric`, `HeatOverlay`, `StateBadgeOverlay`, `MetricCluster`, `JarvisDock`, `ContextLens`.
- **Time navigation** — `TimelineScrubber`, `PlaybackGhost`, `BottomActivityStrip`, `RunTimeline`.
- Total component count: **225** (up from 140).

- **A11y heading-level override** — every title-bearing component (`ProfileSection`, `FAQ`, `Slideshow`, `WorldClockBar`, `TableOfContentsPanel`, `TableOfContents`, `KeyboardShortcutsHelp`, `Watchlist`, `OrderBook`, `HorizontalScrollRow`, `MarketTreemap`, `ActivityHeatmap`, `Glossary`, `StatusBoard`, `CodePlayground`, `Comparison`, `Quiz`, `Exercise`, `ShareSection`, `CompletionDialog`, `Checklist`, `LearningObjectives`, `CandlestickChart`, `StepByStep`) accepts an `as` prop (`"h1"`–`"h6"`); multi-title components (`ContentIntro`, `TutorialComplete`) expose `titleAs` + `tocLabelAs` / `sectionLabelAs`. Defaults preserve existing heading tags. `HeadingTag` is re-exported from `@vllnt/ui`.

### Changed

- Registry installs use a **hybrid CLI strategy** — leaf component source is inlined, sibling registry items resolve via `@vllnt/ui` to keep installs minimal and dedupe shared primitives.

### Notes

- `ROADMAP.md` added at repo root tracking 50 open issues across 8 phases gating the `0.3.0` cut.
- `0.3.0` requires the codebase-health gate (`react-doctor` CI + 0 errors), the agent-first surface (`/llms.txt`, `/mcp`, sitemap, JSON-LD), and the rebuilt landing page before shipping.

## [0.2.1] - 2026-04-21

### Fixed

- **Public API:** `ProgressCard` now re-exported from `@vllnt/ui` — it shipped in `0.2.0`'s tarball but was missing from the barrel, so `import { ProgressCard } from "@vllnt/ui"` resolved to `undefined`.

### Docs

- Correct casing for the AI family (`AIChatInput`, `AIMessageBubble`, `AISourceCitation`, `AIStreamingText`, `AIToolCallDisplay`) and `SocialFAB` across README, package README, CHANGELOG, and `llms-full.txt`.

## [0.2.0] - 2026-04-21

### Added

- **AI family** — `AIChatInput`, `AIMessageBubble`, `AISourceCitation`, `AIStreamingText`, `AIToolCallDisplay`, `ThinkingBlock`, `ModelSelector`.
- **Financial family** — `CandlestickChart`, `MarketTreemap`, `OrderBook`, `TickerTape`, `SparklineGrid`, `WalletCard`, `Watchlist`.
- **Ops / Status family** — `StatusBoard`, `StatusIndicator`, `LiveFeed`, `WorldClockBar`, `SeverityBadge`, `RoleBadge`, `ScopeSelector`.
- **Billing & Plans family** — `SubscriptionCard`, `PlanBadge`, `CreditBadge`, `UsageBreakdown`.
- **Animation family** — `AnimatedText`, `BorderBeam`, `Marquee`, `NumberTicker`, and a standalone spinner library exported via `Spinner`.
- **Educational family** — `Flashcard`, `Stepper`, `Tour`, `Annotation`, `CompletionDialog`, `TruncatedText`, `TableOfContentsPanel`.
- **Form additions** — `DatePicker`, `FileUpload`, `NumberInput`, `PasswordInput`, `InlineInput`, `Combobox`, `Rating`.
- **Data / metric additions** — `DataTable`, `DataList`, `StatCard`, `MetricGauge`, `ActivityHeatmap`, `ActivityLog`.
- **App shell additions** — `CategoryFilter`, `FilterBar`, `CookieConsent`, `Slideshow`, `CountdownTimer`, `AvatarGroup`, `FloatingActionButton`, `SocialFab`, `KeyboardShortcutsHelp`, `ShareDialog`, `HorizontalScrollRow`, `ViewSwitcher`.
- Total component count: **144** (up from 93).
- Full Storybook integration with E2E smoke tests in CI.
- OG image generation for every registry page.
- Signed provenance attestations on every published artifact (sigstore).

### Changed

- Documentation domain moved to `ui.vllnt.ai` / `storybook.vllnt.ai`.
- Default package registry is the public npm registry (no longer GitHub Packages).
- README component tables expanded to cover all 144 components organized by family.

### Fixed

- Publish workflow now uses `npx --yes npm@latest publish` so OIDC trusted publishing survives GitHub runners that ship pre-11.5.1 npm.

## [0.1.11] - 2026-04 *(last canary-era release)*

### Fixed

- Re-extract tarball path from `pnpm pack` output for publish step.

## [0.1.10]

### Changed

- Switched to `pnpm pack` + `npm publish` flow to support `publishConfig` with OIDC auth.

## [0.1.9]

### Fixed

- Use `pnpm publish` and repair release creation step in CI.

## [0.1.8]

### Fixed

- Annotated tags + `--notes-file` for release creation.

## [0.1.7]

### Added

- `HorizontalScrollRow`, `ViewSwitcher`, and `useHorizontalScroll` hook.

### Fixed

- `Comparison`: defensive prop validation to prevent runtime crash on malformed input.

## [0.1.6]

### Fixed

- Bundle-free build to preserve per-file `"use client"` directives in published chunks.

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
