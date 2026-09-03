# VLLNT UI native catalog

Private Expo consumer for the experimental `@vllnt/ui-native` package. It exercises every pilot component, semantic variant, light/dark/system theme selection, and interaction in one scrollable screen.

```bash
pnpm -F @vllnt/ui-native-catalog dev
pnpm -F @vllnt/ui-native-catalog build
```

The build exports Android and iOS JavaScript bundles in CI. This checks Metro workspace resolution without publishing or requiring a simulator. Real-device validation remains required before a stable native release.
