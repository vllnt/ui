# SEO and content plan: ui.vllnt.com

Status: draft for the brand check. The writer owns the plan and the copy. The manager owns the routes, technical SEO, the issue, the PR and CI.

Binding inputs: [`BRAND-RULES.md`](./BRAND-RULES.md) (verbatim brand rules), the search data in section 2, and the repository on `main` for every product fact.

## 1. What this plan decides

1. Five pillars and their clusters, tied to [`/docs/vision`](../../apps/registry/content/pages/docs/vision/en.mdx).
2. One owning page for each target query, so no two pages compete for the same term.
3. Thirteen new articles under `/articles/<slug>`, in three batches.
4. Title and meta rewrites for 21 existing pages. Each is marked **manager ships in PR A**.
5. Schema, internal links, rollout order and how the result is measured.

Rules that apply to every string in this plan and in the articles:

- Title: 50 to 60 characters, shaped `Primary keyword - context | vllnt UI`. Meta description: 150 to 160 characters. Counts are in parentheses after each string.
- No em dash, no emoji, sentence case, the `…` glyph for an ellipsis.
- A page says what ships and what is roadmap. "Ships" means it is on `main`.
- Third parties are named "AI SDK" (by Vercel) and "json-render" (vercel-labs). No partnership is implied.

## 2. What the data says

Source: Google Search Console, property `sc-domain:ui.vllnt.com`. 28 days is 2026-10-22 to 2026-11-18. 90 days is 2026-08-21 to 2026-11-18. Cloudflare Web Analytics covers about 3 days and is directional only.

| Measure | 28 days | 90 days |
|---|---|---|
| Clicks | 55 | 163 |
| Impressions | 2,625 | 6,281 |
| CTR | 2.10% | 2.60% |
| Average position | 25.47 | 21.49 |

Four findings drive the plan.

1. **Demand today is for single components, not for the vision.** The top pages by clicks in 90 days are `/components/timeline-scrubber` (28 clicks, 324 impressions, position 8.7), `/components/globe-3d` (13 / 236 / 20.4), `/components/liquid-glass` (13 / 266 / 10.5) and `/components/gantt-chart` (9 / 271 / 38.8). The revealed queries carry "shadcn" or "react" plus a component name.
2. **The vision terms have no measured demand yet.** Zero revealed queries in 90 days for "generative", "streaming", "design system", "shadcn registry", "ui kit", "vllnt" and "ui.vllnt". The generative, streamed and spatial pages are strategic. They are written to rank before the demand shows up, and this plan does not promise clicks from them.
3. **Several pages rank on page one and get no clicks.** `/design` has 143 impressions at position 7.0 and 0 clicks. `/components/scroll-area` has 81 at position 9.0 and 0 clicks. "timeline scrubber" has 36 impressions at position 8.4 and 0 clicks. The fix is the title and the meta, not a new page.
4. **The query list is incomplete.** Only 14 clicked query rows are revealed in 90 days, against 163 page clicks. Page-level numbers are the reliable ones. Query numbers show direction.

Two more facts shape the copy:

- Desktop is 152 of 163 clicks in 90 days. Readers are at a keyboard, so the articles lead with code they can copy.
- The United States has 2,345 impressions at 0.77% CTR in 90 days. Japan has 54 at 12.96%, Spain 97 at 7.22%, the United Kingdom 181 at 7.18%. The largest market has the weakest snippet performance, which again points at titles and metas.

One noise source to ignore: the query `"clock3" "lucide-react"` (50 impressions, position 8.8, 0 clicks) matches component source code. `AIToolCallDisplay` imports `Clock3` from `lucide-react`, so part of the 142 impressions on `/components/ai-tool-call-display` is this noise. It is not a topic.

## 3. Pillars and clusters

Each pillar has one hub page. Cluster pages link up to the hub, and the hub links down to each of them.

| Pillar | Hub | Cluster pages | Demand today |
|---|---|---|---|
| P1. Generative UI | `/articles/generative-ui-components-react` | `/articles/ai-sdk-generative-ui-react`, `/articles/json-render-component-catalog`, `/families/ai`, `/build/ai-chat-ui`, `/build/tool-calls-agent-steps`, `/build/ai-artifacts`, `/vs/vercel-ai-sdk` | Low. `/families/ai` 2 clicks / 189 impressions; `/build/ai-chat-ui` 1 / 91 |
| P2. Streamed and per-user dynamic UI | `/articles/streaming-ui-react` | `/articles/per-user-dynamic-ui`, `/components/ai-streaming-text`, `/components/skeleton`, `/docs/theming`, `/themes` | Low for the pillar terms. `/components/ai-streaming-text` 6 / 42 at 14.29% CTR |
| P3. Spatial UI and glass | `/docs/vision` | `/articles/spatial-ui-components-react`, `/articles/liquid-glass-react-shadcn`, `/components/liquid-glass`, `/components/glass-card` | Real for glass: "shadcn liquid glass" 3 / 98, "liquid glass shadcn" 2 / 51. None for spatial |
| P4. Components people already search for | `/components` | `/articles/react-gantt-chart`, `/articles/timeline-scrubber-react`, `/articles/shadcn-theme-generator`, `/articles/react-3d-globe`, `/articles/react-cookie-consent-banner` and their component pages | The highest on the site. See section 5 |
| P5. React Native | `/native` | `/articles/react-native-ui-kit`, `/p/native/components` | 81 revealed "react native" queries, 198 impressions, 1 click |

