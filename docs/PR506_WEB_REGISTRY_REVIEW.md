# PR #506 Web and registry source review

PR: https://github.com/vllnt/ui/pull/506

## Scope and method

Reviewed `origin/main...811451e3cb223f8513e069f3dfee4471fb65d126` in `/Users/bntvllnt/Github/vllnt/ui-native-platform`, plus the local changes made below. Initial tracked local changes were outside apps/registry and packages/ui. Inventory: 120 changed paths, including 10 generated mirrors and the protected package changelog. Every handwritten file's changed code was inspected, with surrounding implementations and consumers examined for the affected contracts. This is a changed-source audit, not a claim to have reviewed every unchanged line in the large preview catalog, historical changelog, or package manifests.

Read RULES, PR_PLAYBOOK, COMPONENTS, BRANCHING, DESIGN.md and design tokens. React 19 ref cleanup is supported by the current component conventions (which supersede the older forwardRef summary). Parent owns aggregate checks and tracking; task tools were unavailable in this child. No agents, commits, pushes, dependency installation, deployment, full build, or E2E runs were performed. Native files, workflows, changelogs, shared readiness reports, and the other worker's core/design/build/package-consumer scope were not edited.

## Repairs

1. **Catalog disagreed with its own metadata and selector for repeated platform keys.** `/components?platform=native&platform=web` was interpreted as Native by metadata and the client selector, but the page's scalar-only schema parse rejected the array and displayed all Web entries. The page now uses the same `getPlatform(..., "all")` resolver. Added an actual server-page render regression checking inventory, JSON-LD URL, and canonical metadata, plus resolver coverage.
2. **MCP silently discarded malformed renderer filters.** `search_components` treated non-string, empty, or array platform input as an omitted filter, potentially returning the wrong renderer catalog; it also accepted uppercase values that `get_component` rejected. Both use the same strict parser matching the advertised enum. Invalid filters are rejected even when the requested component does not exist. Omitted platform retains the legacy combined descriptor. Added six malformed-input cases against both tools.

## Verification performed here

Environment: Node v22.23.2, Corepack pnpm 9.15.4.

- `corepack pnpm -F @vllnt/ui-registry exec vitest run 'app/[locale]/components/page.test.ts' app/mcp/route.test.ts lib/platform.test.ts` — **3 files, 19 tests passed**, final run 223ms. These are focused tests, not workspace validation. No pre-fix test run is claimed.
- `corepack pnpm -F @vllnt/ui-registry exec eslint 'app/[locale]/components/page.tsx' 'app/[locale]/components/page.test.ts' app/mcp/route.ts app/mcp/route.test.ts lib/platform.test.ts --fix` — final run **exit 0**. Earlier test-fixture lint problems were corrected without suppressions.
- `git diff --check -- apps/registry packages/ui` — **exit 0**.
- Read-only generator correspondence check: all **8 changed source mirrors exactly equal canonical Web source after the generator's three import rewrites**. No generated file was edited.
- Read-only registry comparison: **313 Web descriptors, 171 Native pairings, 313 preview metadata records**. Every platform list and Native source/compatibility pairing agrees with the Native manifest; preview platform metadata agrees with registry items. Semantic comparison against origin/main found only `platforms` (313 entries) and `native` (171 entries) changed in registry item data; no existing descriptor properties were altered.
- Parent-reported aggregate/E2E results were not rerun or independently certified here. New local fixes still need inclusion in the parent's final HEAD validation evidence.

## Boundaries and remaining observations

