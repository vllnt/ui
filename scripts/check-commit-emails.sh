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
#   otherwise, if a baseline file is present, <baseline-sha>..HEAD
#   otherwise               --all
#
# Optional committed baseline file (default .privacy-baseline, override
# with $PRIVACY_BASELINE_FILE or --baseline-file). Allowed only for
# historical exposure the maintainer has accepted, recorded in the
# security-findings ledger. The file is validated whenever it is present.
# --print-baseline prints the resolved SHA and exits, or prints nothing
# and exits 0 when the file is absent.
#
# Allowed emails (override with $ALLOWED_EMAIL_PATTERN):
#   *@users.noreply.github.com  and  noreply@github.com
#   the public GitHub bot address Dependabot signs its commits with (a
#   Signed-off-by trailer), so Dependabot pull requests are not blocked
#
# Exit codes: 0 clean, 1 finding, 2 misuse.

set -u

cd "$(git rev-parse --show-toplevel)" || exit 2

ALLOWED_EMAIL_PATTERN="${ALLOWED_EMAIL_PATTERN:-(@users\.noreply\.github\.com|^noreply@github\.com|^support@github\.com)$}"

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
  echo "usage: $0 [--all] [--range <rev>] [--print-baseline] [--baseline-file <path>]" >&2
  exit 2
}

# parse_baseline <path>
#   Prints the resolved 40-character commit SHA on stdout.
#   Exit 2 on a present but invalid file. Does not print reason text.
parse_baseline() {
  local file="$1"
  local line key value sha="" reason="" decided=""
  local -A seen=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "${line// /}" ]] && continue
    [[ "$line" == \#* ]] && continue
    if [[ "$line" != *:* ]]; then
      echo "error: .privacy-baseline has a malformed line" >&2
      return 2
    fi
    key="${line%%:*}"
    value="${line#*:}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    key="${key,,}"
    if [[ -z "$key" ]]; then
      echo "error: .privacy-baseline has a malformed line" >&2
      return 2
    fi
    if [[ -n "${seen[$key]:-}" ]]; then
      echo "error: .privacy-baseline has a duplicate key" >&2
      return 2
    fi
    seen[$key]=1
    case "$key" in
      sha)
        if [[ ! "$value" =~ ^[0-9a-fA-F]{7,40}$ ]]; then
          echo "error: .privacy-baseline sha is not a git SHA" >&2
          return 2
        fi
        sha="$value"
        ;;
      reason)
        if [[ -z "$value" ]]; then
          echo "error: .privacy-baseline reason is empty" >&2
          return 2
        fi
        reason="$value"
        ;;
      decided)
        if [[ ! "$value" =~ ^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$ ]]; then
          echo "error: .privacy-baseline decided must be YYYY-MM-DD" >&2
          return 2
        fi
        decided="$value"
        ;;
      *)
        echo "error: .privacy-baseline has an unknown key" >&2
        return 2
        ;;
    esac
  done < "$file"
  if [[ -z "$sha" || -z "$reason" || -z "$decided" ]]; then
    echo "error: .privacy-baseline must set sha, reason, and decided" >&2
    return 2
  fi
  local resolved
  if ! resolved="$(git rev-parse --verify "${sha}^{commit}" 2>/dev/null)"; then
    echo "error: .privacy-baseline sha does not resolve to a commit" >&2
    return 2
  fi
  printf '%s\n' "$resolved"
}

RANGE="${PRIVACY_COMMIT_RANGE:-}"
BASELINE_FILE="${PRIVACY_BASELINE_FILE:-.privacy-baseline}"
PRINT_BASELINE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --all) RANGE="--all"; shift ;;
    --range)
      [[ $# -ge 2 ]] || usage
      RANGE="$2"
      shift 2
      ;;
    --print-baseline) PRINT_BASELINE=1; shift ;;
    --baseline-file)
      [[ $# -ge 2 ]] || usage
      BASELINE_FILE="$2"
      shift 2
      ;;
    -h|--help) usage ;;
    *) usage ;;
  esac
done

BASELINE_SHA=""
if [[ -f "$BASELINE_FILE" ]]; then
  if ! BASELINE_SHA="$(parse_baseline "$BASELINE_FILE")"; then
    exit 2
  fi
elif [[ -e "$BASELINE_FILE" ]]; then
  echo "error: .privacy-baseline exists but is not a regular file" >&2
  exit 2
fi

if [[ "$PRINT_BASELINE" -eq 1 ]]; then
  if [[ -n "$BASELINE_SHA" ]]; then
    printf '%s\n' "$BASELINE_SHA"
  fi
  exit 0
fi

if [[ -z "$RANGE" ]]; then
  if [[ -n "$BASELINE_SHA" ]]; then
    RANGE="${BASELINE_SHA}..HEAD"
  else
    RANGE="--all"
  fi
fi

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
trap 'rm -f "$commits" "$findings"' EXIT

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

if [[ ! -s "$commits" ]]; then
  echo "OK    commit metadata: no commits in range"
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
echo "OK    commit metadata: $n commit(s) in range, no findings"
exit 0
