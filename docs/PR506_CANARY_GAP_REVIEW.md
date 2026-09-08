# PR506 — Native adoption and 0.4.0 canary-only audit

PR: https://github.com/vllnt/ui/pull/506

## Task64 verification update

Found a real SemVer gap missed by the original five tests: Web SHA `0123456…` generated `0.4.0-canary.0123456`, an invalid leading-zero numeric prerelease identifier. `scripts/release-guard.mjs` now prefixes Web SHA identifiers with `sha`; the regression is included in **5/5 passing tests**. Native's `0.4.0-canary.<run>.sha<SHA>` already avoids this case. Stable 0.4 rejection remains covered, but textual workflow assertions are not execution/rollback proofs.

Fresh Node 22.23.2/corepack pnpm 9.15.4 Web lint/typecheck and workspace build passed (6/6 build tasks, 2 cached). Workspace tests then failed at configuration startup with **ENOSPC**. APFS Data was 100% rounded capacity, with free space fluctuating from 1.8 to 3.7 to 1.2 GiB; inodes remained available and user quota was absent. No cleanup or process stop was performed; exact external space consumption is unproven. RSS monitoring worked in this attempt. See the Task64 readiness section for specific candidate artifacts and safe recovery checkpoint.

The exact installed **0.4.0 prerelease** pair consumer remains **unverified**, not replaced by the older consumer or stable-base pack checks. Full R6 is not green; prior strict visuals retain Task61 provenance and were not rerun for this guard-only edit. Keep draft with preview/device/AT/strict-CI and owner publication/recovery gates outstanding. No publication or external mutation occurred.

## Task63 implementation update (supersedes release-state findings below)

Implemented `scripts/release-guard.mjs` and deterministic tests, wired into both publication workflows. Web stable dispatch now rejects 0.4.x and newer/unknown bases before Git/npm mutation; supported Web 0.3.x maintenance is retained. Every mode requires main. No input/variable bypass exists; promotion needs a reviewed code change. Web canaries derive a validated SHA prerelease and publish only under canary. Native/core bases are now 0.4.0, required to match Web; Native derives the synchronized run/SHA prerelease, retaining exact dependency rewrite and staging/canary-only tags. Existing Native credential edits were preserved; CHANGELOG.md was not edited. Source availability remains false and Web install pins remain 0.3.0. Workspace links require no lockfile change; schema/private package versions were intentionally not bumped.

Fresh checks using Node 22.23.2 / corepack pnpm 9.15.4: release regression suite **5/5 pass**; offline frozen lockfile validation passes; generated tokens in sync; core/Native build passes; both packed-package checks pass at **0.4.0**. Initial nested pnpm commands hit the host pnpm 11 shim; using the existing `/tmp/pr506-tools` corepack wrapper corrected that toolchain issue. These package checks are not a new isolated installed prerelease-pair consumer/Metro/device proof.

Full R6 rerun was attempted but the harness terminated lint with SIGTERM when RSS monitoring became unavailable. A subsequent shell call failed with **ENOSPC** before execution. No fresh full-gate success is claimed. Parent must restore local disk/process capacity, run R6 and the isolated exact-prerelease packed consumer check, then refresh exact-head provenance. Task61 visual/E2E evidence predates this version/release change; no snapshots were updated. No external publication, enablement, credentials, push, merge or deployment operation occurred.

Merge can trigger existing Web canary publication and conditionally Native canary publication if the separately controlled enable gate/environment permits it; it cannot promote stable through these checked-in workflows. This is not an npm-account-level prohibition against an owner publishing outside the workflows. External owner settings, device/AT evidence, deployment diagnostics, remaining contract triage, publication/recovery rehearsal and all exit requirements below remain unverified. Keep the PR draft. Releasing docs now retain device/AT gates before advertising Native installation and distinguish deprecation from dist-tag rollback.

## Original audit decision (historical, before Task63)

