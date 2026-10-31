# Changelog

All notable changes to `@vllnt/ui-core` are documented in this file.

## [Unreleased]

### Added

- Initial platform-neutral token, theme, platform metadata, and portable component contracts.

### Fixed

- `createNativeTheme` keeps the default token when an override value is `undefined` instead of erasing it, and reports `colorScheme: "light"` for any scheme other than `"dark"` instead of echoing an invalid value.
