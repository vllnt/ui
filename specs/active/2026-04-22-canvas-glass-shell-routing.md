# Canvas glass shell + routed bars implementation plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn the current canvas foundation into a configurable four-sided shell with routed dynamic panels, a calm overview landing state, and floating Apple-glass-inspired chrome.

**Architecture:** Keep the system simple: one `CanvasShell` owns spatial layout, each side surface is a configurable slot, and route-aware composition happens outside the primitive in a small shell config layer. The center stays the primary work surface; sidebars are independent floating surfaces above the canvas, not fused into a dashboard frame.

**Tech Stack:** React 19, TypeScript, Tailwind, existing `CanvasShell` / `CanvasView` / `TopBar` / `LeftRail` / `RightDock` primitives, Storybook visual tests.

---

## What exists now

Current family already provides:
- `CanvasShell` with `topBar`, `leftRail`, `rightDock`, `bottomSlot`
- `CanvasView` for viewport pan/zoom
- `TopBar`, `LeftRail`, `RightDock`, `MiniMapPanel`, `ZoomHUD`, `WorkspaceSwitcher`
- demo composition in `packages/ui/src/components/canvas-shell/canvas-foundation-demo.tsx`

Current gaps versus the requested product:
- shell surfaces are welded to the frame instead of floating independently
- no formal route-aware config model for swapping bar content
- no canonical bottom bar component, only `bottomSlot`
- center landing state is still loose cards on an infinite field, not a clear system overview
- no explicit glass theme tokens / wrappers for shell chrome
- no opinionated place for chat

## Product decisions

### 1. Keep the shell primitive dumb
Do not make `CanvasShell` know routing.

Instead:
- `CanvasShell` stays a layout primitive with configurable slots
- add a small routed composition layer that maps route -> shell config
- app/router code chooses which bars to render

This keeps `@vllnt/ui` portable and understandable.

### 2. Use four explicit side surfaces
Treat the shell as:
- top bar
- left bar
- right bar
- bottom bar
- middle canvas

Replace `bottomSlot` naming with a real bottom bar API while keeping backward compatibility during migration.

### 3. Make shell chrome float above the canvas
Apple-glass direction should mean:
- bars are visually separate surfaces
- subtle translucency
- soft border
- backdrop blur
- independent corner radii and spacing
- visible breathing room between bars and canvas edges

Do **not** make the whole app a giant glass blob.
Use small floating surfaces, not one fused glass rectangle.

### 4. Center default state should be an overview board, not a whiteboard
When the user lands with no focused object, the center should show a structured overview cluster:
- inbox items
- actions awaiting review
- errors / incidents count
- stale runs / failing jobs
- tasks ahead / today focus
- quick entry points

This should feel like a calm mission control overview.
Not a dense dashboard grid.
Not draggable cards by default.

### 5. Chat belongs in the right bar
Default recommendation:
- chat is a right-bar section or tab
- object context / task context / logs can sit under or alongside it
- chat should not occupy the center by default
- chat should not live in the top bar

Reason:
- center is for primary work and overview
- right bar is for contextual assistance and drill-down

---

## Proposed component model

### Keep and evolve
- `CanvasShell`
- `CanvasView`
- `TopBar`
- `LeftRail`
- `RightDock`
- `MiniMapPanel`
- `ZoomHUD`
- `WorkspaceSwitcher`

### Add
- `BottomBar`
- `GlassPanel`
- `OverviewBoard`
- `OverviewCard`
- `ChatDockSection`
- `CanvasShellRouteConfig` types/helpers
- `CanvasShellFrame` or `OperatorCanvasShell` composition component

### Recommended ownership split

#### Primitive layer in `@vllnt/ui`
Pure presentational/layout primitives:
- `CanvasShell`
- `TopBar`
- `LeftRail`
- `RightDock`
- `BottomBar`
- `GlassPanel`
- `OverviewBoard`
- `OverviewCard`
- `ChatDockSection` (optional if kept generic enough)

#### Composition layer in app/registry or app code
Route-aware logic:
- map pathname -> active shell config
- decide which left/right/bottom panels are shown
- choose overview vs object-focused center content

---

## File plan

