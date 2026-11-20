# Native parity matrix: @vllnt/ui web vs @vllnt/ui-native 0.1.0

> Generated from [`packages/ui-native/parity.json`](../../packages/ui-native/parity.json) by `packages/ui-native/scripts/check-parity.mjs`. Do not edit by hand: change `parity.json`, then run `node packages/ui-native/scripts/check-parity.mjs --write`. `--check` fails when this file is stale.

## Spatial-ready foundations

- 0.1.0 native components follow the affordance contract and 44 pt touch targets from day one.
- The depth tokens (base, raised, overlay, floating, modal) and the 60 pt gaze target come from ui-core when the web lane lands them (planned for @vllnt/ui 0.5.0); native adopts them then.
- The spatial renderer is not planned.

The Affordance column below shows what each existing component styles today; the gap to the contract is build work.

## Summary

| Status | Count | Meaning |
| --- | --- | --- |
| native-0.1.0, built | 172 | A native module exists in `registry.json`. |
| native-0.1.0, planned (missing) | 0 | Foundation component that 0.1.0 must add; not built yet. |
| web-only | 79 | Stays web-only, with a concrete reason and the native equivalent when there is one. |
| later | 70 | Native releases after 0.1.0: 0.2.0 (20), 0.3.0 (36), 0.4.0 (12), 0.5.0 (2). |
| **Web components** | **321** | One entry each. |
| Native-only primitives | 3 | `icon`, `stack`, `spacer`: no web component behind them (0 planned, 3 built). |

Foundation set: 41 rows, 40 exist on native, 0 missing, 1 mapped to a native equivalent. Open decisions: 0.

## Foundation

Everything here ships in 0.1.0. **State**: exists = native module today; MISSING = planned, not built; mapped = web-only component covered by the listed native equivalent. **Affordance** lists the contract states the native component styles itself today (rest, hover, focus-visible, pressed, selected, disabled; `unknown` when the source is unclear); React Native has no `:focus-visible`, so focus-visible means the focus ring drawn on any focus. **Props gap** lists exported web props with no native counterpart; DOM-only props (className, asChild, HTML attributes, mouse and pointer events) are ignored.

- Tabular data in 0.1.0: `data-list` and `item` rows cover it, so `table` is later 0.2.0 and not a foundation component.
- Typography in 0.1.0: `text`, `heading` and `label` cover it; the `typography` extras (Blockquote, InlineCode, List) are later 0.2.0.

### Layout

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `aspect-ratio` | atoms | atoms/aspect-ratio | exists | no | — | none |  |
| `grid` | atoms | atoms/grid | exists | no | — | none |  |
| `panel` | atoms | atoms/panel | exists | no | — | none |  |
| `spacer` | — | atoms/spacer | exists (native-only) | no | — | — | Fixed or flexible gap between siblings when Stack gap is not enough. Proposed: `<Spacer size={4} />`. size takes a spacing token for a fixed gap; the flex prop makes it absorb free space instead. |
| `stack` | — | atoms/stack | exists (native-only) | no | — | — | Native has no layout primitive for rows and columns; every screen re-implements flex rows and gaps. Proposed: `<Stack direction="row" gap={3} align="center" justify="space-between" wrap />`. One Stack, no Box. direction is "row" \| "column"; gap takes spacing tokens; align and justify map to flex alignment and wrap allows flex wrap. Renders a plain View with no accessibility role. |

### Typography

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `display` | atoms | atoms/display | exists | no | — | none | Display text on the theme's display type scale (60 pt in the default native theme, 28 pt in Maia). `as` "h1" and "h2" set the header role; `animated` plays a rise-in reveal that reduced motion skips. |
| `heading` | atoms | atoms/heading | exists | no | — | none |  |
| `label` | atoms | atoms/label | exists | no | — | none | Dims to 0.7 opacity when disabled, but is not itself pressable. |
| `prose` | atoms | `heading`, `text` | mapped | no | — | — | Styles raw HTML descendants through CSS selectors; native has no HTML tree, so compose Heading and Text. |
| `text` | atoms | atoms/text | exists | no | — | none |  |

### Icons

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `icon` | — | atoms/icon | exists (native-only) | no | — | — | Native has no icon component; web uses lucide-react. Button size="icon" and every glyph-bearing component need one. Proposed: `<Icon icon={LucideLikeComponent} size="md" tone="muted" label="Done" />`. icon takes any lucide-compatible component, so ui-native adds no icon or SVG dependency and the consumer supplies the component. size is "sm" \| "md" \| "lg" or a number; tone follows the Text tones. The icon is decorative (hidden from screen readers) unless label is set. |

### Buttons

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `button` | atoms | atoms/button | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `disabled` | none | Icon button is size="icon"; its glyph needs the planned Icon primitive. |

