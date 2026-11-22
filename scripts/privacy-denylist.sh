#!/usr/bin/env bash
#
# privacy-denylist.sh — fail when a tracked file matches a denylist pattern
# outside the allowlist.
#
# Patterns (extended regex, one per line, '#' comments; matched case-insensitively):
#   .privacy-denylist          required, tracked, structural patterns only
#   .privacy-denylist.local    optional, untracked, for names that must stay private
#   $PRIVACY_DENYLIST_EXTRA    optional, newline-separated; set it from a CI secret
# Allowlist (.privacy-allowlist): regexes matched against "path:line:token" for each
# matched token, so an allowed token never hides another match on the same line.
#
# Matched content and pattern text are never printed: CI logs of a public
# repository are public.
#
# Limits: only tracked files at the checked-out revision are scanned, not the
# commits of a pull request (gitleaks covers secret-shaped data in all history).
# UTF-16 text is not matched, and the allowlist file itself is not scanned.
#
# Exit codes: 0 clean, 1 match found, 2 misuse or invalid pattern.

set -u

cd "$(git rev-parse --show-toplevel)" || exit 2

DENY=.privacy-denylist
ALLOW=.privacy-allowlist
SELF=scripts/privacy-denylist.sh

tracked="$(mktemp)"
extra="$(mktemp)"
local_raw="$(mktemp)"
extra_raw="$(mktemp)"
patterns="$(mktemp)"
allow_patterns="$(mktemp)"
hits="$(mktemp)"
kept="$(mktemp)"
probe="$(mktemp -d)"
trap 'rm -f "$tracked" "$extra" "$local_raw" "$extra_raw" "$patterns" "$allow_patterns" "$hits" "$kept"; rm -rf "$probe"' EXIT
printf '\n' > "$probe/empty"
printf 'a b\n' > "$probe/text"

strip() { tr -d '\r' | sed -E '/^[[:space:]]*(#|$)/d'; }
# lines <file>: the file with a guaranteed final newline.
lines() { cat "$1"; printf '\n'; }

# Probes run a pattern with the engine and flags that later use it: git grep -iE for
# the denylist scan, grep -E for the allowlist filter. The two dialects differ.
# deny_probe/allow_probe <flag> <pattern> <probe file>
deny_probe() { (cd "$probe" && git grep --no-index -h -iE "$1" -e "$2" -- "$3" 2> /dev/null); }
allow_probe() { grep -E "$1" -e "$2" -- "$probe/$3" 2> /dev/null; }

# A backslash before a letter or 0, other than \b \B \s \S \w \W, is a PCRE-style
# escape (\d, \x41, \Q, \p{L}) that extended regex silently misreads.
UNSUPPORTED_ESCAPE='(^|[^\])(\\\\)*\\[AC-RT-VX-Zac-rt-vx-z0]'

# valid_regexes <file> <source> <probe>: every pattern line must compile with its
# engine and must not match the empty string. Errors name the source and line only.
valid_regexes() {
  local file="$1" source="$2" probe_with="$3" n=0 line status
  while IFS= read -r line || [[ -n "$line" ]]; do
    n=$((n + 1))
    line="${line//$'\r'/}"
    [[ "$line" =~ ^[[:space:]]*(#|$) ]] && continue
    if [[ "$line" =~ $UNSUPPORTED_ESCAPE ]]; then
      echo "error: $source pattern line $n uses an escape extended regex does not support" >&2
      return 1
    fi
    "$probe_with" -q "$line" empty
    status=$?
    if (( status > 1 )); then
      echo "error: $source pattern line $n is not a valid regex" >&2
      return 1
    fi
    if (( status == 0 )); then
      echo "error: $source pattern line $n matches the empty string" >&2
      return 1
    fi
    # Zero-width patterns (\b, ^, $) match inside real text but report nothing.
    if [[ -z "$("$probe_with" -o "$line" text)" ]] && "$probe_with" -q "$line" text; then
      echo "error: $source pattern line $n is zero-width" >&2
      return 1
    fi
  done < "$file"
}

if [[ ! -f "$DENY" ]]; then
  echo "error: $DENY is required" >&2
  exit 2
fi
[[ -f "$DENY.local" ]] && cat "$DENY.local" > "$local_raw"
[[ -n "${PRIVACY_DENYLIST_EXTRA:-}" ]] && printf '%s\n' "$PRIVACY_DENYLIST_EXTRA" > "$extra_raw"
lines "$DENY" | strip > "$tracked"
{ lines "$local_raw"; lines "$extra_raw"; } | strip > "$extra"
cat "$tracked" "$extra" > "$patterns"
[[ -f "$ALLOW" ]] && lines "$ALLOW" | strip > "$allow_patterns"

if [[ ! -s "$tracked" ]]; then
  echo "error: $DENY has no patterns" >&2
  exit 2
fi
valid_regexes "$DENY" "tracked" deny_probe || exit 2
valid_regexes "$local_raw" "local" deny_probe || exit 2
valid_regexes "$extra_raw" "extra" deny_probe || exit 2
[[ -f "$ALLOW" ]] && { valid_regexes "$ALLOW" "allowlist" allow_probe || exit 2; }
if [[ -s "$allow_patterns" ]] && [[ -z "$(printf '%s\n' 'zz/canary.md:1:canary.ts''.net' | grep -avEf "$allow_patterns")" ]]; then
  echo "error: allowlist is too broad; it would hide an obvious match" >&2
  exit 2
fi

# -a scans binary files as text; -o reports each matched token on its own line.
git grep -naoiE -f "$patterns" -- . ":(exclude)$DENY" ":(exclude)$ALLOW" ":(exclude)$SELF" > "$hits" 2> /dev/null
status=$?
if (( status > 1 )); then
  echo "error: git grep failed" >&2
  exit 2
fi

if [[ -s "$allow_patterns" ]]; then
  grep -avEf "$allow_patterns" "$hits" > "$kept"
  status=$?
  if (( status > 1 )); then
    echo "error: allowlist filtering failed" >&2
    exit 2
  fi
  mv "$kept" "$hits"
fi

if [[ -s "$hits" ]]; then
  echo "FAIL privacy denylist: $(wc -l < "$hits" | tr -d ' ') match(es); content withheld"
  cut -d: -f1,2 "$hits" | sort -u | sed 's/^/  /'
  exit 1
fi

extra_count="$(wc -l < "$extra" | tr -d ' ')"
if [[ "${CI:-}" == "true" && "$extra_count" == "0" ]]; then
  echo "::warning title=Privacy guard::No private patterns loaded; only the tracked structural patterns were checked."
fi
echo "OK    privacy denylist: no matches ($(wc -l < "$tracked" | tr -d ' ') tracked + $extra_count private patterns)"