### Core primitive updates
- Modify: `packages/ui/src/components/canvas-shell/canvas-shell.tsx`
- Create: `packages/ui/src/components/bottom-bar/bottom-bar.tsx`
- Create: `packages/ui/src/components/glass-panel/glass-panel.tsx`
- Modify: `packages/ui/src/components/top-bar/top-bar.tsx`
- Modify: `packages/ui/src/components/left-rail/left-rail.tsx`
- Modify: `packages/ui/src/components/right-dock/right-dock.tsx`
- Modify: `packages/ui/src/components/canvas-view/canvas-view.tsx`

### Overview / landing state
- Create: `packages/ui/src/components/overview-board/overview-board.tsx`
- Create: `packages/ui/src/components/overview-card/overview-card.tsx`

### Chat
- Create: `packages/ui/src/components/chat-dock-section/chat-dock-section.tsx`

### Types / composition helpers
- Create: `packages/ui/src/components/canvas-shell/canvas-shell-route-config.ts`
- Possibly create: `packages/ui/src/components/canvas-shell/operator-canvas-shell.tsx`

### Demo / stories / tests
- Modify: `packages/ui/src/components/canvas-shell/canvas-foundation-demo.tsx`
- Modify: `packages/ui/src/components/canvas-shell/canvas-shell.stories.tsx`
- Modify: `packages/ui/src/components/canvas-shell/canvas-shell.visual.tsx`
- Add story/test files for new components

---

## Design rules for the new shell

### Layout rules
- outer shell provides full available area
- canvas remains the only element that owns the full middle plane
- bars float inside shell padding above the canvas
- bars do not touch each other unless intentional in a narrow layout
- each bar can be omitted independently

### Spacing rules
Recommended default inset spacing:
- `top`: 16px from shell edge
- `left/right`: 16px from shell edge
- `bottom`: 16px from shell edge
- `top` to `left/right` should visually stack with 12–16px gap

### Glass rules
Use glass sparingly:
- background: `bg-background/70` or `bg-background/60`
- blur: `backdrop-blur-xl`
- border: `border border-border/60`
- shadow: small soft shadow only
- radius: one consistent medium radius token

Avoid:
- heavy opacity tricks
- saturated gradients everywhere
- giant shadow stacks
- nested glass inside glass unless one is clearly subordinate

### Overview rules
Overview center should be:
- one primary board cluster centered in viewport
- 4–6 cards max in default state
- grouped by urgency / status, not random masonry
- obvious click targets into actual work routes

Suggested cards:
- `Inbox`
- `Awaiting action`
- `Errors`
- `Runs at risk`
- `Today`
- `Recent changes`

### Dynamic routing rules
Example route-to-shell config:
- `/app` or `/workspace`:
  - top bar: workspace + global actions
  - left bar: mode switcher
  - right bar: chat + context
  - bottom bar: status / activity / command hints
  - center: overview board
- `/workspace/objects/:id`:
  - center: object scene / detail workspace
  - right bar: object context + chat
- `/workspace/runs/:id`:
  - center: run timeline or output
  - right bar: logs + chat

The key rule:
- route changes shell content
- route does not change the shell mental model

---

## Recommended implementation sequence

### Task 1: Refactor `CanvasShell` API for four explicit sides
**Objective:** Make the shell formally support top, left, right, and bottom bars as first-class regions.

**Files:**
- Modify: `packages/ui/src/components/canvas-shell/canvas-shell.tsx`
- Test/story files nearby

**Steps:**
1. Add a `bottomBar` prop.
2. Keep `bottomSlot` temporarily as deprecated compatibility input.
3. Normalize rendering so `bottomBar ?? bottomSlot` is used.
4. Add shell padding/inset support so floating chrome becomes possible.
5. Keep behavior backward compatible.

### Task 2: Add `GlassPanel`
**Objective:** Create one reusable glass wrapper for all floating shell chrome.

**Files:**
- Create: `packages/ui/src/components/glass-panel/glass-panel.tsx`
- Create stories/tests

**Steps:**
1. Build a generic panel with consistent radius, border, blur, and translucent background.
2. Support size/className only; avoid variants until needed.
3. Use it in demo wrappers for shell bars.

### Task 3: Introduce a real `BottomBar`
**Objective:** Replace ad hoc bottom content with a clear bottom-bar primitive.

**Files:**
- Create: `packages/ui/src/components/bottom-bar/bottom-bar.tsx`
- Add stories/tests

**Steps:**
1. Support left, center, right content zones.
2. Make it readable with short status items and quick actions.
3. Keep it compact.

### Task 4: Make bars float independently
**Objective:** Move top/left/right/bottom bars visually off the shell edges and onto floating surfaces.

