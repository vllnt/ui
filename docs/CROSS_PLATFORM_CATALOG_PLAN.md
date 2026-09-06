# Cross-platform catalog upgrade plan

> Status: local implementation plan for the 0.4.0 web canary and the experimental native renderer. Nothing in this plan authorizes a push, deployment, merge, stable native release, or npm publication.

## Outcome

VLLNT UI should present one design system with two explicit renderers:

| Renderer | Package | Channel | Installation |
|---|---|---|---|
| Web | `@vllnt/ui` | stable + canary | package or shadcn registry |
| React Native | `@vllnt/ui-native` | experimental source preview | unavailable until synchronized canary publication |

The website must never imply that web source, DOM props, Storybook previews, or shadcn descriptors run on React Native. Shared tokens and portable option contracts are common; source, runtime props, accessibility APIs, dependencies, examples, previews, and installation are renderer-specific.

## Audit summary

The initial audit found a correct package boundary and a five-component native pilot, but a web-first catalog with native metadata appended. The local implementation now expands that source catalog and keeps package installation gated.

### Blocking gaps

1. Platform choice only exists on `/components`; cards, search, locale switching, family pages, details, and docs discard it.
2. Native-capable details keep the web shadcn action as the primary CTA and append native installation below web source and Storybook.
3. The homepage hero, header, docs entry point, release language, and package guidance remain web-first.
4. The combined registry attaches native availability to web-only examples, files, props, and dependencies. Agents can therefore generate invalid native code.
5. Native cards render web previews. Gallery previews can also place interactive links inside the card link, producing invalid nested anchors and broken navigation.
6. The native install command is advertised although the package has not yet been released. The UI needs an availability gate and truthful fallback.
7. `parity: full` is ambiguous: portable options may align while DOM and React Native props intentionally differ.
8. Search uses platform words as keywords but cannot filter by the selected renderer.
9. MCP category links use an unsupported `?category=` query. Machine outputs do not provide renderer-specific projections.
10. Docs can render duplicate H1s and use raw palette classes that violate `DESIGN.md`.
11. Mobile header controls clip at narrow widths, and scrollable code regions found by Axe are not keyboard-focusable.
12. The published `0.4.0-canary.927b45a` web tarball has an unresolved Node ESM directory export. The repository must validate against workspace source until a fixed canary exists.

### Evidence

- Current registry: 313 web components in 12 existing categories.
- Audit-time native manifest: Badge, Button, Card, Heading, Text; the local source manifest now contains 171 modules.
- Audit-time `/components?platform=native` showed five cards and dropped platform state; current links preserve it.
- Native-capable details show web Storybook/source/MDX first.
- Runtime review found invalid nested anchors in live gallery previews.
- Desktop/mobile screenshots and Axe scans covered `/`, `/components`, native filtering, Button detail, and `/docs/installation?platform=native`.

## Product and URL contract

### Platform state

- URL is the sole source of truth: `?platform=web|native`.
- Component details and general navigation default to `web` when omitted.
- `/components` may retain an explicit `All` catalog view when the query is omitted.
- Preserve `platform`, unrelated query parameters, locale, and hash through internal links.
- Do not use cookies or local storage for platform state in the canary.
- Query variants canonicalize to the existing locale-aware path; they are not separate sitemap entries.

### Required public journeys

1. Homepage: choose **Web** or **React Native · Experimental** before installation.
2. Catalog: filter All/Web/Native with counts and an announced result summary.
3. Card: show the selected renderer, maturity, package, and parity; preserve selection in the link.
4. Detail: switch renderer beside the title. Web keeps its preview and install workflow; Native shows compatibility, requirements, source path, and source-only availability.
5. Unsupported combination: show “Web only” plus links back to web detail and native catalog; never silently switch.
6. Docs: installation begins with a renderer decision. Native has a dedicated hub and guide.
7. Search: filter component results by renderer and preserve the renderer on selection.
8. Machine consumers: request a platform-specific component projection with the exact install model.