**Not yet enforced as the requested synchronized 0.4.0 canary-only release.** Merge does **not** automatically publish stable Web or Native in the inspected workflows. However:

1. Native/core still derive **0.1.0-canary.N.sha…**, not 0.4.0 canaries.
2. Web still has an unprotected manual-dispatch `latest` publication path. Passing ordinary quality gates is not the requested explicit verification/promotion approval.
3. Source-only merge can remain safe with Native publication disabled, but live repository/environment/npm settings were not checked. This audit does not ensure those settings or authorize changing them.

Smallest next implementation: after task61 releases code ownership, align core/native base versions to 0.4.0; add a fail-closed 0.4.0 stable-release hold to Web's release job; document and test the release boundaries without any publication. Keep Web registry install pins at 0.3.0 and Native install availability false. Do not add Native to the Web stable matrix.

## Scope, evidence, and exclusions

Read-only audit of `/Users/bntvllnt/Github/vllnt/ui-native-platform`, branch `feat/react-native-platform`, HEAD `811451e3cb223f8513e069f3dfee4471fb65d126` plus ongoing dirty repairs. Only this new report was written. Existing dirty `.github/workflows/native-canary.yml` (dist-tag authentication) and `CHANGELOG.md` were inspected, not overwritten. Their dirty state matters: committed HEAD lacks the separate dist-tag credential repair.

Parent owns task62 tracking; no task tool is available in this child. Completed steps: establish trigger/version facts; review adoption/release boundaries and existing audit evidence; produce ranked gaps, gates, and bounded follow-up. No agents, dependencies, full builds, Next processes, credential reads, npm writes, push, merge, deployment, or live owner-setting changes.

This is a cross-codebase adoption audit, not another individual 171-component repair pass. Source inspection, prior recorded test evidence, and unverified external requirements are distinguished below. No claim that every possible defect is exhausted. Concurrent edits and later commits require rechecking cited lines/identities.

Inspected file SHA-256 anchors:

- `publish.yml`: `cd0b45ec6724aee22fe8839a8f406d8cbd4845310eb59c2d93e7c05e99ac9e86`
- dirty `native-canary.yml`: `52d41d87ef05b8a8e687703afe028b4d765d20f4424c51fb18d1647e644acc50`
- core manifest: `d51b47301e5320e6e5cd15567a7c2c0cd5f98bf58b3be2077b93e5b61acd7a23`
- Native manifest: `49800566590c1455f2a5313de391880b99c36b97cd6b6127a15ae029dccbae92`

## Actual merge-trigger graph

| Trigger/path | Actual result | Stable risk |
|---|---|---|
| PR/main push → `.github/workflows/ci.yml` | Web/registry quality, Native `ci:native`, browser E2E; read-only contents permission | No npm publication. Native tests and Expo exports are not device execution. |
| Matching main push → `publish.yml:4–12,50–84` | Own quality job, build, pack **only `packages/ui`**, publish explicit `canary` tag | No automatic `latest`. Changes to Web, root changelog, cliff config, lockfile, or this workflow trigger it. This PR touches triggering paths. |
| Manual dispatch → `publish.yml:86–184` | Own quality job, existing Git-tag/changelog guards, Git tag push, Web npm `latest`, GitHub Release | **Still enabled in code**; no protected environment, explicit verification input, stable hold, or main-ref guard. Dispatch can select a branch. Existing tag/changelog checks are incidental guards, not a canary-only policy. |
| Matching main push → `native-canary.yml:4–41` | Native/core/design/catalog/root tooling changes run `ci:native` | No stable operation. |
| Native quality success + `vars.NATIVE_CANARY_PUBLISH_ENABLED == 'true'` → `native-canary.yml:43–49` | Named `npm-native-canary` environment, publish-job-only OIDC, synchronized pair staging/promote/cleanup | Never explicitly targets `latest`; no dispatch, Git tag, GitHub Release, or Web dependency. Environment name alone does not prove reviewer/branch protection exists. |
| Storybook PR/main workflow | Build, story checks, artifacts, visual snapshots | No npm promotion; line 136 updates expectations, so green is not strict regression comparison. |
| React doctor PR/main; PR issue-link event | Health/report and issue-link checks | No npm promotion. |

