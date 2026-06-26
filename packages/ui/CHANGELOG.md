# Changelog

All notable changes to `@vllnt/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Nothing yet._

## [0.3.0] - 2026-06-26

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
- **Form primitives (18)** — `ButtonGroup`, `InputGroup`, `Field`, `Fieldset`, `Item`, `ColorPicker`, `CheckboxGroup`, `NativeSelect`, `ListBox`, `SearchField`, `TextField`, `PhoneInput`, `TimePicker`, `TimeField`, `DateField`, `DateRangePicker`, `RangeCalendar`, `TagGroup`.
- **Charts / dataviz (5)** — `PieChart`, `RadarChart`, `GaugeChart`, `SankeyChart`, `ContributionGraph` (joining the existing `BarChart` / `LineChart` / `AreaChart`).
- **AI primitives (3)** — `Reasoning`, `ChainOfThought`, `PromptInput`.
- **Core primitives (7)** — `Typography`, `Link`, `Toolbar`, `Meter`, `QrCode`, `Grid`, `Panel`.
- **Motion / effects (37)** — `BentoGrid`, `Sparkles`, `Typewriter`, `AnimatedList`, `Dock`, `MagneticButton`, `TextShimmer`, `AnimatedBeam`, `AnimatedTabs`, `ScrollProgress`, `ShimmerButton`, `ShimmerText`, `AnimatedGridPattern`, `AnimatedTestimonials`, `AnimatedTooltip`, `BlurReveal`, `CardFlip`, `Cursor`, `DotPattern`, `ExpandableCards`, `FloatingNavbar`, `GlassCard`, `GlassProgress`, `LiquidGlass`, `Magnetic`, `Meteors`, `Particles`, `ProgressiveBlur`, `RevealText`, `ScrambleText`, `ShineBorder`, `ShinyButton`, `SpinningText`, `SpotlightCard`, `TextAnimate`, `TextReveal`, `TiltCard`.
- Total component count: **309** (up from 140).

- **OKLCH theming system** — color tokens migrated to the OKLCH color space, with 13 runtime theme presets (`default`, `matrix`, `dracula`, `synthwave`, `tron`, `cyberpunk`, `nord`, `claude`, `chatgpt`, `gemini`, `dusk`, `cyberlime`, `aura`). New public theme exports from `@vllnt/ui`: `THEME_PRESETS`, `DEFAULT_THEME_PRESET`, `CUSTOM_THEME_NAME`, `isThemePresetName`, the `ThemePreset` and `ThemePresetName` types, plus the `useThemePreset` hook (with `UseThemePresetResult`), `setThemePreset`, and `setCustomTheme` for runtime preset switching and user-supplied custom themes.

- **A11y heading-level override** — every title-bearing component (`ProfileSection`, `FAQ`, `Slideshow`, `WorldClockBar`, `TableOfContentsPanel`, `TableOfContents`, `KeyboardShortcutsHelp`, `Watchlist`, `OrderBook`, `HorizontalScrollRow`, `MarketTreemap`, `ActivityHeatmap`, `Glossary`, `StatusBoard`, `CodePlayground`, `Comparison`, `Quiz`, `Exercise`, `ShareSection`, `CompletionDialog`, `Checklist`, `LearningObjectives`, `CandlestickChart`, `StepByStep`) accepts an `as` prop (`"h1"`–`"h6"`); multi-title components (`ContentIntro`, `TutorialComplete`) expose `titleAs` + `tocLabelAs` / `sectionLabelAs`. Defaults preserve existing heading tags. `HeadingTag` is re-exported from `@vllnt/ui`.

### Changed

- **BREAKING — React 19 required.** The peer dependency moved to `react` / `react-dom` `>=19`; **React 18 is no longer supported**. Components migrated from `React.forwardRef` to the React 19 ref-as-prop pattern, and `useContext` → `use()`. React-18 consumers must upgrade to React 19.
- **Internal quality sweep** — cleared the react-doctor backlog: `no-react19-deprecated-apis` 456 → 0, plus state/effect warnings (`useEffectEvent` for effect-captured handlers, derived-state, cascading `setState`) and structural warnings (giant-component splits, render-in-render, polymorphic children, passive listeners).
- **Shared internals** — extracted reusable hooks/utilities (reference-counted body-scroll-lock that fixes a multi-overlay unlock bug, escape-key, live-date, cached `Intl` formatters, clipboard migration) and a Zod parse seam for the registry shape.
- Registry installs use a **hybrid CLI strategy** — leaf component source is inlined, sibling registry items resolve via `@vllnt/ui` to keep installs minimal and dedupe shared primitives.

### Fixed

- **Docs sidebar dropped components** — the registry category union omitted four categories (`ai`, `billing`, `data-display`, `educational`), silently hiding ~32 components from the docs sidebar; all now render, with a structural fallback so a missing category can no longer regress.
- **Theme-adaptive chart colors** — `CandlestickChart` and `SparklineGrid` series colors now follow the active theme and dark mode instead of hardcoded values.

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

[0.3.0]: https://github.com/vllnt/ui/releases/tag/v0.3.0
[0.2.1]: https://github.com/vllnt/ui/releases/tag/v0.2.1
[0.2.0]: https://github.com/vllnt/ui/releases/tag/v0.2.0
[0.1.11]: https://github.com/vllnt/ui/releases/tag/v0.1.11
[0.1.10]: https://github.com/vllnt/ui/releases/tag/v0.1.10
[0.1.9]: https://github.com/vllnt/ui/releases/tag/v0.1.9
[0.1.8]: https://github.com/vllnt/ui/releases/tag/v0.1.8
[0.1.2]: https://github.com/vllnt/ui/releases/tag/v0.1.2