## Renderer-first data model

Keep legacy fields for one compatibility cycle, but add a versioned renderer model:

```json
{
  "schemaVersion": "1.0",
  "name": "button",
  "platforms": ["web", "native"],
  "renderers": {
    "web": {
      "package": "@vllnt/ui",
      "status": "stable",
      "install": { "kind": "shadcn", "command": "..." },
      "source": ["..."],
      "props": [],
      "examples": [],
      "preview": { "kind": "storybook", "id": "..." }
    },
    "native": {
      "package": "@vllnt/ui-native",
      "status": "experimental",
      "channel": "canary",
      "compatibility": "portable-options",
      "install": {
        "kind": "unavailable",
        "plannedCommand": "pnpm add @vllnt/ui-native@canary",
        "reason": "The first synchronized native canary has not been published."
      },
      "source": ["..."],
      "exports": ["Button"],
      "props": [],
      "examples": [],
      "preview": { "kind": "catalog" }
    }
  }
}
```

Rules:

- `/r/<name>.json` remains the backward-compatible web/shadcn descriptor.
- A separate `/r/native/registry.json` describes native package exports and compatibility.
- `platforms` and the legacy `native` object are derived compatibility projections.
- Native-only components are allowed by the new union model even though none ship in the first batch.
- `compatibility` uses precise values such as `portable-options`, `component-family`, or `native-adapted`; it never claims identical React props.
- An item is installable as native only when source, public export, tests, manifest entry, synchronized package publication, and release evidence all exist.

## Website implementation

### Shared modules

- `lib/platform.ts`: parse platform state, preserve queries/hashes, test support, build renderer-aware links.
- `lib/component-install.ts`: typed install specifications for web and native.
- `lib/component-source.ts`: resolve renderer source from manifests.
- `components/platform-selector`: global Web/Native control with visible experimental text.
- `components/component-platform-nav`: local detail control.
- `components/platform-link`: query-preserving localized links.
- `components/native-preview`: honest catalog/static state, never a DOM preview labeled native.

### Header and responsive navigation

- Desktop: persistent Web / Native selector.
- Mobile: menu, brand, compact selected-platform control, and search remain visible; release, locale, theme, and GitHub actions move into overflow/navigation.
- Minimum touch target: 44 px where practical.
- Selected platform uses visible text and `aria-current`/checked state, not color alone.
- Test at 320, 375, 768, 1024, and 1440 px with no horizontal overflow.

### Catalog and cards

- Filters display `All 313`, `Web 313`, and the generated native count.
- Native mode never mounts `ComponentThumbnail` from the web renderer.
- Replace the outer card link with valid article/link structure so preview descendants cannot create nested anchors.
- Native cards show package, experimental status, and compatibility scope.
- Family pages and related cards accept the same platform query and filter consistently.
- Empty states explain the limitation and offer a next action.

### Component detail

- Renderer navigation appears directly below title/description.
- Web view retains Storybook, shadcn, DOM source, examples, and dependencies.
- Native view shows compatibility, source path, peer requirements, and the package availability gate without presenting a working install action.
- “Add to v0” is web-only.
- Unsupported native views render an explicit availability panel.
- Related components are filtered to the active renderer.
- Legacy preview/code/install hashes keep working.

### Homepage and docs

- Hero language becomes “Web and native UI for AI agents.”
- Give Web and Native separate status/install cards and browse actions.
- Keep one indexable `/components?platform=native` catalog instead of a separate Native hub.
- Keep one installation URL with platform selection; `?platform=native` renders Native setup in place.
- Remove duplicate document H1s and replace raw black/white/zinc classes with semantic tokens.
- Show the native package as unavailable until a real synchronized canary exists.

### Search

- Filter registry results by the active platform.
- Preserve platform in result links.
- Label results with renderer and status.
- Add native catalog/docs/install actions.
- Add locale metadata to Pagefind and stop forcing all indexed content to English.
- Never send search text to analytics.

## Machine-readable surfaces

### Registry JSON