- JSON-LD uses `JSON.stringify` plus `<` escaping, preventing an HTML `</script>` breakout; graph serialization strips only per-node context and preserves single-node semantics. Source code is rendered through StaticCode, not injected as executable HTML.
- Component and embed slugs are looked up in the trusted shipped catalog before source or preview selection. Native source paths originate in the manifest/generator, not URL input. No user-directed fetch, shell execution, write, authentication, or secret access was introduced by these changes.
- MDX evaluation is **trusted-code execution**, not a sanitizer. Current changed docs use repository-owned MDX; changelog and release-note views explicitly disable MDX. Do not accept untrusted/customer MDX through the default-enabled MDXContent API. That pre-existing contract was not broadened here.
- Production catalog thumbnails use opaque-origin sandboxing (`allow-scripts` only). Development same-origin permission is limited to an alternate loopback origin. Interactive Storybook embeds continue trusting the configured Storybook origin with scripts and same-origin permission; do not point that configuration at untrusted content or the registry origin.
- Native metadata and guides truthfully say experimental/source-only and do not expose an enabled install action. Device, VoiceOver/TalkBack, and stable Native release readiness remain outside this source audit.
- **Existing, not repaired here:** family pages canonicalize to the unfiltered route and their CollectionPage lists remain unfiltered even when visible content is Native-filtered. Homepage metadata overrides the new layout metadata with the older Web-only description. These are discoverability/structured-data follow-ups, not security defects; avoid claiming every SEO surface is Native-specific.
- **Existing, not repaired here:** Web Tabs retains its pre-existing memoized callback dependency omission and does not implement a complete keyboard map itself. The new source tabs explicitly implement arrow/Home/End navigation and roving focus; the outer Preview/Code tablist does not. Sidebar family labels and theme-toggle labels still contain English defaults; changing header/sidebar aria labels does not prove complete French accessibility localization. AnimatedText still lacks a reduced-motion subscription and keeps the scramble timer after reveal; this predates the interval-side-effect change.
- Source tabs read workspace source files using `process.cwd()`. This audit verifies source lookup logic and checked-in correspondence, **not standalone deployment file inclusion**. The build/deployment owner should confirm Native source tabs survive the deployed artifact, rather than relying on a development server.

## Per-file coverage

Paths below are relative to repository root. “Reviewed” means changed source plus relevant surrounding contract, not a separate runtime pass for that file. Build/package files were read for source impact only; their owning worker retains package-consumer validation.

