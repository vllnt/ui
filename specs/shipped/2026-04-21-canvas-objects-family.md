# Canvas objects family

## Goal
Implement issue #133: **Spatial objects & durable views — object card, edges, groups, ports**.

## Worktree context
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/canvas-objects-family`
- Branch: `feat/canvas-objects-family`
- Base: `feat/storybook`

## Product direction
Build durable AI/runtime object views rather than generic dashboard cards.

## Minimum serious v0 ownership
- `ObjectCard`
- `ConnectorEdge`
- `EdgeLabel`
- `GroupHull`
- `AnchorPort`
- `ObjectHandle`

## Explicit non-duplicates
Do not duplicate or merely re-skin:
- existing `Card` variants (`Card`, `StatCard`, `ProgressCard`, `SubscriptionCard`, `WalletCard`, `TutorialCard`)
- `FlowDiagram`
- timeline family issues (`#32`, `#33`, `#34`, `#35`, `#63`, `#64`)
- `AI Artifact / Canvas` issue `#56` — compose with it rather than absorb it

## Acceptance criteria
- define a product-object contract for cards, edges, handles, and groups
- define how objects expose live state, metadata, and action affordances
- define grouping and connection semantics for runs, artifacts, tasks, agents, and outputs
- bias toward durable object views rather than generic canvas decoration

## Likely files
- `packages/ui/src/components/object-card/*`
- `packages/ui/src/components/connector-edge/*`
- `packages/ui/src/components/edge-label/*`
- `packages/ui/src/components/group-hull/*`
- `packages/ui/src/components/anchor-port/*`
- `packages/ui/src/components/object-handle/*`
- registry shims and preview wiring for each shipped component

## Validation gates
- `pnpm -F @vllnt/ui lint`
- `pnpm -F @vllnt/ui test:once`
- `pnpm -F @vllnt/ui build`
- `pnpm -F @vllnt/ui build-storybook`
- `pnpm -F @vllnt/ui-registry sync-storybook`
- `pnpm -F @vllnt/ui-registry registry:build`
- `pnpm -F @vllnt/ui-registry build`
