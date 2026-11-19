# RFC: spatial-ready foundations

| | |
| --- | --- |
| **Status** | RFC, open for review on the lane board (#622). No code until Pixel's review is resolved. |
| **Target** | `@vllnt/ui` 0.5.0 and the matching `@vllnt/ui-core` minor. 0.4.0's scope does not grow. |
| **Direction** | Benoît, 19 Nov 2026: spatial-ready foundations. |
| **Owners** | Tokens and the contract (`packages/design`, `packages/ui-core`): UI Web Manager (shared lane). Web components: web lane. Native components: native lane. Penpot libraries: UI Web Manager. |
| **Not in scope** | A spatial renderer (visionOS, glasses). This is foundations only. |

## 1. Why

Touch, AR and spatial interfaces (Apple Vision, glasses) can't rely on hover, fine pointers or colour alone to show what can be acted on. The aim is that **anyone can tell what is interactive and what is not**, through depth, shape and focus, on every input. Mouse and keyboard must keep working exactly as today.

We set this in the token layer and in one behavioural contract now. Then web, native and a later spatial renderer all read the same source, and nobody has to retrofit 300+ components later.

## 2. What already exists (verified 19 Nov)

| Area | Today | Gap for spatial |
| --- | --- | --- |
| Elevation | `elevation.none/sm/md/lg`: Tailwind black-alpha shadows. DESIGN.md §7 says "use sparingly". | Shadows only. They are invisible on the pure-black dark page. There are no semantic levels and no native or spatial mapping. |
| Dark surfaces | Pure black: `--background`, `--muted`, `--card` and `--popover` are `#000`. A hairline `--border` (`#262626`) gives every raised surface its edge, and a test guards this (#592). | Depth has to work on `#000` without luminance or shadow. The hairline is today's only depth cue. |
| States | The `--secondary` fill (`#262626` dark) is the hover, selected, active and data-state fill, guarded by a test (#592). The focus ring uses `--ring`. | There is no single state set and no "static surfaces never respond" rule. Gaze is not modelled. |
| Targets | `size.target.min` = 44 (2.75rem). `size.control-xs` = 32 rises to 44 under `(pointer: coarse)` (#602, on `s3/integration-4`, decision D16). | There is no 24 px pointer floor token, no 60 pt spatial target, and no explicit input mode (`data-input`). |
| Motion | `motion.duration.fast/base/slow` (100/200/300 ms), `motion.easing.enter/exit/layout`, and a `reducedMotion` rule. | No press or raise transition tokens. The reduced-motion behaviour is prose only. |
| Texture | `opacity.grain` and `opacity.contact` (D12): an opt-in Surface grain and a contact shadow. | The contact shadow is a depth cue that isn't tied to a level yet. |

## 3. Proposal

### 3.1 Depth tokens: semantic surface levels

There are five levels, one source in `packages/design/tokens.json`, exported by `@vllnt/ui-core` and mapped per renderer.

| Level | Use | z-order |
| --- | --- | --- |
| `base` | The page and static content | 0 |
| `raised` | Interactive controls at rest (buttons, inputs, chips, cards that act) | 1 |
| `overlay` | Popovers, menus, dropdowns, tooltips | 2 |
| `floating` | Sticky toolbars, docks, FABs, toasts | 3 |
| `modal` | Dialogs and sheets above a scrim | 4 |

Each level carries one value per renderer:

| Token | Web | Native | Spatial (future renderer) |
| --- | --- | --- | --- |
| `depth.<level>.border` | the hairline colour, `--border` or a brighter step for `floating`/`modal` | border colour | rim light |
| `depth.<level>.surface` | the luminance step of the fill. **Light:** white, then `#fafafa` and up. **Dark:** `#000` for `base` and `raised`; a step only from `overlay` up, subject to Q1. | background colour | material tint |
| `depth.<level>.shadow` | restrained. **Light:** today's `sm`/`md`/`lg` values. **Dark:** `none` by default, because a shadow on black reads as nothing. | `elevation` (Android dp) / `shadow*` (iOS), via ui-core | none, because depth is physical |
| `depth.<level>.z` | none | none | z-offset in points: 0, 4, 8, 16, 24 (proposal) |
| `depth.<level>.material` | none | none | `none`, `thin`, `regular`, `thick`, `ultraThick` (proposal) |

Rules:

- **Monochrome and pure black hold.** On web, depth is a **hairline plus a luminance step plus a restrained shadow**, applied in that order of priority. In dark, the hairline does the work and the shadow is off.
- **Existing tokens stay.** `elevation.sm/md/lg` become aliases of `depth.raised/overlay/modal.shadow`, deprecated in 0.5.0 and removed in 1.0.
- **Contact shadow.** The D12 contact shadow (`opacity.contact`) belongs to `raised`. When it's on, it is the light-mode raise cue under controls.

### 3.2 The affordance contract

Every interactive component uses **one state set**, driven by tokens:

| State | Trigger | Visual (web) | Notes |
| --- | --- | --- | --- |
| `rest` | none | `depth.raised`: hairline, shape (`radius.control`) | Interactive elements are recognisable at rest, without colour |
| `hover` / `gaze` | pointer hover, or gaze in spatial | the `--secondary` fill (existing rule) plus a raise of one step where the component floats | Gaze uses the same tokens as hover |
| `focus-visible` | keyboard or switch focus | `--ring` focus ring, 2 px plus offset; never removed | Already required (DESIGN.md §11) |
| `pressed` | pointer down, tap, pinch | sinks to `base`: hairline kept, scale 0.98, `motion.press` | No layout shift |
| `selected` | `aria-selected`, `aria-pressed`, `data-state=on` | the `--secondary` fill plus a non-colour mark (check, dot, weight or underline) | Never colour only |
| `disabled` | `disabled` / `aria-disabled` | flattened to `base`, 50% opacity, no hover response | |

Three rules hold across the contract:

1. **Recognisable without colour.** An interactive element differs from static content by depth (raise or hairline), shape and its focus ring, never by colour alone. This is WCAG 1.4.1, plus the brand's monochrome.
2. **Static surfaces never respond.** A `base` surface (Card, Section, Panel) never changes on hover, unless the whole surface is itself the action, and then it follows the contract.
3. **Nothing is hover-only.** Every tooltip, hover card or hover detail has a focus equivalent (it shows on `focus-visible`) and a long-press equivalent (touch and spatial). This is WCAG 1.4.13.

Each rule gets a test that names its own fix, in the style of `muted-state-feedback.test.ts` and `black-surface-borders.test.ts`:

- **A1:** a `hover:` class on a component without an interactive role or element fails.
- **A2:** a Tooltip or HoverCard trigger without a focus path fails.
- **A3:** an interactive component without a `focus-visible` style fails.

### 3.3 Input-agnostic targets

| Token | Value | Source |
| --- | --- | --- |
| `size.target.pointer` | 24 px | WCAG 2.2 SC 2.5.8, the minimum for pointer input |
| `size.target.touch` | 44 pt (2.75rem) | Apple HIG and WCAG 2.5.5 AAA. It is today's `size.target.min`, which becomes an alias of it. |
| `size.target.spatial` | 60 pt | Apple visionOS guidance for gaze targets |

**Input mode.** The root carries `data-input="pointer" | "touch" | "spatial"`. Without the attribute, `(pointer: coarse)` selects `touch` and everything else is `pointer`. An explicit attribute wins; `spatial` is only ever explicit. The mode sets two CSS variables:

- `--target-min`: one of the three tokens above.
- `--density`: 1, 1.15 or 1.35 (proposal). It scales control padding and the gaps between controls.

**Layouts don't change.** Controls grow their hit area with `min-height` / `min-width: var(--target-min)`. Where the visual size must stay, for example an icon in a dense toolbar, the hit area grows through an invisible `::after` expansion. No breakpoint, column count or reflow depends on the input mode, so mouse and keyboard users see exactly what they see today.

The D16 coarse-pointer rule (`size.control-xs` → 44) becomes the `touch` case of this mechanism, not a separate rule.

**Native.** ui-core exports the same three tokens. `@vllnt/ui-native` uses `touch` by default from 0.1.0. A future spatial renderer uses `spatial`.

### 3.4 Motion

| Token | Value | Use |
| --- | --- | --- |
| `motion.press` | `duration.fast` (100 ms), `easing.exit` | Pressed sink (scale 0.98, depth down one level) |
| `motion.raise` | `duration.base` (200 ms), `easing.enter` | Hover or gaze raise, overlay entry |

Under `prefers-reduced-motion: reduce`, and its native equivalents, transforms are dropped: no scale and no translate. The state still shows through the fill, hairline and ring changes, which become instant. This puts DESIGN.md §8's prose into a testable rule. A test fails any `transition-transform` that has no `motion-reduce:` counterpart.

### 3.5 Penpot

The depth tokens (§3.1) and the target tokens (§3.3) go into the shared `vllnt/core` set of the three libraries, and the affordance states are bound on the Atoms controls. They ship as one library lock, after this RFC is accepted and the code tokens merge. Penpot names equal code names.

## 4. Lanes and order

1. **This RFC:** reviewed on #622 by Pixel. Changes are folded back in, then it merges as docs.
2. **Shared lane** (web manager, one `tokens:` PR): add `depth.*`, `size.target.{pointer,touch,spatial}` and `motion.{press,raise}` to `tokens.json`. Regenerate the outputs, with the ui-core export and the native and Tamagui token maps. Add the aliases and deprecations.
3. **Web lane:** the `data-input` / coarse-pointer mechanism in the theme CSS, the A1–A3 tests and the motion test, then component adoption in waves, atoms first.
4. **Native lane:** from 0.1.0, every foundation component follows §3.2 (states, nothing hover-only) and §3.3 (`touch` targets, using today's `size.target.min` until the new token lands). It adopts `depth.*` when step 2 merges.
5. **Penpot:** §3.5, after step 2.

## 5. Definition of done for 0.5.0 (runnable checks)

| # | Check |
| --- | --- |
| S1 | `pnpm tokens:check` passes, and `tokens.json` has the five depth levels with web, native and spatial fields, the three target tokens and the two motion tokens |
| S2 | The ui-core unit tests assert the exported depth, target and motion values, and that native and Tamagui map `depth.<level>.shadow` to elevation |
| S3 | The A1, A2 and A3 tests and the reduced-motion transform test pass on `packages/ui`. Each one is shown to fail on a planted mistake. |
| S4 | A Playwright check at `data-input=pointer/touch/spatial` measures every interactive atom's hit area: at least 24, 44 or 60 px, with the same layout box for non-interactive content across the three modes |
| S5 | axe and Storybook a11y show 0 WCAG 2.2 AA violations, with 2.5.8 and 1.4.13 included |
| S6 | Native: the `ui-native` tests assert at least 44 pt targets and focus and long-press paths on the 0.1.0 foundation components |

## 6. Open questions for review

1. **Dark luminance steps.** Should `overlay`, `floating` and `modal` get a fill step in dark (for example `#0a0a0a` / `#111`)? Or do they stay `#000` with a brighter hairline only, which keeps the pure-black decision literal? The proposal is a hairline-only default, with `floating` and `modal` on a `#3a3a3a` hairline. Benoît decided "pure black" on 16 Nov.
2. **Spatial values.** Are the z-offsets (0, 4, 8, 16, 24 pt) and material names placeholders until there's a spatial renderer, or do we lock them now so the native and Penpot teams can see them?
3. **Density factors.** Are 1, 1.15 and 1.35 right for pointer, touch and spatial? The alternative is a fixed spacing step per mode.
4. **Whole-surface actions.** Are cards that act as one link allowed to raise on hover (rule 2 exception), or must they use an explicit inner action?
5. **Grain.** Is the D12 Surface grain part of `raised` in spatial (a material texture), or web-only?
