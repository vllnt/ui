# Releasing @vllnt/ui

Releases are cut from `main` by a maintainer via GitHub Actions. Canary builds ship automatically.

## Canary (automatic, on every push to `main`)

1. `ci.yml` + `publish.yml` run in parallel.
2. `publish.yml → quality` runs lint / typecheck / build / test.
3. `publish.yml → canary` packs the library and publishes as `@vllnt/ui@{version}-canary.{short-sha}` to the public npm registry with signed provenance.

Consume the latest canary locally:

```bash
pnpm add @vllnt/ui@canary
```

## Release guard

`scripts/release-guard.mjs` is a checked-in, fail-closed guard used by both publishers. All publication modes require `refs/heads/main`. Manual stable dispatch accepts Web bases 0.3.x and 0.4.x and rejects prereleases and every newer or unknown base before Git tagging or npm publication; a newer base needs a separately reviewed change to the guard. Core/Native keep the independent 0.1.0 canary base and have no stable mode. There is no input or repository-variable override.

Matching main pushes publish Web prereleases under `canary`, never `latest`. Core and Native canaries publish only when the owner sets their repository variables, which are unset by default (see Experimental native canaries and `PR506_CANARY_GAP_REVIEW.md`). The guard does not grant publication authorization or prevent an npm account owner from publishing outside these workflows. Native discovery remains source-only/unavailable.

The stable `release` job runs in the protected `npm-release` environment (deployment branch `main` only, required reviewer). A dispatch therefore waits until a maintainer approves the deployment in the run page; nothing is tagged or published before that approval.

Run `node --test scripts/release-guard.test.mjs` to verify the guard, version derivation and workflow wiring. No publish command is executed by these tests.

## Stable release (PR-driven, no PAT)

The release workflow does not push commits to `main`. Version bumps land via normal PRs so branch protection stays in effect and no PAT / bypass is required.

### 1. Bump the version in a PR

Open a PR that:

- Updates `packages/ui/package.json` `"version"` to the new target (follow SemVer — see below).
- Updates `apps/registry/package.json` `"version"` to match.
- Moves the matching entry in root `CHANGELOG.md` and `packages/ui/CHANGELOG.md` from `[Unreleased]` to a dated `[x.y.z]` section. Root `CHANGELOG.md` is the source used for the website, feeds, and GitHub Release notes.
- Syncs docs that name a count or version: component count in `README.md` + `packages/ui/README.md`, the `packages/ui/package.json` `"description"`, `docs/ARCHITECTURE.md`, and the ROADMAP status line. The count is `registry.items.length`; `apps/registry/lib/component-count.test.ts` guards the enforced surfaces (changelog snapshot, home copy, PWA manifest).

Do **not** touch `PUBLISHED_VERSION` in `apps/registry/scripts/inline-component-source.ts` here — that pins the shadcn install target and must only advance **after** the new version is live on npm `latest` (see step 3). Bumping it before publish makes the deployed registry advertise `@vllnt/ui@^{x.y.z}` while npm `latest` is still the previous version, breaking `npx shadcn add`.

Merge the PR normally. The canary workflow on `main` will immediately publish `@vllnt/ui@{x.y.z}-canary.{sha}` — a dress-rehearsal of the release tarball.

### 2. Dispatch the release

Go to **Actions → Publish → Run workflow** on `main` (or run `gh workflow run publish.yml --ref main`). No inputs. Approve the pending `npm-release` deployment on the run page when the quality job has passed.

CI will:

- Run quality gates (lint / typecheck / build / test).
- Wait for a maintainer to approve the `npm-release` deployment; nothing below runs before that.
- Read the version from `packages/ui/package.json`. **Fails fast** if a matching `v{x.y.z}` tag already exists — catches dispatches against stale main.
- Read the `CHANGELOG.md` section for the package version and use it as the GitHub Release notes.
- Push an annotated tag `v{x.y.z}` (tags are not blocked by branch protection; `GITHUB_TOKEN` is sufficient).
- `pnpm pack` and `npx --yes npm@11.18.0 publish --tag latest --provenance --access public`. The pinned npm version avoids known provenance regressions while OIDC trusted publishing signs the attestation.
- Create the GitHub Release for the new tag.