- Publish a VLLNT catalog schema with `schemaVersion` and renderer records.
- Preserve existing web descriptor responses byte-compatible where possible.
- Add `/r/native/registry.json` with package/channel/status, peers, exports, compatibility, source paths, and platform-aware website URLs.

### MCP

- Keep existing tools and optional arguments backward-compatible.
- Add optional `platform` to `get_component`.
- Add `list_platforms` as an additive tool.
- Return platform-specific install/source/example/prop projections when requested.
- Return family URLs as `/families/<category>`.
- Reject invalid platform values rather than returning an unexplained empty set.

### `llms.txt` and `llms-full.txt`

- Split Web and Native installation sections.
- Add `/r/native/registry.json`; redirect legacy `/native` and `/docs/native` URLs into the unified platform-aware catalog and installation routes.
- Native detail links include `?platform=native`.
- State native channel, status, peer matrix, compatibility meaning, and exact supported exports.
- Never present a shadcn command as native installation.

### SEO

- Add localized `/native` metadata, hreflang, sitemap entries, and CollectionPage/SoftwareSourceCode JSON-LD.
- Generalize `softwareApplicationLd`; it currently hardcodes Web requirements.
- Keep query facets canonicalized to the aggregate page.
- Update PWA and homepage metadata to describe both renderers.

## Complete component disposition

Only **available** entries appear under `platforms: ["web", "native"]`. Other statuses are roadmap information and must not imply installability.

### Audit baseline (5)

`badge`, `button`, `card`, `heading`, `text`

### Implemented native-core batch (57)

These have credible implementations using React Native core primitives and the existing token/theme layer.

- Core: `avatar`, `banner`, `empty-state`, `grid`, `input`, `label`, `meter`, `panel`, `separator`, `skeleton`, `switch`, `textarea`
- Form: `text-field`, `inline-input`, `input-group`, `number-input`, `password-input`, `phone-input`, `search-bar`, `search-field`, `field`, `fieldset`, `item`
- Data: `data-list`, `stat-card`, `metric-cluster`, `sticky-metric`, `overview-board`, `progress-bar`, `progress-card`, `status-board`, `status-indicator`, `severity-badge`, `alert`, `countdown-timer`, `presence-sync-indicator`, `activity-log`, `live-feed`, `world-clock-bar`, `avatar-group`, `presence-stack`
- Data display: `glass-progress`
- Content: `callout`, `content-intro`, `tldr-section`, `credit-badge`, `plan-badge`, `role-badge`
- AI: `ai-message-bubble`, `ai-streaming-text`, `ai-tool-call-display`, `ai-source-citation`, `ai-artifact`
- Utility: `floating-action-button`, `spinner`, `aspect-ratio`, `truncated-text`

Acceptance for every implemented item:

- no DOM, Radix, Tailwind, NativeWind, or browser globals;
- no new runtime dependency unless separately justified;
- token-driven light/dark styles;
- React Native props and accessibility state;
- public export and type declarations;
- package test and representative interaction/accessibility assertion;
- representative Expo catalog coverage for each interaction family;
- native manifest entry with truthful compatibility;
- renderer-specific website install/source/example content;
- Metro Android and iOS export proof.

### Implemented native interaction and composite batches (109)

These modules now use the shared native interaction infrastructure and honest platform adaptations. They do not claim identical web props or browser behavior.

