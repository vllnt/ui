#!/usr/bin/env bash
#
# test-check-commit-emails.sh — success and failure paths of
# check-commit-emails.sh in a throwaway repository. Fixtures are assembled
# from fragments so this file never matches a tree denylist.

set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(mktemp -d)"
trap 'rm -rf "$REPO"' EXIT

mkdir -p "$REPO/scripts"
cp "$ROOT/scripts/check-commit-emails.sh" "$REPO/scripts/"
chmod +x "$REPO/scripts/check-commit-emails.sh"

git -C "$REPO" init -q
git -C "$REPO" config user.email "123+tester@users.noreply.github.com"
git -C "$REPO" config user.name tester

failures=0
LAST_OUTPUT=""
LAST_STATUS=0

# Fragmented fixtures (adjacent quoted strings).
ICLOUD_ADDR="someone@""icloud.com"
OVH_HOST="vps-abc123fe"".vps.ovh.net"
OVH_EMAIL="ubuntu@${OVH_HOST}"
TS_HOST="box.example-net.ts"".net"
PRIV_IP="192.168"."0.42"
NOREPLY="123+tester@users.noreply.github.com"
WEB_FLOW="noreply@github.com"
SYNTH_HOST="vps-0000test"".vps.ovh.net"
BOT_ADDR="support@""github.com"
BOT_LOOKALIKE="support@""github.com.example"
ALLOWLIST="$REPO/.privacy-commit-allowlist"

commit() {
  # commit <message> [VAR=value ...]  — runs in $REPO
  local message="$1"; shift
  printf 'x\n' >> "$REPO/doc.md"
  git -C "$REPO" add doc.md
  (cd "$REPO" && env "$@" git commit -q -m "$message")
}

run() {
  local name="$1" expected="$2"; shift 2
  local envvars=() args=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --all)
        args+=("$1"); shift
        ;;
      --range)
        args+=("$1" "$2"); shift 2
        ;;
      *=*)
        envvars+=("$1"); shift
        ;;
      *)
        args+=("$1"); shift
        ;;
    esac
  done
  LAST_OUTPUT="$(cd "$REPO" && env "${envvars[@]}" bash scripts/check-commit-emails.sh "${args[@]}" 2>&1)"
  LAST_STATUS=$?
  if [[ "$LAST_STATUS" != "$expected" ]]; then
    printf 'FAIL %s: expected exit %s, got %s\n%s\n' "$name" "$expected" "$LAST_STATUS" "$LAST_OUTPUT" >&2
    failures=$((failures + 1))
    return 1
  fi
  printf 'OK    %s\n' "$name"
  return 0
}

refute() {
  local name="$1" text="$2"
  if grep -qF -- "$text" <<< "$LAST_OUTPUT"; then
    printf 'FAIL %s: output leaked %s\n%s\n' "$name" "<value withheld>" "$LAST_OUTPUT" >&2
    failures=$((failures + 1))
  fi
}

expect() {
  local name="$1" text="$2"
  if ! grep -qE -- "$text" <<< "$LAST_OUTPUT"; then
    printf 'FAIL %s: output missing %s\n%s\n' "$name" "$text" "$LAST_OUTPUT" >&2
    failures=$((failures + 1))
  fi
}

# 1. Clean history of noreply commits passes (full history).
commit "clean base"
run "noreply history passes" 0 PRIVACY_COMMIT_RANGE=--all

# 2. Personal author email fails; value withheld; sha and category reported.
commit "personal author" GIT_AUTHOR_EMAIL="$ICLOUD_ADDR" GIT_AUTHOR_NAME=someone
personal_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "personal author email fails" 1 PRIVACY_COMMIT_RANGE=--all
expect "reports author field" "author"
expect "reports disallowed-email" "disallowed-email"
expect "reports short sha" "$personal_sha"
refute "does not print personal address" "$ICLOUD_ADDR"
refute "does not print local-part" "someone@"

# Reset to a clean line by going back? Keep going; later tests use ranges.

# 3. Personal Co-authored-by trailer fails.
commit "$(printf 'add collaborator\n\nCo-authored-by: Someone <%s>\n' "$ICLOUD_ADDR")"
trailer_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "personal Co-authored-by fails" 1 --range "$trailer_sha^..$trailer_sha"
expect "reports Co-authored-by" "Co-authored-by"
expect "reports disallowed-email for trailer" "disallowed-email"
refute "trailer value withheld" "$ICLOUD_ADDR"

