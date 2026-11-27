# VLLNT UI Design Tokens

`tokens.json` is the machine-readable companion to the root `DESIGN.md` guide.
It is the authored source for the public web CSS variables and the generated
React Native theme in `@vllnt/ui-core`. `component-contracts.json` defines the
portable option names shared by the web and native pilot components.

After editing either source, regenerate committed artifacts from the repository
root:

```bash
pnpm -F @vllnt/design-source tokens:generate
pnpm -F @vllnt/design-source tokens:check
```

The generator preserves the existing `@vllnt/ui` CSS entry points and converts
OKLCH colors to sRGB for React Native, where OKLCH is not reliably supported.

## Generated outputs

`tokens.json` is the only input. `tokens:check` fails when any output is stale.

| Output | Path |
|--------|------|
| Default theme CSS and styles block | `packages/ui/themes/default.css`, `packages/ui/styles.css` |
| Product theme CSS (`html[data-theme="maia"]`, `.dark`, same for `paas`) | `packages/ui/themes/products.css` |
| Native theme, product themes, Tamagui-shaped objects | `packages/ui-core/src/generated/design-tokens.ts` |
| Penpot token sets (multi-set DTCG) | `packages/design/generated/penpot-tokens.json` |

The Tamagui objects (`tamaguiTokens`, `tamaguiThemes`) are plain data in the
shape `createTokens` and `createTamagui({ themes })` take; no Tamagui package is
a dependency. The Penpot file has sets `vllnt/core` and `vllnt/<theme>/<mode>`,
a Dark and Light theme per product, a `vllnt/material/solid` set that holds the
solid values of every glass token, and `$metadata.tokenSetOrder`. The themes
`material/Solid`, `transparency/Reduced` and `contrast/Increased` enable that
set; the last two mirror the CSS fallbacks for `prefers-reduced-transparency`
and `prefers-contrast: more`.

### Glass is opt-in

In the CSS, `:root` and `.dark` hold the solid value of every glass token, so
the default theme is flat. The glass values apply only inside an opt-in scope:
`[data-glass="on"]` in light, and `.dark[data-glass="on"]`,
`.dark [data-glass="on"]` and `[data-glass="on"] .dark` in dark. The solid
fallbacks (`prefers-reduced-transparency`, `prefers-contrast: more`,
`forced-colors`, no `backdrop-filter`) come after the scope and win. The hand
switches come last: `:root[data-glass="off"] [data-glass="on"]` and
`[data-material="solid"]`. The Penpot sets are unchanged: `vllnt/core` and
`vllnt/<theme>/<mode>` keep the glass values, and `vllnt/material/solid` the
solid ones.

## Sources

`sources/` holds read-only copies of design exports, with their provenance in
`sources/README.md`. The generator never reads them. `scripts/product-themes.test.mjs`
checks the Maia state aliases against the Maia copy. Maia itself equals the
default theme and overrides nothing.

Run the tests with `pnpm -F @vllnt/design-source test:once`.

## Schema

The token file follows `tokens.schema.json`:

- `name`: fixed library name, `VLLNT UI`.
- `version`: target library version for the token contract.
- `source`: pointers back to the human guide and CSS theme implementation.
- `color.semantic`: CSS variable names, light/dark OKLCH channels, and intended roles.
  It includes the workbench roles `sidebar`, `pill`, `pill-border`,
  `composer-border`, `status-needs-you`, `status-unread`, `status-failed`,
  `status-done` and `status-ring`. The generator fails when the role names or
  their order differ from its expected list. The Tailwind preset exposes them as `sidebar`, `pill`,
  `pill-border`, `composer` and `status-*`.
- `typography.scale`: font size plus explicit font-size and line-height CSS variables.
- `spacing.scale`: 4-point spacing tokens mapped to rem values.
- `color.badge-label` and `brand.status`: Penpot alias names. Each leaf is
  `{ value, role }` with `value` a `{color.<role>}` reference. They reach the
  Penpot sets and `designTokens` only; the web uses the role itself.
- `radius`: allowed radius tokens. `control` (4) and `surface` (6) are role
  names; themes cannot override them. The web `--radius` (the Tailwind base) is
  `surface`.
- `size`: `{ value, role }` leaves with a px or rem length (`control-xs`,
  `target.min`). A leaf with `coarse: "{size.<name>}"` takes that token's value
  under `@media (pointer: coarse)`; the generator writes the rule.
- `opacity`: `{ value, role }` leaves from 0 to 1 (`grain`, `contact`).
- `themes`: named product themes (`maia`, `paas`). Each has a `label`, a
  `description`, an optional `defaultMode`, and optional overrides of existing
  core roles: `color.light` / `color.dark` (OKLCH channels), `typography`
  (`fontFamily`, `fontWeight`, `scale`), `radius` and `opacity`. Every key must
  already exist in the core, so a theme cannot add roles. `maia` has no
  overrides: it equals the default and stays so `data-theme="maia"` is valid.
- `elevation`: allowed shadow tokens (Tailwind classes; not exported to Penpot).
- `shadow`: `{ role, light, dark }` library shadows (`raised`, `overlay`,
  `floating`). Each mode is a list of layers `{ offsetX, offsetY, blur, spread,
  color, inset }`; the generator writes `--shadow-<name>` in both modes and the
  Penpot `shadow` tokens (light in `vllnt/core`, dark in each `<theme>/dark` set).
  An empty list is no shadow: the CSS gets `none`, native gets zeros and Penpot
  gets one transparent layer with no offset and no blur, because a Penpot token
  cannot be empty. `raised`, `overlay` and `floating` are empty in both modes.
- `spacing.page-gutter`, `spacing.page-gutter-tablet`, `spacing.page-gutter-desktop`:
  `{ value: "{spacing.N}", role }` aliases of the scale, the page padding of the
  shared site shell (20 below 768 px, 48 from 768 px, 96 from 1200 px).
- `size.page-max`: the maximum width of the page column (1440 px).
- `size.measure-narrow`: the narrow text column width (480 px).
- `blur.glass`: backdrop blur radii (`sm`, `md`, `lg`, `default`), written as
  `--blur-glass-*`. `lg` is the ceiling of the backdrop-filter budget in
  `DESIGN.md`; the generator fails when another step is larger.
- `material.glass`: the glass tints and edge. Each leaf is `{ role, light, dark }`
  with a `#RRGGBBAA` value per mode (`tint-top`, `tint-bottom`, `tint-dense-top`,
  `tint-dense-bottom`, `hairline-edge`, `sheen-opacity`); the older opacity steps
  and OKLCH tint keep their shape. `material.solid` lists the value each glass
  variable takes when the material is solid, in the CSS fallbacks and in the
  Penpot solid set. Every glass variable needs a solid entry.
- `shadow.glass` and `shadow.glass-floating`: the two-layer glass shadows, with
  the other library shadows. Their solid values are `shadow.raised` and
  `shadow.floating`, so the solid base has no shadow.
- `color.glass-muted-foreground` and `color.glass-input`: the muted text and
  control border colours that pass AA on the dense glass tint. They are read
  inside glass only; see "Glass material" in `DESIGN.md`.
- `motion`: allowed durations, easing, and reduced-motion behavior.
- `iconography`: icon library, sizes, stroke, and color policy.

The public registry mirrors this file at `/r/design.json`.
