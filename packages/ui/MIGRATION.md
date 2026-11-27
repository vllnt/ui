# Unreleased: from Radix to ui-sdk

The next release builds the interactive components on Vercel's ui-sdk instead
of Radix, cmdk and vaul. Exports, props and class names stay the same, and the
Radix-facing DOM is kept (`data-state` values, `--radix-*` CSS variables,
`data-radix-scroll-area-viewport`), so most apps change nothing. Check these:

1. **Selectors on portals.** Popups render in place, in the browser top layer,
   not at the end of `<body>`. CSS or tests that look for popup content as a
   direct child of `body`, or for `[data-radix-popper-content-wrapper]`, find it
   next to its trigger instead. `*Portal` exports still exist and render their
   children.
2. **Scroll lock and the rest of the page.** A modal sets `overflow: hidden` on
   `<html>` and marks everything outside it `inert`. Selectors on
   `body[data-scroll-locked]` or on `aria-hidden` siblings no longer match.
3. **Focus timing in tests.** Focus enters a popup one animation frame after
   the press that opens it. Wrap focus assertions in `waitFor`.
4. **Your own Radix imports.** `@vllnt/ui` no longer installs any
   `@radix-ui/*` package, `cmdk` or `vaul`. If your app imports them directly,
   add them to your own `package.json`.
5. **Building your own parts.** Use the exported helpers (`Slot`,
   `asChildProps`, `withDataAttributes`, `openState`, `createMenuParts`, …) the
   same way the kit's components do; see `src/lib/ui-sdk.tsx`.

Known differences that remain:

- `ToggleGroup` and `UnstyledToggleGroup`: a disabled item stays focusable
  with the arrow keys (it reports `aria-disabled` instead of `disabled`, so
  style it with `data-[disabled]:`, not `disabled:`), the root has no `tabindex`, and the arrow keys follow `orientation`: Left and
  Right in a horizontal group (the default), Up and Down in a vertical one.
- `DropdownMenu`, `ContextMenu` and `Menubar`: an open menu leaves pointer
  events on the rest of the page, so a trigger under the pointer keeps its
  hover colour while its menu is open. Radix turned pointer events off outside
  the menu.
- `Slider`: the thumb is a native range input, so it exposes its value through
  the input instead of `aria-valuenow`.
- `NavigationMenu`: the open viewport is drawn by a fixed-position layer, so
  text in it can antialias differently (greyscale instead of subpixel).
- `Rating` with `readOnly`: its radios carry `aria-disabled` and are left out of
  the tab order, instead of the `disabled` attribute.
- `Meter` is a client component.
- Radix-only props that ui-sdk has no counterpart for are accepted and ignored:
  `avoidCollisions`, `sticky`, `dir`, `skipDelayDuration`, and vaul's drawer
  options.
- A press outside a popup dismisses it on pointer up, not pointer down.
- `Tooltip`: pressing the trigger closes the tooltip on click, not pointer
  down, so a custom `TooltipTrigger asChild` child must pass `onClick` on to
  its element. A closed tooltip stays in the page, hidden, so it can name its
  trigger: test for a visible tooltip, not for none in the DOM.
- `CompletionDialog` sets `aria-modal="true"` when modal, closes on a click
  outside (a press that starts inside and ends outside keeps it open), and in
  non-modal mode hands focus back to the opener only when nothing else took it.
- `Command` ranks results with cmdk's score, but groups keep their written
  order, items outside a group stay where they are, and clearing the search
  restores the written order (cmdk left the last sort in place).
- `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside` and
  `onInteractOutside` get the DOM event (with `detail.originalEvent` on the
  outside ones, as in Radix), and `onFocusOutside` is now accepted on `Dialog`,
  `Sheet` and `Drawer` content too.

## The default theme is flat

No export, prop or class name changes. The values behind the tokens do, so every
screen looks different. Check these:

1. **Glass is opt-in.** `:root` and `.dark` hold the solid values, so a part
   with `material="glass"` draws solid. To get glass, set `data-glass="on"` on
   `<html>` (everywhere) or on one surface. `GlassCard`, `GlassPanel`,
   `GlassProgress` and `LiquidGlass` set it on their own root. `material="solid"`
   and `data-glass="off"` still work; an app that set `data-glass="off"` only to
   get solid can drop it.
2. **Fonts.** `--font-sans` and `--font-mono` are one JetBrains Mono stack with
   system mono fallbacks. No font file is shipped: load JetBrains Mono yourself,
   or override both variables.
3. **Radius.** `--radius` is 0.375rem. `rounded-lg`, `rounded-md` and
   `rounded-sm` are 6, 4 and 2 px (they were 8, 6 and 4 px).
4. **Shadows.** `--shadow-raised`, `--shadow-overlay` and `--shadow-floating` are
   `none`. Draw a surface edge with `border`.