# 4. Personal Signed-off-by trailer fails.
commit "$(printf 'signoff\n\nSigned-off-by: Someone <%s>\n' "$ICLOUD_ADDR")"
sign_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "personal Signed-off-by fails" 1 --range "$sign_sha^..$sign_sha"
expect "reports Signed-off-by" "Signed-off-by"
refute "signoff value withheld" "$ICLOUD_ADDR"

# 5. Provider VPS hostname as author email fails as private-hostname.
commit "vps author" GIT_AUTHOR_EMAIL="$OVH_EMAIL" GIT_AUTHOR_NAME=ubuntu
vps_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "vps hostname author fails" 1 --range "$vps_sha^..$vps_sha"
expect "reports private-hostname" "private-hostname"
expect "reports author for vps" "author"
refute "vps hostname withheld" "$OVH_HOST"
refute "vps email withheld" "$OVH_EMAIL"

# 6. web-flow committer (noreply@github.com) is allowed with a noreply author.
commit "web flow" GIT_COMMITTER_EMAIL="$WEB_FLOW" GIT_COMMITTER_NAME=GitHub
web_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "web-flow committer passes" 0 --range "$web_sha^..$web_sha"

# 7. Commit message with a tailnet hostname fails; value withheld.
commit "mention $TS_HOST in the subject"
ts_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "tailnet hostname in message fails" 1 --range "$ts_sha^..$ts_sha"
expect "reports message field" "message"
expect "reports private-hostname for ts" "private-hostname"
refute "ts hostname withheld" "$TS_HOST"

# 8. Commit message with an RFC1918 address fails.
commit "bind to $PRIV_IP"
ip_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "private ip in message fails" 1 --range "$ip_sha^..$ip_sha"
expect "reports private-ip" "private-ip"
refute "private ip withheld" "$PRIV_IP"

# 9. A range that excludes dirty history passes.
# The first commit is clean; use that one only.
root="$(git -C "$REPO" rev-list --max-parents=0 HEAD)"
root_short="$(git -C "$REPO" rev-parse --short "$root")"
# Range of only the root commit: root^ is invalid; use root --not? Use
# git rev-list "$root" -1 via a one-commit range by SHA equality.
# --range does rev-list RANGE; a single sha lists that commit and ancestors.
# Use the root..root (empty) plus we need only the root. Pass the root as
# a range by setting PRIVACY_COMMIT_RANGE to the root sha — rev-list <sha>
# lists the sha and all ancestors, which for root is just root.
run "range of only the clean root passes" 0 --range "$root"
expect "clean range ok line" "OK"

# 10. Empty range is clean (range from HEAD to HEAD with two-dot is empty).
head_sha="$(git -C "$REPO" rev-parse HEAD)"
run "empty two-dot range passes" 0 --range "${head_sha}..${head_sha}"
expect "empty range message" "no commits in range"

# 11. Invalid range is misuse.
run "invalid range exits 2" 2 --range "this-is-not-a-rev-xyz"

# 12. Full history still fails (dirty commits exist).
run "full history with dirt fails" 1 --all
expect "full history fail line" "FAIL commit metadata"

# 13. A hostname-looking trailer fails; a full or bare host is withheld.
commit "$(printf 'add host\n\nCo-authored-by: ubuntu <ubuntu@%s>\n' "$SYNTH_HOST")"
host_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "hostname Co-authored-by fails" 1 --range "$host_sha^..$host_sha"
expect "reports Co-authored-by for host" "Co-authored-by"
expect "reports private-hostname for trailer" "private-hostname"
refute "trailer hostname withheld" "$SYNTH_HOST"
refute "trailer host name withheld" "vps-0000test"

commit "$(printf 'add bare host\n\nCo-authored-by: ubuntu <ubuntu@vps-0000test>\n')"
bare_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "bare hostname Co-authored-by fails" 1 --range "$bare_sha^..$bare_sha"
expect "reports disallowed-email for bare host" "disallowed-email"
refute "bare host name withheld" "vps-0000test"

