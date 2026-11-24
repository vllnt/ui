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

- `ToggleGroup`: a disabled item stays focusable with the arrow keys, and the
  root has no `tabindex`.
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
- `Command` ranks results with cmdk's score, but groups keep their written
  order, items outside a group stay where they are, and clearing the search
  restores the written order (cmdk left the last sort in place).
- `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside` and
  `onInteractOutside` get the DOM event (with `detail.originalEvent` on the
  outside ones, as in Radix), and `onFocusOutside` is now accepted on `Dialog`,
  `Sheet` and `Drawer` content too.

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
