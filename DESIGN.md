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
| `--foreground` | Primary text | `0 0 0` (#000000) | `1 0 0` (#ffffff) |
| `--primary` | Primary fill and ink; `--primary-foreground` is its inverse | `0 0 0` (#000000) | `1 0 0` (#ffffff) |
| `--card` | Raised, contained surface | `1 0 0` (#ffffff) | `0 0 0` (#000000) |
| `--popover` | Overlay surface: menus, popovers, dialogs | `1 0 0` (#ffffff) | `0.1448 0 0` (#0a0a0a) |
| `--muted` | Sunken bands and quiet fills | `0.9703 0 0` (#f5f5f5) | `0.1913 0 0` (#141414) |
| `--secondary` | Hover, selected, active and data-state fills; control tracks | `0.9703 0 0` (#f5f5f5) | `0.1913 0 0` (#141414) |
| `--accent` | Fills that pair with `--accent-foreground` (menu items, ghost buttons); a brand color in presets | `0.9703 0 0` (#f5f5f5) | `0.209 0 0` (#181818) |
| `--muted-foreground` | Secondary text | `0.525 0 0` (#6a6a6a) | `0.6334 0 0` (#8a8a8a) |
| `--destructive` | Danger fill **and** danger text | `0.55 0.2078 25.326` (#cf1f29) | `0.7 0.18 25.721` (#fa6961) |
| `--destructive-foreground` | Text on a destructive fill | `0.9848 0 0` (#fafafa) | `0.2044 0 0` (#171717) |
| `--success` | Success fill **and** success text | `0.5 0.11 155` (#1e7546) | `0.78 0.16 155` (#4ed589) |
| `--warning` | Caution fill **and** caution text | `0.5 0.085 70` (#825a27) | `0.82 0.15 85` (#f0bb3b) |
| `--info` | Informational fill **and** text | `0.5 0.15 255` (#1762b6) | `0.74 0.12 245` (#65b2f1) |
| `--success-foreground` / `--warning-foreground` / `--info-foreground` | Text on that fill (same pairing as destructive) | `0.9848 0 0` (#fafafa) | `0.2044 0 0` (#171717) |
| `--diff-added` / `--diff-removed` | Added / removed line surfaces; `--foreground` is the text on them | `0.94 0.04 150` (#d9f3dd) / `0.94 0.03 25` (#ffe4e1) | `0.26 0.05 150` (#102b17) / `0.26 0.055 25` (#3b1816) |
| `--border` | Decorative hairline (cards, separators, tables) | `0.9219 0 0` (#e5e5e5) | `0.235 0 0` (#1e1e1e) |
| `--input` | Form-control boundary | `0.6167 0 0` (#858585) | `0.5208 0 0` (#696969) |
| `--ring` | Focus ring | `0.1445 0 0` (#0a0a0a) | `0.8697 0 0` (#d4d4d4) |
| `--sidebar` | Sidebar surface | `0.9848 0 0` (#fafafa) | `0.1448 0 0` (#0a0a0a) |
| `--pill` / `--pill-border` | Fill and 1px edge of a code pill (`.code-pill`) | `0.9703 0 0` (#f5f5f5) / `0.9219 0 0` (#e5e5e5) | `0.1913 0 0` (#141414) / `0.2686 0 0` (#262626) |
| `--composer-border` | Edge of a message composer | `0.8699 0 0` (#d4d4d4) | `0.285 0 0` (#2a2a2a) |
| `--status-needs-you` | Status mark: needs your input | `0.554 0.135 66.44` | `0.795 0.162 86.05` |
| `--status-unread` | Status mark: unread | `0.546 0.215 262.88` | `0.623 0.188 259.81` |
| `--status-failed` | Status mark: failed | `0.577 0.215 27.33` | `0.637 0.208 25.33` |
| `--status-done` | Status mark: done | `0.527 0.137 150.07` | `0.723 0.219 149.58` |
| `--status-ring` | Status mark: idle ring | `0.556 0 0` (#737373) | `0.715 0 0` (#a3a3a3) |

**Dark surfaces are flat and near black.** In dark mode `--background` and
`--card` are `0 0 0` (#000000), `--popover` is `0.1448 0 0` (#0a0a0a), and
`--muted` and `--secondary` are `0.1913 0 0` (#141414). Hairlines carry most of
the separation, not lightness:

```
background = card = #000000, popover = #0a0a0a, muted = secondary = #141414
separated by --border (#1e1e1e)
hover, selected and active fills: --secondary (#141414), --accent (#181818)
```

Grey stays only for `--muted-foreground` text, `--border`, `--input`, the
hover, selected and active fills (`--secondary`, `--accent`) and structural
fills (below). So a raised surface (card, popover, menu, dialog, panel) draws
`border` (the `--border` hairline); a `bg-card` without one is invisible on the
page. The hairline is 1.26:1 against black, a depth cue and not a control
boundary (`--input` carries that). In light mode `--muted`, `--secondary` and
`--accent` are one value; in dark, `--muted` and `--secondary` are one value and
`--accent` is one step lighter. Hover, focus, active, selected and data-state
feedback on an actionable element uses `bg-secondary` (or `bg-secondary/50`),
never `bg-muted`: `--muted` is the quiet band role, not a feedback role. Not
`bg-accent` either: presets set `--accent` to a brand color, while their
`--secondary` stays a quiet neutral that keeps the row text readable (6.65 to
12.53:1 across the dark presets). Menu items and ghost buttons keep
`bg-accent` with `text-accent-foreground`.
`packages/ui/src/components/muted-state-feedback.test.ts` and
`apps/registry/lib/hover-fills.test.ts` enforce it.

A **structural fill** is a fill that is the whole visual of its element:
skeletons, progress, meter and usage tracks, the drawer handle, empty heatmap
cells and the neutral Gantt bar. It uses `bg-secondary` (#141414 in dark), at
the same opacity as before. Chips, code spans and panels keep `bg-muted`: their
text and border carry them.
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
| Workbench text | `--foreground` and `--muted-foreground` on `--sidebar` and `--pill` | 4.5:1 |
| Status marks | `--status-needs-you`, `-unread`, `-failed`, `-done`, `-ring` on background, card, popover, `--sidebar` and `--pill`. They are dots and rings, not text | 3:1 |

Default theme ratios: muted-foreground 5.41 (light, on background) / 4.96 (light, on muted), 6.08 (dark, on background and card) / 5.73 (dark, on popover) / 5.34 (dark, on muted);
destructive text 5.41 / 4.96 (light), 7.26 (dark, on background and card) / 6.84 (dark, on popover) / 6.37 (dark, on muted);
destructive-foreground on destructive 5.18 (light), 6.20 (dark); input 3.69 (light, on background, card and popover) / 3.38 (light, on muted), 3.83 (dark, on background and card) / 3.61 (dark, on popover) / 3.36 (dark, on muted);
success / warning / info text on muted 5.22 / 5.60 / 5.57 (light), 9.83 / 10.42 / 8.06 (dark), and on their 10% tint 4.95 / 5.33 / 5.24 (light);
success / warning / info foreground on its fill 5.46 / 5.85 / 5.82 (light), 9.56 / 10.14 / 7.85 (dark);
foreground on diff-added / diff-removed 17.81 / 17.44 (light), 15.22 / 15.81 (dark).

**Rules**
- Draw form-control boundaries (input, textarea, select trigger, checkbox, switch off-track, composers) with `border-input`, never `border` / `border-border`. `--border` is decorative and stays low contrast.
- Text on `bg-primary` / `bg-secondary` / `bg-accent` / `bg-destructive` / `bg-success` / `bg-warning` / `bg-info` uses that surface's `*-foreground`. `--muted-foreground` is only guaranteed on background, card, popover, and muted.
- Put light text on a destructive fill with `text-destructive-foreground`, never `text-white`: dark mode pairs a light red with dark text.
- New themes and presets must pass the contract test before merging. Keep new values inside the sRGB gamut so the measured ratio matches what renders.
- Every preset sets its own `--input`, so the control-boundary rule (muted row included) is met per preset. `packages/ui/src/lib/__tests__/fit-preset-inputs.ts` computes it: it moves only the lightness of `--input`, by the smallest 0.001 step that reaches 3:1 on background, card, popover and muted, and keeps hue and chroma. After changing a preset's surfaces, run `pnpm -F @vllnt/ui exec tsx src/lib/__tests__/fit-preset-inputs.ts` to see the values, and add `--write` to update `themes/presets.css`.
- Hand-written presets in `themes/presets.css` do not define the status or diff roles; they inherit the default theme's. On five presets (dracula, synthwave, nord, claude, dusk) those inherited tones fall below 4.5:1 on some preset surfaces, so use the status roles with a preset only after checking the pair (tracked in [#579](https://github.com/vllnt/ui/issues/579)). Product themes define every role. The theme switcher and `useThemePreset` do not know the product themes yet (also #579).

### Product themes

A product theme is a named override layer on the core tokens, authored in the `themes` block of `packages/design/tokens.json`. It overrides existing roles (colors per mode, fonts, type steps, `--radius`, `--opacity-grain` and `--opacity-contact`); it never adds product-specific role names to the core. Apply one with `data-theme` on `<html>`; the `dark` class still picks the mode. `themes/products.css` is generated, so edit `tokens.json` and run `pnpm tokens:generate`.

| Theme | `data-theme` | Identity |
|-------|--------------|----------|
| Maia | `maia` | The default theme. It overrides nothing, so `data-theme="maia"` renders as the core does (flat, monochrome, JetBrains Mono, radius 4 / 6). The attribute stays valid |
| PaaS | `paas` | Core neutrals and status tones, JetBrains Mono for sans, display and mono with its own fallback stack. Dark is the design default; light works too. No accent: `--primary` follows the core |

Maia was the first product theme and its values became the core default (#768). The Penpot export kept for review in `packages/design/sources/` (the generator never reads it) is the 8 Nov pink export and is provenance only. Its product-specific names still map onto core roles:

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

Status foregrounds are not in the export; the core carries them.

On the web, `--radius` carries a theme's `md` step only, because Tailwind derives `rounded-sm` and `rounded-lg` from it (`--radius` minus 4px / 2px). A theme's full radius scale ships in the `@vllnt/ui-core` outputs (`productThemes`, `tamaguiTokens`) and the Penpot token sets.

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
| Sans | `--font-sans` | JetBrains Mono, then the system mono stack (the same stack as Mono) | Body + UI text (`Text`, `Prose`) |
| Display | `--font-display` | `var(--font-sans)` | Headings + hero (`Heading`, `Display`) — set a serif/display face here for a brand identity |
| Mono | `--font-mono` | JetBrains Mono, then the system mono stack | Code, tabular |

**Type scale** — each step is a token (`--font-size-*`); heading/display weight is a token too (`--font-weight-heading`, `--font-weight-display`). Overriding any of these restyles the foundation primitives.

| Token | CSS variable | Size | Weight | Line height |
|-------|--------------|------|--------|-------------|
| Display | `--font-size-display` | 1.75rem (28px) | 600 (`--font-weight-display`) | 1.1 |
| H1 | `--font-size-h1` | 1.25rem (20px) | 500 (`--font-weight-heading`) | 1.3 |
| H2 | `--font-size-h2` | 0.875rem (14px) | 500 | 1.4 |
| H3 | `--font-size-h3` | 0.8125rem (13px) | 500 | 1.4 |
| H4 | `--font-size-h4` | 0.8125rem (13px) | 500 | 1.4 |
| H5 | `--font-size-h5` | 0.8125rem (13px) | 500 | 1.4 |
| H6 | `--font-size-h6` | 0.8125rem (13px) | 500 | 1.4 |
| Body large | `--font-size-body-lg` | 0.9375rem (15px) | 400 | 1.6 |
| Body | `--font-size-body` | 0.875rem (14px) | 400 | 1.5 |
| Body small | `--font-size-body-sm` | 0.8125rem (13px) | 400 | 1.45 |
| Caption | `--font-size-caption` | 0.75rem (12px) | 400 | 1.4 |
| Label | `--font-size-label` | 0.6875rem (11px) | 500 (`--font-weight-label`) | 1.4 |
| Code | inherit | inherit | 400 mono | 1.5 |

Product themes override these steps. The core scale is the dense workbench scale: body 14, headings 13 to 20, caption 12 and label 11, in one mono family. Body large (15) is bigger than H2 to H6 (13 to 14), so the scale does not strictly decrease; keep Body large for lead text. No theme uses weight 700. A theme cannot add a text-transform role, so add `uppercase` where a Label is set in capitals.

**Rules**
- The `Text` / `Heading` / `Display` / `Prose` foundation primitives consume the tokens above — style them by overriding tokens, not by forking the components.
- Headings use the heading weight token (`font-medium`, 500), **never** `font-bold` (700+) at display sizes — letter shapes crush. `Display` keeps 600.
- Code uses the core mono stack (JetBrains Mono, then the system mono stack) via `font-mono`.
- Tabular numerals for data tables, charts, transactions: `font-variant-numeric: tabular-nums`.

**Workbench utilities.** `styles.css` ships `.code-pill` (inline code: `--pill` fill, `--pill-border` edge, mono 12px) and CSS-only text spinners for terminal-style status: `.ascii` with `.ascii-run` (a running task), `.ascii-wait` (waiting or reconnecting) and `.ascii-load` (a loading region). Add `aria-hidden="true"` and keep a text label beside the spinner. Under `prefers-reduced-motion` a spinner keeps its first frame. The matching Tailwind colours are `bg-sidebar`, `bg-pill`, `border-pill-border`, `border-composer` and `text-status-needs-you`, `-unread`, `-failed`, `-done`, `-ring`.

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

**Text measure.** Two tokens cap the width of a text column. `size.measure-narrow` (`--size-measure-narrow`, 480px) is for rich text in a tight container. `size.measure-prose` (`--size-measure-prose`, 720px) is for lead copy and descriptions. `Text` reads them through its `measure` prop (`narrow`, `prose`); unset, the text fills its container.

---

## 6. Radius

| Token | Value |
|-------|-------|
| `radius-none` | 0 |
| `radius-sm` | 4px |
| `radius-md` | 8px |
| `radius-lg` | 12px |
| `radius-xl` | 16px |
| `radius-full` | 9999px |
| `radius-control` | 4px (`--radius-control`) |
| `radius-surface` | 6px (`--radius-surface`) |

Surfaces (cards, popovers, dialogs, panels) are 6px, controls (buttons, inputs) 4px. Pills and avatars use `radius-full`. On the web `--radius` is 0.375rem, so Tailwind's `rounded-lg`, `rounded-md` and `rounded-sm` are 6, 4 and 2px.

`radius-control` and `radius-surface` are role names for controls (buttons, inputs) and surfaces (cards, panels). The Penpot libraries use the same two names, but their `md`, `lg` and `xl` are 6, 8 and 12 where the code's are 8, 12 and 16 (`sm` is 4 in both). To get the same pixels in code and in Penpot, use the role names, not the `md` / `lg` / `xl` steps. Themes cannot override the two roles.

---

## 7. Elevation

The default is flat: a surface is `border` + `bg-card` (or `bg-popover`) with no shadow, in light and dark. Glass is opt-in, see "Glass material" below.

| Token | Value |
|-------|-------|
| `shadow-none` | none |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` (popovers, dialogs) |

No coloured shadows. No multi-layered glow effects.

**Library shadows.** Three shadow tokens are emitted as CSS variables and as Penpot `shadow` tokens, with a separate set per mode. All three are `none` in both modes. A Penpot shadow token cannot be empty, so Penpot gets one transparent layer with no offset and no blur. The Tailwind classes above are unchanged.

| Token | Variable | Light | Dark |
|-------|----------|-------|------|
| `shadow.raised` | `--shadow-raised` | `none` | `none` |
| `shadow.overlay` | `--shadow-overlay` | `none` | `none` |
| `shadow.floating` | `--shadow-floating` | `none` | `none` |

**Grain and contact layers.** Two opacity tokens set how strong a Surface grain or contact-shadow layer is when a component draws one. Nothing draws either unless it opts in.

| Token | Value |
|-------|-------|
| `--opacity-grain` | 1 (PaaS theme: 0) |
| `--opacity-contact` | 1 (PaaS theme: 0) |

### Glass material

Glass is opt-in. The default theme is solid: `:root` and `.dark` hold the solid values, so the `vllnt-glass*` classes and every component that takes `material` draw an opaque part with no blur and no shadow. Inside a glass scope (below) a glass part is a tint drawn top to bottom, a white sheen over it, a backdrop blur, a 1 px outer edge and a two-layer shadow. Solid is the same part with an opaque `card` tint, no blur, no sheen and no shadow. Glass is for AR and media HUDs over a live image, not for a 2D page. The tokens follow the Penpot glass-default recipe (r5 and r8); tone follows the theme (light or dark), never the backdrop. The table lists the glass values, which apply inside `[data-glass="on"]`.

| Token | Variable | Light | Dark |
|-------|----------|-------|------|
| `blur.glass.default` | `--blur-glass-default` | 20px | 20px |
| `blur.glass.sm`, `md`, `lg` | `--blur-glass-sm`, `-md`, `-lg` | 8px, 12px, 24px | same |
| `material.glass.tint-top` | `--material-glass-tint-top` | `#FFFFFFA3` | `#1C1C1CB2` |
| `material.glass.tint-bottom` | `--material-glass-tint-bottom` | `#FFFFFF80` | `#1414149C` |
| `material.glass.tint-dense-top` | `--material-glass-tint-dense-top` | `#FFFFFFE6` | `#121212E0` |
| `material.glass.tint-dense-bottom` | `--material-glass-tint-dense-bottom` | `#FFFFFFD6` | `#121212D1` |
| `material.glass.hairline-edge` | `--material-glass-hairline-edge` | `#00000014` | `#FFFFFF1A` |
| `material.glass.sheen-opacity` | `--material-glass-sheen-opacity` | 1 | 0.17 |
| `shadow.glass` | `--shadow-glass` | `0 1px 2px #0000000D, 0 4px 14px #0000000F` | `0 1px 2px #00000066, 0 4px 14px #0000004D` |
| `shadow.glass-floating` | `--shadow-glass-floating` | `0 1px 2px #00000014, 0 10px 28px #0000001F` | `0 1px 2px #00000080, 0 10px 28px #00000080` |
| `color.glass-muted-foreground` | `--color-glass-muted-foreground` | `#404040` | `#D4D4D4` |
| `color.glass-input` | `--color-glass-input` | `#595959` | `#A3A3A3` |

The r5 tokens stay: `material.glass.opacity.{sm,md,lg,xl,default}` (0.6, 0.72, 0.82, 0.9, lg), `material.glass.tint`, `.highlight`, `.hairline`, `color.glass-border`, `material.highlight.top` and `depth.z-0` to `z-4`. The scrim behind a dialog or sheet uses `material.glass.tint` at 0.8 and `blur.glass.sm`.

The dark default tint is `#1C1C1CB2` to `#1414149C`. The first draft of the recipe used `#1C1C1CAF` to `#14141499`, which gives 4.34:1 for the code foreground (`oklch(0.9848 0 0)`, rgb 250) over a white backdrop; the settled values give 4.51:1. The recipe scripts measure with pure white text, the tests and the table below with the code foreground.

**Two tints.** Pick one per part and write it as a class.

| Class | Use | May hold |
|-------|-----|----------|
| `vllnt-glass` | Islands, bars, buttons, chips | Foreground text only |
| `vllnt-glass vllnt-glass-dense` | Panels with body text, anything with muted or placeholder text, menus, popovers, any part whose border identifies a control | Foreground, `glass-muted-foreground`, `glass-input` borders |
| `vllnt-glass-floating` (with or without `vllnt-glass-dense`) | Parts that open above the page: docks, menus, popovers, dialogs, sheets. Same tint rules, `shadow.glass-floating` | as above |
| `vllnt-glass-scrim` | The dim behind a dialog or sheet. No text, no border | nothing |

Inside glass, `text-muted-foreground` and `border-input` read `glass-muted-foreground` and `glass-input` (Tailwind preset). Muted text on the default tint fails AA, so it belongs on the dense tint. The hairline edge is decorative; a border that identifies a control uses `glass-input`. A theme preset has its own foreground, so under a preset the default tint is the dense tint.

**Opt in.** Put `data-glass="on"` on `<html>` for glass everywhere, or on one surface for glass inside it. `GlassCard`, `GlassPanel`, `GlassProgress` and `LiquidGlass` set it on their own root when `material` is `"glass"`, so they stay glass on any page. The scope only sets variables; the `vllnt-glass*` classes draw the part.

```html
<html data-glass="on">  <!-- glass everywhere -->
<div data-glass="on" class="vllnt-glass vllnt-glass-dense">Glass here only</div>
```

**The `material` prop.** Every glass component takes `material="glass" | "solid"`, default `"glass"`. It writes `data-material`. `"glass"` is glass inside a glass scope and solid elsewhere. `[data-material="solid"]` redeclares the glass variables with the solid values, so the part and everything inside it turn solid, scope or not. `DialogContent` passes it to its overlay. `ProgressiveBlur` draws no blur when solid.

```tsx
<GlassPanel material="solid">Always opaque</GlassPanel>
```

**Automatic solid.** Inside a glass scope, CSS redeclares the same variables with the solid values, with no script, when any of these holds:

| Condition | Source |
|-----------|--------|
| `prefers-reduced-transparency: reduce` | Operating system setting |
| `prefers-contrast: more` | Operating system setting |
| `forced-colors: active` | Windows high contrast |
| No `backdrop-filter` or `-webkit-backdrop-filter` | `@supports not (...)` |
| `html[data-glass="off"]` | App switch: every glass scope below it turns solid |

The glass classes live in `styles.css`; an app that loads only `themes/default.css` has the tokens but not the classes.

**Low power.** The library does not read the battery. An app that wants solid on weak devices sets the switch itself:

```js
const lowPower = navigator.hardwareConcurrency <= 4 || navigator.connection?.saveData === true;
document.documentElement.dataset.glass = lowPower ? "off" : "on";
```

**Contrast.** `packages/ui/src/lib/glass-contrast.test.ts` measures every theme in light and dark, with the glass values of the opt-in scope: WCAG relative luminance, sRGB blend with alphas as stored, every point from the top to the bottom of the part, over white, mid-grey `#808080` and black, on both the CSS gradient and the flat top tint. Text needs 4.5:1, a control boundary 3:1. Worst case, default theme:

| Text on glass | Tint | Light | Dark | Needs |
|---------------|------|-------|------|-------|
| Foreground | Default | 6.14 | 4.51 | 4.5 |
| Foreground | Dense | 14.29 | 8.79 | 4.5 |
| `glass-muted-foreground` | Dense | 7.48 | 6.19 | 4.5 |
| `glass-input` border | Dense | 5.06 | 3.64 | 3 |
| `glass-muted-foreground` | Default | 3.22 | 3.17 | fails, so muted text takes the dense tint |

The dark default foreground is the tightest figure (white backdrop, top of the part). Status colours (destructive, success, warning, info) are not part of this check.

**Backdrop-filter budget.**

| Rule | Value | Enforced by |
|------|-------|-------------|
| Largest blur radius | `blur.glass.lg`, 24px | `glass-budget.test.ts`, `tokens:check` |
| Blur source | A `--blur-glass-*` token, never `backdrop-blur-*` or a literal radius | `glass-budget.test.ts` |
| Blurred layers on screen at once | 5 at most, the scrim counts, a `ProgressiveBlur` counts as its `layers` | Design rule |
| Glass inside glass | Allowed; each nested part adds a layer | Design rule |
| Every glass part switchable to solid | `data-material` on every glass component | `glass-budget.test.ts` |
| Solid is the base, glass is opt-in | `:root` and `.dark` hold the solid values and no blur; `[data-glass="on"]` holds the glass values | `glass-tokens.test.mjs`, `glass-budget.test.ts` |

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
- Glass is opt-in. It turns solid under `prefers-reduced-transparency`, `prefers-contrast: more` and `forced-colors: active`, and text on glass meets AA in both tints (see "Glass material").
- Components shipping a defined ARIA pattern (combobox, dialog, menu, tabs) declare their full keyboard map in `meta.json` per #255.

### Touch targets

| Token | Value | Role |
|-------|-------|------|
| `--size-target-min` | 44px | Smallest hit target for a touch pointer |
| `--size-control-xs` | 32px; 44px under `@media (pointer: coarse)` | Extra-small control height |

`themes/default.css` and `styles.css` declare both. Under `@media (pointer: coarse)` they set `--size-control-xs: var(--size-target-min)` and change nothing else. A component reaches 44px by sizing from these variables; `Button` `lg` is already 44. Each component adopts them in its own change.

The Tailwind preset maps them to three utilities, so a class reads the same token a component does:

| Utility | CSS | Use |
|---------|-----|-----|
| `min-h-target` | `min-height: var(--size-target-min)` | Give a control a 44px minimum height |
| `min-w-target` | `min-width: var(--size-target-min)` | Give a control a 44px minimum width |
| `h-control-xs` | `height: var(--size-control-xs)` | A 32px control that is 44px under a coarse pointer |

The switch is by pointer, never by screen width: a phone gets 44px because its primary pointer is coarse, and a narrow desktop window keeps 32px. Do not key a target size on a breakpoint. `Link` `size="lg"` reads `h-control-xs`; `Button` `icon-lg` is a fixed 44px square.

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
| `font-bold` on display headings | Crushes letter shapes; use the heading weight (500) or `font-semibold` for `Display` |
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
| `backdrop-blur-*` utilities or a literal `backdrop-filter` radius | Skips the blur tokens, the 24px budget and the solid fallbacks; use `vllnt-glass` |

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
