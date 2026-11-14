#!/usr/bin/env bash
# Publish canaries for @vllnt/ui-core alone ("core") or for the @vllnt/ui-core + @vllnt/ui-native
# pair ("pair"). Called by .github/workflows/native-canary.yml; the logic lives here so both jobs
# share one copy and scripts/publish-canary.test.mjs can run it against a fake registry.
#
# Safety model:
#   - the version comes from scripts/release-guard.mjs, never from an input;
#   - a package an npm owner has not bootstrapped (no `latest` yet) is refused: this script never
#     creates a package, and a first upload would otherwise claim `latest`;
#   - uploads use a run-scoped staging tag, so no upload can move `latest` or `canary`;
#   - only after every upload is visible are the `canary` tags moved, and `latest` is verified
#     unchanged;
#   - on failure the previous `canary` tags are restored and the staging tags removed;
#   - a run that is no longer the tip of main publishes nothing.
#
# Environment: GITHUB_REF, GITHUB_SHA, GITHUB_RUN_ID, GITHUB_RUN_NUMBER, RUNNER_TEMP and
# NPM_DIST_TAG_TOKEN (trusted publishing authenticates uploads only; tag changes need a token).

# shellcheck disable=SC2329 # on_exit runs through the EXIT trap, and so do the helpers it calls
set -euo pipefail

NPM_PINNED="npm@11.18.0"
NAMES=("@vllnt/ui-core")
DIRS=("packages/ui-core")
if [[ $# -ne 1 ]]; then
  MODE=""
else
  MODE="$1"
fi
case "$MODE" in
  core) GUARD_MODE="core-canary" ;;
  pair)
    GUARD_MODE="native-canary"
    NAMES+=("@vllnt/ui-native")
    DIRS+=("packages/ui-native")
    ;;
  *)
    echo "Usage: publish-canary.sh core|pair" >&2
    exit 2
    ;;
esac

cd "$(dirname "${BASH_SOURCE[0]}")/.."

CANARY_VERSION="$(node scripts/release-guard.mjs "$GUARD_MODE")"

BASES=()
for i in "${!NAMES[@]}"; do
  test "$(node -p "require('./${DIRS[i]}/package.json').name")" = "${NAMES[i]}" || {
    echo "::error::${DIRS[i]} is not ${NAMES[i]}"
    exit 1
  }
  BASES[i]="$(node -p "require('./${DIRS[i]}/package.json').version")"
  case "${BASES[i]}" in
    *-*) echo "::error::Base package versions must not be prereleases"; exit 1 ;;
  esac
done
if [[ "$MODE" = pair && "${BASES[0]}" != "${BASES[1]}" ]]; then
  echo "::error::Core and Native base versions must match"
  exit 1
fi

if [[ -z "${NPM_DIST_TAG_TOKEN:-}" ]]; then
  echo "::error::NPM_DIST_TAG_TOKEN is required for dist-tag promotion and rollback because npm trusted publishing authenticates publish commands only"
  exit 1
fi

# Trusted publishing must not find a static token: drop setup-node's placeholder, as publish.yml does.
if [[ -n "${NPM_CONFIG_USERCONFIG:-}" && -f "$NPM_CONFIG_USERCONFIG" ]]; then
  sed -i '/_authToken/d' "$NPM_CONFIG_USERCONFIG"
fi
unset NODE_AUTH_TOKEN

# Tag commands run as the dist-tag token user through their own npmrc; uploads never do.
DIST_TAG_NPMRC="$RUNNER_TEMP/npm-dist-tag.npmrc"
# shellcheck disable=SC2016 # npm expands ${NODE_AUTH_TOKEN} itself
printf '//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}\n' >"$DIST_TAG_NPMRC"
npm_as_tag_user() {
  NPM_CONFIG_USERCONFIG="$DIST_TAG_NPMRC" NODE_AUTH_TOKEN="$NPM_DIST_TAG_TOKEN" npx --yes "$NPM_PINNED" "$@"
}
npm_as_tag_user whoami >/dev/null

current_main_sha() {
  git ls-remote --exit-code origin refs/heads/main | awk '{print $1}'
}
REMOTE_MAIN_SHA="$(current_main_sha)"
test -n "$REMOTE_MAIN_SHA"
if [[ "$REMOTE_MAIN_SHA" != "$GITHUB_SHA" ]]; then
  echo "::notice::Skipping superseded canary run for ${GITHUB_SHA}"
  exit 0
fi

STAGING_TAG="run-${GITHUB_RUN_ID}"

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

LATEST_BEFORE=()
CANARY_BEFORE=()
for i in "${!NAMES[@]}"; do
  TAGS="$(read_tags "${NAMES[i]}")"
  LATEST_BEFORE[i]="$(tag_value "$TAGS" latest)"
  CANARY_BEFORE[i]="$(tag_value "$TAGS" canary)"
  if [[ -z "${LATEST_BEFORE[i]}" ]]; then
    echo "::error::${NAMES[i]} has no latest dist-tag. An npm owner must bootstrap it first: this workflow never creates a package or sets latest"
    exit 1
  fi
done

for dir in "${DIRS[@]}"; do
  npm version "$CANARY_VERSION" --prefix "$dir" --no-git-tag-version --ignore-scripts
