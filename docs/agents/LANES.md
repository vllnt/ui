# Lanes: web and native

Two managers work in this repo at the same time, each in its own lane. They coordinate in the pinned issue **"Lane board: web ⇄ native"** (#622).

The north star: `@vllnt/ui` is the layer for building any UI in any environment (web, mobile, desktop), and the fastest way for people and AI agents to build one. That means one token source, the same component API on every platform, and docs and a registry that agents can read.

## Who owns what

| Lane | Owner | Paths and releases |
| --- | --- | --- |
| **WEB** | UI Web Manager | `packages/ui`, `apps/registry`, `apps/storybook`, `packages/ui/.storybook`, `.github/workflows/storybook.yml`, `.github/workflows/publish.yml`, stable `v*` releases of `@vllnt/ui` |
| **NATIVE** | UI Native Manager | `packages/ui-native`, `apps/native-catalog`, `.github/workflows/native-canary.yml`, `.github/workflows/native-release.yml`, `ui-core-v*` and `ui-native-v*` releases |
| **SHARED** | UI Web Manager, one PR at a time | `packages/design` (`tokens.json`), `packages/ui-core`, root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` (including the Expo trust-exclude list), `turbo.json`, `.node-version`, `.github/workflows/ci.yml`, and the root `CHANGELOG.md`, `DESIGN.md`, `CONTRIBUTING.md`, `AGENTS.md` and `docs/` |

The UI Web Manager is also the only writer of the `@vllnt/ui` version pin in other repos, including the root lockfile of `vllnt/vllnt`.

## Working across lanes

- **Look first.** Before touching anything outside your lane, read the other manager's latest updates and the open PRs.
- **Never edit the other lane's paths.** If you need a change there, ask on the lane board.
- **Shared changes go through the web lane.** The native lane posts the exact request on the lane board: the package or token, the version or value, the reason, and the native PR it unblocks. The web lane makes the change in a dedicated PR, prefixed `deps:` for dependencies or `tokens:` for tokens.
- **Exceptions are written down.** A one-off OK to edit a shared path, for example a single changelog file, is given on the lane board and applies to that change only.
- **Log everything on the lane board.** That covers every shared-lane request, handoff, merge-order decision and release. Start each comment with the lane, for example `[web → native]`, `[native → web]` or `[web] merged`.

## Merge order and the lockfile

1. Shared PRs merge first.
2. Lane PRs then update from `main`, using a merge commit. A rebase that needs a force-push requires the owner's approval.
3. A lane PR never changes `pnpm-lock.yaml`. If it conflicts on the lockfile, update from `main` and run `pnpm install`. Never hand-merge the lockfile.

## CI by lane

`ci.yml` maps the changed files of a pull request to the lanes they affect.

| Job | Runs when the PR touches |
| --- | --- |
| Repo Checks | always (release guard and atomic-level checker tests, no install) |
| Web Quality Gates, E2E | WEB paths or SHARED paths |
| Core Quality Gates | SHARED paths (tokens and `@vllnt/ui-core`) |
| Native Package Gates | NATIVE paths or SHARED paths |
| `required` | always; fails if any job above failed or was cancelled, and passes when every job either passed or was skipped as unaffected |

Pushes to `main` run every job. Pull requests into `main` and into `s3/**` integration branches run the same gates.

## Releases

- `@vllnt/ui` stable releases come only from `v*` tags (web lane).
- `@vllnt/ui-core` and `@vllnt/ui-native` stable releases come only from `ui-core-v*` and `ui-native-v*` tags (native lane).
- No stable release (tag, GitHub release or npm publish) without the owner's explicit consent.
- A canary always carries the next target version above the current stable, never the stable's own number, and never moves the npm `latest` dist-tag.