### Forms

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `checkbox` | atoms | atoms/checkbox | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `selected`, `disabled` | none |  |
| `field` | molecules | molecules/field | exists | no | — | none | Static wrapper for label, hint and error; the control inside carries the states. |
| `input` | atoms | atoms/input | exists | yes | `rest`, `focus-visible`, `disabled` | none |  |
| `radio-group` | atoms | atoms/radio-group | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `selected`, `disabled` | none | `dir` and `name` are DOM-only (no RTL override or form field on native). |
| `segmented-control` | atoms | atoms/segmented-control | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `selected`, `disabled` | none | Renamed: `value` → `selection.value`, `defaultValue` → `selection.defaultValue`, `onValueChange` → `selection.onChange`, `SegmentedControlItem.value` → `items[].id`. Data-driven: items replace SegmentedControlItem children, and label is required. `dir` is DOM-only. |
| `select` | atoms | atoms/select | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `selected`, `disabled` | `open`, `defaultOpen`, `dir`, `name`, `autoComplete`, `required`, `form` | Renamed: `children` → `options`, `value` → `selection.value`, `defaultValue` → `selection.defaultValue`, `onValueChange` → `selection.onChange`, `SelectItem.value` → `options[].id`, `SelectItem.disabled` → `options[].disabled`, `SelectValue.placeholder` → `labels.placeholder`. Data-driven: options replace SelectItem, SelectGroup, SelectLabel and SelectSeparator, so no grouping or separators. Opens in a bottom panel, so SelectContent positioning props do not apply. Selected is the option row. |
| `slider` | atoms | atoms/slider | exists | yes | `rest`, `disabled` | `minStepsBetweenThumbs` | Single thumb: value, defaultValue and onValueChange use a number, web uses number[]. `dir`, `form` and `name` are DOM-only. `minStepsBetweenThumbs` stays a gap: the native slider has one thumb. |
| `switch` | atoms | atoms/switch | exists | yes | `rest`, `selected` | none | Pressed and disabled looks are drawn by the platform Switch, not styled by the component. |
| `textarea` | atoms | molecules/textarea | exists | yes | `rest`, `focus-visible`, `disabled` | none | Wraps native Input and inherits its states. |

### Feedback

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `alert` | atoms | atoms/alert | exists | no | — | none |  |
| `badge` | atoms | atoms/badge | exists | no | — | none |  |
| `progress-bar` | atoms | molecules/progress-bar | exists | no | — | none |  |
| `skeleton` | atoms | atoms/skeleton | exists | no | — | none |  |
| `spinner` | atoms | atoms/spinner | exists | no | — | none |  |
| `toast` | atoms | atoms/toast | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `disabled` | none | Renamed: `variant` → `toasts[].variant`. Data-driven: a toasts array replaces Toast, ToastTitle, ToastDescription, ToastAction and ToastClose, and duration and action are fields of ToastItem. The action and close buttons carry the states; only the action can be disabled. |

### Overlays

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `dialog` | atoms | atoms/dialog | exists | yes | `rest`, `hover`, `focus-visible`, `pressed` | `modal`, `DialogContent.overlay` | Single component: title, description and closeLabel replace the Dialog parts, and there is no trigger part (the caller owns open state). The close button carries the states. ModalLayer renders a transparent Modal with no backdrop dim, like web overlay="none"; the veil is the later `scrim` component. |
| `drawer` | atoms | atoms/drawer | exists | yes | `rest`, `hover`, `focus-visible`, `pressed` | `activeSnapPoint`, `setActiveSnapPoint`, `snapPoints`, `fadeFromIndex`, `snapToSequentialPoint`, `closeThreshold`, `dismissible`, `handleOnly`, `direction`, `modal`, `nested`, `fixed`, `autoFocus`, `onClose`, `onDrag`, `onRelease`, `onAnimationEnd` | Bottom modal only: no drag or snap points. Single component like Dialog. Web-DOM props not listed: container, noBodyStyles, scrollLockTimeout, disablePreventScroll, preventScrollRestoration, repositionInputs, shouldScaleBackground, setBackgroundColorOnScale. The close button carries the states. |
| `dropdown-menu` | atoms | atoms/dropdown-menu | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `selected`, `disabled` | `dir`, `modal`, `DropdownMenuContent.loop`, `DropdownMenuContent.side`, `DropdownMenuContent.sideOffset`, `DropdownMenuContent.align`, `DropdownMenuContent.alignOffset`, `DropdownMenuItem.inset`, `DropdownMenuItem.textValue`, `DropdownMenuCheckboxItem.checked`, `DropdownMenuCheckboxItem.onCheckedChange`, `DropdownMenuRadioGroup.value`, `DropdownMenuRadioGroup.onValueChange`, `DropdownMenuSub.open`, `DropdownMenuSub.defaultOpen`, `DropdownMenuSub.onOpenChange` | Renamed: `DropdownMenuItem.onSelect` → `onSelect`, `DropdownMenuItem.disabled` → `items[].disabled`. Flat modal list with one selected item (selectedId): no groups, separators, shortcuts, checkbox or radio items, or sub-menus. Radix collision props (arrowPadding, avoidCollisions, collisionBoundary, collisionPadding, sticky, hideWhenDetached, updatePositionStrategy) are not listed. |
| `popover` | atoms | atoms/popover | exists | yes | `rest`, `hover`, `focus-visible`, `pressed` | `modal`, `PopoverContent.side`, `PopoverContent.sideOffset`, `PopoverContent.align`, `PopoverContent.alignOffset` | Centered modal, not anchored to a trigger, and there is no anchor part. Radix collision props (arrowPadding, avoidCollisions, collisionBoundary, collisionPadding, sticky, hideWhenDetached, updatePositionStrategy) are not listed. The close button carries the states. |
| `sheet` | atoms | atoms/sheet | exists | yes | `rest`, `hover`, `focus-visible`, `pressed` | `modal` | Renamed: `SheetContent.side` → `side`, `SheetContent.labels` → `closeLabel`. Single component: title, description and closeLabel replace the Sheet parts, and there is no trigger part. The close button carries the states. |
| `tooltip` | atoms | atoms/tooltip | exists | yes | `rest`, `hover`, `focus-visible`, `pressed` | `delayDuration`, `disableHoverableContent`, `TooltipProvider.skipDelayDuration`, `TooltipContent.side`, `TooltipContent.sideOffset`, `TooltipContent.align`, `TooltipContent.alignOffset` | Press-to-open trigger: hover and focus style it but do not open it, and there is no long-press disclosure. Centered modal, not anchored. Radix collision props (arrowPadding, avoidCollisions, collisionBoundary, collisionPadding, sticky, hideWhenDetached, updatePositionStrategy) are not listed. |

