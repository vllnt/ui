# Contributing to @vllnt/ui

Thanks for wanting to contribute. This repo welcomes issues, bug reports, and PRs.

## Ground rules

- Be respectful. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Security-sensitive reports go through [SECURITY.md](SECURITY.md), **not** public issues.
- Every change keeps the repo shippable: lint, typecheck, tests, and build pass on `main`.
- UI changes must follow [DESIGN.md](DESIGN.md) (live at <https://ui.vllnt.com/DESIGN.md>) and the token contract in [packages/design/tokens.json](packages/design/tokens.json). Document intentional deviations in the PR body.

## Development setup

Requirements: Node 22+, pnpm 11 (pinned via `packageManager`), git.

```bash
git clone https://github.com/vllnt/ui.git
cd ui
pnpm install
pnpm dev
```

Key scripts (build, lint, tests, visual snapshots, react-doctor, tokens, native checks) are listed in the [AGENTS.md commands table](AGENTS.md#commands-run-from-repo-root).

A [react-doctor](https://github.com/millionco/react-doctor) **pre-commit hook**
(in `.githooks/`, enabled automatically on `pnpm install`) blocks commits that
introduce React *errors* on staged files; warnings are advisory. Bypass once
with `git commit --no-verify`. See AGENTS.md → *React health* for details.

## Branching & PRs

- Never commit to `main` — push branches and open PRs. A branch-protection hook blocks direct commits.
- Branch naming: `feat/...`, `fix/...`, `chore/...`, `docs/...`, `ci/...`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/). The release workflow groups `feat:`/`fix:`/other into the generated notes.
- PRs require passing CI (`.github/workflows/ci.yml`) before merge.

## Privacy Guard

The **Privacy Guard** check keeps personal addresses and private hostnames out of git history. On every PR it checks the commits the PR adds (on `main`, the pushed range): author, committer, `Co-authored-by` and `Signed-off-by` emails must be GitHub noreply addresses, and commit messages must not name private hostnames or internal IPs. It also runs gitleaks on those commits and scans the tracked tree against [`.privacy-denylist`](.privacy-denylist).

- Commit as your GitHub noreply address (`<id>+<login>@users.noreply.github.com`) and do not leave `user.email` unset.
- A squash merge copies each commit author's email into a `Co-authored-by` trailer, so every commit in a PR needs a noreply author.
- Check a range locally with `PRIVACY_COMMIT_RANGE=origin/main..HEAD bash scripts/check-commit-emails.sh`. The `.githooks/pre-push` hook runs the same check on each push (bypass once with `git push --no-verify`).
- Findings print the commit, field and category only, never the matched value.
- Old accepted exposure is covered by the baseline in [`.privacy-baseline`](.privacy-baseline) (the standard vllnt baseline file): on `main` the check scans the commits after that SHA, and history is not rewritten. Move the baseline only with owner approval.
- A weekly, non-required `Privacy Guard history audit` scans the full history of every ref. It stays red while the accepted exposure is still in history.

## Adding a component

1. Pick the component's [Atomic Design level](docs/agents/COMPONENTS.md#atomic-design-levels) (`atoms`, `molecules`, `organisms` or `templates`), create `packages/ui/src/components/{level}/{name}/` following the folder layout and patterns in [docs/agents/COMPONENTS.md](docs/agents/COMPONENTS.md#folder-layout) (ref-as-prop + `displayName`, `cn()`, Radix, CVA), and add the export to `packages/ui/src/components/index.ts` (import from `./{level}/{name}/{name}`; there are no per-folder `index.ts` files). `pnpm check:atomic` verifies the level against the component's imports.

2. Regenerate registry docs:

   ```bash
   pnpm -F @vllnt/ui storybook:generate
   pnpm -F @vllnt/ui storybook:generate-docs
   ```

3. Run the full gate locally:

   ```bash
   pnpm lint && pnpm test:once && pnpm -F @vllnt/ui test:visual && pnpm build
   ```

For native changes, also run:

```bash
pnpm -F @vllnt/ui-native generate:index:check
pnpm -F @vllnt/ui-native boundaries:check
pnpm -F @vllnt/ui-native pack:check
pnpm ci:native
```

## Adding a native component

1. Pick the component's [Atomic Design level](docs/agents/COMPONENTS.md#react-native-vllntui-native) and add `packages/ui-native/src/components/{level}/{name}/{name}.tsx` using React Native core primitives, semantic theme tokens, native accessibility APIs, controlled/uncontrolled state where applicable, and caller-owned selection IDs.
2. Do not import DOM, Radix, Tailwind, NativeWind, or browser globals. Inject capabilities such as clipboard and file selection when React Native core does not provide a portable service.
3. Add the component to `packages/ui-native/registry.json` in alphabetical order with honest `portable-options` or `native-adapted` compatibility and its native source path (`src/components/{level}/{name}/{name}.tsx`).
4. Run `pnpm -F @vllnt/ui-native generate:index`; never hand-maintain the generated barrel. `pnpm -F @vllnt/ui-native check:atomic` verifies the level against the component's imports.
5. Add interaction/accessibility tests and run the native checks listed below. Update the Expo catalog when the new family needs integration proof.

Native remains source-only until the manifest reports package availability. Do not describe the planned canary command as installable before publication.

## Code style

- TypeScript **strict** via `@vllnt/typescript`.
- No `any`, no `as` assertions, no `@ts-ignore`, no `eslint-disable`. Fix the issue at the source.
- ESLint 9 flat config only — no `.eslintrc*`.
- No inline `//` comments in shipped code. Use TSDoc on exports.

## Releases

Stable `@vllnt/ui` versions are prepared in a normal version-bump PR. A maintainer then pushes the matching `vX.Y.Z` tag for the merged commit on `main` (`git fetch origin && git tag -a vX.Y.Z origin/main -m vX.Y.Z && git push origin vX.Y.Z`); `.github/workflows/publish.yml` validates the tag against the pre-bumped version, publishes with OIDC-signed provenance, and creates the GitHub release. Web canaries publish automatically after pushes to `main`.

`@vllnt/ui-core` and `@vllnt/ui-native` are experimental and share the `0.1.0` canary base. `.github/workflows/native-canary.yml` runs quality gates and can publish canaries from `main` on the `canary` dist-tag only: `@vllnt/ui-core` behind the repository variable `CORE_CANARY_PUBLISH_ENABLED`, and the core/native pair behind `NATIVE_CANARY_PUBLISH_ENABLED`. Both variables are unset by default, so nothing publishes until the owner enables a path. That workflow has no manual dispatch, stable tag, Git tag, or GitHub Release path. Stable `latest` releases of the two packages are a separate workflow, `.github/workflows/native-release.yml`, run only by a pushed `ui-core-vX.Y.Z` or `ui-native-vX.Y.Z` tag. Stable promotion and native availability remain subject to separate validation holds. See [docs/RELEASING.md](docs/RELEASING.md).

## Reporting bugs / requesting features

Use the GitHub issue templates under [Issues](https://github.com/vllnt/ui/issues/new/choose). Include repro steps, expected vs. actual, and environment details.

## Issue types

Every issue carries a **type**: `Bug`, `Feature`, or `Task`. The repo's issue templates (`bug_report.yml`, `feature_request.yml`, `task.yml`) set this automatically — please use them.

| Type | When |
|------|------|
| `Bug` | Something is broken — wrong output, crash, regression, accessibility violation, security issue. |
| `Feature` | New user-visible capability — new component, new public API, new site surface. |
| `Task` | Internal work — refactor, infra, docs, CI, sweeps, dependency bumps, version bumps. |

A CI check (`.github/workflows/issue-type-enforcer.yml`) labels typeless issues `needs-triage` and posts a reminder. Maintainers triage these manually.
