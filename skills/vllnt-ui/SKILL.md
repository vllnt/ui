---
name: vllnt-ui
description: |
  How to consume and build with @vllnt/ui (VLLNT UI) and follow the VLLNT design
  system. Use when:
  (1) installing, importing, or theming @vllnt/ui in a React/Next.js app
  (2) choosing the right component for a UI need
  (3) writing styles that must obey the design tokens (color, type, spacing, motion)
  (4) authoring or editing a component inside the vllnt/ui monorepo
  Triggers: "@vllnt/ui", "vllnt ui", "vllnt design system", "design tokens",
  "which component", "tailwind preset", "shadcn registry", "use client".
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash(pnpm:*)
  - Bash(git diff:*)
  - WebFetch
---

# VLLNT UI — usage + design system

**Core values**: @_shared/vllnt-core-values.md
**Operating principles**: @_shared/vllnt-operating-principles.md
**Web quality**: @_shared/web-quality.md

`@vllnt/ui` (brand name **VLLNT UI**, always two words) is a React component
library: 200+ accessible components built on **Radix UI** primitives,
**Tailwind CSS**, and **CVA** (class-variance-authority). Shipped on public npm
and as a shadcn-compatible registry at `https://ui.vllnt.ai/r`.

- Docs: https://ui.vllnt.ai · Storybook: https://storybook.vllnt.ai
- npm: https://www.npmjs.com/package/@vllnt/ui
- Machine docs: `llms.txt` / `llms-full.txt` at repo root

The **design system is canonical in `DESIGN.md`**. Every UI suggestion must obey
it. This skill is a **table of contents**: it keeps the stable design rules
inline and points to live sources for anything that changes (the component set).

---

## Live references (canonical — fetch on demand)

The component set changes; the design rules don't. Hardcoded lists go stale —
**fetch these with WebFetch** when you need current truth:

| Need | URL | Form |
|------|-----|------|
| Full component list / TOC | `https://ui.vllnt.ai/r/registry.json` | JSON — `items[]` with `name`, `title`, `description` |
| Browse a component (props, demos) | `https://ui.vllnt.ai/components` · `…/components/{slug}` | HTML |
| Install one component | `https://ui.vllnt.ai/r/{name}.json` | JSON (shadcn) |
| Design system (canonical) | `https://ui.vllnt.ai/DESIGN.md` | Markdown (raw) |
| AI orientation (short) | `https://ui.vllnt.ai/llms.txt` | text |
| AI deep reference (full) | `https://ui.vllnt.ai/llms-full.txt` | text |

Rules:
- "What components exist?" / "is there an X component?" → fetch `/r/registry.json`
  and read `items[].name`. **Do not answer the component list from memory.**
- Need exact props / a11y map / examples → fetch the component page or its `.tsx`.
- Need a design decision not covered below → fetch `https://ui.vllnt.ai/DESIGN.md`.
- For human-readable browsing use `https://ui.vllnt.ai/design`. If `/DESIGN.md` is
  unreachable, fall back to `https://raw.githubusercontent.com/vllnt/ui/main/DESIGN.md`.

---

## When to use

| Situation | Do |
|-----------|-----|
| Adding @vllnt/ui to an app | Install + setup (below) |
| Building a screen | Pick component via the selection table, compose with variant props |
| Styling anything | Use semantic tokens only — never raw colors. See **Banned** |
| Editing a component in this repo | Read **Authoring in the monorepo** first |

---

## Install & setup (consumer app)

```bash
pnpm add @vllnt/ui
# peers (required):
pnpm add react react-dom tailwindcss
# optional — only for ThemeProvider / Next-specific components:
pnpm add next next-themes
```

Peer ranges: `react >=18`, `react-dom >=18`, `tailwindcss >=3`. `next` and
`next-themes` are optional peers.

**1. Tailwind preset** — pulls in theme colors, animations, content paths,
class-based dark mode (`darkMode: ["class"]`) and `tailwindcss-animate`:

```ts
// tailwind.config.ts
import uiPreset from "@vllnt/ui/tailwind-preset";

export default {
  presets: [uiPreset], // auto-includes @vllnt/ui content paths
};
```

**2. Import styles once** (app entry / root layout):

```ts
import "@vllnt/ui/styles.css"; // Tailwind base + theme variables + safe-area utils
```

Use `@vllnt/ui/themes/default.css` instead if you want **only** the CSS
variables without the Tailwind base layer.

**3. Use components:**

```tsx
import { Button, Card, Badge, cn } from "@vllnt/ui";

export function Example() {
  return (
    <Card className="p-6">
      <Badge variant="secondary">New</Badge>
      <Button variant="default" size="lg">Save changes</Button>
    </Card>
  );
}
```

### Export surface

| Import path | What |
|-------------|------|
| `@vllnt/ui` | All components, hooks, types, and the `cn()` utility |
| `@vllnt/ui/tailwind-preset` | Tailwind preset config |
| `@vllnt/ui/styles.css` | Tailwind base + theme variables + utilities |
| `@vllnt/ui/themes/default.css` | Theme CSS variables only |

`cn()` merges Tailwind classes via `clsx` + `tailwind-merge` — use it to combine
a component's `className` with conditional classes (last class wins on conflict).

### Theming / dark mode

Colors are **HSL CSS variables**. Override after importing styles. Dark mode is
class-based — put `class="dark"` on `<html>`/`<body>` (or drive it with
`next-themes`):

```css
:root      { --background: 0 0% 100%; --foreground: 240 10% 4%; /* … */ }
.dark      { --background: 240 10% 4%; --foreground: 0 0% 98%;  /* … */ }
```

---

## Component selection guide

Pick by intent, not by looks (from `DESIGN.md` §10):

| Need | Component |
|------|-----------|
| Inline action | `Button` |
| Binary choice | `Switch` |
| One of N | `Select` (≤8) or `Combobox` (>8 / searchable) |
| Many of N | `MultiSelect` |
| Free text | `Input` (1 line) / `Textarea` |
| Confirm destructive | `AlertDialog` |
| Confirm informational | `Dialog` |
| Side panel | `Sheet` |
| Hover help (≤80 chars) | `Tooltip` |
| Stepper / wizard | `Stepper` |
| Tabular data | `DataTable` |
| Hierarchical data | `TreeView` |
| Status chip | `Badge` |
| Transient notification | `Toast` |
| Persistent notification | `Banner` |
| Empty state | `EmptyState` |

This table is the **common picks**, not the full set — fetch
`https://ui.vllnt.ai/r/registry.json` (`items[].name`) for everything. Families:
Primitives, Layout, Forms, Feedback, Navigation, Data/Charts, AI, Financial,
Ops/Status, Billing & Plans, Animation, Content, Tutorial/Educational, App Shell.

### Variant API pattern

Components expose variants via CVA props plus an escape-hatch `className`.
`asChild` (Radix `Slot`) renders the child element instead of the default tag.

```tsx
// Button: variant ∈ default|destructive|outline|secondary|ghost|link
//         size    ∈ default|sm|lg|icon
<Button variant="outline" size="sm">Cancel</Button>

// asChild — render as a link, keep button styling:
<Button asChild><a href="/docs">Docs</a></Button>
```

Prefer variant/size props over hand-rolled classes. Add `className` only for
layout (margins, width), and let `cn()` resolve conflicts.

---

## Design tokens (must obey)

| Axis | Rule |
|------|------|
| Color | Semantic tokens only: `bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`, `border-border`, `ring-ring`, `bg-accent`, `bg-destructive`. WCAG AA contrast (≥4.5:1 body, ≥3:1 large/non-text). |
| Type | Headings `font-semibold` (600) — **never** `font-bold`. Body 400. Mono via `font-mono`. Tabular nums for data: `tabular-nums`. |
| Spacing | 4-pt scale → Tailwind `1/2/3/4/6/8/12/16`. Never arbitrary `gap-[7px]`. One axis: `gap-x-N` / `gap-y-N`. |
| Radius | `rounded-md` (8px) default for cards/popovers/dialogs; `rounded-full` pills/avatars; `rounded-lg` panels/sheets. |
| Elevation | Mostly flat: `border` + `bg-background`. `shadow-lg` only for popovers/dialogs. No colored/glow shadows. |
| Motion | <200ms, `ease-out`, translate <8px / scale ±2%. No bounce easings. Respect `prefers-reduced-motion`. |
| Icons | `lucide-react` only, 16px (`h-4 w-4`), `currentColor`, `gap-2` from text. |

