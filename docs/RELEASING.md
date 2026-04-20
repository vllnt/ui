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

## Stable release (PR-driven, no PAT)

The release workflow does not push commits to `main`. Version bumps land via normal PRs so branch protection stays in effect and no PAT / bypass is required.

### 1. Bump the version in a PR

Open a PR that:

- Updates `packages/ui/package.json` `"version"` to the new target (follow SemVer — see below).
- Moves the matching entry in `packages/ui/CHANGELOG.md` from `[Unreleased]` to a dated `[x.y.z]` section.

Merge the PR normally. The canary workflow on `main` will immediately publish `@vllnt/ui@{x.y.z}-canary.{sha}` — a dress-rehearsal of the release tarball.

### 2. Dispatch the release

Go to **Actions → Publish → Run workflow** on `main`. No inputs.

CI will:

- Run quality gates (lint / typecheck / build / test).
- Read the version from `packages/ui/package.json`. **Fails fast** if a matching `v{x.y.z}` tag already exists — catches dispatches against stale main.
- Generate release notes grouped by `feat` / `fix` / other, aggregating commit subjects since the previous tag.
- Push an annotated tag `v{x.y.z}` (tags are not blocked by branch protection; `GITHUB_TOKEN` is sufficient).
- `pnpm pack` and `npx --yes npm@latest publish --tag latest --provenance --access public`. OIDC trusted publishing signs the provenance attestation.
- Create the GitHub Release for the new tag.

## Versioning policy

- [SemVer](https://semver.org). Track API compatibility, not surface area — adding 50 new components is a **minor** bump if no existing exports break.
- A change is **major** only if any of the following break: exported component names, prop signatures of shipped components, CSS-variable contract, CVA variant keys.

## Before requesting a release

- `CHANGELOG.md` has an `[Unreleased]` section describing user-facing changes.
- The canary built from the same commit passes and lists the expected components (check logs for the tarball manifest).
- Docs are in sync: component count in `README.md`, family tables in `packages/ui/README.md`, domain references (`ui.vllnt.ai` / `storybook.vllnt.ai`).

## Post-release verification

- The new version appears on <https://www.npmjs.com/package/@vllnt/ui>.
- The GitHub Release page exists under <https://github.com/vllnt/ui/releases>.
- The sigstore provenance entry is visible in the "Provenance" tab on npmjs and via the transparency log URL in the workflow output.
- `pnpm add @vllnt/ui@latest` in a fresh scratch repo resolves to the new version.

## Rollback

If a release needs to be withdrawn:

1. `npm deprecate @vllnt/ui@{bad-version} "reason"` — leaves the version installed for existing users but hides it from `latest`.
2. Publish a patch bump with the fix. Do not unpublish unless legally required; unpublishing 72h+ after publish is disallowed by npm and breaks downstream users.
