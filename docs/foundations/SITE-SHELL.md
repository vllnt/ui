# Site shell: the oss.vllnt.com standard

| | |
|---|---|
| **Status** | Code standard in this PR; Penpot "Templates & Site Shells" pending (see the end) |
| **Reference** | oss.vllnt.com as it runs: `vllnt/vllnt` `main` @ `bdb5786` (the shell and font files read here have the same blobs as that commit) |
| **Live audit** | Orbit's six-site audit, 19 Nov 2026 (`/home/ops/goals/font-nav-audit.md` on the worker) |
| **Part of** | #555 |

The fonts and the bar differ across the vllnt sites. oss.vllnt.com has the setup Benoît picked as the standard. This page compares oss with `@vllnt/ui` before this PR, line by line, with the file each fact comes from. It ends with the font decision.

Paths starting `apps/` or `packages/fonts` / `packages/ui/src/shell` / `packages/ui/src/network` are in `vllnt/vllnt` (read only). Paths starting `packages/design`, `packages/ui/styles.css` or `packages/ui/src/components` are in this repo.

## 1. Fonts

### What oss does that `@vllnt/ui` did not

| oss | Source |
|---|---|
| Loads Inter (variable, 100–900) and JetBrains Mono (variable, 100–800) as local woff2 latin subsets with `next/font/local`, `display: 'swap'`. No build fetches Google Fonts. | `packages/fonts/src/inter.ts`, `packages/fonts/src/fonts.ts` |
| Puts both face variables on `<html>`: `--font-inter` and `--font-jetbrains-mono` (`fontVariables`). | `apps/oss/app/layout.tsx` |
| Points the library tokens at them: `--font-sans: var(--font-inter), Inter, system-ui, …` and `--font-mono: var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, …`. | `apps/oss/app/globals.css` |
| Leaves `<body>` bare, so the library's `body { font-mono }` stands: the body, the bar and unstyled UI text are JetBrains Mono. | `apps/oss/app/layout.tsx`, `packages/ui/styles.css` (`@layer base`, `body`) |
| Reads the library type scale directly: `Heading` sizes 2–5, `Display`, `--font-size-h1` / `--font-size-h3` with their line heights. | `apps/oss/components/packages/package-head.tsx`, `package-body.tsx`, `apps/oss/components/home/package-card.tsx` |

### What `@vllnt/ui` did that oss works around

| `@vllnt/ui` before this PR | Source |
|---|---|
| `--font-sans` and `--font-mono` named the plain faces (`Inter`, `"JetBrains Mono"`) and shipped no files. With `next/font` the loaded face has a hashed name, so every app had to remap both tokens itself, and each did it differently (index like oss; www without the plain-name fallback; blueprint `--font-sans: var(--font-inter)` only; community a system stack). | `packages/design/tokens.json` `typography.fontFamily`; `apps/{index,www,blueprint,community}` globals |
| The generated comment said the defaults "reproduce the house style (sans, 600)", while the base layer sets `body` to `font-mono`. Apps read the comment and forced Inter on `body` (index, www, blueprint, community, maia), which is why the same bar renders in two faces. | `packages/ui/styles.css`; Orbit's audit, per-site tables |
| `tokens.json` roles: sans "Body + UI text", mono "Code + tabular". Both wrong for the rendered result. | `packages/design/tokens.json` |

### Font decision

