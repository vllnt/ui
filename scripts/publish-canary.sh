#!/usr/bin/env bash
# Publishes a canary from main. Run from the repository root, after the build.
#
#   scripts/publish-canary.sh core   @vllnt/ui-core alone, straight to the `canary` dist-tag.
#                                    npm trusted publishing (OIDC) only: no secret needed.
#   scripts/publish-canary.sh pair   @vllnt/ui-core + @vllnt/ui-native, staged under a run tag and
#                                    promoted together. Needs NPM_DIST_TAG_TOKEN, because OIDC
#                                    authenticates `npm publish` only, not `npm dist-tag`.
#
# Rules enforced here and exercised by scripts/release-guard.test.mjs:
#   - the version only comes from scripts/release-guard.mjs (0.1.0-canary.<run>.sha<12 hex>)
#   - `latest` is never targeted, and must be unchanged afterwards
#   - a registry error is never read as "not published"
#   - a package that does not exist yet is never created from CI (its first upload would get an
#     implicit `latest`); an owner bootstraps it by hand, see docs/RELEASING.md
#   - a run that is no longer the tip of main publishes nothing
#   - `pair` reuses a core version that is already on the registry, so it keeps working after a
#     `core` publish of the same commit, and native always pins the exact core version it ships with
set -euo pipefail

CORE_DIR="packages/ui-core"
NATIVE_DIR="packages/ui-native"
CORE_NAME="@vllnt/ui-core"
NATIVE_NAME="@vllnt/ui-native"
# Pinned: the npm bundled with Node can regress OIDC provenance.
NPM_PINNED="npm@11.18.0"

npm_pinned() {
  npx --yes "$NPM_PINNED" "$@"
}

# setup-node writes `_authToken=${NODE_AUTH_TOKEN}` (a placeholder) into the user config. npm would
# then send the placeholder instead of using OIDC, so drop it, as publish.yml does.
use_oidc_auth() {
  if [[ -n "${NPM_CONFIG_USERCONFIG:-}" && -f "$NPM_CONFIG_USERCONFIG" ]]; then
    local stripped
    stripped="$(mktemp "$RUNNER_TEMP/npmrc.XXXXXX")"
    sed '/_authToken/d' "$NPM_CONFIG_USERCONFIG" >"$stripped"
    cat "$stripped" >"$NPM_CONFIG_USERCONFIG"
    rm -f "$stripped"
  fi
  unset NODE_AUTH_TOKEN
}

current_main_sha() {
  git ls-remote --exit-code origin refs/heads/main | awk '{print $1}'
}

# Exits 0 without publishing when a newer commit has landed on main.
skip_if_superseded() {
  local remote
  remote="$(current_main_sha)"
  test -n "$remote"
  if [[ "$remote" != "$GITHUB_SHA" ]]; then
    echo "::notice::${1:-Skipping superseded canary run for ${GITHUB_SHA}}"
    exit 0
  fi
}

read_tags() {
  local package="$1"
  local output_file error_file output
  output_file="$(mktemp "$RUNNER_TEMP/npm-view-output.XXXXXX")"
  error_file="$(mktemp "$RUNNER_TEMP/npm-view-error.XXXXXX")"
  if npm view "$package" dist-tags --json >"$output_file" 2>"$error_file"; then
    output="$(cat "$output_file")"
    rm -f "$output_file" "$error_file"
    [[ -n "$output" ]] || output='{}'
    if ! jq -e 'type == "object"' <<<"$output" >/dev/null; then
      echo "::error::npm returned invalid dist-tag data for ${package}" >&2
      return 1
    fi
    printf '%s\n' "$output"
    return 0
  fi
  if grep -q 'E404' "$output_file" "$error_file"; then
    rm -f "$output_file" "$error_file"
    printf '{}\n'
    return 0
  fi
  cat "$output_file" "$error_file" >&2
  rm -f "$output_file" "$error_file"
  return 1
}

tag_value() {
  jq -r --arg tag "$2" '.[$tag] // ""' <<<"$1"
}

