# Changelog

All notable changes to `@vllnt/ui-native` are documented in this file.

## [Unreleased]

### Added

- Experimental source-only React Native renderer with 171 component modules spanning foundation, forms, data, content, AI, learning, motion, utilities, controls, overlays, and navigation.
- Shared light, dark, and system theme support generated from canonical design tokens.
- Controlled/uncontrolled state, caller-owned selection, reduced-motion observation, native modal layering, safe-area injection, and typed platform-service adapters.
- Machine-readable availability, compatibility, source, peer dependency, and installation metadata in `registry.json`.
- Generated barrel/manifest drift checks, native boundary checks, Jest interaction coverage, and packed-package validation.
- Jest render tests cover the compound parts that no test rendered before (`AgentStepDuration`, `AIArtifactEditButton`, `ConversationHeader`, `ConversationScrollButton`, `ConversationTitle`, `ProgressTrackerBadge`, `ProgressTrackerStat`, `ProgressTrackerStats`, `SimpleTerminal`).

- Props the web components already had, added to the native components with the same names and value sets:
  - `size` (`"default" | "lg" | "sm"`) on `Toggle`, `ToggleGroup` (also per `ToggleGroupItem`), and `SegmentedControl`; `variant` (`"default" | "outline"`) on `ToggleGroup` (also per `ToggleGroupItem`). Targets keep the 44-point minimum, so `sm` tightens the padding and `lg` is 48 points tall.
  - `size` (`"lg" | "md" | "sm"`) on `Rating`. The default stays `lg`, the size native ratings always rendered; web defaults to `md`.
  - `disabled` on `Textarea`, `DateField`, `TimeField`, and `InputOTP` (their runtime already followed `Input`; `InputOTP` now locks the field), and on `Collapsible`, which disables its trigger.
  - `onComplete` on `InputOTP`, called once with the code when the last digit is entered.
  - Web names for props that native already had under another name; the native name wins when both are passed and stays supported: `orientation` on `ResizablePanelGroup` (`direction`), `onFlipChange` on `Flashcard` (`onFlippedChange`), and `expanded`, `defaultExpanded`, `onExpandedChange`, `selected`, `defaultSelected`, `onSelect` on `TreeView` (`expandedIds`, `defaultExpandedIds`, `onExpandedIdsChange`, `selectedIds`, `defaultSelectedIds`, `onSelectedIdsChange`).

### Changed

