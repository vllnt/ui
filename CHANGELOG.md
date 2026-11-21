# Changelog

All notable changes to `@vllnt/ui` and the public registry site are documented
in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Release automation can regenerate this file from Conventional Commits with
`git-cliff`.

## [Unreleased]

## [0.4.0] - 2026-11-20

### Added

- Total component count: **321** (up from 309).
- **Dialog overlay** - `DialogContent` takes `overlay="scrim"` (default, the
  dimmed veil as before) or `overlay="none"` (no veil; the dialog stays modal).
  (#601)
- **Design tokens** - `color.badge-label.*`, `brand.status.*`, `radius.control`
  (6 px), `radius.surface` (8 px), `size.target.min` (44 px), `size.control-xs`
  (32 px, and 44 px under a coarse pointer), `opacity.grain` and
  `opacity.contact`. Only the radius, size and opacity tokens have CSS
  variables. (#602)
- **Lock 2 tokens** - `shadow.raised`, `shadow.overlay` and `shadow.floating`
  (`--shadow-raised`, `--shadow-overlay`, `--shadow-floating`, one list per
  mode), `spacing.page-gutter`, `spacing.page-gutter-tablet` and
  `spacing.page-gutter-desktop` (20, 48 and 96 px, as `--spacing-page-gutter*`),
  `size.page-max` (1440 px) and `size.measure-narrow` (480 px) as
  `--size-page-max` and `--size-measure-narrow`, and a `spacing.24` step
  (96 px, no CSS variable). (#614)
- **Badge v1.3 props** - `tone`, `size`, `border`, `dot` and `variant="soft"`.
  A status tone colours a dot, not the words. Existing props and defaults
  render as before. (#610)
- **ProgressBar `blocks`** - draws ten blocks and fills one per whole 10% of
  `value / max`; `aria-valuenow` stays exact. (#611)
- **Lint rule A12** (`vllnt/a12-no-status-text-colour`) - flags a status colour
  used as text colour in component code. 56 existing files are allowlisted and
  burn down in #604. (#607)
- **`warning` tone** - `AlertPulse` (`severity`), `BottomActivityStrip`,
  `HeatOverlay`, `MetricCluster`, `RuntimeOverviewPanel`, `StickyMetric`,
  `ThresholdRing` and `TimelineScrubber` (`tone`) accept `warning`, the name the
  design library uses. (#616)

- **Props types exported from the barrel** - `BreadcrumbProps`,
  `CommandDialogProps`, `SheetContentProps`, `CarouselProps`, `CodeBlockProps`,
  `MDXContentProps`, `SidebarProps`, `TableOfContentsProps`,
  `CategoryFilterProps`, `SearchBarProps`, `ShareSectionProps`,
  `SearchDialogProps`, `LangProviderProps`, `ThemeToggleProps`,
  `ProfileSectionProps`, `TLDRSectionProps`, `AreaChartProps`, `BarChartProps`,
  `LineChartProps` and `ThemePresetProviderProps`.

- **Cross-platform foundation** — added the framework-free `@vllnt/ui-core` token/contract package, an experimental source-only `@vllnt/ui-native` renderer with 171 foundation, form, data, content, AI, learning, motion, utility, control, overlay, and navigation modules, plus a private Expo catalog for Android/iOS Metro validation. The URL-driven registry UI, unified platform-aware catalog and installation page, component pages, search, llms surfaces, JSON-LD, native manifest, and MCP expose truthful Web/Native availability. No supported native npm release exists yet (a manually bootstrapped name-reservation pre-release has no provenance); existing `@vllnt/ui` exports and stable publishing remain unchanged. (#479)
- **Component family landing pages** - every component family has a standalone,
  SEO-oriented landing at `/families/[category]`, plus a `/families` index. One
  shared template renders a hero with CTAs, per-family SEO sub-groups with
  editorial copy and live component previews, an agent-readable surface
  (`/llms.txt`, `/llms-full.txt`, `/r/<name>.json`), and a FAQ. Each page ships
  `CollectionPage`/`ItemList`, `FAQPage`, and `BreadcrumbList` JSON-LD and is
  listed in the sitemap.
- **Typography foundation primitives** — `Text`, `Heading`, `Display`, and
  `Prose` in the `core` family. Font family (`--font-sans` + a new
  `--font-display`), heading/display weight (`--font-weight-heading`,
  `--font-weight-display`), and the type scale (`--font-size-*`) are
  theme-overridable design tokens, so a brand restyles headings and body via
  token overrides alone — no library edits. `Heading` also takes a `size` prop
  to decouple visual scale from the semantic `level`. (#465)
- **Accessibility gate** - the Storybook test-runner runs axe-core (WCAG 2.0,
  2.1 and 2.2, levels A and AA) on every story in the light and dark theme and
  fails on any violation. A story can turn a rule off only through
  `parameters.a11y.config.rules` with a written `reason`. (#543)
- **Optional accessibility props** (English defaults, nothing required):
  `popoverLabel` on Combobox, MultiSelect, DatePicker, DateRangePicker,
  TimePicker and ColorPicker; `aria-label` / `aria-labelledby` /
  `aria-describedby` / `id` on Combobox; `aria-label` / `aria-labelledby` on
  InlineInput and ScrollArea; NumberInput `incrementLabel` / `decrementLabel`;
  Marquee and TickerTape `pauseControl` + `labels`; TabsContent `tabIndex`;
  GanttChartLabels `region`; CompletionDialog `modal`; Pagination `labels`;
  AIArtifactLabels `content`; ModelSelector `listLabel`; DataTableFilter
  `ariaLabel`; VideoEmbed `playLabel`. (#543)
- **New exports** - `moveRovingFocus` (+ `RovingFocusOptions`,
  `RovingOrientation`), `useReturnFocus` (+ `ReturnFocusHandlers`),
  `focusCalendarDay`, `CHECKLIST_PROGRESS_EVENT`, `parseChecklistStorageValue`,
  `MarqueeLabels`, `TickerTapeLabels`, `PaginationLabels`. Registry items now
  import these from `@vllnt/ui`, so installing them needs a `@vllnt/ui` release
  that contains them (the registry pins `^0.3.0`, which does not).
  `registry:integrity` now fails when a registry item imports a name that
  `@vllnt/ui` does not export. (#543)
- **`copyText` helper** - `copyText(value): Promise<boolean>` is exported from
  `@vllnt/ui`. It writes through the Clipboard API, falls back to a temporary
  textarea and `document.execCommand("copy")` when that API is missing or
  rejects, and resolves to `false` when neither path works. (#576)
- **Text `family` prop** - `family="mono"` sets body copy in `--font-mono`
  (JetBrains Mono by default) with the same scale: `size="base"` 16/1.6,
  `size="lead"` 18/1.7. The default stays `family="sans"`. (#666)
- **`@vllnt/ui/package.json` export** - tools can read the package manifest
  (for example its version) without `ERR_PACKAGE_PATH_NOT_EXPORTED`. (#665)

### Changed

- **Alert destructive** - the title and body use the foreground colour. The
  status colour stays on the border and the glyph. (#607)
- **Badge status chips** use a status dot. (#610)
- **Maia is Ink, and `--input` follows the design library** - Maia `--primary`
  is black in light and white in dark (it was pink), Maia uses the core sans
  font instead of Figtree, and its display and label weights are 600, not 700.
  The default theme's `--input` is `0.6167` in light (was `0.66`) and `0.5208`
  in dark (was `0.49`). (#614)
- **Theme presets meet the input 3:1 rule on muted** - the 12 runtime presets
  (aura, chatgpt, claude, cyberlime, cyberpunk, dracula, dusk, gemini, matrix,
  nord, synthwave and tron) get a new `--input` lightness in light and dark, by
  0.048 at most, with hue and chroma unchanged. The control border now reaches
  3:1 on background, card, popover and muted. (#620)
- **`warn` is deprecated** in the eight components above; pass `warning`. `warn`
  still works and renders the same colour. Removing it would break consumers,
  so that waits for a breaking release. `HeatOverlay` and `AlertPulse` now
  default to `warning`. A `data-*` tone attribute echoes the value you pass.
- **Site header name** - `NavbarSaas` is the one code name for the design
  library's `organism / Site header`. A `floating` style will join it as an
  added prop, and `FloatingNavbar` stays a separate component until then.
  `Display` is the design library's `atom / Heading` with `Level=display`.
- **Colour tokens meet WCAG AA** (#538). The default light theme uses a darker
  `--muted-foreground`, `--destructive` and `--input`; in the dark theme
  `--destructive` is lighter with a dark foreground and `--input` is lighter, so
  input borders are easier to see in both. Presets adjust `--primary`,
  `--destructive`, `--input` and `--ring` the same way. Visual snapshots change.
- **Font tokens on `:root`** - `styles.css` now defines `--font-sans`,
  `--font-display` and `--font-mono` on `:root`. If your app sets variables
  with these names, declare them later in the cascade or on `body` so yours win.
- **Lighter imports** (#541) - CodeBlock renders its code as plain text first
  and highlights it once the Prism build loads on the client; TutorialMDX loads
  the MDX compiler only for content with JSX, and FlowDiagram loads
  `html-to-image` only when copied. Apps that use neither `toast` nor
  `Toaster` no longer bundle sonner.
- **Smaller package** - the tarball has 361 files instead of 659: the
  per-component re-export stubs and `dist/test-setup.js` are gone.
  Only the `exports` entry points are public, so imports do not change.

- **Peer dependency ranges now match what the package needs.** `next` is
  `>=15.0.0` (Next 14 peers React 18, which the React 19 build cannot use),
  `tailwindcss` is `^3.4.0` (components use `size-*`, `text-balance` and
  `has-[]`, and the preset and CSS are Tailwind v3 only), and `next-themes` is
  now a required peer because the root entry imports it. `next` stays optional
  in metadata, but the root entry still imports `next/link`, `next/image` and
  `next/navigation`, so non-Next apps must alias them (see the README
  workaround). `react` and `react-dom` stay `>=19.0.0`: SearchBar and Slideshow
  no longer call React 19.2's `useEffectEvent`, so 19.0 and 19.1 work.

- **AI family consolidated onto the shared template** - the bespoke `/ai` hub is
  gone; `/ai` now permanently redirects to `/families/ai`, which renders through
  the same family template. AI components are recategorized out of the
  `learning` family into `ai`.
- `HeadingProps` exported from `@vllnt/ui` now refers to the `Heading` primitive
  (adds optional `level`/`size`/`ref`); the plain heading-element alias is
  available as `TypographyHeadingProps`. (#465)
- **Accessibility behaviour changes** (#543):
  - Drawer moves focus into its content on open (`autoFocus` now defaults to
    `true`; pass `autoFocus={false}` for vaul's previous behaviour).
  - CompletionDialog is built on the Radix dialog: it traps focus, closes on
    Escape and returns focus to the opener. `modal` (default `true`) maps to
    Radix `modal`; `modal={false}` leaves the page behind it interactive.
    Shortcuts work only while focus is inside the dialog, an empty string turns
    one off, and Enter no longer confirms from any focused element.
  - Marquee and TickerTape show a 24px pause/play button by default
    (`pauseControl={false}` hides it). It overlays the top-right corner of the
    Marquee and the right edge of the TickerTape, and hides under reduced
    motion, when nothing moves.
  - Pagination renders a `nav` landmark of single links styled as buttons, with
    `aria-current="page"` on the current page (it used to nest a button in each
    link).
  - CodeBlock syntax colours come from the `--vllnt-code-*` CSS variables
    (OKLCH channels) instead of JS theme detection. The defaults reach 4.5:1 on
    the background in light and dark mode for the default theme and every
    preset; override the variables to restyle.
  - CommandSeparator renders an `aria-hidden` divider.
  - Under `prefers-reduced-motion`, components stop their own decorative
    animation and AnimatedText shows its final text at once; loaders marked
    `data-motion="essential"` keep spinning, slower. The stylesheet changes
    motion only on library components, never on your own elements.
  - TabsContent is a tab stop only when the panel holds no focusable element;
    the ScrollArea viewport is a tab stop only while its content scrolls.
  - TreeView supports Home / End, ArrowRight to the first child and ArrowLeft
    to the parent, and keeps the active row in view.
- **Core caption and label weights match the Penpot library** -
  `font.weight.caption` is 400 (was 500) and `font.weight.label` /
  `--font-weight-label` is 500 (was 600). No shipped web component reads
  them; read `--font-weight-label` directly and labels get lighter. The Maia
  theme keeps its Ink scale (caption 500, label 600). Radius is unchanged:
  `radius.control` 6 and `radius.surface` 8 are the shared role names. (#669)
- **`JarvisDock` is now `CommandDock`** - the floating bottom dock with
  quick-action buttons and a command-palette trigger. Props and behavior are
  the same. The `data-jarvis-*` attributes are now `data-command-*` and the
  default region label is "Command dock". The registry item is `command-dock`
  and its page is `/components/command-dock`; `/components/jarvis-dock`
  redirects there (308). (#682)

### Deprecated

- **`JarvisDock` and the `jarvis-dock` registry item** - renamed to
  `CommandDock` / `command-dock`. The aliases (`JarvisDock`, `JarvisDockAction`,
  `JarvisDockLabels`, `JarvisDockProps`, `JarvisDockTone`, and
  `/r/jarvis-dock.json`) stay for one release and are removed in the release
  after next. To migrate, import `CommandDock` instead of `JarvisDock`, rename
  `data-jarvis-*` selectors to `data-command-*`, and install with
  `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/command-dock.json`. (#682)

### Fixed

- **Copy without the Clipboard API** - `useCopyToClipboard` (so `CopyButton`,
  `CodeBlock`, `Terminal` and the other copy controls) and
  `AIArtifactCopyButton` fall back to a temporary textarea and
  `document.execCommand("copy")` when `navigator.clipboard` is missing (plain
  http, such as a Tailnet IP) or `writeText` rejects. The fallback works inside
  modal dialogs, alert dialogs, native `dialog` elements and modal menus, keeps
  the text the user had selected on the page, and returns focus only when it
  came from the keyboard. `copied` stays `false` when both paths fail.
  `FlowDiagram` copies a PNG, so it has no text fallback and keeps reporting
  "Copy failed". (#576)
- **Close button target size** - the close buttons of `DialogContent`,
  `SheetContent` and `CompletionDialog` were 16 px. They are at least 24 x 24 px
  around the same 16 px icon (WCAG 2.5.8). (#576)
- **Select, SegmentedControl, FloatingToolbar and ProgressBar** - `Select`
  shows `aria-invalid` with a destructive border. The `Select` menu animation,
  the `SegmentedControl` selection transition, the `FloatingToolbar` colour
  transition and the `ProgressBar` transitions stop under
  `prefers-reduced-motion`. `FloatingToolbar` is one tab stop, and the arrow,
  Home and End keys move between its actions and skip disabled ones. (#611)
- **Setup docs** - the Tailwind config in both READMEs, the installation page
  and the agent skill now lists `./node_modules/@vllnt/ui/dist/**/*.js` in
  `content`. Tailwind 3 ignores a preset's `content` once the app sets its own,
  so the documented config generated no component styles. The agent skill's
  peer ranges and colour format (OKLCH) are corrected too.
- **Tailwind preset dependency** - `tailwindcss-animate`, which
  `@vllnt/ui/tailwind-preset` imports, is now a runtime dependency. With 0.3.0
  the preset failed to load unless the app installed it.
- **Duplicate React keys** - Terminal, FileUpload, AvatarGroup, Breadcrumb and
  about 20 other list renderers no longer key rows by content or label alone,
  so repeated or blank entries stop triggering duplicate-key errors. FileUpload
  adds an identical file (same name, size and lastModified) once, so removal
  removes one entry, and a selection that adds nothing new does not call
  `onFilesChange`.
- **`"use client"` directives** - Toolbar, Stepper, AIChatInput, ObjectCard,
  OverviewBoard and ZoomHUD use event handlers or browser globals and now carry
  the directive. `check:use-client` also flags handler props and browser globals.
- **Focus in custom dialogs** - KeyboardShortcutsHelp, TableOfContentsPanel,
  the FlowDiagram fullscreen view and the Slideshow contents panel keep Tab and
  Shift+Tab inside the dialog and return focus to the opener on close.
- **DataTable** sortable headers expose `aria-sort`.
- **Contrast** - Rating stars and the green success icons in Checklist,
  Curriculum and LearningObjectives reach 3:1 against the background in light
  and dark themes.
- **Decorative inline `<svg>` icons** are hidden from assistive technology.

- Accessible names, ARIA structure, APG keyboard patterns (tabs, radio groups,
  listbox, tree, dialogs and focus return), reduced motion and hard-coded
  palette contrast across the Web components flagged by the #535 audit. (#543)
- **Avatar fallback in dark** - `AvatarFallback` and the `PresenceStack`
  overflow chip fill their disc with `bg-secondary` (#262626). They used
  `bg-muted`, which is the page colour (#000000) in dark, so the disc
  disappeared and only the initials showed. Light mode is unchanged. A test
  fails if either goes back to `bg-muted`. (#686)

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

- Documentation domain moved to `ui.vllnt.com` / `storybook.vllnt.ai`.
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

[0.4.0]: https://github.com/vllnt/ui/releases/tag/v0.4.0
[0.3.0]: https://github.com/vllnt/ui/releases/tag/v0.3.0
[0.2.1]: https://github.com/vllnt/ui/releases/tag/v0.2.1
[0.2.0]: https://github.com/vllnt/ui/releases/tag/v0.2.0
[0.1.11]: https://github.com/vllnt/ui/releases/tag/v0.1.11
[0.1.10]: https://github.com/vllnt/ui/releases/tag/v0.1.10
[0.1.9]: https://github.com/vllnt/ui/releases/tag/v0.1.9
[0.1.8]: https://github.com/vllnt/ui/releases/tag/v0.1.8
[0.1.2]: https://github.com/vllnt/ui/releases/tag/v0.1.2