- Core/action: `copy-button`, `toggle`, `toggle-group`, `toolbar`, `checkbox`, `radio-group`, `slider`, `link`
- Form: `input-otp`, `select`, `native-select`, `combobox`, `multi-select`, `list-box`, `segmented-control`, `button-group`, `checkbox-group`, `tag-group`, `tags-input`, `color-picker`, `category-filter`, `filter-bar`, `calendar`, `range-calendar`, `date-field`, `date-picker`, `date-range-picker`, `time-field`, `time-picker`, `timeline-scrubber`, `form`, `file-upload`
- Overlay: `alert-dialog`, `dialog`, `share-dialog`, `drawer`, `sheet`, `command`, `context-menu`, `dropdown-menu`, `popover`, `tooltip`, `toast`
- Navigation: `navigation-menu`, `menubar`, `top-bar`, `sidebar`, `sidebar-provider`, `sidebar-toggle`, `bottom-bar`, `tabs`, `animated-tabs`, `view-switcher`, `workspace-switcher`, `breadcrumb`, `pagination`, `step-navigation`, `horizontal-scroll-row`
- Data display/content: `interactive-timeline`, `scroll-progress`, `floating-toolbar`, `tree-view`, `accordion`, `animated-list`, `animated-testimonials`, `carousel`, `collapsible`, `expandable-cards`, `faq`, `slideshow`, `blur-reveal`, `reveal-text`, `scramble-text`, `shimmer-text`, `spinning-text`, `text-animate`, `text-reveal`, `text-shimmer`, `typewriter`, `code-block`, `document-sibling-nav`, `share-section`, `terminal`
- AI: `conversation-thread`, `ai-chat-input`, `prompt-input`, `chain-of-thought`, `reasoning`, `thinking-block`, `agent-activity`, `model-selector`
- Learning: `tour`, `tutorial-complete`, `tutorial-filters`, `quiz`, `exercise`, `flashcard`, `rating`, `checklist`, `completion-dialog`, `progress-tracker`, `step-by-step`, `stepper`, `search-dialog`, `keyboard-shortcuts-help`
- Utility: `animated-text`, `number-ticker`, `marquee`, `resizable`

Shared prerequisites used by this group:

- modal/root boundaries, Android back, accessibility escape, and safe-area injection;
- controllable state and validation announcements;
- keyboard avoidance and caller-owned navigation integration;
- explicit gesture ownership, nested scrolling, and reduced motion;
- injected clipboard, link, share, and picker services;
- no added native runtime dependency.

### Intentionally web-only (29)

`typography`, `prose`, `hover-card`, `animated-tooltip`, `dock`, `code-playground`, `mdx-content`, `video-embed`, `animated-grid-pattern`, `dot-pattern`, `meteors`, `particles`, `sparkles`, `border-beam`, `shine-border`, `spotlight-card`, `progressive-blur`, `card-flip`, `tilt-card`, `magnetic`, `magnetic-button`, `shimmer-button`, `shiny-button`, `cursor`, `scroll-area`, `table-of-contents`, `table-of-contents-panel`, `theme-preset-provider`, `theme-switcher`

Website label: **Web only · Intentional**, with a short reason where ambiguity exists.

### Product/renderer decision required (113)

These may have native value, but porting them without a product, renderer, data, commerce, or interaction decision would create misleading parity.