### 3. Point the registry at the published version (post-publish)

Once `@vllnt/ui@{x.y.z}` is live on npm `latest`, open a small follow-up PR that:

- Sets `PUBLISHED_VERSION` in `apps/registry/scripts/inline-component-source.ts` to `{x.y.z}`.
- Runs `pnpm -F @vllnt/ui-registry registry:build` and commits the regenerated `registry.json` and `lib/component-metadata.json` (the install target becomes `@vllnt/ui@^{x.y.z}` and item versions update). The `registry/default` shims are untracked build output and are regenerated on every build.

The `registry:check` and `registry:integrity` CI guards confirm the regenerated registry is in sync and pins a real (non-prerelease) published version. Until this lands, `npx shadcn add` keeps resolving to the previous published version — harmless, just one release behind.

## Experimental native canaries

`@vllnt/ui-core` and `@vllnt/ui-native` have their own workflow, `.github/workflows/native-canary.yml`, with two independent publish paths. Each path has its own repository variable. A variable that is unset (the default) means the job is skipped, not failed, so nothing publishes until the owner turns a path on.

| Path | Repository variable | Publishes | Runs after |
| --- | --- | --- | --- |
| Core canary | `CORE_CANARY_PUBLISH_ENABLED=true` | `@vllnt/ui-core` | ui-core lint, typecheck, build, tests and `pack:check` only |
| Native pair | `NATIVE_CANARY_PUBLISH_ENABLED=true` | `@vllnt/ui-core` and `@vllnt/ui-native` | `pnpm ci:native`, including Expo Doctor |

Rules both paths share:

- Pushes to `main` only. The same guard, version scheme (`0.1.0-canary.<positive run>.sha<12 lowercase hex>`), `canary` dist-tag (never `latest`), npm provenance and pinned `npm@11.18.0` as the Web publisher. No workflow dispatch, Git tag, GitHub Release or stable path exists.
- The logic lives in `scripts/publish-canary.sh` (`core` or `pair`). `scripts/release-guard.test.mjs` runs the real script against a fake registry, so no test can publish.
- Both packages must already exist on npm with a `latest` tag. A first upload gets an implicit `latest`, so the script refuses to publish a package that has none, and fails the run if `latest` moves.
- A run that is no longer the head of `main` stands down without publishing.
- Both publish jobs share one concurrency group (`native-canary-publish`, no cancel-in-progress), so a pair promotion never overlaps a core publish. GitHub keeps one pending job per group, so a late job can replace a pending one; a replaced job shows as cancelled, not failed, and the next push to `main` publishes again.
- The workflow-level `permissions` stay `contents: read`. Only the publish jobs add `id-token: write`, and a test fails if the workflow default is widened.
- `pnpm-workspace.yaml` supply-chain policy (`minimumReleaseAge`, `trustPolicy`) is not touched by either path.

Core canary path. It installs only `@vllnt/ui-core` and its dependencies (no Expo) and never runs `ci:native` or Expo Doctor, so an Expo gate failure cannot hold it back. It needs no `NPM_DIST_TAG_TOKEN`: it uploads straight to `--tag canary` over OIDC, then checks that `latest` is unchanged and that `canary` points at the new version. A rerun of the same commit does not republish and never moves a newer `canary`.

Native pair path. It stays behind the native quality gate. Core publishes first under a run-scoped staging tag (`run-<run id>`) unless this commit's core version is already on npm (from the core path), in which case it is reused. Native publishes only after that exact core version is visible, and its tarball pins that exact core version, so the pair keeps working after core-only publishes. Only after both versions are visible are both `canary` tags promoted, with `NPM_DIST_TAG_TOKEN`, because OIDC authenticates uploads only. The script moves the token into a plain shell variable and unsets it from the environment before running anything else, so `pnpm pack`, `npx`, `git` and the OIDC upload never see it; only `npm whoami` and `npm dist-tag` receive it. Ordinary failures restore the prior `canary` tags and clean up the staging tags.

Owner setup. The workflow does none of this, and nothing publishes until the variables in steps 4 and 5 are set:

1. Both packages must exist on npm with a `latest` tag. They do today (the bootstrap pre-release below). An authorized npm owner must bootstrap any unpublished name by hand; an organization does not reserve package names and trusted publishing requires existing packages.
2. Create the GitHub environment `npm-native-canary` before the first run (a job that names a missing environment creates it unprotected). Deployment branches: `main` only. Add required reviewers only if you want every canary publish to wait for approval.
3. On npmjs.com, add a Trusted Publisher to each package: organization `vllnt`, repository `ui`, workflow filename `native-canary.yml`, environment `npm-native-canary`. Both jobs share the file and the environment, so one entry per package covers both paths. Do not rename the workflow file.
4. Core path: set the repository variable `CORE_CANARY_PUBLISH_ENABLED` to `true` (Settings, Secrets and variables, Actions, Variables).
5. Pair path, only when you accept it: create the secret `NPM_DIST_TAG_TOKEN` in the `npm-native-canary` environment (scoped to the two packages, expiring; npm has no dist-tag-only permission, so treat it as publish-capable), then set `NATIVE_CANARY_PUBLISH_ENABLED` to `true`. Keep it off until Expo Doctor is green on `main`.

To stop publishing, delete or unset the variable. Never commit credentials.

Still open before the pair path should be trusted: a rerun that finds a version already on npm reuses it by name without checking its contents, and the physical-device validation hold below.

The catalog now uses Expo `~57.0.31` to resolve the prior Doctor patch mismatch; `pnpm ci:native` must pass on the reviewed commit. The validation hold still requires physical Android/iOS and VoiceOver/TalkBack evidence plus fresh published-consumer checks. An upload alone does not lift this hold.

No supported native npm release exists yet. A manually bootstrapped pre-release (`0.1.0-canary.20260917105553.sha7466647a4ba5`) reserves both package names; it has no build provenance and npm's implicit `latest` tag points at it. While `packages/ui-native/registry.json` reports `availability: "source"` and `installation.available: false`, the planned command below is documentation and must not be presented as a working install action:

```bash
pnpm add @vllnt/ui-native@canary
```

Only after the first synchronized pair is visible, both `canary` tags are promoted, fresh packed-consumer validation passes, and the physical-device/accessibility requirements in the Native changelog are satisfied, update the native manifest to `availability: "package"` and `installation.available: true` in a reviewed PR, then verify the website, llms projections, MCP, and fresh-install smoke test together.

A stable native channel requires a separate PR that defines versioning, migration, physical Android/iOS plus VoiceOver/TalkBack validation, observability, and rollback policy. It must not be added to the web package's release matrix.

## Versioning policy

- [SemVer](https://semver.org). Track API compatibility, not surface area — adding 50 new components is a **minor** bump if no existing exports break.
- A change is **major** only if any of the following break: exported component names, prop signatures of shipped components, CSS-variable contract, CVA variant keys.

## Before requesting a release

- `CHANGELOG.md` has an `[Unreleased]` section describing user-facing changes. Use `cliff.toml` with git-cliff if you need to regenerate it from Conventional Commits.
- The canary built from the same commit passes and lists the expected components (check logs for the tarball manifest).
- Docs are in sync: component count in `README.md`, family tables in `packages/ui/README.md`, domain references (`ui.vllnt.com` / `storybook.vllnt.ai`).

## Post-release verification

- The new version appears on <https://www.npmjs.com/package/@vllnt/ui>.
- The GitHub Release page exists under <https://github.com/vllnt/ui/releases>.
- The sigstore provenance entry is visible in the "Provenance" tab on npmjs and via the transparency log URL in the workflow output.
- `pnpm add @vllnt/ui@latest` in a fresh scratch repo resolves to the new version.

## Rollback

If a release needs to be withdrawn:

1. An explicitly authorized owner moves `latest` to a verified known-good version and verifies fresh installs. `npm deprecate @vllnt/ui@{bad-version} "reason"` adds an install warning but does **not** move dist-tags. Diagnose partial Git-tag/npm publication before retrying; never blindly delete release tags.
2. Publish a patch bump with the fix. Do not unpublish unless legally required; unpublishing 72h+ after publish is disallowed by npm and breaks downstream users.
