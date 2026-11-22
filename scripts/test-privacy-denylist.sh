#!/usr/bin/env bash
#
# test-privacy-denylist.sh — success and failure paths of privacy-denylist.sh
# in a throwaway repository. Fixtures are assembled from fragments (adjacent
# quoted strings) so this file never matches the denylist itself.

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(mktemp -d)"
trap 'rm -rf "$REPO"' EXIT

mkdir -p "$REPO/scripts"
cp "$ROOT/scripts/privacy-denylist.sh" "$REPO/scripts/"
cp "$ROOT/.privacy-denylist" "$ROOT/.privacy-allowlist" "$REPO/"
git -C "$REPO" init -q
git -C "$REPO" config user.email test@example.invalid
git -C "$REPO" config user.name test

failures=0
LAST_OUTPUT=""

# plant <text>: write a one-line fixture.
plant() { printf '%s\n' "$1" > "$REPO/doc.md"; }

# check <name> <expected exit> [VAR=value ...]
check() {
  local name="$1" expected="$2"; shift 2
  git -C "$REPO" add -A
  local status
  LAST_OUTPUT="$(cd "$REPO" && env "$@" bash scripts/privacy-denylist.sh 2>&1)"
  status=$?
  if [[ "$status" != "$expected" ]]; then
    printf 'FAIL %s: expected exit %s, got %s\n%s\n' "$name" "$expected" "$status" "$LAST_OUTPUT" >&2
    failures=$((failures + 1))
    return
  fi
  printf 'OK    %s\n' "$name"
}

# refute <name> <text>: the last output must not contain the text.
refute() {
  if grep -qF -- "$2" <<< "$LAST_OUTPUT"; then
    printf 'FAIL %s\n' "$1" >&2
    failures=$((failures + 1))
  fi
}

TAILNET="box.example-net.ts"".net"
OVH_VPS="vps-abc123fe"".vps.ovh.net"
HETZNER="node-1"".hetzner.cloud"
HETZNER_DED="static.12.34.56.clients.your-server"".de"

plant "Plain documentation."
check "clean tree passes" 0 NOOP=1

plant "host: $TAILNET"
check "tailnet hostname fails" 1 NOOP=1
grep -q 'doc.md:1' <<< "$LAST_OUTPUT" || { echo "FAIL hit location not reported" >&2; failures=$((failures + 1)); }
refute "matched content leaked to output" "example-net"

plant "host: $OVH_VPS"
check "ovh vps hostname fails" 1 NOOP=1
refute "ovh hostname leaked to output" "abc123fe"

plant "host: $HETZNER"
check "hetzner cloud hostname fails" 1 NOOP=1
refute "hetzner cloud leaked to output" "node-1"

plant "host: $HETZNER_DED"
check "hetzner dedicated hostname fails" 1 NOOP=1
refute "hetzner dedicated leaked to output" "your-server"

plant "The host is an OVH VPS (provider name only)."
check "provider name without hostname passes" 0 NOOP=1

plant "id 123e4567-e89b-12d3-a456-4266""14174000"
check "uuid fails" 1 NOOP=1

plant "path /ho""me/someone/project/"
check "home path fails" 1 NOOP=1
plant "HOME=/ho""me/someone"
check "home path without trailing slash fails" 1 NOOP=1
plant "GET /api/us""ers/123/posts"
check "url route segment passes" 0 NOOP=1
plant "cwd /ho""me/runner/work/x"
check "allowlisted runner home passes" 0 NOOP=1

plant "mail fixture@example.test"
check "reserved-domain address passes" 0 NOOP=1
plant "mail someone@""company.io"
check "real-looking address fails" 1 NOOP=1
plant "mail fixture@acme.test"".com"
check "reserved label inside a real domain fails" 1 NOOP=1
plant "git clone git@github.com:owner/repo.git"
check "ssh remote user passes" 0 NOOP=1
plant "pnpm add @scope/pkg@0.1.0-canary.bca5ab7"
check "package version pin passes" 0 NOOP=1

plant "call 415-555-""0132"
check "grouped phone number fails" 1 NOOP=1
plant "MR""R is 12k"
check "bare revenue figure fails" 1 NOOP=1

plant "ssh admin@example.com $TAILNET"
check "allowed token does not hide another match on the line" 1 NOOP=1

