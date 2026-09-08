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

## 0.4.0 canary-only hold

`scripts/release-guard.mjs` is a checked-in, fail-closed guard used by both publishers. Web/core/Native bases are 0.4.0. Manual stable dispatch rejects 0.4.x and all newer/unknown bases before Git tagging or npm publication; only existing Web 0.3.x maintenance remains eligible. All publication modes require `refs/heads/main`. There is no input or repository-variable override for this hold. Promotion requires a separate reviewed code change and the exit evidence in `PR506_CANARY_GAP_REVIEW.md`.

Matching main pushes may publish Web prereleases under `canary`, never `latest`. Native remains separately disabled unless its existing owner-controlled enable gate and environment approve publication. The guard does not grant publication authorization or prevent an npm account owner from publishing outside these workflows. Stable Web registry installs stay pinned to 0.3.0; Native discovery remains source-only/unavailable.

Run `node --test scripts/release-guard.test.mjs` to verify hold, version derivation and workflow wiring. No publish command is executed by these tests.

## Stable release (PR-driven, no PAT; 0.3.x only during hold)

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

Go to **Actions → Publish → Run workflow** on `main`. No inputs.

CI will:

- Run quality gates (lint / typecheck / build / test).
- Read the version from `packages/ui/package.json`. **Fails fast** if a matching `v{x.y.z}` tag already exists — catches dispatches against stale main.
- Read the `CHANGELOG.md` section for the package version and use it as the GitHub Release notes.
- Push an annotated tag `v{x.y.z}` (tags are not blocked by branch protection; `GITHUB_TOKEN` is sufficient).
- `pnpm pack` and `npx --yes npm@11.18.0 publish --tag latest --provenance --access public`. The pinned npm version avoids known provenance regressions while OIDC trusted publishing signs the attestation.
- Create the GitHub Release for the new tag.

### 3. Point the registry at the published version (post-publish)

Once `@vllnt/ui@{x.y.z}` is live on npm `latest`, open a small follow-up PR that:

- Sets `PUBLISHED_VERSION` in `apps/registry/scripts/inline-component-source.ts` to `{x.y.z}`.
- Runs `pnpm -F @vllnt/ui-registry registry:build` and commits the regenerated `registry.json` + `registry/default` shims (the install target becomes `@vllnt/ui@^{x.y.z}` and item versions update).

The `registry:check` and `registry:integrity` CI guards confirm the regenerated registry is in sync and pins a real (non-prerelease) published version. Until this lands, `npx shadcn add` keeps resolving to the previous published version — harmless, just one release behind.

## Experimental native canaries

`@vllnt/ui-core` and `@vllnt/ui-native` have a separate safety boundary in `.github/workflows/native-canary.yml`:

- A push to `main` that changes native/core/token surfaces runs `pnpm ci:native`.
- Both packages receive the same `0.4.0-canary.<run>.sha<commit>` version, with an exact matching core dependency in the Native tarball.
- Core publishes first under a run-scoped staging tag; native publishes only after that exact core version is visible.
- Reruns skip immutable versions already present and reuse the run-scoped tag, allowing recovery from a partial pair.
- The workflow verifies packed names, versions, the rewritten core dependency, and absence of `workspace:` protocols.
- Only after both versions are visible does the workflow promote both `canary` tags. Ordinary failures restore the prior pair and clean up staging tags.
- Publication never targets `latest`; fail-closed registry reads verify that neither `latest` tag moves.
- No workflow dispatch, Git tag, GitHub Release, or stable publication path exists.

Native publication is fail-closed behind the repository variable `NATIVE_CANARY_PUBLISH_ENABLED`. Before setting it to `true`, reserve both package names on npm, configure trusted-publisher entries, and create a protected GitHub environment named `npm-native-canary`. The protected environment must also supply `NPM_DIST_TAG_TOKEN`, restricted to dist-tag operations for these two packages, with an assigned expiry/rotation/revocation owner. Trusted publishing authenticates uploads, not dist-tag promotion/rollback. Require main-only environment protections and reviewers. Until an authorized owner verifies this setup, keep publication disabled; the workflow still runs native quality gates but skips publication.

No native npm release exists yet. While `packages/ui-native/registry.json` reports `availability: "source"` and `installation.available: false`, the planned command below is documentation and must not be presented as a working install action:

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