done
if [[ "$MODE" = pair ]]; then
  # Native ships with the exact core version published beside it (workspace:* is not publishable).
  node - "${DIRS[1]}/package.json" "$CANARY_VERSION" <<'NODE'
const fs = require("node:fs");
const [manifestPath, version] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.dependencies["@vllnt/ui-core"] = version;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
NODE
fi

PACK_DIR="$RUNNER_TEMP/canary-packs"
mkdir -p "$PACK_DIR"
TARBALLS=()
for i in "${!NAMES[@]}"; do
  TARBALLS[i]="$(pnpm --dir "${DIRS[i]}" pack --pack-destination "$PACK_DIR" | tail -n1)"
done

# Check the packed artifacts before anything is uploaded. Variables, not pipes: under pipefail a
# `tar | grep -q` can fail on SIGPIPE even when grep matched.
for i in "${!NAMES[@]}"; do
  MANIFEST="$(tar -xOf "${TARBALLS[i]}" package/package.json)"
  LISTING="$(tar -tf "${TARBALLS[i]}")"
  test "$(jq -r '.name' <<<"$MANIFEST")" = "${NAMES[i]}"
  test "$(jq -r '.version' <<<"$MANIFEST")" = "$CANARY_VERSION"
  test "$(jq -r '.main' <<<"$MANIFEST")" = "./dist/index.js"
  grep -qx 'package/dist/index.js' <<<"$LISTING" || {
    echo "::error::${NAMES[i]} tarball has no dist/index.js"
    exit 1
  }
  if grep -q 'workspace:' <<<"$MANIFEST"; then
    echo "::error::Packed ${NAMES[i]} manifest still contains a workspace protocol"
    exit 1
  fi
  if [[ "${NAMES[i]}" = "@vllnt/ui-native" ]]; then
    test "$(jq -r '.["react-native"]' <<<"$MANIFEST")" = "./dist/index.js"
    test "$(jq -r '.dependencies["@vllnt/ui-core"]' <<<"$MANIFEST")" = "$CANARY_VERSION"
  fi
done

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
  npm_as_tag_user dist-tag rm "$package" "$tag" || return 1
  tags="$(read_tags "$package")" || return 1
  [[ -z "$(tag_value "$tags" "$tag")" ]]
}
cleanup_staging() {
  local failed=0 i
  for i in "${!NAMES[@]}"; do
    remove_owned_tag "${NAMES[i]}" "$STAGING_TAG" "$CANARY_VERSION" || failed=1
  done
  return "$failed"
}
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
    npm_as_tag_user dist-tag add "${package}@${previous}" canary || return 1
  else
    remove_owned_tag "$package" canary "$CANARY_VERSION" || return 1
  fi
  tags="$(read_tags "$package")" || return 1
  [[ "$(tag_value "$tags" canary)" = "$previous" ]]
}
restore_canaries() {
  local failed=0 i
  for i in "${!NAMES[@]}"; do
    restore_tag "${NAMES[i]}" "${CANARY_BEFORE[i]}" || failed=1
  done
  return "$failed"
}

PROMOTION_STARTED=false
on_exit() {
  local status=$?
  local recovery_failed=0
  trap - EXIT
  if [[ $status -ne 0 && "$PROMOTION_STARTED" = true ]]; then
    restore_canaries || recovery_failed=1
  fi
  cleanup_staging || recovery_failed=1
  if [[ $recovery_failed -ne 0 ]]; then
    echo "::error::Could not fully restore npm dist-tags"
    [[ $status -ne 0 ]] || status=1
  fi
  exit "$status"
}
trap on_exit EXIT

# Upload each package once under the staging tag. Immutable versions already present (a rerun, or
# the core job of the same run) are reused, not re-uploaded; the next upload waits for visibility.
for i in "${!NAMES[@]}"; do
  STATE="$(version_state "${NAMES[i]}@${CANARY_VERSION}")"
  if [[ "$STATE" = absent ]]; then
    npx --yes "$NPM_PINNED" publish "${TARBALLS[i]}" --tag "$STAGING_TAG" --provenance --access public
  fi
  for _ in $(seq 1 12); do
    [[ "$(version_state "${NAMES[i]}@${CANARY_VERSION}")" = present ]] && break
    sleep 5
  done
  test "$(version_state "${NAMES[i]}@${CANARY_VERSION}")" = present
done

REMOTE_MAIN_SHA="$(current_main_sha)"
test -n "$REMOTE_MAIN_SHA"
if [[ "$REMOTE_MAIN_SHA" != "$GITHUB_SHA" ]]; then
  echo "::notice::Skipping canary promotion because main advanced to ${REMOTE_MAIN_SHA}"
  exit 0
fi

PROMOTION_STARTED=true
for i in "${!NAMES[@]}"; do
  npm_as_tag_user dist-tag add "${NAMES[i]}@${CANARY_VERSION}" canary
done

for i in "${!NAMES[@]}"; do
  TAGS="$(read_tags "${NAMES[i]}")"
  test "$(tag_value "$TAGS" canary)" = "$CANARY_VERSION"
  test "$(tag_value "$TAGS" latest)" = "${LATEST_BEFORE[i]}"
done

PROMOTION_STARTED=false
exit 0