### Navigation

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `data-list` | atoms | molecules/data-list | exists | no | — | none | Renamed: `children` → `items`. Data-driven: items replace DataListItem, DataListLabel and DataListValue. |
| `item` | atoms | atoms/item | exists | no | — | none | Not pressable on native today. |
| `list-box` | atoms | atoms/list-box | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `selected`, `disabled` | none | Renamed: `selectionMode` → `mode`, `children` → `options`, `value` → `selection.value`, `defaultValue` → `selection.defaultValue`, `onValueChange` → `selection.onChange`, `ListBoxItem.value` → `options[].id`, `ListBoxItem.disabled` → `options[].disabled`. Data-driven: options replace ListBoxItem children. selection holds a ReadonlySet of ids, web value is string[]. |
| `tabs` | atoms | molecules/tabs | exists | yes | `rest`, `hover`, `focus-visible`, `pressed`, `selected`, `disabled` | none |  |
| `top-bar` | atoms | molecules/top-bar | exists | no | — | none |  |

### Data display

| Component | Web | Native | State | Interactive | Affordance | Props gap | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `avatar` | atoms | atoms/avatar | exists | no | — | none | size is a pixel number (default 40); web takes xs, sm, md, lg or xl. |
| `card` | atoms | atoms/card | exists | no | — | none |  |
| `separator` | atoms | atoms/separator | exists | no | — | none |  |

## Components by category

Foundation components are listed above and not repeated here.

### Layout (3)

native-0.1.0 2 · web-only 1 · later 0

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `horizontal-scroll-row` | molecules | native-0.1.0 | — | molecules/horizontal-scroll-row |  |
| `resizable` | atoms | native-0.1.0 | — | atoms/resizable |  |
| `scroll-area` | atoms | web-only | — | `ScrollView`, `FlatList` | Custom-styled scrollbars over DOM overflow; native scroll containers are platform-drawn. |

### Typography (3)

native-0.1.0 1 · web-only 0 · later 2

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `kbd` | atoms | later | 0.2.0 | — | Key-cap chip with platform-aware modifier expansion. |
| `truncated-text` | atoms | native-0.1.0 | — | atoms/truncated-text |  |
| `typography` | atoms | later | 0.2.0 | — | Semantic HTML text elements (h1-h4, p, lead, muted, blockquote, inline code, list). Text, Heading and Label cover 0.1.0; Blockquote, InlineCode and List have no native equivalent yet and come in 0.2.0. |

### Buttons (5)

native-0.1.0 5 · web-only 0 · later 0

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `button-group` | atoms | native-0.1.0 | — | atoms/button-group |  |
| `copy-button` | molecules | native-0.1.0 | — | atoms/copy-button |  |
| `floating-action-button` | atoms | native-0.1.0 | — | molecules/floating-action-button |  |
| `toggle` | atoms | native-0.1.0 | — | atoms/toggle |  |
| `toggle-group` | molecules | native-0.1.0 | — | atoms/toggle-group |  |

### Forms (31)

native-0.1.0 30 · web-only 0 · later 1

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `calendar` | molecules | native-0.1.0 | — | atoms/calendar |  |
| `category-filter` | molecules | native-0.1.0 | — | molecules/category-filter |  |
| `checkbox-group` | molecules | native-0.1.0 | — | atoms/checkbox-group |  |
| `color-picker` | molecules | native-0.1.0 | — | atoms/color-picker |  |
| `combobox` | organisms | native-0.1.0 | — | molecules/combobox |  |
| `date-field` | atoms | native-0.1.0 | — | molecules/date-field |  |
| `date-picker` | organisms | native-0.1.0 | — | molecules/date-picker |  |
| `date-range-picker` | organisms | native-0.1.0 | — | organisms/date-range-picker |  |
| `fieldset` | atoms | native-0.1.0 | — | atoms/fieldset |  |
| `file-upload` | molecules | native-0.1.0 | — | atoms/file-upload |  |
| `filter-bar` | molecules | native-0.1.0 | — | atoms/filter-bar |  |
| `form` | molecules | native-0.1.0 | — | atoms/form |  |
| `inline-input` | molecules | native-0.1.0 | — | molecules/inline-input |  |
| `input-group` | atoms | native-0.1.0 | — | molecules/input-group |  |
| `input-otp` | atoms | native-0.1.0 | — | atoms/input-otp |  |
| `multi-select` | organisms | native-0.1.0 | — | molecules/multi-select |  |
| `native-select` | atoms | native-0.1.0 | — | molecules/native-select |  |
| `number-input` | molecules | native-0.1.0 | — | molecules/number-input |  |
| `password-input` | atoms | native-0.1.0 | — | molecules/password-input |  |
| `phone-input` | atoms | native-0.1.0 | — | molecules/phone-input |  |
| `range-calendar` | organisms | native-0.1.0 | — | molecules/range-calendar |  |
| `rating` | atoms | native-0.1.0 | — | atoms/rating |  |
| `scope-selector` | molecules | later | 0.3.0 | — | Multi-level scope picker for nested environments and targets. |
| `search-bar` | molecules | native-0.1.0 | — | molecules/search-bar |  |
| `search-field` | atoms | native-0.1.0 | — | molecules/search-field |  |
| `tag-group` | atoms | native-0.1.0 | — | atoms/tag-group |  |
| `tags-input` | atoms | native-0.1.0 | — | atoms/tags-input |  |
| `text-field` | molecules | native-0.1.0 | — | molecules/text-field |  |
| `time-field` | atoms | native-0.1.0 | — | organisms/time-field |  |
| `time-picker` | molecules | native-0.1.0 | — | organisms/time-picker |  |
| `timeline-scrubber` | atoms | native-0.1.0 | — | atoms/timeline-scrubber |  |