5. **Type.** Headings weigh 500. Body is 14 px, h1 20 px, display 28 px.
6. **Colours.** Light foreground and primary are `#000`; dark are `#fff`. Dark
   `--popover` is `#0a0a0a`, `--muted` and `--secondary` `#141414`, `--accent`
   `#181818` and `--border` `#1e1e1e`. Update visual snapshots.
7. **New roles.** `--sidebar`, `--pill`, `--pill-border`, `--composer-border` and
   `--status-*` exist in both modes. A theme that does not set them inherits
   these values.
8. **Maia theme** is the same as the default. Keep or drop `data-theme="maia"`.

## Packages no longer installed

`@vllnt/ui` now installs 12 runtime packages instead of 23. These are gone:
`react-day-picker`, `react-resizable-panels`, `sonner`, `input-otp`,
`embla-carousel-react`, `tailwindcss-animate`, `@hookform/resolvers`,
`class-variance-authority`, `clsx`, `qrcode` and `zod`. Their jobs now go to
ui-sdk or to small helpers in the package. If your app imports any of them
directly, add it to your own `package.json`. In particular, `Form` validates
any Zod 4 schema you pass, but your app now installs `zod` itself.

## Breaking changes

- **`Calendar`, `RangeCalendar`, `DatePicker`, `DateRangePicker`** are built
  on ui-sdk's calendar instead of `react-day-picker`. These still work: `mode`,
  `selected`, `onSelect`, `defaultMonth`, `month`, `onMonthChange`, `disabled`
  (dates or a function), `fromDate`/`toDate`, `numberOfMonths`,
  `showOutsideDays` and `initialFocus`. Values stay `Date` objects.
  - `CalendarProps` is no longer `react-day-picker`'s props. `classNames`,
    `components`, `formatters` and `labels` are gone. `locale` is a language tag
    string such as `"fr-FR"`.
  - `focusCalendarDay` is gone; use `initialFocus`.
  - Days are grid cells, not buttons. A disabled day stays focusable and is
    marked `aria-disabled`.
  - With a selection and no `defaultMonth`, the calendar opens on the selected
    month (it used to open on today).
  - Pressing a day after a complete range starts a new range. Escape clears a
    range in progress.
  - The pickers load the calendar on first open and show a same-size
    placeholder meanwhile.
- **`ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`** are built on
  ui-sdk's resizable instead of `react-resizable-panels`. These still work:
  `direction`, `defaultSize`, `minSize`, `maxSize`, `collapsible`, `onResize`
  and `withHandle`.
  - `onResize`, `onCollapse` and `onExpand` are per panel.
  - The imperative panel refs are gone.
  - `onLayoutChange` receives `number[]`.
- **`toast` and `Toaster`** run on ui-sdk's toast instead of `sonner`. The
  calls stay the same: `toast()`, `.success`, `.error`, `.info`, `.warning`,
  `.loading`, `.promise`, `.custom` and `.dismiss`. The differences are
  listed in the "Differences from sonner" table in `toast.mdx`. In short:
  - `getHistory`, `getToasts`, `unstyled`, `invert`, `gap`,
    `swipeDirections`, `mobileOffset`, `dir`, `toasterId` and per-toast
    `position` are gone.
  - `toast.promise` returns `{ id, unwrap }`.
  - Left and right positions are logical (start/end), so they flip in RTL.
  - The hotkey is fixed at Alt+T.
  - `[data-sonner-*]` selectors no longer match.
  - The stack also expands on keyboard focus.
- **`Carousel`** runs on ui-sdk's carousel instead of Embla.
  - `CarouselApi` is a small object with `scrollPrev`, `scrollNext`,
    `scrollTo`, `canScrollPrev`, `canScrollNext`, `selectedScrollSnap`,
    `scrollSnapList`, `on` and `off` (`select`, `reInit`).
  - `plugins` and other Embla options are ignored.
  - Item spacing uses logical classes (`pe-*`/`-me-*` instead of
    `pl-*`/`-ml-*`).
  - Previous and Next stay focusable and use `aria-disabled` at the ends.
  - The viewport is focusable, and the arrow keys act on it.
- **`InputOTP`** runs on ui-sdk's one-time-code input instead of `input-otp`,
  as a single labelled field. Its parts and props stay the same.
- **`cn`** merges conflicting classes from the groups the library itself uses
  (spacing, sizing, colours, borders, typography, layout and so on). Classes
  from other groups, such as `columns-*`, now stay side by side instead of
  replacing each other. If you relied on that, merge them with your own
  `twMerge`.
- **`DataTable`**'s filter uses a native `<select>`, styled like our inputs.

# Migrating from 0.3.0 to 0.4.0

`@vllnt/ui` 0.4.0 keeps the 0.3.0 API: every one of the 1,343 exports of 0.3.0
is still exported (0.4.0 adds 115). What changes is the look (glass by default, black dark surfaces,
stronger contrast), a few peer ranges, some runtime dependencies and some
accessibility behaviour. Work through the steps below in order; most apps only
need steps 1 to 3.

