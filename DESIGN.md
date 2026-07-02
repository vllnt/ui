# DESIGN.md

> Single source of truth for VLLNT UI's brand and design conventions.
> Humans read this file. Agents read it too — every UI suggestion must follow it.

This is the **canonical** brand & design guideline for the library. Read it on
the web at three public surfaces, all generated from this one file:

- [`/DESIGN.md`](https://ui.vllnt.ai/DESIGN.md) — this file as raw markdown (canonical for agents).
- [`/design`](https://ui.vllnt.ai/design) — human-browsable rendering with a contents nav.
- [`/r/design.json`](https://ui.vllnt.ai/r/design.json) — machine-readable token set.

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

| Token | Light role | Dark role |
|-------|------------|-----------|
| `--background` | Surface | Surface |
| `--foreground` | Primary text | Primary text |
| `--muted` | Subtle surface | Subtle surface |
| `--muted-foreground` | Secondary text | Secondary text |
| `--border` | Hairline divider | Hairline divider |
| `--ring` | Focus ring | Focus ring |
| `--accent` / `--accent-foreground` | Active / hover surface | Same |
| `--destructive` / `--destructive-foreground` | Danger surface / text | Same |

### Anti-patterns
- **Never** use `bg-black` / `text-white` / `bg-white`. Use `bg-background` / `bg-foreground` / `text-foreground` so dark mode works.
- **Never** use `bg-gray-500` / Tailwind palette literals. Pick a semantic token.
- **Pure black** (`#000`) is banned for backgrounds — use `--background`.

### Contrast
WCAG **AA** minimum. Body text against any surface ≥ **4.5:1**, large text ≥ **3:1**, non-text UI ≥ **3:1**. The default theme passes; new themes must verify before merging.

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
| Code | inherit | inherit | 400 mono | 1.5 |

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
| `space-6` | 24px | Section break |
| `space-8` | 32px | Major section |
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

- [`/DESIGN.md`](https://ui.vllnt.ai/DESIGN.md) — this file as raw markdown.
- [`/design`](https://ui.vllnt.ai/design) — human-browsable rendering with a contents nav.
- [`/r/design.json`](https://ui.vllnt.ai/r/design.json) — JSON token set, mirroring `packages/design/tokens.json`.

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
