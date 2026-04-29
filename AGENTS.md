# Agent Instructions

Canonical instructions for AI coding agents working in this repository.
Harness-specific aliases (`CLAUDE.md`, `.cursorrules`, `codex.md`, etc.) should reference this file.

## Repository at a glance

- **Project:** `@vllnt/ui` — 144-component React library (Radix primitives + Tailwind + CVA).
- **Language:** TypeScript (strict mode via `@vllnt/typescript`).
- **Package manager:** pnpm (lockfile: `pnpm-lock.yaml`). Never use `npm` / `yarn` / `bun`.
- **Monorepo tool:** Turborepo via `turbo.json`.
- **Primary branch:** `main`. Never commit to `main` — push branches, open PRs.

## Package map

| Path | Purpose | Published? |
|------|---------|------------|
| `packages/ui/` | `@vllnt/ui` component library | npm (public) |
| `apps/registry/` | `ui.vllnt.ai` — Next.js registry + docs site | deployed, not a package |
| `.github/workflows/` | CI: `ci.yml`, `publish.yml`, `storybook.yml` | — |

External shared configs (published to npm separately): `@vllnt/eslint-config`, `@vllnt/typescript`.

## Commands (run from repo root)

| Command | Scope |
|---------|-------|
| `pnpm install --frozen-lockfile` | Install deps |
| `pnpm build` | Build every package |
| `pnpm lint` / `pnpm lint:fix` | Lint workspace |
| `pnpm test:once` | Vitest single-run workspace-wide |
| `pnpm -F @vllnt/ui test:visual` | Playwright CT visual snapshots |
| `pnpm -F @vllnt/ui test:coverage` | Vitest with coverage |
| `pnpm check:circular` | Fail on circular imports |

## Component conventions

Every component lives at `packages/ui/src/components/{name}/`:

```
{name}/
  {name}.tsx         # implementation — React.forwardRef + CVA + cn()
  {name}.test.tsx    # Vitest unit
  {name}.visual.tsx  # Playwright CT story
  {name}.mdx         # registry docs (auto-generated where possible)
  index.ts           # barrel export
```

Patterns every component follows:

- `React.forwardRef` + `React.ComponentPropsWithoutRef`.
- `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge).
- CVA (`class-variance-authority`) for variant props.
- Radix primitives for accessible behavior (focus, keyboard, ARIA).
- `asChild` prop via `@radix-ui/react-slot` for render delegation where composable.

## Code rules (non-negotiable)

- TypeScript strict. **No** `any`, `as`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`.
- Zod at boundaries (not inside components).
- Inline `//` comments forbidden in shipped code — prefer TSDoc on exports, or refactor.
- Additive architecture: new feature → new file. Never edit hub files (`index.ts`, `routes.ts`, global configs) reflexively.
- Follow existing codebase patterns. If a pattern exists in 3+ files, use it.

## Testing expectations

- Unit tests run under Vitest + Testing Library (`*.test.tsx`).
- Visual regression: Playwright Component Testing (`*.visual.tsx`) — real browser, no jsdom.
- For UI changes, run both unit and visual, or explicitly note which were skipped and why.
- For bug fixes, add a regression test that fails before the fix and passes after.

## Quality gates before marking a task done

1. `pnpm lint` — clean on changed files.
2. `pnpm exec tsc --noEmit` in the touched package — clean.
3. `pnpm build` — full build succeeds.
4. `pnpm test:once` — relevant tests pass.
5. If UI routes / components changed: `pnpm -F @vllnt/ui test:visual`.

## Git & PR workflow

- Branch naming: `feat/`, `fix/`, `chore/`, `docs/`, `ci/`.
- Conventional commit messages (`feat:`, `fix:`, `chore:`, etc.). The release workflow groups them into notes.
- PR body covers: linked issue (`Closes #...`, `Fixes #...`, `Resolves #...`, `Part of #...`, or `Related to #...`), summary (why), evidence (CI run IDs, screenshots, numbers), test plan.
- Never force-push `main`. Never skip hooks (`--no-verify`).
- Automatic CI monitoring is expected after `gh pr create` — watch the run and report its outcome back into the PR.

## Release

Releases are cut via `workflow_dispatch` on `.github/workflows/publish.yml`:

1. Pick `patch` / `minor` / `major`.
2. CI bumps `packages/ui/package.json`, regenerates notes from commits, pushes tag, publishes to the public npm registry with OIDC-signed provenance, and creates the GitHub Release.

Canary builds ship automatically on every push to `main`.

## Out of scope for agents

- Do not modify `LICENSE`, `CODE_OF_CONDUCT.md`, or `SECURITY.md` without explicit human authorization.
- Do not add new dependencies without explaining the tradeoff (bundle size, security surface, maintenance).
- Do not publish, push to `main`, or merge PRs without explicit authorization.
