#!/usr/bin/env bash
#
# test-check-commit-emails.sh — success and failure paths of
# check-commit-emails.sh in a throwaway repository. Fixtures are assembled
# from fragments so this file never matches a tree denylist.

set -u

# The checker reads these from the environment. CI exports a real range for
# the later steps, which is not a valid range in the throwaway repository, so
# tests that need one pass it explicitly through run().
unset PRIVACY_COMMIT_RANGE PRIVACY_BASELINE_FILE ALLOWED_EMAIL_PATTERN

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO="$(mktemp -d)"
trap 'rm -rf "$REPO"' EXIT

mkdir -p "$REPO/scripts"
cp "$ROOT/scripts/check-commit-emails.sh" "$REPO/scripts/"
chmod +x "$REPO/scripts/check-commit-emails.sh"

git -C "$REPO" init -q
git -C "$REPO" config user.email "123+tester@users.noreply.github.com"
git -C "$REPO" config user.name tester
git -C "$REPO" config commit.gpgsign false

failures=0
LAST_OUTPUT=""
LAST_STATUS=0

# Fixtures are assembled from fragments so this file never contains a
# contiguous real provider suffix, personal mailbox domain, or private
# address — including extra denylist patterns that may be loaded in CI.
# Assembled values stay valid for the checks below.
DISALLOWED_ADDR="someone@""example.invalid"
OVH_HOST="v""ps-abc123fe.v""ps.ov""h.net"
OVH_EMAIL="ubuntu@${OVH_HOST}"
TS_HOST="box.example-tailnet"".ts.net"
PRIV_IP="192.168"."0.42"
NOREPLY="123+tester@users.noreply.github.com"
WEB_FLOW="noreply@github.com"
SYNTH_HOST="v""ps-0000test.v""ps.ov""h.net"
SYNTH_HOST_BARE="v""ps-0000test"
BOT_ADDR="support@""github.com"
BOT_LOOKALIKE="support@""github.com.example"

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
      --range|--baseline-file)
        args+=("$1" "$2"); shift 2
        ;;
      --print-baseline)
        args+=("$1"); shift
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
commit "personal author" GIT_AUTHOR_EMAIL="$DISALLOWED_ADDR" GIT_AUTHOR_NAME=someone
personal_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "personal author email fails" 1 PRIVACY_COMMIT_RANGE=--all
expect "reports author field" "author"
expect "reports disallowed-email" "disallowed-email"
expect "reports short sha" "$personal_sha"
refute "does not print personal address" "$DISALLOWED_ADDR"
refute "does not print local-part" "someone@"

# Reset to a clean line by going back? Keep going; later tests use ranges.

# 3. Personal Co-authored-by trailer fails.
commit "$(printf 'add collaborator\n\nCo-authored-by: Someone <%s>\n' "$DISALLOWED_ADDR")"
trailer_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "personal Co-authored-by fails" 1 --range "$trailer_sha^..$trailer_sha"
expect "reports Co-authored-by" "Co-authored-by"
expect "reports disallowed-email for trailer" "disallowed-email"
refute "trailer value withheld" "$DISALLOWED_ADDR"

# 4. Personal Signed-off-by trailer fails.
commit "$(printf 'signoff\n\nSigned-off-by: Someone <%s>\n' "$DISALLOWED_ADDR")"
sign_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "personal Signed-off-by fails" 1 --range "$sign_sha^..$sign_sha"
expect "reports Signed-off-by" "Signed-off-by"
refute "signoff value withheld" "$DISALLOWED_ADDR"

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

# 12a. A hostname-looking trailer fails; a full or bare host is withheld.
commit "$(printf 'add host\n\nCo-authored-by: ubuntu <ubuntu@%s>\n' "$SYNTH_HOST")"
host_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "hostname Co-authored-by fails" 1 --range "$host_sha^..$host_sha"
expect "reports Co-authored-by for host" "Co-authored-by"
expect "reports private-hostname for trailer" "private-hostname"
refute "trailer hostname withheld" "$SYNTH_HOST"
refute "trailer host name withheld" "$SYNTH_HOST_BARE"

