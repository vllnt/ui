# Canvas foundation family

## Goal
Implement issue #132: **Infinite canvas foundation & operator chrome — shell, rail, dock, viewport**.

## Worktree context
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/canvas-foundation-family`
- Branch: `feat/canvas-foundation-family`
- Base: `feat/storybook`

## Product direction
This family must create a **calm operating surface** and **minimal spatial control plane**.

It should feel like:
- a calm operating surface
- a spatial workspace for real AI objects
- a minimal control plane for tasks, runs, and outputs

It must not feel like:
- a bloated dashboard
- a pure whiteboard
- a chatbot wrapper

## Minimum serious v0 ownership
- `TopBar`
- `LeftRail`
- `CanvasView`
- `RightDock`
- `WorkspaceSwitcher`
- `CanvasShell`
- `InfinitePlane`
- `MiniMapPanel`
- `ZoomHUD`
- `ViewportBookmarks`
- `WorldBreadcrumbs`

## Explicit non-duplicates
Do not duplicate or merely re-skin:
- `FlowDiagram`
- `NavbarSaas`
- `Sidebar` / `SidebarToggle`
- `ViewSwitcher` — extend/compose instead of fork if useful
- `SearchBar` / `SearchDialog`
- `TableOfContentsPanel`
- maps family issues (`#28`, `#29`, `#30`, `#31`, `#60`, `#61`, `#62`, `#68`)
- `AI Artifact / Canvas` issue `#56`
- `Command / Spotlight` issue `#8` and existing `Command`
- internal behavior of `BottomActivityStrip` — hosted here, owned by runtime family `#136`

## Acceptance criteria
- define operator chrome: top bar, left rail, right dock, and workspace switching behavior
- define viewport model, panning/zoom, saved views, and minimap behavior
- define keyboard + pointer interaction rules for canvas movement
- define how command palette access fits into the shell without adding clutter
- define how this family hosts runtime/activity surfaces from adjacent families without absorbing them
- stay product-canvas oriented, not diagram-editor generic

## Likely files
- `packages/ui/src/components/canvas-shell/*`
- `packages/ui/src/components/top-bar/*`
- `packages/ui/src/components/left-rail/*`
- `packages/ui/src/components/right-dock/*`
- `packages/ui/src/components/workspace-switcher/*`
- `packages/ui/src/components/mini-map-panel/*`
- `packages/ui/src/components/zoom-hud/*`
- registry shims and preview wiring for each shipped component

## Validation gates
- `pnpm -F @vllnt/ui lint`
- `pnpm -F @vllnt/ui test:once`
- `pnpm -F @vllnt/ui build`
- `pnpm -F @vllnt/ui build-storybook`
- `pnpm -F @vllnt/ui-registry sync-storybook`
- `pnpm -F @vllnt/ui-registry registry:build`
- `pnpm -F @vllnt/ui-registry build`
