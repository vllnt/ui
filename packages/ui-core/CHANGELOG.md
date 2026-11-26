# Changelog

All notable changes to `@vllnt/ui-core` are documented in this file.

## [Unreleased]

### Added

- `nativeTokens.glass`: the glass material per color scheme, generated from
  `packages/design/tokens.json`. It holds the tint steps, hairline,
  `mutedForeground`, `input` and `foreground` text roles, blur radii and the
  `glass` and `glassFloating` shadows as React Native shadow props with an
  Android `elevation`. `glass.solid` is the same surface with glass off
  (opaque Card color, no blur). `NativeTheme` carries it as `theme.glass`, and
  `NativeGlassTokens` and `NativeShadow` are exported.

## [0.1.0] - 2026-11-20

### Added

- Initial platform-neutral token, theme, platform metadata, and portable component contracts.

- `productThemes`: the Maia and PaaS themes (colors per mode, fonts, type
  scale, radius, default mode), generated from `packages/design/tokens.json`.
- `tamaguiTokens` and `tamaguiThemes`: plain objects in the shape Tamagui takes
  for `createTokens` and `createTamagui({ themes })`, with themes keyed
  `<theme>_<mode>`. No Tamagui dependency.
- Core tokens `success`, `warning`, `info` (with foregrounds), `diffAdded`,
  `diffRemoved`, spacing `5` and `10`, radius `xl`, and a `label` type step.

### Changed

- README documents the install command.

- Core type weights follow the Penpot library: `fontWeight.caption` is 400
  (was 500) and `fontWeight.label` is 500 (was 600), in `designTokens`,
  `nativeTokens`, `tamaguiTokens` and the PaaS product theme, which uses the
  core weights. The Maia theme keeps its own 500 and 600.

- The PaaS product theme's dark `card`, `popover` and `muted` are now
  `#000000` (`productThemes.paas` and `tamaguiThemes.paas_dark`), following
  the web's pure-black dark surfaces. `nativeTokens` and `tamaguiTokens` keep
  their dark values (`#050505` page, `#0a0a0a` card and popover, `#262626`
  muted).

### Fixed

- `createNativeTheme` keeps the default token when an override value is `undefined` instead of erasing it, and reports `colorScheme: "light"` for any scheme other than `"dark"` instead of echoing an invalid value.
