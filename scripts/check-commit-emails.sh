#!/usr/bin/env bash
#
# check-commit-emails.sh — fail when a commit in the scan range uses a
# disallowed author, committer, Co-authored-by, or Signed-off-by email,
# or when commit metadata contains a private hostname or internal IP.
#
# Matched values are never printed. Findings are reported as
#   <short-sha>  <field>  <category>
# only. Public CI logs are public.
#
# Range (first match wins):
#   $PRIVACY_COMMIT_RANGE   a git revision range, or the token --all
#   --range <rev> | --all   command-line flags
#   otherwise               --all
#
# Allowed emails (override with $ALLOWED_EMAIL_PATTERN):
#   *@users.noreply.github.com  and  noreply@github.com
#   the public GitHub bot address Dependabot signs its commits with (a
#   Signed-off-by trailer), so Dependabot pull requests are not blocked
#
# Accepted exposure (.privacy-commit-allowlist): full 40-character commit SHAs,
# one per line, '#' starts a comment. Listed commits are dropped from the range
# before any of their metadata is read, so nothing about them is printed. A
# SHA names exactly one commit; a rewritten or descendant commit is checked.
#
# Exit codes: 0 clean, 1 finding, 2 misuse.

set -u

cd "$(git rev-parse --show-toplevel)" || exit 2

ALLOWED_EMAIL_PATTERN="${ALLOWED_EMAIL_PATTERN:-(@users\.noreply\.github\.com|^noreply@github\.com|^support@github\.com)$}"
COMMIT_ALLOWLIST=.privacy-commit-allowlist

# Hostname and address patterns, assembled from fragments so this file does
# not itself match a tree denylist. Keep them generic: no personal names.
TS_NET='[a-z0-9-]+\.ts''\.net\b'
OVH_VPS='[a-z0-9-]+\.vps\.ovh''\.net\b'
OVH_VPS_CA='[a-z0-9-]+\.vps\.ovh''\.ca\b'
HETZNER_DED='[a-z0-9.-]+\.your-server''\.de\b'
HETZNER_CLOUD='[a-z0-9-]+\.hetzner''\.cloud\b'
# Tailnet CGNAT (100.64/10) and RFC1918
CGNAT='\b100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.[0-9]{1,3}\.[0-9]{1,3}\b'
RFC10='\b10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\b'
RFC192='\b192\.168\.[0-9]{1,3}\.[0-9]{1,3}\b'
RFC172='\b172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}\b'

HOSTNAME_PATTERN="${TS_NET}|${OVH_VPS}|${OVH_VPS_CA}|${HETZNER_DED}|${HETZNER_CLOUD}"
IP_PATTERN="${CGNAT}|${RFC10}|${RFC192}|${RFC172}"

usage() {
  echo "usage: $0 [--all] [--range <rev>]" >&2
  exit 2
}

RANGE="${PRIVACY_COMMIT_RANGE:-}"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all) RANGE="--all"; shift ;;
    --range)
      [[ $# -ge 2 ]] || usage
      RANGE="$2"
      shift 2
      ;;
    -h|--help) usage ;;
    *) usage ;;
  esac
done
[[ -n "$RANGE" ]] || RANGE="--all"

# Validate the allowed-email pattern without printing it.
if ! printf 'a@users.noreply.github.com\n' | grep -qE "$ALLOWED_EMAIL_PATTERN"; then
  echo "error: ALLOWED_EMAIL_PATTERN does not accept a GitHub noreply address" >&2
  exit 2
fi
if ! printf 'noreply@github.com\n' | grep -qE "$ALLOWED_EMAIL_PATTERN"; then
  echo "error: ALLOWED_EMAIL_PATTERN does not accept noreply@github.com" >&2
  exit 2
fi

# Resolve the commit list. An empty range (no new commits) is clean.
commits="$(mktemp)"
findings="$(mktemp)"
allowed="$(mktemp)"
kept="$(mktemp)"
trap 'rm -f "$commits" "$findings" "$allowed" "$kept"' EXIT

# Load the commit allowlist. Errors name the line only, never its content.
if [[ -f "$COMMIT_ALLOWLIST" ]]; then
  n=0
  while IFS= read -r entry || [[ -n "$entry" ]]; do
    n=$((n + 1))
    entry="${entry%%#*}"
    entry="${entry//[[:space:]]/}"
    [[ -n "$entry" ]] || continue
    if [[ ! "$entry" =~ ^[0-9a-f]{40}$ ]]; then
      echo "error: $COMMIT_ALLOWLIST line $n is not a full 40-character commit SHA" >&2
      exit 2
    fi
    printf '%s\n' "$entry" >> "$allowed"
  done < "$COMMIT_ALLOWLIST"
fi

if [[ "$RANGE" == "--all" ]]; then
  if ! git rev-list --all > "$commits" 2>/dev/null; then
    echo "error: could not list commits for --all" >&2
    exit 2
  fi
else
  if ! git rev-list "$RANGE" > "$commits" 2>/dev/null; then
    echo "error: invalid commit range" >&2
    exit 2
  fi
