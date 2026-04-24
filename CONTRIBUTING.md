# Contributing to @vllnt/ui

Thanks for wanting to contribute. This repo welcomes issues, bug reports, and PRs.

## Ground rules

- Be respectful. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Security-sensitive reports go through [SECURITY.md](SECURITY.md), **not** public issues.
- Every change keeps the repo shippable: lint, typecheck, tests, and build pass on `main`.

## Development setup

Requirements: Node 22+, pnpm 9+, git.

```bash
git clone https://github.com/vllnt/ui.git
cd ui
pnpm install
pnpm dev
```

Key scripts (from repo root):

| Script | What |
|--------|------|
| `pnpm dev` | Run registry + Storybook dev servers in parallel via turbo |
| `pnpm build` | Build every package |
| `pnpm lint` / `pnpm lint:fix` | ESLint flat config across the workspace |
| `pnpm test:once` | Vitest single-run across the workspace |
| `pnpm -F @vllnt/ui test:visual` | Playwright CT visual snapshots |
| `pnpm check:circular` | Fail on circular imports |

## Branching & PRs

- Never commit to `main` — push branches and open PRs. A branch-protection hook blocks direct commits.
- Branch naming: `feat/...`, `fix/...`, `chore/...`, `docs/...`, `ci/...`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/). The release workflow groups `feat:`/`fix:`/other into the generated notes.
- PRs require passing CI (`.github/workflows/ci.yml`) before merge.

## Adding a component

1. Scaffold a folder under `packages/ui/src/components/{name}/` containing:

   ```
   {name}/
     {name}.tsx         # implementation
     {name}.test.tsx    # Vitest unit tests
     {name}.visual.tsx  # Playwright CT story
     {name}.mdx         # registry docs (optional if auto-generated)
     index.ts           # barrel export
   ```

2. Follow the existing patterns:
   - `React.forwardRef` on every component.
   - `cn()` from `src/lib/utils.ts` for class merging.
   - Radix primitives for accessible behavior where applicable.
   - CVA for variants (`class-variance-authority`).

3. Add the export to `packages/ui/src/index.ts`.

4. Regenerate registry docs:

   ```bash
   pnpm -F @vllnt/ui storybook:generate
   pnpm -F @vllnt/ui storybook:generate-docs
   ```

5. Run the full gate locally:

   ```bash
   pnpm lint && pnpm test:once && pnpm -F @vllnt/ui test:visual && pnpm build
   ```

## Code style

- TypeScript **strict** via `@vllnt/typescript`.
- No `any`, no `as` assertions, no `@ts-ignore`, no `eslint-disable`. Fix the issue at the source.
- ESLint 9 flat config only — no `.eslintrc*`.
- No inline `//` comments in shipped code. Use TSDoc on exports.

## Releases

Releases are cut via `workflow_dispatch` on `.github/workflows/publish.yml`. Maintainers pick `patch` / `minor` / `major` and the workflow:

1. Bumps `packages/ui/package.json`.
2. Generates release notes from commits.
3. Pushes an annotated tag `v{x.y.z}` back to `main`.
4. Publishes to the public npm registry with OIDC-signed provenance.
5. Creates the GitHub release.

Canary builds ship automatically on every push to `main`.

## Reporting bugs / requesting features

Use the GitHub issue templates under [Issues](https://github.com/vllnt/ui/issues/new/choose). Include repro steps, expected vs. actual, and environment details.
