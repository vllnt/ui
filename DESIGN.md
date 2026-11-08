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
typography, spacing, radius, elevation, motion, and iconography.

### Semantic tokens (consumer-facing)

Values are OKLCH channels; the sRGB hex is what renders on an sRGB display.

| Token | Role | Light | Dark |
|-------|------|-------|------|
| `--background` | Page surface | `1 0 0` (#ffffff) | `0 0 0` (#000000) |
| `--foreground` | Primary text | `0.1445 0 0` (#0a0a0a) | `0.9848 0 0` (#fafafa) |
| `--card` / `--popover` | Contained / floating surface | `1 0 0` (#ffffff) | `0.1445 0 0` (#0a0a0a) |
| `--muted` | Subtle surface (`--secondary` and `--accent` share it) | `0.9703 0 0` (#f5f5f5) | `0.2686 0 0` (#262626) |
| `--muted-foreground` | Secondary text | `0.525 0 0` (#6a6a6a) | `0.7153 0 0` (#a3a3a3) |
| `--destructive` | Danger fill **and** danger text | `0.55 0.2078 25.326` (#cf1f29) | `0.7 0.18 25.721` (#fa6961) |
| `--destructive-foreground` | Text on a destructive fill | `0.9848 0 0` (#fafafa) | `0.2044 0 0` (#171717) |
| `--success` | Success fill **and** success text | `0.5 0.11 155` (#1e7546) | `0.78 0.16 155` (#4ed589) |
| `--warning` | Caution fill **and** caution text | `0.5 0.085 70` (#825a27) | `0.82 0.15 85` (#f0bb3b) |
| `--info` | Informational fill **and** text | `0.5 0.15 255` (#1762b6) | `0.74 0.12 245` (#65b2f1) |
| `--success-foreground` / `--warning-foreground` / `--info-foreground` | Text on that fill (same pairing as destructive) | `0.9848 0 0` (#fafafa) | `0.2044 0 0` (#171717) |
| `--diff-added` / `--diff-removed` | Added / removed line surfaces; `--foreground` is the text on them | `0.94 0.04 150` (#d9f3dd) / `0.94 0.03 25` (#ffe4e1) | `0.26 0.05 150` (#102b17) / `0.26 0.055 25` (#3b1816) |
| `--border` | Decorative hairline (cards, separators, tables) | `0.9219 0 0` (#e5e5e5) | `0.2686 0 0` (#262626) |
| `--input` | Form-control boundary | `0.66 0 0` (#929292) | `0.49 0 0` (#606060) |
| `--ring` | Focus ring | `0.1445 0 0` (#0a0a0a) | `0.8697 0 0` (#d4d4d4) |

In dark mode `--destructive` is a light red paired with a dark
`--destructive-foreground` (the shadcn v4 pairing). One dark red cannot be both
readable text on a near-black surface and a fill behind white text.

### Anti-patterns
- **Never** use `bg-black` / `text-white` / `bg-white`. Use `bg-background` / `bg-foreground` / `text-foreground` so dark mode works.
- **Never** use `bg-gray-500` / Tailwind palette literals. Pick a semantic token.
- **Pure black** (`#000`) is banned for backgrounds — use `--background`.

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
| Control boundary | `--input` against background, card, popover | 3:1 |
| Focus ring | `--ring` against background | 3:1 |

Default theme ratios: muted-foreground 5.41 (light, on background) / 4.96 (light, on muted), 6.00 (dark, on muted);
destructive text 5.41 / 4.96 (light), 7.26 / 5.23 (dark, on background / muted);
destructive-foreground on destructive 5.18 (light), 6.20 (dark); input 3.11 (light), 3.34 (dark, on background);
success / warning / info text on muted 5.22 / 5.60 / 5.57 (light), 8.07 / 8.56 / 6.62 (dark), and on their 10% tint 4.95 / 5.33 / 5.24 (light);
success / warning / info foreground on its fill 5.46 / 5.85 / 5.82 (light), 9.56 / 10.14 / 7.85 (dark);
foreground on diff-added / diff-removed 16.80 / 16.44 (light), 14.58 / 15.15 (dark).

**Rules**
- Draw form-control boundaries (input, textarea, select trigger, checkbox, switch off-track, composers) with `border-input`, never `border` / `border-border`. `--border` is decorative and stays low contrast.
- Text on `bg-primary` / `bg-secondary` / `bg-accent` / `bg-destructive` / `bg-success` / `bg-warning` / `bg-info` uses that surface's `*-foreground`. `--muted-foreground` is only guaranteed on background, card, popover, and muted.
- Put light text on a destructive fill with `text-destructive-foreground`, never `text-white`: dark mode pairs a light red with dark text.
- New themes and presets must pass the contract test before merging. Keep new values inside the sRGB gamut so the measured ratio matches what renders.
- Hand-written presets in `themes/presets.css` do not define the status or diff roles; they inherit the default theme's. On five presets (dracula, synthwave, nord, claude, dusk) those inherited tones fall below 4.5:1 on some preset surfaces, so use the status roles with a preset only after checking the pair (tracked in [#579](https://github.com/vllnt/ui/issues/579)). Product themes define every role. The theme switcher and `useThemePreset` do not know the product themes yet (also #579).

### Product themes

A product theme is a named override layer on the core tokens, authored in the `themes` block of `packages/design/tokens.json`. It overrides existing roles (colors per mode, fonts, type steps, `--radius`); it never adds product-specific role names to the core. Apply one with `data-theme` on `<html>`; the `dark` class still picks the mode. `themes/products.css` is generated, so edit `tokens.json` and run `pnpm tokens:generate`.

| Theme | `data-theme` | Identity |
|-------|--------------|----------|
| Maia | `maia` | Pink `--primary` (#BE148B light, #F46CBF dark) on white / black, Figtree + JetBrains Mono, tighter scale, radius sm 6 / md 8 / lg 12 / xl 16 |
| PaaS | `paas` | Core neutrals and status tones, JetBrains Mono for sans, display and mono. Dark is the design default; light works too. No accent: `--primary` stays the core neutral |

Maia's palette comes from a Penpot export kept for review in `packages/design/sources/` (the generator never reads it). Its product-specific names map onto core roles:

| Maia token | Core role |
|------------|-----------|
| `accent` | `--primary` (and `--primary-foreground` from `accent-foreground`) |
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
| Sans | `--font-sans` | system sans stack | Body + UI text (`Text`, `Prose`) |
| Display | `--font-display` | `var(--font-sans)` | Headings + hero (`Heading`, `Display`) — set a serif/display face here for a brand identity |
| Mono | `--font-mono` | system mono stack | Code, tabular |

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

Product themes override these steps. Maia sets Display 28/700, H5 20/600, H6 15/600, Body 14/400, Body small 13/400, Caption 12/500 and Label 11/700; its Mono 12/400 is `font-mono` at the Caption size with the body weight. Maia's Display weight (700) and Label weight (700) are theme-level exceptions to the rule below; core stays at 600. Maia's Label is set in capitals in the design; the tokens carry no text-transform role (a theme cannot add roles), so add `uppercase` where the Label step is used. Steps a theme does not set (H1 to H4, Body large) keep the core size.

**Rules**
- The `Text` / `Heading` / `Display` / `Prose` foundation primitives consume the tokens above — style them by overriding tokens, not by forking the components.
- Headings use `font-semibold` (600), **never** `font-bold` (700+) at display sizes — letter shapes crush. The heading weight token defaults to 600.
- Code uses the system mono stack via `font-mono`.
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

**Rules**
- Stay on the scale. Never `gap-[7px]` etc.
- One axis at a time on flex children — use `gap-y-N` or `gap-x-N`, not `gap-N` when only one axis is needed.

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

Cards, popovers, dialogs use `radius-md`. Pills, avatars use `radius-full`. Long surfaces (panels, sheets) use `radius-lg`.

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
| Pure black backgrounds | Eye strain in dark mode |
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