### Feedback (7)

native-0.1.0 7 · web-only 0 · later 0

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `banner` | atoms | native-0.1.0 | — | molecules/banner |  |
| `empty-state` | atoms | native-0.1.0 | — | atoms/empty-state |  |
| `glass-progress` | atoms | native-0.1.0 | — | atoms/glass-progress |  |
| `meter` | atoms | native-0.1.0 | — | atoms/meter |  |
| `scroll-progress` | atoms | native-0.1.0 | — | atoms/scroll-progress |  |
| `severity-badge` | atoms | native-0.1.0 | — | atoms/severity-badge |  |
| `status-indicator` | atoms | native-0.1.0 | — | atoms/status-indicator |  |

### Overlays (10)

native-0.1.0 6 · web-only 2 · later 2

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `alert-dialog` | molecules | native-0.1.0 | — | atoms/alert-dialog |  |
| `animated-tooltip` | atoms | web-only | — | `tooltip` | Hover-driven scale-and-fade avatar tooltip. |
| `command` | molecules | native-0.1.0 | — | atoms/command |  |
| `context-menu` | atoms | native-0.1.0 | — | atoms/context-menu |  |
| `hover-card` | atoms | web-only | — | `popover`, `tooltip` | Opens on pointer hover only; touch has no hover. |
| `keyboard-shortcuts-help` | atoms | native-0.1.0 | — | atoms/keyboard-shortcuts-help |  |
| `scrim` | atoms | later | 0.2.0 | — | Dims the surface behind a panel, sheet or pane. Native ModalLayer renders a transparent Modal with no backdrop dim. |
| `search-dialog` | organisms | native-0.1.0 | — | atoms/search-dialog |  |
| `share-dialog` | organisms | native-0.1.0 | — | atoms/share-dialog |  |
| `share-dialog-people` | organisms | later | 0.3.0 | — | People-sharing panel with link, role menus and invite form. Needs: native share-dialog (exists). |

### Navigation (21)

native-0.1.0 16 · web-only 4 · later 1

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `animated-tabs` | atoms | native-0.1.0 | — | molecules/animated-tabs |  |
| `bottom-bar` | atoms | native-0.1.0 | — | atoms/bottom-bar |  |
| `breadcrumb` | atoms | native-0.1.0 | — | molecules/breadcrumb |  |
| `dock` | atoms | web-only | — | `bottom-bar` | macOS-style dock whose icons magnify near the pointer. |
| `document-sibling-nav` | atoms | native-0.1.0 | — | atoms/document-sibling-nav |  |
| `floating-navbar` | atoms | web-only | — | `top-bar`, `bottom-bar` | Marketing nav bar that hides on window scroll direction. |
| `floating-toolbar` | atoms | native-0.1.0 | — | atoms/floating-toolbar |  |
| `jarvis-dock` | atoms | web-only | — | — | Floating quick-action dock with a command-palette trigger; canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `link` | atoms | native-0.1.0 | — | atoms/link |  |
| `menubar` | atoms | native-0.1.0 | — | molecules/menubar |  |
| `navbar-saas` | organisms | web-only | — | `top-bar` | Marketing navbar built on next/link and next/navigation. |
| `navigation-menu` | atoms | native-0.1.0 | — | molecules/navigation-menu |  |
| `pagination` | molecules | native-0.1.0 | — | molecules/pagination |  |
| `settings-list` | organisms | later | 0.2.0 | — | Sectioned settings rows; very common on mobile. Needs: native item (exists), Stack (planned). |
| `sidebar` | molecules | native-0.1.0 | — | molecules/sidebar |  |
| `sidebar-provider` | atoms | native-0.1.0 | — | atoms/sidebar-provider |  |
| `sidebar-toggle` | molecules | native-0.1.0 | — | molecules/sidebar-toggle |  |
| `step-navigation` | atoms | native-0.1.0 | — | molecules/step-navigation |  |
| `toolbar` | atoms | native-0.1.0 | — | molecules/toolbar |  |
| `view-switcher` | atoms | native-0.1.0 | — | molecules/view-switcher |  |
| `workspace-switcher` | atoms | native-0.1.0 | — | molecules/workspace-switcher |  |

