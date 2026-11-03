# Changelog

All notable changes to `@vllnt/ui-core` are documented in this file.

## [Unreleased]

## [0.1.0] - Unreleased

### Added

- Initial platform-neutral token, theme, platform metadata, and portable component contracts.

### Changed

- README documents the install command.

### Fixed

- `createNativeTheme` keeps the default token when an override value is `undefined` instead of erasing it, and reports `colorScheme: "light"` for any scheme other than `"dark"` instead of echoing an invalid value.
