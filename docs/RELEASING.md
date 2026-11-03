# Releasing @vllnt/ui

Stable releases are published by a maintainer pushing a `vX.Y.Z` tag on `main`; GitHub Actions does the rest. Canary builds ship automatically.

## Canary (automatic, on every push to `main`)

1. `ci.yml` + `publish.yml` run in parallel.
2. `publish.yml → quality` runs lint / typecheck / build / test.
3. `publish.yml → canary` packs the library and publishes as `@vllnt/ui@{version}-canary.{short-sha}` to the public npm registry with signed provenance.

Consume the latest canary locally:

```bash
pnpm add @vllnt/ui@canary
```

## Release guard

`scripts/release-guard.mjs` is a checked-in, fail-closed guard used by both publishers. Canary modes require `refs/heads/main`. Stable requires the `refs/tags/v{version}` tag push for the exact `packages/ui` version, so a branch run or a mismatched tag can never publish `latest`. Stable accepts Web bases 0.3.x and 0.4.x and rejects prereleases and every newer or unknown base before npm publication; a newer base needs a separately reviewed change to the guard. Core/Native keep the independent 0.1.0 canary base; their stable path is the separate `package-release` mode (see [Native stable release](#native-stable-release-core-and-native)). There is no input or repository-variable override.

Matching main pushes publish Web prereleases under `canary`, never `latest`. Native publication is unconditionally disabled in the workflow until a separately reviewed enabling change (see `PR506_CANARY_GAP_REVIEW.md`). The guard does not grant publication authorization or prevent an npm account owner from publishing outside these workflows. Native discovery remains source-only/unavailable.

The stable `release` job runs in the protected `npm-release` environment (required reviewer). A tag push therefore waits until a maintainer approves the deployment in the run page; nothing is published before that approval. The environment's deployment rules must allow `v*.*.*` tags, otherwise the tag run is rejected before any step runs.

The workflow file and guard that run are the ones in the tagged commit, so the ancestor-of-`main` check catches mistakes, not someone who can push tags. Restrict who can create `v*.*.*` tags with a repository tag ruleset, and confirm the tagged commit is on `main` when approving the deployment.

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

### 2. Tag the release

Pushing the tag is the release trigger; the workflow never creates tags. Tag the merged version-bump commit on `main`:

```bash
git fetch origin && git tag -a vX.Y.Z origin/main -m vX.Y.Z && git push origin vX.Y.Z
```

`origin/main` must still be the commit whose `packages/ui/package.json` carries `X.Y.Z`. Approve the pending `npm-release` deployment on the run page when the quality job has passed.

CI will:

- Run quality gates (lint / typecheck / build / test).
- Wait for a maintainer to approve the `npm-release` deployment; nothing below runs before that.
- Verify the tag. `release-guard.mjs stable` requires it to be exactly `v{x.y.z}` for the `packages/ui/package.json` version on a supported base, and the tagged commit must be an ancestor of `origin/main`.
- Read the `CHANGELOG.md` section headed exactly `## [{x.y.z}]` and use it as the GitHub Release notes. **Fails** if the section is missing.
- `pnpm pack` and `npx --yes npm@11.18.0 publish --tag latest --provenance --access public`, skipped when that version is already on npm (`scripts/npm-published.sh`: only an exact version answer counts as published and only a registry E404 as unpublished; any other answer fails the run instead of risking a duplicate publish or a missed one). The pinned npm version avoids known provenance regressions while OIDC trusted publishing signs the attestation.
- Create the GitHub Release for the tag, skipped when it already exists.

After a transient failure, re-run the failed jobs of the tag run; the publish and release steps skip work that is already done. A tag that failed verification published nothing. Confirm that npm has no such version, then fix `main` through a PR and push a new tag (see [Rollback](#rollback) before deleting any tag).

### 3. Point the registry at the published version (post-publish)

Once `@vllnt/ui@{x.y.z}` is live on npm `latest`, open a small follow-up PR that:

- Sets `PUBLISHED_VERSION` in `apps/registry/scripts/inline-component-source.ts` to `{x.y.z}`.
- Runs `pnpm -F @vllnt/ui-registry registry:build` and commits the regenerated `registry.json` and `lib/component-metadata.json` (the install target becomes `@vllnt/ui@^{x.y.z}` and item versions update). The `registry/default` shims are untracked build output and are regenerated on every build.

The `registry:check` and `registry:integrity` CI guards confirm the regenerated registry is in sync and pins a real (non-prerelease) published version. Until this lands, `npx shadcn add` keeps resolving to the previous published version — harmless, just one release behind.

## Experimental native canaries

`@vllnt/ui-core` and `@vllnt/ui-native` have a separate safety boundary in `.github/workflows/native-canary.yml`:

- A push to `main` that changes native/core/token surfaces runs `pnpm ci:native`.
- The guard permits only matching `0.1.0-canary.<positive run>.sha<12 lowercase hex>` versions, with an exact matching core dependency in the Native tarball.
- The staged publication implementation below is retained but disabled; it is not approved for bootstrap or recovery.
- Core publishes first under a run-scoped staging tag; native publishes only after that exact core version is visible.
- Reruns skip immutable versions already present and reuse the run-scoped tag, allowing recovery from a partial pair.
- The workflow verifies packed names, versions, the rewritten core dependency, and absence of `workspace:` protocols.
- Only after both versions are visible does the workflow promote both `canary` tags. Ordinary failures restore the prior pair and clean up staging tags.
- Publication targets staging, not `latest`. First uploads can nevertheless acquire an implicit `latest`; do not use this workflow to bootstrap unpublished names.
- This workflow has no workflow dispatch, Git tag, GitHub Release, or stable publication path; stable lives in `native-release.yml`.

Native publication is unconditionally disabled (`if: ${{ false }}`); setting `NATIVE_CANARY_PUBLISH_ENABLED` cannot enable it. Quality gates still run. Before a separately reviewed change restores the variable gate, fix the retained publisher's version lookup (registry errors must not be interpreted as absence), verify immutable artifact integrity on recovery, and address bootstrap's implicit `latest` behavior. No temporary first-publish script or test belongs in the repository or CI.

An authorized npm owner must bootstrap unpublished names separately; an organization does not reserve package names and trusted publishing requires existing packages. Configure trusted-publisher entries and the protected `npm-native-canary` environment with main-only protection and reviewers. A scoped, expiring `NPM_DIST_TAG_TOKEN` is required for tag operations because OIDC authenticates uploads only; npm does not provide a dist-tag-only granular permission, so treat this token as publishing-capable. Never commit credentials.

The catalog now uses Expo `~57.0.31` to resolve the prior Doctor patch mismatch; `pnpm ci:native` must pass on the reviewed commit. The validation hold still requires physical Android/iOS and VoiceOver/TalkBack evidence plus fresh published-consumer checks. An upload alone does not lift this hold.

No supported native npm release exists yet. A manually bootstrapped pre-release (`0.1.0-canary.20260917105553.sha7466647a4ba5`) reserves both package names; it has no build provenance and npm's implicit `latest` tag points at it. While `packages/ui-native/registry.json` reports `availability: "source"` and `installation.available: false`, the planned command below is documentation and must not be presented as a working install action:

```bash
pnpm add @vllnt/ui-native@canary
```

Only after the first synchronized pair is visible, both `canary` tags are promoted, fresh packed-consumer validation passes, and the physical-device/accessibility requirements in the Native changelog are satisfied, update the native manifest to `availability: "package"` and `installation.available: true` in a reviewed PR, then verify the website, llms projections, MCP, and fresh-install smoke test together.

## Native stable release (core and native)

`.github/workflows/native-release.yml` publishes `@vllnt/ui-core` and `@vllnt/ui-native` to `latest` from their own tags, separate from Web's `vX.Y.Z`:

| Tag | Publishes |
| --- | --- |
| `ui-core-vX.Y.Z` | `@vllnt/ui-core` |
| `ui-native-vX.Y.Z` | `@vllnt/ui-native` |

Neither pattern matches Web's `v*.*.*` filter, and the Web workflow does not run for them.

Order: tag `ui-core-vX.Y.Z`, wait until it is visible on npm, then tag `ui-native-vX.Y.Z`. Native's `workspace:*` dependency on core is rewritten to the exact `packages/ui-core` version when packed. If that core version is not on npm, the native release fails with "tag ui-core-vX first" and publishes nothing.

Prerequisites (owner actions):

- The owner lifts the native validation hold and approves native publication. The canary hold in `native-canary.yml` is unaffected by this workflow.
- A trusted publisher on npm for each package (repository `vllnt/ui`, workflow `native-release.yml`, environment `npm-release`).
- The `npm-release` environment's deployment rules allow `ui-core-v*.*.*` and `ui-native-v*.*.*`, and a tag ruleset restricts who can create them.
- A release PR on `main` bumps `packages/<pkg>/package.json` and cuts `## [X.Y.Z]` in `packages/<pkg>/CHANGELOG.md`.

Tag the merged commit: `git fetch origin && git tag -a ui-core-vX.Y.Z origin/main -m ui-core-vX.Y.Z && git push origin ui-core-vX.Y.Z`.

`release-guard.mjs package-release` runs before the `npm-release` approval is requested and fails unless the version is stable `X.Y.Z`, equals the package version, the tagged commit is an ancestor of `origin/main`, and the package CHANGELOG has `## [X.Y.Z]`. The release job then packs, checks the manifest (name, version, exact core dependency, no `workspace:`), and runs `npm publish --tag latest --provenance` unless that version is already on npm (`scripts/npm-published.sh`; only a not-found answer counts as unpublished). Re-run failed jobs after a transient failure. The workflow creates no tags or GitHub Release.

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