No inspected workflow chains a successful check, GitHub Release, or Git tag into stable publication. No Changesets/release-please/semantic-release configuration was found in the bounded root/package/release-path scan; the visible release mechanism is explicit Actions plus version/changelog PRs and git-cliff notes. This does not certify external bots or npm account settings. Registry/Storybook hosting outside these workflows is a separate external deployment boundary; prior failed preview evidence requires owner logs, not speculative release changes.

Web and Native publishing are independent, not one atomic release. Web canary concurrency is `publish-${event_name}` with cancellation enabled (`publish.yml:14–16`); Native uses one non-cancelling main group (`native-canary.yml:16–18`) and checks current main before upload/promotion. Native promotion is **not** conditioned on the full registry/browser quality job. Keep final PR checks required separately rather than assuming a Native publication proves the whole site passed.

## Versions, tags, and availability

| Manifest | Current version | Publication meaning |
|---|---:|---|
| root `package.json:4` | 0.1.0, private | Tooling only; need not be synchronized. |
| `packages/design/package.json` | 0.1.0, private | Authored-source/schema version, not npm renderer release. |
| `packages/ui/package.json:3` | 0.4.0 | Web push constructs `0.4.0-canary.<7-character SHA>`; manual release uses 0.4.0 `latest`. |
| `apps/registry/package.json:3` | 0.4.0, private | Site/product version, not proof of npm availability. |
| `packages/ui-core/package.json:3` | 0.1.0 | Native workflow base version. |
| `packages/ui-native/package.json:3` | 0.1.0 | Must equal core; same canary version assigned at publication. |
| `apps/native-catalog/package.json:3`, `app.json` | 0.1.0, private | Demo app version; no need to tie to npm. |

Native workflow lines 89–111 require matching non-prerelease bases and construct `${CORE_BASE}-canary.${GITHUB_RUN_NUMBER}.sha${SHORT_SHA}`. This is a SemVer prerelease with numeric run ordering and a nonnumeric SHA identifier. It is compatible with the requested 0.4.0 canary track once the two base manifests are 0.4.0. Do **not** put prereleases in those manifests without changing the workflow: it explicitly rejects them. Schema/contract format versions are not package versions and should not be bumped merely for cosmetic synchronization.

Native's source dependency is `workspace:*`; publication rewrites it to the **exact same prerelease** as core (`native-canary.yml:151–162`) and verifies packed names/versions/dependency and dist target (`166–178`). Exact pinning is correct: ordinary `^0.4.0` does not include `0.4.0-canary.N`. Native peers are React `>=19.0.0 <20`, RN `>=0.81.0 <1`; this is a broad allowed range, not evidence that every pair in the range works together. React and RN also impose their own compatibility requirements.

Web's deployed install baseline is intentionally separate: `apps/registry/scripts/inline-component-source.ts:158–159` pins `0.3.0` / `^0.3.0`; inspected registry has 313 items and version 0.3.0. `^0.3.0` does not advance to 0.4.0 or a 0.4.0 prerelease. Actual live npm `latest` was not queried; say **preserved by inspected automation/pins**, not independently verified live.

Native manifest: 171 entries, **5 portable-options / 166 native-adapted**, `channel: canary`, `status: experimental`, `availability: source`, `installation.available: false`. These are truthful current source claims, not proof any package exists. Root/Web changelogs use unreleased/source-only 0.4.0 language. `docs/RELEASING.md:61` still names 0.1.0 canaries, inconsistent with the new requested package track. Native changelog line 17 requires device/accessibility gates before changing availability; releasing guide line 77 instead describes changing it after publication. Resolve that policy ambiguity explicitly rather than silently equating installable canary with stable verification.

