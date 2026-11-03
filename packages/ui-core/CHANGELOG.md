# Changelog

All notable changes to `@vllnt/ui-core` are documented in this file.

## [Unreleased]

### Added

- Initial platform-neutral token, theme, platform metadata, and portable component contracts.

### Changed

- README describes the install as `pnpm add @vllnt/ui-core@canary`. Core publishes to the `canary` dist-tag only, together with `@vllnt/ui-native`, and has no stable channel yet.

### Fixed

- `createNativeTheme` keeps the default token when an override value is `undefined` instead of erasing it, and reports `colorScheme: "light"` for any scheme other than `"dark"` instead of echoing an invalid value.