How the pillars follow from the vision:

- **P1** is the second half of the vision: an interface composed at runtime from known parts. The pillar explains what makes a part usable by a model, then shows the two open tools the vision names.
- **P2** covers the "stream-safe" and "per user" properties from the vision, with the components that ship for them.
- **P3** covers the first half of the vision. Spatial is a draft RFC ([#631](https://github.com/vllnt/ui/issues/631), [PR #632](https://github.com/vllnt/ui/pull/632)), so its article has status `roadmap`. Glass is covered only as a pattern built on the existing tokens. It is not a site theme, and the site chrome stays neutral.
- **P4** is where the clicks are. It pays for the strategic pillars by raising traffic now.
- **P5** is honest capture of an audience that already finds the site. `@vllnt/ui-native` is source preview and canary only.

## 4. Intent ownership

| Site | Owns | Does not target | Links |
|---|---|---|---|
| ui.vllnt.com | Technical, build-it intent: how to build a UI with components, copyable examples, comparisons of patterns | Company story, product pricing, opinion | Out to Maia docs for the presentation runtime; out to third-party docs for their APIs |
| vllnt.com | Company and product intent: why it matters, Maia, PaaS | Component how-to keywords | Links to ui.vllnt.com for every how-to |
| bntvllnt.com | Personal essays, build in public, first person, French | Any head term owned by a ui.vllnt.com page below | Links to the matching docs page instead |
| maia.vllnt.com docs | The json-render presentation runtime of Maia | Generic "how to write a catalog" how-tos | ui.vllnt.com links to it and does not restate it |

Checks done: bntvllnt.com has zero query or page hits in 28 and 90 days for every head term in section 5 (generative, spatial, json-render, glassmorphism, liquid glass, streaming UI, AI SDK, shadcn, gantt, timeline scrubber, theme generator). No cannibalisation today.

Rule for later: before a new page is added on any of the four sites, check its head term against the table in section 5. If the term has an owner there, the new page links to the owner and picks another term.

The Maia link used by the articles is `https://maia.vllnt.com/en/docs/clients/presentation-runtime` (French: `/fr/docs/clients/presentation-runtime`). The route was read from the Maia docs source, where the document is marked public. It was not fetched while writing. The manager confirms it resolves before merge.

## 5. Target queries and their owning page

Numbers are 90 days: clicks / impressions / CTR / average position. "Strategic" means no revealed demand in Search Console.

| Query | Numbers | Owning page | Kind |
|---|---|---|---|
| generative UI components | Strategic | `/articles/generative-ui-components-react` | New, batch 1 |
| ai components | 0 / 11 / 0% / 20.0 | `/families/ai` | Rewrite |
| ai chat components | 1 / 6 / 16.67% / 46.2 | `/build/ai-chat-ui` | Rewrite |
| prebuilt chat ui components | 0 / 10 / 0% / 3.2 | `/build/ai-chat-ui` | Rewrite |
| ai chat composer | 1 / 3 / 33.33% / 26.7 | `/components/ai-chat-input` | Keep as is |
| shadcn prompt input | 1 / 1 / 100% / 66.0 | `/components/prompt-input` | Keep as is |
| agent UI components | Strategic | `/build/tool-calls-agent-steps` | Rewrite |
| AI SDK generative UI react | Strategic | `/articles/ai-sdk-generative-ui-react` | New, batch 1 |
| vllnt ui vs ai sdk (comparison intent) | Page: 0 / 21 / 0% / 20.0 | `/vs/vercel-ai-sdk` | Rewrite |
| json-render component catalog | Strategic | `/articles/json-render-component-catalog` | New, batch 1 |
| streaming UI react | Strategic | `/articles/streaming-ui-react` | New, batch 1 |
| per-user dynamic UI | Strategic | `/articles/per-user-dynamic-ui` | New, batch 3 |
| spatial UI components, canvas UI components | Strategic | `/articles/spatial-ui-components-react` | New, batch 2 |
| shadcn liquid glass | 3 / 98 / 3.06% / 10.1 | `/articles/liquid-glass-react-shadcn` | New, batch 1 |
| liquid glass shadcn | 2 / 51 / 3.92% / 8.2 | `/articles/liquid-glass-react-shadcn` | New, batch 1 |
| liquid glass (component intent: props, install) | Page: 13 / 266 / 4.89% / 10.5 | `/components/liquid-glass` | Rewrite |
| shadcn glass ui | 1 / 1 / 100% / 21.0 | `/articles/liquid-glass-react-shadcn` | New, batch 1 |
| glassmorphism react component | Strategic | `/components/glass-card` | Rewrite |
| timeline scrubber | 0 / 36 / 0% / 8.4 | `/components/timeline-scrubber` | Rewrite |
| timeline scrubber ui | 0 / 17 / 0% / 5.1 | `/components/timeline-scrubber` | Rewrite |
| native scrub control | 0 / 20 / 0% / 48.7 | `/articles/timeline-scrubber-react` | New, batch 2 |
| react gantt chart | 0 / 16 / 0% / 56.2 | `/articles/react-gantt-chart` | New, batch 2 |
| shadcn gantt | 1 / 5 / 20% / 17.4 | `/components/gantt-chart` | Rewrite |
| theme generator | 0 / 57 / 0% / 36.1 | `/themes` | Rewrite |
| theme creator | 0 / 24 / 0% / 63.4 | `/themes` | Rewrite |
| how to make a shadcn theme (how-to intent) | Strategic | `/articles/shadcn-theme-generator` | New, batch 2 |
| react theming css variables | Page: 0 / 42 / 0% / 57.1 | `/docs/theming` | Rewrite |
| shadcn globe | 1 / 28 / 3.57% / 8.1 | `/components/globe-3d` | Rewrite |
| react 3d globe | Page: 13 / 236 / 5.51% / 20.4 | `/articles/react-3d-globe` | New, batch 2 |
| floating navbar | 0 / 19 / 0% / 50.3 | `/components/floating-navbar` | Rewrite |
| react cookie consent | 0 / 16 / 0% / 17.9 | `/components/cookie-consent` | Rewrite |
| react cookie consent banner (how-to intent) | Strategic | `/articles/react-cookie-consent-banner` | New, batch 3 |
| react native ui kit, react native components | 81 queries: 1 / 198 | `/articles/react-native-ui-kit` and `/p/native/components` | New, batch 3, and rewrite |
| sidebar react native | 1 / 1 / 100% / 2.0 | `/p/native/components/sidebar` | Keep as is |
| shadcn activity log | 1 / 5 / 20% / 9.4 | `/components/activity-log` | Keep as is |
| download react floating action button | 0 / 28 / 0% / 43.3 | `/components/floating-action-button` | Not targeted: "download" intent does not match a copy-the-source library |
| "clock3" "lucide-react" | 0 / 50 / 0% / 8.8 | None | Noise, see section 2 |

Where an article and a component page share a topic, they split by intent. The component page owns "the component" (props, install, preview). The article owns "how to build it" and the pattern around it. Each links to the other with that wording.

## 6. New pages

All articles live at `apps/registry/content/articles/<slug>/en.mdx` and `fr.mdx`. The title in the frontmatter is the full `<title>`, suffix included, so the route must not append the brand again.

Status values: `shipped` means everything the page teaches is on `main`. `roadmap` means the page describes planned work. `mixed` means both, with the roadmap part in a labelled section.

### Batch 1 (written in this branch)

**A1. `/articles/generative-ui-components-react`** (P1 hub, status `mixed`)

- Target: "generative UI components" (strategic), supports "ai components" 0 / 11.
- Title: `Generative UI components - React parts to stream | vllnt UI` (59)
- Meta: `Generative UI components for React: what lets a model pick, fill and stream a component, what VLLNT UI ships for it today, and what is still on the roadmap.` (156)
- Titre FR : `Composants d'UI générative - des briques React | vllnt UI` (57)
- Meta FR : `Composants d'UI générative pour React : ce qui permet à un modèle de choisir, remplir et diffuser un composant, ce que VLLNT UI fournit et ce qui reste à venir.` (160)
- H1: Generative UI components in React
- Reader can build: a chat screen that renders model text, reasoning, tool calls and sources with shipped components, and a checklist for making their own components model-ready.
- Internal links: `/families/ai`, `/build/ai-chat-ui`, `/components/ai-tool-call-display`, `/articles/ai-sdk-generative-ui-react`, `/articles/json-render-component-catalog`.
- Schema: `Article`, `BreadcrumbList`.

**A2. `/articles/ai-sdk-generative-ui-react`** (P1, status `mixed`)

- Target: "AI SDK generative UI react" (strategic). The comparison intent stays on `/vs/vercel-ai-sdk` (0 / 21, position 20).
- Title: `AI SDK generative UI in React - tool parts to UI | vllnt UI` (59)
- Meta: `Build AI SDK generative UI in React: map useChat tool parts and their states to VLLNT UI components by hand. No adapter ships yet; the code is on this page.` (156)
- Titre FR : `UI générative avec l'AI SDK - React, pas à pas | vllnt UI` (57)
- Meta FR : `Construire une UI générative avec l'AI SDK en React : relier à la main les parties d'outil de useChat aux composants VLLNT UI. Aucun adaptateur n'existe encore.` (160)
- H1: AI SDK generative UI in React with VLLNT UI components
- Reader can build: a `useChat` message renderer that maps `tool-${name}` parts and their four states to components, with a loading and an error view.
- Internal links: `/components/ai-tool-call-display`, `/components/ai-streaming-text`, `/build/tool-calls-agent-steps`, `/vs/vercel-ai-sdk`, `/articles/generative-ui-components-react`.
- Schema: `Article`, `BreadcrumbList`.

**A3. `/articles/json-render-component-catalog`** (P1, status `mixed`)

- Target: "json-render component catalog" (strategic).
- Title: `json-render component catalog - how to build one | vllnt UI` (59)
- Meta: `How to write a json-render component catalog for a React UI library: zod props, descriptions, a registry and a renderer. The VLLNT UI catalog is roadmap.` (153)
- Titre FR : `Catalogue de composants json-render - le guide | vllnt UI` (57)
- Meta FR : `Écrire un catalogue de composants json-render pour une bibliothèque React : props zod, descriptions, registre et rendu. Le catalogue VLLNT UI reste à venir.` (156)
- H1: How to build a json-render component catalog for a React UI library
- Reader can build: a three-component json-render catalog and registry that render VLLNT UI components from a JSON spec.
- Internal links: `/components/ai-source-citation`, `/docs/agents`, `/docs/vision`, `/articles/generative-ui-components-react`, `/articles/ai-sdk-generative-ui-react`. One external link to the Maia presentation runtime doc.
- API source: the json-render README, checked for versions 0.22 and 0.23. npm lists 0.23.2 on the day of writing. Recheck the code samples when json-render ships a new minor version.
- Schema: `Article`, `BreadcrumbList`.

**A4. `/articles/streaming-ui-react`** (P2 hub, status `shipped`)

- Target: "streaming UI react" (strategic). Supports `/components/ai-streaming-text` (6 / 42, 14.29% CTR, position 10.2).
- Title: `Streaming UI in React - layouts that hold still | vllnt UI` (58)
- Meta: `Streaming UI in React without layout shift: reserve space with Skeleton, stream text with a live region, and show tool calls as they run. Copyable code.` (152)
- Titre FR : `Streaming UI en React - une mise en page stable | vllnt UI` (58)
- Meta FR : `Une UI en streaming avec React, sans décalage de mise en page : réserver l'espace avec Skeleton, diffuser le texte, afficher les appels d'outil. Code à copier.` (159)
- H1: Streaming UI in React: keep the layout still while content arrives
- Reader can build: a streamed answer view with reserved space, a polite live region, a reasoning panel and a tool call card that updates in place.
- Internal links: `/components/ai-streaming-text`, `/components/skeleton`, `/components/agent-activity`, `/docs/vision`, `/articles/generative-ui-components-react`.
- Schema: `Article`, `BreadcrumbList`.

**A5. `/articles/liquid-glass-react-shadcn`** (P3, status `shipped`)

- Target: "shadcn liquid glass" 3 / 98 / position 10.1; "liquid glass shadcn" 2 / 51 / position 8.2; "shadcn glass ui" 1 / 1. Component page: 13 / 266 at position 10.5.
- Title: `shadcn liquid glass - token-based React surface | vllnt UI` (58)
- Meta: `Add a shadcn liquid glass surface to a React app with one CLI command. Built on theme tokens, reduced-motion safe, with contrast rules for text on glass.` (153)
- Titre FR : `Liquid glass pour shadcn - surface React à tokens | vllnt UI` (60)
- Meta FR : `Ajouter une surface liquid glass shadcn à une application React en une commande. Fondée sur les tokens du thème, fixe si l'utilisateur réduit les animations.` (157)
- H1: shadcn liquid glass: a token-based glass surface for React
- Reader can build: a glass panel over an image or gradient that follows the theme tokens, holds still for reduced motion and keeps text readable.
- Internal links: `/docs/installation`, `/docs/theming`, `/components/glass-card`, `/components/liquid-glass`, `/docs/vision`.
- Schema: `Article`, `BreadcrumbList`, `SoftwareSourceCode` for `liquid-glass`.

### Batch 2 (planned)

**B1. `/articles/spatial-ui-components-react`** (P3, status `roadmap`)

- Target: "spatial UI components", "canvas UI components" (strategic).
- Title: `Spatial UI components - what React needs for AR | vllnt UI` (58)
- Meta: `Spatial UI components for AR and visionOS need depth, gaze input and larger targets. What the VLLNT UI spatial RFC proposes, and what ships today: nothing yet.` (159)
- H1: Spatial UI components: what a React library needs for AR
- Internal links: `/docs/vision`, `/native`, `/components/canvas-shell`, `/articles/liquid-glass-react-shadcn`.
- Schema: `Article`, `BreadcrumbList`.
- Constraint: every spatial item is described as proposed in the RFC. No renderer, token or component is described as available.

**B2. `/articles/react-gantt-chart`** (P4, status `shipped`)

- Target: "react gantt chart" 0 / 16 / position 56.2. Component page: 9 / 271 at position 38.8.
- Title: `React Gantt chart - task bars, no chart library | vllnt UI` (58)
- Meta: `A React Gantt chart with task bars, progress, milestones and a today line, from day to quarter scales. No chart library to install. Copy it with the shadcn CLI.` (160)
- H1: React Gantt chart: plan a project with task bars and milestones
- Internal links: `/components/gantt-chart`, `/components/run-timeline`, `/components/timeline-scrubber`, `/families/data`.
- Schema: `Article`, `BreadcrumbList`, `SoftwareSourceCode` for `gantt-chart`.
- Constraint: say what is out of scope (drag to edit, dependency arrows, critical path), as the component page already does.

**B3. `/articles/timeline-scrubber-react`** (P4, status `shipped`)

- Target: "native scrub control" 0 / 20 / position 48.7, and the how-to side of "timeline scrubber ui" 0 / 17 / position 5.1.
- Title: `Timeline scrubber UI - built on a range input | vllnt UI` (56)
- Meta: `Build a timeline scrubber UI in React on a native range input: milestone ticks, tone variants and value labels, with keyboard and screen reader support.` (152)
- H1: Timeline scrubber UI in React, built on a native range input
- Internal links: `/components/timeline-scrubber`, `/components/run-timeline`, `/components/gantt-chart`.
- Schema: `Article`, `BreadcrumbList`, `SoftwareSourceCode` for `timeline-scrubber`.

**B4. `/articles/shadcn-theme-generator`** (P2 and P4, status `shipped`)

- Target: how-to intent behind "theme generator" 0 / 57 / position 36.1 and "theme creator" 0 / 24 / position 63.4. The tool itself stays the owner of both head terms.
- Title: `Theme generator for shadcn - OKLCH tokens to CSS | vllnt UI` (59)
- Meta: `Use the VLLNT UI theme generator to design a shadcn-compatible theme in OKLCH, preview it live, and export CSS variables, a CLI command or design tokens.` (153)
- H1: How to use a theme generator for shadcn: from OKLCH tokens to CSS
- Internal links: `/themes`, `/docs/theming`, `/design`, `/articles/per-user-dynamic-ui`.
- Schema: `Article`, `BreadcrumbList`.

**B5. `/articles/react-3d-globe`** (P4, status `shipped`)

- Target: "react 3d globe" (page 13 / 236 at position 20.4). "shadcn globe" 1 / 28 / position 8.1 stays on the component page.
- Title: `React 3D globe - SVG globe with markers and arcs | vllnt UI` (59)
- Meta: `Add a 3D globe to a React app with plain SVG: orthographic projection, auto-rotation, drag, markers and great-circle arcs. Install with the shadcn CLI.` (151)
- H1: React 3D globe in plain SVG, with markers and arcs
- Internal links: `/components/globe-3d`, `/families/data-display`, `/components/gantt-chart`.
- Schema: `Article`, `BreadcrumbList`, `SoftwareSourceCode` for `globe-3d`.

### Batch 3 (planned)

**C1. `/articles/react-native-ui-kit`** (P5, status `mixed`)

- Target: 81 revealed "react native" queries, 198 impressions, 1 click.
- Title: `React Native UI kit - canary, shared tokens | vllnt UI` (54)
- Meta: `A React Native UI kit that shares tokens and component contracts with the web library. Honest status: source preview and canary builds, no stable release yet.` (158)
- H1: React Native UI kit with the same tokens as the web library
- Internal links: `/native`, `/p/native/components`, `/docs/theming`, `/docs/vision`.
- Schema: `Article`, `BreadcrumbList`.
- Constraint: state in the first paragraph that `@vllnt/ui-native` is source preview and canary only, with no supported npm `latest`.

**C2. `/articles/react-cookie-consent-banner`** (P4, status `shipped`)

- Target: how-to side of "react cookie consent" 0 / 16 / position 17.9.
- Title: `React cookie consent - an accessible banner | vllnt UI` (54)
- Meta: `Add a React cookie consent banner with accept and decline actions, a card or bar layout, and equal-weight buttons when the rules where you operate require it.` (158)
- H1: React cookie consent banner with accept and decline
- Internal links: `/components/cookie-consent`, `/components/dialog`, `/families/core`.
- Schema: `Article`, `BreadcrumbList`, `SoftwareSourceCode` for `cookie-consent`.
- Constraint: no legal advice. The page describes the component, not what any law requires.

**C3. `/articles/per-user-dynamic-ui`** (P2, status `mixed`)

- Target: "per-user dynamic UI" (strategic).
- Title: `Per-user dynamic UI - themes and layouts as data | vllnt UI` (59)
- Meta: `Per-user dynamic UI means themes and layouts sent as data and resolved at runtime. What VLLNT UI ships for it today (data-theme, tokens) and what is roadmap.` (157)
- H1: Per-user dynamic UI: send themes and layouts as data
- Internal links: `/docs/theming`, `/themes`, `/docs/vision`, `/articles/streaming-ui-react`.
- Schema: `Article`, `BreadcrumbList`.
- Constraint: runtime theme switching with `data-theme` ships. Per-user themes resolved at runtime are roadmap.

French titles and metas for batches 2 and 3 are written with each article.

## 7. Rewrites for existing pages (manager ships in PR A)

Every row below is **manager ships in PR A**. The strings are English. They replace the current title and meta for the default locale.

| Page | 90-day numbers | Current title | New title | New meta |
|---|---|---|---|---|
| `/` | 4 / 69 / 5.8% / 6.4 | VLLNT UI (em dash) UI components & design system for AI agents | `Design system for AI agents - React and native | vllnt UI` (57) | `VLLNT UI is an accessible React design system built for AI agents: over 300 components, a shadcn-compatible registry, llms.txt and MCP. Native is in preview.` (157) |
| `/design` | 0 / 143 / 0% / 7.0 | Design Guide | `DESIGN.md for AI agents - tokens and UI rules | vllnt UI` (56) | `The VLLNT UI DESIGN.md: brand voice, color and type tokens, spacing, component patterns and accessibility rules, in one file that people and AI agents can read.` (160) |
| `/docs/vision` | New in PR #673 | Vision | `Generative and spatial UI - the VLLNT UI vision | vllnt UI` (58) | `Where VLLNT UI is going: one UI layer for spatial interfaces and for streamed, per-user, AI-composed UI. What ships today, and what is still on the roadmap.` (156) |
| `/docs/theming` | 0 / 42 / 0% / 57.1 | Theming | `React theming with CSS variables - OKLCH tokens | vllnt UI` (58) | `Theme a React app with CSS variables: OKLCH design tokens, dark mode, product themes switched at runtime with data-theme, and local overrides in VLLNT UI.` (154) |
| `/docs/agents` | 0 / 47 / 0% / 22.0 | Agents | `UI library for AI coding agents - llms.txt, MCP | vllnt UI` (58) | `Use VLLNT UI from an AI coding agent: llms.txt, llms-full.txt, an MCP server with component search, and one JSON descriptor per component in the registry.` (154) |
| `/themes` | 1 / 286 / 0.35% / 36.6 | Theme Generator | `shadcn theme generator - OKLCH, live preview | vllnt UI` (55) | `A shadcn theme generator: tune OKLCH colors and radius, preview components live, then export the theme as CSS variables, a shadcn CLI command or design tokens.` (159) |
| `/families/ai` | 2 / 189 / 1.06% / 20.8 | AI Components (em dash) VLLNT UI | `AI components for React - chat, agent, streaming | vllnt UI` (59) | `AI components for React: chat input, message bubbles, streaming text, tool calls, reasoning, citations and approvals. Accessible. Install with the shadcn CLI.` (158) |
| `/build/ai-chat-ui` | 1 / 91 / 1.1% / 21.2 | Build an AI chat UI in React | `AI chat UI components - prebuilt React chat kit | vllnt UI` (58) | `Prebuilt AI chat UI components for React: a prompt composer, message bubbles, streaming text and a sidebar. Wire them to any model. Install with the shadcn CLI.` (160) |
| `/build/tool-calls-agent-steps` | Not in the brief | Render tool calls & agent steps in React | `Agent UI components - tool calls and steps | vllnt UI` (53) | `Agent UI components for React: show each tool call with its input, status and output, the agent's reasoning, and the whole run as a live activity timeline.` (155) |
| `/vs/vercel-ai-sdk` | 0 / 21 / 0% / 20.0 | VLLNT UI vs Vercel AI SDK | `VLLNT UI and the AI SDK - components and runtime | vllnt UI` (59) | `The AI SDK (by Vercel) streams model output and tool calls. VLLNT UI renders them. What each one does, where they meet, and how to use both in one React app.` (157) |
| `/p/native/components` (replaces `/components?platform=native`) | 0 / 133 / 0% / 24.9 | React Native components for iOS and Android | `React Native components - iOS, Android, canary | vllnt UI` (57) | `React Native components for iOS and Android that share tokens and contracts with the web library. Source preview and canary builds only; no stable release yet.` (159) |
| `/components/ai-tool-call-display` | 3 / 142 / 2.11% / 9.2 | AI Tool Call Display (em dash) render agent tool calls in React, VLLNT UI | `Tool call UI for React - show AI agent tool calls | vllnt UI` (60) | `Show AI agent tool calls in React: tool name, input, status (queued, running, complete, error), duration and output in one card. Install with the shadcn CLI.` (157) |
| `/components/timeline-scrubber` | 28 / 324 / 8.64% / 8.7 | Timeline Scrubber (em dash) range slider for playback in React, VLLNT UI | `Timeline scrubber UI for React - playback slider | vllnt UI` (59) | `A timeline scrubber UI for React: a playback slider on a native range input with milestone ticks, tone variants and value labels. Install with the shadcn CLI.` (158) |
| `/components/gantt-chart` | 9 / 271 / 3.32% / 38.8 | Gantt Chart (em dash) project timeline with task bars in React, VLLNT UI | `React Gantt chart component - shadcn compatible | vllnt UI` (58) | `A React Gantt chart component with task bars, progress, milestones and a today line, from day to quarter scales. No chart library. Install with the shadcn CLI.` (159) |
| `/components/liquid-glass` | 13 / 266 / 4.89% / 10.5 | Liquid Glass - VLLNT UI | `Liquid glass for shadcn and React - glass surface | vllnt UI` (60) | `A liquid glass surface for shadcn and React: backdrop blur with a slow sheen built on your theme tokens. Stops for reduced motion. Install with the shadcn CLI.` (159) |
| `/components/glass-card` | RUM visits only | Glass Card - VLLNT UI | `Glassmorphism React component - frosted card | vllnt UI` (55) | `A glassmorphism React component: a frosted card with backdrop blur and a translucent background, built on your theme tokens. Install it with the shadcn CLI.` (156) |
| `/components/globe-3d` | 13 / 236 / 5.51% / 20.4 | Globe 3D - VLLNT UI | `shadcn globe - 3D SVG globe component for React | vllnt UI` (58) | `A shadcn-compatible 3D globe for React, drawn in SVG: auto-rotation, drag, lat/lng markers and great-circle arcs. Install it with one shadcn CLI command.` (153) |
| `/components/floating-navbar` | 5 / 67 / 7.46% / 27.0 | Floating Navbar - VLLNT UI | `Floating navbar in React - hides on scroll down | vllnt UI` (58) | `A floating navbar for React that hides on scroll down and returns on scroll up. Stays visible for reduced motion. Install it with one shadcn CLI command.` (153) |
| `/components/sidebar` | 1 / 123 / 0.81% / 28.7 | Sidebar - VLLNT UI | `React sidebar component - collapsible navigation | vllnt UI` (59) | `A collapsible React sidebar for app navigation in Next.js: titled sections, collapsible groups and current-page matching. Install it with the shadcn CLI.` (153) |
| `/components/scroll-area` | 0 / 81 / 0% / 9.0 | Scroll Area - VLLNT UI | `React scroll area - custom scrollbars on Radix | vllnt UI` (57) | `A React scroll area with custom scrollbars, built on Radix. The viewport takes keyboard focus when its content overflows. Install it with the shadcn CLI.` (153) |
| `/components/cookie-consent` | Query: 0 / 16 / 0% / 17.9 | Cookie Consent - VLLNT UI | `React cookie consent banner - accept or decline | vllnt UI` (58) | `A React cookie consent banner with accept and decline actions, card or bar layouts and an equal-weight button option. Accessible. Install with the shadcn CLI.` (158) |

Why each rewrite, in one line:

- `/`: the current title has an em dash and no query term a searcher types. The new one leads with "design system for AI agents".
- `/design`: position 7.0 with 0 clicks means the snippet does not say what the page is. It is the DESIGN.md file, so the title says so.
- `/docs/vision`, `/docs/theming`, `/docs/agents`: one-word titles ("Vision", "Theming", "Agents") carry no query term.
- `/themes`: "Theme Generator" alone competes with every theme tool. "shadcn" and "OKLCH" say which one this is.
- `/families/ai`, `/build/ai-chat-ui`: they take "ai components", "ai chat components" and "prebuilt chat ui components".
- `/build/tool-calls-agent-steps`: takes "agent UI components" so no new article is needed for it.
- `/vs/vercel-ai-sdk`: uses the name "AI SDK" and states that the two work together, which is what the page says.
- `/p/native/components`: a clean URL replaces the query-string URL, and the title states the canary status.
- `/components/ai-tool-call-display`: leads with "tool call UI", the term a searcher uses, not the component name.
- `/components/timeline-scrubber`: "timeline scrubber ui" ranks 5.1 with 0 clicks. The new title starts with that exact phrase.
- `/components/gantt-chart`: adds "React" first and "shadcn" for "shadcn gantt" (position 17.4).
- `/components/liquid-glass`, `/components/glass-card`, `/components/globe-3d`, `/components/floating-navbar`, `/components/sidebar`, `/components/scroll-area`, `/components/cookie-consent`: each falls back to "Name - VLLNT UI" today. Each new title starts with the query.

Notes for the manager:

1. **Counts in copy.** No rewrite carries a component count except the home meta ("over 300"). A hard number such as 321 goes stale on the next merge. If a number is wanted, read it from the registry at build time.
2. **Em dashes in existing copy.** Every title in `apps/registry/lib/ai-seo.ts` and `apps/registry/lib/component-seo.ts`, the default title in `app/[locale]/layout.tsx`, and the family titles use an em dash. The brand rules ban it in titles and metas. This plan rewrites the 21 pages above. The remaining entries need a sweep, which is a manager decision for PR A or a follow-up.
3. **French.** Hand-written component copy is English and applies to the default locale only (`components/[slug]/page.tsx`). French pages fall back to the localized MDX frontmatter. French rewrites for these 21 pages need that data shape to carry a second locale first. The writer supplies the French strings once the manager confirms where they go.
4. **Facts checked in source for these strings.** `ScrollArea` wraps `@radix-ui/react-scroll-area` and makes the viewport a tab stop on overflow. `Sidebar` imports `next/link` and `next/navigation`, so its meta says Next.js. `CookieConsent` has `card` and `bar` layouts and an `equal` button treatment. `AIToolCallDisplay` has the four statuses listed. `FloatingNavbar` and `LiquidGlass` hold still under `prefers-reduced-motion`.
5. **`/components/sidebar` and `/components/scroll-area`.** Their revealed queries are hidden, so these two rewrites are a best estimate from the page topic. Check their CTR after 28 days and adjust.

## 8. Schema per page

| Page type | Schema | Notes |
|---|---|---|
| Every article | `Article` | `headline` (the H1, not the title), `description`, `datePublished` from `date`, `dateModified` from `updated`, `inLanguage`, `author` and `publisher` as the `Organization` VLLNT, `mainEntityOfPage`, `image` (the generated OG image unless `image.src` is set) |
| Every article | `BreadcrumbList` | Home, Articles, the article H1. Every item has a `name`. This also closes the "Unnamed item" warning seen on `/components/liquid-glass` |
| Article about one component (A5, B2, B3, B5, C2) | `SoftwareSourceCode` | From the `components` frontmatter: `name`, `description`, `codeRepository` (`https://github.com/vllnt/ui`), `programmingLanguage` TypeScript, `runtimePlatform` React, `license` MIT, `url` of the component page. Emit it only when `components` has exactly one entry, so the hub articles that list several components do not get it |
| Articles index `/articles` | `CollectionPage` with an `ItemList` | One entry per article, in date order |
| Component pages | Unchanged | They already emit their own schema, with `FAQPage` where FAQ copy exists |

Not used: `HowTo` (Google no longer shows it) and `FAQPage` on articles (no article in batch 1 has a visible FAQ, and the schema must match visible content).

The frontmatter `status` field is not schema. It should render as a visible label near the H1 ("Shipped", "Roadmap", "Shipped and roadmap"), so the reader sees it before the first paragraph.

## 9. Internal links

The rule: each article links to 2 to 5 pages with anchor text that names the destination. Each article gets at least 2 links from pages that already have impressions.

Links into the new articles, **manager ships in PR A or with the article routes**:

| From (90-day impressions) | To | Anchor text |
|---|---|---|
| `/families/ai` (189) | `/articles/generative-ui-components-react` | Generative UI components in React |
| `/build/ai-chat-ui` (91) | `/articles/generative-ui-components-react` | What makes a component usable by a model |
| `/components/ai-tool-call-display` (142) | `/articles/ai-sdk-generative-ui-react` | Render AI SDK tool parts with this component |
| `/vs/vercel-ai-sdk` (21) | `/articles/ai-sdk-generative-ui-react` | AI SDK generative UI in React, step by step |
| `/docs/agents` (47) | `/articles/json-render-component-catalog` | Build a json-render component catalog |
| `/docs/vision` | A1, A3, A4 and B1 | The article titles |
| `/components/ai-streaming-text` (42) | `/articles/streaming-ui-react` | Streaming UI in React without layout shift |
| `/components/liquid-glass` (266) | `/articles/liquid-glass-react-shadcn` | How to use liquid glass with shadcn and theme tokens |
| `/components/glass-card` | `/articles/liquid-glass-react-shadcn` | Glass surfaces built on tokens |
| `/components/gantt-chart` (271) | `/articles/react-gantt-chart` | Plan a project with the React Gantt chart |
| `/components/timeline-scrubber` (324) | `/articles/timeline-scrubber-react` | Build a timeline scrubber UI |
| `/themes` (286) and `/docs/theming` (42) | `/articles/shadcn-theme-generator` | How to use the theme generator |
| `/components/globe-3d` (236) | `/articles/react-3d-globe` | Build a React 3D globe in SVG |
| `/native` and `/p/native/components` (133) | `/articles/react-native-ui-kit` | Status of the React Native UI kit |
| `/components/cookie-consent` | `/articles/react-cookie-consent-banner` | Add a cookie consent banner in React |

Links between articles:

- A1 links to A2 and A3. A2 links back to A1. A3 links back to A1 and to A2.
- A4 links to A1, and to C3 when C3 ships.
- A5 links to B1 when B1 ships (glass and depth). B1 links to A5 and `/docs/vision`.
- B2 and B3 link to each other (both are time-based views).
- B4 links to C3 (themes as data).

An article never links to a page that is not live. Forward links are added when the target ships.

## 10. Rollout order

| Step | What | Who | Gate |
|---|---|---|---|
| 1 | PR A: `/articles` routes, typed frontmatter, sitemap, feeds, llms files, schema, and the 21 rewrites in section 7 | Manager | CI. No copy hold: the rewrites are short and factual, but the manager may ask for the brand check on them too |
| 2 | Batch 1 articles A5, A1, A2, A3, A4 (this branch) | Writer, then manager | Brand check, then CI |
| 3 | Inbound links from section 9 for batch 1 | Manager | With step 2 |
| 4 | Request indexing for the batch 1 URLs and the rewritten pages with the most impressions (`/design`, `/themes`, `/components/timeline-scrubber`, `/components/liquid-glass`) | Manager | After deploy. No mass submission |
| 5 | Batch 2: B2, B3, B4, B5, then B1 | Writer | Starts when step 2 merges |
| 6 | Batch 3: C1, C2, C3 | Writer | C1 waits for a native canary the manager is willing to cite |
| 7 | Review at 28 days after step 4 | Writer and manager | Section 11 |

Why this order:

- **PR A first** because its rewrites touch pages that already rank. `/design` at position 7.0 and "timeline scrubber ui" at position 5.1 can gain clicks without any new content.
- **A5 first in batch 1** because it is the only batch 1 article with measured demand (149 impressions on the two main queries, page at position 10.5).
- **A1, A2, A3, A4 next** because they are the pillars the vision names. They have no measured demand, so they ship early to start ranking.
- **B1 last in batch 2** because spatial is a draft RFC. The article is short and may change when the RFC moves.
- **C1 late** because the native status may change, and the copy must match it on the day it ships.

## 11. How the result is measured

Read at 28 days after indexing, from Search Console, same property, page dimension.

| Goal | Baseline (90 days) | Target at 28 days |
|---|---|---|
| CTR on `/design` | 0% at position 7.0 | Above 2% |
| CTR on `/themes` | 0.35% at position 36.6 | Above 1%, position under 30 |
| Clicks on "timeline scrubber" and "timeline scrubber ui" | 0 of 53 impressions | At least 2 |
| Position of `/components/gantt-chart` | 38.8 | Under 30 |
| CTR on `/components/liquid-glass` plus A5 | 4.89% at position 10.5 | Above 6% combined, no drop in component page clicks |
| Impressions on A1 to A4 | 0 (new) | Any impressions on the target terms. No click target |
| Site CTR | 2.60% | Above 3% |

These are targets set by the writer, not forecasts from a model. If A5 takes clicks from `/components/liquid-glass` with no combined gain, the article title moves to the how-to phrasing and the component page keeps the head term.

## 12. Open questions

For the brand check:

1. **Brand casing in titles.** The brand rules give the suffix `| vllnt UI`. `DESIGN.md` says the name is always "VLLNT UI", and every existing title uses `| VLLNT UI`. This plan uses `| vllnt UI` in titles, as the rules state, and "VLLNT UI" in body copy, as `DESIGN.md` states. Which one is final for titles?
2. **French search terms.** The French articles keep "streaming", "liquid glass", "tokens" and "props" in English, because that is what French developers type. Body copy uses "flux continu" beside "streaming". Is that acceptable?
3. **"over 300 components"** in the home meta: acceptable as a number, or should it be dropped?

For the manager:

1. Confirm the Maia docs URL in section 4 resolves.
2. Confirm the frontmatter title is used verbatim as `<title>`, with no second brand suffix.
3. Decide whether the em dash sweep of `ai-seo.ts` and `component-seo.ts` goes in PR A.
4. Say where French metadata for existing pages should live, so the French rewrites can be written.
5. `date` and `updated` in the batch 1 files are the day they were written. Set them to the merge day if that is the rule.