- Core/content: `cookie-consent`, `kbd`, `qr-code`, `display`, `bento-grid`, `blog-card`, `timeline`, `object-card`, `object-inspector`, `policy-delivery-panel`, `property-section`, `relationship-inspector`, `routing-assignment-panel`, `runtime-overview-panel`, `subscription-card`, `wallet-card`
- Form: `scope-selector`, `newsletter-signup`
- Overlay/navigation: `edge-label`, `zoom-hud`, `navbar-saas`, `floating-navbar`, `left-rail`, `right-dock`, `jarvis-dock`, `viewport-bookmarks`, `world-breadcrumbs`
- Charts/market/tables: `area-chart`, `bar-chart`, `line-chart`, `pie-chart`, `radar-chart`, `gauge-chart`, `sankey-chart`, `flow-diagram`, `candlestick-chart`, `order-book`, `market-treemap`, `ticker-tape`, `watchlist`, `data-table`, `table`, `usage-breakdown`, `comparison`, `metric-gauge`, `threshold-ring`, `sparkline-grid`, `activity-heatmap`, `contribution-graph`, `bottom-activity-strip`, `run-timeline`, `heat-overlay`, `gantt-chart`, `mini-map-panel`
- Maps/timelines/canvas display: `choropleth-map`, `geography-quiz-map`, `globe-3d`, `heat-map-overlay`, `map-2d`, `map-timeline`, `route-map`, `story-map`, `chronological-timeline`, `historic-timeline`, `animated-beam`, `follow-mode`, `handoff-beacon`, `selection-halo`, `snap-guides`, `primary-source-viewer`
- AI: `ai-sidebar`, `chat-dock-section`, `prompt-templates`, `model-comparison`
- Learning/educational: `curriculum`, `tutorial-card`, `tutorial-intro-content`, `tutorial-mdx`, `annotation`, `key-concept`, `learning-objectives`, `pro-tip`, `profile-section`, `civilization-card`, `era-comparison`, `historical-figure-card`, `parallel-timeline`, `knowledge-check`
- Billing: `auto-reload`, `pricing-table`, `transaction-list`
- Utility/canvas: `glass-card`, `glass-panel`, `liquid-glass`, `canvas-shell`, `canvas-view`, `infinite-plane`, `anchor-port`, `connector-edge`, `object-handle`, `group-hull`, `context-lens`, `multi-select-lasso`, `playback-ghost`, `alert-pulse`, `state-badge-overlay`, `comment-pin`, `live-cursor`, `selection-presence`, `thread-bubble`, `lang-provider`, `theme-provider`, `theme-toggle`

Required decisions include SVG/chart renderer, map provider/licensing/offline behavior, canvas engine and hit testing, native commerce/store ownership, rich content/video strategy, and whether desktop-specific layouts have a mobile-native information architecture.

## Delivery phases

### Phase 0: contract and website truth

- Freeze renderer schema, URL behavior, compatibility vocabulary, and package availability gate.
- Fix invalid card markup and mobile header overflow.
- Implement global platform selection and renderer-correct install actions.
- Add native hub, renderer-specific detail state, and machine projections.

### Phase 1: 57 core-native candidates

- Implement the audited React Native core/form/data/content/AI/utility batch.
- Expand contracts only for semantics genuinely shared with web.
- Add package exports, manifest entries, tests, and Expo catalog coverage.

Local status: complete for the 57-item core-native batch.

### Phase 2: interaction foundation

- Choose or implement shared modal, gesture, state, keyboard, navigation, and platform-service adapters.
- Implement adapter-dependent components by dependency order, not registry order.

Local status: interaction infrastructure plus 109 control, form, overlay, navigation, content, AI, learning, and motion modules are implemented. Together with the pilot and core batch, the native manifest contains 171 modules; the remaining decision-gated set stays off the manifest.

### Phase 3: decision-gated renderers

- Resolve charts, maps, canvas, commerce, rich content, and domain-composite product decisions.
- Promote only approved components from “decision needed.”

### Phase 4: native stability

- Complete physical iOS/Android runs, VoiceOver/TalkBack, supported RN/Expo matrix, versioning/migration policy, and rollback documentation.
- Keep native off `latest` until this phase passes.

## Verification gates

1. `pnpm tokens:check`
2. `pnpm -F @vllnt/ui-native lint`
3. `pnpm -F @vllnt/ui-native typecheck`
4. `pnpm -F @vllnt/ui-native test:once`
5. `pnpm -F @vllnt/ui-native build`
6. Native boundaries and packed-package checks
7. Expo Doctor and Android/iOS Metro exports
8. Registry schema, generation, drift, integrity, i18n, and package tests
9. Platform E2E at desktop/mobile widths and both locales
10. Axe on homepage, catalog, web/native details, native hub, and docs
11. Existing web lint, typecheck, build, tests, and visual evidence
12. `git diff --check`

Real-device VoiceOver/TalkBack verification remains a release blocker for stable native support.

## Rollback

- A build-time native-catalog feature flag may hide website presentation without contracting machine metadata.
- Web `/r/*.json`, stable web exports, and web installation remain unchanged.
- A native package failure restores the previous synchronized canary tags; it never moves `latest`.
- Local implementation remains unpushed until explicit owner approval.