# Prints `present` or `absent`; fails (so the job aborts) on any other registry error.
version_state() {
  local spec="$1"
  local output_file error_file output
  output_file="$(mktemp "$RUNNER_TEMP/npm-view-output.XXXXXX")"
  error_file="$(mktemp "$RUNNER_TEMP/npm-view-error.XXXXXX")"
  if npm view "$spec" version >"$output_file" 2>"$error_file"; then
    output="$(cat "$output_file")"
    rm -f "$output_file" "$error_file"
    if [[ -n "$output" ]]; then echo present; else echo absent; fi
    return 0
  fi
  if grep -q 'E404' "$output_file" "$error_file"; then
    rm -f "$output_file" "$error_file"
    echo absent
    return 0
  fi
  echo "::error::Could not determine whether ${spec} is published" >&2
  cat "$output_file" "$error_file" >&2
  rm -f "$output_file" "$error_file"
  return 1
}

wait_until_present() {
  local spec="$1"
  for _ in $(seq 1 12); do
    [[ "$(version_state "$spec")" = present ]] && break
    sleep "${CANARY_POLL_SECONDS:-5}"
  done
  test "$(version_state "$spec")" = present
}

# The package must already exist: a first upload would get an implicit `latest`.
require_bootstrapped() {
  local package="$1" tags="$2"
  if [[ -z "$(tag_value "$tags" latest)" ]]; then
    echo "::error::${package} has no published version. Bootstrap it by hand first (docs/RELEASING.md): CI must not create it, because a first upload gets an implicit latest tag" >&2
    return 1
  fi
}

package_field() {
  node -p "require('./$1/package.json').$2"
}

require_stable_base() {
  case "$(package_field "$1" version)" in
    *-*) echo "::error::Base package versions must not be prereleases"; return 1 ;;
  esac
}

pack_package() {
  pnpm --dir "$1" pack --pack-destination "$2" | tail -n1
}

tarball_has_file() {
  local listing
  listing="$(tar -tf "$1")"
  grep -qx "package/$2" <<<"$listing"
}

tarball_json() {
  tar -xOf "$1" package/package.json
}

# Name, version, dist entry point and no workspace protocol, read from the packed tarball itself.
verify_tarball() {
  local tarball="$1" name="$2" version="$3" manifest
  manifest="$(tarball_json "$tarball")"
  test "$(jq -r '.name' <<<"$manifest")" = "$name"
  test "$(jq -r '.version' <<<"$manifest")" = "$version"
  test "$(jq -r '.main' <<<"$manifest")" = "./dist/index.js"
  tarball_has_file "$tarball" dist/index.js
  if grep -q 'workspace:' <<<"$manifest"; then
    echo "::error::Packed ${name} manifest still contains a workspace protocol"
    return 1
  fi
}

# --provenance needs the OIDC token of the calling job (permissions: id-token: write).
publish_tarball() {
  npm_pinned publish "$1" --tag "$2" --provenance --access public
}

publish_core() {
  : "${RUNNER_TEMP:?}" "${GITHUB_SHA:?}"
  use_oidc_auth

  CANARY_VERSION="$(node scripts/release-guard.mjs core-canary)"
  test "$(package_field "$CORE_DIR" name)" = "$CORE_NAME"
  require_stable_base "$CORE_DIR"
  skip_if_superseded

  local tags_before latest_before state tarball published=false
  tags_before="$(read_tags "$CORE_NAME")"
  require_bootstrapped "$CORE_NAME" "$tags_before"
  latest_before="$(tag_value "$tags_before" latest)"
  state="$(version_state "${CORE_NAME}@${CANARY_VERSION}")"

  npm version "$CANARY_VERSION" --prefix "$CORE_DIR" --no-git-tag-version --ignore-scripts
  local pack_dir="$RUNNER_TEMP/core-pack"
  mkdir -p "$pack_dir"
  tarball="$(pack_package "$CORE_DIR" "$pack_dir")"
  verify_tarball "$tarball" "$CORE_NAME" "$CANARY_VERSION"

  # Straight to the canary dist-tag: one OIDC upload, no staging and no dist-tag token.
  if [[ "$state" = absent ]]; then
    publish_tarball "$tarball" canary
    published=true
  fi
  wait_until_present "${CORE_NAME}@${CANARY_VERSION}"

  local tags_after
  tags_after="$(read_tags "$CORE_NAME")"
  test "$(tag_value "$tags_after" latest)" = "$latest_before"
  # A rerun that found the version already there leaves `canary` to whichever run owns it now.
  if [[ "$published" = true ]]; then
    test "$(tag_value "$tags_after" canary)" = "$CANARY_VERSION"
  fi
  echo "::notice::${CORE_NAME}@${CANARY_VERSION} is on the canary tag"
}

