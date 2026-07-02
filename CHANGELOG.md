# Changelog

All notable changes to `@vllnt/ui` and the public registry site are documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Release automation can regenerate this file from Conventional Commits with
`git-cliff`.

## [Unreleased]

### Added

- **Typography foundation primitives** — `Text`, `Heading`, `Display`, and
  `Prose` in the `core` family. Font family (`--font-sans` + a new
  `--font-display`), heading/display weight (`--font-weight-heading`,
  `--font-weight-display`), and the type scale (`--font-size-*`) are
  theme-overridable design tokens, so a brand restyles headings and body via
  token overrides alone — no library edits. `Heading` also takes a `size` prop
  to decouple visual scale from the semantic `level`. (#465)
- Total component count: **313** (up from 309).

### Changed

- `HeadingProps` exported from `@vllnt/ui` now refers to the `Heading` primitive
  (adds optional `level`/`size`/`ref`); the plain heading-element alias is
  available as `TypographyHeadingProps`. (#465)

## [0.3.0] - 2026-06-26

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
- **Form primitives (18)** - `ButtonGroup`, `InputGroup`, `Field`, `Fieldset`,
  `Item`, `ColorPicker`, `CheckboxGroup`, `NativeSelect`, `ListBox`,
  `SearchField`, `TextField`, `PhoneInput`, `TimePicker`, `TimeField`,
  `DateField`, `DateRangePicker`, `RangeCalendar`, and `TagGroup`.
- **Charts / dataviz (5)** - `PieChart`, `RadarChart`, `GaugeChart`,
  `SankeyChart`, and `ContributionGraph` (joining the existing `BarChart` /
  `LineChart` / `AreaChart`).
- **AI primitives (3)** - `Reasoning`, `ChainOfThought`, and `PromptInput`.
- **Core primitives (7)** - `Typography`, `Link`, `Toolbar`, `Meter`, `QrCode`,
  `Grid`, and `Panel`.
- **Motion / effects (37)** - `BentoGrid`, `Sparkles`, `Typewriter`,
  `AnimatedList`, `Dock`, `MagneticButton`, `TextShimmer`, `AnimatedBeam`,
  `AnimatedTabs`, `ScrollProgress`, `ShimmerButton`, `ShimmerText`,
  `AnimatedGridPattern`, `AnimatedTestimonials`, `AnimatedTooltip`, `BlurReveal`,
  `CardFlip`, `Cursor`, `DotPattern`, `ExpandableCards`, `FloatingNavbar`,
  `GlassCard`, `GlassProgress`, `LiquidGlass`, `Magnetic`, `Meteors`,
  `Particles`, `ProgressiveBlur`, `RevealText`, `ScrambleText`, `ShineBorder`,
  `ShinyButton`, `SpinningText`, `SpotlightCard`, `TextAnimate`, `TextReveal`,
  and `TiltCard`.
- Total component count: **309** (up from 140).
- **OKLCH theming system** - color tokens migrated to the OKLCH color space, with
  13 runtime theme presets, a `/themes` web theme editor route, and a `/r/themes`
  endpoint. New public theme exports from `@vllnt/ui` (`THEME_PRESETS`,
  `DEFAULT_THEME_PRESET`, `CUSTOM_THEME_NAME`, `ThemePreset` / `ThemePresetName`,
  `useThemePreset`, `setThemePreset`, `setCustomTheme`) drive runtime preset
  switching and user-supplied custom themes.
- **Registry namespacing** - `registry.json` is published under the `@vllnt`
  namespace for the shadcn registry index, so items install under the `@vllnt`
  prefix.
- **Localized routes** - English and French docs via `next-intl`, served under
  `/en` and `/fr` locale prefixes.
- **Starter templates gallery** - `/templates` showcases ready-to-use starter
  templates.
- **Component playground** - a per-component `playground` route renders an
  interactive playground with an embedded Storybook view.
- **Static docs search** - `Pagefind` powers fully static, client-side search
  across the docs.
- **MCP server** - `/mcp` exposes a Model Context Protocol JSON-RPC endpoint
  (`tools/list`, `tools/call`) so MCP clients can discover and invoke registry
  tools.
- **Agent / SEO surface** - comparison pages under `/vs` (shadcn, vercel-ai-sdk,
  assistant-ui), `/design.txt` and `/r/design.json` for the design system,
  `/api/badge` for status badges, and `/api/oembed` for oEmbed embeds.

### Changed

- **BREAKING - React 19 required.** The peer dependency moved to `react` /
  `react-dom` `>=19`; **React 18 is no longer supported**. Components migrated
  from `React.forwardRef` to the React 19 ref-as-prop pattern, and `useContext`
  → `use()`. React-18 consumers must upgrade to React 19.
- **Internal quality sweep** - cleared the react-doctor backlog:
  `no-react19-deprecated-apis` 456 → 0, plus state/effect warnings
  (`useEffectEvent` for effect-captured handlers, derived-state, cascading
  `setState`) and structural warnings (giant-component splits, render-in-render,
  polymorphic children, passive listeners).
- **Shared internals** - extracted reusable hooks/utilities (reference-counted
  body-scroll-lock fixing a multi-overlay unlock bug, escape-key, live-date,
  cached `Intl` formatters, clipboard migration) and a Zod parse seam for the
  registry shape.
- Registry installs use a **hybrid CLI strategy** - leaf component source is
  inlined, sibling registry items resolve via `@vllnt/ui` to keep installs
  minimal and dedupe shared primitives.

### Fixed

- **Docs sidebar dropped components** - the registry category union omitted four
  categories (`ai`, `billing`, `data-display`, `educational`), silently hiding
  ~32 components from the docs sidebar; all now render, with a structural
  fallback so a missing category can no longer regress.
- **Theme-adaptive chart colors** - `CandlestickChart` and `SparklineGrid`
  series colors now follow the active theme and dark mode instead of hardcoded
  values.

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

[0.3.0]: https://github.com/vllnt/ui/releases/tag/v0.3.0
[0.2.1]: https://github.com/vllnt/ui/releases/tag/v0.2.1
[0.2.0]: https://github.com/vllnt/ui/releases/tag/v0.2.0
[0.1.11]: https://github.com/vllnt/ui/releases/tag/v0.1.11
[0.1.10]: https://github.com/vllnt/ui/releases/tag/v0.1.10
[0.1.9]: https://github.com/vllnt/ui/releases/tag/v0.1.9
[0.1.8]: https://github.com/vllnt/ui/releases/tag/v0.1.8
[0.1.2]: https://github.com/vllnt/ui/releases/tag/v0.1.2