### Data display (6)

native-0.1.0 5 · web-only 0 · later 1

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `avatar-group` | molecules | native-0.1.0 | — | molecules/avatar-group |  |
| `presence-stack` | atoms | native-0.1.0 | — | molecules/presence-stack |  |
| `role-badge` | molecules | native-0.1.0 | — | molecules/role-badge |  |
| `stat-card` | molecules | native-0.1.0 | — | molecules/stat-card |  |
| `table` | atoms | later | 0.2.0 | — | Web table is a DOM table element; native needs a grid built on View. data-list and item rows cover tabular data in 0.1.0. |
| `tree-view` | organisms | native-0.1.0 | — | organisms/tree-view |  |

### Ai (17)

native-0.1.0 13 · web-only 0 · later 4

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `agent-activity` | atoms | native-0.1.0 | — | atoms/agent-activity |  |
| `ai-artifact` | molecules | native-0.1.0 | — | molecules/ai-artifact |  |
| `ai-chat-input` | molecules | native-0.1.0 | — | atoms/ai-chat-input |  |
| `ai-message-bubble` | molecules | native-0.1.0 | — | molecules/ai-message-bubble |  |
| `ai-sidebar` | molecules | later | 0.3.0 | — | Slide-out assistant panel; compose native sheet or sidebar with the existing AI components. Needs: native sheet, sidebar (exist). |
| `ai-source-citation` | atoms | native-0.1.0 | — | molecules/ai-source-citation |  |
| `ai-streaming-text` | atoms | native-0.1.0 | — | atoms/ai-streaming-text |  |
| `ai-tool-call-display` | molecules | native-0.1.0 | — | molecules/ai-tool-call-display |  |
| `approval-request` | molecules | later | 0.2.0 | — | Approve or deny one agent action; a common mobile prompt. |
| `chain-of-thought` | atoms | native-0.1.0 | — | atoms/chain-of-thought |  |
| `conversation-thread` | molecules | native-0.1.0 | — | molecules/conversation-thread |  |
| `model-comparison` | molecules | later | 0.3.0 | — | Side-by-side model responses with blind mode and a vote bar. |
| `model-selector` | organisms | native-0.1.0 | — | atoms/model-selector |  |
| `prompt-input` | atoms | native-0.1.0 | — | atoms/prompt-input |  |
| `prompt-templates` | molecules | later | 0.3.0 | — | Searchable prompt template gallery with a variable fill-in form. Needs: native search-field, form (exist). |
| `reasoning` | atoms | native-0.1.0 | — | atoms/reasoning |  |
| `thinking-block` | atoms | native-0.1.0 | — | atoms/thinking-block |  |

### Education (27)

native-0.1.0 11 · web-only 0 · later 16

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `annotation` | molecules | later | 0.3.0 | — | Inline text highlight with an attached note. |
| `checklist` | atoms | native-0.1.0 | — | atoms/checklist |  |
| `chronological-timeline` | organisms | later | 0.4.0 | — | Scroll-driven media timeline with audio and video. Niche domain component. |
| `civilization-card` | molecules | later | 0.4.0 | — | History-education profile card. Niche domain component. |
| `completion-dialog` | molecules | native-0.1.0 | — | atoms/completion-dialog |  |
| `curriculum` | atoms | later | 0.3.0 | — | Lesson sequence container with progress. |
| `era-comparison` | atoms | later | 0.4.0 | — | Side-by-side comparison of historical eras. Niche domain component. |
| `exercise` | molecules | native-0.1.0 | — | atoms/exercise |  |
| `flashcard` | molecules | native-0.1.0 | — | atoms/flashcard |  |
| `historic-timeline` | organisms | later | 0.4.0 | — | Timeline for events spanning centuries, with BCE/CE markers. Niche domain component. |
| `historical-figure-card` | molecules | later | 0.4.0 | — | Profile card for historical figures. Niche domain component. |
| `key-concept` | atoms | later | 0.3.0 | — | Highlighted definition block and glossary list. |
| `knowledge-check` | molecules | later | 0.3.0 | — | Inline multiple-choice, true/false or fill-in check with a score. |
| `learning-objectives` | atoms | later | 0.3.0 | — | Learning goals list. |
| `parallel-timeline` | organisms | later | 0.4.0 | — | Multi-track comparative history timeline. Niche domain component. |
| `primary-source-viewer` | organisms | later | 0.4.0 | — | Document viewer with zoom, rotate and region annotations. Niche domain component. |
| `pro-tip` | atoms | later | 0.3.0 | — | Highlighted tip block with tip, best-practice and gotcha variants. |
| `profile-section` | molecules | later | 0.3.0 | — | Avatar and details block; the web version uses next/image and next/link. Needs: native avatar (exists). |
| `progress-tracker` | molecules | native-0.1.0 | — | organisms/progress-tracker |  |
| `pull-quote` | atoms | later | 0.3.0 | — | Highlighted quotation with rule and attribution. |
| `quiz` | atoms | native-0.1.0 | — | atoms/quiz |  |
| `step-by-step` | atoms | native-0.1.0 | — | atoms/step-by-step |  |
| `stepper` | atoms | native-0.1.0 | — | atoms/stepper |  |
| `tour` | molecules | native-0.1.0 | — | atoms/tour |  |
| `tutorial-card` | molecules | later | 0.3.0 | — | Tutorial preview card with metadata. |
| `tutorial-complete` | organisms | native-0.1.0 | — | atoms/tutorial-complete |  |
| `tutorial-filters` | molecules | native-0.1.0 | — | atoms/tutorial-filters |  |

