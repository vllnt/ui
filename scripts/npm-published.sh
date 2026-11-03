#!/usr/bin/env bash
# Usage: npm-published.sh <package>@<exact version>
# Prints "yes" if the registry answers exactly that version, and "no" only if it
# answers E404 (not found).
# Everything else (network, auth or registry errors, an empty or different answer,
# warnings without a version) exits non-zero, so a caller that captures the output
# with `VAR=$(...)` under `set -e` fails instead of treating "could not tell" as
# "not published".
set -euo pipefail

SPEC=${1:-}
# Scoped names start with "@", so the version separator is the last "@" after the first character.
case "${SPEC#?}" in
  *@?*) ;;
  *) echo "Usage: npm-published.sh <package>@<exact version>" >&2; exit 2 ;;
esac
WANT=${SPEC##*@}

ERR=$(mktemp)
trap 'rm -f "$ERR"' EXIT

if OUT=$(npm view "$SPEC" version 2>"$ERR"); then
  if [ "$OUT" = "$WANT" ]; then
    echo yes
  else
    echo "npm view ${SPEC} answered '${OUT}' (expected '${WANT}')" >&2
    cat "$ERR" >&2
    exit 1
  fi
elif grep -q 'code E404' "$ERR"; then
  echo no
else
  cat "$ERR" >&2
  exit 1
fi
