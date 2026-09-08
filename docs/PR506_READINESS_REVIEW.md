# PR506 readiness review — verified local tree, keep draft

## Task #65 — resumed local verification, not merge-ready

Inspected branch `feat/react-native-platform` at `811451e3cb223f8513e069f3dfee4471fb65d126` plus the existing dirty repairs. Capacity improved from 4.2 to 5.2 GiB before retrying tests; final sample was 13 GiB. No files were deleted or processes stopped.

Fresh Node 22.23.2 / pnpm 9.15.4 checks passed:

- `pnpm test:once`: 6/6 successful tasks, zero cached; Web 318 files / 1678 tests.
- `pnpm ci:native`: complete pipeline passed, including paired package checks and Android/iOS Metro exports.
- Web lint and build-project TypeScript: passed.
- `pnpm build`: 6/6 successful, 5 cached.
- `git diff --check`: passed.

The following registry lint/types/i18n/integrity/drift chain was stopped during lint by the harness: **RSS monitoring became unavailable**. Later commands in that chain did not run; no retry without changed monitoring conditions. These results cover the dirty tree, not a new committed HEAD. Exact 0.4.0 prerelease isolated-consumer proof remains pending.

Fetched main: it advanced to `705fb7b08b792dcb2e13453bc78c133af7613450` (Turbo security bump, PR504). Reconciliation is required before requesting review. PR508 remains open/draft at `5c0ff2935bbef4d9355229270e5a6bb77cca7108`; its diff endpoint rejects the >300-file diff, so use paginated files API or a local fetched branch before incorporation. No reconciliation/cherry-pick was attempted in the dirty tree.