commit "$(printf 'add bare host\n\nCo-authored-by: ubuntu <ubuntu@%s>\n' "$SYNTH_HOST_BARE")"
bare_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "bare hostname Co-authored-by fails" 1 --range "$bare_sha^..$bare_sha"
expect "reports disallowed-email for bare host" "disallowed-email"
refute "bare host name withheld" "$SYNTH_HOST_BARE"

# 12b. The public Dependabot sign-off address passes; a lookalike does not.
commit "$(printf 'bump a dependency\n\nSigned-off-by: dependabot[bot] <%s>\n' "$BOT_ADDR")"
bot_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "Dependabot sign-off address passes" 0 --range "$bot_sha^..$bot_sha"

commit "$(printf 'lookalike\n\nSigned-off-by: someone <%s>\n' "$BOT_LOOKALIKE")"
look_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "lookalike of the bot address fails" 1 --range "$look_sha^..$look_sha"
expect "reports Signed-off-by for lookalike" "Signed-off-by"
refute "lookalike withheld" "$BOT_LOOKALIKE"

# --- SHA baseline ---

write_baseline() {
  local dest="${4:-$REPO/.privacy-baseline}"
  printf '%s\n' \
    "# test fixture — not a production baseline" \
    "" \
    "sha: $1" \
    "reason: $2" \
    "decided: $3" \
    > "$dest"
}

# 13. No baseline file: --print-baseline is silent and succeeds.
run "print-baseline without file is silent" 0 --print-baseline
if [[ -n "$LAST_OUTPUT" ]]; then
  printf 'FAIL print-baseline without file: expected empty output\n%s\n' "$LAST_OUTPUT" >&2
  failures=$((failures + 1))
fi

# 14–16. A valid baseline excludes earlier dirt and is printed as a full SHA.
commit "dirt before baseline" GIT_AUTHOR_EMAIL="$DISALLOWED_ADDR" GIT_COMMITTER_EMAIL="$DISALLOWED_ADDR"
dirty_full="$(git -C "$REPO" rev-parse HEAD)"
dirty_short="$(git -C "$REPO" rev-parse --short HEAD)"
commit "clean after baseline"
write_baseline "$dirty_full" "accepted historical test fixture" "2026-11-22"
run "print-baseline emits resolved sha" 0 --print-baseline
if [[ "$LAST_OUTPUT" != "$dirty_full" ]]; then
  printf 'FAIL print-baseline emits resolved sha: expected the baseline sha only\n' >&2
  failures=$((failures + 1))
fi
run "baseline excludes earlier dirt" 0
expect "baseline auto-range ok" "OK"
# The baseline commit is itself dirty and many dirty commits sit before it.
# Only the one noreply commit after it is scanned, and nothing is printed
# about the excluded ones.
expect "only the commit after the baseline is scanned" "1 commit\(s\) in range"
refute "baseline commit is not reported" "$dirty_short"
run "explicit --all overrides baseline" 1 --all
expect "override still reports fail" "FAIL commit metadata"
refute "override withholds disallowed" "$DISALLOWED_ADDR"

# 17. Dirt after the baseline is still detected.
commit "dirt after baseline" GIT_AUTHOR_EMAIL="$DISALLOWED_ADDR" GIT_COMMITTER_EMAIL="$DISALLOWED_ADDR"
run "dirt after baseline still fails" 1
expect "post-baseline finding" "disallowed-email"
refute "post-baseline withheld" "$DISALLOWED_ADDR"

# 17a. A non-noreply Co-authored-by trailer after the baseline is detected
# by the baseline range itself, and the value is withheld.
commit "$(printf 'add collaborator\n\nCo-authored-by: Someone <%s>\n' "$DISALLOWED_ADDR")"
post_trailer_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "Co-authored-by after baseline fails" 1
expect "baseline range reports the trailer commit" "$post_trailer_sha"
expect "baseline range reports the trailer field" "Co-authored-by"
refute "post-baseline trailer withheld" "$DISALLOWED_ADDR"