printf '\0host %s\n' "$TAILNET" > "$REPO/doc.md"
check "binary file is scanned" 1 NOOP=1
rm -f "$REPO/doc.md"
plant "Plain documentation."

printf 'acme-widget appears here\n' >> "$REPO/doc.md"
check "extra pattern from environment fails" 1 'PRIVACY_DENYLIST_EXTRA=acme-widget'
check "extra pattern is not echoed" 1 'PRIVACY_DENYLIST_EXTRA=acme-widget'
refute "extra pattern text leaked to output" "acme-widget"
plant "Plain documentation."
check "extra pattern not present passes" 0 'PRIVACY_DENYLIST_EXTRA=acme-widget'
check "missing private patterns warn under CI" 0 CI=true
grep -q '::warning' <<< "$LAST_OUTPUT" || { echo "FAIL no warning when private patterns are absent in CI" >&2; failures=$((failures + 1)); }

check "invalid private pattern is an error" 2 'PRIVACY_DENYLIST_EXTRA=Acme[Corp'
refute "invalid pattern text leaked to output" "Acme"
check "private pattern matching empty string is an error" 2 'PRIVACY_DENYLIST_EXTRA=acme|'

# Constructs that grep -E accepts but git grep -E rejects or silently misreads.
for construct in '(?i)acme' 'acme(?=x)' 'acme(?!x)' '\p{L}acme' 'a{32768}' '\d{3}acme' '\x41acme' '\Qacme\E'; do
  check "unsupported construct $construct is an error" 2 "PRIVACY_DENYLIST_EXTRA=$construct"
  refute "unsupported construct $construct leaked to output" "acme"
  refute "unsupported construct $construct passed validation" "git grep failed"
done
check "invalid private pattern reports its source and line" 2 "PRIVACY_DENYLIST_EXTRA=$(printf 'foo\n\n(?i)acme')"
grep -q 'extra pattern line 3' <<< "$LAST_OUTPUT" || { echo "FAIL invalid pattern source or line not reported" >&2; failures=$((failures + 1)); }
check "escaped backslash before a letter is a literal" 0 'PRIVACY_DENYLIST_EXTRA=acme\\d'
check "supported escapes and alternation pass" 0 'PRIVACY_DENYLIST_EXTRA=\bacme\s+(widget|gadget)\b'

printf 'acme-widget appears here\n' >> "$REPO/doc.md"
check "crlf and blank private lines are normalized" 1 "PRIVACY_DENYLIST_EXTRA=$(printf 'foo\r\n\r\n\nacme-widget\r\n')"
plant "Plain documentation."

cp "$REPO/.privacy-allowlist" "$REPO/allow.bak"
plant "host: $TAILNET"
printf '[unclosed\n' > "$REPO/.privacy-allowlist"
check "invalid allowlist regex is an error, not a pass" 2 NOOP=1
printf 'zzz|\n' > "$REPO/.privacy-allowlist"
check "allowlist matching empty string is an error, not a pass" 2 NOOP=1
cp "$REPO/allow.bak" "$REPO/.privacy-allowlist"

plant "host: $TAILNET"
printf '.*' > "$REPO/.privacy-allowlist"
check "unterminated last allowlist line is still validated" 2 NOOP=1
printf '^.+$\n' > "$REPO/.privacy-allowlist"
check "over-broad allowlist entry is an error, not a pass" 2 NOOP=1
mv "$REPO/allow.bak" "$REPO/.privacy-allowlist"

check "zero-width private pattern is an error" 2 'PRIVACY_DENYLIST_EXTRA=\b'
printf '\\b' > "$REPO/.privacy-denylist.local"
check "unterminated zero-width local pattern is an error" 2 NOOP=1
rm "$REPO/.privacy-denylist.local"

printf '\0/ho''me/someone\n' > "$REPO/doc.md"
check "nul-delimited token is not dropped by the allowlist filter" 1 NOOP=1

printf 'acme' > "$REPO/.privacy-denylist.local"
plant "only foo here"
check "local file and secret patterns stay separate" 1 PRIVACY_DENYLIST_EXTRA=foo
rm "$REPO/.privacy-denylist.local"

rm "$REPO/.privacy-denylist"
check "missing denylist file is an error" 2 NOOP=1

if (( failures > 0 )); then
  printf '%s failure(s)\n' "$failures" >&2
  exit 1
fi
echo "OK    privacy denylist tests passed"
