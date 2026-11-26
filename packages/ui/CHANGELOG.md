# Changelog

All notable changes to `@vllnt/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **`Button` `variant="unstyled"`** - keeps the button's behaviour (`asChild`,
  `disabled`, ref, every native attribute) and adds no classes of its own: the
  element's class list is only the caller's `className`, and `size` has no
  effect. `buttonVariants({ variant: "unstyled" })` returns only the caller's
  classes. Every other variant and size renders the same class string as
  before.
- **`Separator` `variant`** - `variant="dashed"` draws a dashed 1 px border over a
  transparent fill, in both orientations. The default stays `solid`.
- **`Link` `size`, `foreground` and `skip`** - `size="sm" | "default" | "lg"`
  (`lg` is the bar link: 14 px label, 4 px side padding, height from
  `--size-control-xs`); `variant="foreground"` takes the ink colour with no
  primary; `variant="skip"` is a skip-to-content link, hidden until focused,
  then shown at the top left, 44 px high, above other content.
- **`Button` size `icon-lg`** - a 44 px square icon button (`size-11`).
- **`SegmentedControl` `fit` and `variant`** - `fit` hugs the content (root
  `w-auto`, items `flex-none`); `variant="hairline"` swaps the filled track for a
  transparent one with a 1 px input-colour border (`glass-input` inside glass).
  The defaults stay `filled` and full width.
- **`Text` `dt`, `dd`, `li` and `measure`** - `as` takes `dt`, `dd` and `li`;
  `measure="prose" | "narrow"` caps the width with `size.measure-prose` (720 px,
  new) or `size.measure-narrow` (480 px).
- **`Kbd` `variant="glass"`** - a chip for a glass surface: 9 % ink wash, 75 % ink
  text, no border. Place it on the dense glass tint.
- **`StatusIndicator` `icon`** - a mark shown in place of the dot. The tone
  colours the icon alone; the pill and label take the neutral variant, so the
  label stays foreground.
- **Touch-target utilities** - the Tailwind preset adds `min-h-target`,
  `min-w-target` (`--size-target-min`, 44 px) and `h-control-xs`
  (`--size-control-xs`, 32 px, 44 px under `@media (pointer: coarse)`). They
  switch by pointer, not by screen width.
- **`size.measure-prose` token** - 720 px (`--size-measure-prose`), for lead
  copy and descriptions.

### Changed

- **`Separator` renders on the server** - it is a plain element with no
  `"use client"` and no Radix dependency. A decorative separator (the default) is
  `aria-hidden`; `decorative={false}` gives `role="separator"` with
  `aria-orientation`. `@radix-ui/react-separator` is removed from the
  dependencies.
- **`SearchDialog` trigger** - the shortcut hint is the `Kbd` atom, so it shows
  the command key on Mac and `Ctrl` elsewhere, as the shortcut handler accepts
  either.

### Fixed

- **`Kbd` `shortcut`** - each key cap has an explicit React key, so a
  multi-key shortcut no longer logs the "unique key prop" warning in
  development.

## [0.4.0] - 2026-11-23

Upgrading from 0.3.0: see [MIGRATION.md](./MIGRATION.md).

### Added

- **Glass tokens** - `blur.glass.default` (20 px), `material.glass.tint-top`,
  `tint-bottom`, `tint-dense-top`, `tint-dense-bottom`, `hairline-edge` and
  `sheen-opacity` (one value per mode), `shadow.glass`, `shadow.glass-floating`,
  `color.glass-muted-foreground` and `color.glass-input`, with CSS variables, a
  `material.solid` value for each, and Penpot sets for solid, reduced
  transparency and increased contrast.
- **`material` prop** - every glass component takes `material="glass" | "solid"`
  (default `"glass"`) and writes `data-material`. `Material` and `MaterialProps`
  are exported types.
- **Automatic solid fallbacks** - glass turns solid under
  `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors:
  active`, without `backdrop-filter`, and under `html[data-glass="off"]`. No
  script runs, and the library does not read the battery.
- **Glass checks** - WCAG 2.2 AA contrast tests for text and control borders on
  both tints in every theme, and a backdrop-filter budget test: no
  `backdrop-blur-*`, no blur radius above `blur.glass.lg` (24 px).
- **`keyByOccurrence`** - keys items that have no id and may repeat: the key is
  the identity text plus the number of identical items before it, so an equal
  item keeps its key when others change around it.
- **Migration guide** - [MIGRATION.md](./MIGRATION.md) lists the steps from
  0.3.0 (peers, stylesheet, glass or solid, colours, renames, accessibility
  behaviour, runtime dependency majors). It ships in the package.
- **Accessibility gate** - every Storybook story is checked with axe-core
  (WCAG 2.0, 2.1 and 2.2 A and AA) in light and dark, on glass and on solid
  surfaces, under `prefers-reduced-motion: reduce` (no endless decorative
  animation unless marked `data-motion="essential"`) and for a visible focus
  indicator on each of the first tab stops. CI runs it on every pull request.
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
- **Product themes stylesheet** - `@vllnt/ui/themes/products.css` ships the
  Maia and PaaS themes as `html[data-theme="maia"]` and
  `html[data-theme="paas"]`, each with a `.dark` block. It is generated from
  `packages/design/tokens.json`. Load JetBrains Mono (Maia, PaaS) in your
  app; the package does not ship the font.
- **Status and diff colors** - CSS variables `--success`, `--warning`,
  `--info`, their `-foreground` pairs, `--diff-added` and `--diff-removed` in
  `themes/default.css` and `styles.css`, and matching Tailwind colors
  (`success`, `warning`, `info`, `diff.added`, `diff.removed`) in the preset.
- **Label type step** - `--font-size-label`, `--line-height-label` and
  `--font-weight-label`.
- **Sidebar `pathname` prop** - names the page the sidebar marks as current.
  It defaults to the router's pathname, so existing usage is unchanged. Pass
  it when the URL the visitor sees differs from the route that renders, such as
  a prerendered locale or variant route, instead of overriding the router's
  pathname context.
- **Sidebar `prefetch` prop** - set it to `false` to stop the sidebar's links
  from prefetching their pages. Left unset, the links keep the router's default
  prefetching, so existing usage is unchanged. A sidebar with dozens of links
  in view otherwise prefetches every one of them on page load.

- **New hooks** - `useFocusContainment` (trap Tab inside a custom modal and
  restore focus on close) and `useEventCallback` (stable callback that always
  calls the latest closure). Registry items import them from `@vllnt/ui`.
- **Props types exported from the barrel** - `BreadcrumbProps`,
  `CommandDialogProps`, `SheetContentProps`, `CarouselProps`, `CodeBlockProps`,
  `MDXContentProps`, `SidebarProps`, `TableOfContentsProps`,
  `CategoryFilterProps`, `SearchBarProps`, `ShareSectionProps`,
  `SearchDialogProps`, `LangProviderProps`, `ThemeToggleProps`,
  `ProfileSectionProps`, `TLDRSectionProps`, `AreaChartProps`, `BarChartProps`,
  `LineChartProps` and `ThemePresetProviderProps`.

- Source-only React Native renderer and shared design contracts (`@vllnt/ui-core`, `@vllnt/ui-native`). They are experimental and not published with this release; installing `@vllnt/ui` is unchanged.
- Localized Native catalog discovery, dependency/capability comparison, and extensible React/React Native source tabs in a single component preview surface.
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

- **Glass is the default material** - bars, panels, menus, popovers, dialogs,
  sheets, docks and map overlays draw a frosted surface (tint, sheen, 20 px
  blur, edge, two-layer shadow) instead of an opaque one. Pass
  `material="solid"` to keep the previous look. The classes `vllnt-glass-md` and
  `vllnt-glass-sm` are replaced by `vllnt-glass`, `vllnt-glass-floating`,
  `vllnt-glass-dense` (denser tint for body text, muted text and control
  borders) and `vllnt-glass-scrim`. Apps that use these classes load
  `@vllnt/ui/styles.css`.
- **Dark default tint** - the dark default glass tint is `#1C1C1CB2` to
  `#1414149C` (4.51:1 for the foreground), not the first recipe draft's
  `#1C1C1CAF` to `#14141499` (4.34:1).