The full list of changes is in [CHANGELOG.md](./CHANGELOG.md).

## 1. Check your peer dependencies

| Peer          | 0.3.0      | 0.4.0                         |
| ------------- | ---------- | ----------------------------- |
| `react`       | `>=19.0.0` | `>=19.0.0` (unchanged)        |
| `react-dom`   | `>=19.0.0` | `>=19.0.0` (unchanged)        |
| `next`        | `>=14.0.0`, optional | `>=15.0.0`, optional |
| `next-themes` | `>=0.4.0`, optional  | `>=0.4.0`, **required** |
| `tailwindcss` | `>=3.0.0`  | `^3.4.0` (Tailwind v4 is not supported yet) |

```bash
pnpm add @vllnt/ui@0.4.0 next-themes@latest
```

The root entry imports `next/link`, `next/image` and `next/navigation`. Apps
that do not use Next.js alias them (see the README).

## 2. Load the stylesheet

Glass surfaces and the font tokens live in `@vllnt/ui/styles.css`. Import it
once, as in 0.3.0:

```ts
import "@vllnt/ui/styles.css";
```

`styles.css` now defines `--font-sans`, `--font-display` and `--font-mono` on
`:root`. If your app defines variables with these names, declare yours later in
the cascade (or on `body`) so they win.

## 3. Decide on glass or solid surfaces

Bars, panels, menus, popovers, dialogs, sheets and docks are glass by default
(tint, sheen, 20 px blur). To keep the 0.3.0 opaque look:

- for one component, pass `material="solid"`;
- for the whole app, set `data-glass="off"` on `<html>`.

Glass already turns solid by itself under `prefers-reduced-transparency`,
`prefers-contrast: more`, `forced-colors: active` and in browsers without
`backdrop-filter`.

For your own surfaces, use the classes `vllnt-glass` (bars and panels),
`vllnt-glass-floating` (floating docks), `vllnt-glass-dense` (surfaces with body
text, muted text or control borders) or `vllnt-glass-scrim` (veils). Apps that
tried a 0.4.0 canary replace `vllnt-glass-md` and `vllnt-glass-sm` with these.

## 4. Check colours you read from the theme

- **Dark surfaces are black.** In the default dark theme `--background`,
  `--muted`, `--card` and `--popover` are `#000`. Your own `bg-card` or
  `bg-popover` panels need a `border` to show their edge, and your own
  `bg-muted` skeletons, tracks or hover fills disappear in dark: use
  `bg-secondary`.
- **Contrast tokens changed.** `--muted-foreground`, `--destructive` and
  `--input` are darker in light and lighter in dark, so text and control
  borders reach WCAG AA. Update visual snapshots.
- **Maia theme** is Ink: black primary in light, white in dark, core sans font.

## 5. Rename deprecated names

| 0.3.0                                   | 0.4.0                                    | Removed in |
| --------------------------------------- | ---------------------------------------- | ---------- |
| `JarvisDock`, `JarvisDock*` types       | `CommandDock`, `CommandDock*` types      | 0.6.0      |
| `data-jarvis-*` selectors               | `data-command-*`                         | 0.4.0      |
| `/r/jarvis-dock.json`                   | `/r/command-dock.json`                   | 0.6.0      |
| `tone="warn"` / `severity="warn"`       | `"warning"`                              | next major |

## 6. Review accessibility behaviour you may rely on

These are fixes, but tests or styles that assumed the old behaviour need an
update:

- `Drawer` moves focus into its content on open (`autoFocus={false}` restores
  the old behaviour).
- `CompletionDialog` traps focus, closes on Escape and returns focus to its
  opener; its shortcuts work only while focus is inside it.
- `Marquee` and `TickerTape` show a pause button (`pauseControl={false}` hides
  it).
- `Pagination` renders a `nav` of links with `aria-current="page"` (no button
  inside a link).
- Under `prefers-reduced-motion`, library components stop decorative
  animation; loaders marked `data-motion="essential"` keep spinning, slower.
- `TabsContent` is a tab stop only when it holds nothing focusable, and the
  `ScrollArea` viewport only while it scrolls.

## 7. Runtime dependencies that moved a major

`@vllnt/ui` installs these for you. They matter only if your app also imports
them directly or passes their props through a component:

| Package               | 0.3.0  | 0.4.0  | Where it shows                                   |
| --------------------- | ------ | ------ | ------------------------------------------------ |
| `lucide-react`        | 0.468  | 1.73   | icons inside components; pin one version app-wide |
| `sonner`              | 1.7    | 2.0    | `toast` and `Toaster`                            |
| `react-day-picker`    | 9      | 10     | props passed through `Calendar`                  |
| `@hookform/resolvers` | 6      | 7      | `Form` with a Zod `schema`                       |

`@radix-ui/react-aspect-ratio` is no longer installed: `AspectRatio` is a plain
component and works in Server Components.