## Ranked gaps and smallest corrections

Priority: **P0** immediate dangerous release path/active impact; **P1** consequential supported-contract or release-policy gap; **P2** bounded hardening/documentation. No active compromise or automatic stable publication was demonstrated, so no confirmed P0 finding is asserted.

### G1 — P1, merge blocker for the explicit 0.4.0 canary-only requirement

**Native/core target is 0.1.0, not 0.4.0.** Exact anchors: both package manifests line 3; Native workflow lines 89–111; releasing guide line 61.

Smallest change: set both base versions to 0.4.0, preserve exact runtime dependency rewrite and explicit canary/staging tags, update release examples and any genuine package-version prose. Keep private packages and contract/schema versions independent. Check lockfile consequences with the pinned pnpm version; do not blanket replace every 0.1.0. Add a read-only release-contract assertion that the pair is equal and derives the expected 0.4.0 prerelease with no `workspace:` in packed Native dependencies.

### G2 — P1, merge blocker for an enforced stable hold (not automatic-merge publishing)

**Web manual stable dispatch bypasses the requested verification hold.** `publish.yml:89,104–172` can tag/publish `latest` once routine quality/version/changelog conditions pass. No explicit stable authorization state or protected environment exists in source.

Smallest safe implementation for this release: hard-fail the release job for base 0.4.0 **before any Git/npm mutation**, with a message requiring a separate reviewed promotion PR. A version-specific hold preserves possible maintenance work on earlier supported releases without assuming permission to release them. Add an explicit main-ref check as well. Later promotion PR removes the hold only after evidence and owner approval, adds a protected stable environment and explicit confirmation, and keeps Native separate. Do not rely solely on a mutable repository variable as the permanent verification proof.

Test release routing with fixtures: push→canary only; dispatch 0.4.0→blocked before tag/publish; dispatch non-main→blocked; no Native stable matrix. Do not execute the publisher. A numeric base version in a manifest or package `publishConfig.tag` alone is not an immutable publication prohibition; explicit CLI tags/account permissions remain authoritative.

### G3 — P1, canary-entry owner gate; documentation correction before merge

**Required dist-tag credentials and owner protections are incompletely documented.** Current dirty `native-canary.yml:71–87,186,251,267–268` uses `NPM_DIST_TAG_TOKEN` for whoami/dist-tag operations while publication uses trusted-publisher OIDC. Committed HEAD lacks this repair. `docs/RELEASING.md:69` lists names/OIDC/environment but not this credential or its scope.

Smallest change: retain and separately review the dirty authentication repair; document environment-scoped secret, minimal rights on just core/native, expiry/rotation/revocation owner, approved main-only environment, and package/trusted-publisher mapping. Keep `NATIVE_CANARY_PUBLISH_ENABLED` disabled until an authorized owner verifies these outside this audit. Never print/test the token in a report. Named environment and `whoami` do not by themselves prove package-scoped permissions or reviewers. No instruction here grants permission to enable publication.

### G4 — P1, canary-entry recovery gate; P2 robustness implementation

**Pair publication and rollback are not transactional.** `native-canary.yml:181–287` stages immutable versions, waits for visibility, promotes core then Native, checks both canary/latest tags, and restores prior canary tags on ordinary failure. Good safeguards are already present; do not replace them with a naive two-publish loop.

Remaining boundaries: runner loss/SIGKILL/timeout may bypass EXIT cleanup; versions uploaded before failure remain public; a brief half-promoted pair is observable; external npm writers are not serialized by Actions concurrency; reruns trust existing version existence rather than verifying its integrity against the intended artifact. Latest equality checks detect changes but do not safely undo another writer's latest update. A moving `canary` tag is discovery, not a reproducibility pin.