### Content (27)

native-0.1.0 13 · web-only 10 · later 4

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `accordion` | atoms | native-0.1.0 | — | molecules/accordion |  |
| `animated-testimonials` | atoms | native-0.1.0 | — | atoms/animated-testimonials |  |
| `bento-grid` | atoms | web-only | — | `grid`, `card` | Responsive CSS grid of marketing feature cards. |
| `blog-card` | molecules | web-only | — | `card`, `link` | Blog preview card built on next/link for SEO pages. |
| `callout` | atoms | native-0.1.0 | — | atoms/callout |  |
| `carousel` | molecules | native-0.1.0 | — | atoms/carousel |  |
| `code-block` | organisms | native-0.1.0 | — | atoms/code-block |  |
| `code-playground` | organisms | later | 0.3.0 | — | Shows extracted code beside a file tree (no live execution); compose native code-block and tree-view. Needs: native code-block, tree-view (exist). |
| `collapsible` | atoms | native-0.1.0 | — | atoms/collapsible |  |
| `comparison` | atoms | later | 0.3.0 | — | Side-by-side feature or content comparison. |
| `content-intro` | molecules | native-0.1.0 | — | molecules/content-intro |  |
| `cookie-consent` | molecules | web-only | — | — | Cookie-law (ePrivacy/GDPR) banner for websites; native apps use platform consent flows. |
| `cta-band` | organisms | web-only | — | — | Marketing call-to-action band for landing pages. |
| `expandable-cards` | atoms | native-0.1.0 | — | molecules/expandable-cards |  |
| `faq` | atoms | native-0.1.0 | — | molecules/faq |  |
| `mdx-content` | organisms | web-only | — | — | Compiles MDX at runtime (@mdx-js/mdx, react-markdown) for web content pipelines. No native markdown renderer is planned. |
| `newsletter-signup` | molecules | web-only | — | `field`, `input`, `button` | Marketing email-capture form. |
| `share-section` | atoms | native-0.1.0 | — | atoms/share-section |  |
| `slideshow` | organisms | native-0.1.0 | — | atoms/slideshow |  |
| `social-fab` | atoms | web-only | — | `floating-action-button`, `ShareService` | Hover-driven share menu that opens provider web-share URLs; native uses the platform share sheet. |
| `static-code` | organisms | web-only | — | `code-block` | react-syntax-highlighter build for server-rendered code. |
| `terminal` | organisms | native-0.1.0 | — | atoms/terminal |  |
| `timeline` | atoms | later | 0.2.0 | — | Vertical or horizontal event timeline with status connectors. |
| `tldr-section` | atoms | native-0.1.0 | — | atoms/tldr-section |  |
| `tutorial-intro-content` | atoms | web-only | — | — | Renders markdown through react-markdown, part of the web content pipeline. |
| `tutorial-mdx` | organisms | web-only | — | — | MDX renderer for tutorial content on the web content pipeline. |
| `video-embed` | atoms | later | 0.3.0 | — | Provider iframe embed; native needs a WebView or video module. Needs: react-native-webview or expo-video. |

### Billing (8)

native-0.1.0 2 · web-only 0 · later 6

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `auto-reload` | molecules | later | 0.3.0 | — | Automatic top-up form: toggle, threshold and amount. |
| `credit-badge` | molecules | native-0.1.0 | — | molecules/credit-badge |  |
| `order-summary` | organisms | later | 0.3.0 | — | Priced rows, total and optional promo code. |
| `plan-badge` | molecules | native-0.1.0 | — | molecules/plan-badge |  |
| `pricing-table` | molecules | later | 0.3.0 | — | Plan comparison with feature checklist and CTA. |
| `subscription-card` | organisms | later | 0.3.0 | — | Plan, renewal and usage details. |
| `transaction-list` | molecules | later | 0.3.0 | — | Credit and debit history with locale-aware currency. |
| `wallet-card` | organisms | later | 0.3.0 | — | Credit balance with available and pending amounts. |

### Data (17)

native-0.1.0 11 · web-only 0 · later 6

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `access-matrix` | organisms | later | 0.3.0 | — | Permission matrix for admin screens, as a table or one row per subject. Needs: native Table (0.2.0). |
| `activity-log` | molecules | native-0.1.0 | — | molecules/activity-log |  |
| `countdown-timer` | molecules | native-0.1.0 | — | organisms/countdown-timer |  |
| `data-table` | organisms | later | 0.2.0 | — | Sortable, filterable, selectable table with pagination. Needs: native Table (0.2.0); @tanstack/react-table is headless. |
| `interactive-timeline` | organisms | native-0.1.0 | — | organisms/interactive-timeline |  |
| `live-feed` | molecules | native-0.1.0 | — | molecules/live-feed |  |
| `metric-cluster` | atoms | native-0.1.0 | — | molecules/metric-cluster |  |
| `order-book` | atoms | later | 0.3.0 | — | Level II bid/ask ladder with cumulative size bars; finance domain. Needs: Views. |
| `overview-board` | molecules | native-0.1.0 | — | molecules/overview-board |  |
| `presence-sync-indicator` | atoms | native-0.1.0 | — | molecules/presence-sync-indicator |  |
| `progress-card` | molecules | native-0.1.0 | — | organisms/progress-card |  |
| `status-board` | molecules | native-0.1.0 | — | molecules/status-board |  |
| `sticky-metric` | atoms | native-0.1.0 | — | molecules/sticky-metric |  |
| `ticker-tape` | molecules | later | 0.3.0 | — | Scrolling symbol tape with price and change badges; finance domain. Needs: native marquee (exists). |
| `usage-breakdown` | molecules | later | 0.3.0 | — | Ranked resource consumption list with relative share and trend. Needs: native item (exists). |
| `watchlist` | atoms | later | 0.3.0 | — | Tracked-symbol list with price and change; finance domain. Needs: native item, data-list (exist). |
| `world-clock-bar` | molecules | native-0.1.0 | — | molecules/world-clock-bar |  |