- Components are organised by Atomic Design level under `src/components/{atoms,molecules,organisms}/<name>/` (#535): 105 atoms, 58 molecules, and 8 organisms. `pnpm check:atomic` enforces the levels, and `src/primitives` and `src/theme` may not import components. Public exports are unchanged. Each component's `source` in `registry.json`, published as `native.source` by the registry, now includes the level (for example `src/components/atoms/button/button.tsx`).
- Screen-reader parity for VoiceOver and TalkBack (#535): semantics VoiceOver ignored on non-focusable Views moved onto focusable elements, visible headers, or item hints; state changes announced on iOS as well as through Android live regions (announcements queued in one tick are spoken once); decorative content hidden on both platforms; touch targets of at least 44 points; fixed boxes and input heights follow the font scale; new optional `labels` fields and props carry the screen-reader text, with the previous English as defaults.
- `OverviewBoard`/`OverviewCard` metrics and the `StatCard` value are no longer always live regions; pass `announceChanges` to have value changes announced.
- Single `ToggleGroup` items stay toggle buttons with `checked`; the group label (`accessibilityLabel`) of `RadioGroup`, `ToggleGroup`, `Toolbar`, `ButtonGroup`, `FilterBar`, and `Fieldset` is spoken as each control's hint, and `DataList`'s `accessibilityLabel` as its first row's hint.
- A disabled `Fieldset` disables the package form controls inside it: `Button`, `Input` and the inputs built on it, `ToolbarButton`, `Checkbox`, `CheckboxGroup`, `Switch`, `RadioGroup`, `Toggle`, `ToggleGroup`, `SegmentedControl`/`CategoryFilter`, `ListBox`, `ColorPicker`, `TagGroup`, `TagsInput`, `InputOTP`, `NumberInput`, `PasswordInput`, `SearchField`, `PhoneInput`, `Slider`, `Rating` (read-only), `Select`/`NativeSelect`, `MultiSelect`, `Combobox`, `TimePicker`, `Calendar`, `DatePicker`, `DateRangePicker`, `FileUpload`, `PromptInput`, `AIChatInput`, `Stepper`, `CopyButton`, `FormSubmit`, and `Label` styling.
- Screen-reader announcements made by the components are now asynchronous: messages are queued and spoken once per tick (one microtask later). Tests that assert `AccessibilityInfo.announceForAccessibility` calls must flush pending promises first (for example `await act(async () => {})`).
- `Toast` expiry takes ten times longer while a screen reader runs; `Marquee` stops while a screen reader runs and accepts `paused`.
- The `react` peer range is now `>=19.1.0 <20` and `minimumReact` in `registry.json` is `19.1.0`. Every `react-native` release in the `>=0.81.0 <1` peer range already requires React 19.1 or newer, so React 19.0 could never satisfy both peers. The `react-native` range is unchanged.
- README and docs describe the install as `pnpm add @vllnt/ui-native@canary` (canary dist-tag only, no stable channel yet, install not yet available) and list Android/iOS Metro export as a CI check rather than a remaining gate.
- The accessibility fixtures in `src/tests` no longer import Testing Library, so the private Expo catalog can render one example of every component in its All components view. Test-only change: nothing in the published package changes.

### Fixed

- `Slider` falls back to a 0-100 range and a step of one when `min`, `max`, or `step` is `NaN`, infinite, or non-positive, and uses the lower bound for a `NaN` value, instead of rendering `NaN` track styles and accessibility values.
- `InputOTP` falls back to six digits when `length` is `NaN`, infinite, zero, or negative (it previously accepted no input) and uses the whole part of a fractional length.
- `PresenceStack` shows every user when `max` is `NaN`, matching `AvatarGroup`, instead of hiding all of them.
- `Calendar` and `RangeCalendar` keep years 0–99 instead of remapping them to 1900–1999.
- `ScrollProgress`, `TextReveal`, `TutorialComplete`, `Stepper`, and `AvatarGroup` map `NaN` numeric inputs to a safe value (empty progress, first step, or no avatar limit) instead of rendering `NaN` values or styles; `±Infinity` still clamps to the range bounds.
- `StatCard` renders numeric `0` for `change`, `meta`, and `description` while still omitting `undefined`, `null`, and `NaN`.
- `CollapsibleContent` sets `aria-labelledby` only while a `CollapsibleTrigger` is mounted, and the trigger sets `aria-controls` only while content is mounted, so neither points at a missing node.
- `AvatarImage` no longer spreads `StyleSheet.absoluteFill`, which `react-native` 0.81 types as a registered style number rather than an object, so the source typechecks against the whole `>=0.81.0 <1` peer range. The runtime style is unchanged (absolute, zero insets).
- `AvatarImage` now unmounts after a load failure so the fallback shows, as documented, and mounts again when `source` changes to a different value.
- Uncontrolled `SidebarProvider` and `ToggleGroup` apply repeated updates made before a re-render from the latest value instead of dropping one; controlled mode still derives each change from the owner value.
- `Typewriter` and `ScrambleText` step, time, and sample scramble characters by Unicode code point, so emoji and other surrogate pairs are never split.
- `AnimatedText` no longer constructs `Intl.Segmenter` at module load, so importing it on engines without `Intl.Segmenter` (Hermes) no longer throws; it splits by grapheme when available and by code point otherwise.

### Availability

- No supported npm version is published. A manually bootstrapped pre-release (`0.1.0-canary.20260917105553.sha7466647a4ba5`) reserves the package names for `@vllnt/ui-core` and `@vllnt/ui-native`; it has no build provenance and npm's `latest` tag points at it. The renderer remains `availability: "source"` with `installation.available: false` until synchronized canary publication and device/accessibility gates pass.