| Path | Inspection evidence / result |
| --- | --- |
| `apps/registry/app/[locale]/build/[slug]/page.tsx` | Reviewed Sidebar replacement; catalog-resolved slugs, localized Links, escaped FAQ graph, Web install commands retained. |
| `apps/registry/app/[locale]/changelog/page.tsx` | Reviewed Sidebar replacement; filter form and changelog markdown retain `enableMDX={false}`. |
| `apps/registry/app/[locale]/components/[slug]/page.tsx` | Reviewed source file selection, Native ordering, unavailable source fallback, MDX kit, install distinction, related filtering, localized/query links and canonical JSON-LD. Deployment source tracing not certified. |
| `apps/registry/app/[locale]/components/[slug]/playground/page.tsx` | Reviewed Sidebar replacement and surrounding Web-only playground; canonical remains parent component route. |
| `apps/registry/app/[locale]/components/page.tsx` | Reviewed filter/count/cards/CollectionPage/metadata. Repaired repeated-query disagreement; server render regression added. |
| `apps/registry/app/[locale]/design/page.tsx` | Reviewed Sidebar replacement and repository design-markdown rendering; no new untrusted content path. |
| `apps/registry/app/[locale]/docs/[slug]/page.tsx` | Reviewed allowlisted docs lookup, installation renderer switch, title stripping and locale/query canonical. Native content remains trusted MDX. |
| `apps/registry/app/[locale]/docs/page.tsx` | Reviewed Sidebar replacement, single-title rendering and localized document links. |
| `apps/registry/app/[locale]/families/[category]/page.tsx` | Reviewed Native filtering, empty state, query propagation and catalog lookup. Existing unfiltered JSON-LD observation above. |
| `apps/registry/app/[locale]/families/page.tsx` | Reviewed family counts and platform filtering, localized/query Links. Existing metadata/JSON-LD observation above. |
| `apps/registry/app/[locale]/layout.tsx` | Reviewed source-only description and renderer keywords; locale validation, provider boundaries, escaped global graph retained. |
| `apps/registry/app/[locale]/native/page.tsx` | Reviewed fixed-target permanent redirect preserving unrelated query and forcing Native; no open redirect. |
| `apps/registry/app/[locale]/not-found.tsx` | Reviewed Sidebar replacement, locale fallback, noindex and safe fixed recovery links. |
| `apps/registry/app/[locale]/page.tsx` | Reviewed Sidebar replacement and landing consumer; homepage's own Web-only metadata still overrides layout. |
| `apps/registry/app/[locale]/philosophy/page.tsx` | Reviewed title stripping, simplified MDX wrapper and escaped locale-aware article graph. |
| `apps/registry/app/[locale]/releases/page.tsx` | Reviewed Sidebar replacement; release-note content keeps MDX disabled. |
| `apps/registry/app/[locale]/report/page.tsx` | Reviewed Sidebar replacement; component query remains text passed to form, no new execution path. |
| `apps/registry/app/[locale]/request-component/page.tsx` | Reviewed Sidebar replacement; translated form shell and noindex preserved. |
| `apps/registry/app/[locale]/templates/[slug]/page.tsx` | Reviewed Sidebar replacement and allowlisted template lookup; links/metadata behavior preserved. |
| `apps/registry/app/[locale]/templates/page.tsx` | Reviewed Sidebar replacement; template graph and localized navigation remain intact. |
| `apps/registry/app/[locale]/themes/page.tsx` | Reviewed Sidebar replacement; translated token editor shell unaffected. |
| `apps/registry/app/[locale]/vs/assistant-ui/page.tsx` | Reviewed Sidebar replacement; translated comparison table and fixed route Links retained. |
| `apps/registry/app/[locale]/vs/page.tsx` | Reviewed Sidebar replacement; unavailable comparisons remain non-links, graph filters available entries. |
| `apps/registry/app/[locale]/vs/shadcn/page.tsx` | Reviewed Sidebar replacement; translated rich-text renderers and table semantics retained. |
| `apps/registry/app/[locale]/vs/vercel-ai-sdk/page.tsx` | Reviewed Sidebar replacement; translated comparison and safe fixed build link retained. |
| `apps/registry/app/embed/[slug]/page.tsx` | Reviewed thumbnail-only shell, allowlisted slug, strict mode/theme equality and noindex metadata. |
| `apps/registry/app/llms-full.txt/route.ts` | Reviewed Native manifest/source descriptions and pending install disclaimer; text response, trusted guide inputs. |
| `apps/registry/app/llms.txt/route.ts` | Reviewed platform discovery section, source-only notice and stable descriptor links; no renderer source execution. |
| `apps/registry/app/manifest.ts` | Reviewed derived Web/Native counts and source-only language; asset paths unchanged. |
| `apps/registry/app/mcp/route.test.ts` | Reviewed projections/default compatibility coverage; added malformed-filter regressions. Focused suite passed. |
| `apps/registry/app/mcp/route.ts` | Reviewed complete JSON-RPC dispatch, read-only tool boundary, renderer projections and source-only availability. Unified strict platform parsing. Existing transport/batch semantics not redesigned. |
| `apps/registry/app/r/native/registry.json/route.ts` | Reviewed static JSON response from parsed Native manifest. |
| `apps/registry/app/r/registry.json/route.ts` | Reviewed switch to parsed registry rather than raw JSON; supported descriptor fields retained by schema. |
| `apps/registry/app/sitemap.ts` | Reviewed localized Native catalog/install URLs and unlocalized raw manifest URL; canonical component URLs remain unsuffixed. |
| `apps/registry/components/component-card/component-card.tsx` | Reviewed removal of enclosing interactive link, semantic article/title, translated action, platform badges and query-aware destination. |
| `apps/registry/components/component-mdx/component-mdx.tsx` | Reviewed kit callbacks: comparison replaces duplicate preview, source anchor only with sources, installation remains text/code. |
| `apps/registry/components/component-mdx/storybook-link.tsx` | Reviewed URLSearchParams encoding and noopener/noreferrer external target. |
| `apps/registry/components/component-preview/component-preview.tsx` | Reviewed changed import and SidebarPreview body; inert static illustration no longer mounts global Sidebar effects inside thumbnails. Unchanged demo catalog not line-audited. |
| `apps/registry/components/component-source-code/component-source-code.tsx` | Reviewed empty-source fallback and StaticCode rendering of both implementations. |
| `apps/registry/components/component-source-code/component-source-tabs.tsx` | Reviewed IDs, active-only aria-controls, roving tab stops, arrow/Home/End handling scoped to direct tabs. |
| `apps/registry/components/component-source-code/index.ts` | Reviewed type/component barrel exports. |
| `apps/registry/components/component-thumbnail/component-thumbnail.tsx` | Reviewed complete observer lifecycle, theme subscription, offscreen iframe release, encoded slug and production/development sandbox distinction. |
| `apps/registry/components/footer/footer.tsx` | Reviewed Native catalog route and raw Native manifest link kinds; locale treatment remains route-vs-asset aware. |
| `apps/registry/components/header/header.tsx` | Reviewed Suspense fallback, query preservation, locale switches, platform-filtered search and translated drawer labels. |
| `apps/registry/components/landing/landing.tsx` | Reviewed renderer choice cards, explicit stable/source-preview language, semantic tokens and fixed catalog query links. |
| `apps/registry/components/platform-badges/index.ts` | Reviewed barrel export. |
| `apps/registry/components/platform-badges/platform-badges.tsx` | Reviewed translated availability labels and semantic Badge variants; no install claim. |
| `apps/registry/components/platform-comparison/index.ts` | Reviewed barrel export. |
| `apps/registry/components/platform-comparison/platform-comparison.tsx` | Reviewed dependency separation, portable/adapted distinction and unavailable Native row. |
| `apps/registry/components/platform-selector/index.ts` | Reviewed barrel export. |
| `apps/registry/components/platform-selector/platform-selector.tsx` | Reviewed URL-backed selection, All removal, query retention, localized links and active state. |
| `apps/registry/components/platform-sidebar/index.ts` | Reviewed barrel export. |
| `apps/registry/components/platform-sidebar/platform-sidebar.tsx` | Reviewed manifest-name filter, family empty removal, query preservation and Suspense fallback; no Native renderer import. |
| `apps/registry/components/playground/preview-playground-tabs.tsx` | Reviewed single preview/code surface, optional code and hash navigation. Outer tab keyboard limitation noted above. |
| `apps/registry/components/quick-add/quick-add.tsx` | Reviewed explicit Web install label in Native context; underlying shadcn/v0 behavior preserved. |
| `apps/registry/components/storybook-embed/storybook-embed.tsx` | Reviewed theme selection, idle initialization/cleanup, localized loading and reduced-motion CSS. Configured Storybook remains trusted. |
| `apps/registry/content/pages/docs/agents/en.mdx` | Reviewed renderer discovery and manifest guidance; code fences are explanatory. |
| `apps/registry/content/pages/docs/agents/fr.mdx` | Reviewed matching French guidance and diacritic-stripped copy. |
| `apps/registry/content/pages/docs/installation/en.mdx` | Reviewed Web track introduction/prerequisites; published package and stylesheet guidance unchanged. |
| `apps/registry/content/pages/docs/installation/fr.mdx` | Reviewed matching Web track and localized component-index link. |
| `apps/registry/content/pages/docs/native/en.mdx` | Reviewed entire new guide: 171 modules, React19/RN0.81+, source-only canary, native contracts/services and device-evidence limits. |
| `apps/registry/content/pages/docs/native/fr.mdx` | Reviewed entire new guide against English, French catalog/detail paths and stripped-diacritic style. |
| `apps/registry/content/pages/docs/registry/en.mdx` | Reviewed additive platform/native schema explanation and Web files/install distinction. |
| `apps/registry/content/pages/docs/registry/fr.mdx` | Reviewed matching French schema/install disclaimer. |
| `apps/registry/e2e/i18n.spec.ts` | Reviewed single-H1 and updated French hero assertions; no E2E rerun. |
| `apps/registry/e2e/native-seo.spec.ts` | Reviewed locale/canonical/OG/Twitter and Web-only exclusion assertions; no E2E rerun. |
| `apps/registry/e2e/platforms.spec.ts` | Reviewed complete new suite: filtering, sandbox, query/locale navigation, paired source keyboard controls, redirects and drawer/320px layout; no E2E rerun. |
| `apps/registry/lib/component-metadata.json` | Generated: all 313 platform records checked against source registry; added fields match generator. |
| `apps/registry/lib/jsonld.test.ts` | Reviewed graph, locale URL, filtered override and dual runtime assertions. |
| `apps/registry/lib/jsonld.ts` | Reviewed complete serializer/helpers; `<` escaping retained, Native runtime metadata additive. |
| `apps/registry/lib/markdown.test.ts` | Reviewed leading H1 removal vs H2 preservation. |
| `apps/registry/lib/markdown.ts` | Reviewed anchored single-heading replacement; not an HTML/MDX sanitizer. |
| `apps/registry/lib/native-registry.test.ts` | Reviewed source-only, existing source path, pairing and ordering assertions. |
| `apps/registry/lib/native-registry.ts` | Reviewed Zod enum/path validation and browser-safe static manifest import. |
| `apps/registry/lib/platform.test.ts` | Reviewed query merge/All/default tests; added repeated-key consistency test. Focused suite passed. |
| `apps/registry/lib/platform.ts` | Reviewed complete resolver/query builder: repeated values, target-query precedence, platform replacement and fragment preservation for internal routes. |
| `apps/registry/lib/portable-contracts.test.ts` | Reviewed structural option compatibility assertions; these do not claim full cross-renderer behavioral parity. |
| `apps/registry/lib/registry.test.ts` | Reviewed invalid/duplicate platforms and Native pairing rejection. |
| `apps/registry/lib/registry.ts` | Reviewed complete parse seam: unique nonempty platform list, paired Web requirement, examples framework enum and additive Native metadata. |
| `apps/registry/messages/en.json` | Reviewed all changed keys: source-only claims, platform labels, source labels, drawer actions and loading text. |
| `apps/registry/messages/fr.json` | Reviewed corresponding changed keys, interpolation parity and French source-only meaning. |
| `apps/registry/middleware.ts` | Reviewed fixed legacy Native docs redirect, locale derivation, query preservation and asset exclusions; no user-selected redirect target. |
| `apps/registry/next.config.mjs` | Reviewed loopback-only development origin addition and existing standalone output. Artifact source inclusion remains build-owner verification. |
| `apps/registry/package.json` | Reviewed ui-core workspace dependency and removal of forced English Pagefind indexing; dependency installation not performed. |
| `apps/registry/playwright.config.ts` | Reviewed serialization of local cold dev and unchanged CI/external server modes; no test scope removed. |
| `apps/registry/registry.json` | Generated: semantic diff is platform/native fields only; 313 Web and 171 Native pairings verified. |
| `apps/registry/registry.ts` | Reviewed default/named exports now use single parsed seam. |
| `apps/registry/registry/default/animated-text/animated-text.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/registry/default/interactive-timeline/interactive-timeline.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/registry/default/map-timeline/map-timeline.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/registry/default/mdx-content/mdx-content.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/registry/default/navbar-saas/navbar-saas.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/registry/default/sidebar/sidebar.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/registry/default/tabs/tabs.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/registry/default/typewriter/typewriter.tsx` | Generated: exact canonical source after import rewrites verified. |
| `apps/registry/scripts/check-registry-integrity.ts` | Reviewed complete script, manifest pairing/availability/uniqueness and preserved published Web dependency checks. |
| `apps/registry/scripts/generate-component-metadata.ts` | Reviewed complete generator, story-ID derivation and new platform projection. |
| `apps/registry/scripts/inline-component-source.ts` | Reviewed complete generator, source import rewriting, Native projection, stale field removal and deterministic timestamp behavior. |
| `apps/registry/scripts/stamp-registry-metadata.ts` | Reviewed complete per-item/index metadata restamping; shadcn files remain Web source. |
| `apps/registry/types/registry.ts` | Reviewed type-only platform re-export. |
| `packages/ui/CHANGELOG.md` | Protected scope: changed-path inventory only; no edit or changelog-content certification. |
| `packages/ui/eslint.config.js` | Reviewed test-only null rule relaxation and test-setup inclusion; runtime rules not relaxed by this diff. |
| `packages/ui/package.json` | Reviewed pack-check script and tailwindcss-animate move to runtime dependency; package-consumer validation belongs to other worker. |
| `packages/ui/scripts/check-packed-package.mjs` | Reviewed new source: temp directory lifecycle, export/specifier checks, installed dependency symlinks and optional-peer stubs. Root entry resolution is not a full root-module import test. |
| `packages/ui/src/components/animated-text/animated-text.tsx` | Reviewed timer-side-effect removal and surrounding reveal/scramble state. Pre-existing reduced-motion/timer limitation recorded. |
| `packages/ui/src/components/interactive-timeline/interactive-timeline.tsx` | Reviewed measured-scroll extraction, React19 callback-ref cleanup and surrounding pointer/scroll contract; no new pointer behavior introduced. |
| `packages/ui/src/components/map-timeline/map-timeline.tsx` | Reviewed synchronous year deduplication and callback moved outside updater; surrounding playback still uses effect-synchronized year ref. |
| `packages/ui/src/components/mdx-content/mdx-content.test.tsx` | Reviewed regression for long imports and literal component names; no claim that MDX is safe for untrusted input. |
| `packages/ui/src/components/mdx-content/mdx-content.tsx` | Reviewed complete markdown/evaluate flow, linear line-based import removal and semantic code-block colors. Trusted MDX boundary noted. |
| `packages/ui/src/components/navbar-saas/navbar-saas.test.tsx` | Reviewed query-aware active-page and translated/sidebar-control relationship assertions. |
| `packages/ui/src/components/navbar-saas/navbar-saas.tsx` | Reviewed complete implementation, explicit sidebarId, open/close labels, query stripping and responsive icon states. Existing defaults remain English. |
| `packages/ui/src/components/sidebar/sidebar.test.tsx` | Reviewed current override, drawer inertness, Escape/focus restore and desktop collapsed assertions. |
| `packages/ui/src/components/sidebar/sidebar.tsx` | Reviewed complete navigation, mobile lifecycle, focus trap, focus restore, inert hidden state and query-aware current matching. Existing family-label localization limitation noted. |
| `packages/ui/src/components/tabs/tabs.test.tsx` | Reviewed forwarded IDs/relationships/tab stops assertions; not evidence for an intrinsic full keyboard map. |
| `packages/ui/src/components/tabs/tabs.tsx` | Reviewed complete compound implementation and additive ARIA/keyboard-handler props. Existing callback/keyboard limitations noted. |
| `packages/ui/src/components/typewriter/typewriter.test.tsx` | Reviewed fake-timer speed-change progress regression and timer reset setup. |
| `packages/ui/src/components/typewriter/typewriter.tsx` | Reviewed complete per-character timeout, text/reduced-motion reset, speed clamping and cleanup. |
| `packages/ui/src/lib/use-horizontal-scroll.ts` | Reviewed complete hook; effect attaches listener/observer to captured node and cleans that node on replacement/unmount. |
| `packages/ui/src/test-setup.ts` | Reviewed in-memory Storage mock and existing observer/scroll stubs; this does not simulate browser quota/storage events. |
| `packages/ui/tsup.config.ts` | Reviewed changed source rewriting of resolvable ESM paths and known dependency directory; build/consumer owner validates artifacts. |

## Paths written or edited by this audit

- `apps/registry/app/[locale]/components/page.tsx`
- `apps/registry/app/[locale]/components/page.test.ts` (new server-render regression)
- `apps/registry/app/mcp/route.ts`
- `apps/registry/app/mcp/route.test.ts`
- `apps/registry/lib/platform.test.ts`
- `docs/PR506_WEB_REGISTRY_REVIEW.md`

No unresolved technical blocker prevented the assigned changed-source inventory review. This report is not merge authorization and does not replace the parent's full-HEAD gates or device/deployment evidence.