### Charts (15)

native-0.1.0 0 · web-only 1 · later 14

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `activity-heatmap` | organisms | later | 0.2.0 | — | Colour-scaled cell grid of activity over time. Needs: Views grid; react-native-svg optional. |
| `candlestick-chart` | organisms | later | 0.3.0 | — | OHLC price chart for finance dashboards. Needs: react-native-svg. |
| `chart` | organisms | later | 0.2.0 | — | Directory holds area-chart, bar-chart and line-chart (there is no chart.tsx). Needs: react-native-svg. react-native-svg arrives with 0.2.0; 0.1.0 adds no vector dependency (Icon takes a component the consumer supplies). |
| `contribution-graph` | organisms | later | 0.2.0 | — | Calendar heatmap of daily activity. Needs: Views grid; react-native-svg optional. |
| `flow-diagram` | organisms | web-only | — | — | Built on @xyflow/react, a DOM/SVG node-graph library with no React Native port. |
| `gantt-chart` | organisms | later | 0.3.0 | — | Project timeline with task bars, milestones and a today marker. Needs: horizontal ScrollView, Views. |
| `gauge-chart` | atoms | later | 0.2.0 | — | Semicircular gauge. Needs: react-native-svg. |
| `market-treemap` | organisms | later | 0.3.0 | — | Weighted sector tiles with signed performance colours. Needs: Views (flex layout). |
| `metric-gauge` | molecules | later | 0.2.0 | — | Arc and dial for monitored percentages. Needs: react-native-svg. |
| `pie-chart` | organisms | later | 0.2.0 | — | Pie and donut chart. Needs: react-native-svg. |
| `radar-chart` | organisms | later | 0.2.0 | — | Spider chart on shared axes. Needs: react-native-svg. |
| `run-timeline` | organisms | later | 0.3.0 | — | Multi-lane execution timeline with an optional cursor. Needs: horizontal ScrollView, Views. |
| `sankey-chart` | organisms | later | 0.3.0 | — | Weighted flow diagram; niche. Needs: react-native-svg. |
| `sparkline-grid` | atoms | later | 0.2.0 | — | KPI tiles with compact trend lines. Needs: react-native-svg. |
| `threshold-ring` | atoms | later | 0.2.0 | — | Ring gauge showing distance to a threshold. Needs: react-native-svg. |

### Maps (8)

native-0.1.0 0 · web-only 0 · later 8

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `choropleth-map` | organisms | later | 0.2.0 | — | Region polygons shaded by value with legend and a data-table fallback. Needs: react-native-svg, map-2d. |
| `geography-quiz-map` | organisms | later | 0.4.0 | — | Identify-the-region map quiz. Needs: react-native-svg, map-2d. |
| `globe-3d` | organisms | later | 0.4.0 | — | Pseudo-3D orthographic globe with drag, markers and arcs. Needs: react-native-svg, map-2d. |
| `heat-map-overlay` | organisms | later | 0.3.0 | — | Radial-gradient heat blobs over a map. Needs: react-native-svg, map-2d. |
| `map-2d` | organisms | later | 0.2.0 | — | SVG map primitive with equirectangular projection, markers, GeoJSON layers and zoom controls. Needs: react-native-svg. |
| `map-timeline` | organisms | later | 0.4.0 | — | Map with a time slider that reveals era polygons and events. Needs: react-native-svg, map-2d. |
| `route-map` | organisms | later | 0.4.0 | — | Animated route paths and waypoints on a map. Needs: react-native-svg, map-2d. |
| `story-map` | organisms | later | 0.4.0 | — | Scroll-driven narrative map; uses IntersectionObserver on web. Needs: react-native-svg, map-2d. |

### Canvas (37)

native-0.1.0 0 · web-only 37 · later 0

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `alert-pulse` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `anchor-port` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `bottom-activity-strip` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `canvas-shell` | templates | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `canvas-view` | organisms | web-only | — | — | Pan and zoom viewport with keyboard, wheel and overlay support; anchors the canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `chat-dock-section` | molecules | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `comment-pin` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `connector-edge` | molecules | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `context-lens` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `edge-label` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `follow-mode` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `group-hull` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `handoff-beacon` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `heat-overlay` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `infinite-plane` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `left-rail` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `live-cursor` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `mini-map-panel` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `multi-select-lasso` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `object-card` | molecules | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `object-handle` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `object-inspector` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `playback-ghost` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `policy-delivery-panel` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `property-section` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `relationship-inspector` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `right-dock` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `routing-assignment-panel` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `runtime-overview-panel` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `selection-halo` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `selection-presence` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `snap-guides` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `state-badge-overlay` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `thread-bubble` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `viewport-bookmarks` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `world-breadcrumbs` | atoms | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |
| `zoom-hud` | molecules | web-only | — | — | Canvas workspace family. Pointer-first canvas: web-only for 0.1.0, revisit with spatial. |