- **Smaller code highlighter** - `CodeBlock` and `StaticCode` use the Prism
  light build with a fixed language set, not the full build that bundles every
  language. `StaticCode` drops from about 682 KB to 121 KB minified, the lazy
  `CodeBlock` chunk from about 681 KB to 115 KB, and an import of every export
  from about 2.67 MB to 2.11 MB. The set is `tsx`, `typescript` (`ts`), `jsx`,
  `javascript` (`js`), `json`, `bash` (`sh`, `shell`, `zsh`), `css`, `markdown`
  (`md`), `diff`, `yaml` (`yml`), `python` (`py`), `markup` (`html`, `xml`) and
  `sql`. Any other language, and `text`, renders as plain text without an
  error.
- **Runtime dependencies** - `lucide-react` 0.468 to 1.73 (icons now share a
  small base, about 3 KB minified once per bundle), `sonner` 1.7 to 2.0 (the
  `toast` export), `react-day-picker` 9 to 10 (`Calendar`, `RangeCalendar`,
  `DateRangePicker`), `@hookform/resolvers` 6 to 7 (`Form` with `schema`),
  `react-hook-form` 7.92 and `react-resizable-panels` 4.24. Apps that pass
  `react-day-picker` props through `Calendar` should check the react-day-picker
  10 upgrade notes.
