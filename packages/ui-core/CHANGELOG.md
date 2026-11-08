# Changelog

All notable changes to `@vllnt/ui-core` are documented in this file.

## [Unreleased]

### Added

- `productThemes`: the Maia and PaaS themes (colors per mode, fonts, type
  scale, radius, default mode), generated from `packages/design/tokens.json`.
- `tamaguiTokens` and `tamaguiThemes`: plain objects in the shape Tamagui takes
  for `createTokens` and `createTamagui({ themes })`, with themes keyed
  `<theme>_<mode>`. No Tamagui dependency.
- Core tokens `success`, `warning`, `info` (with foregrounds), `diffAdded`,
  `diffRemoved`, spacing `5` and `10`, radius `xl`, and a `label` type step.

## [0.1.0] - Unreleased

### Added

- Initial platform-neutral token, theme, platform metadata, and portable component contracts.

### Changed

- README documents the install command.

### Fixed

- `createNativeTheme` keeps the default token when an override value is `undefined` instead of erasing it, and reports `colorScheme: "light"` for any scheme other than `"dark"` instead of echoing an invalid value.
