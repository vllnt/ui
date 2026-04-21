# Icon canvas family

## Goal
Define and stage a **canvas icon family** for `@vllnt/ui` aimed at spatial, collaborative, node-based interfaces so the design system can evolve from traditional SaaS screens into a living-canvas product surface.

## Related issue
- #127 feat(icon-family): Canvas icons — nodes, edges, cursors, collaboration

## Constraints
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/icon-canvas-family`
- Branch: `feat/icon-canvas-family`
- Base: `feat/storybook`
- Follow repo-local `CLAUDE.md`
- Keep this PR scoped to **spec + rollout plan**, not full implementation
- No new dependencies in this planning pass

## Problem statement
Spatial UI needs different iconography than standard SaaS chrome. Toolbars, inspectors, minimaps, comments, handles, cursors, and graph controls need a coherent canvas language. Today the repo has none.

## Proposed icon scope
- spatial tools: pan, select, hand, frame, zoom, fit, align, distribute
- graph objects: node, edge, branch, group, cluster, lane, portal
- collaboration: cursor, presence, follow, handoff, comment pin, mention beacon
- canvas states: selected, anchored, locked, snap, guide, draft, live
- navigation/viewport: minimap, breadcrumbs, split view, focus lens, timeline scrubber

## Proposed companion component set
- `CanvasShell`
- `FloatingToolbar`
- `InspectorPanel`
- `LayerRail`
- `NodeCard`
- `EdgeLabel`
- `MiniMapPanel`
- `PresenceStack`
- `CommandDock`
- `CanvasBreadcrumbs`
- `ContextLens`
- `StickyMetric`
- `LiveCursor`
- `SelectionHalo`
- `SnapGuides`
- `CommentPin`
- `TimelineScrubber`
- `ViewportTabs`

## Acceptance criteria
- AC-1: define canvas icon categories and naming rules
- AC-2: define how icons pair with spatial UI components and interaction states
- AC-3: define package export shape and usage rules for toolbars, inspectors, nodes, and collaboration surfaces
- AC-4: define Storybook + registry coverage expectations
- AC-5: keep the family opinionated toward living-canvas UI rather than generic dashboard chrome

## Likely implementation files later
- `packages/ui/src/icons/canvas/*`
- `packages/ui/src/icons/index.ts`
- registry examples for canvas toolbar, inspector panel, node card, and collaboration UI
- future component worktrees for the companion spatial component family

## Validation for this PR
- docs-only review
- `git diff --check`

## Rollout notes
- Build this family alongside the first spatial primitives, not as an isolated art exercise
- Prioritize collaboration and object-manipulation glyphs over generic dashboard symbols
- Treat the icon family as part of the product interaction model, not decoration