Smallest entry requirement: owner runbook records previous/current pair and latest tags, exact run/version/SHA and tarball integrity, disables the enable variable on incident, diagnoses tags before retry, restores only tags still owned by the failed run, and leaves immutable versions rather than unpublishing. Test shell control flow using stub npm/git responses (core upload failure, Native failure, first/second promotion failure, read timeout, rerun, main advance, unexpected external tag). Before stable, compare existing-version integrity on recovery and retain a durable run artifact/summary. Never automate overwriting an unexpected external tag.

**Separate concrete doc defect:** `docs/RELEASING.md:103` says npm deprecation hides a version from `latest`. Deprecation adds a warning; it does not move dist-tags. Correct the prose before relying on rollback: separately authorized owner retags a known-good version and verifies installs, then deprecates the bad version as appropriate. Do not execute those operations here. Web also tags Git before npm publish (`publish.yml:157–172`), so a partial failure can leave a tag blocking dispatch retries; document diagnosis/recovery rather than blindly deleting tags.

### G5 — P1, canary-exit gate; merge documentation should distinguish support from test coverage

**Advertised minimum/runtime range is broader than exercised evidence.** `packages/ui-native/package.json:70–73`, registry minimum fields, Native README and localized guides say RN 0.81+ / React19. Catalog actually uses Expo ~57.0.20, React19.2.3, RN0.86.3 (`apps/native-catalog/package.json`); no minimum RN0.81 device/Metro matrix is established in the reports.

Smallest action: document tested versus intended compatible versions, Android/iOS targets, New Architecture/Hermes expectations, and unsupported/unverified targets. Validate the minimum and current supported combination before stable, or narrow the peer/manifest/docs range together based on actual failures. Do not assert all Expo releases, RN prereleases, older architecture, Windows/macOS, browser NativeWeb, or every React19/RN pair supported. The library has no native module requiring its own autolinking; host clipboard/file-picker adapters may require Expo modules/config plugins/permissions and native rebuilds. One explicit host setup example is useful; adding mandatory adapters/dependencies is not justified.

### G6 — P1, canary-exit platform interaction/accessibility gate

**Mocked JS and Metro exports do not prove usable device UI.** `package.json` `ci:native`, `.github/workflows/ci.yml` Native job and `apps/native-catalog/package.json` build run JS bundles, not an Android/iOS application install or hardware interaction. Readiness report explicitly leaves physical/AT evidence open.

Representative evidence matrix must cover iOS + Android: modal focus entry/confinement/restoration, hardware back/escape, first tap while keyboard is open, keyboard avoidance, nested scrolling, touch targets, long text, system dark/light changes, reduced-motion toggles/interruption, VoiceOver/TalkBack names/states/actions/live updates, and screen-reader traversal of compound controls. Record actual OS/device/RN/Expo/engine/architecture/build SHA, not checkboxes. Include RTL, large font scaling, notched/edge-to-edge safe areas and at least representative tablet layout because `apps/native-catalog/app.json` advertises tablet support.

`primitives/modal-layer.tsx` provides optional `safeArea`, iOS padding keyboard avoidance, accessibility-modal and close callbacks. Dialog/Sheet expose safe-area injection; DatePicker and Combobox own inner modals without exposing the same adapter (`date-picker.tsx:97`, `combobox.tsx:144`). A wrapper around the parent screen does not automatically protect a separate native modal. Validate these on devices; if obstructed, minimally thread the existing safe-area contract through those APIs rather than add a global dependency. No `I18nManager`, `isRTL`, `fontScale`, `allowFontScaling`, or `maxFontSizeMultiplier` customization was found in the bounded shipped-source/catalog search. Absence is not proof default RN behavior fails; it is absence of explicit layout policy/test evidence.

### G7 — P1, remaining supported-contract triage; do not waive as device-only

Existing reports retain unclosed software questions. `PR506_READINESS_REVIEW.md` explicitly supersedes repaired Carousel/disabled-picker/animation/FileUpload/LiveFeed findings, and MR/SZ follow-ups supersede their corresponding original rows. Do not reopen those already repaired merely from stale rows.

