#!/usr/bin/env bash
# Publishes a canary from main. Run from the repository root, after the build.
#
#   scripts/publish-canary.sh core   @vllnt/ui-core alone, straight to the `canary` dist-tag.
#   scripts/publish-canary.sh pair   @vllnt/ui-core, then @vllnt/ui-native, each straight to the
#                                    `canary` dist-tag.
#
# Both paths use npm trusted publishing (OIDC) only. OIDC authenticates `npm publish` and nothing
# else, so neither path holds a registry token or runs `npm dist-tag` / `npm whoami`: there is no
# staging tag, no promotion step and no rollback through dist-tags.
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
#   - `pair` uploads core first, then native. If the native upload fails after core went up, the run
#     fails and core@canary is briefly ahead of native@canary. That is acceptable: the packed
#     ui-native manifest pins the exact ui-core version it was built with, so no install can resolve
#     a mismatched pair. The next run uploads native and reuses that core version.
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

# The pair's version of skip_if_superseded. Once this commit's core canary is on npm (the
# core-publish job or an earlier attempt uploaded it), the pair finishes instead of standing down:
# the commit that superseded this one may be web-only and run no native canary, which would leave
# core@canary ahead of native@canary with nothing to catch native up.
skip_pair_if_superseded() {
  local remote
  remote="$(current_main_sha)"
  test -n "$remote"
  if [[ "$remote" = "$GITHUB_SHA" ]]; then
    return 0
  fi
  if [[ "$(version_state "${CORE_NAME}@${CANARY_VERSION}")" = present ]]; then
    echo "::notice::${CORE_NAME}@${CANARY_VERSION} is already on npm; finishing the pair for ${GITHUB_SHA} although main moved on"
    return 0
  fi
  echo "::notice::Skipping superseded canary run for ${GITHUB_SHA}"
  exit 0
}

# Exits 0 without publishing when a newer commit has landed on main.
skip_if_superseded() {
  local remote
  remote="$(current_main_sha)"
  test -n "$remote"
  if [[ "$remote" != "$GITHUB_SHA" ]]; then
    echo "::notice::Skipping superseded canary run for ${GITHUB_SHA}"
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

# npm accepts an upload before it serves it ("Your package is being processed and may take a few
# minutes"), so poll with exponential backoff until it does. The first delay is
# CANARY_POLL_SECONDS (default 5), doubling after each poll up to CANARY_POLL_MAX_SECONDS (default
# 30). CANARY_POLL_TIMEOUT_SECONDS (default 600) is the total deadline, measured on the clock and no
# sleep outlasts it; a version still missing then fails the run. CANARY_POLL_SECONDS=0 polls
# back to back until the deadline (the harness fakes `sleep`, so its runs stay fast).
# A registry error during the wait counts as "not served yet": version_state prints it, and the
# deadline is the only way out, so a flaky poll never ends the wait early.
wait_until_present() {
  local spec="$1"
  local cap="${CANARY_POLL_MAX_SECONDS:-30}" timeout="${CANARY_POLL_TIMEOUT_SECONDS:-600}"
  local delay="${CANARY_POLL_SECONDS:-5}" started="$SECONDS" remaining
  (( delay <= cap )) || delay="$cap"
  while [[ "$(version_state "$spec")" != present ]]; do
    remaining=$(( timeout - (SECONDS - started) ))
    if (( remaining <= 0 )); then
      echo "::error::${spec} was not visible on npm after $(( SECONDS - started ))s (limit ${timeout}s)" >&2
      return 1
    fi
    sleep "$(( delay < remaining ? delay : remaining ))"
    delay=$(( delay * 2 < cap ? delay * 2 : cap ))
  done
}

# Fails the run, naming the package, unless `canary` is the version this run published and `latest`
# is what it was before the run.
verify_tags() {
  local package="$1" latest_before="$2" tags
  tags="$(read_tags "$package")"
  if [[ "$(tag_value "$tags" canary)" != "$CANARY_VERSION" ]]; then
    echo "::error::${package} dist-tag canary is '$(tag_value "$tags" canary)', expected ${CANARY_VERSION}" >&2
    return 1
  fi
  if [[ "$(tag_value "$tags" latest)" != "$latest_before" ]]; then
    echo "::error::${package} dist-tag latest moved from ${latest_before} to $(tag_value "$tags" latest)" >&2
    return 1
  fi
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
  : "${RUNNER_TEMP:?}" "${GITHUB_SHA:?}"
  use_oidc_auth

  CANARY_VERSION="$(node scripts/release-guard.mjs native-canary)"
  test "$(package_field "$CORE_DIR" name)" = "$CORE_NAME"
  test "$(package_field "$NATIVE_DIR" name)" = "$NATIVE_NAME"

  local core_base native_base
  core_base="$(package_field "$CORE_DIR" version)"
  native_base="$(package_field "$NATIVE_DIR" version)"
  test "$core_base" = "$native_base"
  require_stable_base "$CORE_DIR"

  skip_pair_if_superseded

  local core_tags_before native_tags_before core_latest_before native_latest_before
  core_tags_before="$(read_tags "$CORE_NAME")"
  native_tags_before="$(read_tags "$NATIVE_NAME")"
  require_bootstrapped "$CORE_NAME" "$core_tags_before"
  require_bootstrapped "$NATIVE_NAME" "$native_tags_before"
  core_latest_before="$(tag_value "$core_tags_before" latest)"
  native_latest_before="$(tag_value "$native_tags_before" latest)"

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

  # Straight to the canary dist-tag, core first: one OIDC upload each, no staging and no token.
  # Once started, the run finishes both uploads even if main advances: stopping between them would
  # leave core ahead of native and still exit 0. A newer run waits in the same concurrency group
  # and publishes next.
  local state
  state="$(version_state "${CORE_NAME}@${CANARY_VERSION}")"
  # Present already: the `core` job of this same commit published it. Reuse it.
  if [[ "$state" = absent ]]; then
    publish_tarball "$core_tarball" canary
  fi
  wait_until_present "${CORE_NAME}@${CANARY_VERSION}"

  state="$(version_state "${NATIVE_NAME}@${CANARY_VERSION}")"
  if [[ "$state" = absent ]]; then
    publish_tarball "$native_tarball" canary
  fi
  wait_until_present "${NATIVE_NAME}@${CANARY_VERSION}"

  verify_tags "$CORE_NAME" "$core_latest_before"
  verify_tags "$NATIVE_NAME" "$native_latest_before"
  echo "::notice::${CORE_NAME}@${CANARY_VERSION} and ${NATIVE_NAME}@${CANARY_VERSION} are on the canary tag"
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