fi

# Drop allowlisted commits before any message, author or trailer is read.
skipped=0
if [[ -s "$allowed" && -s "$commits" ]]; then
  grep -vxFf "$allowed" "$commits" > "$kept" || true
  skipped=$(( $(wc -l < "$commits") - $(wc -l < "$kept") ))
  cp "$kept" "$commits"
fi
skipped_note=""
[[ "$skipped" -gt 0 ]] && skipped_note=", $skipped allowlisted skipped"

if [[ ! -s "$commits" ]]; then
  echo "OK    commit metadata: no commits in range${skipped_note}"
  exit 0
fi

# classify_email <addr> -> category (or empty if allowed)
classify_email() {
  local addr="$1"
  [[ -n "$addr" ]] || return 0
  if printf '%s\n' "$addr" | grep -qE "$ALLOWED_EMAIL_PATTERN"; then
    return 0
  fi
  if printf '%s\n' "$addr" | grep -qiE "$HOSTNAME_PATTERN"; then
    echo "private-hostname"
    return 0
  fi
  if printf '%s\n' "$addr" | grep -qiE "$IP_PATTERN"; then
    echo "private-ip"
    return 0
  fi
  echo "disallowed-email"
}

# classify_text <text> -> category (or empty)
classify_text() {
  local text="$1"
  [[ -n "$text" ]] || return 0
  if printf '%s\n' "$text" | grep -qiE "$HOSTNAME_PATTERN"; then
    echo "private-hostname"
    return 0
  fi
  if printf '%s\n' "$text" | grep -qiE "$IP_PATTERN"; then
    echo "private-ip"
    return 0
  fi
}

# extract_trailer_email <line> — Co-authored-by / Signed-off-by "Name <email>"
extract_trailer_email() {
  local line="$1" addr
  addr="$(printf '%s\n' "$line" | sed -n 's/.*<\([^>]*\)>.*/\1/p')"
  printf '%s\n' "$addr"
}

while IFS= read -r sha || [[ -n "$sha" ]]; do
  [[ -n "$sha" ]] || continue
  short="$(git rev-parse --short "$sha")"
  author="$(git log -1 --format='%ae' "$sha")"
  committer="$(git log -1 --format='%ce' "$sha")"
  subject="$(git log -1 --format='%s' "$sha")"
  body="$(git log -1 --format='%b' "$sha")"

  catg="$(classify_email "$author")"
  [[ -n "$catg" ]] && printf '%s\tauthor\t%s\n' "$short" "$catg" >> "$findings"
  catg="$(classify_email "$committer")"
  [[ -n "$catg" ]] && printf '%s\tcommitter\t%s\n' "$short" "$catg" >> "$findings"

  # Trailers only (unfolded). Do not treat the whole body as trailers.
  trailers="$(git log -1 --format='%(trailers:only,unfold)' "$sha")"
  while IFS= read -r tline || [[ -n "$tline" ]]; do
    [[ -n "$tline" ]] || continue
    key="$(printf '%s\n' "$tline" | sed -n 's/^\([^:]*\):.*/\1/p' | tr '[:upper:]' '[:lower:]')"
    case "$key" in
      co-authored-by|signed-off-by)
        addr="$(extract_trailer_email "$tline")"
        catg="$(classify_email "$addr")"
        field="Co-authored-by"
        [[ "$key" == "signed-off-by" ]] && field="Signed-off-by"
        [[ -n "$catg" ]] && printf '%s\t%s\t%s\n' "$short" "$field" "$catg" >> "$findings"
        ;;
    esac
  done <<< "$trailers"

  # Subject and body (including non-trailer text) for hostnames and internal IPs.
  # Email addresses in the message body that are not trailers are not classified
  # here; author/committer/trailer checks cover the metadata leak path.
  catg="$(classify_text "$subject")"
  [[ -n "$catg" ]] && printf '%s\tmessage\t%s\n' "$short" "$catg" >> "$findings"
  # Skip re-reporting the same category already found in the subject.
  body_catg="$(classify_text "$body")"
  if [[ -n "$body_catg" && "$body_catg" != "$catg" ]]; then
    printf '%s\tmessage\t%s\n' "$short" "$body_catg" >> "$findings"
  elif [[ -n "$body_catg" && -z "$catg" ]]; then
    printf '%s\tmessage\t%s\n' "$short" "$body_catg" >> "$findings"
  fi
done < "$commits"

if [[ -s "$findings" ]]; then
  count="$(wc -l < "$findings" | tr -d ' ')"
  echo "FAIL commit metadata: $count finding(s); values withheld"
  # field may contain a hyphen; columns are tab-separated
  sort -u "$findings" | awk -F '\t' '{printf "  %s  %s  %s\n", $1, $2, $3}'
  exit 1
fi

n="$(wc -l < "$commits" | tr -d ' ')"
echo "OK    commit metadata: $n commit(s) in range, no findings${skipped_note}"
exit 0
