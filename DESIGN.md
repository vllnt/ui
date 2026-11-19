# DESIGN.md

> Single source of truth for VLLNT UI's brand and design conventions.
> Humans read this file. Agents read it too — every UI suggestion must follow it.

This is the **canonical** brand & design guideline for the library. Read it on
the web at three public surfaces, all generated from this one file:

- [`/DESIGN.md`](https://ui.vllnt.com/DESIGN.md) — this file as raw markdown (canonical for agents).
- [`/design`](https://ui.vllnt.com/design) — human-browsable rendering with a contents nav.
- [`/r/design.json`](https://ui.vllnt.com/r/design.json) — machine-readable token set.

The full token set lives in `packages/design/tokens.json` and is documented in
`packages/design/README.md`.

---

## 1. Brand

| Attribute | Value |
|-----------|-------|
| Name | **VLLNT UI** (always two words, both capitalised) |
| Voice | Direct. No marketing fluff. Short sentences. |
| Mission | Agent-first React components — copy-paste, you own them. |
| Tone | Confident, technical, honest about tradeoffs. |

**Voice rules**
- Sentence case for headings, button labels, tooltips. Title Case only for proper nouns.
- Avoid superlatives ("the best", "blazingly fast"). State facts.
- Avoid em-dash chains. One per sentence max.
- Use `…` (ellipsis glyph), not `...`.
- No emoji in shipped UI. Lucide icons handle anything visual.

**Banned phrases**
- "Click here"
- "Submit" as a button label (use the verb of the action)
- "Loading…" without a context noun ("Loading components…")
- "Sign up to learn more"

---

## 2. Logo

`VLLNT UI` set in the system font stack at the brand weight. There is no
standalone wordmark file; the type itself is the mark.

**Clear space** — at minimum, height of the cap-height of the logotype.
**Min size** — 14px equivalent. Below that, omit "UI" and show only "VLLNT".
**Misuse** — never stretch, recolor, italicise, or add a tagline beneath.

---

## 3. Color

Tokens live as CSS variables in `packages/ui/themes/default.css`. Components
**always** consume tokens — never raw hex. The token set is versioned with the
library.

Machine clients use `packages/design/tokens.json`. The JSON schema is
documented in `packages/design/tokens.schema.json` and groups tokens by color,
typography, spacing, radius, size, opacity, elevation, motion, and iconography.

### Semantic tokens (consumer-facing)

Values are OKLCH channels; the sRGB hex is what renders on an sRGB display.

| Token | Role | Light | Dark |
|-------|------|-------|------|
| `--background` | Page surface | `1 0 0` (#ffffff) | `0 0 0` (#000000) |
| `--foreground` | Primary text | `0.1445 0 0` (#0a0a0a) | `0.9848 0 0` (#fafafa) |
| `--card` | Raised, contained surface | `1 0 0` (#ffffff) | `0 0 0` (#000000) |
| `--popover` | Overlay surface: menus, popovers, dialogs | `1 0 0` (#ffffff) | `0 0 0` (#000000) |
| `--muted` | Sunken bands and quiet fills | `0.9703 0 0` (#f5f5f5) | `0 0 0` (#000000) |
| `--secondary` | Hover, selected, active and data-state fills; control tracks | `0.9703 0 0` (#f5f5f5) | `0.2686 0 0` (#262626) |
| `--accent` | Fills that pair with `--accent-foreground` (menu items, ghost buttons); a brand color in presets | `0.9703 0 0` (#f5f5f5) | `0.2686 0 0` (#262626) |
| `--muted-foreground` | Secondary text | `0.525 0 0` (#6a6a6a) | `0.7153 0 0` (#a3a3a3) |
| `--destructive` | Danger fill **and** danger text | `0.55 0.2078 25.326` (#cf1f29) | `0.7 0.18 25.721` (#fa6961) |
| `--destructive-foreground` | Text on a destructive fill | `0.9848 0 0` (#fafafa) | `0.2044 0 0` (#171717) |
| `--success` | Success fill **and** success text | `0.5 0.11 155` (#1e7546) | `0.78 0.16 155` (#4ed589) |
| `--warning` | Caution fill **and** caution text | `0.5 0.085 70` (#825a27) | `0.82 0.15 85` (#f0bb3b) |
| `--info` | Informational fill **and** text | `0.5 0.15 255` (#1762b6) | `0.74 0.12 245` (#65b2f1) |
| `--success-foreground` / `--warning-foreground` / `--info-foreground` | Text on that fill (same pairing as destructive) | `0.9848 0 0` (#fafafa) | `0.2044 0 0` (#171717) |
| `--diff-added` / `--diff-removed` | Added / removed line surfaces; `--foreground` is the text on them | `0.94 0.04 150` (#d9f3dd) / `0.94 0.03 25` (#ffe4e1) | `0.26 0.05 150` (#102b17) / `0.26 0.055 25` (#3b1816) |
| `--border` | Decorative hairline (cards, separators, tables) | `0.9219 0 0` (#e5e5e5) | `0.2686 0 0` (#262626) |
| `--input` | Form-control boundary | `0.6167 0 0` (#858585) | `0.5208 0 0` (#696969) |
| `--ring` | Focus ring | `0.1445 0 0` (#0a0a0a) | `0.8697 0 0` (#d4d4d4) |

**Dark surfaces are pure black.** In dark mode `--background`, `--muted`,
`--card` and `--popover` are all `0 0 0` (#000000). Hairlines separate the
surfaces, not lightness:

```
background = muted = card = popover = #000000
separated by --border (#262626)
hover, selected and active fills: --secondary, --accent (#262626)
```

Grey stays only for `--muted-foreground` text, `--border`, `--input`, the
hover, selected and active fills (`--secondary`, `--accent`) and structural
fills (below). So a raised
surface (card, popover, menu, dialog, panel) draws `border` (the `--border`
hairline); a `bg-card` or `bg-popover` without one is invisible on the page.
The hairline is 1.39:1 against black, a depth cue and not a control boundary
(`--input` carries that). In light mode `--muted`, `--secondary` and `--accent`
are one value, so the split only shows in dark. Hover, focus, active, selected
and data-state feedback on an actionable element uses `bg-secondary` (or
`bg-secondary/50`), never `bg-muted`: in dark, `--muted` is the page color, so
the fill would not show. Not `bg-accent` either: presets set `--accent` to a
brand color, while their `--secondary` stays a quiet neutral that keeps the row
text readable (6.65 to 12.53:1 across the dark presets). Menu items and ghost
buttons keep `bg-accent` with `text-accent-foreground`.
`packages/ui/src/components/muted-state-feedback.test.ts` and
`apps/registry/lib/hover-fills.test.ts` enforce it.

A **structural fill** is a fill that is the whole visual of its element:
skeletons, progress, meter and usage tracks, the drawer handle, empty heatmap
cells and the neutral Gantt bar. It uses `bg-secondary` (#262626), at the same
opacity as before. Chips, code spans and panels keep `bg-muted`: their text and
border carry them.
`packages/ui/src/components/black-surface-borders.test.ts` and
`apps/registry/lib/structural-fills.test.ts` enforce it. Product themes that
override these roles keep their own values; PaaS has no color overrides, so it
follows the core theme.

In dark mode `--destructive` is a light red paired with a dark
`--destructive-foreground` (the shadcn v4 pairing). One dark red cannot be both
readable text on a near-black surface and a fill behind white text.

### Penpot alias names

The Penpot libraries carry two token groups that name an existing role instead of adding a colour. `tokens.json` and the Penpot token sets keep the names so a Penpot binding resolves; the web has no variable for them, so use the role.

| Penpot token | Resolves to | On the web |
|--------------|-------------|------------|
| `color.badge-label.success` / `warning` / `info` / `danger` | `{color.success}` / `{color.warning}` / `{color.info}` / `{color.destructive}` | the `success`, `warning`, `info` or `destructive` role |
| `brand.status.<status>.light` / `.dark` | `implemented` `{color.success}`, `candidate` `{color.info}`, `planned` `{color.muted-foreground}`, `unsupported` `{color.destructive}`, `deprecated` `{color.warning}` (the same in both modes) | the role in the middle column |

### Anti-patterns
- **Never** use `bg-black` / `text-white` / `bg-white`. Use `bg-background` / `bg-foreground` / `text-foreground` so dark mode works.
- **Never** use `bg-gray-500` / Tailwind palette literals. Pick a semantic token.
- **Hard-coded black** (`#000`, `bg-black`) is banned for backgrounds — use `--background`, which is pure black in dark on web.

### Contrast
WCAG 2.2 **AA** minimum: text ≥ **4.5:1** (large text ≥ 3:1), non-text UI such as control boundaries and focus rings ≥ **3:1**.
The token contract below holds for the default theme, every preset in
`themes/presets.css` and the product themes in `themes/products.css`, in light
and dark. The status and diff rows hold for the default theme and the product
themes, which own those roles. Tests enforce it and fail on any regression:
`packages/ui/src/lib/theme-contrast.test.ts` (web CSS) and
`packages/ui-core/src/theme.test.ts` (native theme and product themes).

| Rule | Pairs | Minimum |
|------|-------|---------|
| On-surface text | `X-foreground` on `X` for background, card, popover, primary, secondary, accent, destructive, success, warning, info | 4.5:1 |
| Secondary text | `--muted-foreground` on background, card, popover, muted | 4.5:1 |
| Danger text | `--destructive` on background, card, popover, muted, and on its own 10% tint (`bg-destructive/10`) | 4.5:1 |
| Status text | `--success`, `--warning`, `--info` on background, card, popover, muted, and on their own 10% tint | 4.5:1 |
| Diff text | `--foreground` on `--diff-added` and `--diff-removed` | 4.5:1 |
| Control boundary | `--input` against background, card, popover, muted | 3:1 |
| Focus ring | `--ring` against background | 3:1 |

Default theme ratios: muted-foreground 5.41 (light, on background) / 4.96 (light, on muted), 8.33 (dark, on every surface: they are all #000000);
destructive text 5.41 / 4.96 (light), 7.26 (dark, on every surface);
destructive-foreground on destructive 5.18 (light), 6.20 (dark); input 3.69 (light, on background, card and popover) / 3.38 (light, on muted), 3.83 (dark, on every surface);
success / warning / info text on muted 5.22 / 5.60 / 5.57 (light), 11.20 / 11.88 / 9.19 (dark), and on their 10% tint 4.95 / 5.33 / 5.24 (light);
success / warning / info foreground on its fill 5.46 / 5.85 / 5.82 (light), 9.56 / 10.14 / 7.85 (dark);
foreground on diff-added / diff-removed 16.80 / 16.44 (light), 14.58 / 15.15 (dark).

**Rules**
- Draw form-control boundaries (input, textarea, select trigger, checkbox, switch off-track, composers) with `border-input`, never `border` / `border-border`. `--border` is decorative and stays low contrast.
- Text on `bg-primary` / `bg-secondary` / `bg-accent` / `bg-destructive` / `bg-success` / `bg-warning` / `bg-info` uses that surface's `*-foreground`. `--muted-foreground` is only guaranteed on background, card, popover, and muted.
- Put light text on a destructive fill with `text-destructive-foreground`, never `text-white`: dark mode pairs a light red with dark text.
- New themes and presets must pass the contract test before merging. Keep new values inside the sRGB gamut so the measured ratio matches what renders.
- The muted row of the control-boundary rule holds for the default, Maia and PaaS themes. All 12 presets in `themes/presets.css` miss it in both modes (`--input` on `--muted` is 2.48:1 to 2.81:1); they are listed as known gaps in `theme-contrast.test.ts`, tracked in https://github.com/vllnt/ui/issues/618. A new preset has to meet it.
- Hand-written presets in `themes/presets.css` do not define the status or diff roles; they inherit the default theme's. On five presets (dracula, synthwave, nord, claude, dusk) those inherited tones fall below 4.5:1 on some preset surfaces, so use the status roles with a preset only after checking the pair (tracked in [#579](https://github.com/vllnt/ui/issues/579)). Product themes define every role. The theme switcher and `useThemePreset` do not know the product themes yet (also #579).

### Product themes

A product theme is a named override layer on the core tokens, authored in the `themes` block of `packages/design/tokens.json`. It overrides existing roles (colors per mode, fonts, type steps, `--radius`, `--opacity-grain` and `--opacity-contact`); it never adds product-specific role names to the core. Apply one with `data-theme` on `<html>`; the `dark` class still picks the mode. `themes/products.css` is generated, so edit `tokens.json` and run `pnpm tokens:generate`.

| Theme | `data-theme` | Identity |
|-------|--------------|----------|
| Maia | `maia` | Ink: no accent, `--primary` is the ink colour (#000000 light, #FFFFFF dark; pure black on purpose, while core `--primary` stays #171717 in light) on white / black, core Inter + JetBrains Mono, weights 400 to 600, tighter scale, radius sm 6 / md 8 / lg 12 / xl 16 |
| PaaS | `paas` | Core neutrals and status tones, JetBrains Mono for sans, display and mono. Dark is the design default; light works too. No accent: `--primary` stays the core neutral |

Maia's palette comes from a Penpot export kept for review in `packages/design/sources/` (the generator never reads it). That copy is the 8 Nov pink export. Maia is now Ink (owner decision, 11 Nov): the export's `accent` no longer becomes `--primary`, its Figtree faces and its 700 weights are not used, and every other value still follows it. Its product-specific names map onto core roles:

| Maia token | Core role |
|------------|-----------|
| `accent` | not mapped (Ink: `--primary` is the ink colour, `--primary-foreground` its inverse) |
| `muted` | `--muted`; core `--accent` is the same subtle surface |
| `muted-foreground`, `status.planned`, `state.idle` | `--muted-foreground` |
| `surface-raised` | `--card` and `--popover` |
| `status.implemented`, `state.done` | `--success` |
| `status.candidate`, `state.running` | `--info` |
| `status.deprecated`, `state.attention` | `--warning` |
| `status.unsupported`, `state.failed` | `--destructive` |
| `diff.added`, `diff.removed` | `--diff-added`, `--diff-removed` |
| `background`, `foreground`, `border`, `input` | same-named roles |

Status foregrounds are not in the export: Maia uses white on its light fills and black on its dark fills. `--secondary`, `--secondary-foreground` and `--ring` inherit the core values.

On the web, `--radius` carries a theme's `md` step only, because Tailwind derives `rounded-sm` and `rounded-lg` from it (`--radius` minus 4px / 2px). Maia's full radius scale ships in the `@vllnt/ui-core` outputs (`productThemes`, `tamaguiTokens`) and the Penpot token sets.

Other outputs from the same source, drift-checked by `pnpm tokens:check`:

| Output | Path | For |
|--------|------|-----|
| Product theme CSS | `packages/ui/themes/products.css` | Web (`@vllnt/ui/themes/products.css`) |
| Theme objects | `productThemes`, `tamaguiTokens`, `tamaguiThemes` in `@vllnt/ui-core` | Native; plain objects, no Tamagui dependency: `tamaguiTokens` is the input for `createTokens`, `tamaguiThemes` (keyed `maia_dark`, `paas_light`) the `themes` input for `createTamagui({ themes })` |
| Penpot token sets | `packages/design/generated/penpot-tokens.json` | Penpot import: sets `vllnt/core`, `vllnt/<theme>/<mode>`, plus themes and set order |

---

## 4. Typography

**Font families** — theme-overridable CSS variables. A brand adopts a different type identity by overriding these on a theme scope; nothing in the library is edited.

| Family | CSS variable | Default | Role |
|--------|--------------|---------|------|
| Sans | `--font-sans` | Inter, then the system sans stack | Body + UI text (`Text`, `Prose`) |
| Display | `--font-display` | `var(--font-sans)` | Headings + hero (`Heading`, `Display`) — set a serif/display face here for a brand identity |
| Mono | `--font-mono` | JetBrains Mono, then the system mono stack | Code, tabular |

**Type scale** — each step is a token (`--font-size-*`); heading/display weight is a token too (`--font-weight-heading`, `--font-weight-display`). Overriding any of these restyles the foundation primitives.

| Token | CSS variable | Size | Weight | Line height |
|-------|--------------|------|--------|-------------|
| Display | `--font-size-display` | 3.75rem (60px) | 600 (`--font-weight-display`) | 1.05 |
| H1 | `--font-size-h1` | 3rem (48px) | 600 (`--font-weight-heading`) | 1.1 |
| H2 | `--font-size-h2` | 2.25rem (36px) | 600 | 1.2 |
| H3 | `--font-size-h3` | 1.875rem (30px) | 600 | 1.25 |
| H4 | `--font-size-h4` | 1.5rem (24px) | 600 | 1.3 |
| H5 | `--font-size-h5` | 1.25rem (20px) | 600 | 1.4 |
| H6 | `--font-size-h6` | 1.125rem (18px) | 600 | 1.5 |
| Body large | `--font-size-body-lg` | 1.125rem (18px) | 400 | 1.7 |
| Body | `--font-size-body` | 1rem (16px) | 400 | 1.6 |
| Body small | `--font-size-body-sm` | 0.875rem (14px) | 400 | 1.5 |
| Caption | `--font-size-caption` | 0.75rem (12px) | 500 | 1.4 |
| Label | `--font-size-label` | 0.75rem (12px) | 600 (`--font-weight-label`) | 1.4 |
| Code | inherit | inherit | 400 mono | 1.5 |

Product themes override these steps. Maia sets Display 28/600, H5 20/600, H6 15/600, Body 14/400, Body small 13/400, Caption 12/500 and Label 11/600; its Mono 12/400 is `font-mono` at the Caption size with the body weight. No theme uses weight 700. Maia's Label is set in capitals in the design; the tokens carry no text-transform role (a theme cannot add roles), so add `uppercase` where the Label step is used. Steps a theme does not set (H1 to H4, Body large) keep the core size.

**Rules**
- The `Text` / `Heading` / `Display` / `Prose` foundation primitives consume the tokens above — style them by overriding tokens, not by forking the components.
- Headings use `font-semibold` (600), **never** `font-bold` (700+) at display sizes — letter shapes crush. The heading weight token defaults to 600.
- Code uses the core mono stack (JetBrains Mono, then the system mono stack) via `font-mono`.
- Tabular numerals for data tables, charts, transactions: `font-variant-numeric: tabular-nums`.

---

## 5. Spacing

4-pt scale. Tailwind classes map 1:1.

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Icon padding |
| `space-2` | 8px | Tight stack, inline gap |
| `space-3` | 12px | Comfortable inline gap |
| `space-4` | 16px | Default block stack |
| `space-5` | 20px | Roomy inline gap, dense card padding |
| `space-6` | 24px | Section break |
| `space-8` | 32px | Major section |
| `space-10` | 40px | Large control height, loose section break |
| `space-12` | 48px | Page section |
| `space-16` | 64px | Hero / landing block |
| `space-24` | 96px | Page gutter from 1200 px |

**Rules**
- Stay on the scale. Never `gap-[7px]` etc.
- One axis at a time on flex children — use `gap-y-N` or `gap-x-N`, not `gap-N` when only one axis is needed.

**Page column.** Three role tokens alias the scale for the horizontal page padding, and one sets the column's maximum width. They equal the page column of the live shared site shell (20 px, 48 px from 768 px, 96 px from 1200 px, at most 1440 px wide), so the Penpot libraries, which follow these values, and the shell agree. Read them instead of repeating `px-5` / `px-12` / `px-24`. The breakpoints (768, 1200) belong to the shell and are not tokens.

| Token | CSS variable | Value | Use |
|-------|--------------|-------|-----|
| `spacing.page-gutter` | `--spacing-page-gutter` | 20px (`space-5`) | Page padding below 768 px |
| `spacing.page-gutter-tablet` | `--spacing-page-gutter-tablet` | 48px (`space-12`) | Page padding from 768 px |
| `spacing.page-gutter-desktop` | `--spacing-page-gutter-desktop` | 96px (`space-24`) | Page padding from 1200 px |
| `size.page-max` | `--size-page-max` | 1440px (90rem) | Maximum width of the page column |

**Narrow measure.** `size.measure-narrow` (`--size-measure-narrow`, 480px) is the width of a narrow text column, for rich text in a tight container.

---

## 6. Radius

| Token | Value |
|-------|-------|
| `radius-none` | 0 |
| `radius-sm` | 4px |
| `radius-md` | 8px (default) |
| `radius-lg` | 12px |
| `radius-xl` | 16px |
| `radius-full` | 9999px |
| `radius-control` | 6px (`--radius-control`) |
| `radius-surface` | 8px (`--radius-surface`) |

Cards, popovers, dialogs use `radius-md`. Pills, avatars use `radius-full`. Long surfaces (panels, sheets) use `radius-lg`.

`radius-control` and `radius-surface` are role names for controls (buttons, inputs) and surfaces (cards, panels). The Penpot libraries use the same two names, but their `md`, `lg` and `xl` are 6, 8 and 12 where the code's are 8, 12 and 16. To get the same pixels in code and in Penpot, use the role names, not the `md` / `lg` / `xl` steps. Themes cannot override the two roles.

---

## 7. Elevation

Use sparingly. Most components are flat with `border` + `bg-background`.

| Token | Value |
|-------|-------|
| `shadow-none` | none |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` (popovers, dialogs) |

No coloured shadows. No multi-layered glow effects.

**Library shadows.** Three shadow tokens carry the Penpot library's values, with a separate set per mode (dark adds an inset 1px top highlight). They are emitted as CSS variables and as Penpot `shadow` tokens; the Tailwind classes above are unchanged.

| Token | Variable | Light | Dark |
|-------|----------|-------|------|
| `shadow.raised` | `--shadow-raised` | `0 1px 3px #0000001A, 0 1px 2px #0000000F` | `0 1px 3px #00000066, 0 1px 2px #0000003D, inset 0 1px 0 #FFFFFF14` |
| `shadow.overlay` | `--shadow-overlay` | `0 8px 24px #00000024` | `0 8px 24px #00000080, inset 0 1px 0 #FFFFFF1F` |
| `shadow.floating` | `--shadow-floating` | `0 16px 40px #0000002E` | `0 16px 40px #00000099, inset 0 1px 0 #FFFFFF29` |

**Grain and contact layers.** Two opacity tokens set how strong a Surface grain or contact-shadow layer is when a component draws one. Nothing draws either unless it opts in.

| Token | Value |
|-------|-------|
| `--opacity-grain` | 1 (PaaS theme: 0) |
| `--opacity-contact` | 1 (PaaS theme: 0) |

---

## 8. Motion

**Principles**
1. **Purposeful** — every animation must explain a state change. No decoration.
2. **Fast** — under 200ms unless the motion communicates distance or volume.
3. **Subtle** — translate < 8px, scale ±2%. No bounces (`spring` easings strip fidelity at small distances).

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| `duration-fast` | 100ms | `ease-out` | Micro-interactions (button press) |
| `duration-base` | 200ms | `ease-out` | Open / close, hover, focus |
| `duration-slow` | 300ms | `ease-in-out` | Layout shifts, modal entry |

`prefers-reduced-motion` — when `reduce`, durations collapse to 1ms or motion is skipped entirely.

**Banned**
- Bounce easings (`cubic-bezier(0.68, -0.55, 0.265, 1.55)`).
- Auto-playing entrance animations on initial page load (jarring).
- `animation: spin` on anything except a true loading spinner.

---

## 9. Iconography

- **Library**: `lucide-react` (only). Match its line-art aesthetic.
- **Default size**: 16px (`h-4 w-4`).
- **Stroke**: 2px (lucide default).
- **Color**: inherits `currentColor`. Don't hardcode.
- **Spacing**: 8px (`gap-2`) between icon and adjacent text.

---

## 10. Component patterns

| Use | Pattern |
|-----|---------|
| Inline action | `Button` |
| Single binary choice | `Switch` |
| One of N | `Select` (≤ 8 options) or `Combobox` (> 8 / searchable) |
| Many of N | `MultiSelect` |
| Free text | `Input` (single line) or `Textarea` |
| Confirmation | `AlertDialog` (destructive) or `Dialog` (informational) |
| Side panel | `Sheet` |
| Hover help | `Tooltip` (≤ 80 chars) |
| Stepper / wizard | `Stepper` + `MultiStepForm` |
| Tabular data | `DataTable` |
| Hierarchical data | `TreeView` |
| Status chip | `Badge` |
| Notification (transient) | `Toast` |
| Notification (persistent) | `Banner` |
| Empty state | `EmptyState` |

**Anti-patterns**
- `<div onClick>` — always use `Button` for click semantics.
- Tooltips on disabled buttons — wrap in a `<span>` with `aria-disabled` instead, since browsers swallow events on `disabled` elements.
- Modal-on-modal — restructure the flow.
- Polymorphic children + items props on the same component — pick one.

---

## 11. Accessibility (WCAG AA minimum)

- Every interactive element is keyboard-reachable.
- Focus rings visible (`--ring` token), never `outline-none` without a replacement.
- Form inputs always labelled (`<label>` or `aria-label`).
- Live regions for async state changes (`aria-live="polite"` for toasts, `assertive` for errors).
- Color is **never** the only signal — pair with icon, text, or pattern.
- Animations respect `prefers-reduced-motion`.
- Components shipping a defined ARIA pattern (combobox, dialog, menu, tabs) declare their full keyboard map in `meta.json` per #255.

### Touch targets

| Token | Value | Role |
|-------|-------|------|
| `--size-target-min` | 44px | Smallest hit target for a touch pointer |
| `--size-control-xs` | 32px; 44px under `@media (pointer: coarse)` | Extra-small control height |

`themes/default.css` and `styles.css` declare both. Under `@media (pointer: coarse)` they set `--size-control-xs: var(--size-target-min)` and change nothing else. A component reaches 44px by sizing from these variables; `Button` `lg` is already 44. Each component adopts them in its own change.

The Penpot libraries keep one `size.target.min` and `size.control-xs` per density (compact 24, regular 32, touch 44). Code has one value per name: `size.target.min` is the touch value (44) and `size.control-xs` the regular one (32).

---

## 12. Voice & writing

- Buttons: name the action. "Save changes" not "Submit", "Send invite" not "OK".
- Errors: state what happened + what to do. "Couldn't reach the API. Check your connection and retry."
- Empty states: explain why empty + what unblocks the user. "No components match. Try a different filter or [request a component](/request-component)."
- Inputs: placeholder = example, label = field meaning. They are not interchangeable.
- Don't hide failures. If something fails silently, you have a bug.

---

## 13. Anti-patterns (banned)

| Pattern | Why banned |
|---------|------------|
| `font-bold` on display headings | Crushes letter shapes; use `font-semibold` |
| `bg-black` / `bg-white` | Breaks dark mode; use `bg-background` / `bg-foreground` |
| Tailwind palette literals (`bg-zinc-500`) | Bypasses tokens; breaks theming |
| Bounce easings | Visual noise; doesn't scale to small distances |
| `<div>` with `onClick` | Loses keyboard + a11y semantics; use `Button` |
| Em-dash chains in copy (3+ in a row) | Unreadable |
| `Submit` / `OK` / `Click here` button labels | Don't name the action |
| Hard-coded black backgrounds (`#000`, `bg-black`) | Bypasses tokens; dark `--background` is already pure black |
| Auto-play hero video | Performance + motion sensitivity |
| Modal on modal | Restructure the flow |
| `eslint-disable` to bypass a rule | Fix the root cause |

---

## 14. Surfaces and roadmap

This document is the **v1 brand baseline** for VLLNT UI. It ships on these
surfaces today:

- [`/DESIGN.md`](https://ui.vllnt.com/DESIGN.md) — this file as raw markdown.
- [`/design`](https://ui.vllnt.com/design) — human-browsable rendering with a contents nav.
- [`/r/design.json`](https://ui.vllnt.com/r/design.json) — JSON token set, mirroring `packages/design/tokens.json`.

Still planned:

- Live token previews inline on the `/design` page.
- `meta.json` a11y schemas per component (#255) — keyboard / ARIA / focus rules surfaced via the registry.

---

## 15. References

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Material Design 3](https://m3.material.io)
- [IBM Carbon](https://carbondesignsystem.com)
- [Shopify Polaris](https://polaris.shopify.com)
- [Atlassian Design System](https://atlassian.design)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/)