| | Decision |
|---|---|
| **Families** | **JetBrains Mono** is the body face: body text, the site bar, navigation, buttons and unstyled UI text, plus code and tabular data. **Inter** is the face of `Text`, `Prose`, `Heading` and `Display` (through `--font-sans` and `--font-display`). That is oss as it renders. |
| **Weights** | Variable files, so any weight loads: Inter 100–900, JetBrains Mono 100–800. The system uses 400 (body), 500 (captions, the current link, group headings, badges), 600 (headings, display, labels, the wordmark). The tokens keep `heading` 600, `display` 600, `label` 600, `body` 400, `caption` 500. |
| **Type scale** | Unchanged `@vllnt/ui` scale, which oss reads as is: Display 60/1.05, H1 48/1.1, H2 36/1.2, H3 30/1.25, H4 24/1.3, H5 20/1.4, H6 18/1.5, Body large 18/1.7, Body 16/1.6, Body small 14/1.5, Caption 12/1.4, Label 12/1.4. The bar uses 14 px links, 12 px group headings and a 20 px wordmark. |
| **Fallbacks** | `--font-sans: var(--font-inter, Inter), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. `--font-mono: var(--font-jetbrains-mono, 'JetBrains Mono'), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`. An app that sets the two `next/font` variables gets the loaded faces with no remap; one that does not gets the plain names, then the system stacks, exactly as before. Penpot and native keep the plain names (`Inter`, `JetBrains Mono`). |
| **Faces** | Stay in `vllnt/vllnt` `packages/fonts` (Orbit). `@vllnt/ui` ships tokens only, no font files. |

Not adopted: oss's `PageHeroBand` sets Display at 36/60 px with a 1.2 line height (`packages/ui/src/blocks/page-hero-band.tsx`), but oss's `SectionHeader size="hero"` uses the token's 1.05. oss is not consistent, so the token stays; the hero line height is an open question for the Penpot review.

## 2. The bar and the network switcher

The bar on oss, index, www and blueprint is one component: `SiteHeader` with `NetworkSwitcher` ("vllnt network"), from `@repo/ui/shell`. `@vllnt/ui` had none (`NavbarSaas` is an app bar tied to `SidebarProvider` with a built-in English `ThemeToggle`; `TopBar`, `FloatingNavbar` and `WorkspaceSwitcher` are other patterns).

### What oss does that `@vllnt/ui` did not

| oss | Source |
|---|---|
| 52 px bar, full-width hairline, page column (1440 px max, 20 / 48 / 96 px gutters at 0 / 768 / 1200 px). | `packages/ui/src/shell/site-header.tsx` (`Bar`), `packages/ui/src/tailwind.ts` (`page-column`) |
| Text wordmark home link (`vllnt`, 20 px, 600) named by `labels.home`. | `site-header.tsx` (`Brand`), `apps/oss/lib/nav.ts` (`HEADER_LABELS`) |
| Links join the bar at 768 px (`bar: 'tablet'`) or 1200 px (`bar: 'desktop'`); the menu lists the rest. External links open a new tab with ↗ and an sr-only "(opens in a new tab)". | `site-header.tsx` (`BarLinks`, `NavLink`), `apps/oss/lib/nav.ts` (`NAV_ITEMS`) |
| Current link by path prefix, or by `currentHref` when the app rewrites URLs (oss adds `?category=`). | `site-header.tsx` (`isCurrent`), `apps/oss/components/site/oss-header.tsx` |
| Network switcher: one ghost button "vllnt network" from 768 px, opening a 288 px panel of grouped sites; the current site is text with `aria-current`. On a phone the same groups sit in the menu, titled. | `packages/ui/src/shell/network-switcher.tsx` |
| The site list is data: `NETWORK_SITES` + `SITE_FAMILIES` → `networkSwitcherGroups({ currentSite })`: vllnt first (no heading), then Platforms, Learn and build, Directory; sites with `live: false` dropped. | `packages/ui/src/network/sites.ts`, `switcher.ts`, `apps/oss/lib/nav.ts` (`HEADER_NETWORK`) |
| Keyboard and focus: while the menu or panel is open, focus is contained, Esc and an outside press close, focus returns to the opener; the switcher also closes when focus leaves it; a route change or a width with no menu closes the menu. | `site-header.tsx`, `network-switcher.tsx`, `packages/ui/src/shell/menu-hooks.ts` |
| SSR: the first render assumes a phone, so the network links are in the menu markup for crawlers; the panel takes them after the width is measured. | `network-switcher.tsx` |
| Touch targets: 44 px below 1200 px, 32 px from 1200 px. | `packages/ui/src/links/touch-target.ts` |
| Phone menu: a panel under the bar, over the page (nothing moves), with links, the titled network list, the locale link and a full-width CTA. | `site-header.tsx` (`Menu`) |

### What `@vllnt/ui` does that oss did not

| `@vllnt/ui` | Source |
|---|---|
| The affordance contract: hover and selected on the `--secondary` fill, a non-colour mark on selected, a pressed state, `focus-visible` rings, nothing hover-only. oss marks the current bar link by colour alone, uses `bg-muted` for the current switcher row (invisible on the pure-black dark palette, where muted is `#000`), and has no pressed state. | `docs/foundations/SPATIAL.md` §3.2 (PR #632), `packages/ui/src/components/atoms/button/button.tsx` |
| The input rule: 44 pt for touch at every width. oss shrinks to 32 px at 1200 px even for a touch pointer (a landscape tablet). | `SPATIAL.md` §3.3, decision D16 |
| Typed, documented, tested components in the public registry. | `packages/ui/src/components/` |

### The standard (this PR)

`SiteHeader`, `NetworkSwitcher` and `NetworkMenuList` are now in `@vllnt/ui`, with oss's markup, props and behaviour, plus the `@vllnt/ui` column above:

- **Same props as `@repo/ui/shell`.** `SiteHeaderProps`, `SiteNavItem`, `SiteLocaleLink`, `SiteNetwork`, `NetworkSwitcherGroup` and `NetworkSwitcherItem` keep their names and fields, so an app swaps the import. Additive only: `className` on each, `panelId` on `NetworkSwitcher`, `titled` on `NetworkMenuList`.
- **The site list is a prop.** Nothing is hardcoded. `SiteNetwork` and its groups and items accept an optional `version` and any unknown key, which pass through untouched, so a site config can feed it directly. (A `parseSiteConfig` was named as the contract; no such function exists on `vllnt/vllnt` `main` or in an open PR, so this follows the stated rule: version optional, unknown keys kept.)
- **States.** Current links get the weight as well as the colour; the current switcher row and hovered rows use `--secondary`; rows and buttons have a `scale(0.98)` pressed state under `motion-safe`.
- **Targets.** 44 px everywhere, shrinking to 32 px only for a fine pointer from 1200 px.
- **Breakpoints** are literal `min-[768px]:` / `min-[1200px]:` variants, so they work whatever screens an app's Tailwind config has (oss declares only `tablet` and `desktop`).
- **Levels.** `NetworkMenuList` is a molecule (Link atoms). `NetworkSwitcher` and `SiteHeader` are organisms: a future `MarketingShell` template must be able to compose them, and a template can't import a template (`pnpm check:atomic`).

Not moved: `SiteFooter`, `SiteFrame`, `SiteMain`, `ThemeBar`, `networkSwitcherGroups`, `NETWORK_SITES` (vllnt-specific data stays in the monorepo).

## 3. Penpot

"Templates & Site Shells" (components `SiteHeader`, `NetworkSwitcher`, then `SiteSwitcher`, `SiteFooter`, `MarketingShell`) does not exist yet in the canonical project `503b8235-…`, and the plugin can't create a file or link libraries. It waits on Mesh creating the empty file, linking Atoms, Molecules and Organisms, and opening it in tab@ui-brand.