Still requiring bounded reproduction/decision: Calendar years 0–99 (`calendar.tsx:66,79–89,116,120` uses multi-argument Date construction), Collapsible optional trigger relationships, Avatar failed-image lifecycle/TSDoc, repeated SidebarProvider/ToggleGroup updates, Unicode Typewriter/ScrambleText behavior, remaining raw scalar slots/zero content, non-finite numeric inputs, default disabled-tab selection, suggestion versus onSend semantics, progress units, filter-clear defaults, localization APIs. The current Calendar constructor pattern corroborates the historic-year question; this audit did not execute a component reproduction or establish that every listed historic observation still fails.

Before merge, parent must classify each as reproduced supported-contract defect (repair + failing-before/passing-after test), documented invalid caller input/intentional adaptation, or explicitly scoped canary limitation. Ordinary crash/data-loss/accessibility defects in advertised supported behavior should not be hidden behind an experimental label. Full static directory coverage and aggregate counts are not per-component runtime approvals.

### G8 — P2 documentation/ownership; source merge need not wait for new platform features

**Capability labels are useful but intentionally coarse.** Canonical `packages/design/component-contracts.json` defines five portable option contracts (badge/button/card/heading/text); Native manifest classifies the other 166 as adapted. Registry comparison and Native guide explain omitted DOM portals/HTML tables/routing/markdown/syntax/SVG/browser services. Do not market name parity as drop-in Web API/behavior parity or 313 Native implementations.

Smallest improvement: a compact supported-capability/tested-target table in existing Native docs, linking the existing per-module inventory and real host responsibilities. Include rendered text versus actual markdown/syntax, intent-preserving charts, caller-owned navigation/data/upload, selection ownership, optional services, and component-specific unsupported Web behavior. Do not invent a generalized capability engine or copy 171 implementation tables into a second drifting registry.

### G9 — P2 packaging/performance/security-owner follow-up; critical discovered defects would raise priority

- **Packaging evidence already exists:** package-security report records isolated packed types, Node resolution and Metro resolver checks, not an isolated packed Metro transform/device app. Native ships ESM/dist via publishConfig/legacy react-native field, core stays external, React/RN are peers. Keep the existing checks; before canary consumption approval add an actual packed consumer bundle/runtime smoke with the exact rewritten prerelease pair, not a workspace source alias or core override masking a wrong published dependency.
- **Tree shaking/performance:** `packages/ui-native/tsup.config.ts` bundles one ESM entry, manifests use `sideEffects:false`; prior build is ~673 KB unminified. That number is not final app cost and `sideEffects:false` is not proof Metro removes unused components. Measure a minimal Button/theme consumer versus representative catalog before stable; only introduce subpath exports if measurements demonstrate a need. No speculative bundler redesign.
- **Licensing:** inspected existing paired tarballs `/tmp/pr506-isolated-consumer.nsTXO0/*.tgz`; **both contain `package/LICENSE`**. Do not report a missing-license defect based on absent source-folder LICENSE files. Both manifests declare MIT. No SBOM/NOTICE artifact was found in those tarball listings; producing a dependency/license inventory is canary-exit release evidence, not a reason to add dependencies. No fresh advisory/license audit of transitive dependencies was run.
- **Security ownership gap:** `SECURITY.md:5–10,35–40` describes 0.2.x and Web/registry source, not core/native/design. Owner should explicitly define experimental vulnerability intake/support coverage and current supported versions before public canary adoption. This file is protected; this audit neither edits it nor authorizes editing it. Existing private reporting channel remains the correct route.
- **Host service safety:** `primitives/platform-services.ts` intentionally defaults Linking/Share, leaves clipboard/picker absent, uses promises without cancellation. Host must authorize URL schemes/untrusted content, picker URI lifetimes/size/type/permissions, clipboard privacy, and external operation lifecycle. No hidden browser fallback/autolinking requirement was demonstrated. A never-settling adapter can leave a pending action locked by design; document/handle host timeout/error UX rather than claim component cancellation cancels OS work.
- **Browser NativeWeb:** catalog depends on react-native-web/react-dom but build only exports Android/iOS. Browser previews in the registry remain Web, not Native runtime proof. Explicitly leave NativeWeb unsupported/unverified until a browser consumer/keyboard/semantics test exists; do not substitute RN accessibility props for verified DOM keyboard semantics.
- **Theming/fonts/Intl:** generated sRGB/point tokens, system scheme provider and override merge already exist. No proof of custom-theme contrast, host-loaded brand fonts, font fallback at large scale, or Hermes locale/time-zone/DST behavior was established. Validate actual supported typography/date widgets on supported engines. No need for a new theme abstraction.

