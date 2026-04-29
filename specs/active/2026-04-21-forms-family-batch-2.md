# Forms family batch 2

## Goal
Implement the remaining forms-family component issues in the `forms-family-batch-2` worktree:
- #47 Form — Validation Wrapper
- #53 MultiSelect
- #36 TagsInput
- #39 SegmentedControl

## Non-goals
- No commits, pushes, or PR creation in this pass
- No unrelated refactors outside forms-family scope
- No Storybook infra changes beyond what the new components require

## Constraints
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/forms-family-batch-2`
- Branch: `feat/forms-family-batch-2`
- Base: `feat/storybook`
- Follow repo-local `CLAUDE.md`
- Use existing component patterns in `packages/ui/src/components/`
- Include package component, exports, unit test, visual test, Storybook story, MDX docs, registry shim, registry entry, and preview wiring for each new component
- No `any`, `as`, `@ts-ignore`, `@ts-expect-error`, or `eslint-disable`
- Do not add new package dependencies unless a blocker makes it unavoidable; default path is to compose existing Radix / repo primitives only
- If Storybook sync or visual baselines generate artifacts needed for green validation, include those generated files in the worktree changes

## Likely files
- `packages/ui/src/components/form/form.tsx`
- `packages/ui/src/components/form/form.test.tsx`
- `packages/ui/src/components/form/form.visual.tsx`
- `packages/ui/src/components/form/form.stories.tsx`
- `packages/ui/src/components/form/form.mdx`
- `packages/ui/src/components/form/index.ts`
- `packages/ui/src/components/multi-select/multi-select.tsx`
- `packages/ui/src/components/multi-select/multi-select.test.tsx`
- `packages/ui/src/components/multi-select/multi-select.visual.tsx`
- `packages/ui/src/components/multi-select/multi-select.stories.tsx`
- `packages/ui/src/components/multi-select/multi-select.mdx`
- `packages/ui/src/components/multi-select/index.ts`
- `packages/ui/src/components/tags-input/tags-input.tsx`
- `packages/ui/src/components/tags-input/tags-input.test.tsx`
- `packages/ui/src/components/tags-input/tags-input.visual.tsx`
- `packages/ui/src/components/tags-input/tags-input.stories.tsx`
- `packages/ui/src/components/tags-input/tags-input.mdx`
- `packages/ui/src/components/tags-input/index.ts`
- `packages/ui/src/components/segmented-control/segmented-control.tsx`
- `packages/ui/src/components/segmented-control/segmented-control.test.tsx`
- `packages/ui/src/components/segmented-control/segmented-control.visual.tsx`
- `packages/ui/src/components/segmented-control/segmented-control.stories.tsx`
- `packages/ui/src/components/segmented-control/segmented-control.mdx`
- `packages/ui/src/components/segmented-control/index.ts`
- `packages/ui/src/components/index.ts`
- `packages/ui/src/index.ts`
- `apps/registry/registry/default/{component}/{component}.tsx`
- generated docs / preview artifacts from Storybook sync if validation requires them
- `apps/registry/registry.json`
- `apps/registry/components/component-preview/component-preview.tsx`

## Acceptance criteria
- AC-47.1: `Form` is implemented as a lightweight presentational validation wrapper using existing repo / Radix primitives only, with no new dependency required for core use.
- AC-47.2: `Form` exposes a clear API for label, description, control, and message composition, plus invalid state wiring via ARIA attributes.
- AC-47.3: `Form` ships with tests, Storybook coverage, visual coverage, and MDX docs demonstrating labels, descriptions, messages, and validation states.
- AC-53.1: `MultiSelect` supports controlled and uncontrolled multi-selection, disabled state, keyboard access, and selected-value display.
- AC-53.2: `MultiSelect` uses the existing repo primitive stack for its minimum viable interaction model; search/filter is optional and only included if it fits without widening scope.
- AC-53.3: `MultiSelect` ships with tests, Storybook coverage, visual coverage, and MDX docs for option rendering and selection behavior.
- AC-36.1: `TagsInput` supports controlled and uncontrolled tag arrays, add/remove flows from keyboard input, and disabled state.
- AC-36.2: `TagsInput` ships with tests, Storybook coverage, visual coverage, and MDX docs for add/remove flows.
- AC-39.1: `SegmentedControl` supports controlled and uncontrolled single-choice segmented selection with accessible keyboard navigation and disabled state.
- AC-39.2: `SegmentedControl` composes or closely follows existing toggle-group patterns instead of inventing a divergent primitive without reason.
- AC-39.3: `SegmentedControl` ships with tests, Storybook coverage, visual coverage, and MDX docs for controlled selection.
- AC-A11Y.1: Each component exposes accessible roles / ARIA behavior appropriate to its interaction model and includes targeted test assertions for that behavior.
- AC-ALL.1: Each component is exported from package entrypoints and available through registry shims.
- AC-ALL.2: Each component is added to registry metadata with an appropriate form-related category and preview wiring.
- AC-ALL.3: Storybook sync / registry build outputs required for passing validation are updated in the worktree.
- AC-ALL.4: Validation passes or skip reasons are explicitly documented.

## Validation commands
- `pnpm -F @vllnt/ui lint`
- `pnpm exec tsc --noEmit -p packages/ui/tsconfig.json`
- `pnpm -F @vllnt/ui test:once`
- `pnpm -F @vllnt/ui build`
- `pnpm -F @vllnt/ui build-storybook`
- `pnpm -F @vllnt/ui test:visual` (or `test:visual:update` first if new baselines are required)
- `pnpm -F @vllnt/ui-registry sync-storybook`
- `pnpm -F @vllnt/ui-registry registry:build`
- `pnpm -F @vllnt/ui-registry build`

## Task slices
- Slice 1: discover existing form-adjacent patterns and choose implementation shape for all 4 components
- Slice 2: implement `Form`
- Slice 3: implement `MultiSelect`
- Slice 4: implement `TagsInput`
- Slice 5: implement `SegmentedControl`
- Slice 6: wire exports, registry entries, and preview support
- Slice 7: run validation, review findings, and fix blockers