# 17b. A hostname-looking trailer after the baseline is detected, withheld.
commit "$(printf 'add host\n\nCo-authored-by: ubuntu <ubuntu@%s>\n' "$SYNTH_HOST")"
post_host_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "hostname trailer after baseline fails" 1
expect "baseline range reports the host commit" "$post_host_sha"
expect "baseline range reports private-hostname" "private-hostname"
refute "post-baseline host withheld" "$SYNTH_HOST"
refute "post-baseline host name withheld" "$SYNTH_HOST_BARE"

# 17c. A noreply commit after the baseline passes on its own range.
commit "clean again"
post_clean_sha="$(git -C "$REPO" rev-parse --short HEAD)"
run "noreply commit after baseline passes" 0 --range "$post_clean_sha^..$post_clean_sha"

# 18. Explicit --range still wins, and a present valid file is accepted.
root="$(git -C "$REPO" rev-list --max-parents=0 HEAD)"
run "explicit clean range wins over baseline" 0 --range "$root"
expect "explicit range ok" "OK"

# 19. Invalid files fail even when a range flag is also given.
write_baseline "$dirty_full" "" "2026-11-22"
run "empty reason exits 2" 2 --print-baseline
expect "empty reason message" "reason is empty"

write_baseline "$dirty_full" "accepted historical test fixture" "22-11-2026"
run "bad decided date exits 2" 2 --print-baseline
expect "bad decided message" "YYYY-MM-DD"

printf '%s\n' "reason: accepted historical test fixture" "decided: 2026-11-22" > "$REPO/.privacy-baseline"
run "missing sha exits 2" 2 --print-baseline
expect "missing sha message" "must set sha, reason, and decided"

write_baseline "not-a-sha" "accepted historical test fixture" "2026-11-22"
run "malformed sha exits 2" 2 --print-baseline
expect "malformed sha message" "not a git SHA"

write_baseline "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" "accepted historical test fixture" "2026-11-22"
run "unresolved sha exits 2" 2 --print-baseline
expect "unresolved sha message" "does not resolve to a commit"

write_baseline "$dirty_full" "accepted historical test fixture" "2026-11-22"
printf '%s\n' "sha: $dirty_full" >> "$REPO/.privacy-baseline"
run "duplicate key exits 2" 2 --print-baseline
expect "duplicate key message" "duplicate key"

printf '%s\n' "sha: $dirty_full" "reason: accepted historical test fixture" "decided: 2026-11-22" "owner: nobody" > "$REPO/.privacy-baseline"
run "unknown key exits 2" 2 --print-baseline
expect "unknown key message" "unknown key"

# A present but invalid baseline must fail even with --all, so CI cannot
# skip validation by setting a range.
printf '%s\n' "sha: not-a-sha" "reason: accepted historical test fixture" "decided: 2026-11-22" > "$REPO/.privacy-baseline"
run "invalid baseline fails with --all" 2 --all
expect "invalid with --all message" "not a git SHA"

# 20. --baseline-file can point at an alternate path.
rm -f "$REPO/.privacy-baseline"
write_baseline "$dirty_full" "accepted historical test fixture" "2026-11-22" "$REPO/.other-baseline"
run "alternate baseline file prints sha" 0 --print-baseline --baseline-file .other-baseline
if [[ "$LAST_OUTPUT" != "$dirty_full" ]]; then
  printf 'FAIL alternate baseline file prints sha: expected the baseline sha only\n' >&2
  failures=$((failures + 1))
fi
# Without --baseline-file, the default path is absent again, so this is --all
# over dirty history and must fail.
run "missing default baseline falls back to all" 1
expect "fallback fail line" "FAIL commit metadata"

if [[ "$failures" -ne 0 ]]; then
  echo "FAILED $failures test(s)" >&2
  exit 1
fi
echo "All check-commit-emails tests passed."
exit 0
