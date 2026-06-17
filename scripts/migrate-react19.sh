#!/usr/bin/env bash
#
# Re-runnable React 19 migration for @vllnt/ui (issue #268).
#
# Converts packages/ui/src/components/** off the APIs react-doctor flags as
# `no-react19-deprecated-apis`:
#   - `forwardRef` -> ref-as-prop (ref passed as a normal function-component prop)
#   - `useContext(X)` -> `use(X)`
#
# Safe to re-run. New components that land via other PRs (e.g. the #409-413
# family, which use `forwardRef` to build green against the React 18 workspace)
# can be converted by re-running this after they merge.
#
# This automates the deterministic 90%. AFTER running, review the diff and
# hand-fix the cases the codemod cannot handle (then `pnpm --filter @vllnt/ui
# build` will surface any leftovers):
#   - `forwardRef(NamedComponent)` wrappers (not inline arrows) — move ref into
#     the component's prop type and drop the wrapper.
#   - `typeof forwardRef<...>` type-level references.
#   - components whose forwardRef 2nd type arg is an intersection (`A & B`):
#     the codemod drops the prop-type annotation — restore it as
#     `<2nd-type-arg> & { ref?: React.Ref<<1st-type-arg>> }`.
#
set -euo pipefail

cd "$(dirname "$0")/.."
TARGET="packages/ui/src/components"

echo "==> react-19-remove-forward-ref"
npx --yes codemod@latest run react-19-remove-forward-ref \
  -t "$TARGET" --no-interactive --allow-dirty

echo "==> react-19-use-context-hook"
npx --yes codemod@latest run react-19-use-context-hook \
  -t "$TARGET" --no-interactive --allow-dirty

# The forwardRef codemod types the synthesized ref prop as a *required*
# `React.RefObject<T>`. Correct it to an optional `React.Ref<T>` so existing
# call sites (which usually omit ref) keep compiling. Prefix-only rewrite keeps
# any nested generics intact.
echo "==> fix ref prop type (required RefObject -> optional Ref)"
find "$TARGET" \( -name '*.tsx' -o -name '*.ts' \) -print0 \
  | xargs -0 perl -pi -e 's/ref: React\.RefObject</ref?: React.Ref</g'

cat <<'NEXT'

Transform applied. Next:
  1. Review the diff; hand-fix the codemod gaps listed in this script's header.
  2. pnpm --filter @vllnt/ui exec eslint src --fix   # formatting / import order
  3. pnpm --filter @vllnt/ui build                   # typecheck (React 19 types)
  4. pnpm --filter @vllnt/ui test:once
  5. pnpm registry:build                             # regenerate generated copies
  6. pnpm doctor:json   # expect no-react19-deprecated-apis == 0
NEXT