## Canary entry and exit policy

### Before merge into the requested canary track

1. Resolve G1/G2 in a bounded release-safety PR batch; keep explicit canary tags and source-only availability, Web stable pin 0.3.0, Native out of Web stable matrix.
2. Reconcile dirty credential repair; correct token setup and rollback prose; state tested versus intended Native support and settle the availability gate ambiguity.
3. Complete parent-owned remaining defect triage and exact-final-HEAD R6/Native/registry checks and UI evidence. Historical reports are not proof for a later commit. Do not rerun builds concurrently with task61.
4. Confirm with the authorized owner that Native publication stays disabled unless separately approved. Merge authorization and canary publication authorization are distinct; this user request grants neither.

### Before first public Native canary (entry)

- Owner verifies package ownership, main-only protected environment/reviewers, enable variable, trusted publishers and restricted dist-tag secret. Validate no automatic/latest route and retain the Web stable hold.
- Exact core/native 0.4.0 prerelease tarballs, rewritten exact dependency, dist/types/license/metadata, CI and isolated installed consumer pass. Record SHA/integrity and tested matrix.
- Staging/rollback failure scenarios have read-only/stub evidence and an assigned recovery owner. Live publication/recovery exercise requires separate explicit authorization.
- Keep package installation unavailable in discovery until exact versions are visible and consumer validation satisfies the explicitly chosen entry policy. If physical/AT gates remain entry requirements per Native changelog, do not weaken them by changing availability after mere upload. If owner decides those are stable-exit gates, align changelog/guide explicitly first.
- On approved publication, verify both canary tags and unchanged latest tags; update manifest/projections via reviewed generation, not premature hand edits. Expose experimental status and exact tested versions.

### Before leaving canary (exit)

- No unresolved supported crash/data-loss/security/accessibility defects from the ledger; migration/API and capability boundaries documented.
- Physical Android/iOS + VoiceOver/TalkBack evidence and representative RTL/font-scale/keyboard/safe-area/motion/theme/locale cases on the promised runtime matrix. Clearly record any unsupported targets.
- Fresh packed consumer resolution, complete Metro transform/device run, React/RN peer compatibility, install/uninstall behavior, licensing/dependency inventory, bundle-cost measurement, and external service failure/cancellation UX evaluated.
- Final CI, true committed-baseline Web visuals, registry localization/SEO/install/MCP/llms consistency and successful owner-verified previews; no snapshot-update green substituted for comparison.
- Published canary feedback/incident triage, reproducible artifact/run mapping, explicit owner of security/support and tested recovery procedure. Define observation/acceptance evidence; do not invent an arbitrary soak duration.

### Manual stable promotion only

Separate reviewed PR and explicit maintainer authorization after exit evidence, protected main-only release environment and confirmation. Remove the 0.4.0 hold only in that PR. Native stable version/dependency/tag policy is a separate decision and workflow, never an implicit Web matrix expansion. No merge hook, timer, successful-check trigger, or canary tag automatically promotes latest. Web registry stable pins advance only after the corresponding stable version is actually published. Record before/after tags and verify fresh installs/provenance; on failure stop and diagnose before any retry/retag. Do not interpret this report as permission to run any of these external operations.

