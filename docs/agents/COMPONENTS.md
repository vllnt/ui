# Component Conventions

Authoritative pattern catalog for every component in `packages/ui/src/components/`. Rules here are referenced from [`RULES.md`](./RULES.md).

---

## Folder layout

Every component lives at `packages/ui/src/components/{level}/{name}/`, where `{level}` is its [Atomic Design level](#atomic-design-levels):

```
src/components/
  atoms/{name}/      # button, input, badge, dialog, theme-provider, …
  molecules/{name}/  # search-bar, field, form, command, …
  organisms/{name}/  # data-table, map-2d, navbar-saas, tutorial-mdx, …
  templates/{name}/  # canvas-shell
  index.ts           # barrel — the only file that re-exports components
```

Each component folder:

```
{name}/
  {name}.tsx         # implementation — ref-as-prop + CVA + cn()
  {name}.test.tsx    # Vitest unit tests
  {name}.visual.tsx  # Playwright CT story (real Chromium)
  {name}.stories.tsx # Storybook story (default export + named stories)
  {name}.mdx         # registry/docs (auto-generated where possible)
```

Add the export to `packages/ui/src/components/index.ts`, importing from `./{level}/{name}/{name}` (no per-folder `index.ts`). Import another component as `../{other}/{other}` within the same level and `../../{level}/{other}/{other}` across levels; library code is `../../../lib/{module}`. Component names stay unique across levels: the registry, Storybook scripts and `/r/{name}.json` resolve a component by name, so its level never shows in public output.

---

## Atomic Design levels

| Level | What it is | May import |
|-------|------------|------------|
| `atoms` | A building block that composes no other component: controls, text, surfaces, decorations, overlays pinned to another surface, providers, and multi-part primitives (`Dialog`, `Select`, `Card`) | no component — only `lib/` (utils, hooks, types) |
| `molecules` | A small unit built from atoms (`SearchBar` = `Input` + `Button`) | atoms |
| `organisms` | A section-level widget: built from molecules or other organisms, or a self-contained section (see below) | atoms, molecules, organisms |
| `templates` | A page-level layout that arranges organisms into regions (`CanvasShell`) | atoms, molecules, organisms — never another template |

Component imports never form a cycle. Stories, tests, visual fixtures and MDX may import from any level — demos compose freely. `pnpm check:atomic` ([`scripts/check-atomic-levels.mjs`](../../scripts/check-atomic-levels.mjs), CI quality gate) fails on a folder outside a level, an upward or sideways import the table forbids, a cycle, or a duplicate name.

### Choosing a level

1. **From imports:** imports no component → atom; imports only atoms → molecule; imports a molecule or an organism → organism.
2. **Promote to organism** a component that imports no (or only atom) components but is a self-contained, section-level widget — any of:
   - **Data visualisation** — a complete chart, map, diagram or timeline rendered from a data collection on its own axes, projection or time scale (`pie-chart`, `map-2d`, `gantt-chart`, `interactive-timeline`). Single-value indicators (`gauge-chart`, `meter`, `threshold-ring`, `sparkline-grid` tiles) and overlays drawn on another surface (`heat-overlay`, `sticky-metric`) stay atoms.
   - **Interactive workspace or viewer** — owns a pan/zoom/drag viewport or a document view (`canvas-view`, `flow-diagram`, `primary-source-viewer`).
   - **Data grid or tree** — renders a whole tabular or hierarchical dataset and owns its sort, filter, pagination, selection or expansion state (`data-table`, `tree-view`).
3. **Templates** are page layouts only (today: `canvas-shell`). Providers stay atoms.

The level is the higher of steps 1 and 2. When unsure, pick the lower level — promoting later is a folder move.

### Moving a component to another level

1. `git mv` the folder to `src/components/{new-level}/{name}` and its committed visual baselines from `packages/ui/.snapshots/{old-level}/{name}` to `packages/ui/.snapshots/{new-level}/{name}` (the snapshot path mirrors the test path).
2. Fix the relative imports inside the folder, in its importers (including `vi.mock` paths in tests) and in `src/components/index.ts`. Keep export names and order unchanged.
3. Promoting a component can push its importers up too: an atom or molecule may not import an organism. `pnpm check:atomic` lists every importer to move.
4. Run `pnpm check:atomic`, `pnpm -F @vllnt/ui lint`, `pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json`, `pnpm -F @vllnt/ui test:once` and `pnpm -F @vllnt/ui-registry registry:build` — the registry output must not change.

---

## React Native (`@vllnt/ui-native`)

The native renderer uses the same levels, import rules and checker:

```
packages/ui-native/src/
  components/
    atoms/{name}/      # button, text, card, dialog, select, tooltip, …
    molecules/{name}/  # field, search-bar, tabs, accordion, date-picker, …
    organisms/{name}/  # date-range-picker, time-picker, tree-view, interactive-timeline, …
  primitives/          # shared interaction, accessibility, motion and platform-service modules
  theme/               # ThemeProvider
  tests/               # cross-component contract suites
  index.ts             # generated barrel — never edit by hand
```

A component folder holds `{name}.tsx` plus its own helpers and unit tests (`atoms/button/button-styles.ts`, `molecules/combobox/combobox.test.tsx`). Import another component as `../{other}/{other}` within the same level and `../../{level}/{other}/{other}` across levels; shared modules are `../../../primitives/{module}` and `../../../theme/theme-provider`.

- **Level:** follow [Choosing a level](#choosing-a-level) with the native component's own imports. The two platforms can differ: web `accordion` is an atom, while the native one composes `Collapsible` and is a molecule. Promotions follow web, so `interactive-timeline` (data visualisation) and `tree-view` (data grid) are organisms on both.
- **Below atoms:** `src/primitives/` and `src/theme/` may not import a component. `pnpm -F @vllnt/ui-native check:atomic` passes them to the checker with `--base`; the root `pnpm check:atomic` and `pnpm ci:native` both run it.
- **Barrel and manifest:** `pnpm -F @vllnt/ui-native generate:index` writes `src/index.ts`, sorted by component name across levels. Each `registry.json` entry's `source` is `src/components/{level}/{name}/{name}.tsx`, and `generate:index:check` fails when a name or a source path drifts. The registry site publishes this path as `native.source` (`/r/{name}.json`, `/r/native/registry.json`, `llms-full.txt`, MCP), so moving a native component changes its public source path.
- **Moving a component:** `git mv` the folder; fix the relative imports inside it, in its importers and in `src/tests/`; update its `source` in `registry.json`; then run `pnpm -F @vllnt/ui-native generate:index`, `pnpm ci:native`, and `pnpm -F @vllnt/ui-registry registry:build` (which rewrites `native.source` in `apps/registry/registry.json`) followed by `registry:integrity`. The ESLint overrides match `src/components/*/{name}/**`, so they need no change.

---

## The ref-as-prop + displayName contract

`@vllnt/ui` targets **React 19** (peer `react`/`react-dom` `>=19.0.0`). Components accept `ref` as a normal prop — `forwardRef` is gone — and read context with `use()` instead of `useContext()`.

Every named export — primitives **and compound subcomponents** — uses:

```tsx
const Card = ({
  className,
  ref,
  ...props
}: CardProps & { ref?: React.Ref<HTMLDivElement> }) => (
  <div ref={ref} className={cn("rounded-md border", className)} {...props} />
);
Card.displayName = "Card";

const CardHeader = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<HTMLDivElement>;
}) => <div ref={ref} className={cn("p-6", className)} {...props} />;
CardHeader.displayName = "CardHeader";
```

Context is read with `use()`, never `useContext()`:

```tsx
import { use } from "react";
const ctx = use(CardContext);
```

Compound parts (`Card.Header`, `Form.Field`, `Conversation.Title`, …) get the **same treatment**. No exceptions. ref-as-prop does **not** work under React 18, so React 19 is a hard requirement.

> **History:** #268 migrated every component off `forwardRef`/`useContext`. Re-run the transform over newly added components with `scripts/migrate-react19.sh`. (The earlier `forwardRef` + `displayName` contract from PR #150 is superseded by this one.)

---

## Semantic root

When a component's name implies an HTML element, the root must render that element:

| Name | Root element |
|------|--------------|
| `Form` | `<form>` (`form.tsx`) |
| `Nav`, `Navbar*` | `<nav>` |
| `List` | `<ul>` / `<ol>` |
| `Article` | `<article>` |
| `Header`, `Footer` | `<header>` / `<footer>` |
| `Button` | `<button>` (or asChild) |

`<div role="form">` is a smell — rename the component or use the real tag. If a wrapper is needed, name it for what it is (`FormShell`, `FormSurface`).

> **Counters:** PR #145 — `Form` shipped as styled `<div>`.

---

## ARIA — by spec, not vibe

### Roles to be careful with

| Role | Use only when | Don't use when |
|------|---------------|----------------|
| `button` | A single, atomic, accessible action with no nested interactives | Wrapper hosts complex children (canvas, workspace, panel) |
| `status` | Live status region with text content updating | Static marker / decorative element |
| `alert` | Time-sensitive announcements | Persistent UI |
| `presentation` / `none` | Element is purely visual scaffolding | Anywhere semantics matter |

When introducing a non-obvious role, **cite the WAI-ARIA Authoring Practices section or the Radix pattern** in the PR body.

> **Counters:** PR #139 — `role="button"` on canvas workspace; PR #140 — `role="status"` on a static port marker.

### `aria-describedby` / `aria-labelledby` must point at rendered nodes

```tsx
// Wrong — id always set, target may not render
<input id={inputId} aria-describedby={`${inputId}-desc ${inputId}-msg`} />
{description ? <span id={`${inputId}-desc`}>…</span> : null}

// Right — id only set when target renders
<input
  id={inputId}
  aria-describedby={cn(description && `${inputId}-desc`, message && `${inputId}-msg`) || undefined}
/>
```

> **Counters:** PR #145 — `FormControl` composed `aria-describedby` with ids of unrendered nodes.

---

## Event handling — don't hijack what isn't yours

For container components (canvas, scrollers, keyboard-shortcut hosts):

- Before `event.preventDefault()` on wheel / key / pointer handlers, check `event.target` is not a nested scroll container or interactive element.
- Defer to nested handlers first; hijack only when the target is the container itself.
- Native scroll on a child should not be silenced by a container's wheel handler.

```tsx
function onWheel(e: React.WheelEvent) {
  const target = e.target as HTMLElement;
  if (target.closest("[data-canvas-passthrough]")) return; // descendant claims wheel
  if (isScrollableAncestor(target, e.currentTarget)) return;
  e.preventDefault();
  // … pan logic
}
```

> **Counters:** PR #139 — `canvas-view` globally `preventDefault`-ed wheel and stole arrow/zoom keys regardless of focus.

---

## Prop naming = trigger

Event-handler prop names map to the actual trigger. If `onSend` only fires on suggestion clicks, it's not `onSend` — it's `onSuggestionClick` (or `onSubmit` if it's the real submit).

When in doubt, qualify with the trigger noun.

> **Counters:** PR #150 — `onSend` only fired on suggestion clicks.

---

## Legacy props = legacy behavior

Keeping a prop **name** while changing its **layout/behavior** is a breaking change. Two options:

1. **Preserve** the documented behavior under the legacy name and add the new path under a new name.
2. **Rename** with a major bump and a migration note in `CHANGELOG.md` + the PR body.

Don't leave a prop that "still exists" but means something different.

> **Counters:** PR #141 — `leftRail` / `rightDock` / `bottomSlot` on `CanvasShell` kept as names but lost their grid/full-width layout contract.

---

## Code-style non-negotiables

- TypeScript strict via `@vllnt/typescript`. **No** `any`, `as`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`.
- Zod at boundaries (server actions, public APIs), not inside components.
- No inline `//` comments in shipped code — use TSDoc on exports, or refactor.
- Additive architecture: new feature → new file. Don't reflexively edit hub files (`index.ts`, `routes.ts`, global configs).
- Follow existing codebase patterns. If a pattern exists in 3+ files, use it.

---

## Hooks → `"use client"`

Any component that uses React hooks must start with `"use client"`. There is a CI test (`packages/ui/src/components/client-directives.test.ts`) that audits this. Don't suppress it — fix the directive.

> **Counters:** PR #138 / #143 / #144 — chart components were shipped without `"use client"`.

---

## Testing expectations

- Unit: Vitest + Testing Library (`*.test.tsx`).
- Visual: Playwright CT (`*.visual.tsx`) — real browser, no jsdom.
- Story: Storybook story (`*.stories.tsx`) for every shipped component.
- For UI changes: run unit + visual, or explicitly note which were skipped and why.
- For bug fixes: add a regression test that fails before the fix and passes after.

Visual regression baselines are **committed** to `packages/ui/.snapshots/`. Don't run `--update-snapshots` in CI; refresh locally and commit the diff.
