#!/usr/bin/env bash
# Usage: npm-published.sh <package or package@version>
# Prints "yes" if the registry has it and "no" if the registry answers E404.
# Any other failure (network, auth, registry error) exits non-zero, so a caller
# that captures the output with `VAR=$(...)` under `set -e` fails instead of
# treating "could not tell" as "not published".
set -euo pipefail

if OUT=$(npm view "$1" version 2>&1); then
  [ -n "$OUT" ] && echo yes || echo no
elif grep -q 'code E404' <<<"$OUT"; then
  echo no
else
  echo "$OUT" >&2
  exit 1
fi
