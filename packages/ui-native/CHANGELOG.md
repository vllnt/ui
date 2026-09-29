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

- `CollapsibleContent` sets `aria-labelledby` only while a `CollapsibleTrigger` is mounted, and the trigger sets `aria-controls` only while content is mounted, so neither points at a missing node.
- `AvatarImage` now unmounts after a load failure so the fallback shows, as documented, and mounts again when `source` changes to a different value.

### Availability

- No npm version is published. The renderer remains `availability: "source"` with `installation.available: false` until synchronized canary publication and device/accessibility gates pass.
