# Icon system family

## Goal
Define and stage a **system icon family** for `@vllnt/ui` so product UI stops depending on scattered raw icon imports and gains a stable icon layer for actions, status, navigation, and shared object glyphs.

## Related issue
- #124 feat(icon-family): System icons — actions, status, nav, object glyphs

## Constraints
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/icon-system-family`
- Branch: `feat/icon-system-family`
- Base: `feat/storybook`
- Follow repo-local `CLAUDE.md`
- Keep this PR scoped to **spec + rollout plan**, not full implementation
- Do not add dependencies in this planning pass

## Problem statement
The repo already uses many direct `lucide-react` imports. That works tactically, but there is no shared contract for system icon usage, no typed family export, no sizing/stroke policy, and no migration plan. That makes the design language inconsistent and blocks a more opinionated product surface.

## Proposed scope
- actions: add, remove, edit, copy, share, search, filter, sort, export
- navigation: back, forward, up, down, external, panel expand/collapse
- status: success, warning, error, pending, paused, live
- object glyphs: app, project, workspace, collection, node, document, task
- shared icon wrapper contract for size, tone, and emphasis

## Acceptance criteria
- AC-1: define the system icon family categories and naming rules
- AC-2: define size/stroke/tone tokens for the family
- AC-3: define a package export shape and migration strategy away from scattered raw imports where appropriate
- AC-4: define Storybook + registry coverage expectations
- AC-5: keep scope tight enough that implementation can be split into a dedicated follow-up PR

## Likely implementation files later
- `packages/ui/src/icons/system/*`
- `packages/ui/src/icons/index.ts`
- `packages/ui/src/components/icon/*` or an equivalent wrapper layer
- `packages/ui/src/index.ts`
- `apps/registry/registry/default/...` for gallery examples
- `apps/registry/registry.json`

## Validation for this PR
- docs-only review
- `git diff --check`

## Rollout notes
- Start with a minimal stable subset, not a giant icon dump
- Preserve direct component-level imports where wrapping adds no value
- Use the icon family where a semantic product meaning matters more than raw glyph access