# 14. The public Dependabot sign-off address passes; a lookalike does not.
commit "$(printf 'bump a dependency\n\nSigned-off-by: dependabot[bot] <%s>\n' "$BOT_ADDR")"
bot_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "Dependabot sign-off address passes" 0 --range "$bot_sha^..$bot_sha"

commit "$(printf 'lookalike\n\nSigned-off-by: someone <%s>\n' "$BOT_LOOKALIKE")"
look_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "lookalike of the bot address fails" 1 --range "$look_sha^..$look_sha"
expect "reports Signed-off-by for lookalike" "Signed-off-by"
refute "lookalike withheld" "$BOT_LOOKALIKE"

# 15. Commit allowlist: full SHAs only, checked before anything is read or printed.
commit "accepted author" GIT_AUTHOR_EMAIL="$ICLOUD_ADDR" GIT_AUTHOR_NAME=someone
acc1="$(git -C "$REPO" rev-parse HEAD)"
acc1_short="$(git -C "$REPO" rev-parse --short HEAD)"
commit "$(printf 'accepted trailers mention %s\n\nCo-authored-by: Someone <%s>\nCo-authored-by: ubuntu <ubuntu@%s>\n' "$TS_HOST" "$ICLOUD_ADDR" "$OVH_HOST")"
acc2="$(git -C "$REPO" rev-parse HEAD)"
acc2_short="$(git -C "$REPO" rev-parse --short HEAD)"
commit "$(printf 'not accepted\n\nCo-authored-by: Someone <%s>\n' "$ICLOUD_ADDR")"
bad="$(git -C "$REPO" rev-parse HEAD)"
bad_short="$(git -C "$REPO" rev-parse --short HEAD)"

run "without an allowlist the range fails" 1 --range "$acc1^..$bad"
expect "unlisted commit reported" "$bad_short"

printf '%s\n' "$acc1" "$acc2" > "$ALLOWLIST"
run "allowlisted commits are skipped, an unlisted one still fails" 1 --range "$acc1^..$bad"
expect "reports the unlisted commit" "$bad_short"
expect "reports one finding" "1 finding"
refute "allowlisted author commit not printed" "$acc1_short"
refute "allowlisted trailer commit not printed" "$acc2_short"
refute "allowlisted personal address withheld" "$ICLOUD_ADDR"
refute "allowlisted tailnet host withheld" "$TS_HOST"
refute "allowlisted provider host withheld" "$OVH_HOST"

printf '# accepted\n\n%s # author\n%s\n   %s   # trailers\n' "$acc1" "$acc2" "$bad" > "$ALLOWLIST"
run "comments, blank lines and inline comments are accepted" 0 --range "$acc1^..$bad"
expect "skipped count reported" "3 allowlisted skipped"
refute "skipped run withholds the address" "$ICLOUD_ADDR"

run "a range of one allowlisted commit is empty" 0 --range "$acc1^..$acc1"
expect "empty range reports the skip" "no commits in range, 1 allowlisted skipped"

commit "accepted author again" GIT_AUTHOR_EMAIL="$ICLOUD_ADDR" GIT_AUTHOR_NAME=someone
again_short="$(git -C "$REPO" rev-parse --short HEAD)"
run "a later commit is not covered by earlier entries" 1 --range "$acc1^..HEAD"
expect "reports the later commit" "$again_short"

git -C "$REPO" rev-list --all > "$ALLOWLIST"
run "allowlisting every commit clears a full scan" 0 --all
expect "full scan reports the skips" "allowlisted skipped"

printf '%s\n' "${acc1:0:8}" > "$ALLOWLIST"
run "a short SHA in the allowlist is rejected" 2 --range "$acc1^..$bad"
expect "error names the line" "line 1"

printf '%s\n' "$ICLOUD_ADDR" > "$ALLOWLIST"
run "a non-SHA line in the allowlist is rejected" 2 --range "$acc1^..$bad"
refute "rejected line is not echoed" "$ICLOUD_ADDR"

rm -f "$ALLOWLIST"
run "removing the allowlist restores the failure" 1 --range "$acc1^..$bad"

if [[ "$failures" -ne 0 ]]; then
  echo "FAILED $failures test(s)" >&2
  exit 1
fi
echo "All check-commit-emails tests passed."
exit 0
