# Registry preview theme modes

## Goal
Add dark and light preview handling to the ui registry component preview so the embedded Storybook preview can be viewed in either theme from the registry page.

## Non-goals
- No changes to package component implementations
- No broad Storybook theme system rewrite
- No unrelated registry layout refactor

## Constraints
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/registry-preview-theme-modes`
- Branch: `feat/registry-preview-theme-modes`
- Base: `feat/storybook`
- Follow repo-local `CLAUDE.md`
- Stay inside registry / Storybook embed scope only
- No new dependencies unless a real blocker appears

## Problem statement
The registry component page embeds Storybook in a single iframe URL with no explicit theme control. The registry app itself supports dark/light themes, but the embedded preview does not reliably expose or follow both modes from the component page.

## Acceptance criteria
- AC-1: The registry component preview exposes clear dark/light theme controls on the component page.
- AC-2: The embedded Storybook iframe updates to the selected theme through the iframe URL contract, using Storybook globals in the iframe URL rather than cross-origin postMessage state sync.
- AC-3: The preview defaults to the current resolved registry theme on first useful client render and avoids obvious theme mismatch behavior.
- AC-4: The solution works for component pages that already embed Storybook and does not widen scope to unrelated pages.
- AC-5: The implementation remains compatible with the existing Storybook addon-themes setup and does not require a Storybook config rewrite.
- AC-6: Validation covers the UI change with lint/build plus explicit manual verification notes if no dedicated registry UI test harness exists.

## Likely files
- `apps/registry/components/storybook-embed/storybook-embed.tsx`
- `apps/registry/app/components/[slug]/page.tsx`
- possible shared preview control component under `apps/registry/components/`
- possible targeted test file under `apps/registry/components/storybook-embed/` if test infra exists there

## Validation commands
- `pnpm -F @vllnt/ui-registry lint`
- `pnpm -F @vllnt/ui-registry build`
- if a targeted test is added, run that test command too
- manual verification: confirm the component page preview can switch between light and dark and the standalone Storybook link can preserve the selected preview theme if we choose to propagate it

## Task slices
- Slice 1: inspect current Storybook embed + registry theme wiring and choose the URL/global theme contract
- Slice 2: implement theme-aware embed controls and initial theme behavior
- Slice 3: validate lint/build and fix blockers