**Files:**
- Modify: `canvas-shell.tsx`
- Modify: `top-bar.tsx`
- Modify: `left-rail.tsx`
- Modify: `right-dock.tsx`
- Modify: `bottom-bar.tsx`

**Steps:**
1. Add an inner absolute/floating chrome layer over the canvas.
2. Keep center canvas full-size under it.
3. Ensure side surfaces remain pointer-interactive.
4. Avoid overcomplicated responsive behavior in v1.

### Task 5: Add `OverviewBoard` + `OverviewCard`
**Objective:** Define the default landing state for the center canvas.

**Files:**
- Create: `overview-board.tsx`
- Create: `overview-card.tsx`
- Add stories/tests

**Steps:**
1. Build a centered responsive cluster.
2. Cards accept title, count, tone, description, and CTA.
3. Keep copy terse and operational.

### Task 6: Add routed shell config types
**Objective:** Create a simple config model for route-driven shell composition.

**Files:**
- Create: `packages/ui/src/components/canvas-shell/canvas-shell-route-config.ts`

**Suggested type shape:**
```ts
export type CanvasShellRouteConfig = {
  bottomBar?: React.ReactNode;
  center: React.ReactNode;
  leftBar?: React.ReactNode;
  rightBar?: React.ReactNode;
  topBar?: React.ReactNode;
};
```

Optional helper:
```ts
export function resolveCanvasShellRouteConfig(route: string): CanvasShellRouteConfig
```

Do not bake router dependencies into `@vllnt/ui`.
Pass route strings or resolved config from app code.

### Task 7: Add `ChatDockSection`
**Objective:** Establish the simplest correct chat placement.

**Files:**
- Create: `packages/ui/src/components/chat-dock-section/chat-dock-section.tsx`

**Rules:**
- header with assistant/context label
- message list area
- compact composer
- optional context badge for selected object/run
- designed for right-dock embedding

### Task 8: Rebuild demo around the new model
**Objective:** Make the demo reflect the intended product, not just primitive existence.

**Files:**
- Modify: `packages/ui/src/components/canvas-shell/canvas-foundation-demo.tsx`

**New demo should show:**
- floating top, left, right, bottom bars
- center overview board on landing
- right dock with chat section + context section
- bottom bar with status / errors / quick actions
- glass treatment on shell chrome only

### Task 9: Update visual tests
**Objective:** Lock the new shell direction with screenshot coverage.

**Files:**
- Modify: `canvas-shell.visual.tsx`
- Add visuals for overview board and bottom bar if needed

### Task 10: Registry/demo docs
**Objective:** Make the pattern discoverable and understandable.

**Files:**
- Stories / registry files for new components

**Docs should explain:**
- shell is route-configured
- center is overview by default
- chat belongs in right dock
- bars are floating glass chrome, not fused sidebars

---

## Simple recommendation on chat

### Best default
Put chat in the **right bar**.

### Why
- it stays contextual
- it does not steal the center canvas
- it stays near object/run/task detail
- it can collapse without changing the core spatial model

### Simple structure
Right bar sections in order:
1. `Chat`
2. `Selected context` or `Object focus`
3. `Actions / logs / notes`

That is easier to understand than making chat a center-card or a bottom console.

---

## Simple recommendation on overview landing

When no specific route target is selected, center content should be a board like:
- `Inbox` — pending items
- `Awaiting action` — approvals / reviews
- `Errors` — failures needing attention
- `Runs` — unhealthy or stale runs
- `Today` — prioritized tasks

Each card opens a route or narrows focus.

This gives the user immediate operational orientation.

---

## Validation gates
Run after implementation:
- `pnpm -F @vllnt/ui exec eslint src/components/canvas-shell src/components/top-bar src/components/left-rail src/components/right-dock src/components/canvas-view src/components/bottom-bar src/components/glass-panel src/components/overview-board src/components/chat-dock-section`
- `pnpm -F @vllnt/ui test:once`
- `pnpm -F @vllnt/ui test:visual`
- `pnpm -F @vllnt/ui build`

If registry wiring is updated:
- `pnpm -F @vllnt/ui-registry build`

---

## Bottom line
The right move is **not** to make the current shell more dashboard-like.
The right move is:
- keep one clear shell mental model
- make all four bars first-class and configurable
- make those bars route-driven in composition, not in the primitive
- use floating glass chrome around a calm center canvas
- make the center landing state an overview board
- place chat in the right bar
