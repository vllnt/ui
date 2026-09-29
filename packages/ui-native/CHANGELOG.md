# Changelog

All notable changes to `@vllnt/ui-native` are documented in this file.

## [Unreleased]

### Added

- Experimental source-only React Native renderer with 171 component modules spanning foundation, forms, data, content, AI, learning, motion, utilities, controls, overlays, and navigation.
- Shared light, dark, and system theme support generated from canonical design tokens.
- Controlled/uncontrolled state, caller-owned selection, reduced-motion observation, native modal layering, safe-area injection, and typed platform-service adapters.
- Machine-readable availability, compatibility, source, peer dependency, and installation metadata in `registry.json`.
- Generated barrel/manifest drift checks, native boundary checks, Jest interaction coverage, and packed-package validation.

### Availability

- No supported npm version is published. A manually bootstrapped pre-release (`0.1.0-canary.20260917105553.sha7466647a4ba5`) reserves the package names for `@vllnt/ui-core` and `@vllnt/ui-native`; it has no build provenance and npm's `latest` tag points at it. The renderer remains `availability: "source"` with `installation.available: false` until synchronized canary publication and device/accessibility gates pass.