### Motion (31)

native-0.1.0 13 · web-only 17 · later 1

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `animated-beam` | atoms | web-only | — | — | Decorative SVG gradient path linking two DOM elements by their bounding boxes. |
| `animated-grid-pattern` | atoms | web-only | — | — | Decorative animated grid background. |
| `animated-list` | atoms | native-0.1.0 | — | atoms/animated-list |  |
| `animated-text` | atoms | native-0.1.0 | — | atoms/animated-text |  |
| `blur-reveal` | atoms | native-0.1.0 | — | atoms/blur-reveal |  |
| `border-beam` | atoms | web-only | — | — | Decorative animated border accent. |
| `card-flip` | atoms | later | 0.3.0 | — | 3D flip between two faces; rotateY with backfaceVisibility works on native. |
| `cursor` | atoms | web-only | — | — | Custom pointer-follower cursor; touch has no cursor. |
| `dot-pattern` | atoms | web-only | — | — | Decorative dotted background. |
| `liquid-glass` | atoms | web-only | — | — | Decorative liquid gradient sheen using CSS backdrop effects. |
| `magnetic` | atoms | web-only | — | — | Pulls content toward the pointer; touch has no pointer proximity. |
| `magnetic-button` | atoms | web-only | — | `button` | Button that drifts toward the pointer; touch has no pointer proximity. |
| `marquee` | atoms | native-0.1.0 | — | atoms/marquee |  |
| `meteors` | atoms | web-only | — | — | Decorative falling-streak background. |
| `number-ticker` | atoms | native-0.1.0 | — | atoms/number-ticker |  |
| `particles` | atoms | web-only | — | — | Decorative floating particle field. |
| `progressive-blur` | atoms | web-only | — | — | CSS backdrop-filter blur with a gradient mask. |
| `reveal-text` | atoms | native-0.1.0 | — | atoms/reveal-text |  |
| `scramble-text` | atoms | native-0.1.0 | — | atoms/scramble-text |  |
| `shimmer-button` | atoms | web-only | — | `button` | Marketing button with a sweeping sheen. |
| `shimmer-text` | atoms | native-0.1.0 | — | atoms/shimmer-text |  |
| `shine-border` | atoms | web-only | — | — | Decorative animated gradient border. |
| `shiny-button` | atoms | web-only | — | `button` | Marketing button with a looping glossy sheen. |
| `sparkles` | atoms | web-only | — | — | Decorative twinkling sparkles. |
| `spinning-text` | atoms | native-0.1.0 | — | atoms/spinning-text |  |
| `spotlight-card` | atoms | web-only | — | `card` | Radial spotlight that follows the pointer. |
| `text-animate` | atoms | native-0.1.0 | — | atoms/text-animate |  |
| `text-reveal` | atoms | native-0.1.0 | — | atoms/text-reveal |  |
| `text-shimmer` | atoms | native-0.1.0 | — | atoms/text-shimmer |  |
| `tilt-card` | atoms | web-only | — | `card` | 3D tilt toward the pointer. |
| `typewriter` | atoms | native-0.1.0 | — | atoms/typewriter |  |

### Theme (4)

native-0.1.0 0 · web-only 4 · later 0

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `lang-provider` | atoms | web-only | — | — | Language context bound to next/navigation routes; native apps use app-level i18n. |
| `theme-preset-provider` | atoms | web-only | — | `ThemeProvider` | Persists web theme presets and injects a no-flash script; native ThemeProvider takes colorScheme and override. |
| `theme-provider` | atoms | web-only | — | `ThemeProvider` | next-themes provider for CSS-variable theming; native has its own ThemeProvider. |
| `theme-switcher` | atoms | web-only | — | `ThemeProvider` | Swatch row for web CSS theme presets kept in sync across the page. |

### Utility (6)

native-0.1.0 0 · web-only 2 · later 4

| Component | Web | Status | Target | Native / equivalent | Reason and needs |
| --- | --- | --- | --- | --- | --- |
| `glass-card` | atoms | later | 0.5.0 | — | Frosted card surface; follows glass-panel. Needs: depth tokens from ui-core (planned for @vllnt/ui 0.5.0). |
| `glass-panel` | atoms | later | 0.5.0 | — | Frosted surface for floating chrome; waits for the depth tokens. Needs: depth tokens from ui-core (planned for @vllnt/ui 0.5.0). |
| `qr-code` | atoms | later | 0.3.0 | — | QR code from a string. Needs: react-native-svg, qrcode (pure JS). |
| `table-of-contents` | atoms | web-only | — | — | Builds its list from the page's DOM headings. |
| `table-of-contents-panel` | atoms | web-only | — | — | Side panel over the DOM-heading table of contents. |
| `theme-toggle` | molecules | later | 0.2.0 | — | Light/dark toggle; native would drive ThemeProvider colorScheme. Needs: ThemeProvider (exists). |

## Open decisions

None.
