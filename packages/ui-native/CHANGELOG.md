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

- Uncontrolled `SidebarProvider` and `ToggleGroup` apply repeated updates made before a re-render from the latest value instead of dropping one; controlled mode still derives each change from the owner value.
- `Typewriter` and `ScrambleText` step, time, and sample scramble characters by Unicode code point, so emoji and other surrogate pairs are never split.
- `AnimatedText` no longer constructs `Intl.Segmenter` at module load, so importing it on engines without `Intl.Segmenter` (Hermes) no longer throws; it splits by grapheme when available and by code point otherwise.

### Availability

- No npm version is published. The renderer remains `availability: "source"` with `installation.available: false` until synchronized canary publication and device/accessibility gates pass.