### Banned (BLOCKING — never emit)

| Pattern | Why | Use instead |
|---------|-----|-------------|
| `bg-black` / `bg-white` / `text-white` / `#000` bg | Breaks dark mode | `bg-background` / `bg-foreground` / `text-foreground` |
| Tailwind palette literals (`bg-zinc-500`, `text-gray-400`) | Bypasses tokens | A semantic token |
| `font-bold` on display headings | Crushes letterforms | `font-semibold` |
| `<div onClick>` | Loses keyboard + a11y | `Button` |
| Bounce easings | Visual noise | `ease-out` / `ease-in-out` |
| `Submit` / `OK` / `Click here` labels | Doesn't name the action | The verb: "Save changes", "Send invite" |
| Tooltip on a `disabled` button | Browser swallows events | Wrap in `<span aria-disabled>` |
| Modal on modal | — | Restructure the flow |
| `eslint-disable` to pass a rule | Hides the real issue | Fix the root cause |

### Accessibility (WCAG AA minimum)

Keyboard-reachable interactions; visible focus ring (`--ring`, never bare
`outline-none`); inputs labelled (`<label>`/`aria-label`); live regions for async
state (`aria-live="polite"` toasts, `assertive` errors); color is never the only
signal — pair with icon/text.

The **enforcement gate** for consuming apps — axe-core zero violations + a
keyboard-only pass + the Lighthouse a11y score — is owned by the `accessibility`
skill (`@_shared/web-quality.md` → Accessibility). VLLNT UI ships accessible
primitives; that skill verifies the app keeps them accessible in use.

### Copy / voice

Sentence case. Name the action on buttons. Errors state what happened + what to
do. Empty states explain why empty + the unblock. `…` glyph, not `...`. No emoji
in shipped UI.

---

## shadcn registry (copy a single component)

```bash
pnpm dlx shadcn@latest add https://ui.vllnt.ai/r/{component}.json
```

Copy-paste model: you own the resulting file. Still obey the design tokens above.

---

## Authoring in the vllnt/ui monorepo

Only when editing inside this repo (not for app consumers).

- **`"use client";` first line** whenever a component file imports *any* React
  hook — including `useMemo`, `useId`, `useSyncExternalStore`. Validate with
  `pnpm -F @vllnt/ui check:use-client`.
- **Barrel exports are sort-ordered.** After adding an export to
  `packages/ui/src/components/index.ts`, grep to confirm it landed, then run the
  **full** package lint — changed-file-only lint misses the sort rule and CI
  fails: `pnpm -F @vllnt/ui lint`.
- **Component file layout:** `{name}/{name}.tsx` (+ `.test.tsx`, `.stories.tsx`).
  Define variants with `cva`, expose `VariantProps`, merge with `cn`, forward
  refs, support `asChild` where a wrapper element makes sense.
- **Tokens, not literals** — the design rules above are enforced in review.
- **Don't hand-edit generated files** (`apps/registry/lib/component-metadata.json`,
  `dist/`). Regenerate via the documented script.
- **Workspace gates green at HEAD before ship:**
  `pnpm -F @vllnt/ui lint && pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json && pnpm build && pnpm test:once`.

---

## Sources of truth

Live URLs → see **Live references** at the top. Repo-local files (when working
inside the monorepo):

| For | Read |
|-----|------|
| Design rules (canonical) | `DESIGN.md` |
| Setup, theming, full component tables | `packages/ui/README.md` |
| Agent conventions / PR rules | `AGENTS.md`, `docs/agents/` |
| Exact component API | the component's `.tsx` source |
