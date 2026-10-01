# Changelog

All notable changes to `@vllnt/ui-native` are documented in this file.

## [Unreleased]

### Added

- Experimental source-only React Native renderer with 171 component modules spanning foundation, forms, data, content, AI, learning, motion, utilities, controls, overlays, and navigation.
- Shared light, dark, and system theme support generated from canonical design tokens.
- Controlled/uncontrolled state, caller-owned selection, reduced-motion observation, native modal layering, safe-area injection, and typed platform-service adapters.
- Machine-readable availability, compatibility, source, peer dependency, and installation metadata in `registry.json`.
- Generated barrel/manifest drift checks, native boundary checks, Jest interaction coverage, and packed-package validation.

### Changed

- Screen-reader parity for VoiceOver and TalkBack (#535): semantics VoiceOver ignored on non-focusable Views moved onto focusable elements, visible headers, or item hints; state changes announced on iOS as well as through Android live regions (announcements queued in one tick are spoken once); decorative content hidden on both platforms; touch targets of at least 44 points; fixed boxes and input heights follow the font scale; new optional `labels` fields and props carry the screen-reader text, with the previous English as defaults.
- `OverviewBoard`/`OverviewCard` metrics and the `StatCard` value are no longer always live regions; pass `announceChanges` to have value changes announced.
- Single `ToggleGroup` items stay toggle buttons with `checked`; the group label (`accessibilityLabel`) of `RadioGroup`, `ToggleGroup`, `Toolbar`, `ButtonGroup`, `FilterBar`, and `Fieldset` is spoken as each control's hint, and a disabled `Fieldset` disables the package controls inside it.
- `Toast` expiry takes ten times longer while a screen reader runs; `Marquee` stops while a screen reader runs and accepts `paused`.

### Fixed

- `Calendar` and `RangeCalendar` keep years 0–99 instead of remapping them to 1900–1999.
- `ScrollProgress`, `TextReveal`, `TutorialComplete`, `Stepper`, and `AvatarGroup` map `NaN` numeric inputs to a safe value (empty progress, first step, or no avatar limit) instead of rendering `NaN` values or styles; `±Infinity` still clamps to the range bounds.
- `StatCard` renders numeric `0` for `change`, `meta`, and `description` while still omitting `undefined`, `null`, and `NaN`.
- `CollapsibleContent` sets `aria-labelledby` only while a `CollapsibleTrigger` is mounted, and the trigger sets `aria-controls` only while content is mounted, so neither points at a missing node.
- `AvatarImage` now unmounts after a load failure so the fallback shows, as documented, and mounts again when `source` changes to a different value.
- Uncontrolled `SidebarProvider` and `ToggleGroup` apply repeated updates made before a re-render from the latest value instead of dropping one; controlled mode still derives each change from the owner value.
- `Typewriter` and `ScrambleText` step, time, and sample scramble characters by Unicode code point, so emoji and other surrogate pairs are never split.
- `AnimatedText` no longer constructs `Intl.Segmenter` at module load, so importing it on engines without `Intl.Segmenter` (Hermes) no longer throws; it splits by grapheme when available and by code point otherwise.

### Availability

- No supported npm version is published. A manually bootstrapped pre-release (`0.1.0-canary.20260917105553.sha7466647a4ba5`) reserves the package names for `@vllnt/ui-core` and `@vllnt/ui-native`; it has no build provenance and npm's `latest` tag points at it. The renderer remains `availability: "source"` with `installation.available: false` until synchronized canary publication and device/accessibility gates pass.