publish_pair() {
  : "${RUNNER_TEMP:?}" "${GITHUB_SHA:?}" "${GITHUB_RUN_ID:?}"
  use_oidc_auth

  CANARY_VERSION="$(node scripts/release-guard.mjs native-canary)"
  test "$(package_field "$CORE_DIR" name)" = "$CORE_NAME"
  test "$(package_field "$NATIVE_DIR" name)" = "$NATIVE_NAME"
  if [[ -z "${NPM_DIST_TAG_TOKEN:-}" ]]; then
    echo "::error::NPM_DIST_TAG_TOKEN is required for dist-tag promotion and rollback because npm trusted publishing authenticates publish commands only"
    exit 1
  fi
  DIST_TAG_NPMRC="$RUNNER_TEMP/npm-dist-tag.npmrc"
  # shellcheck disable=SC2016  # npm expands ${NODE_AUTH_TOKEN} itself
  printf '//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n' >"$DIST_TAG_NPMRC"
  npm_with_token whoami >/dev/null

  local core_base native_base
  core_base="$(package_field "$CORE_DIR" version)"
  native_base="$(package_field "$NATIVE_DIR" version)"
  test "$core_base" = "$native_base"
  require_stable_base "$CORE_DIR"

  skip_if_superseded

  STAGING_TAG="run-${GITHUB_RUN_ID}"

  CORE_TAGS_BEFORE="$(read_tags "$CORE_NAME")"
  NATIVE_TAGS_BEFORE="$(read_tags "$NATIVE_NAME")"
  require_bootstrapped "$CORE_NAME" "$CORE_TAGS_BEFORE"
  require_bootstrapped "$NATIVE_NAME" "$NATIVE_TAGS_BEFORE"
  CORE_LATEST_BEFORE="$(tag_value "$CORE_TAGS_BEFORE" latest)"
  NATIVE_LATEST_BEFORE="$(tag_value "$NATIVE_TAGS_BEFORE" latest)"
  CORE_CANARY_BEFORE="$(tag_value "$CORE_TAGS_BEFORE" canary)"
  NATIVE_CANARY_BEFORE="$(tag_value "$NATIVE_TAGS_BEFORE" canary)"

  npm version "$CANARY_VERSION" --prefix "$CORE_DIR" --no-git-tag-version --ignore-scripts
  npm version "$CANARY_VERSION" --prefix "$NATIVE_DIR" --no-git-tag-version --ignore-scripts
  # Native pins the exact core version it ships with (a range never matches a prerelease).
  node - "$NATIVE_DIR/package.json" "$CANARY_VERSION" <<'NODE'
const fs = require("node:fs");
const [manifestPath, version] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.dependencies["@vllnt/ui-core"] = version;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
NODE

  local pack_dir="$RUNNER_TEMP/native-packs"
  mkdir -p "$pack_dir"
  local core_tarball native_tarball
  core_tarball="$(pack_package "$CORE_DIR" "$pack_dir")"
  native_tarball="$(pack_package "$NATIVE_DIR" "$pack_dir")"

  verify_tarball "$core_tarball" "$CORE_NAME" "$CANARY_VERSION"
  verify_tarball "$native_tarball" "$NATIVE_NAME" "$CANARY_VERSION"
  test "$(tarball_json "$native_tarball" | jq -r '.["react-native"]')" = "./dist/index.js"
  test "$(tarball_json "$native_tarball" | jq -r '.dependencies["@vllnt/ui-core"]')" = "$CANARY_VERSION"

  PROMOTION_STARTED=false
  trap on_pair_exit EXIT

  local state
  state="$(version_state "${CORE_NAME}@${CANARY_VERSION}")"
  # Present already: the `core` job of this same commit published it. Reuse it.
  if [[ "$state" = absent ]]; then
    publish_tarball "$core_tarball" "$STAGING_TAG"
  fi
  wait_until_present "${CORE_NAME}@${CANARY_VERSION}"

  state="$(version_state "${NATIVE_NAME}@${CANARY_VERSION}")"
  if [[ "$state" = absent ]]; then
    publish_tarball "$native_tarball" "$STAGING_TAG"
  fi
  wait_until_present "${NATIVE_NAME}@${CANARY_VERSION}"

  skip_if_superseded "Skipping canary promotion because main advanced"

  PROMOTION_STARTED=true
  npm_with_token dist-tag add "${CORE_NAME}@${CANARY_VERSION}" canary
  npm_with_token dist-tag add "${NATIVE_NAME}@${CANARY_VERSION}" canary

  local core_tags_after native_tags_after
  core_tags_after="$(read_tags "$CORE_NAME")"
  native_tags_after="$(read_tags "$NATIVE_NAME")"
  test "$(tag_value "$core_tags_after" canary)" = "$CANARY_VERSION"
  test "$(tag_value "$native_tags_after" canary)" = "$CANARY_VERSION"
  test "$(tag_value "$core_tags_after" latest)" = "$CORE_LATEST_BEFORE"
  test "$(tag_value "$native_tags_after" latest)" = "$NATIVE_LATEST_BEFORE"

  PROMOTION_STARTED=false
  echo "::notice::${CORE_NAME}@${CANARY_VERSION} and ${NATIVE_NAME}@${CANARY_VERSION} are on the canary tag"
}

