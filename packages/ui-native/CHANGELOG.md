# Changelog

All notable changes to `@vllnt/ui-native` are documented in this file.

## [Unreleased]

### Added

- Experimental source-only React Native renderer with 171 component modules spanning foundation, forms, data, content, AI, learning, motion, utilities, controls, overlays, and navigation.
- Shared light, dark, and system theme support generated from canonical design tokens.
- Controlled/uncontrolled state, caller-owned selection, reduced-motion observation, native modal layering, safe-area injection, and typed platform-service adapters.
- Machine-readable availability, compatibility, source, peer dependency, and installation metadata in `registry.json`.
- Generated barrel/manifest drift checks, native boundary checks, Jest interaction coverage, and packed-package validation.

### Fixed

- `Calendar` and `RangeCalendar` keep years 0–99 instead of remapping them to 1900–1999.
- `ScrollProgress`, `TextReveal`, `TutorialComplete`, `Stepper`, and `AvatarGroup` map `NaN` numeric inputs to a safe value (empty progress, first step, or no avatar limit) instead of rendering `NaN` values or styles; `±Infinity` still clamps to the range bounds.
- `StatCard` renders numeric `0` for `change`, `meta`, and `description` while still omitting `undefined` and `null`.

### Availability

- No npm version is published. The renderer remains `availability: "source"` with `installation.available: false` until synchronized canary publication and device/accessibility gates pass.