- **AspectRatio** - renders two plain `div`s with the same structure and no
  longer needs `"use client"`, so it works in a Server Component.
- **Dark surfaces are pure black** - the default dark theme now renders
  `--background`, `--muted`, `--card` and `--popover` as `0 0 0` (#000000).
  Hairline borders separate the surfaces: `--border`, `--secondary` and
  `--accent` stay `0.2686` (#262626), and `--input` is unchanged. Before,
  `--muted` was `0.2686` (#262626) and `--card` / `--popover` were `0.1445`
  (#0a0a0a). A `bg-card` or `bg-popover` surface needs a `border` to show its
  edge; every shipped one has it, and a test now fails on one that does not.
  The separators in `DropdownMenu`, `Menubar` and `Select` draw with
  `bg-border` instead of `bg-muted`, which is the page color now, and a test
  fails on any one-pixel divider that uses `bg-muted`. Light mode is unchanged.
  Themes that override these roles (presets, Maia) keep their values; PaaS and
  any app that reads the dark `--muted`, `--card` or `--popover` directly get
  black.
- **Hover, selected and data-state fills use `secondary`** - 32 component files
  (`Table`, `Tabs` pill, `Toggle`, `Slideshow`, `FilterBar` and others) used
  `bg-muted` for that feedback, which is now the page color in dark.
  They use `bg-secondary` with the same opacity. In the default and PaaS themes
  the fill is the same color as before in light and dark, because `--secondary`
  equals the old `--muted` there. Theme presets keep a quiet neutral
  `--secondary` (their `--accent` is a brand color), so text on these fills
  stays at 6.65 to 12.53:1 in dark. The Maia theme has its own dark `--muted`
  (`0.2002`) and a core dark `--secondary` (`0.2686`), so its dark hover fills
  are one step lighter than before.
  `SegmentedControl`, `ViewSwitcher`, `WorkspaceSwitcher` and the `PricingTable`
  period toggle draw their track with `bg-secondary` for the same reason: the
  selected segment is `bg-background` on that track.
- **Skeletons, tracks and handles use `secondary`** - 29 `bg-muted` fills in 23
  component files were the whole visual of their element: `Skeleton`, the
  `ProgressBar`, `Meter`, `Tour`, `Checklist`, `UsageBreakdown` and other
  progress, meter and usage tracks, the `Drawer` handle, the empty cells of
  `ActivityHeatmap` and the neutral `GanttChart` bar. They use `bg-secondary`
  (#262626) with the same opacity, because `bg-muted` is the page color in dark
  and they would disappear. Chips, code spans and panels keep `bg-muted`: their
  text and border carry them. A test fails on a `bg-muted` skeleton or bar.
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

### Removed

- **`@radix-ui/react-aspect-ratio`** - no longer a dependency; `AspectRatio`
  does the same with an inline `padding-bottom` box.

### Fixed

- **StepByStep** - `null`, `false` and text children no longer crash the list
  or render an empty step; numbering and the completed count skip them.
- **Reasoning** - `onOpenChange` fires once per toggle under React StrictMode.
- **DocumentSiblingNav** - a label passed as `undefined` keeps its default.
- **List keys** - lists that key items by label (OrderSummary, StatusBoard,
  FilterBar, PieChart and others) no longer warn or drop rows when two items
  share a label.
- **Accessible names** - a `Curriculum` lesson link and a `TutorialComplete`
  related link put a space between their parts, so screen readers announce
  "Available HTML Basics" and "Tutorial Next Tutorial" instead of running the
  words together.
- **Visible label in the accessible name (WCAG 2.5.3)** - `RunTimeline` phase
  bars, the `CommentPin` trigger and `DocumentSiblingNav` links take their name
  from their content instead of an `aria-label` that left out the visible text.
  Names read as before ("Complete 0 → 600: load", "Comment, 3 unread",
  "Older: Foo post"); a passive `RunTimeline` bar is plain text, not
  `role="img"`. `StepNavigation` buttons drop their fixed English
  `aria-label` ("Previous step", "Next step") and take their name from
  `previousLabel` / `nextLabel`, so a translated label is also the spoken name.
  `Calendar` (and `RangeCalendar`, `DateRangePicker`) day names start with the
  visible day number ("12, Thursday, November 12th, 2026"); a `labels` prop
  still overrides them. axe-core 4.14 checks this rule.
- **Command input focus** - `CommandInput` draws its bottom border in the ring
  colour while the field has focus, so keyboard users see where focus is
  (WCAG 2.4.7). The input itself keeps no outline, as before.
- **Tap targets** - the NavbarSaas links, the Breadcrumb crumbs, the
  TableOfContents buttons and the Sidebar family heading link are at least
  24 px tall (WCAG 2.5.8); they were 20 px.
- **Close button target size** - the close buttons of `DialogContent`,
  `SheetContent` and `CompletionDialog` were 16 px. They are at least 24 x 24 px
  around the same 16 px icon (WCAG 2.5.8). (#576)
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
- **Accordion accessibility** - each trigger now has `aria-controls` pointing
  at its panel, and each panel is a `region` labelled by its trigger. Closed
  panels are `inert`, so screen readers no longer read closed answers and Tab
  skips links inside them. The open and close animation is unchanged.
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

- Preserve nested scrolling, reduced-motion behavior and sidebar keyboard focus in the affected Web components.
- Forward explicit tab accessibility relationships and label/keyboard handlers without changing default tab navigation.
- Emit JSON-LD graph documents and localized Native discovery metadata without advertising unpublished npm packages.
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

- Documentation domain moved to `ui.vllnt.com` / `storybook.vllnt.ai`.
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

[0.4.0]: https://github.com/vllnt/ui/releases/tag/v0.4.0
[0.3.0]: https://github.com/vllnt/ui/releases/tag/v0.3.0
[0.2.1]: https://github.com/vllnt/ui/releases/tag/v0.2.1
[0.2.0]: https://github.com/vllnt/ui/releases/tag/v0.2.0
[0.1.11]: https://github.com/vllnt/ui/releases/tag/v0.1.11
[0.1.10]: https://github.com/vllnt/ui/releases/tag/v0.1.10
[0.1.9]: https://github.com/vllnt/ui/releases/tag/v0.1.9
[0.1.8]: https://github.com/vllnt/ui/releases/tag/v0.1.8
[0.1.2]: https://github.com/vllnt/ui/releases/tag/v0.1.2