# dist-tag commands use their own user config holding the dist-tag token.
npm_with_token() {
  NPM_CONFIG_USERCONFIG="$DIST_TAG_NPMRC" NODE_AUTH_TOKEN="$NPM_DIST_TAG_TOKEN" npm_pinned "$@"
}

# Removes `tag` only while it still points at the version this run published.
remove_owned_tag() {
  local package="$1"
  local tag="$2"
  local expected="$3"
  local tags current
  tags="$(read_tags "$package")" || return 1
  current="$(tag_value "$tags" "$tag")"
  [[ -n "$current" ]] || return 0
  if [[ "$current" != "$expected" ]]; then
    echo "::error::Refusing to remove ${package} tag ${tag}: expected ${expected}, found ${current}"
    return 1
  fi
  npm_with_token dist-tag rm "$package" "$tag" || return 1
  tags="$(read_tags "$package")" || return 1
  [[ -z "$(tag_value "$tags" "$tag")" ]]
}

cleanup_staging() {
  local failed=0
  remove_owned_tag "$CORE_NAME" "$STAGING_TAG" "$CANARY_VERSION" || failed=1
  remove_owned_tag "$NATIVE_NAME" "$STAGING_TAG" "$CANARY_VERSION" || failed=1
  return "$failed"
}

# Puts `canary` back to what it was, unless some other writer moved it since.
restore_tag() {
  local package="$1"
  local previous="$2"
  local tags current
  tags="$(read_tags "$package")" || return 1
  current="$(tag_value "$tags" canary)"
  [[ "$current" = "$previous" ]] && return 0
  if [[ -n "$current" && "$current" != "$CANARY_VERSION" ]]; then
    echo "::error::Refusing to overwrite unexpected ${package} canary ${current}"
    return 1
  fi
  if [[ -n "$previous" ]]; then
    npm_with_token dist-tag add "${package}@${previous}" canary || return 1
  else
    remove_owned_tag "$package" canary "$CANARY_VERSION" || return 1
  fi
  tags="$(read_tags "$package")" || return 1
  [[ "$(tag_value "$tags" canary)" = "$previous" ]]
}

restore_pair() {
  local failed=0
  restore_tag "$CORE_NAME" "$CORE_CANARY_BEFORE" || failed=1
  restore_tag "$NATIVE_NAME" "$NATIVE_CANARY_BEFORE" || failed=1
  return "$failed"
}

on_pair_exit() {
  local status=$?
  local recovery_failed=0
  trap - EXIT
  if [[ $status -ne 0 && "$PROMOTION_STARTED" = true ]]; then
    restore_pair || recovery_failed=1
  fi
  cleanup_staging || recovery_failed=1
  if [[ $recovery_failed -ne 0 ]]; then
    echo "::error::Could not fully restore npm dist-tags"
    [[ $status -ne 0 ]] || status=1
  fi
  exit "$status"
}

main() {
  case "${1:-}" in
    core) publish_core ;;
    pair) publish_pair ;;
    *) echo "usage: scripts/publish-canary.sh core|pair" >&2; exit 2 ;;
  esac
}

# Sourcing the file (tests) only defines the functions.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
