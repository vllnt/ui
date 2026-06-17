# Component Conventions

Authoritative pattern catalog for every component in `packages/ui/src/components/`. Rules here are referenced from [`RULES.md`](./RULES.md).

---

## Folder layout

Every component lives at `packages/ui/src/components/{name}/`:

```
{name}/
  {name}.tsx         # implementation — ref-as-prop + CVA + cn()
  {name}.test.tsx    # Vitest unit tests
  {name}.visual.tsx  # Playwright CT story (real Chromium)
  {name}.stories.tsx # Storybook story (default export + named stories)
  {name}.mdx         # registry/docs (auto-generated where possible)
  index.ts           # barrel export from the folder
```

Add the export to `packages/ui/src/index.ts`.

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