Live PR506 remains draft at the old SHA. Preview check [101807648412](https://github.com/vllnt/ui/runs/101807648412) reports both registry and Storybook builds exit 1; output text is null, annotations zero, and details URL is only `https://vllnt.ai`. Authenticated owner build logs remain necessary. No root cause is inferred from local build success. Existing residual supported-contract, strict Linux CI, device/AT and publication-recovery requirements remain unresolved, not waived. Existing credential workflow and changelog edits were inspected and preserved; no credential/settings mutation, commit, push or readiness operation occurred.

Logs: `/Users/bntvllnt/.pi/agent/tmp/sessions/01a07ca8-bad2-76a0-ac34-ade90cd407b4/work/{tests,native,build}.log`. Only repository path edited in this pass: `docs/PR506_READINESS_REVIEW.md`.

## Task #64 — capacity diagnosis and final release checks

On HEAD `811451e3cb223f8513e069f3dfee4471fb65d126` plus existing dirty repairs, disk inspection found APFS Data at 100% rounded capacity, initially 1.8 GiB available, millions of free inodes, and no user quota. Available space independently rose to 3.7 GiB, permitting one retry; no files were deleted or processes stopped. Other repository worktrees had active build/lint processes, not proven users of this target. The host's fluctuating shared-volume capacity, not inode exhaustion or user quota, is the evidenced constraint; the exact external space consumer is not established.

Found and repaired a concrete guard edge case: a numeric short Web SHA beginning with zero produced invalid SemVer `0.4.0-canary.0123456`. Web canaries now prefix the SHA identifier (`0.4.0-canary.sha0123456`); Native already prefixes its SHA. Added that regression to the existing suite: **5/5 pass**. This is not blanket publication/rollback safety proof.

With Node 22.23.2 and corepack pnpm 9.15.4 (existing `/tmp/pr506-tools` wrapper), fresh Web lint and build-project typecheck passed. Workspace build reported **6/6 successful, 2 cached**. The subsequent workspace tests failed at startup with **ENOSPC** writing Web/core/registry `node_modules/.vite-temp` configuration modules (only token check completed). Turbo also emitted a crash-report notice. RSS monitoring did not recur in this retry. Final disk sample had 1.2 GiB available; no second test retry was justified. R6 is therefore **not green**. Exact 0.4.0 prerelease installed-pair consumer verification remains unperformed; earlier 0.1-based consumer proof must not be relabeled.

Cleanup ownership was not sufficiently established to delete artifacts during this pass. Candidate review artifacts measured: `/tmp/pr506-standalone-61` 412 MiB, `/tmp/pr506-isolated-consumer.nsTXO0` 193 MiB, `/tmp/pr506-visual-base-61` 79 MiB. Preserve the existing consumer evidence; parent should confirm retired artifact ownership/no active use before removing standalone output or removing the visual worktree through Git. A practical next checkpoint is at least 5 GiB of sustained free capacity (planning margin, not measured exact requirement), then rerun workspace tests and the exact prerelease consumer. Do not purge shared caches or dependencies.

No new visuals were warranted by this guard-only change: prior Task61 strict 305-case evidence retains its original tree provenance. Preview, physical-device/AT, strict remote-CI and publication-recovery gaps remain; keep draft. Task tools were unavailable, so no child board transitions were fabricated.

## Task #63 — release/version delta after integrated verification

Core/Native package bases changed to 0.4.0 and both publishing workflows now invoke a checked-in canary/stable guard. Fresh release tests (5/5), frozen offline lockfile validation, token drift check, core/Native builds and both 0.4.0 pack checks passed on Node 22.23.2/corepack pnpm 9.15.4. Full R6 rerun did **not** complete: the harness stopped lint (SIGTERM) because RSS monitoring became unavailable, then shell execution failed with ENOSPC. Restore capacity and rerun R6 plus an isolated exact-prerelease pair consumer check before claiming final-tree readiness. Task61 visuals/E2E remain historical evidence for the preceding tree, not a fresh post-version run. No snapshots changed. See `PR506_CANARY_GAP_REVIEW.md` for enforcement boundaries and outstanding external exit gates. Keep draft.

## Task #61 — final integrated verification (2026-09-07)

This section supersedes earlier aggregate/audit-gap status below; older sections
retain historical repair provenance, not current completion claims.
[PR506](https://github.com/vllnt/ui/pull/506), branch `feat/react-native-platform`,
HEAD `811451e3cb223f8513e069f3dfee4471fb65d126` **plus accumulated uncommitted
repairs**. These results are not committed-HEAD or remote-CI certification.
Node **22.23.2**, Corepack **pnpm 9.15.4**, macOS, Playwright **1.58.2**.
No implementation repairs were needed in this pass. No dependencies, commits,
pushes, merges, publishing, infrastructure changes or protected workflow/changelog
edits. Task-board tools were unavailable; parent owns task #61 tracking.

### Current-tree gates

All commands below exited **0**, sequentially; Next build/dev/production servers
were never run concurrently:

```sh
pnpm -F @vllnt/ui lint
pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json
pnpm build
pnpm test:once
pnpm ci:native
pnpm -F @vllnt/ui-registry lint
pnpm -F @vllnt/ui-registry exec tsc --noEmit
pnpm -F @vllnt/ui-registry i18n:check
pnpm -F @vllnt/ui-registry registry:integrity
pnpm -F @vllnt/ui-registry registry:check
pnpm -F @vllnt/ui-registry test:e2e --workers=1
pnpm -F @vllnt/ui exec tsx scripts/check-story-coverage.ts
pnpm -F @vllnt/ui exec tsx scripts/verify-stories.ts
```

- Workspace build: **6/6 tasks**, **3 cached**; registry freshly built.
- Workspace tests: **6/6 tasks**, **0 cached**. Web **1678 tests / 318 files**;
  registry **85 / 16**; Native **225 / 34**; core **5 / 1**; catalog **1 / 1**.
- Native pipeline includes lint/types/build/tests, token/index drift, boundary
  subpath regression, both package archive checks, Expo Doctor **21/21**, and
  Android/iOS Metro exports. All passed. Native inventory remains **171**.
- Registry integrity/drift: **313 items**, stable Web install target **^0.3.0**.
- Full browser E2E: **78 passed, 7 skipped**. All seven skips are live Storybook
  resolution assertions in `preview-embeds.spec.ts`: unavailable Storybook origin,
  not missing component behavior silently counted as passes. Page-to-metadata
  assertions execute before the six per-page skips. Successful deployed previews
  remain required to close this gap.
- Story coverage/required props: **313/313**. Whitespace check passed.
- SHA-256 inventory of 3358 package/app source files showed **no source drift**
  during verification; historical test path moves remain mapped below.

### Genuine independent strict visual comparison

Created detached `/tmp/pr506-visual-base-61` at **origin/main
`38db630eda93de6396a2b94c78846c5bc6b5dffe`**, also confirmed as live main by REST.
Base source/styles/themes/fixtures/config remained unchanged. Shared installed
node_modules were symlinked solely to reuse the same browser/toolchain; component
source and Vite aliases resolve inside the isolated base worktree.

1. In base `packages/ui`: `pnpm exec playwright test -c playwright-ct.config.ts
   --update-snapshots --workers=2` — **305 passed**, **297 PNG baselines**.
   Updating was confined to this disposable genuine-main worktree.
2. Against current PR source: `pnpm exec playwright test -c <scratch>/strict-visual.config.ts
   --workers=2 --update-snapshots=none` — **305 passed (43.0s)**.
   The scratch wrapper imports the unchanged PR config, redirects expectations to
   those independent base PNGs, and sets explicit current-tree test/template paths.
   No PR snapshots or production/test source were updated. Missing snapshots would
   fail. Existing **2% maximum differing-pixel ratio** was retained, not tightened
   or relaxed. This is a real same-host regression comparison, not baseline blessing.

Two scratch harness setup errors were corrected first: ESM module mode and CT's
config-relative template path. Their failures are not product regressions.
Inspected representative baseline screenshots for Sidebar, NavbarSaas and
InteractiveTimeline; current states passed comparison. This does not imply manual
inspection of all 297 images or Native screenshots.

[PR508](https://github.com/vllnt/ui/pull/508) remains OPEN/DRAFT at
`5c0ff2935bbef4d9355229270e5a6bb77cca7108`. Read-only diff confirms pinned Linux
container, platform-separated committed expectations, deterministic locale/timezone/
motion, local image fixture, and `--update-snapshots=none`. None was merged or
cherry-picked. Our macOS baselines are **not** its Linux baseline set. PR506's
`.github/workflows/storybook.yml:136` still updates snapshots in CI, so that green
job is not strict evidence. Owner must reconcile PR508 and obtain final-HEAD strict
Linux CI proof; the previous claim that no independent local comparison exists is
now obsolete.

### Isolated production artifact and localization

Copied the freshly built Next standalone artifact, static assets and public assets
outside the repository to `/tmp/pr506-standalone-61`, before dev E2E touched `.next`.
Output tracing includes Native Button/helpers and **all 171 canonical Native
component implementation files**; no manual source injection into the artifact.
After E2E ended, ran its own `server.js` using Node22, `HOSTNAME=localhost PORT=41661`.
Browser assertions passed for both `/components/button?platform=native` and
`/fr/components/button?platform=native`: **HTTP 200**, Code tab accessible, selected
React Native tab, actual Button source containing `react-native`. Both localized
`/components?platform=native&platform=web` pages return **171 Native cards**.
English/French full-page screenshots saved in scratch. Production server stopped.

Initial binding to `127.0.0.1` exposed a local hostname mismatch: next-intl rewrote
to `http://localhost:41661/en/...`, causing a self-redirect loop on English routes.
Binding and accessing the server consistently as localhost resolved it without a
source change. This local proof does not certify proxy/hostname behavior in the
actual deployment. An initial browser assertion also needed to open the outer Code
panel before looking for source tabs; final assertions above passed unchanged code.

### Audit coverage and remaining readiness blockers

Read all four Native inventories and both S–Z follow-ups, plus
[package/security](PR506_PACKAGE_SECURITY_REVIEW.md) and
[Web/registry](PR506_WEB_REGISTRY_REVIEW.md) reports. Mechanical inventory reconciliation
confirmed **46 + 35 + 31 + 59 = 171 unique rows**, **zero missing/extra directories**.
All 171 have individual source-inspection evidence; this is not 171 device approvals.
The completed Web/registry audit covers **120 changed paths**. Its 19 focused tests
are now included in the final 85-test registry suite. Package boundary repair and
isolated packed-consumer types/Metro-resolution evidence are documented in the
package report; the prior claim that these audits/consumer checks are wholly
missing is obsolete. Packed Native rendering/device runtime is still not proven.

**Keep draft; no merge/release approval. Exact remaining actions:**

1. **Deployed previews:** current REST check
   [101800532276](https://github.com/vllnt/ui/runs/101800532276) reports registry and
   Storybook build exit 1, with zero annotations, no log text and only
   `https://vllnt.ai` as details URL. GraphQL was rate-limited; REST succeeded.
   No deeper cause is available from these check logs. Obtain authenticated build
   logs from the preview owner, diagnose, then rerun live preview/embed checks.
   Local standalone success does not explain or erase remote failures.
2. **Strict committed-HEAD CI:** reconcile PR508 through owner-approved workflow,
   then run the pinned Linux comparison without snapshot updates at final HEAD.
   Commit/push the already-tested dirty fixes only through the owner's normal
   process and refresh PR body/evidence; remote checks currently cover old HEAD.
3. **Native device/AT:** `xcrun devicectl list devices` reports **no physical
   devices**. iPhone17 Pro/iOS26.5 simulator is booted, but installed Expo Go is
   **54.0.7**, versus catalog **Expo57/RN0.86.3**. adb/idb/maestro are not on PATH.
   No simulator app, VoiceOver/TalkBack interaction or device screenshot was run.
   Supply an SDK57-compatible development client/simulator build and physical
   iOS/Android/AT coverage of modal focus, keyboard-first taps, scroll reconciliation,
   async adapters, interrupted motion, safe areas, long text and touch targets.
4. **Unresolved source/design/API observations are not waived by green gates:**
   use the residual finding triage below and linked inventories (Calendar years
   0–99, optional Collapsible references, Unicode/raw scalar/numeric boundaries,
   documented API decisions and Native motion/design exceptions). Owner must
   reproduce/decide supported contracts rather than relabel every finding device-only.
   Web audit also notes homepage/family SEO and pre-existing keyboard/localization
   follow-ups; do not claim every SEO/accessibility surface is complete.
5. **Release setup:** package report identifies missing least-privileged
   `NPM_DIST_TAG_TOKEN` setup documentation and unverified publishing environment/
   OIDC/token permissions. Protected workflow/changelog changes remain untouched;
   do not enable publishing from this verification.

Only repository path edited in task #61: **`docs/PR506_READINESS_REVIEW.md`**.
Disposable evidence lives in
`/Users/bntvllnt/.pi/agent/tmp/sessions/01a07c8f-c087-76a0-ac34-adc53b80898d/work/`:
`integrated.log`, `results.log`, `base-visual.log`, `strict-visual.log`,
`strict-visual.config.ts`, `source-hashes.json`, `base-snapshot-hashes.json`,
`pr508.jsonl`, `production-proof.mjs`, `production-en.png`, `production-fr.png`,
plus the Node22/Corepack `bin/pnpm` shim and scratch ESM `package.json`.
The two temporary artifact/base directories above are retained for reproducibility;
no background server remains from this task.

## Task #58 — fresh aggregate verification, audit still incomplete

Same HEAD and accumulated dirty component tree as task #56. Parent owns tracking.
No source repairs, dependency changes, commits, pushes or infrastructure mutations
were made. Protected workflow and changelog changes remain untouched.

Using Node 22.23.2 and a disposable Corepack pnpm@9.15.4 shim, completed:

- Web lint and `tsc --noEmit --project tsconfig.build.json`: pass.
- Registry lint and `tsc --noEmit`: pass.
- `pnpm build`: 6/6 tasks successful (4 cached; not all freshly rebuilt).
- `pnpm test:once`: 6/6 tasks successful, zero cached.
- `pnpm ci:native`: pass, including paired pack checks and both Expo exports.
- Registry `i18n:check`, `registry:integrity`, `registry:check`: pass;
  313 items, stable install target ^0.3.0. Token generation check also passed.
- Full registry `test:e2e --workers=1`: **78 passed, 7 skipped**. Ran after
  builds finished, without concurrent Next build/dev. Skips are not passes.
- `git diff --check`: pass before this report edit.

The initial explicit-RSS shell invocation was stopped by unavailable RSS
monitoring during lint, not a reported lint defect. The subsequent normal
owner-default shell checks above completed successfully.

Read-only GitHub checks still show PR506 OPEN/DRAFT at
`811451e3cb223f8513e069f3dfee4471fb65d126`; Actions checks succeed but
[preview check 101795271965](https://api.github.com/repos/vllnt/ui/check-runs/101795271965)
reports both registry and Storybook builds exited 1. Its output contains no
build logs or deeper cause, and its details URL is only https://vllnt.ai.
Authenticated preview build logs are still needed; no speculative root cause
is asserted. These remote checks do not cover the uncommitted fixes.
[PR508](https://github.com/vllnt/ui/pull/508) remains OPEN/DRAFT at
`5c0ff2935bbef4d9355229270e5a6bb77cca7108`, also with failed preview.
The local Storybook workflow still updates snapshots at line 136; its green
visual job is not strict regression evidence.

An iPhone 17 Pro simulator (iOS 26.5) is booted; adb is not on PATH. No device,
simulator UI or assistive-technology interaction was performed.

**Still not ready:** this pass only partially inspected the non-Native source
and workflow diff; it does not complete the full security/SEO/design/export
audit. No strict visual run, independent baseline comparison, isolated installed
packed consumer or authenticated preview diagnosis was completed. Next checks:
finish that source ledger, inspect the seven E2E skips, reconcile PR508 and run
strict visuals without snapshot updates, install paired tarballs offline in an
isolated Expo consumer, and exercise simulator/AT contracts listed below.
Registry drift passed directly; regeneration/idempotence was not newly tested.
Prior unresolved supported-contract observations remain open.

Only repository path edited by task #58: `docs/PR506_READINESS_REVIEW.md`.
Disposable logs and executable shim are under
`/Users/bntvllnt/.pi/agent/tmp/sessions/01a07c7c-b06f-76a0-ac34-adac79c507e1/work/`
(`build.log`, `tests.log`, `native.log`, `e2e.log`, `web.diff`, `bin/pnpm`).

Test paths below record historical commands. See the [organization path map](NATIVE_TEST_ORGANIZATION.md) for current locations; assertions are preserved.

## Task #56 integration result — current local tree

Related to [PR506](https://github.com/vllnt/ui/pull/506). Checkout:
`/Users/bntvllnt/Github/vllnt/ui-native-platform`, branch
`feat/react-native-platform`, HEAD `811451e3cb223f8513e069f3dfee4471fb65d126`
plus all accumulated uncommitted audit repairs and the changes below.
No commit, push, merge, publication, deployment, dependency or public-import change.
Protected `.github/workflows/native-canary.yml` and `CHANGELOG.md` were untouched.
Task-board tools were unavailable; no board updates are claimed.

### Inventory and report corrections

The earlier statement that 170 Native modules remain uninspected is **historical,
not current**. The four inventory reports account for all **171 directories**:
[A–C: 46](PR506_NATIVE_REVIEW_AC.md),
[D–L: 35](PR506_NATIVE_REVIEW_DL.md),
[M–R: 31](PR506_NATIVE_REVIEW_MR.md), and
[S–Z: 59](PR506_NATIVE_REVIEW_SZ.md).
Button includes an additional implementation helper. Their complete per-module
rows remain intact; inventory coverage is static source inspection, not 171
independent runtime/device approvals. Follow-up corrections are also recorded in
[S–Z async](PR506_NATIVE_REVIEW_SZ_ASYNC.md) and
[S–Z contracts](PR506_NATIVE_REVIEW_SZ_CONTRACTS.md).
Use the [test organization map](NATIVE_TEST_ORGANIZATION.md) for historical paths.
Its 208-pass/one-fail and six-type-error results are superseded by the fresh
225-test/typecheck results below; its test-preservation evidence remains valid.

### Repairs and contract decisions

- **Integration:** the old overlapping FileUpload test now verifies one pending
  picker, no concurrent launch, busy state, and lossless merging of the next
  sequential selection, with exact callback counts and ordered file assertions.
  Four clipboard fixtures now implement required `getText`; async clipboard
  fixtures use a correctly typed void-promise resolver. Assertions were retained.
- **Carousel:** a controlled swipe proposal triggers post-commit scroll
  reconciliation even when the owner rejects it without changing selectedId.
  Accepted updates still determine the destination through committed selection.
  No optimistic internal selection or public import changes.
- **Combobox / DatePicker / DateRangePicker:** already-open controls inherit
  disabled state. Combobox search is read-only, selection handlers guard disabled,
  and dismissal remains operable. Date navigation is disabled along with dates.
- **AnimatedText:** word splitting preserves leading and whitespace-only text.
- **AnimatedList / AnimatedTestimonials:** interrupted consumed entrances settle
  to fully visible when stopped, including StrictMode effect replay. They do not
  replay initial entrance motion or leave content permanently transparent.
- **FileUpload:** committed adapter/disabled changes invalidate pending success
  and failure effects. The synchronous lock persists until the original promise
  settles because the host interface has no cancellation operation; stale results
  unlock the mounted control but never emit files/error feedback. A later valid
  picker still works. This matches the prior Share/Terminal lifecycle policy.
- **LiveFeed:** invalid timestamps/clock values no longer produce `NaNd ago` or
  invent an age. The event remains visible without relative-time text; invalid
  timestamps sort after valid dates. Non-finite tick intervals use 30 seconds;
  finite intervals clamp to 1 second–2,147,483,647ms. Timers clear on unmount.
  Added the missing client directive. No new translation API or motion introduced.

Nine component-specific suites are colocated per the organization rules; the
three existing shared integration suites remain in `src/tests/`.

### Verification at the final component tree

Environment: Node **22.23.2**, **corepack pnpm@9.15.4**. From repository root:

```sh
export PATH=/Users/bntvllnt/.nvm/versions/node/v22.23.2/bin:$PATH
corepack pnpm@9.15.4 -F @vllnt/ui-native lint
corepack pnpm@9.15.4 -F @vllnt/ui-native typecheck
corepack pnpm@9.15.4 -F @vllnt/ui-native test:once
corepack pnpm@9.15.4 -F @vllnt/ui-native build
corepack pnpm@9.15.4 -F @vllnt/ui-native generate:index:check
corepack pnpm@9.15.4 -F @vllnt/ui-native boundaries:check
corepack pnpm@9.15.4 -F @vllnt/ui-native pack:check
git diff --check
```

- Lint and complete source+test typecheck: **passed**.
- Full Native tests: **34 suites, 225 tests passed, 0 snapshots** (16 new cases).
- Build: **passed**, ESM 672.84 KB and declarations 204.54 KB.
- Export check: **171 component modules**, current. Boundaries: **passed**.
- Packed package: **passed**, version 0.1.0; main/module/react-native/types resolve
  from dist. This does not prove installed-consumer runtime compatibility.
- Whitespace check: **passed** before the report update.

The first pack check selected global pnpm 11 in its subprocess and failed the
version guard. A disposable session-scratch Corepack shim was prepended to PATH;
`pnpm --version` then reported **9.15.4**, and the unchanged pack check passed.
No version guard, manifest or lockfile was bypassed or modified.

Red/green evidence: the first new component-only run reported 15 failures, but
one entrance test initially misused async render and the whitespace-only query
needed a host-text assertion; these are not counted as defect proofs. After
fixing those harness issues, temporarily removing only the two entrance cleanup
repairs produced **2/2 failures**, then restoring them passed. Other initial
failures directly exposed disabled pickers, rejected swipe, dropped leading
whitespace, stale file results, invalid time and unsafe intervals. The final
suite passes all 16 new cases. Early fixture fixes using an explicit undefined
resolver argument were undone by ESLint autofix; a void-promise helper resolved
both lint and typecheck without suppression. All temporary source reversions
were restored. These are RN renderer/Animated mock assertions, not native pixels.

### Remaining findings: triage, not blanket deferral to devices

- **Repaired code defects:** the named A–L residuals above, plus prior report
  fixes, are no longer open merely because historical inventory rows say so.
  The M–R numeric/input follow-up and S–Z async/compound follow-ups supersede
  their original corresponding findings; use their correction links above.
- **Caller-invalid data / explicit API boundaries:** duplicate item IDs,
  nonpositive AspectRatio, malformed controlled multi-ID single selections,
  invalid Intl locale/options, and host adapters that throw outside their
  promised contract do not establish library regressions by themselves.
  Host URL allowlisting, filesystem/download policy, safe-area injection,
  controlled acceptance and native-compatible rich children remain host duties.
  This is not a security approval of arbitrary URLs or adapter implementations.
- **Real software/API questions remain, not device-only claims:** Calendar
  years 0–99, optional trigger-less Collapsible references, Avatar failed-image
  lifecycle/TSDoc agreement, repeated SidebarProvider/ToggleGroup updates,
  Unicode Typewriter/ScrambleText behavior, raw scalar slots noted in the S–Z
  inventory, omitted numeric-zero content, and remaining non-finite numeric
  inputs still warrant independently reproduced contract review. This batch
  does not claim to have repaired every observation in all 171 rows. Default
  disabled-tab selection, conversation suggestion/onSend semantics, ambiguous
  progress units, filter-clear defaults and locale API gaps require explicit
  supported-contract decisions rather than speculative behavior changes.
- **Device/visual limits:** actual scroll reconciliation, Animated presentation,
  first tap with keyboard open, Modal focus confinement/restoration, native
  clipboard/file pickers, VoiceOver/TalkBack traversal, touch-target measurements,
  long translated text, safe areas, custom-theme contrast and Hermes Intl support
  need simulator/device evidence. Static ARIA/prop assertions do not supply it.

### Next-stage full-PR release gaps

Keep PR506 draft. No fresh GitHub/CI or preview status was fetched in task #56.
The historical failed preview and visual-gate concerns below remain unverified,
not asserted as today's live state. Next stage must:

1. Review the full final PR diff, security boundaries, registry/Web/SEO 0.4.0
   claims, publishing workflow trust/permissions and protected dirty changes.
2. Run fresh repository R6 workspace gates and `ci:native`/Expo verification
   after all final integration edits. Earlier workspace/Expo passes below are
   historical, not evidence for this 225-test tree.
3. Diagnose authenticated preview build logs and obtain successful registry
   and Storybook previews, plus full relevant Web/i18n/E2E checks.
4. Reconcile [PR508](https://github.com/vllnt/ui/pull/508) and execute a genuine
   committed-baseline visual comparison without `--update-snapshots`; inspect
   final screenshots and Native simulator/device interactions and accessibility.
5. Install paired packed core/native artifacts in an isolated supported Expo
   consumer and verify types and runtime without workspace resolution.
6. Resolve remaining supported-contract code findings above before claiming
   complete component correctness; refresh PR body/evidence at the eventual HEAD.

### Exact paths edited/written by task #56

- `packages/ui-native/src/tests/accessibility-and-interaction.test.tsx`
- `packages/ui-native/src/tests/action-and-content-contracts.test.tsx`
- `packages/ui-native/src/tests/async-lifecycle.test.tsx`
- `packages/ui-native/src/components/animated-list/animated-list.tsx`
- `packages/ui-native/src/components/animated-list/animated-list.test.tsx`
- `packages/ui-native/src/components/animated-testimonials/animated-testimonials.tsx`
- `packages/ui-native/src/components/animated-testimonials/animated-testimonials.test.tsx`
- `packages/ui-native/src/components/animated-text/animated-text.tsx`
- `packages/ui-native/src/components/animated-text/animated-text.test.tsx`
- `packages/ui-native/src/components/carousel/carousel.tsx`
- `packages/ui-native/src/components/carousel/carousel.test.tsx`
- `packages/ui-native/src/components/combobox/combobox.tsx`
- `packages/ui-native/src/components/combobox/combobox.test.tsx`
- `packages/ui-native/src/components/date-picker/date-picker.tsx`
- `packages/ui-native/src/components/date-picker/date-picker.test.tsx`
- `packages/ui-native/src/components/date-range-picker/date-range-picker.tsx`
- `packages/ui-native/src/components/date-range-picker/date-range-picker.test.tsx`
- `packages/ui-native/src/components/file-upload/file-upload.tsx`
- `packages/ui-native/src/components/file-upload/file-upload.test.tsx`
- `packages/ui-native/src/components/live-feed/live-feed.tsx`
- `packages/ui-native/src/components/live-feed/live-feed.test.tsx`
- `docs/PR506_READINESS_REVIEW.md`

Build outputs were regenerated by the package script, not hand-edited. Disposable
Corepack executable shims live only under this session's scratch `work/corepack/`.

## Historical task #47 evidence — not revalidated by task #56

### Scope and identity

Reviewed checkout: `feat/react-native-platform`, HEAD
`811451e3cb223f8513e069f3dfee4471fb65d126`, plus the test additions described below.
[PR506](https://github.com/vllnt/ui/pull/506) contains 385 changed files versus
`origin/main`; Native export generation confirms 171 component modules.
Local `origin/main` matches the live GitHub main SHA
`38db630eda93de6396a2b94c78846c5bc6b5dffe`; divergence is 0 behind / 19 ahead.

This pass does **not** complete the requested entire-PR or every-component audit.
Only AIArtifact and the five shared primitives below received independent full
source inspection in this pass. The other 170 modules remain individually
unreviewed here; passing an aggregate suite does not establish individual runtime
coverage. A complete 171-row contract/test/device ledger remains required.

The preexisting changes in `.github/workflows/native-canary.yml` and
`CHANGELOG.md` were inspected but preserved untouched. No commits, pushes,
publication, deployment changes, or PR readiness changes were made.
Task-board tools were not exposed in this session, so no child task records or
completion statuses could be written.

## Live checks and blocking findings

- PR506 is OPEN, DRAFT, MERGEABLE, with merge state UNSTABLE. All reported GitHub
  Actions code/test checks succeeded at the recorded HEAD. This is not approval.
- `ntk / preview` failed. The check API reports **both ui-registry and storybook
  builds failed with exit status 1**. No root cause or successful preview was
  established. Next: obtain authenticated preview build logs and diagnose before
  any retry; historical CSP/attestation explanations are not current evidence.
- The green Visual Regression job is **not a regression comparison**:
  `.github/workflows/storybook.yml` still invokes
  `pnpm test:visual --update-snapshots`. The prerequisite
  [PR508](https://github.com/vllnt/ui/pull/508) remains OPEN/DRAFT/UNSTABLE.
  Its prior synthetic comparison is on an older PR506 commit, not this HEAD.
  Next: reconcile the genuine committed-baseline gate and perform strict
  comparison at the final integration tree without updating expectations.
- `xcrun simctl list devices booted` finds an iPhone 17 Pro on iOS 26.5.
  Simulator availability is not a blocker; actual simulator UI inspection was
  not performed here. `adb` was not on PATH. Physical iOS/Android and
  VoiceOver/TalkBack verification remain unperformed.
- The packed-package checks validate archive entry targets and dependency
  protocol rewriting, **not isolated installed-consumer runtime resolution**.
  Next: install paired local tarballs in an isolated supported Expo consumer
  and exercise actual runtime and types without workspace resolution.
- The canary workflow is guarded by a repository variable and environment.
  Their live settings and trusted-publisher/credential configuration were not
  verified. Its preexisting dirty authentication changes are not approved by
  this partial review. Do not enable publishing based on this document.

[Quality run](https://github.com/vllnt/ui/actions/runs/34033220286)
[Storybook/visual run](https://github.com/vllnt/ui/actions/runs/34033220201)

## Independent source-inspection ledger

| Module | Contracts inspected | Evidence and limitation |
| --- | --- | --- |
| `ai-artifact` | Context requirement; copy/download/edit adapter arguments and hidden actions; filename punctuation normalization and fallback; controlled version selection semantics; ref/style forwarding | Full source read. The existing CodeQL review comment points to filename trimming; current regex is anchored `^-|-$`, following run collapse, and does not retain the previously alleged repeated-dash quantifier. No focused artifact runtime test or device proof established in this pass. Caller-provided filename/language are passed to the host adapter; this component itself does not write files. |
| `primitives/use-controllable-state` | Controlled ownership, uncontrolled equality suppression, stable setter, latest callback via layout effect | Interaction suite verifies controlled ownership/latest callback and uncontrolled duplicate suppression. Mode-switch behavior and concurrent rendering not independently exercised. |
| `primitives/use-reduced-motion` | Conservative initial value; subscription cleanup; query rejection handling; late query versus newer event; replaced-service query cancellation | Added two focused tests for event/query ordering and stale prior-service resolution. Both pass. Existing implementation already protects these cases; no implementation repair was needed. Service-query rejection and unmount-before-resolution not newly exercised. |
| `primitives/selection` | Stable caller keys; immutable set updates; no-op identity retention; toggle membership | Existing interaction tests pass. Numeric exceptional keys and duplicate consumer keys not separately tested. |
| `primitives/modal-layer` | Hardware-back and accessibility escape delegation; modal accessibility property; safe-area injection; keyboard avoidance and prop composition | Existing interaction tests verify escape/requestClose callbacks, modal accessibility property, and safe-area slot. Native focus confinement/restoration, keyboard geometry, swipe dismissal and nested overlays require device/runtime proof. |
| `primitives/platform-services` | Injected adapters; optional clipboard/file picker absence; Linking and Share defaults | Existing interaction tests verify injection and missing optional services. OS URL/share execution and failure paths are not demonstrated by those mocks. |

## Changes

Added two tests in
`packages/ui-native/src/primitives/interaction-core-task20.test.tsx`:

1. A newer reduced-motion event is not overwritten by a delayed initial query.
2. An old service's pending query is ignored after subscription replacement.

These are additional contract coverage, not claims of a newly repaired defect.
No shipped component/UI code was changed.

## Fresh local verification

Node 22.23.2, Corepack pnpm 9.15.4. Commands below completed successfully on
HEAD plus the two test additions, with the preexisting dirty files preserved.

- `corepack pnpm -F @vllnt/ui-native exec jest --runInBand src/primitives/interaction-core-task20.test.tsx`: **8/8**.
- `corepack pnpm -F @vllnt/ui-native exec eslint src/primitives/interaction-core-task20.test.tsx`: pass.
- `corepack pnpm -F @vllnt/ui-native typecheck`: pass.
- `corepack pnpm -F @vllnt/ui-native test:once`: **122 tests / 19 suites**.
- `corepack pnpm -F @vllnt/ui-native boundaries:check`: pass.
- `corepack pnpm -F @vllnt/ui-native generate:index:check`: **171 modules**, current.
- `corepack pnpm -F @vllnt/ui lint && corepack pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json && corepack pnpm build && corepack pnpm test:once`: pass; workspace test tasks **6/6**, Web **1678 tests / 318 files**.
- `corepack pnpm ci:native`: pass, including lint/types/build/tests, core/native pack checks, Expo Doctor **21/21**, catalog test **1/1**, Android **766 modules** and iOS **768 modules** Metro exports.
- `corepack pnpm -F @vllnt/ui-registry lint && corepack pnpm -F @vllnt/ui-registry exec tsc --noEmit && corepack pnpm -F @vllnt/ui-registry i18n:check && corepack pnpm -F @vllnt/ui-registry registry:check && corepack pnpm -F @vllnt/ui-registry registry:integrity`: pass, **313 items**, stable install target **^0.3.0**.
- `git diff --check`: pass before writing this report.

The first `ci:native` attempt stopped at the nested pnpm version guard because
PATH selected global pnpm 11 under Corepack. A session-scratch Corepack shim
was prepended to PATH, after which the unchanged command passed. No dependency
installation, lockfile mutation, or version-guard bypass was used.

Full local E2E, strict visual comparison, screenshot inspection, isolated
consumer runtime, complete registry/security/source review, and the remaining
170 individual component inspections were **not completed in this pass**.
Keep PR506 draft and continue task 47; do not infer production readiness from
aggregate green checks.