## Audited surface inventory and reuse ledger

This table is the complete inventory of surfaces audited here, not a claim every implementation in a grouped directory was reread line-by-line.

| Surface | Paths / depth / result |
|---|---|
| Owner/project rules | `docs/agents/{RULES,PR_PLAYBOOK,COMPONENTS,BRANCHING}.md`, inherited AGENTS; read. Protected security/license/workflow changes respected. |
| Publication graph | `.github/workflows/{publish,native-canary,ci}.yml` fully read; remaining `{storybook,react-doctor,pr-issue-link}.yml` trigger/action scan. Current dirty/HEAD release diff distinguished. No workflow mutation. |
| Versions/toolchain | All seven workspace manifests enumerated; root/core/native/catalog fully read; Web/registry version and publication anchors inspected. `apps/native-catalog/app.json`, Native `tsup.config.ts` read. |
| Release claims | `docs/RELEASING.md` fully read; root/Web/core/Native changelog release/availability/version anchors inspected; Native README and Native English guide fully read. Localized/SEO projection coverage reused from Web audit, not newly certified. |
| Availability/contracts | Native and Web registry JSON parsed/counts checked; `packages/design/component-contracts.json` fully read; generator stable/version/platform anchors inspected. Five portable contracts, 166 adaptations, source-only and stable Web pin established. |
| Runtime/adapters/theme | `src/primitives/{platform-services.ts,modal-layer.tsx}`, `src/theme/theme-provider.tsx` fully read; safe-area exposure searched in Dialog/Sheet/DatePicker/Combobox; Calendar constructor anchors checked; RTL/font-scale source search performed. No fresh 171-component implementation audit. |
| Catalog/platform proof | `apps/native-catalog/{README.md,package.json,app.json}` read; `App.tsx`, `catalog-sections.tsx` platform/accessibility anchors searched; CI/native scripts read. Workspace Expo bundle versus installed app boundary established. |
| Package/security evidence | `docs/PR506_PACKAGE_SECURITY_REVIEW.md` fully read/reused for lock/build/pack/consumer boundaries. Existing paired tarballs independently listed for LICENSE. `SECURITY.md` fully read but protected. No third-party source/advisory/SBOM audit claim. |
| Prior component findings | `docs/PR506_READINESS_REVIEW.md` fully read; residual/superseding entries in `PR506_NATIVE_REVIEW_{AC,DL,MR,SZ,SZ_ASYNC,SZ_CONTRACTS}.md` searched. Existing organization map used as historical-path context; tests not moved or rerun. |
| Web/registry evidence | `docs/PR506_WEB_REGISTRY_REVIEW.md` existing inventory/evidence reused; existing report distinguishes source availability, comparison, locale, MCP/llms, browser previews and stable pinning. No new browser verification or preview-status claim. |
| External owner state | npm tags/package ownership/OIDC/token rights, repository variable/environment reviewers, branch protections and deployment logs **not checked**; explicit owner gate rather than assumed safe. |

## Checks performed in this audit

- Read-only Git branch/status/HEAD and protected dirty diff inspected; no mutation.
- Parsed all workspace package versions and both registry manifests; counts/compatibility/availability above verified.
- Extracted Native workflow embedded publication shell and ran `bash -n` via stdin: **exit 0**. This checks shell syntax, not YAML/Actions expression validity, authentication, rollback correctness, or successful publication.
- Inspected existing paired tarball listings: both include LICENSE. Those artifacts are earlier report artifacts, not a fresh final-HEAD pack.
- No full build/test/Metro/Next/device/registry mutation performed. Task61 remains owner of aggregate verification. No task statuses were fabricated.

**Only path written:** `docs/PR506_CANARY_GAP_REVIEW.md`.
